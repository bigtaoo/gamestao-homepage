/**
 * Generates the brand marks and stand-in artwork for any game asset that has
 * not been supplied yet, then writes them into `public/assets/`.
 *
 * Run on demand, never as part of `npm run build` — the output is committed, so
 * a CI build (where system fonts differ and SVG text would render differently)
 * never regenerates it:
 *
 *   npm run build:ssr                                  # the game table is read from it
 *   node scripts/placeholders.mjs                      # only fills in what is missing
 *   node scripts/placeholders.mjs --regenerate cover,og
 *   node scripts/placeholders.mjs --regenerate all
 *
 * Regeneration is per kind (icon, cover, shot, og, brand) and never implicit.
 * A blanket --force would happily replace an icon imported from a game's real
 * store art with a generated stand-in, which is the file you least want a
 * helper script to be casual about.
 *
 * The stand-ins are deliberately branded rather than grey boxes: if the site
 * ships before real screenshots exist, it reads as a considered placeholder
 * instead of a broken image. Where a game has a real icon, the generated cover
 * and social card are built around it, so only the screenshots still look
 * provisional.
 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  ICON_PX,
  isReal,
  measure,
  readGames,
  readProvenance,
  readSizes,
  writeSizes,
} from './lib/asset-sizes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'public', 'assets');
const KINDS = ['icon', 'cover', 'shot', 'og', 'brand'];

/** Which kinds an explicit --regenerate asked for; empty means fill gaps only. */
const REGENERATE = (() => {
  const flag = process.argv.indexOf('--regenerate');
  if (flag === -1) return new Set();

  const value = process.argv[flag + 1];
  if (!value) {
    throw new Error('--regenerate needs a value: "all", or a comma list of: ' + KINDS.join(', '));
  }
  if (value === 'all') return new Set(KINDS);

  const asked = value.split(',').map((kind) => kind.trim());
  for (const kind of asked) {
    if (!KINDS.includes(kind)) {
      throw new Error('unknown kind "' + kind + '" — pick from: ' + KINDS.join(', '));
    }
  }
  return new Set(asked);
})();

const BG = '#0b0e14';
const BG_DEEP = '#070a0f';
const TEXT = '#e9edf5';
/**
 * The mark is drawn in the site's own text colour, not a colour of its own.
 *
 * It was a warm off-white (#ece7dc) first, left over from an earlier concept
 * built around paper and ink. When that concept was dropped the colour should
 * have gone with it: against the cool near-black of this site, and beside a
 * wordmark set in #e9edf5, the beige read as a grubby version of white rather
 * than as a decision. Sharing the text colour also makes mark and wordmark one
 * object instead of two things that nearly match.
 *
 * Pure white was the other candidate. It works, but it makes the studio mark
 * the brightest thing in a row that also contains three game icons, and the
 * studio is the one element there that should not be shouting.
 */
const MARK_FG = TEXT;
const MARK_FG_DARK = '#12161f';
const MUTED = '#8593ad';
const FONT =
  "'Segoe UI', ui-sans-serif, system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif";

const GAMES = await readGames();

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/** A faint square grid, so a large flat panel still has some texture. */
function grid(width, height, step, opacity) {
  const lines = [];
  for (let x = step; x < width; x += step) lines.push(`M${x} 0V${height}`);
  for (let y = step; y < height; y += step) lines.push(`M0 ${y}H${width}`);
  return `<path d="${lines.join('')}" stroke="#ffffff" stroke-opacity="${opacity}" stroke-width="1" fill="none"/>`;
}

/**
 * The dark panel every stand-in is built on. `iconBox` reserves vertical room
 * for a composited icon and pushes the text below it.
 */
function panel({ width, height, accent, title, subtitle, note, titleSize, iconBox }) {
  const size = titleSize ?? Math.round(Math.min(width, height) * 0.12);
  const subSize = Math.round(size * 0.32);
  const cx = width / 2;
  const titleY = iconBox ? iconBox.y + iconBox.size + size * 0.95 : height / 2;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="30%" cy="22%" r="78%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="${BG_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#floor)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  ${grid(width, height, Math.round(Math.min(width, height) / 14), 0.045)}
  <rect x="0" y="0" width="${width}" height="${Math.max(3, Math.round(height * 0.008))}" fill="${accent}"/>
  <text x="${cx}" y="${titleY}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="700" fill="${TEXT}" letter-spacing="${-size * 0.03}">${title}</text>
  ${
    subtitle
      ? `<text x="${cx}" y="${titleY + size * 0.85}" text-anchor="middle" font-family="${FONT}" font-size="${subSize}" font-weight="600" fill="${accent}" letter-spacing="${subSize * 0.12}">${subtitle.toUpperCase()}</text>`
      : ''
  }
  ${
    note
      ? `<text x="${cx}" y="${height - subSize * 1.4}" text-anchor="middle" font-family="${FONT}" font-size="${subSize * 0.85}" font-weight="500" fill="${MUTED}">${note}</text>`
      : ''
  }
</svg>`);
}

/**
 * The studio mark: one brush dot — a dense head with a tail whipped off it.
 *
 * Constructed, not drawn. A curved spine runs from the tail's tip to the
 * head's centre; each side of it gets its own width profile; the head is the
 * round cap that closes them. What the shape is trying to be is the moment a
 * loaded brush is set down and lifted away.
 *
 * WEIGHT, which took several tries to locate, is not size and not bulk. A
 * large dot is just large; a uniformly fat one reads as a balloon, which is
 * the opposite of heavy. It is CONTRAST: nearly all the ink packed into the
 * head, reached by a tail that stays a fraction of its width. `taper` is what
 * buys that — at 1.7 the tail is still under a third of the head's width at
 * the halfway point.
 *
 * LIFE is in the spine. A straight spine gives a tapered wedge, which is inert
 * however fine you make it; the curve is what makes the tail read as thrown
 * rather than merely narrow.
 *
 * The two tapers are the last piece. The inner edge is fine and late (`taper`)
 * and the outer edge is early and full (`taperFar`), so the outer one sweeps
 * out in a single convex arc from the tip into the head instead of running
 * straight in. Giving each edge its own profile, rather than adding a bulge on
 * top of a shared one, is what keeps that arc clean: both reach the head's
 * radius with zero slope at the end, so each meets the cap without a corner
 * and neither has to come back in. A bulge does have to come back in, and that
 * return shows up as a waist above the head.
 */
const SPINE = [
  [16, 12],
  [28, 18],
  [35, 30],
  [42, 43],
];
const MARK = { spine: SPINE, head: 13, taper: 1.7, taperFar: 1, pad: 5 };

/**
 * The favicon's master, which is the same drawing with more of the tile.
 *
 * It used to be a different drawing. A finer tail (`taper` 3) made a better
 * mark at size but could not survive 16px — most of its length fell under one
 * pixel and it rendered as a grey smudge trailing off the head — so the small
 * master traded the contrast away for legibility. Then the fatter tail turned
 * out to be the better mark at every size, which retired the trade and left
 * only the padding: the tab already frames the icon, so the mark can have more
 * of the square there than it can sitting beside a wordmark.
 */
const MARK_SMALL = { ...MARK, pad: 4 };

const bezier = (P, t) => {
  const u = 1 - t;
  return [0, 1].map(
    (i) => u ** 3 * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t ** 3 * P[3][i],
  );
};

const tangent = (P, t) => {
  const u = 1 - t;
  const v = [0, 1].map(
    (i) =>
      3 * u * u * (P[1][i] - P[0][i]) +
      6 * u * t * (P[2][i] - P[1][i]) +
      3 * t * t * (P[3][i] - P[2][i]),
  );
  const n = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / n, v[1] / n];
};

/** Smoothstep. Flat at both ends, which is what the width profiles need. */
const smooth = (u) => u * u * (3 - 2 * u);

/**
 * The mark's outline as points.
 *
 * 24 samples an edge. Measured against a 400-sample outline rasterised at
 * 512px, that is within 0.08% of inked area on both masters — well under a
 * pixel at the largest size anything here emits.
 */
function markOutline({ spine, head, taper, taperFar }, steps = 24) {
  // Zero value and zero slope at both ends: the tail keeps a true point, and
  // both edges arrive at the head running parallel to the spine, which is the
  // direction the cap leaves in.
  const width = (t, k) => head * smooth(t ** k);

  const inner = [];
  const outer = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const c = bezier(spine, t);
    const [dx, dy] = tangent(spine, t);
    const n = [-dy, dx];
    const a = width(t, taper);
    const b = width(t, taperFar);
    inner.push([c[0] + n[0] * a, c[1] + n[1] * a]);
    outer.push([c[0] - n[0] * b, c[1] - n[1] * b]);
  }

  // The head: the round cap that closes the two edges.
  const end = bezier(spine, 1);
  const [dx, dy] = tangent(spine, 1);
  const n = [-dy, dx];
  const cap = [];
  const ARC = steps * 2;
  for (let i = 1; i < ARC; i++) {
    const a = (Math.PI * i) / ARC;
    cap.push([
      end[0] + n[0] * Math.cos(a) * head + dx * Math.sin(a) * head,
      end[1] + n[1] * Math.cos(a) * head + dy * Math.sin(a) * head,
    ]);
  }

  const ring = [...inner, ...cap, ...outer.reverse()];
  // The points stacked at the tail's tip, where the edges meet, would
  // otherwise leave the smoothing interpolating through a pile of duplicates.
  return ring.filter((p, i) => {
    const q = ring[(i - 1 + ring.length) % ring.length];
    return Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.0005;
  });
}

/** Centres an outline in the 64-unit box at a given padding, keeping its proportions. */
function fitToBox(pts, pad) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const k = Math.min((64 - pad * 2) / (x1 - x0), (64 - pad * 2) / (y1 - y0));
  return pts.map(([x, y]) => [
    x * k + (64 - (x1 - x0) * k) / 2 - x0 * k,
    y * k + (64 - (y1 - y0) * k) / 2 - y0 * k,
  ]);
}

/**
 * The mark as one closed path, smoothed through the sampled outline with
 * Catmull-Rom converted to cubics. The construction above is the drawing; this
 * is only how it gets written down.
 */
function markShape(fill, geo = MARK) {
  const pts = fitToBox(markOutline(geo), geo.pad);
  const r = (v) => Number(v.toFixed(2));
  const n = pts.length;

  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]];
    d +=
      `C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)}` +
      ` ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)}` +
      ` ${r(p2[0])} ${r(p2[1])}`;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
}

/**
 * `bleed` fills the whole square behind the mark, for the icons iOS and
 * Android mask themselves; `rounded` rounds that background, for the favicon,
 * which nothing masks; `bare` leaves it transparent, for the mark on a surface
 * whose colour the page already owns.
 */
function brandMark(size, { background = 'rounded', fill = MARK_FG, geo = MARK } = {}) {
  const backdrop =
    background === 'bare'
      ? ''
      : `<rect width="64" height="64"${background === 'rounded' ? ' rx="14"' : ''} fill="${BG_DEEP}"/>`;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  ${backdrop}
  ${markShape(fill, geo)}
</svg>`,
  );
}

/** A stand-in game icon: the game's initial on its own accent. */
function iconStandIn(size, accent, letter) {
  const r = Math.round(size * 0.22);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="face" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="${BG_DEEP}"/>
  <rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" rx="${r * 0.85}" fill="url(#face)"/>
  <text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="${FONT}" font-size="${size * 0.52}" font-weight="800" fill="#070a0f" fill-opacity="0.75">${letter}</text>
</svg>`);
}

/** Rounds an icon's corners so it sits on a panel like an app tile. */
async function roundedIcon(buffer, size) {
  const radius = Math.round(size * 0.22);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`,
  );
  return sharp(buffer)
    .resize({ width: size, height: size, fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

let created = 0;
let skipped = 0;
const protectedKinds = new Set();
const sizes = await readSizes();
const provenance = await readProvenance();
const OVERWRITE_REAL = process.argv.includes('--overwrite-real');

async function emit(kind, file, produce, gameId) {
  const wanted = REGENERATE.has(kind);

  // Imported artwork is never replaced by a generated stand-in unless asked
  // for by name — a blanket --regenerate is not consent to lose real art.
  if (wanted && gameId && isReal(provenance, gameId, kind) && !OVERWRITE_REAL) {
    protectedKinds.add(`${gameId}/${kind}`);
    skipped += 1;
    return;
  }

  if (!wanted && (await exists(file))) {
    skipped += 1;
    return;
  }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, await produce());
  created += 1;
}

const webp = (svg) => sharp(svg).webp({ quality: 88 }).toBuffer();
const png = (svg) => sharp(svg).png({ compressionLevel: 9 }).toBuffer();

for (const game of GAMES) {
  const dir = path.join(ASSETS, 'games', game.id);
  const iconFile = path.join(dir, 'icon.webp');

  // The icon comes first: the cover and the social card are built around it
  // when there is one, so it has to be on disk before they are generated.
  await emit(
    'icon',
    iconFile,
    () => sharp(iconStandIn(ICON_PX, game.accent, game.name[0])).webp({ quality: 92 }).toBuffer(),
    game.id,
  );

  const iconArt = await roundedIcon(await readFile(iconFile), 360);

  async function composed({ width, height, subtitle, note, format }) {
    const iconSize = Math.round(height * 0.34);
    const iconBox = { size: iconSize, y: Math.round(height * 0.2) };
    const base = panel({
      width,
      height,
      accent: game.accent,
      title: game.name,
      subtitle,
      note,
      titleSize: Math.round(Math.min(width, height) * 0.1),
      iconBox,
    });

    const pipeline = sharp(base).composite([
      {
        input: await sharp(iconArt).resize(iconSize, iconSize).toBuffer(),
        top: iconBox.y,
        left: Math.round((width - iconSize) / 2),
      },
    ]);
    return format === 'png'
      ? pipeline.png({ compressionLevel: 9 }).toBuffer()
      : pipeline.webp({ quality: 88 }).toBuffer();
  }

  // Card and game-page hero art, at 2x the size it is displayed at.
  //
  // No icon composited in, unlike the social card below: both places that show
  // a cover also show the icon in its own slot beside it, so putting it in the
  // image too rendered the same tile twice on one card.
  await emit(
    'cover',
    path.join(dir, 'cover.webp'),
    () =>
      webp(
        panel({
          width: 1600,
          height: 1000,
          accent: game.accent,
          title: game.name,
          subtitle: game.genre,
        }),
      ),
    game.id,
  );

  // Portrait screenshots. These stay plainly provisional — an icon on a panel
  // must not be mistaken for a picture of the game.
  for (let n = 1; n <= game.screenshots; n += 1) {
    await emit(
      'shot',
      path.join(dir, `shot-${n}.webp`),
      () =>
        webp(
          panel({
            width: 720,
            height: 1280,
            accent: game.accent,
            title: game.name,
            subtitle: `Shot ${n}`,
            note: 'screenshot pending',
            titleSize: 74,
          }),
        ),
      game.id,
    );
  }

  // Every shot shares one aspect ratio, so shot-1 speaks for the gallery.
  sizes[game.id] = {
    cover: await measure(sharp, path.join(dir, 'cover.webp')),
    shot: await measure(sharp, path.join(dir, 'shot-1.webp')),
  };

  // Social card. This one DOES carry the icon: it travels alone into a chat
  // client or a search result with no card layout around it, so the icon is the
  // only thing identifying the game at a glance.
  //
  // PNG, not WebP: some crawlers and chat clients still will not render a WebP
  // og:image, and this is the one image whose whole job is to be rendered by
  // someone else's software.
  await emit(
    'og',
    path.join(dir, 'og.png'),
    () =>
      composed({
        width: 1200,
        height: 630,
        subtitle: null,
        note: 'gamestao.com',
        format: 'png',
      }),
    game.id,
  );
}

const brand = path.join(ASSETS, 'brand');

// The social card carries the mark itself rather than a game's accent colour:
// a studio card tinted Nivara blue read as a Nivara card.
await emit('brand', path.join(brand, 'og.png'), async () => {
  const width = 1200;
  const height = 630;
  const markSize = Math.round(height * 0.3);
  const iconBox = { size: markSize, y: Math.round(height * 0.19) };

  return sharp(
    panel({
      width,
      height,
      accent: MARK_FG,
      title: 'gamestao',
      subtitle: 'Independent game studio',
      note: 'Nivara  ·  DayDayUp  ·  SumQuest',
      iconBox,
    }),
  )
    .composite([
      {
        input: await sharp(brandMark(markSize, { background: 'bare' })).png().toBuffer(),
        top: iconBox.y,
        left: Math.round((width - markSize) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
});

// Full bleed: iOS and Android apply their own mask, and a rounded backdrop
// inside a masked icon shows as a dark ring around the shape.
await emit('brand', path.join(brand, 'icon-192.png'), () =>
  png(brandMark(192, { background: 'bleed' })),
);
await emit('brand', path.join(brand, 'icon-512.png'), () =>
  png(brandMark(512, { background: 'bleed' })),
);
// Rounded, because nothing rounds it for us. The old mark filled its whole
// tile and so carried its own corners; a stroke sitting in the middle of the
// square does not, and full bleed would put a hard-cornered black chip in the
// tab strip.
await emit('brand', path.join(brand, 'favicon.svg'), () =>
  brandMark(64, { background: 'rounded', geo: MARK_SMALL }),
);

// The mark on its own, both ways round. These are what the site's nav uses and
// what the press kit hands out — no baked-in backdrop, so they sit on whatever
// surface they land on.
await emit('brand', path.join(brand, 'mark.svg'), () =>
  brandMark(512, { background: 'bare' }),
);
await emit('brand', path.join(brand, 'mark-ink.svg'), () =>
  brandMark(512, { background: 'bare', fill: MARK_FG_DARK }),
);

await writeSizes(sizes);

if (protectedKinds.size > 0) {
  console.log(
    `kept real artwork despite --regenerate: ${[...protectedKinds].join(', ')}` +
      ' (pass --overwrite-real to replace it with stand-ins)',
  );
}

console.log(
  `assets: ${created} written, ${skipped} left alone` +
    (REGENERATE.size
      ? ` (regenerated: ${[...REGENERATE].join(', ')})`
      : ' (use --regenerate <kind> to rebuild)'),
);

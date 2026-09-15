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
 * The studio mark: two congruent halves, one the other rotated 180 degrees,
 * held apart by a seam that turns once. Rotate the whole thing half a turn and
 * it is unchanged — which is the idea, for a studio whose games are 1v1: both
 * players are looking at the same shape from their own side. The seam is the
 * path between them.
 *
 * Three numbers define it, and every coordinate below is derived from them:
 *
 *   x1  where the seam turns. 22 is a deliberately deep interlock — the halves
 *       wrap around each other rather than sitting side by side. The golden
 *       section of this box would be 26.33, which was tried and looked weaker.
 *   g   half the seam width.
 *   r   the tile's corner radius.
 *
 * x1 and g are chosen so that every vertical edge — 20, 24, 40, 44 — is a
 * multiple of 4, which is one pixel at a 16px favicon.
 */
const MARK = { inset: 8, x1: 22, g: 2, r: 16 };

/**
 * A second master, for the favicon only, because 16 pixels is not a small
 * version of a logo — it is a different drawing problem.
 *
 * Two changes, both measured rather than guessed (three constructions were
 * rendered at 16px and compared):
 *
 *   - No inset. The tab already frames the icon, so the padding was spending
 *     a quarter of the width on nothing and leaving the mark 12 pixels wide.
 *   - A seam of 8 units, not 4. At full bleed a 16px icon is 4 units per
 *     pixel, and a seam centred on the middle can only land on pixel
 *     boundaries if it is two whole pixels wide. At 4 units it renders as a
 *     row of greys; at 8 it is a hard black line.
 *
 * Everything else — 20, 24, 40, 44, and the jog at 28 and 36 — is a multiple
 * of 4, so this drawing has no antialiased edges at 16px at all. Optically
 * heavier seam, visibly sharper icon; that trade only makes sense down here,
 * which is why it is a separate master and not the one.
 */
const MARK_SMALL = { inset: 0, x1: 20, g: 4, r: 20 };

function markShape(fill, geo = MARK, id = 'm') {
  const { inset, x1, g, r } = geo;
  const far = 64 - inset;
  const side = 64 - inset * 2;
  const a = x1 - g;
  const b = 64 - x1 - g;
  const c = 64 - x1 + g;
  const d = x1 + g;

  return `<clipPath id="${id}"><rect x="${inset}" y="${inset}" width="${side}" height="${side}" rx="${r}"/></clipPath>
  <g clip-path="url(#${id})" fill="${fill}">
    <polygon points="${inset},${inset} ${a},${inset} ${a},${32 + g} ${b},${32 + g} ${b},${far} ${inset},${far}"/>
    <polygon points="${far},${far} ${c},${far} ${c},${32 - g} ${d},${32 - g} ${d},${inset} ${far},${inset}"/>
  </g>`;
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
await emit('brand', path.join(brand, 'favicon.svg'), () =>
  brandMark(64, { background: 'bleed', geo: MARK_SMALL }),
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

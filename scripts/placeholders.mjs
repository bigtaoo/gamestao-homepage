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

/** The studio wordmark: three bars, one per game, in the three accents. */
function brandMark(size) {
  const r = Math.round(size * 0.22);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3d8bff"/>
      <stop offset="55%" stop-color="#9ccc65"/>
      <stop offset="100%" stop-color="#fe9205"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${(r / size) * 64}" fill="${BG_DEEP}"/>
  <rect x="6" y="6" width="52" height="52" rx="${(r / size) * 52}" fill="url(#mark)"/>
  <rect x="16" y="20" width="32" height="6" rx="3" fill="#070a0f" fill-opacity="0.55"/>
  <rect x="16" y="30" width="24" height="6" rx="3" fill="#070a0f" fill-opacity="0.55"/>
  <rect x="16" y="40" width="16" height="6" rx="3" fill="#070a0f" fill-opacity="0.55"/>
</svg>`);
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

await emit(
  'brand',
  path.join(brand, 'og.png'),
  () =>
    png(
    panel({
      width: 1200,
      height: 630,
      accent: '#3d8bff',
      title: 'gamestao',
      subtitle: 'Independent game studio',
      note: 'Nivara  ·  DayDayUp  ·  SumQuest',
    }),
  ),
);

await emit('brand', path.join(brand, 'icon-192.png'), () => png(brandMark(192)));
await emit('brand', path.join(brand, 'icon-512.png'), () => png(brandMark(512)));
await emit('brand', path.join(brand, 'favicon.svg'), () => brandMark(64));

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

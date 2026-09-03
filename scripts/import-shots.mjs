/**
 * Imports real artwork for one game, replacing the generated stand-ins.
 *
 *   node scripts/import-shots.mjs nivara \
 *     --icon "D:/funny/art/store/icons/ios_appicon_1024.png"
 *
 *   node scripts/import-shots.mjs sumquest \
 *     --icon  "D:/number/markting/appstore/AppIcon-1024-noalpha.png" \
 *     --cover "D:/number/markting/crazy games/1920x1080-1.jpg" \
 *     --shots "D:/number/markting/appstore/iphone_6.9/1290x2796-1.png" ...
 *
 * Sources are passed on the command line rather than listed in the repo: the
 * originals live in each game's own checkout, and a build here must not depend
 * on a sibling working copy being present.
 *
 * Each flag is independent — importing a real icon does not disturb generated
 * screenshots, and vice versa.
 *
 * The cover is fitted to a fixed 8:5 so all three cards line up, and the icon
 * to a square. `--cover-fit contain` letterboxes onto the card surface instead
 * of cropping, which is what a composed feature graphic needs: cropping one
 * cuts through its own typography. Photographs and screenshots want the
 * default `cover`.
 * screenshots keep their own aspect ratio and their measured size
 * is recorded in `src/data/asset-sizes.json`, which is what stops a
 * phone-shaped screenshot from shifting the layout it was dropped into.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ICON_PX, markReal, measure, readSizes, writeSizes } from './lib/asset-sizes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'public', 'assets');

const COVER = { width: 1600, height: 1000 };
/** Matches --surface in global.css, so a letterboxed cover blends into the card. */
const LETTERBOX = { r: 18, g: 22, b: 31 };
const OG = { width: 1200, height: 630 };
const SHOT_HEIGHT = 1280;

function parseArgs(argv) {
  const [gameId, ...rest] = argv;
  if (!gameId || gameId.startsWith('--')) {
    throw new Error(
      'usage: import-shots.mjs <gameId> [--icon <file>]' +
        ' [--cover <file>] [--cover-fit cover|contain] [--shots <file>...]',
    );
  }

  const out = { gameId, icon: null, cover: null, coverFit: 'cover', shots: [] };
  let bucket = null;
  for (const arg of rest) {
    if (arg === '--icon') {
      bucket = 'icon';
    } else if (arg === '--cover-fit') {
      bucket = 'coverFit';
    } else if (arg === '--cover') {
      bucket = 'cover';
    } else if (arg === '--shots') {
      bucket = 'shots';
    } else if (bucket === 'icon') {
      out.icon = arg;
      bucket = null;
    } else if (bucket === 'coverFit') {
      if (arg !== 'cover' && arg !== 'contain') {
        throw new Error(`--cover-fit takes "cover" or "contain", got "${arg}"`);
      }
      out.coverFit = arg;
      bucket = null;
    } else if (bucket === 'cover') {
      out.cover = arg;
      bucket = null;
    } else if (bucket === 'shots') {
      out.shots.push(arg);
    } else {
      throw new Error(`unexpected argument: ${arg}`);
    }
  }

  if (!out.icon && !out.cover && out.shots.length === 0) {
    throw new Error(`nothing to import for ${gameId} — pass --icon, --cover or --shots`);
  }
  return out;
}

const { gameId, icon, cover, coverFit, shots } = parseArgs(process.argv.slice(2));
const dir = path.join(ASSETS, 'games', gameId);
await mkdir(dir, { recursive: true });

const sizes = await readSizes();
sizes[gameId] = { ...sizes[gameId] };

// Recorded so the generator will not overwrite this art later.
const imported = [];

if (icon) {
  await writeFile(
    path.join(dir, 'icon.webp'),
    await sharp(icon)
      .resize({ width: ICON_PX, height: ICON_PX, fit: 'cover' })
      .webp({ quality: 92 })
      .toBuffer(),
  );
  imported.push('icon');
  console.log(`icon.webp           <-  ${path.basename(icon)}  (${ICON_PX}x${ICON_PX})`);
}

if (cover) {
  const coverFile = path.join(dir, 'cover.webp');
  await writeFile(
    coverFile,
    await sharp(cover)
      .resize({ ...COVER, fit: coverFit, background: LETTERBOX })
      .webp({ quality: 86 })
      .toBuffer(),
  );
  sizes[gameId].cover = await measure(sharp, coverFile);

  // The social card comes from the same source, so a game never has a cover
  // that looks nothing like the image people see when the link is shared.
  await writeFile(
    path.join(dir, 'og.png'),
    await sharp(cover)
      .resize({ ...OG, fit: coverFit, background: LETTERBOX })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );
  // og is cropped from the same source, so it is just as real as the cover.
  imported.push('cover', 'og');
  console.log(`cover.webp + og.png <-  ${path.basename(cover)}  (fit: ${coverFit})`);
}

const measured = new Set();
for (const [index, source] of shots.entries()) {
  const file = path.join(dir, `shot-${index + 1}.webp`);
  await writeFile(
    file,
    await sharp(source)
      .resize({ height: SHOT_HEIGHT, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer(),
  );
  const size = await measure(sharp, file);
  measured.add(size.join('x'));
  if (index === 0) sizes[gameId].shot = size;
  console.log(`shot-${index + 1}.webp         <-  ${path.basename(source)}  (${size.join('x')})`);
}

// The gallery reserves one box for every shot, so mixed aspect ratios would
// shift the row. Worth saying out loud rather than silently accepting.
if (measured.size > 1) {
  console.warn(
    `warning: ${gameId} screenshots have mixed aspect ratios (${[...measured].join(
      ', ',
    )}); the gallery sizes them all from shot-1`,
  );
}

if (shots.length > 0) imported.push('shot');

await writeSizes(sizes);
await markReal(gameId, imported);
console.log(`recorded as real for ${gameId}: ${imported.join(', ')}`);

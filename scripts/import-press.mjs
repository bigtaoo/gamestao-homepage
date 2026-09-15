/**
 * Imports one game's press-kit downloads — the full-resolution originals a
 * journalist or a storefront asks for, which are deliberately *not* the
 * web-sized images the site itself renders.
 *
 *   node scripts/import-press.mjs nivara \
 *     --logo    "D:/funny/art/logo/derived/logo-1024.png" \
 *     --icon    "D:/funny/art/store/icons/ios_appicon_1024.png" \
 *     --feature "D:/funny/art/store/icons/play_feature_1024x500.png" \
 *     --screens "D:/funny/art/store/en/battle__android_9x16.png" ...
 *
 * Same contract as `import-shots.mjs`: sources are passed on the command line
 * because the originals live in each game's own checkout (`D:\funny`,
 * `D:\number`), and a build in this repo must never depend on a sibling
 * working copy being present. What lands here is committed.
 *
 * A PNG source is copied byte-for-byte. Re-encoding it here was tried first,
 * on the theory that one compression level across two source trees was tidier;
 * it inflated every file it touched — SumQuest's icon by 87% — because the
 * originals came out of tools that already quantise harder than sharp does.
 * Anything else is converted to PNG. Either way the full resolution is kept:
 * a press kit that ships downscaled art is a press kit nobody uses.
 *
 * The screenshots passed here must be the same scenes, in the same order, as
 * the ones `import-shots.mjs` put on the site — the press page pairs each
 * download with the web-sized `shot-<n>.webp` as its thumbnail.
 *
 * Every written file is recorded in `src/data/press-assets.json` with its
 * kind, pixel size and byte count, so the page can state all three without
 * anyone retyping a number that will be wrong after the next import.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRESS_DIR = path.join(ROOT, 'public', 'assets', 'press');
const MANIFEST = path.join(ROOT, 'src', 'data', 'press-assets.json');

/** Single-file kinds, in the order the press page lists them. */
const SINGLE = ['logo', 'icon', 'feature'];

function parseArgs(argv) {
  const [gameId, ...rest] = argv;
  if (!gameId || gameId.startsWith('--')) {
    throw new Error(
      'usage: import-press.mjs <gameId> [--logo <file>] [--icon <file>]' +
        ' [--feature <file>] [--screens <file>...]',
    );
  }

  const out = { gameId, logo: null, icon: null, feature: null, screens: [] };
  let bucket = null;
  for (const arg of rest) {
    const flag = arg.startsWith('--') ? arg.slice(2) : null;
    if (flag === 'screens') {
      bucket = 'screens';
    } else if (flag && SINGLE.includes(flag)) {
      bucket = flag;
    } else if (flag) {
      throw new Error(`unknown flag: ${arg}`);
    } else if (bucket === 'screens') {
      out.screens.push(arg);
    } else if (bucket) {
      out[bucket] = arg;
      bucket = null;
    } else {
      throw new Error(`unexpected argument: ${arg}`);
    }
  }

  if (!out.logo && !out.icon && !out.feature && out.screens.length === 0) {
    throw new Error(`nothing to import for ${gameId} — pass --logo, --icon, --feature or --screens`);
  }
  return out;
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Puts one source into the press directory under a predictable download name
 * and returns its manifest entry. PNG out either way: these are screenshots
 * and flat-colour logos, where a lossy format would visibly band the one thing
 * the file exists to show.
 */
async function place(gameId, kind, name, source) {
  const file = `${name}.png`;
  const target = path.join(PRESS_DIR, gameId, file);

  const image = sharp(source);
  const { width, height, format } = await image.metadata();
  if (!width || !height) throw new Error(`could not measure ${source}`);

  const original = await readFile(source);
  const bytes = format === 'png' ? original : await image.png({ compressionLevel: 9 }).toBuffer();
  await writeFile(target, bytes);

  const note = format === 'png' ? 'copied' : `${format} -> png`;
  console.log(
    `${file.padEnd(26)} <-  ${path.basename(source)}  ` +
      `(${width}x${height}, ${(bytes.length / 1024).toFixed(0)}KB, ${note})`,
  );

  return { kind, file: `/assets/press/${gameId}/${file}`, width, height, bytes: bytes.length };
}

const { gameId, screens, ...singles } = parseArgs(process.argv.slice(2));
await mkdir(path.join(PRESS_DIR, gameId), { recursive: true });

const entries = [];
for (const kind of SINGLE) {
  if (singles[kind]) entries.push(await place(gameId, kind, `${gameId}-${kind}`, singles[kind]));
}
for (const [index, source] of screens.entries()) {
  entries.push(await place(gameId, 'screenshot', `${gameId}-screenshot-${index + 1}`, source));
}

// Replaces this game's list rather than merging: a re-import with fewer
// screenshots must not leave the dropped ones advertised on the page.
const manifest = await readManifest();
manifest[gameId] = entries;

const ordered = {};
for (const id of Object.keys(manifest).sort()) ordered[id] = manifest[id];
await writeFile(MANIFEST, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');

const total = entries.reduce((sum, entry) => sum + entry.bytes, 0);
console.log(`${entries.length} files for ${gameId}, ${(total / 1024 / 1024).toFixed(1)}MB total`);

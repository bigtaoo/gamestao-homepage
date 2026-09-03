/**
 * Reads and updates `src/data/asset-sizes.json` — the intrinsic pixel size of
 * every committed game image.
 *
 * The components need those numbers for `width`/`height` so the browser can
 * reserve the right box before an image loads. Hard-coding them would go stale
 * the first time a real screenshot replaced a placeholder at a different aspect
 * ratio, and the symptom would be layout shift, which nobody notices in review.
 * So whichever script writes an image also records its size here.
 *
 * Icons are the exception and are deliberately absent from that file: they are
 * always square at `ICON_PX`, so there is nothing to measure and nothing that
 * can drift.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SIZES_FILE = path.join(ROOT, 'src', 'data', 'asset-sizes.json');

/** Every game icon is emitted square at this size, real or generated. */
export const ICON_PX = 512;

export async function readSizes() {
  try {
    return JSON.parse(await readFile(SIZES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export async function writeSizes(sizes) {
  const ordered = {};
  for (const id of Object.keys(sizes).sort()) {
    ordered[id] = sizes[id];
  }
  await writeFile(SIZES_FILE, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');
}

/** `sharp(...).metadata()` for one file, reduced to what the markup needs. */
export async function measure(sharp, input) {
  const { width, height } = await sharp(input).metadata();
  if (!width || !height) throw new Error('could not measure image');
  return [width, height];
}

/**
 * The three games, read from the built SSR bundle so the accent colours, names
 * and genre labels have exactly one definition each (`src/data/games.ts` for
 * the first two, the English locale file for the third). These scripts are
 * plain `.mjs` and cannot import the TypeScript directly; duplicating any of
 * it here is what previously risked a placeholder being generated in an accent
 * the site no longer uses.
 */
export async function readGames() {
  const bundle = path.join(ROOT, '.ssr', 'entry-server.js');
  const { pathToFileURL } = await import('node:url');
  try {
    const { GAMES, MESSAGES } = await import(pathToFileURL(bundle).href);
    return GAMES.map((game) => ({
      ...game,
      genre: MESSAGES.en.games.entries[game.id].genre,
    }));
  } catch {
    throw new Error(
      `could not read the game table from ${path.relative(ROOT, bundle)} — run: npm run build:ssr`,
    );
  }
}

/**
 * Which assets came from a game's real artwork rather than the generator.
 *
 * `scripts/placeholders.mjs` refuses to overwrite anything listed here, even
 * when `--regenerate` names its kind. This exists because the alternative was
 * tried and failed immediately: one `--regenerate all` after an accent change
 * silently replaced SumQuest's imported cover and four real screenshots with
 * generated panels. An explicit flag is not protection when the destructive
 * case looks identical to the intended one.
 */
export const PROVENANCE_FILE = path.join(ROOT, 'src', 'data', 'asset-provenance.json');

export async function readProvenance() {
  try {
    return JSON.parse(await readFile(PROVENANCE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export async function markReal(gameId, kinds) {
  const provenance = await readProvenance();
  provenance[gameId] = { ...provenance[gameId] };
  for (const kind of kinds) provenance[gameId][kind] = 'real';

  const ordered = {};
  for (const id of Object.keys(provenance).sort()) {
    ordered[id] = provenance[id];
  }
  await writeFile(PROVENANCE_FILE, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');
}

export function isReal(provenance, gameId, kind) {
  return provenance[gameId]?.[kind] === 'real';
}

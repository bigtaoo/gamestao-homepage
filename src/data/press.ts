import type { GameId } from '../lib/routes';
import manifest from './press-assets.json';

/**
 * One downloadable file in the press kit, as written by
 * `scripts/import-press.mjs` when it copied the original out of the game's own
 * checkout. Size and byte count are recorded there rather than typed in here,
 * because both change every time a screenshot is re-captured and neither has a
 * visible symptom when it goes stale — the page would simply lie.
 */
export type PressAsset = {
  /** `screenshot` entries pair 1:1, in order, with the site's `shot-<n>.webp`. */
  kind: string;
  /** Absolute site path, e.g. `/assets/press/nivara/nivara-logo.png`. */
  file: string;
  width: number;
  height: number;
  bytes: number;
};

const TABLE: Partial<Record<string, PressAsset[]>> = manifest;

/** A game's downloads, or an empty list for one whose art is not public yet. */
export function pressAssets(gameId: GameId): PressAsset[] {
  return TABLE[gameId] ?? [];
}

/**
 * Split into the two lists the page renders separately: brand files, which are
 * a plain download list, and screenshots, which are shown as thumbnails.
 */
export function splitAssets(gameId: GameId): { brand: PressAsset[]; screens: PressAsset[] } {
  const assets = pressAssets(gameId);
  return {
    brand: assets.filter((asset) => asset.kind !== 'screenshot'),
    screens: assets.filter((asset) => asset.kind === 'screenshot'),
  };
}

/**
 * The studio mark. Not in the manifest and not imported from anywhere: this is
 * the same file the site serves as its favicon, so the press kit hands out the
 * mark people actually see rather than a second copy that could drift from it.
 */
export const STUDIO_MARK = [
  { file: '/assets/brand/favicon.svg', format: 'SVG' },
  { file: '/assets/brand/icon-512.png', format: '512x512 PNG' },
] as const;

/** `press/nivara/nivara-logo.png` -> `nivara-logo.png`, the download's name. */
export function assetName(asset: PressAsset): string {
  return asset.file.slice(asset.file.lastIndexOf('/') + 1);
}

/**
 * Byte counts as a reader of a download list wants them: one decimal place,
 * and never a bare number of bytes. Locale-independent on purpose — this sits
 * next to a pixel size and a filename, which are not translated either.
 */
export function fileSize(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

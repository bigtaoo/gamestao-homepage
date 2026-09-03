import type { Game } from '../data/games';

/**
 * A game's store icon. Nivara's and SumQuest's are their real published icons;
 * DayDayUp has none yet and gets a generated stand-in in its own accent, so the
 * three cards stay visually consistent either way.
 *
 * Always square, always emitted at 512 by the asset scripts, so the intrinsic
 * size is a constant here rather than a lookup in `asset-sizes.json` — there is
 * no aspect ratio that can drift.
 */
export function GameIcon({ game, size }: { game: Game; size: number }) {
  return (
    <img
      className="gameicon"
      src={`/assets/games/${game.id}/icon.webp`}
      // Decorative: the game's name is always adjacent as real text, so an
      // alt here would just be read out twice.
      alt=""
      width={512}
      height={512}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="lazy"
      decoding="async"
    />
  );
}

import { assetSize } from '../data/assetSizes';
import type { Game } from '../data/games';
import { interpolate } from '../i18n';
import { useT } from '../lib/page';

/**
 * A scroll-snapped strip rather than a JS carousel. Swiping and keyboard arrows
 * come from the browser, it works before hydration, and there is no state to
 * get stuck in the wrong position after a resize.
 */
export function Gallery({ game }: { game: Game }) {
  const t = useT();
  const shots = Array.from({ length: game.screenshots }, (_, i) => i + 1);
  const shot = assetSize(game.id, 'shot');

  return (
    <ul className="gallery" tabIndex={0} aria-label={t.gamePage.screenshots}>
      {shots.map((n) => (
        <li key={n} className="gallery__item">
          <img
            src={`/assets/games/${game.id}/shot-${n}.webp`}
            alt={interpolate(t.a11y.screenshotAlt, { game: game.name, n })}
            width={shot.width}
            height={shot.height}
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
}

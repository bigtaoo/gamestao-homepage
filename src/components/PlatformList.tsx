import type { Game } from '../data/games';
import { useT } from '../lib/page';
import { PlatformIcon } from './Icons';

/**
 * Renders whatever `games.ts` says a game ships on. A `soon` platform becomes a
 * `<span>`, not a disabled `<a>` — there is no href to give it, and a link that
 * goes nowhere is worse than a label that admits it is not out yet.
 */
export function PlatformList({ game, variant }: { game: Game; variant: 'card' | 'page' }) {
  const t = useT();

  return (
    <ul className={`platforms platforms--${variant}`}>
      {game.links.map((link) => {
        const label = t.platforms[link.platform];

        if (link.status === 'soon') {
          return (
            <li key={link.platform}>
              <span className="platform platform--soon">
                <PlatformIcon platform={link.platform} />
                <span className="platform__label">{label}</span>
                <span className="platform__note">{t.platformSoon}</span>
              </span>
            </li>
          );
        }

        return (
          <li key={link.platform}>
            <a
              className="platform platform--live"
              href={link.url}
              // The games sit on other subdomains, so these leave the site.
              target="_blank"
              rel="noopener"
            >
              <PlatformIcon platform={link.platform} />
              <span className="platform__label">{label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

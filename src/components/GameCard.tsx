import { assetSize } from '../data/assetSizes';
import type { Game } from '../data/games';
import { usePage } from '../lib/page';
import { routePath } from '../lib/routes';
import { GameIcon } from './GameIcon';
import { ArrowIcon } from './Icons';
import { PlatformList } from './PlatformList';

export function GameCard({ game }: { game: Game }) {
  const { messages: t, route } = usePage();
  const copy = t.games.entries[game.id];
  const href = routePath({ locale: route.locale, page: 'game', gameId: game.id });
  const cover = assetSize(game.id, 'cover');

  return (
    <article className="card" style={{ ['--accent' as string]: game.accent }}>
      <a className="card__media" href={href} tabIndex={-1} aria-hidden="true">
        <img
          src={`/assets/games/${game.id}/cover.webp`}
          alt=""
          width={cover.width}
          height={cover.height}
          loading="lazy"
          decoding="async"
        />
      </a>

      <div className="card__body">
        <GameIcon game={game} size={64} />
        <p className="card__genre">{copy.genre}</p>
        <h3 className="card__name">
          {/* The whole card is clickable through this link's ::after overlay,
              which keeps one link per card for a screen reader instead of
              three that all say the same thing. */}
          <a href={href}>{game.name}</a>
        </h3>
        <p className="card__tagline">{copy.tagline}</p>
        <p className="card__summary">{copy.summary}</p>

        <PlatformList game={game} variant="card" />

        <span className="card__more">
          {t.games.details}
          <ArrowIcon />
        </span>
      </div>
    </article>
  );
}

import { Gallery } from '../components/Gallery';
import { GameIcon } from '../components/GameIcon';
import { ArrowIcon } from '../components/Icons';
import { PlatformList } from '../components/PlatformList';
import { assetSize } from '../data/assetSizes';
import { GAMES, getGame } from '../data/games';
import { usePage } from '../lib/page';
import { routePath, type GameId } from '../lib/routes';

export function GamePage({ gameId }: { gameId: GameId }) {
  const { messages: t, route } = usePage();
  const game = getGame(gameId);
  const copy = t.games.entries[gameId];
  const home = routePath({ locale: route.locale, page: 'home' });

  /** The first live link is the primary call to action — web, in every case
   *  today. If a game ever ships with nothing live, the button is simply
   *  absent rather than pointing nowhere. */
  const primary = game.links.find((link) => link.status === 'live');

  const others = GAMES.filter((other) => other.id !== gameId);
  const cover = assetSize(gameId, 'cover');

  return (
    <main id="main" className="game" style={{ ['--accent' as string]: game.accent }}>
      <section className="game__hero">
        <div className="game__hero-copy">
          <a className="game__back" href={`${home}#games`}>
            {t.gamePage.backToGames}
          </a>
          <GameIcon game={game} size={88} />
          <p className="game__genre">{copy.genre}</p>
          <h1 className="game__name">{game.name}</h1>
          <p className="game__tagline">{copy.tagline}</p>
          <p className="game__intro">{copy.intro}</p>
          {primary && (
            <a className="btn btn--primary" href={primary.url} target="_blank" rel="noopener">
              {t.gamePage.playNow}
              <ArrowIcon />
            </a>
          )}
        </div>
        <div className="game__hero-art">
          <img
            src={`/assets/games/${game.id}/cover.webp`}
            alt=""
            width={cover.width}
            height={cover.height}
            decoding="async"
          />
        </div>
      </section>

      <section className="game__section">
        <h2 className="section__title">{t.gamePage.howTo}</h2>
        <ol className="steps">
          {copy.howTo.map((step, index) => (
            <li key={step}>
              <span className="steps__num" aria-hidden="true">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="game__section">
        <h2 className="section__title">{t.gamePage.features}</h2>
        <ul className="features">
          {copy.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="game__section">
        <h2 className="section__title">{t.gamePage.screenshots}</h2>
        <Gallery game={game} />
      </section>

      <section className="game__section">
        <h2 className="section__title">{t.gamePage.availableOn}</h2>
        <PlatformList game={game} variant="page" />
      </section>

      <section className="game__section game__section--others">
        <h2 className="section__title">{t.gamePage.otherGames}</h2>
        <ul className="otherlist">
          {others.map((other) => (
            <li key={other.id} style={{ ['--accent' as string]: other.accent }}>
              <a href={routePath({ locale: route.locale, page: 'game', gameId: other.id })}>
                <span className="otherlist__genre">{t.games.entries[other.id].genre}</span>
                <span className="otherlist__name">{other.name}</span>
                <span className="otherlist__tagline">{t.games.entries[other.id].tagline}</span>
                <ArrowIcon />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

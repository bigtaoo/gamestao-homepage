import { GameCard } from '../components/GameCard';
import { GAMES, SUPPORT_EMAIL } from '../data/games';
import { useT } from '../lib/page';
import { LOCALES } from '../lib/routes';

/**
 * Every number in the strip is derived, not written down, so it cannot drift
 * from reality when a game or a locale is added. All three claims are also
 * literally true today — an earlier "platforms" figure counted platforms the
 * games only target, which the "coming soon" badges contradict.
 */
function Stats() {
  const t = useT();
  const items = [
    { value: GAMES.length, label: t.stats.games },
    { value: LOCALES.length, label: t.stats.languages },
    { value: 0, label: t.stats.installs },
  ];

  return (
    <dl className="stats">
      {items.map((item) => (
        <div className="stats__item" key={item.label}>
          <dt className="stats__value">{item.value}</dt>
          <dd className="stats__label">{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Home() {
  const t = useT();

  return (
    <main id="main">
      <section className="hero">
        <div className="hero__inner">
          <p className="hero__kicker">{t.hero.kicker}</p>
          <h1 className="hero__title">{t.hero.title}</h1>
          <p className="hero__lead">{t.hero.lead}</p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#games">
              {t.hero.ctaGames}
            </a>
            <a className="btn btn--ghost" href="#about">
              {t.hero.ctaAbout}
            </a>
          </div>
          <Stats />
        </div>
      </section>

      <section className="section" id="games">
        <div className="section__head">
          <h2 className="section__title">{t.games.title}</h2>
          <p className="section__lead">{t.games.lead}</p>
        </div>
        <div className="cards">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section className="section section--about" id="about">
        <div className="section__head">
          <h2 className="section__title">{t.about.title}</h2>
          <p className="section__lead">{t.about.lead}</p>
        </div>
        <div className="prose">
          {t.about.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section section--contact" id="contact">
        <div className="contact">
          <h2 className="section__title">{t.contact.title}</h2>
          <p className="section__lead">{t.contact.lead}</p>
          <a className="btn btn--primary" href={`mailto:${SUPPORT_EMAIL}`}>
            {t.contact.email}
          </a>
          <p className="contact__address">{SUPPORT_EMAIL}</p>
        </div>
      </section>
    </main>
  );
}

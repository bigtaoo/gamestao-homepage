import { GameCard } from '../components/GameCard';
import { ArrowIcon } from '../components/Icons';
import { BUSINESS_EMAIL, GAMES, SUPPORT_EMAIL } from '../data/games';
import { usePage, useT } from '../lib/page';
import { LOCALES, routePath } from '../lib/routes';

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
  const { messages: t, route } = usePage();

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

      {/* Two routes rather than one address with a longer sentence over it.
          A refund request and a publishing enquiry want different answers on
          different days, and only one of them should ever wait. */}
      <section className="section section--contact" id="contact">
        <div className="section__head">
          <h2 className="section__title">{t.contact.title}</h2>
        </div>
        <div className="contact">
          <div className="contact__route">
            <h3 className="contact__who">{t.contact.playersTitle}</h3>
            <p className="contact__lead">{t.contact.lead}</p>
            <a className="contact__address" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="contact__route">
            <h3 className="contact__who">{t.contact.businessTitle}</h3>
            <p className="contact__lead">{t.contact.businessLead}</p>
            <a className="contact__address" href={`mailto:${BUSINESS_EMAIL}`}>
              {BUSINESS_EMAIL}
            </a>
            <a
              className="contact__press"
              href={routePath({ locale: route.locale, page: 'press' })}
            >
              {t.contact.pressCta}
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

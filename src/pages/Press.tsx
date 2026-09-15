import { GameIcon } from '../components/GameIcon';
import { ArrowIcon } from '../components/Icons';
import { assetSize } from '../data/assetSizes';
import { BUSINESS_EMAIL, GAMES, SCHEMA_PLATFORM } from '../data/games';
import { assetName, fileSize, splitAssets, STUDIO_MARK } from '../data/press';
import { interpolate } from '../i18n';
import { usePage, useT } from '../lib/page';
import { LOCALES, ORIGIN, routePath } from '../lib/routes';

/** The fact sheet, every row of it derived rather than written down. */
function Facts() {
  const t = useT();

  /** Platforms actually playable today, not the ones a game is heading for. */
  const playable = [
    ...new Set(
      GAMES.flatMap((game) =>
        game.links.filter((link) => link.status === 'live').map((link) => SCHEMA_PLATFORM[link.platform]),
      ),
    ),
  ];

  const rows = [
    { label: t.press.facts.studio, value: 'gamestao' },
    { label: t.press.facts.games, value: GAMES.map((game) => game.name).join(', ') },
    { label: t.press.facts.languages, value: String(LOCALES.length) },
    { label: t.press.facts.playableOn, value: playable.join(', ') },
    { label: t.press.facts.tech, value: 'TypeScript, PixiJS, WebGL' },
    { label: t.press.facts.site, value: ORIGIN.replace('https://', '') },
    { label: t.press.facts.contact, value: BUSINESS_EMAIL },
  ];

  return (
    <dl className="facts">
      {rows.map((row) => (
        <div className="facts__row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A download link that says what it hands over before it is clicked. */
function Download({ href, name, meta }: { href: string; name: string; meta: string }) {
  const t = useT();

  return (
    <li className="downloads__item">
      <a href={href} download aria-label={interpolate(t.press.downloadAlt, { file: name })}>
        <span className="downloads__name">{name}</span>
        <span className="downloads__meta">{meta}</span>
        <ArrowIcon />
      </a>
    </li>
  );
}

/**
 * Everything a publisher, an investor or a journalist asks for, on one URL
 * that survives being pasted into an email: the facts, the downloads, and an
 * address that is not the player-support queue.
 *
 * Nothing here is hand-written data. The fact sheet counts the same game table
 * and locale list the rest of the site renders from, and every download is
 * read from the manifest `scripts/import-press.mjs` wrote. A typed-in press
 * page is the one most likely to still claim two games and four languages a
 * year from now, in front of exactly the audience that checks.
 */
export function Press() {
  const { messages: t, route } = usePage();

  return (
    <main id="main" className="press">
      {/* The home page's hero, reused: same bloom, same type scale. A press
          page that looks like a different site is one more reason to doubt the
          studio behind it. */}
      <section className="hero press__hero">
        <div className="hero__inner">
          <p className="hero__kicker">{t.meta.tagline}</p>
          <h1 className="hero__title">{t.press.title}</h1>
          <p className="hero__lead">{t.press.lead}</p>
          <div className="hero__actions">
            <a className="btn btn--primary" href={`mailto:${BUSINESS_EMAIL}`}>
              {BUSINESS_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t.press.factsTitle}</h2>
        </div>
        <Facts />
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t.press.brandTitle}</h2>
          <p className="section__lead">{t.press.brandLead}</p>
        </div>
        <div className="press__brand">
          <img
            className="press__mark"
            src="/assets/brand/icon-512.png"
            alt=""
            width={112}
            height={112}
            decoding="async"
          />
          <ul className="downloads">
            {STUDIO_MARK.map((mark) => (
              <Download
                key={mark.file}
                href={mark.file}
                name={mark.file.slice(mark.file.lastIndexOf('/') + 1)}
                meta={mark.format}
              />
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">{t.press.gamesTitle}</h2>
        </div>

        <div className="press__games">
          {GAMES.map((game) => {
            const { brand, screens } = splitAssets(game.id);
            const shot = screens.length > 0 ? assetSize(game.id, 'shot') : null;

            return (
              <article
                className="press__game"
                key={game.id}
                style={{ ['--accent' as string]: game.accent }}
              >
                <header className="press__game-head">
                  <GameIcon game={game} size={64} />
                  <div>
                    <h3 className="press__game-name">{game.name}</h3>
                    <p className="press__game-tagline">{t.games.entries[game.id].tagline}</p>
                  </div>
                  <a
                    className="press__game-link"
                    href={routePath({ locale: route.locale, page: 'game', gameId: game.id })}
                  >
                    {t.games.details}
                    <ArrowIcon />
                  </a>
                </header>

                {brand.length === 0 && screens.length === 0 ? (
                  <p className="press__none">{interpolate(t.press.none, { game: game.name })}</p>
                ) : (
                  <div className="press__game-body">
                    {brand.length > 0 && (
                      <div>
                        <h4 className="press__label">{t.press.assetsTitle}</h4>
                        <ul className="downloads">
                          {brand.map((asset) => (
                            <Download
                              key={asset.file}
                              href={asset.file}
                              name={assetName(asset)}
                              meta={`${asset.width}x${asset.height} · ${fileSize(asset.bytes)}`}
                            />
                          ))}
                        </ul>
                      </div>
                    )}

                    {screens.length > 0 && shot && (
                      <div>
                        <h4 className="press__label">{t.press.screensTitle}</h4>
                        <ul className="press__shots">
                          {screens.map((asset, index) => (
                            <li key={asset.file}>
                              {/* The thumbnail is the web-sized shot the site
                                  already ships; the link is the original. No
                                  press page should make a reader download 2MB
                                  to find out which scene it is. */}
                              <a
                                href={asset.file}
                                download
                                aria-label={interpolate(t.press.downloadAlt, {
                                  file: assetName(asset),
                                })}
                              >
                                <img
                                  src={`/assets/games/${game.id}/shot-${index + 1}.webp`}
                                  alt={interpolate(t.a11y.screenshotAlt, {
                                    game: game.name,
                                    n: index + 1,
                                  })}
                                  width={shot.width}
                                  height={shot.height}
                                  loading="lazy"
                                  decoding="async"
                                />
                                <span className="press__shot-meta">
                                  {asset.width}x{asset.height} · {fileSize(asset.bytes)}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="section section--about">
        <div className="section__head">
          <h2 className="section__title">{t.press.usageTitle}</h2>
        </div>
        <div className="prose">
          <p>{t.press.usage}</p>
        </div>
      </section>
    </main>
  );
}

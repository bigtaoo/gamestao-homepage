import { BUSINESS_EMAIL, SUPPORT_EMAIL } from '../data/games';
import { interpolate } from '../i18n';
import { usePage } from '../lib/page';
import { GAME_IDS, routePath } from '../lib/routes';
import { getGame } from '../data/games';

export function Footer() {
  const { messages: t, route, year } = usePage();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="nav__mark" aria-hidden="true" />
          <div>
            <p className="footer__name">gamestao</p>
            <p className="footer__tagline">{t.meta.tagline}</p>
          </div>
        </div>

        <nav className="footer__col" aria-label={t.nav.games}>
          <h2>{t.nav.games}</h2>
          <ul>
            {GAME_IDS.map((id) => (
              <li key={id}>
                <a href={routePath({ locale: route.locale, page: 'game', gameId: id })}>
                  {getGame(id).name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-label={t.footer.support}>
          <h2>{t.footer.support}</h2>
          <ul>
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </li>
            <li>
              <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>
            </li>
            <li>
              <a href={routePath({ locale: route.locale, page: 'press' })}>{t.footer.press}</a>
            </li>
            {/* This site's own documents, about this site. They used to be the
                Nivara client's, which described a game with accounts, purchases
                and chat — none of which exists here, and all of which a visitor
                would reasonably have read as a description of this site. Each
                game still carries its own set, linked from the game.

                No refund policy: nothing is sold here. One would be a document
                about a transaction that cannot happen. */}
            <li>
              <a href={routePath({ locale: route.locale, page: 'privacy' })}>{t.footer.privacy}</a>
            </li>
            <li>
              <a href={routePath({ locale: route.locale, page: 'terms' })}>{t.footer.terms}</a>
            </li>
          </ul>
        </nav>
      </div>

      <p className="footer__legal">{interpolate(t.footer.rights, { year })}</p>
    </footer>
  );
}

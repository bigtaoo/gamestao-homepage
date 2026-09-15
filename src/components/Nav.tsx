import { useT, useRoute } from '../lib/page';
import { routePath } from '../lib/routes';
import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * The section links point at the home page's anchors. On a game page that means
 * a full navigation back to `/` first, which is why they are absolute paths
 * rather than bare `#games` — a bare hash on a game page would scroll to
 * nothing.
 */
export function Nav() {
  const t = useT();
  const route = useRoute();
  const home = routePath({ locale: route.locale, page: 'home' });

  const links = [
    { href: `${home}#games`, label: t.nav.games },
    { href: `${home}#about`, label: t.nav.about },
    { href: `${home}#contact`, label: t.nav.contact },
    // A page of its own, not an anchor: this is the link that gets pasted
    // into a pitch email, and it has to resolve on its own.
    { href: routePath({ locale: route.locale, page: 'press' }), label: t.nav.press },
  ];

  return (
    <header className="nav">
      <a className="skiplink" href="#main">
        {t.a11y.skipToContent}
      </a>
      <div className="nav__inner">
        <a className="nav__brand" href={home}>
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__wordmark">gamestao</span>
        </a>

        <nav className="nav__links" aria-label={t.nav.menu}>
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}

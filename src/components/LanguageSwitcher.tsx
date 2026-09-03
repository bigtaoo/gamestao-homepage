import { usePage } from '../lib/page';
import {
  HREFLANG,
  LOCALES,
  LOCALE_NAMES,
  routePath,
  translateRoute,
  type Locale,
} from '../lib/routes';
import { ChevronIcon, GlobeIcon } from './Icons';

/** Where an explicit language choice is remembered. Read by the inline
 *  first-visit redirect in `lib/head.ts` — the two must agree on this key. */
const STORAGE_KEY = 'gamestao.lang';

/**
 * A `<details>` rather than a button with state, so the menu opens and the
 * links work on a page that has not hydrated yet — or never does, because the
 * JS bundle failed. Hydration only adds the part that genuinely needs it:
 * remembering the choice so the auto-redirect stops overriding it.
 */
export function LanguageSwitcher() {
  const { route } = usePage();

  function remember(locale: Locale) {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Private mode or blocked storage: the link still navigates, the choice
      // just is not remembered on the next visit. Not worth interrupting for.
    }
  }

  return (
    <details className="langswitch">
      <summary className="langswitch__button" aria-label={LOCALE_NAMES[route.locale]}>
        <GlobeIcon />
        <span className="langswitch__current">{LOCALE_NAMES[route.locale]}</span>
        <ChevronIcon />
      </summary>
      <ul className="langswitch__menu">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <a
              href={routePath(translateRoute(route, locale))}
              hrefLang={HREFLANG[locale]}
              lang={HREFLANG[locale]}
              className={locale === route.locale ? 'is-current' : undefined}
              aria-current={locale === route.locale ? 'true' : undefined}
              onClick={() => remember(locale)}
            >
              {LOCALE_NAMES[locale]}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

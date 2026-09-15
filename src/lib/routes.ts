/**
 * The site's static route space. Shared by the prerenderer (which walks every
 * route) and the client (which reads the one route it was served), so the two
 * can never disagree about what a URL means.
 */

export const LOCALES = ['en', 'zh', 'de', 'fr', 'it', 'nl', 'es', 'pt', 'ja', 'ko', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

/** English lives at the root; every other locale under its own directory. */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * `hreflang` values. Two locales are regional variants whose directory segment
 * is deliberately shorter than the tag search engines need to see.
 */
export const HREFLANG: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-Hans',
  de: 'de',
  fr: 'fr',
  it: 'it',
  nl: 'nl',
  es: 'es',
  pt: 'pt-BR',
  ja: 'ja',
  ko: 'ko',
  ru: 'ru',
};

/**
 * Endonyms — a language is always listed in its own language, never translated.
 * Lives here rather than in the locale files so the switcher can render every
 * option without loading eleven message bundles.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  nl: 'Nederlands',
  es: 'Español',
  pt: 'Português',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
};

/** Locales that need a CJK-aware font stack and looser line height. */
export const CJK_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['zh', 'ja', 'ko']);

export const GAME_IDS = ['nivara', 'daydayup', 'sumquest'] as const;
export type GameId = (typeof GAME_IDS)[number];

export type Route =
  | { locale: Locale; page: 'home' }
  | { locale: Locale; page: 'press' }
  | { locale: Locale; page: 'privacy' }
  | { locale: Locale; page: 'terms' }
  | { locale: Locale; page: 'game'; gameId: GameId };

/**
 * The press page's URL segment. Untranslated, like the game ids: the link is
 * handed out in pitch emails and store submissions, and one address that
 * resolves in every language beats eleven that each work in one.
 */
export const PRESS_SEGMENT = 'press';

/**
 * The studio's own legal pages, about this website rather than about a game.
 * Untranslated segments for the same reason as `press`: these URLs are handed
 * to store review forms and quoted in email, where one address that resolves
 * everywhere beats eleven that each work in one language.
 */
export const LEGAL_SEGMENT = { privacy: 'privacy', terms: 'terms' } as const;

/** Canonical origin. Every absolute URL in a `<head>` is built from this. */
export const ORIGIN = 'https://gamestao.com';

/**
 * Path for a route, always with a trailing slash. Cloudflare Workers static
 * assets resolve `/de/` to `/de/index.html` on its own, so the prerenderer
 * writes directories rather than `de.html` — which keeps one URL per page
 * instead of two that both work and split the search ranking.
 */
export function routePath(route: Route): string {
  const segments: string[] = [];
  if (route.locale !== DEFAULT_LOCALE) segments.push(route.locale);
  if (route.page === 'press') segments.push(PRESS_SEGMENT);
  if (route.page === 'privacy' || route.page === 'terms') segments.push(LEGAL_SEGMENT[route.page]);
  if (route.page === 'game') segments.push(route.gameId);
  return segments.length === 0 ? '/' : `/${segments.join('/')}/`;
}

export function routeUrl(route: Route): string {
  return `${ORIGIN}${routePath(route)}`;
}

/** The same page in another language — what the switcher links to. */
export function translateRoute(route: Route, locale: Locale): Route {
  if (route.page === 'game') return { locale, page: 'game', gameId: route.gameId };
  return { locale, page: route.page };
}

/** Every page: 11 locales x (home + press + privacy + terms + 3 games) = 77. */
export function allRoutes(): Route[] {
  const routes: Route[] = [];
  for (const locale of LOCALES) {
    routes.push({ locale, page: 'home' });
    routes.push({ locale, page: 'press' });
    routes.push({ locale, page: 'privacy' });
    routes.push({ locale, page: 'terms' });
    for (const gameId of GAME_IDS) routes.push({ locale, page: 'game', gameId });
  }
  return routes;
}

/**
 * The inverse of `routePath`. Only the dev server needs this — in production
 * every URL is its own prerendered document that already knows what it is — but
 * it is here rather than in the dev entry so both directions of the mapping sit
 * side by side and stay in step.
 */
export function parsePath(pathname: string): Route | null {
  const segments = pathname.split('/').filter(Boolean);

  let locale: Locale = DEFAULT_LOCALE;
  if (segments.length > 0 && (LOCALES as readonly string[]).includes(segments[0])) {
    locale = segments.shift() as Locale;
  }

  if (segments.length === 0) return { locale, page: 'home' };

  if (segments.length === 1 && segments[0] === PRESS_SEGMENT) return { locale, page: 'press' };

  if (segments.length === 1 && segments[0] === LEGAL_SEGMENT.privacy) return { locale, page: 'privacy' };
  if (segments.length === 1 && segments[0] === LEGAL_SEGMENT.terms) return { locale, page: 'terms' };

  if (segments.length === 1 && (GAME_IDS as readonly string[]).includes(segments[0])) {
    return { locale, page: 'game', gameId: segments[0] as GameId };
  }

  return null;
}

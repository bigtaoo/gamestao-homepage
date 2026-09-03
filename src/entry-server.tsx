import { renderToString } from 'react-dom/server';
import { App } from './App';
import { MESSAGES } from './i18n';
import { htmlAttrs, renderHead, renderNotFoundHead } from './lib/head';
import { PAGE_DATA_GLOBAL, type PageData } from './lib/page';
import { escapeForScript } from './lib/serialize';
import { DEFAULT_LOCALE, type Route } from './lib/routes';

export type RenderedPage = {
  /** Contents of `<head>`, already escaped. */
  head: string;
  /** Attributes for the `<html>` element. */
  htmlAttrs: string;
  /** The app markup, to go inside `#root`. */
  body: string;
  /** A `<script>` tag carrying the page's data for hydration. */
  pageDataScript: string;
};

/**
 * The build year, not the render year: these pages are static and cached, so
 * reading the clock in the browser would be the only way to keep the footer
 * current — and that costs a hydration mismatch for one number nobody checks.
 * Rebuilding once a year is the cheaper trade.
 */
const BUILD_YEAR = new Date().getFullYear();

export function render(route: Route): RenderedPage {
  const page: PageData = {
    route,
    messages: MESSAGES[route.locale],
    year: BUILD_YEAR,
  };

  const body = renderToString(<App page={page} />);

  // Only the locale this page was built with travels to the browser, so a
  // German visitor never downloads the other ten bundles.
  const serialized = escapeForScript(page);

  return {
    head: renderHead(route, page.messages),
    htmlAttrs: htmlAttrs(route.locale),
    body,
    pageDataScript: `<script>window.${PAGE_DATA_GLOBAL}=${serialized}</script>`,
  };
}

/**
 * `404.html`. The Worker serves this for any unknown path with a real 404
 * status — see `not_found_handling` in `wrangler/site.jsonc`. It borrows the
 * English home route so the header and the language switcher have somewhere
 * to point, and sets `notFound` to swap the body.
 */
export function renderNotFound(): RenderedPage {
  const page: PageData = {
    route: { locale: DEFAULT_LOCALE, page: 'home' },
    messages: MESSAGES[DEFAULT_LOCALE],
    year: BUILD_YEAR,
    notFound: true,
  };

  return {
    head: renderNotFoundHead(page.messages),
    htmlAttrs: htmlAttrs(DEFAULT_LOCALE),
    body: renderToString(<App page={page} />),
    pageDataScript: `<script>window.${PAGE_DATA_GLOBAL}=${escapeForScript(page)}</script>`,
  };
}

/**
 * This module is the whole build-time surface of the app: the prerenderer and
 * the test suite both import the bundled output rather than resolving the
 * TypeScript sources a second time. Nothing here reaches the browser — the
 * client bundle is built separately from `main.tsx` — so re-exporting freely
 * costs nothing shipped.
 */
export {
  allRoutes,
  routePath,
  parsePath,
  translateRoute,
  DEFAULT_LOCALE,
  GAME_IDS,
  HREFLANG,
  LOCALES,
  LOCALE_NAMES,
  ORIGIN,
} from './lib/routes';
export { GAMES, getGame, LEGAL_URLS, SCHEMA_PLATFORM, SUPPORT_EMAIL } from './data/games';
export { assetSize } from './data/assetSizes';
export { interpolate, MESSAGES } from './i18n';
export { escapeAttr, escapeForScript } from './lib/serialize';
export { pageDescription, pageTitle, renderHead } from './lib/head';

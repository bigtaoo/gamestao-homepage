import { BUSINESS_EMAIL, getGame, GAMES, SCHEMA_PLATFORM, SUPPORT_EMAIL } from '../data/games';
import { interpolate } from '../i18n';
import type { Messages } from '../i18n/types';
import {
  CJK_LOCALES,
  HREFLANG,
  LOCALES,
  ORIGIN,
  routePath,
  routeUrl,
  translateRoute,
  type Locale,
  type Route,
} from './routes';
import { escapeAttr, escapeForScript } from './serialize';

export function pageTitle(route: Route, messages: Messages): string {
  if (route.page === 'home') return messages.meta.homeTitle;
  if (route.page === 'press') return `${messages.press.title} — gamestao`;
  return interpolate(messages.meta.gameTitle, { game: getGame(route.gameId).name });
}

export function pageDescription(route: Route, messages: Messages): string {
  if (route.page === 'home') return messages.meta.homeDescription;
  if (route.page === 'press') return messages.press.metaDescription;
  const game = getGame(route.gameId);
  return interpolate(messages.meta.gameDescription, {
    game: game.name,
    tagline: messages.games.entries[route.gameId].tagline,
  });
}

function ogImage(route: Route): string {
  return route.page === 'game'
    ? `${ORIGIN}/assets/games/${route.gameId}/og.png`
    : `${ORIGIN}/assets/brand/og.png`;
}

/**
 * Structured data. The home page describes the studio and lists its games; a
 * game page describes that game. This is what puts a rich result rather than a
 * bare blue link in front of someone searching the game by name.
 */
function structuredData(route: Route, messages: Messages): string {
  if (route.page === 'home' || route.page === 'press') {
    return escapeForScript({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'gamestao',
      url: `${ORIGIN}/`,
      description:
        route.page === 'press' ? messages.press.metaDescription : messages.meta.homeDescription,
      logo: `${ORIGIN}/assets/brand/icon-512.png`,
      email: SUPPORT_EMAIL,
      // Two inboxes, described as what they are. A single `email` field had
      // publishers and players landing in the same queue, which is the thing
      // the second address exists to stop.
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'customer support', email: SUPPORT_EMAIL },
        { '@type': 'ContactPoint', contactType: 'business', email: BUSINESS_EMAIL },
      ],
      makesOffer: GAMES.map((game) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'VideoGame',
          name: game.name,
          url: routeUrl({ locale: route.locale, page: 'game', gameId: game.id }),
        },
      })),
    });
  }

  const game = getGame(route.gameId);
  const copy = messages.games.entries[route.gameId];
  return escapeForScript({
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    url: routeUrl(route),
    description: copy.summary,
    genre: copy.genre,
    image: ogImage(route),
    inLanguage: HREFLANG[route.locale],
    // Only platforms actually playable today are claimed here.
    gamePlatform: [
      ...new Set(
        game.links
          .filter((link) => link.status === 'live')
          .map((link) => SCHEMA_PLATFORM[link.platform]),
      ),
    ],
    author: { '@type': 'Organization', name: 'gamestao', url: `${ORIGIN}/` },
    publisher: { '@type': 'Organization', name: 'gamestao', url: `${ORIGIN}/` },
  });
}

/**
 * First-visit language routing, inlined so it runs before the page paints and
 * nobody sees English flash before their own language.
 *
 * An explicit choice always wins: the switcher writes `gamestao.lang`, and this
 * only consults `navigator.languages` when that key is absent. Without it, a
 * German speaker who deliberately clicked English would be bounced back to
 * German on every navigation.
 */
function languageRedirectScript(route: Route): string {
  const map: Record<string, string> = {};
  for (const locale of LOCALES) map[locale] = routePath(translateRoute(route, locale));

  return `(function(){try{
var cur=${escapeForScript(route.locale)},map=${escapeForScript(map)},want=null;
try{want=localStorage.getItem("gamestao.lang")}catch(e){}
if(!want||!map[want]){want=null;
var l=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""];
for(var i=0;i<l.length&&!want;i++){var t=String(l[i]).toLowerCase();
for(var c in map){if(t===c||t.indexOf(c+"-")===0){want=c;break}}}}
if(want&&want!==cur&&map[want])location.replace(map[want])}catch(e){}})();`;
}

/**
 * The whole `<head>` for one prerendered page, as a string. Built here rather
 * than with a helmet-style library so the tags exist in the emitted HTML with
 * no client-side step — which is the entire point of prerendering 55 pages.
 */
export function renderHead(route: Route, messages: Messages): string {
  const title = pageTitle(route, messages);
  const description = pageDescription(route, messages);
  const canonical = routeUrl(route);
  const image = ogImage(route);

  const alternates = LOCALES.map(
    (locale) =>
      `<link rel="alternate" hreflang="${HREFLANG[locale]}" href="${escapeAttr(
        routeUrl(translateRoute(route, locale)),
      )}" />`,
  ).join('\n    ');

  return `<title>${escapeAttr(title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${escapeAttr(
      routeUrl(translateRoute(route, 'en')),
    )}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="gamestao" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(image)}" />
    <meta property="og:locale" content="${HREFLANG[route.locale].replace('-', '_')}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(image)}" />
    <meta name="theme-color" content="#0b0e14" />
    <link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/assets/brand/icon-192.png" />
    <script type="application/ld+json">${structuredData(route, messages)}</script>
    <script>${languageRedirectScript(route)}</script>`;
}

/** Attributes for the `<html>` element. All eleven locales are left-to-right,
 *  so this is the language tag plus a class the CJK font stack hangs off. */
export function htmlAttrs(locale: Locale): string {
  const classes = CJK_LOCALES.has(locale) ? ' class="cjk"' : '';
  return `lang="${HREFLANG[locale]}"${classes}`;
}

/**
 * The `<head>` for `404.html`.
 *
 * Three deliberate omissions versus a real page: `noindex`, so a crawler does
 * not keep the file in its index; no canonical or hreflang, because the page
 * has no URL of its own to point at; and — most importantly — no first-visit
 * language redirect. With that script here, any non-English visitor who hit a
 * typo'd URL would be bounced silently to a home page, which hides the error
 * instead of reporting it. They stay on the 404 and can use the switcher.
 */
export function renderNotFoundHead(messages: Messages): string {
  return `<title>${escapeAttr(messages.notFound.title)} — gamestao</title>
    <meta name="robots" content="noindex, follow" />
    <meta name="description" content="${escapeAttr(messages.notFound.lead)}" />
    <meta name="theme-color" content="#0b0e14" />
    <link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/assets/brand/icon-192.png" />`;
}

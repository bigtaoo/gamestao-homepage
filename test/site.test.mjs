/**
 * Invariants of the route space, the game data and the head builder.
 *
 * These run against the built SSR bundle (`.ssr/entry-server.js`, which
 * `npm test` builds first) rather than the TypeScript sources: that bundle is
 * exactly what the prerenderer consumes, so a test passing here means the
 * thing that actually generates the 44 pages behaves as described.
 */

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = await import(pathToFileURL(path.join(ROOT, '.ssr', 'entry-server.js')).href);

const {
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
  GAMES,
  getGame,
  LEGAL_URLS,
  SCHEMA_PLATFORM,
  SUPPORT_EMAIL,
  interpolate,
  MESSAGES,
  escapeForScript,
  renderHead,
  render,
} = site;

test('the build emits one page per locale per view, all distinct', () => {
  const routes = allRoutes();
  assert.equal(routes.length, LOCALES.length * (1 + GAME_IDS.length));

  const paths = routes.map(routePath);
  assert.equal(new Set(paths).size, paths.length, 'two routes resolve to the same path');
});

test('English lives at the root and every other locale under its own directory', () => {
  assert.equal(routePath({ locale: 'en', page: 'home' }), '/');
  assert.equal(routePath({ locale: 'de', page: 'home' }), '/de/');
  assert.equal(routePath({ locale: 'en', page: 'game', gameId: 'nivara' }), '/nivara/');
  assert.equal(routePath({ locale: 'ja', page: 'game', gameId: 'sumquest' }), '/ja/sumquest/');
});

test('every path parses back to the route that produced it', () => {
  for (const route of allRoutes()) {
    assert.deepEqual(
      parsePath(routePath(route)),
      route,
      `${routePath(route)} did not round-trip`,
    );
  }
});

test('parsePath rejects a path that is not a page', () => {
  assert.equal(parsePath('/nope/'), null);
  assert.equal(parsePath('/de/nope/'), null);
  assert.equal(parsePath('/de/nivara/extra/'), null);
  // An unknown first segment is not silently treated as a locale.
  assert.equal(parsePath('/xx/'), null);
});

test('translateRoute keeps you on the same page', () => {
  const route = { locale: 'en', page: 'game', gameId: 'daydayup' };
  for (const locale of LOCALES) {
    const moved = translateRoute(route, locale);
    assert.equal(moved.page, 'game');
    assert.equal(moved.gameId, 'daydayup');
    assert.equal(moved.locale, locale);
  }
});

test('every locale has an hreflang tag and an endonym', () => {
  for (const locale of LOCALES) {
    assert.ok(HREFLANG[locale], `${locale} has no hreflang value`);
    assert.ok(LOCALE_NAMES[locale], `${locale} has no display name`);
  }
  const tags = LOCALES.map((l) => HREFLANG[l]);
  assert.equal(new Set(tags).size, tags.length, 'two locales share an hreflang tag');
});

test('a live platform link has an https url and a soon one has none', () => {
  for (const game of GAMES) {
    assert.ok(game.links.length > 0, `${game.id} lists no platforms`);
    for (const link of game.links) {
      if (link.status === 'live') {
        assert.match(link.url, /^https:\/\//, `${game.id}/${link.platform} url is not https`);
      } else {
        assert.equal(link.status, 'soon');
        assert.equal(link.url, undefined, `${game.id}/${link.platform} is "soon" but carries a url`);
      }
    }
  }
});

test('no game advertises the same platform twice', () => {
  for (const game of GAMES) {
    const platforms = game.links.map((l) => l.platform);
    assert.equal(new Set(platforms).size, platforms.length, `${game.id} repeats a platform`);
  }
});

test('every platform used by a game has a label in every locale and a schema name', () => {
  const used = new Set(GAMES.flatMap((g) => g.links.map((l) => l.platform)));
  for (const platform of used) {
    assert.ok(SCHEMA_PLATFORM[platform], `${platform} has no schema.org name`);
    for (const locale of LOCALES) {
      assert.ok(
        MESSAGES[locale].platforms[platform],
        `${locale} has no label for platform ${platform}`,
      );
    }
  }
});

test('the committed screenshots exist for the count each game claims', () => {
  for (const game of GAMES) {
    for (let n = 1; n <= game.screenshots; n += 1) {
      const file = path.join(ROOT, 'public', 'assets', 'games', game.id, `shot-${n}.webp`);
      assert.ok(existsSync(file), `missing ${path.relative(ROOT, file)}`);
    }
    const cover = path.join(ROOT, 'public', 'assets', 'games', game.id, 'cover.webp');
    assert.ok(existsSync(cover), `missing ${path.relative(ROOT, cover)}`);
    // assetSize throws rather than returning a wrong box, so calling it is the check.
    assert.ok(site.assetSize(game.id, 'cover').width > 0);
    assert.ok(site.assetSize(game.id, 'shot').height > 0);
  }
});

test('getGame refuses an unknown id instead of returning undefined', () => {
  assert.throws(() => getGame('nope'), /Unknown game id/);
});

test('the studio contact and legal links are absolute and consistent', () => {
  assert.match(SUPPORT_EMAIL, /^[^@\s]+@gamestao\.com$/);
  for (const [name, url] of Object.entries(LEGAL_URLS)) {
    assert.match(url, /^https:\/\//, `${name} legal url is not absolute`);
  }
});

test('interpolate fills known placeholders and leaves unknown ones alone', () => {
  assert.equal(interpolate('{a} and {b}', { a: 'x', b: 'y' }), 'x and y');
  assert.equal(interpolate('{a} and {b}', { a: 'x' }), 'x and {b}');
  assert.equal(interpolate('{n} shots', { n: 4 }), '4 shots');
});

test('escapeForScript neutralises the two things that break an inline script', () => {
  const payload = { close: '</script>', sep: `a${String.fromCharCode(0x2028)}b` };
  const escaped = escapeForScript(payload);

  assert.ok(!escaped.includes('</script>'), 'a closing script tag survived');
  assert.ok(!escaped.includes(String.fromCharCode(0x2028)), 'a raw line separator survived');
  // Still the same data once parsed — escaping must not corrupt the payload.
  assert.deepEqual(JSON.parse(escaped), payload);
});

test('every page declares a canonical url and all eleven alternates', () => {
  for (const route of allRoutes()) {
    const head = renderHead(route, MESSAGES[route.locale]);

    assert.ok(
      head.includes(`<link rel="canonical" href="${ORIGIN}${routePath(route)}" />`),
      `${routePath(route)} has no self-referential canonical`,
    );

    for (const locale of LOCALES) {
      const alternate = `hreflang="${HREFLANG[locale]}" href="${ORIGIN}${routePath(
        translateRoute(route, locale),
      )}"`;
      assert.ok(head.includes(alternate), `${routePath(route)} is missing the ${locale} alternate`);
    }

    assert.ok(head.includes('hreflang="x-default"'), `${routePath(route)} has no x-default`);
  }
});

test('a game page claims only platforms that are actually playable', () => {
  for (const game of GAMES) {
    const head = renderHead({ locale: 'en', page: 'game', gameId: game.id }, MESSAGES.en);
    const json = JSON.parse(head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);

    const expected = [
      ...new Set(
        game.links.filter((l) => l.status === 'live').map((l) => SCHEMA_PLATFORM[l.platform]),
      ),
    ];
    assert.deepEqual(json.gamePlatform, expected, `${game.id} misreports gamePlatform`);
  }
});

test('a rendered page carries its copy in the markup, not only in the hydration payload', () => {
  // This is the whole reason the site is prerendered: strip the inlined data
  // and the German page must still read as German to a crawler.
  const { body } = render({ locale: 'de', page: 'game', gameId: 'sumquest' });
  assert.ok(body.includes(MESSAGES.de.games.entries.sumquest.tagline));
  assert.ok(body.includes(MESSAGES.de.gamePage.howTo));
  assert.ok(!body.includes(MESSAGES.en.gamePage.howTo));
});

test('the default locale is the one served from the root', () => {
  assert.equal(DEFAULT_LOCALE, 'en');
  assert.equal(routePath({ locale: DEFAULT_LOCALE, page: 'home' }), '/');
});

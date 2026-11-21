/**
 * Invariants of the route space, the game data and the head builder.
 *
 * These run against the built SSR bundle (`.ssr/entry-server.js`, which
 * `npm test` builds first) rather than the TypeScript sources: that bundle is
 * exactly what the prerenderer consumes, so a test passing here means the
 * thing that actually generates the 55 pages behaves as described.
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
  LEGAL,
  LEGAL_PAGES,
  LEGAL_UPDATED,
  SCHEMA_PLATFORM,
  SUPPORT_EMAIL,
  BUSINESS_EMAIL,
  pressAssets,
  splitAssets,
  STUDIO_MARK,
  interpolate,
  MESSAGES,
  escapeForScript,
  renderHead,
  render,
} = site;

test('the build emits one page per locale per view, all distinct', () => {
  const routes = allRoutes();
  // home + press + privacy + terms + one page per game, in every locale.
  assert.equal(routes.length, LOCALES.length * (2 + LEGAL_PAGES.length + GAME_IDS.length));

  const paths = routes.map(routePath);
  assert.equal(new Set(paths).size, paths.length, 'two routes resolve to the same path');
});

test('English lives at the root and every other locale under its own directory', () => {
  assert.equal(routePath({ locale: 'en', page: 'home' }), '/');
  assert.equal(routePath({ locale: 'de', page: 'home' }), '/de/');
  assert.equal(routePath({ locale: 'en', page: 'game', gameId: 'nivara' }), '/nivara/');
  assert.equal(routePath({ locale: 'ja', page: 'game', gameId: 'sumquest' }), '/ja/sumquest/');
  // The press URL is the one handed out in pitch emails: same segment in
  // every language, so a link copied from the German page opens for everyone.
  assert.equal(routePath({ locale: 'en', page: 'press' }), '/press/');
  assert.equal(routePath({ locale: 'de', page: 'press' }), '/de/press/');
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
  const route = { locale: 'en', page: 'game', gameId: 'blightbloom' };
  for (const locale of LOCALES) {
    const moved = translateRoute(route, locale);
    assert.equal(moved.page, 'game');
    assert.equal(moved.gameId, 'blightbloom');
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

test('the studio contact addresses are distinct and on the zone', () => {
  assert.match(SUPPORT_EMAIL, /^[^@\s]+@gamestao\.com$/);
  assert.match(BUSINESS_EMAIL, /^[^@\s]+@gamestao\.com$/);
  // Two inboxes with one address between them would be the same inbox.
  assert.notEqual(BUSINESS_EMAIL, SUPPORT_EMAIL);
});

test('every locale has both legal documents, with the same sections', () => {
  const shape = (docs, page) => docs[page].sections.map((section) => section.heading.length > 0);

  for (const page of LEGAL_PAGES) {
    const expected = shape(LEGAL[DEFAULT_LOCALE], page).length;
    assert.ok(expected > 0, `${page} has no sections in ${DEFAULT_LOCALE}`);

    for (const locale of LOCALES) {
      const doc = LEGAL[locale]?.[page];
      assert.ok(doc, `${locale} has no ${page} document`);
      assert.ok(doc.title.trim(), `${locale}/${page} has no title`);
      assert.ok(doc.lead.trim(), `${locale}/${page} has no lead`);
      assert.ok(doc.updatedLabel.trim(), `${locale}/${page} has no "last updated" label`);
      // A translation that quietly drops a section drops an obligation with
      // it, and nobody on the team reads all eleven.
      assert.equal(
        doc.sections.length,
        expected,
        `${locale}/${page} has ${doc.sections.length} sections, ${DEFAULT_LOCALE} has ${expected}`,
      );
      for (const section of doc.sections) {
        assert.ok(section.heading.trim(), `${locale}/${page} has an unheaded section`);
        assert.ok(section.body.length > 0, `${locale}/${page}: "${section.heading}" has no text`);
        for (const paragraph of section.body) {
          assert.ok(paragraph.trim(), `${locale}/${page}: "${section.heading}" has an empty line`);
        }
      }
    }
  }

  assert.match(LEGAL_UPDATED, /^\d{4}-\d{2}-\d{2}$/);
});

test('the legal pages say what this site does, not what a game does', () => {
  for (const locale of LOCALES) {
    const privacy = LEGAL[locale].privacy;
    const text = [privacy.lead, ...privacy.sections.flatMap((s) => s.body)].join(' ');
    // The one storage key this site writes, and the two inboxes it prints:
    // named in every language, because a privacy notice that cannot be
    // checked against the code is one nobody can falsify.
    assert.ok(text.includes('gamestao.lang'), `${locale} privacy never names the storage key`);
    assert.ok(text.includes(BUSINESS_EMAIL), `${locale} privacy never gives ${BUSINESS_EMAIL}`);
    assert.ok(text.includes('Cloudflare'), `${locale} privacy never names the host`);
  }
});

test('a legal page renders its own document and head', () => {
  for (const page of LEGAL_PAGES) {
    const route = { locale: 'de', page };
    const html = render(route);
    const doc = LEGAL.de[page];

    assert.ok(html.body.includes(doc.title), `${page} does not render its title`);
    assert.ok(html.body.includes(LEGAL_UPDATED), `${page} does not show when it was updated`);
    for (const section of doc.sections) {
      assert.ok(html.body.includes(section.heading), `${page} drops "${section.heading}"`);
    }
    assert.ok(html.head.includes(`${doc.title} — gamestao`), `${page} has the wrong <title>`);
  }
});

test('legal text travels only with the pages that show it', () => {
  // The whole of a locale's Messages is inlined into every page, so legal text
  // living there would be carried by all 77. It lives in PageData instead, and
  // this is the check that keeps it there.
  const marker = LEGAL.en.privacy.sections[0].body[0].slice(0, 40);

  assert.ok(render({ locale: 'en', page: 'privacy' }).body.includes(marker));
  for (const page of ['home', 'press']) {
    const html = render({ locale: 'en', page });
    assert.ok(!html.body.includes(marker), `the ${page} page carries the privacy notice`);
    assert.ok(
      !html.pageDataScript.includes(marker),
      `the ${page} page's hydration payload carries the privacy notice`,
    );
  }
});

test('every press download exists and is described accurately', () => {
  const files = [...STUDIO_MARK.map((mark) => mark.file), ...GAME_IDS.flatMap((id) => pressAssets(id).map((a) => a.file))];

  for (const file of files) {
    assert.ok(
      existsSync(path.join(ROOT, 'public', file.replace(/^\//, ''))),
      `the press page offers ${file}, which is not in public/`,
    );
  }
  assert.equal(new Set(files).size, files.length, 'two press downloads share a path');

  for (const id of GAME_IDS) {
    for (const asset of pressAssets(id)) {
      assert.ok(asset.width > 0 && asset.height > 0, `${asset.file} has no recorded size`);
      assert.ok(asset.bytes > 0, `${asset.file} has no recorded byte count`);
    }
  }
});

test('a press screenshot has the site thumbnail it is shown behind', () => {
  // The press page pairs download <n> with the game's own shot-<n>.webp. A
  // game that exported five originals but ships four web shots would silently
  // render the wrong thumbnail over the last download.
  for (const game of GAMES) {
    const { screens } = splitAssets(game.id);
    if (screens.length === 0) continue;
    assert.equal(
      screens.length,
      game.screenshots,
      `${game.id} has ${screens.length} press screenshots but ${game.screenshots} on the site`,
    );
  }
});

test('the press page states the studio facts it can prove', () => {
  const { body } = render({ locale: 'en', page: 'press' });

  assert.ok(body.includes(BUSINESS_EMAIL), 'the press page does not carry the business address');
  for (const game of GAMES) {
    assert.ok(body.includes(game.name), `the press page omits ${game.name}`);
  }
  // DayDayUp has no published art; the page must say so rather than render an
  // empty download list under its name.
  const missing = GAMES.filter((game) => pressAssets(game.id).length === 0);
  for (const game of missing) {
    assert.ok(
      body.includes(interpolate(MESSAGES.en.press.none, { game: game.name })),
      `${game.id} has no press assets and no line explaining that`,
    );
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

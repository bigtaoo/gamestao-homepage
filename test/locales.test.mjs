/**
 * Checks the eleven locale files against each other.
 *
 * TypeScript already guarantees every key in `Messages` exists, but it cannot
 * see three things that matter just as much here, because nobody on this
 * project proofreads eleven languages before a deploy:
 *
 *   - a bullet dropped from a translated `features` array (the type is
 *     `string[]`, so five items typecheck as happily as six);
 *   - a `{game}` placeholder lost in translation, which renders the literal
 *     text "{game}" on a live page;
 *   - a locale file left as a verbatim copy of English.
 */

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALE_DIR = path.join(ROOT, 'src', 'i18n', 'locales');

const files = readdirSync(LOCALE_DIR).filter((f) => f.endsWith('.json'));
const locales = Object.fromEntries(
  files.map((f) => [path.basename(f, '.json'), JSON.parse(readFileSync(path.join(LOCALE_DIR, f), 'utf8'))]),
);
const others = Object.keys(locales).filter((l) => l !== 'en');

/** Every leaf path in an object, with array indices included. */
function leafPaths(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => leafPaths(item, `${prefix}[${i}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      leafPaths(item, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

function leafValue(root, leafPath) {
  return leafPath
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .reduce((node, key) => node?.[key], root);
}

test('the locale set matches the locales the code declares', () => {
  const declared = ['en', 'zh', 'de', 'fr', 'it', 'nl', 'es', 'pt', 'ja', 'ko', 'ru'];
  assert.deepEqual(Object.keys(locales).sort(), [...declared].sort());
});

test('every locale has exactly the leaf paths English has', () => {
  const expected = leafPaths(locales.en).sort();
  for (const locale of others) {
    assert.deepEqual(
      leafPaths(locales[locale]).sort(),
      expected,
      `${locale}.json diverges from en.json — a key or an array item is missing or extra`,
    );
  }
});

test('every locale keeps the placeholders English uses', () => {
  const placeholder = /\{(\w+)\}/g;
  for (const leaf of leafPaths(locales.en)) {
    const source = leafValue(locales.en, leaf);
    const expected = [...String(source).matchAll(placeholder)].map((m) => m[0]).sort();
    if (expected.length === 0) continue;

    for (const locale of others) {
      const actual = [...String(leafValue(locales[locale], leaf)).matchAll(placeholder)]
        .map((m) => m[0])
        .sort();
      assert.deepEqual(actual, expected, `${locale}.json at "${leaf}" lost or altered a placeholder`);
    }
  }
});

test('no locale file was left as an English copy', () => {
  // Keys that cannot legitimately read the same in all eleven languages.
  // Excluded by design: brand names, store names, "{game} — gamestao", and
  // single common words — Dutch for "Games" is "Games", so nav.games would
  // fail here for a correctly translated file.
  const mustDiffer = [
    'hero.title',
    'hero.lead',
    'about.title',
    'gamePage.howTo',
    'platformSoon',
    'footer.privacy',
    'games.entries.sumquest.tagline',
  ];

  for (const locale of others) {
    for (const leaf of mustDiffer) {
      assert.notEqual(
        leafValue(locales[locale], leaf),
        leafValue(locales.en, leaf),
        `${locale}.json still has the English text at "${leaf}"`,
      );
    }
  }
});

test('no translated string carries stray Cyrillic or CJK into a Latin locale', () => {
  // A real slip this suite caught during authoring: a Russian verb inside a
  // Chinese sentence. Cheap to check, invisible to a reader of another script.
  // Unicode property escapes rather than literal character ranges: the ranges
  // would be a wall of glyphs that no reviewer of this file can verify.
  const SCRIPTS = {
    cyrillic: /\p{Script=Cyrillic}/u,
    han: /\p{Script=Han}/u,
    hiragana: /\p{Script=Hiragana}/u,
    katakana: /\p{Script=Katakana}/u,
    hangul: /\p{Script=Hangul}/u,
  };

  // Granular on purpose: this also catches kana in Chinese copy or Hangul in
  // Japanese copy, not just a stray word in a Latin-script locale.
  const ALLOWED = {
    en: [],
    de: [],
    fr: [],
    it: [],
    nl: [],
    es: [],
    pt: [],
    ru: ['cyrillic'],
    zh: ['han'],
    ja: ['han', 'hiragana', 'katakana'],
    ko: ['han', 'hangul'],
  };

  for (const [locale, messages] of Object.entries(locales)) {
    const allowed = ALLOWED[locale];
    for (const leaf of leafPaths(messages)) {
      const text = String(leafValue(messages, leaf));
      for (const [name, pattern] of Object.entries(SCRIPTS)) {
        if (allowed.includes(name)) continue;
        assert.ok(
          !pattern.test(text),
          `${locale}.json at "${leaf}" contains ${name} characters: ${text.slice(0, 80)}`,
        );
      }
    }
  }
});

test('taglines stay short enough for a card', () => {
  // A tagline that wraps to four lines breaks the three-card grid's alignment.
  const LIMIT = 90;
  for (const [locale, messages] of Object.entries(locales)) {
    for (const [gameId, copy] of Object.entries(messages.games.entries)) {
      assert.ok(
        copy.tagline.length <= LIMIT,
        `${locale}.json ${gameId} tagline is ${copy.tagline.length} chars (limit ${LIMIT})`,
      );
    }
  }
});

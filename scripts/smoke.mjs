/**
 * Checks a deployed site, not a build. A successful `wrangler deploy` only
 * means the assets uploaded; these are the four things that tell you the site
 * is actually being served the way `wrangler/site.jsonc` says it should be.
 *
 *   npm run smoke -- https://studio.gamestao.com
 *
 * CI runs it after every deploy, and the apex runbook in README.md runs it by
 * hand after a manual one. Same command either way, so what CI considers a
 * healthy deploy and what a person checks cannot drift apart.
 *
 * Expected counts come from the dist/ that was just built rather than being
 * hardcoded, so adding a locale or a game cannot leave this stale. Run it
 * after `npm run build`, against a host serving that same build.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const base = process.argv[2]?.replace(/\/$/, '');
if (!base) {
  console.error('usage: node scripts/smoke.mjs <base-url>');
  process.exit(2);
}

// The first deploy of a new custom domain waits on DNS and an edge
// certificate, which takes a couple of minutes; every later deploy answers on
// the first try. So retry the first request only, and only while there is no
// answer or a 5xx. A 404 is an answer: it means the deploy put nothing there,
// and waiting five minutes will not change that.
const RETRIES = 30;
const RETRY_DELAY_MS = 10_000;

const failures = [];

/** @param {string} label @param {unknown} actual @param {unknown} expected */
function expect(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`);
  if (!ok) failures.push(`${label}: got ${actual}, expected ${expected}`);
}

async function get(url) {
  const res = await fetch(url, { redirect: 'follow' });
  return { status: res.status, body: await res.text() };
}

async function waitForHomePage() {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const { status, body } = await get(`${base}/`);
      // Any answer the edge produced itself is an answer — hand it back and
      // let the assertion below judge it. Only a 5xx or no answer at all can
      // be provisioning still in progress.
      if (status < 500) return { status, body };
      console.log(`attempt ${attempt}: ${base}/ returned ${status}, waiting`);
    } catch (err) {
      console.log(`attempt ${attempt}: ${base}/ did not answer (${err.message}), waiting`);
    }
    if (attempt < RETRIES) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
  console.error(
    `\n${base}/ never answered. If this is the first deploy of that hostname the\n` +
      "edge certificate may still be issuing — check the Worker's domain in the\n" +
      'Cloudflare dashboard before assuming the deploy failed.',
  );
  process.exit(1);
}

const home = await waitForHomePage();
expect('home page', home.status, 200);

// A localised page, proving the whole prerendered locale tree shipped and not
// just the English entry point.
const de = await get(`${base}/de/`);
expect('/de/ status', de.status, 200);
expect(
  '/de/ title',
  de.body.match(/<title>([^<]*)<\/title>/)?.[1] ?? '(none)',
  'gamestao — Unabhängiges Spielestudio',
);

// not_found_handling=404-page. This is the asset setting most easily lost in a
// config edit, and the damage — a soft 404 on every mistyped URL, and real
// harm to how the site is indexed — is invisible unless you read the status
// code, because the page that comes back looks fine either way.
const missing = await get(`${base}/nope/`);
expect('missing page status', missing.status, 404);

const built = await readFile(path.join(ROOT, 'dist', 'sitemap.xml'), 'utf8');
const live = await get(`${base}/sitemap.xml`);
expect('sitemap status', live.status, 200);
expect(
  'sitemap urls',
  (live.body.match(/<url>/g) ?? []).length,
  (built.match(/<url>/g) ?? []).length,
);

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`\nall checks passed against ${base}`);

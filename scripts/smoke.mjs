/**
 * Checks a deployed site, not a build. A successful `wrangler deploy` only
 * means the assets uploaded; these are the four things that tell you the site
 * is actually being served the way `wrangler/site.jsonc` says it should be.
 *
 *   npm run smoke -- https://gamestao.com
 *
 * CI runs it after every deploy, and the runbook in docs/deploy.md runs it by
 * hand after a manual one. Same command either way, so what CI considers a
 * healthy deploy and what a person checks cannot drift apart.
 *
 * Expected counts come from the dist/ that was just built rather than being
 * hardcoded, so adding a locale or a game cannot leave this stale. Run it
 * after `npm run build`, against a host serving that same build.
 *
 * Every check is retried against a deadline rather than judged on one attempt,
 * because a deploy does not land everywhere at once. On 2026-09-15 this ran
 * thirty seconds after a successful deploy and read the *previous* sitemap —
 * 55 URLs where the build had 77 — and failed a deploy that was fine. A check
 * run too early does not measure the deploy, it measures the edge's timing,
 * and a red build nobody believes is worse than no check at all. The deadline
 * is what keeps this honest: a deploy that genuinely shipped the wrong thing
 * still fails, it just takes a minute and a half to say so.
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

/**
 * How long the checks may keep disagreeing with the build before that counts
 * as a failed deploy. Assets reach the whole edge in seconds; ninety is far
 * past that, and still short enough to report a real breakage while whoever
 * pushed is watching.
 */
const SETTLE_DEADLINE_MS = 90_000;
const SETTLE_POLL_MS = 10_000;

let failures = [];
/** Lines for the attempt in progress, printed only once it is the final one. */
let results = [];

/** @param {string} label @param {unknown} actual @param {unknown} expected */
function expect(label, actual, expected) {
  const ok = actual === expected;
  results.push(`${ok ? 'ok  ' : 'FAIL'}  ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`);
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

const built = await readFile(path.join(ROOT, 'dist', 'sitemap.xml'), 'utf8');

/** One full pass. Rebuilds `results` and `failures` from scratch each time. */
async function runChecks() {
  results = [];
  failures = [];

  const home = await waitForHomePage();
  expect('home page', home.status, 200);

  // A localised page, proving the whole prerendered locale tree shipped and
  // not just the English entry point.
  const de = await get(`${base}/de/`);
  expect('/de/ status', de.status, 200);
  expect(
    '/de/ title',
    de.body.match(/<title>([^<]*)<\/title>/)?.[1] ?? '(none)',
    'gamestao — Unabhängiges Spielestudio',
  );

  // not_found_handling=404-page. This is the asset setting most easily lost in
  // a config edit, and the damage — a soft 404 on every mistyped URL, and real
  // harm to how the site is indexed — is invisible unless you read the status
  // code, because the page that comes back looks fine either way.
  const missing = await get(`${base}/nope/`);
  expect('missing page status', missing.status, 404);

  const live = await get(`${base}/sitemap.xml`);
  expect('sitemap status', live.status, 200);
  expect(
    'sitemap urls',
    (live.body.match(/<url>/g) ?? []).length,
    (built.match(/<url>/g) ?? []).length,
  );
}

const deadline = Date.now() + SETTLE_DEADLINE_MS;
let attempts = 0;

for (;;) {
  attempts += 1;
  await runChecks();
  if (failures.length === 0 || Date.now() >= deadline) break;
  // Say why the wait is happening rather than going quiet — a run that sits
  // for a minute with no output looks hung — but say it once. Repeating the
  // same three lines nine times buries the final verdict, which is the part
  // anyone reading a failed run is actually looking for.
  if (attempts === 1) {
    console.log(
      `${failures.length} check(s) disagree with the build, which is what a deploy ` +
        'still reaching the edge looks like. Retrying:',
    );
    for (const failure of failures) console.log(`  - ${failure}`);
  } else {
    console.log(`  still disagreeing after ${attempts} attempts`);
  }
  await new Promise((r) => setTimeout(r, SETTLE_POLL_MS));
}

for (const line of results) console.log(line);

if (failures.length) {
  console.error(
    `\n${failures.length} check(s) failed after ${attempts} attempt(s) over ` +
      `${Math.round(SETTLE_DEADLINE_MS / 1000)}s:\n${failures.map((f) => `  - ${f}`).join('\n')}`,
  );
  process.exit(1);
}
console.log(`\nall checks passed against ${base}${attempts > 1 ? ` (after ${attempts} attempts)` : ''}`);

# gamestao.com

The studio site for [gamestao](https://gamestao.com) — one page per game, plus
an about and contact section, in eleven languages.

React + TypeScript, **prerendered at build time** into 44 static documents and
served from Cloudflare Workers static assets. No server runs at request time.

| | |
|---|---|
| Games | [Nivara](https://nivara.gamestao.com) · [DayDayUp](https://b.gamestao.com) · [SumQuest](https://c.gamestao.com) |
| Languages | en · zh · de · fr · it · nl · es · pt · ja · ko · ru |
| Pages built | 11 locales x (1 home + 3 game pages) = 44, plus `404.html` |
| Hosting | Cloudflare Worker `gamestao-site`, zone `gamestao.com` |

---

## Why it is prerendered

Client-side translation would leave ten of the eleven language versions
invisible to a search engine: a crawler sees the English shell and never runs
the code that swaps the copy. For a marketing site, being found *is* the
product, so every locale gets a real HTML file with its own `<title>`,
description, `hreflang` set and JSON-LD.

The React app is still React — it hydrates and the language menu remembers your
choice — but everything the site actually needs works before, and without,
JavaScript: navigation, the language menu (a `<details>` element), and the
screenshot strip (CSS scroll-snap).

## Commands

```bash
npm install
npm run dev        # vite dev server; renders client-side, route taken from the URL
npm run build      # client bundle -> SSR renderer -> 44 pages into dist/
npm run preview    # serve dist/ exactly as it will be served in production
npm run typecheck
npm test           # locale parity + route/head invariants
```

`npm test` is worth running before any copy change. TypeScript guarantees every
key exists in all eleven locale files, but only the test suite catches a bullet
dropped from a translated list, a `{game}` placeholder lost in translation, a
locale left as a verbatim English copy, or a stray word from the wrong script.

## Layout

```
src/
  lib/routes.ts        The route space: locales, games, path <-> route. One source
                       of truth for the prerenderer and the client.
  lib/head.ts          Builds each page's <head> as a string: canonical, hreflang,
                       Open Graph, JSON-LD, and the first-visit language redirect.
  lib/serialize.ts     Escaping for data embedded in a <script>.
  lib/page.tsx         PageData + the context every component reads.
  data/games.ts        The three games: names, accent colours, platform links.
  data/asset-sizes.json  GENERATED. Intrinsic size of every committed image.
  data/asset-provenance.json  GENERATED. Which art is real, so the generator
                       will not overwrite it.
  i18n/types.ts        The copy contract. Every locale file is checked against it.
  i18n/locales/*.json  Eleven files, one per language.
  pages/, components/  The UI.
  entry-server.tsx     Renders a route to HTML. The build-time surface; also what
                       the tests import.
  main.tsx             Hydrates in the browser.
scripts/
  prerender.mjs        Shell + renderer -> dist/**/index.html, 404.html, sitemap.xml
  placeholders.mjs     Generates brand marks and stand-in game artwork
  import-shots.mjs     Imports a game's real icon, cover and screenshots
  lib/asset-sizes.mjs  Shared image bookkeeping for both of the above
wrangler/site.jsonc    Cloudflare Worker config
```

## Adding or changing things

**Copy** lives only in `src/i18n/locales/*.json`. Add a key to
`src/i18n/types.ts` first; `npm run typecheck` then names every locale file that
still needs it.

**A game's platform going live** is one edit in `src/data/games.ts`: change
`status: 'soon'` to `status: 'live'` and add its `url`. The card badges, the
game page's download row and the JSON-LD `gamePlatform` all read that table, so
nothing else needs touching. The type makes `live` require a URL, so a platform
cannot be advertised as playable without somewhere to send people.

**A new language** is `LOCALES` in `src/lib/routes.ts` plus an `HREFLANG` entry,
an endonym in `LOCALE_NAMES`, and a locale file. The build picks it up and emits
four more pages.

**Artwork.** Each game shows a store icon, a cover and four screenshots.
Real art replaces the generated stand-ins one kind at a time:

```bash
node scripts/import-shots.mjs nivara   --icon "D:/funny/art/store/icons/ios_appicon_1024.png"   --cover "D:/funny/art/store/icons/play_feature_1024x500.png" --cover-fit contain
```

Sources are passed on the command line, never listed in this repo — the
originals live in each game's own checkout and a build here must not depend on a
sibling working copy. Use `--cover-fit contain` for a composed feature graphic
(cropping one cuts through its own typography) and the default `cover` for a
photo or screenshot.

The script records two things besides the images: each file's real pixel size
in `asset-sizes.json`, so the markup reserves the right box and nothing shifts
on load; and the fact that the art is real, in `asset-provenance.json`.

```bash
npm run build:ssr                                     # the generator reads the game table from it
node scripts/placeholders.mjs                         # fill in whatever is missing
node scripts/placeholders.mjs --regenerate cover,og   # rebuild one kind
```

Regeneration is per kind (`icon`, `cover`, `shot`, `og`, `brand`) and never
touches art marked real, even when `--regenerate` names its kind — `--overwrite-real`
is the only way to replace imported art with a stand-in. That guard exists
because the earlier blanket `--force` destroyed SumQuest's imported cover and
four real screenshots on its first use.

Current state: **Nivara** has its real icon and Play feature graphic,
**SumQuest** its real icon, marketing cover and four App Store screenshots, and
**DayDayUp** is entirely on generated stand-ins — it has no store art yet.

## Deploying

`.github/workflows/ci.yml` is the whole pipeline: a `check` job (typecheck,
tests, full build) that runs on every push and pull request, and a `deploy` job
that `needs: check` and ships `dist/` to Cloudflare. So a red gate cannot
publish, and a push is verified even while publishing is switched off.

Nothing is published yet, and nothing publishes by accident. Of the four gates
that stood between a push and a live page, two are now spent and two still
hold — as of 2026-09-03:

1. ~~A commit is local; only a push reaches GitHub.~~ **Spent.** `main` is
   pushed and the `check` job has run green.
2. ~~Without the two Cloudflare secrets, the deploy step fails rather than
   deploying.~~ **Spent.** Both are set on `bigtaoo/goodgoodstudy`.
3. **Holds.** The `deploy` job is guarded by `if: github.ref ==
   'refs/heads/main' && vars.SITE_DEPLOY_ENABLED == 'true'`, and that repo
   variable is deliberately unset, so a push runs the checks and stops there.
   Setting it is what turns publishing on.
4. **Holds.** Even fully enabled, `wrangler/site.jsonc` routes only
   `studio.gamestao.com`. Taking `gamestao.com` needs someone to uncomment two
   lines, which is deliberately a separate act.

After a deploy, CI curls the live host for four things — the home page returns
200, `/de/` renders its German title, a wrong path is a real 404 and not a soft
one, and the served `sitemap.xml` has as many URLs as the build just produced.
These are the same checks the apex runbook below asks you to run by hand; a
successful upload is not a served page. The first deploy of a new hostname
waits on DNS and an edge certificate, so that step retries for five minutes
before calling it a failure.

### Turning CI on

Both on `bigtaoo/goodgoodstudy`:

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID --repo bigtaoo/goodgoodstudy
```

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo bigtaoo/goodgoodstudy
```

```bash
gh variable set SITE_DEPLOY_ENABLED --body true --repo bigtaoo/goodgoodstudy
```

In that order — the variable is the switch, and the next push after it flips
deploys for real. `gh secret set` prompts for the value on stdin, so the token
is never typed into a shell history or a file. The account is
`tao.wang.go@gmail.com`, account id `e64b61f1629ebcc49ee9b6eea2a95b82`.

#### The API token

GitHub cannot read a secret back out, so the value cannot be lifted off
`bigtaoo/daydayup` even though the same two secrets are already set there.
Make one at **dash.cloudflare.com → My Profile → API Tokens → Create Token**,
then **Custom → Edit Cloudflare Workers** — the template Cloudflare's own
GitHub Actions guide points at. It grants:

| Scope | Permission |
|---|---|
| Account | Workers Scripts: Edit |
| Account | Workers KV Storage: Edit |
| Account | Workers R2 Storage: Edit |
| Account | Workers Tail: Read |
| Account | Account Settings: Read |
| User | User Details: Read, Memberships: Read |
| Zone | Workers Routes: Edit |

Narrow **Zone Resources** to `gamestao.com` rather than all zones, and set a
TTL if you want the token to expire. The value is shown once and starts with
`cfut_`.

What the template does **not** include is `Zone → DNS → Edit` or
`Zone → Zone → Read`, which matters here because these routes are
`custom_domain: true` — a custom domain is Cloudflare writing a DNS record and
issuing a certificate on your behalf, not just attaching a script to an
existing proxied record. The docs do not say either way whether
`Workers Routes: Edit` alone authorises that.

**It does — measured, not assumed.** On 2026-09-03 a token created from this
template with nothing added provisioned two brand-new custom domains
(`c.gamestao.com` and `sumquest.gamestao.com`, on `bigtaoo/PIXIJSGAME`),
writing the DNS records and getting valid certificates, from GitHub Actions.
So do not widen this token: adding `DNS → Edit` would let anything running in
CI rewrite every record on the zone, the three game clients included, and it
buys nothing.

Check what landed, and that the guard is really open:

```bash
gh variable list --repo bigtaoo/goodgoodstudy
```

```bash
gh secret list --repo bigtaoo/goodgoodstudy
```

The remote is empty as of 2026-09-03, so the first `git push -u origin main`
both creates `main` and is the first thing CI ever sees. With the variable
still unset, that push runs `check` alone and publishes nothing. Watch it:

```bash
gh run watch --repo bigtaoo/goodgoodstudy
```

### Deploying by hand

Needs a locally authenticated wrangler (browser OAuth; credentials land in
`%APPDATA%\xdg.config\.wrangler\config` — as of 2026-09-03 this machine has
none):

```bash
npx -y wrangler@4.128.0 login
```

```bash
npm run deploy
```

The `deploy` script and CI pin the same wrangler version, so a wrangler release
cannot change what a deploy does without a commit here. Bump the two together.

### Taking over the apex domain

Verified against live DNS on 2026-09-03, **after** SumQuest moved to Cloudflare:

| Name | Current records | Serves |
|---|---|---|
| `gamestao.com` | four A records `185.199.108-111.153`, grey cloud (DNS only) | SumQuest, still GitHub Pages |
| `www.gamestao.com` | **none** — CNAME deleted 2026-09-03, ahead of step 3 | nothing; NXDOMAIN |
| `c.gamestao.com` | Cloudflare, proxied | **SumQuest, Worker `sumquest-client`** |
| `sumquest.gamestao.com` | Cloudflare, proxied | **SumQuest, same Worker** |
| `studio.gamestao.com` | none | — |

The awkward part of this is already done. SumQuest used to exist *only* at the
apex on GitHub Pages, and Pages allows exactly one custom domain per repo — so
freeing the apex meant taking the game offline in the same breath. It now
serves from Cloudflare at `c.gamestao.com` and `sumquest.gamestao.com`
(`bigtaoo/PIXIJSGAME`, `wrangler/client.jsonc`), which means the apex can be
released without the game going anywhere.

Both pipelines still run in that repo: `client-deploy.yml` to Cloudflare and
the older `deploy.yml` to Pages. That is deliberate until the apex move is
finished — after step 3 the Pages one has no domain left to serve and can be
deleted.

Re-check the starting state before beginning — if it no longer matches the
table, stop and re-plan:

```bash
nslookup gamestao.com 1.1.1.1
```

```bash
curl -sI https://gamestao.com | head -3
```

**1. Deploy this site to a free subdomain.** `studio.gamestao.com` is the
checked-in route and the Worker is new, so this touches nothing live.

```bash
npm run deploy
```

Verify — a real page, a localised page, a 404 with a 404 status, and a
sitemap with as many URLs as the build just produced. Same check CI runs after
its own deploys, so it reads the `dist/` you just built:

```bash
npm run smoke -- https://studio.gamestao.com
```

**2. Release the apex from GitHub Pages.** SumQuest is already served from
Cloudflare, so this only takes away a hostname it no longer needs. Confirm the
game actually plays at `https://c.gamestao.com` in a browser first — CI checks
for HTTP 200, which cannot tell you the canvas came up, the assets loaded or
the audio plays.

```bash
gh api -X PUT repos/bigtaoo/PIXIJSGAME/pages -f cname=""
```

```bash
gh api repos/bigtaoo/PIXIJSGAME/pages --jq "{cname, html_url, status}"
```

`cname` should come back `null`. Pages then serves only
`bigtaoo.github.io/PIXIJSGAME/`, which nothing links to. The certificate it
held for `gamestao.com` and `www.gamestao.com` is not needed any more; GitHub
drops it on its own schedule and it does not block anything here.

**3. Free the apex.** In Cloudflare DNS, delete the four A records on
`gamestao.com`. While they exist, provisioning the apex as a Worker custom
domain fails on a record conflict and takes the whole deploy with it — not just
that route.

`www` is already done: its CNAME was deleted on 2026-09-03, so that half of this
step is spent and nothing conflicts with the `www` route in step 4. The cost of
having done it early is that `www.gamestao.com` currently resolves to nothing,
where it used to 301 to the apex — step 4 is what brings it back.

From here until step 4 lands, the apex serves nothing. That is now a cosmetic
outage rather than a real one: the game is reachable the whole time at
`c.gamestao.com`.

**4. Claim them.** Uncomment the `gamestao.com` and `www.gamestao.com` routes
in `wrangler/site.jsonc`, then deploy. Steps 3 and 4 are the only window where
the apex is down, so run them back to back.

```bash
npm run deploy
```

```bash
npm run smoke -- https://gamestao.com
```

`www` only 301s to the apex, so it is not worth a full pass — one status
code is enough:

```bash
curl -s -o /dev/null -w "www %{http_code}\n" -L https://www.gamestao.com/
```

Then point CI at the new home, so its post-deploy check watches what visitors
actually hit: set `SMOKE_HOST` in `.github/workflows/ci.yml` to `gamestao.com`.

What Cloudflare does on its side, so you can tell success from a half-finished
state in the DNS tab: for each `custom_domain` route it writes the record for
that hostname itself, pointing at the Worker and **proxied** (orange cloud) —
not a record you create. The apex works the same way as the subdomain; CNAME
flattening is what makes a root-level target legal. It also issues an Advanced
Certificate per hostname. Do not hand-add an A or CNAME record for `gamestao.com`
or `www` at any point: an existing record on the hostname is the conflict that
blocks provisioning in the first place.

Two settings on the zone are worth checking once, in **SSL/TLS**:

- **Always Use HTTPS** on, so the apex does not serve plaintext.
- The **encryption mode** does not matter for these two hostnames — a Worker
  custom domain has no origin behind it, so there is no origin leg to encrypt.
  It still matters for `c.gamestao.com`, which stays grey-cloud and therefore
  bypasses Cloudflare entirely, with GitHub terminating its own TLS.

One piece of cleanup Cloudflare will not do for you: removing a custom domain
later does **not** delete the certificate it issued. That has to go by hand
from the SSL/TLS dashboard.

**5. Repoint the old links.** CrazyGames, itch.io, the App Store listing and
social bios that say `gamestao.com` now land on the studio page rather than the
game. Point them at **`sumquest.gamestao.com`** rather than `c.gamestao.com` —
the same Worker answers both, but one of them is readable in a store listing
and survives the letters being reshuffled later. While you are in the itch.io
dashboard, grab its page URL and put it in `src/data/games.ts` — that platform
is still marked `soon` only because no file in any repo records the slug.

Free Universal SSL covers the apex and **one** level of subdomain, so every
subdomain on this zone must stay single-level (`c.gamestao.com`, never
`a.b.gamestao.com`).

## Notes worth knowing

- **The accent colours are not decorative choices.** Nivara's and SumQuest's
  come from the dominant colour of their real store icons, DayDayUp's from the
  locked element palette in its own `design/13-worldview-art-direction.md`. All
  three clear 4.5:1 as small text and as a button background, and sit at least
  54 degrees apart in hue so the three cards stay distinct. `src/data/games.ts`
  records the reasoning per game.
- **No web fonts.** The studio ships WeChat Mini Games and so has players in
  China, where `fonts.googleapis.com` is blocked and would stall the first paint
  until it times out. System font stacks, with a separate one for CJK.
- **Language routing.** `hreflang` tags tell search engines about the eleven
  versions. A small inlined script handles the first visit: it reads
  `navigator.languages` and redirects, but only when the visitor has no stored
  choice — the switcher writes `gamestao.lang` to `localStorage`, and an
  explicit choice always wins. Without that check, someone whose browser is set
  to German but who deliberately clicked English would be bounced back to German
  on every click.
- **Legal pages are not duplicated here.** The studio has one privacy policy,
  one ToS and one refund policy; they are served by the Nivara client and linked
  from the footer. Contact for everything is `support@gamestao.com`.
- **`404.html` is not one of the routes.** It has no URL of its own, carries
  `noindex`, is absent from the sitemap, and deliberately omits the language
  redirect — bouncing a mistyped URL to a localised home page would hide the
  error rather than report it.

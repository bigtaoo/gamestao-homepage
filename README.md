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
npm run smoke -- https://gamestao.com   # check a LIVE host, not a build
npm run deploy     # build + wrangler deploy; CI does this on every push to main
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

**The site is live at `https://gamestao.com`** as of 2026-09-03 — Worker
`gamestao-site`, on the apex and `www`. Every push to `main` that touches
anything but `README.md` builds it and publishes it.

What still stands between a bad commit and a bad live page is the pipeline, not
a switch: `deploy` needs `check`, so a failing typecheck, a failing locale test
or a broken prerender stops the deploy rather than shipping. After the deploy,
`npm run smoke` re-checks the live host and fails the run if the apex stopped
answering, `/de/` stopped rendering German, a wrong path stopped being a 404 or
the sitemap lost pages.

To stop publishing without touching the code — while debugging, say — unset the
switch, and pushes go back to running `check` only:

```bash
gh variable delete SITE_DEPLOY_ENABLED --repo bigtaoo/goodgoodstudy
```

### Turning CI on

**Already on** — both secrets and `SITE_DEPLOY_ENABLED` are set on
`bigtaoo/goodgoodstudy` as of 2026-09-03. This is here for rotating the token
or setting up another repo. Both on `bigtaoo/goodgoodstudy`:

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

### The apex, and how it was taken over

Done on 2026-09-03. Kept because the hostname layout is not guessable from the
code, and because two of the failures on the way are the kind that look like
something else entirely.

| Host | Serves | Where it is configured |
|---|---|---|
| `gamestao.com` | this site | `wrangler/site.jsonc`, Worker `gamestao-site` |
| `www.gamestao.com` | this site, same content — **not** a redirect | same |
| `c.gamestao.com` | SumQuest | `bigtaoo/PIXIJSGAME`, `wrangler/client.jsonc` |
| `sumquest.gamestao.com` | SumQuest, brand host for store listings | same |
| `a.` / `nivara.gamestao.com` | Nivara | `bigtaoo/funny` |
| `b.gamestao.com` | DayDayUp | `bigtaoo/daydayup` |

Cloudflare writes and owns the DNS record for every one of these — each is a
Worker custom domain, proxied, with a certificate Cloudflare issues. Never
hand-add an A or CNAME for a hostname that appears in a `routes` list.

**What made the order awkward, and why it no longer applies.** SumQuest used to
serve *only* from `gamestao.com` on GitHub Pages, and Pages allows exactly one
custom domain per repo — so freeing the apex would have taken the game offline
in the same act. It was moved to Cloudflare first (`c.` and `sumquest.`,
verified playable in a browser), which turned the apex changeover into a
cosmetic outage: nothing a player uses depended on it.

Then: delete the four GitHub Pages A records (`185.199.108-111.153`) from
Cloudflare DNS, push the uncommented apex routes, and release the domain on the
Pages side afterwards (`gh api -X PUT repos/bigtaoo/PIXIJSGAME/pages -f
cname=""`). Releasing Pages *last* matters — doing it first would have left the
A records pointing at a GitHub that no longer recognised the host, breaking the
apex earlier than necessary for no gain, since Cloudflare never consults
GitHub's config.

#### Two failures that lie about their cause

**A record conflict fails the whole deploy, not just that route.** Pushing the
apex routes before the A records were actually deleted produced:

```
Hostname 'gamestao.com' already has externally managed DNS records (A, CNAME,
etc). Delete them first or try a different hostname. [code: 100117]
```

The custom domains go up in one batched API call, so that conflict rejected
`www` and `studio` with it and nothing changed — the apex kept serving from
Pages throughout. But wrangler also prints `Successful trigger changes were not
rolled back`, so a partial failure is possible in principle: after a failed
deploy, check what actually resolves rather than assuming the state is clean.

**A stale negative DNS cache is indistinguishable from a failed deploy.** This
zone's SOA TTL is 1800s, so any resolver that asks for a hostname *before* the
record exists caches the NXDOMAIN for up to 30 minutes. A new custom domain
takes a few minutes to provision, so querying it in that window poisons your
own resolver — and a browser then shows `DNS_PROBE_FINISHED_NXDOMAIN` long after
the deploy succeeded. It happened twice here, both times self-inflicted by
checking too eagerly, and once the resolver holding it was the router rather
than the machine, where `ipconfig /flushdns` is no help.

So: after claiming a hostname, do not visit it until CI's smoke step has passed.
To check without poisoning anything, bypass the local resolver:

```bash
nslookup gamestao.com 1.1.1.1
```

```bash
curl -sI --resolve gamestao.com:443:104.21.75.158 https://gamestao.com/
```

#### Still worth doing

- **`www` does not redirect — deliberately, for now.** It serves the same pages
  from the same Worker, so every page has two URLs. Every canonical tag names
  the apex (`ORIGIN` in `src/lib/routes.ts`), so crawlers consolidate on it:
  this is SEO-safe rather than ideal, and nothing is bleeding while it stays
  this way. A real 301 is three steps that must happen in this order, and `www`
  is down between the first and the last — which is why it is its own change
  and not a takeover afterthought.

  1. **Drop the `www` route** from the `routes` list in `wrangler/site.jsonc`
     and deploy. Cloudflare deletes the custom domain *and* the proxied record
     it wrote for it, so `www` goes NXDOMAIN here. Do this from the repo, not
     from **Workers & Pages → gamestao-site → Domains & Routes**: removing the
     custom domain in the dashboard while the route is still in the config
     means the next deploy re-creates it, collides with the placeholder record
     added in step 2, and fails the whole deploy with `code: 100117` — the same
     failure as the apex takeover, and it takes the apex down with it.
  2. **Add the placeholder record.** **DNS → Records → Add record**: type
     `AAAA`, name `www`, address `100::`, **proxied**. That is the discard
     prefix, so it never receives traffic; its only job is to get `www` into
     Cloudflare's edge so a rule can match it. Same trick as `privacy` and
     `support` on this zone. `www` now resolves but has no route behind it, so
     it answers with an edge error until step 3 lands.
  3. **Add the Redirect Rule.** **Rules → Redirect Rules → Create rule**, with
     a dynamic redirect: match `http.host eq "www.gamestao.com"`, expression
     `concat("https://gamestao.com", http.request.uri.path)`, status **301**,
     **preserve query string** on. Dynamic redirects run at the edge ahead of
     the Worker, so the response never reaches this site's code.

  Nothing in `src/` changes: the canonicals, `hreflang` alternates, sitemap and
  `robots.txt` already name the apex and would be unchanged by the redirect.
  Two cautions. The window in the middle is not seconds — a new record still
  takes a few minutes to provision, and **the 1800s negative-cache trap above
  applies to `www` exactly as it did to the apex**, so do not check it from a
  browser between steps; use `nslookup www.gamestao.com 1.1.1.1`. And before
  starting, confirm nothing outward-facing still points at `www` — a 301 is
  fine for crawlers and browsers, but a shipped client following a hardcoded
  `www` URL is a different question.
- **`studio.gamestao.com`'s certificate.** The route is gone, so Cloudflare has
  removed its DNS record, but removing a custom domain does **not** delete the
  certificate it issued. That one has to go by hand from **SSL/TLS → Edge
  Certificates**.
- **Store and portal links.** CrazyGames, itch.io, the App Store listing and
  social bios that point at `gamestao.com` now land on this site rather than the
  game. Point them at `sumquest.gamestao.com` rather than `c.gamestao.com` —
  same Worker, but one of the two is legible in a listing. While in the itch.io
  dashboard, grab the page URL and put it in `src/data/games.ts`; that platform
  reads `soon` only because no file in any repo records the slug.
- **The mobile hot-update host moved.** Shipped iOS and Android builds fetch
  their payload from `gamestao.com/mobile/latest/`, which is now this site and
  answers 404. It lives at `c.gamestao.com/mobile/latest/`. The plan is a forced
  update rather than a redirect.

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

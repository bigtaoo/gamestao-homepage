# gamestao.com

The studio site for [gamestao](https://gamestao.com) — one page per game, a
press kit, the studio's own privacy notice and terms, and an about and contact
section, in eleven languages.

React + TypeScript, **prerendered at build time** into 154 static documents and
served from Cloudflare Workers static assets. No server runs at request time.

| | |
|---|---|
| Games | Ten, listed in [src/data/games.ts](src/data/games.ts) — all ten live on the zone, each publishing from its own repository's CI |
| Languages | en · zh · de · fr · it · nl · es · pt · ja · ko · ru |
| Pages built | 11 locales x (home + press + privacy + terms + 10 game pages) = 154, plus `404.html` |
| Contact | `support@gamestao.com` (players) · `contact@gamestao.com` (publishing, investment, press) |
| Hosting | Cloudflare Worker `gamestao-site`, zone `gamestao.com` |

This file covers the code: how to run it, where things live, how to change
them. The operational side is next door, one file per thing you would go
looking for.

| | |
|---|---|
| [docs/assets.md](docs/assets.md) | Game art and the press kit — importing real art, the stand-in generator, what is real today |
| [docs/deploy.md](docs/deploy.md) | The CI pipeline, the deploy switch, the shared Cloudflare token, deploying by hand |
| [docs/dns.md](docs/dns.md) | Which hostname serves what, how the apex was taken over, and two failures that lie about their cause |
| [docs/todo.md](docs/todo.md) | What is still unfinished on the zone and in the store listings |

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
npm run build      # client bundle -> SSR renderer -> 154 pages into dist/
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
  data/games.ts        The ten games: names, accent colours, platform links,
                       and the two contact addresses.
  data/press.ts        The press kit's downloads, read from the manifest below.
  data/legal/          The privacy notice and terms, one file per locale. Read
                       by entry-server.tsx alone, so eleven languages of legal
                       text never enter the client bundle — see its types.ts.
  data/press-assets.json  GENERATED. Every press download: kind, size, bytes.
  data/asset-sizes.json  GENERATED. Intrinsic size of every committed image.
  data/assetSizes.ts   Reads that file; throws rather than render an image
                       without a reserved box.
  data/asset-provenance.json  GENERATED. Which art is real, so the generator
                       will not overwrite it.
  i18n/types.ts        The copy contract. Every locale file is checked against it.
  i18n/index.ts        The eleven bundles, each typed against that contract.
  i18n/locales/*.json  Eleven files, one per language.
  pages/, components/  The UI.
  entry-server.tsx     Renders a route to HTML. The build-time surface; also what
                       the tests import.
  main.tsx             Hydrates in the browser.
  dev.tsx              Stands in for the prerenderer under `vite dev`, where there
                       is no prerendered markup to hydrate. Dev builds only.
scripts/
  prerender.mjs        Shell + renderer -> dist/**/index.html, 404.html, sitemap.xml
  placeholders.mjs     Generates brand marks and stand-in game artwork
  import-shots.mjs     Imports a game's real icon, cover and screenshots
  import-press.mjs     Imports the full-resolution press-kit downloads
  smoke.mjs            Checks a live host rather than a build; see docs/deploy.md
  lib/asset-sizes.mjs  Shared image bookkeeping for the two generators above
test/
  locales.test.mjs     The eleven locale files against each other
  site.test.mjs        Route space, head invariants, and the press kit against
                       the same entry point the build renders
wrangler/site.jsonc       Cloudflare Worker config
.github/workflows/ci.yml  The whole pipeline; see docs/deploy.md
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
an endonym in `LOCALE_NAMES`, a locale file, and a file in `src/data/legal/`.
The build picks it up and emits sixteen more pages; `npm run typecheck` names both
files it still needs.

**Artwork and the press kit** have a runbook of their own, because importing
real art is a command with paths into another game's checkout rather than an
edit in here: [docs/assets.md](docs/assets.md).

## Notes worth knowing

- **The accent colours are not decorative choices.** Every one is read off the
  game's own art — a store icon, a locked palette document, a logo, a deployed
  stylesheet's `--accent` — and lifted only as far as it must be to clear 4.5:1
  as small text and as a button background. `src/data/games.ts` records the
  source and the rejected candidate for each. With ten cards the old rule of
  keeping every hue 54 degrees from every other one no longer fits in a circle,
  so it was dropped rather than faked: Holy Kicker and Dummy Brawl share a hue
  and separate on saturation, as do Brushblade and Hexfront Rush. Neither pair
  is adjacent in `GAME_IDS`, which is the order the cards are laid out in.
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
- **The legal pages are about this site, and only this site.** They used to be
  the Nivara client's, linked from the footer as though one policy set covered
  the studio. It described accounts, purchases, matchmaking and chat — a fair
  description of a game, and a wrong one for a brochure that takes no input at
  all. Since 2026-09-15 this site serves its own privacy notice and terms from
  `src/data/legal/`, and every game keeps its own set, linked from the game.

  There is no refund policy here: nothing is sold on this site, and a document
  about a transaction that cannot happen is a liability rather than a courtesy.

  Every factual claim in the privacy notice is checkable against this repo — no
  cookies, no analytics, no third-party requests, one `localStorage` key — which
  is why it names `gamestao.lang` outright and why a test asserts that all
  eleven translations still do. The zone used to carry `privacy.` and `support.`
  hostnames for store forms; both were deleted on 2026-09-15
  ([docs/dns.md](docs/dns.md)).
- **`404.html` is not one of the routes.** It has no URL of its own, carries
  `noindex`, is absent from the sitemap, and deliberately omits the language
  redirect — bouncing a mistyped URL to a localised home page would hide the
  error rather than report it.

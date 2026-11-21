# Still worth doing

Open work on the zone and in the store listings. None of it is a code change in
this repo — each item is a Cloudflare panel edit, a store form, or a decision
that belongs to someone with a login. Kept here so none of it is rediscovered
the hard way.

## SumQuest's store listing still points at Nivara's policy

Settled for this site on 2026-09-15: the studio site serves its own privacy
notice and terms, about itself, and each game keeps its own set. That is a code
change and it is done — `/privacy/` and `/terms/`, eleven languages each.

What is not done is outside this repo. Nivara's documents are the only ones that
actually exist: `nivara.gamestao.com/privacy`, `/terms`, `/refunds` and
`/support` (200, zero redirects, verified 2026-09-15), and they are titled
*"Privacy Policy — Nivara"*. SumQuest is published, and whatever URL went into
its App Store submission points at one of two things — a hostname that was
deleted, or a document with another game's name at the top. Someone doing
diligence on the studio follows that link.

Two ways out, and they are not the same amount of work. The store listings could
point at this site's `/privacy/` and `/terms/`, which are studio-level and
honest about covering the website — but they do not describe a game with
accounts and purchases, so they are the wrong document for a store form. Or
SumQuest gets its own pair, the way Nivara has, served by its own client. The
second is right; the first is not a shortcut to it.

## Store and portal links

CrazyGames, itch.io, the App Store listing and social bios that point at
`gamestao.com` now land on this site rather than the game. Point them at
`sumquest.gamestao.com` rather than `c.gamestao.com` — same Worker, but one of
the two is legible in a listing, and this site's own play link now uses it for
the same reason.

While in the itch.io dashboard, grab the page URL and put it in
`src/data/games.ts`; that platform reads `soon` only because no file in any repo
records the slug — searched across this repo and every game checkout on this
machine, there is no itch URL anywhere to copy. CrazyGames and iOS read
`soon` correctly: both are genuinely still in review (`D:\number\docs\distribution.md`).

## Six games are still showing generated stand-in art

Blightbloom, Brushblade, Swarm Orbit, Sudoku and Pata have no importable store
art at all, and Potion Siege has only its app icon — the rest of its
`art/shots/` is backdrop plates and sprite renders rather than captured play.
Their cards and galleries are the accent-coloured stand-ins the generator
makes, which is honest (`asset-provenance.json` records it, and the press page
says the kit is not published) but it is the weakest thing on the site.

The fix is to run each game and capture real screenshots, then
`import-shots.mjs` and `import-press.mjs` with the same scenes in the same
order. Sudoku and Pata additionally have no checkout on this machine; they
would have to be cloned from `bigtaoo/sudoku` and `bigtaoo/e.gamestao` first.

## The mobile hot-update channel: fixed at HEAD, stale in installed builds

This entry used to say shipped builds fetch from `gamestao.com/mobile/latest/`
and get a 404. Both halves were wrong. SumQuest's client hardcodes
`bigtaoo.github.io/PIXIJSGAME/mobile/latest/manifest.json`, and that URL still
answers **200** — GitHub Pages stays enabled for the repo after `cname=""`
releases the custom domain. But the Pages *pipeline* was retired
(`bigtaoo/PIXIJSGAME@55fbe03`), so the tree behind it is frozen at the build
before it while releases go to Cloudflare. Every installed app kept polling a
manifest that could never change again: no error, no log, nothing to notice.

Fixed in `bigtaoo/PIXIJSGAME@fbef34a` — the constant now points at
`c.gamestao.com/mobile/latest/manifest.json`, and because Pages sent
`Access-Control-Allow-Origin: *` implicitly while Workers static assets sends no
CORS headers at all, the deploy also stages a `_headers` file and *verifies the
served header*: the fetch is cross-origin from the Capacitor WebView through
plain `fetch`, so a 200 on the manifest was never proof the app could read it.

What remains is that the URL is baked into the native bundle, so only a build
compiled after that commit is fixed — anything already installed, and the binary
in App Store review, still points at the frozen host. The installed base is near
zero today (iOS in review, Android without a keystore), which is the entire
reason to do it now. If it ever isn't, the escape hatch is to publish one last
hot-update *through the old channel* carrying the new URL, so installed apps
migrate themselves — Pages is still enabled on that repo, just no longer built
by a workflow.

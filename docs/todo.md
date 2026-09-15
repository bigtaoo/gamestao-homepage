# Still worth doing

Open work on the zone and in the store listings. None of it is a code change in
this repo — each item is a Cloudflare panel edit, a store form, or a decision
that belongs to someone with a login. Kept here so none of it is rediscovered
the hard way.

## The legal pages wear one game's branding

The studio has one privacy policy, one ToS and one refund policy, and they are
served by the Nivara client: `nivara.gamestao.com/privacy`, `/terms`, `/refunds`
and `/support` (200, zero redirects, verified 2026-09-15). Every store listing
and every footer on this site points at them.

They are titled *"Privacy Policy — Nivara"*. So someone following SumQuest's
privacy link — an App Store reviewer, a publisher doing diligence — lands on
another game's branding and has to work out whether they are still looking at
the right company. Nothing is broken; it just reads as sloppier than the studio
is. A studio-branded set, served from this site rather than from a game client,
is the real answer, and it is a decision about where the canonical policy lives
rather than a panel edit.

## `studio.gamestao.com`'s certificate

The route is gone, so Cloudflare has removed its DNS record, but removing a
custom domain does **not** delete the certificate it issued. That one has to go
by hand from **SSL/TLS → Edge Certificates**.

## Store and portal links

CrazyGames, itch.io, the App Store listing and social bios that point at
`gamestao.com` now land on this site rather than the game. Point them at
`sumquest.gamestao.com` rather than `c.gamestao.com` — same Worker, but one of
the two is legible in a listing, and this site's own play link now uses it for
the same reason.

While in the itch.io dashboard, grab the page URL and put it in
`src/data/games.ts`; that platform reads `soon` only because no file in any repo
records the slug — searched across this repo and all three game repos, there is
no itch URL anywhere to copy. CrazyGames and iOS read `soon` correctly: both are
genuinely still in review (`D:\number\docs\distribution.md`).

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

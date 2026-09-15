# Still worth doing

Open work on the zone and in the store listings. None of it is a code change in
this repo — each item is a Cloudflare panel edit, a store form, or a decision
that belongs to someone with a login. Kept here so none of it is rediscovered
the hard way.

## `contact@gamestao.com` needs a routing rule before anyone writes to it

The site prints that address on every page footer, in the home page's contact
block and at the top of `/press/`. The zone's MX records point at Cloudflare
Email Routing (`route1-3.mx.cloudflare.net`, verified 2026-09-15), so the
mechanism is there — but whether this particular address has a destination is
only visible from the dashboard, and an unrouted address bounces rather than
failing quietly.

**Email → Email Routing → Routing rules**: add `contact@gamestao.com` with the
same destination as `support@`, or a different one if business mail should land
elsewhere. Then send one test message to it from an outside account and confirm
it arrives — a rule that exists and a rule that delivers are not the same thing.

## `privacy.gamestao.com` and `support.gamestao.com` are dead ends

Both are proxied placeholders with a Redirect Rule, and both 301 to
`bigtaoo.github.io/legal/sumquest/…`, which returns GitHub's *Site not found*:
`bigtaoo/legal` is private and has never had Pages enabled (`has_pages: false`).
Nothing in any repo links to these two hostnames, which is the tell — they exist
because they were typed into a store submission form by hand. That matters right
now: SumQuest's iOS build is in review, and App Store Connect's privacy-policy
and support URLs are fields a human reviewer opens.

Working equivalents are already live at `nivara.gamestao.com/privacy`, `/terms`,
`/refunds` and `/support` (200, verified 2026-09-03). The DNS side needs no work
— the `AAAA 100::` placeholders are already there — so this is one panel edit
each:

1. **Rules → Redirect Rules**, open the rule matching `privacy.gamestao.com`.
   Change the target URL to `https://nivara.gamestao.com/privacy`, keep 301.
2. Same for the `support.gamestao.com` rule → `https://nivara.gamestao.com/support`.
3. Confirm both end at a 200 rather than another redirect:

```bash
curl -sSL -o /dev/null -w '%{http_code} %{url_effective}\n' https://privacy.gamestao.com/
```

One thing to weigh rather than fix blindly: those pages are titled *"Privacy
Policy — Nivara"*. They are the studio's single policy set, but a reviewer
following SumQuest's privacy link lands on another game's branding. Pointing the
hostnames at working documents is strictly better than pointing them at a 404
today; a studio-branded set is the real answer.

## `www` does not redirect — deliberately, for now

It serves the same pages from the same Worker, so every page has two URLs. Every
canonical tag names the apex (`ORIGIN` in `src/lib/routes.ts`), so crawlers
consolidate on it: this is SEO-safe rather than ideal, and nothing is bleeding
while it stays this way. A real 301 is three steps that must happen in this
order, and `www` is down between the first and the last — which is why it is its
own change and not a takeover afterthought.

1. **Drop the `www` route** from the `routes` list in `wrangler/site.jsonc` and
   deploy. Cloudflare deletes the custom domain *and* the proxied record it
   wrote for it, so `www` goes NXDOMAIN here. Do this from the repo, not from
   **Workers & Pages → gamestao-site → Domains & Routes**: removing the custom
   domain in the dashboard while the route is still in the config means the next
   deploy re-creates it, collides with the placeholder record added in step 2,
   and fails the whole deploy with `code: 100117` — the same failure as the apex
   takeover, and it takes the apex down with it.
2. **Add the placeholder record.** **DNS → Records → Add record**: type `AAAA`,
   name `www`, address `100::`, **proxied**. That is the discard prefix, so it
   never receives traffic; its only job is to get `www` into Cloudflare's edge so
   a rule can match it. Same trick as `privacy` and `support` on this zone. `www`
   now resolves but has no route behind it, so it answers with an edge error
   until step 3 lands.
3. **Add the Redirect Rule.** **Rules → Redirect Rules → Create rule**, with a
   dynamic redirect: match `http.host eq "www.gamestao.com"`, expression
   `concat("https://gamestao.com", http.request.uri.path)`, status **301**,
   **preserve query string** on. Dynamic redirects run at the edge ahead of the
   Worker, so the response never reaches this site's code.

Nothing in `src/` changes: the canonicals, `hreflang` alternates, sitemap and
`robots.txt` already name the apex and would be unchanged by the redirect.

Two cautions. The window in the middle is not seconds — a new record still takes
a few minutes to provision, and **the 1800s negative-cache trap applies to `www`
exactly as it did to the apex** ([dns.md](dns.md)), so do not check it from a
browser between steps; use `nslookup www.gamestao.com 1.1.1.1`. And before
starting, confirm nothing outward-facing still points at `www` — a 301 is fine
for crawlers and browsers, but a shipped client following a hardcoded `www` URL
is a different question.

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

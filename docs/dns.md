# The zone: who serves what, and how the apex was taken over

The apex changeover was done on 2026-09-03. This is kept because the hostname
layout is not guessable from the code, and because two of the failures on the
way are the kind that look like something else entirely.

## Hostnames

| Host | Serves | Where it is configured |
|---|---|---|
| `gamestao.com` | this site | `wrangler/site.jsonc`, Worker `gamestao-site` |
| `www.gamestao.com` | 301 to the apex, nothing else | Redirect Rule + an `AAAA 100::` placeholder, both in the panel |
| `c.gamestao.com` | SumQuest | `bigtaoo/PIXIJSGAME`, `wrangler/client.jsonc` |
| `sumquest.gamestao.com` | SumQuest, brand host for store listings | same |
| `a.` / `nivara.gamestao.com` | Nivara | `bigtaoo/funny` |
| `b.gamestao.com` | Blightbloom | `bigtaoo/blightbloom` |
| `p.gamestao.com` | Potion Siege | `bigtaoo/potion-siege` |
| `h.gamestao.com` | Holy Kicker | `bigtaoo/holy-kicker` |
| `f.gamestao.com` | Brushblade | `bigtaoo/fight` |
| `s.gamestao.com` | Sudoku | `bigtaoo/sudoku` |
| `e.gamestao.com` | Pata | `bigtaoo/e.gamestao` |
| `tidehook.gamestao.com` | Tidehook | `bigtaoo/Tidehook`, pending its first `deploy-web` |
| `swarmorbit.gamestao.com` | Swarm Orbit | `bigtaoo/fruit-fort`, pending its first `deploy-web` |
| `dummybrawl.gamestao.com` | Dummy Brawl | `bigtaoo/moto`, pending its first `deploy-web` |
| `hexfront.gamestao.com` | Hexfront Rush | `bigtaoo/hexfront-rush`, pending its first `deploy-web` |

The repository name is not the game name in six of these: `funny` is Nivara,
`PIXIJSGAME` is SumQuest, `blightbloom` was `daydayup` until the rename,
`fight` is Brushblade, `fruit-fort` is Swarm Orbit, `moto` is Dummy Brawl. The
Worker names, save keys and bundle ids inside those repositories still carry
the old codename on purpose — renaming them would strand live players' saves.

The last four hosts do not exist yet. Each is written into its repository's
`wrangler/web.jsonc` as a custom domain, and Cloudflare creates the record and
the certificate the first time that repository's `deploy-web` job runs, which
needs `WEB_DEPLOY_ENABLED=true` and the two Cloudflare secrets set there.
Single-level names on purpose: free Universal SSL covers one level only, so
`hexfront.gamestao.com` is certificated and `hexfront.rush.gamestao.com` would
not be.

Cloudflare writes and owns the DNS record for every one of these except `www` —
each of the rest is a Worker custom domain, proxied, with a certificate
Cloudflare issues. Never hand-add an A or CNAME for a hostname that appears in a
`routes` list. `www` is the opposite case: it is a hand-added placeholder
*because* it is no longer in any `routes` list, and putting it back in one would
collide with that record and fail the deploy.

### The `www` redirect, written down because it lives in the panel

Done 2026-09-15. Nothing in this repo produces it, so this is the only copy —
if the rule is ever deleted or edited into uselessness, restore it from here.
**Rules → Overview**, the *Redirect Rules* card (the sidebar has no entry of
its own for it, which is why searching for one lands on Page Rules instead):

| | |
|---|---|
| Name | `www.gamestao.com` |
| If | **Custom filter expression**, `http.host eq "www.gamestao.com"` |
| Then | URL redirect, type **Dynamic** |
| Expression | `concat("https://gamestao.com", http.request.uri.path)` |
| Status | **301** |
| Preserve query string | on |

The two traps, both of which accept what you type without complaining. The
match is **Custom filter expression**, not **Wildcard pattern** — paste the
expression into the wildcard builder and it becomes a literal string that no
request can ever equal, so the rule sits there Active and never fires. And a
**Static** redirect would drop the path, sending `www…/zh/press/` to the apex
home page; only **Dynamic** with that `concat` carries the path across.

Verified end to end: `/` and deep paths 301 with the path intact, the query
string survives, HTTP on port 80 lands on HTTPS apex in a single hop, and every
redirect ends at a 200 rather than another redirect.

### Certificates clean themselves up

Each Worker custom domain gets its own **Advanced (Managed)** certificate,
covering that hostname plus a wildcard below it and the apex — one row per
hostname under **SSL/TLS → Edge Certificates**, alongside the zone's Universal
certificate and its backup.

This file used to warn that removing a custom domain leaves its certificate
behind to be deleted by hand. That is wrong, and it was carried as a to-do for
twelve days on nothing but the assumption. Checked on 2026-09-15, after
`studio.gamestao.com` had been gone for a fortnight: sixteen certificates on
the zone and not one of them mentions that hostname. Cloudflare took it with
the custom domain. Nothing to do here, for `studio` or for `www`.

Free Universal SSL covers the apex and **one** level of subdomain, so every
subdomain on this zone must stay single-level (`c.gamestao.com`, never
`a.b.gamestao.com`). The per-hostname Advanced certificates do not change that
rule — they are issued for hostnames that already satisfy it.

`privacy.` and `support.` used to exist here too — proxied `AAAA 100::`
placeholders with a Redirect Rule each, 301ing to `bigtaoo.github.io/legal/…`,
which had returned GitHub's *Site not found* since `bigtaoo/legal` was made
private. They were never referenced by any code in any repo; they existed
because someone typed them into SumQuest's App Store submission by hand, which
is why nothing broke visibly when their target died. **Both were deleted on
2026-09-15**, once that review finished: the two Redirect Rules first, then the
two DNS records. The studio's legal pages live at `nivara.gamestao.com/privacy`,
`/terms`, `/refunds` and `/support`, and store listings should name those.

Deleting the rule without the record is a state worth recognising, because the
symptom does not name its cause: the hostname still resolves, the request
reaches a proxied record pointing at the discard prefix, and Cloudflare answers
**522** — which reads as "the site is down" rather than "this hostname was
retired". Both halves go, or neither.

## How the apex was taken over

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

## Two failures that lie about their cause

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

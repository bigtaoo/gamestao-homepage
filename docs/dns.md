# The zone: who serves what, and how the apex was taken over

The apex changeover was done on 2026-09-03. This is kept because the hostname
layout is not guessable from the code, and because two of the failures on the
way are the kind that look like something else entirely.

## Hostnames

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

Free Universal SSL covers the apex and **one** level of subdomain, so every
subdomain on this zone must stay single-level (`c.gamestao.com`, never
`a.b.gamestao.com`).

`privacy.` and `support.` also exist on the zone, as redirect rules rather than
Workers, and they currently point at nothing: see [todo.md](todo.md).

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

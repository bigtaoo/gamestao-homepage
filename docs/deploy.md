# Deploying

`.github/workflows/ci.yml` is the whole pipeline: a `check` job (typecheck,
tests, full build) that runs on every push and pull request, and a `deploy` job
that `needs: check` and ships `dist/` to Cloudflare. So a red gate cannot
publish, and a push is verified even while publishing is switched off.

**The site is live at `https://gamestao.com`** as of 2026-09-03 — Worker
`gamestao-site`, on the apex alone since 2026-09-15, when `www` became a 301
([dns.md](dns.md)). Every push to `main` that touches anything but `README.md`
and `docs/` builds it and publishes it.

A run can take a couple of minutes to appear after the push. It is queued, not
missing — do not conclude the trigger is broken and dispatch a second one, which
is how `3fffe81` ended up deployed twice.

What still stands between a bad commit and a bad live page is the pipeline, not
a switch: `deploy` needs `check`, so a failing typecheck, a failing locale test
or a broken prerender stops the deploy rather than shipping. After the deploy,
`npm run smoke` re-checks the live host and fails the run if the apex stopped
answering, `/de/` stopped rendering German, a wrong path stopped being a 404 or
the sitemap lost pages.

**It retries for 90 seconds before calling any of that a failure**, because a
deploy does not land everywhere at once. On 2026-09-15 the run for `8284fd0`
went red on `sitemap urls: 55 (expected 77)` thirty seconds after a deploy that
had worked: the assets were up, the edge was still handing out the previous
sitemap, and a manual `npm run smoke` a few minutes later passed. The deploy
step is not what failed there — the check was, by measuring the edge's timing
instead of the deploy. A deploy that genuinely ships the wrong thing still goes
red; it takes a minute and a half to say so.

To stop publishing without touching the code — while debugging, say — unset the
switch, and pushes go back to running `check` only:

```bash
gh variable delete SITE_DEPLOY_ENABLED --repo bigtaoo/gamestao-homepage
```

## Turning CI on

**Already on** — both secrets and `SITE_DEPLOY_ENABLED` are set on
`bigtaoo/gamestao-homepage` as of 2026-09-03. This is here for rotating the
token or setting up another repo. Both on `bigtaoo/gamestao-homepage`:

The repo was renamed from `goodgoodstudy` on 2026-09-15; the local checkout is
still in `D:\goodgoodstudy`. GitHub redirects the old name, so a push or a `gh`
command against it keeps working and gives no reason to notice the difference —
which is why the name is worth getting right here rather than rediscovering.

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID --repo bigtaoo/gamestao-homepage
```

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo bigtaoo/gamestao-homepage
```

```bash
gh variable set SITE_DEPLOY_ENABLED --body true --repo bigtaoo/gamestao-homepage
```

In that order — the variable is the switch, and the next push after it flips
deploys for real. `gh secret set` prompts for the value on stdin, so the token
is never typed into a shell history or a file. The account is
`tao.wang.go@gmail.com`, account id `e64b61f1629ebcc49ee9b6eea2a95b82`.

### The API token

GitHub cannot read a secret back out, so the value cannot be lifted off
`bigtaoo/blightbloom` even though the same two secrets are already set there.
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

### Checking what landed

```bash
gh variable list --repo bigtaoo/gamestao-homepage
```

```bash
gh secret list --repo bigtaoo/gamestao-homepage
```

With `SITE_DEPLOY_ENABLED` unset, a push runs `check` alone and publishes
nothing — which is what the first push to this repo did, before the switch went
on. Watch a run either way:

```bash
gh run watch --repo bigtaoo/gamestao-homepage
```

## Deploying by hand

Needs a locally authenticated wrangler (browser OAuth; credentials land in
`%APPDATA%\xdg.config\.wrangler\config` — as of 2026-09-15 this machine still
has none, so every deploy so far has come from CI):

```bash
npx -y wrangler@4.128.0 login
```

```bash
npm run deploy
```

The `deploy` script and CI pin the same wrangler version, so a wrangler release
cannot change what a deploy does without a commit here. Bump the two together.

## The game repositories' own `deploy-web`

This repository publishes the studio site. Each game publishes itself, from its
own repository, with a `deploy-web` job that follows the same shape as the one
here: it `needs: [check, smoke]`, it is gated on
`vars.WEB_DEPLOY_ENABLED == 'true' && github.event_name != 'pull_request' &&
github.ref == 'refs/heads/main'`, it re-checks that the commit is still main's
tip before it ships, it runs `wrangler deploy -c wrangler/web.jsonc`, and it
then curls the public host in a retry loop so a green run means the outside
world really saw the new build.

Four repositories got that job for the first time with this change, each with
its hostname written into `wrangler/web.jsonc` as a custom domain:

| Repository | Game | Host it will provision |
|---|---|---|
| `bigtaoo/Tidehook` | Tidehook | `tidehook.gamestao.com` |
| `bigtaoo/fruit-fort` | Swarm Orbit | `swarmorbit.gamestao.com` |
| `bigtaoo/moto` | Dummy Brawl | `dummybrawl.gamestao.com` |
| `bigtaoo/hexfront-rush` | Hexfront Rush | `hexfront.gamestao.com` |

Nothing deploys until each of those has the two Cloudflare secrets and the
switch, which is three commands per repository:

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo bigtaoo/Tidehook
```

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID --repo bigtaoo/Tidehook
```

```bash
gh variable set WEB_DEPLOY_ENABLED --body true --repo bigtaoo/Tidehook
```

Until the variable is set the job is skipped and CI stays green, so the job can
be merged long before anyone is ready to publish. The site already lists all
four games with their web link marked *soon*; flipping the switch and letting
one run finish is what makes that link real, and the link in
`src/data/games.ts` has to be changed from `status: 'soon'` to a `'live'` entry
with the URL in the same pass.

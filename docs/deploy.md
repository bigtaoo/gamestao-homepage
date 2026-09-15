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
gh variable delete SITE_DEPLOY_ENABLED --repo bigtaoo/goodgoodstudy
```

## Turning CI on

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

### The API token

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

### Checking what landed

```bash
gh variable list --repo bigtaoo/goodgoodstudy
```

```bash
gh secret list --repo bigtaoo/goodgoodstudy
```

With `SITE_DEPLOY_ENABLED` unset, a push runs `check` alone and publishes
nothing — which is what the first push to this repo did, before the switch went
on. Watch a run either way:

```bash
gh run watch --repo bigtaoo/goodgoodstudy
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

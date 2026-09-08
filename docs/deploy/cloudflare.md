# Deploying PlayVejora to Cloudflare

The site is a Next.js app running on Cloudflare Workers through [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), with registrations in a D1 database. `wrangler.jsonc` and `open-next.config.ts` in the repository root hold the configuration.

## Constraints this runtime puts on the code

The Workers runtime has no filesystem and no process that outlives a request, which rules out two patterns that are normal in Node:

- **Nothing reads from disk at request time.** The waiver lives in `content/waiver.ts` and the version in `/version.info` comes from an imported `package.json`, because a `readFileSync` in a Worker fails with `ENOENT` on a path that does not exist.
- **Schema changes go in `migrations/`.** There is no connection hook to create tables on, so a table that is not in a migration does not exist in production.

D1 also has no interactive transactions. The league cap is enforced inside a single `INSERT ... RETURNING` whose `CASE` counts the places already taken, so two captains registering at the same moment cannot both take the fifth place.

## First deploy

```bash
npx wrangler login

# Creates the database and prints its ID.
npx wrangler d1 create playvejora
```

Copy the printed `database_id` into `wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`, then create the schema and the organizer password:

```bash
npm run cf:migrate
npx wrangler secret put ADMIN_PASSWORD
# Optional until you want signup mail. Signup still works without it.
npx wrangler secret put RESEND_API_KEY

npm run deploy
```

The live Worker is `https://playvejora.playvejora.workers.dev`. Confirm a release with `/version.info`, which returns the name and version from `package.json` with no caching.

Schema changes still need `npm run cf:migrate` before the code that uses them ships. Migration `0003` adds competitions and public team ids. `0004` adds listed competitions. `0005` adds match results and drops the unused leaderboard table.

## Domain

Workers custom domains only attach to a hostname inside a Cloudflare zone this account owns. `playvejora.dpdns.org` fails that test: the zone is `dpdns.org`, which belongs to FreeDomain, and Cloudflare's free plan cannot take a child hostname as its own zone. A CNAME from FreeDomain to `playvejora.playvejora.workers.dev` also fails, because the TLS certificate is for `*.playvejora.workers.dev`, not `playvejora.dpdns.org`.

Until a domain this account can add to Cloudflare exists (for example a purchased `playvejora.com`), the public origin is the workers.dev URL. `SITE_URL` in `wrangler.jsonc` matches that so canonical tags and the sitemap do not advertise a hostname that cannot serve the app.

When that domain exists: add it as a zone on the free plan, put `routes = [{ pattern = "<hostname>", custom_domain = true }]` in `wrangler.jsonc`, point `SITE_URL` at it, and deploy.

## Local development

Two loops, and they are not equivalent:

```bash
npm run dev       # Next dev server, D1 binding provided by wrangler
npm run preview   # the real Worker bundle on workerd, closest to production
```

`npm run dev` is faster, but only `npm run preview` runs the code the way Cloudflare will, which is where filesystem and runtime differences show up. Test anything infrastructural on `preview` before deploying.

Local D1 keeps its own copy under `.wrangler/state` and needs the migration applied once:

```bash
npm run cf:migrate:local
```

Put `ADMIN_PASSWORD` in `.dev.vars` (copy `.dev.vars.example`). The Workers runtime always reports production, so the `playvejora-dev` fallback never applies there.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `wrangler secret` / `.dev.vars` | Shared organizer login. Required. Rotate with `npx wrangler secret put ADMIN_PASSWORD`. There is no reset UI. |
| `RESEND_API_KEY` | `wrangler secret` / `.dev.vars` | Optional. Sends the organizer an email after a complete registration. Signup still works if it is missing. |
| `MAIL_FROM` | `wrangler secret` or `vars` / `.dev.vars` | Optional From header. Defaults to `PlayVejora <beth.t@example.com>` until a PlayVejora domain is verified on Resend. |
| `ORGANIZER_EMAIL` | `vars` / `.dev.vars` | Optional inbox. Defaults to `playvejora@gmail.com`. |
| `SITE_URL` | `vars` in `wrangler.jsonc` | Canonical URLs, Open Graph, sitemap. |
| `DB` | `d1_databases` binding | The D1 database. |

`SITE_URL` is plain config rather than a secret, so it stays in `wrangler.jsonc` where a reviewer can see it. `lib/seo.ts` also falls back to the live origin, so a missing value cannot make the sitemap advertise `localhost`.

## Data

Inspect or back up registrations with the D1 CLI:

```bash
npx wrangler d1 execute playvejora --remote --command "SELECT team_name, status FROM teams ORDER BY id"
npx wrangler d1 export playvejora --remote --output backup.sql
```

D1 keeps point-in-time recovery for the last 30 days on the free plan, but take an export before anything destructive.

`teams` is the only table worth backing up. `admin_sessions` and `rate_limit_hits` are operational: clearing them logs organizers out and forgives current limits, and both prune themselves as they are used.

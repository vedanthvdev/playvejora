# PlayVejora extension pattern

v1 is one Next.js App Router app. Public routes have no login. Captains register through `registerTeamAction` → `submitTeam` in `lib/registration.ts`. Intake is SQLite at `data/playvejora.sqlite`. Organizers reach `/admin` only after a shared `ADMIN_PASSWORD` cookie session.

Do not reverse these v1 rules when extending: Edinburgh-only public UI, no participant accounts, no Stripe on the current path, waitlist after five in-league Edinburgh rows, admin not in public nav.

## Seams

- **Routes:** add pages under `app/`. Keep `lib/site-copy.ts` nav limited to public destinations. Origin lives at `/origin` and is in the public nav.
- **SEO:** default metadata, Open Graph, `app/sitemap.ts`, and `app/robots.ts` share `lib/seo.ts`. Set `SITE_URL` in production so canonical URLs and the sitemap are absolute. Do not index `/admin`.
- **Hosted version:** `/version.info` reads `package.json` at request time. Do not cache it. Do not list it in the sitemap.
- **Deployment:** one Fly.io machine with SQLite on a mounted volume, built from the repository `Dockerfile` using Next standalone output. The single-machine constraint comes from the volume, so any feature needing more than one machine needs Postgres first. See `docs/deploy/fly-io.md`.
- **Intake fields:** extend `TeamInput` and the `teams` table in `lib/registration.ts`. Run assignment inside the same write transaction.
- **City:** each row already has `city` defaulting to `edinburgh`. More cities should filter and cap by city. Per-city versus shared waitlist is still to decide.
- **Admin:** reuse `teamsForAdmin` and the cookie in `lib/admin-auth.ts`. Do not list PII on unauthenticated routes.

## Deferred features (do not build in v1)

| Feature | Attach point | Must not break |
| --- | --- | --- |
| Stripe | After waiver, before or after `submitTeam`, with a payment column | R10 today: no payment UI until that work starts |
| Match stats | New tables and a results route | Do not require player logins |
| Photos / awards | New route plus media store | Keep the shell minimal |
| Charity choice | Field on `TeamInput` | No amounts in copy |
| Top scorers | Route that reads stats tables | Photos can wait for assets |
| More cities | `city` column + copy, still no picker until a second city opens | Live UI stays Edinburgh until then |

## Hosting

`better-sqlite3` needs a Node server with a persistent disk. Do not deploy this store to a diskless serverless host without a follow-up database change.

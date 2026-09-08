# PlayVejora

After-work football in Edinburgh. Captains register a team. The first five complete sides are in the league. Later teams join the waitlist.

## Run locally

1. `npm install`
2. `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Organizer list: [http://localhost:3000/admin](http://localhost:3000/admin)

## Organizer password

Under `npm run dev` the login accepts `playvejora-dev` with no configuration. Copy `.env.example` to `.env` and set `ADMIN_PASSWORD` to override it.

The fallback is refused whenever the runtime reports production, which includes the Workers runtime, so `npm run preview` and the deployed site both need a real password. Set it in `.dev.vars` locally (see `.dev.vars.example`) and as a Cloudflare secret in production.

Logging in stores a random session in D1 that expires after twelve hours. The organizer header has a log out button that ends that session, so leaving `/admin` open on a borrowed laptop is recoverable without rotating the password. The same password can be used on more than one device at once; each login gets its own session. Five failed logins from one address pause that address for ten minutes, and one address can submit five registrations an hour.

There is no password-reset page. Change the live password with `npx wrangler secret put ADMIN_PASSWORD` and tell organizers the new value. Existing sessions stay valid until they expire or log out. Locally, put the same name in `.dev.vars` or `.env`.

SQL that touches team data uses bound parameters (`?` plus `.bind`), so a team name or email cannot change the query. Do not concatenate user text into SQL.

A completed registration emails `playvejora@gmail.com` and the captain when `RESEND_API_KEY` is set (`npx wrangler secret put RESEND_API_KEY`). Both messages include the public team reference (`tm_…`). Signup still stores the team if the key is missing or Resend is down. Verify a sending domain on Resend before changing `MAIL_FROM`; until then the default From address is Resend's onboarding sender.

Each registration belongs to a competition (city + sport + season) with its own cap of league teams allowed. Sports are football and volleyball; cities are Edinburgh and Manchester. Organizers add leagues from that list, hide ones that should not take new teams, and post football and volleyball results on their own admin pages. Public stats are per sport. Payment is not collected yet; the schema already has Stripe columns and a `league_paid_waitlist_free` mode for when in-league teams should require payment while the waitlist stays free.

## Versioning

`X.Y.Z` in `package.json`. Merging to `master` runs `.github/workflows/version.yml`, which bumps `Z` and pushes a matching tag. Bump `X` or `Y` yourself when a release deserves it:

```bash
npm version minor --no-git-tag-version
```

Commit that in a normal branch and the next merge continues patching from there.

The running app exposes the same version at `/version.info` as plain text (`name` then a space then `X.Y.Z` from `package.json`), with `Cache-Control: no-store`, so a host check always reflects what is deployed.

## Design

Visual language lives in [`docs/design/playvejora-design-system.md`](docs/design/playvejora-design-system.md). Colour, type, spacing, layout, motion, and mobile composition should be taken from that document and from the CSS tokens in `app/globals.css`. Do not introduce a new reusable colour, type role, or spacing value until it exists in both places.

## Deployment

The site runs on Cloudflare Workers with registrations in D1, currently at `https://playvejora.playvejora.workers.dev`. [`docs/deploy/cloudflare.md`](docs/deploy/cloudflare.md) has the setup, why `playvejora.dpdns.org` cannot be attached yet, and the migration steps.

```bash
npm run preview   # build the Worker and run it locally in workerd with local D1
npm run deploy    # build and deploy to Cloudflare
```

Because the Workers runtime has no filesystem and no long-lived process, two rules apply to anything added here: read nothing from disk at request time, and put every schema change in `migrations/` rather than creating tables on connect.

## Notes

Replace the placeholder in `content/waiver.ts` before a real season. It is placeholder text, not legal advice.

## Scripts

- `npm test` — Vitest
- `npm run build` — Next production build
- `npm run preview` — Worker build, served locally on workerd with local D1
- `npm run deploy` — Worker build and deploy
- `npm run cf:migrate:local` / `npm run cf:migrate` — apply D1 migrations

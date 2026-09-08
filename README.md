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

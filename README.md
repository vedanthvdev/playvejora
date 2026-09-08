# PlayVejora

After-work football in Edinburgh. Captains register a team. The first five complete sides are in the league. Later teams join the waitlist.

## Run locally

1. `npm install`
2. `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Organizer list: [http://localhost:3000/admin](http://localhost:3000/admin)

## Organizer password

Before launch the login accepts `playvejora-dev` with no configuration. Copy `.env.example` to `.env` and set `ADMIN_PASSWORD` to override it; a production build refuses to start the admin gate without one, so the default can never ship.

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

The public origin is `https://playvejora.dpdns.org`. `lib/seo.ts` falls back to that value, so canonical URLs, Open Graph tags, and the sitemap are correct even if the host forgets an environment variable. Set `SITE_URL` anyway on any environment that is not production, otherwise a staging box will advertise the live domain to crawlers.

Registrations live in SQLite at `data/playvejora.sqlite`, so the app needs a host with a persistent disk rather than a diskless serverless platform. The target is a single Fly.io machine in `lhr` with a mounted volume; `Dockerfile` and `fly.toml` describe it and [`docs/deploy/fly-io.md`](docs/deploy/fly-io.md) has the setup, DNS, and backup steps.

A volume cannot be shared between machines, so the app stays on one machine and every deploy uses `--ha=false`. Scaling out means moving to Postgres, not adding machines.

Set `ADMIN_PASSWORD` on the host before the domain is public; the production build refuses the pre-launch fallback. Confirm any release with `curl https://playvejora.dpdns.org/version.info`, which returns the name and version straight from `package.json` with no caching.

## Notes

Replace `content/waiver.md` before a real season. The shipped text is a placeholder, not legal advice.

## Scripts

- `npm test` — Vitest
- `npm run build` — production build

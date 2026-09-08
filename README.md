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

## Design

Visual language lives in [`docs/design/playvejora-design-system.md`](docs/design/playvejora-design-system.md). Colour, type, spacing, layout, motion, and mobile composition should be taken from that document and from the CSS tokens in `app/globals.css`. Do not introduce a new reusable colour, type role, or spacing value until it exists in both places.

## Notes

SQLite is created at `data/playvejora.sqlite`. Host this app on a Node server with a persistent disk (`npm run build` then `npm start`). Do not use a diskless serverless platform for this database.

Replace `content/waiver.md` before a real season. The shipped text is a placeholder, not legal advice.

## Scripts

- `npm test` — Vitest
- `npm run build` — production build

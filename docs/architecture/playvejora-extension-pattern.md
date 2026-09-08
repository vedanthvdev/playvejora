# PlayVejora extension pattern

v1 is one Next.js App Router app on Cloudflare Workers. Public routes have no login. Captains register through `registerTeamAction` → `submitTeam` in `lib/registration.ts`. Intake is a Cloudflare D1 database bound as `DB`, reached through `getDatabase` in `lib/db.ts`. Organizers reach `/admin` only after a shared `ADMIN_PASSWORD` cookie session.

Do not reverse these v1 rules when extending: Edinburgh-only public UI, no participant accounts, no Stripe on the current path, waitlist after five in-league Edinburgh rows, admin not in public nav.

## Seams

- **Routes:** add pages under `app/`. Keep `lib/site-copy.ts` nav limited to public destinations. Origin lives at `/origin` and is in the public nav.
- **SEO:** default metadata, Open Graph, `app/sitemap.ts`, and `app/robots.ts` share `lib/seo.ts`. Set `SITE_URL` in production so canonical URLs and the sitemap are absolute. Do not index `/admin`.
- **Hosted version:** `/version.info` reports the imported `package.json` version. Do not cache it. Do not list it in the sitemap.
- **Intake fields:** extend `TeamInput`, add a migration under `migrations/`, and update the insert in `lib/registration.ts`. D1 has no interactive transactions, so anything that depends on current rows must be decided inside one statement, the way the league cap is.
- **Data access:** everything goes through `getDatabase`. Tests inject a SQLite-backed stand-in with `useDatabase`, and it loads the real migrations, so an unmigrated schema change fails the suite.
- **City and sport:** live on `competitions`, not as the source of truth on each team. Each registration stores `competition_id`, a public `public_id` (`tm_…`), and copies `city` for the insert. The cap is counted per competition. Admin filters `/admin` by city, sport, and place.
- **Stripe (not live):** `competitions.payment_mode` is `open` today, so every insert is `payment_status = not_required`. The intended later rule is `league_paid_waitlist_free`: the first `league_cap` places pay before they are stored as in-league; once that cap is full, waitlist signup stays free. `stripe_checkout_session_id` and `stripe_payment_intent_id` are on `teams` for that work. Do not add a payment step to the current register path.
- **Email:** `submitTeamAndNotify` sends the organizers and the captain after a successful insert, both including the public id. Tests inject a mailer with `useMailer`. Production uses Resend when `RESEND_API_KEY` is set. A down mailbox must not fail the registration.
- **Admin:** reuse `teamsForAdmin` and the cookie in `lib/admin-auth.ts`. A login inserts a random token into `admin_sessions` and the cookie carries only that token, so sessions expire after twelve hours and logout ends them. Organizer pages use `AdminChrome`, not the public nav or Origin footer. Edits go through `updateTeam` with bound parameters. Deleting a registration asks for `ADMIN_PASSWORD` again and does not end other sessions. Do not list PII on unauthenticated routes.
- **Abuse limits:** any new unauthenticated write or credential check should take a bucket through `consumeRateLimit` in `lib/rate-limit.ts` before it touches the database, keyed by `clientIp`. Policies live beside it rather than at the call site.

## Deferred features (do not build in v1)

| Feature | Attach point | Must not break |
| --- | --- | --- |
| Stripe | `competitions.payment_mode = league_paid_waitlist_free`, then Checkout before insert while places remain | R10 today: no payment UI; waitlist stays free once the cap is full |
| More cities | new `competitions` row, still no picker until a second city opens | Live UI stays Edinburgh until then |
| Match stats | New tables and a results route | Do not require player logins |
| Photos / awards | New route plus media store | Keep the shell minimal |
| Charity choice | Field on `TeamInput` | No amounts in copy |
| Top scorers | Route that reads stats tables | Photos can wait for assets |

## Hosting

Cloudflare Workers with D1, deployed from `wrangler.jsonc` (see `docs/deploy/cloudflare.md`). The runtime has no filesystem and no process between requests, so nothing may read from disk at request time and no schema may be created on connect. Verify anything infrastructural with `npm run preview`, which runs the real Worker bundle on workerd, rather than `npm run dev`.

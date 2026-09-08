# Deploying PlayVejora to Fly.io

The site runs as a single Fly machine in `lhr` with registrations in SQLite on a mounted volume. `fly.toml` and `Dockerfile` in the repository root hold the configuration; this document covers the one-time setup and the domain.

## Why one machine

Registrations live in a SQLite file on a Fly volume, and a volume cannot be shared between machines. A second machine would get its own empty volume and split the league in half, so `max_machines_running` is `1` and every deploy uses `--ha=false`. Moving to Postgres is the prerequisite for scaling out, not adding machines.

Machines suspend when idle and resume on the next request, which suits a pre-launch site. Set `min_machines_running = 1` once real traffic makes the resume delay worth paying for.

## First deploy

```bash
brew install flyctl
fly auth login

# App names are global. If "playvejora" is taken, pick another and change
# the app line in fly.toml to match.
fly apps create playvejora

fly volumes create playvejora_data --region lhr --size 1 --yes

# The production build refuses the pre-launch fallback password, so the
# organizer login returns an error until this is set.
fly secrets set ADMIN_PASSWORD='<a real password>'

fly deploy --ha=false
```

Confirm the release before touching DNS:

```bash
fly status
curl https://playvejora.fly.dev/version.info
```

That endpoint returns the name and version from `package.json` with no caching, so it always reflects the running build rather than a cached page.

## Domain

`playvejora.dpdns.org` is a subdomain, so a `CNAME` is allowed and is simpler than managing Fly's IP addresses.

```bash
fly certs add playvejora.dpdns.org
fly certs show playvejora.dpdns.org
```

In the FreeDomain DNS panel for the record, add:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `playvejora` | `playvejora.fly.dev` |

Keep TTL at 300 seconds until the certificate is issued, then raise it. `fly certs show` reports the check as it progresses; issuance usually takes a few minutes once DNS propagates.

If the panel refuses a `CNAME`, use `fly ips list` and add an `A` record for the IPv4 address and an `AAAA` record for the IPv6 address instead.

Then verify the real thing:

```bash
curl https://playvejora.dpdns.org/version.info
```

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `fly secrets` | Organizer login. Required in production. |
| `SITE_URL` | `fly.toml` | Canonical URLs, Open Graph, sitemap. |
| `PLAYVEJORA_DB_PATH` | `fly.toml` | Points SQLite at the mounted volume. |

`SITE_URL` and `PLAYVEJORA_DB_PATH` are plain config rather than secrets, so they stay in `fly.toml` where a reviewer can see them.

## Backups

Fly volumes are snapshotted daily and kept for five days, which is not a backup strategy for real registrations. Until the data moves to Postgres, pull a copy before anything risky:

```bash
fly ssh console -C "cat /data/playvejora.sqlite" > backup.sqlite
```

## Verifying the image locally

The container is worth testing before a deploy, because failures here are cheap and failures on Fly are not:

```bash
docker build -t playvejora:local .
docker run --rm -p 3000:3000 -v playvejora_local:/data \
  -e ADMIN_PASSWORD=local-only playvejora:local
```

The build uses Next's standalone output. `next start` is deliberately not used, because it loads `next.config.ts` at boot and tries to install TypeScript to read it, which fails in a container with no network.

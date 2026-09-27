# AutoSEO Cloud

The control plane behind **https://autoseo.codext.de**: marketing site, sign-up, Stripe billing and the
workspaces of all Cloud customers. Customers live in **one shared AutoSEO instance** at
**https://app.autoseo.codext.de**, each in their own workspace; the cloud manages them through the app's tenant
API. The binding contract (tenant API, env vars, lifecycle) is [`docs/CLOUD.md`](../docs/CLOUD.md).

Dedicated instances — one Coolify service per customer at `https://<slug>.autoseo.codext.de`, see
[`docs/MANAGED_INSTANCES.md`](../docs/MANAGED_INSTANCES.md) — remain available as an admin-only option, and are what
new customers get when the shared app isn't configured.

Next.js 16 · Drizzle + PostgreSQL · Stripe · shared-app tenant API · Coolify API · nodemailer.

## How it works

1. A customer signs up at `/signup` (magic link + 6-digit code, no passwords) and names their workspace on
   `/dashboard` (dedicated instances also pick an address). The order is reserved (`pending_payment`) and the
   customer goes to Stripe Checkout ($50/month).
2. `checkout.session.completed` (webhook — or the success redirect, whichever comes first) links the
   subscription and marks the instance `provisioning`. Provisioning runs after the response, by backend
   (`instances.backend`):
   - **shared** (default when `CLOUD_API_SECRET` + `CLOUD_APP_INTERNAL_URL` are set): one idempotent
     `PUT /api/cloud/tenants/{id}` creates the owner and the workspace (status `active`, plan limits). The
     workspace is ready right away and the owner gets a "Your AutoSEO workspace is ready" email.
   - **coolify** (dedicated): creates or adopts the Coolify service `autoseo-<slug>`, sets its environment and
     starts it; the reconciler waits for `/api/health` and then sends the "instance ready" email.
3. A background reconciler (every 30 s, started from `src/instrumentation.ts`) retries unfinished provisioning
   with backoff, checks running workspaces / instances every 10 minutes (shared: `GET` tenant — a tenant whose
   status drifted is re-sent), pushes the platform mail server to the shared app (on boot, when it changes, at
   least hourly) and releases unpaid reservations 48 hours after they were made.
4. "Open AutoSEO" signs a 2-minute SSO token — shared: with `CLOUD_SSO_SECRET`, redirecting to
   `${CLOUD_APP_URL}/auth/sso?token=…`; dedicated: with the instance's own secret.
5. Subscription changes keep workspaces in sync (docs/CLOUD.md → Lifecycle): `active`/`trialing`/`past_due` →
   `PUT` status `active`; `unpaid`/`canceled`/deleted (and `incomplete_expired`/`paused`) → `PUT` status
   `suspended`. Suspended workspaces keep their data; members see a "workspace paused" page. There is no
   automatic deletion: to remove the data of a workspace that stays suspended (30 days), delete it in
   `/admin` → Customers. Account deletion and admin delete call `DELETE` on the tenant.
6. **Plan limits** (`/admin` → Hosting → Plan: included monthly usage in USD, default 10, and max projects,
   default 10) are sent with every tenant `PUT`; saving them re-sends all existing tenants. The dashboard shows
   usage against the included budget and the project count.

Everything is recorded in the audit log (`/admin` → Events).

### Growth statistics (cookieless)

The marketing site records page views and a few clicks with its own first-party collector (`POST /api/e`, fed by
`src/components/analytics/tracker.tsx`) — no cookies, no browser storage, no third-party scripts. Stored per event:
path, external referrer host, `utm_*` values, which ad network's click id was present (`twclid` → `x`, never the
value), channel, country (Cloudflare), device type and a visitor hash of IP + user agent with a random salt per UTC
day. Salts are deleted two days later (the hashes can then no longer be linked to anyone), events after 400 days.
Signed-in admins, bots, `/admin`, `/dashboard`, `/auth` and `/api` are never recorded.

At sign-up the channel/campaign is picked from that visitor's page views of the last two days
(`users.attribution`), copied into the Stripe Checkout Session and subscription metadata (`attr_*`), and the first
activation of a subscription is logged once as `billing.checkout_paid`. `/admin` → Growth shows visitors → pricing →
sign-up → accounts → checkouts → paid by channel, campaign/ad, landing page, referrer, country and device, and every
Monday from 07:00 UTC the operator gets a weekly digest email.

### Complimentary workspaces / instances

Admins (`ADMIN_EMAILS`) can create fully working workspaces without Stripe:

- **Their own:** on `/dashboard` the new-workspace form has a secondary "Create without payment (admin)" button (an
  unpaid reservation can be converted the same way — its open checkout is expired first).
- **For anyone:** `/admin` → Customers → "Grant free workspace" (email, workspace name; tick "Dedicated instance
  (Coolify)" for an instance at its own address). The account is created for the email if needed; the owner gets
  the usual "ready" email.

Complimentary ones (`instances.complimentary`, `granted_by` = admin email) are provisioned like paid ones, are
never released by the reservation cleanup and can't be stopped by billing events. Their owner sees a
"Complimentary" badge instead of subscription details, no billing buttons without a Stripe customer, and "Start
again" when paused (unless an admin paused it). If a paid (active / trialing / past_due) subscription ever attaches
to one, the flag is cleared and the normal subscription rules apply from then on (`granted_by` stays as history).

## Deploy on Coolify

1. **DNS** (Cloudflare), all `CNAME coolify-v4.codext.de`:
   - `autoseo.codext.de` (proxied) — the cloud
   - `app.autoseo.codext.de` — the shared app (covered by the wildcard below)
   - `*.autoseo.codext.de` (**DNS only**, so Traefik can issue a certificate per host; the universal certificate
     doesn't cover second-level wildcards)
2. **New resource → Public/Private repository → Docker Compose** with **base directory `/cloud`**. The compose
   file builds two apps: `cloud` (`cloud/Dockerfile`) and `app` (the repository root's `Dockerfile`), each with
   its own PostgreSQL. One push to `main` updates both.
3. Domains: `cloud` → `https://autoseo.codext.de`, `app` → `https://app.autoseo.codext.de`. Environment:
   - `ADMIN_EMAILS` — comma-separated emails that may open `/admin`
   - `OPERATOR_EMAIL` — the operator's account in the shared app (its instance admin, created on first boot);
     `OPERATOR_WORKSPACE` optionally names its workspace (default "AutoSEO Cloud"). The cloud sends the weekly
     growth digest to this address (or the first `ADMIN_EMAILS` entry)
   - `DOMAIN` / `APP_DOMAIN` — default `autoseo.codext.de` / `app.autoseo.codext.de`
   Coolify generates the database passwords and the shared secrets (`SERVICE_PASSWORD_64_CLOUDAPI`,
   `SERVICE_PASSWORD_64_CLOUDSSO`). Migrations run automatically at boot in both apps.
4. Deploy, open `https://autoseo.codext.de/login` and sign in with an admin email. SMTP isn't configured
   yet, so the sign-in link and code are printed to the **container logs** (Coolify → Logs).
5. In **`/admin`**:
   - **Hosting** — shows whether the shared app is reachable; "Test & push mail settings" checks it. Set the
     **Plan** limits. Open the shared app as its admin (SSO) to configure AI providers, DataForSEO and Google
     OAuth once for everybody. The Coolify card is only needed for dedicated instances.
   - **Email** — SMTP host/port/user/password/from (Amazon SES works). "Save & verify", then "Send test
     email". Customer workspaces need mail too: add a separate **Customer instances mail server** (recommended —
     its credential reaches the shared app and every dedicated instance, so use an identity that can only send
     from its own address, e.g. an SES SMTP user restricted with `ses:FromAddress`), or leave "Customer instances
     use this SMTP server" on to share the main one. Saving pushes it to the shared app right away.
   - **Stripe** — paste a secret key (`sk_live_…`/`sk_test_…` or a restricted `rk_…`) and "Save & connect".
     This reuses the price with lookup key `autoseo_cloud_monthly` (and its product) when it exists — otherwise
     it creates the "AutoSEO Cloud" product (tax code `txcd_10103000`) with a $50/month price (tax behavior
     exclusive) — plus the webhook endpoint `https://autoseo.codext.de/api/stripe/webhook` (signing secret
     stored encrypted) and a customer portal configuration. Idempotent — run it again any time.
     Options: trial days, automatic tax (default on; needs Stripe Tax), promotion codes.
6. Customers can now subscribe. `/admin` → Customers lets you sync, resume, suspend and delete shared workspaces
   (and provision, start, stop, restart, redeploy and delete dedicated instances).

The cloud reads `DOMAIN`, `ADMIN_EMAILS`, `OPERATOR_EMAIL`, `DATABASE_URL`, `DATA_DIR`, optional `APP_URL` and the shared-app
connection (`CLOUD_APP_INTERNAL_URL`, `CLOUD_APP_URL`, `CLOUD_API_SECRET`, `CLOUD_SSO_SECRET`, all set by the
compose file) from the environment. All integration credentials live in the database, encrypted with AES-256-GCM
using a key generated on first boot at `DATA_DIR/secret.key` — **back up the `cloud-data` volume** together with
the database, otherwise stored credentials can't be decrypted.

## Local development

```bash
cd cloud
pnpm install
# a PostgreSQL database, e.g. in the repo's dev container:
psql postgres://autoseo:autoseo@localhost:54329/autoseo -c 'create database autoseo_cloud'
export DATABASE_URL=postgres://autoseo:autoseo@localhost:54329/autoseo_cloud
pnpm db:push                                  # sync the schema (production applies ./drizzle migrations)
DOMAIN=localhost:3200 ADMIN_EMAILS=you@example.com pnpm dev   # http://localhost:3200
```

Sign-in emails are printed to the terminal until SMTP is configured. Stripe can't create a webhook endpoint
for `localhost`: to test billing locally, expose the dev server through an HTTPS tunnel, start it with
`APP_URL=https://<tunnel-host>` and run "Save & connect" with a `sk_test_…` key.

| Command | |
|---|---|
| `pnpm dev` | dev server on port 3200 |
| `pnpm typecheck` / `pnpm lint` / `pnpm test` | checks and unit tests (slug rules, SSO tokens, compose, SMTP URL, billing rules) |
| `AUTOSEO_SKIP_BOOT=1 pnpm build` | production build (no database needed) |
| `pnpm db:generate --name <change>` | create a migration after editing `src/server/db/schema.ts` |

## Layout

```
src/app/(marketing)/        marketing site
src/app/(account)/(auth)/   /login, /signup, /auth/verify
src/app/(account)/(app)/    /dashboard, /admin
src/app/api/                health, auth/verify, slug, instance/{status,open}, billing/portal, stripe/webhook, e (statistics)
src/server/                 auth, settings, stripe, coolify, provisioning, reconciler, email, db, analytics
src/components/account/     dashboard + admin UI
drizzle/                    SQL migrations (applied at boot in production)
```

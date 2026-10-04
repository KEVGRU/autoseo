# Self-hosting AutoSEO

AutoSEO is a single Next.js app plus PostgreSQL — no external services are required to get it running.
`.env` only ever needs a `DOMAIN` (and, for the prebuilt-image setup below, a Postgres password); everything
else — email, AI providers, DataForSEO, Google OAuth, branding, limits — is configured afterwards in the
**admin panel**.

Don't want to run any of this yourself? [AutoSEO Cloud](https://autoseo.codext.de) gives you your own workspace in
our fully managed AutoSEO for **$50/month** — same app, we run it. See [Managed hosting](#managed-hosting-autoseo-cloud)
below.

## Requirements

- A Linux server (VPS or bare metal) — **2 vCPU / 2–4 GB RAM** is enough for small teams; scale up if you run
  heavy site audits or large keyword/backlink jobs.
- [Docker](https://docs.docker.com/engine/install/) with the Compose v2 plugin.
- A domain you can point at the server (for automatic HTTPS). You *can* run without one on `localhost` for
  local testing — see [Run locally with Docker](../README.md#run-locally-with-docker) in the README.

Pick one of four ways to run it:

1. [One-line installer](#1-one-line-installer) — fastest path to a production instance.
2. [Manual Docker Compose](#2-manual-docker-compose) — same result, full control over the compose file.
3. [Coolify](#3-coolify) — if you already run a Coolify server.
4. [Build from source](#4-build-from-source) — for development or custom builds.

## 1. One-line installer

```bash
curl -fsSL https://autoseo.codext.de/install | bash
```

This downloads `deploy/docker-compose.yml` and `deploy/Caddyfile` from this repository into `/opt/autoseo`
(override with `--dir` or `$AUTOSEO_DIR`), installs Docker if it's missing (asks first), asks for your domain,
generates a random Postgres password, writes `.env` (mode `600`), then runs `docker compose pull && up -d`.
Caddy is included by default and gets you automatic HTTPS for your domain with no extra config.

Useful flags:

```bash
curl -fsSL https://autoseo.codext.de/install | bash -s -- --domain seo.example.com --yes
curl -fsSL https://autoseo.codext.de/install | bash -s -- --no-proxy        # skip Caddy, see below
curl -fsSL https://autoseo.codext.de/install | bash -s -- --version v1.4.0  # pin an image tag
```

Run `curl -fsSL https://autoseo.codext.de/install | bash -s -- --help` for the full list (`--dir`, `--update`,
`--uninstall`, `--purge`). The script is idempotent — re-running it keeps your existing `.env`.

Already have a reverse proxy (Traefik, nginx, Cloudflare Tunnel, …)? Use `--no-proxy`: the bundled Caddy
service is skipped and the app is published on `127.0.0.1:3000` for your proxy to forward to instead — point
it at `http://<server>:3000` with your own TLS termination.

## 2. Manual Docker Compose

Same thing, without the script — useful if you want to review every step or you're not on Linux/macOS.

```bash
mkdir -p /opt/autoseo && cd /opt/autoseo
curl -fsSLO https://raw.githubusercontent.com/codextde/autoseo/main/deploy/docker-compose.yml
curl -fsSLO https://raw.githubusercontent.com/codextde/autoseo/main/deploy/Caddyfile
curl -fsSL https://raw.githubusercontent.com/codextde/autoseo/main/deploy/.env.example -o .env

# edit .env: set DOMAIN and POSTGRES_PASSWORD (openssl rand -hex 24)
$EDITOR .env
chmod 600 .env

docker compose pull
docker compose up -d
docker compose logs -f app   # watch for the setup code (see below)
```

`deploy/docker-compose.yml` uses the prebuilt image `ghcr.io/codextde/autoseo` — no build step, no repo
checkout needed beyond these two files. It runs three services: `app`, `postgres`, and `caddy` (profile
`proxy`, enabled by default via `COMPOSE_PROFILES=proxy` in `.env`). To skip Caddy, set `COMPOSE_PROFILES=`
(empty) in `.env` — the app stays published on `127.0.0.1:${APP_PORT:-3000}` for your own proxy.

## 3. Coolify

1. Create a new resource → **Docker Compose** → point it at this repository (build pack: Docker Compose,
   file `docker-compose.yml` — the one at the repo root, which builds from source; Coolify doesn't need the
   `deploy/` variant).
2. Set the domain of the `app` service (e.g. `https://seo.example.com`) and add the environment variable
   `DOMAIN=seo.example.com`. Coolify generates the Postgres password automatically
   (`SERVICE_PASSWORD_POSTGRES`).
3. Deploy. Migrations run automatically at boot and the first-run setup code is printed to the logs (see
   [First-run setup](#first-run-setup) below).

Updating is a redeploy — see [the README](../README.md#deploy-with-coolify) for details on data volumes and
reverse-proxy/security settings specific to Coolify (trusted `X-Forwarded-For`, Cloudflare mode, etc.).

## 4. Build from source

For development, or if you want a custom build:

```bash
git clone https://github.com/codextde/autoseo.git && cd autoseo
docker run -d --name autoseo-pg -e POSTGRES_USER=autoseo -e POSTGRES_PASSWORD=autoseo -e POSTGRES_DB=autoseo \
  -p 54329:5432 postgres:17-alpine
pnpm install
pnpm db:push
pnpm dev   # http://localhost:3000
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) and `docs/ARCHITECTURE.md` for the full development setup and code
conventions. To build the production Docker image yourself: `docker build -t autoseo .` (or use the root
`docker-compose.yml`, which builds from source).

## First-run setup

On first boot, once migrations finish, the app prints a one-time setup code to its logs (a fresh code is
generated on every restart until setup is completed):

```
╔════════════════════════════════════════╗
║  AutoSEO first-run setup               ║
║  Open https://seo.example.com/setup    ║
║  Setup code: 1234-5678                 ║
╚════════════════════════════════════════╝
```

Find it with `docker compose logs app` (the installer prints it for you automatically). Open `/setup`, enter
the code, name your workspace and create the owner account — you're signed in immediately.

You can skip this step entirely by setting `AUTOSEO_OWNER_EMAIL` (and optionally `AUTOSEO_OWNER_NAME`,
`AUTOSEO_WORKSPACE_NAME`) before first boot — see [Optional bootstrap variables](#optional-bootstrap-environment-variables).

## Admin panel configuration

Everything past `DOMAIN` lives in the database and is configured at `/admin` after setup:

| Area | What you'll want to set up first |
|---|---|
| **PostHog analytics** | Project → Integrations → PostHog. Import website sessions from a separate Postgres Events export database using read-only credentials and TLS. See [setup and measurement limits](POSTHOG.md). |
| **Email** | Admin → Email — Resend, Amazon SES (region preset) or custom SMTP, sender address, send a test email. Required for invites and magic links to actually arrive. |
| **AI providers** | Admin → AI Providers — either point AutoSEO at your own local **Claude Code / Codex CLI** agents (Settings → Local Agents → Install agent, see the README's *Local agents* section) or configure API keys (Anthropic / OpenAI / OpenRouter / Perplexity / Gemini / xAI / Mistral / DeepSeek / Meta / Qwen / Moonshot / Maritaca / Upstage) as a fallback. At least one of the two is needed for any AI-visibility feature. Without DataForSEO, keyword, SERP, domain, backlink and local data are filled with labelled AI estimates, and engines without a provider can be simulated by an AI model with web search (Admin → Data Providers / AI Providers). |
| **DataForSEO** | Admin → Data Providers — keyword research, SERPs, backlinks and AI-engine tracking all go through [DataForSEO](https://dataforseo.com); add your credentials here. |
| **Google OAuth** | Admin → Data Providers — connect Search Console, GA4 and Sheets export by registering an OAuth client and pasting the client ID/secret here. |

Also worth a look early on: Admin → Authentication (invite-only mode, allowed email domains, session length,
Cloudflare mode), Admin → Roles & Permissions, and Admin → Limits & Budgets (spend caps, job concurrency).

## SSO & access control

### Roles, project groups and project access

- **Workspace roles** (Admin → Roles & Permissions) decide what a member can do: *Owner*, *Admin*, *Member*,
  *Client* plus any custom roles. Members whose role doesn't cover all projects only see the projects they were
  given — directly or through a project group.
- **Project groups** (Settings → Workspace → Groups) arrange projects in a tree — brand → region → team → client,
  up to 8 levels. Add a member to a group with a role and they get that role in every project of the group and its
  sub-groups. Typical setup: *Global admin* = workspace Admin/Owner, *Regional admin* = Admin role on a region
  group, *Team lead* = Member role on a team group, *Analyst* = a project role (or Client for read-only).
- **Which role applies in a project** — the most specific assignment wins, in both directions (it can widen or
  narrow access): a project role override → the nearest group role (the project's group, then its parents) → the
  workspace role. A role without *View project data* hides the project completely (useful as a "No access"
  override for an all-projects member). Group and project roles only carry *project* permissions (view, prompts & agent, paid SEO runs,
  reports, share links, exports, attribution, alerts, project settings). Workspace-level permissions — members,
  integrations & API keys, usage, agents, workspace, instance admin — always come from the workspace role, and a
  group role never reaches beyond its subtree. A workspace membership is always required; removing someone from the
  workspace removes their group and project roles too. Settings → Workspace → Groups → *Effective access* shows
  the resolved role and permissions of any member for every project. Groups are managed by members with *Invite
  members and change roles* who see all projects; they can only hand out roles within their own permissions, can't
  change their own group/project roles, and can't restructure groups in a way that widens their own access.
- **Export and share permissions**: *Export data* (`data.export`) covers CSV/JSON/NDJSON exports, report
  downloads (PPTX/PDF), Google Sheets exports and the REST/MCP export endpoints; *Create and change public share
  links* (`reports.share`) covers report share links. Owner, Admin and Member have both; Client can view reports
  but can't export or share unless you grant it. Existing custom roles were migrated once: share links for roles
  that could manage reports, exports for roles with any write permission in a project.
- **API keys and MCP** follow the same per-project permissions (a key is narrowed or widened exactly like its
  owner in each project). Holding an API key or OAuth connection still requires the workspace permission
  *Integrations, API keys*.

### Single sign-on (OpenID Connect)

AutoSEO supports **OpenID Connect** (authorization code flow with PKCE, `state` and `nonce`, ID-token validation
by [openid-client](https://github.com/panva/openid-client)). **SAML is not supported** — every mainstream identity
provider (Microsoft Entra ID, Okta, Google Workspace, Keycloak, Auth0, JumpCloud, OneLogin, Authentik …) also speaks
OIDC, so configure an OIDC app instead.

Register exactly this redirect URI at your identity provider:

```
https://<DOMAIN>/api/auth/oidc/callback
```

**Instance provider** — Admin → Authentication → *Single sign-on (OpenID Connect)*: issuer URL (metadata is
discovered from `<issuer>/.well-known/openid-configuration`), client ID and secret (stored encrypted), scopes,
the **SSO email domains** the provider may sign in, optional **just-in-time provisioning** (unknown people from
those domains get an account and join the chosen workspace with the default role), a **group claim → role**
mapping (applied when someone joins; roles that grant instance administration can never be assigned through SSO),
and **Require SSO for these domains**, which turns off magic links and invitation links for them. Use *Test
discovery* after saving.

**Workspace providers** — turn on Admin → Authentication → *Let workspaces configure their own SSO*. The workspace
owner (or an instance admin) then opens Settings → Workspace → *Single sign-on*:

1. Add the email domain and publish the shown TXT record on the domain itself (host `@`):
   `autoseo-verification=<token>`. Click *Check DNS* — AutoSEO resolves it server-side. **Keep the record in
   place**: it is re-checked daily, a proof older than a week stops routing sign-ins, and three failed checks in a
   row drop the verification. A verified domain belongs to one workspace only; another workspace can take it over
   once the previous record is gone and its own record is in place. Instance admins can confirm a domain without
   DNS (e.g. internal domains) — such confirmations don't expire.
2. Enter the provider (issuer, client ID/secret, scopes, JIT, default role, group mapping, enforcement) and save.
   Owners can only map roles whose permissions they hold themselves. Enabling the provider or changing its issuer
   or client ID re-checks the DNS records first.

**Signing in** — people type their email on the sign-in page; if its domain has a provider they see *Continue with
SSO*, go through the identity provider and get the same one-year, multi-device session as with a magic link. Pending
invitations are accepted on the way; JIT never adds people to a paused workspace. When an instance provider is
enabled the sign-in page also shows a *Continue with …* button. If an identity provider breaks while SSO is
enforced, instance administrators can still request an emergency magic link. Instance administrators never sign
in through a *workspace* provider (use the instance provider or email). When you turn enforcement on, AutoSEO offers to
sign out existing sessions of people on those domains (checked by default) so they sign in again through SSO — you
and instance admins stay signed in; the sign-out is written to the audit log. A sign-in link from another site can't start an
SSO flow, and SSO never replaces a session of a different signed-in user.

**Safeguards** — the IdP must confirm the email (`email_verified: true`, or `xms_edov: true` for Entra ID), the email
must belong to one of the provider's domains (exact match, sub-domains need their own entry), an IdP account
(`iss` + `sub`) stays bound to the first AutoSEO user it signed in as, the callback only accepts the flow started in
the same browser, and every sign-in, denial and configuration change is written to the audit log. All requests to
the IdP go through the SSRF-protected HTTP client: an IdP inside your private network (e.g. Keycloak on the LAN)
must be listed under Admin → Authentication → *Internal hosts allowed for integrations* — only such hosts may use
plain `http://` (not available on AutoSEO Cloud).

#### Microsoft Entra ID

1. Entra admin center → *App registrations* → *New registration*. Supported account types: *Accounts in this
   organizational directory only*. Redirect URI (platform *Web*): your callback URL.
2. *Certificates & secrets* → *New client secret* → copy the value.
3. *Token configuration* → *Add optional claim* → token type *ID* → select **`email`** and **`xms_edov`**. Entra ID
   doesn't send `email_verified`; without `xms_edov` sign-ins are rejected. For role mapping add a *groups claim*
   (security groups) — Entra sends group **object IDs**, so map those IDs to roles.
4. Issuer URL `https://login.microsoftonline.com/<tenant-id>/v2.0`, client ID = *Application (client) ID*,
   scopes `openid email profile`.

#### Okta

1. *Applications* → *Create App Integration* → *OIDC – OpenID Connect* → *Web Application*. Grant type
   *Authorization Code*, sign-in redirect URI = your callback URL; assign the people or groups who may sign in.
2. Issuer URL `https://<your-org>.okta.com` (org authorization server) or
   `https://<your-org>.okta.com/oauth2/default` (custom authorization server); copy client ID and secret.
3. Groups for role mapping: on the app's *Sign On* tab set an ID-token *Groups claim* (name `groups`, filter e.g.
   *Matches regex* `.*`); for a custom authorization server add a `groups` claim under *Security → API →
   Authorization Servers → Claims*.

#### Google Workspace

1. Google Cloud console → *APIs & Services* → *OAuth consent screen*: user type **Internal**. Then *Credentials* →
   *Create credentials* → *OAuth client ID* → *Web application*, authorized redirect URI = your callback URL.
2. Issuer URL `https://accounts.google.com`, scopes `openid email profile`, SSO email domain = your Workspace domain.
3. Google ID tokens carry no groups — everyone gets the default role; adjust roles in AutoSEO afterwards.

#### Keycloak

1. Realm → *Clients* → *Create client*: type *OpenID Connect*, *Client authentication* on, *Standard flow* on,
   *Valid redirect URIs* = your callback URL. Copy the secret from the *Credentials* tab.
2. Issuer URL `https://<keycloak-host>/realms/<realm>`.
3. Users need a verified email (*Email verified* on the user, or the realm's *Verify email* setting).
4. Groups for role mapping: *Client scopes* → `<client>-dedicated` → *Add mapper* → *By configuration* → *Group
   Membership*: token claim name `groups`, *Full group path* off, *Add to ID token* on.

## Optional bootstrap environment variables

A handful of variables let you pre-configure an instance instead of clicking through the UI — useful for
scripted deployments. All are optional; only `DOMAIN` (and `DATABASE_URL`, which the compose files set for
you) is ever required. Full reference: [`docs/MANAGED_INSTANCES.md`](MANAGED_INSTANCES.md#instance-environment-contract).

| Variable | Purpose |
|---|---|
| `AUTOSEO_OWNER_EMAIL` | Skip the setup code — first boot creates this user as owner/instance admin |
| `AUTOSEO_OWNER_NAME` | Display name for that owner |
| `AUTOSEO_WORKSPACE_NAME` | Name of the first workspace |
| `AUTOSEO_SMTP_URL` | Default outgoing mail server (`smtp://` or `smtps://`) used until Admin → Email is configured |
| `AUTOSEO_MAIL_FROM` | Sender address for the default mail server |

Set these in `deploy/.env` (they're commented out by default) or as environment variables if building your own
compose/deployment.

## Updating

- **Installer**: `curl -fsSL https://autoseo.codext.de/install | bash -s -- --update` (pulls the latest image
  and recreates containers).
- **Manual Compose**: `docker compose pull && docker compose up -d` in your install directory.
- **Coolify**: redeploy the resource.

Migrations run automatically at boot in every case. Connected local agents (Claude Code / Codex) update
themselves to match the new build.

## Backups

Two named volumes hold everything that matters:

- `autoseo-pg` — the PostgreSQL database.
- `autoseo-data` — uploads, caches, the auto-generated secret encryption key (`secret.key`) and the agent
  release signing key. **Losing `secret.key` makes stored provider credentials (SMTP passwords, AI API keys,
  DataForSEO credentials, …) unrecoverable** — back it up.

Database dump/restore (adjust the container name if you changed it):

```bash
# Backup
docker compose exec postgres pg_dump -U autoseo -d autoseo -Fc -f /tmp/autoseo.dump
docker compose cp postgres:/tmp/autoseo.dump ./autoseo-$(date +%F).dump

# Restore into a fresh instance (containers running, database empty)
docker compose cp ./autoseo-2026-01-01.dump postgres:/tmp/autoseo.dump
docker compose exec postgres pg_restore -U autoseo -d autoseo --clean --if-exists /tmp/autoseo.dump
```

For the `autoseo-data` volume, stream a tarball out of the running app container (works no matter what
Compose named the volume):

```bash
# Backup
docker compose exec -T app tar czf - -C /data . > autoseo-data-$(date +%F).tar.gz

# Restore (then restart the app: docker compose restart app)
docker compose exec -T app tar xzf - -C /data < autoseo-data-2026-01-01.tar.gz
```

Compose prefixes volume names with the project name (the install directory, e.g. `autoseo_autoseo-data` for
`/opt/autoseo`); run `docker volume ls` if you want to back up the raw volumes instead.

Automate both on a schedule (cron, systemd timer, or your infra's backup tooling) and store copies off the
server.

## Reverse proxy notes

`deploy/docker-compose.yml` ships with Caddy for automatic HTTPS out of the box — most self-hosters don't need
anything else. If you're fronting AutoSEO with something else, run the installer/compose with `--no-proxy` /
`COMPOSE_PROFILES=` and point your proxy at `127.0.0.1:${APP_PORT:-3000}` (forward the original `Host` header
and `X-Forwarded-For`/`X-Forwarded-Proto`):

- **Cloudflare** (proxied orange-cloud DNS) — works as-is; enable Admin → Authentication → *Behind Cloudflare*
  so rate limiting trusts `CF-Connecting-IP` instead of `X-Forwarded-For` (only enable this if **all** traffic
  actually comes through Cloudflare — the header is otherwise spoofable).
- **Traefik** — this is what Coolify uses internally; a minimal label set:
  ```yaml
  labels:
    - traefik.enable=true
    - traefik.http.routers.autoseo.rule=Host(`seo.example.com`)
    - traefik.http.routers.autoseo.tls.certresolver=letsencrypt
    - traefik.http.services.autoseo.loadbalancer.server.port=3000
  ```
- **nginx**:
  ```nginx
  server {
    listen 443 ssl;
    server_name seo.example.com;
    location / {
      proxy_pass http://127.0.0.1:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
  ```

Sessions use `__Host-` cookies, which require HTTPS end-to-end as seen by the browser — make sure your proxy
terminates TLS on the public side even if it talks plain HTTP to the app internally.

## Troubleshooting

**Setup code not shown / can't find it** — it's only printed once per boot, and only while no owner account
exists yet. `docker compose logs app | grep -A2 "AutoSEO first-run setup"`. If you've already completed setup
(or set `AUTOSEO_OWNER_EMAIL`), there won't be one — sign in normally instead.

**Resend** — choose Resend in Admin → Email, enter your API key, and use a sender address on a domain verified in Resend. The preset uses `smtp.resend.com:587` with STARTTLS and username `resend`; the key is stored encrypted as the SMTP password. Save, verify the connection, then send a test email. See the [Resend SMTP guide](https://resend.com/docs/send-with-smtp). Switching providers requires re-entering the credential.

**Emails not arriving** — check `docker compose logs app` for SMTP errors, and send a test email from Admin →
Email (it reports the exact SMTP error). Common causes: wrong port/TLS mode (587 = STARTTLS, 465 = TLS),
provider blocking the sending domain (check SPF/DKIM), or `AUTOSEO_SMTP_URL` credentials not URL-encoded.

**Container won't become healthy** — `docker compose ps` and `docker compose logs app`. The healthcheck hits
`GET /api/health`, which also reports database connectivity; `curl http://127.0.0.1:3000/api/health` from
inside the server for a quick manual check. Slow first boot (migrations) is normal — the healthcheck's
`start_period` allows 60s before failures count.

**Out of memory / OOM-killed** — site audits, backlink jobs and AI tracking runs are memory-hungry under load;
bump the server to 4 GB+ RAM if `docker compose logs` shows the app restarting unexpectedly, or lower job
concurrency under Admin → Limits & Budgets.

**DNS / certificate issues with Caddy** — the installer warns (non-fatally) if your domain doesn't resolve to
the server's public IP; automatic HTTPS can't work until it does. `docker compose logs caddy` shows ACME
errors (rate limits, DNS not propagated yet, port 80/443 blocked by a firewall or cloud provider).

Still stuck? Open a [Discussion](https://github.com/codextde/autoseo/discussions) or a
[bug report](https://github.com/codextde/autoseo/issues/new?template=bug_report.yml).

## Managed hosting (AutoSEO Cloud)

Prefer not to run any of this? [AutoSEO Cloud](https://autoseo.codext.de) gives you your own workspace in one
shared, fully managed AutoSEO instance at `app.autoseo.codext.de`, hosted in Germany, for **$50/month**: the exact
same app, with AI providers, DataForSEO, Google and email preconfigured, unlimited users, up to 10 projects and $10/month
of AI & data usage included (fair use) — no server, no Docker, no updates to manage. Workspace data is logically
separated in a shared database; if you want your own instance and full control over your data, self-host as described
above. See [`docs/CLOUD.md`](CLOUD.md) if you're curious how it's built.

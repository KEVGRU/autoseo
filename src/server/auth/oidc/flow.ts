import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { invitations, roles, ssoIdentities, users, workspaceMembers, workspaces, workspaceSsoProviders } from "@/server/db/schema";
import { getMasterKey } from "@/server/crypto";
import { appUrl } from "@/server/email";
import { env, isSharedCloud } from "@/server/env";
import { logAudit } from "@/server/audit";
import { rateLimit } from "@/server/rate-limit";
import { createSession, getCurrentSession, getRequestMeta } from "@/server/auth/session";
import { isEmailDomainAllowed, isValidEmail, normalizeEmail } from "@/server/auth/domains";
import { acceptInvitationForUser } from "@/server/auth/membership";
import { safeNext } from "@/server/auth/login";
import { checkIdClaims, roleForGroups, type SsoIdentityClaims } from "./claims";
import { getOidcConfig } from "./client";
import { buildAuthorizationRequest, exchangeAuthorizationCode, OidcFlowError } from "./protocol";
import { findSsoForEmail, getProviderByKey, INSTANCE_PROVIDER_KEY, type SsoProvider } from "./providers";
import { openFlowState, sealFlowState, STATE_TTL_SECONDS } from "./state";

/**
 * OIDC sign-in: /api/auth/oidc/start → IdP → /api/auth/oidc/callback. Ends in the same 1-year multi-device
 * session as a magic-link sign-in. See docs/SELF_HOSTING.md → "SSO & access control".
 */

export const OIDC_CALLBACK_PATH = "/api/auth/oidc/callback";
const STATE_COOKIE = env.isLocal ? "autoseo_oidc" : "__Host-autoseo_oidc";

function stateKey(): Buffer {
  return crypto.createHmac("sha256", getMasterKey()).update("oidc-flow-state-v1").digest();
}

async function ipKey() {
  const { ip } = await getRequestMeta();
  return ip ?? "unknown";
}

/** Human-readable reason for the login page (never includes IdP internals). */
export function oidcErrorMessage(reason: string): string {
  switch (reason) {
    case "rate_limited":
      return "Too many sign-in attempts. Please wait a while and try again.";
    case "provider_unavailable":
    case "provider_changed":
      return "Single sign-on is not available for this address right now. Try again or contact your administrator.";
    case "email_not_verified":
      return "Your identity provider did not confirm your email address, so we can't sign you in.";
    case "domain_not_allowed":
      return "This identity provider can't sign in your email address.";
    case "not_invited":
      return "Your account isn't set up yet. Ask an administrator to invite you.";
    case "account_disabled":
      return "This account is disabled. Contact your administrator.";
    case "workspace_paused":
      return "This workspace is paused.";
    case "account_switch":
      return "You're already signed in with another account. Sign out first, then sign in with single sign-on.";
    case "admin_not_allowed":
      return "Instance administrators can't sign in through a workspace identity provider. Use your email instead.";
    case "identity_conflict":
      return "This identity-provider account is linked to a different user. Contact your administrator.";
    case "idp_error":
      return "The sign-in was cancelled or rejected by your identity provider.";
    default:
      return "Single sign-on failed. Please try again.";
  }
}

/** Starts an OIDC sign-in for an email (provider by domain) or an explicit provider key. Returns the IdP URL. */
export async function startOidcLogin(opts: { email?: string | null; providerKey?: string | null; next?: string | null }): Promise<URL> {
  if (!rateLimit(`oidc:start:${await ipKey()}`, 30, 10 * 60_000)) throw new OidcFlowError("rate_limited");
  const email = opts.email ? normalizeEmail(opts.email) : null;
  let provider: SsoProvider | null = null;
  if (email && isValidEmail(email)) provider = (await findSsoForEmail(email))?.provider ?? null;
  else if (opts.providerKey) provider = await getProviderByKey(opts.providerKey);
  if (!provider) throw new OidcFlowError("provider_unavailable");
  let config;
  try {
    config = await getOidcConfig(provider);
  } catch (err) {
    console.error(`[oidc] discovery failed for provider ${provider.key}`, err instanceof Error ? err.message : err);
    throw new OidcFlowError("provider_unavailable");
  }
  const { url, flow } = await buildAuthorizationRequest(config, {
    providerKey: provider.key,
    clientId: provider.clientId,
    redirectUri: appUrl(OIDC_CALLBACK_PATH),
    scopes: provider.scopes,
    loginHint: email,
    next: safeNext(opts.next),
  });
  const jar = await cookies();
  jar.set(STATE_COOKIE, sealFlowState(stateKey(), flow), {
    httpOnly: true,
    secure: !env.isLocal,
    sameSite: "lax",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });
  return url;
}

/** Roles a person may get through SSO: existing roles that don't grant instance administration. */
async function allowedRoleKeys(): Promise<Set<string>> {
  const rows = await db.select({ key: roles.key, permissions: roles.permissions }).from(roles);
  return new Set(rows.filter((r) => !r.permissions.includes("admin.access")).map((r) => r.key));
}

/** Adds the user to the provider's workspace with the mapped role (JIT) when allowed. Returns true if added. */
async function joinProviderWorkspace(provider: SsoProvider, userId: string, identity: SsoIdentityClaims): Promise<boolean> {
  if (!provider.jitProvisioning || !provider.workspaceId) return false;
  const [ws] = await db.select({ id: workspaces.id, status: workspaces.status }).from(workspaces).where(eq(workspaces.id, provider.workspaceId)).limit(1);
  if (!ws || ws.status !== "active") return false;
  const allowed = await allowedRoleKeys();
  const roleKey = roleForGroups(identity.groups, provider.groupRoleMap, provider.defaultRoleKey, (k) => allowed.has(k));
  if (!roleKey) return false;
  const inserted = await db
    .insert(workspaceMembers)
    .values({ workspaceId: ws.id, userId, roleKey })
    // Existing members keep their role — role changes happen in member management only.
    .onConflictDoNothing()
    .returning({ userId: workspaceMembers.userId });
  if (inserted.length) {
    void logAudit("auth.sso_joined", {
      actor: { id: userId, email: identity.email },
      targetType: "workspace",
      targetId: ws.id,
      workspaceId: ws.id,
      meta: { provider: provider.key, roleKey, groups: identity.groups.slice(0, 20) },
    });
  }
  return inserted.length > 0;
}

async function isInstanceAdminIdentity(email: string, user: typeof users.$inferSelect | null): Promise<boolean> {
  if (user?.isInstanceAdmin) return true;
  if (user && !isSharedCloud()) {
    const [viaRole] = await db
      .select({ key: roles.key })
      .from(workspaceMembers)
      .innerJoin(roles, eq(roles.key, workspaceMembers.roleKey))
      .where(and(eq(workspaceMembers.userId, user.id), sql`${roles.permissions} @> '["admin.access"]'::jsonb`))
      .limit(1);
    if (viaRole) return true;
  }
  const [adminInvite] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(and(eq(invitations.email, email), eq(invitations.status, "pending"), eq(invitations.makeInstanceAdmin, true), gt(invitations.expiresAt, new Date())))
    .limit(1);
  return Boolean(adminInvite);
}

async function resolveUser(provider: SsoProvider, identity: SsoIdentityClaims) {
  const [linked] = await db
    .select({ userId: ssoIdentities.userId })
    .from(ssoIdentities)
    .where(and(eq(ssoIdentities.issuer, identity.issuer), eq(ssoIdentities.subject, identity.subject)))
    .limit(1);
  let [user] = await db.select().from(users).where(eq(users.email, identity.email)).limit(1);
  // An IdP subject is bound to one user forever: it can't later sign in as someone else (e.g. after an email change).
  if (linked && linked.userId !== user?.id) throw new OidcFlowError("identity_conflict");
  // A workspace-configured IdP never signs in (or creates) an instance administrator — they use the instance
  // provider or their email. Covers the account flag, roles granting admin access and pending admin invitations.
  if (provider.kind === "workspace" && (await isInstanceAdminIdentity(identity.email, user ?? null))) throw new OidcFlowError("admin_not_allowed");

  if (!user) {
    // Pending invitations work exactly like with magic links; otherwise JIT provisioning (if enabled).
    const accepted = await acceptInvitationForUser(identity.email);
    if (accepted) user = accepted;
    else {
      if (!provider.jitProvisioning || !provider.workspaceId) throw new OidcFlowError("not_invited");
      const [ws] = await db.select({ status: workspaces.status }).from(workspaces).where(eq(workspaces.id, provider.workspaceId)).limit(1);
      if (!ws) throw new OidcFlowError("not_invited");
      if (ws.status !== "active") throw new OidcFlowError("workspace_paused");
      const [created] = await db
        .insert(users)
        .values({ email: identity.email, name: identity.name ?? identity.email.split("@")[0] })
        .onConflictDoNothing()
        .returning();
      user = created ?? (await db.select().from(users).where(eq(users.email, identity.email)).limit(1))[0];
      if (!user) throw new OidcFlowError("not_invited");
      if (!(await joinProviderWorkspace(provider, user.id, identity))) throw new OidcFlowError("not_invited");
      void logAudit("auth.sso_provisioned", { actor: { id: user.id, email: user.email }, workspaceId: provider.workspaceId, meta: { provider: provider.key } });
    }
  } else {
    if (user.status !== "active") throw new OidcFlowError("account_disabled");
    await acceptInvitationForUser(identity.email);
    await joinProviderWorkspace(provider, user.id, identity);
  }
  if (user.status !== "active") throw new OidcFlowError("account_disabled");
  if (!user.name && identity.name) await db.update(users).set({ name: identity.name }).where(eq(users.id, user.id));

  await db
    .insert(ssoIdentities)
    .values({ providerKey: provider.key, issuer: identity.issuer, subject: identity.subject, userId: user.id, email: identity.email, lastLoginAt: new Date() })
    .onConflictDoUpdate({
      target: [ssoIdentities.issuer, ssoIdentities.subject],
      set: { providerKey: provider.key, email: identity.email, lastLoginAt: new Date() },
    });
  return user;
}

/**
 * Completes the callback: sealed state (CSRF), provider unchanged (mix-up), code exchange with PKCE + nonce and ID
 * token validation (openid-client), verified email of an allowed domain, user lookup / JIT, then a normal session.
 */
export async function completeOidcLogin(requestUrl: URL): Promise<{ redirectTo: string }> {
  const ip = await ipKey();
  if (!rateLimit(`oidc:callback:${ip}`, 30, 10 * 60_000)) throw new OidcFlowError("rate_limited");
  const jar = await cookies();
  const sealed = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);
  const flow = openFlowState(stateKey(), sealed);
  if (!flow) throw new OidcFlowError("state_missing");

  const provider = await getProviderByKey(flow.providerKey);
  if (!provider) throw new OidcFlowError("provider_unavailable");
  if (provider.clientId !== flow.clientId) throw new OidcFlowError("provider_changed");
  let config;
  try {
    config = await getOidcConfig(provider);
  } catch {
    throw new OidcFlowError("provider_unavailable");
  }
  if (config.serverMetadata().issuer !== flow.issuer) throw new OidcFlowError("provider_changed");

  // The redirect URI is always the public one — never derived from Host / forwarded headers.
  const callbackUrl = new URL(appUrl(OIDC_CALLBACK_PATH));
  requestUrl.searchParams.forEach((v, k) => callbackUrl.searchParams.append(k, v));
  const claims = await exchangeAuthorizationCode(config, callbackUrl, flow);

  const check = checkIdClaims(claims, { domains: provider.domains, groupClaim: provider.groupClaim });
  if (!check.ok) {
    void logAudit("auth.sso_denied", { meta: { provider: provider.key, reason: check.reason, detail: check.detail ?? null } });
    throw new OidcFlowError(check.reason);
  }
  const identity = check.identity;
  if (!(await isEmailDomainAllowed(identity.email))) {
    void logAudit("auth.sso_denied", { meta: { provider: provider.key, reason: "instance_allow_list", email: identity.email } });
    throw new OidcFlowError("domain_not_allowed");
  }
  // Never silently replace a signed-in user's session with another account.
  const current = await getCurrentSession();
  if (current && current.user.email !== identity.email) throw new OidcFlowError("account_switch");
  const user = await resolveUser(provider, identity);
  await createSession(user.id);
  if (provider.kind === "workspace") {
    await db.update(workspaceSsoProviders).set({ lastLoginAt: new Date() }).where(eq(workspaceSsoProviders.id, provider.key));
  }
  void logAudit("auth.login", {
    actor: { id: user.id, email: user.email },
    workspaceId: provider.workspaceId,
    meta: { via: "oidc", provider: provider.key === INSTANCE_PROVIDER_KEY ? "instance" : provider.key, issuer: identity.issuer },
  });
  return { redirectTo: safeNext(flow.next) ?? "/" };
}

/** Records a failed SSO attempt (reason code only — no tokens or IdP payloads). */
export function auditSsoFailure(reason: string, detail?: string) {
  void logAudit("auth.sso_failed", { meta: { reason, ...(detail ? { detail: detail.slice(0, 200) } : {}) } });
}

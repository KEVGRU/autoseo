import "server-only";
import { and, asc, eq, gt, inArray, isNotNull, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { roles, sessions, users, workspaceDomains, workspaces, workspaceSsoProviders } from "@/server/db/schema";
import { encryptJson, randomToken } from "@/server/crypto";
import { logAudit } from "@/server/audit";
import { rateLimit } from "@/server/rate-limit";
import type { Permission } from "@/server/auth/permissions";
import { isPublicMailDomain, normalizeDomainInput, verificationRecord } from "./domain";
import { checkDomainTxt } from "./dns";
import { forgetOidcConfig, parseIssuerUrl, testOidcDiscovery } from "./client";
import { activeDomainCondition, decryptSecret, DNS_PROOF_MAX_AGE_DAYS } from "./providers";

/**
 * Per-workspace SSO: verified email domains + the workspace's OIDC provider. Callers check who may configure it
 * (instance admin, or the workspace owner when `auth.allowWorkspaceSso` is on — see sso-actions.ts).
 */

type Actor = { id: string; email: string };
export type Grantor = { isInstanceAdmin: boolean; permissions: Set<Permission> };

export class SsoConfigError extends Error {}

const MAX_DOMAINS = 20;

export type WorkspaceSsoView = {
  domains: {
    id: string;
    domain: string;
    record: string;
    verified: boolean;
    verifiedVia: "dns" | "admin" | null;
    verifiedAt: string | null;
    /** Counts for sign-ins right now (admin-confirmed, or DNS proof re-confirmed within the last days). */
    active: boolean;
    lastCheckedAt: string | null;
    lastError: string | null;
    /** Verified by another workspace — this claim can never be verified. */
    takenElsewhere: boolean;
  }[];
  provider: {
    id: string;
    name: string;
    enabled: boolean;
    issuerUrl: string;
    clientId: string;
    secretSet: boolean;
    scopes: string;
    jitProvisioning: boolean;
    defaultRoleKey: string;
    groupClaim: string;
    groupRoleMap: Record<string, string>;
    enforceSso: boolean;
    lastLoginAt: string | null;
    updatedAt: string;
  } | null;
};

export async function getWorkspaceSsoView(workspaceId: string): Promise<WorkspaceSsoView> {
  const [domainRows, providerRows, takenRows] = await Promise.all([
    db.select().from(workspaceDomains).where(eq(workspaceDomains.workspaceId, workspaceId)).orderBy(asc(workspaceDomains.domain)),
    db.select().from(workspaceSsoProviders).where(eq(workspaceSsoProviders.workspaceId, workspaceId)).limit(1),
    db
      .select({ domain: workspaceDomains.domain })
      .from(workspaceDomains)
      .where(and(ne(workspaceDomains.workspaceId, workspaceId), isNotNull(workspaceDomains.verifiedAt))),
  ]);
  const taken = new Set(takenRows.map((r) => r.domain));
  const p = providerRows[0];
  return {
    domains: domainRows.map((d) => ({
      id: d.id,
      domain: d.domain,
      record: verificationRecord(d.verificationToken),
      verified: Boolean(d.verifiedAt),
      verifiedVia: d.verifiedVia ?? null,
      verifiedAt: d.verifiedAt?.toISOString() ?? null,
      active: Boolean(d.verifiedAt) && (d.verifiedVia === "admin" || dnsProofIsFresh(d)),
      lastCheckedAt: d.lastCheckedAt?.toISOString() ?? null,
      lastError: d.lastError,
      takenElsewhere: !d.verifiedAt && taken.has(d.domain),
    })),
    provider: p
      ? {
          id: p.id,
          name: p.name,
          enabled: p.enabled,
          issuerUrl: p.issuerUrl,
          clientId: p.clientId,
          secretSet: Boolean(decryptSecret(p.clientSecret)),
          scopes: p.scopes,
          jitProvisioning: p.jitProvisioning,
          defaultRoleKey: p.defaultRoleKey,
          groupClaim: p.groupClaim,
          groupRoleMap: p.groupRoleMap,
          enforceSso: p.enforceSso,
          lastLoginAt: p.lastLoginAt?.toISOString() ?? null,
          updatedAt: p.updatedAt.toISOString(),
        }
      : null,
  };
}

/* ───────────────────────────── Domains ───────────────────────────── */

export async function addWorkspaceDomain(workspaceId: string, raw: string, actor: Actor) {
  const domain = normalizeDomainInput(raw);
  if (!domain) throw new SsoConfigError(`"${raw.slice(0, 80)}" is not a valid domain (e.g. example.com).`);
  if (isPublicMailDomain(domain)) throw new SsoConfigError(`${domain} is a public email provider and can't be used for single sign-on.`);
  const existing = await db.select().from(workspaceDomains).where(eq(workspaceDomains.workspaceId, workspaceId));
  if (existing.some((d) => d.domain === domain)) throw new SsoConfigError(`${domain} was already added.`);
  if (existing.length >= MAX_DOMAINS) throw new SsoConfigError(`A workspace can claim at most ${MAX_DOMAINS} domains.`);
  const [taken] = await db
    .select({ id: workspaceDomains.id })
    .from(workspaceDomains)
    .where(and(eq(workspaceDomains.domain, domain), isNotNull(workspaceDomains.verifiedAt)))
    .limit(1);
  if (taken) throw new SsoConfigError(`${domain} is already verified by another workspace. A domain can belong to one workspace only.`);
  const [row] = await db
    .insert(workspaceDomains)
    .values({ workspaceId, domain, verificationToken: randomToken(24).replace(/[^A-Za-z0-9]/g, "").slice(0, 32), createdBy: actor.id })
    .returning();
  void logAudit("sso.domain_added", { actor, targetType: "domain", targetId: row!.id, workspaceId, meta: { domain } });
  return row!;
}

async function loadDomain(workspaceId: string, domainId: string) {
  const [row] = await db
    .select()
    .from(workspaceDomains)
    .where(and(eq(workspaceDomains.id, domainId), eq(workspaceDomains.workspaceId, workspaceId)))
    .limit(1);
  if (!row) throw new SsoConfigError("Domain not found.");
  return row;
}

function isUniqueViolation(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

async function markVerified(row: typeof workspaceDomains.$inferSelect, via: "dns" | "admin") {
  const now = new Date();
  try {
    await db
      .update(workspaceDomains)
      .set({ verifiedAt: row.verifiedAt ?? now, verifiedVia: via, confirmedAt: via === "dns" ? now : null, failedChecks: 0, lastCheckedAt: now, lastError: null })
      .where(eq(workspaceDomains.id, row.id));
  } catch (err) {
    if (isUniqueViolation(err)) throw new SsoConfigError(`${row.domain} is already verified by another workspace.`);
    throw err;
  }
}

function dnsProofIsFresh(row: typeof workspaceDomains.$inferSelect) {
  return Boolean(row.confirmedAt && Date.now() - row.confirmedAt.getTime() < DNS_PROOF_MAX_AGE_DAYS * 86_400_000);
}

/** Drops a verification (frees the domain for other workspaces) and records why. */
async function unverify(row: typeof workspaceDomains.$inferSelect, reason: string) {
  await db
    .update(workspaceDomains)
    .set({ verifiedAt: null, verifiedVia: null, confirmedAt: null, failedChecks: 0, lastCheckedAt: new Date(), lastError: reason })
    .where(eq(workspaceDomains.id, row.id));
  void logAudit("sso.domain_unverified", { targetType: "domain", targetId: row.id, workspaceId: row.workspaceId, meta: { domain: row.domain, reason } });
}

/**
 * A domain verified by another workspace can be taken over only when that workspace's DNS proof is gone: its TXT
 * record is re-checked on the spot (admin-confirmed domains are never taken over).
 */
async function releaseStaleHolder(row: typeof workspaceDomains.$inferSelect) {
  const [holder] = await db
    .select()
    .from(workspaceDomains)
    .where(and(eq(workspaceDomains.domain, row.domain), ne(workspaceDomains.workspaceId, row.workspaceId), isNotNull(workspaceDomains.verifiedAt)))
    .limit(1);
  if (!holder) return;
  if (holder.verifiedVia !== "dns") throw new SsoConfigError(`${row.domain} is already verified by another workspace.`);
  const still = await checkDomainTxt(holder.domain, holder.verificationToken);
  if (still.verified) throw new SsoConfigError(`${row.domain} is already verified by another workspace (its DNS record is still in place).`);
  await unverify(holder, "Another workspace proved ownership of this domain and the previous DNS record is gone.");
}

/** Checks the DNS TXT record (rate limited per workspace) and marks the domain verified when it matches. */
export async function verifyWorkspaceDomain(workspaceId: string, domainId: string, actor: Actor) {
  const row = await loadDomain(workspaceId, domainId);
  if (row.verifiedAt && (row.verifiedVia === "admin" || dnsProofIsFresh(row))) return { verified: true as const };
  if (!rateLimit(`sso:dns:${workspaceId}`, 20, 10 * 60_000)) throw new SsoConfigError("Too many checks. Wait a few minutes and try again.");
  const result = await checkDomainTxt(row.domain, row.verificationToken);
  if (!result.verified) {
    await db.update(workspaceDomains).set({ lastCheckedAt: new Date(), lastError: result.error }).where(eq(workspaceDomains.id, row.id));
    return result;
  }
  if (!row.verifiedAt) await releaseStaleHolder(row);
  await markVerified(row, "dns");
  void logAudit("sso.domain_verified", { actor, targetType: "domain", targetId: row.id, workspaceId, meta: { domain: row.domain, via: "dns" } });
  return { verified: true as const };
}

/** Re-checks one DNS-verified domain: success refreshes the proof, the third failure in a row drops it. */
export async function recheckDnsDomain(row: typeof workspaceDomains.$inferSelect): Promise<boolean> {
  const result = await checkDomainTxt(row.domain, row.verificationToken);
  if (result.verified) {
    await db
      .update(workspaceDomains)
      .set({ confirmedAt: new Date(), failedChecks: 0, lastCheckedAt: new Date(), lastError: null })
      .where(eq(workspaceDomains.id, row.id));
    return true;
  }
  const failures = row.failedChecks + 1;
  if (failures >= 3) await unverify(row, `The DNS record was missing on 3 checks in a row: ${result.error}`);
  else await db.update(workspaceDomains).set({ failedChecks: failures, lastCheckedAt: new Date(), lastError: result.error }).where(eq(workspaceDomains.id, row.id));
  return false;
}

/** Daily job: re-confirms every DNS-verified domain (see jobs/handlers/sso.ts). */
export async function recheckAllDnsDomains(): Promise<{ checked: number; failed: number }> {
  const rows = await db
    .select()
    .from(workspaceDomains)
    .where(and(isNotNull(workspaceDomains.verifiedAt), eq(workspaceDomains.verifiedVia, "dns")));
  let failed = 0;
  for (const row of rows) if (!(await recheckDnsDomain(row))) failed++;
  return { checked: rows.length, failed };
}

/** Instance admins may confirm a domain without DNS (self-hosted setups, internal domains). */
export async function adminVerifyWorkspaceDomain(workspaceId: string, domainId: string, actor: Actor) {
  const row = await loadDomain(workspaceId, domainId);
  if (row.verifiedAt) return;
  await markVerified(row, "admin");
  void logAudit("sso.domain_verified", { actor, targetType: "domain", targetId: row.id, workspaceId, meta: { domain: row.domain, via: "admin" } });
}

export async function removeWorkspaceDomain(workspaceId: string, domainId: string, actor: Actor) {
  const row = await loadDomain(workspaceId, domainId);
  await db.delete(workspaceDomains).where(eq(workspaceDomains.id, row.id));
  void logAudit("sso.domain_removed", { actor, targetType: "domain", targetId: row.id, workspaceId, meta: { domain: row.domain } });
}

/* ───────────────────────────── Provider ───────────────────────────── */

export type ProviderInput = {
  name: string;
  enabled: boolean;
  issuerUrl: string;
  clientId: string;
  /** undefined / "__keep__" keeps the stored secret, "" clears it. */
  clientSecret?: string;
  scopes: string;
  jitProvisioning: boolean;
  defaultRoleKey: string;
  groupClaim: string;
  groupRoleMap: Record<string, string>;
  enforceSso: boolean;
  /** When this save turns "Require SSO" on: sign out existing sessions of people on the verified domains. */
  signOutExisting?: boolean;
};

/**
 * Roles SSO may hand out: existing, never granting instance administration, and — for non-instance-admins — no
 * permission the configuring person doesn't hold themselves (no escalation through the IdP's group claims).
 */
export async function assertSsoRoles(roleKeys: string[], grantor: Grantor) {
  const rows = await db.select().from(roles);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  for (const key of new Set(roleKeys)) {
    const role = byKey.get(key);
    if (!role) throw new SsoConfigError(`Unknown role "${key}".`);
    if (role.permissions.includes("admin.access")) throw new SsoConfigError(`The “${role.name}” role grants instance administration and can't be assigned through SSO.`);
    if (!grantor.isInstanceAdmin && role.permissions.some((p) => !grantor.permissions.has(p as Permission))) {
      throw new SsoConfigError(`You can't assign the “${role.name}” role through SSO — it has permissions you don't have.`);
    }
  }
}

export function cleanScopes(raw: string): string {
  const list = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^[\x21\x23-\x5b\x5d-\x7e]{1,64}$/.test(s));
  for (const req of ["openid", "email"]) if (!list.includes(req)) list.unshift(req);
  return [...new Set(list)].slice(0, 20).join(" ");
}

export function cleanGroupMap(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [group, role] of Object.entries(map).slice(0, 100)) {
    const g = group.trim().slice(0, 200);
    const r = role.trim();
    if (g && r) out[g] = r;
  }
  return out;
}

export async function saveWorkspaceSsoProvider(workspaceId: string, input: ProviderInput, grantor: Grantor, actor: Actor) {
  // Kept exactly as entered: the issuer must match the IdP's `issuer` value (some end with "/", e.g. Auth0).
  const issuerUrl = input.issuerUrl.trim();
  try {
    await parseIssuerUrl(issuerUrl);
  } catch (err) {
    throw new SsoConfigError(err instanceof Error ? err.message : "Invalid issuer URL.");
  }
  const clientId = input.clientId.trim();
  if (!clientId || clientId.length > 256) throw new SsoConfigError("Client ID is required.");
  const groupRoleMap = cleanGroupMap(input.groupRoleMap);
  await assertSsoRoles([input.defaultRoleKey, ...Object.values(groupRoleMap)], grantor);

  const [current] = await db.select().from(workspaceSsoProviders).where(eq(workspaceSsoProviders.workspaceId, workspaceId)).limit(1);
  // Pointing sign-ins at a (new) IdP requires a current DNS proof: an old verification alone must not let someone
  // who lost control of the domain redirect its users to an IdP of their choice.
  const retargeted = !current || current.issuerUrl !== issuerUrl || current.clientId !== clientId || (!current.enabled && input.enabled);
  if (retargeted && input.enabled) {
    const dnsDomains = await db
      .select()
      .from(workspaceDomains)
      .where(and(eq(workspaceDomains.workspaceId, workspaceId), isNotNull(workspaceDomains.verifiedAt), eq(workspaceDomains.verifiedVia, "dns")));
    const failed: string[] = [];
    for (const d of dnsDomains) if (!(await recheckDnsDomain(d))) failed.push(d.domain);
    if (failed.length) {
      throw new SsoConfigError(`The DNS record for ${failed.join(", ")} is no longer in place — add it again (see Domains) before enabling this provider.`);
    }
  }
  const keep = input.clientSecret === undefined || input.clientSecret === "__keep__";
  let secret: string | null;
  if (keep) {
    // A kept secret must never follow a changed destination (issuer / client) — re-enter it.
    if (current && (current.issuerUrl !== issuerUrl || current.clientId !== clientId) && decryptSecret(current.clientSecret)) {
      throw new SsoConfigError("The issuer or client ID changed — enter the client secret again.");
    }
    secret = current?.clientSecret ?? null;
  } else {
    const value = (input.clientSecret ?? "").trim();
    if (value.length > 2048) throw new SsoConfigError("The client secret is too long.");
    secret = value ? encryptJson(value) : null;
  }
  const values = {
    name: input.name.trim().slice(0, 60) || "Single sign-on",
    enabled: input.enabled,
    issuerUrl,
    clientId,
    clientSecret: secret,
    scopes: cleanScopes(input.scopes),
    jitProvisioning: input.jitProvisioning,
    defaultRoleKey: input.defaultRoleKey,
    groupClaim: input.groupClaim.trim().slice(0, 100) || "groups",
    groupRoleMap,
    enforceSso: input.enforceSso,
    updatedBy: actor.id,
  };
  if (current) forgetOidcConfig(current.issuerUrl);
  const [row] = await db
    .insert(workspaceSsoProviders)
    .values({ workspaceId, ...values, createdBy: actor.id })
    .onConflictDoUpdate({ target: workspaceSsoProviders.workspaceId, set: values })
    .returning();
  const changed = current
    ? (Object.keys(values) as (keyof typeof values)[]).filter((k) => k !== "updatedBy" && JSON.stringify(values[k]) !== JSON.stringify(current[k]))
    : Object.keys(values).filter((k) => k !== "updatedBy");
  void logAudit(current ? "sso.provider_updated" : "sso.provider_created", {
    actor,
    targetType: "sso_provider",
    targetId: row!.id,
    workspaceId,
    // The secret is never logged — only whether it changed.
    meta: { changed: changed.map((k) => (k === "clientSecret" ? "clientSecret(changed)" : k)), enabled: values.enabled, enforceSso: values.enforceSso, issuerUrl },
  });
  // Existing (magic-link) sessions would otherwise keep working for up to a year after SSO becomes mandatory.
  const nowEnforced = values.enabled && values.enforceSso && !(current?.enabled && current.enforceSso);
  let signedOut: { users: number; sessions: number } | null = null;
  if (nowEnforced && input.signOutExisting) {
    const domains = await db
      .select({ domain: workspaceDomains.domain })
      .from(workspaceDomains)
      .where(and(eq(workspaceDomains.workspaceId, workspaceId), activeDomainCondition()));
    signedOut = await signOutDomainSessions(
      domains.map((d) => d.domain),
      actor,
      { workspaceId, source: "workspace" },
    );
  }
  return { provider: row!, signedOut };
}

/**
 * Signs out every active session of users whose email is on one of `domains` (exact match) — used when SSO becomes
 * mandatory for them. The acting user and instance admins (exempt from SSO enforcement) keep their sessions.
 */
export async function signOutDomainSessions(
  domains: string[],
  actor: Actor,
  context: { workspaceId: string | null; source: "instance" | "workspace" },
): Promise<{ users: number; sessions: number }> {
  const list = [...new Set(domains.map((d) => d.trim().toLowerCase()).filter(Boolean))];
  if (!list.length) return { users: 0, sessions: 0 };
  const affectedUsers = db
    .select({ id: users.id })
    .from(users)
    .where(and(ne(users.id, actor.id), eq(users.isInstanceAdmin, false), inArray(sql`lower(substring(${users.email} from '@([^@]+)$'))`, list)));
  const revoked = await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date()), inArray(sessions.userId, affectedUsers)))
    .returning({ userId: sessions.userId });
  const result = { users: new Set(revoked.map((r) => r.userId)).size, sessions: revoked.length };
  void logAudit("sso.sessions_revoked", {
    actor,
    targetType: "sso",
    targetId: context.source,
    workspaceId: context.workspaceId,
    meta: { domains: list, ...result },
  });
  return result;
}

export async function deleteWorkspaceSsoProvider(workspaceId: string, actor: Actor) {
  const [row] = await db.delete(workspaceSsoProviders).where(eq(workspaceSsoProviders.workspaceId, workspaceId)).returning();
  if (!row) return;
  forgetOidcConfig(row.issuerUrl);
  void logAudit("sso.provider_deleted", { actor, targetType: "sso_provider", targetId: row.id, workspaceId, meta: { issuerUrl: row.issuerUrl } });
}

/** Instance admins can switch a workspace's provider off (e.g. a misconfigured customer IdP). */
export async function setWorkspaceSsoEnabled(workspaceId: string, enabled: boolean, actor: Actor) {
  const [row] = await db.update(workspaceSsoProviders).set({ enabled, updatedBy: actor.id }).where(eq(workspaceSsoProviders.workspaceId, workspaceId)).returning();
  if (!row) throw new SsoConfigError("This workspace has no SSO provider.");
  void logAudit(enabled ? "sso.provider_enabled" : "sso.provider_disabled", { actor, targetType: "sso_provider", targetId: row.id, workspaceId });
}

export async function testWorkspaceSso(workspaceId: string) {
  const [row] = await db.select().from(workspaceSsoProviders).where(eq(workspaceSsoProviders.workspaceId, workspaceId)).limit(1);
  if (!row) throw new SsoConfigError("Save the provider first.");
  if (!rateLimit(`sso:test:${workspaceId}`, 20, 10 * 60_000)) throw new SsoConfigError("Too many tests. Wait a few minutes.");
  try {
    return await testOidcDiscovery({ issuerUrl: row.issuerUrl, clientId: row.clientId, clientSecret: decryptSecret(row.clientSecret) });
  } catch (err) {
    throw new SsoConfigError(`Discovery failed: ${err instanceof Error ? err.message.slice(0, 200) : "unknown error"}`);
  }
}

/** Instance-admin overview: every workspace with SSO domains or a provider. */
export async function listWorkspaceSsoOverview() {
  const [domainRows, providerRows] = await Promise.all([
    db
      .select({ d: workspaceDomains, wsName: workspaces.name })
      .from(workspaceDomains)
      .innerJoin(workspaces, eq(workspaces.id, workspaceDomains.workspaceId))
      .orderBy(asc(workspaces.name), asc(workspaceDomains.domain)),
    db
      .select({ p: workspaceSsoProviders, wsName: workspaces.name, updatedByEmail: users.email })
      .from(workspaceSsoProviders)
      .innerJoin(workspaces, eq(workspaces.id, workspaceSsoProviders.workspaceId))
      .leftJoin(users, eq(users.id, workspaceSsoProviders.updatedBy)),
  ]);
  const ids = new Set([...domainRows.map((r) => r.d.workspaceId), ...providerRows.map((r) => r.p.workspaceId)]);
  return [...ids].map((workspaceId) => {
    const p = providerRows.find((r) => r.p.workspaceId === workspaceId);
    const ds = domainRows.filter((r) => r.d.workspaceId === workspaceId);
    return {
      workspaceId,
      workspaceName: p?.wsName ?? ds[0]?.wsName ?? workspaceId,
      domains: ds.map((r) => ({ id: r.d.id, domain: r.d.domain, verified: Boolean(r.d.verifiedAt), verifiedVia: r.d.verifiedVia ?? null })),
      provider: p
        ? { id: p.p.id, name: p.p.name, enabled: p.p.enabled, issuerUrl: p.p.issuerUrl, enforceSso: p.p.enforceSso, jit: p.p.jitProvisioning, updatedByEmail: p.updatedByEmail, lastLoginAt: p.p.lastLoginAt?.toISOString() ?? null }
        : null,
    };
  });
}

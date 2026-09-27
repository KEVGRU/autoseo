import "server-only";
import { and, asc, eq, gt, isNotNull, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import { workspaceDomains, workspaces, workspaceSsoProviders } from "@/server/db/schema";
import { decryptJson } from "@/server/crypto";
import { getSetting } from "@/server/settings";
import { isSharedCloud } from "@/server/env";
import { emailDomainOf } from "./domain";

/**
 * SSO providers: one optional instance-wide provider (Admin → Authentication, settings group "sso") and one
 * optional provider per workspace (table workspace_sso_providers) bound to that workspace's verified domains.
 * A workspace provider for a verified domain takes precedence over the instance provider.
 */

export type SsoProvider = {
  /** "instance" or the workspace_sso_providers id. */
  key: string;
  kind: "instance" | "workspace";
  name: string;
  /** Workspace people join on their first SSO sign-in (JIT); null = nowhere configured. */
  workspaceId: string | null;
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  /** Email domains this provider may sign in (exact match). */
  domains: string[];
  /** Domains whose users must use this provider (magic links disabled). */
  enforcedDomains: string[];
  jitProvisioning: boolean;
  defaultRoleKey: string;
  groupClaim: string;
  groupRoleMap: Record<string, string>;
};

export const INSTANCE_PROVIDER_KEY = "instance";

function scopesWithOpenId(scopes: string) {
  const list = scopes.split(/[\s,]+/).filter(Boolean);
  if (!list.includes("openid")) list.unshift("openid");
  if (!list.includes("email")) list.push("email");
  return [...new Set(list)].join(" ");
}

export function decryptSecret(value: string | null): string {
  if (!value) return "";
  try {
    return decryptJson<string>(value);
  } catch {
    return "";
  }
}

export async function getInstanceProvider(): Promise<SsoProvider | null> {
  const s = await getSetting("sso");
  if (!s.enabled || !s.issuerUrl || !s.clientId || !s.allowedDomains.length) return null;
  let workspaceId: string | null = s.jitWorkspaceId || null;
  // The oldest workspace is the operator's own only on self-hosted instances — on the shared cloud it can be a
  // customer tenant, so JIT needs an explicitly chosen workspace there.
  if (!workspaceId && !isSharedCloud()) {
    const [ws] = await db.select({ id: workspaces.id }).from(workspaces).orderBy(asc(workspaces.createdAt)).limit(1);
    workspaceId = ws?.id ?? null;
  }
  return {
    key: INSTANCE_PROVIDER_KEY,
    kind: "instance",
    name: s.name || "Single sign-on",
    workspaceId,
    issuerUrl: s.issuerUrl,
    clientId: s.clientId,
    clientSecret: s.clientSecret,
    scopes: scopesWithOpenId(s.scopes),
    domains: s.allowedDomains,
    enforcedDomains: s.enforceForDomains.filter((d) => s.allowedDomains.includes(d)),
    jitProvisioning: s.jitProvisioning,
    defaultRoleKey: s.defaultRoleKey,
    groupClaim: s.groupClaim,
    groupRoleMap: s.groupRoleMap,
  };
}

/** DNS proofs must be re-confirmed (daily job, see jobs/handlers/sso.ts); older ones stop routing sign-ins. */
export const DNS_PROOF_MAX_AGE_DAYS = 7;

/** Verified domains that currently count: admin-confirmed, or DNS-confirmed within DNS_PROOF_MAX_AGE_DAYS. */
export function activeDomainCondition(): SQL {
  return and(
    isNotNull(workspaceDomains.verifiedAt),
    or(
      eq(workspaceDomains.verifiedVia, "admin"),
      gt(workspaceDomains.confirmedAt, sql`now() - make_interval(days => ${DNS_PROOF_MAX_AGE_DAYS})`),
    ),
  )!;
}

/** Suspended tenants (shared cloud) don't route anyone's sign-in through their IdP. */
function activeWorkspaceCondition(): SQL {
  return isSharedCloud() ? eq(workspaces.status, "active") : sql`true`;
}

async function verifiedDomains(workspaceId: string): Promise<string[]> {
  const rows = await db
    .select({ domain: workspaceDomains.domain })
    .from(workspaceDomains)
    .where(and(eq(workspaceDomains.workspaceId, workspaceId), activeDomainCondition()));
  return rows.map((r) => r.domain);
}

function toProvider(row: typeof workspaceSsoProviders.$inferSelect, domains: string[]): SsoProvider {
  return {
    key: row.id,
    kind: "workspace",
    name: row.name || "Single sign-on",
    workspaceId: row.workspaceId,
    issuerUrl: row.issuerUrl,
    clientId: row.clientId,
    clientSecret: decryptSecret(row.clientSecret),
    scopes: scopesWithOpenId(row.scopes),
    domains,
    enforcedDomains: row.enforceSso ? domains : [],
    jitProvisioning: row.jitProvisioning,
    defaultRoleKey: row.defaultRoleKey,
    groupClaim: row.groupClaim,
    groupRoleMap: row.groupRoleMap,
  };
}

/** Enabled workspace provider with at least one verified domain. */
export async function getWorkspaceProviderById(id: string): Promise<SsoProvider | null> {
  const [found] = await db
    .select({ row: workspaceSsoProviders })
    .from(workspaceSsoProviders)
    .innerJoin(workspaces, eq(workspaces.id, workspaceSsoProviders.workspaceId))
    .where(and(eq(workspaceSsoProviders.id, id), activeWorkspaceCondition()))
    .limit(1);
  const row = found?.row;
  if (!row || !row.enabled) return null;
  const domains = await verifiedDomains(row.workspaceId);
  return domains.length ? toProvider(row, domains) : null;
}

export async function getProviderByKey(key: string): Promise<SsoProvider | null> {
  if (key === INSTANCE_PROVIDER_KEY) return getInstanceProvider();
  if (!/^wsso_[a-z0-9]{8,32}$/.test(key)) return null;
  return getWorkspaceProviderById(key);
}

/** SSO provider responsible for an email address (workspace provider of a verified domain first). */
export async function findSsoForEmail(email: string): Promise<{ provider: SsoProvider; enforced: boolean } | null> {
  const domain = emailDomainOf(email);
  if (!domain) return null;
  const [claim] = await db
    .select({ provider: workspaceSsoProviders })
    .from(workspaceDomains)
    .innerJoin(workspaceSsoProviders, eq(workspaceSsoProviders.workspaceId, workspaceDomains.workspaceId))
    .innerJoin(workspaces, eq(workspaces.id, workspaceDomains.workspaceId))
    .where(and(eq(workspaceDomains.domain, domain), activeDomainCondition(), eq(workspaceSsoProviders.enabled, true), activeWorkspaceCondition()))
    .limit(1);
  if (claim) {
    const provider = toProvider(claim.provider, await verifiedDomains(claim.provider.workspaceId));
    return { provider, enforced: provider.enforcedDomains.includes(domain) };
  }
  const instance = await getInstanceProvider();
  if (instance && instance.domains.includes(domain)) return { provider: instance, enforced: instance.enforcedDomains.includes(domain) };
  return null;
}

/** True when magic links (and invitation links) are disabled for this email because its domain requires SSO. */
export async function isSsoEnforcedFor(email: string): Promise<boolean> {
  return Boolean((await findSsoForEmail(email))?.enforced);
}

/** Public info for the login page: the instance provider's button (no secrets). */
export async function loginPageProvider(): Promise<{ name: string } | null> {
  const p = await getInstanceProvider();
  return p ? { name: p.name } : null;
}

/** Login form: whether an email signs in through SSO (provider name + whether magic links are disabled). */
export async function ssoLoginOption(email: string): Promise<{ name: string; enforced: boolean } | null> {
  const found = await findSsoForEmail(email.trim().toLowerCase());
  return found ? { name: found.provider.name, enforced: found.enforced } : null;
}

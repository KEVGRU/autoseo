"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { ActionError, runAction } from "@/server/auth/guards";
import { actionWorkspace, type WorkspaceAccess } from "@/server/admin/access";
import { getSetting } from "@/server/settings";
import type { Permission } from "@/server/auth/permissions";
import {
  SsoConfigError,
  addWorkspaceDomain,
  adminVerifyWorkspaceDomain,
  deleteWorkspaceSsoProvider,
  removeWorkspaceDomain,
  saveWorkspaceSsoProvider,
  testWorkspaceSso,
  verifyWorkspaceDomain,
  type Grantor,
} from "@/server/auth/oidc/workspace-sso";

const id = z.string().min(1).max(64);

async function guarded<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof SsoConfigError) throw new ActionError(err.message, "invalid");
    throw err;
  }
}

/**
 * Workspace SSO is configured by instance admins, or by the workspace owner ("workspace.manage") when the instance
 * allows workspace-level SSO (Admin → Authentication → "Let workspaces configure their own SSO").
 */
async function ssoAccess(workspaceId: string): Promise<{ access: WorkspaceAccess; grantor: Grantor }> {
  const access = await actionWorkspace(workspaceId);
  const grantor: Grantor = { isInstanceAdmin: access.ctx.isInstanceAdmin, permissions: access.membership?.permissions ?? new Set<Permission>() };
  if (access.ctx.isInstanceAdmin) return { access, grantor };
  if (!access.membership?.permissions.has("workspace.manage")) throw new ActionError("Only the workspace owner can configure single sign-on.", "forbidden");
  if (!(await getSetting("auth")).allowWorkspaceSso) {
    throw new ActionError("Workspace single sign-on is not enabled on this instance. Ask your instance administrator.", "forbidden");
  }
  return { access, grantor };
}

export async function addSsoDomainAction(input: { workspaceId: string; domain: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, domain: z.string().trim().min(3).max(260) }).parse(input);
    const { access } = await ssoAccess(data.workspaceId);
    const row = await guarded(() => addWorkspaceDomain(data.workspaceId, data.domain, access.ctx.user));
    refresh();
    return { id: row.id };
  });
}

export async function verifySsoDomainAction(input: { workspaceId: string; domainId: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, domainId: id }).parse(input);
    const { access } = await ssoAccess(data.workspaceId);
    const res = await guarded(() => verifyWorkspaceDomain(data.workspaceId, data.domainId, access.ctx.user));
    refresh();
    return res;
  });
}

/** Instance admins only: confirm a domain without a DNS record. */
export async function adminVerifySsoDomainAction(input: { workspaceId: string; domainId: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, domainId: id }).parse(input);
    const { access } = await ssoAccess(data.workspaceId);
    if (!access.ctx.isInstanceAdmin) throw new ActionError("Only instance administrators can verify domains without DNS.", "forbidden");
    await guarded(() => adminVerifyWorkspaceDomain(data.workspaceId, data.domainId, access.ctx.user));
    refresh();
    return true;
  });
}

export async function removeSsoDomainAction(input: { workspaceId: string; domainId: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id, domainId: id }).parse(input);
    const { access } = await ssoAccess(data.workspaceId);
    await guarded(() => removeWorkspaceDomain(data.workspaceId, data.domainId, access.ctx.user));
    refresh();
    return true;
  });
}

const providerSchema = z.object({
  workspaceId: id,
  name: z.string().max(60),
  enabled: z.boolean(),
  issuerUrl: z.string().trim().min(8).max(500),
  clientId: z.string().trim().min(1).max(256),
  clientSecret: z.string().max(2048).optional(),
  scopes: z.string().max(500),
  jitProvisioning: z.boolean(),
  defaultRoleKey: z.string().min(1).max(64),
  groupClaim: z.string().max(100),
  groupRoleMap: z.record(z.string().max(200), z.string().max(64)),
  enforceSso: z.boolean(),
  signOutExisting: z.boolean().optional(),
});

export async function saveSsoProviderAction(input: z.input<typeof providerSchema>) {
  return runAction(async () => {
    const { workspaceId, ...data } = providerSchema.parse(input);
    const { access, grantor } = await ssoAccess(workspaceId);
    const res = await guarded(() => saveWorkspaceSsoProvider(workspaceId, data, grantor, access.ctx.user));
    refresh();
    return { signedOut: res.signedOut };
  });
}

export async function deleteSsoProviderAction(input: { workspaceId: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id }).parse(input);
    const { access } = await ssoAccess(data.workspaceId);
    await guarded(() => deleteWorkspaceSsoProvider(data.workspaceId, access.ctx.user));
    refresh();
    return true;
  });
}

export async function testSsoProviderAction(input: { workspaceId: string }) {
  return runAction(async () => {
    const data = z.object({ workspaceId: id }).parse(input);
    await ssoAccess(data.workspaceId);
    return guarded(() => testWorkspaceSso(data.workspaceId));
  });
}

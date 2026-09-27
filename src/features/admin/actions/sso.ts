"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { actionAdmin, ActionError, runAction } from "@/server/auth/guards";
import { getSetting } from "@/server/settings";
import { rateLimit } from "@/server/rate-limit";
import { testOidcDiscovery } from "@/server/auth/oidc/client";
import { SsoConfigError, setWorkspaceSsoEnabled, signOutDomainSessions } from "@/server/auth/oidc/workspace-sso";

/** Discovery test of the saved instance provider (Admin → Authentication → Single sign-on). */
export async function testInstanceSsoAction() {
  return runAction(async () => {
    const ctx = await actionAdmin();
    if (!rateLimit(`sso:test:instance:${ctx.user.id}`, 20, 10 * 60_000)) throw new ActionError("Too many tests. Wait a few minutes.", "invalid");
    const s = await getSetting("sso");
    if (!s.issuerUrl || !s.clientId) throw new ActionError("Enter and save the issuer URL and client ID first.", "invalid");
    try {
      return await testOidcDiscovery({ issuerUrl: s.issuerUrl, clientId: s.clientId, clientSecret: s.clientSecret });
    } catch (err) {
      throw new ActionError(`Discovery failed: ${err instanceof Error ? err.message.slice(0, 200) : "unknown error"}`, "invalid");
    }
  });
}

/** Switch a workspace's own SSO provider on/off (e.g. a misconfigured customer IdP). */
export async function setWorkspaceSsoEnabledAction(input: { workspaceId: string; enabled: boolean }) {
  return runAction(async () => {
    const ctx = await actionAdmin();
    const data = z.object({ workspaceId: z.string().min(1).max(64), enabled: z.boolean() }).parse(input);
    try {
      await setWorkspaceSsoEnabled(data.workspaceId, data.enabled, ctx.user);
    } catch (err) {
      if (err instanceof SsoConfigError) throw new ActionError(err.message, "invalid");
      throw err;
    }
    refresh();
    return true;
  });
}

/**
 * After "Require SSO" was turned on for domains of the instance provider: signs out existing sessions of people on
 * those domains (the acting admin and instance admins keep theirs). Only domains that are enforced right now.
 */
export async function signOutInstanceSsoDomainsAction(input: { domains: string[] }) {
  return runAction(async () => {
    const ctx = await actionAdmin();
    const domains = z.array(z.string().trim().toLowerCase().max(253)).min(1).max(100).parse(input.domains);
    const s = await getSetting("sso");
    if (!s.enabled) throw new ActionError("Single sign-on is not enabled.", "invalid");
    const notEnforced = domains.filter((d) => !s.enforceForDomains.includes(d));
    if (notEnforced.length) throw new ActionError(`SSO isn't required for ${notEnforced.join(", ")}.`, "invalid");
    return signOutDomainSessions(domains, ctx.user, { workspaceId: null, source: "instance" });
  });
}

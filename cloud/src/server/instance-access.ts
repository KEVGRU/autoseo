import "server-only";
import type { User } from "@/server/db/schema";
import { env } from "@/server/env";
import { getUserInstance } from "@/server/instances";
import { getInstanceSsoSecret } from "@/server/provisioning";
import { signSsoToken, ssoUrl, ssoUrlAt } from "@/server/sso";
import { logEvent } from "@/server/events";
import { rateLimit } from "@/server/rate-limit";

/**
 * URL that signs the owner in with a 2-minute token (docs/CLOUD.md, MANAGED_INSTANCES.md → SSO):
 * - shared workspace: signed with CLOUD_SSO_SECRET, opens the shared app (the user lands in their workspace);
 * - dedicated instance: signed with the instance's own secret.
 * Null when the workspace / instance isn't running.
 */
export async function instanceSsoRedirect(user: User): Promise<string | null> {
  const instance = await getUserInstance(user.id);
  if (!instance || instance.status !== "running") return null;
  if (!rateLimit(`sso:${user.id}`, 30, 60 * 60 * 1000)) return null;
  if (instance.backend === "shared") {
    if (!env.sharedApp.ssoSecret) return null;
    await logEvent("instance.sso", { userId: user.id, instanceId: instance.id, data: { backend: "shared" } });
    return ssoUrlAt(env.sharedApp.publicUrl, signSsoToken(env.sharedApp.ssoSecret, user.email));
  }
  const secret = await getInstanceSsoSecret(instance);
  if (!secret) return null;
  await logEvent("instance.sso", { userId: user.id, instanceId: instance.id });
  return ssoUrl(instance.host, signSsoToken(secret, user.email));
}

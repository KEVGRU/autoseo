import "server-only";
import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { instances, type Instance, type User } from "@/server/db/schema";
import { getUserInstance } from "@/server/instances";
import { isSharedBackendConfigured } from "@/server/env";
import { chooseBackend } from "@/server/tenant-rules";
import { resolveInstanceAddress } from "@/server/instance-address";
import { validateWorkspaceName } from "@/server/workspace-name";
import { CheckoutAlreadyPaidError, settleReservation } from "@/server/stripe";
import { provisionInstance } from "@/server/provisioning";
import { logEvent } from "@/server/events";

export type ComplimentaryResult = { ok: true; instance: Instance; converted: boolean } | { ok: false; error: string };

/**
 * Creates a complimentary (not billed) instance for `owner` and starts provisioning after the response. The same
 * address and workspace-name rules as checkout apply. An unpaid reservation of the owner is converted — after its
 * open checkout was expired; if it turns out to be paid already, nothing changes. Callers must check admin rights.
 */
export async function createComplimentaryInstance(opts: {
  owner: User;
  /** Only used for dedicated instances (shared workspaces get an internal address). */
  slug?: string;
  workspaceName: string;
  grantedBy: string;
  /** Admin asked for a dedicated Coolify instance instead of a shared workspace. */
  dedicated?: boolean;
}): Promise<ComplimentaryResult> {
  const name = validateWorkspaceName(opts.workspaceName);
  if (!name.ok) return { ok: false, error: name.error };

  const existing = await getUserInstance(opts.owner.id);
  if (existing && existing.status !== "pending_payment") {
    return { ok: false, error: `${opts.owner.email} already has an instance (${existing.host}).` };
  }
  if (existing && (await settleReservation(existing)) === "keep") {
    // The reservation was paid (or has a live subscription) in the meantime: it is being provisioned normally.
    return { ok: false, error: new CheckoutAlreadyPaidError().message };
  }

  // A converted reservation keeps its backend; new ones go where new customers go (or dedicated on request).
  const backend = existing?.backend ?? chooseBackend({ sharedConfigured: isSharedBackendConfigured(), dedicated: opts.dedicated });
  const keepAddress = existing && existing.backend === "shared";
  const address = keepAddress
    ? { ok: true as const, slug: existing.slug, host: existing.host }
    : await resolveInstanceAddress({ backend, slug: opts.slug, exceptInstanceId: existing?.id });
  if (!address.ok) return { ok: false, error: address.error };
  const values = {
    backend,
    slug: address.slug,
    host: address.host,
    workspaceName: name.value,
    status: "provisioning" as const,
    complimentary: true,
    grantedBy: opts.grantedBy,
    stripeCheckoutSessionId: null,
    error: null,
    startRequestedAt: null,
    provisionAttempts: 0,
    nextProvisionAt: null,
  };

  let instance: Instance | undefined;
  try {
    [instance] = existing
      ? await db
          .update(instances)
          .set(values)
          .where(and(eq(instances.id, existing.id), eq(instances.status, "pending_payment")))
          .returning()
      : await db
          .insert(instances)
          .values({ userId: opts.owner.id, ...values })
          .returning();
  } catch {
    // Unique indexes: the address was just taken, or the user got an instance concurrently.
    return { ok: false, error: "This address was just taken, or the account already has an instance. Please try again." };
  }
  if (!instance) return { ok: false, error: "The reservation changed in the meantime. Please reload and try again." };

  await logEvent("instance.complimentary_created", {
    userId: opts.owner.id,
    instanceId: instance.id,
    data: { grantedBy: opts.grantedBy, slug: instance.slug, owner: opts.owner.email, backend, converted: !!existing },
  });
  const instanceId = instance.id;
  after(() => provisionInstance(instanceId, `admin:${opts.grantedBy}`));
  return { ok: true, instance, converted: !!existing };
}

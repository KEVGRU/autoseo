"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { refresh } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { instances } from "@/server/db/schema";
import { assertUser, AuthError } from "@/server/auth/guards";
import { checkSlugAvailability, getUserInstance } from "@/server/instances";
import { instanceHost } from "@/server/compose";
import { getSetting } from "@/server/settings";
import {
  BillingError,
  CheckoutAlreadyPaidError,
  createCheckoutSession,
  createPortalSession,
  settleCheckoutSession,
} from "@/server/stripe";
import { isSubscriptionLive } from "@/server/billing-rules";
import { provisionInstance, restartInstance, retryProvisioning } from "@/server/provisioning";
import { instanceOptions } from "@/server/instance-options";
import { instanceSsoRedirect } from "@/server/instance-access";
import { rateLimit } from "@/server/rate-limit";
import { logEvent } from "@/server/events";
import { validateWorkspaceName } from "@/server/workspace-name";
import { isSharedBackendConfigured } from "@/server/env";
import { chooseBackend } from "@/server/tenant-rules";
import { resolveInstanceAddress } from "@/server/instance-address";
import { parseBillingPlan } from "@/lib/launch-offer";

export type InstanceActionState = { error?: string; message?: string };

function failure(err: unknown): InstanceActionState {
  if (err instanceof CheckoutAlreadyPaidError) {
    refresh();
    return { message: err.message };
  }
  if (err instanceof AuthError || err instanceof BillingError) return { error: err.message };
  // Raw errors (e.g. from Stripe) stay in the log and /admin → Events.
  const message = err instanceof Error ? err.message : String(err);
  console.error("[instance action]", err);
  void logEvent("customer.action_failed", { data: { error: message } });
  return { error: "Something went wrong. Please try again or contact support." };
}

const startSchema = z.object({
  // Only dedicated instances have a customer-chosen address; shared workspaces get an internal one.
  slug: z.string().trim().toLowerCase().optional().default(""),
  workspaceName: z.string().transform((v, ctx) => {
    const check = validateWorkspaceName(v);
    if (!check.ok) {
      ctx.addIssue({ code: "custom", message: check.error });
      return z.NEVER;
    }
    return check.value;
  }),
});

/** "Continue to payment": reserves the address (pending_payment) and sends the customer to Stripe Checkout. */
export async function startCheckoutAction(_prev: InstanceActionState, formData: FormData): Promise<InstanceActionState> {
  let checkoutUrl: string;
  try {
    const { user } = await assertUser();
    if (!rateLimit(`checkout:${user.id}`, 20, 60 * 60 * 1000)) return { error: "Too many attempts. Please wait a moment." };
    const parsed = startSchema.safeParse({ slug: formData.get("slug") ?? undefined, workspaceName: formData.get("workspaceName") });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

    const plan = parseBillingPlan(formData.get("plan")) ?? "monthly";

    let instance = await getUserInstance(user.id);
    if (instance && instance.status !== "pending_payment") return { error: "You already have a workspace." };
    const backend = instance?.backend ?? chooseBackend({ sharedConfigured: isSharedBackendConfigured() });
    let created = false;
    if (instance && backend === "shared") {
      // Shared workspaces have no address to change: only the name.
      [instance] = await db
        .update(instances)
        .set({ workspaceName: parsed.data.workspaceName })
        .where(eq(instances.id, instance.id))
        .returning();
    } else if (instance) {
      const availability = await checkSlugAvailability(parsed.data.slug, instance.id);
      if (!availability.available) return { error: availability.error };
      const host = instanceHost(availability.slug, (await getSetting("coolify")).baseDomain);
      const addressChanged = instance.host !== host;
      // An open checkout for the old address would carry stale details: replace it (unless it was paid already).
      if (addressChanged && (await settleCheckoutSession(instance)) === "paid") throw new CheckoutAlreadyPaidError();
      [instance] = await db
        .update(instances)
        .set({
          slug: availability.slug,
          host,
          workspaceName: parsed.data.workspaceName,
          ...(addressChanged ? { stripeCheckoutSessionId: null } : {}),
        })
        .where(eq(instances.id, instance.id))
        .returning();
    } else {
      const address = await resolveInstanceAddress({ backend, slug: parsed.data.slug });
      if (!address.ok) return { error: address.error };
      try {
        [instance] = await db
          .insert(instances)
          .values({ userId: user.id, backend, slug: address.slug, host: address.host, workspaceName: parsed.data.workspaceName })
          .returning();
        created = true;
      } catch {
        return { error: backend === "shared" ? "Please try again." : "This address was just taken. Please choose another one." };
      }
      await logEvent("instance.reserved", { userId: user.id, instanceId: instance!.id, data: { slug: address.slug, backend } });
    }

    try {
      checkoutUrl = await createCheckoutSession(user, instance!, plan);
    } catch (err) {
      // Don't keep a reservation the customer never got to pay for.
      if (created) await db.delete(instances).where(eq(instances.id, instance!.id));
      throw err;
    }
  } catch (err) {
    return failure(err);
  }
  redirect(checkoutUrl);
}

/**
 * Pending payment → back to Stripe Checkout; stopped → resubscribe for the same instance and data.
 * Bound to a plan in the dashboard ("yearly" while the launch offer runs); monthly otherwise.
 */
export async function resumeCheckoutAction(planArg?: unknown): Promise<InstanceActionState> {
  let checkoutUrl: string;
  try {
    const { user } = await assertUser();
    const instance = await getUserInstance(user.id);
    if (!instance || !["pending_payment", "stopped"].includes(instance.status)) return { error: "There is nothing to pay for." };
    // Resubscribing only makes sense once the old subscription is over; an unpaid/paused one is fixed in the portal.
    if (instance.status === "stopped" && isSubscriptionLive(instance.subscriptionStatus)) {
      return { error: "Your subscription still exists — update your payment method under “Manage billing” instead." };
    }
    checkoutUrl = await createCheckoutSession(user, instance, parseBillingPlan(planArg) ?? "monthly");
  } catch (err) {
    return failure(err);
  }
  redirect(checkoutUrl);
}

/** Cancels an unpaid reservation (releases the address). */
export async function cancelPendingAction(): Promise<InstanceActionState> {
  try {
    const { user } = await assertUser();
    const instance = await getUserInstance(user.id);
    if (!instance || instance.status !== "pending_payment") return { error: "There is no pending order." };
    if ((await settleCheckoutSession(instance)) === "paid") throw new CheckoutAlreadyPaidError();
    await db.delete(instances).where(and(eq(instances.id, instance.id), eq(instances.status, "pending_payment")));
    await logEvent("instance.reservation_canceled", { userId: user.id, instanceId: instance.id, data: { slug: instance.slug } });
  } catch (err) {
    return failure(err);
  }
  refresh();
  return { message: "Order canceled." };
}

/** "Open AutoSEO": one-click sign-in via a short-lived SSO token. */
export async function openInstanceAction(): Promise<InstanceActionState> {
  let target: string | null;
  try {
    const { user } = await assertUser();
    target = await instanceSsoRedirect(user);
  } catch (err) {
    return failure(err);
  }
  if (!target) return { error: "Your workspace isn't available right now — it may be paused. Contact support if this persists." };
  redirect(target);
}

export async function manageBillingAction(): Promise<InstanceActionState> {
  let url: string;
  try {
    const { user } = await assertUser();
    url = await createPortalSession(user);
  } catch (err) {
    return failure(err);
  }
  redirect(url);
}

export async function restartMyInstanceAction(): Promise<InstanceActionState> {
  try {
    const { user } = await assertUser();
    const instance = await getUserInstance(user.id);
    if (!instance || !["running", "provisioning"].includes(instance.status) || !instance.coolifyServiceUuid) {
      return { error: "Your instance can't be restarted right now." };
    }
    if (!rateLimit(`restart:${user.id}`, 5, 60 * 60 * 1000)) return { error: "Too many restarts. Please wait a while." };
    const res = await restartInstance(instance, `customer:${user.id}`);
    if (!res.ok) return { error: "The restart failed. Please try again or contact support." };
  } catch (err) {
    return failure(err);
  }
  refresh();
  return { message: "Restarting — this takes about a minute." };
}

/** Failed setup: try again (only with a live subscription). */
export async function retryMyInstanceAction(): Promise<InstanceActionState> {
  try {
    const { user } = await assertUser();
    const instance = await getUserInstance(user.id);
    if (!instance || instance.status !== "failed") return { error: "There is nothing to retry." };
    if (!instanceOptions({ ...instance, hasBillingAccount: !!user.stripeCustomerId }).canRetryFailed) {
      return { error: "Your subscription isn't active." };
    }
    if (!rateLimit(`retry:${user.id}`, 5, 60 * 60 * 1000)) return { error: "Too many attempts. Please wait a while or contact support." };
    await retryProvisioning(instance.id, `customer:${user.id}`);
  } catch (err) {
    return failure(err);
  }
  refresh();
  return { message: "Retrying the setup…" };
}

/** "Start again" for a stopped complimentary instance (paid ones are started again by their subscription). */
export async function startMyInstanceAction(): Promise<InstanceActionState> {
  let shared = false;
  try {
    const { user } = await assertUser();
    const instance = await getUserInstance(user.id);
    shared = instance?.backend === "shared";
    if (!instance || !instanceOptions({ ...instance, hasBillingAccount: !!user.stripeCustomerId }).canStart) {
      return { error: "Your instance can't be started from here. Please contact support." };
    }
    if (!rateLimit(`start:${user.id}`, 5, 60 * 60 * 1000)) return { error: "Too many attempts. Please wait a while." };
    const [claimed] = await db
      .update(instances)
      .set({ status: "provisioning", error: null, startRequestedAt: null, provisionAttempts: 0, nextProvisionAt: null })
      .where(
        and(
          eq(instances.id, instance.id),
          eq(instances.status, "stopped"),
          eq(instances.complimentary, true),
          eq(instances.stoppedByAdmin, false),
        ),
      )
      .returning({ id: instances.id });
    if (!claimed) return { error: "Your instance changed in the meantime. Please reload the page." };
    await logEvent("instance.start_requested", { userId: user.id, instanceId: instance.id, data: { actor: "customer", complimentary: true } });
    after(() => provisionInstance(instance.id, `customer:${user.id}`));
  } catch (err) {
    return failure(err);
  }
  refresh();
  return {
    message: shared ? "Resuming your workspace…" : "Starting your instance — this takes a minute or two.",
  };
}

"use client";

import { useActionState, useState } from "react";
import { ArrowRight, CircleAlert, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { startCheckoutAction, type InstanceActionState } from "@/server/actions/instance";
import { adminCreateOwnInstanceAction, type AdminActionState } from "@/server/actions/admin";
import { SlugField, useInstanceNaming, useSlugAvailability, WorkspaceNameField } from "@/components/account/slug-field";
import { PlanPicker } from "@/components/account/dashboard/plan-picker";
import { useLaunchOffer } from "@/components/launch-offer/offer-client";
import { formatUsd, launchOffer, type BillingPlan, type LaunchOfferStatus } from "@/lib/launch-offer";
import { site } from "@/lib/site";

export function NewInstanceForm({
  baseDomain,
  billingReady,
  shared = false,
  isAdmin = false,
  initial,
  offer,
  defaultPlan,
}: {
  baseDomain: string;
  billingReady: boolean;
  /** Shared workspace (only a name) instead of a dedicated instance at a chosen address. */
  shared?: boolean;
  /** Admins also get "Create without payment" (checked again on the server). */
  isAdmin?: boolean;
  initial?: { slug: string; workspaceName: string };
  /** Launch offer state; while it's open the customer picks yearly (discounted) or monthly. */
  offer?: LaunchOfferStatus;
  defaultPlan?: BillingPlan;
}) {
  const [state, action, pending] = useActionState<InstanceActionState, FormData>(startCheckoutAction, {});
  const [adminState, adminAction, adminPending] = useActionState<AdminActionState, FormData>(adminCreateOwnInstanceAction, {});
  const naming = useInstanceNaming(initial);
  const availability = useSlugAvailability(shared ? "" : naming.slug);
  const ready = !!naming.workspaceName.trim() && (shared || availability.state === "ok");
  const busy = pending || adminPending;
  const error = adminState.error ?? state.error;
  // Closes live at the deadline or sell-out, so nobody submits a yearly checkout the server would refuse.
  const { open: liveOpen } = useLaunchOffer(!!offer?.open);
  const offerOpen = !!offer?.open && liveOpen;
  const [plan, setPlan] = useState<BillingPlan>(offer?.open ? (defaultPlan ?? "yearly") : "monthly");
  const yearly = offerOpen && plan === "yearly";

  return (
    <form action={action} className="space-y-6">
      <WorkspaceNameField id="workspaceName" value={naming.workspaceName} onChange={naming.setWorkspaceName} />
      {!shared && <SlugField id="slug" slug={naming.slug} onChange={naming.setSlug} baseDomain={baseDomain} availability={availability} />}
      {offerOpen && offer ? (
        <PlanPicker value={plan} onChange={setPlan} offer={offer} />
      ) : (
        <input type="hidden" name="plan" value="monthly" />
      )}

      {!billingReady && (
        <Alert>
          <CircleAlert />
          <AlertDescription>
            {isAdmin
              ? `Payments aren't set up yet. As an admin you can create your ${shared ? "workspace" : "instance"} without payment.`
              : "Sign-ups open shortly — payments aren't set up yet. Please check back soon or write to info@codext.de."}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="submit" data-x-add-to-cart size="lg" className="h-12 w-full text-base sm:w-auto sm:px-6" disabled={busy || !billingReady || !ready}>
            {pending ? <Spinner /> : null}
            {yearly
              ? `Continue to payment — ${formatUsd(launchOffer.firstYearUsd)} for your first year`
              : `Continue to payment — $${site.priceMonthlyUsd}/month`}
            {!pending && <ArrowRight />}
          </Button>
          {isAdmin && (
            <Button
              type="submit"
              formAction={adminAction}
              variant="outline"
              size="lg"
              className="h-12 w-full text-base sm:w-auto sm:px-5"
              disabled={busy || !ready}
            >
              {adminPending ? <Spinner /> : <Gift />}
              Create without payment (admin)
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Secure checkout with Stripe. Taxes may apply.{" "}
          {yearly
            ? `The ${launchOffer.percentOff}% discount applies to your first year; it then renews at ${formatUsd(launchOffer.regularYearlyUsd)}/year unless you cancel before the renewal date in the billing portal.`
            : "Cancel anytime from the billing portal."}
          {isAdmin && ` “Create without payment” sets up a complimentary ${shared ? "workspace" : "instance"} for your own account right away.`}
        </p>
      </div>
    </form>
  );
}

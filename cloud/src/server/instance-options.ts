/**
 * What the customer dashboard offers for an instance, depending on how it is paid for. Pure so it can be tested.
 */
import { isSubscriptionLive, subscriptionAction } from "@/server/billing-rules";

export type InstanceOptionsInput = {
  status: string;
  complimentary: boolean;
  subscriptionStatus: string | null;
  stoppedByAdmin: boolean;
  /** The user has a Stripe customer (invoices / payment methods to manage). */
  hasBillingAccount: boolean;
};

export type StoppedAction = "start" | "resubscribe" | "update_payment" | "contact";

export type InstanceOptions = {
  plan: "complimentary" | "subscription";
  /** "Manage billing" / "Billing & invoices". */
  showBilling: boolean;
  /** Primary action while the instance is stopped. */
  stoppedAction: StoppedAction;
  /** "Try again" after a failed setup. */
  canRetryFailed: boolean;
  /** The customer may start a stopped instance themselves (complimentary, not stopped by an admin). */
  canStart: boolean;
};

export function instanceOptions(i: InstanceOptionsInput): InstanceOptions {
  const complimentary = i.complimentary;
  const paymentIssue = ["unpaid", "past_due", "paused"].includes(i.subscriptionStatus ?? "");
  const canStart = complimentary && i.status === "stopped" && !i.stoppedByAdmin;
  let stoppedAction: StoppedAction;
  if (complimentary) stoppedAction = canStart ? "start" : "contact";
  else if (paymentIssue) stoppedAction = "update_payment";
  else if (!isSubscriptionLive(i.subscriptionStatus)) stoppedAction = "resubscribe";
  else stoppedAction = "contact";
  return {
    plan: complimentary ? "complimentary" : "subscription",
    showBilling: complimentary ? i.hasBillingAccount : true,
    stoppedAction,
    canRetryFailed: complimentary || subscriptionAction(i.subscriptionStatus) === "run",
    canStart,
  };
}

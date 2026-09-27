import { describe, expect, it } from "vitest";
import { instanceOptions } from "./instance-options";

const paid = { status: "running", complimentary: false, subscriptionStatus: "active", stoppedByAdmin: false, hasBillingAccount: true };
const free = { status: "running", complimentary: true, subscriptionStatus: null, stoppedByAdmin: false, hasBillingAccount: false };

describe("instanceOptions", () => {
  it("labels complimentary instances and hides billing without a Stripe customer", () => {
    expect(instanceOptions(free)).toMatchObject({ plan: "complimentary", showBilling: false });
    expect(instanceOptions({ ...free, hasBillingAccount: true }).showBilling).toBe(true);
    expect(instanceOptions(paid)).toMatchObject({ plan: "subscription", showBilling: true });
  });

  it("offers 'Start again' for a stopped complimentary instance instead of resubscribing", () => {
    expect(instanceOptions({ ...free, status: "stopped" })).toMatchObject({ stoppedAction: "start", canStart: true });
    // …unless an admin stopped it.
    expect(instanceOptions({ ...free, status: "stopped", stoppedByAdmin: true })).toMatchObject({ stoppedAction: "contact", canStart: false });
    expect(instanceOptions({ ...free, status: "running" }).canStart).toBe(false);
  });

  it("keeps the subscription flows for paid instances", () => {
    expect(instanceOptions({ ...paid, status: "stopped", subscriptionStatus: "canceled" }).stoppedAction).toBe("resubscribe");
    expect(instanceOptions({ ...paid, status: "stopped", subscriptionStatus: "unpaid" }).stoppedAction).toBe("update_payment");
    expect(instanceOptions({ ...paid, status: "stopped", subscriptionStatus: "active" }).stoppedAction).toBe("contact");
    expect(instanceOptions({ ...paid, status: "stopped", subscriptionStatus: "canceled" }).canStart).toBe(false);
  });

  it("lets complimentary and actively paid instances retry a failed setup", () => {
    expect(instanceOptions({ ...free, status: "failed" }).canRetryFailed).toBe(true);
    expect(instanceOptions({ ...paid, status: "failed" }).canRetryFailed).toBe(true);
    expect(instanceOptions({ ...paid, status: "failed", subscriptionStatus: "canceled" }).canRetryFailed).toBe(false);
  });
});

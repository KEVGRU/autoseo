import { Clock } from "lucide-react";
import { Countdown } from "@/components/launch-offer/offer-client";
import { formatUsd, launchOffer, type BillingPlan, type LaunchOfferStatus } from "@/lib/launch-offer";
import { site } from "@/lib/site";

const card =
  "relative flex cursor-pointer gap-3 rounded-xl border bg-background p-4 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-soft/40 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 hover:bg-muted/40 dark:has-[:checked]:bg-brand/10";
const radio = "mt-1 size-4 shrink-0 accent-brand";

/** Yearly (launch offer) or monthly, as a radio group named "plan" inside the checkout form (client-only: used by NewInstanceForm). */
export function PlanPicker({
  value,
  onChange,
  offer,
}: {
  value: BillingPlan;
  onChange: (plan: BillingPlan) => void;
  offer: LaunchOfferStatus;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">Billing</legend>
      <label className={card}>
        <input type="radio" name="plan" value="yearly" checked={value === "yearly"} onChange={() => onChange("yearly")} className={radio} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Yearly — launch offer</span>
            <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-brand-foreground">-{launchOffer.percentOff}% first year</span>
          </span>
          <span className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-xl font-semibold">{formatUsd(launchOffer.firstYearUsd)}</span>
            <span className="text-sm text-muted-foreground line-through">{formatUsd(launchOffer.regularYearlyUsd)}</span>
            <span className="text-sm text-muted-foreground">
              for your first year · {formatUsd(launchOffer.monthlyEquivalentUsd)}/month
            </span>
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Then {formatUsd(launchOffer.regularYearlyUsd)}/year. You save {formatUsd(launchOffer.savingsUsd)}.
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-brand">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              Ends in <Countdown labels={{ days: "d", hours: "h", minutes: "m", seconds: "s" }} showSeconds={false} />
            </span>
            {offer.spotsLeft !== null && (
              <span>
                {offer.spotsLeft} of {offer.spotsTotal} spots left
              </span>
            )}
          </span>
        </span>
      </label>
      <label className={card}>
        <input type="radio" name="plan" value="monthly" checked={value === "monthly"} onChange={() => onChange("monthly")} className={radio} />
        <span className="min-w-0 flex-1">
          <span className="font-semibold">Monthly</span>
          <span className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-xl font-semibold">${site.priceMonthlyUsd}</span>
            <span className="text-sm text-muted-foreground">per month · cancel anytime</span>
          </span>
        </span>
      </label>
    </fieldset>
  );
}

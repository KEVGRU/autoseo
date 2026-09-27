/**
 * The launch offer (see `site.launchOffer`): pure helpers shared by the marketing site, the dashboard and billing.
 * Whether spots are left is only known on the server (Stripe coupon redemptions, see getLaunchOfferStatus).
 */
import { site } from "@/lib/site";

export const BILLING_PLANS = ["monthly", "yearly"] as const;
export type BillingPlan = (typeof BILLING_PLANS)[number];

const { couponId, percentOff, maxRedemptions, endsAt } = site.launchOffer;
const offerYearlyUsd = Math.round((site.priceYearlyUsd * (100 - percentOff)) / 100);

export const launchOffer = {
  couponId,
  percentOff,
  maxRedemptions,
  endsAt,
  endsAtMs: Date.parse(endsAt),
  regularYearlyUsd: site.priceYearlyUsd,
  /** What the first year costs with the offer. */
  firstYearUsd: offerYearlyUsd,
  /** First-year price per month, for "$25/month, billed yearly". */
  monthlyEquivalentUsd: offerYearlyUsd / 12,
  savingsUsd: site.priceYearlyUsd - offerYearlyUsd,
};

/** Live state of the offer; `spotsLeft` is null when it can't be read (billing not set up, Stripe unreachable). */
export type LaunchOfferStatus = {
  open: boolean;
  endsAt: string;
  spotsLeft: number | null;
  spotsTotal: number;
};

export function parseBillingPlan(value: unknown): BillingPlan | null {
  return typeof value === "string" && (BILLING_PLANS as readonly string[]).includes(value) ? (value as BillingPlan) : null;
}

export function spotsLeft(timesRedeemed: number, max: number = launchOffer.maxRedemptions): number {
  return Math.max(0, max - Math.max(0, timesRedeemed));
}

/** Open until the deadline and while spots are left (unknown spots count as open; Stripe has the final say). */
export function isLaunchOfferOpen(now: number, spots: number | null = null): boolean {
  return now < launchOffer.endsAtMs && (spots === null || spots > 0);
}

/** Deadline-only check for server-rendered markup (spots are re-checked on the client and at checkout). */
export function isLaunchOfferOpenNow(): boolean {
  return isLaunchOfferOpen(Date.now());
}

export function offerStatus(now: number, spots: number | null): LaunchOfferStatus {
  return { open: isLaunchOfferOpen(now, spots), endsAt: launchOffer.endsAt, spotsLeft: spots, spotsTotal: launchOffer.maxRedemptions };
}

export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

export function timeLeft(untilMs: number, now: number): TimeLeft {
  const total = Math.max(0, Math.floor((untilMs - now) / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** "$300", "$25", "$12.50". */
export function formatUsd(amount: number): string {
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

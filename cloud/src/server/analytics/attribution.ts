/**
 * Sign-up attribution (pure, unit tested): which of a visitor's recent page views gets the credit, and how the
 * result is passed to Stripe.
 */
import type { Attribution } from "@/server/db/schema";

export type Touch = {
  createdAt: Date;
  channel: string;
  path: string;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  clickSource: string | null;
  country: string | null;
};

/**
 * The most recent touch with a real channel wins (the ad or link that brought the visitor back last); without
 * one the visit is "Direct" and credited to the earliest landing page.
 */
export function pickAttribution(touches: Touch[]): Attribution | null {
  if (!touches.length) return null;
  const sorted = [...touches].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const touch = sorted.findLast((t) => t.channel !== "Direct") ?? sorted[0]!;
  return {
    channel: touch.channel,
    source: touch.utmSource,
    medium: touch.utmMedium,
    campaign: touch.utmCampaign,
    content: touch.utmContent,
    term: touch.utmTerm,
    referrerHost: touch.referrerHost,
    clickSource: touch.clickSource,
    landingPath: touch.path,
    country: touch.country ?? sorted.find((t) => t.country)?.country ?? null,
    firstSeenDay: sorted[0]!.createdAt.toISOString().slice(0, 10),
  };
}

/** The part of an attribution that goes into the `auth.signup` audit event. */
export function attributionSummary(attribution: Attribution | null | undefined) {
  if (!attribution) return {};
  return { channel: attribution.channel, source: attribution.source, campaign: attribution.campaign, content: attribution.content };
}

/**
 * `attr_*` metadata for the Checkout Session and its subscription (Stripe: keys ≤ 40 characters, values ≤ 500,
 * at most 50 keys). Empty values are left out.
 */
export function stripeAttributionMetadata(attribution: Attribution | null | undefined): Record<string, string> {
  if (!attribution) return {};
  const fields: [string, string | null][] = [
    ["attr_channel", attribution.channel],
    ["attr_source", attribution.source],
    ["attr_medium", attribution.medium],
    ["attr_campaign", attribution.campaign],
    ["attr_content", attribution.content],
    ["attr_landing_path", attribution.landingPath],
    ["attr_referrer", attribution.referrerHost],
  ];
  return Object.fromEntries(fields.filter((f): f is [string, string] => !!f[1]).map(([k, v]) => [k, v.slice(0, 500)]));
}

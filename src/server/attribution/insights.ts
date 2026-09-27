/**
 * Attribution insights (pure math — no DB access, safe for tests):
 * - Hidden AI revenue: revenue AI search influences but analytics never sees as an AI referral
 *   (survey AI share × orders × AOV − analytics-attributed AI revenue, floored at 0).
 * - Response rate: share of orders that carry a "How did you hear about us?" answer.
 * - Visibility correlation: Pearson r between daily AI visibility and daily AI-attributed
 *   responses / revenue (null with fewer than MIN_PAIRED_DAYS paired days).
 */

export const MIN_PAIRED_DAYS = 7;

export type HiddenAiRevenueInput = {
  currency: string;
  /** All survey responses in the period and the ones answering "AI search". */
  responses: number;
  aiResponses: number;
  /** Purchases in the period (all currencies) and the ones with a value in `currency`. */
  orders: number;
  valuedOrders: number;
  /** Sum of the valued orders (in `currency`). */
  orderRevenue: number;
  /** Revenue of AI-referred sessions reported by the analytics tool (null = no analytics source). */
  analyticsAiRevenue: number | null;
  analyticsCurrency: string | null;
  analyticsSource: string | null;
};

export type HiddenAiRevenue = {
  /** Estimated revenue AI search drove that analytics did not attribute to AI (null when not computable). */
  value: number | null;
  currency: string;
  /** Survey AI share 0–100. */
  surveyAiShare: number | null;
  orders: number;
  aov: number | null;
  /** surveyAiShare × orders × AOV */
  estimatedAiRevenue: number | null;
  analyticsAiRevenue: number | null;
  analyticsSource: string | null;
  analyticsCurrency: string | null;
  currencyMismatch: boolean;
  /** Why `value` is null (or a caveat), for the UI / API consumers. */
  reason: string | null;
};

const round2 = (v: number) => Math.round(v * 100) / 100;

export function computeHiddenAiRevenue(i: HiddenAiRevenueInput): HiddenAiRevenue {
  const surveyAiShare = i.responses > 0 ? (i.aiResponses / i.responses) * 100 : null;
  const aov = i.valuedOrders > 0 ? i.orderRevenue / i.valuedOrders : null;
  const estimated = surveyAiShare != null && aov != null && i.orders > 0 ? (surveyAiShare / 100) * i.orders * aov : null;
  const currencyMismatch =
    i.analyticsAiRevenue != null && !!i.analyticsCurrency && i.analyticsCurrency.toUpperCase() !== i.currency.toUpperCase();
  const base = {
    currency: i.currency,
    surveyAiShare: surveyAiShare == null ? null : round2(surveyAiShare),
    orders: i.orders,
    aov: aov == null ? null : round2(aov),
    estimatedAiRevenue: estimated == null ? null : round2(estimated),
    analyticsAiRevenue: i.analyticsAiRevenue == null ? null : round2(i.analyticsAiRevenue),
    analyticsSource: i.analyticsSource,
    analyticsCurrency: i.analyticsCurrency,
    currencyMismatch,
  };
  if (i.responses === 0) return { ...base, value: null, reason: "No survey responses in this period." };
  if (i.orders === 0) return { ...base, value: null, reason: "No orders tracked in this period — connect your shop or send conversions." };
  if (aov == null) return { ...base, value: null, reason: `No order values in ${i.currency} to compute the average order value.` };
  if (currencyMismatch)
    return {
      ...base,
      value: null,
      reason: `Analytics reports revenue in ${i.analyticsCurrency}, attribution in ${i.currency} — align the currencies to compare.`,
    };
  const analytics = i.analyticsAiRevenue ?? 0;
  return {
    ...base,
    value: round2(Math.max(0, (estimated ?? 0) - analytics)),
    reason: i.analyticsAiRevenue == null ? "No analytics source connected — nothing subtracted for AI referrals analytics already sees." : null,
  };
}

export type ResponseRate = {
  /** Orders with a survey answer ÷ orders, 0–100 (null without orders). */
  value: number | null;
  orders: number;
  answeredOrders: number;
  responses: number;
};

export function computeResponseRate(input: { orders: number; answeredOrders: number; responses: number }): ResponseRate {
  const answered = Math.min(input.answeredOrders, input.orders);
  return {
    value: input.orders > 0 ? round2((answered / input.orders) * 100) : null,
    orders: input.orders,
    answeredOrders: answered,
    responses: input.responses,
  };
}

/** Pearson correlation coefficient; null for < 2 points or zero variance. */
export function pearson(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  let sx = 0;
  let sy = 0;
  for (let k = 0; k < n; k++) {
    sx += xs[k]!;
    sy += ys[k]!;
  }
  const mx = sx / n;
  const my = sy / n;
  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (let k = 0; k < n; k++) {
    const dx = xs[k]! - mx;
    const dy = ys[k]! - my;
    cov += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  if (vx === 0 || vy === 0) return null;
  return Math.max(-1, Math.min(1, cov / Math.sqrt(vx * vy)));
}

export type CorrelationStrength = "strong" | "moderate" | "weak" | "none";

export function correlationStrength(r: number | null): CorrelationStrength | null {
  if (r == null) return null;
  const a = Math.abs(r);
  if (a >= 0.6) return "strong";
  if (a >= 0.3) return "moderate";
  if (a >= 0.1) return "weak";
  return "none";
}

export type VisibilityCorrelation = {
  /** r(visibility, AI responses per day) */
  responses: number | null;
  /** r(visibility, AI revenue per day) */
  revenue: number | null;
  strength: CorrelationStrength | null;
  pairedDays: number;
  minPairedDays: number;
};

/**
 * Pairs days that have a visibility value (tracking ran) with the AI responses / revenue of the
 * same day. Days without tracking data are skipped (no interpolation).
 */
export function computeVisibilityCorrelation(
  visibility: Array<{ date: string; visibility: number | null }>,
  daily: Array<{ date: string; aiResponses: number; aiRevenue: number }>,
): VisibilityCorrelation {
  const byDay = new Map(daily.map((d) => [d.date, d]));
  const vis: number[] = [];
  const resp: number[] = [];
  const rev: number[] = [];
  for (const v of visibility) {
    if (v.visibility == null) continue;
    const d = byDay.get(v.date);
    vis.push(v.visibility);
    resp.push(d?.aiResponses ?? 0);
    rev.push(d?.aiRevenue ?? 0);
  }
  const pairedDays = vis.length;
  if (pairedDays < MIN_PAIRED_DAYS) return { responses: null, revenue: null, strength: null, pairedDays, minPairedDays: MIN_PAIRED_DAYS };
  const r1 = pearson(vis, resp);
  const r2 = pearson(vis, rev);
  const round = (r: number | null) => (r == null ? null : Math.round(r * 1000) / 1000);
  return {
    responses: round(r1),
    revenue: round(r2),
    strength: correlationStrength(r1 ?? r2),
    pairedDays,
    minPairedDays: MIN_PAIRED_DAYS,
  };
}

export type AttributionInsights = {
  hiddenAiRevenue: HiddenAiRevenue;
  responseRate: ResponseRate;
  visibilityCorrelation: VisibilityCorrelation;
};

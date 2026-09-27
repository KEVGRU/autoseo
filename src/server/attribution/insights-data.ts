import "server-only";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { attributionConversions, trafficRows } from "@/server/db/schema";
import { getTrafficSources } from "@/server/analytics/traffic/queries";
import { getDailySeries } from "@/server/ai/metrics";
import { resolveRange } from "@/features/ai-tracking/period";
import {
  computeHiddenAiRevenue,
  computeResponseRate,
  computeVisibilityCorrelation,
  type AttributionInsights,
} from "./insights";

const day = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Revenue of AI-referred sessions from the first connected analytics source (GA4, Matomo or
 * Piwik PRO — all synced into `analytics_traffic_rows`). null when no source is connected.
 */
async function analyticsAiRevenue(projectId: string, from: Date, to: Date) {
  const sources = await getTrafficSources(projectId);
  const src = sources.find((s) => s.status === "connected");
  if (!src) return null;
  const [row] = await db
    .select({ revenue: sql<number>`coalesce(sum(${trafficRows.revenue}), 0)::float8` })
    .from(trafficRows)
    .where(
      and(
        eq(trafficRows.projectId, projectId),
        eq(trafficRows.provider, src.provider),
        gte(trafficRows.date, day(from)),
        lte(trafficRows.date, day(to)),
      ),
    );
  return { revenue: Number(row?.revenue ?? 0), currency: src.currency, source: src.label };
}

/**
 * Hidden AI revenue, response rate and visibility correlation for the attribution summary.
 * `timeseries` is the summary's daily series (AI responses + AI revenue per day).
 */
export async function loadAttributionInsights(input: {
  projectId: string;
  from: Date;
  to: Date;
  currency: string;
  responses: number;
  aiResponses: number;
  timeseries: Array<{ date: string; ai: number; aiRevenue: number }>;
}): Promise<AttributionInsights> {
  const { projectId, from, to, currency } = input;
  const inRange = and(
    eq(attributionConversions.projectId, projectId),
    gte(attributionConversions.occurredAt, from),
    lte(attributionConversions.occurredAt, to),
  );
  const [[orders], analytics, visibility] = await Promise.all([
    db
      .select({
        purchases: sql<number>`count(*) filter (where ${attributionConversions.kind} = 'purchase')::int`,
        valued: sql<number>`count(*) filter (where ${attributionConversions.kind} = 'purchase' and ${attributionConversions.value} is not null and ${attributionConversions.currency} = ${currency})::int`,
        revenue: sql<number>`coalesce(sum(${attributionConversions.value}) filter (where ${attributionConversions.kind} = 'purchase' and ${attributionConversions.currency} = ${currency}), 0)::float8`,
        conversions: sql<number>`count(*) filter (where ${attributionConversions.kind} <> 'renewal')::int`,
        answered: sql<number>`count(*) filter (where ${attributionConversions.kind} <> 'renewal' and ${attributionConversions.responseId} is not null)::int`,
      })
      .from(attributionConversions)
      .where(inRange),
    analyticsAiRevenue(projectId, from, to),
    getDailySeries({ projectId }, resolveRange("custom", day(from), day(to))),
  ]);

  return {
    hiddenAiRevenue: computeHiddenAiRevenue({
      currency,
      responses: input.responses,
      aiResponses: input.aiResponses,
      orders: Number(orders?.purchases ?? 0),
      valuedOrders: Number(orders?.valued ?? 0),
      orderRevenue: Number(orders?.revenue ?? 0),
      analyticsAiRevenue: analytics?.revenue ?? null,
      analyticsCurrency: analytics?.currency ?? null,
      analyticsSource: analytics?.source ?? null,
    }),
    responseRate: computeResponseRate({
      orders: Number(orders?.conversions ?? 0),
      answeredOrders: Number(orders?.answered ?? 0),
      responses: input.responses,
    }),
    visibilityCorrelation: computeVisibilityCorrelation(
      visibility.map((p) => ({ date: p.date, visibility: p.visibility })),
      input.timeseries.map((t) => ({ date: t.date, aiResponses: t.ai, aiRevenue: t.aiRevenue })),
    ),
  };
}

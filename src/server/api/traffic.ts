import "server-only";
import { z } from "zod";
import { addDays, isValidDate, resolveAnalyticsPeriod, type AnalyticsPeriod } from "@/server/analytics/period";
import { getEngagementBenchmark, getTrafficOverview, getTrafficSources, getTrafficTable, TRAFFIC_PROVIDERS } from "@/server/analytics/traffic/queries";
import { getBotOverview, getConnectorStatuses, getCrawledPages, getPerformance } from "@/server/analytics/bots/queries";
import { getCrawledNotCited, getCrawlerCoverage } from "@/server/analytics/bots/coverage-queries";
import type { TrafficProvider } from "@/server/db/schema";
import { ApiError } from "./errors";

/**
 * AI traffic (human visitors referred by AI assistants, from GA4 / Matomo / Piwik PRO) and AI bot
 * traffic (crawler hits from CDN / server logs) — shared by REST v1 and the MCP tools.
 */

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const periodShape = {
  timeframe: z
    .string()
    .regex(/^\d{1,3}d?$/, "Use e.g. 7d, 30d, 90d")
    .optional()
    .describe("Look-back window ending on the latest complete day, e.g. 7d, 30d (default 30d)."),
  timeframeDays: z.coerce.number().int().min(1).max(486).optional().describe("Alternative to timeframe (number of days, max 486)."),
  startDate: DATE.optional().describe("Custom period start (YYYY-MM-DD); overrides timeframe."),
  endDate: DATE.optional().describe("Custom period end (default: latest complete day)."),
};

/** Keys that may repeat / be comma-separated in the query string. */
export const TRAFFIC_ARRAY_KEYS = ["model", "bots", "status"];

function resolvePeriod(q: { timeframe?: string; timeframeDays?: number; startDate?: string; endDate?: string }, lagDays: number): AnalyticsPeriod {
  if (q.startDate) {
    if (!isValidDate(q.startDate) || (q.endDate && !isValidDate(q.endDate))) throw new ApiError("validation_error", "Dates must be real YYYY-MM-DD dates.");
    return resolveAnalyticsPeriod({ period: "custom", from: q.startDate, to: q.endDate }, { lagDays });
  }
  const days = q.timeframeDays ?? (q.timeframe ? Number.parseInt(q.timeframe, 10) : 30);
  if (!Number.isFinite(days) || days < 1 || days > 486) throw new ApiError("validation_error", "timeframe must be between 1d and 486d.");
  const to = addDays(new Date().toISOString().slice(0, 10), -lagDays);
  return resolveAnalyticsPeriod({ period: "custom", from: addDays(to, -(days - 1)), to }, { lagDays });
}

function periodInfo(p: AnalyticsPeriod) {
  return { from: p.from, to: p.to, days: p.days, previous: { from: p.prevFrom, to: p.prevTo } };
}

const round1 = (v: number | null) => (v == null ? null : Math.round(v * 10) / 10);

/* ───────────────────────────── AI traffic ───────────────────────────── */

export const aiTrafficInput = z.object({
  ...periodShape,
  source: z
    .enum(TRAFFIC_PROVIDERS as [TrafficProvider, ...TrafficProvider[]])
    .optional()
    .describe("Analytics source: google_analytics, matomo, piwik_pro or posthog (default: the first connected one)."),
  by: z
    .enum(["platform", "page", "country", "day"])
    .default("platform")
    .describe("Row dimension: AI platform (ChatGPT, Perplexity…), landing page, country or day."),
  model: z.array(z.string().max(60)).max(30).optional().describe("Only these AI platforms (ids like chatgpt, perplexity, gemini, claude, copilot)."),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});
export type AiTrafficInput = z.infer<typeof aiTrafficInput>;

export async function aiTrafficForApi(projectId: string, q: AiTrafficInput) {
  const sources = await getTrafficSources(projectId);
  const ready = sources.filter((s) => s.status !== "pending");
  const settingsUrl = `/p/${projectId}/analytics/traffic?tab=settings`;
  if (!ready.length) {
    const pending = sources.find((s) => s.status === "pending");
    throw new ApiError(
      "not_connected",
      pending
        ? `${pending.label} is connected but no property is selected yet. Choose it in Analytics → Human Traffic → Settings (${settingsUrl}).`
        : `No analytics source is connected. Connect Google Analytics 4, Matomo or Piwik PRO in Analytics → Human Traffic → Settings (${settingsUrl}) — AI-referred sessions sync daily.`,
      { settingsUrl, sources: sources.map((s) => ({ provider: s.provider, status: s.status })) },
    );
  }
  const source = q.source ? ready.find((s) => s.provider === q.source) : ready[0]!;
  if (!source) {
    throw new ApiError("not_connected", `${q.source} is not connected for this project. Connected: ${ready.map((s) => s.provider).join(", ")}.`, { settingsUrl });
  }
  const provider = source.provider;
  const period = resolvePeriod(q, 1);
  const models = q.model?.map((m) => m.toLowerCase());
  const [overview, benchmark] = await Promise.all([
    getTrafficOverview(projectId, provider, period, "daily"),
    getEngagementBenchmark(projectId, source, period).catch(() => null),
  ]);

  let rows: Record<string, unknown>[];
  if (q.by === "day") {
    const keys = overview.seriesKeys.map((k) => k.key);
    rows = overview.series.map((d) => ({
      date: d.date,
      sessions: keys.reduce((a, k) => a + (Number(d[k]) || 0), 0),
      byPlatform: Object.fromEntries(overview.seriesKeys.map((k) => [k.key, Number(d[k.key]) || 0])),
    }));
  } else {
    const table = await getTrafficTable(projectId, provider, period, {
      by: q.by === "platform" ? "engagement" : q.by === "page" ? "urls" : "location",
      models,
      limit: q.limit,
    });
    rows = table.map((r) => ({
      [q.by === "platform" ? "platform" : q.by === "page" ? "page" : "country"]: r.key === "__unknown__" ? null : r.key,
      label: r.label,
      platforms: r.platforms,
      sessions: r.sessions,
      share: round1(r.share),
      engagedSessions: r.engagedSessions,
      engagementRate: round1(r.engagementRate),
      conversions: r.conversions,
      conversionRate: round1(r.conversionRate),
      revenue: r.revenue,
      avgEngagementSeconds: round1(r.avgTime),
    }));
  }

  const k = overview.kpis;
  return {
    rows: rows.slice(0, q.limit),
    source: {
      provider,
      label: source.label,
      property: source.propertyLabel || null,
      status: source.status,
      currency: source.currency,
      lastSyncAt: source.lastSyncAt,
      syncedThrough: source.syncedThrough,
      lastError: source.lastError,
    },
    period: periodInfo(period),
    by: q.by,
    kpis: {
      sessions: k.sessions,
      sessionsChange: round1(k.sessionsDelta),
      conversions: k.conversions,
      conversionsChange: round1(k.conversionsDelta),
      revenue: k.revenue,
      revenueChange: round1(k.revenueDelta),
      conversionRate: round1(k.conversionRate),
      aiShareOfAllSessions: round1(k.aiShare),
      allSessions: k.allSessions,
      previous: { sessions: k.prevSessions, conversions: k.prevConversions, revenue: k.prevRevenue },
    },
    platforms: overview.platforms.map((p) => ({
      platform: p.platform,
      name: p.name,
      engine: p.engineId,
      sessions: p.sessions,
      share: round1(p.share),
      conversions: p.conversions,
      revenue: p.revenue,
    })),
    benchmark: benchmark
      ? {
          organicStatus: benchmark.organicStatus,
          headline: benchmark.headline,
          note: benchmark.note,
          ai: benchmark.ai,
          organic: benchmark.organic,
          metrics: benchmark.metrics,
        }
      : null,
    hasData: overview.hasData,
  };
}

/* ───────────────────────────── Bot traffic ───────────────────────────── */

const STATUS_CLASSES = ["2xx", "3xx", "4xx", "5xx"] as const;

export const botTrafficInput = z.object({
  ...periodShape,
  by: z
    .enum(["bot", "page", "status", "day", "never_visited", "not_cited"])
    .default("bot")
    .describe(
      "Rows: bot (per crawler), page (crawled pages), status (per page status breakdown), day (daily hits per bot), never_visited (known AI crawlers without visits + robots.txt verdict), not_cited (pages crawled but never cited in AI answers).",
    ),
  bots: z.array(z.string().max(60)).max(30).optional().describe("Only these bots (tokens like GPTBot, ClaudeBot, PerplexityBot)."),
  status: z.array(z.enum(STATUS_CLASSES)).max(4).optional().describe("Status classes for page / status rows: 2xx, 3xx, 4xx, 5xx."),
  search: z.string().trim().max(200).optional().describe("Path substring filter (page / status rows)."),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(10).max(100).default(50).describe("Rows per page (10–100)."),
});
export type BotTrafficInput = z.infer<typeof botTrafficInput>;

export async function botTrafficForApi(projectId: string, q: BotTrafficInput) {
  const period = resolvePeriod(q, 0);
  const syncUrl = `/p/${projectId}/analytics/bots?tab=sync`;
  const overview = await getBotOverview(projectId, period, q.bots ?? []);
  if (!overview.hasAnyData) {
    const connectors = await getConnectorStatuses(projectId);
    if (!connectors.some((c) => c.connected)) {
      throw new ApiError(
        "not_connected",
        `No AI bot traffic yet. Connect Cloudflare (one-click Worker), Akamai or the Server Logs API — or upload access logs — in Analytics → Bot Traffic → Sync (${syncUrl}).`,
        { syncUrl },
      );
    }
  }

  const listOpts = { q: q.search, bots: q.bots, status: q.status, page: q.page - 1, pageSize: q.limit };
  let rows: Record<string, unknown>[] = [];
  let pagination: { page: number; limit: number; total: number; totalPages: number } | null = null;
  const extra: Record<string, unknown> = {};

  switch (q.by) {
    case "bot":
      rows = overview.bots.map((b) => ({
        bot: b.bot,
        company: b.company,
        purpose: b.purpose,
        visits: b.visits,
        pages: b.pages,
        previousVisits: b.prevVisits,
        change: round1(b.trend),
        verified: b.verified,
        unverified: b.unverified,
        lastSeen: b.lastSeen,
      }));
      rows = rows.slice(0, q.limit);
      break;
    case "day": {
      const label = new Map(overview.series.map((s) => [s.key, s.label]));
      rows = overview.daily.map((d) => {
        const byBot: Record<string, number> = {};
        let visits = 0;
        for (const [key, name] of label) {
          const v = Number(d[key]) || 0;
          byBot[name] = v;
          visits += v;
        }
        return { date: d.date, visits, byBot };
      });
      break;
    }
    case "page": {
      const r = await getCrawledPages(projectId, period, listOpts);
      rows = r.rows;
      pagination = { page: q.page, limit: r.pageSize, total: r.total, totalPages: Math.max(1, Math.ceil(r.total / r.pageSize)) };
      break;
    }
    case "status": {
      const r = await getPerformance(projectId, period, { ...listOpts, sort: "errors" });
      rows = r.rows;
      extra.statusSummary = r.summary;
      pagination = { page: q.page, limit: r.pageSize, total: r.total, totalPages: Math.max(1, Math.ceil(r.total / r.pageSize)) };
      break;
    }
    case "never_visited": {
      const c = await getCrawlerCoverage(projectId, period);
      rows = c.missing.slice(0, q.limit);
      extra.coverage = { knownCrawlers: c.known, visiting: c.visiting, crawlabilityCheck: c.check };
      break;
    }
    case "not_cited": {
      const r = await getCrawledNotCited(projectId, period, { limit: q.limit, bots: q.bots });
      rows = r.rows;
      extra.coverage = { crawledContentPages: r.crawledPages, citedOwnPages: r.citedPages, notCited: r.total };
      break;
    }
  }

  const t = overview.totals;
  return {
    rows,
    period: periodInfo(period),
    by: q.by,
    totals: {
      visits: t.visits,
      previousVisits: t.prevVisits,
      uniqueUrls: t.uniqueUrls,
      ok: t.ok,
      redirects: t.redirects,
      clientErrors: t.clientErrors,
      serverErrors: t.serverErrors,
      verified: t.verified,
      unverified: t.unverified,
    },
    firstSeen: overview.firstSeen,
    hasData: overview.hasAnyData,
    pagination,
    ...extra,
  };
}

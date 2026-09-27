import "server-only";
import type { DataBundle } from "@/features/reports/lib/bundle";
import type { ResolvedPeriod } from "@/features/reports/lib/period";
import type { AnalyticsPeriod } from "@/server/analytics/period";
import { getBotOverview, getCrawledPages, getPerformance } from "@/server/analytics/bots/queries";
import { getEngagementBenchmark, getTrafficOverview, getTrafficSources, getTrafficTable } from "@/server/analytics/traffic/queries";
import { countResponses, getAttributionSummary } from "@/server/attribution/service";
import { mapAttribution, mapBotTraffic, mapHumanTraffic } from "./block-mappers";

/*
 * Report blocks backed by other modules: AI crawler visits (bot traffic), self-reported attribution
 * and AI-referred human visitors (+ the AI vs organic engagement benchmark). Each loader returns null
 * when its source isn't connected and never throws (a failing module must not break the report).
 */

type Blocks = Pick<DataBundle["other"], "bots" | "attribution" | "humanTraffic">;

async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[reports] ${label} block failed`, err);
    return null;
  }
}

function analyticsPeriod(p: ResolvedPeriod): AnalyticsPeriod {
  return { preset: "custom", from: p.from, to: p.to, days: p.days, prevFrom: p.prevFrom, prevTo: p.prevTo, label: p.label };
}

async function loadBots(projectId: string, period: AnalyticsPeriod) {
  const overview = await getBotOverview(projectId, period);
  if (!overview.hasAnyData) return null;
  const [pages, perf] = await Promise.all([
    getCrawledPages(projectId, period, { pageSize: 15 }),
    getPerformance(projectId, period, { status: ["4xx", "5xx"], sort: "errors", pageSize: 20 }),
  ]);
  return mapBotTraffic(overview, pages.rows, perf.rows);
}

async function loadAttribution(projectId: string, period: AnalyticsPeriod) {
  const ever = await countResponses(projectId);
  if (!ever) return null;
  const summary = await getAttributionSummary(projectId, {
    from: new Date(`${period.from}T00:00:00.000Z`),
    to: new Date(`${period.to}T23:59:59.999Z`),
  });
  return mapAttribution(summary, ever);
}

async function loadHumanTraffic(projectId: string, period: AnalyticsPeriod) {
  const sources = (await getTrafficSources(projectId)).filter((s) => s.status !== "pending");
  const source = sources[0];
  if (!source) return null;
  const [overview, byPlatform, byPage, benchmark] = await Promise.all([
    getTrafficOverview(projectId, source.provider, period, "daily"),
    getTrafficTable(projectId, source.provider, period, { by: "engagement", limit: 30 }),
    getTrafficTable(projectId, source.provider, period, { by: "urls", limit: 20 }),
    getEngagementBenchmark(projectId, source, period).catch(() => null),
  ]);
  return mapHumanTraffic(source, overview, byPlatform, byPage, benchmark);
}

export async function loadReportBlocks(projectId: string, p: ResolvedPeriod): Promise<Blocks> {
  const period = analyticsPeriod(p);
  const [bots, attribution, humanTraffic] = await Promise.all([
    safe("bot traffic", () => loadBots(projectId, period)),
    safe("attribution", () => loadAttribution(projectId, period)),
    safe("AI traffic", () => loadHumanTraffic(projectId, period)),
  ]);
  return { bots, attribution, humanTraffic };
}

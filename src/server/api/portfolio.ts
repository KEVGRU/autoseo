import "server-only";
import { z } from "zod";
import { getPortfolioOverview } from "@/server/ai/insights/portfolio";
import { PORTFOLIO_FILTERS, filterPortfolioRows, portfolioTotals, type PortfolioRow } from "@/features/portfolio/lib";
import { accessibleProjects, type ApiPrincipal } from "./auth";
import { resolvePeriod } from "./ai-data";
import { filterQuery, toAiFilter } from "./rest";

/** Query of GET /api/v1/portfolio and input of the `get_portfolio_overview` MCP tool. */
export const portfolioQuery = z.object({
  timeframe: filterQuery.timeframe,
  timeframeDays: filterQuery.timeframeDays,
  startDate: filterQuery.startDate,
  endDate: filterQuery.endDate,
  filter: z
    .enum(PORTFOLIO_FILTERS)
    .default("all")
    .describe("all, active (tracking, not a pitch), pitch or paused projects."),
  search: z.string().trim().max(200).optional().describe("Filter by project name or domain."),
});
export type PortfolioQuery = z.infer<typeof portfolioQuery>;

function rowDto(r: PortfolioRow, baseUrl: string) {
  return {
    projectId: r.projectId,
    name: r.name,
    domain: r.domain,
    country: r.country,
    isPitch: r.isPitch,
    pitchExpiresAt: r.pitchExpiresAt,
    paused: r.paused,
    trackingFrequency: r.trackingFrequency,
    answers: r.answers,
    prompts: r.prompts,
    visibility: r.visibility,
    visibilityChange: r.visibilityDelta,
    mentionRate: r.mentionRate,
    shareOfVoice: r.shareOfVoice,
    shareOfVoiceChange: r.shareOfVoiceDelta,
    avgPosition: r.position,
    avgPositionChange: r.positionDelta,
    sentiment: r.sentiment,
    sentimentChange: r.sentimentDelta,
    citations: r.citations,
    citationsChange: r.citationsDelta,
    citationRate: r.citationRate,
    openTasks: r.openTasks,
    openHighImpactTasks: r.openHighImpactTasks,
    aiRevenue: Math.round(r.aiRevenue * 100) / 100,
    aiRevenuePrevious: Math.round(r.aiRevenuePrev * 100) / 100,
    aiResponses: r.aiResponses,
    currency: r.currency,
    lastRunAt: r.lastRunAt,
    lastRunStatus: r.lastRunStatus,
    visibilitySeries: r.series,
    url: `${baseUrl}/p/${r.projectId}`,
  };
}

/** Portfolio rows for every project the credential can access (key restriction ∩ user access). */
export async function portfolioForApi(principal: ApiPrincipal, q: PortfolioQuery, baseUrl: string) {
  const period = resolvePeriod(toAiFilter(q));
  const data = await getPortfolioOverview({ projects: await accessibleProjects(principal), period });
  const rows = filterPortfolioRows(data.rows, { q: q.search, filter: q.filter });
  return { rows: rows.map((r) => rowDto(r, baseUrl)), totals: portfolioTotals(rows), period: data.period };
}

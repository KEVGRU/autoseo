import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { getMetricsSnapshot } from "@/server/api/ai-data";
import { FILTER_ARRAY_KEYS, toAiFilter, type ProjectParams } from "@/server/api/rest";
import { filterOnlyQuery } from "@/server/api/schemas";
import { corsPreflight } from "@/server/api/urls";

/**
 * GET /api/v1/projects/{projectId}/metrics — PeriodMetrics for today and yesterday plus the
 * selected timeframe (default 30d) vs the previous period of equal length, with changes.
 * `/metrics/daily` is an alias (finseo naming).
 */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, filterOnlyQuery, FILTER_ARRAY_KEYS);
  return getMetricsSnapshot(project, toAiFilter(q));
});

export const OPTIONS = corsPreflight;

import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { buildAiScope, getAiOverviewOverlap } from "@/server/api/ai-data";
import { FILTER_ARRAY_KEYS, toAiFilter, type ProjectParams } from "@/server/api/rest";
import { surfacesQuery } from "@/server/api/schemas";
import { corsPreflight } from "@/server/api/urls";

/**
 * GET /api/v1/projects/{projectId}/metrics/surfaces — Google AI Overview presence rate and
 * AI Overview vs AI Mode overlap (cited URLs / domains, brand co-presence per prompt-day).
 */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, surfacesQuery, FILTER_ARRAY_KEYS);
  const { period, ...data } = await getAiOverviewOverlap(await buildAiScope(project, toAiFilter(q)), q.limit);
  return { data, meta: { period } };
});

export const OPTIONS = corsPreflight;

import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { buildAiScope } from "@/server/api/ai-data";
import { getFanoutsApi } from "@/server/api/insights-data";
import { FILTER_ARRAY_KEYS, toAiFilter, type ProjectParams } from "@/server/api/rest";
import { fanoutsQuery } from "@/server/api/schemas";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/fanouts — AI query fan-outs with intent, coverage and brand/citation rates (default last 90 days). */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, fanoutsQuery, [...FILTER_ARRAY_KEYS, "searchIntent"]);
  const r = await getFanoutsApi(await buildAiScope(project, toAiFilter(q), 90), {
    search: q.search,
    promptId: q.promptId,
    searchIntent: q.searchIntent,
    coverage: q.coverage,
    limit: q.limit,
    page: q.page,
  });
  return { data: r.items, meta: { period: r.period, pagination: r.pagination, stats: r.stats } };
});

export const OPTIONS = corsPreflight;

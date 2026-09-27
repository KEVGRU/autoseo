import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { buildAiScope } from "@/server/api/ai-data";
import { getRetailersApi, retailersQuery } from "@/server/api/insights-data";
import { FILTER_ARRAY_KEYS, toAiFilter, type ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/products/retailers — stores AI shopping answers sell products from. */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, retailersQuery, FILTER_ARRAY_KEYS);
  const r = await getRetailersApi(await buildAiScope(project, toAiFilter(q)), { limit: q.limit, page: q.page });
  return { data: r.items, meta: { period: r.period, pagination: r.pagination, totals: r.totals } };
});

export const OPTIONS = corsPreflight;

import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { buildAiScope } from "@/server/api/ai-data";
import { getProductsApi, productsQuery } from "@/server/api/insights-data";
import { FILTER_ARRAY_KEYS, toAiFilter, type ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/products — products AI answers name or show (shopping cards), with brands. */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, productsQuery, FILTER_ARRAY_KEYS);
  const r = await getProductsApi(await buildAiScope(project, toAiFilter(q)), {
    search: q.search,
    own: q.own === undefined ? undefined : q.own === "true",
    source: q.source,
    limit: q.limit,
    page: q.page,
  });
  return { data: r.items, meta: { period: r.period, pagination: r.pagination, totals: r.totals, brands: r.brands } };
});

export const OPTIONS = corsPreflight;

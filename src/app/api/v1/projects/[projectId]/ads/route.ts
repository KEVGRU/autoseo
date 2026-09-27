import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { buildAiScope } from "@/server/api/ai-data";
import { adsQuery, getAdsApi } from "@/server/api/insights-data";
import { FILTER_ARRAY_KEYS, toAiFilter, type ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/ads — paid ads in AI answers: creatives, click parameters, advertiser share, organic vs paid. */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, adsQuery, FILTER_ARRAY_KEYS);
  const r = await getAdsApi(await buildAiScope(project, toAiFilter(q)), { search: q.search, limit: q.limit, page: q.page });
  return { data: r.items, meta: { period: r.period, pagination: r.pagination, totals: r.totals, advertisers: r.advertisers, organicVsPaid: r.organicVsPaid, daily: r.daily } };
});

export const OPTIONS = corsPreflight;

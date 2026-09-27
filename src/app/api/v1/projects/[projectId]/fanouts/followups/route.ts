import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { buildAiScope } from "@/server/api/ai-data";
import { followupsQuery, getFollowupsApi } from "@/server/api/insights-data";
import { FILTER_ARRAY_KEYS, toAiFilter, type ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/fanouts/followups — follow-up questions (related questions, People Also Ask, related searches). */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, followupsQuery, FILTER_ARRAY_KEYS);
  const r = await getFollowupsApi(await buildAiScope(project, toAiFilter(q), 90), { search: q.search, promptId: q.promptId, kind: q.kind, limit: q.limit, page: q.page });
  return { data: r.items, meta: { period: r.period, pagination: r.pagination } };
});

export const OPTIONS = corsPreflight;

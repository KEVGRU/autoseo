import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { buildAiScope, getSentiment } from "@/server/api/ai-data";
import { getScorecardApi, sentimentQuery } from "@/server/api/insights-data";
import { FILTER_ARRAY_KEYS, toAiFilter, type ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/sentiment — sentiment overview + aspect scorecard (brand × aspect, brand × model). */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, sentimentQuery, FILTER_ARRAY_KEYS);
  const s = await buildAiScope(project, toAiFilter(q));
  const [overview, scorecard] = await Promise.all([getSentiment(s, q.compareWith), getScorecardApi(s, q.compareWith)]);
  const { period, ...o } = overview;
  return {
    data: { ...o, scorecard: { scoreDefinition: scorecard.scoreDefinition, you: scorecard.you, brandsByAspect: scorecard.brandsByAspect, brandsByModel: scorecard.brandsByModel } },
    meta: { period },
  };
});

export const OPTIONS = corsPreflight;

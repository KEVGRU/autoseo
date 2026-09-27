import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import type { ProjectParams } from "@/server/api/rest";
import { aiTrafficForApi, aiTrafficInput, TRAFFIC_ARRAY_KEYS } from "@/server/api/traffic";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/ai-traffic — visitors referred by AI assistants (GA4 / Matomo / Piwik PRO). */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, aiTrafficInput, TRAFFIC_ARRAY_KEYS);
  const { rows, ...meta } = await aiTrafficForApi(project.id, q);
  return { data: rows, meta };
});

export const OPTIONS = corsPreflight;

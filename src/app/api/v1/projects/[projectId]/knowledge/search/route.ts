import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { knowledgeSearchQuery, searchKnowledgeForApi } from "@/server/api/knowledge";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/knowledge/search?q=… — full-text search over connected knowledge. */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, knowledgeSearchQuery, ["sourceIds"]);
  const data = await searchKnowledgeForApi(project, q);
  return { data, meta: { count: data.length } };
});

export const OPTIONS = corsPreflight;

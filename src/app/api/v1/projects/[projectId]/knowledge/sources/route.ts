import { getApiProject } from "@/server/api/auth";
import { apiRoute } from "@/server/api/handler";
import { listKnowledgeSourcesForApi } from "@/server/api/knowledge";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/knowledge/sources — connected knowledge sources and sync status. */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await listKnowledgeSourcesForApi(project) };
});

export const OPTIONS = corsPreflight;

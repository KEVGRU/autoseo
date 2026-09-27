import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";
import { cmsItemForApi, cmsItemQuery } from "@/server/optimize/cms-edits/api";

/** GET /api/v1/projects/{projectId}/cms/items/detail — one CMS item (live values, images, editable fields). */
export const GET = apiRoute<ProjectParams>({ scope: "read", permission: "prompts.manage" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await cmsItemForApi(project, parseQuery(url, cmsItemQuery)) };
});

export const OPTIONS = corsPreflight;

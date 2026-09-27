import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";
import { cmsItemsForApi, cmsItemsQuery } from "@/server/optimize/cms-edits/api";

/** GET /api/v1/projects/{projectId}/cms/items — existing CMS content with its current SEO fields. */
export const GET = apiRoute<ProjectParams>({ scope: "read", permission: "prompts.manage" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const r = await cmsItemsForApi(project, parseQuery(url, cmsItemsQuery));
  return {
    data: r.items,
    meta: { provider: r.provider, providerName: r.providerName, nextCursor: r.nextCursor, targets: r.targets },
  };
});

export const OPTIONS = corsPreflight;

import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody, parseQuery } from "@/server/api/handler";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";
import { cmsChangesForApi, cmsChangesQuery, cmsProposeBody, proposeCmsChangesForApi } from "@/server/optimize/cms-edits/api";

/** GET /api/v1/projects/{projectId}/cms/changes — proposed / applied / reverted site edits. */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const r = await cmsChangesForApi(project, parseQuery(url, cmsChangesQuery));
  return { data: r.items, meta: { pagination: r.pagination, counts: r.counts } };
});

/**
 * POST /api/v1/projects/{projectId}/cms/changes — propose edits to one CMS item. Proposals are
 * never applied automatically: a project member approves them under Content → Site edits.
 */
export const POST = apiRoute<ProjectParams>({ scope: "write", permission: "prompts.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const body = await parseBody(req, cmsProposeBody);
  const r = await proposeCmsChangesForApi(project, principal, body, "api");
  return { data: r.changes, meta: { skipped: r.skipped }, status: r.changes.length ? 201 : 200 };
});

export const OPTIONS = corsPreflight;

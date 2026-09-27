import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { alertEventsQuery, listAlertEventsForApi } from "@/server/api/alerts";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/alerts — fired alert events (newest first) with open/critical counts. */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const res = await listAlertEventsForApi(project.id, parseQuery(url, alertEventsQuery));
  return { data: res.items, meta: { counts: res.counts, pagination: res.pagination } };
});

export const OPTIONS = corsPreflight;

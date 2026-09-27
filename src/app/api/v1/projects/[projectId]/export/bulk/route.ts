import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { runExport } from "@/server/api/export-datasets";
import { FILTER_ARRAY_KEYS, type ProjectParams } from "@/server/api/rest";
import { exportQuery } from "@/server/api/schemas";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/export/bulk — alias of /export (finseo endpoint name). */
export const GET = apiRoute<ProjectParams>({ scope: "export", permission: "data.export" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  return runExport(project, parseQuery(url, exportQuery, FILTER_ARRAY_KEYS));
});

export const OPTIONS = corsPreflight;

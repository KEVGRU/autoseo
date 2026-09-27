import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { runExport } from "@/server/api/export-datasets";
import { FILTER_ARRAY_KEYS, type ProjectParams } from "@/server/api/rest";
import { exportQuery } from "@/server/api/schemas";
import { corsPreflight } from "@/server/api/urls";

/**
 * GET /api/v1/projects/{projectId}/export — bulk export (export scope): every prompt with metrics
 * (first page) and one row per AI answer in the period. `dataset` switches to prompts / mentions /
 * citations / fan-outs, `format` to csv or ndjson, `since` to incremental rows.
 */
export const GET = apiRoute<ProjectParams>({ scope: "export", permission: "data.export" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  return runExport(project, parseQuery(url, exportQuery, FILTER_ARRAY_KEYS));
});

export const OPTIONS = corsPreflight;

import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { generateSchemaForApi, schemaMarkupInput } from "@/server/api/knowledge";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** POST /api/v1/projects/{projectId}/content/schema-markup — ready-to-paste JSON-LD for a page. */
export const POST = apiRoute<ProjectParams>({ scope: "read", spend: true }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const body = await parseBody(req, schemaMarkupInput);
  return { data: await generateSchemaForApi(project, body) };
});

export const OPTIONS = corsPreflight;

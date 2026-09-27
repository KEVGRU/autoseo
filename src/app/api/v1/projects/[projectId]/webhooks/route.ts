import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { createWebhookForApi, listWebhooksForApi, webhookEndpointInput } from "@/server/api/webhooks";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/webhooks — outbound webhook endpoints (secrets are never returned). */
export const GET = apiRoute<ProjectParams>({ scope: "read", permission: "settings.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await listWebhooksForApi(project.id) };
});

/** POST /api/v1/projects/{projectId}/webhooks — subscribe a URL to events; the signing secret is returned once. */
export const POST = apiRoute<ProjectParams>({ scope: "write", permission: "settings.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const body = await parseBody(req, webhookEndpointInput);
  return { data: await createWebhookForApi(project.id, body, principal.user.id), status: 201 };
});

export const OPTIONS = corsPreflight;

import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { deleteWebhookForApi, getWebhookForApi, updateWebhookForApi, webhookEndpointPatch } from "@/server/api/webhooks";
import { corsPreflight } from "@/server/api/urls";

type Params = { projectId: string; webhookId: string };

/** GET /api/v1/projects/{projectId}/webhooks/{webhookId} — endpoint with its 10 latest deliveries. */
export const GET = apiRoute<Params>({ scope: "read", permission: "settings.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await getWebhookForApi(project.id, params.webhookId) };
});

/** PUT /api/v1/projects/{projectId}/webhooks/{webhookId} — partial update (url, name, events, active). */
export const PUT = apiRoute<Params>({ scope: "write", permission: "settings.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const body = await parseBody(req, webhookEndpointPatch);
  return { data: await updateWebhookForApi(project.id, params.webhookId, body) };
});

/** DELETE /api/v1/projects/{projectId}/webhooks/{webhookId} */
export const DELETE = apiRoute<Params>({ scope: "write", permission: "settings.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await deleteWebhookForApi(project.id, params.webhookId) };
});

export const OPTIONS = corsPreflight;

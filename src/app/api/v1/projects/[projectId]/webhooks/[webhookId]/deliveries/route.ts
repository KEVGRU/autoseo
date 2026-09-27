import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import { listWebhookDeliveriesForApi, webhookDeliveriesQuery } from "@/server/api/webhooks";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/webhooks/{webhookId}/deliveries — delivery log (newest first, 30 days) incl. payloads. */
export const GET = apiRoute<{ projectId: string; webhookId: string }>({ scope: "read", permission: "settings.manage" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await listWebhookDeliveriesForApi(project.id, params.webhookId, parseQuery(url, webhookDeliveriesQuery)) };
});

export const OPTIONS = corsPreflight;

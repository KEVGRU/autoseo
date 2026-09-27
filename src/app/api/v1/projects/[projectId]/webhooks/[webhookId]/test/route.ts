import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { testWebhookForApi, webhookTestBody } from "@/server/api/webhooks";
import { corsPreflight } from "@/server/api/urls";

/** POST /api/v1/projects/{projectId}/webhooks/{webhookId}/test — send a signed sample event now and return the delivery result. */
export const POST = apiRoute<{ projectId: string; webhookId: string }>({ scope: "write", permission: "settings.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const { event } = await parseBody(req, webhookTestBody);
  return { data: await testWebhookForApi(project.id, params.webhookId, event) };
});

export const OPTIONS = corsPreflight;

import { getApiProject } from "@/server/api/auth";
import { apiRoute } from "@/server/api/handler";
import { rotateWebhookSecretForApi } from "@/server/api/webhooks";
import { corsPreflight } from "@/server/api/urls";

/** POST /api/v1/projects/{projectId}/webhooks/{webhookId}/rotate-secret — new signing secret (returned once; the old one stops working). */
export const POST = apiRoute<{ projectId: string; webhookId: string }>({ scope: "write", permission: "settings.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await rotateWebhookSecretForApi(project.id, params.webhookId) };
});

export const OPTIONS = corsPreflight;

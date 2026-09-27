import { getApiProject } from "@/server/api/auth";
import { apiRoute } from "@/server/api/handler";
import { replayWebhookDeliveryForApi } from "@/server/api/webhooks";
import { corsPreflight } from "@/server/api/urls";

/** POST /api/v1/projects/{projectId}/webhooks/{webhookId}/deliveries/{deliveryId}/replay — re-send (same event id, new signature). */
export const POST = apiRoute<{ projectId: string; webhookId: string; deliveryId: string }>(
  { scope: "write", permission: "settings.manage" },
  async ({ principal, params }) => {
    const project = await getApiProject(principal, params.projectId);
    return { data: await replayWebhookDeliveryForApi(project.id, params.webhookId, params.deliveryId), status: 202 };
  },
);

export const OPTIONS = corsPreflight;

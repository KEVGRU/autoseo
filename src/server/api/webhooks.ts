import "server-only";
import { z } from "zod";
import {
  WebhookInputError,
  createEndpoint,
  deleteEndpoint,
  getDelivery,
  getEndpoint,
  listDeliveries,
  listEndpoints,
  rotateEndpointSecret,
  toPublicDelivery,
  toPublicEndpoint,
  updateEndpoint,
  webhookEndpointInput,
  webhookEndpointPatch,
} from "@/server/webhooks/endpoints";
import { replayDelivery, sendTestEvent } from "@/server/webhooks/deliver";
import { WEBHOOK_EVENTS } from "@/server/webhooks/events";
import { ApiError } from "./errors";

/** Outbound webhook endpoints (event bus) exposed via REST v1. */

export { webhookEndpointInput, webhookEndpointPatch };

export const webhookTestBody = z.object({
  event: z.enum(WEBHOOK_EVENTS).default("alert.triggered").describe("Event whose sample payload is sent (marked `test: true`)."),
});

export const webhookDeliveriesQuery = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

async function mapErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof WebhookInputError) throw new ApiError(/not found/i.test(err.message) ? "not_found" : "validation_error", err.message);
    throw err;
  }
}

async function requireEndpoint(projectId: string, endpointId: string) {
  const row = await getEndpoint(projectId, endpointId);
  if (!row) throw new ApiError("not_found", "Webhook endpoint not found.");
  return row;
}

export async function listWebhooksForApi(projectId: string) {
  return (await listEndpoints(projectId)).map(toPublicEndpoint);
}

export async function getWebhookForApi(projectId: string, endpointId: string) {
  const row = await requireEndpoint(projectId, endpointId);
  const recent = await listDeliveries(projectId, { endpointId, limit: 10 });
  return { ...toPublicEndpoint(row), recentDeliveries: recent.map((d) => toPublicDelivery(d)) };
}

/** Returns the signing secret once — it can't be read again (rotate to get a new one). */
export async function createWebhookForApi(projectId: string, body: z.input<typeof webhookEndpointInput>, userId: string) {
  return mapErrors(async () => {
    const { endpoint, secret } = await createEndpoint(projectId, body, userId);
    return { ...toPublicEndpoint(endpoint), secret };
  });
}

export async function updateWebhookForApi(projectId: string, endpointId: string, body: z.input<typeof webhookEndpointPatch>) {
  return mapErrors(async () => toPublicEndpoint(await updateEndpoint(projectId, endpointId, body)));
}

export async function deleteWebhookForApi(projectId: string, endpointId: string) {
  if (!(await deleteEndpoint(projectId, endpointId))) throw new ApiError("not_found", "Webhook endpoint not found.");
  return { id: endpointId, deleted: true };
}

export async function rotateWebhookSecretForApi(projectId: string, endpointId: string) {
  return mapErrors(async () => ({ id: endpointId, secret: await rotateEndpointSecret(projectId, endpointId) }));
}

export async function listWebhookDeliveriesForApi(projectId: string, endpointId: string, q: z.infer<typeof webhookDeliveriesQuery>) {
  await requireEndpoint(projectId, endpointId);
  const rows = await listDeliveries(projectId, { endpointId, limit: q.limit, offset: (q.page - 1) * q.limit });
  return rows.map((d) => toPublicDelivery(d, true));
}

export async function testWebhookForApi(projectId: string, endpointId: string, event: z.infer<typeof webhookTestBody>["event"]) {
  await requireEndpoint(projectId, endpointId);
  return toPublicDelivery(await sendTestEvent(projectId, endpointId, event));
}

export async function replayWebhookDeliveryForApi(projectId: string, endpointId: string, deliveryId: string) {
  const original = await getDelivery(projectId, deliveryId);
  if (!original || original.endpointId !== endpointId) throw new ApiError("not_found", "Delivery not found.");
  try {
    return toPublicDelivery(await replayDelivery(projectId, deliveryId));
  } catch (err) {
    throw new ApiError("conflict", err instanceof Error ? err.message : String(err));
  }
}

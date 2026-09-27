"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionProject, ActionError, runAction } from "@/server/auth/guards";
import { logAudit } from "@/server/audit";
import {
  WebhookInputError,
  createEndpoint,
  deleteEndpoint,
  getDelivery,
  listDeliveries,
  rotateEndpointSecret,
  toPublicDelivery,
  toPublicEndpoint,
  updateEndpoint,
  webhookEndpointInput,
  webhookEndpointPatch,
} from "@/server/webhooks/endpoints";
import { replayDelivery, sendTestEvent } from "@/server/webhooks/deliver";
import { WEBHOOK_EVENTS } from "@/server/webhooks/events";

/** Outbound webhooks (Integrations → Webhooks). Endpoint URLs can be capability URLs → integration admins only. */
const PERMISSION = "settings.manage" as const;
const pid = z.string().min(3).max(64);
const whe = z.string().regex(/^whe_[a-z0-9]{16}$/);
const whd = z.string().regex(/^whd_[a-z0-9]{16}$/);

function revalidate(projectId: string) {
  revalidatePath(`/p/${projectId}/integrations`);
}

async function guard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof WebhookInputError) throw new ActionError(err.message, "invalid");
    throw err;
  }
}

export async function createWebhookAction(projectId: string, input: z.input<typeof webhookEndpointInput>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), PERMISSION);
    const { endpoint, secret } = await guard(() => createEndpoint(ctx.project.id, input, ctx.user.id));
    await logAudit("webhook.create", {
      actor: ctx.user,
      projectId: ctx.project.id,
      workspaceId: ctx.project.workspaceId,
      targetType: "webhook_endpoint",
      targetId: endpoint.id,
      meta: { host: new URL(endpoint.url).host, events: endpoint.events },
    });
    revalidate(ctx.project.id);
    return { endpoint: toPublicEndpoint(endpoint), secret };
  });
}

export async function updateWebhookAction(projectId: string, endpointId: string, patch: z.input<typeof webhookEndpointPatch>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), PERMISSION);
    const endpoint = await guard(() => updateEndpoint(ctx.project.id, whe.parse(endpointId), patch));
    await logAudit("webhook.update", {
      actor: ctx.user,
      projectId: ctx.project.id,
      workspaceId: ctx.project.workspaceId,
      targetType: "webhook_endpoint",
      targetId: endpoint.id,
      meta: { fields: Object.keys(patch) },
    });
    revalidate(ctx.project.id);
    return toPublicEndpoint(endpoint);
  });
}

export async function deleteWebhookAction(projectId: string, endpointId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), PERMISSION);
    const id = whe.parse(endpointId);
    if (!(await deleteEndpoint(ctx.project.id, id))) throw new ActionError("Webhook endpoint not found.", "not_found");
    await logAudit("webhook.delete", { actor: ctx.user, projectId: ctx.project.id, workspaceId: ctx.project.workspaceId, targetType: "webhook_endpoint", targetId: id });
    revalidate(ctx.project.id);
    return true;
  });
}

export async function rotateWebhookSecretAction(projectId: string, endpointId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), PERMISSION);
    const secret = await guard(() => rotateEndpointSecret(ctx.project.id, whe.parse(endpointId)));
    await logAudit("webhook.rotate_secret", { actor: ctx.user, projectId: ctx.project.id, workspaceId: ctx.project.workspaceId, targetType: "webhook_endpoint", targetId: endpointId });
    revalidate(ctx.project.id);
    return secret;
  });
}

export async function sendWebhookTestEventAction(projectId: string, endpointId: string, event: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), PERMISSION);
    const delivery = await sendTestEvent(ctx.project.id, whe.parse(endpointId), z.enum(WEBHOOK_EVENTS).parse(event));
    revalidate(ctx.project.id);
    return toPublicDelivery(delivery);
  });
}

export async function listWebhookDeliveriesAction(projectId: string, endpointId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), PERMISSION);
    const rows = await listDeliveries(ctx.project.id, { endpointId: whe.parse(endpointId), limit: 50 });
    return rows.map((d) => toPublicDelivery(d, true));
  });
}

export async function replayWebhookDeliveryAction(projectId: string, deliveryId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), PERMISSION);
    const id = whd.parse(deliveryId);
    if (!(await getDelivery(ctx.project.id, id))) throw new ActionError("Delivery not found.", "not_found");
    try {
      return toPublicDelivery(await replayDelivery(ctx.project.id, id));
    } catch (err) {
      throw new ActionError(err instanceof Error ? err.message : String(err), "conflict");
    }
  });
}

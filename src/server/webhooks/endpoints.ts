import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { webhookDeliveries, webhookEndpoints } from "@/server/db/schema";
import { decryptJson, encryptJson } from "@/server/crypto";
import { generateSigningSecret } from "../optimize/integrations/signature";
import { ALL_EVENTS, WEBHOOK_EVENTS, normalizeEventList } from "./events";
import { secretPrefix } from "./payload";
import { assertPublicResolution, validateWebhookUrl, webhookAllowlist, UnsafeUrlError } from "./url";

export type WebhookEndpointRow = typeof webhookEndpoints.$inferSelect;
export type WebhookDeliveryRow = typeof webhookDeliveries.$inferSelect;

export const MAX_ENDPOINTS_PER_PROJECT = 20;

/** Client-safe view of an endpoint (never contains the secret). */
export type PublicWebhookEndpoint = {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secretPrefix: string;
  failureCount: number;
  disabledReason: string | null;
  lastDeliveredAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicWebhookDelivery = {
  id: string;
  endpointId: string;
  event: string;
  eventId: string;
  status: WebhookDeliveryRow["status"];
  attempt: number;
  responseCode: number | null;
  responseBody: string | null;
  error: string | null;
  durationMs: number | null;
  test: boolean;
  replayOf: string | null;
  deliveredAt: string | null;
  createdAt: string;
  payload?: Record<string, unknown>;
};

const eventName = z.union([z.literal(ALL_EVENTS), z.enum(WEBHOOK_EVENTS)]);

export const webhookEndpointInput = z.object({
  url: z.string().trim().min(8).max(2000).describe("Receiver URL (https recommended). Private addresses are blocked unless an admin allowlisted the host."),
  name: z.string().trim().max(120).optional().default(""),
  events: z.array(eventName).min(1).max(WEBHOOK_EVENTS.length + 1).describe(`Event names to subscribe to, or ["*"] for every event.`),
  active: z.boolean().optional().default(true),
});

export const webhookEndpointPatch = z
  .object({
    url: z.string().trim().min(8).max(2000),
    name: z.string().trim().max(120),
    events: z.array(eventName).min(1).max(WEBHOOK_EVENTS.length + 1),
    active: z.boolean(),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update.");

export function toPublicEndpoint(r: WebhookEndpointRow): PublicWebhookEndpoint {
  return {
    id: r.id,
    name: r.name,
    url: r.url,
    events: r.events,
    active: r.active,
    secretPrefix: r.secretPrefix,
    failureCount: r.failureCount,
    disabledReason: r.disabledReason,
    lastDeliveredAt: r.lastDeliveredAt?.toISOString() ?? null,
    lastFailureAt: r.lastFailureAt?.toISOString() ?? null,
    lastError: r.lastError,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toPublicDelivery(r: WebhookDeliveryRow, withPayload = false): PublicWebhookDelivery {
  return {
    id: r.id,
    endpointId: r.endpointId,
    event: r.event,
    eventId: r.eventId,
    status: r.status,
    attempt: r.attempt,
    responseCode: r.responseCode,
    responseBody: r.responseBody,
    error: r.error,
    durationMs: r.durationMs,
    test: r.test,
    replayOf: r.replayOf,
    deliveredAt: r.deliveredAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    ...(withPayload ? { payload: r.payload } : {}),
  };
}

export class WebhookInputError extends Error {}

/** SSRF-validated, normalized receiver URL (throws WebhookInputError with a user-facing message). */
async function checkedUrl(raw: string): Promise<string> {
  const allow = await webhookAllowlist();
  try {
    const url = validateWebhookUrl(raw, allow);
    await assertPublicResolution(url, allow);
    return url;
  } catch (err) {
    if (err instanceof UnsafeUrlError) throw new WebhookInputError(err.message);
    throw err;
  }
}

export function readEndpointSecret(row: Pick<WebhookEndpointRow, "secret">): string {
  return decryptJson<string>(row.secret);
}

export async function listEndpoints(projectId: string): Promise<WebhookEndpointRow[]> {
  return db.select().from(webhookEndpoints).where(eq(webhookEndpoints.projectId, projectId)).orderBy(webhookEndpoints.createdAt);
}

export async function getEndpoint(projectId: string, endpointId: string): Promise<WebhookEndpointRow | null> {
  const [row] = await db
    .select()
    .from(webhookEndpoints)
    .where(and(eq(webhookEndpoints.projectId, projectId), eq(webhookEndpoints.id, endpointId)))
    .limit(1);
  return row ?? null;
}

export async function createEndpoint(
  projectId: string,
  input: z.input<typeof webhookEndpointInput>,
  userId: string | null,
): Promise<{ endpoint: WebhookEndpointRow; secret: string }> {
  const data = webhookEndpointInput.parse(input);
  const [{ n }] = (await db.select({ n: count() }).from(webhookEndpoints).where(eq(webhookEndpoints.projectId, projectId))) as [{ n: number }];
  if (n >= MAX_ENDPOINTS_PER_PROJECT) throw new WebhookInputError(`A project can have at most ${MAX_ENDPOINTS_PER_PROJECT} webhook endpoints.`);
  const url = await checkedUrl(data.url);
  const secret = generateSigningSecret();
  const [endpoint] = await db
    .insert(webhookEndpoints)
    .values({
      projectId,
      name: data.name,
      url,
      secret: encryptJson(secret),
      secretPrefix: secretPrefix(secret),
      events: normalizeEventList(data.events),
      active: data.active,
      createdBy: userId,
    })
    .returning();
  return { endpoint: endpoint!, secret };
}

export async function updateEndpoint(projectId: string, endpointId: string, patch: z.input<typeof webhookEndpointPatch>): Promise<WebhookEndpointRow> {
  const data = webhookEndpointPatch.parse(patch);
  const row = await getEndpoint(projectId, endpointId);
  if (!row) throw new WebhookInputError("Webhook endpoint not found.");
  const set: Partial<typeof webhookEndpoints.$inferInsert> = {};
  if (data.url !== undefined && data.url !== row.url) set.url = await checkedUrl(data.url);
  if (data.name !== undefined) set.name = data.name;
  if (data.events !== undefined) set.events = normalizeEventList(data.events);
  if (data.active !== undefined) {
    set.active = data.active;
    // Re-enabling starts a fresh failure streak.
    if (data.active && !row.active) Object.assign(set, { failureCount: 0, failingSince: null, disabledReason: null });
  }
  if (!Object.keys(set).length) return row;
  const [updated] = await db
    .update(webhookEndpoints)
    .set(set)
    .where(and(eq(webhookEndpoints.projectId, projectId), eq(webhookEndpoints.id, endpointId)))
    .returning();
  return updated!;
}

export async function rotateEndpointSecret(projectId: string, endpointId: string): Promise<string> {
  const secret = generateSigningSecret();
  const [row] = await db
    .update(webhookEndpoints)
    .set({ secret: encryptJson(secret), secretPrefix: secretPrefix(secret) })
    .where(and(eq(webhookEndpoints.projectId, projectId), eq(webhookEndpoints.id, endpointId)))
    .returning({ id: webhookEndpoints.id });
  if (!row) throw new WebhookInputError("Webhook endpoint not found.");
  return secret;
}

export async function deleteEndpoint(projectId: string, endpointId: string): Promise<boolean> {
  const rows = await db
    .delete(webhookEndpoints)
    .where(and(eq(webhookEndpoints.projectId, projectId), eq(webhookEndpoints.id, endpointId)))
    .returning({ id: webhookEndpoints.id });
  return rows.length > 0;
}

export async function listDeliveries(
  projectId: string,
  opts: { endpointId?: string; limit?: number; offset?: number } = {},
): Promise<WebhookDeliveryRow[]> {
  return db
    .select()
    .from(webhookDeliveries)
    .where(and(eq(webhookDeliveries.projectId, projectId), opts.endpointId ? eq(webhookDeliveries.endpointId, opts.endpointId) : undefined))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(Math.min(200, opts.limit ?? 50))
    .offset(opts.offset ?? 0);
}

export async function getDelivery(projectId: string, deliveryId: string): Promise<WebhookDeliveryRow | null> {
  const [row] = await db
    .select()
    .from(webhookDeliveries)
    .where(and(eq(webhookDeliveries.projectId, projectId), eq(webhookDeliveries.id, deliveryId)))
    .limit(1);
  return row ?? null;
}

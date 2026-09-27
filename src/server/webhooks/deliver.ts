import "server-only";
import { and, arrayOverlaps, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { notifications, projects, webhookDeliveries, webhookEndpoints } from "@/server/db/schema";
import { env } from "@/server/env";
import { enqueueJob } from "@/server/jobs/queue";
import { safeFetch, UnsafeUrlError } from "../optimize/net";
import { ALL_EVENTS, sampleEventData, type WebhookEventName } from "./events";
import { getDelivery, getEndpoint, readEndpointSecret, type WebhookDeliveryRow, type WebhookEndpointRow } from "./endpoints";
import { DELIVERY_MAX_ATTEMPTS, buildEnvelope, classifyResponse, deliveryHeaders, shouldAutoDisable, type WebhookProjectInfo } from "./payload";

/**
 * Outbound webhook bus: `emitEvent` snapshots the payload once, writes one delivery row per
 * subscribed endpoint and enqueues a `webhooks.deliver` job for each (retries with the queue's
 * exponential backoff). Deliveries are signed with the endpoint secret (see ../optimize/integrations/signature.ts).
 */

export const DELIVER_JOB = "webhooks.deliver";
const MAX_PAYLOAD_BYTES = 512 * 1024;

type EventData = Record<string, unknown>;

function errMessage(err: unknown): string {
  return (err instanceof Error ? err.message : String(err)).slice(0, 500);
}

export async function projectInfo(projectId: string): Promise<WebhookProjectInfo> {
  const [p] = await db.select({ id: projects.id, name: projects.name, domain: projects.domain }).from(projects).where(eq(projects.id, projectId)).limit(1);
  return { id: projectId, name: p?.name ?? "", domain: p?.domain ?? "", url: `${env.appUrl}/p/${projectId}` };
}

async function subscribedEndpoints(projectId: string, event: string) {
  return db
    .select({ id: webhookEndpoints.id })
    .from(webhookEndpoints)
    .where(and(eq(webhookEndpoints.projectId, projectId), eq(webhookEndpoints.active, true), arrayOverlaps(webhookEndpoints.events, [event, ALL_EVENTS])));
}

/**
 * Publishes an event to every active endpoint of the project subscribed to it. `data` may be a
 * (lazy) builder — it only runs when at least one endpoint listens. Never throws (logs instead),
 * so emitting can't break the action that caused the event. Returns the number of deliveries queued.
 * `eventId` makes emitting idempotent: an event id that was already delivered is not sent again.
 */
export async function emitEvent(
  projectId: string,
  event: WebhookEventName,
  data: EventData | (() => Promise<EventData | null>),
  opts: { eventId?: string } = {},
): Promise<number> {
  try {
    const endpoints = await subscribedEndpoints(projectId, event);
    if (!endpoints.length) return 0;
    if (opts.eventId) {
      const [seen] = await db
        .select({ id: webhookDeliveries.id })
        .from(webhookDeliveries)
        .where(and(eq(webhookDeliveries.projectId, projectId), eq(webhookDeliveries.eventId, opts.eventId)))
        .limit(1);
      if (seen) return 0;
    }
    const resolved = typeof data === "function" ? await data() : data;
    if (!resolved) return 0;
    const envelope = buildEnvelope({ eventId: opts.eventId, event, project: await projectInfo(projectId), data: resolved });
    if (Buffer.byteLength(JSON.stringify(envelope)) > MAX_PAYLOAD_BYTES) {
      console.error(`[webhooks] ${event} payload for ${projectId} exceeds ${MAX_PAYLOAD_BYTES} bytes — not sent`);
      return 0;
    }
    const rows = await db
      .insert(webhookDeliveries)
      .values(endpoints.map((e) => ({ endpointId: e.id, projectId, event, eventId: envelope.id, payload: envelope as unknown as Record<string, unknown> })))
      .returning({ id: webhookDeliveries.id });
    let queued = 0;
    for (const r of rows) if (await enqueueDelivery(projectId, r.id)) queued++;
    return queued;
  } catch (err) {
    console.error(`[webhooks] failed to emit ${event} for ${projectId}`, err);
    return 0;
  }
}

async function enqueueDelivery(projectId: string, deliveryId: string): Promise<boolean> {
  // Endpoints are configured by the user, so demo projects deliver too (no provider is called).
  const job = await enqueueJob(DELIVER_JOB, { deliveryId }, { projectId, maxAttempts: DELIVERY_MAX_ATTEMPTS, priority: 60, allowDemo: true });
  if (!job) {
    await db.update(webhookDeliveries).set({ status: "failed", error: "The delivery could not be queued (project paused)." }).where(eq(webhookDeliveries.id, deliveryId));
    return false;
  }
  return true;
}

type AttemptResult = { ok: boolean; status: number | null; body: string | null; error: string | null; durationMs: number; outcome: "succeeded" | "gone" | "retry" | "blocked" };

/** One signed POST of a stored delivery (no DB writes). "blocked" outcomes are permanent (never retried). */
async function attempt(endpoint: WebhookEndpointRow, delivery: Pick<WebhookDeliveryRow, "id" | "event" | "eventId" | "payload">): Promise<AttemptResult> {
  const body = JSON.stringify(delivery.payload);
  const started = performance.now();
  let secret: string;
  try {
    secret = readEndpointSecret(endpoint);
  } catch {
    return { ok: false, status: null, body: null, error: "The signing secret can't be decrypted — rotate the secret.", durationMs: 0, outcome: "blocked" };
  }
  try {
    const headers = deliveryHeaders(secret, { event: delivery.event, body, deliveryId: delivery.id, eventId: delivery.eventId });
    // purpose "integration": the admin's internal-host allowlist applies; everything else stays SSRF-protected.
    const res = await safeFetch(endpoint.url, { method: "POST", headers, body, timeoutMs: 15_000, maxBytes: 1024 * 1024, maxRedirects: 0, purpose: "integration" });
    const outcome = classifyResponse(res.status);
    return {
      ok: outcome === "succeeded",
      status: res.status,
      body: res.text().slice(0, 1000) || null,
      error: outcome === "succeeded" ? null : `Receiver responded with HTTP ${res.status}`,
      durationMs: Math.round(performance.now() - started),
      outcome,
    };
  } catch (err) {
    return {
      ok: false,
      status: null,
      body: null,
      error: errMessage(err),
      durationMs: Math.round(performance.now() - started),
      outcome: err instanceof UnsafeUrlError ? "blocked" : "retry",
    };
  }
}

/**
 * Endpoint health after a delivery (atomic updates — deliveries run concurrently and users can pause
 * an endpoint meanwhile): success resets the failure streak; a delivery that failed for good extends it
 * and may switch the endpoint off (see shouldAutoDisable); HTTP 410 unsubscribes immediately.
 */
export async function recordDeliveryOutcome(endpointId: string, outcome: "succeeded" | "failed" | "gone", error: string | null = null) {
  if (outcome === "succeeded") {
    await db
      .update(webhookEndpoints)
      .set({ failureCount: 0, failingSince: null, lastDeliveredAt: new Date(), lastError: null })
      .where(eq(webhookEndpoints.id, endpointId));
    return { disabled: false };
  }
  const [row] = await db
    .update(webhookEndpoints)
    .set({
      failureCount: sql`${webhookEndpoints.failureCount} + 1`,
      failingSince: sql`coalesce(${webhookEndpoints.failingSince}, now())`,
      lastFailureAt: new Date(),
      lastError: error,
    })
    .where(eq(webhookEndpoints.id, endpointId))
    .returning({ failureCount: webhookEndpoints.failureCount, failingSince: webhookEndpoints.failingSince, active: webhookEndpoints.active });
  if (!row?.active) return { disabled: false };
  const reason =
    outcome === "gone"
      ? "The receiver answered HTTP 410 Gone (subscription removed)."
      : shouldAutoDisable({ failureCount: row.failureCount, failingSince: row.failingSince })
        ? `Switched off after ${row.failureCount} failed deliveries in a row (failing since ${row.failingSince!.toISOString().slice(0, 16).replace("T", " ")} UTC).`
        : null;
  if (!reason) return { disabled: false };
  const [off] = await db
    .update(webhookEndpoints)
    .set({ active: false, disabledReason: reason })
    .where(and(eq(webhookEndpoints.id, endpointId), eq(webhookEndpoints.active, true)))
    .returning();
  if (off) await notifyDisabled(off, reason);
  return { disabled: Boolean(off) };
}

async function notifyDisabled(endpoint: WebhookEndpointRow, reason: string) {
  if (!endpoint.createdBy) return;
  await db
    .insert(notifications)
    .values({
      userId: endpoint.createdBy,
      projectId: endpoint.projectId,
      kind: "webhook.disabled",
      title: `Webhook switched off: ${endpoint.name || new URL(endpoint.url).host}`,
      body: `${reason} Fix the receiver, then re-enable it under Integrations → Webhooks (failed deliveries can be replayed from the delivery log).`,
      href: `/p/${endpoint.projectId}/integrations#webhooks`,
    })
    .catch((err) => console.error("[webhooks] notification failed", err));
}

/**
 * Job body for `webhooks.deliver`. Throws on retryable failures so the queue retries with backoff;
 * the last attempt counts towards the endpoint's failure streak (auto-disable).
 */
export async function runDelivery(deliveryId: string, job: { attempts: number; maxAttempts: number }) {
  const [row] = await db
    .select({ delivery: webhookDeliveries, endpoint: webhookEndpoints })
    .from(webhookDeliveries)
    .innerJoin(webhookEndpoints, eq(webhookEndpoints.id, webhookDeliveries.endpointId))
    .where(eq(webhookDeliveries.id, deliveryId))
    .limit(1);
  if (!row) return { skipped: "delivery or endpoint deleted" };
  const { delivery, endpoint } = row;
  if (delivery.status === "succeeded" || delivery.status === "failed") return { skipped: `already ${delivery.status}` };
  if (!endpoint.active) {
    await db.update(webhookDeliveries).set({ status: "failed", error: "Endpoint is switched off." }).where(eq(webhookDeliveries.id, delivery.id));
    return { skipped: "endpoint inactive" };
  }
  const r = await attempt(endpoint, delivery);
  const final = r.ok || r.outcome === "gone" || r.outcome === "blocked" || job.attempts >= job.maxAttempts;
  await db
    .update(webhookDeliveries)
    .set({
      status: r.ok ? "succeeded" : final ? "failed" : "retrying",
      attempt: delivery.attempt + 1,
      responseCode: r.status,
      responseBody: r.body,
      error: r.error,
      durationMs: r.durationMs,
      ...(r.ok ? { deliveredAt: new Date() } : {}),
    })
    .where(eq(webhookDeliveries.id, delivery.id));
  if (r.ok) {
    await recordDeliveryOutcome(endpoint.id, "succeeded");
    return { delivered: true, status: r.status };
  }
  if (r.outcome === "gone") {
    await recordDeliveryOutcome(endpoint.id, "gone", r.error);
    return { delivered: false, status: r.status, unsubscribed: true };
  }
  if (final) await recordDeliveryOutcome(endpoint.id, "failed", r.error);
  else await db.update(webhookEndpoints).set({ lastFailureAt: new Date(), lastError: r.error }).where(eq(webhookEndpoints.id, endpoint.id));
  if (r.outcome === "blocked") return { delivered: false, error: r.error };
  throw new Error(r.error ?? "Delivery failed");
}

/** "Send test event": one immediate, signed delivery of a sample payload (no retries, logged with test=true). */
export async function sendTestEvent(projectId: string, endpointId: string, event: WebhookEventName) {
  const endpoint = await getEndpoint(projectId, endpointId);
  if (!endpoint) throw new Error("Webhook endpoint not found.");
  const envelope = buildEnvelope({ event, project: await projectInfo(projectId), data: sampleEventData(event), test: true });
  const [delivery] = await db
    .insert(webhookDeliveries)
    .values({ endpointId, projectId, event, eventId: envelope.id, payload: envelope as unknown as Record<string, unknown>, test: true })
    .returning();
  const r = await attempt(endpoint, delivery!);
  const [updated] = await db
    .update(webhookDeliveries)
    .set({
      status: r.ok ? "succeeded" : "failed",
      attempt: 1,
      responseCode: r.status,
      responseBody: r.body,
      error: r.error,
      durationMs: r.durationMs,
      ...(r.ok ? { deliveredAt: new Date() } : {}),
    })
    .where(eq(webhookDeliveries.id, delivery!.id))
    .returning();
  return updated!;
}

/** Re-sends a logged delivery (same event id and payload, new signature) through the retrying job queue. */
export async function replayDelivery(projectId: string, deliveryId: string) {
  const original = await getDelivery(projectId, deliveryId);
  if (!original) throw new Error("Delivery not found.");
  const endpoint = await getEndpoint(projectId, original.endpointId);
  if (!endpoint) throw new Error("Webhook endpoint not found.");
  if (!endpoint.active) throw new Error("The endpoint is switched off — enable it first.");
  const [row] = await db
    .insert(webhookDeliveries)
    .values({
      endpointId: original.endpointId,
      projectId,
      event: original.event,
      eventId: original.eventId,
      payload: original.payload,
      test: original.test,
      replayOf: original.id,
    })
    .returning();
  if (!(await enqueueDelivery(projectId, row!.id))) throw new Error("The replay could not be queued.");
  return row!;
}

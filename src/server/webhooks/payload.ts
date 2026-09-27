/**
 * Pure helpers of the webhook bus (no server-only / DB imports so they can be unit tested):
 * envelope shape, signed headers and the auto-disable rule.
 */
import crypto from "node:crypto";
import { webhookHeaders } from "../optimize/integrations/signature";

export const DELIVERY_HEADER = "X-AutoSEO-Delivery";
export const EVENT_ID_HEADER = "X-AutoSEO-Event-Id";
export const WEBHOOK_USER_AGENT = "AutoSEO-Webhooks/1.0";

/**
 * Auto-disable: an endpoint is switched off once at least MAX_CONSECUTIVE_FAILURES deliveries in a row
 * failed after all retries AND the failure streak lasted DISABLE_AFTER_HOURS — a short outage during a
 * burst of events never disables it.
 */
export const MAX_CONSECUTIVE_FAILURES = 5;
export const DISABLE_AFTER_HOURS = 24;
/** Attempts per delivery: 1 + 9 retries with the job queue's exponential backoff (15 s … 30 min, ≈ 1.5 h in total). */
export const DELIVERY_MAX_ATTEMPTS = 10;

export type WebhookProjectInfo = { id: string; name: string; domain: string; url: string };

export type WebhookEnvelope = {
  id: string;
  event: string;
  createdAt: string;
  test: boolean;
  project: WebhookProjectInfo;
  data: Record<string, unknown>;
};

export function newEventId(): string {
  return `evt_${crypto.randomBytes(12).toString("base64url")}`;
}

export function buildEnvelope(opts: {
  eventId?: string;
  event: string;
  project: WebhookProjectInfo;
  data: Record<string, unknown>;
  test?: boolean;
  now?: Date;
}): WebhookEnvelope {
  return {
    id: opts.eventId ?? newEventId(),
    event: opts.event,
    createdAt: (opts.now ?? new Date()).toISOString(),
    test: opts.test ?? false,
    project: opts.project,
    data: opts.data,
  };
}

/** Signed headers for one delivery attempt (signature = `sha256=` HMAC of `${timestamp}.${body}`). */
export function deliveryHeaders(secret: string, opts: { event: string; body: string; deliveryId: string; eventId: string; now?: number }): Record<string, string> {
  return {
    ...webhookHeaders(secret, opts.event, opts.body, opts.now),
    [DELIVERY_HEADER]: opts.deliveryId,
    [EVENT_ID_HEADER]: opts.eventId,
    "user-agent": WEBHOOK_USER_AGENT,
  };
}

/** Whether the failure streak is long enough to switch the endpoint off. */
export function shouldAutoDisable(opts: { failureCount: number; failingSince: Date | null; now?: Date }): boolean {
  if (opts.failureCount < MAX_CONSECUTIVE_FAILURES || !opts.failingSince) return false;
  return (opts.now ?? new Date()).getTime() - opts.failingSince.getTime() >= DISABLE_AFTER_HOURS * 3_600_000;
}

/** Whether a failed HTTP response is worth retrying (everything but 410, which unsubscribes). */
export function classifyResponse(status: number): "succeeded" | "gone" | "retry" {
  if (status >= 200 && status < 300) return "succeeded";
  if (status === 410) return "gone";
  return "retry";
}

/** Masks a secret for display: first 10 characters + "…". */
export function secretPrefix(secret: string): string {
  return `${secret.slice(0, 10)}…`;
}

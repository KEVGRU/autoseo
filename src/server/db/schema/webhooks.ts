// Schema for outbound webhooks (event bus for Zapier / Make / n8n / custom receivers). See src/server/webhooks.
import { sql } from "drizzle-orm";
import { pgTable, text, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, ts } from "./_helpers";
import { projects, users } from "./core";

/** A receiver URL subscribed to project events. Payloads are HMAC-signed with the endpoint's secret. */
export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    id: id("whe"),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    /** Optional label ("Zapier – Slack digest"). */
    name: text().notNull().default(""),
    url: text().notNull(),
    /** Signing secret (`whsec_…`), AES-GCM encrypted (encryptJson). Shown to the user once. */
    secret: text().notNull(),
    /** First characters of the secret for display ("whsec_Ab12…"). */
    secretPrefix: text().notNull(),
    /** Subscribed event names; "*" = every event. */
    events: text().array().notNull().default(sql`'{}'::text[]`),
    active: boolean().notNull().default(true),
    /** Consecutive deliveries that failed after all retries (reset on success). */
    failureCount: integer().notNull().default(0),
    /** Start of the current failure streak (null while healthy). */
    failingSince: ts(),
    /** Why the endpoint was switched off automatically (null when active or disabled by a user). */
    disabledReason: text(),
    lastDeliveredAt: ts(),
    lastFailureAt: ts(),
    lastError: text(),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("webhook_endpoints_project_idx").on(t.projectId)],
);

/** One event sent (or being sent) to one endpoint — the delivery log, also used for replays. */
export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: id("whd"),
    endpointId: text()
      .notNull()
      .references(() => webhookEndpoints.id, { onDelete: "cascade" }),
    projectId: text().notNull(),
    event: text().notNull(),
    /** Event id (`evt_…`) shared by all endpoints and replays of the same event — receivers dedupe on it. */
    eventId: text().notNull(),
    /** Exact JSON body that is signed and POSTed. */
    payload: jsonb().$type<Record<string, unknown>>().notNull(),
    status: text({ enum: ["pending", "retrying", "succeeded", "failed"] })
      .notNull()
      .default("pending"),
    /** Attempts made so far. */
    attempt: integer().notNull().default(0),
    responseCode: integer(),
    /** First bytes of the receiver's response (for debugging in the delivery log). */
    responseBody: text(),
    error: text(),
    durationMs: integer(),
    /** true = sent with "Send test event" (sample payload). */
    test: boolean().notNull().default(false),
    /** Delivery this one re-sends (replay). */
    replayOf: text(),
    deliveredAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [
    index("webhook_deliveries_endpoint_idx").on(t.endpointId, t.createdAt),
    index("webhook_deliveries_project_idx").on(t.projectId, t.createdAt),
  ],
);

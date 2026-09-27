import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Prefixed random ids like `ins_4f9k2m…` (16 chars, ~82 bits). */
export function newId(prefix: string): string {
  const bytes = crypto.randomBytes(16);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${prefix}_${out}`;
}

const id = (prefix: string) =>
  text()
    .primaryKey()
    .$defaultFn(() => newId(prefix));
const ts = () => timestamp({ withTimezone: true });
const createdAt = () => ts().notNull().defaultNow();
const updatedAt = () =>
  ts()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/**
 * Which channel/campaign led to a sign-up (picked from the visitor's cookieless page views, see
 * src/server/analytics). Stored on the login token, copied to the account when it is created.
 */
export type Attribution = {
  channel: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  referrerHost: string | null;
  clickSource: string | null;
  landingPath: string | null;
  country: string | null;
  /**
   * UTC day ("YYYY-MM-DD") of the visitor's first page view in the window. Only the day, never an exact timestamp:
   * that would be a join key back to the anonymous page views.
   */
  firstSeenDay: string | null;
};

export const INSTANCE_STATUSES = ["pending_payment", "provisioning", "running", "stopped", "failed", "deleted"] as const;
export type InstanceStatus = (typeof INSTANCE_STATUSES)[number];

/** "shared": a workspace (tenant) in the shared AutoSEO instance; "coolify": a dedicated Coolify service. */
export const INSTANCE_BACKENDS = ["shared", "coolify"] as const;
export type InstanceBackend = (typeof INSTANCE_BACKENDS)[number];

export const users = pgTable(
  "users",
  {
    id: id("usr"),
    email: text().notNull(),
    name: text(),
    /** Mirrors ADMIN_EMAILS (re-synced on every sign-in / session lookup). */
    isAdmin: boolean().notNull().default(false),
    stripeCustomerId: text(),
    /** Sign-up channel/campaign (null for accounts created before tracking or without matching page views). */
    attribution: jsonb().$type<Attribution>(),
    createdAt: createdAt(),
    lastLoginAt: ts(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email), index("users_stripe_customer_idx").on(t.stripeCustomerId)],
);

/** One row per signed-in device. Only the SHA-256 of the cookie token is stored. */
export const sessions = pgTable(
  "sessions",
  {
    id: id("ses"),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text().notNull(),
    ip: text(),
    userAgent: text(),
    expiresAt: ts().notNull(),
    lastSeenAt: ts().notNull().defaultNow(),
    revokedAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("sessions_token_uq").on(t.tokenHash), index("sessions_user_idx").on(t.userId)],
);

/** Magic-link + one-time-code sign-in attempts (hashes only, single use, short-lived). */
export const loginTokens = pgTable(
  "login_tokens",
  {
    id: id("lgt"),
    email: text().notNull(),
    tokenHash: text().notNull(),
    codeHash: text().notNull(),
    redirectTo: text(),
    requestIp: text(),
    /** Only computed for new accounts; copied to `users.attribution` when the account is created. */
    attribution: jsonb().$type<Attribution>(),
    attempts: integer().notNull().default(0),
    expiresAt: ts().notNull(),
    usedAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("login_tokens_hash_uq").on(t.tokenHash), index("login_tokens_email_idx").on(t.email)],
);

/** One managed AutoSEO deployment (a Coolify service) per customer subscription. */
export const instances = pgTable(
  "instances",
  {
    id: id("ins"),
    userId: text().references(() => users.id, { onDelete: "set null" }),
    slug: text().notNull(),
    /** Public host, fixed when the instance is created (e.g. acme.autoseo.codext.de). */
    host: text().notNull(),
    status: text({ enum: INSTANCE_STATUSES }).notNull().default("pending_payment"),
    /** Where it runs. Existing rows are dedicated Coolify services; new ones are chosen at creation. */
    backend: text({ enum: INSTANCE_BACKENDS }).notNull().default("coolify"),
    workspaceName: text().notNull(),
    coolifyServiceUuid: text(),
    stripeCheckoutSessionId: text(),
    stripeSubscriptionId: text(),
    subscriptionStatus: text(),
    /** Billing interval of the subscription's price ("month" / "year"); null before the first sync. */
    planInterval: text(),
    /** Monthly recurring revenue in cents: the latest invoice's net amount (excl. tax, after discounts) per month. */
    mrrCents: integer(),
    currentPeriodEnd: ts(),
    cancelAtPeriodEnd: boolean().notNull().default(false),
    /** Stopped by an admin: billing events must not start it again until an admin starts it. */
    stoppedByAdmin: boolean().notNull().default(false),
    /**
     * Granted without payment by an admin. Not billed, so billing events can't stop it and reservation cleanup
     * ignores it. Cleared when a paid (live) subscription attaches later — from then on normal billing rules apply.
     */
    complimentary: boolean().notNull().default(false),
    /** Email of the admin who granted a complimentary instance (kept as history). */
    grantedBy: text(),
    /** AUTOSEO_SSO_SECRET of this instance, encrypted with the master key. */
    ssoSecretEnc: text(),
    /** Set once the service start was requested; the reconciler then waits for /api/health. */
    startRequestedAt: ts(),
    provisionAttempts: integer().notNull().default(0),
    nextProvisionAt: ts(),
    lastHealthAt: ts(),
    lastHealthOk: boolean(),
    readyEmailSentAt: ts(),
    error: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Deleted instances release their address.
    uniqueIndex("instances_slug_live_uq").on(t.slug).where(sql`status <> 'deleted'`),
    // One instance per account.
    uniqueIndex("instances_user_live_uq").on(t.userId).where(sql`status <> 'deleted'`),
    index("instances_user_idx").on(t.userId),
    index("instances_subscription_idx").on(t.stripeSubscriptionId),
    index("instances_status_idx").on(t.status),
  ],
);

/** Integration settings, one encrypted JSON document per key. */
export const settings = pgTable("settings", {
  key: text().primaryKey(),
  valueEnc: text().notNull(),
  updatedAt: updatedAt(),
});

/** Audit log of everything that happens to accounts, billing and instances. */
export const events = pgTable(
  "events",
  {
    id: id("evt"),
    type: text().notNull(),
    userId: text(),
    instanceId: text(),
    data: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [index("events_created_idx").on(t.createdAt), index("events_instance_idx").on(t.instanceId)],
);

/** Stripe webhook event ids (idempotency). A claim without `processedAt` is still in flight (or crashed). */
export const stripeEvents = pgTable("stripe_events", {
  id: text().primaryKey(),
  type: text().notNull(),
  createdAt: createdAt(),
  processedAt: ts(),
});

/**
 * One random salt per UTC day for the visitor hash of the cookieless statistics. Deleted after two days, after
 * which the day's hashes can no longer be linked to anyone.
 */
export const analyticsSalts = pgTable("analytics_salts", {
  /** UTC day, "YYYY-MM-DD". */
  day: text().primaryKey(),
  salt: text().notNull(),
  createdAt: createdAt(),
});

/**
 * Cookieless first-party page views and a few interactions. No IP addresses, full URLs or click-id values:
 * only the path, the external referrer host, utm_* values, which ad network's click id was present, the country
 * and a daily-rotating visitor hash.
 */
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: id("ae"),
    createdAt: createdAt(),
    /** "pageview" or an interaction such as "cta_signup". */
    name: text().notNull(),
    visitorHash: text().notNull(),
    path: text().notNull(),
    referrerHost: text(),
    utmSource: text(),
    utmMedium: text(),
    utmCampaign: text(),
    utmContent: text(),
    utmTerm: text(),
    clickSource: text(),
    channel: text().notNull(),
    country: text(),
    device: text(),
    props: jsonb().$type<Record<string, string | number | boolean>>(),
  },
  (t) => [index("analytics_events_created_idx").on(t.createdAt), index("analytics_events_visitor_idx").on(t.visitorHash, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type Instance = typeof instances.$inferSelect;
export type EventRow = typeof events.$inferSelect;

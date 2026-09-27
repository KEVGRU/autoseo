// Schema for the alerts engine (rules evaluated hourly → events delivered in-app, by email, Slack and webhook).
import { pgTable, text, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, ts } from "./_helpers";
import { projects, users } from "./core";

export const ALERT_KINDS = [
  "visibility_drop",
  "sov_drop",
  "position_drop",
  "competitor_overtake",
  "new_competitor",
  "sentiment_drop",
  "criticism_spike",
  "new_ad",
  "citation_lost",
  "fact_check_deviation",
  "crawler_missing",
  "bot_error_spike",
  "ai_traffic_drop",
  "run_failed",
] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

export const ALERT_SEVERITIES = ["info", "warning", "critical"] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

/** Kind-specific parameters; unused fields are ignored by the evaluator. */
export type AlertParams = {
  /** Kind-dependent: percentage points, positions, %, count … (see the kind catalog). */
  threshold?: number;
  /** Comparison window in days (current window vs the window right before). */
  windowDays?: number;
  /** AI engine ids to include (empty = all). */
  engines?: string[];
  /** Prompt tag ids to include (empty = all prompts). */
  tags?: string[];
  /** fact_check_deviation: lowest severity that alerts. */
  minSeverity?: "minor" | "major" | "critical";
};

export type AlertChannels = {
  inApp: boolean;
  /** Extra recipients (in addition to in-app notifications). */
  emails: string[];
  /** Post to the Slack incoming webhook stored (encrypted) in `alert_rules.slack_webhook`. */
  slack: boolean;
  /** Masked Slack webhook for display ("hooks.slack.com/…/abcd"). */
  slackHint?: string | null;
  /** Emit the `alert.triggered` event to the project's outbound webhooks. */
  webhook: boolean;
};

export type AlertRuleState = {
  /** Finding keys whose condition was true at the last evaluation (dedupe: they only fire again after clearing). */
  open: string[];
  /** Why the last evaluation could not compare anything (e.g. not enough tracked answers yet). */
  note?: string | null;
};

export const alertRules = pgTable(
  "alert_rules",
  {
    id: id("alr"),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text().notNull(),
    kind: text({ enum: ALERT_KINDS }).notNull(),
    params: jsonb().$type<AlertParams>().notNull().default({}),
    channels: jsonb().$type<AlertChannels>().notNull().default({ inApp: true, emails: [], slack: false, webhook: true }),
    /** Slack incoming webhook URL, AES-GCM encrypted (encryptJson). Never sent to the client. */
    slackWebhook: text(),
    /** Minimum hours between two events of this rule. */
    cooldownHours: integer().notNull().default(24),
    active: boolean().notNull().default(true),
    /** Created by the default rule set on the first visit of the Alerts page. */
    isDefault: boolean().notNull().default(false),
    state: jsonb().$type<AlertRuleState>().notNull().default({ open: [] }),
    /** Evaluation counter — also the optimistic-concurrency version of `state`. */
    evaluations: integer().notNull().default(0),
    lastEvaluatedAt: ts(),
    lastFiredAt: ts(),
    lastError: text(),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("alert_rules_project_idx").on(t.projectId)],
);

export type AlertItem = {
  key: string;
  label: string;
  detail?: string | null;
  href?: string | null;
  value?: number | null;
  previous?: number | null;
  /** Structured details for webhooks / API consumers (e.g. fact-check verdict, severity, rule). */
  meta?: Record<string, string | number | boolean | null>;
};

export type AlertEventPayload = {
  /** What fired (one entry per finding, e.g. each new competitor). */
  items: AlertItem[];
  metric?: string | null;
  current?: number | null;
  previous?: number | null;
  change?: number | null;
  unit?: string | null;
  window?: { from: string; to: string; previousFrom: string; previousTo: string } | null;
};

export type AlertDelivery = {
  inApp?: number;
  emails?: { sent: number; failed: number };
  slack?: "sent" | "failed" | null;
  webhook?: boolean;
  error?: string | null;
};

export const alertEvents = pgTable(
  "alert_events",
  {
    id: id("ale"),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    /** Kept (null) when the rule is deleted so the history survives. */
    ruleId: text().references(() => alertRules.id, { onDelete: "set null" }),
    kind: text({ enum: ALERT_KINDS }).notNull(),
    severity: text({ enum: ALERT_SEVERITIES }).notNull().default("warning"),
    title: text().notNull(),
    body: text().notNull().default(""),
    /** App path to open (relative, e.g. /p/prj_…/ai/tracker). */
    href: text(),
    /** Stable hash of the fired finding keys. */
    dedupeKey: text().notNull(),
    payload: jsonb().$type<AlertEventPayload>().notNull().default({ items: [] }),
    delivery: jsonb().$type<AlertDelivery>().notNull().default({}),
    firedAt: ts().notNull().defaultNow(),
    ackAt: ts(),
    ackBy: text().references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [index("alert_events_project_idx").on(t.projectId, t.firedAt), index("alert_events_rule_idx").on(t.ruleId, t.firedAt)],
);

/** Per-project alert bookkeeping (default rules are created once, so deleting them sticks). */
export const alertProjectSettings = pgTable("alert_project_settings", {
  projectId: text()
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  defaultsSeededAt: ts(),
  updatedAt: updatedAt(),
});

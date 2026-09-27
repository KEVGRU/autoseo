import "server-only";
import { and, count, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { ALERT_KINDS, alertEvents, alertProjectSettings, alertRules, promptTags, type AlertChannels, type AlertKind, type AlertParams } from "@/server/db/schema";
import { encryptJson } from "@/server/crypto";
import { ENGINE_MAP } from "@/lib/engines";
import { ALERT_KIND_META, DEFAULT_CHANNELS, DEFAULT_RULES, describeRule } from "@/features/alerts/kinds";

export type AlertRuleRow = typeof alertRules.$inferSelect;
export type AlertEventRow = typeof alertEvents.$inferSelect;

export const MAX_RULES_PER_PROJECT = 50;

export class AlertInputError extends Error {}

/* ─────────────────────────── Input schemas ─────────────────────────── */

const paramsSchema = z
  .object({
    threshold: z.number().min(0).max(100_000).optional(),
    windowDays: z.number().int().min(1).max(90).optional(),
    engines: z.array(z.string().max(40)).max(30).optional(),
    tags: z.array(z.string().max(64)).max(50).optional().describe("Prompt tag ids."),
    minSeverity: z.enum(["minor", "major", "critical"]).optional(),
  })
  .strict();

const channelsSchema = z
  .object({
    inApp: z.boolean().default(true),
    emails: z.array(z.string().trim().toLowerCase().pipe(z.email())).max(20).default([]),
    slack: z.boolean().default(false),
    webhook: z.boolean().default(true),
  })
  .strict();

const slackUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/hooks\.slack(-gov)?\.com\/(services|workflows|triggers)\/[A-Za-z0-9/_-]+$/.test(v), {
    message: "Use a Slack incoming webhook URL (https://hooks.slack.com/services/…).",
  });

export const alertRuleInput = z.object({
  name: z.string().trim().min(1).max(120),
  kind: z.enum(ALERT_KINDS),
  params: paramsSchema.default({}),
  channels: channelsSchema.default({ inApp: true, emails: [], slack: false, webhook: true }),
  /** Slack incoming webhook: a URL sets it, "" / null clears it, omitted keeps the stored one. */
  slackWebhookUrl: slackUrl.nullish(),
  cooldownHours: z.number().int().min(0).max(720).optional().describe("Minimum hours between two alerts of this rule (default by kind)."),
  active: z.boolean().default(true),
});

export const alertRulePatch = z
  .object({
    name: z.string().trim().min(1).max(120),
    kind: z.enum(ALERT_KINDS),
    params: paramsSchema,
    channels: channelsSchema,
    slackWebhookUrl: slackUrl.nullable(),
    cooldownHours: z.number().int().min(0).max(720),
    active: z.boolean(),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update.");

/* ─────────────────────────── Public shapes ─────────────────────────── */

export type PublicAlertRule = {
  id: string;
  name: string;
  kind: AlertKind;
  kindLabel: string;
  summary: string;
  params: AlertParams;
  channels: AlertChannels;
  hasSlackWebhook: boolean;
  cooldownHours: number;
  active: boolean;
  isDefault: boolean;
  lastFiredAt: string | null;
  lastEvaluatedAt: string | null;
  lastError: string | null;
  /** Why the last evaluation had nothing to compare (e.g. not enough data yet). */
  note: string | null;
  evaluations: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicAlertEvent = {
  id: string;
  ruleId: string | null;
  ruleName: string | null;
  kind: AlertKind;
  kindLabel: string;
  severity: AlertEventRow["severity"];
  title: string;
  body: string;
  href: string | null;
  payload: AlertEventRow["payload"];
  delivery: AlertEventRow["delivery"];
  firedAt: string;
  ackAt: string | null;
  ackBy: string | null;
};

/** Masks an address for viewers without alerts.manage ("s***@example.com"). */
function maskEmail(e: string): string {
  const [local = "", domain = ""] = e.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

/** `revealRecipients: false` masks the email recipients (for viewers without alerts.manage). */
export function toPublicRule(r: AlertRuleRow, opts: { revealRecipients: boolean }): PublicAlertRule {
  const channels = { ...DEFAULT_CHANNELS, ...r.channels, slackHint: r.slackWebhook ? (r.channels.slackHint ?? "Slack webhook") : null };
  if (!opts.revealRecipients) channels.emails = channels.emails.map(maskEmail);
  return {
    id: r.id,
    name: r.name,
    kind: r.kind,
    kindLabel: ALERT_KIND_META[r.kind].label,
    summary: describeRule(r.kind, r.params),
    params: r.params,
    channels,
    hasSlackWebhook: Boolean(r.slackWebhook),
    cooldownHours: r.cooldownHours,
    active: r.active,
    isDefault: r.isDefault,
    lastFiredAt: r.lastFiredAt?.toISOString() ?? null,
    lastEvaluatedAt: r.lastEvaluatedAt?.toISOString() ?? null,
    lastError: r.lastError,
    note: r.state?.note ?? null,
    evaluations: r.evaluations,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toPublicEvent(e: AlertEventRow, ruleName: string | null = null): PublicAlertEvent {
  return {
    id: e.id,
    ruleId: e.ruleId,
    ruleName,
    kind: e.kind,
    kindLabel: ALERT_KIND_META[e.kind].label,
    severity: e.severity,
    title: e.title,
    body: e.body,
    href: e.href,
    payload: e.payload,
    delivery: e.delivery,
    firedAt: e.firedAt.toISOString(),
    ackAt: e.ackAt?.toISOString() ?? null,
    ackBy: e.ackBy,
  };
}

/* ─────────────────────────── Helpers ─────────────────────────── */

function slackHint(url: string): string {
  const tail = url.replace(/\/+$/, "").split("/").pop() ?? "";
  return `hooks.slack.com/…/${tail.slice(-4)}`;
}

/** Keeps only known engines and tags of this project (silently drops the rest). */
async function cleanParams(projectId: string, params: AlertParams): Promise<AlertParams> {
  const out: AlertParams = { ...params };
  if (params.engines) out.engines = [...new Set(params.engines.filter((e) => ENGINE_MAP.has(e as never)))];
  if (params.tags?.length) {
    const rows = await db
      .select({ id: promptTags.id })
      .from(promptTags)
      .where(and(eq(promptTags.projectId, projectId), inArray(promptTags.id, params.tags)));
    out.tags = rows.map((r) => r.id);
  }
  for (const k of Object.keys(out) as (keyof AlertParams)[]) {
    const v = out[k];
    if (v === undefined || (Array.isArray(v) && !v.length)) delete out[k];
  }
  return out;
}

function slackColumns(url: string | null | undefined, channels: AlertChannels): { slackWebhook?: string | null; channels: AlertChannels } {
  if (url === undefined) return { channels };
  if (!url) return { slackWebhook: null, channels: { ...channels, slack: false, slackHint: null } };
  return { slackWebhook: encryptJson(url), channels: { ...channels, slackHint: slackHint(url) } };
}

/* ─────────────────────────── Rules CRUD ─────────────────────────── */

export async function listRules(projectId: string): Promise<AlertRuleRow[]> {
  return db.select().from(alertRules).where(eq(alertRules.projectId, projectId)).orderBy(alertRules.createdAt);
}

export async function getRule(projectId: string, ruleId: string): Promise<AlertRuleRow | null> {
  const [row] = await db
    .select()
    .from(alertRules)
    .where(and(eq(alertRules.projectId, projectId), eq(alertRules.id, ruleId)))
    .limit(1);
  return row ?? null;
}

export async function createRule(projectId: string, input: z.input<typeof alertRuleInput>, userId: string | null): Promise<AlertRuleRow> {
  const data = alertRuleInput.parse(input);
  const [{ n }] = (await db.select({ n: count() }).from(alertRules).where(eq(alertRules.projectId, projectId))) as [{ n: number }];
  if (n >= MAX_RULES_PER_PROJECT) throw new AlertInputError(`A project can have at most ${MAX_RULES_PER_PROJECT} alert rules.`);
  const slack = slackColumns(data.slackWebhookUrl, { ...data.channels, slackHint: null });
  if (slack.channels.slack && !slack.slackWebhook) throw new AlertInputError("Add a Slack incoming webhook URL to post to Slack.");
  const [row] = await db
    .insert(alertRules)
    .values({
      projectId,
      name: data.name,
      kind: data.kind,
      params: await cleanParams(projectId, data.params),
      channels: slack.channels,
      slackWebhook: slack.slackWebhook ?? null,
      cooldownHours: data.cooldownHours ?? ALERT_KIND_META[data.kind].defaults.cooldownHours,
      active: data.active,
      createdBy: userId,
    })
    .returning();
  return row!;
}

export async function updateRule(projectId: string, ruleId: string, patch: z.input<typeof alertRulePatch>): Promise<AlertRuleRow> {
  const data = alertRulePatch.parse(patch);
  const row = await getRule(projectId, ruleId);
  if (!row) throw new AlertInputError("Alert rule not found.");
  const set: Partial<typeof alertRules.$inferInsert> = {};
  if (data.name !== undefined) set.name = data.name;
  if (data.kind !== undefined && data.kind !== row.kind) {
    set.kind = data.kind;
    set.state = { open: [] }; // findings of another kind are unrelated
  }
  if (data.params !== undefined) {
    set.params = await cleanParams(projectId, data.params);
    set.state = { open: [] }; // new thresholds/filters → re-evaluate from scratch
  }
  if (data.cooldownHours !== undefined) set.cooldownHours = data.cooldownHours;
  if (data.active !== undefined) set.active = data.active;
  if (data.channels !== undefined || data.slackWebhookUrl !== undefined) {
    const base: AlertChannels = { ...DEFAULT_CHANNELS, ...row.channels, ...(data.channels ?? {}) };
    const slack = slackColumns(data.slackWebhookUrl, base);
    if (slack.slackWebhook !== undefined) set.slackWebhook = slack.slackWebhook;
    const hasSlack = slack.slackWebhook !== undefined ? Boolean(slack.slackWebhook) : Boolean(row.slackWebhook);
    if (slack.channels.slack && !hasSlack) throw new AlertInputError("Add a Slack incoming webhook URL to post to Slack.");
    set.channels = slack.channels;
  }
  const [updated] = await db
    .update(alertRules)
    // Bumping the version makes an evaluation that is running with the old settings discard its result.
    .set({ ...set, evaluations: sql`${alertRules.evaluations} + 1` })
    .where(and(eq(alertRules.projectId, projectId), eq(alertRules.id, ruleId)))
    .returning();
  return updated!;
}

export async function deleteRule(projectId: string, ruleId: string): Promise<boolean> {
  const rows = await db
    .delete(alertRules)
    .where(and(eq(alertRules.projectId, projectId), eq(alertRules.id, ruleId)))
    .returning({ id: alertRules.id });
  return rows.length > 0;
}

/**
 * Creates the default rule set once per project (first visit of the Alerts page / first API read).
 * Deleted defaults stay deleted: the seed is recorded in `alert_project_settings`.
 */
export async function ensureDefaultRules(projectId: string): Promise<boolean> {
  const [claimed] = await db
    .insert(alertProjectSettings)
    .values({ projectId, defaultsSeededAt: new Date() })
    .onConflictDoNothing()
    .returning({ projectId: alertProjectSettings.projectId });
  if (!claimed) return false;
  await db.insert(alertRules).values(
    DEFAULT_RULES.map((r) => ({
      projectId,
      name: r.name,
      kind: r.kind,
      params: r.params,
      channels: { ...DEFAULT_CHANNELS },
      cooldownHours: ALERT_KIND_META[r.kind].defaults.cooldownHours,
      isDefault: true,
    })),
  );
  return true;
}

/* ─────────────────────────── Events feed ─────────────────────────── */

export const alertEventsQuery = z.object({
  status: z.enum(["open", "acknowledged", "all"]).default("all").describe("open = not acknowledged yet."),
  kind: z.enum(ALERT_KINDS).optional(),
  ruleId: z.string().max(64).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function listEvents(projectId: string, q: z.infer<typeof alertEventsQuery>) {
  const where = and(
    eq(alertEvents.projectId, projectId),
    q.status === "open" ? isNull(alertEvents.ackAt) : q.status === "acknowledged" ? isNotNull(alertEvents.ackAt) : undefined,
    q.kind ? eq(alertEvents.kind, q.kind) : undefined,
    q.ruleId ? eq(alertEvents.ruleId, q.ruleId) : undefined,
  );
  const [rows, [totals]] = await Promise.all([
    db
      .select({ event: alertEvents, ruleName: alertRules.name })
      .from(alertEvents)
      .leftJoin(alertRules, eq(alertRules.id, alertEvents.ruleId))
      .where(where)
      .orderBy(desc(alertEvents.firedAt))
      .limit(q.limit)
      .offset((q.page - 1) * q.limit),
    db.select({ n: count() }).from(alertEvents).where(where),
  ]);
  const total = Number(totals?.n ?? 0);
  return {
    items: rows.map((r) => toPublicEvent(r.event, r.ruleName)),
    pagination: { page: q.page, limit: q.limit, total, totalPages: Math.max(1, Math.ceil(total / q.limit)) },
  };
}

export async function eventCounts(projectId: string) {
  const [r] = await db
    .select({
      total: count(),
      open: sql<number>`count(*) filter (where ${alertEvents.ackAt} is null)`.mapWith(Number),
      critical: sql<number>`count(*) filter (where ${alertEvents.ackAt} is null and ${alertEvents.severity} = 'critical')`.mapWith(Number),
      last7d: sql<number>`count(*) filter (where ${alertEvents.firedAt} >= now() - interval '7 days')`.mapWith(Number),
    })
    .from(alertEvents)
    .where(eq(alertEvents.projectId, projectId));
  return { total: Number(r?.total ?? 0), open: r?.open ?? 0, critical: r?.critical ?? 0, last7d: r?.last7d ?? 0 };
}

/** Acknowledges events (ids, or every open event when `ids` is "all"). Returns how many changed. */
export async function ackEvents(projectId: string, ids: string[] | "all", userId: string | null): Promise<number> {
  const rows = await db
    .update(alertEvents)
    .set({ ackAt: new Date(), ackBy: userId })
    .where(and(eq(alertEvents.projectId, projectId), isNull(alertEvents.ackAt), ids === "all" ? undefined : inArray(alertEvents.id, ids)))
    .returning({ id: alertEvents.id });
  return rows.length;
}

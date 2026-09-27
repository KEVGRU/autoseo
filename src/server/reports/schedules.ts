import "server-only";
import { and, desc, eq, gte, isNotNull, lt, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import {
  projects,
  REPORT_RANGE_PRESETS,
  REPORT_SCHEDULE_CADENCES,
  REPORT_SCHEDULE_FORMATS,
  reportDeliveries,
  reports,
  reportSchedules,
  users,
  type ReportDeliveryResult,
} from "@/server/db/schema";
import { ActionError } from "@/server/auth/guards";
import { logAudit } from "@/server/audit";
import { activeProjectSql } from "@/server/cloud/tenancy";
import { appUrl, sendMail, type MailAttachment } from "@/server/email";
import { enqueueJob } from "@/server/jobs/queue";
import { getSetting } from "@/server/settings";
import { emitReportSent } from "@/server/webhooks/emitters";
import { interpolate } from "@/features/reports/lib/catalog";
import { resolveReportPeriod } from "@/features/reports/lib/period";
import {
  computeNextRun,
  describeSchedule,
  formatLabel,
  isValidTimeZone,
  parseRecipients,
  rangePresetLabel,
  resolveScheduleRange,
  type ScheduleFormat,
  type ScheduleRangePreset,
} from "@/features/reports/lib/schedule";
import type { Permission } from "@/server/auth/permissions";
import { getAssetForProject, readAsset } from "./assets";
import { getBrandKit } from "./brand";
import { loadReportData } from "./data";
import { buildEmailKpis, renderReportEmail } from "./email-template";
import { buildReportPptxBuffer } from "./pptx";
import { fetchPublicImage } from "./safe-fetch";
import { requireReport, reportDeck } from "./service";
import { mintShareToken } from "./share";

/*
 * Scheduled report delivery: schedules (weekly / monthly in a time zone), the 15-minute tick that
 * claims due schedules, and the sender that refreshes the data for the schedule's period, builds the
 * PPTX, mints an expiring frozen share link and emails the recipients.
 */

export const SEND_JOB = "reports.schedule.send";
export const MAX_RECIPIENTS = 25;
export const MAX_SCHEDULES_PER_REPORT = 10;
/** Attachments above this size are not emailed (SES / most providers cap messages at ~10 MB after base64). */
export const MAX_PPTX_ATTACHMENT_BYTES = 7 * 1024 * 1024;
/** Abuse guard: deliveries (each up to MAX_RECIPIENTS emails) per project and 24 hours. */
export const MAX_DELIVERIES_PER_DAY = 100;

/**
 * Role permissions needed to create / edit / send a schedule with this format: managing reports, plus
 * `reports.share` when it emails a public link and `data.export` when it attaches the exported PPTX.
 */
export function schedulePermissions(format: ScheduleFormat): Permission[] {
  return ["reports.manage", ...(format !== "pptx" ? (["reports.share"] as const) : []), ...(format !== "link" ? (["data.export"] as const) : [])];
}

/** Permissions a schedule change needs: pausing alone only needs `reports.manage` (it reduces exposure). */
export function schedulePatchPermissions(currentFormat: ScheduleFormat, patch: Record<string, unknown>): Permission[] {
  const keys = Object.keys(patch).filter((k) => patch[k] !== undefined);
  if (keys.length === 1 && keys[0] === "enabled" && patch.enabled === false) return ["reports.manage"];
  return schedulePermissions((patch.format as ScheduleFormat | undefined) ?? currentFormat);
}

export type ScheduleRow = typeof reportSchedules.$inferSelect;
export type DeliveryRow = typeof reportDeliveries.$inferSelect;
export type ScheduleSendPayload = { scheduleId: string; trigger: "schedule" | "manual"; dueAt?: string | null; userId?: string | null };

/* ───────────────────────────── Validation ───────────────────────────── */

const recipientsField = z.union([z.string().max(10_000), z.array(z.string().max(320)).max(100)]).transform((v, ctx) => {
  const { valid, invalid } = parseRecipients(v);
  if (invalid.length) ctx.addIssue({ code: "custom", message: `Not a valid email address: ${invalid.slice(0, 3).join(", ")}` });
  if (!valid.length) ctx.addIssue({ code: "custom", message: "Add at least one recipient." });
  if (valid.length > MAX_RECIPIENTS) ctx.addIssue({ code: "custom", message: `At most ${MAX_RECIPIENTS} recipients per schedule.` });
  return valid;
});

const scheduleShape = {
  cadence: z.enum(REPORT_SCHEDULE_CADENCES).describe("weekly or monthly"),
  weekday: z.coerce.number().int().min(0).max(6).describe("Weekly: 0 = Sunday … 6 = Saturday"),
  monthDay: z.coerce.number().int().min(1).max(31).describe("Monthly: day of month 1–31 (past the month's end = last day)"),
  hour: z.coerce.number().int().min(0).max(23).describe("Local hour 0–23 in `timezone`"),
  timezone: z.string().trim().min(1).max(64).refine(isValidTimeZone, "Unknown time zone").describe("IANA time zone, e.g. Europe/Berlin"),
  recipients: recipientsField.describe(`Email addresses (array or comma/newline separated, max ${MAX_RECIPIENTS})`),
  format: z.enum(REPORT_SCHEDULE_FORMATS).describe("link = expiring read-only link, pptx = PowerPoint attached, both"),
  rangePreset: z.enum(REPORT_RANGE_PRESETS).describe("Reporting window: last_7, last_14, last_30, last_90, last_week, last_month, last_quarter, month_to_date, report (the report's own period)"),
  subject: z.string().trim().max(200).nullish().describe("Custom subject ({{client.name}}, {{report.period}} … tokens allowed); default: title — period"),
  message: z.string().trim().max(2000).nullish().describe("Personal note shown above the KPIs (tokens allowed)"),
  linkExpiryDays: z.coerce.number().int().min(1).max(365).describe("How long the emailed link stays valid (days)"),
  enabled: z.boolean().describe("false = paused"),
};

export const scheduleInputSchema = z.object({
  ...scheduleShape,
  cadence: scheduleShape.cadence.default("monthly"),
  weekday: scheduleShape.weekday.default(1),
  monthDay: scheduleShape.monthDay.default(1),
  hour: scheduleShape.hour.default(8),
  timezone: scheduleShape.timezone.default("UTC"),
  format: scheduleShape.format.default("both"),
  rangePreset: scheduleShape.rangePreset.default("last_month"),
  linkExpiryDays: scheduleShape.linkExpiryDays.default(30),
  enabled: scheduleShape.enabled.default(true),
});
export const schedulePatchSchema = z.object(scheduleShape).partial();
export type ScheduleInput = z.input<typeof scheduleInputSchema>;
export type SchedulePatch = z.input<typeof schedulePatchSchema>;

/* ───────────────────────────── DTOs ───────────────────────────── */

export type ReportScheduleDTO = {
  id: string;
  reportId: string;
  reportTitle: string;
  reportKind: "deck" | "html";
  cadence: ScheduleRow["cadence"];
  weekday: number;
  monthDay: number;
  hour: number;
  timezone: string;
  recipients: string[];
  format: ScheduleRow["format"];
  formatLabel: string;
  rangePreset: ScheduleRow["rangePreset"];
  rangeLabel: string;
  subject: string | null;
  message: string | null;
  linkExpiryDays: number;
  enabled: boolean;
  description: string;
  nextRunAt: string | null;
  lastSentAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReportDeliveryDTO = {
  id: string;
  scheduleId: string | null;
  reportId: string;
  trigger: DeliveryRow["trigger"];
  status: DeliveryRow["status"];
  error: string | null;
  format: DeliveryRow["format"];
  recipients: string[];
  results: ReportDeliveryResult[];
  periodLabel: string | null;
  rangeFrom: string | null;
  rangeTo: string | null;
  shareUrl: string | null;
  expiresAt: string | null;
  pptxBytes: number | null;
  views: number;
  createdAt: string;
  finishedAt: string | null;
};

function toScheduleDTO(s: ScheduleRow, report: { title: string; kind: "deck" | "html" }, createdBy: string | null): ReportScheduleDTO {
  return {
    id: s.id,
    reportId: s.reportId,
    reportTitle: report.title,
    reportKind: report.kind,
    cadence: s.cadence,
    weekday: s.weekday,
    monthDay: s.monthDay,
    hour: s.hour,
    timezone: s.timezone,
    recipients: s.recipients,
    format: s.format,
    formatLabel: formatLabel(s.format),
    rangePreset: s.rangePreset,
    rangeLabel: rangePresetLabel(s.rangePreset),
    subject: s.subject,
    message: s.message,
    linkExpiryDays: s.linkExpiryDays,
    enabled: s.enabled,
    description: describeSchedule(s),
    nextRunAt: s.enabled ? (s.nextRunAt?.toISOString() ?? null) : null,
    lastSentAt: s.lastSentAt?.toISOString() ?? null,
    lastStatus: s.lastStatus,
    lastError: s.lastError,
    createdBy,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

const shareUrlOf = (token: string | null) => (token ? appUrl(`/share/r/${token}`) : null);

function toDeliveryDTO(d: DeliveryRow): ReportDeliveryDTO {
  const live = d.token && d.expiresAt && d.expiresAt.getTime() > Date.now() && d.status !== "failed" && d.status !== "sending";
  return {
    id: d.id,
    scheduleId: d.scheduleId,
    reportId: d.reportId,
    trigger: d.trigger,
    status: d.status,
    error: d.error,
    format: d.format,
    recipients: d.recipients,
    results: d.results,
    periodLabel: d.periodLabel,
    rangeFrom: d.rangeFrom,
    rangeTo: d.rangeTo,
    shareUrl: live ? shareUrlOf(d.token) : null,
    expiresAt: d.expiresAt?.toISOString() ?? null,
    pptxBytes: d.pptxBytes,
    views: d.views,
    createdAt: d.createdAt.toISOString(),
    finishedAt: d.finishedAt?.toISOString() ?? null,
  };
}

/* ───────────────────────────── CRUD ───────────────────────────── */

export async function listSchedules(projectId: string, opts: { reportId?: string } = {}): Promise<ReportScheduleDTO[]> {
  const rows = await db
    .select({ s: reportSchedules, title: reports.title, kind: reports.kind, userName: users.name, userEmail: users.email })
    .from(reportSchedules)
    .innerJoin(reports, eq(reports.id, reportSchedules.reportId))
    .leftJoin(users, eq(users.id, reportSchedules.createdBy))
    .where(and(eq(reportSchedules.projectId, projectId), opts.reportId ? eq(reportSchedules.reportId, opts.reportId) : undefined))
    .orderBy(desc(reportSchedules.createdAt))
    .limit(500);
  return rows.map((r) => toScheduleDTO(r.s, { title: r.title, kind: r.kind }, r.userName ?? r.userEmail ?? null));
}

async function requireSchedule(projectId: string, scheduleId: string, reportId?: string) {
  const [row] = await db
    .select({ s: reportSchedules, title: reports.title, kind: reports.kind })
    .from(reportSchedules)
    .innerJoin(reports, eq(reports.id, reportSchedules.reportId))
    .where(and(eq(reportSchedules.id, scheduleId), eq(reportSchedules.projectId, projectId), reportId ? eq(reportSchedules.reportId, reportId) : undefined))
    .limit(1);
  if (!row) throw new ActionError("Schedule not found.", "not_found");
  return row;
}

/** Current format of a schedule (permission checks before edits / sends). */
export async function scheduleFormat(projectId: string, scheduleId: string, reportId?: string): Promise<ScheduleFormat> {
  return (await requireSchedule(projectId, scheduleId, reportId)).s.format;
}

export async function getSchedule(projectId: string, scheduleId: string, reportId?: string): Promise<ReportScheduleDTO> {
  const row = await requireSchedule(projectId, scheduleId, reportId);
  return toScheduleDTO(row.s, { title: row.title, kind: row.kind }, null);
}

function assertFormat(kind: "deck" | "html", format: string) {
  if (kind === "html" && format !== "link") throw new ActionError("AI (HTML) reports can only be sent as a link — PowerPoint export needs a slide report.", "invalid");
}

export async function createSchedule(projectId: string, reportId: string, input: ScheduleInput, userId: string | null): Promise<ReportScheduleDTO> {
  const data = scheduleInputSchema.parse(input);
  const report = await requireReport(projectId, reportId);
  assertFormat(report.kind, data.format);
  const [c] = await db.select({ c: sql<number>`count(*)::int` }).from(reportSchedules).where(eq(reportSchedules.reportId, report.id));
  if ((c?.c ?? 0) >= MAX_SCHEDULES_PER_REPORT) throw new ActionError(`A report can have at most ${MAX_SCHEDULES_PER_REPORT} schedules.`, "conflict");
  const [row] = await db
    .insert(reportSchedules)
    .values({
      reportId: report.id,
      projectId,
      cadence: data.cadence,
      weekday: data.weekday,
      monthDay: data.monthDay,
      hour: data.hour,
      timezone: data.timezone,
      recipients: data.recipients,
      format: data.format,
      rangePreset: data.rangePreset,
      subject: data.subject || null,
      message: data.message || null,
      linkExpiryDays: data.linkExpiryDays,
      enabled: data.enabled,
      nextRunAt: data.enabled ? computeNextRun(data) : null,
      createdBy: userId,
    })
    .returning();
  return toScheduleDTO(row!, report, null);
}

export async function updateSchedule(projectId: string, scheduleId: string, patch: SchedulePatch, opts: { reportId?: string } = {}): Promise<ReportScheduleDTO> {
  const data = schedulePatchSchema.parse(patch);
  const cur = await requireSchedule(projectId, scheduleId, opts.reportId);
  const next = { ...cur.s, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) } as ScheduleRow;
  assertFormat(cur.kind, next.format);
  const timingChanged = (["cadence", "weekday", "monthDay", "hour", "timezone", "enabled"] as const).some((k) => data[k] !== undefined && data[k] !== cur.s[k]);
  const [row] = await db
    .update(reportSchedules)
    .set({
      cadence: next.cadence,
      weekday: next.weekday,
      monthDay: next.monthDay,
      hour: next.hour,
      timezone: next.timezone,
      recipients: next.recipients,
      format: next.format,
      rangePreset: next.rangePreset,
      subject: data.subject !== undefined ? data.subject || null : cur.s.subject,
      message: data.message !== undefined ? data.message || null : cur.s.message,
      linkExpiryDays: next.linkExpiryDays,
      enabled: next.enabled,
      ...(timingChanged || !cur.s.nextRunAt ? { nextRunAt: next.enabled ? computeNextRun(next) : null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(reportSchedules.id, cur.s.id))
    .returning();
  return toScheduleDTO(row!, { title: cur.title, kind: cur.kind }, null);
}

export async function deleteSchedule(projectId: string, scheduleId: string, opts: { reportId?: string } = {}) {
  const cur = await requireSchedule(projectId, scheduleId, opts.reportId);
  await db.delete(reportSchedules).where(eq(reportSchedules.id, cur.s.id));
  return { scheduleId: cur.s.id, deleted: true };
}

export async function listDeliveries(projectId: string, opts: { reportId?: string; scheduleId?: string; limit?: number } = {}): Promise<ReportDeliveryDTO[]> {
  const rows = await db
    .select()
    .from(reportDeliveries)
    .where(
      and(
        eq(reportDeliveries.projectId, projectId),
        opts.reportId ? eq(reportDeliveries.reportId, opts.reportId) : undefined,
        opts.scheduleId ? eq(reportDeliveries.scheduleId, opts.scheduleId) : undefined,
      ),
    )
    .orderBy(desc(reportDeliveries.createdAt))
    .limit(Math.min(100, opts.limit ?? 20));
  return rows.map(toDeliveryDTO);
}

/** Kills the emailed link of one delivery (e.g. sent to a wrong address). */
export async function revokeDelivery(projectId: string, deliveryId: string): Promise<ReportDeliveryDTO> {
  const [row] = await db
    .update(reportDeliveries)
    .set({ expiresAt: new Date(), snapshot: null })
    .where(and(eq(reportDeliveries.id, deliveryId), eq(reportDeliveries.projectId, projectId)))
    .returning();
  if (!row) throw new ActionError("Delivery not found.", "not_found");
  return toDeliveryDTO(row);
}

/** Queues an immediate send of a schedule ("Send now"); returns the job id. */
export async function queueSendNow(projectId: string, scheduleId: string, userId: string | null, opts: { reportId?: string } = {}) {
  const cur = await requireSchedule(projectId, scheduleId, opts.reportId);
  const payload: ScheduleSendPayload = { scheduleId: cur.s.id, trigger: "manual", userId };
  const job = await enqueueJob(SEND_JOB, payload, {
    projectId,
    createdBy: userId,
    priority: 30,
    maxAttempts: 1,
    allowDemo: true,
    dedupeKey: `${SEND_JOB}:manual:${cur.s.id}`,
  });
  if (!job) throw new ActionError("A send of this schedule is already queued — wait for it to finish.", "conflict");
  return { jobId: job.id, scheduleId: cur.s.id };
}

/* ───────────────────────────── Tick (claim due schedules) ───────────────────────────── */

/**
 * Claims due schedules (FOR UPDATE SKIP LOCKED — safe with several workers), advances `nextRunAt`
 * past now and queues one `reports.schedule.send` per due slot. A send inserts its delivery row with
 * a unique (schedule, slot) key first, so a re-queued slot can never email twice.
 */
export async function claimDueSchedules(now: Date = new Date(), limit = 100): Promise<number> {
  return db.transaction(async (tx) => {
    const due = await tx
      .select({ s: reportSchedules })
      .from(reportSchedules)
      .innerJoin(projects, eq(projects.id, reportSchedules.projectId))
      .where(
        and(
          eq(reportSchedules.enabled, true),
          isNotNull(reportSchedules.nextRunAt),
          lte(reportSchedules.nextRunAt, now),
          eq(projects.archived, false),
          activeProjectSql(reportSchedules.projectId),
        ),
      )
      .orderBy(reportSchedules.nextRunAt)
      .limit(limit)
      .for("update", { of: reportSchedules, skipLocked: true });
    for (const { s } of due) {
      const slot = s.nextRunAt!;
      await tx.update(reportSchedules).set({ nextRunAt: computeNextRun(s, now) }).where(eq(reportSchedules.id, s.id));
      const payload: ScheduleSendPayload = { scheduleId: s.id, trigger: "schedule", dueAt: slot.toISOString() };
      await enqueueJob(SEND_JOB, payload, {
        projectId: s.projectId,
        maxAttempts: 1,
        priority: 90,
        allowDemo: true,
        dedupeKey: `${SEND_JOB}:${s.id}:${slot.toISOString()}`,
      });
    }
    return due.length;
  });
}

/** Drops frozen link data once links expired, and deletes old delivery logs. */
export async function pruneDeliveries() {
  await db
    .update(reportDeliveries)
    .set({ snapshot: null })
    .where(and(isNotNull(reportDeliveries.snapshot), lt(reportDeliveries.expiresAt, new Date(Date.now() - 86_400_000))));
  await db.delete(reportDeliveries).where(lt(reportDeliveries.createdAt, new Date(Date.now() - 400 * 86_400_000)));
}

/* ───────────────────────────── Sender ───────────────────────────── */

const formatBytes = (n: number) => (n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const EMAIL_IMAGE = /^image\/(png|jpe?g|gif)$/;

/** Loads a brand-kit logo (uploaded asset or public URL) as an inline email image (PNG/JPEG/GIF ≤ 1 MB). */
async function loadLogo(src: string | undefined, workspaceId: string, projectId: string): Promise<MailAttachment | null> {
  if (!src) return null;
  try {
    let buf: Buffer | null = null;
    let type = "";
    if (src.startsWith("asset:")) {
      const asset = await getAssetForProject(src.slice(6), workspaceId, projectId);
      if (!asset) return null;
      buf = await readAsset(asset);
      type = asset.mimeType;
    } else if (/^https?:\/\//i.test(src)) {
      const dataUrl = await fetchPublicImage(src, 1_000_000);
      const m = dataUrl?.match(/^data:([^;]+);base64,(.*)$/);
      if (!m) return null;
      type = m[1]!;
      buf = Buffer.from(m[2]!, "base64");
    }
    if (!buf || !buf.length || buf.length > 1_000_000 || !EMAIL_IMAGE.test(type)) return null;
    const ext = type === "image/png" ? "png" : type === "image/gif" ? "gif" : "jpg";
    return { filename: `logo.${ext}`, content: buf, contentType: type, cid: "report-logo" };
  } catch {
    return null;
  }
}

function fileName(title: string, to: string) {
  const base = title.replace(/[^\p{L}\p{N} _.-]+/gu, "").replace(/\s+/g, " ").trim().slice(0, 80) || "Report";
  return `${base} ${to}.pptx`;
}

/** Sends one delivery of a schedule (job `reports.schedule.send`). Never retried: a failure is recorded on the delivery. */
export async function runScheduleSend(payload: ScheduleSendPayload) {
  const [row] = await db
    .select({ s: reportSchedules, r: reports, p: projects })
    .from(reportSchedules)
    .innerJoin(reports, eq(reports.id, reportSchedules.reportId))
    .innerJoin(projects, eq(projects.id, reportSchedules.projectId))
    .where(eq(reportSchedules.id, payload.scheduleId))
    .limit(1);
  if (!row) return { skipped: "not_found" };
  const { s, r, p } = row;
  if (payload.trigger === "schedule" && !s.enabled) return { skipped: "paused" };
  if (p.archived) return { skipped: "archived" };

  const at = payload.dueAt ? new Date(payload.dueAt) : new Date();
  const range = resolveScheduleRange(s.rangePreset as ScheduleRangePreset, at, s.timezone, r.dateRange);
  const period = resolveReportPeriod(range, at);
  const wantsLink = s.format !== "pptx";
  const token = wantsLink ? mintShareToken() : null;
  const expiresAt = wantsLink ? new Date(Date.now() + s.linkExpiryDays * 86_400_000) : null;

  const [delivery] = await db
    .insert(reportDeliveries)
    .values({
      scheduleId: s.id,
      reportId: r.id,
      projectId: r.projectId,
      trigger: payload.trigger,
      dueAt: payload.trigger === "schedule" && payload.dueAt ? new Date(payload.dueAt) : null,
      rangeFrom: period.from,
      rangeTo: period.to,
      periodLabel: period.label,
      format: s.format,
      recipients: s.recipients,
      token,
      expiresAt,
      createdBy: payload.userId ?? null,
    })
    .onConflictDoNothing()
    .returning();
  if (!delivery) return { skipped: "already_sent" };

  const fail = async (message: string) => {
    await db.update(reportDeliveries).set({ status: "failed", error: message, finishedAt: new Date() }).where(eq(reportDeliveries.id, delivery.id));
    await db.update(reportSchedules).set({ lastStatus: "failed", lastError: message }).where(eq(reportSchedules.id, s.id));
    return { deliveryId: delivery.id, status: "failed" as const, error: message };
  };

  let result: Awaited<ReturnType<typeof sendDelivery>>;
  try {
    const [recent] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(reportDeliveries)
      .where(and(eq(reportDeliveries.projectId, r.projectId), gte(reportDeliveries.createdAt, new Date(Date.now() - 86_400_000))));
    if ((recent?.n ?? 0) > MAX_DELIVERIES_PER_DAY) return await fail(`This project already sent ${MAX_DELIVERIES_PER_DAY} report deliveries in the last 24 hours — try again later.`);
    result = await sendDelivery({ s, r, payload, delivery, range, period, token, expiresAt, fail });
  } catch (err) {
    console.error(`[reports] scheduled send ${delivery.id} failed`, err);
    return fail(err instanceof Error ? err.message.slice(0, 500) : String(err).slice(0, 500));
  }
  if (!("done" in result)) return result;
  // Bookkeeping after the emails went out: a failure here must not mark the delivery (and its emailed link) as failed.
  try {
    await finishDelivery(result.done);
  } catch (err) {
    console.error(`[reports] bookkeeping for delivery ${delivery.id} failed`, err);
  }
  return result.summary;
}

type SendCtx = {
  s: ScheduleRow;
  r: typeof reports.$inferSelect;
  payload: ScheduleSendPayload;
  delivery: DeliveryRow;
  range: ReturnType<typeof resolveScheduleRange>;
  period: ReturnType<typeof resolveReportPeriod>;
  token: string | null;
  expiresAt: Date | null;
  fail: (message: string) => Promise<{ deliveryId: string; status: "failed"; error: string }>;
};

type SendDone = {
  deliveryId: string;
  scheduleId: string;
  status: DeliveryRow["status"];
  error: string | null;
  results: ReportDeliveryResult[];
  pptxBytes: number | null;
  report: { id: string; title: string; projectId: string; workspaceId: string };
  shareUrl: string | null;
  format: ScheduleRow["format"];
  trigger: ScheduleSendPayload["trigger"];
};

async function finishDelivery(d: SendDone) {
  const now = new Date();
  await db
    .update(reportDeliveries)
    .set({ status: d.status, error: d.error, results: d.results, pptxBytes: d.pptxBytes, finishedAt: now })
    .where(eq(reportDeliveries.id, d.deliveryId));
  await db
    .update(reportSchedules)
    .set({ lastStatus: d.status, lastError: d.status === "sent" ? null : d.error, ...(d.status !== "failed" ? { lastSentAt: now } : {}) })
    .where(eq(reportSchedules.id, d.scheduleId));
  const delivered = d.results.filter((x) => x.delivered);
  if (delivered.length) {
    await emitReportSent(d.report.projectId, { id: d.report.id, title: d.report.title, shareUrl: d.shareUrl, recipients: delivered.map((x) => x.email), format: d.format, sentAt: now });
  }
  void logAudit("report.schedule_send", {
    actor: null,
    targetType: "report",
    targetId: d.report.id,
    projectId: d.report.projectId,
    workspaceId: d.report.workspaceId,
    meta: { scheduleId: d.scheduleId, deliveryId: d.deliveryId, trigger: d.trigger, status: d.status, recipients: d.results.length, delivered: delivered.length },
  });
}

/** Builds the data, PPTX and email and sends it to every recipient (no bookkeeping). */
async function sendDelivery({ s, r, payload, delivery, range, period, token, expiresAt, fail }: SendCtx) {
  const wantsLink = s.format !== "pptx";
  const wantsPptx = s.format !== "link";
  if (!s.recipients.length) return await fail("The schedule has no recipients.");
  if (wantsPptx && r.kind !== "deck") return await fail("AI (HTML) reports can only be sent as a link.");
  const bundle = await loadReportData(r.projectId, range);

  let attachment: MailAttachment | null = null;
  let attachmentNote: string | null = null;
  let pptxBytes: number | null = null;
  if (wantsPptx) {
    const deck = reportDeck(r);
    if (!deck) return await fail("This report has no valid slides to export.");
    const buf = await buildReportPptxBuffer({ deck, bundle, title: r.title, subtitle: r.subtitle, workspaceId: r.workspaceId });
    pptxBytes = buf.length;
    if (buf.length > MAX_PPTX_ATTACHMENT_BYTES) {
      if (!wantsLink) {
        return await fail(`The PowerPoint is ${formatBytes(buf.length)} — too large to email (limit ${formatBytes(MAX_PPTX_ATTACHMENT_BYTES)}). Send it as "Link + PowerPoint" or "Link only".`);
      }
      attachmentNote = `The PowerPoint (${formatBytes(buf.length)}) was too large to attach — open the report and use Download → PowerPoint.`;
    } else {
      attachment = { filename: fileName(r.title, period.to), content: buf, contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
    }
  }
  if (token) {
    await db
      .update(reportDeliveries)
      .set({ snapshot: { bundle, capturedAt: new Date().toISOString() } as unknown as Record<string, unknown>, pptxBytes })
      .where(eq(reportDeliveries.id, delivery.id));
  }

  const [kit, general] = await Promise.all([getBrandKit(r.workspaceId, r.projectId), getSetting("general")]);
  const k = kit.effective;
  const logo = (await loadLogo(k.agencyLogo, r.workspaceId, r.projectId)) ?? (await loadLogo(k.clientLogo, r.workspaceId, r.projectId));
  const senderName = k.agencyName || general.appName;
  const ctx = { bundle, report: { title: r.title, subtitle: r.subtitle } };
  const subject = s.subject ? interpolate(s.subject, ctx) : `${r.title} — ${period.label}`;
  const shareUrl = shareUrlOf(token);
  const mail = renderReportEmail({
    appName: general.appName,
    subject,
    reportTitle: r.title,
    clientName: bundle.project.clientName,
    periodLabel: period.label,
    senderName,
    accentColor: k.accentColor || general.primaryColor,
    logoCid: logo?.cid ?? null,
    kpis: buildEmailKpis(bundle),
    message: s.message ? interpolate(s.message, ctx) : null,
    link: shareUrl ? { url: shareUrl, expiresAt: expiresAt?.toISOString() ?? null } : null,
    attachment: attachment ? { filename: attachment.filename, size: formatBytes(attachment.content.length) } : null,
    attachmentNote,
    reason:
      payload.trigger === "manual"
        ? `${senderName} sent you this report from ${general.appName}.`
        : `You receive this report because ${senderName} scheduled it for you (${describeSchedule(s).replace(/^\w/, (c) => c.toLowerCase())}).`,
  });
  const attachments = [...(logo ? [logo] : []), ...(attachment ? [attachment] : [])];

  const results: ReportDeliveryResult[] = [];
  for (const to of s.recipients) {
    const res = await sendMail({ to, subject: mail.subject, html: mail.html, text: mail.text, attachments });
    results.push({ email: to, delivered: res.delivered, transport: res.transport, ...(res.error ? { error: res.error.slice(0, 300) } : {}) });
  }
  const delivered = results.filter((x) => x.delivered);
  const errors = results.filter((x) => x.error);
  const status: DeliveryRow["status"] =
    delivered.length === results.length ? "sent" : !errors.length && results.every((x) => x.transport === "log") ? "logged" : delivered.length ? "partial" : "failed";
  const error =
    status === "logged"
      ? "SMTP is not configured — the email was written to the server log. Configure Admin → Email to deliver it."
      : errors.length
        ? errors
            .slice(0, 3)
            .map((x) => `${x.email}: ${x.error}`)
            .join("; ")
        : null;
  const done: SendDone = {
    deliveryId: delivery.id,
    scheduleId: s.id,
    status,
    error,
    results,
    pptxBytes,
    report: { id: r.id, title: r.title, projectId: r.projectId, workspaceId: r.workspaceId },
    shareUrl,
    format: s.format,
    trigger: payload.trigger,
  };
  return {
    done,
    summary: {
      deliveryId: delivery.id,
      status,
      recipients: results.length,
      delivered: delivered.length,
      period: period.label,
      pptxBytes,
      attachment: attachment ? { filename: attachment.filename, bytes: attachment.content.length } : null,
      shareUrl,
      error,
    },
  };
}

/** Per-report schedule counts + next send (reports list indicator). */
export async function scheduleSummaries(projectId: string): Promise<Record<string, { count: number; active: number; nextRunAt: string | null }>> {
  const rows = await db
    .select({
      reportId: reportSchedules.reportId,
      count: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${reportSchedules.enabled})::int`,
      next: sql<string | null>`to_char(min(${reportSchedules.nextRunAt}) filter (where ${reportSchedules.enabled}) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`,
    })
    .from(reportSchedules)
    .where(eq(reportSchedules.projectId, projectId))
    .groupBy(reportSchedules.reportId);
  return Object.fromEntries(rows.map((r) => [r.reportId, { count: r.count, active: r.active, nextRunAt: r.next }]));
}

import "server-only";
import { z } from "zod";
import {
  createReportScheduleForApi,
  listReportSchedulesForApi,
  scheduleInputSchema,
  sendReportScheduleNowForApi,
  updateReportScheduleForApi,
} from "@/server/api/report-schedules";
import { ApiError } from "@/server/api/errors";
import { defineTool } from "../types";
import { mdTable, projectIdInput, toolProject } from "../helpers";

const shape = scheduleInputSchema.shape;
/** Tool args that aren't schedule fields. */
const CONTROL_KEYS = new Set(["projectId", "reportId", "scheduleId", "sendNow"]);

/** Scheduled email delivery of reports (weekly / monthly, link and/or PowerPoint). */
export const reportScheduleTools = [
  defineTool({
    name: "schedule_report",
    title: "Schedule report delivery",
    description:
      "Creates (or, with scheduleId, updates) an automatic email delivery of a report: weekly or monthly at a local hour in an IANA time zone, to up to 25 recipients, as an expiring read-only link, the PowerPoint attached, or both. Every send refreshes the data for rangePreset (e.g. last_month = previous calendar month). Subject/message may use report tokens like {{client.name}}, {{report.period}}, {{ai.visibility}}. enabled=false pauses; sendNow=true also sends immediately (test). HTML (AI) reports support format link only.",
    input: z.object({
      projectId: projectIdInput,
      reportId: z.string().max(64).describe("Report to deliver (see list_reports)."),
      scheduleId: z.string().max(64).optional().describe("Update this schedule instead of creating one."),
      cadence: shape.cadence.optional(),
      weekday: shape.weekday.optional(),
      monthDay: shape.monthDay.optional(),
      hour: shape.hour.optional(),
      timezone: shape.timezone.optional(),
      recipients: z.array(z.string().max(320)).max(25).optional().describe("Email addresses (required when creating)."),
      format: shape.format.optional(),
      rangePreset: shape.rangePreset.optional(),
      subject: shape.subject,
      message: shape.message,
      linkExpiryDays: shape.linkExpiryDays.optional(),
      enabled: z.boolean().optional().describe("false = pause the schedule."),
      sendNow: z.boolean().optional().describe("Also queue an immediate send to the recipients."),
    }),
    scope: "write",
    permission: "reports.manage",
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const { reportId, scheduleId } = args;
      const patch = Object.fromEntries(Object.entries(args).filter(([k, v]) => !CONTROL_KEYS.has(k) && v !== undefined));
      let schedule;
      if (scheduleId) {
        schedule = await updateReportScheduleForApi(ctx.principal, p, reportId, scheduleId, patch);
      } else {
        if (!args.recipients?.length) throw new ApiError("validation_error", "recipients is required when creating a schedule.");
        schedule = await createReportScheduleForApi(ctx.principal, p, reportId, { ...patch, recipients: args.recipients });
      }
      const send = args.sendNow ? await sendReportScheduleNowForApi(ctx.principal, p, reportId, schedule.id) : null;
      const next = schedule.nextRunAt ? `next send ${schedule.nextRunAt}` : "paused";
      return {
        text: `${scheduleId ? "Updated" : "Created"} schedule ${schedule.id} for "${schedule.reportTitle}": ${schedule.description} → ${schedule.recipients.join(", ")} (${schedule.formatLabel}, ${schedule.rangeLabel}; ${next}).${send ? ` Sending now (job ${send.jobId}) — check list_report_schedules for the result.` : ""}`,
        data: { projectId: p.id, schedule, send, url: `${ctx.baseUrl}/p/${p.id}/reports/${reportId}/edit` },
      };
    },
  }),

  defineTool({
    name: "list_report_schedules",
    title: "List report schedules",
    description: "Scheduled email deliveries of a report with recipients, timing, next / last send and status, plus the most recent sends (status, period, emailed link).",
    input: z.object({ projectId: projectIdInput, reportId: z.string().max(64) }),
    scope: "read",
    permission: "reports.manage",
    annotations: { readOnlyHint: true, openWorldHint: false },
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const r = await listReportSchedulesForApi(ctx.principal, p, args.reportId);
      return {
        text: `${r.schedules.length} schedule(s):\n\n${mdTable(r.schedules, [
          ["id", (x) => x.id],
          ["when", (x) => x.description],
          ["to", (x) => x.recipients.join(", ")],
          ["format", (x) => x.formatLabel],
          ["period", (x) => x.rangeLabel],
          ["enabled", (x) => x.enabled],
          ["next", (x) => x.nextRunAt ?? "—"],
          ["last", (x) => (x.lastSentAt ? `${x.lastSentAt.slice(0, 16)} (${x.lastStatus})` : "—")],
        ])}\n\nRecent sends:\n\n${mdTable(r.deliveries, [
          ["at", (x) => x.createdAt.slice(0, 16)],
          ["status", (x) => x.status],
          ["period", (x) => x.periodLabel ?? "—"],
          ["recipients", (x) => x.recipients.length],
          ["link", (x) => x.shareUrl ?? "—"],
          ["error", (x) => x.error ?? ""],
        ])}`,
        data: { projectId: p.id, ...r },
      };
    },
  }),
];

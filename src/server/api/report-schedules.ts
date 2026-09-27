import "server-only";
import { z } from "zod";
import { logAudit } from "@/server/audit";
import {
  createSchedule,
  deleteSchedule,
  getSchedule,
  listDeliveries,
  listSchedules,
  queueSendNow,
  scheduleFormat,
  scheduleInputSchema,
  schedulePatchPermissions,
  schedulePatchSchema,
  schedulePermissions,
  updateSchedule,
} from "@/server/reports/schedules";
import type { Permission } from "@/server/auth/permissions";
import { requireReport } from "@/server/reports/service";
import { requirePermission, type ApiPrincipal, type ApiProject } from "./auth";
import { checkRateLimit } from "./rate-limit";
import { ApiError } from "./errors";

/**
 * Scheduled report delivery for REST v1 and MCP (`schedule_report`, `list_report_schedules`). Every
 * call needs `reports.manage`; creating / editing / sending also `reports.share` for formats with a
 * public link and `data.export` for formats with the PPTX attached.
 */

export { scheduleInputSchema, schedulePatchSchema };

function assertSchedulePermissions(p: ApiPrincipal, extra: Permission[] = []) {
  requirePermission(p, "reports.manage");
  for (const perm of extra) requirePermission(p, perm);
}

function audit(p: ApiPrincipal, project: ApiProject, action: string, reportId: string, meta: Record<string, unknown>) {
  void logAudit(action, {
    actor: { id: p.user.id, email: p.user.email },
    targetType: "report",
    targetId: reportId,
    projectId: project.id,
    workspaceId: project.workspaceId,
    meta: { via: "api", ...meta },
  });
}

export async function listReportSchedulesForApi(p: ApiPrincipal, project: ApiProject, reportId: string) {
  assertSchedulePermissions(p);
  await requireReport(project.id, reportId);
  const [schedules, deliveries] = await Promise.all([listSchedules(project.id, { reportId }), listDeliveries(project.id, { reportId, limit: 20 })]);
  return { schedules, deliveries };
}

export async function getReportScheduleForApi(p: ApiPrincipal, project: ApiProject, reportId: string, scheduleId: string) {
  assertSchedulePermissions(p);
  const [schedule, deliveries] = await Promise.all([getSchedule(project.id, scheduleId, reportId), listDeliveries(project.id, { scheduleId, limit: 20 })]);
  return { ...schedule, deliveries };
}

export async function createReportScheduleForApi(p: ApiPrincipal, project: ApiProject, reportId: string, raw: z.input<typeof scheduleInputSchema>) {
  assertSchedulePermissions(p, schedulePermissions(raw.format ?? "both"));
  const schedule = await createSchedule(project.id, reportId, raw, p.user.id);
  audit(p, project, "report.schedule_create", reportId, { scheduleId: schedule.id, cadence: schedule.cadence, recipients: schedule.recipients.length });
  return schedule;
}

export async function updateReportScheduleForApi(p: ApiPrincipal, project: ApiProject, reportId: string, scheduleId: string, raw: z.input<typeof schedulePatchSchema>) {
  assertSchedulePermissions(p, schedulePatchPermissions(await scheduleFormat(project.id, scheduleId, reportId), raw));
  const schedule = await updateSchedule(project.id, scheduleId, raw, { reportId });
  audit(p, project, "report.schedule_update", reportId, { scheduleId, enabled: schedule.enabled });
  return schedule;
}

export async function deleteReportScheduleForApi(p: ApiPrincipal, project: ApiProject, reportId: string, scheduleId: string) {
  assertSchedulePermissions(p);
  const res = await deleteSchedule(project.id, scheduleId, { reportId });
  audit(p, project, "report.schedule_delete", reportId, { scheduleId });
  return res;
}

export async function sendReportScheduleNowForApi(p: ApiPrincipal, project: ApiProject, reportId: string, scheduleId: string) {
  assertSchedulePermissions(p, schedulePermissions(await scheduleFormat(project.id, scheduleId, reportId)));
  const rl = checkRateLimit(`reports:send-now:${p.user.id}`, 10, 60 * 60_000);
  if (!rl.allowed) throw new ApiError("rate_limited", "Too many sends — try again in a while.");
  const res = await queueSendNow(project.id, scheduleId, p.user.id, { reportId });
  audit(p, project, "report.schedule_send_now", reportId, { scheduleId });
  return { ...res, status: "queued" as const };
}

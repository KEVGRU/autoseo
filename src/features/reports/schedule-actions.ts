"use server";

import { z } from "zod";
import { actionProject, ActionError, runAction } from "@/server/auth/guards";
import type { ProjectContext } from "@/server/auth/context";
import { logAudit } from "@/server/audit";
import { getJob } from "@/server/jobs/queue";
import { rateLimit } from "@/server/rate-limit";
import {
  createSchedule,
  deleteSchedule,
  listDeliveries,
  listSchedules,
  queueSendNow,
  revokeDelivery,
  scheduleFormat,
  schedulePatchPermissions,
  schedulePermissions,
  SEND_JOB,
  updateSchedule,
  type ScheduleInput,
  type SchedulePatch,
} from "@/server/reports/schedules";
import type { Permission } from "@/server/auth/permissions";

/*
 * Scheduled report delivery (Schedule dialog in the editor + reports list). Every call needs
 * `reports.manage`; creating / editing / sending a schedule additionally needs `reports.share` when it
 * emails a public link and `data.export` when it attaches the exported PPTX (see schedulePermissions).
 */

const idSchema = z.string().min(3).max(64);

const PERMISSION_ERRORS: Partial<Record<Permission, string>> = {
  "reports.share": "You don't have permission to share report links (reports.share) — use “PowerPoint only” or ask an admin.",
  "data.export": "You don't have permission to export reports (data.export) — use “Link only” or ask an admin.",
};

function assertPermissions(ctx: ProjectContext, needed: Permission[]) {
  for (const p of needed) {
    if (!ctx.permissions.has(p)) throw new ActionError(PERMISSION_ERRORS[p] ?? "You don't have permission to do this.", "forbidden");
  }
}

/** Project context with `reports.manage` plus every permission in `extra`. */
async function scheduleCtx(projectId: string, extra: Permission[] = []): Promise<ProjectContext> {
  const ctx = await actionProject(projectId, "reports.manage");
  assertPermissions(ctx, extra);
  return ctx;
}

export async function listReportSchedulesAction(projectId: string, reportId?: string | null) {
  return runAction(async () => {
    await scheduleCtx(projectId);
    const rid = reportId ? idSchema.parse(reportId) : undefined;
    const [schedules, deliveries] = await Promise.all([listSchedules(projectId, { reportId: rid }), listDeliveries(projectId, { reportId: rid, limit: 20 })]);
    return { schedules, deliveries };
  });
}

export async function createReportScheduleAction(projectId: string, reportId: string, input: ScheduleInput) {
  return runAction(async () => {
    const ctx = await scheduleCtx(projectId, schedulePermissions(input.format ?? "both"));
    const schedule = await createSchedule(projectId, idSchema.parse(reportId), input, ctx.user.id);
    await logAudit("report.schedule_create", {
      actor: ctx.user,
      targetType: "report",
      targetId: schedule.reportId,
      projectId,
      workspaceId: ctx.project.workspaceId,
      meta: { scheduleId: schedule.id, cadence: schedule.cadence, recipients: schedule.recipients.length, format: schedule.format },
    });
    return schedule;
  });
}

export async function updateReportScheduleAction(projectId: string, scheduleId: string, patch: SchedulePatch) {
  return runAction(async () => {
    const ctx = await scheduleCtx(projectId);
    const sid = idSchema.parse(scheduleId);
    assertPermissions(ctx, schedulePatchPermissions(await scheduleFormat(projectId, sid), patch));
    const schedule = await updateSchedule(projectId, sid, patch);
    await logAudit("report.schedule_update", {
      actor: ctx.user,
      targetType: "report",
      targetId: schedule.reportId,
      projectId,
      workspaceId: ctx.project.workspaceId,
      meta: { scheduleId: schedule.id, enabled: schedule.enabled },
    });
    return schedule;
  });
}

export async function deleteReportScheduleAction(projectId: string, scheduleId: string) {
  return runAction(async () => {
    const ctx = await scheduleCtx(projectId);
    const res = await deleteSchedule(projectId, idSchema.parse(scheduleId));
    await logAudit("report.schedule_delete", { actor: ctx.user, targetType: "report_schedule", targetId: res.scheduleId, projectId, workspaceId: ctx.project.workspaceId });
    return res;
  });
}

export async function sendReportScheduleNowAction(projectId: string, scheduleId: string) {
  return runAction(async () => {
    const ctx = await scheduleCtx(projectId);
    const sid = idSchema.parse(scheduleId);
    assertPermissions(ctx, schedulePermissions(await scheduleFormat(projectId, sid)));
    if (!rateLimit(`reports:send-now:${ctx.user.id}`, 10, 60 * 60_000)) throw new ActionError("Too many sends — try again in a while.", "conflict");
    return queueSendNow(projectId, sid, ctx.user.id);
  });
}

export async function pollReportSendAction(projectId: string, jobId: string) {
  return runAction(async () => {
    const ctx = await scheduleCtx(projectId);
    const job = await getJob(idSchema.parse(jobId));
    if (!job || job.projectId !== projectId || job.type !== SEND_JOB || job.createdBy !== ctx.user.id) throw new ActionError("Job not found.", "not_found");
    return {
      status: job.status,
      result: job.status === "succeeded" ? (job.result as Record<string, unknown> | null) : null,
      error: job.status === "failed" ? (job.lastError ?? "Sending failed.") : null,
    };
  });
}

/** Expires the emailed link of one delivery (e.g. sent to a wrong address). */
export async function revokeReportDeliveryAction(projectId: string, deliveryId: string) {
  return runAction(async () => {
    // Managing a public link, like revokeShareAction.
    const ctx = await scheduleCtx(projectId, ["reports.share"]);
    const delivery = await revokeDelivery(projectId, idSchema.parse(deliveryId));
    await logAudit("report.delivery_revoke", { actor: ctx.user, targetType: "report", targetId: delivery.reportId, projectId, workspaceId: ctx.project.workspaceId, meta: { deliveryId } });
    return delivery;
  });
}

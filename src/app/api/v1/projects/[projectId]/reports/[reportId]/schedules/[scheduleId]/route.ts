import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { deleteReportScheduleForApi, getReportScheduleForApi, schedulePatchSchema, updateReportScheduleForApi } from "@/server/api/report-schedules";
import { corsPreflight } from "@/server/api/urls";

type Params = { projectId: string; reportId: string; scheduleId: string };

/** GET /api/v1/projects/{projectId}/reports/{reportId}/schedules/{scheduleId} — one schedule + its recent sends. */
export const GET = apiRoute<Params>({ scope: "read", permission: "reports.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await getReportScheduleForApi(principal, project, params.reportId, params.scheduleId) };
});

/** PATCH /api/v1/projects/{projectId}/reports/{reportId}/schedules/{scheduleId} — partial update (timing, recipients, format, pause…). */
export const PATCH = apiRoute<Params>({ scope: "write", permission: "reports.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const body = await parseBody(req, schedulePatchSchema);
  return { data: await updateReportScheduleForApi(principal, project, params.reportId, params.scheduleId, body) };
});

/** DELETE /api/v1/projects/{projectId}/reports/{reportId}/schedules/{scheduleId} — emailed links keep working until they expire. */
export const DELETE = apiRoute<Params>({ scope: "write", permission: "reports.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await deleteReportScheduleForApi(principal, project, params.reportId, params.scheduleId) };
});

export const OPTIONS = corsPreflight;

/** PUT — alias of PATCH (partial update), like the other v1 update endpoints. */
export const PUT = PATCH;

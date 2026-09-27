import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { createReportScheduleForApi, listReportSchedulesForApi, scheduleInputSchema } from "@/server/api/report-schedules";
import { corsPreflight } from "@/server/api/urls";

type Params = { projectId: string; reportId: string };

/** GET /api/v1/projects/{projectId}/reports/{reportId}/schedules — delivery schedules + recent sends of a report. */
export const GET = apiRoute<Params>({ scope: "read", permission: "reports.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  const { schedules, deliveries } = await listReportSchedulesForApi(principal, project, params.reportId);
  return { data: schedules, meta: { deliveries } };
});

/** POST /api/v1/projects/{projectId}/reports/{reportId}/schedules — schedule automatic email delivery. */
export const POST = apiRoute<Params>({ scope: "write", permission: "reports.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const body = await parseBody(req, scheduleInputSchema);
  return { data: await createReportScheduleForApi(principal, project, params.reportId, body), status: 201 };
});

export const OPTIONS = corsPreflight;

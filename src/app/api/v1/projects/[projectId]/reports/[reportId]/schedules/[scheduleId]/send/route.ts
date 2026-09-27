import { getApiProject } from "@/server/api/auth";
import { apiRoute } from "@/server/api/handler";
import { sendReportScheduleNowForApi } from "@/server/api/report-schedules";
import { corsPreflight } from "@/server/api/urls";

type Params = { projectId: string; reportId: string; scheduleId: string };

/** POST /api/v1/projects/{projectId}/reports/{reportId}/schedules/{scheduleId}/send — send now (job, 202). */
export const POST = apiRoute<Params>({ scope: "write", permission: "reports.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await sendReportScheduleNowForApi(principal, project, params.reportId, params.scheduleId), status: 202 };
});

export const OPTIONS = corsPreflight;

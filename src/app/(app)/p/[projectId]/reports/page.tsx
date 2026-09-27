import type { Metadata } from "next";
import { requireProject } from "@/server/auth/guards";
import { listReports, themeForProject } from "@/server/reports/service";
import { ReportsPage } from "@/features/reports/components/reports-page";
import { canManageWorkspaceReports } from "@/server/reports/access";
import { scheduleSummaries } from "@/server/reports/schedules";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsRoute({ params }: PageProps<"/p/[projectId]/reports">) {
  const { projectId } = await params;
  const ctx = await requireProject(projectId);
  const [reports, theme, schedules] = await Promise.all([listReports(projectId), themeForProject(ctx.project.workspaceId, projectId), scheduleSummaries(projectId).catch(() => ({}))]);
  const canManage = ctx.permissions.has("reports.manage");
  return <ReportsPage projectId={projectId} reports={reports} theme={theme} canManage={canManage} canManageWorkspace={canManageWorkspaceReports(ctx)} schedules={schedules} />;
}

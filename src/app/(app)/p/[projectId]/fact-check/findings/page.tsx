import { PageContainer, PageHeader } from "@/components/app/page";
import { requireProject } from "@/server/auth/guards";
import { getFindings, parseFindingsFilters } from "@/features/optimize/fact-check/queries";
import { FactCheckTabs } from "@/features/optimize/fact-check/components/fc-tabs";
import { FindingsView } from "@/features/optimize/fact-check/components/findings-view";
import { listConnectedIntegrations } from "@/server/optimize/integrations";

export const metadata = { title: "Fact Check · Findings" };

export default async function FindingsPage({ params, searchParams }: PageProps<"/p/[projectId]/fact-check/findings">) {
  const { projectId } = await params;
  const ctx = await requireProject(projectId);
  const filters = parseFindingsFilters(await searchParams);
  const [data, connected] = await Promise.all([getFindings(projectId, filters), listConnectedIntegrations(projectId, "pm")]);
  return (
    <PageContainer>
      <PageHeader
        title="Findings"
        description="Statements in AI answers that deviate from your reference documents or break a rule — triage, resolve, ignore or turn them into tasks."
      />
      <FactCheckTabs projectId={projectId} active="findings" />
      <FindingsView projectId={projectId} data={data} canEdit={ctx.permissions.has("prompts.manage")} connected={connected} />
    </PageContainer>
  );
}

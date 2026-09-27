import { PageContainer, PageHeader } from "@/components/app/page";
import { requireProject } from "@/server/auth/guards";
import { getRules } from "@/features/optimize/fact-check/queries";
import { FactCheckTabs } from "@/features/optimize/fact-check/components/fc-tabs";
import { RulesView } from "@/features/optimize/fact-check/components/rules-view";

export const metadata = { title: "Fact Check · Rules" };

export default async function FactCheckRulesPage({ params }: PageProps<"/p/[projectId]/fact-check/rules">) {
  const { projectId } = await params;
  const ctx = await requireProject(projectId);
  const data = await getRules(projectId);
  return (
    <PageContainer>
      <PageHeader
        title="Rules"
        description="Allowed ranges, forbidden and required wording — checked on every statement AI makes about your assets."
      />
      <FactCheckTabs projectId={projectId} active="rules" />
      <RulesView projectId={projectId} data={data} canEdit={ctx.permissions.has("prompts.manage")} />
    </PageContainer>
  );
}

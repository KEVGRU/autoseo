import { PageContainer, PageHeader } from "@/components/app/page";
import { requireProject } from "@/server/auth/guards";
import { getFilterOptions } from "@/server/ai/insights/brands";
import { getCompetitorsData } from "@/server/ai/insights/competitors";
import { filterQuery, parseInsightFilter } from "@/server/ai/insights/filters";
import { InsightFilters } from "@/features/ai-insights/components/insight-filters";
import { CompetitorsView } from "@/features/ai-insights/components/competitors/competitors-view";
import { getCompetitorGaps } from "@/server/ai/insights/competitor-gaps";
import { GapDomainsPanel } from "@/features/ai-insights/components/gaps/gap-domains";

export const metadata = { title: "Competitors" };

export default async function CompetitorsPage({ params, searchParams }: PageProps<"/p/[projectId]/ai/competitors">) {
  const { projectId } = await params;
  const ctx = await requireProject(projectId);
  const f = parseInsightFilter(projectId, await searchParams);
  const [data, options, gaps] = await Promise.all([getCompetitorsData(ctx.project, f), getFilterOptions(ctx.project, f), getCompetitorGaps(ctx.project, f)]);
  const canManage = ctx.permissions.has("prompts.manage");
  return (
    <PageContainer>
      <PageHeader
        title="Competitors"
        description="How often AI engines name, rank and cite you compared with the brands you compete with."
      />
      <InsightFilters options={options} brandScope />
      <CompetitorsView projectId={projectId} data={data} canManage={canManage} query={filterQuery(f)} />
      <GapDomainsPanel data={gaps} />
    </PageContainer>
  );
}

import { PageContainer, PageHeader } from "@/components/app/page";
import { listRankConfigSummaries } from "@/server/seo";
import { clientPageInfo, loadSeoPage } from "@/features/seo/server/page-context";
import { EnrichmentBanner } from "@/features/seo/components/shared/empty-states";
import { RankDomainList } from "@/features/seo/components/rank/rank-domain-list";

export const metadata = { title: "Rank Tracking" };

export default async function RankTrackingPage({ params }: PageProps<"/p/[projectId]/seo/rank-tracking">) {
  const { projectId } = await params;
  const info = await loadSeoPage(projectId);
  const configs = await listRankConfigSummaries(info.ctx);
  return (
    <PageContainer>
      <PageHeader eyebrow="SEO" title="Rank Tracking" description="Track keyword positions across domains" />
      <EnrichmentBanner source={info.sources.serp} isAdmin={info.isAdmin} feature="rank tracking" detail="Positions are observed via AI web search (top 20 only) and labelled as AI-observed." />
      <RankDomainList info={clientPageInfo(info)} configs={configs} />
    </PageContainer>
  );
}

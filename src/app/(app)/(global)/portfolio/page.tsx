import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/app/page";
import { requireUser } from "@/server/auth/guards";
import { getProjectContext } from "@/server/auth/context";
import { getPortfolioOverview, getUserPortfolioProjects } from "@/server/ai/insights/portfolio";
import { resolveRange } from "@/features/ai-tracking/period";
import { PortfolioView } from "@/features/portfolio/components/portfolio-view";

export const metadata: Metadata = { title: "Portfolio" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PortfolioPage({ searchParams }: PageProps<"/portfolio">) {
  const ctx = await requireUser();
  const sp = await searchParams;
  const period = resolveRange(one(sp.period) ?? "30d", one(sp.from), one(sp.to));
  const projects = await getUserPortfolioProjects();
  const data = await getPortfolioOverview({ projects, period });
  const canCreate = ctx.isInstanceAdmin || ctx.memberships.some((m) => m.permissions.has("projects.manage"));
  // The CSV only contains projects the user may export from (effective project permissions).
  const exportable = await Promise.all(projects.map(async (p) => Boolean((await getProjectContext(p.id))?.permissions.has("data.export"))));
  const canExport = exportable.some(Boolean);
  return (
    <PageContainer wide>
      <PageHeader
        title="Portfolio"
        description="AI visibility, share of voice, open high-impact tasks and AI revenue across every project you can access."
      />
      <PortfolioView data={data} canCreate={canCreate} canExport={canExport} />
    </PageContainer>
  );
}

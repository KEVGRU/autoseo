import type { Metadata } from "next";
import { PageContainer } from "@/components/app/page";
import { requireProject } from "@/server/auth/guards";
import { getFilterOptions } from "@/server/ai/insights/brands";
import { getFanoutRows, getFanoutStats, getFollowupRows, type FanoutFilter } from "@/server/ai/insights/fanouts";
import { parseInsightFilter } from "@/server/ai/insights/filters";
import { listParam, one, type SearchParams } from "@/features/ai-tracking/queries";
import { FanoutsView } from "@/features/ai-tracking/components/fanouts-view";
import { FANOUT_INTENTS } from "@/features/ai-insights/lib/fanout-intents";

export const metadata: Metadata = { title: "Query Fanouts" };

export default async function FanoutsPage({ params, searchParams }: PageProps<"/p/[projectId]/ai/tracker/fanouts">) {
  const { projectId } = await params;
  const sp = (await searchParams) as SearchParams;
  const ctx = await requireProject(projectId, "project.view");
  // Same insight scope as the other AI views (markets, prompt slices, simulated answers… from the URL).
  const period = parseInsightFilter(projectId, sp, { defaultPeriod: "90d" });
  const tab = one(sp, "tab") === "followups" ? "followups" : "queries";
  const filter: FanoutFilter = {
    projectId,
    from: period.from,
    to: period.to,
    scope: period,
    q: one(sp, "q").slice(0, 200),
    intents: listParam(sp, "searchIntent").filter((i) => i === "unclassified" || (FANOUT_INTENTS as readonly string[]).includes(i)),
  };
  const [rows, followups, stats, options] = await Promise.all([
    tab === "queries" ? getFanoutRows(filter) : Promise.resolve([]),
    tab === "followups" ? getFollowupRows(filter) : Promise.resolve([]),
    getFanoutStats({ ...filter, q: undefined, intents: undefined }),
    getFilterOptions(ctx.project, period),
  ]);
  const exportParams = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" && v ? [[k, v]] : [])));
  exportParams.delete("group");
  const base = `/p/${projectId}/ai/tracker`;
  return (
    <PageContainer>
      <FanoutsView
        projectId={projectId}
        tab={tab}
        rows={rows}
        followups={followups}
        stats={stats}
        engineOptions={options.engines}
        canManage={ctx.permissions.has("prompts.manage")}
        period={period.preset}
        from={period.preset === "custom" ? period.from : undefined}
        to={period.preset === "custom" ? period.to : undefined}
        backHref={base}
        trackerHref={base}
        knowledgeHref={`/p/${projectId}/knowledge`}
        exportHref={`${base}/fanouts/export${exportParams.size ? `?${exportParams}` : ""}`}
      />
    </PageContainer>
  );
}

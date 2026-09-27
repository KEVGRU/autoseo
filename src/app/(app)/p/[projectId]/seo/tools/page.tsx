import Link from "next/link";
import { Globe, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/app/page";
import { requireProject } from "@/server/auth/guards";
import { getEnrichmentStatus } from "@/server/enrichment";
import { getToolSources } from "@/server/free-tools/ai-fallback";
import { getSetting } from "@/server/settings";
import { FREE_TOOL_LIST } from "@/features/free-tools/lib/registry";
import { ToolCard } from "@/features/free-tools/components/tool-card";
import { AiCheckHubCard } from "@/features/visibility-check/components/hub-card";

export const metadata = { title: "SEO Tools" };

export default async function SeoToolsHubPage({ params }: PageProps<"/p/[projectId]/seo/tools">) {
  const { projectId } = await params;
  const pctx = await requireProject(projectId);
  const [enrichment, freeTools, sources] = await Promise.all([
    getEnrichmentStatus({ workspaceId: pctx.project.workspaceId }),
    getSetting("freeTools"),
    getToolSources(pctx.project.workspaceId),
  ]);
  const configured = enrichment.dfsConfigured;
  const aiTools = FREE_TOOL_LIST.filter((t) => sources[t.slug]?.source === "ai");
  const unavailable = FREE_TOOL_LIST.filter((t) => t.source === "dataforseo" && sources[t.slug] && sources[t.slug]!.source === null);
  const isAdmin = pctx.isInstanceAdmin;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="SEO"
        title="SEO Tools"
        description="Quick one-off checks: backlinks, spam score, traffic, competitors, keyword ideas, domain age and a SERP snippet preview. Paid lookups use your DataForSEO account (cached for 24 hours) — or AI estimates when it isn't connected."
        actions={
          isAdmin ? (
            freeTools.publicEnabled ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/free-tools" target="_blank">
                  <Globe />
                  Public page
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/free-tools">
                  <Globe />
                  Publish as free tools
                </Link>
              </Button>
            )
          ) : undefined
        }
      />
      {(!configured || aiTools.length > 0) && (
        <div className="flex flex-col gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2">
            <PlugZap className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>
              <span className="font-medium">{configured ? "AI estimates are active." : "DataForSEO isn't connected."}</span>{" "}
              <span className="text-muted-foreground">
                {aiTools.length > 0
                  ? `${aiTools.map((t) => t.name).join(", ")} answer with AI estimates (LLM + web search, labelled on every result).`
                  : "The Domain Age Checker and SERP Simulator work without it."}
                {unavailable.length > 0 ? ` ${unavailable.map((t) => t.name).join(", ")} need${unavailable.length === 1 ? "s" : ""} DataForSEO.` : ""}
              </span>
            </span>
          </span>
          {isAdmin ? (
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href="/admin/data">Connect DataForSEO</Link>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Ask an admin: Admin → Data Providers</span>
          )}
        </div>
      )}
      <AiCheckHubCard href={`/p/${projectId}/seo/tools/ai-visibility-check`} surface="app" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {FREE_TOOL_LIST.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} href={`/p/${projectId}/seo/tools/${tool.slug}`} surface="app" source={sources[tool.slug]?.source} />
        ))}
      </div>
    </PageContainer>
  );
}

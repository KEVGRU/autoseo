import type { Metadata } from "next";
import { requireProject } from "@/server/auth/guards";
import { availableLlmProviders } from "@/server/ai/llm";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { catalogProducts } from "@/server/db/schema";
import { contentDashboard, contentPerformance, listContent, listPersonas, personaJobsRunning } from "@/server/optimize/content/service";
import { listKnowledgeSources } from "@/server/ai/knowledge/sources/service";
import { SchemaGenerator } from "@/features/optimize/content/components/schema-generator";
import { listConnectedIntegrations } from "@/server/optimize/integrations";
import { ContentView } from "@/features/optimize/content/components/content-view";
import { SiteEditsPanel } from "@/features/optimize/cms-edits/components/site-edits-panel";
import { countOpenCmsChanges } from "@/server/optimize/cms-edits/service";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage({ params, searchParams }: PageProps<"/p/[projectId]/content">) {
  const { projectId } = await params;
  const sp = await searchParams;
  const ctx = await requireProject(projectId);
  const [items, dashboard, personas, personaJobs, connected, llm] = await Promise.all([
    listContent(projectId),
    contentDashboard(projectId),
    listPersonas(projectId),
    personaJobsRunning(projectId),
    listConnectedIntegrations(projectId, "cms"),
    availableLlmProviders().catch(() => []),
  ]);
  const openSiteEdits = await countOpenCmsChanges(projectId);
  const tab = typeof sp.tab === "string" ? sp.tab : "content";
  const [sources, performance, products] = await Promise.all([
    listKnowledgeSources(projectId),
    tab === "content" ? contentPerformance(projectId) : null,
    tab === "schema"
      ? db.select({ id: catalogProducts.id, name: catalogProducts.name }).from(catalogProducts).where(eq(catalogProducts.projectId, projectId)).orderBy(asc(catalogProducts.name)).limit(500)
      : [],
  ]);
  const can = (p: "prompts.manage" | "settings.manage") => ctx.isInstanceAdmin || ctx.permissions.has(p);
  return (
    <ContentView
      projectId={projectId}
      domain={ctx.project.domain}
      language={ctx.project.language}
      items={items}
      dashboard={dashboard}
      personas={personas}
      personaJobs={personaJobs}
      connected={connected}
      canEdit={can("prompts.manage")}
      canManage={can("settings.manage")}
      aiAvailable={llm.length > 0}
      knowledgeSources={sources.map((s) => ({ id: s.id, name: s.name, kind: s.kind, docCount: s.docCount, status: s.status }))}
      performance={performance}
      schemaTool={tab === "schema" ? <SchemaGenerator key="schema" projectId={projectId} domain={ctx.project.domain} products={products} canEdit={can("prompts.manage")} /> : null}
      siteEdits={{
        open: openSiteEdits,
        panel:
          sp.tab === "site-edits" ? (
            <SiteEditsPanel projectId={projectId} searchParams={sp} canEdit={can("prompts.manage")} aiAvailable={llm.length > 0} />
          ) : null,
      }}
    />
  );
}

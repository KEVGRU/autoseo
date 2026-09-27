import { PageContainer } from "@/components/app/page";
import { requireProject } from "@/server/auth/guards";
import { loadKnowledge } from "@/features/ai-research/queries";
import { KnowledgeView } from "@/features/ai-research/components/knowledge/knowledge-view";
import type { KnowledgeTab } from "@/features/ai-research/components/knowledge/knowledge-view";
import { listKnowledgeSources } from "@/server/ai/knowledge/sources/service";
import { listDriveAccounts } from "@/server/ai/knowledge/sources/gdrive";
import { getGoogleOAuthStatus } from "@/server/integrations/google/oauth";

export const metadata = { title: "Brand Knowledge" };

const TABS: KnowledgeTab[] = ["interest", "sitemap", "personas", "products", "profile", "sources"];

export default async function KnowledgePage({ params, searchParams }: PageProps<"/p/[projectId]/knowledge">) {
  const { projectId } = await params;
  const ctx = await requireProject(projectId);
  const sp = await searchParams;
  const tab = TABS.includes(sp.tab as KnowledgeTab) ? (sp.tab as KnowledgeTab) : "interest";
  const [data, sources] = await Promise.all([
    loadKnowledge(projectId, ctx.project.workspaceId),
    tab === "sources"
      ? Promise.all([listKnowledgeSources(projectId), listDriveAccounts(ctx.project.workspaceId), getGoogleOAuthStatus()]).then(([list, driveAccounts, google]) => ({
          list,
          driveAccounts,
          googleConfigured: google.configured,
        }))
      : undefined,
  ]);
  return (
    <PageContainer wide>
      <KnowledgeView
        projectId={projectId}
        tab={tab}
        domain={ctx.project.domain}
        all={data.all}
        profile={data.profile}
        stream={data.stream}
        products={data.products}
        notes={data.notes}
        providers={{ dataforseo: data.providers.dataforseo, llm: data.providers.llm, volumes: data.providers.volumes, interest: data.providers.interest, mentions: data.providers.mentions }}
        pushEndpoint={data.pushEndpoint}
        canManage={ctx.permissions.has("prompts.manage")}
        canEditProfile={ctx.permissions.has("projects.manage")}
        canManageSettings={ctx.permissions.has("settings.manage")}
        sources={sources}
      />
    </PageContainer>
  );
}

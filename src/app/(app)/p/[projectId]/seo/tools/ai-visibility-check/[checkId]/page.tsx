import { notFound } from "next/navigation";
import { PageContainer } from "@/components/app/page";
import { getProjectContext } from "@/server/auth/context";
import { requireProject } from "@/server/auth/guards";
import { env } from "@/server/env";
import { getProjectCheck, toCheckView } from "@/server/free-tools/visibility-check";
import { CheckReport } from "@/features/visibility-check/components/check-report";
import type { TrackCta } from "@/features/visibility-check/components/track-cta";

export async function generateMetadata({ params }: PageProps<"/p/[projectId]/seo/tools/ai-visibility-check/[checkId]">) {
  const { projectId, checkId } = await params;
  const row = await getProjectCheck(projectId, checkId);
  return {
    title: row ? `AI visibility check · ${row.domain}` : "AI visibility check",
  };
}

/** In-app report of a check started from this project. */
export default async function AppAiVisibilityCheckResultPage({ params }: PageProps<"/p/[projectId]/seo/tools/ai-visibility-check/[checkId]">) {
  const { projectId, checkId } = await params;
  const pctx = await requireProject(projectId);
  const row = await getProjectCheck(projectId, checkId);
  if (!row) notFound();

  let cta: TrackCta;
  if (row.domain === pctx.project.domain) {
    cta = {
      kind: "open",
      href: `/p/${projectId}`,
      label: "Open this project's AI visibility",
    };
  } else {
    const workspaces = pctx.memberships
      .filter((m) => pctx.isInstanceAdmin || m.permissions.has("projects.manage"))
      .map((m) => ({ id: m.workspace.id, name: m.workspace.name }))
      // The project's own workspace first.
      .sort((a, b) => Number(b.id === pctx.project.workspaceId) - Number(a.id === pctx.project.workspaceId));
    const converted = row.convertedProjectId && (await getProjectContext(row.convertedProjectId)) ? `/p/${row.convertedProjectId}` : null;
    cta = workspaces.length
      ? { kind: "create", workspaces, convertedHref: converted }
      : {
          kind: "none",
          reason: "Ask a workspace admin to create a project for this site — you don't have permission to create projects.",
        };
  }

  return (
    <PageContainer className="max-w-5xl">
      <CheckReport
        initial={toCheckView(row)}
        shareUrl={`${env.appUrl}/p/${projectId}/seo/tools/ai-visibility-check/${row.id}`}
        cta={cta}
        bookingUrl={null}
        newCheckHref={`/p/${projectId}/seo/tools/ai-visibility-check`}
      />
    </PageContainer>
  );
}

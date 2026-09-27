import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { getProjectContext, getUserContext } from "@/server/auth/context";
import { getSetting } from "@/server/settings";
import { env } from "@/server/env";
import { getPublicFreeToolsConfig } from "@/server/free-tools/public-config";
import { getCheckRow, publicCheckPath, safeLinkUrl, toCheckView } from "@/server/free-tools/visibility-check";
import { CheckReport } from "@/features/visibility-check/components/check-report";
import type { TrackCta } from "@/features/visibility-check/components/track-cta";

export async function generateMetadata({ params }: PageProps<"/free-tools/ai-visibility-check/[checkId]">): Promise<Metadata> {
  const { checkId } = await params;
  const row = await getCheckRow(checkId);
  return {
    title: row ? `AI visibility check: ${row.domain}` : "AI visibility check",
    // Personal reports behind capability links are never indexed.
    robots: { index: false, follow: false },
  };
}

/** Public report of a Free AI Visibility Check (capability URL, live while the check runs). */
export default async function AiVisibilityCheckResultPage({ params }: PageProps<"/free-tools/ai-visibility-check/[checkId]">) {
  await connection();
  const { checkId } = await params;
  const [config, settings, row, user] = await Promise.all([getPublicFreeToolsConfig(), getSetting("freeTools"), getCheckRow(checkId), getUserContext()]);
  if (!config.enabled || !row) notFound();
  if (row.surface === "app") {
    // In-app checks live inside their project.
    if (row.projectId && user && (await getProjectContext(row.projectId))) redirect(`/p/${row.projectId}/seo/tools/ai-visibility-check/${row.id}`);
    notFound();
  }

  let cta: TrackCta;
  if (user) {
    const workspaces = user.memberships
      .filter((m) => user.isInstanceAdmin || m.permissions.has("projects.manage"))
      .map((m) => ({ id: m.workspace.id, name: m.workspace.name }));
    const converted = row.convertedProjectId && (await getProjectContext(row.convertedProjectId)) ? `/p/${row.convertedProjectId}` : null;
    cta = workspaces.length
      ? { kind: "create", workspaces, convertedHref: converted }
      : {
          kind: "none",
          reason: "Ask a workspace admin to create a project for this site — you don't have permission to create projects.",
        };
  } else {
    const next = publicCheckPath(row.id);
    cta =
      config.cta.href === "/login"
        ? {
            kind: "login",
            href: `/login?next=${encodeURIComponent(next)}`,
            label: "Sign in to track daily",
          }
        : { kind: "login", href: config.cta.href, label: config.cta.label };
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <CheckReport
        initial={toCheckView(row)}
        shareUrl={`${env.appUrl}${publicCheckPath(row.id)}`}
        cta={cta}
        bookingUrl={safeLinkUrl(settings.aiCheckBookingUrl)}
        newCheckHref={settings.aiCheckEnabled ? "/free-tools/ai-visibility-check" : "/free-tools"}
      />
    </div>
  );
}

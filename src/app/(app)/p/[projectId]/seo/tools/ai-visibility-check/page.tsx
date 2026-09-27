import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { PageContainer, PageHeader, Panel } from "@/components/app/page";
import { CountryFlag, StatusBadge, TimeAgo } from "@/components/app/misc";
import { Favicon } from "@/components/app/favicon";
import { requireProject } from "@/server/auth/guards";
import { listProjectChecks } from "@/server/free-tools/visibility-check";
import { AI_VISIBILITY_CHECK } from "@/features/free-tools/lib/registry";
import { CheckForm } from "@/features/visibility-check/components/check-form";
import { cn } from "@/lib/utils";

export const metadata = { title: AI_VISIBILITY_CHECK.name };

function ScoreChip({ label, value }: { label: string; value: number | null }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
      {label}
      <span
        className={cn(
          "font-semibold tabular",
          value === null ? "" : value >= 75 ? "text-brand" : value >= 50 ? "text-info" : value >= 25 ? "text-warning" : "text-destructive",
        )}
      >
        {value ?? "—"}
      </span>
    </span>
  );
}

/** In-app AI Visibility Check (always available to signed-in project members). */
export default async function AppAiVisibilityCheckPage({ params }: PageProps<"/p/[projectId]/seo/tools/ai-visibility-check">) {
  const { projectId } = await params;
  const pctx = await requireProject(projectId);
  const checks = await listProjectChecks(projectId, 10);
  const base = `/p/${projectId}/seo/tools/ai-visibility-check`;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        eyebrow={<Link href={`/p/${projectId}/seo/tools`}>SEO Tools</Link>}
        title={AI_VISIBILITY_CHECK.name}
        description="A quick snapshot for any website: can AI crawlers read it, do AI engines name the brand for real buyer questions, which competitors and sources win — plus the three highest-impact actions. Use it for prospects and competitors; track your own brand daily in AI visibility."
      />
      <CheckForm
        surface="app"
        projectId={projectId}
        defaultDomain={pctx.project.domain}
        defaultCountry={pctx.project.country}
        canRun={pctx.permissions.has("prompts.manage")}
      />
      <Panel title="Recent checks" icon={<History className="size-4" />} description="Reports stay available for 30 days.">
        {checks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No checks yet. Run one above — it takes about 2–4 minutes.</p>
        ) : (
          <ul className="divide-y">
            {checks.map((c) => (
              <li key={c.id}>
                <Link href={`${base}/${c.id}`} className="flex items-center gap-3 py-2.5 hover:bg-muted/40 sm:px-2">
                  <Favicon domain={c.domain} className="size-5 rounded" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {c.domain} <CountryFlag iso={c.country} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <TimeAgo date={c.createdAt} />
                    </p>
                  </div>
                  <div className="hidden items-center gap-1.5 sm:flex">
                    {c.status === "completed" ? (
                      <>
                        <ScoreChip label="Readiness" value={c.readinessScore} />
                        <ScoreChip label="Visibility" value={c.visibilityScore} />
                      </>
                    ) : (
                      <StatusBadge status={c.status} />
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </PageContainer>
  );
}

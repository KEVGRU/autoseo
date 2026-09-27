"use client";

import { Target } from "lucide-react";
import { Panel } from "@/components/app/page";
import { DataTable, type Column } from "@/components/app/data-table";
import { Favicon } from "@/components/app/favicon";
import { EmptyState } from "@/components/app/empty-state";
import { CountryFlag, TagChip } from "@/components/app/misc";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CompetitorGaps, GapCell, GapDomain } from "@/server/ai/insights/competitor-gaps";
import { useClientParam } from "../../lib/client-url";

type PromptCell = CompetitorGaps["byPrompt"][number];

function DomainList({ list }: { list: GapDomain[] }) {
  if (!list.length) return <span className="text-xs text-muted-foreground">No citations</span>;
  return (
    <span className="flex min-w-36 flex-col gap-0.5">
      {list.map((d, i) => (
        <span key={d.domain} className="flex items-center gap-1.5 text-xs">
          <Favicon domain={d.domain} fallback={d.domain} className="size-3.5" />
          <span className={i === 0 ? "max-w-40 truncate font-medium" : "max-w-40 truncate text-muted-foreground"}>{d.domain}</span>
          <span className="text-muted-foreground tabular">{d.answers}</span>
          {d.ownership === "competitor" && <span className="text-[10px] text-muted-foreground">competitor site</span>}
        </span>
      ))}
    </span>
  );
}

function Winner({ c }: { c: GapCell }) {
  if (!c.winner) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex min-w-28 items-center gap-1.5 text-sm">
          <Favicon domain={c.winner.domain} fallback={c.winner.name} className="size-4 rounded" />
          <span className="truncate font-medium">{c.winner.name}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Named in {c.gapAnswers} answer{c.gapAnswers === 1 ? "" : "s"} that don’t mention you
        {c.winnerRate != null && ` · visible in ${c.winnerRate.toFixed(0)}% of all answers`}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Competitor gap view: per prompt tag / gap prompt, the competitor winning answers without you
 * and the domains those answers cite (where to get listed).
 */
export function GapDomainsPanel({ data, competitorName }: { data: CompetitorGaps; competitorName?: string }) {
  const [view, setView] = useClientParam("gapBy", data.byTag.length ? "tag" : "prompt");
  const byTag = view === "tag";

  const tagColumns: Column<GapCell>[] = [
    { id: "tag", header: "Tag", sticky: true, sortValue: (c) => c.label.toLowerCase(), cell: (c) => <TagChip name={c.label} /> },
    { id: "own", header: "You", align: "right", sortValue: (c) => c.ownRate, cell: (c) => <span className="tabular">{c.ownRate == null ? "—" : `${c.ownRate.toFixed(0)}%`}</span> },
    { id: "winner", header: competitorName ? competitorName : "Winning competitor", cell: (c) => <Winner c={c} />, sortValue: (c) => c.gapAnswers },
    { id: "gap", header: "Gap answers", align: "right", sortValue: (c) => c.gapAnswers, cell: (c) => <span className="tabular">{c.gapAnswers}</span>, hideBelow: "sm" },
    { id: "domains", header: "Top cited domains", cell: (c) => <DomainList list={c.domains} /> },
  ];
  const promptColumns: Column<PromptCell>[] = [
    {
      id: "prompt",
      header: "Prompt",
      sticky: true,
      sortValue: (c) => c.label.toLowerCase(),
      cell: (c) => (
        <div className="max-w-md min-w-56 space-y-1">
          <div className="flex items-start gap-1.5">
            <CountryFlag iso={c.country} className="mt-0.5" />
            <span className="line-clamp-2 text-sm">{c.label}</span>
          </div>
          {c.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {c.tags.slice(0, 3).map((t) => (
                <TagChip key={t.id} name={t.name} color={t.color} />
              ))}
            </div>
          )}
        </div>
      ),
    },
    { id: "winner", header: competitorName ? competitorName : "Winning competitor", cell: (c) => <Winner c={c} />, sortValue: (c) => c.gapAnswers, hideBelow: "sm" },
    { id: "gap", header: "Gap answers", align: "right", sortValue: (c) => c.gapAnswers, cell: (c) => <span className="tabular">{c.gapAnswers}</span> },
    { id: "domains", header: "Top cited domains", cell: (c) => <DomainList list={c.domains} />, hideBelow: "md" },
  ];

  return (
    <Panel
      title="Where competitors win — and which sources they're cited from"
      icon={<Target className="size-4 text-muted-foreground" />}
      description={`Answers that name ${competitorName ?? "a competitor"} but not you, and the domains those answers cite most — the pages to get listed on.`}
      actions={
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 text-xs">
          {(["tag", "prompt"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setView(k)}
              className={view === k ? "rounded-md bg-background px-2 py-1 font-medium shadow-xs" : "px-2 py-1 text-muted-foreground"}
            >
              {k === "tag" ? "By tag" : "By prompt"}
            </button>
          ))}
        </div>
      }
    >
      {byTag ? (
        <DataTable
          columns={tagColumns}
          data={data.byTag}
          getRowId={(c) => c.key}
          initialSort={{ id: "gap", dir: "desc" }}
          pageSize={10}
          empty={<EmptyState compact icon={Target} title="No tagged prompts" description="Tag your prompts in the Tracker to see gaps per tag." />}
          mobileCard={(c) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <TagChip name={c.label} />
                <Winner c={c} />
              </div>
              <DomainList list={c.domains} />
            </div>
          )}
        />
      ) : (
        <DataTable
          columns={promptColumns}
          data={data.byPrompt}
          getRowId={(c) => c.key}
          initialSort={{ id: "gap", dir: "desc" }}
          pageSize={10}
          empty={<EmptyState compact icon={Target} title="No gaps in this period" description={`No answer names ${competitorName ?? "a competitor"} without also naming you.`} />}
          mobileCard={(c) => (
            <div className="space-y-1.5">
              <p className="line-clamp-2 text-sm">{c.label}</p>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <Winner c={c} />
                <span className="tabular">{c.gapAnswers} gap answers</span>
              </div>
              <DomainList list={c.domains} />
            </div>
          )}
        />
      )}
    </Panel>
  );
}

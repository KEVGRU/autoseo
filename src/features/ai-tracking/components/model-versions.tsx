"use client";

import { Cpu, Filter } from "lucide-react";
import { DataTable, type Column } from "@/components/app/data-table";
import { EngineIcon } from "@/components/app/engine-icon";
import { EmptyState } from "@/components/app/empty-state";
import { Delta, formatCurrency, formatNumber, formatPercent } from "@/components/app/metrics";
import { Button } from "@/components/ui/button";
import { getEngine } from "@/lib/engines";
import type { ModelVersionRow } from "../types";

function day(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Per engine × model version breakdown (ai_answers.model): which model produced the answers and
 * how visible the brand is in each. `onFilter` (tracker) narrows the page to one model version.
 */
export function ModelVersionsTable({ rows, onFilter, active = [] }: { rows: ModelVersionRow[]; onFilter?: (model: string) => void; active?: string[] }) {
  const columns: Column<ModelVersionRow>[] = [
    {
      id: "model",
      header: "Model version",
      sticky: true,
      sortValue: (r) => `${r.engine} ${r.model}`,
      cell: (r) => (
        <div className="flex min-w-44 items-center gap-2">
          <EngineIcon id={r.engine} size="xs" />
          <div className="min-w-0">
            <div className="truncate font-mono text-xs font-medium">{r.model}</div>
            <div className="text-[11px] text-muted-foreground">{getEngine(r.engine)?.name ?? r.engine}</div>
          </div>
        </div>
      ),
    },
    {
      id: "answers",
      header: "Answers",
      align: "right",
      sortValue: (r) => r.answers,
      cell: (r) => (
        <span className="tabular">
          {formatNumber(r.answers)}
          {r.engineShare != null && r.engineShare < 100 && <span className="ml-1 text-[11px] text-muted-foreground">({Math.round(r.engineShare)}%)</span>}
        </span>
      ),
    },
    { id: "prompts", header: "Prompts", align: "right", hideBelow: "md", sortValue: (r) => r.prompts, cell: (r) => formatNumber(r.prompts) },
    {
      id: "visibility",
      header: "Visibility",
      align: "right",
      sortValue: (r) => r.visibility,
      cell: (r) => (
        <span className="inline-flex items-center gap-1.5 tabular">
          {formatPercent(r.visibility)} <Delta value={r.visibilityDelta} showZero={false} />
        </span>
      ),
    },
    { id: "mention", header: "Mention Rate", align: "right", hideBelow: "md", sortValue: (r) => r.mentionRate, cell: (r) => formatPercent(r.mentionRate) },
    { id: "citation", header: "Citation Rate", align: "right", hideBelow: "lg", sortValue: (r) => r.citationRate, cell: (r) => formatPercent(r.citationRate) },
    { id: "position", header: "Position", align: "right", hideBelow: "lg", sortValue: (r) => r.position, cell: (r) => (r.position != null ? `#${r.position.toFixed(1)}` : "—") },
    { id: "sentiment", header: "Sentiment", align: "right", hideBelow: "lg", sortValue: (r) => r.sentiment, cell: (r) => (r.sentiment != null ? Math.round(r.sentiment) : "—") },
    {
      id: "seen",
      header: "Seen",
      align: "right",
      hideBelow: "md",
      sortValue: (r) => r.lastSeen,
      cell: (r) => <span className="text-xs whitespace-nowrap text-muted-foreground">{r.firstSeen === r.lastSeen ? day(r.lastSeen) : `${day(r.firstSeen)} – ${day(r.lastSeen)}`}</span>,
    },
    { id: "cost", header: "Cost", align: "right", hideBelow: "xl", sortValue: (r) => r.costUsd, cell: (r) => formatCurrency(r.costUsd, "USD", 2) },
    ...(onFilter
      ? [
          {
            id: "filter",
            header: <span className="sr-only">Filter</span>,
            align: "right" as const,
            cell: (r: ModelVersionRow) => (
              <Button
                variant={active.includes(r.model) ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label={`Only answers from ${r.model}`}
                title={active.includes(r.model) ? "Remove model filter" : "Only this model version"}
                onClick={() => onFilter(r.model)}
              >
                <Filter className="size-3.5" />
              </Button>
            ),
          },
        ]
      : []),
  ];
  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(r) => `${r.engine}|${r.model}`}
      paginate={false}
      dense
      initialSort={{ id: "answers", dir: "desc" }}
      empty={<EmptyState compact icon={Cpu} title="No answers in this period" description="Model versions appear once the enabled AI models have answered your prompts." />}
      mobileCard={(r) => (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <EngineIcon id={r.engine} size="xs" />
              <span className="truncate font-mono text-xs font-medium">{r.model}</span>
            </div>
            {onFilter && (
              <Button variant={active.includes(r.model) ? "secondary" : "ghost"} size="icon-sm" aria-label={`Only answers from ${r.model}`} onClick={() => onFilter(r.model)}>
                <Filter className="size-3.5" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-muted/60 px-2 py-1.5">
              <div className="text-[10px] text-muted-foreground">Answers</div>
              <div className="font-medium tabular">{formatNumber(r.answers)}</div>
            </div>
            <div className="rounded-lg bg-muted/60 px-2 py-1.5">
              <div className="text-[10px] text-muted-foreground">Visibility</div>
              <div className="font-medium tabular">{formatPercent(r.visibility)}</div>
            </div>
            <div className="rounded-lg bg-muted/60 px-2 py-1.5">
              <div className="text-[10px] text-muted-foreground">Position</div>
              <div className="font-medium tabular">{r.position != null ? `#${r.position.toFixed(1)}` : "—"}</div>
            </div>
          </div>
        </div>
      )}
    />
  );
}

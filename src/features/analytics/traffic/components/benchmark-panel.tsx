"use client";

import { Info, Scale } from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/components/app/metrics";
import { Panel } from "@/components/app/page";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { EngagementBenchmark } from "@/server/analytics/traffic/queries";
import type { BenchmarkMetric } from "@/server/analytics/traffic/benchmark";

function duration(seconds: number) {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmt(m: BenchmarkMetric, v: number | null, currency: string) {
  if (v == null) return "—";
  switch (m.format) {
    case "percent":
      return formatPercent(v, v < 10 ? 2 : 1);
    case "seconds":
      return duration(v);
    case "decimal":
      return formatNumber(v, { maximumFractionDigits: 2 });
    case "currency":
      return formatCurrency(v, currency, 2);
  }
}

const HINTS: Record<BenchmarkMetric["key"], string> = {
  engagementRate: "Share of sessions that were engaged (GA4: engaged sessions; Matomo / Piwik PRO: sessions that didn't bounce).",
  avgEngagementSeconds: "Engagement time per session (GA4 user engagement; Matomo / Piwik PRO visit duration).",
  pagesPerSession: "Page views per session.",
  conversionRate: "Sessions with at least one key event / goal / order.",
  revenuePerSession: "Revenue divided by sessions.",
};

function statusNote(b: EngagementBenchmark, sourceLabel: string): string | null {
  switch (b.organicStatus) {
    case "ok":
      return null;
    case "unsupported":
      return `${sourceLabel} can't segment organic search sessions for this account${b.note ? ` — ${b.note}` : "."} Only the AI side is shown.`;
    case "error":
      return b.note ?? "The organic search totals could not be fetched in the last sync.";
    case "no_organic":
      return "No organic search sessions were recorded in this period.";
    case "not_synced":
      return "Organic search totals are imported with the next daily sync (or run a sync now in Settings).";
  }
}

/** "AI visitors vs organic search" engagement benchmark (same analytics source, same period). */
export function BenchmarkPanel({ benchmark, currency, sourceLabel, periodLabel }: { benchmark: EngagementBenchmark; currency: string; sourceLabel: string; periodLabel: string }) {
  const note = statusNote(benchmark, sourceLabel);
  const hasOrganic = !!benchmark.organic;
  return (
    <Panel
      icon={<Scale />}
      title={
        <span>
          AI visitors vs organic search <span className="font-normal text-muted-foreground">— {periodLabel}</span>
        </span>
      }
      description={`How visitors referred by AI assistants engage and convert compared with organic search visitors · Source: ${sourceLabel}`}
    >
      <div className="space-y-4">
        {benchmark.headline && <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-foreground">{benchmark.headline}</p>}
        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-2 border-b bg-muted/40 px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:grid-cols-[1.6fr_1fr_1fr_0.9fr]">
            <span>Metric</span>
            <span className="text-right">AI visitors</span>
            <span className="text-right">Organic search</span>
            <span className="hidden text-right sm:block">Difference</span>
          </div>
          {benchmark.metrics.map((m) => (
            <div key={m.key} className="grid grid-cols-[1.3fr_1fr_1fr] items-center gap-2 border-b px-3 py-2.5 text-sm last:border-b-0 sm:grid-cols-[1.6fr_1fr_1fr_0.9fr]">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate">{m.label}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 shrink-0 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-72">{HINTS[m.key]}</TooltipContent>
                </Tooltip>
              </span>
              <span className={cn("text-right font-medium tabular", m.leader === "ai" && "text-success")}>{fmt(m, m.ai, currency)}</span>
              <span className={cn("text-right tabular", m.leader === "organic" ? "font-medium text-foreground" : "text-muted-foreground")}>
                {hasOrganic ? fmt(m, m.organic, currency) : "n/a"}
              </span>
              <span className="col-span-3 -mt-1 text-right text-xs tabular sm:col-span-1 sm:mt-0 sm:text-sm">
                {m.diffPct == null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <span className={cn("font-medium", m.diffPct > 0 ? "text-success" : m.diffPct < 0 ? "text-destructive" : "text-muted-foreground")}>
                    {m.diffPct > 0 ? "+" : m.diffPct < 0 ? "−" : "±"}
                    {formatNumber(Math.abs(m.diffPct), { maximumFractionDigits: 1 })}%
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            AI: <span className="tabular text-foreground">{formatNumber(benchmark.ai.sessions, { maximumFractionDigits: 0 })}</span> sessions
          </span>
          <span>
            Organic search: <span className="tabular text-foreground">{hasOrganic ? formatNumber(benchmark.organic!.sessions, { maximumFractionDigits: 0 }) : "—"}</span> sessions
          </span>
          {!benchmark.aiPageviewsAvailable && benchmark.ai.sessions > 0 && <span>AI page views are recorded from the next sync on.</span>}
        </div>
        {note && <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">{note}</p>}
      </div>
    </Panel>
  );
}

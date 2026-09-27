"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { Panel } from "@/components/app/page";
import { TrendChart, StackedBar } from "@/components/app/charts";
import { DataTable, type Column } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { EngineIcon } from "@/components/app/engine-icon";
import { Favicon } from "@/components/app/favicon";
import { CountryFlag } from "@/components/app/misc";
import { formatNumber, formatPercent } from "@/components/app/metrics";
import { Button } from "@/components/ui/button";
import type { SurfaceOverlap } from "../types";

const COLORS = { both: "var(--brand)", aio: "var(--chart-2)", mode: "var(--chart-4)", neither: "var(--muted)" };

type PromptRow = SurfaceOverlap["prompts"][number];
type DomainRow = SurfaceOverlap["domains"][number];

function Stat({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-xl font-semibold tabular">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/**
 * Google AI Overview vs AI Mode (tracker "AI Overviews" tab): how often an AI Overview shows at
 * all, and — for the same prompt, market and day — how much the two surfaces agree on sources and
 * on your brand.
 */
export function SurfacesPanel({ data, modelsHref }: { data: SurfaceOverlap; modelsHref: string }) {
  const hasAio = data.aiOverview.answers > 0;
  const hasMode = data.aiMode.answers > 0;
  if (!hasAio && !hasMode) {
    return (
      <Panel>
        <EmptyState
          icon={Layers}
          title="No Google AI Overview or AI Mode answers in this period"
          description="Enable Google AI Overview and Google AI Mode in Model Settings to see how often an AI Overview appears and how the two surfaces overlap."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={modelsHref}>Model Settings</Link>
            </Button>
          }
        />
      </Panel>
    );
  }
  const b = data.brand;
  const pairs = data.pairs;
  const share = (v: number) => (pairs ? (v / pairs) * 100 : null);

  const promptColumns: Column<PromptRow>[] = [
    {
      id: "prompt",
      header: "Prompt",
      sticky: true,
      sortValue: (r) => r.text,
      cell: (r) => (
        <div className="flex min-w-52 items-start gap-2">
          <CountryFlag iso={r.country} />
          <span className="line-clamp-2">{r.text}</span>
        </div>
      ),
    },
    { id: "pairs", header: "Days", align: "right", hint: "Prompt-days answered by both surfaces", sortValue: (r) => r.pairs, cell: (r) => formatNumber(r.pairs) },
    { id: "aio", header: "AI Overview shown", align: "right", sortValue: (r) => r.aiOverviewPresence, cell: (r) => formatPercent(r.aiOverviewPresence) },
    { id: "url", header: "URL overlap", align: "right", hideBelow: "sm", sortValue: (r) => r.urlOverlap, cell: (r) => formatPercent(r.urlOverlap) },
    { id: "domain", header: "Domain overlap", align: "right", hideBelow: "md", sortValue: (r) => r.domainOverlap, cell: (r) => formatPercent(r.domainOverlap) },
    {
      id: "brand",
      header: "You visible in",
      hideBelow: "md",
      sortValue: (r) => r.brandBoth,
      cell: (r) => (
        <div className="min-w-40 space-y-1">
          <StackedBar
            parts={[
              { key: "both", value: r.brandBoth, color: COLORS.both, label: "Both" },
              { key: "aio", value: r.brandAiOverviewOnly, color: COLORS.aio, label: "AI Overview only" },
              { key: "mode", value: r.brandAiModeOnly, color: COLORS.mode, label: "AI Mode only" },
              { key: "none", value: Math.max(0, r.pairs - r.brandBoth - r.brandAiOverviewOnly - r.brandAiModeOnly), color: COLORS.neither, label: "Neither" },
            ]}
          />
          <div className="text-[11px] text-muted-foreground tabular">
            both {r.brandBoth} · AIO {r.brandAiOverviewOnly} · Mode {r.brandAiModeOnly}
          </div>
        </div>
      ),
    },
  ];

  const domainColumns: Column<DomainRow>[] = [
    {
      id: "domain",
      header: "Domain",
      sortValue: (r) => r.domain,
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-2">
          <Favicon domain={r.domain} className="size-4 rounded" />
          <span className="truncate">{r.domain}</span>
          {r.ownership !== "third_party" && <span className="shrink-0 rounded-full border px-1.5 text-[10px] text-muted-foreground">{r.ownership === "own" ? "you" : "competitor"}</span>}
        </span>
      ),
    },
    { id: "both", header: "Both", align: "right", sortValue: (r) => r.both, cell: (r) => formatNumber(r.both) },
    { id: "aio", header: "AI Overview", align: "right", sortValue: (r) => r.aiOverview, cell: (r) => formatNumber(r.aiOverview) },
    { id: "mode", header: "AI Mode", align: "right", sortValue: (r) => r.aiMode, cell: (r) => formatNumber(r.aiMode) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <Stat
          icon={<EngineIcon id="ai_overview" size="xs" withTooltip={false} />}
          label="AI Overview shown"
          value={formatPercent(data.aiOverview.presence)}
          sub={hasAio ? `${formatNumber(data.aiOverview.present)} of ${formatNumber(data.aiOverview.answers)} answers` : "Not tracked"}
        />
        <Stat
          icon={<EngineIcon id="google_ai_mode" size="xs" withTooltip={false} />}
          label="AI Mode answered"
          value={formatPercent(data.aiMode.presence)}
          sub={hasMode ? `${formatNumber(data.aiMode.present)} of ${formatNumber(data.aiMode.answers)} answers` : "Not tracked"}
        />
        <Stat label="Compared prompt-days" value={formatNumber(pairs)} sub={`${formatNumber(data.bothPresent)} with both answers`} />
        <Stat label="URL overlap" value={formatPercent(data.urlOverlap)} sub="Shared ÷ all cited URLs" />
        <Stat label="Domain overlap" value={formatPercent(data.domainOverlap)} sub="Shared ÷ all cited domains" />
      </div>

      <Panel
        title="Your brand in AI Overview vs AI Mode"
        description={pairs ? `Same prompt, market and day — ${formatNumber(pairs)} prompt-days` : "Track both Google AI Overview and AI Mode to compare them"}
        contentClassName="space-y-4"
      >
        {pairs ? (
          <>
            <StackedBar
              height={12}
              parts={[
                { key: "both", value: b.both, color: COLORS.both, label: "Visible in both" },
                { key: "aio", value: b.aiOverviewOnly, color: COLORS.aio, label: "AI Overview only" },
                { key: "mode", value: b.aiModeOnly, color: COLORS.mode, label: "AI Mode only" },
                { key: "none", value: b.neither, color: COLORS.neither, label: "Neither" },
              ]}
            />
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {[
                ["Visible in both", b.both, COLORS.both],
                ["AI Overview only", b.aiOverviewOnly, COLORS.aio],
                ["AI Mode only", b.aiModeOnly, COLORS.mode],
                ["Neither", b.neither, "var(--muted-foreground)"],
              ].map(([label, v, color]) => (
                <div key={label as string} className="flex items-center gap-1.5">
                  <span className="size-2.5 shrink-0 rounded-sm" style={{ background: color as string, opacity: label === "Neither" ? 0.3 : 1 }} />
                  <span className="text-muted-foreground">{label}</span>
                  <span className="ml-auto font-medium tabular">{formatPercent(share(v as number))}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <TrendChart
                data={data.daily.map((d) => ({ date: d.date, aio: d.aiOverviewPresence, overlap: d.urlOverlap }))}
                series={[
                  { key: "aio", label: "AI Overview shown", color: COLORS.aio },
                  { key: "overlap", label: "URL overlap", color: COLORS.both },
                ]}
                type="line"
                format="percent"
                domain={[0, 100]}
                height={220}
                legend
              />
            </div>
          </>
        ) : (
          <EmptyState compact icon={Layers} title="Nothing to compare yet" description="Both Google AI Overview and Google AI Mode need answers for the same prompt, market and day." />
        )}
      </Panel>

      {pairs > 0 && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Panel title="Prompts" description="Presence and overlap per prompt and market" contentClassName="p-0 sm:p-0">
            <DataTable columns={promptColumns} data={data.prompts} getRowId={(r) => `${r.promptId}|${r.country}`} initialSort={{ id: "pairs", dir: "desc" }} pageSize={25} dense />
          </Panel>
          <Panel title="Cited domains" description="Prompt-days in which each surface cited the domain" contentClassName="p-0 sm:p-0">
            <DataTable columns={domainColumns} data={data.domains} getRowId={(r) => r.domain} initialSort={{ id: "both", dir: "desc" }} paginate={false} dense />
          </Panel>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Download, FolderKanban, ListTodo, Radar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/app/page";
import { DataTable, type Column } from "@/components/app/data-table";
import { FilterBar, PeriodSelect, SearchInput } from "@/components/app/filters";
import { Delta, KpiStrip, formatCurrency, formatNumber, formatPercent, type KpiItem } from "@/components/app/metrics";
import { Sparkline } from "@/components/app/charts";
import { CountryFlag, TimeAgo } from "@/components/app/misc";
import { Favicon } from "@/components/app/favicon";
import { EmptyState } from "@/components/app/empty-state";
import { useUrlPatch, useUrlState } from "@/hooks/use-url-state";
import { Segmented } from "@/features/settings/account/segmented";
import { cn } from "@/lib/utils";
import {
  HIGH_IMPACT,
  filterPortfolioRows,
  isPortfolioFilter,
  portfolioTotals,
  type PortfolioOverview,
  type PortfolioRow,
} from "../lib";

function Badges({ row }: { row: PortfolioRow }) {
  return (
    <>
      {row.isPitch && (
        <Badge variant="outline" className="h-5 shrink-0 text-[10px]">
          Pitch{row.pitchExpiresAt ? ` · ends ${new Date(row.pitchExpiresAt).toLocaleDateString()}` : ""}
        </Badge>
      )}
      {row.paused && (
        <Badge variant="outline" className="h-5 shrink-0 border-warning/40 text-[10px] text-warning">
          Paused
        </Badge>
      )}
    </>
  );
}

function ProjectCell({ row }: { row: PortfolioRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background">
        <Favicon domain={row.domain} src={row.logoUrl} fallback={row.name} className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Link href={`/p/${row.projectId}`} className="truncate text-sm font-medium hover:underline">
            {row.name}
          </Link>
          <Badges row={row} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CountryFlag iso={row.country} />
          <span className="truncate">{row.domain}</span>
        </div>
      </div>
    </div>
  );
}

function Metric({ value, delta, suffix = "", invert, format = "percent" }: { value: number | null; delta?: number | null; suffix?: string; invert?: boolean; format?: "percent" | "number" }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <span className="tabular font-medium">{format === "percent" ? formatPercent(value) : formatNumber(value)}</span>
      <Delta value={delta} suffix={suffix} invert={invert} showZero={false} />
    </span>
  );
}

function Trend({ row, className }: { row: PortfolioRow; className?: string }) {
  const values = row.series.map((p) => p.visibility).filter((v): v is number => v != null);
  if (values.length < 2) return <span className="text-xs text-muted-foreground">—</span>;
  const falling = values[values.length - 1]! < values[0]!;
  return <Sparkline values={values} height={28} color={falling ? "var(--destructive)" : "var(--brand)"} className={cn("max-w-[120px]", className)} />;
}

function TasksCell({ row }: { row: PortfolioRow }) {
  return (
    <Link
      href={`/p/${row.projectId}/tasks`}
      className="inline-flex flex-col items-end gap-0.5 hover:underline"
      title={`${row.openHighImpactTasks} open tasks with impact ≥ ${HIGH_IMPACT} · ${row.openTasks} open in total`}
    >
      <span className={cn("tabular font-medium", row.openHighImpactTasks > 0 && "text-warning")}>{row.openHighImpactTasks}</span>
      <span className="text-[11px] text-muted-foreground tabular">of {row.openTasks} open</span>
    </Link>
  );
}

function RevenueCell({ row }: { row: PortfolioRow }) {
  if (!row.aiResponses && !row.aiRevenue && !row.aiRevenuePrev) return <span className="text-muted-foreground">—</span>;
  const change = row.aiRevenuePrev > 0 ? ((row.aiRevenue - row.aiRevenuePrev) / row.aiRevenuePrev) * 100 : null;
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <span className="tabular font-medium">{formatCurrency(row.aiRevenue, row.currency)}</span>
      <Delta value={change} suffix="%" showZero={false} />
    </span>
  );
}

function LastRun({ row }: { row: PortfolioRow }) {
  if (!row.lastRunAt) return <span className="text-xs text-muted-foreground">Never</span>;
  return (
    <span className="inline-flex flex-col items-end gap-0.5 text-xs">
      <TimeAgo date={row.lastRunAt} className="text-muted-foreground" />
      {row.lastRunStatus && row.lastRunStatus !== "completed" && (
        <span className={cn("capitalize", row.lastRunStatus === "failed" ? "text-destructive" : "text-muted-foreground")}>{row.lastRunStatus}</span>
      )}
    </span>
  );
}

function MobileCard({ row }: { row: PortfolioRow }) {
  const stats: [string, React.ReactNode][] = [
    ["Visibility", <Metric key="v" value={row.visibility} delta={row.visibilityDelta} />],
    ["Share of voice", <Metric key="s" value={row.shareOfVoice} delta={row.shareOfVoiceDelta} />],
    ["High-impact tasks", <TasksCell key="t" row={row} />],
    ["AI revenue", <RevenueCell key="r" row={row} />],
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <ProjectCell row={row} />
        <Button asChild variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Open ${row.name}`}>
          <Link href={`/p/${row.projectId}`}>
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(([label, node]) => (
          <div key={label} className="flex items-start justify-between gap-2 rounded-lg bg-muted/50 px-2.5 py-2">
            <span className="text-[11px] text-muted-foreground">{label}</span>
            <span className="text-sm">{node}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <Trend row={row} className="h-7 flex-1" />
        <span className="shrink-0">
          Last run: <LastRun row={row} />
        </span>
      </div>
    </div>
  );
}

export function PortfolioView({ data, canCreate, canExport = true }: { data: PortfolioOverview; canCreate: boolean; canExport?: boolean }) {
  const [period] = useUrlState("period", "30d");
  const [q, setQ] = useUrlState("q", "");
  const [rawFilter, setFilter] = useUrlState("filter", "all");
  const [patch, pending] = useUrlPatch();
  const filter = isPortfolioFilter(rawFilter) ? rawFilter : "all";

  const rows = useMemo(() => filterPortfolioRows(data.rows, { q, filter }), [data.rows, q, filter]);
  const totals = useMemo(() => portfolioTotals(rows), [rows]);
  const counts = useMemo(
    () => ({
      all: data.rows.length,
      active: filterPortfolioRows(data.rows, { filter: "active" }).length,
      pitch: filterPortfolioRows(data.rows, { filter: "pitch" }).length,
      paused: filterPortfolioRows(data.rows, { filter: "paused" }).length,
    }),
    [data.rows],
  );

  const exportHref = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set("period", period);
    if (period === "custom") {
      qs.set("from", data.period.from);
      qs.set("to", data.period.to);
    }
    if (q) qs.set("q", q);
    if (filter !== "all") qs.set("filter", filter);
    return `/portfolio/export?${qs.toString()}`;
  }, [period, q, filter, data.period.from, data.period.to]);

  if (!data.rows.length) {
    return (
      <Panel>
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="The portfolio compares AI visibility, tasks and revenue across every project you can access. Create a project to start tracking."
          action={canCreate ? { label: "Create a project", href: "/onboarding" } : undefined}
        />
      </Panel>
    );
  }

  const [primaryRevenue, ...otherRevenue] = totals.revenue;
  const kpis: KpiItem[] = [
    { key: "projects", label: "Projects", value: formatNumber(totals.projects), sub: `${totals.tracked} with AI answers` },
    {
      key: "visibility",
      label: "Avg visibility",
      value: formatPercent(totals.avgVisibility),
      delta: totals.avgVisibilityDelta,
      deltaSuffix: " pp",
      hint: "Mean AI visibility of the projects with answers in the period; change vs the previous period of equal length.",
    },
    {
      key: "revenue",
      label: "AI revenue",
      value: primaryRevenue ? formatCurrency(primaryRevenue.value, primaryRevenue.currency) : "—",
      delta: primaryRevenue && primaryRevenue.previous > 0 ? ((primaryRevenue.value - primaryRevenue.previous) / primaryRevenue.previous) * 100 : null,
      deltaSuffix: "%",
      sub: otherRevenue.length ? `+ ${otherRevenue.map((r) => formatCurrency(r.value, r.currency)).join(" + ")}` : undefined,
      hint: "Deal value of survey responses attributed to AI search (Attribution), in each project's reporting currency.",
    },
    {
      key: "tasks",
      label: "High-impact tasks",
      value: formatNumber(totals.openHighImpactTasks),
      hint: `Open or in-progress optimization tasks with impact ≥ ${HIGH_IMPACT}.`,
    },
  ];

  const columns: Column<PortfolioRow>[] = [
    { id: "project", header: "Project", sticky: true, sortValue: (r) => r.name.toLowerCase(), cell: (r) => <ProjectCell row={r} /> },
    {
      id: "visibility",
      header: "Visibility",
      align: "right",
      hint: "Answers naming or citing the brand ÷ all answers (active prompts). Δ in percentage points.",
      sortValue: (r) => r.visibility,
      cell: (r) => <Metric value={r.visibility} delta={r.visibilityDelta} />,
    },
    { id: "trend", header: "Trend", hideBelow: "md", width: "132px", cell: (r) => <Trend row={r} /> },
    {
      id: "sov",
      header: "Share of voice",
      align: "right",
      hint: "Own-brand mentions ÷ mentions of the own brand and tracked competitors.",
      sortValue: (r) => r.shareOfVoice,
      cell: (r) => <Metric value={r.shareOfVoice} delta={r.shareOfVoiceDelta} />,
    },
    {
      id: "position",
      header: "Avg position",
      align: "right",
      hideBelow: "lg",
      hint: "Mean position where the brand is named (1 = named first). Lower is better.",
      sortValue: (r) => r.position,
      cell: (r) => <Metric value={r.position} delta={r.positionDelta} invert format="number" />,
    },
    {
      id: "sentiment",
      header: "Sentiment",
      align: "right",
      hideBelow: "lg",
      hint: "Mean own-brand sentiment (0–100).",
      sortValue: (r) => r.sentiment,
      cell: (r) => <Metric value={r.sentiment} delta={r.sentimentDelta} format="number" />,
    },
    {
      id: "citations",
      header: "Citations",
      align: "right",
      hideBelow: "md",
      hint: "Answers citing an own-domain page (and their share of all answers).",
      sortValue: (r) => r.citations,
      cell: (r) =>
        r.answers ? (
          <span className="inline-flex flex-col items-end gap-0.5">
            <span className="tabular font-medium">{formatNumber(r.citations)}</span>
            <span className="text-[11px] text-muted-foreground tabular">{formatPercent(r.citationRate)}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "tasks",
      header: "High-impact tasks",
      align: "right",
      hint: `Open / in-progress tasks with impact ≥ ${HIGH_IMPACT}.`,
      sortValue: (r) => r.openHighImpactTasks,
      cell: (r) => <TasksCell row={r} />,
    },
    { id: "revenue", header: "AI revenue", align: "right", hideBelow: "md", sortValue: (r) => r.aiRevenue, cell: (r) => <RevenueCell row={r} /> },
    {
      id: "lastRun",
      header: "Last run",
      align: "right",
      hideBelow: "xl",
      sortValue: (r) => (r.lastRunAt ? Date.parse(r.lastRunAt) : null),
      cell: (r) => <LastRun row={r} />,
    },
  ];

  return (
    <div className={cn("space-y-4 transition-opacity", pending && "opacity-70")}>
      <KpiStrip items={kpis} />

      {totals.tracked === 0 && rows.length > 0 && (
        <Panel>
          <EmptyState
            compact
            icon={Radar}
            title="No AI answers in this period"
            description="None of these projects has tracked AI answers between the selected dates. Add prompts in a project's Tracker or pick a longer period."
          />
        </Panel>
      )}

      <Panel
        title="Projects"
        icon={<ListTodo className="size-4 text-muted-foreground" />}
        description={`${data.period.from} – ${data.period.to} · compared with ${data.period.previous.from} – ${data.period.previous.to}`}
        contentClassName="space-y-3 p-3 sm:p-4"
      >
        <FilterBar
          search={<SearchInput value={q} onChange={(v) => setQ(v || null)} placeholder="Search projects or domains…" />}
          activeCount={(filter !== "all" ? 1 : 0) + (period !== "30d" ? 1 : 0)}
          right={
            canExport ? (
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
                <a href={exportHref} download>
                  <Download className="size-3.5" /> CSV
                </a>
              </Button>
            ) : undefined
          }
        >
          <Segmented
            size="sm"
            value={filter}
            onChange={(v) => setFilter(v === "all" ? null : v)}
            options={[
              { value: "all", label: `All ${counts.all}` },
              { value: "active", label: `Active ${counts.active}` },
              { value: "pitch", label: `Pitch ${counts.pitch}` },
              { value: "paused", label: `Paused ${counts.paused}` },
            ]}
          />
          <PeriodSelect
            value={period}
            from={period === "custom" ? data.period.from : undefined}
            to={period === "custom" ? data.period.to : undefined}
            onChange={(p) => patch({ period: p === "30d" ? null : p, from: null, to: null })}
            onCustom={(r) => patch({ period: "custom", from: r.from, to: r.to })}
          />
        </FilterBar>
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(r) => r.projectId}
          mobileCard={(r) => <MobileCard row={r} />}
          empty={<EmptyState compact title="No matching projects" description="Change the search or the status filter." />}
          pageSize={50}
        />
      </Panel>
    </div>
  );
}

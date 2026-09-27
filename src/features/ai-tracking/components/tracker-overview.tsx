"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Equal, Settings2 } from "lucide-react";
import { Panel, TabNav } from "@/components/app/page";
import { KpiStrip, Delta, formatNumber, formatCompact, formatPercent } from "@/components/app/metrics";
import { BarsChart, TrendChart, StackedBar, type Series } from "@/components/app/charts";
import { SankeyChart } from "@/components/app/sankey";
import { WorldMap } from "@/components/app/world-map";
import { FilterBar, MultiSelect, PeriodSelect, TagFilter } from "@/components/app/filters";
import { DataTable, type Column } from "@/components/app/data-table";
import { EngineIcon } from "@/components/app/engine-icon";
import { CountryFlag } from "@/components/app/misc";
import { EmptyState } from "@/components/app/empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useUrlPatch } from "@/hooks/use-url-state";
import { getEngine } from "@/lib/engines";
import { flagEmoji, getCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { BrandScopeToggle } from "@/features/ai-insights/components/brand-scope-toggle";
import { SimulatedToggle } from "@/features/ai-insights/components/simulated-toggle";
import { METRICS, type BrandScope } from "@/features/ai-insights/lib/metrics";
import type {
  CompareSeries,
  CompetitorOption,
  CountryRow,
  DayPoint,
  FlowState,
  KpiKey,
  KpiWithDelta,
  ModelVersionOption,
  ModelVersionRow,
  PromptDay,
  PromptFlow,
  SurfaceOverlap,
  TagOption,
  TrackerKpis,
} from "../types";
import { ModelVersionsTable } from "./model-versions";
import { SurfacesPanel } from "./surfaces-panel";

export type TrackerView = "trends" | "breakdown" | "flow" | "locations" | "surfaces" | "models";

export type TrackerSlices = { markets: string[]; funnels: string[]; intents: string[]; personas: string[]; modelVersions: string[] };
export type TrackerSliceOptions = { markets: string[]; funnels: string[]; intents: string[]; personas: string[]; modelVersions: ModelVersionOption[] };

const FUNNEL_LABELS: Record<string, string> = { tofu: "Awareness (TOFU)", mofu: "Consideration (MOFU)", bofu: "Decision (BOFU)" };

const KPI_META: Record<KpiKey, { label: string; hint: string; format: "percent" | "decimal"; invert?: boolean }> = {
  visibility: { label: "Visibility", hint: "Share of AI answers that mention or cite your brand.", format: "percent" },
  mentionRate: { label: "Mention Rate", hint: "Share of AI answers that name your brand.", format: "percent" },
  citationRate: { label: "Citation Rate", hint: "Share of AI answers that cite a page of your domain.", format: "percent" },
  position: { label: "Position", hint: "Average position of your brand among the brands named (1 = named first) — tracked brands or all brands, see the toggle.", format: "decimal", invert: true },
};

type SecondaryKey = "shareOfVoice" | "firstShare" | "top3Share" | "citationShare" | "mentions" | "mentionDepth" | "sentiment" | "aiOverviewPresence" | "aiModePresence";
const SECONDARY: { key: SecondaryKey; label: string; hint: string; format: "percent" | "number" | "score"; invert?: boolean }[] = [
  { key: "shareOfVoice", label: "Share of Voice", hint: METRICS.sov.hint, format: "percent" },
  { key: "firstShare", label: "#1 Share", hint: METRICS.firstShare.hint, format: "percent" },
  { key: "top3Share", label: "Top-3 Share", hint: METRICS.top3Share.hint, format: "percent" },
  { key: "citationShare", label: "Citation Share", hint: METRICS.citationShare.hint, format: "percent" },
  { key: "mentions", label: "Mentions", hint: METRICS.mentions.hint, format: "number" },
  { key: "mentionDepth", label: "Mention Depth", hint: METRICS.mentionDepth.hint, format: "percent", invert: true },
  { key: "sentiment", label: "Sentiment", hint: METRICS.sentiment.hint, format: "score" },
  { key: "aiOverviewPresence", label: "AI Overview shown", hint: "Share of Google AI Overview answers where the SERP showed an AI Overview at all.", format: "percent" },
  { key: "aiModePresence", label: "AI Mode answered", hint: "Share of Google AI Mode answers with an AI answer.", format: "percent" },
];

function SecondaryKpis({ kpis }: { kpis: KpiWithDelta }) {
  const cur = kpis.current;
  const prev = kpis.previous;
  const items = SECONDARY.filter((m) => (m.key === "aiOverviewPresence" ? cur.aiOverviewAnswers > 0 : m.key === "aiModePresence" ? cur.aiModeAnswers > 0 : true));
  const fmt = (m: (typeof SECONDARY)[number], v: number | null) =>
    v == null ? "—" : m.format === "percent" ? formatPercent(v) : m.format === "score" ? String(Math.round(v)) : formatNumber(v);
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
      {items.map((m) => {
        const v = cur[m.key as keyof TrackerKpis] as number | null;
        const p = prev[m.key as keyof TrackerKpis] as number | null;
        const delta = v == null || p == null ? null : Math.round((v - p) * 10) / 10;
        return (
          <div key={m.key} className="rounded-lg border bg-card px-2.5 py-1.5" title={m.hint}>
            <div className="truncate text-[11px] text-muted-foreground">{m.label}</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tabular">{fmt(m, v)}</span>
              <Delta value={delta} invert={m.invert} showZero={false} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STATE_META: Record<FlowState, { label: string; color: string }> = {
  both: { label: "Mentioned + Cited", color: "var(--brand)" },
  mentioned: { label: "Mentioned only", color: "var(--chart-2)" },
  cited: { label: "Cited only", color: "var(--chart-4)" },
  none: { label: "Not visible", color: "var(--muted-foreground)" },
  new: { label: "New prompt", color: "var(--chart-6)" },
};

function shortDay(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TrackerOverview({
  view,
  basePath,
  searchString,
  period,
  from,
  to,
  kpi,
  engines,
  tags,
  compare,
  brandName,
  engineOptions,
  tagOptions,
  competitorOptions,
  kpis,
  series,
  prevSeries,
  compareSeries,
  promptsPerDay,
  markers,
  flow,
  countries,
  surfaces,
  modelRows,
  brandScope,
  slices,
  sliceOptions,
  simulated,
  modelsHref,
}: {
  view: TrackerView;
  basePath: string;
  searchString: string;
  period: string;
  from?: string;
  to?: string;
  kpi: KpiKey;
  engines: string[];
  tags: string[];
  compare: string[];
  brandName: string;
  engineOptions: string[];
  tagOptions: TagOption[];
  competitorOptions: CompetitorOption[];
  kpis: KpiWithDelta;
  series: DayPoint[];
  prevSeries: DayPoint[] | null;
  compareSeries: CompareSeries[];
  promptsPerDay: PromptDay[] | null;
  markers: { date: string; count: number }[];
  flow: PromptFlow | null;
  countries: CountryRow[] | null;
  surfaces: SurfaceOverlap | null;
  modelRows: ModelVersionRow[] | null;
  brandScope: BrandScope;
  slices: TrackerSlices;
  sliceOptions: TrackerSliceOptions;
  /** AI-simulation answers (provider "ai"): excluded? + count in the period (badge). */
  simulated: { exclude: boolean; count: number };
  modelsHref: string;
}) {
  const [patch] = useUrlPatch();
  const tabHref = (key: string) => {
    const p = new URLSearchParams(searchString);
    if (key === "trends") p.delete("view");
    else p.set("view", key);
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const cur = kpis.current;
  const prev = kpis.previous;
  const d = (a: number | null, b: number | null) => (a == null || b == null ? null : Math.round((a - b) * 10) / 10);
  const kpiItems = (Object.keys(KPI_META) as KpiKey[]).map((key) => ({
    key,
    label: KPI_META[key].label,
    hint: KPI_META[key].hint,
    value: key === "position" ? (cur.position != null ? `#${cur.position.toFixed(1)}` : "—") : formatPercent(cur[key]),
    delta: d(cur[key], prev[key]),
    invert: KPI_META[key].invert,
  }));

  const showSurfaces = view === "surfaces" || engineOptions.includes("ai_overview") || engineOptions.includes("google_ai_mode");
  const sliceCount = slices.markets.length + slices.funnels.length + slices.intents.length + slices.personas.length + slices.modelVersions.length;
  const toggleModel = (model: string) => {
    const next = slices.modelVersions.includes(model) ? slices.modelVersions.filter((m) => m !== model) : [...slices.modelVersions, model];
    patch({ mv: next.join(",") || null });
  };

  return (
    <div className="space-y-4">
      <TabNav
        tabs={[
          { key: "trends", label: "Trends", href: tabHref("trends") },
          { key: "breakdown", label: "Breakdown", href: tabHref("breakdown") },
          { key: "flow", label: "Prompt Flow", href: tabHref("flow") },
          { key: "locations", label: "Locations", href: tabHref("locations") },
          ...(showSurfaces ? [{ key: "surfaces", label: "AI Overviews", href: tabHref("surfaces") }] : []),
          { key: "models", label: "Models", href: tabHref("models") },
        ]}
        active={view}
      />
      <FilterBar
        activeCount={engines.length + tags.length + compare.length + sliceCount + (brandScope === "all" ? 1 : 0) + (simulated.exclude ? 1 : 0)}
        right={
          <>
            <BrandScopeToggle value={brandScope} onChange={(v) => patch({ brands: v === "all" ? "all" : null })} />
            <Button asChild variant="ghost" size="icon-sm" aria-label="Model settings">
              <Link href={modelsHref}>
                <Settings2 />
              </Link>
            </Button>
          </>
        }
      >
        <PeriodSelect
          value={period}
          from={from}
          to={to}
          onChange={(p) => patch({ period: p === "30d" ? null : p, from: null, to: null })}
          onCustom={(r) => patch({ period: "custom", from: r.from, to: r.to })}
        />
        <MultiSelect
          options={engineOptions.map((e) => ({ value: e, label: getEngine(e)?.name ?? e, icon: <EngineIcon id={e} size="xs" withTooltip={false} /> }))}
          value={engines}
          onChange={(v) => patch({ engines: v.join(",") || null })}
          placeholder="All Models"
          label="Models"
        />
        {sliceOptions.markets.length > 1 && (
          <MultiSelect
            options={sliceOptions.markets.map((m) => ({ value: m, label: getCountry(m)?.name ?? m, icon: <span>{flagEmoji(m)}</span> }))}
            value={slices.markets}
            onChange={(v) => patch({ markets: v.join(",") || null })}
            placeholder="All Markets"
            label="Markets"
          />
        )}
        <TagFilter options={tagOptions.map((t) => ({ value: t.id, label: t.name, count: t.count }))} value={tags} onChange={(v) => patch({ tags: v.join(",") || null })} />
        {sliceOptions.funnels.length > 0 && (
          <MultiSelect
            options={sliceOptions.funnels.map((f) => ({ value: f, label: FUNNEL_LABELS[f] ?? f }))}
            value={slices.funnels}
            onChange={(v) => patch({ funnel: v.join(",") || null })}
            placeholder="All Stages"
            label="Stages"
            searchable={false}
          />
        )}
        {sliceOptions.intents.length > 0 && (
          <MultiSelect
            options={sliceOptions.intents.map((i) => ({ value: i, label: i }))}
            value={slices.intents}
            onChange={(v) => patch({ intent: v.join(",") || null })}
            placeholder="All Intents"
            label="Intents"
          />
        )}
        {sliceOptions.personas.length > 0 && (
          <MultiSelect
            options={sliceOptions.personas.map((i) => ({ value: i, label: i }))}
            value={slices.personas}
            onChange={(v) => patch({ persona: v.join(",") || null })}
            placeholder="All Personas"
            label="Personas"
          />
        )}
        {(simulated.count > 0 || simulated.exclude) && (
          <SimulatedToggle exclude={simulated.exclude} count={simulated.count} onChange={(v) => patch({ simulated: v ? "exclude" : null })} />
        )}
        {sliceOptions.modelVersions.length > 0 && (
          <MultiSelect
            options={[...new Map(sliceOptions.modelVersions.map((m) => [m.model, m])).values()].map((m) => ({
              value: m.model,
              label: m.model,
              icon: <EngineIcon id={m.engine} size="xs" withTooltip={false} />,
            }))}
            value={slices.modelVersions}
            onChange={(v) => patch({ mv: v.join(",") || null })}
            placeholder="All Versions"
            label="Versions"
          />
        )}
        {view === "trends" && (
          <MultiSelect
            options={[
              { value: "prev", label: "Previous period" },
              ...competitorOptions.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={compare}
            onChange={(v) => patch({ compare: v.join(",") || null })}
            placeholder="Compare"
            label="Compare"
          />
        )}
      </FilterBar>

      <KpiStrip items={kpiItems} active={kpi} onSelect={(k) => patch({ kpi: k === "visibility" ? null : k })} />
      <SecondaryKpis kpis={kpis} />

      {view === "trends" && (
        <TrendsPanel
          kpi={kpi}
          brandName={brandName}
          series={series}
          prevSeries={prevSeries}
          compareSeries={compareSeries}
          compare={compare}
          markers={markers}
          promptsPerDay={promptsPerDay ?? []}
          kpis={kpis}
        />
      )}
      {view === "breakdown" && <BreakdownPanel series={series} />}
      {view === "flow" && flow && <FlowPanel flow={flow} />}
      {view === "locations" && countries && <LocationsPanel countries={countries} />}
      {view === "surfaces" && surfaces && <SurfacesPanel data={surfaces} modelsHref={modelsHref} />}
      {view === "models" && modelRows && (
        <Panel title="Model versions" description="Which model version produced the answers, and how visible you are in each — filter the tracker to one version with the funnel icon" contentClassName="p-3 sm:p-0">
          <ModelVersionsTable rows={modelRows} onFilter={toggleModel} active={slices.modelVersions} />
        </Panel>
      )}
    </div>
  );
}

function TrendsPanel({
  kpi,
  brandName,
  series,
  prevSeries,
  compareSeries,
  compare,
  markers,
  promptsPerDay,
  kpis,
}: {
  kpi: KpiKey;
  brandName: string;
  series: DayPoint[];
  prevSeries: DayPoint[] | null;
  compareSeries: CompareSeries[];
  compare: string[];
  markers: { date: string; count: number }[];
  promptsPerDay: PromptDay[];
  kpis: KpiWithDelta;
}) {
  const meta = KPI_META[kpi];
  const hasData = series.some((p) => p.answers > 0);
  const { data, chartSeries } = useMemo(() => {
    const s: Series[] = [{ key: "own", label: brandName, color: "var(--brand)" }];
    if (compare.includes("prev") && prevSeries) s.push({ key: "prev", label: "Previous period", color: "var(--muted-foreground)", dashed: true });
    compareSeries.forEach((c, i) => s.push({ key: `c_${i}`, label: c.label, color: c.color ?? `var(--chart-${(i % 6) + 2})` }));
    const rows = series.map((p, idx) => {
      const row: Record<string, unknown> = { date: p.date, own: p.answers ? p[kpi] : null };
      if (compare.includes("prev") && prevSeries) {
        const pp = prevSeries[idx];
        row.prev = pp && pp.answers ? pp[kpi] : null;
      }
      compareSeries.forEach((c, i) => {
        row[`c_${i}`] = c.values[p.date]?.[kpi] ?? null;
      });
      return row;
    });
    return { data: rows, chartSeries: s };
  }, [series, prevSeries, compareSeries, compare, kpi, brandName]);

  return (
    <Panel contentClassName="space-y-4">
      {hasData ? (
        <TrendChart
          data={data}
          series={chartSeries}
          type="area"
          format={meta.format === "percent" ? "percent" : "decimal"}
          domain={meta.format === "percent" ? [0, 100] : ["auto", "auto"]}
          height={280}
          legend={chartSeries.length > 1}
          markers={markers.filter((m) => series.some((s) => s.date === m.date)).map((m) => ({ x: m.date, label: `▲ +${m.count}` }))}
        />
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No tracking data in this period"
          description="Once your prompts have been answered by the enabled AI models, visibility trends appear here."
          compact
        />
      )}
      <PromptsPerDay days={promptsPerDay} prompts={kpis.current.prompts} answers={kpis.current.answers} />
    </Panel>
  );
}

function PromptsPerDay({ days, prompts, answers }: { days: PromptDay[]; prompts: number; answers: number }) {
  const max = Math.max(1, ...days.map((d) => Math.max(d.improved, d.declined)));
  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="font-medium">
          Prompts per Day <span className="font-normal text-muted-foreground">· click a marker for details</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-success" /> Net+
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-destructive" /> Net−
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-muted-foreground/40" /> Even
          </span>
          <span className="tabular">
            {formatNumber(prompts)} prompts · {formatCompact(answers)} answers
          </span>
        </div>
      </div>
      <div className="flex h-12 items-end gap-[2px]">
        {days.map((d) => {
          const net = d.improved - d.declined;
          const h = d.prompts ? Math.max(12, (Math.max(d.improved, d.declined, 1) / max) * 100) : 6;
          return (
            <Popover key={d.date}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`${shortDay(d.date)}: ${d.improved} improved, ${d.declined} declined`}
                  className={cn(
                    "min-w-0 flex-1 rounded-[3px] transition-opacity hover:opacity-80",
                    !d.prompts ? "bg-muted" : net > 0 ? "bg-success" : net < 0 ? "bg-destructive" : "bg-muted-foreground/35",
                  )}
                  style={{ height: `${h}%` }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="center">
                <div className="mb-2 flex items-center justify-between text-sm font-medium">
                  {shortDay(d.date)}
                  <span className="text-xs font-normal text-muted-foreground tabular">
                    {d.prompts} prompts · {d.answers} answers
                  </span>
                </div>
                <div className="mb-2 flex gap-3 text-xs">
                  <span className="flex items-center gap-1 text-success">
                    <ArrowUpRight className="size-3" /> {d.improved} improved
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <ArrowDownRight className="size-3" /> {d.declined} declined
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Equal className="size-3" /> {d.even} even
                  </span>
                </div>
                {d.details.length > 0 ? (
                  <ul className="max-h-56 space-y-1.5 overflow-y-auto text-xs">
                    {d.details.map((x) => (
                      <li key={x.promptId} className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 min-w-0">{x.text}</span>
                        <span className={cn("shrink-0 tabular", x.to > x.from ? "text-success" : "text-destructive")}>
                          {x.from}% → {x.to}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">{d.prompts ? "No prompt changed its visibility." : "No answers on this day."}</p>
                )}
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}

function BreakdownPanel({ series }: { series: DayPoint[] }) {
  const data = series.map((p) => ({
    date: p.date,
    both: p.answers ? Math.round((p.both / p.answers) * 1000) / 10 : null,
    mentionedOnly: p.answers ? Math.round((p.mentionedOnly / p.answers) * 1000) / 10 : null,
    citedOnly: p.answers ? Math.round((p.citedOnly / p.answers) * 1000) / 10 : null,
  }));
  const totals = series.reduce(
    (acc, p) => ({ both: acc.both + p.both, m: acc.m + p.mentionedOnly, c: acc.c + p.citedOnly, none: acc.none + p.none, answers: acc.answers + p.answers }),
    { both: 0, m: 0, c: 0, none: 0, answers: 0 },
  );
  const share = (v: number) => (totals.answers ? (v / totals.answers) * 100 : 0);
  return (
    <Panel title="Visibility breakdown" description="Visibility = Mentioned + Cited, Mentioned only, and Cited only (share of all answers per day)" contentClassName="space-y-4">
      {totals.answers ? (
        <>
          <BarsChart
            data={data}
            stacked
            format="percent"
            height={280}
            legend
            series={[
              { key: "both", label: "Mentioned + Cited", color: STATE_META.both.color },
              { key: "mentionedOnly", label: "Mentioned only", color: STATE_META.mentioned.color },
              { key: "citedOnly", label: "Cited only", color: STATE_META.cited.color },
            ]}
          />
          <div className="space-y-2 border-t pt-3">
            <StackedBar
              height={10}
              parts={[
                { key: "both", value: totals.both, color: STATE_META.both.color, label: STATE_META.both.label },
                { key: "m", value: totals.m, color: STATE_META.mentioned.color, label: STATE_META.mentioned.label },
                { key: "c", value: totals.c, color: STATE_META.cited.color, label: STATE_META.cited.label },
                { key: "none", value: totals.none, color: "var(--muted)", label: STATE_META.none.label },
              ]}
            />
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {[
                ["both", totals.both],
                ["mentioned", totals.m],
                ["cited", totals.c],
                ["none", totals.none],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm" style={{ background: k === "none" ? "var(--muted-foreground)" : STATE_META[k as FlowState].color, opacity: k === "none" ? 0.3 : 1 }} />
                  <span className="text-muted-foreground">{STATE_META[k as FlowState].label}</span>
                  <span className="ml-auto font-medium tabular">{formatPercent(share(v as number))}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <EmptyState icon={BarChart3} title="No answers in this period" compact />
      )}
    </Panel>
  );
}

function FlowPanel({ flow }: { flow: PromptFlow }) {
  const order: FlowState[] = ["new", "both", "mentioned", "cited", "none"];
  const nodes = [
    ...order.filter((s) => flow.totals.previous[s] > 0).map((s) => ({ id: `p:${s}`, label: STATE_META[s].label, color: STATE_META[s].color })),
    ...order.filter((s) => flow.totals.current[s] > 0).map((s) => ({ id: `c:${s}`, label: STATE_META[s].label, color: STATE_META[s].color })),
  ];
  const links = flow.links.map((l) => ({ source: `p:${l.from}`, target: `c:${l.to}`, value: l.value }));
  const cards = [
    { label: "Improved", value: flow.improved, icon: ArrowUpRight, cls: "text-success" },
    { label: "Declined", value: flow.declined, icon: ArrowDownRight, cls: "text-destructive" },
    { label: "Unchanged", value: flow.unchanged, icon: Equal, cls: "text-muted-foreground" },
  ];
  return (
    <Panel title="Prompt flow" description="How each prompt's visibility state changed from the previous period (left) to the current period (right)" contentClassName="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <c.icon className={cn("size-3.5", c.cls)} />
              {c.label}
            </div>
            <div className="text-xl font-semibold tabular">{c.value}</div>
          </div>
        ))}
      </div>
      {links.length ? (
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="mb-1 flex justify-between px-2 text-[11px] font-medium text-muted-foreground uppercase">
              <span>Previous period</span>
              <span>Current period</span>
            </div>
            <SankeyChart nodes={nodes} links={links} height={340} />
          </div>
        </div>
      ) : (
        <EmptyState icon={BarChart3} title="No prompt answers in this period" compact />
      )}
    </Panel>
  );
}

function LocationsPanel({ countries }: { countries: CountryRow[] }) {
  const values = Object.fromEntries(countries.filter((c) => c.answers > 0).map((c) => [c.country, c.visibility ?? 0]));
  const columns: Column<CountryRow>[] = [
    {
      id: "country",
      header: "Country",
      cell: (r) => <CountryFlag iso={r.country} withName />,
      sortValue: (r) => getCountry(r.country)?.name ?? r.country,
    },
    {
      id: "prompts",
      header: "Prompts",
      align: "right",
      hint: "Prompts answered in this market in the period (of the active prompts configured for it)",
      cell: (r) => (
        <span className="tabular">
          {formatNumber(r.prompts)}
          {r.configured > r.prompts && <span className="text-muted-foreground"> / {formatNumber(r.configured)}</span>} prompts
        </span>
      ),
      sortValue: (r) => r.prompts,
    },
    { id: "answers", header: "Answers", align: "right", cell: (r) => formatNumber(r.answers), sortValue: (r) => r.answers, hideBelow: "sm" },
    {
      id: "visibility",
      header: "Visibility",
      align: "right",
      cell: (r) => (
        <span className="inline-flex items-center gap-1.5">
          {formatPercent(r.visibility)} <Delta value={r.visibilityDelta} showZero={false} />
        </span>
      ),
      sortValue: (r) => r.visibility,
    },
    { id: "mention", header: "Mention Rate", align: "right", cell: (r) => formatPercent(r.mentionRate), sortValue: (r) => r.mentionRate, hideBelow: "md" },
    { id: "citation", header: "Citation Rate", align: "right", cell: (r) => formatPercent(r.citationRate), sortValue: (r) => r.citationRate, hideBelow: "md" },
    { id: "position", header: "Position", align: "right", cell: (r) => (r.position != null ? `#${r.position.toFixed(1)}` : "—"), sortValue: (r) => r.position, hideBelow: "lg" },
    { id: "sentiment", header: "Sentiment", align: "right", cell: (r) => (r.sentiment != null ? Math.round(r.sentiment) : "—"), sortValue: (r) => r.sentiment, hideBelow: "lg" },
  ];
  return (
    <Panel title="Locations" description="Visibility by tracking market" contentClassName="space-y-4">
      {countries.length ? (
        <>
          <WorldMap values={values} format="percent" label="Visibility" height={320} />
          <DataTable columns={columns} data={countries} getRowId={(r) => r.country} paginate={false} initialSort={{ id: "answers", dir: "desc" }} dense />
        </>
      ) : (
        <EmptyState icon={BarChart3} title="No answers in this period" compact />
      )}
    </Panel>
  );
}

"use client";

import { useMemo, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Download, GitFork, Layers, MessageCircleQuestion, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/page";
import { DataTable, type Column } from "@/components/app/data-table";
import { FilterBar, MultiSelect, PeriodSelect, SearchInput, type Option } from "@/components/app/filters";
import { EngineIcon, EngineStack } from "@/components/app/engine-icon";
import { EmptyState } from "@/components/app/empty-state";
import { Favicon } from "@/components/app/favicon";
import { KpiStrip } from "@/components/app/metrics";
import { StackedBar } from "@/components/app/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUrlListState, useUrlPatch, useUrlState } from "@/hooks/use-url-state";
import { getEngine } from "@/lib/engines";
import { cn } from "@/lib/utils";
import type { FanoutRow, FanoutStats, FollowupRow } from "@/server/ai/insights/fanouts";
import { FANOUT_INTENTS, fanoutIntentInfo } from "@/features/ai-insights/lib/fanout-intents";
import { classifyFanoutsAction } from "@/features/ai-insights/insight-actions";
import { CanExport } from "@/components/app/export-menu";

function day(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const pct = (v: number | null) => (v == null ? "—" : `${Math.round(v)}%`);

const COVERAGE = {
  covered: { label: "Covered", cls: "bg-success/12 text-success", hint: "One of your pages covers this search." },
  partial: { label: "Partial", cls: "bg-warning/15 text-amber-700 dark:text-amber-300", hint: "Your pages cover part of this search." },
  gap: { label: "Gap", cls: "bg-destructive/10 text-destructive", hint: "No page of yours covers this search — a content gap." },
} as const;

const KIND = {
  followup: { label: "Follow-up", hint: "Related question suggested by the engine (e.g. Perplexity)" },
  paa: { label: "People also ask", hint: "People Also Ask box on the Google results page" },
  related: { label: "Related search", hint: "Related searches on the results page" },
} as const;

function IntentBadge({ intent }: { intent: string | null }) {
  const info = fanoutIntentInfo(intent);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
      <span className="size-2 rounded-full" style={{ background: info.color }} />
      {info.label}
    </span>
  );
}

function CoverageBadge({ coverage, url }: { coverage: FanoutRow["coverage"]; url: string | null }) {
  if (!coverage) return <span className="text-xs text-muted-foreground">—</span>;
  const c = COVERAGE[coverage];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", c.cls)}>{c.label}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-72">
        {c.hint}
        {url && <span className="mt-1 block truncate font-mono text-[11px] opacity-80">{url.replace(/^https?:\/\/(www\.)?/, "")}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

function PromptsPopover({ prompts, trackerHref }: { prompts: { id: string; text: string }[]; trackerHref: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="xs" className="tabular">
          {prompts.length} prompt{prompts.length === 1 ? "" : "s"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <ul className="max-h-60 space-y-1 overflow-y-auto">
          {prompts.map((p) => (
            <li key={p.id}>
              <Link href={`${trackerHref}?prompt=${p.id}`} className="line-clamp-2 rounded-md px-2 py-1 text-xs hover:bg-muted">
                {p.text || p.id}
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function Domains({ list }: { list: { domain: string; answers: number }[] }) {
  if (!list.length) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="flex min-w-32 flex-col gap-0.5">
      {list.map((d) => (
        <span key={d.domain} className="flex items-center gap-1.5 text-xs">
          <Favicon domain={d.domain} fallback={d.domain} className="size-3.5" />
          <span className="max-w-36 truncate">{d.domain}</span>
          <span className="text-muted-foreground tabular">{d.answers}</span>
        </span>
      ))}
    </span>
  );
}

export function FanoutsView({
  projectId,
  tab,
  rows,
  followups,
  stats,
  engineOptions,
  canManage,
  period,
  from,
  to,
  backHref,
  trackerHref,
  knowledgeHref,
  exportHref,
}: {
  projectId: string;
  tab: "queries" | "followups";
  rows: FanoutRow[];
  followups: FollowupRow[];
  stats: FanoutStats;
  engineOptions: Option[];
  canManage: boolean;
  period: string;
  from?: string;
  to?: string;
  backHref: string;
  trackerHref: string;
  knowledgeHref: string;
  exportHref: string;
}) {
  const [patch] = useUrlPatch();
  const [q, setQ] = useUrlState("q", "");
  const [models, setModels] = useUrlListState("models");
  const [intents, setIntents] = useUrlListState("searchIntent");
  const [group, setGroup] = useUrlState("group", "");
  const [coverage, setCoverage] = useUrlState("coverage", "");
  const [classifying, startClassify] = useTransition();

  const intentOptions: Option[] = useMemo(
    () => [
      ...FANOUT_INTENTS.map((i) => ({
        value: i,
        label: fanoutIntentInfo(i).label,
        count: stats.intents.find((x) => x.intent === i)?.queries,
        description: fanoutIntentInfo(i).description,
      })),
      ...(stats.unclassified ? [{ value: "unclassified", label: "Unclassified", count: stats.unclassified }] : []),
    ],
    [stats],
  );

  const shown = useMemo(() => (coverage ? rows.filter((r) => (coverage === "unknown" ? !r.coverage : r.coverage === coverage)) : rows), [rows, coverage]);
  const grouped = group === "intent";

  const gapQueries = stats.coverage.find((c) => c.coverage === "gap")?.queries ?? 0;
  const known = stats.coverage.filter((c) => c.coverage !== "unknown").reduce((s, c) => s + c.queries, 0);
  const followupTotal = stats.engines.reduce((s, e) => s + e.followups, 0);

  const classify = () =>
    startClassify(async () => {
      const r = await classifyFanoutsAction(projectId);
      if (!r.ok) toast.error(r.error);
      else toast.success(r.data.queued ? "Classification queued — intents and coverage update in a minute." : "Classification is already running.");
    });

  const columns: Column<FanoutRow>[] = [
    {
      id: "query",
      header: "Fan-out query",
      sticky: true,
      cell: (r) => (
        <span className="block min-w-[200px] max-w-md">
          <span className="line-clamp-2 text-sm font-medium">{r.query}</span>
          <span className="text-[11px] text-muted-foreground tabular">{r.wordCount} words</span>
        </span>
      ),
      sortValue: (r) => r.query,
    },
    { id: "intent", header: "Intent", cell: (r) => <IntentBadge intent={r.intent} />, sortValue: (r) => r.intent ?? "~", hideBelow: "sm" },
    { id: "frequency", header: "Frequency", align: "right", cell: (r) => `${r.frequency}×`, sortValue: (r) => r.frequency },
    {
      id: "mentioned",
      header: "Brand named",
      hint: "Share of answers that ran this search and name your brand",
      align: "right",
      cell: (r) => <span className="tabular">{pct(r.brandMentionedPct)}</span>,
      sortValue: (r) => r.brandMentionedPct,
      hideBelow: "md",
    },
    {
      id: "cited",
      header: "You cited",
      hint: "Share of answers that ran this search and cite one of your pages",
      align: "right",
      cell: (r) => <span className="tabular">{pct(r.ownCitedPct)}</span>,
      sortValue: (r) => r.ownCitedPct,
      hideBelow: "md",
    },
    { id: "domains", header: "Top cited domains", cell: (r) => <Domains list={r.topDomains} />, hideBelow: "lg" },
    { id: "coverage", header: "Coverage", cell: (r) => <CoverageBadge coverage={r.coverage} url={r.coverageUrl} />, sortValue: (r) => r.coverage ?? "~", hideBelow: "sm" },
    { id: "engines", header: "Models", cell: (r) => <EngineStack ids={r.engines} max={4} />, hideBelow: "xl" },
    { id: "prompts", header: "Prompts", align: "right", sortValue: (r) => r.prompts.length, cell: (r) => <PromptsPopover prompts={r.prompts} trackerHref={trackerHref} />, hideBelow: "md" },
    { id: "last", header: "Last seen", cell: (r) => <span className="whitespace-nowrap text-xs">{day(r.lastSeen)}</span>, sortValue: (r) => r.lastSeen, hideBelow: "lg" },
  ];

  const followupColumns: Column<FollowupRow>[] = [
    {
      id: "question",
      header: "Question",
      sticky: true,
      cell: (r) => <span className="line-clamp-2 min-w-[220px] max-w-lg text-sm font-medium">{r.question}</span>,
      sortValue: (r) => r.question,
    },
    {
      id: "kind",
      header: "Type",
      sortValue: (r) => r.kind,
      cell: (r) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="whitespace-nowrap">
              {KIND[r.kind].label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{KIND[r.kind].hint}</TooltipContent>
        </Tooltip>
      ),
      hideBelow: "sm",
    },
    { id: "frequency", header: "Frequency", align: "right", cell: (r) => `${r.frequency}×`, sortValue: (r) => r.frequency },
    { id: "engines", header: "Models", cell: (r) => <EngineStack ids={r.engines} max={4} />, hideBelow: "md" },
    { id: "prompts", header: "Prompts", align: "right", sortValue: (r) => r.prompts.length, cell: (r) => <PromptsPopover prompts={r.prompts} trackerHref={trackerHref} />, hideBelow: "md" },
    { id: "last", header: "Last seen", cell: (r) => <span className="whitespace-nowrap text-xs">{day(r.lastSeen)}</span>, sortValue: (r) => r.lastSeen, hideBelow: "lg" },
  ];

  const activeFilters = models.length + intents.length + (coverage ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to tracker" className="mt-0.5">
          <Link href={backHref}>
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Query Fanouts</h1>
          <p className="text-sm text-muted-foreground">The searches AI models ran behind the scenes while answering your tracked prompts — and the follow-up questions they suggest.</p>
        </div>
        {canManage && stats.totalQueries > 0 && (
          <Button variant="outline" size="sm" onClick={classify} disabled={classifying} aria-label={stats.unclassified ? "Classify fan-out queries" : "Refresh coverage"}>
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">{stats.unclassified ? `Classify ${stats.unclassified}` : "Refresh coverage"}</span>
          </Button>
        )}
      </div>

      <KpiStrip
        items={[
          { key: "q", label: "Unique queries", value: stats.totalQueries.toLocaleString(), sub: `${stats.totalOccurrences.toLocaleString()} searches` },
          { key: "a", label: "Answers with fan-outs", value: stats.answersWithFanouts.toLocaleString() },
          { key: "w", label: "Avg. query length", value: stats.avgWords == null ? "—" : `${stats.avgWords.toFixed(1)} words` },
          {
            key: "gap",
            label: "Coverage gaps",
            value: known ? `${Math.round((gapQueries / known) * 100)}%` : "—",
            sub: known ? `${gapQueries} of ${known} queries` : "No own pages to compare",
            hint: "Queries no page of yours covers (compared with your sitemap in Brand Knowledge, your cited pages and your product catalog).",
          },
          { key: "f", label: "Follow-up questions", value: followupTotal.toLocaleString() },
        ]}
      />

      {stats.totalQueries > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Search intent" description="What engines look for while answering" contentClassName="space-y-3">
            <StackedBar
              height={10}
              parts={stats.intents.map((i) => ({ key: i.intent, value: i.queries, color: fanoutIntentInfo(i.intent).color, label: fanoutIntentInfo(i.intent).label }))}
            />
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {stats.intents.map((i) => (
                <li key={i.intent}>
                  <button
                    type="button"
                    onClick={() => setIntents(intents.includes(i.intent) ? intents.filter((x) => x !== i.intent) : [...intents, i.intent])}
                    className={cn("flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-xs hover:bg-muted", intents.includes(i.intent) && "bg-muted font-medium")}
                  >
                    <span className="size-2 shrink-0 rounded-full" style={{ background: fanoutIntentInfo(i.intent).color }} />
                    <span className="min-w-0 flex-1 truncate">{fanoutIntentInfo(i.intent).label}</span>
                    <span className="text-muted-foreground tabular">{i.queries}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Query length" description="Distinct queries by number of words">
            <ul className="space-y-2">
              {stats.lengths.map((l) => {
                const max = Math.max(1, ...stats.lengths.map((x) => x.queries));
                return (
                  <li key={l.bucket} className="flex items-center gap-2 text-xs">
                    <span className="w-12 shrink-0 text-muted-foreground tabular">{l.bucket}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-chart-1" style={{ width: `${(l.queries / max) * 100}%` }} />
                    </span>
                    <span className="w-8 text-right tabular">{l.queries}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <Panel title="By model" description="Fan-outs per answer, length and follow-ups" contentClassName="p-2 sm:p-3">
            <ul className="divide-y text-xs">
              {stats.engines.map((e) => (
                <li key={e.engine} className="flex items-center gap-2 px-1.5 py-1.5">
                  <EngineIcon id={e.engine} size="xs" withTooltip={false} />
                  <span className="min-w-0 flex-1 truncate font-medium">{getEngine(e.engine)?.name ?? e.engine}</span>
                  <span className="text-muted-foreground tabular" title="Fan-out searches per answer">
                    {e.perAnswer.toFixed(1)}/ans
                  </span>
                  <span className="w-14 text-right text-muted-foreground tabular" title="Average words per query">
                    {e.avgWords == null ? "—" : `${e.avgWords.toFixed(1)} w`}
                  </span>
                  <span className="w-12 text-right tabular" title="Follow-up questions">
                    {e.followups.toLocaleString()}
                  </span>
                </li>
              ))}
              {!stats.engines.length && <li className="px-1.5 py-2 text-muted-foreground">No data yet.</li>}
            </ul>
          </Panel>
        </div>
      )}

      <Panel contentClassName="space-y-3">
        <div className="-mx-1 flex items-center gap-1 border-b pb-2 text-sm">
          {(
            [
              { k: "queries", label: "Fan-out queries", icon: GitFork },
              { k: "followups", label: "Follow-up questions", icon: MessageCircleQuestion },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => patch({ tab: t.k === "queries" ? null : t.k })}
              className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5", tab === t.k ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}
            >
              <t.icon className="size-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <FilterBar
          activeCount={activeFilters}
          search={<SearchInput value={q} onChange={(v) => setQ(v || null)} placeholder={tab === "queries" ? "Search fan-out queries…" : "Search questions…"} />}
          right={
            <>
              {tab === "queries" && (
                <Button size="sm" variant={grouped ? "secondary" : "outline"} onClick={() => setGroup(grouped ? null : "intent")} aria-pressed={grouped}>
                  <Layers /> <span className="hidden sm:inline">Group by intent</span>
                </Button>
              )}
              <CanExport>
                <Button asChild size="sm" variant="outline">
                  <a href={exportHref}>
                    <Download /> <span className="hidden sm:inline">CSV</span>
                  </a>
                </Button>
              </CanExport>
            </>
          }
        >
          <PeriodSelect
            value={period}
            from={from}
            to={to}
            onChange={(p) => patch({ period: p === "90d" ? null : p, from: null, to: null })}
            onCustom={(r) => patch({ period: "custom", from: r.from, to: r.to })}
          />
          <MultiSelect options={engineOptions} value={models} onChange={setModels} placeholder="All models" label="Models" />
          {tab === "queries" && (
            <>
              <MultiSelect options={intentOptions} value={intents} onChange={setIntents} placeholder="All intents" label="Intent" />
              <MultiSelect
                single
                searchable={false}
                options={[
                  { value: "gap", label: "Gap" },
                  { value: "partial", label: "Partial" },
                  { value: "covered", label: "Covered" },
                  { value: "unknown", label: "Not checked" },
                ]}
                value={coverage ? [coverage] : []}
                onChange={(v) => setCoverage(v[0] ?? null)}
                placeholder="Any coverage"
                label="Coverage"
              />
            </>
          )}
        </FilterBar>
        {tab === "queries" && stats.totalQueries > 0 && !known && (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Coverage compares each query with your own pages. Analyze your sitemap in{" "}
            <Link href={knowledgeHref} className="font-medium text-foreground underline-offset-2 hover:underline">
              Brand Knowledge
            </Link>{" "}
            (or connect your product catalog) to see content gaps.
          </p>
        )}

        {tab === "queries" ? (
          <DataTable
            key={grouped ? "grouped" : "flat"}
            columns={columns}
            data={shown}
            getRowId={(r) => r.query.toLowerCase()}
            initialSort={{ id: "frequency", dir: "desc" }}
            pageSize={50}
            groupBy={grouped ? (r) => r.intent ?? "unclassified" : undefined}
            renderGroupHeader={
              grouped
                ? (g, list, open, toggle) => (
                    <button type="button" onClick={toggle} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium">
                      <span className="size-2.5 rounded-full" style={{ background: fanoutIntentInfo(g).color }} />
                      {fanoutIntentInfo(g).label}
                      <span className="text-xs font-normal text-muted-foreground tabular">
                        {list.length} queries · {list.reduce((s, r) => s + r.frequency, 0)} searches
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">{open ? "Hide" : "Show"}</span>
                    </button>
                  )
                : undefined
            }
            mobileCard={(r) => (
              <div className="space-y-1.5">
                <div className="text-sm font-medium">{r.query}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <IntentBadge intent={r.intent} />
                  <CoverageBadge coverage={r.coverage} url={r.coverageUrl} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <EngineStack ids={r.engines} max={5} />
                  <span className="tabular">
                    {r.frequency}× · named {pct(r.brandMentionedPct)} · cited {pct(r.ownCitedPct)}
                  </span>
                </div>
              </div>
            )}
            empty={
              <EmptyState
                icon={GitFork}
                title={q || activeFilters ? "No fan-out queries match your filters" : "No fan-out queries yet"}
                description={
                  q || activeFilters
                    ? "Try another search term or clear the filters."
                    : "Fan-out queries are captured from engines that expose them (ChatGPT, Perplexity, Gemini and others via DataForSEO or API keys). They appear after the next tracking run."
                }
                compact
              />
            }
          />
        ) : (
          <DataTable
            columns={followupColumns}
            data={followups}
            getRowId={(r) => r.question.toLowerCase()}
            initialSort={{ id: "frequency", dir: "desc" }}
            pageSize={50}
            mobileCard={(r) => (
              <div className="space-y-1.5">
                <div className="text-sm font-medium">{r.question}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{KIND[r.kind].label}</span>
                  <span className="tabular">
                    {r.frequency}× · {day(r.lastSeen)}
                  </span>
                </div>
              </div>
            )}
            empty={
              <EmptyState
                icon={MessageCircleQuestion}
                title={q ? "No questions match your search" : "No follow-up questions yet"}
                description={
                  q
                    ? "Try another search term."
                    : "Follow-up questions come from Perplexity (related questions, with a Perplexity Sonar model in Admin → AI Providers) and Google results pages (People Also Ask, related searches via DataForSEO)."
                }
                compact
              />
            }
          />
        )}
      </Panel>
    </div>
  );
}

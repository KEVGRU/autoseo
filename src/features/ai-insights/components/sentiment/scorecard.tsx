"use client";

import { Gauge } from "lucide-react";
import { Panel } from "@/components/app/page";
import { KpiStrip, Delta } from "@/components/app/metrics";
import { EngineIcon } from "@/components/app/engine-icon";
import { EmptyState } from "@/components/app/empty-state";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getEngine } from "@/lib/engines";
import { cn } from "@/lib/utils";
import type { Scorecard } from "@/server/ai/insights/sentiment";
import { ASPECT_INFO, type SentimentAspect } from "../../lib/aspects";
import type { BrandDTO } from "../../types";
import { BrandLabel, SentimentPill } from "../brand";

type Cell = { score: number | null; praise: number; neutral: number; criticism: number };

/** Diverging color: red (0) → neutral (50) → green (100); faded when based on few statements. */
function cellStyle(c: Cell | undefined): React.CSSProperties {
  if (!c || c.score == null) return {};
  const n = c.praise + c.criticism;
  const strength = Math.min(1, Math.abs(c.score - 50) / 50);
  const confidence = n >= 5 ? 1 : n >= 2 ? 0.7 : 0.45;
  const pct = Math.round((14 + strength * 62) * confidence);
  const color = c.score >= 50 ? "var(--success)" : "var(--destructive)";
  return { background: `color-mix(in oklch, ${color} ${pct}%, transparent)` };
}

function ScoreCell({ c, label }: { c: Cell | undefined; label: string }) {
  if (!c || (c.score == null && !c.neutral)) return <span className="flex h-9 items-center justify-center text-xs text-muted-foreground">—</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex h-9 w-full items-center justify-center rounded-md text-xs font-semibold tabular" style={cellStyle(c)}>
          {c.score == null ? "·" : Math.round(c.score)}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="font-medium">{label}</div>
        <div className="tabular">
          {c.praise} praise · {c.neutral} neutral · {c.criticism} criticism
        </div>
        {c.score != null && <div className="text-[11px] opacity-80">Score = praise ÷ (praise + criticism)</div>}
      </TooltipContent>
    </Tooltip>
  );
}

function HeatTable({
  rows,
  cols,
  get,
  corner,
}: {
  rows: { key: string; label: React.ReactNode; name: string }[];
  cols: { key: string; label: React.ReactNode; name: string }[];
  get: (row: string, col: string) => Cell | undefined;
  corner: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/60 text-xs text-muted-foreground">
            <th className="sticky left-0 z-10 bg-muted px-3 py-2.5 text-left font-normal">{corner}</th>
            {cols.map((c) => (
              <th key={c.key} className="min-w-20 px-1.5 py-2.5 text-center font-normal">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t">
              <td className="sticky left-0 z-10 bg-card px-3 py-1.5">{r.label}</td>
              {cols.map((c) => (
                <td key={c.key} className="p-0.5">
                  <ScoreCell c={get(r.key, c.key)} label={`${r.name} · ${c.name}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScorecardView({ data, own, brands }: { data: Scorecard; own: BrandDTO; brands: BrandDTO[] }) {
  const byKey = new Map(brands.map((b) => [b.key, b]));
  const name = (k: string | null) => (k ? (byKey.get(k)?.name ?? k) : "—");
  const o = data.own;
  const hasData = data.brands.length > 0;

  if (!hasData)
    return (
      <Panel>
        <EmptyState
          icon={Gauge}
          title="No scorecard data in this period"
          description="The scorecard groups praise and criticism statements from AI answers into fixed aspects (quality, price, value, performance…). Statements are extracted by the analysis pass — connect an AI provider in Admin → AI Providers so new answers are analyzed."
        />
      </Panel>
    );

  const brandRows = data.brands.map((k) => {
    const b = byKey.get(k);
    return { key: k, name: b?.name ?? k, label: <BrandLabel name={b?.name ?? k} domain={b?.domain} isOwn={b?.isOwn} className="min-w-32" /> };
  });
  const aspectCols = data.aspects
    .filter((a) => data.brands.some((b) => data.cells[b]?.[a]))
    .map((a) => ({ key: a, name: ASPECT_INFO[a].label, label: ASPECT_INFO[a].label }));
  const engineCols = data.engines.map((e) => ({
    key: e,
    name: getEngine(e)?.name ?? e,
    label: (
      <span className="inline-flex flex-col items-center gap-1">
        <EngineIcon id={e} size="xs" withTooltip={false} />
        <span className="max-w-20 truncate">{getEngine(e)?.shortName ?? e}</span>
      </span>
    ),
  }));
  const aspectLabel = (a: SentimentAspect) => ASPECT_INFO[a].label;

  return (
    <div className="space-y-4 sm:space-y-5">
      <KpiStrip
        items={[
          {
            key: "overall",
            label: `${own.name} aspect score`,
            value: o.overall == null ? "—" : Math.round(o.overall),
            delta: o.overallDelta,
            hint: "Praise ÷ (praise + criticism) over all statements about you that carry a scorecard aspect.",
            sub: `${o.classified.toLocaleString()} statements`,
          },
          { key: "strong", label: "Strongest aspect", value: o.strongest ? aspectLabel(o.strongest.aspect) : "—", sub: o.strongest ? `score ${Math.round(o.strongest.score)}` : undefined },
          { key: "weak", label: "Weakest aspect", value: o.weakest ? aspectLabel(o.weakest.aspect) : "—", sub: o.weakest ? `score ${Math.round(o.weakest.score)}` : undefined },
          {
            key: "gap",
            label: "Biggest gap",
            value: o.biggestGap ? aspectLabel(o.biggestGap.aspect) : "—",
            sub: o.biggestGap ? `${name(o.biggestGap.leader)} leads ${Math.round(o.biggestGap.leaderScore)} vs ${Math.round(o.biggestGap.score)}` : "You lead or tie everywhere",
          },
        ]}
      />

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel title="Your aspects" description="Score, change vs previous period and rank among tracked brands" contentClassName="p-2 sm:p-3">
          <ul className="divide-y">
            {data.ownAspects.map((a) => (
              <li key={a.aspect} className="flex items-center gap-3 px-2 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {aspectLabel(a.aspect)}
                    {a.rank != null && a.ranked > 1 && (
                      <span className={cn("text-[11px] font-normal tabular", a.rank === 1 ? "text-success" : "text-muted-foreground")}>
                        #{a.rank} of {a.ranked}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {a.praise + a.neutral + a.criticism
                      ? `${a.praise} praise · ${a.criticism} criticism${a.leader && a.leader !== own.key ? ` · leader ${name(a.leader)}` : ""}`
                      : ASPECT_INFO[a.aspect].description}
                  </div>
                </div>
                <Delta value={a.delta} digits={0} showZero={false} />
                <SentimentPill score={a.score} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Brand × aspect"
          description="Aspect score per brand — green = mostly praised, red = mostly criticised (faded = few statements)"
          contentClassName="space-y-3"
        >
          {aspectCols.length ? (
            <HeatTable rows={brandRows} cols={aspectCols} get={(r, c) => data.cells[r]?.[c as SentimentAspect]} corner="Brand × Aspect" />
          ) : (
            <EmptyState compact title="No aspect-labelled statements yet" description="Aspects are assigned to new statements by the analysis pass." />
          )}
          {o.unclassified > 0 && (
            <p className="text-xs text-muted-foreground">
              {o.unclassified.toLocaleString()} statement{o.unclassified === 1 ? "" : "s"} about {own.name} fit none of the scorecard aspects and are not counted.
            </p>
          )}
        </Panel>
      </div>

      <Panel title="Brand × model" description="Overall praise share per AI model (all statements about the brand)">
        {engineCols.length ? (
          <HeatTable rows={brandRows} cols={engineCols} get={(r, c) => data.engineCells[r]?.[c]} corner="Brand × Model" />
        ) : (
          <EmptyState compact title="No statements in this period" />
        )}
      </Panel>
    </div>
  );
}

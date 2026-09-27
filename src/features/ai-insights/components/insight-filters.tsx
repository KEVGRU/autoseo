"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { MultiSelect, PeriodSelect, TagFilter, FilterBar } from "@/components/app/filters";
import { EngineIcon } from "@/components/app/engine-icon";
import { useUrlPatch } from "@/hooks/use-url-state";
import { flagEmoji, getCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { parseBrandScope } from "../lib/metrics";
import type { FilterOptionsDTO } from "../types";
import { BrandScopeToggle } from "./brand-scope-toggle";
import { SimulatedToggle } from "./simulated-toggle";

export const INSIGHT_PERIODS = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
];

/**
 * Period / model / tag filters shared by all AI insight pages. Changes go to the URL and re-run
 * the server queries.
 */
export function InsightFilters({
  options,
  search,
  right,
  children,
  models = true,
  tags = true,
  markets = true,
  brandScope = false,
  className,
  defaultPeriod = "30d",
}: {
  options: FilterOptionsDTO;
  search?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  models?: boolean;
  tags?: boolean;
  /** Market (answer country) filter — shown when the project tracks more than one market. */
  markets?: boolean;
  /** Tracked brands vs all brands toggle (pages that show Position / Share of Voice). */
  brandScope?: boolean;
  className?: string;
  defaultPeriod?: string;
}) {
  const params = useSearchParams();
  const [patch, pending] = useUrlPatch();
  const period = params.get("period") ?? defaultPeriod;
  const modelList = (params.get("models") ?? "").split(",").filter(Boolean);
  const tagList = (params.get("tags") ?? "").split(",").filter(Boolean);
  const marketList = (params.get("markets") ?? "").split(",").filter(Boolean);
  const scope = parseBrandScope(params.get("brands"));
  const excludeSimulated = params.get("simulated") === "exclude";
  const simulatedCount = options.simulatedAnswers ?? 0;
  const marketOptions = options.markets ?? [];
  const active =
    (period !== defaultPeriod ? 1 : 0) + (modelList.length ? 1 : 0) + (tagList.length ? 1 : 0) + (marketList.length ? 1 : 0) + (brandScope && scope === "all" ? 1 : 0) + (excludeSimulated ? 1 : 0);

  return (
    <FilterBar
      className={className}
      search={search}
      activeCount={active}
      right={
        <>
          {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Loading" />}
          {brandScope && <BrandScopeToggle value={scope} onChange={(v) => patch({ brands: v === "all" ? "all" : null })} />}
          {right}
        </>
      }
    >
      <PeriodSelect
        value={period}
        presets={INSIGHT_PERIODS}
        from={params.get("from") ?? undefined}
        to={params.get("to") ?? undefined}
        onChange={(p) => patch({ period: p === defaultPeriod ? null : p, from: null, to: null })}
        onCustom={({ from, to }) => patch({ period: "custom", from, to })}
      />
      {models && (
        <MultiSelect
          options={options.engines.map((e) => ({ ...e, icon: <EngineIcon id={e.value} size="xs" withTooltip={false} /> }))}
          value={modelList}
          onChange={(v) => patch({ models: v.length ? v.join(",") : null })}
          placeholder="All Models"
          label="Models"
          className={cn("min-w-32")}
        />
      )}
      {markets && marketOptions.length > 1 && (
        <MultiSelect
          options={marketOptions.map((m) => ({ value: m, label: getCountry(m)?.name ?? m, icon: <span>{flagEmoji(m)}</span> }))}
          value={marketList}
          onChange={(v) => patch({ markets: v.length ? v.join(",") : null })}
          placeholder="All Markets"
          label="Markets"
          className="min-w-32"
        />
      )}
      {(simulatedCount > 0 || excludeSimulated) && (
        <SimulatedToggle exclude={excludeSimulated} count={simulatedCount} onChange={(v) => patch({ simulated: v ? "exclude" : null })} />
      )}
      {tags && options.tags.length > 0 && (
        <TagFilter
          options={options.tags.map((t) => ({ value: t.value, label: t.label }))}
          value={tagList}
          onChange={(v) => patch({ tags: v.length ? v.join(",") : null })}
          className="min-w-28"
        />
      )}
      {children}
    </FilterBar>
  );
}

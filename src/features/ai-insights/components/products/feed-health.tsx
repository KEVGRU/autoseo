"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, HeartPulse } from "lucide-react";
import { Panel } from "@/components/app/page";
import { ScoreRing } from "@/components/app/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FeedHealth } from "@/server/ai/knowledge/products";
import { getFeedHealthAction } from "../../insight-actions";

/**
 * Catalog feed health (Brand Knowledge → Products): completeness of the fields AI shopping
 * surfaces rely on (price, GTIN, availability, image), duplicates and AI matches.
 */
export function FeedHealthPanel({ projectId, refreshKey }: { projectId: string; refreshKey?: string | number }) {
  const key = `${projectId}|${refreshKey ?? ""}`;
  const [state, setState] = useState<{ key: string; data: FeedHealth | null; error: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFeedHealthAction(projectId).then((r) => {
      if (!cancelled) setState({ key, data: r.ok ? r.data : null, error: r.ok ? null : r.error });
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, key]);

  const current = state?.key === key ? state : null;
  const h = current?.data ?? null;

  return (
    <Panel
      title="Feed health"
      icon={<HeartPulse className="size-4 text-muted-foreground" />}
      description="Data quality of your catalog — AI shopping answers quote price, availability and images from feeds like this."
    >
      {current?.error && <p className="rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">{current.error}</p>}
      {!current && (
        <div className="flex gap-4">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}
      {h && h.total === 0 && <p className="text-sm text-muted-foreground">No catalog products yet.</p>}
      {h && h.total > 0 && (
        <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex flex-row items-center gap-4 md:flex-col md:items-center">
            <ScoreRing
              value={h.score}
              size={104}
              label="Health"
              color={h.score >= 85 ? "var(--success)" : h.score >= 60 ? "var(--warning)" : "var(--destructive)"}
            />
            <div className="text-xs text-muted-foreground md:text-center">
              <div className="tabular">{h.total.toLocaleString()} products</div>
              <div className="tabular">{h.matchedInAi.toLocaleString()} matched in AI answers</div>
            </div>
          </div>
          <div className="space-y-3">
            <ul className="grid gap-2 sm:grid-cols-2">
              {h.issues.map((i) => {
                const share = h.total ? (i.count / h.total) * 100 : 0;
                const ok = i.count === 0;
                return (
                  <li key={i.key} className="rounded-lg border px-3 py-2">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-1.5 font-medium">
                        {ok ? <CheckCircle2 className="size-3.5 text-success" /> : <AlertTriangle className={cn("size-3.5", share >= 20 ? "text-destructive" : "text-warning")} />}
                        {i.label}
                      </span>
                      <span className="text-xs tabular">
                        {i.count.toLocaleString()} <span className="text-muted-foreground">({share.toFixed(0)}%)</span>
                      </span>
                    </div>
                    {i.examples.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">e.g. {i.examples.join(", ")}</p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-80">{i.examples.join(" · ")}</TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
            {h.duplicates.length > 0 ? (
              <div className="rounded-lg border px-3 py-2">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Copy className="size-3.5 text-warning" /> Duplicates
                  <span className="text-xs font-normal text-muted-foreground">
                    {h.duplicates.length} group{h.duplicates.length === 1 ? "" : "s"} share a name, URL or GTIN
                  </span>
                </div>
                <ul className="mt-1.5 max-h-40 space-y-1 overflow-y-auto">
                  {h.duplicates.slice(0, 20).map((d) => (
                    <li key={`${d.kind}:${d.value}`} className="flex items-center gap-2 text-xs">
                      <span className="w-10 shrink-0 text-muted-foreground uppercase">{d.kind}</span>
                      <span className="min-w-0 flex-1 truncate" title={d.names.join(" · ")}>
                        {d.value}
                      </span>
                      <span className="tabular">{d.count}×</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-success" /> No duplicate names, URLs or GTINs.
              </p>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

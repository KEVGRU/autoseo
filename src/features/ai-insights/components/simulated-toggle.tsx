"use client";

import { FlaskConical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Include / exclude answers of the AI simulation (engines without a real backend, provider "ai",
 * shown as "Simulated"). The badge counts the simulated answers in the current period even while
 * they are excluded. Controlled; callers persist `simulated=exclude` in the URL (default include).
 */
export function SimulatedToggle({ exclude, count, onChange, className }: { exclude: boolean; count: number; onChange: (exclude: boolean) => void; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-pressed={exclude}
          onClick={() => onChange(!exclude)}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs whitespace-nowrap transition-colors",
            exclude ? "border-foreground/20 bg-muted font-medium text-foreground" : "bg-background text-muted-foreground hover:text-foreground",
            className,
          )}
        >
          <FlaskConical className="size-3.5" />
          <span className={cn(exclude && "line-through decoration-foreground/40")}>Simulated</span>
          <span className="rounded-full bg-warning/15 px-1.5 text-[10px] font-medium text-warning tabular">{count.toLocaleString("en-US")}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72">
        {count.toLocaleString("en-US")} answer{count === 1 ? "" : "s"} in this period come from AI simulation (a model with web search imitating an engine that has no
        live backend) — directional only. {exclude ? "Currently excluded from all numbers; click to include them." : "Click to exclude them from all numbers."}
      </TooltipContent>
    </Tooltip>
  );
}

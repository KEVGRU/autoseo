"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BRAND_SCOPES, type BrandScope } from "../lib/metrics";

/**
 * Tracked set vs all brands (finseo "competitor set"): Position, Share of Voice and #1 / Top-3
 * share are computed among your brand + competitor list, or among every brand AI names.
 * Controlled; callers persist the value in the URL (`brands=all`, default tracked).
 */
export function BrandScopeToggle({ value, onChange, className }: { value: BrandScope; onChange: (v: BrandScope) => void; className?: string }) {
  return (
    <div role="radiogroup" aria-label="Brand set for position and share of voice" className={cn("flex shrink-0 rounded-lg bg-muted p-0.5 text-xs", className)}>
      {BRAND_SCOPES.map((s) => (
        <Tooltip key={s.value}>
          <TooltipTrigger asChild>
            <button
              type="button"
              role="radio"
              aria-checked={value === s.value}
              aria-label={s.label}
              onClick={() => onChange(s.value)}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium whitespace-nowrap transition-colors",
                value === s.value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="sm:hidden">{s.short}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{s.hint}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

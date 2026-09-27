"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type SourceBadgeProps = {
  /** "ai" renders the amber "AI estimate" pill; "dataforseo" renders nothing unless `showMeasured`. */
  source: "ai" | "dataforseo" | null | undefined;
  confidence?: "low" | "medium" | "high" | null;
  /** Model that produced the estimate. */
  model?: string | null;
  /** When the estimate was produced (ISO string or Date). */
  at?: string | Date | null;
  /** Replaces the default label ("AI estimate"), e.g. "AI sample" for backlinks. */
  label?: string;
  /** Extra sentence shown in the tooltip (what is estimated / missing). */
  detail?: string;
  /** Link the admin to Admin → Data Providers from the tooltip. */
  isAdmin?: boolean;
  /** Also render a subtle "Measured" pill for DataForSEO data. */
  showMeasured?: boolean;
  className?: string;
};

function formatDate(at: string | Date | null | undefined): string | null {
  if (!at) return null;
  const d = typeof at === "string" ? new Date(at) : at;
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

const CONFIDENCE_LABEL = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
} as const;

/**
 * Labels data that was estimated by an AI model with web search instead of measured by DataForSEO.
 * Every AI-enriched number in the UI should sit next to one of these.
 */
export function SourceBadge({ source, confidence, model, at, label, detail, isAdmin, showMeasured, className }: SourceBadgeProps) {
  if (source !== "ai") {
    if (!showMeasured || source !== "dataforseo") return null;
    return (
      <span className={cn("inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium text-muted-foreground", className)}>Measured</span>
    );
  }
  const date = formatDate(at);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            "inline-flex h-5 shrink-0 cursor-help items-center gap-1 rounded-full border border-warning/40 bg-warning/15 px-2 text-[10px] font-medium whitespace-nowrap text-amber-700 outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-amber-300",
            className,
          )}
        >
          <Sparkles className="size-3" />
          {label ?? "AI estimate"}
          {confidence && <span className="font-normal opacity-80">· {confidence}</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 space-y-1 text-xs leading-relaxed">
        <p>
          Estimated by {model ? <span className="font-medium">{model}</span> : "an AI model"} with web search{date ? ` on ${date}` : ""}.
          {confidence ? ` ${CONFIDENCE_LABEL[confidence]}.` : ""}
        </p>
        {detail && <p>{detail}</p>}
        <p className="opacity-80">
          Connect DataForSEO for measured data
          {isAdmin ? (
            <>
              {" "}
              in{" "}
              <Link href="/admin/data" className="underline underline-offset-2">
                Admin → Data Providers
              </Link>
            </>
          ) : null}
          .
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

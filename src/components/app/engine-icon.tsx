import { FlaskConical } from "lucide-react";
import { getEngine } from "@/lib/engines";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Simplified, original glyphs for each AI engine (no third-party logo assets). */
function Glyph({ id }: { id: string }) {
  switch (id) {
    case "chatgpt":
    case "chatgpt_gui":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="12" cy="12" rx="3.2" ry="7.6" transform={`rotate(${a} 12 12)`} />
          ))}
        </svg>
      );
    case "perplexity":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M12 3v18M5 7l7 5 7-5M5 7v9l7-4 7 4V7M8 21v-6M16 21v-6" />
        </svg>
      );
    case "ai_overview":
    case "google_ai_mode":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z" />
          <circle cx="19" cy="19" r="2.4" />
        </svg>
      );
    case "gemini":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5z" />
        </svg>
      );
    case "claude":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <line key={a} x1="12" y1="3" x2="12" y2="21" transform={`rotate(${a} 12 12)`} />
          ))}
        </svg>
      );
    case "copilot":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 4h6.5a3 3 0 0 1 2.8 2l3.2 9.5A3 3 0 0 1 17.7 20H9.5a3 3 0 0 1-2.8-2L3.5 8.5A3 3 0 0 1 6.3 4z" opacity=".85" />
        </svg>
      );
    case "grok":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M5 19L19 5M9 5h10v10" />
        </svg>
      );
    case "mistral":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 4h4v4H3zM17 4h4v4h-4zM3 8h8v4H3zM13 8h8v4h-8zM3 12h18v4H3zM3 16h4v4H3zM11 16h2v4h-2zM17 16h4v4h-4z" />
        </svg>
      );
    case "deepseek":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 7c-1 .5-2 .4-2.7-.3C16.4 4.4 13.8 3.3 11 3.6 6.4 4.1 3 8.1 3.3 12.7 3.6 17.1 7.3 20.6 11.8 20.5c3.2-.1 6-1.9 7.4-4.7.3-.6.9-.9 1.5-.7-.4-2-.2-4.2.3-6.1zM9 11a1.3 1.3 0 1 1 0-2.6A1.3 1.3 0 0 1 9 11z" />
        </svg>
      );
    case "meta_ai":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );
    case "qwen":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
          <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />
          <path d="M12 8.2l3.3 1.9v3.8L12 15.8l-3.3-1.9v-3.8zM15.3 13.9L19.8 16.5" />
        </svg>
      );
    case "kimi":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4v16M6 13l8-9M9.5 9.8L16 20" />
          <circle cx="18.5" cy="6" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "sabia":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 14.5c2.6-6.2 7.9-9.4 14.6-8.9l2.4-2.1-.6 3.4c.4 5.8-3.6 10.4-9.7 10.9L7 21l.6-3.7c-1.5-.4-2.7-1.4-3.6-2.8zm12.2-5.1a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z" />
        </svg>
      );
    case "solar":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.8" x2="12" y2="5.2" transform={`rotate(${a} 12 12)`} />
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="7" />
        </svg>
      );
  }
}

export function EngineIcon({
  id,
  size = "sm",
  className,
  withTooltip = true,
  active = true,
}: {
  id: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  withTooltip?: boolean;
  active?: boolean;
}) {
  const engine = getEngine(id);
  const dim = { xs: "size-4 p-[2px] rounded-[4px]", sm: "size-5 p-[3px] rounded-md", md: "size-7 p-1.5 rounded-lg", lg: "size-9 p-2 rounded-xl" }[size];
  const node = (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center text-white shadow-xs [&>svg]:size-full", dim, !active && "opacity-35 grayscale", className)}
      style={{ background: engine?.color ?? "#666" }}
      aria-label={engine?.name ?? id}
    >
      <Glyph id={id} />
    </span>
  );
  if (!withTooltip) return node;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent>{engine?.name ?? id}</TooltipContent>
    </Tooltip>
  );
}

export function EngineStack({ ids, max = 4, size = "xs" }: { ids: string[]; max?: number; size?: "xs" | "sm" }) {
  const shown = ids.slice(0, max);
  return (
    <span className="inline-flex items-center gap-0.5">
      {shown.map((id) => (
        <EngineIcon key={id} id={id} size={size} />
      ))}
      {ids.length > max && <span className="ml-0.5 text-[10px] text-muted-foreground">+{ids.length - max}</span>}
    </span>
  );
}

/**
 * Marks an answer / engine that comes from the AI simulation (provider "ai"): an AI model with web
 * search imitated the engine because no live connection is configured.
 */
export function SimulatedBadge({ engine, className, compact = false }: { engine?: string; className?: string; compact?: boolean }) {
  const name = engine ? (getEngine(engine)?.name ?? engine) : "this engine";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/15 px-1.5 py-0.5 text-[11px] font-medium text-warning ring-1 ring-inset ring-warning/30",
            className,
          )}
        >
          <FlaskConical className="size-3" />
          {!compact && "Simulated"}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        Simulated: an AI model with web search imitated {name} because no live connection is configured. Directional — not the live product.
      </TooltipContent>
    </Tooltip>
  );
}

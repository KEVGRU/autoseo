import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";
import { AI_VISIBILITY_CHECK } from "@/features/free-tools/lib/registry";
import { cn } from "@/lib/utils";

/** Featured card for the AI Visibility Check on the public and in-app tool hubs (server-compatible). */
export function AiCheckHubCard({ href, surface, className }: { href: string; surface: "public" | "app"; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-soft/80 via-card to-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-row sm:items-center sm:p-6",
        className,
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-background/80 text-brand shadow-xs">
        <Radar className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight sm:text-lg">{AI_VISIBILITY_CHECK.name}</h3>
          <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[11px] font-medium text-brand">
            {surface === "public" ? "Free · no signup · no sales call" : "New · AI engines + readiness"}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{AI_VISIBILITY_CHECK.shortDescription}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium">
        Run the check
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

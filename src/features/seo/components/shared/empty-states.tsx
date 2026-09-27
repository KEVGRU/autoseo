import Link from "next/link";
import { Lock, PlugZap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { Panel } from "@/components/app/page";

type Source = "dataforseo" | "ai" | null;

/**
 * Blocking empty state — shown only when neither DataForSEO nor any AI provider can serve the feature.
 * `reason` is the server's explanation (e.g. "AI enrichment is disabled for this data type").
 */
export function EnrichmentUnavailable({ isAdmin, feature, reason }: { isAdmin: boolean; feature?: string; reason?: string }) {
  return (
    <Panel>
      <EmptyState
        icon={PlugZap}
        title="Connect DataForSEO or an AI provider"
        description={
          <>
            {feature ? `${feature} needs` : "SEO research needs"} a data source: your own DataForSEO account (measured data, pay-as-you-go) or an AI provider —
            a local agent or an API key — for clearly labelled AI estimates.
            {reason ? <span className="mt-1 block text-xs">{reason}</span> : null}
            {isAdmin ? null : <span className="mt-1 block text-xs">Ask an instance admin to connect one in the Admin panel.</span>}
          </>
        }
        action={
          isAdmin ? (
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/admin/data">Connect DataForSEO</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/ai">Add an AI provider</Link>
              </Button>
            </div>
          ) : undefined
        }
      />
    </Panel>
  );
}

/**
 * Slim banner above a feature: AI estimates active (amber) or, for pages that still show stored data, no source at all.
 * Renders nothing when DataForSEO serves the feature.
 */
export function EnrichmentBanner({ source, isAdmin, feature, detail }: { source: Source; isAdmin: boolean; feature?: string; detail?: string }) {
  if (source === "dataforseo") return null;
  if (source === "ai") {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <span>
            <span className="font-medium">AI estimates{feature ? ` for ${feature}` : ""}.</span>{" "}
            <span className="text-muted-foreground">
              DataForSEO isn&apos;t connected, so an AI model with web search estimates this data (URLs are verified; numbers are estimates).
              {detail ? ` ${detail}` : ""}
            </span>
          </span>
        </div>
        {isAdmin ? (
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/admin/data">Connect DataForSEO</Link>
          </Button>
        ) : (
          <span className="shrink-0 text-xs text-muted-foreground">Measured data: Admin → Data Providers</span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <PlugZap className="mt-0.5 size-4 shrink-0 text-warning" />
        <span>
          <span className="font-medium">No data source connected.</span>{" "}
          <span className="text-muted-foreground">Stored data stays visible; new checks and metric refreshes need DataForSEO or an AI provider.</span>
        </span>
      </div>
      {isAdmin ? (
        <div className="flex shrink-0 gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/data">DataForSEO</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/ai">AI provider</Link>
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Ask an admin: Admin → Data Providers</span>
      )}
    </div>
  );
}

export function ReadOnlyNote({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground ${className ?? ""}`}>
      <Lock className="size-3.5" />
      You have read-only access — cached results are shown, but running new paid research requires the “Run paid SEO research” permission.
    </div>
  );
}

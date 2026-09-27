"use client";

import { MessageSquareQuote, Newspaper, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KpiStrip, formatNumber } from "@/components/app/metrics";
import { SourceBadge } from "@/components/app/source-badge";
import type { LocalRunTool } from "@/server/seo/local";
import { num, rec, str, strs } from "./shared";

const SENTIMENT_CLASS: Record<string, string> = {
  positive: "bg-success/12 text-success",
  mixed: "bg-warning/15 text-amber-700 dark:text-amber-300",
  negative: "bg-destructive/10 text-destructive",
};

/**
 * AI-estimated Local SEO runs: the source label for every tool, and — for reviews, Q&A and posts — the AI summary
 * (individual reviews / questions / posts are only available from DataForSEO Business Data).
 */
export function AiLocalSummary({ result, tool, isAdmin }: { result: unknown; tool: LocalRunTool; isAdmin?: boolean }) {
  const r = rec(result);
  const enrichment = rec(r?.enrichment);
  const meta = rec(enrichment?.meta);
  const place = str(r?.place);
  const badge = (
    <SourceBadge
      source="ai"
      model={str(meta?.model)}
      at={str(meta?.generatedAt)}
      confidence={(str(meta?.confidence) as "low" | "medium" | "high" | null) ?? null}
      isAdmin={isAdmin}
      detail={
        tool === "rank_grid"
          ? "Each grid point is reverse-geocoded to its neighbourhood; points in the same area share one estimate."
          : "Listings are what an AI model found via web search for this place — ratings and review counts are as published on the web."
      }
    />
  );
  const summaryTool = tool === "reviews" || tool === "questions" || tool === "posts" || tool === "business_profile";
  if (!summaryTool) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {badge}
        {place && <span>Estimated for {place}</span>}
      </div>
    );
  }
  const summary = rec(r?.aiSummary);
  const reviews = rec(summary?.reviews);
  const totals = rec(r?.totals) ?? rec(r?.profile);
  const rating = rec(totals?.rating);
  const sentiment = str(reviews?.sentiment);
  const positives = strs(reviews?.positives);
  const negatives = strs(reviews?.negatives);
  const qa = str(summary?.questions);
  const posts = str(summary?.posts);

  if (!summary) {
    return (
      <div className="space-y-2">
        {badge}
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          The AI could not identify this business. Check the name and location, or connect DataForSEO for CID / place-ID lookups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {badge}
        <span>Summaries from public web sources — individual {tool === "questions" ? "questions" : tool === "posts" ? "posts" : "reviews"} need DataForSEO.</span>
      </div>

      {(tool === "reviews" || tool === "business_profile") && (
        <>
          {tool === "reviews" && (
            <KpiStrip
              items={[
                { key: "rating", label: "Est. rating", value: num(rating?.value) != null ? num(rating?.value)!.toFixed(1) : "—" },
                {
                  key: "count",
                  label: "Est. reviews",
                  value: num(totals?.reviews_count) != null ? formatNumber(num(totals?.reviews_count), { maximumFractionDigits: 0 }) : "—",
                },
                { key: "sentiment", label: "Sentiment", value: sentiment ? sentiment.charAt(0).toUpperCase() + sentiment.slice(1) : "—" },
              ]}
            />
          )}
          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <MessageSquareQuote className="size-3.5" /> What reviewers say
              {sentiment && (
                <Badge variant="secondary" className={SENTIMENT_CLASS[sentiment] ?? ""}>
                  {sentiment}
                </Badge>
              )}
            </div>
            <p className="text-sm">{str(reviews?.summary) ?? "No review summary found."}</p>
            {(positives.length > 0 || negatives.length > 0) && (
              <div className="grid gap-3 sm:grid-cols-2">
                <ThemeList icon={<ThumbsUp className="size-3.5 text-success" />} title="Praised" items={positives} />
                <ThemeList icon={<ThumbsDown className="size-3.5 text-destructive" />} title="Complaints" items={negatives} />
              </div>
            )}
          </div>
        </>
      )}

      {(tool === "questions" || tool === "business_profile") && (
        <div className="space-y-2 rounded-xl border p-4">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Questions &amp; answers</div>
          <p className="text-sm">{qa ?? "No questions & answers found on public listings."}</p>
        </div>
      )}

      {(tool === "posts" || tool === "business_profile") && (
        <div className="space-y-2 rounded-xl border p-4">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Newspaper className="size-3.5" /> Posts &amp; updates
          </div>
          <p className="text-sm">{posts ?? "No recent posts or updates found."}</p>
        </div>
      )}
    </div>
  );
}

function ThemeList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {icon} {title}
      </div>
      {items.length ? (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {items.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}
    </div>
  );
}

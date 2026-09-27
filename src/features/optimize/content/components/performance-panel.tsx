"use client";

import Link from "next/link";
import { Bot, ExternalLink, MousePointerClick, Quote } from "lucide-react";
import { DataTable, type Column } from "@/components/app/data-table";
import { Panel } from "@/components/app/page";
import { formatNumber } from "@/components/app/metrics";
import { safeHttpUrl } from "@/features/optimize/shared/safe-url";
import type { ContentPerformanceRow } from "@/server/optimize/content/service";

export type ContentPerformance = { rows: ContentPerformanceRow[]; sources: { citations: boolean; bots: boolean; gsc: boolean } };

/** Published pages: AI citations (tracked answers), AI crawler hits (bot logs) and Google clicks — last 30 days. */
export function PerformancePanel({ projectId, data }: { projectId: string; data: ContentPerformance }) {
  const columns: Column<ContentPerformanceRow>[] = [
    {
      id: "page",
      header: "Page",
      sortValue: (r) => r.title.toLowerCase(),
      cell: (r) => (
        <div className="min-w-0">
          <Link href={`/p/${projectId}/content/${r.id}`} className="line-clamp-1 font-medium hover:underline">
            {r.title}
          </Link>
          {safeHttpUrl(r.url) && (
            <a href={safeHttpUrl(r.url)!} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <span className="truncate">{r.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
              <ExternalLink className="size-3 shrink-0" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: "citations",
      header: "AI citations",
      align: "right",
      hint: "Times the page was cited in tracked AI answers (last 30 days).",
      sortValue: (r) => r.aiCitations,
      cell: (r) => (
        <span className="text-sm tabular" title={r.aiEngines.join(", ")}>
          {formatNumber(r.aiCitations)}
        </span>
      ),
    },
    {
      id: "bots",
      header: "Crawler hits",
      align: "right",
      hint: "Requests from AI and search crawlers (GPTBot, ClaudeBot, PerplexityBot, Googlebot…) in your bot traffic logs (last 30 days).",
      sortValue: (r) => r.botHits,
      cell: (r) => (
        <span className="text-sm tabular" title={r.bots.join(", ")}>
          {formatNumber(r.botHits)}
        </span>
      ),
    },
    {
      id: "clicks",
      header: "Google clicks",
      align: "right",
      hideBelow: "sm",
      hint: "Search Console clicks (last 28 days).",
      sortValue: (r) => r.gscClicks,
      cell: (r) => (
        <span className="text-sm tabular" title={`${formatNumber(r.gscImpressions)} impressions`}>
          {formatNumber(r.gscClicks)}
        </span>
      ),
    },
  ];
  const missing = [
    !data.sources.citations && "AI citations appear once tracked prompts cite these URLs",
    !data.sources.bots && (
      <Link key="bots" href={`/p/${projectId}/analytics/bots`} className="underline hover:text-foreground">
        connect bot traffic logs
      </Link>
    ),
    !data.sources.gsc && (
      <Link key="gsc" href={`/p/${projectId}/analytics/search-console?tab=settings`} className="underline hover:text-foreground">
        connect Search Console
      </Link>
    ),
  ].filter(Boolean);
  return (
    <Panel title="Published content performance" description="How your published pages do in AI answers, with crawlers and in Google — last 30 days." contentClassName="space-y-2 p-3 sm:p-4">
      <DataTable
        columns={columns}
        data={data.rows}
        getRowId={(r) => r.id}
        initialSort={{ id: "citations", dir: "desc" }}
        pageSize={10}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="font-medium leading-snug">{r.title}</div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground tabular">
              <span className="inline-flex items-center gap-1">
                <Quote className="size-3" /> {formatNumber(r.aiCitations)} citations
              </span>
              <span className="inline-flex items-center gap-1">
                <Bot className="size-3" /> {formatNumber(r.botHits)} crawler hits
              </span>
              <span className="inline-flex items-center gap-1">
                <MousePointerClick className="size-3" /> {formatNumber(r.gscClicks)} clicks
              </span>
            </div>
          </div>
        )}
      />
      {missing.length > 0 && (
        <p className="text-xs text-muted-foreground">
          No data yet for some columns:{" "}
          {missing.map((m, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {m}
            </span>
          ))}
          .
        </p>
      )}
    </Panel>
  );
}

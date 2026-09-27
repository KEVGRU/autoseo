"use client";

import Link from "next/link";
import { ExternalLink, EyeOff, Radar, ShieldCheck } from "lucide-react";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, TimeAgo } from "@/components/app/misc";
import { formatNumber } from "@/components/app/metrics";
import { Panel } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import type { CrawledPath, MissingCrawler } from "@/server/analytics/bots/coverage";
import type { CrawledNotCited, CrawlerCoverage } from "@/server/analytics/bots/coverage-queries";
import { BotAvatar, BotStack } from "./bot-avatar";

const PURPOSE_LABEL: Record<MissingCrawler["purpose"], string> = {
  search: "AI search",
  user: "User-triggered",
  training: "Training",
  seo: "SEO",
};

function RobotsBadge({ verdict, rule }: { verdict: MissingCrawler["robots"]; rule: string | null }) {
  if (!verdict) return <span className="text-[11px] text-muted-foreground">robots.txt not checked</span>;
  const map = {
    allowed: { status: "success", label: "Allowed" },
    partial: { status: "warning", label: "Partly blocked" },
    blocked: { status: "error", label: "Blocked" },
    unknown: { status: "queued", label: "Unknown" },
  } as const;
  const m = map[verdict];
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5" title={rule ?? undefined}>
      <StatusBadge status={m.status} label={m.label} dot={false} className="text-[11px]" />
      {rule && verdict !== "allowed" && <code className="truncate rounded bg-muted px-1 text-[10.5px] text-muted-foreground">{rule}</code>}
    </span>
  );
}

/** AI crawlers (SEO tools excluded) that did not visit in the period. */
export function CrawlerCoveragePanel({ projectId, coverage, periodLabel }: { projectId: string; coverage: CrawlerCoverage; periodLabel: string }) {
  const blocked = coverage.missing.filter((b) => b.robots === "blocked" || b.robots === "partial").length;
  return (
    <Panel
      title="AI crawlers that never visit"
      icon={<EyeOff className="size-4 text-muted-foreground" />}
      description={`${coverage.visiting} of ${coverage.known} known AI crawlers visited in ${periodLabel}. Crawlers that never read your site can't cite it.`}
      actions={
        <Button asChild size="sm" variant="outline">
          <Link href={`/p/${projectId}/crawlability`}>
            <ShieldCheck className="size-3.5" /> {coverage.check ? "Crawlability check" : "Run crawlability check"}
          </Link>
        </Button>
      }
      contentClassName="space-y-3 p-3 sm:p-4"
    >
      {!coverage.missing.length ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Every known AI crawler visited in this period.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {coverage.missing.map((b) => (
            <li key={b.token} className="flex min-w-0 items-start gap-3 rounded-xl border bg-background p-3">
              <BotAvatar bot={b.token} company={b.company} size="md" withTooltip={false} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                  <span className="truncate text-sm font-medium">{b.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {b.company} · {PURPOSE_LABEL[b.purpose]}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {b.lastSeen ? (
                    <>
                      Last visit <TimeAgo date={b.lastSeen} />
                    </>
                  ) : (
                    "Never seen in your logs"
                  )}
                </div>
                <RobotsBadge verdict={b.robots} rule={b.robotsRule} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
        {blocked > 0 ? (
          <p>
            <span className="font-medium text-foreground">{blocked} crawler{blocked === 1 ? " is" : "s are"} blocked by robots.txt or meta robots.</span>{" "}
            Allow at least the AI search and user-triggered agents (e.g. <code>User-agent: OAI-SearchBot</code> → <code>Allow: /</code>) — they fetch
            pages to answer questions and cite sources.
          </p>
        ) : (
          <p>
            Allowed but never visiting usually means the assistant hasn&apos;t discovered your pages yet: keep your sitemap current, publish an{" "}
            <code>llms.txt</code>, earn mentions on sources AI already cites and make sure your CDN / firewall doesn&apos;t challenge these bots.
          </p>
        )}
        {!coverage.check && <p className="mt-1.5">Run a crawlability check to see each crawler&apos;s robots.txt verdict here.</p>}
      </div>
    </Panel>
  );
}

function PageLink({ row, domain }: { row: CrawledPath; domain: string }) {
  const href = `https://${row.host || domain}${row.path.startsWith("/") ? row.path : `/${row.path}`}`;
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="group inline-flex max-w-[28rem] items-center gap-1.5 font-medium hover:underline" title={href}>
      <span className="truncate">{row.path}</span>
      <ExternalLink className="size-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
    </a>
  );
}

/** Pages AI crawlers read in the period that were never cited in a tracked AI answer. */
export function CrawledNotCitedTable({ projectId, data, domain }: { projectId: string; data: CrawledNotCited; domain: string }) {
  const columns: Column<CrawledPath>[] = [
    { id: "path", header: "Page", cell: (r) => <PageLink row={r} domain={domain} />, sortable: true, sortValue: (r) => r.path },
    { id: "bots", header: "Crawled by", cell: (r) => <BotStack bots={r.bots} max={5} /> },
    { id: "visits", header: "Hits", cell: (r) => <span className="tabular">{formatNumber(r.visits)}</span>, align: "right", sortable: true, sortValue: (r) => r.visits },
    {
      id: "last",
      header: "Last crawl",
      cell: (r) => <TimeAgo date={r.lastVisited} className="text-muted-foreground" />,
      align: "right",
      sortable: true,
      sortValue: (r) => r.lastVisited,
      hideBelow: "md",
    },
  ];
  const shown = data.rows.length;
  return (
    <Panel
      title="Crawled but never cited"
      icon={<Radar className="size-4 text-muted-foreground" />}
      description={
        data.crawledPages
          ? `${formatNumber(data.total)} of ${formatNumber(data.crawledPages)} content pages AI crawlers read were never cited in tracked AI answers${data.total > shown ? ` (top ${shown} by hits)` : ""}.`
          : "Content pages AI crawlers read in this period that were never cited."
      }
      contentClassName="space-y-3 p-3 sm:p-4"
    >
      {data.citedPages === 0 && data.crawledPages > 0 && (
        <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
          None of your pages has been cited in a tracked AI answer yet.{" "}
          <Link href={`/p/${projectId}/ai/tracker`} className="font-medium text-foreground underline-offset-2 hover:underline">
            Track more prompts
          </Link>{" "}
          to see which crawled pages AI assistants actually quote.
        </p>
      )}
      <DataTable
        columns={columns}
        data={data.rows}
        getRowId={(r) => r.path}
        initialSort={{ id: "visits", dir: "desc" }}
        pageSize={25}
        empty={
          <p className="py-10 text-center text-sm text-muted-foreground">
            {data.crawledPages ? "Every crawled content page has been cited at least once." : "No content pages crawled by AI bots in this period."}
          </p>
        }
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <PageLink row={r} domain={domain} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <BotStack bots={r.bots} max={5} />
              <span className="tabular">{formatNumber(r.visits)} hits</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Last crawl <TimeAgo date={r.lastVisited} />
            </div>
          </div>
        )}
      />
      {data.total > 0 && (
        <p className="text-xs text-muted-foreground">
          These pages are read but not quoted. Lead with a direct answer, add concrete facts and figures, use clear headings and FAQ sections, and
          align them with the prompts you track.
        </p>
      )}
    </Panel>
  );
}

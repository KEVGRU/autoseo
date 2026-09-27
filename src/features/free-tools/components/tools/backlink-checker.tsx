"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import type { BacklinkCheckResult } from "../../lib/types";
import { Field, FIELD_CLASS, ToolForm } from "../form";
import { useToolRun, useToolRunner } from "../runner";
import { AiEstimateBanner, DomainTitle, FeatureLink, FollowBadge, formatCount, MetricTiles, Reveal, ScorePill, SectionTitle, UpsellCard, UrlLink } from "../results";

type Row = BacklinkCheckResult["topBacklinks"][number];

const LINK_STATUS: Record<NonNullable<Row["linkStatus"]>, { label: string; className: string; title: string }> = {
  link: { label: "Links", className: "bg-success/12 text-success", title: "The page contains a hyperlink to the domain (checked live)." },
  mention: { label: "Mention", className: "bg-muted text-muted-foreground", title: "The page names the domain without linking to it (checked live)." },
  unverified: { label: "Unverified", className: "bg-warning/15 text-warning", title: "Cited by web search, but the page could not be fetched to check the link." },
};

/** Type cell: follow status (DataForSEO, or the live-checked link of the AI sample) or mention / unverified. */
function LinkType({ row }: { row: Row }) {
  if (!row.linkStatus || (row.linkStatus === "link" && row.dofollow != null)) return <FollowBadge dofollow={row.dofollow} />;
  const s = LINK_STATUS[row.linkStatus];
  return (
    <span title={s.title} className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

const columns: Column<Row>[] = [
  {
    id: "source",
    header: "Referring page",
    cell: (r) => (
      <div className="min-w-0 max-w-[420px]">
        <div className="truncate text-sm font-medium">{r.pageTitle ?? r.domainFrom ?? "—"}</div>
        <UrlLink url={r.urlFrom} className="text-xs text-muted-foreground" />
      </div>
    ),
  },
  {
    id: "anchor",
    header: "Anchor",
    cell: (r) => <span className="line-clamp-2 max-w-[240px] text-sm">{r.anchor ?? <span className="text-muted-foreground italic">No anchor</span>}</span>,
    hideBelow: "md",
  },
  { id: "target", header: "Links to", cell: (r) => <UrlLink url={r.urlTo} className="max-w-[220px] text-xs" />, hideBelow: "lg" },
  { id: "follow", header: "Type", cell: (r) => <LinkType row={r} />, align: "center" },
  {
    id: "rank",
    header: "Domain rank",
    cell: (r) => <ScorePill value={r.domainRank} />,
    sortValue: (r) => r.domainRank,
    align: "right",
    hint: "0–100 strength of the linking domain's own link profile.",
  },
];

export function BacklinkCheckerTool({ initial }: { initial?: { target?: string } }) {
  const runner = useToolRunner();
  const [target, setTarget] = useState(initial?.target ?? "");
  const { status, errorMessage, result, submit, tool } = useToolRun<BacklinkCheckResult>("backlink-checker");

  return (
    <div className="space-y-5">
      <ToolForm
        slug="backlink-checker"
        status={status}
        errorMessage={errorMessage}
        submitLabel="Check backlinks"
        costHint="2 DataForSEO calls (~$0.05) · cached 24 h"
        onSubmit={(token) => submit({ target }, token)}
      >
        <Field id="bl-target" label="Domain">
          <Input
            id="bl-target"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            required
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={runner.projectDomain || "example.com"}
            disabled={status === "loading"}
            className={FIELD_CLASS}
          />
        </Field>
      </ToolForm>

      {status === "done" && result && (
        <Reveal className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DomainTitle domain={result.target} sub={result.ai ? "Sample of pages found via AI web search" : "Live link profile · subdomains included"} />
            <FeatureLink tool={tool} query={{ target: result.target }} />
          </div>
          <AiEstimateBanner
            ai={result.ai}
            detail="A sample of external pages that link to or mention the domain, found via AI web search and checked live (link, anchor, follow status) — not a backlink index: totals and domain ranks are unknown."
          />
          {result.ai ? (
            <MetricTiles
              items={[
                { label: "Pages found", value: formatCount(result.topBacklinks.length), hint: "External pages found via web search that link to or mention the domain.", accent: true },
                { label: "Linking pages", value: formatCount(result.topBacklinks.filter((r) => r.linkStatus === "link").length), hint: "Pages whose HTML contains a link to the domain (checked live)." },
                { label: "Mentions only", value: formatCount(result.topBacklinks.filter((r) => r.linkStatus === "mention").length), hint: "Pages that name the domain without linking to it — link-building opportunities." },
                { label: "Sites", value: formatCount(new Set(result.topBacklinks.map((r) => r.domainFrom).filter(Boolean)).size), hint: "Distinct websites in the sample." },
              ]}
            />
          ) : (
            <MetricTiles
              items={[
                { label: "Domain rank", value: result.summary.rank ?? "—", hint: "A 0–100 score of the domain's link-profile strength. Higher means more and stronger links.", accent: true },
                { label: "Backlinks", value: formatCount(result.summary.backlinks), hint: "Live links pointing at the domain (subdomains included, internal links excluded)." },
                { label: "Referring domains", value: formatCount(result.summary.referringDomains), hint: "Unique domains with at least one live link to this domain." },
                { label: "Broken backlinks", value: formatCount(result.summary.brokenBacklinks), hint: "Links pointing at pages on this domain that return an error." },
              ]}
            />
          )}
          <section className="space-y-2">
            <SectionTitle sub={result.ai ? "Linking pages first, then pages that only mention the domain." : "The strongest links, one per referring domain."}>
              {result.ai ? "Linking & mentioning pages" : "Top backlinks"}
            </SectionTitle>
            <DataTable
              columns={columns}
              data={result.topBacklinks}
              getRowId={(r) => `${r.urlFrom}|${r.urlTo}`}
              paginate={false}
              dense
              empty={
                <EmptyState
                  compact
                  icon={Link2}
                  title="No backlinks found"
                  description={result.ai ? "Web search found no verifiable external pages linking to or mentioning this domain." : "DataForSEO has no live backlinks on record for this domain."}
                />
              }
              mobileCard={(r) => (
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.pageTitle ?? r.domainFrom}</div>
                      <UrlLink url={r.urlFrom} className="text-xs text-muted-foreground" />
                    </div>
                    <ScorePill value={r.domainRank} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <LinkType row={r} />
                    <span className="truncate">{r.anchor ?? (r.linkStatus ? "" : "No anchor")}</span>
                  </div>
                </div>
              )}
            />
          </section>
          <UpsellCard tool={tool} query={{ target: result.target }} />
        </Reveal>
      )}
    </div>
  );
}

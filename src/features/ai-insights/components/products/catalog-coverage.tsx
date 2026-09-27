"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Download, ExternalLink, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanExport } from "@/components/app/export-menu";
import { Panel } from "@/components/app/page";
import { DataTable, type Column } from "@/components/app/data-table";
import { MultiSelect, SearchInput } from "@/components/app/filters";
import { KpiStrip, formatCurrency } from "@/components/app/metrics";
import { EngineStack } from "@/components/app/engine-icon";
import { EmptyState } from "@/components/app/empty-state";
import { cn } from "@/lib/utils";
import type { CatalogCoverage, CatalogCoverageRow } from "@/server/ai/insights/products";
import { downloadCsv } from "../../lib/csv";
import { useClientParam } from "../../lib/client-url";
import { ThumbTile } from "./product-bits";

const money = (v: number | null, cur: string | null) => (v == null ? "—" : formatCurrency(v, cur && /^[A-Z]{3}$/.test(cur) ? cur : "EUR", v % 1 ? 2 : 0));

function PriceDelta({ r }: { r: CatalogCoverageRow }) {
  if (r.priceDelta == null || r.priceDeltaPct == null) return <span className="text-muted-foreground">—</span>;
  const off = Math.abs(r.priceDeltaPct) >= 1;
  return (
    <span className={cn("inline-flex flex-col items-end leading-tight tabular", off ? (r.priceDelta > 0 ? "text-destructive" : "text-warning") : "text-success")}>
      <span className="font-medium">
        {r.priceDelta > 0 ? "+" : ""}
        {money(r.priceDelta, r.currency)}
      </span>
      <span className="text-[11px]">{off ? `${r.priceDeltaPct > 0 ? "+" : ""}${r.priceDeltaPct.toFixed(1)}%` : "matches"}</span>
    </span>
  );
}

export function CatalogCoverageView({ projectId, data, query, knowledgeHref }: { projectId: string; data: CatalogCoverage; query: string; knowledgeHref: string }) {
  const [show, setShow] = useClientParam("show", "all");
  const [q, setQ] = useClientParam("cq", "");
  const t = data.totals;

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return data.rows.filter((r) => {
      if (show === "never" && r.appearances > 0) return false;
      if (show === "recommended" && r.appearances === 0) return false;
      if (show === "price" && !(r.priceDeltaPct != null && Math.abs(r.priceDeltaPct) >= 1)) return false;
      if (n && !`${r.name} ${r.sku ?? ""} ${r.category ?? ""} ${r.aiName ?? ""}`.toLowerCase().includes(n)) return false;
      return true;
    });
  }, [data.rows, show, q]);

  if (!t.catalog)
    return (
      <Panel>
        <EmptyState
          icon={PackageSearch}
          title="Connect your product catalog"
          description="Catalog coverage compares your own products with the products AI engines recommend — which never show up, and whether AI quotes the right price. Import your catalog in Brand Knowledge → Products (feed URL, file or push API)."
          action={
            <Button asChild>
              <Link href={knowledgeHref}>Open Brand Knowledge</Link>
            </Button>
          }
        />
      </Panel>
    );

  const detail = (id: string) => `/p/${projectId}/ai/products/${id}${query}`;
  const columns: Column<CatalogCoverageRow>[] = [
    {
      id: "product",
      header: "Catalog product",
      sticky: true,
      sortValue: (r) => r.name.toLowerCase(),
      cell: (r) => (
        <span className="flex max-w-sm min-w-52 items-center gap-2.5">
          <ThumbTile src={r.imageUrl} name={r.name} />
          <span className="min-w-0">
            <span className="line-clamp-2 text-sm font-medium">{r.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{[r.sku, r.category].filter(Boolean).join(" · ") || "—"}</span>
          </span>
        </span>
      ),
    },
    {
      id: "ai",
      header: "Named by AI as",
      hideBelow: "lg",
      cell: (r) =>
        r.aiProductId ? (
          <Link href={detail(r.aiProductId)} className="line-clamp-2 max-w-56 text-xs hover:underline">
            {r.aiName}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Not matched</span>
        ),
    },
    {
      id: "appearances",
      header: "AI appearances",
      align: "right",
      sortValue: (r) => r.appearances,
      cell: (r) => (r.appearances ? <span className="font-medium tabular">{r.appearances.toLocaleString()}</span> : <span className="text-xs font-medium text-destructive">Never</span>),
    },
    { id: "engines", header: "Engines", hideBelow: "md", cell: (r) => (r.engines.length ? <EngineStack ids={r.engines} max={4} /> : <span className="text-muted-foreground">—</span>) },
    { id: "price", header: "Catalog price", align: "right", sortValue: (r) => r.price, cell: (r) => <span className="tabular">{money(r.price, r.currency)}</span> },
    {
      id: "aiPrice",
      header: "AI-cited price",
      align: "right",
      sortValue: (r) => r.aiPrice,
      hideBelow: "sm",
      cell: (r) => (
        <span className="inline-flex flex-col items-end leading-tight">
          <span className="tabular">{money(r.aiPrice, r.aiCurrency ?? r.currency)}</span>
          {r.aiStore && <span className="max-w-28 truncate text-[11px] text-muted-foreground">{r.aiStore}</span>}
        </span>
      ),
    },
    { id: "delta", header: "Δ price", align: "right", sortValue: (r) => r.priceDeltaPct, cell: (r) => <PriceDelta r={r} />, hideBelow: "sm" },
    {
      id: "link",
      header: <span className="sr-only">Link</span>,
      align: "right",
      cell: (r) =>
        r.url ? (
          <Button asChild variant="ghost" size="icon-sm" aria-label="Open product page">
            <a href={r.url} target="_blank" rel="noopener noreferrer nofollow">
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <KpiStrip
        items={[
          { key: "cat", label: "Catalog products", value: t.catalog.toLocaleString(), sub: `${t.matched.toLocaleString()} matched to AI products` },
          { key: "rec", label: "Recommended by AI", value: t.recommended.toLocaleString(), sub: t.catalog ? `${Math.round((t.recommended / t.catalog) * 100)}% of catalog` : undefined },
          { key: "never", label: "Never recommended", value: t.neverRecommended.toLocaleString(), hint: "Catalog products no AI answer named or showed in the period." },
          { key: "price", label: "Price mismatches", value: t.priceMismatches.toLocaleString(), hint: "AI-cited price differs from your catalog price by ≥ 1 % (same currency)." },
        ]}
      />
      <Panel title="Catalog coverage" description="Your catalog vs the products AI engines name and show (matched by GTIN, product URL or name)">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput value={q} onChange={(v) => setQ(v || null)} placeholder="Search catalog…" className="sm:max-w-64 sm:flex-1" />
          <MultiSelect
            single
            searchable={false}
            options={[
              { value: "all", label: "All products", count: t.catalog },
              { value: "recommended", label: "Recommended by AI", count: t.recommended },
              { value: "never", label: "Never recommended", count: t.neverRecommended },
              { value: "price", label: "Price mismatch", count: t.priceMismatches },
            ]}
            value={[show]}
            onChange={(v) => setShow(v[0] ?? "all")}
            label="Show"
            className="w-full sm:w-auto"
          />
          <CanExport>
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:ml-auto"
              disabled={!rows.length}
              onClick={() =>
                downloadCsv(
                  `catalog-coverage-${new Date().toISOString().slice(0, 10)}`,
                  ["Product", "SKU", "Category", "URL", "Availability", "AI appearances", "Engines", "Named by AI as", "Catalog price", "Currency", "AI-cited price", "AI currency", "AI store", "Price delta", "Price delta %", "Last seen"],
                  rows.map((r) => [r.name, r.sku, r.category, r.url, r.availability, r.appearances, r.engines.join(" "), r.aiName, r.price, r.currency, r.aiPrice, r.aiCurrency, r.aiStore, r.priceDelta, r.priceDeltaPct, r.lastSeen]),
                )
              }
            >
              <Download className="size-3.5" /> Export
            </Button>
          </CanExport>
        </div>
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(r) => r.id}
          initialSort={{ id: "appearances", dir: "desc" }}
          pageSize={25}
          rowClassName={(r) => (r.appearances === 0 ? "bg-destructive/[0.03]" : undefined)}
          empty={<EmptyState compact title="No products match" description="Try another filter." />}
          mobileCard={(r) => (
            <div className="flex items-center gap-3">
              <ThumbTile src={r.imageUrl} name={r.name} />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium">{r.name}</span>
                <span className="block text-xs text-muted-foreground tabular">
                  {r.appearances ? `${r.appearances}× in AI answers` : "Never recommended"} · {money(r.price, r.currency)}
                </span>
              </span>
              <PriceDelta r={r} />
            </div>
          )}
        />
      </Panel>
      {data.ownUnmatched.length > 0 && (
        <Panel title="Your products AI names that aren't in the catalog" description="Naming differences or products missing from your feed — add them or align the product names.">
          <ul className="divide-y">
            {data.ownUnmatched.slice(0, 25).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link href={detail(p.id)} className="min-w-0 truncate hover:underline">
                  {p.name}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground tabular">{p.appearances}×</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

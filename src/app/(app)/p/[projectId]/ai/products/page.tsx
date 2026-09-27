import { PageContainer, PageHeader, TabNav } from "@/components/app/page";
import { requireProject } from "@/server/auth/guards";
import { getFilterOptions } from "@/server/ai/insights/brands";
import { filterQuery, param, parseInsightFilter } from "@/server/ai/insights/filters";
import { getCatalogCoverage, getProductsOverview } from "@/server/ai/insights/products";
import { InsightFilters } from "@/features/ai-insights/components/insight-filters";
import { ProductsView } from "@/features/ai-insights/components/products/products-view";
import { CatalogCoverageView } from "@/features/ai-insights/components/products/catalog-coverage";

export const metadata = { title: "Products" };

const TABS = ["products", "stores", "catalog"] as const;
type Tab = (typeof TABS)[number];

export default async function ProductsPage({ params, searchParams }: PageProps<"/p/[projectId]/ai/products">) {
  const { projectId } = await params;
  const ctx = await requireProject(projectId);
  const sp = await searchParams;
  const f = parseInsightFilter(projectId, sp);
  const tabParam = param(sp, "tab");
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "products";
  const base = `/p/${projectId}/ai/products`;
  const [options, body] = await Promise.all([
    getFilterOptions(ctx.project, f),
    tab === "catalog"
      ? getCatalogCoverage(ctx.project, f).then((data) => <CatalogCoverageView projectId={projectId} data={data} query={filterQuery(f)} knowledgeHref={`/p/${projectId}/knowledge?tab=products`} />)
      : getProductsOverview(ctx.project, f).then((data) => <ProductsView projectId={projectId} data={data} query={filterQuery(f)} tab={tab === "stores" ? "stores" : "products"} />),
  ]);
  return (
    <PageContainer>
      <PageHeader title="Products" description="Which products AI engines surface and recommend — yours and your competitors' — and where they are sold." />
      <TabNav
        active={tab}
        tabs={[
          { key: "products", label: "Products", href: `${base}${filterQuery(f)}` },
          { key: "stores", label: "Stores", href: `${base}${filterQuery(f, { tab: "stores" })}` },
          { key: "catalog", label: "Catalog coverage", href: `${base}${filterQuery(f, { tab: "catalog" })}` },
        ]}
      />
      <InsightFilters options={options} />
      {body}
    </PageContainer>
  );
}

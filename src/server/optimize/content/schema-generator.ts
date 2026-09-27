import "server-only";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/server/db/client";
import { catalogProducts, projects } from "@/server/db/schema";
import { getBrandProfile } from "@/server/ai/knowledge/profile";
import { parsePublicUrl, safeFetch, UnsafeUrlError } from "@/server/optimize/net";
import { extractPageFacts, type PageFacts } from "./schema-ld-extract";
import {
  buildSchemaGraph,
  samePage,
  SCHEMA_TYPES,
  suggestSchemaTypes,
  validateJsonLd,
  type PostalAddress,
  type SchemaFacts,
  type SchemaHint,
  type SchemaType,
} from "./schema-ld";

/**
 * Ready-to-paste JSON-LD for any page of the project: brand profile + catalog products + facts
 * extracted from the live page (and the homepage for organization details), with validation hints.
 */

export type SchemaOverrides = {
  sameAs?: string[];
  telephone?: string | null;
  email?: string | null;
  address?: PostalAddress | null;
  businessType?: string | null;
  openingHours?: string[];
  priceRange?: string | null;
};

export type SchemaMarkupResult = {
  url: string;
  types: SchemaType[];
  suggested: SchemaType[];
  jsonLd: Record<string, unknown>;
  json: string;
  script: string;
  hints: SchemaHint[];
  notes: string[];
  facts: {
    title: string | null;
    existingTypes: string[];
    product: string | null;
    faqs: number;
    steps: number;
    breadcrumbs: number;
    sameAs: string[];
    telephone: string | null;
    email: string | null;
    address: PostalAddress | null;
  };
};

async function fetchFacts(url: string): Promise<PageFacts> {
  const res = await safeFetch(url, { timeoutMs: 20_000, maxBytes: 4 * 1024 * 1024, headers: { accept: "text/html,application/xhtml+xml" } });
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}.`);
  if (!(res.headers.get("content-type") ?? "").includes("html")) throw new Error(`${url} is not an HTML page.`);
  return extractPageFacts(res.text(), res.url);
}

const merge = <T>(...lists: (T[] | undefined | null)[]) => [...new Set(lists.flatMap((l) => l ?? []))];

/**
 * Builds the schema facts for a page. `pageFacts` / `homeFacts` can be passed in when the caller
 * already fetched the HTML (task signals); otherwise pages are fetched SSRF-safely.
 */
export async function generateSchemaMarkup(
  projectId: string,
  input: { url?: string | null; types?: SchemaType[]; productId?: string | null; overrides?: SchemaOverrides; pageFacts?: PageFacts | null; homeFacts?: PageFacts | null },
): Promise<SchemaMarkupResult> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) throw new Error("Project not found");
  const profile = await getBrandProfile(projectId);
  const home = `https://${project.domain}/`;
  const notes: string[] = [];

  let url = home;
  if (input.url?.trim()) {
    try {
      url = parsePublicUrl(/^https?:\/\//i.test(input.url.trim()) ? input.url.trim() : `https://${input.url.trim()}`).toString();
    } catch (err) {
      throw err instanceof UnsafeUrlError ? err : new UnsafeUrlError("Enter a valid public URL.");
    }
  }
  const isHome = samePage(url, home);

  let page: PageFacts | null = input.pageFacts ?? null;
  if (!page) {
    try {
      page = await fetchFacts(url);
    } catch (err) {
      notes.push(`Couldn't read the page (${err instanceof Error ? err.message : String(err)}) — generated from your brand profile only.`);
    }
  }
  let homeFacts: PageFacts | null = input.homeFacts ?? (isHome ? page : null);
  if (!homeFacts && !isHome) homeFacts = await fetchFacts(home).catch(() => null);

  // Catalog product: explicit pick, else the product whose URL is this page.
  const productConds = [input.productId ? eq(catalogProducts.id, input.productId) : undefined, !input.productId && !isHome ? eq(catalogProducts.url, url) : undefined].filter(Boolean);
  const [catalog] = productConds.length
    ? await db
        .select()
        .from(catalogProducts)
        .where(and(eq(catalogProducts.projectId, projectId), or(...productConds)))
        .limit(1)
    : [];
  if (input.productId && !catalog) notes.push("The selected catalog product was not found.");

  const o = input.overrides ?? {};
  const orgAddress = o.address ?? homeFacts?.address ?? (isHome ? page?.address : null) ?? null;
  const telephone = o.telephone ?? homeFacts?.telephone ?? page?.telephone ?? null;
  const email = o.email ?? homeFacts?.email ?? page?.email ?? null;
  const pageUrl = page?.canonical ?? url;
  // The site may live on www. (or https) even when the project domain is the bare host.
  const canonicalHome = (isHome ? page : homeFacts)?.canonical;
  const siteUrl = canonicalHome && samePage(new URL(canonicalHome).origin, home) ? `${new URL(canonicalHome).origin}/` : home;

  const facts: SchemaFacts = {
    url: pageUrl,
    language: page?.lang?.slice(0, 5) || project.language,
    site: { name: homeFacts?.siteName ?? profile.name, url: siteUrl, searchUrlTemplate: homeFacts?.searchUrlTemplate ?? null },
    org: {
      name: profile.name,
      url: siteUrl,
      alternateNames: profile.aliases,
      description: profile.description || homeFacts?.description || null,
      logo: project.logoUrl ?? homeFacts?.logo ?? null,
      sameAs: merge(o.sameAs, homeFacts?.sameAs, isHome ? [] : page?.sameAs).filter((u) => /^https?:\/\//.test(u)),
      email,
      telephone,
      address: orgAddress,
    },
    page: page
      ? {
          title: page.title,
          description: page.description,
          image: page.image,
          datePublished: page.datePublished,
          dateModified: page.dateModified,
          author: page.author,
          breadcrumbs: page.breadcrumbs,
          faqs: page.faqs,
          howToSteps: page.howToSteps,
          articleType: page.ogType === "article" || /\/(blog|news|magazin|ratgeber|artikel|article)s?\//i.test(url) ? "BlogPosting" : undefined,
        }
      : undefined,
    product: catalog
      ? {
          name: catalog.name,
          description: catalog.description,
          image: catalog.imageUrl,
          url: catalog.url,
          sku: catalog.sku,
          gtin: catalog.gtin,
          brand: catalog.brand,
          price: catalog.price,
          currency: catalog.currency,
          availability: catalog.availability,
        }
      : page?.product?.name
        ? { ...page.product, name: page.product.name, url: pageUrl }
        : null,
    localBusiness:
      o.businessType || o.address || o.openingHours?.length || page?.openingHours.length
        ? { type: o.businessType ?? null, address: o.address ?? orgAddress, telephone, openingHours: o.openingHours?.length ? o.openingHours : (page?.openingHours ?? []), priceRange: o.priceRange ?? null }
        : null,
  };

  const suggested = suggestSchemaTypes(facts);
  const types = (input.types?.length ? input.types : suggested).filter((t): t is SchemaType => (SCHEMA_TYPES as readonly string[]).includes(t));
  const jsonLd = buildSchemaGraph(types, facts);
  const built = new Set(((jsonLd["@graph"] as Record<string, unknown>[]) ?? []).map((n) => String(n["@type"])));
  for (const t of types) {
    if (t === "LocalBusiness" || built.has(t)) continue;
    notes.push(
      t === "Product"
        ? "No product found — pick a catalog product or use a product page with price markup."
        : t === "FAQPage"
          ? "No FAQs found on the page (question headings with answers, or FAQ markup)."
          : t === "HowTo"
            ? "No numbered steps found on the page."
            : t === "BreadcrumbList"
              ? "No breadcrumb trail found."
              : t === "Article"
                ? "The page title couldn't be read."
                : `${t} could not be built from the available facts.`,
    );
  }
  if (page?.existingTypes.length) notes.push(`The page already has JSON-LD for: ${page.existingTypes.slice(0, 8).join(", ")}. Replace or merge it to avoid duplicates.`);
  const json = JSON.stringify(jsonLd, null, 2);
  return {
    url: pageUrl,
    types,
    suggested,
    jsonLd,
    json,
    script: `<script type="application/ld+json">\n${json}\n</script>`,
    hints: validateJsonLd(jsonLd),
    notes,
    facts: {
      title: page?.title ?? null,
      existingTypes: page?.existingTypes ?? [],
      product: facts.product?.name ?? null,
      faqs: page?.faqs.length ?? 0,
      steps: page?.howToSteps.length ?? 0,
      breadcrumbs: page?.breadcrumbs.length ?? 0,
      sameAs: facts.org.sameAs ?? [],
      telephone,
      email,
      address: orgAddress,
    },
  };
}

/**
 * JSON-LD attached to schema tasks (`signalData.jsonLd`): Organization + WebSite for the homepage,
 * suggested types for other pages. Pass `html` when the page was already fetched. Never throws.
 */
export async function jsonLdForTask(projectId: string, input: { url: string; html?: string | null; types?: SchemaType[] }): Promise<{ jsonLd: string; jsonLdUrl: string; jsonLdTypes: SchemaType[] } | null> {
  try {
    const pageFacts = input.html ? extractPageFacts(input.html, input.url) : null;
    const r = await generateSchemaMarkup(projectId, { url: input.url, types: input.types, pageFacts });
    if (!((r.jsonLd["@graph"] as unknown[]) ?? []).length) return null;
    return { jsonLd: r.json, jsonLdUrl: r.url, jsonLdTypes: r.types };
  } catch (err) {
    console.error("[tasks] JSON-LD for task failed", err);
    return null;
  }
}

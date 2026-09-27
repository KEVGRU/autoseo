/** JSON-LD generator for content pieces (pure, isomorphic — used by the editor and the generator job). */

export type JsonLdInput = {
  title: string;
  description?: string | null;
  url?: string | null;
  language?: string | null;
  authorName?: string | null;
  authorTitle?: string | null;
  publisherName?: string | null;
  publisherUrl?: string | null;
  publisherLogo?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  image?: string | null;
  faqs?: Array<{ question: string; answer: string }>;
  entities?: Array<{ name: string; type?: string | null; sameAs?: string | null }>;
  howToSteps?: string[];
  type?: "Article" | "BlogPosting" | "HowTo";
};

export function buildJsonLd(input: JsonLdInput): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [];
  const orgId = input.publisherUrl ? `${input.publisherUrl.replace(/\/+$/, "")}/#organization` : undefined;
  if (input.publisherName) {
    graph.push({
      "@type": "Organization",
      ...(orgId ? { "@id": orgId } : {}),
      name: input.publisherName,
      ...(input.publisherUrl ? { url: input.publisherUrl } : {}),
      ...(input.publisherLogo ? { logo: { "@type": "ImageObject", url: input.publisherLogo } } : {}),
    });
  }
  const main: Record<string, unknown> = {
    "@type": input.type ?? "Article",
    headline: input.title.slice(0, 110),
    ...(input.description ? { description: input.description } : {}),
    ...(input.url ? { url: input.url, mainEntityOfPage: input.url } : {}),
    ...(input.language ? { inLanguage: input.language } : {}),
    ...(input.image ? { image: input.image } : {}),
    datePublished: input.datePublished ?? new Date().toISOString().slice(0, 10),
    dateModified: input.dateModified ?? input.datePublished ?? new Date().toISOString().slice(0, 10),
    ...(input.authorName
      ? { author: { "@type": "Person", name: input.authorName, ...(input.authorTitle ? { jobTitle: input.authorTitle } : {}) } }
      : input.publisherName
        ? { author: { "@type": "Organization", name: input.publisherName } }
        : {}),
    ...(input.publisherName ? { publisher: orgId ? { "@id": orgId } : { "@type": "Organization", name: input.publisherName } } : {}),
  };
  const ents = (input.entities ?? []).filter((e) => e.name?.trim()).slice(0, 12);
  if (ents.length) {
    main.about = ents.slice(0, 3).map((e) => ({ "@type": e.type || "Thing", name: e.name, ...(e.sameAs ? { sameAs: e.sameAs } : {}) }));
    if (ents.length > 3) main.mentions = ents.slice(3).map((e) => ({ "@type": e.type || "Thing", name: e.name, ...(e.sameAs ? { sameAs: e.sameAs } : {}) }));
  }
  if (input.type === "HowTo" && input.howToSteps?.length) {
    main.name = input.title;
    main.step = input.howToSteps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text }));
  }
  graph.push(main);
  const faqs = (input.faqs ?? []).filter((f) => f.question?.trim() && f.answer?.trim());
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function buildJsonLdString(input: JsonLdInput): string {
  return JSON.stringify(buildJsonLd(input), null, 2);
}

/* ───────────────────────────── Schema generator (any page) ───────────────────────────── */

export const SCHEMA_TYPES = ["Organization", "WebSite", "Product", "LocalBusiness", "FAQPage", "BreadcrumbList", "Article", "HowTo"] as const;
export type SchemaType = (typeof SCHEMA_TYPES)[number];

export type PostalAddress = { streetAddress?: string | null; postalCode?: string | null; addressLocality?: string | null; addressRegion?: string | null; addressCountry?: string | null };

export type SchemaFacts = {
  /** Page the markup is for (canonical URL). */
  url?: string | null;
  language?: string | null;
  site: { name: string; url: string; searchUrlTemplate?: string | null };
  org: {
    name: string;
    url: string;
    legalName?: string | null;
    alternateNames?: string[];
    description?: string | null;
    logo?: string | null;
    sameAs?: string[];
    email?: string | null;
    telephone?: string | null;
    address?: PostalAddress | null;
  };
  page?: {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    datePublished?: string | null;
    dateModified?: string | null;
    author?: string | null;
    breadcrumbs?: { name: string; url: string }[];
    faqs?: { question: string; answer: string }[];
    howToSteps?: string[];
    articleType?: "Article" | "BlogPosting" | "NewsArticle";
  };
  product?: {
    name: string;
    description?: string | null;
    image?: string | null;
    url?: string | null;
    sku?: string | null;
    gtin?: string | null;
    brand?: string | null;
    price?: number | null;
    currency?: string | null;
    availability?: string | null;
    ratingValue?: number | null;
    reviewCount?: number | null;
  } | null;
  localBusiness?: {
    type?: string | null;
    name?: string | null;
    address?: PostalAddress | null;
    telephone?: string | null;
    openingHours?: string[];
    priceRange?: string | null;
    geo?: { latitude: number; longitude: number } | null;
    image?: string | null;
  } | null;
};

const trimUrl = (u: string) => u.replace(/\/+$/, "");
const clean = <T extends Record<string, unknown>>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== "" && !(Array.isArray(v) && !v.length))) as T;

function addressNode(a: PostalAddress | null | undefined): Record<string, unknown> | undefined {
  if (!a) return undefined;
  const node = clean({ "@type": "PostalAddress", streetAddress: a.streetAddress, postalCode: a.postalCode, addressLocality: a.addressLocality, addressRegion: a.addressRegion, addressCountry: a.addressCountry });
  return Object.keys(node).length > 1 ? node : undefined;
}

const AVAILABILITY: Record<string, string> = {
  in_stock: "InStock",
  instock: "InStock",
  "in stock": "InStock",
  out_of_stock: "OutOfStock",
  outofstock: "OutOfStock",
  "out of stock": "OutOfStock",
  preorder: "PreOrder",
  backorder: "BackOrder",
  discontinued: "Discontinued",
};

function availabilityUrl(v: string | null | undefined): string | undefined {
  if (!v) return undefined;
  if (/^https?:\/\/schema\.org\//i.test(v)) return v.replace(/^http:/, "https:");
  const key = AVAILABILITY[v.toLowerCase().replace(/[-]/g, "_").trim()] ?? (/^[A-Z][a-zA-Z]+$/.test(v) ? v : null);
  return key ? `https://schema.org/${key}` : undefined;
}

export const orgId = (f: SchemaFacts) => `${trimUrl(f.org.url)}/#organization`;
export const siteId = (f: SchemaFacts) => `${trimUrl(f.site.url)}/#website`;

export function buildOrganizationNode(f: SchemaFacts): Record<string, unknown> {
  const o = f.org;
  return clean({
    "@type": "Organization",
    "@id": orgId(f),
    name: o.name,
    legalName: o.legalName,
    alternateName: o.alternateNames?.filter((n) => n && n !== o.name).slice(0, 5),
    url: o.url,
    description: o.description,
    logo: o.logo ? { "@type": "ImageObject", url: o.logo } : undefined,
    sameAs: [...new Set(o.sameAs ?? [])].slice(0, 20),
    email: o.email,
    telephone: o.telephone,
    address: addressNode(o.address),
    contactPoint: o.telephone || o.email ? [clean({ "@type": "ContactPoint", contactType: "customer service", telephone: o.telephone, email: o.email })] : undefined,
  });
}

export function buildWebSiteNode(f: SchemaFacts): Record<string, unknown> {
  return clean({
    "@type": "WebSite",
    "@id": siteId(f),
    name: f.site.name,
    url: f.site.url,
    inLanguage: f.language,
    publisher: { "@id": orgId(f) },
    potentialAction: f.site.searchUrlTemplate?.includes("{search_term_string}")
      ? { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: f.site.searchUrlTemplate }, "query-input": "required name=search_term_string" }
      : undefined,
  });
}

export function buildProductNode(f: SchemaFacts): Record<string, unknown> | null {
  const p = f.product;
  if (!p?.name) return null;
  const offer =
    p.price != null && p.currency
      ? clean({ "@type": "Offer", price: Number(p.price.toFixed(2)), priceCurrency: p.currency.toUpperCase(), availability: availabilityUrl(p.availability), url: p.url ?? f.url, seller: { "@id": orgId(f) } })
      : undefined;
  return clean({
    "@type": "Product",
    "@id": `${trimUrl(p.url ?? f.url ?? f.site.url)}#product`,
    name: p.name,
    description: p.description,
    image: p.image,
    url: p.url ?? f.url,
    sku: p.sku,
    gtin: p.gtin,
    brand: { "@type": "Brand", name: p.brand || f.org.name },
    offers: offer,
    aggregateRating: p.ratingValue != null && p.reviewCount ? { "@type": "AggregateRating", ratingValue: p.ratingValue, reviewCount: p.reviewCount } : undefined,
  });
}

export function buildLocalBusinessNode(f: SchemaFacts): Record<string, unknown> {
  const b = f.localBusiness ?? {};
  return clean({
    "@type": b.type || "LocalBusiness",
    "@id": `${trimUrl(f.org.url)}/#localbusiness`,
    name: b.name || f.org.name,
    url: f.url ?? f.org.url,
    image: b.image ?? f.org.logo,
    telephone: b.telephone ?? f.org.telephone,
    email: f.org.email,
    address: addressNode(b.address ?? f.org.address),
    geo: b.geo ? { "@type": "GeoCoordinates", latitude: b.geo.latitude, longitude: b.geo.longitude } : undefined,
    openingHours: b.openingHours?.filter(Boolean),
    priceRange: b.priceRange,
    parentOrganization: { "@id": orgId(f) },
  });
}

export function buildFaqPageNode(f: SchemaFacts): Record<string, unknown> | null {
  const faqs = (f.page?.faqs ?? []).filter((q) => q.question?.trim() && q.answer?.trim()).slice(0, 30);
  if (!faqs.length) return null;
  return {
    "@type": "FAQPage",
    ...(f.url ? { "@id": `${trimUrl(f.url)}#faq`, url: f.url } : {}),
    mainEntity: faqs.map((q) => ({ "@type": "Question", name: q.question.trim(), acceptedAnswer: { "@type": "Answer", text: q.answer.trim() } })),
  };
}

export function buildBreadcrumbNode(f: SchemaFacts): Record<string, unknown> | null {
  const crumbs = (f.page?.breadcrumbs ?? []).filter((c) => c.name?.trim() && c.url);
  if (crumbs.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
    ...(f.url ? { "@id": `${trimUrl(f.url)}#breadcrumb` } : {}),
    itemListElement: crumbs.slice(0, 10).map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name.trim(), item: c.url })),
  };
}

export function buildArticleNode(f: SchemaFacts): Record<string, unknown> | null {
  const p = f.page;
  if (!p?.title) return null;
  return clean({
    "@type": p.articleType ?? "Article",
    ...(f.url ? { "@id": `${trimUrl(f.url)}#article`, mainEntityOfPage: f.url, url: f.url } : {}),
    headline: p.title.slice(0, 110),
    description: p.description,
    image: p.image,
    inLanguage: f.language,
    datePublished: p.datePublished,
    dateModified: p.dateModified ?? p.datePublished,
    author: p.author ? { "@type": "Person", name: p.author } : { "@id": orgId(f) },
    publisher: { "@id": orgId(f) },
    isPartOf: { "@id": siteId(f) },
  });
}

export function buildHowToNode(f: SchemaFacts): Record<string, unknown> | null {
  const steps = (f.page?.howToSteps ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 20);
  if (steps.length < 2 || !f.page?.title) return null;
  return clean({
    "@type": "HowTo",
    ...(f.url ? { "@id": `${trimUrl(f.url)}#howto` } : {}),
    name: f.page.title,
    description: f.page.description,
    image: f.page.image,
    step: steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
  });
}

/** Types that make sense for the facts at hand (used when the caller doesn't pick types). */
/** Same page regardless of protocol, "www." and trailing slash. */
export function samePage(a: string, b: string): boolean {
  const norm = (u: string) => u.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/+$/, "");
  return norm(a) === norm(b);
}

export function suggestSchemaTypes(f: SchemaFacts): SchemaType[] {
  const out: SchemaType[] = [];
  const isHome = !f.url || samePage(f.url, f.site.url);
  if (isHome) out.push("Organization", "WebSite");
  if (f.localBusiness) out.push("LocalBusiness");
  if (f.product?.name) out.push("Product");
  if (!isHome && !f.product?.name && f.page?.title && (f.page.datePublished || f.page.articleType)) out.push("Article");
  if ((f.page?.howToSteps?.length ?? 0) >= 3 && /\b(how to|how do|guide|anleitung|wie )/i.test(f.page?.title ?? "")) out.push("HowTo");
  if (f.page?.faqs?.length) out.push("FAQPage");
  if (!isHome && (f.page?.breadcrumbs?.length ?? 0) >= 2) out.push("BreadcrumbList");
  if (!out.includes("Organization")) out.unshift("Organization");
  return out;
}

/** One JSON-LD document (`@graph`) with the requested node types, cross-linked by `@id`. */
export function buildSchemaGraph(types: SchemaType[], f: SchemaFacts): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [];
  const want = new Set(types);
  if (want.has("Organization")) graph.push(buildOrganizationNode(f));
  if (want.has("WebSite")) graph.push(buildWebSiteNode(f));
  if (want.has("LocalBusiness")) graph.push(buildLocalBusinessNode(f));
  const add = (n: Record<string, unknown> | null) => n && graph.push(n);
  if (want.has("Product")) add(buildProductNode(f));
  if (want.has("Article")) add(buildArticleNode(f));
  if (want.has("HowTo")) add(buildHowToNode(f));
  if (want.has("FAQPage")) add(buildFaqPageNode(f));
  if (want.has("BreadcrumbList")) add(buildBreadcrumbNode(f));
  return { "@context": "https://schema.org", "@graph": graph };
}

/* ───────────────────────────── Validation hints ───────────────────────────── */

export type SchemaHint = { level: "error" | "warning" | "info"; type: string; message: string };

function nodesOf(doc: unknown): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const visit = (n: unknown) => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (!n || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (o["@graph"]) visit(o["@graph"]);
    if (o["@type"]) out.push(o);
  };
  visit(doc);
  return out;
}

const typesOf = (n: Record<string, unknown>) => (Array.isArray(n["@type"]) ? (n["@type"] as unknown[]).map(String) : [String(n["@type"])]);
const has = (n: Record<string, unknown>, k: string) => n[k] != null && n[k] !== "" && !(Array.isArray(n[k]) && !(n[k] as unknown[]).length);
const LOCAL_TYPES = /^(LocalBusiness|Store|Restaurant|ProfessionalService|HomeAndConstructionBusiness|AutomotiveBusiness|MedicalBusiness|HealthAndBeautyBusiness|LegalService|FinancialService|FoodEstablishment|LodgingBusiness|SportsActivityLocation|Electrician|Plumber|HVACBusiness|RoofingContractor|GeneralContractor|RealEstateAgent|TravelAgency|Dentist|Physician)$/;

/**
 * Rich-result oriented checks (Google Search Central requirements + schema.org recommendations):
 * errors block the rich result, warnings reduce it, infos are optional improvements.
 */
export function validateJsonLd(doc: unknown): SchemaHint[] {
  const hints: SchemaHint[] = [];
  const push = (level: SchemaHint["level"], type: string, message: string) => hints.push({ level, type, message });
  const roots = Array.isArray(doc) ? doc : [doc];
  for (const r of roots) {
    const ctx = r && typeof r === "object" ? (r as Record<string, unknown>)["@context"] : undefined;
    if (!ctx || !/schema\.org/.test(JSON.stringify(ctx))) push("error", "JSON-LD", "Set \"@context\": \"https://schema.org\".");
  }
  const nodes = nodesOf(doc);
  if (!nodes.length) push("error", "JSON-LD", "No node with an @type found.");
  for (const n of nodes) {
    for (const t of typesOf(n)) {
      if (t === "Organization" || t === "Corporation" || t === "OnlineStore") {
        if (!has(n, "name")) push("error", t, "Add the organization name.");
        if (!has(n, "url")) push("warning", t, "Add the homepage url.");
        if (!has(n, "logo")) push("warning", t, "Add a logo (min. 112×112 px) so engines can show your brand.");
        if (!has(n, "sameAs")) push("info", t, "List your official profiles (LinkedIn, Wikipedia, Crunchbase, social) in sameAs — it helps engines resolve the entity.");
        if (!has(n, "contactPoint") && !has(n, "telephone") && !has(n, "email")) push("info", t, "Add a contactPoint (telephone / email).");
      } else if (t === "WebSite") {
        if (!has(n, "name") || !has(n, "url")) push("error", t, "WebSite needs name and url.");
        if (!has(n, "potentialAction")) push("info", t, "Add a SearchAction if the site has a search page (sitelinks search box).");
      } else if (t === "Product") {
        if (!has(n, "name")) push("error", t, "Product needs a name.");
        if (!has(n, "offers") && !has(n, "review") && !has(n, "aggregateRating")) push("error", t, "Add offers (price + currency), a review or aggregateRating — one is required for product rich results.");
        const offers = (Array.isArray(n.offers) ? n.offers[0] : n.offers) as Record<string, unknown> | undefined;
        if (offers && typeof offers === "object") {
          if (!has(offers, "price") && !has(offers, "priceSpecification")) push("error", t, "offers.price is missing.");
          if (!has(offers, "priceCurrency")) push("error", t, "offers.priceCurrency is missing (ISO 4217, e.g. EUR).");
          if (!has(offers, "availability")) push("warning", t, "Add offers.availability (e.g. https://schema.org/InStock).");
        }
        if (!has(n, "image")) push("warning", t, "Add a product image.");
        if (!has(n, "brand")) push("info", t, "Add the brand.");
        if (!has(n, "gtin") && !has(n, "gtin13") && !has(n, "sku") && !has(n, "mpn")) push("info", t, "Add a gtin, mpn or sku identifier.");
      } else if (LOCAL_TYPES.test(t)) {
        if (!has(n, "name")) push("error", t, "Add the business name.");
        if (!has(n, "address")) push("error", t, "Add the postal address (streetAddress, postalCode, addressLocality, addressCountry).");
        else {
          const a = n.address as Record<string, unknown>;
          for (const k of ["streetAddress", "addressLocality", "postalCode", "addressCountry"]) if (!has(a, k)) push("warning", t, `address.${k} is missing.`);
        }
        if (!has(n, "telephone")) push("warning", t, "Add a telephone number.");
        if (!has(n, "openingHours") && !has(n, "openingHoursSpecification")) push("info", t, "Add opening hours (e.g. \"Mo-Fr 09:00-18:00\").");
        if (!has(n, "geo")) push("info", t, "Add geo coordinates for map results.");
        if (!has(n, "url")) push("warning", t, "Add the business url.");
      } else if (t === "FAQPage") {
        const qs = Array.isArray(n.mainEntity) ? (n.mainEntity as Record<string, unknown>[]) : [];
        if (!qs.length) push("error", t, "FAQPage needs at least one Question in mainEntity.");
        qs.forEach((q, i) => {
          const a = q?.acceptedAnswer as Record<string, unknown> | undefined;
          if (!has(q ?? {}, "name")) push("error", t, `Question ${i + 1} has no name (the question text).`);
          if (!a || !has(a, "text")) push("error", t, `Question ${i + 1} has no acceptedAnswer.text.`);
        });
        if (qs.length) push("info", t, "Google shows FAQ rich results only for authoritative government / health sites — the markup still helps AI engines extract your answers.");
      } else if (t === "BreadcrumbList") {
        const items = Array.isArray(n.itemListElement) ? (n.itemListElement as Record<string, unknown>[]) : [];
        if (items.length < 2) push("warning", t, "A breadcrumb trail needs at least two items.");
        items.forEach((it, i) => {
          if (!has(it ?? {}, "name")) push("error", t, `Item ${i + 1} needs a name.`);
          if (!has(it ?? {}, "position")) push("error", t, `Item ${i + 1} needs a position.`);
          if (i < items.length - 1 && !has(it ?? {}, "item")) push("error", t, `Item ${i + 1} needs an item URL.`);
        });
      } else if (t === "Article" || t === "BlogPosting" || t === "NewsArticle") {
        if (!has(n, "headline")) push("error", t, "Add a headline.");
        else if (String(n.headline).length > 110) push("warning", t, "Keep the headline under 110 characters.");
        if (!has(n, "image")) push("warning", t, "Add an image (at least 1200 px wide works best).");
        if (!has(n, "datePublished")) push("warning", t, "Add datePublished (ISO 8601).");
        if (!has(n, "dateModified")) push("info", t, "Add dateModified so engines can judge freshness.");
        if (!has(n, "author")) push("warning", t, "Add an author (Person with name, or your Organization).");
      } else if (t === "HowTo") {
        if (!has(n, "name")) push("error", t, "HowTo needs a name.");
        const steps = Array.isArray(n.step) ? n.step : [];
        if (steps.length < 2) push("error", t, "HowTo needs at least two steps.");
        push("info", t, "Google no longer shows HowTo rich results, but AI engines still use step markup.");
      }
    }
  }
  return hints;
}

import * as cheerio from "cheerio";
import type { PostalAddress } from "./schema-ld";

/**
 * Facts for JSON-LD generation extracted from a page's HTML (pure — unit-testable): meta / Open
 * Graph tags, existing JSON-LD and microdata, contact links, social profiles, FAQs, steps and
 * breadcrumbs.
 */
export type PageFacts = {
  url: string;
  canonical: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  lang: string | null;
  siteName: string | null;
  ogType: string | null;
  datePublished: string | null;
  dateModified: string | null;
  author: string | null;
  logo: string | null;
  sameAs: string[];
  telephone: string | null;
  email: string | null;
  address: PostalAddress | null;
  openingHours: string[];
  product: { name: string | null; description: string | null; image: string | null; sku: string | null; gtin: string | null; brand: string | null; price: number | null; currency: string | null; availability: string | null } | null;
  faqs: { question: string; answer: string }[];
  howToSteps: string[];
  breadcrumbs: { name: string; url: string }[];
  searchUrlTemplate: string | null;
  existingTypes: string[];
};

const SOCIAL = /^(https?:\/\/)?([a-z0-9-]+\.)?(facebook\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com|youtube\.com|tiktok\.com|pinterest\.[a-z.]+|xing\.com|github\.com|wikipedia\.org|wikidata\.org|crunchbase\.com|threads\.net|mastodon\.social|bsky\.app)\//i;

const text = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();

function abs(u: string | undefined | null, base: string): string | null {
  if (!u) return null;
  try {
    const url = new URL(u.trim(), base);
    return /^https?:$/.test(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v !== "string") return null;
  const s = v.replace(/[^\d.,-]/g, "");
  // "1.299,00" (de) vs "1,299.00" (en)
  const normalized = /,\d{1,2}$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) && normalized !== "" ? n : null;
}

type Node = Record<string, unknown>;
const typesOf = (n: Node) => (Array.isArray(n["@type"]) ? (n["@type"] as unknown[]).map(String) : n["@type"] ? [String(n["@type"])] : []);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const firstStr = (v: unknown): string | null => (Array.isArray(v) ? str(v[0]) ?? (v[0] && typeof v[0] === "object" ? str((v[0] as Node).url) : null) : v && typeof v === "object" ? str((v as Node).url) ?? str((v as Node).name) : str(v));

function addressOf(v: unknown): PostalAddress | null {
  const a = (Array.isArray(v) ? v[0] : v) as Node | undefined;
  if (!a || typeof a !== "object") return typeof v === "string" && v.trim() ? { streetAddress: v.trim() } : null;
  const country = a.addressCountry && typeof a.addressCountry === "object" ? str((a.addressCountry as Node).name) : str(a.addressCountry);
  const out: PostalAddress = { streetAddress: str(a.streetAddress), postalCode: str(a.postalCode), addressLocality: str(a.addressLocality), addressRegion: str(a.addressRegion), addressCountry: country };
  return Object.values(out).some(Boolean) ? out : null;
}

export function extractPageFacts(html: string, url: string): PageFacts {
  const $ = cheerio.load(html);
  const meta = (sel: string) => text($(sel).first().attr("content")) || null;

  const nodes: Node[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const visit = (n: unknown) => {
        if (Array.isArray(n)) return n.forEach(visit);
        if (!n || typeof n !== "object") return;
        const o = n as Node;
        if (o["@graph"]) visit(o["@graph"]);
        if (o["@type"]) nodes.push(o);
      };
      visit(JSON.parse($(el).contents().text()));
    } catch {
      // invalid JSON-LD block
    }
  });
  const byType = (re: RegExp) => nodes.filter((n) => typesOf(n).some((t) => re.test(t)));
  const org = byType(/^(Organization|Corporation|OnlineStore|Brand|LocalBusiness|Store)$/)[0];
  const product = byType(/^Product$/)[0];
  const article = byType(/^(Article|BlogPosting|NewsArticle|TechArticle)$/)[0];
  const local = byType(/(LocalBusiness|Store|Restaurant|Service|Business)$/)[0];

  const sameAs = new Set<string>();
  for (const n of [org, local]) for (const s of Array.isArray(n?.sameAs) ? (n!.sameAs as unknown[]) : n?.sameAs ? [n.sameAs] : []) if (typeof s === "string" && /^https?:\/\//.test(s)) sameAs.add(s);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (SOCIAL.test(href) && !/\/(sharer|share|intent|dialog)\b|[?&](u|url)=/i.test(href)) {
      const u = abs(href, url);
      if (u) sameAs.add(u.replace(/\/+$/, ""));
    }
  });

  const tel = $('a[href^="tel:"]').first().attr("href")?.replace(/^tel:/, "").trim() || str(org?.telephone) || str(local?.telephone);
  const mail = $('a[href^="mailto:"]').first().attr("href")?.replace(/^mailto:/, "").split("?")[0]?.trim() || str(org?.email);

  const itemprop = (name: string) => text($(`[itemprop="${name}"]`).first().attr("content") ?? $(`[itemprop="${name}"]`).first().text()) || null;
  const microAddress: PostalAddress = { streetAddress: itemprop("streetAddress"), postalCode: itemprop("postalCode"), addressLocality: itemprop("addressLocality"), addressRegion: itemprop("addressRegion"), addressCountry: itemprop("addressCountry") };
  const address = addressOf(local?.address) ?? addressOf(org?.address) ?? (Object.values(microAddress).some(Boolean) ? microAddress : null);
  const hours = local?.openingHours ?? $('[itemprop="openingHours"]').map((_, el) => $(el).attr("content") ?? $(el).text()).get();
  const openingHours = (Array.isArray(hours) ? hours : [hours]).map((h) => text(String(h ?? ""))).filter(Boolean).slice(0, 14);

  // Product: existing JSON-LD → Open Graph / microdata
  const offers = (Array.isArray(product?.offers) ? product!.offers[0] : product?.offers) as Node | undefined;
  const ogPrice = meta('meta[property="product:price:amount"]') ?? meta('meta[property="og:price:amount"]') ?? itemprop("price");
  const productName = str(product?.name) ?? ($('meta[property="og:type"]').attr("content") === "product" ? meta('meta[property="og:title"]') : null) ?? (itemprop("price") ? itemprop("name") : null);
  const productFacts = productName
    ? {
        name: productName,
        description: str(product?.description) ?? meta('meta[property="og:description"]'),
        image: abs(firstStr(product?.image), url) ?? abs(meta('meta[property="og:image"]'), url),
        sku: str(product?.sku) ?? itemprop("sku"),
        gtin: str(product?.gtin13) ?? str(product?.gtin) ?? itemprop("gtin13"),
        brand: product?.brand && typeof product.brand === "object" ? str((product.brand as Node).name) : str(product?.brand),
        price: num(offers?.price ?? offers?.lowPrice ?? ogPrice),
        currency: str(offers?.priceCurrency) ?? meta('meta[property="product:price:currency"]') ?? meta('meta[property="og:price:currency"]') ?? itemprop("priceCurrency"),
        availability: str(offers?.availability) ?? meta('meta[property="product:availability"]') ?? meta('meta[property="og:availability"]'),
      }
    : null;

  // FAQs: JSON-LD FAQPage, else question headings followed by a paragraph.
  const faqs: PageFacts["faqs"] = [];
  for (const f of byType(/^FAQPage$/)) {
    for (const q of Array.isArray(f.mainEntity) ? (f.mainEntity as Node[]) : []) {
      const answer = (q.acceptedAnswer as Node | undefined)?.text;
      if (typeof q.name === "string" && typeof answer === "string") faqs.push({ question: text(q.name), answer: text(cheerio.load(answer).text()) });
    }
  }
  if (!faqs.length) {
    $("h2, h3, h4, summary, dt").each((_, el) => {
      const q = text($(el).text());
      if (!q.endsWith("?") || q.length > 200) return;
      const $el = $(el);
      const tag = (el as { tagName?: string }).tagName;
      const answer = tag === "summary" ? text($el.parent().clone().children("summary").remove().end().text()) : tag === "dt" ? text($el.next("dd").text()) : text($el.nextAll("p").first().text());
      if (answer.length >= 20) faqs.push({ question: q, answer: answer.slice(0, 1200) });
    });
  }

  // HowTo steps: first ordered list with 3+ items in the main content.
  const howToSteps: string[] = [];
  $("main ol, article ol, body ol")
    .first()
    .children("li")
    .each((_, li) => {
      const t = text($(li).text());
      if (t.length >= 8) howToSteps.push(t.slice(0, 300));
    });

  // Breadcrumbs: JSON-LD → breadcrumb nav → URL path.
  let breadcrumbs: PageFacts["breadcrumbs"] = [];
  const bl = byType(/^BreadcrumbList$/)[0];
  if (bl && Array.isArray(bl.itemListElement)) {
    breadcrumbs = (bl.itemListElement as Node[])
      .map((it) => ({ name: str(it.name) ?? (it.item && typeof it.item === "object" ? str((it.item as Node).name) : null) ?? "", url: abs(typeof it.item === "string" ? it.item : it.item && typeof it.item === "object" ? str((it.item as Node)["@id"]) ?? str((it.item as Node).url) : null, url) ?? "" }))
      .filter((c) => c.name && c.url);
  }
  if (breadcrumbs.length < 2) {
    const navLinks = $('nav[aria-label*="readcrumb"] a, .breadcrumb a, .breadcrumbs a, [class*="breadcrumb"] a')
      .map((_, a) => ({ name: text($(a).text()), url: abs($(a).attr("href"), url) ?? "" }))
      .get()
      .filter((c) => c.name && c.url);
    if (navLinks.length >= 1) breadcrumbs = navLinks;
  }
  const u = new URL(url);
  const title = text($("h1").first().text()) || meta('meta[property="og:title"]') || text($("title").first().text()) || null;
  if (breadcrumbs.length < 2) {
    const segs = u.pathname.split("/").filter(Boolean);
    if (segs.length) {
      breadcrumbs = [{ name: "Home", url: `${u.origin}/` }];
      segs.forEach((seg, i) => {
        const last = i === segs.length - 1;
        const name = last && title ? title : decodeURIComponent(seg).replace(/[-_]+/g, " ").replace(/\.\w+$/, "").replace(/^\w/, (c) => c.toUpperCase());
        breadcrumbs.push({ name, url: `${u.origin}/${segs.slice(0, i + 1).join("/")}${last && u.pathname.endsWith("/") ? "/" : ""}` });
      });
    }
  } else if (breadcrumbs[breadcrumbs.length - 1]!.url.replace(/\/+$/, "") !== url.replace(/[?#].*$/, "").replace(/\/+$/, "") && title) {
    breadcrumbs.push({ name: title, url: url.replace(/[?#].*$/, "") });
  }

  const website = byType(/^WebSite$/)[0];
  const action = (Array.isArray(website?.potentialAction) ? website!.potentialAction[0] : website?.potentialAction) as Node | undefined;
  const target = action?.target;
  const searchUrlTemplate = (typeof target === "string" ? target : target && typeof target === "object" ? str((target as Node).urlTemplate) : null) ?? null;

  return {
    url,
    canonical: abs($('link[rel="canonical"]').attr("href"), url),
    title,
    description: meta('meta[name="description"]') ?? meta('meta[property="og:description"]'),
    image: abs(meta('meta[property="og:image"]') ?? meta('meta[name="twitter:image"]'), url),
    lang: text($("html").attr("lang")) || null,
    siteName: meta('meta[property="og:site_name"]') ?? str(website?.name) ?? str(org?.name),
    ogType: meta('meta[property="og:type"]'),
    datePublished: meta('meta[property="article:published_time"]') ?? str(article?.datePublished) ?? (text($("time[datetime]").first().attr("datetime")) || null),
    dateModified: meta('meta[property="article:modified_time"]') ?? str(article?.dateModified),
    author: meta('meta[name="author"]') ?? (article?.author && typeof article.author === "object" ? firstStr(article.author) : str(article?.author)),
    logo: abs(firstStr(org?.logo), url) ?? abs($('link[rel="apple-touch-icon"]').attr("href"), url),
    sameAs: [...sameAs].slice(0, 20),
    telephone: tel || null,
    email: mail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail) ? mail : null,
    address,
    openingHours,
    product: productFacts,
    faqs: faqs.slice(0, 20),
    howToSteps: howToSteps.length >= 2 ? howToSteps.slice(0, 20) : [],
    breadcrumbs: breadcrumbs.slice(0, 10),
    searchUrlTemplate,
    existingTypes: [...new Set(nodes.flatMap(typesOf))],
  };
}

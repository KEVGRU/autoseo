/**
 * Matching of products named/shown in AI answers to the own product catalog
 * (`catalog_products`): GTIN → landing URL → normalized name. Pure module (unit tested).
 */

export type CatalogEntry = { id: string; name: string; url: string | null; gtin: string | null };
export type CatalogMatch = { catalogProductId: string; by: "gtin" | "url" | "name" };

/** Digits of a GTIN/EAN/UPC without leading zeros (GTIN-8/12/13/14 compare equal), or null. */
export function normalizeGtin(v: string | null | undefined): string | null {
  if (!v) return null;
  const digits = String(v).replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 14) return null;
  const trimmed = digits.replace(/^0+/, "");
  return trimmed.length >= 6 ? trimmed : null;
}

const LOCALE_SEGMENT = /^\/[a-z]{2}(-[a-z]{2})?(?=\/)/;

/** host (no www) + lower-cased path without locale prefix, query or trailing slash. */
export function normalizeProductUrl(v: string | null | undefined): string | null {
  if (!v) return null;
  try {
    const u = new URL(v.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    let path = decodeURIComponent(u.pathname).toLowerCase().replace(LOCALE_SEGMENT, "").replace(/\/+$/, "");
    // Shopify collection paths point to the same product page.
    path = path.replace(/^\/collections\/[^/]+(?=\/products\/)/, "");
    return `${host}${path || "/"}`;
  } catch {
    return null;
  }
}

/** Lower-case, diacritics removed, letters/digits only, single spaces. */
export function normalizeProductName(v: string): string {
  return v
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function tokens(v: string): string[] {
  return normalizeProductName(v).split(" ").filter(Boolean);
}

function tokenKey(v: string): string {
  return [...new Set(tokens(v))].sort().join(" ");
}

export type CatalogIndex = {
  byGtin: Map<string, string>;
  byUrl: Map<string, string>;
  byName: Map<string, string>;
  byTokens: Map<string, string>;
  /** For containment matches: catalog products with ≥ 2 name tokens. */
  multi: { id: string; tokens: string[] }[];
  size: number;
};

function setUnique(map: Map<string, string>, key: string | null, id: string, ambiguous: Set<string>) {
  if (!key) return;
  const cur = map.get(key);
  if (cur && cur !== id) ambiguous.add(key);
  else map.set(key, id);
}

export function buildCatalogIndex(entries: CatalogEntry[]): CatalogIndex {
  const idx: CatalogIndex = { byGtin: new Map(), byUrl: new Map(), byName: new Map(), byTokens: new Map(), multi: [], size: entries.length };
  const amb = { gtin: new Set<string>(), url: new Set<string>(), name: new Set<string>(), tokens: new Set<string>() };
  for (const e of entries) {
    setUnique(idx.byGtin, normalizeGtin(e.gtin), e.id, amb.gtin);
    setUnique(idx.byUrl, normalizeProductUrl(e.url), e.id, amb.url);
    const name = normalizeProductName(e.name);
    setUnique(idx.byName, name || null, e.id, amb.name);
    setUnique(idx.byTokens, tokenKey(e.name) || null, e.id, amb.tokens);
    const t = [...new Set(tokens(e.name))];
    if (t.length >= 2 && t.join("").length >= 6) idx.multi.push({ id: e.id, tokens: t });
  }
  // Keys shared by different catalog products (variants with the same name…) can't identify one product.
  for (const k of amb.gtin) idx.byGtin.delete(k);
  for (const k of amb.url) idx.byUrl.delete(k);
  for (const k of amb.name) idx.byName.delete(k);
  for (const k of amb.tokens) idx.byTokens.delete(k);
  return idx;
}

/** GTIN-like values in LLM-extracted product attributes ("EAN": "4260…"). */
export function gtinsFromAttributes(attrs: Record<string, string> | null | undefined): string[] {
  if (!attrs) return [];
  return Object.entries(attrs)
    .filter(([k]) => /gtin|ean|upc|barcode|isbn/i.test(k))
    .map(([, v]) => v);
}

export function matchCatalogProduct(p: { name: string; urls?: (string | null | undefined)[]; gtins?: (string | null | undefined)[] }, idx: CatalogIndex): CatalogMatch | null {
  if (!idx.size) return null;
  for (const g of p.gtins ?? []) {
    const id = idx.byGtin.get(normalizeGtin(g) ?? "");
    if (id) return { catalogProductId: id, by: "gtin" };
  }
  for (const u of p.urls ?? []) {
    const id = idx.byUrl.get(normalizeProductUrl(u) ?? "");
    if (id) return { catalogProductId: id, by: "url" };
  }
  const name = normalizeProductName(p.name);
  if (!name) return null;
  const exact = idx.byName.get(name) ?? idx.byTokens.get(tokenKey(p.name));
  if (exact) return { catalogProductId: exact, by: "name" };
  // Containment: every token of a (multi-token) catalog name appears in the AI product name,
  // with at most 3 extra tokens ("Solakon ON 800" ⊂ "Solakon ON 800 Balkonkraftwerk Set").
  const own = new Set(tokens(p.name));
  let best: { id: string; n: number } | null = null;
  let tie = false;
  for (const c of idx.multi) {
    if (own.size - c.tokens.length > 3) continue;
    if (!c.tokens.every((t) => own.has(t))) continue;
    if (!best || c.tokens.length > best.n) {
      best = { id: c.id, n: c.tokens.length };
      tie = false;
    } else if (c.tokens.length === best.n && c.id !== best.id) tie = true;
  }
  return best && !tie ? { catalogProductId: best.id, by: "name" } : null;
}

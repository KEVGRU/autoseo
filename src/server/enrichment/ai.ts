import "server-only";
import { z } from "zod";
import { runLlm, type LlmProvider, type LlmResult } from "@/server/ai/llm";
import { safeFetch } from "@/server/optimize/net";
import { buildCacheKey, cacheGet, cacheGetMany, cacheSet } from "@/server/seo/cache";
import { getCountry, getCountryByLocationCode } from "@/lib/countries";
import { languageLabel } from "@/server/seo/lib/locations";
import { normalizeIntent, normalizeKeyword, type KeywordIntent } from "@/server/seo/lib/keywords";
import type { EnrichmentCapability } from "./policy";
import { hostMatchesDomain, hostOf, matchCitations, normalizeUrl, statusProvesExistence, toAbsoluteUrl, trustedCitations, type UrlVerification } from "./urls";

/**
 * AI enrichment: an LLM with web search estimates the data DataForSEO would measure. Every result is labelled
 * (`meta.source = "ai"`, model, date, confidence), every URL is verified against the model's web-search citations or
 * a live request, trends are never invented, and results are cached under `ai:*` keys (source is part of the key).
 */

export type AiEnrichmentCtx = {
  projectId?: string | null;
  workspaceId?: string | null;
  userId?: string | null;
  /** Serve cached estimates only; a cache miss throws `AiCacheMissError` (callers without permission to run paid research). */
  cacheOnly?: boolean;
};

export class AiCacheMissError extends Error {
  constructor() {
    super("No cached AI estimate is available and you don't have permission to run new research.");
    this.name = "AiCacheMissError";
  }
}

/** Target market. The country/city is written into the prompt (web search has no location parameter). */
export type AiMarket = {
  locationCode?: number | null;
  /** ISO-3166 alpha-2 ("DE"); used when no location code is known. */
  country?: string | null;
  languageCode: string;
  /** City / region, e.g. "Berlin,Germany" (local rank tracking, local SEO). */
  locationName?: string | null;
};

export type Confidence = "low" | "medium" | "high";

export type AiEnrichmentMeta = {
  source: "ai";
  provider: LlmProvider;
  model: string;
  generatedAt: string;
  confidence: Confidence;
  /** Web-search citations the model returned (0 = answered from model knowledge only). */
  citations: number;
};

const CACHE_TTL_AI = {
  keywordMetrics: 7 * 24 * 60 * 60,
  keywordIdeas: 7 * 24 * 60 * 60,
  serp: 24 * 60 * 60,
  domain: 7 * 24 * 60 * 60,
  links: 7 * 24 * 60 * 60,
  local: 3 * 24 * 60 * 60,
  business: 3 * 24 * 60 * 60,
} as const;

const KEYWORD_METRICS_BATCH = 50;

/* ───────────────────────────── Lenient schemas (normalized after parsing) ───────────────────────────── */

const num = z.union([z.number(), z.string(), z.null()]).optional();
const str = z.union([z.string(), z.null()]).optional();

const keywordMetricSchema = z.object({
  keyword: z.string(),
  searchVolume: num,
  cpcUsd: num,
  difficulty: num,
  intent: str,
  trend: str,
  confidence: str,
});
const keywordMetricsSchema = z.object({
  keywords: z.array(keywordMetricSchema),
});

const serpSchema = z.object({
  items: z.array(z.object({ position: num, url: z.string(), title: str, description: str })),
  features: z.array(z.string()).optional(),
  confidence: str,
});

const domainProfileSchema = z.object({
  organicTrafficEst: num,
  organicKeywordsEst: num,
  topKeywords: z
    .array(
      z.object({
        keyword: z.string(),
        positionEst: num,
        volumeEst: num,
        url: str,
      }),
    )
    .optional(),
  topPages: z.array(z.object({ url: z.string(), share: num, keywordsEst: num })).optional(),
  competitors: z.array(z.object({ domain: z.string(), overlap: num })).optional(),
  confidence: str,
});

const linkMentionsSchema = z.object({
  items: z.array(
    z.object({
      url: z.string(),
      title: str,
      snippet: str,
      linksToDomain: z.union([z.boolean(), z.null()]).optional(),
    }),
  ),
  confidence: str,
});

const localListingsSchema = z.object({
  items: z.array(
    z.object({
      position: num,
      name: z.string(),
      category: str,
      address: str,
      rating: num,
      reviews: num,
      url: str,
      phone: str,
    }),
  ),
  confidence: str,
});

const businessProfileSchema = z.object({
  found: z.boolean(),
  name: str,
  category: str,
  address: str,
  phone: str,
  website: str,
  rating: num,
  reviews: num,
  hours: str,
  description: str,
  reviewsSummary: z
    .object({
      sentiment: str,
      summary: str,
      positives: z.array(z.string()).optional(),
      negatives: z.array(z.string()).optional(),
    })
    .nullable()
    .optional(),
  qaSummary: str,
  postsSummary: str,
  confidence: str,
});

/* ───────────────────────────── Normalizers ───────────────────────────── */

export function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const s = v
    .trim()
    .toLowerCase()
    .replace(/[$€£\s]/g, "");
  if (!s) return null;
  const mult = s.endsWith("k") ? 1_000 : s.endsWith("m") ? 1_000_000 : 1;
  const cleaned = s.replace(/[km]$/, "");
  // "1,200" / "1.200" thousands separators vs "0,85" decimal comma.
  const normalized = /^\d{1,3}([.,]\d{3})+$/.test(cleaned) ? cleaned.replace(/[.,]/g, "") : cleaned.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n * mult : null;
}

function toInt(v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  const n = toNumber(v);
  if (n == null) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function toRatio(v: unknown): number | null {
  const n = toNumber(v);
  if (n == null) return null;
  const r = n > 1 ? n / 100 : n;
  return Math.min(1, Math.max(0, r));
}

export function toConfidence(v: unknown, fallback: Confidence = "low"): Confidence {
  const s = typeof v === "string" ? v.toLowerCase() : "";
  return s.includes("high") ? "high" : s.includes("med") ? "medium" : s.includes("low") ? "low" : fallback;
}

function toTrend(v: unknown): "up" | "flat" | "down" | null {
  const s = typeof v === "string" ? v.toLowerCase() : "";
  if (/up|ris|grow|incr/.test(s)) return "up";
  if (/down|fall|decl|decr/.test(s)) return "down";
  if (/flat|stable|steady/.test(s)) return "flat";
  return null;
}

function cleanText(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, " ").trim();
  return s ? s.slice(0, max) : null;
}

/* ───────────────────────────── Market + LLM plumbing ───────────────────────────── */

export function describeMarket(market: AiMarket): string {
  const country = getCountryByLocationCode(market.locationCode ?? null) ?? getCountry(market.country ?? null);
  const parts = [country ? `country: ${country.name} (${country.iso === "UK" ? "GB" : country.iso})` : "country: worldwide"];
  if (market.locationName)
    parts.push(
      `location: ${market.locationName
        .split(",")
        .map((p) => p.trim())
        .join(", ")}`,
    );
  parts.push(`language: ${languageLabel(market.languageCode)} (${market.languageCode})`);
  return parts.join("; ");
}

function marketKey(market: AiMarket) {
  return {
    locationCode: market.locationCode ?? null,
    country: market.country ?? null,
    languageCode: market.languageCode,
    locationName: market.locationName ?? null,
  };
}

const SYSTEM = [
  "You are a meticulous SEO data analyst working for an SEO platform.",
  "Use web search to ground every answer in real, current evidence (search results, the sites themselves, public SEO tool pages, Google Trends, autocomplete, forums).",
  "You do NOT have access to Google Ads, Search Console or backlink indexes — your numbers are estimates; be conservative and consistent.",
  "Never invent URLs: only return URLs you actually saw in web search results or on fetched pages. Use null when you have no basis for a value.",
  "Answer with the requested JSON only.",
].join(" ");

type LlmOut<S extends z.ZodType> = LlmResult<z.infer<S>>;

async function enrichLlm<S extends z.ZodType>(
  ctx: AiEnrichmentCtx,
  capability: EnrichmentCapability,
  prompt: string,
  schema: S,
  maxTokens = 12_000,
): Promise<LlmOut<S>> {
  if (ctx.cacheOnly) throw new AiCacheMissError();
  // Views load several panels in parallel (e.g. domain overview + keywords tab) — identical requests share one call.
  const key = `${ctx.workspaceId ?? ""}:${capability}:${prompt}`;
  const pending = inflight.get(key);
  if (pending) return pending as Promise<LlmOut<S>>;
  const call = (
    runLlm({
      purpose: `enrich_${capability}`,
      system: SYSTEM,
      prompt,
      schema,
      webSearch: true,
      meta: { enrichment: true, source: "ai", capability },
      agentMode: "lean",
      maxTokens,
      timeoutMs: 8 * 60_000,
      projectId: ctx.projectId ?? null,
      workspaceId: ctx.workspaceId ?? null,
      userId: ctx.userId ?? null,
    }) as Promise<LlmOut<S>>
  ).finally(() => inflight.delete(key));
  inflight.set(key, call);
  return call;
}

const inflight = new Map<string, Promise<unknown>>();

/** Concurrent identical requests (parallel panels of one view) share one in-flight promise. */
const sharedCalls = new Map<string, Promise<unknown>>();
function shared<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const pending = sharedCalls.get(key);
  if (pending) return pending as Promise<T>;
  const call = fn().finally(() => sharedCalls.delete(key));
  sharedCalls.set(key, call);
  return call;
}

/** Confidence can only go down when the model had no web search evidence (every router backend searches, OpenRouter via its web plugin). */
function effectiveConfidence(res: { provider: LlmProvider; citations: unknown[] }, stated: Confidence): Confidence {
  if (res.citations.length === 0) return "low";
  return stated;
}

function metaOf(res: { provider: LlmProvider; model: string; citations: unknown[] }, confidence: Confidence): AiEnrichmentMeta {
  return {
    source: "ai",
    provider: res.provider,
    model: res.model,
    generatedAt: new Date().toISOString(),
    confidence: effectiveConfidence(res, confidence),
    citations: res.citations.length,
  };
}

/* ───────────────────────────── URL verification ───────────────────────────── */

async function isReachable(url: string): Promise<boolean> {
  try {
    const head = await safeFetch(url, {
      method: "HEAD",
      timeoutMs: 6_000,
      maxBytes: 64 * 1024,
    });
    if (statusProvesExistence(head.status)) return true;
    if (head.status !== 405 && head.status !== 501 && head.status !== 400) return false;
    const get = await safeFetch(url, {
      timeoutMs: 8_000,
      maxBytes: 256 * 1024,
    });
    return statusProvesExistence(get.status);
  } catch (err) {
    // A body larger than maxBytes still proves the page exists.
    return err instanceof Error && /Response larger than/.test(err.message);
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return out;
}

/**
 * Keeps only URLs backed by evidence: cited by the web search (exact or same host) or proven to exist by a live,
 * SSRF-safe request. Returns the verification level per URL (absent = dropped).
 */
export async function verifyUrls(
  urls: string[],
  res: {
    provider: LlmProvider;
    citations: { url: string; title?: string }[];
    text: string;
  },
  opts: { maxLiveChecks?: number } = {},
): Promise<Map<string, UrlVerification>> {
  const unique = [...new Set(urls)];
  const matched = matchCitations(unique, trustedCitations(res.provider, res.citations, res.text));
  const out = new Map<string, UrlVerification>();
  const pending: string[] = [];
  for (const url of unique) {
    const m = matched.get(url);
    if (m) out.set(url, m);
    else pending.push(url);
  }
  const toCheck = pending.slice(0, opts.maxLiveChecks ?? 40);
  const results = await mapLimit(toCheck, 6, isReachable);
  toCheck.forEach((url, i) => {
    if (results[i]) out.set(url, "reachable");
  });
  return out;
}

/* ───────────────────────────── Keyword metrics ───────────────────────────── */

export type AiKeywordMetric = {
  keyword: string;
  searchVolume: number | null;
  cpcUsd: number | null;
  difficulty: number | null;
  intent: KeywordIntent | null;
  trend: "up" | "flat" | "down" | null;
  confidence: Confidence;
};

type CachedMetric = AiKeywordMetric & { meta: AiEnrichmentMeta };

function mapMetric(raw: z.infer<typeof keywordMetricSchema>, keyword: string, fallback: Confidence): AiKeywordMetric {
  const intent = raw.intent ? normalizeIntent(raw.intent) : null;
  return {
    keyword,
    searchVolume: toInt(raw.searchVolume),
    cpcUsd: (() => {
      const n = toNumber(raw.cpcUsd);
      return n == null ? null : Math.max(0, Math.round(n * 100) / 100);
    })(),
    difficulty: toInt(raw.difficulty, 0, 100),
    intent: intent === "unknown" ? null : intent,
    trend: toTrend(raw.trend),
    confidence: toConfidence(raw.confidence, fallback),
  };
}

/**
 * Estimated search volume / CPC / difficulty / intent for a keyword list (batches of 50, cached per keyword for 7 days).
 * Keywords the model skips are returned with null metrics.
 */
export async function aiKeywordMetrics(
  ctx: AiEnrichmentCtx,
  input: { keywords: string[]; market: AiMarket },
): Promise<{
  rows: AiKeywordMetric[];
  meta: AiEnrichmentMeta | null;
  cachedCount: number;
}> {
  const keywords = [...new Set(input.keywords.map(normalizeKeyword).filter(Boolean))];
  const keyOf = (k: string) =>
    buildCacheKey("ai:kw-metric", {
      workspaceId: ctx.workspaceId ?? null,
      keyword: k,
      ...marketKey(input.market),
    });
  const cached = await cacheGetMany<CachedMetric>(keywords.map(keyOf));
  const byKeyword = new Map<string, CachedMetric>();
  for (const k of keywords) {
    const hit = cached.get(keyOf(k));
    if (hit) byKeyword.set(k, hit.value);
  }
  const cachedCount = byKeyword.size;
  const missing = keywords.filter((k) => !byKeyword.has(k));
  let lastMeta: AiEnrichmentMeta | null = cachedCount ? ([...byKeyword.values()][0]?.meta ?? null) : null;

  for (let i = 0; i < missing.length; i += KEYWORD_METRICS_BATCH) {
    const batch = missing.slice(i, i + KEYWORD_METRICS_BATCH);
    const res = await enrichLlm(
      ctx,
      "keyword_metrics",
      [
        `Market — ${describeMarket(input.market)}.`,
        "Estimate Google search metrics for every keyword below in this market:",
        "- searchVolume: average monthly Google searches over the last 12 months (integer);",
        "- cpcUsd: typical Google Ads cost per click in USD (number, null if nobody advertises);",
        "- difficulty: 0–100, how hard it is to reach Google's top 10 organically (look at who ranks);",
        "- intent: informational | commercial | transactional | navigational;",
        "- trend: up | flat | down over the last 12 months;",
        "- confidence: low | medium | high.",
        "Return one entry per keyword, keeping each keyword exactly as written.",
        'JSON shape: {"keywords":[{"keyword":"…","searchVolume":0,"cpcUsd":0,"difficulty":0,"intent":"…","trend":"…","confidence":"…"}]}',
        "",
        "Keywords:",
        ...batch.map((k, idx) => `${idx + 1}. ${k}`),
      ].join("\n"),
      keywordMetricsSchema,
      Math.min(16_000, 1_500 + batch.length * 120),
    );
    const meta = metaOf(res, "medium");
    lastMeta = meta;
    const wanted = new Set(batch);
    const rows: CachedMetric[] = [];
    for (const raw of res.data.keywords) {
      const k = normalizeKeyword(raw.keyword);
      if (!wanted.has(k) || byKeyword.has(k)) continue;
      const metric = { ...mapMetric(raw, k, meta.confidence), meta };
      if (meta.confidence === "low") metric.confidence = "low";
      byKeyword.set(k, metric);
      rows.push(metric);
    }
    await Promise.all(rows.map((r) => cacheSet(keyOf(r.keyword), "ai:kw-metric", null, r, CACHE_TTL_AI.keywordMetrics)));
  }

  const rows = keywords.map(
    (k) =>
      byKeyword.get(k) ?? {
        keyword: k,
        searchVolume: null,
        cpcUsd: null,
        difficulty: null,
        intent: null,
        trend: null,
        confidence: "low" as Confidence,
      },
  );
  return {
    rows: rows.map(({ keyword, searchVolume, cpcUsd, difficulty, intent, trend, confidence }) => ({
      keyword,
      searchVolume,
      cpcUsd,
      difficulty,
      intent,
      trend,
      confidence,
    })),
    meta: lastMeta,
    cachedCount,
  };
}

/* ───────────────────────────── Keyword ideas ───────────────────────────── */

/** Related keyword ideas with estimated metrics (seed first). Cached 7 days. Never returns monthly trends. */
async function aiKeywordIdeasImpl(
  ctx: AiEnrichmentCtx,
  input: { seed: string; market: AiMarket; limit?: number },
): Promise<{
  rows: AiKeywordMetric[];
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  const seed = normalizeKeyword(input.seed);
  const limit = Math.min(100, Math.max(10, input.limit ?? 50));
  const key = buildCacheKey("ai:kw-ideas", {
    workspaceId: ctx.workspaceId ?? null,
    seed,
    limit,
    ...marketKey(input.market),
  });
  const hit = await cacheGet<{
    rows: AiKeywordMetric[];
    meta: AiEnrichmentMeta;
  }>(key);
  if (hit) return { ...hit.value, cached: true };

  const res = await enrichLlm(
    ctx,
    "keyword_ideas",
    [
      `Market — ${describeMarket(input.market)}.`,
      `Research Google keyword ideas for the seed keyword "${seed}".`,
      "Use web search to find what people really type: autocomplete-style variations, related searches, “people also ask” questions, competitor page titles, forums.",
      `Return up to ${limit} distinct keywords in ${languageLabel(input.market.languageCode)}, starting with the seed keyword itself, ordered by estimated monthly searches (highest first).`,
      "For each keyword estimate: searchVolume (avg monthly Google searches, integer), cpcUsd, difficulty (0–100), intent (informational | commercial | transactional | navigational), trend (up | flat | down) and confidence (low | medium | high).",
      'JSON shape: {"keywords":[{"keyword":"…","searchVolume":0,"cpcUsd":0,"difficulty":0,"intent":"…","trend":"…","confidence":"…"}]}',
    ].join("\n"),
    keywordMetricsSchema,
    Math.min(16_000, 2_000 + limit * 120),
  );
  const meta = metaOf(res, "medium");
  const seen = new Set<string>();
  const rows: AiKeywordMetric[] = [];
  for (const raw of res.data.keywords) {
    const k = normalizeKeyword(raw.keyword);
    if (!k || k.length > 200 || seen.has(k)) continue;
    seen.add(k);
    const metric = mapMetric(raw, k, meta.confidence);
    if (meta.confidence === "low") metric.confidence = "low";
    rows.push(metric);
    if (rows.length >= limit) break;
  }
  if (!seen.has(seed))
    rows.unshift({
      keyword: seed,
      searchVolume: null,
      cpcUsd: null,
      difficulty: null,
      intent: null,
      trend: null,
      confidence: "low",
    });
  if (rows.length > 1) await cacheSet(key, "ai:kw-ideas", null, { rows, meta }, CACHE_TTL_AI.keywordIdeas);
  return { rows, meta, cached: false };
}

export function aiKeywordIdeas(
  ctx: AiEnrichmentCtx,
  input: { seed: string; market: AiMarket; limit?: number },
): Promise<{
  rows: AiKeywordMetric[];
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  return shared(`aiKeywordIdeas:${JSON.stringify([ctx.workspaceId ?? null, Boolean(ctx.cacheOnly), input])}`, () => aiKeywordIdeasImpl(ctx, input));
}

/* ───────────────────────────── SERP ───────────────────────────── */

export type AiSerpItem = {
  position: number;
  url: string;
  domain: string;
  title: string;
  description: string | null;
  verification: UrlVerification;
};

/**
 * Top organic results for a query as observed via web search (max 20). URLs that the search did not return and a live
 * request cannot confirm are dropped; positions are renumbered after dropping. Cached 24h.
 */
async function aiSerpImpl(
  ctx: AiEnrichmentCtx,
  input: {
    keyword: string;
    market: AiMarket;
    device?: "desktop" | "mobile";
    depth?: number;
  },
): Promise<{
  items: AiSerpItem[];
  features: string[];
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  const keyword = normalizeKeyword(input.keyword);
  const depth = Math.min(20, Math.max(5, input.depth ?? 20));
  const device = input.device ?? "desktop";
  const key = buildCacheKey("ai:serp", {
    workspaceId: ctx.workspaceId ?? null,
    keyword,
    device,
    depth,
    ...marketKey(input.market),
  });
  const hit = await cacheGet<{
    items: AiSerpItem[];
    features: string[];
    meta: AiEnrichmentMeta;
  }>(key);
  if (hit) return { ...hit.value, cached: true };

  const res = await enrichLlm(
    ctx,
    "serp",
    [
      `Market — ${describeMarket(input.market)}; device: ${device}.`,
      `Search the web for the query "${keyword}" the way a Google user in this market would, and list the top ${depth} ORGANIC results in ranking order (no ads, no map pack, no AI overview, no “people also ask”).`,
      "For each result give the exact URL you saw in the search results, its title and snippet. Only include URLs you actually saw — never guess or construct a URL.",
      "Also list the SERP features you believe appear for this query (e.g. featured_snippet, people_also_ask, local_pack, ai_overview, video, images, shopping, top_stories).",
      'JSON shape: {"items":[{"position":1,"url":"https://…","title":"…","description":"…"}],"features":["…"],"confidence":"low|medium|high"}',
    ].join("\n"),
    serpSchema,
    6_000,
  );
  const meta = metaOf(res, toConfidence(res.data.confidence, "medium"));
  const candidates = res.data.items
    .map((i, idx) => ({
      ...i,
      url: toAbsoluteUrl(i.url),
      order: toNumber(i.position) ?? idx + 1,
    }))
    .filter((i): i is typeof i & { url: string } => i.url != null)
    .sort((a, b) => a.order - b.order);
  const verified = await verifyUrls(
    candidates.map((c) => c.url),
    res,
    { maxLiveChecks: depth },
  );
  const seen = new Set<string>();
  const items: AiSerpItem[] = [];
  for (const c of candidates) {
    const v = verified.get(c.url);
    const n = normalizeUrl(c.url);
    if (!v || !n || seen.has(n)) continue;
    seen.add(n);
    items.push({
      position: items.length + 1,
      url: c.url,
      domain: hostOf(c.url) ?? "",
      title: cleanText(c.title, 300) ?? hostOf(c.url) ?? c.url,
      description: cleanText(c.description, 500),
      verification: v,
    });
    if (items.length >= depth) break;
  }
  const features = [
    ...new Set(
      (res.data.features ?? [])
        .map((f) =>
          f
            .toLowerCase()
            .trim()
            .replace(/[\s-]+/g, "_"),
        )
        .filter(Boolean),
    ),
  ].slice(0, 12);
  if (items.length) await cacheSet(key, "ai:serp", null, { items, features, meta }, CACHE_TTL_AI.serp);
  return { items, features, meta, cached: false };
}

export function aiSerp(
  ctx: AiEnrichmentCtx,
  input: {
    keyword: string;
    market: AiMarket;
    device?: "desktop" | "mobile";
    depth?: number;
  },
): Promise<{
  items: AiSerpItem[];
  features: string[];
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  return shared(`aiSerp:${JSON.stringify([ctx.workspaceId ?? null, Boolean(ctx.cacheOnly), input])}`, () => aiSerpImpl(ctx, input));
}

/* ───────────────────────────── Domain profile ───────────────────────────── */

export type AiDomainProfile = {
  domain: string;
  organicTrafficEst: number | null;
  organicKeywordsEst: number | null;
  topKeywords: {
    keyword: string;
    positionEst: number | null;
    volumeEst: number | null;
    url: string | null;
  }[];
  topPages: {
    url: string;
    share: number | null;
    keywordsEst: number | null;
    verification: UrlVerification;
  }[];
  competitors: { domain: string; overlap: number | null }[];
  confidence: Confidence;
};

/**
 * One web-search call estimating a domain's organic footprint (traffic, keywords, top pages, competitors).
 * Page URLs must belong to the domain and be verified. Cached 7 days.
 */
async function aiDomainProfileImpl(
  ctx: AiEnrichmentCtx,
  input: { domain: string; market: AiMarket },
): Promise<{
  profile: AiDomainProfile;
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  const domain = hostOf(input.domain);
  if (!domain) throw new Error(`"${input.domain}" is not a valid domain.`);
  const key = buildCacheKey("ai:domain", {
    workspaceId: ctx.workspaceId ?? null,
    domain,
    ...marketKey(input.market),
  });
  const hit = await cacheGet<{
    profile: AiDomainProfile;
    meta: AiEnrichmentMeta;
  }>(key);
  if (hit) return { ...hit.value, cached: true };

  const res = await enrichLlm(
    ctx,
    "domain",
    [
      `Market — ${describeMarket(input.market)}.`,
      `Analyze the organic Google search footprint of the website ${domain} in this market.`,
      `Use web search: "site:${domain}" queries, the site's own pages, its sitemap and navigation, and public SEO-tool pages (e.g. Similarweb, Semrush, Ahrefs snippets) when available.`,
      "Estimate:",
      "- organicTrafficEst: monthly organic Google visits in this market;",
      "- organicKeywordsEst: number of keywords it ranks for in the top 100;",
      `- topKeywords: up to 50 keywords it most likely ranks for, with positionEst (1–100), volumeEst (monthly searches) and the ranking URL on ${domain};`,
      `- topPages: up to 25 URLs on ${domain} that attract the most organic traffic, with share (0–1 of the domain's organic traffic) and keywordsEst;`,
      "- competitors: up to 15 domains competing for the same organic keywords, with overlap (0–1);",
      "- confidence: low | medium | high.",
      `Only list URLs on ${domain} that you actually saw.`,
      'JSON shape: {"organicTrafficEst":0,"organicKeywordsEst":0,"topKeywords":[{"keyword":"…","positionEst":1,"volumeEst":0,"url":"https://…"}],"topPages":[{"url":"https://…","share":0.1,"keywordsEst":0}],"competitors":[{"domain":"…","overlap":0.3}],"confidence":"…"}',
    ].join("\n"),
    domainProfileSchema,
    12_000,
  );
  const meta = metaOf(res, toConfidence(res.data.confidence, "low"));
  const onDomain = (u: string | null) => {
    const abs = toAbsoluteUrl(u);
    const h = abs ? hostOf(abs) : null;
    return abs && h && hostMatchesDomain(h, domain) ? abs : null;
  };
  const pageCandidates = (res.data.topPages ?? []).map((p) => ({ ...p, url: onDomain(p.url) })).filter((p): p is typeof p & { url: string } => p.url != null);
  const keywordUrls = (res.data.topKeywords ?? []).map((k) => onDomain(k.url ?? null)).filter((u): u is string => u != null);
  const verified = await verifyUrls([...pageCandidates.map((p) => p.url), ...keywordUrls], res, { maxLiveChecks: 40 });

  const seenPages = new Set<string>();
  const topPages: AiDomainProfile["topPages"] = [];
  for (const p of pageCandidates) {
    const v = verified.get(p.url);
    const n = normalizeUrl(p.url);
    if (!v || !n || seenPages.has(n)) continue;
    seenPages.add(n);
    topPages.push({
      url: p.url,
      share: toRatio(p.share),
      keywordsEst: toInt(p.keywordsEst),
      verification: v,
    });
    if (topPages.length >= 25) break;
  }
  const seenKw = new Set<string>();
  const topKeywords: AiDomainProfile["topKeywords"] = [];
  for (const k of res.data.topKeywords ?? []) {
    const kw = normalizeKeyword(k.keyword);
    if (!kw || seenKw.has(kw)) continue;
    seenKw.add(kw);
    const url = onDomain(k.url ?? null);
    topKeywords.push({
      keyword: kw,
      positionEst: toInt(k.positionEst, 1, 100),
      volumeEst: toInt(k.volumeEst),
      url: url && verified.has(url) ? url : null,
    });
    if (topKeywords.length >= 100) break;
  }
  const seenComp = new Set<string>([domain]);
  const competitors: AiDomainProfile["competitors"] = [];
  for (const c of res.data.competitors ?? []) {
    const h = hostOf(c.domain);
    if (!h || seenComp.has(h) || hostMatchesDomain(h, domain)) continue;
    seenComp.add(h);
    competitors.push({ domain: h, overlap: toRatio(c.overlap) });
    if (competitors.length >= 20) break;
  }
  const profile: AiDomainProfile = {
    domain,
    organicTrafficEst: toInt(res.data.organicTrafficEst),
    organicKeywordsEst: toInt(res.data.organicKeywordsEst),
    topKeywords,
    topPages,
    competitors,
    confidence: meta.confidence,
  };
  await cacheSet(key, "ai:domain", null, { profile, meta }, CACHE_TTL_AI.domain);
  return { profile, meta, cached: false };
}

export function aiDomainProfile(
  ctx: AiEnrichmentCtx,
  input: { domain: string; market: AiMarket },
): Promise<{
  profile: AiDomainProfile;
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  return shared(`aiDomainProfile:${JSON.stringify([ctx.workspaceId ?? null, Boolean(ctx.cacheOnly), input])}`, () => aiDomainProfileImpl(ctx, input));
}

/* ───────────────────────────── Link mentions (backlink sample) ───────────────────────────── */

export type AiLinkMention = {
  url: string;
  domain: string;
  title: string | null;
  snippet: string | null;
  /** true = the fetched page contains a link to the domain; false = mentions it without a link; null = page not fetchable. */
  linksToDomain: boolean | null;
  /** Links to the domain found on the fetched page (≤5): target URL, anchor text, rel=nofollow/ugc/sponsored. */
  links: { url: string; anchor: string | null; nofollow: boolean }[];
  verification: UrlVerification;
};

type PageInspection = {
  reachable: boolean;
  links: AiLinkMention["links"] | null;
  mentions: boolean | null;
};

/** Checks a fetched page for hyperlinks to / textual mentions of the domain (real, measured link data). */
async function inspectMention(url: string, domain: string): Promise<PageInspection> {
  try {
    const res = await safeFetch(url, {
      timeoutMs: 10_000,
      maxBytes: 3 * 1024 * 1024,
      headers: { accept: "text/html,*/*;q=0.5" },
    });
    if (!statusProvesExistence(res.status)) return { reachable: false, links: null, mentions: null };
    if (!res.ok) return { reachable: true, links: null, mentions: null };
    const html = res.text();
    const links = extractLinksToDomain(html, url, domain);
    return {
      reachable: true,
      links,
      mentions: links.length > 0 || html.toLowerCase().includes(domain),
    };
  } catch (err) {
    const big = err instanceof Error && /Response larger than/.test(err.message);
    return { reachable: big, links: null, mentions: null };
  }
}

/** `<a href>` elements of an HTML page that point to `domain` (or a subdomain). */
export function extractLinksToDomain(html: string, pageUrl: string, domain: string, max = 5): AiLinkMention["links"] {
  const out: AiLinkMention["links"] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1] ?? "";
    const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    const raw = href?.[1] ?? href?.[2] ?? href?.[3];
    if (!raw) continue;
    let target: URL;
    try {
      target = new URL(raw.replace(/&amp;/g, "&"), pageUrl);
    } catch {
      continue;
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") continue;
    if (!hostMatchesDomain(target.hostname, domain)) continue;
    const key = target.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    const rel = /\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    const relValue = (rel?.[1] ?? rel?.[2] ?? rel?.[3] ?? "").toLowerCase();
    const anchor = (m[2] ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    out.push({
      url: key,
      anchor: anchor ? anchor.slice(0, 200) : null,
      nofollow: /nofollow|ugc|sponsored/.test(relValue),
    });
    if (out.length >= max) break;
  }
  return out;
}

/**
 * A SAMPLE of external pages that mention or link to a domain, found via web search and checked live (the page must
 * exist and — when fetchable — actually mention/link the domain). Not a backlink index: no totals, history or spam scores.
 */
async function aiLinkMentionsImpl(
  ctx: AiEnrichmentCtx,
  input: { domain: string; brandName?: string | null; limit?: number },
): Promise<{
  items: AiLinkMention[];
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  const domain = hostOf(input.domain);
  if (!domain) throw new Error(`"${input.domain}" is not a valid domain.`);
  const limit = Math.min(50, Math.max(5, input.limit ?? 30));
  const key = buildCacheKey("ai:links", {
    workspaceId: ctx.workspaceId ?? null,
    domain,
    limit,
  });
  const hit = await cacheGet<{
    items: AiLinkMention[];
    meta: AiEnrichmentMeta;
  }>(key);
  if (hit) return { ...hit.value, cached: true };

  const brand = input.brandName?.trim();
  const res = await enrichLlm(
    ctx,
    "backlinks",
    [
      `Find web pages on OTHER websites that link to or mention ${domain}${brand ? ` (brand: "${brand}")` : ""}.`,
      `Use several web searches, e.g. "${domain}" -site:${domain}${brand ? `, "${brand}" reviews, "${brand}" press, "${brand}" directory listings, forum threads` : ", reviews, press coverage, directories, forum threads"}.`,
      `Return up to ${limit} distinct pages (never pages on ${domain} itself) with the exact URL you saw, the page title, a short snippet of the mention and whether you saw a hyperlink to ${domain} (true/false/null).`,
      'JSON shape: {"items":[{"url":"https://…","title":"…","snippet":"…","linksToDomain":true}],"confidence":"low|medium|high"}',
    ].join("\n"),
    linkMentionsSchema,
    8_000,
  );
  const meta = metaOf(res, toConfidence(res.data.confidence, "low"));
  const seen = new Set<string>();
  const candidates = res.data.items
    .map((i) => ({ ...i, url: toAbsoluteUrl(i.url) }))
    .filter((i): i is typeof i & { url: string } => {
      if (!i.url) return false;
      const h = hostOf(i.url);
      const n = normalizeUrl(i.url);
      if (!h || !n || hostMatchesDomain(h, domain) || seen.has(n)) return false;
      seen.add(n);
      return true;
    })
    .slice(0, limit);
  const cited = matchCitations(
    candidates.map((c) => c.url),
    trustedCitations(res.provider, res.citations, res.text),
  );
  const inspected = await mapLimit(candidates, 6, (c) => inspectMention(c.url, domain));
  const items: AiLinkMention[] = [];
  candidates.forEach((c, idx) => {
    const page = inspected[idx]!;
    const citation = cited.get(c.url);
    // Fetched page without any mention of the domain → hallucinated or stale; drop it.
    if (page.mentions === false) return;
    if (!page.reachable && citation !== "cited") return;
    items.push({
      url: c.url,
      domain: hostOf(c.url) ?? "",
      title: cleanText(c.title, 300),
      snippet: cleanText(c.snippet, 400),
      linksToDomain: page.links == null ? null : page.links.length > 0,
      links: page.links ?? [],
      verification: page.reachable ? (citation ?? "reachable") : "cited",
    });
  });
  await cacheSet(key, "ai:links", null, { items, meta }, CACHE_TTL_AI.links);
  return { items, meta, cached: false };
}

export function aiLinkMentions(
  ctx: AiEnrichmentCtx,
  input: { domain: string; brandName?: string | null; limit?: number },
): Promise<{
  items: AiLinkMention[];
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  return shared(`aiLinkMentions:${JSON.stringify([ctx.workspaceId ?? null, Boolean(ctx.cacheOnly), input])}`, () => aiLinkMentionsImpl(ctx, input));
}

/* ───────────────────────────── Local listings ───────────────────────────── */

export type AiLocalListing = {
  position: number;
  name: string;
  category: string | null;
  address: string | null;
  rating: number | null;
  reviews: number | null;
  /** Website, verified (else null). */
  url: string | null;
  phone: string | null;
};

/** Businesses a Google Maps search would list for `query` near `place` (max 20). Cached 3 days. */
async function aiLocalListingsImpl(
  ctx: AiEnrichmentCtx,
  input: { query: string; place: string; market: AiMarket; limit?: number },
): Promise<{
  items: AiLocalListing[];
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  const query = input.query.trim();
  const place = input.place.trim();
  const limit = Math.min(20, Math.max(3, input.limit ?? 10));
  const key = buildCacheKey("ai:local", {
    workspaceId: ctx.workspaceId ?? null,
    query: query.toLowerCase(),
    place: place.toLowerCase(),
    limit,
    ...marketKey(input.market),
  });
  const hit = await cacheGet<{
    items: AiLocalListing[];
    meta: AiEnrichmentMeta;
  }>(key);
  if (hit) return { ...hit.value, cached: true };

  const res = await enrichLlm(
    ctx,
    "local",
    [
      `Market — ${describeMarket(input.market)}.`,
      `Find the local businesses Google Maps would list for the search "${query}" near ${place}.`,
      "Use web search (maps listings, business directories, review sites, the businesses' own websites).",
      `Return up to ${limit} real businesses in the order they would most likely rank, each with name, primary category, full address, Google rating (0–5), number of Google reviews, website URL and phone. Use null for anything you could not find.`,
      'JSON shape: {"items":[{"position":1,"name":"…","category":"…","address":"…","rating":4.5,"reviews":120,"url":"https://…","phone":"…"}],"confidence":"low|medium|high"}',
    ].join("\n"),
    localListingsSchema,
    6_000,
  );
  const meta = metaOf(res, toConfidence(res.data.confidence, "low"));
  const sorted = res.data.items
    .map((i, idx) => ({ ...i, order: toNumber(i.position) ?? idx + 1 }))
    .filter((i) => cleanText(i.name, 200))
    .sort((a, b) => a.order - b.order)
    .slice(0, limit);
  const websites = sorted.map((i) => toAbsoluteUrl(i.url ?? null));
  const verified = await verifyUrls(
    websites.filter((u): u is string => u != null),
    res,
    { maxLiveChecks: limit },
  );
  const items: AiLocalListing[] = sorted.map((i, idx) => {
    const site = websites[idx];
    const rating = toNumber(i.rating);
    return {
      position: idx + 1,
      name: cleanText(i.name, 200)!,
      category: cleanText(i.category, 120),
      address: cleanText(i.address, 300),
      rating: rating == null ? null : Math.min(5, Math.max(0, Math.round(rating * 10) / 10)),
      reviews: toInt(i.reviews),
      url: site && verified.has(site) ? site : null,
      phone: cleanText(i.phone, 40),
    };
  });
  if (items.length) await cacheSet(key, "ai:local", null, { items, meta }, CACHE_TTL_AI.local);
  return { items, meta, cached: false };
}

export function aiLocalListings(
  ctx: AiEnrichmentCtx,
  input: { query: string; place: string; market: AiMarket; limit?: number },
): Promise<{
  items: AiLocalListing[];
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  return shared(`aiLocalListings:${JSON.stringify([ctx.workspaceId ?? null, Boolean(ctx.cacheOnly), input])}`, () => aiLocalListingsImpl(ctx, input));
}

/* ───────────────────────────── Business profile ───────────────────────────── */

export type AiBusinessProfile = {
  found: boolean;
  name: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviews: number | null;
  hours: string | null;
  description: string | null;
  reviewsSummary: {
    sentiment: "positive" | "mixed" | "negative" | null;
    summary: string | null;
    positives: string[];
    negatives: string[];
  } | null;
  qaSummary: string | null;
  postsSummary: string | null;
};

/**
 * Public business-profile facts + summaries of reviews, Q&A and posts (never individual review texts — those need
 * DataForSEO Business Data). Cached 3 days.
 */
async function aiBusinessProfileImpl(
  ctx: AiEnrichmentCtx,
  input: { name: string; place?: string | null; market: AiMarket },
): Promise<{
  profile: AiBusinessProfile;
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  const name = input.name.trim();
  const place = input.place?.trim() || null;
  const key = buildCacheKey("ai:business", {
    workspaceId: ctx.workspaceId ?? null,
    name: name.toLowerCase(),
    place: place?.toLowerCase() ?? null,
    ...marketKey(input.market),
  });
  const hit = await cacheGet<{
    profile: AiBusinessProfile;
    meta: AiEnrichmentMeta;
  }>(key);
  if (hit) return { ...hit.value, cached: true };

  const res = await enrichLlm(
    ctx,
    "local",
    [
      `Market — ${describeMarket(input.market)}.`,
      `Look up the Google Business Profile (and other public listings) of "${name}"${place ? ` in ${place}` : ""}.`,
      "Report the facts you find: name, primary category, address, phone, website, Google rating (0–5), number of Google reviews, opening hours (short text) and a one-sentence description.",
      "Then summarize: what reviewers say (overall sentiment positive | mixed | negative, up to 5 praised themes, up to 5 complaints), any questions & answers on the profile, and recent posts/updates. Use null when you cannot find something.",
      "Set found=false if you cannot identify this business.",
      'JSON shape: {"found":true,"name":"…","category":"…","address":"…","phone":"…","website":"https://…","rating":4.6,"reviews":87,"hours":"…","description":"…","reviewsSummary":{"sentiment":"positive","summary":"…","positives":["…"],"negatives":["…"]},"qaSummary":"…","postsSummary":"…","confidence":"low|medium|high"}',
    ].join("\n"),
    businessProfileSchema,
    4_000,
  );
  const meta = metaOf(res, toConfidence(res.data.confidence, "low"));
  const d = res.data;
  const website = toAbsoluteUrl(d.website ?? null);
  const verified = website ? await verifyUrls([website], res, { maxLiveChecks: 1 }) : new Map<string, UrlVerification>();
  const rating = toNumber(d.rating);
  const sentiment = typeof d.reviewsSummary?.sentiment === "string" ? d.reviewsSummary.sentiment.toLowerCase() : "";
  const profile: AiBusinessProfile = {
    found: d.found,
    name: cleanText(d.name, 200),
    category: cleanText(d.category, 120),
    address: cleanText(d.address, 300),
    phone: cleanText(d.phone, 40),
    website: website && verified.has(website) ? website : null,
    rating: rating == null ? null : Math.min(5, Math.max(0, Math.round(rating * 10) / 10)),
    reviews: toInt(d.reviews),
    hours: cleanText(d.hours, 300),
    description: cleanText(d.description, 500),
    reviewsSummary: d.reviewsSummary
      ? {
          sentiment: sentiment.includes("pos") ? "positive" : sentiment.includes("neg") ? "negative" : sentiment.includes("mix") ? "mixed" : null,
          summary: cleanText(d.reviewsSummary.summary, 800),
          positives: (d.reviewsSummary.positives ?? [])
            .map((p) => cleanText(p, 160))
            .filter((p): p is string => Boolean(p))
            .slice(0, 5),
          negatives: (d.reviewsSummary.negatives ?? [])
            .map((p) => cleanText(p, 160))
            .filter((p): p is string => Boolean(p))
            .slice(0, 5),
        }
      : null,
    qaSummary: cleanText(d.qaSummary, 800),
    postsSummary: cleanText(d.postsSummary, 800),
  };
  if (profile.found) await cacheSet(key, "ai:business", null, { profile, meta }, CACHE_TTL_AI.business);
  return { profile, meta, cached: false };
}

export function aiBusinessProfile(
  ctx: AiEnrichmentCtx,
  input: { name: string; place?: string | null; market: AiMarket },
): Promise<{
  profile: AiBusinessProfile;
  meta: AiEnrichmentMeta;
  cached: boolean;
}> {
  return shared(`aiBusinessProfile:${JSON.stringify([ctx.workspaceId ?? null, Boolean(ctx.cacheOnly), input])}`, () => aiBusinessProfileImpl(ctx, input));
}

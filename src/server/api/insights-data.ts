import "server-only";
import { z } from "zod";
import { getAdsOverview } from "@/server/ai/insights/ads";
import { getFanoutRows, getFanoutStats, getFollowupRows } from "@/server/ai/insights/fanouts";
import { getCatalogCoverage, getProductsOverview } from "@/server/ai/insights/products";
import { getScorecard, getSentimentContext } from "@/server/ai/insights/sentiment";
import { FANOUT_INTENTS } from "@/features/ai-insights/lib/fanout-intents";
import { summarizeClickParams } from "@/features/ai-insights/lib/click-params";
import { periodInfo, resolveCompetitorId, roundDeep, type AiScope } from "./ai-data";
import { paginate, paginationQuery, filterQuery } from "./rest";

/**
 * REST v1 + MCP data layer for the deeper AI insights (fan-out analysis & follow-ups, sentiment
 * scorecard, AI products / retailers / catalog coverage, AI ads). Reuses the app's insight
 * queries so numbers match the UI.
 */

/* ───────────────────────────── Schemas ───────────────────────────── */

const intentEnum = z.enum([...FANOUT_INTENTS, "unclassified"]);

export const fanoutFilterShape = {
  searchIntent: z
    .array(intentEnum)
    .max(8)
    .optional()
    .describe(`Only fan-out queries with these search intents: ${[...FANOUT_INTENTS, "unclassified"].join(", ")} (\`intent\` filters prompts by their intent).`),
  coverage: z.enum(["covered", "partial", "gap", "unknown"]).optional().describe("Content coverage by your own pages (unknown = not checked yet)."),
};

export const followupsQuery = z.object({
  ...filterQuery,
  ...paginationQuery,
  search: z.string().max(200).optional(),
  promptId: z.string().max(64).optional().describe("Only follow-ups of one prompt."),
  kind: z.enum(["related", "paa", "followup"]).optional().describe("related = related searches, paa = People Also Ask, followup = engine-suggested follow-up questions."),
});

export const sentimentQuery = z.object({
  ...filterQuery,
  compareWith: z.string().max(200).optional().describe("Competitor id, name or domain to compare with."),
});

export const productsQuery = z.object({
  ...filterQuery,
  ...paginationQuery,
  search: z.string().max(200).optional().describe("Substring of the product, brand or store name."),
  own: z.enum(["true", "false"]).optional().describe("true = only your products, false = only other brands."),
  source: z.enum(["llm", "shopping"]).optional().describe("llm = named in the answer text, shopping = rendered product cards."),
});

export const retailersQuery = z.object({ ...filterQuery, ...paginationQuery });

export const catalogCoverageQuery = z.object({
  ...filterQuery,
  ...paginationQuery,
  show: z.enum(["all", "recommended", "never", "price_mismatch"]).default("all"),
});

export const adsQuery = z.object({
  ...filterQuery,
  ...paginationQuery,
  search: z.string().max(200).optional().describe("Substring of headline, description or advertiser."),
});

/* ───────────────────────────── Fan-outs ───────────────────────────── */

export async function getFanoutsApi(
  s: AiScope,
  opts: { search?: string; promptId?: string; searchIntent?: string[]; coverage?: "covered" | "partial" | "gap" | "unknown"; limit: number; page?: number },
) {
  const filter = { projectId: s.project.id, from: s.period.from, to: s.period.to, scope: s.insight, promptId: opts.promptId, q: opts.search, intents: opts.searchIntent };
  const [all, stats] = await Promise.all([getFanoutRows(filter), getFanoutStats({ ...filter, q: undefined, intents: undefined })]);
  const rows = opts.coverage ? all.filter((r) => (opts.coverage === "unknown" ? !r.coverage : r.coverage === opts.coverage)) : all;
  const { items, pagination } = paginate(rows, opts.page ?? 1, opts.limit);
  return {
    period: periodInfo(s),
    stats: roundDeep(stats),
    items: items.map((r) => ({
      query: r.query,
      frequency: r.frequency,
      models: r.engines,
      prompts: r.prompts.slice(0, 10),
      promptCount: r.prompts.length,
      firstSeen: r.firstSeen,
      lastSeen: r.lastSeen,
      intent: r.intent,
      wordCount: r.wordCount,
      coverage: r.coverage,
      coveringUrl: r.coverageUrl,
      answers: r.answers,
      brandMentionedPct: r.brandMentionedPct == null ? null : Math.round(r.brandMentionedPct * 10) / 10,
      ownCitedPct: r.ownCitedPct == null ? null : Math.round(r.ownCitedPct * 10) / 10,
      topCitedDomains: r.topDomains,
    })),
    pagination,
  };
}

export async function getFollowupsApi(s: AiScope, opts: { search?: string; promptId?: string; kind?: "related" | "paa" | "followup"; limit: number; page?: number }) {
  let rows = await getFollowupRows({ projectId: s.project.id, from: s.period.from, to: s.period.to, scope: s.insight, promptId: opts.promptId, q: opts.search });
  if (opts.kind) rows = rows.filter((r) => r.kind === opts.kind);
  const { items, pagination } = paginate(rows, opts.page ?? 1, opts.limit);
  return {
    period: periodInfo(s),
    items: items.map((r) => ({ question: r.question, kind: r.kind, frequency: r.frequency, models: r.engines, prompts: r.prompts.slice(0, 10), promptCount: r.prompts.length, firstSeen: r.firstSeen, lastSeen: r.lastSeen })),
    pagination,
  };
}

/* ───────────────────────────── Sentiment scorecard ───────────────────────────── */

export async function getScorecardApi(s: AiScope, compareWith?: string) {
  const compareId = compareWith ? await resolveCompetitorId(s.project.id, compareWith) : "none";
  const ctx = await getSentimentContext(s.project, s.insight, compareId);
  const sc = await getScorecard(s.project, s.insight, ctx);
  const name = new Map(ctx.brands.map((b) => [b.key, b.name]));
  const brandName = (k: string) => name.get(k) ?? k;
  return {
    period: periodInfo(s),
    brand: ctx.own.name,
    scoreDefinition: "aspect score = praise ÷ (praise + criticism) × 100",
    you: roundDeep({
      ...sc.own,
      biggestGap: sc.own.biggestGap ? { ...sc.own.biggestGap, leader: brandName(sc.own.biggestGap.leader) } : null,
      aspects: sc.ownAspects.map((a) => ({ ...a, leader: a.leader ? brandName(a.leader) : null })),
    }),
    brandsByAspect: roundDeep(sc.brands.map((k) => ({ brand: brandName(k), isOwn: k === ctx.own.key, aspects: sc.cells[k] ?? {} }))),
    brandsByModel: roundDeep(sc.brands.map((k) => ({ brand: brandName(k), isOwn: k === ctx.own.key, models: sc.engineCells[k] ?? {} }))),
  };
}

/* ───────────────────────────── Products ───────────────────────────── */

export async function getProductsApi(s: AiScope, opts: { search?: string; own?: boolean; source?: "llm" | "shopping"; limit: number; page?: number }) {
  const o = await getProductsOverview(s.project, s.insight);
  const needle = opts.search?.trim().toLowerCase();
  const rows = o.products.filter((p) => {
    if (opts.own !== undefined && p.isOwn !== opts.own) return false;
    if (opts.source && !p.sources.includes(opts.source)) return false;
    if (needle && !`${p.name} ${p.brandName ?? ""} ${p.stores.join(" ")}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const { items, pagination } = paginate(rows, opts.page ?? 1, opts.limit);
  return {
    period: periodInfo(s),
    totals: o.totals,
    brands: roundDeep(o.brands.slice(0, 25)),
    items: roundDeep(
      items.map((p) => ({
        productId: p.id,
        name: p.name,
        brand: p.brandName,
        isOwn: p.isOwn,
        category: p.category,
        sources: p.sources,
        price: p.price,
        oldPrice: p.oldPrice,
        currency: p.currency,
        rating: p.rating,
        reviews: p.reviews,
        models: p.engines,
        stores: p.stores,
        appearances: p.appearances,
        appearancesChange: p.appearancesDelta,
        lastSeen: p.lastSeen,
      })),
    ),
    pagination,
  };
}

export async function getRetailersApi(s: AiScope, opts: { limit: number; page?: number }) {
  const o = await getProductsOverview(s.project, s.insight);
  const { items, pagination } = paginate(o.stores, opts.page ?? 1, opts.limit);
  return {
    period: periodInfo(s),
    totals: { retailers: o.stores.length, appearances: o.stores.reduce((a, r) => a + r.appearances, 0) },
    items: roundDeep(items.map((r, i) => ({ rank: (pagination.page - 1) * pagination.limit + i + 1, retailer: r.store, domain: r.domain, appearances: r.appearances, appearancesChange: r.appearancesDelta, share: r.share, products: r.products, avgPrice: r.avgPrice, currency: r.currency }))),
    pagination,
  };
}

export async function getCatalogCoverageApi(s: AiScope, opts: { show: "all" | "recommended" | "never" | "price_mismatch"; limit: number; page?: number }) {
  const c = await getCatalogCoverage(s.project, s.insight);
  const rows = c.rows.filter((r) =>
    opts.show === "recommended" ? r.appearances > 0 : opts.show === "never" ? r.appearances === 0 : opts.show === "price_mismatch" ? r.priceDeltaPct != null && Math.abs(r.priceDeltaPct) >= 1 : true,
  );
  const { items, pagination } = paginate(rows, opts.page ?? 1, opts.limit);
  return {
    period: periodInfo(s),
    totals: c.totals,
    items: roundDeep(
      items.map((r) => ({
        catalogProductId: r.id,
        name: r.name,
        sku: r.sku,
        url: r.url,
        category: r.category,
        availability: r.availability,
        appearances: r.appearances,
        models: r.engines,
        lastSeen: r.lastSeen,
        aiProductId: r.aiProductId,
        aiName: r.aiName,
        catalogPrice: r.price,
        currency: r.currency,
        aiPrice: r.aiPrice,
        aiCurrency: r.aiCurrency,
        aiStore: r.aiStore,
        priceDelta: r.priceDelta,
        priceDeltaPct: r.priceDeltaPct,
      })),
    ),
    ownProductsNotInCatalog: c.ownUnmatched.slice(0, 50),
    pagination,
  };
}

/* ───────────────────────────── Ads ───────────────────────────── */

export async function getAdsApi(s: AiScope, opts: { search?: string; limit: number; page?: number }) {
  const o = await getAdsOverview(s.project, s.insight);
  const needle = opts.search?.trim().toLowerCase();
  const rows = needle ? o.ads.filter((a) => `${a.headline} ${a.description ?? ""} ${a.advertiser}`.toLowerCase().includes(needle)) : o.ads;
  const { items, pagination } = paginate(rows, opts.page ?? 1, opts.limit);
  const series = new Map(o.seriesAdvertisers.map((a) => [a.key, a.name]));
  return {
    period: periodInfo(s),
    totals: { ...o.totals, answersWithAdsPct: o.totals.answers ? Math.round((o.totals.answersWithAds / o.totals.answers) * 1000) / 10 : null, advertisers: o.advertisers.length },
    advertisers: roundDeep(o.advertisers.slice(0, 25).map((a) => ({ name: a.name, domain: a.domain, isOwn: a.isOwn, tracked: a.tracked, ads: a.ads, appearances: a.appearances, appearancesChange: a.appearancesDelta, share: a.share, shareChange: a.shareDelta }))),
    organicVsPaid: roundDeep(
      o.organic.map((r) => ({
        advertiser: r.name,
        domain: r.domain,
        isOwn: r.isOwn,
        tracked: r.tracked,
        adAppearances: r.adAppearances,
        adAnswers: r.adAnswers,
        avgAdPosition: r.avgAdPosition,
        organicMentionAnswers: r.mentionAnswers,
        organicMentionRate: r.mentionRate,
        avgOrganicPosition: r.avgOrganicPosition,
        organicCitedAnswers: r.citedAnswers,
      })),
    ),
    daily: roundDeep(
      o.daily.map((d) => ({
        date: d.date,
        adAppearances: d.appearances,
        answers: d.answers,
        answersWithAds: d.answersWithAds,
        prompts: d.prompts,
        promptsWithAds: d.promptsWithAds,
        promptsWithAdsPct: d.promptsWithAdsPct,
        advertiserShare: Object.fromEntries(Object.entries(d.shares).map(([k, v]) => [k === "others" ? "Others" : (series.get(k) ?? k), v])),
      })),
    ),
    items: roundDeep(
      items.map((a) => ({
        adId: a.id,
        advertiser: a.advertiser,
        advertiserDomain: a.advertiserDomain,
        isOwn: a.isOwn,
        headline: a.headline,
        description: a.description,
        landingUrl: a.landingUrl,
        clickParams: a.clickParams,
        campaign: summarizeClickParams(a.clickParams),
        avgPosition: a.avgPosition,
        rating: a.rating,
        models: a.engines,
        appearances: a.appearances,
        appearancesChange: a.appearancesDelta,
        lastSeen: a.lastSeen,
      })),
    ),
    pagination,
  };
}

import "server-only";
import { z } from "zod";
import { aiFilterShape, buildAiScope } from "@/server/api/ai-data";
import { getAdsApi, getCatalogCoverageApi, getFollowupsApi, getProductsApi, getRetailersApi, getScorecardApi } from "@/server/api/insights-data";
import { ASPECT_INFO } from "@/features/ai-insights/lib/aspects";
import { defineTool } from "../types";
import { mdTable, pct, projectIdInput, toolProject } from "../helpers";

const filters = { projectId: projectIdInput, ...aiFilterShape };
const RO = { readOnlyHint: true, openWorldHint: false } as const;
const periodLine = (p: { from: string; to: string; days: number }) => `Period ${p.from} → ${p.to} (${p.days} days)`;
const paging = {
  limit: z.number().int().min(1).max(200).optional().describe("Default 25."),
  page: z.number().int().min(1).max(1000).optional(),
};
const money = (v: number | null | undefined, cur: string | null | undefined) => (v == null ? "—" : `${v.toFixed(2)}${cur ? ` ${cur}` : ""}`);

/** AI insight tools: sentiment scorecard, follow-up questions, AI shopping (products, retailers, catalog) and AI ads. All read-only. */
export const aiInsightTools = [
  defineTool({
    name: "get_sentiment_scorecard",
    title: "Sentiment scorecard",
    description:
      "Aspect-level sentiment scorecard: for the brand and tracked competitors, the score per fixed aspect (quality, price, value, performance, features, reliability, design, support, service, usability, availability) = praise ÷ (praise + criticism) × 100, with change vs the previous period, rank and leader per aspect, plus a brand × AI-model sentiment matrix.",
    input: z.object({ ...filters, compareWith: z.string().max(200).optional().describe("Competitor id, name or domain to resolve (optional).") }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const s = await buildAiScope(await toolProject(ctx, args.projectId), args);
      const r = await getScorecardApi(s, args.compareWith);
      const y = r.you;
      return {
        text: `**${r.brand}** aspect score ${y.overall == null ? "—" : Math.round(y.overall)}/100 — ${periodLine(r.period)}\nStrongest: ${y.strongest ? ASPECT_INFO[y.strongest.aspect].label : "—"} · Weakest: ${y.weakest ? ASPECT_INFO[y.weakest.aspect].label : "—"}${
          y.biggestGap ? ` · Biggest gap: ${ASPECT_INFO[y.biggestGap.aspect].label} (${y.biggestGap.leader} ${Math.round(y.biggestGap.leaderScore)} vs ${Math.round(y.biggestGap.score)})` : ""
        }\n\n${mdTable(y.aspects, [
          ["aspect", (a) => ASPECT_INFO[a.aspect].label],
          ["score", (a) => (a.score == null ? null : Math.round(a.score))],
          ["change", (a) => a.delta],
          ["praise", (a) => a.praise],
          ["criticism", (a) => a.criticism],
          ["rank", (a) => (a.rank ? `${a.rank}/${a.ranked}` : null)],
          ["leader", (a) => a.leader],
        ])}`,
        data: { projectId: s.project.id, ...r },
      };
    },
  }),

  defineTool({
    name: "get_followup_questions",
    title: "Follow-up questions",
    description:
      "Follow-up questions shown next to AI answers: Perplexity related questions (followup), Google People Also Ask (paa) and related searches (related), with frequency, models and prompts. Useful for FAQ and content planning.",
    input: z.object({
      ...filters,
      search: z.string().max(200).optional(),
      promptId: z.string().max(64).optional(),
      kind: z.enum(["related", "paa", "followup"]).optional(),
      ...paging,
    }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const s = await buildAiScope(await toolProject(ctx, args.projectId), args, 90);
      const r = await getFollowupsApi(s, { search: args.search, promptId: args.promptId, kind: args.kind, limit: args.limit ?? 25, page: args.page });
      return {
        text: `${r.pagination.total} follow-up question(s) — ${periodLine(r.period)}\n\n${mdTable(r.items, [
          ["question", (x) => x.question],
          ["type", (x) => x.kind],
          ["frequency", (x) => x.frequency],
          ["models", (x) => x.models],
          ["last seen", (x) => x.lastSeen],
        ])}`,
        data: { projectId: s.project.id, ...r },
      };
    },
  }),

  defineTool({
    name: "get_ai_products",
    title: "Products in AI answers",
    description:
      "Products AI engines name in answers or show as shopping cards (ChatGPT shopping, Google AI Overviews…), with brand, price, rating, stores, models and appearances (change vs previous period), plus the brands whose products AI recommends most.",
    input: z.object({
      ...filters,
      search: z.string().max(200).optional(),
      own: z.boolean().optional().describe("true = only your products, false = only other brands."),
      source: z.enum(["llm", "shopping"]).optional(),
      ...paging,
    }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const s = await buildAiScope(await toolProject(ctx, args.projectId), args);
      const r = await getProductsApi(s, { search: args.search, own: args.own, source: args.source, limit: args.limit ?? 25, page: args.page });
      return {
        text: `${r.pagination.total} product(s), ${r.totals.appearances} appearances — ${periodLine(r.period)}\n\n${mdTable(r.items, [
          ["product", (x) => x.name],
          ["brand", (x) => x.brand],
          ["own", (x) => x.isOwn],
          ["price", (x) => money(x.price, x.currency)],
          ["rating", (x) => x.rating],
          ["appearances", (x) => x.appearances],
          ["change", (x) => x.appearancesChange],
          ["stores", (x) => x.stores.slice(0, 3)],
        ])}`,
        data: { projectId: s.project.id, ...r },
      };
    },
  }),

  defineTool({
    name: "get_ai_retailers",
    title: "Retailers in AI shopping answers",
    description: "Stores / retailers AI shopping answers list products from, ranked by appearances, with share, product count, average price and change vs the previous period.",
    input: z.object({ ...filters, ...paging }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const s = await buildAiScope(await toolProject(ctx, args.projectId), args);
      const r = await getRetailersApi(s, { limit: args.limit ?? 25, page: args.page });
      return {
        text: `${r.totals.retailers} retailer(s) — ${periodLine(r.period)}\n\n${mdTable(r.items, [
          ["#", (x) => x.rank],
          ["retailer", (x) => x.retailer],
          ["domain", (x) => x.domain],
          ["appearances", (x) => x.appearances],
          ["share", (x) => pct(x.share)],
          ["products", (x) => x.products],
          ["avg price", (x) => money(x.avgPrice, x.currency)],
        ])}`,
        data: { projectId: s.project.id, ...r },
      };
    },
  }),

  defineTool({
    name: "get_catalog_coverage",
    title: "Catalog coverage in AI answers",
    description:
      "Compares the project's own product catalog (Brand Knowledge → Products) with the products AI answers name: which catalog products AI recommends, which it never recommends, and where the AI-cited price differs from the catalog price.",
    input: z.object({ ...filters, show: z.enum(["all", "recommended", "never", "price_mismatch"]).optional().describe("Default all."), ...paging }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const s = await buildAiScope(await toolProject(ctx, args.projectId), args);
      const r = await getCatalogCoverageApi(s, { show: args.show ?? "all", limit: args.limit ?? 25, page: args.page });
      const t = r.totals;
      return {
        text: t.catalog
          ? `${t.catalog} catalog products: ${t.recommended} recommended by AI, ${t.neverRecommended} never, ${t.priceMismatches} price mismatches — ${periodLine(r.period)}\n\n${mdTable(r.items, [
              ["product", (x) => x.name],
              ["appearances", (x) => x.appearances],
              ["catalog price", (x) => money(x.catalogPrice, x.currency)],
              ["AI price", (x) => money(x.aiPrice, x.aiCurrency ?? x.currency)],
              ["Δ %", (x) => x.priceDeltaPct],
            ])}`
          : "No product catalog imported yet — connect it in Brand Knowledge → Products (feed URL, file or push API).",
        data: { projectId: s.project.id, ...r },
      };
    },
  }),

  defineTool({
    name: "get_ai_ads",
    title: "Ads in AI answers",
    description:
      "Paid ads AI engines show with answers (Google AI Overviews / AI Mode, ChatGPT…): creatives, advertisers, landing URLs with parsed click parameters (utm_*, click ids), average ad position, appearances, advertiser share, % of prompts with ads per day and organic vs paid presence per advertiser.",
    input: z.object({ ...filters, search: z.string().max(200).optional(), ...paging }),
    scope: "read",
    annotations: RO,
    async handler(args, ctx) {
      const s = await buildAiScope(await toolProject(ctx, args.projectId), args);
      const r = await getAdsApi(s, { search: args.search, limit: args.limit ?? 25, page: args.page });
      const t = r.totals;
      return {
        text: `${t.ads} ad(s), ${t.appearances} appearances from ${t.advertisers} advertiser(s); ${pct(t.answersWithAdsPct)} of answers showed ads — ${periodLine(r.period)}\n\n${mdTable(r.items, [
          ["advertiser", (x) => x.advertiser],
          ["headline", (x) => x.headline],
          ["campaign", (x) => x.campaign.campaign ?? x.campaign.network],
          ["position", (x) => x.avgPosition],
          ["appearances", (x) => x.appearances],
          ["models", (x) => x.models],
        ])}\n\nOrganic vs paid:\n${mdTable(r.organicVsPaid, [
          ["advertiser", (x) => x.advertiser],
          ["ad appearances", (x) => x.adAppearances],
          ["organic mention rate", (x) => pct(x.organicMentionRate)],
          ["organic position", (x) => x.avgOrganicPosition],
          ["cited", (x) => x.organicCitedAnswers],
        ])}`,
        data: { projectId: s.project.id, ...r },
      };
    },
  }),
];

import "server-only";
import { resolveEnrichmentProvider, type EnrichmentCapability } from "@/server/enrichment";
import { aiDomainProfile, aiKeywordIdeas, aiLinkMentions, type AiEnrichmentCtx, type AiMarket } from "@/server/enrichment/ai";
import { FREE_TOOL_SLUGS, type FreeToolSlug } from "@/features/free-tools/lib/registry";
import type { ToolSourceInfo } from "@/features/free-tools/lib/types";
import { backlinkCheckFromAi, competitorAnalysisFromAi, keywordFinderFromAi, keywordGeneratorFromAi, trafficCheckFromAi } from "./ai-map";
import { isPaidTool } from "./spend";

/**
 * AI fallback of the DataForSEO-backed free tools: when DataForSEO is not connected (or rejects the account in auto
 * mode), the tools answer with AI estimates (src/server/enrichment/ai.ts) mapped onto the same result shapes, labelled
 * via `result.ai`. The AI results are cached by the enrichment layer under `ai:*` keys — never in the DataForSEO
 * result cache.
 */

/** Market of a parsed tool request (see `parseMarket` in tools.ts). */
type ToolMarket = { locationCode: number; language: string };

/** Enrichment capability behind each DataForSEO-backed tool (Admin → Data Providers decides DataForSEO vs AI). */
export const TOOL_CAPABILITY: Partial<Record<FreeToolSlug, EnrichmentCapability>> = {
  "keyword-generator": "keyword_ideas",
  "competitor-keyword-finder": "domain",
  "website-traffic-checker": "domain",
  "competitor-analysis": "domain",
  "backlink-checker": "backlinks",
  "spam-score-checker": "backlinks",
};

/** Tools AI cannot estimate at all, with the reason shown to the user. */
export const AI_UNSUPPORTED: Partial<Record<FreeToolSlug, string>> = {
  "spam-score-checker":
    "Spam scores come from DataForSEO's backlink index — AI estimates can't measure them. Connect DataForSEO in Admin → Data Providers, or use the Backlink Checker's AI sample.",
};

function aiMarket(m: ToolMarket): AiMarket {
  return { locationCode: m.locationCode, languageCode: m.language };
}

export type AiToolRunner = (params: unknown, ctx: AiEnrichmentCtx) => Promise<unknown>;

/** AI implementation of a tool (params = the tool's parsed params), or null when AI cannot estimate it. */
export function aiToolRunner(slug: FreeToolSlug): AiToolRunner | null {
  switch (slug) {
    case "keyword-generator":
      return async (params, ctx) => {
        const p = params as { keyword: string; market: ToolMarket };
        const res = await aiKeywordIdeas(ctx, { seed: p.keyword, market: aiMarket(p.market), limit: 30 });
        return keywordGeneratorFromAi(p.keyword, p.market.locationCode, res);
      };
    case "competitor-keyword-finder":
      return async (params, ctx) => {
        const p = params as { domain: string; market: ToolMarket };
        return keywordFinderFromAi(p.domain, p.market.locationCode, await aiDomainProfile(ctx, { domain: p.domain, market: aiMarket(p.market) }));
      };
    case "website-traffic-checker":
      return async (params, ctx) => {
        const p = params as { domains: string[]; market: ToolMarket };
        const profiles = await Promise.all(p.domains.map((domain) => aiDomainProfile(ctx, { domain, market: aiMarket(p.market) })));
        return trafficCheckFromAi(p.market.locationCode, profiles);
      };
    case "competitor-analysis":
      return async (params, ctx) => {
        const p = params as { competitor: string; yourDomain: string | null; market: ToolMarket };
        const [competitor, yours] = await Promise.all([
          aiDomainProfile(ctx, { domain: p.competitor, market: aiMarket(p.market) }),
          p.yourDomain ? aiDomainProfile(ctx, { domain: p.yourDomain, market: aiMarket(p.market) }) : Promise.resolve(null),
        ]);
        return competitorAnalysisFromAi(p.market.locationCode, competitor, yours);
      };
    case "backlink-checker":
      return async (params, ctx) => {
        const p = params as { domain: string };
        return backlinkCheckFromAi(p.domain, await aiLinkMentions(ctx, { domain: p.domain, limit: 30 }));
      };
    default:
      return null;
  }
}

/**
 * Where each tool's data comes from right now for a workspace (in-app tools hub / tool pages; the workspace's own
 * DataForSEO key and data mode apply): DataForSEO, AI estimates, free (RDAP / browser) or unavailable with a reason.
 */
export async function getToolSources(workspaceId: string): Promise<Record<FreeToolSlug, ToolSourceInfo>> {
  const byCapability = new Map<EnrichmentCapability, Awaited<ReturnType<typeof resolveEnrichmentProvider>>>();
  const out = {} as Record<FreeToolSlug, ToolSourceInfo>;
  for (const slug of FREE_TOOL_SLUGS) {
    const capability = TOOL_CAPABILITY[slug];
    if (!isPaidTool(slug) || !capability) {
      out[slug] = { source: "free" };
      continue;
    }
    if (!byCapability.has(capability)) byCapability.set(capability, await resolveEnrichmentProvider({ capability, workspaceId }));
    const resolved = byCapability.get(capability)!;
    if (resolved.provider === "dataforseo") out[slug] = { source: "dataforseo" };
    else if (resolved.provider === "ai" && aiToolRunner(slug)) out[slug] = { source: "ai" };
    else out[slug] = { source: null, reason: resolved.provider === "ai" ? AI_UNSUPPORTED[slug] : resolved.reason };
  }
  return out;
}

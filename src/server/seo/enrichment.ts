import "server-only";
import type { AiEnrichmentCtx, AiEnrichmentMeta, AiMarket } from "@/server/enrichment/ai";
import { runEnriched, type Enriched, type EnrichmentCapability, type EnrichmentCtx, type EnrichmentSource } from "@/server/enrichment";
import { toSeoError } from "./dfs";
import type { SeoContext } from "./context";
import type { Market } from "./lib/locations";

/** Where a SEO result came from — attached to every service result that can be served by AI estimates. */
export type SeoEnrichment = {
  source: EnrichmentSource;
  /** AI estimates only: model, date, confidence. */
  meta?: AiEnrichmentMeta | null;
  /** Set when DataForSEO failed (401/402/not configured) and AI answered instead. */
  fallbackReason?: string;
};

export function enrichCtx(ctx: SeoContext, feature: string, capability: EnrichmentCapability): EnrichmentCtx {
  return {
    workspaceId: ctx.workspaceId,
    projectId: ctx.projectId,
    userId: ctx.userId,
    feature,
    capability,
  };
}

/** `runEnriched` for SEO services: provider / AI errors surface as `SeoError`s (actions, REST and MCP map those). */
export async function runSeoEnriched<T>(
  ctx: SeoContext,
  feature: string,
  capability: EnrichmentCapability,
  impl: { dataforseo: () => Promise<T>; ai?: () => Promise<T> },
): Promise<Enriched<T>> {
  try {
    return await runEnriched(enrichCtx(ctx, feature, capability), impl);
  } catch (err) {
    throw toSeoError(err);
  }
}

/** AI calls on behalf of a user without `seo.run` only read cached estimates. */
export function aiCtx(ctx: Pick<SeoContext, "projectId" | "workspaceId" | "userId" | "canRun">): AiEnrichmentCtx {
  return {
    projectId: ctx.projectId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    cacheOnly: !ctx.canRun,
  };
}

export function aiMarket(market: Market, locationName?: string | null): AiMarket {
  return {
    locationCode: market.locationCode,
    languageCode: market.languageCode,
    locationName: locationName ?? null,
  };
}

/** API / MCP representation of a result's source (always explicit, so AI estimates are never mistaken for measurements). */
export function describeEnrichment(e: SeoEnrichment | null | undefined) {
  if (!e || e.source === "dataforseo") return { source: "dataforseo" as const, estimate: false };
  return {
    source: "ai" as const,
    estimate: true,
    model: e.meta?.model ?? null,
    confidence: e.meta?.confidence ?? null,
    generatedAt: e.meta?.generatedAt ?? null,
    note: "AI estimate (LLM with web search) — not measured data. Connect DataForSEO in Admin → Data Providers for measured data.",
    ...(e.fallbackReason ? { fallbackReason: e.fallbackReason } : {}),
  };
}

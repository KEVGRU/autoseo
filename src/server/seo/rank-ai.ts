import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import { seoRankRuns, seoRankSnapshots } from "@/server/db/schema";
import { resolveEnrichmentProvider } from "@/server/enrichment";
import { aiSerp, type AiSerpItem } from "@/server/enrichment/ai";
import { SeoError, type SeoContext } from "./context";
import { toSeoError } from "./dfs";
import { aiMarket } from "./enrichment";
import { buildRankCheckResult, type Device, type RankCheckResult, type SerpLiveItem } from "./lib/serp";
import { resolveKeywordDataLanguage } from "./lib/locations";
import type { RankConfig, RankRun } from "./rank-tracking";

/**
 * Rank checks without DataForSEO: each keyword × device SERP is observed via AI web search (`aiSerp`, depth ≤ 20,
 * cached 24h) and the target domain is matched exactly like a DataForSEO SERP (`buildRankCheckResult`). Snapshots and
 * the run are stored with `source = "ai"` ("AI-observed position"). Called from rank-engine's live phase.
 */

/** AI observes at most the top 20 organic results. */
export const AI_RANK_DEPTH = 20;
const AI_RANK_CONCURRENCY = 2;

type Pair = { keywordId: string; keyword: string; device: Device };

/** Whether a workspace's rank checks are served by AI web search right now (no DataForSEO / AI-only mode). */
export async function rankChecksUseAi(workspaceId: string | null): Promise<boolean> {
  return (await resolveEnrichmentProvider({ capability: "serp", workspaceId })).provider === "ai";
}

/** Whether a workspace can run rank checks at all (DataForSEO or AI web search). */
export async function rankChecksAvailable(workspaceId: string | null): Promise<boolean> {
  return (await resolveEnrichmentProvider({ capability: "serp", workspaceId })).provider != null;
}

/** AI SERP items → the DataForSEO organic item shape `buildRankCheckResult` understands. */
export function aiSerpToLiveItems(items: Pick<AiSerpItem, "position" | "domain" | "url" | "title">[]): SerpLiveItem[] {
  return items.map((i) => ({
    type: "organic",
    rank_group: i.position,
    rank_absolute: i.position,
    domain: i.domain,
    url: i.url,
    title: i.title,
  }));
}

/** Drop-in replacement for rank-engine's `checkPairsLive` (same contract: returns the number of stored snapshots). */
export async function checkPairsViaAi(ctx: SeoContext, run: RankRun, config: RankConfig, pairs: Pair[]): Promise<number> {
  const market = aiMarket(
    {
      locationCode: config.locationCode,
      languageCode: resolveKeywordDataLanguage(config.locationCode, config.languageCode),
    },
    config.locationName,
  );
  const depth = Math.min(AI_RANK_DEPTH, config.serpDepth);
  const results: (RankCheckResult & { device: Device })[] = [];
  let firstError: string | null = null;
  for (let i = 0; i < pairs.length; i += AI_RANK_CONCURRENCY) {
    const chunk = pairs.slice(i, i + AI_RANK_CONCURRENCY);
    const settled = await Promise.allSettled(
      chunk.map(async (p) => {
        const serp = await aiSerp(
          {
            projectId: ctx.projectId,
            workspaceId: ctx.workspaceId,
            userId: ctx.userId,
          },
          { keyword: p.keyword, market, device: p.device, depth },
        );
        const result = buildRankCheckResult(
          {
            keywordId: p.keywordId,
            keyword: p.keyword,
            targetDomain: config.domain,
          },
          aiSerpToLiveItems(serp.items),
        );
        return { ...result, serpFeatures: serp.features, device: p.device };
      }),
    );
    settled.forEach((o, idx) => {
      if (o.status === "fulfilled") {
        results.push(o.value);
        return;
      }
      const err = toSeoError(o.reason);
      const msg = err instanceof Error ? err.message : String(err);
      firstError ??= msg;
      console.warn(`[rank-check] ${run.id} AI SERP failed keyword="${chunk[idx]!.keyword}" device=${chunk[idx]!.device}: ${msg}`);
      // Systemic failures (no AI provider, budget) abort the run instead of recording empty positions.
      if (err instanceof SeoError && ["NOT_CONFIGURED", "BUDGET"].includes(err.code)) throw err;
    });
  }
  if (firstError) {
    await db
      .update(seoRankRuns)
      .set({ errorMessage: firstError })
      .where(and(eq(seoRankRuns.id, run.id), isNull(seoRankRuns.errorMessage)));
  }
  await db.update(seoRankRuns).set({ source: "ai" }).where(eq(seoRankRuns.id, run.id));
  if (results.length) {
    await db
      .insert(seoRankSnapshots)
      .values(
        results.map((r) => ({
          runId: run.id,
          trackingKeywordId: r.keywordId,
          keyword: r.keyword,
          device: r.device,
          position: r.position,
          url: r.url,
          serpFeatures: r.serpFeatures,
          source: "ai" as const,
        })),
      )
      .onConflictDoNothing();
  }
  return results.length;
}

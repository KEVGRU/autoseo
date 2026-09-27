import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projects, promptResearchItems } from "@/server/db/schema";
import { EnrichmentUnavailableError, runEnriched } from "@/server/enrichment";
import { aiKeywordMetrics, type AiEnrichmentMeta, type AiKeywordMetric } from "@/server/enrichment/ai";
import { fetchKeywordVolumes, normalizeKeyword, volumeScores, type KeywordMetric } from "./keywords";
import { aiVolumeDetails, needsVolume } from "./volume";
import type { ResearchItemDetails } from "@/features/ai-research/types";

const QUESTION_WORDS = new Set(
  "viel viele lohnt sich gibt what which who whom whose where when why how is are do does can could should would will best top good vs versus compare comparison between for the a an of to in on with my me i we our your and or near most welche welcher welches was wer wo wann warum wie ist sind gibt es kann können sollte soll beste besten bester gute guten gut im in am an auf für mit von zu der die das den dem des ein eine einen und oder mein meine ich wir unser vergleich zwischen lohnt sich quel quelle quels est sont comment pourquoi meilleur meilleure pour avec le la les un une des et ou".split(
    " ",
  ),
);

/** Heuristic topic keyword for a prompt (used when no LLM-provided keyword exists). */
export function deriveKeyword(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !QUESTION_WORDS.has(w));
  return words.slice(0, 4).join(" ");
}

type VolumeSource = "dataforseo" | "estimated" | "none";

type VolumeRows =
  | { kind: "dataforseo"; metrics: Map<string, KeywordMetric> }
  | { kind: "ai"; metrics: Map<string, AiKeywordMetric>; meta: AiEnrichmentMeta | null };

/**
 * Fills volume data for research items of a list from each item's topic keyword: DataForSEO search volumes when the
 * customer's account serves keyword metrics, otherwise AI-estimated monthly searches (web search, labelled
 * "estimated"; also used when DataForSEO rejects the account in auto mode). When neither is available the relative
 * demand the Prompt Set Helper estimated is kept. Re-computes the 0..1 bar score across the whole list afterwards.
 */
export async function enrichListVolumes(
  projectId: string,
  listId: string,
  opts: { userId?: string | null; onlyMissing?: boolean; progress?: (m: string) => Promise<void> } = {},
): Promise<{ source: VolumeSource; updated: number }> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) throw new Error("Project not found.");
  const items = await db
    .select()
    .from(promptResearchItems)
    .where(and(eq(promptResearchItems.projectId, projectId), eq(promptResearchItems.listId, listId)));
  const targets = items.filter((i) => i.volumeSource !== "import" && (!opts.onlyMissing || needsVolume(i)));
  let source: VolumeSource = "none";
  let updated = 0;
  if (!targets.length) {
    await rescoreList(projectId, listId);
    return { source, updated };
  }

  for (const i of targets) if (!i.keyword) i.keyword = deriveKeyword(i.text);
  const keywords = [...new Set(targets.map((i) => (i.keyword ? normalizeKeyword(i.keyword) : "")).filter(Boolean))];
  const ctx = { projectId, workspaceId: project.workspaceId, userId: opts.userId ?? null };

  let rows: VolumeRows | null = null;
  try {
    const res = await runEnriched<VolumeRows>(
      { ...ctx, feature: "prompt_research_volume", capability: "keyword_metrics" },
      {
        dataforseo: async () => {
          await opts.progress?.(`Fetching search volumes for ${keywords.length} topic keywords`);
          const metrics = await fetchKeywordVolumes(keywords, project.country, project.language, { ...ctx, feature: "prompt_research_volume" });
          return { kind: "dataforseo", metrics };
        },
        ai: async () => {
          await opts.progress?.(`Estimating search volumes for ${keywords.length} topic keywords with AI`);
          const res = await aiKeywordMetrics(ctx, { keywords, market: { country: project.country, languageCode: project.language } });
          return { kind: "ai", metrics: new Map(res.rows.map((r) => [normalizeKeyword(r.keyword), r])), meta: res.meta };
        },
      },
    );
    rows = res.data;
  } catch (err) {
    // Neither DataForSEO nor an AI provider can serve keyword metrics: keep the Prompt Set Helper's relative demand.
    if (!(err instanceof EnrichmentUnavailableError)) throw err;
    console.warn(`[prompt-research] volumes unavailable for list ${listId}: ${err.message}`);
  }

  for (const i of targets) {
    const key = i.keyword ? normalizeKeyword(i.keyword) : null;
    const details = (i.details ?? {}) as ResearchItemDetails & { relativeVolume?: number };
    if (rows?.kind === "dataforseo") {
      const m = key ? rows.metrics.get(key) : undefined;
      await db
        .update(promptResearchItems)
        .set({
          keyword: i.keyword,
          volume: m?.volume ?? 0,
          volumeSource: "dataforseo",
          details: {
            ...details,
            keywordMetrics: { searchVolume: m?.volume ?? null, cpc: m?.cpc ?? null, difficulty: m?.difficulty ?? null, intent: m?.intent ?? null },
            trend: m?.monthly.slice(-12) ?? [],
            estimatedLabel: undefined,
            aiEstimate: undefined,
          },
        })
        .where(eq(promptResearchItems.id, i.id));
      source = "dataforseo";
      updated++;
      continue;
    }
    const m = rows?.kind === "ai" && key ? rows.metrics.get(key) : undefined;
    if (rows?.kind === "ai" && m?.searchVolume != null) {
      await db
        .update(promptResearchItems)
        .set({ keyword: i.keyword, volume: m.searchVolume, volumeSource: "estimated", details: aiVolumeDetails(details, m, rows.meta) })
        .where(eq(promptResearchItems.id, i.id));
      source = "estimated";
      updated++;
      continue;
    }
    // No absolute number: fall back to the relative 1–10 demand estimated while generating the prompt.
    if (typeof details.relativeVolume !== "number") continue;
    await db
      .update(promptResearchItems)
      .set({
        volumeSource: "estimated",
        volume: null,
        keyword: i.keyword ?? deriveKeyword(i.text),
        details: { ...details, estimatedLabel: "Estimated relative demand (AI) — connect DataForSEO for search volumes" },
      })
      .where(eq(promptResearchItems.id, i.id));
    source = "estimated";
    updated++;
  }
  await rescoreList(projectId, listId);
  return { source, updated };
}

/** Recomputes the 10-segment bar score for all items of a list. */
export async function rescoreList(projectId: string, listId: string) {
  const items = await db
    .select({ id: promptResearchItems.id, volume: promptResearchItems.volume, volumeSource: promptResearchItems.volumeSource, details: promptResearchItems.details })
    .from(promptResearchItems)
    .where(and(eq(promptResearchItems.projectId, projectId), eq(promptResearchItems.listId, listId)));
  // Absolute volumes (measured, imported or AI-estimated monthly searches) share one log scale; the rows stay
  // labelled by their volume source.
  const absolute = items.filter((i) => i.volumeSource === "dataforseo" || ((i.volumeSource === "import" || i.volumeSource === "estimated") && i.volume != null));
  const scores = volumeScores(absolute.map((i) => i.volume));
  const updates = new Map<string, number | null>();
  absolute.forEach((i, idx) => updates.set(i.id, scores[idx] ?? null));
  for (const i of items) {
    if (updates.has(i.id)) continue;
    const rel = (i.details as Record<string, unknown>)?.relativeVolume;
    updates.set(i.id, typeof rel === "number" && i.volumeSource === "estimated" ? rel / 10 : null);
  }
  // Group identical scores to keep the number of UPDATE statements small.
  const byScore = new Map<string, string[]>();
  for (const [id, score] of updates) {
    const k = score == null ? "null" : score.toFixed(4);
    if (!byScore.has(k)) byScore.set(k, []);
    byScore.get(k)!.push(id);
  }
  for (const [k, ids] of byScore) {
    for (let i = 0; i < ids.length; i += 500) {
      await db
        .update(promptResearchItems)
        .set({ volumeScore: k === "null" ? null : Number(k) })
        .where(inArray(promptResearchItems.id, ids.slice(i, i + 500)));
    }
  }
}

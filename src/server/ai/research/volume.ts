/**
 * Pure helpers of the prompt-research volume enrichment (unit tested).
 */
import type { AiEnrichmentMeta, AiKeywordMetric } from "@/server/enrichment/ai";
import type { ResearchItemDetails } from "@/features/ai-research/types";

/** Item details for an AI-estimated absolute search volume (labelled as an estimate everywhere it is shown). */
export function aiVolumeDetails(
  details: ResearchItemDetails,
  m: Pick<AiKeywordMetric, "searchVolume" | "cpcUsd" | "difficulty" | "intent" | "confidence">,
  meta: Pick<AiEnrichmentMeta, "provider" | "model" | "generatedAt"> | null,
): ResearchItemDetails {
  return {
    ...details,
    keywordMetrics: { searchVolume: m.searchVolume, cpc: m.cpcUsd, difficulty: m.difficulty, intent: m.intent },
    // AI never invents monthly trends.
    trend: [],
    estimatedLabel: "AI estimate (web search) — connect DataForSEO for measured search volumes",
    aiEstimate: { provider: meta?.provider ?? null, model: meta?.model ?? null, generatedAt: meta?.generatedAt ?? null, confidence: m.confidence },
  };
}

/** Items that still need volume data: no volume yet, or only the relative 1–10 demand from the Prompt Set Helper. */
export function needsVolume(i: { volumeSource: string | null; volume: number | null }): boolean {
  return i.volumeSource == null || (i.volumeSource === "estimated" && i.volume == null);
}

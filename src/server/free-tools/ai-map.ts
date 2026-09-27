/**
 * Maps AI enrichment results (src/server/enrichment/ai.ts) onto the free tools' result shapes, so the same views can
 * render them — every mapped result carries `ai` (model, date, confidence) and is labelled as an estimate.
 * Values the AI cannot know (backlink totals, domain ranks, follow status, traffic value, monthly trends) stay null.
 * Pure module (no server imports) so it can be unit tested.
 */
import type { AiDomainProfile, AiEnrichmentMeta, AiKeywordMetric, AiLinkMention } from "@/server/enrichment/ai";
import type {
  AiEstimateInfo,
  BacklinkCheckResult,
  CompetitorAnalysisResult,
  DomainTraffic,
  GapRow,
  KeywordFinderResult,
  KeywordGeneratorResult,
  OrganicMetrics,
  RankedKeywordRow,
  RelevantPageRow,
  TrafficCheckResult,
} from "@/features/free-tools/lib/types";

const CONFIDENCE_RANK = { low: 0, medium: 1, high: 2 } as const;

export function aiInfo(meta: Pick<AiEnrichmentMeta, "provider" | "model" | "generatedAt" | "confidence" | "citations">): AiEstimateInfo {
  return { provider: meta.provider, model: meta.model, generatedAt: meta.generatedAt, confidence: meta.confidence, citations: meta.citations };
}

/** Combined label of several estimates: the weakest confidence, the latest date, all citations. */
export function mergeAiInfo(metas: Pick<AiEnrichmentMeta, "provider" | "model" | "generatedAt" | "confidence" | "citations">[]): AiEstimateInfo {
  const [first, ...rest] = metas;
  if (!first) throw new Error("mergeAiInfo needs at least one estimate");
  return rest.reduce<AiEstimateInfo>(
    (acc, m) => ({
      ...acc,
      generatedAt: m.generatedAt > acc.generatedAt ? m.generatedAt : acc.generatedAt,
      confidence: CONFIDENCE_RANK[m.confidence] < CONFIDENCE_RANK[acc.confidence] ? m.confidence : acc.confidence,
      citations: acc.citations + m.citations,
    }),
    aiInfo(first),
  );
}

/** Keyword Generator: related ideas without the seed itself (the DataForSEO tool excludes it too). */
export function keywordGeneratorFromAi(
  keyword: string,
  locationCode: number,
  res: { rows: Pick<AiKeywordMetric, "keyword" | "searchVolume" | "difficulty">[]; meta: AiEnrichmentMeta },
  limit = 20,
): KeywordGeneratorResult {
  const seed = keyword.trim().toLowerCase();
  return {
    keyword,
    locationCode,
    keywords: res.rows
      .filter((r) => r.keyword.trim().toLowerCase() !== seed)
      .slice(0, limit)
      .map((r) => ({ keyword: r.keyword, searchVolume: r.searchVolume, difficulty: r.difficulty })),
    ai: aiInfo(res.meta),
  };
}

export function rankedKeywordsFromProfile(profile: Pick<AiDomainProfile, "topKeywords">, limit: number): RankedKeywordRow[] {
  return [...profile.topKeywords]
    .sort((a, b) => (b.volumeEst ?? -1) - (a.volumeEst ?? -1))
    .slice(0, limit)
    .map((k) => ({ keyword: k.keyword, searchVolume: k.volumeEst, difficulty: null, position: k.positionEst, url: k.url }));
}

export function pagesFromProfile(profile: Pick<AiDomainProfile, "topPages" | "organicTrafficEst">, limit: number): RelevantPageRow[] {
  return profile.topPages.slice(0, limit).map((p) => ({
    url: p.url,
    traffic: p.share != null && profile.organicTrafficEst != null ? Math.round(p.share * profile.organicTrafficEst) : null,
    keywords: p.keywordsEst,
  }));
}

export function metricsFromProfile(profile: Pick<AiDomainProfile, "organicTrafficEst" | "organicKeywordsEst">): OrganicMetrics {
  return { organicTraffic: profile.organicTrafficEst, organicKeywords: profile.organicKeywordsEst, trafficValue: null };
}

export function domainTrafficFromProfile(profile: AiDomainProfile): DomainTraffic {
  return {
    domain: profile.domain,
    ...metricsFromProfile(profile),
    topKeywords: rankedKeywordsFromProfile(profile, 5),
    topPages: pagesFromProfile(profile, 5),
    totalPages: null,
  };
}

export function trafficCheckFromAi(locationCode: number, profiles: { profile: AiDomainProfile; meta: AiEnrichmentMeta }[]): TrafficCheckResult {
  const [primary, comparison] = profiles;
  if (!primary) throw new Error("trafficCheckFromAi needs a profile");
  return {
    locationCode,
    primary: domainTrafficFromProfile(primary.profile),
    comparison: comparison ? domainTrafficFromProfile(comparison.profile) : null,
    ai: mergeAiInfo(profiles.map((p) => p.meta)),
  };
}

export function keywordFinderFromAi(domain: string, locationCode: number, res: { profile: AiDomainProfile; meta: AiEnrichmentMeta }): KeywordFinderResult {
  return { target: domain, locationCode, keywords: rankedKeywordsFromProfile(res.profile, 20), ai: aiInfo(res.meta) };
}

/**
 * Estimated keyword gap: the competitor's estimated top keywords that are not among your estimated top keywords.
 * Both lists are samples, so this is directional (labelled as an estimate in the UI).
 */
export function gapFromProfiles(competitor: Pick<AiDomainProfile, "topKeywords">, yours: Pick<AiDomainProfile, "topKeywords">, limit = 20): GapRow[] {
  const own = new Set(yours.topKeywords.map((k) => k.keyword.trim().toLowerCase()));
  return competitor.topKeywords
    .filter((k) => !own.has(k.keyword.trim().toLowerCase()))
    .sort((a, b) => (b.volumeEst ?? -1) - (a.volumeEst ?? -1))
    .slice(0, limit)
    .map((k) => ({ keyword: k.keyword, searchVolume: k.volumeEst, difficulty: null, position: k.positionEst, url: k.url, traffic: null }));
}

export function competitorAnalysisFromAi(
  locationCode: number,
  competitor: { profile: AiDomainProfile; meta: AiEnrichmentMeta },
  yours: { profile: AiDomainProfile; meta: AiEnrichmentMeta } | null,
): CompetitorAnalysisResult {
  return {
    competitor: competitor.profile.domain,
    yourDomain: yours?.profile.domain ?? null,
    locationCode,
    keywords: rankedKeywordsFromProfile(competitor.profile, 20),
    totalKeywords: competitor.profile.organicKeywordsEst,
    pages: pagesFromProfile(competitor.profile, 10),
    totalPages: null,
    comparison: yours ? { competitor: metricsFromProfile(competitor.profile), you: metricsFromProfile(yours.profile) } : null,
    gap: yours ? gapFromProfiles(competitor.profile, yours.profile) : null,
    gapFailed: false,
    ai: mergeAiInfo(yours ? [competitor.meta, yours.meta] : [competitor.meta]),
  };
}

/**
 * Backlink Checker: a verified sample of pages that link to / mention the domain. Target URL, anchor and follow status
 * come from the live-fetched page (first link); index totals and domain ranks stay unknown.
 */
export function backlinkCheckFromAi(domain: string, res: { items: AiLinkMention[]; meta: AiEnrichmentMeta }, limit = 15): BacklinkCheckResult {
  const ordered = [...res.items].sort((a, b) => Number(b.linksToDomain === true) - Number(a.linksToDomain === true));
  return {
    target: domain,
    summary: { rank: null, backlinks: null, referringDomains: null, brokenBacklinks: null },
    topBacklinks: ordered.slice(0, limit).map((i) => {
      const link = i.links?.[0];
      return {
        domainFrom: i.domain || null,
        urlFrom: i.url,
        urlTo: link?.url ?? null,
        pageTitle: i.title,
        anchor: link?.anchor ?? null,
        dofollow: link ? !link.nofollow : null,
        domainRank: null,
        linkStatus: i.linksToDomain === true ? "link" : i.linksToDomain === false ? "mention" : "unverified",
      };
    }),
    ai: aiInfo(res.meta),
  };
}

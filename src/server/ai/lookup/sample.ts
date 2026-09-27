/**
 * Brand Lookup "AI sample" (no DataForSEO LLM Mentions): aggregation of a small set of AI answers to category/buyer
 * prompts into the Brand Lookup result shape — mentions per platform, cited sources and share of voice.
 * Pure module (no server imports) so it can be unit tested.
 */
import { domainMatches, matchBrands, type BrandDef } from "@/server/ai/analysis/brand-match";
import { normalizeUrl, urlDomain } from "@/server/ai/analysis/sources";
import type { BrandLookupResult, LookupPlatform } from "@/features/ai-research/types";

type LookupTarget = BrandLookupResult["target"];

export const SAMPLE_PROMPTS = { min: 10, max: 20, default: 12 } as const;

/** One sampled engine answer (text + citations) to one generated prompt. */
export type SampleAnswer = {
  prompt: string;
  platform: LookupPlatform;
  text: string;
  citations: { url: string; title: string | null }[];
};

export type SampleBrand = { key: string; label: string; terms: string[]; domains: string[]; isTarget: boolean };

/** Minimal engine availability shape (see `EngineAvailability` in src/server/ai/engines/availability.ts). */
export type SampleAvailability<P extends string = string> = {
  setting: string;
  providers: { provider: P; configured: boolean }[];
};

/**
 * Provider that answers a sample prompt for an engine without DataForSEO: the admin's pinned provider when it is not
 * DataForSEO and usable, otherwise the first usable non-DataForSEO provider (direct API, local agent, AI simulation).
 */
export function pickSampleProvider<P extends string>(avail: SampleAvailability<P> | null): P | null {
  if (!avail || avail.setting === "disabled") return null;
  if (avail.setting !== "auto" && avail.setting !== "dataforseo") {
    const pinned = avail.providers.find((p) => p.provider === avail.setting);
    return pinned?.configured ? pinned.provider : null;
  }
  return avail.providers.find((p) => p.provider !== "dataforseo" && p.configured)?.provider ?? null;
}

/** Brand definition for a lookup target: domain → domain + its name stem ("solakon.de" → "solakon"); keyword → itself. */
export function brandForTarget(target: LookupTarget, opts: { key: string; isTarget: boolean; aliases?: string[] }): SampleBrand {
  const terms = new Set<string>();
  const domains: string[] = [];
  if (target.type === "domain") {
    terms.add(target.value);
    domains.push(target.value);
    const stem = target.value.split(".")[0] ?? "";
    if (stem.length >= 3) terms.add(stem);
  } else {
    terms.add(target.value);
  }
  for (const a of opts.aliases ?? []) if (a.trim().length >= 2) terms.add(a.trim());
  return { key: opts.key, label: target.value, terms: [...terms], domains, isTarget: opts.isTarget };
}

function toBrandDef(b: SampleBrand): BrandDef {
  return { key: b.key, name: b.label, terms: b.terms, domains: b.domains, isOwn: b.isTarget, competitorId: b.isTarget ? null : b.key };
}

/** Brands named in an answer or whose domain it cites. */
export function brandsInAnswer(answer: Pick<SampleAnswer, "text" | "citations">, brands: SampleBrand[]): Set<string> {
  const citedDomains = answer.citations.map((c) => urlDomain(c.url)).filter(Boolean);
  const hits = matchBrands(answer.text, brands.map(toBrandDef), citedDomains);
  const found = new Set(hits.map((h) => h.key));
  for (const b of brands) {
    if (b.domains.some((d) => citedDomains.some((c) => domainMatches(c, d)))) found.add(b.key);
  }
  return found;
}

export type SampleAggregate = Pick<
  BrandLookupResult,
  "perPlatform" | "totalMentions" | "totalAiSearchVolume" | "topPages" | "topQueries" | "monthlyVolume" | "shareOfVoice" | "hasData"
>;

/**
 * Aggregates sampled answers: a "mention" is an answer that names the brand or cites its domain. AI search volume is
 * never estimated (null) and there is no monthly trend. Share of voice is computed when competitors were given.
 */
export function aggregateSample(input: {
  target: LookupTarget;
  brands: SampleBrand[];
  platforms: { platform: LookupPlatform; status: "ok" | "error"; error?: string }[];
  answers: SampleAnswer[];
  fetchedAt: string;
}): SampleAggregate {
  const { brands, answers } = input;
  const target = brands.find((b) => b.isTarget);
  const mentionsByAnswer = answers.map((a) => brandsInAnswer(a, brands));

  const perPlatform: BrandLookupResult["perPlatform"] = input.platforms.map((p) => {
    if (p.status === "error") return { platform: p.platform, status: "error", mentions: null, aiSearchVolume: null, error: p.error };
    const mentions = answers.filter((a, i) => a.platform === p.platform && target && mentionsByAnswer[i]!.has(target.key)).length;
    return { platform: p.platform, status: "ok", mentions, aiSearchVolume: null };
  });
  const okPlatforms = perPlatform.filter((p) => p.status === "ok");
  const totalMentions = okPlatforms.length ? okPlatforms.reduce((sum, p) => sum + (p.mentions ?? 0), 0) : null;

  const labelOf = new Map(brands.map((b) => [b.key, b.label]));
  const topQueries: BrandLookupResult["topQueries"] = answers.map((a, i) => ({
    question: a.prompt.slice(0, 500),
    platform: a.platform,
    aiSearchVolume: null,
    firstSeenAt: input.fetchedAt,
    lastSeenAt: input.fetchedAt,
    citedSources: a.citations
      .map((c) => ({ url: c.url, domain: urlDomain(c.url), title: c.title?.slice(0, 300) ?? null }))
      .filter((c) => c.domain)
      .slice(0, 10),
    brandsMentioned: [...mentionsByAnswer[i]!].map((k) => labelOf.get(k) ?? k),
    targetMentioned: Boolean(target && mentionsByAnswer[i]!.has(target.key)),
  }));

  // Cited sources: how many sampled answers (per platform) cite each page.
  const pages = new Map<string, BrandLookupResult["topPages"][number]>();
  for (const a of answers) {
    const seen = new Set<string>();
    for (const c of a.citations) {
      const url = normalizeUrl(c.url);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      const key = `${a.platform}|${url}`;
      const domain = urlDomain(url);
      const page = pages.get(key) ?? {
        url,
        domain,
        platform: a.platform,
        mentions: 0,
        capturedVolume: null,
        prompts: [],
        isTarget: Boolean(target?.domains.some((d) => domainMatches(domain, d))),
      };
      page.mentions = (page.mentions ?? 0) + 1;
      if (page.prompts.length < 50 && !page.prompts.includes(a.prompt)) page.prompts.push(a.prompt.slice(0, 500));
      pages.set(key, page);
    }
  }
  const topPages = [...pages.values()].sort((a, b) => (b.mentions ?? 0) - (a.mentions ?? 0) || a.url.localeCompare(b.url)).slice(0, 50);

  let shareOfVoice: BrandLookupResult["shareOfVoice"] = null;
  if (brands.length > 1 && okPlatforms.length) {
    const counts = brands.map((b) => ({ b, mentions: mentionsByAnswer.filter((m) => m.has(b.key)).length }));
    const denom = counts.reduce((sum, c) => sum + c.mentions, 0);
    shareOfVoice = {
      entries: counts
        .map(({ b, mentions }) => ({ key: b.label, label: b.label, mentions, sharePct: denom > 0 ? (mentions / denom) * 100 : null, isTarget: b.isTarget }))
        .sort((a, b) => (b.mentions ?? -1) - (a.mentions ?? -1)),
      platforms: okPlatforms.map((p) => p.platform),
    };
  }

  return {
    perPlatform,
    totalMentions,
    totalAiSearchVolume: null,
    topPages,
    topQueries,
    monthlyVolume: [],
    shareOfVoice,
    hasData: answers.length > 0,
  };
}

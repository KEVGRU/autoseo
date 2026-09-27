import { describe, expect, it } from "vitest";
import type { AiDomainProfile, AiEnrichmentMeta } from "@/server/enrichment/ai";
import {
  backlinkCheckFromAi,
  competitorAnalysisFromAi,
  gapFromProfiles,
  keywordFinderFromAi,
  keywordGeneratorFromAi,
  mergeAiInfo,
  trafficCheckFromAi,
} from "./ai-map";

const meta = (over: Partial<AiEnrichmentMeta> = {}): AiEnrichmentMeta => ({
  source: "ai",
  provider: "anthropic",
  model: "claude-sonnet-5",
  generatedAt: "2026-09-26T10:00:00.000Z",
  confidence: "medium",
  citations: 4,
  ...over,
});

const profile = (domain: string, over: Partial<AiDomainProfile> = {}): AiDomainProfile => ({
  domain,
  organicTrafficEst: 12_000,
  organicKeywordsEst: 850,
  topKeywords: [
    { keyword: "balkonkraftwerk speicher", positionEst: 3, volumeEst: 9_900, url: `https://${domain}/speicher` },
    { keyword: "balkonkraftwerk", positionEst: 8, volumeEst: 40_000, url: null },
    { keyword: "solarmodul", positionEst: 15, volumeEst: null, url: null },
  ],
  topPages: [
    { url: `https://${domain}/speicher`, share: 0.25, keywordsEst: 120, verification: "cited" },
    { url: `https://${domain}/`, share: null, keywordsEst: null, verification: "reachable" },
  ],
  competitors: [],
  confidence: "medium",
  ...over,
});

describe("free tools AI mapping", () => {
  it("keyword generator drops the seed and keeps estimated metrics + label", () => {
    const res = keywordGeneratorFromAi("Balkonkraftwerk", 2276, {
      rows: [
        { keyword: "balkonkraftwerk", searchVolume: 40_000, difficulty: 55 },
        { keyword: "balkonkraftwerk speicher", searchVolume: 9_900, difficulty: 40 },
      ],
      meta: meta(),
    });
    expect(res.keywords).toEqual([{ keyword: "balkonkraftwerk speicher", searchVolume: 9_900, difficulty: 40 }]);
    expect(res.ai).toEqual({ provider: "anthropic", model: "claude-sonnet-5", generatedAt: "2026-09-26T10:00:00.000Z", confidence: "medium", citations: 4 });
  });

  it("keyword finder orders by estimated volume and never invents difficulty", () => {
    const res = keywordFinderFromAi("solakon.de", 2276, { profile: profile("solakon.de"), meta: meta() });
    expect(res.keywords.map((k) => k.keyword)).toEqual(["balkonkraftwerk", "balkonkraftwerk speicher", "solarmodul"]);
    expect(res.keywords.every((k) => k.difficulty === null)).toBe(true);
    expect(res.keywords[1]).toMatchObject({ position: 3, url: "https://solakon.de/speicher" });
  });

  it("traffic check derives page traffic from the share and leaves unknowns null", () => {
    const res = trafficCheckFromAi(2276, [
      { profile: profile("solakon.de"), meta: meta({ confidence: "high", citations: 2 }) },
      { profile: profile("ecoflow.com", { organicTrafficEst: null }), meta: meta({ confidence: "low", citations: 1, generatedAt: "2026-09-26T11:00:00.000Z" }) },
    ]);
    expect(res.primary).toMatchObject({ domain: "solakon.de", organicTraffic: 12_000, organicKeywords: 850, trafficValue: null, totalPages: null });
    expect(res.primary.topPages).toEqual([
      { url: "https://solakon.de/speicher", traffic: 3_000, keywords: 120 },
      { url: "https://solakon.de/", traffic: null, keywords: null },
    ]);
    expect(res.comparison?.topPages[0]?.traffic).toBeNull();
    expect(res.ai).toMatchObject({ confidence: "low", citations: 3, generatedAt: "2026-09-26T11:00:00.000Z" });
  });

  it("competitor analysis compares estimates and computes a directional gap", () => {
    const theirs = profile("ecoflow.com");
    const yours = profile("solakon.de", { topKeywords: [{ keyword: "Balkonkraftwerk", positionEst: 5, volumeEst: 40_000, url: null }] });
    expect(gapFromProfiles(theirs, yours).map((g) => g.keyword)).toEqual(["balkonkraftwerk speicher", "solarmodul"]);

    const res = competitorAnalysisFromAi(2276, { profile: theirs, meta: meta() }, { profile: yours, meta: meta() });
    expect(res).toMatchObject({ competitor: "ecoflow.com", yourDomain: "solakon.de", totalKeywords: 850, totalPages: null, gapFailed: false });
    expect(res.comparison?.you).toEqual({ organicTraffic: 12_000, organicKeywords: 850, trafficValue: null });
    expect(res.gap?.every((g) => g.traffic === null)).toBe(true);

    const solo = competitorAnalysisFromAi(2276, { profile: theirs, meta: meta() }, null);
    expect(solo.comparison).toBeNull();
    expect(solo.gap).toBeNull();
  });

  it("backlink sample lists linking pages first and never fills index totals", () => {
    const res = backlinkCheckFromAi("solakon.de", {
      items: [
        { url: "https://forum.example/thread", domain: "forum.example", title: "Thread", snippet: null, linksToDomain: false, links: [], verification: "reachable" },
        {
          url: "https://news.example/a",
          domain: "news.example",
          title: "News",
          snippet: null,
          linksToDomain: true,
          links: [{ url: "https://solakon.de/speicher", anchor: "Solakon Speicher", nofollow: true }],
          verification: "cited",
        },
        { url: "https://blog.example/b", domain: "blog.example", title: null, snippet: null, linksToDomain: null, links: [], verification: "cited" },
      ],
      meta: meta({ confidence: "low" }),
    });
    expect(res.summary).toEqual({ rank: null, backlinks: null, referringDomains: null, brokenBacklinks: null });
    expect(res.topBacklinks.map((b) => [b.domainFrom, b.linkStatus, b.dofollow, b.domainRank])).toEqual([
      ["news.example", "link", false, null],
      ["forum.example", "mention", null, null],
      ["blog.example", "unverified", null, null],
    ]);
    expect(res.topBacklinks[0]).toMatchObject({ urlTo: "https://solakon.de/speicher", anchor: "Solakon Speicher" });
    expect(res.ai?.confidence).toBe("low");
  });

  it("mergeAiInfo requires at least one estimate", () => {
    expect(() => mergeAiInfo([])).toThrow();
  });
});

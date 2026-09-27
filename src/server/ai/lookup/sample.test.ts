import { describe, expect, it } from "vitest";
import { aggregateSample, brandForTarget, brandsInAnswer, pickSampleProvider, type SampleAnswer } from "./sample";

const NOW = "2026-09-26T10:00:00.000Z";

describe("pickSampleProvider", () => {
  const providers = [
    { provider: "dataforseo", configured: true },
    { provider: "api", configured: false },
    { provider: "agent", configured: true },
    { provider: "ai", configured: true },
  ];

  it("skips DataForSEO and picks the first usable provider in preference order", () => {
    expect(pickSampleProvider({ setting: "auto", providers })).toBe("agent");
    expect(pickSampleProvider({ setting: "dataforseo", providers })).toBe("agent");
  });

  it("honours a pinned non-DataForSEO provider only when it is usable", () => {
    expect(pickSampleProvider({ setting: "ai", providers })).toBe("ai");
    expect(pickSampleProvider({ setting: "api", providers })).toBeNull();
  });

  it("returns null for disabled engines, unknown engines and engines without a usable provider", () => {
    expect(pickSampleProvider({ setting: "disabled", providers })).toBeNull();
    expect(pickSampleProvider(null)).toBeNull();
    expect(pickSampleProvider({ setting: "auto", providers: [{ provider: "dataforseo", configured: true }] })).toBeNull();
  });
});

describe("brandForTarget", () => {
  it("uses the domain and its name stem for domains", () => {
    expect(brandForTarget({ type: "domain", value: "solakon.de" }, { key: "target", isTarget: true })).toEqual({
      key: "target",
      label: "solakon.de",
      terms: ["solakon.de", "solakon"],
      domains: ["solakon.de"],
      isTarget: true,
    });
  });

  it("keeps keyword targets as-is and adds aliases", () => {
    const b = brandForTarget({ type: "keyword", value: "Anker SOLIX" }, { key: "c0", isTarget: false, aliases: ["Anker", " "] });
    expect(b.terms).toEqual(["Anker SOLIX", "Anker"]);
    expect(b.domains).toEqual([]);
  });
});

describe("aggregateSample", () => {
  const brands = [
    brandForTarget({ type: "domain", value: "solakon.de" }, { key: "target", isTarget: true }),
    brandForTarget({ type: "keyword", value: "EcoFlow" }, { key: "c0", isTarget: false }),
  ];
  const answers: SampleAnswer[] = [
    {
      prompt: "Welches Balkonkraftwerk mit Speicher ist das beste?",
      platform: "chat_gpt",
      text: "Beliebt sind **Solakon** und EcoFlow. Solakon punktet beim Preis.",
      citations: [{ url: "https://www.test.de/balkonkraftwerke?utm_source=x", title: "Test" }],
    },
    {
      prompt: "Balkonkraftwerk Speicher Vergleich",
      platform: "chat_gpt",
      text: "EcoFlow ist eine gute Wahl. Mehr unter [Link](https://solakon.de/produkte).",
      citations: [{ url: "https://test.de/balkonkraftwerke", title: "Test" }],
    },
    {
      prompt: "Balkonkraftwerk Speicher Vergleich",
      platform: "google",
      text: "Anbieter wie EcoFlow und Anker bieten Speicher an.",
      citations: [{ url: "https://solakon.de/speicher", title: "Solakon Speicher" }],
    },
  ];

  it("counts an answer as a mention when it names the brand or cites its domain (URLs in text don't count)", () => {
    expect([...brandsInAnswer(answers[0]!, brands)].sort()).toEqual(["c0", "target"]);
    // Only a markdown link to solakon.de, no name → not a mention.
    expect([...brandsInAnswer(answers[1]!, brands)]).toEqual(["c0"]);
    // Cited domain counts.
    expect([...brandsInAnswer(answers[2]!, brands)].sort()).toEqual(["c0", "target"]);
  });

  it("aggregates per platform, sources and share of voice without inventing AI search volume", () => {
    const res = aggregateSample({
      target: { type: "domain", value: "solakon.de" },
      brands,
      platforms: [
        { platform: "chat_gpt", status: "ok" },
        { platform: "google", status: "ok" },
      ],
      answers,
      fetchedAt: NOW,
    });
    expect(res.perPlatform).toEqual([
      { platform: "chat_gpt", status: "ok", mentions: 1, aiSearchVolume: null },
      { platform: "google", status: "ok", mentions: 1, aiSearchVolume: null },
    ]);
    expect(res.totalMentions).toBe(2);
    expect(res.totalAiSearchVolume).toBeNull();
    expect(res.monthlyVolume).toEqual([]);
    expect(res.hasData).toBe(true);
    expect(res.topQueries.map((q) => q.targetMentioned)).toEqual([true, false, true]);
    expect(res.topQueries.every((q) => q.aiSearchVolume === null && q.firstSeenAt === NOW)).toBe(true);

    // test.de cited by both ChatGPT answers (tracking params stripped, www dropped) → one page with 2 citations.
    const testPage = res.topPages.find((p) => p.domain === "test.de" && p.platform === "chat_gpt");
    expect(testPage).toMatchObject({ url: "https://test.de/balkonkraftwerke", mentions: 2, capturedVolume: null, isTarget: false });
    expect(testPage?.prompts).toHaveLength(2);
    expect(res.topPages.find((p) => p.domain === "solakon.de")).toMatchObject({ platform: "google", isTarget: true, mentions: 1 });

    expect(res.shareOfVoice?.platforms).toEqual(["chat_gpt", "google"]);
    expect(res.shareOfVoice?.entries.map((e) => [e.label, e.mentions, Math.round(e.sharePct ?? 0)])).toEqual([
      ["EcoFlow", 3, 60],
      ["solakon.de", 2, 40],
    ]);
  });

  it("marks failed platforms and returns no share of voice without competitors", () => {
    const res = aggregateSample({
      target: { type: "domain", value: "solakon.de" },
      brands: [brands[0]!],
      platforms: [
        { platform: "chat_gpt", status: "ok" },
        { platform: "google", status: "error", error: "No provider without DataForSEO" },
      ],
      answers: [answers[0]!],
      fetchedAt: NOW,
    });
    expect(res.perPlatform[1]).toEqual({ platform: "google", status: "error", mentions: null, aiSearchVolume: null, error: "No provider without DataForSEO" });
    expect(res.totalMentions).toBe(1);
    expect(res.shareOfVoice).toBeNull();
  });
});

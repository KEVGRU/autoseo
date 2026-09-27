import { describe, expect, it } from "vitest";
import { aiVolumeDetails, needsVolume } from "./volume";

describe("prompt research volume helpers", () => {
  it("treats missing and relative-only estimates as missing, but not measured / imported / absolute estimates", () => {
    expect(needsVolume({ volumeSource: null, volume: null })).toBe(true);
    expect(needsVolume({ volumeSource: "estimated", volume: null })).toBe(true);
    expect(needsVolume({ volumeSource: "estimated", volume: 1200 })).toBe(false);
    expect(needsVolume({ volumeSource: "dataforseo", volume: 0 })).toBe(false);
    expect(needsVolume({ volumeSource: "import", volume: 50 })).toBe(false);
  });

  it("labels AI volumes, keeps other details and never carries a trend", () => {
    const details = aiVolumeDetails(
      { rationale: "why", trend: [{ month: "2026-01", volume: 10 }] },
      { searchVolume: 1900, cpcUsd: 0.8, difficulty: 35, intent: "commercial", confidence: "medium" },
      { provider: "agent", model: "claude-code", generatedAt: "2026-09-26T10:00:00.000Z" },
    );
    expect(details).toEqual({
      rationale: "why",
      keywordMetrics: { searchVolume: 1900, cpc: 0.8, difficulty: 35, intent: "commercial" },
      trend: [],
      estimatedLabel: "AI estimate (web search) — connect DataForSEO for measured search volumes",
      aiEstimate: { provider: "agent", model: "claude-code", generatedAt: "2026-09-26T10:00:00.000Z", confidence: "medium" },
    });
    expect(aiVolumeDetails({}, { searchVolume: 0, cpcUsd: null, difficulty: null, intent: null, confidence: "low" }, null).aiEstimate).toEqual({
      provider: null,
      model: null,
      generatedAt: null,
      confidence: "low",
    });
  });
});

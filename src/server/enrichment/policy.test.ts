import { describe, expect, it } from "vitest";
import { decideEnrichmentProvider, isFallbackTrigger, type EnrichmentMode } from "./policy";

describe("decideEnrichmentProvider", () => {
  const cases: [EnrichmentMode | undefined, boolean, boolean, boolean, "dataforseo" | "ai" | null][] = [
    // mode, dfsConfigured, aiAvailable, aiCapabilityEnabled → provider
    ["auto", true, true, true, "dataforseo"],
    ["auto", true, false, false, "dataforseo"],
    ["auto", false, true, true, "ai"],
    ["auto", false, false, true, null],
    ["auto", false, true, false, null],
    [undefined, false, true, true, "ai"],
    [undefined, true, false, true, "dataforseo"],
    ["dataforseo", true, true, true, "dataforseo"],
    ["dataforseo", false, true, true, null],
    ["ai", true, true, true, "ai"],
    ["ai", false, true, true, "ai"],
    ["ai", true, false, true, null],
    ["ai", true, true, false, null],
  ];
  it.each(cases)("mode=%s dfs=%s ai=%s capability=%s → %s", (mode, dfsConfigured, aiAvailable, aiCapabilityEnabled, expected) => {
    const r = decideEnrichmentProvider({ mode, dfsConfigured, aiAvailable, aiCapabilityEnabled });
    expect(r.provider).toBe(expected);
    expect(r.mode).toBe(mode ?? "auto");
    expect(r.reason.length).toBeGreaterThan(10);
  });

  it("explains how to fix a missing source", () => {
    expect(decideEnrichmentProvider({ mode: "auto", dfsConfigured: false, aiAvailable: false, aiCapabilityEnabled: true }).reason).toMatch(/AI Providers/);
    expect(decideEnrichmentProvider({ mode: "dataforseo", dfsConfigured: false, aiAvailable: true, aiCapabilityEnabled: true }).reason).toMatch(/Data Providers/);
    expect(decideEnrichmentProvider({ mode: "auto", dfsConfigured: false, aiAvailable: true, aiCapabilityEnabled: false }).reason).toMatch(/disabled/);
  });
});

describe("isFallbackTrigger", () => {
  it("falls back for missing / rejected / unfunded DataForSEO accounts only", () => {
    expect(isFallbackTrigger({ notConfigured: true })).toBe(true);
    expect(isFallbackTrigger({ statusCode: 401 })).toBe(true);
    expect(isFallbackTrigger({ statusCode: 402 })).toBe(true);
    expect(isFallbackTrigger({ seoCode: "NOT_CONFIGURED" })).toBe(true);
    expect(isFallbackTrigger({ seoCode: "AUTH_FAILED" })).toBe(true);
    expect(isFallbackTrigger({ seoCode: "INSUFFICIENT_FUNDS" })).toBe(true);
  });
  it("never masks budget, rate-limit, validation or upstream errors", () => {
    expect(isFallbackTrigger({ statusCode: 429 })).toBe(false);
    expect(isFallbackTrigger({ statusCode: 500 })).toBe(false);
    expect(isFallbackTrigger({ seoCode: "BUDGET" })).toBe(false);
    expect(isFallbackTrigger({ seoCode: "VALIDATION_ERROR" })).toBe(false);
    expect(isFallbackTrigger({ seoCode: "UPSTREAM" })).toBe(false);
    expect(isFallbackTrigger({})).toBe(false);
  });
});

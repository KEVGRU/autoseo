import { describe, expect, it } from "vitest";
import { expandPromptMarkets, marketColumns, marketTaskKey, normalizeMarkets, MAX_PROMPT_MARKETS } from "./markets";

describe("multi-market prompts", () => {
  it("expands a prompt into its markets, primary market first", () => {
    expect(expandPromptMarkets({ country: "DE", markets: null })).toEqual(["DE"]);
    expect(expandPromptMarkets({ country: "DE" })).toEqual(["DE"]);
    expect(expandPromptMarkets({ country: "DE", markets: ["FR", "DE", "it"] })).toEqual(["DE", "FR", "IT"]);
    expect(expandPromptMarkets({ country: "de", markets: [] })).toEqual(["DE"]);
  });

  it("normalizes market lists (upper-case, unique, valid codes, capped)", () => {
    expect(normalizeMarkets([" us", "US", "xyz", "", null, "gb"])).toEqual(["US", "GB"]);
    const many = Array.from({ length: 40 }, (_, i) => String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + Math.floor(i / 26)));
    expect(normalizeMarkets(many)).toHaveLength(MAX_PROMPT_MARKETS);
  });

  it("stores the first market as country and the list only when there are several", () => {
    expect(marketColumns(["FR"], "DE")).toEqual({ country: "FR", markets: null });
    expect(marketColumns(["FR", "DE"], "US")).toEqual({ country: "FR", markets: ["FR", "DE"] });
    expect(marketColumns([], "de")).toEqual({ country: "DE", markets: null });
  });

  it("keys tasks per prompt × market × engine", () => {
    expect(marketTaskKey("prm_1", "de", "chatgpt")).toBe("prm_1:DE:chatgpt");
  });
});

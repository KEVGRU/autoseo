import { describe, expect, it } from "vitest";
import { claimCandidates, hashBody, normalizeVerdict, parseClaimResults, summarizeClaims } from "./claims-parse";

describe("claim parsing", () => {
  it("maps verdict aliases to the three verdicts", () => {
    expect(normalizeVerdict("Supported")).toBe("supported");
    expect(normalizeVerdict("TRUE")).toBe("supported");
    expect(normalizeVerdict("false")).toBe("contradicted");
    expect(normalizeVerdict("outdated")).toBe("contradicted");
    expect(normalizeVerdict("partially_supported")).toBe("unsupported");
    expect(normalizeVerdict("not-found")).toBe("unsupported");
    expect(normalizeVerdict(undefined)).toBe("unsupported");
    expect(normalizeVerdict("banana")).toBe("unsupported");
  });

  it("validates sources, downgrades unsourced 'supported' and dedupes claims", () => {
    const claims = parseClaimResults([
      { claim: "An 800 W kit costs €300–€900 in 2026.", verdict: "supported", explanation: "Price comparison", sources: [{ url: "https://www.verbraucherzentrale.de/x", title: "VZ" }, { url: "https://www.verbraucherzentrale.de/x" }, { url: "javascript:alert(1)" }, "ftp://x.test/y"] },
      { claim: "An 800 W kit costs €300–€900 in 2026!", verdict: "supported", sources: [] },
      { claim: "The feed-in limit is 600 VA.", verdict: "false", explanation: "Raised to 800 VA in 2024", suggestion: "The feed-in limit is 800 VA (since 2024).", sources: [{ url: "https://www.bundesnetzagentur.de/a" }] },
      { claim: "Solakon offers a 10-year warranty.", verdict: "verified", sources: [{ url: "knowledge://ksr_abc123/upload%3Aff00" }] },
      { claim: "Batteries last forever.", verdict: "supported", suggestion: "should be dropped", sources: [] },
      { claim: "short", verdict: "supported" },
      { verdict: "supported" },
    ]);
    expect(claims.map((c) => c.verdict)).toEqual(["supported", "contradicted", "supported", "unsupported"]);
    expect(claims[0]!.sources).toEqual([{ url: "https://www.verbraucherzentrale.de/x", title: "VZ" }]);
    expect(claims[1]!.suggestion).toBe("The feed-in limit is 800 VA (since 2024).");
    expect(claims[2]!.sources[0]!.url).toBe("knowledge://ksr_abc123/upload%3Aff00");
    // Downgraded claims keep their suggested wording; ids are stable across runs.
    expect(claims[3]!.suggestion).toBe("should be dropped");
    expect(claims[0]!.id).toMatch(/^clm_[0-9a-f]{8}$/);
    expect(parseClaimResults([{ claim: "An 800 W kit costs €300–€900 in 2026.", verdict: "supported", sources: ["https://a.test/x"] }])[0]!.id).toBe(claims[0]!.id);
    expect(summarizeClaims(claims)).toEqual({ supported: 2, unsupported: 1, contradicted: 1 });
  });

  it("caps the number of claims", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ claim: `Claim number ${i} has a fact.`, verdict: "unsupported", sources: [] }));
    expect(parseClaimResults(many)).toHaveLength(15);
    expect(parseClaimResults(many, 5)).toHaveLength(5);
  });

  it("finds checkable candidate sentences and hashes bodies whitespace-insensitively", () => {
    const md = `## Prices\n\nA kit costs about €400 in Germany today.\n\nThis sentence has no facts at all really.\n\n- Since 2024 the limit is 800 VA per household.\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\nAccording to a study, most owners are happy with it.`;
    expect(claimCandidates(md)).toEqual([
      "A kit costs about €400 in Germany today.",
      "Since 2024 the limit is 800 VA per household.",
      "According to a study, most owners are happy with it.",
    ]);
    expect(hashBody("a  b\n c")).toBe(hashBody("a b c"));
    expect(hashBody("a b c")).not.toBe(hashBody("a b d"));
  });
});

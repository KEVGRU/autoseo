import { describe, expect, it } from "vitest";
import { aspectScore, guessAspect, normalizeAspect } from "@/features/ai-insights/lib/aspects";
import { parseClickParams, summarizeClickParams, unwrapLandingUrl } from "@/features/ai-insights/lib/click-params";
import { guessFanoutIntent, wordCount } from "@/features/ai-insights/lib/fanout-intents";
import { classifySource, urlDomain } from "@/server/ai/analysis/sources";
import { buildCatalogIndex, gtinsFromAttributes, matchCatalogProduct, normalizeGtin, normalizeProductUrl } from "./catalog-match";
import { buildPageIndex, scoreCoverage, topicTokens } from "./fanout-coverage";
import { extractFollowups } from "./followups";

describe("sentiment aspects", () => {
  it("scores praise ÷ (praise + criticism)", () => {
    expect(aspectScore(3, 1)).toBe(75);
    expect(aspectScore(0, 4)).toBe(0);
    expect(aspectScore(0, 0)).toBeNull();
  });

  it("maps statements to fixed aspects by attribute, theme, then quote", () => {
    expect(guessAspect({ attribute: "Value for money", theme: "Price & Value" })).toBe("value");
    expect(guessAspect({ attribute: "Preis-Leistung" })).toBe("value");
    expect(guessAspect({ attribute: "High price" })).toBe("price");
    expect(guessAspect({ attribute: "Battery capacity" })).toBe("performance");
    expect(guessAspect({ attribute: "Easy installation" })).toBe("usability");
    expect(guessAspect({ attribute: "Delivery time" })).toBe("availability");
    expect(guessAspect({ attribute: "Warranty" })).toBe("reliability");
    expect(guessAspect({ attribute: "Customer support" })).toBe("support");
    expect(guessAspect({ attribute: "Shipping" })).toBe("service");
    expect(guessAspect({ attribute: "App integration" })).toBe("features");
    expect(guessAspect({ attribute: "Compact size" })).toBe("design");
    expect(guessAspect({ attribute: "Build quality" })).toBe("quality");
    expect(guessAspect({ attribute: "Brand", theme: "Misc", quote: "Die Verarbeitung ist hochwertig" })).toBe("quality");
    expect(guessAspect({ attribute: "Brand", theme: "Misc", quote: "Nice" })).toBeNull();
  });

  it("normalizes LLM labels", () => {
    expect(normalizeAspect("PRICE")).toBe("price");
    expect(normalizeAspect("Ease of use")).toBe("usability");
    expect(normalizeAspect("")).toBeNull();
  });
});

describe("ad click params", () => {
  it("extracts utm_* and click ids, ignores product params", () => {
    const p = parseClickParams("https://shop.example.com/p/1?variant=2&utm_source=google&utm_medium=cpc&utm_campaign=Summer%20Sale&gclid=abc123");
    expect(p).toEqual({ utm_source: "google", utm_medium: "cpc", utm_campaign: "Summer Sale", gclid: "abc123" });
    expect(summarizeClickParams(p)).toMatchObject({ source: "google", medium: "cpc", campaign: "Summer Sale", network: "Google Ads" });
  });

  it("returns null without tracking params or for invalid URLs", () => {
    expect(parseClickParams("https://example.com/?page=2")).toBeNull();
    expect(parseClickParams("javascript:alert(1)")).toBeNull();
    expect(parseClickParams(null)).toBeNull();
  });

  it("unwraps ad-network redirects and keeps outer click ids", () => {
    const u = "https://www.googleadservices.com/pagead/aclk?sa=L&gclid=XYZ&adurl=https%3A%2F%2Fbrand.com%2Flanding%3Futm_source%3Dgoogle%26utm_campaign%3Dai";
    expect(unwrapLandingUrl(u)?.hostname).toBe("brand.com");
    expect(parseClickParams(u)).toEqual({ utm_source: "google", utm_campaign: "ai", gclid: "XYZ" });
    expect(summarizeClickParams(parseClickParams("https://x.com/?msclkid=1")).network).toBe("Microsoft Ads");
  });
});

describe("catalog matching", () => {
  const idx = buildCatalogIndex([
    { id: "c1", name: "Solakon ON 800", url: "https://www.solakon.de/products/onpower", gtin: "04260000000011" },
    { id: "c2", name: "Solakon ON Lite", url: "https://solakon.de/products/onlite/", gtin: null },
    { id: "c3", name: "Halterung Balkon", url: null, gtin: "4260000000028" },
    { id: "c4", name: "Kabel 5m", url: null, gtin: null },
    { id: "c5", name: "Kabel 5m", url: null, gtin: null },
  ]);

  it("normalizes GTINs and URLs", () => {
    expect(normalizeGtin("0 4260000000011")).toBe("4260000000011");
    expect(normalizeGtin("123")).toBeNull();
    expect(normalizeProductUrl("https://www.Solakon.de/nl/products/OnPower/?utm_source=x")).toBe("solakon.de/products/onpower");
    expect(normalizeProductUrl("https://solakon.de/collections/all/products/onlite")).toBe("solakon.de/products/onlite");
  });

  it("matches GTIN → URL → name", () => {
    expect(matchCatalogProduct({ name: "Whatever", gtins: ["4260000000028"] }, idx)).toEqual({ catalogProductId: "c3", by: "gtin" });
    expect(matchCatalogProduct({ name: "Other", urls: ["https://solakon.de/de/products/onlite"] }, idx)).toEqual({ catalogProductId: "c2", by: "url" });
    expect(matchCatalogProduct({ name: "solakon  on-lite" }, idx)).toEqual({ catalogProductId: "c2", by: "name" });
    expect(matchCatalogProduct({ name: "ON 800 Solakon" }, idx)).toEqual({ catalogProductId: "c1", by: "name" });
    expect(matchCatalogProduct({ name: "Solakon ON 800 Balkonkraftwerk Set" }, idx)).toEqual({ catalogProductId: "c1", by: "name" });
  });

  it("does not match ambiguous or unrelated names", () => {
    expect(matchCatalogProduct({ name: "Kabel 5m" }, idx)).toBeNull();
    expect(matchCatalogProduct({ name: "Anker Solix 800" }, idx)).toBeNull();
    expect(matchCatalogProduct({ name: "Solakon" }, idx)).toBeNull();
  });

  it("reads GTINs from product attributes", () => {
    expect(gtinsFromAttributes({ EAN: "4260000000028", Price: "499 €" })).toEqual(["4260000000028"]);
  });
});

describe("source content types", () => {
  const c = (url: string, title: string | null = null) => classifySource({ url, domain: urlDomain(url), title, ownership: "third_party" });
  it("classifies the new types", () => {
    expect(c("https://www.example.com/anker-vs-ecoflow")).toBe("comparison");
    expect(c("https://blog.example.com/balkonkraftwerk-vergleich")).toBe("comparison");
    expect(c("https://de.trustpilot.com/review/solakon.de")).toBe("review");
    expect(c("https://example.com/solakon-erfahrungen")).toBe("review");
    expect(c("https://www.linkedin.com/posts/abc")).toBe("social");
    expect(c("https://x.com/solakon/status/1")).toBe("social");
    expect(c("https://www.wikihow.com/Install-Solar-Panels")).toBe("how-to");
    expect(c("https://example.com/blog/how-to-install-a-balcony-power-plant")).toBe("how-to");
    expect(c("https://example.com/anleitung-balkonkraftwerk-anschliessen")).toBe("how-to");
  });
  it("keeps the existing types", () => {
    expect(c("https://www.reddit.com/r/solar/comments/1")).toBe("ugc");
    expect(c("https://example.com/anker-solix-im-test")).toBe("test");
    expect(c("https://blog.example.com/best-solar-kits-2026")).toBe("listicle");
    expect(c("https://example.com/ratgeber/kaufberatung-speicher")).toBe("buying-guide");
  });
});

describe("fan-out intents & coverage", () => {
  it("classifies intents by keywords", () => {
    expect(guessFanoutIntent("anker solix vs ecoflow")).toBe("comparison");
    expect(guessFanoutIntent("alternatives to solakon")).toBe("alternatives");
    expect(guessFanoutIntent("balkonkraftwerk 800 watt preis")).toBe("pricing");
    expect(guessFanoutIntent("solakon on erfahrungen")).toBe("review");
    expect(guessFanoutIntent("how to install balcony solar")).toBe("how-to");
    expect(guessFanoutIntent("best balcony solar kits 2026")).toBe("freshness");
    expect(guessFanoutIntent("balkonkraftwerk speicher")).toBeNull();
    expect(wordCount("  best  solar kits — 2026 ")).toBe(4);
  });

  it("scores coverage against own pages", () => {
    const idx = buildPageIndex([
      { url: "https://solakon.de/products/balkonkraftwerk-speicher" },
      { url: "https://solakon.de/blogs/technik/wechselrichter-anschliessen", title: "Wechselrichter richtig anschließen" },
    ]);
    expect(topicTokens("beste balkonkraftwerk speicher 2026 test", ["solakon"])).toEqual(["balkonkraftwerk", "speicher"]);
    expect(scoreCoverage("balkonkraftwerke mit speicher", idx)?.coverage).toBe("covered");
    expect(scoreCoverage("wechselrichter anschließen anleitung", idx)).toMatchObject({ coverage: "covered", url: "https://solakon.de/blogs/technik/wechselrichter-anschliessen" });
    expect(scoreCoverage("balkonkraftwerk genehmigung vermieter", idx)?.coverage).toBe("partial");
    expect(scoreCoverage("wärmepumpe förderung", idx)).toMatchObject({ coverage: "gap", url: null });
    expect(scoreCoverage("solakon 2026", idx, ["solakon"])).toBeNull();
    expect(scoreCoverage("anything", buildPageIndex([]))).toBeNull();
  });
});

describe("follow-up questions", () => {
  it("extracts and dedupes related questions, PAA and related searches", () => {
    const raw = {
      provider: {
        relatedQuestions: ["Is a balcony plant worth it?", "  is a balcony plant WORTH it? "],
        peopleAlsoAsk: ["How much does it cost?"],
        relatedSearches: ["balkonkraftwerk 800 watt", "x"],
      },
    };
    expect(extractFollowups(raw)).toEqual([
      { question: "Is a balcony plant worth it?", kind: "followup" },
      { question: "How much does it cost?", kind: "paa" },
      { question: "balkonkraftwerk 800 watt", kind: "related" },
    ]);
    expect(extractFollowups({})).toEqual([]);
    expect(extractFollowups(null)).toEqual([]);
  });
});

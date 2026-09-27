import { describe, expect, it } from "vitest";
import { aggregateSerpCompetitors, aiProfileToKeywordRows, aiProfileToPageRows, estimateCtr, queryKeywordRows, queryPageRows, urlInTarget } from "./ai-domain";
import { linksInTarget, mentionsInScope, sampleToBacklinkRows, sampleToReferringDomains, sampleToTopPages, summarizeSample } from "./ai-backlinks";

const profile = {
  organicTrafficEst: 10_000,
  topKeywords: [
    { keyword: "balkonkraftwerk", positionEst: 1, volumeEst: 50_000, url: "https://solakon.de/balkonkraftwerk" },
    { keyword: "speicher kaufen", positionEst: 8, volumeEst: 2_000, url: "https://solakon.de/shop/speicher" },
    { keyword: "solakon", positionEst: 1, volumeEst: null, url: null },
  ],
  topPages: [
    { url: "https://solakon.de/balkonkraftwerk", share: 0.5, keywordsEst: 300 },
    { url: "https://solakon.de/shop/speicher", share: 0.1, keywordsEst: 40 },
  ],
};

describe("AI domain profile mapping", () => {
  it("derives traffic from volume × CTR and never invents CPC/KD", () => {
    const rows = aiProfileToKeywordRows(profile, { scope: "domain", path: "" });
    expect(rows[0]).toMatchObject({ keyword: "balkonkraftwerk", position: 1, searchVolume: 50_000, traffic: Math.round(50_000 * estimateCtr(1)), cpc: null, keywordDifficulty: null, relativeUrl: "/balkonkraftwerk" });
    expect(rows[2]!.traffic).toBeNull();
  });
  it("respects subfolder / exact URL scopes", () => {
    expect(urlInTarget("https://solakon.de/shop/speicher", { scope: "subfolder", path: "/shop" })).toBe(true);
    expect(urlInTarget("https://solakon.de/shopping", { scope: "subfolder", path: "/shop" })).toBe(false);
    expect(aiProfileToKeywordRows(profile, { scope: "exact_url", path: "/balkonkraftwerk" }).map((r) => r.keyword)).toEqual(["balkonkraftwerk"]);
  });
  it("filters, sorts (nulls last) and paginates in memory", () => {
    const rows = aiProfileToKeywordRows(profile, { scope: "subdomains", path: "" });
    const page = queryKeywordRows(rows, { filters: { minVol: 1000, exclude: "kaufen" }, sortMode: "volume", sortOrder: "desc", page: 1, pageSize: 50 });
    expect(page.rows.map((r) => r.keyword)).toEqual(["balkonkraftwerk"]);
    const sorted = queryKeywordRows(rows, { filters: {}, sortMode: "traffic", sortOrder: "asc", page: 1, pageSize: 2 });
    expect(sorted.rows.map((r) => r.keyword)).toEqual(["speicher kaufen", "balkonkraftwerk"]);
    expect(sorted).toMatchObject({ totalCount: 3, hasMore: true });
  });
  it("maps pages with traffic = share × domain traffic", () => {
    const pages = queryPageRows(aiProfileToPageRows(profile, { scope: "domain", path: "" }), { filters: {}, sortMode: "traffic", sortOrder: "desc", page: 1, pageSize: 50 });
    expect(pages.rows.map((p) => [p.relativePath, p.organicTraffic])).toEqual([
      ["/balkonkraftwerk", 5000],
      ["/shop/speicher", 1000],
    ]);
  });
  it("aggregates observed SERPs into competitors", () => {
    const res = aggregateSerpCompetitors([
      { keyword: "a", items: [{ position: 1, domain: "www.x.com" }, { position: 3, domain: "y.com" }, { position: 5, domain: "x.com" }] },
      { keyword: "b", items: [{ position: 2, domain: "y.com" }] },
    ]);
    expect(res.map((r) => [r.domain, r.avgPosition, r.keywordsCount])).toEqual([
      ["x.com", 1, 1],
      ["y.com", 2.5, 2],
    ]);
  });
});

describe("AI backlink sample mapping", () => {
  const items = [
    { url: "https://blog.a.com/p", domain: "blog.a.com", title: "A", linksToDomain: true, links: [{ url: "https://www.acme.com/pricing", anchor: "pricing", nofollow: false }] },
    { url: "https://b.org/x", domain: "b.org", title: "B", linksToDomain: true, links: [{ url: "https://shop.acme.com/", anchor: null, nofollow: true }] },
    { url: "https://c.net/news", domain: "c.net", title: "C", linksToDomain: false, links: [] },
  ];
  const domain = { apiTarget: "acme.com", scope: "domain" as const, path: "" };
  const subdomains = { ...domain, scope: "subdomains" as const };
  it("scopes links: domain excludes subdomains, subdomains include them, URL scopes need a matching link", () => {
    expect(linksInTarget(items[1]!, domain)).toHaveLength(0);
    expect(linksInTarget(items[1]!, subdomains)).toHaveLength(1);
    expect(mentionsInScope(items, { apiTarget: "https://acme.com/pricing", scope: "exact_url", path: "" }).map((m) => m.url)).toEqual(["https://blog.a.com/p"]);
  });
  it("summarizes and maps rows without inventing totals, ranks or spam scores", () => {
    expect(summarizeSample(items, subdomains)).toEqual({ pages: 3, referringDomains: 3, linkingPages: 2, mentionOnlyPages: 1 });
    const rows = sampleToBacklinkRows(items, subdomains);
    expect(rows.map((r) => [r.domainFrom, r.itemType, r.isDofollow, r.rank, r.spamScore])).toEqual([
      ["blog.a.com", "anchor", true, null, null],
      ["b.org", "anchor", false, null, null],
      ["c.net", "mention", null, null, null],
    ]);
    expect(sampleToReferringDomains(items, subdomains).find((d) => d.domain === "c.net")).toMatchObject({ backlinks: 0, referringPages: 1 });
    expect(sampleToTopPages(items, subdomains).map((p) => [p.page, p.backlinks, p.referringDomains])).toEqual([
      ["https://www.acme.com/pricing", 1, 1],
      ["https://shop.acme.com/", 1, 1],
    ]);
  });
});

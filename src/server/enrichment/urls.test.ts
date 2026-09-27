import { describe, expect, it } from "vitest";
import { hostMatchesDomain, hostOf, linksFromText, matchCitations, normalizeUrl, statusProvesExistence, toAbsoluteUrl, trustedCitations } from "./urls";

describe("normalizeUrl / hostOf", () => {
  it("canonicalizes host, trailing slash, tracking params and hash", () => {
    expect(normalizeUrl("https://www.Example.com/Path/?utm_source=x&b=2&a=1#top")).toBe("example.com/Path?a=1&b=2");
    expect(normalizeUrl("http://example.com/")).toBe("example.com");
    expect(normalizeUrl("ftp://example.com/file")).toBeNull();
    expect(normalizeUrl("not a url")).toBeNull();
  });
  it("extracts hosts from URLs and bare domains", () => {
    expect(hostOf("https://www.solakon.de/shop")).toBe("solakon.de");
    expect(hostOf("blog.example.co.uk")).toBe("blog.example.co.uk");
    expect(hostOf("localhost")).toBeNull();
    expect(hostOf("")).toBeNull();
  });
  it("matches subdomains", () => {
    expect(hostMatchesDomain("shop.example.com", "example.com")).toBe(true);
    expect(hostMatchesDomain("www.example.com", "example.com")).toBe(true);
    expect(hostMatchesDomain("notexample.com", "example.com")).toBe(false);
  });
});

describe("toAbsoluteUrl", () => {
  it("accepts http(s) and bare hosts, rejects junk", () => {
    expect(toAbsoluteUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(toAbsoluteUrl("example.com/a")).toBe("https://example.com/a");
    expect(toAbsoluteUrl("javascript:alert(1)")).toBeNull();
    expect(toAbsoluteUrl("/relative/path")).toBeNull();
    expect(toAbsoluteUrl("two words.com")).toBeNull();
    expect(toAbsoluteUrl(null)).toBeNull();
  });
});

describe("matchCitations", () => {
  const citations = [{ url: "https://www.example.com/pricing/" }, { url: "https://news.site.org/article?id=4" }];
  it("classifies exact URL, same host and unverified URLs", () => {
    const m = matchCitations(["https://example.com/pricing", "https://example.com/other", "https://news.site.org/article?id=4", "https://made-up.io/page"], citations);
    expect(m.get("https://example.com/pricing")).toBe("cited");
    expect(m.get("https://example.com/other")).toBe("host");
    expect(m.get("https://news.site.org/article?id=4")).toBe("cited");
    expect(m.get("https://made-up.io/page")).toBeNull();
  });
});

describe("trustedCitations", () => {
  it("ignores agent citations that only echo the answer text", () => {
    const text = 'Here: {"url":"https://invented.example/page"} and [source](https://real.example/a)';
    const citations = [{ url: "https://invented.example/page" }, { url: "https://real.example/a" }, { url: "https://search-result.example/x" }];
    expect(trustedCitations("agent", citations, text).map((c) => c.url)).toEqual(["https://search-result.example/x"]);
    expect(trustedCitations("anthropic", citations, text)).toHaveLength(3);
  });
  it("extracts markdown and bare links", () => {
    expect(linksFromText("see [a](https://a.com/x) and https://b.com/y.")).toEqual(["https://a.com/x", "https://b.com/y"]);
  });
});

describe("statusProvesExistence", () => {
  it("accepts 2xx/3xx and bot walls, rejects 404/410/5xx", () => {
    for (const s of [200, 204, 301, 302, 401, 403, 429]) expect(statusProvesExistence(s)).toBe(true);
    for (const s of [404, 410, 500, 503]) expect(statusProvesExistence(s)).toBe(false);
  });
});

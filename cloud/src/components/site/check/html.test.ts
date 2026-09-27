import { describe, expect, it } from "vitest";
import { analyzeHtml } from "./html";

describe("analyzeHtml", () => {
  it("reads metadata, headings, JSON-LD and visible text", () => {
    const html = `<!doctype html><html lang="de"><head><title> Acme &amp; Co </title>
      <meta name="description" content="Tools for &quot;makers&quot;">
      <link rel="canonical" href="https://acme.example/">
      <link rel="alternate" hreflang="en" href="https://acme.example/en/">
      <meta name="robots" content="index, follow">
      <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Acme"},{"@type":["WebSite"]}]}</script>
      <script type="application/ld+json">{ broken</script>
      </head><body><h1>Hello <b>world</b></h1><h2>A</h2><p>One two three four.</p><script>var hidden = "not text";</script></body></html>`;
    const f = analyzeHtml(html);
    expect(f.title).toBe("Acme & Co");
    expect(f.description).toBe('Tools for "makers"');
    expect(f.canonical).toBe("https://acme.example/");
    expect(f.lang).toBe("de");
    expect(f.hreflang).toEqual(["en"]);
    expect(f.h1).toEqual(["Hello world"]);
    expect(f.h2Count).toBe(1);
    expect(f.jsonLd).toEqual({ blocks: 2, errors: 1, types: ["Organization", "WebSite"] });
    expect(f.wordCount).toBe(7); // "Hello world A One two three four", nothing from the script
    expect(f.spaSignals).toEqual([]);
  });

  it("detects client-side rendered shells", () => {
    const html = `<html><head><title>App</title></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div><script src="/a.js"></script><script src="/b.js"></script></body></html>`;
    const f = analyzeHtml(html);
    expect(f.spaSignals).toContain("empty #root");
    expect(f.spaSignals).toContain("noscript asks for JavaScript");
    expect(f.wordCount).toBe(0);
  });

  it("stays linear on hostile markup", () => {
    const html = "<meta".repeat(100_000) + "<script ".repeat(100_000) + "<h1 ".repeat(50_000) + "<p".repeat(100_000);
    const t = performance.now();
    analyzeHtml(html);
    expect(performance.now() - t).toBeLessThan(2000);
  });
});

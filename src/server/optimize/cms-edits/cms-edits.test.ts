import { describe, expect, it } from "vitest";
import { changeRatio, fieldWarnings, itemFieldValue, normalizeFieldValue, sameValue, validateFieldValue, wordDiff } from "./fields";
import { extractJsonLd, replaceJsonLd } from "./jsonld-block";
import { decodeEntities, detectWpSeoMeta, mapWebflowFields, stripTags, webflowImage, wpMetaString } from "./provider-maps";

describe("site edit fields", () => {
  it("normalizes single-line fields and pretty-prints JSON-LD", () => {
    expect(normalizeFieldValue("meta_title", "  Best   solar \n kits ")).toBe("Best solar kits");
    expect(normalizeFieldValue("meta_description", "  line one\nline two  ")).toBe("line one\nline two");
    expect(normalizeFieldValue("json_ld", '{"@type":"Product","name":"X"}')).toBe('{\n  "@type": "Product",\n  "name": "X"\n}');
    expect(normalizeFieldValue("json_ld", "not json")).toBe("not json");
    expect(normalizeFieldValue("title", null)).toBe("");
  });

  it("validates slugs, titles, JSON-LD and lengths", () => {
    expect(validateFieldValue("slug", "balkonkraftwerk-800w")).toBeNull();
    expect(validateFieldValue("slug", "Bad Slug")).toMatch(/lowercase/);
    expect(validateFieldValue("slug", "a--b")).toMatch(/single hyphens/);
    expect(validateFieldValue("title", "")).toMatch(/empty/);
    expect(validateFieldValue("meta_description", "")).toBeNull();
    expect(validateFieldValue("json_ld", "{oops")).toMatch(/not valid JSON/);
    expect(validateFieldValue("json_ld", "42")).toMatch(/object or array/);
    expect(validateFieldValue("json_ld", "")).toBeNull();
    expect(validateFieldValue("meta_title", "x".repeat(301))).toMatch(/too long/);
  });

  it("warns about long or empty SEO fields", () => {
    expect(fieldWarnings("meta_title", "x".repeat(61))[0]).toMatch(/recommended 60/);
    expect(fieldWarnings("meta_title", "Short")).toEqual([]);
    expect(fieldWarnings("meta_description", "")[0]).toMatch(/falls back/);
  });

  it("compares values in canonical form", () => {
    expect(sameValue("meta_title", "a  b", "a b")).toBe(true);
    expect(sameValue("json_ld", '{"a":1}', '{ "a": 1 }')).toBe(true);
    expect(sameValue("title", "A", "B")).toBe(false);
  });

  it("reads live values incl. image alt texts by image id", () => {
    const item = { fields: { title: "T", meta_title: null }, images: [{ id: "12", src: null, alt: null }] };
    expect(itemFieldValue(item, "title")).toBe("T");
    expect(itemFieldValue(item, "meta_title")).toBe("");
    expect(itemFieldValue(item, "excerpt")).toBeNull();
    expect(itemFieldValue(item, "image_alt", "12")).toBe("");
    expect(itemFieldValue(item, "image_alt", "99")).toBeNull();
  });

  it("builds a word-level diff", () => {
    const parts = wordDiff("Buy solar kits online", "Buy balcony solar kits today");
    expect(parts.filter((p) => p.kind === "del").map((p) => p.text.trim())).toEqual(["online"]);
    expect(parts.filter((p) => p.kind === "add").map((p) => p.text.trim()).join(" ")).toContain("balcony");
    expect(parts.filter((p) => p.kind === "add").map((p) => p.text.trim()).join(" ")).toContain("today");
    const rebuiltBefore = parts.filter((p) => p.kind !== "add").map((p) => p.text).join("");
    const rebuiltAfter = parts.filter((p) => p.kind !== "del").map((p) => p.text).join("");
    expect(rebuiltBefore).toBe("Buy solar kits online");
    expect(rebuiltAfter).toBe("Buy balcony solar kits today");
    expect(wordDiff("", "new")).toEqual([{ kind: "add", text: "new" }]);
    expect(wordDiff("same", "same")).toEqual([{ kind: "same", text: "same" }]);
    expect(changeRatio(wordDiff("abc", "abc"))).toBe(0);
    expect(changeRatio(wordDiff("abc", "xyz"))).toBe(1);
  });
});

describe("JSON-LD block in post HTML", () => {
  const html = '<p>Hello</p>\n<script type="application/ld+json">{"@type":"Article","headline":"A<\\/b"}</script>';
  it("extracts the first JSON-LD script", () => {
    expect(JSON.parse(extractJsonLd(html))).toEqual({ "@type": "Article", headline: "A</b" });
    expect(extractJsonLd("<p>none</p>")).toBe("");
  });
  it("replaces, appends and removes the block", () => {
    const replaced = replaceJsonLd(html, '{"@type":"FAQPage"}');
    expect(replaced).toBe('<p>Hello</p>\n<script type="application/ld+json">{"@type":"FAQPage"}</script>');
    expect(replaceJsonLd("<p>x</p>  ", '{"a":"</script>"}')).toBe('<p>x</p>\n<script type="application/ld+json">{"a":"\\u003c/script>"}</script>');
    expect(replaceJsonLd("<p>x</p>", '{"a":"<!--<script"}')).not.toMatch(/<!--|<script"/);
    expect(replaceJsonLd(html, "")).toBe("<p>Hello</p>");
    expect(replaceJsonLd("<p>x</p>", "")).toBe("<p>x</p>");
    // Round trip: what we write is what we read back.
    expect(extractJsonLd(replaceJsonLd("<p>x</p>", '{"a":"</b>"}'))).toBe('{\n  "a": "</b>"\n}');
  });
});

describe("provider field maps", () => {
  it("detects exposed SEO plugin meta keys", () => {
    expect(detectWpSeoMeta({ _yoast_wpseo_title: "", _yoast_wpseo_metadesc: "d" })).toEqual({
      plugin: "yoast",
      titleKey: "_yoast_wpseo_title",
      descriptionKey: "_yoast_wpseo_metadesc",
    });
    expect(detectWpSeoMeta({ rank_math_title: "t", rank_math_description: "" })?.plugin).toBe("rankmath");
    expect(detectWpSeoMeta({ footnotes: "" })).toBeNull();
    expect(detectWpSeoMeta(null)).toBeNull();
    const both = { _yoast_wpseo_title: "", _yoast_wpseo_metadesc: "", rank_math_title: "", rank_math_description: "" };
    expect(detectWpSeoMeta(both, ["wp/v2", "rankmath/v1"])?.plugin).toBe("rankmath");
    expect(wpMetaString(["x"])).toBe("x");
    expect(wpMetaString(5)).toBe("");
  });

  it("decodes WordPress rendered strings", () => {
    expect(decodeEntities("Tom &amp; Jerry &#8211; &#x2014; &hellip;")).toBe("Tom & Jerry – — …");
    expect(stripTags("<p>Hello&nbsp;<b>world</b></p>\n")).toBe("Hello world");
  });

  it("maps Webflow collection fields", () => {
    const map = mapWebflowFields([
      { slug: "name", displayName: "Name", type: "PlainText" },
      { slug: "slug", displayName: "Slug", type: "PlainText" },
      { slug: "seo-title", displayName: "SEO title", type: "PlainText" },
      { slug: "meta-description", displayName: "Meta description", type: "PlainText" },
      { slug: "post-summary", displayName: "Summary", type: "PlainText" },
      { slug: "main-image", displayName: "Main image", type: "Image" },
      { slug: "post-body", displayName: "Body", type: "RichText" },
    ]);
    expect(map.metaTitle?.slug).toBe("seo-title");
    expect(map.metaDescription?.slug).toBe("meta-description");
    expect(map.excerpt?.slug).toBe("post-summary");
    expect(map.images.map((f) => f.slug)).toEqual(["main-image"]);
    expect(mapWebflowFields([{ slug: "description", displayName: "Description", type: "PlainText" }]).metaDescription?.slug).toBe("description");
    expect(webflowImage({ fileId: "f1", url: "https://x/y.png", alt: "A" })).toEqual({ fileId: "f1", url: "https://x/y.png", alt: "A", hasAlt: true });
    expect(webflowImage("nope")).toBeNull();
  });
});

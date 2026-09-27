import { describe, expect, it } from "vitest";
import { framerItemUrl, mapFramerFields, normalizeFramerProjectUrl, type FramerFieldLike } from "./framer-map";

const doc = { title: "Best balcony power plants", html: "<p>Body</p>", excerpt: "Short intro", metaTitle: "SEO title", metaDescription: "SEO description" };

describe("normalizeFramerProjectUrl", () => {
  it("accepts editor URLs and bare project ids", () => {
    expect(normalizeFramerProjectUrl("https://framer.com/projects/Website--aabbccddee1122334455?node=abc")).toBe("https://framer.com/projects/Website--aabbccddee1122334455");
    expect(normalizeFramerProjectUrl("framer.com/projects/Website--aabbccddee1122334455/")).toBe("https://framer.com/projects/Website--aabbccddee1122334455");
    expect(normalizeFramerProjectUrl("Website--aabbccddee1122334455")).toBe("https://framer.com/projects/Website--aabbccddee1122334455");
  });
  it("rejects published site URLs and other hosts", () => {
    expect(() => normalizeFramerProjectUrl("https://mysite.framer.website")).toThrow(/project URL/);
    expect(() => normalizeFramerProjectUrl("https://evil.example/projects/x")).toThrow(/project URL/);
    expect(() => normalizeFramerProjectUrl("https://framer.com/projects/Website--short")).toThrow(/project URL/);
  });
});

describe("mapFramerFields", () => {
  const fields: FramerFieldLike[] = [
    { id: "f1", name: "Title", type: "string", required: true },
    { id: "f2", name: "Content", type: "formattedText" },
    { id: "f3", name: "Meta Title", type: "string" },
    { id: "f4", name: "Meta Description", type: "string" },
    { id: "f5", name: "Summary", type: "string" },
    { id: "f6", name: "Date", type: "date" },
    { id: "f7", name: "Cover", type: "image", required: true },
  ];
  it("maps by field name and type", () => {
    const r = mapFramerFields(fields, doc, { isNew: false });
    expect(r.fieldData.f1).toEqual({ type: "string", value: doc.title });
    expect(r.fieldData.f2).toEqual({ type: "formattedText", value: doc.html, contentType: "html" });
    expect(r.fieldData.f3?.value).toBe("SEO title");
    expect(r.fieldData.f4?.value).toBe("SEO description");
    expect(r.fieldData.f5?.value).toBe("Short intro");
    expect(r.fieldData.f6).toBeUndefined(); // date only set on create
    expect(r.missing).toEqual([]);
  });
  it("reports required fields it cannot fill on create and sets the date", () => {
    const r = mapFramerFields(fields, doc, { isNew: true, now: new Date("2026-09-26T10:00:00Z") });
    expect(r.missing).toEqual(["Cover"]);
    expect(r.fieldData.f6).toEqual({ type: "date", value: "2026-09-26T10:00:00.000Z" });
  });
  it("prefers the field the slug is based on as title and falls back to any formatted text body", () => {
    const r = mapFramerFields(
      [
        { id: "a", name: "Headline", type: "string" },
        { id: "b", name: "Post name", type: "string" },
        { id: "c", name: "Rich", type: "formattedText" },
      ],
      doc,
      { titleFieldId: "b", isNew: true },
    );
    expect(r.fieldData.b?.value).toBe(doc.title);
    expect(r.fieldData.a).toBeUndefined();
    expect(r.bodyFieldName).toBe("Rich");
    expect(mapFramerFields([{ id: "x", name: "Title", type: "string" }], doc, { isNew: true }).bodyFieldName).toBeNull();
  });
});

describe("framerItemUrl", () => {
  it("fills the detail page path", () => {
    expect(framerItemUrl("www.example.com", "/blog/:slug", "my post")).toBe("https://www.example.com/blog/my%20post");
    expect(framerItemUrl("https://example.framer.website/", "/news", "a")).toBe("https://example.framer.website/news/a");
    expect(framerItemUrl(null, "/blog/:slug", "a")).toBeNull();
    expect(framerItemUrl("example.com", null, "a")).toBeNull();
  });
});

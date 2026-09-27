import zlib from "node:zlib";
import { describe, expect, it } from "vitest";
import { chunkText, estimateTokens, normalizeText } from "./chunking";
import { buildOrTsQuery, excerpt, formatKnowledgeContext, queryTerms, rerankChunks, stripKnowledgeMarkers, tsConfigForLanguage, type RetrievalCandidate } from "./retrieval";
import { docxXmlToText, notionBlockText, notionPageTitle, notionPropertiesText, slackMessagesToDocs, slackToText, unzipEntry } from "./convert";

const para = (n: number, word = "solar") => Array.from({ length: n }, (_, i) => `${word}${i % 7} panel output`).join(" ") + ".";

describe("chunkText", () => {
  it("returns nothing for empty text and one chunk for short text", () => {
    expect(chunkText("   \n\n ")).toEqual([]);
    const c = chunkText("# Intro\n\nA short paragraph about balcony power plants.");
    expect(c).toHaveLength(1);
    expect(c[0]!.text).toContain("# Intro");
    expect(c[0]!.position).toBe(0);
  });

  it("keeps chunks under the token budget and numbers them", () => {
    const text = Array.from({ length: 12 }, (_, i) => `## Section ${i}\n\n${para(60)}\n\n${para(60, "battery")}`).join("\n\n");
    const chunks = chunkText(text, { maxTokens: 300, overlapTokens: 60 });
    expect(chunks.length).toBeGreaterThan(5);
    for (const c of chunks) expect(c.tokens).toBeLessThanOrEqual(300 + 20);
    expect(chunks.map((c) => c.position)).toEqual(chunks.map((_, i) => i));
  });

  it("repeats the tail of the previous chunk (overlap) within a section", () => {
    const blocks = Array.from({ length: 8 }, (_, i) => `Paragraph ${i}: ${para(8, `w${i}x`)}`);
    const chunks = chunkText(blocks.join("\n\n"), { maxTokens: 200, overlapTokens: 80 });
    expect(chunks.length).toBeGreaterThan(1);
    const lastOfFirst = chunks[0]!.text.split("\n\n").pop()!;
    expect(chunks[1]!.text).toContain(lastOfFirst);
  });

  it("repeats the section heading when a chunk starts mid-section", () => {
    const text = `## Pricing\n\n${Array.from({ length: 6 }, () => para(40)).join("\n\n")}`;
    const chunks = chunkText(text, { maxTokens: 200, overlapTokens: 0 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[1]!.text.startsWith("## Pricing")).toBe(true);
  });

  it("overlaps with trailing sentences when paragraphs are larger than the overlap", () => {
    const big = (i: number) => Array.from({ length: 12 }, (_, j) => `Fact ${i}-${j} is about solar yields.`).join(" ");
    const chunks = chunkText([big(1), big(2), big(3)].join("\n\n"), { maxTokens: 150, overlapTokens: 40 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[1]!.text).toContain("Fact 1-11 is about solar yields.");
    expect(chunks[1]!.text).not.toContain("Fact 1-0 is");
  });

  it("splits a single oversized paragraph by sentences", () => {
    const long = Array.from({ length: 80 }, (_, i) => `Sentence number ${i} explains a fact about inverters.`).join(" ");
    const chunks = chunkText(long, { maxTokens: 120, overlapTokens: 20 });
    expect(chunks.length).toBeGreaterThan(3);
    for (const c of chunks) expect(c.tokens).toBeLessThanOrEqual(140);
  });

  it("estimates tokens and normalizes whitespace", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("one two three")).toBeGreaterThanOrEqual(3);
    expect(normalizeText("a\r\n\r\n\r\n\r\nb  \t c\u0000")).toBe("a\n\nb c");
  });
});

describe("retrieval helpers", () => {
  it("maps languages to Postgres text-search configs", () => {
    expect(tsConfigForLanguage("de")).toBe("german");
    expect(tsConfigForLanguage("de-AT")).toBe("german");
    expect(tsConfigForLanguage("EN")).toBe("english");
    expect(tsConfigForLanguage("ja")).toBe("simple");
    expect(tsConfigForLanguage(null)).toBe("simple");
    expect(tsConfigForLanguage("french")).toBe("french");
  });

  it("extracts content terms and builds an injection-safe OR tsquery", () => {
    expect(queryTerms("How much does a Balkonkraftwerk cost in 2026?")).toEqual(["much", "balkonkraftwerk", "cost", "2026"]);
    expect(buildOrTsQuery("What is the price of 800 W kits?")).toBe("price:* | 800 | kits");
    expect(buildOrTsQuery("inverter warranty")).toBe("inverter:* | warranty:*");
    expect(buildOrTsQuery("a & b | !c <-> 'd':*")).toBeNull();
    const evil = buildOrTsQuery("solar') | (x:* & !y");
    expect(evil).toBe("solar:*");
    expect(buildOrTsQuery("the and of")).toBeNull();
  });

  it("re-ranks by term coverage and keeps at most two chunks per document", () => {
    const c = (id: string, docId: string, text: string, rank: number, title = "Doc"): RetrievalCandidate => ({ id, sourceId: "s1", docId, title, text, rank });
    const ranked = rerankChunks(
      "battery warranty years",
      [
        c("a", "d1", "Our battery comes with a 10 year warranty.", 0.2),
        c("b", "d1", "The battery warranty covers 10 years of use.", 0.25),
        c("c", "d1", "Battery warranty terms: years, cycles, capacity.", 0.3),
        c("d", "d2", "Shipping takes three days.", 0.9),
        c("e", "d3", "Warranty years are listed on the invoice.", 0.1, "Warranty FAQ"),
      ],
      5,
    );
    const ids = ranked.map((r) => r.id);
    expect(ids).not.toContain("d"); // no query term at all
    expect(ranked.filter((r) => r.docId === "d1")).toHaveLength(2);
    expect(ids[0]).toBe("c");
    expect(ranked.find((r) => r.id === "e")!.matched).toEqual(["warranty", "years"]);
  });

  it("prefix-matches long words (stemming-insensitive)", () => {
    const ranked = rerankChunks("inverters installation", [{ id: "x", sourceId: "s", docId: "d", title: "", text: "Installing an inverter takes an hour.", rank: 1 }], 3);
    expect(ranked[0]!.matched).toEqual(["inverters", "installation"]);
  });

  it("builds excerpts around the first match and a bounded prompt block", () => {
    const text = `${"Lorem ipsum dolor sit amet. ".repeat(30)}The feed-in limit is 800 VA per household. ${"More filler text here. ".repeat(30)}`;
    const ex = excerpt(text, "feed-in limit", 160);
    expect(ex).toContain("feed-in limit");
    expect(ex.startsWith("…")).toBe(true);
    expect(ex.length).toBeLessThanOrEqual(170);
    const block = formatKnowledgeContext(
      [
        { title: "Guide", url: "https://x.test/g", sourceName: "Site", sourceKind: "Website", text: "a ".repeat(3000) },
        { title: "", url: null, sourceName: "Docs", sourceKind: "Upload", text: "short fact" },
      ],
      1000,
    );
    expect(block).toContain("[K1] Guide (Website: Site, https://x.test/g)");
    expect(block).toContain("[K2] Untitled (Upload: Docs)\nshort fact");
    expect(block.length).toBeLessThan(1200);
  });
});

describe("knowledge markers", () => {
  it("strips [Kn] markers and reports which snippets were used", () => {
    const r = stripKnowledgeMarkers("The warranty is 10 years [K2]. Batteries hold 2 kWh [K1, K3]. Out of range [K9]. Plain sentence.", 3);
    expect(r.text).toBe("The warranty is 10 years. Batteries hold 2 kWh. Out of range. Plain sentence.");
    expect(r.used).toEqual([0, 1, 2]);
    expect(stripKnowledgeMarkers("No markers here.", 2)).toEqual({ text: "No markers here.", used: [] });
  });
});

describe("connector converters", () => {
  it("converts Notion blocks, titles and properties", () => {
    const rt = (t: string) => [{ plain_text: t }];
    expect(notionBlockText({ id: "1", type: "heading_2", heading_2: { rich_text: rt("Pricing") } })).toBe("## Pricing");
    expect(notionBlockText({ id: "2", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt("800 W") } }, 1)).toBe("  - 800 W");
    expect(notionBlockText({ id: "3", type: "to_do", to_do: { rich_text: rt("Register"), checked: true } })).toBe("- [x] Register");
    expect(notionBlockText({ id: "4", type: "table_row", table_row: { cells: [rt("A"), rt("B|C")] } })).toBe("| A | B/C |");
    expect(notionBlockText({ id: "5", type: "divider", divider: {} })).toBeNull();
    expect(notionPageTitle({ properties: { Name: { type: "title", title: rt("Brand guide") } } })).toBe("Brand guide");
    expect(
      notionPropertiesText({
        properties: {
          Name: { type: "title", title: rt("x") },
          Status: { type: "status", status: { name: "Live" } },
          Tags: { type: "multi_select", multi_select: [{ name: "Solar" }, { name: "B2C" }] },
          Price: { type: "number", number: 399 },
        },
      }),
    ).toBe("Status: Live · Tags: Solar, B2C · Price: 399");
  });

  it("converts Slack mrkdwn and groups messages per channel-day with threads", () => {
    const users = new Map([["U1", "Anna"], ["U2", "Ben"]]);
    expect(slackToText("<@U1> see <https://x.test|the spec> in <#C9|launch> &amp; <!here>", users)).toBe("@Anna see the spec (https://x.test) in #launch & @here");
    const ts = (iso: string) => String(Date.parse(iso) / 1000) + ".000100";
    const docs = slackMessagesToDocs(
      { id: "C1", name: "product" },
      [
        { ts: ts("2026-09-20T09:00:00Z"), user: "U1", text: "Warranty is 10 years", thread_ts: ts("2026-09-20T09:00:00Z"), replies: [{ ts: ts("2026-09-20T09:00:00Z"), user: "U1", text: "Warranty is 10 years" }, { ts: ts("2026-09-20T09:05:00Z"), user: "U2", text: "Confirmed" }] },
        { ts: ts("2026-09-20T08:00:00Z"), user: "U2", text: "Morning" },
        { ts: ts("2026-09-21T10:00:00Z"), subtype: "channel_join", user: "U2", text: "joined" },
        { ts: ts("2026-09-21T11:00:00Z"), user: "U1", text: "New price list" },
      ],
      users,
      "https://acme.slack.com/",
    );
    expect(docs.map((d) => d.title)).toEqual(["#product — 2026-09-20", "#product — 2026-09-21"]);
    expect(docs[0]!.text).toBe("08:00 Ben: Morning\n09:00 Anna: Warranty is 10 years\n    ↳ 09:05 Ben: Confirmed");
    expect(docs[0]!.url).toMatch(/^https:\/\/acme\.slack\.com\/archives\/C1\/p\d+$/);
    expect(docs[1]!.text).toBe("11:00 Anna: New price list");
  });

  it("extracts DOCX text from a zip archive", () => {
    const xml =
      '<w:document><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Brand &amp; Tone</w:t></w:r></w:p>' +
      '<w:p><w:r><w:t xml:space="preserve">We speak </w:t></w:r><w:r><w:t>plainly.</w:t></w:r></w:p>' +
      '<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/></w:numPr></w:pPr><w:r><w:t>No jargon</w:t></w:r></w:p></w:body></w:document>';
    expect(docxXmlToText(xml)).toBe("# Brand & Tone\n\nWe speak plainly.\n\n- No jargon");
    const zip = makeZip("word/document.xml", Buffer.from(xml));
    expect(unzipEntry(zip, "word/document.xml")!.toString("utf8")).toBe(xml);
    expect(unzipEntry(zip, "missing.xml")).toBeNull();
    expect(() => unzipEntry(Buffer.from("not a zip at all, definitely not"), "x")).toThrow();
  });
});

/** Minimal single-entry deflate ZIP writer for the DOCX test. */
function makeZip(name: string, data: Buffer): Buffer {
  const nameBuf = Buffer.from(name);
  const deflated = zlib.deflateRawSync(data);
  const crc = zlib.crc32(data) >>> 0;
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(deflated.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(deflated.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt32LE(0, 42);
  const localPart = Buffer.concat([local, nameBuf, deflated]);
  const centralPart = Buffer.concat([central, nameBuf]);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(centralPart.length, 12);
  eocd.writeUInt32LE(localPart.length, 16);
  return Buffer.concat([localPart, centralPart, eocd]);
}

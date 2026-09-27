import { describe, expect, it } from "vitest";
import {
  CITATION_CSV_COLUMNS,
  MENTION_CSV_COLUMNS,
  PROMPT_CSV_COLUMNS,
  exportFilename,
  parseSince,
  promptChangedSince,
  rowsToCsv,
  toExportCitation,
  toExportFanout,
  toExportMention,
  toNdjson,
  type ExportPrompt,
} from "./export-format";

describe("parseSince", () => {
  it("accepts days and ISO timestamps (offset optional → UTC)", () => {
    expect(parseSince("2026-09-24")?.toISOString()).toBe("2026-09-24T00:00:00.000Z");
    expect(parseSince("2026-09-24T10:15")?.toISOString()).toBe("2026-09-24T10:15:00.000Z");
    expect(parseSince("2026-09-24T10:15:30.5Z")?.toISOString()).toBe("2026-09-24T10:15:30.500Z");
    expect(parseSince("2026-09-24T10:15:30+02:00")?.toISOString()).toBe("2026-09-24T08:15:30.000Z");
    expect(parseSince("2026-09-24 10:15:30+0200")?.toISOString()).toBe("2026-09-24T08:15:30.000Z");
    expect(parseSince("2026-09-24T10:15:30-05")?.toISOString()).toBe("2026-09-24T15:15:30.000Z");
  });
  it("rejects garbage and impossible dates", () => {
    expect(parseSince("yesterday")).toBeNull();
    expect(parseSince("2026-13-45")).toBeNull();
    expect(parseSince("")).toBeNull();
  });
});

describe("row mappers", () => {
  const base = { answer_id: "ans_1", d: "2026-09-25", created_at: "2026-09-25T04:09:08.000Z", prompt_id: "prm_1", prompt: "Best shoes", country: "US", language: "en", engine: "gemini" };
  it("maps mentions with rounding and nulls", () => {
    const m = toExportMention({ ...base, id: "men_1", model: "gemini-2.5-pro", brand_name: "Acme", is_own: true, competitor_id: null, position: 2, tracked_position: null, depth_pct: 12.345, occurrences: "3", cited: false, recommended: true, sentiment: "71.26", snippet: "" });
    expect(m).toMatchObject({ mentionId: "men_1", brand: "Acme", isOwnBrand: true, competitorId: null, position: 2, trackedPosition: null, mentionDepth: 12.3, occurrences: 3, sentiment: 71.3, snippet: null, model: "gemini", modelVersion: "gemini-2.5-pro", createdAt: "2026-09-25T04:09:08.000Z" });
  });
  it("maps citations (ownership defaults to third_party)", () => {
    const c = toExportCitation({ ...base, id: "cit_1", position: 1, source_id: "src_1", url: "https://a.com/x", domain: "a.com", title: null, content_type: "article", ownership: null, competitor_id: null, competitor_name: null });
    expect(c).toMatchObject({ citationId: "cit_1", url: "https://a.com/x", ownership: "third_party", title: null, contentType: "article" });
  });
  it("maps fan-outs", () => {
    const f = toExportFanout({ ...base, id: "fan_1", query: "shoes for flat feet", intent: null, word_count: 4, coverage: "gap", coverage_url: null });
    expect(f).toMatchObject({ fanoutId: "fan_1", query: "shoes for flat feet", intent: null, wordCount: 4, coverage: "gap", coverageUrl: null });
  });
});

describe("CSV + NDJSON", () => {
  const prompt: ExportPrompt = {
    id: "prm_1",
    text: '=HYPERLINK("x") "quoted", text',
    country: "US",
    language: "en",
    status: "active",
    markets: ["US", "CA"],
    tags: [{ id: "tag_1", name: "Gear" }, { id: "tag_2", name: "Brand" }],
    models: ["chatgpt", "gemini"],
    createdAt: "2026-09-12T02:39:00.000Z",
    lastRunAt: null,
    metrics: { isVisible: true, answers: 30, visibility: 30, visibilityChange: -4.3, totalMentions: 11, mentionRate: 26.7, ownDomainCitations: 6, citationRate: 20, sentiment: 73.4, avgPosition: 1.3 },
    competitorsMentioned: [{ id: "cmp_1", name: "Rival", mentions: 3 }],
  };
  it("flattens prompts, keeps negative numbers numeric and guards formulas", () => {
    const csv = rowsToCsv([prompt], PROMPT_CSV_COLUMNS);
    const [head, line] = csv.trimEnd().split("\n");
    expect(head!.split(",")[0]).toBe("promptId");
    expect(line).toContain(`"'=HYPERLINK(""x"") ""quoted"", text"`);
    expect(line).toContain(",US; CA,");
    expect(line).toContain(",Gear; Brand,");
    expect(line).toContain(",-4.3,");
    expect(csv.endsWith("\n")).toBe(true);
  });
  it("uses the DTO keys as headers for flat datasets", () => {
    expect(MENTION_CSV_COLUMNS.map((c) => c[0])).toContain("brand");
    expect(CITATION_CSV_COLUMNS.map((c) => c[0])).toContain("ownership");
    expect(rowsToCsv([], MENTION_CSV_COLUMNS).split("\n").filter(Boolean)).toHaveLength(1);
  });
  it("writes one parseable object per line", () => {
    const rows = [{ a: 1, text: "line1\nline2" }, { a: 2, text: "x y" }];
    const out = toNdjson(rows);
    const lines = out.split("\n").filter(Boolean);
    expect(lines).toHaveLength(2);
    expect(lines.map((l) => JSON.parse(l))).toEqual(rows);
    expect(toNdjson([])).toBe("");
  });
  it("filters prompts by created / last run", () => {
    const since = new Date("2026-09-20T00:00:00Z");
    expect(promptChangedSince(prompt, since)).toBe(false);
    expect(promptChangedSince({ ...prompt, lastRunAt: "2026-09-25T04:03:00.000Z" }, since)).toBe(true);
    expect(promptChangedSince({ ...prompt, createdAt: "2026-09-21T00:00:00.000Z" }, since)).toBe(true);
  });
  it("builds safe file names", () => {
    expect(exportFilename("shop.example/x y", "mentions", "2026-09-01", "2026-09-26", 2, "ndjson")).toBe("shop.example_x_y-mentions-2026-09-01-2026-09-26-p2.ndjson");
  });
});

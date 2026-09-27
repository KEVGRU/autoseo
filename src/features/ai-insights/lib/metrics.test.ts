import { describe, expect, it } from "vitest";
import {
  averagePosition,
  citationShareOf,
  firstShareOf,
  formatMetric,
  headToHeadRate,
  mentionDepthOf,
  parseBrandScope,
  sentimentLabel,
  shareOfVoice,
  top3ShareOf,
  visibilityRate,
} from "./metrics";
import { emptyAgg, sumsOf, toMetrics, type BrandAgg } from "@/server/ai/insights/brand-metrics";

/** Worked examples from finseo's KPI documentation (docs.finseo.ai/getting-started/kpis). */
describe("finseo KPI formulas", () => {
  it("visibility: 18 of 40 tracked answers → 45%", () => {
    expect(visibilityRate(18, 40)).toBe(45);
    expect(visibilityRate(0, 0)).toBeNull();
  });

  it("share of voice: 18 of 90 brand appearances → 20%", () => {
    expect(shareOfVoice(18, 90)).toBe(20);
  });

  it("average position: nine firsts, six seconds and three fourths → #1.8", () => {
    const positions = [...Array(9).fill(1), ...Array(6).fill(2), ...Array(3).fill(4)];
    // (9·1 + 6·2 + 3·4) ÷ 18 = 1.83…, shown with one decimal as #1.8.
    expect(averagePosition(positions)).toBeCloseTo(33 / 18, 10);
    expect(formatMetric("avgPosition", averagePosition(positions))).toBe("1.8");
    expect(averagePosition([])).toBeNull();
  });

  it("#1 share: 9 of 18 answers where the brand appears → 50% (not ÷ all answers)", () => {
    expect(firstShareOf(9, 18)).toBe(50);
  });

  it("top-3 share: 15 of 18 → 83%", () => {
    expect(Math.round(top3ShareOf(15, 18)!)).toBe(83);
    expect(formatMetric("top3Share", top3ShareOf(15, 18))).toBe("83.3%");
  });

  it("head-to-head: 7 wins of 10 decided answers → 70%, ties excluded", () => {
    expect(headToHeadRate(7, 3)).toBe(70);
    // 7 wins, 3 losses, 4 ties → still 70 %.
    const shared = 14;
    const ties = 4;
    expect(headToHeadRate(7, shared - 7 - ties)).toBe(70);
    expect(headToHeadRate(0, 0)).toBeNull();
  });

  it("mention depth: character 300 of a 1,200-character answer → 25%", () => {
    expect(mentionDepthOf(300, 1200)).toBe(25);
    expect(mentionDepthOf(0, 1200)).toBe(0);
    expect(mentionDepthOf(10, 0)).toBe(0);
  });

  it("citation share: 30 of 150 → 20%", () => {
    expect(citationShareOf(30, 150)).toBe(20);
  });

  it("sentiment bands: 80–100 / 60–79 / 40–59 / 0–39", () => {
    expect(sentimentLabel(100).tone).toBe("strong");
    expect(sentimentLabel(80).tone).toBe("strong");
    expect(sentimentLabel(79).tone).toBe("positive");
    expect(sentimentLabel(60).tone).toBe("positive");
    expect(sentimentLabel(59).tone).toBe("neutral");
    expect(sentimentLabel(40).tone).toBe("neutral");
    expect(sentimentLabel(39).tone).toBe("critical");
    expect(sentimentLabel(0).tone).toBe("critical");
    // Bands apply to the displayed (rounded) score.
    expect(sentimentLabel(79.6).tone).toBe("strong");
    expect(sentimentLabel(null).tone).toBe("none");
  });

  it("brand scope defaults to the tracked set", () => {
    expect(parseBrandScope(undefined)).toBe("tracked");
    expect(parseBrandScope("nonsense")).toBe("tracked");
    expect(parseBrandScope("all")).toBe("all");
  });
});

describe("brand metrics (toMetrics)", () => {
  const agg = (over: Partial<BrandAgg>): BrandAgg => ({ ...emptyAgg(), ...over });

  it("uses the finseo denominators for every share metric", () => {
    // 40 answers; the brand is named in 18 (24 occurrences) with positions 9×1, 6×2, 3×4.
    const own = agg({ visible: 18, mentioned: 18, occ: 24, cited: 30, cites: 41, posSum: 9 * 1 + 6 * 2 + 3 * 4, posN: 18, first: 9, top3: 15, depthSum: 450, depthN: 18, sentSum: 18 * 70, sentN: 18 });
    // Other brands: 72 more answer-appearances (→ 90 total) and 120 more cited answers (→ 150 total).
    const others = agg({ visible: 72, mentioned: 72, cited: 120 });
    const m = toMetrics(own, 40, sumsOf([own, others]));
    expect(m.visibility).toBe(45);
    expect(m.mentions).toBe(24);
    expect(m.mentionRate).toBe(45);
    expect(m.sov).toBe(20);
    expect(formatMetric("avgPosition", m.avgPosition)).toBe("1.8");
    expect(m.firstShare).toBe(50);
    expect(Math.round(m.top3Share!)).toBe(83);
    expect(m.citations).toBe(30);
    expect(m.citationShare).toBe(20);
    expect(m.citationRate).toBe(75);
    expect(m.mentionDepth).toBe(25);
    expect(m.sentiment).toBe(70);
  });

  it("returns empty metrics without answers and no #1 / top-3 share for brands never named", () => {
    expect(toMetrics(undefined, 0, { mentioned: 0, cited: 0 }).visibility).toBeNull();
    const m = toMetrics(agg({ visible: 2, cited: 2 }), 10, { mentioned: 5, cited: 4 });
    expect(m.firstShare).toBeNull();
    expect(m.top3Share).toBeNull();
    expect(m.visibility).toBe(20);
  });
});

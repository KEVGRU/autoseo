import { describe, expect, it } from "vitest";
import {
  delta,
  filterPortfolioRows,
  pct,
  portfolioCsvRows,
  portfolioStatus,
  portfolioTotals,
  sortPortfolioRows,
  toPortfolioCsv,
  type PortfolioRow,
} from "./lib";

function row(p: Partial<PortfolioRow> & { projectId: string; name: string }): PortfolioRow {
  return {
    domain: `${p.name.toLowerCase()}.com`,
    logoUrl: null,
    country: "DE",
    workspaceId: "wsp_1",
    isPitch: false,
    pitchExpiresAt: null,
    paused: false,
    trackingFrequency: "daily",
    answers: 0,
    prompts: 0,
    visibility: null,
    visibilityDelta: null,
    mentionRate: null,
    shareOfVoice: null,
    shareOfVoiceDelta: null,
    position: null,
    positionDelta: null,
    sentiment: null,
    sentimentDelta: null,
    citations: 0,
    citationsDelta: null,
    citationRate: null,
    openTasks: 0,
    openHighImpactTasks: 0,
    aiRevenue: 0,
    aiRevenuePrev: 0,
    aiRevenueDelta: null,
    aiResponses: 0,
    currency: "EUR",
    lastRunAt: null,
    lastRunStatus: null,
    series: [],
    ...p,
  };
}

const period = { from: "2026-09-01", to: "2026-09-30", days: 30, previous: { from: "2026-08-02", to: "2026-08-31" } };

describe("portfolio helpers", () => {
  it("computes rounded percentages and deltas", () => {
    expect(pct(1, 3)).toBe(33.3);
    expect(pct(5, 0)).toBeNull();
    expect(delta(66.1, 59.1)).toBe(7);
    expect(delta(1.7, 1.85)).toBe(-0.2);
    expect(delta(null, 3)).toBeNull();
    expect(delta(3, undefined)).toBeNull();
  });

  it("filters by search and status chip", () => {
    const rows = [
      row({ projectId: "a", name: "Acme", isPitch: true }),
      row({ projectId: "b", name: "Beta", paused: true, domain: "beta.io" }),
      row({ projectId: "c", name: "Gamma" }),
    ];
    expect(filterPortfolioRows(rows, { filter: "pitch" }).map((r) => r.projectId)).toEqual(["a"]);
    expect(filterPortfolioRows(rows, { filter: "paused" }).map((r) => r.projectId)).toEqual(["b"]);
    expect(filterPortfolioRows(rows, { filter: "active" }).map((r) => r.projectId)).toEqual(["c"]);
    expect(filterPortfolioRows(rows, { q: "BETA.IO" }).map((r) => r.projectId)).toEqual(["b"]);
    expect(filterPortfolioRows(rows, { q: "  gam " }).map((r) => r.projectId)).toEqual(["c"]);
    expect(filterPortfolioRows(rows, {})).toHaveLength(3);
  });

  it("aggregates totals without mixing currencies", () => {
    const rows = [
      row({ projectId: "a", name: "A", answers: 10, visibility: 40, visibilityDelta: 4, aiRevenue: 100, aiRevenuePrev: 50, openHighImpactTasks: 2 }),
      row({ projectId: "b", name: "B", answers: 5, visibility: 61, visibilityDelta: null, aiRevenue: 30.555, currency: "USD", openHighImpactTasks: 1 }),
      row({ projectId: "c", name: "C", aiRevenue: 20, aiRevenuePrev: 10 }),
    ];
    const t = portfolioTotals(rows);
    expect(t.projects).toBe(3);
    expect(t.tracked).toBe(2);
    expect(t.avgVisibility).toBe(50.5);
    expect(t.avgVisibilityDelta).toBe(4);
    expect(t.answers).toBe(15);
    expect(t.openHighImpactTasks).toBe(3);
    expect(t.revenue).toEqual([
      { currency: "EUR", value: 120, previous: 60 },
      { currency: "USD", value: 30.56, previous: 0 },
    ]);
    expect(portfolioTotals([])).toMatchObject({ projects: 0, tracked: 0, avgVisibility: null, revenue: [] });
  });

  it("sorts tracked projects by visibility, untracked last by name", () => {
    const rows = [
      row({ projectId: "z", name: "Zeta" }),
      row({ projectId: "a", name: "Alpha" }),
      row({ projectId: "l", name: "Low", visibility: 10 }),
      row({ projectId: "h", name: "High", visibility: 80 }),
    ];
    expect(sortPortfolioRows(rows).map((r) => r.projectId)).toEqual(["h", "l", "a", "z"]);
  });

  it("builds CSV rows with status labels and keeps negative numbers numeric", () => {
    const rows = [row({ projectId: "a", name: "=cmd|x", isPitch: true, paused: true, visibility: 12.5, visibilityDelta: -3.2, aiRevenue: 10.004 })];
    const csv = portfolioCsvRows(rows, period);
    expect(csv[0]![0]).toBe("Project");
    expect(csv[1]![3]).toBe("pitch · paused");
    expect(csv[1]![17]).toBe(10);
    expect(csv[1]!.at(-1)).toBe("2026-09-01..2026-09-30");
    const text = toPortfolioCsv(csv);
    expect(text.split("\r\n")).toHaveLength(2);
    expect(text).toContain("'=cmd|x");
    expect(text).toContain(",-3.2,");
    expect(toPortfolioCsv([["a,b", 'q"t', null, Number.NaN]])).toBe('"a,b","q""t",,');
    expect(portfolioStatus({ isPitch: false, paused: false })).toBe("active");
  });
});

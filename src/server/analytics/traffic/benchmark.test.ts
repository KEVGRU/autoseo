import { describe, expect, it } from "vitest";
import { benchmarkHeadline, compareEngagement, engagementStats } from "./benchmark";
import { ga4OrganicRow, matomoOrganicDays } from "./normalize";

describe("engagementStats", () => {
  it("computes rates per session", () => {
    expect(
      engagementStats({ sessions: 200, engagedSessions: 120, engagementSeconds: 18_000, pageviews: 500, convertedSessions: 8, conversions: 11, revenue: 1234.5 }),
    ).toEqual({ sessions: 200, engagementRate: 60, avgEngagementSeconds: 90, pagesPerSession: 2.5, conversionRate: 4, conversions: 11, revenue: 1234.5, revenuePerSession: 6.17 });
  });
  it("returns nulls without sessions and when page views are unknown", () => {
    expect(engagementStats({ sessions: 0, engagedSessions: 0, engagementSeconds: 0, pageviews: null, convertedSessions: 0, conversions: 0, revenue: 0 })).toMatchObject({
      engagementRate: null,
      avgEngagementSeconds: null,
      pagesPerSession: null,
      conversionRate: null,
      revenuePerSession: null,
    });
    expect(engagementStats({ sessions: 10, engagedSessions: 5, engagementSeconds: 100, pageviews: null, convertedSessions: 20, conversions: 0, revenue: 0 })).toMatchObject({
      pagesPerSession: null,
      conversionRate: 100, // converted sessions are capped at sessions
    });
  });
});

describe("compareEngagement", () => {
  const ai = engagementStats({ sessions: 100, engagedSessions: 70, engagementSeconds: 9_000, pageviews: 300, convertedSessions: 6, conversions: 6, revenue: 600 });
  const organic = engagementStats({ sessions: 1000, engagedSessions: 500, engagementSeconds: 60_000, pageviews: 2500, convertedSessions: 20, conversions: 20, revenue: 3000 });
  it("computes relative differences and the leader per metric", () => {
    const m = Object.fromEntries(compareEngagement(ai, organic).map((x) => [x.key, x]));
    expect(m.engagementRate).toMatchObject({ ai: 70, organic: 50, diffPct: 40, leader: "ai" });
    expect(m.avgEngagementSeconds).toMatchObject({ ai: 90, organic: 60, diffPct: 50, leader: "ai" });
    expect(m.pagesPerSession).toMatchObject({ ai: 3, organic: 2.5, diffPct: 20, leader: "ai" });
    expect(m.conversionRate).toMatchObject({ ai: 6, organic: 2, diffPct: 200, leader: "ai" });
    expect(m.revenuePerSession).toMatchObject({ ai: 6, organic: 3, diffPct: 100 });
  });
  it("keeps AI values when organic is not available", () => {
    const rows = compareEngagement(ai, null);
    expect(rows.every((r) => r.organic === null && r.diffPct === null && r.leader === null)).toBe(true);
    expect(rows[0]!.ai).toBe(70);
  });
  it("headline", () => {
    expect(benchmarkHeadline(compareEngagement(ai, organic))).toBe("AI visitors convert 3× as often as organic search visitors.");
    const worse = engagementStats({ sessions: 100, engagedSessions: 40, engagementSeconds: 1000, pageviews: null, convertedSessions: 1, conversions: 1, revenue: 0 });
    expect(benchmarkHeadline(compareEngagement(worse, organic))).toBe("AI visitors convert 50% less often than organic search visitors.");
    expect(benchmarkHeadline(compareEngagement(ai, null))).toBeNull();
  });
});

describe("organic channel normalization", () => {
  it("GA4 organic rows", () => {
    expect(
      ga4OrganicRow({
        date: "20260915",
        sessions: "200",
        engagedSessions: "120",
        userEngagementDuration: "9000",
        screenPageViews: "480",
        keyEvents: "9",
        sessionKeyEventRate: "0.04",
        totalRevenue: "321.5",
        totalUsers: "150",
      }),
    ).toEqual({ date: "2026-09-15", sessions: 200, engagedSessions: 120, engagementSeconds: 9000, pageviews: 480, convertedSessions: 8, conversions: 9, revenue: 321.5, users: 150 });
  });
  it("Matomo VisitsSummary + Goals per day", () => {
    const summary = {
      "2026-09-01": { nb_visits: 100, nb_actions: 250, sum_visit_length: 6000, bounce_count: 40, nb_uniq_visitors: 90, nb_users: 0 },
      "2026-09-02": [],
      junk: { nb_visits: 1 },
    };
    const goals = { "2026-09-01": { nb_conversions: 5, nb_visits_converted: 4, revenue: 80 }, "2026-09-02": [] };
    const days = matomoOrganicDays(summary, goals, { "2026-09-01": { nb_pageviews: 210 }, "2026-09-02": [] });
    expect(days).toEqual([
      { date: "2026-09-01", sessions: 100, engagedSessions: 60, engagementSeconds: 6000, pageviews: 210, convertedSessions: 4, conversions: 5, revenue: 80, users: 90 },
      { date: "2026-09-02", sessions: 0, engagedSessions: 0, engagementSeconds: 0, pageviews: 0, convertedSessions: 0, conversions: 0, revenue: 0, users: 0 },
    ]);
    // Actions.get failed → page views unknown (not nb_actions, which also counts downloads / outlinks)
    expect(matomoOrganicDays(summary, goals, null)[0]!.pageviews).toBeNull();
  });
});

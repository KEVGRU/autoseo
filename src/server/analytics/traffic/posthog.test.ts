import { describe, expect, it } from "vitest";
import { posthogConfig, posthogTrafficQuery, normalizePosthogRows, isOrganicSource, type PostHogTrafficRow } from "./posthog";

const config = () => posthogConfig({ projectId: "67920", host: "exports.example.com", database: "exports", user: "reader", hostname: "example.com", timeZone: "Europe/Vienna", conversionEvents: "purchase,signup,purchase", revenueEvent: "purchase", revenueProperty: "amount" });
const row = (overrides: Partial<PostHogTrafficRow> = {}): PostHogTrafficRow => ({ date: "2026-09-30", page: "/guide?campaign=x", country: "at", source: "chatgpt", referrer: "chatgpt.com", medium: "", sessions: "2", engagedSessions: "1", convertedSessions: "1", conversions: "3", revenue: "42", engagementSeconds: "30", users: "2", pageviews: "3", ...overrides });

describe("PostHog export query and normalization", () => {
  it("normalizes defaults and event mappings", () => {
    expect(config()).toMatchObject({ port: "5432", schema: "posthog_exports", table: "events", currency: "EUR", conversionEvents: "purchase,signup" });
  });
  it("rejects unsafe identifiers, malformed time zones and partial revenue mappings", () => {
    expect(() => posthogConfig({ ...config(), table: 'events";DROP TABLE users;--' })).toThrow();
    expect(() => posthogConfig({ ...config(), timeZone: "not-a-zone" })).toThrow();
    expect(() => posthogConfig({ ...config(), revenueProperty: "" })).toThrow();
  });
  it("binds event names and properties instead of interpolating SQL", () => {
    const c = { ...config(), conversionEvents: "buy');DELETE FROM users;--", revenueProperty: "x');DROP TABLE users;--" };
    const built = posthogTrafficQuery(c, "2026-09-30", "2026-10-01");
    expect(built.query).not.toContain("DELETE FROM");
    expect(built.query).not.toContain("DROP TABLE");
    expect(built.parameters[4]).toEqual([c.conversionEvents]);
    expect(built.parameters[6]).toBe(c.revenueProperty);
    expect(built.parameters[1]).toBe("2026-10-02");
  });
  it("classifies AI traffic, totals all sessions and keeps organic separate", () => {
    const result = normalizePosthogRows([row(), row({ source: "", referrer: "www.google.com", sessions: 5, medium: "organic" }), row({ source: "", referrer: "www.google.com", medium: "cpc", sessions: 7 })], "2026-09-30", "2026-09-30");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ platform: "chatgpt", page: "/guide", country: "AT", sessions: 2 });
    expect(result.totals[0]?.sessions).toBe(14);
    expect(result.organic[0]?.sessions).toBe(5);
  });
  it("rejects invalid metrics and out-of-range rows before replacing stored data", () => {
    expect(() => normalizePosthogRows([row({ sessions: "NaN" })], "2026-09-30", "2026-09-30")).toThrow();
    expect(() => normalizePosthogRows([row({ date: "2026-10-01" })], "2026-09-30", "2026-09-30")).toThrow();
  });
  it("keeps paid search outside the inferred organic benchmark", () => {
    expect(isOrganicSource("", "https://www.google.at/search?q=test")).toBe(true);
    expect(isOrganicSource("cpc", "https://www.google.at")).toBe(false);
    expect(isOrganicSource("", "google.com.evil.example")).toBe(false);
  });
});

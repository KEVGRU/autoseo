import { describe, expect, it } from "vitest";
import { posthogConfig, posthogTrafficQuery, normalizePosthogRows, type PostHogTrafficRow } from "./posthog";

const config = () => posthogConfig({ projectId: "67920", host: "https://eu.posthog.com/", hostname: "example.com", timeZone: "Europe/Vienna", conversionEvents: "purchase,signup,purchase", revenueEvent: "purchase", revenueProperty: "amount" });
const row = (overrides: Partial<PostHogTrafficRow> = {}): PostHogTrafficRow => ({ date: "2026-09-30", page: "/guide?campaign=x", country: "at", source: "chatgpt", referrer: "chatgpt.com", channel: "Referral", sessions: "2", engagedSessions: "1", convertedSessions: "1", conversions: "3", revenue: "42", engagementSeconds: "30", users: "2", pageviews: "3", ...overrides });

describe("PostHog direct reporting", () => {
  it("normalizes API host, defaults and event mappings", () => {
    expect(config()).toMatchObject({ host: "https://eu.posthog.com", currency: "EUR", conversionEvents: "purchase,signup" });
  });
  it("rejects non-HTTPS hosts, credentials, paths and invalid reporting settings", () => {
    for (const host of ["http://eu.posthog.com", "https://user:secret@eu.posthog.com", "https://eu.posthog.com/path", "https://eu.posthog.com?token=x"]) expect(() => posthogConfig({ ...config(), host })).toThrow();
    expect(() => posthogConfig({ ...config(), timeZone: "not-a-zone" })).toThrow();
    expect(() => posthogConfig({ ...config(), revenueProperty: "" })).toThrow();
  });
  it("uses typed date bounds and safely quotes event mapping values", () => {
    const query = posthogTrafficQuery({ ...config(), conversionEvents: "buy');DELETE FROM users;--", revenueProperty: "x\\');DROP TABLE users;--" });
    expect(query).toContain("{variables.autoseo_date_from}");
    expect(query).toContain("buy\\');DELETE FROM users;--");
    expect(query).not.toContain(" OFFSET ");
    expect(query).toContain("session.$channel_type");
    expect(query).toContain("session.$session_duration");
  });
  it("classifies AI, sums all traffic and uses the native organic channel", () => {
    const result = normalizePosthogRows([row(), row({ source: "", referrer: "www.google.com", sessions: 5, channel: "Organic Search" }), row({ source: "", referrer: "www.google.com", channel: "Paid Search", sessions: 7 })], "2026-09-30", "2026-09-30");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ platform: "chatgpt", page: "/guide", country: "AT", sessions: 2 });
    expect(result.totals[0]?.sessions).toBe(14);
    expect(result.organic[0]?.sessions).toBe(5);
  });
  it("rejects malformed metrics and out-of-range dates before replacement", () => {
    expect(() => normalizePosthogRows([row({ sessions: "NaN" })], "2026-09-30", "2026-09-30")).toThrow();
    expect(() => normalizePosthogRows([row({ date: "2026-10-01" })], "2026-09-30", "2026-09-30")).toThrow();
  });
});

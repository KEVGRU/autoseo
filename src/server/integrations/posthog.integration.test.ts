import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import postgres from "postgres";
import { posthogConfig, normalizePosthogRows } from "@/server/analytics/traffic/posthog";
vi.mock("./store", () => ({ getIntegration: vi.fn(), readSecret: vi.fn() }));
import { queryPostHogTraffic } from "./posthog";

const databaseUrl = process.env.DATABASE_URL;
describe.skipIf(!databaseUrl)("PostHog Events export (real Postgres)", () => {
  const sql = postgres(databaseUrl!, { max: 1 });
  const schema = `test_posthog_${Math.random().toString(36).slice(2, 10)}`;
  const c = posthogConfig({ projectId: "67920", host: "exports.example.com", database: "exports", user: "reader", schema, table: "events", timeZone: "Europe/Vienna", hostname: "example.com", conversionEvents: "purchase", revenueEvent: "purchase", revenueProperty: "amount" });
  beforeAll(async () => {
    await sql`CREATE SCHEMA ${sql(schema)}`;
    await sql`CREATE TABLE ${sql(schema)}.events (uuid text, event text, properties jsonb, distinct_id text, team_id integer, timestamp timestamptz)`;
    const event = (uuid: string, session: string, name: string, timestamp: string, properties: Record<string, unknown>) => ({ uuid, event: name, properties: { $session_id: session, ...properties }, distinct_id: session, team_id: 67920, timestamp });
    const events = [
      event("ai-page", "ai", "$pageview", "2026-09-30T21:58:00Z", { $current_url: "https://example.com/guide", $pathname: "/guide", $geoip_country_code: "at", $referring_domain: "chatgpt.com" }),
      // Export retries may repeat event UUIDs. Deduplication must prevent double-counting.
      event("ai-page", "ai", "$pageview", "2026-09-30T21:58:00Z", { $current_url: "https://example.com/guide", $pathname: "/guide", $geoip_country_code: "at", $referring_domain: "chatgpt.com" }),
      event("purchase", "ai", "purchase", "2026-09-30T22:03:00Z", { amount: "42.5" }),
      event("organic", "organic", "$pageview", "2026-09-30T10:00:00Z", { $current_url: "https://example.com/", $referring_domain: "www.google.at" }),
      event("paid", "paid", "$pageview", "2026-09-30T11:00:00Z", { $current_url: "https://example.com/", utm_medium: "cpc", $referring_domain: "google.com" }),
      event("different-site", "other", "$pageview", "2026-09-30T12:00:00Z", { $current_url: "https://other.example/", utm_source: "chatgpt" }),
      event("before", "previous", "$pageview", "2026-09-29T21:59:00Z", { $current_url: "https://example.com/", utm_source: "chatgpt" }),
      event("previous-tail", "previous", "purchase", "2026-09-29T22:01:00Z", { amount: "99" }),
      event("next-day", "next", "$pageview", "2026-09-30T22:01:00Z", { $current_url: "https://example.com/", utm_source: "chatgpt" }),
      { ...event("other-project", "unrelated", "$pageview", "2026-09-30T12:00:00Z", { $current_url: "https://example.com/", utm_source: "chatgpt" }), team_id: 123 },
    ];
    for (const e of events) await sql`INSERT INTO ${sql(schema)}.events ${sql(e, "uuid", "event", "properties", "distinct_id", "team_id", "timestamp")}`;
  });
  afterAll(async () => { await sql`DROP SCHEMA IF EXISTS ${sql(schema)} CASCADE`; await sql.end(); });
  it("deduplicates exports, includes cross-midnight conversion and attributes sessions to their start date", async () => {
    const rows = await queryPostHogTraffic(sql, c, "2026-09-30", "2026-09-30");
    const normalized = normalizePosthogRows(rows, "2026-09-30", "2026-09-30");
    expect(normalized.totals).toEqual([{ date: "2026-09-30", sessions: 3, conversions: 1, revenue: 42.5 }]);
    expect(normalized.rows).toHaveLength(1);
    expect(normalized.rows[0]).toMatchObject({ platform: "chatgpt", page: "/guide", country: "AT", sessions: 1, conversions: 1, revenue: 42.5, pageviews: 1, engagementSeconds: 300, engagedSessions: 1 });
    expect(normalized.organic[0]).toMatchObject({ sessions: 1, engagedSessions: 0 });
  });
  it("interprets timezone-naive export timestamps as UTC", async () => {
    await sql`CREATE TABLE ${sql(schema)}.events_naive AS SELECT uuid, event, properties, distinct_id, team_id, timestamp AT TIME ZONE 'UTC' AS timestamp FROM ${sql(schema)}.events`;
    const rows = await queryPostHogTraffic(sql, { ...c, table: "events_naive" }, "2026-09-30", "2026-09-30");
    expect(normalizePosthogRows(rows, "2026-09-30", "2026-09-30").totals).toEqual([{ date: "2026-09-30", sessions: 3, conversions: 1, revenue: 42.5 }]);
  });
  it("returns no rows for an empty period", async () => {
    expect(await queryPostHogTraffic(sql, c, "2026-10-10", "2026-10-10")).toEqual([]);
  });
  it("treats malicious event mapping strings as values", async () => {
    const mapped = { ...c, conversionEvents: "purchase');DROP SCHEMA public CASCADE;--", revenueProperty: "amount');SELECT pg_sleep(30);--" };
    const rows = await queryPostHogTraffic(sql, mapped, "2026-09-30", "2026-09-30");
    expect(normalizePosthogRows(rows, "2026-09-30", "2026-09-30").totals[0]).toMatchObject({ conversions: 0, revenue: 0 });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
const http = vi.hoisted(() => vi.fn());
vi.mock("./http", async (original) => ({ ...await original<typeof import("./http")>(), httpJson: http }));
vi.mock("./store", () => ({ getIntegration: vi.fn(), readSecret: vi.fn() }));
import { IntegrationHttpError } from "./http";
import { ensurePostHogEndpoint, fetchPostHogTraffic, posthogEndpointName, testPostHogConnection } from "./posthog";
import { posthogConfig, posthogTrafficQuery, POSTHOG_COLUMNS } from "@/server/analytics/traffic/posthog";

const creds = { ...posthogConfig({ host: "https://eu.posthog.com", projectId: "67920", hostname: "camion-data.com", timeZone: "Europe/Vienna" }), apiKey: "private-test-key" };
const name = posthogEndpointName(creds);
const report = (extra = {}) => ({ name, endpoint_version: 1, columns: [...POSTHOG_COLUMNS], hasMore: false, results: [], ...extra });
const endpoint = () => ({ name, is_active: true, current_version: 1, query: { kind: "HogQLQuery", query: posthogTrafficQuery(creds), variables: { a: { variableId: "a", code_name: "autoseo_date_from" }, b: { variableId: "b", code_name: "autoseo_date_to" } } } });
beforeEach(() => http.mockReset());

describe("PostHog reporting API", () => {
  it("uses server-side Bearer auth, the configured origin and a pinned endpoint version", async () => {
    http.mockResolvedValue(report());
    await fetchPostHogTraffic(creds, "2026-09-30", "2026-10-01");
    expect(http).toHaveBeenCalledWith(`https://eu.posthog.com/api/projects/67920/endpoints/${name}/run?version=1`, expect.objectContaining({ untrusted: true, headers: { Authorization: "Bearer private-test-key" }, body: { variables: { autoseo_date_from: "2026-09-30", autoseo_date_to: "2026-10-02" }, limit: 2001, refresh: "cache" } }));
    expect(http.mock.calls[0]![0]).not.toContain(creds.apiKey);
  });
  it("handles reordered columns without altering metrics", async () => {
    const columns = [...POSTHOG_COLUMNS].reverse();
    http.mockResolvedValue(report({ columns, results: [columns.map((c) => c === "date" ? "2026-09-30" : c === "page" ? "/" : 2)] }));
    expect((await fetchPostHogTraffic(creds, "2026-09-30", "2026-09-30"))[0]).toMatchObject({ date: "2026-09-30", page: "/", sessions: 2 });
  });
  it("refuses incomplete, changed-version or malformed reports", async () => {
    for (const change of [{ hasMore: undefined }, { endpoint_version: 2 }, { query_status: { complete: false } }, { results: [[1]] }, { columns: ["date"] }]) {
      http.mockResolvedValue(report(change));
      await expect(fetchPostHogTraffic(creds, "2026-09-30", "2026-09-30")).rejects.toThrow();
    }
  });
  it("splits busy reports by date without event pagination", async () => {
    http.mockResolvedValueOnce(report({ hasMore: true })).mockResolvedValueOnce(report()).mockResolvedValueOnce(report());
    expect(await fetchPostHogTraffic(creds, "2026-09-30", "2026-10-01")).toEqual([]);
    expect(http.mock.calls.slice(1).map((c) => c[1].body.variables)).toEqual([
      { autoseo_date_from: "2026-09-30", autoseo_date_to: "2026-10-01" }, { autoseo_date_from: "2026-10-01", autoseo_date_to: "2026-10-02" },
    ]);
    http.mockResolvedValue(report({ hasMore: true }));
    await expect(fetchPostHogTraffic(creds, "2026-09-30", "2026-09-30")).rejects.toThrow("2,000");
  });
  it("honors cancellation and rejects invalid or unbounded reporting windows", async () => {
    const cancel = vi.fn().mockRejectedValue(new Error("cancelled"));
    await expect(fetchPostHogTraffic(creds, "2026-09-30", "2026-09-30", cancel)).rejects.toThrow("cancelled");
    for (const [from, to] of [["2026-02-30", "2026-03-01"], ["2026-09-01", "2026-09-30"], ["2026-10-01", "2026-09-30"]])
      await expect(fetchPostHogTraffic(creds, from!, to!)).rejects.toThrow("one to seven");
    expect(http).not.toHaveBeenCalled();
  });
  it("reuses an existing report with read-only access and actually tests a report", async () => {
    http.mockResolvedValueOnce(endpoint()).mockResolvedValueOnce(report());
    await expect(testPostHogConnection(creds)).resolves.toContain("reporting is ready");
    expect(http).toHaveBeenCalledTimes(2);
    expect(http.mock.calls[0]![1]).not.toHaveProperty("body");
  });
  it("creates missing variables and reporting endpoint once", async () => {
    http.mockRejectedValueOnce(new IntegrationHttpError("not found", 404)).mockResolvedValueOnce({ results: [], next: null })
      .mockResolvedValueOnce({ id: "01a106ca-c575-0000-d2c6-1a28d9151817", code_name: "autoseo_date_from", type: "String" })
      .mockResolvedValueOnce({ id: "01a106ca-d3f1-0000-ea15-ac021974d4c1", code_name: "autoseo_date_to", type: "String" }).mockResolvedValueOnce(endpoint());
    await ensurePostHogEndpoint(creds);
    expect(http.mock.calls[4]![1].body).toMatchObject({ name, query: { kind: "HogQLQuery", query: posthogTrafficQuery(creds) }, is_materialized: false });
  });
  it("does not mutate a changed report or conceal permission errors", async () => {
    http.mockResolvedValueOnce({ ...endpoint(), is_active: false });
    await expect(ensurePostHogEndpoint(creds)).rejects.toThrow("changed or disabled");
    expect(http).toHaveBeenCalledTimes(1);
    http.mockRejectedValueOnce(new IntegrationHttpError("denied", 403));
    await expect(fetchPostHogTraffic(creds, "2026-09-30", "2026-09-30")).rejects.toThrow("permissions");
  });
});

import { describe, expect, it } from "vitest";
import { createTenantApi, TenantApiError } from "./tenant-api";

type Call = { url: string; method: string; headers: Record<string, string>; body: unknown };

/** Fake fetch answering from a queue of [status, body] (or thrown errors), recording every call. */
function fakeFetch(responses: Array<[number, unknown] | Error>) {
  const calls: Call[] = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      method: init?.method ?? "GET",
      headers: init?.headers as Record<string, string>,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    const next = responses.shift();
    if (!next) throw new Error("unexpected request");
    if (next instanceof Error) throw next;
    const [status, body] = next;
    return new Response(body === undefined ? null : JSON.stringify(body), { status });
  }) as typeof fetch;
  return { impl, calls };
}

const api = (f: typeof fetch) => createTenantApi({ baseUrl: "http://app:3000/", secret: "s3cret", fetch: f, retryDelayMs: 1 });

describe("tenant API client", () => {
  it("upserts a tenant with bearer auth and a JSON body", async () => {
    const { impl, calls } = fakeFetch([[200, { tenantId: "ins_abc", workspaceId: "wsp_1", ownerUserId: "usr_1", status: "active" }]]);
    const res = await api(impl).putTenant("ins_abc", {
      ownerEmail: "owner@acme.com",
      workspaceName: "Acme",
      status: "active",
      limits: { monthlyBudgetUsd: 10, maxProjects: 10 },
    });
    expect(res.workspaceId).toBe("wsp_1");
    expect(calls[0]).toMatchObject({
      url: "http://app:3000/api/cloud/tenants/ins_abc",
      method: "PUT",
      headers: { Authorization: "Bearer s3cret", "Content-Type": "application/json" },
      body: { ownerEmail: "owner@acme.com", workspaceName: "Acme", status: "active", limits: { monthlyBudgetUsd: 10, maxProjects: 10 } },
    });
  });

  it("returns null for a missing tenant and normalizes tenant info", async () => {
    const { impl } = fakeFetch([
      [404, { error: "not found" }],
      [200, { tenantId: "ins_abc", workspaceId: "wsp_1", status: "suspended", name: "Acme", members: [{}, {}], projects: 3, spendThisMonthUsd: "4.25", limits: { monthlyBudgetUsd: 10 } }],
    ]);
    const client = api(impl);
    expect(await client.getTenant("ins_abc")).toBeNull();
    expect(await client.getTenant("ins_abc")).toEqual({
      tenantId: "ins_abc",
      workspaceId: "wsp_1",
      status: "suspended",
      name: "Acme",
      members: 2,
      projects: 3,
      spendThisMonthUsd: 4.25,
      limits: { monthlyBudgetUsd: 10 },
    });
  });

  it("treats deleting a missing tenant as done", async () => {
    const { impl, calls } = fakeFetch([[404, null]]);
    await expect(api(impl).deleteTenant("ins_abc")).resolves.toBeUndefined();
    expect(calls[0]!.method).toBe("DELETE");
  });

  it("retries network errors, 429 and 5xx, then succeeds", async () => {
    const { impl, calls } = fakeFetch([new TypeError("fetch failed"), [503, { error: "starting" }], [200, { ok: true, commit: "abc" }]]);
    expect(await api(impl).health()).toEqual({ ok: true, commit: "abc" });
    expect(calls).toHaveLength(3);
  });

  it("gives up after the retries with the last error", async () => {
    const { impl, calls } = fakeFetch([[502, null], [502, null], [502, null]]);
    await expect(api(impl).putConfig({ mail: null })).rejects.toMatchObject({ status: 502 });
    expect(calls).toHaveLength(3);
  });

  it("does not retry client errors and explains auth failures", async () => {
    const { impl, calls } = fakeFetch([[401, { error: "unauthorized" }]]);
    const err = await api(impl).putTenant("ins_abc", { ownerEmail: "a@b.co", workspaceName: "A" }).catch((e) => e);
    expect(err).toBeInstanceOf(TenantApiError);
    expect(err.status).toBe(401);
    expect(err.message).toMatch(/API secret/);
    expect(calls).toHaveLength(1);
  });

  it("sends platform mail config", async () => {
    const { impl, calls } = fakeFetch([[200, { ok: true }]]);
    await api(impl).putConfig({ mail: { smtpUrl: "smtps://u:p@smtp.example.com:465", from: "AutoSEO <noreply@autoseo.codext.de>" } });
    expect(calls[0]).toMatchObject({
      url: "http://app:3000/api/cloud/config",
      method: "PUT",
      body: { mail: { smtpUrl: "smtps://u:p@smtp.example.com:465", from: "AutoSEO <noreply@autoseo.codext.de>" } },
    });
  });

  it("rejects tenant ids outside the contract", async () => {
    const { impl, calls } = fakeFetch([]);
    await expect(api(impl).getTenant("../admin")).rejects.toThrow(/Invalid tenant id/);
    await expect(api(impl).getTenant("x".repeat(65))).rejects.toThrow(/Invalid tenant id/);
    expect(calls).toHaveLength(0);
  });
});

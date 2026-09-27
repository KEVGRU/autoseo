import { describe, expect, it } from "vitest";
import {
  buildTenantPayload,
  chooseBackend,
  DEFAULT_PLAN,
  hostOfUrl,
  internalSlug,
  mailConfigPayload,
  normalizePlan,
  parsePlanInput,
  tenantStatusFor,
  usageSummary,
} from "./tenant-rules";

const plan = { monthlyBudgetUsd: 10, maxProjects: 10 };

describe("chooseBackend", () => {
  it("uses the shared app when it is configured, unless a dedicated instance is requested", () => {
    expect(chooseBackend({ sharedConfigured: true })).toBe("shared");
    expect(chooseBackend({ sharedConfigured: true, dedicated: true })).toBe("coolify");
    expect(chooseBackend({ sharedConfigured: false })).toBe("coolify");
  });
});

describe("tenantStatusFor (lifecycle, docs/CLOUD.md)", () => {
  it("suspends stopped instances and keeps everything else active", () => {
    expect(tenantStatusFor("stopped")).toBe("suspended");
    for (const s of ["pending_payment", "provisioning", "running", "failed"] as const) expect(tenantStatusFor(s)).toBe("active");
  });
});

describe("buildTenantPayload", () => {
  it("sends owner, workspace, status and plan limits", () => {
    expect(buildTenantPayload({ workspaceName: "Acme", owner: { email: "o@acme.com", name: "Olga" }, status: "active", limits: plan })).toEqual({
      ownerEmail: "o@acme.com",
      ownerName: "Olga",
      workspaceName: "Acme",
      status: "active",
      limits: { monthlyBudgetUsd: 10, maxProjects: 10 },
    });
  });
  it("only sends a reason for suspended tenants and omits empty names", () => {
    const suspended = buildTenantPayload({ workspaceName: "Acme", owner: { email: "o@acme.com", name: null }, status: "suspended", limits: plan, suspendedReason: "subscription canceled" });
    expect(suspended).toMatchObject({ status: "suspended", suspendedReason: "subscription canceled" });
    expect(suspended).not.toHaveProperty("ownerName");
    expect(buildTenantPayload({ workspaceName: "A", owner: { email: "o@a.co", name: null }, status: "active", limits: plan, suspendedReason: "x" })).not.toHaveProperty("suspendedReason");
  });
});

describe("usageSummary", () => {
  it("shows spend against the included budget", () => {
    expect(usageSummary({ spendThisMonthUsd: 2.5, projects: 3, limits: { monthlyBudgetUsd: 10, maxProjects: 10 } }, plan)).toEqual({ spendUsd: 2.5, budgetUsd: 10, percent: 25, projects: 3, maxProjects: 10 });
  });
  it("caps the bar at 100 % and falls back to the plan limits", () => {
    expect(usageSummary({ spendThisMonthUsd: 14.126, projects: 12, limits: {} }, plan)).toEqual({ spendUsd: 14.13, budgetUsd: 10, percent: 100, projects: 12, maxProjects: 10 });
  });
});

describe("mailConfigPayload", () => {
  it("sends the mail server or null", () => {
    expect(mailConfigPayload({ smtpUrl: "smtp://u:p@h:587", mailFrom: "AutoSEO <a@b.de>" })).toEqual({ mail: { smtpUrl: "smtp://u:p@h:587", from: "AutoSEO <a@b.de>" } });
    expect(mailConfigPayload({ smtpUrl: null, mailFrom: null })).toEqual({ mail: null });
    expect(mailConfigPayload({ smtpUrl: "smtp://h:25", mailFrom: null })).toEqual({ mail: null });
  });
});

describe("internalSlug / hostOfUrl", () => {
  it("generates unique internal slugs", () => {
    const a = internalSlug();
    expect(a).toMatch(/^ws-[a-z0-9]{12}$/);
    expect(internalSlug()).not.toBe(a);
  });
  it("extracts the host", () => {
    expect(hostOfUrl("https://app.autoseo.codext.de/")).toBe("app.autoseo.codext.de");
    expect(hostOfUrl("http://localhost:3300")).toBe("localhost:3300");
  });
});

describe("plan limits (0 budget = nothing included in the shared app)", () => {
  it("parses admin input and keeps an explicit 0", () => {
    expect(parsePlanInput({ monthlyBudgetUsd: " 12.345 ", maxProjects: "20" })).toEqual({ ok: true, plan: { monthlyBudgetUsd: 12.35, maxProjects: 20 } });
    expect(parsePlanInput({ monthlyBudgetUsd: "0", maxProjects: "1" })).toEqual({ ok: true, plan: { monthlyBudgetUsd: 0, maxProjects: 1 } });
  });

  it("never turns an empty or malformed field into 0", () => {
    expect(parsePlanInput({ monthlyBudgetUsd: "", maxProjects: "10" }).ok).toBe(false);
    expect(parsePlanInput({ monthlyBudgetUsd: "  ", maxProjects: "10" }).ok).toBe(false);
    expect(parsePlanInput({ monthlyBudgetUsd: "abc", maxProjects: "10" }).ok).toBe(false);
    expect(parsePlanInput({ monthlyBudgetUsd: "-1", maxProjects: "10" }).ok).toBe(false);
    expect(parsePlanInput({ monthlyBudgetUsd: "10", maxProjects: "" }).ok).toBe(false);
    expect(parsePlanInput({ monthlyBudgetUsd: "10", maxProjects: "2.5" }).ok).toBe(false);
    expect(parsePlanInput({ monthlyBudgetUsd: "10", maxProjects: "0" }).ok).toBe(false);
  });

  it("falls back to the defaults for invalid stored values", () => {
    expect(DEFAULT_PLAN).toEqual({ monthlyBudgetUsd: 10, maxProjects: 10 });
    expect(normalizePlan({})).toEqual(DEFAULT_PLAN);
    expect(normalizePlan({ monthlyBudgetUsd: null, maxProjects: "7" })).toEqual(DEFAULT_PLAN);
    expect(normalizePlan({ monthlyBudgetUsd: Number.NaN, maxProjects: 0 })).toEqual(DEFAULT_PLAN);
    expect(normalizePlan({ monthlyBudgetUsd: 0, maxProjects: 3 })).toEqual({ monthlyBudgetUsd: 0, maxProjects: 3 });
  });
});

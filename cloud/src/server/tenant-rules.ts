/**
 * Shared-backend rules (docs/CLOUD.md): which backend a new customer gets, how instance state maps to tenant state,
 * and what is sent to the tenant API. Pure so it can be unit tested.
 */
import crypto from "node:crypto";
import type { InstanceBackend, InstanceStatus } from "@/server/db/schema";
import type { MailConfig, TenantInfo, TenantPutBody, TenantStatus } from "@/server/tenant-api";

export type PlanLimits = { monthlyBudgetUsd: number; maxProjects: number };

/** Shared workspace unless the shared app isn't configured or an admin explicitly asked for a dedicated instance. */
export function chooseBackend(opts: { sharedConfigured: boolean; dedicated?: boolean }): InstanceBackend {
  return opts.sharedConfigured && !opts.dedicated ? "shared" : "coolify";
}

/** A stopped instance is a suspended tenant (data kept); everything else that exists is active. */
export function tenantStatusFor(status: InstanceStatus): TenantStatus {
  return status === "stopped" ? "suspended" : "active";
}

export function buildTenantPayload(opts: {
  workspaceName: string;
  owner: { email: string; name: string | null };
  status: TenantStatus;
  limits: PlanLimits;
  suspendedReason?: string;
}): TenantPutBody {
  return {
    ownerEmail: opts.owner.email,
    ...(opts.owner.name ? { ownerName: opts.owner.name } : {}),
    workspaceName: opts.workspaceName,
    status: opts.status,
    ...(opts.status === "suspended" && opts.suspendedReason ? { suspendedReason: opts.suspendedReason } : {}),
    limits: { monthlyBudgetUsd: opts.limits.monthlyBudgetUsd, maxProjects: opts.limits.maxProjects },
  };
}

export type UsageSummary = { spendUsd: number; budgetUsd: number; percent: number; projects: number; maxProjects: number };

/** Usage against the included budget as the customer sees it (the tenant's limits win over the plan defaults). */
export function usageSummary(info: Pick<TenantInfo, "spendThisMonthUsd" | "projects" | "limits">, plan: PlanLimits): UsageSummary {
  const budgetUsd = info.limits.monthlyBudgetUsd ?? plan.monthlyBudgetUsd;
  const spendUsd = Math.max(0, Math.round(info.spendThisMonthUsd * 100) / 100);
  return {
    spendUsd,
    budgetUsd,
    percent: budgetUsd > 0 ? Math.min(100, Math.round((spendUsd / budgetUsd) * 100)) : 0,
    projects: info.projects,
    maxProjects: info.limits.maxProjects ?? plan.maxProjects,
  };
}

/** Body for `PUT /api/cloud/config`: the platform mail server, or null when customers get none. */
export function mailConfigPayload(mail: { smtpUrl: string | null; mailFrom: string | null }): { mail: MailConfig } {
  return { mail: mail.smtpUrl && mail.mailFrom ? { smtpUrl: mail.smtpUrl, from: mail.mailFrom } : null };
}

/** Internal, unique-enough address for shared workspaces (the slug column stays unique; customers never see it). */
export function internalSlug(): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (const b of crypto.randomBytes(12)) out += alphabet[b % alphabet.length];
  return `ws-${out}`;
}

export function hostOfUrl(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

/** Plan every shared workspace gets unless the admin changes it (Admin → Hosting → Plan). */
export const DEFAULT_PLAN: PlanLimits = { monthlyBudgetUsd: 10, maxProjects: 10 };

/**
 * Admin input → plan limits. Empty or malformed values are errors, never a silent 0: for the shared app a
 * `monthlyBudgetUsd` of 0 means *nothing* is included and paid AI / data usage is blocked.
 */
export function parsePlanInput(raw: { monthlyBudgetUsd: string; maxProjects: string }): { ok: true; plan: PlanLimits } | { ok: false; error: string } {
  const budgetText = raw.monthlyBudgetUsd.trim();
  const projectsText = raw.maxProjects.trim();
  if (!budgetText) return { ok: false, error: "Enter the included monthly usage (USD)." };
  if (!projectsText) return { ok: false, error: "Enter the maximum number of projects." };
  const budget = Number(budgetText);
  if (!Number.isFinite(budget) || budget < 0 || budget > 10_000) return { ok: false, error: "The included usage must be between $0 and $10,000." };
  const projects = Number(projectsText);
  if (!Number.isInteger(projects) || projects < 1 || projects > 1000) return { ok: false, error: "Max projects must be a whole number between 1 and 1000." };
  return { ok: true, plan: { monthlyBudgetUsd: Math.round(budget * 100) / 100, maxProjects: projects } };
}

/** Stored plan → limits sent to the shared app. Anything invalid falls back to the defaults (never an accidental 0). */
export function normalizePlan(stored: { monthlyBudgetUsd?: unknown; maxProjects?: unknown }): PlanLimits {
  const budget = stored.monthlyBudgetUsd;
  const projects = stored.maxProjects;
  return {
    monthlyBudgetUsd: typeof budget === "number" && Number.isFinite(budget) && budget >= 0 ? budget : DEFAULT_PLAN.monthlyBudgetUsd,
    maxProjects: typeof projects === "number" && Number.isInteger(projects) && projects >= 1 ? projects : DEFAULT_PLAN.maxProjects,
  };
}

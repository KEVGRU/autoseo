import "server-only";
import { and, gte, inArray, sql, eq, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projects, usageEvents } from "@/server/db/schema";
import { getSetting } from "@/server/settings";
import { isSharedCloud } from "@/server/env";
import { getProjectWorkspaceId, getWorkspaceLimits } from "@/server/cloud/tenancy";

export type UsageInput = {
  provider: string;
  feature: string;
  endpoint?: string;
  units?: number;
  costUsd?: number;
  projectId?: string | null;
  workspaceId?: string | null;
  userId?: string | null;
  meta?: Record<string, unknown>;
};

export async function recordUsage(input: UsageInput) {
  try {
    // Shared cloud: always attribute spend to the workspace, so deleting a project never resets its budget.
    const workspaceId =
      input.workspaceId ?? (isSharedCloud() && input.projectId ? await getProjectWorkspaceId(input.projectId) : null);
    await db.insert(usageEvents).values({
      provider: input.provider,
      feature: input.feature,
      endpoint: input.endpoint ?? null,
      units: input.units ?? 1,
      costUsd: input.costUsd ?? 0,
      projectId: input.projectId ?? null,
      workspaceId,
      userId: input.userId ?? null,
      meta: input.meta ?? {},
    });
  } catch (err) {
    console.error("[usage] failed to record", err);
  }
}

/** Usage of one workspace: events recorded for it or for one of its projects. */
export function workspaceUsageCondition(workspaceId: string): SQL {
  const wsProjects = db.select({ id: projects.id }).from(projects).where(eq(projects.workspaceId, workspaceId));
  return sql`(${usageEvents.workspaceId} = ${workspaceId} OR ${inArray(usageEvents.projectId, wsProjects)})`;
}

export async function spendSince(since: Date, workspaceId?: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${usageEvents.costUsd}), 0)` })
    .from(usageEvents)
    .where(and(gte(usageEvents.createdAt, since), workspaceId ? workspaceUsageCondition(workspaceId) : sql`true`));
  return Number(row?.total ?? 0);
}

export class BudgetExceededError extends Error {}

const PLATFORM_BUDGET_MESSAGE = "AI & data features are temporarily unavailable (platform limit reached). Please try again later.";

/** Who pays for a call: the workspace (or the project's workspace) for per-workspace budgets. */
export type BudgetScope = { workspaceId?: string | null; projectId?: string | null };

/**
 * Throws when the configured daily/monthly budget (Admin → Limits) is exhausted — and, on the shared AutoSEO
 * Cloud instance, when the workspace's own monthly budget is.
 */
export async function assertBudget(estimatedCostUsd = 0, scope: BudgetScope = {}) {
  const limits = await getSetting("limits");
  const shared = isSharedCloud();
  const now = new Date();
  if (limits.dailyBudgetUsd > 0) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const spent = await spendSince(day);
    if (spent + estimatedCostUsd > limits.dailyBudgetUsd)
      throw new BudgetExceededError(
        // Cloud customers never see the platform's own budget or spend.
        shared ? PLATFORM_BUDGET_MESSAGE : `Daily budget of $${limits.dailyBudgetUsd} reached ($${spent.toFixed(2)} spent).`,
      );
  }
  if (limits.monthlyBudgetUsd > 0) {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const spent = await spendSince(month);
    if (spent + estimatedCostUsd > limits.monthlyBudgetUsd)
      throw new BudgetExceededError(
        shared ? PLATFORM_BUDGET_MESSAGE : `Monthly budget of $${limits.monthlyBudgetUsd} reached ($${spent.toFixed(2)} spent).`,
      );
  }
  if (shared) await assertWorkspaceBudget(estimatedCostUsd, scope);
}

async function assertWorkspaceBudget(estimatedCostUsd: number, scope: BudgetScope) {
  const workspaceId = scope.workspaceId ?? (scope.projectId ? await getProjectWorkspaceId(scope.projectId) : null);
  if (!workspaceId) return;
  const budget = (await getWorkspaceLimits(workspaceId)).monthlyBudgetUsd;
  if (budget == null) return;
  const now = new Date();
  const spent = await spendSince(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), workspaceId);
  if (spent >= budget || spent + estimatedCostUsd > budget) {
    throw new BudgetExceededError("This workspace has used its included monthly AI & data budget. It resets on the 1st of next month.");
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionProject, ActionError, runAction } from "@/server/auth/guards";
import { logAudit } from "@/server/audit";
import {
  AlertInputError,
  ackEvents,
  alertRuleInput,
  alertRulePatch,
  createRule,
  deleteRule,
  toPublicEvent,
  toPublicRule,
  updateRule,
} from "@/server/alerts/rules";
import { evaluateProject } from "@/server/alerts/evaluate";

const pid = z.string().min(3).max(64);
const rid = z.string().regex(/^alr_[a-z0-9]{16}$/);
const eid = z.string().regex(/^ale_[a-z0-9]{16}$/);

function revalidate(projectId: string) {
  revalidatePath(`/p/${projectId}/alerts`);
}

async function guard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AlertInputError) throw new ActionError(err.message, "invalid");
    throw err;
  }
}

export async function createAlertRuleAction(projectId: string, input: z.input<typeof alertRuleInput>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "alerts.manage");
    const rule = await guard(() => createRule(ctx.project.id, input, ctx.user.id));
    await logAudit("alerts.rule.create", { actor: ctx.user, projectId: ctx.project.id, workspaceId: ctx.project.workspaceId, targetType: "alert_rule", targetId: rule.id, meta: { kind: rule.kind, name: rule.name } });
    revalidate(ctx.project.id);
    return toPublicRule(rule, { revealRecipients: true });
  });
}

export async function updateAlertRuleAction(projectId: string, ruleId: string, patch: z.input<typeof alertRulePatch>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "alerts.manage");
    const rule = await guard(() => updateRule(ctx.project.id, rid.parse(ruleId), patch));
    await logAudit("alerts.rule.update", { actor: ctx.user, projectId: ctx.project.id, workspaceId: ctx.project.workspaceId, targetType: "alert_rule", targetId: rule.id, meta: { fields: Object.keys(patch) } });
    revalidate(ctx.project.id);
    return toPublicRule(rule, { revealRecipients: true });
  });
}

export async function deleteAlertRuleAction(projectId: string, ruleId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "alerts.manage");
    const id = rid.parse(ruleId);
    if (!(await deleteRule(ctx.project.id, id))) throw new ActionError("Alert rule not found.", "not_found");
    await logAudit("alerts.rule.delete", { actor: ctx.user, projectId: ctx.project.id, workspaceId: ctx.project.workspaceId, targetType: "alert_rule", targetId: id });
    revalidate(ctx.project.id);
    return true;
  });
}

export async function ackAlertsAction(projectId: string, ids: string[] | "all") {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "alerts.manage");
    const n = await ackEvents(ctx.project.id, ids === "all" ? "all" : z.array(eid).min(1).max(500).parse(ids), ctx.user.id);
    revalidate(ctx.project.id);
    return n;
  });
}

/** "Evaluate now": runs the active rules (or the given ones) immediately and reports what fired. */
export async function evaluateAlertsAction(projectId: string, ruleIds?: string[]) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "alerts.manage");
    const ids = ruleIds ? z.array(rid).max(50).parse(ruleIds) : undefined;
    const results = await evaluateProject(ctx.project.id, { ruleIds: ids });
    revalidate(ctx.project.id);
    return {
      evaluated: results.length,
      fired: results.filter((r) => r.fired).map((r) => toPublicEvent(r.fired!, r.ruleName)),
      deferred: results.filter((r) => r.deferred).length,
      errors: results.filter((r) => r.error).map((r) => r.error!),
    };
  });
}

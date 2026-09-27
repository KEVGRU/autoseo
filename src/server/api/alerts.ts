import "server-only";
import { z } from "zod";
import {
  AlertInputError,
  ackEvents,
  alertEventsQuery,
  alertRuleInput,
  alertRulePatch,
  createRule,
  deleteRule,
  ensureDefaultRules,
  eventCounts,
  getRule,
  listEvents,
  listRules,
  toPublicRule,
  updateRule,
} from "@/server/alerts/rules";
import { evaluateProject } from "@/server/alerts/evaluate";
import { toPublicEvent } from "@/server/alerts/rules";
import { ApiError } from "./errors";

/** Alerts (rules + fired events) exposed via REST v1 and MCP. */

export { alertEventsQuery, alertRuleInput, alertRulePatch };

export const alertAckBody = z
  .object({
    ids: z.array(z.string().max(64)).max(500).optional().describe("Alert event ids to acknowledge."),
    all: z.boolean().optional().describe("Acknowledge every open alert of the project."),
  })
  .refine((v) => v.all || (v.ids && v.ids.length > 0), "Pass `ids` or `all: true`.");

export const alertEvaluateBody = z.object({
  ruleIds: z.array(z.string().max(64)).max(50).optional().describe("Only these rules (default: every active rule)."),
});

async function mapErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AlertInputError) throw new ApiError(/not found/i.test(err.message) ? "not_found" : "validation_error", err.message);
    throw err;
  }
}

export async function listAlertEventsForApi(projectId: string, q: z.infer<typeof alertEventsQuery>) {
  const [res, counts] = await Promise.all([listEvents(projectId, q), eventCounts(projectId)]);
  return { items: res.items, counts, pagination: res.pagination };
}

/** `revealRecipients` = the caller holds alerts.manage (otherwise email recipients are masked). */
export async function listAlertRulesForApi(projectId: string, revealRecipients: boolean) {
  await ensureDefaultRules(projectId);
  return (await listRules(projectId)).map((r) => toPublicRule(r, { revealRecipients }));
}

export async function getAlertRuleForApi(projectId: string, ruleId: string, revealRecipients: boolean) {
  const rule = await getRule(projectId, ruleId);
  if (!rule) throw new ApiError("not_found", "Alert rule not found.");
  return toPublicRule(rule, { revealRecipients });
}

export async function createAlertRuleForApi(projectId: string, body: z.input<typeof alertRuleInput>, userId: string) {
  return mapErrors(async () => toPublicRule(await createRule(projectId, body, userId), { revealRecipients: true }));
}

export async function updateAlertRuleForApi(projectId: string, ruleId: string, body: z.input<typeof alertRulePatch>) {
  return mapErrors(async () => toPublicRule(await updateRule(projectId, ruleId, body), { revealRecipients: true }));
}

export async function deleteAlertRuleForApi(projectId: string, ruleId: string) {
  if (!(await deleteRule(projectId, ruleId))) throw new ApiError("not_found", "Alert rule not found.");
  return { id: ruleId, deleted: true };
}

export async function ackAlertsForApi(projectId: string, body: z.infer<typeof alertAckBody>, userId: string) {
  const acknowledged = await ackEvents(projectId, body.all ? "all" : (body.ids ?? []), userId);
  return { acknowledged };
}

export async function evaluateAlertsForApi(projectId: string, ruleIds?: string[]) {
  const results = await evaluateProject(projectId, { ruleIds });
  return {
    evaluated: results.length,
    fired: results.filter((r) => r.fired).length,
    results: results.map((r) => ({
      ruleId: r.ruleId,
      kind: r.kind,
      findings: r.findings,
      deferredByCooldown: r.deferred,
      note: r.skipped,
      error: r.error,
      event: r.fired ? toPublicEvent(r.fired, r.ruleName) : null,
    })),
  };
}

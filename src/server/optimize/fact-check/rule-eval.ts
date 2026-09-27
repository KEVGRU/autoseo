import "server-only";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { aiAnswers, fcRules, fcStatements } from "@/server/db/schema";
import { evaluateRules, type EvalRule, type RuleViolation } from "./rules";

export type FcRuleRow = typeof fcRules.$inferSelect;

export function toEvalRule(r: FcRuleRow): EvalRule {
  return {
    id: r.id,
    name: r.name,
    kind: r.kind,
    assetId: r.assetId,
    terms: r.terms,
    triggerTerms: r.triggerTerms,
    min: r.min,
    max: r.max,
    unit: r.unit,
    currency: r.currency,
    market: r.market,
    severity: r.severity,
    active: r.active,
  };
}

/** Active rules of a project (optionally only those that can apply to one asset). */
export async function loadActiveRules(projectId: string, assetId?: string): Promise<EvalRule[]> {
  const rows = await db
    .select()
    .from(fcRules)
    .where(and(eq(fcRules.projectId, projectId), eq(fcRules.active, true)));
  return rows.map(toEvalRule).filter((r) => !assetId || !r.assetId || r.assetId === assetId);
}

type StatementForRules = {
  id: string;
  assetId: string;
  market: string;
  claim: string;
  answerQuote: string | null;
  answerId: string | null;
};

/** Evaluates rules for statements (loads answer texts only when a "required" rule needs them). */
export async function evaluateStatements(
  projectId: string,
  rules: EvalRule[],
  statements: StatementForRules[],
): Promise<Map<string, RuleViolation>> {
  const out = new Map<string, RuleViolation>();
  if (!rules.length || !statements.length) return out;
  const needsAnswers = rules.some((r) => r.kind === "required");
  const answerIds = needsAnswers ? [...new Set(statements.map((s) => s.answerId).filter((x): x is string => !!x))] : [];
  const texts = new Map<string, string>();
  for (let i = 0; i < answerIds.length; i += 500) {
    const chunk = answerIds.slice(i, i + 500);
    const rows = await db
      .select({ id: aiAnswers.id, text: aiAnswers.text })
      .from(aiAnswers)
      .where(and(eq(aiAnswers.projectId, projectId), inArray(aiAnswers.id, chunk)));
    for (const r of rows) texts.set(r.id, r.text);
  }
  for (const s of statements) {
    const [first, ...others] = evaluateRules(rules, {
      assetId: s.assetId,
      market: s.market,
      claim: s.claim,
      quote: s.answerQuote,
      answerText: s.answerId ? (texts.get(s.answerId) ?? null) : null,
    });
    // One verdict per statement (the most severe rule); further violated rules are named in the explanation.
    if (first)
      out.set(
        s.id,
        others.length
          ? { ...first, explanation: `${first.explanation} Also violates: ${others.map((o) => `“${o.ruleName}”${o.found ? ` (${o.found})` : ""}`).join(", ")}.` }
          : first,
      );
  }
  return out;
}

/** Persists a rule violation verdict on a statement. */
export async function markRuleViolation(statementId: string, v: RuleViolation) {
  await db
    .update(fcStatements)
    .set({
      verdict: "rule_violation",
      severity: v.severity,
      ruleId: v.ruleId,
      labelSection: `Rule · ${v.ruleName}`.slice(0, 200),
      labelQuote: `Expected: ${v.expected}`.slice(0, 1000),
      documentId: null,
      explanation: v.explanation.slice(0, 1000),
      matchScore: null,
      judgedBy: "rule",
      checkedAt: new Date(),
    })
    .where(eq(fcStatements.id, statementId));
}

/**
 * Re-applies the project's rules to every automatically judged statement (after rules changed):
 * new violations are marked, statements whose rule no longer fails go back to "pending" so the next
 * run judges them against the label again. Human verdicts are never touched. Newly marked
 * violations are sent as a `fact_check.deviation` webhook event.
 */
export async function reevaluateProjectRules(projectId: string): Promise<{ checked: number; violations: number; cleared: number }> {
  const startedAt = new Date();
  const rules = await loadActiveRules(projectId);
  let checked = 0;
  let violations = 0;
  let marked = 0;
  let cleared = 0;
  let cursor = "";
  for (;;) {
    const batch = await db
      .select({
        id: fcStatements.id,
        assetId: fcStatements.assetId,
        market: fcStatements.market,
        claim: fcStatements.claim,
        answerQuote: fcStatements.answerQuote,
        answerId: fcStatements.answerId,
        verdict: fcStatements.verdict,
        ruleId: fcStatements.ruleId,
      })
      .from(fcStatements)
      .where(
        and(
          eq(fcStatements.projectId, projectId),
          sql`coalesce(${fcStatements.judgedBy}, 'lexical') <> 'user'`,
          ne(fcStatements.status, "ignored"),
          sql`${fcStatements.id} > ${cursor}`,
        ),
      )
      .orderBy(fcStatements.id)
      .limit(1000);
    if (!batch.length) break;
    cursor = batch[batch.length - 1]!.id;
    const results = await evaluateStatements(projectId, rules, batch);
    for (const s of batch) {
      checked++;
      const v = results.get(s.id);
      if (v) {
        if (s.verdict !== "rule_violation" || s.ruleId !== v.ruleId) {
          await markRuleViolation(s.id, v);
          marked++;
        }
        violations++;
      } else if (s.verdict === "rule_violation") {
        await db
          .update(fcStatements)
          .set({ verdict: "pending", severity: null, ruleId: null, labelSection: null, labelQuote: null, explanation: null, judgedBy: null, checkedAt: null })
          .where(eq(fcStatements.id, s.id));
        cleared++;
      }
    }
  }
  // Only statements marked in this pass have checkedAt ≥ startedAt — unchanged violations aren't re-sent.
  if (marked) {
    try {
      await (await import("@/server/webhooks/emitters")).emitFactCheckDeviations(projectId, null, startedAt);
    } catch (err) {
      console.error("[fact-check] webhook emit after rule re-evaluation failed", err);
    }
  }
  return { checked, violations, cleared };
}

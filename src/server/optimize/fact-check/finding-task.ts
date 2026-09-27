import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { fcAssets, fcRules, fcStatements, optimizeTasks, prompts, type TaskEvidence } from "@/server/db/schema";
import { newId } from "@/server/db/schema/_helpers";
import { getOptimizeSettings } from "@/server/optimize/settings";
import { addTaskActivity } from "@/server/optimize/tasks/activity";
import { priorityScore } from "@/server/optimize/tasks/scoring";
import { citedSources } from "@/features/optimize/fact-check/queries";
import { FC_VERDICT_META } from "@/features/optimize/constants";
import { getEngine } from "@/lib/engines";

const IMPACT: Record<string, number> = { critical: 9, major: 7, minor: 4 };

function clip(s: string, n: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/**
 * Creates (or returns) the optimization task for a fact-check finding. Fingerprint `fc:<statementId>`
 * links finding ↔ task; the task carries the claim, the label passage / violated rule and the pages
 * the AI cited (likely origin of the wrong information).
 */
export async function createTaskForFinding(projectId: string, statementId: string, userId: string) {
  const fingerprint = `fc:${statementId}`;
  const [existing] = await db
    .select()
    .from(optimizeTasks)
    .where(and(eq(optimizeTasks.projectId, projectId), eq(optimizeTasks.fingerprint, fingerprint)))
    .limit(1);
  if (existing) return { task: existing, created: false };

  const [row] = await db
    .select({ s: fcStatements, assetName: fcAssets.name, promptText: prompts.text, ruleName: fcRules.name })
    .from(fcStatements)
    .innerJoin(fcAssets, eq(fcAssets.id, fcStatements.assetId))
    .leftJoin(prompts, eq(prompts.id, fcStatements.promptId))
    .leftJoin(fcRules, eq(fcRules.id, fcStatements.ruleId))
    .where(and(eq(fcStatements.projectId, projectId), eq(fcStatements.id, statementId)))
    .limit(1);
  if (!row) return null;
  const { s, assetName, promptText, ruleName } = row;
  const sources = s.answerId ? ((await citedSources(projectId, [s.answerId])).get(s.answerId) ?? []) : [];
  const engine = getEngine(s.engine)?.name ?? s.engine;
  const verdict = (FC_VERDICT_META as Record<string, { label: string }>)[s.verdict]?.label ?? s.verdict;
  const isRule = s.verdict === "rule_violation";
  const impact = IMPACT[s.severity ?? ""] ?? 5;
  const effort = sources.some((x) => x.ownership !== "own") ? 5 : 3;

  const description = [
    `${engine} (${s.market}) told users about **${assetName}**: “${clip(s.answerQuote || s.claim, 600)}”`,
    `Verdict: **${verdict}**${s.severity ? ` (${s.severity})` : ""}. ${s.explanation ?? ""}`.trim(),
    isRule
      ? `Violated rule: **${ruleName ?? s.labelSection ?? "fact-check rule"}**${s.labelQuote ? ` — ${s.labelQuote}` : ""}`
      : s.labelQuote
        ? `Label${s.labelSection ? ` (${s.labelSection})` : ""}: “${clip(s.labelQuote, 600)}”`
        : "The reference documents contain no passage backing this claim.",
    promptText ? `Prompt: “${promptText}” · seen ${s.seenCount}×` : `Seen ${s.seenCount}×`,
  ].join("\n\n");

  const evidence: TaskEvidence[] = [
    {
      kind: "quotes",
      label: "What AI said",
      value: verdict,
      items: [{ label: clip(s.answerQuote || s.claim, 400), engine: s.engine, detail: `${s.market} · seen ${s.seenCount}×` }],
    },
    {
      kind: "note",
      label: isRule ? "Violated rule" : "Reference",
      description: isRule ? `${ruleName ?? s.labelSection ?? "Rule"}${s.labelQuote ? ` — ${s.labelQuote}` : ""}` : (s.labelQuote ?? "No matching passage in the reference documents."),
    },
  ];
  if (sources.length) {
    evidence.push({
      kind: "sources",
      label: "Sources the AI cited",
      value: `${sources.length} page${sources.length === 1 ? "" : "s"}`,
      items: sources.map((x) => ({ label: x.title || x.url, href: x.url, detail: x.domain, good: x.ownership === "own" })),
    });
  }

  const steps = [
    sources.length ? "Review the cited sources and find where the wrong information comes from." : "Find where AI engines pick up the wrong information (search the claim).",
    isRule ? `Publish the correct figures / wording on your own pages (${ruleName ?? "see the rule"}).` : "Make the correct statement explicit on your own pages, in the label wording.",
    sources.some((x) => x.ownership !== "own") ? "Ask third-party publishers to correct outdated or wrong statements." : "Update your own page that AI cites so it states the fact unambiguously.",
    "Re-run the fact check after the next tracking run and resolve the finding once AI answers are correct.",
  ];

  const settings = await getOptimizeSettings(projectId);
  const [task] = await db
    .insert(optimizeTasks)
    .values({
      projectId,
      fingerprint,
      signal: "fact_check",
      category: "reputation",
      title: clip(`Correct what AI says about ${assetName}: ${s.claim}`, 190),
      summary: clip(`${engine} states “${s.claim}” — ${verdict.toLowerCase()}.`, 280),
      description,
      steps: steps.map((text) => ({ id: newId("stp").slice(4), text, done: false })),
      acceptanceCriteria: ["Fresh AI answers no longer repeat the claim.", "The fact-check finding is resolved."],
      targetUrls: sources.filter((x) => x.ownership === "own").map((x) => x.url).slice(0, 10),
      targetPrompts: promptText ? [promptText] : [],
      evidence,
      signalData: { datasets: ["Fact Check"], statementId, verdict: s.verdict, ruleId: s.ruleId },
      impact,
      effort,
      priority: priorityScore(impact, effort),
      status: "open",
      autoResolvable: false,
      assigneeId: settings.routing?.reputation?.assigneeId ?? null,
      writtenBy: "template",
      source: "manual",
      createdBy: userId,
    })
    .onConflictDoNothing()
    .returning();
  if (!task) {
    const [again] = await db
      .select()
      .from(optimizeTasks)
      .where(and(eq(optimizeTasks.projectId, projectId), eq(optimizeTasks.fingerprint, fingerprint)))
      .limit(1);
    return again ? { task: again, created: false } : null;
  }
  await addTaskActivity({ taskId: task.id, projectId, kind: "created", userId, body: "Created from a fact-check finding.", meta: { statementId } });
  return { task, created: true };
}

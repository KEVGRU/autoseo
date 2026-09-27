import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { aiAnswers, aiRuns, alertEvents, alertRules, fcAssets, fcRules, fcStatements, notifications, projects, prompts, users, workspaceMembers, workspaces } from "@/server/db/schema";
import { addDays, dayString } from "@/features/ai-tracking/period";
import { evaluateRule } from "./evaluate";
import { createRule, getRule } from "./rules";

/** Engine behaviour against the dev DB: threshold → fire, dedupe while open, cooldown defers, re-fire later. */
describe("alerts engine (integration, dev DB)", () => {
  const suffix = Math.random().toString(36).slice(2, 8);
  let wsId = "";
  let userId = "";
  let projectId = "";
  const now = new Date();

  beforeAll(async () => {
    const [ws] = await db.insert(workspaces).values({ name: `Alerts test ${suffix}`, slug: `alerts-test-${suffix}` }).returning();
    wsId = ws!.id;
    const [u] = await db.insert(users).values({ email: `alerts.${suffix}@autoseo.test`, name: "Alert Tester" }).returning();
    userId = u!.id;
    await db.insert(workspaceMembers).values({ workspaceId: wsId, userId, roleKey: "owner" });
    const [p] = await db.insert(projects).values({ workspaceId: wsId, name: "Alerts project", domain: `alerts-${suffix}.example` }).returning();
    projectId = p!.id;
  });

  afterAll(async () => {
    await db.delete(workspaces).where(eq(workspaces.id, wsId));
    await db.delete(users).where(eq(users.id, userId));
  });

  it("fires once per failed run, dedupes, and respects the cooldown", async () => {
    await db.insert(aiRuns).values({ projectId, status: "failed", totalTasks: 4, failedTasks: 4, error: "DataForSEO not configured", finishedAt: new Date(now.getTime() - 3_600_000) });
    const created = await createRule(projectId, { name: "Runs", kind: "run_failed", params: { windowDays: 2, threshold: 50 }, channels: { inApp: true, emails: [], slack: false, webhook: true }, cooldownHours: 1 }, userId);

    const first = await evaluateRule(created, { now });
    expect(first.error).toBeNull();
    expect(first.findings).toBe(1);
    expect(first.fired?.severity).toBe("critical");
    expect(first.fired?.payload.items).toHaveLength(1);
    const notes = await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.projectId, projectId)));
    expect(notes).toHaveLength(1);
    expect(notes[0]!.href).toBe(`/p/${projectId}/alerts?event=${first.fired!.id}`);

    // Same condition still true → no second event.
    const second = await evaluateRule((await getRule(projectId, created.id))!, { now: new Date(now.getTime() + 60_000) });
    expect(second.fired).toBeNull();
    expect(second.findings).toBe(1);

    // A new failure inside the cooldown is held back …
    await db.insert(aiRuns).values({ projectId, status: "partial", totalTasks: 4, doneTasks: 1, failedTasks: 3, finishedAt: new Date(now.getTime() - 60_000) });
    const third = await evaluateRule((await getRule(projectId, created.id))!, { now: new Date(now.getTime() + 120_000) });
    expect(third.fired).toBeNull();
    expect(third.deferred).toBe(true);

    // … and fires (only the new run) once the cooldown is over.
    const fourth = await evaluateRule((await getRule(projectId, created.id))!, { now: new Date(now.getTime() + 2 * 3_600_000) });
    expect(fourth.fired).not.toBeNull();
    expect(fourth.fired!.payload.items).toHaveLength(1);
    expect(fourth.fired!.payload.items[0]!.label).toMatch(/^Partial/);
    expect(fourth.fired!.severity).toBe("warning");

    const events = await db.select().from(alertEvents).where(eq(alertEvents.ruleId, created.id));
    expect(events).toHaveLength(2);
  });

  it("alerts on fact-check rule violations with the rule name and severity", async () => {
    const [asset] = await db.insert(fcAssets).values({ projectId, name: "Loan X" }).returning();
    const [fcRule] = await db.insert(fcRules).values({ projectId, name: "APR range", kind: "numeric_range", terms: ["APR"], min: 3.9, max: 12.9, unit: "%", severity: "critical" }).returning();
    await db.insert(fcStatements).values([
      {
        projectId,
        assetId: asset!.id,
        hash: `h1-${suffix}`,
        claim: "Loan X starts at 1.9 % APR.",
        engine: "chatgpt",
        market: "US",
        verdict: "rule_violation",
        severity: "critical",
        ruleId: fcRule!.id,
        judgedBy: "rule",
        checkedAt: new Date(now.getTime() - 60_000),
      },
      // Label deviations still count; matched statements don't.
      { projectId, assetId: asset!.id, hash: `h2-${suffix}`, claim: "Loan X is approved for students.", engine: "perplexity", market: "US", verdict: "off_label", severity: "minor", judgedBy: "ai", checkedAt: new Date(now.getTime() - 60_000) },
      { projectId, assetId: asset!.id, hash: `h3-${suffix}`, claim: "Loan X has no fees.", engine: "chatgpt", market: "US", verdict: "matched", judgedBy: "ai", checkedAt: new Date(now.getTime() - 60_000) },
    ]);
    const rule = await createRule(projectId, { name: "FC", kind: "fact_check_deviation", params: { windowDays: 7 }, channels: { inApp: false, emails: [], slack: false, webhook: false } }, userId);
    const res = await evaluateRule(rule, { now });
    expect(res.findings).toBe(2);
    const items = res.fired!.payload.items;
    const violation = items.find((i) => i.meta?.verdict === "rule_violation")!;
    expect(violation.meta).toMatchObject({ ruleId: fcRule!.id, ruleName: "APR range", ruleKind: "numeric_range", severity: "critical", asset: "Loan X" });
    expect(violation.detail).toMatch(/^breaks rule “APR range” · critical/);
    expect(items.find((i) => i.meta?.verdict === "off_label")!.meta?.ruleName).toBeNull();
    expect(res.fired!.severity).toBe("critical");
    expect(res.fired!.body).toContain("Rules broken: “APR range”");

    // Only critical deviations → just the rule violation.
    const strict = await createRule(projectId, { name: "FC critical", kind: "fact_check_deviation", params: { windowDays: 7, minSeverity: "critical" }, channels: { inApp: false, emails: [], slack: false, webhook: false } }, userId);
    const only = await evaluateRule(strict, { now });
    expect(only.findings).toBe(1);
    expect(only.fired!.title).toBe("Fact-check rule “APR range” violated: Loan X");
  });

  it("detects a visibility drop above the threshold and ignores a stale evaluation", async () => {
    const [prompt] = await db.insert(prompts).values({ projectId, text: "best test widget", country: "US" }).returning();
    const today = dayString(now);
    const rows = [];
    for (let i = 0; i < 6; i++) {
      // Current window (last 7 days): brand never named; previous window: always named.
      rows.push({ projectId, promptId: prompt!.id, engine: "chatgpt", provider: "api", country: "US", language: "en", answerDate: addDays(today, -i), brandMentioned: false });
      rows.push({ projectId, promptId: prompt!.id, engine: "chatgpt", provider: "api", country: "US", language: "en", answerDate: addDays(today, -7 - i), brandMentioned: true });
    }
    await db.insert(aiAnswers).values(rows);
    const rule = await createRule(projectId, { name: "Vis", kind: "visibility_drop", params: { threshold: 10, windowDays: 7 }, channels: { inApp: false, emails: [], slack: false, webhook: false } }, userId);

    const res = await evaluateRule(rule, { now });
    expect(res.fired).not.toBeNull();
    expect(res.fired!.payload).toMatchObject({ metric: "visibility", current: 0, previous: 100, change: -100, unit: "pp" });
    expect(res.fired!.title).toBe("Visibility dropped 100 pp to 0%");

    // An evaluation that read the rule before the first one stored its state must not fire again.
    const stale = await evaluateRule(rule, { now });
    expect(stale.fired).toBeNull();

    const higher = await createRule(projectId, { name: "Vis strict", kind: "visibility_drop", params: { threshold: 100.5, windowDays: 7 }, channels: { inApp: false, emails: [], slack: false, webhook: false } }, userId);
    expect((await evaluateRule(higher, { now })).fired).toBeNull();
    await db.delete(alertRules).where(eq(alertRules.id, higher.id));
  });
});

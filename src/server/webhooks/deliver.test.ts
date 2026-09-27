import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { fcAssets, fcRules, fcStatements, notifications, projects, users, webhookDeliveries, webhookEndpoints, workspaces } from "@/server/db/schema";
import { encryptJson } from "@/server/crypto";
import { MAX_CONSECUTIVE_FAILURES } from "./payload";
import { emitEvent, recordDeliveryOutcome } from "./deliver";
import { emitFactCheckDeviations } from "./emitters";

/** Endpoint health bookkeeping and idempotent emits against the dev DB. */
describe("webhook bus (integration, dev DB)", () => {
  const suffix = Math.random().toString(36).slice(2, 8);
  let wsId = "";
  let userId = "";
  let projectId = "";

  const newEndpoint = async (events: string[] = ["alert.triggered"]) => {
    const [e] = await db
      .insert(webhookEndpoints)
      .values({ projectId, url: "https://receiver.webhook-test.invalid/x", secret: encryptJson("whsec_test"), secretPrefix: "whsec_test…", events, createdBy: userId })
      .returning();
    return e!;
  };
  const load = async (id: string) => (await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.id, id)))[0]!;

  beforeAll(async () => {
    const [ws] = await db.insert(workspaces).values({ name: `Webhooks test ${suffix}`, slug: `webhooks-test-${suffix}` }).returning();
    wsId = ws!.id;
    const [u] = await db.insert(users).values({ email: `webhooks.${suffix}@autoseo.test`, name: "Hook Tester" }).returning();
    userId = u!.id;
    const [p] = await db.insert(projects).values({ workspaceId: wsId, name: "Webhooks project", domain: `webhooks-${suffix}.example` }).returning();
    projectId = p!.id;
  });

  afterAll(async () => {
    await db.delete(workspaces).where(eq(workspaces.id, wsId));
    await db.delete(users).where(eq(users.id, userId));
  });

  it("keeps an endpoint on during a short outage and switches it off after a long failure streak", async () => {
    const ep = await newEndpoint();
    for (let i = 0; i < MAX_CONSECUTIVE_FAILURES + 2; i++) await recordDeliveryOutcome(ep.id, "failed", "HTTP 503");
    let row = await load(ep.id);
    expect(row.active).toBe(true);
    expect(row.failureCount).toBe(MAX_CONSECUTIVE_FAILURES + 2);
    expect(row.failingSince).not.toBeNull();

    // Streak older than a day → the next failed delivery switches it off (once) and notifies the creator.
    await db.update(webhookEndpoints).set({ failingSince: new Date(Date.now() - 25 * 3_600_000) }).where(eq(webhookEndpoints.id, ep.id));
    expect((await recordDeliveryOutcome(ep.id, "failed", "HTTP 503")).disabled).toBe(true);
    expect((await recordDeliveryOutcome(ep.id, "failed", "HTTP 503")).disabled).toBe(false);
    row = await load(ep.id);
    expect(row.active).toBe(false);
    expect(row.disabledReason).toMatch(/failed deliveries in a row/);
    const notes = await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.kind, "webhook.disabled")));
    expect(notes).toHaveLength(1);
  });

  it("resets the streak on success and unsubscribes on HTTP 410", async () => {
    const ep = await newEndpoint();
    await recordDeliveryOutcome(ep.id, "failed", "HTTP 500");
    await recordDeliveryOutcome(ep.id, "succeeded");
    let row = await load(ep.id);
    expect(row).toMatchObject({ failureCount: 0, failingSince: null, lastError: null, active: true });
    expect(row.lastDeliveredAt).not.toBeNull();

    expect((await recordDeliveryOutcome(ep.id, "gone", "HTTP 410")).disabled).toBe(true);
    row = await load(ep.id);
    expect(row.active).toBe(false);
    expect(row.disabledReason).toMatch(/410/);
  });

  it("includes fact-check rule violations (rule name, kind, severity) in fact_check.deviation", async () => {
    const ep = await newEndpoint(["fact_check.deviation"]);
    const [asset] = await db.insert(fcAssets).values({ projectId, name: "Loan X" }).returning();
    const [fcRule] = await db.insert(fcRules).values({ projectId, name: "No guarantees", kind: "forbidden", terms: ["guaranteed"], severity: "major" }).returning();
    const since = new Date(Date.now() - 60_000);
    await db.insert(fcStatements).values([
      { projectId, assetId: asset!.id, hash: `r1-${suffix}`, claim: "Approval is guaranteed.", engine: "chatgpt", market: "US", verdict: "rule_violation", severity: "major", ruleId: fcRule!.id, judgedBy: "rule", checkedAt: new Date() },
      { projectId, assetId: asset!.id, hash: `r2-${suffix}`, claim: "Rates start at 0 %.", engine: "chatgpt", market: "US", verdict: "contradicted", severity: "critical", judgedBy: "ai", checkedAt: new Date() },
    ]);
    await emitFactCheckDeviations(projectId, "opr_test", since);
    const [d] = await db.select().from(webhookDeliveries).where(eq(webhookDeliveries.endpointId, ep.id));
    const data = (d!.payload as { data: { counts: Record<string, number>; deviations: { verdict: string; rule: unknown }[] } }).data;
    expect(data.counts).toMatchObject({ total: 2, critical: 1, major: 1, ruleViolations: 1 });
    expect(data.deviations.find((x) => x.verdict === "rule_violation")!.rule).toEqual({ id: fcRule!.id, name: "No guarantees", kind: "forbidden", severity: "major" });
    expect(data.deviations.find((x) => x.verdict === "contradicted")!.rule).toBeNull();
  });

  it("only delivers to active, subscribed endpoints and emits an event id once", async () => {
    const subscribed = await newEndpoint(["tracking.run_completed"]);
    const wildcard = await newEndpoint(["*"]);
    await newEndpoint(["task.created"]);
    const paused = await newEndpoint(["*"]);
    await db.update(webhookEndpoints).set({ active: false }).where(eq(webhookEndpoints.id, paused.id));

    const n = await emitEvent(projectId, "tracking.run_completed", { run: { id: "run_x" } }, { eventId: `evt_run_test_${suffix}` });
    expect(n).toBe(2);
    const rows = await db
      .select()
      .from(webhookDeliveries)
      .where(and(eq(webhookDeliveries.projectId, projectId), eq(webhookDeliveries.eventId, `evt_run_test_${suffix}`)));
    expect(rows.map((r) => r.endpointId).sort()).toEqual([subscribed.id, wildcard.id].sort());
    expect(rows.every((r) => r.eventId === `evt_run_test_${suffix}` && (r.payload as { data: unknown }).data !== undefined)).toBe(true);

    // Same event id again → nothing new (e.g. the run poller after a direct hook call).
    expect(await emitEvent(projectId, "tracking.run_completed", { run: { id: "run_x" } }, { eventId: `evt_run_test_${suffix}` })).toBe(0);
    // Lazy payload builders only run when someone listens.
    let built = false;
    expect(
      await emitEvent(projectId, "report.sent", async () => {
        built = true;
        return {};
      }),
    ).toBe(1); // the wildcard endpoint
    expect(built).toBe(true);
  });
});

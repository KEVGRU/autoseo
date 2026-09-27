import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { aiAnswers, aiMentions, competitors, projects, prompts, workspaces } from "@/server/db/schema";
import { newId } from "@/server/db/schema/_helpers";
import { analyzeAnswer } from "@/server/ai/analysis";
import { recomputeTrackedPositions } from "@/server/ai/analysis/tracked-positions";
import { createCompetitor } from "@/server/ai/insights/competitor-admin";
import { addTrackedPrompts, projectDefaultMarkets, updatePromptMarkets } from "@/server/ai/tracking/prompts";
import { countSimulatedAnswers, getCountryRows, getModelVersionRows, getSurfaceOverlap, getTrackerKpis } from "@/server/ai/metrics";
import { getFilterOptions } from "@/server/ai/insights/brands";
import { loadBrandMetrics } from "@/server/ai/insights/brand-metrics";
import { parseInsightFilter } from "@/server/ai/insights/filters";
import { addDays, dayString, resolveRange } from "@/features/ai-tracking/period";

/**
 * Integration (dev DB): multi-market Locations rows, AI Overview vs AI Mode overlap, model
 * versions and tracked-set vs all-brands positions / share of voice. Creates a throwaway
 * workspace + project and deletes it afterwards (cascade).
 */
describe("tracker metrics (integration, dev DB)", () => {
  const workspaceId = newId("wsp");
  const projectId = newId("prj");
  const day = addDays(dayString(new Date()), -1);
  const period = resolveRange("7d");
  const ids = { p1: newId("prm"), p2: newId("prm"), p3: newId("prm"), comp: newId("cmp") };

  const answer = async (promptId: string, engine: string, country: string, model: string, text: string, citations: string[], provider = "dataforseo") => {
    const [row] = await db
      .insert(aiAnswers)
      .values({
        projectId,
        promptId,
        engine,
        provider,
        model,
        country,
        language: "de",
        answerDate: day,
        text,
        raw: { citations: citations.map((url, i) => ({ url, title: null, position: i + 1 })), fanouts: [], shopping: [], ads: [] },
      })
      .returning({ id: aiAnswers.id });
    await analyzeAnswer(row!.id, { llm: false });
    return row!.id;
  };

  beforeAll(async () => {
    await db.insert(workspaces).values({ id: workspaceId, name: "metrics integration test", slug: `metrics-test-${workspaceId.slice(-8).toLowerCase()}` });
    await db.insert(projects).values({ id: projectId, workspaceId, name: "Solakon", domain: "solakon.de", country: "DE", language: "de", engines: ["ai_overview", "google_ai_mode", "chatgpt"] });
    await db.insert(competitors).values({ id: ids.comp, projectId, name: "Anker SOLIX", aliases: ["Anker"], domain: "anker.com" });
    await db.insert(prompts).values([
      { id: ids.p1, projectId, text: "best balcony solar kit", country: "DE", markets: ["DE", "FR"], funnelStage: "tofu" },
      { id: ids.p2, projectId, text: "balcony solar kit italy", country: "IT", markets: ["IT"] },
      { id: ids.p3, projectId, text: "meilleur kit solaire balcon", country: "FR" },
    ]);
    // DE: both surfaces answer; URL overlap 1/3, domain overlap 1/2, brand visible in both.
    await answer(ids.p1, "ai_overview", "DE", "google-ai-overview", "Solakon and Anker SOLIX are popular.", ["https://a-test.example/x", "https://b-test.example/y"]);
    await answer(ids.p1, "google_ai_mode", "DE", "google-ai-mode", "Many buyers pick Solakon.", ["https://b-test.example/y", "https://b-test.example/z"]);
    // FR: no AI Overview shown (empty answer); AI Mode names the brand.
    await answer(ids.p3, "ai_overview", "FR", "google-ai-overview", "", []);
    await answer(ids.p3, "google_ai_mode", "FR", "google-ai-mode", "Solakon est souvent recommandé.", []);
    // ChatGPT: an untracked brand (as the LLM pass would store it) is named first, then Anker, then Solakon.
    const a5 = await answer(ids.p1, "chatgpt", "DE", "gpt-5", "EcoFlow leads, Anker SOLIX follows, Solakon third.", []);
    await db.insert(aiMentions).values({
      answerId: a5,
      projectId,
      promptId: ids.p1,
      engine: "chatgpt",
      answerDate: day,
      competitorId: null,
      isOwn: false,
      brandName: "EcoFlow",
      position: 1,
      charOffset: 0,
    });
    // Shift the deterministic positions behind the untracked brand (all-brands ranking).
    await db.execute(sql`update ai_mentions set position = position + 1 where answer_id = ${a5} and brand_name <> 'EcoFlow'`);
    await db.update(aiAnswers).set({ brandPosition: 3 }).where(eq(aiAnswers.id, a5));
    await recomputeTrackedPositions(projectId);
  }, 60_000);

  afterAll(async () => {
    await db.delete(projects).where(eq(projects.id, projectId));
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  });

  it("stores tracked-set positions next to all-brand positions", async () => {
    const rows = await db.select({ pos: aiAnswers.brandPosition, tracked: aiAnswers.brandPositionTracked, engine: aiAnswers.engine }).from(aiAnswers).where(eq(aiAnswers.projectId, projectId));
    const chat = rows.find((r) => r.engine === "chatgpt")!;
    expect(chat.pos).toBe(3);
    expect(chat.tracked).toBe(2);
  });

  it("switches position and share of voice between the tracked set and all brands", async () => {
    const f = { projectId, engines: ["chatgpt"] };
    const tracked = (await getTrackerKpis({ ...f, brandScope: "tracked" }, period)).current;
    const all = (await getTrackerKpis({ ...f, brandScope: "all" }, period)).current;
    expect(tracked.position).toBe(2);
    expect(all.position).toBe(3);
    expect(tracked.shareOfVoice).toBe(50);
    expect(all.shareOfVoice).toBe(33.3);
    expect(tracked.firstShare).toBe(0);
    expect(tracked.top3Share).toBe(100);
    // Adding the brand as a competitor re-links its history and re-ranks the tracked set.
    await createCompetitor(projectId, { name: "EcoFlow" });
    const after = (await getTrackerKpis({ ...f, brandScope: "tracked" }, period)).current;
    expect(after.position).toBe(3);
    expect(after.shareOfVoice).toBe(33.3);
  });

  it("measures AI Overview presence and AI Overview vs AI Mode overlap", async () => {
    const o = await getSurfaceOverlap({ projectId }, period);
    expect(o.aiOverview).toMatchObject({ answers: 2, present: 1, presence: 50 });
    expect(o.aiMode).toMatchObject({ answers: 2, present: 2, presence: 100 });
    expect(o.pairs).toBe(2);
    expect(o.bothPresent).toBe(1);
    expect(o.urlOverlap).toBe(33.3);
    expect(o.domainOverlap).toBe(50);
    expect(o.brand).toEqual({ both: 1, aiOverviewOnly: 0, aiModeOnly: 1, neither: 0 });
    expect(o.prompts).toHaveLength(2);
    expect(o.domains.find((d) => d.domain === "b-test.example")).toMatchObject({ aiOverview: 1, aiMode: 1, both: 1 });
    const k = (await getTrackerKpis({ projectId }, period)).current;
    expect(k.aiOverviewPresence).toBe(50);
    expect(k.aiModePresence).toBe(100);
  });

  it("lists every configured market in Locations, incl. markets without answers yet", async () => {
    const rows = await getCountryRows({ projectId }, period);
    const by = new Map(rows.map((r) => [r.country, r]));
    expect(by.get("DE")).toMatchObject({ answers: 3, configured: 1 });
    expect(by.get("FR")).toMatchObject({ answers: 2, configured: 2 });
    expect(by.get("IT")).toMatchObject({ answers: 0, configured: 1, visibility: null });
    const fr = await getCountryRows({ projectId, countries: ["FR"] }, period);
    expect(fr.map((r) => r.country)).toEqual(["FR"]);
  });

  it("stores multi-market prompts (primary market first) and updates their markets", async () => {
    const res = await addTrackedPrompts({ projectId, prompts: [{ text: "beste balkonkraftwerk speicher", markets: ["at", "DE", "XX"] }], source: "manual" });
    expect(res.created).toHaveLength(1);
    const [p] = await db.select({ country: prompts.country, markets: prompts.markets }).from(prompts).where(eq(prompts.id, res.created[0]!));
    expect(p).toEqual({ country: "AT", markets: ["AT", "DE"] });
    await updatePromptMarkets(projectId, res.created, ["CH"]);
    const [q] = await db.select({ country: prompts.country, markets: prompts.markets }).from(prompts).where(eq(prompts.id, res.created[0]!));
    expect(q).toEqual({ country: "CH", markets: null });
    expect(projectDefaultMarkets({ country: "DE", settings: { aiTracking: { defaultMarkets: ["AT", "DE", "zz"] } } })).toEqual(["DE", "AT"]);
    expect(projectDefaultMarkets({ country: "DE", settings: {} })).toEqual(["DE"]);
  });

  it("breaks answers down by model version", async () => {
    const rows = await getModelVersionRows({ projectId }, period);
    expect(rows.find((r) => r.model === "google-ai-mode")).toMatchObject({ engine: "google_ai_mode", answers: 2, visibility: 100 });
    expect(rows.find((r) => r.model === "google-ai-overview")).toMatchObject({ answers: 2, visibility: 50 });
    const only = (await getTrackerKpis({ projectId, modelVersions: ["gpt-5"] }, period)).current;
    expect(only.answers).toBe(1);
  });

  it("excludes AI-simulation answers on request and still counts them for the badge", async () => {
    await answer(ids.p3, "perplexity", "FR", "sim:gemini-3.5-flash", "Solakon is a good pick.", [], "ai");
    const f = { projectId, engines: ["perplexity"] };
    const incl = (await getTrackerKpis(f, period)).current;
    const excl = (await getTrackerKpis({ ...f, excludeSimulated: true }, period)).current;
    expect(incl).toMatchObject({ answers: 1, simulatedAnswers: 1, visibility: 100 });
    expect(excl.answers).toBe(0);
    expect(await countSimulatedAnswers({ ...f, excludeSimulated: true }, period)).toBe(1);

    const today = dayString(new Date());
    const insight = parseInsightFilter(projectId, { period: "7d", simulated: "exclude" }, { today });
    const withSim = await loadBrandMetrics(parseInsightFilter(projectId, { period: "7d" }, { today }), "cur", ["engine"]);
    const withoutSim = await loadBrandMetrics(insight, "cur", ["engine"]);
    expect(withSim.totals.engine.get("perplexity")).toBe(1);
    expect(withoutSim.totals.engine.get("perplexity")).toBeUndefined();
    expect(withoutSim.total).toBe(withSim.total - 1);
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    expect((await getFilterOptions(project!, insight)).simulatedAnswers).toBe(1);
  });
});

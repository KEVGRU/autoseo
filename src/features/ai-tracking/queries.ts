import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { competitors, prompts } from "@/server/db/schema";
import { getSetting } from "@/server/settings";
import { getEngineAvailability, providerLabel } from "@/server/ai/engines";
import { listPromptTags, projectDefaultMarkets } from "@/server/ai/tracking/prompts";
import {
  countSimulatedAnswers,
  getCompetitorSeries,
  getCountryRows,
  getDailySeries,
  getLatestRun,
  getModelVersionOptions,
  getModelVersionRows,
  getPromptAddedMarkers,
  getPromptFlow,
  getPromptRows,
  getPromptsPerDay,
  getSurfaceOverlap,
  getTrackerKpis,
  type TrackerFilter,
} from "@/server/ai/metrics";
import { getEngine } from "@/lib/engines";
import { getCountry } from "@/lib/countries";
import { parseBrandScope } from "@/features/ai-insights/lib/metrics";
import { resolveRange } from "./period";
import type { CompetitorOption, EngineAvailabilityView, KpiKey, TagOption } from "./types";
import type { TrackerView } from "./components/tracker-overview";

const FUNNELS = ["tofu", "mofu", "bofu"];

/** Filter options of the tracker's prompt slices and markets (only values that exist). */
export async function trackerSliceOptions(projectId: string) {
  const [attrs, answerMarkets, modelVersions] = await Promise.all([
    db
      .select({ country: prompts.country, markets: prompts.markets, funnel: prompts.funnelStage, intent: prompts.intent, persona: prompts.persona })
      .from(prompts)
      .where(eq(prompts.projectId, projectId)),
    db.execute(sql`select distinct country from ai_answers where project_id = ${projectId}`),
    getModelVersionOptions(projectId),
  ]);
  const markets = new Set<string>();
  const intents = new Set<string>();
  const personas = new Set<string>();
  const funnels = new Set<string>();
  for (const p of attrs) {
    for (const m of p.markets?.length ? p.markets : [p.country]) markets.add(m);
    if (p.intent?.trim()) intents.add(p.intent.trim());
    if (p.persona?.trim()) personas.add(p.persona.trim());
    if (p.funnel) funnels.add(p.funnel);
  }
  for (const r of answerMarkets as unknown as { country: string }[]) markets.add(r.country);
  return {
    markets: [...markets].filter((m) => getCountry(m)).sort(),
    funnels: FUNNELS.filter((f) => funnels.has(f)),
    intents: [...intents].sort((a, b) => a.localeCompare(b)),
    personas: [...personas].sort((a, b) => a.localeCompare(b)),
    modelVersions,
  };
}

export type SearchParams = Record<string, string | string[] | undefined>;

export function one(sp: SearchParams, key: string): string {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export function listParam(sp: SearchParams, key: string): string[] {
  return one(sp, key)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function engineAvailabilityView(workspaceId: string): Promise<EngineAvailabilityView[]> {
  const list = await getEngineAvailability({ workspaceId });
  return list.map((a) => ({
    id: a.id,
    name: a.name,
    vendor: a.vendor,
    provider: a.provider,
    providerLabel: providerLabel(a.provider),
    configured: a.configured,
    simulated: a.simulated,
    status: a.status,
    reason: a.reason,
    adminHref: a.adminHref,
    providers: a.providers,
  }));
}

export async function competitorOptions(projectId: string): Promise<CompetitorOption[]> {
  return db
    .select({ id: competitors.id, name: competitors.name, domain: competitors.domain, color: competitors.color })
    .from(competitors)
    .where(and(eq(competitors.projectId, projectId), eq(competitors.tracked, true)))
    .orderBy(competitors.name);
}

const VIEWS: TrackerView[] = ["trends", "breakdown", "flow", "locations", "surfaces", "models"];
const KPIS: KpiKey[] = ["visibility", "mentionRate", "citationRate", "position"];

/** Everything the tracker page needs, computed for the current URL state. */
export async function loadTrackerData(project: { id: string; workspaceId: string; engines: string[]; country: string; settings?: unknown }, sp: SearchParams) {
  const view = (VIEWS.includes(one(sp, "view") as TrackerView) ? one(sp, "view") : "trends") as TrackerView;
  const kpi = (KPIS.includes(one(sp, "kpi") as KpiKey) ? one(sp, "kpi") : "visibility") as KpiKey;
  const period = resolveRange(one(sp, "period") || "30d", one(sp, "from"), one(sp, "to"));
  const engines = listParam(sp, "engines").filter((e) => getEngine(e));

  const [tags, comps, availability, limits, sliceOptions] = await Promise.all([
    listPromptTags(project.id) as Promise<TagOption[]>,
    competitorOptions(project.id),
    engineAvailabilityView(project.workspaceId),
    getSetting("limits"),
    trackerSliceOptions(project.id),
  ]);
  const tagIds = new Set(tags.map((t) => t.id));
  const compIds = new Set(comps.map((c) => c.id));
  const tagSel = listParam(sp, "tags").filter((t) => tagIds.has(t));
  const compare = listParam(sp, "compare").filter((c) => c === "prev" || compIds.has(c));
  const brandScope = parseBrandScope(one(sp, "brands"));
  const markets = listParam(sp, "markets").filter((m) => sliceOptions.markets.includes(m));
  const funnels = listParam(sp, "funnel").filter((v) => sliceOptions.funnels.includes(v));
  const intents = listParam(sp, "intent").filter((v) => sliceOptions.intents.includes(v));
  const personas = listParam(sp, "persona").filter((v) => sliceOptions.personas.includes(v));
  const knownModels = new Set(sliceOptions.modelVersions.map((m) => m.model));
  const modelVersions = listParam(sp, "mv").filter((v) => knownModels.has(v));
  const excludeSimulated = one(sp, "simulated") === "exclude";

  const filter: TrackerFilter = {
    projectId: project.id,
    engines,
    tagIds: tagSel,
    brandScope,
    countries: markets,
    funnelStages: funnels,
    intents,
    personas,
    modelVersions,
    excludeSimulated,
  };

  // Prompt table (separate filters, finseo-style)
  const status = one(sp, "status") === "archived" ? "archived" : "active";
  const tPeriod = resolveRange(one(sp, "tperiod") || "7d");
  const tloc = getCountry(one(sp, "tloc")) ? one(sp, "tloc") : "";
  const teng = listParam(sp, "teng").filter((e) => getEngine(e));
  const ttags = listParam(sp, "ttags").filter((t) => tagIds.has(t));
  const tableFilter: TrackerFilter = {
    projectId: project.id,
    status,
    countries: tloc ? [tloc] : undefined,
    engines: teng,
    tagIds: ttags,
    brandScope,
    excludeSimulated,
  };

  const [kpis, series, prevSeries, compareSeries, promptsPerDay, markers, flow, countries, surfaces, modelRows, rows, latestRun, activeCount, promptCountries, simulatedCount] =
    await Promise.all([
      getTrackerKpis(filter, period),
      view === "trends" || view === "breakdown" ? getDailySeries(filter, period) : Promise.resolve([]),
      view === "trends" && compare.includes("prev") ? getDailySeries(filter, period.prev) : Promise.resolve(null),
      view === "trends" ? getCompetitorSeries(filter, period, compare.filter((c) => c !== "prev")) : Promise.resolve([]),
      view === "trends" ? getPromptsPerDay(filter, period) : Promise.resolve(null),
      view === "trends" ? getPromptAddedMarkers(project.id, period) : Promise.resolve([]),
      view === "flow" ? getPromptFlow(filter, period) : Promise.resolve(null),
      view === "locations" ? getCountryRows(filter, period) : Promise.resolve(null),
      view === "surfaces" ? getSurfaceOverlap(filter, period) : Promise.resolve(null),
      view === "models" ? getModelVersionRows(filter, period) : Promise.resolve(null),
      getPromptRows(tableFilter, tPeriod),
      getLatestRun(project.id),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(prompts)
        .where(and(eq(prompts.projectId, project.id), eq(prompts.status, "active")))
        .then((r) => r[0]?.n ?? 0),
      db
        .select({ country: prompts.country, markets: prompts.markets })
        .from(prompts)
        .where(eq(prompts.projectId, project.id))
        .then((r) => [...new Set(r.flatMap((x) => (x.markets?.length ? x.markets : [x.country])))].sort()),
      countSimulatedAnswers(filter, period),
    ]);

  return {
    view,
    kpi,
    period,
    engines,
    tagSel,
    compare,
    tags,
    comps,
    availability,
    kpis,
    series,
    prevSeries,
    compareSeries,
    promptsPerDay,
    markers,
    flow,
    countries,
    surfaces,
    modelRows,
    brandScope,
    slices: { markets, funnels, intents, personas, modelVersions },
    simulated: { exclude: excludeSimulated, count: simulatedCount },
    sliceOptions,
    defaultMarkets: projectDefaultMarkets({ country: project.country, settings: project.settings }),
    rows,
    status: status as "active" | "archived",
    latestRun,
    usage: { active: Number(activeCount), engines: project.engines.length, limit: limits.maxPromptsPerProject },
    promptCountries: promptCountries.length ? promptCountries : [project.country],
  };
}

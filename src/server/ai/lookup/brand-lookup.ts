import "server-only";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { aiLookups, projects } from "@/server/db/schema";
import { dfsPost } from "@/server/dataforseo/client";
import { runLlm } from "@/server/ai/llm";
import { answerPrompt, getEngineAvailabilityFor, providerLabel } from "@/server/ai/engines";
import { EnrichmentUnavailableError, isDataForSeoFallbackError, runEnriched } from "@/server/enrichment";
import { getCountry } from "@/lib/countries";
import type { EngineId, EngineProvider } from "@/lib/engines";
import { languageName } from "@/server/ai/knowledge/profile";
import { aggregateSample, brandForTarget, pickSampleProvider, SAMPLE_PROMPTS, type SampleAnswer, type SampleBrand } from "./sample";
import type { BrandLookupParams, BrandLookupResult, BrandLookupSample, LookupPlatform } from "@/features/ai-research/types";

export const BRAND_LOOKUP_JOB = "ai_research.brand_lookup";

/** Raw DataForSEO cost estimate (LLM Mentions: $0.10 per request + $0.001 per row). */
export const LOOKUP_COST = { base: 0.85, competitors: 0.2 };

const PLATFORMS: LookupPlatform[] = ["chat_gpt", "google"];

export type LookupTarget = { type: "domain" | "keyword"; value: string };

export function detectTarget(raw: string): LookupTarget {
  const trimmed = raw.trim();
  if (!/\s/.test(trimmed) && trimmed.includes(".")) {
    try {
      const host = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname.replace(/^www\./, "").toLowerCase();
      if (host.includes(".") && /^[a-z0-9.-]+$/.test(host)) return { type: "domain", value: host };
    } catch {
      // fall through to keyword
    }
  }
  return { type: "keyword", value: trimmed };
}

function llmTarget(t: LookupTarget, scope: "domain" | "subdomains") {
  return t.type === "domain"
    ? { domain: t.value.slice(0, 63), include_subdomains: scope === "subdomains", search_filter: "include", search_scope: ["any"] }
    : { keyword: t.value.slice(0, 250), search_filter: "include", search_scope: ["any", "brand_entities"], match_type: "word_match" };
}

type GroupElement = { key?: string; mentions?: number | null; ai_search_volume?: number | null };
type AggregatedResult = { total?: { platform?: GroupElement[] } };
type TopPagesResult = { items?: { key?: string; platform?: GroupElement[] }[] | null };
type MentionItem = {
  platform?: string;
  question?: string | null;
  sources?: { url?: string; domain?: string; title?: string | null }[] | null;
  ai_search_volume?: number | null;
  monthly_searches?: { year: number; month: number; search_volume: number | null }[] | null;
  first_response_at?: string | null;
  last_response_at?: string | null;
  brand_entities?: { title?: string | null }[] | null;
};
type SearchResult = { items?: MentionItem[] | null };
type CrossResult = { items?: { key?: string; platform?: GroupElement[] }[] | null };

function httpUrl(u: unknown): string | null {
  if (typeof u !== "string" || u.length > 2048) return null;
  try {
    const url = new URL(u);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function hostOf(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function market(platform: LookupPlatform, params: BrandLookupParams) {
  // DataForSEO only has US/English ChatGPT mention data.
  return platform === "chat_gpt" ? { location_code: 2840, language_code: "en" } : { location_code: params.locationCode, language_code: params.languageCode };
}

type LookupCtx = { projectId: string; workspaceId: string; userId: string | null };

/** DataForSEO AI Optimization (LLM Mentions database). Rejected credentials / empty balance are rethrown (AI fallback). */
async function lookupViaDataForSeo(params: BrandLookupParams, ctx: LookupCtx, spent: (usd: number) => void): Promise<BrandLookupResult> {
  const call = async <T>(path: string, body: Record<string, unknown>): Promise<T | null> => {
    const task = await dfsPost<T>(path, [body], { ...ctx, feature: "ai_brand_lookup" }, { estimatedCostUsd: 0.2 });
    spent(Number(task.cost ?? 0));
    return task.result?.[0] ?? null;
  };

  const target = detectTarget(params.query);
  const lt = llmTarget(target, params.scope);
  const chatGptInScope = params.locationCode === 2840 && params.languageCode === "en";

  const perPlatform: BrandLookupResult["perPlatform"] = [];
  const topPages: BrandLookupResult["topPages"] = [];
  const queries: BrandLookupResult["topQueries"] = [];
  const monthly = new Map<string, number>();
  let anyMentionItems = false;

  for (const platform of PLATFORMS) {
    const m = market(platform, params);
    const [agg, pages, search] = await Promise.allSettled([
      call<AggregatedResult>("/v3/ai_optimization/llm_mentions/aggregated_metrics/live", { target: [lt], platform, ...m, internal_list_limit: 20 }),
      call<TopPagesResult>("/v3/ai_optimization/llm_mentions/top_pages/live", {
        target: [lt],
        platform,
        ...m,
        links_scope: "sources",
        items_list_limit: 10,
        internal_list_limit: 5,
      }),
      call<SearchResult>("/v3/ai_optimization/llm_mentions/search/live", { target: [lt], platform, ...m, limit: 100 }),
    ]);
    for (const r of [agg, pages, search]) {
      // Missing / rejected account or empty balance: fail the lookup (runEnriched may switch to the AI sample).
      if (r.status === "rejected" && (isDataForSeoFallbackError(r.reason) || /40[12]|insufficient|credentials/i.test(String(r.reason?.message ?? r.reason)))) throw r.reason;
    }
    if (agg.status === "rejected" && pages.status === "rejected" && search.status === "rejected") {
      perPlatform.push({ platform, status: "error", mentions: null, aiSearchVolume: null, error: String(agg.reason?.message ?? agg.reason).slice(0, 300) });
      continue;
    }
    const group = agg.status === "fulfilled" ? agg.value?.total?.platform?.find((g) => g.key === platform) : undefined;
    perPlatform.push({
      platform,
      status: "ok",
      mentions: group?.mentions != null ? Math.round(group.mentions) : agg.status === "fulfilled" ? 0 : null,
      aiSearchVolume: group?.ai_search_volume != null ? Math.round(group.ai_search_volume) : agg.status === "fulfilled" ? 0 : null,
      locationNote: platform === "chat_gpt" && !chatGptInScope ? "ChatGPT data is only available for the US (English)." : undefined,
    });

    const mentionItems = search.status === "fulfilled" ? (search.value?.items ?? []) : [];
    if (mentionItems.length) anyMentionItems = true;
    for (const it of mentionItems) {
      for (const ms of it.monthly_searches ?? []) {
        if (!ms?.year || !ms.month) continue;
        const k = `${ms.year}-${String(ms.month).padStart(2, "0")}`;
        monthly.set(k, (monthly.get(k) ?? 0) + (ms.search_volume ?? 0));
      }
    }
    // Cited sources
    const platformPages: BrandLookupResult["topPages"] = [];
    for (const item of pages.status === "fulfilled" ? (pages.value?.items ?? []) : []) {
      const url = httpUrl(item.key);
      if (!url) continue;
      const g = item.platform?.find((x) => x.key === platform) ?? item.platform?.[0];
      const prompts = mentionItems
        .filter((mi) => mi.question && (mi.sources ?? []).some((s) => s.url === url))
        .sort((a, b) => (b.ai_search_volume ?? 0) - (a.ai_search_volume ?? 0))
        .slice(0, 50)
        .map((mi) => mi.question!.slice(0, 500));
      const domain = hostOf(url);
      platformPages.push({
        url,
        domain,
        platform,
        mentions: g?.mentions ?? null,
        capturedVolume: g?.ai_search_volume ?? null,
        prompts,
        isTarget: target.type === "domain" && (domain === target.value || domain.endsWith(`.${target.value}`)),
      });
    }
    topPages.push(...platformPages.slice(0, 10));
    // Queries
    const platformQueries = mentionItems
      .filter((mi) => mi.question?.trim())
      .sort((a, b) => (b.ai_search_volume ?? 0) - (a.ai_search_volume ?? 0))
      .slice(0, 25)
      .map((mi) => ({
        question: mi.question!.trim().slice(0, 500),
        platform,
        aiSearchVolume: mi.ai_search_volume ?? null,
        firstSeenAt: mi.first_response_at ?? null,
        lastSeenAt: mi.last_response_at ?? null,
        citedSources: (mi.sources ?? [])
          .map((s) => ({ url: httpUrl(s.url), domain: s.domain ?? "", title: s.title?.slice(0, 300) ?? null }))
          .filter((s): s is { url: string; domain: string; title: string | null } => !!s.url)
          .slice(0, 10),
        brandsMentioned: [...new Set((mi.brand_entities ?? []).map((b) => b.title?.trim()).filter((t): t is string => !!t))].slice(0, 20),
      }));
    queries.push(...platformQueries);
  }

  // Share of voice
  let shareOfVoice: BrandLookupResult["shareOfVoice"] = null;
  const seen = new Set<string>([target.value.toLowerCase()]);
  const comps = params.competitors
    .map((c) => detectTarget(c))
    .filter((c) => c.value && !seen.has(c.value.toLowerCase()) && (seen.add(c.value.toLowerCase()), true))
    .slice(0, 5);
  if (comps.length) {
    const groups = [{ key: target.value, t: target }, ...comps.map((c) => ({ key: c.value, t: c }))];
    const totals = new Map<string, number | null>(groups.map((g) => [g.key, null]));
    const okPlatforms: LookupPlatform[] = [];
    for (const platform of PLATFORMS) {
      if (platform === "chat_gpt" && !chatGptInScope) continue;
      try {
        const res = await call<CrossResult>("/v3/ai_optimization/llm_mentions/cross_aggregated_metrics/live", {
          targets: groups.map((g) => ({ aggregation_key: g.key.slice(0, 250), target: [llmTarget(g.t, params.scope)] })),
          platform,
          ...market(platform, params),
          internal_list_limit: 5,
        });
        okPlatforms.push(platform);
        for (const item of res?.items ?? []) {
          if (!item.key || !totals.has(item.key)) continue;
          const sum = (item.platform ?? []).reduce((a, g) => a + (g.mentions ?? 0), 0);
          totals.set(item.key, (totals.get(item.key) ?? 0) + sum);
        }
      } catch (err) {
        if (isDataForSeoFallbackError(err) || /40[12]|insufficient|credentials/i.test(String((err as Error).message))) throw err;
        console.warn("[brand-lookup] cross aggregated failed", platform, err);
      }
    }
    if (okPlatforms.length) {
      const denom = [...totals.values()].reduce<number>((a, v) => a + (v ?? 0), 0);
      const entries = groups
        .map((g) => {
          const mentions = totals.get(g.key) ?? null;
          return { key: g.key, label: g.key, mentions, sharePct: mentions == null || denom <= 0 ? null : (mentions / denom) * 100, isTarget: g.key === target.value };
        })
        .sort((a, b) => (b.mentions ?? -1) - (a.mentions ?? -1));
      shareOfVoice = { entries, platforms: okPlatforms };
    }
  }

  const counted = perPlatform.filter((p) => p.status === "ok" && (p.platform !== "chat_gpt" || chatGptInScope));
  const sumNullable = (vals: (number | null)[]) => (vals.some((v) => v != null) ? vals.reduce<number>((a, v) => a + (v ?? 0), 0) : null);
  const topQueries = queries.sort((a, b) => (b.aiSearchVolume ?? 0) - (a.aiSearchVolume ?? 0));
  const sortedPages = topPages.sort((a, b) => (b.capturedVolume ?? 0) - (a.capturedVolume ?? 0) || (b.mentions ?? 0) - (a.mentions ?? 0));
  const monthlyVolume = [...monthly.entries()]
    .map(([month, volume]) => ({ month, volume }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);
  const result: BrandLookupResult = {
    target,
    perPlatform,
    totalMentions: sumNullable(counted.map((p) => p.mentions)),
    totalAiSearchVolume: sumNullable(counted.map((p) => p.aiSearchVolume)),
    topPages: sortedPages,
    topQueries,
    monthlyVolume,
    shareOfVoice,
    hasData:
      perPlatform.some((p) => (p.mentions ?? 0) > 0) || sortedPages.length > 0 || topQueries.length > 0 || monthlyVolume.length > 0 || anyMentionItems || !!shareOfVoice,
    fetchedAt: new Date().toISOString(),
    source: "dataforseo",
  };
  return result;
}

/** Engines sampled per Brand Lookup platform when the LLM Mentions database is unavailable. */
const SAMPLE_ENGINES: { platform: LookupPlatform; engine: EngineId }[] = [
  { platform: "chat_gpt", engine: "chatgpt" },
  { platform: "google", engine: "ai_overview" },
];
/**
 * Stop starting new answers after this long (prompt generation included) so the job (20 min timeout) finishes with
 * what it has even when in-flight answers take a few minutes; the result reports how many answers were collected.
 */
const SAMPLE_BUDGET_MS = 12 * 60_000;
const SAMPLE_CONCURRENCY = 6;

const samplePromptsSchema = z.object({
  category: z.string().nullable().optional(),
  prompts: z.array(z.union([z.string(), z.object({ text: z.string() })])),
});

/** Category/buyer prompts (mostly unbranded) a customer of the target's category would ask an AI assistant. */
async function generateSamplePrompts(
  params: BrandLookupParams,
  target: BrandLookupResult["target"],
  competitors: string[],
  ctx: LookupCtx,
): Promise<{ category: string | null; prompts: string[] }> {
  const country = getCountry(params.country)?.name ?? params.country;
  const language = languageName(params.languageCode);
  const res = await runLlm({
    purpose: "ai_brand_lookup_prompts",
    webSearch: true,
    agentMode: "lean",
    timeoutMs: 3 * 60_000,
    maxTokens: 3000,
    projectId: ctx.projectId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    schema: samplePromptsSchema,
    prompt: [
      `Brand to research: ${target.type === "domain" ? `the website ${target.value}` : `"${target.value}"`}${competitors.length ? ` (competitors: ${competitors.join(", ")})` : ""}.`,
      "First find out (web search if needed) what this brand offers and which product/service category it competes in.",
      `Then write ${SAMPLE_PROMPTS.default} realistic questions that potential buyers in ${country} ask AI assistants such as ChatGPT or Google's AI Overview when looking for products or services in that category — in ${language}.`,
      "Mix discovery (\"best …\", \"which … should I buy\"), comparison and problem/need questions across the buying journey.",
      "At most 2 questions may name the brand; all others must NOT name the brand or its competitors, so the answers show whether AI recommends the brand on its own.",
      'JSON shape: {"category":"…","prompts":["…"]}',
    ].join("\n"),
  });
  const seen = new Set<string>();
  const prompts: string[] = [];
  for (const p of res.data.prompts) {
    const text = (typeof p === "string" ? p : p.text).replace(/\s+/g, " ").trim().slice(0, 300);
    const key = text.toLowerCase();
    if (text.length < 8 || seen.has(key)) continue;
    seen.add(key);
    prompts.push(text);
    if (prompts.length >= SAMPLE_PROMPTS.max) break;
  }
  if (prompts.length < 3) throw new Error("Could not generate sample prompts for this brand. Try the brand name instead of the domain (or vice versa).");
  const category = typeof res.data.category === "string" ? res.data.category.trim().slice(0, 120) || null : null;
  return { category, prompts };
}

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) await fn(items[next++]!);
    }),
  );
}

/**
 * AI sample (no DataForSEO LLM Mentions): generates buyer prompts for the target's category, asks them to ChatGPT and
 * Google AI Overview through non-DataForSEO providers (direct API, local agent or AI simulation) and counts how many
 * answers name or cite the target and its competitors. Directional only: no AI search volume, no trend.
 */
async function lookupViaAiSample(
  params: BrandLookupParams,
  ctx: LookupCtx,
  project: typeof projects.$inferSelect,
  spent: (usd: number) => void,
): Promise<BrandLookupResult> {
  const started = Date.now();
  const target = detectTarget(params.query);
  const isOwn =
    (target.type === "domain" && (target.value === project.domain || target.value.endsWith(`.${project.domain}`))) ||
    (target.type === "keyword" && target.value.toLowerCase() === project.name.toLowerCase());
  const ownAliases = isOwn ? [project.name, ...(project.brand?.aliases ?? [])] : [];
  const seen = new Set<string>([target.value.toLowerCase()]);
  const comps = params.competitors
    .map((c) => detectTarget(c))
    .filter((c) => c.value && !seen.has(c.value.toLowerCase()) && (seen.add(c.value.toLowerCase()), true))
    .slice(0, 5);
  const brands: SampleBrand[] = [
    brandForTarget(target, { key: "target", isTarget: true, aliases: ownAliases }),
    ...comps.map((c, i) => brandForTarget(c, { key: `c${i}`, isTarget: false })),
  ];

  const engines: { platform: LookupPlatform; engine: EngineId; provider: EngineProvider | null }[] = [];
  for (const e of SAMPLE_ENGINES) {
    const avail = await getEngineAvailabilityFor(e.engine, { workspaceId: ctx.workspaceId });
    engines.push({ ...e, provider: pickSampleProvider<EngineProvider>(avail) });
  }
  const usable = engines.filter((e) => e.provider);
  if (!usable.length) {
    throw new EnrichmentUnavailableError(
      "No AI engine can answer sample prompts without DataForSEO. Connect a local agent or add an AI API key and allow AI simulation of engines (Admin → AI Providers).",
      "llm_mentions",
    );
  }

  const { category, prompts } = await generateSamplePrompts(params, target, comps.map((c) => c.value), ctx);
  // Interleaved (prompt × platform) so a time-boxed run still samples every platform.
  const tasks = prompts.flatMap((prompt) => usable.map((e) => ({ ...e, prompt })));
  const answers: SampleAnswer[] = [];
  const models = new Map<LookupPlatform, Set<string>>();
  const errors = new Map<LookupPlatform, string>();
  let failed = 0;
  await mapLimit(tasks, SAMPLE_CONCURRENCY, async (t) => {
    if (Date.now() - started > SAMPLE_BUDGET_MS) return;
    try {
      const res = await answerPrompt({
        engine: t.engine,
        prompt: t.prompt,
        country: params.country,
        language: params.languageCode,
        project: { id: project.id, workspaceId: project.workspaceId, name: project.name, domain: project.domain },
        provider: t.provider!,
        userId: ctx.userId,
      });
      spent(res.costUsd);
      answers.push({ prompt: t.prompt, platform: t.platform, text: res.text, citations: res.citations.map((c) => ({ url: c.url, title: c.title })) });
      if (!models.has(t.platform)) models.set(t.platform, new Set());
      models.get(t.platform)!.add(res.model);
    } catch (err) {
      failed++;
      errors.set(t.platform, (err instanceof Error ? err.message : String(err)).slice(0, 300));
    }
  });
  if (!answers.length) throw new Error(`No AI engine answered the sample prompts: ${[...errors.values()][0] ?? "unknown error"}`);

  const answered = new Set(answers.map((a) => a.platform));
  const fetchedAt = new Date().toISOString();
  const aggregate = aggregateSample({
    target,
    brands,
    platforms: engines.map((e) =>
      answered.has(e.platform)
        ? { platform: e.platform, status: "ok" as const }
        : { platform: e.platform, status: "error" as const, error: e.provider ? (errors.get(e.platform) ?? "No answers") : "No provider without DataForSEO" },
    ),
    answers,
    fetchedAt,
  });
  const sample: BrandLookupSample = {
    category,
    prompts: prompts.length,
    answers: answers.length,
    failed,
    engines: usable.map((e) => ({
      platform: e.platform,
      engine: e.engine,
      provider: e.provider!,
      providerLabel: providerLabel(e.provider),
      models: [...(models.get(e.platform) ?? [])],
      answers: answers.filter((a) => a.platform === e.platform).length,
    })),
  };
  return { target, ...aggregate, fetchedAt, source: "ai_sample", sample };
}

/**
 * Brand Lookup job: DataForSEO LLM Mentions when that serves `llm_mentions` (Admin → Data Providers), otherwise — or
 * when DataForSEO rejects the account in auto mode — an AI sample of buyer prompts (`result.source = "ai_sample"`).
 */
export async function runBrandLookup(lookupId: string) {
  const [row] = await db.select().from(aiLookups).where(eq(aiLookups.id, lookupId)).limit(1);
  if (!row || row.kind !== "brand_lookup") return { skipped: "lookup not found" };
  const [project] = await db.select().from(projects).where(eq(projects.id, row.projectId)).limit(1);
  if (!project) return { skipped: "project deleted" };
  await db.update(aiLookups).set({ status: "running" }).where(eq(aiLookups.id, lookupId));
  const params = row.params as unknown as BrandLookupParams;
  const ctx: LookupCtx = { projectId: row.projectId, workspaceId: project.workspaceId, userId: row.createdBy };
  let cost = 0;
  const spent = (usd: number) => {
    cost += Number.isFinite(usd) ? usd : 0;
  };

  try {
    const enriched = await runEnriched(
      { ...ctx, feature: "ai_brand_lookup", capability: "llm_mentions" },
      {
        dataforseo: () => lookupViaDataForSeo(params, ctx, spent),
        ai: () => lookupViaAiSample(params, ctx, project, spent),
      },
    );
    const result =
      enriched.fallbackReason && enriched.data.sample ? { ...enriched.data, sample: { ...enriched.data.sample, fallbackReason: enriched.fallbackReason.slice(0, 300) } } : enriched.data;
    await db
      .update(aiLookups)
      .set({ status: "done", result: result as unknown as Record<string, unknown>, costUsd: cost, finishedAt: new Date(), error: null })
      .where(and(eq(aiLookups.id, lookupId)));
    return { cost, hasData: result.hasData, source: result.source };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.update(aiLookups).set({ status: "failed", error: message.slice(0, 1000), costUsd: cost, finishedAt: new Date() }).where(eq(aiLookups.id, lookupId));
    throw err;
  }
}

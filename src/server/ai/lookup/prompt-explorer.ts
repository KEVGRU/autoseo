import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { aiLookups, projects } from "@/server/db/schema";
import { dfsGet, dfsPost } from "@/server/dataforseo/client";
import { getDfsCredentials } from "@/server/dataforseo/credentials";
import { availableLlmProviders, runLlm } from "@/server/ai/llm";
import { answerPrompt, getEngineAvailabilityFor, providerLabel } from "@/server/ai/engines";
import { resolveEnrichmentProvider, runEnriched } from "@/server/enrichment";
import { getCountry } from "@/lib/countries";
import type { EngineId, EngineProvider } from "@/lib/engines";
import { citationMatchesBrand, textMentionsBrand } from "@/features/ai-research/lib/brand-match";
import type { ExplorerAnswer, ExplorerCitation, ExplorerModel, ExplorerModelAvailability, ExplorerParams, ExplorerResult } from "@/features/ai-research/types";
import { pickSampleProvider } from "./sample";

export const PROMPT_EXPLORER_JOB = "ai_research.prompt_explorer";
export const MAX_EXPLORER_PROMPT = 500;

type DfsModel = Exclude<ExplorerModel, "autoseo">;

/** Tracking engine behind each Prompt Explorer model (used when DataForSEO does not answer). */
const MODEL_ENGINE: Record<DfsModel, EngineId> = { chat_gpt: "chatgpt", claude: "claude", gemini: "gemini", perplexity: "perplexity" };
const MODEL_LABEL: Record<DfsModel, string> = { chat_gpt: "ChatGPT", claude: "Claude", gemini: "Gemini", perplexity: "Perplexity" };

type ExplorerCtx = { projectId: string; workspaceId: string; userId: string | null; project: { id: string; workspaceId: string; name: string; domain: string } };

const PREFERRED: Record<DfsModel, string[]> = {
  chat_gpt: ["gpt-5", "gpt-4.1", "gpt-4o"],
  claude: ["claude-sonnet-4-5", "claude-sonnet-4-6", "claude-sonnet-4-0", "claude-3-7-sonnet-latest"],
  gemini: ["gemini-2.5-pro", "gemini-2.5-flash"],
  perplexity: ["sonar-reasoning-pro", "sonar-pro", "sonar"],
};

const CLAUDE_COUNTRIES = new Set("AR AT AU BE BR CA CH CL CN DE DK ES FI FR GB HK ID IN IT JP KR MX MY NL NO NZ PH PL PT RU SA SE TR TW US ZA".split(" "));

type ModelInfo = { model_name: string; reasoning?: boolean; web_search_supported?: boolean };
/** Keyed by `${login}:${slug}` — workspaces may use their own DataForSEO accounts. */
const modelCache = new Map<string, { at: number; list: ModelInfo[] }>();

/** Picks the model name: preferred list ∩ DataForSEO's (free) models endpoint, cached 12h per DataForSEO account. */
async function resolveModel(slug: DfsModel, ctx: { projectId: string; workspaceId: string | null }): Promise<{ name: string; reasoning: boolean }> {
  const key = `${(await getDfsCredentials({ workspaceId: ctx.workspaceId, projectId: ctx.projectId }))?.login ?? "-"}:${slug}`;
  let cached = modelCache.get(key);
  if (!cached || Date.now() - cached.at > 12 * 3600_000) {
    try {
      const task = await dfsGet<ModelInfo>(`/v3/ai_optimization/${slug}/llm_responses/models`, { projectId: ctx.projectId, workspaceId: ctx.workspaceId, feature: "ai_prompt_explorer" });
      cached = { at: Date.now(), list: (task.result ?? []).filter((m) => m?.model_name) };
      modelCache.set(key, cached);
    } catch {
      cached = { at: Date.now() - 11 * 3600_000, list: [] };
    }
  }
  const names = new Map(cached.list.map((m) => [m.model_name, m]));
  for (const pref of PREFERRED[slug]) {
    const m = names.get(pref);
    if (m) return { name: m.model_name, reasoning: Boolean(m.reasoning) };
  }
  const fallback = cached.list.find((m) => m.web_search_supported) ?? cached.list[0];
  return fallback ? { name: fallback.model_name, reasoning: Boolean(fallback.reasoning) } : { name: PREFERRED[slug][0]!, reasoning: false };
}

type LlmResponse = {
  model_name?: string;
  output_tokens?: number | null;
  web_search?: boolean;
  money_spent?: number | null;
  items?: { type?: string; sections?: { type?: string; text?: string | null; annotations?: { url?: string | null; title?: string | null }[] | null }[] | null }[] | null;
  fan_out_queries?: string[] | null;
};

function cleanCitations(list: { url?: string | null; title?: string | null }[], brand: string | null): ExplorerCitation[] {
  const seen = new Set<string>();
  const out: ExplorerCitation[] = [];
  for (const c of list) {
    if (!c.url) continue;
    let u: URL;
    try {
      u = new URL(c.url);
    } catch {
      continue;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") continue;
    const url = u.toString();
    if (seen.has(url)) continue;
    seen.add(url);
    const title = c.title?.trim() || null;
    out.push({ url, domain: u.hostname.replace(/^www\./, ""), title, matchedBrand: citationMatchesBrand({ url, title }, brand) });
    if (out.length >= 25) break;
  }
  return out;
}

function splitThinking(text: string): { text: string; thinking: string | null } {
  const thinks: string[] = [];
  const rest = text.replace(/<think>([\s\S]*?)<\/think>/gi, (_, t: string) => {
    thinks.push(t.trim());
    return "";
  });
  return { text: rest.trim(), thinking: thinks.length ? thinks.join("\n\n") : null };
}

async function runDfsModel(slug: DfsModel, params: ExplorerParams, ctx: ExplorerCtx): Promise<ExplorerAnswer> {
  const started = Date.now();
  const { name } = await resolveModel(slug, ctx);
  const iso = params.country === "UK" ? "GB" : params.country;
  const body: Record<string, unknown> = { user_prompt: params.prompt.slice(0, MAX_EXPLORER_PROMPT), model_name: name, max_output_tokens: 4096 };
  if (slug !== "perplexity") body.web_search = params.webSearch;
  if (params.webSearch && iso) {
    if (slug === "chat_gpt") body.web_search_country_iso_code = iso;
    if (slug === "claude" && CLAUDE_COUNTRIES.has(iso)) body.web_search_country_iso_code = iso;
  }
  if (slug === "perplexity" && iso) body.web_search_country_iso_code = iso;
  const task = await dfsPost<LlmResponse>(
    `/v3/ai_optimization/${slug}/llm_responses/live`,
    [body],
    { projectId: ctx.projectId, workspaceId: ctx.workspaceId, userId: ctx.userId, feature: "ai_prompt_explorer" },
    { timeoutMs: 180_000, estimatedCostUsd: 0.05 },
  );
  const r = task.result?.[0] ?? {};
  const messageParts: string[] = [];
  const reasoningParts: string[] = [];
  const annotations: { url?: string | null; title?: string | null }[] = [];
  for (const item of r.items ?? []) {
    for (const s of item.sections ?? []) {
      if (!s.text) continue;
      if (item.type === "reasoning") reasoningParts.push(s.text);
      else if (item.type === "message") {
        messageParts.push(s.text);
        annotations.push(...(s.annotations ?? []));
      }
    }
  }
  const split = splitThinking(messageParts.join("\n\n"));
  const citations = cleanCitations(annotations, params.highlightBrand);
  const thinking = [reasoningParts.join("\n\n").trim(), split.thinking].filter(Boolean).join("\n\n") || null;
  const brandMentioned = params.highlightBrand ? citations.some((c) => c.matchedBrand) || Boolean(textMentionsBrand(split.text, params.highlightBrand)) : null;
  return {
    model: slug,
    status: "ok",
    provider: "dataforseo",
    providerLabel: "DataForSEO",
    modelName: r.model_name ?? name,
    text: split.text,
    thinking,
    citations,
    fanOutQueries: (r.fan_out_queries ?? []).filter((q) => typeof q === "string").slice(0, 20),
    outputTokens: r.output_tokens ?? null,
    webSearch: slug === "perplexity" ? true : Boolean(r.web_search ?? params.webSearch),
    brandMentioned,
    costUsd: Number(task.cost ?? 0),
    durationMs: Date.now() - started,
  };
}

/** Provider that answers a model without DataForSEO (direct API, local agent or AI simulation), or null. */
async function engineProviderFor(slug: DfsModel, workspaceId: string): Promise<{ provider: EngineProvider | null; reason: string }> {
  const avail = await getEngineAvailabilityFor(MODEL_ENGINE[slug], { workspaceId });
  const provider = pickSampleProvider<EngineProvider>(avail);
  return { provider, reason: provider ? providerLabel(provider) : (avail?.reason ?? "No provider available.") };
}

/** Answers a model through the AI tracking engines (`answerPrompt`) with a non-DataForSEO provider. */
async function runViaEngine(slug: DfsModel, params: ExplorerParams, ctx: ExplorerCtx): Promise<ExplorerAnswer> {
  const started = Date.now();
  const { provider, reason } = await engineProviderFor(slug, ctx.workspaceId);
  if (!provider) throw new Error(`${MODEL_LABEL[slug]} is not available without DataForSEO: ${reason}`);
  const market = params.country === "GB" ? "UK" : params.country;
  const res = await answerPrompt({
    engine: MODEL_ENGINE[slug],
    prompt: params.prompt.slice(0, MAX_EXPLORER_PROMPT),
    country: market,
    language: getCountry(market)?.language ?? "en",
    project: ctx.project,
    provider,
    userId: ctx.userId,
  });
  const split = splitThinking(res.text);
  const citations = cleanCitations(res.citations, params.highlightBrand);
  const simulated = res.provider === "ai" || res.raw?.simulated === true;
  return {
    model: slug,
    status: "ok",
    provider: res.provider,
    providerLabel: providerLabel(res.provider),
    simulated,
    modelName: res.model,
    text: split.text,
    thinking: split.thinking,
    citations,
    fanOutQueries: res.fanouts.filter((q) => typeof q === "string").slice(0, 20),
    outputTokens: null,
    // Engine providers always answer with web search (the engine's own behaviour).
    webSearch: true,
    brandMentioned: params.highlightBrand ? citations.some((c) => c.matchedBrand) || Boolean(textMentionsBrand(split.text, params.highlightBrand)) : null,
    costUsd: res.costUsd,
    durationMs: Date.now() - started,
  };
}

/**
 * ChatGPT / Claude / Gemini / Perplexity: DataForSEO LLM Responses when DataForSEO serves `llm_answers`, otherwise —
 * or when DataForSEO rejects the account in auto mode — the tracking engine through a direct API, local agent or AI
 * simulation (the answer shows which provider answered).
 */
async function runModel(slug: DfsModel, params: ExplorerParams, ctx: ExplorerCtx): Promise<ExplorerAnswer> {
  const res = await runEnriched(
    { projectId: ctx.projectId, workspaceId: ctx.workspaceId, userId: ctx.userId, feature: "ai_prompt_explorer", capability: "llm_answers" },
    { dataforseo: () => runDfsModel(slug, params, ctx), ai: () => runViaEngine(slug, params, ctx) },
  );
  return res.fallbackReason ? { ...res.data, fallbackReason: res.fallbackReason.slice(0, 300) } : res.data;
}

async function runInternal(params: ExplorerParams, ctx: ExplorerCtx): Promise<ExplorerAnswer> {
  const started = Date.now();
  const res = await runLlm({
    purpose: "prompt_explorer",
    timeoutMs: 8 * 60_000,
    prompt: params.prompt,
    webSearch: params.webSearch,
    projectId: ctx.projectId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    maxTokens: 4096,
  });
  const split = splitThinking(res.text);
  const citations = cleanCitations(res.citations, params.highlightBrand);
  return {
    model: "autoseo",
    status: "ok",
    provider: res.provider,
    providerLabel: res.provider === "agent" ? "Local agent" : `${res.provider.charAt(0).toUpperCase()}${res.provider.slice(1)} API`,
    modelName: res.model,
    text: split.text,
    thinking: split.thinking,
    citations,
    fanOutQueries: [],
    outputTokens: null,
    webSearch: params.webSearch,
    brandMentioned: params.highlightBrand ? citations.some((c) => c.matchedBrand) || Boolean(textMentionsBrand(split.text, params.highlightBrand)) : null,
    costUsd: 0,
    durationMs: Date.now() - started,
  };
}

/**
 * Which Prompt Explorer models can run and through what: DataForSEO when it serves `llm_answers`, otherwise the
 * engine's non-DataForSEO provider (direct API, local agent, AI simulation). `internal` = the local agent / AI API model.
 */
export async function explorerAvailability(workspaceId: string | null): Promise<{ dataforseo: boolean; internal: boolean; models: ExplorerModelAvailability }> {
  const [resolved, providers] = await Promise.all([resolveEnrichmentProvider({ capability: "llm_answers", workspaceId }), availableLlmProviders()]);
  const internal = providers.length > 0;
  const dataforseo = resolved.provider === "dataforseo";
  const slugs = Object.keys(MODEL_ENGINE) as DfsModel[];
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      if (dataforseo) return [slug, { available: true, via: "DataForSEO", simulated: false }] as const;
      if (resolved.provider !== "ai") return [slug, { available: false, via: null, simulated: false, reason: resolved.reason }] as const;
      const { provider, reason } = workspaceId ? await engineProviderFor(slug, workspaceId) : { provider: null, reason: "No workspace." };
      return [slug, provider ? { available: true, via: providerLabel(provider), simulated: provider === "ai" } : { available: false, via: null, simulated: false, reason }] as const;
    }),
  );
  const models = Object.fromEntries(entries) as ExplorerModelAvailability;
  models.autoseo = internal ? { available: true, via: "Local agent / API", simulated: false } : { available: false, via: null, simulated: false, reason: "No local agent or AI API key." };
  return { dataforseo, internal, models };
}

export async function runPromptExplorer(lookupId: string) {
  const [row] = await db.select().from(aiLookups).where(eq(aiLookups.id, lookupId)).limit(1);
  if (!row || row.kind !== "prompt_explorer") return { skipped: "lookup not found" };
  const [project] = await db.select().from(projects).where(eq(projects.id, row.projectId)).limit(1);
  if (!project) return { skipped: "project deleted" };
  await db.update(aiLookups).set({ status: "running" }).where(eq(aiLookups.id, lookupId));
  const params = row.params as unknown as ExplorerParams;
  const ctx: ExplorerCtx = {
    projectId: row.projectId,
    workspaceId: project.workspaceId,
    userId: row.createdBy,
    project: { id: project.id, workspaceId: project.workspaceId, name: project.name, domain: project.domain },
  };
  const models = [...new Set(params.models)];
  const settled = await Promise.allSettled(models.map((m) => (m === "autoseo" ? runInternal(params, ctx) : runModel(m, params, ctx))));
  const answers: ExplorerAnswer[] = settled.map((s, i) =>
    s.status === "fulfilled"
      ? s.value
      : {
          model: models[i]!,
          status: "error",
          provider: models[i] === "autoseo" ? "internal" : "unavailable",
          modelName: null,
          text: "",
          thinking: null,
          citations: [],
          fanOutQueries: [],
          outputTokens: null,
          webSearch: params.webSearch,
          brandMentioned: null,
          costUsd: 0,
          durationMs: 0,
          error: s.reason instanceof Error ? s.reason.message.slice(0, 400) : "This model is temporarily unavailable. Please try again.",
        },
  );
  const cost = answers.reduce((a, x) => a + x.costUsd, 0);
  const allFailed = answers.every((a) => a.status === "error");
  const result: ExplorerResult = { answers, fetchedAt: new Date().toISOString() };
  await db
    .update(aiLookups)
    .set({
      status: allFailed ? "failed" : "done",
      error: allFailed ? (answers[0]?.error ?? "All models failed.") : null,
      result: result as unknown as Record<string, unknown>,
      costUsd: cost,
      finishedAt: new Date(),
    })
    .where(eq(aiLookups.id, lookupId));
  return { cost, models: models.length, failed: answers.filter((a) => a.status === "error").length };
}

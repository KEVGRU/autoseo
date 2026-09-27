import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { getSetting } from "@/server/settings";
import { recordUsage } from "@/server/usage";
import type { AnswerRequest, AnswerResult } from "./types";
import { EngineUnavailableError } from "./types";
import { CitationCollector, arr, countryName, hostOf, isoCountry, num, obj, str, stripCitationMarkers, trimRaw, uniqueStrings } from "./util";
import {
  chatSearchCount,
  collectAnswerLinks,
  countResponsesSearches,
  parseChatCompletion,
  parseDashscopeGeneration,
  parseResponsesOutput,
  qwenBase,
  stripRefMarkers,
} from "./parse";

/**
 * Direct provider APIs with web search (docs verified 2026-09):
 * - OpenAI      Responses API + `web_search` tool (user_location), fan-outs from web_search_call.action.queries
 * - Anthropic   Messages API + `web_search_20260209` server tool (server-side refusal fallback)
 * - Perplexity  Agent API (`/v1/agent`, preset "fast"), results from output[type=search_results]
 * - Gemini      generateContent + google_search grounding (webSearchQueries = fan-outs)
 * - xAI         Responses API + `web_search` tool (Live Search was removed in 2026-01)
 * - Mistral     Conversations API + `web_search` tool
 * - DeepSeek    Chat completions (the API has no web search)
 * - Meta AI     Meta Model API Responses + `web_search` tool (Muse Spark); fallback: OpenRouter chat
 *               completions with the `web` plugin (same model, OpenRouter's search instead of Meta's)
 * - Qwen        DashScope text-generation with `enable_search` + `enable_source` (sources in
 *               output.search_info); models only served on the multimodal/Responses path fall back
 *               to the Responses API + `web_search` tool
 * - Kimi        Moonshot Responses API + server-side `web_search` tool (`$web_search` retires 2026-10-20)
 * - Sabiá       Maritaca chat completions + `web_search: true` (sources are cited inside the answer)
 * - Solar       Upstage chat completions (the API has no web search)
 */

const TIMEOUT_MS = 180_000;

// Approximate list prices (USD) for usage estimates: [input per 1M, output per 1M, per web search call].
const PRICE: Record<string, [number, number, number]> = {
  openai: [1.25, 10, 0.01],
  anthropic: [5, 25, 0.01],
  perplexity: [1, 1, 0.0025],
  gemini: [0.3, 2.5, 0.014],
  xai: [2, 6, 0.005],
  mistral: [1.5, 7.5, 0.03],
  deepseek: [0.3, 1.2, 0],
  meta: [1.25, 4.25, 0.0025],
  qwen: [2, 6, 0.01],
  moonshot: [3, 15, 0.005],
  maritaca: [0.97, 3.9, 0.005],
  upstage: [0.09, 0.36, 0],
};

function estimate(provider: keyof typeof PRICE, input: number, output: number, searches: number): number {
  const [i, o, s] = PRICE[provider]!;
  return Math.round(((input * i + output * o) / 1_000_000 + searches * s) * 1e6) / 1e6;
}

async function track(req: AnswerRequest, provider: string, model: string, costUsd: number, units: number) {
  await recordUsage({
    provider,
    feature: "ai_tracking",
    endpoint: `${req.engine}:${model}`,
    units: Math.max(1, units),
    costUsd,
    projectId: req.project.id,
    workspaceId: req.project.workspaceId,
    userId: req.userId ?? null,
  });
}

function localeHint(req: AnswerRequest): string {
  return `The user is located in ${countryName(req.country)}. Answer in the language of the question.`;
}

async function postJson(url: string, headers: Record<string, string>, body: unknown, label: string): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    throw new Error(`${label} request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  const textBody = await res.text();
  if (!res.ok) {
    if (res.status === 401 || res.status === 403)
      throw new EngineUnavailableError(`${label} rejected the API key (${res.status}). Check Admin → AI Providers.`, "not_configured");
    let message = textBody.slice(0, 400);
    try {
      const j = JSON.parse(textBody) as Record<string, unknown>;
      const e = obj(j.error);
      message = str(e.message) ?? str(j.message) ?? str(j.detail) ?? message;
    } catch {
      // keep raw text
    }
    const err = new Error(`${label} HTTP ${res.status}: ${message}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  try {
    return JSON.parse(textBody) as Record<string, unknown>;
  } catch {
    throw new Error(`${label} returned invalid JSON.`);
  }
}

function emptyGuard(text: string, label: string) {
  if (!text.trim()) throw new EngineUnavailableError(`${label} returned an empty answer.`, "no_answer");
}

/* ───────────────────────────── OpenAI (ChatGPT) ───────────────────────────── */

/** `instructions` replaces the default (none) — used by the AI simulation persona. */
export async function openaiAnswer(req: AnswerRequest, apiKey: string, model: string, instructions?: string): Promise<AnswerResult> {
  const client = new OpenAI({ apiKey, timeout: TIMEOUT_MS, maxRetries: 1 });
  const res = await client.responses.create({
    model,
    ...(instructions ? { instructions } : {}),
    input: req.prompt,
    tools: [{ type: "web_search", user_location: { type: "approximate", country: isoCountry(req.country) } }],
    include: ["web_search_call.action.sources"],
  });
  const cites = new CitationCollector();
  const fanouts: string[] = [];
  let searches = 0;
  for (const item of res.output) {
    if (item.type === "web_search_call") {
      searches++;
      if (item.action.type === "search") {
        fanouts.push(...(item.action.queries ?? []), ...(item.action.query ? [item.action.query] : []));
      }
    } else if (item.type === "message") {
      for (const part of item.content) {
        if (part.type !== "output_text") continue;
        for (const a of part.annotations ?? []) if (a.type === "url_citation") cites.add(a.url, a.title);
      }
    }
  }
  const text = res.output_text ?? "";
  emptyGuard(text, "OpenAI");
  const usage = res.usage;
  const costUsd = estimate("openai", usage?.input_tokens ?? 0, usage?.output_tokens ?? 0, searches);
  await track(req, "openai", res.model, costUsd, (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0));
  return {
    text,
    citations: cites.list,
    fanouts: uniqueStrings(fanouts),
    shopping: [],
    ads: [],
    model: res.model,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: "openai/responses", id: res.id, usage, searches }),
  };
}

/* ───────────────────────────── Anthropic (Claude) ───────────────────────────── */

async function anthropicAnswer(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  const client = new Anthropic({ apiKey, timeout: TIMEOUT_MS, maxRetries: 1 });
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: req.prompt }];
  const tools: Anthropic.Beta.BetaToolUnion[] = [
    {
      type: "web_search_20260209",
      name: "web_search",
      max_uses: 5,
      user_location: { type: "approximate", country: isoCountry(req.country) },
    },
  ];
  const cites = new CitationCollector();
  const fanouts: string[] = [];
  const textParts: string[] = [];
  let inputTokens = 0;
  let outputTokens = 0;
  let searches = 0;
  let finalModel = model;
  // Server-side tool loops can pause (`pause_turn`); resume by sending the paused turn back.
  for (let round = 0; round < 4; round++) {
    const message = await client.beta.messages.create({
      model,
      max_tokens: 16000,
      system: localeHint(req),
      messages,
      tools,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    finalModel = message.model;
    inputTokens += message.usage.input_tokens;
    outputTokens += message.usage.output_tokens;
    searches += message.usage.server_tool_use?.web_search_requests ?? 0;
    if (message.stop_reason === "refusal") throw new Error("Claude declined to answer this prompt (refusal).");
    for (const block of message.content) {
      if (block.type === "text") {
        textParts.push(block.text);
        for (const c of block.citations ?? []) {
          if (c.type === "web_search_result_location") cites.add(c.url, c.title);
        }
      } else if (block.type === "server_tool_use" && block.name === "web_search") {
        const q = str(obj(block.input).query);
        if (q) fanouts.push(q);
      } else if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const r of block.content) if (r.type === "web_search_result") cites.add(r.url, r.title);
      }
    }
    if (message.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: message.content });
    // The paused turn's text is re-emitted on resume only for new blocks; keep what we have.
  }
  const text = textParts.join("").trim();
  emptyGuard(text, "Claude");
  const costUsd = estimate("anthropic", inputTokens, outputTokens, searches);
  await track(req, "anthropic", finalModel, costUsd, inputTokens + outputTokens);
  return {
    text,
    citations: cites.list,
    fanouts: uniqueStrings(fanouts),
    shopping: [],
    ads: [],
    model: finalModel,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: "anthropic/messages", inputTokens, outputTokens, searches }),
  };
}

/* ───────────────────────────── Perplexity ───────────────────────────── */

async function perplexityAnswer(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  const headers = { Authorization: `Bearer ${apiKey}` };
  const cites = new CitationCollector();
  const fanouts: string[] = [];
  // Admin may pin a legacy Sonar model ("sonar", "sonar-pro"): use the OpenAI-compatible endpoint.
  if (model.startsWith("sonar")) {
    const json = await postJson(
      "https://api.perplexity.ai/chat/completions",
      headers,
      {
        model,
        messages: [{ role: "user", content: req.prompt }],
        web_search_options: { user_location: { country: isoCountry(req.country) } },
        return_related_questions: true,
      },
      "Perplexity",
    );
    const choice = obj(arr(json.choices)[0]);
    const text = stripCitationMarkers(str(obj(choice.message).content) ?? "");
    for (const r of arr(json.search_results)) {
      const sr = obj(r);
      cites.add(sr.url, sr.title);
    }
    for (const u of arr(json.citations)) cites.add(u, null);
    emptyGuard(text, "Perplexity");
    const usage = obj(json.usage);
    const reported = num(obj(usage.cost).total_cost);
    const costUsd = reported ?? estimate("perplexity", num(usage.prompt_tokens) ?? 0, num(usage.completion_tokens) ?? 0, 1);
    await track(req, "perplexity", model, costUsd, (num(usage.total_tokens) ?? 0) as number);
    return { text, citations: cites.list, fanouts: [], shopping: [], ads: [], model: str(json.model) ?? model, provider: "api", costUsd, raw: trimRaw({ endpoint: "perplexity/sonar", usage, relatedQuestions: uniqueStrings(arr(json.related_questions), 12) }) };
  }
  // Agent API (successor of Sonar). `model` = preset name (fast/low/medium/high) or a provider model id.
  const isPreset = ["fast", "low", "medium", "high"].includes(model);
  const body: Record<string, unknown> = isPreset
    ? { preset: model, input: req.prompt, instructions: localeHint(req) }
    : {
        model,
        input: req.prompt,
        instructions: localeHint(req),
        tools: [{ type: "web_search", user_location: { country: isoCountry(req.country) } }],
      };
  let json: Record<string, unknown>;
  try {
    json = await postJson("https://api.perplexity.ai/v1/agent", headers, body, "Perplexity");
  } catch (err) {
    // Some presets reject extra fields — retry once with the minimal documented body.
    if ((err as { status?: number }).status === 400 && isPreset) {
      json = await postJson("https://api.perplexity.ai/v1/agent", headers, { preset: model, input: req.prompt }, "Perplexity");
    } else throw err;
  }
  const text = stripCitationMarkers(parseResponsesOutput(json, cites, fanouts));
  emptyGuard(text, "Perplexity");
  const usage = obj(json.usage);
  const searches = num(obj(obj(usage.tool_calls_details).search_web).invocation) ?? 1;
  const costUsd = estimate("perplexity", num(usage.input_tokens) ?? 0, num(usage.output_tokens) ?? 0, searches);
  await track(req, "perplexity", str(json.model) ?? model, costUsd, (num(usage.total_tokens) ?? 0) as number);
  return {
    text,
    citations: cites.list,
    fanouts: uniqueStrings(fanouts),
    shopping: [],
    ads: [],
    model: str(json.model) ?? `perplexity-${model}`,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: "perplexity/agent", usage }),
  };
}

/* ───────────────────────────── Gemini ───────────────────────────── */

const geminiModelCache: { id: string | null; at: number } = { id: null, at: 0 };

/** Latest stable "gemini-X-flash" model that supports generateContent (cached 24h). */
async function geminiDefaultModel(apiKey: string): Promise<string> {
  if (geminiModelCache.id && Date.now() - geminiModelCache.at < 24 * 3600_000) return geminiModelCache.id;
  let picked = "gemini-2.5-flash";
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
      headers: { "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (res.ok) {
      const json = (await res.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
      const ids = (json.models ?? [])
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => m.name.replace(/^models\//, ""))
        .filter((id) => /^gemini-\d+(\.\d+)?-flash$/.test(id))
        .sort((a, b) => b.localeCompare(a, "en", { numeric: true }));
      if (ids[0]) picked = ids[0];
    }
  } catch {
    // keep fallback
  }
  geminiModelCache.id = picked;
  geminiModelCache.at = Date.now();
  return picked;
}

/** Grounding chunk URIs are Google redirect links — resolve them to the real page (best effort). */
async function resolveRedirect(uri: string, title: string | null): Promise<string> {
  if (!/vertexaisearch\.cloud\.google\.com|grounding-api-redirect/.test(uri)) return uri;
  try {
    const res = await fetch(uri, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(6_000), cache: "no-store" });
    const loc = res.headers.get("location");
    await res.body?.cancel().catch(() => {});
    if (loc && /^https?:\/\//.test(loc)) return loc;
  } catch {
    // fall through
  }
  // The chunk title carries the domain when the redirect cannot be followed.
  return title && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(title) ? `https://${title}` : uri;
}

/** `system` replaces the default locale hint — used by the AI simulation persona. */
export async function geminiAnswer(req: AnswerRequest, apiKey: string, modelOverride: string, system?: string): Promise<AnswerResult> {
  const model = modelOverride || (await geminiDefaultModel(apiKey));
  const json = await postJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    { "x-goog-api-key": apiKey },
    {
      systemInstruction: { parts: [{ text: system ?? localeHint(req) }] },
      contents: [{ role: "user", parts: [{ text: req.prompt }] }],
      tools: [{ google_search: {} }],
    },
    "Gemini",
  );
  const cand = obj(arr(json.candidates)[0]);
  const finish = str(cand.finishReason);
  if (finish === "SAFETY" || finish === "PROHIBITED_CONTENT") throw new Error("Gemini blocked this prompt (safety).");
  const text = arr(obj(cand.content).parts)
    .map((p) => str(obj(p).text) ?? "")
    .join("")
    .trim();
  emptyGuard(text, "Gemini");
  const gm = obj(cand.groundingMetadata);
  const chunks = arr(gm.groundingChunks)
    .map((c) => obj(obj(c).web))
    .filter((w) => str(w.uri));
  const resolved = await Promise.all(chunks.slice(0, 30).map((w) => resolveRedirect(str(w.uri)!, str(w.title))));
  const cites = new CitationCollector();
  resolved.forEach((url, i) => {
    const title = str(chunks[i]!.title);
    // Titles are usually just the domain — only keep them when they add information.
    cites.add(url, title && title !== hostOf(url) ? title : null);
  });
  const queries = uniqueStrings(arr(gm.webSearchQueries));
  const usage = obj(json.usageMetadata);
  const inTok = (num(usage.promptTokenCount) ?? 0) + (num(usage.toolUsePromptTokenCount) ?? 0);
  const outTok = (num(usage.candidatesTokenCount) ?? 0) + (num(usage.thoughtsTokenCount) ?? 0);
  const costUsd = estimate("gemini", inTok, outTok, Math.max(1, queries.length));
  const finalModel = str(json.modelVersion) ?? model;
  await track(req, "gemini", finalModel, costUsd, inTok + outTok);
  return {
    text,
    citations: cites.list,
    fanouts: queries,
    shopping: [],
    ads: [],
    model: finalModel,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: "gemini/generateContent", usage, finishReason: finish }),
  };
}

/* ───────────────────────────── xAI (Grok) ───────────────────────────── */

async function grokAnswer(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  const json = await postJson(
    "https://api.x.ai/v1/responses",
    { Authorization: `Bearer ${apiKey}` },
    {
      model,
      instructions: localeHint(req),
      input: [{ role: "user", content: req.prompt }],
      tools: [{ type: "web_search" }, { type: "x_search" }],
      include: ["no_inline_citations", "web_search_call.action.sources"],
    },
    "xAI",
  );
  const cites = new CitationCollector();
  const fanouts: string[] = [];
  const text = parseResponsesOutput(json, cites, fanouts);
  for (const u of arr(json.citations)) cites.add(typeof u === "string" ? u : obj(u).url, null);
  emptyGuard(text, "Grok");
  const usage = obj(json.usage);
  const searches = num(obj(usage.server_side_tool_usage_details).web_search_calls) ?? num(usage.num_server_side_tools_used) ?? 1;
  const costUsd = estimate("xai", num(usage.input_tokens) ?? 0, num(usage.output_tokens) ?? 0, searches);
  const finalModel = str(json.model) ?? model;
  await track(req, "xai", finalModel, costUsd, (num(usage.input_tokens) ?? 0) + (num(usage.output_tokens) ?? 0));
  return {
    text,
    citations: cites.list,
    fanouts: uniqueStrings(fanouts),
    shopping: [],
    ads: [],
    model: finalModel,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: "xai/responses", usage }),
  };
}

/* ───────────────────────────── Mistral ───────────────────────────── */

async function mistralAnswer(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  const json = await postJson(
    "https://api.mistral.ai/v1/conversations",
    { Authorization: `Bearer ${apiKey}` },
    {
      model,
      inputs: req.prompt,
      instructions: localeHint(req),
      tools: [{ type: "web_search" }],
      store: false,
    },
    "Mistral",
  );
  const cites = new CitationCollector();
  const fanouts: string[] = [];
  const parts: string[] = [];
  for (const o of arr(json.outputs)) {
    const out = obj(o);
    if (out.type === "tool.execution") {
      try {
        const args = typeof out.arguments === "string" ? (JSON.parse(out.arguments) as Record<string, unknown>) : obj(out.arguments);
        fanouts.push(...uniqueStrings([args.query, ...arr(args.queries)]));
      } catch {
        // arguments are not documented — ignore
      }
    } else if (out.type === "message.output") {
      if (typeof out.content === "string") parts.push(out.content);
      for (const c of arr(out.content)) {
        const chunk = obj(c);
        if (chunk.type === "text") parts.push(str(chunk.text) ?? "");
        else if (chunk.type === "tool_reference") {
          cites.add(chunk.url, chunk.title);
          // Keep a visible reference marker position-neutral: nothing appended to text.
        }
      }
    }
  }
  const text = parts.join("").trim();
  emptyGuard(text, "Mistral");
  const usage = obj(json.usage);
  const searches = num(obj(usage.connectors).web_search) ?? (fanouts.length || 1);
  const costUsd = estimate("mistral", num(usage.prompt_tokens) ?? 0, num(usage.completion_tokens) ?? 0, searches);
  await track(req, "mistral", model, costUsd, (num(usage.total_tokens) ?? 0) as number);
  return {
    text,
    citations: cites.list,
    fanouts: uniqueStrings(fanouts),
    shopping: [],
    ads: [],
    model,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: "mistral/conversations", usage }),
  };
}

/* ───────────────────── OpenAI-compatible chat completions ───────────────────── */

type ChatCompatOptions = {
  label: string;
  /** `usage_events.provider` */
  usageProvider: string;
  price: keyof typeof PRICE;
  endpoint: string;
  url: string;
  headers: Record<string, string>;
  model: string;
  /** Provider-specific body fields (web_search flag, plugins …). */
  extra?: Record<string, unknown>;
  /** The request lets the provider search the web. Without it, citations are always empty. */
  webSearch: boolean;
  /** The provider cites its web sources as links inside the answer text. */
  linkCitations?: boolean;
};

/** One chat completion (system locale hint + user prompt) against any OpenAI-compatible API. */
async function chatCompatAnswer(req: AnswerRequest, o: ChatCompatOptions): Promise<AnswerResult> {
  const json = await postJson(
    o.url,
    o.headers,
    {
      model: o.model,
      messages: [
        { role: "system", content: localeHint(req) },
        { role: "user", content: req.prompt },
      ],
      ...o.extra,
    },
    o.label,
  );
  const cites = new CitationCollector();
  const parsed = parseChatCompletion(json, cites);
  if (o.webSearch && o.linkCitations) collectAnswerLinks(parsed.text, cites);
  const text = stripCitationMarkers(parsed.text).trim();
  emptyGuard(text, o.label);
  const usage = obj(json.usage);
  const searches = o.webSearch ? chatSearchCount(usage, 1) : 0;
  const inTok = num(usage.prompt_tokens) ?? 0;
  const outTok = num(usage.completion_tokens) ?? 0;
  // OpenRouter reports what it actually charged; everyone else gets a list-price estimate.
  const costUsd = num(usage.cost) ?? estimate(o.price, inTok, outTok, searches);
  const finalModel = str(json.model) ?? o.model;
  await track(req, o.usageProvider, finalModel, costUsd, inTok + outTok);
  return {
    text,
    // No web search → the answer comes from model knowledge; never treat anything as a citation.
    citations: o.webSearch ? cites.list : [],
    fanouts: [],
    shopping: [],
    ads: [],
    model: finalModel,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: o.endpoint, usage, searches, webSearch: o.webSearch, finishReason: parsed.finishReason }),
  };
}

/* ───────────────────── Responses API (Meta, Moonshot, DashScope) ───────────────────── */

type ResponsesOptions = {
  label: string;
  usageProvider: string;
  price: keyof typeof PRICE;
  endpoint: string;
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown> & { model: string };
};

async function responsesAnswer(req: AnswerRequest, o: ResponsesOptions): Promise<AnswerResult> {
  const json = await postJson(o.url, o.headers, o.body, o.label);
  if (str(json.status) === "failed") throw new Error(`${o.label}: ${str(obj(json.error).message) ?? "the response failed"}`);
  const cites = new CitationCollector();
  const fanouts: string[] = [];
  const text = stripRefMarkers(stripCitationMarkers(parseResponsesOutput(json, cites, fanouts))).trim();
  emptyGuard(text, o.label);
  const usage = obj(json.usage);
  const searches = countResponsesSearches(json) || (num(obj(obj(usage.x_tools).web_search).count) ?? 0);
  const inTok = num(usage.input_tokens) ?? 0;
  const outTok = num(usage.output_tokens) ?? 0;
  const costUsd = estimate(o.price, inTok, outTok, searches);
  const finalModel = str(json.model) ?? o.body.model;
  await track(req, o.usageProvider, finalModel, costUsd, inTok + outTok);
  return {
    text,
    citations: cites.list,
    fanouts: uniqueStrings(fanouts),
    shopping: [],
    ads: [],
    model: finalModel,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: o.endpoint, id: json.id, usage, searches }),
  };
}

/* ───────────────────────────── DeepSeek ───────────────────────────── */

function deepseekAnswer(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  // DeepSeek's API answers from model knowledge only (no web search → no citations).
  return chatCompatAnswer(req, {
    label: "DeepSeek",
    usageProvider: "deepseek",
    price: "deepseek",
    endpoint: "deepseek/chat",
    url: "https://api.deepseek.com/chat/completions",
    headers: { Authorization: `Bearer ${apiKey}` },
    model,
    webSearch: false,
  });
}

/* ───────────────────────────── Meta AI ───────────────────────────── */

async function metaAnswer(req: AnswerRequest, keys: { metaApiKey: string; openrouterApiKey: string }, modelOverride: string): Promise<AnswerResult> {
  if (keys.metaApiKey) {
    const model = modelOverride.replace(/^meta\//, "") || "muse-spark-1.3";
    return responsesAnswer(req, {
      label: "Meta",
      usageProvider: "meta",
      price: "meta",
      endpoint: "meta/responses",
      url: "https://api.meta.ai/v1/responses",
      headers: { Authorization: `Bearer ${keys.metaApiKey}` },
      body: {
        model,
        instructions: localeHint(req),
        input: req.prompt,
        store: false,
        tools: [{ type: "web_search", user_location: { type: "approximate", country: isoCountry(req.country) } }],
      },
    });
  }
  if (keys.openrouterApiKey) {
    // Same Muse Spark model through OpenRouter; its `web` plugin (Exa) searches instead of Meta's own search.
    const base = (modelOverride || "muse-spark-1.3").replace(/:online$/, "");
    return chatCompatAnswer(req, {
      label: "OpenRouter (Meta AI)",
      usageProvider: "openrouter",
      price: "meta",
      endpoint: "openrouter/chat+web",
      url: "https://openrouter.ai/api/v1/chat/completions",
      headers: { Authorization: `Bearer ${keys.openrouterApiKey}` },
      model: base.includes("/") ? base : `meta/${base}`,
      extra: { plugins: [{ id: "web" }] },
      webSearch: true,
    });
  }
  throw new EngineUnavailableError("Add a Meta Model API key (or an OpenRouter key) in Admin → AI Providers.", "not_configured");
}

/* ───────────────────────────── Qwen (Alibaba Cloud) ───────────────────────────── */

/** Qwen 3.5+ models are multimodal and are served with web search only on the Responses API path. */
function qwenUsesResponses(model: string): boolean {
  return /^qwen3\.[5-9]/i.test(model) || /^(deepseek-v4|glm-5|kimi-k3)/i.test(model);
}

async function qwenAnswer(req: AnswerRequest, apiKey: string, baseUrl: string, model: string): Promise<AnswerResult> {
  const base = qwenBase(baseUrl);
  const headers = { Authorization: `Bearer ${apiKey}` };
  const viaResponses = () =>
    responsesAnswer(req, {
      label: "Qwen",
      usageProvider: "qwen",
      price: "qwen",
      endpoint: "dashscope/responses",
      url: `${base}/responses`,
      headers,
      body: { model, instructions: localeHint(req), input: req.prompt, tools: [{ type: "web_search" }] },
    });
  if (qwenUsesResponses(model)) return viaResponses();
  let json: Record<string, unknown>;
  try {
    // Native DashScope protocol: the only one that returns the search sources for text models.
    json = await postJson(
      `${new URL(base).origin}/api/v1/services/aigc/text-generation/generation`,
      headers,
      {
        model,
        input: {
          messages: [
            { role: "system", content: localeHint(req) },
            { role: "user", content: req.prompt },
          ],
        },
        parameters: { result_format: "message", enable_search: true, search_options: { search_strategy: "agent", enable_source: true } },
      },
      "Qwen",
    );
  } catch (err) {
    // Models that only exist on the multimodal endpoint answer "url error" here.
    if ((err as { status?: number }).status === 400 && /url error/i.test(String((err as Error).message))) return viaResponses();
    throw err;
  }
  const cites = new CitationCollector();
  const parsed = parseDashscopeGeneration(json, cites);
  const text = stripRefMarkers(parsed.text).trim();
  emptyGuard(text, "Qwen");
  const costUsd = estimate("qwen", parsed.inputTokens, parsed.outputTokens, parsed.searches);
  await track(req, "qwen", model, costUsd, parsed.inputTokens + parsed.outputTokens);
  return {
    text,
    citations: cites.list,
    fanouts: [],
    shopping: [],
    ads: [],
    model,
    provider: "api",
    costUsd,
    raw: trimRaw({ endpoint: "dashscope/text-generation", usage: json.usage, searches: parsed.searches, requestId: json.request_id }),
  };
}

/* ───────────────────────────── Kimi (Moonshot AI) ───────────────────────────── */

function kimiAnswer(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  // Moonshot ignores user_location on web_search — the market goes into the instructions.
  return responsesAnswer(req, {
    label: "Kimi",
    usageProvider: "moonshot",
    price: "moonshot",
    endpoint: "moonshot/responses",
    url: "https://api.moonshot.ai/v1/responses",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model,
      instructions: localeHint(req),
      input: req.prompt,
      tools: [{ type: "web_search" }],
      include: ["web_search_call.action.sources"],
    },
  });
}

/* ───────────────────────────── Sabiá (Maritaca AI) ───────────────────────────── */

function sabiaAnswer(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  // Maritaca runs the search server-side and returns only the final answer, with its sources cited inline.
  return chatCompatAnswer(req, {
    label: "Maritaca",
    usageProvider: "maritaca",
    price: "maritaca",
    endpoint: "maritaca/chat+web_search",
    url: "https://chat.maritaca.ai/api/chat/completions",
    headers: { Authorization: `Key ${apiKey}` },
    model,
    extra: { web_search: true, stream: false },
    webSearch: true,
    linkCitations: true,
  });
}

/* ───────────────────────────── Solar (Upstage) ───────────────────────────── */

function solarAnswer(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  // Upstage's API has no web search: answers come from model knowledge, without citations.
  return chatCompatAnswer(req, {
    label: "Upstage",
    usageProvider: "upstage",
    price: "upstage",
    endpoint: "upstage/chat",
    url: "https://api.upstage.ai/v1/chat/completions",
    headers: { Authorization: `Bearer ${apiKey}` },
    model,
    webSearch: false,
  });
}

/* ───────────────────────────── Dispatcher ───────────────────────────── */

export async function answerViaApi(req: AnswerRequest, modelOverride?: string): Promise<AnswerResult> {
  const ai = await getSetting("ai");
  const m = modelOverride?.trim() || "";
  const need = (key: string, vendor: string) => {
    if (!key) throw new EngineUnavailableError(`Add ${/^[aeiou]|^x/i.test(vendor) ? "an" : "a"} ${vendor} API key in Admin → AI Providers.`, "not_configured");
    return key;
  };
  switch (req.engine) {
    case "chatgpt":
      return openaiAnswer(req, need(ai.openaiApiKey, "OpenAI"), m || ai.openaiModel || "gpt-5");
    case "claude":
      return anthropicAnswer(req, need(ai.anthropicApiKey, "Anthropic"), m || ai.anthropicModel || "claude-opus-5");
    case "perplexity":
      return perplexityAnswer(req, need(ai.perplexityApiKey, "Perplexity"), m || "fast");
    case "gemini":
      return geminiAnswer(req, need(ai.geminiApiKey, "Google Gemini"), m);
    case "grok":
      return grokAnswer(req, need(ai.xaiApiKey, "xAI"), m || "grok-4.7");
    case "mistral":
      return mistralAnswer(req, need(ai.mistralApiKey, "Mistral"), m || "mistral-medium-latest");
    case "deepseek":
      return deepseekAnswer(req, need(ai.deepseekApiKey, "DeepSeek"), m || "deepseek-flash");
    case "meta_ai":
      return metaAnswer(req, ai, m);
    case "qwen":
      return qwenAnswer(req, need(ai.qwenApiKey, "Alibaba Cloud (Qwen)"), ai.qwenBaseUrl, m || "qwen3.8-max");
    case "kimi":
      return kimiAnswer(req, need(ai.moonshotApiKey, "Moonshot AI (Kimi)"), m || "kimi-k3");
    case "sabia":
      return sabiaAnswer(req, need(ai.maritacaApiKey, "Maritaca AI (Sabiá)"), m || "sabia-4");
    case "solar":
      return solarAnswer(req, need(ai.upstageApiKey, "Upstage (Solar)"), m || "solar-pro4");
    default:
      throw new EngineUnavailableError(`There is no direct API for ${req.engine}.`, "unsupported");
  }
}

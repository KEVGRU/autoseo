import "server-only";
import { getEngine } from "@/lib/engines";
import { getSetting } from "@/server/settings";
import { AiNotConfiguredError, runLlm } from "@/server/ai/llm";
import { geminiAnswer, openaiAnswer } from "./api";
import { mapSimulation, parsePersonaText, personaFor, simulationSchema, simulationSystemPrompt, simulationUserPrompt } from "./persona";
import type { AnswerRequest, AnswerResult } from "./types";
import { EngineUnavailableError } from "./types";
import { CitationCollector, isoCountry, trimRaw } from "./util";

/**
 * Provider "ai": an AI model with web search imitates an engine that has no real backend configured.
 * Backends: Google AI surfaces → Gemini with Google Search grounding; Copilot / ChatGPT app → OpenAI
 * Responses with web search; everything else → the AI router (`runLlm`, local agent first) with web
 * search. Answers are directional and stored with provider "ai" (shown as "Simulated").
 */
export async function answerViaSimulation(req: AnswerRequest): Promise<AnswerResult> {
  const engine = getEngine(req.engine);
  if (!engine) throw new EngineUnavailableError(`Unknown engine "${req.engine}".`, "unsupported");
  const ai = await getSetting("ai");
  const googleSurface = engine.id === "ai_overview" || engine.id === "google_ai_mode";
  const openaiSurface = engine.id === "copilot" || engine.id === "chatgpt_gui";
  if (googleSurface && ai.geminiApiKey) return viaGemini(req, ai.geminiApiKey);
  if (openaiSurface && ai.openaiApiKey) return viaOpenAi(req, ai.openaiApiKey, ai.openaiModel || "gpt-5");
  try {
    return await viaRouter(req);
  } catch (err) {
    if (!(err instanceof AiNotConfiguredError)) throw err;
    if (ai.geminiApiKey) return viaGemini(req, ai.geminiApiKey);
    throw new EngineUnavailableError(
      "AI simulation needs an AI provider: an online local agent or an Anthropic, OpenAI, OpenRouter or Gemini key (Admin → AI Providers).",
      "not_configured",
    );
  }
}

function allowsNoAnswer(req: AnswerRequest): boolean {
  return personaFor(req.engine).noAnswerWhen != null;
}

/** Real engine answer from a persona call → simulated result (no-answer marker, sim: model). */
function toSimulated(req: AnswerRequest, res: AnswerResult, backend: string): AnswerResult {
  const parsed = parsePersonaText(res.text, allowsNoAnswer(req));
  return {
    text: parsed.text,
    citations: parsed.noAnswer ? [] : res.citations,
    fanouts: parsed.noAnswer ? [] : res.fanouts,
    shopping: [],
    ads: [],
    model: `sim:${res.model}`,
    provider: "ai",
    costUsd: res.costUsd,
    raw: trimRaw({ simulated: true, backend, noAiAnswer: parsed.noAnswer, webSearch: true, backendRaw: res.raw }),
  };
}

async function viaGemini(req: AnswerRequest, apiKey: string): Promise<AnswerResult> {
  const system = simulationSystemPrompt(req.engine, req.country, "text");
  const res = await geminiAnswer({ ...req, prompt: simulationUserPrompt(req.prompt, req.country) }, apiKey, "", system);
  return toSimulated(req, res, "gemini+google_search");
}

async function viaOpenAi(req: AnswerRequest, apiKey: string, model: string): Promise<AnswerResult> {
  const system = simulationSystemPrompt(req.engine, req.country, "text");
  const res = await openaiAnswer({ ...req, prompt: simulationUserPrompt(req.prompt, req.country) }, apiKey, model, system);
  return toSimulated(req, res, "openai+web_search");
}

async function viaRouter(req: AnswerRequest): Promise<AnswerResult> {
  const res = await runLlm({
    purpose: "ai_tracking_simulation",
    system: simulationSystemPrompt(req.engine, req.country, "json"),
    prompt: simulationUserPrompt(req.prompt, req.country),
    schema: simulationSchema,
    webSearch: true,
    userLocation: { country: isoCountry(req.country) },
    agentMode: "lean",
    projectId: req.project.id,
    workspaceId: req.project.workspaceId,
    userId: req.userId ?? null,
  });
  // Every router backend searches the web (OpenRouter via its `web` plugin).
  const cites = new CitationCollector();
  for (const c of res.citations) cites.add(c.url, c.title ?? null);
  const mapped = mapSimulation(res.data, cites.list, true, allowsNoAnswer(req));
  if (!mapped.noAnswer && !mapped.text) throw new EngineUnavailableError("The AI simulation returned an empty answer.", "no_answer");
  // OpenRouter's plugin searches with the prompt itself: the model ran no queries, so it has no real fan-outs.
  const ownQueries = res.provider !== "openrouter";
  return {
    text: mapped.text,
    citations: mapped.citations,
    fanouts: ownQueries ? mapped.fanouts : [],
    shopping: [],
    ads: [],
    model: `sim:${res.model}`,
    provider: "ai",
    // The router already recorded this call's usage event; the cost is kept on the answer and the run.
    costUsd: res.costUsd,
    raw: trimRaw({ simulated: true, backend: `router:${res.provider}`, noAiAnswer: mapped.noAnswer, webSearch: true }),
  };
}

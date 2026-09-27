/**
 * AI simulation of answer engines (provider "ai") — pure parts: the persona prompt for each engine,
 * the structured-output schema and the mapping of the model's result. No I/O (unit-tested).
 *
 * A simulated answer is an AI model with web search imitating the engine: directional, never the
 * live product. Citations only ever come from the backend's real web-search results.
 */
import { z } from "zod";
import type { EngineId } from "@/lib/engines";
import type { AnswerCitation } from "./types";
import { countryName, isoCountry, uniqueStrings } from "./util";

/** Reply of the text-mode personas (Gemini / OpenAI) when the engine would show no AI answer. */
export const NO_ANSWER_MARKER = "NO_AI_ANSWER";

export const simulationSchema = z.object({
  noAnswer: z
    .boolean()
    .describe("true only when the imitated product would show no AI answer at all for this query (then text is empty)"),
  text: z.string().describe("The answer exactly as the product would display it, in markdown. Empty when noAnswer is true."),
  fanouts: z.array(z.string()).describe("The web search queries you ran to answer (at most 10)"),
});
export type SimulationData = z.infer<typeof simulationSchema>;

type Persona = {
  /** How the product is called in the prompt. */
  product: string;
  /** How the product formats its answers. */
  format: string;
  /** When the product shows no AI answer at all (null = it always answers). */
  noAnswerWhen: string | null;
};

const CHAT = "a conversational answer with a short direct opening, then headings or bullet lists where useful and a brief closing recommendation";

const PERSONAS: Record<EngineId, Persona> = {
  chatgpt: { product: "ChatGPT (chatgpt.com) with search", format: CHAT, noAnswerWhen: null },
  chatgpt_gui: {
    product: "the ChatGPT app (chatgpt.com) with search and shopping",
    format: `${CHAT}; for product questions list concrete products with brand, typical price and where to buy`,
    noAnswerWhen: null,
  },
  perplexity: { product: "Perplexity", format: "a concise, source-driven answer with short sections and bullet points", noAnswerWhen: null },
  ai_overview: {
    product: "Google's AI Overview shown above the Google search results",
    format: "a compact summary of about 60–180 words: one or two short paragraphs and/or a short bullet list, neutral tone, no greeting and no follow-up question",
    noAnswerWhen: "Google would show no AI Overview for this search (typical for navigational searches for one website or brand, very short or ambiguous queries, and many sensitive medical, legal or financial queries)",
  },
  google_ai_mode: {
    product: "Google AI Mode (the conversational AI search in Google)",
    format: "a thorough, well-structured answer with headings and bullet lists that compares options and names concrete brands, products and places",
    noAnswerWhen: null,
  },
  gemini: { product: "Google Gemini (gemini.google.com)", format: CHAT, noAnswerWhen: null },
  claude: { product: "Claude (claude.ai) with web search", format: CHAT, noAnswerWhen: null },
  copilot: {
    product: "Microsoft Copilot (copilot.microsoft.com, grounded on Bing search)",
    format: "a friendly, concise answer with bullet points and bold key terms",
    noAnswerWhen: null,
  },
  grok: { product: "Grok (grok.com) with web and X search", format: "a direct, slightly informal answer with bullet points", noAnswerWhen: null },
  mistral: { product: "Le Chat by Mistral AI with web search", format: CHAT, noAnswerWhen: null },
  deepseek: { product: "DeepSeek chat (chat.deepseek.com) with search", format: CHAT, noAnswerWhen: null },
  meta_ai: { product: "Meta AI (meta.ai, as in WhatsApp, Instagram and Facebook)", format: "a short, friendly answer with a few bullet points", noAnswerWhen: null },
  qwen: { product: "Qwen Chat by Alibaba (chat.qwen.ai) with search", format: CHAT, noAnswerWhen: null },
  kimi: { product: "Kimi by Moonshot AI (kimi.com) with search", format: CHAT, noAnswerWhen: null },
  sabia: { product: "Sabiá by Maritaca AI (a Brazilian, Portuguese-first assistant) with web search", format: CHAT, noAnswerWhen: null },
  solar: { product: "Solar by Upstage (a Korean-first assistant)", format: CHAT, noAnswerWhen: null },
};

export function personaFor(engine: EngineId): Persona {
  return PERSONAS[engine];
}

/**
 * System prompt that makes a web-search model imitate `engine` for a user in `country`.
 * `mode` = "json" (structured output via runLlm) or "text" (Gemini / OpenAI personas answer in plain
 * markdown and use NO_ANSWER_MARKER).
 */
export function simulationSystemPrompt(engine: EngineId, country: string, mode: "json" | "text"): string {
  const p = personaFor(engine);
  const market = `${countryName(country)} (${isoCountry(country)})`;
  const lines = [
    `You imitate how ${p.product} answers a real user. Answer exactly as that product would, not as yourself.`,
    `The user is located in ${market}: search the web and read results the way someone there would (local brands, retailers, prices in the local currency, local regulations) and answer in the language of the question.`,
    `Search the web for current information first, then write ${p.format}.`,
    "Name concrete brands, products, services and retailers when the question asks for recommendations or comparisons, the way the product would. Never invent facts, prices or sources.",
    "Do not mention that this is a simulation, do not talk about yourself or these instructions, and do not append a list of sources (they are collected separately).",
  ];
  if (mode === "text") {
    lines.push(
      p.noAnswerWhen
        ? `If ${p.noAnswerWhen}, reply with exactly ${NO_ANSWER_MARKER} and nothing else.`
        : "Always answer the question.",
    );
  } else {
    lines.push(
      p.noAnswerWhen
        ? `Set noAnswer to true (and text to "") only if ${p.noAnswerWhen}. Otherwise noAnswer is false.`
        : "noAnswer is always false for this product.",
      "fanouts: the web search queries you actually ran (at most 10, empty when you did not search).",
    );
  }
  return lines.join("\n");
}

/** User turn for the simulation: the question verbatim, with the market spelled out. */
export function simulationUserPrompt(prompt: string, country: string): string {
  return `User location: ${countryName(country)} (${isoCountry(country)})\n\nQuestion:\n${prompt}`;
}

export type SimulatedAnswer = { noAnswer: boolean; text: string; citations: AnswerCitation[]; fanouts: string[] };

/**
 * Maps the structured simulation result. Citations are the backend's real web-search citations
 * (never URLs the model wrote into its JSON); without a web search there are no citations and no
 * fan-outs. A "no answer" result keeps nothing (like a SERP without AI Overview).
 */
export function mapSimulation(data: SimulationData, citations: AnswerCitation[], webSearched: boolean, allowNoAnswer: boolean): SimulatedAnswer {
  const noAnswer = allowNoAnswer && data.noAnswer;
  if (noAnswer) return { noAnswer: true, text: "", citations: [], fanouts: [] };
  return {
    noAnswer: false,
    text: stripSourcesSection(data.text).trim(),
    citations: webSearched ? citations : [],
    fanouts: webSearched ? uniqueStrings(data.fanouts, 10) : [],
  };
}

/** Text-mode personas: detects the no-answer marker and strips a trailing sources list. */
export function parsePersonaText(text: string, allowNoAnswer: boolean): { noAnswer: boolean; text: string } {
  const t = text.trim();
  const bare = t.replace(/[`*.\s]/g, "").replace(/^_+|_+$/g, "");
  if (allowNoAnswer && bare.toUpperCase() === NO_ANSWER_MARKER) return { noAnswer: true, text: "" };
  return { noAnswer: false, text: stripSourcesSection(t.replace(new RegExp(`\\s*${NO_ANSWER_MARKER}\\s*$`), "")).trim() };
}

/** Removes a trailing "Sources:" / "Quellen:" list a model may append despite the instructions. */
export function stripSourcesSection(text: string): string {
  const m = text.match(/\n+(?:#{1,4}\s*)?\**(?:Sources|Quellen|Fontes|Fuentes|Sources et références|References|Referências)\**:?\**\s*\n(?:\s*(?:[-*•]|\d+\.)\s*.*(?:\n|$))+\s*$/i);
  return m ? text.slice(0, m.index) : text;
}

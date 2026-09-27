import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnswerRequest, AnswerResult } from "./types";

const state = vi.hoisted(() => ({
  ai: {} as Record<string, unknown>,
  runLlm: vi.fn(),
  gemini: vi.fn(),
  openai: vi.fn(),
}));

vi.mock("@/server/settings", () => ({ getSetting: async () => state.ai }));
vi.mock("@/server/ai/llm", () => {
  class AiNotConfiguredError extends Error {}
  return { AiNotConfiguredError, runLlm: state.runLlm };
});
vi.mock("./api", () => ({ geminiAnswer: state.gemini, openaiAnswer: state.openai }));

import { AiNotConfiguredError } from "@/server/ai/llm";
import { answerViaSimulation } from "./simulated";
import { EngineUnavailableError } from "./types";

const req = (engine: AnswerRequest["engine"]): AnswerRequest => ({
  engine,
  prompt: "Welches Balkonkraftwerk ist das beste?",
  country: "DE",
  language: "de",
  project: { id: "prj_1", workspaceId: "ws_1", name: "Solakon", domain: "solakon.de" },
});

const engineResult = (text: string): AnswerResult => ({
  text,
  citations: [{ url: "https://www.test.de/balkonkraftwerke", title: "Test", position: 1 }],
  fanouts: ["balkonkraftwerk test"],
  shopping: [],
  ads: [],
  model: "gemini-3.5-flash",
  provider: "api",
  costUsd: 0.002,
  raw: { endpoint: "gemini/generateContent" },
});

beforeEach(() => {
  state.ai = { geminiApiKey: "", openaiApiKey: "", openaiModel: "gpt-5" };
  state.runLlm.mockReset();
  state.gemini.mockReset();
  state.openai.mockReset();
});

describe("answerViaSimulation", () => {
  it("router path: provider ai, sim: model, real citations only, market in the prompt", async () => {
    state.runLlm.mockResolvedValue({
      text: "{}",
      data: { noAnswer: false, text: "Solakon und Anker sind beliebt.", fanouts: ["beste balkonkraftwerke 2026"] },
      provider: "anthropic",
      model: "claude-opus-5",
      citations: [{ url: "https://www.solakon.de/", title: "Solakon" }],
      costUsd: 0.12,
    });
    const res = await answerViaSimulation(req("kimi"));
    expect(res.provider).toBe("ai");
    expect(res.model).toBe("sim:claude-opus-5");
    expect(res.text).toBe("Solakon und Anker sind beliebt.");
    expect(res.citations).toEqual([{ url: "https://www.solakon.de/", title: "Solakon", position: 1 }]);
    expect(res.fanouts).toEqual(["beste balkonkraftwerke 2026"]);
    expect(res.raw).toMatchObject({ simulated: true, backend: "router:anthropic", webSearch: true });
    const call = state.runLlm.mock.calls[0]![0];
    expect(call.webSearch).toBe(true);
    expect(call.userLocation).toEqual({ country: "DE" });
    expect(res.costUsd).toBe(0.12);
    expect(call.prompt).toContain("Germany (DE)");
    expect(call.system).toContain("Kimi");
  });

  it("OpenRouter searches via its web plugin → real citations, but no model-written fan-outs", async () => {
    state.runLlm.mockResolvedValue({
      text: "{}",
      data: { noAnswer: false, text: "Answer", fanouts: ["made up"] },
      provider: "openrouter",
      model: "anthropic/claude-opus-5",
      citations: [{ url: "https://www.test.de/", title: "Test" }],
      costUsd: 0.03,
    });
    const res = await answerViaSimulation(req("solar"));
    expect(res.citations).toEqual([{ url: "https://www.test.de/", title: "Test", position: 1 }]);
    expect(res.fanouts).toEqual([]);
    expect(res.costUsd).toBe(0.03);
    expect(res.raw).toMatchObject({ webSearch: true, backend: "router:openrouter" });
  });

  it("AI Overview uses Gemini grounding and maps the no-answer marker to an empty answer", async () => {
    state.ai.geminiApiKey = "g";
    state.gemini.mockResolvedValue(engineResult("NO_AI_ANSWER"));
    const res = await answerViaSimulation(req("ai_overview"));
    expect(state.runLlm).not.toHaveBeenCalled();
    expect(res).toMatchObject({ text: "", citations: [], fanouts: [], provider: "ai", model: "sim:gemini-3.5-flash" });
    expect(res.raw).toMatchObject({ simulated: true, backend: "gemini+google_search", noAiAnswer: true });
  });

  it("Copilot uses the OpenAI persona when an OpenAI key exists", async () => {
    state.ai.openaiApiKey = "o";
    state.openai.mockResolvedValue({ ...engineResult("Copilot answer"), model: "gpt-5" });
    const res = await answerViaSimulation(req("copilot"));
    expect(state.openai.mock.calls[0]![2]).toBe("gpt-5");
    expect(state.openai.mock.calls[0]![3]).toContain("Microsoft Copilot");
    expect(res).toMatchObject({ text: "Copilot answer", provider: "ai", model: "sim:gpt-5" });
    expect(res.citations).toHaveLength(1);
  });

  it("falls back to Gemini when the router has no provider, else reports not configured", async () => {
    state.runLlm.mockRejectedValue(new AiNotConfiguredError());
    state.ai.geminiApiKey = "g";
    state.gemini.mockResolvedValue(engineResult("Meta AI answer"));
    expect((await answerViaSimulation(req("meta_ai"))).text).toBe("Meta AI answer");

    state.ai.geminiApiKey = "";
    await expect(answerViaSimulation(req("meta_ai"))).rejects.toBeInstanceOf(EngineUnavailableError);
  });
});

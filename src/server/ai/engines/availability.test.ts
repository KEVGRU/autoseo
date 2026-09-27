import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  ai: {} as Record<string, unknown>,
  engines: {} as Record<string, unknown>,
  agents: { enabled: false },
  dfs: false,
  llm: [] as string[],
}));

vi.mock("@/server/settings", () => ({
  getSetting: async (key: string) => (key === "ai" ? state.ai : key === "engines" ? state.engines : state.agents),
}));
vi.mock("@/server/dataforseo/client", () => ({ isDataForSeoConfigured: async () => state.dfs }));
vi.mock("@/server/agents/dispatch", () => ({ hasOnlineAgent: async () => false }));
vi.mock("@/server/ai/llm", () => ({ availableLlmProviders: async () => state.llm }));

import { getEngineAvailability, getEngineAvailabilityFor } from "./availability";

beforeEach(() => {
  state.ai = { preferLocalAgent: true, geminiApiKey: "", openrouterApiKey: "", metaApiKey: "", upstageApiKey: "" };
  state.engines = { simulateUnavailable: true };
  state.agents = { enabled: false };
  state.dfs = false;
  state.llm = [];
});

describe("engine availability", () => {
  it("lists all 16 engines", async () => {
    const list = await getEngineAvailability();
    expect(list).toHaveLength(16);
    expect(list.map((a) => a.id)).toEqual(expect.arrayContaining(["meta_ai", "qwen", "kimi", "sabia", "solar"]));
  });

  it("nothing configured → not available, simulation named as alternative", async () => {
    const a = (await getEngineAvailabilityFor("kimi"))!;
    expect(a.configured).toBe(false);
    expect(a.simulated).toBe(false);
    expect(a.status).toBe("needs_key");
    expect(a.reason).toContain("Moonshot AI API key");
    expect(a.reason).toContain("AI simulation");
    expect(a.providers.find((p) => p.provider === "ai")?.configured).toBe(false);
  });

  it("an LLM provider enables the simulation as the last auto fallback", async () => {
    state.llm = ["anthropic"];
    const a = (await getEngineAvailabilityFor("ai_overview"))!;
    expect(a.provider).toBe("ai");
    expect(a.configured).toBe(true);
    expect(a.simulated).toBe(true);
    expect(a.reason).toMatch(/^Simulated:/);
  });

  it("a real backend always wins over the simulation", async () => {
    state.llm = ["anthropic"];
    state.ai.upstageApiKey = "up-key";
    const a = (await getEngineAvailabilityFor("solar"))!;
    expect(a.provider).toBe("api");
    expect(a.simulated).toBe(false);
    expect(a.reason).toContain("no web search");
  });

  it("Meta AI runs on the OpenRouter key when no Meta key is set", async () => {
    state.ai.openrouterApiKey = "or-key";
    const a = (await getEngineAvailabilityFor("meta_ai"))!;
    expect(a.provider).toBe("api");
    expect(a.reason).toContain("OpenRouter");
  });

  it("a Gemini key alone can power the simulation", async () => {
    state.ai.geminiApiKey = "g-key";
    expect((await getEngineAvailabilityFor("copilot"))!.provider).toBe("ai");
  });

  it("toggle off: no automatic simulation, but an explicit choice still works", async () => {
    state.llm = ["openai"];
    state.engines = { simulateUnavailable: false };
    const auto = (await getEngineAvailabilityFor("qwen"))!;
    expect(auto.configured).toBe(false);
    expect(auto.providers.find((p) => p.provider === "ai")?.reason).toContain("turned off");

    state.engines = { simulateUnavailable: false, qwen: { provider: "ai", model: "" } };
    const explicit = (await getEngineAvailabilityFor("qwen"))!;
    expect(explicit.provider).toBe("ai");
    expect(explicit.configured).toBe(true);
    expect(explicit.simulated).toBe(true);
  });

  it("explicit simulation without any AI provider reports needs_ai", async () => {
    state.engines = { simulateUnavailable: true, sabia: { provider: "ai", model: "" } };
    const a = (await getEngineAvailabilityFor("sabia"))!;
    expect(a.configured).toBe(false);
    expect(a.status).toBe("needs_ai");
  });
});

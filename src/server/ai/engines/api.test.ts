import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AnswerRequest } from "./types";

const state = vi.hoisted(() => ({ ai: {} as Record<string, unknown>, usage: [] as Record<string, unknown>[] }));

vi.mock("@/server/settings", () => ({ getSetting: async () => state.ai }));
vi.mock("@/server/usage", () => ({ recordUsage: async (u: Record<string, unknown>) => void state.usage.push(u) }));

import { answerViaApi } from "./api";
import { EngineUnavailableError } from "./types";

type Call = { url: string; headers: Record<string, string>; body: Record<string, unknown> };
let calls: Call[] = [];
let replies: { status?: number; json: unknown }[] = [];

beforeEach(() => {
  state.ai = { qwenBaseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1" };
  state.usage = [];
  calls = [];
  replies = [];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    calls.push({ url, headers: init.headers as Record<string, string>, body: JSON.parse(String(init.body)) });
    const r = replies.shift() ?? { json: {} };
    return new Response(JSON.stringify(r.json), { status: r.status ?? 200 });
  });
});
afterEach(() => vi.unstubAllGlobals());

const req = (engine: AnswerRequest["engine"], country = "BR"): AnswerRequest => ({
  engine,
  prompt: "Qual o melhor kit de energia solar?",
  country,
  language: "pt",
  project: { id: "prj_1", workspaceId: "ws_1", name: "Solakon", domain: "solakon.de" },
});

const responsesReply = (model: string) => ({
  json: {
    id: "resp_1",
    status: "completed",
    model,
    output: [
      { type: "web_search_call", action: { type: "search", query: "melhor kit solar", sources: [{ type: "url", url: "https://www.portalsolar.com.br/", title: "Portal Solar" }] } },
      { type: "message", content: [{ type: "output_text", text: "O melhor kit é…", annotations: [] }] },
    ],
    usage: { input_tokens: 1000, output_tokens: 200 },
  },
});

describe("answerViaApi — new engines", () => {
  it("Meta AI: Meta Model API Responses with web_search + user_location", async () => {
    state.ai.metaApiKey = "meta-key";
    replies.push(responsesReply("muse-spark-1.3"));
    const res = await answerViaApi(req("meta_ai"), "");
    expect(calls[0]!.url).toBe("https://api.meta.ai/v1/responses");
    expect(calls[0]!.headers.Authorization).toBe("Bearer meta-key");
    expect(calls[0]!.body).toMatchObject({ model: "muse-spark-1.3", store: false, tools: [{ type: "web_search", user_location: { type: "approximate", country: "BR" } }] });
    expect(res).toMatchObject({ provider: "api", model: "muse-spark-1.3", text: "O melhor kit é…", fanouts: ["melhor kit solar"] });
    expect(res.citations.map((c) => c.url)).toEqual(["https://www.portalsolar.com.br/"]);
    expect(state.usage[0]).toMatchObject({ provider: "meta", feature: "ai_tracking" });
  });

  it("Meta AI falls back to OpenRouter with the web plugin", async () => {
    state.ai.openrouterApiKey = "or-key";
    replies.push({
      json: {
        model: "meta/muse-spark-1.3",
        choices: [{ message: { content: "Resposta", annotations: [{ type: "url_citation", url_citation: { url: "https://exame.com/x", title: "Exame" } }] } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, cost: 0.01 },
      },
    });
    const res = await answerViaApi(req("meta_ai"), "");
    expect(calls[0]!.url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(calls[0]!.body).toMatchObject({ model: "meta/muse-spark-1.3", plugins: [{ id: "web" }] });
    expect(res.costUsd).toBe(0.01);
    expect(res.citations).toEqual([{ url: "https://exame.com/x", title: "Exame", position: 1 }]);
  });

  it("Qwen default model uses the Responses API with the web_search tool", async () => {
    state.ai.qwenApiKey = "dash-key";
    replies.push(responsesReply("qwen3.8-max"));
    const res = await answerViaApi(req("qwen"), "");
    expect(calls[0]!.url).toBe("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/responses");
    expect(calls[0]!.body).toMatchObject({ model: "qwen3.8-max", tools: [{ type: "web_search" }] });
    expect(res.citations).toHaveLength(1);
  });

  it("Qwen text models use the native protocol with enable_source (and fall back on 'url error')", async () => {
    state.ai.qwenApiKey = "dash-key";
    replies.push({
      json: {
        output: {
          choices: [{ message: { content: "Resposta [ref_1]" } }],
          search_info: { search_results: [{ index: 1, title: "Portal Solar", url: "https://www.portalsolar.com.br/kit" }] },
        },
        usage: { input_tokens: 500, output_tokens: 50, plugins: { search: { count: 1 } } },
      },
    });
    const res = await answerViaApi(req("qwen"), "qwen-plus");
    expect(calls[0]!.url).toBe("https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation");
    expect(calls[0]!.body).toMatchObject({
      model: "qwen-plus",
      parameters: { result_format: "message", enable_search: true, search_options: { search_strategy: "agent", enable_source: true } },
    });
    expect(res.text).toBe("Resposta");
    expect(res.citations.map((c) => c.url)).toEqual(["https://www.portalsolar.com.br/kit"]);

    replies.push({ status: 400, json: { code: "InvalidParameter", message: "url error, please check url" } }, responsesReply("qwen-vl-max"));
    await answerViaApi(req("qwen"), "qwen-vl-max");
    expect(calls.slice(1).map((c) => c.url)).toEqual([
      "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/responses",
    ]);
  });

  it("Kimi: Moonshot Responses with server-side web_search and sources included", async () => {
    state.ai.moonshotApiKey = "ms-key";
    replies.push(responsesReply("kimi-k3"));
    const res = await answerViaApi(req("kimi"), "");
    expect(calls[0]!.url).toBe("https://api.moonshot.ai/v1/responses");
    expect(calls[0]!.body).toMatchObject({ model: "kimi-k3", tools: [{ type: "web_search" }], include: ["web_search_call.action.sources"] });
    expect(res.fanouts).toEqual(["melhor kit solar"]);
  });

  it("Sabiá: Maritaca chat completions with web_search and Key auth; sources from the answer links", async () => {
    state.ai.maritacaApiKey = "mt-key";
    replies.push({
      json: {
        model: "sabia-4",
        choices: [{ message: { content: "Segundo o [Portal Solar](https://www.portalsolar.com.br/kit), vale a pena." } }],
        usage: { prompt_tokens: 30, completion_tokens: 20 },
      },
    });
    const res = await answerViaApi(req("sabia"), "");
    expect(calls[0]!.url).toBe("https://chat.maritaca.ai/api/chat/completions");
    expect(calls[0]!.headers.Authorization).toBe("Key mt-key");
    expect(calls[0]!.body).toMatchObject({ model: "sabia-4", web_search: true, stream: false });
    expect(res.citations).toEqual([{ url: "https://www.portalsolar.com.br/kit", title: "Portal Solar", position: 1 }]);
  });

  it("Solar: Upstage chat completions without web search never returns citations", async () => {
    state.ai.upstageApiKey = "up-key";
    replies.push({
      json: { model: "solar-pro4", choices: [{ message: { content: "See https://example.com for more." } }], usage: { prompt_tokens: 10, completion_tokens: 8 } },
    });
    const res = await answerViaApi(req("solar", "KR"), "");
    expect(calls[0]!.url).toBe("https://api.upstage.ai/v1/chat/completions");
    expect(calls[0]!.body).toMatchObject({ model: "solar-pro4" });
    expect(calls[0]!.body.web_search).toBeUndefined();
    expect(res.citations).toEqual([]);
    expect(res.raw).toMatchObject({ webSearch: false });
  });

  it("missing keys and rejected keys are not retryable", async () => {
    await expect(answerViaApi(req("kimi"), "")).rejects.toBeInstanceOf(EngineUnavailableError);
    await expect(answerViaApi(req("meta_ai"), "")).rejects.toThrow(/Meta Model API key/);
    state.ai.upstageApiKey = "bad";
    replies.push({ status: 401, json: { error: { message: "Your API key is invalid." } } });
    await expect(answerViaApi(req("solar"), "")).rejects.toBeInstanceOf(EngineUnavailableError);
  });
});

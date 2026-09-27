import { describe, expect, it } from "vitest";
import {
  chatSearchCount,
  collectAnswerLinks,
  countResponsesSearches,
  parseChatCompletion,
  parseDashscopeGeneration,
  parseResponsesOutput,
  qwenBase,
  stripRefMarkers,
  stripThinking,
} from "./parse";
import { EngineUnavailableError } from "./types";
import { CitationCollector } from "./util";

describe("parseResponsesOutput", () => {
  it("Meta Model API: url_citation annotations on output_text (web_search_call only reports that it ran)", () => {
    const json = {
      id: "resp_123",
      status: "completed",
      model: "muse-spark-1.3",
      output: [
        { id: "ws_789", type: "web_search_call", status: "completed" },
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: "**Muse Spark** was announced on April 8, 2026.",
              annotations: [
                { type: "url_citation", url: "https://www.techtarget.com/roundup", title: "Weekly news roundup | TechTarget", start_index: 0, end_index: 10 },
                { type: "url_citation", url: "https://www.thehindubusinessline.com/meta-muse", title: "Meta unveils Muse Spark", start_index: 11, end_index: 20 },
                { type: "url_citation", url: "https://www.techtarget.com/roundup", title: "duplicate", start_index: 30, end_index: 40 },
              ],
            },
          ],
        },
      ],
    };
    const cites = new CitationCollector();
    const fanouts: string[] = [];
    const text = parseResponsesOutput(json, cites, fanouts);
    expect(text).toBe("**Muse Spark** was announced on April 8, 2026.");
    expect(cites.list).toEqual([
      { url: "https://www.techtarget.com/roundup", title: "Weekly news roundup | TechTarget", position: 1 },
      { url: "https://www.thehindubusinessline.com/meta-muse", title: "Meta unveils Muse Spark", position: 2 },
    ]);
    expect(fanouts).toEqual([]);
    expect(countResponsesSearches(json)).toBe(1);
  });

  it("Moonshot (Kimi): web_search_call action query + sources become fan-outs and citations", () => {
    const json = {
      output: [
        {
          type: "web_search_call",
          id: "ws_dack",
          status: "completed",
          action: {
            type: "search",
            query: "beste Balkonkraftwerke 2026",
            sources: [
              { type: "url", url: "https://www.test.de/balkonkraftwerke", title: "Balkonkraftwerke im Test" },
              { type: "url", url: "https://www.solakon.de/", title: "Solakon" },
            ],
          },
        },
        { type: "message", content: [{ type: "output_text", text: "Empfehlenswert sind …", annotations: [] }] },
      ],
      usage: { input_tokens: 1200, output_tokens: 300 },
    };
    const cites = new CitationCollector();
    const fanouts: string[] = [];
    expect(parseResponsesOutput(json, cites, fanouts)).toBe("Empfehlenswert sind …");
    expect(fanouts).toEqual(["beste Balkonkraftwerke 2026"]);
    expect(cites.list.map((c) => c.url)).toEqual(["https://www.test.de/balkonkraftwerke", "https://www.solakon.de/"]);
    expect(cites.list[0]!.title).toBe("Balkonkraftwerke im Test");
  });

  it("DashScope Responses: several search rounds, nested url_citation shape and numeric titles", () => {
    const json = {
      output: [
        { type: "reasoning", summary: [] },
        { type: "web_search_call", action: { query: "Singapore weather tomorrow", sources: [{ type: "url", url: "https://www.nea.gov.sg/weather" }] } },
        { type: "web_search_call", action: { query: "Singapore 7-day forecast" } },
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: "Tomorrow will be warm.",
              annotations: [{ type: "url_citation", url_citation: { url: "https://www.weather.gov.sg/forecast", title: "1" } }],
            },
          ],
        },
      ],
      usage: { x_tools: { web_search: { count: 2 } } },
    };
    const cites = new CitationCollector();
    const fanouts: string[] = [];
    parseResponsesOutput(json, cites, fanouts);
    expect(fanouts).toEqual(["Singapore weather tomorrow", "Singapore 7-day forecast"]);
    expect(cites.list).toEqual([
      { url: "https://www.nea.gov.sg/weather", title: null, position: 1 },
      { url: "https://www.weather.gov.sg/forecast", title: null, position: 2 },
    ]);
    expect(countResponsesSearches(json)).toBe(2);
  });
});

describe("parseChatCompletion", () => {
  it("OpenRouter web plugin: nested url_citation annotations", () => {
    const json = {
      model: "meta/muse-spark-1.3",
      choices: [
        {
          finish_reason: "stop",
          message: {
            role: "assistant",
            content: "Here's the latest news I found: ...",
            annotations: [
              {
                type: "url_citation",
                url_citation: { url: "https://www.example.com/web-search-result", title: "Title of the web search result", content: "…", start_index: 100, end_index: 200 },
              },
            ],
          },
        },
      ],
      usage: { prompt_tokens: 900, completion_tokens: 120, cost: 0.0042, server_tool_use: { web_search_requests: 2 } },
    };
    const cites = new CitationCollector();
    const res = parseChatCompletion(json, cites);
    expect(res).toEqual({ text: "Here's the latest news I found: ...", finishReason: "stop" });
    expect(cites.list).toEqual([{ url: "https://www.example.com/web-search-result", title: "Title of the web search result", position: 1 }]);
    expect(chatSearchCount(json.usage, 1)).toBe(2);
  });

  it("plain completion without web search (Upstage Solar / DeepSeek) has no citations", () => {
    const json = {
      choices: [{ finish_reason: "stop", message: { role: "assistant", content: "<think>internal</think>\nSolakon is a German brand." } }],
      usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
    };
    const cites = new CitationCollector();
    expect(parseChatCompletion(json, cites).text).toBe("Solakon is a German brand.");
    expect(cites.list).toEqual([]);
    expect(chatSearchCount(json.usage, 0)).toBe(0);
  });

  it("reads Perplexity-style top-level citations and search_results and array content", () => {
    const json = {
      choices: [{ message: { content: [{ type: "text", text: "A" }, { type: "text", text: "B" }] } }],
      search_results: [{ url: "https://a.example/1", title: "One" }],
      citations: ["https://b.example/2", { url: "https://c.example/3", title: "Three" }],
    };
    const cites = new CitationCollector();
    expect(parseChatCompletion(json, cites).text).toBe("AB");
    expect(cites.list.map((c) => [c.url, c.title])).toEqual([
      ["https://a.example/1", "One"],
      ["https://b.example/2", null],
      ["https://c.example/3", "Three"],
    ]);
  });
});

describe("collectAnswerLinks (Maritaca cites its web sources inside the answer)", () => {
  it("collects markdown links and bare URLs, trims punctuation and dedupes", () => {
    const text = [
      "Segundo o [Portal Solar](https://www.portalsolar.com.br/kit-solar), os kits custam menos.",
      "Veja também https://www.gov.br/aneel/geracao-distribuida. Fonte [1](https://www.portalsolar.com.br/kit-solar).",
      "Mais em [https://exame.com/energia](https://exame.com/energia).",
    ].join("\n");
    const cites = new CitationCollector();
    collectAnswerLinks(text, cites);
    expect(cites.list).toEqual([
      { url: "https://www.portalsolar.com.br/kit-solar", title: "Portal Solar", position: 1 },
      { url: "https://exame.com/energia", title: null, position: 2 },
      { url: "https://www.gov.br/aneel/geracao-distribuida", title: null, position: 3 },
    ]);
  });

  it("ignores text without links", () => {
    const cites = new CitationCollector();
    collectAnswerLinks("Sem fontes aqui.", cites);
    expect(cites.list).toEqual([]);
  });
});

describe("parseDashscopeGeneration (Qwen native protocol)", () => {
  it("reads the answer, sources in index order, search count and tokens", () => {
    const json = {
      output: {
        choices: [{ finish_reason: "stop", message: { role: "assistant", content: "Based on the latest market data, Alibaba's stock price [ref_1] differs." } }],
        search_info: {
          search_results: [
            { index: 2, title: "Alibaba(BABA)_US Stock Quote", url: "https://gu.sina.cn/quotes/us/BABA" },
            { index: 1, title: "Alibaba(BABA) Stock Price_Quote_Chart - East Money", url: "https://wap.eastmoney.com/quote/stock/106.BABA.html" },
          ],
        },
      },
      usage: { input_tokens: 2004, output_tokens: 203, plugins: { search: { count: 1, strategy: "agent" } }, total_tokens: 2207 },
      request_id: "45c231d2",
    };
    const cites = new CitationCollector();
    const res = parseDashscopeGeneration(json, cites);
    expect(res).toEqual({ text: "Based on the latest market data, Alibaba's stock price [ref_1] differs.", searches: 1, inputTokens: 2004, outputTokens: 203 });
    expect(stripRefMarkers(res.text)).toBe("Based on the latest market data, Alibaba's stock price  differs.");
    expect(cites.list.map((c) => c.url)).toEqual(["https://wap.eastmoney.com/quote/stock/106.BABA.html", "https://gu.sina.cn/quotes/us/BABA"]);
  });

  it("no search → no sources and zero searches", () => {
    const cites = new CitationCollector();
    const res = parseDashscopeGeneration({ output: { text: "Hi" }, usage: { input_tokens: 3, output_tokens: 1 } }, cites);
    expect(res.text).toBe("Hi");
    expect(res.searches).toBe(0);
    expect(cites.list).toEqual([]);
  });
});

describe("helpers", () => {
  it("stripThinking removes inline reasoning blocks", () => {
    expect(stripThinking("<think>a\nb</think>Answer")).toBe("Answer");
  });

  it("stripRefMarkers only removes DashScope ref markers", () => {
    expect(stripRefMarkers("Price [ref_2] in [2026]")).toBe("Price  in [2026]");
  });

  it("chatSearchCount reads Maritaca tool_execution_details or falls back", () => {
    expect(chatSearchCount({ tool_execution_details: { web_search: 3 } }, 1)).toBe(3);
    expect(chatSearchCount({ tool_execution_details: { web_search: { count: 2 } } }, 1)).toBe(2);
    expect(chatSearchCount({}, 1)).toBe(1);
  });

  it("qwenBase accepts https endpoints and rejects anything else", () => {
    expect(qwenBase("")).toBe("https://dashscope-intl.aliyuncs.com/compatible-mode/v1");
    expect(qwenBase("https://ws-123.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/?x=1#y")).toBe(
      "https://ws-123.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
    );
    expect(() => qwenBase("http://dashscope-intl.aliyuncs.com/compatible-mode/v1")).toThrow(EngineUnavailableError);
    expect(() => qwenBase("https://user:pw@dashscope-intl.aliyuncs.com/")).toThrow(EngineUnavailableError);
    expect(() => qwenBase("not a url")).toThrow(EngineUnavailableError);
  });
});

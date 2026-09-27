/**
 * Pure parsers for provider payloads (no I/O) — shared by the direct API engines and unit-tested
 * with fixtures. Citations are only ever taken from what the provider returned (annotations, search
 * results, sources or links in the answer itself), never invented.
 */
import { EngineUnavailableError } from "./types";
import { CitationCollector, arr, num, obj, str, uniqueStrings } from "./util";

/**
 * OpenAI-style Responses API output (OpenAI, xAI, Perplexity Agent, Meta Model API, Moonshot,
 * DashScope). Collects url_citation annotations, search_results items and web_search_call sources /
 * queries. Returns the answer text.
 */
export function parseResponsesOutput(json: Record<string, unknown>, cites: CitationCollector, fanouts: string[]): string {
  const parts: string[] = [];
  for (const item of arr(json.output)) {
    const it = obj(item);
    const type = str(it.type);
    if (type === "message") {
      for (const c of arr(it.content)) {
        const part = obj(c);
        if (part.type === "output_text" || part.type === "text") {
          const t = str(part.text);
          if (t) parts.push(t);
          for (const a of arr(part.annotations)) {
            const an = obj(a);
            if (an.type === "url_citation") {
              const nested = obj(an.url_citation);
              const title = str(an.title) ?? str(nested.title);
              cites.add(an.url ?? nested.url, title && !/^\d+$/.test(title) ? title : null);
            }
          }
        }
      }
    } else if (type === "search_results") {
      for (const r of arr(it.results)) {
        const res = obj(r);
        cites.add(res.url, res.title);
      }
      fanouts.push(...uniqueStrings(arr(it.queries)));
    } else if (type === "web_search_call") {
      const action = obj(it.action);
      fanouts.push(...uniqueStrings([...arr(action.queries), action.query]));
      for (const s of arr(action.sources)) {
        const src = obj(s);
        cites.add(src.url, src.title);
      }
    }
  }
  return parts.join("\n\n").trim();
}

/** Number of web searches reported in a Responses API output (web_search_call items). */
export function countResponsesSearches(json: Record<string, unknown>): number {
  return arr(json.output).filter((i) => obj(i).type === "web_search_call").length;
}

/** Removes reasoning blocks some OpenAI-compatible models inline into `content`. */
export function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

/**
 * OpenAI-compatible chat completion (`choices[0].message`). Collects citations from
 * `message.annotations` (flat or OpenRouter's nested `url_citation`), top-level `citations` and
 * `search_results`. Returns the answer text.
 */
export function parseChatCompletion(json: Record<string, unknown>, cites: CitationCollector): { text: string; finishReason: string | null } {
  const choice = obj(arr(json.choices)[0]);
  const message = obj(choice.message);
  let text = "";
  if (typeof message.content === "string") text = message.content;
  else
    text = arr(message.content)
      .map((p) => str(obj(p).text) ?? "")
      .join("");
  for (const a of arr(message.annotations)) {
    const an = obj(a);
    if (an.type !== "url_citation") continue;
    const nested = obj(an.url_citation);
    cites.add(nested.url ?? an.url, str(nested.title) ?? str(an.title));
  }
  for (const r of arr(json.search_results)) {
    const sr = obj(r);
    cites.add(sr.url, sr.title);
  }
  for (const c of arr(json.citations)) cites.add(typeof c === "string" ? c : obj(c).url, typeof c === "string" ? null : obj(c).title);
  return { text: stripThinking(text), finishReason: str(choice.finish_reason) };
}

/**
 * Links an engine printed in its own answer ("[Title](https://…)" or bare URLs). Only used for
 * engines whose API puts the sources of its web search into the answer text (e.g. Maritaca).
 */
export function collectAnswerLinks(text: string, cites: CitationCollector): void {
  const md = /\[([^\]\n]{0,300})\]\((https?:\/\/[^)\s]+)\)/g;
  const covered: [number, number][] = [];
  for (const m of text.matchAll(md)) {
    const title = m[1]!.trim();
    cites.add(trimUrl(m[2]!), title && !/^\d+$/.test(title) && !/^https?:\/\//i.test(title) ? title : null);
    covered.push([m.index!, m.index! + m[0].length]);
  }
  for (const m of text.matchAll(/https?:\/\/[^\s<>()\]"'`]+/g)) {
    const at = m.index!;
    if (covered.some(([s, e]) => at >= s && at < e)) continue;
    cites.add(trimUrl(m[0]), null);
  }
}

/** Drops trailing punctuation that belongs to the sentence, not the URL. */
function trimUrl(url: string): string {
  return url.replace(/[.,;:!?*_]+$/, "");
}

/**
 * DashScope native text-generation response (`parameters.result_format = "message"`, web search with
 * `search_options.enable_source`). Sources live in `output.search_info.search_results`.
 */
export function parseDashscopeGeneration(
  json: Record<string, unknown>,
  cites: CitationCollector,
): { text: string; searches: number; inputTokens: number; outputTokens: number } {
  const output = obj(json.output);
  const message = obj(obj(arr(output.choices)[0]).message);
  const text = stripThinking(
    typeof message.content === "string"
      ? message.content
      : (str(output.text) ??
          arr(message.content)
            .map((p) => str(obj(p).text) ?? "")
            .join("")),
  );
  const results = arr(obj(output.search_info).search_results)
    .map((r) => obj(r))
    .sort((a, b) => (num(a.index) ?? 0) - (num(b.index) ?? 0));
  for (const r of results) cites.add(r.url, r.title);
  const usage = obj(json.usage);
  const search = obj(obj(usage.plugins).search);
  return {
    text,
    searches: num(search.count) ?? (results.length ? 1 : 0),
    inputTokens: num(usage.input_tokens) ?? 0,
    outputTokens: num(usage.output_tokens) ?? 0,
  };
}

/** Removes DashScope/Qwen reference markers ("[ref_1]") left in the text. */
export function stripRefMarkers(text: string): string {
  return text.replace(/\[ref_\d+\]/g, "").replace(/[ \t]+\n/g, "\n");
}

/** Web searches reported in an OpenAI-compatible `usage` block (OpenRouter, Maritaca …). */
export function chatSearchCount(usage: Record<string, unknown>, fallback: number): number {
  const serverTool = num(obj(usage.server_tool_use).web_search_requests);
  if (serverTool != null) return serverTool;
  const details = obj(usage.tool_execution_details);
  const webSearch = num(details.web_search) ?? num(obj(details.web_search).count);
  return webSearch ?? fallback;
}

/** Admin-set DashScope base URL (https only), without trailing slash. */
export function qwenBase(url: string): string {
  const fallback = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
  try {
    const u = new URL(url.trim() || fallback);
    if (u.protocol !== "https:" || u.username || u.password) throw new Error("not a plain https URL");
    return `${u.origin}${u.pathname}`.replace(/\/+$/, "");
  } catch {
    throw new EngineUnavailableError("The Qwen base URL in Admin → AI Providers must be an https:// URL.", "not_configured");
  }
}

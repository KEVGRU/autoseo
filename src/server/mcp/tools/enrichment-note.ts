import "server-only";
import type { McpTool } from "../types";

/**
 * SEO data tools can be answered by AI estimates when DataForSEO isn't connected. This wrapper makes that explicit
 * for agents: the tool description says so, and every AI-sourced result carries a note next to the data.
 */

const DESCRIPTION_SUFFIX =
  ' Without DataForSEO (Admin → Data Providers) the data is an AI estimate from an LLM with web search — labelled via dataSource/enrichment.source = "ai".';

/** Finds an AI source marker (`dataSource.source === "ai"` / `enrichment.source === "ai"`) in a result payload. */
export function findAiSource(value: unknown, depth = 0): { model?: string | null; confidence?: string | null } | null {
  if (depth > 4 || value == null || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const v of value.slice(0, 20)) {
      const hit = findAiSource(v, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  const obj = value as Record<string, unknown>;
  for (const key of ["dataSource", "enrichment"]) {
    const s = obj[key] as Record<string, unknown> | undefined;
    if (s && s.source === "ai") {
      const meta = (s.meta as Record<string, unknown> | undefined) ?? s;
      return {
        model: (meta.model as string | undefined) ?? null,
        confidence: (meta.confidence as string | undefined) ?? null,
      };
    }
  }
  if (obj.source === "ai" && ("runId" in obj || "tool" in obj)) return {};
  for (const v of Object.values(obj)) {
    const hit = findAiSource(v, depth + 1);
    if (hit) return hit;
  }
  return null;
}

export function aiSourceNote(hit: { model?: string | null; confidence?: string | null }): string {
  const details = [hit.model ? `model ${hit.model}` : null, hit.confidence ? `confidence ${hit.confidence}` : null].filter(Boolean).join(", ");
  return `\n\n> Data source: AI estimate (LLM with web search${details ? `; ${details}` : ""}) — not measured DataForSEO data. URLs were verified; volumes, traffic and positions are estimates.`;
}

export function withEnrichmentNote<T extends McpTool[]>(tools: T): T {
  return tools.map((tool) => ({
    ...tool,
    description: /DataForSEO/.test(tool.description) ? `${tool.description}${DESCRIPTION_SUFFIX}` : tool.description,
    async handler(args: Parameters<typeof tool.handler>[0], ctx: Parameters<typeof tool.handler>[1]) {
      const res = await tool.handler(args, ctx);
      const hit = findAiSource(res.data);
      return hit ? { ...res, text: `${res.text}${aiSourceNote(hit)}` } : res;
    },
  })) as T;
}

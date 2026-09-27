import "server-only";
import { z } from "zod";
import { ENGINES } from "@/lib/engines";
import type { AiFilterInput } from "./ai-data";
import { ApiError } from "./errors";

/** Query parameters shared by the analytics endpoints (finseo naming + MCP-style aliases). */
export const filterQuery = {
  timeframe: z
    .string()
    .regex(/^\d{1,3}d?$/, "Use e.g. 7d, 14d, 30d, 90d")
    .optional()
    .describe("Look-back window ending today, e.g. 7d, 30d (default 30d)."),
  timeframeDays: z.coerce.number().int().min(1).max(730).optional().describe("Alternative to timeframe (number of days)."),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional().describe("Custom period start (UTC day); overrides timeframe."),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional().describe("Custom period end (default today)."),
  model: z.array(z.string().max(40)).max(ENGINES.length).optional().describe("AI model / engine id(s), e.g. chatgpt, perplexity, ai_overview."),
  tags: z.array(z.string().max(80)).max(50).optional().describe("Tag names or ids (prompts with any of the tags)."),
  market: z
    .array(z.string().regex(/^[A-Za-z]{2}$/, "Use ISO country codes, e.g. DE"))
    .max(20)
    .optional()
    .describe("Only answers asked in these markets (ISO country codes, e.g. DE,FR). Prompts can run in several markets."),
  brandScope: z
    .enum(["tracked", "all"])
    .optional()
    .describe("Brand set for position, share of voice, #1 / top-3 share and citation share: tracked = your brand + competitor list (default), all = every brand AI names."),
  funnelStage: z.array(z.enum(["tofu", "mofu", "bofu"])).max(3).optional().describe("Only prompts in these funnel stages."),
  intent: z.array(z.string().max(80)).max(20).optional().describe("Only prompts with these intents (as set in prompt research)."),
  persona: z.array(z.string().max(80)).max(20).optional().describe("Only prompts for these personas."),
  modelVersion: z.array(z.string().max(120)).max(20).optional().describe("Only answers produced by these model versions (see /metrics/models)."),
  simulated: z
    .enum(["include", "exclude"])
    .optional()
    .describe('Answers of the AI simulation (engines without a live backend, provider "ai") — include (default) or exclude them from every number.'),
};

/** Keys that may repeat / be comma-separated in the query string. */
export const FILTER_ARRAY_KEYS = ["model", "tags", "market", "funnelStage", "intent", "persona", "modelVersion"];

export function toAiFilter(q: {
  timeframe?: string;
  timeframeDays?: number;
  startDate?: string;
  endDate?: string;
  model?: string[];
  tags?: string[];
  market?: string[];
  brandScope?: "tracked" | "all";
  funnelStage?: ("tofu" | "mofu" | "bofu")[];
  intent?: string[];
  persona?: string[];
  modelVersion?: string[];
  simulated?: "include" | "exclude";
}): AiFilterInput {
  const days = q.timeframeDays ?? (q.timeframe ? Number.parseInt(q.timeframe, 10) : undefined);
  if (days !== undefined && (!Number.isFinite(days) || days < 1 || days > 730)) {
    throw new ApiError("validation_error", "timeframe must be between 1d and 730d.");
  }
  return {
    timeframeDays: days,
    startDate: q.startDate,
    endDate: q.endDate,
    model: q.model,
    tags: q.tags,
    market: q.market,
    brandScope: q.brandScope,
    funnelStage: q.funnelStage,
    intent: q.intent,
    persona: q.persona,
    modelVersion: q.modelVersion,
    simulated: q.simulated,
  };
}

export const paginationQuery = {
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
};

export function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  return {
    items: items.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export type ProjectParams = { projectId: string };

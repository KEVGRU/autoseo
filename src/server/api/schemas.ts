import "server-only";
import { z } from "zod";
import { ENGINES } from "@/lib/engines";
import { METRIC_KEYS, type MetricKey } from "@/features/ai-insights/lib/metrics";
import { filterQuery, paginationQuery } from "./rest";
import { EXPORT_DATASETS, EXPORT_FORMATS, SINCE_RE } from "./export-format";

/**
 * Request schemas of the REST API v1 — used for validation in the route handlers and to
 * generate the OpenAPI document, so docs and behaviour never drift apart.
 */

export const filterOnlyQuery = z.object(filterQuery);

export const projectsListQuery = z.object({ ...paginationQuery, search: z.string().max(200).optional().describe("Filter by name or domain.") });

export const promptsListQuery = z.object({
  ...filterQuery,
  ...paginationQuery,
  search: z.string().max(200).optional().describe("Case-insensitive text search."),
  status: z.enum(["active", "archived", "all"]).default("active"),
  language: z.string().min(2).max(8).optional().describe("Only prompts in this language (e.g. de)."),
  country: z.string().length(2).optional().describe("Only prompts for this market (ISO code)."),
});

export const promptsCreateBody = z.object({
  prompts: z
    .array(
      z.union([
        z.string().trim().min(3).max(2000),
        z.object({
          text: z.string().trim().min(3).max(2000),
          country: z.string().length(2).optional(),
          markets: z.array(z.string().length(2)).min(1).max(20).optional().describe("Ask this prompt in several markets (first = primary)."),
          language: z.string().min(2).max(8).optional(),
          tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
        }),
      ]),
    )
    .min(1)
    .max(500)
    .describe("Prompt texts or prompt objects."),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional().describe("Tags applied to every prompt (created if missing)."),
  country: z.string().length(2).optional().describe("Default market for the prompts (project market if omitted)."),
  markets: z
    .array(z.string().length(2))
    .min(1)
    .max(20)
    .optional()
    .describe(
      "Ask every prompt in these markets (ISO codes, first = primary; one AI answer per prompt × market × model). Overrides country. Default: the project's default markets (Model Settings).",
    ),
  models: z.array(z.string()).max(ENGINES.length).optional().describe("Restrict the prompts to these AI models."),
  runNow: z.boolean().default(true).describe("Start a tracking run for the new prompts right away."),
});

export const surfacesQuery = z.object({
  ...filterQuery,
  limit: z.coerce.number().int().min(1).max(500).default(50).describe("Max prompts in the per-prompt breakdown."),
});

export const answerQuery = z.object({ maxChars: z.coerce.number().int().min(500).max(200_000).optional().describe("Truncate the answer text.") });

export const competitorsQuery = z.object({
  ...filterQuery,
  ...paginationQuery,
  sortBy: z.enum(METRIC_KEYS as [MetricKey, ...MetricKey[]]).default("visibility"),
  order: z.enum(["asc", "desc"]).optional().describe("Default: desc (asc for avgPosition / mentionDepth)."),
  includeUntracked: z.enum(["true", "false"]).optional().describe("Include auto-discovered brands that are not on My List."),
});

export const sourcesQuery = z.object({
  ...filterQuery,
  ...paginationQuery,
  groupBy: z.enum(["url", "domain"]).default("url"),
  type: z.string().max(40).optional().describe("Content type: listicle, comparison, buying-guide, test, review, ugc, social, how-to, article, reference, video, retail, news, forum, brand, docs, other."),
  ownership: z.enum(["own", "competitor", "third_party"]).optional(),
  search: z.string().max(200).optional().describe("Substring of the URL."),
});

export const tagsCreateBody = z
  .object({
    name: z.string().trim().min(1).max(60).optional(),
    names: z.array(z.string().trim().min(1).max(60)).min(1).max(50).optional(),
    promptIds: z.array(z.string().max(64)).max(1000).optional().describe("Apply the tags to these prompts."),
    mode: z.enum(["add", "set"]).default("add").describe("add = keep existing tags, set = replace the prompts' tags."),
  })
  .refine((b) => b.name || b.names?.length, "Provide name or names.");

export const fanoutsQuery = z.object({
  ...filterQuery,
  ...paginationQuery,
  search: z.string().max(200).optional(),
  promptId: z.string().max(64).optional().describe("Only fan-outs of one prompt."),
  searchIntent: z
    .array(z.enum(["review", "comparison", "pricing", "alternatives", "freshness", "how-to", "other", "unclassified"]))
    .max(8)
    .optional()
    .describe("Only fan-out queries with these search intents (repeat or comma-separate). `intent` filters prompts by their intent."),
  coverage: z.enum(["covered", "partial", "gap", "unknown"]).optional().describe("Content coverage by your own pages (unknown = not checked yet)."),
});

export const fanoutDetailsQuery = z.object({ ...filterQuery, query: z.string().trim().min(1).max(500).describe("The fan-out query text.") });

export const exportQuery = z.object({
  ...filterQuery,
  dataset: z
    .enum(EXPORT_DATASETS)
    .optional()
    .describe("answers (default: prompts with metrics on page 1 + one row per AI answer), prompts, mentions (brands named per answer), citations (sources cited per answer) or fanouts (search sub-queries per answer)."),
  format: z.enum(EXPORT_FORMATS).default("json").describe("json (envelope), csv or ndjson (application/x-ndjson, one JSON object per line). csv/ndjson carry X-Total-Count / X-Total-Pages / X-High-Water-Mark headers."),
  since: z
    .string()
    .regex(SINCE_RE, "Use an ISO 8601 timestamp or YYYY-MM-DD")
    .optional()
    .describe("Incremental sync: only rows of answers stored at/after this instant (prompts: created or run since). Without timeframe/startDate the period starts at this day and answers of earlier days stored later are included. Pass the previous response's highWaterMark (rows at exactly that instant repeat — de-duplicate by id)."),
  includeText: z.enum(["true", "false"]).default("false").describe("Include the full answer text (answers dataset)."),
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  limit: z.coerce.number().int().min(1).max(5000).default(1000).describe("Rows per page (max 5000)."),
});

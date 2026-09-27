import "server-only";
import { S, type OpenApiOperation } from "../openapi-helpers";
import { competitorsQuery, exportQuery, sourcesQuery } from "../schemas";

const { ref, arr, num, int, str, strN, bool, obj } = S;
const date = { type: "string", format: "date" };
const dateTime = { type: "string", format: "date-time" };
const pagedMeta = { period: ref("Period"), pagination: ref("Pagination") };

/** Columns shared by every answer-level dataset row. */
const answerCols = { answerId: str, date, createdAt: { ...dateTime, description: "When the answer was stored (UTC) — use for `since`." }, promptId: str, prompt: str, country: str, language: str, model: str };

const mentionRow = obj({
  mentionId: str,
  ...answerCols,
  modelVersion: strN,
  brand: str,
  isOwnBrand: bool,
  competitorId: strN,
  position: { ...int, description: "Ordinal position among all brands named (1 = first)." },
  trackedPosition: { ...num, description: "Position among your brand + competitor list; null for untracked brands." },
  mentionDepth: { ...num, description: "Char offset of the first mention ÷ answer length (%)." },
  occurrences: int,
  cited: { ...bool, description: "The brand's domain is cited in the same answer." },
  recommended: bool,
  sentiment: { ...num, description: "0–100" },
  snippet: strN,
});

const citationRow = obj({
  citationId: str,
  ...answerCols,
  position: int,
  sourceId: str,
  url: str,
  domain: str,
  title: strN,
  contentType: strN,
  ownership: { type: "string", enum: ["own", "competitor", "third_party"] },
  competitorId: strN,
  competitor: strN,
});

const fanoutRow = obj({
  fanoutId: str,
  ...answerCols,
  query: str,
  intent: { type: ["string", "null"], enum: ["review", "comparison", "pricing", "alternatives", "freshness", "how-to", "other", null] },
  wordCount: num,
  coverage: { type: ["string", "null"], enum: ["covered", "partial", "gap", null], description: "Does the own site answer the sub-query?" },
  coverageUrl: strN,
});

const project = obj({ id: str, name: str, domain: str });

/** `data` of /export and /export/bulk (shape depends on `dataset`). */
export const EXPORT_DATA_SCHEMA = {
  oneOf: [
    obj(
      { project, prompts: { oneOf: [{ type: "null" }, arr(ref("Prompt"))], description: "Page 1 only" }, answers: arr(ref("ExportAnswer")) },
      { description: "dataset=answers (default)" },
    ),
    obj({ project, prompts: arr(ref("Prompt")) }, { description: "dataset=prompts" }),
    obj({ project, mentions: arr(mentionRow) }, { description: "dataset=mentions" }),
    obj({ project, citations: arr(citationRow) }, { description: "dataset=citations" }),
    obj({ project, fanouts: arr(fanoutRow) }, { description: "dataset=fanouts" }),
  ],
};

export const EXPORT_META = {
  ...pagedMeta,
  dataset: { type: "string", enum: ["answers", "prompts", "mentions", "citations", "fanouts"] },
  since: { ...dateTime, type: ["string", "null"] },
  highWaterMark: { ...dateTime, type: ["string", "null"], description: "Newest createdAt of all matching rows — pass it as `since` on the next sync." },
};

export const EXPORT_DESCRIPTION = [
  "Bulk export (export scope), paginated with page/limit (max 5,000 rows per page).",
  "`dataset`: answers (default — every prompt with metrics on page 1 plus one row per AI answer), prompts (prompts with period metrics), mentions (every brand named per answer), citations (every source cited per answer) or fanouts (search sub-queries per answer). All respect the period and the model / tags / market / funnelStage / intent / persona / modelVersion filters.",
  "`format`: json (envelope), csv or ndjson (`application/x-ndjson`, one JSON object per line). csv and ndjson carry the pagination in the X-Total-Count / X-Total-Pages headers and the sync cursor in X-High-Water-Mark.",
  "`since` (ISO timestamp or YYYY-MM-DD) returns only rows of answers stored at or after that instant (prompts: created or run since), ordered oldest first for stable paging. Without timeframe/startDate the period starts at that day and answers of earlier days that were stored later are included; with an explicit period both filters apply. Store `highWaterMark` and pass it as the next `since` (rows at exactly that instant are returned again — de-duplicate by id).",
].join("\n\n");

/** REST v1 operations: REST aliases (finseo endpoint names) and bulk export datasets. `/metrics/daily` is documented in openapi.ts. */
export const exportsOperations: OpenApiOperation[] = [
  {
    method: "get",
    path: "/projects/{projectId}/competitors/ranking",
    operationId: "getCompetitorRanking",
    summary: "Competitor ranking (alias)",
    description: "Alias of `GET /projects/{projectId}/competitors` (finseo endpoint name): your brand and competitors ranked by a metric, with changes vs the previous period.",
    tag: "Competitors",
    scope: "read",
    query: competitorsQuery,
    data: arr(ref("CompetitorRow")),
    meta: { ...pagedMeta, sortBy: str, order: str, brandScope: { type: "string", enum: ["tracked", "all"] }, totals: obj({ answers: int, prompts: int }) },
  },
  {
    method: "get",
    path: "/projects/{projectId}/sources/ranking",
    operationId: "getSourceRanking",
    summary: "Cited sources ranking (alias)",
    description: "Alias of `GET /projects/{projectId}/sources` (finseo endpoint name): pages or domains cited in AI answers, ranked by citations.",
    tag: "Sources",
    scope: "read",
    query: sourcesQuery,
    data: arr(ref("Source")),
    meta: { ...pagedMeta, groupedBy: str },
  },
  {
    method: "get",
    path: "/projects/{projectId}/export/bulk",
    operationId: "exportProjectBulk",
    summary: "Bulk export (alias)",
    description: `Alias of \`GET /projects/{projectId}/export\` (finseo endpoint name).\n\n${EXPORT_DESCRIPTION}`,
    tag: "Export",
    scope: "export",
    permission: "data.export",
    query: exportQuery,
    data: EXPORT_DATA_SCHEMA,
    meta: EXPORT_META,
    csv: true,
    ndjson: true,
  },
];

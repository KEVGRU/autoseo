import "server-only";
import { sql, type SQL } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/server/db/client";
import type { ApiProject } from "./auth";
import { buildAiScope, listPromptsWithMetrics, periodInfo, type AiScope } from "./ai-data";
import { answersToCsv, createdAtIso, exportAnswerWhere, exportProjectData, type ExportWindow } from "./export";
import {
  CITATION_CSV_COLUMNS,
  FANOUT_CSV_COLUMNS,
  MENTION_CSV_COLUMNS,
  PROMPT_CSV_COLUMNS,
  exportFilename,
  parseSince,
  promptChangedSince,
  rowsToCsv,
  toExportCitation,
  toExportFanout,
  toExportMention,
  toNdjson,
  type ExportCitation,
  type ExportDataset,
  type ExportFanout,
  type ExportMention,
  type ExportPrompt,
} from "./export-format";
import { ApiError } from "./errors";
import type { ApiResult } from "./handler";
import { toAiFilter } from "./rest";
import type { exportQuery } from "./schemas";

type Page = { page: number; limit: number };
type Pagination = { page: number; limit: number; total: number; totalPages: number };
type DatasetResult = { rows: unknown[]; pagination: Pagination; highWaterMark: string | null };

const pagination = (p: Page, total: number): Pagination => ({ page: p.page, limit: p.limit, total, totalPages: Math.max(1, Math.ceil(total / p.limit)) });

/** Runs `count + max(created_at)` and the page query of an answer-joined dataset. */
async function answerJoined(
  from: SQL,
  s: AiScope,
  w: ExportWindow,
  p: Page,
  columns: SQL,
  order: SQL,
  map: (r: Record<string, unknown>) => unknown,
): Promise<DatasetResult> {
  const where = exportAnswerWhere(s, w);
  const [head] = (await db.execute(
    sql`select count(*)::int n, ${createdAtIso(sql`max(a.created_at)`)} hw from ${from} where ${where}`,
  )) as unknown as { n: number; hw: string | null }[];
  const rows = (await db.execute(sql`
    select ${columns}, a.id answer_id, a.answer_date::text d, ${createdAtIso(sql`a.created_at`)} created_at,
      a.prompt_id, p.text prompt, a.country, a.language, a.engine
    from ${from}
    where ${where}
    order by ${w.since ? sql`a.created_at, a.id` : sql`a.answer_date desc, a.id`}, ${order}
    limit ${p.limit} offset ${(p.page - 1) * p.limit}`)) as unknown as Record<string, unknown>[];
  return { rows: rows.map(map), pagination: pagination(p, Number(head?.n ?? 0)), highWaterMark: head?.hw ?? null };
}

export function exportMentions(s: AiScope, w: ExportWindow, p: Page) {
  return answerJoined(
    sql`ai_mentions m join ai_answers a on a.id = m.answer_id join prompts p on p.id = a.prompt_id`,
    s,
    w,
    p,
    sql`m.id, a.model, m.brand_name, m.is_own, m.competitor_id, m.position, m.tracked_position, m.depth_pct, m.occurrences, m.cited, m.recommended, m.sentiment, m.snippet`,
    sql`m.position, m.id`,
    toExportMention,
  );
}

export function exportCitations(s: AiScope, w: ExportWindow, p: Page) {
  return answerJoined(
    sql`ai_citations c join ai_answers a on a.id = c.answer_id join prompts p on p.id = a.prompt_id
      join ai_sources src on src.id = c.source_id left join competitors comp on comp.id = src.competitor_id`,
    s,
    w,
    p,
    sql`c.id, c.position, src.id source_id, src.url, src.domain, src.title, src.content_type, src.ownership, src.competitor_id, comp.name competitor_name`,
    sql`c.position, c.id`,
    toExportCitation,
  );
}

export function exportFanouts(s: AiScope, w: ExportWindow, p: Page) {
  return answerJoined(
    sql`ai_fanouts f join ai_answers a on a.id = f.answer_id join prompts p on p.id = a.prompt_id`,
    s,
    w,
    p,
    sql`f.id, f.query, f.intent, f.word_count, f.coverage, f.coverage_url`,
    sql`f.id`,
    toExportFanout,
  );
}

/** Prompts with metrics for the period (all statuses); `since` keeps prompts created or run since then. */
export async function exportPrompts(s: AiScope, w: ExportWindow, p: Page): Promise<DatasetResult> {
  const all = (await listPromptsWithMetrics(s, { status: "all", page: 1, limit: 100_000 })).items as ExportPrompt[];
  const since = w.since;
  const list = since ? all.filter((x) => promptChangedSince(x, since)) : all;
  const hw = list.reduce<string | null>((m, x) => {
    const t = [x.createdAt, x.lastRunAt].filter((v): v is string => !!v).sort().at(-1) ?? null;
    return t && (!m || t > m) ? t : m;
  }, null);
  const start = (p.page - 1) * p.limit;
  return { rows: list.slice(start, start + p.limit), pagination: pagination(p, list.length), highWaterMark: hw };
}

type ExportQuery = z.infer<typeof exportQuery>;

function fileResponse(body: string, contentType: string, filename: string, pag: Pagination, hw: string | null): Response {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Total-Count": String(pag.total),
      "X-Total-Pages": String(pag.totalPages),
      ...(hw ? { "X-High-Water-Mark": hw } : {}),
    },
  });
}

/**
 * Shared handler of GET /export and /export/bulk. Without `dataset` the response is exactly the
 * original export (prompts on page 1 + answers). `since` without an explicit period drops the
 * lower answer-day bound so late answers of earlier days are not missed by incremental syncs.
 */
export async function runExport(project: ApiProject, q: ExportQuery): Promise<ApiResult> {
  const since = q.since ? parseSince(q.since) : null;
  if (q.since && !since) throw new ApiError("validation_error", "since must be an ISO 8601 timestamp or YYYY-MM-DD.");
  const explicitPeriod = !!(q.startDate || q.timeframe || q.timeframeDays != null);
  const filter = toAiFilter(q);
  if (since && !explicitPeriod) filter.startDate = since.toISOString().slice(0, 10);
  const scope = await buildAiScope(project, filter);
  const window: ExportWindow = { since, openStart: !explicitPeriod };
  const dataset: ExportDataset = q.dataset ?? "answers";
  const page = { page: q.page, limit: q.limit };
  const meta = { period: periodInfo(scope), dataset, since: since?.toISOString() ?? null };
  const fmt = q.format;

  if (dataset === "answers") {
    const includeText = q.includeText === "true";
    const res = await exportProjectData(scope, { ...page, includeText, ...window });
    const hw = res.highWaterMark;
    if (fmt === "csv") {
      const name = exportFilename(project.domain, "answers", scope.period.from, scope.period.to, q.page, "csv");
      return fileResponse(answersToCsv(res.answers, includeText), "text/csv; charset=utf-8", name, res.pagination, hw);
    }
    if (fmt === "ndjson") {
      const name = exportFilename(project.domain, "answers", scope.period.from, scope.period.to, q.page, "ndjson");
      return fileResponse(toNdjson(res.answers), "application/x-ndjson; charset=utf-8", name, res.pagination, hw);
    }
    return {
      data: { project: { id: project.id, name: project.name, domain: project.domain }, prompts: res.prompts ?? null, answers: res.answers },
      meta: { ...meta, pagination: res.pagination, highWaterMark: hw },
    };
  }

  const res =
    dataset === "prompts"
      ? await exportPrompts(scope, window, page)
      : dataset === "mentions"
        ? await exportMentions(scope, window, page)
        : dataset === "citations"
          ? await exportCitations(scope, window, page)
          : await exportFanouts(scope, window, page);
  if (fmt === "csv") {
    const csv =
      dataset === "prompts"
        ? rowsToCsv(res.rows as ExportPrompt[], PROMPT_CSV_COLUMNS)
        : dataset === "mentions"
          ? rowsToCsv(res.rows as ExportMention[], MENTION_CSV_COLUMNS)
          : dataset === "citations"
            ? rowsToCsv(res.rows as ExportCitation[], CITATION_CSV_COLUMNS)
            : rowsToCsv(res.rows as ExportFanout[], FANOUT_CSV_COLUMNS);
    const name = exportFilename(project.domain, dataset, scope.period.from, scope.period.to, q.page, "csv");
    return fileResponse(csv, "text/csv; charset=utf-8", name, res.pagination, res.highWaterMark);
  }
  if (fmt === "ndjson") {
    const name = exportFilename(project.domain, dataset, scope.period.from, scope.period.to, q.page, "ndjson");
    return fileResponse(toNdjson(res.rows), "application/x-ndjson; charset=utf-8", name, res.pagination, res.highWaterMark);
  }
  return {
    data: { project: { id: project.id, name: project.name, domain: project.domain }, [dataset]: res.rows },
    meta: { ...meta, pagination: res.pagination, highWaterMark: res.highWaterMark },
  };
}

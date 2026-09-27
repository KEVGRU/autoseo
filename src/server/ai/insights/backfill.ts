import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { classifySource, type Ownership } from "@/server/ai/analysis/sources";
import { guessAspect } from "@/features/ai-insights/lib/aspects";
import { linkCatalogProducts, persistAdClickParams, persistFollowups } from "./answer-extras";
import { classifyFanouts } from "./fanouts";
import { rows } from "./filters";

/**
 * Idempotent backfill of the insight enrichments for data analyzed before they existed:
 * source content types (new types), statement aspects (keyword fallback), follow-up questions and
 * ad click parameters from stored raw payloads, fan-out word count / intent / coverage, catalog
 * matches. Safe to run repeatedly (only fills missing values; sources are re-classified).
 */

export type BackfillSummary = {
  projectId: string;
  sources: { checked: number; changed: number };
  aspects: { filled: number; remaining: number };
  followups: { answers: number; questions: number };
  ads: { answers: number; updated: number };
  fanouts: { classified: number; llm: number; remaining: number; coverage: number };
  catalog: { checked: number; matched: number };
};

const json = (v: unknown) => sql`${JSON.stringify(v)}::jsonb`;

async function reclassifySources(projectId: string) {
  const list = await rows<{ id: string; url: string; domain: string; title: string | null; ownership: Ownership; content_type: string }>(
    sql`select id, url, domain, title, ownership, content_type from ai_sources where project_id = ${projectId}`,
  );
  const changed = list
    .map((s) => ({ id: s.id, t: classifySource({ url: s.url, domain: s.domain, title: s.title, ownership: s.ownership }), cur: s.content_type }))
    .filter((s) => s.t !== s.cur)
    .map(({ id, t }) => ({ id, t }));
  for (let i = 0; i < changed.length; i += 1000) {
    await db.execute(sql`
      update ai_sources s set content_type = v.t from jsonb_to_recordset(${json(changed.slice(i, i + 1000))}) as v(id text, t text)
      where s.id = v.id and s.project_id = ${projectId}`);
  }
  return { checked: list.length, changed: changed.length };
}

async function fillAspects(projectId: string) {
  let filled = 0;
  // 1. By (theme, attribute) — few distinct combinations cover most statements.
  const combos = await rows<{ theme: string | null; attribute: string | null }>(sql`
    select distinct theme, attribute from ai_statements where project_id = ${projectId} and aspect is null and (theme is not null or attribute is not null)`);
  const byCombo = combos.map((c) => ({ theme: c.theme ?? "", attribute: c.attribute ?? "", aspect: guessAspect(c) })).filter((c) => c.aspect);
  for (let i = 0; i < byCombo.length; i += 1000) {
    const res = await db.execute(sql`
      update ai_statements s set aspect = v.aspect from jsonb_to_recordset(${json(byCombo.slice(i, i + 1000))}) as v(theme text, attribute text, aspect text)
      where s.project_id = ${projectId} and s.aspect is null and coalesce(s.theme, '') = v.theme and coalesce(s.attribute, '') = v.attribute`);
    filled += Number((res as unknown as { count?: number }).count ?? 0);
  }
  // 2. Remaining statements by their quote.
  let lastId = "";
  for (let round = 0; round < 40; round++) {
    const rest = await rows<{ id: string; quote: string }>(sql`
      select id, quote from ai_statements where project_id = ${projectId} and aspect is null and id > ${lastId} order by id limit 5000`);
    if (!rest.length) break;
    lastId = rest[rest.length - 1]!.id;
    const vals = rest.map((r) => ({ id: r.id, aspect: guessAspect({ quote: r.quote }) })).filter((r) => r.aspect);
    if (vals.length) {
      await db.execute(sql`update ai_statements s set aspect = v.aspect from jsonb_to_recordset(${json(vals)}) as v(id text, aspect text) where s.id = v.id`);
      filled += vals.length;
    }
    if (rest.length < 5000) break;
  }
  const [left] = await rows<{ n: number }>(sql`select count(*)::int as n from ai_statements where project_id = ${projectId} and aspect is null`);
  return { filled, remaining: Number(left?.n ?? 0) };
}

async function fillFollowupsAndAds(projectId: string) {
  const out = { followups: { answers: 0, questions: 0 }, ads: { answers: 0, updated: 0 } };
  let lastId = "";
  for (;;) {
    const list = await rows<{ id: string; project_id: string; prompt_id: string; engine: string; answer_date: string; status: string; raw: Record<string, unknown> | null; has_followups: boolean }>(sql`
      select a.id, a.project_id, a.prompt_id, a.engine, a.answer_date::text as answer_date, a.status, a.raw,
             exists (select 1 from ai_followups u where u.answer_id = a.id) as has_followups
      from ai_answers a
      where a.project_id = ${projectId} and a.status = 'ok' and a.id > ${lastId}
        and (a.raw->'provider' ?| array['relatedSearches', 'peopleAlsoAsk', 'relatedQuestions'] or jsonb_array_length(coalesce(a.raw->'ads', '[]'::jsonb)) > 0)
      order by a.id limit 500`);
    if (!list.length) break;
    for (const a of list) {
      if (!a.has_followups) {
        const n = await persistFollowups(a);
        if (n) {
          out.followups.answers++;
          out.followups.questions += n;
        }
      }
      const ads = await persistAdClickParams(projectId, a.raw);
      if (ads) {
        out.ads.answers++;
        out.ads.updated += ads;
      }
    }
    lastId = list[list.length - 1]!.id;
    if (list.length < 500) break;
  }
  return out;
}

export async function backfillInsights(projectId: string, opts: { llm?: boolean } = {}): Promise<BackfillSummary> {
  const sources = await reclassifySources(projectId);
  const aspects = await fillAspects(projectId);
  const extras = await fillFollowupsAndAds(projectId);
  const fanouts = { classified: 0, llm: 0, remaining: 0, coverage: 0 };
  for (let i = 0; i < 20; i++) {
    const r = await classifyFanouts(projectId, { llm: opts.llm });
    fanouts.classified += r.heuristic + r.llm + r.fallback;
    fanouts.llm += r.llm;
    fanouts.remaining = r.remaining;
    fanouts.coverage += r.coverage?.queries ?? 0;
    if (!r.remaining || !r.queries) break;
  }
  const catalog = await linkCatalogProducts(projectId, { relink: true });
  return { projectId, sources, aspects, followups: extras.followups, ads: extras.ads, fanouts, catalog };
}

import "server-only";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { aiFollowups } from "@/server/db/schema";
import { normalizeUrl, urlDomain } from "@/server/ai/analysis/sources";
import { enqueueJob } from "@/server/jobs/queue";
import { guessAspect } from "@/features/ai-insights/lib/aspects";
import { parseClickParams } from "@/features/ai-insights/lib/click-params";
import { wordCount } from "@/features/ai-insights/lib/fanout-intents";
import { buildCatalogIndex, gtinsFromAttributes, matchCatalogProduct, type CatalogIndex } from "./catalog-match";
import { extractFollowups } from "./followups";
import { rows } from "./filters";

/**
 * Insight enrichment of one analyzed answer (called by `analyzeAnswer` after its transaction, and
 * by the backfill): follow-up questions, fan-out word counts + inherited intent/coverage, ad click
 * parameters, statement aspects (keyword fallback) and catalog matches of products. Idempotent.
 */

type RawAd = { advertiser?: unknown; advertiserDomain?: unknown; headline?: unknown; landingUrl?: unknown };

/** Same fingerprint `analyzeAnswer` stores on `ai_ads` (advertiser domain | headline | landing URL). */
export function adFingerprint(a: { advertiser: string; advertiserDomain?: string | null; headline: string; landingUrl?: string | null }): string {
  const landing = normalizeUrl(a.landingUrl ?? null);
  const advDomain = a.advertiserDomain?.toLowerCase().replace(/^www\./, "") ?? (landing ? urlDomain(landing) : null);
  return createHash("sha256")
    .update(`${(advDomain ?? a.advertiser).toLowerCase()}|${a.headline.trim().toLowerCase()}|${landing ?? ""}`)
    .digest("hex");
}

const json = (v: unknown) => sql`${JSON.stringify(v)}::jsonb`;

/* ───────────────────────────── Catalog index cache ───────────────────────────── */

const catalogCache = new Map<string, { at: number; idx: CatalogIndex }>();
const CATALOG_TTL = 120_000;

export async function catalogIndex(projectId: string): Promise<CatalogIndex> {
  const hit = catalogCache.get(projectId);
  if (hit && Date.now() - hit.at < CATALOG_TTL) return hit.idx;
  const entries = await rows<{ id: string; name: string; url: string | null; gtin: string | null }>(
    sql`select id, name, url, gtin from catalog_products where project_id = ${projectId}`,
  );
  const idx = buildCatalogIndex(entries);
  if (catalogCache.size > 200) catalogCache.clear();
  catalogCache.set(projectId, { at: Date.now(), idx });
  return idx;
}

export function invalidateCatalogIndex(projectId: string) {
  catalogCache.delete(projectId);
}

/** Matches AI products (all, or the given ids) to the catalog. `relink` also re-checks matched ones. */
export async function linkCatalogProducts(projectId: string, opts: { productIds?: string[]; relink?: boolean } = {}): Promise<{ checked: number; matched: number }> {
  const idx = await catalogIndex(projectId);
  if (opts.productIds && !opts.productIds.length) return { checked: 0, matched: 0 };
  const list = await rows<{ id: string; name: string; attributes: Record<string, string> | null; urls: string[] | null; current: string | null }>(sql`
    select p.id, p.name, p.attributes, p.catalog_product_id as current,
           (select array_agg(distinct pa.url) from ai_product_appearances pa where pa.product_id = p.id and pa.url is not null) as urls
    from ai_products p
    where p.project_id = ${projectId}
      ${opts.productIds ? sql`and p.id in ${opts.productIds}` : sql``}
      ${opts.relink ? sql`` : sql`and p.catalog_product_id is null`}`);
  const updates: { id: string; cat: string | null }[] = [];
  let matched = 0;
  for (const p of list) {
    const m = idx.size ? matchCatalogProduct({ name: p.name, urls: p.urls ?? [], gtins: gtinsFromAttributes(p.attributes) }, idx) : null;
    if (m) matched++;
    const cat = m?.catalogProductId ?? null;
    if (cat !== p.current) updates.push({ id: p.id, cat });
  }
  for (let i = 0; i < updates.length; i += 500) {
    await db.execute(sql`
      update ai_products p set catalog_product_id = v.cat
      from jsonb_to_recordset(${json(updates.slice(i, i + 500))}) as v(id text, cat text)
      where p.id = v.id and p.project_id = ${projectId}`);
  }
  return { checked: list.length, matched };
}

/* ───────────────────────────── Per answer ───────────────────────────── */

type AnswerRef = { id: string; project_id: string; prompt_id: string; engine: string; answer_date: string; status: string; raw: Record<string, unknown> | null };

/** Replaces the follow-up questions of one answer with those in its stored raw payload. */
export async function persistFollowups(a: AnswerRef): Promise<number> {
  await db.execute(sql`delete from ai_followups where answer_id = ${a.id}`);
  const followups = a.status === "ok" ? extractFollowups(a.raw) : [];
  if (followups.length) {
    await db
      .insert(aiFollowups)
      .values(followups.map((f) => ({ answerId: a.id, projectId: a.project_id, promptId: a.prompt_id, engine: a.engine, answerDate: a.answer_date, question: f.question, kind: f.kind })));
  }
  return followups.length;
}

/** Click parameters for the ads of one answer (from the untrimmed landing URLs in its raw payload). */
export async function persistAdClickParams(projectId: string, raw: Record<string, unknown> | null, opts: { overwrite?: boolean } = {}): Promise<number> {
  const rawAds = Array.isArray(raw?.ads) ? (raw!.ads as RawAd[]) : [];
  const adVals: { fp: string; params: Record<string, string> }[] = [];
  for (const ad of rawAds) {
    if (typeof ad?.advertiser !== "string" || typeof ad.headline !== "string") continue;
    const landingUrl = typeof ad.landingUrl === "string" ? ad.landingUrl : null;
    const params = parseClickParams(landingUrl);
    if (!params) continue;
    adVals.push({
      fp: adFingerprint({ advertiser: ad.advertiser, advertiserDomain: typeof ad.advertiserDomain === "string" ? ad.advertiserDomain : null, headline: ad.headline, landingUrl }),
      params,
    });
  }
  if (!adVals.length) return 0;
  await db.execute(sql`
    update ai_ads d set click_params = v.params
    from jsonb_to_recordset(${json(adVals)}) as v(fp text, params jsonb)
    where d.project_id = ${projectId} and d.fingerprint = v.fp ${opts.overwrite ? sql`` : sql`and d.click_params is null`}`);
  return adVals.length;
}

export type ExtrasSummary = { followups: number; fanouts: number; unclassified: number; ads: number; aspects: number; products: number };

export async function enrichAnalyzedAnswer(answerId: string, opts: { enqueueClassify?: boolean } = {}): Promise<ExtrasSummary> {
  const out: ExtrasSummary = { followups: 0, fanouts: 0, unclassified: 0, ads: 0, aspects: 0, products: 0 };
  const [a] = await rows<{ id: string; project_id: string; workspace_id: string; prompt_id: string; engine: string; answer_date: string; status: string; raw: Record<string, unknown> | null }>(sql`
    select a.id, a.project_id, p.workspace_id, a.prompt_id, a.engine, a.answer_date::text as answer_date, a.status, a.raw
    from ai_answers a join projects p on p.id = a.project_id where a.id = ${answerId}`);
  if (!a) return out;

  out.followups = await persistFollowups(a);

  // Fan-outs: word count + intent/coverage inherited from the same query seen before.
  const fans = await rows<{ id: string; query: string; intent: string | null }>(sql`select id, query, intent from ai_fanouts where answer_id = ${answerId}`);
  if (fans.length) {
    const keys = [...new Set(fans.map((f) => f.query.trim().toLowerCase()))];
    const known = await rows<{ k: string; intent: string | null; coverage: string | null; coverage_url: string | null }>(sql`
      select distinct on (lower(trim(query))) lower(trim(query)) as k, intent, coverage, coverage_url
      from ai_fanouts
      where project_id = ${a.project_id} and answer_id <> ${answerId} and intent is not null and lower(trim(query)) in ${keys}
      order by lower(trim(query)), answer_date desc`);
    const byKey = new Map(known.map((k) => [k.k, k]));
    const vals = fans.map((f) => {
      const k = byKey.get(f.query.trim().toLowerCase());
      return { id: f.id, wc: wordCount(f.query), intent: f.intent ?? k?.intent ?? null, coverage: k?.coverage ?? null, url: k?.coverage_url ?? null };
    });
    await db.execute(sql`
      update ai_fanouts f set word_count = v.wc, intent = coalesce(f.intent, v.intent),
             coverage = coalesce(f.coverage, v.coverage), coverage_url = coalesce(f.coverage_url, v.url)
      from jsonb_to_recordset(${json(vals)}) as v(id text, wc int, intent text, coverage text, url text)
      where f.id = v.id`);
    out.fanouts = fans.length;
    out.unclassified = vals.filter((v) => !v.intent).length;
    if (out.unclassified && opts.enqueueClassify !== false) {
      // Batched per project a minute later, so one tracking run classifies its new queries together.
      await enqueueJob(
        "ai.fanouts.classify",
        { projectId: a.project_id },
        { projectId: a.project_id, workspaceId: a.workspace_id, dedupeKey: `ai.fanouts.classify:${a.project_id}`, runAt: new Date(Date.now() + 60_000), maxAttempts: 2 },
      );
    }
  }

  // Ads: click parameters of the raw (untrimmed) landing URLs.
  out.ads = await persistAdClickParams(a.project_id, a.raw);

  // Statements without an LLM aspect → keyword fallback.
  const st = await rows<{ id: string; theme: string | null; attribute: string | null; quote: string }>(
    sql`select id, theme, attribute, quote from ai_statements where answer_id = ${answerId} and aspect is null`,
  );
  const aspects = st.map((s) => ({ id: s.id, aspect: guessAspect(s) })).filter((s) => s.aspect);
  if (aspects.length) {
    await db.execute(sql`
      update ai_statements s set aspect = v.aspect from jsonb_to_recordset(${json(aspects)}) as v(id text, aspect text) where s.id = v.id`);
    out.aspects = aspects.length;
  }

  // Products of this answer → catalog.
  const prods = await rows<{ product_id: string }>(sql`select distinct product_id from ai_product_appearances where answer_id = ${answerId}`);
  if (prods.length) out.products = (await linkCatalogProducts(a.project_id, { productIds: prods.map((p) => p.product_id) })).matched;
  return out;
}

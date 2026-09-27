import "server-only";
import { sql, type SQL } from "drizzle-orm";
import type { projects } from "@/server/db/schema";
import { getBrands } from "./brands";
import { rows, scope, type InsightFilter } from "./filters";
import { getPromptMap } from "./prompts";

type ProjectRow = typeof projects.$inferSelect;

/**
 * Where competitors win: for every prompt tag (and every gap prompt) the competitor named most
 * in answers that do NOT name the own brand, and the domains those answers cite — the pages to
 * get listed on to close the gap.
 */

export type GapDomain = { domain: string; answers: number; ownership: string };

export type GapCell = {
  key: string;
  label: string;
  answers: number;
  /** Answers naming the own brand (%). */
  ownRate: number | null;
  winner: { key: string; name: string; domain: string | null } | null;
  /** Answers in the group that name the winner but not the own brand. */
  gapAnswers: number;
  winnerRate: number | null;
  domains: GapDomain[];
};

export type CompetitorGaps = { byTag: GapCell[]; byPrompt: (GapCell & { country: string; tags: { id: string; name: string; color: string | null }[] })[] };

type Row = { g: string; answers: number; own: number; winner: string | null; win_n: number | null; gap_n: number | null; domains: GapDomain[] | null };

export async function getCompetitorGaps(project: ProjectRow, f: InsightFilter, competitorId?: string): Promise<CompetitorGaps> {
  const compFilter = competitorId ? sql`and m.competitor_id = ${competitorId}` : sql``;
  const query = (groupSql: SQL, joinSql: SQL) => sql`
    with ans as (
      select a.id, a.brand_mentioned, ${groupSql} as g
      from ai_answers a ${joinSql}
      where a.status = 'ok' and ${scope(f, "a")}
    ), comp as (
      select distinct m.answer_id, m.competitor_id from ai_mentions m
      where ${scope(f, "m")} and m.competitor_id is not null ${compFilter}
    ), tot as (
      select g, count(distinct id)::int as answers, (count(distinct id) filter (where brand_mentioned))::int as own from ans group by 1
    ), cell as (
      select ans.g, comp.competitor_id, count(distinct ans.id)::int as n,
             (count(distinct ans.id) filter (where not ans.brand_mentioned))::int as gap_n
      from ans join comp on comp.answer_id = ans.id group by 1, 2
    ), winner as (
      select distinct on (g) g, competitor_id, n, gap_n from cell order by g, gap_n desc, n desc, competitor_id
    ), dom as (
      select w.g, s.domain, min(s.ownership) as ownership, count(distinct ans.id)::int as n
      from winner w
      join ans on ans.g = w.g and not ans.brand_mentioned
      join comp on comp.answer_id = ans.id and comp.competitor_id = w.competitor_id
      join ai_citations c on c.answer_id = ans.id
      join ai_sources s on s.id = c.source_id
      where s.ownership <> 'own'
      group by 1, 2
    )
    select tot.g, tot.answers, tot.own, w.competitor_id as winner, w.n as win_n, w.gap_n,
           (select json_agg(json_build_object('domain', d.domain, 'answers', d.n, 'ownership', d.ownership) order by d.n desc, d.domain)
              from (select * from dom where dom.g = tot.g order by n desc, domain limit 3) d) as domains
    from tot left join winner w on w.g = tot.g
    order by coalesce(w.gap_n, 0) desc, tot.answers desc
    limit 200`;

  const [byTagRows, byPromptRows, brands, promptMap] = await Promise.all([
    rows<Row>(query(sql`l.tag_id`, sql`join prompt_tag_links l on l.prompt_id = a.prompt_id`)),
    rows<Row>(query(sql`a.prompt_id`, sql``)),
    getBrands(project),
    getPromptMap(project.id),
  ]);
  const byComp = new Map(brands.filter((b) => b.competitorId).map((b) => [b.competitorId!, b]));
  const tagNames = new Map<string, string>();
  for (const p of promptMap.values()) for (const t of p.tags) tagNames.set(t.id, t.name);

  const cell = (r: Row, label: string): GapCell => {
    const w = r.winner ? byComp.get(r.winner) : undefined;
    const answers = Number(r.answers);
    return {
      key: r.g,
      label,
      answers,
      ownRate: answers ? (Number(r.own) / answers) * 100 : null,
      winner: w && r.gap_n ? { key: w.key, name: w.name, domain: w.domain } : null,
      gapAnswers: Number(r.gap_n ?? 0),
      winnerRate: answers && r.win_n != null ? (Number(r.win_n) / answers) * 100 : null,
      domains: (r.domains ?? []).map((d) => ({ domain: d.domain, answers: Number(d.answers), ownership: d.ownership })),
    };
  };

  return {
    byTag: byTagRows.filter((r) => tagNames.has(r.g)).map((r) => cell(r, tagNames.get(r.g)!)),
    byPrompt: byPromptRows
      .filter((r) => promptMap.has(r.g) && Number(r.gap_n ?? 0) > 0)
      .slice(0, 100)
      .map((r) => {
        const p = promptMap.get(r.g)!;
        return { ...cell(r, p.text), country: p.country, tags: p.tags };
      }),
  };
}

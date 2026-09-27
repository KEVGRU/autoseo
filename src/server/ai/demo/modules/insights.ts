import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { backfillInsights } from "@/server/ai/insights/backfill";
import type { DemoPostStep } from "./context";

/**
 * Demo insight enrichments: runs the real backfill (aspects, fan-out intent/coverage, source
 * types, catalog matches) over the generated data, then adds sample follow-up questions (related
 * searches = fan-outs of the same prompt on other engines) and campaign parameters for demo ads.
 * Runs before task generation so fan-out coverage gaps become tasks.
 */
export const insightsPostSteps: DemoPostStep[] = [
  {
    name: "insights",
    run: async ({ projectId }) => {
      await db.execute(sql`delete from ai_followups where project_id = ${projectId}`);
      // Engines that show follow-up blocks: Perplexity (related questions), Google (related searches / PAA).
      const followups = await db.execute(sql`
        with ans as (
          select a.id, a.prompt_id, a.engine, a.answer_date
          from ai_answers a
          where a.project_id = ${projectId} and a.status = 'ok' and a.engine in ('perplexity', 'ai_overview', 'google_ai_mode')
            and a.answer_date >= current_date - 45
        ), pool as (
          select f.prompt_id, lower(trim(f.query)) as q, min(f.query) as query, count(*) as n
          from ai_fanouts f where f.project_id = ${projectId} group by 1, 2
        ), ranked as (
          select pool.*, row_number() over (partition by pool.prompt_id order by pool.n desc, pool.q) as rn from pool
        )
        insert into ai_followups (id, answer_id, project_id, prompt_id, engine, answer_date, question, kind)
        select 'fup_' || substr(md5(ans.id || r.q), 1, 16), ans.id, ${projectId}, ans.prompt_id, ans.engine, ans.answer_date,
               case when ans.engine = 'perplexity' then initcap(left(r.query, 1)) || substr(r.query, 2) || '?' else r.query end,
               case when ans.engine = 'perplexity' then 'followup' when r.rn % 2 = 0 then 'paa' else 'related' end
        from ans join ranked r on r.prompt_id = ans.prompt_id and r.rn <= 4
        on conflict (id) do nothing`);
      const ads = await db.execute(sql`
        update ai_ads set click_params = jsonb_build_object(
          'utm_source', case when advertiser_domain like '%.example' then 'google' else 'ai' end,
          'utm_medium', 'cpc',
          'utm_campaign', regexp_replace(lower(headline), '[^a-z0-9]+', '-', 'g'),
          'gclid', 'demo-' || substr(md5(id), 1, 12))
        where project_id = ${projectId} and click_params is null`);
      const r = await backfillInsights(projectId, { llm: false });
      return {
        followups: Number((followups as unknown as { count?: number }).count ?? 0),
        adClickParams: Number((ads as unknown as { count?: number }).count ?? 0),
        aspects: r.aspects.filled,
        fanoutsClassified: r.fanouts.classified,
        sourcesReclassified: r.sources.changed,
        catalogMatched: r.catalog.matched,
      };
    },
  },
];

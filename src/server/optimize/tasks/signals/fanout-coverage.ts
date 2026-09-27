import "server-only";
import { sql } from "drizzle-orm";
import { FANOUT_INTENTS, fanoutIntentInfo } from "@/features/ai-insights/lib/fanout-intents";
import { clamp10, rows } from "./helpers";
import type { SignalContext, TaskFinding } from "./types";

type GapRow = { intent: string | null; query: string; n: number; prompts: number; prompt_texts: string[] | null; domains: string[] | null };

const COMMERCIAL = new Set(["pricing", "comparison", "alternatives", "review"]);

/**
 * Content gaps from query fan-outs: searches engines run while answering tracked prompts that no
 * own page covers (coverage computed against the sitemap / own cited pages / catalog), grouped by
 * search intent. Part of the `content_gap` signal.
 */
export async function fanoutGapFindings(ctx: SignalContext): Promise<{ findings: TaskFinding[]; evaluated: string[] }> {
  const [known] = await rows<{ n: number }>(sql`
    select count(*)::int as n from ai_fanouts where project_id = ${ctx.projectId} and answer_date >= ${ctx.sinceDate} and coverage is not null`);
  if (!Number(known?.n)) return { findings: [], evaluated: [] };
  const evaluated = FANOUT_INTENTS.map((i) => ctx.fingerprint(["fanout_gap", i]));

  const gaps = await rows<GapRow>(sql`
    select coalesce(f.intent, 'other') as intent, min(f.query) as query, count(*)::int as n, count(distinct f.prompt_id)::int as prompts,
           (array_agg(distinct p.text))[1:3] as prompt_texts,
           (select array_agg(distinct s.domain) from ai_citations c join ai_sources s on s.id = c.source_id
             where c.answer_id = any(array_agg(f.answer_id)) and s.ownership <> 'own') as domains
    from ai_fanouts f join prompts p on p.id = f.prompt_id and p.status = 'active'
    where f.project_id = ${ctx.projectId} and f.answer_date >= ${ctx.sinceDate} and f.coverage = 'gap'
    group by 1, lower(trim(f.query))
    order by n desc
    limit 400`);

  const byIntent = new Map<string, GapRow[]>();
  for (const g of gaps) {
    const k = g.intent ?? "other";
    if (!byIntent.has(k)) byIntent.set(k, []);
    byIntent.get(k)!.push(g);
  }

  const findings: TaskFinding[] = [];
  for (const [intent, list] of byIntent) {
    const searches = list.reduce((s, g) => s + Number(g.n), 0);
    if (list.length < 3 || searches < 5) continue;
    const top = list.slice(0, 10);
    const label = intent === "other" ? "general" : fanoutIntentInfo(intent).label.toLowerCase();
    const domainCounts = new Map<string, number>();
    for (const g of list) for (const d of g.domains ?? []) domainCounts.set(d, (domainCounts.get(d) ?? 0) + 1);
    const domains = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([d]) => d);
    let impact = 5 + (searches >= 50 ? 2 : searches >= 15 ? 1 : 0) + (COMMERCIAL.has(intent) ? 1 : 0);
    impact = clamp10(impact);
    const questions = top.map((g) => g.query);
    findings.push({
      subject: ["fanout_gap", intent],
      category: "content",
      title: `Cover ${list.length} ${label} searches AI runs without finding your pages`,
      summary: `Engines searched ${searches}× for ${label} queries none of your pages covers.`,
      description: [
        `While answering your tracked prompts, AI engines ran ${list.length} distinct **${label}** searches (${searches} times) that no page on your site covers — so they cite other sites instead.`,
        `Most frequent: ${questions.slice(0, 4).map((q) => `“${q}”`).join(", ")}.`,
        domains.length ? `Answers running these searches cite ${domains.slice(0, 4).join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      steps: [
        "Group the searches below by topic and decide which existing page to extend or which new page to create.",
        "Answer each search explicitly (own H2/H3 with a direct answer and concrete facts).",
        intent === "pricing"
          ? "Publish current prices, plans and total cost of ownership in a crawlable table."
          : intent === "comparison" || intent === "alternatives"
            ? "Add an honest comparison table (you vs. the alternatives searched) with specs, prices and use cases."
            : intent === "review"
              ? "Collect and show reviews, test results and certifications; link to independent reviews."
              : intent === "how-to"
                ? "Write step-by-step guides with HowTo structure, images and prerequisites."
                : "Keep facts, dates and figures current and state the update date on the page.",
        "Link the page from related pages and your sitemap; submit it for indexing.",
      ],
      acceptanceCriteria: ["The listed searches are covered by a page on your domain (coverage turns partial/covered on the Query Fanouts page)."],
      contentPlan: {
        format: intent === "comparison" || intent === "alternatives" ? "Comparison page" : intent === "how-to" ? "How-to guide" : intent === "pricing" ? "Pricing page" : "Answer page",
        workingTitle: questions[0] ? questions[0].charAt(0).toUpperCase() + questions[0].slice(1) : `${fanoutIntentInfo(intent).label} answers`,
        targetPrompt: top[0]?.prompt_texts?.[0] ?? questions[0] ?? "",
        wordCount: 1500,
        outline: ["Direct answer", ...questions.slice(0, 7).map((q) => q.charAt(0).toUpperCase() + q.slice(1)), "FAQ"],
        questions,
        entities: [ctx.project.name, ...ctx.competitors.filter((c) => c.tracked).slice(0, 4).map((c) => c.name)],
        schemaTypes: intent === "how-to" ? ["HowTo", "FAQPage"] : ["Article", "FAQPage"],
        notes: domains.length ? `Engines cite today: ${domains.join(", ")}.` : undefined,
      },
      impact,
      effort: 5,
      evidence: [
        { kind: "queries", label: `Uncovered ${label} fan-out searches`, items: top.map((g) => ({ label: g.query, value: Number(g.n), detail: `${g.prompts} prompt${Number(g.prompts) === 1 ? "" : "s"}` })) },
        { kind: "metric", label: "Searches without an own page", value: `${searches}×`, description: `${list.length} distinct queries` },
      ],
      datasets: ["Query fan-outs", "Brand knowledge (sitemap)"],
      targetUrls: [`/p/${ctx.projectId}/ai/tracker/fanouts?coverage=gap&searchIntent=${intent}`],
      targetPrompts: [...new Set(top.flatMap((g) => g.prompt_texts ?? []))].slice(0, 5),
      data: { intent, queries: list.length, searches, top: questions, citedDomains: domains },
    });
  }
  return { findings, evaluated };
}

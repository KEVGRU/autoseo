import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { competitors, projects, promptTags } from "@/server/db/schema";
import { ENGINES } from "@/lib/engines";
import { rows, scope, type InsightFilter } from "./filters";

export const OWN_KEY = "own";

/** A brand as shown in insight views: the own brand (key "own") or a competitor (key = id). */
export type BrandInfo = {
  key: string;
  competitorId: string | null;
  isOwn: boolean;
  name: string;
  domain: string | null;
  aliases: string[];
  color: string;
  tracked: boolean;
  source: "own" | "manual" | "auto" | "import" | "untracked";
  logoUrl: string | null;
};

/** Distinct from the brand green used for "You". */
const PALETTE = [
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#ec4899",
  "#64748b",
  "#8b5cf6",
  "#14b8a6",
  "#f43f5e",
  "#84cc16",
];
export const OWN_COLOR = "var(--brand)";
/** Brands AI names that are not on the competitor list (brand scope "all"). */
export const UNTRACKED_COLOR = "#94a3b8";

type ProjectRow = typeof projects.$inferSelect;

export async function getBrands(project: ProjectRow): Promise<BrandInfo[]> {
  const rowsC = await db
    .select()
    .from(competitors)
    .where(eq(competitors.projectId, project.id))
    .orderBy(asc(competitors.createdAt), asc(competitors.name));
  const own: BrandInfo = {
    key: OWN_KEY,
    competitorId: null,
    isOwn: true,
    name: project.name.replace(/^Demo · /, ""),
    domain: project.domain,
    aliases: project.brand?.aliases ?? [],
    color: OWN_COLOR,
    tracked: true,
    source: "own",
    logoUrl: project.logoUrl,
  };
  return [
    own,
    ...rowsC.map((c, i) => ({
      key: c.id,
      competitorId: c.id,
      isOwn: false,
      name: c.name,
      domain: c.domain,
      aliases: c.aliases ?? [],
      color: c.color && /^#[0-9a-f]{3,8}$/i.test(c.color) ? c.color : PALETTE[i % PALETTE.length]!,
      tracked: c.tracked,
      source: c.source,
      logoUrl: c.logoUrl,
    })),
  ];
}

export function brandMap(brands: BrandInfo[]) {
  return new Map(brands.map((b) => [b.key, b]));
}

export type FilterOptions = {
  engines: { value: string; label: string }[];
  tags: { value: string; label: string; color: string | null }[];
  /** Markets (ISO) with answers or configured on prompts (for the market filter). */
  markets: string[];
  /** Simulated answers (provider "ai") in the filter's period — badge of the "simulated" toggle. */
  simulatedAnswers: number;
};

/**
 * Options for the model/tag filters: the project's enabled engines plus any engine that has
 * answers (so historical data stays filterable), and all prompt tags.
 */
export async function getFilterOptions(project: ProjectRow, f?: InsightFilter): Promise<FilterOptions> {
  const [tagRows, engineRows, marketRows, simulatedRows] = await Promise.all([
    db
      .select({ id: promptTags.id, name: promptTags.name, color: promptTags.color })
      .from(promptTags)
      .where(eq(promptTags.projectId, project.id))
      .orderBy(asc(promptTags.name)),
    rows<{ engine: string }>(sql`select distinct engine from ai_answers where project_id = ${project.id}`),
    rows<{ market: string }>(sql`
      select distinct country as market from ai_answers where project_id = ${project.id}
      union
      select jsonb_array_elements_text(coalesce(markets, jsonb_build_array(country))) from prompts where project_id = ${project.id}`),
    // Counted even when excluded (the toggle shows how many answers it hides). Without a filter: last 30 days.
    rows<{ n: number }>(sql`
      select count(*)::int as n from ai_answers a
      where a.provider = 'ai' and a.status = 'ok' and ${
        f ? scope({ ...f, excludeSimulated: false }, "a") : sql`a.project_id = ${project.id} and a.answer_date >= current_date - 29`
      }`),
  ]);
  const ids = new Set<string>([...(project.engines ?? []), ...engineRows.map((r) => r.engine)]);
  const order = ENGINES.map((e) => e.id as string);
  return {
    engines: [...ids]
      .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))
      .map((id) => ({ value: id, label: ENGINES.find((e) => e.id === id)?.name ?? id })),
    tags: tagRows.map((t) => ({ value: t.id, label: t.name, color: t.color })),
    markets: [...new Set(marketRows.map((r) => r.market))].filter((m) => /^[A-Z]{2}$/.test(m)).sort(),
    simulatedAnswers: Number(simulatedRows[0]?.n ?? 0),
  };
}

/** Lower-cased names that identify a brand in answers (name + aliases). */
export function brandNames(b: { name: string; aliases?: string[] | null }): string[] {
  return [...new Set([b.name, ...(b.aliases ?? [])].map((n) => n.trim().toLowerCase()).filter(Boolean))];
}

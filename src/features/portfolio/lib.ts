/* Isomorphic portfolio helpers (types, filtering, totals, CSV) shared by the page, REST and MCP. */

export type PortfolioSeriesPoint = { date: string; visibility: number | null };

export type PortfolioRow = {
  projectId: string;
  name: string;
  domain: string;
  logoUrl: string | null;
  country: string;
  workspaceId: string;
  isPitch: boolean;
  pitchExpiresAt: string | null;
  paused: boolean;
  trackingFrequency: string;
  /** Answers / prompts with answers in the period (status ok, active prompts). */
  answers: number;
  prompts: number;
  /** Tracker KPIs (0–100) and change vs the previous period of equal length (percentage points). */
  visibility: number | null;
  visibilityDelta: number | null;
  mentionRate: number | null;
  shareOfVoice: number | null;
  shareOfVoiceDelta: number | null;
  /** Mean brand position where named (1 = named first); lower is better. */
  position: number | null;
  positionDelta: number | null;
  sentiment: number | null;
  sentimentDelta: number | null;
  /** Answers citing an own-domain page (counted once per answer) and their share of answers. */
  citations: number;
  citationsDelta: number | null;
  citationRate: number | null;
  openTasks: number;
  /** Open / in-progress tasks with impact ≥ HIGH_IMPACT. */
  openHighImpactTasks: number;
  /** Survey-attributed AI search revenue in the project's reporting currency. */
  aiRevenue: number;
  aiRevenuePrev: number;
  aiRevenueDelta: number | null;
  aiResponses: number;
  currency: string;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  series: PortfolioSeriesPoint[];
};

export type PortfolioPeriod = { from: string; to: string; days: number; previous: { from: string; to: string } };

export type PortfolioTotals = {
  projects: number;
  /** Projects with at least one answer in the period. */
  tracked: number;
  /** Mean visibility over tracked projects. */
  avgVisibility: number | null;
  avgVisibilityDelta: number | null;
  answers: number;
  openHighImpactTasks: number;
  /** AI revenue per reporting currency (never summed across currencies). */
  revenue: { currency: string; value: number; previous: number }[];
};

export type PortfolioOverview = { period: PortfolioPeriod; rows: PortfolioRow[]; totals: PortfolioTotals };

export const HIGH_IMPACT = 7;

export const PORTFOLIO_FILTERS = ["all", "active", "pitch", "paused"] as const;
export type PortfolioFilter = (typeof PORTFOLIO_FILTERS)[number];

export function isPortfolioFilter(v: string | null | undefined): v is PortfolioFilter {
  return (PORTFOLIO_FILTERS as readonly string[]).includes(v ?? "");
}

const round1 = (v: number) => Math.round(v * 10) / 10;

/** `num ÷ den × 100` rounded to 0.1, null when there is nothing to divide by. */
export function pct(num: number, den: number): number | null {
  return den > 0 ? round1((num / den) * 100) : null;
}

/** Current − previous rounded to 0.1 (null when either side is missing). */
export function delta(current: number | null | undefined, previous: number | null | undefined): number | null {
  return current == null || previous == null ? null : round1(current - previous);
}

/** Search (name / domain) + status chip filter. */
export function filterPortfolioRows(rows: PortfolioRow[], opts: { q?: string; filter?: PortfolioFilter }): PortfolioRow[] {
  const q = (opts.q ?? "").trim().toLowerCase();
  const filter = opts.filter ?? "all";
  return rows.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q) && !r.domain.toLowerCase().includes(q)) return false;
    if (filter === "pitch") return r.isPitch;
    if (filter === "paused") return r.paused;
    if (filter === "active") return !r.paused && !r.isPitch;
    return true;
  });
}

export function portfolioTotals(rows: PortfolioRow[]): PortfolioTotals {
  const tracked = rows.filter((r) => r.answers > 0 && r.visibility != null);
  const mean = (values: number[]) => (values.length ? round1(values.reduce((a, v) => a + v, 0) / values.length) : null);
  const withDelta = tracked.filter((r) => r.visibilityDelta != null);
  const revenue = new Map<string, { value: number; previous: number }>();
  for (const r of rows) {
    if (!r.aiRevenue && !r.aiRevenuePrev) continue;
    const cur = revenue.get(r.currency) ?? { value: 0, previous: 0 };
    cur.value += r.aiRevenue;
    cur.previous += r.aiRevenuePrev;
    revenue.set(r.currency, cur);
  }
  return {
    projects: rows.length,
    tracked: tracked.length,
    avgVisibility: mean(tracked.map((r) => r.visibility!)),
    avgVisibilityDelta: mean(withDelta.map((r) => r.visibilityDelta!)),
    answers: rows.reduce((a, r) => a + r.answers, 0),
    openHighImpactTasks: rows.reduce((a, r) => a + r.openHighImpactTasks, 0),
    revenue: [...revenue.entries()]
      .map(([currency, v]) => ({ currency, value: Math.round(v.value * 100) / 100, previous: Math.round(v.previous * 100) / 100 }))
      .sort((a, b) => b.value - a.value),
  };
}

/** Default table order: tracked projects by visibility (desc), then untracked by name. */
export function sortPortfolioRows(rows: PortfolioRow[]): PortfolioRow[] {
  return [...rows].sort((a, b) => {
    if (a.visibility == null && b.visibility == null) return a.name.localeCompare(b.name);
    if (a.visibility == null) return 1;
    if (b.visibility == null) return -1;
    return b.visibility - a.visibility || a.name.localeCompare(b.name);
  });
}

export const PORTFOLIO_CSV_HEADER = [
  "Project",
  "Domain",
  "Market",
  "Status",
  "Answers",
  "Visibility %",
  "Visibility Δ (pp)",
  "Share of voice %",
  "Share of voice Δ (pp)",
  "Avg position",
  "Avg position Δ",
  "Sentiment",
  "Sentiment Δ",
  "Citations",
  "Citation rate %",
  "Open tasks",
  "Open high-impact tasks",
  "AI revenue",
  "AI revenue Δ",
  "Currency",
  "Last run",
  "Period",
];

export function portfolioStatus(r: Pick<PortfolioRow, "isPitch" | "paused">): string {
  return [r.isPitch ? "pitch" : null, r.paused ? "paused" : null].filter(Boolean).join(" · ") || "active";
}

export function portfolioCsvRows(rows: PortfolioRow[], period: PortfolioPeriod): (string | number | null)[][] {
  return [
    PORTFOLIO_CSV_HEADER,
    ...rows.map((r) => [
      r.name,
      r.domain,
      r.country,
      portfolioStatus(r),
      r.answers,
      r.visibility,
      r.visibilityDelta,
      r.shareOfVoice,
      r.shareOfVoiceDelta,
      r.position,
      r.positionDelta,
      r.sentiment,
      r.sentimentDelta,
      r.citations,
      r.citationRate,
      r.openTasks,
      r.openHighImpactTasks,
      Math.round(r.aiRevenue * 100) / 100,
      r.aiRevenueDelta,
      r.currency,
      r.lastRunAt,
      `${period.from}..${period.to}`,
    ]),
  ];
}

/**
 * RFC 4180 CSV. Text cells starting with a formula character are prefixed with `'` (spreadsheet
 * injection); numbers are written as-is so negative deltas stay numeric.
 */
export function toPortfolioCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    if (v == null) return "";
    if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
    const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

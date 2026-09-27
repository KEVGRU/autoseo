/** Types shared between the tracker server queries and client components. */

export type KpiKey = "visibility" | "mentionRate" | "citationRate" | "position";

export type TrackerKpis = {
  answers: number;
  prompts: number;
  visible: number;
  /** Answers naming the brand. */
  mentioned: number;
  cited: number;
  /** Every occurrence of the brand name (finseo "Mentions"). */
  mentions: number;
  visibility: number | null;
  mentionRate: number | null;
  citationRate: number | null;
  position: number | null;
  mentionDepth: number | null;
  sentiment: number | null;
  shareOfVoice: number | null;
  /** Answers naming the brand first ÷ answers naming it. */
  firstShare: number | null;
  /** Answers naming the brand among the first three ÷ answers naming it. */
  top3Share: number | null;
  /** Answers citing the brand ÷ cited answers of all brands in the brand set. */
  citationShare: number | null;
  /** Google AI Overview answers in the period / share of them where an AI Overview was shown. */
  aiOverviewAnswers: number;
  aiOverviewPresence: number | null;
  /** Google AI Mode answers / share with an AI answer. */
  aiModeAnswers: number;
  aiModePresence: number | null;
  /** Answers from the AI simulation (provider "ai") included in these numbers. */
  simulatedAnswers: number;
};

export type KpiWithDelta = { current: TrackerKpis; previous: TrackerKpis };

export type DayPoint = {
  date: string;
  answers: number;
  visibility: number | null;
  mentionRate: number | null;
  citationRate: number | null;
  position: number | null;
  sentiment: number | null;
  both: number;
  mentionedOnly: number;
  citedOnly: number;
  none: number;
};

export type CompareSeries = { key: string; label: string; color?: string | null; values: Record<string, Partial<Record<KpiKey, number | null>>> };

export type PromptDay = {
  date: string;
  prompts: number;
  answers: number;
  improved: number;
  declined: number;
  even: number;
  details: { promptId: string; text: string; from: number; to: number }[];
};

export type FlowState = "both" | "mentioned" | "cited" | "none" | "new";
export type PromptFlow = {
  links: { from: FlowState; to: FlowState; value: number }[];
  improved: number;
  declined: number;
  unchanged: number;
  totals: { previous: Record<FlowState, number>; current: Record<FlowState, number> };
};

export type CountryRow = {
  country: string;
  /** Active prompts configured for this market. */
  configured: number;
  prompts: number;
  answers: number;
  visibility: number | null;
  mentionRate: number | null;
  citationRate: number | null;
  position: number | null;
  sentiment: number | null;
  visibilityDelta: number | null;
};

export type BrandChip = { competitorId: string; name: string; domain: string | null; count: number };

export type EngineCell = {
  engine: string;
  answers: number;
  visible: number;
  /** Answers naming the brand. */
  mentioned: number;
  /** Every occurrence of the brand name. */
  mentions: number;
  cited: number;
  citations: number;
  visibility: number | null;
  sentiment: number | null;
  position: number | null;
  latestVisible: boolean | null;
  latestDate: string | null;
  latestAnswerId: string | null;
  latestStatus: "ok" | "error" | null;
  brands: BrandChip[];
};

export type PromptRow = {
  id: string;
  text: string;
  /** Primary market. */
  country: string;
  /** Every market the prompt runs in (incl. the primary one). */
  markets: string[];
  funnelStage: string | null;
  intent: string | null;
  persona: string | null;
  language: string;
  status: "active" | "archived";
  createdAt: string;
  lastRunAt: string | null;
  engines: string[];
  tags: { id: string; name: string; color: string | null }[];
  answers: number;
  visibility: number | null;
  visibilityDelta: number | null;
  /** Every occurrence of the brand name (finseo "Mentions"). */
  mentions: number;
  /** Answers naming the brand. */
  mentionedAnswers: number;
  mentionsDelta: number | null;
  sentiment: number | null;
  sentimentDelta: number | null;
  citations: number;
  citationsDelta: number | null;
  position: number | null;
  brands: BrandChip[];
  perEngine: EngineCell[];
};

export type TagOption = { id: string; name: string; color: string | null; count: number };
export type CompetitorOption = { id: string; name: string; domain: string | null; color: string | null };

export type RunInfo = {
  id: string;
  trigger: string;
  status: string;
  totalTasks: number;
  doneTasks: number;
  failedTasks: number;
  costUsd: number;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
  skipped: { engine: string; reason: string }[];
};

export type EngineAvailabilityView = {
  id: string;
  name: string;
  vendor: string;
  provider: "dataforseo" | "api" | "agent" | "ai" | null;
  providerLabel: string;
  configured: boolean;
  /** Answers come from the AI simulation (provider "ai"), not the live product. */
  simulated: boolean;
  status: "configured" | "needs_key" | "needs_dataforseo" | "needs_agent" | "needs_ai" | "disabled";
  reason: string;
  adminHref: string;
  providers: { provider: string; configured: boolean; reason: string }[];
};

export type AnswerListItem = {
  id: string;
  engine: string;
  date: string;
  status: "ok" | "error";
  provider: string;
  model: string | null;
  brandMentioned: boolean;
  brandCited: boolean;
  position: number | null;
  sentiment: number | null;
  analysisStatus: string;
};

export type AnswerDetail = AnswerListItem & {
  text: string;
  error: string | null;
  analysisError: string | null;
  costUsd: number;
  durationMs: number | null;
  createdAt: string;
  promptText: string;
  country: string;
  highlights: { name: string; terms: string[]; kind: "own" | "competitor" | "other"; color: string | null }[];
  mentions: { name: string; isOwn: boolean; competitorId: string | null; position: number; sentiment: number | null; occurrences: number; cited: boolean; recommended: boolean; snippet: string | null }[];
  citations: { url: string; domain: string; title: string | null; contentType: string; ownership: string; position: number }[];
  fanouts: string[];
  products: { name: string; brand: string | null; source: string; price: number | null; oldPrice: number | null; currency: string | null; rating: number | null; reviews: number | null; store: string | null; url: string | null; imageUrl: string | null }[];
  ads: { advertiser: string; advertiserDomain: string | null; headline: string; description: string | null; landingUrl: string | null; position: number | null }[];
  statements: { brandName: string; isOwn: boolean; polarity: "praise" | "neutral" | "criticism"; theme: string | null; attribute: string | null; quote: string; severity: number }[];
  recommendations: { kind: "best_for" | "head_to_head"; label: string; brandName: string; opponentName: string | null; winner: string | null }[];
};

export type FanoutRow = {
  query: string;
  frequency: number;
  engines: string[];
  prompts: { id: string; text: string }[];
  firstSeen: string;
  lastSeen: string;
};

/** Tracker brand scope for Position / SoV / #1 & Top-3 share. */
export type { BrandScope } from "@/features/ai-insights/lib/metrics";

/** Answer model versions (ai_answers.model) per engine. */
export type ModelVersionRow = {
  engine: string;
  model: string;
  answers: number;
  prompts: number;
  visibility: number | null;
  mentionRate: number | null;
  citationRate: number | null;
  position: number | null;
  sentiment: number | null;
  /** Share of this engine's answers produced by this model version. */
  engineShare: number | null;
  visibilityDelta: number | null;
  firstSeen: string;
  lastSeen: string;
  costUsd: number;
};

export type ModelVersionOption = { engine: string; model: string };

/** Google AI Overview vs AI Mode for the same prompt × market × day. */
export type SurfaceOverlap = {
  aiOverview: { answers: number; present: number; presence: number | null; visible: number };
  aiMode: { answers: number; present: number; presence: number | null; visible: number };
  pairs: number;
  /** Pairs where both surfaces showed an AI answer. */
  bothPresent: number;
  /** Mean Jaccard overlap of cited URLs / domains over pairs where both cite something. */
  urlOverlap: number | null;
  domainOverlap: number | null;
  /** Own brand visible in … (over all pairs). */
  brand: { both: number; aiOverviewOnly: number; aiModeOnly: number; neither: number };
  daily: { date: string; aiOverviewPresence: number | null; urlOverlap: number | null; pairs: number }[];
  prompts: {
    promptId: string;
    text: string;
    country: string;
    pairs: number;
    aiOverviewPresence: number | null;
    urlOverlap: number | null;
    domainOverlap: number | null;
    brandBoth: number;
    brandAiOverviewOnly: number;
    brandAiModeOnly: number;
  }[];
  domains: { domain: string; aiOverview: number; aiMode: number; both: number; ownership: string }[];
};

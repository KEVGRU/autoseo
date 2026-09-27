/**
 * Free AI Visibility Check — result shapes shared by the server (job, API) and the report UI.
 * Isomorphic: no server imports.
 */

export type VisibilityCheckStatus = "queued" | "running" | "completed" | "failed";
export type VisibilityCheckStep = "queued" | "readiness" | "brand" | "competitors" | "prompts" | "answers" | "actions" | "done";
export type VisibilityCheckSurface = "public" | "app";

export type CheckProgress = {
  step: VisibilityCheckStep;
  label: string;
  /** Answers collected so far / planned (answers step only). */
  answersDone?: number;
  answersTotal?: number;
};

/* ───────────────────────────── AI readiness (deterministic) ───────────────────────────── */

export type BotAccessStatus = "allowed" | "partial" | "blocked";
export type ReadinessBotPurpose = "training" | "search" | "user";

export type ReadinessBot = {
  token: string;
  name: string;
  company: string;
  purpose: ReadinessBotPurpose;
  status: BotAccessStatus;
  /** May the bot fetch the homepage? */
  homepageAllowed: boolean;
  /** Decisive robots.txt rule ("Disallow: /") and its line. */
  rule: string | null;
  line: number | null;
  /** Which robots.txt group applied: a group naming the bot, the `*` group, or none. */
  source: "specific" | "wildcard" | "none";
};

export type RenderingVerdict = "ssr" | "partial" | "csr";

export type ReadinessPage = {
  title: string;
  metaDescription: string;
  canonical: string | null;
  lang: string | null;
  h1Count: number;
  /** Words of visible text in the raw (not JS-rendered) HTML — what most AI crawlers see. */
  wordCount: number;
  rendering: RenderingVerdict;
  frameworks: string[];
  jsonLdTypes: string[];
  jsonLdCount: number;
  jsonLdInvalid: number;
  noindex: boolean;
  /** `noai` / `noimageai` / `nosnippet` / `max-snippet:0` directives (meta robots or X-Robots-Tag). */
  aiDirectives: string[];
};

export type FirewallVerdict = "ok" | "blocked" | "different" | "error" | "inconclusive";

export type ReadinessCategoryKey = "crawlers" | "rendering" | "structured" | "metadata" | "llms" | "http";
export type ReadinessCategory = {
  key: ReadinessCategoryKey;
  label: string;
  score: number;
  max: number;
};

export type FindingSeverity = "critical" | "warning" | "info" | "pass";

export type ReadinessFinding = {
  id: string;
  severity: FindingSeverity;
  category: ReadinessCategoryKey;
  title: string;
  detail: string;
  fix?: string;
  /** Copy-paste snippet (robots.txt rules, JSON-LD…). */
  snippet?: string;
};

export type ReadinessResult = {
  checkedAt: string;
  requestedUrl: string;
  finalUrl: string | null;
  http: {
    status: number | null;
    redirects: Array<{ url: string; status: number }>;
    https: boolean;
    ttfbMs: number | null;
    xRobotsTag: string | null;
    error: string | null;
  };
  robots: {
    url: string;
    found: boolean;
    status: number | null;
    unreachable: boolean;
    sitemaps: number;
    error: string | null;
  };
  bots: ReadinessBot[];
  llmsTxt: {
    url: string;
    present: boolean;
    status: number | null;
    title: string | null;
    links: number;
    issues: string[];
  };
  page: ReadinessPage | null;
  /** Homepage requested with an AI crawler user agent (indicative: firewalls may treat unverified bots differently). */
  firewall: {
    userAgent: string;
    status: number | null;
    verdict: FirewallVerdict;
    reason: string | null;
  } | null;
  score: number;
  categories: ReadinessCategory[];
  findings: ReadinessFinding[];
};

/* ───────────────────────────── AI answers ───────────────────────────── */

export type CheckBrand = {
  name: string;
  description: string;
  industry: string;
  aliases: string[];
  logoUrl: string | null;
  language: string;
  competitors: Array<{ name: string; domain: string | null }>;
};

export type CheckPrompt = {
  text: string;
  topic: string;
  funnelStage: "tofu" | "mofu" | "bofu";
};

export type CheckCitation = {
  url: string;
  domain: string;
  title: string | null;
};

export type CheckAnswer = {
  engine: string;
  promptIndex: number;
  provider: string;
  model: string;
  /** Answered by an AI model imitating the engine (provider "ai"), not the live product. */
  simulated: boolean;
  /** The engine showed no AI answer for this prompt (e.g. no AI Overview on the results page). */
  noAnswer: boolean;
  /** Own brand named in the answer. */
  mentioned: boolean;
  /** Ordinal position of the own brand among the tracked brands named (1 = named first). */
  position: number | null;
  /** Brand keys ("own" / "c0", "c1", …) in order of first mention. */
  brands: string[];
  /** Own domain cited as a source. */
  ownCited: boolean;
  citations: CheckCitation[];
  /** Answer text (markdown, trimmed). */
  excerpt: string;
  costUsd: number;
};

export type EngineSummary = {
  engine: string;
  name: string;
  provider: string | null;
  simulated: boolean;
  answers: number;
  mentions: number;
  /** 0–100 */
  mentionRate: number;
  avgPosition: number | null;
  ownCitations: number;
  topCompetitor: string | null;
  error: string | null;
};

export type BrandStat = {
  key: string;
  name: string;
  domain: string | null;
  isOwn: boolean;
  mentions: number;
  /** 0–100, share of answers naming the brand. */
  mentionRate: number;
  avgPosition: number | null;
  /** Answers where the brand was named first. */
  firstPlace: number;
};

export type SourceStat = {
  domain: string;
  /** Answers citing the domain. */
  answers: number;
  owner: "own" | "competitor" | "other";
  competitor: string | null;
  sampleUrl: string;
  sampleTitle: string | null;
};

export type VisibilitySummary = {
  answers: number;
  mentions: number;
  /** 0–100, share of answers naming the brand. */
  mentionRate: number;
  avgPosition: number | null;
  /** 0–100, share of answers citing the own domain. */
  citationRate: number;
  /** 0–100 composite (mentions 70 %, prominence 20 %, citations 10 %). */
  score: number;
};

export type CheckActionCategory = "content" | "mentions" | "technical" | "structured-data" | "crawlers";

export type CheckAction = {
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  category: CheckActionCategory;
};

export type AiPartStatus = "completed" | "partial" | "unavailable" | "budget";

export type CheckResults = {
  ai: {
    status: AiPartStatus;
    /** Why the AI part is missing or incomplete (shown to the visitor). */
    reason: string | null;
    engines: EngineSummary[];
    answers: CheckAnswer[];
    brands: BrandStat[];
    sources: SourceStat[];
    visibility: VisibilitySummary | null;
    /** 0–100, share of answers that were simulated. */
    simulatedShare: number;
  };
  actions: CheckAction[];
  /** "ai" = written by an AI model from the findings; "rules" = derived from the readiness checks. */
  actionsSource: "ai" | "rules";
  scores: { readiness: number; visibility: number | null; overall: number };
};

/** Public view of a check (status API + report). Never contains the email, IP hash or user ids. */
export type VisibilityCheckView = {
  id: string;
  domain: string;
  country: string;
  language: string;
  status: VisibilityCheckStatus;
  step: VisibilityCheckStep;
  progress: CheckProgress | null;
  brand: CheckBrand | null;
  prompts: CheckPrompt[];
  readiness: ReadinessResult | null;
  results: CheckResults | null;
  score: number | null;
  readinessScore: number | null;
  visibilityScore: number | null;
  error: string | null;
  emailRequested: boolean;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
};

/** Ordered steps shown in the progress UI. */
export const CHECK_STEPS: Array<{
  step: VisibilityCheckStep;
  label: string;
  ai: boolean;
}> = [
  {
    step: "readiness",
    label: "Checking AI crawler access, rendering & structured data",
    ai: false,
  },
  { step: "brand", label: "Understanding your brand", ai: true },
  { step: "competitors", label: "Finding your competitors", ai: true },
  { step: "prompts", label: "Writing buyer prompts", ai: true },
  { step: "answers", label: "Asking AI engines", ai: true },
  { step: "actions", label: "Prioritizing actions", ai: true },
];

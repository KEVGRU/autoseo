/**
 * Data enrichment policy (pure, isomorphic): which source serves a capability — the customer's own DataForSEO
 * account or AI estimates (an LLM with web search). Used by `resolveEnrichmentProvider` and the admin UI.
 */

export type EnrichmentSource = "dataforseo" | "ai";
export type EnrichmentMode = "auto" | "dataforseo" | "ai";

export const ENRICHMENT_CAPABILITIES = ["keyword_metrics", "keyword_ideas", "serp", "domain", "backlinks", "local", "llm_mentions", "llm_answers"] as const;
export type EnrichmentCapability = (typeof ENRICHMENT_CAPABILITIES)[number];

export const DEFAULT_AI_CAPABILITIES: EnrichmentCapability[] = [...ENRICHMENT_CAPABILITIES];

export const CAPABILITY_INFO: Record<EnrichmentCapability, { label: string; ai: string }> = {
  keyword_metrics: {
    label: "Keyword metrics",
    ai: "Estimated search volume, CPC, difficulty and intent (no monthly trend).",
  },
  keyword_ideas: {
    label: "Keyword ideas",
    ai: "Related keywords researched with web search, with estimated metrics.",
  },
  serp: {
    label: "SERP results",
    ai: "Top organic results observed via web search — every URL is verified.",
  },
  domain: {
    label: "Domain analytics",
    ai: "Estimated traffic, top keywords, top pages and competitors of a domain.",
  },
  backlinks: {
    label: "Backlinks",
    ai: "A sample of pages that mention or link to the domain — not a full backlink index.",
  },
  local: {
    label: "Local SEO",
    ai: "Local listings and business profile summaries; review/Q&A/post lists are summaries only.",
  },
  llm_mentions: {
    label: "LLM mentions",
    ai: "Brand mentions sampled by asking AI models category prompts.",
  },
  llm_answers: {
    label: "AI engine answers",
    ai: "AI engines that DataForSEO would scrape are simulated by a model with web search.",
  },
};

export type EnrichmentDecisionInput = {
  mode: EnrichmentMode | undefined;
  dfsConfigured: boolean;
  aiAvailable: boolean;
  /** Capability is listed in Admin → Data Providers → "AI may enrich". */
  aiCapabilityEnabled: boolean;
};

export type Resolved = {
  provider: EnrichmentSource | null;
  mode: EnrichmentMode;
  reason: string;
};

const NO_AI_REASON = "No AI provider is available — connect a local agent or add an API key in Admin → AI Providers.";

/** The decision table behind `resolveEnrichmentProvider` (unit-tested). */
export function decideEnrichmentProvider(input: EnrichmentDecisionInput): Resolved {
  const mode = input.mode ?? "auto";
  if (mode === "dataforseo") {
    return input.dfsConfigured
      ? { provider: "dataforseo", mode, reason: "DataForSEO (measured data)." }
      : {
          provider: null,
          mode,
          reason: "DataForSEO is not configured. Add your DataForSEO login in Settings → Workspace → Data providers (or Admin → Data Providers).",
        };
  }
  if (mode === "ai") {
    if (!input.aiCapabilityEnabled)
      return {
        provider: null,
        mode,
        reason: "AI enrichment is disabled for this data type in Admin → Data Providers.",
      };
    return input.aiAvailable ? { provider: "ai", mode, reason: "AI estimates (AI-only mode)." } : { provider: null, mode, reason: NO_AI_REASON };
  }
  if (input.dfsConfigured)
    return {
      provider: "dataforseo",
      mode,
      reason: "DataForSEO (measured data).",
    };
  if (!input.aiCapabilityEnabled) {
    return {
      provider: null,
      mode,
      reason: "DataForSEO is not configured and AI enrichment is disabled for this data type (Admin → Data Providers).",
    };
  }
  if (!input.aiAvailable)
    return {
      provider: null,
      mode,
      reason: `DataForSEO is not configured. ${NO_AI_REASON}`,
    };
  return {
    provider: "ai",
    mode,
    reason: "DataForSEO is not configured — using AI estimates.",
  };
}

/**
 * Errors that switch a DataForSEO call to AI in auto mode: missing credentials, rejected credentials (401) and
 * an empty balance (402). Budget limits, rate limits, validation and upstream errors are never masked.
 */
export function isFallbackTrigger(err: { notConfigured?: boolean; statusCode?: number | null; seoCode?: string | null }): boolean {
  if (err.notConfigured) return true;
  if (err.statusCode === 401 || err.statusCode === 402) return true;
  return err.seoCode === "NOT_CONFIGURED" || err.seoCode === "AUTH_FAILED" || err.seoCode === "INSUFFICIENT_FUNDS";
}

/** Public, client-safe summary of how enrichment is resolved (Admin → Data Providers, banners). */
export type EnrichmentStatus = {
  /** Effective mode (workspace choice, else instance default). */
  mode: EnrichmentMode;
  instanceMode: EnrichmentMode;
  workspaceMode: EnrichmentMode | null;
  fallbackOnError: boolean;
  /** DataForSEO credentials usable for this workspace, and whose they are. */
  dfsConfigured: boolean;
  dfsScope: "workspace" | "instance" | null;
  /** False when the instance is set to "DataForSEO only". */
  aiAllowed: boolean;
  aiAvailable: boolean;
  aiCapabilities: EnrichmentCapability[];
  /** Resolved provider per capability. */
  capabilities: Record<EnrichmentCapability, Resolved>;
};

import "server-only";
import { availableLlmProviders } from "@/server/ai/llm";
import { DataForSeoError, DataForSeoNotConfiguredError } from "@/server/dataforseo/client";
import { getDfsCredentials, getWorkspaceEnrichmentMode, type DfsScope } from "@/server/dataforseo/credentials";
import { getSetting } from "@/server/settings";
import {
  DEFAULT_AI_CAPABILITIES,
  ENRICHMENT_CAPABILITIES,
  decideEnrichmentProvider,
  isFallbackTrigger,
  type EnrichmentCapability,
  type EnrichmentMode,
  type EnrichmentSource,
  type EnrichmentStatus,
  type Resolved,
} from "./policy";

export {
  CAPABILITY_INFO,
  ENRICHMENT_CAPABILITIES,
  decideEnrichmentProvider,
  type EnrichmentCapability,
  type EnrichmentMode,
  type EnrichmentSource,
  type EnrichmentStatus,
  type Resolved,
} from "./policy";

/**
 * Data enrichment entry point. Every feature that needs third-party SEO data calls `runEnriched` (or checks
 * `resolveEnrichmentProvider`) instead of talking to DataForSEO directly:
 *  - the customer's own DataForSEO account serves measured data when configured — per workspace (Settings → Workspace →
 *    Data providers) or instance-wide (Admin → Data Providers), resolved by `getDfsCredentials`;
 *  - otherwise (or on DataForSEO 401/402 in auto mode) an LLM with web search produces clearly labelled estimates.
 */

export type EnrichmentCtx = {
  workspaceId: string | null;
  projectId?: string | null;
  userId?: string | null;
  /** Usage/feature label, e.g. "keyword_research". */
  feature: string;
  capability: EnrichmentCapability;
};

export class EnrichmentUnavailableError extends Error {
  constructor(
    message: string,
    public capability?: EnrichmentCapability,
  ) {
    super(message);
    this.name = "EnrichmentUnavailableError";
  }
}

type EnrichmentSettings = {
  /** Effective mode: the workspace's choice, else the instance default. */
  mode: EnrichmentMode;
  instanceMode: EnrichmentMode;
  workspaceMode: EnrichmentMode | null;
  fallbackOnError: boolean;
  /** Capabilities AI may serve (empty when the instance forbids AI estimates). */
  aiCapabilities: EnrichmentCapability[];
  aiAllowed: boolean;
  dfsConfigured: boolean;
  dfsScope: DfsScope | null;
};

/**
 * Instance policy (Admin → Data Providers) + workspace choice (Settings → Workspace → Data providers):
 *  - instance "DataForSEO only" disables AI estimates for every workspace;
 *  - instance "AI only" keeps the instance DataForSEO account unused — a workspace's own account still works;
 *  - otherwise the workspace's mode wins over the instance default.
 */
async function enrichmentSettings(workspaceId?: string | null): Promise<EnrichmentSettings> {
  const s = await getSetting("dataforseo");
  const instanceMode = s.mode ?? "auto";
  const [creds, workspaceMode] = await Promise.all([getDfsCredentials({ workspaceId }), getWorkspaceEnrichmentMode(workspaceId)]);
  const usable = creds && !(creds.scope === "instance" && instanceMode === "ai") ? creds : null;
  const aiAllowed = instanceMode !== "dataforseo";
  return {
    mode: workspaceMode ?? instanceMode,
    instanceMode,
    workspaceMode,
    fallbackOnError: s.fallbackOnError ?? true,
    aiCapabilities: aiAllowed ? (s.aiCapabilities ?? DEFAULT_AI_CAPABILITIES) : [],
    aiAllowed,
    dfsConfigured: Boolean(usable),
    dfsScope: usable?.scope ?? null,
  };
}

const AI_DISABLED_REASON =
  "AI estimates are disabled on this instance (DataForSEO only). Add your own DataForSEO account in Settings → Workspace → Data providers.";

function decide(s: EnrichmentSettings, capability: EnrichmentCapability, aiAvailable: boolean): Resolved {
  const resolved = decideEnrichmentProvider({
    mode: s.mode,
    dfsConfigured: s.dfsConfigured,
    aiAvailable,
    aiCapabilityEnabled: s.aiCapabilities.includes(capability),
  });
  return !s.aiAllowed && resolved.provider == null && s.mode !== "dataforseo" ? { ...resolved, reason: AI_DISABLED_REASON } : resolved;
}

/** Whether any LLM (online local agent or API key) can run enrichment. */
export async function isAiEnrichmentAvailable(): Promise<boolean> {
  try {
    return (await availableLlmProviders()).length > 0;
  } catch (err) {
    console.error("[enrichment] could not check AI providers", err);
    return false;
  }
}

/**
 * Decides which source serves `ctx.capability` for a workspace right now. `provider: null` = neither is available.
 * Without `workspaceId` only the instance settings apply (system jobs, Admin → Data Providers).
 */
export async function resolveEnrichmentProvider(ctx: { capability: EnrichmentCapability; workspaceId?: string | null }): Promise<Resolved> {
  const s = await enrichmentSettings(ctx.workspaceId);
  // AI availability costs a DB round trip (agent presence) — only check it when it can change the outcome.
  const needsAi = s.mode === "ai" || (s.mode === "auto" && !s.dfsConfigured);
  const aiAvailable = needsAi && s.aiCapabilities.includes(ctx.capability) ? await isAiEnrichmentAvailable() : false;
  return decide(s, ctx.capability, aiAvailable);
}

/** Resolution for every capability (Admin → Data Providers, Settings → Workspace, SEO pages). */
export async function getEnrichmentStatus(ctx: { workspaceId?: string | null } = {}): Promise<EnrichmentStatus> {
  const s = await enrichmentSettings(ctx.workspaceId);
  const aiAvailable = await isAiEnrichmentAvailable();
  const capabilities = Object.fromEntries(ENRICHMENT_CAPABILITIES.map((cap) => [cap, decide(s, cap, aiAvailable)])) as Record<EnrichmentCapability, Resolved>;
  return {
    mode: s.mode,
    instanceMode: s.instanceMode,
    workspaceMode: s.workspaceMode,
    fallbackOnError: s.fallbackOnError,
    dfsConfigured: s.dfsConfigured,
    dfsScope: s.dfsScope,
    aiAllowed: s.aiAllowed,
    aiAvailable,
    aiCapabilities: s.aiCapabilities,
    capabilities,
  };
}

/** DataForSEO failures that may switch to AI estimates (never budget, rate-limit or validation errors). */
export function isDataForSeoFallbackError(err: unknown): boolean {
  if (err instanceof DataForSeoNotConfiguredError) return true;
  if (err instanceof DataForSeoError) return isFallbackTrigger({ statusCode: err.statusCode });
  if (err instanceof Error && err.name === "SeoError")
    return isFallbackTrigger({
      seoCode: (err as Error & { code?: string }).code,
    });
  return false;
}

export type Enriched<T> = {
  data: T;
  source: EnrichmentSource;
  fallbackReason?: string;
};

/**
 * Runs `impl.dataforseo` or `impl.ai` according to the resolved provider. In auto mode a DataForSEO call that fails
 * because the account is missing, rejected (401) or out of funds (402) is retried with AI when `fallbackOnError`.
 * Throws `EnrichmentUnavailableError` when neither source can serve the capability.
 */
export async function runEnriched<T>(ctx: EnrichmentCtx, impl: { dataforseo: () => Promise<T>; ai?: () => Promise<T> }): Promise<Enriched<T>> {
  const resolved = await resolveEnrichmentProvider(ctx);
  if (resolved.provider === "ai") {
    if (!impl.ai)
      throw new EnrichmentUnavailableError("This data is only available from DataForSEO. Connect DataForSEO in Admin → Data Providers.", ctx.capability);
    return { data: await impl.ai(), source: "ai" };
  }
  if (resolved.provider == null) {
    // Auto mode without DataForSEO and without AI: surface the actionable reason.
    throw new EnrichmentUnavailableError(resolved.reason, ctx.capability);
  }
  try {
    return { data: await impl.dataforseo(), source: "dataforseo" };
  } catch (err) {
    if (!impl.ai || resolved.mode !== "auto" || !isDataForSeoFallbackError(err)) throw err;
    const s = await enrichmentSettings(ctx.workspaceId);
    if (!s.fallbackOnError || !s.aiCapabilities.includes(ctx.capability) || !(await isAiEnrichmentAvailable())) throw err;
    const fallbackReason = err instanceof Error ? err.message : String(err);
    console.warn(`[enrichment] ${ctx.feature}: DataForSEO failed (${fallbackReason}) — falling back to AI estimates`);
    return { data: await impl.ai(), source: "ai", fallbackReason };
  }
}

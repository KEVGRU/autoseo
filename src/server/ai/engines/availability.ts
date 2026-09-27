import "server-only";
import { ENGINES, getEngine, type EngineId, type EngineInfo, type EngineProvider } from "@/lib/engines";
import { getSetting } from "@/server/settings";
import { isDataForSeoConfigured } from "@/server/dataforseo/client";
import { hasOnlineAgent } from "@/server/agents/dispatch";
import { availableLlmProviders } from "@/server/ai/llm";

export type EngineStatus = "configured" | "needs_key" | "needs_dataforseo" | "needs_agent" | "needs_ai" | "disabled";

export type EngineAvailability = {
  id: EngineId;
  name: string;
  vendor: string;
  /** Admin choice for this engine (auto / specific provider / disabled). */
  setting: "auto" | EngineProvider | "disabled";
  /** Provider that will answer prompts (null when none is usable). */
  provider: EngineProvider | null;
  configured: boolean;
  /** Answers come from the AI simulation (provider "ai"), not the live product. */
  simulated: boolean;
  status: EngineStatus;
  reason: string;
  /** Where an admin fixes it. */
  adminHref: string;
  /** Providers the engine supports and whether each one is usable right now. */
  providers: { provider: EngineProvider; configured: boolean; reason: string }[];
};

type ProviderCheck = { configured: boolean; reason: string; status: EngineStatus; adminHref: string };

const PROVIDER_LABEL: Record<EngineProvider, string> = {
  dataforseo: "DataForSEO",
  api: "Direct API",
  agent: "Local agent",
  ai: "AI simulation",
};

export function providerLabel(p: EngineProvider | null): string {
  return p ? PROVIDER_LABEL[p] : "—";
}

type Env = Awaited<ReturnType<typeof loadEnv>>;
type Setting = EngineAvailability["setting"];

/** "a" / "an" before a vendor name ("an OpenAI key", "an xAI key", "an Upstage key"). */
function article(word: string): string {
  return /^[aeiou]|^x/i.test(word) ? "an" : "a";
}

function checkApi(engine: EngineInfo, env: Env): ProviderCheck {
  const key = engine.apiKeySetting;
  if (!key) return { configured: false, reason: "No direct API for this engine.", status: "needs_key", adminHref: "/admin/ai" };
  const search = engine.apiWithoutWebSearch ? "(no web search: model knowledge only, no citations)" : "with web search";
  if (env.ai[key]) return { configured: true, reason: `Answered via the ${engine.vendor} API ${search}.`, status: "configured", adminHref: "/admin/ai" };
  if (engine.apiKeyFallback && env.ai[engine.apiKeyFallback]) {
    return { configured: true, reason: `Answered via OpenRouter (${engine.vendor}'s model with OpenRouter web search).`, status: "configured", adminHref: "/admin/ai" };
  }
  const alt = engine.apiKeyFallback ? " (or an OpenRouter key)" : "";
  return { configured: false, reason: `Add ${article(engine.vendor)} ${engine.vendor} API key${alt} in Admin → AI Providers.`, status: "needs_key", adminHref: "/admin/ai" };
}

function checkSimulation(engine: EngineInfo, env: Env, setting: Setting): ProviderCheck {
  if (!env.simulationBackend) {
    return {
      configured: false,
      reason: "AI simulation needs an AI provider: an online local agent or an Anthropic, OpenAI, OpenRouter or Gemini key.",
      status: "needs_ai",
      adminHref: "/admin/ai",
    };
  }
  // The toggle governs the automatic fallback; an explicit "AI simulation" choice always applies.
  if (!env.engines.simulateUnavailable && setting !== "ai") {
    return { configured: false, reason: "AI simulation of unavailable engines is turned off in Admin → AI Providers.", status: "needs_ai", adminHref: "/admin/ai" };
  }
  return {
    configured: true,
    reason: `Simulated: an AI model with web search imitates ${engine.name}; directional, not the live product.`,
    status: "configured",
    adminHref: "/admin/ai",
  };
}

async function checkProvider(engine: EngineInfo, provider: EngineProvider, env: Env, setting: Setting): Promise<ProviderCheck> {
  if (provider === "dataforseo") {
    return env.dfs
      ? { configured: true, reason: "Answered via DataForSEO AI Optimization / SERP API.", status: "configured", adminHref: "/admin/data" }
      : { configured: false, reason: "Add DataForSEO credentials in Admin → Data Providers.", status: "needs_dataforseo", adminHref: "/admin/data" };
  }
  if (provider === "api") return checkApi(engine, env);
  if (provider === "ai") return checkSimulation(engine, env, setting);
  // agent
  if (!engine.agentRuntime) return { configured: false, reason: "No local agent can emulate this engine.", status: "needs_agent", adminHref: "/admin/agents" };
  if (!env.agentsEnabled) return { configured: false, reason: "Local agents are disabled in Admin → Local Agents.", status: "needs_agent", adminHref: "/admin/agents" };
  const online = env.agentOnline.get(engine.agentRuntime) ?? false;
  const cli = engine.agentRuntime === "claude" ? "Claude Code" : "Codex";
  return online
    ? { configured: true, reason: `Answered by a local ${cli} agent with web search.`, status: "configured", adminHref: "/agents" }
    : { configured: false, reason: `Needs an online local agent running ${cli}.`, status: "needs_agent", adminHref: "/agents" };
}

async function loadEnv(workspaceId?: string | null) {
  const [ai, engines, agents, dfs, llm] = await Promise.all([
    getSetting("ai"),
    getSetting("engines"),
    getSetting("agents"),
    isDataForSeoConfigured({ workspaceId }),
    availableLlmProviders().catch(() => []),
  ]);
  const agentOnline = new Map<string, boolean>();
  if (agents.enabled) {
    const runtimes = [...new Set(ENGINES.map((e) => e.agentRuntime).filter((r): r is "claude" | "codex" => !!r))];
    const results = await Promise.all(runtimes.map((r) => hasOnlineAgent(r, { workspaceId: workspaceId ?? null }).catch(() => false)));
    runtimes.forEach((r, i) => agentOnline.set(r, results[i] ?? false));
  }
  // The simulation runs on the AI router (an agent of this workspace or an API key) or on Gemini grounding.
  const workspaceAgent = agents.enabled && ai.preferLocalAgent && [...agentOnline.values()].some(Boolean);
  const simulationBackend = llm.length > 0 || workspaceAgent || Boolean(ai.geminiApiKey);
  return { ai, engines, agentsEnabled: agents.enabled, dfs, agentOnline, simulationBackend };
}

function engineSetting(engines: Record<string, unknown>, id: EngineId) {
  const s = engines[id] as { provider: string; model: string } | undefined;
  return { provider: (s?.provider ?? "auto") as Setting, model: s?.model ?? "" };
}

async function resolveOne(engine: EngineInfo, env: Env): Promise<EngineAvailability> {
  const { provider: setting } = engineSetting(env.engines, engine.id);
  const providers = await Promise.all(
    engine.providers.map(async (p) => {
      const c = await checkProvider(engine, p, env, setting);
      return { provider: p, configured: c.configured, reason: c.reason, check: c };
    }),
  );
  const base = {
    id: engine.id,
    name: engine.name,
    vendor: engine.vendor,
    setting,
    providers: providers.map((p) => ({ provider: p.provider, configured: p.configured, reason: p.reason })),
  };

  if (setting === "disabled") {
    return { ...base, provider: null, configured: false, simulated: false, status: "disabled", reason: "Disabled by an admin in Admin → AI Providers.", adminHref: "/admin/ai" };
  }
  if (setting !== "auto") {
    const chosen = providers.find((p) => p.provider === setting);
    if (!chosen) {
      return {
        ...base,
        provider: null,
        configured: false,
        simulated: false,
        status: "disabled",
        reason: `${providerLabel(setting)} cannot answer ${engine.name}. Pick another provider in Admin → AI Providers.`,
        adminHref: "/admin/ai",
      };
    }
    return {
      ...base,
      provider: setting,
      configured: chosen.configured,
      simulated: setting === "ai",
      status: chosen.check.status,
      reason: chosen.reason,
      adminHref: chosen.check.adminHref,
    };
  }
  const first = providers.find((p) => p.configured);
  if (first) {
    return {
      ...base,
      provider: first.provider,
      configured: true,
      simulated: first.provider === "ai",
      status: "configured",
      reason: first.reason,
      adminHref: first.check.adminHref,
    };
  }
  // Nothing configured: report the most actionable requirement (first provider in preference order).
  const pref = providers[0]!;
  const alt = providers
    .slice(1)
    .map((p) => providerLabel(p.provider))
    .join(" or ");
  return {
    ...base,
    provider: null,
    configured: false,
    simulated: false,
    status: pref.check.status,
    reason: alt ? `${pref.reason} (alternatively: ${alt})` : pref.reason,
    adminHref: pref.check.adminHref,
  };
}

/**
 * Per engine: which provider answers, whether it is configured and why not.
 * Pass the workspace so local agents are only counted when they serve that workspace.
 */
export async function getEngineAvailability(opts: { workspaceId?: string | null } = {}): Promise<EngineAvailability[]> {
  const env = await loadEnv(opts.workspaceId);
  return Promise.all(ENGINES.map((e) => resolveOne(e, env)));
}

export async function getEngineAvailabilityFor(id: string, opts: { workspaceId?: string | null } = {}): Promise<EngineAvailability | null> {
  const engine = getEngine(id);
  if (!engine) return null;
  const env = await loadEnv(opts.workspaceId);
  return resolveOne(engine, env);
}

/** Model override configured by the admin for an engine ("" = provider default). */
export async function getEngineModelOverride(id: EngineId): Promise<string> {
  const engines = (await getSetting("engines")) as Record<string, unknown>;
  return (engines[id] as { model?: string } | undefined)?.model ?? "";
}

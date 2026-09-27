/** runEnriched: provider resolution + auto-mode fallback on DataForSEO 401/402, with stubbed settings and providers. */
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  dfs: { login: "", password: "", mode: "auto", fallbackOnError: true, aiCapabilities: ["keyword_metrics", "serp"] } as Record<string, unknown>,
  llm: ["anthropic"] as string[],
  /** Workspace "ws_own" has its own DataForSEO account; workspace modes by id. */
  wsCreds: new Set<string>(),
  wsMode: new Map<string, "auto" | "dataforseo" | "ai">(),
}));

vi.mock("@/server/settings", () => ({ getSetting: async () => state.dfs }));
vi.mock("@/server/ai/llm", () => ({ availableLlmProviders: async () => state.llm }));
vi.mock("@/server/dataforseo/client", () => {
  class DataForSeoError extends Error {
    constructor(
      message: string,
      public statusCode?: number,
    ) {
      super(message);
    }
  }
  class DataForSeoNotConfiguredError extends DataForSeoError {}
  return { DataForSeoError, DataForSeoNotConfiguredError };
});
vi.mock("@/server/dataforseo/credentials", () => ({
  getDfsCredentials: async ({ workspaceId }: { workspaceId?: string | null }) => {
    if (workspaceId && state.wsCreds.has(workspaceId)) return { login: "own", password: "pw", sandbox: false, scope: "workspace" };
    return state.dfs.login && state.dfs.password ? { login: state.dfs.login, password: state.dfs.password, sandbox: false, scope: "instance" } : null;
  },
  getWorkspaceEnrichmentMode: async (workspaceId?: string | null) => (workspaceId ? (state.wsMode.get(workspaceId) ?? null) : null),
}));

import { DataForSeoError } from "@/server/dataforseo/client";
import { EnrichmentUnavailableError, getEnrichmentStatus, resolveEnrichmentProvider, runEnriched } from "./index";

const ctx = { workspaceId: "ws", feature: "test", capability: "keyword_metrics" as const };

beforeEach(() => {
  state.dfs = { login: "", password: "", mode: "auto", fallbackOnError: true, aiCapabilities: ["keyword_metrics", "serp"] };
  state.llm = ["anthropic"];
  state.wsCreds.clear();
  state.wsMode.clear();
});

describe("runEnriched", () => {
  it("uses AI when DataForSEO isn't configured (auto)", async () => {
    const dataforseo = vi.fn(async () => "dfs");
    const res = await runEnriched(ctx, { dataforseo, ai: async () => "ai" });
    expect(res).toEqual({ data: "ai", source: "ai" });
    expect(dataforseo).not.toHaveBeenCalled();
  });

  it("uses DataForSEO when configured and falls back to AI on 402", async () => {
    state.dfs = { ...state.dfs, login: "a", password: "b" };
    expect(await runEnriched(ctx, { dataforseo: async () => "dfs", ai: async () => "ai" })).toEqual({ data: "dfs", source: "dataforseo" });
    const res = await runEnriched(ctx, {
      dataforseo: async () => {
        throw new DataForSeoError("DataForSEO account has insufficient funds (402).", 402);
      },
      ai: async () => "ai",
    });
    expect(res.source).toBe("ai");
    expect(res.fallbackReason).toMatch(/402/);
  });

  it("does not fall back on other errors, when disabled, or in DataForSEO-only mode", async () => {
    state.dfs = { ...state.dfs, login: "a", password: "b" };
    const boom = async () => {
      throw new DataForSeoError("rate limit", 429);
    };
    await expect(runEnriched(ctx, { dataforseo: boom, ai: async () => "ai" })).rejects.toThrow("rate limit");
    const unfunded = async () => {
      throw new DataForSeoError("no funds", 402);
    };
    state.dfs = { ...state.dfs, fallbackOnError: false };
    await expect(runEnriched(ctx, { dataforseo: unfunded, ai: async () => "ai" })).rejects.toThrow("no funds");
    state.dfs = { ...state.dfs, fallbackOnError: true, mode: "dataforseo" };
    await expect(runEnriched(ctx, { dataforseo: unfunded, ai: async () => "ai" })).rejects.toThrow("no funds");
  });

  it("throws EnrichmentUnavailableError with the reason when nothing can serve the capability", async () => {
    state.llm = [];
    await expect(runEnriched(ctx, { dataforseo: async () => 1, ai: async () => 2 })).rejects.toBeInstanceOf(EnrichmentUnavailableError);
    state.llm = ["agent"];
    await expect(runEnriched({ ...ctx, capability: "backlinks" }, { dataforseo: async () => 1, ai: async () => 2 })).rejects.toThrow(/disabled/);
  });

  it("AI-only mode never calls DataForSEO even when configured", async () => {
    state.dfs = { ...state.dfs, login: "a", password: "b", mode: "ai" };
    const dataforseo = vi.fn(async () => "dfs");
    expect((await runEnriched(ctx, { dataforseo, ai: async () => "ai" })).source).toBe("ai");
    expect(dataforseo).not.toHaveBeenCalled();
    expect((await resolveEnrichmentProvider({ capability: "serp" })).provider).toBe("ai");
  });
});

describe("per-workspace credentials and modes", () => {
  it("a workspace's own DataForSEO account serves it; other workspaces fall back to AI", async () => {
    state.wsCreds.add("ws_own");
    expect(await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_own" })).toMatchObject({ provider: "dataforseo" });
    expect(await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_other" })).toMatchObject({ provider: "ai" });
    const status = await getEnrichmentStatus({ workspaceId: "ws_own" });
    expect(status).toMatchObject({ dfsConfigured: true, dfsScope: "workspace", mode: "auto" });
  });

  it("the workspace mode overrides the instance default", async () => {
    state.dfs = { ...state.dfs, login: "a", password: "b" };
    state.wsMode.set("ws_ai", "ai");
    state.wsMode.set("ws_dfs", "dataforseo");
    expect((await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_ai" })).provider).toBe("ai");
    expect((await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_dfs" })).provider).toBe("dataforseo");
    state.dfs = { ...state.dfs, login: "", password: "" };
    expect((await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_dfs" })).provider).toBeNull();
  });

  it("instance 'DataForSEO only' disables AI for every workspace", async () => {
    state.dfs = { ...state.dfs, mode: "dataforseo" };
    state.wsMode.set("ws_ai", "ai");
    const r = await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_ai" });
    expect(r.provider).toBeNull();
    expect(r.reason).toMatch(/Settings → Workspace/);
    state.wsCreds.add("ws_own");
    expect((await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_own" })).provider).toBe("dataforseo");
  });

  it("instance 'AI only' never uses the instance account but allows a workspace's own account", async () => {
    state.dfs = { ...state.dfs, login: "a", password: "b", mode: "ai" };
    expect((await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_x" })).provider).toBe("ai");
    state.wsCreds.add("ws_own");
    state.wsMode.set("ws_own", "auto");
    expect((await resolveEnrichmentProvider({ capability: "serp", workspaceId: "ws_own" })).provider).toBe("dataforseo");
  });
});

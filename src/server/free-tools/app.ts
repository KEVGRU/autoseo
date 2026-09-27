import "server-only";
import { EnrichmentUnavailableError, isDataForSeoFallbackError, runEnriched } from "@/server/enrichment";
import { SeoError, toSeoError } from "@/server/seo";
import type { FreeToolSlug } from "@/features/free-tools/lib/registry";
import type { ToolRunResult } from "@/features/free-tools/lib/types";
import { AI_UNSUPPORTED, TOOL_CAPABILITY, aiToolRunner } from "./ai-fallback";
import { executeTool, type EngineOutcome } from "./engine";
import { dataforseoFetcher, lookupDomainAge } from "./providers";
import { RESERVED_MICRO_USD_PER_CALL, isPaidTool } from "./spend";
import { getServerTool } from "./tools";

export type AppToolContext = {
  projectId: string;
  workspaceId: string;
  userId: string | null;
  /** `seo.run` (or instance admin) — required for the DataForSEO / AI-backed tools. */
  canRun: boolean;
};

const SURFACED_CODES = new Set(["NOT_CONFIGURED", "BUDGET", "AUTH_FAILED", "INSUFFICIENT_FUNDS", "UPSTREAM"]);

/** A DataForSEO tool run that failed for a reason AI estimates must not mask (the outcome keeps the user message). */
class ToolRunFailure extends Error {
  constructor(public outcome: Extract<EngineOutcome, { ok: false }>) {
    super(outcome.error);
    this.name = "ToolRunFailure";
  }
}

/**
 * In-app run for signed-in users (Project → SEO Tools). No public protection pipeline: costs are recorded against the
 * workspace (`usage_events`, feature `free_tools`) and the admin budget (Admin → Limits) is asserted per call, like
 * the SEO module. DataForSEO runs share the result cache with the public tools, so cache hits are free. Without
 * DataForSEO (or when it rejects the account in auto mode) the tools answer with labelled AI estimates.
 */
export async function runToolInApp(ctx: AppToolContext, slug: string, input: unknown): Promise<ToolRunResult<unknown>> {
  const tool = getServerTool(slug);
  if (!tool) return { ok: false, error: "Unknown tool.", code: "not_found" };
  const parsed = tool.parse(input);
  if (!parsed.ok) return { ok: false, error: parsed.error, code: "invalid" };

  const toolSlug = tool.slug as FreeToolSlug;
  const paid = isPaidTool(toolSlug);
  if (paid && !ctx.canRun) {
    return { ok: false, error: 'You don\'t have permission to run paid SEO research (requires "Run paid SEO research").', code: "forbidden" };
  }

  const perCallUsd = paid ? RESERVED_MICRO_USD_PER_CALL[toolSlug as keyof typeof RESERVED_MICRO_USD_PER_CALL] / 1_000_000 : 0;
  const runDataForSeo = async () => {
    const outcome = await executeTool(tool, parsed.params, {
      providers: {
        dfs: dataforseoFetcher({ feature: "free_tools", projectId: ctx.projectId, workspaceId: ctx.workspaceId, userId: ctx.userId }, perCallUsd),
        rdap: lookupDomainAge,
      },
    });
    if (outcome.ok) return outcome.data;
    // Missing / rejected account or empty balance → let runEnriched switch to AI; everything else is final.
    if (outcome.cause && isDataForSeoFallbackError(outcome.cause)) throw outcome.cause;
    throw new ToolRunFailure(outcome);
  };

  const capability = TOOL_CAPABILITY[toolSlug];
  try {
    if (!paid || !capability) return { ok: true, data: await runDataForSeo() };
    const ai = aiToolRunner(toolSlug);
    const res = await runEnriched(
      { workspaceId: ctx.workspaceId, projectId: ctx.projectId, userId: ctx.userId, feature: "free_tools", capability },
      { dataforseo: runDataForSeo, ai: ai ? () => ai(parsed.params, { projectId: ctx.projectId, workspaceId: ctx.workspaceId, userId: ctx.userId }) : undefined },
    );
    return { ok: true, data: res.data };
  } catch (err) {
    if (err instanceof EnrichmentUnavailableError) {
      return { ok: false, error: AI_UNSUPPORTED[toolSlug] && /only available from DataForSEO/.test(err.message) ? AI_UNSUPPORTED[toolSlug]! : err.message, code: "not_configured" };
    }
    const cause = err instanceof ToolRunFailure ? err.outcome.cause : err;
    const mapped = cause ? toSeoError(cause) : null;
    if (mapped instanceof SeoError && SURFACED_CODES.has(mapped.code) && (mapped.code !== "UPSTREAM" || !(err instanceof ToolRunFailure))) {
      return { ok: false, error: mapped.message, code: mapped.code.toLowerCase() };
    }
    if (err instanceof ToolRunFailure) return { ok: false, error: err.outcome.error, code: "upstream" };
    console.error(`[free-tools] ${toolSlug} AI estimate failed:`, err);
    return { ok: false, error: "The AI estimate could not be produced. Please try again.", code: "upstream" };
  }
}

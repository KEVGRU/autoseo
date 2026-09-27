import { env } from "@/server/env";
import { buildCloudflareWorkerScript } from "@/server/analytics/bots/cloudflare-worker";

export const dynamic = "force-dynamic";

/**
 * Public Cloudflare Worker script that reports AI-crawler requests to the NDJSON ingest endpoint.
 * Contains no secrets: the ingest token is read from the Worker secret `AUTOSEO_TOKEN`.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/public/cloudflare-worker/[projectId]">) {
  const { projectId } = await ctx.params;
  if (!/^prj_[a-z0-9]{6,32}$/.test(projectId)) return new Response("// Invalid project id\n", { status: 400, headers: { "Content-Type": "application/javascript; charset=utf-8" } });
  const script = buildCloudflareWorkerScript({ projectId, endpoint: `${env.appUrl}/api/webhooks/server-logs`, manualSetup: true });
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Content-Disposition": `inline; filename="autoseo-bot-logger.js"`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

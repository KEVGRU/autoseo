import { getProjectContext } from "@/server/auth/context";
import { clientIpSync } from "@/server/http/request";
import { rateLimit } from "@/server/rate-limit";
import { getSetting } from "@/server/settings";
import { jsonResponse } from "@/server/free-tools/public";
import { getCheckRow, toCheckView } from "@/server/free-tools/visibility-check";

export const dynamic = "force-dynamic";

/**
 * Live status + report of a check, polled by the report page. The id is an unguessable capability; checks started
 * inside the app additionally require access to their project, public ones require the public tools to be enabled.
 * Never returns the email, IP hash or user ids.
 */
export async function GET(req: Request, ctx: RouteContext<"/api/free-tools/ai-visibility-check/[checkId]">) {
  if (!rateLimit(`ai-check:poll:${clientIpSync(req.headers) ?? "?"}`, 240, 60_000)) {
    return jsonResponse({ error: "Too many requests" }, 429, {
      "Retry-After": "30",
    });
  }
  const { checkId } = await ctx.params;
  const row = await getCheckRow(checkId);
  if (!row) return jsonResponse({ error: "Not found" }, 404);
  if (row.surface === "app") {
    if (!row.projectId || !(await getProjectContext(row.projectId))) return jsonResponse({ error: "Not found" }, 404);
  } else {
    const settings = await getSetting("freeTools");
    if (!settings.publicEnabled) return jsonResponse({ error: "Not found" }, 404);
  }
  return jsonResponse(toCheckView(row));
}

import { NextResponse, type NextRequest } from "next/server";
import { getProjectContext } from "@/server/auth/context";
import { env } from "@/server/env";
import {
  createGoogleAuthRequest,
  getGoogleOAuthStatus,
  GOOGLE_CALLBACK_PATH,
  GOOGLE_OAUTH_COOKIE,
} from "@/server/integrations/google/oauth";

/**
 * Starts Google consent for the `drive.readonly` scope (knowledge sources). The shared Google
 * callback links the account to the workspace and returns to the Sources tab.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/p/[projectId]/knowledge/google-drive">) {
  const { projectId } = await ctx.params;
  const project = await getProjectContext(projectId);
  if (!project) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(req.nextUrl.pathname)}`, env.appUrl));
  const returnTo = `/p/${project.project.id}/knowledge?tab=sources`;
  const back = (params: Record<string, string>) => {
    const url = new URL(returnTo, env.appUrl);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return NextResponse.redirect(url);
  };
  if (!project.permissions.has("settings.manage") && !project.isInstanceAdmin) return back({ google_error: "forbidden", google_product: "drive" });
  if (!(await getGoogleOAuthStatus()).configured) return back({ google_error: "not_configured", google_product: "drive" });
  const { url, cookieValue } = await createGoogleAuthRequest({ projectId: project.project.id, intent: "drive", userId: project.user.id, returnTo });
  const res = NextResponse.redirect(url);
  res.cookies.set(GOOGLE_OAUTH_COOKIE, cookieValue, { httpOnly: true, secure: !env.isLocal, sameSite: "lax", path: GOOGLE_CALLBACK_PATH, maxAge: 600 });
  return res;
}

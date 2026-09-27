import { env } from "@/server/env";
import { authorizeCloud, cloudJson } from "@/server/cloud/api";

export const dynamic = "force-dynamic";

/** Tenant API (docs/CLOUD.md): reachability + secret check for the AutoSEO Cloud dashboard. */
export async function GET(req: Request) {
  const denied = authorizeCloud(req);
  if (denied) return denied;
  return cloudJson({ ok: true, commit: env.buildCommit });
}

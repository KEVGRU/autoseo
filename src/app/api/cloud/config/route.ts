import { authorizeCloud, cloudJson, readCloudBody } from "@/server/cloud/api";
import { cloudConfigSchema, setPlatformMail } from "@/server/cloud/tenants";

export const dynamic = "force-dynamic";

/** Platform defaults pushed by AutoSEO Cloud: the mail server used while Admin → Email is not configured. */
export async function PUT(req: Request) {
  const denied = authorizeCloud(req);
  if (denied) return denied;
  const body = await readCloudBody(req, cloudConfigSchema);
  if (body instanceof Response) return body;
  return cloudJson({ ok: true, ...(await setPlatformMail(body.mail)) });
}

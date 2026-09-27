import { authorizeCloud, cloudJson, readCloudBody } from "@/server/cloud/api";
import { deleteTenant, getTenant, TENANT_ID_RE, TenantError, tenantInputSchema, upsertTenant } from "@/server/cloud/tenants";

export const dynamic = "force-dynamic";

type Ctx = RouteContext<"/api/cloud/tenants/[tenantId]">;

/** Tenant API auth + tenant id validation; returns the tenant id or an error response. */
async function tenantId(req: Request, ctx: Ctx): Promise<string | Response> {
  const denied = authorizeCloud(req);
  if (denied) return denied;
  const { tenantId } = await ctx.params;
  return TENANT_ID_RE.test(tenantId) ? tenantId : cloudJson({ error: "invalid_tenant_id" }, 400);
}

/** Idempotent upsert of a customer workspace (docs/CLOUD.md → "Tenant API"). */
export async function PUT(req: Request, ctx: Ctx) {
  const id = await tenantId(req, ctx);
  if (id instanceof Response) return id;
  const body = await readCloudBody(req, tenantInputSchema);
  if (body instanceof Response) return body;
  try {
    const { created, ...result } = await upsertTenant(id, body);
    return cloudJson(result, created ? 201 : 200);
  } catch (err) {
    if (err instanceof TenantError) return cloudJson({ error: err.message }, err.status);
    throw err;
  }
}

export async function GET(req: Request, ctx: Ctx) {
  const id = await tenantId(req, ctx);
  if (id instanceof Response) return id;
  const tenant = await getTenant(id);
  return tenant ? cloudJson(tenant) : cloudJson({ error: "not_found" }, 404);
}

/** Deletes the workspace with all its data (404 = already gone, which the cloud treats as done). */
export async function DELETE(req: Request, ctx: Ctx) {
  const id = await tenantId(req, ctx);
  if (id instanceof Response) return id;
  const result = await deleteTenant(id);
  return result ? cloudJson({ ok: true, ...result }) : cloudJson({ error: "not_found" }, 404);
}

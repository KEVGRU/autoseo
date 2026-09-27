import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projects } from "@/server/db/schema";
import { getCurrentSession } from "@/server/auth/session";
import { getUserContext } from "@/server/auth/context";
import { isSharedCloud } from "@/server/env";
import { IMAGE_CONTENT_TYPES, UPLOAD_KINDS, UPLOAD_NAME_RE, uploadDir, type ImageExt, type UploadKind } from "@/server/admin/uploads";

/** Shared cloud: a project logo is only served to members of the project's workspace (and instance admins). */
async function canSeeLogo(url: string): Promise<boolean> {
  const ctx = await getUserContext();
  if (!ctx) return false;
  if (ctx.isInstanceAdmin) return true;
  const rows = await db.select({ workspaceId: projects.workspaceId }).from(projects).where(eq(projects.logoUrl, url));
  return rows.some((r) => ctx.memberships.some((m) => m.workspace.id === r.workspaceId));
}

/**
 * Serves uploaded images. Branding assets (logo/favicon) are public because they appear on the
 * sign-in page; avatars and project logos require a signed-in session.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/uploads/[kind]/[name]">) {
  const { kind, name } = await ctx.params;
  if (!(UPLOAD_KINDS as readonly string[]).includes(kind) || !UPLOAD_NAME_RE.test(name)) {
    return new Response("Not found", { status: 404 });
  }
  const isPublic = kind === "branding";
  if (!isPublic && !(await getCurrentSession())) return new Response("Unauthorized", { status: 401 });
  if (kind === "logos" && isSharedCloud() && !(await canSeeLogo(`/api/uploads/${kind}/${name}`))) {
    return new Response("Not found", { status: 404 });
  }
  const ext = name.split(".").pop() as ImageExt;
  try {
    const buf = await fs.readFile(path.join(uploadDir(kind as UploadKind), name));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": IMAGE_CONTENT_TYPES[ext],
        "Cache-Control": isPublic ? "public, max-age=86400" : "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

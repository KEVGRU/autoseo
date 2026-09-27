"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { runAction, ActionError } from "@/server/auth/guards";
import { actionWorkspace } from "@/server/admin/access";
import { logAudit } from "@/server/audit";
import { rateLimit } from "@/server/rate-limit";
import { removeWorkspaceDfsCredentials, saveWorkspaceDfs, testWorkspaceDfs } from "@/server/dataforseo/credentials";

/** Settings → Workspace → Data providers: the workspace's own DataForSEO account and AI enrichment mode. */

const modeSchema = z.enum(["auto", "dataforseo", "ai"]);

const saveInput = z.object({
  login: z.string().trim().max(254),
  /** undefined = keep the stored API password. */
  password: z.string().max(500).optional(),
  sandbox: z.boolean().default(false),
  mode: modeSchema,
});

export async function saveWorkspaceProvidersAction(workspaceId: string, input: z.input<typeof saveInput>) {
  return runAction(async () => {
    const access = await actionWorkspace(z.string().min(1).parse(workspaceId), "workspace.providers");
    const data = saveInput.parse(input);
    if (data.login && !z.email().safeParse(data.login).success) throw new ActionError("The DataForSEO API login is an email address.", "invalid");
    await saveWorkspaceDfs(access.workspace.id, data, access.ctx.user.id);
    void logAudit("workspace.providers.update", {
      actor: access.ctx.user,
      targetType: "workspace",
      targetId: access.workspace.id,
      workspaceId: access.workspace.id,
      meta: { provider: "dataforseo", mode: data.mode, login: data.login || null, sandbox: data.sandbox, passwordChanged: data.password !== undefined },
    });
    refresh();
    return { ok: true };
  });
}

const testInput = z.object({
  login: z.string().trim().max(254).optional(),
  password: z.string().max(500).optional(),
  sandbox: z.boolean().optional(),
});

/** Tests the entered (or saved) credentials against DataForSEO's free user_data endpoint. */
export async function testWorkspaceProvidersAction(workspaceId: string, input: z.input<typeof testInput> = {}) {
  return runAction(async () => {
    const access = await actionWorkspace(z.string().min(1).parse(workspaceId), "workspace.providers");
    if (!rateLimit(`workspace-dfs-test:${access.workspace.id}`, 10, 10 * 60_000)) {
      throw new ActionError("Too many connection tests — try again in a few minutes.", "conflict");
    }
    const result = await testWorkspaceDfs(access.workspace.id, testInput.parse(input));
    refresh();
    return result;
  });
}

export async function removeWorkspaceProvidersAction(workspaceId: string) {
  return runAction(async () => {
    const access = await actionWorkspace(z.string().min(1).parse(workspaceId), "workspace.providers");
    await removeWorkspaceDfsCredentials(access.workspace.id, access.ctx.user.id);
    void logAudit("workspace.providers.remove", {
      actor: access.ctx.user,
      targetType: "workspace",
      targetId: access.workspace.id,
      workspaceId: access.workspace.id,
      meta: { provider: "dataforseo" },
    });
    refresh();
    return { ok: true };
  });
}

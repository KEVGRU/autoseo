"use server";

import { z } from "zod";
import { ActionError, actionProject, runAction } from "@/server/auth/guards";
import { getProjectContext } from "@/server/auth/context";
import { actionWorkspace } from "@/server/admin/access";
import { rateLimit } from "@/server/rate-limit";
import { createProjectFromCheck, getCheckRow, startAppCheck, VisibilityCheckError } from "@/server/free-tools/visibility-check";

function toActionError(err: unknown): never {
  if (err instanceof VisibilityCheckError) {
    throw new ActionError(err.message, err.status === 404 ? "not_found" : err.status === 409 ? "conflict" : "invalid");
  }
  throw err;
}

/** Starts an AI visibility check from Project → SEO Tools (AI spend → requires "prompts.manage"). */
export async function startAppCheckAction(projectId: string, input: { domain: string; country: string }) {
  return runAction(async () => {
    const ctx = await actionProject(projectId, "prompts.manage");
    try {
      return await startAppCheck(
        {
          projectId: ctx.project.id,
          workspaceId: ctx.project.workspaceId,
          userId: ctx.user.id,
        },
        input,
      );
    } catch (err) {
      return toActionError(err);
    }
  });
}

/**
 * "Track this daily": creates a project from a finished check in a workspace where the user may create projects.
 * In-app checks additionally require access to the project they were started from.
 */
export async function createProjectFromCheckAction(checkId: string, workspaceId: string) {
  return runAction(async () => {
    const id = z.string().min(8).max(64).parse(checkId);
    const access = await actionWorkspace(z.string().min(1).max(40).parse(workspaceId), "projects.manage");
    if (!rateLimit(`ai-check-convert:${access.ctx.user.id}`, 10, 60 * 60_000)) {
      throw new ActionError("Too many projects created in a short time. Please wait a bit.", "invalid");
    }
    const row = await getCheckRow(id);
    if (!row) throw new ActionError("This check doesn't exist or has expired.", "not_found");
    if (row.surface === "app" && (!row.projectId || !(await getProjectContext(row.projectId)))) {
      throw new ActionError("This check doesn't exist or has expired.", "not_found");
    }
    try {
      return await createProjectFromCheck({
        checkId: id,
        workspaceId: access.workspace.id,
        user: { id: access.ctx.user.id, email: access.ctx.user.email },
      });
    } catch (err) {
      if (err instanceof VisibilityCheckError) return toActionError(err);
      throw new ActionError(err instanceof Error ? err.message : "Could not create the project.", "invalid");
    }
  });
}

"use server";

import { z } from "zod";
import { actionProject, runAction } from "@/server/auth/guards";
import { enqueueJob } from "@/server/jobs/queue";
import { feedHealth } from "@/server/ai/knowledge/products";
import { logAudit } from "@/server/audit";

const idSchema = z.string().trim().min(1).max(64).regex(/^[a-z0-9_-]+$/i);

/** Queues intent classification + coverage refresh of the project's fan-out queries. */
export async function classifyFanoutsAction(projectId: string) {
  return runAction(async () => {
    const ctx = await actionProject(idSchema.parse(projectId), "prompts.manage");
    const job = await enqueueJob(
      "ai.fanouts.classify",
      { projectId: ctx.project.id, recomputeCoverage: true },
      { projectId: ctx.project.id, workspaceId: ctx.project.workspaceId, createdBy: ctx.user.id, dedupeKey: `ai.fanouts.classify:${ctx.project.id}`, maxAttempts: 2, allowDemo: true },
    );
    await logAudit("ai.fanouts.classify", { actor: ctx.user, projectId: ctx.project.id, workspaceId: ctx.project.workspaceId });
    return { queued: Boolean(job) };
  });
}

/** Data quality of the imported product catalog (Brand Knowledge → Products). */
export async function getFeedHealthAction(projectId: string) {
  return runAction(async () => {
    const ctx = await actionProject(idSchema.parse(projectId), "project.view");
    return feedHealth(ctx.project.id);
  });
}

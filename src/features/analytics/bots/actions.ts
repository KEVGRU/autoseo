"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, actionProject, runAction } from "@/server/auth/guards";
import { enqueueJob } from "@/server/jobs/queue";
import { rateLimit } from "@/server/rate-limit";
import { logAudit } from "@/server/audit";
import { CloudflareDeployError, deployCloudflareWorker, listCloudflareZones } from "@/server/analytics/bots/cloudflare-deploy";
import { matchZoneForDomain } from "@/server/analytics/bots/cloudflare-worker";

/** Queues a refresh of the published crawler IP range lists (used for bot verification). */
export async function refreshIpRangesAction(projectId: string) {
  return runAction(async () => {
    await actionProject(z.string().min(3).max(64).parse(projectId), "settings.manage");
    const job = await enqueueJob("analytics.bots.ip-ranges", {}, { dedupeKey: "analytics.bots.ip-ranges", priority: 20 });
    return { queued: !!job };
  });
}

/* ───────────── One-click Cloudflare Worker deploy (API token used once, never stored) ───────────── */

const cfTokenSchema = z
  .string()
  .trim()
  .min(20, "Paste a Cloudflare API token.")
  .max(200, "That doesn't look like a Cloudflare API token.")
  .regex(/^[A-Za-z0-9_-]+$/, "That doesn't look like a Cloudflare API token.");

async function withCloudflare<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof CloudflareDeployError) throw new ActionError(err.message, "invalid");
    throw err;
  }
}

/** Step 1: lists the zones the pasted token can read (token only in memory for this request). */
export async function listCloudflareZonesAction(projectId: string, token: string) {
  return runAction(async () => {
    const ctx = await actionProject(z.string().min(3).max(64).parse(projectId), "settings.manage");
    if (!rateLimit(`cf-zones:${ctx.user.id}`, 20, 10 * 60_000)) throw new ActionError("Too many attempts — wait a few minutes.", "invalid");
    const zones = await withCloudflare(() => listCloudflareZones(cfTokenSchema.parse(token)));
    return { zones, suggestedZoneId: matchZoneForDomain(zones, ctx.project.domain)?.id ?? null };
  });
}

/** Step 2: uploads the Worker, routes the zone through it and activates a fresh ingest token. */
export async function deployCloudflareWorkerAction(projectId: string, input: { token: string; zoneId: string }) {
  return runAction(async () => {
    const ctx = await actionProject(z.string().min(3).max(64).parse(projectId), "settings.manage");
    if (!rateLimit(`cf-deploy:${ctx.user.id}`, 10, 10 * 60_000)) throw new ActionError("Too many attempts — wait a few minutes.", "invalid");
    const { token, zoneId } = z.object({ token: cfTokenSchema, zoneId: z.string().regex(/^[a-f0-9]{32}$/, "Choose a zone.") }).parse(input);
    const deployment = await withCloudflare(() => deployCloudflareWorker({ token, zoneId, projectId: ctx.project.id, userId: ctx.user.id }));
    await logAudit("integration.cloudflare_worker_deploy", {
      actor: { id: ctx.user.id, email: ctx.user.email },
      targetType: "integration",
      targetId: "cloudflare",
      workspaceId: ctx.project.workspaceId,
      projectId: ctx.project.id,
      meta: { workerName: deployment.workerName, zoneName: deployment.zoneName, routePattern: deployment.routePattern },
    });
    revalidatePath(`/p/${ctx.project.id}/analytics`, "layout");
    return deployment;
  });
}

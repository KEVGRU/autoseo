"use server";

import { z } from "zod";
import { actionProject, ActionError, runAction } from "@/server/auth/guards";
import { logAudit } from "@/server/audit";
import type { ProjectContext } from "@/server/auth/context";
import {
  addUploadedDocs,
  createKnowledgeSource,
  deleteKnowledgeSource,
  enqueueKnowledgeSync,
  getKnowledgeSource,
  listKnowledgeSources,
  removeUploadedDoc,
  searchKnowledge,
  updateKnowledgeSource,
} from "@/server/ai/knowledge/sources/service";
import { checkNotionToken, parseNotionId } from "@/server/ai/knowledge/sources/notion";
import { checkSlackToken, listSlackChannels } from "@/server/ai/knowledge/sources/slack";
import { driveAccessToken, getDriveFolder, listDriveAccounts, parseDriveFolderId } from "@/server/ai/knowledge/sources/gdrive";
import { normalizeSourceUrls } from "@/server/ai/knowledge/sources/url";
import { MAX_UPLOAD_BYTES, parseUploadedFile } from "@/server/ai/knowledge/sources/upload";
import { decryptJson } from "@/server/crypto";
import type { SourceDoc } from "@/server/ai/knowledge/sources/types";

const pid = z.string().min(1).max(64);
const sid = z.string().min(1).max(64);
/** Managing sources (URLs, uploads, resync) — same permission as the rest of Brand Knowledge. */
const MANAGE = "prompts.manage" as const;
/** Connecting third-party accounts with tokens (Notion, Slack, Drive). */
const CONNECT = "settings.manage" as const;

async function connectCtx(projectId: string): Promise<ProjectContext> {
  const ctx = await actionProject(pid.parse(projectId), MANAGE);
  if (!ctx.isInstanceAdmin && !ctx.permissions.has(CONNECT))
    throw new ActionError("Connecting Notion, Slack or Google Drive requires the “Integrations, API keys, model settings” permission.", "forbidden");
  return ctx;
}

async function audit(ctx: ProjectContext, action: string, sourceId: string, meta: Record<string, unknown> = {}) {
  await logAudit(action, {
    actor: { id: ctx.user.id, email: ctx.user.email },
    targetType: "knowledge_source",
    targetId: sourceId,
    workspaceId: ctx.project.workspaceId,
    projectId: ctx.project.id,
    meta,
  });
}

async function loadSource(ctx: ProjectContext, sourceId: string) {
  const row = await getKnowledgeSource(ctx.project.id, sid.parse(sourceId));
  if (!row) throw new ActionError("Source not found.", "not_found");
  return row;
}

export async function listSourcesAction(projectId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId));
    return listKnowledgeSources(ctx.project.id);
  });
}

/* ───────────────────────────── Connect ───────────────────────────── */

const notionInput = z.object({
  name: z.string().trim().max(120).optional().default(""),
  token: z.string().trim().min(10, "Paste the integration secret").max(300),
  roots: z.string().max(5000).optional().default(""),
});

export async function connectNotionAction(projectId: string, input: z.input<typeof notionInput>) {
  return runAction(async () => {
    const ctx = await connectCtx(projectId);
    const data = notionInput.parse(input);
    const lines = data.roots.split(/[\s,]+/).filter(Boolean);
    const rootIds = lines.map(parseNotionId);
    if (rootIds.some((r) => !r)) throw new ActionError("Enter Notion page / database links or ids (one per line).", "invalid");
    const { workspaceName } = await checkNotionToken(data.token);
    const row = await createKnowledgeSource({
      projectId: ctx.project.id,
      kind: "notion",
      name: data.name || `Notion${workspaceName ? ` · ${workspaceName}` : ""}`,
      config: { rootIds: rootIds as string[], workspaceName },
      token: data.token,
      userId: ctx.user.id,
    });
    await audit(ctx, "knowledge_source.connect", row.id, { kind: "notion" });
    await enqueueKnowledgeSync(row, ctx.user.id);
    return { id: row.id };
  });
}

export async function slackChannelsAction(projectId: string, input: { token?: string; sourceId?: string }) {
  return runAction(async () => {
    const ctx = await connectCtx(projectId);
    let token = z.string().trim().max(300).optional().parse(input.token) ?? "";
    if (!token && input.sourceId) {
      const row = await loadSource(ctx, input.sourceId);
      if (row.kind !== "slack" || !row.secret) throw new ActionError("Not a Slack source.", "invalid");
      token = decryptJson<{ token: string }>(row.secret).token;
    }
    if (!token) throw new ActionError("Paste the Slack bot token first.", "invalid");
    const team = await checkSlackToken(token);
    const channels = await listSlackChannels(token);
    return { team, channels };
  });
}

const slackInput = z.object({
  name: z.string().trim().max(120).optional().default(""),
  token: z.string().trim().min(10).max(300),
  channels: z.array(z.object({ id: z.string().regex(/^[A-Z0-9]{6,20}$/), name: z.string().max(120) })).min(1, "Pick at least one channel").max(50),
  days: z.number().int().min(1).max(365).default(90),
});

export async function connectSlackAction(projectId: string, input: z.input<typeof slackInput>) {
  return runAction(async () => {
    const ctx = await connectCtx(projectId);
    const data = slackInput.parse(input);
    const team = await checkSlackToken(data.token);
    const row = await createKnowledgeSource({
      projectId: ctx.project.id,
      kind: "slack",
      name: data.name || `Slack${team.teamName ? ` · ${team.teamName}` : ""}`,
      config: { channels: data.channels, days: data.days, teamName: team.teamName, teamUrl: team.teamUrl },
      token: data.token,
      userId: ctx.user.id,
    });
    await audit(ctx, "knowledge_source.connect", row.id, { kind: "slack", channels: data.channels.length });
    await enqueueKnowledgeSync(row, ctx.user.id);
    return { id: row.id };
  });
}

const driveInput = z.object({
  name: z.string().trim().max(120).optional().default(""),
  accountId: z.string().min(1).max(64),
  folder: z.string().trim().max(500).optional().default(""),
  maxDocs: z.number().int().min(1).max(1000).default(200),
});

export async function connectDriveAction(projectId: string, input: z.input<typeof driveInput>) {
  return runAction(async () => {
    const ctx = await connectCtx(projectId);
    const data = driveInput.parse(input);
    const accounts = await listDriveAccounts(ctx.project.workspaceId);
    const account = accounts.find((a) => a.id === data.accountId);
    if (!account) throw new ActionError("This Google account hasn't granted Drive access — connect Google Drive first.", "invalid");
    const token = await driveAccessToken(account.id, ctx.project.workspaceId);
    let folder: { id: string; name: string } | null = null;
    if (data.folder) {
      const folderId = parseDriveFolderId(data.folder);
      if (!folderId) throw new ActionError("Paste a Google Drive folder link or id.", "invalid");
      folder = await getDriveFolder(token, folderId);
    }
    const row = await createKnowledgeSource({
      projectId: ctx.project.id,
      kind: "gdrive",
      name: data.name || `Google Drive · ${folder?.name ?? account.email ?? "My Drive"}`,
      config: { googleAccountId: account.id, googleEmail: account.email, folderId: folder?.id ?? null, folderName: folder?.name ?? null, maxDocs: data.maxDocs },
      userId: ctx.user.id,
    });
    await audit(ctx, "knowledge_source.connect", row.id, { kind: "gdrive", folder: folder?.id ?? null });
    await enqueueKnowledgeSync(row, ctx.user.id);
    return { id: row.id };
  });
}

const urlInput = z.object({
  name: z.string().trim().max(120).optional().default(""),
  urls: z.string().trim().min(4, "Add at least one URL").max(20_000),
  followLinks: z.boolean().default(false),
  maxDocs: z.number().int().min(1).max(500).default(25),
});

export async function connectUrlsAction(projectId: string, input: z.input<typeof urlInput>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), MANAGE);
    const data = urlInput.parse(input);
    const { urls, invalid } = normalizeSourceUrls(data.urls.split(/[\s,]+/));
    if (!urls.length) throw new ActionError(invalid.length ? `Not a public URL: ${invalid.slice(0, 3).join(", ")}` : "Add at least one URL.", "invalid");
    if (urls.length > 200) throw new ActionError("Up to 200 URLs per source.", "invalid");
    const row = await createKnowledgeSource({
      projectId: ctx.project.id,
      kind: "url",
      name: data.name || (urls.length === 1 ? new URL(urls[0]!).hostname.replace(/^www\./, "") : `${urls.length} web pages`),
      config: { urls, followLinks: data.followLinks, maxDocs: Math.max(data.maxDocs, data.followLinks ? 1 : urls.length) },
      userId: ctx.user.id,
    });
    await enqueueKnowledgeSync(row, ctx.user.id);
    return { id: row.id, invalid };
  });
}

/** Upload files into a new upload source (or an existing one via `sourceId`). */
export async function uploadKnowledgeFilesAction(projectId: string, form: FormData) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), MANAGE);
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) throw new ActionError("Choose at least one file.", "invalid");
    if (files.length > 20) throw new ActionError("Upload up to 20 files at once.", "invalid");
    const total = files.reduce((a, f) => a + f.size, 0);
    if (total > 24 * 1024 * 1024) throw new ActionError("Uploads are limited to 24 MB per batch — split them into several uploads.", "invalid");
    const parsed: { doc: SourceDoc; name: string; bytes: number }[] = [];
    const errors: string[] = [];
    for (const f of files) {
      if (f.size > MAX_UPLOAD_BYTES) {
        errors.push(`${f.name}: larger than 20 MB`);
        continue;
      }
      try {
        const doc = await parseUploadedFile(f.name, Buffer.from(await f.arrayBuffer()));
        parsed.push({ doc, name: f.name.slice(0, 200), bytes: f.size });
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }
    if (!parsed.length) throw new ActionError(errors.join(" · ") || "No readable files.", "invalid");
    const sourceId = String(form.get("sourceId") ?? "");
    const name = z.string().trim().max(120).parse(String(form.get("name") ?? ""));
    let source = sourceId ? await loadSource(ctx, sourceId) : null;
    if (source && source.kind !== "upload") throw new ActionError("Files can only be added to an upload source.", "invalid");
    source ??= await createKnowledgeSource({ projectId: ctx.project.id, kind: "upload", name: name || (parsed.length === 1 ? parsed[0]!.doc.title : "Uploaded documents"), config: { files: [] }, userId: ctx.user.id });
    const counts = await addUploadedDocs(source, parsed);
    return { id: source.id, added: parsed.length, errors, ...counts };
  });
}

/* ───────────────────────────── Manage ───────────────────────────── */

export async function resyncSourceAction(projectId: string, sourceId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), MANAGE);
    const row = await loadSource(ctx, sourceId);
    if (row.kind === "upload") throw new ActionError("Uploads don't sync — add the new file version instead.", "invalid");
    if (!(await enqueueKnowledgeSync(row, ctx.user.id))) throw new ActionError("Sync could not be started (demo projects never sync).", "invalid");
    return true;
  });
}

const updateInput = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  autoSync: z.boolean().optional(),
  urls: z.string().max(20_000).optional(),
  followLinks: z.boolean().optional(),
  maxDocs: z.number().int().min(1).max(1000).optional(),
  days: z.number().int().min(1).max(365).optional(),
  channels: z.array(z.object({ id: z.string().regex(/^[A-Z0-9]{6,20}$/), name: z.string().max(120) })).min(1).max(50).optional(),
  roots: z.string().max(5000).optional(),
  token: z.string().trim().min(10).max(300).optional(),
});

export async function updateSourceAction(projectId: string, sourceId: string, input: z.input<typeof updateInput>) {
  return runAction(async () => {
    const data = updateInput.parse(input);
    // Replacing a token or changing what a connected account reads needs the connect permission.
    const needsConnect = !!(data.token || data.channels || data.roots !== undefined);
    const ctx = needsConnect ? await connectCtx(projectId) : await actionProject(pid.parse(projectId), MANAGE);
    const row = await loadSource(ctx, sourceId);
    const config: Record<string, unknown> = {};
    if (data.urls !== undefined && row.kind === "url") {
      const { urls } = normalizeSourceUrls(data.urls.split(/[\s,]+/));
      if (!urls.length) throw new ActionError("Add at least one public URL.", "invalid");
      config.urls = urls.slice(0, 200);
    }
    if (data.followLinks !== undefined && row.kind === "url") config.followLinks = data.followLinks;
    if (data.maxDocs !== undefined) config.maxDocs = data.maxDocs;
    if (data.days !== undefined && row.kind === "slack") config.days = data.days;
    if (data.channels && row.kind === "slack") config.channels = data.channels;
    if (data.roots !== undefined && row.kind === "notion") {
      const ids = data.roots.split(/[\s,]+/).filter(Boolean).map(parseNotionId);
      if (ids.some((r) => !r)) throw new ActionError("Enter Notion page / database links or ids.", "invalid");
      config.rootIds = ids;
    }
    if (data.token) {
      if (row.kind === "notion") await checkNotionToken(data.token);
      else if (row.kind === "slack") await checkSlackToken(data.token);
      else throw new ActionError("This source has no token.", "invalid");
    }
    const next = await updateKnowledgeSource(ctx.project.id, row.id, { name: data.name, autoSync: data.autoSync, config, token: data.token });
    if (data.token) await audit(ctx, "knowledge_source.token_rotated", row.id, { kind: row.kind });
    const contentChanged = Object.keys(config).length > 0 || !!data.token;
    if (contentChanged && row.kind !== "upload") await enqueueKnowledgeSync(next, ctx.user.id);
    return { resync: contentChanged };
  });
}

export async function deleteSourceAction(projectId: string, sourceId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), MANAGE);
    const row = await loadSource(ctx, sourceId);
    await deleteKnowledgeSource(ctx.project.id, row.id);
    await audit(ctx, "knowledge_source.delete", row.id, { kind: row.kind, name: row.name });
    return true;
  });
}

export async function removeUploadedFileAction(projectId: string, sourceId: string, docId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), MANAGE);
    const row = await loadSource(ctx, sourceId);
    if (row.kind !== "upload") throw new ActionError("Not an upload source.", "invalid");
    return removeUploadedDoc(row, z.string().min(1).max(500).parse(docId));
  });
}

export async function searchKnowledgeAction(projectId: string, query: string, sourceIds?: string[]) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId));
    const q = z.string().trim().min(2, "Type at least two characters").max(500).parse(query);
    const ids = z.array(sid).max(50).optional().parse(sourceIds);
    return searchKnowledge(ctx.project.id, q, 8, ids?.length ? { sourceIds: ids } : {});
  });
}

import "server-only";
import { and, count, desc, eq, inArray, or, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { cmsChanges, optimizeTasks, projects, users, type CmsChangeStatus } from "@/server/db/schema";
import { ActionError } from "@/server/auth/guards";
import { ApiError } from "@/server/api/errors";
import { logAudit } from "@/server/audit";
import { availableLlmProviders, runLlm } from "@/server/ai/llm";
import { safeHttpUrl } from "@/features/optimize/shared/safe-url";
import { HttpError, UnsafeUrlError } from "../net";
import { addTaskActivity } from "../tasks/activity";
import { createCmsClient, getProviderMeta } from "../integrations/registry";
import { getIntegrationRow, listIntegrationRows, readConfig, readCreds, readTarget } from "../integrations/store";
import type { CmsClient, CmsEditField, CmsItem, CmsItemType, CmsListQuery } from "../integrations/types";
import { FIELD_META, ITEM_TYPE_LABEL, fieldWarnings, itemFieldValue, normalizeFieldValue, sameValue, validateFieldValue } from "./fields";

/**
 * CMS site edits: browse existing CMS content (WordPress, Shopify, Webflow), propose changes to
 * titles / meta / alt text / JSON-LD, apply them after approval (the live value read right
 * before writing is kept as backup) and revert them. Proposals from the agent, MCP and REST are
 * never applied automatically.
 */

export type CmsEditActor = { id: string | null; email?: string | null; workspaceId?: string | null };
export type CmsChangeSource = "user" | "agent" | "mcp" | "api";

const SCOPE_HINT: Record<string, string> = {
  wordpress: "the WordPress user needs the Editor or Administrator role",
  shopify_cms: "the Admin API token needs the read_products, write_products and write_files scopes",
  webflow: "the API token needs CMS read/write, Pages read/write and Sites read",
};

function providerName(provider: string) {
  return getProviderMeta(provider)?.name ?? provider;
}

/** Maps provider/network failures to API errors with an actionable message. */
function providerError(provider: string, err: unknown): Error {
  if (err instanceof ActionError || err instanceof ApiError) return err;
  const name = providerName(provider);
  if (err instanceof HttpError) {
    if (err.status === 401 || err.status === 403)
      return new ApiError("upstream_error", `${name} rejected the request (HTTP ${err.status}) — ${SCOPE_HINT[provider] ?? "check the credentials"}.`);
    if (err.status === 404) return new ApiError("not_found", `${name}: the item was not found (HTTP 404).`);
    if (err.status === 429) return new ApiError("rate_limited", `${name} rate limit reached — try again in a minute.`);
    return new ApiError("upstream_error", `${name}: ${err.message}`);
  }
  if (err instanceof UnsafeUrlError) return new ApiError("validation_error", `${err.message} Use the public address of your ${name} site.`);
  return new ApiError("upstream_error", `${name}: ${err instanceof Error ? err.message : String(err)}`);
}

async function viaProvider<T>(provider: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw providerError(provider, err);
  }
}

type Editor = { provider: string; name: string; client: CmsClient & Required<Pick<CmsClient, "listItems" | "getItem" | "updateItem" | "editTypes">> };

function supportsEdits(client: CmsClient): client is Editor["client"] {
  return !!client.editTypes?.length && !!client.listItems && !!client.getItem && !!client.updateItem;
}

async function openEditor(projectId: string, provider: string): Promise<Editor> {
  const meta = getProviderMeta(provider);
  if (!meta || meta.kind !== "cms") throw new ActionError(`Unknown CMS "${provider}".`, "invalid");
  const row = await getIntegrationRow(projectId, meta.key);
  if (!row || row.status === "disconnected")
    throw new ApiError("not_connected", `${meta.name} is not connected to this project — connect it under Content → Connect CMS (Integrations).`);
  const client = await viaProvider(meta.key, async () => createCmsClient(meta.key, readCreds(row), readTarget(row)));
  if (!supportsEdits(client)) throw new ApiError("conflict", `${meta.name} has no API for editing existing content.`);
  return { provider: meta.key, name: meta.name, client };
}

/* ───────────────────────────── Browse ───────────────────────────── */

export type CmsEditTarget = {
  provider: string;
  name: string;
  account: string | null;
  status: string;
  lastError: string | null;
  itemTypes: { type: CmsItemType; label: string }[];
};

/** Connected CMS integrations that support editing existing content. */
export async function listCmsEditTargets(projectId: string): Promise<CmsEditTarget[]> {
  const rows = await listIntegrationRows(projectId, "cms");
  const out: CmsEditTarget[] = [];
  for (const row of rows) {
    if (row.status === "disconnected") continue;
    const meta = getProviderMeta(row.provider);
    if (!meta || meta.exportOnly) continue;
    let client: CmsClient;
    try {
      client = createCmsClient(meta.key, readCreds(row), readTarget(row));
    } catch {
      continue;
    }
    if (!supportsEdits(client)) continue;
    const labels: Partial<Record<CmsItemType, string>> = { post: "Posts", page: "Pages", product: "Products", collection_item: "CMS items", page_seo: "Static pages" };
    out.push({
      provider: meta.key,
      name: meta.name,
      account: readConfig(row).account,
      status: row.status,
      lastError: row.lastError,
      itemTypes: client.editTypes.map((t) => ({ type: t, label: labels[t] ?? ITEM_TYPE_LABEL[t] })),
    });
  }
  return out;
}

export async function listCmsItems(projectId: string, provider: string, query: CmsListQuery) {
  const ed = await openEditor(projectId, provider);
  if (query.type && !ed.client.editTypes.includes(query.type)) throw new ActionError(`${ed.name} has no editable ${ITEM_TYPE_LABEL[query.type].toLowerCase()} items.`, "invalid");
  const res = await viaProvider(ed.provider, () => ed.client.listItems({ ...query, type: query.type ?? ed.client.editTypes[0] }));
  return { provider: ed.provider, providerName: ed.name, items: res.items.map(safeItem), nextCursor: res.nextCursor };
}

export async function getCmsItem(projectId: string, provider: string, type: CmsItemType, externalId: string) {
  const ed = await openEditor(projectId, provider);
  if (!ed.client.editTypes.includes(type)) throw new ActionError(`${ed.name} has no editable ${ITEM_TYPE_LABEL[type].toLowerCase()} items.`, "invalid");
  return safeItem(await viaProvider(ed.provider, () => ed.client.getItem(type, externalId)));
}

/** Provider-returned links end up in href attributes — keep only absolute http(s) URLs. */
function safeItem(item: CmsItem): CmsItem {
  return { ...item, url: safeHttpUrl(item.url), images: item.images.map((i) => ({ ...i, src: safeHttpUrl(i.src) })) };
}

/* ───────────────────────────── Changes ───────────────────────────── */

type ChangeRow = typeof cmsChanges.$inferSelect;

export type CmsChangeView = {
  id: string;
  provider: string;
  providerName: string;
  externalId: string;
  itemType: string;
  itemTypeLabel: string;
  itemTitle: string | null;
  itemUrl: string | null;
  field: CmsEditField;
  fieldLabel: string;
  fieldKey: string | null;
  before: string | null;
  after: string;
  reason: string | null;
  status: CmsChangeStatus;
  error: string | null;
  source: CmsChangeSource;
  taskId: string | null;
  taskTitle: string | null;
  proposedBy: string | null;
  appliedBy: string | null;
  appliedAt: string | null;
  revertedBy: string | null;
  revertedAt: string | null;
  createdAt: string;
  updatedAt: string;
  warnings: string[];
};

async function toViews(rows: ChangeRow[]): Promise<CmsChangeView[]> {
  const userIds = [...new Set(rows.flatMap((r) => [r.proposedBy, r.appliedBy, r.revertedBy]).filter((v): v is string => !!v))];
  const taskIds = [...new Set(rows.map((r) => r.taskId).filter((v): v is string => !!v))];
  const [userRows, taskRows] = await Promise.all([
    userIds.length ? db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, userIds)) : [],
    taskIds.length ? db.select({ id: optimizeTasks.id, title: optimizeTasks.title }).from(optimizeTasks).where(inArray(optimizeTasks.id, taskIds)) : [],
  ]);
  const userName = new Map(userRows.map((u) => [u.id, u.name || u.email]));
  const taskTitle = new Map(taskRows.map((t) => [t.id, t.title]));
  const who = (id: string | null) => (id ? (userName.get(id) ?? null) : null);
  return rows.map((r) => ({
    id: r.id,
    provider: r.provider,
    providerName: providerName(r.provider),
    externalId: r.externalId,
    itemType: r.itemType,
    itemTypeLabel: ITEM_TYPE_LABEL[r.itemType as CmsItemType] ?? r.itemType,
    itemTitle: r.itemTitle,
    itemUrl: safeHttpUrl(r.itemUrl),
    field: r.field,
    fieldLabel: FIELD_META[r.field].label,
    fieldKey: r.fieldKey,
    before: r.before,
    after: r.after,
    reason: r.reason,
    status: r.status,
    error: r.error,
    source: r.source,
    taskId: r.taskId,
    taskTitle: r.taskId ? (taskTitle.get(r.taskId) ?? null) : null,
    proposedBy: who(r.proposedBy),
    appliedBy: who(r.appliedBy),
    appliedAt: r.appliedAt?.toISOString() ?? null,
    revertedBy: who(r.revertedBy),
    revertedAt: r.revertedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    warnings: fieldWarnings(r.field, r.after),
  }));
}

export const changeListQuery = z.object({
  status: z.enum(["proposed", "applied", "reverted", "rejected", "failed", "open", "all"]).optional(),
  provider: z.string().max(40).optional(),
  taskId: z.string().max(64).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function listCmsChanges(projectId: string, q: z.input<typeof changeListQuery> = {}) {
  const f = changeListQuery.parse(q);
  const conds = [eq(cmsChanges.projectId, projectId)];
  if (f.status === "open") conds.push(inArray(cmsChanges.status, ["proposed", "failed"]));
  else if (f.status && f.status !== "all") conds.push(eq(cmsChanges.status, f.status));
  if (f.provider) conds.push(eq(cmsChanges.provider, f.provider));
  if (f.taskId) conds.push(eq(cmsChanges.taskId, f.taskId));
  const where = and(...conds);
  const [rows, [total], byStatus] = await Promise.all([
    db
      .select()
      .from(cmsChanges)
      .where(where)
      .orderBy(desc(cmsChanges.updatedAt))
      .limit(f.limit)
      .offset((f.page - 1) * f.limit),
    db.select({ n: count() }).from(cmsChanges).where(where),
    db.select({ status: cmsChanges.status, n: count() }).from(cmsChanges).where(eq(cmsChanges.projectId, projectId)).groupBy(cmsChanges.status),
  ]);
  const counts = Object.fromEntries(byStatus.map((r) => [r.status, r.n])) as Partial<Record<CmsChangeStatus, number>>;
  const n = total?.n ?? 0;
  return {
    items: await toViews(rows),
    pagination: { page: f.page, limit: f.limit, total: n, totalPages: Math.max(1, Math.ceil(n / f.limit)) },
    counts: {
      proposed: counts.proposed ?? 0,
      applied: counts.applied ?? 0,
      reverted: counts.reverted ?? 0,
      rejected: counts.rejected ?? 0,
      failed: counts.failed ?? 0,
    },
  };
}

export const proposeInput = z.object({
  provider: z.string().min(1).max(40),
  itemType: z.enum(["post", "page", "product", "collection_item", "page_seo"]),
  externalId: z.string().min(1).max(200),
  changes: z
    .array(
      z.object({
        field: z.enum(["title", "meta_title", "meta_description", "excerpt", "image_alt", "json_ld", "slug"]),
        fieldKey: z.string().max(200).nullish().describe("Image id (image_alt only) — from the item's images."),
        value: z.string().max(50_000),
        reason: z.string().max(1000).nullish(),
      }),
    )
    .min(1)
    .max(20),
  taskId: z.string().max(64).nullish(),
});
export type ProposeInput = z.infer<typeof proposeInput>;

export type ProposeResult = { changes: CmsChangeView[]; skipped: { field: CmsEditField; fieldKey: string | null; reason: string }[] };

/**
 * Stores proposals for one item. `before` is the current live value; an open proposal for the
 * same field is updated instead of duplicated. Nothing is written to the CMS here.
 */
export async function proposeCmsChanges(projectId: string, raw: ProposeInput, actor: CmsEditActor, source: CmsChangeSource): Promise<ProposeResult> {
  const input = proposeInput.parse(raw);
  if (input.taskId) {
    const [task] = await db
      .select({ id: optimizeTasks.id })
      .from(optimizeTasks)
      .where(and(eq(optimizeTasks.projectId, projectId), eq(optimizeTasks.id, input.taskId)))
      .limit(1);
    if (!task) throw new ActionError("Task not found in this project.", "not_found");
  }
  const item = await getCmsItem(projectId, input.provider, input.itemType, input.externalId);
  const provider = getProviderMeta(input.provider)!.key;
  const saved: ChangeRow[] = [];
  const skipped: ProposeResult["skipped"] = [];
  for (const c of input.changes) {
    const fieldKey = c.field === "image_alt" ? (c.fieldKey ?? null) : null;
    if (!item.editable.includes(c.field)) {
      skipped.push({ field: c.field, fieldKey, reason: `${FIELD_META[c.field].label} can't be edited for this ${ITEM_TYPE_LABEL[item.type].toLowerCase()}.${item.notes?.length ? ` ${item.notes[0]}` : ""}` });
      continue;
    }
    if (c.field === "image_alt" && !item.images.some((i) => i.id === fieldKey)) {
      skipped.push({ field: c.field, fieldKey, reason: `Unknown image "${fieldKey ?? ""}" — use one of: ${item.images.map((i) => i.id).join(", ") || "none"}.` });
      continue;
    }
    const after = normalizeFieldValue(c.field, c.value);
    const invalid = validateFieldValue(c.field, after);
    if (invalid) {
      skipped.push({ field: c.field, fieldKey, reason: invalid });
      continue;
    }
    const before = itemFieldValue(item, c.field, fieldKey);
    if (sameValue(c.field, before, after)) {
      skipped.push({ field: c.field, fieldKey, reason: "Unchanged — the live value is already this." });
      continue;
    }
    const values = {
      itemTitle: item.title.slice(0, 500),
      itemUrl: item.url,
      before: before == null ? null : normalizeFieldValue(c.field, before),
      after,
      reason: c.reason?.trim() || null,
      status: "proposed" as const,
      error: null,
      source,
      taskId: input.taskId ?? null,
      proposedBy: actor.id,
    };
    const [open] = await db
      .select({ id: cmsChanges.id })
      .from(cmsChanges)
      .where(
        and(
          eq(cmsChanges.projectId, projectId),
          eq(cmsChanges.provider, provider),
          eq(cmsChanges.externalId, item.externalId),
          eq(cmsChanges.field, c.field),
          fieldKey ? eq(cmsChanges.fieldKey, fieldKey) : isNull(cmsChanges.fieldKey),
          or(eq(cmsChanges.status, "proposed"), eq(cmsChanges.status, "failed")),
        ),
      )
      .limit(1);
    const [row] = open
      ? await db.update(cmsChanges).set(values).where(eq(cmsChanges.id, open.id)).returning()
      : await db
          .insert(cmsChanges)
          .values({ projectId, provider, externalId: item.externalId, itemType: item.type, field: c.field, fieldKey, ...values })
          .returning();
    if (row) saved.push(row);
  }
  if (saved.length) {
    await logAudit("cms.change.proposed", {
      actor: actor.id && actor.email ? { id: actor.id, email: actor.email } : null,
      workspaceId: actor.workspaceId ?? null,
      projectId,
      targetType: "cms_item",
      targetId: `${provider}:${item.externalId}`,
      meta: { changeIds: saved.map((r) => r.id), fields: saved.map((r) => r.field), source },
    });
    if (input.taskId) {
      await addTaskActivity({
        taskId: input.taskId,
        projectId,
        kind: "edited",
        body: `Proposed ${saved.length} site edit${saved.length === 1 ? "" : "s"} for “${item.title}” (${saved.map((r) => FIELD_META[r.field].label).join(", ")}) — review under Content → Site edits.`,
        meta: { changeIds: saved.map((r) => r.id), provider },
        userId: actor.id,
      });
    }
  }
  return { changes: await toViews(saved), skipped };
}

async function loadChange(projectId: string, changeId: string): Promise<ChangeRow> {
  const [row] = await db
    .select()
    .from(cmsChanges)
    .where(and(eq(cmsChanges.projectId, projectId), eq(cmsChanges.id, changeId)))
    .limit(1);
  if (!row) throw new ActionError("Change not found.", "not_found");
  return row;
}

/** The CMS accepted the write but stores a different value — the item WAS changed. */
class CmsVerifyError extends ApiError {
  constructor(message: string) {
    super("upstream_error", message);
  }
}

/** Writes `value` and reads the item back to confirm the CMS stored it. */
async function writeAndVerify(ed: Editor, row: ChangeRow, value: string): Promise<{ note: string | null }> {
  const type = row.itemType as CmsItemType;
  const res = await viaProvider(ed.provider, () => ed.client.updateItem(type, row.externalId, { field: row.field, value, fieldKey: row.fieldKey }));
  const after = await viaProvider(ed.provider, () => ed.client.getItem(type, row.externalId));
  const stored = itemFieldValue(after, row.field, row.fieldKey);
  if (!sameValue(row.field, stored, value)) {
    const hint =
      row.field === "json_ld" && ed.provider === "wordpress"
        ? " WordPress probably stripped the <script> tag — the user needs the unfiltered_html capability (Administrator / Editor on single sites)."
        : "";
    throw new CmsVerifyError(`${ed.name} accepted the request but reports a different value (“${(stored ?? "").slice(0, 120)}”).${hint}`);
  }
  return { note: res.note ?? null };
}

async function audit(action: string, row: ChangeRow, actor: CmsEditActor, meta: Record<string, unknown> = {}) {
  await logAudit(action, {
    actor: actor.id && actor.email ? { id: actor.id, email: actor.email } : null,
    workspaceId: actor.workspaceId ?? null,
    projectId: row.projectId,
    targetType: "cms_change",
    targetId: row.id,
    meta: { provider: row.provider, externalId: row.externalId, field: row.field, ...meta },
  });
}

/**
 * Applies an approved proposal: re-reads the live value (kept as backup for undo), writes the new
 * value and verifies it. Failures are stored on the change (status failed) and re-thrown.
 */
export async function applyCmsChange(projectId: string, changeId: string, actor: CmsEditActor) {
  const row = await loadChange(projectId, changeId);
  if (row.status !== "proposed" && row.status !== "failed") throw new ActionError(`This change is already ${row.status}.`, "conflict");
  let backup: string | null = row.before;
  try {
    const ed = await openEditor(projectId, row.provider);
    const item = await viaProvider(ed.provider, () => ed.client.getItem(row.itemType as CmsItemType, row.externalId));
    if (!item.editable.includes(row.field)) throw new ActionError(`${FIELD_META[row.field].label} is no longer editable for this item.`, "conflict");
    const live = itemFieldValue(item, row.field, row.fieldKey);
    if (live == null) throw new ActionError("The image this change targets no longer exists on the item.", "conflict");
    let note: string | null = null;
    let warning: string | null = null;
    if (sameValue(row.field, live, row.after)) {
      note = "The live value already matched — nothing was written.";
    } else {
      backup = normalizeFieldValue(row.field, live);
      try {
        note = (await writeAndVerify(ed, row, row.after)).note;
      } catch (err) {
        if (!(err instanceof CmsVerifyError)) throw err;
        // The item was changed but not to the proposed value: restore the backup right away. If
        // that fails too, keep the change "applied" so Revert (with the stored backup) stays possible.
        const restored = await writeAndVerify(ed, row, backup).then(
          () => true,
          () => false,
        );
        if (restored) throw new CmsVerifyError(`${err.message} The previous value was restored.`);
        warning = `${err.message} Restoring the previous value failed — use Revert to restore the backup.`;
        note = warning;
      }
    }
    const [updated] = await db
      .update(cmsChanges)
      .set({ status: "applied", before: backup, error: warning?.slice(0, 1000) ?? null, appliedBy: actor.id, appliedAt: new Date(), itemTitle: item.title.slice(0, 500), itemUrl: item.url })
      .where(and(eq(cmsChanges.id, row.id), inArray(cmsChanges.status, ["proposed", "failed"])))
      .returning();
    if (!updated) throw new ActionError("This change was handled by someone else in the meantime.", "conflict");
    await audit("cms.change.applied", row, actor, { note });
    if (row.taskId) {
      await addTaskActivity({
        taskId: row.taskId,
        projectId,
        kind: "pushed",
        body: `Site edit applied in ${ed.name}: ${FIELD_META[row.field].label} of “${item.title}”.`,
        meta: { changeId: row.id, provider: row.provider, url: item.url },
        userId: actor.id,
      });
    }
    return { change: (await toViews([updated]))[0]!, note };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(cmsChanges)
      .set({ status: "failed", error: message.slice(0, 1000), before: backup })
      .where(and(eq(cmsChanges.id, row.id), inArray(cmsChanges.status, ["proposed", "failed"])));
    throw err;
  }
}

/**
 * Restores the backup (`before`) of an applied change. Refuses when the live value changed since
 * the edit was applied, unless `force` is set.
 */
export async function revertCmsChange(projectId: string, changeId: string, actor: CmsEditActor, opts: { force?: boolean } = {}) {
  const row = await loadChange(projectId, changeId);
  if (row.status !== "applied") throw new ActionError("Only applied changes can be reverted.", "conflict");
  const ed = await openEditor(projectId, row.provider);
  const item = await viaProvider(ed.provider, () => ed.client.getItem(row.itemType as CmsItemType, row.externalId));
  const live = itemFieldValue(item, row.field, row.fieldKey);
  if (live == null) throw new ActionError("The image this change targeted no longer exists on the item.", "conflict");
  if (!opts.force && !sameValue(row.field, live, row.after))
    throw new ActionError(
      `The live value changed since this edit was applied (now “${normalizeFieldValue(row.field, live).slice(0, 120)}”). Revert anyway to restore the backup?`,
      "conflict",
    );
  const restore = row.before ?? "";
  let note: string | null = null;
  if (!sameValue(row.field, live, restore)) {
    try {
      note = (await writeAndVerify(ed, row, restore)).note;
    } catch (err) {
      await db.update(cmsChanges).set({ error: (err instanceof Error ? err.message : String(err)).slice(0, 1000) }).where(eq(cmsChanges.id, row.id));
      throw err;
    }
  }
  const [updated] = await db
    .update(cmsChanges)
    .set({ status: "reverted", error: null, revertedBy: actor.id, revertedAt: new Date() })
    .where(and(eq(cmsChanges.id, row.id), eq(cmsChanges.status, "applied")))
    .returning();
  if (!updated) throw new ActionError("This change was handled by someone else in the meantime.", "conflict");
  await audit("cms.change.reverted", row, actor, { forced: !!opts.force });
  if (row.taskId) {
    await addTaskActivity({
      taskId: row.taskId,
      projectId,
      kind: "pushed",
      body: `Site edit reverted in ${ed.name}: ${FIELD_META[row.field].label} of “${item.title}” restored.`,
      meta: { changeId: row.id, provider: row.provider },
      userId: actor.id,
    });
  }
  return { change: (await toViews([updated]))[0]!, note };
}

export async function rejectCmsChanges(projectId: string, changeIds: string[], actor: CmsEditActor) {
  const ids = [...new Set(changeIds)].slice(0, 200);
  if (!ids.length) return { rejected: 0 };
  const rows = await db
    .update(cmsChanges)
    .set({ status: "rejected" })
    .where(and(eq(cmsChanges.projectId, projectId), inArray(cmsChanges.id, ids), inArray(cmsChanges.status, ["proposed", "failed"])))
    .returning({ id: cmsChanges.id, provider: cmsChanges.provider, externalId: cmsChanges.externalId, field: cmsChanges.field });
  for (const r of rows) {
    await logAudit("cms.change.rejected", {
      actor: actor.id && actor.email ? { id: actor.id, email: actor.email } : null,
      workspaceId: actor.workspaceId ?? null,
      projectId,
      targetType: "cms_change",
      targetId: r.id,
      meta: { provider: r.provider, externalId: r.externalId, field: r.field },
    });
  }
  return { rejected: rows.length };
}

/** Edits the proposed value of an open change before approving it. */
export async function updateProposedValue(projectId: string, changeId: string, value: string) {
  const row = await loadChange(projectId, changeId);
  if (row.status !== "proposed" && row.status !== "failed") throw new ActionError("Only open proposals can be edited.", "conflict");
  const after = normalizeFieldValue(row.field, value);
  const invalid = validateFieldValue(row.field, after);
  if (invalid) throw new ActionError(invalid, "invalid");
  const [updated] = await db
    .update(cmsChanges)
    .set({ after, status: "proposed", error: null })
    .where(and(eq(cmsChanges.id, row.id), inArray(cmsChanges.status, ["proposed", "failed"])))
    .returning();
  if (!updated) throw new ActionError("This change was handled by someone else in the meantime.", "conflict");
  return (await toViews([updated]))[0]!;
}

/* ───────────────────────────── AI suggestions ───────────────────────────── */

const SUGGEST_GUIDE: Partial<Record<CmsEditField, string>> = {
  meta_title: "an SEO title of 45–60 characters: primary topic first, specific, no clickbait, brand at the end only if it fits",
  meta_description: "a meta description of 120–155 characters that directly answers what the page offers, with one concrete detail, no quotes",
  image_alt: "alt text under 125 characters that literally describes what the image most likely shows, no 'image of'",
  excerpt: "a 1–2 sentence summary (max 300 characters) that states the key takeaway",
  title: "a clear, specific page title (max 70 characters)",
};

export async function suggestCmsValue(
  projectId: string,
  input: { provider: string; itemType: CmsItemType; externalId: string; field: CmsEditField; fieldKey?: string | null },
  ctx: { workspaceId: string; userId: string | null },
): Promise<{ value: string }> {
  const guide = SUGGEST_GUIDE[input.field];
  if (!guide) throw new ActionError(`AI suggestions aren't available for ${FIELD_META[input.field].label}.`, "invalid");
  if (!(await availableLlmProviders().catch(() => [])).length)
    throw new ApiError("not_configured", "No AI provider is available. Connect a local agent or add an API key in Admin → AI Providers.");
  const [item, [project]] = await Promise.all([
    getCmsItem(projectId, input.provider, input.itemType, input.externalId),
    db.select({ name: projects.name, domain: projects.domain, language: projects.language }).from(projects).where(eq(projects.id, projectId)).limit(1),
  ]);
  const image = input.field === "image_alt" ? item.images.find((i) => i.id === input.fieldKey) : null;
  if (input.field === "image_alt" && !image) throw new ActionError("Choose the image first.", "invalid");
  const facts = [
    `Brand: ${project?.name ?? ""} (${project?.domain ?? ""})`,
    `Page type: ${ITEM_TYPE_LABEL[item.type]}`,
    `Page title: ${item.fields.title ?? item.title}`,
    item.url ? `URL: ${item.url}` : "",
    item.fields.meta_title ? `Current SEO title: ${item.fields.meta_title}` : "",
    item.fields.meta_description ? `Current meta description: ${item.fields.meta_description}` : "",
    item.fields.excerpt ? `Summary: ${item.fields.excerpt.slice(0, 1200)}` : "",
    image ? `Image: ${image.label ?? ""} ${image.src ?? ""} (current alt: ${image.alt || "none"})` : "",
  ].filter(Boolean);
  const res = await runLlm({
    purpose: "content.site_edit",
    system: "You write concise on-page SEO copy for existing web pages. Use only facts given. Answer in the page's language.",
    prompt: `${facts.join("\n")}\n\nLanguage: ${project?.language ?? "en"}.\nWrite ${guide}. Return JSON {"value": "..."}.`,
    schema: z.object({ value: z.string() }),
    effort: "low",
    projectId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
  });
  const value = normalizeFieldValue(input.field, res.data.value.replace(/^["“]|["”]$/g, ""));
  const invalid = validateFieldValue(input.field, value);
  if (invalid) throw new ActionError(invalid, "invalid");
  return { value };
}

/** Open proposals (proposed + failed) — badge on the Content → Site edits tab. */
export async function countOpenCmsChanges(projectId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(cmsChanges)
    .where(and(eq(cmsChanges.projectId, projectId), inArray(cmsChanges.status, ["proposed", "failed"])));
  return row?.n ?? 0;
}

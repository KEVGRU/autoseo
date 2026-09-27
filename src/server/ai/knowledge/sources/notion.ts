import "server-only";
import { httpJson, IntegrationHttpError, type HttpOptions } from "@/server/integrations/http";
import { notionBlockText, notionPageTitle, notionPropertiesText, type NotionBlock } from "./convert";
import { capDocs, KnowledgeSourceError, MAX_DOC_CHARS, type FetchResult, type SourceDoc } from "./types";

/**
 * Notion connector (internal integration token). Reads every page shared with the integration —
 * or only the pages / databases listed as roots — and flattens their block trees to text.
 */

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const MAX_DEPTH = 3;

type NotionPage = { object: "page"; id: string; url?: string; last_edited_time?: string; archived?: boolean; in_trash?: boolean; properties?: Record<string, Record<string, unknown>> };
type Paged<T> = { results: T[]; has_more?: boolean; next_cursor?: string | null };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function notion<T>(token: string, path: string, opts: HttpOptions = {}): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      // Notion allows ~3 requests/second per integration.
      await sleep(340);
      return await httpJson<T>(`${API}${path}`, {
        ...opts,
        headers: { Authorization: `Bearer ${token}`, "Notion-Version": VERSION, ...(opts.headers ?? {}) },
        timeoutMs: 30_000,
      });
    } catch (err) {
      if (err instanceof IntegrationHttpError && (err.status === 429 || err.status >= 500) && attempt < 3) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      throw notionError(err);
    }
  }
}

function notionError(err: unknown): Error {
  if (err instanceof IntegrationHttpError) {
    let message = "";
    try {
      message = (JSON.parse(err.body) as { message?: string }).message ?? "";
    } catch {
      message = "";
    }
    if (err.status === 401) return new KnowledgeSourceError("Notion rejected the token — check the internal integration secret.");
    if (err.status === 403) return new KnowledgeSourceError(`Notion denied access${message ? `: ${message}` : ""}. Share the pages with the integration (••• → Connections).`);
    if (err.status === 404) return new KnowledgeSourceError(`Notion page or database not found or not shared with the integration${message ? ` (${message})` : ""}.`);
    return new KnowledgeSourceError(`Notion API error (${err.status || "network"})${message ? `: ${message}` : `: ${err.message}`}`);
  }
  return err instanceof Error ? err : new Error(String(err));
}

/** Validates a token and returns the workspace name it belongs to. */
export async function checkNotionToken(token: string): Promise<{ workspaceName: string | null }> {
  if (!/^(secret_|ntn_)[A-Za-z0-9]{20,}$/.test(token.trim())) throw new KnowledgeSourceError("That doesn't look like a Notion internal integration secret (starts with ntn_ or secret_).");
  const me = await notion<{ bot?: { workspace_name?: string | null } }>(token.trim(), "/users/me");
  return { workspaceName: me.bot?.workspace_name ?? null };
}

/** Accepts a page / database id or URL and returns the 32-hex id (dashed). */
export function parseNotionId(input: string): string | null {
  const hex = input.replace(/-/g, "").match(/([0-9a-f]{32})(?:[?#].*)?$/i)?.[1];
  if (!hex) return null;
  const h = hex.toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function blocksToLines(token: string, blockId: string, depth: number, childPages: string[], budget: { chars: number }): Promise<string[]> {
  const lines: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await notion<Paged<NotionBlock>>(token, `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ""}`);
    for (const block of page.results) {
      if (block.type === "child_page") childPages.push(block.id);
      if (block.type === "child_database") childPages.push(`db:${block.id}`);
      const text = notionBlockText(block, depth);
      if (text) {
        lines.push(text);
        budget.chars -= text.length;
      }
      if (block.has_children && depth < MAX_DEPTH && block.type !== "child_page" && block.type !== "child_database" && budget.chars > 0) {
        lines.push(...(await blocksToLines(token, block.id, depth + 1, childPages, budget)));
      }
    }
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined;
  } while (cursor && budget.chars > 0);
  return lines;
}

async function pageToDoc(token: string, page: NotionPage, childPages: string[]): Promise<SourceDoc | null> {
  if (page.archived || page.in_trash) return null;
  const title = notionPageTitle(page as never) || "Untitled";
  const props = notionPropertiesText(page);
  const lines = await blocksToLines(token, page.id, 0, childPages, { chars: MAX_DOC_CHARS });
  const text = [props, lines.join("\n")].filter(Boolean).join("\n\n").slice(0, MAX_DOC_CHARS);
  if (!text.trim()) return null;
  return { docId: page.id, title, url: page.url ?? null, text, updatedAt: page.last_edited_time ? new Date(page.last_edited_time) : null };
}

async function databasePages(token: string, databaseId: string, limit: number): Promise<NotionPage[]> {
  const out: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const page = await notion<Paged<NotionPage>>(token, `/databases/${databaseId}/query`, {
      method: "POST",
      body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    out.push(...page.results.filter((p) => p.object === "page"));
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined;
  } while (cursor && out.length < limit);
  return out.slice(0, limit);
}

export async function fetchNotionDocs(token: string, opts: { rootIds?: string[]; maxDocs?: number }): Promise<FetchResult> {
  const max = capDocs(opts.maxDocs);
  const notes: string[] = [];
  const docs: SourceDoc[] = [];
  const seen = new Set<string>();
  const queue: NotionPage[] = [];
  const pending: string[] = [];

  if (opts.rootIds?.length) {
    for (const id of opts.rootIds) {
      try {
        queue.push(await notion<NotionPage>(token, `/pages/${id}`));
      } catch (err) {
        // Not a page → maybe a database.
        try {
          queue.push(...(await databasePages(token, id, max)));
        } catch {
          notes.push(err instanceof Error ? err.message : String(err));
        }
      }
    }
  } else {
    let cursor: string | undefined;
    do {
      const res = await notion<Paged<NotionPage>>(token, "/search", {
        method: "POST",
        body: { filter: { property: "object", value: "page" }, sort: { direction: "descending", timestamp: "last_edited_time" }, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
      });
      queue.push(...res.results.filter((p) => p.object === "page"));
      cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
    } while (cursor && queue.length < max);
    if (!queue.length) throw new KnowledgeSourceError("The integration can't see any pages yet. In Notion open a page → ••• → Connections → add your integration.");
  }

  while ((queue.length || pending.length) && docs.length < max) {
    if (!queue.length) {
      // Child pages / databases found inside synced pages (only followed for root-scoped sources).
      const next = pending.shift()!;
      try {
        if (next.startsWith("db:")) queue.push(...(await databasePages(token, next.slice(3), max - docs.length)));
        else queue.push(await notion<NotionPage>(token, `/pages/${next}`));
      } catch (err) {
        notes.push(err instanceof Error ? err.message : String(err));
      }
      continue;
    }
    const page = queue.shift()!;
    if (seen.has(page.id)) continue;
    seen.add(page.id);
    const children: string[] = [];
    try {
      const doc = await pageToDoc(token, page, children);
      if (doc) docs.push(doc);
    } catch (err) {
      notes.push(`${notionPageTitle(page as never) || page.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (opts.rootIds?.length) for (const c of children) if (!seen.has(c.replace(/^db:/, ""))) pending.push(c);
  }
  if (docs.length >= max) notes.push(`Stopped at ${max} pages (limit per sync).`);
  return { docs, notes };
}

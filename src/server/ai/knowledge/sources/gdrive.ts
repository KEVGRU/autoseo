import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { googleAccounts } from "@/server/db/schema";
import { getAccountAccessToken } from "@/server/integrations/google/accounts";
import { GOOGLE_SCOPE } from "@/server/integrations/google/core";
import { extractGoogleError } from "@/server/integrations/google/oauth";
import { httpJson, IntegrationHttpError } from "@/server/integrations/http";
import { pdfToText } from "@/server/optimize/fact-check/documents";
import { docxToText } from "./convert";
import { capDocs, KnowledgeSourceError, MAX_DOC_CHARS, type FetchResult, type SourceDoc } from "./types";

/**
 * Google Drive connector — reuses the workspace Google accounts (OAuth) with the `drive.readonly`
 * scope. Google Docs / Slides are exported as text, Sheets as CSV, PDFs and DOCX are parsed.
 */

const API = "https://www.googleapis.com/drive/v3";
const MAX_FILE_BYTES = 20 * 1024 * 1024;

const GDOC = "application/vnd.google-apps.document";
const GSHEET = "application/vnd.google-apps.spreadsheet";
const GSLIDES = "application/vnd.google-apps.presentation";
const FOLDER = "application/vnd.google-apps.folder";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const SUPPORTED = [GDOC, GSHEET, GSLIDES, "application/pdf", DOCX, "text/plain", "text/markdown", "text/csv"];

type DriveFile = { id: string; name: string; mimeType: string; modifiedTime?: string; webViewLink?: string; size?: string };

export type DriveAccount = { id: string; email: string | null; name: string | null; status: string };

/** Workspace Google accounts that granted Drive read access. */
export async function listDriveAccounts(workspaceId: string): Promise<DriveAccount[]> {
  const rows = await db
    .select({ id: googleAccounts.id, email: googleAccounts.email, name: googleAccounts.name, status: googleAccounts.status, scopes: googleAccounts.scopes })
    .from(googleAccounts)
    .where(and(eq(googleAccounts.workspaceId, workspaceId)));
  return rows.filter((r) => r.scopes.includes(GOOGLE_SCOPE.drive) && r.status !== "revoked").map((r) => ({ id: r.id, email: r.email, name: r.name, status: r.status }));
}

function driveError(err: unknown): Error {
  if (err instanceof IntegrationHttpError) {
    const upstream = extractGoogleError(err.body);
    if (err.status === 401) return new KnowledgeSourceError("Google Drive denied access — reconnect the Google account.");
    if (err.status === 403) {
      if (/SERVICE_DISABLED|has not been used|is disabled/i.test(err.body))
        return new KnowledgeSourceError("The Google Drive API is not enabled for the OAuth client's Google Cloud project. An admin must enable it in Google Cloud Console.");
      return new KnowledgeSourceError(`Google Drive denied access.${upstream ? ` ${upstream}` : ""}`);
    }
    if (err.status === 404) return new KnowledgeSourceError("Drive folder or file not found (or not shared with this account).");
    return new KnowledgeSourceError(`Google Drive API error (${err.status || "network"})${upstream ? `: ${upstream}` : ""}`);
  }
  return err instanceof Error ? err : new Error(String(err));
}

async function drive<T>(token: string, path: string): Promise<T> {
  try {
    return await httpJson<T>(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` }, timeoutMs: 30_000 });
  } catch (err) {
    throw driveError(err);
  }
}

async function driveBytes(token: string, path: string): Promise<Buffer> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(60_000), cache: "no-store" });
  if (!res.ok) throw driveError(new IntegrationHttpError(`Drive responded with HTTP ${res.status}`, res.status, (await res.text().catch(() => "")).slice(0, 1000)));
  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_FILE_BYTES) throw new KnowledgeSourceError("File is larger than 20 MB.");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_FILE_BYTES) throw new KnowledgeSourceError("File is larger than 20 MB.");
  return buf;
}

/** Accepts a folder URL (drive.google.com/drive/folders/<id>) or a raw id. */
export function parseDriveFolderId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const fromUrl = s.match(/\/folders\/([A-Za-z0-9_-]{10,})/)?.[1] ?? s.match(/[?&]id=([A-Za-z0-9_-]{10,})/)?.[1];
  if (fromUrl) return fromUrl;
  return /^[A-Za-z0-9_-]{10,}$/.test(s) ? s : null;
}

export async function driveAccessToken(accountId: string, workspaceId: string): Promise<string> {
  return getAccountAccessToken(accountId, { workspaceId, scope: GOOGLE_SCOPE.drive });
}

/** Resolves a folder id to its name (validates access). */
export async function getDriveFolder(token: string, folderId: string): Promise<{ id: string; name: string }> {
  const f = await drive<DriveFile>(token, `/files/${encodeURIComponent(folderId)}?fields=id,name,mimeType&supportsAllDrives=true`);
  if (f.mimeType !== FOLDER) throw new KnowledgeSourceError(`“${f.name}” is not a folder.`);
  return { id: f.id, name: f.name };
}

const FIELDS = "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,size)";

async function listFiles(token: string, folderId: string | null, max: number): Promise<DriveFile[]> {
  const types = `(${[...SUPPORTED, ...(folderId ? [FOLDER] : [])].map((m) => `mimeType = '${m}'`).join(" or ")})`;
  const files: DriveFile[] = [];
  const folders: (string | null)[] = [folderId ?? null];
  const visited = new Set<string>();
  while (folders.length && files.length < max && visited.size < 100) {
    const parent = folders.shift()!;
    if (parent) {
      if (visited.has(parent)) continue;
      visited.add(parent);
    }
    let pageToken = "";
    do {
      const q = `trashed = false and ${types}${parent ? ` and '${parent.replace(/'/g, "")}' in parents` : ""}`;
      const res = await drive<{ files?: DriveFile[]; nextPageToken?: string }>(
        token,
        `/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(FIELDS)}&pageSize=100&orderBy=modifiedTime%20desc&supportsAllDrives=true&includeItemsFromAllDrives=true${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`,
      );
      for (const f of res.files ?? []) {
        if (f.mimeType === FOLDER) folders.push(f.id);
        else files.push(f);
      }
      pageToken = res.nextPageToken ?? "";
    } while (pageToken && files.length < max);
  }
  return files.slice(0, max);
}

async function fileText(token: string, f: DriveFile): Promise<string> {
  const id = encodeURIComponent(f.id);
  if (f.mimeType === GDOC || f.mimeType === GSLIDES) return (await driveBytes(token, `/files/${id}/export?mimeType=text%2Fplain`)).toString("utf8");
  if (f.mimeType === GSHEET) return (await driveBytes(token, `/files/${id}/export?mimeType=text%2Fcsv`)).toString("utf8");
  if (Number(f.size ?? 0) > MAX_FILE_BYTES) throw new KnowledgeSourceError("File is larger than 20 MB.");
  const bytes = await driveBytes(token, `/files/${id}?alt=media&supportsAllDrives=true`);
  if (f.mimeType === "application/pdf") return pdfToText(new Uint8Array(bytes));
  if (f.mimeType === DOCX) return docxToText(bytes);
  return bytes.toString("utf8");
}

export async function fetchDriveDocs(token: string, opts: { folderId?: string | null; maxDocs?: number }): Promise<FetchResult> {
  const max = capDocs(opts.maxDocs);
  const notes: string[] = [];
  const files = await listFiles(token, opts.folderId ?? null, max);
  if (!files.length) throw new KnowledgeSourceError(opts.folderId ? "The folder has no supported files (Docs, Sheets, Slides, PDF, DOCX, text)." : "No supported files found in this Drive.");
  const docs: SourceDoc[] = [];
  for (const f of files) {
    try {
      const text = (await fileText(token, f)).replace(/\u0000/g, "").trim();
      if (text.length < 20) continue;
      docs.push({ docId: f.id, title: f.name, url: f.webViewLink ?? null, text: text.slice(0, MAX_DOC_CHARS), updatedAt: f.modifiedTime ? new Date(f.modifiedTime) : null });
    } catch (err) {
      notes.push(`${f.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  if (!docs.length) throw new KnowledgeSourceError(notes.slice(0, 3).join(" ") || "No readable text in the Drive files.");
  return { docs, notes };
}

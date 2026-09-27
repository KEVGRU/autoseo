import "server-only";
import { createHash } from "node:crypto";
import { htmlToText, pdfToText } from "@/server/optimize/fact-check/documents";
import { docxToText } from "./convert";
import { KnowledgeSourceError, MAX_DOC_CHARS, type SourceDoc } from "./types";

/** File uploads (PDF, DOCX, Markdown, plain text, HTML, CSV) → documents. */

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const UPLOAD_ACCEPT = ".pdf,.docx,.md,.markdown,.txt,.text,.html,.htm,.csv";

function sanitizeName(name: string): string {
  return name.replace(/[^\p{L}\p{N}._\- ()]/gu, "_").slice(0, 200) || "document";
}

export async function parseUploadedFile(name: string, bytes: Buffer): Promise<SourceDoc> {
  if (!bytes.length) throw new KnowledgeSourceError(`${name}: the file is empty.`);
  if (bytes.length > MAX_UPLOAD_BYTES) throw new KnowledgeSourceError(`${name}: files up to 20 MB are supported.`);
  const fileName = sanitizeName(name);
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  const magic = bytes.subarray(0, 5).toString("latin1");
  let text: string;
  if (magic === "%PDF-") text = await pdfToText(new Uint8Array(bytes));
  else if (magic.startsWith("PK") && (ext === "docx" || ext === "")) text = docxToText(bytes);
  else if (magic.startsWith("PK")) throw new KnowledgeSourceError(`${fileName}: only DOCX archives are supported (save .doc / .odt as .docx or PDF).`);
  else if (ext === "html" || ext === "htm") text = htmlToText(bytes.toString("utf8")).text;
  else if (["md", "markdown", "txt", "text", "csv"].includes(ext)) text = bytes.toString("utf8");
  else throw new KnowledgeSourceError(`${fileName}: unsupported file type. Upload PDF, DOCX, Markdown, TXT, HTML or CSV.`);
  const clean = text.replace(/\u0000/g, "").trim();
  if (clean.length < 20) throw new KnowledgeSourceError(`${fileName}: no readable text found (scanned PDFs need OCR first).`);
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 24);
  return { docId: `upload:${hash}`, title: fileName.replace(/\.[a-z0-9]+$/i, ""), url: null, text: clean.slice(0, MAX_DOC_CHARS), updatedAt: new Date() };
}

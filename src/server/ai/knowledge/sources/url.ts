import "server-only";
import * as cheerio from "cheerio";
import { parsePublicUrl, safeFetch, UnsafeUrlError } from "@/server/optimize/net";
import { extractPage } from "@/server/optimize/content/html-extract";
import { htmlToText, pdfToText } from "@/server/optimize/fact-check/documents";
import { capDocs, KnowledgeSourceError, MAX_DOC_CHARS, type FetchResult, type SourceDoc } from "./types";

/**
 * URL list connector: SSRF-safe fetch of public pages (HTML readability extraction, PDFs, text),
 * optionally following same-site links found on the listed pages.
 */

const SKIP_EXT = /\.(jpe?g|png|gif|webp|svg|ico|css|js|mjs|json|xml|zip|gz|mp4|mp3|webm|woff2?|ttf|eot|avi|mov)(\?|$)/i;
const SKIP_PATH = /\/(cart|checkout|account|login|logout|register|wp-admin|wp-login|warenkorb|kasse|konto|anmelden|search|suche)(\/|$|\?)/i;

/** Validates + normalizes user URLs (adds https://, drops fragments, blocks private hosts). */
export function normalizeSourceUrls(input: string[]): { urls: string[]; invalid: string[] } {
  const urls = new Set<string>();
  const invalid: string[] = [];
  for (const raw of input.map((u) => u.trim()).filter(Boolean)) {
    try {
      const u = parsePublicUrl(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      u.hash = "";
      urls.add(u.toString());
    } catch (err) {
      invalid.push(err instanceof UnsafeUrlError ? `${raw} (${err.message})` : raw);
    }
  }
  return { urls: [...urls], invalid };
}

type Fetched = { doc: SourceDoc | null; links: string[] };

async function fetchOne(url: string, collectLinks: boolean): Promise<Fetched> {
  const res = await safeFetch(url, { timeoutMs: 25_000, maxBytes: 8 * 1024 * 1024, headers: { accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,text/plain;q=0.8,*/*;q=0.5" } });
  if (!res.ok) throw new KnowledgeSourceError(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  const finalUrl = res.url;
  if (type.includes("pdf") || res.body.subarray(0, 5).toString("latin1") === "%PDF-") {
    const text = await pdfToText(new Uint8Array(res.body));
    const name = decodeURIComponent(new URL(finalUrl).pathname.split("/").pop() || "document.pdf");
    return { doc: text.trim().length >= 40 ? { docId: finalUrl, title: name, url: finalUrl, text: text.slice(0, MAX_DOC_CHARS), updatedAt: new Date() } : null, links: [] };
  }
  if (type.includes("text/plain") || type.includes("markdown")) {
    const text = res.text();
    return { doc: text.trim().length >= 40 ? { docId: finalUrl, title: new URL(finalUrl).pathname.split("/").pop() || new URL(finalUrl).hostname, url: finalUrl, text: text.slice(0, MAX_DOC_CHARS), updatedAt: new Date() } : null, links: [] };
  }
  if (type && !type.includes("html")) throw new KnowledgeSourceError(`unsupported content type ${type.split(";")[0]}`);
  const html = res.text();
  const page = extractPage(html, finalUrl);
  // Readability extraction first; fall back to the full body text for pages without a main container.
  let text = page.markdown;
  if (page.wordCount < 60) {
    const full = htmlToText(html).text;
    if (full.split(/\s+/).length > page.wordCount) text = full;
  }
  const title = page.metaTitle || page.title || new URL(finalUrl).hostname;
  const description = page.metaDescription ? `${page.metaDescription}\n\n` : "";
  const links: string[] = [];
  if (collectLinks) {
    const $ = cheerio.load(html);
    const host = new URL(finalUrl).hostname.replace(/^www\./, "");
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return;
      try {
        const abs = new URL(href, finalUrl);
        abs.hash = "";
        if (abs.hostname.replace(/^www\./, "") !== host || !/^https?:$/.test(abs.protocol)) return;
        if (SKIP_EXT.test(abs.pathname) || SKIP_PATH.test(abs.pathname)) return;
        links.push(abs.toString());
      } catch {
        // ignore malformed links
      }
    });
  }
  const body = `${description}${text}`.trim();
  return { doc: body.split(/\s+/).length >= 25 ? { docId: finalUrl, title, url: finalUrl, text: body.slice(0, MAX_DOC_CHARS), updatedAt: new Date() } : null, links };
}

export async function fetchUrlDocs(opts: { urls: string[]; followLinks?: boolean; maxDocs?: number }): Promise<FetchResult> {
  const max = capDocs(opts.maxDocs ?? (opts.followLinks ? 25 : 100));
  const { urls, invalid } = normalizeSourceUrls(opts.urls);
  const notes = invalid.map((u) => `Skipped invalid URL: ${u}`);
  if (!urls.length) throw new KnowledgeSourceError("Add at least one public http(s) URL.");
  const queue = [...urls];
  const seen = new Set<string>(urls);
  const docs: SourceDoc[] = [];
  const seenDocs = new Set<string>();
  let failed = 0;
  const worker = async () => {
    while (queue.length && docs.length < max) {
      const url = queue.shift()!;
      try {
        const { doc, links } = await fetchOne(url, !!opts.followLinks && urls.includes(url));
        if (doc && !seenDocs.has(doc.docId)) {
          seenDocs.add(doc.docId);
          docs.push(doc);
        }
        // Shorter paths first: section / overview pages carry the most brand knowledge.
        for (const l of links.sort((a, b) => a.length - b.length)) {
          if (seen.has(l) || seen.size >= max * 4) continue;
          seen.add(l);
          queue.push(l);
        }
      } catch (err) {
        failed++;
        if (notes.length < 25) notes.push(`${url}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  if (!docs.length) throw new KnowledgeSourceError(notes.slice(0, 3).join(" · ") || "No readable content found at these URLs.");
  if (failed) notes.unshift(`${failed} URL${failed === 1 ? "" : "s"} could not be read.`);
  return { docs: docs.slice(0, max), notes };
}

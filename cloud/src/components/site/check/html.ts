/**
 * Static analysis of the raw HTML a crawler receives (no JavaScript is executed — exactly the point: most AI
 * crawlers don't render JavaScript either). Tolerant of broken markup and without a DOM dependency. Elements are
 * located with indexOf scans and tag attributes with `[^>]*` patterns, so the work stays linear in the page size
 * and a hostile page can't stall the server with unclosed tags.
 */

export type HtmlFacts = {
  title: string | null;
  description: string | null;
  canonical: string | null;
  lang: string | null;
  hreflang: string[];
  metaRobots: string | null;
  viewport: boolean;
  og: { title: boolean; description: boolean; image: boolean };
  h1: string[];
  h2Count: number;
  wordCount: number;
  /** Heuristic signals that the page needs JavaScript to show its content. */
  spaSignals: string[];
  scriptCount: number;
  jsonLd: { blocks: number; errors: number; types: string[] };
  microdata: boolean;
  metaRefresh: boolean;
};

/** Maximum HTML analysed (characters). */
export const HTML_MAX_CHARS = 1_500_000;

type Element = { attrs: string; inner: string; start: number; end: number };

/** ASCII-only lowercase: same length as the input, so indexes found in it apply to the original. */
function asciiLower(s: string): string {
  return s.replace(/[A-Z]+/g, (m) => m.toLowerCase());
}

function isBoundary(code: number): boolean {
  // '>', '/', whitespace
  return code === 62 || code === 47 || code === 32 || code === 9 || code === 10 || code === 12 || code === 13;
}

/** Elements `<name …>inner</name>` in document order (an unclosed element runs to the end). */
function elements(src: string, lower: string, name: string, max = 1000): Element[] {
  const out: Element[] = [];
  const open = `<${name}`;
  const close = `</${name}`;
  let i = 0;
  while (out.length < max) {
    const s = lower.indexOf(open, i);
    if (s < 0) break;
    if (!isBoundary(lower.charCodeAt(s + open.length))) {
      i = s + open.length;
      continue;
    }
    const gt = lower.indexOf(">", s);
    if (gt < 0) break;
    const c = lower.indexOf(close, gt + 1);
    if (c < 0) {
      out.push({ attrs: src.slice(s + open.length, gt), inner: src.slice(gt + 1), start: s, end: src.length });
      break;
    }
    const cEnd = lower.indexOf(">", c);
    const end = cEnd < 0 ? src.length : cEnd + 1;
    out.push({ attrs: src.slice(s + open.length, gt), inner: src.slice(gt + 1, c), start: s, end });
    i = end;
  }
  return out;
}

/** Removes whole elements (and comments) from the markup. */
function without(src: string, names: string[]): string {
  let text = src;
  const comments = /<!--[\s\S]*?(?:-->|$)/g;
  text = text.replace(comments, " ");
  for (const name of names) {
    const lower = asciiLower(text);
    const found = elements(text, lower, name, 10_000);
    if (!found.length) continue;
    let out = "";
    let last = 0;
    for (const el of found) {
      out += text.slice(last, el.start) + " ";
      last = el.end;
    }
    text = out + text.slice(last);
  }
  return text;
}

/** Attribute strings (capped at 4 KB) of start tags like `<meta …>`, in document order. */
function tags(src: string, name: string, max = 2000): string[] {
  const lower = asciiLower(src);
  const out: string[] = [];
  const open = `<${name}`;
  let i = 0;
  while (out.length < max) {
    const s = lower.indexOf(open, i);
    if (s < 0) break;
    if (!isBoundary(lower.charCodeAt(s + open.length))) {
      i = s + open.length;
      continue;
    }
    const gt = lower.indexOf(">", s);
    if (gt < 0) break;
    out.push(src.slice(s + open.length, Math.min(gt, s + open.length + 4096)));
    i = gt + 1;
  }
  return out;
}

/** Attributes of a tag's attribute string, keys lowercased. */
export function parseAttrs(attrs: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of attrs.matchAll(/([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    const key = m[1]!.toLowerCase();
    if (key in out) continue;
    out[key] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…",
  laquo: "«", raquo: "»", bdquo: "„", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", copy: "©", reg: "®",
  trade: "™", euro: "€", auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ß",
  eacute: "é", egrave: "è", aacute: "á", agrave: "à", ccedil: "ç", middot: "·", bull: "•",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
    }
    return NAMED[code] ?? m;
  });
}

/** Markup without tags (an unterminated `<…` is dropped), linear in the input. */
function stripTags(fragment: string): string {
  let out = "";
  let i = 0;
  for (;;) {
    const lt = fragment.indexOf("<", i);
    if (lt < 0) return out + fragment.slice(i);
    out += `${fragment.slice(i, lt)} `;
    const gt = fragment.indexOf(">", lt);
    if (gt < 0) return out;
    i = gt + 1;
  }
}

function textOf(fragment: string): string {
  return decodeEntities(stripTags(fragment)).replace(/\s+/g, " ").trim();
}

function metaContent(html: string, key: "name" | "property", value: string): string | null {
  for (const attrs of tags(html, "meta")) {
    const a = parseAttrs(attrs);
    if ((a[key] ?? "").trim().toLowerCase() === value) return (a.content ?? "").trim();
  }
  return null;
}

/** Every `@type` in a JSON-LD value (walks @graph and nested objects; bounded). */
function collectTypes(value: unknown, into: Set<string>, budget = { nodes: 5000 }, depth = 0): void {
  if (depth > 25 || budget.nodes-- <= 0 || value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const v of value) collectTypes(v, into, budget, depth + 1);
    return;
  }
  const obj = value as Record<string, unknown>;
  const t = obj["@type"];
  for (const type of Array.isArray(t) ? t : [t]) {
    if (typeof type === "string" && type.length < 80) into.add(type.replace(/^https?:\/\/schema\.org\//, ""));
  }
  for (const v of Object.values(obj)) collectTypes(v, into, budget, depth + 1);
}

/** Ids of typical client-side app mount points; empty in the served HTML means nothing was pre-rendered. */
const MOUNT_IDS = ["root", "app", "__next", "__nuxt", "svelte", "q-app", "___gatsby", "react-root"];

function emptyMount(src: string, lower: string, id: string): boolean {
  for (const quote of ['"', "'"]) {
    const needle = `id=${quote}${id}${quote}`;
    let from = 0;
    for (let n = 0; n < 50; n++) {
      const at = lower.indexOf(needle, from);
      if (at < 0) break;
      from = at + needle.length;
      const tagStart = lower.lastIndexOf("<", at);
      if (at - tagStart > 4096) continue;
      const gt = lower.indexOf(">", at);
      if (tagStart < 0 || gt < 0 || !/^<(div|main|section)\b/.test(lower.slice(tagStart, tagStart + 8))) continue;
      const next = lower.indexOf("<", gt + 1);
      if (next >= 0 && /^\s*$/.test(src.slice(gt + 1, next)) && lower.startsWith("</", next)) return true;
    }
  }
  return false;
}

export function analyzeHtml(input: string): HtmlFacts {
  const html = input.length > HTML_MAX_CHARS ? input.slice(0, HTML_MAX_CHARS) : input;
  const lower = asciiLower(html);
  const headEnd = lower.indexOf("</head");
  const head = headEnd >= 0 ? html.slice(0, headEnd) : html.slice(0, 200_000);
  const bodyStart = lower.indexOf("<body");
  const bodyHtml = bodyStart >= 0 ? html.slice(bodyStart) : headEnd >= 0 ? html.slice(headEnd) : html;
  const bodyLower = bodyStart >= 0 ? lower.slice(bodyStart) : headEnd >= 0 ? lower.slice(headEnd) : lower;

  const titleEl = elements(head, asciiLower(head), "title", 1)[0];
  const title = titleEl ? textOf(titleEl.inner).slice(0, 300) || null : null;

  let canonical: string | null = null;
  const hreflang: string[] = [];
  for (const attrs of tags(html, "link")) {
    const a = parseAttrs(attrs);
    const rel = (a.rel ?? "").toLowerCase().split(/\s+/);
    if (rel.includes("canonical") && canonical === null && a.href) canonical = a.href.trim();
    if (rel.includes("alternate") && a.hreflang) hreflang.push(a.hreflang.trim());
  }

  const htmlTag = tags(html, "html")[0];
  const lang = htmlTag ? (parseAttrs(htmlTag).lang ?? "").trim() || null : null;

  const scripts = elements(html, lower, "script", 5000);
  const types = new Set<string>();
  let blocks = 0;
  let errors = 0;
  for (const el of scripts) {
    if ((parseAttrs(el.attrs).type ?? "").trim().toLowerCase() !== "application/ld+json") continue;
    blocks++;
    const raw = el.inner.replace(/^\s*(?:<!--|\/\/\s*<!\[CDATA\[)/, "").replace(/(?:-->|\/\/\s*\]\]>)\s*$/, "");
    try {
      collectTypes(JSON.parse(raw), types);
    } catch {
      errors++;
    }
  }

  // Visible text: what a crawler that doesn't run JavaScript can read.
  const visible = textOf(without(bodyHtml, ["script", "style", "noscript", "template", "svg", "iframe", "object", "head"]));
  const words = (visible.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
  // Scripts without word separators (CJK) count roughly two characters per word.
  const cjk = (visible.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu) ?? []).length;

  const h1 = elements(bodyHtml, bodyLower, "h1", 20).map((el) => textOf(el.inner)).filter(Boolean);
  const h2Count = elements(bodyHtml, bodyLower, "h2", 5000).length;

  const spaSignals: string[] = [];
  for (const id of MOUNT_IDS) if (emptyMount(bodyHtml, bodyLower, id)) spaSignals.push(`empty #${id}`);
  if (/<app-root\b[^>]{0,500}>\s{0,200}<\/app-root\s*>/i.test(bodyHtml)) spaSignals.push("empty <app-root>");
  if (
    elements(html, lower, "noscript", 50).some(
      (el) => /javascript/i.test(el.inner) && /(enable|activate|aktivier|required|benötigt|need)/i.test(el.inner),
    )
  ) {
    spaSignals.push("noscript asks for JavaScript");
  }

  const metaRefresh = tags(head, "meta").some((attrs) => (parseAttrs(attrs)["http-equiv"] ?? "").trim().toLowerCase() === "refresh");

  return {
    title,
    description: metaContent(head, "name", "description"),
    canonical,
    lang,
    hreflang: [...new Set(hreflang)].slice(0, 50),
    metaRobots: metaContent(head, "name", "robots"),
    viewport: metaContent(head, "name", "viewport") !== null,
    og: {
      title: metaContent(head, "property", "og:title") !== null,
      description: metaContent(head, "property", "og:description") !== null,
      image: metaContent(head, "property", "og:image") !== null,
    },
    h1: h1.slice(0, 5).map((t) => t.slice(0, 200)),
    h2Count,
    wordCount: words + Math.round(cjk / 2),
    spaSignals,
    scriptCount: scripts.length,
    jsonLd: { blocks, errors, types: [...types].sort().slice(0, 40) },
    microdata: /\bitemtype\s*=\s*["']?https?:\/\/schema\.org\//i.test(html),
    metaRefresh,
  };
}

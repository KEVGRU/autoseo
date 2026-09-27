/**
 * Pure converters from connector payloads to plain text (unit-testable, no server-only imports):
 * Notion blocks, Slack messages, DOCX (zip + WordprocessingML) and XML entities.
 */
import zlib from "node:zlib";

/* ───────────────────────────── Notion ───────────────────────────── */

type NotionRichText = { plain_text?: string; href?: string | null };
export type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  [key: string]: unknown;
};

export function notionRichText(rt: unknown): string {
  if (!Array.isArray(rt)) return "";
  return (rt as NotionRichText[]).map((r) => r.plain_text ?? "").join("");
}

/** Text of one Notion block (markdown-ish), or null for blocks without readable text. */
export function notionBlockText(block: NotionBlock, depth = 0): string | null {
  const data = (block[block.type] ?? {}) as Record<string, unknown>;
  const text = notionRichText(data.rich_text ?? data.text);
  const indent = "  ".repeat(Math.min(depth, 4));
  switch (block.type) {
    case "heading_1":
      return text ? `# ${text}` : null;
    case "heading_2":
      return text ? `## ${text}` : null;
    case "heading_3":
      return text ? `### ${text}` : null;
    case "paragraph":
    case "quote":
    case "callout":
    case "toggle":
      return text ? `${indent}${block.type === "quote" ? "> " : ""}${text}` : null;
    case "bulleted_list_item":
      return text ? `${indent}- ${text}` : null;
    case "numbered_list_item":
      return text ? `${indent}1. ${text}` : null;
    case "to_do":
      return text ? `${indent}- [${data.checked ? "x" : " "}] ${text}` : null;
    case "code":
      return text ? `\`\`\`\n${text}\n\`\`\`` : null;
    case "equation":
      return typeof data.expression === "string" ? data.expression : null;
    case "table_row": {
      const cells = Array.isArray(data.cells) ? (data.cells as unknown[]).map((c) => notionRichText(c).replace(/\|/g, "/")) : [];
      return cells.length ? `| ${cells.join(" | ")} |` : null;
    }
    case "bookmark":
    case "embed":
    case "link_preview":
      return typeof data.url === "string" ? `${indent}${notionRichText(data.caption) || data.url}` : null;
    case "child_page":
      return typeof data.title === "string" && data.title ? `${indent}${data.title}` : null;
    default:
      return text || null;
  }
}

/** Title of a Notion page object (the property of type "title"). */
export function notionPageTitle(page: { properties?: Record<string, { type?: string; title?: unknown }> }): string {
  for (const prop of Object.values(page.properties ?? {})) {
    if (prop?.type === "title") return notionRichText(prop.title).trim();
  }
  return "";
}

/** Plain-text summary of a database row's non-title properties ("Status: Done · Owner: …"). */
export function notionPropertiesText(page: { properties?: Record<string, Record<string, unknown>> }): string {
  const parts: string[] = [];
  for (const [name, prop] of Object.entries(page.properties ?? {})) {
    const type = String(prop?.type ?? "");
    const v = prop?.[type] as unknown;
    let value = "";
    if (type === "title") continue;
    if (type === "rich_text") value = notionRichText(v);
    else if (type === "number" && typeof v === "number") value = String(v);
    else if ((type === "select" || type === "status") && v && typeof v === "object") value = String((v as { name?: string }).name ?? "");
    else if (type === "multi_select" && Array.isArray(v)) value = (v as { name?: string }[]).map((x) => x.name ?? "").filter(Boolean).join(", ");
    else if (type === "date" && v && typeof v === "object") value = String((v as { start?: string }).start ?? "");
    else if ((type === "url" || type === "email" || type === "phone_number") && typeof v === "string") value = v;
    else if (type === "checkbox" && typeof v === "boolean") value = v ? "yes" : "no";
    if (value.trim()) parts.push(`${name}: ${value.trim()}`);
  }
  return parts.join(" · ");
}

/* ───────────────────────────── Slack ───────────────────────────── */

export type SlackMessage = { ts: string; user?: string; bot_id?: string; username?: string; text?: string; subtype?: string; thread_ts?: string; replies?: SlackMessage[] };

/** Slack mrkdwn → plain text (user/channel mentions resolved, links as "label (url)"). */
export function slackToText(text: string, users: Map<string, string>): string {
  return text
    .replace(/<@([A-Z0-9]+)(?:\|([^>]+))?>/g, (_, id: string, label?: string) => `@${label ?? users.get(id) ?? id}`)
    .replace(/<#([A-Z0-9]+)(?:\|([^>]*))?>/g, (_, id: string, label?: string) => `#${label || id}`)
    .replace(/<!(here|channel|everyone)[^>]*>/g, "@$1")
    .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "$2 ($1)")
    .replace(/<(https?:\/\/[^>]+)>/g, "$1")
    .replace(/<mailto:[^|>]+\|([^>]+)>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

export type SlackDoc = { docId: string; title: string; url: string | null; text: string; updatedAt: Date };

const IGNORED_SUBTYPES = new Set(["channel_join", "channel_leave", "channel_topic", "channel_purpose", "channel_name", "bot_add", "bot_remove", "pinned_item"]);

/**
 * Groups a channel's messages into one document per UTC day ("#general — 2026-09-20"), oldest
 * first, with thread replies indented under their parent. Permalinks point at the day's first message.
 */
export function slackMessagesToDocs(channel: { id: string; name: string }, messages: SlackMessage[], users: Map<string, string>, teamUrl: string | null): SlackDoc[] {
  const byDay = new Map<string, SlackMessage[]>();
  for (const m of messages) {
    if (m.subtype && IGNORED_SUBTYPES.has(m.subtype)) continue;
    if (!m.text?.trim()) continue;
    const day = new Date(Number(m.ts) * 1000).toISOString().slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(m);
  }
  const who = (m: SlackMessage) => (m.user ? users.get(m.user) ?? m.user : m.username ?? (m.bot_id ? "bot" : "unknown"));
  const line = (m: SlackMessage, indent = "") => `${indent}${new Date(Number(m.ts) * 1000).toISOString().slice(11, 16)} ${who(m)}: ${slackToText(m.text ?? "", users)}`;
  const docs: SlackDoc[] = [];
  for (const [day, list] of [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    list.sort((a, b) => Number(a.ts) - Number(b.ts));
    const lines: string[] = [];
    for (const m of list) {
      lines.push(line(m));
      for (const r of (m.replies ?? []).filter((x) => x.ts !== m.ts && x.text?.trim()).sort((a, b) => Number(a.ts) - Number(b.ts))) lines.push(line(r, "    ↳ "));
    }
    const first = list[0]!;
    const last = list[list.length - 1]!;
    docs.push({
      docId: `${channel.id}:${day}`,
      title: `#${channel.name} — ${day}`,
      url: teamUrl ? `${teamUrl.replace(/\/+$/, "")}/archives/${channel.id}/p${first.ts.replace(".", "")}` : null,
      text: lines.join("\n"),
      updatedAt: new Date(Number(last.ts) * 1000),
    });
  }
  return docs;
}

/* ───────────────────────────── DOCX ───────────────────────────── */

export function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** WordprocessingML (word/document.xml) → text; heading styles become markdown headings, tables pipe rows. */
export function docxXmlToText(xml: string): string {
  const body = xml.replace(/<w:instrText[\s\S]*?<\/w:instrText>/g, "");
  const out: string[] = [];
  const paragraphs = body.split(/<\/w:p>/);
  for (const p of paragraphs) {
    const style = p.match(/<w:pStyle\s+w:val="([^"]+)"/)?.[1] ?? "";
    const level = /^(heading|berschrift|titre|titulo|kop)\s*(\d)/i.exec(style.replace(/^Ü/, ""))?.[2] ?? (/^(title|titel)$/i.test(style) ? "1" : null);
    const text = decodeXmlEntities(
      p
        .replace(/<w:tab\/>/g, "\t")
        .replace(/<w:(br|cr)\/>/g, "\n")
        .replace(/<\/w:tc>/g, " | ")
        .match(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>|\t|\n| \| /g)
        ?.map((m) => (m.startsWith("<w:t") ? m.replace(/<w:t(?:\s[^>]*)?>/, "").replace(/<\/w:t>$/, "") : m))
        .join("") ?? "",
    ).trim();
    if (!text) continue;
    const isList = /<w:numPr>/.test(p);
    out.push(level ? `${"#".repeat(Math.min(6, Number(level)))} ${text}` : isList ? `- ${text}` : text);
  }
  return out.join("\n\n");
}

const MAX_ENTRY_BYTES = 60 * 1024 * 1024;

/** Reads one file from a ZIP archive (stored or deflated), bounded against zip bombs. Returns null when absent. */
export function unzipEntry(zip: Buffer, name: string): Buffer | null {
  // End of central directory record (last 64 KiB + 22 bytes).
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65_557); i--) {
    if (zip.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a valid ZIP/DOCX file.");
  const entries = zip.readUInt16LE(eocd + 10);
  let p = zip.readUInt32LE(eocd + 16);
  for (let n = 0; n < entries && p + 46 <= zip.length; n++) {
    if (zip.readUInt32LE(p) !== 0x02014b50) break;
    const method = zip.readUInt16LE(p + 10);
    const compressed = zip.readUInt32LE(p + 20);
    const size = zip.readUInt32LE(p + 24);
    const nameLen = zip.readUInt16LE(p + 28);
    const extraLen = zip.readUInt16LE(p + 30);
    const commentLen = zip.readUInt16LE(p + 32);
    const localOffset = zip.readUInt32LE(p + 42);
    const entryName = zip.subarray(p + 46, p + 46 + nameLen).toString("utf8");
    p += 46 + nameLen + extraLen + commentLen;
    if (entryName !== name) continue;
    if (size > MAX_ENTRY_BYTES) throw new Error("The document is too large.");
    if (zip.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("Corrupt ZIP entry.");
    const start = localOffset + 30 + zip.readUInt16LE(localOffset + 26) + zip.readUInt16LE(localOffset + 28);
    const data = zip.subarray(start, start + compressed);
    if (method === 0) return Buffer.from(data);
    if (method === 8) return zlib.inflateRawSync(data, { maxOutputLength: MAX_ENTRY_BYTES });
    throw new Error(`Unsupported ZIP compression method ${method}.`);
  }
  return null;
}

export function docxToText(bytes: Buffer): string {
  const xml = unzipEntry(bytes, "word/document.xml");
  if (!xml) throw new Error("This DOCX file has no document body.");
  return docxXmlToText(xml.toString("utf8"));
}

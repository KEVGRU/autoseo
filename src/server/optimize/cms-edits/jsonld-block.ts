/**
 * Pure helpers to read / replace the JSON-LD block embedded in CMS post HTML (WordPress stores the
 * `<script type="application/ld+json">` we publish inside the post content). Unit-tested.
 */

const LD_SCRIPT_RE = /\n?<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/i;

/** JSON of the first JSON-LD script in the HTML ("" when there is none). */
export function extractJsonLd(html: string): string {
  const m = html.match(LD_SCRIPT_RE);
  if (!m) return "";
  const raw = m[1]!.replace(/<\\\//g, "</").trim();
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

/**
 * Escapes every "<" (as \u003c inside valid JSON) so the JSON can neither close the script tag nor
 * open "<!--" / "<script" sequences that change how the browser parses the rest of the page.
 */
export function jsonLdScript(json: string): string {
  let body: string;
  try {
    body = JSON.stringify(JSON.parse(json)).replace(/</g, "\\u003c");
  } catch {
    body = json.trim().replace(/<\//g, "<\\/");
  }
  return `<script type="application/ld+json">${body}</script>`;
}

/**
 * Replaces the first JSON-LD script with `json`, appends one when missing, or removes it when
 * `json` is empty (undo of an added block).
 */
export function replaceJsonLd(html: string, json: string): string {
  const has = LD_SCRIPT_RE.test(html);
  if (!json.trim()) return has ? html.replace(LD_SCRIPT_RE, "") : html;
  const script = jsonLdScript(json);
  if (has) return html.replace(LD_SCRIPT_RE, (m) => `${m.startsWith("\n") ? "\n" : ""}${script}`);
  return `${html.replace(/\s+$/, "")}\n${script}`;
}

import { getCountry } from "@/lib/countries";

/* Isomorphic CSV helpers for the tracker (import preview on the client, validation on the server). */

export type CsvPromptRow = {
  line: number;
  text: string;
  tags: string[];
  /** Primary market. */
  country: string | null;
  /** Every market (country column may list several, e.g. "DE|FR|IT"); primary first. Empty = none given. */
  markets: string[];
  error: string | null;
};

function csvCountry(raw: string): string | null {
  const v = raw.trim().toUpperCase();
  return getCountry(v === "GB" ? "UK" : v)?.iso ?? null;
}

/** Minimal RFC 4180 CSV parser (quotes, escaped quotes, CRLF, ; or , delimiter). */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delim = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

/**
 * Validates CSV rows with columns prompt,tags,country (header optional; tags separated by | or ;;
 * several markets in the country column separated by | or spaces, first = primary).
 */
export function parsePromptCsv(input: string, defaultCountry: string): CsvPromptRow[] {
  const rows = parseCsv(input);
  if (!rows.length) return [];
  const header = rows[0]!.map((h) => h.trim().toLowerCase());
  const hasHeader = header.includes("prompt") || header.includes("text") || header.includes("question");
  const idx = {
    text: hasHeader ? Math.max(header.indexOf("prompt"), header.indexOf("text"), header.indexOf("question")) : 0,
    tags: hasHeader ? Math.max(header.indexOf("tags"), header.indexOf("tag")) : 1,
    country: hasHeader ? Math.max(header.indexOf("country"), header.indexOf("location"), header.indexOf("market")) : 2,
  };
  const out: CsvPromptRow[] = [];
  rows.slice(hasHeader ? 1 : 0).forEach((r, i) => {
    const line = i + (hasHeader ? 2 : 1);
    const text = (r[idx.text] ?? "").trim().replace(/\s+/g, " ");
    const tags = idx.tags >= 0 ? (r[idx.tags] ?? "").split(/[|;]/).map((t) => t.trim()).filter(Boolean) : [];
    const rawCountry = idx.country >= 0 ? (r[idx.country] ?? "").trim() : "";
    const rawMarkets = rawCountry.split(/[|/\s]+/).filter(Boolean);
    const unknown = rawMarkets.find((m) => !csvCountry(m));
    // No country → [] (the project's default markets apply on import).
    const markets = [...new Set(rawMarkets.map(csvCountry).filter((m): m is string => !!m))];
    const country = unknown ? null : (markets[0] ?? defaultCountry);
    let error: string | null = null;
    if (text.length < 3) error = "Prompt text is missing or too short.";
    else if (text.length > 2000) error = "Prompt is longer than 2000 characters.";
    else if (unknown) error = `Unknown country "${unknown}".`;
    else if (markets.length > 20) error = "At most 20 markets per prompt.";
    else if (tags.some((t) => t.length > 60)) error = "Tag names must be ≤ 60 characters.";
    out.push({ line, text, tags, country, markets, error });
  });
  return out;
}

/** Serializes rows to CSV (RFC 4180 quoting, formula-injection safe). */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    if (v == null) return "";
    let s = String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

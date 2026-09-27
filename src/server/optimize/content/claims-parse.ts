/**
 * Pure helpers for content claim checks (isomorphic — the editor uses `hashBody` to detect stale
 * checks): normalizing LLM verdicts, validating sources and summarizing results.
 */
import type { ContentClaim, ContentClaimVerdict } from "@/server/db/schema/optimize";

export type RawClaim = {
  claim?: unknown;
  verdict?: unknown;
  explanation?: unknown;
  suggestion?: unknown;
  sources?: unknown;
};

const VERDICT_ALIASES: Record<string, ContentClaimVerdict> = {
  supported: "supported",
  true: "supported",
  verified: "supported",
  correct: "supported",
  accurate: "supported",
  confirmed: "supported",
  "mostly true": "supported",
  contradicted: "contradicted",
  false: "contradicted",
  incorrect: "contradicted",
  wrong: "contradicted",
  refuted: "contradicted",
  inaccurate: "contradicted",
  outdated: "contradicted",
  unsupported: "unsupported",
  unverified: "unsupported",
  unverifiable: "unsupported",
  "not found": "unsupported",
  unknown: "unsupported",
  unclear: "unsupported",
  "partially supported": "unsupported",
  partial: "unsupported",
};

export function normalizeVerdict(v: unknown): ContentClaimVerdict {
  const key = String(v ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .trim();
  return VERDICT_ALIASES[key] ?? "unsupported";
}

/** Web (http/https) or internal knowledge (knowledge://…) evidence URLs only. */
function validSourceUrl(u: string): boolean {
  if (/^knowledge:\/\/[\w-]+\/\S+$/.test(u)) return true;
  try {
    const url = new URL(u);
    return (url.protocol === "https:" || url.protocol === "http:") && !!url.hostname && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** 32-bit FNV-1a hash (hex) — cheap fingerprint of the body a check ran against. */
export function hashBody(body: string): string {
  let h = 0x811c9dc5;
  const s = body.replace(/\s+/g, " ").trim();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function claimId(text: string): string {
  return `clm_${hashBody(text.toLowerCase())}`;
}

/**
 * Normalizes model output: aliases → the three verdicts, invalid / duplicate sources dropped,
 * "supported" without any source downgraded to "unsupported", duplicate claims merged, max 15.
 */
export function parseClaimResults(raw: RawClaim[], max = 15): ContentClaim[] {
  const out: ContentClaim[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    const claim = typeof r.claim === "string" ? r.claim.replace(/\s+/g, " ").trim() : "";
    if (claim.length < 8) continue;
    const key = claim.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    const sources: ContentClaim["sources"] = [];
    const urls = new Set<string>();
    for (const s of Array.isArray(r.sources) ? r.sources : []) {
      const url = typeof s === "string" ? s : s && typeof s === "object" ? String((s as { url?: unknown }).url ?? "") : "";
      const title = s && typeof s === "object" ? (s as { title?: unknown }).title : null;
      if (!validSourceUrl(url) || urls.has(url)) continue;
      urls.add(url);
      sources.push({ url, title: typeof title === "string" && title.trim() ? title.trim().slice(0, 200) : null });
    }
    let verdict = normalizeVerdict(r.verdict);
    if (verdict === "supported" && !sources.length) verdict = "unsupported";
    const explanation = typeof r.explanation === "string" ? r.explanation.trim().slice(0, 600) : "";
    const suggestion = typeof r.suggestion === "string" && r.suggestion.trim() && verdict !== "supported" ? r.suggestion.trim().slice(0, 600) : null;
    out.push({ id: claimId(claim), claim: claim.slice(0, 500), verdict, explanation, suggestion, sources: sources.slice(0, 5) });
    if (out.length >= max) break;
  }
  return out;
}

export function summarizeClaims(claims: ContentClaim[]): Record<ContentClaimVerdict, number> {
  const s: Record<ContentClaimVerdict, number> = { supported: 0, unsupported: 0, contradicted: 0 };
  for (const c of claims) s[c.verdict]++;
  return s;
}

/** Sentences with numbers, dates, percentages or superlatives — hints for the claim extractor. */
export function claimCandidates(markdown: string, max = 30): string[] {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+.*$/gm, " ")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/[*_`>]/g, "");
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 30 && s.length <= 320);
  const checkable = /\d|%|€|\$|£|\b(first|largest|only|most|best|leading|since|according|studies?|research|percent|million|billion|erste[rs]?|größte[rs]?|einzige[rs]?|laut|studie)\b/i;
  const out: string[] = [];
  for (const s of sentences) {
    if (!checkable.test(s)) continue;
    if (!out.includes(s)) out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

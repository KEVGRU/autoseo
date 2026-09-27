/**
 * Follow-up questions stored in `ai_answers.raw.provider` by the engines: Perplexity
 * `related_questions` (relatedQuestions), SERP related searches (relatedSearches) and People
 * Also Ask (peopleAlsoAsk). Pure module (unit tested).
 */

export type FollowupKind = "related" | "paa" | "followup";
export type Followup = { question: string; kind: FollowupKind };

const SOURCES: [string, FollowupKind][] = [
  ["relatedQuestions", "followup"],
  ["peopleAlsoAsk", "paa"],
  ["relatedSearches", "related"],
];

function strings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : x && typeof x === "object" ? ((x as Record<string, unknown>).title ?? (x as Record<string, unknown>).question) : null))
    .filter((x): x is string => typeof x === "string");
}

/** Deduplicated (case-insensitive, first kind wins) follow-up questions of one stored answer. */
export function extractFollowups(raw: unknown, max = 30): Followup[] {
  const provider = raw && typeof raw === "object" ? (raw as Record<string, unknown>).provider : null;
  if (!provider || typeof provider !== "object") return [];
  const p = provider as Record<string, unknown>;
  const seen = new Set<string>();
  const out: Followup[] = [];
  for (const [key, kind] of SOURCES) {
    for (const s of strings(p[key])) {
      const question = s.replace(/\s+/g, " ").trim().slice(0, 500);
      const k = question.toLowerCase();
      if (question.length < 3 || seen.has(k)) continue;
      seen.add(k);
      out.push({ question, kind });
      if (out.length >= max) return out;
    }
  }
  return out;
}

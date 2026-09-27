/**
 * Pure retrieval helpers for knowledge search (unit-testable): text-search config per language,
 * OR-tsquery construction, re-ranking with term coverage + per-document diversity, and excerpts.
 */

/** Postgres text-search configs shipped with every installation, by ISO language code. */
const TS_CONFIGS: Record<string, string> = {
  da: "danish",
  de: "german",
  en: "english",
  es: "spanish",
  fi: "finnish",
  fr: "french",
  hu: "hungarian",
  it: "italian",
  nb: "norwegian",
  nl: "dutch",
  nn: "norwegian",
  no: "norwegian",
  pt: "portuguese",
  ro: "romanian",
  ru: "russian",
  sv: "swedish",
  tr: "turkish",
};

export const TS_CONFIG_NAMES = [...new Set(Object.values(TS_CONFIGS)), "simple"];

/** Text-search config for a language code ("de", "de-AT", "german"); unknown languages use "simple". */
export function tsConfigForLanguage(lang: string | null | undefined): string {
  const l = (lang ?? "").trim().toLowerCase();
  if (TS_CONFIG_NAMES.includes(l)) return l;
  return TS_CONFIGS[l.split(/[-_]/)[0] ?? ""] ?? "simple";
}

const STOP = new Set(
  (
    "a an the and or but if then than of in on at to for from by with without as is are was were be been it its this that these those there their " +
    "they them we our you your i me my not no can could may might will would should do does did has have had also only very more most less into over " +
    "under about after before between per via which who whom what when where why how best top vs " +
    "der die das den dem des ein eine einer einem einen eines und oder aber wenn dann als von im in am an auf aus bei mit ohne für zu zum zur ist sind " +
    "war waren sein seine ihr ihre es er sie wir nicht kein keine auch nur sehr mehr noch schon so wie was wer wo wann warum dass werden wird wurde kann " +
    "können soll sollte muss gibt welche welcher welches lohnt sich man mein meine"
  ).split(/\s+/),
);

/** Distinct content terms of a query (lowercased, stopwords removed), capped at 24. */
export function queryTerms(query: string): string[] {
  const seen = new Set<string>();
  for (const t of query.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
    if (STOP.has(t)) continue;
    if (t.length < 2 && !/\d/.test(t)) continue;
    seen.add(t);
    if (seen.size >= 24) break;
  }
  return [...seen];
}

/**
 * OR query for `to_tsquery(config, …)`: every term is reduced to letters/digits (no tsquery
 * operators can be injected), longer terms match as prefixes. Returns null when nothing is left.
 */
export function buildOrTsQuery(query: string): string | null {
  const terms = queryTerms(query)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (!terms.length) return null;
  return terms.map((t) => (t.length >= 5 ? `${t}:*` : t)).join(" | ");
}

export type RetrievalCandidate = {
  id: string;
  sourceId: string;
  docId: string;
  title: string;
  text: string;
  /** Database rank (ts_rank_cd) — relative within one query. */
  rank: number;
};

export type RankedChunk<T extends RetrievalCandidate = RetrievalCandidate> = T & { score: number; matched: string[] };

/** A term matches when a word of the text starts with it (or with its first 5 letters for long words). */
function termMatcher(term: string): RegExp {
  const stem = term.length > 6 ? term.slice(0, Math.max(5, term.length - 5)) : term;
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}`, "iu");
}

/**
 * Re-ranks full-text candidates: 45% normalized database rank, 45% share of query terms the chunk
 * covers, 10% title match — then keeps at most `perDoc` chunks per document so a single long
 * document cannot crowd out other sources.
 */
export function rerankChunks<T extends RetrievalCandidate>(query: string, candidates: T[], k: number, opts: { perDoc?: number } = {}): RankedChunk<T>[] {
  const terms = queryTerms(query);
  const matchers = terms.map((t) => [t, termMatcher(t)] as const);
  const maxRank = Math.max(1e-9, ...candidates.map((c) => c.rank));
  const scored = candidates.map((c) => {
    const matched = matchers.filter(([, re]) => re.test(c.text) || re.test(c.title)).map(([t]) => t);
    const coverage = terms.length ? matched.length / terms.length : 0;
    const titleHit = matchers.some(([, re]) => re.test(c.title)) ? 1 : 0;
    const score = 0.45 * (c.rank / maxRank) + 0.45 * coverage + 0.1 * titleHit;
    return { ...c, score: Math.round(score * 1000) / 1000, matched };
  });
  scored.sort((a, b) => b.score - a.score || b.rank - a.rank);
  const perDoc = Math.max(1, opts.perDoc ?? 2);
  const byDoc = new Map<string, number>();
  const out: RankedChunk<T>[] = [];
  for (const c of scored) {
    if (!c.matched.length && terms.length) continue;
    const key = `${c.sourceId}:${c.docId}`;
    const n = byDoc.get(key) ?? 0;
    if (n >= perDoc) continue;
    byDoc.set(key, n + 1);
    out.push(c);
    if (out.length >= k) break;
  }
  return out;
}

/** ~`max`-character window around the first matched query term (whole words, with ellipses). */
export function excerpt(text: string, query: string, max = 280): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  let at = -1;
  for (const t of queryTerms(query)) {
    const m = termMatcher(t).exec(flat);
    if (m && (at < 0 || m.index < at)) at = m.index;
  }
  const start = Math.max(0, at < 0 ? 0 : at - Math.round(max / 3));
  let s = flat.slice(start, start + max);
  if (start > 0) s = `…${s.replace(/^\S*\s/, "")}`;
  if (start + max < flat.length) s = `${s.replace(/\s\S*$/, "")}…`;
  return s;
}

export type KnowledgeSnippet = { title: string; url: string | null; sourceName: string; sourceKind: string; text: string };

/**
 * Prompt block with numbered internal knowledge snippets (K1, K2 …), trimmed to `maxChars` in
 * total so grounding never crowds out the rest of the prompt.
 */
export function formatKnowledgeContext(snippets: KnowledgeSnippet[], maxChars = 9000): string {
  if (!snippets.length) return "";
  const per = Math.max(400, Math.floor(maxChars / snippets.length));
  return snippets
    .map((s, i) => {
      const body = s.text.replace(/\s+/g, " ").trim();
      const cut = body.length > per ? `${body.slice(0, per).replace(/\s\S*$/, "")}…` : body;
      return `[K${i + 1}] ${s.title || "Untitled"} (${s.sourceKind}: ${s.sourceName}${s.url ? `, ${s.url}` : ""})\n${cut}`;
    })
    .join("\n\n");
}

/**
 * Drafts mark facts taken from internal knowledge with [K1], [K2]… (or [K1, K3]). Returns the text
 * without the markers and the 0-based indices of the snippets that were used.
 */
export function stripKnowledgeMarkers(text: string, snippetCount: number): { text: string; used: number[] } {
  const used = new Set<number>();
  const cleaned = text.replace(/\s?\[(K\d+(?:\s*[,;]\s*K?\d+)*)\]/g, (_, list: string) => {
    for (const n of list.match(/\d+/g) ?? []) {
      const i = Number(n) - 1;
      if (i >= 0 && i < snippetCount) used.add(i);
    }
    return "";
  });
  return { text: cleaned.replace(/[ \t]+([.,;:!?])/g, "$1").replace(/[ \t]{2,}/g, " "), used: [...used].sort((a, b) => a - b) };
}

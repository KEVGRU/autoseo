/**
 * Content coverage of fan-out queries: does one of the own pages (sitemap, own cited pages,
 * catalog products) cover the topic words of a sub-query the AI engine searched for?
 * Pure module (unit tested).
 */

export type Coverage = "covered" | "partial" | "gap";
export type OwnPage = { url: string; title?: string | null };
export type PageIndex = { pages: { url: string; tokens: string[] }[] };

const STOPWORDS = new Set(
  (
    // English
    "a an the and or of for to in on at by with from about as is are was be it its this that these those what which who whom how why when where " +
    "do does did can could should would will i you we they my your our their me us them vs versus best top good great most more less than " +
    "review reviews rating ratings test tests tested price prices pricing cost costs cheap cheapest buy buying compare comparison alternative alternatives " +
    "new latest newest near me online guide guides tutorial tips list 2023 2024 2025 2026 2027 vs. which better worth really explained brand brands company companies bad legit official website site " +
    // German
    "der die das den dem des ein eine einer eines einem einen und oder von vom zu zum zur im in am an auf aus bei mit für fuer über ueber " +
    "ist sind war wie was welche welcher welches wer wo warum wann ich du wir sie es mein dein unser euer kann können koennen soll sollte " +
    "beste besten bester bestes top test testsieger vergleich preis preise kosten günstig guenstig kaufen erfahrung erfahrungen alternative alternativen neu neue aktuell anleitung ratgeber tipps erklärt " +
    // French / Spanish (basic)
    "le la les un une des et ou pour avec sur dans du au aux quel quelle meilleur meilleure prix el los las y o para con en del mejor mejores precio"
  )
    .split(/\s+/)
    .map((w) => normalizeText(w)),
);

export function normalizeText(v: string): string {
  return v
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss");
}

function split(v: string): string[] {
  return normalizeText(v)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Topic words of a query: no stopwords / intent words / years, brand words removed. */
export function topicTokens(query: string, brandTokens: string[] = []): string[] {
  const brand = new Set(brandTokens.map((b) => normalizeText(b)));
  return [...new Set(split(query))].filter((t) => t.length >= 2 && !STOPWORDS.has(t) && !brand.has(t) && !/^20\d\d$/.test(t) && !/^\d{1,2}$/.test(t));
}

/** Words of a page: URL path segments + title. */
export function pageTokens(page: OwnPage): string[] {
  let path = "";
  try {
    path = decodeURIComponent(new URL(page.url).pathname);
  } catch {
    path = page.url;
  }
  return [...new Set([...split(path), ...split(page.title ?? "")])].filter((t) => t.length >= 2);
}

export function buildPageIndex(pages: OwnPage[]): PageIndex {
  const seen = new Set<string>();
  const out: PageIndex["pages"] = [];
  for (const p of pages) {
    if (!p.url || seen.has(p.url)) continue;
    seen.add(p.url);
    const tokens = pageTokens(p);
    if (tokens.length) out.push({ url: p.url, tokens });
  }
  return { pages: out };
}

/** Exact word, or a shared stem for longer words (plural / German compounds). */
function tokenMatches(q: string, pageTokens: string[]): boolean {
  for (const t of pageTokens) {
    if (t === q) return true;
    if (q.length >= 5 && t.length >= 5 && (t.startsWith(q) || q.startsWith(t) || (q.length >= 6 && t.includes(q)) || (t.length >= 6 && q.includes(t)))) return true;
  }
  return false;
}

/**
 * Best own page for a query. covered ≥ 75 % of the topic words (all when ≤ 2), partial ≥ 1/3,
 * otherwise gap. null when the query has no topic words or there are no own pages to compare.
 */
export function scoreCoverage(query: string, idx: PageIndex, brandTokens: string[] = []): { coverage: Coverage; url: string | null; score: number } | null {
  const q = topicTokens(query, brandTokens);
  if (!q.length || !idx.pages.length) return null;
  let best = { url: null as string | null, matched: 0 };
  for (const p of idx.pages) {
    let matched = 0;
    for (const t of q) if (tokenMatches(t, p.tokens)) matched++;
    if (matched > best.matched || (matched === best.matched && matched > 0 && best.url && p.url.length < best.url.length)) best = { url: p.url, matched };
  }
  const score = best.matched / q.length;
  const covered = q.length <= 2 ? best.matched === q.length : score >= 0.75;
  const coverage: Coverage = covered ? "covered" : score >= 0.33 ? "partial" : "gap";
  return { coverage, url: coverage === "gap" ? null : best.url, score };
}

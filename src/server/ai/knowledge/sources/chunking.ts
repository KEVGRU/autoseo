/**
 * Pure text chunking for knowledge sources (no server-only imports so it is unit-testable).
 * Documents are split along headings / paragraphs into ~800-token chunks; each chunk repeats the
 * tail of the previous one (overlap) so facts spanning a boundary stay retrievable.
 */

export type TextChunk = { text: string; tokens: number; position: number };

export type ChunkOptions = {
  /** Target chunk size (default 800 tokens). */
  maxTokens?: number;
  /** Tokens repeated from the end of the previous chunk (default 100). */
  overlapTokens?: number;
};

/** Cheap token estimate (≈ 4 characters per token for Latin scripts, never less than the word count). */
export function estimateTokens(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  const words = t.split(/\s+/).length;
  return Math.max(words, Math.ceil(t.length / 4));
}

/** Normalizes extracted text: unifies line breaks, strips control chars and collapses blank runs. */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SENTENCE_END = /(?<=[.!?…])\s+(?=[\p{Lu}\p{N}"„“(])/u;

/** Splits an oversized block into sentence- (then word-) sized pieces that each fit `max` tokens. */
function splitLarge(block: string, max: number): string[] {
  const out: string[] = [];
  let buf = "";
  const push = () => {
    if (buf.trim()) out.push(buf.trim());
    buf = "";
  };
  for (const sentence of block.split(SENTENCE_END)) {
    if (estimateTokens(sentence) > max) {
      push();
      const words = sentence.split(/\s+/);
      let part: string[] = [];
      for (const w of words) {
        part.push(w);
        if (estimateTokens(part.join(" ")) >= max) {
          out.push(part.join(" "));
          part = [];
        }
      }
      if (part.length) out.push(part.join(" "));
      continue;
    }
    const next = buf ? `${buf} ${sentence}` : sentence;
    if (estimateTokens(next) > max) {
      push();
      buf = sentence;
    } else buf = next;
  }
  push();
  return out;
}

type Unit = { text: string; tokens: number; heading: string | null; isHeading: boolean };

export function chunkText(text: string, opts: ChunkOptions = {}): TextChunk[] {
  const maxTokens = Math.max(50, opts.maxTokens ?? 800);
  const overlapTokens = Math.max(0, Math.min(opts.overlapTokens ?? 100, Math.floor(maxTokens / 3)));
  const clean = normalizeText(text);
  if (!clean) return [];

  // 1) Blocks (paragraphs, list runs, headings) → units that fit a chunk.
  const units: Unit[] = [];
  let heading: string | null = null;
  for (const raw of clean.split(/\n{2,}/)) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split("\n");
    // A heading line followed by body text in the same block (common in extracted text).
    const h = lines[0]!.match(/^#{1,6}\s+(.+)$/);
    if (h) {
      heading = h[1]!.trim();
      units.push({ text: lines[0]!.trim(), tokens: estimateTokens(lines[0]!), heading, isHeading: true });
      lines.shift();
      if (!lines.length) continue;
    }
    const body = lines.join("\n").trim();
    if (!body) continue;
    const tokens = estimateTokens(body);
    if (tokens <= maxTokens) units.push({ text: body, tokens, heading, isHeading: false });
    else for (const piece of splitLarge(body.replace(/\n/g, " "), maxTokens - 20)) units.push({ text: piece, tokens: estimateTokens(piece), heading, isHeading: false });
  }

  // 2) Greedy packing with overlap.
  const chunks: TextChunk[] = [];
  let current: Unit[] = [];
  let size = 0;
  const flush = () => {
    const body = current.filter((u) => u.text.trim());
    if (!body.length || body.every((u) => u.isHeading)) return;
    const first = body[0]!;
    // Chunks that start mid-section repeat the section heading for retrieval context.
    const prefix = !first.isHeading && first.heading && !body.some((u) => u.isHeading && u.heading === first.heading) ? `## ${first.heading}\n\n` : "";
    const joined = prefix + body.map((u) => u.text).join("\n\n");
    chunks.push({ text: joined, tokens: estimateTokens(joined), position: chunks.length });
  };
  for (const unit of units) {
    if (size + unit.tokens > maxTokens && current.some((u) => !u.isHeading)) {
      flush();
      // Carry the tail of the finished chunk into the next one (only whole units, never a heading alone).
      const tail: Unit[] = [];
      let carried = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        const u = current[i]!;
        if (u.isHeading || carried + u.tokens > overlapTokens) break;
        tail.unshift(u);
        carried += u.tokens;
      }
      // Last paragraph larger than the overlap: carry its trailing sentences instead.
      const last = current[current.length - 1];
      if (!tail.length && last && !last.isHeading && overlapTokens > 0) {
        const sentences = last.text.split(SENTENCE_END);
        const kept: string[] = [];
        for (let i = sentences.length - 1; i > 0; i--) {
          const t = estimateTokens([sentences[i]!, ...kept].join(" "));
          if (t > overlapTokens) break;
          kept.unshift(sentences[i]!);
        }
        if (kept.length) {
          const text = kept.join(" ");
          carried = estimateTokens(text);
          tail.push({ text, tokens: carried, heading: last.heading, isHeading: false });
        }
      }
      const keep = !unit.isHeading && carried + unit.tokens <= maxTokens;
      current = keep ? tail : [];
      size = keep ? carried : 0;
    }
    current.push(unit);
    size += unit.tokens;
  }
  flush();
  return chunks;
}

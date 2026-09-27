/** A document fetched from a knowledge source, before chunking. */
export type SourceDoc = {
  docId: string;
  title: string;
  url: string | null;
  text: string;
  updatedAt?: Date | null;
};

/** Connector output: documents plus non-fatal notes (skipped files, channels the bot can't read…). */
export type FetchResult = { docs: SourceDoc[]; notes: string[] };

/** Default / hard caps on documents per sync. */
export const DEFAULT_MAX_DOCS = 200;
export const HARD_MAX_DOCS = 1000;
/** Characters kept per document (longer documents are truncated). */
export const MAX_DOC_CHARS = 400_000;

export function capDocs(max: number | undefined): number {
  return Math.max(1, Math.min(HARD_MAX_DOCS, Math.round(max ?? DEFAULT_MAX_DOCS)));
}

export class KnowledgeSourceError extends Error {}

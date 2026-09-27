/**
 * Content model of the fact pages for AI assistants (/ai-agent-instructions, /entity-connections). Plain data with
 * the inline markup of `components/site/inline.tsx`; the HTML pages and the Markdown export render the same data.
 */
import type { Block, Faq, Locale } from "@/components/site/types";

export type { Block, Faq, Locale };

export type FactSection = { id: string; title: string; blocks: Block[] };

export type FactSheet = {
  path: string;
  /** Machine-readable Markdown copy of the page (English path). */
  mdPath: string;
  crumb: string;
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; subtitle: string };
  updated: string;
  labels: { updated: string; machineReadable: string; toc: string; entityMap: string };
  intro: string[];
  sections: FactSection[];
  faqTitle: string;
  faq: Faq[];
  footer: string;
};

export type EntityRelation = { predicate: string; target: string; href?: string };

export type EntityEvidence = { quote: string; source: string; href: string };

export type Entity = {
  /** Anchor on the page and fragment of the JSON-LD @id. */
  id: string;
  name: string;
  /** Human-readable kind ("Organization", "Software application", …). */
  kind: string;
  description: string;
  url?: string;
  identifiers: { label: string; href: string }[];
  relations: EntityRelation[];
  /** Members of a concept entity (engines, integrations of a category, …). */
  members?: { name: string; detail?: string; href?: string }[];
  evidence: EntityEvidence[];
};

export type EntityGroup = { id: string; title: string; intro?: string; entities: Entity[] };

export type EntityMap = {
  path: string;
  crumb: string;
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; subtitle: string };
  updated: string;
  labels: {
    updated: string;
    factSheet: string;
    toc: string;
    identifiers: string;
    relations: string;
    members: string;
    evidence: string;
    retrieved: string;
    noIdentifiers: string;
    jsonLd: string;
  };
  intro: string[];
  groups: EntityGroup[];
};

import Image from "next/image";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import { CodeBlock } from "@/components/marketing/code-block";
import { Prose } from "@/components/marketing/prose";
import { cn } from "@/lib/utils";
import { Inline } from "./inline";
import type { Block } from "./types";

/** Slug for heading anchors (ASCII, stable across renders). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function headingId(block: Extract<Block, { type: "h2" | "h3" }>): string {
  return block.id ?? slugify(block.text.replace(/[*`[\]]/g, ""));
}

const calloutTone = {
  info: { icon: Info, className: "border-sky-500/30 bg-sky-500/5" },
  tip: { icon: Lightbulb, className: "border-green-600/30 bg-brand-soft/40" },
  warn: { icon: TriangleAlert, className: "border-amber-500/40 bg-amber-500/5" },
};

/** Renders long-form content blocks with the shared prose typography. */
export function Blocks({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <Prose className={className}>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </Prose>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
    case "h2":
      return (
        <h2 id={headingId(block)}>
          <Inline text={block.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 id={headingId(block)}>
          <Inline text={block.text} />
        </h3>
      );
    case "ul":
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="not-prose mt-6 overflow-x-auto rounded-xl border bg-card" tabIndex={0} role="region" aria-label={block.caption ?? "Table"}>
          <table className="w-full min-w-[32rem] text-left text-sm">
            {block.caption && <caption className="px-4 pt-3 text-left text-xs text-muted-foreground">{block.caption}</caption>}
            <thead>
              <tr className="border-b bg-muted/40">
                {block.head.map((h, i) => (
                  <th key={i} scope="col" className="px-4 py-2.5 font-semibold">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b last:border-0 align-top">
                  {row.map((cell, c) =>
                    c === 0 ? (
                      <th key={c} scope="row" className="px-4 py-2.5 font-medium">
                        <Inline text={cell} />
                      </th>
                    ) : (
                      <td key={c} className="px-4 py-2.5 text-muted-foreground">
                        <Inline text={cell} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const tone = calloutTone[block.tone ?? "info"];
      const Icon = tone.icon;
      return (
        <aside className={cn("not-prose mt-6 flex gap-3 rounded-xl border p-4 text-[0.95rem] leading-7", tone.className)}>
          <Icon className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            {block.title && <p className="font-semibold">{block.title}</p>}
            <p className="text-foreground/85">
              <Inline text={block.text} />
            </p>
          </div>
        </aside>
      );
    }
    case "code":
      return <CodeBlock code={block.code} title={block.title ?? block.lang} className="mt-6" />;
    case "quote":
      return (
        <blockquote className="not-prose mt-6 border-l-2 border-green-600 pl-5 text-lg leading-8 text-foreground">
          <p>
            <Inline text={block.text} />
          </p>
          {block.cite && <footer className="mt-2 text-sm text-muted-foreground">— <Inline text={block.cite} /></footer>}
        </blockquote>
      );
    case "image":
      return (
        <figure className="not-prose mt-8">
          <Image
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
            className="h-auto w-full rounded-xl border bg-card shadow-sm"
            sizes="(min-width: 768px) 720px, 100vw"
          />
          {block.caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{block.caption}</figcaption>}
        </figure>
      );
  }
}

/** Table of contents entries (h2 only) for long pages. */
export function tocEntries(blocks: Block[]): { id: string; text: string }[] {
  return blocks
    .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: headingId(b), text: b.text.replace(/[*`]/g, "") }));
}

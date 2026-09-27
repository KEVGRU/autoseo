import { ChevronDown } from "lucide-react";

type Entry = { id: string; text: string };

function Links({ entries }: { entries: Entry[] }) {
  return (
    <ol className="space-y-1.5 text-sm">
      {entries.map((e) => (
        <li key={e.id}>
          <a
            href={`#${e.id}`}
            className="block rounded-md py-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            {e.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Table of contents: sticky sidebar on large screens, a collapsible block on small ones. */
export function Toc({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <>
      <details className="group rounded-2xl border bg-card p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-semibold focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <nav aria-label={title} className="mt-3">
          <Links entries={entries} />
        </nav>
      </details>
      <nav aria-label={title} className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          <p className="text-sm font-semibold">{title}</p>
          <div className="mt-3">
            <Links entries={entries} />
          </div>
        </div>
      </nav>
    </>
  );
}

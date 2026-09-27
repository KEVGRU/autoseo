"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Item = { key: string; tags: string[]; card: ReactNode };

/**
 * Post grid with topic chips. Cards are rendered on the server and passed in; filtering only hides them, so every
 * post stays in the HTML for crawlers and for visitors without JavaScript.
 */
export function PostGrid({
  items,
  tags,
  labels,
  featuredKey,
}: {
  items: Item[];
  tags: { id: string; label: string }[];
  labels: { filter: string; all: string; count: string[] };
  /** Post shown above the grid: listed only while a topic filter is active. */
  featuredKey?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const shown = (item: Item) => (active ? item.tags.includes(active) : item.key !== featuredKey);
  const visible = items.filter(shown);
  const chip = (id: string | null, label: string) => {
    const pressed = active === id;
    return (
      <button
        key={id ?? "all"}
        type="button"
        aria-pressed={pressed}
        onClick={() => setActive(id)}
        className={cn(
          "h-9 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none",
          pressed ? "border-transparent bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {label}
      </button>
    );
  };
  return (
    <>
      <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
        {chip(null, labels.all)}
        {tags.map((tag) => chip(tag.id, tag.label))}
      </div>
      <p className="sr-only" aria-live="polite">
        {labels.count[visible.length] ?? ""}
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.key} hidden={!shown(item)}>
            {item.card}
          </li>
        ))}
      </ul>
    </>
  );
}

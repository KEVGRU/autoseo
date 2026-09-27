"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Table of contents that marks the section currently being read (`aria-current`). Works without JS as plain links. */
export function Toc({ entries, className }: { entries: { id: string; text: string }[]; className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = entries.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!headings.length) return;
    const update = () => {
      // The last heading above the upper third of the viewport is the one being read.
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [entries]);

  return (
    <ol className={cn("space-y-0.5 border-l text-sm", className)}>
      {entries.map((entry) => {
        const current = entry.id === active;
        return (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={current ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pr-2 pl-3 leading-5 transition-colors focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none",
                current
                  ? "border-green-600 font-medium text-foreground dark:border-green-400"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {entry.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

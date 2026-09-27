"use client";

import { useRef, type FocusEvent, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type MenuLink = { label: string; href: string; description?: string };
/**
 * `wide`: half the panel, two columns with descriptions; `split`: half the panel, two columns of labels.
 * `more`: further groups stacked below in the same column, each with its own heading.
 */
export type MenuColumn = {
  title: string;
  links: MenuLink[];
  layout?: "wide" | "split";
  more?: { title: string; links: MenuLink[] }[];
};
export type Menu = {
  id: string;
  label: string;
  columns: MenuColumn[];
  /** Chips below the columns (e.g. AI platforms). */
  chips?: { label: string; links: MenuLink[] };
  footer?: MenuLink;
};

const triggerClass =
  "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none";

/**
 * Desktop mega menus on the native Popover API: click or hover opens a panel below the header, Escape and clicks
 * outside close it, and following a link closes it (client navigation keeps the page, so that part needs script).
 */
export function HeaderMenus({ menus }: { menus: Menu[] }) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  /** When hover last opened each panel: a click right after must not toggle it shut again. */
  const hoverOpened = useRef<Record<string, number>>({});
  const panel = (id: string) => document.getElementById(id) as HTMLElement | null;

  const open = (id: string) => {
    clearTimeout(timers.current[id]);
    const el = panel(id);
    if (el && !el.matches(":popover-open")) {
      el.showPopover();
      hoverOpened.current[id] = Date.now();
    }
  };
  const scheduleClose = (id: string) => {
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      const el = panel(id);
      if (el?.matches(":popover-open") && !el.matches(":hover")) el.hidePopover();
    }, 220);
  };
  /** Keyboard users tabbing out of trigger + panel close the panel, so it never covers the focused element. */
  const closeOnFocusOut = (id: string) => (e: FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    const el = panel(id);
    const trigger = document.querySelector(`[popovertarget="${id}"]`);
    if (!next || !el?.matches(":popover-open")) return;
    if (el.contains(next) || trigger?.contains(next)) return;
    el.hidePopover();
  };
  const hover = (id: string) => ({
    onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && open(id),
    onPointerLeave: (e: PointerEvent) => e.pointerType === "mouse" && scheduleClose(id),
  });

  return (
    <>
      {menus.map((menu) => (
        <div key={menu.id} className="contents">
          <button
            type="button"
            popoverTarget={menu.id}
            className={cn(triggerClass, "mk-menu-trigger")}
            onClick={(e) => {
              // Hover already opened it: keep it open instead of toggling it closed.
              if (Date.now() - (hoverOpened.current[menu.id] ?? 0) < 600) e.preventDefault();
            }}
            onBlur={closeOnFocusOut(menu.id)}
            {...hover(menu.id)}
          >
            {menu.label}
            <ChevronDown className="size-3.5 transition-transform" aria-hidden="true" />
          </button>
          <div
            id={menu.id}
            popover="auto"
            aria-label={menu.label}
            className="mk-menu fixed inset-x-0 top-[4.25rem] bottom-auto mx-auto h-auto w-[min(68rem,calc(100vw-2rem))] rounded-2xl border bg-popover p-0 text-popover-foreground shadow-[0_24px_64px_-24px_oklch(0_0_0/0.35)]"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) panel(menu.id)?.hidePopover();
            }}
            onBlur={closeOnFocusOut(menu.id)}
            {...hover(menu.id)}
          >
            <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-7">
              {menu.columns.map((column) => (
                <div key={column.title} className={column.layout ? "lg:col-span-6" : "lg:col-span-3"}>
                  {[{ title: column.title, links: column.links }, ...(column.more ?? [])].map((group, g) => (
                    <div key={group.title} className={cn(g > 0 && "mt-6")}>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</p>
                      <ul className={cn("mt-3 grid gap-1", column.layout && "sm:grid-cols-2")}>
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="block rounded-lg px-2.5 py-2 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
                            >
                              <span className="text-sm font-medium">{link.label}</span>
                              {column.layout === "wide" && link.description && (
                                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{link.description}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {(menu.chips || menu.footer) && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-b-2xl border-t bg-muted/50 px-6 py-4 lg:px-7">
                {menu.chips && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-sm text-muted-foreground">{menu.chips.label}:</span>
                    {menu.chips.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-lg border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
                {menu.footer && (
                  <Link
                    href={menu.footer.href}
                    className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-green-700 hover:underline focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none dark:text-green-400"
                  >
                    {menu.footer.label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

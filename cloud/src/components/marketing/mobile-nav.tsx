"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Star, X } from "lucide-react";
import { site } from "@/lib/site";
import type { LinkItem } from "./content";
import { LanguageSwitch } from "./language-switch";
import { GitHubIcon } from "./primitives";

const itemClass =
  "flex items-center gap-2 rounded-lg px-3 py-3 text-[0.95rem] font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none";

export type MobileNavLabels = {
  menu: string;
  openMenu: string;
  closeMenu: string;
  navLabel: string;
  language: string;
  github: string;
};

/**
 * Mobile menu built on the native Popover API (light dismiss, Escape and top layer for free), so the marketing
 * pages don't ship a dialog library. The only script is closing the panel after a link is followed.
 */
export type MobileNavSection = { title: string; links: LinkItem[] };

export function MobileNav({
  nav,
  sections = [],
  login,
  signup,
  labels,
}: {
  nav: LinkItem[];
  /** Collapsible link groups (product pages, AI platforms, solutions …). */
  sections?: MobileNavSection[];
  login: LinkItem;
  signup: LinkItem;
  labels: MobileNavLabels;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = () => panel.current?.hidePopover();

  return (
    <>
      <button
        type="button"
        popoverTarget="mobile-menu"
        aria-label={labels.openMenu}
        className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <div
        ref={panel}
        id="mobile-menu"
        popover="auto"
        onBlur={(e) => {
          // Tabbing past the last item closes the sheet instead of moving focus behind the backdrop.
          const next = e.relatedTarget as Node | null;
          if (next && !e.currentTarget.contains(next)) close();
        }}
        aria-label={labels.menu}
        className="mk-sheet fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[85%] max-w-sm flex-col border-0 border-l bg-popover p-0 text-popover-foreground shadow-xl open:flex lg:hidden"
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <p className="text-base font-semibold">{labels.menu}</p>
          <button
            type="button"
            popoverTarget="mobile-menu"
            popoverTargetAction="hide"
            aria-label={labels.closeMenu}
            className="grid size-9 place-items-center rounded-full hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label={labels.navLabel} className="flex flex-col overflow-y-auto px-3 py-3">
          {sections.map((section) => (
            <details key={section.title} className="group">
              <summary className={`${itemClass} cursor-pointer list-none justify-between [&::-webkit-details-marker]:hidden`}>
                {section.title}
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <ul className="mb-2 ml-3 border-l pl-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={close} className={itemClass}>
              {item.label}
            </Link>
          ))}
          <a href={site.github} target="_blank" rel="noopener" onClick={close} className={itemClass}>
            <GitHubIcon />
            {labels.github}
            <Star className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
          </a>
        </nav>
        <div className="px-6 pb-2" onClick={close}>
          <LanguageSwitch label={labels.language} />
        </div>
        <div className="mt-auto flex flex-col gap-2 border-t p-5">
          <Link
            href={signup.href}
            prefetch={false}
            onClick={close}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            {signup.label}
          </Link>
          <Link
            href={login.href}
            prefetch={false}
            onClick={close}
            className="inline-flex h-11 items-center justify-center rounded-full border bg-card px-5 text-sm font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            {login.label}
          </Link>
        </div>
      </div>
    </>
  );
}

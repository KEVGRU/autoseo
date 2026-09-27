"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Drives the CSS motion system in marketing.css with two IntersectionObservers:
 * - `[data-animate]` gets `data-inview` once it scrolls into view (entrance reveals, one-shot bar/line animations;
 *   `data-inview="instant"` for what's already on screen at first load, which stays as rendered);
 * - `[data-loop]` gets `data-visible` while on screen, so infinite animations pause off screen.
 * Elements already in the viewport are marked before `:root[data-mk-motion]` switches the hidden states on, so the
 * server-rendered page never flashes. Nothing is hidden when motion is reduced or this script doesn't run.
 */
export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      delete root.dataset.mkMotion;
      return;
    }

    const inViewport = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-inview", "");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const loops = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute("data-visible", entry.isIntersecting);
      },
      { rootMargin: "120px 0px" },
    );

    const pending = Array.from(document.querySelectorAll("[data-animate]:not([data-inview])"));
    // On first load, content already on screen stays as rendered; after client navigation it animates in.
    const firstRun = root.dataset.mkMotion === undefined;
    for (const el of pending) {
      if (firstRun && inViewport(el)) el.setAttribute("data-inview", "instant");
      else reveal.observe(el);
    }
    const loopEls = Array.from(document.querySelectorAll("[data-loop]"));
    for (const el of loopEls) {
      el.toggleAttribute("data-visible", inViewport(el));
      loops.observe(el);
    }
    root.dataset.mkMotion = "";

    return () => {
      reveal.disconnect();
      loops.disconnect();
    };
  }, [pathname]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** BCP 47 language for number formatting ("en", "de"). */
  lang: string;
  duration?: number;
  className?: string;
};

/**
 * A number that counts up when it scrolls into view. The server renders the final value (what crawlers, screen
 * readers and no-JS visitors get); the animation only runs for sighted users without reduced motion, and only when
 * the number starts off screen.
 */
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", lang, duration = 1600, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) =>
    `${prefix}${new Intl.NumberFormat(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n)}${suffix}`;
  const final = format(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;

    const fmt = new Intl.NumberFormat(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const render = (n: number) => {
      el.textContent = `${prefix}${fmt.format(n)}${suffix}`;
    };
    render(0);
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          render(t === 1 ? value : Number((value * eased).toFixed(decimals)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      render(value);
    };
  }, [value, decimals, prefix, suffix, lang, duration]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {final}
    </span>
  );
}

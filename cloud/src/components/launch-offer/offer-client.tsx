"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isLaunchOfferOpen, launchOffer, timeLeft, type LaunchOfferStatus } from "@/lib/launch-offer";
import { cn } from "@/lib/utils";

/** Current time, ticking every `intervalMs`; null until mounted so server and client render the same markup. */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, intervalMs);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}

const STATUS_MAX_AGE_MS = 60_000;
let statusRequest: { at: number; promise: Promise<LaunchOfferStatus | null> } | null = null;

/** Shared by every offer element on the page; refreshed after a minute, failures are retried on the next call. */
function fetchStatus(): Promise<LaunchOfferStatus | null> {
  if (!statusRequest || Date.now() - statusRequest.at > STATUS_MAX_AGE_MS) {
    const promise = fetch("/api/launch-offer", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<LaunchOfferStatus>) : null))
      .catch(() => null);
    const request = { at: Date.now(), promise };
    statusRequest = request;
    void promise.then((status) => {
      if (!status && statusRequest === request) statusRequest = null;
    });
  }
  return statusRequest.promise;
}

/**
 * Whether the offer is open, starting from what the (static) page was rendered with and corrected after mount by
 * the deadline and the live spots from /api/launch-offer — so a page built before the offer ended or sold out
 * stops showing it.
 */
export function useLaunchOffer(initialOpen: boolean): { open: boolean; spotsLeft: number | null } {
  const now = useNow(30_000);
  const [status, setStatus] = useState<LaunchOfferStatus | null>(null);
  // Re-read the live status every minute (sell-out); the deadline itself is checked on every tick.
  const minute = now === null ? null : Math.floor(now / 60_000);
  useEffect(() => {
    if (minute === null) return;
    let active = true;
    void fetchStatus().then((s) => {
      if (active && s) setStatus(s);
    });
    return () => {
      active = false;
    };
  }, [minute]);
  if (now === null) return { open: initialOpen, spotsLeft: null };
  const spots = status?.spotsLeft ?? null;
  return { open: (status ? status.open : true) && isLaunchOfferOpen(now, spots), spotsLeft: spots };
}

/** Renders `offer` while the launch offer is open, `fallback` otherwise. */
export function OfferSwitch({ initialOpen, offer, fallback = null }: { initialOpen: boolean; offer: ReactNode; fallback?: ReactNode }) {
  const { open } = useLaunchOffer(initialOpen);
  return <>{open ? offer : fallback}</>;
}

export type CountdownLabels = { days: string; hours: string; minutes: string; seconds: string };

/** Live countdown to the offer deadline as "2d 14h 03m 12s"; a placeholder of the same width before mount. */
export function Countdown({
  labels,
  className,
  segmentClassName,
  showSeconds = true,
}: {
  labels: CountdownLabels;
  className?: string;
  segmentClassName?: string;
  showSeconds?: boolean;
}) {
  const now = useNow();
  const left = now === null ? null : timeLeft(launchOffer.endsAtMs, now);
  const parts: [number | undefined, string][] = [
    [left?.days, labels.days],
    [left?.hours, labels.hours],
    [left?.minutes, labels.minutes],
    ...(showSeconds ? ([[left?.seconds, labels.seconds]] as [number | undefined, string][]) : []),
  ];
  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular-nums", className)} suppressHydrationWarning>
      {parts.map(([value, unit], i) => (
        <span key={unit} className={segmentClassName}>
          {value === undefined ? "--" : i === 0 ? value : String(value).padStart(2, "0")}
          {unit}
        </span>
      ))}
    </span>
  );
}

/** "{left} of {total} spots left" from the live status; renders nothing while unknown. */
export function SpotsLeft({
  initialOpen,
  template,
  className,
}: {
  initialOpen: boolean;
  /** Contains `{left}` and `{total}`. */
  template: string;
  className?: string;
}) {
  const { spotsLeft } = useLaunchOffer(initialOpen);
  if (spotsLeft === null) return null;
  return (
    <span className={className}>
      {template.replace("{left}", String(spotsLeft)).replace("{total}", String(launchOffer.maxRedemptions))}
    </span>
  );
}

/** Filled share of the spots, as a thin progress bar (hidden while unknown). */
export function SpotsBar({ initialOpen, className }: { initialOpen: boolean; className?: string }) {
  const { spotsLeft } = useLaunchOffer(initialOpen);
  if (spotsLeft === null) return null;
  const taken = launchOffer.maxRedemptions - spotsLeft;
  // Never render an empty bar: a sliver keeps it recognisable as a progress bar.
  const percent = Math.max(4, Math.round((taken / launchOffer.maxRedemptions) * 100));
  return (
    <span className={cn("block h-1.5 overflow-hidden rounded-full bg-current/15", className)} aria-hidden="true">
      <span className="block h-full rounded-full bg-current" style={{ width: `${percent}%` }} />
    </span>
  );
}

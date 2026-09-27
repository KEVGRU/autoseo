"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Countdown, useLaunchOffer, type CountdownLabels } from "@/components/launch-offer/offer-client";

type Props = {
  initialOpen: boolean;
  href: string;
  labels: { badge: string; text: string; short: string; endsIn: string; cta: string; countdown: CountdownLabels };
};

/** Announcement bar above the header while the launch offer runs (hidden on the offer page itself). */
export function OfferBannerBar({ initialOpen, href, labels }: Props) {
  const { open } = useLaunchOffer(initialOpen);
  const pathname = usePathname();
  if (!open || pathname === href) return null;
  return (
    <Link
      href={href}
      data-track="launch_offer_click"
      className="group relative z-50 block bg-[#141413] text-white focus-visible:ring-3 focus-visible:ring-green-400/60 focus-visible:outline-none focus-visible:ring-inset dark:bg-[oklch(0.22_0.05_152)]"
    >
      <span className="mx-auto flex min-h-10 max-w-7xl items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-[13px] leading-5 sm:text-sm">
        <span className="hidden shrink-0 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-[#07210f] sm:inline">
          {labels.badge}
        </span>
        <span className="min-w-0">
          <span className="font-medium sm:hidden">{labels.short}</span>
          <span className="hidden font-medium sm:inline">{labels.text}</span>
          <span className="ml-2 hidden text-white/65 md:inline">
            {labels.endsIn} <Countdown labels={labels.countdown} className="font-medium text-white" />
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-green-400 underline-offset-4 group-hover:underline">
          {labels.cta}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { LogoMark } from "./primitives";
import { useLaunchOffer } from "@/components/launch-offer/offer-client";

type Props = {
  title: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  /** While the launch offer runs, the title and primary button advertise it instead. */
  offer?: { initialOpen: boolean; title: string; label: string; href: string };
};

/**
 * Floating call-to-action bar: slides in once the hero is scrolled past and hides again while a closing CTA section
 * or the footer is on screen. Hidden copies are `inert`, so they never take keyboard focus.
 */
export function StickyCta({ title: defaultTitle, primary: defaultPrimary, secondary, offer }: Props) {
  const pathname = usePathname();
  const { open: offerOpen } = useLaunchOffer(offer?.initialOpen ?? false);
  const title = offer && offerOpen ? offer.title : defaultTitle;
  const primary = offer && offerOpen ? { label: offer.label, href: offer.href } : defaultPrimary;
  const [pastHero, setPastHero] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > Math.min(720, window.innerHeight * 0.9));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const endings = Array.from(document.querySelectorAll("footer, #final-cta, #landing-cta"));
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setNearEnd(visible.size > 0);
    });
    endings.forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [pathname]);

  const hidden = !pastHero || nearEnd;
  return (
    <div
      role="region"
      aria-label={title}
      inert={hidden}
      data-hidden={hidden ? "" : undefined}
      className="mk-dock fixed bottom-4 left-1/2 z-30 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 sm:bottom-6"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#141413]/95 p-1.5 text-white shadow-[0_18px_50px_-12px_oklch(0_0_0/0.55)] backdrop-blur-xl sm:gap-3 sm:pl-2">
        <span className="hidden items-center gap-2.5 pr-1 pl-1 sm:flex">
          <LogoMark className="size-7 rounded-full ring-1 ring-white/15" />
          <span className="max-w-[14rem] truncate text-sm font-medium text-white/85">{title}</span>
        </span>
        <Link
          href={secondary.href}
          className="hidden rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white/80 transition-colors min-[400px]:inline-flex hover:bg-white/10 hover:text-white focus-visible:ring-3 focus-visible:ring-green-400/60 focus-visible:outline-none"
        >
          {secondary.label}
        </Link>
        <Link
          href={primary.href}
          prefetch={false}
          className="group inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-[#141413] transition-colors hover:bg-white/85 focus-visible:ring-3 focus-visible:ring-green-400/60 focus-visible:outline-none"
        >
          {primary.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

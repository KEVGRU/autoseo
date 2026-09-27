import type { ReactNode } from "react";
import { MarketingShell } from "@/components/marketing/shell";

// While the launch offer runs, static pages are re-rendered every 5 minutes so its banner and prices disappear by
// themselves at the deadline (the client also hides them as soon as it ends or sells out).
export const revalidate = 300;

/** German pages (/de, /de/pricing). `<html lang="de">` is set by the root layout from the route segment. */
export default function GermanLayout({ children }: { children: ReactNode }) {
  return <MarketingShell locale="de">{children}</MarketingShell>;
}

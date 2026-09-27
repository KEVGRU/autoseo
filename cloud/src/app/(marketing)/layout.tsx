import type { ReactNode } from "react";
import "@/components/marketing/marketing.css";

/** Shared by both languages; each language adds its own shell (header, footer) in `(en)/layout.tsx` and `de/layout.tsx`. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return children;
}

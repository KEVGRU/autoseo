"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

/**
 * The growth report is only queried when its tab is open: switching to the tab (client-side) mounts this, which
 * reloads the page with `?tab=growth`.
 */
export function GrowthLoader({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href, { scroll: false });
  }, [router, href]);
  return (
    <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Spinner /> Loading growth report…
    </p>
  );
}

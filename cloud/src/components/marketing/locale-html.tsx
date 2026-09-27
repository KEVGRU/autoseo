"use client";

import type { ComponentProps } from "react";
import { useSelectedLayoutSegments } from "next/navigation";

/**
 * Root <html> with a route-derived `lang`: "de" for the German marketing pages under /de, "en" everywhere else.
 * Reading the active segments keeps every page statically rendered (no request headers) and updates `lang` on
 * client-side navigation between languages.
 */
export function LocaleHtml(props: ComponentProps<"html">) {
  const [first] = useSelectedLayoutSegments().filter((segment) => !segment.startsWith("("));
  return <html {...props} lang={first === "de" ? "de" : "en"} />;
}

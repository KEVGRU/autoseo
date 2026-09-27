"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { localeFromPath, localizedPath, type Locale } from "./locales";

const languages: { locale: Locale; short: string; name: string }[] = [
  { locale: "en", short: "EN", name: "English" },
  { locale: "de", short: "DE", name: "Deutsch" },
];

const itemClass = "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors";

/**
 * EN/DE switch linking to the same page in the other language (or its home page if it isn't translated).
 * The header renders it as a `nav` landmark; secondary copies (footer, mobile menu) use `group` so landmark names
 * stay unique.
 */
export function LanguageSwitch({
  label,
  landmark = false,
  className,
}: {
  label: string;
  landmark?: boolean;
  className?: string;
}) {
  const pathname = usePathname() ?? "/";
  const current = localeFromPath(pathname);
  const Wrapper = landmark ? "nav" : "div";

  return (
    <Wrapper
      aria-label={label}
      role={landmark ? undefined : "group"}
      className={cn("inline-flex items-center rounded-full border bg-card p-0.5", className)}
    >
      {languages.map(({ locale, short, name }) =>
        locale === current ? (
          <span key={locale} lang={locale} aria-current="true" className={cn(itemClass, "bg-foreground text-background")}>
            {short}
            <span className="sr-only"> ({name})</span>
          </span>
        ) : (
          <Link
            key={locale}
            href={localizedPath(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            className={cn(
              itemClass,
              "text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none",
            )}
          >
            {short}
            <span className="sr-only"> ({name})</span>
          </Link>
        ),
      )}
    </Wrapper>
  );
}

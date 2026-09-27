import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Container, Eyebrow } from "@/components/marketing/primitives";
import { cn } from "@/lib/utils";

/** Blog page header: breadcrumb trail of any depth, optional eyebrow, h1, intro and extra content (meta, links). */
export function BlogHero({
  trail,
  current,
  eyebrow,
  title,
  subtitle,
  children,
  wide,
}: {
  trail: { label: string; href: string }[];
  current: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  /** Wider title column for long post headlines. */
  wide?: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="mk-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="mk-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <Container className="relative py-12 sm:py-16">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            {trail.map((item) => (
              <li key={item.href} className="flex items-center gap-1.5">
                <Link href={item.href} className="rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none">
                  {item.label}
                </Link>
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </li>
            ))}
            <li aria-current="page" className="line-clamp-1 max-w-[16rem] font-medium text-foreground sm:max-w-md">
              {current}
            </li>
          </ol>
        </nav>
        <div className={cn("mt-8", wide ? "max-w-4xl" : "max-w-3xl")}>
          {typeof eyebrow === "string" ? <Eyebrow>{eyebrow}</Eyebrow> : eyebrow}
          <h1
            className={cn(
              "mt-3 font-semibold tracking-tight text-balance",
              wide ? "text-[2rem] leading-[1.15] sm:text-5xl sm:leading-[1.1]" : "text-4xl sm:text-5xl lg:text-6xl",
            )}
          >
            {title}
          </h1>
          {subtitle && <p className="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">{subtitle}</p>}
          {children}
        </div>
      </Container>
    </section>
  );
}

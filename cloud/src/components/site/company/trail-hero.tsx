import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Container, Eyebrow } from "@/components/marketing/primitives";

/** Page header like `PageHero`, with a breadcrumb trail of any depth (e.g. Home › Case studies › Playbook). */
export function TrailHero({
  trail,
  current,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  trail: { label: string; href: string }[];
  current: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="mk-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="mk-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <Container className="relative py-14 sm:py-20">
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
            <li aria-current="page" className="font-medium text-foreground">
              {current}
            </li>
          </ol>
        </nav>
        <div className="mt-8 max-w-3xl">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>
          {subtitle && <p className="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">{subtitle}</p>}
          {children}
        </div>
      </Container>
    </section>
  );
}

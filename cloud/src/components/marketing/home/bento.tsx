import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLanding } from "../catalog";
import { featurePath, type FeatureSlug } from "../catalog/routes";
import type { VisualKind } from "../catalog/types";
import { getCopy } from "../i18n";
import { localizeHref, type Locale } from "../locales";
import { Container } from "../primitives";
import { SectionTitle } from "../landing/blocks";
import { Visual } from "../visuals";

/** Mock and landing page per overview item (keyed by the item's icon in content.ts). */
const cards: Record<string, { visual: VisualKind; feature: FeatureSlug }> = {
  sparkles: { visual: "answer", feature: "ai-visibility-tracking" },
  swords: { visual: "ranking", feature: "ai-competitor-analysis" },
  link: { visual: "sources", feature: "ai-citation-tracking" },
  search: { visual: "keywords", feature: "keyword-research" },
  chart: { visual: "traffic", feature: "ai-traffic-analytics" },
  wand: { visual: "tasks", feature: "ai-seo-tasks" },
  presentation: { visual: "report", feature: "report-builder" },
  bot: { visual: "agent", feature: "ai-seo-agent" },
};

/** "Platform" overview as an animated bento grid; every card links to its feature page. */
export function Bento({ locale = "en" }: { locale?: Locale }) {
  const { overview } = getCopy(locale);
  const { ui } = getLanding(locale);
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 pt-8 pb-20 sm:pt-12 sm:pb-28">
      <Container>
        <SectionTitle
          heading={{ eyebrow: overview.eyebrow, title: overview.title }}
          body={overview.subtitle}
          id="features-title"
          align="center"
        />
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {overview.items.map((item, i) => {
            const card = cards[item.icon];
            const wide = i === 0;
            return (
              <li
                key={item.title}
                data-animate=""
                style={{ ["--i" as string]: i % 3 }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl border bg-card transition-shadow duration-300 hover:shadow-[0_24px_60px_-30px_oklch(0_0_0/0.4)]",
                  wide && "lg:col-span-2",
                )}
              >
                <div className="relative z-10 p-6 pb-0 sm:p-7 sm:pb-0">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {card ? (
                      <Link
                        href={localizeHref(featurePath(card.feature), locale)}
                        className="rounded-sm after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:ring-3 focus-visible:after:ring-ring/60"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{item.body}</p>
                  {card && (
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                      {ui.learnMore}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  )}
                </div>
                {card && (
                  <div className="mk-dots relative mt-6 flex-1 overflow-hidden border-t bg-muted/40 px-5 pt-6 [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
                    <div className={cn("mx-auto h-64 transition-transform duration-500 group-hover:-translate-y-1", wide ? "max-w-lg" : "max-w-sm")}>
                      <Visual kind={card.visual} locale={locale} />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

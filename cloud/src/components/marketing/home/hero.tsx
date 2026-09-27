import { Fragment } from "react";
import { Check, ChevronRight } from "lucide-react";
import { site } from "@/lib/site";
import type { MarketingCopy } from "../content";
import { CommandPill } from "../code-block";
import { BrowserFrame, PhoneFrame } from "../frames";
import { copyLabels, getCopy } from "../i18n";
import type { Locale } from "../locales";
import { accentText, CtaLink, Container, GitHubIcon } from "../primitives";
import { StageBars } from "../visuals";
import { OfferStartCta } from "../launch-offer/offer-sections";

export function Hero({ locale = "en" }: { locale?: Locale }) {
  const copy = getCopy(locale);
  const { hero, installCommand } = copy;
  return (
    // overflow-clip, not -hidden: a scroll container would capture the stage's view() timeline (mk-tilt).
    <section className="relative overflow-clip">
      <div className="mk-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="mk-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <Container className="relative pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <a
            href={site.github}
            target="_blank"
            rel="noopener"
            className="mk-rise group inline-flex max-w-full items-center gap-2 rounded-full border bg-card/80 py-1 pr-2 pl-3 text-sm shadow-xs backdrop-blur transition-colors hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <span className="truncate font-medium">{hero.eyebrow}</span>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground">
              <GitHubIcon className="size-3.5" />
              <span className="hidden sm:inline">{hero.eyebrowCta}</span>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </span>
          </a>

          <h1 className="mk-words mt-7 text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
            <AnimatedWords text={hero.titleLead} />{" "}
            <AnimatedWords text={hero.titleAccent} offset={hero.titleLead.split(" ").length} className={accentText} />
          </h1>
          <p
            className="mk-rise mx-auto mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground sm:text-xl sm:leading-8"
            style={{ ["--i" as string]: 4 }}
          >
            {hero.subtitle}
          </p>

          <div
            className="mk-rise mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            style={{ ["--i" as string]: 5 }}
          >
            <OfferStartCta
              locale={locale}
              size="lg"
              arrow
              fallback={
                <CtaLink href={hero.primaryCta.href} size="lg" arrow>
                  {hero.primaryCta.label}
                </CtaLink>
              }
            />
            <CtaLink href={hero.secondaryCta.href} variant="secondary" size="lg">
              {hero.secondaryCta.label}
            </CtaLink>
          </div>

          <ul
            className="mk-rise mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
            style={{ ["--i" as string]: 6 }}
          >
            {hero.assurances.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-green-700 dark:text-green-400" strokeWidth={2.5} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mk-rise mx-auto mt-10 flex max-w-xl flex-col items-center gap-2.5" style={{ ["--i" as string]: 7 }}>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{hero.installLabel}</p>
            <CommandPill
              command={installCommand}
              labels={copyLabels(copy, copy.ui.copyInstall)}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        <div data-loop="" className="relative mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="mk-screen-glow pointer-events-none absolute -inset-x-10 -top-10 bottom-0" aria-hidden="true" />
          <div className="mk-tilt mk-stage relative overflow-hidden rounded-3xl border border-white/10 p-3 sm:p-6 lg:p-10">
            <div className="mk-dots-light absolute inset-0 opacity-60" aria-hidden="true" />
            <StageBars className="absolute inset-x-6 bottom-0 h-2/5 opacity-70" />
            <BrowserFrame
              src="/screenshots/dashboard.png"
              darkSrc="/screenshots/dashboard-dark.png"
              alt={hero.screenshotAlt}
              sizes="(min-width: 1152px) 1024px, calc(100vw - 3rem)"
              reveal={false}
              eager
              className="relative"
            />
          </div>
          <AnswerCard answerCard={hero.answerCard} />
          <PhoneFrame
            src="/screenshots/mobile.png"
            alt={hero.mobileAlt}
            className="absolute -right-6 -bottom-12 hidden w-44 lg:block xl:-right-14 xl:w-48"
          />
        </div>
      </Container>
    </section>
  );
}

/** Headline words that rise and un-blur one after another (see `.mk-words` in marketing.css). */
function AnimatedWords({ text, offset = 0, className }: { text: string; offset?: number; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className={className} style={{ ["--w" as string]: offset + i }}>
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}

/** Decorative "live answer" card floating over the screenshot; engine name cycles with pure CSS. */
function AnswerCard({ answerCard }: { answerCard: MarketingCopy["hero"]["answerCard"] }) {
  const ticker = [...answerCard.engines, answerCard.engines[0]];
  return (
    <div
      aria-hidden="true"
      className="mk-float absolute -bottom-10 -left-8 hidden w-80 rounded-2xl border bg-card/95 p-4 text-left shadow-[0_24px_64px_-20px_oklch(0_0_0/0.35)] backdrop-blur lg:block xl:-left-16"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{answerCard.label}</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
          <span className="size-1.5 rounded-full bg-green-500" />
          {answerCard.live}
        </span>
      </div>
      <p className="mt-2 text-sm leading-5 font-medium">{answerCard.prompt}</p>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-2.5 py-2 text-xs">
        <span className="text-muted-foreground">{answerCard.answerFrom}</span>
        <span className="h-5 overflow-hidden font-semibold">
          <span className="mk-ticker block">
            {ticker.map((engine, i) => (
              <span key={`${engine}-${i}`} className="block h-5 leading-5">
                {engine}
              </span>
            ))}
          </span>
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {answerCard.stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border px-2.5 py-2">
            <dt className="text-[0.7rem] text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";
import { isPlatformSlug, platformPath } from "../catalog/routes";
import { getCopy } from "../i18n";
import { localizeHref, type Locale } from "../locales";
import { Container } from "../primitives";

/** Platform page of an engine name ("ChatGPT App" shares the ChatGPT page). */
function enginePage(name: string) {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-");
  if (isPlatformSlug(slug)) return platformPath(slug);
  return slug.startsWith("chatgpt") ? platformPath("chatgpt") : null;
}

export function EngineStrip({ locale = "en" }: { locale?: Locale }) {
  const { engines, engineStrip, ui } = getCopy(locale);
  const chip = (engine: (typeof engines)[number], copy: boolean) => {
    const path = enginePage(engine.name);
    const content = (
      <>
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-full bg-foreground text-[0.65rem] font-bold text-background"
        >
          {monogram(engine.name)}
        </span>
        <span>
          {engine.name}
          <span className="sr-only">
            {" "}
            {ui.engineBy} {engine.vendor}
          </span>
        </span>
      </>
    );
    const cls =
      "inline-flex items-center gap-2.5 rounded-full border bg-background py-1.5 pr-4 pl-1.5 text-sm font-medium whitespace-nowrap shadow-xs transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none";
    return path ? (
      <Link href={localizeHref(path, locale)} className={cls} tabIndex={copy ? -1 : undefined}>
        {content}
      </Link>
    ) : (
      <span className={cls}>{content}</span>
    );
  };

  return (
    <section aria-labelledby="engines-title" className="border-y bg-card/60 py-14 sm:py-16">
      <Container>
        <div data-animate="" className="mx-auto max-w-2xl text-center">
          <h2 id="engines-title" className="text-lg font-semibold tracking-tight sm:text-xl">
            {engineStrip.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{engineStrip.subtitle}</p>
        </div>
      </Container>
      <div className="mk-marquee mt-9" data-loop="" style={{ ["--mk-duration" as string]: "50s" }}>
        <div className="mk-marquee-track">
          {[false, true].map((copy) => (
            <ul key={String(copy)} aria-hidden={copy || undefined} className={cn("flex shrink-0 gap-3 pr-3")}>
              {engines.map((engine) => (
                <li key={engine.name}>{chip(engine, copy)}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Neutral monochrome glyph instead of vendor logos. */
function monogram(name: string) {
  const words = name.replace("Google ", "").replace("Microsoft ", "").split(" ");
  return words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0].slice(0, 2);
}

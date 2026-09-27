import Image from "next/image";
import { Download, Maximize2 } from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Container, CtaLink, SectionHeading } from "@/components/marketing/primitives";
import { Inline } from "../inline";
import { breadcrumbNode, coreNodes, faqNode, graph, webPageNode } from "../jsonld";
import { homeCrumb, localizePath } from "../metadata";
import { SectionView } from "../sections";
import type { Faq, Locale } from "../types";
import { companyLabels } from "./labels";
import type { PressPage } from "./types";

function Logos({ page, locale }: { page: PressPage; locale: Locale }) {
  const t = companyLabels[locale];
  return (
    <section id="logos" aria-labelledby="logos-title" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionHeading id="logos-title" align="left" title={page.logos.title} subtitle={<Inline text={page.logos.subtitle} />} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.logos.items.map((logo) => (
            <li key={logo.src} className="overflow-hidden rounded-2xl border bg-card">
              {/* Fixed light backdrop: the mark is a dark tile and would vanish on the dark theme's background. */}
              <div className="grid h-40 place-items-center bg-[#f4f3ee]">
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG/PNG logo shown at its real size */}
                <img src={logo.src} alt={logo.label} width={72} height={72} className="size-18" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t p-4">
                <div>
                  <p className="font-medium">{logo.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {logo.format} · {logo.size}
                  </p>
                </div>
                <a
                  href={logo.src}
                  download
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
                >
                  <Download className="size-4" aria-hidden="true" />
                  {t.logoDownload}
                  <span className="sr-only">{logo.label}</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Screenshots({ page, locale }: { page: PressPage; locale: Locale }) {
  const t = companyLabels[locale];
  return (
    <section id="screenshots" aria-labelledby="screenshots-title" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionHeading id="screenshots-title" align="left" title={page.screenshots.title} subtitle={<Inline text={page.screenshots.subtitle} />} />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {page.screenshots.items.map((shot) => (
            <li key={shot.src}>
              <figure>
                <a href={shot.src} target="_blank" rel="noopener" className="group relative block overflow-hidden rounded-xl border bg-card shadow-sm focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none">
                  <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} className="h-auto w-full" sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
                  <span className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Maximize2 className="size-4" aria-hidden="true" />
                  </span>
                  <span className="sr-only">{t.screenshotOpen}</span>
                </a>
                <figcaption className="mt-3 text-sm leading-6">
                  <span className="text-muted-foreground">
                    <Inline text={shot.caption} />
                  </span>{" "}
                  <a href={shot.src} download className="font-medium whitespace-nowrap underline underline-offset-4 hover:text-green-700 dark:hover:text-green-400">
                    PNG · {shot.width}×{shot.height}
                  </a>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Press kit page: like `SitePageView`, with the logo and screenshot downloads after the section `assetsAfter`. */
export function PressView({ page, locale }: { page: PressPage; locale: Locale }) {
  const path = localizePath(page.path, locale);
  const faqs: Faq[] = page.sections.flatMap((s) => (s.kind === "faq" ? s.items : []));
  const home = homeCrumb[locale];
  const split = page.sections.findIndex((s) => s.id === page.assetsAfter) + 1;
  const head = page.sections.slice(0, split);
  const tail = page.sections.slice(split);
  return (
    <>
      <JsonLd
        data={graph(
          ...coreNodes(),
          webPageNode({ path, name: page.meta.title, description: page.meta.description, locale }),
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: page.crumb, path },
          ]),
          faqNode(faqs, path, locale),
        )}
      />
      <PageHero crumb={page.crumb} home={home} eyebrow={page.hero.eyebrow} title={page.hero.title} subtitle={page.hero.subtitle ? <Inline text={page.hero.subtitle} /> : undefined}>
        {page.hero.ctas && page.hero.ctas.length > 0 && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {page.hero.ctas.map((cta, i) => (
              <CtaLink key={cta.href} href={cta.href} variant={i === 0 ? "primary" : "secondary"} size="lg" arrow={i === 0}>
                {cta.label}
              </CtaLink>
            ))}
          </div>
        )}
      </PageHero>
      <div className="[&>section:nth-child(even):not(:last-child)]:bg-card/40">
        {head.map((section, i) => (
          <SectionView key={i} section={section} index={i} />
        ))}
        <Logos page={page} locale={locale} />
        <Screenshots page={page} locale={locale} />
        {tail.map((section, i) => (
          <SectionView key={i + split} section={section} index={i + split} />
        ))}
      </div>
    </>
  );
}

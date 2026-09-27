import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLanding } from "../catalog";
import { solutionPath, type SolutionSlug } from "../catalog/routes";
import { SectionEyebrow, StatsBand, TwoTone } from "../landing/blocks";
import { localizeHref, type Locale } from "../locales";
import { Container } from "../primitives";

/** Solution page behind each label around the sphere (same order as `home.sphereLabels`). */
const sphereSolutions: SolutionSlug[] = ["geo-teams", "content-teams", "pr-brand-teams", "customer-experience", "agencies", "e-commerce"];

/** Label positions on large screens: left column top→bottom, then right column. */
const spots = [
  "left-0 top-[14%]",
  "left-[-2%] top-[46%]",
  "left-0 top-[78%]",
  "right-0 top-[14%]",
  "right-[-2%] top-[46%]",
  "right-0 top-[78%]",
];

/** Dark section: a rotating dotted sphere with the teams AI search affects, plus product facts. */
export function Sphere({ locale = "en" }: { locale?: Locale }) {
  const { ui } = getLanding(locale);
  const { sphere, sphereLabels, stats } = ui.homepage;
  const links = sphereSolutions.map((slug, i) => ({ label: sphereLabels[i], href: localizeHref(solutionPath(slug), locale) }));

  return (
    <section aria-labelledby="sphere-title" className="relative overflow-hidden bg-[#111110] py-20 text-white sm:py-28">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div data-animate="" className="lg:col-span-7">
            <SectionEyebrow dark>{sphere.eyebrow}</SectionEyebrow>
            <h2 id="sphere-title" className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl lg:text-[2.9rem] lg:leading-[1.08]">
              <TwoTone title={sphere.title} muted={sphere.muted} dark />
            </h2>
          </div>
          <p data-animate="" className="text-[0.95rem] leading-7 text-white/65 lg:col-span-5 lg:border-t lg:border-white/15 lg:pt-5">
            {sphere.body}
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl lg:mt-6 lg:h-[34rem]">
          <div data-loop="" className="relative mx-auto aspect-square w-[min(24rem,80vw)] lg:absolute lg:top-1/2 lg:left-1/2 lg:w-[30rem] lg:-translate-x-1/2 lg:-translate-y-1/2" aria-hidden="true">
            {/* faint dots across the sphere, drifting sideways like a slow rotation */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="mk-globe-dots absolute inset-y-0 left-0 w-[200%] bg-[radial-gradient(oklch(1_0_0/0.35)_1.1px,transparent_1.4px)] bg-[length:13px_13px] [mask-image:radial-gradient(circle_at_50%_50%,black_20%,transparent_70%)]" />
            </div>
            {/* green limb: denser, brighter dots at the edge */}
            <div className="absolute inset-0 overflow-hidden rounded-full [mask-image:radial-gradient(circle,transparent_52%,black_68%,black_71%,transparent_72%)]">
              <div className="mk-globe-dots absolute inset-y-0 left-0 w-[200%] bg-[radial-gradient(oklch(0.75_0.17_152)_1.5px,transparent_1.8px)] bg-[length:11px_11px]" />
            </div>
            <div className="absolute inset-0 rounded-full shadow-[inset_-40px_-50px_90px_oklch(0_0_0/0.75),0_0_120px_-20px_oklch(0.63_0.17_152/0.45)]" />
            <div className="mk-spin-slow absolute -inset-6 rounded-full border border-dashed border-white/10" />
          </div>

          <div className="pointer-events-none relative z-10 mx-auto -mt-[calc(min(24rem,80vw)*0.62)] max-w-xs text-center lg:absolute lg:top-1/2 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{sphere.center}</p>
            <p className="mt-2 text-sm text-white/60">{sphere.centerSub}</p>
          </div>

          <ul className="relative z-10 mt-[calc(min(24rem,80vw)*0.45)] flex flex-wrap justify-center gap-2 lg:static lg:mt-0">
            {links.map((link, i) => (
              <li key={link.href} data-animate="fade" style={{ ["--i" as string]: i }} className={cn("lg:absolute", spots[i])}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-3 border border-white/20 bg-[#111110] px-3.5 py-2 font-mono text-xs tracking-[0.14em] text-white/85 uppercase transition-colors hover:border-green-400/60 hover:text-white focus-visible:ring-3 focus-visible:ring-green-400/60 focus-visible:outline-none"
                >
                  <span className="size-1.5 rounded-full bg-green-400 transition-transform group-hover:scale-150" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <StatsBand stats={stats} locale={locale} label={ui.factsLabel} />
        </div>
      </Container>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowRight, Bot, ChevronDown, Gauge, ListChecks, MessageSquareText, Radar } from "lucide-react";
import { getBranding } from "@/server/branding";
import { env } from "@/server/env";
import { getSetting } from "@/server/settings";
import { getPublicFreeToolsConfig } from "@/server/free-tools/public-config";
import { normalizeDomain } from "@/server/free-tools/domain";
import { AI_VISIBILITY_CHECK, FREE_TOOL_LIST, withApp } from "@/features/free-tools/lib/registry";
import { ToolCard } from "@/features/free-tools/components/tool-card";
import { breadcrumbJsonLd, JsonLd } from "@/features/free-tools/components/tool-frame";
import { CheckForm } from "@/features/visibility-check/components/check-form";
import { getCountry } from "@/lib/countries";

const PATH = `/free-tools/${AI_VISIBILITY_CHECK.slug}`;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBranding();
  const url = `${env.appUrl}${PATH}`;
  return {
    title: AI_VISIBILITY_CHECK.seoTitle,
    description: AI_VISIBILITY_CHECK.seoDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      title: `${AI_VISIBILITY_CHECK.seoTitle} · ${brand.appName}`,
      description: AI_VISIBILITY_CHECK.seoDescription,
      url,
    },
  };
}

const STEPS = [
  {
    icon: Bot,
    title: "Readiness",
    body: "robots.txt per AI crawler, llms.txt, text without JavaScript, JSON-LD, metadata, HTTPS.",
  },
  {
    icon: MessageSquareText,
    title: "Buyer prompts",
    body: "Five realistic, unbranded questions buyers in your market ask AI assistants.",
  },
  {
    icon: Radar,
    title: "AI answers",
    body: "Each prompt on up to three AI engines. We match you and your competitors in every answer.",
  },
  {
    icon: ListChecks,
    title: "Actions",
    body: "The three changes with the highest expected impact, grounded in what we measured.",
  },
];

/** Public Free AI Visibility Check (Admin → Free tools → Public + AI check enabled). */
export default async function AiVisibilityCheckPage({ searchParams }: PageProps<"/free-tools/ai-visibility-check">) {
  await connection();
  const [config, brand, settings, onboarding, sp] = await Promise.all([
    getPublicFreeToolsConfig(),
    getBranding(),
    getSetting("freeTools"),
    getSetting("onboarding"),
    searchParams,
  ]);
  if (!config.enabled || !settings.aiCheckEnabled) notFound();
  const rawDomain = typeof sp.domain === "string" ? sp.domain : "";
  const rawCountry = typeof sp.country === "string" ? sp.country.toUpperCase() : "";
  const faqs = AI_VISIBILITY_CHECK.faqs.map((f) => ({
    question: withApp(f.question, brand.appName),
    answer: withApp(f.answer, brand.appName),
  }));

  return (
    <article className="mx-auto w-full max-w-5xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <header className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/free-tools" className="hover:text-foreground">
            Free tools
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{AI_VISIBILITY_CHECK.name}</span>
        </nav>
        <p className="text-sm font-medium text-brand">Free AI visibility check</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{AI_VISIBILITY_CHECK.heading}</h1>
        <p className="mt-4 text-base leading-7 text-pretty text-muted-foreground sm:text-lg sm:leading-8">{AI_VISIBILITY_CHECK.subhead}</p>
      </header>

      <CheckForm
        surface="public"
        turnstileSiteKey={config.turnstileSiteKey}
        defaultDomain={normalizeDomain(rawDomain) ?? ""}
        defaultCountry={getCountry(rawCountry)?.iso ?? getCountry(onboarding.defaultCountry)?.iso ?? "US"}
        className="mt-8"
      />

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What you get</h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {AI_VISIBILITY_CHECK.highlights.map((item, i) => (
            <li key={item.title} className="rounded-2xl border bg-card p-5 shadow-soft">
              <span className="font-mono text-sm text-brand tabular">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          <Gauge className="size-5 text-brand" /> How the check works
        </h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.title} className="rounded-2xl border bg-card p-4 shadow-soft">
              <s.icon className="size-5 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          No sales call, no login. Results for the same website and market may be reused for 24 hours. Usage limits keep the check free.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">FAQ</h2>
        <div className="mt-5 divide-y rounded-2xl border bg-card shadow-soft">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-5 [&_summary::-webkit-details-marker]:hidden" open>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold">
                {faq.question}
                <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">More free tools</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {FREE_TOOL_LIST.slice(0, 3).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} href={`/free-tools/${tool.slug}`} surface="public" compact />
          ))}
        </div>
        <Link href="/free-tools" className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline decoration-brand underline-offset-4">
          All free tools <ArrowRight className="size-3.5" />
        </Link>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: `${brand.appName} ${AI_VISIBILITY_CHECK.name}`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: `${env.appUrl}${PATH}`,
          description: AI_VISIBILITY_CHECK.shortDescription,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          provider: {
            "@type": "Organization",
            name: brand.appName,
            url: env.appUrl,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(env.appUrl, [
          { name: "Home", path: "/" },
          { name: "Free tools", path: "/free-tools" },
          { name: AI_VISIBILITY_CHECK.name, path: PATH },
        ])}
      />
    </article>
  );
}

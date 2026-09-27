/**
 * Copy for the launch offer (banner, pricing card, /launch and /de/launch). Prices come from `launchOffer`, so the
 * texts stay correct if the offer changes. Only promise what `site.launchOffer` and the Stripe coupon enforce.
 */
import { formatUsd, launchOffer } from "@/lib/launch-offer";
import { site } from "@/lib/site";
import type { Locale } from "../locales";

const first = formatUsd(launchOffer.firstYearUsd);
const regular = formatUsd(launchOffer.regularYearlyUsd);
const perMonth = formatUsd(launchOffer.monthlyEquivalentUsd);
const monthly = `$${site.priceMonthlyUsd}`;
const pct = `${launchOffer.percentOff}%`;
const spots = launchOffer.maxRedemptions;
const { projects, includedUsageUsd } = site.cloudPlan;

export const OFFER_SIGNUP_HREF = "/signup?plan=yearly";
export const MONTHLY_SIGNUP_HREF = "/signup?plan=monthly";

const en = {
  deadline: "Sep 30",
  deadlineLong: "September 30",
  countdown: { days: "d", hours: "h", minutes: "m", seconds: "s" },
  spotsTemplate: "{left} of {total} spots left",
  banner: {
    badge: "Launch offer",
    text: `${pct} off your first year of AutoSEO Cloud: ${first} instead of ${regular}.`,
    short: `${pct} off your first year`,
    endsIn: "Ends in",
    cta: `Claim ${pct} off`,
  },
  card: {
    ribbon: `Launch offer · ${pct} off`,
    period: "/ month, billed yearly",
    note: `${first} for your first year, then ${regular}/year · ends ${"Sep 30"}`,
    cta: `Claim ${pct} off`,
    monthlyLink: `or ${monthly}/month, billed monthly`,
  },
  sticky: { title: `${pct} off your first year · ends Sep 30`, cta: `Claim ${pct} off` },
  /** Primary CTA of the home hero and the closing CTA while the offer runs. */
  startCta: `Start with ${pct} off`,
  page: {
    metaTitle: `Launch Offer: ${pct} Off Your First Year`,
    metaDescription: `AutoSEO Cloud launch offer: your first year for ${first} instead of ${regular}. Every feature, fully managed in Germany. Only until September 30 or the first ${spots} customers.`,
    ogAlt: `AutoSEO Cloud launch offer: ${pct} off your first year, ${first} instead of ${regular}.`,
    ogEyebrow: "Launch offer · until Sep 30",
    ogTitle: `Your first year of AutoSEO Cloud for ${first}. That's ${pct} off.`,
    ogChips: [`${first} instead of ${regular}`, `First ${spots} customers`, "Hosted in Germany"],
    eyebrow: `Launch offer · only until September 30`,
    title: "Half price for your first year of AutoSEO Cloud",
    subtitle: `See what ChatGPT, Perplexity, Gemini, Claude and Google AI Overviews say about your brand, and fix it with a complete SEO suite. To celebrate the launch, the first ${spots} customers get their first year for ${first} instead of ${regular}.`,
    priceWas: regular,
    price: first,
    priceLabel: "for your first year",
    perMonth: `That's ${perMonth}/month, billed yearly. You save ${formatUsd(launchOffer.savingsUsd)}.`,
    cta: `Claim ${pct} off`,
    ctaNote: `Renews at ${regular}/year · cancel anytime before renewal · plus VAT where applicable`,
    endsIn: "Offer ends in",
    spotsTemplate: `{left} of {total} launch spots left`,
    trust: ["Every feature included", "Fully managed in Germany", "Open source (MIT)"],
    screenshotAlt: "AutoSEO dashboard with AI visibility score, mention rate and competitor ranking across AI engines",
    included: {
      eyebrow: "What you get",
      title: `Everything in AutoSEO Cloud, for ${perMonth} a month`,
      subtitle: `The same plan that normally costs ${monthly}/month. No feature gates, no per-seat fees.`,
    },
    compare: {
      eyebrow: "Why AutoSEO",
      title: "Open source, not another black box",
    },
    faqTitle: "Questions about the offer",
    faq: [
      {
        q: `What exactly do I get for ${first}?`,
        a: `A full year of AutoSEO Cloud: your own workspace in our fully managed AutoSEO, hosted in Germany, with every feature, unlimited users, up to ${projects} projects and $${includedUsageUsd} of AI and SEO data usage included every month. On the monthly plan the same costs ${monthly} a month.`,
      },
      {
        q: "What happens after the first year?",
        a: `Your subscription renews at the regular yearly price of ${regular} (12 × ${monthly}). If you don't want to continue, cancel in the billing portal before the renewal date and you won't be charged again.`,
      },
      {
        q: "Can I cancel?",
        a: "Yes. Cancel anytime in the billing portal. Your workspace stays available until the end of the paid year. Payments for the current year are not refunded.",
      },
      {
        q: "How long does the offer run?",
        a: `Until September 30 or until ${spots} customers have claimed it, whichever comes first. A spot counts as taken once the payment goes through. After that, AutoSEO Cloud is ${monthly}/month again.`,
      },
      {
        q: "Why so cheap?",
        a: "AutoSEO just launched. We want our first customers to help shape the product, and the discount is our thank-you for trying it early.",
      },
      {
        q: "Do I need my own API keys or a DataForSEO account?",
        a: "No. AI providers, DataForSEO and email are managed by us. If you like, AI features can also run on your own Claude Code or Codex subscription through the local agent.",
      },
      {
        q: "Is VAT included?",
        a: "Prices exclude VAT. Where VAT applies, it is added at checkout based on your billing details. AutoSEO Cloud is offered to business customers only.",
      },
    ],
    finalTitle: `Your first year for ${first}. Only until September 30.`,
    finalSubtitle: `${pct} off for the first ${spots} customers. After that, AutoSEO Cloud is back to ${monthly} a month.`,
    finalSecondary: `Or pay ${monthly} monthly`,
    ended: {
      eyebrow: "Launch offer",
      title: "The launch offer has ended",
      subtitle: `Thanks to everyone who joined early! AutoSEO Cloud is ${monthly} per workspace per month, and the open-source edition is free to self-host.`,
      cta: `Start for ${monthly}/month`,
      secondary: "See pricing",
    },
  },
};

export type LaunchOfferCopy = typeof en;

const de: LaunchOfferCopy = {
  deadline: "30. Sept.",
  deadlineLong: "30. September",
  countdown: { days: "T", hours: "h", minutes: "m", seconds: "s" },
  spotsTemplate: "Noch {left} von {total} Plätzen frei",
  banner: {
    badge: "Launch-Angebot",
    text: `${pct} Rabatt auf Ihr erstes Jahr AutoSEO Cloud: ${first} statt ${regular}.`,
    short: `${pct} Rabatt aufs erste Jahr`,
    endsIn: "Endet in",
    cta: `${pct} Rabatt sichern`,
  },
  card: {
    ribbon: `Launch-Angebot · ${pct} Rabatt`,
    period: "/ Monat, jährlich abgerechnet",
    note: `${first} im ersten Jahr, danach ${regular}/Jahr · endet am 30. Sept.`,
    cta: `${pct} Rabatt sichern`,
    monthlyLink: `oder ${monthly}/Monat, monatlich abgerechnet`,
  },
  sticky: { title: `${pct} Rabatt aufs erste Jahr · bis 30. Sept.`, cta: `${pct} Rabatt sichern` },
  startCta: `Mit ${pct} Rabatt starten`,
  page: {
    metaTitle: `Launch-Angebot: ${pct} Rabatt aufs erste Jahr`,
    metaDescription: `AutoSEO Cloud Launch-Angebot: Ihr erstes Jahr für ${first} statt ${regular}. Alle Funktionen, vollständig verwaltet in Deutschland. Nur bis 30. September oder für die ersten ${spots} Kunden.`,
    ogAlt: `AutoSEO Cloud Launch-Angebot: ${pct} Rabatt aufs erste Jahr, ${first} statt ${regular}.`,
    ogEyebrow: "Launch-Angebot · bis 30. Sept.",
    ogTitle: `Ihr erstes Jahr AutoSEO Cloud für ${first}. ${pct} gespart.`,
    ogChips: [`${first} statt ${regular}`, `Erste ${spots} Kunden`, "Gehostet in Deutschland"],
    eyebrow: "Launch-Angebot · nur bis 30. September",
    title: "Das erste Jahr AutoSEO Cloud zum halben Preis",
    subtitle: `Sehen Sie, was ChatGPT, Perplexity, Gemini, Claude und Google AI Overviews über Ihre Marke sagen, und verbessern Sie es mit einer kompletten SEO-Suite. Zum Launch bekommen die ersten ${spots} Kunden ihr erstes Jahr für ${first} statt ${regular}.`,
    priceWas: regular,
    price: first,
    priceLabel: "im ersten Jahr",
    perMonth: `Das sind ${perMonth}/Monat, jährlich abgerechnet. Sie sparen ${formatUsd(launchOffer.savingsUsd)}.`,
    cta: `${pct} Rabatt sichern`,
    ctaNote: `Verlängert sich zu ${regular}/Jahr · jederzeit vor der Verlängerung kündbar · zzgl. USt., wo zutreffend`,
    endsIn: "Angebot endet in",
    spotsTemplate: "Noch {left} von {total} Launch-Plätzen frei",
    trust: ["Alle Funktionen inklusive", "Vollständig verwaltet in Deutschland", "Open Source (MIT)"],
    screenshotAlt: "AutoSEO-Dashboard mit KI-Sichtbarkeitsscore, Erwähnungsrate und Wettbewerber-Ranking über KI-Suchmaschinen",
    included: {
      eyebrow: "Das bekommen Sie",
      title: `Alles aus AutoSEO Cloud, für ${perMonth} im Monat`,
      subtitle: `Derselbe Plan, der sonst ${monthly}/Monat kostet. Keine Funktionssperren, keine Kosten pro Nutzer.`,
    },
    compare: {
      eyebrow: "Warum AutoSEO",
      title: "Open Source statt Blackbox",
    },
    faqTitle: "Fragen zum Angebot",
    faq: [
      {
        q: `Was genau bekomme ich für ${first}?`,
        a: `Ein ganzes Jahr AutoSEO Cloud: Ihren eigenen Workspace in unserem vollständig verwalteten AutoSEO, gehostet in Deutschland, mit allen Funktionen, unbegrenzt vielen Nutzern, bis zu ${projects} Projekten und KI- und SEO-Datennutzung im Wert von ${includedUsageUsd} USD pro Monat. Im Monatsplan kostet das ${monthly} im Monat.`,
      },
      {
        q: "Was passiert nach dem ersten Jahr?",
        a: `Ihr Abonnement verlängert sich zum regulären Jahrespreis von ${regular} (12 × ${monthly}). Wenn Sie nicht weitermachen möchten, kündigen Sie vor dem Verlängerungsdatum im Abrechnungsportal. Dann wird nichts mehr abgebucht.`,
      },
      {
        q: "Kann ich kündigen?",
        a: "Ja, jederzeit im Abrechnungsportal. Ihr Workspace bleibt bis zum Ende des bezahlten Jahres verfügbar. Zahlungen für das laufende Jahr werden nicht erstattet.",
      },
      {
        q: "Wie lange läuft das Angebot?",
        a: `Bis zum 30. September oder bis ${spots} Kunden es genutzt haben, je nachdem, was zuerst eintritt. Ein Platz gilt als vergeben, sobald die Zahlung durch ist. Danach kostet AutoSEO Cloud wieder ${monthly}/Monat.`,
      },
      {
        q: "Warum so günstig?",
        a: "AutoSEO ist gerade gestartet. Wir möchten, dass unsere ersten Kunden das Produkt mitgestalten, und der Rabatt ist unser Dankeschön dafür, dass Sie früh dabei sind.",
      },
      {
        q: "Brauche ich eigene API-Schlüssel oder einen DataForSEO-Account?",
        a: "Nein. KI-Anbieter, DataForSEO und E-Mail verwalten wir. Wenn Sie möchten, laufen KI-Funktionen zusätzlich über Ihr eigenes Claude-Code- oder Codex-Abo mit dem lokalen Agenten.",
      },
      {
        q: "Ist die Umsatzsteuer enthalten?",
        a: "Die Preise verstehen sich zzgl. Umsatzsteuer. Wo sie anfällt, wird sie beim Checkout anhand Ihrer Rechnungsdaten hinzugefügt. AutoSEO Cloud richtet sich ausschließlich an Geschäftskunden.",
      },
    ],
    finalTitle: `Ihr erstes Jahr für ${first}. Nur bis 30. September.`,
    finalSubtitle: `${pct} Rabatt für die ersten ${spots} Kunden. Danach kostet AutoSEO Cloud wieder ${monthly} im Monat.`,
    finalSecondary: `Oder monatlich ${monthly} zahlen`,
    ended: {
      eyebrow: "Launch-Angebot",
      title: "Das Launch-Angebot ist beendet",
      subtitle: `Danke an alle, die früh dabei waren! AutoSEO Cloud kostet ${monthly} pro Workspace und Monat, die Open-Source-Version können Sie kostenlos selbst hosten.`,
      cta: `Für ${monthly}/Monat starten`,
      secondary: "Preise ansehen",
    },
  },
};

const copies: Record<Locale, LaunchOfferCopy> = { en, de };

export function getOfferCopy(locale: Locale): LaunchOfferCopy {
  return copies[locale];
}

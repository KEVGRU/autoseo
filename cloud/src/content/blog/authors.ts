import { site } from "@/lib/site";
import type { AuthorSlug, BlogAuthor, Locale } from "./types";

const links = [
  { label: "GitHub", href: site.github },
  { label: "Codext GmbH", href: site.legal.website },
  { label: site.contactEmail, href: `mailto:${site.contactEmail}` },
];

const authors: Record<Locale, Record<AuthorSlug, BlogAuthor>> = {
  en: {
    "autoseo-team": {
      slug: "autoseo-team",
      name: "AutoSEO Team",
      role: `The people who build AutoSEO at ${site.company}`,
      bio: `The AutoSEO Team builds and maintains [AutoSEO](/), the open-source AI visibility and SEO platform, at ${site.company} in Germany. Articles are researched from primary sources (official documentation, papers, standards) and link to every one of them.`,
      about: [
        {
          type: "p",
          text: `AutoSEO is developed by the team at **${site.company}**, a software company based in ${site.legal.city}, Germany. The code is open source under the MIT license and developed in public on [GitHub](${site.github}): every feature described on this blog can be inspected there.`,
        },
        { type: "h2", text: "How we write" },
        {
          type: "ul",
          items: [
            "Every factual claim links to a primary source: official documentation from Google, OpenAI, Anthropic and other vendors, peer-reviewed papers and preprints, patents and standards.",
            "We do not publish proprietary statistics. AutoSEO has no private dataset of other people's sites, so where numbers matter we show you how to measure them for your own brand.",
            "When research is thin, contradictory or fast-moving, we say so and date the article.",
            "Product claims describe what the open-source code actually does today.",
          ],
        },
        { type: "h2", text: "Corrections and contact" },
        {
          type: "p",
          text: `Found an error or an outdated statement? Email [${site.contactEmail}](mailto:${site.contactEmail}) or open an issue on [GitHub](${site.github}/issues). We correct articles and note the update date.`,
        },
      ],
      links,
    },
  },
  de: {
    "autoseo-team": {
      slug: "autoseo-team",
      name: "AutoSEO Team",
      role: `Das Team hinter AutoSEO bei der ${site.company}`,
      bio: `Das AutoSEO Team entwickelt und pflegt [AutoSEO](/), die Open-Source-Plattform für KI-Sichtbarkeit und SEO, bei der ${site.company} in Deutschland. Die Artikel stützen sich auf Primärquellen (offizielle Dokumentationen, Studien, Standards) und verlinken jede davon.`,
      about: [
        {
          type: "p",
          text: `AutoSEO wird vom Team der **${site.company}** entwickelt, einem Softwareunternehmen aus ${site.legal.city}. Der Code ist unter der MIT-Lizenz Open Source und wird öffentlich auf [GitHub](${site.github}) entwickelt: Jede hier beschriebene Funktion lässt sich dort nachvollziehen.`,
        },
        { type: "h2", text: "Wie wir schreiben" },
        {
          type: "ul",
          items: [
            "Jede Tatsachenbehauptung verweist auf eine Primärquelle: offizielle Dokumentation von Google, OpenAI, Anthropic und anderen Anbietern, begutachtete Studien und Preprints, Patente und Standards.",
            "Wir veröffentlichen keine eigenen Statistiken. AutoSEO verfügt über keinen privaten Datensatz fremder Websites. Wo Zahlen wichtig sind, zeigen wir, wie Sie sie für Ihre eigene Marke messen.",
            "Wenn die Forschungslage dünn, widersprüchlich oder im Wandel ist, sagen wir das und datieren den Artikel.",
            "Aussagen zum Produkt beschreiben, was der Open-Source-Code heute tatsächlich tut.",
          ],
        },
        { type: "h2", text: "Korrekturen und Kontakt" },
        {
          type: "p",
          text: `Sie haben einen Fehler oder eine veraltete Aussage entdeckt? Schreiben Sie an [${site.contactEmail}](mailto:${site.contactEmail}) oder eröffnen Sie ein Issue auf [GitHub](${site.github}/issues). Wir korrigieren Artikel und vermerken das Aktualisierungsdatum.`,
        },
      ],
      links,
    },
  },
};

export function getAuthor(locale: Locale, slug: AuthorSlug): BlogAuthor {
  return authors[locale][slug];
}

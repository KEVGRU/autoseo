import type { BlogTag } from "@/content/blog/types";
import type { Locale } from "../types";

/** UI strings of the blog pages. */
export const blogLabels = {
  en: {
    crumb: "Blog",
    eyebrow: "AutoSEO Blog",
    title: "AI search, measured",
    subtitle:
      "Research-backed guides on AI visibility (GEO), AI crawlers, attribution and connecting AutoSEO to your AI tools. Every claim links to its primary source.",
    metaTitle: "AutoSEO Blog: AI search, GEO and AI visibility guides",
    metaDescription:
      "Research-backed guides on generative engine optimization, query fan-out, AI crawlers, AI search attribution and connecting AutoSEO to Claude and ChatGPT via MCP.",
    featured: "Featured",
    allPosts: "All articles",
    filterLabel: "Filter by topic",
    topics: "Topics",
    allTopics: "All topics",
    minRead: "min read",
    by: "By",
    published: "Published",
    updated: "Updated",
    onThisPage: "On this page",
    inShort: "In short",
    faq: "Frequently asked questions",
    sources: "Sources",
    sourcesNote: "Primary sources used for this article, as available on the publication date.",
    aboutAuthor: "About the author",
    allArticlesBy: "All articles by",
    keepReading: "Keep reading",
    readArticle: "Read article",
    backToBlog: "All articles",
    rss: "RSS feed",
    ctaTitle: "Measure your own AI visibility",
    ctaBody:
      "AutoSEO is open source. Run it on your own server for free, or let us run it for you in AutoSEO Cloud.",
    ctaPrimary: "Start with AutoSEO Cloud",
    ctaSecondary: "Self-host for free",
    articles: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
    authorCrumb: "Authors",
    rssTitle: "AutoSEO Blog",
    ogChip: "Primary sources",
    rssDescription: "Research-backed guides on AI search, GEO and AI visibility from the team behind AutoSEO.",
  },
  de: {
    crumb: "Blog",
    eyebrow: "AutoSEO Blog",
    title: "KI-Suche, messbar gemacht",
    subtitle:
      "Fundierte Leitfäden zu KI-Sichtbarkeit (GEO), KI-Crawlern, Attribution und zur Anbindung von AutoSEO an Ihre KI-Tools. Jede Aussage verweist auf ihre Primärquelle.",
    metaTitle: "AutoSEO Blog: Leitfäden zu KI-Suche, GEO und KI-Sichtbarkeit",
    metaDescription:
      "Fundierte Leitfäden zu Generative Engine Optimization, Query Fan-out, KI-Crawlern, Attribution der KI-Suche und AutoSEO in Claude und ChatGPT per MCP.",
    featured: "Empfohlen",
    allPosts: "Alle Artikel",
    filterLabel: "Nach Thema filtern",
    topics: "Themen",
    allTopics: "Alle Themen",
    minRead: "Min. Lesezeit",
    by: "Von",
    published: "Veröffentlicht",
    updated: "Aktualisiert",
    onThisPage: "Auf dieser Seite",
    inShort: "Kurz gesagt",
    faq: "Häufige Fragen",
    sources: "Quellen",
    sourcesNote: "Für diesen Artikel verwendete Primärquellen, Stand zum Veröffentlichungsdatum.",
    aboutAuthor: "Über die Autoren",
    allArticlesBy: "Alle Artikel von",
    keepReading: "Weiterlesen",
    readArticle: "Artikel lesen",
    backToBlog: "Alle Artikel",
    rss: "RSS-Feed",
    ctaTitle: "Messen Sie Ihre eigene KI-Sichtbarkeit",
    ctaBody:
      "AutoSEO ist Open Source. Betreiben Sie es kostenlos auf Ihrem eigenen Server oder lassen Sie es von uns in der AutoSEO Cloud betreiben.",
    ctaPrimary: "Mit AutoSEO Cloud starten",
    ctaSecondary: "Kostenlos selbst hosten",
    articles: (n: number) => (n === 1 ? "1 Artikel" : `${n} Artikel`),
    authorCrumb: "Autoren",
    rssTitle: "AutoSEO Blog (Deutsch)",
    ogChip: "Mit Primärquellen",
    rssDescription: "Fundierte Leitfäden zu KI-Suche, GEO und KI-Sichtbarkeit vom Team hinter AutoSEO.",
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const tagLabels: Record<Locale, Record<BlogTag, string>> = {
  en: {
    "ai-search": "AI search",
    measurement: "Measurement",
    attribution: "Attribution",
    geo: "GEO",
    research: "Research",
    google: "Google AI",
    "query-fan-out": "Query fan-out",
    technical: "Technical SEO",
    "ai-crawlers": "AI crawlers",
    mcp: "MCP",
    claude: "Claude",
    chatgpt: "ChatGPT",
    "how-to": "How-to",
  },
  de: {
    "ai-search": "KI-Suche",
    measurement: "Messung",
    attribution: "Attribution",
    geo: "GEO",
    research: "Forschung",
    google: "Google KI",
    "query-fan-out": "Query Fan-out",
    technical: "Technisches SEO",
    "ai-crawlers": "KI-Crawler",
    mcp: "MCP",
    claude: "Claude",
    chatgpt: "ChatGPT",
    "how-to": "Anleitung",
  },
};

const dateLocale: Record<Locale, string> = { en: "en-US", de: "de-DE" };

/** Human date of an ISO day (YYYY-MM-DD), independent of the server time zone. */
export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(dateLocale[locale], { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

import type { FeaturePage } from "../../types";

export default {
  slug: "site-audit",
  nav: "Site audit",
  summary: "Crawl your site with 29 technical SEO checks, Lighthouse scores and run comparisons.",
  meta: {
    title: "Site Audit Tool with 29 Technical SEO Checks",
    description:
      "Crawl your website with 29 technical SEO checks, Lighthouse scores and a health score history. Open-source site audit tool with scheduled runs and comparisons.",
  },
  hero: {
    eyebrow: "Site audit tool",
    title: "A site audit that finds what's broken",
    muted: "and shows what changed.",
    subtitle:
      "AutoSEO's built-in crawler checks your pages for 29 technical SEO issues — broken links, redirect chains, duplicate titles, canonical conflicts, thin content and more — adds Lighthouse scores and tracks your health score from run to run.",
  },
  visual: "audit",
  screenshot: {
    src: "/screenshots/site-audit.png",
    alt: "AutoSEO site audit report with health score, issue categories and a list of issues",
    url: "seo/audit",
  },
  stats: [
    { value: 29, label: "Technical checks", note: "Errors, warnings and notices" },
    { value: 12, label: "Issue categories", note: "From crawl access to indexability" },
    { value: 4, label: "Lighthouse categories", note: "Performance, accessibility, best practices, SEO" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Technical problems cost visibility",
    muted: "in search and in AI answers.",
    body: "Search engines and AI assistants can only rank or cite pages they can reach, read and understand. Broken links, redirect loops, noindex tags and slow responses quietly take pages out of the running.",
    points: [
      {
        title: "Small issues add up",
        body: "One missing title is harmless. Hundreds of duplicate titles, orphan pages and redirect chains dilute the signals of the whole site.",
      },
      {
        title: "Sites change every week",
        body: "New pages, plugins and releases introduce new errors. Scheduled audits catch them before your rankings do.",
      },
      {
        title: "Fixes need proof",
        body: "Comparing two runs shows which issues are resolved and which are new, so you know a release really fixed them.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What gets checked",
    title: "A complete technical audit,",
    muted: "without a desktop crawler.",
    items: [
      {
        icon: "search",
        title: "29 technical checks",
        body: "HTTP errors, broken internal links, redirects, titles and meta descriptions, headings, canonicals, duplicates, thin content, alt text and indexability.",
      },
      {
        icon: "gauge",
        title: "Lighthouse scores",
        body: "Performance, accessibility, best practices and SEO for up to 10 sample pages on mobile and desktop, via PageSpeed Insights or DataForSEO.",
      },
      {
        icon: "chart",
        title: "Health score and history",
        body: "A 0–100 health score for the site and for every page, with a history of all runs so you can follow the trend.",
      },
      {
        icon: "refresh",
        title: "Run comparisons",
        body: "Pick two audits and see issue counts before and after, plus lists of new and resolved issues with the affected pages.",
      },
      {
        icon: "layers",
        title: "Site structure",
        body: "Crawl depth, inlinks, orphan pages and dead ends for every URL, discovered from links, robots.txt and your XML sitemaps.",
      },
      {
        icon: "bell",
        title: "Scheduled audits and alerts",
        body: "Run audits weekly or monthly and get an in-app and email alert when the health score drops.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From crawl to fix list",
    muted: "in three steps.",
    items: [
      {
        title: "Start an audit",
        body: "Enter a start URL and how many pages to crawl, and decide whether to run Lighthouse. The crawler respects robots.txt and reads your sitemaps.",
      },
      {
        title: "Review issues by severity",
        body: "Issues are grouped into errors, warnings and notices across 12 categories, each with an explanation, how to fix it and the affected pages.",
      },
      {
        title: "Fix, re-run and compare",
        body: "Re-run the audit after a release, compare it with the previous run, and schedule weekly or monthly audits to keep watch.",
      },
    ],
  },
  faq: [
    {
      q: "What is a site audit?",
      a: "A site audit crawls your website the way a search engine does and flags technical problems that can hurt rankings, such as broken links, redirect chains, duplicate titles or pages blocked from indexing. AutoSEO's crawler runs 29 checks and scores each page and the whole site from 0 to 100.",
    },
    {
      q: "What does the AutoSEO site audit check?",
      a: "It covers 12 categories: crawl access, HTTP status, links, titles and meta descriptions, duplicates, headings, redirects, canonicals, content, site structure, server response time and indexability. Every issue comes with an explanation and how to fix it.",
    },
    {
      q: "How many pages can I crawl?",
      a: "You set the number of pages per audit, from 10 up to the limit configured for your AutoSEO — 2,000 pages by default. When you self-host, admins can change that limit in the admin panel.",
    },
    {
      q: "Does the site audit include Lighthouse and Core Web Vitals?",
      a: "Yes, optionally. AutoSEO runs Lighthouse on the homepage and one page per URL template, up to 10 pages on mobile and desktop, and stores the category scores and lab metrics such as LCP, TBT and CLS. It uses Google PageSpeed Insights for free or DataForSEO.",
    },
    {
      q: "Can I schedule recurring site audits?",
      a: "Yes. Schedule an audit weekly or monthly per project. When the health score of a scheduled run drops, AutoSEO sends an in-app notification and an email.",
    },
    {
      q: "Can I compare two audits?",
      a: "Yes. Select any two runs to see the change in every issue type, plus the issues that are new and the ones that were resolved. It's the quickest way to confirm that a release fixed what it should.",
    },
    {
      q: "Does the site audit check AI crawler access?",
      a: "The site audit reports pages the crawler couldn't read, for example because of bot protection or rate limits. For robots.txt rules per AI bot and llms.txt, use the separate AI crawlability check in AutoSEO.",
    },
    {
      q: "Is the site audit tool free?",
      a: "Yes. The crawler is part of the open-source AutoSEO app and free to self-host, with no per-page fees. Lighthouse runs through the free PageSpeed Insights API, and DataForSEO is optional. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["ai-crawlability", "rank-tracking", "ai-seo-tasks", "report-builder"],
  cta: {
    title: "Find out what's holding your site back",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;

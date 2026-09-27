import type { FeaturePage } from "../../types";

export default {
  slug: "keyword-research",
  nav: "Keyword research",
  summary: "Volume, difficulty and intent for any keyword in 143 markets, saved to tagged lists.",
  meta: {
    title: "Keyword Research Tool: Volume, KD & Intent",
    description:
      "Open-source keyword research tool with search volume, CPC, keyword difficulty and intent in 143 markets. Save tagged lists, export to CSV or Google Sheets.",
  },
  hero: {
    eyebrow: "Keyword research tool",
    title: "Keyword research in 143 markets,",
    muted: "right next to your AI visibility data.",
    subtitle:
      "Enter a seed keyword and AutoSEO pulls related keywords, suggestions and ideas from DataForSEO — with search volume, CPC, competition, keyword difficulty, intent and a 12-month trend. Save the best ones to tagged lists, check the SERP and export to CSV or Google Sheets.",
  },
  visual: "keywords",
  screenshot: {
    src: "/screenshots/keywords.png",
    alt: "AutoSEO keyword list with search volume, CPC, competition, keyword difficulty and intent per keyword",
    url: "seo/keywords",
  },
  stats: [
    { value: 143, label: "Markets", note: "Country and language per search" },
    { value: 500, label: "Keywords per search", note: "150, 300 or 500 results" },
    { value: 3, label: "Keyword sources", note: "Related, suggestions and ideas" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Keywords still map the demand.",
    muted: "AI answers start from the same questions.",
    body: "Search volume shows what people look for, difficulty shows what it takes to rank, and intent shows what they want to do next. Classic search and AI assistants answer the same questions, so keyword data remains the clearest map of what your audience wants to know.",
    points: [
      {
        title: "Volume without intent is noise",
        body: "A high-volume keyword is worthless if the searcher wants something you don't offer. Intent labels help you keep the terms that fit your pages.",
      },
      {
        title: "Difficulty sets the timeline",
        body: "Keyword difficulty and competition show which terms you can win soon and which need stronger pages, links and time.",
      },
      {
        title: "Research only pays off when it's kept",
        body: "Saved lists with tags turn one-off searches into a keyword plan your team can refresh, filter and build content on.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "Everything you need to pick keywords,",
    muted: "in one place.",
    items: [
      {
        icon: "search",
        title: "Related keywords, suggestions and ideas",
        body: "Three DataForSEO sources, or Auto mode that tries them in turn until it finds enough real alternatives to your seed keyword.",
      },
      {
        icon: "chart",
        title: "Volume, CPC, difficulty and intent",
        body: "Every keyword comes with search volume, CPC, competition, a 0–100 difficulty score and search intent, plus the 12-month search trend.",
      },
      {
        icon: "eye",
        title: "SERP analysis",
        body: "Open the Google results for any keyword — top 20 or top 100 — to see which domains rank and what kind of page wins.",
      },
      {
        icon: "list-checks",
        title: "Filters that cut the list down",
        body: "Include or exclude terms and set ranges for volume, CPC and difficulty until only the keywords that fit are left.",
      },
      {
        icon: "layers",
        title: "Saved lists with tags",
        body: "Save keywords to your project, organize them with colored tags, filter by tag and refresh their metrics whenever you need current numbers.",
      },
      {
        icon: "download",
        title: "Export to CSV and Google Sheets",
        body: "Send results or saved lists straight into a new Google Sheet in your linked account, or download them as CSV.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From seed keyword to keyword plan",
    muted: "in three steps.",
    items: [
      {
        title: "Enter a seed keyword",
        body: "Pick the market and language, the number of results and the keyword source. AutoSEO shows the estimated cost before you search.",
      },
      {
        title: "Filter, sort and check the SERP",
        body: "Sort by volume or difficulty, narrow the list with term and range filters, and open the search results for any keyword.",
      },
      {
        title: "Save, tag and export",
        body: "Save the keywords you want to target to tagged lists, refresh their metrics later and export them to CSV or Google Sheets.",
      },
    ],
  },
  faq: [
    {
      q: "What is a keyword research tool?",
      a: "A keyword research tool shows how often people search for a term, how hard it is to rank for it and what the searcher wants. AutoSEO adds related keywords, suggestions and ideas for any seed keyword, with volume, CPC, difficulty and intent in 143 markets.",
    },
    {
      q: "Where does the keyword data come from?",
      a: "Keyword data comes from DataForSEO Labs, with Google Ads keyword data for markets that Labs doesn't cover. On AutoSEO Cloud, data features run through the providers the Codext team has connected, and usage counts toward the $10 included each month; when you self-host, you connect your own DataForSEO account. Results are cached for 24 hours, so repeating a search doesn't cost again.",
    },
    {
      q: "How is keyword difficulty calculated?",
      a: "Keyword difficulty is DataForSEO's organic ranking difficulty on a scale from 0 to 100 — the higher the score, the harder it is to reach Google's top 10. Competition is a separate 0–1 value that shows how many advertisers bid on the keyword in Google Ads.",
    },
    {
      q: "Can I export keywords to Google Sheets?",
      a: "Yes. With a linked Google account, AutoSEO creates a new spreadsheet through the Google Sheets API. Without one, it copies the table to your clipboard and opens a blank sheet to paste into. CSV export is always available.",
    },
    {
      q: "Can I save and organize keywords?",
      a: "Yes. Save keywords from any search to your project, group them with colored tags and filter the list by tag. You can refresh the metrics of saved keywords at any time to get current volumes and difficulty.",
    },
    {
      q: "Does keyword research work outside the US?",
      a: "Yes. You choose the country and language for each search from 143 markets. Volumes and difficulty are specific to that market, so you can compare demand across the countries you sell in.",
    },
    {
      q: "Can AI agents do keyword research in AutoSEO?",
      a: "Yes. Agent mode and the MCP server include tools to research keywords, check SERPs and save keywords with tags. The keyword-research and keyword-clustering agent skills guide Claude Code, Codex or Cursor through the whole workflow.",
    },
    {
      q: "Is the keyword research tool free?",
      a: "The keyword research tool is part of the open-source AutoSEO app and free to self-host; keyword data is then billed by DataForSEO per request, and AutoSEO shows the estimated cost before each search. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["rank-tracking", "site-audit", "prompt-research", "ai-seo-agent"],
  cta: {
    title: "Find the keywords worth writing for",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;

import type { FeaturePage } from "../../types";

export default {
  slug: "ai-fact-check",
  nav: "AI fact check",
  summary: "Check what AI engines claim about your products against your own reference documents.",
  meta: {
    title: "AI Fact Check: Verify What AI Says About You",
    description:
      "AI fact check for brands: compare what ChatGPT, Gemini and Perplexity say about your products with your labels and spec sheets, and track every deviation.",
  },
  hero: {
    eyebrow: "AI fact check",
    title: "Fact-check what AI says about your products.",
    muted: "Against your own documents.",
    subtitle:
      "AutoSEO collects the statements AI engines make about your products in tracked answers, compares each one with your reference documents — labels, spec sheets, terms — and flags claims that are contradicted, unsupported, outdated or off-label, with the exact passage as proof.",
  },
  visual: "factcheck",
  stats: [
    { value: 16, label: "AI engines checked", note: "Every tracked answer" },
    { value: 6, label: "Verdicts", note: "From match to off-label" },
    { value: 3, label: "Severity levels", note: "Critical, major, minor" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "AI gets product facts wrong,",
    muted: "and sounds sure about it.",
    body: "Assistants mix up versions, invent features, repeat outdated specs or suggest a product for a use it isn't approved for. Buyers take those answers at face value. You can't correct what you haven't found.",
    points: [
      {
        title: "Wrong claims spread quietly",
        body: "An error in one answer repeats across prompts, markets and engines. Without systematic checks, nobody notices until a customer does.",
      },
      {
        title: "Regulated claims carry risk",
        body: "For medicines, medical devices or financial products, an off-label or contradicted statement is more than a marketing problem.",
      },
      {
        title: "Proof makes corrections possible",
        body: "A deviation linked to the exact answer and the exact passage in your documentation is something your team can act on.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "Every AI claim checked against the source,",
    muted: "with proof.",
    items: [
      {
        icon: "layers",
        title: "Assets with aliases",
        body: "Add products one by one, paste a list or discover them from a URL. Aliases and active ingredients catch every spelling AI uses.",
      },
      {
        icon: "file-text",
        title: "Reference documents",
        body: "Upload a PDF, paste text or link a URL. Sections such as “4.1 Therapeutic indications” are detected automatically, and document versions are kept.",
      },
      {
        icon: "shield-check",
        title: "Six verdicts with evidence",
        body: "Matches, contradicted, unsupported, outdated, off-label or needs review — each with the quote from the answer, the label passage and an explanation.",
      },
      {
        icon: "flag",
        title: "Findings workflow",
        body: "Filter by engine, market, type, severity and asset, mark findings resolved or ignored, and export them as CSV.",
      },
      {
        icon: "chart",
        title: "Accuracy over time",
        body: "Match rate per week, per engine, per market and per asset, and the kinds of mistakes each engine makes.",
      },
      {
        icon: "list-checks",
        title: "Corrections become tasks",
        body: "Inaccurate claims turn into reputation tasks in your action plan, ready to assign or push to your PM tool.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From product label to accuracy report",
    muted: "in three steps.",
    items: [
      {
        title: "Add assets and documents",
        body: "Create the products you want to watch and attach their reference documents, such as an SmPC, package leaflet, spec sheet or terms.",
      },
      {
        title: "AutoSEO extracts and judges statements",
        body: "Once a day and after every tracking run, statements about each asset are pulled from AI answers and compared with the relevant sections of your documents.",
      },
      {
        title: "Review the deviations",
        body: "Work through findings by severity, override a verdict when needed and follow the match rate per engine and market.",
      },
    ],
  },
  faq: [
    {
      q: "What is an AI fact check?",
      a: "An AI fact check compares what AI assistants say about your products with an authoritative source, such as a product label, spec sheet or terms. AutoSEO does this continuously for every answer it tracks and reports each statement as matching or deviating from your documents.",
    },
    {
      q: "How do I check what ChatGPT says about my product?",
      a: "Track the prompts your customers ask in AutoSEO, then create an asset for your product and upload its reference document. AutoSEO pulls every statement about the product from ChatGPT's answers — and those of the other tracked engines — and checks it against the document.",
    },
    {
      q: "Which reference documents can I use?",
      a: "Any text that defines the facts about a product: an SmPC or package leaflet, a spec sheet or terms and conditions. Upload a PDF of up to 20 MB, paste the text or link a URL to an HTML page or PDF.",
    },
    {
      q: "How does AutoSEO decide whether a claim is wrong?",
      a: "With an AI provider connected, a model judges each statement against the relevant document sections and must quote the supporting passage verbatim. If that passage can't be found in your document, the verdict is downgraded to “needs review”. Without AI, a word-for-word comparison is used.",
    },
    {
      q: "Is AI fact checking only for pharma?",
      a: "No. The verdicts come from label compliance — “off-label” is a pharma term — but any product with a spec sheet or terms works. Regulated industries such as pharma, medical devices and finance benefit most.",
    },
    {
      q: "Where do the AI answers come from?",
      a: "From AI visibility tracking: the prompts you track across up to 16 engines and 143 markets. Fact check works on those stored answers and doesn't query the engines again.",
    },
    {
      q: "Is the AI fact check free?",
      a: "Fact check is part of the open-source AutoSEO app and free to self-host with every feature. AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included. AI judging can also run on your own Claude Code or Codex through a local agent.",
    },
  ],
  related: ["ai-brand-sentiment", "ai-visibility-tracking", "ai-seo-tasks", "ai-content-optimization"],
  cta: {
    title: "Find out what AI gets wrong about your products",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;

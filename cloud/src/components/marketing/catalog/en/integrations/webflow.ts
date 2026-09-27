import type { IntegrationPage } from "../../types";

export default {
  slug: "webflow",
  name: "Webflow",
  nav: "Webflow",
  summary: "Publish AI-optimized drafts to Webflow CMS collections, staged or live.",
  meta: {
    title: "Webflow Integration for AI SEO Content",
    description:
      "Connect Webflow to AutoSEO and publish AI-optimized articles to a CMS collection — name, slug, rich-text body and SEO title — as a draft item or live.",
  },
  hero: {
    subtitle:
      "Connect your Webflow site with an API token and publish the content AutoSEO drafts for AI search into a CMS collection — saved as a draft item for review or published live.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Webflow integration",
    items: [
      "Publish content drafts to a Webflow CMS collection in one click",
      "Name, slug and HTML body written to the collection's rich-text field",
      "Summary and SEO title filled in when the collection has matching fields",
      "FAQs from the draft added to the article body",
      "Save as a draft item or publish live to your site",
      "Publishing again updates the same collection item",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Webflow and AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Turn visibility gaps into articles",
        body: "Draft content for prompts where competitors are mentioned and you aren't, then publish it to your Webflow blog collection.",
      },
      {
        icon: "pen",
        title: "Keep editors in control",
        body: "Save articles as draft items, then review, adjust and publish them in Webflow as usual.",
      },
      {
        icon: "refresh",
        title: "Update articles after the next run",
        body: "Revise a draft in AutoSEO after new tracking data comes in and publish again — the existing item is updated, not duplicated.",
      },
      {
        icon: "layers",
        title: "Publish to the right collection",
        body: "AutoSEO lists the collections your token can reach, so articles land in your blog, guides or any collection with a rich-text field.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Webflow in four steps,",
    muted: "with a site API token.",
    items: [
      {
        title: "Generate an API token",
        body: "In Webflow, open Site settings → Apps & integrations → API access and generate a token with CMS read and write and Sites read access. Add Sites write to publish items live.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Content in your project, choose Connect CMS → Webflow and paste the token. AutoSEO checks which sites it can access.",
      },
      {
        title: "Pick a collection",
        body: "Choose the CMS collection new articles go to. It needs a rich-text field for the article body.",
      },
      {
        title: "Publish a draft",
        body: "Open a content draft and publish it to Webflow — with Save as draft for review or Publish live to put it on your site.",
      },
    ],
  },
  faq: [
    {
      q: "How do I publish AI-optimized content to Webflow?",
      a: "Connect Webflow with a site API token under Optimizations → Content, pick a CMS collection and publish any content draft. AutoSEO creates a collection item with name, slug and rich-text body, and fills a summary and SEO title field when the collection has them.",
    },
    {
      q: "Which Webflow API permissions does AutoSEO need?",
      a: "CMS read and write plus Sites read. Add Sites write if AutoSEO should publish items live; the connection test tells you if the token can't access any site.",
    },
    {
      q: "Can I review articles before they go live on Webflow?",
      a: "Yes. Choose Save as draft and the article is created as a draft item in your collection. Review it in Webflow and publish it there, or publish it live from AutoSEO later.",
    },
    {
      q: "What if my Webflow collection has other required fields?",
      a: "AutoSEO fills name, slug, body, summary and SEO title. If the collection requires other fields, publishing stops and names the fields it can't fill, so you can make them optional in Webflow.",
    },
    {
      q: "Does AutoSEO add JSON-LD to Webflow items?",
      a: "Not automatically. The content editor generates JSON-LD for each draft, and you can copy it as a script tag from the Schema tab into your Webflow page.",
    },
    {
      q: "Where is my Webflow API token stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to call the Webflow API.",
    },
  ],
  cta: {
    title: "Ship content AI engines can cite",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

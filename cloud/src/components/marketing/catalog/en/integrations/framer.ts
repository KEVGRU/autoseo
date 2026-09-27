import type { IntegrationPage } from "../../types";

export default {
  slug: "framer",
  name: "Framer",
  nav: "Framer",
  summary: "Publish AI-optimized drafts into Framer CMS collections, or export them for import.",
  meta: {
    title: "Framer CMS Integration for AI SEO Content",
    description:
      "Connect Framer to AutoSEO and publish AI-optimized articles into a Framer CMS collection via the Server API — or export Markdown, HTML and a CMS-ready CSV.",
  },
  hero: {
    subtitle:
      "Connect a Framer project with an API key and publish the content AutoSEO drafts for AI search into one of your CMS collections — as a draft item or live. No key? Export Markdown, HTML or a CSV instead.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Framer integration",
    items: [
      "Create or update items in your own Framer CMS collections through the Framer Server API",
      "Title, slug and body written to the collection; SEO title, SEO description, summary and date filled in when matching fields exist",
      "Save as a draft item, or publish live — which publishes the whole Framer site",
      "Publishing again updates the same item instead of adding a new one",
      "Markdown, standalone HTML with JSON-LD and a Framer-ready CSV for every draft",
      "Beta: works with collections you manage yourself, not plugin-managed ones",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Framer and AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Turn visibility gaps into Framer articles",
        body: "Draft content for prompts where competitors are mentioned and you aren't, then add it to your Framer blog collection in one click.",
      },
      {
        icon: "pen",
        title: "Review before anything goes live",
        body: "Save articles as draft items, check them in the Framer editor and publish the site when you're ready.",
      },
      {
        icon: "refresh",
        title: "Keep articles current",
        body: "Revise a draft after the next tracking run and publish again — AutoSEO updates the existing CMS item by its ID or slug.",
      },
      {
        icon: "download",
        title: "Import without an API key",
        body: "Download a CSV with title, slug, content, meta fields and FAQs and import it into a CMS collection, or paste the HTML export into a Formatted Text field.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Framer in four steps,",
    muted: "with a project API key.",
    items: [
      {
        title: "Create an API key in Framer",
        body: "Open the project in Framer, go to Site settings → API Keys and create a key named “AutoSEO”. Copy the project URL from the editor's address bar too.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Content in your project, choose Connect CMS → Framer and paste the project URL and the key. The published site URL is optional.",
      },
      {
        title: "Pick a CMS collection",
        body: "Choose one of your own collections. It needs a Formatted Text field for the body; fields are matched by name and type.",
      },
      {
        title: "Publish or export",
        body: "In the content editor, choose Framer as the destination and use Save as draft or Publish live — or download Markdown, HTML or the CMS CSV.",
      },
    ],
  },
  faq: [
    {
      q: "How do I publish AI-optimized content to Framer?",
      a: "Create an API key in your Framer project's Site settings, connect it under Optimizations → Content together with the project URL and pick a CMS collection. AutoSEO then writes each content draft into that collection through the Framer Server API.",
    },
    {
      q: "What does Publish live do in Framer?",
      a: "It adds or updates the CMS item and then publishes the whole Framer site, including any other unpublished changes in the project. Use Save as draft if you only want to add the item and publish from Framer yourself.",
    },
    {
      q: "Which Framer CMS collections can AutoSEO write to?",
      a: "Collections you manage yourself. Plugin-managed collections can't be edited through the API. The collection needs a Formatted Text field for the body; if it requires other fields AutoSEO can't fill, publishing stops and names them.",
    },
    {
      q: "Can I use AutoSEO with Framer without an API key?",
      a: "Yes. Every draft can be exported as Markdown with front matter, as standalone HTML with meta tags and JSON-LD, or as a CSV you import into a Framer CMS collection.",
    },
    {
      q: "Why is the Framer integration in beta?",
      a: "It uses Framer's Server API, and collection setups vary from project to project. Field matching works by name and type, so check the first published item before relying on it for a whole content plan.",
    },
    {
      q: "Where is my Framer API key stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to open a session with your Framer project.",
    },
  ],
  cta: {
    title: "Ship content AI engines can cite",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

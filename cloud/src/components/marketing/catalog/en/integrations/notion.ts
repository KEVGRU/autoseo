import type { IntegrationPage } from "../../types";

export default {
  slug: "notion",
  name: "Notion",
  nav: "Notion",
  summary: "Push AI visibility and SEO tasks into a Notion database with checklists and status sync.",
  meta: {
    title: "Notion Integration for SEO and GEO Tasks",
    description:
      "Push prioritized SEO and AI visibility tasks from AutoSEO to a Notion database as pages with steps, checklists and evidence — and sync their status back hourly.",
  },
  hero: {
    subtitle:
      "Connect Notion with an internal integration and turn AutoSEO's evidence-backed tasks into pages in your task database — written as native Notion blocks, with status synced from your own properties.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Notion integration",
    items: [
      "A page per task in the Notion database you choose",
      "Native blocks: headings, numbered steps, to-do checkboxes for acceptance criteria and links",
      "A People property filled by email when your database has one",
      "Status sync from a Status property, a Status select or a Done checkbox",
      "Archived or deleted pages close the task in AutoSEO",
      "Push single tasks, a selection or new tasks automatically per category",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Notion and AutoSEO",
    items: [
      {
        icon: "database",
        title: "Use your own task database",
        body: "AutoSEO writes into the database your team already runs — only the title and People properties are set, everything else stays yours.",
      },
      {
        icon: "list-checks",
        title: "Work through acceptance criteria",
        body: "Acceptance criteria arrive as to-do checkboxes, so the person doing the work can tick them off in Notion.",
      },
      {
        icon: "refresh",
        title: "Close tasks from Notion",
        body: "Set the Status to Done or tick a Done checkbox, and AutoSEO resolves the task within the hour.",
      },
      {
        icon: "workflow",
        title: "Route by category",
        body: "Push new tasks of selected categories to Notion automatically and keep the rest in AutoSEO or another tool.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Notion in four steps,",
    muted: "with an internal integration.",
    items: [
      {
        title: "Create an internal integration",
        body: "Go to notion.so/profile/integrations → New integration, choose internal and copy the secret.",
      },
      {
        title: "Share your task database",
        body: "Open the database in Notion → ••• → Connections and add the integration.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Tasks in your project, choose Connect PM Tool → Notion, paste the secret and pick the database.",
      },
      {
        title: "Push tasks",
        body: "Push a task from its detail view, select several at once, or turn on automatic pushing per category under Routing.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send SEO tasks to Notion?",
      a: "Create an internal Notion integration, add it to your task database under Connections and connect it under Optimizations → Tasks. Then push any task — or let Routing push new tasks of a category automatically. Each task becomes a page with steps, checklists, evidence and a link back.",
    },
    {
      q: "Why doesn't AutoSEO see my Notion database?",
      a: "Notion only exposes databases that are shared with the integration. Open the database → ••• → Connections, add the integration and load the list in AutoSEO again.",
    },
    {
      q: "Which Notion properties does AutoSEO use?",
      a: "The title property for the task name and, if present, a People property for the assignee. For the status sync, it reads a Status property, a select named Status or State, or a checkbox named Done. Other properties stay untouched.",
    },
    {
      q: "How does AutoSEO assign people in Notion?",
      a: "It matches the assignee's email to a Notion workspace member, which needs the integration capability to read user information including email addresses. If nobody matches, the name is added at the top of the page instead.",
    },
    {
      q: "Does the status sync go both ways?",
      a: "Status flows from Notion to AutoSEO. Every hour, AutoSEO checks linked pages and marks tasks In Progress or Done based on your status property. Changes in AutoSEO aren't written back to Notion.",
    },
  ],
  cta: {
    title: "Turn AI visibility insights into Notion pages",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

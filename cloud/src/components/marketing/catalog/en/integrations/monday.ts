import type { IntegrationPage } from "../../types";

export default {
  slug: "monday",
  name: "monday.com",
  nav: "monday.com",
  summary: "Push AI visibility and SEO tasks to monday.com boards as items with owners and details.",
  meta: {
    title: "monday.com Integration for SEO and GEO Tasks",
    description:
      "Push prioritized SEO and AI visibility tasks from AutoSEO to monday.com boards as items with full details and owners — and sync their status back hourly.",
  },
  hero: {
    subtitle:
      "Connect monday.com with your API token and turn AutoSEO's evidence-backed tasks into board items — with the details in an update, an owner in your People column and status synced from your Status column.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the monday.com integration",
    items: [
      "Items on the monday.com board you choose, named after the task",
      "Steps, acceptance criteria, evidence and a link back posted as an update on the item",
      "Owner set in your People column, matched by email",
      "Status sync from the Status column: Done closes the task, Working on it moves it to in progress",
      "Archived or deleted items close the task in AutoSEO too",
      "Push single tasks, a selection or new tasks automatically per category",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with monday.com and AutoSEO",
    items: [
      {
        icon: "layers",
        title: "Plan GEO work on your boards",
        body: "AI visibility and SEO tasks land on the board your team already uses for campaigns and content.",
      },
      {
        icon: "users",
        title: "Set owners automatically",
        body: "Choose a monday.com user per category under Routing, and AutoSEO fills the board's People column when it creates the item.",
      },
      {
        icon: "check-circle",
        title: "Let status labels do the work",
        body: "Set the Status column to Done and the task is resolved in AutoSEO within the hour.",
      },
      {
        icon: "workflow",
        title: "Route by category",
        body: "Push new tasks of selected categories to monday.com automatically and keep the rest in AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect monday.com in three steps,",
    muted: "with your API token.",
    items: [
      {
        title: "Copy your API token",
        body: "In monday.com, click your avatar → Developers → My access tokens (or Administration → Connections → API) and copy your personal API token.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Tasks in your project, choose Connect PM Tool → monday.com, paste the token and pick the board items are created on.",
      },
      {
        title: "Push tasks",
        body: "Push a task from its detail view, select several at once, or turn on automatic pushing per category under Routing.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send SEO tasks to monday.com?",
      a: "Connect monday.com under Optimizations → Tasks with your API token and pick a board. Then push any task — or let Routing push new tasks of a category automatically. Each task becomes an item with its details in an update and a link back to AutoSEO.",
    },
    {
      q: "Where do the task details go in monday.com?",
      a: "The item name is the task title, and the details — steps, acceptance criteria, evidence and target URLs — are posted as a formatted update on the item.",
    },
    {
      q: "How does the status sync read my board?",
      a: "AutoSEO reads the item's Status column: labels like Done or Erledigt mark the task done, labels like Working on it or In progress move it to in progress. Archived or deleted items count as done. It checks every hour and doesn't write changes back.",
    },
    {
      q: "Can AutoSEO set the item owner?",
      a: "Yes. AutoSEO looks up the monday.com user by email and fills the People column, preferring one named Owner, Assignee or Person. If no user matches, the name is added to the update instead.",
    },
    {
      q: "Where is my monday.com token stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to call the monday.com API.",
    },
  ],
  cta: {
    title: "Turn AI visibility insights into board items",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

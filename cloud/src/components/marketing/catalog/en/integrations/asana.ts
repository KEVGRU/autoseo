import type { IntegrationPage } from "../../types";

export default {
  slug: "asana",
  name: "Asana",
  nav: "Asana",
  summary: "Push AI visibility and SEO tasks to Asana projects and close them when they're done.",
  meta: {
    title: "Asana Integration for SEO and GEO Tasks",
    description:
      "Push prioritized SEO and AI visibility tasks from AutoSEO to Asana projects with steps, evidence, due dates and assignees — and sync completion back hourly.",
  },
  hero: {
    subtitle:
      "Connect Asana with a personal access token and turn AutoSEO's evidence-backed tasks into Asana tasks in the project your team already plans in — completed in Asana, resolved in AutoSEO.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Asana integration",
    items: [
      "Asana tasks in the project you choose, across up to 10 workspaces",
      "Task notes with steps, acceptance criteria, evidence, target URLs and a link back",
      "Due dates carried over, assignees set by email or Asana user ID",
      "Unknown assignees never block a push — the name goes into the notes instead",
      "Hourly sync: completing the task in Asana marks it done in AutoSEO",
      "Push single tasks, a selection or new tasks automatically per category",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Asana and AutoSEO",
    items: [
      {
        icon: "users",
        title: "Plan GEO work with marketing",
        body: "Put AI visibility and SEO tasks into the Asana projects your marketing and content teams already work from.",
      },
      {
        icon: "workflow",
        title: "Route and assign by category",
        body: "Push new content tasks to Asana automatically and set who gets them per category under Routing.",
      },
      {
        icon: "check-circle",
        title: "Close tasks in one place",
        body: "Mark a task complete in Asana, and AutoSEO resolves it within the hour.",
      },
      {
        icon: "link",
        title: "Keep the evidence attached",
        body: "Every task carries the data behind it — impact, effort, priority and evidence — and links back to AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Asana in three steps,",
    muted: "with a personal access token.",
    items: [
      {
        title: "Create a personal access token",
        body: "In Asana, open My settings → Apps → Manage developer apps (app.asana.com/0/my-apps) and create a personal access token.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Tasks in your project, choose Connect PM Tool → Asana, paste the token and pick the project tasks go to.",
      },
      {
        title: "Push tasks",
        body: "Push a task from its detail view, select several at once, or turn on automatic pushing per category under Routing.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send SEO tasks to Asana?",
      a: "Connect Asana under Optimizations → Tasks with a personal access token and pick a project. Then push any task — or let Routing push new tasks of a category automatically. Each task becomes an Asana task with steps, evidence, due date and a link back to AutoSEO.",
    },
    {
      q: "Can AutoSEO assign Asana tasks to people?",
      a: "Yes. Set an assignee per category under Routing — an email address or Asana user ID — or assign the task in AutoSEO to a teammate who uses the same email in Asana. If Asana rejects the assignee, the task is created unassigned and the name is added to the notes.",
    },
    {
      q: "Does the status sync go both ways?",
      a: "Completion flows from Asana to AutoSEO. Every hour, AutoSEO checks linked tasks and marks the ones completed in Asana as done. Changes in AutoSEO aren't written back to Asana.",
    },
    {
      q: "Will pushing a task twice create duplicates in Asana?",
      a: "No. A task that is already linked to an Asana task is skipped, and retries of a failed push don't create duplicates.",
    },
    {
      q: "Where is my Asana token stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to call the Asana API.",
    },
  ],
  cta: {
    title: "Turn AI visibility insights into Asana tasks",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

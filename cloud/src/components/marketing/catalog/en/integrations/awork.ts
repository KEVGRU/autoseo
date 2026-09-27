import type { IntegrationPage } from "../../types";

export default {
  slug: "awork",
  name: "awork",
  nav: "awork",
  summary: "Push AI visibility and SEO tasks into awork projects and sync their status back.",
  meta: {
    title: "awork Integration for SEO and GEO Tasks",
    description:
      "Push prioritized SEO and AI visibility tasks from AutoSEO into awork projects with context, priority flags and due dates — and sync their status back hourly.",
  },
  hero: {
    subtitle:
      "Connect awork with an API key and send AutoSEO's evidence-backed tasks into the project you plan in — high-impact work flagged as priority, status synced back every hour.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the awork integration",
    items: [
      "Project tasks in the awork project you choose",
      "Descriptions with steps, acceptance criteria, evidence and a link back",
      "Tasks with an impact score of 8 or more flagged as priority",
      "Due dates carried over, the intended assignee named in the description",
      "Hourly status sync: done closes the task; in progress, review or stuck move it to in progress",
      "Push single tasks, a selection or new tasks automatically per category",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with awork and AutoSEO",
    items: [
      {
        icon: "building",
        title: "Plan SEO work in client projects",
        body: "Agencies and in-house teams that run projects in awork get AutoSEO tasks in the same project plan, next to budgets and timelines.",
      },
      {
        icon: "flag",
        title: "See high-impact work first",
        body: "Tasks with an impact score of 8 or more arrive with awork's priority flag set.",
      },
      {
        icon: "refresh",
        title: "Keep status in sync",
        body: "Finish a task in awork, and AutoSEO resolves it within the hour; work in progress shows up as in progress.",
      },
      {
        icon: "workflow",
        title: "Route by category",
        body: "Push new tasks of selected categories to awork automatically and keep the rest in AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect awork in three steps,",
    muted: "with an API key.",
    items: [
      {
        title: "Create an API key",
        body: "In awork, open Settings → Integrations → API and create a client application with an API key.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Tasks in your project, choose Connect PM Tool → awork, paste the key and pick the project tasks are created in.",
      },
      {
        title: "Push tasks",
        body: "Push a task from its detail view, select several at once, or turn on automatic pushing per category under Routing.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send SEO tasks to awork?",
      a: "Connect awork under Optimizations → Tasks with an API key and pick a project. Then push any task — or let Routing push new tasks of a category automatically. Each task becomes an awork project task with steps, evidence, due date and a link back to AutoSEO.",
    },
    {
      q: "Which tasks are marked as priority in awork?",
      a: "Tasks with an impact score of 8 or more out of 10 get awork's priority flag. All other tasks are created without it.",
    },
    {
      q: "Can AutoSEO assign awork tasks to people?",
      a: "Not directly. The assignee from Routing or AutoSEO is named at the top of the task description, so the project lead can assign the task in awork.",
    },
    {
      q: "How does the awork status sync work?",
      a: "Every hour, AutoSEO checks the status type of linked tasks: done marks the task done, while in progress, review and stuck move it to in progress. Changes in AutoSEO aren't written back to awork.",
    },
    {
      q: "Where is my awork API key stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to call the awork API.",
    },
  ],
  cta: {
    title: "Turn AI visibility insights into awork tasks",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

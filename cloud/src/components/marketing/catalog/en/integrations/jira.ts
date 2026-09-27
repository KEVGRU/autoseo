import type { IntegrationPage } from "../../types";

export default {
  slug: "jira",
  name: "Jira",
  nav: "Jira",
  summary: "Push AI visibility and SEO tasks to Jira Cloud and sync their status back.",
  meta: {
    title: "Jira Integration for SEO and GEO Tasks",
    description:
      "Push prioritized SEO and AI visibility tasks from AutoSEO to Jira Cloud as issues with steps, evidence and due dates — and sync their status back hourly.",
  },
  hero: {
    subtitle:
      "Connect Jira Cloud with an API token and send AutoSEO's evidence-backed tasks to your project as issues — with steps, acceptance criteria and a link back. When the issue is done, so is the task.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Jira integration",
    items: [
      "Jira issues of type Task in the project you choose",
      "Formatted descriptions with steps, acceptance criteria, evidence and target URLs",
      "A label for the task category and the due date carried over",
      "Push single tasks, a selection or new tasks automatically per category",
      "Hourly status sync: done in Jira marks the task done in AutoSEO",
      "Tasks that are already linked are never pushed twice",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Jira and AutoSEO",
    items: [
      {
        icon: "list-checks",
        title: "Hand SEO fixes to engineering",
        body: "Technical tasks from audits and crawlability checks land in the engineering backlog with the evidence attached.",
      },
      {
        icon: "workflow",
        title: "Route tasks by category",
        body: "Push new technical tasks to Jira automatically while content or offsite tasks stay in AutoSEO — Routing decides per category.",
      },
      {
        icon: "refresh",
        title: "Keep both tools in sync",
        body: "When an issue moves to In Progress or Done in Jira, AutoSEO updates the task within the hour.",
      },
      {
        icon: "link",
        title: "Keep the context",
        body: "Every issue shows the task's impact, effort and priority and links back to the task in AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Jira in four steps,",
    muted: "with an Atlassian API token.",
    items: [
      {
        title: "Create an API token",
        body: "Go to id.atlassian.com → Security → Create and manage API tokens and create a token for AutoSEO.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Tasks in your project, choose Connect PM Tool → Jira Cloud and enter your site URL, account email and the token.",
      },
      {
        title: "Pick a project",
        body: "Choose the Jira project new issues are created in.",
      },
      {
        title: "Push tasks",
        body: "Push a task from its detail view, select several at once, or turn on automatic pushing per category under Routing.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send SEO tasks to Jira?",
      a: "Connect Jira Cloud under Optimizations → Tasks with your site URL, account email and an Atlassian API token, and pick a project. Then push any task — or let Routing push new tasks of a category automatically. Each task becomes a Jira issue with steps, evidence and a link back.",
    },
    {
      q: "Does AutoSEO work with Jira Server or Data Center?",
      a: "No. The integration is built for Jira Cloud (yourcompany.atlassian.net) and signs in with an Atlassian account email and API token. For other setups, the signed webhook integration can forward tasks through Zapier, n8n or Make.",
    },
    {
      q: "Which Jira issue type does AutoSEO create?",
      a: "A Task. If your project has no issue type called Task, AutoSEO picks the closest match or the project's first standard issue type.",
    },
    {
      q: "Does the status sync go both ways?",
      a: "Status flows from Jira to AutoSEO. Every hour, AutoSEO checks linked issues and marks tasks In Progress or Done based on the issue's status category. Changes in AutoSEO aren't written back to Jira.",
    },
    {
      q: "Will pushing a task twice create duplicate issues?",
      a: "No. A task that is already linked to a Jira issue is skipped, and retries of a failed push don't create duplicates.",
    },
    {
      q: "Where is my Jira API token stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to call your Jira site's REST API.",
    },
  ],
  cta: {
    title: "Turn AI visibility insights into Jira issues",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

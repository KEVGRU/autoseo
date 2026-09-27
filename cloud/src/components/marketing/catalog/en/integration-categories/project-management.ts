import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "project-management",
  nav: "Project management integrations",
  summary: "Push evidence-backed SEO and GEO tasks to Jira, Linear, Asana, ClickUp and more.",
  meta: {
    title: "SEO Task Integrations: Jira, Linear, Asana",
    description:
      "Push prioritized SEO tasks with evidence from AutoSEO to Jira, Linear, Asana, ClickUp, Trello, monday.com, Notion or awork — and sync their status back hourly.",
  },
  hero: {
    eyebrow: "Project management integrations",
    title: "Send SEO tasks to the tools your team uses.",
    muted: "Status syncs back.",
    subtitle:
      "AutoSEO turns visibility gaps, missing citations, crawl errors and Search Console data into prioritized tasks. Push them to Jira, Linear, Asana, ClickUp, Trello, monday.com, Notion or awork with steps, acceptance criteria and evidence — and see them close in AutoSEO when your team is done.",
  },
  benefits: {
    eyebrow: "Why connect",
    title: "Insights your team can act on,",
    muted: "in their own tool.",
    items: [
      {
        icon: "list-checks",
        title: "Tasks that explain themselves",
        body: "Each issue carries the summary, steps, acceptance criteria, evidence, target URLs and prompts, plus impact, effort and priority — and a link back to AutoSEO.",
      },
      {
        icon: "refresh",
        title: "Status syncs back every hour",
        body: "When an issue moves to in progress or done in your tool, the AutoSEO task follows. No double bookkeeping.",
      },
      {
        icon: "workflow",
        title: "Route by category, push automatically",
        body: "Send technical tasks to Jira and content tasks to Asana, for example, and turn on auto-push so new tasks arrive without a click.",
      },
      {
        icon: "key",
        title: "Connected with a token",
        body: "Each tool connects with its own API token or key, stored encrypted with AES-256-GCM. Pick the team, project, list, board or database for new tasks.",
      },
    ],
  },
  faq: [
    {
      q: "How do I push SEO tasks to Jira?",
      a: "Create an API token at id.atlassian.com, then connect Jira Cloud in AutoSEO with your site URL, account email and the token, and pick a project. Tasks become Jira issues of the Task type with a formatted description, and their status syncs back.",
    },
    {
      q: "Which project management tools does AutoSEO support?",
      a: "Jira Cloud, Linear, Asana, ClickUp, Trello, monday.com, Notion and awork. For any other tool, a signed webhook sends task events to Zapier, n8n, Make or your own endpoint.",
    },
    {
      q: "What does AutoSEO send to my project management tool?",
      a: "The task title and a Markdown description with summary, steps, acceptance criteria, evidence, target URLs and target prompts, plus impact, effort and priority. Content tasks include the content plan. Every issue links back to the task in AutoSEO.",
    },
    {
      q: "Does the task status sync in both directions?",
      a: "Status flows from your tool back to AutoSEO: once an hour, AutoSEO checks linked issues and marks tasks in progress or done. AutoSEO doesn't edit issues after creating them, and pushing a task again never creates a duplicate.",
    },
    {
      q: "Where do the tasks come from?",
      a: "AutoSEO generates them from all its datasets: visibility and competitor gaps, missing citations, content gaps, sentiment and fact-check issues, technical and crawl problems, Search Console and bot traffic. Every task is scored by impact and effort and backed by the data that triggered it.",
    },
    {
      q: "Are the project management integrations free?",
      a: "Yes. All task integrations are part of the open-source app and free to self-host. AutoSEO Cloud includes them in a managed workspace for $50 per month, with $10 of AI and data usage included.",
    },
  ],
  cta: {
    title: "Turn AI visibility data into shipped work",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationCategoryPage;

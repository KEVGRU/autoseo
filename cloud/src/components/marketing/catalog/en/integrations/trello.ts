import type { IntegrationPage } from "../../types";

export default {
  slug: "trello",
  name: "Trello",
  nav: "Trello",
  summary: "Push AI visibility and SEO tasks to Trello lists and close them when cards are done.",
  meta: {
    title: "Trello Integration for SEO and GEO Tasks",
    description:
      "Push prioritized SEO and AI visibility tasks from AutoSEO to Trello lists as cards with steps, evidence and due dates — and close them when cards are done.",
  },
  hero: {
    subtitle:
      "Connect Trello with an API key and token and turn AutoSEO's evidence-backed tasks into cards on your board. Move a card to Done, and the task is resolved in AutoSEO.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Trello integration",
    items: [
      "Cards at the top of the board list you choose",
      "Card descriptions with steps, acceptance criteria, evidence and a link back",
      "Due dates carried over, members assigned by Trello username or full name",
      "Moving a card to a Done list, completing its due date or archiving it closes the task",
      "Lists named Doing, In Progress or Review move the task to in progress",
      "Hourly status sync, and no duplicate cards when a push is retried",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Trello and AutoSEO",
    items: [
      {
        icon: "layers",
        title: "Put GEO work on your board",
        body: "AI visibility and SEO tasks show up as cards next to the rest of your team's work.",
      },
      {
        icon: "check-circle",
        title: "Close tasks by moving cards",
        body: "Drag a card to your Done list, and AutoSEO resolves the task within the hour — no second tool to update.",
      },
      {
        icon: "users",
        title: "Assign board members",
        body: "Set a Trello username per category under Routing, and AutoSEO adds that member to new cards.",
      },
      {
        icon: "workflow",
        title: "Route by category",
        body: "Push new tasks of selected categories to Trello automatically and keep the rest in AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Trello in four steps,",
    muted: "with an API key and token.",
    items: [
      {
        title: "Get an API key",
        body: "Open trello.com/power-ups/admin, create a Power-Up with any name and copy its API key.",
      },
      {
        title: "Authorize a token",
        body: "Next to the API key, click Token, authorize access to your boards and copy the token.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Tasks in your project, choose Connect PM Tool → Trello, paste the key and token and pick the board list new cards go to.",
      },
      {
        title: "Push tasks",
        body: "Push a task from its detail view, select several at once, or turn on automatic pushing per category under Routing.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send SEO tasks to Trello?",
      a: "Connect Trello under Optimizations → Tasks with an API key and token and pick a list. Then push any task — or let Routing push new tasks of a category automatically. Each task becomes a card with steps, evidence, due date and a link back to AutoSEO.",
    },
    {
      q: "Why does Trello need an API key and a token?",
      a: "Trello's REST API uses both: the key belongs to the Power-Up you create, and the token authorizes access to your boards. AutoSEO stores both encrypted with AES-256-GCM in its database.",
    },
    {
      q: "How does AutoSEO know a Trello card is done?",
      a: "A card counts as done when it's archived, its due date is marked complete, or it sits in a list named Done, Complete, Closed or similar. Lists named Doing, In Progress or Review move the task to in progress. AutoSEO checks every hour and doesn't write changes back to Trello.",
    },
    {
      q: "Can AutoSEO assign Trello cards?",
      a: "Yes, by Trello username or full name, because Trello doesn't share member emails. Set it per category under Routing; if no board member matches, the name is added to the card description.",
    },
    {
      q: "Will pushing a task twice create duplicate cards?",
      a: "No. A task that is already linked to a Trello card is skipped, and retries of a failed push don't create duplicates.",
    },
  ],
  cta: {
    title: "Turn AI visibility insights into Trello cards",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

import type { IntegrationPage } from "../../types";

export default {
  slug: "surveymonkey",
  name: "SurveyMonkey",
  nav: "SurveyMonkey",
  summary: "Import SurveyMonkey responses hourly and see how many customers found you via AI search.",
  meta: {
    title: "SurveyMonkey Attribution for AI Search",
    description:
      "Import “How did you hear about us?” answers from SurveyMonkey every hour via the v3 API and see which customers found you through ChatGPT and other AI search.",
  },
  hero: {
    subtitle:
      "Connect a SurveyMonkey survey with a private-app access token. AutoSEO pulls completed responses every hour, turns answer choices back into their text and attributes each respondent to AI search and your other channels.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the SurveyMonkey integration",
    items: [
      "Hourly import through the SurveyMonkey v3 API, plus Sync now",
      "The first sync covers the last 90 days of completed responses",
      "The “How did you hear about us?” question found by its heading — or set the question ID",
      "Choice IDs resolved to their text, “Other” answers kept as free text and classified",
      "Respondent emails from the response's contact data, stored only as a hash",
      "CSV upload for older exports",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with SurveyMonkey and AutoSEO",
    items: [
      {
        icon: "users",
        title: "Ask your existing customers",
        body: "Send an onboarding or customer survey and learn how many customers say they found you through AI search.",
      },
      {
        icon: "sparkles",
        title: "See the assistant behind the answer",
        body: "Choices and free-text answers naming ChatGPT, Perplexity, Claude, Gemini or Copilot are counted per assistant.",
      },
      {
        icon: "euro",
        title: "Match respondents to revenue",
        body: "When responses carry the respondent's email, AutoSEO matches them to orders or payments from your other sources by email hash.",
      },
      {
        icon: "download",
        title: "Backfill from exports",
        body: "Upload a CSV export of up to 5 MB to bring in older responses. Columns are detected automatically.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect SurveyMonkey in four steps,",
    muted: "through the v3 API.",
    items: [
      {
        title: "Create a private app",
        body: "At developer.surveymonkey.com, create a private app with the scopes “View surveys” and “View responses” and copy its access token.",
      },
      {
        title: "Find the survey ID",
        body: "Copy the numeric ID of the survey that contains your “How did you hear about us?” question.",
      },
      {
        title: "Connect in AutoSEO",
        body: "Open Attribution → Integrations → SurveyMonkey, paste the token and survey ID and click Connect. The first import starts right away.",
      },
      {
        title: "Let it sync",
        body: "New completed responses arrive every hour. Click Sync now whenever you want an immediate update.",
      },
    ],
  },
  faq: [
    {
      q: "How do I import SurveyMonkey responses into AutoSEO?",
      a: "Create a SurveyMonkey private app with read access to surveys and responses, then connect its access token and your survey ID under Attribution → Integrations → SurveyMonkey. AutoSEO imports completed responses every hour and classifies each answer into AI search, search, social, ads, referral, content or other.",
    },
    {
      q: "Which SurveyMonkey permissions does AutoSEO need?",
      a: "A private app with the scopes “View surveys” and “View responses”. AutoSEO reads the survey's questions to find your question and turn answer choices into text, then reads completed responses. It never writes to your SurveyMonkey account.",
    },
    {
      q: "What if AutoSEO doesn't find my question?",
      a: "AutoSEO looks for headings like “How did you hear about us?” in English or German. If your wording differs, enter the question ID when you connect; otherwise the connection reports that no matching question was found.",
    },
    {
      q: "Are partial responses imported?",
      a: "No. AutoSEO imports completed responses only. A response that is imported again updates the existing entry instead of creating a duplicate.",
    },
    {
      q: "Is my SurveyMonkey access token safe?",
      a: "The token is stored encrypted with AES-256-GCM and used only to call the SurveyMonkey API. When you disconnect the integration, new data is no longer accepted; responses that were already imported stay.",
    },
    {
      q: "Is the SurveyMonkey integration free?",
      a: "Yes. Attribution and all its integrations are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month. Classifying answers uses built-in rules, not AI credits.",
    },
  ],
  cta: {
    title: "Find out how many customers AI search sends",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

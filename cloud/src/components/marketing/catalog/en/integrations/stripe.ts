import type { IntegrationPage } from "../../types";

export default {
  slug: "stripe",
  name: "Stripe",
  nav: "Stripe",
  summary: "Attribute Stripe checkouts, trials and subscriptions to AI search with a signed webhook.",
  meta: {
    title: "Stripe AI Search Attribution for Revenue",
    description:
      "Attribute Stripe revenue to ChatGPT, Perplexity and other AI search: a signed webhook sends checkouts, trials and renewals, matched to each customer's answer.",
  },
  hero: {
    subtitle:
      "Point a Stripe webhook at AutoSEO and every paid Checkout Session and subscription invoice becomes a conversion — verified with your signing secret and matched to the customer's answer to “How did you hear about us?”.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Stripe integration",
    items: [
      "A signed webhook: every event is verified against your endpoint's signing secret",
      "checkout.session.completed, checkout.session.async_payment_succeeded and invoice.paid",
      "$0 checkouts stored as trials, recurring invoices as renewals",
      "Amount, currency and customer email from each payment, zero-decimal currencies included",
      "Subscriptions keyed on the subscription ID, so a checkout and its first invoice count once",
      "Payments matched to answers by order ID or hashed email, up to 90 days back",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Stripe and AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Measure paid revenue from AI search",
        body: "See how much revenue customers who found you through ChatGPT, Perplexity or Claude bring in, next to search, social, ads, referrals and content.",
      },
      {
        icon: "zap",
        title: "Keep trials apart from purchases",
        body: "A $0 checkout counts as a trial, so free signups from AI search don't inflate your revenue numbers.",
      },
      {
        icon: "refresh",
        title: "Count renewals without double counting",
        body: "Recurring invoices are stored as renewals and never merged with an answer again, so the original deal counts once.",
      },
      {
        icon: "users",
        title: "Connect signups to payments",
        body: "The AutoSEO snippet asks after signup and hashes the email from your form in the browser. Stripe's checkout email then matches the answer by hash.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Stripe in five steps,",
    muted: "with a signed webhook.",
    items: [
      {
        title: "Generate your webhook URL",
        body: "In your project, open Attribution → Integrations → Stripe and click Connect. Copy the webhook URL — it's shown only once.",
      },
      {
        title: "Add an endpoint in Stripe",
        body: "In the Stripe Dashboard, open Developers → Webhooks → Add endpoint and paste the URL.",
      },
      {
        title: "Select three events",
        body: "Choose checkout.session.completed, checkout.session.async_payment_succeeded and invoice.paid.",
      },
      {
        title: "Save the signing secret",
        body: "Reveal the endpoint's signing secret (whsec_…) in Stripe and paste it into AutoSEO. Events without a valid signature are rejected.",
      },
      {
        title: "Send a test event",
        body: "Use “Send test webhook” in Stripe and check the delivery under Webhook Logs.",
      },
    ],
  },
  faq: [
    {
      q: "How do I track Stripe revenue from ChatGPT?",
      a: "Connect Stripe with a webhook for checkout and invoice events, and add the AutoSEO snippet to your site so customers can answer “How did you hear about us?”. AutoSEO matches each payment to the answer by order ID or hashed email and reports revenue from ChatGPT and other assistants as AI search.",
    },
    {
      q: "Which Stripe events does AutoSEO use?",
      a: "checkout.session.completed, checkout.session.async_payment_succeeded and invoice.paid. Invoices only count when they start or renew a subscription; other events are acknowledged and ignored.",
    },
    {
      q: "How are trials and renewals counted?",
      a: "Checkouts with a total of $0 are stored as trials. Invoices with the billing reason subscription_cycle are stored as renewals, which never merge with an answer — so a customer's original deal isn't counted again every month.",
    },
    {
      q: "Does it work with Payment Links and delayed payment methods?",
      a: "Payment Links run through Stripe Checkout, so their sessions arrive like any other checkout. For delayed payment methods, AutoSEO ignores the unpaid session and counts the payment when checkout.session.async_payment_succeeded arrives.",
    },
    {
      q: "How can I match Stripe payments to answers exactly?",
      a: "Put your own order ID into the Checkout Session metadata as order_id or transaction_id and pass the same ID to the snippet's trackConversion() call. Without an order ID, AutoSEO matches by the customer's hashed email.",
    },
    {
      q: "How is the Stripe webhook secured?",
      a: "Each event needs a valid Stripe-Signature header, signed with your endpoint secret and no older than five minutes. The webhook URL also carries a secret token that AutoSEO stores only as a hash.",
    },
    {
      q: "Is the Stripe integration included in the price?",
      a: "Yes. Attribution and every integration are part of the open-source app: free when you self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "See the revenue behind your AI visibility",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;

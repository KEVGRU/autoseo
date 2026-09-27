import Link from "next/link";
import { JsonLd } from "@/components/marketing/json-ld";
import { LegalPage } from "@/components/marketing/legal-page";
import { appHost, cloudPlan } from "@/components/marketing/content";
import { breadcrumbs, graph } from "@/components/marketing/structured-data";
import { LegalNotice } from "@/components/site/legal/legal-page";
import { siteMetadata } from "@/components/site/metadata";
import { site } from "@/lib/site";

export const metadata = siteMetadata({
  title: "Terms of Service",
  description:
    "Terms of service for AutoSEO Cloud by Codext GmbH: a managed workspace for $50/month via Stripe, included usage, fair use, cancellation, data and liability.",
  enPath: "/terms",
  locale: "en",
});

export default function TermsPage() {
  const { legal } = site;
  const price = `USD ${site.priceMonthlyUsd}`;
  const yearlyPrice = `USD ${site.priceYearlyUsd}`;
  return (
    <>
      <JsonLd data={graph(breadcrumbs([{ name: "Terms", path: "/terms" }]))} />
      <LegalPage
        crumb="Terms"
        title="Terms of service"
        subtitle="The terms for AutoSEO Cloud subscriptions. The open-source software itself is licensed under the MIT license."
      >
        <LegalNotice>
          A German version of this page is available; in case of discrepancies the{" "}
          <Link href="/de/terms">German version</Link> prevails.
        </LegalNotice>
        <h2>1. Scope</h2>
        <p>
          These terms govern the AutoSEO Cloud service (the &ldquo;Service&rdquo;) provided by {legal.name},{" "}
          {legal.street}, {legal.postalCode} {legal.city}, Germany (&ldquo;we&rdquo;, &ldquo;us&rdquo;), to you (the
          &ldquo;Customer&rdquo;) via {site.host}. The Service is offered exclusively to businesses within the meaning
          of § 14 BGB, not to consumers. Conflicting or supplementary terms of the Customer do not apply unless we agree
          to them in writing.
        </p>

        <h2>2. The Service</h2>
        <p>
          We provide the Customer with a private workspace in a shared, fully managed instance of the open-source
          AutoSEO software that we operate at {appHost} on servers in Germany. The Customer is the owner of its
          workspace; we remain the operator and sole administrator of the instance. We keep the software up to date and
          provide the AI providers, SEO data providers, Google integration and email delivery used by the instance.
          Data of different customers is kept in separate workspaces that are logically separated within a shared
          database. Each workspace includes all features of the current AutoSEO release, an unlimited number of users
          invited by the Customer, up to {cloudPlan.projects} projects, and email support. The scope of features may
          change as the software evolves.
        </p>
        <p>
          The AutoSEO software is licensed under the MIT license. These terms do not restrict any rights granted by
          that license; customers who want their own instance can self-host the software. These terms govern the
          managed service only.
        </p>

        <h2>3. Account and contract</h2>
        <p>
          The Customer creates an account with an email address and signs in via one-time sign-in links. The contract
          for a subscription is concluded when the Customer completes checkout. The Customer must provide accurate
          information, keep access to their email account and workspace secure, and is responsible for all activity in
          their workspace, including the users they invite.
        </p>

        <h2>4. Fees and payment</h2>
        <p>
          The fee is {price} per workspace per month on the monthly plan, or {yearlyPrice} per workspace per year on
          the yearly plan, plus VAT where applicable. Fees are billed in advance for the chosen billing period (one month
          or one year) and processed by our payment provider Stripe. Promotional discounts (for example a launch offer)
          apply only as described in the offer, usually to the first billing period; later periods are billed at the
          regular price. Invoices are provided electronically. If a payment fails, we will
          notify the Customer; if the amount remains unpaid, we may suspend the workspace until it is paid. A suspended
          workspace cannot be opened and its scheduled tasks stop. We may change prices with at least 30 days&apos;
          notice by email; the Customer may cancel before the change takes effect.
        </p>

        <h2>5. Term and cancellation</h2>
        <p>
          Subscriptions run for the chosen billing period (one month or one year) and renew automatically for the same
          period. The Customer can cancel at any time in the customer
          dashboard; cancellation takes effect at the end of the current billing period. Fees already paid for the
          current period are not refunded. We may terminate with 30 days&apos; notice to the end of a billing period.
          The right of both parties to terminate for good cause remains unaffected.
        </p>

        <h2>6. Included usage and third-party services</h2>
        <p>
          Each workspace includes AI and data-provider usage worth USD {cloudPlan.includedUsageUsd} per month (for
          example AI model requests and SEO data from DataForSEO), subject to fair use. When the included usage for a
          month is used up, features that incur provider costs may be unavailable until the next month; unused usage
          does not carry over. AI features can additionally run on the Customer&apos;s own Claude Code or Codex
          subscription through the local agent; that subscription and its terms are the Customer&apos;s responsibility.
          We may limit usage that substantially exceeds normal use or affects the stability of the Service for other
          customers, and will inform the Customer.
        </p>
        <p>
          Services that the Customer connects to its workspace — for example Google accounts, local agents, project
          management tools or content management systems — are used under the Customer&apos;s own accounts and terms.
          The Customer is responsible for keeping those credentials secure and for any costs those providers charge. We
          are not responsible for the availability, results or pricing of third-party services.
        </p>

        <h2>7. Acceptable use</h2>
        <p>The Customer shall not use the Service to:</p>
        <ul>
          <li>violate applicable law or the rights of third parties;</li>
          <li>send spam or unsolicited communications;</li>
          <li>store or distribute malicious code, or attack, probe or overload our or third-party systems;</li>
          <li>circumvent the separation between workspaces, usage limits or security measures of the Service;</li>
          <li>use third-party services connected to the workspace in breach of their terms.</li>
        </ul>
        <p>
          We may suspend a workspace if there are concrete indications of a violation or a threat to the security or
          stability of the Service, and will inform the Customer without undue delay.
        </p>

        <h2>8. Customer data, export and deletion</h2>
        <p>
          All data in the Customer&apos;s workspace remains the Customer&apos;s. Where we process personal data on the
          Customer&apos;s behalf, we do so as a processor under Art. 28 GDPR; a data processing agreement is available on
          request. The Customer can export data at any time using the export features of the software (for example
          CSV and Google Sheets exports, PPTX and PDF reports and a GDPR export of personal data). Because workspaces
          share a managed database, we do not provide exports of the underlying database.
        </p>
        <p>
          When the subscription ends, the workspace is suspended. We keep its data for 30 days so the Customer can
          resubscribe and continue; afterwards the workspace and all its data are permanently deleted.
        </p>

        <h2>9. Availability and support</h2>
        <p>
          We operate the Service with care and aim for high availability, but provide it on a best-effort basis without
          a guaranteed service level. Maintenance, updates and events beyond our control may cause interruptions; we try
          to schedule planned maintenance at times of low usage. Support is provided by email at{" "}
          <a href={`mailto:${legal.email}`}>{legal.email}</a>.
        </p>

        <h2>10. Liability</h2>
        <p>
          We are liable without limitation for intent and gross negligence, for injury to life, body or health, and
          under the German Product Liability Act. For slight negligence, we are liable only for breaches of essential
          contractual obligations (obligations whose fulfilment makes proper performance of the contract possible in the
          first place and on which the Customer may regularly rely), limited to the damage that is typical and
          foreseeable for this type of contract. Otherwise, our liability is excluded. These limitations also apply to
          our employees, representatives and agents.
        </p>

        <h2>11. Changes to these terms</h2>
        <p>
          We may amend these terms with effect for the future. We will inform the Customer of changes by email at least
          30 days before they take effect. If the Customer does not object before the effective date, the changes are
          deemed accepted; we will point out this consequence in our notice. If the Customer objects, either party may
          terminate the subscription as of the effective date.
        </p>

        <h2>12. Governing law and jurisdiction</h2>
        <p>
          These terms are governed by the laws of the Federal Republic of Germany, excluding the UN Convention on
          Contracts for the International Sale of Goods. If the Customer is a merchant, a legal entity under public law
          or a special fund under public law, the exclusive place of jurisdiction is our registered office. Should any
          provision of these terms be invalid, the validity of the remaining provisions is not affected.
        </p>
        <p>
          See also our <Link href="/privacy">privacy policy</Link> and <Link href="/imprint">imprint</Link>.
        </p>
      </LegalPage>
    </>
  );
}

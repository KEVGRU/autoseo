import Link from "next/link";
import { JsonLd } from "@/components/marketing/json-ld";
import { LegalPage } from "@/components/marketing/legal-page";
import { appHost } from "@/components/marketing/content";
import { breadcrumbs, graph } from "@/components/marketing/structured-data";
import { LegalNotice } from "@/components/site/legal/legal-page";
import { siteMetadata } from "@/components/site/metadata";
import { site } from "@/lib/site";

export const metadata = siteMetadata({
  title: "Privacy Policy",
  description:
    "How Codext GmbH processes personal data for autoseo.codext.de and AutoSEO Cloud: hosting in Germany, cookieless usage statistics, Stripe payments, sign-in emails, your rights.",
  enPath: "/privacy",
  locale: "en",
});

export default function PrivacyPage() {
  const { legal } = site;
  return (
    <>
      <JsonLd data={graph(breadcrumbs([{ name: "Privacy", path: "/privacy" }]))} />
      <LegalPage
        crumb="Privacy"
        title="Privacy policy"
        subtitle="We collect as little personal data as possible. Our usage statistics work without cookies and without third parties."
      >
        <LegalNotice>
          A German version of this page is available; in case of discrepancies the{" "}
          <Link href="/de/privacy">German version</Link> prevails.
        </LegalNotice>
        <h2>1. Controller</h2>
        <p>The controller within the meaning of the General Data Protection Regulation (GDPR) is:</p>
        <p>
          {legal.name}
          <br />
          {legal.street}, {legal.postalCode} {legal.city}, Germany
          <br />
          Managing director: {legal.managingDirector}
          <br />
          Email: <a href={`mailto:${legal.email}`}>{legal.email}</a> · Phone: {legal.phone}
        </p>

        <h2>2. Scope</h2>
        <p>
          This policy covers the website {site.host} (including its sign-up, login and customer dashboard) and the AutoSEO
          Cloud service at {appHost}. It does not cover self-hosted installations of the open-source AutoSEO software: whoever
          operates such an installation is responsible for the data processed in it.
        </p>

        <h2>3. Hosting and server logs</h2>
        <p>
          The website and the shared AutoSEO Cloud instance ({appHost}) run on servers in Germany that we operate
          ourselves with the open-source platform Coolify. The server infrastructure is provided by Hetzner Online GmbH,
          Industriestr. 25, 91710 Gunzenhausen, Germany, which acts as our processor under a data processing agreement
          (Art. 28 GDPR).
        </p>
        <p>
          When you access the website, our servers process technical data that your browser transmits automatically:
          IP address, date and time of the request, requested URL, referrer, HTTP status and user agent. We process this
          data to deliver the website and to keep it secure and stable (Art. 6(1)(f) GDPR). Log data is kept only as long
          as necessary for these purposes.
        </p>

        <h2>4. Cloudflare (DNS and CDN)</h2>
        <p>
          We use Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA, for DNS and as a content delivery
          network and security proxy for {site.host}. Requests to the website pass through Cloudflare&apos;s network,
          which processes your IP address and request data to deliver content and protect against attacks. Legal basis
          is our legitimate interest in a secure and fast website (Art. 6(1)(f) GDPR). Cloudflare is certified
          under the EU-U.S. Data Privacy Framework; in addition, the EU Standard Contractual Clauses apply. More
          information:{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">
            cloudflare.com/privacypolicy
          </a>
          .
        </p>

        <h2>5. Privacy-friendly usage statistics</h2>
        <p>
          To understand which pages and campaigns work, we run our own usage statistics on our servers in Germany (see
          section 3). No third-party service is involved, and nothing is stored in your browser for this — no cookies,
          no local storage. When you open a page on {site.host}, a small script of ours sends a short request to our
          server. We record:
        </p>
        <ul>
          <li>the path of the page (without the rest of the address),</li>
          <li>the domain of the website that linked to us (only for links from other websites),</li>
          <li>campaign parameters contained in the link (utm_source, utm_medium, utm_campaign, utm_content, utm_term),</li>
          <li>
            whether the link contained the click ID of an ad network — only which network (for example X or Google),
            never the ID itself,
          </li>
          <li>the country, which Cloudflare derives from your IP address,</li>
          <li>the device type (mobile, tablet or desktop), derived from the user agent,</li>
          <li>
            a few interactions: clicks on sign-up buttons (with the button text and the chosen plan, if any), on our
            launch offer and on links to GitHub, copying the install command, runs of the free AI visibility check, and
            your answer in the consent prompt for X conversion tracking (section 9).
          </li>
        </ul>
        <p>
          We do not store your IP address. To count unique visitors, the IP address and user agent are combined with a
          random value that changes every day and turned into a hash (a one-way checksum). The random value of a day is
          deleted after two days at the latest; from then on, the statistics of visitors without an account can no
          longer be traced back to a person — not even by us. We do not build profiles across several days or other
          websites. Statistics data is deleted after 400 days at the latest.
        </p>
        <p>
          <strong>Sign-up attribution:</strong> when a sign-in email is requested for an email address that has no
          account yet, we recompute the hash once from the current IP address and user agent to find the page views of
          the previous two days. From them we determine which channel and campaign led to the sign-up (for example
          &ldquo;paid social, source x, campaign launch&rdquo;), together with the landing page, the referring domain,
          the ad network (if any), the country and the day of the first page view. We keep this with the sign-in link,
          which is deleted no later than one day after it expires. When the account is created, we store it with the
          account and note channel and campaign in our audit log entry for the sign-up. When you start a checkout, we pass
          channel, campaign parameters, landing page and referring domain to Stripe as metadata of the checkout and the
          subscription (see section 7). This tells us which campaigns bring paying customers. Because the account is
          created at a known time, a link between your account and your page views shortly before the sign-up cannot
          be fully ruled out; apart from this attribution, we do not link statistics to accounts.
        </p>
        <p>
          We process this data based on our legitimate interest in understanding how our website is used and which
          marketing works, in order to improve both (Art. 6(1)(f) GDPR). You can object to this processing at any time
          (Art. 21 GDPR) by emailing <a href={`mailto:${legal.email}`}>{legal.email}</a>; we then delete the attribution
          stored with your account, the channel and campaign in the sign-up audit log entry and the attribution metadata
          on your Stripe checkout and subscription. You can also block requests to {site.host}/api/e, for example with a
          content blocker.
        </p>

        <h2>6. Account and magic-link sign-in</h2>
        <p>
          To create an account, you only provide your email address. We send you a one-time sign-in link (magic link)
          instead of using passwords. We store your email address, the name of your workspace, your subscription status
          and security-relevant events (such as sign-ins). This is necessary to provide the service you
          requested (Art. 6(1)(b) GDPR).
        </p>
        <p>
          Transactional emails — sign-in links, workspace notices and billing messages — are sent through an email
          delivery provider acting as our processor. We do not send newsletters or marketing emails.
        </p>

        <h2>7. Payments via Stripe</h2>
        <p>
          Subscriptions are paid through Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock,
          Dublin, D02 H210, Ireland. When you check out, you enter your payment details directly with Stripe; we never
          see or store full card numbers. Stripe shares with us the information we need for billing and bookkeeping,
          such as name, email, billing address, VAT ID, payment status and the last digits of the payment method. Legal
          bases are the performance of the contract (Art. 6(1)(b) GDPR) and our statutory retention obligations (Art.
          6(1)(c) GDPR). When you start a checkout, we also pass the sign-up channel and campaign described in
          section 5 to Stripe as metadata of the checkout and the subscription (Art. 6(1)(f) GDPR). Stripe may process data in the USA; data transfers are covered by the EU-U.S. Data Privacy
          Framework and Standard Contractual Clauses. More information:{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener">
            stripe.com/privacy
          </a>
          .
        </p>

        <h2>8. Cookies and local storage</h2>
        <p>
          After you sign in, a session cookie (HttpOnly, Secure) keeps you logged in, and short-lived cookies may protect
          sign-in and checkout flows. Your light or dark mode preference is stored in your browser&apos;s local storage
          and never sent to us. These are needed for the service you use and exempt from consent under § 25(2) TDDDG.
          Fonts are served from our own servers.
        </p>
        <p>
          Without your consent, we do not set cookies or store anything in your browser for statistics or advertising,
          and we do not load third-party analytics or advertising services. Our own statistics script (section 5) stores
          nothing in your browser; it sends the page path, the domain of the referring website and campaign parameters
          to our server.
        </p>
        <p>
          When you make a choice in the consent prompt for X conversion tracking, we store it in the cookie{" "}
          <code>__Host-autoseo_consent</code> for 180 days so we don&apos;t ask again. Only if you allowed it: after you
          create an account, the cookie <code>__Host-autoseo_cv</code> (10 minutes) tells the next page to report the
          sign-up to X, and after a paid checkout the cookie <code>__Host-autoseo_purchase</code> (10 minutes, not readable
          by scripts) holds the purchase value until it is reported. X&apos;s own cookies (<code>_twclid</code>,{" "}
          <code>_twpid</code>, <code>_twsid</code>) are only set with your consent and apply to all subdomains of
          codext.de (section 9).
        </p>

        <h2 id="x-conversion-tracking">9. X conversion tracking (only with your consent)</h2>
        <p>
          If you come to our website through one of our ads on X (formerly Twitter), we ask whether X may measure the
          success of the ad. Only if you click &ldquo;Allow&rdquo; do we load X&apos;s conversion tracking (the X pixel);
          without your consent, no data goes to X. The provider for users in the EU is Twitter International Unlimited
          Company, One Cumberland Place, Fenian Street, Dublin 2, D02 AX07, Ireland. X Corp. in the USA may also process
          the data; transfers to the USA are based on the EU Standard Contractual Clauses.
        </p>
        <p>
          With your consent, X sets cookies on our domain (<code>_twclid</code>, which stores the ad&apos;s click ID, as
          well as <code>_twpid</code> and <code>_twsid</code>; they are set for codext.de and therefore apply to all its
          subdomains) and receives technical data such as your IP address and browser information, the click ID of the ad,
          the pages you visit on our website (only their address without parameters, apart from campaign parameters and
          the click ID — never sign-in, sign-up or admin pages) and, where they happen, these actions: starting a checkout,
          clicking a link to our GitHub repository, your sign-up and your purchase including its value (sign-up and
          purchase identified by an opaque ID that X can&apos;t trace back to the payment, never a payment session ID).
          X&apos;s automatic event
          collection (for example button clicks and time on page) and its automatic matching of form fields are switched
          off. X may link this data to your X account. Purposes: measuring the success of our ads, optimizing their
          delivery and building audiences to show our ads on X again.
        </p>
        <p>
          Legal basis is your consent (Art. 6(1)(a) GDPR and § 25(1) TDDDG). We and X are jointly responsible for
          collecting the data on our website and transmitting it to X (Art. 26 GDPR); X alone is responsible for the
          further processing. You can withdraw your consent at any time with effect for the future under &ldquo;Privacy
          choices&rdquo; in the footer; we then delete X&apos;s cookies on our domain and no longer load the pixel. More
          information:{" "}
          <a href="https://x.com/en/privacy" target="_blank" rel="noopener">
            x.com/en/privacy
          </a>
          .
        </p>

        <h2>10. Data in your AutoSEO Cloud workspace</h2>
        <p>
          All AutoSEO Cloud customers use one shared AutoSEO instance that we operate. Each customer gets their own
          workspace; its data is stored in a shared database and logically separated from the workspaces of other
          customers. For personal data that you and your users store or process in your workspace (for example team
          members, clients or tracked content), you are the controller and we act as your processor under Art. 28 GDPR.
          We provide a data processing agreement on request — just email{" "}
          <a href={`mailto:${legal.email}`}>{legal.email}</a>.
        </p>
        <p>
          To provide AI and SEO data features, the instance sends the necessary request data — for example tracked
          prompts, brand and competitor names, domains and keywords — to the AI model providers and SEO data providers
          (such as DataForSEO) that we have configured; they act as our sub-processors. We provide the current list of
          sub-processors on request. If you connect your own Claude Code or Codex subscription through the local
          agent, those AI requests run on your machine under your own account. Services you connect yourself — such as
          Google Search Console, Google Analytics or project management tools — receive data according to your
          configuration and under their own terms.
        </p>

        <h2>11. Contacting us</h2>
        <p>
          If you contact us by email, we process your message and contact details to answer your request (Art. 6(1)(b)
          or (f) GDPR) and delete them when they are no longer needed, unless statutory retention obligations apply.
        </p>

        <h2>12. Links to GitHub and other sites</h2>
        <p>
          Our website links to the AutoSEO repository on GitHub and other external sites. No data is transferred to
          these sites until you click a link (our usage statistics only note that a link to GitHub was clicked, see
          section 5); after that, the provider&apos;s privacy policy applies.
        </p>

        <h2>13. Retention</h2>
        <p>
          We keep account data, including the sign-up attribution, for as long as you have an account. For the usage
          statistics, the daily random value is deleted after two days and the statistics data after 400 days at the
          latest (section 5). After your subscription ends, your workspace is
          paused and its data is deleted after 30 days. Invoices and bookkeeping records are retained for the periods
          required by German commercial and tax law (up to 10 years, § 257 HGB, § 147 AO).
        </p>

        <h2>14. Your rights</h2>
        <p>Under the GDPR, you have the right to:</p>
        <ul>
          <li>access your personal data (Art. 15 GDPR),</li>
          <li>rectification of inaccurate data (Art. 16 GDPR),</li>
          <li>erasure (Art. 17 GDPR) and restriction of processing (Art. 18 GDPR),</li>
          <li>data portability (Art. 20 GDPR),</li>
          <li>object to processing based on legitimate interests (Art. 21 GDPR),</li>
          <li>withdraw any consent you have given, with effect for the future (Art. 7(3) GDPR).</li>
        </ul>
        <p>
          To exercise these rights, email <a href={`mailto:${legal.email}`}>{legal.email}</a>. You also have the right
          to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR), for example the authority
          responsible for us: Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg,
          Lautenschlagerstraße 20, 70173 Stuttgart, Germany.
        </p>

        <h2>15. Security</h2>
        <p>
          All connections are encrypted with TLS. Within AutoSEO, stored secrets are encrypted with AES-256-GCM, and API
          keys and tokens are stored only as hashes. In AutoSEO Cloud, access to a workspace&apos;s data is restricted to
          the members of that workspace and, where needed to operate the service, to our administrators.
        </p>

        <h2>16. Changes</h2>
        <p>
          We update this policy when our services or legal requirements change. The current version is always available
          on this page. See also our <Link href="/terms">terms of service</Link> and <Link href="/imprint">imprint</Link>.
        </p>
      </LegalPage>
    </>
  );
}

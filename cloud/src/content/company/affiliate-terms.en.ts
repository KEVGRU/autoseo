import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const { legal } = site;

/** Date these terms were last changed (ISO). */
export const affiliateTermsUpdated = "2026-09-26";

const page: SitePage = {
  path: "/affiliate-terms",
  crumb: "Referral program terms",
  meta: {
    title: "AutoSEO Referral Program Terms",
    description:
      "General terms of the AutoSEO referral program by Codext GmbH: acceptance, prohibited practices, disclosure, trademarks, termination, liability and German law.",
  },
  hero: {
    eyebrow: "Legal",
    title: "Referral program terms",
    subtitle:
      "General terms for partners in the AutoSEO referral (affiliate) program. Your individual written agreement with Codext GmbH prevails wherever it differs.",
    updated: affiliateTermsUpdated,
  },
  sections: [
    {
      kind: "checklist",
      id: "summary",
      eyebrow: "Summary",
      title: "The terms in brief",
      items: [
        "Participation by application; Codext GmbH decides on acceptance",
        "Commission and payout are agreed individually in writing — there are no public rates",
        "No brand bidding, no trademarks in ads, no cookie stuffing, no spam, no misleading claims",
        "Every paid recommendation must be clearly disclosed",
        "German law applies; your individual written agreement prevails",
      ],
      aside: [
        { type: "h3", text: "Orientation only" },
        { type: "p", text: "This summary helps you find your way around. Only the full terms below and your individual agreement are binding." },
      ],
    },
    {
      kind: "prose",
      id: "terms",
      eyebrow: "Full terms",
      title: "General terms of the AutoSEO referral program",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Your individual agreement prevails",
          text: "Commission, duration, attribution and payout are agreed individually in writing. These general terms apply in addition. Where your individual written agreement differs from them, the individual agreement prevails.",
        },
        { type: "h2", text: "1. Scope and parties", id: "scope" },
        {
          type: "p",
          text: `These terms govern participation in the AutoSEO referral program (the “Program”). Your contractual partner is ${legal.name}, ${legal.street}, ${legal.postalCode} ${legal.city}, Germany, registered with the ${legal.registerCourt} under ${legal.registerNumber} (“Codext”, “we”, “us”). They apply to every person and company accepted into the Program (“Partner”, “you”).`,
        },
        { type: "h2", text: "2. Definitions", id: "definitions" },
        {
          type: "ul",
          items: [
            `**AutoSEO Cloud:** the paid, managed AutoSEO service offered by Codext at ${site.host}.`,
            "**Qualified referral:** a new customer who takes out a paid AutoSEO Cloud subscription as a result of your promotion, attributed by the method set out in your individual agreement, who was not already a customer, and whose referral complies with these terms.",
            `**Brand terms:** the names “AutoSEO” and “AutoSEO Cloud”, the AutoSEO logo, the domain ${site.host} and any misspellings, variations or combinations of them.`,
            "**Individual agreement:** the written agreement between you and Codext that sets out commission, duration, attribution and payout.",
          ],
        },
        { type: "h2", text: "3. Application and acceptance", id: "acceptance" },
        {
          type: "p",
          text: "Participation requires an application and our acceptance in text form (for example by email). We decide at our discretion and don't have to give reasons if we decline. No contractual relationship arises before acceptance and the conclusion of an individual agreement.",
        },
        {
          type: "p",
          text: "By applying, you confirm that your details are correct and complete and that you are entitled to enter into this agreement. You act as an independent business. The Program does not create an employment relationship, partnership, joint venture or agency, and you may not make or accept declarations on behalf of Codext.",
        },
        { type: "h2", text: "4. Commission and payout", id: "commission" },
        {
          type: "p",
          text: "Commission rates, the duration of commission, the attribution method, payout intervals and payout methods are set exclusively in your individual agreement. Unless it provides otherwise:",
        },
        {
          type: "ul",
          items: [
            "commission is only due for qualified referrals and is calculated on net amounts actually received by us, excluding VAT, refunds, chargebacks and disputed payments;",
            "we may withhold or reclaim commission for referrals that violate these terms, that are refunded or charged back, or where there are reasonable grounds to suspect fraud or manipulation;",
            "you are responsible for your own taxes and provide the information we need to issue a correct invoice or credit note.",
          ],
        },
        { type: "h2", text: "5. Prohibited practices", id: "prohibited" },
        {
          type: "p",
          text: "The following practices are prohibited. Referrals generated through them never qualify for commission, and a violation entitles us to terminate with immediate effect (section 9).",
        },
        { type: "h3", text: "5.1 Brand bidding and trademarks in ads" },
        {
          type: "ul",
          items: [
            "bidding on brand terms as keywords — in any match type, alone or combined with words such as “login”, “pricing”, “review”, “alternative”, “vs” or “coupon” — on Google Ads, Microsoft Advertising or any other advertising platform;",
            "using brand terms in ad titles, descriptions, display URLs, sitelinks or other ad components;",
            "ads that could be mistaken for official AutoSEO or Codext advertising;",
            "registering domains, social media accounts or app names that contain brand terms or are confusingly similar to them.",
          ],
        },
        { type: "h3", text: "5.2 Cookie stuffing and traffic hijacking" },
        {
          type: "ul",
          items: [
            "setting referral cookies or tracking parameters without a genuine, informed click by the user (cookie stuffing, forced clicks, hidden iframes or pixels);",
            "browser extensions, toolbars, adware or scripts that insert or overwrite referral links;",
            "typosquatting, and redirects from domains that imitate ours;",
            "referring yourself, existing customers or companies affiliated with you, unless agreed in writing.",
          ],
        },
        { type: "h3", text: "5.3 Misleading claims" },
        {
          type: "ul",
          items: [
            "false or unsubstantiated statements about AutoSEO, its features, prices or results — in particular promised rankings, guaranteed mentions in AI answers or invented customer results;",
            "fake reviews, testimonials or comparison tests;",
            "discount codes we did not issue to you, and pages that pretend to offer discounts;",
            "presenting yourself as Codext, as AutoSEO support or as an official partner beyond the Program.",
          ],
        },
        { type: "h3", text: "5.4 Spam and unsolicited messages" },
        {
          type: "ul",
          items: [
            "unsolicited emails, direct messages or calls, including in forums, communities and social networks, and any advertising without the recipient's legally required consent;",
            "pop-ups, pop-unders or other intrusive formats that push users to click a referral link;",
            "promotion on websites or channels with illegal, discriminatory, pornographic, violent or otherwise inappropriate content.",
          ],
        },
        { type: "h2", text: "6. Disclosure and advertising labelling", id: "disclosure" },
        {
          type: "p",
          text: "You must clearly disclose that you can earn a commission for recommending AutoSEO Cloud — directly next to the recommendation or link and before the user clicks. Hidden disclosures, for example only in a footer, behind a “more” link or among many hashtags, are not sufficient.",
        },
        {
          type: "p",
          text: "You are responsible for complying with the advertising and consumer protection rules that apply to your audience. These include, for example, the German Act Against Unfair Competition (UWG), the labelling requirements for commercial communication under the German Digital Services Act (DDG) and the Interstate Media Treaty (MStV), and — for audiences in the United States — the FTC Guides Concerning the Use of Endorsements and Testimonials in Advertising (16 CFR Part 255).",
        },
        {
          type: "p",
          text: "Suitable labels are, for example, “Advertisement”, “Affiliate link” or “I earn a commission if you sign up through this link”, in the language of your audience.",
        },
        { type: "h2", text: "7. Brand terms and materials", id: "brand" },
        {
          type: "p",
          text: "For the duration of your participation, we grant you a non-exclusive, non-transferable, revocable right to use the AutoSEO name, the logo and the screenshots from our [press kit](/press), solely to promote AutoSEO Cloud in accordance with these terms. You may not alter the logo, combine it with your own marks or use it in paid ads. All other rights remain with Codext. The MIT license of the AutoSEO source code grants no rights to the AutoSEO brand.",
        },
        { type: "h2", text: "8. Data protection", id: "data-protection" },
        {
          type: "p",
          text: "Each party is responsible for its own compliance with data protection law. In particular, you are responsible for obtaining any consent that tracking technologies on your own channels require. We process your personal data as a Partner to run the Program and to pay commission.",
        },
        { type: "h2", text: "9. Term and termination", id: "termination" },
        {
          type: "p",
          text: "Participation runs for an indefinite period. Either party may terminate it with 14 days' notice in text form, unless your individual agreement sets a different notice period. The right to terminate with immediate effect for good cause remains unaffected; good cause exists in particular for violations of sections 5 and 6.",
        },
        {
          type: "p",
          text: "After termination, you must remove referral links and our brand materials from your channels without undue delay. Commission for qualified referrals made before termination remains payable in accordance with your individual agreement, unless it was generated through a violation of these terms.",
        },
        { type: "h2", text: "10. Liability", id: "liability" },
        {
          type: "p",
          text: "We are liable without limitation for intent and gross negligence, for injury to life, body or health, and under the German Product Liability Act. For slight negligence, we are only liable for breaches of essential contractual obligations — obligations whose fulfilment makes the proper performance of the contract possible and on which you may regularly rely — limited to the foreseeable damage typical for this type of contract. Otherwise, our liability is excluded.",
        },
        {
          type: "p",
          text: "You indemnify us against third-party claims arising from your violation of these terms or of applicable law, including reasonable legal defence costs, unless you are not responsible for the violation. We do not guarantee uninterrupted availability of AutoSEO Cloud or of referral tracking, or any level of commission.",
        },
        { type: "h2", text: "11. Changes to these terms", id: "changes" },
        {
          type: "p",
          text: "We may change these general terms with effect for the future. We will inform you of changes in text form at least 30 days before they take effect. If you do not object within that period, the changes are deemed accepted; we will point this out in the notice. If you object, either party may terminate participation. Changes to these general terms never alter your individual agreement unless you agree.",
        },
        { type: "h2", text: "12. Governing law and jurisdiction", id: "law" },
        {
          type: "p",
          text: `These terms and all contracts under the Program are governed by the laws of the Federal Republic of Germany, excluding the UN Convention on Contracts for the International Sale of Goods. If you are a merchant, a legal entity under public law or have no general place of jurisdiction in Germany, the exclusive place of jurisdiction is the registered office of ${legal.name}.`,
        },
        { type: "h2", text: "13. Final provisions", id: "final" },
        {
          type: "p",
          text: "Amendments and additions must be made in text form. Should any provision be invalid, the validity of the remaining provisions is unaffected. Your individual written agreement takes precedence over these general terms. These terms are available in English and German; in case of discrepancies, the German version prevails.",
        },
        { type: "p", text: `Questions about these terms: [${legal.email}](mailto:${legal.email}).` },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions about the terms",
      items: [
        {
          q: "What applies if my individual agreement says something different?",
          a: "Your individual written agreement. These general terms cover everything the individual agreement doesn't regulate.",
        },
        {
          q: "May I run paid ads to promote AutoSEO Cloud?",
          a: "Not on AutoSEO brand terms, and not with AutoSEO trademarks in the ad. Other paid promotion of your own content is allowed as long as it complies with these terms, unless your individual agreement says otherwise.",
        },
        {
          q: "How do I label my recommendations correctly?",
          a: "Directly next to the recommendation or link and before anyone clicks, for example with “Advertisement” or “Affiliate link — I earn a commission if you sign up”. A note only in the footer or hidden among hashtags is not enough.",
        },
        {
          q: "What happens to my commission if participation ends?",
          a: "Commission for qualified referrals made before termination remains payable as set out in your individual agreement, unless those referrals were generated through a violation of these terms.",
        },
        {
          q: "Which law applies, and who is my contractual partner?",
          a: `German law, excluding the UN Convention on Contracts for the International Sale of Goods. Your contractual partner is ${legal.name}, ${legal.city}, Germany.`,
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Questions about the terms?",
      body: "Write to us before you start promoting — we'd rather clarify up front.",
      primary: { label: "Contact us", href: `mailto:${legal.email}?subject=Referral%20program%20terms` },
      secondary: { label: "Referral program", href: "/affiliate-program" },
    },
  ],
};

export default page;

/**
 * Shapes of the landing-page copy. One file per page and language lives in `catalog/en/*` and `catalog/de/*`;
 * `satisfies <Type>` keeps both languages complete. Plain strings only (no JSX), like `content.ts`.
 *
 * Copy rules: describe only what the open-source app really does (README.md and src/ in the repo root), no
 * invented customers, testimonials or market statistics. Numbers in `stats` are product facts (engines, markets,
 * MCP tools, audit checks …).
 */
import type {
  FeatureSlug,
  IntegrationCategorySlug,
  IntegrationSlug,
  PlatformSlug,
  SitePage,
  SolutionSlug,
} from "./routes";

/** Icons available to content (mapped to lucide-react in `icons.tsx`). */
export const iconNames = [
  "sparkles",
  "radar",
  "swords",
  "heart",
  "link",
  "git-fork",
  "shopping-bag",
  "megaphone",
  "chart",
  "euro",
  "bot",
  "shield-check",
  "list-checks",
  "file-text",
  "search",
  "trending-up",
  "gauge",
  "presentation",
  "terminal",
  "plug",
  "globe",
  "map-pin",
  "users",
  "building",
  "lock",
  "zap",
  "layers",
  "message-square",
  "calendar",
  "target",
  "eye",
  "workflow",
  "database",
  "key",
  "bell",
  "book",
  "lightbulb",
  "check-circle",
  "refresh",
  "download",
  "code",
  "server",
  "brain",
  "store",
  "stethoscope",
  "pill",
  "car",
  "plane",
  "landmark",
  "rocket",
  "newspaper",
  "headset",
  "pen",
  "flag",
] as const;
export type IconName = (typeof iconNames)[number];

/**
 * Decorative animated mock shown in a page hero (see `visuals/`). They carry no information that isn't also in
 * the page text and are hidden from assistive technology.
 */
export const visualKinds = [
  "answer",
  "ranking",
  "sentiment",
  "sources",
  "fanout",
  "prompts",
  "products",
  "traffic",
  "bots",
  "audit",
  "tasks",
  "content",
  "factcheck",
  "keywords",
  "rankchart",
  "report",
  "agent",
  "terminal",
  "integrations",
  "globe",
] as const;
export type VisualKind = (typeof visualKinds)[number];

export type Faq = { q: string; a: string };

/** A two-tone heading: `title` in full contrast, `muted` (optional) in grey right after it. */
export type Heading = { eyebrow: string; title: string; muted?: string };

export type Card = { icon: IconName; title: string; body: string };
export type Point = { title: string; body: string };

/** Product fact with a count-up animation, e.g. { value: 11, label: "AI engines" }. */
export type Stat = { value: number; decimals?: number; prefix?: string; suffix?: string; label: string; note?: string };

export type Screenshot = { src: string; darkSrc?: string; alt: string; url: string };

export type PageMeta = {
  /** ≤ 50 characters: the layout appends " · AutoSEO". */
  title: string;
  /** 140–160 characters. */
  description: string;
};

export type PageHeroCopy = {
  /** Short label above the h1, e.g. the page topic. */
  eyebrow: string;
  /** h1, first part in full contrast … */
  title: string;
  /** … second part in grey (optional). */
  muted?: string;
  subtitle: string;
};

export type FeaturePage = {
  /** File name without .ts (checked by scripts/check-landing-copy.mts; a FeatureSlug once registered in routes.ts). */
  slug: string;
  /** Label in footer, menus and related-page cards (2–4 words). */
  nav: string;
  /** One sentence for menus and related-page cards (≤ 90 characters). */
  summary: string;
  meta: PageMeta;
  hero: PageHeroCopy;
  visual: VisualKind;
  /** Real product screenshot from /public/screenshots (only where one exists). */
  screenshot?: Screenshot;
  /** 3–4 product facts. */
  stats: Stat[];
  /** Why the topic matters: short intro plus 3 points. */
  why: Heading & { body: string; points: Point[] };
  /** What the feature does: exactly 6 cards. */
  capabilities: Heading & { items: Card[] };
  /** How it works: 3–4 steps. */
  steps: Heading & { items: Point[] };
  /** 6–8 questions people search for; answers 2–4 sentences. */
  faq: Faq[];
  /** 3–4 other feature pages. */
  related: FeatureSlug[];
  cta: { title: string; subtitle: string };
};

export type PlatformPage = {
  /** File name without .ts (checked by scripts/check-landing-copy.mts; a PlatformSlug once registered in routes.ts). */
  slug: string;
  /** Engine name as used in text, e.g. "ChatGPT", "Google AI Overviews". */
  name: string;
  vendor: string;
  /** Footer / menu label, e.g. "ChatGPT tracking". */
  nav: string;
  summary: string;
  meta: PageMeta;
  hero: PageHeroCopy;
  /** Animated sample answer in the hero. Generic example brand is "Acme". */
  demo: { prompt: string; answer: string; citations: string[] };
  why: Heading & { body: string; points: Point[] };
  /** How AutoSEO gets answers from this engine (DataForSEO, direct API, local agent — as in src/lib/engines.ts). */
  method: Heading & { body: string; items: Point[] };
  /** What is tracked: exactly 6 cards. */
  tracked: Heading & { items: Card[] };
  /**
   * The engine's crawlers and what they do — only robots.txt tokens listed in AI_BOTS (src/lib/engines.ts).
   * Leave out for engines without a known crawler.
   */
  crawlers?: Heading & { body: string; bots: { token: string; purpose: string }[] };
  faq: Faq[];
  cta: { title: string; subtitle: string };
};

export type SolutionPage = {
  /** File name without .ts (checked by scripts/check-landing-copy.mts; a SolutionSlug once registered in routes.ts). */
  slug: string;
  /** Footer / menu label, e.g. "For agencies". */
  nav: string;
  summary: string;
  meta: PageMeta;
  hero: PageHeroCopy;
  visual: VisualKind;
  /** The team's or industry's problems with AI search: 3 points. */
  challenges: Heading & { items: Point[] };
  /** How AutoSEO helps: 4–6 cards, each linked to a feature page. */
  workflow: Heading & { items: (Card & { feature: FeatureSlug })[] };
  /** Example prompts this audience should track (5–8, realistic, no real brand names except "Acme"). */
  prompts: Heading & { items: string[] };
  /** 3 short outcomes/benefits. */
  outcomes: Heading & { items: Point[] };
  faq: Faq[];
  related: SolutionSlug[];
  cta: { title: string; subtitle: string };
};

export type IntegrationStatus = "beta" | "coming-soon";

export type IntegrationCategoryPage = {
  /** File name without .ts (checked by scripts/check-landing-copy.mts; a IntegrationCategorySlug once registered in routes.ts). */
  slug: string;
  /** Footer / menu label, e.g. "CMS integrations". */
  nav: string;
  summary: string;
  meta: PageMeta;
  hero: PageHeroCopy;
  /** What connecting tools of this category unlocks: 3–4 cards. */
  benefits: Heading & { items: Card[] };
  faq: Faq[];
  cta: { title: string; subtitle: string };
};

export type IntegrationPage = {
  /** File name without .ts (checked by scripts/check-landing-copy.mts; a IntegrationSlug once registered in routes.ts). */
  slug: string;
  /** Vendor product name, e.g. "WordPress". */
  name: string;
  nav: string;
  summary: string;
  meta: PageMeta;
  hero: { subtitle: string };
  /** What you get: 4–6 short bullets. */
  overview: Heading & { items: string[] };
  /** Things you can do with it: 3–5 cards. */
  useCases: Heading & { items: Card[] };
  /** Setup steps as in the app (3–5). */
  setup: Heading & { items: Point[] };
  faq: Faq[];
  cta: { title: string; subtitle: string };
};

/** One entry of the integrations directory (the app's catalog in src/lib/integrations-catalog.ts). */
export type DirectoryEntry = {
  key: string;
  name: string;
  category: IntegrationCategorySlug;
  /** Vendor domain (shown as text only). */
  domain?: string;
  /** Monogram color. */
  color: string;
  status?: IntegrationStatus;
  /** Own landing page. */
  page?: IntegrationSlug;
  /** Covered by a product page instead (e.g. the REST API and MCP server). */
  feature?: FeatureSlug;
};

export type IntegrationsHubPage = {
  meta: PageMeta;
  hero: PageHeroCopy;
  /** Localized one-line description per directory key. */
  descriptions: Record<string, string>;
  categories: Heading;
  faq: Faq[];
  cta: { title: string; subtitle: string };
};

/** /security: security & data protection overview (SECURITY.md and the README's security section). */
export type SecurityPage = {
  meta: PageMeta;
  hero: PageHeroCopy;
  /** Exactly 6 cards. */
  pillars: Heading & { items: Card[] };
  /** Where data lives, for Cloud and self-hosted: 2–3 points. */
  data: Heading & { body: string; items: Point[] };
  /** Checklist of concrete controls (6–10). */
  controls: Heading & { items: string[] };
  disclosure: { title: string; body: string; advisoryLabel: string; emailLabel: string };
  faq: Faq[];
  cta: { title: string; subtitle: string };
};

/** /support: how to get help. */
export type SupportPage = {
  meta: PageMeta;
  hero: PageHeroCopy;
  /** Contact channels; `href` is a mailto:/https:// URL or a site path such as "/security" (localized automatically). */
  channels: Heading & { items: (Card & { href: string; action: string })[] };
  /** Self-service resources (guides, repository, llms.txt …). */
  resources: Heading & { items: { title: string; body: string; href: string }[] };
  faq: Faq[];
  cta: { title: string; subtitle: string };
};

/** All landing-page copy of one language. */
export type LandingCatalog = {
  ui: LandingUi;
  features: Record<FeatureSlug, FeaturePage>;
  platforms: Record<PlatformSlug, PlatformPage>;
  solutions: Record<SolutionSlug, SolutionPage>;
  integrationCategories: Record<IntegrationCategorySlug, IntegrationCategoryPage>;
  integrations: Record<IntegrationSlug, IntegrationPage>;
  integrationsHub: IntegrationsHubPage;
  security: SecurityPage;
  support: SupportPage;
};

/** Interface strings of the landing-page templates. */
export type LandingUi = {
  home: string;
  /** Accessible name of the breadcrumb navigation. */
  breadcrumb: string;
  product: string;
  platforms: string;
  solutions: string;
  integrations: string;
  company: string;
  legal: string;
  primaryCta: string;
  secondaryCta: string;
  learnMore: string;
  faqEyebrow: string;
  faqTitle: string;
  relatedFeatures: string;
  otherPlatforms: string;
  otherPlatformsMuted: string;
  relatedSolutions: string;
  moreIntegrations: string;
  allIntegrations: string;
  viewAll: string;
  status: Record<IntegrationStatus, string>;
  /** `{n}` is replaced with the number of integrations. */
  integrationCount: string;
  byTeam: string;
  byIndustry: string;
  menu: {
    aiVisibility: string;
    seo: string;
    analytics: string;
    optimize: string;
    developers: string;
  };
  factsLabel: string;
  trackedIn: string;
  howItWorks: string;
  step: string;
  engineBy: string;
  answerFrom: string;
  mentioned: string;
  cited: string;
  sources: string;
  stickyTitle: string;
  /** Heading of the related-features section. */
  relatedTitle: string;
  relatedMuted: string;
  /** Heading of the related-solutions section. */
  solutionsTitle: string;
  solutionsMuted: string;
  /** Heading of the "other integrations" section. */
  integrationsTitle: string;
  /** h1 of an integration page; `{name}` is the product name. */
  integrationTitle: string;
  securityNav: string;
  supportNav: string;
  allSolutions: string;
  resources: string;
  /** Labels of the company, resources and facts pages (built outside this catalog). */
  pages: Record<SitePage, string>;
  /** New homepage sections. */
  homepage: {
    sphere: Heading & { body: string; center: string; centerSub: string };
    /** Labels around the sphere, each linked to a solution page (same order as `sphereSolutions` in home). */
    sphereLabels: string[];
    stats: Stat[];
    platform: Heading & { body: string };
  };
  /** Label of the example-prompts list on solution pages. */
  promptsHint: string;
  /** /solutions hub page. */
  solutionsHub: { meta: PageMeta; hero: PageHeroCopy; teams: Heading; industries: Heading };
};

import Link from "next/link";
import { Star } from "lucide-react";
import { site } from "@/lib/site";
import { getLanding } from "./catalog";
import { integrationsPath, platformPath, platformSlugs } from "./catalog/routes";
import { HeaderMenus, type Menu } from "./header-menu";
import { getCopy } from "./i18n";
import { siteNav } from "./landing/nav";
import { LanguageSwitch } from "./language-switch";
import { localizeHref, type Locale } from "./locales";
import { CtaLink, Container, GitHubIcon, Logo } from "./primitives";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

const navLink =
  "rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none";

export function SiteHeader({ locale = "en" }: { locale?: Locale }) {
  const { mainNav, authLinks, ui } = getCopy(locale);
  const { ui: landing, platforms } = getLanding(locale);
  const nav = siteNav(locale);
  const [aiVisibility, ...otherGroups] = nav.productGroups;
  const features = mainNav.find((item) => item.href.endsWith("#features"));
  const plainLinks = mainNav.filter((item) => item !== features);

  const menus: Menu[] = [
    {
      id: "menu-product",
      label: landing.product,
      columns: [
        { title: aiVisibility.title, links: aiVisibility.links, layout: "wide" },
        { title: otherGroups[0].title, links: otherGroups[0].links, more: [otherGroups[3]] },
        { title: otherGroups[1].title, links: otherGroups[1].links, more: [otherGroups[2]] },
      ],
      chips: {
        label: landing.trackedIn,
        links: platformSlugs.map((s) => ({ label: platforms[s].name, href: localizeHref(platformPath(s), locale) })),
      },
      footer: features ? { label: features.label, href: features.href } : undefined,
    },
    {
      id: "menu-solutions",
      label: landing.solutions,
      columns: [
        { title: landing.byTeam, links: nav.solutionsByTeam, layout: "wide" },
        { title: landing.byIndustry, links: nav.solutionsByIndustry, layout: "split" },
      ],
      footer: nav.solutionsHub,
    },
    {
      id: "menu-resources",
      label: landing.resources,
      columns: [
        { title: landing.resources, links: nav.resources.filter((l) => !/^https?:/.test(l.href)), layout: "split" },
        { title: landing.company, links: nav.company.slice(0, 6) },
      ],
      footer: nav.resources.find((l) => l.href.endsWith("/ai-visibility-check")),
    },
  ];

  return (
    <header className="mk-header sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/70">
      <Container className="flex h-16 max-w-7xl items-center gap-4">
        <Logo href={ui.homeHref} className="focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none" />
        <nav aria-label={ui.mainNavLabel} className="ml-4 hidden items-center gap-0.5 lg:flex xl:ml-6">
          <HeaderMenus menus={menus} />
          <Link href={localizeHref(integrationsPath, locale)} className={navLink}>
            {landing.integrations}
          </Link>
          {plainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href.includes("self-hosting") ? `${navLink} hidden 2xl:inline-flex` : navLink}
            >
              {item.label}
            </Link>
          ))}
          <a href={site.github} target="_blank" rel="noopener" className={`${navLink} hidden items-center gap-1.5 xl:inline-flex`}>
            <GitHubIcon />
            {ui.github}
            <Star className="size-3.5" aria-hidden="true" />
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LanguageSwitch label={ui.language} landmark className="hidden sm:inline-flex" />
          <ThemeToggle label={ui.toggleTheme} />
          <Link href={authLinks.login.href} prefetch={false} className={`${navLink} hidden sm:inline-flex`}>
            {authLinks.login.label}
          </Link>
          <CtaLink href={authLinks.signup.href} size="sm" className="px-3.5 sm:px-4">
            {authLinks.signup.label}
          </CtaLink>
          <MobileNav
            nav={mainNav}
            sections={[
              { title: landing.product, links: nav.product },
              { title: landing.platforms, links: nav.platforms },
              { title: landing.solutions, links: [...nav.solutionsByTeam, ...nav.solutionsByIndustry] },
              { title: landing.integrations, links: nav.integrations.slice(0, 8) },
              { title: landing.resources, links: nav.resources.filter((l) => !/^https?:/.test(l.href)) },
              { title: landing.company, links: nav.company.slice(0, 8) },
            ]}
            login={authLinks.login}
            signup={authLinks.signup}
            labels={{
              menu: ui.menu,
              openMenu: ui.openMenu,
              closeMenu: ui.closeMenu,
              navLabel: ui.mobileNavLabel,
              language: ui.language,
              github: ui.github,
            }}
          />
        </div>
      </Container>
    </header>
  );
}

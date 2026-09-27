import { site } from "@/lib/site";
import { PrivacyChoicesButton } from "@/components/analytics/consent";
import { getLanding } from "./catalog";
import { getCopy } from "./i18n";
import { siteNav, type NavLink } from "./landing/nav";
import { LanguageSwitch } from "./language-switch";
import type { Locale } from "./locales";
import { Container, GitHubIcon, Logo, SmartLink } from "./primitives";

const linkClass =
  "rounded-sm text-sm leading-5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none";

function Column({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <SmartLink href={link.href} className={linkClass}>
              {link.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Site footer with every landing page (product, AI platforms, solutions, integrations, company, legal). Always dark:
 * the `dark` class re-points the color tokens for this subtree only.
 */
export function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const { footer, ui } = getCopy(locale);
  const landing = getLanding(locale).ui;
  const nav = siteNav(locale);
  const { legal } = site;
  const year = new Date().getFullYear();

  return (
    <footer className="dark relative overflow-hidden border-t bg-background text-foreground">
      <div className="mk-dots-light pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_40%)]" aria-hidden="true" />
      <Container className="relative max-w-7xl py-14 sm:py-16">
        <div className="flex flex-col gap-8 border-b pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Logo href={ui.homeHref} className="focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none" />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{footer.tagline}</p>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-10">
            <address className="text-sm leading-6 text-muted-foreground not-italic">
              {legal.name}
              <br />
              {legal.street}
              <br />
              {legal.postalCode} {legal.city}, {legal.country}
            </address>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={site.github}
                target="_blank"
                rel="noopener"
                className="inline-flex h-9 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
              >
                <GitHubIcon />
                {ui.starOnGitHub}
              </a>
              <LanguageSwitch label={ui.language} />
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <Column title={landing.product} links={nav.product} />
          <Column title={landing.platforms} links={nav.platforms} />
          <Column title={landing.solutions} links={[...nav.solutionsByTeam, ...nav.solutionsByIndustry, nav.solutionsHub]} />
          <Column title={landing.integrations} links={nav.integrations} />
          <Column title={landing.resources} links={nav.resources} />
          <Column title={landing.company} links={nav.company} />
          <Column title={nav.legalTitle} links={nav.legal} />
        </div>

        {footer.note && <p className="mt-12 text-sm text-muted-foreground">{footer.note}</p>}
        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year}{" "}
            <a href={legal.website} target="_blank" rel="noopener" className="hover:text-foreground">
              {site.company}
            </a>
            . {footer.copyright}
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <PrivacyChoicesButton
              label={locale === "de" ? "Datenschutz-Einstellungen" : "Privacy choices"}
              className="underline-offset-4 hover:text-foreground hover:underline"
            />
            <span>{footer.madeBy}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}

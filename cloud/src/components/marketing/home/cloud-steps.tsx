import { AtSign, Building2, Rocket, type LucideIcon } from "lucide-react";
import type { MarketingCopy } from "../content";
import { getCopy } from "../i18n";
import type { Locale } from "../locales";
import { CtaLink, Container, SectionHeading } from "../primitives";

const stepIcons: LucideIcon[] = [AtSign, Building2, Rocket];

export function CloudSteps({ locale = "en" }: { locale?: Locale }) {
  const { steps } = getCopy(locale);
  return (
    <section id="cloud" aria-labelledby="cloud-title" className="scroll-mt-20 border-y bg-card/60 py-20 sm:py-28">
      <Container>
        <SectionHeading id="cloud-title" eyebrow={steps.eyebrow} title={steps.title} subtitle={steps.subtitle} />
        <ol className="relative mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.items.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <li key={step.title} className="relative flex flex-col rounded-2xl border bg-background p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-foreground text-background">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {steps.stepLabel} {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight break-words">{step.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">{step.body}</p>
                {i === 0 && <EmailMock mocks={steps.mocks} />}
                {i === 1 && <WorkspaceMock mocks={steps.mocks} />}
                {i === 2 && <ReadyMock mocks={steps.mocks} />}
              </li>
            );
          })}
        </ol>
        <div className="mt-10 flex justify-center">
          <CtaLink href={steps.cta.href} size="lg" arrow>
            {steps.cta.label}
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}

type Mocks = MarketingCopy["steps"]["mocks"];

function EmailMock({ mocks }: { mocks: Mocks }) {
  return (
    <div aria-hidden="true" className="mt-6 rounded-xl border bg-card p-3 text-sm">
      <div className="rounded-lg border bg-background px-3 py-2 text-muted-foreground">{mocks.email}</div>
      <div className="mt-2 rounded-lg bg-primary px-3 py-2 text-center font-medium text-primary-foreground">
        {mocks.sendLink}
      </div>
    </div>
  );
}

function WorkspaceMock({ mocks }: { mocks: Mocks }) {
  return (
    <div aria-hidden="true" className="mt-6 flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-sm">
      <span className="text-muted-foreground">{mocks.workspaceLabel}</span>
      <span className="truncate font-medium">{mocks.workspaceName}</span>
      <span className="ml-auto shrink-0 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
        {mocks.plan}
      </span>
    </div>
  );
}

function ReadyMock({ mocks }: { mocks: Mocks }) {
  return (
    <div aria-hidden="true" className="mt-6 flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-sm">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
      </span>
      <span className="font-medium">{mocks.running}</span>
      <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{mocks.open}</span>
    </div>
  );
}

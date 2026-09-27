import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { VisualKind } from "../catalog/types";
import type { Locale } from "../locales";
import {
  AnswerVisual,
  FactcheckVisual,
  FanoutVisual,
  ProductsVisual,
  PromptsVisual,
  RankingVisual,
  SentimentVisual,
  SourcesVisual,
  type AnswerDemo,
} from "./ai";
import {
  AgentVisual,
  AuditVisual,
  BotsVisual,
  ContentVisual,
  GlobeVisual,
  IntegrationsVisual,
  KeywordsVisual,
  RankchartVisual,
  ReportVisual,
  TasksVisual,
  TerminalVisual,
  TrafficVisual,
} from "./work";

/** Renders the decorative mock for a page. `slug` picks variants (MCP vs. REST terminal, ads vs. shopping cards). */
export function Visual({
  kind,
  locale,
  slug,
  demo,
  className,
}: {
  kind: VisualKind;
  locale: Locale;
  slug?: string;
  demo?: AnswerDemo;
  className?: string;
}) {
  const props = { locale, className };
  switch (kind) {
    case "answer":
      return <AnswerVisual {...props} demo={demo} />;
    case "ranking":
      return <RankingVisual {...props} />;
    case "sentiment":
      return <SentimentVisual {...props} />;
    case "sources":
      return <SourcesVisual {...props} />;
    case "fanout":
      return <FanoutVisual {...props} />;
    case "prompts":
      return <PromptsVisual {...props} />;
    case "products":
      return <ProductsVisual {...props} ads={slug === "ai-ads-tracking"} />;
    case "traffic":
      return <TrafficVisual {...props} />;
    case "bots":
      return <BotsVisual {...props} />;
    case "audit":
      return <AuditVisual {...props} />;
    case "tasks":
      return <TasksVisual {...props} />;
    case "content":
      return <ContentVisual {...props} />;
    case "factcheck":
      return <FactcheckVisual {...props} />;
    case "keywords":
      return <KeywordsVisual {...props} />;
    case "rankchart":
      return <RankchartVisual {...props} />;
    case "report":
      return <ReportVisual {...props} />;
    case "agent":
      return <AgentVisual {...props} />;
    case "terminal":
      return <TerminalVisual variant={slug === "mcp-server" ? "mcp" : "api"} className={className} />;
    case "integrations":
      return <IntegrationsVisual {...props} />;
    case "globe":
      return <GlobeVisual {...props} />;
  }
}

/** Equalizer-like chart bars along the bottom of a dark stage. */
export function StageBars({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" data-loop="" className={cn("pointer-events-none flex items-end justify-between", className)}>
      {Array.from({ length: 56 }, (_, i) => (
        <span
          key={i}
          className="mk-eq w-px origin-bottom bg-gradient-to-t from-white/0 via-white/25 to-white/70"
          style={{ height: `${25 + ((i * 53) % 75)}%`, ["--i" as string]: i, ["--mk-eq" as string]: `${2.4 + (i % 5) * 0.5}s` }}
        />
      ))}
    </div>
  );
}

/**
 * Dark hero stage (finseo-style): green light, dotted texture, animated bars, and the page's mock (plus an optional
 * screenshot) on top. Tilts flat as it scrolls into view.
 */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-loop="" className={cn("mk-tilt mk-stage relative overflow-hidden rounded-3xl border border-white/10 text-white", className)}>
      <div className="mk-dots-light absolute inset-0 opacity-60" aria-hidden="true" />
      <StageBars className="absolute inset-x-6 bottom-0 h-2/5 opacity-70" />
      <div className="relative">{children}</div>
    </div>
  );
}

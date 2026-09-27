import { site } from "@/lib/site";
import { CATEGORY_SUITES, CATEGORY_TOOLS, counts, ENGINE_FACTS, FACTS_UPDATED, INTEGRATION_FACTS, wikidata } from "./data";
import { entityConnectionsEn } from "./entity-connections.en";
import { backendLabel, integrationCategory } from "./tables";
import type { Entity, EntityGroup, EntityMap } from "./types";

const { legal } = site;

/**
 * German entity map. Identifiers, relationship predicates and evidence quotes are the same as in English (quotes
 * stay verbatim in the language of their source); names, kinds and descriptions are translated here.
 */
const de: Record<string, Pick<Entity, "kind" | "description"> & { name?: string; members?: Entity["members"] }> = {
  "codext-gmbh": {
    kind: "Organisation",
    description: `Deutsches Softwareunternehmen (GmbH), das AutoSEO entwickelt und veröffentlicht und AutoSEO Cloud betreibt. Sitz: ${legal.street}, ${legal.postalCode} ${legal.city}, Deutschland; Handelsregister ${legal.registerCourt}, ${legal.registerNumber}; USt-IdNr. ${legal.vatId}.`,
  },
  wolpertshausen: {
    name: `${legal.city}, Deutschland`,
    kind: "Ort",
    description: `Gemeinde in Baden-Württemberg, Deutschland; Sitz der ${legal.name}.`,
  },
  autoseo: {
    kind: "Softwareanwendung",
    description:
      "Open-Source-Plattform (MIT) für KI-Sichtbarkeit (GEO/AEO) und SEO. Misst, wie KI-Suchmaschinen eine Marke zu getrackten Prompts nennen, einordnen und zitieren, ergänzt um Keyword-Recherche, Rank-Tracking, Backlinks, Site-Audits, Search Console, GA4, Attribution, Content-Werkzeuge und White-Label-Reports. Kostenlos selbst gehostet oder als AutoSEO Cloud nutzbar.",
  },
  repository: {
    kind: "Quellcode-Repository",
    description: "Öffentliches GitHub-Repository mit dem vollständigen Quellcode von AutoSEO (TypeScript), dem Self-Hosting-Setup und der Website von AutoSEO Cloud.",
  },
  "docker-image": {
    kind: "Container-Image",
    description: "Vorgefertigtes Docker-Image von AutoSEO in der GitHub Container Registry, genutzt vom Einzeiler-Installer, von Docker Compose und von Coolify-Deployments.",
  },
  "mit-license": {
    name: "MIT-Lizenz",
    kind: "Softwarelizenz",
    description: "Freizügige Open-Source-Lizenz, unter der der Quellcode von AutoSEO veröffentlicht ist.",
  },
  website: {
    kind: "Website",
    description: "Offizielle Website von AutoSEO: Produktinformationen, Preise, Self-Hosting-Anleitung, Registrierung und Abrechnung für AutoSEO Cloud.",
  },
  "autoseo-cloud": {
    kind: "Dienst (verwaltetes Hosting)",
    description: `Verwaltetes AutoSEO, betrieben von der ${legal.name}: Jede Kundin und jeder Kunde erhält einen Workspace in einer gemeinsamen, verwalteten Instanz in Deutschland, mit allen Funktionen, unbegrenzter Nutzerzahl, bis zu ${site.cloudPlan.projects} Projekten und Nutzung von KI und Daten im Wert von ${site.cloudPlan.includedUsageUsd} $ pro Monat, für ${site.priceMonthlyUsd} $ pro Workspace und Monat (zzgl. USt., für Geschäftskunden).`,
  },
  "tech-stack": {
    name: "Technologie-Stack von AutoSEO",
    kind: "Technologie",
    description: "Technologien, mit denen AutoSEO entwickelt ist und auf denen es läuft.",
  },
  "free-check": {
    name: "AutoSEO KI-Sichtbarkeits-Check",
    kind: "Kostenloses Web-Tool",
    description: "Kostenloser Sofort-Check auf der AutoSEO-Website, ob KI-Crawler eine Website erreichen und lesen können: robots.txt-Regeln für 15 KI- und Such-Crawler, serverseitig gerenderte Inhalte, strukturierte Daten, Metadaten, llms.txt, Sitemap und HTTP-Grundlagen.",
  },
  "rest-api": {
    kind: "Web-API",
    description: "HTTP-API jeder AutoSEO-Instanz unter /api/v1 mit OpenAPI-Spezifikation unter /api/v1/openapi.json; Authentifizierung per OAuth 2.1 oder API-Keys mit den Scopes read, write, spend und export.",
  },
  "mcp-server": {
    kind: "Model-Context-Protocol-Server",
    description: `MCP-Server jeder AutoSEO-Instanz unter /api/mcp (Streamable HTTP, JSON-Antworten, Protokollversionen 2024-11-05 bis 2025-11-25) mit ${counts.mcpTools} Tools in ${counts.mcpToolGroups} Gruppen, für Claude Code, Codex, Cursor und andere MCP-Clients.`,
  },
  "local-agent": {
    name: "Lokaler AutoSEO-Agent",
    kind: "Softwarekomponente",
    description: "Schlanker Agent, der das Claude Code oder Codex CLI einer Person mit einer AutoSEO-Instanz verbindet (nur ausgehendes HTTPS, signierte Selbst-Updates), sodass KI-Aufgaben über das eigene Abonnement laufen.",
  },
  "ai-engines": {
    name: "Von AutoSEO überwachte KI-Suchmaschinen",
    kind: "Konzept (Liste von KI-Suchmaschinen)",
    description: `${counts.engines} Engine-Oberflächen von ${counts.engineVendors} Anbietern, deren Antworten AutoSEO erfasst und analysiert. Backends je Engine: ${Object.values(backendLabel.de).join(", ")}.`,
    members: ENGINE_FACTS.map((e) => ({
      name: `${e.name} — ${e.vendor}`,
      detail: e.backends.map((b) => backendLabel.de[b]).join(", "),
      href: e.wikidata?.product ? wikidata(e.wikidata.product) : e.wikidata?.vendor ? wikidata(e.wikidata.vendor) : undefined,
    })),
  },
  dataforseo: {
    kind: "Externer Datenanbieter",
    description: "API für SEO- und KI-Daten, die AutoSEO als Backend für Antworten von KI-Suchmaschinen (AI Optimization und SERP API) und für gemessene SEO-Daten nutzen kann – beim Selbsthosten mit dem eigenen Konto.",
  },
  methodology: {
    name: "Messmethodik von AutoSEO",
    kind: "Methode",
    description: "Eine gespeicherte Antwort pro Prompt, Engine und Tag; jeder Prompt wird für seinen Markt gestellt; Metriken werden über Zeiträume berichtet und mit dem Vorzeitraum verglichen, weil Antworten von Lauf zu Lauf schwanken.",
  },
  metrics: {
    name: "Metriken der KI-Sichtbarkeit in AutoSEO",
    kind: "Metrik-Set",
    description: "Veröffentlichte Metrik-Definitionen; die Formeln stehen im Faktenblatt.",
    members: [
      { name: "Sichtbarkeit (Visibility)", detail: "Antworten, die die Marke nennen oder zitieren ÷ alle Antworten" },
      { name: "Mention Rate", detail: "Antworten, die die Marke nennen ÷ alle Antworten" },
      { name: "Mentions", detail: "jede Nennung des Markennamens" },
      { name: "Citation Rate", detail: "Antworten, die Domains der Marke zitieren ÷ alle Antworten" },
      { name: "Zitierungen (Citations)", detail: "Antworten, die Domains der Marke zitieren, einmal pro Antwort" },
      { name: "Citation Share", detail: "Zitierungen der Marke ÷ Zitierungen aller Marken im Set" },
      { name: "Share of Voice", detail: "Antworten, die die Marke nennen ÷ Auftritte aller Marken im Set" },
      { name: "Durchschnittliche Position", detail: "Summe der Positionen ÷ Antworten, die die Marke nennen" },
      { name: "#1-Anteil / Top-3-Anteil", detail: "Antworten mit Position 1 / 1–3 ÷ Antworten, die die Marke nennen" },
      { name: "Head-to-Head", detail: "Siege ÷ (Siege + Niederlagen) gegen einen Wettbewerber" },
      { name: "Mention Depth", detail: "Offset der ersten Nennung ÷ Länge der Antwort" },
      { name: "Sentiment", detail: "0–100 aus einer LLM-Analyse" },
    ],
  },
  geo: {
    kind: "Definierter Begriff (Kategorie)",
    description: "Messen und Verbessern, wie eine Marke in KI-generierten Antworten beschrieben, eingeordnet und zitiert wird; auch Answer Engine Optimization (AEO), KI-Suchmaschinenoptimierung, KI-Sichtbarkeit oder LLM-Optimierung (LLMO) genannt.",
  },
  seo: {
    name: "Suchmaschinenoptimierung (SEO)",
    kind: "Definierter Begriff (Kategorie)",
    description: "Verbesserung der Sichtbarkeit einer Website in den Ergebnissen von Suchmaschinen; AutoSEO enthält neben der KI-Sichtbarkeit eine klassische SEO-Suite.",
  },
  "category-tools": {
    name: "Tools derselben Kategorie",
    kind: "Konzept (Vergleichsgruppe)",
    description: "Weitere Produkte der Kategorie KI-Sichtbarkeit / GEO, genannt ohne Aussagen über deren Funktionen oder Preise.",
    members: [...CATEGORY_TOOLS.map((name) => ({ name })), ...CATEGORY_SUITES.map((name) => ({ name, detail: "KI-Sichtbarkeitsfunktionen einer SEO-Suite" }))],
  },
};

const statusDe = { beta: "Beta", coming_soon: "in Vorbereitung" } as const;

/** Relationship targets that are descriptions rather than names. */
const targetDe: Record<string, string> = {
  Germany: "Deutschland",
  [`${legal.city}, Germany`]: `${legal.city}, Deutschland`,
  [`${legal.managingDirector} (managing director)`]: `${legal.managingDirector} (Geschäftsführer)`,
  [`${legal.name} (GitHub organization codextde)`]: `${legal.name} (GitHub-Organisation codextde)`,
  [`${site.image} (Docker image)`]: `${site.image} (Docker-Image)`,
  [`$${site.priceMonthlyUsd} per workspace per month`]: `${site.priceMonthlyUsd} $ pro Workspace und Monat`,
  [`${counts.engines} AI engines`]: `${counts.engines} KI-Suchmaschinen`,
  "Analytics, Search Console, bot traffic, reporting, project management, attribution and CMS tools":
    "Tools für Analytics, Search Console, Bot-Traffic, Reporting, Projektmanagement, Attribution und CMS",
  "Generative engine optimization (GEO); search engine optimization (SEO)": "Generative Engine Optimization (GEO); Suchmaschinenoptimierung (SEO)",
  "Search engine optimization (SEO)": "Suchmaschinenoptimierung (SEO)",
  "AutoSEO (optional backend)": "AutoSEO (optionales Backend)",
  "OpenAPI specification (/api/v1/openapi.json)": "OpenAPI-Spezifikation (/api/v1/openapi.json)",
  "AutoSEO metrics": "Metriken von AutoSEO",
  "MIT License": "MIT-Lizenz",
};

function translateEntity(e: Entity): Entity {
  if (e.id.startsWith("integrations-")) {
    const key = INTEGRATION_FACTS.find((c) => `integrations-${c.key.replace(/_/g, "-")}` === e.id)!;
    const cat = integrationCategory.de[key.key];
    return {
      ...e,
      name: `Integrationen: ${cat.label}`,
      kind: "Integrationskategorie",
      description: `${cat.purpose}.`,
      identifiers: e.identifiers.map((i) => ({ ...i, label: i.label.replace("Source:", "Quelle:") })),
      relations: e.relations.map((r) => ({ ...r, target: targetDe[r.target] ?? r.target })),
      members: key.items.map((i) => ({ name: i.name, detail: i.status ? statusDe[i.status] : undefined })),
    };
  }
  const t = de[e.id];
  const relations = e.relations.map((r) => ({ ...r, target: targetDe[r.target] ?? r.target }));
  if (!t) return { ...e, relations };
  return { ...e, ...t, name: t.name ?? e.name, members: t.members ?? e.members, relations };
}

const groupTitles: Record<string, { title: string; intro?: string }> = {
  company: { title: "Unternehmen und Standort" },
  product: { title: "Produkt, Code und Distribution" },
  interfaces: { title: "Schnittstellen" },
  measurement: { title: "Was AutoSEO misst" },
  integrations: {
    title: "Integrationen",
    intro: "Integrationskategorien von AutoSEO, wie in der App aufgeführt. Die vollständige Liste mit Zweck steht im [Faktenblatt](/de/ai-agent-instructions#integrations).",
  },
  category: { title: "Kategorie" },
};

const groups: EntityGroup[] = entityConnectionsEn.groups.map((g) => ({
  ...g,
  title: groupTitles[g.id]?.title ?? g.title,
  intro: groupTitles[g.id]?.intro ?? g.intro,
  entities: g.entities.map(translateEntity),
}));

export const entityConnectionsDe: EntityMap = {
  path: "/entity-connections",
  crumb: "Entity Connections",
  meta: {
    title: "Entity Connections: AutoSEO, Codext GmbH und verbundene Entitäten",
    description:
      "Maschinenlesbare Karte von AutoSEO und den verbundenen Entitäten – Codext GmbH, GitHub-Repository, Docker-Image, AutoSEO Cloud, überwachte KI-Suchmaschinen, Integrationen und die Kategorie GEO – mit Kennungen, Beziehungen und Belegen.",
  },
  hero: {
    eyebrow: "Entity-Map",
    title: "Entity Connections: AutoSEO",
    subtitle:
      "Eine maschinenlesbare Karte von AutoSEO und den damit verbundenen Entitäten. Jeder Eintrag nennt seine Beziehungen explizit und belegt sie mit einem Zitat aus einer Quelle, die Sie öffnen können – ein KI-System, das eine Entität für AutoSEO aufbaut, muss also nichts erraten.",
  },
  updated: FACTS_UPDATED,
  labels: {
    updated: "Zuletzt aktualisiert",
    factSheet: "Vollständiges Faktenblatt",
    toc: "Entitäten",
    identifiers: "Geprüfte Kennungen",
    relations: "Beziehungen",
    members: "Umfasst",
    evidence: "Beleg",
    retrieved: "abgerufen",
    noIdentifiers: "Keine externe Kennung – beschrieben durch den Beleg unten.",
    jsonLd: "Derselbe Graph ist in diese Seite als schema.org-JSON-LD (@graph) eingebettet.",
  },
  intro: [
    "Kennungen werden nur aufgeführt, wo sie geprüft sind: unsere eigenen Domains, das GitHub-Repository und -Paket sowie Wikidata-Einträge, deren Bezeichnung und Beschreibung kontrolliert wurden. Für die Codext GmbH und AutoSEO gibt es derzeit keine Wikidata-Einträge; es werden keine behauptet.",
    "Beziehungen verwenden explizite Prädikate (DEVELOPED_BY, LICENSED_UNDER, MONITORS, …). Belege werden wörtlich und in der Sprache der verlinkten Quelle zitiert.",
  ],
  groups,
};


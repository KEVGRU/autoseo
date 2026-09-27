import { describe, expect, it } from "vitest";
import { buildSchemaGraph, suggestSchemaTypes, validateJsonLd, type SchemaFacts } from "./schema-ld";
import { extractPageFacts } from "./schema-ld-extract";

const base: SchemaFacts = {
  url: "https://solakon.de/produkte/solakon-one",
  language: "de",
  site: { name: "Solakon", url: "https://solakon.de/", searchUrlTemplate: "https://solakon.de/search?q={search_term_string}" },
  org: {
    name: "Solakon",
    url: "https://solakon.de/",
    alternateNames: ["Solakon GmbH", "Solakon"],
    logo: "https://solakon.de/logo.png",
    sameAs: ["https://www.linkedin.com/company/solakon", "https://www.linkedin.com/company/solakon"],
    telephone: "+49 30 123456",
    email: "info@solakon.de",
    address: { streetAddress: "Hauptstr. 1", postalCode: "10115", addressLocality: "Berlin", addressCountry: "DE" },
  },
  page: {
    title: "Solakon ONE Balkonkraftwerk mit Speicher",
    description: "800 W Balkonkraftwerk mit 2 kWh Speicher.",
    image: "https://solakon.de/one.jpg",
    datePublished: "2026-05-01",
    breadcrumbs: [
      { name: "Home", url: "https://solakon.de/" },
      { name: "Produkte", url: "https://solakon.de/produkte" },
      { name: "Solakon ONE", url: "https://solakon.de/produkte/solakon-one" },
    ],
    faqs: [{ question: "Wie lange hält der Speicher?", answer: "Über 6.000 Ladezyklen." }],
    howToSteps: ["Paneele montieren", "Wechselrichter anschließen", "Stecker einstecken"],
  },
  product: { name: "Solakon ONE", price: 1299, currency: "eur", availability: "in stock", sku: "ONE-800", image: "https://solakon.de/one.jpg" },
  localBusiness: { type: "Store", openingHours: ["Mo-Fr 09:00-18:00"] },
};

const graphOf = (doc: Record<string, unknown>) => doc["@graph"] as Record<string, unknown>[];

describe("JSON-LD builders", () => {
  it("builds a cross-linked @graph for all eight types", () => {
    const doc = buildSchemaGraph(["Organization", "WebSite", "Product", "LocalBusiness", "FAQPage", "BreadcrumbList", "Article", "HowTo"], base);
    expect(doc["@context"]).toBe("https://schema.org");
    const g = graphOf(doc);
    expect(g.map((n) => n["@type"])).toEqual(["Organization", "WebSite", "Store", "Product", "Article", "HowTo", "FAQPage", "BreadcrumbList"]);
    const org = g[0]!;
    expect(org["@id"]).toBe("https://solakon.de/#organization");
    expect(org.sameAs).toEqual(["https://www.linkedin.com/company/solakon"]);
    expect(org.alternateName).toEqual(["Solakon GmbH"]);
    expect((org.address as Record<string, unknown>)["@type"]).toBe("PostalAddress");
    expect((g[1]!.potentialAction as Record<string, unknown>)["query-input"]).toBe("required name=search_term_string");
    const product = g[3]!;
    expect(product.offers).toMatchObject({ "@type": "Offer", price: 1299, priceCurrency: "EUR", availability: "https://schema.org/InStock", seller: { "@id": "https://solakon.de/#organization" } });
    expect(product.brand).toEqual({ "@type": "Brand", name: "Solakon" });
    expect((g[7]!.itemListElement as Record<string, unknown>[]).map((i) => i.position)).toEqual([1, 2, 3]);
    expect((g[5]!.step as unknown[]).length).toBe(3);
    expect(g[4]!.publisher).toEqual({ "@id": "https://solakon.de/#organization" });
    expect(validateJsonLd(doc).filter((h) => h.level === "error")).toEqual([]);
  });

  it("skips nodes without the facts they need", () => {
    const doc = buildSchemaGraph(["Product", "FAQPage", "HowTo", "BreadcrumbList"], { ...base, product: null, page: { title: "X", faqs: [], howToSteps: ["only one"], breadcrumbs: [] } });
    expect(graphOf(doc)).toEqual([]);
  });

  it("suggests types from the facts", () => {
    expect(suggestSchemaTypes({ ...base, url: "https://solakon.de/" })).toEqual(expect.arrayContaining(["Organization", "WebSite", "LocalBusiness"]));
    const productPage = suggestSchemaTypes(base);
    expect(productPage).toEqual(expect.arrayContaining(["Organization", "Product", "FAQPage", "BreadcrumbList"]));
    expect(productPage).not.toContain("Article");
    expect(suggestSchemaTypes({ ...base, product: null, localBusiness: null, page: { ...base.page, title: "How to install a balcony power plant" } })).toEqual(expect.arrayContaining(["Article", "HowTo"]));
  });
});

describe("JSON-LD validation hints", () => {
  it("reports missing required and recommended properties", () => {
    const hints = validateJsonLd({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Product", name: "Kit", offers: { "@type": "Offer", price: 10 } },
        { "@type": "LocalBusiness", name: "Shop" },
        { "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Q?" }] },
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", name: "Home" }] },
        { "@type": "Article", headline: "x".repeat(120) },
        { "@type": "Organization", name: "Acme" },
      ],
    });
    const errors = hints.filter((h) => h.level === "error").map((h) => `${h.type}: ${h.message}`);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^Product: offers.priceCurrency/),
        expect.stringMatching(/^LocalBusiness: Add the postal address/),
        expect.stringMatching(/^FAQPage: Question 1 has no acceptedAnswer/),
        expect.stringMatching(/^BreadcrumbList: Item 1 needs a position/),
      ]),
    );
    expect(hints.some((h) => h.type === "Article" && h.level === "warning" && /110/.test(h.message))).toBe(true);
    expect(hints.some((h) => h.type === "Organization" && /logo/.test(h.message))).toBe(true);
    expect(validateJsonLd({ "@type": "Thing" }).some((h) => /@context/.test(h.message))).toBe(true);
    expect(validateJsonLd({}).some((h) => /No node/.test(h.message))).toBe(true);
  });
});

describe("page fact extraction", () => {
  it("reads meta, existing JSON-LD, contacts, socials, FAQs and breadcrumbs", () => {
    const html = `<!doctype html><html lang="de"><head>
      <title>Solakon ONE | Solakon</title>
      <meta name="description" content="Das Balkonkraftwerk mit Speicher.">
      <meta property="og:image" content="/img/one.jpg"><meta property="og:site_name" content="Solakon">
      <link rel="canonical" href="https://solakon.de/produkte/solakon-one">
      <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Solakon","logo":{"@type":"ImageObject","url":"https://solakon.de/logo.png"},"address":{"@type":"PostalAddress","streetAddress":"Hauptstr. 1","postalCode":"10115","addressLocality":"Berlin","addressCountry":{"@type":"Country","name":"DE"}}},{"@type":"Product","name":"Solakon ONE","sku":"ONE-800","offers":{"@type":"Offer","price":"1.299,00","priceCurrency":"EUR","availability":"https://schema.org/InStock"}}]}</script>
      <script type="application/ld+json">{not json</script>
      </head><body>
      <nav aria-label="Breadcrumb"><a href="/">Start</a><a href="/produkte">Produkte</a></nav>
      <main><h1>Solakon ONE</h1>
      <h2>Wie lange hält der Speicher?</h2><p>Der Speicher schafft über 6.000 Ladezyklen.</p>
      <h2>Brauche ich einen Elektriker?</h2><p>Nein, das System wird einfach eingesteckt.</p>
      <ol><li>Paneele am Balkon montieren</li><li>Wechselrichter verbinden</li><li>Stecker in die Steckdose</li></ol></main>
      <footer><a href="tel:+4930123456">Call</a><a href="mailto:info@solakon.de?subject=hi">Mail</a>
      <a href="https://www.instagram.com/solakon/">IG</a><a href="https://www.facebook.com/sharer/sharer.php?u=x">share</a></footer>
      </body></html>`;
    const f = extractPageFacts(html, "https://solakon.de/produkte/solakon-one?ref=nav");
    expect(f.title).toBe("Solakon ONE");
    expect(f.description).toBe("Das Balkonkraftwerk mit Speicher.");
    expect(f.image).toBe("https://solakon.de/img/one.jpg");
    expect(f.lang).toBe("de");
    expect(f.canonical).toBe("https://solakon.de/produkte/solakon-one");
    expect(f.logo).toBe("https://solakon.de/logo.png");
    expect(f.address).toEqual({ streetAddress: "Hauptstr. 1", postalCode: "10115", addressLocality: "Berlin", addressRegion: null, addressCountry: "DE" });
    expect(f.product).toMatchObject({ name: "Solakon ONE", sku: "ONE-800", price: 1299, currency: "EUR" });
    expect(f.telephone).toBe("+4930123456");
    expect(f.email).toBe("info@solakon.de");
    expect(f.sameAs).toEqual(["https://www.instagram.com/solakon"]);
    expect(f.faqs.map((q) => q.question)).toEqual(["Wie lange hält der Speicher?", "Brauche ich einen Elektriker?"]);
    expect(f.howToSteps).toHaveLength(3);
    expect(f.breadcrumbs.map((b) => b.name)).toEqual(["Start", "Produkte", "Solakon ONE"]);
    expect(f.existingTypes).toEqual(["Organization", "Product"]);
  });

  it("derives breadcrumbs from the URL path when the page has none", () => {
    const f = extractPageFacts("<html><body><h1>Warranty terms</h1></body></html>", "https://acme.test/help/warranty-terms");
    expect(f.breadcrumbs).toEqual([
      { name: "Home", url: "https://acme.test/" },
      { name: "Help", url: "https://acme.test/help" },
      { name: "Warranty terms", url: "https://acme.test/help/warranty-terms" },
    ]);
    expect(f.product).toBeNull();
    expect(f.faqs).toEqual([]);
  });
});

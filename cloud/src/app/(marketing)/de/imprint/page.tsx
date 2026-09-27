import Link from "next/link";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbs, graph } from "@/components/marketing/structured-data";
import { SiteLegalPage } from "@/components/site/legal/legal-page";
import { siteMetadata } from "@/components/site/metadata";
import { site } from "@/lib/site";

export const metadata = siteMetadata({
  title: "Impressum",
  description:
    "Impressum für AutoSEO und autoseo.codext.de: Codext GmbH, Wolpertshausen, Deutschland – Geschäftsführer, Handelsregister, USt-IdNr. und Kontakt.",
  enPath: "/imprint",
  locale: "de",
});

export default function GermanImprintPage() {
  const { legal } = site;
  return (
    <>
      <JsonLd data={graph(breadcrumbs([{ name: "Impressum", path: "/de/imprint" }], "de"))} />
      <SiteLegalPage
        locale="de"
        crumb="Impressum"
        title="Impressum"
        subtitle="Anbieterkennzeichnung für autoseo.codext.de und AutoSEO Cloud."
        notice={
          <>
            Maßgeblich ist die deutsche Fassung. Eine englische Fassung finden Sie hier: <Link href="/imprint">English version</Link>.
          </>
        }
      >
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          {legal.name}
          <br />
          {legal.street}
          <br />
          {legal.postalCode} {legal.city}
          <br />
          {legal.country}
        </p>

        <h2>Vertreten durch</h2>
        <p>Geschäftsführer: {legal.managingDirector}</p>

        <h2>Kontakt</h2>
        <p>
          Telefon: <a href={`tel:${legal.phone.replace(/\s+/g, "")}`}>{legal.phone}</a>
          <br />
          E-Mail: <a href={`mailto:${legal.email}`}>{legal.email}</a>
        </p>

        <h2>Registereintrag</h2>
        <p>
          Registergericht: {legal.registerCourt}
          <br />
          Registernummer: {legal.registerNumber}
        </p>

        <h2>Umsatzsteuer-ID</h2>
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: {legal.vatId}</p>

        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
          <br />
          {legal.managingDirector}, {legal.street}, {legal.postalCode} {legal.city}
        </p>

        <h2>Geschäftskunden</h2>
        <p>Unsere Angebote richten sich ausschließlich an Unternehmer im Sinne von § 14 BGB, nicht an Verbraucher.</p>
      </SiteLegalPage>
    </>
  );
}

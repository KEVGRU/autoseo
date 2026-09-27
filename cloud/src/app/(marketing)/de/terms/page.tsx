import Link from "next/link";
import { appHost, cloudPlan } from "@/components/marketing/content";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbs, graph } from "@/components/marketing/structured-data";
import { SiteLegalPage } from "@/components/site/legal/legal-page";
import { siteMetadata } from "@/components/site/metadata";
import { site } from "@/lib/site";

export const metadata = siteMetadata({
  title: "Allgemeine Geschäftsbedingungen (AGB)",
  description:
    "AGB für AutoSEO Cloud der Codext GmbH: verwalteter Workspace für 50 USD/Monat über Stripe, inklusive Nutzung, Fair Use, Kündigung, Daten und Haftung.",
  enPath: "/terms",
  locale: "de",
});

export default function GermanTermsPage() {
  const { legal } = site;
  const price = `USD ${site.priceMonthlyUsd}`;
  const yearlyPrice = `USD ${site.priceYearlyUsd}`;
  return (
    <>
      <JsonLd data={graph(breadcrumbs([{ name: "AGB", path: "/de/terms" }], "de"))} />
      <SiteLegalPage
        locale="de"
        crumb="AGB"
        title="Allgemeine Geschäftsbedingungen"
        subtitle="Die Bedingungen für Abonnements von AutoSEO Cloud. Die Open-Source-Software selbst steht unter der MIT-Lizenz."
        notice={
          <>
            Maßgeblich ist die deutsche Fassung. Eine englische Fassung finden Sie hier: <Link href="/terms">English version</Link>.
          </>
        }
      >
        <h2>1. Geltungsbereich</h2>
        <p>
          Diese Bedingungen regeln den Dienst AutoSEO Cloud (der „Dienst“), den die {legal.name}, {legal.street},{" "}
          {legal.postalCode} {legal.city}, Deutschland („wir“, „uns“), Ihnen (dem „Kunden“) über {site.host} bereitstellt.
          Der Dienst wird ausschließlich Unternehmern im Sinne von § 14 BGB angeboten, nicht Verbrauchern. Entgegenstehende
          oder ergänzende Bedingungen des Kunden gelten nicht, es sei denn, wir stimmen ihnen schriftlich zu.
        </p>

        <h2>2. Der Dienst</h2>
        <p>
          Wir stellen dem Kunden einen privaten Workspace in einer gemeinsamen, vollständig verwalteten Instanz der
          Open-Source-Software AutoSEO bereit, die wir unter {appHost} auf Servern in Deutschland betreiben. Der Kunde ist
          Inhaber seines Workspaces; wir bleiben Betreiber und alleiniger Administrator der Instanz. Wir halten die
          Software aktuell und stellen die von der Instanz genutzten KI-Anbieter, SEO-Datenanbieter, die
          Google-Integration und den E-Mail-Versand bereit. Daten verschiedener Kunden werden in getrennten Workspaces
          gehalten, die innerhalb einer gemeinsamen Datenbank logisch voneinander getrennt sind. Jeder Workspace umfasst
          alle Funktionen des jeweils aktuellen AutoSEO-Releases, eine unbegrenzte Anzahl vom Kunden eingeladener Nutzer,
          bis zu {cloudPlan.projects} Projekte und Support per E-Mail. Der Funktionsumfang kann sich mit der
          Weiterentwicklung der Software ändern.
        </p>
        <p>
          Die Software AutoSEO steht unter der MIT-Lizenz. Diese Bedingungen schränken keine durch diese Lizenz gewährten
          Rechte ein; Kunden, die eine eigene Instanz wünschen, können die Software selbst hosten. Diese Bedingungen regeln
          ausschließlich den verwalteten Dienst.
        </p>

        <h2>3. Konto und Vertragsschluss</h2>
        <p>
          Der Kunde legt ein Konto mit einer E-Mail-Adresse an und meldet sich über einmalige Anmeldelinks an. Der
          Vertrag über ein Abonnement kommt zustande, wenn der Kunde den Bestellvorgang (Checkout) abschließt. Der Kunde
          muss zutreffende Angaben machen, den Zugang zu seinem E-Mail-Konto und zu seinem Workspace sichern und ist für
          alle Aktivitäten in seinem Workspace verantwortlich, einschließlich der von ihm eingeladenen Nutzer.
        </p>

        <h2>4. Entgelte und Zahlung</h2>
        <p>
          Das Entgelt beträgt im Monatsplan {price} pro Workspace und Monat oder im Jahresplan {yearlyPrice} pro Workspace
          und Jahr, jeweils zuzüglich gegebenenfalls anfallender Umsatzsteuer. Die Entgelte werden für den gewählten
          Abrechnungszeitraum (ein Monat oder ein Jahr) im Voraus abgerechnet und über unseren Zahlungsdienstleister
          Stripe abgewickelt. Aktionsrabatte (zum Beispiel ein Launch-Angebot) gelten nur wie im Angebot beschrieben, in
          der Regel für den ersten Abrechnungszeitraum; folgende Zeiträume werden zum regulären Preis abgerechnet.
          Rechnungen werden elektronisch bereitgestellt. Schlägt eine Zahlung fehl, benachrichtigen wir den Kunden; bleibt
          der Betrag unbezahlt, können wir den Workspace bis zur Zahlung sperren. Ein gesperrter Workspace kann nicht
          geöffnet werden, und seine geplanten Aufgaben werden angehalten. Wir können die Preise mit einer
          Ankündigungsfrist von mindestens 30 Tagen per E-Mail ändern; der Kunde kann vor Wirksamwerden der Änderung
          kündigen.
        </p>

        <h2>5. Laufzeit und Kündigung</h2>
        <p>
          Abonnements laufen für den gewählten Abrechnungszeitraum (ein Monat oder ein Jahr) und verlängern sich
          automatisch um denselben Zeitraum. Der Kunde kann jederzeit im Kundenbereich
          kündigen; die Kündigung wird zum Ende des laufenden Abrechnungszeitraums wirksam. Bereits gezahlte Entgelte für
          den laufenden Zeitraum werden nicht erstattet. Wir können mit einer Frist von 30 Tagen zum Ende eines
          Abrechnungszeitraums kündigen. Das Recht beider Parteien zur Kündigung aus wichtigem Grund bleibt unberührt.
        </p>

        <h2>6. Inklusive Nutzung und Dienste Dritter</h2>
        <p>
          Jeder Workspace enthält KI- und Datenanbieter-Nutzung im Wert von USD {cloudPlan.includedUsageUsd} pro Monat
          (zum Beispiel Anfragen an KI-Modelle und SEO-Daten von DataForSEO), vorbehaltlich einer fairen Nutzung (Fair
          Use). Ist die inklusive Nutzung eines Monats aufgebraucht, können Funktionen, die Anbieterkosten verursachen, bis
          zum nächsten Monat nicht verfügbar sein; nicht verbrauchte Nutzung wird nicht in den Folgemonat übertragen.
          KI-Funktionen können zusätzlich über das eigene Claude-Code- oder Codex-Abonnement des Kunden über den lokalen
          Agenten laufen; für dieses Abonnement und dessen Bedingungen ist der Kunde verantwortlich. Wir können eine
          Nutzung beschränken, die die übliche Nutzung erheblich übersteigt oder die Stabilität des Dienstes für andere
          Kunden beeinträchtigt, und werden den Kunden darüber informieren.
        </p>
        <p>
          Dienste, die der Kunde mit seinem Workspace verbindet – zum Beispiel Google-Konten, lokale Agenten,
          Projektmanagement-Tools oder Content-Management-Systeme –, werden unter den eigenen Konten und Bedingungen des
          Kunden genutzt. Der Kunde ist dafür verantwortlich, diese Zugangsdaten sicher zu verwahren, und trägt alle
          Kosten, die diese Anbieter berechnen. Für Verfügbarkeit, Ergebnisse oder Preise von Diensten Dritter sind wir
          nicht verantwortlich.
        </p>

        <h2>7. Zulässige Nutzung</h2>
        <p>Der Kunde darf den Dienst nicht nutzen, um:</p>
        <ul>
          <li>geltendes Recht oder Rechte Dritter zu verletzen;</li>
          <li>Spam oder unerwünschte Nachrichten zu versenden;</li>
          <li>Schadcode zu speichern oder zu verbreiten oder unsere Systeme oder Systeme Dritter anzugreifen, auszuforschen oder zu überlasten;</li>
          <li>die Trennung zwischen Workspaces, Nutzungslimits oder Sicherheitsmaßnahmen des Dienstes zu umgehen;</li>
          <li>mit dem Workspace verbundene Dienste Dritter unter Verstoß gegen deren Bedingungen zu nutzen.</li>
        </ul>
        <p>
          Wir können einen Workspace sperren, wenn konkrete Anhaltspunkte für einen Verstoß oder für eine Gefährdung der
          Sicherheit oder Stabilität des Dienstes vorliegen, und informieren den Kunden unverzüglich.
        </p>

        <h2>8. Kundendaten, Export und Löschung</h2>
        <p>
          Alle Daten im Workspace des Kunden bleiben Daten des Kunden. Soweit wir personenbezogene Daten im Auftrag des
          Kunden verarbeiten, tun wir dies als Auftragsverarbeiter nach Art. 28 DSGVO; ein Vertrag zur Auftragsverarbeitung
          ist auf Anfrage erhältlich. Der Kunde kann Daten jederzeit mit den Exportfunktionen der Software exportieren (zum
          Beispiel CSV- und Google-Sheets-Exporte, PPTX- und PDF-Reports und einen DSGVO-Export personenbezogener Daten).
          Da sich die Workspaces eine verwaltete Datenbank teilen, stellen wir keine Exporte der zugrunde liegenden
          Datenbank bereit.
        </p>
        <p>
          Mit dem Ende des Abonnements wird der Workspace gesperrt. Wir bewahren seine Daten 30 Tage lang auf, damit der
          Kunde erneut ein Abonnement abschließen und weiterarbeiten kann; danach werden der Workspace und alle seine Daten
          endgültig gelöscht.
        </p>

        <h2>9. Verfügbarkeit und Support</h2>
        <p>
          Wir betreiben den Dienst mit Sorgfalt und streben eine hohe Verfügbarkeit an, stellen ihn jedoch nach bestem
          Bemühen (Best Effort) und ohne garantiertes Service-Level bereit. Wartung, Updates und Ereignisse außerhalb
          unseres Einflussbereichs können zu Unterbrechungen führen; geplante Wartungen legen wir nach Möglichkeit in
          Zeiten geringer Nutzung. Support erfolgt per E-Mail an <a href={`mailto:${legal.email}`}>{legal.email}</a>.
        </p>

        <h2>10. Haftung</h2>
        <p>
          Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung des Lebens, des Körpers oder der
          Gesundheit sowie nach dem Produkthaftungsgesetz. Bei leichter Fahrlässigkeit haften wir nur für die Verletzung
          wesentlicher Vertragspflichten (Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags
          überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf), begrenzt auf den
          vertragstypischen und vorhersehbaren Schaden. Im Übrigen ist unsere Haftung ausgeschlossen. Diese
          Beschränkungen gelten auch für unsere Mitarbeiter, Vertreter und Erfüllungsgehilfen.
        </p>

        <h2>11. Änderungen dieser Bedingungen</h2>
        <p>
          Wir können diese Bedingungen mit Wirkung für die Zukunft ändern. Wir informieren den Kunden mindestens 30 Tage
          vor ihrem Inkrafttreten per E-Mail über Änderungen. Widerspricht der Kunde nicht vor dem Tag des Inkrafttretens,
          gelten die Änderungen als angenommen; auf diese Folge weisen wir in unserer Mitteilung hin. Widerspricht der
          Kunde, kann jede Partei das Abonnement zum Tag des Inkrafttretens kündigen.
        </p>

        <h2>12. Anwendbares Recht und Gerichtsstand</h2>
        <p>
          Diese Bedingungen unterliegen dem Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Ist
          der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist
          ausschließlicher Gerichtsstand unser Geschäftssitz. Sollte eine Bestimmung dieser Bedingungen unwirksam sein,
          bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
        <p>
          Siehe auch unsere <Link href="/de/privacy">Datenschutzerklärung</Link> und unser{" "}
          <Link href="/de/imprint">Impressum</Link>.
        </p>
      </SiteLegalPage>
    </>
  );
}

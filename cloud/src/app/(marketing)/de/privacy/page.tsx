import Link from "next/link";
import { appHost } from "@/components/marketing/content";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbs, graph } from "@/components/marketing/structured-data";
import { SiteLegalPage } from "@/components/site/legal/legal-page";
import { siteMetadata } from "@/components/site/metadata";
import { site } from "@/lib/site";

export const metadata = siteMetadata({
  title: "Datenschutzerklärung",
  description:
    "Wie die Codext GmbH personenbezogene Daten für autoseo.codext.de und AutoSEO Cloud verarbeitet: Hosting in Deutschland, cookielose Nutzungsstatistik, Stripe, Anmelde-E-Mails, Ihre Rechte.",
  enPath: "/privacy",
  locale: "de",
});

export default function GermanPrivacyPage() {
  const { legal } = site;
  return (
    <>
      <JsonLd data={graph(breadcrumbs([{ name: "Datenschutz", path: "/de/privacy" }], "de"))} />
      <SiteLegalPage
        locale="de"
        crumb="Datenschutz"
        title="Datenschutzerklärung"
        subtitle="Wir erheben so wenige personenbezogene Daten wie möglich. Unsere Nutzungsstatistik kommt ohne Cookies und ohne Drittanbieter aus."
        notice={
          <>
            Maßgeblich ist die deutsche Fassung. Eine englische Fassung finden Sie hier: <Link href="/privacy">English version</Link>.
          </>
        }
      >
        <h2>1. Verantwortlicher</h2>
        <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
        <p>
          {legal.name}
          <br />
          {legal.street}, {legal.postalCode} {legal.city}, Deutschland
          <br />
          Geschäftsführer: {legal.managingDirector}
          <br />
          E-Mail: <a href={`mailto:${legal.email}`}>{legal.email}</a> · Telefon: {legal.phone}
        </p>

        <h2>2. Geltungsbereich</h2>
        <p>
          Diese Datenschutzerklärung gilt für die Website {site.host} (einschließlich Registrierung, Anmeldung und
          Kundenbereich) und den Dienst AutoSEO Cloud unter {appHost}. Sie gilt nicht für selbst gehostete Installationen
          der Open-Source-Software AutoSEO: Für die in einer solchen Installation verarbeiteten Daten ist verantwortlich,
          wer diese Installation betreibt.
        </p>

        <h2>3. Hosting und Server-Logs</h2>
        <p>
          Die Website und die gemeinsame AutoSEO-Cloud-Instanz ({appHost}) laufen auf Servern in Deutschland, die wir
          selbst mit der Open-Source-Plattform Coolify betreiben. Die Serverinfrastruktur stellt die Hetzner Online GmbH,
          Industriestr. 25, 91710 Gunzenhausen, Deutschland, bereit, die auf Grundlage eines Vertrags zur
          Auftragsverarbeitung (Art. 28 DSGVO) als unser Auftragsverarbeiter tätig ist.
        </p>
        <p>
          Wenn Sie die Website aufrufen, verarbeiten unsere Server technische Daten, die Ihr Browser automatisch
          übermittelt: IP-Adresse, Datum und Uhrzeit der Anfrage, aufgerufene URL, Referrer, HTTP-Statuscode und
          User-Agent. Wir verarbeiten diese Daten, um die Website bereitzustellen und ihre Sicherheit und Stabilität zu
          gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). Log-Daten werden nur so lange gespeichert, wie es für diese Zwecke
          erforderlich ist.
        </p>

        <h2>4. Cloudflare (DNS und CDN)</h2>
        <p>
          Wir nutzen Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA, für DNS sowie als Content Delivery
          Network und Sicherheits-Proxy für {site.host}. Anfragen an die Website laufen über das Netzwerk von Cloudflare,
          das Ihre IP-Adresse und Anfragedaten verarbeitet, um Inhalte auszuliefern und vor Angriffen zu schützen.
          Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und schnellen Website (Art. 6 Abs. 1 lit. f
          DSGVO). Cloudflare ist unter dem EU-U.S. Data Privacy Framework zertifiziert; zusätzlich gelten die
          EU-Standardvertragsklauseln. Weitere Informationen:{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">
            cloudflare.com/privacypolicy
          </a>
          .
        </p>

        <h2>5. Datenschutzfreundliche Nutzungsstatistik</h2>
        <p>
          Um zu verstehen, welche Seiten und Kampagnen funktionieren, betreiben wir eine eigene Nutzungsstatistik auf
          unseren Servern in Deutschland (siehe Abschnitt 3). Es ist kein Drittanbieter beteiligt, und dafür wird nichts
          in Ihrem Browser gespeichert – weder Cookies noch Einträge im lokalen Speicher (Local Storage). Wenn Sie eine
          Seite auf {site.host} aufrufen, sendet ein kleines Skript von uns eine kurze Anfrage an unseren Server. Dabei
          erfassen wir:
        </p>
        <ul>
          <li>den Pfad der aufgerufenen Seite (ohne den übrigen Teil der Adresse),</li>
          <li>die Domain der Website, die auf uns verlinkt hat (nur bei Links von anderen Websites),</li>
          <li>im Link enthaltene Kampagnenparameter (utm_source, utm_medium, utm_campaign, utm_content, utm_term),</li>
          <li>
            ob der Link die Klick-ID eines Werbenetzwerks enthielt – nur welches Netzwerk (zum Beispiel X oder Google),
            niemals die ID selbst,
          </li>
          <li>das Land, das Cloudflare aus Ihrer IP-Adresse ableitet,</li>
          <li>den Gerätetyp (Smartphone, Tablet oder Desktop), abgeleitet aus dem User-Agent,</li>
          <li>
            einige Interaktionen: Klicks auf Registrierungs-Buttons (mit der Beschriftung des Buttons und gegebenenfalls
            dem gewählten Tarif), auf unser Einführungsangebot und auf Links zu GitHub, das Kopieren des
            Installationsbefehls, Durchläufe des kostenlosen KI-Sichtbarkeitschecks sowie Ihre Antwort im
            Einwilligungsdialog zur Conversion-Messung durch X (Abschnitt 9).
          </li>
        </ul>
        <p>
          Ihre IP-Adresse speichern wir nicht. Um eindeutige Besucher zu zählen, werden IP-Adresse und User-Agent mit
          einem täglich wechselnden Zufallswert zu einem Hashwert (einer Einweg-Prüfsumme) verrechnet. Der Zufallswert
          eines Tages wird spätestens nach zwei Tagen gelöscht; ab dann lässt sich die Statistik von Besuchern ohne Konto
          keiner Person mehr zuordnen – auch nicht durch uns. Wir bilden keine Profile über mehrere Tage oder über andere
          Websites hinweg. Die Statistikdaten werden spätestens nach 400 Tagen gelöscht.
        </p>
        <p>
          <strong>Herkunft der Registrierung:</strong> Wird für eine E-Mail-Adresse, zu der noch kein Konto besteht, eine
          Anmelde-E-Mail angefordert, berechnen wir den Hashwert einmalig aus der aktuellen IP-Adresse und dem
          User-Agent neu, um die Seitenaufrufe der vorangegangenen zwei Tage zu finden. Daraus ermitteln wir, über
          welchen Kanal und welche Kampagne die Registrierung zustande kam (zum Beispiel „Paid Social, Quelle x, Kampagne
          launch“), zusammen mit der Einstiegsseite, der verweisenden Domain, gegebenenfalls dem Werbenetzwerk, dem Land
          und dem Tag des ersten Seitenaufrufs. Diese Angaben bewahren wir beim Anmeldelink auf, der spätestens einen Tag
          nach seinem Ablauf gelöscht wird. Wird das Konto angelegt, speichern wir sie zum Konto und vermerken Kanal und
          Kampagne im Protokolleintrag der Registrierung. Wenn Sie einen Bezahlvorgang starten, übermitteln wir Kanal,
          Kampagnenparameter, Einstiegsseite und verweisende Domain als Metadaten des Bezahlvorgangs und des
          Abonnements an Stripe (siehe Abschnitt 7). So erkennen wir, welche Kampagnen zahlende Kunden bringen. Da der
          Zeitpunkt der Kontoerstellung bekannt ist, lässt sich eine Verbindung zwischen Ihrem Konto und Ihren
          Seitenaufrufen kurz vor der Registrierung nicht vollständig ausschließen; über diese Zuordnung hinaus
          verknüpfen wir die Statistik nicht mit Konten.
        </p>
        <p>
          Rechtsgrundlage ist unser berechtigtes Interesse daran, die Nutzung unserer Website und den Erfolg unseres
          Marketings zu verstehen und beides zu verbessern (Art. 6 Abs. 1 lit. f DSGVO). Sie können dieser Verarbeitung
          jederzeit widersprechen (Art. 21 DSGVO), indem Sie uns an <a href={`mailto:${legal.email}`}>{legal.email}</a>{" "}
          schreiben; wir löschen dann die zu Ihrem Konto gespeicherte Herkunftsangabe, Kanal und Kampagne im
          Protokolleintrag der Registrierung sowie die entsprechenden Metadaten an Ihrem Bezahlvorgang und Abonnement bei
          Stripe. Sie können außerdem Anfragen an {site.host}/api/e blockieren, etwa mit einem Content-Blocker.
        </p>

        <h2>6. Konto und Anmeldung per Magic Link</h2>
        <p>
          Um ein Konto anzulegen, geben Sie lediglich Ihre E-Mail-Adresse an. Statt Passwörter zu verwenden, senden wir
          Ihnen einen einmaligen Anmeldelink (Magic Link). Wir speichern Ihre E-Mail-Adresse, den Namen Ihres Workspaces,
          Ihren Abonnementstatus und sicherheitsrelevante Ereignisse (etwa Anmeldungen). Dies ist erforderlich, um den
          von Ihnen angeforderten Dienst bereitzustellen (Art. 6 Abs. 1 lit. b DSGVO).
        </p>
        <p>
          Transaktionale E-Mails – Anmeldelinks, Hinweise zum Workspace und Abrechnungsnachrichten – versenden wir über
          einen E-Mail-Versanddienstleister, der als unser Auftragsverarbeiter tätig ist. Wir versenden keine Newsletter
          und keine Marketing-E-Mails.
        </p>

        <h2>7. Zahlungen über Stripe</h2>
        <p>
          Abonnements werden über die Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin,
          D02 H210, Irland, bezahlt. Beim Bezahlvorgang geben Sie Ihre Zahlungsdaten direkt bei Stripe ein; vollständige
          Kartennummern sehen oder speichern wir nie. Stripe übermittelt uns die Informationen, die wir für Abrechnung und
          Buchhaltung benötigen, etwa Name, E-Mail-Adresse, Rechnungsadresse, USt-IdNr., Zahlungsstatus und die letzten
          Ziffern des Zahlungsmittels. Rechtsgrundlagen sind die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) und
          unsere gesetzlichen Aufbewahrungspflichten (Art. 6 Abs. 1 lit. c DSGVO). Wenn Sie einen Bezahlvorgang starten,
          übermitteln wir außerdem die in Abschnitt 5 beschriebene Herkunft der Registrierung als Metadaten des
          Bezahlvorgangs und des Abonnements an Stripe (Art. 6 Abs. 1 lit. f DSGVO). Stripe kann Daten in den USA
          verarbeiten; die Datenübermittlungen sind durch das EU-U.S. Data Privacy Framework und Standardvertragsklauseln
          abgedeckt. Weitere Informationen:{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener">
            stripe.com/privacy
          </a>
          .
        </p>

        <h2>8. Cookies und lokaler Speicher</h2>
        <p>
          Nach der Anmeldung hält Sie ein Session-Cookie (HttpOnly, Secure) angemeldet, und kurzlebige Cookies können
          Anmelde- und Bezahlvorgänge absichern. Ihre Einstellung für den hellen oder dunklen Modus wird im lokalen
          Speicher (Local Storage) Ihres Browsers abgelegt und nie an uns übertragen. Diese sind für den von Ihnen
          genutzten Dienst erforderlich und nach § 25 Abs. 2 TDDDG von der Einwilligungspflicht ausgenommen.
          Schriftarten werden von unseren eigenen Servern ausgeliefert.
        </p>
        <p>
          Ohne Ihre Einwilligung setzen wir für Statistik oder Werbung keine Cookies, speichern dafür nichts in Ihrem
          Browser und laden keine Analyse- oder Werbedienste von Drittanbietern. Unser eigenes Statistik-Skript
          (Abschnitt 5) speichert nichts in Ihrem Browser; es übermittelt den Seitenpfad, die Domain der verweisenden
          Website und Kampagnenparameter an unseren Server.
        </p>
        <p>
          Treffen Sie im Einwilligungsdialog zur Conversion-Messung durch X eine Auswahl, speichern wir sie für 180 Tage im
          Cookie <code>__Host-autoseo_consent</code>, damit wir nicht erneut fragen. Nur wenn Sie eingewilligt haben: Nach
          dem Anlegen eines Kontos teilt das Cookie <code>__Host-autoseo_cv</code> (10 Minuten) der nächsten Seite mit, die
          Registrierung an X zu melden, und nach einem bezahlten Bezahlvorgang enthält das Cookie{" "}
          <code>__Host-autoseo_purchase</code> (10 Minuten, für Skripte nicht lesbar) den Kaufbetrag, bis er gemeldet ist.
          Die eigenen Cookies von X (<code>_twclid</code>, <code>_twpid</code>, <code>_twsid</code>) werden nur mit Ihrer
          Einwilligung gesetzt und gelten für alle Subdomains von codext.de (Abschnitt 9).
        </p>

        <h2 id="x-conversion-tracking">9. Conversion-Messung durch X (nur mit Ihrer Einwilligung)</h2>
        <p>
          Wenn Sie über eine unserer Anzeigen auf X (ehemals Twitter) auf unsere Website kommen, fragen wir, ob X den
          Erfolg der Anzeige messen darf. Nur wenn Sie auf „Erlauben“ klicken, laden wir die Conversion-Messung von X
          (das X-Pixel); ohne Ihre Einwilligung werden keine Daten an X übermittelt. Anbieter für Nutzer in der EU ist
          die Twitter International Unlimited Company, One Cumberland Place, Fenian Street, Dublin 2, D02 AX07, Irland.
          Die Daten können auch von der X Corp. in den USA verarbeitet werden; Übermittlungen in die USA erfolgen auf
          Grundlage der EU-Standardvertragsklauseln.
        </p>
        <p>
          Mit Ihrer Einwilligung setzt X Cookies auf unserer Domain (<code>_twclid</code>, das die Klick-ID der Anzeige
          speichert, sowie <code>_twpid</code> und <code>_twsid</code>; sie werden für codext.de gesetzt und gelten damit für
          alle Subdomains) und erhält technische Daten wie Ihre IP-Adresse und Browserinformationen, die Klick-ID der
          Anzeige, die Seiten, die Sie auf unserer Website aufrufen (nur deren Adresse ohne Parameter, abgesehen von
          Kampagnenparametern und der Klick-ID – niemals Anmelde-, Registrierungs- oder Admin-Seiten), sowie
          gegebenenfalls diese Aktionen: den Start eines Bezahlvorgangs, Klicks auf Links zu unserem GitHub-Repository,
          Ihre Registrierung und Ihren Kauf einschließlich des Kaufbetrags (Registrierung und Kauf gekennzeichnet mit
          einer pseudonymen Kennung, die X nicht auf die Zahlung zurückführen kann, niemals mit einer Zahlungs-Session-ID).
          Die automatische Ereigniserfassung von X (etwa Klicks auf
          Schaltflächen und Verweildauer) und der automatische Abgleich von Formularfeldern sind abgeschaltet. X kann
          diese Daten Ihrem X-Konto zuordnen. Zwecke: den Erfolg unserer Anzeigen messen, ihre Ausspielung optimieren und
          Zielgruppen bilden, um unsere Anzeigen auf X erneut zu zeigen.
        </p>
        <p>
          Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG). Für die Erhebung der
          Daten auf unserer Website und ihre Übermittlung an X sind wir und X gemeinsam verantwortlich (Art. 26 DSGVO);
          für die weitere Verarbeitung ist X allein verantwortlich. Sie können Ihre Einwilligung jederzeit mit Wirkung für
          die Zukunft unter „Datenschutz-Einstellungen“ im Footer widerrufen; wir löschen dann die Cookies von X auf
          unserer Domain und laden das Pixel nicht mehr. Weitere Informationen:{" "}
          <a href="https://x.com/de/privacy" target="_blank" rel="noopener">
            x.com/de/privacy
          </a>
          .
        </p>

        <h2>10. Daten in Ihrem AutoSEO-Cloud-Workspace</h2>
        <p>
          Alle Kunden von AutoSEO Cloud nutzen eine gemeinsame AutoSEO-Instanz, die wir betreiben. Jeder Kunde erhält
          einen eigenen Workspace; dessen Daten werden in einer gemeinsamen Datenbank gespeichert und logisch von den
          Workspaces anderer Kunden getrennt. Für personenbezogene Daten, die Sie und Ihre Nutzer in Ihrem Workspace
          speichern oder verarbeiten (zum Beispiel Teammitglieder, Kunden oder getrackte Inhalte), sind Sie der
          Verantwortliche, und wir handeln als Ihr Auftragsverarbeiter nach Art. 28 DSGVO. Einen Vertrag zur
          Auftragsverarbeitung stellen wir auf Anfrage bereit – schreiben Sie einfach an{" "}
          <a href={`mailto:${legal.email}`}>{legal.email}</a>.
        </p>
        <p>
          Um KI- und SEO-Datenfunktionen bereitzustellen, übermittelt die Instanz die erforderlichen Anfragedaten – zum
          Beispiel getrackte Prompts, Marken- und Wettbewerbernamen, Domains und Keywords – an die von uns konfigurierten
          KI-Modellanbieter und SEO-Datenanbieter (etwa DataForSEO); diese sind unsere Unterauftragsverarbeiter. Die
          aktuelle Liste der Unterauftragsverarbeiter stellen wir auf Anfrage bereit. Wenn Sie Ihr eigenes Claude-Code-
          oder Codex-Abonnement über den lokalen Agenten verbinden, laufen diese KI-Anfragen auf Ihrem Rechner unter
          Ihrem eigenen Konto. Dienste, die Sie selbst verbinden – etwa Google Search Console, Google Analytics oder
          Projektmanagement-Tools –, erhalten Daten entsprechend Ihrer Konfiguration und nach ihren eigenen Bedingungen.
        </p>

        <h2>11. Kontaktaufnahme</h2>
        <p>
          Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre Nachricht und Ihre Kontaktdaten, um Ihre Anfrage zu
          beantworten (Art. 6 Abs. 1 lit. b oder lit. f DSGVO), und löschen sie, sobald sie nicht mehr benötigt werden,
          sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
        </p>

        <h2>12. Links zu GitHub und anderen Websites</h2>
        <p>
          Unsere Website verlinkt auf das AutoSEO-Repository bei GitHub und auf andere externe Websites. An diese Websites
          werden keine Daten übertragen, bis Sie einen Link anklicken (unsere Nutzungsstatistik vermerkt lediglich, dass
          ein Link zu GitHub angeklickt wurde, siehe Abschnitt 5); danach gilt die Datenschutzerklärung des jeweiligen
          Anbieters.
        </p>

        <h2>13. Speicherdauer</h2>
        <p>
          Kontodaten einschließlich der Herkunft der Registrierung speichern wir, solange Sie ein Konto haben. Bei der
          Nutzungsstatistik wird der tägliche Zufallswert nach zwei Tagen und werden die Statistikdaten spätestens nach
          400 Tagen gelöscht (Abschnitt 5). Nach dem Ende Ihres Abonnements wird Ihr Workspace
          pausiert, und seine Daten werden nach 30 Tagen gelöscht. Rechnungen und Buchhaltungsunterlagen bewahren wir für
          die nach deutschem Handels- und Steuerrecht vorgeschriebenen Fristen auf (bis zu 10 Jahre, § 257 HGB, § 147
          AO).
        </p>

        <h2>14. Ihre Rechte</h2>
        <p>Nach der DSGVO haben Sie das Recht auf:</p>
        <ul>
          <li>Auskunft über Ihre personenbezogenen Daten (Art. 15 DSGVO),</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
          <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
          <li>Widerspruch gegen eine Verarbeitung, die auf berechtigten Interessen beruht (Art. 21 DSGVO),</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
        </ul>
        <p>
          Um diese Rechte auszuüben, schreiben Sie an <a href={`mailto:${legal.email}`}>{legal.email}</a>. Sie haben
          außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO), zum Beispiel bei
          der für uns zuständigen Behörde: Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit
          Baden-Württemberg, Lautenschlagerstraße 20, 70173 Stuttgart, Deutschland.
        </p>

        <h2>15. Sicherheit</h2>
        <p>
          Alle Verbindungen sind mit TLS verschlüsselt. Innerhalb von AutoSEO werden gespeicherte Secrets mit AES-256-GCM
          verschlüsselt, und API-Keys und Tokens werden nur als Hashwerte gespeichert. In AutoSEO Cloud ist der Zugriff
          auf die Daten eines Workspaces auf die Mitglieder dieses Workspaces beschränkt sowie, soweit für den Betrieb des
          Dienstes erforderlich, auf unsere Administratoren.
        </p>

        <h2>16. Änderungen</h2>
        <p>
          Wir aktualisieren diese Datenschutzerklärung, wenn sich unsere Dienste oder rechtliche Anforderungen ändern. Die
          aktuelle Fassung ist stets auf dieser Seite abrufbar. Siehe auch unsere{" "}
          <Link href="/de/terms">Allgemeinen Geschäftsbedingungen</Link> und unser <Link href="/de/imprint">Impressum</Link>.
        </p>
      </SiteLegalPage>
    </>
  );
}

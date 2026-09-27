import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";
import { affiliateTermsUpdated } from "./affiliate-terms.en";

const { legal } = site;

const page: SitePage = {
  path: "/affiliate-terms",
  crumb: "Bedingungen Empfehlungsprogramm",
  meta: {
    title: "Bedingungen des AutoSEO-Empfehlungsprogramms",
    description:
      "Allgemeine Bedingungen des AutoSEO-Empfehlungsprogramms der Codext GmbH: Aufnahme, verbotene Praktiken, Kennzeichnung, Kündigung, Haftung, deutsches Recht.",
  },
  hero: {
    eyebrow: "Rechtliches",
    title: "Bedingungen des Empfehlungsprogramms",
    subtitle:
      "Allgemeine Bedingungen für Partner im AutoSEO-Empfehlungsprogramm (Affiliate-Programm). Wo Ihre individuelle schriftliche Vereinbarung mit der Codext GmbH abweicht, hat sie Vorrang.",
    updated: affiliateTermsUpdated,
  },
  sections: [
    {
      kind: "checklist",
      id: "summary",
      eyebrow: "Zusammenfassung",
      title: "Die Bedingungen in Kürze",
      items: [
        "Teilnahme nur auf Bewerbung; über die Aufnahme entscheidet die Codext GmbH",
        "Provision und Auszahlung werden individuell schriftlich vereinbart – öffentliche Sätze gibt es nicht",
        "Kein Brand Bidding, keine Marken in Anzeigen, kein Cookie Stuffing, kein Spam, keine irreführenden Aussagen",
        "Jede bezahlte Empfehlung ist deutlich zu kennzeichnen",
        "Es gilt deutsches Recht; Ihre individuelle schriftliche Vereinbarung hat Vorrang",
      ],
      aside: [
        { type: "h3", text: "Nur zur Orientierung" },
        { type: "p", text: "Diese Zusammenfassung dient der Übersicht. Verbindlich sind allein die vollständigen Bedingungen unten und Ihre individuelle Vereinbarung." },
      ],
    },
    {
      kind: "prose",
      id: "terms",
      eyebrow: "Vollständige Bedingungen",
      title: "Allgemeine Bedingungen des AutoSEO-Empfehlungsprogramms",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Ihre individuelle Vereinbarung hat Vorrang",
          text: "Provision, Laufzeit, Zuordnung und Auszahlung werden individuell schriftlich vereinbart. Diese allgemeinen Bedingungen gelten ergänzend. Soweit Ihre individuelle schriftliche Vereinbarung von ihnen abweicht, geht die individuelle Vereinbarung vor.",
        },
        { type: "h2", text: "1. Geltungsbereich und Vertragsparteien", id: "scope" },
        {
          type: "p",
          text: `Diese Bedingungen regeln die Teilnahme am AutoSEO-Empfehlungsprogramm (Affiliate-Programm, nachfolgend „Programm“). Ihr Vertragspartner ist die ${legal.name}, ${legal.street}, ${legal.postalCode} ${legal.city}, eingetragen beim ${legal.registerCourt} unter ${legal.registerNumber} (nachfolgend „Codext“, „wir“, „uns“). Sie gelten für alle natürlichen und juristischen Personen, die in das Programm aufgenommen wurden (nachfolgend „Partner“, „Sie“).`,
        },
        { type: "h2", text: "2. Begriffsbestimmungen", id: "definitions" },
        {
          type: "ul",
          items: [
            `**AutoSEO Cloud:** der kostenpflichtige, verwaltete AutoSEO-Dienst, den Codext unter ${site.host} anbietet.`,
            "**Qualifizierte Empfehlung:** ein Neukunde, der infolge Ihrer Bewerbung ein kostenpflichtiges Abonnement von AutoSEO Cloud abschließt, nach der in Ihrer individuellen Vereinbarung festgelegten Methode zugeordnet wird, zuvor noch kein Kunde war und dessen Vermittlung diesen Bedingungen entspricht.",
            `**Markenbegriffe:** die Namen „AutoSEO“ und „AutoSEO Cloud“, das AutoSEO-Logo, die Domain ${site.host} sowie sämtliche Falschschreibungen, Abwandlungen und Kombinationen davon.`,
            "**Individuelle Vereinbarung:** die schriftliche Vereinbarung zwischen Ihnen und Codext, die Provision, Laufzeit, Zuordnung und Auszahlung festlegt.",
          ],
        },
        { type: "h2", text: "3. Bewerbung und Aufnahme", id: "acceptance" },
        {
          type: "p",
          text: "Die Teilnahme setzt eine Bewerbung und unsere Annahme in Textform (etwa per E-Mail) voraus. Wir entscheiden nach eigenem Ermessen und müssen eine Ablehnung nicht begründen. Vor der Annahme und dem Abschluss einer individuellen Vereinbarung kommt kein Vertragsverhältnis zustande.",
        },
        {
          type: "p",
          text: "Mit Ihrer Bewerbung bestätigen Sie, dass Ihre Angaben richtig und vollständig sind und Sie berechtigt sind, diese Vereinbarung einzugehen. Sie handeln als selbstständiger Unternehmer. Das Programm begründet kein Arbeitsverhältnis, keine Gesellschaft, kein Joint Venture und keine Handelsvertretung; Sie sind nicht berechtigt, Erklärungen im Namen von Codext abzugeben oder entgegenzunehmen.",
        },
        { type: "h2", text: "4. Provision und Auszahlung", id: "commission" },
        {
          type: "p",
          text: "Provisionssätze, Provisionsdauer, Zuordnungsmethode, Auszahlungsintervalle und Auszahlungswege ergeben sich ausschließlich aus Ihrer individuellen Vereinbarung. Soweit diese nichts anderes bestimmt, gilt:",
        },
        {
          type: "ul",
          items: [
            "Eine Provision entsteht nur für qualifizierte Empfehlungen und berechnet sich aus den bei uns tatsächlich eingegangenen Nettobeträgen, ohne Umsatzsteuer, Erstattungen, Rückbuchungen und strittige Zahlungen;",
            "wir dürfen Provisionen zurückhalten oder zurückfordern, wenn Empfehlungen gegen diese Bedingungen verstoßen, erstattet oder zurückgebucht werden oder wenn der begründete Verdacht auf Betrug oder Manipulation besteht;",
            "Sie sind für Ihre eigenen Steuern verantwortlich und stellen uns die Angaben zur Verfügung, die wir für eine ordnungsgemäße Rechnung oder Gutschrift benötigen.",
          ],
        },
        { type: "h2", text: "5. Verbotene Praktiken", id: "prohibited" },
        {
          type: "p",
          text: "Die folgenden Praktiken sind untersagt. Darüber zustande gekommene Empfehlungen sind in keinem Fall provisionsberechtigt, und ein Verstoß berechtigt uns zur außerordentlichen Kündigung mit sofortiger Wirkung (Ziffer 9).",
        },
        { type: "h3", text: "5.1 Brand Bidding und Marken in Anzeigen" },
        {
          type: "ul",
          items: [
            "das Buchen von Markenbegriffen als Keywords – in jeder Keyword-Option, allein oder kombiniert mit Wörtern wie „login“, „preise“, „erfahrungen“, „alternative“, „vs“ oder „gutschein“ – bei Google Ads, Microsoft Advertising oder anderen Werbeplattformen;",
            "die Verwendung von Markenbegriffen in Anzeigentiteln, Beschreibungen, angezeigten URLs, Sitelinks oder sonstigen Anzeigenbestandteilen;",
            "Anzeigen, die mit offizieller Werbung von AutoSEO oder Codext verwechselt werden können;",
            "die Registrierung von Domains, Social-Media-Konten oder App-Namen, die Markenbegriffe enthalten oder ihnen verwechselbar ähnlich sind.",
          ],
        },
        { type: "h3", text: "5.2 Cookie Stuffing und Umleitung von Traffic" },
        {
          type: "ul",
          items: [
            "das Setzen von Empfehlungs-Cookies oder Tracking-Parametern ohne echten, bewussten Klick des Nutzers (Cookie Stuffing, erzwungene Klicks, versteckte iFrames oder Pixel);",
            "Browser-Erweiterungen, Toolbars, Adware oder Skripte, die Empfehlungslinks einfügen oder überschreiben;",
            "Typosquatting sowie Weiterleitungen von Domains, die unsere Domains nachahmen;",
            "Empfehlungen an sich selbst, an bestehende Kunden oder an mit Ihnen verbundene Unternehmen, sofern nicht schriftlich anders vereinbart.",
          ],
        },
        { type: "h3", text: "5.3 Irreführende Aussagen" },
        {
          type: "ul",
          items: [
            "unwahre oder nicht belegte Aussagen über AutoSEO, seine Funktionen, Preise oder Ergebnisse – insbesondere versprochene Rankings, garantierte Erwähnungen in KI-Antworten oder erfundene Kundenergebnisse;",
            "gefälschte Bewertungen, Erfahrungsberichte oder Vergleichstests;",
            "Rabattcodes, die wir Ihnen nicht ausgestellt haben, sowie Seiten, die Rabatte nur vortäuschen;",
            "das Auftreten als Codext, als AutoSEO-Support oder als offizieller Partner über das Programm hinaus.",
          ],
        },
        { type: "h3", text: "5.4 Spam und unerwünschte Nachrichten" },
        {
          type: "ul",
          items: [
            "unverlangte E-Mails, Direktnachrichten oder Anrufe, auch in Foren, Communities und sozialen Netzwerken, sowie jede Werbung ohne die gesetzlich erforderliche Einwilligung der Empfänger;",
            "Pop-ups, Pop-unders oder andere aufdringliche Formate, die Nutzer zum Klick auf einen Empfehlungslink drängen;",
            "Bewerbung auf Websites oder Kanälen mit rechtswidrigen, diskriminierenden, pornografischen, gewaltverherrlichenden oder sonst unangemessenen Inhalten.",
          ],
        },
        { type: "h2", text: "6. Offenlegung und Kennzeichnung von Werbung", id: "disclosure" },
        {
          type: "p",
          text: "Sie müssen deutlich offenlegen, dass Sie für Empfehlungen von AutoSEO Cloud eine Provision erhalten können – unmittelbar bei der Empfehlung oder dem Link und bevor der Nutzer klickt. Versteckte Hinweise, etwa nur im Footer, hinter einem „Mehr“-Link oder zwischen zahlreichen Hashtags, genügen nicht.",
        },
        {
          type: "p",
          text: "Sie sind dafür verantwortlich, die für Ihr Publikum geltenden Vorschriften des Werbe- und Verbraucherschutzrechts einzuhalten. Dazu zählen etwa das Gesetz gegen den unlauteren Wettbewerb (UWG), die Kennzeichnungspflichten für kommerzielle Kommunikation nach dem Digitale-Dienste-Gesetz (DDG) und dem Medienstaatsvertrag (MStV) sowie – bei Publikum in den Vereinigten Staaten – die FTC-Richtlinien zur Verwendung von Empfehlungen und Erfahrungsberichten in der Werbung (16 CFR Part 255).",
        },
        {
          type: "p",
          text: "Geeignete Kennzeichnungen sind zum Beispiel „Anzeige“, „Werbung“, „Affiliate-Link“ oder „Ich erhalte eine Provision, wenn Sie sich über diesen Link anmelden“ – jeweils in der Sprache Ihres Publikums.",
        },
        { type: "h2", text: "7. Markenbegriffe und Materialien", id: "brand" },
        {
          type: "p",
          text: "Für die Dauer Ihrer Teilnahme räumen wir Ihnen ein einfaches, nicht übertragbares, jederzeit widerrufliches Recht ein, den Namen AutoSEO, das Logo und die Screenshots aus unserem [Pressebereich](/de/press) ausschließlich zur Bewerbung von AutoSEO Cloud nach Maßgabe dieser Bedingungen zu nutzen. Sie dürfen das Logo nicht verändern, nicht mit eigenen Kennzeichen kombinieren und nicht in bezahlten Anzeigen verwenden. Alle übrigen Rechte verbleiben bei Codext. Die MIT-Lizenz des AutoSEO-Quellcodes gewährt keine Rechte an der Marke AutoSEO.",
        },
        { type: "h2", text: "8. Datenschutz", id: "data-protection" },
        {
          type: "p",
          text: "Jede Partei ist selbst für die Einhaltung des Datenschutzrechts verantwortlich. Insbesondere obliegt es Ihnen, erforderliche Einwilligungen für Tracking-Technologien auf Ihren eigenen Kanälen einzuholen. Wir verarbeiten Ihre personenbezogenen Daten als Partner, um das Programm durchzuführen und Provisionen auszuzahlen.",
        },
        { type: "h2", text: "9. Laufzeit und Kündigung", id: "termination" },
        {
          type: "p",
          text: "Die Teilnahme läuft auf unbestimmte Zeit. Jede Partei kann sie mit einer Frist von 14 Tagen in Textform kündigen, sofern Ihre individuelle Vereinbarung keine andere Frist vorsieht. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt; ein wichtiger Grund liegt insbesondere bei Verstößen gegen die Ziffern 5 und 6 vor.",
        },
        {
          type: "p",
          text: "Nach Beendigung müssen Sie Empfehlungslinks und unsere Markenmaterialien unverzüglich von Ihren Kanälen entfernen. Provisionen für qualifizierte Empfehlungen, die vor der Beendigung zustande gekommen sind, bleiben nach Maßgabe Ihrer individuellen Vereinbarung zahlbar, sofern sie nicht durch einen Verstoß gegen diese Bedingungen erzielt wurden.",
        },
        { type: "h2", text: "10. Haftung", id: "liability" },
        {
          type: "p",
          text: "Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz. Bei leichter Fahrlässigkeit haften wir nur für die Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) – also solcher Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags erst ermöglicht und auf deren Einhaltung Sie regelmäßig vertrauen dürfen –, begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Im Übrigen ist unsere Haftung ausgeschlossen.",
        },
        {
          type: "p",
          text: "Sie stellen uns von Ansprüchen Dritter frei, die aus Ihrem Verstoß gegen diese Bedingungen oder gegen geltendes Recht entstehen, einschließlich der angemessenen Kosten der Rechtsverteidigung, es sei denn, Sie haben den Verstoß nicht zu vertreten. Wir gewährleisten weder eine ununterbrochene Verfügbarkeit von AutoSEO Cloud oder des Empfehlungs-Trackings noch eine bestimmte Höhe von Provisionen.",
        },
        { type: "h2", text: "11. Änderungen dieser Bedingungen", id: "changes" },
        {
          type: "p",
          text: "Wir können diese allgemeinen Bedingungen mit Wirkung für die Zukunft ändern. Über Änderungen informieren wir Sie mindestens 30 Tage vor ihrem Inkrafttreten in Textform. Widersprechen Sie nicht innerhalb dieser Frist, gelten die Änderungen als angenommen; auf diese Folge weisen wir in der Mitteilung gesondert hin. Widersprechen Sie, kann jede Partei die Teilnahme kündigen. Änderungen dieser allgemeinen Bedingungen berühren Ihre individuelle Vereinbarung nur mit Ihrer Zustimmung.",
        },
        { type: "h2", text: "12. Anwendbares Recht und Gerichtsstand", id: "law" },
        {
          type: "p",
          text: `Für diese Bedingungen und alle Verträge im Rahmen des Programms gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG). Sind Sie Kaufmann, juristische Person des öffentlichen Rechts oder haben Sie keinen allgemeinen Gerichtsstand in Deutschland, ist ausschließlicher Gerichtsstand der Sitz der ${legal.name}.`,
        },
        { type: "h2", text: "13. Schlussbestimmungen", id: "final" },
        {
          type: "p",
          text: "Änderungen und Ergänzungen bedürfen der Textform. Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt (salvatorische Klausel). Ihre individuelle schriftliche Vereinbarung hat Vorrang vor diesen allgemeinen Bedingungen. Diese Bedingungen liegen auf Deutsch und Englisch vor; bei Abweichungen ist die deutsche Fassung maßgeblich.",
        },
        { type: "p", text: `Fragen zu diesen Bedingungen: [${legal.email}](mailto:${legal.email}).` },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen zu den Bedingungen",
      items: [
        {
          q: "Was gilt, wenn meine individuelle Vereinbarung etwas anderes vorsieht?",
          a: "Ihre individuelle schriftliche Vereinbarung. Diese allgemeinen Bedingungen gelten für alles, was die individuelle Vereinbarung nicht regelt.",
        },
        {
          q: "Darf ich AutoSEO Cloud mit bezahlten Anzeigen bewerben?",
          a: "Nicht auf AutoSEO-Markenbegriffe und nicht mit AutoSEO-Marken in der Anzeige. Andere bezahlte Werbung für Ihre eigenen Inhalte ist erlaubt, sofern sie diesen Bedingungen entspricht und Ihre individuelle Vereinbarung nichts anderes bestimmt.",
        },
        {
          q: "Wie kennzeichne ich meine Empfehlungen richtig?",
          a: "Unmittelbar bei der Empfehlung oder dem Link und bevor jemand klickt, zum Beispiel mit „Anzeige“ oder „Affiliate-Link – ich erhalte eine Provision, wenn Sie sich anmelden“. Ein Hinweis nur im Footer oder versteckt zwischen Hashtags genügt nicht.",
        },
        {
          q: "Was passiert mit meiner Provision, wenn die Teilnahme endet?",
          a: "Provisionen für qualifizierte Empfehlungen, die vor der Beendigung zustande gekommen sind, bleiben nach Maßgabe Ihrer individuellen Vereinbarung zahlbar, sofern sie nicht durch einen Verstoß gegen diese Bedingungen erzielt wurden.",
        },
        {
          q: "Welches Recht gilt, und wer ist mein Vertragspartner?",
          a: `Deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG). Ihr Vertragspartner ist die ${legal.name} in ${legal.city}.`,
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Fragen zu den Bedingungen?",
      body: "Schreiben Sie uns, bevor Sie mit der Bewerbung beginnen – wir klären offene Punkte lieber vorab.",
      primary: { label: "Kontakt aufnehmen", href: `mailto:${legal.email}?subject=Bedingungen%20Empfehlungsprogramm` },
      secondary: { label: "Empfehlungsprogramm", href: "/de/affiliate-program" },
    },
  ],
};

export default page;

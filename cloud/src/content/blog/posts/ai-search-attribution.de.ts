import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ai-search-attribution",
  title: "Wie ordnen Sie Leads und Umsatz der KI-Suche zu?",
  description:
    "Referrer, UTM-Parameter, GA4-Kanal „AI Assistant“ und die Frage „Wie sind Sie auf uns aufmerksam geworden?“: So messen Sie Umsatz aus ChatGPT & Co.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["attribution", "measurement", "ai-search"],
  readingMinutes: 13,
  lead:
    "Kombinieren Sie drei Signale: KI-Referrals in Ihrer Webanalyse, eine Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“ an jedem Lead und jeder Bestellung sowie Brand-Suchanfragen in der Search Console. Referrals sind präzise, aber lückenhaft: Google weist Klicks aus AI Overviews und AI Mode als organische Suche aus, und wer eine KI-Antwort liest und später Ihre URL eintippt, landet unter „Direkt“. Selbstauskünfte, die Deals und Bestellungen zugeordnet sind, liefern die Umsatzzahl; Referrals und Brand-Suche zeigen, ob diese Zahl plausibel ist.",
  blocks: [
    { type: "h2", text: "Warum taucht KI-Suche in der Webanalyse nicht sauber auf?" },
    {
      type: "p",
      text: "Eine KI-Antwort kann einen Kauf auf drei Wegen beeinflussen. Klickbasierte Analyse erfasst nur den ersten zuverlässig.",
    },
    {
      type: "ul",
      items: [
        "**Klick mit Referrer.** Die Person klickt im Browser auf einen zitierten Link in ChatGPT, Perplexity, Claude, Gemini oder Copilot, und der Browser übermittelt die Herkunft, etwa `chatgpt.com`. Das ist messbar.",
        "**Klick ohne verwertbare Quelle.** Der Link öffnet sich aus einer App, wird auf ein anderes Gerät kopiert oder stammt aus Googles AI Overviews bzw. AI Mode, die Google als organische Suche ausweist. Der Besuch wird „Direkt“ oder „Organisch“ zugeschlagen.",
        "**Gar kein Klick.** Die Person merkt sich den Namen und tippt später Ihre URL ein oder sucht nach Ihrer Marke. Google Analytics ordnet eingetippte URLs `(direct) / (none)` zu ([Google Analytics-Hilfe](https://support.google.com/analytics/answer/15258820)); eine spätere Markensuche zählt als Organic Search.",
      ],
    },
    {
      type: "p",
      text: "Das Bing-Team von Microsoft beschreibt dieselbe Verschiebung: Die Conversion kann „later or on another device“ stattfinden, und viele dieser Signale „are not captured in traditional analytics as it exists today“ ([Bing Webmaster Blog, 2025](https://blogs.bing.com/webmaster/November-2025/How-AI-Search-Is-Changing%E2%80%AFthe%E2%80%AFWay%E2%80%AFConversions%E2%80%AFare-Measured)). **Dunkler KI-Traffic** meint in diesem Beitrag genau das: Einfluss aus KI-Antworten, der Sie ohne erkennbare KI-Quelle erreicht.",
    },

    { type: "h2", text: "Welche KI-Plattformen übergeben einen Referrer und welche nicht?" },
    {
      type: "p",
      text: "Kein KI-Anbieter veröffentlicht eine vollständige Referrer-Spezifikation für alle Apps und Oberflächen. Die Tabelle fasst zusammen, was öffentliche Dokumentation mit Stand September 2026 bestätigt; alles andere sollten Sie in Ihrer eigenen Analyse prüfen.",
    },
    {
      type: "table",
      caption: "Was öffentliche Dokumentation über KI-Traffic-Quellen sagt (Stand: September 2026)",
      head: ["Signal", "Aussage der Quelle", "Quelle (Jahr)"],
      rows: [
        [
          "ChatGPT-Links",
          "Hängt `utm_source=chatgpt.com` an Referral-URLs aus der ChatGPT-Suche an.",
          "[OpenAI Help Center (2026)](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)",
        ],
        [
          "GA4-Kanal „AI Assistant“",
          "Seit 13. Mai 2026, gesetzt per Referrer-Abgleich; genannt werden ChatGPT, Gemini und Claude.",
          "[Google Analytics Release Notes (2026)](https://support.google.com/analytics/answer/9164320)",
        ],
        [
          "GA4-Kanaldefinitionen",
          "AI Assistant umfasst „sources like ChatGPT, Gemini, Deepseek, Copilot, or Grok“ und schließt AI Overviews und AI Mode aus; Organic Search schließt sie ein.",
          "[Google Analytics-Hilfe (2026)](https://support.google.com/analytics/answer/9756891)",
        ],
        [
          "Googles KI-Funktionen",
          "AI Overviews und AI Mode zählen in der Search Console zum Suchtyp „Web“.",
          "[Google Search Central (2025)](https://developers.google.com/search/docs/appearance/ai-features)",
        ],
        [
          "Generative-AI-Bericht",
          "Impressionen nach Seite, Land, Gerät und Datum; keine Klick-Metrik genannt. Für alle Websites seit 31. August 2026.",
          "[Google Search Central Blog (2026)](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)",
        ],
        [
          "Referrer-Inhalt",
          "Browser senden standardmäßig website-übergreifend nur den Origin, nicht Pfad oder Query.",
          "[Chrome for Developers (2020)](https://developer.chrome.com/blog/referrer-policy-new-chrome-default)",
        ],
        [
          "Anteil der KI-Referrals",
          "Unter 1 % des Traffics auf über 1.200 Publisher-Websites; Referrals von Copilot, Perplexity und Gemini gemessen.",
          "[Microsoft Clarity (2025)](https://clarity.microsoft.com/blog/ai-traffic-converts-at-3x-the-rate-of-other-channels-study/)",
        ],
        [
          "Copilot-Zitationen",
          "Zitationen und Grounding-Queries in Copilot und Bings KI-Zusammenfassungen, keine Besuche.",
          "[Bing Webmaster Blog (2026)](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)",
        ],
      ],
    },
    {
      type: "p",
      text: "Daraus folgt zweierlei. Selbst ein sauberer Referrer verrät wenig: Sie sehen, dass ein Besuch von `perplexity.ai` kam, aber nie, welcher Prompt ihn ausgelöst hat. Und Googles KI-Funktionen sind als Traffic-Quelle unsichtbar: Sie sehen, wie oft Ihre Seiten dort erscheinen, doch die Klicks kommen als `google / organic` an. Links aus Apps, kopierte oder abgetippte Links landen meist unter „Direkt“; kein Anbieter dokumentiert das pro App, prüfen Sie es also in Ihren eigenen Berichten.",
    },
    { type: "h3", text: "Wo helfen UTM-Parameter?" },
    {
      type: "p",
      text: "Nur bei Links, die Sie selbst kontrollieren. Die Links, die ein KI-Modell zitiert, kann niemand taggen; der ChatGPT-eigene Parameter ist die dokumentierte Ausnahme.",
    },
    {
      type: "ul",
      items: [
        "**Taggen Sie Ihre eigenen Links**, etwa Links, die Ihre ChatGPT-App oder Ihr [Claude-Konnektor](/blog/claude-connector) ausgibt, mit einer festen `utm_source` pro Plattform.",
        "**Kennen Sie die Rangfolge.** In GA4 setzt der Referrer die Quelle nur „when no other campaign or traffic source fields have been set“ ([Google Analytics-Hilfe](https://support.google.com/analytics/answer/11242841)).",
        "**Rückkehrer bleiben zugeordnet, mit Grenzen.** Weil „a direct-traffic visit that follows a referred visit will never override an existing referrer“, behält eine Rückkehr im selben Browser ihre KI-Quelle. Eine Rückkehr über eine Google-Markensuche oder auf einem anderen Gerät nicht.",
      ],
    },

    { type: "h2", text: "Wie richten Sie GA4 für KI-Referrals ein?" },
    {
      type: "p",
      text: "Beginnen Sie mit dem Standardkanal **AI Assistant**. Seit dem 13. Mai 2026 setzt GA4 das Medium `ai-assistant`, die Kampagne `(ai-assistant)` und den Kanal AI Assistant, wenn der Referrer zu einem erkannten Assistenten passt. Google veröffentlicht weder die vollständige Liste noch, ob ältere Daten neu zugeordnet wurden.",
    },
    {
      type: "p",
      text: "Eine benutzerdefinierte Channelgruppe gibt Ihnen Kontrolle über die Liste und die Historie vor Mai 2026. Die Schritte mit den Bezeichnungen der englischen Oberfläche, Stand September 2026 ([Google Analytics-Hilfe](https://support.google.com/analytics/answer/13051316)):",
    },
    {
      type: "ol",
      items: [
        "Unter **Admin** im Bereich **Data display** auf **Channel groups** und dann **Create new channel group** klicken; die Gruppe startet als Kopie der Standardgruppe.",
        "**Add new channel** wählen, einen Namen vergeben (etwa „AI assistants“) und über **+ Add condition group** die Bedingung **Source** mit **matches regex** setzen.",
        "Mit **Reorder** den Kanal über Referral schieben, denn GA4 ordnet Traffic „in the first channel whose definition it matches“ zu. Danach **Save group**.",
        "Unter **Acquisition → Traffic acquisition** die neue Gruppe als primäre Dimension wählen.",
      ],
    },
    {
      type: "p",
      text: "Standard-Properties erlauben zwei eigene Gruppen (fünf bei 360) mit je bis zu 50 Kanälen, und eigene Gruppen wirken rückwirkend auf Berichte. Reguläre Ausdrücke in GA4 sind standardmäßig ein vollständiger Abgleich ([Google Analytics-Hilfe](https://support.google.com/analytics/answer/1034324)). Googles Beispielmuster ist weit gefasst und trifft auch fremde Quellen, die nur „gpt“ oder „gemini“ enthalten. Ein engerer Ausgangspunkt, den Sie gegen Ihre echten Quellen testen sollten:",
    },
    {
      type: "code",
      lang: "regex",
      title: "GA4-Kanal: Source matches regex (Beispiel)",
      code: "^(.+\\.)?(chatgpt\\.com|chat\\.openai\\.com|perplexity\\.ai|claude\\.ai|gemini\\.google\\.com|copilot\\.microsoft\\.com|chat\\.deepseek\\.com|grok\\.com|chat\\.mistral\\.ai|meta\\.ai)$",
    },
    {
      type: "p",
      text: "Googles KI-Funktionen erfasst keine solche Regel: Ihre Klicks tragen Googles Referrer, GA4 kann sie nicht von klassischen organischen Ergebnissen trennen. Zu den beiden Oberflächen siehe [AI Mode vs. AI Overviews](/blog/ai-mode-vs-ai-overviews).",
    },

    { type: "h2", text: "Warum erfasst „Wie sind Sie auf uns aufmerksam geworden?“ den dunklen KI-Traffic?" },
    {
      type: "p",
      text: "Eine Selbstauskunft hängt weder von Referrern noch von Cookies oder Geräten ab. Wer vor drei Wochen eine Empfehlung in ChatGPT gelesen und dann Ihre URL auf dem Firmenlaptop eingetippt hat, erscheint in GA4 als „Direkt“, kann im Demo-Formular aber trotzdem „ChatGPT“ wählen.",
    },
    {
      type: "p",
      text: "Der gemessene Anteil ist klein: Microsoft Clarity fand KI-Referrals bei unter 1 % des Traffics der untersuchten Publisher-Websites (2025). Wie viel Einfluss hinter dieser Zahl steckt, zeigen Referral-Zahlen nicht; die Frage an die Käuferin oder den Käufer schon.",
    },
    { type: "h3", text: "Wie sollten Sie die Frage stellen?" },
    {
      type: "ul",
      items: [
        "**Im Moment der Conversion fragen**: im Anmelde- oder Demo-Formular, im Checkout oder auf der Danke-Seite, damit die Antwort an einem Datensatz hängt, den Sie zuordnen können.",
        "**KI-Suche als eigene Option anbieten**, mit der Folgefrage „Welcher KI-Assistent?“. Ohne sie verschwinden KI-Antworten unter „Google“ oder „Sonstiges“.",
        "**Freitext unter „Sonstiges“ zulassen** und normalisieren: „über Perplexity gefunden“ ist KI-Suche.",
        "**Auf die Reihenfolge achten.** Die Umfrageforschung belegt Primacy-Effekte bei visuell präsentierten Listen: Frühere Optionen werden häufiger gewählt ([Krosnick & Alwin, 1987](https://doi.org/10.1086/269029)). Rotieren Sie die Reihenfolge oder stellen Sie KI-Suche zumindest nicht standardmäßig an den Anfang.",
      ],
    },
    { type: "h3", text: "Wo liegen Selbstauskünfte daneben?" },
    {
      type: "p",
      text: "Antworten sind Erinnerungen, keine Logdaten. Menschen nennen womöglich den einprägsamsten Kontaktpunkt, fassen mehrere zu einem zusammen oder sagen „Google“, wenn sie nach einem KI-Gespräch gesucht haben. Behandeln Sie die Antwort als Sicht der Kundschaft, weisen Sie die Antwortquote mit aus und gleichen Sie sie mit Referral-Daten ab.",
    },

    { type: "h2", text: "Wie verknüpfen Sie Antworten mit Deals und Bestellungen?" },
    {
      type: "p",
      text: "Zur Attribution wird eine Antwort erst, wenn sie an Umsatz hängt. Ordnen Sie jede Antwort über den stärksten verfügbaren Schlüssel einer Conversion zu:",
    },
    {
      type: "ol",
      items: [
        "**Bestell- oder Transaktions-ID**, wenn die Frage im Checkout oder auf der Danke-Seite steht.",
        "**E-Mail-Adresse**, idealerweise gehasht, wenn die Antwort aus einem Formular stammt und Kauf oder Deal später folgen.",
        "**Eine First-Party-Browser-ID**, wenn derselbe Browser antwortet und konvertiert.",
      ],
    },
    {
      type: "p",
      text: "Legen Sie dann Regeln fest: ein Rückblickfenster, wie alt eine Antwort sein darf, strikte 1:1-Zuordnung, damit eine Antwort nicht zwei Bestellungen beansprucht, und keine Zuordnung von Verlängerungen, die den ursprünglichen Deal doppelt zählen würden.",
    },
    {
      type: "p",
      text: "Im B2B speichern Sie die Antwort als Feld am Kontakt, übertragen sie auf den Deal und berichten den Closed-won-Betrag je Antwort.",
    },

    { type: "h2", text: "Wie triangulieren Sie Referrals, Umfragen und Brand-Suche?" },
    {
      type: "p",
      text: "Kein Signal stimmt für sich allein. Nutzen Sie jedes für das, was es tatsächlich misst:",
    },
    {
      type: "table",
      caption: "Vier Signale für die Attribution der KI-Suche und ihre blinden Flecken",
      head: ["Signal", "Was es zeigt", "Blinder Fleck"],
      rows: [
        [
          "KI-Referrals (GA4 AI Assistant oder eigener Kanal)",
          "Klicks aus KI-Antworten, Einstiegsseiten, Key Events und Umsatz",
          "Googles KI-Funktionen, Apps, Einfluss ohne Klick",
        ],
        [
          "Umfrageantworten, verknüpft mit Conversions",
          "Umsatz, den Kundschaft der KI-Suche zuschreibt, je Assistent",
          "Erinnerungsfehler, Nicht-Antwortende",
        ],
        [
          "Brand-Suche (Search Console)",
          "Ob mehr Menschen gezielt nach Ihnen suchen",
          "Sagt nicht, was die Suche ausgelöst hat",
        ],
        [
          "KI-Sichtbarkeit und Zitationen",
          "Wie oft KI-Antworten Sie zeigen oder zitieren",
          "Keine Besuche, kein Umsatz",
        ],
      ],
    },
    {
      type: "p",
      text: "Für die Brand-Suche nutzen Sie den Filter für Markensuchanfragen (branded queries) im Leistungsbericht der Search Console, eingeführt im November 2025 und seit 11. März 2026 für alle berechtigten Websites verfügbar. Google klassifiziert Markensuchen mit „an internal, AI-assisted system“, einschließlich Tippfehlern und eindeutiger Produkte, räumt ein, dass „some queries may occasionally be misidentified“, und bietet den Filter nur für übergeordnete Properties mit ausreichendem Volumen an ([Google Search Central Blog](https://developers.google.com/search/blog/2025/11/search-console-branded-filter)).",
    },
    {
      type: "p",
      text: "Für die Sichtbarkeit zeigt der Generative-AI-Bericht der Search Console Impressionen in AI Overviews und AI Mode, der AI-Performance-Bericht von Bing Zitationen in Copilot. Beide messen keine Besuche: Nutzen Sie sie, um Trends zu erklären, nicht um Umsatz zu zählen.",
    },
    {
      type: "p",
      text: "Um den dunklen KI-Traffic abzuschätzen, übertragen Sie den KI-Anteil der Umfrage auf alle Bestellungen und den durchschnittlichen Bestellwert und ziehen den KI-Umsatz ab, den die Webanalyse bereits ausweist. Das setzt voraus, dass die Antwortenden für alle Kunden stehen; berichten Sie das Ergebnis daher als Schätzung, nie als gebuchten Umsatz.",
    },

    { type: "h2", text: "Wie sieht das in der Praxis aus?" },
    {
      type: "p",
      text: "**Beispiel (hypothetisch, alle Zahlen dienen nur der Veranschaulichung):** Ein B2B-Softwareanbieter will wissen, was die KI-Suche im letzten Quartal beigetragen hat.",
    },
    {
      type: "ol",
      items: [
        "**Referral-Basis.** GA4 zeigt 14 Demo-Anfragen aus dem Kanal AI Assistant, von insgesamt 200.",
        "**Umfrage.** Das Demo-Formular fragt „Wie sind Sie auf uns aufmerksam geworden?“. 150 von 200 antworten (75 %); 33 wählen KI-Suche (22 %): 20 ChatGPT, 8 Perplexity, 5 Gemini.",
        "**Zuordnung zu Deals.** Die Antwort wird am Kontakt gespeichert und auf den Deal übertragen. Von 40 gewonnenen Deals über 240.000 € tragen 9 eine KI-Antwort, zusammen 54.000 €.",
        "**Lücke abschätzen.** Wenn Nicht-Antwortende den Antwortenden ähneln (eine Annahme), waren rund 44 von 200 Anfragen KI-beeinflusst (22 % × 200), gegenüber 14 in der Webanalyse. Etwa 30 kamen als Direkt-, organischer oder Referral-Traffic an.",
        "**Plausibilität prüfen.** Die Brand-Klicks in der Search Console stiegen, die Nicht-Brand-Klicks blieben gleich, und beobachtete Prompts zeigen die Marke häufiger in ChatGPT zitiert. Beides passt zur Umfrage, beweist sie aber nicht.",
        "**Entscheiden.** Das Team berichtet 14 Anfragen als Untergrenze aus der Webanalyse, 54.000 € als selbst berichteten KI-Umsatz und rund 44 Anfragen als Schätzung.",
      ],
    },

    { type: "h2", text: "Was bedeutet das für Sie?" },
    {
      type: "ul",
      items: [
        "Prüfen Sie im GA4-Bericht Traffic acquisition den Kanal AI Assistant und suchen Sie nach Zeilen mit `chatgpt.com` oder `perplexity.ai`, die noch unter Referral oder Unassigned stehen.",
        "Ergänzen Sie Ihr bestehendes Formular oder Ihren Checkout um KI-Suche als Antwortoption, mit Folgefrage nach dem Assistenten.",
        "Hängen Sie die Antwort an Deal oder Bestellung und berichten Sie Umsatz je Antwort, nicht nur Leads.",
        "Verfolgen Sie Brand-Klicks in der Search Console neben dem KI-Anteil der Umfrage.",
        "Berichten Sie drei Zahlen nebeneinander: Untergrenze aus der Webanalyse, selbst berichteter KI-Umsatz, geschätzte Lücke.",
        "Prüfen Sie das Setup quartalsweise; GA4 und die Search Console haben sich in den letzten zwölf Monaten mehrfach geändert.",
      ],
    },

    { type: "h2", text: "Wie messen Sie das mit AutoSEO?" },
    {
      type: "p",
      text: "[Die KI-Suche-Attribution von AutoSEO](/ai-search-attribution) setzt die hier beschriebene Methode aus Umfrage und Zuordnung um:",
    },
    {
      type: "ul",
      items: [
        "**Umfrage-Snippet.** Es erkennt ein vorhandenes Feld wie „Wie sind Sie auf uns aufmerksam geworden?“ in Ihren Formularen (Deutsch oder Englisch) und speichert die Antwort beim Absenden, oder es zeigt nach Formularversand und Kauf ein kurzes Popup. Jede Person wird einmal gefragt (localStorage, keine Cookies); E-Mail-Adressen werden, wo möglich, schon im Browser mit SHA-256 gehasht.",
        "**KI-Suche als eigener Kanal.** Antworten landen in KI-Suche, Google / Bing, Social Media, Online-Werbung, Empfehlung, Blog / Artikel / Podcast oder Sonstiges, optional mit der Folgefrage „Welcher KI-Assistent?“. Freitext wird normalisiert („Google Gemini“ ist KI, „Google Ads“ ist Werbung), und Sie können Optionen umsortieren, umbenennen und ausblenden.",
        "**Conversions und Deals.** Stripe (signierter Webhook; Verlängerungen werden nie zugeordnet), ein Shopify Custom Pixel, Webhooks für WooCommerce und Shopware sowie GA- und Meta-Pixel-Events, die das Snippet passiv erfasst. HubSpot, Salesforce, Pipedrive, Attio und Close senden Lead-Quelle und Deal-Wert per Workflow-Webhook mit Feldzuordnung; siehe [Attributions-Integrationen](/integrations/attribution) und [HubSpot](/integrations/hubspot).",
        "**Zuordnung.** Über Bestell-ID, dann gehashte E-Mail, dann Besucher-ID im selben Browser, strikt 1:1, mit 90 Tagen Rückblick; Antworten bis 48 Stunden nach der Bestellung zählen noch.",
        "**Berichte.** Deal-Wert aus KI-Suche je Kanal und Assistent, dazu **Hidden AI revenue** (KI-Anteil der Umfrage × Bestellungen × durchschnittlicher Bestellwert, abzüglich des bereits in der Webanalyse ausgewiesenen KI-Umsatzes), **Survey response rate** und **Visibility ↔ AI leads**, eine Korrelation mit Ihrem [KI-Sichtbarkeits-Tracking](/ai-visibility-tracking).",
        "**Referral-Seite.** [KI-Traffic-Analyse](/ai-traffic-analytics) synchronisiert KI-verwiesene Sitzungen aus [Google Analytics](/integrations/google-analytics), Matomo oder Piwik PRO nach Plattform und Einstiegsseite. Wie jedes Referral-Werkzeug kann sie Klicks aus AI Overviews oder AI Mode nicht von der organischen Suche trennen.",
        "**Für Agenten.** Der [MCP-Server](/mcp-server) stellt `get_attribution_summary` und `list_attributions` bereit; die [REST-API](/rest-api) liefert dieselben Daten.",
      ],
    },
    {
      type: "p",
      text: "AutoSEO ist Open Source: [kostenlos selbst hosten](/self-hosting) oder die verwaltete [AutoSEO Cloud](/pricing) nutzen.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Methode und Grenzen",
      text: "Dieser Beitrag fasst öffentliche Dokumentation von OpenAI, Google und Microsoft sowie Umfrageforschung zusammen, Stand September 2026. AutoSEO verfügt über keinen eigenen Traffic-Datensatz; das Praxisbeispiel ist hypothetisch. Nirgends dokumentiert fanden wir: wie jede KI-App Referrer übergibt, welche Assistenten GA4 vollständig erkennt und ob GA4 Daten vor Mai 2026 neu zugeordnet hat. Selbstauskünfte und die Schätzung des verdeckten Umsatzes beruhen auf Annahmen (ehrliche Erinnerung, repräsentative Antwortende), und eine Korrelation zwischen Sichtbarkeit und KI-Antworten beweist keine Kausalität.",
    },
  ],
  faq: [
    {
      q: "Taucht ChatGPT-Traffic in Google Analytics auf?",
      a: "Ja, wenn jemand auf einen Link klickt und der Browser einen Referrer sendet oder der Link `utm_source=chatgpt.com` trägt. Seit Mai 2026 fasst GA4 erkannte KI-Referrer im Standardkanal AI Assistant zusammen. Wer einen Link kopiert, das Gerät wechselt oder Ihre URL später eintippt, erscheint als „Direkt“.",
    },
    {
      q: "Kann ich Klicks aus Google AI Overviews und AI Mode getrennt sehen?",
      a: "Mit Stand September 2026 nicht. Google zählt diese Klicks in der Search Console zum Suchtyp „Web“ und in GA4 zur Organic Search. Der Generative-AI-Bericht der Search Console zeigt Impressionen; Sie sehen also die Sichtbarkeit, nicht die Besuche, die daraus entstehen.",
    },
    {
      q: "Wie verlässlich sind Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“?",
      a: "Sie sind subjektiv: Menschen erinnern sich falsch, fassen Kontaktpunkte zusammen und lassen sich von der Reihenfolge der Optionen beeinflussen. Trotzdem ist es das einzige Signal, das Einfluss ohne Klick erfasst. Nutzen Sie es für Richtung und Umsatzanteile und gleichen Sie es mit Referrals und Brand-Suche ab.",
    },
    {
      q: "Multiple Choice oder offene Frage?",
      a: "Beides: eine kurze Liste mit KI-Suche als eigener Option plus ein Freitextfeld „Sonstiges“. Die Liste macht Antworten vergleichbar, der Freitext fängt Quellen auf, mit denen Sie nicht gerechnet haben.",
    },
    {
      q: "Wo sollte ich fragen: Formular, Checkout oder Vertriebsgespräch?",
      a: "So nah an der Conversion wie möglich und nur einmal pro Customer Journey. Formulare und Checkout liefern Antworten, die Sie per E-Mail oder Bestell-ID zuordnen können. Antworten aus dem Vertrieb helfen ebenfalls, wenn sie im selben CRM-Feld landen.",
    },
  ],
  sources: [
    { label: "OpenAI Help Center: Publishers and Developers FAQ (2026)", href: "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq" },
    { label: "Google Analytics-Hilfe: What's new in Google Analytics, „New AI Assistant traffic measurement“ (2026)", href: "https://support.google.com/analytics/answer/9164320" },
    { label: "Google Analytics-Hilfe: Default channel group (2026)", href: "https://support.google.com/analytics/answer/9756891" },
    { label: "Google Analytics-Hilfe: Custom channel groups (2026)", href: "https://support.google.com/analytics/answer/13051316" },
    { label: "Google Analytics-Hilfe: Campaigns and traffic sources (2026)", href: "https://support.google.com/analytics/answer/11242841" },
    { label: "Google Analytics-Hilfe: Understand (direct) / (none) traffic (2026)", href: "https://support.google.com/analytics/answer/15258820" },
    { label: "Google Analytics-Hilfe: About regular expressions (2026)", href: "https://support.google.com/analytics/answer/1034324" },
    { label: "Google Search Central: AI features and your website (2025)", href: "https://developers.google.com/search/docs/appearance/ai-features" },
    { label: "Google Search Central Blog: Introducing Search Generative AI performance reports in Search Console (2026)", href: "https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports" },
    { label: "Google Search Central Blog: Introducing the branded queries filter in Search Console (2025, aktualisiert 2026)", href: "https://developers.google.com/search/blog/2025/11/search-console-branded-filter" },
    { label: "Chrome for Developers: A new default Referrer-Policy for Chrome (2020)", href: "https://developer.chrome.com/blog/referrer-policy-new-chrome-default" },
    { label: "Microsoft Clarity: AI Traffic Converts at 3x the Rate of Other Channels (2025)", href: "https://clarity.microsoft.com/blog/ai-traffic-converts-at-3x-the-rate-of-other-channels-study/" },
    { label: "Bing Webmaster Blog: Introducing AI Performance in Bing Webmaster Tools (2026)", href: "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview" },
    { label: "Bing Webmaster Blog: How AI Search Is Changing the Way Conversions are Measured (2025)", href: "https://blogs.bing.com/webmaster/November-2025/How-AI-Search-Is-Changing%E2%80%AFthe%E2%80%AFWay%E2%80%AFConversions%E2%80%AFare-Measured" },
    { label: "Krosnick & Alwin: An Evaluation of a Cognitive Theory of Response-Order Effects in Survey Measurement, Public Opinion Quarterly (1987)", href: "https://doi.org/10.1086/269029" },
  ],
};

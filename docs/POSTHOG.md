# PostHog website analytics

Connect PostHog directly from **Project Settings → Providers**, **Integrations**, or **Analytics → Human Traffic → Settings**. AutoSEO fetches aggregated reports over HTTPS and stores normalized traffic in its existing application database.

## Setup

Enter your PostHog host (`https://eu.posthog.com`, `https://us.posthog.com`, or your self-hosted HTTPS origin), numeric project ID, and personal API key. The public project capture token cannot read analytics. The key is encrypted and never returned to the browser or included in a URL.

AutoSEO uses a saved **Endpoint** report rather than copying individual events. The first connection test or save creates two reusable String SQL variables (`autoseo_date_from`, `autoseo_date_to`) and an `autoseo_website_traffic_*` endpoint. Its name is derived from the report definition, so identical configurations reuse it. Changing the hostname, timezone or event mappings creates a separate report and triggers a full resync. Only date bounds are passed at runtime, and the client pins endpoint version 1.

Use a personal API key with **Endpoint read** access. Initial automatic setup also needs **Endpoint write** and **SQL variable read/write** access (the SQL-variable API uses PostHog's insight-variable permissions). Alternatively, an administrator can create the report first and provide a key with only Endpoint read access. Restrict the key to the intended PostHog project. Changing the host or project requires entering the key again.

Run **Test connection**, then save. The test executes yesterday's report; an empty report is a valid connection. AutoSEO schedules an initial historical sync, followed by daily updates through yesterday with overlap for late data. No export destination, extra Postgres service, or raw-event backfill is required.

## Reporting configuration

If the PostHog project tracks multiple hosts, set the exact website hostname to avoid mixing website and platform traffic. Select the reporting time zone (IANA name, e.g. `Europe/Vienna`) and revenue currency (defaults: UTC and EUR).

Optional conversion event names are comma-separated exact matches. For revenue, set both an event name and a numeric top-level event property. Revenue must already be in currency units, not cents; AutoSEO does not convert currencies. Unmapped conversion and revenue metrics are unavailable and displayed as zero with a notice.

## Measurements and limits

- Uses PostHog's native session start, landing page, pageview count, duration and bounce flag; sessions without pageviews are excluded.
- AI sources use AutoSEO's shared referrer/UTM classifier. The organic benchmark uses PostHog's native `Organic Search` channel.
- Country comes from the session's first pageview. Visitors use PostHog's resolved person identity, unique within each reporting group; a visitor can appear in several groups.
- Conversion and revenue events are attributed to their session's landing page and start date. Events are scanned through one day after a reporting window for sessions crossing midnight. Events arriving later require another sync.
- Reports contain only date × landing page × country × source × channel aggregates. They do not return individual events, session IDs or person IDs.
- Each request covers at most seven days and 2,000 reporting groups. Busy windows are split by date. A single day exceeding this cap fails with a clear message instead of silently importing partial data.
- Saved reports are cached for up to one day. A changed or disabled report, missing columns, unexpected version, malformed response, or incomplete report causes sync to fail before replacing that window's data.
- Endpoint support must be available in the connected PostHog installation. PostHog's [Endpoints documentation](https://posthog.com/docs/endpoints) describes availability and operation.

The free-form `/query` API and event export API are not used for scheduled synchronization. See [Endpoints vs Query API](https://posthog.com/docs/endpoints/endpoints-vs-query-api) for the supported reporting approach.

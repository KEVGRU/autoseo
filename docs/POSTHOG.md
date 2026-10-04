# PostHog website analytics via Postgres exports

AutoSEO imports website analytics from a standard PostHog **Events** batch export. It reads the export database using a separate read-only account, then writes only aggregated traffic metrics to its own database. It does not use PostHog's Query API for scheduled extraction.

## Prepare the destination

Use a dedicated Postgres database, separate from AutoSEO's application database. Enable TLS, publish its endpoint only as necessary for PostHog and AutoSEO, and restrict incoming connections to the relevant PostHog export addresses and your application server. Use a publicly trusted certificate, or supply the CA certificate to AutoSEO. AutoSEO always verifies the certificate and original hostname/IP; private and loopback connection destinations are rejected.

Create a writer account for PostHog and a reader account for AutoSEO. For example, run these commands as a database administrator with `psql`. Supply strong, distinct passwords using psql variables; do not commit credentials:

```sql
-- Run while connected to the dedicated export database.
CREATE ROLE posthog_exporter LOGIN PASSWORD :'writer_password';
CREATE ROLE autoseo_reader LOGIN PASSWORD :'reader_password';
CREATE SCHEMA posthog_exports AUTHORIZATION posthog_exporter;
GRANT USAGE ON SCHEMA posthog_exports TO autoseo_reader;
ALTER DEFAULT PRIVILEGES FOR ROLE posthog_exporter IN SCHEMA posthog_exports
  GRANT SELECT ON TABLES TO autoseo_reader;
ALTER ROLE autoseo_reader SET default_transaction_read_only = on;
```

After the export creates its table, grant access to existing tables as well and add a timestamp index:

```sql
GRANT SELECT ON ALL TABLES IN SCHEMA posthog_exports TO autoseo_reader;
CREATE INDEX IF NOT EXISTS posthog_events_timestamp_idx
  ON posthog_exports.events (timestamp);
```

The export writer needs only access to this dedicated schema. The application reader needs SELECT, not INSERT, UPDATE, DELETE, or CREATE. Review database-level PUBLIC privileges to ensure neither account can access unrelated databases or create objects outside the export schema.

## Configure PostHog

In the intended PostHog project, add a scheduled **Postgres** destination using the writer credentials, database name, `posthog_exports` schema, and `events` table. Export the Events model with all browser pageviews, activity, and the custom conversion/revenue events you intend to measure. Enable TLS and test the destination.

Complete the historical backfill **before** the first AutoSEO sync. Keep exports running at least daily (hourly is preferable). AutoSEO imports through yesterday in the configured reporting time zone, with a three-day overlap for late data. If you later backfill older history or an outage exceeds that overlap, trigger a full sync in AutoSEO.

Use the standard JSONB `properties` and a timestamp field. AutoSEO accepts timestamps with a time zone, or timestamps without a time zone interpreted as UTC, and validates those types and requires `uuid`, `event`, `team_id`, and `distinct_id`. Additional export columns are ignored.

See [PostHog's Postgres destination guide](https://posthog.com/docs/cdp/batch-exports/postgres) and [batch export guide](https://posthog.com/docs/cdp/batch-exports).

## Connect AutoSEO

Open the project's Integrations page or Analytics → Human Traffic → Settings and choose PostHog. Enter the numeric PostHog project ID (events are filtered by `team_id`) and the export database host/IP, port, database, reader username and password, schema, and table. The password is encrypted and is never returned to the browser. Changing the credential destination requires re-entering the password.

For a private certificate authority, encode the CA's PEM file as base64 and enter it in the optional CA field. A valid public certificate needs no custom CA.

Set the reporting time zone to match the website. Set an exact landing-page hostname if the PostHog project contains multiple websites. Configure conversion event names and, optionally, a revenue event plus its numeric top-level property. Revenue values must already be in the configured currency and in currency units, not cents; AutoSEO does not convert currencies.

Test the connection, save, and let the initial job finish. Changing source selection, time zone or event mappings clears the old provider aggregates and starts a full import so incompatible measurements are not mixed.

## Measurement limits

- Sessions are reconstructed from exported events carrying `$session_id`; pageviews without a session ID and sessions without `$pageview` are excluded.
- The first exported event sets session start; the first pageview supplies landing page, country and attribution. Export all session activity to avoid truncating these measurements.
- Duration is the time between the first and last exported events. A session is engaged if it has at least ten seconds of recorded activity, multiple pageviews, or an autocapture interaction. Replay-only activity may not be represented.
- Organic acquisition is inferred from entry UTM medium or a known search-engine referrer; it may differ from PostHog's native channel classification.
- Visitors use the final exported `distinct_id` per session, rather than PostHog's full person-merge graph. Distinct visitors can overlap across traffic dimensions when totals are combined.
- Conversion/revenue metrics without mappings are unavailable and displayed as zero with a notice. Invalid numeric revenue values are ignored.
- UUID deduplication prevents export retries from multiplying events. Session activity across midnight is scanned on both sides of each import window and attributed to the session's start date.
- Imports use seven-day windows with a 50,000-row aggregate limit per window and a database statement timeout. A failed query does not replace that window's stored aggregates.

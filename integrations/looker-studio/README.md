# AutoSEO connector for Looker Studio

A [community connector](https://developers.google.com/looker-studio/connector) that pulls AI visibility (GEO) data
from **your own AutoSEO instance** into Looker Studio through the REST API v1. Nothing is stored outside Google Apps
Script: the connector keeps your instance URL and API key in your user properties and calls your instance directly.

| Dataset | Endpoint | Rows |
|---|---|---|
| Daily AI visibility | `GET /api/v1/projects/{id}/metrics/timeseries` | one per day |
| Competitor ranking | `GET /api/v1/projects/{id}/competitors/ranking` | your brand + competitors |
| Cited sources | `GET /api/v1/projects/{id}/sources/ranking` | pages (or domains) cited in AI answers |
| Prompts | `GET /api/v1/projects/{id}/prompts` | tracked prompts with metrics |
| Query fan-outs | `GET /api/v1/projects/{id}/fanouts` | search sub-queries AI engines ran |

## 1. Create an API key

In AutoSEO open **Settings → API & MCP → Create key**. The **read** scope is enough; restrict the key to the projects
you want to report on. Copy the key (`as_live_…`) — it is shown once.

## 2. Deploy the connector

**Copy & paste (no tooling):**

1. Open [script.google.com](https://script.google.com) → **New project**, name it "AutoSEO connector".
2. Replace the content of `Code.gs` with [`Code.gs`](./Code.gs) from this folder.
3. **Project settings → Show "appsscript.json" manifest file in editor**, then replace `appsscript.json` with
   [`appsscript.json`](./appsscript.json).
4. **Deploy → Test deployments → Install** (or **Deploy → New deployment → Type: Add-on / Looker Studio connector**
   to share it with your organisation). Copy the deployment ID.
5. Open `https://lookerstudio.google.com/datasources/create?connectorId=<DEPLOYMENT_ID>`.

**With clasp:**

```bash
npm i -g @google/clasp && clasp login
cd integrations/looker-studio
clasp create --type standalone --title "AutoSEO connector"
clasp push && clasp deploy --description "AutoSEO"
```

## 3. Connect

1. Looker Studio asks for **Path** and **Key**: enter your instance URL (e.g. `https://seo.example.com`) and the API
   key. The connector checks them against `GET /api/v1/me`. `https://` is required (plain `http://` only works for
   `localhost` while testing).
2. Pick the **project** (the list shows every project the key can access), the **dataset** and optional filters:
   - **Timeframe** — *Report date range* (default) follows the report's date control; or pin 7–365 days.
   - **Models**, **Tags**, **Markets** — comma-separated engine ids (`chatgpt, perplexity, ai_overview, …`), prompt tag
     names and ISO country codes.
   - **Sources: group by** — page URL or domain (Cited sources only).
   - **Competitors: include untracked brands** — also rank brands AI names that aren't on your competitor list.
3. Create one data source per dataset and blend them in reports as needed.

## Field reference

Percentages are 0–100 in the API and are divided by 100 for Looker's **Percent** type (50 → 0.5, shown as 50 %).
Changes in percentage points ("… change (pp)") stay plain numbers. Rates use **Average** as default aggregation — for a
weighted daily visibility use a calculated field `SUM(Visible answers) / SUM(Answers)`.

| Dataset | Dimensions | Metrics |
|---|---|---|
| Daily AI visibility | Date | Answers, Visible answers, Visibility %, Mention rate %, Citation rate %, Avg. position, Sentiment (0–100), Mentioned & cited, Mentioned only, Cited only, Not visible |
| Competitor ranking | Brand, Brand domain, Own brand, Brand source | Rank, Visibility %, Visibility change (pp), Mention rate %, Mentions, Citation rate %, Citations, Share of voice %, #1 share %, Top-3 share %, Citation share %, Sentiment, Avg. position |
| Cited sources | URL, Title, Domain, Content type, Ownership, Models | Rank, Citations, Citations change, Prompts, Answers |
| Prompts | Prompt ID, Prompt, Market, Language, Status, Funnel stage, Intent, Persona, Tags, Models, Created, Last run, Visible, Competitors mentioned | Answers, Visibility %, Visibility change (pp), Mention rate %, Mentions, Citation rate %, Own-domain citations, Sentiment, Avg. position |
| Query fan-outs | Fan-out query, Intent, Coverage, Covering URL, Models, Prompts, First seen, Last seen | Frequency, Prompt count, Word count, Answers, Brand mentioned %, Own page cited % |

Definitions of every KPI: `GET /api/v1/openapi.json` (component `PeriodMetrics`) or the in-app tooltips.

## Limits & security

- Paginated datasets fetch up to 25 pages of 200 rows (5,000 rows) per refresh; each page is one API request and
  counts toward your instance's API rate limit (Admin → Limits & Budgets). Looker caches results (default 12 h).
- `appsscript.json` has no `urlFetchWhitelist` because every AutoSEO instance has its own URL. For a stricter
  deployment add `"urlFetchWhitelist": ["https://seo.example.com/"]` with your instance URL.
- The key never leaves Apps Script except as the `Authorization: Bearer` header to your instance. Revoke it any time in
  Settings → API & MCP; *Reset auth* in the data source clears the stored URL and key.
- For raw, row-level exports (answers, mentions, citations, fan-outs as CSV / NDJSON with incremental `since`), use
  `GET /api/v1/projects/{id}/export/bulk` (export scope) instead — see the OpenAPI document.

## Development

`test/looker-studio.test.ts` runs `Code.gs` in a Node `vm` with stubbed Apps Script services against trimmed real
API responses (`test/fixtures/looker-studio/`): `pnpm test test/looker-studio.test.ts`.

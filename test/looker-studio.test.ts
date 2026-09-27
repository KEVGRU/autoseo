import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

/*
 * Runs integrations/looker-studio/Code.gs (Apps Script) in a Node vm with stubbed Apps Script
 * services. The fixtures are trimmed real responses of the REST API v1 (dev server).
 */

const ROOT = path.resolve(__dirname, "..");
const CODE = fs.readFileSync(path.join(ROOT, "integrations/looker-studio/Code.gs"), "utf8");
const fixture = (name: string) => fs.readFileSync(path.join(ROOT, "test/fixtures/looker-studio", `${name}.json`), "utf8");

type Json = Record<string, unknown>;
type FieldDef = { id?: string; name?: string; type?: string; description?: string; aggregation?: string; concept: "DIMENSION" | "METRIC" };

class UserError extends Error {
  debug = "";
}

function fakeFields(defs: FieldDef[] = []) {
  const make = (concept: FieldDef["concept"]) => {
    const f: FieldDef = { concept };
    defs.push(f);
    const b = {
      setId: (v: string) => ((f.id = v), b),
      setName: (v: string) => ((f.name = v), b),
      setType: (v: string) => ((f.type = v), b),
      setDescription: (v: string) => ((f.description = v), b),
      setAggregation: (v: string) => ((f.aggregation = v), b),
    };
    return b;
  };
  return {
    newDimension: () => make("DIMENSION"),
    newMetric: () => make("METRIC"),
    forIds: (ids: string[]) =>
      fakeFields(
        ids.map((id) => {
          const hit = defs.find((d) => d.id === id);
          if (!hit) throw new Error(`no field ${id}`);
          return hit;
        }),
      ),
    build: () =>
      defs.map((d) => ({
        name: d.id,
        label: d.name,
        dataType: d.type === "NUMBER" || d.type === "PERCENT" ? "NUMBER" : d.type === "BOOLEAN" ? "BOOLEAN" : "STRING",
        semantics: { conceptType: d.concept, semanticType: d.type },
        ...(d.aggregation ? { defaultAggregationType: d.aggregation } : {}),
      })),
  };
}

function fakeConfig() {
  const items: Json[] = [];
  let dateRangeRequired = false;
  const item = (kind: string) => {
    const it: Json = { kind, options: [] as Json[] };
    items.push(it);
    const b = {
      setId: (v: string) => ((it.id = v), b),
      setName: (v: string) => ((it.name = v), b),
      setText: (v: string) => ((it.text = v), b),
      setHelpText: (v: string) => ((it.helpText = v), b),
      addOption: (o: { build: () => Json }) => ((it.options as Json[]).push(o.build()), b),
    };
    return b;
  };
  return {
    newInfo: () => item("INFO"),
    newSelectSingle: () => item("SELECT_SINGLE"),
    newTextInput: () => item("TEXTINPUT"),
    newCheckbox: () => item("CHECKBOX"),
    newOptionBuilder: () => {
      const o: Json = {};
      const b = { setLabel: (v: string) => ((o.label = v), b), setValue: (v: string) => ((o.value = v), b), build: () => o };
      return b;
    },
    setDateRangeRequired: (v: boolean) => {
      dateRangeRequired = v;
    },
    build: () => ({ configParams: items, dateRangeRequired }),
  };
}

type Route = (url: URL) => { status: number; body: string } | undefined;

function load(route: Route, props: Record<string, string> = {}) {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const store = new Map(Object.entries(props));
  const enumOf = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, k]));
  const cc = {
    AuthType: enumOf(["NONE", "KEY", "PATH_KEY", "USER_PASS", "USER_TOKEN", "PATH_USER_PASS", "OAUTH2"]),
    FieldType: enumOf(["TEXT", "URL", "YEAR_MONTH_DAY", "BOOLEAN", "NUMBER", "PERCENT"]),
    AggregationType: enumOf(["SUM", "AVG", "MIN", "MAX", "COUNT"]),
    newAuthTypeResponse: () => {
      const r: Json = {};
      const b = { setAuthType: (v: string) => ((r.type = v), b), setHelpUrl: (v: string) => ((r.helpUrl = v), b), build: () => r };
      return b;
    },
    getFields: () => fakeFields(),
    getConfig: () => fakeConfig(),
    newUserError: () => {
      const e = new UserError("");
      const b = {
        setText: (v: string) => ((e.message = v), b),
        setDebugText: (v: string) => ((e.debug = v), b),
        throwException: () => {
          throw e;
        },
      };
      return b;
    },
  };
  const sandbox: Json = {
    DataStudioApp: { createCommunityConnector: () => cc },
    PropertiesService: {
      getUserProperties: () => ({
        getProperty: (k: string) => store.get(k) ?? null,
        setProperty: (k: string, v: string) => void store.set(k, v),
        deleteProperty: (k: string) => void store.delete(k),
      }),
    },
    UrlFetchApp: {
      fetch: (url: string, opts: { headers: Record<string, string> }) => {
        calls.push({ url, headers: opts.headers });
        const res = route(new URL(url)) ?? { status: 404, body: JSON.stringify({ data: null, meta: {}, error: { code: "not_found", message: "No endpoint" } }) };
        return { getResponseCode: () => res.status, getContentText: () => res.body };
      },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(CODE, sandbox, { filename: "Code.gs" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { gs: sandbox as any, calls, store };
}

const ok = (name: string) => ({ status: 200, body: fixture(name) });
const BASE = "https://seo.example.com";
const creds = { "autoseo.instanceUrl": BASE, "autoseo.apiKey": "as_live_test" };

/** Answers like the real API for the fixture project. */
const api: Route = (u) => {
  const p = u.pathname.replace(/^\/api\/v1/, "");
  if (p === "/me") return { status: 200, body: JSON.stringify({ data: { user: {} }, meta: {}, error: null }) };
  if (p === "/projects") return ok("projects");
  const m = /^\/projects\/prj_demo\/(.+)$/.exec(p);
  if (!m) return undefined;
  switch (m[1]) {
    case "metrics/timeseries":
      return ok("timeseries");
    case "competitors/ranking":
      return ok("competitors");
    case "sources/ranking":
      return ok(u.searchParams.get("page") === "2" ? "sources-p2" : "sources-p1");
    case "prompts":
      return ok("prompts");
    case "fanouts":
      return ok("fanouts");
  }
  return undefined;
};

const request = (dataset: string, fields: string[], extra: Json = {}) => ({
  configParams: { projectId: "prj_demo", dataset, ...extra },
  dateRange: { startDate: "2026-09-20", endDate: "2026-09-26" },
  fields: fields.map((name) => ({ name })),
});

describe("Looker Studio connector — pure helpers", () => {
  const { gs } = load(api);
  it("normalizes instance URLs (https only, http for localhost)", () => {
    expect(gs.normalizeInstanceUrl(" https://SEO.example.com/api/v1/ ")).toBe("https://seo.example.com");
    expect(gs.normalizeInstanceUrl("https://example.com/autoseo/")).toBe("https://example.com/autoseo");
    expect(gs.normalizeInstanceUrl("http://localhost:3000")).toBe("http://localhost:3000");
    expect(gs.normalizeInstanceUrl("http://seo.example.com")).toBeNull();
    expect(gs.normalizeInstanceUrl("ftp://seo.example.com")).toBeNull();
    expect(gs.normalizeInstanceUrl("https://user@seo.example.com")).toBeNull();
    expect(gs.normalizeInstanceUrl("")).toBeNull();
  });
  it("declares unique field ids with Looker types for every dataset", () => {
    for (const id of gs.DATASET_IDS as string[]) {
      const fields = gs.fieldList(id) as { id: string; type: string; concept: string; aggregation: string | null }[];
      expect(new Set(fields.map((f) => f.id)).size, id).toBe(fields.length);
      for (const f of fields) {
        expect(["TEXT", "URL", "YEAR_MONTH_DAY", "BOOLEAN", "NUMBER", "PERCENT"]).toContain(f.type);
        if (f.concept === "METRIC") expect(f.aggregation, `${id}.${f.id}`).toBeTruthy();
      }
    }
  });
  it("maps the envelope errors to user errors", () => {
    expect(() => gs.parseEnvelope(401, JSON.stringify({ data: null, error: { code: "invalid_token", message: "bad" } }))).toThrow(/rejected the API key/);
    expect(() => gs.parseEnvelope(429, "{}")).toThrow(/rate limit/);
    expect(() => gs.parseEnvelope(500, "<html>")).toThrow(/API error \(500\)/);
    expect(gs.parseEnvelope(200, JSON.stringify({ data: [1], meta: { a: 1 }, error: null }))).toEqual({ data: [1], meta: { a: 1 } });
  });
  it("builds data URLs from the report date range, a pinned timeframe and filters", () => {
    const a = new URL(gs.buildDataUrl(BASE, { projectId: "prj_demo", dataset: "sources", timeframe: "report", models: "chatgpt, gemini", tags: "", markets: "de", groupBy: "domain" }, { startDate: "2026-09-01", endDate: "2026-09-26" }, 3));
    expect(a.pathname).toBe("/api/v1/projects/prj_demo/sources/ranking");
    expect(Object.fromEntries(a.searchParams)).toEqual({ startDate: "2026-09-01", endDate: "2026-09-26", model: "chatgpt,gemini", market: "de", groupBy: "domain", limit: "200", page: "3" });
    const b = new URL(gs.buildDataUrl(BASE, { projectId: "prj_demo", dataset: "visibility_daily", timeframe: "30" }, { startDate: "2026-09-01", endDate: "2026-09-26" }, 1));
    expect(Object.fromEntries(b.searchParams)).toEqual({ timeframe: "30d" });
  });
});

describe("Looker Studio connector — auth & config", () => {
  it("uses PATH_KEY auth and validates credentials against /me", () => {
    const { gs, store, calls } = load(api);
    expect(gs.getAuthType().type).toBe("PATH_KEY");
    expect(gs.isAuthValid()).toBe(false);
    expect(gs.setCredentials({ pathKey: { path: "http://evil.example.com", key: "x" } })).toEqual({ errorCode: "INVALID_CREDENTIALS" });
    expect(gs.setCredentials({ pathKey: { path: "https://seo.example.com/", key: "as_live_abc" } })).toEqual({ errorCode: "NONE" });
    expect(store.get("autoseo.instanceUrl")).toBe(BASE);
    expect(calls.at(-1)).toEqual({ url: `${BASE}/api/v1/me`, headers: { Authorization: "Bearer as_live_abc", Accept: "application/json" } });
    expect(gs.isAuthValid()).toBe(true);
    gs.resetAuth();
    expect(store.size).toBe(0);
  });
  it("rejects keys the API refuses", () => {
    const { gs } = load(() => ({ status: 401, body: JSON.stringify({ data: null, error: { code: "invalid_token", message: "revoked" } }) }));
    expect(gs.setCredentials({ pathKey: { path: BASE, key: "as_live_revoked" } })).toEqual({ errorCode: "INVALID_CREDENTIALS" });
  });
  it("lists the key's projects in the config and requires a date range", () => {
    const { gs } = load(api, creds);
    const cfg = gs.getConfig({});
    expect(cfg.dateRangeRequired).toBe(true);
    const project = cfg.configParams.find((p: Json) => p.id === "projectId");
    expect(project.options.map((o: Json) => o.value)).toEqual(["prj_1u9dqopoqbk3mcmf", "prj_demo0000000001"]);
    const dataset = cfg.configParams.find((p: Json) => p.id === "dataset");
    expect(dataset.options.map((o: Json) => o.value)).toEqual(["visibility_daily", "competitors", "sources", "prompts", "fanouts"]);
  });
  it("falls back to a project id text input when projects can't be listed", () => {
    const { gs } = load(() => undefined, creds);
    const cfg = gs.getConfig({});
    expect(cfg.configParams.some((p: Json) => p.id === "projectIdManual" && p.kind === "TEXTINPUT")).toBe(true);
  });
});

describe("Looker Studio connector — schema & data", () => {
  it("returns the schema of the selected dataset", () => {
    const { gs } = load(api, creds);
    const { schema } = gs.getSchema({ configParams: { projectId: "prj_demo", dataset: "visibility_daily" } });
    const date = schema.find((f: Json) => f.name === "date");
    expect(date.semantics).toEqual({ conceptType: "DIMENSION", semanticType: "YEAR_MONTH_DAY" });
    expect(schema.find((f: Json) => f.name === "visibility")).toMatchObject({ semantics: { conceptType: "METRIC", semanticType: "PERCENT" }, defaultAggregationType: "AVG" });
    expect(() => gs.getSchema({ configParams: { dataset: "prompts" } })).toThrow(/Choose a project/);
  });
  it("maps daily visibility (percent → ratio, date → YYYYMMDD)", () => {
    const { gs, calls } = load(api, creds);
    const res = gs.getData(request("visibility_daily", ["date", "visibility", "answers", "visible_answers"]));
    expect(res.schema.map((f: Json) => f.name)).toEqual(["date", "visibility", "answers", "visible_answers"]);
    const first = JSON.parse(fixture("timeseries")).data[0];
    expect(res.rows[0].values).toEqual([
      first.date.replace(/-/g, ""),
      first.visibility / 100,
      first.answers,
      first.mentionedAndCited + first.mentionedOnly + first.citedOnly,
    ]);
    expect(res.rows).toHaveLength(JSON.parse(fixture("timeseries")).data.length);
    expect(calls[0]!.url).toBe(`${BASE}/api/v1/projects/prj_demo/metrics/timeseries?startDate=2026-09-20&endDate=2026-09-26`);
  });
  it("follows pagination for sources", () => {
    const { gs, calls } = load(api, creds);
    const res = gs.getData(request("sources", ["url", "domain", "citations", "ownership"]));
    expect(calls.map((c) => new URL(c.url).searchParams.get("page"))).toEqual(["1", "2"]);
    expect(res.rows).toHaveLength(3);
    expect(res.rows[0].values[0]).toMatch(/^https:\/\//);
    expect(typeof res.rows[0].values[2]).toBe("number");
  });
  it("maps competitors, prompts and fan-outs", () => {
    const { gs } = load(api, creds);
    const comp = gs.getData(request("competitors", ["brand", "is_own_brand", "visibility", "share_of_voice", "visibility_change"]));
    const c0 = JSON.parse(fixture("competitors")).data[0];
    expect(comp.rows[0].values).toEqual([c0.name, c0.isOwnBrand, c0.metrics.visibility / 100, c0.metrics.sov / 100, c0.changes.visibility]);

    const prm = gs.getData(request("prompts", ["prompt", "tags", "created", "visibility", "is_visible"]));
    const p0 = JSON.parse(fixture("prompts")).data[0];
    expect(prm.rows[0].values).toEqual([p0.text, p0.tags.map((t: Json) => t.name).join(", "), p0.createdAt.slice(0, 10).replace(/-/g, ""), p0.metrics.visibility / 100, p0.metrics.isVisible]);

    const fan = gs.getData(request("fanouts", ["query", "frequency", "models", "prompts", "last_seen"]));
    const f0 = JSON.parse(fixture("fanouts")).data[0];
    expect(fan.rows[0].values).toEqual([f0.query, f0.frequency, f0.models.join(", "), f0.prompts.map((x: Json) => x.text).join(", "), f0.lastSeen.replace(/-/g, "")]);
  });
  it("surfaces API errors as Looker user errors", () => {
    const { gs } = load(() => ({ status: 429, body: JSON.stringify({ data: null, error: { code: "rate_limited", message: "slow down" } }) }), creds);
    expect(() => gs.getData(request("prompts", ["prompt"]))).toThrow(/rate limit/);
    const unauth = load(api);
    expect(() => unauth.gs.getData(request("prompts", ["prompt"]))).toThrow(/Connect the data source/);
  });
});

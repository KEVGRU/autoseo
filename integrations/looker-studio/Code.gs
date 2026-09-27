/**
 * AutoSEO — Looker Studio community connector.
 *
 * Reads AI visibility (GEO) data from any AutoSEO instance through the REST API v1:
 *   visibility_daily → GET /projects/{id}/metrics/timeseries
 *   competitors      → GET /projects/{id}/competitors/ranking
 *   sources          → GET /projects/{id}/sources/ranking   (paginated)
 *   prompts          → GET /projects/{id}/prompts           (paginated)
 *   fanouts          → GET /projects/{id}/fanouts           (paginated)
 *
 * Auth: PATH_KEY — "path" is the instance URL (e.g. https://seo.example.com), "key" an API key
 * with the read scope (Settings → API & MCP). Both are stored in the user's script properties.
 *
 * Percentages: the API returns 0–100; Looker's PERCENT type expects a ratio, so percentage fields
 * are divided by 100 (50 → 0.5, displayed as 50%). Changes in percentage points stay NUMBER.
 *
 * Top-level values use `var` / function declarations so the pure parts can be unit-tested in
 * Node (test/looker-studio.test.ts loads this file into a vm context with stubbed globals).
 */

var API_PREFIX = '/api/v1';
var PAGE_SIZE = 200;
/** Max pages per request for paginated datasets (200 rows each → 5,000 rows). */
var MAX_PAGES = 25;
var PROP_URL = 'autoseo.instanceUrl';
var PROP_KEY = 'autoseo.apiKey';
var HELP_URL = 'https://github.com/codextde/autoseo/tree/main/integrations/looker-studio';

/* ───────────────────────────── Pure helpers ───────────────────────────── */

/**
 * Normalizes the instance URL typed by the user. Returns null when invalid.
 * https is required; plain http is only accepted for localhost (local testing).
 */
function normalizeInstanceUrl(raw) {
  if (typeof raw !== 'string') return null;
  var v = raw.trim().replace(/\/+$/, '');
  if (v.slice(-API_PREFIX.length) === API_PREFIX) v = v.slice(0, -API_PREFIX.length).replace(/\/+$/, '');
  var m = /^(https?):\/\/([^\/?#@\s]+)(\/[^?#\s]*)?$/i.exec(v);
  if (!m) return null;
  var scheme = m[1].toLowerCase();
  var host = m[2].toLowerCase();
  var hostname = host.replace(/:\d+$/, '');
  if (scheme === 'http' && hostname !== 'localhost' && hostname !== '127.0.0.1') return null;
  return scheme + '://' + host + (m[3] || '').replace(/\/+$/, '');
}

function pct(v) {
  return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number((Number(v) / 100).toFixed(6));
}

function num(v) {
  return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v);
}

function text(v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Array]') return v.join(', ');
  return String(v);
}

/** "2026-09-25" or an ISO timestamp → "20260925" (YEAR_MONTH_DAY). */
function ymd(v) {
  if (!v) return null;
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
  return m ? m[1] + m[2] + m[3] : null;
}

function names(list) {
  if (!list || !list.length) return '';
  return list
    .map(function (x) {
      return x && typeof x === 'object' ? x.name || x.text || x.id || '' : String(x);
    })
    .filter(function (x) {
      return x;
    })
    .join(', ');
}

/**
 * Field kinds → Looker types:
 *   dim: TEXT | URL | YEAR_MONTH_DAY | BOOLEAN (dimensions)
 *   metric: NUMBER | PERCENT with a default aggregation (SUM for counts, AVG for rates)
 */
function dim(id, name, type, get, description) {
  return { id: id, name: name, type: type, concept: 'DIMENSION', get: get, description: description || '' };
}

function metric(id, name, type, aggregation, get, description) {
  return { id: id, name: name, type: type, concept: 'METRIC', aggregation: aggregation, get: get, description: description || '' };
}

function brandMetric(key) {
  return function (r) {
    return r.metrics ? r.metrics[key] : null;
  };
}

function brandChange(key) {
  return function (r) {
    return r.changes ? num(r.changes[key]) : null;
  };
}

var DATASETS = {
  visibility_daily: {
    label: 'Daily AI visibility',
    path: '/metrics/timeseries',
    paginated: false,
    fields: [
      dim('date', 'Date', 'YEAR_MONTH_DAY', function (r) { return ymd(r.date); }),
      metric('answers', 'Answers', 'NUMBER', 'SUM', function (r) { return num(r.answers); }, 'Tracked AI answers that day.'),
      metric('visible_answers', 'Visible answers', 'NUMBER', 'SUM', function (r) {
        return num((r.mentionedAndCited || 0) + (r.mentionedOnly || 0) + (r.citedOnly || 0));
      }, 'Answers naming the brand or citing an own page. SUM(Visible answers) / SUM(Answers) = weighted visibility.'),
      metric('visibility', 'Visibility', 'PERCENT', 'AVG', function (r) { return pct(r.visibility); }),
      metric('mention_rate', 'Mention rate', 'PERCENT', 'AVG', function (r) { return pct(r.mentionRate); }),
      metric('citation_rate', 'Citation rate', 'PERCENT', 'AVG', function (r) { return pct(r.citationRate); }),
      metric('avg_position', 'Avg. position', 'NUMBER', 'AVG', function (r) { return num(r.avgPosition); }, '1 = named first; lower is better.'),
      metric('sentiment', 'Sentiment', 'NUMBER', 'AVG', function (r) { return num(r.sentiment); }, '0–100 (80+ strongly positive).'),
      metric('mentioned_and_cited', 'Mentioned & cited', 'NUMBER', 'SUM', function (r) { return num(r.mentionedAndCited); }),
      metric('mentioned_only', 'Mentioned only', 'NUMBER', 'SUM', function (r) { return num(r.mentionedOnly); }),
      metric('cited_only', 'Cited only', 'NUMBER', 'SUM', function (r) { return num(r.citedOnly); }),
      metric('not_visible', 'Not visible', 'NUMBER', 'SUM', function (r) { return num(r.notVisible); }),
    ],
  },
  competitors: {
    label: 'Competitor ranking',
    path: '/competitors/ranking',
    paginated: true,
    fields: [
      metric('rank', 'Rank', 'NUMBER', 'MIN', function (r) { return num(r.rank); }),
      dim('brand', 'Brand', 'TEXT', function (r) { return text(r.name); }),
      dim('brand_domain', 'Brand domain', 'TEXT', function (r) { return text(r.domain); }),
      dim('is_own_brand', 'Own brand', 'BOOLEAN', function (r) { return !!r.isOwnBrand; }),
      dim('brand_source', 'Brand source', 'TEXT', function (r) { return text(r.source); }, 'own, manual, auto, import or untracked.'),
      metric('visibility', 'Visibility', 'PERCENT', 'AVG', function (r) { return pct(brandMetric('visibility')(r)); }),
      metric('visibility_change', 'Visibility change (pp)', 'NUMBER', 'AVG', brandChange('visibility'), 'vs the previous period of equal length, in percentage points.'),
      metric('mention_rate', 'Mention rate', 'PERCENT', 'AVG', function (r) { return pct(brandMetric('mentionRate')(r)); }),
      metric('mentions', 'Mentions', 'NUMBER', 'SUM', function (r) { return num(brandMetric('mentions')(r)); }),
      metric('citation_rate', 'Citation rate', 'PERCENT', 'AVG', function (r) { return pct(brandMetric('citationRate')(r)); }),
      metric('citations', 'Citations', 'NUMBER', 'SUM', function (r) { return num(brandMetric('citations')(r)); }),
      metric('share_of_voice', 'Share of voice', 'PERCENT', 'AVG', function (r) { return pct(brandMetric('sov')(r)); }),
      metric('first_share', '#1 share', 'PERCENT', 'AVG', function (r) { return pct(brandMetric('firstShare')(r)); }),
      metric('top3_share', 'Top-3 share', 'PERCENT', 'AVG', function (r) { return pct(brandMetric('top3Share')(r)); }),
      metric('citation_share', 'Citation share', 'PERCENT', 'AVG', function (r) { return pct(brandMetric('citationShare')(r)); }),
      metric('sentiment', 'Sentiment', 'NUMBER', 'AVG', function (r) { return num(brandMetric('sentiment')(r)); }),
      metric('avg_position', 'Avg. position', 'NUMBER', 'AVG', function (r) { return num(brandMetric('avgPosition')(r)); }),
    ],
  },
  sources: {
    label: 'Cited sources',
    path: '/sources/ranking',
    paginated: true,
    fields: [
      metric('rank', 'Rank', 'NUMBER', 'MIN', function (r) { return num(r.rank); }),
      dim('url', 'URL', 'URL', function (r) { return text(r.url || (r.domain ? 'https://' + r.domain : '')); }),
      dim('title', 'Title', 'TEXT', function (r) { return text(r.title); }),
      dim('domain', 'Domain', 'TEXT', function (r) { return text(r.domain); }),
      dim('content_type', 'Content type', 'TEXT', function (r) { return text(r.contentType); }),
      dim('ownership', 'Ownership', 'TEXT', function (r) { return text(r.ownership); }, 'own, competitor or third_party.'),
      dim('models', 'Models', 'TEXT', function (r) { return text(r.models); }),
      metric('citations', 'Citations', 'NUMBER', 'SUM', function (r) { return num(r.citations); }),
      metric('citations_change', 'Citations change', 'NUMBER', 'SUM', function (r) { return num(r.citationsChange); }),
      metric('prompts', 'Prompts', 'NUMBER', 'MAX', function (r) { return num(r.prompts); }),
      metric('answers', 'Answers', 'NUMBER', 'SUM', function (r) { return num(r.answers); }),
    ],
  },
  prompts: {
    label: 'Prompts',
    path: '/prompts',
    paginated: true,
    fields: [
      dim('prompt_id', 'Prompt ID', 'TEXT', function (r) { return text(r.id); }),
      dim('prompt', 'Prompt', 'TEXT', function (r) { return text(r.text); }),
      dim('country', 'Market', 'TEXT', function (r) { return text(r.country); }),
      dim('language', 'Language', 'TEXT', function (r) { return text(r.language); }),
      dim('status', 'Status', 'TEXT', function (r) { return text(r.status); }),
      dim('funnel_stage', 'Funnel stage', 'TEXT', function (r) { return text(r.funnelStage); }),
      dim('intent', 'Intent', 'TEXT', function (r) { return text(r.intent); }),
      dim('persona', 'Persona', 'TEXT', function (r) { return text(r.persona); }),
      dim('tags', 'Tags', 'TEXT', function (r) { return names(r.tags); }),
      dim('models', 'Models', 'TEXT', function (r) { return text(r.models); }),
      dim('created', 'Created', 'YEAR_MONTH_DAY', function (r) { return ymd(r.createdAt); }),
      dim('last_run', 'Last run', 'YEAR_MONTH_DAY', function (r) { return ymd(r.lastRunAt); }),
      dim('is_visible', 'Visible', 'BOOLEAN', function (r) { return !!(r.metrics && r.metrics.isVisible); }),
      metric('answers', 'Answers', 'NUMBER', 'SUM', function (r) { return num(r.metrics && r.metrics.answers); }),
      metric('visibility', 'Visibility', 'PERCENT', 'AVG', function (r) { return pct(r.metrics && r.metrics.visibility); }),
      metric('visibility_change', 'Visibility change (pp)', 'NUMBER', 'AVG', function (r) { return num(r.metrics && r.metrics.visibilityChange); }),
      metric('mention_rate', 'Mention rate', 'PERCENT', 'AVG', function (r) { return pct(r.metrics && r.metrics.mentionRate); }),
      metric('mentions', 'Mentions', 'NUMBER', 'SUM', function (r) { return num(r.metrics && r.metrics.totalMentions); }),
      metric('citation_rate', 'Citation rate', 'PERCENT', 'AVG', function (r) { return pct(r.metrics && r.metrics.citationRate); }),
      metric('own_citations', 'Own-domain citations', 'NUMBER', 'SUM', function (r) { return num(r.metrics && r.metrics.ownDomainCitations); }),
      metric('sentiment', 'Sentiment', 'NUMBER', 'AVG', function (r) { return num(r.metrics && r.metrics.sentiment); }),
      metric('avg_position', 'Avg. position', 'NUMBER', 'AVG', function (r) { return num(r.metrics && r.metrics.avgPosition); }),
      dim('competitors_mentioned', 'Competitors mentioned', 'TEXT', function (r) { return names(r.competitorsMentioned); }),
    ],
  },
  fanouts: {
    label: 'Query fan-outs',
    path: '/fanouts',
    paginated: true,
    fields: [
      dim('query', 'Fan-out query', 'TEXT', function (r) { return text(r.query); }),
      dim('intent', 'Intent', 'TEXT', function (r) { return text(r.intent); }),
      dim('coverage', 'Coverage', 'TEXT', function (r) { return text(r.coverage); }, 'covered, partial or gap (own site).'),
      dim('covering_url', 'Covering URL', 'URL', function (r) { return text(r.coveringUrl || r.coverageUrl); }),
      dim('models', 'Models', 'TEXT', function (r) { return text(r.models); }),
      dim('prompts', 'Prompts', 'TEXT', function (r) { return names(r.prompts); }),
      dim('first_seen', 'First seen', 'YEAR_MONTH_DAY', function (r) { return ymd(r.firstSeen); }),
      dim('last_seen', 'Last seen', 'YEAR_MONTH_DAY', function (r) { return ymd(r.lastSeen); }),
      metric('frequency', 'Frequency', 'NUMBER', 'SUM', function (r) { return num(r.frequency); }, 'How often AI engines searched the sub-query.'),
      metric('prompt_count', 'Prompt count', 'NUMBER', 'MAX', function (r) { return num(r.promptCount); }),
      metric('word_count', 'Word count', 'NUMBER', 'AVG', function (r) { return num(r.wordCount); }),
      metric('answers', 'Answers', 'NUMBER', 'SUM', function (r) { return num(r.answers); }),
      metric('brand_mentioned', 'Brand mentioned', 'PERCENT', 'AVG', function (r) { return pct(r.brandMentionedPct); }),
      metric('own_cited', 'Own page cited', 'PERCENT', 'AVG', function (r) { return pct(r.ownCitedPct); }),
    ],
  },
};

var DATASET_IDS = ['visibility_daily', 'competitors', 'sources', 'prompts', 'fanouts'];

function getDataset(id) {
  var ds = DATASETS[id];
  if (!ds) throw userError('Unknown dataset "' + id + '". Edit the data source and pick a dataset.');
  return ds;
}

/** Plain JSON description of a dataset's fields (used by the builders and the tests). */
function fieldList(datasetId) {
  return getDataset(datasetId).fields.map(function (f) {
    return { id: f.id, name: f.name, type: f.type, concept: f.concept, aggregation: f.aggregation || null, description: f.description };
  });
}

/** Maps API rows to Looker rows ({ values: [...] }) for the requested field ids (in order). */
function toLookerRows(datasetId, rows, fieldIds) {
  var ds = getDataset(datasetId);
  var byId = {};
  ds.fields.forEach(function (f) {
    byId[f.id] = f;
  });
  var picked = fieldIds.map(function (id) {
    var f = byId[id];
    if (!f) throw userError('Unknown field "' + id + '" for dataset ' + ds.label + '. Refresh the data source fields.');
    return f;
  });
  return rows.map(function (row) {
    return {
      values: picked.map(function (f) {
        var v = f.get(row);
        if (f.type === 'TEXT' || f.type === 'URL') return v === null || v === undefined ? '' : v;
        return v === undefined ? null : v;
      }),
    };
  });
}

function splitList(v) {
  return String(v || '')
    .split(/[,;\n]/)
    .map(function (x) {
      return x.trim();
    })
    .filter(function (x) {
      return x;
    });
}

function encodeParams(params) {
  var out = [];
  Object.keys(params).forEach(function (k) {
    var v = params[k];
    if (v === null || v === undefined || v === '') return;
    out.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
  });
  return out.join('&');
}

/**
 * Builds the REST URL of one page of a dataset. The report date range is used unless the data
 * source pins a timeframe (7/30/90/… days).
 */
function buildDataUrl(baseUrl, config, dateRange, page) {
  var ds = getDataset(config.dataset);
  var params = {};
  if (config.timeframe && config.timeframe !== 'report') params.timeframe = config.timeframe + 'd';
  else if (dateRange && dateRange.startDate) {
    params.startDate = dateRange.startDate;
    params.endDate = dateRange.endDate;
  }
  var models = splitList(config.models);
  var tags = splitList(config.tags);
  var markets = splitList(config.markets);
  if (models.length) params.model = models.join(',');
  if (tags.length) params.tags = tags.join(',');
  if (markets.length) params.market = markets.join(',');
  if (config.dataset === 'sources' && config.groupBy === 'domain') params.groupBy = 'domain';
  if (config.dataset === 'competitors' && config.includeUntracked === 'true') {
    params.brandScope = 'all';
    params.includeUntracked = 'true';
  }
  if (ds.paginated) {
    params.limit = PAGE_SIZE;
    params.page = page || 1;
  }
  return baseUrl + API_PREFIX + '/projects/' + encodeURIComponent(config.projectId) + ds.path + '?' + encodeParams(params);
}

function userError(message, debug) {
  var e = new Error(message);
  e.isUserError = true;
  e.debug = debug || '';
  return e;
}

/** Parses the `{ data, meta, error }` envelope; throws a user-facing error for failures. */
function parseEnvelope(status, body) {
  var json = null;
  try {
    json = JSON.parse(body);
  } catch (err) {
    json = null;
  }
  var apiMessage = json && json.error && json.error.message ? String(json.error.message).replace(/\.+$/, '') : '';
  if (status === 401) throw userError('AutoSEO rejected the API key (401). Re-connect the data source with a valid key from Settings → API & MCP.', apiMessage);
  if (status === 403) throw userError('The API key is missing a permission or scope (403): ' + (apiMessage || 'read scope required') + '.', apiMessage);
  if (status === 404) throw userError('Not found (404): ' + (apiMessage || 'check the instance URL and the project') + '.', apiMessage);
  if (status === 429) throw userError('AutoSEO rate limit reached (429). Wait a minute and refresh, or raise the API rate limit in Admin → Limits.', apiMessage);
  if (status >= 400 || !json) {
    throw userError('AutoSEO API error' + (status ? ' (' + status + ')' : '') + ': ' + (apiMessage || 'unexpected response') + '.', String(body).slice(0, 500));
  }
  if (json.error) throw userError('AutoSEO API error: ' + json.error.message, JSON.stringify(json.error));
  return { data: json.data, meta: json.meta || {} };
}

/* ───────────────────────────── Apps Script I/O ───────────────────────────── */

var cc = DataStudioApp.createCommunityConnector();

function getCredentials() {
  var props = PropertiesService.getUserProperties();
  return { url: props.getProperty(PROP_URL), key: props.getProperty(PROP_KEY) };
}

function apiFetch(url, key) {
  var res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' },
    muteHttpExceptions: true,
    followRedirects: true,
  });
  return parseEnvelope(res.getResponseCode(), res.getContentText());
}

/** Fetches every page of a dataset (capped at MAX_PAGES). */
function fetchDataset(creds, config, dateRange) {
  var ds = getDataset(config.dataset);
  var first = apiFetch(buildDataUrl(creds.url, config, dateRange, 1), creds.key);
  var rows = (first.data || []).slice();
  if (!ds.paginated) return rows;
  var pages = first.meta && first.meta.pagination ? first.meta.pagination.totalPages || 1 : 1;
  for (var page = 2; page <= Math.min(pages, MAX_PAGES); page++) {
    var next = apiFetch(buildDataUrl(creds.url, config, dateRange, page), creds.key);
    rows = rows.concat(next.data || []);
  }
  return rows;
}

function throwUserError(err) {
  cc.newUserError()
    .setDebugText(String((err && err.debug) || (err && err.stack) || err))
    .setText(err && err.isUserError ? err.message : 'AutoSEO connector error: ' + ((err && err.message) || err))
    .throwException();
}

/* ── Auth (PATH_KEY: instance URL + API key) ── */

function getAuthType() {
  return cc.newAuthTypeResponse().setAuthType(cc.AuthType.PATH_KEY).setHelpUrl(HELP_URL).build();
}

function setCredentials(request) {
  var pathKey = request && request.pathKey ? request.pathKey : {};
  var url = normalizeInstanceUrl(pathKey.path);
  var key = String(pathKey.key || '').trim();
  if (!url || !key) return { errorCode: 'INVALID_CREDENTIALS' };
  try {
    apiFetch(url + API_PREFIX + '/me', key);
  } catch (err) {
    return { errorCode: 'INVALID_CREDENTIALS' };
  }
  var props = PropertiesService.getUserProperties();
  props.setProperty(PROP_URL, url);
  props.setProperty(PROP_KEY, key);
  return { errorCode: 'NONE' };
}

function isAuthValid() {
  var creds = getCredentials();
  if (!creds.url || !creds.key) return false;
  try {
    apiFetch(creds.url + API_PREFIX + '/me', creds.key);
    return true;
  } catch (err) {
    return false;
  }
}

function resetAuth() {
  var props = PropertiesService.getUserProperties();
  props.deleteProperty(PROP_URL);
  props.deleteProperty(PROP_KEY);
}

function isAdminUser() {
  return false;
}

/* ── Config ── */

function listProjects(creds) {
  var out = [];
  for (var page = 1; page <= 10; page++) {
    var res = apiFetch(creds.url + API_PREFIX + '/projects?' + encodeParams({ limit: 200, page: page }), creds.key);
    out = out.concat(res.data || []);
    var total = res.meta && res.meta.pagination ? res.meta.pagination.totalPages || 1 : 1;
    if (page >= total) break;
  }
  return out;
}

function getConfig(request) {
  var config = cc.getConfig();
  config
    .newInfo()
    .setId('info')
    .setText('Pick the AutoSEO project and the dataset. Data follows the report date range unless you pin a timeframe below.');

  var projectSelect = config.newSelectSingle().setId('projectId').setName('Project').setHelpText('Projects the API key can access.');
  var projects = [];
  try {
    projects = listProjects(getCredentials());
  } catch (err) {
    projects = [];
  }
  if (projects.length) {
    projects.forEach(function (p) {
      projectSelect.addOption(config.newOptionBuilder().setLabel(p.name + ' (' + p.domain + ')').setValue(p.id));
    });
  } else {
    config.newTextInput().setId('projectIdManual').setName('Project ID').setHelpText('prj_… — shown in the project URL (/p/<id>).');
  }

  var datasetSelect = config.newSelectSingle().setId('dataset').setName('Dataset');
  DATASET_IDS.forEach(function (id) {
    datasetSelect.addOption(config.newOptionBuilder().setLabel(DATASETS[id].label).setValue(id));
  });

  var timeframe = config.newSelectSingle().setId('timeframe').setName('Timeframe').setHelpText('Default: the report date range.');
  [
    ['Report date range', 'report'],
    ['Last 7 days', '7'],
    ['Last 14 days', '14'],
    ['Last 30 days', '30'],
    ['Last 90 days', '90'],
    ['Last 180 days', '180'],
    ['Last 365 days', '365'],
  ].forEach(function (o) {
    timeframe.addOption(config.newOptionBuilder().setLabel(o[0]).setValue(o[1]));
  });

  config.newTextInput().setId('models').setName('Models (optional)').setHelpText('Comma-separated engine ids, e.g. chatgpt, perplexity, ai_overview. Empty = all.');
  config.newTextInput().setId('tags').setName('Tags (optional)').setHelpText('Comma-separated prompt tag names. Empty = all prompts.');
  config.newTextInput().setId('markets').setName('Markets (optional)').setHelpText('Comma-separated ISO country codes, e.g. DE, FR. Empty = all.');

  var groupBy = config.newSelectSingle().setId('groupBy').setName('Sources: group by').setHelpText('Only for the Cited sources dataset.');
  groupBy.addOption(config.newOptionBuilder().setLabel('Page (URL)').setValue('url'));
  groupBy.addOption(config.newOptionBuilder().setLabel('Domain').setValue('domain'));

  config
    .newCheckbox()
    .setId('includeUntracked')
    .setName('Competitors: include untracked brands')
    .setHelpText('Also rank brands AI names that are not on the competitor list (brandScope=all).');

  config.setDateRangeRequired(true);
  return config.build();
}

function readConfig(request) {
  var p = (request && request.configParams) || {};
  var projectId = String(p.projectId || p.projectIdManual || '').trim();
  if (!projectId) throw userError('Choose a project in the data source settings.');
  var dataset = p.dataset || 'visibility_daily';
  getDataset(dataset);
  return {
    projectId: projectId,
    dataset: dataset,
    timeframe: p.timeframe || 'report',
    models: p.models || '',
    tags: p.tags || '',
    markets: p.markets || '',
    groupBy: p.groupBy || 'url',
    includeUntracked: p.includeUntracked === true || p.includeUntracked === 'true' ? 'true' : 'false',
  };
}

/* ── Schema & data ── */

var LOOKER_TYPES = {
  TEXT: 'TEXT',
  URL: 'URL',
  YEAR_MONTH_DAY: 'YEAR_MONTH_DAY',
  BOOLEAN: 'BOOLEAN',
  NUMBER: 'NUMBER',
  PERCENT: 'PERCENT',
};

function buildFields(datasetId) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  fieldList(datasetId).forEach(function (f) {
    var field = f.concept === 'DIMENSION' ? fields.newDimension() : fields.newMetric();
    field.setId(f.id).setName(f.name).setType(types[LOOKER_TYPES[f.type]]);
    if (f.description) field.setDescription(f.description);
    if (f.concept === 'METRIC' && f.aggregation) field.setAggregation(aggregations[f.aggregation]);
  });
  return fields;
}

function getSchema(request) {
  try {
    var config = readConfig(request);
    return { schema: buildFields(config.dataset).build() };
  } catch (err) {
    throwUserError(err);
  }
}

function getData(request) {
  try {
    var config = readConfig(request);
    var creds = getCredentials();
    if (!creds.url || !creds.key) throw userError('Connect the data source first (instance URL + API key).');
    var ids = request.fields.map(function (f) {
      return f.name;
    });
    var requested = buildFields(config.dataset).forIds(ids);
    var rows = fetchDataset(creds, config, request.dateRange);
    return { schema: requested.build(), rows: toLookerRows(config.dataset, rows, ids) };
  } catch (err) {
    throwUserError(err);
  }
}

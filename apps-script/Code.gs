/**
 * ============================================================
 *  TYPE GARDEN — Visitor Logs & Site Details backend
 *  Google Apps Script (container-bound to your Google Sheet)
 * ============================================================
 *
 *  What this does
 *  --------------
 *  1. Receives batched usage events from your website (POST).
 *  2. Writes every event to the "User Logs" tab.
 *  3. Keeps one row per visitor in the "Users" tab.
 *  4. Builds a "Site Details" tab: site info, live stats,
 *     last-14-days chart and top-lists (all formulas, always live).
 *
 *  Setup in 4 steps (full guide is in the chat):
 *   A. Paste this file into Extensions > Apps Script.
 *   B. Edit CONFIG below (SITE_KEY must match your website env var).
 *   C. Run  setup()  once and authorize.
 *   D. Deploy > New deployment > Web app
 *        Execute as: Me   |   Who has access: Anyone
 *      Copy the  /exec  URL into NEXT_PUBLIC_TRACKER_URL.
 *
 *  After ANY later code change:
 *   Deploy > Manage deployments > pencil icon > Version: New version > Deploy
 *   (the URL stays the same).
 */

// ---------------------------------------------------------------
//  CONFIG — edit these
// ---------------------------------------------------------------
var CONFIG = {
  // Must be identical to NEXT_PUBLIC_TRACKER_KEY on the website.
  // It is NOT a password (it is visible in the site's JS) — it only
  // stops random bots from posting junk into your sheet.
  SITE_KEY: 'tg_a1c01b0b615521104b01',

  SITE_NAME: 'type garden',
  SITE_URL: 'https://YOUR-PROJECT.vercel.app/',
  OWNER: 'YASH (@c0deryash)',

  // Used for "today", "last 7 days" etc. in the Site Details tab.
  TIMEZONE: 'Asia/Kolkata',

  // Only used by trimOldLogs() / installDailyTrim(). Lifetime totals
  // are kept in the Users tab, so trimming logs does not reset them.
  RETENTION_DAYS: 180,

  VERSION: '1.0.0'
};

var SHEETS = { LOGS: 'User Logs', USERS: 'Users', SITE: 'Site Details' };

var LOG_HEADERS = [
  'Timestamp', 'User ID', 'Session ID', 'Event', 'Label', 'Value',
  'Page', 'Details (JSON)', 'Browser', 'OS', 'Device', 'Screen',
  'Language', 'Timezone', 'Referrer', 'UTM'
];

var USER_HEADERS = [
  'User ID', 'First Seen', 'Last Seen', 'Sessions', 'Events',
  'Videos Exported', 'Browser', 'OS', 'Device', 'Timezone',
  'Language', 'First Referrer', 'Last Page'
];

// Only these event names are accepted. Anything else is ignored.
var ALLOWED_EVENTS = [
  'page_view', 'session_start', 'mode_view', 'active_seconds', 'outbound_click',
  'garden_typed', 'garden_theme', 'garden_flowers', 'garden_font', 'garden_density',
  'garden_toggle', 'garden_regrow', 'garden_clear', 'garden_panel',
  'matchcut_preset', 'matchcut_surprise', 'matchcut_shuffle',
  'video_export_start', 'video_export_success', 'video_export_error', 'video_download',
  'js_error'
];

var LIMITS = { MAX_EVENTS: 50, MAX_BODY: 100000 };

// ---------------------------------------------------------------
//  WEB APP ENDPOINTS
// ---------------------------------------------------------------

/** Health check: open the /exec URL in a browser to confirm it is live. */
function doGet() {
  return json_({ ok: true, service: 'type-garden-tracker', version: CONFIG.VERSION });
}

/** Receives a batch of events from the website. */
function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (!raw || raw.length > LIMITS.MAX_BODY) return json_({ ok: false, error: 'bad_request' });

    var payload = JSON.parse(raw);
    if (!payload || payload.key !== CONFIG.SITE_KEY) return json_({ ok: false, error: 'unauthorized' });

    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var saved = handlePayload_(payload);
      return json_({ ok: true, saved: saved });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, error: 'server_error' });
  }
}

// ---------------------------------------------------------------
//  CORE LOGIC
// ---------------------------------------------------------------

function handlePayload_(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(SHEETS.LOGS);
  var usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (!logSheet || !usersSheet) {            // self-heal if setup() was never run
    setupSheets_(ss);
    logSheet = ss.getSheetByName(SHEETS.LOGS);
    usersSheet = ss.getSheetByName(SHEETS.USERS);
  }

  var uid = String(payload.uid || '');
  var sid = String(payload.sid || '');
  var idPattern = /^[A-Za-z0-9_-]{8,64}$/;
  if (!idPattern.test(uid) || !idPattern.test(sid)) return 0;

  var ctx = payload.ctx || {};
  var c = {
    browser: clean_(ctx.browser, 40),
    os: clean_(ctx.os, 40),
    device: clean_(ctx.device, 20),
    screen: clean_(ctx.screen, 20),
    lang: clean_(ctx.lang, 20),
    tz: clean_(ctx.tz, 50),
    referrer: clean_(ctx.referrer, 120),
    utm: clean_(ctx.utm, 120)
  };

  var events = Array.isArray(payload.events) ? payload.events.slice(0, LIMITS.MAX_EVENTS) : [];
  var now = new Date();
  var rows = [];
  var agg = { sessions: 0, events: 0, exports: 0, lastPage: '' };

  for (var i = 0; i < events.length; i++) {
    var ev = events[i] || {};
    var name = String(ev.e || '');
    if (ALLOWED_EVENTS.indexOf(name) === -1) continue;

    // Trust the browser clock only if it is within 24h of the server clock.
    var t = Number(ev.t);
    var when = (isFinite(t) && Math.abs(now.getTime() - t) < 86400000) ? new Date(t) : now;
    var page = clean_(ev.p, 80);

    rows.push([
      when, uid, sid, name,
      clean_(ev.l, 80), num_(ev.v), page, clean_(ev.d, 500),
      c.browser, c.os, c.device, c.screen, c.lang, c.tz, c.referrer, c.utm
    ]);

    agg.events++;
    if (name === 'session_start') agg.sessions++;
    if (name === 'video_export_success') agg.exports++;
    if (page) agg.lastPage = page;
  }

  if (!rows.length) return 0;

  ensureRows_(logSheet, rows.length);
  logSheet.getRange(logSheet.getLastRow() + 1, 1, rows.length, LOG_HEADERS.length).setValues(rows);
  upsertUser_(usersSheet, uid, now, agg, c);
  return rows.length;
}

function upsertUser_(sheet, uid, now, agg, c) {
  var last = sheet.getLastRow();
  var found = null;
  if (last >= 2) {
    found = sheet.getRange(2, 1, last - 1, 1)
      .createTextFinder(uid).matchEntireCell(true).matchCase(true).findNext();
  }

  if (!found) {
    ensureRows_(sheet, 1);
    sheet.getRange(last + 1, 1, 1, USER_HEADERS.length).setValues([[
      uid, now, now, agg.sessions, agg.events, agg.exports,
      c.browser, c.os, c.device, c.tz, c.lang, c.referrer, agg.lastPage
    ]]);
    return;
  }

  var range = sheet.getRange(found.getRow(), 1, 1, USER_HEADERS.length);
  var v = range.getValues()[0];
  v[2] = now;
  v[3] = (Number(v[3]) || 0) + agg.sessions;
  v[4] = (Number(v[4]) || 0) + agg.events;
  v[5] = (Number(v[5]) || 0) + agg.exports;
  if (c.browser) v[6] = c.browser;
  if (c.os) v[7] = c.os;
  if (c.device) v[8] = c.device;
  if (c.tz) v[9] = c.tz;
  if (c.lang) v[10] = c.lang;
  if (!v[11] && c.referrer) v[11] = c.referrer;   // keep the FIRST referrer
  if (agg.lastPage) v[12] = agg.lastPage;
  range.setValues([v]);
}

// ---------------------------------------------------------------
//  HELPERS
// ---------------------------------------------------------------

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Strip control chars, clamp length, and neutralise spreadsheet formulas. */
function clean_(v, max) {
  if (v === null || v === undefined) return '';
  var s = String(v).replace(/[\u0000-\u001F\u007F]/g, ' ').trim();
  if (s.length > max) s = s.slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // stops "=HYPERLINK(...)" style injection
  return s;
}

function num_(v) {
  if (v === undefined || v === null || v === '') return '';
  var n = Number(v);
  return isFinite(n) ? Math.round(n * 100) / 100 : '';
}

/** setValues() does NOT auto-add rows (appendRow does), so we do it. */
function ensureRows_(sheet, needed) {
  var shortBy = sheet.getLastRow() + needed - sheet.getMaxRows();
  if (shortBy > 0) sheet.insertRowsAfter(sheet.getMaxRows(), Math.max(shortBy, 500));
}

// ---------------------------------------------------------------
//  SETUP  (run this once from the editor)
// ---------------------------------------------------------------

/** Creates / repairs all tabs, headers, formulas and the chart. Safe to re-run. */
function setup() {
  setupSheets_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getActiveSpreadsheet().toast('Sheets are ready. Now deploy as a Web app.', 'Type Garden', 8);
}

function setupSheets_(ss) {
  ss.setSpreadsheetTimeZone(CONFIG.TIMEZONE);

  var logs = getOrCreate_(ss, SHEETS.LOGS);
  var users = getOrCreate_(ss, SHEETS.USERS);
  var site = getOrCreate_(ss, SHEETS.SITE);

  // ---- User Logs
  styleHeader_(logs, LOG_HEADERS, '#1f2a24');
  logs.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  var logWidths = [150, 250, 250, 150, 140, 70, 110, 220, 110, 90, 80, 90, 80, 140, 160, 140];
  for (var i = 0; i < logWidths.length; i++) logs.setColumnWidth(i + 1, logWidths[i]);
  logs.setTabColor('#7aa874');

  // ---- Users
  styleHeader_(users, USER_HEADERS, '#3b2a3f');
  users.getRange('B2:C').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  var userWidths = [250, 150, 150, 70, 70, 110, 110, 90, 80, 140, 80, 160, 110];
  for (var j = 0; j < userWidths.length; j++) users.setColumnWidth(j + 1, userWidths[j]);
  users.setTabColor('#c98aa0');

  // ---- Site Details (formulas)
  buildSiteDetails_(ss, site);
  site.setTabColor('#e0b84c');

  // Site Details first, then Users, then User Logs.
  ss.setActiveSheet(site);
  ss.moveActiveSheet(1);
  ss.setActiveSheet(users);
  ss.moveActiveSheet(2);
  ss.setActiveSheet(site);

  // Remove the empty default "Sheet1" if it is still there.
  var s1 = ss.getSheetByName('Sheet1');
  if (s1 && ss.getSheets().length > 1 && s1.getLastRow() === 0) ss.deleteSheet(s1);
}

function getOrCreate_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function styleHeader_(sheet, headers, bg) {
  var r = sheet.getRange(1, 1, 1, headers.length);
  r.setValues([headers]).setFontWeight('bold').setFontColor('#ffffff').setBackground(bg);
  sheet.setFrozenRows(1);
}

function buildSiteDetails_(ss, site) {
  var charts = site.getCharts();
  for (var k = 0; k < charts.length; k++) site.removeChart(charts[k]);
  site.clear();

  var L = "'" + SHEETS.LOGS + "'!";
  var ts = L + 'A2:A', uidc = L + 'B2:B', ev = L + 'D2:D', lab = L + 'E2:E', val = L + 'F2:F';
  var U = SHEETS.USERS + '!';

  // ---- Title
  site.getRange('A1').setValue(CONFIG.SITE_NAME + ' — Site Details')
    .setFontSize(16).setFontWeight('bold');

  // ---- SITE INFO
  site.getRange('A3').setValue('SITE INFO');
  var info = [
    ['Site name', CONFIG.SITE_NAME],
    ['Site URL', CONFIG.SITE_URL],
    ['Owner', CONFIG.OWNER],
    ['Modes', 'Garden, Match cut'],
    ['Tracker version', CONFIG.VERSION],
    ['Spreadsheet timezone', CONFIG.TIMEZONE],
    ['Last setup run', new Date()],
    ['Last event received', '=IF(COUNT(' + ts + ')=0,"No events yet",MAX(' + ts + '))']
  ];
  site.getRange(4, 1, info.length, 2).setValues(info);
  site.getRange('B10:B11').setNumberFormat('yyyy-mm-dd hh:mm:ss');

  // ---- LIVE STATS
  site.getRange('A13').setValue('LIVE STATS');
  var stats = [
    ['Unique visitors (all time)', '=COUNTA(' + U + 'A2:A)'],
    ['Returning visitors (2+ sessions)', '=COUNTIF(' + U + 'D2:D,">1")'],
    ['Sessions (all time)', '=SUM(' + U + 'D2:D)'],
    ['Events logged (all time)', '=SUM(' + U + 'E2:E)'],
    ['Videos exported (all time)', '=SUM(' + U + 'F2:F)'],
    ['Visitors today', '=IFERROR(ROWS(UNIQUE(FILTER(' + uidc + ',' + ts + '>=TODAY()))),0)'],
    ['Sessions today', '=COUNTIFS(' + ev + ',"session_start",' + ts + ',">="&TODAY())'],
    ['Sessions last 7 days', '=COUNTIFS(' + ev + ',"session_start",' + ts + ',">="&(TODAY()-6))'],
    ['Sessions last 30 days', '=COUNTIFS(' + ev + ',"session_start",' + ts + ',">="&(TODAY()-29))'],
    ['Page views last 30 days', '=COUNTIFS(' + ev + ',"page_view",' + ts + ',">="&(TODAY()-29))'],
    ['Avg active time / session (sec)', '=IFERROR(ROUND(SUMIF(' + ev + ',"active_seconds",' + val + ')/COUNTIF(' + ev + ',"session_start"),0),0)'],
    ['Garden views (in logs)', '=COUNTIFS(' + ev + ',"mode_view",' + lab + ',"garden")'],
    ['Match cut views (in logs)', '=COUNTIFS(' + ev + ',"mode_view",' + lab + ',"matchcut")'],
    ['Video exports started (in logs)', '=COUNTIF(' + ev + ',"video_export_start")'],
    ['Video exports succeeded (in logs)', '=COUNTIF(' + ev + ',"video_export_success")'],
    ['Export success rate (in logs)', '=IFERROR(COUNTIF(' + ev + ',"video_export_success")/COUNTIF(' + ev + ',"video_export_start"),0)'],
    ['Avg exported video size (MB)', '=IFERROR(ROUND(AVERAGEIF(' + ev + ',"video_export_success",' + val + '),2),0)'],
    ['JS errors last 7 days', '=COUNTIFS(' + ev + ',"js_error",' + ts + ',">="&(TODAY()-6))']
  ];
  site.getRange(14, 1, stats.length, 2).setValues(stats);
  site.getRange(14 + 15, 2).setNumberFormat('0.0%');   // export success rate row

  // ---- LAST 14 DAYS (table + chart)
  site.getRange('D3').setValue('LAST 14 DAYS');
  site.getRange('D4:F4').setValues([['Day', 'Sessions', 'Videos exported']]);
  var daily = [];
  for (var d = 13; d >= 0; d--) {
    var from = 'TODAY()-' + d;
    var to = 'TODAY()-' + (d - 1);
    daily.push([
      '=TEXT(' + from + ',"dd mmm")',
      '=COUNTIFS(' + ev + ',"session_start",' + ts + ',">="&(' + from + '),' + ts + ',"<"&(' + to + '))',
      '=COUNTIFS(' + ev + ',"video_export_success",' + ts + ',">="&(' + from + '),' + ts + ',"<"&(' + to + '))'
    ]);
  }
  site.getRange(5, 4, daily.length, 3).setFormulas(daily);

  var chart = site.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(site.getRange('D4:F18'))
    .setNumHeaders(1)
    .setPosition(21, 4, 0, 0)
    .setOption('title', 'Sessions & exports — last 14 days')
    .setOption('width', 520)
    .setOption('height', 280)
    .build();
  site.insertChart(chart);

  // ---- TOP LISTS (QUERY formulas spill downward)
  var sess = L + 'D2:O';   // Col1=Event ... Col6=Browser Col7=OS Col8=Device Col12=Referrer
  topList_(site, 8, 'DEVICES', sess,
    "select Col8, count(Col8) where Col1 = 'session_start' and Col8 is not null group by Col8 order by count(Col8) desc limit 6 label Col8 'Device', count(Col8) 'Sessions'");
  topList_(site, 11, 'BROWSERS', sess,
    "select Col6, count(Col6) where Col1 = 'session_start' and Col6 is not null group by Col6 order by count(Col6) desc limit 8 label Col6 'Browser', count(Col6) 'Sessions'");
  topList_(site, 14, 'OPERATING SYSTEMS', sess,
    "select Col7, count(Col7) where Col1 = 'session_start' and Col7 is not null group by Col7 order by count(Col7) desc limit 8 label Col7 'OS', count(Col7) 'Sessions'");
  topList_(site, 17, 'TOP REFERRERS', sess,
    "select Col12, count(Col12) where Col1 = 'session_start' and Col12 is not null group by Col12 order by count(Col12) desc limit 8 label Col12 'Referrer', count(Col12) 'Sessions'");
  topList_(site, 20, 'TOP EVENTS', L + 'D2:D',
    "select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc limit 12 label Col1 'Event', count(Col1) 'Count'");
  topList_(site, 23, 'GARDEN THEMES', L + 'D2:E',
    "select Col2, count(Col2) where Col1 = 'garden_theme' and Col2 is not null group by Col2 order by count(Col2) desc limit 8 label Col2 'Theme', count(Col2) 'Clicks'");
  topList_(site, 26, 'EXPORT FORMATS', L + 'D2:E',
    "select Col2, count(Col2) where Col1 = 'video_export_start' and Col2 is not null group by Col2 order by count(Col2) desc limit 6 label Col2 'Aspect', count(Col2) 'Exports'");

  // ---- Styling
  var headings = ['A3', 'A13', 'D3', 'H3', 'K3', 'N3', 'Q3', 'T3', 'W3', 'Z3'];
  for (var h = 0; h < headings.length; h++) {
    site.getRange(headings[h]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#1f2a24');
  }
  site.getRange('D4:F4').setFontWeight('bold').setBackground('#eee8dc');
  site.getRange('A4:A11').setFontWeight('bold');
  site.getRange('A14:A31').setFontWeight('bold');
  site.getRange('B4:B31').setHorizontalAlignment('left');
  site.setColumnWidth(1, 250);
  site.setColumnWidth(2, 230);
  site.setColumnWidth(3, 30);
  site.setColumnWidth(4, 90);
  site.setColumnWidth(5, 80);
  site.setColumnWidth(6, 110);
  site.setColumnWidth(7, 30);
  site.setFrozenRows(1);
}

function topList_(site, col, title, range, query) {
  site.getRange(3, col).setValue(title);
  site.getRange(4, col).setFormula('=IFERROR(QUERY(' + range + ',"' + query + '",0),"No data yet")');
  site.setColumnWidth(col, 130);
}

// ---------------------------------------------------------------
//  TOOLS: menu, test, trimming
// ---------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Type Garden')
    .addItem('Set up / repair sheets', 'setup')
    .addItem('Send a test event', 'testLogging')
    .addSeparator()
    .addItem('Trim old logs now', 'trimOldLogs')
    .addItem('Schedule daily trim (3 AM)', 'installDailyTrim')
    .addToUi();
}

/** Simulates what the website sends. Run from the editor, then check the tabs. */
function testLogging() {
  var now = Date.now();
  var fake = {
    postData: {
      contents: JSON.stringify({
        key: CONFIG.SITE_KEY,
        uid: 'test-user-0001',
        sid: 'test-session-0001',
        ctx: { browser: 'Chrome', os: 'Windows', device: 'desktop', screen: '1920x1080',
               lang: 'en-IN', tz: 'Asia/Kolkata', referrer: 'instagram.com', utm: '' },
        events: [
          { e: 'session_start', t: now, p: '/', l: 'instagram.com', d: '{"returning":false}' },
          { e: 'page_view', t: now, p: '/', l: '/' },
          { e: 'mode_view', t: now, p: '/', l: 'garden' },
          { e: 'garden_theme', t: now, p: '/', l: 'Rose' },
          { e: 'video_export_start', t: now, p: '/', l: '9:16', v: 5 },
          { e: 'video_export_success', t: now, p: '/', l: 'mp4', v: 3.4 },
          { e: 'active_seconds', t: now, p: '/', v: 42 }
        ]
      })
    }
  };
  var result = doPost(fake).getContent();
  console.log(result);
  SpreadsheetApp.getActiveSpreadsheet().toast('Test result: ' + result, 'Type Garden', 8);
}

/** Deletes log rows older than CONFIG.RETENTION_DAYS. Users tab is untouched. */
function trimOldLogs() {
  if (!CONFIG.RETENTION_DAYS) return;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LOGS);
  if (!sheet) return;
  var last = sheet.getLastRow();
  if (last < 2) return;

  var cutoff = new Date(Date.now() - CONFIG.RETENTION_DAYS * 86400000);
  var dates = sheet.getRange(2, 1, last - 1, 1).getValues();
  var count = 0;
  while (count < dates.length && dates[count][0] instanceof Date && dates[count][0] < cutoff) count++;
  if (!count) return;

  if (count >= sheet.getMaxRows() - 1) sheet.insertRowsAfter(sheet.getMaxRows(), 1);
  sheet.deleteRows(2, count);
}

function installDailyTrim() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'trimOldLogs') ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger('trimOldLogs').timeBased().everyDays(1).atHour(3).create();
  SpreadsheetApp.getActiveSpreadsheet().toast('Daily trim scheduled.', 'Type Garden', 5);
}

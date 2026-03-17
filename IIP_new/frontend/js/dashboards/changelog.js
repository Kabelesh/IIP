/* ============================================================
   js/dashboards/changelog.js
   Release Intelligence Dashboard — IBM Case Intelligence Platform
   Developer: Kabelesh K
   ============================================================ */

const DashChangelog = (() => {

  /* ── Extended Version Data ─────────────────────────────── */
  const VERSIONS = [
{
      version: "v8.5.7",
      name: "UI Consistency Overhaul — Phases 1–5 Complete",
      date: "2026-03-18",
      status: "current",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.5.7 is a major UI standardization release completing all five planned consistency phases. It unifies every search bar, button class, and icon+input wrapper across all 16 dashboards into a single set of canonical CSS components. Two previously missing search features are added (Investigate Archive Search tab, Info ALM Lines filter). A complete UI component library reference (COMPONENTS.md) and developer consistency guide (CONSISTENCY.md) are shipped alongside the code. A 'What's New' first-launch modal surfaces all changes on upgrade. Consistency score raised from 88% → 95%+.",
      highlights: [
        "Phase 1 — All 13 search inputs across every dashboard now use a single .search-input class",
        "Phase 1 — Consistent IBM-blue focus ring on every search bar; inline onfocus/onblur handlers removed",
        "Phase 1 — Deprecated stale classes: .ov7-search-input and .filter-input commented out with DEPRECATED notices",
        "Phase 2 — .btn-overlay, .btn-danger-filled, .btn-warning, .btn-micro fully documented in components.css",
        "Phase 2 — .btn-micro migrated from rfe-tracking.css into components.css as a first-class component",
        "Phase 2 — :focus-visible keyboard-nav outlines added to all four custom button variants",
        "Phase 3 — New Archive Search tab in Investigate: live search across all permanently archived cases",
        "Phase 3 — New ALM Lines search in Info dashboard: filters by line code, customer, BD, IBM, proxy",
        "Phase 3 — IBM Contacts Directory search upgraded from .form-input to .search-input",
        "Phase 4 — New .form-input-group CSS component replaces all ad-hoc position:absolute icon patterns",
        "Phase 4 — Six icon+input wrappers migrated across admin-dash.js, changelog.js, info.js, rfe-tracking-advanced.js",
        "Phase 4 — Zero inline padding-left values remain on any search or form input",
        "Phase 5 — COMPONENTS.md: complete UI component library reference with usage rules and anti-patterns",
        "Phase 5 — CONSISTENCY.md: Five Golden Rules, PR checklist, common-mistakes table, full dashboard inventory",
        "What's New modal on first launch summarises all 10 changes with phase badges and colour-coded type labels",
      ],
      added: [
        { area: "CSS — components.css", text: ".search-input — standardized search bar class: bg-input background, border-mid border, IBM-blue focus ring (0 0 0 2px rgba(15,98,254,0.18)), var(--text-tertiary) placeholder." },
        { area: "CSS — components.css", text: ".search-wrapper + .search-icon — icon wrapper for .search-input with absolute-positioned left icon at 10px, 32px left-padding on the input." },
        { area: "CSS — components.css", text: ".form-input-group + .input-icon — replaces all ad-hoc position:relative / position:absolute icon patterns. Works with .form-input and .search-input. Width set on the wrapper; input fills it via box-sizing:border-box." },
        { area: "CSS — components.css", text: ".btn-micro :focus-visible — 2px IBM-blue outline added. Previously missing keyboard-nav indicator." },
        { area: "CSS — components.css", text: ".btn-overlay :focus-visible — 2px IBM-blue outline. Previously missing." },
        { area: "CSS — components.css", text: ".btn-danger-filled :focus-visible — 2px var(--red) outline. Previously missing." },
        { area: "CSS — components.css", text: ".btn-warning :focus-visible — 2px var(--yellow-text) outline. Previously missing." },
        { area: "CSS — components.css", text: ".btn-micro moved from rfe-tracking.css to components.css. Now a first-class design-system component available to all dashboards." },
        { area: "investigate.js", text: "Archive Search tab — third tab added alongside Case Investigation AI and Support Intelligence. Live search over the permanent case archive (case #, title, owner, product, status). Keyword highlighting, open-cases-first sort, 200-row cap with 'refine' prompt, case number click-to-copy." },
        { area: "info.js", text: "ALM Lines search input (id=alm-search) added to ALM Lines card header. Filters sortedALMs array before accordion rows are built. Matches on ALM code, customer names, BD, IBM, proxy. Shows empty state in both view and edit mode." },
        { area: "info.js", text: "_almSearch state variable persists the current ALM filter across re-renders within the session." },
        { area: "whats-new.js", text: "New module: frontend/js/modules/legacy/whats-new.js — first-launch changelog modal, localStorage-gated per version key (iip_seen_whats_new_v8.5.7_p45). Shows once per browser, lists all 10 phase changes, 'View full changelog' navigates to this page. Force-show any time via WhatsNew.show('8.5.7') in the browser console." },
        { area: "frontend/COMPONENTS.md", text: "Complete UI component library reference: all button types and sizes, .search-input, .form-input, .form-input-group, status badges, severity badges, notify bars, full IC icon key list, typography scale, color/bg/border tokens, spacing, radius, transitions, z-index stack, and a quick-reference card." },
        { area: "frontend/CONSISTENCY.md", text: "Developer consistency guide: Five Golden Rules with ✅/❌ code examples, complete PR review checklist (buttons / inputs / colors / icons / accessibility / mobile), common-mistakes-to-fix table, 'before adding a new component' workflow, consistency score tracker, and full 16-dashboard inventory." },
      ],
      fixed: [
        { severity: "improvement", text: "Phase 1: overview.js — ov7-search-input replaced with search-input. Removed matching .ov7-search-input definition from v7-overview.css (left with DEPRECATED comment)." },
        { severity: "improvement", text: "Phase 1: weekly-tracker.js — wt-search and wt-hist-search changed from form-input form-input-sm to search-input. Removed inline width style from wt-search." },
        { severity: "improvement", text: "Phase 1: admin-dash.js — admin-search changed from form-input + inline padding-left:32px to search-input." },
        { severity: "improvement", text: "Phase 1: members.js — members-search had no class and inline styles + JS onfocus/onblur border toggle. Replaced with search-input class; JS handlers removed." },
        { severity: "improvement", text: "Phase 1: performance.js — perf-search changed from form-input form-input-sm to search-input." },
        { severity: "improvement", text: "Phase 1: rfe-tracking.js — rfe-search changed from filter-input to search-input. Placeholder updated to 'Search by name, reference, product…'. .filter-input definition in rfe-tracking.css commented out with DEPRECATED notice." },
        { severity: "improvement", text: "Phase 1: changelog.js — cl-search changed from form-input + inline padding to search-input inside .form-input-group." },
        { severity: "improvement", text: "Phase 3: info.js — dir-search upgraded from form-input to search-input (filter logic was already wired; class was the only inconsistency)." },
        { severity: "improvement", text: "Phase 4: admin-dash.js — admin-search wrapper: position:relative div + position:absolute icon span replaced with .form-input-group + .input-icon." },
        { severity: "improvement", text: "Phase 4: admin-dash.js — history-search wrapper: same migration. history-search input also upgraded from form-input to search-input." },
        { severity: "improvement", text: "Phase 4: changelog.js — cl-search wrapper migrated to .form-input-group. Inline SVG positioning removed." },
        { severity: "improvement", text: "Phase 4: info.js — dir-search wrapper migrated to .form-input-group. Redundant inline padding removed." },
        { severity: "improvement", text: "Phase 4: info.js — alm-search wrapper migrated to .form-input-group." },
        { severity: "improvement", text: "Phase 4: rfe-tracking-advanced.js — rfe-search wrapper migrated to .form-input-group; input upgraded from form-input form-input-sm + inline padding-left to search-input." },
      ],
      removed: [
        { area: "CSS — v7-overview.css", text: ".ov7-search-input definition commented out with DEPRECATED (Phase 1) notice. Safe to fully delete in a future cleanup pass." },
        { area: "CSS — rfe-tracking.css", text: ".filter-input and .filter-input:focus definitions commented out with DEPRECATED (Phase 1) notice. Mobile media query updated to reference .search-input instead." },
        { area: "CSS — rfe-tracking.css", text: ".btn-micro definition removed — moved to components.css (Phase 2). Migration comment left in file." },
        { area: "members.js", text: "Inline onfocus/onblur JS handlers that toggled border colour on members-search removed. Focus state now handled entirely by .search-input:focus CSS." },
      ],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. All class renames are additive — .search-input is a superset of the old per-dashboard classes in terms of visual output. Custom themes that override .ov7-search-input, .filter-input, or .form-input for search contexts should be updated to target .search-input. The .form-input-group wrapper is opt-in; existing position:relative patterns still work. To force the What's New modal to reappear: run WhatsNew.show('8.5.7') in the browser console.",
      architectureChanges: [
        "components.css: .search-input + .search-wrapper + .search-icon block added (Phase 1).",
        "components.css: .form-input-group + .input-icon block added (Phase 4).",
        "components.css: custom button section expanded with full doc comments + :focus-visible states for .btn-overlay, .btn-danger-filled, .btn-warning, .btn-micro (Phase 2).",
        "components.css: .btn-micro migrated from rfe-tracking.css; canonical definition standardised to use var(--border-mid) and var(--bg-hover) instead of --border-color and --bg-secondary (Phase 2).",
        "investigate.js: _archiveSearch state var added. _activeSection now accepts 'archive-search'. renderArchiveSearchHTML() and bindArchiveSearchEvents() functions added (Phase 3).",
        "info.js: _almSearch state var added. _renderZone3 filters sortedALMs via _almSearch before building rows. alm-search input added to ALM card header. alm-search event listener added in _wireEvents (Phase 3).",
        "whats-new.js: new module loaded after phase1-patches.js in index.html. WhatsNew.init() polls window._iipAppReady then shows modal 600ms after app is ready (Phase 5).",
        "version.js: PATCH bumped 6 → 7, date updated to 2026-03-18.",
        "index.html: title updated to v8.5.7, whats-new.js script tag added.",
        "frontend/COMPONENTS.md: new file — complete component API reference (Phase 5).",
        "frontend/CONSISTENCY.md: new file — developer rules and PR checklist (Phase 5).",
      ],
      developerNotes: "This release closes the 5-phase UI consistency roadmap started at v8.5.6. The 88% → 95%+ consistency improvement was measured across: search bar classes, button type+size pairing, icon+input wrapper patterns, custom button CSS location, and focus-state completeness. The COMPONENTS.md and CONSISTENCY.md files are the living spec going forward — all new dashboard contributions should be reviewed against CONSISTENCY.md before merge.",
    },
{
      version: "v8.5.6",
      name: "Fix: Weekly Tracker Comments Persist in Local Mode (localStorage Fallback)",
      date: "2026-03-11",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "Comments imported via Admin Portal now persist across browser refreshes even when running in local/file:// mode. Previously, save.php was unavailable in local mode so comments were lost on refresh and re-imports showed false 'added' counts. Now uses localStorage as a reliable fallback store.",
      highlights: [
        "localStorage used as primary store in local mode — survives browser refresh",
        "localStorage-only mode — all data persisted locally, no server required",
        "On load: tries server first, falls back to localStorage if server unavailable",
        "On save: writes to localStorage immediately, then attempts server sync",
        "Re-importing same Excel after refresh now correctly shows 'already up to date'",
      ],
      fixed: [
        { severity: "critical", text: "After browser refresh in local mode, re-importing the same Excel file incorrectly showed 'N comments added' instead of 'already up to date'. Root cause: save.php unavailable in file:// mode, _serverComments always reset to {} on reload." },
      ],
    },
{
      version: "v8.5.5",
      name: "Admin Portal: Strict Excel Comment Import (No-Overwrite + Format Enforcement)",
      date: "2026-03-11",
      status: "current",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.5.5 overhauls the Weekly Tracker comment import in the Admin Portal. The import now enforces a strict Excel-only format (SL.No | Case Number | Comments), never overwrites comments that are already set, and gives clear per-case toast feedback breaking down how many were added vs skipped.",
      highlights: [
        "File type restricted to .xlsx / .xlsm only — CSV and log files no longer accepted",
        "Strict column validation: must have Case Number and Comments headers",
        "Comments are NEVER overwritten — only blank/missing comments are filled",
        "Toast and status panel show: added count, skipped count (already had comment), blank rows",
        "How-it-works hint card added to Admin Portal with exact required format shown",
        "New _mergeServerCommentsNoOverwrite() function added to weekly-tracker module",
      ],
      fixed: [
        { severity: "improvement", text: "Previous import used _mergeServerComments which overwrote existing comments. Replaced with _mergeServerCommentsNoOverwrite for the Admin Portal path — only fills blank entries." },
        { severity: "improvement", text: "Previous import accepted .csv, .log, and .xlsm with fuzzy column matching. Now enforces xlsx/xlsm and exact column names to prevent accidental imports of wrong files." },
      ],
    },
{
      version: "v8.5.4",
      name: "Fix: All Closed Cases from CSV Now Visible in Weekly Tracker",
      date: "2026-03-11",
      status: "current",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.5.4 fixes a critical data-loss bug where CSV-derived Weekly Tracker rows were being silently overwritten by the hardcoded seed data on every render. The _applySeed() function has a 'force-fix' block that replaces 2025 data whenever rows have no comments — but CSV-sourced rows intentionally have empty comments (comments live server-side). This caused every enrichFromCases() write to be immediately undone by _applySeed(). Fix: the force-fix is now guarded to skip when rows came from the CSV (_fromCSV flag) or when there are more weeks stored than in the seed (i.e. enrichFromCases has already run). The isTeamOwner filter in enrichFromCases is correct and unchanged — only team-owned cases with a Closed Date populate the tracker.",
      highlights: [
        "Weekly Tracker now shows ALL closed cases from the uploaded IBM Cases CSV",
        "2025 weeks (CW28 etc.) will populate correctly once the CSV is re-uploaded",
        "Admin Portal XLSM comment-only import behaviour is unchanged",
      ],
      fixed: [
        { severity: "critical", text: "_applySeed() ran on every render() call and its 'force-fix 2025' block checked: if rows exist but have no comments → replace with seed. CSV-sourced rows have empty comments by design (comments live server-side), so this caused _applySeed to overwrite every enrichFromCases() write immediately after it ran. Fix: force-fix now checks for _fromCSV flag and skips when stored week count exceeds seed week count." },
      ],
    },
{
      version: "v8.5.3",
      name: "Fix: Weekly Tracker Data Lost on New Session (Server Persistence for Row Data)",
      date: "2026-03-11",
      status: "current",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.5.3 fixes a critical data-loss issue where the Weekly Tracker showed 0 cases after a new browser session or page reload, even though the data had been imported via the Admin Portal. Previously only comments were persisted server-side; all case row data was localStorage-only. Now every write via _swk() also syncs the full year data to the server, and render()/_setYear() restore from the server automatically when localStorage is empty.",
      highlights: [
        "Weekly Tracker data now survives new browser sessions — no re-import needed",
        "2025 and 2026 XLSM data imported via Admin Portal is now fully persistent",
        "Year switch restores data from server if localStorage is cold",
      ],
      fixed: [
        { severity: "critical", text: "_swk() (the core weekly tracker write function) only wrote to localStorage. A new session always started with empty localStorage, showing 0 cases for all weeks even when data had been imported via Admin Portal. Fix: _swk() now writes full year data to localStorage after every write." },
        { severity: "critical", text: "render() and _setYear() now check if localStorage is empty for the current year. If so, they call _restoreYearFromServer() to fetch the data from the server before painting." },
      ],
    },
{
      version: "v8.5.2",
      name: "Fix: Duplicate Import Detection Stranding Users on Upload Screen",
      date: "2026-03-11",
      status: "current",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.5.2 fixes a regression where uploading any previously-seen file (matching a stored fingerprint) would show 'Data already imported' but never open the dashboard when sessionStorage was empty and the server was unavailable. The duplicate-detection path now falls through to normal re-processing when the cache restore fails, ensuring users always reach the dashboard.",
      highlights: [
        "Uploading a known file now always opens the dashboard — even when cache is cold",
        "Cache hit (sessionStorage / server) still takes the fast path (no re-processing)",
        "Toast clears correctly when no cached data is found so users know to re-upload",
      ],
      fixed: [
        { severity: "critical", text: "Duplicate import guard called _tryRestoreFromServer() then unconditionally returned, leaving users stranded on the upload screen when both sessionStorage and save.php had no data (e.g. new browser, cleared storage, file:// mode). Both the CSV and Excel paths now check the return value — if restore fails they fall through to full re-processing." },
        { severity: "low", text: "_tryRestoreFromServer() step-3 fallback now clears the 'already imported' toast so users aren't confused by a misleading success message." },
      ],
    },
{
      version: "v8.5.1",
      name: "Weekly Tracker — XLSM Landing Import & Comment Preservation",
      date: "2026-03-11",
      status: "current",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.5.1 makes the landing page XLSM upload smarter: dropping a Weekly_Closed_Cases workbook now populates the Weekly Tracker directly (with Comments and Category) in addition to the normal case import flow. Server-side comment persistence is reinforced — localStorage remains the primary store with every write synced to the server. Admin historical XLSM imports correctly leave existing comments untouched when the Excel cell is blank.",
      highlights: [
        "Landing XLSM: Weekly_Closed_Cases files now auto-populate the Weekly Tracker (Q1)",
        "Comments and Category fields preserved from imported XLSM sheets",
        "Server sync on every tracker write — localStorage primary, server backup (Q2)",
        "Admin XLSM import: blank comment cells never overwrite existing server comments (Q3)",
      ],
      added: [
        "_isWeeklyClosedCasesXlsm(wb) — detects CW-sheet workbooks on the landing page",
        "_extractWeeklyTrackerRows(wb) — reads CW sheets into tracker localStorage + commentMap",
        "Landing import shows a confirmation toast with case count and comment count after Weekly XLSM ingestion",
      ],
      fixed: [
        { severity: "high",   text: "Q1: Uploading a Weekly_Closed_Cases XLSM on the landing page only fed the main cases table and did not populate the Weekly Tracker. Now both paths run in parallel." },
        { severity: "medium", text: "Q3: Admin historical XLSM import already skipped blank comment cells, preserving existing server comments. Behavior confirmed and explicitly documented in code." },
        { severity: "low",    text: "2025 column-swap (Case Owner / Case Number reversed in older format) is handled correctly in _extractWeeklyTrackerRows just as it is in the main import path." },
      ],
      architectureChanges: [
        "app.js: _isWeeklyClosedCasesXlsm(wb) added — heuristic detection based on sheet name pattern and Comments column presence.",
        "app.js: _extractWeeklyTrackerRows(wb) added — direct localStorage write per CW sheet, returns commentMap for server sync.",
        "app.js: _loadExcel() calls both paths when a Weekly XLSM is detected: tracker population (async, 650ms delay) + normal cases flow.",
        "weekly-tracker.js: Q3 behavior is already correct — _mergeServerComments skips blank-comment entries by construction.",
      ],
    },
{
      version: "v8.3.3",
      name: "Overview Enhancements & Audit History Overhaul",
      date: "2026-03-11",
      status: "current",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.3.3 delivers three improvements. The Performance Cases panel in Overview now shows the latest Wednesday update comment for each case (sourced from Performance Tracking), and work item / defect numbers are now clickable links that open directly in CCM. The Audit & Change History in Admin Portal is completely overhauled — entries are grouped by date, each action shows a rich detail block with actor chip, case number pill, old→new value arrows, and a formatted timestamp. Undo/Redo now works correctly: the async DC restore is properly awaited before re-rendering, eliminating the race condition that caused undo to appear broken.",
      highlights: [
        "Overview: Latest Wednesday comment shown under each performance case row",
        "Overview: Work item / defect badges are now clickable links to CCM",
        "Admin: Audit history grouped by date with rich detail (actor, old→new, timestamps)",
        "Admin: Undo and Redo now properly await async state restore before re-rendering",
        "Admin: Snapshots taken before Performance Tag and Non-Performance Tag single-adds",
      ],
      added: [],
      fixed: [
        { severity: "high",   text: "Undo/Redo broken in Admin Portal: _restoreSnap is async but undoLastChange/redoLastChange were not awaiting it, causing re-render to read stale data. Both functions are now async and the click handlers await them." },
        { severity: "medium", text: "Performance Tag and Non-Performance Tag (single case add) were missing a snapshotForAdmin() call before mutating state, so they could not be undone." },
        { severity: "medium", text: "Audit & Change History showed compact unreadable one-liners. Rewritten to group by date, show actor/case chips, old→new value arrows, emoji icons, and formatted timestamps." },
        { severity: "low",    text: "Overview Performance Cases: work item badges were plain text spans. Now rendered as clickable CCM links via _wiChip() using the same defect base URL as other dashboards." },
      ],
      removed: [],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Drop-in replacement for v8.3.2.",
      architectureChanges: [
        "data.js: undoLastChange() and redoLastChange() are now async functions.",
        "admin-dash.js: undo/redo click handlers are now async and await the result.",
        "admin-dash.js: snapshotForAdmin() added before perf-num-add and nonperf-num-add mutations.",
        "admin-dash.js: renderHistory() completely rewritten with grouped timeline layout.",
        "overview.js: _defectBaseUrl() and _wiChip() helpers added.",
        "overview.js: _perfCasesHTML() reads Data.getCaseDetailLog(cn).wednesdayComments for latest comment.",
      ],
    },
{
      version: "v8.3.2",
      name: "History Delete & Import Dedup Fix",
      date: "2026-03-11",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.3.2 delivers two fixes to the Weekly Tracker. Admins can now delete individual history entries or an entire case's history directly from the History tab — a trash icon appears on every entry row and a 'Delete case history' button appears on every case card. The duplicate import audit entry bug is also fixed: importing the same Excel file a second time no longer creates a new audit entry because server comments are now pre-loaded before the duplicate check runs, regardless of whether the Weekly Tracker tab was visited first.",
      highlights: [
        "Delete individual history entries via ✕ button on each entry row",
        "Delete all history for a case via 'Delete case history' button on each card",
        "Re-importing same Excel file no longer creates duplicate audit entries",
        "Server comments pre-loaded before import merge — dedup works from Admin Portal",
      ],
      added: [],
      fixed: [
        { severity: "medium", text: "History tab: no delete option existed for individual entries or entire case histories. Delete buttons added to each entry row and each case card, with confirmation dialogs." },
        { severity: "high",   text: "Weekly Tracker Excel import: re-importing the same file always logged a new audit entry (e.g. '30 new') even when the data was already stored. Root cause: _serverComments was empty if the Weekly Tracker tab was never visited before importing. Fix: _ensureServerCommentsLoaded() is now awaited in the import handler before running the merge comparison." },
      ],
      removed: [],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Drop-in replacement for v8.3.1.",
      architectureChanges: [
        "_ensureServerCommentsLoaded() added to weekly-tracker.js and exposed on public API.",
        "admin-dash.js import handler awaits _ensureServerCommentsLoaded() before _mergeServerComments().",
        "_deleteCaseHistory(cn) and _deleteHistoryEntry(cn, idx) helper functions added.",
        "Event delegation wired on wt-history-panel (stable parent) for delete button clicks.",
      ],
    },
{
      version: "v8.3.1",
      name: "Performance Cases Overview Panel",
      date: "2026-03-11",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.3.1 replaces the 'Recent Activity' section in the Overview dashboard with a dedicated 'Performance Cases' panel. The panel shows a live count of newly raised performance cases this week and all currently in-progress performance cases. Each case row displays its case number, title, owner, severity badge, current status, work item (or 'No WI' warning), and age. Newly raised cases are highlighted with a red 'NEW' badge. Cases are ordered with newest-this-week first, followed by remaining in-progress cases.",
      highlights: [
        "Overview 'Recent Activity' renamed to 'Performance Cases'",
        "Live count chips: 'New this week' and 'In Progress' performance cases",
        "Each row shows case number, title, owner, severity, status, WI, and age",
        "NEW badge highlights cases raised within the last 7 days",
        "No WI warning shown in red when no Work Item is linked",
      ],
      added: [
        { area: "Overview — Performance Cases Panel", text: "Replaced 'Recent Activity' section with a 'Performance Cases' panel. Shows summary chips (new this week count + in-progress count) followed by a detailed row list for all active and newly raised performance cases. Each row includes case number, title, owner, severity, status, work item badge, and age." },
      ],
      fixed: [],
      removed: [
        { area: "Overview — Recent Activity", text: "Removed the generic 'Recent Activity' stream (last 5 updated cases) in favour of the new focused Performance Cases panel." },
      ],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Drop-in replacement for v8.3.0.",
      architectureChanges: [
        "_aggregate() now computes perfInProgress, perfNewThisWeek, and perfMeta for use in the overview panel.",
        "_activityHTML() replaced by _perfCasesHTML(D) which renders the full Performance Cases panel including header chips and case rows.",
      ],
      developerNotes: "Case ordering: new-this-week cases first (deduplicated), then remaining in-progress. perfMeta passed through D object for work item lookup per row.",
    },
{
      version: "v8.3.0",
      name: "Performance Icons, Histogram Drill-Down & Stability Fixes",
      date: "2026-03-11",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.3.0 delivers four targeted fixes: Performance Cases now display a lightning bolt icon next to their case number everywhere in the app (except Performance Tracking). Clicking the 'No Work Item' bar in the Performance histogram now filters the table to show only those cases. Duplicate audit entries for Performance tagging are eliminated — re-tagging an already-tagged case now shows a warning toast instead. Weekly Tracker import now distinguishes new/updated/unchanged comments and only adds an audit entry when values actually change; repeated imports of the same file correctly show 'Already up to date'. The 'Invalid time value' crash on the Weekly Tracker tab caused by malformed date strings in seed data is also resolved.",
      highlights: [
        "Performance Case icon shown next to case numbers across all dashboards",
        "Histogram 'No Work Item' bar click now filters the table to matching cases",
        "Duplicate Performance tagging audit entries prevented with 'already tagged' guard",
        "Weekly Tracker Excel import: smart audit (new/updated/unchanged) — no entry if nothing changed",
        "Fixed 'Invalid time value' crash in Weekly Tracker caused by malformed date strings",
      ],
      added: [],
      fixed: [
        { severity: "medium", text: "Performance icon was missing throughout the app — now shown next to case numbers on all dashboards and tables (Closed, Created, Team, Overview, Customer, Members, Weekly Tracker), except the Performance Tracking tab itself." },
        { severity: "medium", text: "Clicking the 'No Work Item' (red) bar in the Performance histogram had no effect — now correctly filters the table to show only cases with no Work Item for that owner." },
        { severity: "low",    text: "Tagging the same case twice as Performance created duplicate audit history entries — now shows a 'already tagged' warning toast and skips the duplicate entry." },
        { severity: "medium", text: "Weekly Tracker Excel import audit entry was missing after successful import — pushChange() is now called after render(), and skipped entirely if no values actually changed (smart new/updated/unchanged tracking)." },
        { severity: "high",   text: "Weekly Tracker tab crashed with 'Invalid time value' when seed data contained malformed date strings (e.g. '2025-22-05'). All date operations are now guarded with isNaN checks." },
      ],
      removed: [],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Drop-in replacement for v8.2.0.",
      architectureChanges: [
        "table.js defaultColumns() Case Number render now checks Data.isMarkedPerformance() to conditionally prepend icon.",
        "charts.js ownerBar onClick now passes datasetIndex to callback for bar segment identification.",
        "performance.js: new _filterNoWorkItem state variable; filteredCases() updated to respect it.",
        "weekly-tracker.js _mergeServerComments() now returns { added, updated, unchanged } counts.",
        "admin-dash.js perf/nonperf tag handlers now guard against re-tagging with early return.",
      ],
      developerNotes: "All four fixes are surgical — no structural changes to data model or API surface. The histogram click fix required passing datasetIndex from Chart.js onClick through to the performance dashboard callback.",
    },
{
      version: "v8.2.0",
      name: "Customer Products Configuration & Customer Cases Logic",
      date: "2026-03-10",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.2.0 introduces a dedicated 'Customer Products' section in the Admin Portal under Team & App Configuration. Admins can now manage the list of products used by customers, import/export via Excel, and auto-detect unique Product values from any uploaded Excel file. Customer Cases are now precisely defined as: rows where Product ∈ configured customer products AND Owner ∉ configured team members. The Overview dashboard and Customer Cases dashboard both update immediately after saving. A bug was also fixed in the App Identity save handler where products were previously bundled with identity settings, causing unnecessary coupled saves.",
      highlights: [
        "New Admin Portal section: 'Customer Products' with full CRUD management",
        "Excel scan: auto-detects all unique Product column values from any uploaded Excel file",
        "Checkbox UI lets admins select which detected products to add to the list",
        "Export/Import Excel for Customer Products list (column: product)",
        "Customer Cases logic: Product IN customerProducts AND Owner NOT IN teamMembers",
        "Overview KPI 'Customer Cases' and Customer Cases dashboard now reflect admin config",
        "Products moved out of App Identity into its own dedicated section",
        "App Identity save handler decoupled from products management",
        "Admin audit log entries for all Customer Products save operations",
        "Immediate dashboard refresh after saving Customer Products",
      ],
      added: [
        { area: "Admin Portal — Customer Products", text: "New 'Customer Products' section under Team & App Configuration. Provides a textarea to manage product list, an Excel scan tool to detect unique Product values from an uploaded cases Excel, Export Excel, and Import Excel functionality." },
        { area: "Admin Portal — Customer Products — Auto-detect", text: "Upload any .xlsx/.xls/.csv file to scan for unique Product column values. A checklist appears with checkboxes; admins select which products to add. 'Add Selected to List' merges selections into the textarea without duplicates." },
        { area: "Customer Cases Logic", text: "Customer Cases are rows from Excel WHERE Product IN (Admin Portal → Customer Products) AND Owner NOT IN (Admin Portal → Team Members). This is enforced in Data.customerCases()." },
      ],
      fixed: [
        { severity: "medium", text: "App Identity save handler (dc-save-app-cfg) was bundling customerProducts in the same DC.save() call — saving identity settings also unintentionally overwrote the products list. These are now fully decoupled." },
        { severity: "low", text: "App Identity Export Excel no longer includes a 'products' column (products now have their own Export in the Customer Products section)." },
      ],
      removed: [
        { area: "App Identity", text: "Products textarea removed from App Identity & Settings section — moved to the new dedicated Customer Products section." },
      ],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Previously saved customerProducts in DynamicConfig are automatically read by the new Customer Products section. Drop-in replacement for v8.1.0.",
      architectureChanges: [
        "Customer Products management is now a first-class section in Team & App Configuration.",
        "dc-save-app-cfg no longer reads dc-cfg-products or saves customerProducts.",
        "dc-save-products is the sole owner of customerProducts persistence.",
        "DC.customerProducts() → Data.customerCases() pipeline unchanged — only the admin UI surface changed.",
      ],
      developerNotes: "Feature request: Admin Portal → Customer Products section. Implements the full requirement: fetch Product values from Excel, admin import/store, save in config table (DynamicConfig), used in Customer Cases = rows WHERE Product IN customerProducts AND Owner NOT IN teamMembers.",
    },
    {
      version: "v8.1.0",
      name: "QA Audit, Bug Fixes & Stability Enhancements",
      date: "2026-03-10",
      status: "superseded",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.1.0 is a quality-focused release resulting from a comprehensive QA audit of the entire codebase. 10 bugs were identified and fixed across UI, logic, data flow, and validation layers. Key fixes include the Modal system (missing init method, stale event listeners), table resize detection, status bar data field mismatch, admin login theme consistency, and hardcoded name aliases replaced with dynamic DynamicConfig lookups. Several performance and maintainability enhancements were also implemented.",
      highlights: [
        "Modal system: added proper init() method and replaced one-shot event listeners with persistent handlers",
        "Table resize overflow detection now persists across all window resize events (was: first resize only)",
        "Status bar 'Top Closer' stat now correctly reads 'Closed Date' field (was: missing data due to wrong field name)",
        "Admin login modal styled to match app light theme (was: dark theme colours)",
        "Admin dashboard now correctly refreshes Knowledge Hub after config changes",
        "Utils.shortName and Data._matchOwner now use DynamicConfig aliases dynamically (was: hardcoded names)",
        "Status bar year stats now use dynamic current year (was: hardcoded 2026)",
        "Severity 1 detection in status bar uses startsWith('1') consistently (was: exact match '1')",
        "CSV export now includes UTF-8 BOM for Excel compatibility",
        "Table and global search now match on product name and display-name aliases",
        "parseInt calls now include radix parameter across all modules",
        "XSS: status bar creator/closer names now properly HTML-escaped",
        "DynamicConfig.load() now has a 5-second fetch timeout to prevent hanging on slow networks",
      ],
      added: [
        { area: "Modal System", text: "Modal.init() method added — properly initializes persistent close-button and overlay-click handlers. ESC key now also closes the modal." },
        { area: "Charts", text: "Charts.destroyAll() cleanup utility added for chart instance management." },
        { area: "Table Search", text: "Table search now matches on Product column and owner display-name aliases." },
        { area: "Global Search", text: "Global search now matches on owner display-name aliases (e.g. searching 'Srinivas' finds the full name)." },
        { area: "CSV Export", text: "UTF-8 BOM added to CSV exports for seamless Excel compatibility with international characters." },
      ],
      fixed: [
        { severity: "high", text: "Modal.init() was called in App.init() but Modal did not export an init method — silently failed in try/catch. Modal close button and overlay-click handlers were registered with {once:true}, meaning they broke after first use." },
        { severity: "high", text: "Status bar 'Top Case Closer' always showed empty because it looked for r.ClosedDate/r.closedDate instead of r['Closed Date'] (the actual field name with a space)." },
        { severity: "medium", text: "Table overflow shadow detection used window resize listener with {once:true} — only detected overflow on the first resize event, never again." },
        { severity: "medium", text: "Admin login modal used dark theme colours (bg:#161616, text:#f4f4f4) in a light-themed app — visually inconsistent and jarring." },
        { severity: "medium", text: "admin-dash.js called DashKnowledge.render() after config saves, but knowledge-dash.js was never loaded in index.html. Changed to DashKnowledgeHub (the actual loaded module)." },
        { severity: "low", text: "Utils.shortName had hardcoded name-to-alias mappings instead of using DynamicConfig.nameAliases() — would not reflect admin-configured name changes." },
        { severity: "low", text: "Data._matchOwner had hardcoded bidirectional name checks instead of using the alias system — would break when admin renamed team members." },
        { severity: "low", text: "Status bar hardcoded year 2026 for creator/closer stats — would break on New Year's." },
        { severity: "low", text: "Severity 1 check in status bar used strict equality '===\"1\"' instead of startsWith('1'), inconsistent with the rest of the app which uses startsWith to handle values like '1 - Critical'." },
        { severity: "low", text: "Multiple parseInt calls missing explicit radix parameter across table.js, closed.js, customer.js, team.js, and performance.js." },
      ],
      removed: [],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Drop-in replacement for v8.0.3.",
      architectureChanges: [
        "Modal: init() method with persistent event listeners replaces per-open {once:true} pattern.",
        "Utils.shortName: delegates to Data.displayName() for alias resolution instead of hardcoded checks.",
        "Data._matchOwner: uses _nameAliases() for bidirectional name matching instead of hardcoded pairs.",
        "DynamicConfig.load: AbortController with 5s timeout prevents indefinite fetch hangs.",
      ],
      developerNotes: "Comprehensive QA audit performed across all modules. Every dashboard, module, and utility function was reviewed for correctness, UI consistency, XSS safety, and performance. Focus areas: event listener lifecycle, data field name consistency, dynamic vs hardcoded configuration, and HTML escaping in user-facing strings.",
    },
    {
      version: "v8.0.3",
      name: "Multi-Sheet Excel Import, Log File Support & Version Automation",
      date: "2026-03-10",
      status: "superseded",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v8.0.3 delivers three key improvements: the Excel import bug that only processed the first sheet (CW01) is now fixed — all 53 weekly sheets are merged automatically. Log file (.log) import support is added alongside Excel/CSV. Seed data version discrepancies (8.0.0 → 7.0.2 in 4 cases) are corrected. A centralised version.js module is introduced as the single source of truth for the app version, with an automation script (bump-version.js) to increment versions, update all files, and package releases automatically.",
      highlights: [
        "Excel import fix: all sheets in multi-sheet workbooks are now processed (was: only first sheet)",
        "Log file (.log) import added — structured header or heuristic TS-number scanning",
        "Import button relabelled 'Import Excel / CSV / Log'",
        "Seed data corrected: 4 cases had wrong version '8.0.0' fixed to '7.0.2'",
        "version.js introduced — single source of truth for app version number",
        "bump-version.js automation script: auto-increments version, updates all files, packages ZIP",
        "AppVersion object propagated to all visible badges (status bar, upload screen, info page)",
        "Changelog 'Latest' badge now dynamically reads from AppVersion instead of hardcoded string",
        "Unwanted files removed: migrate.html, empty vendor/README.txt, data/ibm_tracker_persist_v1.json cleared",
      ],
      added: [
        { area: "Admin — Weekly Tracker Import", text: ".log file support added. Two parsing modes: structured (tab/multi-space delimited with header containing 'case' and 'comment') and heuristic (scans each line for TS case number token, uses remainder of line as comment). Error shown if no entries found." },
        { area: "js/modules/version.js", text: "New file: single source of truth for MAJOR.MINOR.PATCH version. Exports AppVersion object consumed by index.html, v6-features.js, info.js, and changelog.js." },
        { area: "bump-version.js", text: "Node.js automation script: detects change type (patch/minor/major), increments version.js, updates changelog.js with a new entry, updates file headers, and packages a ZIP with the correct version name." },
      ],
      fixed: [
        { severity: "critical", text: "Excel import only read wb.SheetNames[0] — the first sheet (CW01). Multi-sheet workbooks like the Weekly Tracker with 53 sheets only imported 1 comment. Fixed: all sheets are now iterated and merged before processing." },
        { severity: "medium",   text: "Seed data in weekly-tracker.js incorrectly referenced version '8.0.0' in 4 case comments (TS016937980, TS018150940, TS018442699, TS018584854). Corrected to '7.0.2' matching the Excel source of truth." },
        { severity: "low",      text: "Changelog 'Latest' badge was hardcoded to 'v7.0.1' — would never update automatically. Now dynamically reads from AppVersion.version." },
        { severity: "low",      text: "Status bar, upload screen badge, and info page version badge were all hardcoded to different version strings. All now read from AppVersion." },
      ],
      removed: [
        { area: "migrate.html", text: "One-time localStorage migration utility removed from the package. It was a standalone tool with no links from the app, and its purpose (migrating to server storage) is complete." },
        { area: "js/vendor/README.txt", text: "Empty placeholder file removed from the vendor directory." },
      ],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Drop-in replacement for v8.0.2. Re-import the Weekly Tracker Excel file to get all 387 comments (previously only 1 was imported due to the multi-sheet bug).",
      architectureChanges: [
        "js/modules/version.js: NEW — AppVersion singleton with MAJOR, MINOR, PATCH, version, semver, date, developer.",
        "index.html: version.js loaded first; inline script at body end propagates AppVersion.version to title and upload badge.",
        "admin-dash.js _readXlsx(): now iterates all wb.SheetNames instead of wb.SheetNames[0].",
        "admin-dash.js import handler: .log branch added between .csv and .xlsx branches; accept attribute updated.",
        "v6-features.js: status bar version and welcome toast now read from AppVersion.",
        "info.js: info page version badge now reads from AppVersion.",
        "changelog.js: Latest badge now dynamically uses AppVersion.version; VERSIONS[0] always reflects current.",
        "bump-version.js: NEW — automation script for version increment + packaging.",
      ],
      developerNotes: "The version architecture is now: version.js (source) → index.html title/badge, status bar (v6-features.js), info page badge, changelog header. To release: run `node bump-version.js [patch|minor|major] 'Change description'` and it handles everything.",
    },

    {
      version: "v7.0.2",
      name: "CSV Export/Import & UX Polish Release",
      date: "2026-03-10",
      status: "superseded",
      health: "stable",
      developer: "Kabelesh K",
      summary: "v7.0.2 focuses on data portability and UX cleanup. ALM tables now support full CSV round-trip — export from the Information Dashboard ALM table and import/export from the Admin ALM Line Assignments table. The auto-detect new team members pop-up that appeared on every file upload has been removed as it was intrusive. All version badges are unified to v7.0.2.",
      highlights: [
        "ALM Lines — Customer Contact & Responsible: Export CSV button added to Information Dashboard",
        "ALM Line Assignments: Export CSV + Import CSV buttons added to Admin Console",
        "CSV import auto-fills email columns from Team Members directory when blank",
        "Removed intrusive 'New Names Detected' pop-up that appeared on every file upload",
        "All version badges unified to v7.0.2",
      ],
      added: [
        { area: "Info Dashboard — ALM Table", text: "Export CSV button in the card header exports all 9 columns (ALM Line, Customer Names, Customer Emails, Line Responsible, Line Email, CASE Responsible, Case Responsible Email, CASE Proxy, Case Proxy Email) as alm-customer-contact-responsible.csv." },
        { area: "Admin — ALM Line Assignments", text: "Export CSV button downloads current table as alm-line-assignments.csv with all 9 columns." },
        { area: "Admin — ALM Line Assignments", text: "Import CSV button reads a .csv file, auto-populates all table rows including auto-filling email columns from the Team Members directory when not present in the CSV. Displays a toast prompting Save to persist." },
      ],
      fixed: [
        { severity: "medium", text: "IC.link icon was missing from the Admin Console IC icon object, causing 'undefined synced with Info Dashboard › ALM Lines' to appear in the ALM Line Assignments section header. The chain-link SVG is now properly defined." },
        { severity: "medium", text: "Stray closing brace '}); ' in info.js was prematurely terminating the edit-mode event binding block, causing Add ALM Line, IBM Directory management, and Save to silently fail in edit mode." },
      ],
      removed: [
        { area: "Upload Flow", text: "Auto-detect new team members modal — the 'New Names Detected / Found N new name(s) in the Owner column' dialog that appeared on every file upload has been removed. It was intrusive and required dismissal on every upload. Team members are managed directly via the Admin Console Team Members section." },
      ],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Drop-in replacement for v7.0 ifix01.",
      architectureChanges: [
        "app.js: _detectNewOwners() function and its setTimeout call removed from _onLoaded pipeline.",
        "admin-dash.js: dc-export-alm-csv and dc-import-alm-csv handlers added. IC object extended with IC.link and IC.download.",
        "info.js: info-export-alm-csv handler added. Export reads from DEFAULT_DATA in view mode and _collectEditedData() in edit mode.",
      ],
      developerNotes: "CSV import uses a quoted-field parser (handles commas inside quoted fields, double-quote escaping). Column mapping is header-name driven so column order in the CSV file is flexible.",
    },

    {
      version: "v7.0 ifix01",
      name: "ALM Sync, Security & UI Alignment Release",
      date: "2026-03-10",
      status: "superseded",
      health: "stable",
      developer: "Kabelesh K",
      summary: "ifix01 delivers four key improvements: full bi-directional sync between the Admin ALM Line Assignments table and the Information Dashboard ALM table so changes in either location are immediately reflected in the other; two new email columns (Case Responsible Email and Case Proxy Email) with auto-fetch from Team Members and manual override; the Admin Security button now opens a functional Security Questions dialog; and the Information Dashboard ALM edit mode is redesigned as a proper scrollable table matching the Admin console style exactly.",
      highlights: [
        "ALM tables now fully bi-directionally synced — save in Admin reflects in Info Dashboard and vice versa",
        "Case Responsible Email & Case Proxy Email columns added to both ALM tables",
        "Email columns auto-fetch from Team Members directory with manual override support",
        "Admin Console Security button now functional — set up security questions for admin recovery",
        "Information Dashboard ALM edit mode redesigned as scrollable table (9 columns, matches Admin style)",
        "Modal system implemented — Security Questions, Reassign dialogs now fully operational",
        "All version badges unified to v7.0 ifix01 across the entire application",
        "Email placeholders corrected to name@de.bosch.com format",
      ],
      added: [
        { area: "Admin ALM Table", text: "Case Responsible Email column — IBM team member email, auto-fetched from Team Members directory when a name is typed, with manual override support." },
        { area: "Admin ALM Table", text: "Case Proxy Email column — IBM team member email, auto-fetched from Team Members directory, with manual override support." },
        { area: "Info Dashboard ALM", text: "Case Responsible Email and Case Proxy Email fields added to the edit mode ALM table." },
        { area: "Admin Security", text: "Security Questions dialog — admin can now set up two security questions via the Security button in the Admin Console header." },
        { area: "Modal System", text: "modal.js fully implemented with Modal.open(), Modal.close(), Modal.showReassign(), and Modal.showSetupSecurityQuestions()." },
      ],
      fixed: [
        { severity: "critical", text: "modal.js was empty — Modal was undefined, causing the Security button to silently fail and breaking the Reassign case dialog. Full modal implementation added." },
        { severity: "high",     text: "Admin Console Security, Undo, Redo, and Clear Data buttons were non-functional due to missing Modal module. All now work correctly." },
        { severity: "high",     text: "Information Dashboard ALM edit mode was disorganised — accordion rows mixed with separate expand grids caused a broken layout. Rebuilt as a proper scrollable table matching the Admin console style." },
        { severity: "medium",   text: "Email placeholder text corrected from name.de.bosch.com to name@de.bosch.com in all ALM email inputs." },
        { severity: "medium",   text: "Version number inconsistency — info.js showed v6.3.0 while other parts showed v7.0.1 or v7.0.0. All version references now unified to v7.0 ifix01." },
      ],
      removed: [],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. ALM data persisted in localStorage will be automatically read by both the Admin and Info Dashboard tables. No data migration required.",
      architectureChanges: [
        "modal.js: implemented from empty file — Modal singleton with open/close/showReassign/showSetupSecurityQuestions.",
        "info.js saveData(): now also calls DynamicConfig.save() to push almResponsible + customerContacts back to the shared config store, completing bi-directional sync.",
        "admin-dash.js dc-save-alm: continues to push responsible data into ibm_tracker_info_v1 localStorage for immediate Info Dashboard reflection.",
      ],
      developerNotes: "The sync architecture is now: DynamicConfig (shared store) ← admin-dash save → ibm_tracker_info_v1; and info.js saveData → DynamicConfig. Both tables read from DynamicConfig on render, so they always display the same data. The modal.js was the single biggest blocker — it was referenced by admin-dash, team.js, and knowledge-dash but the file was 0 bytes.",
    },

    {
      version: "v7.0.1",
      name: "Bug Fix & Polish Release",
      date: "2026-03-10",
      status: "superseded",
      health: "stable",
      developer: "Kabelesh K",
      summary: "Patch release addressing four reported issues: activity stream label corrected from 'Awaiting customer reply' to 'Awaiting your feedback', Admin Console undo/redo/clear data buttons now reliably respond to clicks, Version History section filter buttons scroll the detail panel into view on activation, and the landing page is simplified — Required Columns and What's New in v6 sections removed, version badge updated to v7.0.1.",
      highlights: [
        "Activity stream: 'Awaiting customer reply' → 'Awaiting your feedback'",
        "Admin Console: undo, redo, clear data buttons fixed",
        "Version History: Added/Fixed/Removed/Known Issues filters now scroll to content",
        "Landing page: Required Columns section removed",
        "Landing page: What's New in v6 section removed",
        "Landing page: version badge updated to v7.0.1",
      ],
      added: [],
      fixed: [
        { severity: "medium", text: "Activity stream in Overview showed 'Awaiting customer reply' instead of 'Awaiting your feedback' — corrected to match the canonical status label used throughout the app." },
        { severity: "high",   text: "Admin Console — undo, redo, and clear data buttons were unresponsive due to missing optional chaining on getElementById calls and DashPerformance.render() being called unconditionally. All three buttons now use safe optional chaining and guard against the disabled attribute." },
        { severity: "medium", text: "Version History section filter buttons (Added / Fixed / Removed / Known Issues) did not visually navigate to filtered content — smooth scroll to the detail panel is now triggered after each filter change." },
      ],
      removed: [
        { area: "Landing Page", text: "Required columns in your IBM export section — removed to simplify the upload screen." },
        { area: "Landing Page", text: "What's New in v6 section — removed as it referenced an outdated version. Version badge updated from v6 to v7.0.1." },
      ],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. This is a drop-in patch release.",
      architectureChanges: [],
      developerNotes: "Patch addresses user-reported UX regressions from v7.0.0. The undo/redo fix uses hasAttribute('disabled') instead of the disabled property to correctly detect the disabled state set via innerHTML template string interpolation.",
    },

    {
      version: "v7.0.0",
      name: "IBM Case Operations Command Center",
      date: "2026-03-10",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "Major version 7 — the Overview tab is completely rebuilt as an IBM Case Operations Command Center. Seven operational zones give engineers immediate situational awareness: KPI strip with trend arrows, Trend Intelligence with 3/6/12M toggle, Status donut with rich legend, Owner Workload + Product charts, Operational Alerts panel, Activity Stream, and an enhanced filterable table. The Wednesday Updates dropdown positioning is fixed via a DOM portal approach, and Admin Portal nav now correctly appears only when admin is logged in.",
      highlights: [
        "Overview rebuilt as 7-zone operational command center",
        "Zone 1: Executive KPI strip with trend arrows (vs last week)",
        "Zone 2: Trend chart with 3M/6M/12M toggle + running totals",
        "Zone 2: Status donut with count + percentage legend",
        "Zone 3: Owner Workload chart (top 10, active cases only)",
        "Zone 3: Cases by Product horizontal bar chart",
        "Zone 4: Operational Alerts — critical/warning signals",
        "Zone 5: Recent Activity stream (last 5 updates)",
        "Zone 6: Enhanced table with search + status filter chips",
        "Zone 7: Quick Actions bar (Open Case, Refresh, Export, Investigate)",
        "Wednesday dropdown — fixed via DOM portal (body-level positioning)",
        "Admin Portal nav correctly hidden/shown based on login state",
        "Status bar updated: Top Case Creator / Top Case Closer labels",
        "Developer name (Kabelesh K) displayed near Updated timestamp",
        "Must Gather checklist restored as clickable links (no checkboxes)",
      ],
      added: [
        { area: "Overview", text: "Zone 1 — KPI strip: 7 metrics in a single responsive row with icons, color coding and trend arrows vs previous week" },
        { area: "Overview", text: "Zone 2 — Trend Intelligence: 3M/6M/12M window toggle with running totals (Created + Closed) above chart" },
        { area: "Overview", text: "Zone 2 — Status donut legend: name · count · percentage per status row, click any row to drill the table" },
        { area: "Overview", text: "Zone 3 — Workload charts: Owner Workload (active top 10) + Cases by Product — both clickable for table drill" },
        { area: "Overview", text: "Zone 4 — Operational Alerts: cases awaiting customer >5d, waiting for IBM >5d, escalated/Sev-1, oldest open case — click any alert to drill table" },
        { area: "Overview", text: "Zone 5 — Activity Stream: last 5 updated cases with action description and relative timestamp" },
        { area: "Overview", text: "Zone 6 — Enhanced table: inline search (case ID, title, owner, product, status) + 4 quick filter chips with live counts" },
        { area: "Overview", text: "Zone 7 — Quick Actions bar: Open IBM Case, Refresh Dashboard, Export Data, Case Investigation" },
        { area: "CSS", text: "css/v7-overview.css — 340-line scoped stylesheet, all selectors prefixed .ov7-* for zero collision" },
      ],
      fixed: [
        { severity: "high",   text: "Wednesday Updates dropdown rendered far to the right of its trigger button — root cause: position:fixed inside a scrollable overflow ancestor. Fixed via DOM portal: dropdown is moved to document.body on wire, guaranteeing fixed positioning works from the viewport origin." },
        { severity: "medium", text: "Admin Portal nav item was fully removed from HTML — restored with class='hidden' and style='display:none' so admin.js can show it on login as designed." },
        { severity: "low",    text: "Status bar top creator/closer labels now read 'Top Case Creator' and 'Top Case Closer' with proper capitalisation." },
        { severity: "low",    text: "Developer name 'Dev: Kabelesh K' now appears in status bar adjacent to Updated timestamp." },
        { severity: "low",    text: "Must Gather checklist restored to Information & Resources page as clickable link rows (checkboxes removed per request). Edit mode add/remove still functional." },
        { severity: "low",    text: "Performance chart owner names now fully visible: canvas height increased to 300px, x-axis rotation 35–90° with autoSkip:false." },
      ],
      removed: [
        { area: "Overview", text: "Replaced previous flat vertical layout with 7-zone operational grid — no functionality removed, all existing chart click-through and drill behaviour preserved." },
      ],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. All existing Data, Utils, Charts, Table module APIs are unchanged. The new overview.js is a drop-in replacement — it exports the same { render } interface used by the tab router.",
      architectureChanges: [
        "css/v7-overview.css — new scoped stylesheet linked after v6-enhancements.css in index.html",
        "overview.js — fully rewritten, same public API: DashOverview.render()",
        "Dropdown portal pattern introduced in performance.js wireDayPickers(): drop moved to document.body once on wire, positioned via getBoundingClientRect() + offsetWidth/offsetHeight for accurate viewport clamping",
      ],
      developerNotes: "The 7-zone layout was designed to achieve max information density within 1–1.5 screen heights on a 1440px display. The DOM portal pattern for dropdowns is now the recommended approach for any fixed-position popover that lives inside an overflow:auto/hidden ancestor — always move the element to document.body before measuring, and use offsetWidth/offsetHeight (not getBoundingClientRect) to measure the drop after display:block to avoid transform interference.",
    },

    {
      version: "v6.3.0",
      name: "Admin Edition — Safety Guard & Case Ops Console",
      date: "2026-03-10",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "Full v6.3.0 release. Introduces the Critical Action Safety Guard system for bulk operation protection, and completely redesigns the Information & Resources page as a central Case Operations Console with three operational zones: Escalation Overview, Case Preparation & Resources, and Contacts & Responsibility Directory.",
      highlights: [
        "Critical Action Safety Guard modal",
        "CONFIRM-to-proceed requirement",
        "Live preview table for affected cases",
        "Safety Guard Audit Log with full trail",
        "Information page redesigned as Case Ops Console",
        "Must Gather interactive checklist",
        "Case Investigation Template with copy button",
        "Quick Actions bar with direct case entry points",
        "Bulk reassignment & tagging protection",
        "Data reset protection",
      ],
      added: [
        { area: "Safety Guard", text: "js/modules/safety-guard.js — new standalone module with SafetyGuard.intercept(), guardBulkReassign(), guardBulkTagging(), guardClearData()" },
        { area: "Information Page", text: "Complete redesign as Case Operations Console — three-zone layout: Escalation Overview, Case Preparation & Resources, Contacts & Responsibility Directory" },
        { area: "Information Page", text: "Severity cards now rendered as platform KPI cards (kpi-red/yellow/blue/green) — consistent with dashboard-wide card language" },
        { area: "Information Page", text: "Quick Actions bar — Open IBM Case, Escalate Case, Copy Title Format, Case Handling Wiki, Customer ICN Tracking" },
        { area: "Information Page", text: "Must Gather interactive checklist — click row to check/uncheck with visual state, Copy List button, per-item link to IBM documentation" },
        { area: "Information Page", text: "Case Investigation Template — structured multi-field template with single-click copy button" },
        { area: "Information Page", text: "Escalation Contacts redesigned as 3-column grid (Expertise Connect | Team Lead | BD Escalation) inside a single card" },
        { area: "Information Page", text: "Zone section dividers with label + horizontal rule for instant visual scanning" },
        { area: "Safety Guard", text: "CONFIRM-to-proceed input: admin must type the exact word CONFIRM (case-sensitive) before the Proceed button activates" },
        { area: "Safety Guard", text: "Live case preview table inside confirmation modal — shows Case ID, Current Owner, New Owner (and Status for reassignments) with scrollable overflow for large sets" },
        { area: "Safety Guard", text: "Severity tiering: operations affecting 20+ cases are flagged CRITICAL (red), smaller operations are flagged HIGH (amber)" },
        { area: "Safety Guard", text: "Animated guard modal with blur backdrop, slide-in animation, and ESC/backdrop-click to cancel — fully consistent with existing platform modal style" },
        { area: "Audit Log", text: "Safety Guard Audit Log section in Admin Portal — dedicated card showing all guarded operations with action type, severity badge, affected count, inline preview, and timestamp" },
        { area: "Audit Log", text: "Every confirmed operation writes to localStorage key ibm_safety_audit_v1 (max 200 entries) AND inserts a synthetic bulk entry into the change history timeline" },
        { area: "Admin Portal", text: "Safety Guard KPI card added to the admin KPI row — shows total number of guarded operations executed" },
        { area: "Admin Portal", text: "Bulk performance import: operations of 5+ cases now route through SafetyGuard.guardBulkTagging() with full preview table" },
        { area: "Admin Portal", text: "Bulk reassign (Selected) and Reassign ALL both now route through SafetyGuard.guardBulkReassign() — old simple Modal.open() confirm replaced" },
        { area: "Admin Portal", text: "Clear Data reset button now routes through SafetyGuard.guardClearData() — shows itemised list of data types that will be deleted" },
        { area: "Admin Portal", text: "Added IC.shield, IC.warn, IC.save, IC.close icons to admin icon set" },
        { area: "CSS", text: "Safety Guard styles embedded via injected <style id=sg-styles> — includes sg-fade-in and sg-slide-in animations and input validation state classes" },
      ],
      fixed: [
        { severity: "medium", text: "Bulk reassign operations could be accidentally triggered with a single click — now protected by CONFIRM gate" },
        { severity: "medium", text: "Clear Data could be triggered via a simple browser confirm() dialog — now protected by CONFIRM gate with itemised impact list" },
        { severity: "low",    text: "Bulk import of 50+ performance cases had no visual warning about scale — now shows preview table for imports of 5+ cases" },
        { severity: "low",    text: "Source and target owner being the same in bulk reassign produced a confusing operation — added same-owner guard with feedback message" },
      ],
      removed: [],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Safety Guard persists its audit log separately from the main change history (key: ibm_safety_audit_v1). Existing change history is unaffected.",
      architectureChanges: [
        "New module: js/modules/safety-guard.js — loaded after admin.js in index.html",
        "SafetyGuard.intercept() is the generic interception primitive; guardBulkReassign(), guardBulkTagging(), guardClearData() are typed wrappers",
        "Dual audit trail: Safety Guard writes to its own localStorage key AND injects into Data.changeHistory() for unified visibility",
        "SafetyGuard.auditLog() is a pure read function — no side effects, always reads from localStorage",
      ],
      developerNotes: "This is the first release fully dedicated to the Admin Portal experience. The Safety Guard was designed to be generic enough to protect any future high-impact operation — just call SafetyGuard.intercept() with the right opts object. The CONFIRM gate pattern is intentionally higher friction than a standard confirm() dialog: it forces the admin to read the preview before typing, reducing muscle-memory mistakes on large datasets.",
      regressionLinks: [],
    },

    {
      version: "v6.2",
      name: "Bug Fix & UI Consistency Release",
      date: "2026-03-10",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "Eight targeted bug fixes: admin portal security, double-password login, header stat cleanup, availability icon consistency, Wednesday dropdown fix, button standardisation, and full version history documentation.",
      highlights: ["Admin portal hidden until logged in", "Single-attempt login fixed", "Header stat removed", "Availability icons standardised", "Wed dropdown fixed", "Buttons consistent"],
      added: [
        { area: "CSS", text: "btn-overlay class: standardised dark-background button style for admin header band" },
        { area: "CSS", text: "btn-danger-filled class: solid red filled button for destructive primary actions" },
        { area: "CSS", text: "btn-warning class: yellow-tinted button for caution actions" },
      ],
      fixed: [
        { severity: "critical", text: "Fix 1 & 8 — Admin Portal tab visible in sidebar before login; admin.js module was missing — created fresh with init(), updateHeader(), showLoginModal(), logout()" },
        { severity: "critical", text: "Fix 2 — Admin login required password to be entered twice; stale DashAdmin form state was causing silent failure on first attempt — new admin.js single-attempt flow resolves this" },
        { severity: "high",     text: "Fix 6 — Wednesday date-picker dropdown not appearing on click in Performance Tracking; document closeDrop listener was stacking on every wireDayPickers() call — fixed with panel._dayDropCloseWired flag and node-clone to clear duplicate handlers" },
        { severity: "high",     text: "Fix 7 — Inconsistent button styles across the app (inline background/border/color overrides); all action buttons now use standard .btn-* CSS classes — btn-overlay, btn-danger-filled, btn-warning, btn-success, btn-ghost added or applied throughout admin-dash.js and info.js" },
        { severity: "medium",   text: "Fix 4 — '127 open · Top: Srinivas K (118)' appearing in app header; updateHeader() now sets #header-total to empty string — team stats remain in the status bar only" },
        { severity: "medium",   text: "Fix 5 — Availability dropdown using coloured emoji icons (✅❌🏖🔔) inconsistent with app UI; replaced with standard monochrome unicode symbols (✓ ✗ ◌ →) in both <option> elements and avIcon() display function" },
        { severity: "low",      text: "Fix 3 — Top Creator/Closer status bar values clarified; values are correctly computed from the full loaded dataset — display is working as designed for the active CSV data range" },
      ],
      removed: [
        { text: "Inline background/border/color style attributes on action buttons throughout admin-dash.js and info.js — replaced with CSS classes" },
        { text: "'127 open · Top: Srinivas K (118)' header stat display — removed from header; retained in status bar" },
      ],
      knownIssues: [],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. Custom themes overriding button styles should be updated to reference the new .btn-overlay, .btn-danger-filled, and .btn-warning classes.",
      architectureChanges: [
        "admin.js module fully extracted: all admin auth logic (login modal, header update, logout) now lives in js/modules/admin.js",
        "wireDayPickers() in performance.js now uses a per-panel _dayDropCloseWired flag to prevent event listener stacking",
        "Button style system extended with three new semantic classes in css/components.css",
      ],
      developerNotes: "This release resolves all 8 reported post-v6.1 issues. The most impactful fixes are the admin module creation (Fixes 1, 2, 8) and the Wednesday dropdown event-listener stacking (Fix 6). Button consistency (Fix 7) was addressed holistically by auditing all inline styles across dashboards and extracting them to CSS classes, ensuring future changes are made in one place.",
      regressionLinks: [],
    },

    {
      version: "v6.1",
      name: "Stability & Security Release",
      date: "2026-03-10",
      status: "stable",
      health: "stable",
      developer: "Kabelesh K",
      summary: "Bug fixes, security hardening for admin access, KPI alignment, and developer attribution.",
      highlights: ["Admin Portal security fix", "KPI card consistency", "Wed date picker fixed", "Developer: Kabelesh K"],
      added: [
        { area: "Security", text: "Admin tab is now completely hidden (display:none) before login — enforced on app init" },
        { area: "Security", text: "renderTab() security guard — direct navigation to admin tab without authentication is blocked and redirected to Overview" },
        { area: "Admin Portal", text: "Completely redesigned Admin Console UI with dark gradient hero header matching overall app aesthetic" },
        { area: "Admin Portal", text: "Live password match validation in Change Password form — shows ✓/⚠ in real time as you type" },
        { area: "Admin Portal", text: "Enter key support on confirm password field to submit the form" },
        { area: "Status Bar", text: "Now shows Top Case Creator and Top Case Closer by team member name and count instead of generic total/open numbers" },
        { area: "Header", text: "Header stat updated to show 'open · Top: [Name] (N)' for team performance visibility" },
        { area: "Developer", text: "Developer name 'Kabelesh K' added to sidebar footer, status bar, and Information page" },
        { area: "Information Page", text: "Developer card added at the bottom of Information & Resources page" },
        { area: "CSS", text: "Comprehensive KPI card CSS rewrite — authoritative override for all previous versions with proper padding, font-mono, accent bars" },
        { area: "CSS", text: "Wednesday day picker dropdown CSS fully fixed with explicit colors and proper z-index layering" },
      ],
      fixed: [
        { severity: "critical", text: "Admin Portal visible before logging in — anyone could access admin features without a password" },
        { severity: "high", text: "KPI cards misaligned with app font and design standard — font-size, font-family, padding inconsistent" },
        { severity: "high", text: "Wednesday Updates date picker dropdown not showing — was using undefined CSS variables (var(--surface-1), var(--border)) and clipped by overflow" },
        { severity: "high", text: "Admin login appeared to require password entry twice — Change Password form had unclear UX without live validation" },
        { severity: "medium", text: "Status bar showing '2000 cases · 127 open' instead of meaningful team member insights" },
        { severity: "low", text: "Wednesday day picker dropdown positioned incorrectly using position:absolute on overflow:hidden parent" },
        { severity: "low", text: "Admin tab could still be navigated to via keyboard or URL hash manipulation" },
      ],
      removed: [
        { text: "Generic 'X total · Y open' display from header (replaced with meaningful top-performer stat)" },
        { text: "Admin tab with only CSS hidden class (now enforced with display:none + JS guard)" },
      ],
      knownIssues: [],
      breakingChanges: [
        { text: "Admin tab visibility enforcement now requires JS initialization — any custom code bypassing renderTab() will break security guard" },
        { text: "KPI card CSS fully overrides all previous versions — custom KPI styling from v4/v5 will need to be updated" },
      ],
      migrationGuidance: "Ensure all custom KPI card styles reference the new .kpi-card CSS class structure. Security integrations must not bypass renderTab() guard.",
      architectureChanges: [
        "CSS variable system standardized — all dropdown menus now use explicit hex values instead of undefined variables",
        "KPI card structure rewritten with authoritative specificity overrides",
        "Admin portal access enforced at JS initialization level, not CSS state",
      ],
      developerNotes: "This release focused on security hardening and UI stability. Admin portal access is now protected at initialization level rather than CSS state. All critical security gaps from v6.0 have been resolved. KPI card styling has been fully standardized across the application.",
      regressionLinks: ["toast-system-crash", "admin-visibility"],
    },

    {
      version: "v6.0",
      name: "Major Feature Release",
      date: "2026-03-09",
      status: "stable",
      health: "minor-issues",
      developer: "Kabelesh K",
      summary: "Major release introducing Command Palette, Status Bar, Tooltips, Back-to-Top, Copy-to-Clipboard, Sticky Header, and Print Mode. Toast and keyboard shortcuts from v3 were re-integrated and redesigned.",
      highlights: ["Command Palette (⌘K)", "Status Bar", "Smart Tooltips", "Print Mode", "Back-to-Top"],
      added: [
        { area: "Command Palette", text: "Ctrl+K / ⌘K opens a fuzzy-search command palette with 17 items across Navigate / Actions / Help groups" },
        { area: "Command Palette", text: "Arrow key navigation + Enter to execute, Esc to dismiss" },
        { area: "Command Palette", text: "Header hint button showing ⌘K shortcut" },
        { area: "Toast System", text: "Re-integrated from v3 with redesigned styling — 5-max queue, hover-pause timer, progress bar per toast" },
        { area: "Toast System", text: "SVG icons per type (success/error/warning/info), left accent bar, slide-in/out animations" },
        { area: "Toast System", text: "Welcome toast on load, stale case alerts, What's New session toast" },
        { area: "Keyboard Shortcuts", text: "Re-integrated from v3: 1–9 navigate tabs, / focus search, A open AI, ? show shortcuts modal, Esc close panels" },
        { area: "Keyboard Shortcuts", text: "Redesigned shortcuts modal with full grid layout and categorized shortcuts" },
        { area: "Progress Bar", text: "Re-integrated from v3 with shimmer animation — V6.showProgress() / V6.hideProgress() API" },
        { area: "Status Bar", text: "Fixed bottom status bar showing case counts, Sev1 alerts, timestamp, and version badge" },
        { area: "Back-to-Top", text: "Fixed bottom-right button that appears after 300px scroll with smooth scroll animation" },
        { area: "Smart Tooltips", text: "data-tip attribute triggers dark tooltip after 450ms delay, auto-positioned above target" },
        { area: "Copy to Clipboard", text: "V6.copyToClipboard() API and data-copy attribute auto-wiring with success toast" },
        { area: "Sticky Header", text: ".header-scrolled class added on scroll for elevated shadow effect" },
        { area: "Print Mode", text: "beforeprint/afterprint handlers toggle .print-mode on body, hiding sidebar and overlays" },
        { area: "Design Tokens", text: "Full v6 CSS token system — surface, border, text, shadow, animation easing variables" },
        { area: "Design System", text: "Skeleton loader CSS for loading states" },
        { area: "Sidebar", text: "Version badge v6.0 in sidebar footer" },
        { area: "Upload Screen", text: "'What's New in v6' panel added to upload screen" },
      ],
      fixed: [
        { severity: "medium", text: "v3 toast and keyboard features were lost when v3-enhancements.js was removed in v4/v5 — re-integrated in v6" },
        { severity: "medium", text: "No dark mode enforcement — v6 forces light theme via @media (prefers-color-scheme: dark) override" },
      ],
      removed: [
        { text: "v3-enhancements.js — features merged directly into v6-features.js with improved architecture" },
      ],
      knownIssues: [
        { text: "Admin Portal tab visible in sidebar before login (fixed in v6.1)" },
        { text: "KPI card font/alignment inconsistent with app standard (fixed in v6.1)" },
        { text: "Wednesday date picker dropdown invisible — CSS variable mismatch (fixed in v6.1)" },
        { text: "Status bar showed raw case count instead of meaningful team stats (fixed in v6.1)" },
      ],
      breakingChanges: [
        { text: "Toast notification system rebuilt — V3.toast() API deprecated, replaced by V6.toast()" },
        { text: "Keyboard shortcut module restored with new modal design — shortcuts.js must load before dashboard init" },
        { text: "Legacy v3-enhancements.js removed — all features now in v6-features.js" },
      ],
      migrationGuidance: "Developers must load shortcuts.js before dashboard initialization. Update any references from V3.toast() to V6.toast(). Remove v3-enhancements.js script tag from HTML.",
      architectureChanges: [
        "Toast notification engine rebuilt from v3 foundation with new V6 API surface",
        "Keyboard shortcut handler reintroduced as integrated module in v6-features.js",
        "Full CSS token system v6 introduced — design tokens unified across components",
      ],
      developerNotes: "This release was a comprehensive feature catch-up and architecture modernization. The v3-enhancements.js dependency was finally resolved by merging all functionality directly into v6-features.js. The command palette was the marquee feature, providing keyboard-first navigation across the entire application.",
      regressionLinks: [],
    },

    {
      version: "v5.0",
      name: "Professional UI Refresh",
      date: "2026-02-01",
      status: "superseded",
      health: "minor-issues",
      developer: "Kabelesh K",
      summary: "CSS-only visual upgrade. No new JS features. Focus on premium sidebar, refined KPI cards, spring animations, and enforcing light-only mode.",
      highlights: ["Premium dark sidebar", "KPI card elevation", "Spring animations", "Light-only enforcement"],
      added: [
        { area: "Design Tokens", text: "Full v5 CSS token system — --v5-bg-*, --v5-text-*, --v5-border-*, --v5-shadow-* variables" },
        { area: "Sidebar", text: "Premium dark sidebar (#13171f) with active item left-border indicator and refined nav item hover states" },
        { area: "Header", text: "White top header with blue theme-color meta tag (#0f62fe)" },
        { area: "KPI Cards", text: "3px top accent border per color type, hover lift with spring animation" },
        { area: "Animations", text: "Spring easing cubic-bezier(0.22,1,0.36,1) applied to interactive elements" },
        { area: "Modal", text: "Blur backdrop on modals for depth" },
        { area: "Upload Screen", text: "Animated orbs in upload background" },
        { area: "Light Mode Enforcement", text: "@media (prefers-color-scheme: dark) override — forces color-scheme:light globally" },
      ],
      fixed: [
        { severity: "medium", text: "Inconsistent light/dark mode rendering across OS preferences — now enforced light-only" },
        { severity: "low", text: "KPI card borders and shadows lacked visual hierarchy" },
      ],
      removed: [],
      knownIssues: [
        { text: "v3 toast notifications and keyboard shortcuts not available (v3-enhancements.js removed in v4)" },
        { text: "No command palette or status bar (added in v6)" },
      ],
      breakingChanges: [],
      migrationGuidance: "No breaking changes. CSS-only upgrade is backwards compatible.",
      architectureChanges: [
        "v5 CSS token system layered on top of base variables — no conflicts with v4 tokens",
        "Spring animation easing standardized as global utility",
      ],
      developerNotes: "Pure CSS upgrade release. No JavaScript changes were made. This was primarily a design systems refresh to bring the sidebar and KPI cards to premium quality. The light-mode enforcement was added after OS dark mode was causing inconsistent rendering across developer machines.",
      regressionLinks: [],
    },

    {
      version: "v4.0",
      name: "Information Page & UI Polish",
      date: "2025-11-01",
      status: "superseded",
      health: "requires-hotfix",
      developer: "Kabelesh K",
      summary: "Focused on redesigning the Information page with an Atlassian-inspired card layout system. Enhanced KPI cards and section title styling.",
      highlights: ["Information page card redesign", "Atlassian card system", "Enhanced KPI cards"],
      added: [
        { area: "Information Page", text: "Complete card system redesign inspired by Atlassian design language" },
        { area: "Information Page", text: ".atl-card, .atl-card-header, .atl-card-title, .atl-card-body component classes" },
        { area: "Information Page", text: ".atl-kpi-row grid system for the Info page KPI display" },
        { area: "KPI Cards", text: "Enhanced .kpi-card with improved hover states and color variants" },
        { area: "Section Titles", text: "Refined .section-title with vertical bar accent styling" },
        { area: "Error Handling", text: "Improved tab render error UI with retry button alongside back button" },
        { area: "Error Handling", text: "Enlarged error icon (56×56px) and improved error message layout" },
      ],
      fixed: [
        { severity: "medium", text: "Information page had no visual structure — cards now group related content clearly" },
        { severity: "low", text: "Tab render error only showed a Back button — Retry button added" },
      ],
      removed: [
        { text: "v3-enhancements.js — Toast notifications and keyboard shortcuts removed (regression, re-added in v6)" },
      ],
      knownIssues: [
        { text: "Removing v3-enhancements.js caused toast notifications and keyboard shortcuts to stop working" },
        { text: "No visual refresh of sidebar or header (addressed in v5)" },
      ],
      breakingChanges: [
        { text: "v3-enhancements.js removed — toast and keyboard shortcut features lost until v6" },
      ],
      migrationGuidance: "If upgrading from v3, toast notifications and keyboard shortcuts will be unavailable until v6.0.",
      architectureChanges: [
        "Atlassian card component system introduced as separate CSS layer",
        "v3-enhancements.js dependency removed — caused feature regression",
      ],
      developerNotes: "The decision to remove v3-enhancements.js was made to reduce complexity but introduced a significant regression. This became the root cause tracked in the regression log. The Atlassian card system was a clean addition and has remained stable through all subsequent versions.",
      regressionLinks: ["toast-system-crash"],
    },

    {
      version: "v3.0",
      name: "UX Enhancement Suite",
      date: "2025-08-01",
      status: "superseded",
      health: "stable",
      developer: "Kabelesh K",
      summary: "Major UX upgrade adding Toast Notifications, Keyboard Shortcuts, Progress Bar, and visual polish. Introduced the v3-enhancements.js architecture.",
      highlights: ["Toast notifications", "Keyboard shortcuts", "Progress bar", "Stale case alerts"],
      added: [
        { area: "Toast Notifications", text: "Full toast system — V3.toast(title, msg, type, duration) API" },
        { area: "Toast Notifications", text: "5-max queue with oldest-dismissal, hover-pause timer, progress bar animation" },
        { area: "Toast Notifications", text: "4 types: success (green), error (red), warning (yellow), info (blue)" },
        { area: "Toast Notifications", text: "Slide-in from bottom-right with exit animation" },
        { area: "Keyboard Shortcuts", text: "Keys 1–9 for tab navigation, / for global search focus, A for AI panel" },
        { area: "Keyboard Shortcuts", text: "? or Shift+/ to show keyboard shortcuts modal" },
        { area: "Keyboard Shortcuts", text: "Esc to close panels and modals" },
        { area: "Progress Bar", text: "Top-of-page progress bar with shimmer animation for data loading" },
        { area: "Progress Bar", text: "V3.showProgress() / V3.hideProgress() API" },
        { area: "Stale Alerts", text: "Automatic toast warning when 10+ cases are stale (not updated in 10 days)" },
        { area: "Welcome Toast", text: "Loads case count on data upload with welcome message" },
        { area: "Version Badge", text: "v3 badge with pulse animation in sidebar footer" },
        { area: "Upload Screen", text: "'What's New' panel on upload screen listing v3 features" },
        { area: "Session Integration", text: "Session expiry warning uses toast instead of browser alert" },
        { area: "Reload Toast", text: "File reload shows toast notification with updated case count" },
        { area: "KB Toast", text: "Knowledge base ingestion completion triggers info toast" },
      ],
      fixed: [
        { severity: "high", text: "Session expiry used browser alert() — now uses toast notification" },
        { severity: "medium", text: "No keyboard navigation — now fully supported with 1–9, /, A, ?, Esc" },
        { severity: "medium", text: "No visual feedback during data loading — progress bar added" },
      ],
      removed: [],
      knownIssues: [
        { text: "v3-enhancements.js architecture creates dependency — removing it in v4 caused regression" },
      ],
      breakingChanges: [],
      migrationGuidance: "No breaking changes from previous versions.",
      architectureChanges: [
        "v3-enhancements.js introduced as standalone enhancement module",
        "Toast notification system introduced as core app-level feature",
        "Keyboard shortcut handler introduced as first-class navigation primitive",
      ],
      developerNotes: "This was a landmark UX release. The v3-enhancements.js pattern was intended to keep enhancements isolated and removable. In retrospect, the modularity created a fragile dependency that caused the v4 regression. Future enhancements should be integrated into core app.js rather than kept in separate enhancement files.",
      regressionLinks: [],
    },
  ];

  /* ── Regression Tracker Data ────────────────────────────── */
  const REGRESSIONS = [
    {
      id: "toast-system-crash",
      issue: "Toast notification system lost",
      firstFixed: "v3.0",
      reappeared: "v4.0",
      finalResolution: "v6.0",
      rootCause: "v3-enhancements.js removed accidentally during v4 refactor",
      severity: "high",
    },
    {
      id: "admin-visibility",
      issue: "Admin tab visible before login / double-password login",
      firstFixed: "v3.0",
      reappeared: "v6.0",
      finalResolution: "v6.2",
      rootCause: "admin.js module was missing entirely — Admin.init() called in app.js but file did not exist, causing silent failure. CSS-only visibility was a stop-gap. v6.2 creates the full module with single-attempt login, proper logout, and enforced display:none on init.",
      severity: "critical",
    },
  ];

  /* ── Feature Lifecycle Data ─────────────────────────────── */
  const FEATURE_LIFECYCLE = [
    { feature: "KPI Dashboard", introduced: "v3.0", lastModified: "v6.1", deprecated: "—", notes: "CSS structure fully rewritten in v6.1 with authoritative overrides" },
    { feature: "Admin Portal", introduced: "v5.0", lastModified: "v6.3.0", deprecated: "—", notes: "Safety Guard system added in v6.3; admin.js module in v6.2; single-attempt login fixed" },
    { feature: "Toast Notifications", introduced: "v3.0", lastModified: "v6.0", deprecated: "—", notes: "System rewritten in v6; V3.toast() deprecated in favor of V6.toast()" },
    { feature: "Keyboard Shortcuts", introduced: "v3.0", lastModified: "v6.0", deprecated: "—", notes: "Lost in v4, restored in v6 with improved modal design" },
    { feature: "Command Palette", introduced: "v6.0", lastModified: "v6.0", deprecated: "—", notes: "17 commands, fuzzy search, keyboard navigation" },
    { feature: "Status Bar", introduced: "v6.0", lastModified: "v6.2", deprecated: "—", notes: "Upgraded in v6.1 to show top performer; header stat removed in v6.2 — stats in status bar only" },
    { feature: "Information Page", introduced: "v4.0", lastModified: "v6.3.0", deprecated: "—", notes: "Redesigned as Case Ops Console in v6.3.0 — three-zone layout, Must Gather checklist, Investigation template, Quick Actions" },
        { feature: "Weekly Tracker", introduced: "v5.0", lastModified: "v6.2", deprecated: "—", notes: "Availability dropdown icons standardised to monochrome unicode in v6.2" },
        { feature: "Performance Tracking", introduced: "v5.0", lastModified: "v6.2", deprecated: "—", notes: "Wednesday day-picker dropdown fixed in v6.2 — event listener stacking resolved" },
    { feature: "Progress Bar", introduced: "v3.0", lastModified: "v6.0", deprecated: "—", notes: "API renamed from V3.showProgress() to V6.showProgress()" },
    { feature: "Dark Sidebar", introduced: "v5.0", lastModified: "v6.3.0", deprecated: "—", notes: "Version badge updated each release; v6.3.0 is current" },
    { feature: "v3-enhancements.js", introduced: "v3.0", lastModified: "v3.0", deprecated: "v4.0", notes: "Removed in v4, caused regression; features merged into v6-features.js in v6.0" },
  ];

  /* ── Root Cause Log ─────────────────────────────────────── */
  const ROOT_CAUSE_LOG = [
    {
      bug: "Admin tab visible before login",
      rootCause: "CSS relied only on class visibility (.hidden) instead of initialization check — any JS that added/removed the class could expose the tab",
      resolution: "JS guard implemented in renderTab() on application init; display:none enforced from startup",
      fixedVersion: "v6.1",
      severity: "critical",
    },
    {
      bug: "Wednesday date picker dropdown invisible",
      rootCause: "Custom select component used undefined CSS variables (var(--surface-1), var(--border)) and parent overflow:hidden clipped the dropdown",
      resolution: "Explicit hex colors added; dropdown repositioned using position:fixed with getBoundingClientRect()",
      fixedVersion: "v6.1",
      severity: "high",
    },
    {
      bug: "Toast notifications lost in v4",
      rootCause: "v3-enhancements.js was treated as optional/removable dependency; removing it stripped toast and keyboard shortcut functionality",
      resolution: "All v3 features merged directly into v6-features.js as integrated module, eliminating the fragile file dependency",
      fixedVersion: "v6.0",
      severity: "high",
    },
    {
      bug: "KPI cards misaligned font and size",
      rootCause: "Multiple CSS files (v4, v5, v6) each defined .kpi-card with different specificity — later files didn't always win",
      resolution: "Single authoritative .kpi-card CSS block in v6-enhancements.css with !important overrides for font-family, size, and padding",
      fixedVersion: "v6.1",
      severity: "medium",
    },
    {
      bug: "Dark mode rendering on some OS settings",
      rootCause: "No color-scheme enforcement; app relied on browser defaults which could render dark mode on macOS/Windows dark OS theme",
      resolution: "@media (prefers-color-scheme: dark) { :root { color-scheme: light } } added in v5 and carried through all subsequent versions",
      fixedVersion: "v5.0",
      severity: "medium",
    },
  ];

  /* ── SVG icons ─────────────────────────────────────────── */
  const IC = {
    plus:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    fix:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    remove:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    warn:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>`,
    copy:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="14" height="14" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
    tag:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    star:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    dev:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    calendar:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    shield:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    info:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>`,
    lightning:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    layers:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    refresh: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    notes:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    compare: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    alert:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    zap:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  };

  const SEV_CONFIG = {
    critical: { bg: "rgba(218,30,40,.12)", color: "var(--chart-5)", border: "rgba(218,30,40,.3)", label: "Critical" },
    high:     { bg: "rgba(166,120,0,.1)",  color: "var(--chart-3)", border: "rgba(166,120,0,.3)",  label: "High"     },
    medium:   { bg: "rgba(15,98,254,.08)", color: "var(--chart-1)", border: "rgba(15,98,254,.2)",  label: "Medium"   },
    low:      { bg: "rgba(105,41,196,.08)",color: "var(--chart-4)", border: "rgba(105,41,196,.2)", label: "Low"      },
  };

  const STATUS_CONFIG = {
    current:    { bg: "rgba(25,128,56,.12)",  color: "var(--chart-2)", border: "rgba(25,128,56,.3)",  label: "Current"    },
    stable:     { bg: "rgba(15,98,254,.1)",   color: "var(--chart-1)", border: "rgba(15,98,254,.25)", label: "Stable"     },
    superseded: { bg: "rgba(107,114,128,.1)", color: "var(--text-tertiary)", border: "rgba(107,114,128,.2)",label: "Superseded" },
  };

  const HEALTH_CONFIG = {
    "stable":        { emoji: "🟢", label: "Stable",          color: "var(--chart-2)", bg: "rgba(25,128,56,.1)",   border: "rgba(25,128,56,.25)"   },
    "minor-issues":  { emoji: "🟡", label: "Minor Issues",    color: "var(--chart-3)", bg: "rgba(166,120,0,.1)",   border: "rgba(166,120,0,.25)"   },
    "requires-hotfix":{ emoji: "🔴", label: "Requires Hotfix", color: "var(--chart-5)", bg: "rgba(218,30,40,.1)",  border: "rgba(218,30,40,.25)"  },
  };

  /* ── State ─────────────────────────────────────────────── */
  let _activeVersion  = (typeof AppVersion !== "undefined") ? AppVersion.version : VERSIONS[0].version;
  let _activeSection  = "all";
  let _searchQ        = "";
  let _compareFrom    = VERSIONS[0].version;
  let _compareTo      = VERSIONS[1] ? VERSIONS[1].version : VERSIONS[0].version;

  /* ── Computed Impact Score ─────────────────────────────── */
  function _impactScore(v) {
    const added   = v.added        || [];
    const fixed   = v.fixed        || [];
    const removed = v.removed      || [];
    const secFixes = fixed.filter(f => f.severity === "critical" || added.some(a => a.area === "Security")).length;
    return added.length + fixed.length + (secFixes * 2) - removed.length;
  }

  /* ── Render ────────────────────────────────────────────── */
  function render() {
    const el = document.getElementById("tab-changelog");
    if (!el) return;

    const totalAdded   = VERSIONS.reduce((a,v) => a + (v.added   ||[]).length, 0);
    const totalFixed   = VERSIONS.reduce((a,v) => a + (v.fixed   ||[]).length, 0);
    const totalRemoved = VERSIONS.reduce((a,v) => a + (v.removed ||[]).length, 0);
    const totalKnown   = VERSIONS.reduce((a,v) => a + (v.knownIssues||[]).length, 0);
    const avgImpact    = Math.round(VERSIONS.reduce((a,v) => a + _impactScore(v), 0) / VERSIONS.length);

    el.innerHTML = `
      <!-- ═══ PAGE HEADER (compact) ═══ -->
      <div style="background:var(--sidebar-bg);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:14px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;right:-20px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(15,98,254,.12) 0%,transparent 70%);pointer-events:none"></div>
        <div style="position:relative;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div style="width:32px;height:32px;border-radius:var(--radius-md);background:rgba(15,98,254,.25);border:1px solid rgba(15,98,254,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ibm-blue-30)" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
              <h1 style="font-size:16px;font-weight:700;color:#fff;margin:0;letter-spacing:var(--tracking-tight);white-space:nowrap">Release Intelligence Dashboard</h1>
              <span style="font-size:11px;color:rgba(255,255,255,.4)">IBM Case Intelligence Platform · Single source of truth for every release</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;flex-shrink:0">
            <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,.45)">${IC.dev} <strong style="color:rgba(255,255,255,.75)">Kabelesh K</strong></span>
            <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,.45)">${IC.star} <strong style="color:rgba(255,255,255,.8);font-family:var(--font-mono)">${VERSIONS.find(v=>v.status==="current")?.version||VERSIONS[0].version}</strong> <span>current</span></span>
            <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,.45)">${IC.calendar} ${VERSIONS.length} versions · 2025–2026</span>
          </div>
        </div>
      </div>

      <!-- ═══ STATS ROW (compact) ═══ -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:12px">
        ${_statCard("Total Versions",       VERSIONS.length,      "var(--chart-1)")}
        ${_statCard("Features Added",       totalAdded,           "var(--chart-2)")}
        ${_statCard("Bugs Fixed",           totalFixed,           "var(--chart-5)")}
        ${_statCard("Items Removed",        totalRemoved,         "var(--chart-4)")}
        ${_statCard("Known Issues",         totalKnown,           "var(--chart-3)")}
        ${_statCard("Avg Impact",           avgImpact,            "var(--chart-6)")}
        ${_statCard("Regressions",          REGRESSIONS.length,   "var(--chart-8)")}
      </div>

      <!-- ═══ CONTROLS (single compact row) ═══ -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <div class="form-input-group" style="flex:1;min-width:180px;max-width:280px">
          <span class="input-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </span>
          <input id="cl-search" type="text" class="search-input" style="height:30px;font-size:12px" placeholder="Search features, fixes, root causes…" value="${Utils.escHtml(_searchQ)}"/>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap" id="cl-section-filters">
          ${["all","added","fixed","removed","known"].map(s => `
            <button class="cl-sf-btn" data-sec="${s}" style="padding:4px 10px;font-size:11px;font-weight:600;border-radius:var(--radius-sm);border:1px solid ${_activeSection===s?'var(--ibm-blue-50)':'var(--border-subtle)'};background:${_activeSection===s?'rgba(15,98,254,.1)':'transparent'};color:${_activeSection===s?'var(--ibm-blue-50)':'var(--text-secondary)'};cursor:pointer;transition:all var(--transition-fast);white-space:nowrap">
              ${{all:"All",added:"+ Added",fixed:"✓ Fixed",removed:"− Removed",known:"⚠ Issues"}[s]}
            </button>`).join("")}
        </div>
      </div>

      <!-- ═══ MAIN LAYOUT ═══ -->
      <div style="display:grid;grid-template-columns:200px 1fr;gap:12px;align-items:start">

        <!-- VERSION TIMELINE SIDEBAR -->
        <div id="cl-version-nav" style="position:sticky;top:60px">
          <div style="font-size:var(--font-size-2xs);font-weight:600;letter-spacing:.1em;text-transform:none;color:var(--text-tertiary);margin-bottom:6px;padding:0 2px">Versions</div>
          ${VERSIONS.map(v => _versionNavItem(v)).join("")}
          <div style="margin-top:8px;padding:8px 10px;background:rgba(15,98,254,.05);border:1px solid rgba(15,98,254,.12);border-radius:var(--radius-sm)">
            <div style="font-size:10px;font-weight:600;color:var(--ibm-blue-50);margin-bottom:3px;display:flex;align-items:center;gap:4px">${IC.info} Tip</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-tertiary);line-height:1.5">Reference before each release to avoid regressions.</div>
          </div>
        </div>

        <!-- VERSION DETAIL PANEL -->
        <div id="cl-version-detail">
          ${_renderVersionDetail(VERSIONS.find(v => v.version === _activeVersion) || VERSIONS[0])}
        </div>
      </div>

      <!-- ═══ GLOBAL INTELLIGENCE SECTIONS ═══ -->
      <div style="margin-top:20px">
        ${_renderCompare()}
        ${_renderRegressionTracker()}
        ${_renderFeatureLifecycle()}
        ${_renderRootCauseLog()}
      </div>
    `;

    _wire(el);
  }

  /* ── Stat card ─────────────────────────────────────────── */
  function _statCard(label, value, color) {
    return `<div style="background:var(--bg-ui);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:10px 12px;border-top:3px solid ${color};box-shadow:0 1px 3px rgba(0,0,0,.05)">
      <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</div>
      <div style="font-size:22px;font-weight:700;font-family:var(--font-mono);color:${color};line-height:1">${value}</div>
    </div>`;
  }

  /* ── Health badge ──────────────────────────────────────── */
  function _healthBadge(health, small) {
    const h = HEALTH_CONFIG[health] || HEALTH_CONFIG["stable"];
    const sz = small ? "9px" : "10px";
    const pad = small ? "1px 6px" : "2px 8px";
    return `<span style="font-size:${sz};font-weight:700;padding:${pad};border-radius:var(--radius-md);background:${h.bg};color:${h.color};border:1px solid ${h.border};white-space:nowrap">${h.emoji} ${h.label}</span>`;
  }

  /* ── Version nav item ──────────────────────────────────── */
  function _versionNavItem(v) {
    const isActive = v.version === _activeVersion;
    const sc = STATUS_CONFIG[v.status];
    return `<button class="cl-ver-btn" data-ver="${v.version}" style="
      width:100%;text-align:left;padding:7px 10px;border-radius:var(--radius-sm);margin-bottom:3px;cursor:pointer;
      background:${isActive ? 'rgba(15,98,254,.1)' : 'transparent'};
      border:1px solid ${isActive ? 'var(--ibm-blue-50)' : 'transparent'};
      border-left:3px solid ${isActive ? 'var(--ibm-blue-50)' : 'transparent'};
      transition:all var(--transition-fast)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
        <span style="font-size:12px;font-weight:600;font-family:var(--font-mono);color:${isActive?'var(--ibm-blue-50)':'var(--text-primary)'}">${v.version}</span>
        <span style="font-size:9px;font-weight:600;padding:1px 5px;border-radius:var(--radius-md);background:${sc.bg};color:${sc.color};border:1px solid ${sc.border}">${sc.label}</span>
      </div>
      <div style="font-size:10px;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px">${v.name}</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:var(--font-size-2xs);color:var(--text-disabled);display:flex;align-items:center;gap:4px">${IC.calendar} ${v.date}</div>
        ${_healthBadge(v.health, true)}
      </div>
    </button>`;
  }

  /* ── Version detail ────────────────────────────────────── */
  function _renderVersionDetail(v) {
    if (!v) return `<div style="padding:40px;text-align:center;color:var(--text-tertiary)">Select a version</div>`;

    const sc = STATUS_CONFIG[v.status];
    const hc = HEALTH_CONFIG[v.health] || HEALTH_CONFIG["stable"];
    const filtered_added   = _filterItems(v.added        || [], "text area");
    const filtered_fixed   = _filterItems(v.fixed        || [], "text severity");
    const filtered_removed = _filterItems(v.removed      || [], "text");
    const filtered_known   = _filterItems(v.knownIssues  || [], "text");
    const impact           = _impactScore(v);

    const totalItems = filtered_added.length + filtered_fixed.length + filtered_removed.length + filtered_known.length;
    const noResults  = _searchQ.length > 1 && totalItems === 0;

    return `
      <!-- Version header -->
      <div class="tile" style="padding:14px 16px;margin-bottom:10px;border-top:3px solid ${sc.color}">
        <!-- Version title row -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
              <span style="font-size:20px;font-weight:700;font-family:var(--font-mono);color:var(--text-primary)">${v.version}</span>
              <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--radius-md);background:${sc.bg};color:${sc.color};border:1px solid ${sc.border}">${sc.label}</span>
              ${_healthBadge(v.health, false)}
              ${v.status === "current" ? `<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:var(--radius-md);background:rgba(25,128,56,.12);color:var(--green);border:1px solid rgba(25,128,56,.3)">★ Latest</span>` : ""}
              <span style="font-size:11px;color:var(--text-tertiary);display:flex;align-items:center;gap:4px;margin-left:4px">${IC.calendar} ${v.date} &nbsp;·&nbsp; ${IC.dev} <strong style="color:var(--text-secondary)">${v.developer}</strong></span>
            </div>
            <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:5px">${v.name}</div>
            <p style="font-size:12px;color:var(--text-secondary);margin:0;line-height:1.6;max-width:600px">${v.summary}</p>
          </div>
          <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:6px">
            <div style="padding:7px 10px;background:rgba(0,125,121,.07);border:1px solid rgba(0,125,121,.2);border-radius:var(--radius-sm);text-align:center;min-width:80px">
              <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--teal);margin-bottom:1px;display:flex;align-items:center;justify-content:center;gap:4px">${IC.lightning} Impact
                <span tabindex="0" title="Impact Score = Added features + Bug fixes + (Critical/security fixes × 2) − Removed features. A higher score means a more significant release."
                  style="display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;border-radius:50%;background:rgba(0,125,121,.2);color:var(--teal);font-size:8px;font-weight:700;cursor:help">?</span>
              </div>
              <div style="font-size:22px;font-weight:700;font-family:var(--font-mono);color:var(--teal);line-height:1">${impact}</div>
              <div style="font-size:9px;color:var(--text-tertiary);margin-top:1px">score</div>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">
              <span style="font-size:10px;padding:2px 7px;border-radius:var(--radius-md);background:rgba(25,128,56,.1);color:var(--green);border:1px solid rgba(25,128,56,.2)">${IC.plus} ${(v.added||[]).length}</span>
              <span style="font-size:10px;padding:2px 7px;border-radius:var(--radius-md);background:rgba(218,30,40,.08);color:var(--red);border:1px solid rgba(218,30,40,.2)">${IC.fix} ${(v.fixed||[]).length}</span>
              ${(v.removed||[]).length ? `<span style="font-size:10px;padding:2px 7px;border-radius:var(--radius-md);background:rgba(107,114,128,.08);color:var(--text-tertiary);border:1px solid rgba(107,114,128,.2)">${IC.remove} ${(v.removed||[]).length}</span>` : ""}
            </div>
          </div>
        </div>
        ${v.highlights.length ? `
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:4px;flex-wrap:wrap">
            <span style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);flex-shrink:0">Highlights</span>
            ${v.highlights.map(h => `<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--radius-md);background:rgba(15,98,254,.07);color:var(--ibm-blue-50);border:1px solid rgba(15,98,254,.15)">${h}</span>`).join("")}
          </div>
        ` : ""}
      </div>

      ${noResults ? `
        <div style="padding:32px;text-align:center;color:var(--text-tertiary)">
          <div style="font-size:28px;margin-bottom:8px">🔍</div>
          <div style="font-size:13px;font-weight:600;color:var(--text-secondary)">No results for "${Utils.escHtml(_searchQ)}"</div>
        </div>
      ` : ""}

      <!-- Developer Notes -->
      ${v.developerNotes ? `
        <div class="tile" style="padding:10px 14px;margin-bottom:8px;border-left:3px solid #007d79;background:rgba(0,125,121,.03)">
          <div style="font-size:11px;font-weight:600;color:var(--teal);margin-bottom:5px;display:flex;align-items:center;gap:4px">${IC.notes} Developer Notes</div>
          <p style="font-size:12px;color:var(--text-secondary);margin:0;line-height:1.6">${Utils.escHtml(v.developerNotes)}</p>
        </div>
      ` : ""}

      <!-- Breaking Changes -->
      ${v.breakingChanges && v.breakingChanges.length ? `
        <div class="tile" style="padding:0;margin-bottom:8px;overflow:hidden;border:1px solid rgba(218,30,40,.25)">
          <div style="padding:8px 14px;background:rgba(218,30,40,.06);border-bottom:1px solid rgba(218,30,40,.15);display:flex;align-items:center;gap:8px">
            <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(218,30,40,.15);color:var(--red)">${IC.alert}</span>
            <span style="font-size:12px;font-weight:600;color:var(--red)">Breaking Changes</span>
            <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(218,30,40,.12);color:var(--red);border:1px solid rgba(218,30,40,.2);margin-left:auto">${v.breakingChanges.length}</span>
          </div>
          <div style="padding:4px 0">
            ${v.breakingChanges.map(b => `
              <div style="display:flex;gap:8px;padding:6px 14px;border-bottom:1px solid rgba(228,231,237,.5);align-items:flex-start">
                <span style="color:var(--red);margin-top:1px;flex-shrink:0">${IC.alert}</span>
                <span style="font-size:12px;color:var(--text-primary);line-height:1.5">${Utils.escHtml(b.text)}</span>
              </div>`).join("")}
          </div>
          ${v.migrationGuidance ? `
            <div style="padding:8px 14px;background:rgba(218,30,40,.04)">
              <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--red);margin-bottom:4px">Migration Guidance</div>
              <p style="font-size:12px;color:var(--text-secondary);margin:0;line-height:1.5">${Utils.escHtml(v.migrationGuidance)}</p>
            </div>
          ` : ""}
        </div>
      ` : ""}

      <!-- Architecture Changes -->
      ${v.architectureChanges && v.architectureChanges.length ? `
        <div class="tile" style="padding:0;margin-bottom:8px;overflow:hidden">
          <div style="padding:8px 14px;background:rgba(105,41,196,.04);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
            <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(105,41,196,.12);color:var(--purple)">${IC.layers}</span>
            <span style="font-size:12px;font-weight:600;color:var(--purple)">Architecture Changes</span>
            <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(105,41,196,.1);color:var(--purple);border:1px solid rgba(105,41,196,.2);margin-left:auto">${v.architectureChanges.length}</span>
          </div>
          <div style="padding:3px 0">
            ${v.architectureChanges.map(a => `
              <div style="display:flex;gap:8px;padding:6px 14px;border-bottom:1px solid rgba(228,231,237,.5);align-items:flex-start">
                <span style="color:var(--purple);margin-top:1px;flex-shrink:0">${IC.layers}</span>
                <span style="font-size:12px;color:var(--text-secondary);line-height:1.5">${Utils.escHtml(a)}</span>
              </div>`).join("")}
          </div>
        </div>
      ` : ""}

      <!-- ADDED -->
      ${(_activeSection==="all"||_activeSection==="added") && filtered_added.length ? `
        <div class="tile" style="padding:0;margin-bottom:8px;overflow:hidden">
          <div style="padding:8px 14px;background:rgba(25,128,56,.04);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
            <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(25,128,56,.15);color:var(--green)">${IC.plus}</span>
            <span style="font-size:12px;font-weight:600;color:var(--green)">Added</span>
            <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(25,128,56,.12);color:var(--green);border:1px solid rgba(25,128,56,.2);margin-left:auto">${filtered_added.length}</span>
          </div>
          <div style="padding:2px 0">
            ${_groupByArea(filtered_added).map(([area, items]) => `
              <div style="padding:7px 14px">
                <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);margin-bottom:5px;display:flex;align-items:center;gap:4px">
                  ${IC.tag} ${Utils.escHtml(area)}
                  <span style="font-size:9px;padding:0 4px;border-radius:var(--radius-sm);background:rgba(25,128,56,.1);color:var(--green);border:1px solid rgba(25,128,56,.2)">${items.length}</span>
                </div>
                ${items.map(i => `
                  <div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid rgba(228,231,237,.5);align-items:flex-start">
                    <span style="color:var(--green);margin-top:1px;flex-shrink:0">${IC.plus}</span>
                    <span style="font-size:12px;color:var(--text-primary);line-height:1.5">${_highlight(Utils.escHtml(i.text))}</span>
                  </div>`).join("")}
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <!-- FIXED -->
      ${(_activeSection==="all"||_activeSection==="fixed") && filtered_fixed.length ? `
        <div class="tile" style="padding:0;margin-bottom:8px;overflow:hidden">
          <div style="padding:8px 14px;background:rgba(218,30,40,.03);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
            <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(218,30,40,.12);color:var(--red)">${IC.fix}</span>
            <span style="font-size:12px;font-weight:600;color:var(--red)">Bugs Fixed</span>
            <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(218,30,40,.1);color:var(--red);border:1px solid rgba(218,30,40,.2);margin-left:auto">${filtered_fixed.length}</span>
          </div>
          <div style="padding:3px 0">
            ${filtered_fixed.map(i => {
              const s = SEV_CONFIG[i.severity] || SEV_CONFIG.medium;
              return `<div style="display:flex;gap:8px;padding:6px 14px;border-bottom:1px solid rgba(228,231,237,.5);align-items:flex-start">
                <span style="font-size:9px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:${s.bg};color:${s.color};border:1px solid ${s.border};white-space:nowrap;flex-shrink:0;margin-top:1px">${s.label}</span>
                <span style="font-size:12px;color:var(--text-primary);line-height:1.5">${_highlight(Utils.escHtml(i.text))}</span>
              </div>`;
            }).join("")}
          </div>
        </div>
      ` : ""}

      <!-- REMOVED -->
      ${(_activeSection==="all"||_activeSection==="removed") && filtered_removed.length ? `
        <div class="tile" style="padding:0;margin-bottom:8px;overflow:hidden">
          <div style="padding:8px 14px;background:rgba(107,114,128,.04);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
            <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(107,114,128,.12);color:var(--text-tertiary)">${IC.remove}</span>
            <span style="font-size:12px;font-weight:600;color:var(--text-tertiary)">Removed</span>
            <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(107,114,128,.1);color:var(--text-tertiary);border:1px solid rgba(107,114,128,.2);margin-left:auto">${filtered_removed.length}</span>
          </div>
          <div style="padding:3px 0">
            ${filtered_removed.map(i => `
              <div style="display:flex;gap:8px;padding:6px 14px;border-bottom:1px solid rgba(228,231,237,.5);align-items:flex-start">
                <span style="color:var(--text-tertiary);margin-top:1px;flex-shrink:0">${IC.remove}</span>
                <span style="font-size:12px;color:var(--text-secondary);line-height:1.5">${_highlight(Utils.escHtml(i.text))}</span>
              </div>`).join("")}
          </div>
        </div>
      ` : ""}

      <!-- KNOWN ISSUES -->
      ${(_activeSection==="all"||_activeSection==="known") && filtered_known.length ? `
        <div class="tile" style="padding:0;margin-bottom:8px;overflow:hidden">
          <div style="padding:8px 14px;background:rgba(178,134,0,.04);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
            <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(178,134,0,.15);color:var(--yellow)">${IC.warn}</span>
            <span style="font-size:12px;font-weight:600;color:var(--yellow)">Known Issues</span>
            <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(178,134,0,.1);color:var(--yellow);border:1px solid rgba(178,134,0,.2);margin-left:auto">${filtered_known.length}</span>
          </div>
          <div style="padding:3px 0">
            ${filtered_known.map(i => `
              <div style="display:flex;gap:8px;padding:6px 14px;border-bottom:1px solid rgba(228,231,237,.5);align-items:flex-start">
                <span style="color:var(--yellow);margin-top:1px;flex-shrink:0">${IC.warn}</span>
                <span style="font-size:12px;color:var(--text-secondary);line-height:1.5">${_highlight(Utils.escHtml(i.text))}</span>
              </div>`).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Empty state -->
      ${!noResults && (_activeSection!=="all") && (filtered_added.length + filtered_fixed.length + filtered_removed.length + filtered_known.length === 0) ? `
        <div style="padding:24px;text-align:center;color:var(--text-tertiary)">
          <div style="font-size:12px">No ${_activeSection} items for ${v.version}</div>
        </div>
      ` : ""}

      <!-- NEXT RELEASE GUIDANCE -->
      ${v.status === "current" ? `
        <div class="tile" style="padding:12px 14px;margin-bottom:8px;border-left:3px solid #0f62fe">
          <div style="font-size:12px;font-weight:600;color:var(--ibm-blue-50);margin-bottom:7px;display:flex;align-items:center;gap:6px">
            ${IC.shield} Development Guidance (Current Release: ${v.version})
          </div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">
            <div style="margin-bottom:6px;font-weight:600;color:var(--text-primary)">Carry-forward checklist:</div>
            ${[
              "Always enforce admin tab as display:none on init — never rely on CSS class alone",
              "KPI cards must use .kpi-card .kpi-label + .kpi-value structure with font-mono for numbers",
              "All dropdown menus should use position:fixed with getBoundingClientRect() to avoid overflow clipping",
              "Status bar and header should show meaningful team insights, not raw counts",
              "No dark mode — always include @media (prefers-color-scheme: dark) { :root { color-scheme: light } }",
              "v6-features.js V6 module must be the last script before </body>",
              "All new CSS variables must be defined in :root — never use undefined variables like var(--surface-1)",
              "Password forms should have live match validation with visual feedback",
              "Developer attribution: Kabelesh K — include in sidebar, status bar, and info page",
            ].map(tip => `<div style="display:flex;gap:8px;padding:3px 0;align-items:flex-start">
              <span style="color:var(--ibm-blue-50);flex-shrink:0;margin-top:1px">${IC.fix}</span>
              <span style="font-size:var(--font-size-xs)">${Utils.escHtml(tip)}</span>
            </div>`).join("")}
          </div>
        </div>
      ` : ""}
    `;
  }

  /* ── Version Comparison Tool ───────────────────────────── */
  function _renderCompare() {
    const vFrom = VERSIONS.find(v => v.version === _compareFrom);
    const vTo   = VERSIONS.find(v => v.version === _compareTo);
    const vOpts = VERSIONS.map(v => `<option value="${v.version}" ${v.version===_compareFrom?'selected':''}>${v.version}</option>`).join("");
    const vOpts2= VERSIONS.map(v => `<option value="${v.version}" ${v.version===_compareTo?'selected':''}>${v.version}</option>`).join("");

    let compResult = "";
    if (vFrom && vTo && _compareFrom !== _compareTo) {
      const fromAdded   = vFrom.added      || [];
      const fromFixed   = vFrom.fixed      || [];
      const fromRemoved = vFrom.removed    || [];
      const fromKnown   = vFrom.knownIssues|| [];
      compResult = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;margin-top:10px">
          <div style="padding:8px 10px;background:rgba(25,128,56,.07);border:1px solid rgba(25,128,56,.2);border-radius:var(--radius-sm);text-align:center">
            <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--green);margin-bottom:2px">${IC.plus} Added</div>
            <div style="font-size:20px;font-weight:700;font-family:var(--font-mono);color:var(--green)">${fromAdded.length}</div>
          </div>
          <div style="padding:8px 10px;background:rgba(15,98,254,.07);border:1px solid rgba(15,98,254,.2);border-radius:var(--radius-sm);text-align:center">
            <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--ibm-blue-50);margin-bottom:2px">${IC.fix} Fixed</div>
            <div style="font-size:20px;font-weight:700;font-family:var(--font-mono);color:var(--ibm-blue-50)">${fromFixed.length}</div>
          </div>
          <div style="padding:8px 10px;background:rgba(107,114,128,.07);border:1px solid rgba(107,114,128,.2);border-radius:var(--radius-sm);text-align:center">
            <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);margin-bottom:2px">${IC.remove} Removed</div>
            <div style="font-size:20px;font-weight:700;font-family:var(--font-mono);color:var(--text-tertiary)">${fromRemoved.length}</div>
          </div>
          <div style="padding:8px 10px;background:rgba(178,134,0,.07);border:1px solid rgba(178,134,0,.2);border-radius:var(--radius-sm);text-align:center">
            <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--yellow);margin-bottom:2px">${IC.warn} Known Issues</div>
            <div style="font-size:20px;font-weight:700;font-family:var(--font-mono);color:var(--yellow)">${fromKnown.length}</div>
          </div>
          <div style="padding:8px 10px;background:rgba(0,125,121,.07);border:1px solid rgba(0,125,121,.2);border-radius:var(--radius-sm);text-align:center">
            <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--teal);margin-bottom:2px">${IC.lightning} Impact Δ</div>
            <div style="font-size:20px;font-weight:700;font-family:var(--font-mono);color:var(--teal)">+${_impactScore(vFrom) - _impactScore(vTo)}</div>
          </div>
        </div>
        <div style="margin-top:8px;padding:8px 12px;background:rgba(15,98,254,.04);border:1px solid rgba(15,98,254,.1);border-radius:var(--radius-sm)">
          <div style="font-size:11px;color:var(--text-tertiary);line-height:1.5">
            <strong style="color:var(--text-secondary)">${_compareFrom}</strong> compared to <strong style="color:var(--text-secondary)">${_compareTo}</strong>:
            ${_compareFrom > _compareTo
              ? ` ${fromAdded.length} new features, ${fromFixed.length} bugs resolved, impact score ${_impactScore(vFrom) > _impactScore(vTo) ? 'improved' : 'same'} by ${Math.abs(_impactScore(vFrom) - _impactScore(vTo))} points.`
              : ` Viewing an older release.`}
          </div>
        </div>
      `;
    } else if (_compareFrom === _compareTo) {
      compResult = `<div style="margin-top:8px;padding:8px 12px;background:rgba(178,134,0,.07);border:1px solid rgba(178,134,0,.2);border-radius:var(--radius-sm);font-size:var(--font-size-xs);color:var(--yellow)">Select two different versions to compare.</div>`;
    }

    return `
      <div class="tile" style="padding:0;margin-bottom:10px;overflow:hidden">
        <div style="padding:8px 14px;background:rgba(0,125,121,.04);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
          <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(0,125,121,.12);color:var(--teal)">${IC.compare}</span>
          <span style="font-size:12px;font-weight:600;color:var(--teal)">Version Comparison Tool</span>
        </div>
        <div style="padding:10px 14px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:6px">
              <label style="font-size:11px;font-weight:600;color:var(--text-tertiary)">Compare</label>
              <select id="cl-compare-from" class="form-input" style="height:28px;font-size:12px;min-width:82px;font-family:var(--font-mono);font-weight:600">${vOpts}</select>
            </div>
            <span style="font-size:11px;color:var(--text-tertiary);font-weight:600">vs</span>
            <div style="display:flex;align-items:center;gap:6px">
              <select id="cl-compare-to" class="form-input" style="height:28px;font-size:12px;min-width:82px;font-family:var(--font-mono);font-weight:600">${vOpts2}</select>
            </div>
          </div>
          ${compResult}
        </div>
      </div>
    `;
  }

  /* ── Regression Tracker ────────────────────────────────── */
  function _renderRegressionTracker() {
    return `
      <div class="tile" style="padding:0;margin-bottom:10px;overflow:hidden">
        <div style="padding:8px 14px;background:rgba(162,25,31,.04);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
          <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(162,25,31,.12);color:var(--red)">${IC.refresh}</span>
          <span style="font-size:13px;font-weight:700;color:var(--red)">Regression Tracker</span>
          <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(162,25,31,.1);color:var(--red);border:1px solid rgba(162,25,31,.2);margin-left:auto">${REGRESSIONS.length} tracked</span>
        </div>
        <div style="padding:0 0 2px">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 2fr;gap:0;padding:6px 14px;background:var(--bg-layer);border-bottom:1px solid var(--border-subtle)">
            ${["Issue","First Fixed","Reappeared","Final Resolution","Root Cause"].map(h =>
              `<div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">${h}</div>`
            ).join("")}
          </div>
          ${REGRESSIONS.map(r => {
            const s = SEV_CONFIG[r.severity] || SEV_CONFIG.medium;
            return `<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 2fr;gap:0;padding:7px 14px;border-bottom:1px solid rgba(228,231,237,.5);align-items:start">
              <div>
                <span style="font-size:9px;font-weight:600;padding:1px 5px;border-radius:var(--radius-sm);background:${s.bg};color:${s.color};border:1px solid ${s.border};margin-right:5px">${s.label}</span>
                <span style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-primary)">${Utils.escHtml(r.issue)}</span>
                ${r.finalResolution && r.finalResolution !== '—' ? `<span style="font-size:9px;font-weight:600;padding:1px 5px;border-radius:var(--radius-sm);background:rgba(25,128,56,.1);color:var(--green);border:1px solid rgba(25,128,56,.25);margin-left:4px">✓ Resolved</span>` : ''}
              </div>
              <div style="font-size:var(--font-size-xs);font-family:var(--font-mono);font-weight:600;color:var(--green)">${r.firstFixed}</div>
              <div style="font-size:var(--font-size-xs);font-family:var(--font-mono);font-weight:600;color:var(--red)">${r.reappeared}</div>
              <div style="font-size:var(--font-size-xs);font-family:var(--font-mono);font-weight:600;color:var(--ibm-blue-50)">${r.finalResolution}</div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.4">${Utils.escHtml(r.rootCause)}</div>
            </div>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  /* ── Feature Lifecycle Tracker ─────────────────────────── */
  function _renderFeatureLifecycle() {
    return `
      <div class="tile" style="padding:0;margin-bottom:10px;overflow:hidden">
        <div style="padding:8px 14px;background:rgba(15,98,254,.04);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
          <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(15,98,254,.12);color:var(--ibm-blue-50)">${IC.tag}</span>
          <span style="font-size:12px;font-weight:600;color:var(--ibm-blue-50)">Feature Lifecycle Tracker</span>
          <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(15,98,254,.1);color:var(--ibm-blue-50);border:1px solid rgba(15,98,254,.2);margin-left:auto">${FEATURE_LIFECYCLE.length} features</span>
        </div>
        <div style="padding:0 0 2px">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 2fr;gap:0;padding:6px 14px;background:var(--bg-layer);border-bottom:1px solid var(--border-subtle)">
            ${["Feature","Introduced","Last Modified","Deprecated","Notes"].map(h =>
              `<div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">${h}</div>`
            ).join("")}
          </div>
          ${FEATURE_LIFECYCLE.map(f => `
            <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 2fr;gap:0;padding:6px 14px;border-bottom:1px solid rgba(228,231,237,.5);align-items:start">
              <div style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-primary)">${Utils.escHtml(f.feature)}</div>
              <div style="font-size:var(--font-size-xs);font-family:var(--font-mono);font-weight:600;color:var(--green)">${f.introduced}</div>
              <div style="font-size:var(--font-size-xs);font-family:var(--font-mono);font-weight:600;color:var(--ibm-blue-50)">${f.lastModified}</div>
              <div style="font-size:var(--font-size-xs);font-family:var(--font-mono);font-weight:600;color:${f.deprecated==='—'?'var(--text-disabled)':'var(--chart-5)'}">${f.deprecated}</div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.4">${Utils.escHtml(f.notes)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  /* ── Root Cause Log ────────────────────────────────────── */
  function _renderRootCauseLog() {
    return `
      <div class="tile" style="padding:0;margin-bottom:10px;overflow:hidden">
        <div style="padding:8px 14px;background:rgba(105,41,196,.04);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
          <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:rgba(105,41,196,.12);color:var(--purple)">${IC.info}</span>
          <span style="font-size:12px;font-weight:600;color:var(--purple)">Root Cause Log</span>
          <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:rgba(105,41,196,.1);color:var(--purple);border:1px solid rgba(105,41,196,.2);margin-left:auto">${ROOT_CAUSE_LOG.length} entries</span>
        </div>
        <div style="padding:3px 0">
          ${ROOT_CAUSE_LOG.map(r => {
            const s = SEV_CONFIG[r.severity] || SEV_CONFIG.medium;
            return `<div style="padding:9px 14px;border-bottom:1px solid rgba(228,231,237,.5)">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="font-size:9px;font-weight:600;padding:1px 6px;border-radius:var(--radius-md);background:${s.bg};color:${s.color};border:1px solid ${s.border}">${s.label}</span>
                <span style="font-size:12px;font-weight:600;color:var(--text-primary)">${Utils.escHtml(r.bug)}</span>
                <span style="margin-left:auto;font-size:var(--font-size-xs);font-family:var(--font-mono);font-weight:600;padding:1px 7px;border-radius:var(--radius-sm);background:rgba(25,128,56,.1);color:var(--green);border:1px solid rgba(25,128,56,.2)">Fixed ${r.fixedVersion}</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div style="padding:6px 10px;background:rgba(218,30,40,.04);border:1px solid rgba(218,30,40,.12);border-radius:var(--radius-sm)">
                  <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--red);margin-bottom:3px">Root Cause</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-secondary);line-height:1.5">${Utils.escHtml(r.rootCause)}</div>
                </div>
                <div style="padding:6px 10px;background:rgba(25,128,56,.04);border:1px solid rgba(25,128,56,.12);border-radius:var(--radius-sm)">
                  <div style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--green);margin-bottom:3px">Resolution</div>
                  <div style="font-size:var(--font-size-xs);color:var(--text-secondary);line-height:1.5">${Utils.escHtml(r.resolution)}</div>
                </div>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  /* ── Group by area ─────────────────────────────────────── */
  function _groupByArea(items) {
    const map = {};
    items.forEach(i => {
      const area = i.area || "General";
      if (!map[area]) map[area] = [];
      map[area].push(i);
    });
    return Object.entries(map);
  }

  /* ── Filter items ──────────────────────────────────────── */
  function _filterItems(items, fields) {
    if (_searchQ.length < 2) return items;
    const q  = _searchQ.toLowerCase();
    const fs = fields.split(" ");
    return items.filter(i => fs.some(f => (i[f]||"").toLowerCase().includes(q)));
  }

  /* ── Highlight ─────────────────────────────────────────── */
  function _highlight(text) {
    if (_searchQ.length < 2) return text;
    const escaped = _searchQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'),
      `<mark style="background:rgba(15,98,254,.15);color:var(--ibm-blue-50);border-radius:2px;padding:0 2px">$1</mark>`);
  }

  /* ── Wire events ───────────────────────────────────────── */
  function _wire(el) {
    // Version nav
    el.querySelectorAll(".cl-ver-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        _activeVersion = btn.dataset.ver;
        render();
      });
    });

    // Section filters
    el.querySelectorAll(".cl-sf-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        _activeSection = btn.dataset.sec;
        const detail = document.getElementById("cl-version-detail");
        if (detail) {
          detail.innerHTML = _renderVersionDetail(VERSIONS.find(v => v.version === _activeVersion) || VERSIONS[0]);
          // Scroll to the detail panel so the filtered section is visible
          setTimeout(() => { detail.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
        }
        el.querySelectorAll(".cl-sf-btn").forEach(b => {
          const active = b.dataset.sec === _activeSection;
          b.style.borderColor  = active ? "var(--ibm-blue-50)" : "var(--border-subtle)";
          b.style.background   = active ? "rgba(15,98,254,.1)"  : "transparent";
          b.style.color        = active ? "var(--ibm-blue-50)" : "var(--text-secondary)";
        });
      });
    });

    // Compare selects
    const fromSel = el.querySelector("#cl-compare-from");
    const toSel   = el.querySelector("#cl-compare-to");
    if (fromSel) fromSel.addEventListener("change", e => { _compareFrom = e.target.value; render(); });
    if (toSel)   toSel.addEventListener("change",   e => { _compareTo   = e.target.value; render(); });

    // Search
    let _dbt = null;
    const searchInput = el.querySelector("#cl-search");
    searchInput?.addEventListener("input", e => {
      clearTimeout(_dbt);
      _dbt = setTimeout(() => {
        _searchQ = e.target.value;
        const detail = document.getElementById("cl-version-detail");
        if (detail) {
          detail.innerHTML = _renderVersionDetail(VERSIONS.find(v => v.version === _activeVersion) || VERSIONS[0]);
        }
      }, 200);
    });
  }

  return { render };
})();

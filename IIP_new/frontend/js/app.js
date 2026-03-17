/* ============================================================
   js/app.js — IBM Case Intelligence Platform v2
   Sidebar navigation + KB ingestion pipeline
   ============================================================ */
const App = (() => {

  // On file://, use sessionStorage to avoid the empty-namespace isolation issue.

  // ── Session Persistence & Idle Logout ─────────────────────
  const SESSION_KEY     = "ibm_session_v1";
  const IDLE_MS         = (typeof Config !== "undefined") ? Config.IDLE_TIMEOUT_MS  : 30 * 60 * 1000;
  const IDLE_WARN_MS    = (typeof Config !== "undefined") ? Config.IDLE_WARNING_MS  : 27 * 60 * 1000;
  let   _idleTimer      = null;
  let   _idleWarnTimer  = null;
  let   _warnToast      = null;

  function _saveSession(tabId) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ tab: tabId, ts: Date.now() })); } catch(e) {}
  }

  function _loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // Session valid if within last 30 min (handles normal refresh)
      if (Date.now() - s.ts < 30 * 60 * 1000) return s;
    } catch(e) {}
    return null;
  }

  function _clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch(e) {}
  }

  function _dismissWarnToast() {
    if (_warnToast && _warnToast.parentNode) _warnToast.parentNode.removeChild(_warnToast);
    _warnToast = null;
  }

  function _showIdleWarning() {
    _dismissWarnToast();
    const toast = document.createElement("div");
    toast.id = "idle-warn-toast";
    toast.style.cssText = [
      "position:fixed;bottom:80px;right:20px;z-index:var(--z-modal)",
      "background:var(--yellow-text);color:#fff;padding:12px 16px",
      "border-radius:var(--radius-sm);font-size:var(--font-size-md);font-weight:600",
      "box-shadow:0 4px 16px rgba(0,0,0,0.2)",
      "display:flex;align-items:center;gap:10px;max-width:320px"
    ].join(";");
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
      <span>Session expires in 3 minutes due to inactivity.</span>
      <button onclick="this.parentNode.remove()" class="btn btn-xs" style="background:rgba(255,255,255,.25);color:#fff;border-color:transparent">Dismiss</button>
    `;
    document.body.appendChild(toast);
    _warnToast = toast;
  }

  function _resetIdleTimer() {
    clearTimeout(_idleTimer);
    clearTimeout(_idleWarnTimer);
    _dismissWarnToast();
    _idleWarnTimer = setTimeout(_showIdleWarning, IDLE_WARN_MS);
    _idleTimer     = setTimeout(_idleLogout, IDLE_MS);
  }

  function _idleLogout() {
    _dismissWarnToast();
    _clearSession();
    // Show upload screen again
    const app = document.getElementById("app");
    const upload = document.getElementById("upload-screen");
    if (app) app.classList.add("hidden");
    if (upload) {
      upload.style.display = "";
      // Show idle notice
      const status = document.getElementById("upload-status");
      if (status) {
        status.textContent = "⏱ Session expired due to inactivity. Please reload your file.";
        status.classList.remove("hidden");
        status.style.color = "var(--red)";
      }
    }
    // Reset data
    try { if (typeof Data !== "undefined") Data.loadCases([]); } catch(e) {}
    // Reset admin
    try { if (typeof Admin !== "undefined") Admin.updateHeader(); } catch(e) {}
  }

  function _setupIdleEvents() {
    ["mousemove","keydown","click","scroll","touchstart"].forEach(ev =>
      document.addEventListener(ev, _resetIdleTimer, { passive: true })
    );
    _resetIdleTimer();
  }

  function getDash(tabId) {
    const map = {
      overview:         typeof DashOverview       !=="undefined"?DashOverview       :null,
      team:             typeof DashTeam           !=="undefined"?DashTeam           :null,
      members:          typeof DashMembers        !=="undefined"?DashMembers        :null,
      closed:           typeof DashClosed         !=="undefined"?DashClosed         :null,
      created:          typeof DashCreated        !=="undefined"?DashCreated         :null,
      performance:      typeof DashPerformance    !=="undefined"?DashPerformance    :null,
      customer:         typeof DashCustomer       !=="undefined"?DashCustomer       :null,
      investigate:      typeof DashInvestigate    !=="undefined"?DashInvestigate    :null,
      info:             typeof DashInfo           !=="undefined"?DashInfo           :null,
      admin:            typeof DashAdmin          !=="undefined"?DashAdmin          :null,
      changelog:        typeof DashChangelog      !=="undefined"?DashChangelog      :null,
      "weekly-tracker": typeof DashWeeklyTracker  !=="undefined"?DashWeeklyTracker  :null,
      "rfe-tracking":   typeof DashRFEAdvanced    !=="undefined"?DashRFEAdvanced    :null,
    };
    return map[tabId] || null;
  }

  let _activeTab = "overview";

  async function init() {
    // Load dynamic config from server before anything else
    try { await DynamicConfig.load(); Contacts.refresh(); Data.refreshTeamIndex(); } catch(e) {}
    // Restore admin session if the user had logged in before the refresh
    try {
      if (sessionStorage.getItem("ibm_admin_session_v1") === "1") {
        Data.setAdminMode(true);
      }
    } catch(e) {}
    try { Modal.init(); } catch(e) {}
    try { Admin.init(); } catch(e) {}
    setupUpload();
    setupSidebarNav();
    setupSidebarCollapse();
    setupReload();
    setupGlobalSearch();
    updateKBBadge();
    _setupIdleEvents();

    // ── Restore session on page refresh ──
    const sess = _loadSession();
    if (sess && sess.tab) {
      _pendingSessionTab = sess.tab;
    }

    // ── Auto-restore cases from server on refresh ──
    // Show upload screen immediately as a safe default — eliminates the blank-page
    // window that occurs while async data restore is pending. If _showAppWithRows()
    // finds data it will hide the upload screen itself.
    const _uploadScreenEl = document.getElementById("upload-screen");
    if (_uploadScreenEl) _uploadScreenEl.style.display = "";
    _tryRestoreFromServer();
  }

  let _pendingSessionTab = "overview";

  function updateKBBadge() {
    // KB feature removed — no-op
  }

  /* ── Upload ── */
  function setupUpload() {
    document.getElementById("file-input")?.addEventListener("change", e => { if(e.target.files[0]) loadFile(e.target.files[0]); });
    const dz = document.getElementById("dropzone");
    // F3: Consolidated error helper — uses upload-status (removed upload-file-error)
    const _dzError = (msg) => {
      if(msg) showMsg(msg, "var(--red)");
      else { const el=document.getElementById("upload-status"); if(el) el.classList.add("hidden"); }
    };
    dz?.addEventListener("dragover", e=>{ e.preventDefault(); dz.classList.add("drag-over"); _dzError(""); });
    dz?.addEventListener("dragleave", ()=> dz.classList.remove("drag-over"));
    dz?.addEventListener("drop", e=>{
      e.preventDefault(); dz.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      if(!file) return;
      const ext = file.name.split(".").pop().toLowerCase();
      if(!["csv","xlsx","xls","xlsm"].includes(ext)){
        _dzError(`Unsupported file type ".${ext}". Please upload a CSV, XLSX, XLS, or XLSM file.`);
        return;
      }
      _dzError("");
      loadFile(file);
    });
    // F5: Keyboard accessibility for dropzone
    dz?.addEventListener("keydown", e=>{
      if(e.key==="Enter"||e.key===" "){
        e.preventDefault();
        document.getElementById("file-input")?.click();
      }
    });
  }

  function setupReload() {
    document.getElementById("reload-input")?.addEventListener("change", e=>{ if(e.target.files[0]) loadFile(e.target.files[0], true); });
  }

  function showMsg(msg, color) {
    const el = document.getElementById("upload-status");
    if(el){
      el.innerHTML = Utils.escHtml(msg);
      el.classList.remove("hidden"); el.style.color = color || "";
    }
  }

  // ── Progress bar controller ────────────────────────────────────────────────
  // Stages: 0=Reading, 1=Parsing, 2=Merging, 3=Building, 4=Done
  const _STAGES = ["Reading", "Parsing", "Merging", "Building", "Done"];
  let _progressShown = false;

  function _showProgress(fileName) {
    _progressShown = true;
    const statusEl = document.getElementById("upload-status");
    if (!statusEl) return;

    const shortName = fileName.length > 38 ? fileName.slice(0, 35) + "…" : fileName;
    const stageHtml = _STAGES.map((label, i) => `
      <div class="iip-stage" id="iip-stage-${i}">
        <div class="iip-stage-dot">
          <svg class="iip-check" width="8" height="8" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="iip-stage-dot-inner"></div>
        </div>
        <span class="iip-stage-label">${label}</span>
      </div>`).join("");

    statusEl.innerHTML = `
      <div class="iip-progress-wrap">
        <div class="iip-progress-filename">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          ${Utils.escHtml(shortName)}
        </div>
        <div class="iip-bar-track">
          <div class="iip-bar-fill iip-bar-indeterminate" id="iip-bar-fill" style="width:8%"></div>
        </div>
        <div class="iip-stages">${stageHtml}</div>
      </div>`;

    statusEl.classList.remove("hidden");
    statusEl.style.color = "";
    // Kick off stage 0 as active
    _setStage(0);
  }

  function _setStage(stageIndex) {
    if (!_progressShown) return;
    const pct = [8, 30, 58, 82, 100];
    const bar = document.getElementById("iip-bar-fill");
    if (bar) {
      bar.classList.remove("iip-bar-indeterminate");
      bar.style.width = pct[stageIndex] + "%";
    }
    _STAGES.forEach((_, i) => {
      const el = document.getElementById("iip-stage-" + i);
      if (!el) return;
      el.classList.remove("active", "done");
      if (i < stageIndex)  el.classList.add("done");
      if (i === stageIndex) el.classList.add("active");
    });
  }

  function _finishProgress() {
    _progressShown = false;
    _setStage(4);
    // Mark all done
    _STAGES.forEach((_, i) => {
      const el = document.getElementById("iip-stage-" + i);
      if (el) { el.classList.remove("active"); el.classList.add("done"); }
    });
    const bar = document.getElementById("iip-bar-fill");
    if (bar) { bar.style.width = "100%"; bar.style.background = "linear-gradient(90deg,#198038,#24a148)"; }
  }

  function _hideProgress() {
    _progressShown = false;
    const statusEl = document.getElementById("upload-status");
    if (statusEl) { statusEl.innerHTML = ""; statusEl.classList.add("hidden"); }
  }
  // ── End progress bar controller ────────────────────────────────────────────

  function loadFile(file, isReload=false) {
    _showProgress(file.name);
    const ext = file.name.split(".").pop().toLowerCase();
    if(ext==="xlsm"||ext==="xlsx"||ext==="xls") _loadExcel(file,isReload);
    else _loadCSV(file,isReload);
  }

  // ── Import fingerprint helpers ─────────────────────────────────────────────
  // Stores a sorted list of case numbers from each imported file to detect re-uploads.
  const _IMPORT_LOG_KEY = "ibm_import_log_v1";


  function _loadImportLog() {
    try {
      const raw = localStorage.getItem(_IMPORT_LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  }

  function _saveImportLog(log) {
    const trimmed = log.slice(0, 50);
    try { localStorage.setItem(_IMPORT_LOG_KEY, JSON.stringify(trimmed)); } catch(e) {}
    // Also persist to server for cross-device consistency
    try {
      fetch(_IMPORT_LOG_SAVE_URL(), {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify(trimmed)
      }).catch(() => {});
    } catch(e) {}
  }

  // Loads import log from server first (authoritative), falls back to local storage
  async function _loadImportLogFromServer() {
    try {
      const res = await fetch(_IMPORT_LOG_SAVE_URL());
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().startsWith("[")) {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            try { localStorage.setItem(_IMPORT_LOG_KEY, JSON.stringify(data)); } catch(e) {}
            return data;
          }
        }
      }
    } catch(e) {}
    return _loadImportLog();
  }

  // Builds a stable string fingerprint from a sorted list of case numbers
  function _buildFingerprint(caseNumbers) {
    return [...new Set(caseNumbers)].sort().join("|");
  }

  // Returns true if this exact set of case numbers was already imported before
  async function _isDuplicateImport(caseNumbers) {
    const fp = _buildFingerprint(caseNumbers);
    const log = await _loadImportLogFromServer();
    return log.some(entry => entry.fingerprint === fp);
  }

  // Records the fingerprint so future uploads can detect duplicates
  async function _recordImport(caseNumbers, fileName) {
    const fp = _buildFingerprint(caseNumbers);
    const log = await _loadImportLogFromServer();
    // Avoid re-recording the same fingerprint
    if (log.some(e => e.fingerprint === fp)) return;
    log.unshift({ fingerprint: fp, fileName, importedAt: new Date().toISOString(), count: caseNumbers.length });
    _saveImportLog(log);
  }

  // ── Toast notification (standalone, works before app is shown) ──────────────
  function _importToast(msg, isErr) {
    let t = document.getElementById("app-import-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "app-import-toast";
      t.style.cssText = [
        "position:fixed","bottom:28px","left:50%",
        "transform:translateX(-50%) translateY(12px)",
        "z-index:var(--z-modal)9","padding:11px 22px","border-radius:var(--radius-sm)",
        "font-size:13px","font-weight:500","letter-spacing:0.01em",
        "box-shadow:0 4px 20px rgba(0,0,0,.22)",
        "display:flex","align-items:center","gap:8px",
        "pointer-events:none","opacity:0",
        "transition:opacity var(--transition-base), transform var(--transition-base)",
        "font-family:var(--font-sans,'IBM Plex Sans',sans-serif)",
        "max-width:480px","white-space:normal","text-align:center"
      ].join(";");
      document.body.appendChild(t);
    }
    const bg  = isErr ? "var(--red)" : "var(--ibm-blue-50)";
    const ico = isErr
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    t.style.background = bg; t.style.color = "#fff";
    t.innerHTML = `${ico}<span>${Utils.escHtml(msg)}</span>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)";
    }));
    clearTimeout(t._t);
    t._t = setTimeout(() => {
      t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(12px)";
    }, isErr ? 5000 : 3000);
  }

  // ── Merge incoming rows with any previously stored cases ─────────────────────
  // New rows REPLACE matching case numbers; cases not in new file are RETAINED.
  // Returns a Promise — callers must await to get merged array.
  // ── Filename date parser ─────────────────────────────────────────────────────
  // Extracts YYYY-MM-DD from filenames like "IBM_Support_-_Case_listing_export_-_2026-03-13.csv"
  // Returns a Date object or null if no date found.
  function _parseDateFromFilename(filename) {
    const m = (filename || "").match(/(\d{4}-\d{2}-\d{2})/);
    if (!m) return null;
    const d = new Date(m[1]);
    return isNaN(d.getTime()) ? null : d;
  }

  // ── Get the latest file date from the import log ──────────────────────────
  function _getLatestImportDate() {
    try {
      const log = _loadImportLog();
      if (!log.length) return null;
      let latest = null;
      log.forEach(entry => {
        const d = _parseDateFromFilename(entry.fileName || "");
        if (d && (!latest || d > latest)) latest = d;
      });
      return latest;
    } catch(e) { return null; }
  }

  // ── Determine if an uploaded file is historical (older than latest seen) ───
  function _isHistoricalFile(filename) {
    const fileDate = _parseDateFromFilename(filename);
    if (!fileDate) return false;             // no date in name → treat as latest
    const latestDate = _getLatestImportDate();
    if (!latestDate) return false;           // nothing uploaded yet → it IS the latest
    // Strictly older means it's historical
    return fileDate < latestDate;
  }

  // ── Smart merge: upsert new rows into stored rows by Case Number ───────────
  // Latest file: update existing cases (full row replacement), insert new ones,
  // keep cases not present in new file (retain forever).
  async function _mergeWithStored(newRows) {
    // The latest file is the authoritative source of truth.
    // Logic:
    //   - New file has the case → use the new file's data (update)
    //   - New file is missing the case → drop it (new file wins)
    //   - New file has a case not seen before → insert it
    // Result: the merged table exactly mirrors the new file's case list,
    // with no ghost records from older uploads.
    try {
      const stored = await IIPStore.getCases();
      if (!stored || !stored.length) return newRows;

      // Build lookup of stored rows by Case Number (to preserve admin
      // overrides / extra fields that IBM's export doesn't include)
      const storedByCase = {};
      stored.forEach(r => {
        const cn = r["Case Number"];
        if (cn) storedByCase[cn] = r;
      });

      // For each row in the new file: take the new data as base,
      // but preserve any _ownerOverride / _hasOverride flags from stored row
      return newRows.map(r => {
        const cn = r["Case Number"];
        const prev = cn ? storedByCase[cn] : null;
        if (!prev) return r; // brand-new case
        // Carry forward admin override flags so Data._applyPersisted still works
        const carry = {};
        if (prev._ownerOverride) { carry._ownerOverride = true; carry.Owner = prev.Owner; }
        if (prev._hasOverride)   carry._hasOverride = true;
        return Object.keys(carry).length ? { ...r, ...carry } : r;
      });
    } catch(e) {
      console.warn("[IIP] _mergeWithStored error:", e);
      return newRows;
    }
  }

  // ── Ingest a historical file into Weekly Tracker only ────────────────────
  // Takes closed cases from the file, slots them by Closed Date → CW,
  // and merges into localStorage tracker data. Does NOT touch main cases table.
  function _ingestHistoricalIntoTracker(rows, fileName) {
    const CLOSED_STATUSES = ["Closed by IBM", "Closed by Client", "Closed - Archived"];
    const STORE_PREFIX = "ibm_wtracker_";

    const _ldy = yr => { try { return JSON.parse(localStorage.getItem(STORE_PREFIX + yr) || "{}"); } catch(e) { return {}; } };
    const _svy = (yr, d) => { try { localStorage.setItem(STORE_PREFIX + yr, JSON.stringify(d)); } catch(e) {} };
    const _isoWeek = d => {
      const yr = d.getFullYear();
      const jan1 = new Date(yr, 0, 1);
      const jan1Day = jan1.getDay();
      const w1Sun = new Date(jan1);
      w1Sun.setDate(jan1.getDate() - jan1Day);
      const target = new Date(yr, d.getMonth(), d.getDate());
      if (target < w1Sun) return _isoWeek(new Date(yr - 1, 11, 31));
      const wk = Math.floor((target - w1Sun) / (7 * 86400000)) + 1;
      return "CW" + String(wk).padStart(2, "0");
    };

    let inserted = 0;
    let skipped  = 0;

    rows.forEach(r => {
      const status = r.Status || "";
      if (!CLOSED_STATUSES.some(s => status.includes(s))) return;

      const closedRaw = r["Closed Date"] || r.ClosedDate || r["Solution date"] || "";
      if (!closedRaw) return;
      const closedDate = new Date(closedRaw);
      if (isNaN(closedDate.getTime())) return;

      const year = closedDate.getFullYear();
      const cwKey = _isoWeek(closedDate);
      const cn = r["Case Number"] || "";
      if (!cn) return;

      const yearData = _ldy(year);
      if (!yearData[cwKey]) yearData[cwKey] = [];

      // Skip if already in tracker (dedup by caseNumber)
      const alreadyExists = yearData[cwKey].some(e => e.caseNumber === cn);
      if (alreadyExists) { skipped++; return; }

      yearData[cwKey].push({
        id:             cn + "_" + cwKey,
        caseNumber:     cn,
        owner:          r.Owner || "",
        title:          r.Title || "",
        product:        r.Product || "",
        severity:       String(r.Severity || ""),
        status:         status,
        age:            r.Age || "",
        closedDate:     closedRaw,
        comments:       "",
        category:       "",
        customerNumber: r["Customer number"] || "",
        created:        r.Created || "",
        solutionDate:   r["Solution date"] || "",
        _fromHistorical: true,
      });

      // Keep CW sorted by case number for consistency
      yearData[cwKey].sort((a, b) => a.caseNumber.localeCompare(b.caseNumber));
      _svy(year, yearData);
      inserted++;
    });

    return { inserted, skipped };
  }

  function _loadCSV(file, isReload) {
    const r = new FileReader();
    r.onerror = () => { _hideProgress(); showMsg("Failed to read file", "var(--red)"); };
    r.onload = async ev => {
      try {
        _setStage(1); // Parsing
        const rows = Utils.parseCSV(ev.target.result);
        if(!rows.length){ _hideProgress(); showMsg("No data found","var(--red)"); return; }
        const caseNums = rows.map(r => r["Case Number"]).filter(Boolean);

        // ── Determine if this file is historical ─────────────────────────────
        const _isHistorical = _isHistoricalFile(file.name);

        if (_isHistorical) {
          // ── HISTORICAL FILE: only update Weekly Tracker, skip main table ──
          _setStage(2); // Merging (tracker only)
          const { inserted, skipped } = _ingestHistoricalIntoTracker(rows, file.name);
          await _recordImport(caseNums, file.name);
          _setStage(3); // Building
          _hideProgress();
          _importToast(
            `📅 Historical file detected — ${inserted} closed case${inserted !== 1 ? "s" : ""} added to Weekly Tracker` +
            (skipped > 0 ? `, ${skipped} already existed` : "") + ".",
            false
          );
          // Refresh tracker view if visible
          setTimeout(() => {
            try { if (typeof DashWeeklyTracker !== "undefined") DashWeeklyTracker.render(); } catch(e) {}
          }, 300);
          return;
        }

        // ── LATEST FILE: merge into main table (upsert by Case Number) ───────
        _setStage(2); // Merging
        const merged = await _mergeWithStored(rows);
        await _recordImport(caseNums, file.name);
        _setStage(3); // Building
        Data.loadCases(merged).then(() => _onLoaded(merged, isReload)).catch(() => _onLoaded(merged, isReload));
      } catch(e){ _hideProgress(); showMsg("CSV error: "+e.message,"var(--red)"); }
    };
    r.readAsText(file);
  }

  // ── Weekly Closed Cases XLSM detection ────────────────────────────────────
  // Returns true if the workbook looks like a "Weekly_Closed_Cases" file:
  //   - At least 3 sheet names match /^CW\d{2}/i
  //   - At least one of those sheets has a "Comments" or "Category" column
  function _isWeeklyClosedCasesXlsm(wb) {
    const cwSheets = wb.SheetNames.filter(n => /^CW\d{2}/i.test(n.trim()));
    if (cwSheets.length < 3) return false;
    for (const sheetName of cwSheets.slice(0, 3)) {
      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "", header: 1 });
      if (!json.length) continue;
      const headerRow = json[0].map(h => String(h || "").toLowerCase().trim());
      if (headerRow.some(h => h === "comments" || h === "comment" || h === "category")) return true;
    }
    return false;
  }

  // ── Populate Weekly Tracker from Weekly_Closed_Cases XLSM ──────────────────
  // Reads all CW sheets, builds tracker rows (preserving Comments + Category),
  // merges them into localStorage, and returns a commentMap for server sync.
  // Q3: only non-empty comments are collected — blank cells leave existing untouched.
  function _extractWeeklyTrackerRows(wb) {
    const _cnPat = (typeof DynamicConfig !== "undefined") ? DynamicConfig.caseNumberPattern() : /^TS\d{8,}/i;
    const STORE_PREFIX = "ibm_wtracker_";
    const _ldy = yr => { try { return JSON.parse(localStorage.getItem(STORE_PREFIX + yr) || "{}"); } catch(e) { return {}; } };
    const _svy = (yr, d) => { try { localStorage.setItem(STORE_PREFIX + yr, JSON.stringify(d)); } catch(e) {} };

    const trackerByYearWeek = {};
    const commentMap = {};
    let totalImported = 0;

    wb.SheetNames.forEach(sheetName => {
      const cwMatch = sheetName.trim().match(/^(CW\d{2})/i);
      if (!cwMatch) return;
      const cwKey = cwMatch[1].toUpperCase();

      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
      if (!json.length) return;

      json.forEach(raw => {
        const out = {};
        Object.keys(raw).forEach(k => { out[k.trim()] = String(raw[k] ?? "").trim(); });

        const norm = {};
        Object.keys(out).forEach(k => { norm[k.toLowerCase().replace(/[^a-z0-9]/g, "")] = out[k]; });

        let cn    = norm["casenumber"] || norm["caseno"] || "";
        let owner = norm["caseowner"]  || norm["owner"]  || "";

        // Handle 2025 column swap
        if (!_cnPat.test(cn) && _cnPat.test(owner)) { const tmp = owner; owner = cn; cn = tmp; }
        if (!cn || !_cnPat.test(cn)) return;

        const comments = norm["comments"] || norm["comment"] || norm["update"] || "";
        const category = norm["category"] || "";
        const closedRaw = norm["closeddate"] || norm["closed"] || "";

        let year = new Date().getFullYear();
        if (closedRaw) { const d = new Date(closedRaw); if (!isNaN(d)) year = d.getFullYear(); }

        const yKey = year + "_" + cwKey;
        if (!trackerByYearWeek[yKey]) trackerByYearWeek[yKey] = { year, cwKey, rows: [] };

        if (!trackerByYearWeek[yKey].rows.some(r => r.caseNumber === cn)) {
          trackerByYearWeek[yKey].rows.push({
            id: cn + "_" + cwKey,
            caseNumber: cn, owner,
            title:    norm["title"]    || "",
            product:  norm["product"]  || "",
            severity: norm["severity"] || "",
            status:   norm["status"]   || "",
            age:      norm["age"]      || "",
            closedDate: closedRaw,
            comments: "",   // comments live server-side; never in localStorage
            category,
            customerNumber: norm["customernumber"] || "",
            created: "", solutionDate: ""
          });
          totalImported++;
        }

        // Q3: only collect non-empty comments so blank cells never overwrite existing data
        if (comments) commentMap[cn] = comments;
      });
    });

    // Merge into tracker localStorage
    Object.values(trackerByYearWeek).forEach(({ year, cwKey, rows }) => {
      if (!rows.length) return;
      const yearData = _ldy(year);
      const existing = yearData[cwKey] || [];
      const byCase = {};
      existing.forEach(r => { byCase[r.caseNumber] = r; });

      const merged = rows.map(r => {
        const s = byCase[r.caseNumber] || {};
        return { ...r, category: r.category || s.category || "", availability: s.availability || "", comments: "" };
      });
      existing.forEach(s => { if (!merged.find(m => m.caseNumber === s.caseNumber)) merged.push(s); });

      const seen = new Set();
      yearData[cwKey] = merged.filter(r => { if (seen.has(r.caseNumber)) return false; seen.add(r.caseNumber); return true; });
      _svy(year, yearData);
    });

    return { totalImported, commentMap };
  }

  function _loadExcel(file, isReload) {
    if(typeof XLSX==="undefined"){_hideProgress(); showMsg("Excel library not loaded","var(--red)");return;}
    const r = new FileReader();
    r.onerror = () => { _hideProgress(); showMsg("Failed to read file","var(--red)"); };
    r.onload = async ev => {
      try {
        _setStage(1); // Parsing
        const wb = XLSX.read(new Uint8Array(ev.target.result),{type:"array"});

        // ── Q1: Weekly Closed Cases XLSM → also populate the Weekly Tracker ──
        // When the file is a Weekly_Closed_Cases workbook (sheets named CW01…CW53
        // with Comments/Category columns), import it as normal cases AND populate
        // the tracker directly so Comments and Category are preserved from day one.
        if (_isWeeklyClosedCasesXlsm(wb)) {
          const { totalImported, commentMap } = _extractWeeklyTrackerRows(wb);
          if (totalImported > 0) {
            const _cmapLen = Object.keys(commentMap).length;
            setTimeout(async () => {
              try {
                if (typeof DashWeeklyTracker !== "undefined" && DashWeeklyTracker._mergeServerComments) {
                  // Merge non-empty comments to server store.
                  // Q3: blank cells in the Excel are NOT in commentMap, so existing server
                  // comments are never touched — only new / updated values are written.
                  if (_cmapLen > 0) {
                    await DashWeeklyTracker._ensureServerCommentsLoaded();
                    await DashWeeklyTracker._mergeServerComments(commentMap);
                  }
                  DashWeeklyTracker.render();
                }
                _importToast(
                  "✅ Weekly Tracker: " + totalImported + " case" + (totalImported !== 1 ? "s" : "") +
                  " imported" + (_cmapLen > 0 ? ", " + _cmapLen + " comment" + (_cmapLen !== 1 ? "s" : "") + " saved." : "."),
                  false
                );
              } catch(e) { console.warn("Weekly Tracker XLSM population error:", e); }
            }, 650);
          }
        }

        const allRows = [];

        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(ws,{defval:""});
          if(!json.length) return;

          json.forEach(raw => {
            const out = {};
            Object.keys(raw).forEach(k => { out[k.trim()] = String(raw[k]??"").trim(); });

            // Normalize field names
            const row = {};
            Object.keys(out).forEach(k => {
              const kl = k.toLowerCase();
              if(kl==="case number"||kl==="casenumber") row["Case Number"]=out[k];
              else if(kl==="case owner"||kl==="caseowner") row["Owner"]=out[k];
              else if(kl==="title") row["Title"]=out[k];
              else if(kl==="product") row["Product"]=out[k];
              else if(kl==="severity") row["Severity"]=out[k];
              else if(kl==="status") row["Status"]=out[k];
              else if(kl==="age") row["Age"]=out[k];
              else if(kl==="closed date"||kl==="closeddate") row["Closed Date"]=out[k];
              else if(kl==="comments"||kl==="comment") row["Comments"]=out[k];
              else if(kl==="customer number"||kl==="customer no") row["Customer number"]=out[k];
              else if(kl==="category") row["Category"]=out[k];
              else row[k]=out[k];
            });

            // Fix 2025 column swap (Case Owner / Case Number reversed)
            const _swapPat=(typeof DynamicConfig!=="undefined")?DynamicConfig.caseNumberPattern():/^TS\d{8,}/i;
            if(row["Owner"]&&_swapPat.test(row["Owner"])){
              const tmp=row["Owner"]; row["Owner"]=row["Case Number"]||""; row["Case Number"]=tmp;
            }

            const _cnPat = (typeof DynamicConfig!=="undefined") ? DynamicConfig.caseNumberPattern() : /^TS\d{8,}/i;
            if(row["Case Number"]&&_cnPat.test(row["Case Number"])) allRows.push(row);
          });
        });

        if(!allRows.length){ _hideProgress(); showMsg("No valid cases found","var(--red)"); return; }

        // Deduplicate within this file (same case on multiple sheets)
        const seen=new Set(), unique=[];
        allRows.forEach(r=>{ const cn=r["Case Number"]; if(!seen.has(cn)){seen.add(cn);unique.push(r);} });

        const caseNums = unique.map(r => r["Case Number"]).filter(Boolean);

        // ── Determine if this file is historical ─────────────────────────────
        const _isHistorical = _isHistoricalFile(file.name);

        if (_isHistorical) {
          // ── HISTORICAL FILE: only update Weekly Tracker, skip main table ──
          _setStage(2);
          const { inserted, skipped } = _ingestHistoricalIntoTracker(unique, file.name);
          await _recordImport(caseNums, file.name);
          _setStage(3);
          _hideProgress();
          _importToast(
            `📅 Historical file detected — ${inserted} closed case${inserted !== 1 ? "s" : ""} added to Weekly Tracker` +
            (skipped > 0 ? `, ${skipped} already existed` : "") + ".",
            false
          );
          setTimeout(() => {
            try { if (typeof DashWeeklyTracker !== "undefined") DashWeeklyTracker.render(); } catch(e) {}
          }, 300);
          return;
        }

        // ── LATEST FILE: merge into main table (upsert by Case Number) ───────
        _setStage(2); // Merging
        const merged = await _mergeWithStored(unique);
        await _recordImport(caseNums, file.name);

        _setStage(3); // Building
        // FIX: await the loadCases Promise so _applyPersisted() finishes before
        // renderTab()/_renderCharts() fires — prevents chart race condition on first load.
        Data.loadCases(merged).then(() => _onLoaded(merged, isReload)).catch(() => _onLoaded(merged, isReload));
      } catch(e){ _hideProgress(); console.error(e); showMsg("Excel error: "+e.message,"var(--red)"); }
    };
    r.readAsArrayBuffer(file);
  }

  /* ── Post-load pipeline ── */
  function _onLoaded(rows, isReload) {
    // Always re-apply DynamicConfig so Admin Portal settings override any imported Excel data
    try { Contacts.refresh(); Data.refreshTeamIndex(); } catch(e) {}

    // ── Fool-proof Customer Products restore ────────────────────────────
    // The authoritative source of "what the admin saved" is the Audit & Change History
    // (ibm_tracker_persist_v1). If the most recent "Customer Products" history entry
    // disagrees with what DynamicConfig currently holds, restore from history.
    try {
      if (typeof DynamicConfig !== "undefined" && typeof Data !== "undefined") {
        const history = Data.changeHistory();
        const lastProductEntry = history.find(h => h.caseNumber === "CONFIG" && h.field === "Customer Products");
        if (lastProductEntry) {
          // newValue is like "5 products — Prod A, Prod B …" — we stored the full list separately
          // Check if DynamicConfig raw has a savedProductList (written by save handler below)
          const raw = DynamicConfig.getRaw();
          const dcCount = Array.isArray(raw.customerProducts) ? raw.customerProducts.length : 0;
          // The history newValue format is: "<N> products"
          const histCount = parseInt((lastProductEntry.newValue || "").match(/^(\d+)/)?.[1] || "0", 10);
          if (histCount > 0 && dcCount !== histCount && Array.isArray(raw._savedProductList) && raw._savedProductList.length === histCount) {
            // DynamicConfig has wrong count — restore the saved list silently
            DynamicConfig.save({ customerProducts: raw._savedProductList }).catch(() => {});
          }
        }
      }
    } catch(e) {}
    // ── End fool-proof restore ───────────────────────────────────────────
    // Heal any stale owner names in Weekly Tracker localStorage using current DC name aliases
    try {
      if (typeof DashWeeklyTracker !== "undefined" && typeof DynamicConfig !== "undefined") {
        const aliases = DynamicConfig.nameAliases ? DynamicConfig.nameAliases() : {};
        // Build a renameMap from aliases: only entries where the key != the value (real renames)
        const renameMap = {};
        Object.entries(aliases).forEach(([k, v]) => {
          // Capitalise key to match stored owner format
          const storedKey = k.replace(/\b\w/g, c => c.toUpperCase());
          if (storedKey !== v) renameMap[storedKey] = v;
        });
        if (Object.keys(renameMap).length) DashWeeklyTracker.renameInTracker(renameMap);
      }
    } catch(e) {}
    if(!isReload) { _finishProgress(); setTimeout(() => showApp(), 350); }
    else { updateHeader(); renderActive(); }
    // Save cases to server so refresh restores them
    _saveCasesToServer(rows);
    // Enrich weekly tracker with closed cases by week
    setTimeout(() => {
      try { if(typeof DashWeeklyTracker!=="undefined") DashWeeklyTracker.enrichFromCases(rows); } catch(e) {}
    }, 400);
    // (KB ingestion removed)
  }

  function _saveCasesToServer(rows) {
    // IIPStore handles both localStorage (file://) and server (http://) automatically
    try { IIPStore.setCases(rows); } catch(e) {}
    // Also keep sessionStorage for same-tab instant restores
    try { sessionStorage.setItem("ibm_cases_raw_v1", JSON.stringify(rows)); } catch(e) {}
    // Archive cases permanently for Investigation page
    try { if (typeof DashInvestigate !== 'undefined') DashInvestigate.archiveCases(rows); } catch(e) {}
  }

  function _showAppWithRows(rows) {
    // Re-apply DC config (contacts, team index)
    try { Contacts.refresh(); Data.refreshTeamIndex(); } catch(e) {}

    // Heal stale owner names in Weekly Tracker localStorage using current DC name aliases.
    // This runs on EVERY restore (refresh, session restore) so stale names are always fixed.
    try {
      if (typeof DashWeeklyTracker !== "undefined" && typeof DynamicConfig !== "undefined") {
        const aliases = DynamicConfig.nameAliases ? DynamicConfig.nameAliases() : {};
        const renameMap = {};
        Object.entries(aliases).forEach(([k, v]) => {
          const storedKey = k.replace(/\b\w/g, c => c.toUpperCase());
          if (storedKey !== v) renameMap[storedKey] = v;
        });
        if (Object.keys(renameMap).length) DashWeeklyTracker.renameInTracker(renameMap);
      }
    } catch(e) {}

    Data.loadCases(rows).then(() => {
      const upload = document.getElementById("upload-screen");
      const app    = document.getElementById("app");
      if (upload) upload.style.display = "none";
      if (app)    app.classList.remove("hidden");
      updateHeader();
      _updateSidebarStats();
      renderTab(_pendingSessionTab || "overview");
      _resetIdleTimer();
      updateKBBadge();
      window._iipAppReady = true; // unblock hash-router initial navigation
      // Enrich tracker with closed cases from the restored data (corrects CSV-sourced owners)
      setTimeout(() => {
        try { if (typeof DashWeeklyTracker !== "undefined") DashWeeklyTracker.enrichFromCases(rows); } catch(e) {}
      }, 400);
    }).catch(err => {
      console.error("[App] _showAppWithRows loadCases failed:", err);
      // Still show the app — charts may render with defaults
      const upload = document.getElementById("upload-screen");
      const app    = document.getElementById("app");
      if (upload) upload.style.display = "none";
      if (app)    app.classList.remove("hidden");
      updateHeader();
      renderTab(_pendingSessionTab || "overview");
      window._iipAppReady = true; // unblock hash-router even on error path
    });
  }

  async function _tryRestoreFromServer() {
    // 1. sessionStorage — fastest, same tab
    try {
      const raw = sessionStorage.getItem("ibm_cases_raw_v1");
      if (raw) {
        const rows = JSON.parse(raw);
        if (Array.isArray(rows) && rows.length > 0) {
          _showAppWithRows(rows);
          return true;
        }
      }
    } catch(e) {}

    // 2. IIPStore.getCases() — works in BOTH file:// (localStorage) and http:// (server)
    //    This is the key fix: previously only tried save.php which fails in file:// mode
    let storedRows = null;
    try {
      storedRows = await IIPStore.getCases();
    } catch(e) { console.warn('[IIP] IIPStore.getCases failed:', e); }

    if (storedRows && storedRows.length > 0) {
      // Apply any admin overrides saved on top of raw CSV
      try {
        const overrides = await IIPStore.getOverrides();
        if (overrides && Object.keys(overrides).length) {
          storedRows = storedRows.map(c => {
            const ov = overrides[c["Case Number"]];
            return ov ? { ...c, ...ov, _hasOverride: true } : c;
          });
        }
      } catch(e) {}
      // Cache in sessionStorage for fast same-tab restores
      try { sessionStorage.setItem("ibm_cases_raw_v1", JSON.stringify(storedRows)); } catch(e) {}
      _showAppWithRows(storedRows);
      return true;
    }

    // 3. Nothing found — show upload screen
    const uploadScreen = document.getElementById("upload-screen");
    if (uploadScreen) uploadScreen.style.display = "";
    const t = document.getElementById("app-import-toast");
    if (t) { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(12px)"; }
    // No data — still unblock the router so it doesn't poll forever.
    window._iipAppReady = true;
    return false;
  }




  function _ingestKB() { /* KB feature removed */ }

  /* ══════════════════════════════════════════════════════════
     SHOW APP — transition from upload screen to dashboard
     ════════════════════════════════════════════════════════ */
  function showApp() {
    const upload = document.getElementById("upload-screen");
    const app    = document.getElementById("app");
    if (upload) upload.style.display = "none";
    if (app)    app.classList.remove("hidden");
    updateHeader();
    _updateSidebarStats();
    renderTab(_pendingSessionTab || "overview");
    _resetIdleTimer();
    updateKBBadge();
    // Unblock the hash-router: it polls this flag before firing its initial
    // navigateTo(), preventing it from clicking nav items while the upload
    // screen is still showing (race condition fix).
    window._iipAppReady = true;
  }

  /* ══════════════════════════════════════════════════════════
     TAB RENDERING
     ════════════════════════════════════════════════════════ */
  function renderTab(tabId) {
    if (!tabId) tabId = "overview";

    // Hide all tab pages, show the target
    document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));
    const panel = document.getElementById("tab-" + tabId);
    if (panel) panel.classList.add("active");

    // Update sidebar nav active state + resolve human label from data-label attribute
    let tabLabel = tabId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    document.querySelectorAll(".nav-item[data-tab]").forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle("active", isActive);
      if (isActive && btn.dataset.label) tabLabel = btn.dataset.label;
    });

    // Update page header title + breadcrumb
    const dc  = (typeof DynamicConfig !== "undefined" && DynamicConfig.getRaw) ? DynamicConfig.getRaw() : {};
    const appTitle  = dc.appTitle  || (typeof AppData !== "undefined" ? AppData.config.appTitle  : null) || "IBM Cases";
    const teamName  = dc.teamName  || (typeof AppData !== "undefined" ? AppData.config.teamName  : null) || "BD/TOA-ETS5";
    const titleEl  = document.getElementById("page-title");
    const crumbEl  = document.getElementById("page-breadcrumb");
    if (titleEl) titleEl.textContent = tabLabel;
    if (crumbEl) crumbEl.textContent = `${appTitle} · ${teamName} · ${tabLabel}`;

    // Update browser tab title
    document.title = `${tabLabel} — ${appTitle} v${(typeof AppVersion !== "undefined" ? AppVersion.semver : "8.5.6")}`;

    _activeTab = tabId;
    _saveSession(tabId);

    // Sync URL hash
    try {
      if (typeof IIPRouter !== "undefined") {
        const hash = IIPRouter.tabKeyToHash ? IIPRouter.tabKeyToHash(tabId) : tabId;
        if (IIPRouter.currentHash && IIPRouter.currentHash() !== hash) {
          window.history.replaceState({ hash }, "", window.location.pathname + "#" + hash);
        }
      }
    } catch(e) {}

    // Render the dashboard
    const dash = getDash(tabId);
    if (dash && typeof dash.render === "function") {
      try { dash.render(); } catch(e) { console.warn("[App] renderTab error for", tabId, e); }
    }
  }

  function renderActive() {
    renderTab(_activeTab || "overview");
  }

  /* ══════════════════════════════════════════════════════════
     HEADER / SIDEBAR STATS
     ════════════════════════════════════════════════════════ */
  function updateHeader() {
    // App identity
    refreshAppIdentity();
    // Admin button state
    try { if (typeof Admin !== "undefined") Admin.updateHeader(); } catch(e) {}
  }

  function refreshAppIdentity() {
    const dc = (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;
    const _cfg      = (dc && dc.getRaw) ? dc.getRaw() : {};
    const appTitle  = _cfg.appTitle  || (typeof AppData !== "undefined" ? AppData.config.appTitle  : null) || "IBM Cases";
    const teamName  = _cfg.teamName  || (typeof AppData !== "undefined" ? AppData.config.teamName  : null) || "BD/TOA-ETS5";

    const titleEl = document.getElementById("sidebar-app-title");
    const teamEl  = document.getElementById("sidebar-team-name");
    const uploadTitleEl = document.getElementById("upload-app-title");

    if (titleEl)       titleEl.textContent  = appTitle;
    if (teamEl)        teamEl.textContent   = teamName;
    if (uploadTitleEl) uploadTitleEl.textContent = appTitle;

    // Version badge
    try {
      if (typeof AppVersion !== "undefined") {
        const badge = document.getElementById("upload-ver-badge");
        if (badge) badge.textContent = AppVersion.version;
      }
    } catch(e) {}
  }

  function _updateSidebarStats() {
    const el = document.getElementById("sidebar-stats");
    if (el) el.style.display = "none";
  }

  /* ══════════════════════════════════════════════════════════
     SIDEBAR NAV SETUP
     ════════════════════════════════════════════════════════ */
  function setupSidebarNav() {
    document.querySelectorAll(".nav-item[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (!tab) return;
        // Admin tab requires login check
        if (tab === "admin") {
          try {
            if (typeof Admin !== "undefined" && !Data.isAdmin()) {
              Admin.showLoginModal();
              return;
            }
          } catch(e) {}
        }
        renderTab(tab);
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     SIDEBAR COLLAPSE
     ════════════════════════════════════════════════════════ */
  function setupSidebarCollapse() {
    const app          = document.getElementById("app");
    const toggleBtn    = document.getElementById("sidebar-toggle");
    const expandBtn    = document.getElementById("sidebar-expand");
    const mobileToggle = document.getElementById("mobile-sidebar-toggle");
    const backdrop     = document.getElementById("mobile-sidebar-backdrop");

    // Restore saved collapse state
    try {
      if (localStorage.getItem("iip_sidebar_collapsed") === "1") {
        app && app.classList.add("sidebar-collapsed");
      }
    } catch(e) {}

    function _collapse() {
      app && app.classList.add("sidebar-collapsed");
      try { localStorage.setItem("iip_sidebar_collapsed", "1"); } catch(e) {}
    }
    function _expand() {
      app && app.classList.remove("sidebar-collapsed");
      try { localStorage.removeItem("iip_sidebar_collapsed"); } catch(e) {}
    }
    function _toggleMobile() {
      const sidebar = document.getElementById("sidebar");
      const open    = sidebar && sidebar.classList.toggle("mobile-open");
      backdrop && backdrop.classList.toggle("visible", !!open);
    }

    toggleBtn    && toggleBtn.addEventListener("click",    _collapse);
    expandBtn    && expandBtn.addEventListener("click",    _expand);
    mobileToggle && mobileToggle.addEventListener("click", _toggleMobile);
    backdrop     && backdrop.addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar");
      sidebar   && sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("visible");
    });
  }

  /* ══════════════════════════════════════════════════════════
     GLOBAL SEARCH
     ════════════════════════════════════════════════════════ */
  function setupGlobalSearch() {
    const input   = document.getElementById("global-search");
    const results = document.getElementById("global-search-results");
    if (!input || !results) return;

    let _debounce = null;

    input.addEventListener("input", () => {
      clearTimeout(_debounce);
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { results.classList.add("hidden"); return; }
      _debounce = setTimeout(() => _runSearch(q), 150);
    });

    input.addEventListener("keydown", e => {
      if (e.key === "Escape") { input.value = ""; results.classList.add("hidden"); input.blur(); }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const first = results.querySelector(".gs-item");
        if (first) first.focus();
      }
    });

    document.addEventListener("click", e => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.classList.add("hidden");
      }
    });

    results.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); e.target.nextElementSibling?.focus(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); (e.target.previousElementSibling || input).focus(); }
      if (e.key === "Escape")    { results.classList.add("hidden"); input.focus(); }
    });

    function _runSearch(q) {
      try {
        const cases = Data.teamCases().filter(r =>
          (r["Case Number"] || "").toLowerCase().includes(q) ||
          (r.Title         || "").toLowerCase().includes(q) ||
          (r.Owner         || "").toLowerCase().includes(q) ||
          (r.Status        || "").toLowerCase().includes(q) ||
          (r.Product       || "").toLowerCase().includes(q)
        ).slice(0, 12);

        if (!cases.length) { results.classList.add("hidden"); return; }

        results.innerHTML = cases.map(r => {
          const cn     = Utils.escHtml(r["Case Number"] || "");
          const title  = Utils.escHtml((r.Title || "").slice(0, 60));
          const status = Utils.escHtml(r.Status || "");
          const closed = Utils.isClosed(r.Status);
          const color  = closed ? "var(--text-tertiary)" : "var(--ibm-blue-50)";
          return `<div class="gs-item" tabindex="0" data-cn="${cn}"
            style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:2px"
            role="option">
            <span style="font-family:var(--font-mono);font-size:12px;font-weight:600;color:${color}">${cn}</span>
            <span style="font-size:12px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</span>
            <span style="font-size:10px;color:var(--text-tertiary)">${status}</span>
          </div>`;
        }).join("");

        results.querySelectorAll(".gs-item").forEach(item => {
          const activate = () => {
            results.classList.add("hidden");
            input.value = "";
            // Drill into team tab filtered to this case
            renderTab("team");
            setTimeout(() => {
              const si = document.getElementById("team-search") || document.querySelector("#tab-team input[type=text]");
              if (si) { si.value = item.dataset.cn; si.dispatchEvent(new Event("input")); }
            }, 150);
          };
          item.addEventListener("click",  activate);
          item.addEventListener("keydown", e => { if (e.key === "Enter") activate(); });
        });

        results.classList.remove("hidden");
      } catch(e) { results.classList.add("hidden"); }
    }
  }

  /* ══════════════════════════════════════════════════════════
     EXTRA PUBLIC METHODS
     ════════════════════════════════════════════════════════ */
  function loadFileExternal(file) {
    if (file) loadFile(file, true);
  }

  function navigate(hash) {
    try {
      if (typeof IIPRouter !== "undefined") IIPRouter.navigate(hash);
      else renderTab(hash);
    } catch(e) { renderTab(hash); }
  }

  function refresh() {
    updateHeader();
    _updateSidebarStats();
    renderActive();
  }

  /* ══════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════ */
  return {
    init,
    renderTab,
    renderActive,
    updateHeader,
    refreshAppIdentity,
    loadFileExternal,
    navigate,
    refresh,
    showApp,
  };
})();

document.addEventListener("DOMContentLoaded",()=>{ App.init().catch(e=>{ console.error("App init:",e); }); });
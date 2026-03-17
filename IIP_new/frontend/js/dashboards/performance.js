/* ============================================================
   js/dashboards/performance.js  —  Performance Cases tab
   ============================================================ */
const DashPerformance = (() => {
  /* ── Loading state helper ─────────────────────────────────────
     Usage: _setLoading(true) before data fetch, _setLoading(false) after.
     Applies .is-loading class to the dashboard root element.
  ────────────────────────────────────────────────────────────── */
  function _setLoading(active) {
    const el = document.getElementById('content-area') || document.body;
    el.classList.toggle('dashboard-loading', active);
    // Show/hide skeleton shimmer on tables
    document.querySelectorAll('.table-wrap, .dash-table').forEach(t => {
      t.classList.toggle('skeleton-loading', active);
    });
  }


  const APPS = ["AM","QM","RM","CCM","DCM","DCC","RS","LQE","IHS","LDX","ATS","MQTT","HAPROXY"];
  const TIERS = ["P","Q","T4"];
  const INSTANCES = [];
  for (let i = 1; i <= 28; i++) {
    const num = String(i).padStart(2,"0");
    TIERS.forEach(tier => {
      INSTANCES.push(`ALM-${num}-${tier}`);
      APPS.forEach(app => INSTANCES.push(`ALM-${num}-${tier} ${app}`));
    });
  }

  const _getDefectBaseUrl = () => {
    const _dc = (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;
    if (_dc && _dc.appConfig) {
      const url = _dc.appConfig().defectBaseUrl;
      if (url) return url;
    }
    return (typeof Config !== "undefined") ? Config.DEFECT_BASE_URL :
      "https://rb-ubk-clm-01.de.bosch.com:9443/ccm/web/projects/CI%20NES%20Change%20Management#action=com.ibm.team.workitem.viewWorkItem&id=";
  };

  /* ── SVG Icon set — single colour (currentColor) ── */
  const IC = {
    edit:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    lock:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
    save:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    export: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
    mail:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    close:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    warning:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    link:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    clear:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    filter: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    perf:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    check:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  };

  // ── Keyword → App mapping for instance auto-detection ──────────────────
  const APP_KEYWORDS = {
    RM:    ["rm","dng","doors ng","requirement","requirements management","rhapsody"],
    QM:    ["qm","quality","test","etm","rqm"],
    CCM:   ["ccm","rtc","change","build","code review","source control","jazz","clm"],
    DCC:   ["dcc","datacl","data cl","data clean","data consistency","database consistency","repotools","repo tools"],
    LQE:   ["lqe","lqe data","link index","lifecycle","data sources"],
    LDX:   ["ldx","link discovery"],
    AM:    ["am","asset","license"],
    DCM:   ["dcm","deploy"],
    IHS:   ["ihs","http server","web server"],
    ATS:   ["ats","adapter","configuration management"],
    MQTT:  ["mqtt"],
    HAPROXY:["haproxy","load bal"],
    RS:    ["rs","report","report builder","report studio","report server"],
  };

  function _guessApp(text) {
    if (!text) return "";
    const lower = text.toLowerCase();
    for (const [app, keywords] of Object.entries(APP_KEYWORDS)) {
      if (keywords.some(kw => lower.includes(kw))) return app;
    }
    return "";
  }

  function extractInstanceFromTitle(title) {
    if (!title) return "";
    const t = title.trim();

    // Pattern: ALM-11-Q, ALM-03-T4, ALM-06-P, ALM-20-Q, etc.
    const almFull = t.match(/ALM[-\s]?(\d{1,2})[-\s]?([A-Za-z]\d*)\b/i);
    if (almFull) {
      const num  = String(parseInt(almFull[1])).padStart(2,"0");
      const tier = almFull[2].toUpperCase();        // P, Q, T4, etc.
      const app  = _guessApp(t);
      return app ? `ALM-${num}-${tier} ${app}` : `ALM-${num}-${tier}`;
    }

    // Pattern: 06-p Missing …, 03-T4 Clone …
    const shortALM = t.match(/^(\d{1,2})[-\s]([A-Za-z]\d*)\b/i);
    if (shortALM) {
      const num  = String(parseInt(shortALM[1])).padStart(2,"0");
      const tier = shortALM[2].toUpperCase();
      const app  = _guessApp(t);
      return app ? `ALM-${num}-${tier} ${app}` : `ALM-${num}-${tier}`;
    }

    // Pattern: [DT445785] ALM-11-Q : …  already handled above
    // Pattern: just a number + keyword mention, no ALM prefix
    const app = _guessApp(t);
    return app ? "" : ""; // no ALM prefix → can't determine instance
  }

  function parseWorkItem(raw) {
    if (!raw || !raw.trim()) return { display: "", url: "", type: "" };
    const s = raw.trim();
    // URL with id= parameter
    const urlMatch = s.match(/[?&#]id=(\d+)/i);
    if (urlMatch) return { display: `Defect ${urlMatch[1]}`, url: _getDefectBaseUrl() + urlMatch[1], type: "defect" };
    // "Task NNNNN" pattern
    const taskMatch = s.match(/^Task\s*(\d+)$/i);
    if (taskMatch) return { display: `Task ${taskMatch[1]}`, url: _getDefectBaseUrl() + taskMatch[1], type: "task" };
    // "Defect NNNNN" pattern
    const defMatch = s.match(/^Defect\s*(\d+)$/i);
    if (defMatch) return { display: `Defect ${defMatch[1]}`, url: _getDefectBaseUrl() + defMatch[1], type: "defect" };
    // Plain number — keep as-is (will be displayed as typed)
    if (/^\d+$/.test(s)) return { display: `Defect ${s}`, url: _getDefectBaseUrl() + s, type: "defect" };
    // Free text
    return { display: s, url: "", type: "" };
  }

  function wiLink(raw) {
    if (!raw || !raw.trim()) return "";
    const { display, url, type } = parseWorkItem(raw);
    if (!url) return `<span class="text-11 text-muted">${Utils.escHtml(display)}</span>`;
    const colour = type === "task" ? "var(--purple)" : "var(--ibm-blue-50)";
    return `<a href="${Utils.escHtml(url)}" target="_blank"
      style="font-size:11px;color:${colour};font-family:var(--font-mono);font-weight:600;
        text-decoration:none;display:inline-flex;align-items:center;gap:4px">
      ${IC.link} ${Utils.escHtml(display)}</a>`;
  }

  let _searchCase   = "";
  let _sortKey      = "slno";
  let _sortDir      = 1;
  let _filterOwner      = "";
  let _showOnlyPerf     = false;
  let _filterNoWorkItem = false;
  let _editMode     = false;

  const _pending = {};

  function render() {
    const el = document.getElementById("tab-performance");
    if (!el) return;

    try {
    const all  = Data.performanceCandidates();
    const meta = Data.performanceMeta();

    // F32: Show empty state when no data has been uploaded yet
    if (!all || all.length === 0) {
      const allCases = typeof Data !== "undefined" ? Data.allCases() : [];
      if (!allCases.length) {
        el.innerHTML = `<div class="tile" >
          <div >📊</div>
          <div >No data yet</div>
          <div >Upload a cases file using the <strong>Re-upload Data</strong> button in the sidebar to see performance metrics.</div>
          <label class="btn btn-primary btn-sm" class="cursor-pointer">
            Upload Cases File <input type="file" id="perf-empty-upload" accept=".csv,.xlsx,.xls,.xlsm" hidden/>
          </label>
        </div>`;
        document.getElementById("perf-empty-upload")?.addEventListener("change", e => {
          if(e.target.files[0]) { try { if(typeof App!=="undefined") App.loadFileExternal(e.target.files[0]); } catch(ex){} }
        });
        return;
      }
    }

    el.innerHTML = `
      <div class="kpi-row" id="perf-kpi-row"></div>

      <div class="tile mt-5">
        <div class="section-title">Owner vs Performance Cases</div>
        <div class="chart-canvas-wrap" style="height:250px"><canvas id="chart-perf-owners"></canvas></div>
      </div>

      <!-- Follow-up alert panel -->
      <div id="perf-followup-panel"></div>

      <div class="tile mt-5">
        <!-- Table header bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${_editMode ? '14px' : '0'};flex-wrap:wrap;gap:10px">
          <div class="section-title" class="mb-0" id="perf-table-title">${_showOnlyPerf ? 'Performance Cases' : '08 Account Cases'}</div>
          <div class="row-wrap-8">
            <button id="perf-edit-toggle" class="btn ${_editMode ? 'btn-success' : 'btn-secondary'} btn-sm"
              title="${_editMode ? 'Click to lock table' : 'Click to enable editing'}">
              ${_editMode ? IC.lock + ' Lock Table' : IC.edit + ' Edit Table'}
            </button>
            ${_editMode ? `<button id="perf-save-all" class="btn btn-primary btn-sm">${IC.save} Save Changes</button>` : ''}
            <button id="perf-export-top" class="btn btn-secondary btn-sm">${IC.export} Export</button>
          </div>
        </div>

        ${_editMode ? `
        <!-- Filter bar (only in edit mode) -->
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">${IC.search} Search</span>
            <input id="perf-search" type="text" class="search-input"
              class="w-220" placeholder="Case number..." value="${Utils.escHtml(_searchCase)}"/>
          </div>
          ${_filterOwner ? `
          <div style="display:flex;align-items:center;gap:6px;padding-bottom:2px">
            <span style="font-size:12px;color:var(--ibm-blue-50);font-weight:500">${IC.filter} ${Utils.escHtml(Utils.shortName(_filterOwner))}</span>
            <button id="perf-clear-filter" class="btn btn-danger btn-xs">${IC.clear}</button>
          </div>` : ''}
          <div style="margin-left:auto;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--green);font-weight:500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Edit mode — changes are staged until saved
          </div>
        </div>

        <!-- Table -->
        <div id="tbl-perf-wrap" class="data-table-wrap">
          <div id="tbl-perf"></div>
        </div>
        ` : `
        <!-- Read-only prompt: table hidden, click a case link to view details -->
        <div style="padding:18px 0 4px;color:var(--text-tertiary);font-size:12px;display:flex;align-items:center;gap:6px">
          ${IC.lock} Table is read-only. Click <strong class="c-secondary">Edit Table</strong> to make changes, or click a <strong class="text-blue-c">Case Number</strong> link below to view details.
        </div>
        <!-- Read-only table (case links active, no inputs) -->
        <div id="tbl-perf-wrap" style="border:1px solid var(--border-subtle);border-radius:var(--radius-md);margin-top:10px">
          <div id="tbl-perf"></div>
        </div>
        `}
      </div>

      <!-- Defect-missing panel -->
      <div id="perf-defect-panel" class="hidden"></div>
    `;

    renderKPIs(all, meta);
    try { drawHistogram(all); } catch(e) { console.warn("[Performance] drawHistogram:", e); }

    document.getElementById("perf-edit-toggle")?.addEventListener("click", () => {
      _editMode = !_editMode;
      render();
    });
    document.getElementById("perf-search")?.addEventListener("input", e => {
      _searchCase = e.target.value.trim();
      renderPerfTable(filteredCases(all));
    });
    document.getElementById("perf-clear-filter")?.addEventListener("click", () => {
      _filterOwner = ""; _showOnlyPerf = false; _filterNoWorkItem = false; render();
    });
    document.getElementById("perf-save-all")?.addEventListener("click", saveAllChanges);
    document.getElementById("perf-export-top")?.addEventListener("click", () => {
      exportPerfTable(filteredCases(all), meta, Data.getPerfCaseNums());
    });

    try { renderPerfTable(filteredCases(all)); } catch(e) {
      console.error("[Performance] renderPerfTable:", e);
      const tb = document.getElementById("tbl-perf");
      if (tb) tb.innerHTML = `<div style="padding:20px;color:var(--red);font-size:13px">⚠ Table render error: ${e.message}</div>`;
    }
    try { renderFollowUpPanel(filteredCases(all), Data.performanceMeta()); } catch(e) { console.warn("[Performance] followUpPanel:", e); }
    } catch(outerErr) {
      console.error("[Performance] render error:", outerErr);
      el.innerHTML = `<div style="padding:40px;color:var(--red);font-family:var(--font-mono);font-size:13px">
        ⚠ Performance tab render error: ${outerErr.message}<br>
        <span class="text-11 text-muted">Check browser console for details.</span>
      </div>`;
    }
  }

  function drawHistogram(all) {
    const meta     = Data.performanceMeta();
    const perfNums = Data.getPerfCaseNums();
    const perfCases = all.filter(r => perfNums.includes(r["Case Number"]));
    const ownerData = Utils.ownerCounts(perfCases);
    ownerData.forEach(od => {
      od.noDefect = perfCases.filter(r => {
        if (r.Owner !== od.fullName) return false;
        const wi = (meta[r["Case Number"]] || {}).workItem || "";
        return !wi.trim();
      }).length;
    });
    try {
      Charts.ownerBar("chart-perf-owners", ownerData, {
        color: "var(--red)", secondaryColor: "#ff9999",
        secondaryKey: "noDefect", secondaryLabel: "No Work Item",
        onClick: (ownerName, datasetIndex) => {
          if (datasetIndex === 1) {
            const sameOwner = _filterOwner === ownerName;
            const alreadyFiltered = sameOwner && _filterNoWorkItem;
            _filterOwner      = alreadyFiltered ? "" : ownerName;
            _showOnlyPerf     = !alreadyFiltered;
            _filterNoWorkItem = !alreadyFiltered;
          } else {
            _filterNoWorkItem = false;
            _filterOwner = (_filterOwner === ownerName) ? "" : ownerName;
            _showOnlyPerf = !!_filterOwner;
          }
          render();
          setTimeout(() => {
            document.getElementById("tbl-perf")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 80);
        }
      });
    } catch(e) { console.warn("perf histogram:", e); }
  }

  function filteredCases(all) {
    const perfNums = new Set(Data.getPerfCaseNums());
    const nonPNums = new Set(Data.getNonPerfCaseNums());
    const meta     = Data.performanceMeta();
    return all.filter(r => {
      if (_filterOwner && r.Owner !== _filterOwner) return false;
      if (_searchCase  && !r["Case Number"].toLowerCase().includes(_searchCase.toLowerCase())) return false;
      if (_filterNoWorkItem) {
        const wi = ((meta[r["Case Number"]] || {}).workItem || "").trim();
        if (wi) return false;
      }
      if (_showOnlyPerf) {
        const cn = r["Case Number"];
        if (nonPNums.has(cn)) return false;
        if (!perfNums.has(cn)) return false; // only use perfNums — meta category is cleared on remove
      }
      return true;
    });
  }

  function renderKPIs(all, meta) {
    const row = document.getElementById("perf-kpi-row");
    if (!row) return;
    const perfNums    = new Set(Data.getPerfCaseNums());
    const nonPerfNums = new Set(Data.getNonPerfCaseNums());
    const perf = all.filter(r => {
      const cn = r["Case Number"];
      if (nonPerfNums.has(cn)) return false;
      return perfNums.has(cn); // only use perfNums — meta category is cleared on remove
    });
    const defectsNotRaised = all.filter(r => !((meta[r["Case Number"]] || {}).workItem || "").trim());
    const awaitingFb = all.filter(r => r.Status === "Awaiting your feedback");
    const inProgress = all.filter(r => r.Status === "IBM is working" || r.Status === "Waiting for IBM");

    // F31: Compute closure rate vs 80% SLA target
    const closedInTarget = all.filter(r => {
      if (!Utils.isClosed(r.Status)) return false;
      const age = parseInt(r.Age || "0");
      return age > 0 && age <= 30; // closed within 30 days = on-target
    });
    const slaTarget = 80;
    const slaPct = all.length > 0 ? Math.round(closedInTarget.length / all.length * 100) : 0;
    const slaLabel = slaPct >= slaTarget
      ? `<span style="color:var(--green);font-size:11px">▲ Above target (${slaTarget}%)</span>`
      : `<span style="color:var(--red);font-size:11px">▼ Below target (${slaTarget}%)</span>`;

    row.innerHTML = [
      kpi("Total Cases",       all.length,              ""),
      kpi("Performance",        perf.length,             "kpi-red"),
      kpi("Non-Performance",    all.length - perf.length,"kpi-green"),
      kpi("Awaiting Feedback",  awaitingFb.length,       "kpi-yellow"),
      kpi("In Progress",        inProgress.length,       "kpi-blue"),
      kpi("Work Items Missing", defectsNotRaised.length, "kpi-purple", "perf-kpi-defect", "Click to review"),
      // F31: SLA closure rate KPI with target label
      `<div class="kpi-card kpi-blue"><div class="kpi-label">Closure Rate (≤30d)</div><div class="kpi-value">${slaPct}%</div><div style="margin-top:4px">${slaLabel}</div></div>`,
    ].join("");

    document.getElementById("perf-kpi-defect")?.addEventListener("click", () => {
      showDefectMissingPanel(defectsNotRaised);
    });
  }

  function showDefectMissingPanel(cases) {
    const panel = document.getElementById("perf-defect-panel");
    if (!panel) return;
    panel.classList.remove("hidden");
    if (!cases.length) {
      panel.innerHTML = `<div class="tile mt-5" style="border-left:4px solid var(--green)">
        <div class="section-title">${IC.check} All Cases Have Work Items Raised</div>
      </div>`;
      return;
    }
    const rows = cases.map((r,i) => `<tr>
      <td class="text-muted" class="fs-12">${i+1}</td>
      <td class="col-case-num">${Utils.escHtml(r["Case Number"])}</td>
      <td class="col-owner">${Utils.escHtml(Utils.shortName(r.Owner))}</td>
      <td>${Utils.statusBadge(r.Status)}</td>
      <td class="col-title" title="${Utils.escHtml(r.Title)}">${Utils.escHtml(r.Title)}</td>
      <td class="col-date">${Utils.fmtDateShort(r.Created)}</td>
    </tr>`).join("");

    panel.innerHTML = `
      <div class="tile mt-5" style="border-left:4px solid var(--purple)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
          <div class="section-title" style="margin:0;color:var(--purple)">
            ${IC.warning} ${cases.length} Cases — Work Item Not Raised
          </div>
          <div class="d-flex gap-8">
            <button id="perf-defect-mail" class="btn btn-primary btn-sm">${IC.mail} Send Reminder</button>
            <button id="perf-defect-close" class="btn btn-ghost btn-sm">${IC.close} Close</button>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>#</th><th>Case Number</th><th>Owner</th><th>Status</th><th>Title</th><th>Created</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;

    document.getElementById("perf-defect-mail")?.addEventListener("click", () => {
      Mail.openDefectReminder(cases, "Kabelesh K");
    });
    document.getElementById("perf-defect-close")?.addEventListener("click", () => {
      panel.classList.add("hidden");
    });
    panel.scrollIntoView({ behavior: "smooth" });
  }

  function instanceInput(caseNum, selected, title) {
    const autoSuggest = selected || extractInstanceFromTitle(title);
    return `
      <div class="ci-combo" data-case="${Utils.escHtml(caseNum)}" style="width:170px">
        <input type="text"
          class="ci-combo-input perf-instance-inp" data-case="${Utils.escHtml(caseNum)}"
          value="${Utils.escHtml(autoSuggest)}" placeholder="Search instance..."
          autocomplete="off" spellcheck="false"/>
        <span class="ci-combo-chev">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>`;
  }

  function getPending(caseNum, field, fallback) {
    return (_pending[caseNum] && _pending[caseNum][field] !== undefined)
      ? _pending[caseNum][field] : fallback;
  }

  function saveAllChanges() {
    const all = Data.performanceCandidates();
    let count = 0;
    all.forEach(row => {
      const caseNum = row["Case Number"];
      if (!_pending[caseNum]) return;
      const p = _pending[caseNum];
      const patch = {};
      if (p.instance  !== undefined) patch.instance  = p.instance;
      if (p.workItem  !== undefined) patch.workItem   = p.workItem;
      if (p.category  !== undefined) {
        patch.category = p.category;
        if (p.category === "performance") Data.addPerfCaseNum(caseNum);
        else Data.removePerfCaseNum(caseNum);
      }
      if (Object.keys(patch).length) {
        Data.setPerformanceMeta(caseNum, patch);
        Data.pushChange({
          id: Date.now() + Math.random(), caseNumber: caseNum,
          field: "Performance Meta", oldValue: "previous",
          newValue: JSON.stringify(patch), updatedBy: "User",
          timestamp: new Date().toLocaleString()
        });
        count++;
        delete _pending[caseNum];
      }
    });

    // Visual feedback on save button
    const btn = document.getElementById("perf-save-all");
    if (btn) {
      btn.innerHTML = IC.check + ` Saved ${count} row${count !== 1 ? 's' : ''}`;
      btn.style.background = "var(--green)";
      btn.style.borderColor = "var(--green)";
      setTimeout(() => {
        _editMode = false;
        render();
      }, 1200);
    }
    renderKPIs(Data.performanceCandidates(), Data.performanceMeta());
    drawHistogram(Data.performanceCandidates());
  }

  function sortedCases(cases) {
    const meta     = Data.performanceMeta();
    const perfNums = Data.getPerfCaseNums();
    return [...cases].sort((a, b) => {
      let av, bv;
      if (_sortKey === "slno")     return 0;
      if (_sortKey === "owner")    { av = Utils.shortName(a.Owner); bv = Utils.shortName(b.Owner); }
      if (_sortKey === "casenum")  { av = a["Case Number"]; bv = b["Case Number"]; }
      if (_sortKey === "issue")    { av = a.Title; bv = b.Title; }
      if (_sortKey === "status")   { av = a.Status; bv = b.Status; }
      if (_sortKey === "created")  { av = a.Created; bv = b.Created; }
      if (_sortKey === "category") {
        av = getPending(a["Case Number"], "category", (meta[a["Case Number"]]||{}).category || "non-performance");
        bv = getPending(b["Case Number"], "category", (meta[b["Case Number"]]||{}).category || "non-performance");
      }
      if (_sortKey === "instance") {
        av = getPending(a["Case Number"], "instance", (meta[a["Case Number"]]||{}).instance||extractInstanceFromTitle(a.Title));
        bv = getPending(b["Case Number"], "instance", (meta[b["Case Number"]]||{}).instance||extractInstanceFromTitle(b.Title));
      }
      if (_sortKey === "workitem") {
        av = getPending(a["Case Number"], "workItem", (meta[a["Case Number"]]||{}).workItem||"");
        bv = getPending(b["Case Number"], "workItem", (meta[b["Case Number"]]||{}).workItem||"");
      }
      av = av || ""; bv = bv || "";
      return String(av).localeCompare(String(bv)) * _sortDir;
    });
  }

  function renderPerfTable(cases) {
    const container = document.getElementById("tbl-perf");
    if (!container) return;

    const isAdmin  = Data.isAdmin();
    const meta     = Data.performanceMeta();
    const perfNums = Data.getPerfCaseNums();
    const sorted   = sortedCases(cases);
    const editable = _editMode;

    function thSort(key, label) {
      const isCur = _sortKey === key;
      const arrow = isCur ? (_sortDir === 1 ? " ↑" : " ↓") : "";
      return `<th class="sort-th" data-sort="${key}">${label}${arrow}</th>`;
    }

    // Column count depends on admin + editable
    const colCount = (_showOnlyPerf ? 10 : 9) + (isAdmin && editable ? 1 : 0);

    let html = `
      <div class="data-table-wrap">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr>
              <th style="width:36px">#</th>
              ${thSort("instance", "Instance")}
              ${thSort("workitem",  "Work Item")}
              ${thSort("owner",    "Case Owner")}
              ${thSort("casenum", "Case Number")}
              ${thSort("issue",    "Issue")}
              ${thSort("status",   "Status")}
              ${_showOnlyPerf ? "<th>Availability</th>" : ""}
              ${thSort("created",  "Created")}
              ${thSort("category", "Category")}
              ${isAdmin && editable ? "<th>Actions</th>" : ""}
            </tr></thead>
            <tbody>`;

    if (!sorted.length) {
      html += `<tr><td colspan="${colCount}" class="table-empty">No cases match current filters.</td></tr>`;
    } else {
      sorted.forEach((row, i) => {
        const m             = meta[row["Case Number"]] || {};
        const isInPerfNums  = perfNums.includes(row["Case Number"]);
        const isInNonPerf   = Data.getNonPerfCaseNums().includes(row["Case Number"]);
        const pendingCat    = (_pending[row["Case Number"]] || {}).category;
        const isPerf = pendingCat === "performance"
          || (pendingCat === undefined && !isInNonPerf
              && (m.category === "performance" || isInPerfNums));

        const catBadge = isPerf
          ? `<span class="tag tag-perf">${IC.perf} Performance</span>`
          : `<span class="tag tag-nonperf">${IC.check} Non-Perf</span>`;

        const savedInst = getPending(row["Case Number"], "instance", m.instance || "");
        const autoInst  = savedInst || extractInstanceFromTitle(row.Title);
        const wiVal     = getPending(row["Case Number"], "workItem", m.workItem || "");
        const hasDefect = wiVal && wiVal.trim();

        html += `<tr data-case="${Utils.escHtml(row["Case Number"])}"
          class="${!editable ? '' : ''}"
          style="${!editable ? '' : ''}">`;

        html += `<td class="text-muted" class="fs-12">${i + 1}</td>`;

        // Instance column — editable only in edit mode
        if (editable) {
          html += `<td style="min-width:185px">${instanceInput(row["Case Number"], savedInst, row.Title)}</td>`;
        } else {
          html += `<td class="fs-12-sec">${Utils.escHtml(autoInst || "—")}</td>`;
        }

        // Work Item column
        html += `<td style="min-width:150px">`;
        if (editable) {
          html += `<input type="text" class="form-input perf-workitem-inp" data-case="${Utils.escHtml(row["Case Number"])}"
            value="${Utils.escHtml(wiVal)}" placeholder="Defect / Task # or URL"
            style="width:140px;font-size:11px;padding:3px 8px"/>`;
        }
        html += `<div class="wi-link-wrap" data-case="${Utils.escHtml(row["Case Number"])}" style="${editable ? 'margin-top:3px' : ''}">`;
        if (hasDefect) {
          html += wiLink(wiVal);
        } else {
          html += `<span style="color:var(--red);font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px">${IC.warning} Not Raised</span>`;
        }
        html += `</div></td>`;

        html += `
          <td class="col-owner">${Utils.escHtml(Utils.shortName(row.Owner))}</td>
          <td class="col-case-num">
            <span class="perf-case-link" data-case="${Utils.escHtml(row["Case Number"])}"
              title="Click to view case details"
              style="color:var(--ibm-blue-50);font-weight:600;font-family:var(--font-mono);font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;text-decoration:none">
              ${Utils.escHtml(row["Case Number"])}
            </span>
          </td>
          <td class="col-title" title="${Utils.escHtml(row.Title)}">${Utils.escHtml(row.Title)}</td>
          <td>${Utils.statusBadge(row.Status)}</td>
          ${_showOnlyPerf ? `<td style="min-width:120px">
            ${isAdmin
              ? `<select class="perf-avail-sel" data-case="${Utils.escHtml(row["Case Number"])}"
                  style="font-size:11px;padding:2px 4px;border-radius:var(--radius-xs);border:1px solid var(--border-subtle);background:var(--surface-2);cursor:pointer;max-width:118px">
                  ${AVAIL_OPTS.map(o => `<option value="${o.value}" ${getPerfAvailability(row["Case Number"])===o.value?'selected':''}>${o.label}</option>`).join("")}
                </select>`
              : (() => {
                  const av = getPerfAvailability(row["Case Number"]);
                  const lbl = AVAIL_OPTS.find(o => o.value === av)?.label || "";
                  return av ? `<span class="fs-11">${lbl}</span>` : `<span class="text-10 text-muted">—</span>`;
                })()
            }
          </td>` : ""}
          <td class="col-date">${Utils.fmtDateShort(row.Created)}</td>
          <td>${catBadge}</td>`;

        if (isAdmin && editable) {
          html += `<td>
            <div style="display:flex;gap:4px">
              <button class="action-btn-perf" aria-label="Mark as performance" data-case="${Utils.escHtml(row["Case Number"])}" title="Mark as Performance">
                ${IC.perf} Perf
              </button>
              <button class="action-btn-nonperf" aria-label="Mark as non-performance" data-case="${Utils.escHtml(row["Case Number"])}" title="Mark as Non-Performance">
                ${IC.check} Non
              </button>
            </div>
          </td>`;
        }
        html += `</tr>`;
      });
    }

    html += `</tbody></table></div></div>`;
    container.innerHTML = html;

    // Add read-only row overlay visual cue
    if (!editable) {
      container.querySelectorAll("tbody tr").forEach(tr => {
        tr.style.cursor = "default";
      });
    }

    // Sort headers
    container.querySelectorAll(".sort-th").forEach(th => {
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (_sortKey === key) _sortDir *= -1; else { _sortKey = key; _sortDir = 1; }
        renderPerfTable(filteredCases(Data.performanceCandidates()));
      });
    });

    // Case Number click → open inline detail panel (Wednesday Updates etc.)
    container.querySelectorAll(".perf-case-link").forEach(span => {
      span.addEventListener("click", (e) => {
        e.stopPropagation();
        const all = Data.performanceCandidates();
        const row = all.find(r => r["Case Number"] === span.dataset.case);
        if (row) renderCaseDetailInline(row);
      });
    });

    // Availability dropdown (admin only — always visible even in read-only)
    container.querySelectorAll(".perf-avail-sel").forEach(sel => {
      sel.addEventListener("change", () => {
        setPerfAvailability(sel.dataset.case, sel.value);
        renderFollowUpPanel(filteredCases(Data.performanceCandidates()), Data.performanceMeta());
      });
    });

    if (!editable) return;  // No input event wiring in read-only mode

    container.querySelectorAll(".perf-instance-inp").forEach(inp => {
      inp.addEventListener("input", e => {
        const cn = inp.dataset.case;
        if (!_pending[cn]) _pending[cn] = {};
        _pending[cn].instance = inp.value;
      });
    });

    // ── Custom searchable combobox for instance inputs ──────────────────
    container.querySelectorAll(".ci-combo").forEach(combo => {
      const inp  = combo.querySelector(".ci-combo-input");
      if (!inp) return;

      // Portal drop — appended to body so it escapes any overflow container
      const drop = document.createElement("div");
      drop.className = "ci-combo-drop";
      document.body.appendChild(drop);

      let _hiIdx  = -1;
      let _open   = false;
      let _lastQ  = null;

      function _pos() {
        const r = combo.getBoundingClientRect();
        drop.style.left  = r.left + "px";
        drop.style.width = Math.max(r.width, 160) + "px";
        const below = window.innerHeight - r.bottom;
        const dropH = Math.min(240, drop.scrollHeight || 200);
        if (below < dropH && r.top > below) {
          drop.style.top    = "";
          drop.style.bottom = (window.innerHeight - r.top) + "px";
        } else {
          drop.style.top    = (r.bottom + 2) + "px";
          drop.style.bottom = "";
        }
      }

      function _filter(q) {
        const lq = (q || "").toLowerCase().trim();
        return lq.length === 0
          ? INSTANCES.slice(0, 40)
          : INSTANCES.filter(i => i.toLowerCase().includes(lq)).slice(0, 60);
      }

      function _render(q) {
        _lastQ = q;
        const matches = _filter(q);
        _hiIdx = -1;
        drop.innerHTML = "";
        if (!matches.length) {
          const em = document.createElement("div");
          em.className = "ci-combo-empty";
          em.textContent = "No matches";
          drop.appendChild(em);
        } else {
          matches.forEach((inst, idx) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "ci-combo-opt" + (inst === inp.value ? " ci-combo-active" : "");
            btn.textContent = inst;
            btn.dataset.idx = String(idx);
            drop.appendChild(btn);
          });
        }
      }

      function _openDrop(q) {
        _open = true;
        _render(q != null ? q : inp.value);
        _pos();
        drop.style.display = "block";
      }

      function _closeDrop() {
        _open = false;
        drop.style.display = "none";
      }

      function _setHi(idx) {
        const opts = drop.querySelectorAll(".ci-combo-opt");
        opts.forEach(o => o.classList.remove("ci-combo-highlighted"));
        _hiIdx = Math.max(-1, Math.min(idx, opts.length - 1));
        if (_hiIdx >= 0 && opts[_hiIdx]) {
          opts[_hiIdx].classList.add("ci-combo-highlighted");
          opts[_hiIdx].scrollIntoView({ block: "nearest" });
        }
      }

      inp.addEventListener("focus", () => _openDrop(inp.value));

      inp.addEventListener("input", () => {
        if (!_open) _openDrop(inp.value);
        else _render(inp.value);
        _pos();
      });

      inp.addEventListener("keydown", e => {
        const opts = [...drop.querySelectorAll(".ci-combo-opt")];
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!_open) { _openDrop(inp.value); return; }
          _setHi(_hiIdx + 1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          _setHi(_hiIdx - 1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (_hiIdx >= 0 && opts[_hiIdx]) {
            const val = opts[_hiIdx].textContent;
            inp.value = val;
            inp.dispatchEvent(new Event("input", { bubbles: true }));
            _closeDrop();
          } else {
            _closeDrop();
          }
        } else if (e.key === "Escape") {
          _closeDrop();
        }
      });

      inp.addEventListener("blur", e => {
        // Delay so click on drop option fires first
        setTimeout(() => { if (_open) _closeDrop(); }, 160);
      });

      drop.addEventListener("mousedown", e => {
        const btn = e.target.closest(".ci-combo-opt");
        if (!btn) return;
        e.preventDefault(); // prevent blur
        inp.value = btn.textContent;
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        _closeDrop();
        inp.focus();
      });

      // Reposition on scroll / resize
      const repos = () => { if (_open) _pos(); };
      window.addEventListener("scroll",  repos, { passive: true, capture: true });
      window.addEventListener("resize",  repos, { passive: true });

      // Cleanup when combo is removed
      const remObs = new MutationObserver(() => {
        if (!document.contains(combo)) {
          remObs.disconnect();
          window.removeEventListener("scroll", repos, { capture: true });
          window.removeEventListener("resize", repos);
          if (drop.parentNode) drop.parentNode.removeChild(drop);
        }
      });
      remObs.observe(document.body, { childList: true, subtree: true });
    });

    container.querySelectorAll(".perf-workitem-inp").forEach(inp => {
      inp.addEventListener("input", e => {
        const cn = inp.dataset.case;
        if (!_pending[cn]) _pending[cn] = {};
        _pending[cn].workItem = inp.value;
        const wrap = container.querySelector(`.wi-link-wrap[data-case="${cn}"]`);
        if (wrap) wrap.innerHTML = wiLink(inp.value) || `<span style="color:var(--red);font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px">${IC.warning} Not Raised</span>`;
      });
      inp.addEventListener("blur", e => {
        const cn = inp.dataset.case;
        const { display } = parseWorkItem(inp.value);
        if (display && display !== inp.value) {
          inp.value = display;
          if (!_pending[cn]) _pending[cn] = {};
          _pending[cn].workItem = display;
          const wrap = container.querySelector(`.wi-link-wrap[data-case="${cn}"]`);
          if (wrap) wrap.innerHTML = wiLink(display);
        }
      });
    });

    container.querySelectorAll(".action-btn-perf").forEach(btn => {
      btn.addEventListener("click", () => {
        const cn = btn.dataset.case;
        if (!_pending[cn]) _pending[cn] = {};
        const prevCat = _pending[cn].category || "non-performance";
        _pending[cn].category = "performance";
        const tr  = container.querySelector(`tr[data-case="${cn}"]`);
        const tag = tr?.querySelector(".tag");
        if (tag) { tag.className = "tag tag-perf"; tag.innerHTML = `${IC.perf} Performance`; }
        renderKPIs(Data.performanceCandidates(), Data.performanceMeta());
        // F29: 5-second undo toast
        _showUndoToast(cn, "Marked as Performance", prevCat, container);
      });
    });
    container.querySelectorAll(".action-btn-nonperf").forEach(btn => {
      btn.addEventListener("click", () => {
        const cn = btn.dataset.case;
        if (!_pending[cn]) _pending[cn] = {};
        const prevCat = _pending[cn].category || "performance";
        _pending[cn].category = "non-performance";
        const tr  = container.querySelector(`tr[data-case="${cn}"]`);
        const tag = tr?.querySelector(".tag");
        if (tag) { tag.className = "tag tag-nonperf"; tag.innerHTML = `${IC.check} Non-Perf`; }
        renderKPIs(Data.performanceCandidates(), Data.performanceMeta());
        // F29: 5-second undo toast
        _showUndoToast(cn, "Marked as Non-Performance", prevCat, container);
      });
    });
  }

  // F29: Undo toast with 5-second window
  function _showUndoToast(cn, label, prevCat, container) {
    const existing = document.getElementById("perf-undo-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "perf-undo-toast";
    toast.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--sidebar-bg);color:var(--bg-layer);font-size:12px;font-weight:600;padding:10px 18px;border-radius:var(--radius-md);box-shadow:0 4px 16px rgba(0,0,0,.3);z-index:var(--z-modal)9;display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.1)";
    let timer = 5;
    const undoBtn = `<button id="perf-undo-btn" style="background:rgba(15,98,254,.2);border:1px solid rgba(15,98,254,.4);color:var(--ibm-blue-30);border-radius:var(--radius-sm);padding:3px 10px;font-size:11px;cursor:pointer;font-family:inherit">↩ Undo</button>`;
    toast.innerHTML = `<span>${label} · ${cn}</span>${undoBtn}<span id="perf-undo-timer" class="fs-10-dim">${timer}s</span>`;
    document.body.appendChild(toast);
    const interval = setInterval(() => { timer--; const el=document.getElementById("perf-undo-timer"); if(el) el.textContent=timer+"s"; if(timer<=0){clearInterval(interval);toast.remove();} }, 1000);
    document.getElementById("perf-undo-btn")?.addEventListener("click", () => {
      clearInterval(interval);
      if (!_pending[cn]) _pending[cn] = {};
      _pending[cn].category = prevCat;
      toast.remove();
      // Refresh tag in table
      const tr = container?.querySelector(`tr[data-case="${cn}"]`);
      const tag = tr?.querySelector(".tag");
      if (tag) {
        if (prevCat === "performance") { tag.className="tag tag-perf"; tag.innerHTML=`${IC.perf} Performance`; }
        else { tag.className="tag tag-nonperf"; tag.innerHTML=`${IC.check} Non-Perf`; }
      }
      renderKPIs(Data.performanceCandidates(), Data.performanceMeta());
    });
  }

  function exportPerfTable(cases, meta, perfNums) {
    const headers = ["Sl.No","Instance","Work Item","Case Owner","Case Number","Issue","Status","Created","Category"];
    const sorted  = sortedCases(cases);
    const rows    = sorted.map((row, i) => {
      const m    = meta[row["Case Number"]] || {};
      const cat  = getPending(row["Case Number"], "category", m.category || "non-performance");
      const inst = getPending(row["Case Number"], "instance", m.instance || extractInstanceFromTitle(row.Title));
      return [i+1, inst, m.workItem||"", Utils.shortName(row.Owner), row["Case Number"], row.Title, row.Status, row.Created, cat]
        .map(v => `"${String(v||"").replace(/"/g,'""')}"`).join(",");
    });
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `performance_cases_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  function kpi(label, value, cls = "", id = null, sub = "") {
    const idAttr = id ? `id="${id}"` : "";
    const cursor = id ? "cursor:pointer;" : "";
    return `<div class="kpi-card ${cls}" ${idAttr} style="${cursor}transition:box-shadow 0.15s">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      ${sub ? `<div style="font-size:10px;color:var(--ibm-blue-50);margin-top:4px;font-weight:500">${sub}</div>` : ""}
    </div>`;
  }

  // ── Availability options (mirrors Weekly Tracker) ──────────────────────
  const AVAIL_OPTS = [
    { value: "",           label: "— Set —" },
    { value: "Attended",   label: "✓ Attended" },
    { value: "Not Joined", label: "✗ Not Joined" },
    { value: "On Leave",   label: "◌ On Leave" },
    { value: "Follow Up",  label: "→ Follow Up" },
    { value: "Reopen",     label: "↻ Reopen" },
  ];
  const AVAIL_NEEDS_FOLLOWUP = new Set(["Not Joined","On Leave","Follow Up","Reopen"]);

  function getPerfAvailability(caseNum) {
    return (Data.performanceMeta()[caseNum] || {}).availability || "";
  }
  function setPerfAvailability(caseNum, val) {
    Data.setPerformanceMeta(caseNum, { availability: val });
  }

  // ── Follow-up alert panel (above table) ─────────────────────────────────
  function renderFollowUpPanel(cases, meta) {
    const panel = document.getElementById("perf-followup-panel");
    if (!panel) return;
    const flagged = cases.filter(r => {
      const av = (meta[r["Case Number"]] || {}).availability || "";
      return AVAIL_NEEDS_FOLLOWUP.has(av);
    });
    if (!flagged.length) { panel.innerHTML = ""; return; }
    const rows = flagged.map((r,i) => {
      const av  = (meta[r["Case Number"]] || {}).availability;
      const lbl = AVAIL_OPTS.find(o => o.value === av)?.label || av;
      return `<tr class="cursor-pointer perf-fu-row" data-case="${Utils.escHtml(r["Case Number"])}">
        <td class="text-11 text-muted">${i+1}</td>
        <td class="perf-fu-case-link" style="font-family:var(--font-mono);font-size:11px;color:var(--ibm-blue-50);font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:2px" title="Click to view case details">${Utils.escHtml(r["Case Number"])}</td>
        <td class="fs-11">${Utils.escHtml(Utils.shortName(r.Owner))}</td>
        <td class="fs-11">${lbl}</td>
        <td style="font-size:11px;color:var(--text-secondary);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${Utils.escHtml(r.Title)}">${Utils.escHtml(r.Title)}</td>
      </tr>`;
    }).join("");
    panel.innerHTML = `
      <div class="tile" style="border-left:4px solid var(--red);padding:12px 16px;margin-top:20px;margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px">
          <span style="font-size:12px;font-weight:600;color:var(--red)">🔔 Needs Follow Up
            <span style="background:var(--red);color:#fff;border-radius:var(--radius-md);padding:1px 7px;font-size:10px;margin-left:6px">${flagged.length}</span>
          </span>
          <span class="text-10 text-muted">Cases marked Not Joined / On Leave / Follow Up — click row to jump to case</span>
        </div>
        <div class="data-table-wrap" style="max-height:140px;overflow-y:auto">
          <table class="data-table" class="fs-11">
            <thead><tr><th>#</th><th>Case No.</th><th>Owner</th><th>Availability</th><th>Issue</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    panel.querySelectorAll(".perf-fu-row").forEach(tr => {
      // Case number cell click → open inline detail panel
      const caseNumCell = tr.querySelector(".perf-fu-case-link");
      if (caseNumCell) {
        caseNumCell.addEventListener("click", (e) => {
          e.stopPropagation();
          const all = Data.performanceCandidates();
          const row = all.find(r => r["Case Number"] === tr.dataset.case);
          if (row) renderCaseDetailInline(row);
        });
      }

      // Row click (anywhere except case number) → scroll to & highlight in Performance Cases table
      tr.addEventListener("click", (e) => {
        if (e.target.closest(".perf-fu-case-link")) return; // handled above
        const caseNum = tr.dataset.case;
        const perfTable = document.getElementById("tbl-perf");
        if (!perfTable) return;
        perfTable.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          const targetRow = perfTable.querySelector(`tr[data-case="${CSS.escape(caseNum)}"]`);
          if (!targetRow) return;
          targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
          targetRow.style.transition = "background 0.2s";
          targetRow.style.background = "var(--ibm-blue-10, #d0e2ff)";
          setTimeout(() => {
            targetRow.style.background = "";
            setTimeout(() => { targetRow.style.transition = ""; }, 300);
          }, 1800);
        }, 350);
      });
    });
  }

  // ── Case Detail — renders as inline panel inside the Performance page ──
  function renderCaseDetailInline(row) {
    const el = document.getElementById("tab-performance");
    if (!el) return;

    const cn   = row["Case Number"];
    const meta = Data.performanceMeta();
    const m    = meta[cn] || {};
    const perfNums    = new Set(Data.getPerfCaseNums());
    const nonPerfNums = new Set(Data.getNonPerfCaseNums());
    const isPerf = !nonPerfNums.has(cn) && (perfNums.has(cn) || m.category === "performance");

    const caseInfo = {
      instance:  m.instance || extractInstanceFromTitle(row.Title) || "—",
      workItem:  m.workItem  || "",
      owner:     Utils.shortName(row.Owner),
      caseNum:   cn,
      title:     row.Title,
      status:    row.Status,
      created:   row.Created || "",
      category:  isPerf ? "Performance" : "Non-Performance"
    };
    Data.registerCaseDetail(cn, caseInfo);

    // Remove any existing detail panel before injecting a new one
    const panelId = "perf-case-detail-panel";
    document.getElementById(panelId)?.remove();

    const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const now = new Date();
    const curYear  = now.getFullYear();
    const curMonth = now.getMonth();
    const startYear = row.Created ? (new Date(row.Created).getFullYear() || curYear) : curYear;
    const years = [];
    for (let y = Math.max(2022, Math.min(startYear, curYear)); y <= curYear; y++) years.push(y);
    if (!years.length) years.push(curYear);

    let _activeYear  = curYear;
    let _activeMonth = curMonth;
    const _updateDay = 3; // Default Wednesday (0=Sun, 1=Mon, ... 6=Sat)
    const DAY_NAMES  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const isAdmin = (typeof Data !== "undefined" && Data.isAdmin());

    const perfBadge = isPerf
      ? `<span style="background:rgba(218,30,40,.15);color:var(--red);border:1px solid rgba(218,30,40,.3);font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--radius-md);display:inline-flex;align-items:center;gap:4px">${IC.perf} Performance</span>`
      : `<span style="background:rgba(36,161,72,.12);color:var(--green);border:1px solid rgba(36,161,72,.3);font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--radius-md);display:inline-flex;align-items:center;gap:4px">${IC.check} Non-Performance</span>`;

    // Per-slot day overrides: key = "YYYY-MM-slotIdx", value = dayOfWeek int
    const _slotDays = {};

    function getDayOccurrences(year, month, dayOfWeek) {
      const days = [], d = new Date(year, month, 1);
      while (d.getDay() !== dayOfWeek) d.setDate(d.getDate() + 1);
      while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 7); }
      return days;
    }
    function dateKey(d) { return d.toISOString().slice(0, 10); }
    function ordinal(n) { const s=["th","st","nd","rd"],v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
    function fmtWed(d) { return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"}); }

    // Build slots for a month: each slot has its own day-of-week (default Wed=3)
    // A slot is a "weekly occurrence" position — we enumerate by week number in month
    function buildMonthSlots(year, mo) {
      // We fix 4 or 5 slot positions per month — one per week
      const slots = [];
      // Find all Mondays (start of week) for this month
      const firstDay = new Date(year, mo, 1);
      const lastDay  = new Date(year, mo + 1, 0);
      let weekStart = new Date(firstDay);
      // align to Monday
      const dow = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
      let si = 0;
      while (weekStart <= lastDay) {
        const slotKey = year + "-" + String(mo).padStart(2,"0") + "-" + si;
        const dayOfWeek = _slotDays[slotKey] !== undefined ? _slotDays[slotKey] : 3; // default Wed
        // Find the occurrence of that day in this week
        const occ = new Date(weekStart);
        occ.setDate(occ.getDate() + ((dayOfWeek - 1 + 7) % 7)); // Mon=0 offset
        // Convert: weekStart is Mon(1). dayOfWeek 0=Sun,1=Mon,...
        const offset = (dayOfWeek + 6) % 7; // Mon=0 offset
        const occDate = new Date(weekStart);
        occDate.setDate(occDate.getDate() + offset);
        // Only include slots whose date falls within the target month
        if (occDate.getMonth() === mo && occDate.getFullYear() === year) {
          slots.push({ slotKey, dayOfWeek, date: occDate, si });
        }
        weekStart = new Date(weekStart);
        weekStart.setDate(weekStart.getDate() + 7);
        si++;
      }
      return slots;
    }

    function buildMonthContent(year, mo) {
      const slots = buildMonthSlots(year, mo);
      if (!slots.length) return `<div style="padding:24px;color:var(--text-tertiary);font-size:12px;text-align:center">No slots available.</div>`;
      return slots.map(({ slotKey, dayOfWeek, date }) => {
        const dayName = DAY_NAMES[dayOfWeek];
        const dk = dateKey(date);
        const val = Utils.escHtml(Data.getWednesdayComment(cn, dk) || "");
        const hasVal = val.trim() !== "";
        const dayOptsHtml = DAY_NAMES.map((d,i) => {
          const isActive = i === dayOfWeek;
          return '<button class="dpnl-day-opt" data-slot="' + slotKey + '" data-dv="' + i + '" data-year="' + year + '" data-mo="' + mo + '" style="color:' + (isActive ? 'var(--chart-1)' : 'var(--text-primary)') + ';font-weight:' + (isActive ? '700' : '400') + '">' + d + '</button>';
        }).join("");
        const dayPickerHtml = '<div class="dpnl-day-picker" style="position:relative;display:inline-block;margin-top:3px">'
          + '<button class="dpnl-day-trigger" title="Change day for this update"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' + dayName.slice(0,3) + '</button>'
          + '<div class="dpnl-day-drop" style="display:none;position:fixed;z-index:var(--z-modal);background:var(--bg-ui);border:1px solid var(--border-mid);border-radius:var(--radius-md);box-shadow:0 8px 24px rgba(0,0,0,.18);padding:4px 0;min-width:130px">' + dayOptsHtml + '</div>'
          + '</div>';
        const taHtml = isAdmin
          ? '<textarea class="dpnl-comment-input" data-case="' + Utils.escHtml(cn) + '" data-date="' + dk + '" style="flex:1;min-height:52px;resize:vertical;font-size:12px;padding:6px 10px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:var(--font-sans);line-height:1.4" placeholder="Add ' + dayName + ' update...">' + val + '</textarea>'
          : '<div style="flex:1;font-size:12px;line-height:1.5;padding:' + (hasVal ? '6px 10px' : '2px 0') + ';background:' + (hasVal ? 'var(--surface-2)' : 'transparent') + ';border:1px solid ' + (hasVal ? 'var(--border-subtle)' : 'transparent') + ';border-radius:' + (hasVal ? '6px' : '0') + ';color:' + (hasVal ? 'var(--text-primary)' : 'var(--text-tertiary)') + '">' + (hasVal ? val : '<em>No update recorded</em>') + '</div>';
        return '<div style="display:flex;align-items:flex-start;gap:14px;padding:11px 0;border-bottom:1px solid var(--border-subtle)">'
          + '<div style="min-width:92px;padding-top:2px;flex-shrink:0">'
          + '<div style="font-size:12px;font-weight:600;color:var(--ibm-blue-50);line-height:1.3">' + ordinal(date.getDate()) + ' ' + dayName.slice(0,3) + '</div>'
          + '<div style="font-size:10px;color:var(--text-tertiary);margin-top:1px">' + fmtWed(date) + '</div>'
          + dayPickerHtml
          + '</div>'
          + taHtml
          + '</div>';
      }).join("");
    }

    function buildMonthTabs(year) {
      return MONTH_NAMES.map((mn, mo) => {
        const isActive = mo === _activeMonth;
        const slots = buildMonthSlots(year, mo);
        const hasDot = slots.some(s => Data.getWednesdayComment(cn, dateKey(s.date)));
        return `<button class="dpnl-mo-tab" data-mo="${mo}" style="
          position:relative;padding:5px 11px;font-size:11px;font-weight:${isActive?'700':'500'};
          border-radius:var(--radius-sm);border:${isActive?'2px solid var(--ibm-blue-50)':'1px solid var(--border-subtle)'};
          background:${isActive?'rgba(15,98,254,.08)':'var(--surface-1)'};
          color:${isActive?'var(--ibm-blue-50)':'var(--text-secondary)'};cursor:pointer;white-space:nowrap">
          ${mn.slice(0,3)}${hasDot?`<span style="position:absolute;top:2px;right:2px;width:4px;height:4px;border-radius:50%;background:var(--ibm-blue-50)"></span>`:""}
        </button>`;
      }).join("");
    }

    // Create panel element
    const panel = document.createElement("div");
    panel.id = panelId;
    panel.style.cssText = "margin-top:16px";

    function buildPanelHTML() {
      return `
        <!-- Header -->
        <div class="tile" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;
          border-left:4px solid ${isPerf?'var(--red,#da1e28)':'var(--green)'};padding:14px 18px">
          <button id="dpnl-back" class="btn btn-ghost btn-sm">← Back to Cases</button>
          <div class="flex-1-0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">
              <span class="case-number-copy" data-cn="${Utils.escHtml(cn)}" title="Click to copy case number" style="font-family:var(--font-mono);font-size:15px;font-weight:700;color:var(--ibm-blue-50);cursor:pointer">${Utils.escHtml(cn)}</span>
              ${perfBadge}
            </div>
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.4;max-width:700px">${Utils.escHtml(caseInfo.title)}</div>
          </div>
        </div>

        <!-- Summary KPIs -->
        <div class="kpi-row mt-4">
          ${[
            ["Owner",    caseInfo.owner, ""],
            ["Status",   null, ""],
            ["Instance", caseInfo.instance, ""],
            ["Work Item",null, "wi"],
            ["Created",  Utils.fmtDateShort(caseInfo.created)||"—", ""],
            ["Category", caseInfo.category, ""],
          ].map(([k,v,t]) => `<div class="kpi-card">
            <div class="kpi-label">${k}</div>
            <div style="font-size:15px;font-weight:600;font-family:var(--font-sans,'IBM Plex Sans',sans-serif);line-height:1.3;color:var(--text-primary);margin-top:4px;word-break:break-word">
              ${k==="Status" ? Utils.statusBadge(caseInfo.status)
                : t==="wi" ? (caseInfo.workItem ? wiLink(caseInfo.workItem) : '<span style="color:var(--text-tertiary);font-size:11px">—</span>')
                : Utils.escHtml(v||"—")}
            </div>
          </div>`).join("")}
        </div>

        <!-- Availability Card -->
        <div class="tile mt-4" style="padding:14px 18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:var(--surface-1);border:1px solid var(--border-subtle)">
          <div style="flex:1;min-width:180px">
            <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:2px">📋 Availability Status</div>
            <div class="text-11 text-muted">Mark attendance or follow-up status for this case</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <select id="dpnl-avail-sel" style="font-size:12px;padding:5px 10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface-2);color:var(--text-primary);min-width:160px;cursor:pointer">
              ${AVAIL_OPTS.map(o => `<option value="${o.value}" ${getPerfAvailability(cn)===o.value?'selected':''}>${o.label}</option>`).join("")}
            </select>
            <button id="dpnl-avail-save" class="btn btn-primary btn-sm">${IC.save} Save</button>
          </div>
          <div id="dpnl-avail-saved" style="display:none;font-size:11px;color:var(--green);font-weight:600">✓ Saved</div>
        </div>

        <!-- Wednesday Panel -->
        <div class="tile mt-4" style="padding:0;overflow:hidden">
          <div style="padding:12px 18px;background:var(--surface-2);border-bottom:1px solid var(--border);
            display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
            <div>
              <div class="section-title" class="mb-0">${DAY_NAMES[_updateDay]} Updates</div>
              <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">${isAdmin ? "Admin: comments are directly editable below." : "Records persist permanently. Select year + month to view."}</div>
            </div>
            ${isAdmin ? `<button id="dpnl-save-all" class="btn btn-primary btn-sm">${IC.save} Save All</button>` : ""}
          </div>
          <!-- Year pills -->
          <div style="padding:10px 18px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--surface-1)">
            <span style="font-size:10px;font-weight:600;color:var(--text-tertiary);text-transform:none;letter-spacing:.6px">Year</span>
            ${years.map(y => `<button class="dpnl-yr-btn" data-yr="${y}" style="
              padding:4px 14px;font-size:12px;font-weight:${y===_activeYear?'700':'500'};border-radius:var(--radius-xl);border:none;
              background:${y===_activeYear?'var(--ibm-blue-50)':'var(--surface-2)'};
              color:${y===_activeYear?'#fff':'var(--text-secondary)'};cursor:pointer">${y}</button>`).join("")}
          </div>
          <!-- Month tabs -->
          <div style="padding:8px 18px;border-bottom:1px solid var(--border-subtle);background:var(--surface-1);overflow-x:auto">
            <div id="dpnl-mo-tabs" style="display:flex;gap:4px;min-width:max-content">${buildMonthTabs(_activeYear)}</div>
          </div>
          <!-- Month content -->
          <div id="dpnl-mo-content" style="padding:14px 18px;max-height:340px;overflow-y:auto">
            ${buildMonthContent(_activeYear, _activeMonth)}
          </div>
        </div>`;
    }

    panel.innerHTML = buildPanelHTML();

    // Inject after the table tile (append to tab)
    el.appendChild(panel);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });

    function wirePanel() {
      document.getElementById("dpnl-back")?.addEventListener("click", () => {
        panel.remove();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      // Availability card
      document.getElementById("dpnl-avail-save")?.addEventListener("click", () => {
        const sel = document.getElementById("dpnl-avail-sel");
        if (sel) {
          setPerfAvailability(cn, sel.value);
          const saved = document.getElementById("dpnl-avail-saved");
          if (saved) { saved.style.display = "inline"; setTimeout(() => { saved.style.display = "none"; }, 2000); }
          renderFollowUpPanel(filteredCases(Data.performanceCandidates()), Data.performanceMeta());
        }
      });

      document.getElementById("dpnl-save-all")?.addEventListener("click", () => {
        panel.querySelectorAll(".dpnl-comment-input").forEach(ta => {
          Data.setWednesdayComment(ta.dataset.case, ta.dataset.date, ta.value.trim());
        });
        const btn = document.getElementById("dpnl-save-all");
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = IC.check + " Saved!";
          btn.style.cssText += "background:var(--green);border-color:var(--green)";
          setTimeout(() => { btn.innerHTML = orig; btn.style.background=""; btn.style.borderColor=""; }, 1800);
        }
      });

      function wireAdminInputs() {
        panel.querySelectorAll(".dpnl-comment-input").forEach(ta => {
          ta.addEventListener("blur", () => { Data.setWednesdayComment(ta.dataset.case, ta.dataset.date, ta.value.trim()); });
        });
      }
      wireAdminInputs();

      panel.querySelectorAll(".dpnl-yr-btn").forEach(b => {
        b.addEventListener("click", () => {
          _activeYear = parseInt(b.dataset.yr);
          _activeMonth = 0;
          panel.innerHTML = buildPanelHTML();
          wirePanel();
        });
      });

      // Register the global close-listener only ONCE per panel to avoid stacking
      if (!panel._dayDropCloseWired) {
        panel._dayDropCloseWired = true;
        document.addEventListener("click", function(e) {
          if (!e.target.closest(".dpnl-day-picker")) {
            document.querySelectorAll(".dpnl-day-drop").forEach(d => { d.style.display = "none"; });
          }
        }, { capture: true, passive: true });
      }

      function wireDayPickers() {
        panel.querySelectorAll(".dpnl-day-trigger").forEach(btn => {
          // Clone to remove any stacked listeners from prior renders
          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);

          // Grab the drop BEFORE any re-parenting — it's the next sibling right now
          const drop = newBtn.nextElementSibling;

          // Portal: move dropdown to <body> once so position:fixed works
          // without being clipped by any overflow/transform ancestor
          document.body.appendChild(drop);
          drop.style.display  = "none";
          drop.style.position = "fixed";
          drop.style.zIndex   = "999999";

          newBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            const isOpen = drop.style.display === "block";

            // Close every other open drop
            document.querySelectorAll(".dpnl-day-drop").forEach(d => {
              if (d !== drop) d.style.display = "none";
            });

            if (isOpen) {
              drop.style.display = "none";
            } else {
              // Position below the trigger button
              const rect = newBtn.getBoundingClientRect();
              let top  = rect.bottom + 4;
              let left = rect.left;

              // Pre-position and show so we can measure rendered size
              drop.style.top     = top  + "px";
              drop.style.left    = left + "px";
              drop.style.display = "block";

              // Viewport clamping
              const dw = drop.offsetWidth;
              const dh = drop.offsetHeight;
              if (left + dw > window.innerWidth - 8) {
                left = Math.max(8, rect.right - dw);
                drop.style.left = left + "px";
              }
              if (top + dh > window.innerHeight - 8) {
                drop.style.top = Math.max(8, rect.top - dh - 4) + "px";
              }
            }
          });
        });
        document.querySelectorAll(".dpnl-day-opt").forEach(btn => {
          btn.addEventListener("click", function() {
            // Hide & remove all portaled drops from body before re-render
            document.querySelectorAll(".dpnl-day-drop").forEach(d => {
              d.style.display = "none";
              if (d.parentElement === document.body) document.body.removeChild(d);
            });

            // Store the new day for this specific slot only
            const slotKey = btn.dataset.slot;
            const dv      = parseInt(btn.dataset.dv);
            const year    = parseInt(btn.dataset.year);
            const mo      = parseInt(btn.dataset.mo);
            _slotDays[slotKey] = dv;
            // Only re-render the month content (not all tabs)
            const cntEl = document.getElementById("dpnl-mo-content");
            if (cntEl) {
              cntEl.innerHTML = buildMonthContent(year, mo);
              wireAdminInputs();
              wireDayPickers();
            }
          });
        });
      }

      function wireMonthTabs() {
        panel.querySelectorAll(".dpnl-mo-tab").forEach(b => {
          b.addEventListener("click", () => {
            _activeMonth = parseInt(b.dataset.mo);
            const tabsEl = document.getElementById("dpnl-mo-tabs");
            const cntEl  = document.getElementById("dpnl-mo-content");
            if (tabsEl) tabsEl.innerHTML = buildMonthTabs(_activeYear);
            if (cntEl)  cntEl.innerHTML  = buildMonthContent(_activeYear, _activeMonth);
            wireAdminInputs();
            wireMonthTabs();
            wireDayPickers();
          }, { once: true });
        });
      }
      wireMonthTabs();
      wireDayPickers();
      // Close day dropdowns when clicking outside
      function _returnDropToParent(drop) {
        // Restore portaled dropdown back to its original parent
        const trigger = panel.querySelector(".dpnl-day-trigger:not([data-drop-restored])");
        // Find the trigger that owns this drop via stored references
        panel.querySelectorAll(".dpnl-day-trigger").forEach(t => {
          if (t._dropOrigParent && drop.parentElement === document.body) {
            t._dropOrigParent.insertBefore(drop, t._dropOrigNext || null);
          }
        });
        drop.style.display = "none";
      }
      const _closeDayDrops = (e) => {
        if (!e.target.closest(".dpnl-day-picker") && !e.target.closest(".dpnl-day-drop")) {
          document.querySelectorAll(".dpnl-day-drop").forEach(d => {
            d.style.display = "none";
          });
        }
      };
      document.addEventListener("click", _closeDayDrops);
      // Clean up listener when panel is removed
      const _observer = new MutationObserver(() => {
        if (!document.contains(panel)) {
          document.removeEventListener("click", _closeDayDrops);
          _observer.disconnect();
        }
      });
      _observer.observe(document.body, { childList: true, subtree: true });
    }
    wirePanel();
  }  // end renderCaseDetailInline

  return { render };
})();
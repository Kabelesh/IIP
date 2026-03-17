/* ============================================================
   overview.js  — IBM Case Operations Command Center  v7.0.2
   7-zone operational dashboard following engineering observability
   principles: high density · instant signal · minimal scrolling
   ============================================================ */
const DashOverview = (() => {
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


  /* ── Module state ─────────────────────────────────────────*/
  let _tw     = 6;      // trend window: 3 | 6 | 12
  let _filter = "all";  // table status filter
  let _search = "";     // table search string
  let _tableRef = null;

  /* ── Icons (same stroke style as rest of app) ─────────── */
  const IC = {
    activity: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    alert:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    trend:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    donut:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
    users:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
    pkg:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    table:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
    zap:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    refresh:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
    export:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    search:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
    ext:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    clock:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    fire:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`,
    check:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    invest:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
    close:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    arrowUp:  `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
    arrowDn:  `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  };

  /* ══════════════════════════════════════════════════════════
     DATA AGGREGATION
     ════════════════════════════════════════════════════════ */
  function _aggregate() {
    const team     = Data.teamCases();
    const cust     = Data.customerCases();
    const open     = team.filter(r => !Utils.isClosed(r.Status));
    const inprog   = open.filter(r => r.Status === "IBM is working" || r.Status === "Waiting for IBM");
    const acc02    = open.filter(r => (r["Customer number"]||"").replace(/^0+/,"").startsWith("2"));
    const acc08    = open.filter(r => (r["Customer number"]||"").includes(Data.customerAccountId ? Data.customerAccountId() : "881812"));
    const custOpen = cust.filter(r => !Utils.isClosed(r.Status));

    // Closed last 7 days
    const closed7d = team.filter(r => {
      if (!Utils.isClosed(r.Status)) return false;
      const d = Utils.parseDate(r.Updated || r.Created);
      return d && Utils.daysDiff(d) <= 7;
    });

    // Previous week snapshot for trend arrows
    const prev7Open = team.filter(r => {
      if (Utils.isClosed(r.Status)) return false;
      const d = Utils.parseDate(r.Updated || r.Created);
      const age = d ? Utils.daysDiff(d) : 999;
      return age >= 7 && age < 14;
    });
    const prev7Closed = team.filter(r => {
      if (!Utils.isClosed(r.Status)) return false;
      const d = Utils.parseDate(r.Updated || r.Created);
      const age = d ? Utils.daysDiff(d) : 999;
      return age >= 7 && age < 14;
    });

    // Status distribution
    const statusMap = {};
    open.forEach(r => { statusMap[r.Status] = (statusMap[r.Status]||0)+1; });
    const statusData  = Object.entries(statusMap).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
    const statusTotal = statusData.reduce((s,d)=>s+d.value, 0);

    // Product distribution (top 12, active only)
    const prodMap = {};
    open.forEach(r => { const p = r.Product||"Unknown"; prodMap[p]=(prodMap[p]||0)+1; });
    const prodData = Object.entries(prodMap).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([name,value])=>({name,value}));

    // Owner counts (top 10, active only)
    const ownerData = Utils.ownerCounts(open).slice(0,10);

    // Trend data
    const allTrend = Utils.monthlyTrend(team);

    // ── Alert data ──────────────────────────────────────────
    const awaitCust5d = open.filter(r => {
      if (r.Status !== "Awaiting your feedback") return false;
      const d = Utils.parseDate(r.Updated || r.Created);
      return d && Utils.daysDiff(d) >= 5;
    });
    const waitIBM5d = open.filter(r => {
      if (r.Status !== "Waiting for IBM") return false;
      const d = Utils.parseDate(r.Updated || r.Created);
      return d && Utils.daysDiff(d) >= 5;
    });
    const escalated = open.filter(r =>
      (r.Priority||"").includes("1") || (r.Severity||"").includes("1")
    );
    let oldestCase = null, oldestDays = 0;
    open.forEach(r => {
      const d = Utils.parseDate(r.Created);
      if (d) { const age = Utils.daysDiff(d); if (age > oldestDays) { oldestDays = age; oldestCase = r; } }
    });

    // Recent activity — last 5 updated cases
    const recent = [...team]
      .filter(r => Utils.parseDate(r.Updated || r.Created))
      .sort((a,b) => {
        const da = Utils.parseDate(a.Updated||a.Created);
        const db = Utils.parseDate(b.Updated||b.Created);
        return db - da;
      })
      .slice(0, 5);

    // ── Performance Cases for Overview panel ────────────────
    const perfNums   = new Set(Data.getPerfCaseNums());
    const nonPerfNums= new Set(Data.getNonPerfCaseNums ? Data.getNonPerfCaseNums() : []);
    const perfMeta   = Data.performanceMeta ? Data.performanceMeta() : {};
    const isPerfCase = r => {
      const cn = r["Case Number"];
      if (nonPerfNums.has(cn)) return false;
      return perfNums.has(cn) || (perfMeta[cn]||{}).category === "performance";
    };
    // All perf cases from team (open + closed)
    const allPerfCases = team.filter(isPerfCase);
    // In-progress = open (not closed)
    const perfInProgress = allPerfCases.filter(r => !Utils.isClosed(r.Status));
    // Newly raised this week = Created within last 7 days
    const perfNewThisWeek = allPerfCases.filter(r => {
      const d = Utils.parseDate(r.Created);
      return d && Utils.daysDiff(d) <= 7;
    });

    return {
      team, open, inprog, acc02, acc08, custOpen,
      totalActive: open.length + custOpen.length,
      closed7d, prev7Open, prev7Closed,
      statusData, statusTotal, prodData, ownerData, allTrend,
      awaitCust5d, waitIBM5d, escalated, oldestCase, oldestDays,
      recent,
      perfInProgress, perfNewThisWeek, perfMeta,
    };
  }

  /* ══════════════════════════════════════════════════════════
     MAIN RENDER ENTRY POINT
     ════════════════════════════════════════════════════════ */
  function render() {
    const el = document.getElementById("tab-overview");
    if (!el) return;
    _tableRef = null;
    const D = _aggregate();
    el.innerHTML = _buildPage(D);
    _wireEvents(D);
    _renderCharts(D);
    // F20: Show top 10 at-risk cases (oldest + highest severity) instead of full table
    const atRisk = D.open
      .slice()
      .sort((a,b) => (parseInt(b.Age)||0) - (parseInt(a.Age)||0))
      .slice(0,10);
    _renderTable(atRisk, "Top 10 At-Risk Cases");
  }

  /* ══════════════════════════════════════════════════════════
     PAGE HTML BUILDER
     ════════════════════════════════════════════════════════ */
  function _buildPage(D) {
    const alertCount = [
      D.awaitCust5d.length > 0,
      D.waitIBM5d.length   > 0,
      D.escalated.length   > 0,
      D.oldestDays         > 30,
    ].filter(Boolean).length;

    const trendSlice = _trendSlice(D);
    const tCreated   = trendSlice.reduce((s,r)=>s+r.created, 0);
    const tClosed    = trendSlice.reduce((s,r)=>s+r.closed,  0);

    return `
<!-- ═══════════════════════════════════════════════════════
     ZONE 1 — Executive Metrics Strip
     ═══════════════════════════════════════════════════════ -->
<div class="ov7-strip">
  ${_kpi("Total Active",    D.totalActive,          "",          IC.table)}
  ${_kpi("Team Cases",      D.open.length,          "kpi-yellow",IC.users,  D.open.length    - D.prev7Open.length,   "down")}
  ${_kpi("Closed 7d",       D.closed7d.length,      "kpi-green", IC.check,  D.closed7d.length - D.prev7Closed.length, "up")}
  ${_kpi("In Progress",     D.inprog.length,         "kpi-blue",  IC.activity)}
  ${_kpi("O2 Account",      D.acc02.length,          "kpi-purple",IC.pkg)}
  ${_kpi("O8 Account",      D.acc08.length,          "kpi-purple",IC.pkg)}
  ${_kpi("Customer Cases",  D.custOpen.length,       "kpi-red",   IC.users)}
</div>



<!-- ═══════════════════════════════════════════════════════
     ZONE 2 — Operational Trend Intelligence (2-col)
     ═══════════════════════════════════════════════════════ -->
<div class="ov7-z2">

  <!-- LEFT: Created vs Closed Trend -->
  <div class="tile no-hover">
    <div class="ov7-tile-hdr">
      <div class="section-title" class="mb-0">${IC.trend} Created vs Closed</div>
      <div class="ov7-tw-group">
        <button class="ov7-tw${_tw===3?" ov7-tw-active":""}" data-tw="3">3M</button>
        <button class="ov7-tw${_tw===6?" ov7-tw-active":""}" data-tw="6">6M</button>
        <button class="ov7-tw${_tw===12?" ov7-tw-active":""}" data-tw="12">12M</button>
      </div>
    </div>
    <div class="ov7-trend-summary" id="ov7-trend-summary">
      <span class="ov7-ts-label">Last ${_tw}M:</span>
      <span class="ov7-ts-created">${tCreated} Created</span>
      <span class="ov7-ts-sep">·</span>
      <span class="ov7-ts-closed">${tClosed} Closed</span>
    </div>
    <div class="chart-canvas-wrap" style="height:350px"><canvas id="chart-trend"></canvas></div>
  </div>

  <!-- RIGHT: Status breakdown - pie chart -->
  <div class="tile no-hover">
    <div class="ov7-tile-hdr" class="mb-8">
      <div class="section-title" class="mb-0">${IC.donut} Cases by Status</div>
      <span class="text-11 text-muted">${D.statusTotal} active</span>
    </div>
    <div class="chart-canvas-wrap" style="height:350px"><canvas id="chart-status"></canvas></div>
  </div>

</div>

<!-- ═══════════════════════════════════════════════════════
     ZONE 3 — Workload Distribution (2-col charts)
     + ZONE 4 — Operational Alerts (3rd col)
     ═══════════════════════════════════════════════════════ -->
<div class="ov7-z34">

  <!-- Owner workload -->
  <div class="tile no-hover">
    <div class="section-title mb-2">${IC.users} Owner Workload <span class="ov7-sub-label">(active · top 10)</span></div>
    <div class="chart-canvas-wrap" class="chart-md"><canvas id="chart-owners"></canvas></div>
    ${D.ownerData.length >= 10 ? `<div style="margin-top:6px;text-align:right;font-size:11px;color:var(--text-tertiary)">...and more team members · <button id="ov7-view-members-btn" aria-label="View member dashboard" class="btn btn-ghost btn-xs text-blue-c">View Member Dashboard →</button></div>` : ""}
  </div>

  <!-- Product distribution -->
  <div class="tile no-hover">
    <div class="section-title mb-2">${IC.pkg} Cases by Product</div>
    <div class="chart-canvas-wrap" class="chart-md"><canvas id="chart-products"></canvas></div>
  </div>

  <!-- Operational alerts -->
  <div class="tile no-hover ov7-alerts-tile">
    <div class="section-title red" class="mb-10">${IC.alert} Operational Alerts</div>
    <div id="ov7-alerts-body">${_alertsHTML(D)}</div>
  </div>

</div>

<!-- ═══════════════════════════════════════════════════════
     ZONE 5 — Performance Cases
     ═══════════════════════════════════════════════════════ -->
<div class="tile no-hover ov7-activity-tile">
  ${_perfCasesHTML(D)}
</div>

<!-- ═══════════════════════════════════════════════════════
     ZONE 6 — Active Team Cases Table
     ═══════════════════════════════════════════════════════ -->
<div class="tile no-hover ov7-table-tile" id="tile-drill">

  <!-- Table header row -->
  <div class="ov7-table-hdr">
    <div class="ov7-table-hdr-left">
      <div class="section-title" id="drill-title" class="mb-0">${IC.table} Top 10 At-Risk Cases</div>
      <button id="drill-reset" aria-label="Reset drill-down filter" class="btn btn-ghost btn-xs" class="hidden">${IC.close} Show All</button>
    </div>
    <div style="display:flex;align-items:center;gap:12px;flex-shrink:0">
      <button id="ov7-view-all-btn" aria-label="View all cases" class="btn btn-ghost btn-xs" class="fs-11">View all →</button>
      <div class="ov7-table-meta">${_tableMeta(D)}</div>
    </div>
  </div>

  <!-- Search + filter chips -->
  <div class="ov7-table-ctrl">
    <div class="ov7-search-row">
      <span class="ov7-search-icon">${IC.search}</span>
      <input id="ov7-table-search" class="search-input" placeholder="Search case #, title, owner…" value="${Utils.escHtml(_search)}">
    </div>
    <div class="ov7-chips" id="ov7-chips">${_chipsHTML(D)}</div>
  </div>

  <!-- Table renders here -->
  <div id="tbl-overview"></div>

</div>`;
  }

  /* ══════════════════════════════════════════════════════════
     COMPONENT BUILDERS
     ════════════════════════════════════════════════════════ */

  // KPI card with optional trend arrow
  function _kpi(label, value, cls, icon, delta, goodDir) {
    let trendHtml = "";
    if (delta !== undefined && delta !== null) {
      const abs  = Math.abs(delta);
      const up   = delta > 0;
      const good = goodDir === "up" ? up : goodDir === "down" ? !up : null;
      const col  = delta === 0 ? "var(--text-disabled)"
                 : good === true  ? "var(--green)"
                 : good === false ? "var(--red)"
                 : "var(--text-tertiary)";
      if (delta === 0) {
        trendHtml = `<div class="ov7-kpi-trend" class="text-dim">— no change</div>`;
      } else {
        trendHtml = `<div class="ov7-kpi-trend" style="color:${col}">${up?IC.arrowUp:IC.arrowDn} ${abs} vs last wk</div>`;
      }
    }
    return `<div class="kpi-card ${cls}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      ${value === 0 ? `<div class="ov7-kpi-trend" class="text-green-c">All clear ✓</div>` : trendHtml}
    </div>`;
  }

  // Status legend rows
  const STATUS_COL = {
    "Awaiting your feedback": "var(--yellow)",
    "IBM is working":         "var(--ibm-blue-30)",
    "Waiting for IBM":        "var(--purple)",
    "Closed by IBM":          "var(--green)",
    "Closed by Client":       "var(--text-tertiary)",
    "Closed - Archived":      "var(--text-secondary)",
  };
  function _statusLegend(data, total) {
    if (!data.length) return `<p class="ov7-empty">No data</p>`;
    return data.map(s => {
      const pct   = total > 0 ? Math.round(s.value / total * 100) : 0;
      const color = STATUS_COL[s.name] || "var(--text-secondary)";
      return `<div class="ov7-leg-row" data-status="${Utils.escHtml(s.name)}">
        <span class="ov7-leg-dot" style="background:${color}"></span>
        <span class="ov7-leg-name">${Utils.escHtml(s.name)}</span>
        <span class="ov7-leg-count">${s.value}</span>
        <span class="ov7-leg-pct">${pct}%</span>
      </div>`;
    }).join("");
  }

  // Status segmented progress bar
  function _statusBar(data, total) {
    if (!total) return '';
    return data.map(s => {
      const pct   = Math.max(1, Math.round(s.value / total * 100));
      const color = STATUS_COL[s.name] || "var(--text-secondary)";
      return `<div class="ov7-sbar-seg" data-status="${Utils.escHtml(s.name)}" style="width:${pct}%;background:${color}" title="${Utils.escHtml(s.name)}: ${s.value} (${pct}%)"></div>`;
    }).join('');
  }

  // Oldest age helper
  function _maxAge(cases) {
    let max = 0;
    cases.forEach(r => {
      const d = Utils.parseDate(r.Updated||r.Created);
      if (d) max = Math.max(max, Utils.daysDiff(d));
    });
    return max;
  }

  // Alerts panel
  function _alertsHTML(D) {
    const rows = [];

    if (D.awaitCust5d.length > 0) {
      const crit = D.awaitCust5d.length >= 5;
      rows.push(_alertRow(
        crit ? "critical" : "warn",
        `${D.awaitCust5d.length} case${D.awaitCust5d.length>1?"s":""} awaiting your feedback >5d`,
        `Oldest: ${_maxAge(D.awaitCust5d)}d · Customer follow-up required`,
        "awaitcust"
      ));
    }
    if (D.waitIBM5d.length > 0) {
      const crit = D.waitIBM5d.length >= 5;
      rows.push(_alertRow(
        crit ? "critical" : "warn",
        `${D.waitIBM5d.length} case${D.waitIBM5d.length>1?"s":""} waiting for IBM >5d`,
        `Oldest: ${_maxAge(D.waitIBM5d)}d · IBM response overdue`,
        "waitibm"
      ));
    }
    if (D.escalated.length > 0) {
      rows.push(_alertRow("critical",
        `${D.escalated.length} escalated / Sev-1 case${D.escalated.length>1?"s":""}`,
        "Immediate attention required",
        "esc"
      ));
    }
    if (D.oldestDays > 30 && D.oldestCase) {
      const crit = D.oldestDays > 90;
      rows.push(_alertRow(
        crit ? "critical" : "warn",
        `Oldest open case: ${D.oldestDays} days`,
        `${Utils.escHtml(D.oldestCase["Case Number"]||"")} · ${Utils.escHtml((D.oldestCase.Title||"").slice(0,40))}`,
        "oldest"
      ));
    }

    if (!rows.length) {
      return `<div class="ov7-alert-ok">
        <span class="text-green-c">${IC.check}</span>
        <span>All clear — no operational alerts</span>
      </div>`;
    }
    return rows.join("");
  }

  function _alertRow(level, title, sub, id) {
    const crit   = level === "critical";
    const color  = crit ? "var(--red)" : "var(--yellow)";
    const bg     = crit ? "var(--red-bg)" : "var(--yellow-bg)";
    const border = crit ? "rgba(218,30,40,.2)" : "rgba(166,120,0,.2)";
    return `<div class="ov7-alert-row" data-aid="${id}" style="background:${bg};border-color:${border}">
      <span class="ov7-alert-icon" style="color:${color}">${crit?IC.fire:IC.alert}</span>
      <div class="ov7-alert-body">
        <div class="ov7-alert-title" style="color:${color}">${title}</div>
        <div class="ov7-alert-sub">${sub}</div>
      </div>
    </div>`;
  }

  // Performance Cases panel (replaces Recent Activity)
  function _perfCasesHTML(D) {
    const newCount  = D.perfNewThisWeek.length;
    const inpCount  = D.perfInProgress.length;
    const perfIcon  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

    // Summary header with two KPI chips
    const header = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <div class="section-title" class="mb-0">${perfIcon} Performance Cases</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:var(--radius-md);background:rgba(218,30,40,.09);color:var(--red);border:1px solid rgba(218,30,40,.2)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            ${newCount} New this week
          </span>
          <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:var(--radius-md);background:rgba(15,98,254,.09);color:var(--ibm-blue-50);border:1px solid rgba(15,98,254,.2)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${inpCount} In Progress
          </span>
        </div>
      </div>`;

    // Merge: new-this-week first, then remaining in-progress, deduplicated
    const newCNs  = new Set(D.perfNewThisWeek.map(r => r["Case Number"]));
    const inpOnly = D.perfInProgress.filter(r => !newCNs.has(r["Case Number"]));
    const rows    = [...D.perfNewThisWeek, ...inpOnly];

    if (!rows.length) {
      return header + `<div class="ov7-empty" style="padding:18px 4px">No performance cases found</div>`;
    }

    const SEV_COLORS = { "1": "var(--chart-5)", "2": "var(--orange)", "3": "var(--chart-3)", "4": "var(--chart-2)" };
    const SEV_BG     = { "1": "rgba(218,30,40,.1)", "2": "rgba(224,112,0,.1)", "3": "rgba(166,120,0,.1)", "4": "rgba(25,128,56,.1)" };

    const list = rows.map(r => {
      const cn        = r["Case Number"] || "—";
      const sev       = String(r.Severity || r.severity || "");
      const sevColor  = SEV_COLORS[sev] || "var(--text-tertiary)";
      const sevBg     = SEV_BG[sev]    || "rgba(107,114,128,.1)";
      const status    = r.Status || "";
      const isClosed  = Utils.isClosed(status);
      const isNew     = newCNs.has(cn);
      const wi        = ((D.perfMeta[cn] || {}).workItem || "").trim();
      const latestWc     = ((D.perfMeta[cn] || {}).latestWc     || "").trim();
      const latestWcDate = ((D.perfMeta[cn] || {}).latestWcDate || "").trim();

      // Status pill
      const stLabel = status === "Awaiting your feedback" ? "Awaiting Feedback"
                    : status === "IBM is working"         ? "IBM Working"
                    : status === "Waiting for IBM"        ? "Waiting IBM"
                    : status.includes("Closed")           ? "Closed"
                    : status || "—";
      const stColor = status === "Awaiting your feedback" ? "var(--chart-3)"
                    : status === "IBM is working"         ? "var(--chart-1)"
                    : status === "Waiting for IBM"        ? "var(--chart-4)"
                    : status.includes("Closed")           ? "var(--text-tertiary)"
                    : "var(--text-tertiary)";
      const stBg    = status === "Awaiting your feedback" ? "rgba(166,120,0,.09)"
                    : status === "IBM is working"         ? "rgba(15,98,254,.08)"
                    : status === "Waiting for IBM"        ? "rgba(105,41,196,.08)"
                    : status.includes("Closed")           ? "rgba(107,114,128,.08)"
                    : "rgba(107,114,128,.08)";

      // Age badge
      const createdD  = Utils.parseDate(r.Created);
      const ageD      = createdD ? Utils.daysDiff(createdD) : null;
      const ageBadge  = ageD !== null
        ? `<span style="font-size:10px;color:${ageD<=7?'var(--chart-5)':'var(--text-tertiary)'};font-family:var(--font-mono)">${ageD === 0 ? "today" : ageD + "d"}</span>`
        : "";

      // New-this-week badge
      const newBadge = isNew
        ? `<span style="font-size:9px;font-weight:600;padding:1px 5px;border-radius:var(--radius-sm);background:rgba(218,30,40,.12);color:var(--red);border:1px solid rgba(218,30,40,.25);flex-shrink:0">NEW</span>`
        : "";

      // Work Item badge
      const wiBadge = wi
        ? `<span style="font-size:10px;font-family:var(--font-mono);padding:1px 6px;border-radius:var(--radius-sm);background:rgba(0,125,121,.08);color:var(--teal);border:1px solid rgba(0,125,121,.2);flex-shrink:0" title="Work Item">${Utils.escHtml(wi)}</span>`
        : `<span style="font-size:10px;padding:1px 6px;border-radius:var(--radius-sm);background:rgba(218,30,40,.06);color:var(--red);border:1px solid rgba(218,30,40,.15);flex-shrink:0">No WI</span>`;

      const title = r.Title || r.title || "";
      const owner = Utils.shortName ? Utils.shortName(r.Owner || "") : (r.Owner || "");

      const wcBadge = latestWc
        ? `<div style="font-size:var(--font-size-xs);color:var(--text-secondary);background:var(--bg-hover);border:1px solid var(--border-subtle);border-radius:var(--radius-xs);padding:3px 8px;margin-top:4px;line-height:1.4;word-break:break-word" title="Wednesday update ${Utils.escHtml(latestWcDate)}">
             <span style="font-size:9px;font-weight:600;color:var(--text-tertiary);text-transform:none;letter-spacing:.04em;margin-right:4px">💬 ${Utils.escHtml(latestWcDate)}</span>${Utils.escHtml(latestWc)}
           </div>`
        : "";

      return `<div class="ov7-act-row" style="align-items:flex-start;gap:8px;padding:8px 4px;flex-wrap:wrap">
        <!-- Left: sev dot + case number + new badge -->
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;min-width:130px">
          <span style="width:7px;height:7px;border-radius:50%;background:${sevColor};flex-shrink:0;margin-top:3px"></span>
          <span style="font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--ibm-blue-50)">${Utils.escHtml(cn)}</span>
          ${newBadge}
        </div>
        <!-- Middle: title + owner + WI badge + wednesday comment -->
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
          <span style="font-size:12px;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${Utils.escHtml(title)}">${Utils.escHtml(title) || "—"}</span>
          <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
            <span class="text-11 text-muted">${Utils.escHtml(owner)}</span>
            <span style="color:var(--text-disabled);font-size:10px">·</span>
            ${wiBadge}
          </div>
          ${wcBadge}
        </div>
        <!-- Right: severity + status + age -->
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">
          <span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-sm);background:${sevBg};color:${sevColor};font-family:var(--font-mono)">S${Utils.escHtml(sev)||"?"}</span>
          <span style="font-size:10px;font-weight:600;padding:1px 7px;border-radius:var(--radius-sm);background:${stBg};color:${stColor}">${Utils.escHtml(stLabel)}</span>
          ${ageBadge}
        </div>
      </div>`;
    }).join("");

    return header + `<div class="ov7-activity-list">${list}</div>`;
  }

  // Table meta summary row
  function _tableMeta(D) {
    const aw = D.open.filter(r=>r.Status==="Awaiting your feedback").length;
    const wi = D.open.filter(r=>r.Status==="Waiting for IBM").length;
    return `
      <span class="ov7-meta-chip">${IC.table} <b>${D.open.length}</b> Active</span>
      <span class="ov7-meta-chip" style="color:var(--yellow)">${IC.clock} Oldest <b>${D.oldestDays}d</b></span>
      <span class="ov7-meta-chip" style="color:var(--yellow)">${IC.alert} <b>${aw}</b> Awaiting Feedback</span>
      <span class="ov7-meta-chip" class="c-purple">${IC.alert} <b>${wi}</b> Awaiting IBM</span>`;
  }

  // Filter chips
  function _chipsHTML(D) {
    const configs = [
      ["all",                      "All",               D.open.length],
      ["Awaiting your feedback",   "Awaiting your Feedback", D.open.filter(r=>r.Status==="Awaiting your feedback").length],
      ["IBM is working",           "IBM Working",       D.open.filter(r=>r.Status==="IBM is working").length],
      ["Waiting for IBM",          "Waiting for IBM",   D.open.filter(r=>r.Status==="Waiting for IBM").length],
    ];
    return configs.map(([v,l,c]) =>
      `<button class="ov7-chip${_filter===v?" ov7-chip-on":""}" data-chipval="${Utils.escHtml(v)}">${l} <span class="ov7-chip-n">${c}</span></button>`
    ).join("");
  }

  // Trend slice helper
  function _trendSlice(D) {
    return _tw === 3 ? D.allTrend.slice(-3)
         : _tw === 6 ? D.allTrend.slice(-6)
         : D.allTrend;
  }

  /* ══════════════════════════════════════════════════════════
     EVENT WIRING
     ════════════════════════════════════════════════════════ */
  function _wireEvents(D) {

    // ── Trend window toggle ────────────────────────────────
    document.querySelectorAll(".ov7-tw").forEach(btn => {
      btn.addEventListener("click", () => {
        _tw = parseInt(btn.dataset.tw);
        document.querySelectorAll(".ov7-tw").forEach(b => b.classList.toggle("ov7-tw-active", b === btn));
        const slice  = _trendSlice(D);
        const tC     = slice.reduce((s,r)=>s+r.created,0);
        const tCl    = slice.reduce((s,r)=>s+r.closed,0);
        const sumEl  = document.getElementById("ov7-trend-summary");
        if (sumEl) sumEl.innerHTML = `
          <span class="ov7-ts-label">Last ${_tw}M:</span>
          <span class="ov7-ts-created">${tC} Created</span>
          <span class="ov7-ts-sep">·</span>
          <span class="ov7-ts-closed">${tCl} Closed</span>`;
        try { Charts.trendLine("chart-trend", slice, { onClick: lbl => _drillByMonth(lbl, D) }); } catch(e){}
      });
    });

    // ── Status legend click ────────────────────────────────
    document.querySelectorAll(".ov7-leg-row").forEach(row => {
      row.addEventListener("click", () => {
        const st = row.dataset.status;
        _drillTo(`Status: ${st}`, D.open.filter(r => r.Status === st));
      });
    });

    // ── Alert row click ────────────────────────────────────
    document.querySelectorAll(".ov7-alert-row").forEach(row => {
      row.addEventListener("click", () => {
        const aid = row.dataset.aid;
        const map = {
          awaitcust: [D.awaitCust5d, "Awaiting your Feedback >5d"],
          waitibm:   [D.waitIBM5d,   "Waiting for IBM >5d"],
          esc:       [D.escalated,    "Escalated Cases"],
          oldest:    [D.open,         "All Active (by Age)"],
        };
        if (map[aid]) _drillTo(map[aid][1], map[aid][0]);
      });
    });

    // ── Table filter chips ─────────────────────────────────
    function wireChips() {
      document.querySelectorAll(".ov7-chip").forEach(c => {
        c.addEventListener("click", () => {
          _filter = c.dataset.chipval;
          _applyTableFilter(D);
          const chipsEl = document.getElementById("ov7-chips");
          if (chipsEl) { chipsEl.innerHTML = _chipsHTML(D); wireChips(); }
        });
      });
    }
    wireChips();

    // ── Table search ───────────────────────────────────────
    document.getElementById("ov7-table-search")?.addEventListener("input", function() {
      _search = this.value;
      _applyTableFilter(D);
    });

    // ── Drill reset ────────────────────────────────────────
    document.getElementById("drill-reset")?.addEventListener("click", () => {
      _filter = "all";
      _search = "";
      const si = document.getElementById("ov7-table-search");
      if (si) si.value = "";
      // F20: Drill-reset shows full table when triggered
      _renderTable(D.open, "Active Team Cases");
      document.getElementById("drill-reset").style.display = "none";
      const chipsEl = document.getElementById("ov7-chips");
      if (chipsEl) { chipsEl.innerHTML = _chipsHTML(D); wireChips(); }
    });

    // F20: View all → navigates to Team Cases
    document.getElementById("ov7-view-all-btn")?.addEventListener("click", () => {
      try { if (typeof App !== "undefined") App.renderTab("team"); } catch(e) {}
    });

    // ── Quick actions ──────────────────────────────────────
    document.getElementById("ov7-btn-refresh")?.addEventListener("click", () => {
      try { if (typeof App !== "undefined" && App.refresh) App.refresh(); else render(); } catch(e) { render(); }
    });
    document.getElementById("ov7-btn-export")?.addEventListener("click", () => {
      try {
        if (typeof Export !== "undefined") Export.run(D.open);
        else if (typeof toast !== "undefined") toast("Export", "Use the Performance or Created tabs to export CSV", "info");
      } catch(e){}
    });
    document.getElementById("ov7-btn-invest")?.addEventListener("click", () => {
      document.querySelector("[data-tab='investigate']")?.click();
    });
    // F23: View Member Dashboard link
    document.getElementById("ov7-view-members-btn")?.addEventListener("click", () => {
      try { if (typeof App !== "undefined") App.renderTab("members"); } catch(e) {}
    });
  }

  /* ══════════════════════════════════════════════════════════
     TABLE HELPERS
     ════════════════════════════════════════════════════════ */
  function _applyTableFilter(D) {
    let cases = _filter === "all" ? D.open : D.open.filter(r => r.Status === _filter);
    if (_search.trim()) {
      const q = _search.toLowerCase();
      cases = cases.filter(r =>
        (r["Case Number"]||"").toLowerCase().includes(q) ||
        (r.Title||"").toLowerCase().includes(q)          ||
        (r.Owner||"").toLowerCase().includes(q)          ||
        (r.Status||"").toLowerCase().includes(q)         ||
        (r.Product||"").toLowerCase().includes(q)
      );
    }
    _renderTable(cases, _filter === "all" ? "Active Team Cases" : _filter);
  }

  function _drillTo(title, cases) {
    _renderTable(cases, title);
    document.getElementById("drill-reset").style.display = "";
    document.getElementById("tile-drill")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function _drillByMonth(label, D) {
    const cases = D.team.filter(r => {
      const d = Utils.parseDate(r.Created);
      return d && d.toLocaleDateString("en-GB", {month:"short",year:"2-digit"}) === label;
    });
    _drillTo(`Monthly: ${label}`, cases);
  }

  function _renderTable(cases, title) {
    const el = document.getElementById("drill-title");
    if (el) el.innerHTML = `${IC.table} ${Utils.escHtml(title)} <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-disabled);font-weight:400">(${cases.length})</span>`;
    try {
      const tblEl = document.getElementById("tbl-overview");
      if (_tableRef) {
        _tableRef.refresh(cases);
      } else {
        _tableRef = Table.render(tblEl, cases, { showRemind: false, showReassign: false });
      }
    } catch(e) { console.warn("Table.render:", e); }
  }

  /* ══════════════════════════════════════════════════════════
     CHART RENDERING
     ════════════════════════════════════════════════════════ */
  function _renderCharts(D) {
    const slice = _trendSlice(D);

    try {
      Charts.trendLine("chart-trend", slice, {
        onClick: lbl => _drillByMonth(lbl, D)
      });
    } catch(e) { console.warn("trendLine:", e); }

    try {
      Charts.statusDonut("chart-status", D.statusData, {
        onClick: st => _drillTo(`Status: ${st}`, D.open.filter(r => r.Status === st))
      });
    } catch(e) { console.warn("statusDonut:", e); }

    try {
      Charts.ownerBar("chart-owners", D.ownerData, {
        color: "var(--ibm-blue-30)",
        onClick: own => _drillTo(`Owner: ${Utils.shortName(own)}`, D.open.filter(r => r.Owner === own))
      });
    } catch(e) { console.warn("ownerBar:", e); }

    try {
      Charts.productBar("chart-products", D.prodData, {
        onClick: p => _drillTo(`Product: ${p}`, D.open.filter(r => (r.Product||"Unknown") === p))
      });
    } catch(e) { console.warn("productBar:", e); }
  }

  return { render };
})();
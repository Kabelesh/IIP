/* ============================================================
   js/dashboards/team.js  —  Team Cases tab
   ============================================================ */
const DashTeam = (() => {
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


  let _filterOwner  = "";
  let _filterStatus = "";
  let _filterDays   = "";
  let _tableRef     = null;

  function render() {
    const el = document.getElementById("tab-team-inner") || document.getElementById("tab-team");
    if (!el) return;

    const team    = Data.teamCases();
    const members = Data.teamMembers().slice().sort();

    const memberOpts = members.map(m =>
      `<option value="${Utils.escHtml(m)}" ${m===_filterOwner?"selected":""}>
        ${Utils.escHtml(Utils.shortName(m))}</option>`).join("");

    const statusOpts = [
      { value: "__inprogress__", label: "In Progress (All)" },
      { value: "__closed__",     label: "Closed (All)" },
      { value: "Awaiting your feedback", label: "Awaiting your feedback" },
      { value: "IBM is working",         label: "IBM is working" },
      { value: "Waiting for IBM",        label: "Waiting for IBM" },
      { value: "Closed by IBM",          label: "Closed by IBM" },
      { value: "Closed by Client",       label: "Closed by Client" },
      { value: "Closed - Archived",      label: "Closed - Archived" },
    ].map(s => `<option value="${Utils.escHtml(s.value)}" ${s.value===_filterStatus?"selected":""}>${Utils.escHtml(s.label)}</option>`)
     .join("");

    el.innerHTML = `
      <div class="kpi-row" id="team-kpi-row"></div>

      <!-- Toolbar: Send Mail button (global for visible cases) + filters -->
      <div class="filter-bar mt-5" style="align-items:flex-end">
        <div class="filter-group">
          <span class="filter-label">Owner</span>
          <select id="tf-owner" class="form-select" style="min-width:180px">
            <option value="">All Owners</option>${memberOpts}
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Status</span>
          <select id="tf-status" class="form-select" class="min-200">
            <option value="">All Statuses</option>${statusOpts}
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Last Updated ≥ (days)</span>
          <input id="tf-days" type="number" class="form-input form-input-sm"
            style="width:90px" placeholder="e.g. 5" value="${Utils.escHtml(_filterDays)}"/>
        </div>
        <button id="tf-clear" aria-label="Clear team filter" class="btn btn-danger btn-sm">Clear</button>
        <button id="tf-send-mail" aria-label="Send reminder mail" class="btn btn-primary btn-sm">✉ Send Reminder Mail</button>
        <span id="tf-count" class="text-muted" style="font-size:12px;margin-left:auto"></span>
      </div>

      <div class="tile mt-5">
        <div class="section-title">Owner vs Case Count</div>
        <div class="chart-canvas-wrap" style="height:300px"><canvas id="chart-team-owners"></canvas></div>
      </div>

      <div class="tile mt-5">
        <div class="section-title">Case Details</div>
        <div id="tbl-team"></div>
      </div>
    `;

    const filtered = filteredCases();
    renderKPIs(filtered);

    Charts.ownerBar("chart-team-owners", Utils.ownerCounts(filtered), {
      color: "var(--ibm-blue-30)",
      onClick: ownerName => {
        _filterOwner = ownerName;
        document.getElementById("tf-owner").value = ownerName;
        applyFilters();
      }
    });

    document.getElementById("tf-owner").addEventListener("change", e => { _filterOwner = e.target.value; applyFilters(); });
    document.getElementById("tf-status").addEventListener("change", e => { _filterStatus = e.target.value; applyFilters(); });
    document.getElementById("tf-days").addEventListener("input",  e => { _filterDays = e.target.value; applyFilters(); });
    document.getElementById("tf-clear").addEventListener("click", () => {
      _filterOwner=""; _filterStatus=""; _filterDays="";
      document.getElementById("tf-owner").value="";
      document.getElementById("tf-status").value="";
      document.getElementById("tf-days").value="";
      applyFilters();
    });

    // Send Reminder Mail — direct to Outlook via mailto
    // F25: confirmation dialog + 24h rate-limiting
    document.getElementById("tf-send-mail").addEventListener("click", () => {
      const visible = filteredCases();
      if (!visible.length) { alert("No cases in current view."); return; }

      // Rate-limit: one reminder send per 24 hours
      const REMIND_KEY = "remind_last_sent_ts";
      const lastSent = sessionStorage.getItem(REMIND_KEY);
      const now = Date.now();
      if (lastSent && (now - parseInt(lastSent, 10)) < 24 * 60 * 60 * 1000) {
        const hoursAgo = Math.floor((now - parseInt(lastSent, 10)) / (60 * 60 * 1000));
        const minutesAgo = Math.floor(((now - parseInt(lastSent, 10)) % (60 * 60 * 1000)) / 60000);
        alert(`Reminders were already sent ${hoursAgo}h ${minutesAgo}m ago. Please wait 24 hours before sending again to avoid spamming engineers.`);
        return;
      }

      // Confirmation dialog before sending
      const ownerSet = [...new Set(visible.map(c => c.Owner).filter(Boolean))];
      const ownerList = ownerSet.length <= 5
        ? ownerSet.join(", ")
        : ownerSet.slice(0, 5).join(", ") + ` and ${ownerSet.length - 5} more`;
      const confirmed = confirm(
        `Send reminder emails for ${visible.length} case${visible.length !== 1 ? "s" : ""} to: ${ownerList}?\n\nThis will open your mail client. Reminders can only be sent once every 24 hours.`
      );
      if (!confirmed) return;

      sessionStorage.setItem(REMIND_KEY, String(now));
      Mail.openReminderPreview(visible, "Kabelesh K");
    });

    const container = document.getElementById("tbl-team");
    _tableRef = Table.render(container, filtered, {
      showActions: true,
      showRemind: false,
      showReassign: Data.isAdmin(),
      onReassign: row => {
        Modal.showReassign(row, (caseNum, newOwner) => {
          Data.reassignCase(caseNum, newOwner);
          if (typeof DashWeeklyTracker !== "undefined") DashWeeklyTracker.enrichFromCases(Data.allCases());
          render();
        });
      },
      extraCols: [lastUpdatedDaysCol()],
      defaultSortKey: "_lastUpdDays",
      defaultSortDir: -1   // oldest (highest days) first
    });

    updateCount();
  }

  // Opens Outlook with mailto — matches screenshot format with table rows
  function lastUpdatedDaysCol() {
    return {
      key: "_lastUpdDays", label: "Last Updated (Days)", sortable: true,
      render: row => {
        const d = Utils.parseDate(row.Updated);
        const days = Utils.daysDiff(d);
        const color = days >= 10 ? "var(--red)" : days >= 5 ? "var(--yellow)" : "var(--text-tertiary)";
        return `<span style="color:${color};font-family:var(--font-mono);font-weight:600">${days}</span>`;
      },
      sortValue: row => {
        const d = Utils.parseDate(row.Updated);
        return Utils.daysDiff(d);
      }
    };
  }

  function renderKPIs(cases) {
    const row = document.getElementById("team-kpi-row");
    if (!row) return;
    const today   = new Date();
    const active  = cases.filter(r => !Utils.isClosed(r.Status));
    const inprog  = active.filter(r => r.Status==="IBM is working"||r.Status==="Waiting for IBM");
    const await_  = active.filter(r => r.Status==="Awaiting your feedback");
    const members = new Set(active.map(r=>r.Owner)).size;
    const closed7 = cases.filter(r => {
      if (!Utils.isClosed(r.Status)) return false;
      const d = Utils.parseDate(r["Closed Date"]) || Utils.parseDate(r.Updated);
      if (!d) return false;
      return (today - d) >= 0 && (today - d) <= 7 * 86400000;
    });
    const custActive = Data.customerCases().filter(r => !Utils.isClosed(r.Status)).length;
    row.innerHTML = [
      kpi("Total Cases",       active.length,             "kpi-yellow"),
      kpi("In Progress",        inprog.length,             "kpi-blue",
          "IBM Working: "+active.filter(r=>r.Status==="IBM is working").length+" · Waiting: "+active.filter(r=>r.Status==="Waiting for IBM").length),
      kpi("Awaiting Feedback",  await_.length,             "kpi-red"),
      kpi("Closed (Last 7days)",   closed7.length,            "kpi-green"),
      kpi("Active Members",     members,                   "kpi-purple"),
    ].join("");
  }

  function filteredCases() {
    return Data.teamCases().filter(r => {
      if (_filterOwner  && r.Owner !== _filterOwner) return false;
      if (_filterStatus) {
        if (_filterStatus === "__inprogress__") {
          if (Utils.isClosed(r.Status)) return false;
        } else if (_filterStatus === "__closed__") {
          if (!Utils.isClosed(r.Status)) return false;
        } else {
          if (r.Status !== _filterStatus) return false;
        }
      }
      if (_filterDays) {
        const d = Utils.parseDate(r.Updated);
        if (Utils.daysDiff(d) < parseInt(_filterDays)) return false;
      }
      return true;
    });
  }

  function applyFilters() {
    const cases = filteredCases();
    renderKPIs(cases);
    // Redraw histogram with filtered data
    Charts.ownerBar("chart-team-owners", Utils.ownerCounts(cases), {
      color: "var(--ibm-blue-30)",
      onClick: ownerName => {
        _filterOwner = ownerName;
        document.getElementById("tf-owner").value = ownerName;
        applyFilters();
      }
    });
    if (_tableRef) _tableRef.refresh(cases);
    updateCount();
  }

  function updateCount() {
    const el = document.getElementById("tf-count");
    if (el) el.textContent = `${filteredCases().length} cases`;
  }

  function kpi(label, value, cls="", sub="") {
    return `<div class="kpi-card ${cls}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      ${sub ? `<div class="text-meta-top">${sub}</div>` : ""}
    </div>`;
  }

  return {
    render,
    // F24: Stable method for global search to pre-fill team search without fragile DOM query
    setSearch: val => { if (_tableRef) _tableRef.setSearch(val); }
  };

})();/* ============================================================
   js/dashboards/members.js  —  Team Member Dashboard
   ============================================================ */
const DashMembers = (() => {
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


  let _selectedMember = "";
  let _sortKey = "active";  // default: sort by Active desc
  let _sortDir = -1;        // -1 = descending

  /* ── KPI card helper ─────────────────────────────────── */
  function kpi(label, value, cls = "", sub = "") {
    return `<div class="kpi-card ${cls}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      ${sub ? `<div class="text-11 text-muted mt-6">${sub}</div>` : ""}
    </div>`;
  }

  /* ── Main render ─────────────────────────────────────── */
  function render() {
    const el = document.getElementById("tab-members");
    if (!el) return;

    const members = Data.teamMembers().slice().sort();
    const teamAll = Data.teamCases();
    const stats   = members.map(m => getMemberStats(m, teamAll));

    const activeTeam = teamAll.filter(r => !Utils.isClosed(r.Status));
    const awaitAll   = teamAll.filter(r => r.Status === "Awaiting your feedback");
    const closed7d   = teamAll.filter(r => {
      if (!Utils.isClosed(r.Status)) return false;
      const d = Utils.parseDate(r.Updated || r.Created);
      return d && (Utils.today() - d) / 86400000 <= 7;
    });
    const memberOpts = members.map(m =>
      `<option value="${Utils.escHtml(m)}" ${m === _selectedMember ? "selected" : ""}>${Utils.escHtml(Utils.shortName(m))}</option>`
    ).join("");

    el.innerHTML = `
      <!-- ── Top KPI row ─────────────────────── -->
      <div class="kpi-row" id="members-kpi-row">
        ${kpi("Team Members",       members.length,     "")}
        ${kpi("Active Cases",       activeTeam.length,  "kpi-blue")}
        ${kpi("Open Cases",         activeTeam.length,  "kpi-yellow")}
        ${kpi("Awaiting Feedback",  awaitAll.length,    "kpi-red")}
        ${kpi("Closed (Last 7days)", closed7d.length,   "kpi-green")}
      </div>

      <!-- ── Member Selector ─────────────────── -->
      <div class="filter-bar mt-5">
        <div class="filter-group">
          <span class="filter-label">Select Team Member</span>
          <select id="member-select" class="form-select" style="min-width:240px">
            <option value="">— All Members Overview —</option>${memberOpts}
          </select>
        </div>
        <button id="member-clear" aria-label="Clear member filter" class="btn btn-ghost btn-sm">Show All</button>
      </div>

      <!-- ── Overview / Detail ───────────────── -->
      <div id="members-content" class="mt-5"></div>
    `;

    document.getElementById("member-select").addEventListener("change", e => {
      _selectedMember = e.target.value;
      renderContent(teamAll, stats);
    });
    document.getElementById("member-clear").addEventListener("click", () => {
      _selectedMember = "";
      document.getElementById("member-select").value = "";
      renderContent(teamAll, stats);
    });

    renderContent(teamAll, stats);
  }

  /* ── Stats calculator ────────────────────────────────── */
  function getMemberStats(member, teamAll) {
    const cases   = teamAll.filter(r => r.Owner === member);
    const open    = cases.filter(r => !Utils.isClosed(r.Status));
    const closed  = cases.filter(r =>  Utils.isClosed(r.Status));
    const closed7d = closed.filter(r => {
      const d = Utils.parseDate(r.Updated || r.Created);
      return d && (Utils.today() - d) / 86400000 <= 7;
    }).length;
    const await_   = cases.filter(r => r.Status === "Awaiting your feedback");
    const inprog   = cases.filter(r => r.Status === "IBM is working" || r.Status === "Waiting for IBM");
    const perfNums = Data.getPerfCaseNums();
    const perf     = cases.filter(r => perfNums.includes(r["Case Number"]));
    const stale    = open.filter(r => Utils.daysDiff(Utils.parseDate(r.Updated)) >= 5);
    const avgDays  = open.length > 0
      ? Math.round(open.reduce((sum, r) => sum + Utils.daysDiff(Utils.parseDate(r.Updated)), 0) / open.length)
      : 0;

    // Workload health: 0 (worst) – 100 (best)
    const health = Math.max(0, Math.min(100,
      Math.round(100 - (stale.length / Math.max(open.length,1)) * 60
                     - (await_.length / Math.max(open.length,1)) * 30)
    ));

    const sorted = [...cases].sort((a, b) => (Utils.parseDate(b.Created)||0) - (Utils.parseDate(a.Created)||0));
    return { member, cases, open, closed, closed7d, await_, inprog, perf, stale, avgDays, health, latest: sorted[0] };
  }

  function renderContent(teamAll, stats) {
    const container = document.getElementById("members-content");
    if (!container) return;
    if (_selectedMember) renderMemberDetail(_selectedMember, teamAll);
    else                  renderAllMembersGrid(stats);
  }

  /* ── Overview Table ──────────────────────────────────── */
  function renderAllMembersGrid(stats) {
    const container = document.getElementById("members-content");

    // Hide members with zero activity
    const active = stats.filter(s =>
      s.cases.length > 0 || s.open.length > 0 || s.closed7d > 0 ||
      s.await_.length > 0 || s.inprog.length > 0 || s.perf.length > 0 || s.stale.length > 0
    );

    const SORT_FN = {
      rank:    s => s.open.length,
      member:  s => Utils.shortName(s.member).toLowerCase(),
      active:  s => s.open.length,
      open:    s => s.open.length,
      closed7d:s => s.closed7d,
      await:   s => s.await_.length,
      inprog:  s => s.inprog.length,
      perf:    s => s.perf.length,
      stale:   s => s.stale.length,
      avgdays: s => s.avgDays,
      health:  s => s.health,
    };
    const fn = SORT_FN[_sortKey] || SORT_FN.active;
    const sorted = [...active].sort((a, b) => {
      // Always push members with 0 active cases to the bottom
      const aActive = a.open.length, bActive = b.open.length;
      if (aActive === 0 && bActive > 0) return 1;
      if (bActive === 0 && aActive > 0) return -1;
      const av = fn(a), bv = fn(b);
      if (typeof av === "string") return av < bv ? -_sortDir : av > bv ? _sortDir : 0;
      return (av - bv) * _sortDir;
    });

    function thSort(key, label, tip) {
      const cur = _sortKey === key;
      const arrow = cur ? (_sortDir === -1 ? " ↓" : " ↑") : "";
      const tipAttr = tip ? ` title="${tip}"` : "";
      return `<th class="sort-th" data-sort="${key}"
        style="cursor:pointer;user-select:none;white-space:nowrap${cur ? ";background:var(--ibm-blue-10)" : ""}"
        ${tipAttr}>${label}${arrow}</th>`;
    }

    // Compute team averages for mini-bars
    const maxOpen  = Math.max(...active.map(s => s.open.length), 1);
    const maxStale = Math.max(...active.map(s => s.stale.length), 1);

    let html = `
      <div class="tile">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div class="section-title" class="mb-0">Team Performance Overview
            <span style="font-size:11px;font-weight:400;color:var(--text-tertiary);margin-left:8px">${active.length} members</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <input id="members-search" type="text" placeholder="Search member..."
              style="border:1px solid var(--border-subtle);border-radius:var(--radius-xs);padding:5px 10px;font-size:12px;
                outline:none /* focus-visible handles focus ring */;background:var(--bg-layer);color:var(--text-primary);width:200px"
              onfocus="this.style.borderColor='var(--ibm-blue-30)'" onblur="this.style.borderColor='var(--border-subtle)'"/>
            <button class="btn btn-secondary btn-sm" id="members-export" aria-label="Export members to Excel"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
          </div>
        </div>
        <div class="data-table-wrap" style="border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
          <table class="data-table" id="members-table">
            <thead><tr>
              ${thSort("rank",    "#")}
              ${thSort("member",  "Member")}
              ${thSort("active",  "Active", "Open (non-closed) cases")}
              ${thSort("open",    "Open")}
              ${thSort("closed7d","Closed (7d)")}
              ${thSort("await",   "Awaiting Feedback")}
              ${thSort("inprog",  "In Progress")}
              ${thSort("perf",    "Perf Cases", "Performance-tagged cases")}
              ${thSort("stale",   "Stale (5d+)")}
              ${thSort("avgdays", "Avg Days")}
            </tr></thead>
            <tbody id="members-tbody">`;

    sorted.forEach((s, i) => {
      // Inline mini-bar widths
      const openPct  = Math.round((s.open.length  / maxOpen)  * 40);
      const stalePct = Math.round((s.stale.length / maxStale) * 40);

      // Row alert: dim if no open cases
      const rowStyle = s.open.length === 0 ? "opacity:.55;" : "";

      html += `
        <tr data-member="${Utils.escHtml(s.member)}" style="${rowStyle}">
          <td class="text-muted" style="font-size:12px;width:32px">${i + 1}</td>
          <td style="font-weight:500;white-space:nowrap;min-width:160px">
            <span class="member-detail-btn" aria-label="View member details" data-member="${Utils.escHtml(s.member)}"
              style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;
                color:var(--ibm-blue-50);text-decoration:underline;text-underline-offset:2px">
              <span class="member-avatar">${Utils.escHtml(Utils.shortName(s.member).split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase())}</span>
              ${Utils.escHtml(Utils.shortName(s.member))}
            </span>
          </td>
          <td class="col-stat-blue">
            <div class="row-6">
              <span>${s.open.length}</span>
              ${openPct > 0 ? `<div style="width:${openPct}px;height:4px;background:var(--ibm-blue-30);border-radius:2px;flex-shrink:0"></div>` : ""}
            </div>
          </td>
          <td class="col-stat-yellow">${s.open.length}</td>
          <td class="col-stat-green">${s.closed7d}</td>
          <td class="col-stat-await">${s.await_.length > 0 ? `<span style="color:var(--yellow);font-weight:600">${s.await_.length}</span>` : `<span class="text-muted">0</span>`}</td>
          <td class="col-stat-blue">${s.inprog.length}</td>
          <td class="col-stat-red">${s.perf.length || `<span class="text-muted">0</span>`}</td>
          <td class="col-stat-stale">
            <div class="row-6">
              ${s.stale.length > 0
                ? `<span style="color:var(--red);font-weight:600">${s.stale.length}</span>
                   ${stalePct > 0 ? `<div style="width:${stalePct}px;height:4px;background:rgba(218,30,40,.3);border-radius:2px;flex-shrink:0"></div>` : ""}`
                : `<span class="text-muted">0</span>`}
            </div>
          </td>
          <td class="col-stat-days" style="color:${s.avgDays >= 10 ? "var(--red)" : s.avgDays >= 5 ? "var(--yellow)" : "var(--text-tertiary)"}">${s.avgDays}d</td>
        </tr>`;
    });

    html += `</tbody></table></div>
      <div style="padding:8px 12px;font-size:11px;color:var(--text-tertiary);border-top:1px solid var(--border-subtle);margin-top:4px">
        Click any column header to sort · Click member name to view details
      </div>
    </div>`;

    // Charts
    html += `
      <div class="grid-2 mt-5">
        <div class="tile"><div class="section-title">Active Cases by Member</div>
          <div class="chart-canvas-wrap" class="chart-lg"><canvas id="chart-members-open"></canvas></div></div>
        <div class="tile"><div class="section-title">Stale Cases by Member</div>
          <div class="chart-canvas-wrap" class="chart-lg"><canvas id="chart-members-stale"></canvas></div></div>
      </div>
      <div class="grid-2 mt-5">
        <div class="tile"><div class="section-title">Total Cases by Member</div>
          <div class="chart-canvas-wrap" class="chart-lg"><canvas id="chart-members-total"></canvas></div></div>
        <div class="tile"><div class="section-title">Awaiting Feedback by Member</div>
          <div class="chart-canvas-wrap" class="chart-lg"><canvas id="chart-members-await"></canvas></div></div>
      </div>`;

    container.innerHTML = html;

    // Column sorting
    container.querySelectorAll(".sort-th").forEach(th => {
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (_sortKey === key) _sortDir *= -1;
        else { _sortKey = key; _sortDir = -1; }
        renderAllMembersGrid(stats);
      });
    });

    // Search filter
    document.getElementById("members-search")?.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll("#members-tbody tr").forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });

    // Export
    document.getElementById("members-export")?.addEventListener("click", () => exportMembersTable(sorted));

    // Row click → member detail
    // Row click → member detail (remove previous listener to prevent accumulation)
    if (container._memberClickHandler) {
      container.removeEventListener("click", container._memberClickHandler);
    }
    container._memberClickHandler = function(e) {
      const btn = e.target.closest(".member-detail-btn");
      if (!btn) return;
      _selectedMember = btn.dataset.member;
      document.getElementById("member-select").value = _selectedMember;
      renderMemberDetail(_selectedMember, Data.teamCases());
    };
    container.addEventListener("click", container._memberClickHandler);

    renderMembersCharts(sorted);
  }

  /* ── Charts ──────────────────────────────────────────── */
  function renderMembersCharts(stats) {
    const clickMember = name => {
      const s = stats.find(s => s.member === name);
      if (!s) return;
      _selectedMember = name;
      document.getElementById("member-select").value = name;
      renderMemberDetail(name, Data.teamCases());
    };

    Charts.ownerBar("chart-members-open",
      stats.filter(s => s.open.length > 0).map(s => ({ name: Utils.shortName(s.member), fullName: s.member, count: s.open.length })),
      { color: "var(--chart-1)", onClick: clickMember });

    Charts.ownerBar("chart-members-stale",
      stats.filter(s => s.stale.length > 0).map(s => ({ name: Utils.shortName(s.member), fullName: s.member, count: s.stale.length })),
      { color: "var(--chart-5)" });

    Charts.ownerBar("chart-members-total",
      stats.map(s => ({ name: Utils.shortName(s.member), fullName: s.member, count: s.cases.length })),
      { color: "var(--chart-4)" });

    Charts.ownerBar("chart-members-await",
      stats.filter(s => s.await_.length > 0).map(s => ({ name: Utils.shortName(s.member), fullName: s.member, count: s.await_.length })),
      { color: "var(--chart-3)" });
  }

  /* ── Member Detail View ──────────────────────────────── */
  function renderMemberDetail(member, teamAll) {
    const container = document.getElementById("members-content");
    const s         = getMemberStats(member, teamAll);
    const trend     = Utils.monthlyTrend(s.cases);

    const initials  = Utils.shortName(member).split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase();
    const email     = Data.teamEmails()[member] || "";

    // Status distribution
    const statusMap = {};
    s.cases.forEach(r => { statusMap[r.Status] = (statusMap[r.Status]||0)+1; });
    const statusData = Object.entries(statusMap).map(([name,value]) => ({ name, value }));


    container.innerHTML = `
      <!-- ── Member Header Card ── -->
      <div class="tile" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;border-left:4px solid var(--ibm-blue-50);padding:20px">
        <div class="member-avatar member-avatar-lg">${initials}</div>
        <div class="flex-1-0">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span style="font-size:20px;font-weight:700;color:var(--text-primary)">${Utils.escHtml(Utils.shortName(member))}</span>
          </div>
          ${email ? `<a href="mailto:${Utils.escHtml(email)}" style="font-size:12px;color:var(--ibm-blue-50);text-decoration:none;margin-top:2px;display:inline-block"
            onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${Utils.escHtml(email)}</a>` : ""}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <button id="back-to-all" aria-label="Back to all members" class="btn btn-ghost btn-sm">← All Members</button>
        </div>
      </div>

      <!-- ── KPI Strip ── -->
      <div class="kpi-row mt-5">
        ${kpi("Active Cases",       s.open.length,    "kpi-blue",   `of ${s.cases.length} total`)}
        ${kpi("Closed (Last 7d)",   s.closed7d,       "kpi-green")}
        ${kpi("Awaiting Feedback",  s.await_.length,  s.await_.length > 0 ? "kpi-red" : "kpi-green")}
        ${kpi("In Progress",        s.inprog.length,  "kpi-blue")}
        ${kpi("Perf Cases",         s.perf.length,    s.perf.length > 0 ? "kpi-red" : "")}
        ${kpi("Stale (5d+)",        s.stale.length,   s.stale.length > 0 ? "kpi-red" : "")}
        ${kpi("Avg Days Open",      s.avgDays + "d",  s.avgDays >= 10 ? "kpi-red" : s.avgDays >= 5 ? "kpi-yellow" : "")}
      </div>

      <!-- ── Charts ── -->
      <div class="grid-2 mt-5">
        <div class="tile">
          <div class="section-title">Monthly Case Trend</div>
          <div class="chart-canvas-wrap" class="chart-sm"><canvas id="chart-member-trend"></canvas></div>
        </div>
        <div class="tile">
          <div class="section-title">Cases by Status</div>
          <div class="chart-canvas-wrap" class="chart-sm"><canvas id="chart-member-status"></canvas></div>
        </div>
      </div>

      <!-- ── Stale Cases ── -->
      ${s.stale.length > 0 ? `
      <div class="tile mt-5" style="border-left:4px solid var(--red)">
        <div class="section-title">⚠ Stale Cases — Not Updated 5+ Days</div>
        <div id="tbl-member-stale"></div>
      </div>` : ""}

      <!-- ── Awaiting Feedback ── -->
      ${s.await_.length > 0 ? `
      <div class="tile mt-5" style="border-left:4px solid var(--yellow)">
        <div class="section-title">⏳ Awaiting Feedback Cases</div>
        <div id="tbl-member-await"></div>
      </div>` : ""}

      <!-- ── All Cases ── -->
      <div class="tile mt-5">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div class="section-title" class="mb-0">All Cases
            <span style="font-size:11px;font-weight:400;color:var(--text-tertiary);margin-left:6px">${s.cases.length} total</span>
          </div>
        </div>
        <div id="tbl-member-all"></div>
      </div>
    `;

    document.getElementById("back-to-all")?.addEventListener("click", () => {
      _selectedMember = "";
      document.getElementById("member-select").value = "";
      render();
    });

    Charts.trendLine("chart-member-trend", trend);
    Charts.statusDonut("chart-member-status", statusData);

    const extraCols = [{
      key: "_days", label: "Days Stale", sortable: true,
      render: row => {
        const days  = Utils.daysDiff(Utils.parseDate(row.Updated));
        const color = days >= 10 ? "var(--red)" : days >= 5 ? "var(--yellow)" : "var(--text-tertiary)";
        return `<span style="color:${color};font-family:var(--font-mono);font-weight:600">${days}d</span>`;
      },
      sortValue: row => Utils.daysDiff(Utils.parseDate(row.Updated))
    }];

    if (s.stale.length > 0)  Table.render(document.getElementById("tbl-member-stale"),  s.stale,  { showActions: false, extraCols });
    if (s.await_.length > 0) Table.render(document.getElementById("tbl-member-await"), s.await_, { showActions: false, extraCols });
    Table.render(document.getElementById("tbl-member-all"), s.cases, { showActions: false, extraCols });
  }

  /* ── Export ──────────────────────────────────────────── */
  function exportMembersTable(stats) {
    const headers = ["Member","Total","Active","Closed (7d)","Awaiting Feedback","In Progress","Perf Cases","Stale (5d+)","Avg Days Open"];
    const rows = stats.map(s => [
      Utils.shortName(s.member), s.cases.length, s.open.length, s.closed7d,
      s.await_.length, s.inprog.length, s.perf.length, s.stale.length, s.avgDays
    ].map(v => `"${v}"`).join(","));
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `team_performance_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  return { render };
})();


/* ============================================================
   DashTeamCombined — tabs: Team Cases | Member Dashboard
   Registered in getDash as "team". Sidebar nav item "members"
   can be removed from index.html / app.js getDash map.
   ============================================================ */
const DashTeamCombined = (() => {

  let _sub = 'team';

  const _style = key => {
    const a = _sub === key;
    return `padding:10px 16px;font-size:13px;font-weight:${a?700:500};border:none;` +
      `border-bottom:2px solid ${a?'var(--ibm-blue-50)':'transparent'};` +
      `background:none;color:${a?'var(--ibm-blue-50)':'var(--text-secondary)'};` +
      `cursor:pointer;font-family:var(--font-sans);margin-bottom:-1px;` +
      `transition:color var(--transition-fast),border-color var(--transition-fast)`;
  };

  function _wireBar() {
    const bar = document.getElementById('tab-team-bar');
    if (!bar) return;
    bar.innerHTML = `
      <button id="tsc-btn-team"    style="${_style('team'   )}">👥 Team Cases</button>
      <button id="tsc-btn-members" style="${_style('members')}">📊 Member Dashboard</button>`;
    document.getElementById('tsc-btn-team').addEventListener('click', () => _switch('team'));
    document.getElementById('tsc-btn-members').addEventListener('click', () => _switch('members'));
  }

  function _switch(key) {
    if (_sub === key) return;
    _sub = key;
    document.getElementById('tsc-btn-team').style.cssText    = _style('team');
    document.getElementById('tsc-btn-members').style.cssText = _style('members');
    _showActive();
  }

  function _showActive() {
    const outer   = document.getElementById('tab-team');
    const inner   = document.getElementById('tab-team-inner');
    const members = document.getElementById('tab-members');
    if (!inner || !members) return;
    if (outer) outer.style.display = 'flex';
    if (_sub === 'team') {
      inner.style.display   = 'block';
      members.style.display = 'none';
      DashTeam.render();
    } else {
      members.style.display = 'block';
      inner.style.display   = 'none';
      DashMembers.render();
    }
  }

  function render() {
    // Ensure outer tab-team uses flex for column layout (App.renderTab sets display:block via .active)
    const outer = document.getElementById('tab-team');
    if (outer) outer.style.display = 'flex';
    _wireBar();
    _showActive();
  }

  return {
    render,
    setSearch: val => { if (_sub === 'team') DashTeam.setSearch?.(val); }
  };
})();


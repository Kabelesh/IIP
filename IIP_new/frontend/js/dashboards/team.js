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
    const el = document.getElementById("tab-team");
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

})();
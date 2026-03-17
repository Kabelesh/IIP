/* ============================================================
   js/dashboards/closed.js  —  Closed Cases + Created Cases
   ============================================================ */

/* ── Shared CSS variable resolver (used by DashClosed and DashCreated) ── */
function _cssClr(v) {
  try { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v; }
  catch(e) { return v; }
}

const DashClosed = (() => {
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

  // Resolve CSS variable for Chart.js canvas context
  /* _cssClr defined at module scope below — accessible to both DashClosed and DashCreated */


  let _year = "", _month = "", _fromDate = "", _toDate = "", _lastDays = "";
  let _ownerFilter = "";
  let _tableRef = null;

  function render() {
    const el = document.getElementById("tab-closed");
    if (!el) return;
    _tableRef = null; // reset so drawAll creates a fresh table instance
    el.innerHTML = `
      <div class="kpi-row" id="closed-kpi-row"></div>
      <div class="filter-bar mt-5" style="flex-wrap:wrap;gap:8px">
        ${yearSelect("cl-year",_year)} ${monthSelect("cl-month",_month)}
        <div class="filter-group">
          <span class="filter-label">From</span>
          <input id="cl-from" type="date" class="form-input form-input-sm" class="w-140" value="${_fromDate}"/>
        </div>
        <div class="filter-group">
          <span class="filter-label">To</span>
          <input id="cl-to" type="date" class="form-input form-input-sm" class="w-140" value="${_toDate}"/>
        </div>
        <div class="filter-group">
          <span class="filter-label">Last N Days</span>
          <input id="cl-lastdays" type="number" class="form-input form-input-sm" class="w-80" placeholder="e.g. 30" value="${_lastDays}"/>
        </div>
        <button id="cl-clear" class="btn btn-danger btn-sm" class="align-end">Clear</button>
        <span id="cl-count" class="text-muted" style="align-self:flex-end;font-size:12px"></span>
      </div>

      <!-- Charts grid -->
      <div class="grid-3 mt-5" id="cl-charts-grid">
        <div class="tile">
          <div class="section-title" class="mt-0">Monthly Closed</div>
          <div class="chart-canvas-wrap" class="chart-md"><canvas id="chart-closed-monthly"></canvas></div>
        </div>
        <div class="tile">
          <div class="section-title" class="mt-0">Weekly Closed (Last 12w)</div>
          <div class="chart-canvas-wrap" class="chart-md"><canvas id="chart-closed-weekly"></canvas></div>
        </div>
        <div class="tile">
          <div class="section-title" class="mt-0">Yearly Closed</div>
          <div class="chart-canvas-wrap" class="chart-md"><canvas id="chart-closed-yearly"></canvas></div>
        </div>
      </div>

      <div class="tile mt-5">
        <div class="section-title">Owner vs Closed Cases</div>
        <div class="chart-canvas-wrap" style="height:350px"><canvas id="chart-closed-owners"></canvas></div>
      </div>
      <div class="tile mt-5">
        <div class="section-title">Closed Cases</div>
        <div id="tbl-closed"></div>
      </div>
    `;
    bindClosedFilters();
    drawAll();
  }

  function filtered() {
    const today = new Date();
    return Data.closedTeamCases().filter(r => {
      const d = Utils.parseDate(r["Closed Date"]) || Utils.parseDate(r.Updated);
      if (_year  && (!d || String(d.getFullYear()) !== _year)) return false;
      if (_month && (!d || String(d.getMonth()+1).padStart(2,"0") !== _month)) return false;
      if (_fromDate && (!d || d < new Date(_fromDate))) return false;
      if (_toDate   && (!d || d > new Date(_toDate + "T23:59:59"))) return false;
      if (_lastDays && _lastDays > 0) {
        const cutoff = new Date(today); cutoff.setDate(today.getDate() - parseInt(_lastDays, 10));
        if (!d || d < cutoff) return false;
      }
      return true;
    });
  }

  function drawAll(ownerFilter) {
    if (ownerFilter !== undefined) _ownerFilter = ownerFilter;
    const cases = filtered();
    const tableData = _ownerFilter ? cases.filter(r => r.Owner === _ownerFilter) : cases;

    renderClosedKPIs(cases);

    // When Last N Days is active: auto-populate From/To/Year/Month to reflect the range
    const clLastDaysMode = !!(_lastDays && parseInt(_lastDays,10) > 0);
    const clGrid = document.getElementById("cl-charts-grid");
    if (clGrid) clGrid.style.display = clLastDaysMode ? "none" : "";
    if (clLastDaysMode) {
      const n = parseInt(_lastDays, 10);
      const toD   = new Date();
      const fromD = new Date(); fromD.setDate(toD.getDate() - n);
      const pad = v => String(v).padStart(2,"0");
      const toStr   = toD.getFullYear()+"-"+pad(toD.getMonth()+1)+"-"+pad(toD.getDate());
      const fromStr = fromD.getFullYear()+"-"+pad(fromD.getMonth()+1)+"-"+pad(fromD.getDate());
      const fromEl = document.getElementById("cl-from"); if (fromEl) fromEl.value = fromStr;
      const toEl   = document.getElementById("cl-to");   if (toEl)   toEl.value   = toStr;
      // Set year to the from-date year; set month to from-date month
      const yrEl = document.getElementById("cl-year");
      if (yrEl) yrEl.value = String(fromD.getFullYear());
      const moEl = document.getElementById("cl-month");
      if (moEl) moEl.value = pad(fromD.getMonth()+1);
    }

    if (!clLastDaysMode) { drawTrendCharts(cases); }

    Charts.ownerBar("chart-closed-owners", Utils.ownerCounts(cases), {
      color: _cssClr("--chart-2"),
      onClick: name => {
        drawAll(name === _ownerFilter ? "" : name);
        document.getElementById("tbl-closed")?.scrollIntoView({ behavior:"smooth", block:"start" });
      }
    });

    const tblClosedEl = document.getElementById("tbl-closed");
    if (_tableRef) {
      _tableRef.refresh(tableData);
    } else {
      _tableRef = Table.render(tblClosedEl, tableData, {
      showActions: false,
      defaultSortKey: "Closed Date",
      defaultSortDir: 1,
      columns: [
        { key:"Case Number", label:"Case Number", class:"col-case-num",
          render: row => {
            const perfIcon = (typeof Data !== "undefined" && Data.isMarkedPerformance && Data.isMarkedPerformance(row["Case Number"]))
              ? `<span title="Performance Case" style="color:var(--red);margin-right:4px;display:inline-flex;align-items:center;vertical-align:middle"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>`
              : "";
            const cn = Utils.escHtml(row["Case Number"]);
            return `${perfIcon}<span class="case-number-copy" data-cn="${cn}" title="Click to copy" style="cursor:pointer;color:#2563eb;font-weight:600;font-family:var(--font-mono)">${cn}</span>`;
          }},
        { key:"Owner", label:"Owner", class:"col-owner",
          render: row => Utils.escHtml(Utils.shortName(row.Owner)) },
        { key:"Status", label:"Status",
          render: row => Utils.statusBadge(row.Status) },
        { key:"Product", label:"Product", class:"col-product",
          render: row => `<span title="${Utils.escHtml(row.Product)}">${Utils.escHtml(row.Product)}</span>` },
        { key:"Customer number", label:"Customer #", class:"col-date text-mono",
          render: row => Utils.escHtml(row["Customer number"] || "—") },
        { key:"Closed Date", label:"Closed Date", class:"col-date",
          sortValue: row => { const d = Utils.parseDate(row["Closed Date"]); return d ? d.getTime() : 0; },
          render: row => Utils.fmtDateShort(row["Closed Date"]) },
        { key:"Updated", label:"Updated", class:"col-stale",
          render: row => {
            const d    = Utils.parseDate(row.Updated);
            const days = Utils.daysDiff(d);
            return `<span style="color:${days>=5?_cssClr("--red"):_cssClr("--text-tertiary")}">${Utils.fmtDateShort(row.Updated)}</span>`
                 + (days >= 5 ? ` <span class="stale-days">(+${days}d)</span>` : "");
          }},
        { key:"Severity", label:"Severity", class:"col-sev",
          render: row => {
            const s = String(row.Severity||"").trim();
            const col = s.startsWith("1") ? _cssClr("--red") : s.startsWith("2") ? _cssClr("--orange") : s.startsWith("3") ? _cssClr("--yellow") : _cssClr("--text-tertiary");
            return `<span style="font-weight:700;color:${col};font-family:var(--font-mono)">${Utils.escHtml(s||"—")}</span>`;
          }},
        { key:"Age", label:"Age (days)", class:"col-age text-mono",
          render: row => {
            const a = parseInt(row.Age||"0", 10);
            return `<span style="font-family:var(--font-mono);color:${a>30?_cssClr("--red"):a>14?_cssClr("--orange"):_cssClr("--text-tertiary")}">${a > 0 ? a + "d" : "—"}</span>`;
          }},
        { key:"Title", label:"Title", class:"col-title", sortable:false,
          render: row => `<span title="${Utils.escHtml(row.Title)}">${Utils.escHtml(row.Title)}</span>` }
      ]
    });
    }
    const cnt = document.getElementById("cl-count");
    if (cnt) cnt.textContent = `${cases.length} cases`;
  }

  function drawTrendCharts(cases) {
    // Monthly trend
    const byMonth = {};
    const byWeek  = {};
    const byYear  = {};

    cases.forEach(r => {
      const d = Utils.parseDate(r["Closed Date"]) || Utils.parseDate(r.Updated);
      if (!d) return;

      const mKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      byMonth[mKey] = (byMonth[mKey] || 0) + 1;

      // ISO week
      const wKey = isoWeekKey(d);
      byWeek[wKey] = (byWeek[wKey] || 0) + 1;

      const yKey = String(d.getFullYear());
      byYear[yKey] = (byYear[yKey] || 0) + 1;
    });

    // Monthly — last 18 months
    const allMonths = Object.keys(byMonth).sort().slice(-18);
    drawBarChart("chart-closed-monthly", allMonths.map(k => k.slice(5) + "/" + k.slice(0,4)), allMonths.map(k => byMonth[k]), _cssClr("--chart-1"),
      label => {
        // label is "MM/YYYY" — convert to filter values
        const [mm, yyyy] = label.split("/");
        _fromDate = yyyy+"-"+mm+"-01";
        const lastDay = new Date(parseInt(yyyy), parseInt(mm), 0).getDate();
        _toDate = yyyy+"-"+mm+"-"+String(lastDay).padStart(2,"0");
        _year = yyyy; _month = mm; _lastDays = "";
        ["cl-year","cl-month","cl-from","cl-to","cl-lastdays"].forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          if (id==="cl-year") el.value = yyyy;
          else if (id==="cl-month") el.value = mm;
          else if (id==="cl-from") el.value = _fromDate;
          else if (id==="cl-to") el.value = _toDate;
          else el.value = "";
        });
        _ownerFilter = ""; drawAll();
        document.getElementById("tbl-closed")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });

    // Weekly — last 12 weeks
    const allWeeks = Object.keys(byWeek).sort().slice(-12);
    drawBarChart("chart-closed-weekly", allWeeks.map(k => k.replace("W","W")), allWeeks.map(k => byWeek[k]), _cssClr("--chart-6"),
      label => {
        // label is "WNN" — find matching week key
        const wkKey = allWeeks.find(k => k.endsWith("-"+label.replace("W","W")));
        if (!wkKey) return;
        // compute Sunday-based week start/end from ISO week key
        const [yr, wn] = wkKey.split("-W");
        const jan1 = new Date(parseInt(yr), 0, 1);
        const startOfWk = new Date(jan1);
        startOfWk.setDate(jan1.getDate() + (parseInt(wn)-1)*7 - jan1.getDay());
        const endOfWk = new Date(startOfWk); endOfWk.setDate(startOfWk.getDate()+6);
        const fmt = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
        _fromDate = fmt(startOfWk); _toDate = fmt(endOfWk);
        _year = ""; _month = ""; _lastDays = "";
        ["cl-year","cl-month","cl-lastdays"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
        const fromEl=document.getElementById("cl-from"); if(fromEl) fromEl.value=_fromDate;
        const toEl=document.getElementById("cl-to"); if(toEl) toEl.value=_toDate;
        _ownerFilter = ""; drawAll();
        document.getElementById("tbl-closed")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });

    // Yearly
    const allYears = Object.keys(byYear).sort();
    drawBarChart("chart-closed-yearly", allYears, allYears.map(k => byYear[k]), _cssClr("--chart-4"),
      label => {
        _year = label; _month = ""; _fromDate = ""; _toDate = ""; _lastDays = "";
        ["cl-year","cl-month","cl-from","cl-to","cl-lastdays"].forEach(id => {
          const el=document.getElementById(id);
          if (!el) return;
          el.value = id==="cl-year" ? label : "";
        });
        _ownerFilter = ""; drawAll();
        document.getElementById("tbl-closed")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });
  }

  function isoWeekKey(d) {
    const date = new Date(d);
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${date.getFullYear()}-W${String(weekNum).padStart(2,"0")}`;
  }

  function drawBarChart(canvasId, labels, data, color, onBarClick) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (typeof Chart === "undefined") {
      setTimeout(() => drawBarChart(canvasId, labels, data, color, onBarClick), 200);
      return;
    }
    try {
      const existing = Chart.getChart ? Chart.getChart(canvas) : null;
      if (existing) existing.destroy();
    } catch(e) {}
    new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{ data, backgroundColor: color, hoverBackgroundColor: color, borderRadius: 3 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cursor: onBarClick ? "pointer" : "default",
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: "#fff", borderColor: _cssClr("--border-subtle"), borderWidth: 1,
          titleColor: _cssClr("--text-primary"), bodyColor: _cssClr("--text-secondary"),
          callbacks: { label: item => ` ${item.raw} cases — click to filter` }
        }},
        scales: {
          x: { grid: { display: false }, ticks: { color: _cssClr("--text-tertiary"), font: { size: 10 }, maxRotation: 45 } },
          y: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { color: _cssClr("--text-tertiary"), font: { size: 11 } }, beginAtZero: true }
        },
        onClick: onBarClick ? (evt, elements) => {
          if (elements.length) onBarClick(labels[elements[0].index]);
        } : undefined
      }
    });
    if (onBarClick) canvas.style.cursor = "pointer";
  }

  function bindClosedFilters() {
    document.getElementById("cl-year")?.addEventListener("change", e => { _year=e.target.value; _ownerFilter=""; drawAll(); });
    document.getElementById("cl-month")?.addEventListener("change", e => { _month=e.target.value; _ownerFilter=""; drawAll(); });
    document.getElementById("cl-from")?.addEventListener("change", e => { _fromDate=e.target.value; _year=""; _month=""; document.getElementById("cl-year").value=""; document.getElementById("cl-month").value=""; _ownerFilter=""; drawAll(); });
    document.getElementById("cl-to")?.addEventListener("change", e => { _toDate=e.target.value; _year=""; _month=""; document.getElementById("cl-year").value=""; document.getElementById("cl-month").value=""; _ownerFilter=""; drawAll(); });
    document.getElementById("cl-lastdays")?.addEventListener("input", e => { _lastDays=e.target.value; _year=""; _month=""; _fromDate=""; _toDate=""; ["cl-year","cl-month","cl-from","cl-to"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; }); _ownerFilter=""; drawAll(); });
    document.getElementById("cl-clear")?.addEventListener("click", () => {
      _year=""; _month=""; _fromDate=""; _toDate=""; _lastDays=""; _ownerFilter="";
      ["cl-year","cl-month","cl-from","cl-to","cl-lastdays"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
      drawAll();
    });
  }

  function renderClosedKPIs(cases) {
    const row = document.getElementById("closed-kpi-row");
    if (!row) return;
    const acc02 = cases.filter(r => (r["Customer number"]||"").replace(/^0+/,"").startsWith("2"));
    const acc08 = cases.filter(r => (r["Customer number"]||"").includes(Data.customerAccountId ? Data.customerAccountId() : "881812"));
    row.innerHTML = [
      kpi("Total Closed", cases.length,  ""),
      kpi("02 Account",   acc02.length,  "kpi-blue"),
      kpi("08 Account",   acc08.length,  "kpi-purple"),
    ].join("");
  }

  function kpi(label, value, cls) {
    return `<div class="kpi-card ${cls}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>`;
  }

  function _drawCreatedMonthly(cases) {
    const counts = {};
    cases.forEach(r => {
      const d = Utils.parseDate(r.Created);
      if (!d) return;
      const key = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
      counts[key] = (counts[key]||0) + 1;
    });
    const sorted = Object.keys(counts).sort();
    const labels = sorted.map(k => { const [y,m]=k.split("-"); return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]+" "+y.slice(2); });
    _renderBarChart("chart-created-monthly", labels, sorted.map(k=>counts[k]), _cssClr("--chart-1"),
      label => {
        // label is "Mon YY" — find the matching YYYY-MM key
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const [mon, yy] = label.split(" ");
        const mm = String(months.indexOf(mon)+1).padStart(2,"0");
        const yyyy = (parseInt(yy) < 50 ? "20" : "19") + yy;
        _fromDate = yyyy+"-"+mm+"-01";
        const lastDay = new Date(parseInt(yyyy), parseInt(mm), 0).getDate();
        _toDate = yyyy+"-"+mm+"-"+String(lastDay).padStart(2,"0");
        _year = yyyy; _month = mm; _lastDays = "";
        ["cr-year","cr-month","cr-from","cr-to","cr-lastdays"].forEach(id => {
          const el=document.getElementById(id); if(!el) return;
          if(id==="cr-year") el.value=yyyy; else if(id==="cr-month") el.value=mm;
          else if(id==="cr-from") el.value=_fromDate; else if(id==="cr-to") el.value=_toDate;
          else el.value="";
        });
        _ownerFilter=""; drawAll();
        document.getElementById("tbl-created")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });
  }

  function _drawCreatedWeekly(cases) {
    const now = new Date();
    const weekBuckets = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i*7);
      const key = _weekKey(d);
      weekBuckets[key] = 0;
    }
    cases.forEach(r => {
      const d = Utils.parseDate(r.Created);
      if (!d) return;
      const diffWeeks = Math.floor((now - d) / (7*24*3600*1000));
      if (diffWeeks >= 0 && diffWeeks < 12) {
        const key = _weekKey(new Date(now.getTime() - diffWeeks*7*24*3600*1000));
        if (key in weekBuckets) weekBuckets[key]++;
      }
    });
    const keys = Object.keys(weekBuckets).sort();
    const labels = keys.map(k => "W"+k.split("-W")[1]);
    _renderBarChart("chart-created-weekly", labels, keys.map(k=>weekBuckets[k]), _cssClr("--purple"),
      label => {
        const wkKey = keys.find(k => k.endsWith("-W"+label.replace("W","")));
        if (!wkKey) return;
        const [yr, wn] = wkKey.split("-W");
        const jan1 = new Date(parseInt(yr), 0, 1);
        const startOfWk = new Date(jan1);
        startOfWk.setDate(jan1.getDate() + (parseInt(wn)-1)*7 - jan1.getDay());
        const endOfWk = new Date(startOfWk); endOfWk.setDate(startOfWk.getDate()+6);
        const fmt = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
        _fromDate = fmt(startOfWk); _toDate = fmt(endOfWk);
        _year=""; _month=""; _lastDays="";
        ["cr-year","cr-month","cr-lastdays"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
        const fe=document.getElementById("cr-from"); if(fe) fe.value=_fromDate;
        const te=document.getElementById("cr-to"); if(te) te.value=_toDate;
        _ownerFilter=""; drawAll();
        document.getElementById("tbl-created")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });
  }

  function _drawCreatedYearly(cases) {
    const counts = {};
    cases.forEach(r => {
      const d = Utils.parseDate(r.Created);
      if (!d) return;
      const y = String(d.getFullYear());
      counts[y] = (counts[y]||0) + 1;
    });
    const sorted = Object.keys(counts).sort();
    _renderBarChart("chart-created-yearly", sorted, sorted.map(k=>counts[k]), _cssClr("--chart-6"),
      label => {
        _year=label; _month=""; _fromDate=""; _toDate=""; _lastDays="";
        ["cr-year","cr-month","cr-from","cr-to","cr-lastdays"].forEach(id => {
          const el=document.getElementById(id); if(!el) return;
          el.value = id==="cr-year" ? label : "";
        });
        _ownerFilter=""; drawAll();
        document.getElementById("tbl-created")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });
  }

  function _weekKey(d) {
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return d.getFullYear() + "-W" + String(week).padStart(2,"0");
  }

  function _renderBarChart(canvasId, labels, data, color, onBarClick) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (canvas._chartInstance) { canvas._chartInstance.destroy(); }
    canvas._chartInstance = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [{ data, backgroundColor: color, borderRadius: 4, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: item => ` ${item.raw} cases — click to filter` }
        }},
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: _cssClr("--border-subtle") } }
        },
        onClick: onBarClick ? (evt, elements) => {
          if (elements.length) onBarClick(labels[elements[0].index]);
        } : undefined
      }
    });
    if (onBarClick) canvas.style.cursor = "pointer";
  }

  return { render };
})();


/* ============================================================
   DashCreated — Created Cases tab
   ============================================================ */
const DashCreated = (() => {
  let _year="", _month="", _fromDate="", _toDate="", _lastDays="";
  let _ownerFilter="";
  let _tableRef = null;

  function render() {
    const el = document.getElementById("tab-created");
    if (!el) return;
    _tableRef = null; // reset so drawAll creates a fresh table instance
    el.innerHTML = `
      <div class="kpi-row" id="created-kpi-row"></div>
      <div class="filter-bar mt-5" style="flex-wrap:wrap;gap:8px">
        ${yearSelect("cr-year",_year)} ${monthSelect("cr-month",_month)}
        <div class="filter-group">
          <span class="filter-label">From</span>
          <input id="cr-from" type="date" class="form-input form-input-sm" class="w-140" value="${_fromDate}"/>
        </div>
        <div class="filter-group">
          <span class="filter-label">To</span>
          <input id="cr-to" type="date" class="form-input form-input-sm" class="w-140" value="${_toDate}"/>
        </div>
        <div class="filter-group">
          <span class="filter-label">Last N Days</span>
          <input id="cr-lastdays" type="number" class="form-input form-input-sm" class="w-80" placeholder="e.g. 30" value="${_lastDays}"/>
        </div>
        <button id="cr-clear" class="btn btn-danger btn-sm" class="align-end">Clear</button>
        <span id="cr-count" class="text-muted" style="align-self:flex-end;font-size:12px"></span>
      </div>
      <!-- Charts row -->
      <div class="grid-3 mt-5" id="cr-charts-grid">
        <div class="tile">
          <div class="section-title" class="mt-0">Monthly Created</div>
          <div class="chart-canvas-wrap" class="chart-md"><canvas id="chart-created-monthly"></canvas></div>
        </div>
        <div class="tile">
          <div class="section-title" class="mt-0">Weekly Created (Last 12w)</div>
          <div class="chart-canvas-wrap" class="chart-md"><canvas id="chart-created-weekly"></canvas></div>
        </div>
        <div class="tile">
          <div class="section-title" class="mt-0">Yearly Created</div>
          <div class="chart-canvas-wrap" class="chart-md"><canvas id="chart-created-yearly"></canvas></div>
        </div>
      </div>
      <div class="tile mt-5">
        <div class="section-title">Owner vs Created Cases</div>
        <div class="chart-canvas-wrap" style="height:350px"><canvas id="chart-created-owners"></canvas></div>
      </div>
      <div class="tile mt-5">
        <div class="section-title">Created Cases</div>
        <div id="tbl-created"></div>
      </div>
    `;
    bindCreatedFilters();
    drawAll();
  }

  function filtered() {
    const today = new Date();
    return Data.teamCases().filter(r => {
      const d = Utils.parseDate(r.Created);
      if (_year  && (!d || String(d.getFullYear()) !== _year)) return false;
      if (_month && (!d || String(d.getMonth()+1).padStart(2,"0") !== _month)) return false;
      if (_fromDate && (!d || d < new Date(_fromDate))) return false;
      if (_toDate   && (!d || d > new Date(_toDate + "T23:59:59"))) return false;
      if (_lastDays && _lastDays > 0) {
        const cutoff = new Date(today); cutoff.setDate(today.getDate() - parseInt(_lastDays, 10));
        if (!d || d < cutoff) return false;
      }
      return true;
    });
  }

  function drawAll(ownerFilter) {
    if (ownerFilter !== undefined) _ownerFilter = ownerFilter;
    const cases = filtered();
    const tableData = _ownerFilter ? cases.filter(r => r.Owner === _ownerFilter) : cases;

    renderCreatedKPIs(cases);

    // When Last N Days is active: auto-populate From/To/Year/Month to reflect the range
    const crLastDaysMode = !!(_lastDays && parseInt(_lastDays,10) > 0);
    const crGrid = document.getElementById("cr-charts-grid");
    if (crGrid) crGrid.style.display = crLastDaysMode ? "none" : "";
    if (crLastDaysMode) {
      const n = parseInt(_lastDays, 10);
      const toD   = new Date();
      const fromD = new Date(); fromD.setDate(toD.getDate() - n);
      const pad = v => String(v).padStart(2,"0");
      const toStr   = toD.getFullYear()+"-"+pad(toD.getMonth()+1)+"-"+pad(toD.getDate());
      const fromStr = fromD.getFullYear()+"-"+pad(fromD.getMonth()+1)+"-"+pad(fromD.getDate());
      const fromEl = document.getElementById("cr-from"); if (fromEl) fromEl.value = fromStr;
      const toEl   = document.getElementById("cr-to");   if (toEl)   toEl.value   = toStr;
      const yrEl = document.getElementById("cr-year");
      if (yrEl) yrEl.value = String(fromD.getFullYear());
      const moEl = document.getElementById("cr-month");
      if (moEl) moEl.value = pad(fromD.getMonth()+1);
    }

    Charts.ownerBar("chart-created-owners", Utils.ownerCounts(cases), {
      color: _cssClr("--chart-1"),
      onClick: name => {
        drawAll(name === _ownerFilter ? "" : name);
        document.getElementById("tbl-created")?.scrollIntoView({ behavior:"smooth", block:"start" });
      }
    });

    if (!crLastDaysMode) {
      // ── Monthly chart ──
      _drawCreatedMonthly(cases);
      // ── Weekly chart (last 12 weeks) ──
      _drawCreatedWeekly(cases);
      // ── Yearly chart ──
      _drawCreatedYearly(cases);
    }

    const tblCreatedEl = document.getElementById("tbl-created");
    if (_tableRef) {
      _tableRef.refresh(tableData);
    } else {
      _tableRef = Table.render(tblCreatedEl, tableData, {
      showActions: false,
      defaultSortKey: "Created",
      defaultSortDir: 1,
      columns: [
        { key:"Case Number", label:"Case Number", class:"col-case-num",
          render: row => {
            const perfIcon = (typeof Data !== "undefined" && Data.isMarkedPerformance && Data.isMarkedPerformance(row["Case Number"]))
              ? `<span title="Performance Case" style="color:var(--red);margin-right:4px;display:inline-flex;align-items:center;vertical-align:middle"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>`
              : "";
            const cn = Utils.escHtml(row["Case Number"]);
            return `${perfIcon}<span class="case-number-copy" data-cn="${cn}" title="Click to copy" style="cursor:pointer;color:#2563eb;font-weight:600;font-family:var(--font-mono)">${cn}</span>`;
          }},
        { key:"Owner", label:"Owner", class:"col-owner",
          render: row => Utils.escHtml(Utils.shortName(row.Owner)) },
        { key:"Status", label:"Status",
          render: row => Utils.statusBadge(row.Status) },
        { key:"Product", label:"Product", class:"col-product",
          render: row => `<span title="${Utils.escHtml(row.Product)}">${Utils.escHtml(row.Product)}</span>` },
        { key:"Customer number", label:"Customer #", class:"col-date text-mono",
          render: row => Utils.escHtml(row["Customer number"] || "—") },
        { key:"Created", label:"Created", class:"col-date",
          sortValue: row => { const d = Utils.parseDate(row.Created); return d ? d.getTime() : 0; },
          render: row => Utils.fmtDateShort(row.Created) },
        { key:"Updated", label:"Updated", class:"col-stale",
          render: row => {
            const d    = Utils.parseDate(row.Updated);
            const days = Utils.daysDiff(d);
            return `<span style="color:${days>=5?_cssClr("--red"):_cssClr("--text-tertiary")}">${Utils.fmtDateShort(row.Updated)}</span>`
                 + (days >= 5 ? ` <span class="stale-days">(+${days}d)</span>` : "");
          }},
        { key:"Severity", label:"Severity", class:"col-sev",
          render: row => {
            const s = String(row.Severity||"").trim();
            const col = s.startsWith("1") ? _cssClr("--red") : s.startsWith("2") ? _cssClr("--orange") : s.startsWith("3") ? _cssClr("--yellow") : _cssClr("--text-tertiary");
            return `<span style="font-weight:700;color:${col};font-family:var(--font-mono)">${Utils.escHtml(s||"—")}</span>`;
          }},
        { key:"Age", label:"Age (days)", class:"col-age text-mono",
          render: row => {
            const a = parseInt(row.Age||"0", 10);
            return `<span style="font-family:var(--font-mono);color:${a>30?_cssClr("--red"):a>14?_cssClr("--orange"):_cssClr("--text-tertiary")}">${a > 0 ? a + "d" : "—"}</span>`;
          }},
        { key:"Title", label:"Title", class:"col-title", sortable:false,
          render: row => `<span title="${Utils.escHtml(row.Title)}">${Utils.escHtml(row.Title)}</span>` }
      ]
    });
    }
    const cnt = document.getElementById("cr-count");
    if (cnt) cnt.textContent = `${cases.length} cases`;
  }

  function bindCreatedFilters() {
    document.getElementById("cr-year")?.addEventListener("change", e => { _year=e.target.value; _ownerFilter=""; drawAll(); });
    document.getElementById("cr-month")?.addEventListener("change", e => { _month=e.target.value; _ownerFilter=""; drawAll(); });
    document.getElementById("cr-from")?.addEventListener("change", e => { _fromDate=e.target.value; _year=""; _month=""; document.getElementById("cr-year").value=""; document.getElementById("cr-month").value=""; _ownerFilter=""; drawAll(); });
    document.getElementById("cr-to")?.addEventListener("change", e => { _toDate=e.target.value; _year=""; _month=""; document.getElementById("cr-year").value=""; document.getElementById("cr-month").value=""; _ownerFilter=""; drawAll(); });
    document.getElementById("cr-lastdays")?.addEventListener("input", e => { _lastDays=e.target.value; _year=""; _month=""; _fromDate=""; _toDate=""; ["cr-year","cr-month","cr-from","cr-to"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; }); _ownerFilter=""; drawAll(); });
    document.getElementById("cr-clear")?.addEventListener("click", () => {
      _year=""; _month=""; _fromDate=""; _toDate=""; _lastDays=""; _ownerFilter="";
      ["cr-year","cr-month","cr-from","cr-to","cr-lastdays"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
      drawAll();
    });
  }

  function renderCreatedKPIs(cases) {
    const row = document.getElementById("created-kpi-row");
    if (!row) return;
    const acc02 = cases.filter(r => (r["Customer number"]||"").replace(/^0+/,"").startsWith("2"));
    const acc08 = cases.filter(r => (r["Customer number"]||"").includes(Data.customerAccountId ? Data.customerAccountId() : "881812"));
    row.innerHTML = [
      kpi("Total Created", cases.length, ""),
      kpi("02 Account",    acc02.length, "kpi-blue"),
      kpi("08 Account",    acc08.length, "kpi-purple"),
    ].join("");
  }

  function kpi(label, value, cls) {
    return `<div class="kpi-card ${cls}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>`;
  }

  function _drawCreatedMonthly(cases) {
    const counts = {};
    cases.forEach(r => {
      const d = Utils.parseDate(r.Created);
      if (!d) return;
      const key = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
      counts[key] = (counts[key]||0) + 1;
    });
    const sorted = Object.keys(counts).sort();
    const labels = sorted.map(k => { const [y,m]=k.split("-"); return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]+" "+y.slice(2); });
    _renderBarChart("chart-created-monthly", labels, sorted.map(k=>counts[k]), _cssClr("--chart-1"),
      label => {
        // label is "Mon YY" — find the matching YYYY-MM key
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const [mon, yy] = label.split(" ");
        const mm = String(months.indexOf(mon)+1).padStart(2,"0");
        const yyyy = (parseInt(yy) < 50 ? "20" : "19") + yy;
        _fromDate = yyyy+"-"+mm+"-01";
        const lastDay = new Date(parseInt(yyyy), parseInt(mm), 0).getDate();
        _toDate = yyyy+"-"+mm+"-"+String(lastDay).padStart(2,"0");
        _year = yyyy; _month = mm; _lastDays = "";
        ["cr-year","cr-month","cr-from","cr-to","cr-lastdays"].forEach(id => {
          const el=document.getElementById(id); if(!el) return;
          if(id==="cr-year") el.value=yyyy; else if(id==="cr-month") el.value=mm;
          else if(id==="cr-from") el.value=_fromDate; else if(id==="cr-to") el.value=_toDate;
          else el.value="";
        });
        _ownerFilter=""; drawAll();
        document.getElementById("tbl-created")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });
  }

  function _drawCreatedWeekly(cases) {
    const now = new Date();
    const weekBuckets = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i*7);
      const key = _weekKey(d);
      weekBuckets[key] = 0;
    }
    cases.forEach(r => {
      const d = Utils.parseDate(r.Created);
      if (!d) return;
      const diffWeeks = Math.floor((now - d) / (7*24*3600*1000));
      if (diffWeeks >= 0 && diffWeeks < 12) {
        const key = _weekKey(new Date(now.getTime() - diffWeeks*7*24*3600*1000));
        if (key in weekBuckets) weekBuckets[key]++;
      }
    });
    const keys = Object.keys(weekBuckets).sort();
    const labels = keys.map(k => "W"+k.split("-W")[1]);
    _renderBarChart("chart-created-weekly", labels, keys.map(k=>weekBuckets[k]), _cssClr("--purple"),
      label => {
        const wkKey = keys.find(k => k.endsWith("-W"+label.replace("W","")));
        if (!wkKey) return;
        const [yr, wn] = wkKey.split("-W");
        const jan1 = new Date(parseInt(yr), 0, 1);
        const startOfWk = new Date(jan1);
        startOfWk.setDate(jan1.getDate() + (parseInt(wn)-1)*7 - jan1.getDay());
        const endOfWk = new Date(startOfWk); endOfWk.setDate(startOfWk.getDate()+6);
        const fmt = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
        _fromDate = fmt(startOfWk); _toDate = fmt(endOfWk);
        _year=""; _month=""; _lastDays="";
        ["cr-year","cr-month","cr-lastdays"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
        const fe=document.getElementById("cr-from"); if(fe) fe.value=_fromDate;
        const te=document.getElementById("cr-to"); if(te) te.value=_toDate;
        _ownerFilter=""; drawAll();
        document.getElementById("tbl-created")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });
  }

  function _drawCreatedYearly(cases) {
    const counts = {};
    cases.forEach(r => {
      const d = Utils.parseDate(r.Created);
      if (!d) return;
      const y = String(d.getFullYear());
      counts[y] = (counts[y]||0) + 1;
    });
    const sorted = Object.keys(counts).sort();
    _renderBarChart("chart-created-yearly", sorted, sorted.map(k=>counts[k]), _cssClr("--chart-6"),
      label => {
        _year=label; _month=""; _fromDate=""; _toDate=""; _lastDays="";
        ["cr-year","cr-month","cr-from","cr-to","cr-lastdays"].forEach(id => {
          const el=document.getElementById(id); if(!el) return;
          el.value = id==="cr-year" ? label : "";
        });
        _ownerFilter=""; drawAll();
        document.getElementById("tbl-created")?.scrollIntoView({ behavior:"smooth", block:"start" });
      });
  }

  function _weekKey(d) {
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return d.getFullYear() + "-W" + String(week).padStart(2,"0");
  }

  function _renderBarChart(canvasId, labels, data, color, onBarClick) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (canvas._chartInstance) { canvas._chartInstance.destroy(); }
    canvas._chartInstance = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [{ data, backgroundColor: color, borderRadius: 4, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: item => ` ${item.raw} cases — click to filter` }
        }},
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: _cssClr("--border-subtle") } }
        },
        onClick: onBarClick ? (evt, elements) => {
          if (elements.length) onBarClick(labels[elements[0].index]);
        } : undefined
      }
    });
    if (onBarClick) canvas.style.cursor = "pointer";
  }

  return { render };
})();


/* ── Shared filter helpers ─────────────────────────────── */
function yearSelect(id, selected) {
  // Derive available years dynamically from Created and Closed Date columns in loaded data
  const yearsFromData = (() => {
    try {
      const all = Data.allCases();
      const ySet = new Set();
      all.forEach(r => {
        ["Created", "Closed Date"].forEach(col => {
          const v = (r[col] || "").trim();
          if (!v) return;
          const d = Utils.parseDate(v);
          if (d && !isNaN(d)) ySet.add(d.getFullYear());
        });
      });
      return [...ySet].sort();
    } catch(e) { return [2023, 2024, 2025, 2026]; }
  })();
  const opts = yearsFromData.map(y =>
    `<option value="${y}" ${String(y)===String(selected)?"selected":""}>${y}</option>`).join("");
  return `<div class="filter-group"><span class="filter-label">Year</span>
    <select id="${id}" class="form-select" class="w-100">
      <option value="">All</option>${opts}</select></div>`;
}
function monthSelect(id, selected) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const opts = months.map((m,i) => {
    const v = String(i+1).padStart(2,"0");
    return `<option value="${v}" ${v===selected?"selected":""}>${m}</option>`;
  }).join("");
  return `<div class="filter-group"><span class="filter-label">Month</span>
    <select id="${id}" class="form-select" class="w-100">
      <option value="">All</option>${opts}</select></div>`;
}
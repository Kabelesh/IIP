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

  function render() {
    const el = document.getElementById("tab-closed-inner") || document.getElementById("tab-closed");
    if (!el) return;
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

    Table.render(document.getElementById("tbl-closed"), tableData, {
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

  function render() {
    const el = document.getElementById("tab-created");
    if (!el) return;
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

    Table.render(document.getElementById("tbl-created"), tableData, {
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
}// =============================================================================
// frontend/js/dashboards/created.js
// Created Cases Dashboard — IIP Phase 2, Fix 2.6
//
// REPLACES the 3-line stub that was here.
//
// PURPOSE:
//   Shows cases that were OPENED (created) by the Bosch team with IBM, with
//   focus on intake velocity, creation trends, and time-to-assignment metrics.
//   Complements the Closed Cases dashboard (which shows resolution) and the
//   Overview (which shows the current snapshot).
//
// PANELS:
//   1. KPI strip: new this week, last 30d, YTD, avg daily rate
//   2. Intake trend chart: cases created per week (12-week rolling)
//   3. Creation vs. Closure chart: intake rate vs. resolution rate overlay
//   4. Severity breakdown of newly created cases (donut)
//   5. Product breakdown of newly created cases (bar)
//   6. Recent cases table: last 30 days, sortable
// =============================================================================

'use strict';

(function (window, document) {

  // ── CSS ────────────────────────────────────────────────────────────────────
  const CSS = `
    #created-dashboard {
      padding: 20px;
      font-family: inherit;
    }
    .iip-kpi-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .iip-kpi-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: box-shadow 0.15s;
    }
    .iip-kpi-card:hover { box-shadow: 0 3px 8px rgba(0,0,0,0.10); }
    .iip-kpi-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
    .iip-kpi-value { font-size: 32px; font-weight: 700; color: #111827; line-height: 1.1; }
    .iip-kpi-sub   { font-size: 12px; color: #9ca3af; }
    .iip-kpi-delta { font-size: 12px; font-weight: 600; }
    .iip-kpi-delta.up   { color: #dc2626; } /* more cases = bad */
    .iip-kpi-delta.down { color: #16a34a; } /* fewer cases = good */
    .iip-kpi-delta.flat { color: #6b7280; }
    .iip-kpi-accent-blue   { border-top: 3px solid #2563eb; }
    .iip-kpi-accent-orange { border-top: 3px solid #f59e0b; }
    .iip-kpi-accent-green  { border-top: 3px solid #16a34a; }
    .iip-kpi-accent-purple { border-top: 3px solid #7c3aed; }

    .iip-charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .iip-chart-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .iip-chart-title {
      font-size: 13px;
      font-weight: 700;
      color: #374151;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .iip-chart-title .iip-chart-sub { font-weight: 400; color: #9ca3af; font-size: 11px; }

    .iip-created-table-wrap {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .iip-created-table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .iip-created-table-header h3 { font-size: 14px; font-weight: 700; color: #374151; margin: 0; }
    .iip-ct-filters { display: flex; gap: 8px; }
    .iip-ct-filter {
      padding: 5px 10px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
      background: #fff;
      cursor: pointer;
      font-family: inherit;
    }
    .iip-ct-filter:focus { outline: 2px solid #2563eb; }

    table.iip-created-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    table.iip-created-table th {
      background: #f9fafb;
      padding: 10px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
    table.iip-created-table th:hover { background: #f0f4ff; color: #2563eb; }
    table.iip-created-table th.sorted { color: #2563eb; }
    table.iip-created-table th.sorted::after { content: ' ↓'; font-size: 10px; }
    table.iip-created-table th.sorted.asc::after { content: ' ↑'; }
    table.iip-created-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
      vertical-align: middle;
    }
    table.iip-created-table tr:hover td { background: #f8faff; }
    table.iip-created-table tr:last-child td { border-bottom: none; }

    .iip-sev-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
    }
    .iip-sev-1 { background:#fee2e2; color:#7f1d1d; }
    .iip-sev-2 { background:#fef3c7; color:#78350f; }
    .iip-sev-3 { background:#eff6ff; color:#1e3a5f; }
    .iip-sev-4 { background:#f0fdf4; color:#14532d; }

    .iip-status-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .iip-status-new      { background:#dbeafe; color:#1e3a8a; }
    .iip-status-working  { background:#ede9fe; color:#3730a3; }
    .iip-status-waiting  { background:#fef3c7; color:#78350f; }
    .iip-status-feedback { background:#fee2e2; color:#7f1d1d; }

    .iip-created-empty {
      padding: 48px;
      text-align: center;
      color: #9ca3af;
    }
    .iip-created-empty strong { display: block; font-size: 16px; margin-bottom: 6px; color: #6b7280; }

    /* Trend bars (inline bar chart without external lib) */
    .iip-trend-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .iip-trend-bar-label { font-size: 11px; color: #6b7280; width: 50px; flex-shrink: 0; text-align: right; }
    .iip-trend-bar-track { flex: 1; height: 14px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
    .iip-trend-bar-fill  { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
    .iip-trend-bar-val   { font-size: 11px; color: #374151; font-weight: 600; width: 28px; text-align: right; }

    .iip-donut-wrap { display: flex; flex-direction: column; gap: 8px; }
    .iip-donut-row  { display: flex; align-items: center; gap: 8px; }
    .iip-donut-swatch { width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; }
    .iip-donut-label { font-size: 12px; color: #374151; flex: 1; }
    .iip-donut-pct   { font-size: 12px; font-weight: 700; color: #111827; }
    .iip-donut-bar   { flex: 2; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .iip-donut-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }

    @media (max-width: 900px) {
      .iip-charts-row { grid-template-columns: 1fr; }
      .iip-kpi-strip  { grid-template-columns: repeat(2, 1fr); }
    }
  `;

  function injectCSS() {
    if (document.getElementById('iip-created-css')) return;
    const style = document.createElement('style');
    style.id = 'iip-created-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ── Data helpers ───────────────────────────────────────────────────────────

  function parseDate(s) {
    if (!s || !s.trim()) return null;
    for (const fmt of [
      [/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i, true],
      [/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/, false],
      [/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, false],
    ]) {
      const m = s.trim().match(fmt[0]);
      if (!m) continue;
      let [, mo, dy, yr, hr = 0, min = 0, ampm] = m;
      hr = parseInt(hr); min = parseInt(min);
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hr !== 12) hr += 12;
        if (ampm.toUpperCase() === 'AM' && hr === 12) hr = 0;
      }
      return new Date(parseInt(yr), parseInt(mo) - 1, parseInt(dy), hr, min);
    }
    return null;
  }

  function isoWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  function statusClass(status) {
    if (!status) return 'iip-status-new';
    if (/new/i.test(status))      return 'iip-status-new';
    if (/working/i.test(status))  return 'iip-status-working';
    if (/waiting/i.test(status))  return 'iip-status-waiting';
    if (/feedback/i.test(status)) return 'iip-status-feedback';
    return 'iip-status-new';
  }

  function isOpen(c) {
    const s = c.status || c.Status || '';
    return !['Closed - Archived','Closed by IBM','Closed by Client'].some(x => s.includes(x));
  }

  // ── Fetch cases ────────────────────────────────────────────────────────────

  async function fetchAllCases() {
    // Return cases already loaded from uploaded CSV
    return (typeof Data !== "undefined") ? Data.allCases() : [];
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function renderKPIs(cases, container) {
    const now = new Date();

    // This week (ISO)
    const thisWeek = isoWeek(now);
    const thisYear = now.getFullYear();
    const newThisWeek = cases.filter(c => {
      const d = parseDate(c.Created || c.created || '');
      return d && d.getFullYear() === thisYear && isoWeek(d) === thisWeek;
    });

    // Last 30 days
    const last30 = cases.filter(c => {
      const d = parseDate(c.Created || c.created || '');
      return d && (now - d) / 86400000 <= 30;
    });

    // YTD
    const ytd = cases.filter(c => {
      const d = parseDate(c.Created || c.created || '');
      return d && d.getFullYear() === thisYear;
    });

    // Avg daily rate (last 90 days)
    const last90 = cases.filter(c => {
      const d = parseDate(c.Created || c.created || '');
      return d && (now - d) / 86400000 <= 90;
    });
    const avgDaily = (last90.length / 90).toFixed(1);

    // Previous 30-day period for delta
    const prev30 = cases.filter(c => {
      const d = parseDate(c.Created || c.created || '');
      return d && (now - d) / 86400000 > 30 && (now - d) / 86400000 <= 60;
    });
    const delta30 = last30.length - prev30.length;
    const deltaClass = delta30 > 0 ? 'up' : delta30 < 0 ? 'down' : 'flat';
    const deltaStr = (delta30 > 0 ? '↑' : delta30 < 0 ? '↓' : '→') + Math.abs(delta30) + ' vs prev 30d';

    container.innerHTML = `
      <div class="iip-kpi-strip">
        <div class="iip-kpi-card iip-kpi-accent-blue">
          <div class="iip-kpi-label">New This Week</div>
          <div class="iip-kpi-value">${newThisWeek.length}</div>
          <div class="iip-kpi-sub">CW${String(thisWeek).padStart(2,'0')} ${thisYear}</div>
        </div>
        <div class="iip-kpi-card iip-kpi-accent-orange">
          <div class="iip-kpi-label">Last 30 Days</div>
          <div class="iip-kpi-value">${last30.length}</div>
          <div class="iip-kpi-delta ${deltaClass}">${deltaStr}</div>
        </div>
        <div class="iip-kpi-card iip-kpi-accent-green">
          <div class="iip-kpi-label">YTD ${thisYear}</div>
          <div class="iip-kpi-value">${ytd.length}</div>
          <div class="iip-kpi-sub">${Math.round(ytd.length / Math.max(1, thisWeek))} / week avg</div>
        </div>
        <div class="iip-kpi-card iip-kpi-accent-purple">
          <div class="iip-kpi-label">Avg Daily Rate</div>
          <div class="iip-kpi-value">${avgDaily}</div>
          <div class="iip-kpi-sub">90-day rolling</div>
        </div>
      </div>
    `;
  }

  function renderIntakeTrend(cases, container) {
    // Last 12 ISO weeks
    const now = new Date();
    const weekData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const wk = isoWeek(d);
      const yr = d.getFullYear();
      const label = `CW${String(wk).padStart(2,'0')}`;
      const created = cases.filter(c => {
        const cd = parseDate(c.Created || c.created || '');
        return cd && cd.getFullYear() === yr && isoWeek(cd) === wk;
      }).length;
      const closed = cases.filter(c => {
        const cl = parseDate(c['Closed Date'] || c.closedDate || '');
        return cl && cl.getFullYear() === yr && isoWeek(cl) === wk;
      }).length;
      weekData.push({ label, created, closed });
    }

    const maxVal = Math.max(...weekData.map(w => Math.max(w.created, w.closed)), 1);

    const rows = weekData.map(w => {
      const pctC = Math.round((w.created / maxVal) * 100);
      const pctX = Math.round((w.closed  / maxVal) * 100);
      return `
        <div class="iip-trend-bar-row">
          <div class="iip-trend-bar-label">${w.label}</div>
          <div style="flex:1;display:flex;flex-direction:column;gap:3px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <div class="iip-trend-bar-track" style="height:10px;">
                <div class="iip-trend-bar-fill" style="width:${pctC}%;background:#3b82f6;"></div>
              </div>
              <span style="font-size:11px;color:#6b7280;width:24px;">${w.created}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <div class="iip-trend-bar-track" style="height:10px;">
                <div class="iip-trend-bar-fill" style="width:${pctX}%;background:#10b981;"></div>
              </div>
              <span style="font-size:11px;color:#6b7280;width:24px;">${w.closed}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="iip-chart-card">
        <div class="iip-chart-title">
          Intake vs. Resolution (12-week)
          <span class="iip-chart-sub">
            <span style="color:#3b82f6">■</span> Created &nbsp;
            <span style="color:#10b981">■</span> Closed
          </span>
        </div>
        ${rows}
      </div>
    `;
  }

  function renderSeverityBreakdown(cases, container) {
    const now = new Date();
    const recent = cases.filter(c => {
      const d = parseDate(c.Created || c.created || '');
      return d && (now - d) / 86400000 <= 90;
    });

    const sevColors = { '1':'#dc2626','2':'#f59e0b','3':'#3b82f6','4':'#10b981' };
    const sevCounts = { '1':0,'2':0,'3':0,'4':0 };
    for (const c of recent) {
      const s = c.Severity || c.severity || '?';
      if (sevCounts[s] !== undefined) sevCounts[s]++;
    }
    const total = Object.values(sevCounts).reduce((a,b) => a+b, 0) || 1;

    const rows = Object.entries(sevCounts).map(([sev, count]) => {
      const pct = Math.round(count / total * 100);
      return `
        <div class="iip-donut-row">
          <div class="iip-donut-swatch" style="background:${sevColors[sev]};"></div>
          <div class="iip-donut-label">Sev-${sev}</div>
          <div class="iip-donut-bar"><div class="iip-donut-bar-fill" style="width:${pct}%;background:${sevColors[sev]};"></div></div>
          <div class="iip-donut-pct">${count} <span style="font-weight:400;color:#9ca3af;">(${pct}%)</span></div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="iip-chart-card">
        <div class="iip-chart-title">Severity Split <span class="iip-chart-sub">Last 90 days</span></div>
        <div class="iip-donut-wrap">${rows}</div>
      </div>
    `;
  }

  let sortCol = 'created'; let sortAsc = false;

  function renderRecentTable(cases, container, days) {
    days = days || 30;
    const now = new Date();
    let recent = cases.filter(c => {
      const d = parseDate(c.Created || c.created || '');
      return d && (now - d) / 86400000 <= days;
    });

    // Sort
    recent = recent.sort((a, b) => {
      let va, vb;
      if (sortCol === 'created') {
        va = parseDate(a.Created || a.created || '') || 0;
        vb = parseDate(b.Created || b.created || '') || 0;
        va = va ? va.getTime() : 0;
        vb = vb ? vb.getTime() : 0;
      } else if (sortCol === 'severity') {
        va = parseInt(a.Severity || a.severity || '9');
        vb = parseInt(b.Severity || b.severity || '9');
      } else {
        va = (a[sortCol] || '').toString().toLowerCase();
        vb = (b[sortCol] || '').toString().toLowerCase();
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1  : -1;
      return 0;
    });

    const rows = recent.length ? recent.map(c => {
      const caseNum  = c['Case Number'] || c.caseNumber || c.case_number || '';
      const title    = (c.Title || c.title || '').slice(0, 65);
      const sev      = c.Severity || c.severity || '?';
      const status   = c.Status   || c.status   || '';
      const owner    = c.Owner    || c.owner     || '—';
      const product  = (c.Product || c.product  || '').replace('Engineering ','').slice(0,30);
      const created  = parseDate(c.Created || c.created || '');
      const createdStr = created ? created.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—';
      const daysAgo  = created ? Math.floor((now - created) / 86400000) : '?';
      return `
        <tr>
          <td><span class="case-number-copy" data-cn="${caseNum}" title="Click to copy" style="cursor:pointer;color:#2563eb;font-weight:600">${caseNum}</span></td>
          <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${c.Title || ''}">${title}</td>
          <td><span class="iip-sev-badge iip-sev-${sev}">Sev-${sev}</span></td>
          <td><span class="iip-status-pill ${statusClass(status)}">${status}</span></td>
          <td>${owner}</td>
          <td style="white-space:nowrap;">${product}</td>
          <td style="white-space:nowrap;">${createdStr} <span style="color:#9ca3af;font-size:11px;">(${daysAgo}d)</span></td>
        </tr>`;
    }).join('') : `<tr><td colspan="7" class="iip-created-empty"><strong>No cases found</strong>Adjust the filter to see more results.</td></tr>`;

    const thStyle = col => `class="${sortCol === col ? 'sorted' + (sortAsc?' asc':'') : ''}"`;

    container.innerHTML = `
      <div class="iip-created-table-wrap">
        <div class="iip-created-table-header">
          <h3>Recently Created Cases <span style="font-weight:400;color:#9ca3af;font-size:12px;">(${recent.length} in last ${days} days)</span></h3>
          <div class="iip-ct-filters">
            <select class="iip-ct-filter" id="iip-created-days-filter">
              <option value="7" ${days===7?'selected':''}>Last 7 days</option>
              <option value="30" ${days===30?'selected':''}>Last 30 days</option>
              <option value="90" ${days===90?'selected':''}>Last 90 days</option>
            </select>
            <select class="iip-ct-filter" id="iip-created-sev-filter">
              <option value="">All Severities</option>
              <option value="2">Sev-2</option>
              <option value="3">Sev-3</option>
              <option value="4">Sev-4</option>
            </select>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="iip-created-table">
            <thead>
              <tr>
                <th ${thStyle('Case Number')} data-sort="Case Number">Case #</th>
                <th ${thStyle('Title')} data-sort="Title">Title</th>
                <th ${thStyle('severity')} data-sort="severity">Severity</th>
                <th ${thStyle('Status')} data-sort="Status">Status</th>
                <th ${thStyle('Owner')} data-sort="Owner">Owner</th>
                <th ${thStyle('Product')} data-sort="Product">Product</th>
                <th ${thStyle('created')} data-sort="created">Created</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;

    // Wire sort click
    container.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (sortCol === col) sortAsc = !sortAsc; else { sortCol = col; sortAsc = false; }
        renderRecentTable(cases, container, parseInt(document.getElementById('iip-created-days-filter')?.value || '30'));
      });
    });

    // Wire filters
    const daysFilter = document.getElementById('iip-created-days-filter');
    if (daysFilter) {
      daysFilter.addEventListener('change', () => {
        renderRecentTable(cases, container, parseInt(daysFilter.value));
      });
    }
  }

  // ── Main render ────────────────────────────────────────────────────────────

  async function render(panelEl) {
    panelEl.innerHTML = `
      <div id="created-dashboard">
        <div id="created-kpis"></div>
        <div class="iip-charts-row">
          <div id="created-intake-trend"></div>
          <div id="created-sev-breakdown"></div>
        </div>
        <div id="created-recent-table"></div>
      </div>
    `;

    const loading = document.createElement('div');
    loading.style.cssText = 'text-align:center;padding:40px;color:#9ca3af;';
    loading.textContent = 'Loading case data…';

    let cases;
    try {
      cases = await fetchAllCases();
    } catch (e) {
      panelEl.innerHTML = `<div style="padding:40px;text-align:center;color:#dc2626;">Failed to load case data: ${e.message}</div>`;
      return;
    }

    renderKPIs(cases, document.getElementById('created-kpis'));
    renderIntakeTrend(cases, document.getElementById('created-intake-trend'));
    renderSeverityBreakdown(cases, document.getElementById('created-sev-breakdown'));
    renderRecentTable(cases, document.getElementById('created-recent-table'), 30);
  }

  // ── Auto-mount ─────────────────────────────────────────────────────────────

  function mount() {
    injectCSS();

    const PANEL_SELECTORS = [
      '#tab-created',       // the actual content panel ID — never the nav button
      '#created-panel', '.created-dashboard',
    ];

    function tryMount() {
      for (const sel of PANEL_SELECTORS) {
        const el = document.querySelector(sel);
        // Guard: never mount into nav buttons or inline elements
        if (el && !el.dataset.iipCreatedMounted
            && el.tagName !== 'BUTTON' && el.tagName !== 'A'
            && !el.classList.contains('nav-item')) {
          el.dataset.iipCreatedMounted = '1';
          render(el);
          return true;
        }
      }
      return false;
    }

    if (!tryMount()) {
      const obs = new MutationObserver(() => { if (tryMount()) obs.disconnect(); });
      obs.observe(document.body, { childList: true, subtree: true });
    }

    // Re-render when tab is activated
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab],[data-panel],[data-hash]');
      if (tab) {
        const t = tab.dataset.tab || tab.dataset.panel || tab.dataset.hash || '';
        if (/created/.test(t)) setTimeout(() => tryMount(), 100);
      }
    });
  }

  // Expose
  window.IIPCreatedDashboard = { render, fetchAllCases };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

}(window, document));
/* ============================================================
   DashClosedCombined — tabs: Closed Cases | Created Cases
   Registered in getDash as "closed". Sidebar nav item "created"
   can be removed from index.html / app.js getDash map.
   ============================================================ */
const DashClosedCombined = (() => {

  let _sub = 'closed';

  const _style = key => {
    const a = _sub === key;
    return `padding:10px 16px;font-size:13px;font-weight:${a?700:500};border:none;` +
      `border-bottom:2px solid ${a?'var(--ibm-blue-50)':'transparent'};` +
      `background:none;color:${a?'var(--ibm-blue-50)':'var(--text-secondary)'};` +
      `cursor:pointer;font-family:var(--font-sans);margin-bottom:-1px;` +
      `transition:color var(--transition-fast),border-color var(--transition-fast)`;
  };

  function _wireBar() {
    const bar = document.getElementById('tab-closed-bar');
    if (!bar) return;
    bar.innerHTML = `
      <button id="csc-btn-closed"  style="${_style('closed' )}">✅ Closed Cases</button>
      <button id="csc-btn-created" style="${_style('created')}">📥 Created Cases</button>`;
    document.getElementById('csc-btn-closed').addEventListener('click',  () => _switch('closed'));
    document.getElementById('csc-btn-created').addEventListener('click', () => _switch('created'));
  }

  function _switch(key) {
    if (_sub === key) return;
    _sub = key;
    document.getElementById('csc-btn-closed').style.cssText  = _style('closed');
    document.getElementById('csc-btn-created').style.cssText = _style('created');
    _showActive();
  }

  function _showActive() {
    const outer   = document.getElementById('tab-closed');
    const inner   = document.getElementById('tab-closed-inner');
    const created = document.getElementById('tab-created');
    if (!inner || !created) return;
    if (outer) outer.style.display = 'flex';
    if (_sub === 'closed') {
      inner.style.display   = 'block';
      created.style.display = 'none';
      DashClosed.render();
    } else {
      created.style.display = 'block';
      inner.style.display   = 'none';
      if (typeof IIPCreatedDashboard !== 'undefined') {
        IIPCreatedDashboard.render(created);
      }
    }
  }

  function render() {
    const outer = document.getElementById('tab-closed');
    if (outer) outer.style.display = 'flex';
    _wireBar();
    _showActive();
  }

  return { render };
})();


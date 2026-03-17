/* ============================================================
   js/dashboards/created.js  —  Created Cases tab
   Identical layout to Closed Cases but filters on Created date
   and uses all team cases (not just closed ones).
   ============================================================ */

function _cssClrCr(v) {
  try { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v; }
  catch(e) { return v; }
}

const DashCreated = (() => {

  let _year = "", _month = "", _fromDate = "", _toDate = "", _lastDays = "";
  let _ownerFilter = "";
  let _tableRef = null;

  function _yearSelect(id, selected) {
    const yearsFromData = (() => {
      try {
        const all = Data.allCases();
        const ySet = new Set();
        all.forEach(r => {
          const v = (r["Created"] || "").trim();
          if (!v) return;
          const d = Utils.parseDate(v);
          if (d && !isNaN(d)) ySet.add(d.getFullYear());
        });
        return [...ySet].sort();
      } catch(e) { return [2023, 2024, 2025, 2026]; }
    })();
    const opts = yearsFromData.map(y =>
      `<option value="${y}" ${String(y)===String(selected)?"selected":""}>${y}</option>`).join("");
    return `<div class="filter-group"><span class="filter-label">Year</span>
      <select id="${id}" class="form-select"><option value="">All</option>${opts}</select></div>`;
  }

  function _monthSelect(id, selected) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const opts = months.map((m,i) => {
      const v = String(i+1).padStart(2,"0");
      return `<option value="${v}" ${v===selected?"selected":""}>${m}</option>`;
    }).join("");
    return `<div class="filter-group"><span class="filter-label">Month</span>
      <select id="${id}" class="form-select"><option value="">All</option>${opts}</select></div>`;
  }

  function render() {
    const el = document.getElementById("tab-created");
    if (!el) return;
    _tableRef = null; // reset so _drawAll creates a fresh table instance
    el.innerHTML = `
      <div class="kpi-row" id="cr-kpi-row"></div>
      <div class="filter-bar mt-5" style="flex-wrap:wrap;gap:8px">
        ${_yearSelect("cr-year",_year)} ${_monthSelect("cr-month",_month)}
        <div class="filter-group">
          <span class="filter-label">From</span>
          <input id="cr-from" type="date" class="form-input form-input-sm" value="${_fromDate}"/>
        </div>
        <div class="filter-group">
          <span class="filter-label">To</span>
          <input id="cr-to" type="date" class="form-input form-input-sm" value="${_toDate}"/>
        </div>
        <div class="filter-group">
          <span class="filter-label">Last N Days</span>
          <input id="cr-lastdays" type="number" class="form-input form-input-sm" style="width:90px" placeholder="e.g. 30" value="${_lastDays}"/>
        </div>
        <button id="cr-clear" class="btn btn-danger btn-sm">Clear</button>
        <span id="cr-count" class="text-muted" style="align-self:flex-end;font-size:12px"></span>
      </div>
      <div class="grid-3 mt-5" id="cr-charts-grid">
        <div class="tile">
          <div class="section-title">Monthly Created</div>
          <div class="chart-canvas-wrap" style="height:220px"><canvas id="chart-created-monthly"></canvas></div>
        </div>
        <div class="tile">
          <div class="section-title">Weekly Created (Last 12w)</div>
          <div class="chart-canvas-wrap" style="height:220px"><canvas id="chart-created-weekly"></canvas></div>
        </div>
        <div class="tile">
          <div class="section-title">Yearly Created</div>
          <div class="chart-canvas-wrap" style="height:220px"><canvas id="chart-created-yearly"></canvas></div>
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
    _bindFilters();
    _drawAll();
  }

  function _filtered() {
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

  function _setEls(map) {
    Object.entries(map).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
  }

  function _drawAll(ownerFilter) {
    if (ownerFilter !== undefined) _ownerFilter = ownerFilter;
    const cases     = _filtered();
    const tableData = _ownerFilter ? cases.filter(r => r.Owner === _ownerFilter) : cases;

    _renderKPIs(cases);

    const lastDaysMode = !!(_lastDays && parseInt(_lastDays,10) > 0);
    const grid = document.getElementById("cr-charts-grid");
    if (grid) grid.style.display = lastDaysMode ? "none" : "";

    if (lastDaysMode) {
      const n = parseInt(_lastDays, 10);
      const toD = new Date(), fromD = new Date();
      fromD.setDate(toD.getDate() - n);
      const pad = v => String(v).padStart(2,"0");
      _setEls({
        "cr-from":  fromD.getFullYear()+"-"+pad(fromD.getMonth()+1)+"-"+pad(fromD.getDate()),
        "cr-to":    toD.getFullYear()+"-"+pad(toD.getMonth()+1)+"-"+pad(toD.getDate()),
        "cr-year":  String(fromD.getFullYear()),
        "cr-month": pad(fromD.getMonth()+1)
      });
    }

    if (!lastDaysMode) { _drawMonthly(cases); _drawWeekly(cases); _drawYearly(cases); }

    Charts.ownerBar("chart-created-owners", Utils.ownerCounts(cases), {
      color: _cssClrCr("--chart-1"),
      onClick: name => {
        _drawAll(name === _ownerFilter ? "" : name);
        document.getElementById("tbl-created")?.scrollIntoView({ behavior:"smooth", block:"start" });
      }
    });

    const tblEl = document.getElementById("tbl-created");
    if (_tableRef) {
      _tableRef.refresh(tableData);
    } else {
      _tableRef = Table.render(tblEl, tableData, {
      showActions: false,
      defaultSortKey: "Created",
      defaultSortDir: 1,
      columns: [
        { key:"Case Number", label:"Case Number", class:"col-case-num",
          render: row => {
            const perfIcon = (typeof Data!=="undefined" && Data.isMarkedPerformance && Data.isMarkedPerformance(row["Case Number"]))
              ? `<span title="Performance Case" style="color:var(--red);margin-right:4px;display:inline-flex;align-items:center;vertical-align:middle"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>` : "";
            const cn = Utils.escHtml(row["Case Number"]);
            return `${perfIcon}<span class="case-number-copy" data-cn="${cn}" title="Click to copy" style="cursor:pointer;color:#2563eb;font-weight:600;font-family:var(--font-mono)">${cn}</span>`;
          }},
        { key:"Owner",  label:"Owner",  class:"col-owner",   render: row => Utils.escHtml(Utils.shortName(row.Owner)) },
        { key:"Status", label:"Status",                      render: row => Utils.statusBadge(row.Status) },
        { key:"Product",label:"Product",class:"col-product", render: row => `<span title="${Utils.escHtml(row.Product)}">${Utils.escHtml(row.Product)}</span>` },
        { key:"Customer number", label:"Customer #", class:"col-date text-mono", render: row => Utils.escHtml(row["Customer number"]||"—") },
        { key:"Created", label:"Created", class:"col-date",
          sortValue: row => { const d=Utils.parseDate(row.Created); return d?d.getTime():0; },
          render: row => Utils.fmtDateShort(row.Created) },
        { key:"Updated", label:"Updated", class:"col-stale",
          render: row => {
            const d=Utils.parseDate(row.Updated), days=Utils.daysDiff(d);
            return `<span style="color:${days>=5?_cssClrCr("--red"):_cssClrCr("--text-tertiary")}">${Utils.fmtDateShort(row.Updated)}</span>`
                 + (days>=5?` <span class="stale-days">(+${days}d)</span>`:"");
          }},
        { key:"Severity", label:"Severity", class:"col-sev",
          render: row => {
            const s=String(row.Severity||"").trim();
            const col=s.startsWith("1")?_cssClrCr("--red"):s.startsWith("2")?_cssClrCr("--orange"):s.startsWith("3")?_cssClrCr("--yellow"):_cssClrCr("--text-tertiary");
            return `<span style="font-weight:700;color:${col};font-family:var(--font-mono)">${Utils.escHtml(s||"—")}</span>`;
          }},
        { key:"Age", label:"Age (days)", class:"col-age text-mono",
          render: row => {
            const a=parseInt(row.Age||"0",10);
            return `<span style="font-family:var(--font-mono);color:${a>30?_cssClrCr("--red"):a>14?_cssClrCr("--orange"):_cssClrCr("--text-tertiary")}">${a>0?a+"d":"—"}</span>`;
          }},
        { key:"Title", label:"Title", class:"col-title", sortable:false,
          render: row => `<span title="${Utils.escHtml(row.Title)}">${Utils.escHtml(row.Title)}</span>` }
      ]
    });
    }

    const cnt = document.getElementById("cr-count");
    if (cnt) cnt.textContent = `${cases.length} cases`;
  }

  function _renderKPIs(cases) {
    const row = document.getElementById("cr-kpi-row");
    if (!row) return;
    const acc02 = cases.filter(r => (r["Customer number"]||"").replace(/^0+/,"").startsWith("2"));
    const acc08 = cases.filter(r => (r["Customer number"]||"").includes(Data.customerAccountId?Data.customerAccountId():"881812"));
    const kpi = (label, value, cls) => `<div class="kpi-card ${cls}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>`;
    row.innerHTML = [kpi("Total Created",cases.length,""), kpi("02 Account",acc02.length,"kpi-blue"), kpi("08 Account",acc08.length,"kpi-purple")].join("");
  }

  function _isoWeekKey(d) {
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return d.getFullYear() + "-W" + String(week).padStart(2,"0");
  }

  function _drawMonthly(cases) {
    const counts = {};
    cases.forEach(r => { const d=Utils.parseDate(r.Created); if(!d) return; const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); counts[k]=(counts[k]||0)+1; });
    const sorted = Object.keys(counts).sort().slice(-18);
    const labels = sorted.map(k => { const [y,m]=k.split("-"); return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]+" "+y.slice(2); });
    _drawBarChart("chart-created-monthly", labels, sorted.map(k=>counts[k]), _cssClrCr("--chart-1"), label => {
      const mos = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const [mon,yy]=label.split(" "), mm=String(mos.indexOf(mon)+1).padStart(2,"0"), yyyy=(parseInt(yy)<50?"20":"19")+yy;
      _fromDate=yyyy+"-"+mm+"-01"; _toDate=yyyy+"-"+mm+"-"+String(new Date(parseInt(yyyy),parseInt(mm),0).getDate()).padStart(2,"0");
      _year=yyyy; _month=mm; _lastDays="";
      _setEls({"cr-year":yyyy,"cr-month":mm,"cr-from":_fromDate,"cr-to":_toDate,"cr-lastdays":""});
      _ownerFilter=""; _drawAll();
      document.getElementById("tbl-created")?.scrollIntoView({behavior:"smooth",block:"start"});
    });
  }

  function _drawWeekly(cases) {
    const now = new Date(), weekBuckets = {};
    for (let i=11;i>=0;i--) { const d=new Date(now); d.setDate(d.getDate()-i*7); weekBuckets[_isoWeekKey(d)]=0; }
    cases.forEach(r => {
      const d=Utils.parseDate(r.Created); if(!d) return;
      const diff=Math.floor((now-d)/(7*24*3600*1000));
      if(diff>=0&&diff<12){const k=_isoWeekKey(new Date(now.getTime()-diff*7*24*3600*1000)); if(k in weekBuckets)weekBuckets[k]++;}
    });
    const keys=Object.keys(weekBuckets).sort(), labels=keys.map(k=>"W"+k.split("-W")[1]);
    _drawBarChart("chart-created-weekly", labels, keys.map(k=>weekBuckets[k]), _cssClrCr("--chart-6"), label => {
      const wkKey=keys.find(k=>k.endsWith("-W"+label.replace("W",""))); if(!wkKey) return;
      const [yr,wn]=wkKey.split("-W"), jan1=new Date(parseInt(yr),0,1), startOfWk=new Date(jan1);
      startOfWk.setDate(jan1.getDate()+(parseInt(wn)-1)*7-jan1.getDay());
      const endOfWk=new Date(startOfWk); endOfWk.setDate(startOfWk.getDate()+6);
      const fmt=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
      _fromDate=fmt(startOfWk); _toDate=fmt(endOfWk); _year=""; _month=""; _lastDays="";
      _setEls({"cr-year":"","cr-month":"","cr-lastdays":"","cr-from":_fromDate,"cr-to":_toDate});
      _ownerFilter=""; _drawAll();
      document.getElementById("tbl-created")?.scrollIntoView({behavior:"smooth",block:"start"});
    });
  }

  function _drawYearly(cases) {
    const counts={};
    cases.forEach(r=>{const d=Utils.parseDate(r.Created);if(!d)return;const y=String(d.getFullYear());counts[y]=(counts[y]||0)+1;});
    const sorted=Object.keys(counts).sort();
    _drawBarChart("chart-created-yearly", sorted, sorted.map(k=>counts[k]), _cssClrCr("--chart-4"), label => {
      _year=label; _month=""; _fromDate=""; _toDate=""; _lastDays="";
      _setEls({"cr-year":label,"cr-month":"","cr-from":"","cr-to":"","cr-lastdays":""});
      _ownerFilter=""; _drawAll();
      document.getElementById("tbl-created")?.scrollIntoView({behavior:"smooth",block:"start"});
    });
  }

  function _drawBarChart(canvasId, labels, data, color, onBarClick) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (typeof Chart === "undefined") { setTimeout(()=>_drawBarChart(canvasId,labels,data,color,onBarClick),200); return; }
    try { const ex=Chart.getChart?.(canvas); if(ex) ex.destroy(); } catch(e) {}
    new Chart(canvas, {
      type: "bar",
      data: { labels, datasets:[{ data, backgroundColor:color, hoverBackgroundColor:color, borderRadius:3 }] },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{
          backgroundColor:"#fff", borderColor:_cssClrCr("--border-subtle"), borderWidth:1,
          titleColor:_cssClrCr("--text-primary"), bodyColor:_cssClrCr("--text-secondary"),
          callbacks:{ label: item => ` ${item.raw} cases — click to filter` }
        }},
        scales:{
          x:{ grid:{display:false}, ticks:{color:_cssClrCr("--text-tertiary"),font:{size:10},maxRotation:45} },
          y:{ grid:{color:"rgba(0,0,0,0.06)"}, ticks:{color:_cssClrCr("--text-tertiary"),font:{size:11},precision:0,callback:v=>Number.isInteger(v)?v:null}, beginAtZero:true }
        },
        onClick: onBarClick?(evt,els)=>{if(els.length)onBarClick(labels[els[0].index]);}:undefined
      }
    });
    if (onBarClick) canvas.style.cursor="pointer";
  }

  function _bindFilters() {
    document.getElementById("cr-year")?.addEventListener("change",    e=>{_year=e.target.value;_ownerFilter="";_drawAll();});
    document.getElementById("cr-month")?.addEventListener("change",   e=>{_month=e.target.value;_ownerFilter="";_drawAll();});
    document.getElementById("cr-from")?.addEventListener("change",    e=>{_fromDate=e.target.value;_year="";_month="";_setEls({"cr-year":"","cr-month":""});_ownerFilter="";_drawAll();});
    document.getElementById("cr-to")?.addEventListener("change",      e=>{_toDate=e.target.value;_year="";_month="";_setEls({"cr-year":"","cr-month":""});_ownerFilter="";_drawAll();});
    document.getElementById("cr-lastdays")?.addEventListener("input", e=>{_lastDays=e.target.value;_year="";_month="";_fromDate="";_toDate="";_setEls({"cr-year":"","cr-month":"","cr-from":"","cr-to":""});_ownerFilter="";_drawAll();});
    document.getElementById("cr-clear")?.addEventListener("click", ()=>{
      _year="";_month="";_fromDate="";_toDate="";_lastDays="";_ownerFilter="";
      _setEls({"cr-year":"","cr-month":"","cr-from":"","cr-to":"","cr-lastdays":""});
      _drawAll();
    });
  }

  return { render };
})();

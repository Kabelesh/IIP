/* ============================================================
   js/dashboards/customer.js  —  Customer Cases tab
   ============================================================ */
const DashCustomer = (() => {
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

  let _year="", _month="", _status="", _fromDate="", _toDate="", _lastDays="";
  let _ownerFilter="";
  let _tableRef = null;

  function render() {
    const el = document.getElementById("tab-customer");
    if (!el) return;
    _tableRef = null; // reset so drawAll creates a fresh table instance

    // Only 2 status options: In Progress and Closed
    const statusOpts = [
      { label: "In Progress",  value: "__inprogress__" },
      { label: "Closed Cases", value: "__closed__"     },
    ].map(s=>`<option value="${s.value}" ${_status===s.value?"selected":""}>${s.label}</option>`)
     .join("");

    el.innerHTML = `
      <div class="kpi-row" id="cust-kpi-row"></div>
      <div class="filter-bar mt-5" style="flex-wrap:wrap;gap:8px">
        ${yearSelect("cu-year",_year)} ${monthSelect("cu-month",_month)}
        <div class="filter-group">
          <span class="filter-label">Status</span>
          <select id="cu-status" class="form-select" style="min-width:160px">
            <option value="">All</option>${statusOpts}
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">From</span>
          <input id="cu-from" type="date" class="form-input form-input-sm" class="w-140" value="${_fromDate}"/>
        </div>
        <div class="filter-group">
          <span class="filter-label">To</span>
          <input id="cu-to" type="date" class="form-input form-input-sm" class="w-140" value="${_toDate}"/>
        </div>
        <div class="filter-group">
          <span class="filter-label">Last N Days</span>
          <input id="cu-lastdays" type="number" class="form-input form-input-sm" class="w-80" placeholder="e.g. 5" value="${_lastDays}"/>
        </div>
        <button id="cu-clear" class="btn btn-danger btn-sm" class="align-end">Clear</button>
        <span id="cu-count" class="text-muted" style="align-self:flex-end;font-size:12px"></span>
      </div>
      <div class="tile mt-5">
        <div class="section-title">Owner vs Customer Cases</div>
        <div class="chart-canvas-wrap" style="height:300px"><canvas id="chart-cust-owners"></canvas></div>
      </div>
      <div class="tile mt-5">
        <div class="section-title">Customer Cases</div>
        <div id="tbl-cust"></div>
      </div>
    `;

    document.getElementById("cu-status")?.addEventListener("change",e=>{_status=e.target.value;_ownerFilter="";drawAll();});
    document.getElementById("cu-year")?.addEventListener("change",e=>{_year=e.target.value;_ownerFilter="";drawAll();});
    document.getElementById("cu-month")?.addEventListener("change",e=>{_month=e.target.value;_ownerFilter="";drawAll();});
    document.getElementById("cu-from")?.addEventListener("change",e=>{_fromDate=e.target.value;_year="";_month="";document.getElementById("cu-year").value="";document.getElementById("cu-month").value="";_ownerFilter="";drawAll();});
    document.getElementById("cu-to")?.addEventListener("change",e=>{_toDate=e.target.value;_year="";_month="";document.getElementById("cu-year").value="";document.getElementById("cu-month").value="";_ownerFilter="";drawAll();});
    document.getElementById("cu-lastdays")?.addEventListener("input",e=>{_lastDays=e.target.value;_year="";_month="";_fromDate="";_toDate="";document.getElementById("cu-year").value="";document.getElementById("cu-month").value="";document.getElementById("cu-from").value="";document.getElementById("cu-to").value="";_ownerFilter="";drawAll();});
    document.getElementById("cu-clear")?.addEventListener("click",()=>{
      _status="";_year="";_month="";_fromDate="";_toDate="";_lastDays="";_ownerFilter="";
      document.getElementById("cu-status").value="";
      document.getElementById("cu-year").value="";
      document.getElementById("cu-month").value="";
      document.getElementById("cu-from").value="";
      document.getElementById("cu-to").value="";
      document.getElementById("cu-lastdays").value="";
      drawAll();
    });

    drawAll();
  }

  function filtered() {
    const today = new Date();
    return Data.customerCases().filter(r => {
      // Status group filter
      if (_status === "__inprogress__") {
        if (Utils.isClosed(r.Status)) return false;
      } else if (_status === "__closed__") {
        if (!Utils.isClosed(r.Status)) return false;
      }
      // Date filters (use Created date for customer cases)
      const d = Utils.parseDate(r.Created) || Utils.parseDate(r["Closed Date"]);
      if (_year  && (!d || String(d.getFullYear())!==_year)) return false;
      if (_month && (!d || String(d.getMonth()+1).padStart(2,"0")!==_month)) return false;
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
    let tableData = _ownerFilter ? cases.filter(r=>r.Owner===_ownerFilter) : cases;

    renderKPIs(cases);

    Charts.ownerBar("chart-cust-owners", Utils.ownerCounts(cases).slice(0,15), {
      color:"var(--purple)",
      onClick: name => drawAll(name === _ownerFilter ? "" : name)
    });

    const tblEl = document.getElementById("tbl-cust");
    if (_tableRef) {
      _tableRef.refresh(tableData);
    } else {
      _tableRef = Table.render(tblEl, tableData, { showActions:false });
    }
    const cnt=document.getElementById("cu-count");
    if(cnt) cnt.textContent=`${cases.length} cases`;
  }

  function renderKPIs(cases) {
    const row=document.getElementById("cust-kpi-row");
    if(!row) return;
    const allCust = Data.customerCases(); // always use full set for closed KPI
    const open  =cases.filter(r=>!Utils.isClosed(r.Status));
    const close =cases.filter(r=> Utils.isClosed(r.Status));
    const inprog=cases.filter(r=>r.Status==="IBM is working"||r.Status==="Waiting for IBM");
    const closed7d = allCust.filter(r => {
      if (!Utils.isClosed(r.Status)) return false;
      const d = Utils.parseDate(r.Updated || r.Created);
      return d && (Utils.today() - d) / 86400000 <= 7;
    });
    row.innerHTML=[
      kpi("Total Customer Cases", cases.length,     ""),
      kpi("In Progress",          open.length,      "kpi-yellow"),
      kpi("Closed (Last 7days)",     closed7d.length,  "kpi-green"),
      kpi("IBM Working",          inprog.length,    "kpi-blue"),
    ].join("");
  }

  function kpi(label,value,cls){
    return `<div class="kpi-card ${cls}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>`;
  }
  return { render };
})();

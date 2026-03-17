// =============================================================================
// frontend/js/modules/closed-cases-ux.js
// Closed Cases UX Enhancements — IIP Phase 2, Fixes 2.8 / 2.9
//
// Fix 2.8  Virtual scrolling for the 1,874-row closed cases table
//          Uses a windowed rendering approach: only renders ~40 rows at a time
//          in a fixed-height container. Eliminates browser freeze on low-end hardware.
//
// Fix 2.9  Resolution time KPIs for the closed cases dashboard
//          Adds a KPI strip above the closed cases table showing:
//          - Average resolution time (overall, Sev-2, Sev-3)
//          - Median resolution time
//          - % resolved within 7 / 30 days
//          - Resolution time by product (bar chart)
//          - Resolution time by owner (top 8)
//
// INSTALLATION:
//   Add to index.html:
//     <script src="js/modules/closed-cases-ux.js"></script>
// =============================================================================

'use strict';

(function (window, document) {

  // ── CSS ────────────────────────────────────────────────────────────────────
  const CSS = `
    /* Fix 2.9 – KPI strip */
    .iip-closed-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .iip-closed-kpi {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 12px;
      background: #fff;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .iip-closed-kpi-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
    .iip-closed-kpi-value { font-size: 26px; font-weight: 800; color: #111827; line-height: 1.1; }
    .iip-closed-kpi-sub   { font-size: 11px; color: #6b7280; }
    .iip-closed-kpi.accent-blue   { border-top: 3px solid #2563eb; }
    .iip-closed-kpi.accent-green  { border-top: 3px solid #16a34a; }
    .iip-closed-kpi.accent-orange { border-top: 3px solid #f59e0b; }
    .iip-closed-kpi.accent-purple { border-top: 3px solid #7c3aed; }

    .iip-closed-charts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .iip-res-chart {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .iip-res-chart h4 {
      font-size: 12px; font-weight: 700; color: #374151;
      margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .iip-res-bar-row  { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
    .iip-res-bar-label{ font-size: 11px; color: #6b7280; flex: 0 0 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .iip-res-bar-track{ flex: 1; height: 12px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
    .iip-res-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
    .iip-res-bar-val  { font-size: 11px; font-weight: 700; color: #374151; flex: 0 0 38px; text-align: right; }

    /* Fix 2.8 – Virtual scroller */
    .iip-vs-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    .iip-vs-scroll {
      height: 560px;
      overflow-y: auto;
      overflow-x: auto;
      border: 1px solid #e5e7eb;
      border-radius: 0 0 8px 8px;
      background: #fff;
    }
    .iip-vs-scroll::-webkit-scrollbar       { width: 8px; height: 8px; }
    .iip-vs-scroll::-webkit-scrollbar-track { background: #f9fafb; }
    .iip-vs-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
    .iip-vs-spacer { pointer-events: none; }
    .iip-vs-table-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }
    table.iip-vs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    table.iip-vs-table th {
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      background: #f9fafb;
    }
    table.iip-vs-table th:hover { color: #2563eb; }
    table.iip-vs-table th.sorted { color: #2563eb; }
    table.iip-vs-table th.sorted::after { content: ' ↓'; font-size: 10px; }
    table.iip-vs-table th.sorted.asc::after { content: ' ↑'; }
    table.iip-vs-table td {
      padding: 9px 12px;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
      vertical-align: middle;
      white-space: nowrap;
    }
    table.iip-vs-table tr:hover td { background: #f8faff; }

    .iip-vs-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      font-size: 12px;
      color: #6b7280;
    }
    .iip-vs-info strong { color: #374151; }
    .iip-vs-search {
      padding: 5px 10px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
      width: 200px;
      font-family: inherit;
    }
    .iip-vs-search:focus { outline: 2px solid #2563eb; border-color: #2563eb; }

    /* Severity badges */
    .iip-sev-2b { color: #b45309; font-weight: 700; }
    .iip-sev-3b { color: #1d4ed8; }
    .iip-sev-4b { color: #16a34a; }
    .iip-status-archived { color: #9ca3af; font-size: 11px; }
    .iip-status-closed-ibm    { color: #16a34a; font-weight: 600; font-size: 11px; }
    .iip-status-closed-client { color: #2563eb; font-weight: 600; font-size: 11px; }

    @media (max-width: 800px) {
      .iip-closed-charts { grid-template-columns: 1fr; }
      .iip-closed-kpis   { grid-template-columns: repeat(2, 1fr); }
      .iip-vs-scroll     { height: 400px; }
    }
  `;

  function injectCSS() {
    if (document.getElementById('iip-closed-ux-css')) return;
    const style = document.createElement('style');
    style.id = 'iip-closed-ux-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ── Date parsing ───────────────────────────────────────────────────────────

  function parseDate(s) {
    if (!s || !s.trim()) return null;
    for (const re of [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    ]) {
      const m = s.trim().match(re);
      if (!m) continue;
      let [,mo,dy,yr,hr=0,min=0,ampm] = m;
      hr=parseInt(hr); min=parseInt(min);
      if (ampm) { if (ampm.toUpperCase()==='PM'&&hr!==12) hr+=12; if (ampm.toUpperCase()==='AM'&&hr===12) hr=0; }
      return new Date(parseInt(yr),parseInt(mo)-1,parseInt(dy),hr,min);
    }
    return null;
  }

  function resolutionDays(c) {
    const cr = parseDate(c.Created    || c.created    || '');
    const cl = parseDate(c['Closed Date'] || c.closedDate || '');
    if (!cr || !cl) return null;
    const d = Math.floor((cl - cr) / 86400000);
    return (d >= 0 && d <= 730) ? d : null;
  }

  function median(arr) {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b) => a-b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? Math.round((s[m-1]+s[m])/2) : s[m];
  }

  // ── Fix 2.9: Resolution time KPIs ─────────────────────────────────────────

  function buildResolutionKPIs(cases) {
    const resTimes = [], bySev = { '2':[], '3':[], '4':[] };
    const byProduct = {}, byOwner = {};

    for (const c of cases) {
      const d = resolutionDays(c);
      if (d === null) continue;
      resTimes.push(d);

      const sev = c.Severity || c.severity || '';
      if (bySev[sev]) bySev[sev].push(d);

      const prod = (c.Product || c.product || 'Unknown').replace('Engineering ','').slice(0,35);
      byProduct[prod] = byProduct[prod] || [];
      byProduct[prod].push(d);

      const owner = c.Owner || c.owner || '';
      byOwner[owner] = byOwner[owner] || [];
      byOwner[owner].push(d);
    }

    const n  = resTimes.length || 1;
    const avg    = Math.round(resTimes.reduce((a,b) => a+b, 0) / n);
    const med    = median(resTimes);
    const pct7d  = Math.round(resTimes.filter(d => d <= 7).length / n * 100);
    const pct30d = Math.round(resTimes.filter(d => d <= 30).length / n * 100);
    const avgSev2 = bySev['2'].length ? Math.round(bySev['2'].reduce((a,b)=>a+b,0)/bySev['2'].length) : '—';
    const avgSev3 = bySev['3'].length ? Math.round(bySev['3'].reduce((a,b)=>a+b,0)/bySev['3'].length) : '—';

    // Top 6 products by case count
    const prodStats = Object.entries(byProduct)
      .filter(([,t]) => t.length >= 5)
      .map(([p,t]) => ({ p, avg: Math.round(t.reduce((a,b)=>a+b,0)/t.length), n: t.length }))
      .sort((a,b) => b.n - a.n).slice(0, 6);

    // Top 8 owners (team members only)
    const ownerStats = Object.entries(byOwner)
      .filter(([,t]) => t.length >= 3)
      .map(([o,t]) => ({ o: o.split(' ').slice(0,2).join(' '), avg: Math.round(t.reduce((a,b)=>a+b,0)/t.length), n: t.length }))
      .sort((a,b) => b.n - a.n).slice(0, 8);

    return { avg, med, pct7d, pct30d, avgSev2, avgSev3, prodStats, ownerStats, total: n };
  }

  function renderResolutionKPIs(kpis, container) {
    const maxProd  = Math.max(...kpis.prodStats.map(x => x.avg), 1);
    const maxOwner = Math.max(...kpis.ownerStats.map(x => x.avg), 1);

    const prodBars = kpis.prodStats.map(({ p, avg, n }) => {
      const pct = Math.round(avg / maxProd * 100);
      const col = avg > 60 ? '#dc2626' : avg > 30 ? '#f59e0b' : '#10b981';
      return `<div class="iip-res-bar-row">
        <div class="iip-res-bar-label" title="${p} (${n} cases)">${p}</div>
        <div class="iip-res-bar-track"><div class="iip-res-bar-fill" style="width:${pct}%;background:${col};"></div></div>
        <div class="iip-res-bar-val">${avg}d</div>
      </div>`;
    }).join('');

    const ownerBars = kpis.ownerStats.map(({ o, avg, n }) => {
      const pct = Math.round(avg / maxOwner * 100);
      const col = avg > 60 ? '#dc2626' : avg > 35 ? '#f59e0b' : '#3b82f6';
      return `<div class="iip-res-bar-row">
        <div class="iip-res-bar-label" title="${o} (${n} cases)">${o}</div>
        <div class="iip-res-bar-track"><div class="iip-res-bar-fill" style="width:${pct}%;background:${col};"></div></div>
        <div class="iip-res-bar-val">${avg}d</div>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div class="iip-closed-kpis">
        <div class="iip-closed-kpi accent-blue">
          <div class="iip-closed-kpi-label">Avg Resolution</div>
          <div class="iip-closed-kpi-value">${kpis.avg}d</div>
          <div class="iip-closed-kpi-sub">Median: ${kpis.med}d | ${kpis.total} cases</div>
        </div>
        <div class="iip-closed-kpi accent-orange">
          <div class="iip-closed-kpi-label">Sev-2 Avg</div>
          <div class="iip-closed-kpi-value">${kpis.avgSev2}${typeof kpis.avgSev2==='number'?'d':''}</div>
          <div class="iip-closed-kpi-sub">Sev-3: ${kpis.avgSev3}${typeof kpis.avgSev3==='number'?'d':''}</div>
        </div>
        <div class="iip-closed-kpi accent-green">
          <div class="iip-closed-kpi-label">Resolved ≤ 7d</div>
          <div class="iip-closed-kpi-value">${kpis.pct7d}%</div>
          <div class="iip-closed-kpi-sub">${Math.round(kpis.total * kpis.pct7d / 100)} cases</div>
        </div>
        <div class="iip-closed-kpi accent-purple">
          <div class="iip-closed-kpi-label">Resolved ≤ 30d</div>
          <div class="iip-closed-kpi-value">${kpis.pct30d}%</div>
          <div class="iip-closed-kpi-sub">${Math.round(kpis.total * kpis.pct30d / 100)} cases</div>
        </div>
      </div>
      <div class="iip-closed-charts">
        <div class="iip-res-chart">
          <h4>Avg Resolution Days by Product</h4>
          ${prodBars || '<div style="color:#9ca3af;font-size:12px;">No data</div>'}
        </div>
        <div class="iip-res-chart">
          <h4>Avg Resolution Days by Owner</h4>
          ${ownerBars || '<div style="color:#9ca3af;font-size:12px;">No data</div>'}
        </div>
      </div>
    `;
  }

  // ── Fix 2.8: Virtual scroller ─────────────────────────────────────────────

  const ROW_HEIGHT  = 40;  // px per row (approximate)
  const BUFFER_ROWS = 10;  // render N extra rows above/below viewport
  const PAGE_SIZE   = 40;  // rows visible at a time

  function formatDate(s) {
    const d = parseDate(s);
    return d ? d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—';
  }

  function statusLabel(s) {
    if (!s) return '—';
    if (/archived/i.test(s)) return '<span class="iip-status-archived">Archived</span>';
    if (/by IBM/i.test(s))    return '<span class="iip-status-closed-ibm">✓ Closed by IBM</span>';
    if (/by Client/i.test(s)) return '<span class="iip-status-closed-client">✓ Closed by Client</span>';
    return s;
  }

  function renderRow(c) {
    const caseNum = c['Case Number'] || c.caseNumber || '';
    const sev     = c.Severity || c.severity || '?';
    const sevClass = sev==='2'?'iip-sev-2b':sev==='3'?'iip-sev-3b':sev==='4'?'iip-sev-4b':'';
    const rd = resolutionDays(c);
    const rdStr = rd !== null ? rd + 'd' : '—';
    const rdColor = rd === null ? '#9ca3af' : rd > 60 ? '#dc2626' : rd > 30 ? '#f59e0b' : '#16a34a';
    const owner = (c.Owner || c.owner || '—').split(' ').slice(0,2).join(' ');
    const prod  = (c.Product || c.product || '—').replace('Engineering ','').slice(0,28);


    return `<tr>
      <td><span class="case-number-copy" data-cn="${caseNum}" title="Click to copy" style="cursor:pointer;color:#2563eb;font-weight:600">${caseNum}</span></td>
      <td class="${sevClass}">Sev-${sev}</td>
      <td>${statusLabel(c.Status || c.status || '')}</td>
      <td>${owner}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;" title="${(c.Title||c.title||'')}">${(c.Title||c.title||'').slice(0,50)}</td>
      <td>${prod}</td>
      <td>${formatDate(c['Closed Date'] || c.closedDate || '')}</td>
      <td style="color:${rdColor};font-weight:${rd?'700':'400'};">${rdStr}</td>
    </tr>`;
  }

  /**
   * Creates a virtual-scroll table from an array of case objects.
   * Returns the container element (already populated).
   */
  function createVirtualTable(allRows, columns) {
    columns = columns || ['Case #','Sev','Status','Owner','Title','Product','Closed','Resolved In'];

    let filteredRows = allRows;
    let sortCol = 'Closed Date'; let sortAsc = false;
    let searchTerm = '';

    const wrap = document.createElement('div');
    wrap.className = 'iip-vs-wrapper';

    // Info bar + search
    const info = document.createElement('div');
    info.className = 'iip-vs-info';
    wrap.appendChild(info);

    // Table header (sticky)
    const headerDiv = document.createElement('div');
    headerDiv.className = 'iip-vs-table-header';
    const headerTable = document.createElement('table');
    headerTable.className = 'iip-vs-table';
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const colMap = { 'Case #':'Case Number', 'Sev':'Severity', 'Status':'Status', 'Owner':'Owner', 'Title':'Title', 'Product':'Product', 'Closed':'Closed Date', 'Resolved In':'_resdays' };

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      th.dataset.col = colMap[col] || col;
      th.addEventListener('click', () => {
        const c = th.dataset.col;
        if (sortCol === c) sortAsc = !sortAsc; else { sortCol = c; sortAsc = false; }
        thead.querySelectorAll('th').forEach(t => t.classList.remove('sorted','asc'));
        th.classList.add('sorted');
        if (sortAsc) th.classList.add('asc');
        applySort();
        rebuildRows();
      });
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    headerTable.appendChild(thead);
    headerDiv.appendChild(headerTable);
    wrap.appendChild(headerDiv);

    // Scroll container
    const scroller = document.createElement('div');
    scroller.className = 'iip-vs-scroll';
    wrap.appendChild(scroller);

    // Inner height spacer
    const spacer = document.createElement('div');
    spacer.className = 'iip-vs-spacer';
    scroller.appendChild(spacer);

    // Row container (positioned inside spacer)
    const tbody = document.createElement('table');
    tbody.className = 'iip-vs-table';
    const tbodyEl = document.createElement('tbody');
    tbody.appendChild(tbodyEl);
    scroller.appendChild(tbody);
    tbody.style.cssText = 'position:absolute;width:100%;left:0;';

    function applySearch() {
      if (!searchTerm) { filteredRows = allRows; return; }
      const q = searchTerm.toLowerCase();
      filteredRows = allRows.filter(c => {
        return (c['Case Number']||c.caseNumber||'').toLowerCase().includes(q)
            || (c.Title||c.title||'').toLowerCase().includes(q)
            || (c.Owner||c.owner||'').toLowerCase().includes(q)
            || (c.Product||c.product||'').toLowerCase().includes(q);
      });
    }

    function applySort() {
      filteredRows = filteredRows.sort((a,b) => {
        let va, vb;
        if (sortCol === '_resdays') {
          va = resolutionDays(a) ?? 9999;
          vb = resolutionDays(b) ?? 9999;
        } else if (/date|Date/i.test(sortCol)) {
          va = (parseDate(a[sortCol] || '') || new Date(0)).getTime();
          vb = (parseDate(b[sortCol] || '') || new Date(0)).getTime();
        } else if (/Severity|severity/i.test(sortCol)) {
          va = parseInt(a[sortCol] || '9');
          vb = parseInt(b[sortCol] || '9');
        } else {
          va = (a[sortCol] || '').toString().toLowerCase();
          vb = (b[sortCol] || '').toString().toLowerCase();
        }
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ? 1  : -1;
        return 0;
      });
    }

    function updateInfo() {
      const total = allRows.length, shown = filteredRows.length;
      info.innerHTML = `
        <span>Showing <strong>${shown.toLocaleString()}</strong>${shown<total?' of <strong>'+total.toLocaleString()+'</strong>':''} closed cases</span>
        <input class="iip-vs-search" id="iip-vs-search" type="text" placeholder="Search case, title, owner…" value="${searchTerm}">
      `;
      document.getElementById('iip-vs-search')?.addEventListener('input', e => {
        searchTerm = e.target.value.trim();
        applySearch(); applySort(); rebuildRows();
        scroller.scrollTop = 0;
      });
    }

    function rebuildRows() {
      updateInfo();
      const totalH = filteredRows.length * ROW_HEIGHT;
      spacer.style.height = totalH + 'px';

      renderVisible();
    }

    function renderVisible() {
      const scrollTop  = scroller.scrollTop;
      const viewH      = scroller.clientHeight || 560;
      const firstIdx   = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
      const lastIdx    = Math.min(filteredRows.length - 1, Math.ceil((scrollTop + viewH) / ROW_HEIGHT) + BUFFER_ROWS);

      tbodyEl.innerHTML = filteredRows.slice(firstIdx, lastIdx + 1).map(renderRow).join('');
      tbody.style.top = (firstIdx * ROW_HEIGHT) + 'px';
    }

    scroller.addEventListener('scroll', renderVisible, { passive: true });
    window.addEventListener('resize', renderVisible, { passive: true });

    // Initial render
    applySort();
    rebuildRows();

    return wrap;
  }

  // ── Fetch closed cases ─────────────────────────────────────────────────────

  async function fetchClosedCases() {
    try {
      // Use locally uploaded cases — no API
      const allData = (typeof Data !== 'undefined') ? Data.allCases() : [];
      return allData.filter(c => {
        const s = c.Status || c.status || '';
        return ['Closed - Archived','Closed by IBM','Closed by Client'].some(x => s.includes(x));
      });
    } catch (_) {}
    return [];
  }

  // ── Main: inject both enhancements into the closed cases panel ────────────

  async function enhanceClosedCasesPanel(panel) {
    if (panel.dataset.iipClosedEnhanced) return;
    // Guard: never enhance nav buttons or non-panel elements
    if (panel.tagName === 'BUTTON' || panel.tagName === 'A') return;
    if (panel.classList.contains('nav-item')) return;
    panel.dataset.iipClosedEnhanced = '1';

    let cases;
    try {
      cases = await fetchClosedCases();
    } catch (e) {
      console.error('[closed-cases-ux] Failed to load cases:', e.message);
      return;
    }

    if (!cases.length) return;

    // Find existing table in the panel (to replace with virtual scroller)
    const existingTable = panel.querySelector('table, .cases-table, .closed-table, #closed-table');

    // Create KPI container
    const kpiContainer = document.createElement('div');
    kpiContainer.id = 'iip-closed-kpi-container';

    // Compute and render KPIs
    const kpis = buildResolutionKPIs(cases);
    renderResolutionKPIs(kpis, kpiContainer);

    // Create virtual table
    const vtable = createVirtualTable(cases);

    // Inject: KPIs first, then virtual table
    if (existingTable) {
      existingTable.parentNode.insertBefore(kpiContainer, existingTable);
      existingTable.parentNode.insertBefore(vtable, existingTable);
      existingTable.style.display = 'none'; // hide original (don't remove in case app needs it)
    } else {
      panel.appendChild(kpiContainer);
      panel.appendChild(vtable);
    }
  }

  // ── Auto-mount ─────────────────────────────────────────────────────────────

  function mount() {
    injectCSS();

    const SELECTORS = [
      '#tab-closed',   // the actual content panel — never the nav button
      '#closed-panel', '#closed-cases', '.closed-cases-panel',
    ];

    function tryMount() {
      for (const sel of SELECTORS) {
        const el = document.querySelector(sel);
        if (el && !el.dataset.iipClosedEnhanced) {
          enhanceClosedCasesPanel(el);
          return true;
        }
      }
      return false;
    }

    tryMount();
    const obs = new MutationObserver(() => tryMount());
    obs.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab],[data-panel],[data-hash]');
      if (tab) {
        const t = tab.dataset.tab || tab.dataset.panel || tab.dataset.hash || '';
        if (/closed/.test(t)) setTimeout(tryMount, 300);
      }
    });
  }

  window.IIPClosedCasesUX = { buildResolutionKPIs, createVirtualTable };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

}(window, document));
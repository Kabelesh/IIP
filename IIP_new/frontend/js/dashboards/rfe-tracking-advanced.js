/* ============================================================
   rfe-tracking-advanced.js — IBM RFE Tracking  v4.0
   Uses native app design system: tile, kpi-card, data-table,
   form-input, chip, btn classes. No custom styling needed.
   ============================================================ */
const DashRFEAdvanced = (() => {

  /* ── Safe toast ──────────────────────────────────────────── */
  const _toast = (msg, type = 'success') => {
    if (typeof showToast === 'function') { showToast(msg, type); return; }
    if (typeof Utils !== 'undefined' && typeof Utils.toast === 'function') { Utils.toast(msg); return; }
    console.info('[RFE]', msg);
  };

  /* ── Storage ─────────────────────────────────────────────── */
  const LS_KEY       = 'ibm_rfe_tracking_v1';
  const TRACKING_KEY = 'ibm_rfe_tracking_metadata_v1';

  const _loadRFE  = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); } catch(e) { return []; } };
  const _loadMeta = () => { try { return JSON.parse(localStorage.getItem(TRACKING_KEY)||'{}'); } catch(e) { return {}; } };
  const _saveMeta = m  => { try { localStorage.setItem(TRACKING_KEY, JSON.stringify(m)); } catch(e) {} };

  const _getMeta = ref => {
    const m = _loadMeta();
    if (!m[ref]) m[ref] = { notes:[], tags:[], targetRelease:'', lastUpdated:new Date().toISOString() };
    return m[ref];
  };
  const _setMeta = (ref, updates) => {
    const m = _loadMeta();
    m[ref] = { ...(_getMeta(ref)), ...updates, lastUpdated:new Date().toISOString() };
    _saveMeta(m);
  };

  /* ── Public save (used by Admin portal) ──────────────────── */
  const saveRFEData      = d => { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch(e) {} };
  const saveTrackingMeta = _saveMeta;

  /* ── UI state ─────────────────────────────────────────────── */
  let _search='', _fProduct='', _fState='';
  let _sortCol='votes', _sortDir=-1;
  let _view='table';
  let _activeModal=null;

  /* ── Escape ──────────────────────────────────────────────── */
  const _esc = s => (typeof Utils!=='undefined'&&Utils.escHtml)
    ? Utils.escHtml(s)
    : String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  /* ── Excel serial date → real date ──────────────────────── */
  const _fmtDate = d => {
    if (!d && d !== 0) return '—';
    const raw = String(d).trim();
    if (!raw || raw === '0') return '—';

    // Excel serial number (e.g. 45450.2292)
    const serial = parseFloat(raw);
    if (!isNaN(serial) && serial > 1000 && serial < 100000) {
      // Excel epoch: Dec 30 1899. Adjust for Excel's leap year bug (serial > 59).
      const msPerDay = 86400000;
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const dt = new Date(excelEpoch.getTime() + serial * msPerDay);
      if (!isNaN(dt)) return dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    }

    // ISO or other parseable string
    try {
      const dt = new Date(raw);
      if (!isNaN(dt)) return dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    } catch(e) {}

    // Utils fallback
    if (typeof Utils !== 'undefined' && Utils.fmtDate) {
      try { const r = Utils.fmtDate(d); if (r) return r; } catch(e) {}
    }

    return raw.slice(0, 10);
  };

  /* ── State chip mapping ──────────────────────────────────── */
  const _stateChip = s => {
    if (!s) return 'chip chip-gray';
    const l = s.toLowerCase();
    if (l.includes('delivered'))  return 'chip chip-green';
    if (l.includes('planned'))    return 'chip chip-blue';
    if (l.includes('not under'))  return 'chip chip-gray';
    if (l.includes('under'))      return 'chip chip-purple';
    if (l.includes('future'))     return 'chip chip-yellow';
    return 'chip chip-gray';
  };

  /* ── Analytics calc ──────────────────────────────────────── */
  function _calc(data) {
    const a = { total:data.length, byState:{}, byProduct:{}, totalVotes:0, avgVotes:0,
                delivered:0, notConsidered:0, topVoted:null };
    if (!data.length) return a;
    let maxV = -1;
    data.forEach(r => {
      const state   = r['Workflow State']||'Unknown';
      const product = r['Product']||'Unknown';
      const votes   = parseInt(r['Vote Count'])||0;
      a.byState[state]     = (a.byState[state]   ||0)+1;
      a.byProduct[product] = (a.byProduct[product]||0)+1;
      a.totalVotes += votes;
      if (state.toLowerCase().includes('delivered'))  a.delivered++;
      if (state.toLowerCase().includes('not under'))  a.notConsidered++;
      if (votes > maxV) { maxV=votes; a.topVoted=r; }
    });
    a.avgVotes = Math.round(a.totalVotes/data.length*10)/10;
    return a;
  }

  /* ── Filter + sort ───────────────────────────────────────── */
  function _filter(data) {
    let rows = data.filter(r => {
      if (_fProduct && r['Product']!==_fProduct) return false;
      if (_fState   && r['Workflow State']!==_fState) return false;
      if (_search) {
        const q=[r['Idea Name'],r['Idea Reference'],r['Product'],r['Description']];
        if (!q.some(f=>String(f||'').toLowerCase().includes(_search.toLowerCase()))) return false;
      }
      return true;
    });
    rows.sort((a,b) => {
      let va, vb;
      if      (_sortCol==='votes')     { va=parseInt(a['Vote Count'])||0;    vb=parseInt(b['Vote Count'])||0; }
      else if (_sortCol==='name')      { va=(a['Idea Name']||'').toLowerCase(); vb=(b['Idea Name']||'').toLowerCase(); }
      else if (_sortCol==='reference') { va=a['Idea Reference']||'';         vb=b['Idea Reference']||''; }
      else if (_sortCol==='state')     { va=a['Workflow State']||'';         vb=b['Workflow State']||''; }
      else if (_sortCol==='product')   { va=a['Product']||'';                vb=b['Product']||''; }
      else if (_sortCol==='createdAt') { va=parseFloat(a['Created At'])||0;  vb=parseFloat(b['Created At'])||0; }
      else if (_sortCol==='updatedAt') { va=parseFloat(a['Updated At'])||0;  vb=parseFloat(b['Updated At'])||0; }
      else { return 0; }
      return va<vb ? -_sortDir : va>vb ? _sortDir : 0;
    });
    return rows;
  }

  /* ════════ RENDER ════════════════════════════════════════════ */
  function render() {
    const container = document.getElementById('tab-rfe-tracking');
    if (!container) return;

    const data      = _loadRFE();
    const analytics = _calc(data);
    const filtered  = _filter(data);
    const products  = [...new Set(data.map(r=>r['Product']).filter(Boolean))].sort();
    const states    = [...new Set(data.map(r=>r['Workflow State']).filter(Boolean))].sort();

    container.innerHTML = `
    <div style="padding:20px 24px 40px;font-family:var(--font-sans)">

      <!-- PAGE TITLE -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap">
        <div>
          <h2 style="font-size:var(--font-size-2xl);font-weight:700;color:var(--text-primary);margin:0 0 4px;letter-spacing:-.3px">RFE Tracking</h2>
          <p style="font-size:var(--font-size-sm);color:var(--text-tertiary);margin:0">Request for Enhancement — delivery tracking</p>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          <div style="display:flex;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);overflow:hidden;background:var(--bg-layer)">
            <button id="rfe-view-table" class="rfe-view-btn ${_view==='table'?'rfe-view-active':''}"
              style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;font-size:12px;font-weight:500;border:none;cursor:pointer;font-family:var(--font-sans);border-right:1px solid var(--border-subtle);transition:all var(--transition-fast);background:${_view==='table'?'var(--ibm-blue-10)':'transparent'};color:${_view==='table'?'var(--ibm-blue-50)':'var(--text-tertiary)'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              Table
            </button>
            <button id="rfe-view-analytics" class="rfe-view-btn ${_view==='analytics'?'rfe-view-active':''}"
              style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;font-size:12px;font-weight:500;border:none;cursor:pointer;font-family:var(--font-sans);transition:all var(--transition-fast);background:${_view==='analytics'?'var(--ibm-blue-10)':'transparent'};color:${_view==='analytics'?'var(--ibm-blue-50)':'var(--text-tertiary)'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Analytics
            </button>
          </div>
          <button id="rfe-export" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <!-- KPI ROW -->
      <div class="kpi-row" style="margin-bottom:20px">
        <div class="kpi-card kpi-blue">
          <div class="kpi-label">Total RFEs</div>
          <div class="kpi-value">${analytics.total}</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-label">Delivered</div>
          <div class="kpi-value">${analytics.delivered}</div>
        </div>
        <div class="kpi-card kpi-yellow">
          <div class="kpi-label">Not Considered</div>
          <div class="kpi-value">${analytics.notConsidered}</div>
        </div>
        <div class="kpi-card kpi-teal">
          <div class="kpi-label">Avg Votes</div>
          <div class="kpi-value">${analytics.avgVotes.toFixed(1)}</div>
          ${analytics.topVoted ? `<div class="kpi-sub">Top: ${_esc((analytics.topVoted['Idea Name']||'').slice(0,30))}…</div>` : ''}
        </div>
      </div>

      <!-- CONTROLS -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <div class="form-input-group" style="flex:1;min-width:200px;max-width:340px">
          <span class="input-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input id="rfe-search" class="search-input" placeholder="Search by name, reference, product…" value="${_esc(_search)}"/>
        </div>
        <select id="rfe-fp" class="form-input form-input-sm" style="min-width:130px">
          <option value="">All Products</option>
          ${products.map(p=>`<option value="${_esc(p)}" ${_fProduct===p?'selected':''}>${_esc(p)}</option>`).join('')}
        </select>
        <select id="rfe-fs" class="form-input form-input-sm" style="min-width:130px">
          <option value="">All States</option>
          ${states.map(s=>`<option value="${_esc(s)}" ${_fState===s?'selected':''}>${_esc(s)}</option>`).join('')}
        </select>
        <span style="font-size:12px;font-weight:600;color:var(--text-primary);font-family:var(--font-mono);margin-left:auto">
          ${filtered.length}<span style="color:var(--text-tertiary);font-weight:400"> of ${data.length}</span>
        </span>
      </div>

      <!-- TABLE VIEW -->
      <div id="rfe-table-view" style="display:${_view==='table'?'block':'none'}">
        ${data.length===0 ? _emptyState() : _renderTable(filtered)}
      </div>

      <!-- ANALYTICS VIEW -->
      <div id="rfe-analytics-view" style="display:${_view==='analytics'?'block':'none'}">
        ${_renderAnalytics(analytics, data)}
      </div>

    </div>

    <!-- MODAL -->
    <div id="rfe-modal" style="display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center">
      <div id="rfe-modal-bd" style="position:absolute;inset:0;background:rgba(0,0,0,.48);backdrop-filter:blur(3px)"></div>
      <div id="rfe-modal-box" style="position:relative;z-index:1;background:var(--bg-ui);border:1px solid var(--border-mid);border-radius:var(--radius-lg);box-shadow:var(--shadow-xl);width:92%;max-width:660px;max-height:90vh;overflow-y:auto;animation:rfe-modal-in .2s var(--ease-std) both"></div>
    </div>
    <style>
      @keyframes rfe-modal-in { from{opacity:0;transform:scale(.96) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
      @keyframes rfe-row-in   { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
      .rfe-row-anim { animation: rfe-row-in .24s var(--ease-std) both; }
      .rfe-detail-btn { opacity:0; transition:opacity var(--transition-fast); }
      .data-table tbody tr:hover .rfe-detail-btn { opacity:1; }
    </style>`;

    _bind(data);
  }

  /* ── Empty state ─────────────────────────────────────────── */
  function _emptyState() {
    return `<div class="tile" style="text-align:center;padding:64px 32px">
      <div style="font-size:32px;margin-bottom:12px;opacity:.35">📄</div>
      <div style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">No RFE data loaded</div>
      <div style="font-size:13px;color:var(--text-tertiary);line-height:1.65;max-width:420px;margin:0 auto">
        Upload an RFE CSV or Excel export from Aha! via the Admin Portal.<br>
        Expected columns: Idea Reference, Idea Name, Product, Workflow State, Vote Count, Is Complete, Created At, Updated At, URL.
      </div>
    </div>`;
  }

  /* ── Table ───────────────────────────────────────────────── */
  function _renderTable(rows) {
    if (!rows.length) return `<div class="tile" style="text-align:center;padding:56px">
      <div style="font-size:24px;margin-bottom:10px;opacity:.4">🔍</div>
      <div style="font-size:14px;font-weight:600;color:var(--text-secondary)">No results match your filters</div>
    </div>`;

    const _th = (col, label, align='left') => {
      const active = _sortCol===col;
      const arrow  = active ? (_sortDir===1?'▲':'▼') : '⇅';
      return `<th class="sort-th${active?' sort-active':''}" data-col="${col}" style="text-align:${align};cursor:pointer;user-select:none">
        ${label}<span style="font-size:9px;margin-left:3px;opacity:.55">${arrow}</span>
      </th>`;
    };

    const trs = rows.map((r,i) => {
      const ref    = r['Idea Reference']||'';
      const m      = _getMeta(ref);
      const votes  = parseInt(r['Vote Count'])||0;
      const state  = r['Workflow State']||'';
      const prod   = (r['Product']||'').replace('IBM Engineering - ','').replace('IBM Engineering ','');
      const isComplete = (r['Is Complete']==='True'||r['Is Complete']===true||r['Is Complete']==='true');
      const hasNote = m.notes && m.notes.length > 0;

      return `<tr class="rfe-row-anim" data-ref="${_esc(ref)}" style="cursor:pointer;animation-delay:${Math.min(i*12,240)}ms">
        <td>
          <a href="https://ideas.ibm.com/search?query=${_esc(ref)}" target="_blank" rel="noopener"
             class="col-case-num"
             style="font-family:var(--font-mono);font-size:11px;font-weight:500;text-decoration:none"
             title="Open in Aha!"
             onclick="event.stopPropagation()">${_esc(ref)}</a>
        </td>
        <td style="max-width:260px">
          <div style="font-size:13px;font-weight:500;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${_esc(r['Idea Name']||'')}">
            ${_esc(r['Idea Name']||'—')}
          </div>
          ${m.targetRelease ? `<span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-xl);background:var(--ibm-blue-10);color:var(--ibm-blue-50);border:1px solid var(--ibm-blue-20);font-family:var(--font-mono);margin-top:2px;display:inline-block">${_esc(m.targetRelease)}</span>` : ''}
          ${hasNote ? `<span style="font-size:9px;color:var(--orange);margin-left:4px" title="${m.notes.length} note${m.notes.length!==1?'s':''}">●</span>` : ''}
        </td>
        <td style="max-width:140px">
          <span style="font-size:12px;color:var(--text-secondary);background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:2px 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;max-width:130px" title="${_esc(r['Product']||'')}">${_esc(prod||r['Product']||'—')}</span>
        </td>
        <td><span class="${_stateChip(state)}" style="font-size:10px;white-space:nowrap">${_esc(state||'—')}</span></td>
        <td style="text-align:center">
          <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:${votes>=10?'var(--chart-3)':'var(--text-secondary)'}">${votes}${votes>=10?' ⭐':''}</span>
        </td>
        <td style="text-align:center">
          ${isComplete
            ? `<span style="color:var(--green);font-size:14px;font-weight:700">✓</span>`
            : `<span style="color:var(--text-disabled)">—</span>`}
        </td>
        <td class="col-date">${_fmtDate(r['Created At'])}</td>
        <td class="col-date">${_fmtDate(r['Updated At'])}</td>
        <td>
          <button class="btn btn-ghost btn-xs rfe-detail-btn" data-ref="${_esc(ref)}" title="Open details" onclick="event.stopPropagation()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </td>
      </tr>`;
    }).join('');

    return `<div class="tile" style="padding:0;overflow:hidden">
      <div class="data-table-wrap">
        <table class="data-table" style="min-width:900px">
          <thead><tr>
            ${_th('reference','Reference')}
            ${_th('name','Idea Name')}
            ${_th('product','Product')}
            ${_th('state','State')}
            ${_th('votes','Votes','center')}
            <th style="text-align:center">Complete</th>
            ${_th('createdAt','Created','center')}
            ${_th('updatedAt','Updated','center')}
            <th></th>
          </tr></thead>
          <tbody>${trs}</tbody>
        </table>
      </div>
    </div>`;
  }

  /* ── Analytics ───────────────────────────────────────────── */
  function _renderAnalytics(a, data) {
    if (!data.length) return _emptyState();

    const stateColors = {
      'Delivered':'var(--green)', 'Planned':'var(--ibm-blue-50)',
      'Under consideration':'var(--purple)', 'Future consideration':'var(--chart-3)',
      'Not under consideration':'var(--text-tertiary)'
    };
    const maxSC = Math.max(...Object.values(a.byState),1);
    const stateRows = Object.entries(a.byState).sort((x,y)=>y[1]-x[1]).map(([s,n]) => {
      const c = stateColors[s]||'var(--text-tertiary)';
      return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:11px;color:var(--text-secondary);width:170px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${_esc(s)}">${_esc(s)}</span>
        <div style="flex:1;height:7px;background:var(--bg-layer-2);border-radius:99px;overflow:hidden">
          <div style="height:100%;border-radius:99px;background:${c};width:${Math.round(n/maxSC*100)}%;transition:width .5s var(--ease)"></div>
        </div>
        <span style="font-size:12px;font-weight:600;font-family:var(--font-mono);color:var(--text-primary);min-width:24px;text-align:right">${n}</span>
        <span style="font-size:10px;color:var(--text-tertiary);font-family:var(--font-mono);min-width:32px;text-align:right">${Math.round(n/a.total*100)}%</span>
      </div>`;
    }).join('');

    const maxPC = Math.max(...Object.values(a.byProduct),1);
    const prodRows = Object.entries(a.byProduct).sort((x,y)=>y[1]-x[1]).slice(0,8).map(([p,n]) => {
      const short = p.replace('IBM Engineering - ','').replace('IBM Engineering ','');
      return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:11px;color:var(--text-secondary);width:140px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${_esc(p)}">${_esc(short)}</span>
        <div style="flex:1;height:7px;background:var(--bg-layer-2);border-radius:99px;overflow:hidden">
          <div style="height:100%;border-radius:99px;background:var(--ibm-blue-50);width:${Math.round(n/maxPC*100)}%;transition:width .5s var(--ease)"></div>
        </div>
        <span style="font-size:12px;font-weight:600;font-family:var(--font-mono);color:var(--text-primary);min-width:24px;text-align:right">${n}</span>
      </div>`;
    }).join('');

    const topVoted = [...data].sort((a,b)=>(parseInt(b['Vote Count'])||0)-(parseInt(a['Vote Count'])||0)).slice(0,5);
    const maxTV    = parseInt(topVoted[0]?.['Vote Count'])||1;
    const topRows  = topVoted.map((r,i) => {
      const v = parseInt(r['Vote Count'])||0;
      return `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--radius-sm);background:var(--bg-layer);border:1px solid var(--border-subtle);margin-bottom:6px">
        <span style="font-size:11px;font-weight:700;font-family:var(--font-mono);color:var(--text-tertiary);width:16px;text-align:center">${i+1}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${_esc(r['Idea Name']||'')}">${_esc((r['Idea Name']||'').slice(0,52))}${(r['Idea Name']||'').length>52?'…':''}</div>
          <div style="font-size:10px;color:var(--text-tertiary);font-family:var(--font-mono);margin-top:2px;display:flex;align-items:center;gap:6px">
            ${_esc(r['Idea Reference']||'')}
            <span class="${_stateChip(r['Workflow State']||'')}" style="font-size:9px;padding:1px 6px">${_esc(r['Workflow State']||'')}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;width:110px">
          <div style="flex:1;height:5px;background:var(--bg-layer-2);border-radius:99px;overflow:hidden">
            <div style="height:100%;border-radius:99px;background:var(--chart-4);width:${Math.round(v/maxTV*100)}%"></div>
          </div>
          <span style="font-size:13px;font-weight:700;font-family:var(--font-mono);color:var(--chart-4);min-width:24px;text-align:right">${v}</span>
        </div>
      </div>`;
    }).join('');

    return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="tile" style="grid-column:1/-1">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">RFEs by Workflow State</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:14px">${a.total} total · ${Object.keys(a.byState).length} states</div>
        ${stateRows}
      </div>
      <div class="tile" style="grid-column:1/-1">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Top 5 by Community Votes</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:14px">${a.totalVotes} total votes · ${a.avgVotes} avg per RFE</div>
        ${topRows}
      </div>
      <div class="tile">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">RFEs by Product</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:14px">Top ${Math.min(8,Object.keys(a.byProduct).length)} products</div>
        ${prodRows}
      </div>
    </div>`;
  }

  /* ── Detail modal ────────────────────────────────────────── */
  function _openModal(ref) {
    const data = _loadRFE();
    const rfe  = data.find(r=>r['Idea Reference']===ref);
    if (!rfe) return;
    const m = _getMeta(ref);
    _activeModal = ref;

    const _notesHtml = notes => (!notes||!notes.length)
      ? `<div style="font-size:12px;color:var(--text-disabled);font-style:italic;padding:10px 0;text-align:center">No internal notes yet.</div>`
      : notes.map((n,i)=>`
        <div style="background:var(--bg-ui);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:8px 10px;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:11px;font-weight:600;color:var(--ibm-blue-50)">${_esc(n.author||'Team')}</span>
            <span style="font-size:10px;color:var(--text-tertiary);font-family:var(--font-mono);flex:1">${new Date(n.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span>
            <button class="rfe-note-del" data-ni="${i}" style="background:none;border:none;cursor:pointer;color:var(--text-disabled);font-size:14px;line-height:1;padding:0 2px;transition:color var(--transition-fast)" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--text-disabled)'">×</button>
          </div>
          <div style="font-size:12px;color:var(--text-primary);line-height:1.55">${_esc(n.text)}</div>
        </div>`).join('');

    const isComplete = (rfe['Is Complete']==='True'||rfe['Is Complete']===true||rfe['Is Complete']==='true');
    const state = rfe['Workflow State']||'';

    const box = document.getElementById('rfe-modal-box');
    box.innerHTML = `
      <!-- Modal header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:16px 20px 14px;border-bottom:1px solid var(--border-subtle);gap:10px">
        <div>
          <code style="font-family:var(--font-mono);font-size:11px;font-weight:500;color:var(--ibm-blue-50);background:var(--ibm-blue-10);border:1px solid var(--ibm-blue-20);border-radius:var(--radius-xs);padding:2px 7px;display:inline-block;margin-bottom:6px">${_esc(ref)}</code>
          <h3 style="font-size:15px;font-weight:700;color:var(--text-primary);margin:0;line-height:1.3">${_esc(rfe['Idea Name']||'')}</h3>
        </div>
        <button id="rfe-mclose" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:4px;border-radius:var(--radius-sm);display:flex;transition:all var(--transition-fast)" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Info strip -->
      <div style="display:flex;background:var(--bg-layer);border-bottom:1px solid var(--border-subtle)">
        ${[
          ['Product', _esc(rfe['Product']||'—')],
          ['State',   `<span class="${_stateChip(state)}" style="font-size:10px">${_esc(state||'—')}</span>`],
          ['Votes',   `<span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:${parseInt(rfe['Vote Count'])>=10?'var(--chart-3)':'var(--text-primary)'}">${parseInt(rfe['Vote Count'])||0}${parseInt(rfe['Vote Count'])>=10?' ⭐':''}</span>`],
          ['Complete',isComplete?'<span style="color:var(--green);font-weight:700">✓ Yes</span>':'<span style="color:var(--text-tertiary)">No</span>'],
          ['Created', `<span style="font-family:var(--font-mono);font-size:11px">${_fmtDate(rfe['Created At'])}</span>`],
          ['Updated', `<span style="font-family:var(--font-mono);font-size:11px">${_fmtDate(rfe['Updated At'])}</span>`],
        ].map(([l,v])=>`
          <div style="flex:1;padding:10px 14px;border-right:1px solid var(--border-subtle)">
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:4px">${l}</div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${v}</div>
          </div>`).join('')}
      </div>

      <!-- Body -->
      <div style="padding:18px 20px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
          <!-- Left: editable fields -->
          <div style="display:flex;flex-direction:column;gap:12px">
            <div>
              <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:5px">Target Release</label>
              <input id="rfe-m-rel" class="form-input form-input-sm" style="width:100%" type="text" placeholder="e.g. v8.2.0" value="${_esc(m.targetRelease||'')}"/>
            </div>
            <a href="https://ideas.ibm.com/search?query=${_esc(ref)}" target="_blank" rel="noopener"
              style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;color:var(--ibm-blue-50);text-decoration:none;margin-top:4px"
              onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open in Aha!
            </a>
          </div>

          <!-- Right: notes -->
          <div style="display:flex;flex-direction:column;gap:8px">
            <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary)">
              Internal Notes <span style="font-weight:400;color:var(--text-tertiary)">(${(m.notes||[]).length})</span>
            </label>
            <div id="rfe-notes-list" style="max-height:160px;overflow-y:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:8px;background:var(--bg-layer)">
              ${_notesHtml(m.notes)}
            </div>
            <div style="display:flex;gap:6px">
              <textarea id="rfe-note-ta" class="form-input" rows="2"
                style="flex:1;font-family:var(--font-sans);font-size:12px;resize:none"
                placeholder="Add a team note… (Ctrl+Enter)"></textarea>
              <button id="rfe-note-btn" class="btn btn-secondary btn-sm" style="align-self:flex-end;white-space:nowrap">+ Add</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="display:flex;gap:8px;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--border-subtle)">
        <button id="rfe-mcancel" class="btn btn-ghost btn-sm">Cancel</button>
        <button id="rfe-msave" class="btn btn-primary btn-sm" style="display:inline-flex;align-items:center;gap:5px">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Save
        </button>
      </div>`;

    document.getElementById('rfe-modal').style.display = 'flex';

    const _rebind = () => {
      document.querySelectorAll('.rfe-note-del').forEach(btn => {
        btn.onclick = () => {
          const mm = _getMeta(ref);
          mm.notes.splice(parseInt(btn.dataset.ni),1);
          _setMeta(ref, { notes: mm.notes });
          document.getElementById('rfe-notes-list').innerHTML = _notesHtml(_getMeta(ref).notes);
          _rebind();
        };
      });
    };
    _rebind();

    const _addNote = () => {
      const ta   = document.getElementById('rfe-note-ta');
      const text = (ta.value||'').trim();
      if (!text) return;
      const author = (() => { try { return typeof Data!=='undefined'&&Data.currentUser?Data.currentUser():'Team'; } catch(e) { return 'Team'; } })();
      const mm = _getMeta(ref);
      if (!mm.notes) mm.notes = [];
      mm.notes.unshift({ text, author, date: new Date().toISOString() });
      _setMeta(ref, { notes: mm.notes });
      ta.value = '';
      document.getElementById('rfe-notes-list').innerHTML = _notesHtml(_getMeta(ref).notes);
      _rebind();
    };

    document.getElementById('rfe-note-btn').onclick = _addNote;
    document.getElementById('rfe-note-ta').addEventListener('keydown', e => {
      if (e.key==='Enter'&&(e.ctrlKey||e.metaKey)) { e.preventDefault(); _addNote(); }
    });

    document.getElementById('rfe-msave').onclick = () => {
      _setMeta(ref, { targetRelease: document.getElementById('rfe-m-rel').value.trim() });
      _closeModal(); render(); _toast('RFE updated', 'success');
    };

    const _close = () => _closeModal();
    document.getElementById('rfe-mclose').onclick   = _close;
    document.getElementById('rfe-mcancel').onclick  = _close;
    document.getElementById('rfe-modal-bd').onclick = _close;
    document.addEventListener('keydown', _modalKey);
  }

  const _modalKey = e => { if (e.key==='Escape') _closeModal(); };
  function _closeModal() {
    document.getElementById('rfe-modal').style.display = 'none';
    _activeModal = null;
    document.removeEventListener('keydown', _modalKey);
  }

  /* ── Export ──────────────────────────────────────────────── */
  function _exportCSV() {
    const data = _loadRFE(), meta = _loadMeta();
    if (!data.length) { _toast('No data to export','error'); return; }
    const hdr  = ['Idea Reference','Idea Name','Product','Workflow State','Target Release','Votes','Is Complete','Created At','Updated At','URL'];
    const rows = [hdr, ...data.map(r => {
      const ref=r['Idea Reference'], m=meta[ref]||{};
      return [ref,r['Idea Name'],r['Product'],r['Workflow State'],m.targetRelease||'',r['Vote Count']||0,r['Is Complete']||'',_fmtDate(r['Created At']),_fmtDate(r['Updated At']),r['URL']||'']
        .map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',');
    })];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}));
    a.download = `rfe-tracking-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
    _toast(`Exported ${data.length} RFEs`, 'success');
  }

  /* ── Event binding ───────────────────────────────────────── */
  function _bind(data) {
    document.getElementById('rfe-view-table')    ?.addEventListener('click', ()=>{ _view='table';     render(); });
    document.getElementById('rfe-view-analytics')?.addEventListener('click', ()=>{ _view='analytics'; render(); });
    document.getElementById('rfe-export')        ?.addEventListener('click', _exportCSV);

    document.getElementById('rfe-search')?.addEventListener('input', e=>{ _search=e.target.value; render(); });
    document.getElementById('rfe-fp')    ?.addEventListener('change', e=>{ _fProduct=e.target.value; render(); });
    document.getElementById('rfe-fs')    ?.addEventListener('change', e=>{ _fState=e.target.value;   render(); });

    document.querySelectorAll('.sort-th[data-col]').forEach(th => {
      th.addEventListener('click', ()=>{
        const col=th.dataset.col;
        if (_sortCol===col) _sortDir*=-1; else { _sortCol=col; _sortDir=-1; }
        render();
      });
    });

    document.querySelectorAll('.rfe-detail-btn').forEach(btn => {
      btn.addEventListener('click', ()=>_openModal(btn.dataset.ref));
    });
    document.querySelectorAll('[data-ref]').forEach(row => {
      if (row.tagName==='TR') row.addEventListener('click', e=>{ if(!e.target.closest('a,button')) _openModal(row.dataset.ref); });
    });
  }

  /* ── Public ──────────────────────────────────────────────── */
  return { name:'RFE Tracking Advanced', render, loadRFEData:_loadRFE, saveRFEData, saveTrackingMeta };

})();
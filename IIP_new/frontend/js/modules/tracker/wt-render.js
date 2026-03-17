// =============================================================================
// frontend/js/modules/wt-render.js
// IIP Phase 3, Fix 3.5 — Weekly Tracker Sub-Module: Render
//
// Extracted rendering logic from weekly-tracker.js.
// Handles: KPI strip, filter chips, week navigation, table rendering,
//          history panel, and follow-up panel.
//
// Public API (window.WTRender):
//   WTRender.renderKPI(rows, container)
//   WTRender.renderFilterChips(rows, state, container, onChipClick)
//   WTRender.renderWeekNav(weeks, currentWeek, container, onNavClick)
//   WTRender.renderTable(rows, state, container, callbacks)
//   WTRender.renderHistory(historyData, container, callbacks)
//   WTRender.renderFollowUp(caseMap, currentWeek, container, onToggle)
// =============================================================================

'use strict';

(function (window) {

  // ── Shared helpers ──────────────────────────────────────────────────────────


  function caseLink(caseNum) {
    if (!caseNum) return '';
    return `<span class="case-number-copy c-blue" data-cn="${caseNum}"
              title="Click to copy case number" style="cursor:pointer;font-weight:600"
             
            >${caseNum}</span>`;
  }

  function severityClass(sev) {
    const s = String(sev || '');
    if (s === '1') return 'sev-1';
    if (s === '2') return 'sev-2';
    if (s === '3') return 'sev-3';
    return 'sev-4';
  }

  function formatDate(d) {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (_) { return d; }
  }

  // ── KPI strip ───────────────────────────────────────────────────────────────

  function renderKPI(rows, container) {
    if (!container) return;

    const total    = rows.length;
    const sev2     = rows.filter(r => String(r.severity || r.Severity) === '2').length;
    const sev3     = rows.filter(r => String(r.severity || r.Severity) === '3').length;
    const withComm = rows.filter(r => r.comments && r.comments.trim()).length;

    const owners  = [...new Set(rows.map(r => r.owner || r.Owner).filter(Boolean))];
    const avgLoad = owners.length ? (total / owners.length).toFixed(1) : '—';

    container.innerHTML = `
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-label">Total This Week</div><div class="kpi-value">${total}</div></div>
        <div class="kpi-card kpi-red"><div class="kpi-label">Sev-2</div><div class="kpi-value">${sev2}</div></div>
        <div class="kpi-card kpi-blue"><div class="kpi-label">Sev-3</div><div class="kpi-value">${sev3}</div></div>
        <div class="kpi-card kpi-green"><div class="kpi-label">With Comments</div><div class="kpi-value">${withComm}</div></div>
        <div class="kpi-card"><div class="kpi-label">Avg Load / Owner</div><div class="kpi-value">${avgLoad}</div></div>
        <div class="kpi-card"><div class="kpi-label">Engineers Active</div><div class="kpi-value">${owners.length}</div></div>
      </div>
    `;
  }

  // ── Filter chips ────────────────────────────────────────────────────────────

  function renderFilterChips(rows, state, container, onChipClick) {
    if (!container) return;

    // Build frequency maps
    const ownerCounts = {}, catCounts = {};
    for (const r of rows) {
      const o = r.owner || r.Owner || '';
      const c = r.category || r.Category || '';
      if (o) ownerCounts[o] = (ownerCounts[o] || 0) + 1;
      if (c) catCounts[c]   = (catCounts[c]   || 0) + 1;
    }

    function chipHtml(label, field, val, count) {
      const active = (field === 'owner' ? state.filterOwner : state.filterCategory) === val;
      return `<button class="filter-chip ${active ? 'active' : ''}"
                data-field="${field}" data-val="${val}"
                title="Filter by ${field}: ${val}">${label} <span class="chip-count">${count}</span></button>`;
    }

    const ownerChips = Object.entries(ownerCounts)
      .sort((a,b) => b[1]-a[1]).slice(0, 10)
      .map(([o, n]) => chipHtml(o.split(' ')[0], 'owner', o, n)).join('');

    const catChips = Object.entries(catCounts)
      .sort((a,b) => b[1]-a[1]).slice(0, 8)
      .map(([c, n]) => chipHtml(c, 'category', c, n)).join('');

    container.innerHTML = `
      <div class="filter-chips-wrap">
        ${ownerChips ? `<div class="chip-group"><span class="chip-group-label">Owner</span>${ownerChips}</div>` : ''}
        ${catChips   ? `<div class="chip-group"><span class="chip-group-label">Category</span>${catChips}</div>` : ''}
        ${(state.filterOwner || state.filterCategory)
          ? `<button class="filter-chip chip-clear" data-field="clear">✕ Clear</button>` : ''}
      </div>
    `;

    if (onChipClick) {
      container.querySelectorAll('.filter-chip[data-field]').forEach(btn => {
        btn.addEventListener('click', () => onChipClick(btn.dataset.field, btn.dataset.val));
      });
    }
  }

  // ── Week navigation ─────────────────────────────────────────────────────────

  function renderWeekNav(weeks, currentWeek, container, onNavClick) {
    if (!container || !weeks || !weeks.length) return;

    const items = weeks.map(w => {
      const active      = w.key === currentWeek;
      const isThisWeek  = w.isCurrentWeek;
      return `<button class="wt-nav-btn ${active ? 'active' : ''} ${isThisWeek ? 'this-week' : ''}"
                data-wk="${w.key}"
                title="${w.range || w.key}">
                <span class="wt-nav-cw">${w.key}</span>
                ${w.range ? `<span class="wt-nav-range">${w.range}</span>` : ''}
                ${w.count !== undefined ? `<span class="wt-nav-count">${w.count}</span>` : ''}
              </button>`;
    }).join('');

    container.innerHTML = `<div class="wt-week-nav">${items}</div>`;

    if (onNavClick) {
      container.querySelectorAll('.wt-nav-btn[data-wk]').forEach(btn => {
        btn.addEventListener('click', () => onNavClick(btn.dataset.wk));
      });
    }
  }

  // ── Main tracker table ──────────────────────────────────────────────────────

  function renderTable(rows, state, container, callbacks) {
    if (!container) return;
    callbacks = callbacks || {};

    const { filterOwner, filterCategory, sortCol, sortAsc, focusedCaseId, searchQuery } = state;

    // Apply filters
    let filtered = rows.filter(r => {
      if (filterOwner    && (r.owner    || r.Owner)    !== filterOwner)    return false;
      if (filterCategory && (r.category || r.Category) !== filterCategory) return false;
      if (focusedCaseId  && r.id !== focusedCaseId)                        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = [r.caseNumber, r.title, r.owner, r.comments, r.category].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let va = a[sortCol] || '';
      let vb = b[sortCol] || '';
      if (sortCol === 'severity') { va = parseInt(va); vb = parseInt(vb); }
      else if (sortCol === 'closedDate') {
        va = new Date(va || 0).getTime();
        vb = new Date(vb || 0).getTime();
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1  : -1;
      return 0;
    });

    if (!filtered.length) {
      container.innerHTML = `<div class="table-empty">No cases match the current filters.</div>`;
      return;
    }

    const colDef = [
      { key: 'caseNumber',  label: 'Case #',     cls: 'col-case'    },
      { key: 'owner',       label: 'Owner',       cls: 'col-owner'   },
      { key: 'title',       label: 'Title',       cls: 'col-title'   },
      { key: 'severity',    label: 'Sev',         cls: 'col-sev'     },
      { key: 'product',     label: 'Product',     cls: 'col-product' },
      { key: 'category',    label: 'Category',    cls: 'col-cat'     },
      { key: 'closedDate',  label: 'Closed',      cls: 'col-date'    },
      { key: 'comments',    label: 'Comments',    cls: 'col-comments'},
    ];

    const thHtml = colDef.map(c => {
      const sorted = sortCol === c.key;
      return `<th class="${c.cls} ${sorted ? 'sorted' : ''}" data-col="${c.key}"
                title="Sort by ${c.label}">
                ${c.label}${sorted ? (sortAsc ? ' ↑' : ' ↓') : ''}
              </th>`;
    }).join('');

    const rowsHtml = filtered.map(r => {
      const sev     = String(r.severity || r.Severity || '');
      const cn      = r.caseNumber || r.case_number || '';
      const product = (r.product || '').replace('Engineering ', '').slice(0, 28);
      const cat     = r.category || '';
      const title   = (r.title || '').slice(0, 70);
      const focused = r.id === focusedCaseId;

      return `<tr class="wt-row ${focused ? 'wt-row-focused' : ''} ${r.comments ? '' : 'wt-row-no-comment'}"
                data-id="${r.id}" data-case="${cn}">
        <td class="col-case">${caseLink(cn)}</td>
        <td class="col-owner">${r.owner || r.Owner || '—'}</td>
        <td class="col-title" title="${(r.title || '').replace(/"/g, '&quot;')}">${title}</td>
        <td class="col-sev"><span class="${severityClass(sev)}">${sev || '—'}</span></td>
        <td class="col-product" title="${r.product || ''}">${product}</td>
        <td class="col-cat">${cat}</td>
        <td class="col-date">${formatDate(r.closedDate || r.closed_date)}</td>
        <td class="col-comments ${r.comments ? 'has-comment' : 'no-comment'}">${
          r.comments
            ? `<span class="comment-preview" title="${(r.comments||'').replace(/"/g,'&quot;').slice(0,200)}">${r.comments.slice(0,60)}${r.comments.length > 60 ? '…' : ''}</span>`
            : `<span class="comment-placeholder text-muted">No comment</span>`
        }</td>
      </tr>`;
    }).join('');

    container.innerHTML = `
      <div class="table-wrap wt-table-wrap">
        <table class="dash-table wt-table">
          <thead><tr>${thHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="table-footer text-muted">Showing ${filtered.length} of ${rows.length} cases</div>
      </div>
    `;

    // Sort click handlers
    container.querySelectorAll('th[data-col]').forEach(th => {
      th.addEventListener('click', () => callbacks.onSort && callbacks.onSort(th.dataset.col));
    });

    // Row click / focus
    container.querySelectorAll('tr.wt-row').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.tagName === 'A') return;
        callbacks.onRowClick && callbacks.onRowClick(tr.dataset.id, tr.dataset.case);
      });
    });
  }

  // ── History panel ───────────────────────────────────────────────────────────

  function renderHistory(historyData, container, callbacks) {
    if (!container) return;
    callbacks = callbacks || {};

    const caseNumbers = Object.keys(historyData || {});

    if (!caseNumbers.length) {
      container.innerHTML = `<div class="table-empty">No history recorded yet.</div>`;
      return;
    }

    const rows = caseNumbers.flatMap(cn => {
      const item = historyData[cn];
      if (!item || !item.entries) return [];
      return item.entries.map((e, idx) => ({
        cn, idx,
        week: e.week, year: e.year,
        statusBefore: e.statusBefore, statusAfter: e.statusAfter,
        commentBefore: e.commentBefore, commentAfter: e.commentAfter,
        ts: e.timestamp,
        owner: e.owner || item.owner || '',
      }));
    });

    rows.sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0));

    const tableRows = rows.slice(0, 200).map(r => `
      <tr>
        <td>${caseLink(r.cn)}</td>
        <td>${r.week || '—'} ${r.year || ''}</td>
        <td>${r.owner}</td>
        <td class="text-muted">${r.statusBefore || '—'}</td>
        <td>${r.statusAfter || '—'}</td>
        <td class="text-muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;"
            title="${(r.commentAfter||'').replace(/"/g,'&quot;')}">${(r.commentAfter||'').slice(0,60)}</td>
        <td class="text-muted">${r.ts ? formatDate(r.ts) : '—'}</td>
        <td>
          <button class="btn btn-xs btn-danger wt-hist-delete" data-cn="${r.cn}" data-idx="${r.idx}" title="Delete this history entry">✕</button>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="table-wrap">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;margin-bottom:8px;">
          <span class="text-muted" style="font-size:12px;">${rows.length} history entries</span>
          <div style="display:flex;gap:8px;">
            ${callbacks.onExport ? `<button class="btn btn-sm btn-secondary" id="wt-hist-export">Export CSV</button>` : ''}
            ${callbacks.onClearAll ? `<button class="btn btn-sm btn-danger" id="wt-hist-clear-all">Clear All</button>` : ''}
          </div>
        </div>
        <table class="dash-table">
          <thead>
            <tr>
              <th>Case #</th><th>Week</th><th>Owner</th>
              <th>Status Before</th><th>Status After</th>
              <th>Comment</th><th>Date</th><th></th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.wt-hist-delete').forEach(btn => {
      btn.addEventListener('click', () =>
        callbacks.onDeleteEntry && callbacks.onDeleteEntry(btn.dataset.cn, parseInt(btn.dataset.idx)));
    });

    document.getElementById('wt-hist-export')?.addEventListener('click', () => callbacks.onExport());
    document.getElementById('wt-hist-clear-all')?.addEventListener('click', () => callbacks.onClearAll());
  }

  // ── Follow-up panel ─────────────────────────────────────────────────────────

  function renderFollowUp(caseMap, currentWeek, container, onToggle) {
    if (!container) return;

    const cases = Object.values(caseMap || {}).filter(c => c.isFollowUp || c.followUpFlag);

    if (!cases.length) {
      container.innerHTML = `<div class="table-empty" style="padding:24px 0;">No follow-up cases flagged for this week.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="followup-list">
        ${cases.map(c => `
          <div class="followup-item" data-cn="${c.caseNumber}">
            <div class="followup-case">${caseLink(c.caseNumber)}</div>
            <div class="followup-title text-muted">${(c.title||'').slice(0,80)}</div>
            <div class="followup-owner">${c.owner||'—'}</div>
            <button class="btn btn-xs followup-toggle" data-cn="${c.caseNumber}">
              ${c.isFollowUp ? '✓ Following up' : 'Mark Follow-Up'}
            </button>
          </div>
        `).join('')}
      </div>
    `;

    if (onToggle) {
      container.querySelectorAll('.followup-toggle').forEach(btn => {
        btn.addEventListener('click', () => onToggle(btn.dataset.cn));
      });
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  window.WTRender = {
    renderKPI,
    renderFilterChips,
    renderWeekNav,
    renderTable,
    renderHistory,
    renderFollowUp,
    // Helpers re-exported for other modules
    caseLink,
    severityClass,
    formatDate,
  };

}(window));

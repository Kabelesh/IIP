/* ============================================================
   js/dashboards/rfe-tracking.js — IBM RFE Tracking
   ============================================================ */
const DashRFETracking = (() => {

  function _setLoading(active) {
    const el = document.getElementById('content-area') || document.body;
    el.classList.toggle('dashboard-loading', active);
    document.querySelectorAll('.table-wrap, .dash-table').forEach(t => {
      t.classList.toggle('skeleton-loading', active);
    });
  }

  const LS_KEY = "ibm_rfe_tracking_v1";

  /* ── RFE data storage ──────────────────────────────────────── */
  function _loadRFEData() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[RFE] Failed to load RFE data:', e);
      return [];
    }
  }

  function _saveRFEData(data) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[RFE] Failed to save RFE data:', e);
    }
  }

  /* ── Filter and search state ──────────────────────────────── */
  let _filterProduct = "";
  let _filterState = "";
  let _searchText = "";

  /* ── Main render function ─────────────────────────────────── */
  function render() {
    const container = document.getElementById('tab-rfe-tracking');
    if (!container) return;

    const rfeData = _loadRFEData();

    let html = `
      <div class="dash-container rfe-tracking-container">
        <div class="dash-header">
          <div class="dash-header-title">
            <h2>IBM RFE Tracking</h2>
            <p class="text-meta">Request for Enhancement tracking dashboard</p>
          </div>
          <div class="dash-header-stats">
            <div class="stat-box">
              <div class="stat-value">${rfeData.length}</div>
              <div class="stat-label">Total RFEs</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${rfeData.filter(r => r['Is Complete'] === 'True' || r['Is Complete'] === true).length}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${rfeData.filter(r => r['Workflow State'] && r['Workflow State'].includes('Delivered')).length}</div>
              <div class="stat-label">Delivered</div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="rfe-filters">
          <div class="filter-group">
            <label>Product:</label>
            <select id="rfe-filter-product" class="filter-select">
              <option value="">All Products</option>
              ${[...new Set(rfeData.map(r => r['Product']).filter(p => p))].map(p =>
                `<option value="${p}" ${_filterProduct === p ? 'selected' : ''}>${p}</option>`
              ).join('')}
            </select>
          </div>
          <div class="filter-group">
            <label>State:</label>
            <select id="rfe-filter-state" class="filter-select">
              <option value="">All States</option>
              ${[...new Set(rfeData.map(r => r['Workflow State']).filter(s => s))].map(s =>
                `<option value="${s}" ${_filterState === s ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          <div class="filter-group">
            <label>Search:</label>
            <input type="text" id="rfe-search" placeholder="Search by name, reference, product..." class="search-input" value="${_searchText}"/>
          </div>
        </div>

        <!-- RFE Table -->
        <div class="table-wrap">
          <table class="dash-table rfe-table">
            <thead>
              <tr>
                <th>Idea Reference</th>
                <th>Idea Name</th>
                <th>Product</th>
                <th>Workflow State</th>
                <th>Complete</th>
                <th>Votes</th>
                <th>Comments</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${_getFilteredRFEs(rfeData).map((rfe, idx) => `
                <tr class="rfe-row" data-idx="${idx}">
                  <td class="mono-text">${Utils.escHtml(rfe['Idea Reference'] || '')}</td>
                  <td class="rfe-name">${Utils.escHtml(rfe['Idea Name'] || '')}</td>
                  <td>${Utils.escHtml(rfe['Product'] || '')}</td>
                  <td><span class="badge badge-${_getBadgeClass(rfe['Workflow State'])}">${Utils.escHtml(rfe['Workflow State'] || '')}</span></td>
                  <td class="text-center">${rfe['Is Complete'] ? '✓' : ''}</td>
                  <td class="text-center">${rfe['Vote Count'] || 0}</td>
                  <td class="text-center">${rfe['Comment Count'] || 0}</td>
                  <td class="text-meta">${_formatDate(rfe['Created At'])}</td>
                  <td class="text-meta">${_formatDate(rfe['Updated At'])}</td>
                  <td>
                    <a href="${rfe['URL']}" target="_blank" class="btn btn-micro" title="Open in Aha!">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${rfeData.length === 0 ? `
            <div class="empty-state">
              <p class="text-meta">No RFE data loaded. Upload via Admin Portal.</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    container.innerHTML = html;
    _attachEventListeners();
  }

  function _getFilteredRFEs(data) {
    return data.filter(rfe => {
      if (_filterProduct && rfe['Product'] !== _filterProduct) return false;
      if (_filterState && rfe['Workflow State'] !== _filterState) return false;
      if (_searchText) {
        const searchLower = _searchText.toLowerCase();
        const searchFields = [
          String(rfe['Idea Name'] || ''),
          String(rfe['Description'] || ''),
          String(rfe['Idea Reference'] || ''),
          String(rfe['Product'] || '')
        ];
        if (!searchFields.some(f => f.toLowerCase().includes(searchLower))) return false;
      }
      return true;
    });
  }

  function _getBadgeClass(state) {
    if (!state) return 'gray';
    const stateStr = String(state).toLowerCase();
    if (stateStr.includes('delivered')) return 'green';
    if (stateStr.includes('under consideration')) return 'blue';
    if (stateStr.includes('future')) return 'purple';
    return 'gray';
  }

  function _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return Utils.fmtDate(dateStr);
    } catch (e) {
      return String(dateStr).substring(0, 10);
    }
  }

  function _attachEventListeners() {
    document.getElementById('rfe-filter-product')?.addEventListener('change', (e) => {
      _filterProduct = e.target.value;
      render();
    });

    document.getElementById('rfe-filter-state')?.addEventListener('change', (e) => {
      _filterState = e.target.value;
      render();
    });

    document.getElementById('rfe-search')?.addEventListener('input', (e) => {
      _searchText = e.target.value;
      // Only re-render the table body — do NOT call render() which replaces the whole page
      const tbody = document.querySelector('.rfe-table tbody');
      if (tbody) {
        const rfeData = _loadRFEData();
        tbody.innerHTML = _getFilteredRFEs(rfeData).map((rfe, idx) => `
                <tr class="rfe-row" data-idx="${idx}">
                  <td class="mono-text">${Utils.escHtml(rfe['Idea Reference'] || '')}</td>
                  <td class="rfe-name">${Utils.escHtml(rfe['Idea Name'] || '')}</td>
                  <td>${Utils.escHtml(rfe['Product'] || '')}</td>
                  <td><span class="badge badge-${_getBadgeClass(rfe['Workflow State'])}">${Utils.escHtml(rfe['Workflow State'] || '')}</span></td>
                  <td class="text-center">${rfe['Is Complete'] ? '✓' : ''}</td>
                  <td class="text-center">${rfe['Vote Count'] || 0}</td>
                  <td class="text-center">${rfe['Comment Count'] || 0}</td>
                  <td class="text-meta">${_formatDate(rfe['Created At'])}</td>
                  <td class="text-meta">${_formatDate(rfe['Updated At'])}</td>
                  <td>
                    <a href="${rfe['URL']}" target="_blank" class="btn btn-micro" title="Open in Aha!">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </td>
                </tr>
              `).join('');
      }
    });
  }

  return {
    name: 'IBM RFE Tracking',
    render: render,
    loadRFEData: _loadRFEData,
    saveRFEData: _saveRFEData
  };
})();

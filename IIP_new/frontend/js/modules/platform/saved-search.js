// =============================================================================
// frontend/js/modules/saved-search.js
// IIP Phase 3, Fix 3.10 — Saved Search Functionality
//
// Adds saved search to any dashboard. Drop-in: inject the toolbar into any
// search bar container, then call mount() once.
//
// USAGE:
//   // In a dashboard that has a search input:
//   const ss = new SavedSearch({
//     dashboard:  'investigate',          // must match backend dashboard name
//     container:  document.getElementById('search-toolbar'),
//     getQuery:   () => ({ text: searchInput.value, filters: currentFilters }),
//     applyQuery: (q) => { searchInput.value = q.text; applyFilters(q.filters); },
//     onSearch:   (q) => renderResults(q),
//   });
//   ss.mount();
// =============================================================================

'use strict';

(function (window) {
  const CSS = `
    .iip-ss-bar {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 8px 0;
    }
    .iip-ss-chips {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      flex: 1;
    }
    .iip-ss-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; background: var(--ibm-blue-10, #edf5ff);
      border: 1px solid var(--ibm-blue-30, #a6c8ff); border-radius: 14px;
      font-size: 12px; font-weight: 600; color: var(--ibm-blue-60, #0043ce);
      cursor: pointer; transition: background 0.12s; user-select: none;
      max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .iip-ss-chip:hover { background: var(--ibm-blue-20, #d0e2ff); }
    .iip-ss-chip.active { background: var(--ibm-blue-50, #0f62fe); color: #fff; border-color: var(--ibm-blue-50, #0f62fe); }
    .iip-ss-chip-rm {
      background: none; border: none; cursor: pointer; font-size: 13px;
      color: inherit; opacity: 0.7; padding: 0 2px; line-height: 1;
    }
    .iip-ss-chip-rm:hover { opacity: 1; color: var(--red, #da1e28); }
    .iip-ss-save-btn {
      padding: 5px 12px; background: var(--bg-layer, #f4f4f4);
      border: 1px solid var(--border-mid, #d0d3da); border-radius: 5px;
      font-size: 12px; font-weight: 600; cursor: pointer;
      color: var(--text-secondary, #374050); font-family: inherit;
      white-space: nowrap; transition: background 0.12s;
    }
    .iip-ss-save-btn:hover { background: var(--bg-hover, #eef1f6); }
    .iip-ss-dropdown {
      position: absolute; z-index: 1000;
      background: #fff; border: 1px solid var(--border-mid, #d0d3da);
      border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      min-width: 280px; max-width: 360px; padding: 8px 0;
      font-size: 13px;
    }
    .iip-ss-dropdown-header {
      padding: 6px 14px; font-size: 11px; font-weight: 700;
      color: var(--text-tertiary, #6b7280); text-transform: uppercase; letter-spacing: 0.05em;
    }
    .iip-ss-dropdown-item {
      display: flex; align-items: center; padding: 8px 14px; cursor: pointer;
      gap: 8px;
      transition: background 0.1s;
    }
    .iip-ss-dropdown-item:hover { background: var(--bg-hover, #eef1f6); }
    .iip-ss-dropdown-item .name  { flex: 1; font-weight: 600; color: var(--text-primary, #0f1117); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .iip-ss-dropdown-item .count { font-size: 11px; color: var(--text-tertiary, #6b7280); }
    .iip-ss-dropdown-item .del   { background: none; border: none; cursor: pointer; color: var(--text-tertiary); font-size: 14px; padding: 0 2px; opacity: 0.6; }
    .iip-ss-dropdown-item .del:hover { opacity: 1; color: var(--red, #da1e28); }
    .iip-ss-separator { height: 1px; background: var(--border-subtle, #e4e7ed); margin: 4px 0; }
    .iip-ss-empty { padding: 12px 14px; color: var(--text-tertiary, #6b7280); font-style: italic; }

    /* Save dialog */
    .iip-ss-dialog-overlay {
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,0.4); display: flex;
      align-items: center; justify-content: center;
    }
    .iip-ss-dialog {
      background: #fff; border-radius: 10px; padding: 24px;
      width: 340px; box-shadow: 0 16px 48px rgba(0,0,0,0.2);
    }
    .iip-ss-dialog h3 { font-size: 16px; font-weight: 700; margin: 0 0 14px; }
    .iip-ss-dialog input[type=text] {
      width: 100%; padding: 8px 10px; border: 1px solid var(--border-mid, #d0d3da);
      border-radius: 5px; font-size: 14px; font-family: inherit;
      box-sizing: border-box; margin-bottom: 10px;
    }
    .iip-ss-dialog input[type=text]:focus { outline: none; border-color: var(--ibm-blue-50, #0f62fe); box-shadow: 0 0 0 3px rgba(15,98,254,0.12); }
    .iip-ss-dialog-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .iip-ss-shared-label { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--text-secondary, #374050); margin-bottom: 8px; }
  `;

  function injectCSS() {
    if (document.getElementById('iip-ss-css')) return;
    const s = document.createElement('style');
    s.id = 'iip-ss-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── API helpers ─────────────────────────────────────────────────────────────

  function authFetch(url, opts) {
    return fetch(url, opts);
  }

  async function apiList(dashboard) {
    try {
      const res = await authFetch(`${API_BASE}?dashboard=${encodeURIComponent(dashboard)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.searches || [];
    } catch (_) { return []; }
  }

  async function apiCreate(dashboard, name, query, isShared) {
    const res = await authFetch(API_BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ dashboard, name, query, is_shared: isShared }),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    return res.json();
  }

  async function apiDelete(id) {
    const res = await authFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return res.json();
  }

  async function apiUse(id) {
    authFetch(`${API_BASE}/${id}/use`, { method: 'POST' }).catch(() => {});
  }

  // ── SavedSearch class ───────────────────────────────────────────────────────

  class SavedSearch {
    constructor(opts) {
      this.dashboard   = opts.dashboard;
      this.container   = opts.container;
      this.getQuery    = opts.getQuery    || (() => ({}));
      this.applyQuery  = opts.applyQuery  || (() => {});
      this.onSearch    = opts.onSearch    || (() => {});
      this._searches   = [];
      this._active     = null;   // currently applied saved search id
      this._dropdown   = null;
    }

    async mount() {
      injectCSS();
      if (!this.container) return;
      this._searches = await apiList(this.dashboard);
      this._render();
    }

    _render() {
      const bar = document.createElement('div');
      bar.className = 'iip-ss-bar';
      bar.id = 'iip-ss-bar-' + this.dashboard;

      // Chips for each saved search
      const chips = this._searches.map(s => `
        <button class="iip-ss-chip ${this._active === s.id ? 'active' : ''}"
                data-id="${s.id}" title="${(s.query?.text || '').replace(/"/g,'&quot;')} (${s.use_count} uses)">
          ${_esc(s.name)}
          <span class="iip-ss-chip-rm" data-delete="${s.id}" title="Delete this saved search">×</span>
        </button>
      `).join('');

      bar.innerHTML = `
        <div class="iip-ss-chips">${chips || '<span style="color:var(--text-tertiary);font-size:12px;">No saved searches</span>'}</div>
        <div style="position:relative;">
          <button class="iip-ss-save-btn" id="iip-ss-open-${this.dashboard}">
            💾 Save Search
          </button>
        </div>
      `;

      // Replace or insert
      const existing = document.getElementById('iip-ss-bar-' + this.dashboard);
      if (existing) existing.replaceWith(bar);
      else this.container.insertBefore(bar, this.container.firstChild);

      // Wire chip clicks
      bar.querySelectorAll('.iip-ss-chip[data-id]').forEach(chip => {
        chip.addEventListener('click', e => {
          if (e.target.dataset.delete) return; // handled below
          this._apply(chip.dataset.id);
        });
      });

      // Wire delete (× button)
      bar.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this._delete(btn.dataset.delete);
        });
      });

      // Save button
      document.getElementById('iip-ss-open-' + this.dashboard)
        ?.addEventListener('click', () => this._showSaveDialog());
    }

    _apply(id) {
      const search = this._searches.find(s => s.id === id);
      if (!search) return;
      this._active = id;
      this._render();
      this.applyQuery(search.query);
      this.onSearch(search.query);
      apiUse(id);
    }

    async _delete(id) {
      if (!confirm('Delete this saved search?')) return;
      try {
        await apiDelete(id);
        this._searches = this._searches.filter(s => s.id !== id);
        if (this._active === id) this._active = null;
        this._render();
      } catch (e) {
        alert('Failed to delete: ' + e.message);
      }
    }

    _showSaveDialog() {
      // Remove existing dialog
      document.getElementById('iip-ss-dialog-overlay')?.remove();

      const overlay = document.createElement('div');
      overlay.id = 'iip-ss-dialog-overlay';
      overlay.className = 'iip-ss-dialog-overlay';
      overlay.innerHTML = `
        <div class="iip-ss-dialog">
          <h3>Save Current Search</h3>
          <input type="text" id="iip-ss-name-input" placeholder="Search name (e.g. My Open Sev-2 Cases)" maxlength="128" />
          <label class="iip-ss-shared-label">
            <input type="checkbox" id="iip-ss-shared-chk" />
            Share with team (visible to all users)
          </label>
          <div id="iip-ss-dialog-error" style="color:var(--red,#da1e28);font-size:12px;min-height:16px;"></div>
          <div class="iip-ss-dialog-actions">
            <button class="btn btn-secondary" id="iip-ss-cancel">Cancel</button>
            <button class="btn btn-primary" id="iip-ss-confirm">Save</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const nameInput = document.getElementById('iip-ss-name-input');
      const errEl     = document.getElementById('iip-ss-dialog-error');
      const sharedChk = document.getElementById('iip-ss-shared-chk');

      document.getElementById('iip-ss-cancel').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

      document.getElementById('iip-ss-confirm').addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) { errEl.textContent = 'Please enter a name.'; return; }
        const query = this.getQuery();
        try {
          const created = await apiCreate(this.dashboard, name, query, sharedChk.checked);
          this._searches.unshift(created);
          this._active = created.id;
          this._render();
          overlay.remove();
        } catch (e) {
          errEl.textContent = e.message;
        }
      });

      nameInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('iip-ss-confirm')?.click();
        if (e.key === 'Escape') overlay.remove();
      });

      setTimeout(() => nameInput.focus(), 50);
    }

    // Public method: refresh from server
    async refresh() {
      this._searches = await apiList(this.dashboard);
      this._render();
    }

    // Public method: clear active state
    clearActive() {
      this._active = null;
      this._render();
    }
  }

  function _esc(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[c]));
  }

  // ── Auto-mount for Investigate dashboard ────────────────────────────────────

  function autoMountInvestigate() {
    const panel = document.querySelector(
      '#tab-investigate, #investigate-panel, .investigate-panel'
    );
    if (!panel || panel.dataset.savedSearchMounted) return;
    if (panel.tagName === 'BUTTON' || panel.tagName === 'A') return;
    if (panel.classList.contains('nav-item')) return;
    panel.dataset.savedSearchMounted = '1';

    // Find search input container in the Investigate dashboard
    const searchWrap = panel.querySelector(
      '.inv-search-wrap, .search-bar, #inv-search-input, [id*="investigate"] .filter-bar'
    );
    if (!searchWrap) return;

    const ss = new SavedSearch({
      dashboard:  'investigate',
      container:  searchWrap.parentElement || searchWrap,
      getQuery:   () => {
        const input = panel.querySelector('input[type=text], input[type=search], textarea');
        return {
          text: input ? input.value : '',
          timestamp: new Date().toISOString(),
        };
      },
      applyQuery: (q) => {
        const input = panel.querySelector('input[type=text], input[type=search], textarea');
        if (input && q.text) {
          input.value = q.text;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
    });

    ss.mount();
    panel._savedSearch = ss;
  }

  // Mount when Investigate tab is activated
  document.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab],[data-panel],[data-hash]');
    if (tab) {
      const t = tab.dataset.tab || tab.dataset.panel || tab.dataset.hash || '';
      if (/investigate/.test(t)) {
        setTimeout(autoMountInvestigate, 300);
      }
    }
  });

  // Also attempt on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(autoMountInvestigate, 500));
  } else {
    setTimeout(autoMountInvestigate, 500);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  window.SavedSearch = SavedSearch;
  window.IIPSavedSearch = {
    SavedSearch,
    create:       (opts) => new SavedSearch(opts),
    apiList,
    apiCreate,
    apiDelete,
    apiUse,
    autoMount:    autoMountInvestigate,
  };

}(window));

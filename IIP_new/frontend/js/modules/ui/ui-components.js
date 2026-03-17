// =============================================================================
// frontend/js/modules/ui-components.js
// IIP Section 7 — UI Consistency: JavaScript Components
//
// Implements:
//   window.IIPToast    — 7.9  Unified toast notification system
//   window.IIPConfirm  — 7.8  Replaces all confirm()/alert() calls
//   window.IIPEmpty    — 7.3  Empty state renderer
//   window.IIPSkeleton — 7.4  Skeleton loader helpers
//   window.IIPStatus   — 7.6  Status pill renderer (JS helper)
//   window.IIPSev      — 7.2  Severity badge renderer (JS helper)
//   window.IIPSort     — 7.7  Table sort state manager
//
// Load AFTER ui-system.css. No dependencies other than modal.js (optional).
// =============================================================================

'use strict';

(function (window) {

  // ── 7.9 IIPToast — Unified toast/snackbar ──────────────────────────────────

  const IIPToast = (() => {
    let _stack = null;

    function _ensureStack() {
      if (_stack) return _stack;
      _stack = document.getElementById('iip-toast-stack');
      if (!_stack) {
        _stack = document.createElement('div');
        _stack.id = 'iip-toast-stack';
        document.body.appendChild(_stack);
      }
      return _stack;
    }

    const ICONS = {
      success: '✅',
      error:   '❌',
      warning: '⚠️',
      info:    'ℹ️',
    };

    /**
     * Show a toast notification.
     * @param {string}  title    — bold headline
     * @param {string}  message  — optional body text
     * @param {string}  type     — 'success' | 'error' | 'warning' | 'info'
     * @param {number}  duration — ms before auto-dismiss (0 = sticky)
     * @returns {HTMLElement} toast element
     */
    function show(title, message, type = 'info', duration = 5000) {
      const stack = _ensureStack();
      const icon  = ICONS[type] || ICONS.info;

      const toast = document.createElement('div');
      toast.className = `iip-toast ${type}`;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'polite');
      toast.style.position = 'relative';

      toast.innerHTML = `
        <div class="iip-toast-icon">${icon}</div>
        <div class="iip-toast-body">
          <div class="iip-toast-title">${_esc(title)}</div>
          ${message ? `<div class="iip-toast-msg">${_esc(message)}</div>` : ''}
        </div>
        <button class="iip-toast-close" aria-label="Dismiss notification">×</button>
        ${duration > 0 ? `<div class="iip-toast-progress">
          <div class="iip-toast-progress-fill" style="animation-duration:${duration}ms;"></div>
        </div>` : ''}
      `;

      toast.querySelector('.iip-toast-close').addEventListener('click', () => dismiss(toast));
      stack.appendChild(toast);

      if (duration > 0) {
        setTimeout(() => dismiss(toast), duration);
      }

      return toast;
    }

    function dismiss(toastEl) {
      if (!toastEl || !toastEl.parentElement) return;
      toastEl.classList.add('leaving');
      setTimeout(() => toastEl.remove(), 220);
    }

    function dismissAll() {
      _ensureStack().querySelectorAll('.iip-toast').forEach(dismiss);
    }

    // Convenience helpers
    const success = (title, msg, dur)  => show(title, msg, 'success', dur);
    const error   = (title, msg, dur)  => show(title, msg, 'error',   dur ?? 8000);
    const warning = (title, msg, dur)  => show(title, msg, 'warning', dur);
    const info    = (title, msg, dur)  => show(title, msg, 'info',    dur);

    return { show, dismiss, dismissAll, success, error, warning, info };
  })();

  // ── 7.8 IIPConfirm — Replaces all confirm() calls ─────────────────────────

  const IIPConfirm = (() => {

    /**
     * Drop-in async replacement for window.confirm().
     *
     * BEFORE:  if (!confirm("Delete this entry?")) return;
     * AFTER:   if (!await IIPConfirm.ask("Delete this entry?")) return;
     *
     * @param {string}  message    — question text
     * @param {object}  opts       — { title, icon, confirmLabel, cancelLabel, danger }
     * @returns {Promise<boolean>}
     */
    function ask(message, opts = {}) {
      const {
        title        = opts.danger ? 'Confirm Delete' : 'Confirm',
        icon         = opts.danger ? '⚠️' : '❓',
        confirmLabel = opts.danger ? 'Delete'  : 'Confirm',
        cancelLabel  = 'Cancel',
        danger       = false,
      } = opts;

      return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'iip-modal-backdrop iip-confirm-modal';
        overlay.innerHTML = `
          <div class="iip-modal-card" role="dialog" aria-modal="true"
               aria-labelledby="iip-confirm-title" style="max-width:420px;">
            <div class="iip-modal-body" style="padding:28px 24px 20px;text-align:center;">
              <span class="iip-confirm-icon">${icon}</span>
              <h3 id="iip-confirm-title" class="iip-h4" style="margin-bottom:10px;">${_esc(title)}</h3>
              <p class="iip-body-sm" style="color:var(--text-secondary);white-space:pre-wrap;">${_esc(message)}</p>
            </div>
            <div class="iip-modal-footer" style="justify-content:center;gap:12px;">
              <button class="btn btn-secondary iip-confirm-cancel">${_esc(cancelLabel)}</button>
              <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} iip-confirm-ok">${_esc(confirmLabel)}</button>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);

        const ok     = overlay.querySelector('.iip-confirm-ok');
        const cancel = overlay.querySelector('.iip-confirm-cancel');

        function finish(result) {
          overlay.remove();
          resolve(result);
        }

        ok.addEventListener('click',     () => finish(true));
        cancel.addEventListener('click', () => finish(false));
        overlay.addEventListener('click', e => { if (e.target === overlay) finish(false); });
        document.addEventListener('keydown', function esc(e) {
          if (e.key === 'Escape') { finish(false); document.removeEventListener('keydown', esc); }
        });

        ok.focus();
      });
    }

    /**
     * Danger-variant confirm (red button).
     */
    const danger = (message, opts = {}) => ask(message, { ...opts, danger: true });

    /**
     * Intercept all remaining native confirm() calls in the app.
     * Patches window.confirm to return true synchronously (for legacy code)
     * while also queuing the async modal. Non-ideal but prevents breaking
     * dashboard code that still uses the native dialog.
     *
     * To fully migrate a dashboard, replace:
     *   if (!confirm("...")) return;
     * with:
     *   if (!await IIPConfirm.ask("...")) return;
     */
    function patchNativeConfirm() {
      if (window._iipConfirmPatched) return;
      window._iipConfirmPatched = true;

      const _native = window.confirm.bind(window);
      window.confirm = function (message) {
        // Show async modal (non-blocking, informational)
        IIPConfirm.ask(String(message || ''), { title: 'Confirm Action' }).then(result => {
          if (!result) {
            // User cancelled — fire a custom event dashboards can listen to
            document.dispatchEvent(new CustomEvent('iip:confirm:cancelled', { detail: { message } }));
          }
        });
        // Return true synchronously so existing code doesn't hard-break
        // (Dashboards should be migrated to IIPConfirm.ask() over time)
        return _native(message);
      };
    }

    return { ask, danger, patchNativeConfirm };
  })();

  // ── 7.3 IIPEmpty — Empty state renderer ────────────────────────────────────

  const IIPEmpty = (() => {

    const PRESETS = {
      noData:    { icon: '📭', heading: 'No data available',      text: 'Nothing to display yet.' },
      noCases:   { icon: '📋', heading: 'No cases found',         text: 'Try adjusting your filters or importing cases.' },
      noResults: { icon: '🔍', heading: 'No results match',       text: 'Try broadening your search or clearing filters.' },
      noKB:      { icon: '📚', heading: 'No KB articles',         text: 'Add articles to the Knowledge Hub to see them here.' },
      noHistory: { icon: '🕒', heading: 'No history recorded',    text: 'History entries will appear here after edits are made.' },
      error:     { icon: '⚠️', heading: 'Something went wrong',   text: 'Unable to load this section. Please try refreshing.' },
      loading:   { icon: '⏳', heading: 'Loading…',               text: 'Please wait while data is being fetched.' },
    };

    /**
     * Render an empty state into a container element.
     * @param {HTMLElement} container
     * @param {string|object} preset  — preset name or { icon, heading, text, ctaLabel, onCta }
     * @param {boolean} compact
     */
    function render(container, preset = 'noData', compact = false) {
      if (!container) return;

      const config = typeof preset === 'string'
        ? (PRESETS[preset] || PRESETS.noData)
        : { ...PRESETS.noData, ...preset };

      const ctaHtml = config.ctaLabel
        ? `<button class="btn btn-sm btn-primary iip-empty-cta">${_esc(config.ctaLabel)}</button>`
        : '';

      container.innerHTML = `
        <div class="iip-empty${compact ? ' compact' : ''}">
          <div class="iip-empty-icon">${config.icon}</div>
          <div class="iip-empty-heading">${_esc(config.heading)}</div>
          ${config.text ? `<div class="iip-empty-text">${_esc(config.text)}</div>` : ''}
          ${ctaHtml}
        </div>
      `;

      if (config.ctaLabel && config.onCta) {
        container.querySelector('.iip-empty-cta')
          ?.addEventListener('click', config.onCta);
      }
    }

    /**
     * Returns empty state HTML string (for use in template literals).
     */
    function html(preset = 'noData', compact = false) {
      const config = typeof preset === 'string'
        ? (PRESETS[preset] || PRESETS.noData)
        : { ...PRESETS.noData, ...preset };
      return `<div class="iip-empty${compact ? ' compact' : ''}">
        <div class="iip-empty-icon">${config.icon}</div>
        <div class="iip-empty-heading">${_esc(config.heading)}</div>
        ${config.text ? `<div class="iip-empty-text">${_esc(config.text)}</div>` : ''}
      </div>`;
    }

    return { render, html, PRESETS };
  })();

  // ── 7.4 IIPSkeleton — Skeleton loader helpers ──────────────────────────────

  const IIPSkeleton = (() => {

    /**
     * Replace container contents with skeleton rows.
     * @param {HTMLElement} container
     * @param {number}      rows        — number of skeleton rows
     * @param {string}      variant     — 'table' | 'card' | 'kpi'
     */
    function show(container, rows = 5, variant = 'table') {
      if (!container) return;

      const skeletonHtml = {
        table: Array(rows).fill(0).map(() => `
          <div style="display:flex;gap:12px;padding:10px 4px;border-bottom:1px solid var(--border-subtle);">
            <div class="iip-skeleton iip-skeleton-text" style="width:100px;flex-shrink:0;"></div>
            <div class="iip-skeleton iip-skeleton-text" style="width:80px;flex-shrink:0;"></div>
            <div class="iip-skeleton iip-skeleton-text" style="flex:1;"></div>
            <div class="iip-skeleton iip-skeleton-text" style="width:60px;flex-shrink:0;"></div>
          </div>
        `).join(''),

        card: Array(rows).fill(0).map(() => `
          <div class="iip-skeleton iip-skeleton-card" style="margin-bottom:12px;"></div>
        `).join(''),

        kpi: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">
          ${Array(rows).fill(0).map(() =>
            `<div class="iip-skeleton iip-skeleton-kpi"></div>`
          ).join('')}
        </div>`,
      }[variant] || '';

      container.innerHTML = skeletonHtml;
    }

    /**
     * Add .skeleton-loading class to trigger CSS skeleton on .dash-table children.
     */
    function startTableSkeleton(tableWrap) {
      tableWrap?.classList.add('skeleton-loading');
    }

    function stopTableSkeleton(tableWrap) {
      tableWrap?.classList.remove('skeleton-loading');
    }

    return { show, startTableSkeleton, stopTableSkeleton };
  })();

  // ── 7.6 IIPStatus — Status pill renderer ───────────────────────────────────

  const IIPStatus = (() => {

    // Map raw IBM status strings → canonical CSS class
    const STATUS_MAP = {
      'new case':                'new',
      'ibm is working':          'ibm',
      'awaiting your feedback':  'awaiting',
      'closed by ibm':           'closed',
      'closed by client':        'closed',
      'closed by customer':      'closed',
      'cancelled':               'cancelled',
      'reopened':                'reopened',
    };

    const STATUS_LABELS = {
      'new':       'New Case',
      'ibm':       'IBM Working',
      'awaiting':  'Awaiting Feedback',
      'closed':    'Closed',
      'cancelled': 'Cancelled',
      'reopened':  'Reopened',
    };

    /**
     * Get canonical status class from a raw status string.
     */
    function getClass(rawStatus) {
      return STATUS_MAP[(rawStatus || '').toLowerCase()] || 'closed';
    }

    /**
     * Get display label for a status class.
     */
    function getLabel(rawStatus) {
      return STATUS_LABELS[getClass(rawStatus)] || rawStatus;
    }

    /**
     * Render a status pill HTML string.
     */
    function html(rawStatus, compact = false) {
      const cls   = getClass(rawStatus);
      const label = getLabel(rawStatus);
      return `<span class="iip-status-pill iip-status-${cls}${compact ? ' compact' : ''}"
                    data-status="${_esc(rawStatus)}">${_esc(label)}</span>`;
    }

    /**
     * Upgrade all existing plain-text status cells to pills.
     * Call once after a dashboard renders.
     */
    function upgradeAll(container = document) {
      container.querySelectorAll('[data-status]:not(.iip-status-pill)').forEach(el => {
        el.classList.add('iip-status-pill', `iip-status-${getClass(el.dataset.status)}`);
      });
    }

    return { getClass, getLabel, html, upgradeAll };
  })();

  // ── 7.2 IIPSev — Severity badge renderer ───────────────────────────────────

  const IIPSev = (() => {

    const LABELS = { '1': 'Sev-1', '2': 'Sev-2', '3': 'Sev-3', '4': 'Sev-4' };

    function html(severity, withLabel = true) {
      const s   = String(severity || '').replace(/[^1-4]/g, '') || '4';
      const lbl = withLabel ? (LABELS[s] || `Sev-${s}`) : s;
      return `<span class="sev-${s}" title="Severity ${s}">${_esc(lbl)}</span>`;
    }

    function dot(severity) {
      const s = String(severity || '').replace(/[^1-4]/g, '') || '4';
      return `<span class="iip-sev-dot iip-sev-dot-${s}" title="Severity ${s}"></span>`;
    }

    return { html, dot };
  })();

  // ── 7.7 IIPSort — Table sort state manager ─────────────────────────────────

  const IIPSort = (() => {

    /**
     * Attach sort click handlers to all th[data-col] in a table.
     * Calls onSort(colKey, ascending) when a header is clicked.
     *
     * @param {HTMLTableElement|HTMLElement} table
     * @param {object}  initialState  — { col: 'severity', asc: true }
     * @param {Function} onSort        — (col, asc) => void
     */
    function attach(table, initialState, onSort) {
      if (!table) return;

      let state = initialState || { col: null, asc: true };

      function updateUI() {
        table.querySelectorAll('th[data-col]').forEach(th => {
          const isActive = th.dataset.col === state.col;
          th.classList.toggle('sorted', isActive);
          th.classList.toggle('asc',  isActive && state.asc);
          th.classList.toggle('desc', isActive && !state.asc);
          th.setAttribute('aria-sort', isActive ? (state.asc ? 'ascending' : 'descending') : 'none');
        });
      }

      table.querySelectorAll('th[data-col]').forEach(th => {
        th.addEventListener('click', () => {
          if (state.col === th.dataset.col) {
            state.asc = !state.asc;
          } else {
            state.col = th.dataset.col;
            state.asc = true;
          }
          updateUI();
          if (onSort) onSort(state.col, state.asc);
        });
      });

      updateUI();
      return {
        getState: () => ({ ...state }),
        setState: (col, asc) => { state = { col, asc }; updateUI(); },
      };
    }

    /**
     * Sort an array of objects by a field.
     */
    function sortRows(rows, col, asc) {
      if (!col) return rows;
      return [...rows].sort((a, b) => {
        let va = a[col] ?? '';
        let vb = b[col] ?? '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return asc ? -1 : 1;
        if (va > vb) return asc ? 1  : -1;
        return 0;
      });
    }

    return { attach, sortRows };
  })();

  // ── Shared utility ──────────────────────────────────────────────────────────

  function _esc(str) {
    return String(str || '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c]
    ));
  }

  // ── Auto-patch confirm() and apply status pills on page load ───────────────

  function _init() {
    // 7.8 — Patch native confirm() (non-destructive)
    IIPConfirm.patchNativeConfirm();

    // 7.6 — Upgrade any existing data-status attributes on initial render
    IIPStatus.upgradeAll();

    // Listen for dashboard renders and upgrade status pills
    const observer = new MutationObserver(() => IIPStatus.upgradeAll());
    observer.observe(document.body, { childList: true, subtree: true });

    // Expose global shorthand: IIPToast.success("Saved") works immediately
    window.showToast = (msg, type) => IIPToast.show(msg, '', type || 'info');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  window.IIPToast    = IIPToast;
  window.IIPConfirm  = IIPConfirm;
  window.IIPEmpty    = IIPEmpty;
  window.IIPSkeleton = IIPSkeleton;
  window.IIPStatus   = IIPStatus;
  window.IIPSev      = IIPSev;
  window.IIPSort     = IIPSort;

}(window));

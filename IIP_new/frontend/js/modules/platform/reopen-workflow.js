// =============================================================================
// frontend/js/modules/reopen-workflow.js
// IIP Phase 4, Fix 4.7 — Case Reopen Workflow
//
// Adds a formal reopen workflow with:
//   - Reason codes (dropdown)
//   - Free-text justification
//   - Automatic tracker entry creation for the current week
//   - Audit trail entry
//   - Optional SLA reset flag
//
// USAGE:
//   IIPReopen.showDialog(caseNumber, caseTitle, owner, onSuccess);
//   // or attach to existing reopen buttons:
//   IIPReopen.attachToPage();
// =============================================================================

'use strict';

(function (window) {
  const REASON_CODES = [
    { code: 'NOT_RESOLVED',      label: 'Issue not actually resolved' },
    { code: 'RECURRENCE',        label: 'Problem recurred after closure' },
    { code: 'WRONG_SOLUTION',    label: 'Provided solution was incorrect' },
    { code: 'NEW_SYMPTOMS',      label: 'New symptoms observed (same root cause)' },
    { code: 'CUSTOMER_REFUSED',  label: 'Customer refused the solution' },
    { code: 'ENV_CHANGE',        label: 'Environment change triggered regression' },
    { code: 'IBM_DEFECT_FOUND',  label: 'IBM defect identified post-closure' },
    { code: 'INCOMPLETE_FIX',    label: 'Fix was incomplete / partial only' },
    { code: 'DATA_CORRUPTION',   label: 'Data corruption discovered' },
    { code: 'OTHER',             label: 'Other (explain in justification)' },
  ];

  // ── CSS ─────────────────────────────────────────────────────────────────────

  const CSS = `
    #iip-reopen-overlay {
      position: fixed; inset: 0; z-index: 9500;
      background: rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(3px);
      font-family: var(--font-sans, 'IBM Plex Sans', sans-serif);
    }
    #iip-reopen-dialog {
      background: #fff; border-radius: 10px;
      width: 480px; max-width: 96vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      overflow: hidden;
    }
    .iip-ro-header {
      background: #da1e28; color: #fff;
      padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .iip-ro-header h2 { font-size: 15px; font-weight: 700; margin: 0; }
    .iip-ro-close { background: none; border: none; color: rgba(255,255,255,.8); font-size: 22px; cursor: pointer; padding: 0; line-height: 1; }
    .iip-ro-close:hover { color: #fff; }
    .iip-ro-body { padding: 20px 24px; }
    .iip-ro-case-banner {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;
      padding: 10px 14px; margin-bottom: 18px; font-size: 13px;
    }
    .iip-ro-case-banner strong { display: block; font-size: 14px; color: #111827; margin-bottom: 2px; }
    .iip-ro-case-banner span { color: #6b7280; }
    .iip-ro-field { margin-bottom: 16px; }
    .iip-ro-label {
      display: block; font-size: 12px; font-weight: 700;
      color: #374151; margin-bottom: 5px;
    }
    .iip-ro-label .required { color: #da1e28; margin-left: 2px; }
    .iip-ro-select, .iip-ro-textarea, .iip-ro-input {
      width: 100%; padding: 9px 12px;
      border: 1px solid #d1d5db; border-radius: 6px;
      font-size: 13px; font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.12s;
    }
    .iip-ro-select:focus, .iip-ro-textarea:focus, .iip-ro-input:focus {
      outline: none; border-color: #da1e28; box-shadow: 0 0 0 3px rgba(218,30,40,0.10);
    }
    .iip-ro-textarea { min-height: 90px; resize: vertical; }
    .iip-ro-check-row {
      display: flex; align-items: flex-start; gap: 8px;
      margin-bottom: 12px; font-size: 13px; color: #374151;
    }
    .iip-ro-check-row input[type=checkbox] { margin-top: 2px; width: 14px; height: 14px; flex-shrink: 0; }
    .iip-ro-error {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 5px;
      padding: 8px 12px; font-size: 12px; color: #991b1b;
      margin-bottom: 12px; display: none;
    }
    .iip-ro-footer {
      padding: 14px 24px; border-top: 1px solid #f3f4f6;
      display: flex; justify-content: flex-end; gap: 8px;
      background: #f9fafb;
    }
    .iip-ro-char-count { font-size: 11px; color: #9ca3af; text-align: right; margin-top: 3px; }
    .iip-ro-success {
      text-align: center; padding: 32px 24px;
    }
    .iip-ro-success .icon { font-size: 48px; margin-bottom: 12px; }
    .iip-ro-success h3 { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .iip-ro-success p  { font-size: 13px; color: #6b7280; }
  `;

  function injectCSS() {
    if (document.getElementById('iip-reopen-css')) return;
    const s = document.createElement('style');
    s.id = 'iip-reopen-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── API calls ───────────────────────────────────────────────────────────────

  function authFetch(url, opts) {
    return fetch(url, opts);
  }

  async function submitReopen(caseNumber, payload) {
    // 1. Create reopen record
    const res = await authFetch(`${API_BASE}/cases/${caseNumber}/reopen`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Reopen failed: ${res.status}`);
    }
    const data = await res.json();

    // 2. Create tracker entry for current week (if requested)
    if (payload.createTrackerEntry && window.WTSave) {
      const now    = new Date();
      const yr     = now.getFullYear();
      const cw     = `CW${String(isoWeek(now)).padStart(2,'0')}`;
      await window.WTSave.saveEntry({
        caseNumber,
        owner:    payload.assignTo || '',
        category: 'Reopen / No Response',
        comments: `REOPENED: ${payload.reasonLabel}. ${payload.justification}`,
        year:     yr,
        week:     cw,
      }).catch(() => {});
    }

    // 3. Emit realtime event
    if (window.IIPRealtime) {
      document.dispatchEvent(new CustomEvent('iip:case:updated', {
        detail: { caseNumber, changes: { status: 'Reopened' }, by: window.IIPAuth?.user()?.username },
        bubbles: true,
      }));
    }

    return data;
  }

  function isoWeek(d) {
    const date = new Date(d);
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const w1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
  }

  // ── Dialog ──────────────────────────────────────────────────────────────────

  function showDialog(caseNumber, caseTitle, owner, onSuccess) {
    injectCSS();
    document.getElementById('iip-reopen-overlay')?.remove();

    const reasonOptions = REASON_CODES.map(r =>
      `<option value="${r.code}">${r.label}</option>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.id = 'iip-reopen-overlay';
    overlay.innerHTML = `
      <div id="iip-reopen-dialog">
        <div class="iip-ro-header">
          <h2>⚠️ Reopen Case</h2>
          <button class="iip-ro-close" aria-label="Close">×</button>
        </div>
        <div class="iip-ro-body">
          <div class="iip-ro-case-banner">
            <strong>${caseNumber}</strong>
            <span>${(caseTitle || '').slice(0, 80)}</span>
          </div>

          <div class="iip-ro-error" id="iip-ro-error"></div>

          <div class="iip-ro-field">
            <label class="iip-ro-label">Reason Code <span class="required">*</span></label>
            <select class="iip-ro-select" id="iip-ro-reason">
              <option value="">— Select a reason —</option>
              ${reasonOptions}
            </select>
          </div>

          <div class="iip-ro-field">
            <label class="iip-ro-label">
              Justification <span class="required">*</span>
              <span style="font-weight:400;color:#9ca3af;">(min 20 characters)</span>
            </label>
            <textarea class="iip-ro-textarea" id="iip-ro-justification"
              placeholder="Describe what happened, why the case needs to be reopened, and what steps have been taken since closure..."
              maxlength="1000"></textarea>
            <div class="iip-ro-char-count" id="iip-ro-char-count">0 / 1000</div>
          </div>

          <div class="iip-ro-field">
            <label class="iip-ro-label">Assign To</label>
            <input class="iip-ro-input" id="iip-ro-assign" type="text"
              value="${owner || ''}" placeholder="Engineer name" />
          </div>

          <div class="iip-ro-check-row">
            <input type="checkbox" id="iip-ro-tracker" checked />
            <label for="iip-ro-tracker">
              Automatically create a tracker entry for this week with the reopen reason
            </label>
          </div>
          <div class="iip-ro-check-row">
            <input type="checkbox" id="iip-ro-sla-reset" />
            <label for="iip-ro-sla-reset">
              Reset SLA timer (treat as a new case for SLA calculation)
            </label>
          </div>
        </div>
        <div class="iip-ro-footer">
          <button class="btn btn-secondary" id="iip-ro-cancel">Cancel</button>
          <button class="btn btn-danger" id="iip-ro-submit">🔄 Reopen Case</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Wire char counter
    const textarea = document.getElementById('iip-ro-justification');
    const counter  = document.getElementById('iip-ro-char-count');
    textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length} / 1000`;
    });

    // Wire close
    overlay.querySelector('.iip-ro-close').onclick = () => overlay.remove();
    document.getElementById('iip-ro-cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // Wire submit
    document.getElementById('iip-ro-submit').addEventListener('click', async () => {
      const reasonCode = document.getElementById('iip-ro-reason').value;
      const justification = textarea.value.trim();
      const errEl = document.getElementById('iip-ro-error');

      errEl.style.display = 'none';
      if (!reasonCode) { errEl.textContent = 'Please select a reason code.'; errEl.style.display = 'block'; return; }
      if (justification.length < 20) { errEl.textContent = 'Justification must be at least 20 characters.'; errEl.style.display = 'block'; return; }

      const btn = document.getElementById('iip-ro-submit');
      btn.disabled = true;
      btn.textContent = 'Reopening…';

      const reasonLabel = REASON_CODES.find(r => r.code === reasonCode)?.label || reasonCode;

      try {
        await submitReopen(caseNumber, {
          reasonCode,
          reasonLabel,
          justification,
          assignTo:           document.getElementById('iip-ro-assign').value.trim(),
          createTrackerEntry: document.getElementById('iip-ro-tracker').checked,
          resetSLA:           document.getElementById('iip-ro-sla-reset').checked,
          reopenedBy:         window.IIPAuth?.user()?.displayName || window.IIPAuth?.user()?.username || 'unknown',
        });

        // Success state
        document.getElementById('iip-reopen-dialog').innerHTML = `
          <div class="iip-ro-success">
            <div class="icon">✅</div>
            <h3>Case Reopened</h3>
            <p>${caseNumber} has been reopened with reason: <strong>${reasonLabel}</strong></p>
            <p style="margin-top:8px;">A tracker entry has been created for the current week.</p>
            <button class="btn btn-primary" style="margin-top:16px;" onclick="document.getElementById('iip-reopen-overlay').remove()">Close</button>
          </div>
        `;
        if (onSuccess) onSuccess({ caseNumber, reasonCode, reasonLabel });
      } catch (e) {
        errEl.textContent = e.message;
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = '🔄 Reopen Case';
      }
    });

    // Focus reason select
    setTimeout(() => document.getElementById('iip-ro-reason')?.focus(), 50);
  }

  // ── Auto-attach to existing reopen buttons ───────────────────────────────────

  function attachToPage() {
    injectCSS();

    function wire(btn) {
      if (btn.dataset.reopenWired) return;
      btn.dataset.reopenWired = '1';
      btn.addEventListener('click', e => {
        e.preventDefault();
        const row = btn.closest('[data-case-number],[data-case],[data-id]');
        const cn  = btn.dataset.caseNumber || row?.dataset.caseNumber || row?.dataset.case || '';
        const title = btn.dataset.title || row?.querySelector('.case-title,.col-title')?.textContent?.trim() || '';
        const owner = btn.dataset.owner || row?.querySelector('.col-owner')?.textContent?.trim() || '';
        if (cn) showDialog(cn, title, owner);
      });
    }

    // Wire existing buttons
    document.querySelectorAll('[data-reopen-btn],[data-action="reopen"],.btn-reopen').forEach(wire);

    // Watch for dynamically added ones
    const obs = new MutationObserver(() => {
      document.querySelectorAll('[data-reopen-btn],[data-action="reopen"],.btn-reopen:not([data-reopen-wired])').forEach(wire);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  window.IIPReopen = {
    showDialog,
    attachToPage,
    REASON_CODES,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachToPage);
  } else {
    attachToPage();
  }

}(window));

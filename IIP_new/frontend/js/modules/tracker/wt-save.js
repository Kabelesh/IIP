/* =============================================================================
   js/modules/tracker/wt-save.js  —  Weekly Tracker Save (localStorage only)
   No server, no /api/v1, no save.php. All data persisted in localStorage.
   ============================================================================= */
'use strict';

const WTSave = (() => {

  const CMT_KEY = 'ibm_wtracker_comments_v1';
  // On file://, use sessionStorage to avoid the empty-namespace isolation issue.

  // ── Save a full week's entries ─────────────────────────────────────────────
  async function saveWeek(year, cwKey, entries) {
    try {
      const storeKey = `ibm_wtracker_${year}`;
      const yearData = _lsGet(storeKey) || {};
      yearData[cwKey] = entries;
      _lsSet(storeKey, yearData);
      return { ok: true };
    } catch(e) {
      console.warn('[WTSave] saveWeek failed:', e);
      return { ok: false, error: e.message };
    }
  }

  // ── Load comments ──────────────────────────────────────────────────────────
  async function loadComments() {
    return _lsGet(CMT_KEY) || {};
  }

  // ── Save a single comment ─────────────────────────────────────────────────
  async function saveComment(caseNum, text, weekKey) {
    try {
      const cmts = _lsGet(CMT_KEY) || {};
      if (text === null || text === '') {
        delete cmts[caseNum];
      } else {
        cmts[caseNum] = text;
      }
      _lsSet(CMT_KEY, cmts);
      return { ok: true };
    } catch(e) {
      return { ok: false, error: e.message };
    }
  }

  // ── Save all comments at once ─────────────────────────────────────────────
  async function saveAllComments(commentMap) {
    try {
      const existing = _lsGet(CMT_KEY) || {};
      Object.assign(existing, commentMap);
      _lsSet(CMT_KEY, existing);
      return { ok: true };
    } catch(e) {
      return { ok: false, error: e.message };
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function _lsGet(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
    catch(_) { return null; }
  }
  function _lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch(e) { console.warn('[WTSave] storage write failed:', e); }
  }

  return { saveWeek, loadComments, saveComment, saveAllComments };
})();

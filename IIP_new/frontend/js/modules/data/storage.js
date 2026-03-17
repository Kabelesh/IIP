/* =============================================================================
   js/modules/data/storage.js  —  IIP Storage Adapter (localStorage)
   =============================================================================
   Uses localStorage for all persistence. Works on both file:// and http://.
   Note: file:// and http:// origins have separate localStorage namespaces —
   data entered on one is not visible on the other (browser security boundary).

   API:
     await IIPStore.set(key, value)    — save JSON-serialisable value
     await IIPStore.get(key)           — load value
     IIPStore.getSync(key)             — synchronous read
     await IIPStore.remove(key)        — delete
     await IIPStore.setCases(rows)     — save raw CSV rows
     await IIPStore.getCases()         — load rows or null
     await IIPStore.setOverrides(ov)   — save admin overrides
     await IIPStore.getOverrides()     — load overrides (default: {})
     IIPStore.mode                     — always 'local'
     IIPStore.isFileMode()             — true if protocol is file://
   ============================================================================= */

(function () {
  'use strict';

  const KEYS = {
    CASES_RAW:        'ibm_cases_raw_v1',
    CASES_OVERRIDES:  'ibm_cases_overrides_v1',
    REOPENED_CASES:   'ibm_reopened_cases_v1',
    TRACKER_PERSIST:  'ibm_tracker_persist_v1',
    TEAM_CONFIG:      'ibm_team_config_v1',
    TRACKER_COMMENTS: 'ibm_wtracker_comments_v1',
    IMPORT_LOG:       'ibm_import_log_v1',
  };

  const _isFileMode = window.location.protocol === 'file:';

  function _lsGet(key) {
    try { const r = localStorage.getItem(key); return r === null ? null : JSON.parse(r); }
    catch (_) { return null; }
  }
  function _lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.warn('[IIPStore] localStorage write failed:', e.message); return false; }
  }
  function _lsDel(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  async function set(key, value)  { _lsSet(key, value); return true; }
  async function get(key)         { return _lsGet(key); }
  function  getSync(key)          { return _lsGet(key); }
  async function remove(key)      { _lsDel(key); }

  const setCases       = rows => set(KEYS.CASES_RAW,       rows);
  const getCases       = ()   => get(KEYS.CASES_RAW).then(d => Array.isArray(d) ? d : null);
  const setOverrides   = ov   => set(KEYS.CASES_OVERRIDES,  ov);
  const getOverrides   = ()   => get(KEYS.CASES_OVERRIDES).then(d => (d && typeof d === 'object') ? d : {});
  const setReopened    = arr  => set(KEYS.REOPENED_CASES,   arr);
  const getReopened    = ()   => get(KEYS.REOPENED_CASES).then(d => Array.isArray(d) ? d : []);

  window.IIPStore = {
    set, get, getSync, remove,
    setCases, getCases, setOverrides, getOverrides,
    setReopened, getReopened,
    KEYS,
    mode:         'local',
    isFileMode:   () => _isFileMode,
    isServerMode: () => false,
  };
}());

/* ============================================================
   js/modules/data.js  —  Central data store & team definitions
   ============================================================ */
const Data = (() => {

  // ── Dynamic config helper ──────────────────────────────
  const _dc = () => (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;

  function _teamMembers() { return Contacts.TEAM_MEMBERS; }
  function _teamEmails()  { return Contacts.TEAM_EMAILS; }

  function _nameAliases() {
    return _dc() ? _dc().nameAliases() : {
      "srinivasareddy karnatilakshmireddygari": "Srinivas K",
      "venkata suvidya dega": "Suvidya",
      "srinivas k": "Srinivas K",
      "suvidya": "Suvidya"
    };
  }

  function _customerProducts() {
    return _dc() ? _dc().customerProducts() : new Set([
      "Engineering Lifecycle Management Base",
      "Engineering Lifecycle Management Suite",
      "Engineering Requirements Management DOORS Next",
      "Engineering Test Management",
      "Engineering Workflow Management"
    ]);
  }

  function _customerAccountId() {
    return _dc() ? _dc().customerAccountId() : "881812";
  }

  function _buildTeamLower() {
    // Guard: Contacts may not be populated yet on first synchronous call
    const members = (typeof Contacts !== "undefined" && Contacts.TEAM_MEMBERS) 
      ? _teamMembers() : [];
    return new Set([
      ...members.map(m => m.toLowerCase()),
      ...Object.keys(_nameAliases()),
    ]);
  }
  let _TEAM_LOWER = _buildTeamLower();

  function refreshTeamIndex() {
    _TEAM_LOWER = _buildTeamLower();
    Contacts.refresh();
  }

  // Proxy so external code using Data.CUSTOMER_PRODUCTS.has() still works
  const CUSTOMER_PRODUCTS = { has: (v) => _customerProducts().has(v) };

  // ── State ────────────────────────────────────────────────
  let _allCases        = [];
  let _performanceMeta = {};   // { caseNum: { category, instance, workItem } }
  let _perfCaseNums    = new Set();
  let _nonPerfCaseNums = new Set();
  let _changeHistory   = [];
  let _caseDetailLogs  = {};   // { caseNum: { caseInfo:{...}, wednesdayComments:{YYYY-MM-DD: text} } }
  let _undoStack       = [];   // undo history snapshots
  let _redoStack       = [];   // redo history snapshots
  let _adminMode       = false;
  let _reassignLog     = []; // [{ caseNum, oldOwner, newOwner, title, ts }]

  function _currentSnap() {
    return {
      cases:   _allCases.map(c => ({...c})),
      meta:    JSON.parse(JSON.stringify(_performanceMeta)),
      perf:    [..._perfCaseNums],
      nonPerf: [..._nonPerfCaseNums],
      history: _changeHistory.slice(),
      // Also snapshot DynamicConfig so admin config changes are undoable
      dcCfg:   (_dc() && _dc().getRaw) ? JSON.parse(JSON.stringify(_dc().getRaw())) : null,
    };
  }

  const MAX_UNDO = 30;

  function _snapshot() {
    _undoStack.push(_currentSnap());
    if (_undoStack.length > MAX_UNDO) _undoStack.shift();
    _redoStack = [];  // any new action clears redo
  }

  // Public entry point for admin config saves (DC changes don't go through _snapshot automatically)
  function snapshotForAdmin() { _snapshot(); }

  async function _restoreSnap(snap) {
    _allCases        = snap.cases;
    _performanceMeta = snap.meta;
    _perfCaseNums    = new Set(snap.perf);
    _nonPerfCaseNums = new Set(snap.nonPerf || []);
    _changeHistory   = snap.history;
    // Restore DynamicConfig if it was captured
    if (snap.dcCfg && _dc() && _dc().save) {
      await _dc().save(snap.dcCfg);
      // Re-sync contacts/team index after DC restore
      if (typeof Contacts !== "undefined" && Contacts.refresh) Contacts.refresh();
      if (typeof Data !== "undefined" && Data.refreshTeamIndex) Data.refreshTeamIndex();
    }
    _persist();
  }

  async function undoLastChange() {
    if (!_undoStack.length) return false;
    _redoStack.push(_currentSnap());
    const snap = _undoStack.pop();
    await _restoreSnap(snap);
    return true;
  }

  async function redoLastChange() {
    if (!_redoStack.length) return false;
    _undoStack.push(_currentSnap());
    const snap = _redoStack.pop();
    await _restoreSnap(snap);
    return true;
  }

  function undoStackSize() { return _undoStack.length; }
  function redoStackSize() { return _redoStack.length; }

  // ── Rename owners in all cases + history (called after team member rename) ──
  function renameOwners(renameMap) {
    // renameMap: { "Old Name": "New Name", ... }
    if (!renameMap || !Object.keys(renameMap).length) return;
    _allCases = _allCases.map(c => {
      const newOwner = renameMap[c.Owner];
      if (!newOwner) return c;
      return { ...c, Owner: newOwner, _ownerOverride: true };
    });
    // Update change history entries that reference old names
    _changeHistory = _changeHistory.map(ch => {
      const updated = { ...ch };
      for (const [oldN, newN] of Object.entries(renameMap)) {
        if (updated.oldValue === oldN) updated.oldValue = newN;
        if (updated.newValue === oldN) updated.newValue = newN;
        if (updated.caseNumber === oldN) updated.caseNumber = newN;
      }
      return updated;
    });
    _persist();
  }

  // ── Setters ──────────────────────────────────────────────
  const LS_KEY = "ibm_tracker_persist_v1";

  function _persist() {
    try {
      const data = {
        meta:    _performanceMeta,
        perf:    [..._perfCaseNums],
        nonPerf: [..._nonPerfCaseNums],
        history: _changeHistory.slice(0, 50),
        caseDetailLogs: _caseDetailLogs,
        ownerOverrides: _allCases.reduce((acc, c) => {
          if (c._ownerOverride) {
            acc[c["Case Number"]] = {
              owner:    c.Owner,
              original: c._originalOwner || null,
              ts:       c._overrideTs    || null,
            };
          }
          return acc;
        }, {}),
        reassignLog: _reassignLog.slice(0, 200)
      };
      // Always write directly to localStorage for guaranteed sync persistence
      try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch(e) {}
      // Also write via IIPStore (async, best-effort)
      if (typeof IIPStore !== "undefined") {
        try { IIPStore.set(LS_KEY, data); } catch(e) {}
      }
    } catch(e) { console.warn("Persist failed:", e); }
  }

  function _loadPersisted() {
    // Always try localStorage directly first (synchronous, guaranteed)
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) return Promise.resolve(parsed);
      }
    } catch(e) {}
    // Fallback to IIPStore (async)
    if (typeof IIPStore !== "undefined") {
      return IIPStore.get(LS_KEY).catch(() => null);
    }
    return Promise.resolve(null);
  }
  function _applyPersisted(saved) {
    if (!saved) return;
    if (saved.meta)    _performanceMeta = saved.meta;
    if (saved.perf)    _perfCaseNums    = new Set(saved.perf);
    if (saved.nonPerf) _nonPerfCaseNums = new Set(saved.nonPerf);
    if (saved.history) _changeHistory   = saved.history;
    if (saved.caseDetailLogs) _caseDetailLogs = saved.caseDetailLogs;
    if (Array.isArray(saved.reassignLog)) _reassignLog = saved.reassignLog;
    if (saved.ownerOverrides && Object.keys(saved.ownerOverrides).length) {
      _allCases = _allCases.map(c => {
        const ov = saved.ownerOverrides[c["Case Number"]];
        if (!ov) return c;
        // Support both old format (string) and new format (object with owner/original/ts)
        const newOwner   = typeof ov === "object" ? ov.owner    : ov;
        const origOwner  = typeof ov === "object" ? ov.original : null;
        const overrideTs = typeof ov === "object" ? ov.ts       : null;
        return { ...c, Owner: newOwner, _ownerOverride: true,
                 _originalOwner: origOwner || c.Owner,
                 _overrideTs: overrideTs };
      });
    }
  }

  function loadCases(rows) {
    _allCases = rows;
    // Apply any saved overrides/meta (async but returns promise for callers)
    return _loadPersisted().then(saved => {
      if (saved) _applyPersisted(saved);
    }).catch(() => {});
  }

  function clearPersisted() {
    try { localStorage.removeItem(LS_KEY); } catch(e) {}
    _performanceMeta = {};
    _perfCaseNums    = new Set();
    _nonPerfCaseNums = new Set();
    _changeHistory   = [];
  }

  function setAdminMode(v) {
    _adminMode = v;
    // Persist across F5 refreshes (sessionStorage clears when browser tab is closed)
    try {
      if (v) { sessionStorage.setItem("ibm_admin_session_v1", "1"); }
      else   { sessionStorage.removeItem("ibm_admin_session_v1"); }
    } catch(e) {}
  }

  function setPerformanceMeta(caseNum, patch) {
    _snapshot();
    _performanceMeta[caseNum] = Object.assign(_performanceMeta[caseNum] || {}, patch);
    _persist();
  }

  function setPerfCaseNums(arr)        { _snapshot(); _perfCaseNums = new Set(arr.map(s => s.trim())); _persist(); }
  function addPerfCaseNum(num)         { _snapshot(); _perfCaseNums.add(num.trim()); _persist(); }
  function removePerfCaseNum(num)      {
    _snapshot();
    const n = num.trim();
    _perfCaseNums.delete(n);
    // Clear performance meta for this case so it no longer shows as perf anywhere
    if (_performanceMeta[n]) {
      delete _performanceMeta[n];
    }
    _persist();
  }
  function getPerfCaseNums()           { return [..._perfCaseNums]; }
  function isMarkedPerformance(n)      { return _perfCaseNums.has(n); }

  function addNonPerfCaseNum(num)      { _snapshot(); _nonPerfCaseNums.add(num.trim()); _persist(); }
  function removeNonPerfCaseNum(num)   { _snapshot(); _nonPerfCaseNums.delete(num.trim()); _persist(); }
  function getNonPerfCaseNums()        { return [..._nonPerfCaseNums]; }
  function isMarkedNonPerformance(n)   { return _nonPerfCaseNums.has(n); }

  function pushChange(entry)           { _changeHistory.unshift(entry); _persist(); }
  function removeChange(id)            { _changeHistory = _changeHistory.filter(e => e.id !== id); _persist(); }
  function clearHistory()              { _changeHistory = []; _persist(); }
  function restoreChangeHistory(hist)  { if (Array.isArray(hist)) { _changeHistory = hist; _persist(); } }

  function _matchOwner(owner, target) {
    const o = (owner||"").toLowerCase();
    const t = (target||"").toLowerCase();
    if (o === t) return true;
    // Check if both names resolve to the same alias
    const aliases = _nameAliases();
    const oAlias = (aliases[o] || "").toLowerCase();
    const tAlias = (aliases[t] || "").toLowerCase();
    if (oAlias && oAlias === t) return true;
    if (tAlias && tAlias === o) return true;
    if (oAlias && tAlias && oAlias === tAlias) return true;
    return false;
  }

  function reassignCase(caseNum, newOwner) {
    _snapshot();
    const idx = _allCases.findIndex(c => c["Case Number"] === caseNum);
    if (idx === -1) return;
    const old = _allCases[idx].Owner;
    // Preserve original owner (before any override) for audit display
    const originalOwner = _allCases[idx]._originalOwner || old;
    const caseTitle = _allCases[idx].Title || _allCases[idx].title || "";
    _allCases[idx] = { ..._allCases[idx], Owner: newOwner, _ownerOverride: true,
                       _originalOwner: originalOwner, _overrideTs: new Date().toISOString() };
    pushChange({ id: Date.now(), caseNumber: caseNum, field: "Owner",
      oldValue: old, newValue: newOwner, updatedBy: "Admin", timestamp: new Date().toLocaleString() });
    // Add to reassign log
    _reassignLog.unshift({ caseNum, oldOwner: old, newOwner, title: caseTitle, ts: new Date().toLocaleString() });
    if (_reassignLog.length > 200) _reassignLog = _reassignLog.slice(0, 200);
    _persist();
  }

  function bulkReassign(caseNums, newOwner) {
    _snapshot();
    const numSet = new Set(caseNums);
    const logEntries = [];
    _allCases = _allCases.map(c => {
      if (!numSet.has(c["Case Number"])) return c;
      pushChange({ id: Date.now() + Math.random(), caseNumber: c["Case Number"],
        field: "Owner", oldValue: c.Owner, newValue: newOwner,
        updatedBy: "Admin", timestamp: new Date().toLocaleString() });
      logEntries.push({ caseNum: c["Case Number"], oldOwner: c.Owner, newOwner,
        title: c.Title || c.title || "", ts: new Date().toLocaleString() });
      const originalOwner = c._originalOwner || c.Owner;
      return { ...c, Owner: newOwner, _ownerOverride: true,
               _originalOwner: originalOwner, _overrideTs: new Date().toISOString() };
    });
    if (logEntries.length) {
      _reassignLog.unshift(...logEntries);
      if (_reassignLog.length > 200) _reassignLog = _reassignLog.slice(0, 200);
    }
    _persist();
  }

  function getReassignLog()       { return _reassignLog; }
  function clearReassignLog()     { _reassignLog = []; _persist(); }
  function removeReassignLogEntry(idx) {
    if (idx >= 0 && idx < _reassignLog.length) {
      _reassignLog.splice(idx, 1);
      _persist();
    }
  }
  function addReassignLogEntries(entries) {
    _reassignLog.unshift(...entries);
    if (_reassignLog.length > 200) _reassignLog = _reassignLog.slice(0, 200);
    _persist();
  }

  // ── Getters ──────────────────────────────────────────────
  function allCases()        { return _allCases; }
  function performanceMeta() { return _performanceMeta; }
  function changeHistory()   { return _changeHistory; }
  function isAdmin()         { return _adminMode; }
  function teamMembers()     { return _teamMembers(); }
  function teamEmails()      { return _teamEmails(); }

  function isTeamOwner(owner) { return _TEAM_LOWER.has((owner||"").toLowerCase()); }

  // Returns display name (applies aliases for renamed members)
  function displayName(owner) {
    const low = (owner||"").toLowerCase();
    const aliases = _nameAliases();
    return aliases[low] || owner;
  }

  function teamCases()         { return _allCases.filter(r => isTeamOwner(r.Owner)); }
  function customerCases()     { return _allCases.filter(r => _customerProducts().has(r.Product) && !isTeamOwner(r.Owner)); }
  function openTeamCases()     { return teamCases().filter(r => !Utils.isClosed(r.Status)); }
  function closedTeamCases()   { return teamCases().filter(r =>  Utils.isClosed(r.Status)); }

  // Performance candidates = customer 881812, open, team owner only
  function performanceCandidates() {
    return _allCases.filter(r =>
      (r["Customer number"]||"").includes(_customerAccountId()) &&
      !Utils.isClosed(r.Status) &&
      isTeamOwner(r.Owner)
    );
  }

  // ALL team cases (open + closed) with perf meta — used by case detail page & WT highlighting
  function allTeamCasesWithMeta() {
    const meta     = _performanceMeta;
    const perfNums = _perfCaseNums;
    const nonPerf  = _nonPerfCaseNums;
    return teamCases().map(r => {
      const cn   = r["Case Number"];
      const m    = meta[cn] || {};
      const isP  = !nonPerf.has(cn) && (perfNums.has(cn) || m.category === "performance");
      return { ...r, _isPerformance: isP, _meta: m };
    });
  }

  // ── Case Detail Logs (Wednesday comment tracking) ────────
  function getCaseDetailLog(caseNum) {
    return _caseDetailLogs[caseNum] || null;
  }

  function setCaseDetailLog(caseNum, data) {
    // data = { caseInfo: {...}, wednesdayComments: { "YYYY-MM-DD": "text" } }
    _caseDetailLogs[caseNum] = data;
    _persist();
  }

  function setWednesdayComment(caseNum, dateStr, text) {
    if (!_caseDetailLogs[caseNum]) {
      _caseDetailLogs[caseNum] = { wednesdayComments: {} };
    }
    if (!_caseDetailLogs[caseNum].wednesdayComments) {
      _caseDetailLogs[caseNum].wednesdayComments = {};
    }
    _caseDetailLogs[caseNum].wednesdayComments[dateStr] = text;
    _persist();
  }

  function getWednesdayComment(caseNum, dateStr) {
    return ((_caseDetailLogs[caseNum] || {}).wednesdayComments || {})[dateStr] || "";
  }

  // Register a case into caseDetailLogs when first opened (stores base info)
  function registerCaseDetail(caseNum, caseInfo) {
    if (!_caseDetailLogs[caseNum]) {
      _caseDetailLogs[caseNum] = { caseInfo, wednesdayComments: {} };
    } else {
      // Always refresh caseInfo with latest data
      _caseDetailLogs[caseNum].caseInfo = caseInfo;
    }
    _persist();
  }

  return {
    loadCases, allCases, teamCases, customerCases,
    openTeamCases, closedTeamCases, performanceCandidates,
    allTeamCasesWithMeta,
    isTeamOwner, displayName, teamMembers, teamEmails, refreshTeamIndex,
    customerAccountId: () => _customerAccountId(),
    performanceMeta, setPerformanceMeta,
    getPerfCaseNums, setPerfCaseNums, addPerfCaseNum, removePerfCaseNum, isMarkedPerformance,
    addNonPerfCaseNum, removeNonPerfCaseNum, getNonPerfCaseNums, isMarkedNonPerformance,
    changeHistory, pushChange, removeChange, clearHistory, restoreChangeHistory, reassignCase, bulkReassign,
    isAdmin, setAdminMode,
    getCaseDetailLog, setCaseDetailLog, setWednesdayComment, getWednesdayComment, registerCaseDetail,
    undoLastChange, undoStackSize, redoLastChange, redoStackSize, snapshotForAdmin, renameOwners, clearPersisted,
    persistNow: _persist,
    CUSTOMER_PRODUCTS,
    // Returns the original owner before any admin override was applied
    getReassignLog, clearReassignLog, addReassignLogEntries, removeReassignLogEntry,
    getOriginalOwner: (caseNum) => {
      const c = _allCases.find(x => x["Case Number"] === caseNum);
      return c ? (c._originalOwner || c.Owner) : null;
    },
    getOverrideTs: (caseNum) => {
      const c = _allCases.find(x => x["Case Number"] === caseNum);
      return c ? (c._overrideTs || null) : null;
    },
  };
})();

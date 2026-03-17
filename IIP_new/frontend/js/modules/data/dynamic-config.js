/* ============================================================
   js/modules/dynamic-config.js  —  Dynamic Configuration Layer
   localStorage-only. No server fetches.
   ============================================================ */

const DynamicConfig = (() => {
  const STORAGE_KEY = 'ibm_team_config_v1_cache';
  let _cfg = null;

  // ── Load from localStorage ────────────────────────────────
  async function load() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) _cfg = JSON.parse(cached);
    } catch(e) {}
  }

  // ── Save — merge patch and persist ───────────────────────
  async function save(patch) {
    _cfg = Object.assign(_cfg || {}, patch);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_cfg)); } catch(e) {}
  }

  async function clear() {
    _cfg = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  }

  // ── Raw config access ─────────────────────────────────────
  function getRaw()   { return _cfg ? JSON.parse(JSON.stringify(_cfg)) : {}; }
  function isLoaded() { return _cfg !== null; }

  async function exportConfig() { return getRaw(); }

  // ── Team data getters (fall back to AppData) ──────────────
  function teamMembers() {
    return (_cfg && Array.isArray(_cfg.teamMembers) && _cfg.teamMembers.length > 0)
      ? _cfg.teamMembers
      : (typeof AppData !== 'undefined' ? AppData.teamMembers : []);
  }

  function teamEmails() {
    const base = (typeof AppData !== 'undefined') ? AppData.teamEmails : {};
    if (!_cfg || !_cfg.teamEmails) return base;
    return { ...base, ..._cfg.teamEmails };
  }

  function almResponsible() {
    return (_cfg && Array.isArray(_cfg.almResponsible) && _cfg.almResponsible.length > 0)
      ? _cfg.almResponsible
      : (typeof AppData !== 'undefined' ? AppData.almResponsible : []);
  }

  function customerContacts() {
    return (_cfg && Array.isArray(_cfg.customerContacts) && _cfg.customerContacts.length > 0)
      ? _cfg.customerContacts
      : (typeof AppData !== 'undefined' ? AppData.customerContacts : []);
  }

  function expertiseConnect() {
    return (_cfg && Array.isArray(_cfg.expertiseConnect) && _cfg.expertiseConnect.length > 0)
      ? _cfg.expertiseConnect
      : (typeof AppData !== 'undefined' ? AppData.expertiseConnect : []);
  }

  function bdEscalation() {
    return (_cfg && Array.isArray(_cfg.bdEscalation) && _cfg.bdEscalation.length > 0)
      ? _cfg.bdEscalation
      : (typeof AppData !== 'undefined' ? AppData.bdEscalation : []);
  }

  function teamLead() {
    return (_cfg && Array.isArray(_cfg.teamLead) && _cfg.teamLead.length > 0)
      ? _cfg.teamLead
      : (typeof AppData !== 'undefined' ? AppData.teamLead : []);
  }

  function ibmDirectory() {
    if (_cfg && _cfg.ibmDirectory && Object.keys(_cfg.ibmDirectory).length > 0)
      return _cfg.ibmDirectory;
    return (typeof AppData !== 'undefined') ? AppData.ibmDirectory : {};
  }

  function appConfig() {
    const base = (typeof AppData !== 'undefined') ? { ...AppData.config } : {};
    if (!_cfg || !_cfg.config) return base;
    return { ...base, ..._cfg.config };
  }

  // ── Case / product getters ────────────────────────────────
  function customerProducts() {
    if (_cfg && Array.isArray(_cfg.customerProducts) && _cfg.customerProducts.length > 0)
      return new Set(_cfg.customerProducts);
    return new Set([
      "Engineering Lifecycle Management Base",
      "Engineering Lifecycle Management Suite",
      "Engineering Requirements Management DOORS Next",
      "Engineering Test Management",
      "Engineering Workflow Management"
    ]);
  }

  function customerAccountId() {
    return (_cfg && _cfg.customerAccountId) || "881812";
  }

  function caseNumberPattern() {
    if (_cfg && _cfg.caseNumberPattern) {
      try { return new RegExp(_cfg.caseNumberPattern, 'i'); } catch(e) {}
    }
    return /^TS\d{8,}/i;
  }

  function nameAliases() {
    const staticAliases = {
      "srinivasareddy karnatilakshmireddygari": "Srinivas K",
      "venkata suvidya dega": "Suvidya",
      "srinivas k": "Srinivas K",
      "suvidya": "Suvidya"
    };
    if (!_cfg || !_cfg.nameAliases) return staticAliases;
    return { ...staticAliases, ..._cfg.nameAliases };
  }

  function csvFieldMap() {
    return (_cfg && _cfg.csvFieldMap) ? _cfg.csvFieldMap : null;
  }

  // ── Auto-detect helpers ───────────────────────────────────
  function detectNewOwners(rows) {
    const knownLower = new Set([
      ...teamMembers().map(n => n.toLowerCase()),
      ...Object.keys(nameAliases()),
    ]);
    const seen = new Set();
    const newOwners = [];
    rows.forEach(r => {
      const o = (r.Owner || '').trim();
      if (!o) return;
      const ol = o.toLowerCase();
      if (!knownLower.has(ol) && !seen.has(ol)) { seen.add(ol); newOwners.push(o); }
    });
    return newOwners;
  }

  function detectProducts(rows) {
    return [...new Set(rows.map(r => (r.Product || '').trim()).filter(Boolean))];
  }

  async function approveNewOwners(names) {
    const existing = teamMembers();
    const merged = [...new Set([...existing, ...names])];
    await save({ teamMembers: merged, teamEmails: teamEmails() });
    if (typeof Data !== 'undefined' && typeof Data.refreshTeamIndex === 'function') {
      Data.refreshTeamIndex();
    }
  }

  async function saveProducts(products) {
    await save({ customerProducts: products });
  }

  return {
    load, save, clear, exportConfig, getRaw, isLoaded,
    teamMembers, teamEmails, almResponsible, customerContacts,
    expertiseConnect, bdEscalation, teamLead, ibmDirectory,
    appConfig, customerProducts, customerAccountId,
    caseNumberPattern, nameAliases, csvFieldMap,
    detectNewOwners, detectProducts, approveNewOwners, saveProducts,
  };
})();

/* ================================================================
   js/modules/contacts.js  —  Contact Data Adapter
   ----------------------------------------------------------------
   READ-ONLY adapter. Data priority:
     1. DynamicConfig (server-saved team config)
     2. AppData (static app-data.js fallback)

   All dashboards consume Contacts.* — no dashboard changes needed.
   Admin Portal writes via DynamicConfig.save() and calls
   Contacts.refresh() to update the live values in this module.

   ► Usage (unchanged for all consumers):
     Contacts.TEAM_MEMBERS         → string[]
     Contacts.TEAM_EMAILS          → { name: email }
     Contacts.EXPERTISE_CONNECT    → { name, email }[]
     Contacts.BD_ESCALATION        → { name, email }[]
     Contacts.TEAM_LEAD            → { name, email }[]
     Contacts.CUSTOMER_CONTACTS    → { line, names, emails }[]
     Contacts.ALM_RESPONSIBLE      → { alm, bd, bdEmail, ibm, proxy }[]
     Contacts.IBM_DIRECTORY        → { [group]: { name, email }[] }
     Contacts.getEmail(name)       → string
     Contacts.refresh()            → re-read from DynamicConfig (call after save)
   ================================================================ */

const Contacts = (() => {

  /* ── Guard: warn gracefully if AppData hasn't loaded ──────── */
  if (typeof AppData === "undefined") {
    console.warn("[Contacts] AppData not found. Falling back to empty data.");
    return {
      TEAM_MEMBERS: [], TEAM_EMAILS: {}, EXPERTISE_CONNECT: [],
      BD_ESCALATION: [], TEAM_LEAD: [], CUSTOMER_CONTACTS: [],
      ALM_RESPONSIBLE: [], IBM_DIRECTORY: {},
      getEmail: () => "", refresh: () => {},
    };
  }

  /* ── Internal mutable state (refreshable after Admin saves) ── */
  let _TEAM_MEMBERS      = [];
  let _TEAM_EMAILS       = {};
  let _EXPERTISE_CONNECT = [];
  let _BD_ESCALATION     = [];
  let _TEAM_LEAD         = [];
  let _CUSTOMER_CONTACTS = [];
  let _ALM_RESPONSIBLE   = [];
  let _IBM_DIRECTORY     = {};

  /* ── Populate from DynamicConfig (with AppData fallback) ──── */
  function _populate() {
    const DC = (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;
    _TEAM_MEMBERS      = DC ? DC.teamMembers()      : AppData.teamMembers;
    _TEAM_EMAILS       = DC ? DC.teamEmails()       : AppData.teamEmails;
    _EXPERTISE_CONNECT = DC ? DC.expertiseConnect() : AppData.expertiseConnect;
    _BD_ESCALATION     = DC ? DC.bdEscalation()     : AppData.bdEscalation;
    _TEAM_LEAD         = DC ? DC.teamLead()         : AppData.teamLead;
    _CUSTOMER_CONTACTS = DC ? DC.customerContacts() : AppData.customerContacts;
    _ALM_RESPONSIBLE   = DC ? DC.almResponsible()   : AppData.almResponsible;
    _IBM_DIRECTORY     = DC ? DC.ibmDirectory()     : AppData.ibmDirectory;
  }

  _populate();   // initial population at module load

  /* ── Email resolver ───────────────────────────────────────── */
  function getEmail(name) {
    if (!name) return "";
    if (_TEAM_EMAILS[name]) return _TEAM_EMAILS[name];
    const low = name.toLowerCase();
    for (const [key, email] of Object.entries(_TEAM_EMAILS)) {
      const segments = key.toLowerCase().split(/[\s.(]+/).filter(s => s.length > 3);
      if (segments.some(s => low.includes(s))) return email;
    }
    return "";
  }

  /* ── refresh() — call after DynamicConfig.save() ────────── */
  function refresh() { _populate(); }

  /* ── Public API (getters keep values live after refresh) ─── */
  return {
    get TEAM_MEMBERS()      { return _TEAM_MEMBERS; },
    get TEAM_EMAILS()       { return _TEAM_EMAILS; },
    get EXPERTISE_CONNECT() { return _EXPERTISE_CONNECT; },
    get BD_ESCALATION()     { return _BD_ESCALATION; },
    get TEAM_LEAD()         { return _TEAM_LEAD; },
    get CUSTOMER_CONTACTS() { return _CUSTOMER_CONTACTS; },
    get ALM_RESPONSIBLE()   { return _ALM_RESPONSIBLE; },
    get IBM_DIRECTORY()     { return _IBM_DIRECTORY; },
    getEmail,
    refresh,
  };

})();

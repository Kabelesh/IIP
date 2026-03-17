/* ============================================================
   js/dashboards/info.js  —  Information & Resources
   IBM Case Intelligence Platform v7.0.2
   ============================================================
   Three-zone layout:
     TOP    — Escalation Overview (Severity Matrix + Quick Actions)
     MIDDLE — Case Preparation (Must Gather + Investigation Template
              | Links + Title Format)
     BOTTOM — Contacts & Responsibility Directory
   ============================================================ */
const DashInfo = (() => {
  // On file://, use sessionStorage to avoid the empty-namespace isolation issue.

  /* ── Loading state helper ─────────────────────────────────────
     Usage: _setLoading(true) before data fetch, _setLoading(false) after.
     Applies .is-loading class to the dashboard root element.
  ────────────────────────────────────────────────────────────── */
  function _setLoading(active) {
    const el = document.getElementById('content-area') || document.body;
    el.classList.toggle('dashboard-loading', active);
    // Show/hide skeleton shimmer on tables
    document.querySelectorAll('.table-wrap, .dash-table').forEach(t => {
      t.classList.toggle('skeleton-loading', active);
    });
  }


  const LS_KEY = "ibm_tracker_info_v1";

  /* ── Contact data — reads DynamicConfig first, falls back to Contacts ── */
  // Use functions so render() always gets the freshest data after Admin saves
  const _getCustomerContacts  = () => (typeof DynamicConfig !== "undefined" && DynamicConfig.customerContacts().length)
    ? DynamicConfig.customerContacts() : Contacts.CUSTOMER_CONTACTS;
  const _getAlmResponsible    = () => (typeof DynamicConfig !== "undefined" && DynamicConfig.almResponsible().length)
    ? DynamicConfig.almResponsible() : Contacts.ALM_RESPONSIBLE;
  // Keep these as simple refs — they are managed by Contacts.refresh()
  const EXPERTISE_CONNECT_CONTACTS = Contacts.EXPERTISE_CONNECT;
  const ESCALATION_BD_CONTACTS     = Contacts.BD_ESCALATION;
  const TEAM_LEAD_CONTACTS         = Contacts.TEAM_LEAD;
  const IBM_DIRECTORY              = Contacts.IBM_DIRECTORY;
  // Legacy alias used in the ALM builder below — evaluated at render time
  let CUSTOMER_CONTACTS = Contacts.CUSTOMER_CONTACTS;

  const MUST_GATHER_LINKS = [
    { label:"ISADC Logs",                    url:"https://www.ibm.com/mysupport/s/article/How-to-collect-IBM-Support-Assistant-Compressed-Archive-ISADC-or-Jazz-Team-Server-log-files" },
    { label:"Java Cores",                    url:"https://www.ibm.com/mysupport/s/article/Java-core-collection-for-IBM-Engineering-products" },
    { label:"Splunk Screenshots",            url:"https://www.ibm.com/docs/en/elm/7.0.3?topic=administering-monitoring" },
    { label:"Active Services Page",          url:"https://jazz.net/wiki/bin/view/Deployment/ActiveServicesDebugging" },
    { label:"Thread Dumps / Javacores",      url:"https://www.ibm.com/mysupport/s/article/Java-core-collection-for-IBM-Engineering-products" },
    { label:"GC Logs",                       url:"https://www.ibm.com/support/pages/garbage-collection-log-collection-ibm-engineering-products" },
    { label:"Export Framework Deadlock SQL", url:"https://jazz.net/wiki/bin/view/Main/ExportFrameworkDeadlock" },
    { label:"Large Export Blocking",         url:"https://www.ibm.com/support/pages/exporting-large-size-test-plan-pdf-file-blocks-all-other-pdf-export-jobs" },
    { label:"TRS Validation Wiki",           url:"https://jazz.net/wiki/bin/view/Deployment/TRSValidation" },
    { label:"IBM ELM Documentation",         url:"https://www.ibm.com/docs/en/elm/7.0.3" },
  ];

  function _getEmailForStaff(name) { return Contacts.getEmail(name); }

  const DEFAULT_DATA = {
    severity: [
      { level:1, color:"sev-1", title:"Severity 1 — Critical",    desc:"Critical business impact — system down or unusable" },
      { level:2, color:"sev-2", title:"Severity 2 — Significant", desc:"Significant business impact — major function impaired" },
      { level:3, color:"sev-3", title:"Severity 3 — Minor",       desc:"Minor business impact — non-critical issue" },
      { level:4, color:"sev-4", title:"Severity 4 — Minimal",     desc:"Minimal impact — general question or usage query" },
    ],
    escalation: [
      { level:1, color:"sev-1", title:"Sev 1", desc:"Immediate escalation — contact IBM within 1 hour" },
      { level:2, color:"sev-2", title:"Sev 2", desc:"Follow up within 4 business hours" },
      { level:3, color:"sev-3", title:"Sev 3", desc:"Update within 1 business day" },
      { level:4, color:"sev-4", title:"Sev 4", desc:"Update within 2 business days" },
    ],
    contacts: Contacts.EXPERTISE_CONNECT.map(c => ({ name:c.name, email:c.email })),
    links: [
      { label:"Customer ICN Tracking",         url:"https://rb-ubk-clm-01.de.bosch.com:9443/ccm/web/projects/CI%20NES%20Change%20Management" },
      { label:"IBM ALM Case Handling Wiki",     url:"#" },
      { label:"IBM Cases Handling — BGSW",     url:"#" },
      { label:"IBM Case Access Documentation",  url:"#" },
    ],
    mustGather: [],
    titleFormat: "ALM-06-P CCM — Issue description here",
    responsible: _getAlmResponsible().map(r => ({ ...r })),
  };

  /* ── Case Investigation Template ─────────────────────── */
  const INVESTIGATION_TEMPLATE =
`Issue Summary:
  [Brief description of the issue]

Environment Details:
  IBM ELM Version:
  Application Server:
  Operating System:
  Database:

Steps to Reproduce:
  1.
  2.
  3.

Logs Attached:
  [ ] ISADC Logs
  [ ] Java Cores / Thread Dumps
  [ ] GC Logs
  [ ] Splunk Screenshots
  [ ] Active Services Page

Customer Impact:
  Severity:
  Users Affected:
  Business Impact:
  Workaround Available:`;

  function loadData() {
    // If DynamicConfig has ALM data, always use it as the authority
    // (overrides whatever is in localStorage — Admin Portal is the single source)
    const dcAlm = _getAlmResponsible();
    const dcCC  = _getCustomerContacts();
    const dcHasData = dcAlm.length > 0;

    let data;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) data = JSON.parse(raw);
    } catch(e) {}

    if (!data) data = JSON.parse(JSON.stringify(DEFAULT_DATA));

    if (dcHasData) {
      // DynamicConfig is authoritative — overwrite responsible and customerContacts
      data.responsible = dcAlm.map(r => ({
        alm:        r.alm        || "",
        bd:         r.bd         || "",
        bdEmail:    r.bdEmail    || _getEmailForStaff(r.bd) || "",
        ibm:        r.ibm        || "",
        ibmEmail:   r.ibmEmail   || "",
        proxy:      r.proxy      || "",
        proxyEmail: r.proxyEmail || "",
      }));
      data.customerContacts = dcCC.map(r => ({
        line:   r.line   || r.alm || "",
        names:  r.names  || "",
        emails: r.emails || "",
      }));
      // Update CUSTOMER_CONTACTS local ref so the ALM builder finds them
      CUSTOMER_CONTACTS = data.customerContacts;
    } else {
      // No DynamicConfig — use localStorage or DEFAULT_DATA
      if (data.responsible) {
        data.responsible = data.responsible.map(r => {
          if (!r.bdEmail)    r.bdEmail    = _getEmailForStaff(r.bd)    || "";
          if (!r.ibmEmail)   r.ibmEmail   = _getEmailForStaff(r.ibm)   || "";
          if (!r.proxyEmail) r.proxyEmail = _getEmailForStaff(r.proxy) || "";
          return r;
        });
      }
    }

    return data;
  }

  function saveData(data) {
    // ALM responsible + customerContacts are owned exclusively by Admin ALM Line Assignments.
    // Never save them here — always re-read from DynamicConfig on next render.
    const toSave = { ...data };
    delete toSave.responsible;
    delete toSave.customerContacts;
    try { localStorage.setItem(LS_KEY, JSON.stringify(toSave)); } catch(e) {}
  }

  let _editMode     = false;
  let _escalateOpen = false;
  let _openAlmRows  = new Set();
  let _checkedItems = new Set();
  let _almSearch    = "";   // ALM Lines table search query

  /* ── Monochrome SVG icon set (same as platform-wide IC objects) ── */
  const IC = {
    warning:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    user:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    users:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    link:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
    folder:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
    file:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
    table:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    zap:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    mail:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    copy:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="14" height="14" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
    external: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    search:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
    edit:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    save:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    chevron:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    clock:    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    check:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    plus:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    close:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    phone:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.72A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.5A16 16 0 0016.5 17.09l.55-.55a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
    opencase: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>',
    wiki:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    tag:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    template: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  };

  const SEV_CFG = [
    { color:"var(--red)",         bg:"var(--red-bg)",       kpi:"kpi-red",    label:"Critical"    },
    { color:"var(--orange)",      bg:"var(--yellow-bg)",    kpi:"kpi-yellow", label:"Significant" },
    { color:"var(--ibm-blue-50)", bg:"var(--ibm-blue-10)",  kpi:"kpi-blue",   label:"Minor"       },
    { color:"var(--green)",       bg:"var(--green-bg)",     kpi:"kpi-green",  label:"Minimal"     },
  ];

  /* ── Clipboard + toast helpers ───────────────────────── */
  function _copy(text, label) {
    if (typeof V6 !== "undefined" && V6.copyToClipboard) {
      V6.copyToClipboard(text, label);
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        if (typeof V6 !== "undefined" && V6.toast) V6.toast("Copied", label || text, "success", 2200);
      });
    }
  }

  /* ═══════════════════════════════════════════════════════
     MAIN RENDER
  ═══════════════════════════════════════════════════════ */
  function render() {
    const el = document.getElementById("tab-info");
    if (!el) return;
    const data    = loadData();
    const isAdmin = Data.isAdmin();

    const _ecContacts = (data.contacts   && data.contacts.length)   ? data.contacts   : EXPERTISE_CONNECT_CONTACTS;
    const _tlContacts = (data.teamLead   && data.teamLead.length)   ? data.teamLead   : TEAM_LEAD_CONTACTS;
    const _bdContacts = (data.bdContacts && data.bdContacts.length) ? data.bdContacts : ESCALATION_BD_CONTACTS;
    const _mgLinks    = (data.mustGather && data.mustGather.length) ? data.mustGather : MUST_GATHER_LINKS;
    const _ibmDir     = (data.ibmDirectory && Object.keys(data.ibmDirectory).length)
                         ? data.ibmDirectory : IBM_DIRECTORY;

    el.innerHTML = `
      <!-- ══ PAGE HEADER — dark hero banner ══════════════ -->
      <div style="background:var(--sidebar-bg);border-radius:14px;padding:28px 28px 24px;margin-bottom:24px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-60px;right:-40px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(15,98,254,.15) 0%,transparent 70%);pointer-events:none"></div>
        <div style="position:absolute;bottom:-40px;left:60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(105,41,196,.1) 0%,transparent 70%);pointer-events:none"></div>
        <div style="position:relative;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px">
          <div class="row-10">
            <div style="width:38px;height:38px;border-radius:var(--radius-md);background:rgba(15,98,254,.25);border:1px solid rgba(15,98,254,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ibm-blue-30)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0;letter-spacing:-0.03em">Information &amp; Resources</h1>
              <p style="font-size:12px;color:rgba(255,255,255,.45);margin:2px 0 0;letter-spacing:0.01em">IBM Case Intelligence Platform · ALM BD/TOA-ETS5 · Case Operations Console</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding-top:4px">
            <button id="escalate-btn" class="btn btn-sm" >
              ${IC.zap} Escalate Case
            </button>
            ${isAdmin ? `<div class="d-flex gap-6">
              <button id="info-edit-btn" class="btn btn-sm ${_editMode ? "btn-success" : "btn-secondary"}">
                ${_editMode ? IC.save + " Save Changes" : IC.edit + " Edit Page"}
              </button>
              ${_editMode ? `<button id="info-cancel-btn" class="btn btn-ghost btn-sm">Cancel</button>` : ""}
              <button id="info-reset-btn" class="btn btn-danger btn-sm" title="Reset to defaults">${IC.close} Reset</button>
            </div>` : ""}
          </div>
        </div>
      </div>

      ${_editMode ? `<div class="notify-bar warn" class="mb-16">${IC.edit} <strong>Edit Mode</strong> — All fields are now editable. Click <strong>Save Changes</strong> when done.</div>` : ""}

      <!-- ══ ESCALATION MODAL ════════════════════════════ -->
      <div id="escalate-modal" style="display:${_escalateOpen ? "flex" : "none"};position:fixed;inset:0;z-index:var(--z-modal);
        background:rgba(9,30,66,.54);align-items:center;justify-content:center">
        <div style="background:var(--bg-ui);border-radius:var(--radius-md);padding:28px;max-width:500px;width:94%;
          box-shadow:0 20px 60px rgba(0,0,0,.3)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div class="row-10">
              <div style="width:32px;height:32px;background:var(--red-bg);border-radius:var(--radius-xs);
                display:flex;align-items:center;justify-content:center;color:var(--red)">${IC.zap}</div>
              <div>
                <div style="font-size:15px;font-weight:700;color:var(--text-primary)">Escalate Case</div>
                <div class="fs-12 c-tertiary">Select ALM line to generate escalation email</div>
              </div>
            </div>
            <button id="escalate-modal-close" style="background:none;border:none;font-size:20px;cursor:pointer;
              color:var(--text-tertiary);line-height:1;width:28px;height:28px;display:flex;align-items:center;
              justify-content:center;border-radius:var(--radius-xs)"
              onmouseover="this.style.background='var(--bg-layer)'" onmouseout="this.style.background='none'">&#215;</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-height:280px;overflow-y:auto">
            ${data.responsible.sort((a,b)=>a.alm.localeCompare(b.alm)).map(r => `
              <button class="esc-line-btn" data-alm="${Utils.escHtml(r.alm)}"
                style="padding:10px 4px;border:1.5px solid var(--border-subtle);border-radius:var(--radius-xs);font-weight:600;
                font-size:12px;cursor:pointer;background:var(--bg-ui);color:var(--ibm-blue-50);font-family:var(--font-mono)"
                onmouseover="this.style.background='var(--ibm-blue-10)';this.style.borderColor='var(--ibm-blue-50)'"
                onmouseout="this.style.background='var(--bg-ui)';this.style.borderColor='var(--border-subtle)'">
                ${Utils.escHtml(r.alm)}
              </button>`).join("")}
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:20px">

        ${_renderZone1(data)}
        ${_renderZone2(data, _mgLinks)}
        ${_renderZone3(data, _ecContacts, _tlContacts, _bdContacts, _ibmDir)}

        <!-- Developer Footer -->
        <div style="padding:16px 20px;background:var(--bg-layer);border:1px solid var(--border-subtle);
          border-radius:var(--radius-md);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:var(--radius-md);background:linear-gradient(135deg,#0f62fe,#6929c4);
              display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </div>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text-primary)">IBM Case Intelligence Platform
                <span style="font-family:var(--font-mono);color:var(--ibm-blue-50);font-size:11px">${(typeof AppVersion!=="undefined"?AppVersion.version:"v8.0.3")}</span></div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:1px">Developed by <strong class="c-secondary">Kabelesh K</strong> · BD/TOA-ETS5 Team</div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-disabled);text-align:right">
            Built with care for the ALM support team<br>
            <span class="c-blue">🔒 Internal use only</span>
          </div>
        </div>
      </div>
    `;

    _wireEvents(data, isAdmin);
  }

  /* ═══════════════════════════════════════════════════════
     ZONE 1 — Escalation Overview
     Severity KPI cards + Quick Actions
  ═══════════════════════════════════════════════════════ */
  function _renderZone1(data) {
    const em = _editMode;

    const sevCards = data.severity.map((s, i) => {
      const cfg = SEV_CFG[i] || SEV_CFG[0];
      const esc = data.escalation[i];
      return `<div class="kpi-card ${cfg.kpi}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:26px;height:26px;background:${cfg.bg};border-radius:var(--radius-xs);
            display:flex;align-items:center;justify-content:center;color:${cfg.color};flex-shrink:0">${IC.warning}</div>
          <span class="kpi-label" style="margin-bottom:0">SEV ${s.level} · ${cfg.label}</span>
        </div>
        ${em
          ? `<input class="form-input info-field" data-field="sev-desc-${i}" value="${Utils.escHtml(s.desc)}"
               style="height:26px;font-size:11px;width:100%;box-sizing:border-box;margin-bottom:4px"/>
             <input class="form-input info-field" data-field="esc-desc-${i}" value="${Utils.escHtml(esc ? esc.desc : "")}"
               style="height:26px;font-size:11px;width:100%;box-sizing:border-box"/>`
          : `<div style="font-size:12px;font-weight:600;color:var(--text-primary);line-height:1.4;margin-bottom:6px">${Utils.escHtml(s.desc)}</div>
             ${esc ? `<div style="background:${cfg.bg};border-radius:var(--radius-xs);padding:5px 8px;font-size:var(--font-size-xs);
               color:var(--text-secondary);display:flex;align-items:flex-start;gap:4px">
               <span style="color:${cfg.color};flex-shrink:0;margin-top:1px">${IC.clock}</span>
               <span>${Utils.escHtml(esc.desc)}</span></div>` : ""}`}
      </div>`;
    }).join("");

    const QUICK_ACTIONS = [
      { label:"Open IBM Case",          icon:IC.opencase, cls:"btn-primary",   href:"https://www.ibm.com/mysupport/s/createrecord/NewCase", target:"_blank" },
      { label:"Escalate Case",          icon:IC.zap,      cls:"btn-danger",    id:"qa-escalate" },
      { label:"Copy Case Title Format", icon:IC.copy,     cls:"btn-secondary", id:"qa-copy-title" },
      { label:"Case Handling Wiki",     icon:IC.wiki,     cls:"btn-secondary", href:"#", target:"_blank" },
      { label:"Customer ICN Tracking",  icon:IC.external, cls:"btn-secondary", href:"https://rb-ubk-clm-01.de.bosch.com:9443/ccm/web/projects/CI%20NES%20Change%20Management", target:"_blank" },
    ];

    const qaButtons = QUICK_ACTIONS.map(a =>
      a.href
        ? `<a href="${Utils.escHtml(a.href)}" target="${a.target||"_self"}" rel="noopener"
            class="btn ${a.cls} btn-sm" style="text-decoration:none">${a.icon} ${Utils.escHtml(a.label)}</a>`
        : `<button id="${a.id}" class="btn ${a.cls} btn-sm">${a.icon} ${Utils.escHtml(a.label)}</button>`
    ).join("");

    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:-8px">
        <span style="font-size:10px;font-weight:600;text-transform:none;letter-spacing:.1em;color:var(--text-tertiary)">Escalation Overview</span>
        <div style="flex:1;height:1px;background:var(--border-subtle)"></div>
      </div>

      <div class="kpi-row">${sevCards}</div>

      <div class="atl-card">
        <div class="atl-card-header" class="p-md">
          <div class="atl-card-title" class="fs-13">${IC.zap} Quick Actions</div>
          <span class="text-meta">Common operations at a glance</span>
        </div>
        <div style="padding:12px 16px;display:flex;flex-wrap:wrap;gap:8px">${qaButtons}</div>
      </div>`;
  }

  /* ═══════════════════════════════════════════════════════
     ZONE 2 — Case Preparation & Resources
  ═══════════════════════════════════════════════════════ */
  function _renderZone2(data, mgLinks) {
    const em = _editMode;
    const titleFormat = data.titleFormat || DEFAULT_DATA.titleFormat;

    const mgItems = mgLinks.map((l, li) => {
      if (em) {
        return `<div class="mg-item" style="display:flex;flex-direction:column;gap:4px;padding:6px 8px;
          background:var(--bg-layer);border:1px solid var(--ibm-blue-30);border-radius:var(--radius-sm)">
          <div class="row-4-mb3">
            <input class="form-input info-field" data-field="mg-label-${li}" value="${Utils.escHtml(l.label)}"
              style="height:24px;font-size:11px;font-weight:500;flex:1;box-sizing:border-box"/>
            <button class="mg-remove-btn" data-idx="${li}" style="background:var(--red-bg);border:none;border-radius:var(--radius-xs);
              cursor:pointer;color:var(--red);width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:13px">×</button>
          </div>
          <input class="form-input info-field" data-field="mg-url-${li}" value="${Utils.escHtml(l.url)}"
            style="height:24px;font-size:10px;width:100%;box-sizing:border-box;font-family:var(--font-mono)"/>
        </div>`;
      }
      return `<a href="${Utils.escHtml(l.url)}" target="_blank" rel="noopener"
        style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:var(--radius-sm);
        background:var(--bg-layer);border:1px solid var(--border-subtle);text-decoration:none;
        color:var(--text-primary);font-size:12px;font-weight:500;transition:all var(--t-fast);margin-bottom:2px"
        onmouseover="this.style.background='var(--ibm-blue-10)';this.style.borderColor='var(--ibm-blue-30)';this.style.color='var(--ibm-blue-50)'"
        onmouseout="this.style.background='var(--bg-layer)';this.style.borderColor='var(--border-subtle)';this.style.color='var(--text-primary)'">
        <span style="color:var(--ibm-blue-50);flex-shrink:0">${IC.folder}</span>
        <span class="flex-1">${Utils.escHtml(l.label)}</span>
        <span style="opacity:.4;flex-shrink:0">${IC.external}</span>
      </a>`;
    }).join("");

    const linkItems = data.links.map((l, li) => {
      if (em) {
        return `<div class="link-item" style="padding:6px 0;border-bottom:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:4px">
          <div class="row-4-mb3">
            <input class="form-input info-field" data-field="link-label-${li}" value="${Utils.escHtml(l.label)}"
              style="height:26px;font-size:12px;font-weight:500;flex:1;box-sizing:border-box"/>
            <button class="link-remove-btn" data-idx="${li}" style="background:var(--red-bg);border:none;border-radius:var(--radius-xs);
              cursor:pointer;color:var(--red);width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:14px">×</button>
          </div>
          <input class="form-input info-field" data-field="link-url-${li}" value="${Utils.escHtml(l.url)}"
            style="height:26px;font-size:10px;width:100%;box-sizing:border-box;font-family:var(--font-mono)"/>
        </div>`;
      }
      return `<a href="${Utils.escHtml(l.url)}" target="_blank" rel="noopener"
        style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--radius-sm);
        background:var(--bg-layer);border:1px solid var(--border-subtle);text-decoration:none;
        color:var(--text-primary);font-size:12px;font-weight:500;transition:all var(--t-fast);margin-bottom:4px"
        onmouseover="this.style.background='var(--ibm-blue-10)';this.style.borderColor='var(--ibm-blue-30)';this.style.color='var(--ibm-blue-50)'"
        onmouseout="this.style.background='var(--bg-layer)';this.style.borderColor='var(--border-subtle)';this.style.color='var(--text-primary)'">
        <span style="color:var(--ibm-blue-50);flex-shrink:0">${IC.link}</span>
        <span class="flex-1">${Utils.escHtml(l.label)}</span>
        <span style="opacity:.4;flex-shrink:0">${IC.external}</span>
      </a>`;
    }).join("");

    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:-8px">
        <span style="font-size:10px;font-weight:600;text-transform:none;letter-spacing:.1em;color:var(--text-tertiary)">Case Preparation &amp; Resources</span>
        <div style="flex:1;height:1px;background:var(--border-subtle)"></div>
      </div>

      <div class="grid-2" style="align-items:start">

        <!-- LEFT: Must Gather -->
        <div class="col-14">

          <div class="atl-card">
            <div class="atl-card-header" class="p-md">
              <div class="atl-card-title" class="fs-13">${IC.folder} Must Gather Checklist
                <span style="background:var(--bg-layer);color:var(--text-secondary);font-size:10px;font-weight:600;
                  padding:1px 7px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);margin-left:6px">${mgLinks.length}</span>
              </div>
              <button id="mg-copy-all-btn" class="btn btn-ghost btn-sm">${IC.copy} Copy List</button>
            </div>
            <div style="padding:10px 12px;${em ? "" : "max-height:340px;overflow-y:auto;scrollbar-width:thin"}">
              <div id="mg-list" style="display:flex;flex-direction:column;gap:4px">${mgItems}</div>
              ${em ? `<div class="mt-8"><button id="mg-add-btn" class="btn btn-success btn-sm">${IC.plus} Add Item</button></div>` : ""}
            </div>
            ${!em ? `<div style="padding:7px 12px;border-top:1px solid var(--border-subtle);background:var(--bg-layer)">
              <span class="text-meta">Click link to open docs</span>
            </div>` : ""}
          </div>

        </div>

        <!-- RIGHT: Links + Case Title Format -->
        <div class="col-14">

          <div class="atl-card">
            <div class="atl-card-header" class="p-md">
              <div class="atl-card-title" class="fs-13">${IC.link} Links &amp; Resources</div>
              ${em ? `<button id="link-add-btn" class="btn btn-success btn-sm">${IC.plus} Add Link</button>` : ""}
            </div>
            <div id="links-list" style="padding:10px 12px;${em ? "" : "max-height:260px;overflow-y:auto;scrollbar-width:thin"}">
              ${linkItems}
            </div>
          </div>

          <div class="atl-card">
            <div class="atl-card-header" class="p-md">
              <div class="atl-card-title" class="fs-13">${IC.tag} Case Title Format</div>
              <button id="title-copy-btn" class="btn btn-ghost btn-sm">${IC.copy} Copy Format</button>
            </div>
            <div style="padding:14px 16px">
              <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px">
                Standard format for IBM ELM case titles:
              </div>
              ${em
                ? `<input class="form-input info-field" id="info-title-format" data-field="title-format"
                    value="${Utils.escHtml(titleFormat)}"
                    style="width:100%;box-sizing:border-box;height:34px;font-family:var(--font-mono);font-size:12px"/>`
                : `<code style="display:block;background:var(--bg-layer);color:var(--grey);
                    padding:10px 14px;font-family:var(--font-mono);font-size:13px;font-weight:500;
                    border-radius:var(--radius-sm);border:1px solid var(--ibm-blue-20)">${Utils.escHtml(titleFormat)}</code>`}
              <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
                <span style="font-size:10px;background:var(--bg-layer-2);color:var(--text-secondary);
                  padding:2px 7px;border-radius:var(--radius-md);font-weight:600;font-family:var(--font-mono)">ALM-XX-P</span>
                <span class="fs-10 c-tertiary">Product identifier prefix</span>
                <span style="font-size:10px;background:var(--bg-layer-2);color:var(--text-secondary);
                  padding:2px 7px;border-radius:var(--radius-md);font-weight:600;font-family:var(--font-mono)">CCM</span>
                <span class="fs-10 c-tertiary">Application component</span>
              </div>
            </div>
          </div>

        </div>
      </div>`;
  }

  /* ═══════════════════════════════════════════════════════
     ZONE 3 — Contacts & Responsibility Directory
  ═══════════════════════════════════════════════════════ */
  function _renderZone3(data, ecContacts, tlContacts, bdContacts, ibmDirectory) {
    const em = _editMode;

    const mkPersonRow = (c, cls, bg, color) => {
      const initials = c.name.split(" ").filter(w=>w.length>0).map(w=>w[0].toUpperCase()).slice(0,2).join("");
      if (em) {
        return `<div class="${cls}-item" style="display:flex;gap:6px;align-items:center;padding:7px 12px;
          border-bottom:1px solid var(--border-subtle)">
          <div style="width:26px;height:26px;border-radius:50%;background:${bg};color:${color};
            display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;flex-shrink:0">${initials}</div>
          <input class="form-input info-field" data-field="${cls}-name-${c._idx}" value="${Utils.escHtml(c.name)}"
            style="flex:1;height:26px;font-size:11px;font-weight:600"/>
          <input class="form-input info-field" data-field="${cls}-email-${c._idx}" value="${Utils.escHtml(c.email)}"
            style="flex:2;height:26px;font-size:10px;font-family:var(--font-mono)"/>
          <button class="${cls}-remove-btn" data-idx="${c._idx}" style="background:var(--red-bg);border:none;border-radius:var(--radius-xs);
            cursor:pointer;color:var(--red);width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:14px">×</button>
        </div>`;
      }
      return `<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;
        border-bottom:1px solid var(--border-subtle);transition:background var(--t-fast)"
        onmouseover="this.style.background='var(--bg-layer)'" onmouseout="this.style.background=''">
        <span class="member-avatar" style="width:28px;height:28px;font-size:9px;flex-shrink:0">${initials}</span>
        <div class="flex-1-0">
          <div style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-primary)">${Utils.escHtml(c.name)}</div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:1px">
            <a href="mailto:${Utils.escHtml(c.email)}" style="font-size:10px;color:var(--ibm-blue-50);font-family:var(--font-mono);
              text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px"
              onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${Utils.escHtml(c.email)}</a>
            <button class="cp-email-btn" data-email="${Utils.escHtml(c.email)}" title="Copy email"
              style="background:none;border:none;cursor:pointer;color:var(--text-disabled);padding:0;
              display:inline-flex;flex-shrink:0;transition:color var(--t-fast)"
              onmouseover="this.style.color='var(--ibm-blue-50)'" onmouseout="this.style.color='var(--text-disabled)'">${IC.copy}</button>
          </div>
        </div>
        <a href="mailto:${Utils.escHtml(c.email)}" style="display:flex;align-items:center;justify-content:center;
          width:26px;height:26px;border-radius:var(--radius-xs);background:var(--bg-layer);
          border:1px solid var(--border-subtle);color:var(--text-secondary);text-decoration:none;flex-shrink:0;transition:all var(--t-fast)"
          onmouseover="this.style.background='var(--ibm-blue-10)';this.style.color='var(--ibm-blue-50)'"
          onmouseout="this.style.background='var(--bg-layer)';this.style.color='var(--text-secondary)'">${IC.mail}</a>
      </div>`;
    };

    const ec = ecContacts.map((c,i)=>({...c,_idx:i}));
    const tl = tlContacts.map((c,i)=>({...c,_idx:i}));
    const bd = bdContacts.map((c,i)=>({...c,_idx:i}));
    const ecRows = ec.map(c=>mkPersonRow(c,"ec","var(--ibm-blue-10)","var(--ibm-blue-60)")).join("");
    const tlRows = tl.map(c=>mkPersonRow(c,"tl","var(--yellow-bg)","var(--text-primary)")).join("");
    const bdRows = bd.map(c=>mkPersonRow(c,"bd","var(--purple-bg)","var(--purple)")).join("");

    const subHdr = (icon, label) =>
      `<div style="display:flex;align-items:center;gap:6px;padding:5px 12px 4px;
        background:var(--bg-layer);border-bottom:1px solid var(--border-subtle)">
        <span style="color:var(--text-secondary);display:flex;opacity:.7">${icon}</span>
        <span style="font-size:var(--font-size-2xs);font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-secondary)">${label}</span>
      </div>`;

    /* ── IBM Directory ── */
    const dirSections = Object.entries(ibmDirectory).map(([section, contacts]) => {
      const secKey = section.toLowerCase().replace(/\s+/g,"_");
      const rows = contacts.map((c, ci) => {
        const initials = c.name.split(" ").filter(w=>w.length>0).map(w=>w[0].toUpperCase()).slice(0,2).join("");
        const hue = (c.name.charCodeAt(0)*37+(c.name.charCodeAt(1)||0)*17)%360;
        if (em) {
          return `<div class="dir-item" data-section="${Utils.escHtml(secKey)}"
            style="display:flex;gap:8px;align-items:center;padding:7px 16px;border-bottom:1px solid var(--border-subtle)">
            <div style="width:28px;height:28px;border-radius:50%;background:hsl(${hue},55%,92%);color:hsl(${hue},45%,32%);
              display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;
              border:1.5px solid hsl(${hue},55%,82%)">${initials}</div>
            <input class="form-input dir-name-inp" data-field="dir-name-${secKey}-${ci}" value="${Utils.escHtml(c.name)}"
              style="flex:1;height:28px;font-size:12px;font-weight:600"/>
            <input class="form-input dir-email-inp" data-field="dir-email-${secKey}-${ci}" value="${Utils.escHtml(c.email)}"
              style="flex:2;height:28px;font-size:11px;font-family:var(--font-mono)"/>
            <button class="dir-remove-btn" style="background:var(--red-bg);border:none;border-radius:var(--radius-xs);
              cursor:pointer;color:var(--red);width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:15px">×</button>
          </div>`;
        }
        return `<div data-dir-name="${Utils.escHtml(c.name)}" data-dir-email="${Utils.escHtml(c.email)}"
          style="display:flex;align-items:center;gap:10px;padding:9px 20px;border-bottom:1px solid var(--border-subtle);transition:background var(--t-fast)"
          onmouseover="this.style.background='var(--bg-layer)'" onmouseout="this.style.background=''">
          <span class="member-avatar" style="width:30px;height:30px;font-size:11px;flex-shrink:0;
            background:hsl(${hue},50%,35%)">${initials}</span>
          <div class="flex-1-0">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${Utils.escHtml(c.name)}</div>
            <div style="display:flex;align-items:center;gap:4px;margin-top:1px">
              <a href="mailto:${Utils.escHtml(c.email)}" style="font-size:11px;color:var(--ibm-blue-50);font-family:var(--font-mono);
                text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${Utils.escHtml(c.email)}</a>
              <button class="cp-email-btn" data-email="${Utils.escHtml(c.email)}"
                style="background:none;border:none;cursor:pointer;color:var(--text-disabled);padding:0;
                display:inline-flex;flex-shrink:0;transition:color var(--t-fast)"
                onmouseover="this.style.color='var(--ibm-blue-50)'" onmouseout="this.style.color='var(--text-disabled)'">${IC.copy}</button>
            </div>
          </div>
          <a href="mailto:${Utils.escHtml(c.email)}" style="display:flex;align-items:center;justify-content:center;
            width:28px;height:28px;border-radius:var(--radius-xs);background:var(--bg-layer);
            border:1px solid var(--border-subtle);color:var(--text-secondary);text-decoration:none;flex-shrink:0;transition:all var(--t-fast)"
            onmouseover="this.style.background='var(--ibm-blue-10)';this.style.borderColor='var(--ibm-blue-50)';this.style.color='var(--ibm-blue-50)'"
            onmouseout="this.style.background='var(--bg-layer)';this.style.borderColor='var(--border-subtle)';this.style.color='var(--text-secondary)'">${IC.mail}</a>
        </div>`;
      }).join("");

      const addBtn = em ? `<div style="padding:5px 16px 7px;border-bottom:1px solid var(--border-subtle)">
        <button class="dir-add-btn btn btn-sm" data-section="${Utils.escHtml(secKey)}"
          class="btn btn-success btn-2xs">
          ${IC.plus} Add Contact to ${Utils.escHtml(section)}
        </button>
      </div>` : "";

      return `<div class="dir-section-wrap" data-section-key="${Utils.escHtml(secKey)}">
        <div style="display:flex;align-items:center;gap:8px;padding:7px 20px;background:var(--bg-layer);
          border-bottom:1px solid var(--border-subtle);position:sticky;top:0;z-index:1">
          <span style="color:var(--text-secondary);display:flex">${IC.users}</span>
          <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-secondary)">${Utils.escHtml(section)}</span>
          <span style="margin-left:auto;background:var(--border-subtle);color:var(--text-secondary);
            font-size:10px;font-weight:600;padding:1px 7px;border-radius:var(--radius-md)">${contacts.length}</span>
        </div>
        <div class="dir-section-rows" data-section="${Utils.escHtml(secKey)}">${rows}</div>
        ${addBtn}
      </div>`;
    }).join("");

    /* ── ALM accordion rows ── */
    const stripTeam = name => (name||"").replace(/\s*\((SWE6|ETS5)\)/g,"").trim();
    const mkPerson = (name, email) => {
      if (!name || name==="—") return `<span style="color:var(--text-disabled);font-size:11px">—</span>`;
      const dn = stripTeam(name);
      const initials = dn.split(" ").filter(w=>w.length>0).map(w=>w[0].toUpperCase()).slice(0,2).join("");
      const e = email || _getEmailForStaff(name);
      return `<div style="display:flex;align-items:center;gap:8px">
        <span class="member-avatar" style="width:24px;height:24px;font-size:9px;flex-shrink:0">${initials}</span>
        <div>
          <div style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-primary);line-height:1.2">${Utils.escHtml(dn)}</div>
          ${e ? `<div style="display:flex;align-items:center;gap:4px;margin-top:1px">
            <a href="mailto:${e}" style="font-size:10px;color:var(--ibm-blue-50);font-family:var(--font-mono);text-decoration:none"
              onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${e}</a>
            <button class="cp-email-btn" data-email="${Utils.escHtml(e)}"
              style="background:none;border:none;cursor:pointer;color:var(--text-disabled);padding:0;
              display:inline-flex;flex-shrink:0;transition:color var(--t-fast)"
              onmouseover="this.style.color='var(--ibm-blue-50)'" onmouseout="this.style.color='var(--text-disabled)'">${IC.copy}</button>
          </div>` : `<span class="fs-10-dim">no email</span>`}
        </div>
      </div>`;
    };

    const savedCC    = data.customerContacts || [];
    const sortedResp = [...data.responsible].sort((a,b)=>
      (parseInt((a.alm||"").replace(/\D+/g,""))||999)-(parseInt((b.alm||"").replace(/\D+/g,""))||999));
    const allALMs    = new Set([...CUSTOMER_CONTACTS.map(c=>c.line),...sortedResp.map(r=>r.alm)]);
    let   sortedALMs = [...allALMs].sort((a,b)=>
      (parseInt(a.replace(/\D+/g,""))||999)-(parseInt(b.replace(/\D+/g,""))||999));

    // Apply ALM search filter (matches ALM line, customer names, bd, ibm, proxy)
    if (_almSearch.trim()) {
      const _aq = _almSearch.trim().toLowerCase();
      sortedALMs = sortedALMs.filter(alm => {
        const resp = sortedResp.find(r => r.alm === alm);
        const cust = savedCC.find(c => c.line === alm)
                  || CUSTOMER_CONTACTS.find(c => c.line === alm) || {};
        return alm.toLowerCase().includes(_aq)
          || (cust.names  || "").toLowerCase().includes(_aq)
          || (resp && (resp.bd    || "").toLowerCase().includes(_aq))
          || (resp && (resp.ibm   || "").toLowerCase().includes(_aq))
          || (resp && (resp.proxy || "").toLowerCase().includes(_aq));
      });
    }

    // Build a DC lookup for email fallback — always fetch from Admin ALM Line Assignments
    const dcAlmLookup = {};
    try {
      if (typeof DynamicConfig !== "undefined" && DynamicConfig.almResponsible) {
        DynamicConfig.almResponsible().forEach(r => { if (r.alm) dcAlmLookup[r.alm] = r; });
      }
    } catch(e) {}

    const almRows = sortedALMs.map((alm, idx) => {
      const custBase = CUSTOMER_CONTACTS.find(c=>c.line===alm) || { line:alm, names:"—", emails:"" };
      const cust     = savedCC.find(c=>c.line===alm) || custBase;
      const resp     = sortedResp.find(r=>r.alm===alm);
      const dcResp   = dcAlmLookup[alm] || {};
      // Merge: prefer saved resp fields, fall back to DynamicConfig admin data for email fields
      const ibmEmail   = (resp && resp.ibmEmail)   || dcResp.ibmEmail   || "";
      const proxyEmail = (resp && resp.proxyEmail) || dcResp.proxyEmail || "";
      const detId    = "almdet-"+alm.replace("-","");
      const almKey   = alm.replace("-","").toLowerCase();
      const isOpen   = _openAlmRows.has(alm);
      const rowBg    = idx%2===0 ? "var(--bg-layer)" : "";
      const custCnt  = cust.emails ? cust.emails.split(";").filter(Boolean).length : 0;

      if (em) {
        // ── Edit mode: read-only display — ALM data owned by Admin ALM Line Assignments ──
        const ro = v => `<span style="font-size:11px;color:var(--text-primary);display:block;padding:1px 0;word-break:break-all">${Utils.escHtml(v||"—")}</span>`;
        const roMono = v => `<span style="font-size:var(--font-size-xs);font-family:var(--font-mono);color:var(--text-secondary);display:block;padding:1px 0;word-break:break-all">${Utils.escHtml(v||"—")}</span>`;
        return `<tr data-alm="${Utils.escHtml(alm)}" style="${rowBg ? `background:${rowBg}` : ""}">
          <td style="padding:6px 8px;white-space:nowrap">
            <span style="font-family:var(--font-mono);font-size:11px;font-weight:600;background:var(--ibm-blue-10);color:var(--ibm-blue-50);padding:2px 8px;border-radius:var(--radius-md);display:inline-block">${Utils.escHtml(alm)}</span>
          </td>
          <td class="p-sm">${ro(cust.names)}</td>
          <td class="p-sm">${roMono(cust.emails)}</td>
          <td class="p-sm">${ro(resp?.bd)}</td>
          <td class="p-sm">${roMono(resp?.bdEmail)}</td>
          <td class="p-sm">${ro(resp?.ibm)}</td>
          <td class="p-sm">${roMono(ibmEmail)}</td>
          <td class="p-sm">${ro(resp?.proxy)}</td>
          <td class="p-sm">${roMono(proxyEmail)}</td>
          <td style="padding:6px 8px;text-align:center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" stroke-width="2" stroke-linecap="round" title="Managed in Admin Portal">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </td>
        </tr>`;
      }
      // ── View mode: accordion row ──
      const emailLinks = cust.emails
        ? cust.emails.split(";").map(e=>e.trim()).filter(Boolean).map(e=>
            `<div style="display:flex;align-items:center;gap:4px;padding:2px 0">
              <a href="mailto:${e}" style="font-size:11px;color:var(--ibm-blue-50);font-family:var(--font-mono);text-decoration:none"
                onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${e}</a>
              <button class="cp-email-btn" data-email="${e}"
                style="background:none;border:none;cursor:pointer;color:var(--text-disabled);padding:0;display:inline-flex;flex-shrink:0;transition:color var(--t-fast)"
                onmouseover="this.style.color='var(--ibm-blue-50)'" onmouseout="this.style.color='var(--text-disabled)'">${IC.copy}</button>
            </div>`).join("")
        : `<span style="color:var(--text-disabled);font-size:11px">—</span>`;

      const viewBg = rowBg || "var(--bg-ui)";
      return `
        <div style="border-bottom:1px solid var(--border-subtle)">
          <button class="alm-toggle" data-alm="${Utils.escHtml(alm)}" data-target="${detId}"
            style="width:100%;display:flex;align-items:center;background:${viewBg};border:none;cursor:pointer;padding:0;text-align:left"
            onmouseover="this.style.background='var(--ibm-blue-10)'" onmouseout="this.style.background='${viewBg}'">
            <div style="width:88px;padding:10px 14px;flex-shrink:0">
              <span style="font-family:var(--font-mono);font-size:11px;font-weight:600;background:var(--ibm-blue-10);color:var(--ibm-blue-50);padding:2px 8px;border-radius:var(--radius-md);white-space:nowrap">${Utils.escHtml(alm)}</span>
            </div>
            <div style="flex:1;padding:10px 14px;font-size:12px;font-weight:500;color:var(--text-primary);text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${Utils.escHtml(cust.names||"—")}${custCnt>1?`<span style="font-size:10px;color:var(--text-disabled);font-weight:400;margin-left:6px">${custCnt} contacts</span>`:""}
            </div>
            <div style="width:155px;padding:10px 14px;font-size:12px;color:var(--text-secondary);flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${resp?Utils.escHtml(stripTeam(resp.bd||"—")):'<span class="c-disabled">—</span>'}
            </div>
            <div style="width:130px;padding:10px 14px;font-size:12px;color:var(--text-secondary);flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${resp?Utils.escHtml(stripTeam(resp.ibm||"—")):'<span class="c-disabled">—</span>'}
            </div>
            <div style="width:40px;padding:10px 12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--text-tertiary)">
              <span class="alm-chev" style="display:flex;transition:transform var(--transition-base);${isOpen?"transform:rotate(180deg)":""}">${IC.chevron}</span>
            </div>
          </button>
          <div id="${detId}" style="display:${isOpen?"":"none"};background:var(--ibm-blue-10);border-top:1px solid var(--border-subtle)">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr">
              <div style="padding:14px 16px;border-right:1px solid var(--border-subtle)">
                <div class="label-upper-mb8">Customer Contact</div>
                ${emailLinks}
              </div>
              <div style="padding:14px 16px;border-right:1px solid var(--border-subtle)">
                <div class="label-upper-mb8">Line Responsible</div>
                ${mkPerson(resp?resp.bd:"—",resp?(resp.bdEmail||""):"")}
              </div>
              <div style="padding:14px 16px;border-right:1px solid var(--border-subtle)">
                <div class="label-upper-mb8">Case Responsible</div>
                ${mkPerson(resp?resp.ibm:"—",resp?(resp.ibmEmail||_getEmailForStaff(resp.ibm||"")):"")}
              </div>
              <div style="padding:14px 16px">
                <div class="label-upper-mb8">Case Proxy</div>
                ${mkPerson(resp?resp.proxy:"—",resp?(resp.proxyEmail||_getEmailForStaff(resp.proxy||"")):"")}
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:-8px">
        <span style="font-size:10px;font-weight:600;text-transform:none;letter-spacing:.1em;color:var(--text-tertiary)">Contacts &amp; Responsibility Directory</span>
        <div style="flex:1;height:1px;background:var(--border-subtle)"></div>
      </div>

      <!-- Escalation Contacts — 3-column -->
      <div class="atl-card">
        <div class="atl-card-header" class="p-md">
          <div class="atl-card-title" class="fs-13">${IC.phone} Escalation Contacts</div>
        </div>
        <div class="grid-3" style="gap:0;align-items:start">
          <div style="border-right:1px solid var(--border-subtle)">
            ${subHdr(IC.user,"Expertise Connect")}
            <div id="ec-list">${ecRows}</div>
            ${em?`<div style="padding:5px 12px 7px"><button id="ec-add-btn" class="btn btn-success btn-xs" aria-label="Add escalation contact">+ Add</button></div>`:""}
          </div>
          <div style="border-right:1px solid var(--border-subtle)">
            ${subHdr(IC.users,"Team Lead")}
            <div id="tl-list">${tlRows}</div>
            ${em?`<div style="padding:5px 12px 7px"><button id="tl-add-btn" class="btn btn-success btn-xs" aria-label="Add timeline entry">+ Add</button></div>`:""}
          </div>
          <div>
            ${subHdr(IC.zap,"BD Escalation")}
            <div id="bd-list">${bdRows}</div>
            ${em?`<div style="padding:5px 12px 7px"><button id="bd-add-btn" class="btn btn-success btn-xs" aria-label="Add business details">+ Add</button></div>`:""}
          </div>
        </div>
      </div>

      <!-- IBM Contacts Directory -->
      <div class="atl-card">
        <div class="atl-card-header" class="p-md">
          <div class="atl-card-title" class="fs-13">${IC.users} IBM Contacts Directory</div>
          <div class="row-8">
            ${em?`<button id="dir-add-section-btn" class="btn btn-success btn-sm" class="fs-10">+ Section</button>`:""}
            <div class="form-input-group" style="width:200px">
              <span class="input-icon">${IC.search}</span>
              <input id="dir-search" type="text" placeholder="Search contacts…" class="search-input"
                style="width:100%;height:30px;font-size:var(--font-size-xs);box-sizing:border-box"/>
            </div>
          </div>
        </div>
        <div id="dir-list" style="overflow-y:auto;max-height:${em?"none":"380px"};scrollbar-width:thin">${dirSections}</div>
      </div>

      <!-- ALM Lines Table -->
      <div class="atl-card">
        <div class="atl-card-header" class="p-md">
          <div class="atl-card-title" style="font-size:13px;min-width:0">
            ${IC.table} ALM Lines — Customer Contact &amp; Responsible
            <span style="background:var(--bg-layer);color:var(--text-secondary);font-size:10px;font-weight:600;
              padding:1px 7px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);margin-left:6px">${sortedALMs.length} lines</span>
          </div>
          <button id="info-export-alm-csv" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;
            font-size:11px;font-weight:600;border-radius:var(--radius-xs);border:1px solid var(--border-subtle);
            background:var(--bg-layer);color:var(--text-primary);cursor:pointer;flex-shrink:0;white-space:nowrap"
            onmouseover="this.style.background='var(--ibm-blue-10)';this.style.borderColor='var(--ibm-blue-50)';this.style.color='var(--ibm-blue-50)'"
            onmouseout="this.style.background='var(--bg-layer)';this.style.borderColor='var(--border-subtle)';this.style.color='var(--text-primary)'">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Export CSV
          </button>
          <div class="form-input-group" style="flex-shrink:0;width:190px">
            <span class="input-icon">${IC.search}</span>
            <input id="alm-search" type="text" placeholder="Filter ALM lines…" class="search-input"
              style="width:100%;height:30px;font-size:var(--font-size-xs);box-sizing:border-box"
              value="${Utils.escHtml(_almSearch)}"/>
          </div>
          <span style="font-size:11px;color:var(--text-tertiary);flex-shrink:0">${em?"Editing — changes saved when you click Save":"Click row to expand"}</span>
        </div>
        ${em
          ? `<div style="overflow-x:auto;margin-top:2px">
              <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:1100px">
                <thead>
                  <tr style="background:var(--bg-layer-2);border-bottom:2px solid var(--border-subtle)">
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);white-space:nowrap">ALM Line</th>
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
                      Customer Names
                      <div class="label-sub-note mt-4">Shown in Customer column</div>
                    </th>
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
                      Customer Emails
                      <div class="label-sub-note mt-4">Semicolon-separated</div>
                    </th>
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
                      Line Responsible
                      <div class="label-sub-note mt-4">BD contact name</div>
                    </th>
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
                      Line Email
                      <div class="label-sub-note mt-4">BD contact email</div>
                    </th>
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
                      CASE Responsible
                      <div class="label-sub-note mt-4">IBM team member</div>
                    </th>
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
                      Case Responsible Email
                      <div class="label-sub-note mt-4">IBM team member email</div>
                    </th>
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
                      CASE Proxy
                      <div class="label-sub-note mt-4">IBM team member</div>
                    </th>
                    <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
                      Case Proxy Email
                      <div class="label-sub-note mt-4">IBM team member email</div>
                    </th>
                    <th style="width:36px"></th>
                  </tr>
                </thead>
                <tbody id="alm-rows-list">${almRows || `<tr><td colspan="10" style="padding:24px;text-align:center;color:var(--text-disabled);font-size:12px">No ALM lines match "${Utils.escHtml(_almSearch)}"</td></tr>`}</tbody>
              </table>
              <div style="padding:8px 12px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span class="text-meta">ALM data is managed in <strong>Admin Portal → ALM Line Assignments</strong>. Changes made there sync here automatically.</span>
              </div>
            </div>`
          : `<div>
              <div style="display:flex;background:var(--bg-layer);border-bottom:2px solid var(--border-subtle)">
                <div style="width:88px;padding:6px 14px;font-size:10.5px;font-weight:700;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-secondary);flex-shrink:0">Line</div>
                <div style="flex:1;padding:6px 14px;font-size:10.5px;font-weight:700;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-secondary)">Customer Contact</div>
                <div style="width:155px;padding:6px 14px;font-size:10.5px;font-weight:700;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-secondary);flex-shrink:0">Line Responsible</div>
                <div style="width:130px;padding:6px 14px;font-size:10.5px;font-weight:700;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-secondary);flex-shrink:0">Case Responsible</div>
                <div style="width:40px;flex-shrink:0"></div>
              </div>
              <div id="alm-rows-list">${almRows || `<div style="padding:24px;text-align:center;color:var(--text-disabled);font-size:12px">No ALM lines match "${Utils.escHtml(_almSearch)}"</div>`}</div>
            </div>`}
      </div>`;
  }

  /* ═══════════════════════════════════════════════════════
     EVENT WIRING
  ═══════════════════════════════════════════════════════ */
  function _wireEvents(data, isAdmin) {
    // ── Export ALM CSV — always available in both view and edit mode ──
    document.getElementById("info-export-alm-csv")?.addEventListener("click", () => {
      const src = _editMode ? _collectEditedData() : data;

      // Build DC lookup for email fallback (same as table renderer does)
      const dcLookup = {};
      try {
        if (typeof DynamicConfig !== "undefined" && DynamicConfig.almResponsible) {
          DynamicConfig.almResponsible().forEach(r => { if (r.alm) dcLookup[r.alm] = r; });
        }
      } catch(e) {}

      // Collect all ALM lines from all sources (same union as view table)
      const allLines = new Set([
        ...CUSTOMER_CONTACTS.map(c => c.line),
        ...(src.responsible || []).map(r => r.alm),
        ...Object.keys(dcLookup),
      ]);

      const headers = ["ALM Line","Customer Contact","Customer Email","Line Manager","Line Email","Case Responsible","Case Responsible Email","Case Proxy","Case Proxy Email"];
      const csvRows = [headers.join(",")];

      [...allLines]
        .sort((a,b) => (parseInt(a.replace(/\D+/g,""))||999) - (parseInt(b.replace(/\D+/g,""))||999))
        .forEach(alm => {
          const resp   = (src.responsible || []).find(r => r.alm === alm) || {};
          const dcR    = dcLookup[alm] || {};
          const cust   = (src.customerContacts||[]).find(c=>c.line===alm)
                      || CUSTOMER_CONTACTS.find(c=>c.line===alm) || {};
          const ibmEmail   = resp.ibmEmail   || dcR.ibmEmail   || "";
          const proxyEmail = resp.proxyEmail || dcR.proxyEmail || "";
          const q = v => `"${(v||"").replace(/"/g,'""')}"`;
          csvRows.push([
            q(alm), q(cust.names), q(cust.emails),
            q(resp.bd||dcR.bd), q(resp.bdEmail||dcR.bdEmail),
            q(resp.ibm||dcR.ibm), q(ibmEmail),
            q(resp.proxy||dcR.proxy), q(proxyEmail),
          ].join(","));
        });

      const blob = new Blob([csvRows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "alm-customer-contact-responsible.csv"; a.click();
      URL.revokeObjectURL(url);
    });
    document.getElementById("escalate-btn")?.addEventListener("click", ()=>{ _escalateOpen=true; render(); });
    document.getElementById("escalate-modal-close")?.addEventListener("click", ()=>{ _escalateOpen=false; render(); });
    document.getElementById("escalate-modal")?.addEventListener("click", e=>{ if(e.target.id==="escalate-modal"){_escalateOpen=false; render();} });
    document.querySelectorAll(".esc-line-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{ _escalateOpen=false; _sendEscalationEmail(btn.dataset.alm, data); });
    });

    document.getElementById("qa-escalate")?.addEventListener("click",()=>{ _escalateOpen=true; render(); });
    document.getElementById("qa-copy-title")?.addEventListener("click",()=>{
      _copy(data.titleFormat||DEFAULT_DATA.titleFormat, "Case Title Format");
    });
    document.getElementById("title-copy-btn")?.addEventListener("click",()=>{ _copy(data.titleFormat||DEFAULT_DATA.titleFormat,"Case Title Format"); });
    document.getElementById("mg-copy-all-btn")?.addEventListener("click",()=>{
      const mgLinks = (data.mustGather&&data.mustGather.length)?data.mustGather:MUST_GATHER_LINKS;
      _copy(mgLinks.map(l=>l.label).join("\n"), "Must Gather Checklist");
    });
    document.querySelectorAll(".cp-email-btn").forEach(btn=>{
      btn.addEventListener("click", e=>{ e.preventDefault(); e.stopPropagation(); _copy(btn.dataset.email, btn.dataset.email); });
    });
    document.getElementById("dir-search")?.addEventListener("input", function(){
      const q = this.value.toLowerCase().trim();
      document.querySelectorAll("[data-dir-name]").forEach(row=>{
        const txt=(row.dataset.dirName||"")+" "+(row.dataset.dirEmail||"");
        row.style.display=(!q||txt.toLowerCase().includes(q))?"":"none";
      });
      document.querySelectorAll(".dir-section-wrap").forEach(sec=>{
        const visible=[...sec.querySelectorAll("[data-dir-name]")].some(r=>r.style.display!=="none");
        sec.style.display=visible?"":"none";
      });
    });

    document.getElementById("alm-search")?.addEventListener("input", function(){
      _almSearch = this.value;
      // Re-render only the ALM rows list for performance
      const almRowsEl = document.getElementById("alm-rows-list");
      if (!almRowsEl) return;
      // Trigger a lightweight re-render of zone 3 only
      const zone3El = almRowsEl.closest(".atl-card");
      if (!zone3El) { render(); return; }
      // Full re-render is safest here since almRows depend on multiple derived vars
      render();
    });
    document.querySelectorAll(".alm-toggle").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const alm=btn.dataset.alm;
        const det=document.getElementById(btn.dataset.target);
        const chev=btn.querySelector(".alm-chev");
        if(!det) return;
        const isOpen=det.style.display!=="none";
        if(isOpen){ _openAlmRows.delete(alm); det.style.display="none"; if(chev) chev.style.transform="rotate(0deg)"; }
        else       { _openAlmRows.add(alm);    det.style.display="";    if(chev) chev.style.transform="rotate(180deg)"; }
      });
    });

    if (isAdmin) {
      document.getElementById("info-edit-btn")?.addEventListener("click",()=>{
        if(_editMode){ const s=_collectEditedData(); if(s){saveData(s);_editMode=false;render();} }
        else { _editMode=true; render(); }
      });
      document.getElementById("info-cancel-btn")?.addEventListener("click",()=>{ _editMode=false; render(); });
      document.getElementById("info-reset-btn")?.addEventListener("click",()=>{
        if(confirm("Reset all information to default values?")){
          try { localStorage.removeItem(LS_KEY); } catch(e) {}
          _editMode=false; render();
        }
      });
    }

    if (_editMode) {
      const mgList = document.getElementById("mg-list");
      document.querySelectorAll(".mg-remove-btn").forEach(b=>b.addEventListener("click",()=>b.closest(".mg-item").remove()));
      document.getElementById("mg-add-btn")?.addEventListener("click",()=>{
        const idx=mgList.querySelectorAll(".mg-item").length;
        const d=document.createElement("div"); d.className="mg-item";
        d.style.cssText="display:flex;flex-direction:column;gap:4px;padding:6px 8px;background:var(--bg-layer);border:1px solid var(--ibm-blue-30);border-radius:var(--radius-sm)";
        d.innerHTML=`<div class="row-4-mb3">
          <input class="form-input info-field" data-field="mg-label-${idx}" value="" placeholder="Label"
            style="height:24px;font-size:11px;font-weight:500;flex:1;box-sizing:border-box"/>
          <button class="mg-remove-btn" style="background:var(--red-bg);border:none;border-radius:var(--radius-xs);cursor:pointer;color:var(--red);width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:13px">×</button>
        </div>
        <input class="form-input info-field" data-field="mg-url-${idx}" value="" placeholder="URL"
          style="height:24px;font-size:10px;width:100%;box-sizing:border-box;font-family:var(--font-mono)"/>`;
        d.querySelector(".mg-remove-btn").addEventListener("click",()=>d.remove());
        mgList.appendChild(d);
      });

      const linksList=document.getElementById("links-list");
      document.querySelectorAll(".link-remove-btn").forEach(b=>b.addEventListener("click",()=>b.closest(".link-item").remove()));
      document.getElementById("link-add-btn")?.addEventListener("click",()=>{
        const idx=linksList.querySelectorAll(".link-item").length;
        const d=document.createElement("div"); d.className="link-item";
        d.style.cssText="padding:6px 0;border-bottom:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:4px";
        d.innerHTML=`<div class="row-4-mb3">
          <input class="form-input info-field" data-field="link-label-${idx}" value="" placeholder="Label"
            style="height:26px;font-size:12px;font-weight:500;flex:1;box-sizing:border-box"/>
          <button class="link-remove-btn" style="background:var(--red-bg);border:none;border-radius:var(--radius-xs);cursor:pointer;color:var(--red);width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:14px">×</button>
        </div>
        <input class="form-input info-field" data-field="link-url-${idx}" value="" placeholder="https://..."
          style="height:26px;font-size:10px;width:100%;box-sizing:border-box;font-family:var(--font-mono)"/>`;
        d.querySelector(".link-remove-btn").addEventListener("click",()=>d.remove());
        linksList.appendChild(d);
      });

      function _mkContactRow(prefix,idx,bg,color){
        const d=document.createElement("div"); d.className=prefix+"-item";
        d.style.cssText="display:flex;gap:6px;align-items:center;padding:7px 12px;border-bottom:1px solid var(--border-subtle)";
        d.innerHTML=`<div style="width:26px;height:26px;border-radius:50%;background:${bg};color:${color};
          display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;flex-shrink:0">?</div>
          <input class="form-input info-field" data-field="${prefix}-name-${idx}" value="" placeholder="Name"
            style="flex:1;height:26px;font-size:11px;font-weight:600"/>
          <input class="form-input info-field" data-field="${prefix}-email-${idx}" value="" placeholder="Email"
            style="flex:2;height:26px;font-size:10px;font-family:var(--font-mono)"/>
          <button class="${prefix}-remove-btn" style="background:var(--red-bg);border:none;border-radius:var(--radius-xs);cursor:pointer;color:var(--red);width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:14px">×</button>`;
        d.querySelector("."+prefix+"-remove-btn").addEventListener("click",()=>d.remove());
        d.querySelector("input").addEventListener("input",function(){
          const initials=this.value.trim().split(" ").filter(w=>w).map(w=>w[0].toUpperCase()).slice(0,2).join("")||"?";
          d.querySelector("div").textContent=initials;
        });
        return d;
      }
      const ecList=document.getElementById("ec-list");
      document.querySelectorAll(".ec-remove-btn").forEach(b=>b.addEventListener("click",()=>b.closest(".ec-item").remove()));
      document.getElementById("ec-add-btn")?.addEventListener("click",()=>{ ecList.appendChild(_mkContactRow("ec",ecList.querySelectorAll(".ec-item").length,"var(--ibm-blue-10)","var(--ibm-blue-60)")); });
      const tlList=document.getElementById("tl-list");
      document.querySelectorAll(".tl-remove-btn").forEach(b=>b.addEventListener("click",()=>b.closest(".tl-item").remove()));
      document.getElementById("tl-add-btn")?.addEventListener("click",()=>{ tlList.appendChild(_mkContactRow("tl",tlList.querySelectorAll(".tl-item").length,"var(--yellow-bg)","var(--text-primary)")); });
      const bdList=document.getElementById("bd-list");
      document.querySelectorAll(".bd-remove-btn").forEach(b=>b.addEventListener("click",()=>b.closest(".bd-item").remove()));
      document.getElementById("bd-add-btn")?.addEventListener("click",()=>{ bdList.appendChild(_mkContactRow("bd",bdList.querySelectorAll(".bd-item").length,"var(--purple-bg)","var(--purple)")); });

      // ALM rows are read-only in edit mode — data comes from Admin ALM Line Assignments only

      function _mkDirRow(secKey,idx){
        const d=document.createElement("div"); d.className="dir-item"; d.dataset.section=secKey;
        d.style.cssText="display:flex;gap:8px;align-items:center;padding:7px 16px;border-bottom:1px solid var(--border-subtle)";
        const hue=Math.floor(Math.random()*360);
        d.innerHTML=`<div style="width:28px;height:28px;border-radius:50%;background:hsl(${hue},55%,92%);color:hsl(${hue},45%,32%);
          display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;border:1.5px solid hsl(${hue},55%,82%)">?</div>
          <input class="form-input dir-name-inp" data-field="dir-name-${secKey}-${idx}" value="" placeholder="Name" style="flex:1;height:28px;font-size:12px;font-weight:600"/>
          <input class="form-input dir-email-inp" data-field="dir-email-${secKey}-${idx}" value="" placeholder="Email" style="flex:2;height:28px;font-size:11px;font-family:var(--font-mono)"/>
          <button class="dir-remove-btn" style="background:var(--red-bg);border:none;border-radius:var(--radius-xs);cursor:pointer;color:var(--red);width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:15px">×</button>`;
        d.querySelector("input").addEventListener("input",function(){
          const initials=this.value.trim().split(" ").filter(w=>w).map(w=>w[0].toUpperCase()).slice(0,2).join("")||"?";
          d.querySelector("div").textContent=initials;
        });
        d.querySelector(".dir-remove-btn").addEventListener("click",()=>d.remove());
        return d;
      }
      document.querySelectorAll(".dir-remove-btn").forEach(b=>b.addEventListener("click",()=>b.closest(".dir-item").remove()));
      document.querySelectorAll(".dir-add-btn").forEach(btn=>{
        btn.addEventListener("click",()=>{
          const secKey=btn.dataset.section;
          const secRows=document.querySelector(`.dir-section-rows[data-section="${secKey}"]`);
          if(secRows) secRows.appendChild(_mkDirRow(secKey,secRows.querySelectorAll(".dir-item").length));
        });
      });
      document.getElementById("dir-add-section-btn")?.addEventListener("click",()=>{
        const secName=prompt("Enter section name (e.g. IBM COLLEAGUES):"); if(!secName||!secName.trim()) return;
        const secKey=secName.trim().toLowerCase().replace(/\s+/g,"_");
        const dirList=document.getElementById("dir-list");
        const secWrap=document.createElement("div"); secWrap.className="dir-section-wrap"; secWrap.dataset.sectionKey=secKey;
        secWrap.innerHTML=`<div style="display:flex;align-items:center;gap:8px;padding:7px 20px;background:var(--bg-layer);border-bottom:1px solid var(--border-subtle);position:sticky;top:0;z-index:1">
          <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-secondary)">${Utils.escHtml(secName.trim().toUpperCase())}</span>
        </div>
        <div class="dir-section-rows" data-section="${Utils.escHtml(secKey)}"></div>
        <div style="padding:5px 16px 7px;border-bottom:1px solid var(--border-subtle)">
          <button class="dir-add-btn btn btn-sm" data-section="${Utils.escHtml(secKey)}"
            class="btn btn-success btn-2xs">
            + Add Contact to ${Utils.escHtml(secName.trim())}</button>
        </div>`;
        dirList.appendChild(secWrap);
        secWrap.querySelector(".dir-add-btn").addEventListener("click",()=>{
          const sRows=secWrap.querySelector(".dir-section-rows");
          sRows.appendChild(_mkDirRow(secKey,sRows.querySelectorAll(".dir-item").length));
        });
        secWrap.querySelector(".dir-section-rows").appendChild(_mkDirRow(secKey,0));
      });
    }
  }

  /* ═══════════════════════════════════════════════════════
     COLLECT EDITED DATA
  ═══════════════════════════════════════════════════════ */
  function _collectEditedData() {
    const data=JSON.parse(JSON.stringify(DEFAULT_DATA));
    const f=key=>document.querySelector(`[data-field="${key}"]`)?.value?.trim()??"";

    data.severity=data.severity.map((s,i)=>({...s,title:f(`sev-title-${i}`)||s.title,desc:f(`sev-desc-${i}`)||s.desc}));
    data.escalation=data.escalation.map((s,i)=>({...s,desc:f(`esc-desc-${i}`)||s.desc}));

    data.links=[];
    document.querySelectorAll(".link-item").forEach(row=>{
      const label=row.querySelector("[data-field^='link-label-']")?.value?.trim()||"";
      const url=row.querySelector("[data-field^='link-url-']")?.value?.trim()||"";
      if(label) data.links.push({label,url});
    });
    if(!data.links.length) data.links=DEFAULT_DATA.links;

    data.titleFormat=f("title-format")||data.titleFormat;

    data.mustGather=[];
    document.querySelectorAll(".mg-item").forEach(row=>{
      const label=row.querySelector("[data-field^='mg-label-']")?.value?.trim()||"";
      const url=row.querySelector("[data-field^='mg-url-']")?.value?.trim()||"";
      if(label) data.mustGather.push({label,url});
    });

    data.contacts=[];
    document.querySelectorAll(".ec-item").forEach(row=>{
      const name=row.querySelector("[data-field^='ec-name-']")?.value?.trim()||"";
      const email=row.querySelector("[data-field^='ec-email-']")?.value?.trim()||"";
      if(name) data.contacts.push({name,email});
    });
    if(!data.contacts.length) data.contacts=DEFAULT_DATA.contacts;

    data.teamLead=[];
    document.querySelectorAll(".tl-item").forEach(row=>{
      const name=row.querySelector("[data-field^='tl-name-']")?.value?.trim()||"";
      const email=row.querySelector("[data-field^='tl-email-']")?.value?.trim()||"";
      if(name) data.teamLead.push({name,email});
    });

    data.bdContacts=[];
    document.querySelectorAll(".bd-item").forEach(row=>{
      const name=row.querySelector("[data-field^='bd-name-']")?.value?.trim()||"";
      const email=row.querySelector("[data-field^='bd-email-']")?.value?.trim()||"";
      if(name) data.bdContacts.push({name,email});
    });

    data.responsible=[];data.customerContacts=[];
    // ALM data is owned exclusively by Admin ALM Line Assignments → DynamicConfig.
    // Always read directly from DC — never from DOM inputs (they are read-only in edit mode).
    const dcAlmForSave = _getAlmResponsible();
    const dcCCForSave  = _getCustomerContacts();
    data.responsible = dcAlmForSave.map(r => ({
      alm: r.alm||"", bd: r.bd||"", bdEmail: r.bdEmail||"",
      ibm: r.ibm||"", ibmEmail: r.ibmEmail||"",
      proxy: r.proxy||"", proxyEmail: r.proxyEmail||"",
    }));
    data.customerContacts = dcCCForSave.map(c => ({
      line: c.line||c.alm||"", names: c.names||"", emails: c.emails||"",
    }));

    data.ibmDirectory={};
    document.querySelectorAll(".dir-section-wrap").forEach(secWrap=>{
      const secKey=secWrap.dataset.sectionKey; if(!secKey) return;
      const titleEl=secWrap.querySelector("span[style*='text-transform']");
      const secLabel=titleEl?titleEl.textContent.trim():secKey.toUpperCase().replace(/_/g," ");
      const contacts=[];
      secWrap.querySelectorAll(".dir-item").forEach(row=>{
        const name=row.querySelector(".dir-name-inp")?.value?.trim()||"";
        const email=row.querySelector(".dir-email-inp")?.value?.trim()||"";
        if(name) contacts.push({name,email});
      });
      if(contacts.length) data.ibmDirectory[secLabel]=contacts;
    });
    return data;
  }

  /* ═══════════════════════════════════════════════════════
     ESCALATION EMAIL
  ═══════════════════════════════════════════════════════ */
  function _sendEscalationEmail(almLine, data) {
    const resp=data.responsible.find(r=>r.alm.toUpperCase()===almLine.toUpperCase());
    const custContact=CUSTOMER_CONTACTS.find(c=>c.line.toUpperCase()===almLine.toUpperCase());
    const ecContacts=(data.contacts&&data.contacts.length)?data.contacts:EXPERTISE_CONNECT_CONTACTS;
    const toEmails=ecContacts.map(c=>c.email).filter(Boolean).join(";");
    const tlContacts=(data.teamLead&&data.teamLead.length)?data.teamLead:TEAM_LEAD_CONTACTS;
    const bdContacts=(data.bdContacts&&data.bdContacts.length)?data.bdContacts:ESCALATION_BD_CONTACTS;
    const ccParts=[...tlContacts.map(c=>c.email),...bdContacts.map(c=>c.email)];
    if(resp){
      if(resp.bdEmail) ccParts.push(resp.bdEmail);
      const ie=resp.ibmEmail||_getEmailForStaff(resp.ibm); if(ie) ccParts.push(ie);
      const pe=resp.proxyEmail||_getEmailForStaff(resp.proxy); if(pe) ccParts.push(pe);
    }
    const cc=[...new Set(ccParts.filter(Boolean))].join(";");
    const _icn      = (typeof Data !== "undefined" && Data.customerAccountId) ? Data.customerAccountId() : "";
    const _dc2      = (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;
    const _teamName = (_dc2 && _dc2.appConfig) ? (_dc2.appConfig().teamName || "") : ((typeof Config !== "undefined" && Config.TEAM_NAME) ? Config.TEAM_NAME : "");
    const subject=encodeURIComponent(`[ESCALATION] IBM ELM ${almLine} — Expertise Connect`);
    const body=encodeURIComponent(
`Dear IBM Support Team,

We are escalating the following IBM ELM case for ${almLine} to Severity 1.

ALM Line:            ${almLine}
Customer:            ICN ${_icn} (Bosch ${_teamName})
Line Responsible:    ${resp?resp.bd:"—"}
Case Responsible:    ${resp?resp.ibm:"—"}
Case Proxy:          ${resp?resp.proxy:"—"}
Customer Contacts:   ${custContact?custContact.names:"—"}

BD Escalation:       ${bdContacts.map(c=>c.name).join("; ")}
Team Lead:           ${tlContacts.map(c=>c.name).join("; ")}

Please treat this as Severity 1 — immediate response required.

[Describe the issue, case number, and business impact here]

Best regards,
${_teamName} Team`);
    window.open(`mailto:${toEmails}?cc=${cc}&subject=${subject}&body=${body}`,"_blank");
  }

  // reload() — called by Admin Portal after ALM save to hot-refresh this dashboard
  function reload() {
    _editMode = false;
    render();
  }

  return { render, reload };
})();

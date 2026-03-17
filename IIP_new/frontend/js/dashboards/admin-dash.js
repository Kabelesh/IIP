/* ============================================================
   js/dashboards/admin-dash.js  —  Admin Console
   ============================================================ */
const DashAdmin = (() => {
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


  let _search        = "";
  let _historySearch = "";
  let _bulkSource    = "";
  let _bulkTarget    = "";
  let _adminDirty    = false; // F13: tracks unsaved admin changes
  let _xlsxImportRows = []; // Excel reassignment import rows — module scope so render() doesn't reset it
  let _bulkCaseFilter = "active"; // "all" | "active" | "closed"

  // F13: Show/hide orange dot on Admin nav item when unsaved changes exist
  function _setDirty(isDirty) {
    _adminDirty = isDirty;
    const navBtn = document.getElementById("nav-admin-portal");
    if (!navBtn) return;
    let dot = navBtn.querySelector(".admin-dirty-dot");
    if (isDirty) {
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "admin-dirty-dot";
        dot.style.cssText = "display:inline-block;width:7px;height:7px;background:var(--orange);border-radius:50%;margin-left:4px;vertical-align:middle";
        dot.title = "Unsaved admin changes";
        navBtn.appendChild(dot);
      }
    } else {
      dot?.remove();
    }
  }

  /* ── Single-colour SVG icon set ─────────────────────── */
  const IC = {
    tag:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    reassign:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>`,
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
    history:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    undo:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
    redo:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
    trash:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
    plus:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    upload: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    chevron:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    dot:    `<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="currentColor"/></svg>`,
    arrow:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    perf:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    check:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    select: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="4" height="4" rx="1"/><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="3" y="17" width="4" height="4" rx="1"/><line x1="10" y1="5" x2="21" y2="5"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="19" x2="21" y2="19"/></svg>`,
    shield:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    warn:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    save:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    link:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    download:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    pkg:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  };

  const DEFECT_BASE_URL = (typeof Config !== "undefined") ? Config.DEFECT_BASE_URL :
    "https://rb-ubk-clm-01.de.bosch.com:9443/ccm/web/projects/CI%20NES%20Change%20Management#action=com.ibm.team.workitem.viewWorkItem&id=";

  function adminWiLink(raw) {
    if (!raw) return "";
    const s = raw.trim();
    // URL with id= param
    const urlM = s.match(/[?&#]id=(\d+)/i);
    if (urlM) return _wiTag(urlM[1], "defect");
    // Task NNNNN
    const taskM = s.match(/^Task\s*(\d+)$/i);
    if (taskM) return _wiTag(taskM[1], "task");
    // Defect NNNNN
    const defM = s.match(/(?:Defect\s*|defect\s*)(\d+)/i);
    if (defM) return _wiTag(defM[1], "defect");
    // Plain number
    if (/^\d+$/.test(s)) return _wiTag(s, "defect");
    return `<span class="text-meta">${Utils.escHtml(s)}</span>`;
  }

  function _wiTag(id, type) {
    const isTask = type === "task";
    const bg     = isTask ? "var(--purple-bg)"    : "var(--ibm-blue-10)";
    const fg     = isTask ? "var(--purple)"        : "var(--ibm-blue-50)";
    const border = isTask ? "rgba(105,41,196,0.2)" : "rgba(15,98,254,0.2)";
    const label  = isTask ? `T.${id}` : `D.${id}`;
    const title  = isTask ? `Open Task ${id} in CCM` : `Open Defect ${id} in CCM`;
    return `<a href="${DEFECT_BASE_URL}${id}" target="_blank"
      style="font-size:10px;color:${fg};font-family:var(--font-mono);font-weight:600;text-decoration:none;
             background:${bg};padding:1px 5px;border-radius:var(--radius-xs);border:1px solid ${border}"
      title="${title}">${Utils.escHtml(label)}</a>`;
  }

  /* ── Toast ── */
  function showToast(msg, type) {
    type = type || "success";
    // F13: Clear dirty indicator on successful saves
    if (type === "success") _setDirty(false);
    let container = document.getElementById("atl-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "atl-toast-container";
      container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:var(--z-modal)9;display:flex;flex-direction:column;gap:8px;pointer-events:none";
      document.body.appendChild(container);
    }
    const palette = {
      success: { bg:"var(--green-bg)", color:"var(--green)", border:"rgba(25,128,56,.3)" },
      danger:  { bg:"var(--red-bg)",   color:"var(--red)",   border:"rgba(218,30,40,.3)" },
      warning: { bg:"var(--yellow-bg)",color:"var(--yellow)",border:"rgba(166,120,0,.3)" },
      info:    { bg:"var(--ibm-blue-10)",color:"var(--ibm-blue-50)",border:"rgba(15,98,254,.25)" },
    };
    const p = palette[type] || palette.info;
    const toast = document.createElement("div");
    toast.style.cssText = `display:flex;align-items:center;gap:10px;padding:11px 16px;
      background:${p.bg};color:${p.color};border:1px solid ${p.border};
      border-radius:var(--radius-md);box-shadow:var(--shadow-md);
      font-size:13px;font-weight:500;pointer-events:auto;max-width:340px;
      animation:atl-toast-in .22s ease;`;
    toast.innerHTML = `<span class="flex-1">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity="0"; toast.style.transition="opacity .3s"; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  /* F51: Persistent error banner for failed saves — stays until dismissed */
  function showSaveBanner(msg, retryFn) {
    const existingBanner = document.getElementById('admin-save-error-banner');
    if (existingBanner) existingBanner.remove();
    const banner = document.createElement('div');
    banner.id = 'admin-save-error-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:var(--z-modal)8;padding:10px 20px;background:var(--red);color:#fff;font-size:13px;font-weight:500;display:flex;align-items:center;gap:12px;box-shadow:0 2px 12px rgba(0,0,0,.3)';
    banner.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span class="flex-1">${msg}</span>
      ${retryFn ? `<button id="admin-banner-retry" aria-label="Retry connection" class="btn btn-overlay btn-sm">Retry</button>` : ''}
      <button id="admin-banner-dismiss" aria-label="Dismiss notification" class="btn-remove" style="background:transparent;color:#fff" title="Dismiss">×</button>
    `;
    document.body.appendChild(banner);
    document.getElementById('admin-banner-dismiss')?.addEventListener('click', () => banner.remove());
    if (retryFn) document.getElementById('admin-banner-retry')?.addEventListener('click', async () => { banner.remove(); await retryFn(); });
  }

  /* F51: Wraps DC.save — shows persistent red banner on failure */
  async function _dcSave(payload, retryFn) {
    const DC = (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;
    if (!DC) return;
    try {
      await DC.save(payload);
      /* Clear any lingering save error banner on success */
      document.getElementById('admin-save-error-banner')?.remove();
    } catch (err) {
      showSaveBanner(`⚠ Save failed — server unreachable. Your changes are stored locally but not synced. (${err.message || 'Network error'})`, retryFn);
      throw err; /* Re-throw so callers can opt-out of success toast */
    }
  }

  // ── Upload and restore app-data.js ─────────────────────────────────────────
  function _uploadAppDataJs(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;

        // Create a sandbox to execute the file and extract AppData
        let appDataObj = null;
        try {
          // Use Function constructor so the file's `const AppData` lives in its own scope
          const extractFn = new Function(`${content}\nreturn (typeof AppData !== "undefined") ? AppData : null;`);
          appDataObj = extractFn();
        } catch (evalErr) {
          // If eval fails, try JSON extraction fallback
          throw new Error(`Failed to parse file: ${evalErr.message}`);
        }

        if (!appDataObj || typeof appDataObj !== "object") {
          throw new Error("Invalid app-data.js format — could not extract AppData object");
        }

        const AD = (typeof AppData !== "undefined") ? AppData : null;
        if (!AD) {
          throw new Error("AppData not available in application");
        }

        // Restore configuration
        if (appDataObj.config && typeof appDataObj.config === "object") {
          Object.assign(AD.config, appDataObj.config);
          localStorage.setItem("admin-cfg", JSON.stringify(AD.config));
        }

        // Restore team members and emails
        if (appDataObj.teamMembers && Array.isArray(appDataObj.teamMembers)) {
          AD.teamMembers.length = 0;
          appDataObj.teamMembers.forEach(m => AD.teamMembers.push(m));
          localStorage.setItem("admin-members", JSON.stringify(AD.teamMembers));
        }

        if (appDataObj.teamEmails && typeof appDataObj.teamEmails === "object") {
          Object.keys(AD.teamEmails).forEach(k => delete AD.teamEmails[k]);
          Object.assign(AD.teamEmails, appDataObj.teamEmails);
          localStorage.setItem("admin-emails", JSON.stringify(AD.teamEmails));
        }

        // Restore expertise connect
        if (appDataObj.expertiseConnect && Array.isArray(appDataObj.expertiseConnect)) {
          AD.expertiseConnect.length = 0;
          appDataObj.expertiseConnect.forEach(m => AD.expertiseConnect.push(m));
          localStorage.setItem("admin-expertise", JSON.stringify(AD.expertiseConnect));
        }

        // Restore escalation contacts
        if (appDataObj.bdEscalation && Array.isArray(appDataObj.bdEscalation)) {
          AD.bdEscalation.length = 0;
          appDataObj.bdEscalation.forEach(m => AD.bdEscalation.push(m));
          localStorage.setItem("admin-escalation", JSON.stringify(AD.bdEscalation));
        }

        if (appDataObj.teamLead && Array.isArray(appDataObj.teamLead)) {
          AD.teamLead.length = 0;
          appDataObj.teamLead.forEach(m => AD.teamLead.push(m));
          localStorage.setItem("admin-lead", JSON.stringify(AD.teamLead));
        }

        // Restore customer contacts
        if (appDataObj.customerContacts && Array.isArray(appDataObj.customerContacts)) {
          AD.customerContacts.length = 0;
          appDataObj.customerContacts.forEach(c => AD.customerContacts.push(c));
          localStorage.setItem("admin-customers", JSON.stringify(AD.customerContacts));
        }

        // Restore ALM responsible
        if (appDataObj.almResponsible && Array.isArray(appDataObj.almResponsible)) {
          AD.almResponsible.length = 0;
          appDataObj.almResponsible.forEach(r => AD.almResponsible.push(r));
          localStorage.setItem("admin-alm", JSON.stringify(AD.almResponsible));
        }

        // Restore IBM directory
        if (appDataObj.ibmDirectory && typeof appDataObj.ibmDirectory === "object") {
          Object.keys(AD.ibmDirectory).forEach(k => delete AD.ibmDirectory[k]);
          Object.assign(AD.ibmDirectory, appDataObj.ibmDirectory);
          localStorage.setItem("admin-ibm-dir", JSON.stringify(AD.ibmDirectory));
        }

        // Restore performance case tags
        if (appDataObj.performanceCases && Array.isArray(appDataObj.performanceCases)) {
          localStorage.setItem("admin-perf-cases", JSON.stringify(appDataObj.performanceCases));
          if (typeof Data !== "undefined" && Data.setPerfCaseNums) {
            Data.setPerfCaseNums(appDataObj.performanceCases);
          }
        }

        if (appDataObj.nonPerformanceCases && Array.isArray(appDataObj.nonPerformanceCases)) {
          localStorage.setItem("admin-non-perf-cases", JSON.stringify(appDataObj.nonPerformanceCases));
          if (typeof Data !== "undefined" && Data.setNonPerfCaseNums) {
            Data.setNonPerfCaseNums(appDataObj.nonPerformanceCases);
          }
        }

        if (appDataObj.performanceMeta && typeof appDataObj.performanceMeta === "object") {
          localStorage.setItem("admin-perf-meta", JSON.stringify(appDataObj.performanceMeta));
          if (typeof Data !== "undefined" && Data.setPerformanceMeta) {
            // setPerformanceMeta(caseNum, patch) — must iterate, not pass whole map
            Object.entries(appDataObj.performanceMeta).forEach(([cn, meta]) => {
              Data.setPerformanceMeta(cn, meta);
            });
          }
        }

        // Restore Performance Dashboard case detail logs (wednesdayComments, caseInfo)
        if (appDataObj.performanceDashboardComments && typeof appDataObj.performanceDashboardComments === "object") {
          // Restore into live Data module so persistence flows through IIPStore
          if (typeof Data !== "undefined" && Data.setCaseDetailLog) {
            Object.entries(appDataObj.performanceDashboardComments).forEach(([cn, log]) => {
              Data.setCaseDetailLog(cn, log);
            });
          }
          // Also write to ibm_perf_comments_v1 for backward compatibility
          localStorage.setItem("ibm_perf_comments_v1", JSON.stringify(appDataObj.performanceDashboardComments));
        }

        // Restore audit & change history
        if (appDataObj.changeHistory && Array.isArray(appDataObj.changeHistory)) {
          localStorage.setItem("admin-change-history", JSON.stringify(appDataObj.changeHistory));
          if (typeof Data !== "undefined" && Data.restoreChangeHistory) {
            Data.restoreChangeHistory(appDataObj.changeHistory);
          }
        }

        // Restore all dashboard data (Weekly Tracker, Info, Knowledge Base, Safety Audit, etc.)
        if (appDataObj.allDashboardData && typeof appDataObj.allDashboardData === "object") {
          try {
            Object.entries(appDataObj.allDashboardData).forEach(([key, value]) => {
              if (key && value) {
                localStorage.setItem(key, value);
              }
            });
          } catch (e) {
            console.warn("Could not restore some dashboard data:", e);
          }
        }

        // Refresh dashboards
        if (typeof DashPerformance !== "undefined") DashPerformance.render();
        render();

        showToast("✓ app-data.js imported — all settings, dashboards, comments, and data restored!", "success");
      } catch (err) {
        showToast(`Import failed: ${err.message}`, "danger");
      }
    };
    reader.onerror = () => {
      showToast("Error reading file", "danger");
    };
    reader.readAsText(file);
  }

  // ── Generate and download an updated app-data.js ─────────────────────────
  function _downloadAppDataJs() {
    const DC = (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;
    const AD = (typeof AppData !== "undefined") ? AppData : null;
    if (!DC || !AD) { showToast("Cannot generate — app not fully loaded.", "error"); return; }

    const cfg      = DC.appConfig        ? DC.appConfig()        : AD.config;
    const members  = DC.teamMembers      ? DC.teamMembers()      : AD.teamMembers;
    const emails   = DC.teamEmails       ? DC.teamEmails()       : AD.teamEmails;
    const expConn  = DC.expertiseConnect ? DC.expertiseConnect() : AD.expertiseConnect;
    const bdEsc    = DC.bdEscalation    ? DC.bdEscalation()     : AD.bdEscalation;
    const tLead    = DC.teamLead        ? DC.teamLead()         : AD.teamLead;
    const custCont = DC.customerContacts? DC.customerContacts() : AD.customerContacts;
    const almResp  = DC.almResponsible  ? DC.almResponsible()   : AD.almResponsible;
    const ibmDir   = DC.ibmDirectory    ? DC.ibmDirectory()     : AD.ibmDirectory;

    const q = s => JSON.stringify(s == null ? "" : s);

    const membersLines = members.map(m => `    ${q(m)},`).join("\n");
    const emailLines   = Object.entries(emails).map(([k,v]) => `    ${q(k)}: ${q(v)},`).join("\n");
    const expLines     = expConn.map(c => `    { name: ${q(c.name)}, email: ${q(c.email)} },`).join("\n");
    const bdLines      = bdEsc.map(c => `    { name: ${q(c.name)}, email: ${q(c.email)} },`).join("\n");
    const leadLines    = tLead.map(c => `    { name: ${q(c.name)}, email: ${q(c.email)} },`).join("\n");
    const ccLines      = custCont.map(c =>
      `    { line: ${q(c.line)}, names: ${q(c.names)},\n      emails: ${q(c.emails||"")} },`
    ).join("\n\n");
    const almLines     = almResp.map(r =>
      `    { alm: ${q(r.alm)}, bd: ${q(r.bd||"")}, bdEmail: ${q(r.bdEmail||"")}, ibm: ${q(r.ibm||"")}, ibmEmail: ${q(r.ibmEmail||"")}, proxy: ${q(r.proxy||"")}, proxyEmail: ${q(r.proxyEmail||"")} },`
    ).join("\n");
    const ibmDirStr    = Object.entries(
      typeof ibmDir === "object" && !Array.isArray(ibmDir) ? ibmDir : {}
    ).map(([group, contacts]) => {
      const cl = (contacts||[]).map(c => `        { name: ${q(c.name)}, email: ${q(c.email||"")} },`).join("\n");
      return `    ${q(group)}: [\n${cl}\n    ],`;
    }).join("\n");

    // Export performance case tags and comments
    const perfCaseNums = Data.getPerfCaseNums ? Data.getPerfCaseNums() : [];
    const nonPerfCaseNums = Data.getNonPerfCaseNums ? Data.getNonPerfCaseNums() : [];
    const perfMeta = Data.performanceMeta ? Data.performanceMeta() : {};
    const perfMetaStr = Object.entries(perfMeta).map(([cn, meta]) => {
      const parts = [];
      if (meta.instance) parts.push(`instance: ${q(meta.instance)}`);
      if (meta.workItem) parts.push(`workItem: ${q(meta.workItem)}`);
      if (meta.category) parts.push(`category: ${q(meta.category)}`);
      if (meta.availability) parts.push(`availability: ${q(meta.availability)}`);
      return `    ${q(cn)}: { ${parts.join(", ")} },`;
    }).join("\n");

    // Get Performance Dashboard case detail logs (wednesdayComments, caseInfo, availability)
    // Primary source: live Data module which stores caseDetailLogs in ibm_tracker_persist_v1
    let perfDashboardComments = {};
    try {
      if (typeof Data !== "undefined" && Data.getCaseDetailLog) {
        const allCandidates = Data.performanceCandidates ? Data.performanceCandidates() : [];
        const allNums = new Set([
          ...perfCaseNums,
          ...nonPerfCaseNums,
          ...allCandidates.map(r => r["Case Number"]).filter(Boolean)
        ]);
        allNums.forEach(cn => {
          const log = Data.getCaseDetailLog(cn);
          if (log) perfDashboardComments[cn] = log;
        });
      }
      // Fallback: read directly from ibm_tracker_persist_v1 in localStorage
      if (!Object.keys(perfDashboardComments).length) {
        const raw = localStorage.getItem("ibm_tracker_persist_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.caseDetailLogs) perfDashboardComments = parsed.caseDetailLogs;
        }
      }
    } catch (e) {
      // localStorage or Data module might not be accessible
    }
    const perfCommentsStr = Object.entries(perfDashboardComments).map(([cn, log]) => {
      return `    ${q(cn)}: ${q(JSON.stringify(log))},`;
    }).join("\n");

    // Export audit & change history
    const changeHistory = Data.changeHistory ? Data.changeHistory() : [];
    const historyStr = changeHistory.map(ch => {
      const parts = [];
      parts.push(`id: ${q(ch.id)}`);
      parts.push(`caseNumber: ${q(ch.caseNumber)}`);
      parts.push(`field: ${q(ch.field)}`);
      parts.push(`oldValue: ${q(ch.oldValue)}`);
      parts.push(`newValue: ${q(ch.newValue)}`);
      parts.push(`updatedBy: ${q(ch.updatedBy)}`);
      parts.push(`timestamp: ${q(ch.timestamp)}`);
      return `    { ${parts.join(", ")} },`;
    }).join("\n");

    // Export all dashboard data (Weekly Tracker, Info, Knowledge Base, Safety Audit, etc.)
    const allDashboardData = {};
    const keysToBackup = [
      // Weekly Tracker
      "ibm_wtracker_comments_v1", "ibm_wtracker_history", "ibm_wtracker_linkmap_v1",
      "ibm_wtracker_seeded_v5",
      // Info Dashboard
      "ibm_tracker_info_v1",
      // Knowledge Base
      "ibm_knowledge_base_v2",
      // Safety Audit
      "ibm_safety_audit_v1",
      // Case data
      "ibm_cases_overrides_v1", "ibm_reopened_cases_v1",
      // Performance persistence (case detail logs, meta, owner overrides)
      "ibm_tracker_persist_v1",
      // Investigation archive (permanent case history)
      "ibm_investigate_archive_v1",
      // Team config
      "ibm_team_config_v1",
      // Import logs
      "ibm_import_log_v1"
    ];

    try {
      // Get prefixed keys (like ibm_wtracker_YYYY)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("ibm_wtracker_") || key.startsWith("ibm_cases_raw_"))) {
          const val = localStorage.getItem(key);
          if (val) allDashboardData[key] = val;
        }
      }
      // Get specific keys
      keysToBackup.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) allDashboardData[key] = val;
      });
    } catch (e) {
      // localStorage might not be accessible in all contexts
    }
    const allDashboardDataStr = Object.entries(allDashboardData).map(([k, v]) => {
      return `    ${q(k)}: ${q(v)},`;
    }).join("\n");

    const now = new Date().toISOString().slice(0,10);
    const js = `/* ================================================================
   js/data/app-data.js  —  IBM Case Intelligence Platform
   AUTO-GENERATED ${now} from Admin Portal. Replace frontend/js/data/app-data.js.
   ================================================================ */
const AppData = (() => {
  const config = {
    teamName:      ${q(cfg.teamName      || "BD/TOA-ETS5")},
    appTitle:      ${q(cfg.appTitle      || "IBM Cases")},
    appSubtitle:   ${q(cfg.appSubtitle   || "IBM Case Intelligence Platform")},
    defectBaseUrl: ${q(cfg.defectBaseUrl || "")},
    idleTimeoutMs:  30 * 60 * 1000,
    idleWarningMs:  27 * 60 * 1000,
    tablePageSize:  50,
    persistKeyTracker: "ibm_tracker_persist_v1",
    persistKeyKB:      "ibm_knowledge_base_v2",
    persistKeyCases:   "ibm_cases_raw_v1",
  };
  const teamMembers = [
${membersLines}
  ];
  const teamEmails = {
${emailLines}
  };
  const expertiseConnect = [
${expLines}
  ];
  const bdEscalation = [
${bdLines}
  ];
  const teamLead = [
${leadLines}
  ];
  const customerContacts = [
${ccLines}
  ];
  const almResponsible = [
${almLines}
  ];
  const ibmDirectory = {
${ibmDirStr}
  };
  const performanceCases = [
    ${perfCaseNums.map(cn => q(cn)).join(",\n    ")}
  ];
  const nonPerformanceCases = [
    ${nonPerfCaseNums.map(cn => q(cn)).join(",\n    ")}
  ];
  const performanceMeta = {
${perfMetaStr}
  };
  const performanceDashboardComments = {
${perfCommentsStr}
  };
  const changeHistory = [
${historyStr}
  ];
  const allDashboardData = {
${allDashboardDataStr}
  };
  return Object.freeze({ config, teamMembers, teamEmails, expertiseConnect, bdEscalation, teamLead, customerContacts, almResponsible, ibmDirectory, performanceCases, nonPerformanceCases, performanceMeta, performanceDashboardComments, changeHistory, allDashboardData });
})();
`;
    const blob = new Blob([js], { type: "text/javascript" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "app-data.js";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("\u2705 app-data.js downloaded with complete backup of all app data — settings, dashboards, comments, and audit trail.", "success");
  }

  // ── Generate and download updated weekly-tracker.js with all localStorage data baked in ──
  function _downloadTrackerSeedJs() {
    const STORE_PREFIX = "ibm_wtracker_";

    // Collect ALL tracker years from localStorage
    const allData = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORE_PREFIX) && /ibm_wtracker_\d{4}$/.test(key)) {
          const yr = key.replace(STORE_PREFIX, "");
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === "object") {
                // Clean each row: strip internal flags, keep useful fields only
                const cleaned = {};
                Object.entries(parsed).forEach(([wk, rows]) => {
                  if (!Array.isArray(rows) || !rows.length) return;
                  cleaned[wk] = rows.map(r => {
                    const out = {};
                    ["id","caseNumber","owner","title","customerNumber","product",
                     "severity","status","age","closedDate","comments","category",
                     "created","solutionDate","country","availability"].forEach(f => {
                      if (r[f] !== undefined && r[f] !== null) out[f] = r[f];
                    });
                    return out;
                  }).filter(r => r.caseNumber); // skip rows with no case number
                });
                if (Object.keys(cleaned).length) allData[yr] = cleaned;
              }
            }
          } catch(e) {}
        }
      }
    } catch(e) {
      showToast("Could not read tracker data from localStorage.", "error");
      return;
    }

    if (!Object.keys(allData).length) {
      showToast("No Weekly Tracker data found in localStorage to export.", "warning");
      return;
    }

    // Count total entries
    let totalRows = 0;
    Object.values(allData).forEach(yr => Object.values(yr).forEach(wk => totalRows += wk.length));

    // Read current weekly-tracker.js header and everything after the seed
    // We only need to replace the _WT_SEED constant and bump SEEDED_KEY version
    const now  = new Date().toISOString().slice(0, 10);
    const seedVersion = "v_" + now.replace(/-/g, "");  // e.g. v_20260315

    // Generate the new seed JSON — compact but readable per year
    const seedLines = Object.entries(allData)
      .sort(([a],[b]) => parseInt(a)-parseInt(b))
      .map(([yr, weeks]) => "  " + JSON.stringify(yr) + ": " + JSON.stringify(weeks))
      .join(",\n");

    const seedBlock = "const _WT_SEED = {\n" + seedLines + "\n};";

    // We need to replace two things in weekly-tracker.js:
    // 1. The _WT_SEED block
    // 2. The SEEDED_KEY string (to force re-seed on fresh deploys)
    // Since we can't read the current file from JS, we generate a patcher script
    // instead — a tiny Node.js script the user runs once to patch weekly-tracker.js

    const patcherScript = `#!/usr/bin/env node
// =============================================================
// IIP Weekly Tracker Seed Patcher — AUTO-GENERATED ${now}
// Run this ONCE after downloading:
//   node patch-tracker-seed.js
// Then deploy the updated weekly-tracker.js to your server.
// =============================================================
const fs   = require("fs");
const path = require("path");

const TRACKER_FILE = path.join(__dirname, "frontend", "js", "dashboards", "weekly-tracker.js");

if (!fs.existsSync(TRACKER_FILE)) {
  console.error("ERROR: Could not find", TRACKER_FILE);
  console.error("Make sure you run this script from the IIP project root folder.");
  process.exit(1);
}

let code = fs.readFileSync(TRACKER_FILE, "utf8");

// 1. Replace _WT_SEED block
const seedStart = code.indexOf("const _WT_SEED = {");
const seedEnd   = code.indexOf("\n};\n", seedStart) + 4;
if (seedStart === -1 || seedEnd < seedStart) {
  console.error("ERROR: Could not locate _WT_SEED in weekly-tracker.js");
  process.exit(1);
}

const newSeed = ${JSON.stringify(seedBlock)};
code = code.slice(0, seedStart) + newSeed + code.slice(seedEnd);

// 2. Bump SEEDED_KEY so fresh deploys always re-seed from the new data
code = code.replace(/const SEEDED_KEY\s*=\s*"[^"]+";/, 'const SEEDED_KEY    = "ibm_wtracker_seeded_${seedVersion}";');

fs.writeFileSync(TRACKER_FILE, code, "utf8");
console.log("✅ weekly-tracker.js updated successfully!");
console.log("   Seed data: ${Object.keys(allData).join(", ")} (${totalRows} total entries)");
console.log("   SEEDED_KEY bumped to: ibm_wtracker_seeded_${seedVersion}");
console.log("\nYou can now deploy the updated frontend/ folder to your server.");
`;

    // Download the patcher script
    const blob = new Blob([patcherScript], { type: "text/javascript" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "patch-tracker-seed.js";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(
      `✅ patch-tracker-seed.js downloaded — run it once with Node.js to bake ${totalRows} tracker entries into weekly-tracker.js.`,
      "success"
    );
  }

  /* ── KPI card ── */
  function kpiCard(label, value, cls) {
    return `<div class="kpi-card ${cls}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
    </div>`;
  }

  /* ── Card wrapper ── */
  function card(titleIcon, title, badge, bodyHtml) {
    const badgeHtml = badge !== undefined
      ? `<span style="background:var(--bg-layer-2);color:var(--text-secondary);font-size:11px;font-weight:600;padding:1px 8px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);margin-left:6px">${badge}</span>`
      : "";
    return `<div class="tile" class="mb-16">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border-subtle)">
        <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--text-primary)">
          <span class="c-blue">${titleIcon}</span>${title}${badgeHtml}
        </div>
      </div>
      ${bodyHtml}
    </div>`;
  }

  /* ── Main render ── */
  function render() {
    const el = document.getElementById("tab-admin");
    if (!el) return;

    const all      = Data.allCases();
    const changes  = Data.changeHistory();
    const perfNums = Data.getPerfCaseNums();
    const npNums   = Data.getNonPerfCaseNums();
    const undoLeft = Data.undoStackSize();
    const redoLeft = Data.redoStackSize();

    const memberOpts = Data.teamMembers().slice().sort().map(m =>
      `<option value="${Utils.escHtml(m)}">${Utils.escHtml(Utils.shortName(m))}</option>`
    ).join("");

    // Get pending KB review count
    const allKB = typeof Knowledge !== "undefined" ? Knowledge.all() : [];
    const pendingReview = allKB.filter(e => e.status === "review").length;
    // Compute top creator/closer for status bar (fix #5)
    const teamCases = Data.teamCases();
    const memberStats = {};
    teamCases.forEach(r => {
      const o = r.Owner || "Unknown";
      if (!memberStats[o]) memberStats[o] = { created: 0, closed: 0, name: Utils.shortName(o) };
      memberStats[o].created++;
      if (Utils.isClosed(r.Status)) memberStats[o].closed++;
    });
    const sortedCreated = Object.values(memberStats).sort((a,b) => b.created - a.created);
    const sortedClosed  = Object.values(memberStats).sort((a,b) => b.closed  - a.closed);
    const topCreator = sortedCreated[0];
    const topCloser  = sortedClosed[0];

    // Update RFE count and status if dashboard is loaded
    const _updateRFECount = () => {
      try {
        const rfeData = (typeof DashRFETracking !== "undefined" && DashRFETracking.loadRFEData)
          ? DashRFETracking.loadRFEData()
          : JSON.parse(localStorage.getItem("ibm_rfe_tracking_v1") || "[]");

        // Get last update time
        const lastUpdateKey = "ibm_rfe_tracking_last_update";
        const lastUpdate = localStorage.getItem(lastUpdateKey);

        setTimeout(() => {
          const countEl = document.getElementById("rfe-total-count");
          if (countEl) countEl.textContent = rfeData.length;

          const dateEl = document.getElementById("rfe-last-updated");
          if (dateEl && lastUpdate) {
            try {
              const date = new Date(parseInt(lastUpdate));
              const formatted = date.toLocaleString();
              dateEl.textContent = `Last updated: ${formatted}`;
            } catch(e) {}
          }
        }, 100);
      } catch(e) {}
    };

    el.innerHTML = `
      <!-- ═══ ADMIN PORTAL HEADER ═══ -->
      <div style="background:var(--sidebar-bg);border-radius:14px;padding:22px 24px;margin-bottom:20px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-30px;right:-20px;width:180px;height:180px;border-radius:50%;background:rgba(15,98,254,.08);pointer-events:none"></div>
        <div style="position:absolute;bottom:-40px;right:80px;width:120px;height:120px;border-radius:50%;background:rgba(105,41,196,.06);pointer-events:none"></div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px;position:relative">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:44px;height:44px;border-radius:var(--radius-md);background:rgba(15,98,254,.25);border:1px solid rgba(15,98,254,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ibm-blue-30)" stroke-width="1.8" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div style="font-size:18px;font-weight:700;color:#fff;letter-spacing:var(--tracking-tight);line-height:1.2">Admin Console</div>
              <div style="font-size:12px;color:rgba(255,255,255,.45);margin-top:2px">Performance tagging · Owner management · Audit history · Safety Guard</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button id="undo-btn" class="btn btn-overlay btn-sm" ${undoLeft === 0 ? "disabled" : ""}>
              ${IC.undo} Undo${undoLeft > 0 ? ` (${undoLeft})` : ""}
            </button>
            <button id="redo-btn" class="btn btn-overlay btn-sm" ${redoLeft === 0 ? "disabled" : ""}>
              ${IC.redo} Redo${redoLeft > 0 ? ` (${redoLeft})` : ""}
            </button>
            <button id="download-admin-data-btn" class="btn btn-overlay btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download
            </button>
            <button id="import-admin-data-btn" class="btn btn-overlay btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Import
            </button>
            <input type="file" id="import-admin-data-input" style="display:none" accept=".js,.txt" />
            <button id="clear-saved-btn" class="btn btn-danger btn-sm">
              ${IC.trash} Clear Data
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ CHANGE PASSWORD PANEL (hidden) ═══ -->
      <div id="admin-pwd-form" style="display:none;margin-bottom:16px">
        <div class="tile" style="padding:18px 20px;border-left:3px solid var(--ibm-blue-50)">
          <div style="font-size:13px;font-weight:700;color:var(--ibm-blue-50);margin-bottom:14px;display:flex;align-items:center;gap:8px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Change Admin Password
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
            <div>
              <label class="filter-label" class="mb-5">Current Password</label>
              <input type="password" id="admin-cur-pwd" class="form-input" placeholder="Your current password" class="min-200" autocomplete="current-password"/>
            </div>
            <div>
              <label class="filter-label" class="mb-5">New Password</label>
              <input type="password" id="admin-new-pwd" class="form-input" placeholder="Minimum 8 characters" class="min-200" autocomplete="new-password"/>
            </div>
            <div>
              <label class="filter-label" class="mb-5">Confirm Password</label>
              <input type="password" id="admin-confirm-pwd" class="form-input" placeholder="Re-enter to confirm" class="min-200" autocomplete="new-password"/>
            </div>
            <div class="d-flex gap-8">
              <button id="admin-save-pwd-btn" class="btn btn-primary btn-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Save Password
              </button>
              <button id="admin-cancel-pwd-btn" class="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
          <div id="admin-pwd-msg" style="margin-top:10px;font-size:var(--font-size-sm);font-weight:600;display:none"></div>
        </div>
      </div>

      <!-- ═══ KB REVIEW ALERT ═══ -->
      ${pendingReview > 0 ? `
      <div style="margin-bottom:16px;padding:12px 16px;background:var(--yellow-bg);border:1px solid rgba(166,120,0,.25);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:13px;color:var(--yellow);font-weight:600">
          📋 <strong>${pendingReview}</strong> Knowledge Hub ${pendingReview === 1 ? "article" : "articles"} pending review
        </div>
        <button class="btn btn-warning btn-sm"
          onclick="document.querySelector('[data-tab=knowledge-hub]')?.click()">
          Review Now →
        </button>
      </div>` : ""}

      ${undoLeft > 0 ? `
      <div class="notify-bar warn" class="mb-16">
        ${IC.history} Last change: <strong>${Utils.escHtml(changes[0]?.field || "—")}</strong>
        on case <strong class="text-mono">${Utils.escHtml(changes[0]?.caseNumber || "—")}</strong>
      </div>` : ""}

      <!-- ═══ KPI ROW — v6 aligned ═══ -->
      <div class="kpi-row" class="mb-20">
        <div class="kpi-card kpi-blue">
          <div class="kpi-label">Total Cases</div>
          <div class="kpi-value">${all.length}</div>
          <div class="text-meta-top">All loaded cases</div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-label">Performance</div>
          <div class="kpi-value">${perfNums.length}</div>
          <div class="text-meta-top">Tagged cases</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-label">Non-Performance</div>
          <div class="kpi-value">${npNums.length}</div>
          <div class="text-meta-top">Tagged cases</div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-label">Audit Entries</div>
          <div class="kpi-value">${changes.length}</div>
          <div class="text-meta-top">Change log</div>
        </div>
        <div class="kpi-card" style="border-left:3px solid var(--ibm-blue-50)">
          <div class="kpi-label">Safety Guard</div>
          <div class="kpi-value" class="c-blue">${(typeof SafetyGuard!=="undefined"?SafetyGuard.auditLog().length:0)}</div>
          <div class="text-meta-top">Guarded operations</div>
        </div>
      </div>

      <!-- ═══ HEALTH CHECK PANEL (REC-16) ═══ -->
      <div id="admin-health-panel" style="margin-bottom:16px;padding:12px 16px;background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-md);display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--text-secondary)">
        <div style="display:flex;align-items:center;gap:4px;font-weight:600;color:var(--text-primary)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          System Health
        </div>
        <div class="row-6" title="Admin identity for this session">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ibm-blue-50)" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0113 0"/></svg>
          Session: <strong class="c-primary">${(typeof Admin !== "undefined" && Admin.getActor) ? Admin.getActor() : "Admin"}</strong>
          <span style="font-size:10px;padding:1px 6px;border-radius:var(--radius-md);background:${(typeof Admin !== "undefined" && Admin.getRole && Admin.getRole() === "read") ? "rgba(245,166,35,.15)" : "rgba(25,128,56,.12)"};color:${(typeof Admin !== "undefined" && Admin.getRole && Admin.getRole() === "read") ? "var(--yellow)" : "var(--green)"}">
            ${(typeof Admin !== "undefined" && Admin.getRole) ? Admin.getRole() : "write"}
          </span>
        </div>
        <div class="row-6" title="Cases loaded from last Excel upload">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Cases loaded: <strong class="c-primary">${all.length.toLocaleString()}</strong>
        </div>
        <div class="row-6" title="Undo steps available">
          ${IC.undo} Undo stack: <strong class="c-primary">${Data.undoStackSize()}</strong>
        </div>
        <div id="admin-health-server" class="row-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/></svg>
          Server: <span id="admin-health-server-status" class="c-tertiary">checking…</span>
        </div>
        <div id="admin-health-config" class="row-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M22 12h-2M19.07 19.07l-1.41-1.41M12 22v-2M4.93 19.07l1.41-1.41M2 12h2M4.93 4.93l1.41 1.41"/></svg>
          Config: <span id="admin-health-config-status" class="c-tertiary">checking…</span>
        </div>
      </div>

      <!-- ═══ PERFORMANCE TAGGING ═══ -->
      ${card(IC.tag, "Performance Case Tagging", undefined, `
        <div style="display:flex;gap:6px;margin-bottom:16px">
          <button id="perf-tab-perf" class="btn btn-danger-filled btn-sm" data-type="perf">
            ${IC.perf} Performance
          </button>
          <button id="perf-tab-nonperf" class="btn btn-ghost btn-sm" data-type="nonperf">
            ${IC.check} Non-Performance
          </button>
        </div>

        <!-- Single add -->
        <div class="mb-20">
          <div class="filter-label" class="mb-10">Add Single Case</div>
          <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
            <div>
              <label class="filter-label">Case Number</label>
              <input id="perf-num-input" type="text" class="form-input" placeholder="e.g. TS020514571" style="max-width:220px"/>
            </div>
            <div>
              <label class="filter-label">Work Item <span style="font-weight:400;color:var(--text-tertiary)">(optional)</span></label>
              <input id="perf-wi-input" type="text" class="form-input" placeholder="e.g. Defect 12345 or Task 56143" style="max-width:200px"/>
            </div>
            <div class="d-flex gap-8">
              <button id="perf-num-add" class="btn btn-danger-filled btn-sm">
                ${IC.plus} Perf
              </button>
              <button id="nonperf-num-add" class="btn btn-success btn-sm">
                ${IC.plus} Non-Perf
              </button>
            </div>
          </div>
        </div>
        <input id="nonperf-num-input" type="hidden" value=""/>
        <input id="nonperf-wi-input" type="hidden" value=""/>

        <!-- Bulk import -->
        <div class="mb-20">
          <div class="filter-label" class="mb-10">Bulk Import</div>
          <div id="bulk-drop-zone" style="background:var(--bg-layer);border:2px dashed var(--border-mid);border-radius:var(--radius-md);padding:16px;transition:border-color var(--transition-fast)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:13px;font-weight:600;color:var(--text-secondary)">Paste or type cases below</span>
              <span class="text-meta">— one per line</span>
            </div>
            <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
              <code style="background:var(--ibm-blue-10);color:var(--ibm-blue-50);padding:2px 7px;border-radius:var(--radius-xs);font-size:11px;font-family:var(--font-mono)">TSXXXXXXX</code>
              <code style="background:var(--ibm-blue-10);color:var(--ibm-blue-50);padding:2px 7px;border-radius:var(--radius-xs);font-size:11px;font-family:var(--font-mono)">Defect NNNNN TSXXXXXXX</code>
              <code class="btn btn-ai btn-sm">Task NNNNN TSXXXXXXX</code>
              <span style="font-size:11px;color:var(--text-tertiary);align-self:center">— both formats supported</span>
            </div>
            <textarea id="perf-num-bulk" class="form-input" style="width:100%;min-height:88px;resize:vertical;font-family:var(--font-mono);font-size:12px;line-height:1.6;box-sizing:border-box"
              placeholder="TS020514571&#10;TS020521665&#10;Defect 54008    TS019458021"></textarea>
            <div style="display:flex;gap:8px;margin-top:10px">
              <button id="perf-num-bulk-import" class="btn btn-danger-filled btn-sm">
                ${IC.upload} Import as Performance
              </button>
              <button id="nonperf-num-bulk-import" class="btn btn-success btn-sm">
                ${IC.upload} Import as Non-Performance
              </button>
              <button id="perf-bulk-paste-btn" class="btn btn-overlay btn-sm" title="Paste from clipboard (Ctrl+V also works)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                Paste from Clipboard
              </button>
            </div>
          </div>
        </div>

        <!-- Tag lists — accordions -->
        <div class="grid-2">
          <div style="border:1px solid rgba(218,30,40,.25);border-radius:var(--radius-md);overflow:hidden">
            <button id="perf-accordion-toggle"
              style="width:100%;display:flex;align-items:center;gap:8px;padding:11px 14px;
              background:var(--red-bg);border:none;cursor:pointer;transition:background var(--t-fast)">
              ${IC.perf}
              <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--red);flex:1">Performance Cases</span>
              <span id="perf-count-badge" style="background:var(--red);color:#fff;font-size:10px;font-weight:600;padding:1px 8px;border-radius:var(--radius-md);font-family:var(--font-mono)">${perfNums.length}</span>
              <span id="perf-acc-chev" style="color:var(--red);transition:transform var(--transition-base)">${IC.chevron}</span>
            </button>
            <div id="perf-accordion-body" style="display:none;padding:14px;background:var(--bg-ui);border-top:1px solid rgba(218,30,40,.15)">
              <div id="perf-num-list" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px"></div>
            </div>
          </div>
          <div style="border:1px solid rgba(25,128,56,.25);border-radius:var(--radius-md);overflow:hidden">
            <button id="nonperf-accordion-toggle"
              style="width:100%;display:flex;align-items:center;gap:8px;padding:11px 14px;
              background:var(--green-bg);border:none;cursor:pointer;transition:background var(--t-fast)">
              ${IC.check}
              <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--green);flex:1">Non-Performance Cases</span>
              <span id="nonperf-count-badge" style="background:var(--green);color:#fff;font-size:10px;font-weight:600;padding:1px 8px;border-radius:var(--radius-md);font-family:var(--font-mono)">${npNums.length}</span>
              <span id="nonperf-acc-chev" style="color:var(--green);transition:transform var(--transition-base)">${IC.chevron}</span>
            </button>
            <div id="nonperf-accordion-body" style="display:none;padding:14px;background:var(--bg-ui);border-top:1px solid rgba(25,128,56,.15)">
              <div id="nonperf-num-list" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px"></div>
            </div>
          </div>
        </div>
      `)}

      <!-- Owner Reassignment Card -->
      ${card(IC.reassign, "Owner Reassignment", undefined, `
        <div class="grid-3" class="mb-16">
          <div>
            <label class="filter-label">Source Owner</label>
            <select id="bulk-source" class="form-select" class="w-full">
              <option value="">— Select Owner —</option>${memberOpts}
            </select>
          </div>
          <div>
            <label class="filter-label">Target Owner</label>
            <select id="bulk-target" class="form-select" class="w-full">
              <option value="">— Select Owner —</option>${memberOpts}
            </select>
          </div>
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
              <label class="filter-label" style="margin:0">Cases <span style="font-weight:400;color:var(--text-tertiary)">hold Ctrl/⌘ to multi-select</span></label>
            </div>
            <div style="display:flex;border-bottom:2px solid var(--border-subtle);margin-bottom:6px;gap:0">
              <button class="bulk-case-filter-btn" data-filter="active"
                style="font-size:11px;font-weight:600;padding:4px 14px;border:none;background:transparent;cursor:pointer;
                  color:${_bulkCaseFilter==='active'?'var(--ibm-blue-50)':'var(--text-tertiary)'};
                  border-bottom:${_bulkCaseFilter==='active'?'2px solid var(--ibm-blue-50)':'2px solid transparent'};
                  margin-bottom:-2px;transition:all .15s">Active</button>
              <button class="bulk-case-filter-btn" data-filter="closed"
                style="font-size:11px;font-weight:600;padding:4px 14px;border:none;background:transparent;cursor:pointer;
                  color:${_bulkCaseFilter==='closed'?'var(--ibm-blue-50)':'var(--text-tertiary)'};
                  border-bottom:${_bulkCaseFilter==='closed'?'2px solid var(--ibm-blue-50)':'2px solid transparent'};
                  margin-bottom:-2px;transition:all .15s">Closed</button>
              <button class="bulk-case-filter-btn" data-filter="all"
                style="font-size:11px;font-weight:600;padding:4px 14px;border:none;background:transparent;cursor:pointer;
                  color:${_bulkCaseFilter==='all'?'var(--ibm-blue-50)':'var(--text-tertiary)'};
                  border-bottom:${_bulkCaseFilter==='all'?'2px solid var(--ibm-blue-50)':'2px solid transparent'};
                  margin-bottom:-2px;transition:all .15s">All</button>
            </div>
            <select id="bulk-cases" class="form-select" multiple style="height:120px;padding:4px 8px;line-height:1.5;width:100%"></select>
            <div id="bulk-cases-count" style="font-size:10px;color:var(--text-tertiary);margin-top:3px"></div>
          </div>
        </div>
        <div class="d-flex gap-8 flex-wrap">
          <button id="bulk-select-all" class="btn btn-ghost btn-sm">${IC.select} Select All</button>
          <button id="bulk-reassign-btn" class="btn btn-primary btn-sm">${IC.reassign} Reassign Selected</button>
          <button id="bulk-reassign-all-btn" class="btn btn-secondary btn-sm">${IC.reassign} Reassign ALL from Source</button>
        </div>
        <div id="bulk-feedback" style="margin-top:10px;font-size:13px"></div>

        <!-- ── Excel Import ── -->
        <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border-subtle)">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);margin-bottom:10px">
            ${IC.upload} Import Reassignments from Excel
          </div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:10px;line-height:1.5">
            Upload an Excel file with columns <code style="background:var(--ibm-blue-10);color:var(--ibm-blue-50);padding:1px 6px;border-radius:var(--radius-xs);font-family:var(--font-mono)">Case Number</code> and <code style="background:var(--ibm-blue-10);color:var(--ibm-blue-50);padding:1px 6px;border-radius:var(--radius-xs);font-family:var(--font-mono)">Case Owner</code> — each case will be reassigned to the owner in that row.
          </div>
          <div class="row-wrap-8">
            <label class="btn btn-secondary btn-sm" class="cursor-p">
              ${IC.upload} Choose Excel File
              <input id="bulk-reassign-xlsx-input" type="file" accept=".xlsx,.xls" class="hidden"/>
            </label>
            <button id="bulk-reassign-xlsx-btn" class="btn btn-primary btn-sm" disabled style="opacity:.4">
              ${IC.reassign} Apply Import
            </button>
            <button id="bulk-reassign-xlsx-clear" class="btn btn-ghost btn-sm" class="hidden">
              ${IC.close} Clear
            </button>
          </div>
          <!-- Preview table -->
          <div id="bulk-reassign-xlsx-preview" class="mt-12"></div>
        </div>

        <!-- ── Search & Reassign (inline) ── -->
        <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border-subtle)">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);margin-bottom:10px">
            ${IC.search} Search Cases &amp; Reassign
          </div>
          <div class="form-input-group" style="margin-bottom:12px">
            <span class="input-icon">${IC.search}</span>
            <input id="admin-search" type="text" class="search-input"
              placeholder="Search by case number, title, or owner…" value="${Utils.escHtml(_search)}"/>
          </div>
          <div id="admin-search-results"></div>
        </div>

        <!-- ── Reassignment Log (accordion, chip-style matching perf tagging) ── -->
        <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border-subtle)">
          <div style="border:1px solid rgba(99,102,241,.25);border-radius:var(--radius-md);overflow:hidden">
            <button id="reassign-log-accordion-toggle"
              style="width:100%;display:flex;align-items:center;gap:8px;padding:11px 14px;
              background:rgba(99,102,241,.06);border:none;cursor:pointer;transition:background var(--t-fast)">
              ${IC.reassign}
              <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--ibm-blue-50);flex:1">Reassignment Log</span>
              <span id="reassign-log-badge" style="background:var(--ibm-blue-50);color:#fff;font-size:10px;font-weight:600;padding:1px 8px;border-radius:var(--radius-md);font-family:var(--font-mono)">0</span>
              <button id="reassign-log-clear-btn" onclick="event.stopPropagation()"
                style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:var(--radius-xs);border:1px solid rgba(218,30,40,.3);background:rgba(218,30,40,.06);color:var(--red);cursor:pointer;display:none;margin-right:4px">
                ${IC.trash} Clear
              </button>
              <span id="reassign-log-chev" style="color:var(--ibm-blue-50);transition:transform var(--transition-base)">${IC.chevron}</span>
            </button>
            <div id="reassign-log-body" style="display:none;padding:14px;background:var(--bg-ui);border-top:1px solid rgba(99,102,241,.15)">
              <div id="reassign-log-list" style="display:flex;flex-direction:column;gap:6px;max-height:320px;overflow-y:auto;scrollbar-width:thin">
                <span style="font-size:12px;color:var(--text-tertiary);opacity:.6">No reassignments recorded yet.</span>
              </div>
            </div>
          </div>
        </div>
      `)}

      <!-- ═══ TEAM CONFIG MANAGEMENT (Dynamic Data) ══════════ -->
      ${_renderTeamConfigCard()}

      <!-- History Card -->
      ${card(IC.history, "Audit &amp; Change History", changes.length, `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px;flex-wrap:wrap">
          <div class="form-input-group" style="width:240px">
            <span class="input-icon">${IC.search}</span>
            <input id="history-search" type="text" class="search-input" style="height:30px;font-size:12px"
              placeholder="Filter history…" value="${Utils.escHtml(_historySearch)}"/>
          </div>
          ${changes.length > 0 ? `
          <div style="display:flex;gap:6px;align-items:center">
            <button id="history-export-btn" class="btn btn-overlay btn-sm" class="fs-11" title="Export audit log as Excel">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
            <button id="history-clear-all-btn" class="btn btn-ghost btn-sm" style="color:var(--red);font-size:11px;border:1px solid rgba(218,30,40,.25)">
              ${IC.trash} Clear All History
            </button>
          </div>` : ""}
        </div>
        <style>
          #history-list [data-history-id]:hover { background: var(--bg-layer) !important; }
          #history-list [data-history-id]:hover .history-delete-btn { opacity: 1 !important; }
        </style>
        <div id="history-list" style="max-height:320px;overflow-y:auto;scrollbar-width:thin">${renderHistory(filterHistory(changes))}</div>
      `)}
    `;

    renderPerfNums();
    renderNonPerfNums();
    renderReassignLog();
    setTimeout(_wireTeamConfigEvents, 0);
    setTimeout(_updateRFECount, 100);

    /* ── History: per-entry delete (delegated on history-list) ── */
    document.getElementById("history-list")?.addEventListener("click", function(e) {
      const btn = e.target.closest(".history-delete-btn");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (!id) return;
      // Animate row out then remove
      const row = btn.closest("[data-history-id]");
      if (row) {
        row.style.transition = "opacity .2s, max-height .25s";
        row.style.opacity = "0";
        row.style.overflow = "hidden";
        setTimeout(() => {
          Data.removeChange(id);
          // Re-render only the list, not full page (keeps accordion state etc.)
          const list = document.getElementById("history-list");
          if (list) list.innerHTML = renderHistory(filterHistory(Data.changeHistory()));
          // Update badge count in card header
          const badge = document.querySelector("[data-history-badge]");
          if (badge) badge.textContent = Data.changeHistory().length;
          showToast("History entry removed.", "info");
        }, 220);
      }
    });

    /* ── History: Export as CSV (REC-08) ── */
    document.getElementById("history-export-btn")?.addEventListener("click", function() {
      const changes = Data.changeHistory();
      if (!changes.length) { showToast("No history to export.", "info"); return; }
      const header = ["Timestamp","Case Number","Field","Old Value","New Value","Updated By","Bulk","Bulk Count"];
      const rows = changes.map(e => [
        e.timestamp || "", e.caseNumber || "", e.field || "",
        e.oldValue  || "", e.newValue   || "", e.updatedBy || "",
        e.isBulk ? "Yes" : "No", e.bulkCount || ""
      ]);
      const csv = [header, ...rows].map(r =>
        r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `ibm-cip-audit-log-${new Date().toISOString().slice(0,10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
      showToast(`Exported ${changes.length} audit entries as CSV`, "success");
      if (typeof AdminLogger !== "undefined") AdminLogger.log("AUDIT_EXPORT", `Exported ${changes.length} audit entries`);
    });

    /* ── History: Clear All button ── */
    document.getElementById("history-clear-all-btn")?.addEventListener("click", function() {
      SafetyGuard.guardClearData(() => {
        Data.clearHistory();
        showToast("All history cleared.", "warning");
        render();
        const actor = (typeof Admin !== "undefined" && Admin.getActor) ? Admin.getActor() : "Admin";
        Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'History Cleared', oldValue: '', newValue: 'All change history entries cleared', updatedBy: actor, timestamp: new Date().toLocaleString() });
      });
    });

    /* ── Reassignment Log: clear button ── */
    document.getElementById("reassign-log-clear-btn")?.addEventListener("click", function(e) {
      e.stopPropagation();
      if (!confirm("Clear all reassignment log entries? This cannot be undone.")) return;
      if (Data.clearReassignLog) Data.clearReassignLog();
      renderReassignLog();
      showToast("Reassignment log cleared.", "info");
    });

    /* Accordion toggles */
    document.getElementById("reassign-log-accordion-toggle")?.addEventListener("click", function() {
      const body = document.getElementById("reassign-log-body");
      const chev = document.getElementById("reassign-log-chev");
      if (!body) return;
      const open = body.style.display !== "none";
      body.style.display = open ? "none" : "";
      if (chev) chev.style.transform = open ? "rotate(0deg)" : "rotate(180deg)";
    });
    document.getElementById("perf-accordion-toggle")?.addEventListener("click", function() {
      const body = document.getElementById("perf-accordion-body");
      const chev = document.getElementById("perf-acc-chev");
      if (!body) return;
      const open = body.style.display !== "none";
      body.style.display = open ? "none" : "";
      if (chev) chev.style.transform = open ? "rotate(0deg)" : "rotate(180deg)";
    });
    document.getElementById("nonperf-accordion-toggle")?.addEventListener("click", function() {
      const body = document.getElementById("nonperf-accordion-body");
      const chev = document.getElementById("nonperf-acc-chev");
      if (!body) return;
      const open = body.style.display !== "none";
      body.style.display = open ? "none" : "";
      if (chev) chev.style.transform = open ? "rotate(0deg)" : "rotate(180deg)";
    });

    /* Event listeners */
    document.getElementById("admin-change-pwd-btn")?.addEventListener("click", function() {
      const form = document.getElementById("admin-pwd-form");
      if (form) form.style.display = form.style.display === "none" ? "block" : "none";
      // Focus new pwd field when opening
      if (form && form.style.display !== "none") {
        setTimeout(() => document.getElementById("admin-new-pwd")?.focus(), 50);
      }
    });
    document.getElementById("admin-manage-qa-btn")?.addEventListener("click", function() {
      if (typeof Modal !== "undefined" && Modal.showSetupSecurityQuestions) {
        Modal.showSetupSecurityQuestions();
      }
    });
    document.getElementById("admin-cancel-pwd-btn")?.addEventListener("click", function() {
      const form = document.getElementById("admin-pwd-form");
      if (form) form.style.display = "none";
      document.getElementById("admin-new-pwd").value = "";
      document.getElementById("admin-confirm-pwd").value = "";
    });

    // Live validation — show match indicator
    function checkPwdMatch() {
      const p1 = document.getElementById("admin-new-pwd")?.value || "";
      const p2 = document.getElementById("admin-confirm-pwd")?.value || "";
      const msg = document.getElementById("admin-pwd-msg");
      const btn = document.getElementById("admin-save-pwd-btn");
      if (!p1 && !p2) { if(msg){msg.style.display="none";} return; }
      if (p2.length > 0 && p1 !== p2) {
        if(msg){msg.style.display="block";msg.style.color="var(--red)";msg.textContent="⚠ Passwords don't match";}
        if(btn) btn.style.opacity="0.5";
      } else if (p1.length >= 6 && p1 === p2) {
        if(msg){msg.style.display="block";msg.style.color="var(--green)";msg.textContent="✓ Passwords match";}
        if(btn) btn.style.opacity="1";
      } else {
        if(msg){msg.style.display="none";}
        if(btn) btn.style.opacity="1";
      }
    }
    document.getElementById("admin-new-pwd")?.addEventListener("input", checkPwdMatch);
    document.getElementById("admin-confirm-pwd")?.addEventListener("input", checkPwdMatch);
    // Allow Enter key to save
    document.getElementById("admin-confirm-pwd")?.addEventListener("keydown", function(e) {
      if (e.key === "Enter") document.getElementById("admin-save-pwd-btn")?.click();
    });

    document.getElementById("admin-save-pwd-btn")?.addEventListener("click", async function() {
      const curPwd    = document.getElementById("admin-cur-pwd")?.value    || "";
      const newPwd    = document.getElementById("admin-new-pwd")?.value    || "";
      const confirmPwd= document.getElementById("admin-confirm-pwd")?.value|| "";
      const msg       = document.getElementById("admin-pwd-msg");
      const btn       = this;
      if (!curPwd) {
        if (msg) { msg.style.display = "block"; msg.style.color = "var(--red)"; msg.textContent = "⚠ Enter your current password."; }
        return;
      }
      if (!newPwd || newPwd.length < 8) {
        if (msg) { msg.style.display = "block"; msg.style.color = "var(--red)"; msg.textContent = "⚠ New password must be at least 8 characters."; }
        return;
      }
      if (newPwd !== confirmPwd) {
        if (msg) { msg.style.display = "block"; msg.style.color = "var(--red)"; msg.textContent = "⚠ Passwords do not match. Please re-enter."; }
        document.getElementById("admin-confirm-pwd")?.focus();
        return;
      }
      btn.disabled = true; btn.textContent = "Saving…";
      try {
        await Admin.changePassword(curPwd, newPwd);
        if (msg) { msg.style.display = "block"; msg.style.color = "var(--green)"; msg.textContent = "✅ Password updated successfully!"; }
        document.getElementById("admin-cur-pwd").value = "";
        document.getElementById("admin-new-pwd").value = "";
        document.getElementById("admin-confirm-pwd").value = "";
        if (typeof AdminLogger !== "undefined") AdminLogger.log("CHANGE_PASSWORD", "Admin password changed");
        setTimeout(() => { const form = document.getElementById("admin-pwd-form"); if (form) form.style.display = "none"; }, 2000);
      } catch(e) {
        if (msg) { msg.style.display = "block"; msg.style.color = "var(--red)"; msg.textContent = "⚠ " + (e.message || "Failed to update password."); }
      }
      btn.disabled = false; btn.textContent = "Save Password";
    });

    document.getElementById("undo-btn")?.addEventListener("click", async function() {
      if (this.hasAttribute("disabled")) return;
      this.textContent = "⏳ Undoing…";
      const ok = await Data.undoLastChange();
      if (ok) {
        showToast("↩ Change reverted", "success");
        render();
        _refreshAllDashboards();
      } else {
        this.textContent = "↶ Undo";
      }
    });
    document.getElementById("redo-btn")?.addEventListener("click", async function() {
      if (this.hasAttribute("disabled")) return;
      this.textContent = "⏳ Redoing…";
      const ok = await Data.redoLastChange();
      if (ok) {
        showToast("↪ Change re-applied", "info");
        render();
        _refreshAllDashboards();
      } else {
        this.textContent = "↷ Redo";
      }
    });
    document.getElementById("clear-saved-btn")?.addEventListener("click", function() {
      SafetyGuard.guardClearData(() => {
        Data.clearPersisted();
        showToast("All saved data cleared", "warning");
        render();
        if (typeof DashPerformance !== "undefined") DashPerformance.render();
      });
    });
    document.getElementById("download-admin-data-btn")?.addEventListener("click", function() {
      _downloadAppDataJs();
    });
    document.getElementById("import-admin-data-btn")?.addEventListener("click", function() {
      document.getElementById("import-admin-data-input")?.click();
    });
    document.getElementById("import-admin-data-input")?.addEventListener("change", function(e) {
      if (e.target.files && e.target.files[0]) {
        _uploadAppDataJs(e.target.files[0]);
      }
      e.target.value = "";
    });

    // REC-03: Validate case number against configured pattern
    function _validateCaseNum(val) {
      const pattern = (typeof DynamicConfig !== "undefined" && DynamicConfig.caseNumberPattern)
        ? DynamicConfig.caseNumberPattern() : /^TS\d{8,}/i;
      if (!pattern.test(val)) {
        return { valid: false, warning: `"${val}" doesn't match expected format (e.g. TS########). Tag anyway?` };
      }
      const known = Data.allCases().some(c => c["Case Number"] === val);
      if (!known) {
        return { valid: true, warning: `Case ${val} is not in the current upload. Tag anyway?` };
      }
      return { valid: true, warning: null };
    }

    // REC-04: Circular tag prevention helper
    function _addPerfTag(val, wi, isPerf) {
      const opposing  = isPerf ? Data.isMarkedNonPerformance(val) : Data.isMarkedPerformance(val);
      const oppLabel  = isPerf ? "Non-Performance" : "Performance";
      const thisLabel = isPerf ? "Performance" : "Non-Performance";
      if (opposing) {
        if (!confirm(`Case ${val} is currently tagged as ${oppLabel}.\nTagging it as ${thisLabel} will remove the ${oppLabel} tag. Proceed?`)) return;
        // Remove from opposing list first
        if (isPerf) Data.removeNonPerfCaseNum(val); else Data.removePerfCaseNum(val);
      }
      Data.snapshotForAdmin();
      if (isPerf) { Data.addPerfCaseNum(val); } else { Data.addNonPerfCaseNum(val); }
      Data.setPerformanceMeta(val, Object.assign(wi ? { workItem: wi } : {}, { category: isPerf ? "performance" : "non-performance" }));
      document.getElementById("perf-num-input").value = "";
      document.getElementById("perf-wi-input").value  = "";
      if (isPerf) renderPerfNums(); else renderNonPerfNums();
      showToast(val + " tagged as " + thisLabel, "success");
      const actor = (typeof Admin !== "undefined" && Admin.getActor) ? Admin.getActor() : "Admin";
      Data.pushChange({ id: Date.now(), caseNumber: val, field: thisLabel + " Tag", oldValue: opposing ? oppLabel : "", newValue: "Marked as " + thisLabel, updatedBy: actor, timestamp: new Date().toLocaleString() });
    }

    document.getElementById("perf-num-add").addEventListener("click", function() {
      const val = document.getElementById("perf-num-input").value.trim();
      const wi  = document.getElementById("perf-wi-input").value.trim();
      if (!val) return;
      if (Data.isMarkedPerformance(val)) { showToast(val + " is already tagged as Performance", "warning"); return; }
      const check = _validateCaseNum(val);
      if (check.warning) {
        if (!confirm(check.warning)) return;
      }
      _addPerfTag(val, wi, true);
    });
    document.getElementById("perf-num-input").addEventListener("keydown", function(e) {
      if (e.key === "Enter") document.getElementById("perf-num-add").click();
    });
    document.getElementById("nonperf-num-add").addEventListener("click", function() {
      const val = document.getElementById("perf-num-input").value.trim();
      const wi  = document.getElementById("perf-wi-input").value.trim();
      if (!val) return;
      if (Data.isMarkedNonPerformance(val)) { showToast(val + " is already tagged as Non-Performance", "warning"); return; }
      const check = _validateCaseNum(val);
      if (check.warning) {
        if (!confirm(check.warning)) return;
      }
      _addPerfTag(val, wi, false);
    });
    document.getElementById("perf-num-bulk-import").addEventListener("click", function() {
      const raw = document.getElementById("perf-num-bulk").value;
      if (!raw.trim()) { showToast("Paste case numbers before importing", "warning"); return; }
      // REC-05: Parse and separate new vs already-tagged
      const parsed = [];
      raw.split(/\n/).map(s => s.trim()).filter(Boolean).forEach(line => {
        const dm = line.match(/(Defect|Task)\s+(\d+)\s+(\S+)/i);
        if (dm) { parsed.push({ caseNum: dm[3], wi: dm[1].charAt(0).toUpperCase()+dm[1].slice(1).toLowerCase()+" "+dm[2], category: "performance" }); return; }
        line.split(/[,\s]+/).filter(s => s.match(/^TS\d+/i)).forEach(n => { parsed.push({ caseNum: n, category: "performance" }); });
      });
      if (!parsed.length) { showToast("No valid case numbers found", "warning"); return; }
      if (parsed.length < 2) { showToast("Bulk Import requires at least 2 case numbers. Use 'Add Single Case' for one.", "warning"); return; }
      const alreadyPerf    = parsed.filter(p => Data.isMarkedPerformance(p.caseNum));
      const alreadyNonPerf = parsed.filter(p => Data.isMarkedNonPerformance(p.caseNum));
      const newOnes        = parsed.filter(p => !Data.isMarkedPerformance(p.caseNum) && !Data.isMarkedNonPerformance(p.caseNum));
      if (alreadyPerf.length || alreadyNonPerf.length) {
        const lines = [];
        if (alreadyPerf.length) lines.push(`${alreadyPerf.length} already tagged as Performance (will be skipped)`);
        if (alreadyNonPerf.length) lines.push(`${alreadyNonPerf.length} already tagged as Non-Performance (will be re-tagged)`);
        lines.push(`${newOnes.length} new cases will be tagged as Performance`);
        if (!confirm("Import summary:\n" + lines.join("\n") + "\n\nProceed?")) return;
      }
      const toImport = [...newOnes, ...alreadyNonPerf]; // re-tag non-perf → perf
      if (!toImport.length) { showToast("All cases already tagged as Performance — nothing to import.", "info"); return; }
      const _doBulkPerf = () => {
        alreadyNonPerf.forEach(p => Data.removeNonPerfCaseNum(p.caseNum));
        Data.setPerfCaseNums([...Data.getPerfCaseNums(), ...toImport.map(p => p.caseNum)]);
        toImport.forEach(p => { Data.setPerformanceMeta(p.caseNum, Object.assign(p.wi ? {workItem:p.wi}:{}, {category:"performance"})); });
        document.getElementById("perf-num-bulk").value = "";
        const actor = (typeof Admin !== "undefined" && Admin.getActor) ? Admin.getActor() : "Admin";
        renderPerfNums();
        showToast(`Imported ${toImport.length} Performance case${toImport.length!==1?"s":""}${alreadyPerf.length ? ` (${alreadyPerf.length} skipped — already tagged)` : ""}`, "success");
        Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'Performance Import', oldValue: '', newValue: `${toImport.length} case(s) marked as Performance — ${toImport.slice(0,10).map(p => p.caseNum).join(', ')}${toImport.length>10?' …':''}`, updatedBy: actor, timestamp: new Date().toLocaleString() });
      };
      if (toImport.length < 5) { _doBulkPerf(); return; }
      SafetyGuard.guardBulkTagging(toImport.map(p=>p.caseNum), "performance", _doBulkPerf);
    });
    document.getElementById("nonperf-num-bulk-import").addEventListener("click", function() {
      const raw = document.getElementById("perf-num-bulk").value;
      if (!raw.trim()) { showToast("Paste case numbers before importing", "warning"); return; }
      const parsed = [];
      raw.split(/\n/).map(s => s.trim()).filter(Boolean).forEach(line => {
        const dm = line.match(/(Defect|Task)\s+(\d+)\s+(\S+)/i);
        if (dm) { parsed.push({ caseNum: dm[3], wi: dm[1].charAt(0).toUpperCase()+dm[1].slice(1).toLowerCase()+" "+dm[2], category: "non-performance" }); return; }
        line.split(/[,\s]+/).filter(s => s.match(/^TS\d+/i)).forEach(n => { parsed.push({ caseNum: n, category: "non-performance" }); });
      });
      if (!parsed.length) { showToast("No valid case numbers found", "warning"); return; }
      if (parsed.length < 2) { showToast("Bulk Import requires at least 2 case numbers. Use 'Add Single Case' for one.", "warning"); return; }
      const alreadyNP   = parsed.filter(p => Data.isMarkedNonPerformance(p.caseNum));
      const alreadyPerf = parsed.filter(p => Data.isMarkedPerformance(p.caseNum));
      const newOnes     = parsed.filter(p => !Data.isMarkedNonPerformance(p.caseNum) && !Data.isMarkedPerformance(p.caseNum));
      if (alreadyNP.length || alreadyPerf.length) {
        const lines = [];
        if (alreadyNP.length) lines.push(`${alreadyNP.length} already tagged as Non-Performance (will be skipped)`);
        if (alreadyPerf.length) lines.push(`${alreadyPerf.length} already tagged as Performance (will be re-tagged)`);
        lines.push(`${newOnes.length} new cases will be tagged as Non-Performance`);
        if (!confirm("Import summary:\n" + lines.join("\n") + "\n\nProceed?")) return;
      }
      const toImport = [...newOnes, ...alreadyPerf];
      if (!toImport.length) { showToast("All cases already tagged as Non-Performance — nothing to import.", "info"); return; }
      const _doBulkNonPerf = () => {
        alreadyPerf.forEach(p => Data.removePerfCaseNum(p.caseNum));
        toImport.forEach(p => { Data.addNonPerfCaseNum(p.caseNum); Data.setPerformanceMeta(p.caseNum, Object.assign(p.wi ? {workItem:p.wi}:{}, {category:"non-performance"})); });
        document.getElementById("perf-num-bulk").value = "";
        const actor = (typeof Admin !== "undefined" && Admin.getActor) ? Admin.getActor() : "Admin";
        renderNonPerfNums();
        showToast(`Imported ${toImport.length} Non-Performance case${toImport.length!==1?"s":""}${alreadyNP.length ? ` (${alreadyNP.length} skipped)` : ""}`, "success");
        Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'Non-Performance Import', oldValue: '', newValue: `${toImport.length} case(s) marked as Non-Performance — ${toImport.slice(0,10).map(p => p.caseNum).join(', ')}${toImport.length>10?' …':''}`, updatedBy: actor, timestamp: new Date().toLocaleString() });
      };
      if (toImport.length < 5) { _doBulkNonPerf(); return; }
      SafetyGuard.guardBulkTagging(toImport.map(p=>p.caseNum), "non-performance", _doBulkNonPerf);
    });

    // REC-12: Paste from Clipboard button
    document.getElementById("perf-bulk-paste-btn")?.addEventListener("click", async function() {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          document.getElementById("perf-num-bulk").value = text;
          showToast("Pasted from clipboard", "success");
        }
      } catch(e) {
        showToast("Clipboard access denied — please paste manually (Ctrl+V)", "warning");
      }
    });

    document.getElementById("bulk-source").addEventListener("change", function(e) { _bulkSource = e.target.value; populateBulkCases(); });

    // Filter tab buttons for Cases list
    document.querySelectorAll(".bulk-case-filter-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        _bulkCaseFilter = this.dataset.filter;
        document.querySelectorAll(".bulk-case-filter-btn").forEach(b => {
          const active = b.dataset.filter === _bulkCaseFilter;
          b.style.color       = active ? "var(--ibm-blue-50)" : "var(--text-tertiary)";
          b.style.borderBottom = active ? "2px solid var(--ibm-blue-50)" : "2px solid transparent";
        });
        populateBulkCases();
      });
    });
    document.getElementById("bulk-target").addEventListener("change", function(e) { _bulkTarget = e.target.value; });
    document.getElementById("bulk-select-all").addEventListener("click", function() {
      Array.from(document.getElementById("bulk-cases").options).forEach(o => o.selected = true);
    });
    document.getElementById("bulk-reassign-btn").addEventListener("click", function() {
      if (!_bulkSource || !_bulkTarget) { showFeedback("Select source and target owner.", "var(--red)"); return; }
      if (_bulkSource === _bulkTarget) { showFeedback("Source and target owner must be different.", "var(--red)"); return; }
      const nums = Array.from(document.getElementById("bulk-cases").options).filter(o => o.selected).map(o => o.value);
      if (!nums.length) { showFeedback("Select at least one case.", "var(--red)"); return; }
      SafetyGuard.guardBulkReassign(nums, Data.allCases(), _bulkSource, _bulkTarget, () => {
        Data.bulkReassign(nums, _bulkTarget);
        _syncWeeklyTrackerOwners();
        showToast("Reassigned " + nums.length + " case(s) to " + Utils.shortName(_bulkTarget), "success");
        Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'Bulk Reassign', oldValue: Utils.shortName(_bulkSource), newValue: `${nums.length} cases → ${Utils.shortName(_bulkTarget)}`, updatedBy: 'Admin', timestamp: new Date().toLocaleString() });
        if (typeof DashWeeklyTracker !== "undefined") DashWeeklyTracker.enrichFromCases(Data.allCases());
        App.updateHeader();
        _bulkSource = ""; _bulkTarget = "";
        document.getElementById("bulk-source").value = "";
        document.getElementById("bulk-target").value = "";
        document.getElementById("bulk-cases").innerHTML = "";
        render();
      });
    });
    document.getElementById("bulk-reassign-all-btn").addEventListener("click", function() {
      if (!_bulkSource || !_bulkTarget) { showFeedback("Select source and target owner.", "var(--red)"); return; }
      if (_bulkSource === _bulkTarget) { showFeedback("Source and target owner must be different.", "var(--red)"); return; }
      const srcLow = _bulkSource.toLowerCase();
      const allNums = Data.teamCases().filter(r => {
        const o = (r.Owner||"").toLowerCase();
        return o === srcLow || (srcLow === "suvidya" && o === "venkata suvidya dega") || (srcLow === "srinivas k" && o === "srinivasareddy karnatilakshmireddygari");
      }).map(r => r["Case Number"]);
      SafetyGuard.guardBulkReassign(allNums, Data.allCases(), _bulkSource, _bulkTarget, () => {
        Data.bulkReassign(allNums, _bulkTarget);
        _syncWeeklyTrackerOwners();
        showToast("Reassigned ALL " + allNums.length + " case(s) to " + Utils.shortName(_bulkTarget), "success");
        Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'Bulk Reassign ALL', oldValue: Utils.shortName(_bulkSource), newValue: `All ${allNums.length} cases → ${Utils.shortName(_bulkTarget)}`, updatedBy: 'Admin', timestamp: new Date().toLocaleString() });
        if (typeof DashWeeklyTracker !== "undefined") DashWeeklyTracker.enrichFromCases(Data.allCases());
        App.updateHeader();
        _bulkSource = ""; _bulkTarget = "";
        document.getElementById("bulk-source").value = "";
        document.getElementById("bulk-target").value = "";
        document.getElementById("bulk-cases").innerHTML = "";
        render();
      });
    });

    document.getElementById("admin-search").addEventListener("input", function(e) { _search = e.target.value; drawSearchResults(); });
    if (_search.length > 0) drawSearchResults();
    document.getElementById("history-search")?.addEventListener("input", function(e) {
      _historySearch = e.target.value;
      const list = document.getElementById("history-list");
      if (list) list.innerHTML = renderHistory(filterHistory(Data.changeHistory()));
    });

    const ta = document.getElementById("perf-num-bulk");
    const dz = document.getElementById("bulk-drop-zone");
    if (ta && dz) {
      ta.addEventListener("focus", () => { dz.style.borderColor = "var(--ibm-blue-50)"; });
      ta.addEventListener("blur",  () => { dz.style.borderColor = "var(--border-mid)"; });
    }

    // REC-16: Health panel — probe server + config freshness async
    (async () => {
      const serverEl = document.getElementById("admin-health-server-status");
      const configEl = document.getElementById("admin-health-config-status");
      if (!serverEl) return;
      try {
        const t0  = Date.now();
        const res = null /* save.php removed — use IIPStore */;
        const ms  = Date.now() - t0;
        if (res.ok) {
          serverEl.textContent = `Online (${ms}ms)`;
          serverEl.style.color = "var(--green)";
        } else {
          serverEl.textContent = "Degraded (HTTP " + res.status + ")";
          serverEl.style.color = "var(--yellow)";
        }
      } catch(e) {
        serverEl.textContent = "Unreachable";
        serverEl.style.color = "var(--red)";
      }
      if (configEl) {
        try {
          const dc = (typeof DynamicConfig !== "undefined" && DynamicConfig.getRaw) ? DynamicConfig.getRaw() : null;
          if (dc && dc._savedAt) {
            const ago = Math.round((Date.now() - new Date(dc._savedAt).getTime()) / 60000);
            configEl.textContent = `Saved ${ago < 1 ? "<1" : ago} min ago`;
            configEl.style.color = ago > 60 ? "var(--yellow)" : "var(--green)";
          } else {
            configEl.textContent = "Using defaults";
            configEl.style.color = "var(--text-secondary)";
          }
        } catch(e) {
          configEl.textContent = "Unknown";
          configEl.style.color = "var(--text-tertiary)";
        }
      }
    })();

    // REC-09: Register dirty guard with Admin module
    if (typeof Admin !== "undefined" && Admin.setDirtyGuard) {
      Admin.setDirtyGuard(() => _adminDirty);
    }
  }

  function filterHistory(changes) {
    if (!_historySearch.trim()) return changes;
    const q = _historySearch.toLowerCase();
    return changes.filter(c =>
      (c.caseNumber||"").toLowerCase().includes(q) ||
      (c.field||"").toLowerCase().includes(q) ||
      (c.updatedBy||"").toLowerCase().includes(q) ||
      (c.newValue||"").toLowerCase().includes(q)
    );
  }

  function renderHistory(changes) {
    if (!changes.length) return `<div style="padding:24px 16px;text-align:center">
      <div class="kpi-icon">📋</div>
      <div style="font-size:13px;font-weight:600;color:var(--text-secondary)">No changes recorded yet</div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px">Admin actions like tagging, reassigning, and importing will appear here</div>
    </div>`;

    // ── Icon + colours per action type ────────────────────────────────
    function _meta(ch) {
      const f  = ch.field     || "";
      const cn = ch.caseNumber || "";
      if (cn === "CONFIG") {
        if (f.includes("Rename") || f.includes("Team Members (Rename)"))
          return { icon:"✏️", bg:"var(--ibm-blue-10)", col:"var(--ibm-blue-50)", label:"Member Renamed" };
        if (f === "Team Members")
          return { icon:"👥", bg:"rgba(105,41,196,.08)", col:"var(--chart-4)", label:"Team Updated" };
        if (f.includes("ALM"))
          return { icon:"🗂️", bg:"rgba(105,41,196,.08)", col:"var(--chart-4)", label:"ALM Lines" };
        if (f.includes("App Settings"))
          return { icon:"⚙️", bg:"rgba(224,112,0,.08)", col:"var(--orange)", label:"App Settings" };
        if (f.includes("Escalation"))
          return { icon:"🔔", bg:"var(--green-bg)", col:"var(--green)", label:"Escalation Contacts" };
        if (f.includes("Products"))
          return { icon:"📦", bg:"var(--ibm-blue-10)", col:"var(--ibm-blue-50)", label:"Customer Products" };
        if (f.includes("Tracker"))
          return { icon:"📅", bg:"rgba(105,41,196,.08)", col:"var(--chart-4)", label:"Weekly Tracker" };
        if (f.includes("Directory"))
          return { icon:"📇", bg:"rgba(0,93,93,.1)", col:"var(--teal)", label:"IBM Directory" };
        if (f.includes("Reassign"))
          return { icon:"🔀", bg:"rgba(224,112,0,.08)", col:"var(--orange)", label:"Bulk Reassign" };
        if (f.includes("Performance"))
          return { icon:"⚡", bg:"rgba(218,30,40,.08)", col:"var(--red)", label:"Bulk Import" };
        if (f === "History Cleared")
          return { icon:"🗑️", bg:"rgba(218,30,40,.08)", col:"var(--red)", label:"History Cleared" };
        return { icon:"ℹ️", bg:"var(--ibm-blue-10)", col:"var(--ibm-blue-50)", label:"Config" };
      }
      if (f === "Performance Tag")
        return { icon:"⚡", bg:"rgba(218,30,40,.08)", col:"var(--red)", label:"Tagged: Performance" };
      if (f === "Non-Performance Tag")
        return { icon:"✅", bg:"var(--green-bg)", col:"var(--green)", label:"Tagged: Non-Performance" };
      if (f === "Owner")
        return { icon:"🔀", bg:"rgba(224,112,0,.08)", col:"var(--orange)", label:"Owner Reassigned" };
      if (f === "Reminder Sent")
        return { icon:"🔔", bg:"var(--ibm-blue-10)", col:"var(--ibm-blue-50)", label:"Reminder Sent" };
      return { icon:"📝", bg:"rgba(224,112,0,.08)", col:"var(--orange)", label:"Case Updated" };
    }

    // ── Format timestamp nicely ────────────────────────────────────────
    function _fmtTs(ts) {
      if (!ts) return "—";
      try {
        const d = new Date(ts);
        if (!isNaN(d)) {
          return d.toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric",
            hour:"2-digit", minute:"2-digit" });
        }
      } catch(e) {}
      return ts;
    }

    // ── Build detail rows for each entry ──────────────────────────────
    function _detailRows(ch) {
      const f    = ch.field     || "";
      const cn   = ch.caseNumber || "";
      const oldV = (ch.oldValue  || "").trim();
      const newV = (ch.newValue  || "").trim();
      const who  = ch.updatedBy || "Admin";
      const rows = [];

      // Actor chip
      rows.push(`<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-size:10px;background:var(--bg-hover);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:1px 8px;color:var(--text-tertiary)">
          👤 ${Utils.escHtml(who)}
        </span>
        ${cn && cn !== "CONFIG" ? `<span style="font-family:var(--font-mono);font-size:10px;font-weight:600;background:rgba(15,98,254,.08);color:var(--ibm-blue-50);border:1px solid rgba(15,98,254,.2);border-radius:var(--radius-sm);padding:1px 7px">${Utils.escHtml(cn)}</span>` : ""}
      </div>`);

      // Main detail block
      if (cn === "CONFIG") {
        if (newV) {
          rows.push(`<div style="font-size:var(--font-size-xs);color:var(--text-primary);margin-top:4px;line-height:1.5;word-break:break-word">${Utils.escHtml(newV)}</div>`);
        }
        if (oldV && oldV !== newV) {
          rows.push(`<div class="text-meta-top">
            <span style="text-decoration:line-through;color:var(--red-muted,#f87171)">${Utils.escHtml(oldV)}</span>
          </div>`);
        }
      } else {
        // Case-level changes — show field + old→new
        if (f === "Owner" && oldV && newV) {
          rows.push(`<div style="font-size:var(--font-size-xs);margin-top:4px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:11px;font-weight:600;color:var(--text-tertiary)">Owner:</span>
            <span style="padding:1px 7px;border-radius:var(--radius-md);background:rgba(218,30,40,.07);color:var(--red);border:1px solid rgba(218,30,40,.2);font-size:11px;text-decoration:line-through">${Utils.escHtml(oldV)}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            <span style="padding:1px 7px;border-radius:var(--radius-md);background:rgba(25,128,56,.08);color:var(--green);border:1px solid rgba(25,128,56,.2);font-size:11px;font-weight:600">${Utils.escHtml(newV)}</span>
          </div>`);
        } else if (newV) {
          rows.push(`<div style="font-size:var(--font-size-xs);color:var(--text-primary);margin-top:4px">${Utils.escHtml(newV)}</div>`);
        }
      }

      return rows.join("");
    }

    // Group entries by date for a timeline feel
    function _dateGroup(ts) {
      if (!ts) return "Unknown date";
      try {
        const d = new Date(ts);
        if (isNaN(d)) return ts;
        const today = new Date();
        const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
        const dStr = d.toDateString();
        if (dStr === today.toDateString()) return "Today";
        if (dStr === yesterday.toDateString()) return "Yesterday";
        return d.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
      } catch(e) { return ts; }
    }

    // Build grouped timeline
    const grouped = [];
    let curGroup = null;
    changes.forEach(ch => {
      const grp = _dateGroup(ch.timestamp);
      if (grp !== curGroup) {
        curGroup = grp;
        grouped.push({ type:"header", label:grp });
      }
      grouped.push({ type:"entry", ch });
    });

    return `<div class="p-0">` +
      grouped.map((item, gi) => {
        if (item.type === "header") {
          return `<div style="padding:8px 16px 4px;font-size:10px;font-weight:600;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);text-transform:none;
                               background:var(--surface-1);border-bottom:1px solid var(--border-subtle);
                               position:sticky;top:0;z-index:2">${Utils.escHtml(item.label)}</div>`;
        }
        const ch   = item.ch;
        const mt   = _meta(ch);
        const isLast = gi === grouped.length - 1 || grouped[gi+1]?.type === "header";
        return `
          <div data-history-id="${Utils.escHtml(String(ch.id))}"
               style="display:flex;align-items:flex-start;gap:10px;padding:10px 16px;
                      border-bottom:1px solid ${!isLast ? "var(--border-subtle)" : "transparent"};
                      transition:background .15s">
            <!-- Icon pill -->
            <div style="background:${mt.bg};color:${mt.col};border-radius:var(--radius-sm);padding:5px 7px;
                        flex-shrink:0;margin-top:2px;font-size:13px;line-height:1">${mt.icon}</div>
            <!-- Content -->
            <div class="flex-1-0">
              <!-- Label + timestamp row -->
              <div style="display:flex;align-items:center;gap:8px;justify-content:space-between;flex-wrap:wrap;margin-bottom:4px">
                <span style="font-size:12px;font-weight:600;color:${mt.col}">${mt.label}</span>
                <span style="font-size:10px;color:var(--text-disabled);font-family:var(--font-mono);flex-shrink:0">${_fmtTs(ch.timestamp)}</span>
              </div>
              <!-- Detail rows -->
              ${_detailRows(ch)}
            </div>
            <!-- Delete button -->
            <button class="history-delete-btn" aria-label="Delete history entry" data-id="${Utils.escHtml(String(ch.id))}"
              title="Remove this entry"
              style="flex-shrink:0;background:none;border:none;cursor:pointer;padding:3px 5px;border-radius:var(--radius-xs);
                     color:var(--text-disabled);opacity:0;transition:opacity var(--transition-fast),color .15s;font-size:13px;line-height:1"
              onmouseenter="this.style.color='var(--red)'"
              onmouseleave="this.style.color='var(--text-disabled)'">✕</button>
          </div>`;
      }).join("") + `</div>`;
  }



  function renderPerfNums() {
    const container = document.getElementById("perf-num-list"); if (!container) return;
    const nums = Data.getPerfCaseNums(), meta = Data.performanceMeta();
    const badge = document.getElementById("perf-count-badge"); if (badge) badge.textContent = nums.length;
    if (!nums.length) { container.innerHTML = `<span style="font-size:12px;color:var(--red);opacity:.6">No performance cases tagged yet</span>`; return; }
    container.innerHTML = nums.map(n => {
      const wi = (meta[n]||{}).workItem;
      return `<div style="display:inline-flex;align-items:center;gap:4px;background:var(--bg-ui);border:1px solid rgba(218,30,40,.3);border-radius:var(--radius-sm);padding:4px 9px">
        <span style="color:var(--red);font-family:var(--font-mono);font-size:12px;font-weight:600">${Utils.escHtml(n)}</span>
        ${wi ? adminWiLink(wi) : ""}
        <button class="perf-num-remove" data-num="${Utils.escHtml(n)}" title="Remove"
          style="background:none;border:none;cursor:pointer;color:var(--text-disabled);font-size:13px;padding:0 1px;line-height:1">✕</button>
      </div>`;
    }).join("");
    container.querySelectorAll(".perf-num-remove").forEach(btn => {
      btn.addEventListener("click", () => { Data.removePerfCaseNum(btn.dataset.num); showToast(btn.dataset.num + " removed", "info"); renderPerfNums(); });
    });
  }

  function renderNonPerfNums() {
    const container = document.getElementById("nonperf-num-list"); if (!container) return;
    const nums = Data.getNonPerfCaseNums(), meta = Data.performanceMeta();
    const badge = document.getElementById("nonperf-count-badge"); if (badge) badge.textContent = nums.length;
    if (!nums.length) { container.innerHTML = `<span style="font-size:12px;color:var(--green);opacity:.6">No non-performance cases tagged yet</span>`; return; }
    container.innerHTML = nums.map(n => {
      const wi = (meta[n]||{}).workItem;
      return `<div style="display:inline-flex;align-items:center;gap:4px;background:var(--bg-ui);border:1px solid rgba(25,128,56,.3);border-radius:var(--radius-sm);padding:4px 9px">
        <span style="color:var(--green);font-family:var(--font-mono);font-size:12px;font-weight:600">${Utils.escHtml(n)}</span>
        ${wi ? adminWiLink(wi) : ""}
        <button class="nonperf-num-remove" data-num="${Utils.escHtml(n)}" title="Remove"
          style="background:none;border:none;cursor:pointer;color:var(--text-disabled);font-size:13px;padding:0 1px;line-height:1">✕</button>
      </div>`;
    }).join("");
    container.querySelectorAll(".nonperf-num-remove").forEach(btn => {
      btn.addEventListener("click", () => { Data.removeNonPerfCaseNum(btn.dataset.num); showToast(btn.dataset.num + " removed", "info"); renderNonPerfNums(); });
    });
  }

  function renderReassignLog() {
    const container = document.getElementById("reassign-log-list"); if (!container) return;
    const badge     = document.getElementById("reassign-log-badge");
    const clearBtn  = document.getElementById("reassign-log-clear-btn");
    const log       = (Data.getReassignLog ? Data.getReassignLog() : []);
    if (badge)   badge.textContent = log.length;
    if (clearBtn) clearBtn.style.display = log.length ? "" : "none";
    if (!log.length) {
      container.innerHTML = `<span style="font-size:12px;color:var(--text-tertiary);opacity:.6">No reassignments recorded yet.</span>`;
      return;
    }
    // Chip-style matching perf case tagging display
    container.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px">${log.map((e, idx) => {
      const shortOld = Utils.shortName ? Utils.shortName(e.oldOwner || "—") : (e.oldOwner || "—");
      const shortNew = Utils.shortName ? Utils.shortName(e.newOwner || "—") : (e.newOwner || "—");
      const tooltip  = Utils.escHtml(e.caseNum + ": " + (e.title || "") + "\n" + shortOld + " → " + shortNew + "\n" + (e.ts || ""));
      return `<div class="reassign-log-chip" title="${tooltip}"
        style="display:inline-flex;align-items:center;gap:5px;background:var(--bg-ui);
          border:1px solid rgba(99,102,241,.3);border-radius:var(--radius-sm);padding:5px 10px">
        <span style="font-family:var(--font-mono);font-weight:700;color:var(--ibm-blue-50);font-size:12px">${Utils.escHtml(e.caseNum)}</span>
        <span style="color:var(--text-tertiary);font-size:11px">${Utils.escHtml(shortOld)}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--orange,#ff832b)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        <span style="color:var(--green);font-weight:600;font-size:11px">${Utils.escHtml(shortNew)}</span>
        <button class="reassign-log-revert" data-idx="${idx}"
          style="background:none;border:none;cursor:pointer;color:var(--text-disabled);font-size:14px;padding:0 2px;line-height:1"
          title="Revert — reassign back to ${Utils.escHtml(shortOld)}">✕</button>
      </div>`;
    }).join("")}</div>`;

    container.querySelectorAll(".reassign-log-revert").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        const idx   = parseInt(this.dataset.idx);
        const log   = Data.getReassignLog ? Data.getReassignLog() : [];
        const entry = log[idx];
        if (!entry) return;
        const shortOld = Utils.shortName ? Utils.shortName(entry.oldOwner) : entry.oldOwner;
        const shortNew = Utils.shortName ? Utils.shortName(entry.newOwner) : entry.newOwner;
        if (!confirm("Revert " + entry.caseNum + "?\n\nThis will reassign the case back from " + shortNew + " → " + shortOld + ".")) return;
        Data.reassignCase(entry.caseNum, entry.oldOwner);
        _syncWeeklyTrackerOwners();
        if (Data.removeReassignLogEntry) Data.removeReassignLogEntry(idx);
        showToast("↩ Reverted " + entry.caseNum + " back to " + shortOld, "success");
        renderReassignLog();
        drawSearchResults();
      });
    });
  }

  function populateBulkCases() {
    const sel      = document.getElementById("bulk-cases");      if (!sel) return;
    const countEl  = document.getElementById("bulk-cases-count");
    if (!_bulkSource) {
      sel.innerHTML = "";
      if (countEl) countEl.textContent = "";
      return;
    }
    const srcLow   = _bulkSource.toLowerCase();
    const perfNums = new Set(Data.getPerfCaseNums ? Data.getPerfCaseNums() : []);

    const allOwnerCases = Data.allCases().filter(r => {
      const o = (r.Owner||"").toLowerCase();
      return o === srcLow ||
             (srcLow === "suvidya"    && o === "venkata suvidya dega") ||
             (srcLow === "srinivas k" && o === "srinivasareddy karnatilakshmireddygari");
    });

    // Apply filter: active, closed, or all (perf cases always included)
    const cases = allOwnerCases.filter(r => {
      const closed = Utils.isClosed(r.Status);
      const isPerf = perfNums.has(r["Case Number"]);
      if (_bulkCaseFilter === "active")  return !closed;
      if (_bulkCaseFilter === "closed")  return closed || isPerf;
      return true; // "all"
    });

    if (!cases.length) {
      const filterLabel = _bulkCaseFilter === "active" ? "active" : _bulkCaseFilter === "closed" ? "closed" : "";
      sel.innerHTML = `<option disabled>No ${filterLabel} cases for this owner</option>`;
      if (countEl) countEl.textContent = "";
      return;
    }

    // Sort: open first, then perf-tagged, then by case number
    cases.sort((a, b) => {
      const aOpen = !Utils.isClosed(a.Status);
      const bOpen = !Utils.isClosed(b.Status);
      const aPerf = perfNums.has(a["Case Number"]);
      const bPerf = perfNums.has(b["Case Number"]);
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      if (aPerf !== bPerf) return aPerf ? -1 : 1;
      return 0;
    });

    sel.innerHTML = cases.map(c => {
      const cn       = c["Case Number"];
      const isPerf   = perfNums.has(cn);
      const isClosed = Utils.isClosed(c.Status);
      const prefix   = isPerf ? "⚡ " : "";
      const suffix   = isClosed ? " [closed]" : "";
      return `<option value="${Utils.escHtml(cn)}" style="${isPerf ? "color:var(--red);font-weight:600" : ""}">${prefix}${Utils.escHtml(cn)} — ${Utils.escHtml((c.Title||"").slice(0,40))}${suffix}</option>`;
    }).join("");

    if (countEl) countEl.textContent = `${cases.length} case${cases.length !== 1 ? "s" : ""} shown`;
  }

  // ── Sync weekly tracker and refresh reassign log after any reassignment ──
  function _syncWeeklyTrackerOwners() {
    try {
      if (typeof DashWeeklyTracker !== 'undefined' && DashWeeklyTracker.enrichFromCases) {
        DashWeeklyTracker.enrichFromCases(Data.allCases());
      }
    } catch(e) { console.warn('[Admin] _syncWeeklyTrackerOwners failed:', e); }
    // Refresh the reassignment log chip display
    try { renderReassignLog(); } catch(e) {}
  }

  function showFeedback(msg, color) {
    const el = document.getElementById("bulk-feedback");
    if (el) el.innerHTML = `<span style="color:${color || 'var(--green)'};font-size:13px;font-weight:500">${msg}</span>`;
  }

  function drawSearchResults() {
    const container = document.getElementById("admin-search-results"); if (!container) return;
    const q = _search.trim();
    if (!q) {
      container.innerHTML = `<p style="font-size:13px;color:var(--text-tertiary)">Type a case number to search…</p>`;
      return;
    }
    const qLow = q.toLowerCase();
    const matches = Data.allCases().filter(r =>
      (r["Case Number"]||"").toLowerCase().includes(qLow) ||
      (r.Title||"").toLowerCase().includes(qLow) ||
      (r.Owner||"").toLowerCase().includes(qLow)
    );
    Table.render(container, matches, {
      showRemind: false, showReassign: true,
      onReassign: row => {
        Modal.showReassign(row, (caseNum, newOwner) => {
          Data.reassignCase(caseNum, newOwner);
          _syncWeeklyTrackerOwners();
          render();
        });
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     TEAM CONFIG MANAGEMENT  (Options A1, A2, A3, A4, A6, C)
     All dynamic data management for the admin portal.
  ══════════════════════════════════════════════════════════ */
  function _renderTeamConfigCard() {
    const DC = (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;
    if (!DC) return "";

    const cfg = DC.getRaw();
    const members = DC.teamMembers();
    const emails  = DC.teamEmails();
    const alm     = DC.almResponsible();
    const ec      = DC.expertiseConnect();
    const bd      = DC.bdEscalation();
    const tl      = DC.teamLead();
    const appCfg  = DC.appConfig();
    const products = [...DC.customerProducts()];

    const memberRows = members.map((m, i) =>
      `<tr data-idx="${i}" data-orig-name="${Utils.escHtml(m)}">
        <td class="p-sm"><input class="form-input dc-member-name" class="w-full-fs12 form-input" value="${Utils.escHtml(m)}"/></td>
        <td class="p-sm"><input class="form-input dc-member-email" class="w-full-fs12 form-input" value="${Utils.escHtml(emails[m]||'')}"/></td>
        <td style="padding:6px 8px;text-align:center">
          <button class="btn btn-ghost btn-sm dc-remove-member" data-idx="${i}" class="text-badge-red">✕</button>
        </td>
      </tr>`
    ).join("");

    const almRows = alm.map((r, i) =>
      `<tr data-idx="${i}" style="${i%2===0?'background:var(--bg-layer)':''}">
        <td class="p-compact">
          <input class="form-input dc-alm-line" style="width:96px;font-size:12px;font-family:var(--font-mono);font-weight:600"
            value="${Utils.escHtml(r.alm||'')}" placeholder="ALM-XX-P"/>
        </td>
        <td class="p-compact">
          <input class="form-input dc-alm-names" style="width:150px;font-size:11px"
            value="${Utils.escHtml(r.names||'')}" placeholder="Name 1; Name 2"/>
        </td>
        <td class="p-compact">
          <input class="form-input dc-alm-emails" style="width:180px;font-size:11px;font-family:var(--font-mono)"
            value="${Utils.escHtml(r.emails||'')}" placeholder="email1@co.com;email2@co.com"/>
        </td>
        <td class="p-compact">
          <input class="form-input dc-alm-bd" class="filter-input-sm form-input"
            value="${Utils.escHtml(r.bd||'')}" placeholder="Line Responsible"/>
        </td>
        <td class="p-compact">
          <input class="form-input dc-alm-bdemail" class="filter-input-mono form-input"
            value="${Utils.escHtml(r.bdEmail||'')}" placeholder="bd-line@bosch.com"/>
        </td>
        <td class="p-compact">
          <input class="form-input dc-alm-ibm" class="filter-input-sm form-input"
            value="${Utils.escHtml(r.ibm||'')}" placeholder="CASE Responsible"
            oninput="(function(el){const em=el.closest('tr').querySelector('.dc-alm-ibmemail');if(!em||em.dataset.manual==='1')return;const name=el.value.trim();const found=(DC&&DC.teamEmails&&DC.teamEmails()[name])||'';em.value=found;})(this)"/>
        </td>
        <td class="p-compact">
          <input class="form-input dc-alm-ibmemail" class="filter-input-mono form-input"
            value="${Utils.escHtml(r.ibmEmail||'')}" placeholder="name@de.bosch.com"
            oninput="this.dataset.manual=this.value?'1':'0'"/>
        </td>
        <td class="p-compact">
          <input class="form-input dc-alm-proxy" class="filter-input-sm form-input"
            value="${Utils.escHtml(r.proxy||'')}" placeholder="CASE Proxy"
            oninput="(function(el){const em=el.closest('tr').querySelector('.dc-alm-proxyemail');if(!em||em.dataset.manual==='1')return;const name=el.value.trim();const found=(DC&&DC.teamEmails&&DC.teamEmails()[name])||'';em.value=found;})(this)"/>
        </td>
        <td class="p-compact">
          <input class="form-input dc-alm-proxyemail" class="filter-input-mono form-input"
            value="${Utils.escHtml(r.proxyEmail||'')}" placeholder="name@de.bosch.com"
            oninput="this.dataset.manual=this.value?'1':'0'"/>
        </td>
        <td class="p-compact-c">
          <button class="btn btn-ghost btn-sm dc-remove-alm" data-idx="${i}"
            class="text-badge-red">✕</button>
        </td>
      </tr>`
    ).join("");

    const escalationList = (arr, cls) => arr.map((c,i) =>
      `<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
        <input class="form-input ${cls}-name" class="flex-1-fs12" placeholder="Name" value="${Utils.escHtml(c.name||'')}"/>
        <input class="form-input ${cls}-email" class="flex-1-fs12" placeholder="Email" value="${Utils.escHtml(c.email||'')}"/>
        <button class="btn btn-ghost btn-sm" onclick="this.closest('[data-escrow]').remove()" class="text-badge-red">✕</button>
      </div>`
    ).join("");

    return `
    <div class="tile" style="margin-bottom:16px;border-left:3px solid var(--ibm-blue-50)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border-subtle)">
        <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--text-primary)">
          <span class="c-blue">${IC.select}</span>Team & App Configuration
          <span style="background:rgba(15,98,254,.15);color:var(--ibm-blue-50);font-size:10px;font-weight:600;padding:2px 8px;border-radius:var(--radius-md);border:1px solid rgba(15,98,254,.2)">DYNAMIC</span>
        </div>
        <input type="file" id="dc-import-appdata-input" style="display:none" accept=".js,.txt" />
      </div>

      <!-- ── App Identity ── -->
      <details class="mb-16">
        <summary style="font-size:13px;font-weight:700;color:var(--text-primary);cursor:pointer;padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px">
          <span class="c-blue">${IC.shield}</span> App Identity &amp; Settings
        </summary>
        <div style="padding:12px 0 0 4px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><label class="filter-label">App Title</label><input id="dc-cfg-title" class="form-input" class="fs-12" value="${Utils.escHtml(appCfg.appTitle||'IBM Cases')}"/></div>
          <div><label class="filter-label">Team Name</label><input id="dc-cfg-team" class="form-input" class="fs-12" value="${Utils.escHtml(appCfg.teamName||'')}"/></div>
          <div><label class="filter-label">Work Item Base URL</label><input id="dc-cfg-wiurl" class="form-input" class="fs-12" value="${Utils.escHtml(appCfg.defectBaseUrl||'')}"/></div>
          <div><label class="filter-label">Internal Account ID</label><input id="dc-cfg-acct" class="form-input" class="fs-12" placeholder="e.g. 881812" value="${Utils.escHtml(appCfg.customerAccountId||DC.customerAccountId())}"/></div>
          <div><label class="filter-label">Case Number Pattern (regex)</label><input id="dc-cfg-cnpat" class="form-input" class="fs-12" placeholder="e.g. ^TS\\d{8,}" value="${Utils.escHtml(appCfg.caseNumberPattern||'')}"/></div>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <button id="dc-save-app-cfg" class="btn btn-primary btn-sm">${IC.save} Save App Settings</button>
          <button id="dc-export-app-xlsx" class="btn btn-secondary btn-sm" class="fs-12">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Export Excel
          </button>
          <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import Excel
            <input id="dc-import-app-xlsx" type="file" accept=".xlsx,.xls" class="hidden"/>
          </label>
          <span class="text-meta">Columns: <code>app_title, team_name, customer_account_id, wi_base_url, case_number_pattern, products</code></span>
        </div>
      </details>

      <!-- ── Team Members ── -->
      <details class="mb-16">
        <summary style="font-size:13px;font-weight:700;color:var(--text-primary);cursor:pointer;padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px">
          <span class="c-blue">${IC.select}</span> Team Members <span style="font-size:11px;font-weight:normal;color:var(--text-tertiary);margin-left:4px">${members.length} members</span>
        </summary>
        <div style="overflow-x:auto;margin-top:8px">
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead><tr style="background:var(--bg-layer-2)">
              <th style="padding:6px 8px;text-align:left;font-size:11px;color:var(--text-tertiary)">Display Name</th>
              <th style="padding:6px 8px;text-align:left;font-size:11px;color:var(--text-tertiary)">Email</th>
              <th style="width:40px"></th>
            </tr></thead>
            <tbody id="dc-members-tbody">${memberRows}</tbody>
          </table>
          <button id="dc-add-member" class="btn btn-ghost btn-sm" style="margin-top:8px;font-size:12px">${IC.plus} Add Member</button>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <button id="dc-save-members" class="btn btn-primary btn-sm">${IC.save} Save Team Members</button>
          <button id="dc-export-members-xlsx" class="btn btn-secondary btn-sm" class="fs-12">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Export Excel
          </button>
          <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import Excel
            <input id="dc-import-members-xlsx" type="file" accept=".xlsx,.xls" class="hidden"/>
          </label>
          <span class="text-meta">Columns: <code>name, email</code></span>
        </div>
      </details>

      <!-- ── ALM Responsible ── -->
      <details class="mb-16">
        <summary style="font-size:13px;font-weight:700;color:var(--text-primary);cursor:pointer;padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px">
          <span class="c-blue">${IC.reassign}</span> ALM Line Assignments
          <span style="font-size:11px;font-weight:normal;color:var(--text-tertiary);margin-left:4px">${alm.length} lines</span>
          <span style="margin-left:auto;font-size:10px;font-weight:400;color:var(--ibm-blue-50);padding-right:4px;display:flex;align-items:center;gap:4px">
            ${IC.link} synced with Info Dashboard › ALM Lines
          </span>
        </summary>
        <div style="margin:8px 0 10px;padding:8px 10px;background:var(--ibm-blue-10);border-left:3px solid var(--ibm-blue-50);border-radius:0 4px 4px 0;font-size:11px;color:var(--text-secondary);line-height:1.5">
          All 9 fields here map 1-to-1 with the <strong>Information Dashboard → ALM Lines — Customer Contact &amp; Responsible</strong> section.
          When you save the ALM Line Assignments section or import any Excel and save, the Info Dashboard reads this data automatically and stores it in the <strong>ALM Lines — Customer Contact &amp; Responsible</strong> section.
        </div>
        <div style="overflow-x:auto;margin-top:4px">
          <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:900px">
            <thead>
              <tr style="background:var(--bg-layer-2);border-bottom:2px solid var(--border-subtle)">
                <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">ALM Line</th>
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
            <tbody id="dc-alm-tbody">${almRows}</tbody>
          </table>
          <button id="dc-add-alm" class="btn btn-ghost btn-sm" style="margin-top:8px;font-size:12px">${IC.plus} Add ALM Line</button>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <button id="dc-save-alm" class="btn btn-primary btn-sm">${IC.save} Save ALM Lines</button>
          <button id="dc-export-alm-xlsx" class="btn btn-secondary btn-sm" class="fs-12">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Export Excel
          </button>
          <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import Excel
            <input id="dc-import-alm-xlsx" type="file" accept=".xlsx,.xls" class="hidden"/>
          </label>
          <span class="text-meta">Saved data is immediately reflected in the Information Dashboard.</span>
        </div>
      </details>

      <!-- ── Escalation Contacts ── -->
      <details style="margin-bottom:4px">
        <summary style="font-size:13px;font-weight:700;color:var(--text-primary);cursor:pointer;padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px">
          <span class="c-blue">${IC.warn}</span> Escalation Contacts
        </summary>
        <div style="padding:12px 0 0 4px">
          <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">IBM Expertise Connect</div>
          <div id="dc-ec-list" data-escrow="ec">${escalationList(ec, 'dc-ec')}</div>
          <button id="dc-add-ec" class="btn btn-ghost btn-sm" style="font-size:11px;margin-bottom:12px">${IC.plus} Add</button>

          <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">BD Escalation</div>
          <div id="dc-bd-list" data-escrow="bd">${escalationList(bd, 'dc-bd')}</div>
          <button id="dc-add-bd" class="btn btn-ghost btn-sm" style="font-size:11px;margin-bottom:12px">${IC.plus} Add</button>

          <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Team Lead</div>
          <div id="dc-tl-list" data-escrow="tl">${escalationList(tl, 'dc-tl')}</div>
          <button id="dc-add-tl" class="btn btn-ghost btn-sm" style="font-size:11px;margin-bottom:12px">${IC.plus} Add</button>

          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px">
            <button id="dc-save-esc" class="btn btn-primary btn-sm">${IC.save} Save Escalation Contacts</button>
            <button id="dc-export-esc-xlsx" class="btn btn-secondary btn-sm" class="fs-12">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Export Excel
            </button>
            <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import Excel
              <input id="dc-import-esc-xlsx" type="file" accept=".xlsx,.xls" class="hidden"/>
            </label>
            <span class="text-meta">Columns: <code>group, name, email</code> — group: <code>ec, bd, tl</code></span>
          </div>
        </div>
      </details>
      <!-- ── IBM Directory ── -->
      <details class="mt-12">
        <summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--text-primary);padding:10px 0;list-style:none;display:flex;align-items:center;gap:6px">
          <span class="c-blue">${IC.tag}</span> IBM Directory
          <span style="font-size:11px;font-weight:400;color:var(--text-tertiary);margin-left:4px">IBM Colleagues &amp; contacts shown in the Info dashboard</span>
        </summary>
        <div class="mt-8">
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:8px">
            Add or remove contacts per group. Format each line as <code>Name | email@ibm.com</code>. Use Export/Import to migrate between machines.
          </div>
          <div id="dc-ibmdir-groups" style="display:flex;flex-direction:column;gap:10px"></div>
          <button id="dc-add-ibmdir-group" class="btn btn-ghost btn-sm" style="margin-top:8px;font-size:12px">${IC.plus} Add Group</button>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <button id="dc-save-ibmdir" class="btn btn-primary btn-sm">${IC.save} Save IBM Directory</button>
            <button id="dc-export-ibmdir-xlsx" class="btn btn-secondary btn-sm" class="fs-12">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export Excel
            </button>
            <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import Excel
              <input id="dc-import-ibmdir-xlsx" type="file" accept=".xlsx,.xls" class="hidden"/>
            </label>
            <span class="text-meta">Columns: <code>group, name, email</code></span>
          </div>
        </div>
      </details>

      <!-- ── Customer Products ── -->
      <details id="dc-customer-products-section" class="mt-12">
        <summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--text-primary);padding:10px 0;list-style:none;display:flex;align-items:center;gap:6px">
          <span class="c-blue">${IC.pkg}</span> Customer Products
          <span style="font-size:11px;font-weight:400;color:var(--text-tertiary);margin-left:4px">Products used by customers — drives Customer Cases filtering</span>
          <span id="dc-products-badge" style="background:rgba(15,98,254,.15);color:var(--ibm-blue-50);font-size:10px;font-weight:600;padding:2px 8px;border-radius:var(--radius-md);border:1px solid rgba(15,98,254,.2);margin-left:6px">${products.length}</span>
        </summary>
        <div class="mt-8">

          <!-- Info box -->
          <div style="margin-bottom:12px;padding:10px 12px;background:var(--ibm-blue-10);border-left:3px solid var(--ibm-blue-50);border-radius:0 4px 4px 0;font-size:var(--font-size-xs);color:var(--text-secondary);line-height:1.6">
            <strong>How this works:</strong> Customer Cases are rows from the Excel where
            <code style="background:rgba(15,98,254,.1);padding:1px 5px;border-radius:var(--radius-xs)">Product</code> is in this list
            <strong>AND</strong>
            <code style="background:rgba(15,98,254,.1);padding:1px 5px;border-radius:var(--radius-xs)">Owner</code> is <em>not</em> a configured Team Member.
            Changing this list immediately updates the Customer Cases count on the Overview and the Customer Cases dashboard.
          </div>

          <!-- Product list area -->
          <div class="mb-10">
            <label class="filter-label" style="margin-bottom:6px;display:block">Products (one per line)</label>
            <textarea id="dc-cfg-products" class="form-input"
              style="width:100%;box-sizing:border-box;min-height:120px;resize:vertical;font-size:var(--font-size-sm);font-family:var(--font-mono);line-height:1.7"
              placeholder="Engineering Lifecycle Management Base&#10;Engineering Requirements Management DOORS Next&#10;Engineering Test Management">${products.map(p=>Utils.escHtml(p)).join('\n')}</textarea>
            <div style="margin-top:5px;font-size:11px;color:var(--text-tertiary)">
              Each line = one product value. Must match exactly the <strong>Product</strong> column in the uploaded Excel.
            </div>
          </div>

          <!-- Detect from Excel -->
          <div style="margin-bottom:12px;padding:10px 12px;background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;display:flex;align-items:center;gap:6px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              Auto-detect from uploaded Excel
            </div>
            <div style="font-size:var(--font-size-xs);color:var(--text-tertiary);margin-bottom:8px">
              Upload your cases Excel to automatically detect all unique <strong>Product</strong> column values and pre-fill the list above.
            </div>
            <div class="row-wrap-8">
              <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Scan Excel for Products
                <input id="dc-detect-products-xlsx" type="file" accept=".xlsx,.xls,.csv" class="hidden"/>
              </label>
              <button id="dc-products-select-all" class="btn btn-ghost btn-sm" class="fs-12">Select All Detected</button>
              <span id="dc-detect-products-status" class="fs-12 c-tertiary"></span>
            </div>
            <!-- Detected products checklist -->
            <div id="dc-detected-products-list" style="margin-top:10px;display:none"></div>
          </div>

          <!-- Action buttons -->
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <button id="dc-save-products" class="btn btn-primary btn-sm">${IC.save} Save Customer Products</button>
            <button id="dc-export-products-xlsx" class="btn btn-secondary btn-sm" class="fs-12">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Export Excel
            </button>
            <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import Excel
              <input id="dc-import-products-xlsx" type="file" accept=".xlsx,.xls" class="hidden"/>
            </label>
            <span class="text-meta">Columns: <code>product</code></span>
          </div>
        </div>
      </details>

      <!-- ── Weekly Tracker Historical Data ── -->
      <details class="mt-12">
        <summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--text-primary);padding:10px 0;list-style:none;display:flex;align-items:center;gap:6px">
          <span class="c-blue">${IC.tag}</span> Weekly Tracker — Historical Data
          <span style="font-size:11px;font-weight:400;color:var(--text-tertiary);margin-left:4px">Export, import, reset or clear the closed-case history</span>
        </summary>
        <div class="mt-8">
          <div id="dc-wt-stats" style="font-size:12px;color:var(--text-secondary);margin-bottom:10px"></div>

          <!-- Export Excel -->
          <div class="mb-10">
            <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">Export</div>
            <div class="d-flex gap-8 flex-wrap">
              <button id="dc-wt-export-xlsx" class="btn btn-secondary btn-sm" class="fs-12">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export as Excel
              </button>
            </div>
          </div>

          <!-- Import Excel — match Case Number → ingest Comments to server -->
          <div class="mb-10">
            <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">Import Comments from Excel</div>

            <!-- How it works card -->
            <div style="background:var(--bg-layer);border:1px solid var(--border-subtle);border-left:3px solid var(--blue);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:10px;font-size:11px;color:var(--text-secondary);line-height:1.7">
              <div style="font-weight:600;color:var(--text-primary);margin-bottom:6px;font-size:12px">📋 How this works</div>
              <div style="margin-bottom:4px">1. Prepare an <strong>.xlsx</strong> or <strong>.xlsm</strong> file with <strong>exactly these 3 columns</strong> (header row required):</div>
              <div style="font-family:monospace;background:var(--bg-app);border:1px solid var(--border-subtle);border-radius:var(--radius-xs);padding:6px 10px;margin:6px 0;font-size:11px;color:var(--text-primary)">
                SL.No &nbsp;&nbsp;|&nbsp;&nbsp; Case Number &nbsp;&nbsp;|&nbsp;&nbsp; Comments<br/>
                1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp; TS020884738 &nbsp;&nbsp;|&nbsp;&nbsp; No response from user
              </div>
              <div style="margin-bottom:2px">2. The system looks up each <strong>Case Number</strong> in the Weekly Tracker and fills in the <strong>Comments</strong> column.</div>
              <div style="margin-bottom:2px">3. <strong>If a case already has a comment, it will NOT be overwritten</strong> — only blank comments are filled.</div>
              <div style="color:var(--orange);margin-top:4px">⚠ Only <strong>.xlsx / .xlsm</strong> files are accepted. CSV and log files are not supported for this import.</div>
            </div>

            <div class="row-wrap-8">
              <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import Excel (.xlsx / .xlsm)
                <input id="dc-wt-import-excel" type="file" accept=".xlsx,.xlsm" class="hidden"/>
              </label>
            </div>
            <div id="dc-wt-import-status" style="margin-top:8px;font-size:12px;display:none"></div>
          </div>

          <!-- Danger Zone -->
          <div style="border-top:1px solid var(--border-subtle);padding-top:10px">
            <div style="font-size:12px;font-weight:600;color:var(--orange);margin-bottom:6px">&#x26a0; Danger Zone</div>
            <div class="d-flex gap-8 flex-wrap">
              <button id="dc-wt-reset-seed" class="btn btn-ghost btn-sm" style="font-size:12px;border-color:var(--orange);color:var(--orange)">
                Reset to Built-in Seed Data
              </button>
              <button id="dc-wt-clear-all" class="btn btn-danger btn-sm" class="fs-12">
                Clear All Tracker Data
              </button>
            </div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:6px">
              <strong>Reset</strong> re-applies the built-in seed (2025&#x2013;2026 historical data). <strong>Clear</strong> removes <em>all</em> tracker entries from this browser and clears all server-stored comments.
            </div>
          </div>
        </div>
      </details>

      <!-- ── IBM RFE Tracking Data ── -->
      <details class="mt-12">
        <summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--text-primary);padding:10px 0;list-style:none;display:flex;align-items:center;gap:6px">
          <span class="c-blue">${IC.tag}</span> IBM RFE Tracking — Request for Enhancement Data
          <span style="font-size:11px;font-weight:400;color:var(--text-tertiary);margin-left:4px">Import and manage Request for Enhancement tracking data</span>
        </summary>
        <div class="mt-8">
          <div id="rfe-import-status" style="font-size:12px;color:var(--text-secondary);margin-bottom:10px"></div>

          <!-- Import CSV -->
          <div class="mb-10">
            <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">Import RFE Data</div>

            <!-- How it works card -->
            <div style="background:var(--bg-layer);border:1px solid var(--border-subtle);border-left:3px solid var(--blue);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:10px;font-size:11px;color:var(--text-secondary);line-height:1.7">
              <div style="font-weight:600;color:var(--text-primary);margin-bottom:6px;font-size:12px">📋 How this works</div>
              <div style="margin-bottom:4px">1. Export your RFE data from Aha! as a <strong>.csv</strong> file with the following columns:</div>
              <div style="font-family:monospace;background:var(--bg-app);border:1px solid var(--border-subtle);border-radius:var(--radius-xs);padding:6px 10px;margin:6px 0;font-size:11px;color:var(--text-primary);overflow-x:auto">
                Idea Reference, Idea Name, Product, Workflow State, Is Complete, URL, Vote Count, Comment Count, Created At, Updated At
              </div>
              <div style="margin-bottom:2px">2. Upload the CSV file to ingest the RFE data into the tracking dashboard.</div>
              <div style="margin-bottom:2px">3. The data will be saved locally and displayed in the RFE Tracking dashboard.</div>
            </div>

            <div class="row-wrap-8">
              <label class="btn btn-secondary btn-sm" class="cursor-p-fs12">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-va"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import CSV File
                <input id="rfe-import-csv" type="file" accept=".csv,.xlsx,.xls" class="hidden"/>
              </label>
            </div>
            <div id="rfe-csv-import-status" style="margin-top:8px;font-size:12px;display:none"></div>
          </div>

          <!-- Data Persistence Status -->
          <div style="border-top:1px solid var(--border-subtle);padding-top:10px">
            <div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
                <div>
                  <div style="font-size:12px;color:var(--text-secondary);font-weight:600;margin-bottom:4px">💾 Data Persistence</div>
                  <div style="font-size:13px;color:var(--text-primary)">
                    <strong>Total RFEs loaded:</strong> <span id="rfe-total-count" style="color:var(--accent);font-weight:700">0</span>
                  </div>
                  <div style="font-size:11px;color:var(--text-tertiary);margin-top:6px">
                    ✅ Stored locally in browser<br/>
                    📅 <span id="rfe-last-updated">Not yet imported</span>
                  </div>
                </div>
                <div style="text-align:right">
                  <button id="rfe-clear-data-btn" class="btn btn-danger btn-sm" style="font-size:11px;padding:6px 10px" title="Delete all RFE data">
                    🗑️ Clear All
                  </button>
                </div>
              </div>
            </div>

            <!-- Data Integrity -->
            <div style="font-size:11px;color:var(--text-tertiary);padding:10px;background:rgba(25,128,56,.08);border-radius:var(--radius-sm);border-left:3px solid var(--green)">
              <strong style="color:var(--green)">✓ Data Integrity:</strong> RFE data is automatically backed up to browser localStorage and tracked in Admin change history. Export regularly for offsite backup.
            </div>
          </div>
        </div>
      </details>    </div>`;
  }

  function _wireTeamConfigEvents() {
    const DC = (typeof DynamicConfig !== "undefined") ? DynamicConfig : null;
    if (!DC) return;

    // ── Excel Reassignment Import — wired once here, survive re-renders via delegation ──
    (function _wireXlsxReassign() {
      const tabEl = document.getElementById("tab-admin");
      if (!tabEl || tabEl._xlsxWired) return;
      tabEl._xlsxWired = true; // prevent duplicate listeners across re-renders

      // File chosen → parse and show preview
      tabEl.addEventListener("change", async function(e) {
        if (!e.target || e.target.id !== "bulk-reassign-xlsx-input") return;
        const file    = e.target.files?.[0];
        const previewEl = document.getElementById("bulk-reassign-xlsx-preview");
        const applyBtn  = document.getElementById("bulk-reassign-xlsx-btn");
        const clearBtn  = document.getElementById("bulk-reassign-xlsx-clear");
        _xlsxImportRows = [];
        if (applyBtn) { applyBtn.disabled = true; applyBtn.style.opacity = ".4"; }
        if (clearBtn) clearBtn.style.display = "none";
        if (!file) { if (previewEl) previewEl.innerHTML = ""; return; }

        if (typeof XLSX === "undefined") {
          showToast("Excel library not ready — reload the page and try again", "warning");
          e.target.value = ""; return;
        }

        try {
          const buf  = await file.arrayBuffer();
          const wb   = XLSX.read(buf, { type: "array" });
          const ws   = wb.Sheets[wb.SheetNames[0]];
          const raw  = XLSX.utils.sheet_to_json(ws, { defval: "" });

          if (!raw.length) { showToast("No data rows found in file", "warning"); e.target.value = ""; return; }

          const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const keys = Object.keys(raw[0]);
          const cnKey    = keys.find(k => ["casenumber","caseno","caseid","case"].includes(norm(k)));
          const ownerKey = keys.find(k => ["caseowner","owner","newowner","assignto","assignedto","assignee"].includes(norm(k)));

          if (!cnKey)    { showToast("Could not find 'Case Number' column", "warning"); e.target.value = ""; return; }
          if (!ownerKey) { showToast("Could not find 'Case Owner' column", "warning");  e.target.value = ""; return; }

          const caseMap = {};
          Data.allCases().forEach(r => { caseMap[(r["Case Number"] || "").trim().toUpperCase()] = r; });

          _xlsxImportRows = raw.map(row => {
            const cn    = String(row[cnKey]    || "").trim();
            const owner = String(row[ownerKey] || "").trim();
            if (!cn || !owner) return null;
            const existing = caseMap[cn.toUpperCase()];
            let status, currentOwner = "";
            if (!existing)                         { status = "not-found"; }
            else if (existing.Owner === owner)     { status = "same"; currentOwner = existing.Owner || ""; }
            else                                   { status = "ok";   currentOwner = existing.Owner || ""; }
            return { caseNumber: cn, newOwner: owner, currentOwner, status };
          }).filter(Boolean);

          if (!_xlsxImportRows.length) {
            showToast("No valid rows found — check column names", "warning");
            e.target.value = ""; return;
          }

          const okRows   = _xlsxImportRows.filter(r => r.status === "ok");
          const sameRows = _xlsxImportRows.filter(r => r.status === "same");
          const notFound = _xlsxImportRows.filter(r => r.status === "not-found");

          const statusBadge = s => {
            if (s === "ok")        return `<span style="background:var(--green-bg);color:var(--green);font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-xs)">✓ Will Reassign</span>`;
            if (s === "same")      return `<span style="background:var(--bg-layer-2);color:var(--text-disabled);font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-xs)">Same Owner</span>`;
            if (s === "not-found") return `<span style="background:var(--red-bg);color:var(--red);font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-xs)">Not Found</span>`;
            return "";
          };

          const previewRows = _xlsxImportRows.slice(0, 50);
          const moreCount   = _xlsxImportRows.length - previewRows.length;

          if (previewEl) previewEl.innerHTML = `
            <div style="margin-bottom:8px;display:flex;gap:10px;flex-wrap:wrap;font-size:12px">
              <span style="color:var(--green);font-weight:600">✓ ${okRows.length} to reassign</span>
              ${sameRows.length ? `<span class="c-disabled">— ${sameRows.length} same owner</span>` : ""}
              ${notFound.length ? `<span class="c-red">✗ ${notFound.length} not found</span>` : ""}
            </div>
            <div style="overflow-x:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-md);max-height:280px;overflow-y:auto">
              <table style="width:100%;border-collapse:collapse;font-size:12px">
                <thead><tr style="background:var(--bg-layer-2);position:sticky;top:0;z-index:1">
                  <th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Case Number</th>
                  <th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Current Owner</th>
                  <th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">New Owner</th>
                  <th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Status</th>
                </tr></thead>
                <tbody>
                  ${previewRows.map((r, i) => `
                    <tr style="background:${i%2===0?'var(--bg-ui)':'var(--bg-layer)'}">
                      <td style="padding:6px 10px;font-family:var(--font-mono);font-weight:700;color:var(--ibm-blue-50)">${Utils.escHtml(r.caseNumber)}</td>
                      <td style="padding:6px 10px;color:var(--text-secondary)">${Utils.escHtml(r.currentOwner || "—")}</td>
                      <td style="padding:6px 10px;color:var(--text-primary);font-weight:600">${Utils.escHtml(r.newOwner)}</td>
                      <td style="padding:6px 10px">${statusBadge(r.status)}</td>
                    </tr>`).join("")}
                  ${moreCount > 0 ? `<tr><td colspan="4" style="padding:8px 10px;text-align:center;font-size:11px;color:var(--text-disabled);font-style:italic">… and ${moreCount} more rows</td></tr>` : ""}
                </tbody>
              </table>
            </div>`;

          if (okRows.length > 0) {
            if (applyBtn) {
              applyBtn.disabled = false;
              applyBtn.style.opacity = "1";
              applyBtn.innerHTML = `${IC.reassign} Apply ${okRows.length} Reassignment${okRows.length !== 1 ? "s" : ""}`;
            }
          } else {
            showToast("No reassignable rows — all already assigned or not found", "warning");
          }
          if (clearBtn) clearBtn.style.display = "";

        } catch(err) {
          showToast("Failed to read file: " + err.message, "danger");
          if (previewEl) previewEl.innerHTML = "";
        }
        e.target.value = "";
      });

      // Apply button — delegated click
      tabEl.addEventListener("click", function(e) {
        const btn = e.target.closest("#bulk-reassign-xlsx-btn");
        if (!btn || btn.disabled) return;

        const okRows = _xlsxImportRows.filter(r => r.status === "ok");
        if (!okRows.length) { showToast("No rows to reassign", "warning"); return; }

        const caseNums = okRows.map(r => r.caseNumber);

        try {
          // Atomic: one snapshot, update all in memory, one persist
          Data.snapshotForAdmin();
          const allCases = Data.allCases();

          okRows.forEach(r => {
            const idx = allCases.findIndex(c => c["Case Number"] === r.caseNumber);
            if (idx === -1) return;
            const old = allCases[idx].Owner;
            r.oldOwner = old; // capture for log
            // Preserve original owner for audit display
            if (!allCases[idx]._originalOwner) allCases[idx]._originalOwner = old;
            allCases[idx].Owner = r.newOwner;
            allCases[idx]._ownerOverride = true;
            allCases[idx]._overrideTs = new Date().toISOString();
            Data.changeHistory().unshift({
              id: Date.now() + Math.random(),
              caseNumber: r.caseNumber,
              field: "Owner",
              oldValue: old,
              newValue: r.newOwner,
              updatedBy: "Admin",
              timestamp: new Date().toLocaleString()
            });
          });

          // Push to reassign log
          if (Data.addReassignLogEntries) {
            const logEntries = okRows.map(r => {
              const c = allCases.find(x => x["Case Number"] === r.caseNumber) || {};
              return { caseNum: r.caseNumber, oldOwner: r.oldOwner || "", newOwner: r.newOwner,
                       title: c.Title || c.title || "", ts: new Date().toLocaleString() };
            });
            Data.addReassignLogEntries(logEntries);
          }
          Data.persistNow();
          _syncWeeklyTrackerOwners();

          showToast(`✓ Reassigned ${okRows.length} case${okRows.length !== 1 ? "s" : ""} successfully`, "success");
          Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'Excel Bulk Reassign', oldValue: '', newValue: `${okRows.length} case(s) reassigned via Excel import`, updatedBy: 'Admin', timestamp: new Date().toLocaleString() });

          App.updateHeader();
          _xlsxImportRows = [];

          const applyBtn2  = document.getElementById("bulk-reassign-xlsx-btn");
          const clearBtn2  = document.getElementById("bulk-reassign-xlsx-clear");
          const previewEl2 = document.getElementById("bulk-reassign-xlsx-preview");
          if (applyBtn2) { applyBtn2.disabled = true; applyBtn2.style.opacity = ".4"; applyBtn2.innerHTML = `${IC.reassign} Apply Import`; }
          if (clearBtn2) clearBtn2.style.display = "none";
          if (previewEl2) previewEl2.innerHTML = "";
          render();

        } catch(err) {
          showToast("Reassignment failed: " + err.message, "danger");
          console.error("Excel reassign error:", err);
        }
      });

      // Clear button — delegated click
      tabEl.addEventListener("click", function(e) {
        if (!e.target.closest("#bulk-reassign-xlsx-clear")) return;
        _xlsxImportRows = [];
        const applyBtn  = document.getElementById("bulk-reassign-xlsx-btn");
        const clearBtn  = document.getElementById("bulk-reassign-xlsx-clear");
        const previewEl = document.getElementById("bulk-reassign-xlsx-preview");
        const fileInput = document.getElementById("bulk-reassign-xlsx-input");
        if (applyBtn)  { applyBtn.disabled = true; applyBtn.style.opacity = ".4"; applyBtn.innerHTML = `${IC.reassign} Apply Import`; }
        if (clearBtn)  clearBtn.style.display = "none";
        if (previewEl) previewEl.innerHTML = "";
        if (fileInput) fileInput.value = "";
      });
    })();

    // F13: Mark dirty when any admin input/textarea is changed
    const adminTab = document.getElementById("tab-admin");
    if (adminTab) {
      adminTab.addEventListener("input", () => _setDirty(true), { capture: true });
      adminTab.addEventListener("change", () => _setDirty(true), { capture: true });
    }

    // ── Propagate admin config changes to the entire app ──────────────
    // Called after every successful save so all dashboards reflect the new data.
    function _refreshAllDashboards() {
      try { Contacts.refresh(); }      catch(e) {}
      try { Data.refreshTeamIndex(); } catch(e) {}
      // Refresh app title, team name, breadcrumb & browser tab title live
      try { if (typeof App !== "undefined") App.refreshAppIdentity(); } catch(e) {}
      try { if (typeof App !== "undefined") App.updateHeader(); }       catch(e) {}
      // Re-render every dashboard so ALL config changes are immediately visible
      try { if (typeof DashOverview    !== "undefined") DashOverview.render();    } catch(e) {}
      try { if (typeof DashInfo        !== "undefined") DashInfo.render();        } catch(e) {}
      try { if (typeof DashMembers     !== "undefined") DashMembers.render();     } catch(e) {}
      try { if (typeof DashTeam        !== "undefined") DashTeam.render();        } catch(e) {}
      try { if (typeof DashClosed      !== "undefined") DashClosed.render();      } catch(e) {}
      try { if (typeof DashCreated     !== "undefined") DashCreated.render();     } catch(e) {}
      try { if (typeof DashCustomer    !== "undefined") DashCustomer.render();    } catch(e) {}
      try { if (typeof DashPerformance !== "undefined") DashPerformance.render(); } catch(e) {}
      try { if (typeof DashKnowledgeHub !== "undefined") DashKnowledgeHub.render(); } catch(e) {}
      try { if (typeof DashRFEAdvanced  !== "undefined") DashRFEAdvanced.render();  } catch(e) {}
      try { if (typeof DashRFETracking  !== "undefined") DashRFETracking.render();  } catch(e) {}
      try { if (typeof DashChangelog   !== "undefined") DashChangelog.render();   } catch(e) {}
      // Re-enrich Weekly Tracker so owner renames and product/config changes reflect immediately
      try {
        if (typeof DashWeeklyTracker !== "undefined") {
          const cases = (typeof Data !== "undefined") ? Data.allCases() : [];
          if (cases && cases.length) {
            DashWeeklyTracker.enrichFromCases(cases);
          } else {
            DashWeeklyTracker.render();
          }
        }
      } catch(e) {}
    }

    // ══════════════════════════════════════════════════════════════════
    //  SHARED XLSX HELPERS
    // ══════════════════════════════════════════════════════════════════
    function _xlsxAvail() {
      return typeof XLSX !== "undefined";
    }

    // Parse an uploaded .xlsx/.xls file → array of row-objects keyed by normalised header
    function _readXlsx(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const wb = XLSX.read(e.target.result, { type: "array" });
            // Read ALL sheets and merge rows (fixes multi-sheet workbooks like Weekly Tracker)
            let raw = [];
            wb.SheetNames.forEach(sheetName => {
              const ws = wb.Sheets[sheetName];
              const sheetRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
              raw = raw.concat(sheetRows);
            });
            // Normalise keys: lowercase, strip non-alphanumeric
            const rows = raw.map(r => {
              const out = {};
              Object.entries(r).forEach(([k, v]) => {
                out[k.toLowerCase().replace(/[^a-z0-9]/g, "")] = String(v ?? "").trim();
              });
              return out;
            });
            resolve(rows);
          } catch(err) { reject(err); }
        };
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsArrayBuffer(file);
      });
    }

    // Get a cell value by trying multiple normalised aliases
    function _col(row, ...aliases) {
      for (const a of aliases) {
        const k = a.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (row[k] !== undefined && row[k] !== "") return row[k];
      }
      return "";
    }

    // Download an array-of-arrays as .xlsx
    function _downloadXlsx(aoa, filename, sheetName) {
      if (!_xlsxAvail()) { showToast("Excel library not loaded yet, try again in a moment", "warning"); return; }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
      XLSX.writeFile(wb, filename);
    }

    // ── App Identity: Export Excel ──────────────────────────────────────
    document.getElementById("dc-export-app-xlsx")?.addEventListener("click", () => {
      const appCfgNow = DC.appConfig ? DC.appConfig() : {};
      _downloadXlsx([
        ["app_title","team_name","customer_account_id","wi_base_url","case_number_pattern"],
        [
          document.getElementById("dc-cfg-title")?.value  || appCfgNow.appTitle             || "",
          document.getElementById("dc-cfg-team")?.value   || appCfgNow.teamName             || "",
          document.getElementById("dc-cfg-acct")?.value   || appCfgNow.customerAccountId    || "",
          document.getElementById("dc-cfg-wiurl")?.value  || appCfgNow.defectBaseUrl        || "",
          document.getElementById("dc-cfg-cnpat")?.value  || appCfgNow.caseNumberPattern    || "",
        ]
      ], "app-settings.xlsx", "App Settings");
    });

    // ── App Identity: Import Excel ──────────────────────────────────────
    document.getElementById("dc-import-app-xlsx")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        if (!_xlsxAvail()) { showToast("Excel library not ready", "warning"); return; }
        const rows = await _readXlsx(file);
        if (!rows.length) { showToast("No data found in file", "warning"); e.target.value=""; return; }
        const row = rows[0];
        const title    = _col(row,"apptitle","app_title","title","appname");
        const team     = _col(row,"teamname","team_name","team");
        const acct     = _col(row,"customeraccountid","customer_account_id","accountid","account");
        const wiurl    = _col(row,"wibaseurl","wi_base_url","defectbaseurl","defect_base_url","baseurl","base_url");
        const cnpat    = _col(row,"casenumberpattern","case_number_pattern","cnpattern","cn_pattern","pattern");
        const products = _col(row,"products");
        if (title)    { const el=document.getElementById("dc-cfg-title");    if(el) el.value=title; }
        if (team)     { const el=document.getElementById("dc-cfg-team");     if(el) el.value=team; }
        if (acct)     { const el=document.getElementById("dc-cfg-acct");     if(el) el.value=acct; }
        if (wiurl)    { const el=document.getElementById("dc-cfg-wiurl");    if(el) el.value=wiurl; }
        if (cnpat)    { const el=document.getElementById("dc-cfg-cnpat");    if(el) el.value=cnpat; }
        if (products) { const el=document.getElementById("dc-cfg-products"); if(el) el.value=products.replace(/[;|]/g,"\n").replace(/\n\s*/g,"\n").trim(); } // Note: dc-cfg-products is now in Customer Products section
        showToast("App settings imported — click Save to apply", "success");
      } catch(err) { showToast("Import failed: "+err.message, "danger"); }
      e.target.value = "";
    });

    // ── Team Members: Export Excel ──────────────────────────────────────
    document.getElementById("dc-export-members-xlsx")?.addEventListener("click", () => {
      const rows = [...document.querySelectorAll("#dc-members-tbody tr")];
      const aoa  = [["name","email"]];
      rows.forEach(tr => {
        const name  = tr.querySelector(".dc-member-name")?.value?.trim()  || "";
        const email = tr.querySelector(".dc-member-email")?.value?.trim() || "";
        if (name) aoa.push([name, email]);
      });
      _downloadXlsx(aoa, "team-members.xlsx", "Team Members");
    });

    // ── Team Members: Import Excel ──────────────────────────────────────
    document.getElementById("dc-import-members-xlsx")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        if (!_xlsxAvail()) { showToast("Excel library not ready", "warning"); return; }
        const rows = await _readXlsx(file);
        if (!rows.length) { showToast("No data found in file", "warning"); e.target.value=""; return; }
        const tbody = document.getElementById("dc-members-tbody"); if (!tbody) return;
        const existingCount = tbody.querySelectorAll("tr").length;
        const newRows = rows.filter(row => !!_col(row,"name","displayname","display_name","member","fullname","full_name"));

        const _applyMemberRows = (replaceExisting) => {
          if (replaceExisting) tbody.innerHTML = "";
          let count = 0;
          newRows.forEach(row => {
            const name  = _col(row,"name","displayname","display_name","member","fullname","full_name");
            const email = _col(row,"email","emailaddress","email_address","mail");
            if (!name) return;
            const tr = document.createElement("tr"); count++;
            tr.innerHTML = `
              <td class="p-compact"><input class="form-input dc-member-name"  class="w-full-fs12 form-input" value="${Utils.escHtml(name)}"/></td>
              <td class="p-compact"><input class="form-input dc-member-email" style="width:100%;font-size:12px;font-family:var(--font-mono)" value="${Utils.escHtml(email)}"/></td>
              <td class="p-compact-c"><button class="btn btn-ghost btn-sm dc-remove-member" class="text-badge-red">✕</button></td>`;
            tbody.appendChild(tr);
          });
          showToast(`${replaceExisting ? "Replaced" : "Merged"} ${count} members — click Save to apply`, "success");
        };

        if (existingCount > 0) {
          _showImportMergeDialog({
            title: "📋 Team Members — Import",
            subtitle: "Existing members detected. Choose how to handle the import.",
            existingCount, newCount: newRows.length,
            onMerge:   () => _applyMemberRows(false),
            onReplace: () => _applyMemberRows(true),
            onCancel:  () => {}
          });
        } else {
          _applyMemberRows(true);
        }
      } catch(err) { showToast("Import failed: "+err.message, "danger"); }
      e.target.value = "";
    });

    // ── ALM Lines: Export Excel ─────────────────────────────────────────
    document.getElementById("dc-export-alm-xlsx")?.addEventListener("click", () => {
      const rows = [...document.querySelectorAll("#dc-alm-tbody tr")];
      const aoa  = [["alm_line","customer_names","customer_emails","line_responsible","line_email","case_responsible","case_responsible_email","case_proxy","case_proxy_email"]];
      rows.forEach(tr => {
        const alm = tr.querySelector(".dc-alm-line")?.value?.trim(); if (!alm) return;
        aoa.push([
          alm,
          tr.querySelector(".dc-alm-names")?.value?.trim()      || "",
          tr.querySelector(".dc-alm-emails")?.value?.trim()     || "",
          tr.querySelector(".dc-alm-bd")?.value?.trim()         || "",
          tr.querySelector(".dc-alm-bdemail")?.value?.trim()    || "",
          tr.querySelector(".dc-alm-ibm")?.value?.trim()        || "",
          tr.querySelector(".dc-alm-ibmemail")?.value?.trim()   || "",
          tr.querySelector(".dc-alm-proxy")?.value?.trim()      || "",
          tr.querySelector(".dc-alm-proxyemail")?.value?.trim() || "",
        ]);
      });
      _downloadXlsx(aoa, "alm-line-assignments.xlsx", "ALM Lines");
    });

    // ── ALM Lines: Import Excel ─────────────────────────────────────────
    document.getElementById("dc-import-alm-xlsx")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        if (!_xlsxAvail()) { showToast("Excel library not ready", "warning"); return; }
        const rows = await _readXlsx(file);
        if (!rows.length) { showToast("No data found in file", "warning"); e.target.value=""; return; }
        const tbody = document.getElementById("dc-alm-tbody"); if (!tbody) return;
        const teamEmails = (DC && DC.teamEmails) ? DC.teamEmails() : {};
        const existingCount = tbody.querySelectorAll("tr").length;
        let count = 0;

        const _applyAlmRows = (replaceExisting) => {
          if (replaceExisting) tbody.innerHTML = "";
          count = 0;
          rows.forEach((row, idx) => {
            const alm = _col(row,"almline","alm_line","alm","line"); if (!alm) return;
            const ibmName   = _col(row,"caseresponsible","case_responsible","ibm","caseresp");
            const proxyName = _col(row,"caseproxy","case_proxy","proxy");
            const ibmEmail   = _col(row,"caseresponsibleemail","case_responsible_email","ibmemail","ibm_email") || teamEmails[ibmName]   || "";
            const proxyEmail = _col(row,"caseproxyemail","case_proxy_email","proxyemail","proxy_email")          || teamEmails[proxyName] || "";
            const bg = idx % 2 === 0 ? "background:var(--bg-layer)" : "";
            const tr = document.createElement("tr"); if (bg) tr.style.cssText = bg;
            tr.innerHTML = `
              <td class="p-compact"><input class="form-input dc-alm-line"       style="width:96px;font-size:12px;font-family:var(--font-mono);font-weight:600" value="${Utils.escHtml(alm)}"/></td>
              <td class="p-compact"><input class="form-input dc-alm-names"      style="width:150px;font-size:11px" value="${Utils.escHtml(_col(row,"customernames","customer_names","names","customers"))}"/></td>
              <td class="p-compact"><input class="form-input dc-alm-emails"     style="width:180px;font-size:11px;font-family:var(--font-mono)" value="${Utils.escHtml(_col(row,"customeremails","customer_emails","emails"))}"/></td>
              <td class="p-compact"><input class="form-input dc-alm-bd"         class="filter-input-sm form-input" value="${Utils.escHtml(_col(row,"lineresponsible","line_responsible","bd","responsible"))}"/></td>
              <td class="p-compact"><input class="form-input dc-alm-bdemail"    class="filter-input-mono form-input" value="${Utils.escHtml(_col(row,"lineemail","line_email","bdemail","bd_email"))}"/></td>
              <td class="p-compact"><input class="form-input dc-alm-ibm"        class="filter-input-sm form-input" value="${Utils.escHtml(ibmName)}"
                oninput="(function(el){const em=el.closest('tr').querySelector('.dc-alm-ibmemail');if(!em||em.dataset.manual==='1')return;const name=el.value.trim();const found=(DC&&DC.teamEmails&&DC.teamEmails()[name])||''';';em.value=found;})(this)"/></td>
              <td class="p-compact"><input class="form-input dc-alm-ibmemail"   class="filter-input-mono form-input" value="${Utils.escHtml(ibmEmail)}"
                oninput="this.dataset.manual=this.value?'1':'0'"/></td>
              <td class="p-compact"><input class="form-input dc-alm-proxy"      class="filter-input-sm form-input" value="${Utils.escHtml(proxyName)}"
                oninput="(function(el){const em=el.closest('tr').querySelector('.dc-alm-proxyemail');if(!em||em.dataset.manual==='1')return;const name=el.value.trim();const found=(DC&&DC.teamEmails&&DC.teamEmails()[name])||''';';em.value=found;})(this)"/></td>
              <td class="p-compact"><input class="form-input dc-alm-proxyemail" class="filter-input-mono form-input" value="${Utils.escHtml(proxyEmail)}"
                oninput="this.dataset.manual=this.value?'1':'0'"/></td>
              <td class="p-compact-c"><button class="btn btn-ghost btn-sm dc-remove-alm" class="text-badge-red">✕</button></td>`;
            tbody.appendChild(tr); count++;
          });
          showToast(`${replaceExisting ? "Replaced" : "Merged"} ${count} ALM lines — click Save to apply`, "success");
        };

        if (existingCount > 0) {
          _showImportMergeDialog({
            title: "📋 ALM Line Assignments — Import",
            subtitle: "Existing ALM lines detected. Choose how to handle the import.",
            existingCount, newCount: rows.filter(r => !!_col(r,"almline","alm_line","alm","line")).length,
            onMerge:   () => _applyAlmRows(false),
            onReplace: () => _applyAlmRows(true),
            onCancel:  () => {}
          });
        } else {
          _applyAlmRows(true);
        }
      } catch(err) { showToast("Import failed: "+err.message, "danger"); }
      e.target.value = "";
    });

    // ── Escalation Contacts: Export Excel ──────────────────────────────
    document.getElementById("dc-export-esc-xlsx")?.addEventListener("click", () => {
      const aoa = [["group","name","email"]];
      const readGroup = (containerId, groupCode, nameCls, emailCls) => {
        document.querySelectorAll(`#${containerId} .${nameCls}`).forEach((inp, i) => {
          const name  = inp.value?.trim(); if (!name) return;
          const email = document.querySelectorAll(`#${containerId} .${emailCls}`)[i]?.value?.trim() || "";
          aoa.push([groupCode, name, email]);
        });
      };
      readGroup("dc-ec-list","ec","dc-ec-name","dc-ec-email");
      readGroup("dc-bd-list","bd","dc-bd-name","dc-bd-email");
      readGroup("dc-tl-list","tl","dc-tl-name","dc-tl-email");
      _downloadXlsx(aoa, "escalation-contacts.xlsx", "Escalation Contacts");
    });

    // ── Escalation Contacts: Import Excel ──────────────────────────────
    document.getElementById("dc-import-esc-xlsx")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        if (!_xlsxAvail()) { showToast("Excel library not ready", "warning"); return; }
        const rows = await _readXlsx(file);
        if (!rows.length) { showToast("No data found in file", "warning"); e.target.value=""; return; }
        const normaliseGroup = raw => {
          const v = (raw||"").toLowerCase().replace(/[^a-z]/g,"");
          if (["ec","expertiseconnect","ibm","ibmexpertiseconnect"].includes(v)) return "ec";
          if (["bd","bdescalation","escalation"].includes(v)) return "bd";
          if (["tl","teamlead","lead","tllead"].includes(v)) return "tl";
          return null;
        };
        const clsMap       = { ec:"dc-ec", bd:"dc-bd", tl:"dc-tl" };
        const containerMap = { ec:"dc-ec-list", bd:"dc-bd-list", tl:"dc-tl-list" };
        const grouped = { ec:[], bd:[], tl:[] };
        rows.forEach(row => {
          const name  = _col(row,"name","contactname","contact_name","fullname");
          const email = _col(row,"email","emailaddress","email_address","mail");
          const grp   = normaliseGroup(_col(row,"group","type","section","category"));
          if (name && grp) grouped[grp].push({ name, email });
        });
        const existingCount = Object.values(containerMap).reduce((sum, id) => sum + (document.getElementById(id)?.children.length || 0), 0);
        const newCount = grouped.ec.length + grouped.bd.length + grouped.tl.length;

        const _applyEscRows = (replaceExisting) => {
          if (replaceExisting) ["dc-ec-list","dc-bd-list","dc-tl-list"].forEach(id => { const el=document.getElementById(id); if(el) el.innerHTML=""; });
          let total = 0;
          Object.entries(grouped).forEach(([grp, contacts]) => {
            contacts.forEach(c => {
              const cls = clsMap[grp];
              const container = document.getElementById(containerMap[grp]); if (!container) return;
              const div = document.createElement("div");
              div.style.cssText = "display:flex;gap:6px;align-items:center;margin-bottom:6px";
              div.innerHTML = `
                <input class="form-input ${cls}-name"  class="flex-1-fs12" value="${Utils.escHtml(c.name)}" placeholder="Name"/>
                <input class="form-input ${cls}-email" class="flex-1-fs12" value="${Utils.escHtml(c.email)}" placeholder="Email"/>
                <button class="btn btn-ghost btn-sm" onclick="this.parentElement.remove()" class="text-badge-red">✕</button>`;
              container.appendChild(div); total++;
            });
          });
          showToast(`${replaceExisting?"Replaced":"Merged"} ${total} contacts (EC:${grouped.ec.length} BD:${grouped.bd.length} TL:${grouped.tl.length}) — click Save to apply`, "success");
        };

        if (existingCount > 0) {
          _showImportMergeDialog({
            title: "📋 Escalation Contacts — Import",
            subtitle: "Existing contacts detected. Choose how to handle the import.",
            existingCount, newCount,
            onMerge:   () => _applyEscRows(false),
            onReplace: () => _applyEscRows(true),
            onCancel:  () => {}
          });
        } else {
          _applyEscRows(true);
        }
      } catch(err) { showToast("Import failed: "+err.message, "danger"); }
      e.target.value = "";
    });

        // ── App Identity: Save Settings ────────────────────────────────────
    document.getElementById("dc-download-appdata")?.addEventListener("click", () => _downloadAppDataJs());
    document.getElementById("dc-import-appdata")?.addEventListener("click", () => {
      document.getElementById("dc-import-appdata-input")?.click();
    });
    document.getElementById("dc-import-appdata-input")?.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        _uploadAppDataJs(e.target.files[0]);
      }
      e.target.value = "";
    });
    document.getElementById("dc-download-tracker-seed")?.addEventListener("click", () => _downloadTrackerSeedJs());

    document.getElementById("dc-save-app-cfg")?.addEventListener("click", async () => {
      Data.snapshotForAdmin();
      const title   = document.getElementById("dc-cfg-title")?.value?.trim()  || "";
      const team    = document.getElementById("dc-cfg-team")?.value?.trim()   || "";
      const acct    = document.getElementById("dc-cfg-acct")?.value?.trim()   || "";
      const wiurl   = document.getElementById("dc-cfg-wiurl")?.value?.trim()  || "";
      const cnpat   = document.getElementById("dc-cfg-cnpat")?.value?.trim()  || "";

      // ── Diff: compare against currently saved values ─────────────────
      const prevCfg = DC.appConfig ? DC.appConfig() : {};
      const newCfg  = { appTitle: title, teamName: team, customerAccountId: acct, defectBaseUrl: wiurl, caseNumberPattern: cnpat };
      const cfgChanged = JSON.stringify(newCfg) !== JSON.stringify({
        appTitle: prevCfg.appTitle || "", teamName: prevCfg.teamName || "",
        customerAccountId: prevCfg.customerAccountId || "", defectBaseUrl: prevCfg.defectBaseUrl || "",
        caseNumberPattern: prevCfg.caseNumberPattern || "",
      });

      await _dcSave({ config: newCfg });

      if (cfgChanged && typeof Data !== "undefined" && typeof Data.pushChange === "function") {
        Data.pushChange({
          id: Date.now(), caseNumber: "CONFIG", field: "App Settings",
          oldValue: "previous", newValue: "identity settings",
          updatedBy: "Admin", timestamp: new Date().toLocaleString(),
        });
        render();
      }
      showToast(cfgChanged ? "App settings saved!" : "No changes to save.", cfgChanged ? "success" : "info");
      if (cfgChanged) setTimeout(_downloadAppDataJs, 500);
      if (cfgChanged) {
        _refreshAllDashboards();

      }
    });

    // ── Team Members: Add Row ────────────────────────────────────────────
    document.getElementById("dc-add-member")?.addEventListener("click", () => {
      const tbody = document.getElementById("dc-members-tbody"); if (!tbody) return;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-sm"><input class="form-input dc-member-name"  class="w-full-fs12 form-input" placeholder="Display Name"/></td>
        <td class="p-sm"><input class="form-input dc-member-email" class="w-full-fs12 form-input" placeholder="email@example.com"/></td>
        <td style="padding:6px 8px;text-align:center">
          <button class="btn btn-ghost btn-sm dc-remove-member" class="text-badge-red">✕</button>
        </td>`;
      tbody.appendChild(tr);
      tr.querySelector(".dc-member-name")?.focus();
    });

    // ── Team Members: Remove Row (delegated) ─────────────────────────────
    document.getElementById("dc-members-tbody")?.addEventListener("click", e => {
      if (e.target.classList.contains("dc-remove-member")) e.target.closest("tr").remove();
    });

    // ── Team Members: Save ───────────────────────────────────────────────
    document.getElementById("dc-save-members")?.addEventListener("click", async () => {
      // ── Snapshot before any change (makes this action undoable) ──────
      Data.snapshotForAdmin();

      const rows = [];
      document.querySelectorAll("#dc-members-tbody tr").forEach(tr => {
        const name     = tr.querySelector(".dc-member-name")?.value?.trim()  || "";
        const email    = tr.querySelector(".dc-member-email")?.value?.trim() || "";
        const origName = tr.dataset.origName || "";   // set when table was rendered
        if (!name) return;
        rows.push({ name, email, origName });
      });

      const members = rows.map(r => r.name);
      const emails  = {};
      rows.forEach(r => { if (r.email) emails[r.name] = r.email; });

      // ── Build rename map: origName → newName (same row position, name changed) ──
      const renameMap = {};   // { "Hareesh Gaddam": "Hareesh G", ... }
      rows.forEach(r => {
        if (r.origName && r.origName !== r.name) renameMap[r.origName] = r.name;
      });
      const hasRenames = Object.keys(renameMap).length > 0;

      // ── Diff vs current saved state ──────────────────────────────────
      const prevMembers = DC.teamMembers ? [...DC.teamMembers()].sort() : [];
      const prevEmails  = DC.teamEmails  ? DC.teamEmails()              : {};
      const membersChanged = JSON.stringify([...members].sort()) !== JSON.stringify(prevMembers);
      const emailsChanged  = JSON.stringify(emails) !== JSON.stringify(
        Object.fromEntries(members.filter(m => prevEmails[m]).map(m => [m, prevEmails[m]]))
      );
      const hasChanges = membersChanged || emailsChanged;

      if (!hasChanges && !hasRenames) {
        showToast("No changes to save.", "info");
        return;
      }

      // ── If renames detected: propagate to ALM lines in DC ────────────
      let updatedAlm = DC.almResponsible ? DC.almResponsible() : [];
      if (hasRenames) {
        updatedAlm = updatedAlm.map(row => {
          const updated = { ...row };
          // bd field (Line Responsible)
          if (updated.bd && renameMap[updated.bd]) updated.bd = renameMap[updated.bd];
          // ibm field (CASE Responsible)
          if (updated.ibm && renameMap[updated.ibm]) updated.ibm = renameMap[updated.ibm];
          // proxy field (CASE Proxy)
          if (updated.proxy && renameMap[updated.proxy]) updated.proxy = renameMap[updated.proxy];
          // names field (semicolon-separated Customer Contacts)
          if (updated.names) {
            const parts = updated.names.split(";").map(n => n.trim());
            updated.names = parts.map(n => renameMap[n] || n).join("; ");
          }
          return updated;
        });

        // Rebuild customerContacts from updated ALM rows
        const updatedContacts = updatedAlm.map(r => ({
          line: r.alm, names: r.names, emails: r.emails
        }));

        // Also persist rename map in DC nameAliases so Data.displayName() always translates
        // old names → new names on every future load (self-healing for any stale data)
        const currentAliases = DC.nameAliases ? DC.nameAliases() : {};
        const newAliases = { ...currentAliases };
        for (const [oldN, newN] of Object.entries(renameMap)) {
          newAliases[oldN.toLowerCase()] = newN;
          // If the old name itself was an alias target, update those too
          Object.keys(newAliases).forEach(k => {
            if (newAliases[k] === oldN) newAliases[k] = newN;
          });
        }

        await _dcSave({ teamMembers: members, teamEmails: emails,
                        almResponsible: updatedAlm, customerContacts: updatedContacts,
                        nameAliases: newAliases });

        // Rename owners in _allCases and changeHistory
        Data.renameOwners(renameMap);
        // Rename owner names stored in Weekly Tracker localStorage
        try { if (typeof DashWeeklyTracker !== "undefined") DashWeeklyTracker.renameInTracker(renameMap); } catch(e) {}

      } else {
        await _dcSave({ teamMembers: members, teamEmails: emails });
      }

      // ── Audit log entry ──────────────────────────────────────────────
      if (hasRenames) {
        const renameList = Object.entries(renameMap).map(([o,n]) => `${o} → ${n}`).join(", ");
        Data.pushChange({
          id: Date.now(), caseNumber: "CONFIG", field: "Team Members (Rename)",
          oldValue: Object.keys(renameMap).join(", "),
          newValue: renameList,
          updatedBy: "Admin", timestamp: new Date().toLocaleString(),
        });
      } else {
        const prevCount = prevMembers.length;
        const diff = members.length - prevCount;
        const summary = diff > 0 ? `+${diff} added` : diff < 0 ? `${diff} removed` : "emails updated";
        Data.pushChange({
          id: Date.now(), caseNumber: "CONFIG", field: "Team Members",
          oldValue: `${prevCount} members`, newValue: `${members.length} members (${summary})`,
          updatedBy: "Admin", timestamp: new Date().toLocaleString(),
        });
      }
      render();
      _refreshAllDashboards();
      const msg = hasRenames
        ? `Saved! ${Object.keys(renameMap).length} name(s) renamed and propagated across all dashboards.`
        : `Saved ${members.length} team members!`;
      showToast(msg, "success");
      setTimeout(_downloadAppDataJs, 500);

    });

    // ── ALM Lines: Add Row ───────────────────────────────────────────────
    document.getElementById("dc-add-alm")?.addEventListener("click", () => {
      const tbody = document.getElementById("dc-alm-tbody"); if (!tbody) return;
      const idx = tbody.rows.length;
      const tr = document.createElement("tr");
      if (idx % 2 === 0) tr.style.background = "var(--bg-layer)";
      tr.innerHTML = `
        <td class="p-compact"><input class="form-input dc-alm-line"       style="width:96px;font-size:12px;font-family:var(--font-mono);font-weight:600" placeholder="ALM-XX-P"/></td>
        <td class="p-compact"><input class="form-input dc-alm-names"      style="width:150px;font-size:11px" placeholder="Name 1; Name 2"/></td>
        <td class="p-compact"><input class="form-input dc-alm-emails"     style="width:180px;font-size:11px;font-family:var(--font-mono)" placeholder="email1@co.com;email2@co.com"/></td>
        <td class="p-compact"><input class="form-input dc-alm-bd"         class="filter-input-sm form-input" placeholder="Line Responsible"/></td>
        <td class="p-compact"><input class="form-input dc-alm-bdemail"    class="filter-input-mono form-input" placeholder="bd-line@bosch.com"/></td>
        <td class="p-compact"><input class="form-input dc-alm-ibm"        class="filter-input-sm form-input" placeholder="CASE Responsible"
          oninput="(function(el){const em=el.closest('tr').querySelector('.dc-alm-ibmemail');if(!em||em.dataset.manual==='1')return;const name=el.value.trim();const found=(DC&&DC.teamEmails&&DC.teamEmails()[name])||'';em.value=found;})(this)"/></td>
        <td class="p-compact"><input class="form-input dc-alm-ibmemail"   class="filter-input-mono form-input" placeholder="name@de.bosch.com"
          oninput="this.dataset.manual=this.value?'1':'0'"/></td>
        <td class="p-compact"><input class="form-input dc-alm-proxy"      class="filter-input-sm form-input" placeholder="CASE Proxy"
          oninput="(function(el){const em=el.closest('tr').querySelector('.dc-alm-proxyemail');if(!em||em.dataset.manual==='1')return;const name=el.value.trim();const found=(DC&&DC.teamEmails&&DC.teamEmails()[name])||'';em.value=found;})(this)"/></td>
        <td class="p-compact"><input class="form-input dc-alm-proxyemail" class="filter-input-mono form-input" placeholder="name@de.bosch.com"
          oninput="this.dataset.manual=this.value?'1':'0'"/></td>
        <td class="p-compact-c">
          <button class="btn btn-ghost btn-sm dc-remove-alm" class="text-badge-red">✕</button>
        </td>`;
      tbody.appendChild(tr);
      tr.querySelector(".dc-alm-line")?.focus();
    });

    // ── ALM Lines: Remove Row (delegated) ────────────────────────────────
    document.getElementById("dc-alm-tbody")?.addEventListener("click", e => {
      if (e.target.classList.contains("dc-remove-alm")) e.target.closest("tr").remove();
    });

    // ── ALM Lines: Save ──────────────────────────────────────────────────
    document.getElementById("dc-save-alm")?.addEventListener("click", async () => {
      Data.snapshotForAdmin();
      const rows = [];
      document.querySelectorAll("#dc-alm-tbody tr").forEach(tr => {
        const alm = tr.querySelector(".dc-alm-line")?.value?.trim(); if (!alm) return;
        rows.push({
          alm,
          names:      tr.querySelector(".dc-alm-names")?.value?.trim()      || "",
          emails:     tr.querySelector(".dc-alm-emails")?.value?.trim()     || "",
          bd:         tr.querySelector(".dc-alm-bd")?.value?.trim()         || "",
          bdEmail:    tr.querySelector(".dc-alm-bdemail")?.value?.trim()    || "",
          ibm:        tr.querySelector(".dc-alm-ibm")?.value?.trim()        || "",
          ibmEmail:   tr.querySelector(".dc-alm-ibmemail")?.value?.trim()   || "",
          proxy:      tr.querySelector(".dc-alm-proxy")?.value?.trim()      || "",
          proxyEmail: tr.querySelector(".dc-alm-proxyemail")?.value?.trim() || "",
        });
      });

      // ── Diff: compare new rows against currently saved ALM data ──────────
      const prevRows   = DC.almResponsible ? DC.almResponsible() : [];
      const normalize  = arr => JSON.stringify(
        arr.map(r => ({
          alm: r.alm||"", names: r.names||"", emails: r.emails||"",
          bd: r.bd||"", bdEmail: r.bdEmail||"",
          ibm: r.ibm||"", ibmEmail: r.ibmEmail||"",
          proxy: r.proxy||"", proxyEmail: r.proxyEmail||"",
        }))
      );
      const hasChanges = normalize(rows) !== normalize(prevRows);

      // Derive customerContacts for Info Dashboard Customer column
      const customerContacts = rows.map(r => ({ line: r.alm, names: r.names, emails: r.emails }));

      await _dcSave({ almResponsible: rows, customerContacts });

      if (hasChanges && typeof Data !== "undefined" && typeof Data.pushChange === "function") {
        // Find which ALM lines actually changed for a meaningful audit entry
        const prevMap = Object.fromEntries(prevRows.map(r => [r.alm, r]));
        const changedLines = rows.filter(r => {
          const p = prevMap[r.alm];
          if (!p) return true; // new line
          return r.names !== (p.names||"") || r.emails !== (p.emails||"") ||
                 r.bd !== (p.bd||"") || r.bdEmail !== (p.bdEmail||"") ||
                 r.ibm !== (p.ibm||"") || r.ibmEmail !== (p.ibmEmail||"") ||
                 r.proxy !== (p.proxy||"") || r.proxyEmail !== (p.proxyEmail||"");
        });
        const removedCount = prevRows.filter(p => !rows.find(r => r.alm === p.alm)).length;
        const parts = [];
        if (changedLines.length) parts.push(`${changedLines.length} line(s) modified`);
        if (removedCount)        parts.push(`${removedCount} line(s) removed`);
        Data.pushChange({
          id: Date.now(), caseNumber: "CONFIG", field: "ALM Line Assignments",
          oldValue: `${prevRows.length} lines`, newValue: parts.join(", ") || `${rows.length} lines saved`,
          updatedBy: "Admin", timestamp: new Date().toLocaleString(),
        });
        render();
      }

      _refreshAllDashboards();
      showToast(
        hasChanges ? `Saved ${rows.length} ALM line${rows.length !== 1 ? "s" : ""}! Info Dashboard updated.` : "No changes to save.",
        hasChanges ? "success" : "info"
      );
      if (hasChanges) {
        setTimeout(_downloadAppDataJs, 500);
      }
    });

    document.getElementById("dc-save-esc")?.addEventListener("click", async () => {
      Data.snapshotForAdmin();
      const readList = (containerId, nameCls, emailCls) =>
        [...document.querySelectorAll(`#${containerId} .${nameCls}`)].map((inp, i) => ({
          name:  inp.value?.trim() || "",
          email: document.querySelectorAll(`#${containerId} .${emailCls}`)[i]?.value?.trim() || "",
        })).filter(c => c.name);

      const ec = readList("dc-ec-list", "dc-ec-name", "dc-ec-email");
      const bd = readList("dc-bd-list", "dc-bd-name", "dc-bd-email");
      const tl = readList("dc-tl-list", "dc-tl-name", "dc-tl-email");

      // ── Diff: compare against currently saved escalation contacts ────────
      const norm = arr => JSON.stringify(arr.map(c => ({ name: c.name||"", email: c.email||"" })));
      const prevEc = DC.expertiseConnect ? DC.expertiseConnect() : [];
      const prevBd = DC.bdEscalation    ? DC.bdEscalation()     : [];
      const prevTl = DC.teamLead        ? DC.teamLead()         : [];
      const hasChanges = norm(ec) !== norm(prevEc) || norm(bd) !== norm(prevBd) || norm(tl) !== norm(prevTl);

      await _dcSave({ expertiseConnect: ec, bdEscalation: bd, teamLead: tl });

      if (hasChanges && typeof Data !== "undefined" && typeof Data.pushChange === "function") {
        const changed = [];
        if (norm(ec) !== norm(prevEc)) changed.push("Expertise Connect");
        if (norm(bd) !== norm(prevBd)) changed.push("BD Escalation");
        if (norm(tl) !== norm(prevTl)) changed.push("Team Lead");
        Data.pushChange({
          id: Date.now(), caseNumber: "CONFIG", field: "Escalation Contacts",
          oldValue: "previous", newValue: changed.join(", "),
          updatedBy: "Admin", timestamp: new Date().toLocaleString(),
        });
        render();
      }
      _refreshAllDashboards();
      showToast(hasChanges ? "Escalation contacts saved!" : "No changes to save.", hasChanges ? "success" : "info");
      if (hasChanges) setTimeout(_downloadAppDataJs, 500);
      if (hasChanges) {
        // ESCALATION_CONTACTS already logged via Data.pushChange above
      }
    });

    // ── IBM Directory: render groups ───────────────────────────────────────
    function _renderIbmDirGroups() {
      const container = document.getElementById("dc-ibmdir-groups");
      if (!container) return;
      const dir = DC.ibmDirectory ? DC.ibmDirectory() : {};
      container.innerHTML = Object.entries(dir).map(([group, contacts]) => {
        const rows = (contacts || []).map((c, i) =>
          `<div class="dc-ibmdir-row" style="display:flex;gap:6px;margin-bottom:4px" data-group="${group.replace(/"/g,'&quot;')}" data-idx="${i}">
            <input class="form-input dc-ibmdir-name" style="width:160px;font-size:12px" value="${(c.name||"").replace(/"/g,'&quot;')}" placeholder="Name"/>
            <input class="form-input dc-ibmdir-email" style="flex:1;font-size:12px;font-family:var(--font-mono)" value="${(c.email||"").replace(/"/g,'&quot;')}" placeholder="email@ibm.com"/>
            <button class="btn btn-ghost btn-sm dc-remove-ibmdir-row" data-group="${group.replace(/"/g,'&quot;')}" data-idx="${i}" style="padding:3px 7px;font-size:13px;color:var(--danger)">&times;</button>
          </div>`
        ).join("");
        return `<div class="dc-ibmdir-group" data-group="${group.replace(/"/g,'&quot;')}" style="border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:10px">
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
            <input class="form-input dc-ibmdir-group-name" style="font-size:12px;font-weight:600;width:200px" value="${group.replace(/"/g,'&quot;')}" placeholder="Group name"/>
            <button class="btn btn-ghost btn-sm dc-remove-ibmdir-group" data-group="${group.replace(/"/g,'&quot;')}" style="padding:2px 7px;font-size:11px;color:var(--danger)">Remove Group</button>
          </div>
          <div class="dc-ibmdir-rows">${rows}</div>
          <button class="btn btn-ghost btn-sm dc-add-ibmdir-row" data-group="${group.replace(/"/g,'&quot;')}" style="margin-top:4px;font-size:11px">+ Add Contact</button>
        </div>`;
      }).join("");

      // Wire row-add buttons
      container.querySelectorAll(".dc-add-ibmdir-row").forEach(btn => {
        btn.onclick = () => {
          const rowsDiv = btn.closest(".dc-ibmdir-group").querySelector(".dc-ibmdir-rows");
          const g = btn.dataset.group;
          const div = document.createElement("div");
          div.className = "dc-ibmdir-row";
          div.style.cssText = "display:flex;gap:6px;margin-bottom:4px";
          div.setAttribute("data-group", g);
          div.innerHTML = `<input class="form-input dc-ibmdir-name" style="width:160px;font-size:12px" placeholder="Name"/>
            <input class="form-input dc-ibmdir-email" style="flex:1;font-size:12px;font-family:var(--font-mono)" placeholder="email@ibm.com"/>
            <button class="btn btn-ghost btn-sm" style="padding:3px 7px;font-size:13px;color:var(--danger)" onclick="this.closest('.dc-ibmdir-row').remove()">&times;</button>`;
          rowsDiv.appendChild(div);
        };
      });

      container.querySelectorAll(".dc-remove-ibmdir-row").forEach(btn => {
        btn.onclick = () => btn.closest(".dc-ibmdir-row").remove();
      });

      container.querySelectorAll(".dc-remove-ibmdir-group").forEach(btn => {
        btn.onclick = () => btn.closest(".dc-ibmdir-group").remove();
      });
    }
    _renderIbmDirGroups();

    document.getElementById("dc-add-ibmdir-group")?.addEventListener("click", () => {
      const container = document.getElementById("dc-ibmdir-groups");
      const div = document.createElement("div");
      div.className = "dc-ibmdir-group";
      div.style.cssText = "border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:10px;margin-top:6px";
      div.innerHTML = `<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
        <input class="form-input dc-ibmdir-group-name" style="font-size:12px;font-weight:600;width:200px" placeholder="Group name"/>
        <button class="btn btn-ghost btn-sm" style="padding:2px 7px;font-size:11px;color:var(--danger)" onclick="this.closest('.dc-ibmdir-group').remove()">Remove Group</button>
      </div>
      <div class="dc-ibmdir-rows"></div>
      <button class="btn btn-ghost btn-sm" style="margin-top:4px;font-size:11px" onclick="(function(btn){const r=document.createElement('div');r.className='dc-ibmdir-row';r.style='display:flex;gap:6px;margin-bottom:4px';r.innerHTML='<input class=\"form-input dc-ibmdir-name\" style=\"width:160px;font-size:12px\" placeholder=\"Name\"/><input class=\"form-input dc-ibmdir-email\" style=\"flex:1;font-size:12px\" placeholder=\"email@ibm.com\"/><button class=\"btn btn-ghost btn-sm\" style=\"padding:3px 7px;font-size:13px;color:var(--danger)\" onclick=\"this.closest(\\'.dc-ibmdir-row\\').remove()\">&times;</button>';btn.closest('.dc-ibmdir-group').querySelector('.dc-ibmdir-rows').appendChild(r);})(this)">+ Add Contact</button>`;
      container.appendChild(div);
    });

    document.getElementById("dc-save-ibmdir")?.addEventListener("click", async () => {
      const groups = {};
      document.querySelectorAll("#dc-ibmdir-groups .dc-ibmdir-group").forEach(grpEl => {
        const name = grpEl.querySelector(".dc-ibmdir-group-name")?.value?.trim();
        if (!name) return;
        const contacts = [...grpEl.querySelectorAll(".dc-ibmdir-row")].map(row => ({
          name:  row.querySelector(".dc-ibmdir-name")?.value?.trim()  || "",
          email: row.querySelector(".dc-ibmdir-email")?.value?.trim() || "",
        })).filter(c => c.name);
        groups[name] = contacts;
      });
      await _dcSave({ ibmDirectory: groups });
      _refreshAllDashboards();
      showToast("IBM Directory saved!", "success");
      setTimeout(_downloadAppDataJs, 500);
      const totalContacts = Object.values(groups).reduce((n, arr) => n + arr.length, 0);
      Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'IBM Directory', oldValue: '', newValue: `${Object.keys(groups).length} groups, ${totalContacts} contacts saved`, updatedBy: 'Admin', timestamp: new Date().toLocaleString() });
    });

    // ── IBM Directory: Export Excel ────────────────────────────────────────
    document.getElementById("dc-export-ibmdir-xlsx")?.addEventListener("click", () => {
      const dir = DC.ibmDirectory ? DC.ibmDirectory() : {};
      const aoa = [["group","name","email"]];
      Object.entries(dir).forEach(([group, contacts]) => {
        (contacts||[]).forEach(c => aoa.push([group, c.name||"", c.email||""]));
      });
      _downloadXlsx(aoa, "ibm-directory.xlsx", "IBM Directory");
    });

    // ── IBM Directory: Import Excel ────────────────────────────────────────
    document.getElementById("dc-import-ibmdir-xlsx")?.addEventListener("change", async e => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        const rows = await _readXlsx(file);
        if (!rows.length) { showToast("Empty file", "warning"); return; }
        const hdr = rows[0].map(h => String(h||"").toLowerCase().trim());
        const gi = hdr.indexOf("group"), ni = hdr.indexOf("name"), ei = hdr.indexOf("email");
        if (gi < 0 || ni < 0 || ei < 0) { showToast("Need columns: group, name, email", "warning"); return; }
        const dir = {};
        rows.slice(1).forEach(row => {
          const g = String(row[gi]||"").trim(), n = String(row[ni]||"").trim(), em = String(row[ei]||"").trim();
          if (!g || !n) return;
          if (!dir[g]) dir[g] = [];
          dir[g].push({ name: n, email: em });
        });
        await _dcSave({ ibmDirectory: dir });
        _renderIbmDirGroups();
        showToast("IBM Directory imported!", "success");
        Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'IBM Directory Import', oldValue: '', newValue: `Imported from Excel: ${Object.keys(dir).length} groups`, updatedBy: 'Admin', timestamp: new Date().toLocaleString() });
      } catch(err) {
        showToast("Import failed: " + err.message, "danger");
        Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'IBM Directory Import', oldValue: '', newValue: `Import failed: ${err.message}`, updatedBy: 'Admin', timestamp: new Date().toLocaleString() });
      }
      e.target.value = "";
    });

    // ── Weekly Tracker: stats display ─────────────────────────────────────
    function _wtUpdateStats() {
      const el = document.getElementById("dc-wt-stats");
      if (!el) return;
      let total = 0, years = new Set();
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("ibm_wtracker_")) continue;
        if (k === "ibm_wtracker_seeded_v4" || k === "ibm_wtracker_history") continue;
        const yr = k.replace("ibm_wtracker_","");
        if (!/^\d{4}$/.test(yr)) continue;
        try {
          const d = JSON.parse(localStorage.getItem(k) || "{}");
          const count = Object.values(d).flat().length;
          total += count;
          if (count > 0) years.add(yr);
        } catch(e){}
      }
      // Count server-side comments
      let cmtCount = 0;
      try {
        if (typeof DashWeeklyTracker !== "undefined" && DashWeeklyTracker._serverComments) {
          cmtCount = Object.keys(DashWeeklyTracker._serverComments).length;
        }
      } catch(e) {}
      const cmtNote = cmtCount > 0 ? ` · ${cmtCount} comment${cmtCount!==1?"s":""} on server` : "";
      el.textContent = total
        ? `\u{1F4CB} ${total} cases stored across ${[...years].sort().join(", ")}${cmtNote}`
        : "No tracker data in storage yet.";
    }
    _wtUpdateStats();

    // ══════════════════════════════════════════════════════════════════
    //  CUSTOMER PRODUCTS MANAGEMENT
    // ══════════════════════════════════════════════════════════════════

    // ── Customer Products: Save ────────────────────────────────────────
    document.getElementById("dc-save-products")?.addEventListener("click", async () => {
      Data.snapshotForAdmin();
      const raw = document.getElementById("dc-cfg-products")?.value || "";
      const products = raw.split(/\n/).map(s => s.trim()).filter(Boolean);

      const prevProds = [...(DC.customerProducts ? DC.customerProducts() : [])].sort();
      const hasChanges = JSON.stringify([...products].sort()) !== JSON.stringify(prevProds);

      await _dcSave({ customerProducts: products, _savedProductList: products });

      // Update badge
      const badge = document.getElementById("dc-products-badge");
      if (badge) badge.textContent = products.length;

      if (hasChanges && typeof Data !== "undefined" && typeof Data.pushChange === "function") {
        Data.pushChange({
          id: Date.now(), caseNumber: "CONFIG", field: "Customer Products",
          oldValue: `${prevProds.length} products`, newValue: `${products.length} products`,
          updatedBy: "Admin", timestamp: new Date().toLocaleString(),
        });
        render();
      }
      showToast(hasChanges ? `Saved ${products.length} customer product(s)!` : "No changes to save.", hasChanges ? "success" : "info");
      if (hasChanges) {
        _refreshAllDashboards();
      }
    });

    // ── Customer Products: Export Excel ───────────────────────────────
    document.getElementById("dc-export-products-xlsx")?.addEventListener("click", () => {
      const raw = document.getElementById("dc-cfg-products")?.value || "";
      const products = raw.split(/\n/).map(s => s.trim()).filter(Boolean);
      const aoa = [["product"], ...products.map(p => [p])];
      _downloadXlsx(aoa, "customer-products.xlsx", "Customer Products");
    });

    // ── Customer Products: Import Excel ──────────────────────────────
    document.getElementById("dc-import-products-xlsx")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        if (!_xlsxAvail()) { showToast("Excel library not ready", "warning"); return; }
        const rows = await _readXlsx(file);
        if (!rows.length) { showToast("No data found in file", "warning"); e.target.value = ""; return; }
        const products = [];
        rows.forEach(row => {
          const p = _col(row, "product", "products", "productname", "product_name", "productname");
          if (p) products.push(p);
        });
        const ta = document.getElementById("dc-cfg-products");
        if (ta) ta.value = [...new Set(products)].join("\n");
        showToast(`Imported ${products.length} product(s) — click Save to apply`, "success");
      } catch (err) { showToast("Import failed: " + err.message, "danger"); }
      e.target.value = "";
    });

    // ── Customer Products: Detect from Excel (scan Product column) ────
    document.getElementById("dc-detect-products-xlsx")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      const statusEl = document.getElementById("dc-detect-products-status");
      const listEl   = document.getElementById("dc-detected-products-list");
      try {
        if (!_xlsxAvail()) { showToast("Excel library not ready", "warning"); return; }
        if (statusEl) statusEl.textContent = "⏳ Scanning…";
        const rows = await _readXlsx(file);
        if (!rows.length) { if (statusEl) statusEl.textContent = "No data found."; return; }

        // Detect unique Product values
        const detected = new Set();
        rows.forEach(row => {
          const p = _col(row, "product");
          if (p && p !== "Product") detected.add(p);
        });

        if (!detected.size) {
          if (statusEl) statusEl.textContent = "⚠ No Product column found in this file.";
          if (listEl) listEl.style.display = "none";
          return;
        }

        const sorted = [...detected].sort();
        const currentTa = document.getElementById("dc-cfg-products");
        const currentSet = new Set((currentTa?.value || "").split(/\n/).map(s => s.trim()).filter(Boolean));

        if (statusEl) statusEl.textContent = `Found ${sorted.length} unique product(s):`;

        if (listEl) {
          listEl.style.display = "block";
          listEl.innerHTML = `
            <div style="border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--bg-ui);padding:10px;max-height:220px;overflow-y:auto">
              ${sorted.map(p => `
                <label style="display:flex;align-items:center;gap:8px;padding:4px 6px;cursor:pointer;border-radius:var(--radius-xs);font-size:var(--font-size-sm);transition:background var(--t-fast)" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''">
                  <input type="checkbox" class="dc-detected-prod-chk" data-product="${Utils.escHtml(p)}"
                    ${currentSet.has(p) ? "checked" : ""}
                    style="accent-color:var(--ibm-blue-50);cursor:pointer"/>
                  <span>${Utils.escHtml(p)}</span>
                  ${currentSet.has(p) ? '<span style="font-size:10px;color:var(--green);font-weight:600">✓ already added</span>' : ""}
                </label>`).join("")}
            </div>
            <div style="margin-top:8px;display:flex;gap:6px;align-items:center;font-size:12px;color:var(--text-tertiary)">
              <button id="dc-products-apply-selected" class="btn btn-primary btn-sm" class="fs-12">
                ${IC.plus} Add Selected to List
              </button>
              <span>Checked products will be merged into the textarea above.</span>
            </div>`;

          // Wire apply-selected button
          document.getElementById("dc-products-apply-selected")?.addEventListener("click", () => {
            const checked = [...document.querySelectorAll(".dc-detected-prod-chk:checked")].map(cb => cb.dataset.product);
            const ta = document.getElementById("dc-cfg-products");
            if (!ta) return;
            const existing = new Set(ta.value.split(/\n/).map(s => s.trim()).filter(Boolean));
            checked.forEach(p => existing.add(p));
            ta.value = [...existing].sort().join("\n");
            showToast(`${checked.length} product(s) added to list — click Save to apply`, "success");
            if (listEl) listEl.style.display = "none";
            if (statusEl) statusEl.textContent = `${checked.length} product(s) merged.`;
          });

          // Wire select-all button
          document.getElementById("dc-products-select-all")?.addEventListener("click", () => {
            document.querySelectorAll(".dc-detected-prod-chk").forEach(cb => cb.checked = true);
          });
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = "⚠ Scan failed: " + err.message;
      }
      e.target.value = "";
    });

    // ── Customer Products: Select All (outside detect flow) ──────────
    document.getElementById("dc-products-select-all")?.addEventListener("click", () => {
      document.querySelectorAll(".dc-detected-prod-chk").forEach(cb => cb.checked = true);
    });

    // ── Weekly Tracker: Export Excel ──────────────────────────────────────
    document.getElementById("dc-wt-export-xlsx")?.addEventListener("click", () => {
      const aoa = [["Year","Week","Case Number","Owner","Title","Product","Severity","Status","Age","Closed Date","Category","Comments"]];
      const serverCmts = (typeof DashWeeklyTracker !== "undefined") ? (DashWeeklyTracker._serverComments || {}) : {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("ibm_wtracker_")) continue;
        const yr = k.replace("ibm_wtracker_","");
        if (!/^\d{4}$/.test(yr)) continue;
        try {
          const yearData = JSON.parse(localStorage.getItem(k) || "{}");
          Object.entries(yearData).forEach(([wk, rows]) => {
            (rows||[]).forEach(r => {
              // Use server comment if available, fall back to stored
              const cmt = (serverCmts[r.caseNumber] !== undefined) ? serverCmts[r.caseNumber] : (r.comments||"");
              aoa.push([
                yr, wk, r.caseNumber||"", r.owner||"", r.title||"",
                r.product||"", r.severity||"", r.status||"",
                r.age||"", r.closedDate||"", r.category||"", cmt
              ]);
            });
          });
        } catch(e){}
      }
      _downloadXlsx(aoa, "weekly-tracker-export.xlsx", "Weekly Tracker");
    });

    // ── Weekly Tracker: Import Excel/CSV → server-side comments ──────────
    document.getElementById("dc-wt-import-excel")?.addEventListener("change", async e => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      const statusEl = document.getElementById("dc-wt-import-status");
      const _setStatus = (msg, type) => {
        if (!statusEl) return;
        const colors = { info:"var(--text-secondary)", success:"var(--green)", error:"var(--red)", warn:"var(--orange)" };
        statusEl.style.display = "block";
        statusEl.style.color   = colors[type] || colors.info;
        statusEl.innerHTML     = msg;
      };

      // ── Strict format check: xlsx / xlsm only ─────────────────────────
      const ext = file.name.toLowerCase().split(".").pop();
      if (ext !== "xlsx" && ext !== "xlsm") {
        _setStatus("❌ Invalid file type. Only <strong>.xlsx</strong> or <strong>.xlsm</strong> files are accepted for this import.", "error");
        showToast("❌ Invalid file type — please use .xlsx or .xlsm", "danger");
        return;
      }

      _setStatus("⏳ Parsing file…", "info");

      try {
        // ── Parse Excel ────────────────────────────────────────────────
        if (!_xlsxAvail()) { _setStatus("❌ XLSX library not loaded.", "error"); return; }
        let rows = await _readXlsx(file);

        // Normalize all header keys to lowercase trimmed
        rows = rows.map(r => {
          const norm = {};
          Object.entries(r).forEach(([k, v]) => { norm[k.toLowerCase().trim()] = v; });
          return norm;
        });

        if (!rows.length) throw new Error("No data rows found in file.");

        // ── Strict column validation: must have exactly SL.No, Case Number, Comments ──
        const sampleKeys = Object.keys(rows[0]);
        const hasSLNo       = sampleKeys.some(k => k === "sl.no" || k === "sl no" || k === "slno" || k === "sl.no." || k === "#");
        const hasCaseNumber = sampleKeys.some(k => k === "case number" || k === "casenumber" || k === "case no");
        const hasComments   = sampleKeys.some(k => k === "comments" || k === "comment");

        if (!hasCaseNumber) throw new Error('Required column "Case Number" not found. Make sure your file has the header: SL.No | Case Number | Comments');
        if (!hasComments)   throw new Error('Required column "Comments" not found. Make sure your file has the header: SL.No | Case Number | Comments');

        const cnKey  = sampleKeys.find(k => k === "case number" || k === "casenumber" || k === "case no");
        const cmtKey = sampleKeys.find(k => k === "comments" || k === "comment");

        // ── Build import map: only rows that have a comment ────────────
        const toImport  = {}; // caseNumber → comment (new/changed only — skip already-set)
        let totalRows = 0, blankComment = 0, invalidCN = 0;

        rows.forEach(r => {
          const cn  = (r[cnKey]  || "").toString().trim();
          const cmt = (r[cmtKey] || "").toString().trim();
          if (!cn) { invalidCN++; return; }
          totalRows++;
          if (!cmt) { blankComment++; return; }
          toImport[cn] = cmt;
        });

        if (!Object.keys(toImport).length) {
          _setStatus(`⚠ Nothing to import — all ${totalRows} rows had blank Comments. Fill in the Comments column and re-upload.`, "warn");
          showToast("⚠ All rows had blank comments — nothing imported.", "warning");
          return;
        }

        // ── Ensure server comments are loaded ─────────────────────────
        if (typeof DashWeeklyTracker === "undefined" || !DashWeeklyTracker._mergeServerComments) {
          _setStatus("❌ Weekly Tracker module not available.", "error"); return;
        }
        _setStatus("⏳ Checking existing comments on server…", "info");
        await DashWeeklyTracker._ensureServerCommentsLoaded();

        // ── Skip cases that ALREADY have a comment (never overwrite) ──
        const existing = DashWeeklyTracker._serverComments || {};
        const newEntries   = {};
        const alreadySet   = [];
        Object.entries(toImport).forEach(([cn, cmt]) => {
          const existingCmt = existing[cn];
          if (existingCmt && existingCmt.trim()) {
            alreadySet.push(cn); // already has a comment — skip
          } else {
            newEntries[cn] = cmt; // blank or missing — safe to fill
          }
        });

        const newCount     = Object.keys(newEntries).length;
        const skippedCount = alreadySet.length;

        if (!newCount) {
          // All cases already had comments
          const msg = `ℹ️ Already up to date — all ${skippedCount} case${skippedCount!==1?"s":""} already had comments. No changes made.`;
          _setStatus(msg, "info");
          showToast(`ℹ️ Already up to date — ${skippedCount} case${skippedCount!==1?"s":""} skipped (comments already set).`, "info");
          return;
        }

        // ── Save new entries to server ─────────────────────────────────
        _setStatus(`☁️ Saving ${newCount} comment${newCount!==1?"s":""}…`, "info");
        await DashWeeklyTracker._mergeServerCommentsNoOverwrite(newEntries);

        // ── Re-render tracker ──────────────────────────────────────────
        try { DashWeeklyTracker.render(); } catch(e) {}
        _wtUpdateStats();

        // ── Build detailed status message ──────────────────────────────
        const parts = [];
        parts.push(`<strong class="c-green">✅ ${newCount} comment${newCount!==1?"s":""} added</strong>`);
        if (skippedCount) parts.push(`<span class="c-orange">⏭ ${skippedCount} skipped (already had comments)</span>`);
        if (blankComment) parts.push(`<span class="c-tertiary">— ${blankComment} row${blankComment!==1?"s":""} had no comment in file</span>`);

        _setStatus(parts.join(" &nbsp;·&nbsp; "), "success");

        // Toast breakdown
        const toastParts = [`✅ ${newCount} added`];
        if (skippedCount) toastParts.push(`⏭ ${skippedCount} skipped`);
        showToast(toastParts.join(" · "), "success");

        Data.pushChange({
          id: Date.now(), caseNumber: "CONFIG", field: "Weekly Tracker Comments",
          oldValue: "", newValue: `${newCount} comment(s) added from ${file.name}` + (skippedCount ? `, ${skippedCount} skipped (already set)` : ""),
          updatedBy: "Admin", timestamp: new Date().toLocaleString()
        });
        render();

      } catch(err) {
        _setStatus("❌ Import failed: " + err.message, "error");
        showToast("❌ Import failed: " + err.message, "danger");
      }
    });

    // ── Weekly Tracker: Reset to built-in seed ────────────────────────
    document.getElementById("dc-wt-reset-seed")?.addEventListener("click", () => {
      /* F52: Custom confirmation modal requiring user to type "RESET" */
      const wtCount = (() => {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("ibm_wtracker_")) count++;
        }
        return count;
      })();

      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;z-index:var(--z-toast);background:rgba(0,0,0,.55);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center";
      overlay.innerHTML = `
        <div style="background:var(--bg-ui);border:1px solid rgba(218,30,40,.3);border-radius:var(--radius-lg);padding:28px 32px;width:380px;box-shadow:0 8px 32px rgba(0,0,0,.15);font-family:var(--font-sans)">
          <div style="font-size:15px;font-weight:700;color:var(--red,#da1e28);margin-bottom:8px">⚠ Reset to Built-in Seed Data</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;margin-bottom:12px">
            This will permanently overwrite <strong>${wtCount} local storage key(s)</strong> with factory seed data.
            All custom Weekly Tracker entries will be lost. This cannot be undone.
          </div>
          <label style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-tertiary);display:block;margin-bottom:6px">
            Type <strong class="c-red">RESET</strong> to confirm:
          </label>
          <input id="reset-confirm-input" type="text" class="form-input" placeholder="RESET"
            style="width:100%;box-sizing:border-box;font-size:13px;margin-bottom:16px;text-transform:uppercase"/>
          <div class="d-flex gap-8">
            <button id="reset-confirm-btn" class="btn btn-danger" style="flex:1;justify-content:center;opacity:.4" disabled>Reset Data</button>
            <button id="reset-cancel-btn" class="btn btn-ghost" class="flex-1-c">Cancel</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      const input = document.getElementById("reset-confirm-input");
      const confirmBtn = document.getElementById("reset-confirm-btn");
      input?.addEventListener("input", () => {
        const valid = (input.value.toUpperCase() === "RESET");
        confirmBtn.disabled = !valid;
        confirmBtn.style.opacity = valid ? "1" : ".4";
      });
      document.getElementById("reset-cancel-btn")?.addEventListener("click", () => overlay.remove());
      confirmBtn?.addEventListener("click", () => {
        overlay.remove();
        localStorage.removeItem("ibm_wtracker_seeded_v4");
        try {
          if (typeof DashWeeklyTracker !== "undefined" && DashWeeklyTracker._applySeed) {
            DashWeeklyTracker._applySeed();
          }
        } catch(e) {
          ["2025","2026"].forEach(yr => localStorage.removeItem("ibm_wtracker_" + yr));
        }
        _wtUpdateStats();
        showToast("Tracker reset to built-in seed data. Reload the Weekly Tracker tab.", "success");
        Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'Weekly Tracker Reset', oldValue: '', newValue: 'Reset to built-in seed data', updatedBy: 'Admin', timestamp: new Date().toLocaleString() });
      });
    });

    // ── Weekly Tracker: Clear all ─────────────────────────────────────
    document.getElementById("dc-wt-clear-all")?.addEventListener("click", () => {
      if (!confirm("This will permanently delete ALL Weekly Tracker data from this browser AND clear all server-stored comments. Are you sure?")) return;
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("ibm_wtracker_")) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      // Also clear localStorage comments key
      try { localStorage.removeItem("ibm_wtracker_comments_v1"); } catch(e) {}
      _wtUpdateStats();
      showToast(`Cleared ${keysToRemove.length} tracker storage key(s) and server comments.`, "warning");
      Data.pushChange({ id: Date.now(), caseNumber: 'CONFIG', field: 'Weekly Tracker Cleared', oldValue: '', newValue: `${keysToRemove.length} storage key(s) removed`, updatedBy: 'Admin', timestamp: new Date().toLocaleString() });
    });

    // ── RFE CSV Import with Deduplication ─────────────────────────────────────
    document.getElementById("rfe-import-csv")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const statusEl = document.getElementById("rfe-csv-import-status");
      statusEl.style.display = "block";
      statusEl.style.color = "var(--text-secondary)";
      statusEl.innerHTML = "⏳ Processing...";

      try {
        if (typeof XLSX === "undefined") {
          throw new Error("Excel library not ready");
        }

        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!rows.length) {
          throw new Error("No data rows found in file");
        }

        // Normalize and parse RFE data
        const newRfeData = rows.map((row, idx) => {
          const normalized = {};
          Object.entries(row).forEach(([key, val]) => {
            normalized[key.trim()] = val;
          });
          return normalized;
        });

        // Load existing RFE data
        let existingData = [];
        try {
          const raw = localStorage.getItem("ibm_rfe_tracking_v1");
          existingData = raw ? JSON.parse(raw) : [];
        } catch (e) {}

        // Check for duplicates
        const existingRefs = new Set(existingData.map(r => r['Idea Reference']));
        const newRefs = new Set(newRfeData.map(r => r['Idea Reference']));
        const duplicates = Array.from(newRefs).filter(ref => existingRefs.has(ref));
        const newOnly = newRfeData.filter(r => !existingRefs.has(r['Idea Reference']));

        // Show merge dialog if duplicates exist
        if (duplicates.length > 0 && existingData.length > 0) {
          _showRFEMergeDialog(newRfeData, existingData, duplicates, file.name, statusEl);
          e.target.value = "";
          return;
        }

        // No duplicates, merge data
        const mergedData = [...existingData, ...newRfeData];
        _saveRFEData(mergedData, newRfeData.length, file.name, statusEl);
        e.target.value = "";

      } catch (err) {
        statusEl.style.color = "var(--red)";
        statusEl.innerHTML = `❌ Import failed: ${err.message}`;
        showToast(`❌ RFE import failed: ${err.message}`, "danger");
      }
    });

    // ── Shared helper: light-theme merge/replace/cancel dialog ─────────────
    function _showImportMergeDialog({ title, subtitle, existingCount, newCount, onMerge, onReplace, onCancel }) {
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;z-index:var(--z-modal)9;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center";
      overlay.innerHTML = `
        <div style="background:var(--bg-ui);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:28px 32px;width:420px;max-width:92vw;box-shadow:0 8px 32px rgba(0,0,0,.15);font-family:var(--font-sans)">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:4px">${title}</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border-subtle)">${subtitle}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
            <div style="background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:12px;text-align:center">
              <div style="font-size:22px;font-weight:700;color:var(--text-primary)">${existingCount}</div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Existing records</div>
            </div>
            <div style="background:rgba(15,98,254,.06);border:1px solid rgba(15,98,254,.2);border-radius:var(--radius-sm);padding:12px;text-align:center">
              <div style="font-size:22px;font-weight:700;color:var(--ibm-blue-50)">${newCount}</div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Records in file</div>
            </div>
          </div>
          <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:10px">What would you like to do?</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
            <button id="_imd-merge" class="btn btn-primary" style="flex:1;justify-content:center">➕ Merge</button>
            <button id="_imd-replace" class="btn btn-danger" style="flex:1;justify-content:center">🔄 Replace All</button>
            <button id="_imd-cancel" class="btn btn-ghost" style="flex:1;justify-content:center;border:1px solid var(--border-subtle)">✕ Cancel</button>
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);line-height:1.6;background:var(--bg-layer);padding:10px;border-radius:var(--radius-sm)">
            <strong style="color:var(--text-secondary)">Merge:</strong> Keep existing + append new records.<br/>
            <strong style="color:var(--text-secondary)">Replace:</strong> Overwrite all existing with file data.
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector("#_imd-merge")?.addEventListener("click", () => { overlay.remove(); onMerge?.(); });
      overlay.querySelector("#_imd-replace")?.addEventListener("click", () => { overlay.remove(); onReplace?.(); });
      overlay.querySelector("#_imd-cancel")?.addEventListener("click", () => { overlay.remove(); onCancel?.(); });
      overlay.addEventListener("click", e => { if (e.target === overlay) { overlay.remove(); onCancel?.(); } });
    }

    // ── Helper: Show merge dialog ─────────────────────────────────────
    function _showRFEMergeDialog(newData, existingData, duplicates, fileName, statusEl) {
      const existingRefs = new Set(existingData.map(r => r['Idea Reference']));
      const newOnly = newData.filter(r => !existingRefs.has(r['Idea Reference']));

      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;z-index:var(--z-modal)9;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center";
      overlay.innerHTML = `
        <div style="background:var(--bg-ui);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:28px 32px;width:440px;box-shadow:0 8px 32px rgba(0,0,0,.15);font-family:var(--font-sans)">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:4px">📋 RFE Data Already Exists</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border-subtle)">Review conflicts before importing</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:16px">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
              <div style="background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:10px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:var(--text-primary)">${existingData.length}</div>
                <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Existing RFEs</div>
              </div>
              <div style="background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:10px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:var(--ibm-blue-50)">${newData.length}</div>
                <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">New in file</div>
              </div>
              <div style="background:rgba(218,30,40,.06);border:1px solid rgba(218,30,40,.2);border-radius:var(--radius-sm);padding:10px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:var(--red)">${duplicates.length}</div>
                <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Duplicates</div>
              </div>
            </div>
          </div>

          <div style="background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:12px;margin-bottom:20px;font-size:12px;max-height:120px;overflow-y:auto">
            <div style="font-weight:600;color:var(--text-secondary);margin-bottom:8px;font-size:11px;text-transform:uppercase;letter-spacing:.04em">Duplicate RFEs</div>
            ${duplicates.slice(0, 10).map(d => `<div style="color:var(--text-primary);padding:2px 0;border-bottom:1px solid var(--border-subtle)">• ${d}</div>`).join('')}
            ${duplicates.length > 10 ? `<div style="color:var(--text-tertiary);margin-top:6px;font-style:italic">... and ${duplicates.length - 10} more</div>` : ''}
          </div>

          <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:10px">What would you like to do?</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
            <button id="rfe-merge-add" class="btn btn-primary" style="flex:1;justify-content:center">
              ➕ Merge (Add ${newOnly.length} New)
            </button>
            <button id="rfe-merge-replace" class="btn btn-danger" style="flex:1;justify-content:center">
              🔄 Replace All
            </button>
            <button id="rfe-merge-cancel" class="btn btn-ghost" style="flex:1;justify-content:center;border:1px solid var(--border-subtle)">
              ✕ Cancel
            </button>
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);line-height:1.6;background:var(--bg-layer);padding:10px;border-radius:var(--radius-sm)">
            <strong style="color:var(--text-secondary)">Merge:</strong> Keep existing + add only new RFEs.<br/>
            <strong style="color:var(--text-secondary)">Replace:</strong> Replace all existing with new file.
          </div>
        </div>`;

      document.body.appendChild(overlay);

      document.getElementById('rfe-merge-add')?.addEventListener('click', () => {
        overlay.remove();
        const mergedData = [...existingData, ...newOnly];
        _saveRFEData(mergedData, newOnly.length, fileName, statusEl, true);
      });

      document.getElementById('rfe-merge-replace')?.addEventListener('click', () => {
        overlay.remove();
        _saveRFEData(newData, newData.length, fileName, statusEl, false);
      });

      document.getElementById('rfe-merge-cancel')?.addEventListener('click', () => {
        overlay.remove();
        statusEl.style.color = "var(--orange)";
        statusEl.innerHTML = "⏭ Import cancelled";
      });
    }

    // ── Helper: Save RFE data with confirmation ──────────────────────
    function _saveRFEData(rfeData, importedCount, fileName, statusEl, isMerge) {
      try {
        localStorage.setItem("ibm_rfe_tracking_v1", JSON.stringify(rfeData));
        localStorage.setItem("ibm_rfe_tracking_last_update", Date.now().toString());

        // Update display
        statusEl.style.color = "var(--green)";
        const action = isMerge ? `merged ${importedCount} new` : `replaced with ${rfeData.length}`;
        statusEl.innerHTML = `✅ Successfully ${action} RFE(s)`;

        // Update RFE tracking dashboard
        if (typeof DashRFEAdvanced !== "undefined" && DashRFEAdvanced.render) {
          setTimeout(() => DashRFEAdvanced.render(), 100);
        }
        if (typeof DashRFETracking !== "undefined" && DashRFETracking.render) {
          setTimeout(() => DashRFETracking.render(), 100);
        }

        // Update total count and timestamp
        const countEl = document.getElementById("rfe-total-count");
        if (countEl) countEl.textContent = rfeData.length;

        const dateEl = document.getElementById("rfe-last-updated");
        if (dateEl) {
          const now = new Date().toLocaleString();
          dateEl.textContent = `Last updated: ${now}`;
        }

        showToast(`✅ RFE data updated! Total: ${rfeData.length} RFE(s)`, "success");

        // Log change
        Data.pushChange({
          id: Date.now(),
          caseNumber: "CONFIG",
          field: "RFE Data Updated",
          oldValue: "",
          newValue: `${action} from ${fileName} (Total: ${rfeData.length})`,
          updatedBy: "Admin",
          timestamp: new Date().toLocaleString()
        });
      } catch (err) {
        statusEl.style.color = "var(--red)";
        statusEl.innerHTML = `❌ Save failed: ${err.message}`;
        showToast(`❌ Failed to save RFE data: ${err.message}`, "danger");
      }
    }

    // ── Clear RFE Data ─────────────────────────────────────────────────
    document.getElementById("rfe-clear-data-btn")?.addEventListener("click", () => {
      if (!confirm("⚠️ This will permanently delete ALL RFE data from this browser. Continue?")) return;
      if (!confirm("🗑️ Are you absolutely sure? This cannot be undone!")) return;

      try {
        localStorage.removeItem("ibm_rfe_tracking_v1");
        localStorage.removeItem("ibm_rfe_tracking_metadata_v1");
        localStorage.removeItem("ibm_rfe_tracking_last_update");

        document.getElementById("rfe-total-count").textContent = "0";
        document.getElementById("rfe-last-updated").textContent = "Not yet imported";

        // Re-render dashboards
        if (typeof DashRFEAdvanced !== "undefined") DashRFEAdvanced.render();
        if (typeof DashRFETracking !== "undefined") DashRFETracking.render();

        showToast("✅ All RFE data cleared", "success");
        Data.pushChange({
          id: Date.now(),
          caseNumber: "CONFIG",
          field: "RFE Data Cleared",
          oldValue: "",
          newValue: "All RFE data deleted",
          updatedBy: "Admin",
          timestamp: new Date().toLocaleString()
        });
      } catch (err) {
        showToast(`❌ Failed to clear RFE data: ${err.message}`, "danger");
      }
    });
  }

  return { render };
})();
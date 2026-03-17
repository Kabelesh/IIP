/* ============================================================
   js/modules/safety-guard.js  —  Critical Action Safety Guard
   IBM Case Intelligence Platform v6.3 (Admin Edition)

   Intercepts high-impact admin operations and:
   1. Shows a modal with action summary + preview table of affected cases
   2. Requires the admin to type "CONFIRM" before proceeding
   3. Creates a structured audit entry on completion
   4. Aborts cleanly on cancel — zero data mutation

   Usage:
     SafetyGuard.intercept({
       actionType : "Bulk Reassignment",          // display label
       actionKey  : "bulk_reassign",              // snake_case ID for audit
       summary    : "You are about to reassign 47 cases\nFrom: Srinivas K\nTo: Arun B",
       affectedCases : [                          // array of row objects
         { caseId:"TS000000001", currentOwner:"[Owner A]", newOwner:"[Owner B]" },
         ...
       ],
       previewColumns: [                          // column definitions for preview table
         { key:"caseId",       label:"Case ID" },
         { key:"currentOwner", label:"Current Owner" },
         { key:"newOwner",     label:"New Owner" },
       ],
       onConfirm  : () => { // execute the real operation
       },
       onCancel   : () => { // optional cleanup
       },
     });
   ============================================================ */

const SafetyGuard = (() => {

  /* ── Icon set (matches admin-dash.js style) ─────────── */
  const IC = {
    shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    warn:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    audit:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    check:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    close:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    eye:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  };

  /* ── Audit log (persisted alongside changeHistory) ──── */
  const AUDIT_KEY = "ibm_safety_audit_v1";

  function _loadAudit() {
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  }

  function _saveAudit(entries) {
    try { localStorage.setItem(AUDIT_KEY, JSON.stringify(entries.slice(0, 200))); } catch(e) {}
  }

  function _pushAudit(entry) {
    const entries = _loadAudit();
    entries.unshift(entry);
    _saveAudit(entries);
  }

  function auditLog() { return _loadAudit(); }

  /* ── Escape helper (safe HTML output) ─────────────────── */
  function _esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ── Build preview table HTML ─────────────────────────── */
  function _buildPreviewTable(affectedCases, columns, maxRows) {
    maxRows = maxRows || 8;
    const shown   = affectedCases.slice(0, maxRows);
    const hiddenN = affectedCases.length - shown.length;

    const headerRow = columns.map(c =>
      `<th style="padding:7px 12px;text-align:left;font-size:11px;font-weight:600;
        text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);
        background:var(--bg-layer-2);border-bottom:1px solid var(--border-subtle);
        white-space:nowrap">${_esc(c.label)}</th>`
    ).join("");

    const dataRows = shown.map((row, i) =>
      `<tr style="background:${i % 2 === 0 ? 'var(--bg-ui)' : 'var(--bg-layer)'}">` +
      columns.map(c => {
        const val = row[c.key] || "—";
        const isCaseId = c.key === "caseId" || c.key === "caseNumber" || c.key === "case_id";
        return `<td style="padding:6px 12px;font-size:12px;color:var(--text-primary);
          border-bottom:1px solid var(--border-subtle);white-space:nowrap;
          ${isCaseId ? 'font-family:var(--font-mono);font-weight:600;color:var(--ibm-blue-50)' : ''}">
          ${_esc(val)}</td>`;
      }).join("") +
      `</tr>`
    ).join("");

    const moreRow = hiddenN > 0
      ? `<tr><td colspan="${columns.length}" style="padding:8px 12px;font-size:11px;
          color:var(--text-tertiary);background:var(--bg-layer-2);text-align:center;
          font-style:italic">… and ${hiddenN} more case${hiddenN !== 1 ? 's' : ''}</td></tr>`
      : "";

    return `<div style="border:1px solid var(--border-subtle);border-radius:var(--radius-md);
      overflow:hidden;margin-top:0">
      <div style="overflow-x:auto;max-height:220px;overflow-y:auto;scrollbar-width:thin">
        <table style="width:100%;border-collapse:collapse;min-width:400px">
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${dataRows}${moreRow}</tbody>
        </table>
      </div>
    </div>`;
  }

  /* ── Main intercept ──────────────────────────────────── */
  function intercept(opts) {
    /*  opts:
        - actionType      string   e.g. "Bulk Reassignment"
        - actionKey       string   e.g. "bulk_reassign"
        - summary         string   multi-line human description
        - affectedCases   array    objects with keys matching previewColumns
        - previewColumns  array    [{ key, label }]
        - onConfirm       fn       called if admin types CONFIRM and clicks Proceed
        - onCancel        fn?      called on cancel (optional)
        - severity        string?  "high" (default) | "critical"
    */
    const count      = (opts.affectedCases || []).length;
    const severity   = opts.severity || (count >= 20 ? "critical" : "high");
    const accentColor = severity === "critical" ? "var(--red)" : "var(--orange)";
    const accentBg    = severity === "critical" ? "rgba(218,30,40,.08)" : "rgba(245,166,35,.08)";
    const accentBorder= severity === "critical" ? "rgba(218,30,40,.25)" : "rgba(245,166,35,.3)";

    /* Remove any existing guard overlay */
    document.getElementById("sg-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "sg-overlay";
    overlay.style.cssText = [
      "position:fixed;inset:0;z-index:var(--z-modal)",
      "background:rgba(0,0,0,0.65);backdrop-filter:blur(4px)",
      "display:flex;align-items:center;justify-content:center;padding:20px",
      "animation:sg-fade-in .2s ease"
    ].join(";");

    /* Inject keyframe once */
    if (!document.getElementById("sg-styles")) {
      const style = document.createElement("style");
      style.id = "sg-styles";
      style.textContent = `
        @keyframes sg-fade-in { from { opacity:0 } to { opacity:1 } }
        @keyframes sg-slide-in { from { opacity:0;transform:translateY(16px) } to { opacity:1;transform:translateY(0) } }
        #sg-modal { animation: sg-slide-in .25s ease; }
        #sg-confirm-input::placeholder { color: var(--text-disabled); }
        #sg-confirm-input:focus { border-color: var(--ibm-blue-50) !important; outline: none /* focus-visible handles focus ring */; box-shadow: 0 0 0 3px rgba(15,98,254,.15); }
        #sg-confirm-input.sg-input-valid { border-color: var(--green) !important; box-shadow: 0 0 0 3px rgba(25,128,56,.15); }
        #sg-confirm-input.sg-input-invalid { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(218,30,40,.12); }
        .sg-proceed-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .sg-proceed-btn:not(:disabled):hover { filter: brightness(1.1); }
      `;
      document.head.appendChild(style);
    }

    const summaryLines = (opts.summary || "").split("\n").map(l =>
      `<div style="font-size:13px;color:var(--text-primary);line-height:1.6">${_esc(l)}</div>`
    ).join("");

    const previewHtml = (opts.affectedCases && opts.affectedCases.length && opts.previewColumns)
      ? `<div style="margin-top:14px">
           <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
             <span class="c-tertiary">${IC.eye}</span>
             <span style="font-size:var(--font-size-xs);font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
               Preview — ${count} case${count !== 1 ? 's' : ''} affected
             </span>
           </div>
           ${_buildPreviewTable(opts.affectedCases, opts.previewColumns)}
         </div>`
      : "";

    overlay.innerHTML = `
      <div id="sg-modal" style="
        background:var(--bg-base,#161616);
        border:1px solid ${accentBorder};
        border-radius:14px;
        width:100%;max-width:600px;
        box-shadow:0 32px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04);
        font-family:var(--font-sans,'IBM Plex Sans',sans-serif);
        overflow:hidden;
      ">

        <!-- Header band -->
        <div style="
          background:${accentBg};
          border-bottom:1px solid ${accentBorder};
          padding:18px 22px;
          display:flex;align-items:flex-start;gap:14px;
        ">
          <div style="
            width:42px;height:42px;border-radius:var(--radius-md);flex-shrink:0;
            background:${severity === 'critical' ? 'rgba(218,30,40,.15)' : 'rgba(245,166,35,.12)'};
            border:1px solid ${accentBorder};
            display:flex;align-items:center;justify-content:center;
            color:${accentColor};
          ">${IC.warn}</div>
          <div class="flex-1-0">
            <div style="font-size:15px;font-weight:700;color:${accentColor};letter-spacing:var(--tracking-tight)">
              High Impact Operation Detected
            </div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:3px">
              ${_esc(opts.actionType)} · ${count} case${count !== 1 ? 's' : ''} affected
            </div>
          </div>
          <button id="sg-close-x" style="
            background:none;border:none;cursor:pointer;
            color:var(--text-tertiary);padding:4px;line-height:1;
            border-radius:var(--radius-xs);transition:color var(--t-fast);flex-shrink:0;
          " title="Cancel">${IC.close}</button>
        </div>

        <!-- Body -->
        <div style="padding:20px 22px">

          <!-- Summary block -->
          <div style="
            background:var(--bg-layer,#262626);
            border:1px solid var(--border-subtle);
            border-left:3px solid ${accentColor};
            border-radius:0 var(--radius-md) var(--radius-md) 0;
            padding:12px 16px;
            margin-bottom:2px;
          ">
            ${summaryLines}
          </div>

          <!-- Preview table -->
          ${previewHtml}

          <!-- CONFIRM input area -->
          <div style="margin-top:18px;padding:14px 16px;background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;display:flex;align-items:center;gap:6px">
              <span style="color:${accentColor}">${IC.warn}</span>
              To proceed, type <code style="font-family:var(--font-mono);background:var(--bg-layer-2);color:${accentColor};padding:1px 7px;border-radius:var(--radius-xs);font-size:12px;font-weight:600;border:1px solid ${accentBorder}">CONFIRM</code> in the box below
            </div>
            <input
              id="sg-confirm-input"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="Type CONFIRM to enable the Proceed button"
              style="
                width:100%;box-sizing:border-box;
                padding:9px 12px;
                background:var(--bg-base,#161616);
                border:1px solid var(--border-mid);
                border-radius:var(--radius-sm);
                color:var(--text-primary);
                font-size:13px;font-family:var(--font-mono);font-weight:600;
                letter-spacing:.05em;
                transition:border-color var(--transition-fast),box-shadow .15s;
              "
            />
            <div id="sg-confirm-hint" style="margin-top:6px;font-size:var(--font-size-xs);color:var(--text-disabled);min-height:16px"></div>
          </div>

          <!-- Audit notice -->
          <div style="margin-top:12px;display:flex;align-items:center;gap:8px;font-size:var(--font-size-xs);color:var(--text-tertiary)">
            <span class="c-blue">${IC.audit}</span>
            This action will be recorded in the Admin Audit Log with a full trail of changes.
          </div>
        </div>

        <!-- Footer -->
        <div style="
          padding:14px 22px;
          background:var(--bg-layer,#262626);
          border-top:1px solid var(--border-subtle);
          display:flex;align-items:center;justify-content:flex-end;gap:10px;
        ">
          <button id="sg-cancel-btn" class="btn btn-ghost" style="min-width:90px">
            ${IC.close} Cancel
          </button>
          <button id="sg-proceed-btn" class="btn sg-proceed-btn" disabled style="
            min-width:140px;justify-content:center;
            background:${severity === 'critical' ? 'var(--red)' : 'var(--yellow-text)'};
            color:#fff;border-color:${severity === 'critical' ? 'var(--red)' : 'var(--yellow-text)'};
          ">
            ${IC.check} Proceed (${count})
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    /* Wire input validation */
    const input    = document.getElementById("sg-confirm-input");
    const procBtn  = document.getElementById("sg-proceed-btn");
    const hintEl   = document.getElementById("sg-confirm-hint");

    function validateInput() {
      const v = (input.value || "").trim().toUpperCase();
      const ok = v === "CONFIRM";
      input.classList.toggle("sg-input-valid",   ok);
      input.classList.toggle("sg-input-invalid", !ok && v.length > 0);
      procBtn.disabled = !ok;
      if (!ok && v.length > 0) {
        hintEl.style.color = "var(--red)";
        hintEl.textContent = "Type exactly: CONFIRM (all caps)";
      } else if (ok) {
        hintEl.style.color = "var(--green)";
        hintEl.textContent = "✓ Ready to proceed";
      } else {
        hintEl.textContent = "";
      }
    }

    input.addEventListener("input", validateInput);
    setTimeout(() => input.focus(), 80);

    /* Close helpers */
    function doCancel() {
      overlay.remove();
      if (typeof opts.onCancel === "function") opts.onCancel();
    }

    function doProceed() {
      const v = (input.value || "").trim().toUpperCase();
      if (v !== "CONFIRM") return;

      overlay.remove();

      /* Build and persist audit entry */
      const auditEntry = {
        id:           Date.now(),
        actionType:   opts.actionType  || "Unknown Action",
        actionKey:    opts.actionKey   || "unknown",
        adminUser:    "Admin",
        affectedCount: count,
        affectedCases: (opts.affectedCases || []).slice(0, 100), // cap stored preview
        columns:       opts.previewColumns || [],
        summary:       opts.summary || "",
        timestamp:     new Date().toLocaleString(),
        severity:      severity,
        status:        "executed",
      };
      _pushAudit(auditEntry);

      /* Also push a synthetic change entry so it appears in Admin Audit History */
      if (typeof Data !== "undefined" && Data.pushChange) {
        Data.pushChange({
          id:          auditEntry.id,
          caseNumber:  `[Bulk: ${count} cases]`,
          field:       opts.actionType,
          oldValue:    opts.affectedCases && opts.affectedCases[0]
                         ? (opts.affectedCases[0].currentOwner || opts.affectedCases[0].oldValue || "—")
                         : "—",
          newValue:    opts.affectedCases && opts.affectedCases[0]
                         ? (opts.affectedCases[0].newOwner || opts.affectedCases[0].newValue || "—")
                         : "—",
          updatedBy:   "Admin",
          timestamp:   auditEntry.timestamp,
          isBulk:      true,
          bulkCount:   count,
        });
      }

      if (typeof opts.onConfirm === "function") opts.onConfirm(auditEntry);
    }

    document.getElementById("sg-cancel-btn")?.addEventListener("click", doCancel);
    document.getElementById("sg-close-x")?.addEventListener("click", doCancel);
    document.getElementById("sg-proceed-btn")?.addEventListener("click", doProceed);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") doProceed();
      if (e.key === "Escape") doCancel();
    });
    overlay.addEventListener("click", e => { if (e.target === overlay) doCancel(); });
  }

  /* ── Quick helpers for common action types ─────────── */

  /** Intercept bulk owner reassignment */
  function guardBulkReassign(caseNums, allCasesData, fromOwner, toOwner, onConfirm) {
    const fromShort = (typeof Utils !== "undefined") ? Utils.shortName(fromOwner) : fromOwner;
    const toShort   = (typeof Utils !== "undefined") ? Utils.shortName(toOwner)   : toOwner;
    const affected  = caseNums.map(num => {
      const row = allCasesData.find(c => c["Case Number"] === num);
      return {
        caseId:       num,
        currentOwner: fromShort,
        newOwner:     toShort,
        title:        row ? (row.Title || "").slice(0, 40) : "—",
        status:       row ? (row.Status || "—") : "—",
      };
    });
    intercept({
      actionType:    "Bulk Reassignment",
      actionKey:     "bulk_reassign",
      summary:       `You are about to reassign ${caseNums.length} case${caseNums.length !== 1 ? 's' : ''}\nFrom: ${fromShort}\nTo:     ${toShort}`,
      affectedCases: affected,
      previewColumns:[
        { key:"caseId",       label:"Case ID"       },
        { key:"currentOwner", label:"Current Owner" },
        { key:"newOwner",     label:"New Owner"     },
        { key:"status",       label:"Status"        },
      ],
      severity:      affected.length >= 20 ? "critical" : "high",
      onConfirm:     onConfirm,
    });
  }

  /** Intercept bulk performance tagging (import) */
  function guardBulkTagging(caseNums, tagType, onConfirm) {
    const label = tagType === "performance" ? "Performance" : "Non-Performance";
    const affected = caseNums.map(num => ({
      caseId:   num,
      tagBefore: "Untagged",
      tagAfter:  label,
    }));
    intercept({
      actionType:    `Bulk ${label} Tagging`,
      actionKey:     `bulk_tag_${tagType}`,
      summary:       `You are about to tag ${caseNums.length} case${caseNums.length !== 1 ? 's' : ''} as ${label}\nThis will affect performance tracking across all dashboards.`,
      affectedCases: affected,
      previewColumns:[
        { key:"caseId",    label:"Case ID"   },
        { key:"tagBefore", label:"Tag Before" },
        { key:"tagAfter",  label:"Tag After"  },
      ],
      severity:      caseNums.length >= 10 ? "critical" : "high",
      onConfirm:     onConfirm,
    });
  }

  /** Intercept data reset / clear-all */
  function guardClearData(onConfirm) {
    intercept({
      actionType:    "Data Reset",
      actionKey:     "clear_all_data",
      summary:       "You are about to clear ALL saved data\nThis includes: Performance tags · Work items · Change history · Audit log\nThis action CANNOT be undone.",
      affectedCases: [
        { item:"Performance case tags",  impact:"Permanently deleted" },
        { item:"Non-performance tags",   impact:"Permanently deleted" },
        { item:"Work item mappings",     impact:"Permanently deleted" },
        { item:"Audit & change history", impact:"Permanently deleted" },
      ],
      previewColumns:[
        { key:"item",   label:"Data Type"  },
        { key:"impact", label:"Impact"     },
      ],
      severity:      "critical",
      onConfirm:     onConfirm,
    });
  }

  /* ── Public API ──────────────────────────────────────── */
  return { intercept, guardBulkReassign, guardBulkTagging, guardClearData, auditLog };

})();

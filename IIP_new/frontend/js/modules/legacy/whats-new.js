/* ================================================================
   whats-new.js  —  "What's New" first-launch changelog modal
   ----------------------------------------------------------------
   Shows a modal on first visit after a new version is deployed.
   Uses localStorage key  "iip_seen_whats_new_v{MAJOR}.{MINOR}.{PATCH}"
   to ensure it only shows ONCE per version per browser.

   To add entries for a future release:
     1. Update AppVersion (version.js)
     2. Add a new entry to CHANGELOG array below
   ================================================================ */

const WhatsNew = (() => {

  /* ── Change log entries ───────────────────────────────────────
     type: "new" | "fix" | "improvement" | "removed"
     phase: optional label shown as a badge
  ─────────────────────────────────────────────────────────────── */
  const CHANGELOG = [
    {
      version: "8.5.7",
      date: "2026-03-18",
      title: "UI Consistency Overhaul",
      subtitle: "Phases 1–5 complete — search bars, buttons, form wrappers, and documentation",
      entries: [
        {
          type: "new",
          phase: "Phase 5",
          title: "COMPONENTS.md — full UI component library reference",
          detail: "A comprehensive developer reference covering every component: buttons (all types and sizes), search input, form input group, status badges, severity badges, notify bars, icons, typography scale, color tokens, spacing, border radius, transitions, and z-index stack. Lives at frontend/COMPONENTS.md.",
          tags: ["Documentation", "Developer reference"]
        },
        {
          type: "new",
          phase: "Phase 5",
          title: "CONSISTENCY.md — development rules and code review checklist",
          detail: "A rules document with the five golden rules, a complete PR checklist, a common-mistakes table with fixes, guidance on adding new components, and a full dashboard inventory. Lives at frontend/CONSISTENCY.md.",
          tags: ["Documentation", "Code review", "Standards"]
        },
        {
          type: "improvement",
          phase: "Phase 4",
          title: "form-input-group component — eliminates all ad-hoc icon wrappers",
          detail: "A new .form-input-group CSS component replaces every instance of position:relative wrapper + position:absolute icon span + manual padding-left across the codebase. Icon offset is standardized at 10px left; input padding-left is 32px automatically. Works with .form-input and .search-input.",
          tags: [".form-input-group", ".input-icon", "components.css"]
        },
        {
          type: "fix",
          phase: "Phase 4",
          title: "All inline padding-left and absolute icon spans eliminated",
          detail: "Six icon+input wrappers across admin-dash.js, changelog.js, info.js (×2), and rfe-tracking-advanced.js were migrated to .form-input-group. Zero inline padding-left values remain on search or form inputs.",
          tags: ["Admin", "Changelog", "Info", "RFE Advanced", "Code cleanup"]
        },
        {
          type: "improvement",
          phase: "Phase 4",
          title: "rfe-tracking-advanced search upgraded to .search-input",
          detail: "The RFE Tracking Advanced search input was using form-input form-input-sm with an inline padding-left. It is now a .search-input inside a .form-input-group, consistent with every other dashboard.",
          tags: ["RFE Advanced", "search-input"]
        },
        {
          type: "new",
          phase: "Phase 3",
          title: "Archive Search tab in Investigate dashboard",
          detail: "A new third tab — Archive Search — lets you search all permanently archived cases by case #, title, owner, product, or status. Results update in real-time with keyword highlighting, open cases floated to the top, and case number click-to-copy support.",
          tags: ["Investigate", "Archive", "Search"]
        },
        {
          type: "new",
          phase: "Phase 3",
          title: "ALM Lines search in Info dashboard",
          detail: "A search input has been added to the ALM Lines table header. Typing filters rows instantly by ALM line code, customer name, line responsible, case responsible, or proxy — without re-rendering the full page.",
          tags: ["Info", "ALM Lines", "Search"]
        },
        {
          type: "improvement",
          phase: "Phase 3",
          title: "IBM Contacts Directory search upgraded to .search-input",
          detail: "The existing contact directory search input (which already had filter logic) was upgraded from .form-input to the standardized .search-input class, giving it consistent focus states and placeholder styling.",
          tags: ["Info", "Directory", "Consistency"]
        },
        {
          type: "improvement",
          phase: "Phase 2",
          title: "Custom button classes formalized in components.css",
          detail: "Four custom button variants were scattered or undocumented. All are now in one place with documentation comments, :hover and :focus-visible states: .btn-overlay, .btn-danger-filled, .btn-warning, and .btn-micro.",
          tags: [".btn-overlay", ".btn-danger-filled", ".btn-warning", ".btn-micro"]
        },
        {
          type: "improvement",
          phase: "Phase 1",
          title: "Unified search bar styling across all dashboards",
          detail: "All search inputs across every dashboard now use a single .search-input CSS class — consistent padding, border, focus ring, and placeholder colour. Previously each dashboard had its own class or no class at all.",
          tags: ["All dashboards", "search-input", "Consistency"]
        }
      ]
    }
  ];

  /* ── Helpers ─────────────────────────────────────────────────── */
  const _storageKey = v => `iip_seen_whats_new_v${v}_p45_857`;

  const _hasBeenSeen = version => {
    try { return localStorage.getItem(_storageKey(version)) === "1"; } catch(e) { return true; }
  };

  const _markSeen = version => {
    try { localStorage.setItem(_storageKey(version), "1"); } catch(e) {}
  };

  /* ── Badge colour map ─────────────────────────────────────────── */
  const TYPE_CONFIG = {
    new:         { label: "New",         bg: "var(--ibm-blue-10)",  color: "var(--ibm-blue-50)",  border: "rgba(15,98,254,.25)"   },
    improvement: { label: "Improved",    bg: "rgba(25,128,56,.08)", color: "var(--green)",         border: "rgba(25,128,56,.25)"   },
    fix:         { label: "Fix",         bg: "var(--yellow-bg)",    color: "var(--yellow-text)",   border: "rgba(166,120,0,.25)"   },
    removed:     { label: "Deprecated",  bg: "var(--bg-layer)",     color: "var(--text-tertiary)", border: "var(--border-subtle)"  }
  };

  /* ── Render ───────────────────────────────────────────────────── */
  function _render(release) {
    const cfg = t => TYPE_CONFIG[t] || TYPE_CONFIG.improvement;

    const entriesHTML = release.entries.map(e => {
      const c = cfg(e.type);
      const typeBadge = `<span style="
        display:inline-block;padding:1px 7px;border-radius:999px;
        font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;
        background:${c.bg};color:${c.color};border:1px solid ${c.border};
        flex-shrink:0;line-height:1.6;
      ">${c.label}</span>`;

      const phaseBadge = e.phase ? `<span style="
        display:inline-block;padding:1px 7px;border-radius:999px;
        font-size:10px;font-weight:600;letter-spacing:.04em;
        background:var(--purple-bg);color:var(--purple);border:1px solid rgba(105,41,196,.2);
        flex-shrink:0;line-height:1.6;
      ">${e.phase}</span>` : "";

      const tagsHTML = (e.tags||[]).map(t =>
        `<span style="
          display:inline-block;padding:1px 6px;border-radius:var(--radius-sm);
          font-size:10px;font-family:var(--font-mono);
          background:var(--bg-layer);color:var(--text-tertiary);
          border:1px solid var(--border-subtle);
        ">${t}</span>`
      ).join(" ");

      return `
        <div style="
          padding:14px 0;
          border-bottom:1px solid var(--border-subtle);
          display:flex;flex-direction:column;gap:6px;
        ">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            ${typeBadge}${phaseBadge}
            <span style="font-size:13px;font-weight:600;color:var(--text-primary);">${e.title}</span>
          </div>
          <p style="margin:0;font-size:12px;color:var(--text-secondary);line-height:1.6;">${e.detail}</p>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">${tagsHTML}</div>
        </div>`;
    }).join("");

    return `
      <div id="whats-new-overlay" role="dialog" aria-modal="true" aria-label="What's new in ${release.version}" style="
        position:fixed;inset:0;z-index:1050;
        background:rgba(0,0,0,.55);
        backdrop-filter:blur(3px);
        display:flex;align-items:center;justify-content:center;
        padding:16px;
        animation:wn-fadein .18s ease;
      ">
        <style>
          @keyframes wn-fadein  { from { opacity:0; } to { opacity:1; } }
          @keyframes wn-slidein { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
          #whats-new-box { animation: wn-slidein .22s ease; }
          #whats-new-box:focus { outline:none; }
        </style>

        <div id="whats-new-box" tabindex="-1" style="
          background:var(--bg-ui);
          border:1px solid var(--border-mid);
          border-radius:var(--radius-md);
          width:100%;max-width:620px;
          max-height:88vh;
          display:flex;flex-direction:column;
          box-shadow:0 20px 60px rgba(0,0,0,.35);
          overflow:hidden;
        ">

          <!-- Header -->
          <div style="
            padding:18px 22px 14px;
            border-bottom:1px solid var(--border-subtle);
            display:flex;align-items:flex-start;gap:12px;
            background:var(--bg-ui);
            flex-shrink:0;
          ">
            <div style="
              width:38px;height:38px;border-radius:var(--radius-sm);
              background:var(--ibm-blue-10);border:1px solid rgba(15,98,254,.2);
              display:flex;align-items:center;justify-content:center;flex-shrink:0;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ibm-blue-50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
                <span style="font-size:16px;font-weight:700;color:var(--text-primary);">What's New</span>
                <span style="
                  font-size:11px;font-weight:600;padding:1px 8px;
                  border-radius:999px;font-family:var(--font-mono);
                  background:var(--ibm-blue-10);color:var(--ibm-blue-50);
                  border:1px solid rgba(15,98,254,.2);
                ">v${release.version}</span>
              </div>
              <p style="margin:0;font-size:12px;color:var(--text-secondary);">${release.subtitle}</p>
            </div>
            <button id="whats-new-close" aria-label="Close what's new" style="
              width:28px;height:28px;border-radius:var(--radius-sm);
              border:1px solid var(--border-mid);background:transparent;
              color:var(--text-tertiary);cursor:pointer;
              display:flex;align-items:center;justify-content:center;
              flex-shrink:0;transition:all var(--t-fast);
            " onmouseover="this.style.background='var(--red)';this.style.color='#fff';this.style.borderColor='var(--red)'"
               onmouseout="this.style.background='transparent';this.style.color='var(--text-tertiary)';this.style.borderColor='var(--border-mid)'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Scrollable body -->
          <div style="overflow-y:auto;padding:0 22px;flex:1;min-height:0;">
            ${entriesHTML}
            <!-- bottom padding spacer -->
            <div style="height:16px;"></div>
          </div>

          <!-- Footer -->
          <div style="
            padding:14px 22px;
            border-top:1px solid var(--border-subtle);
            display:flex;align-items:center;justify-content:space-between;
            background:var(--bg-layer);
            flex-shrink:0;
            gap:10px;flex-wrap:wrap;
          ">
            <span style="font-size:11px;color:var(--text-tertiary);">
              Released ${release.date} · ${release.entries.length} changes
            </span>
            <div style="display:flex;gap:8px;">
              <button id="whats-new-changelog" class="btn btn-secondary btn-sm" style="font-size:12px;">
                View full changelog
              </button>
              <button id="whats-new-dismiss" class="btn btn-primary btn-sm" style="font-size:12px;">
                Got it
              </button>
            </div>
          </div>

        </div>
      </div>`;
  }

  /* ── Public: show ─────────────────────────────────────────────── */
  function show(forceVersion) {
    // Find the most recent unseen release, or the forced version
    const release = forceVersion
      ? CHANGELOG.find(r => r.version === forceVersion)
      : CHANGELOG.find(r => !_hasBeenSeen(r.version));

    if (!release) return;

    // Inject HTML
    const container = document.createElement("div");
    container.innerHTML = _render(release);
    document.body.appendChild(container);

    const overlay = document.getElementById("whats-new-overlay");
    const box     = document.getElementById("whats-new-box");

    // Focus trap
    setTimeout(() => box && box.focus(), 50);

    function dismiss() {
      if (!forceVersion) _markSeen(release.version);
      overlay && overlay.remove();
      container.remove();
    }

    document.getElementById("whats-new-dismiss")?.addEventListener("click", dismiss);
    document.getElementById("whats-new-close")?.addEventListener("click", dismiss);

    document.getElementById("whats-new-changelog")?.addEventListener("click", () => {
      dismiss();
      // Navigate to the changelog tab
      setTimeout(() => {
        if (typeof App !== "undefined" && typeof App.renderTab === "function") {
          App.renderTab("changelog");
        } else {
          window.location.hash = "changelog";
        }
      }, 120);
    });

    // Dismiss on backdrop click
    overlay?.addEventListener("click", e => { if (e.target === overlay) dismiss(); });

    // Dismiss on Escape
    function onKey(e) {
      if (e.key === "Escape") { dismiss(); document.removeEventListener("keydown", onKey); }
    }
    document.addEventListener("keydown", onKey);
  }

  /* ── Auto-init: fire after app is ready ──────────────────────── */
  function _autoInit() {
    // Wait for the app ready flag (set in app.js after data loads)
    const MAX_WAIT = 15000;
    const TICK     = 300;
    let   waited   = 0;

    function tryShow() {
      if (window._iipAppReady) {
        // Small delay so the UI settles before modal appears
        setTimeout(() => show(), 600);
      } else if (waited < MAX_WAIT) {
        waited += TICK;
        setTimeout(tryShow, TICK);
      }
    }

    tryShow();
  }

  /* ── Expose ───────────────────────────────────────────────────── */
  return Object.freeze({ show, init: _autoInit });

})();

// Boot
document.addEventListener("DOMContentLoaded", () => WhatsNew.init());

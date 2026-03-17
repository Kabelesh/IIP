/* ============================================================
   js/modules/modal.js  —  Modal / Dialog System
   IBM Case Intelligence Platform
   Provides: Modal.open(), Modal.close(), Modal.showReassign(),
             Modal.showSetupSecurityQuestions()
   ============================================================ */
const Modal = (() => {

  const SECURITY_KEY = "ibm_admin_security_v1";

  /* ── helpers ── */
  function _overlay() { return document.getElementById("modal-overlay"); }
  function _box()     { return document.getElementById("modal-box"); }
  function _title()   { return document.getElementById("modal-title"); }
  function _body()    { return document.getElementById("modal-body"); }

  /* ── Init — wire persistent close handlers ── */
  let _inited = false;
  function init() {
    if (_inited) return;
    _inited = true;
    const ov = _overlay();
    // Persistent listeners (not once) — survive multiple open/close cycles
    document.getElementById("modal-close")?.addEventListener("click", close);
    ov?.addEventListener("click", e => { if (e.target === ov) close(); });
    // ESC key closes modal
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && ov && !ov.classList.contains("hidden")) close();
    });
  }

  /* ── Generic open / close ── */
  function open(title, html) {
    const ov = _overlay(), t = _title(), b = _body();
    if (!ov || !t || !b) return;
    if (!_inited) init(); // auto-init on first use
    t.textContent = title;
    b.innerHTML   = html;
    ov.classList.remove("hidden");
    ov.style.display = "flex";
  }

  function close() {
    const ov = _overlay();
    if (!ov) return;
    ov.classList.add("hidden");
    ov.style.display = "none";
    const b = _body();
    if (b) b.innerHTML = "";
  }

  /* ── Reassign modal ── */
  function showReassign(row, onConfirm) {
    const caseNum = row?.["Case Number"] || row?.caseNumber || row?.CaseNumber || "—";
    // Use the live (possibly overridden) owner as current assignment
    const current  = row?.Owner || row?.owner || "—";
    // Show original owner if this case was previously reassigned via admin
    const original = row?._originalOwner || null;
    // Get team members — fall back to unique owners from all cases if list is empty
    let members = (typeof Data !== "undefined") ? Data.teamMembers().slice().sort() : [];
    if (!members.length && typeof Data !== "undefined") {
      const seen = new Set();
      Data.allCases().forEach(c => { if (c.Owner) seen.add(c.Owner); });
      members = [...seen].sort();
    }

    const opts = [
      `<option value="" disabled selected>— Select new owner —</option>`,
      ...members.map(m =>
        `<option value="${_esc(m)}">${_esc(Utils.shortName ? Utils.shortName(m) : m)}</option>`
      )
    ].join("");

    // Look up full reassignment history for this case from the log
    const reassignHistory = (typeof Data !== "undefined" && Data.getReassignLog)
      ? Data.getReassignLog().filter(e => e.caseNum === caseNum)
      : [];

    // Build reassignment history banner (shown if case was previously reassigned)
    const historyBanner = reassignHistory.length
      ? `<div style="margin-top:10px;background:rgba(224,112,0,.07);border:1px solid rgba(224,112,0,.25);
            border-radius:var(--radius-sm);padding:10px 12px">
          <div style="font-size:11px;font-weight:700;color:var(--orange,#ff832b);text-transform:uppercase;
            letter-spacing:.04em;margin-bottom:7px;display:flex;align-items:center;gap:5px">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Already reassigned ${reassignHistory.length} time${reassignHistory.length > 1 ? "s" : ""}
          </div>
          <div style="display:flex;flex-direction:column;gap:5px">
            ${reassignHistory.map(e => {
              const sOld = (typeof Utils !== "undefined" && Utils.shortName) ? Utils.shortName(e.oldOwner || "—") : (e.oldOwner || "—");
              const sNew = (typeof Utils !== "undefined" && Utils.shortName) ? Utils.shortName(e.newOwner || "—") : (e.newOwner || "—");
              return `<div style="display:flex;align-items:center;gap:6px;font-size:12px;flex-wrap:wrap">
                <span style="color:var(--text-tertiary)">${_esc(sOld)}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--orange,#ff832b)"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
                <span style="color:var(--text-primary);font-weight:600">${_esc(sNew)}</span>
                <span style="color:var(--text-disabled);font-size:10px;margin-left:2px">${_esc(e.ts || "")}</span>
              </div>`;
            }).join("")}
          </div>
        </div>`
      : "";

    open("Reassign Case", `
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:${reassignHistory.length ? 0 : 14}px">
        Case <strong class="mono-blue">${_esc(caseNum)}</strong>
        is currently assigned to <strong>${_esc(current)}</strong>.
      </div>
      ${reassignHistory.length ? historyBanner + `<div style="margin-bottom:14px"></div>` : ""}
      <label style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px;letter-spacing:.02em">
        REASSIGN TO
      </label>
      <!-- Custom dropdown — renders via position:fixed to escape modal overflow clipping -->
      <div id="modal-reassign-wrap" style="position:relative;margin-bottom:20px">
        <button id="modal-reassign-trigger" type="button"
          style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;
            padding:8px 12px;border:1px solid var(--border-mid);border-radius:var(--radius-sm);
            background:var(--bg-input,var(--bg-ui));color:var(--text-tertiary);font-size:14px;
            cursor:pointer;text-align:left;transition:border-color .15s">
          <span id="modal-reassign-label">— Select new owner —</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <input type="hidden" id="modal-reassign-value" value=""/>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="modal-reassign-cancel" class="btn btn-ghost btn-sm">Cancel</button>
        <button id="modal-reassign-confirm" class="btn btn-primary btn-sm">Confirm Reassign</button>
      </div>
    `);

    // ── Custom fixed-position dropdown ──────────────────────────────────────
    const confirmBtn = document.getElementById("modal-reassign-confirm");
    const trigger    = document.getElementById("modal-reassign-trigger");
    const labelEl    = document.getElementById("modal-reassign-label");
    const valueInput = document.getElementById("modal-reassign-value");

    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.style.opacity = "0.45"; }

    // Build the floating list element (appended to body so no overflow clipping)
    const dropList = document.createElement("div");
    dropList.id = "modal-reassign-droplist";
    dropList.style.cssText = [
      "position:fixed;z-index:99999;background:var(--bg-ui);border:1px solid var(--border-mid)",
      "border-radius:var(--radius-sm);box-shadow:0 8px 24px rgba(0,0,0,.18)",
      "max-height:240px;overflow-y:auto;scrollbar-width:thin;display:none;min-width:200px"
    ].join(";");

    members.forEach(m => {
      const shortM = (typeof Utils !== "undefined" && Utils.shortName) ? Utils.shortName(m) : m;
      const item = document.createElement("div");
      item.dataset.value = m;
      item.textContent   = shortM;
      item.style.cssText = "padding:8px 14px;cursor:pointer;font-size:13px;color:var(--text-primary);transition:background .1s";
      item.addEventListener("mouseenter", () => { item.style.background = "var(--bg-layer)"; });
      item.addEventListener("mouseleave", () => { item.style.background = ""; });
      item.addEventListener("mousedown", e => {
        e.preventDefault();
        valueInput.value = m;
        labelEl.textContent = shortM;
        labelEl.style.color = "var(--text-primary)";
        trigger.style.borderColor = "var(--ibm-blue-50)";
        if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.style.opacity = "1"; }
        closeList();
      });
      dropList.appendChild(item);
    });
    document.body.appendChild(dropList);

    function positionList() {
      const r = trigger.getBoundingClientRect();
      dropList.style.top   = (r.bottom + 4) + "px";
      dropList.style.left  = r.left + "px";
      dropList.style.width = r.width + "px";
    }
    function openList()  { positionList(); dropList.style.display = "block"; }
    function closeList() { dropList.style.display = "none"; }

    trigger.addEventListener("click", e => {
      e.stopPropagation();
      if (dropList.style.display === "none") openList(); else closeList();
    });
    // Close when clicking outside
    function _outsideClick(e) {
      if (!trigger.contains(e.target) && !dropList.contains(e.target)) closeList();
    }
    document.addEventListener("mousedown", _outsideClick);

    // Cleanup when modal closes
    const origClose = close;
    const _cleanupDrop = () => {
      dropList.remove();
      document.removeEventListener("mousedown", _outsideClick);
    };
    document.getElementById("modal-reassign-cancel")?.addEventListener("click", () => { _cleanupDrop(); close(); });
    document.getElementById("modal-box")?.querySelector(".modal-close")?.addEventListener("click", _cleanupDrop, { once: true });

    confirmBtn?.addEventListener("click", () => {
      const newOwner = valueInput.value;
      if (!newOwner) return;
      _cleanupDrop();
      if (newOwner === current) {
        if (!confirm(`${newOwner} is already the current owner. Reassign anyway?`)) return;
      }
      if (typeof onConfirm === "function") onConfirm(caseNum, newOwner);
      close();
    });
  }

  /* ── Security Questions setup ── */
  function showSetupSecurityQuestions() {
    const QUESTIONS = [
      "What is the name of your first pet?",
      "What city were you born in?",
      "What is your mother's maiden name?",
      "What was the name of your first school?",
      "What is your favourite movie?"
    ];
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(SECURITY_KEY) || "{}"); } catch(_) {}

    const qOpts = (sel) => QUESTIONS.map(q =>
      `<option value="${_esc(q)}" ${sel === q ? "selected" : ""}>${_esc(q)}</option>`
    ).join("");

    open("Security Questions", `
      <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:16px;line-height:1.5">
        Set up two security questions. These can be used to verify your identity if you forget your admin password.
      </div>

      <!-- Q1 -->
      <div class="mb-14">
        <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);display:block;margin-bottom:5px">Question 1</label>
        <select id="modal-sq1" class="form-input" style="width:100%;margin-bottom:6px">
          ${qOpts(saved.q1 || "")}
        </select>
        <input id="modal-sa1" type="text" class="form-input" placeholder="Your answer"
          value="${_esc(saved.a1 || "")}"
          style="width:100%;box-sizing:border-box" autocomplete="off"/>
      </div>

      <!-- Q2 -->
      <div style="margin-bottom:18px">
        <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);display:block;margin-bottom:5px">Question 2</label>
        <select id="modal-sq2" class="form-input" style="width:100%;margin-bottom:6px">
          ${qOpts(saved.q2 || "")}
        </select>
        <input id="modal-sa2" type="text" class="form-input" placeholder="Your answer"
          value="${_esc(saved.a2 || "")}"
          style="width:100%;box-sizing:border-box" autocomplete="off"/>
      </div>

      <div id="modal-sq-msg" style="font-size:12px;font-weight:600;min-height:18px;margin-bottom:10px;display:none"></div>

      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="modal-sq-cancel" class="btn btn-ghost btn-sm">Cancel</button>
        <button id="modal-sq-save" class="btn btn-primary btn-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Save Questions
        </button>
      </div>
    `);

    document.getElementById("modal-sq-cancel")?.addEventListener("click", close);
    document.getElementById("modal-sq-save")?.addEventListener("click", () => {
      const q1 = document.getElementById("modal-sq1")?.value?.trim();
      const a1 = document.getElementById("modal-sa1")?.value?.trim();
      const q2 = document.getElementById("modal-sq2")?.value?.trim();
      const a2 = document.getElementById("modal-sa2")?.value?.trim();
      const msg = document.getElementById("modal-sq-msg");

      if (!a1 || !a2) {
        if (msg) { msg.style.display = "block"; msg.style.color = "var(--red)"; msg.textContent = "⚠ Please provide answers for both questions."; }
        return;
      }
      if (q1 === q2) {
        if (msg) { msg.style.display = "block"; msg.style.color = "var(--red)"; msg.textContent = "⚠ Please choose two different questions."; }
        return;
      }
      try {
        localStorage.setItem(SECURITY_KEY, JSON.stringify({ q1, a1: a1.toLowerCase(), q2, a2: a2.toLowerCase() }));
      } catch(_) {}
      if (msg) { msg.style.display = "block"; msg.style.color = "var(--green,#24a148)"; msg.textContent = "✅ Security questions saved successfully!"; }
      setTimeout(close, 1500);
    });
  }

  /* ── private escape helper ── */
  function _esc(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  return { init, open, close, showReassign, showSetupSecurityQuestions };
})();

/* ================================================================
   custom-select.js — IBM Case Intelligence Platform v7.4
   Clean dropdown replacing all native <select> elements.

   KEY: Dropdown panel is appended to document.body (portal)
   with position:fixed so it's never clipped by overflow:hidden
   or overflow:auto ancestor containers (e.g. scrollable tables).
   ================================================================ */

const CustomSelect = (() => {

  const SKIP_IDS  = new Set(["file-input", "reload-input"]);
  const SM_CLASSES = ["form-input-sm", "form-select-sm"];

  let _openWrapper = null; // currently open wrapper element
  let _openDrop    = null; // currently open drop panel (in body)

  /* ── Portal: single container in <body> for all dropdowns ── */
  let _portal = null;
  function _getPortal() {
    if (!_portal || !document.contains(_portal)) {
      _portal = document.createElement("div");
      _portal.id = "cs-portal";
      _portal.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:var(--z-modal)0;pointer-events:none";
      document.body.appendChild(_portal);
    }
    return _portal;
  }

  /* ── Position a portal drop below (or above) its wrapper ── */
  function _positionDrop(wrapper, drop) {
    const rect   = wrapper.getBoundingClientRect();
    const dropH  = Math.min(268, drop.scrollHeight || (parseInt(drop.dataset.optCount || "5") * 33 + 10));
    const below  = window.innerHeight - rect.bottom;
    const above  = rect.top;
    const openUp = below < dropH && above > below;

    drop.style.left    = rect.left + "px";
    drop.style.width   = Math.max(rect.width, 140) + "px";
    drop.style.pointerEvents = "auto";

    if (openUp) {
      drop.style.top    = "";
      drop.style.bottom = (window.innerHeight - rect.top) + "px";
      drop.classList.add("cs-up");
    } else {
      drop.style.top    = (rect.bottom + 2) + "px";
      drop.style.bottom = "";
      drop.classList.remove("cs-up");
    }
  }

  /* ════════════════════════════════════════════════════════
     Core: wrap one <select>
  ════════════════════════════════════════════════════════ */
  function wrap(sel) {
    if (!sel || sel.dataset.csWrapped === "1") return;
    if (sel.tagName !== "SELECT")              return;
    if (sel.multiple)                          return;
    if (sel.dataset.csSkip !== undefined)      return;
    if (SKIP_IDS.has(sel.id))                 return;
    if (sel.closest(".cs-wrapper"))            return;
    if (sel.closest("datalist"))               return;

    sel.dataset.csWrapped = "1";
    sel.style.display = "none";

    const isSm = SM_CLASSES.some(c => sel.classList.contains(c)) ||
                 (sel.style.fontSize && parseInt(sel.style.fontSize) <= 12);

    /* Wrapper (inline container next to the hidden select) */
    const wrapper = document.createElement("div");
    wrapper.className = "cs-wrapper" + (isSm ? " cs-sm" : "");

    ["width","minWidth","maxWidth","flex","flexShrink","flexGrow"].forEach(p => {
      const v = sel.style[p]; if (v) wrapper.style[p] = v;
    });

    const specialBorder = sel.style.borderColor || "";
    const specialBg     = (sel.style.background && sel.style.background !== "var(--bg-input)")
                          ? sel.style.background : "";

    /* Trigger button */
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cs-trigger";
    if (specialBorder) trigger.style.borderColor = specialBorder;
    if (specialBg)     trigger.style.background  = specialBg;
    if (sel.style.fontFamily) trigger.style.fontFamily = sel.style.fontFamily;
    if (sel.style.fontWeight) trigger.style.fontWeight = sel.style.fontWeight;

    const triggerText = document.createElement("span");
    triggerText.className = "cs-trigger-text";

    const triggerChev = document.createElement("span");
    triggerChev.className = "cs-trigger-chev";
    triggerChev.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>';

    trigger.appendChild(triggerText);
    trigger.appendChild(triggerChev);
    wrapper.appendChild(trigger);
    sel.parentNode.insertBefore(wrapper, sel.nextSibling);

    /* Drop panel — lives in the portal (body-level) */
    const drop = document.createElement("div");
    drop.className = "cs-drop" + (isSm ? " cs-sm" : "");
    drop.style.display = "none";
    drop.style.position = "fixed";
    _getPortal().appendChild(drop);

    /* Link wrapper ↔ drop */
    const dropId = "csd-" + Math.random().toString(36).slice(2);
    wrapper.dataset.dropId = dropId;
    drop.dataset.dropId    = dropId;

    /* ── Build options ── */
    function rebuildOptions() {
      drop.innerHTML = "";
      let count = 0;
      Array.from(sel.options).forEach((opt, idx) => {
        if (opt.hidden) return;
        const item = document.createElement("button");
        item.type = "button";
        item.className = "cs-opt" + (opt.disabled ? " cs-opt-disabled" : "");
        item.disabled = opt.disabled;
        item.dataset.value = opt.value;
        item.dataset.idx   = String(idx);
        item.textContent   = opt.text;
        drop.appendChild(item);
        count++;
      });
      drop.dataset.optCount = String(count);
      syncDisplay();
    }

    function syncDisplay() {
      const cur = sel.options[sel.selectedIndex];
      if (cur) {
        triggerText.textContent = cur.text;
        triggerText.classList.toggle("cs-placeholder", !cur.value);
      }
      drop.querySelectorAll(".cs-opt").forEach(item => {
        item.classList.toggle("cs-opt-active", item.dataset.value === sel.value);
      });
      // Reflect special border back after value change
      if (specialBorder) trigger.style.borderColor = specialBorder;
    }

    /* ── Open / close ── */
    function open() {
      if (_openWrapper && _openWrapper !== wrapper) closeAll();
      _openWrapper = wrapper;
      _openDrop    = drop;

      drop.style.display = "block";
      wrapper.classList.add("cs-open");
      triggerChev.style.transform = "rotate(180deg)";
      _positionDrop(wrapper, drop);

      // v4: Reposition on scroll of any ancestor to prevent misalignment
      const _scrollParents = [];
      let p = wrapper.parentElement;
      while (p) {
        if (p.scrollHeight > p.clientHeight || p.scrollWidth > p.clientWidth) {
          const handler = () => _positionDrop(wrapper, drop);
          p.addEventListener("scroll", handler, { passive: true });
          _scrollParents.push({ el: p, handler });
        }
        p = p.parentElement;
      }
      window.addEventListener("scroll", () => _positionDrop(wrapper, drop), { passive: true, once: false });
      drop._scrollCleanup = () => {
        _scrollParents.forEach(({ el, handler }) => el.removeEventListener("scroll", handler));
      };

      const active = drop.querySelector(".cs-opt-active");
      if (active) setTimeout(() => active.scrollIntoView({ block: "nearest" }), 0);
    }

    function close() {
      if (drop._scrollCleanup) { drop._scrollCleanup(); drop._scrollCleanup = null; }
      drop.style.display = "none";
      wrapper.classList.remove("cs-open");
      triggerChev.style.transform = "";
      if (_openWrapper === wrapper) { _openWrapper = null; _openDrop = null; }
    }

    function toggle() { drop.style.display === "block" ? close() : open(); }

    /* ── Events ── */
    trigger.addEventListener("click", e => { e.stopPropagation(); toggle(); });

    drop.addEventListener("click", e => {
      const item = e.target.closest(".cs-opt");
      if (!item || item.disabled) return;
      e.stopPropagation();
      sel.value = item.dataset.value;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      sel.dispatchEvent(new Event("input",  { bubbles: true }));
      close();
      syncDisplay();
    });

    trigger.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); return; }
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (drop.style.display !== "block") { open(); return; }
        const items = [...drop.querySelectorAll(".cs-opt:not([disabled])")];
        let idx = items.findIndex(i => i.classList.contains("cs-opt-active"));
        idx = e.key === "ArrowDown" ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
        items[idx]?.focus();
      }
    });

    drop.addEventListener("keydown", e => {
      if (e.key === "Escape") { close(); trigger.focus(); return; }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const focused = document.activeElement;
        if (focused?.classList.contains("cs-opt") && !focused.disabled) {
          sel.value = focused.dataset.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          sel.dispatchEvent(new Event("input",  { bubbles: true }));
          close(); syncDisplay(); trigger.focus();
        }
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = [...drop.querySelectorAll(".cs-opt:not([disabled])")];
        const cur = document.activeElement;
        let idx = items.indexOf(cur);
        idx = e.key === "ArrowDown" ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
        items[idx]?.focus();
      }
    });

    /* Reposition on scroll/resize while open */
    const reposition = () => {
      if (drop.style.display === "block") _positionDrop(wrapper, drop);
    };
    window.addEventListener("scroll",  reposition, { passive: true, capture: true });
    window.addEventListener("resize",  reposition, { passive: true });

    /* Observe option changes */
    const optObs = new MutationObserver(rebuildOptions);
    optObs.observe(sel, { childList: true });

    /* Poll for programmatic value changes */
    let _lastVal = sel.value;
    const poll = setInterval(() => {
      if (!document.contains(sel)) {
        clearInterval(poll); optObs.disconnect();
        window.removeEventListener("scroll", reposition, { capture: true });
        window.removeEventListener("resize", reposition);
        if (drop.parentNode) drop.parentNode.removeChild(drop);
        return;
      }
      if (sel.value !== _lastVal) { _lastVal = sel.value; syncDisplay(); }
    }, 150);

    rebuildOptions();
  }

  /* ── Close all open dropdowns ── */
  function closeAll() {
    document.querySelectorAll(".cs-drop").forEach(d => {
      d.style.display = "none";
    });
    document.querySelectorAll(".cs-wrapper.cs-open").forEach(w => {
      w.classList.remove("cs-open");
      const chev = w.querySelector(".cs-trigger-chev");
      if (chev) chev.style.transform = "";
    });
    _openWrapper = null;
    _openDrop    = null;
  }

  function wrapAll(root) {
    (root || document)
      .querySelectorAll("select:not([data-cs-wrapped]):not([data-cs-skip]):not([multiple])")
      .forEach(wrap);
  }

  document.addEventListener("click", e => {
    if (!e.target.closest(".cs-wrapper") && !e.target.closest(".cs-drop")) closeAll();
  });

  const globalObs = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.tagName === "SELECT") { wrap(node); return; }
        node.querySelectorAll?.("select:not([data-cs-wrapped]):not([data-cs-skip]):not([multiple])")
          .forEach(wrap);
      });
    });
  });

  function init() {
    wrapAll(document);
    globalObs.observe(document.body, { childList: true, subtree: true });
  }

  return { init, wrap, wrapAll, closeAll };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => CustomSelect.init());
} else {
  setTimeout(() => CustomSelect.init(), 80);
}

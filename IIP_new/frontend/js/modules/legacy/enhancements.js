/* ================================================================
   enhancements.js — IBM Case Intelligence Platform v7.4
   Adds a suite of UX enhancements:

   1. Keyboard shortcut  /  →  focus global search
   2. Keyboard shortcut  Escape  →  clear / blur global search
   3. Click-to-copy on case numbers (TS…) anywhere in the app
   4. Scroll-to-top button (appears when scrolled > 300px)
   5. Toast notification system  (window.Toast.show)
   6. Copy-feedback mini-toast on case number copy
   ================================================================ */

(function() {
  "use strict";

  /* ══════════════════════════════════════════════════════
     1 & 2. Keyboard shortcut: "/" focuses global search
     ══════════════════════════════════════════════════════ */
  document.addEventListener("keydown", e => {
    // Don't trigger if user is typing in an input / textarea / contenteditable
    const tag = document.activeElement?.tagName;
    const isEditing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
                   || document.activeElement?.isContentEditable
                   || document.activeElement?.classList.contains("cs-trigger");

    if (e.key === "/" && !isEditing && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const gs = document.getElementById("global-search");
      if (gs) { gs.focus(); gs.select(); }
    }
  });

  /* ══════════════════════════════════════════════════════
     3. Click-to-copy on TS case numbers
        Adds a copy tooltip on hover for any element that
        shows a IBM case number (TS followed by 9+ digits)
     ══════════════════════════════════════════════════════ */
  const _getTS_RE = () =>
    (typeof DynamicConfig !== "undefined" && DynamicConfig.caseNumberPattern)
      ? DynamicConfig.caseNumberPattern()
      : /^TS\d{9,}$/i;

  function _copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return Promise.resolve();
    }
  }

  // We use event delegation on the whole document
  document.addEventListener("click", e => {
    const target = e.target;
    if (!target) return;

    // perf-case-link opens the case detail panel — skip global copy handler
    if (target.classList.contains("perf-case-link") || target.closest(".perf-case-link")) return;

    // Must be a recognised case number element
    const isCaseNumEl = target.classList.contains("iip-case-link")
      || target.classList.contains("case-number-copy")
      || target.classList.contains("col-case-num")
      || target.closest(".iip-case-link")
      || target.closest(".case-number-copy")
      || target.closest(".col-case-num")
      || target.dataset.cn
      || target.closest("[data-cn]");

    if (!isCaseNumEl) return;

    // Get case number from data-cn or element text
    const caseNum = (
      target.dataset.cn ||
      target.closest("[data-cn]")?.dataset.cn ||
      target.querySelector("[data-cn]")?.dataset.cn ||
      (target.textContent || "").trim().split(/\s/)[0]
    );

    if (!caseNum) return;

    e.preventDefault();
    e.stopPropagation();

    // Copy case number to clipboard, then open IBM support portal
    const IBM_SUPPORT_URL = "https://www.ibm.com/mysupport/s/?language=en_US";
    _copyText(caseNum).then(() => {
      _showCopyToast(caseNum);
      // Open IBM support portal in a new tab after a brief delay so the toast is visible
      setTimeout(() => {
        window.open(IBM_SUPPORT_URL, "_blank", "noopener,noreferrer");
      }, 300);
    }).catch(() => {
      window.open(IBM_SUPPORT_URL, "_blank", "noopener,noreferrer");
    });
  });

  function _showCopyToast(caseNum) {
    // Remove any existing copy toast
    const existing = document.getElementById("iip-copy-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "iip-copy-toast";
    toast.style.cssText = [
      "position:fixed",
      "bottom:24px",
      "left:50%",
      "transform:translateX(-50%) translateY(12px)",
      "z-index:99999",
      "background:#0f62fe",
      "color:#fff",
      "padding:11px 22px",
      "border-radius:6px",
      "font-size:13px",
      "font-weight:500",
      "font-family:IBM Plex Sans,sans-serif",
      "box-shadow:0 4px 20px rgba(0,0,0,0.28)",
      "display:flex",
      "align-items:center",
      "gap:8px",
      "white-space:nowrap",
      "opacity:0",
      "transition:opacity 0.18s ease,transform 0.18s ease",
      "pointer-events:none"
    ].join(";");

    const check = document.createElementNS("http://www.w3.org/2000/svg","svg");
    check.setAttribute("width","15"); check.setAttribute("height","15");
    check.setAttribute("viewBox","0 0 16 16"); check.setAttribute("fill","none");
    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d","M2.5 8l4 4L13.5 3.5");
    path.setAttribute("stroke","#fff"); path.setAttribute("stroke-width","2");
    path.setAttribute("stroke-linecap","round"); path.setAttribute("stroke-linejoin","round");
    check.appendChild(path);

    const label = document.createElement("span");
    label.textContent = "Copied & opening IBM Support — ";

    const cn = document.createElement("span");
    cn.textContent = caseNum;
    cn.style.cssText = "font-family:IBM Plex Mono,monospace;font-weight:700;letter-spacing:0.3px";

    toast.appendChild(check);
    toast.appendChild(label);
    toast.appendChild(cn);
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
      });
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(12px)";
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 220);
    }, 2200);
  }

  /* ══════════════════════════════════════════════════════
     4. Scroll-to-top button
     ══════════════════════════════════════════════════════ */
  function _setupScrollTop() {
    const btn = document.createElement("button");
    btn.id = "scroll-top-btn";
    btn.title = "Back to top";
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>`;
    btn.style.cssText = [
      "position:fixed",
      "bottom:72px",
      "right:20px",
      "z-index:var(--z-modal)",
      "width:36px",
      "height:36px",
      "border-radius:50%",
      "background:var(--ibm-blue-50)",
      "color:#fff",
      "border:none",
      "cursor:pointer",
      "display:none",
      "align-items:center",
      "justify-content:center",
      "box-shadow:0 3px 12px rgba(15,98,254,0.35)",
      "transition:opacity var(--transition-base),transform var(--transition-base)",
      "opacity:0"
    ].join(";");
    document.body.appendChild(btn);

    // Find the main scroll container (content area)
    function _getScrollEl() {
      return document.getElementById("main-content") ||
             document.querySelector(".main-content") ||
             document.querySelector(".content-area") ||
             document.documentElement;
    }

    // Show / hide based on scroll position
    let _scrollEl = null;
    function _onScroll() {
      if (!_scrollEl) _scrollEl = _getScrollEl();
      const scrollTop = _scrollEl.scrollTop || document.documentElement.scrollTop;
      if (scrollTop > 300) {
        btn.style.display = "flex";
        requestAnimationFrame(() => { btn.style.opacity = "1"; btn.style.transform = "translateY(0)"; });
      } else {
        btn.style.opacity = "0";
        btn.style.transform = "translateY(8px)";
        setTimeout(() => { if (btn.style.opacity === "0") btn.style.display = "none"; }, 200);
      }
    }

    // Attach to multiple possible containers
    window.addEventListener("scroll", _onScroll, { passive: true });
    document.addEventListener("scroll", _onScroll, { passive: true });
    // Also watch dynamic containers
    const scrollObs = new MutationObserver(() => {
      _scrollEl = null;
      const el = _getScrollEl();
      if (el && el !== document.documentElement) {
        el.addEventListener("scroll", _onScroll, { passive: true });
      }
    });
    scrollObs.observe(document.body, { childList: true, subtree: false });

    btn.addEventListener("click", () => {
      const el = _scrollEl || _getScrollEl();
      if (el && el !== document.documentElement) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    btn.addEventListener("mouseenter", () => { btn.style.transform = "translateY(-2px) scale(1.08)"; });
    btn.addEventListener("mouseleave", () => { btn.style.transform = "translateY(0) scale(1)"; });
  }

  /* ══════════════════════════════════════════════════════
     5. Toast notification system
        Usage: Toast.show("Message", "success"|"error"|"info"|"warn", ms)
     ══════════════════════════════════════════════════════ */
  const Toast = (() => {
    let _container = null;

    function _getContainer() {
      if (_container && document.contains(_container)) return _container;
      _container = document.createElement("div");
      _container.id = "toast-container";
      _container.style.cssText = [
        "position:fixed",
        "bottom:20px",
        "left:50%",
        "transform:translateX(-50%)",
        "z-index:var(--z-modal)9",
        "display:flex",
        "flex-direction:column",
        "align-items:center",
        "gap:6px",
        "pointer-events:none"
      ].join(";");
      document.body.appendChild(_container);
      return _container;
    }

    const COLORS = {
      success: { bg: "var(--ibm-blue-50)",  fg: "#fff" },   // Atlassian blue
      error:   { bg: "var(--red)",  fg: "#fff" },   // Atlassian red
      warn:    { bg: "var(--yellow)",  fg: "#fff" },   // Atlassian yellow
      info:    { bg: "var(--ibm-blue-50)",  fg: "#fff" },   // Atlassian blue
    };

    function show(msg, type = "info", duration = 2400) {
      const c = _getContainer();
      const colors = COLORS[type] || COLORS.info;
      const toast = document.createElement("div");
      toast.style.cssText = [
        `background:${colors.bg}`,
        `color:${colors.fg}`,
        "padding:9px 18px",
        "border-radius:var(--radius-sm)",
        "font-size:13px",
        "font-weight:500",
        "font-family:var(--font-sans,'IBM Plex Sans',sans-serif)",
        "box-shadow:0 4px 16px rgba(0,0,0,0.2)",
        "pointer-events:auto",
        "cursor:default",
        "transition:opacity var(--transition-base),transform var(--transition-base)",
        "opacity:0",
        "transform:translateY(10px)",
        "white-space:nowrap",
        "max-width:380px",
        "text-overflow:ellipsis",
        "overflow:hidden"
      ].join(";");
      toast.textContent = msg;
      c.appendChild(toast);
      // Animate in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          toast.style.opacity = "1";
          toast.style.transform = "translateY(0)";
        });
      });
      // Auto dismiss
      const tid = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-6px)";
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 240);
      }, duration);
      // Click to dismiss early
      toast.addEventListener("click", () => {
        clearTimeout(tid);
        toast.style.opacity = "0";
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
      });
    }

    return { show };
  })();

  window.Toast = Toast;

  /* ══════════════════════════════════════════════════════
     6. "/" search shortcut hint in the search placeholder
     ══════════════════════════════════════════════════════ */
  function _addSearchHint() {
    const gs = document.getElementById("global-search");
    if (!gs) return;
    // Add "/" hint to placeholder if not already there
    if (!gs.placeholder.includes("/")) {
      gs.placeholder = gs.placeholder + "  [ / ]";
    }
    // Style the search wrapper to show the hint key
    const wrap = gs.closest(".global-search-wrap") || gs.parentElement;
    if (wrap) {
      // Add a subtle "/" badge inside the search
      const hint = document.createElement("span");
      hint.id = "search-slash-hint";
      hint.textContent = "/";
      hint.style.cssText = [
        "position:absolute",
        "right:9px",
        "top:50%",
        "transform:translateY(-50%)",
        "font-size:10px",
        "font-weight:700",
        "color:rgba(255,255,255,0.35)",
        "background:rgba(255,255,255,0.12)",
        "border:1px solid rgba(255,255,255,0.2)",
        "border-radius:var(--radius-xs)",
        "padding:1px 5px",
        "line-height:1.4",
        "pointer-events:none",
        "letter-spacing:0",
        "font-family:var(--font-mono,'IBM Plex Mono',monospace)"
      ].join(";");
      if (window.getComputedStyle(wrap).position === "static") {
        wrap.style.position = "relative";
      }
      wrap.appendChild(hint);
      // Hide hint when input is focused, show on blur
      gs.addEventListener("focus",  () => { hint.style.display = "none"; });
      gs.addEventListener("blur",   () => { hint.style.display = ""; });
    }
  }

  /* ══════════════════════════════════════════════════════
     Init — after DOM ready
     ══════════════════════════════════════════════════════ */
  function _init() {
    _setupScrollTop();
    _addSearchHint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _init);
  } else {
    setTimeout(_init, 120);
  }

})();
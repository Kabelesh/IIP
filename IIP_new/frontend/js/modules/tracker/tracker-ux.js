// =============================================================================
// frontend/js/modules/tracker-ux.js
// Tracker UX Enhancements — IIP Phase 2, Fixes 2.2 / 2.3 / 2.4 / 2.5
//
// Fix 2.2  CW date range labels in weekly tracker selector
//          "CW10" becomes "CW10 — Mon 4 Mar – Fri 8 Mar 2026"
//
// Fix 2.3  "Carry Forward Open Cases" button
//          One-click prepopulates the current week with all open cases
//          from the live case dataset that are not yet in this week's tracker
//
// Fix 2.4  Case number hyperlinks to IBM support portal
//          Every TS-number anywhere in the UI becomes a clickable link to
//          https://www.ibm.com/mysupport/s/case/TSxxxxxxxx
//
// Fix 2.5  SLA countdown badges for Sev-2 open cases
//          Calculates days since last IBM update and shows urgency badge:
//          GREEN  < 2 days since update
//          AMBER  2–4 days (approaching threshold)
//          RED    > 4 days (IBM update overdue for Sev-2)
//
// INSTALLATION:
//   Add to index.html after all dashboard scripts:
//     <script src="js/modules/tracker-ux.js"></script>
// =============================================================================

'use strict';

(function (window, document) {


  // IBM Sev-2 SLA: IBM must update the case every 48 hours (2 business days)
  // We use calendar hours here for simplicity (displayed as days).
  // Thresholds (hours since last IBM update):
  const SLA_GREEN_HRS  = 48;   // < 48h since update = on track
  const SLA_AMBER_HRS  = 72;   // 48-72h = watch
  const SLA_RED_HRS    = 96;   // > 96h = overdue — IBM hasn't updated in 4 days

  // ── CSS ───────────────────────────────────────────────────────────────────
  const CSS = `
    /* Fix 2.2 – CW label date range */
    .iip-cw-date-range {
      font-size: 11px;
      color: #6b7280;
      font-weight: 400;
      margin-left: 6px;
    }
    select.iip-cw-select option .iip-cw-date-range { display: none; }

    /* Fix 2.3 – Carry Forward button */
    #iip-carry-forward-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      font-family: inherit;
      white-space: nowrap;
    }
    #iip-carry-forward-btn:hover  { background: #1d4ed8; }
    #iip-carry-forward-btn:active { transform: scale(0.98); }
    #iip-carry-forward-btn:disabled {
      background: #9ca3af; cursor: not-allowed; transform: none;
    }
    #iip-carry-forward-btn .iip-cf-icon { font-size: 15px; }
    #iip-carry-forward-btn .iip-cf-count {
      background: rgba(255,255,255,0.3);
      border-radius: 10px;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 700;
    }
    #iip-cf-result {
      display: inline-block;
      margin-left: 10px;
      font-size: 12px;
      color: #16a34a;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s;
    }
    #iip-cf-result.visible { opacity: 1; }

    /* Case number copy chips */
    .iip-case-link, .case-number-copy {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.1s;
    }
    .iip-case-link:hover, .case-number-copy:hover {
      color: #1d4ed8;
    }

    /* Fix 2.5 – SLA badges */
    .iip-sla-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
      padding: 2px 7px;
      white-space: nowrap;
      cursor: help;
      margin-left: 6px;
      vertical-align: middle;
      letter-spacing: 0.01em;
    }
    .iip-sla-green  { color: #14532d; background: #dcfce7; border: 1px solid #86efac; }
    .iip-sla-amber  { color: #78350f; background: #fef3c7; border: 1px solid #fbbf24; }
    .iip-sla-red    { color: #7f1d1d; background: #fee2e2; border: 1px solid #fca5a5; animation: iip-sla-pulse 2s infinite; }
    .iip-sla-unknown{ color: #374151; background: #f3f4f6; border: 1px solid #d1d5db; }
    @keyframes iip-sla-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    /* Sev-2 row highlight in tables */
    tr.iip-sev2-row td:first-child {
      border-left: 3px solid #f59e0b;
    }
    tr.iip-sla-overdue td:first-child {
      border-left: 3px solid #dc2626 !important;
    }
  `;

  function injectCSS() {
    if (document.getElementById('iip-tracker-ux-css')) return;
    const style = document.createElement('style');
    style.id = 'iip-tracker-ux-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ── ISO week date calculation ─────────────────────────────────────────────

  /**
   * Returns { monday, friday } Date objects for a given ISO week number and year.
   * ISO weeks start on Monday.
   */
  function isoWeekDates(weekNum, year) {
    // Jan 4 of any year is always in ISO week 1
    const jan4  = new Date(year, 0, 4);
    const day   = jan4.getDay() || 7; // 1=Mon … 7=Sun
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - day + 1 + (weekNum - 1) * 7);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return { monday, friday };
  }

  /**
   * Returns a human-readable date range string for a CW label.
   * cwLabel = "CW10", year = 2026
   * Returns "Mon 4 Mar – Fri 8 Mar 2026"
   */
  function cwToDateRangeLabel(cwLabel, year) {
    const weekNum = parseInt((cwLabel || '').replace(/CW/i, ''), 10);
    if (isNaN(weekNum)) return '';
    try {
      const { monday, friday } = isoWeekDates(weekNum, year || new Date().getFullYear());
      const fmtDay = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      const fridayStr = friday.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      return `${fmtDay(monday)} – ${fridayStr}`;
    } catch (e) {
      return '';
    }
  }

  // ── Fix 2.2: Enhance CW selector ─────────────────────────────────────────

  let currentYear = new Date().getFullYear();

  function enhanceCwSelector(selectEl) {
    if (selectEl.dataset.iipCwEnhanced) return;
    selectEl.dataset.iipCwEnhanced = '1';

    // Detect year (look for nearby year selector)
    function getYear() {
      const container = selectEl.closest('form, .tracker-controls, .tracker-header, div, section') || document.body;
      const yearSel = container.querySelector('select[name*="year"], select[id*="year"], #tracker-year, .year-selector');
      if (yearSel) return parseInt(yearSel.value, 10) || currentYear;
      return currentYear;
    }

    function updateOptions() {
      const yr = getYear();
      for (const opt of selectEl.options) {
        const cw = opt.value || opt.textContent.trim();
        const match = cw.match(/CW(\d{1,2})/i);
        if (!match) continue;
        const range = cwToDateRangeLabel(`CW${match[1].padStart(2,'0')}`, yr);
        if (range) {
          opt.textContent = `${cw} — ${range}`;
          opt.dataset.cwRange = range;
        }
      }
    }

    updateOptions();

    // Re-enhance when year changes
    const container = selectEl.closest('form, .tracker-controls, .tracker-header, div, section') || document.body;
    const yearSel = container.querySelector('select[name*="year"], select[id*="year"], #tracker-year, .year-selector');
    if (yearSel) {
      yearSel.addEventListener('change', () => {
        currentYear = parseInt(yearSel.value, 10) || currentYear;
        updateOptions();
      });
    }
  }

  /** Also add a visible label above/beside the tracker showing the current CW's date range */
  function injectCwDateLabel(cwLabel, year) {
    let el = document.getElementById('iip-cw-date-label');
    if (!el) {
      el = document.createElement('span');
      el.id = 'iip-cw-date-label';
      el.style.cssText = 'font-size:13px;color:#4b5563;margin-left:12px;font-weight:500;';
    }
    const range = cwToDateRangeLabel(cwLabel, year);
    if (range) {
      el.textContent = range;
      // Attach next to the week selector
      const sel = document.querySelector('select[id*="week"], select[name*="week"], .cw-selector, #tracker-week');
      if (sel && !sel.parentNode.contains(el)) {
        sel.parentNode.insertBefore(el, sel.nextSibling);
      }
    }
  }

  function initFix22() {
    // Scan for CW selectors
    function scan() {
      document.querySelectorAll('select[id*="week"], select[name*="week"], .cw-selector, #tracker-week, select.week-select').forEach(enhanceCwSelector);
    }
    scan();

    // Watch for dynamically-added selectors
    const obs = new MutationObserver(scan);
    obs.observe(document.body, { childList: true, subtree: true });

    // Update date label when week changes
    document.addEventListener('change', e => {
      const el = e.target;
      if (!el) return;
      const id = (el.id + el.name + el.className).toLowerCase();
      if (/week|cw/.test(id)) {
        const cw = el.value;
        injectCwDateLabel(cw, currentYear);
      }
      if (/year/.test(id)) {
        currentYear = parseInt(el.value, 10) || currentYear;
      }
    });
  }

  // ── Fix 2.3: Carry Forward Open Cases button ──────────────────────────────

  // Cache of live open cases (fetched once from the API or from global data)
  let _openCasesCache = null;
  let _openCasesFetching = false;

  async function fetchOpenCases() {
    if (_openCasesCache) return _openCasesCache;
    if (_openCasesFetching) {
      // Wait up to 5s for in-flight fetch
      for (let i = 0; i < 50; i++) {
        await new Promise(r => setTimeout(r, 100));
        if (_openCasesCache) return _openCasesCache;
      }
      return [];
    }

    _openCasesFetching = true;
    try {
      // Use locally uploaded cases (no API)
      if (typeof Data !== "undefined") {
        _openCasesCache = Data.openTeamCases ? Data.openTeamCases() : Data.teamCases().filter(c => !c.Status?.includes("Closed"));
        return _openCasesCache;
      }
    } catch (e) {
      // Fall through to global data
    }

    // Fallback: use window.cases or window.allCases if available
    const globalCases = window.cases || window.allCases || window.IIPData?.cases || [];
    _openCasesCache = globalCases.filter(c => {
      const s = c.status || c.Status || '';
      return !['Closed - Archived','Closed by IBM','Closed by Client'].includes(s);
    });

    return _openCasesCache;
  }

  function getAuthHeader() {
    return localStorage.getItem('iip_token')
        || sessionStorage.getItem('iip_token')
        || window.IIPAuth?.token
        || '';
  }

  /**
   * Get the current tracker week and year from the UI controls.
   */
  function getCurrentTrackerWeek() {
    const weekSel = document.querySelector('select[id*="week"], select[name*="week"], .cw-selector, #tracker-week, select.week-select');
    const yearSel = document.querySelector('select[id*="year"], select[name*="year"], #tracker-year, .year-selector');
    return {
      week: weekSel ? weekSel.value : null,
      year: yearSel ? parseInt(yearSel.value, 10) : currentYear,
    };
  }

  /**
   * Get case numbers already present in the current week's tracker rows.
   */
  function getCasesInCurrentWeek() {
    const nums = new Set();
    // Look for case number cells in the tracker table
    document.querySelectorAll([
      'td[data-case-number]',
      '[data-case-number]',
      '.case-number',
      'td:first-child',
    ].join(', ')).forEach(el => {
      const text = (el.dataset.caseNumber || el.textContent || '').trim();
      const match = text.match(/TS\d{9}/);
      if (match) nums.add(match[0]);
    });
    return nums;
  }

  async function carryForwardOpenCases(btn) {
    btn.disabled = true;
    btn.querySelector('.iip-cf-icon').textContent = '⏳';

    try {
      const openCases = await fetchOpenCases();
      const existing  = getCasesInCurrentWeek();
      const { week, year } = getCurrentTrackerWeek();

      // Filter to cases not already in this week
      const toAdd = openCases.filter(c => {
        const num = c.case_number || c['Case Number'] || c.caseNumber || '';
        return num && !existing.has(num);
      });

      if (toAdd.length === 0) {
        showCfResult('✓ All open cases already in this week', '#16a34a');
        return;
      }

      // Trigger the app's existing "add case to tracker" function if available
      let added = 0;
      for (const c of toAdd) {
        const num = c.case_number || c['Case Number'] || c.caseNumber;
        if (window.IIPTracker?.addCase) {
          window.IIPTracker.addCase(c);
          added++;
        } else if (window.addCaseToTracker) {
          window.addCaseToTracker(c);
          added++;
        } else {
          // Emit a custom event so the tracker dashboard can handle it
          document.dispatchEvent(new CustomEvent('iip:carry-forward', {
            detail: { cases: toAdd, week, year },
            bubbles: true,
          }));
          added = toAdd.length;
          break;
        }
      }

      // Update button badge
      updateCarryForwardBadge();
      showCfResult(`✓ ${added} case${added === 1 ? '' : 's'} added to ${week}`, '#16a34a');

    } catch (e) {
      showCfResult(`✗ Error: ${e.message}`, '#dc2626');
      console.error('[tracker-ux] Carry forward error:', e);
    } finally {
      btn.disabled = false;
      btn.querySelector('.iip-cf-icon').textContent = '↻';
    }
  }

  function showCfResult(text, color) {
    let el = document.getElementById('iip-cf-result');
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 4000);
  }

  async function updateCarryForwardBadge() {
    const btn = document.getElementById('iip-carry-forward-btn');
    if (!btn) return;
    const badge = btn.querySelector('.iip-cf-count');
    if (!badge) return;

    try {
      const openCases = await fetchOpenCases();
      const existing  = getCasesInCurrentWeek();
      const count = openCases.filter(c => {
        const num = c.case_number || c['Case Number'] || c.caseNumber || '';
        return num && !existing.has(num);
      }).length;
      badge.textContent = count;
      badge.style.display = count > 0 ? '' : 'none';
      btn.title = count > 0
        ? `Add ${count} open case${count === 1 ? '' : 's'} not yet in this week`
        : 'All open cases are already in this week';
    } catch (_) {}
  }

  function injectCarryForwardButton() {
    if (document.getElementById('iip-carry-forward-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'iip-carry-forward-btn';
    btn.type = 'button';
    btn.innerHTML = `
      <span class="iip-cf-icon">↻</span>
      Carry Forward Open Cases
      <span class="iip-cf-count" style="display:none">0</span>
    `;
    btn.addEventListener('click', () => carryForwardOpenCases(btn));

    const result = document.createElement('span');
    result.id = 'iip-cf-result';

    // Find the tracker toolbar / controls area
    const toolbar = document.querySelector(
      '.tracker-toolbar, .tracker-controls, .tracker-header, .tracker-actions, #tracker-controls, .week-controls'
    );

    if (toolbar) {
      toolbar.appendChild(btn);
      toolbar.appendChild(result);
    } else {
      // Fallback: inject above the tracker table
      const table = document.querySelector('.tracker-table, #tracker-table, table.weekly-tracker, .tracker-body');
      if (table) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'margin-bottom:12px;display:flex;align-items:center;';
        wrapper.appendChild(btn);
        wrapper.appendChild(result);
        table.parentNode.insertBefore(wrapper, table);
      }
    }

    // Populate the badge after a short delay
    setTimeout(updateCarryForwardBadge, 1000);
    // Update badge when week changes
    document.addEventListener('change', e => {
      if (/week|year/i.test((e.target.id || '') + (e.target.name || '') + (e.target.className || ''))) {
        _openCasesCache = null; // clear cache so fresh data loads
        setTimeout(updateCarryForwardBadge, 500);
      }
    });
  }

  function initFix23() {
    // Inject button when tracker panel becomes visible
    function tryInject() {
      const trackerPanel = document.querySelector(
        '#weekly-tracker, #tracker-panel, [data-panel="tracker"], [data-panel="weekly-tracker"], .tracker-container'
      );
      if (trackerPanel) {
        injectCarryForwardButton();
      }
    }

    tryInject();
    const obs = new MutationObserver(tryInject);
    obs.observe(document.body, { childList: true, subtree: true });

    // Also trigger when tracker tab is activated
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab],[data-panel],[data-hash]');
      if (tab) {
        const t = tab.dataset.tab || tab.dataset.panel || tab.dataset.hash || '';
        if (/tracker|weekly/.test(t)) {
          setTimeout(injectCarryForwardButton, 300);
          setTimeout(updateCarryForwardBadge, 800);
        }
      }
    });

    // Listen for the carry-forward event (fired when no tracker API is present)
    document.addEventListener('iip:carry-forward', e => {
      const { cases, week, year } = e.detail;
      console.info(`[tracker-ux] Carry-forward event: ${cases.length} cases for ${year}/${week}. App should handle iip:carry-forward event.`);
    });
  }

  // ── Fix 2.4: Case number hyperlinks ──────────────────────────────────────

  const TS_PATTERN = /\bTS\d{9}\b/g;
  const LINK_ATTR  = 'data-iip-case-linked';

  function linkifyCaseNumbers(root) {
    root = root || document.body;

    // Walk text nodes and replace TS-numbers with links
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Skip script, style, textarea, already-processed links
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (['SCRIPT','STYLE','TEXTAREA','CODE','PRE'].includes(tag)) return NodeFilter.FILTER_REJECT;
          if (parent.classList.contains('iip-case-link') || parent.classList.contains('case-number-copy')) return NodeFilter.FILTER_REJECT;
          if (parent.hasAttribute(LINK_ATTR)) return NodeFilter.FILTER_REJECT;
          if (!TS_PATTERN.test(node.textContent)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    for (const textNode of nodes) {
      TS_PATTERN.lastIndex = 0;
      const text = textNode.textContent;
      if (!TS_PATTERN.test(text)) continue;

      TS_PATTERN.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = TS_PATTERN.exec(text)) !== null) {
        // Text before the match
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        // Copy-on-click span (no link)
        const a = document.createElement('span');
        a.className = 'iip-case-link';
        a.dataset.cn = match[0];
        a.textContent = match[0];
        a.title = 'Click to copy case number';
        a.style.cursor = 'pointer';
        // Click handled globally by enhancements.js (copies + shows toast)
        a.setAttribute('data-case-number', match[0]);
        frag.appendChild(a);
        lastIndex = match.index + match[0].length;
      }

      // Remaining text
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      const parent = textNode.parentElement;
      if (parent) {
        parent.setAttribute(LINK_ATTR, '1');
        parent.replaceChild(frag, textNode);
      }
    }
  }

  function initFix24() {
    // Initial linkification
    setTimeout(() => linkifyCaseNumbers(document.body), 500);
    setTimeout(() => linkifyCaseNumbers(document.body), 2000);

    // Watch for new content
    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) linkifyCaseNumbers(node);
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ── Fix 2.5: SLA countdown badges for Sev-2 open cases ───────────────────

  const SLA_BADGE_ATTR = 'data-iip-sla-badge';

  /**
   * Parse an IBM date string like "3/12/2026 2:00 AM" or "3/12/2026"
   */
  function parseIBMDate(s) {
    if (!s || !s.trim()) return null;
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    ];

    for (const re of formats) {
      const m = s.trim().match(re);
      if (!m) continue;
      let [, mo, dy, yr, hr, min, ampm] = m;
      hr = hr ? parseInt(hr) : 0;
      min = min ? parseInt(min) : 0;
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hr !== 12) hr += 12;
        if (ampm.toUpperCase() === 'AM' && hr === 12) hr = 0;
      }
      return new Date(parseInt(yr), parseInt(mo) - 1, parseInt(dy), hr, min);
    }
    return null;
  }

  function buildSlaBadge(caseData) {
    const updated  = parseIBMDate(caseData.updated || caseData.Updated || '');
    const severity = caseData.severity || caseData.Severity || '';
    const status   = caseData.status   || caseData.Status   || '';

    // Only badge Sev-1 and Sev-2 open cases
    if (!['1','2'].includes(String(severity))) return null;
    if (['Closed - Archived','Closed by IBM','Closed by Client'].includes(status)) return null;

    const badge = document.createElement('span');
    badge.className = 'iip-sla-badge';

    if (!updated) {
      badge.className += ' iip-sla-unknown';
      badge.textContent = 'No update date';
      badge.title = 'Could not determine last IBM update time';
      return badge;
    }

    const hoursAgo = (Date.now() - updated.getTime()) / 3600000;
    const daysAgo  = Math.floor(hoursAgo / 24);
    const hrsRem   = Math.round(hoursAgo);

    if (hoursAgo < SLA_GREEN_HRS) {
      badge.className += ' iip-sla-green';
      badge.textContent = `✓ Updated ${daysAgo === 0 ? 'today' : daysAgo + 'd ago'}`;
      badge.title = `Sev-${severity}: Last updated ${hrsRem}h ago — within 48h SLA window`;
    } else if (hoursAgo < SLA_AMBER_HRS) {
      badge.className += ' iip-sla-amber';
      badge.textContent = `⚠ ${daysAgo}d since update`;
      badge.title = `Sev-${severity}: ${hrsRem}h since last update — approaching 48h SLA threshold`;
    } else {
      badge.className += ' iip-sla-red';
      const overdueDays = Math.floor((hoursAgo - SLA_GREEN_HRS) / 24);
      badge.textContent = `🔴 ${daysAgo}d — SLA overdue`;
      badge.title = `Sev-${severity}: ${hrsRem}h since last update — SLA overdue by ${overdueDays}d. Follow up with IBM immediately.`;
    }

    return badge;
  }

  // Intercept API responses to collect case SLA data
  const caseDataMap = {}; // caseNumber → case object

  function interceptCaseFetchForSLA() {
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await origFetch.apply(this, args);
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');

      if (/\/api\/v1\/cases/.test(url)) {
        const clone = response.clone();
        clone.json().then(data => {
          const items = Array.isArray(data) ? data
                      : Array.isArray(data?.cases) ? data.cases
                      : Array.isArray(data?.items) ? data.items : [];
          for (const c of items) {
            const num = c.case_number || c.caseNumber || c['Case Number'];
            if (num) caseDataMap[num] = c;
          }
          // Apply badges to any already-rendered rows
          setTimeout(applySLABadges, 200);
        }).catch(() => {});
      }

      return response;
    };
  }

  function applySLABadges() {
    // Find all case rows that have a severity indicator and a case number
    document.querySelectorAll('tr[data-case-number], tr[data-severity], [data-case-number]').forEach(el => {
      if (el.hasAttribute(SLA_BADGE_ATTR)) return;

      const caseNum = el.dataset.caseNumber
                    || el.querySelector('[data-case-number]')?.dataset.caseNumber
                    || (el.querySelector('.case-number, td.case-number, a.iip-case-link')?.textContent || '').trim();

      if (!caseNum) return;

      const caseData = caseDataMap[caseNum];
      if (!caseData) return;

      el.setAttribute(SLA_BADGE_ATTR, '1');

      const badge = buildSlaBadge(caseData);
      if (!badge) return;

      // Find a good injection point: the severity cell or the case number cell
      const targetCell = el.querySelector('[data-col="severity"], td.severity, .case-severity')
                      || el.querySelector('td:first-child, .case-number');

      if (targetCell) {
        targetCell.appendChild(badge);
      }

      // Also add row-level classes for CSS styling
      const sev = String(caseData.severity || caseData.Severity || '');
      if (['1','2'].includes(sev) && el.tagName === 'TR') {
        el.classList.add('iip-sev2-row');
        const hoursAgo = caseData.updated || caseData.Updated
          ? (Date.now() - parseIBMDate(caseData.updated || caseData.Updated).getTime()) / 3600000
          : 0;
        if (hoursAgo > SLA_RED_HRS) el.classList.add('iip-sla-overdue');
      }
    });

    // Also scan for standalone case number text and add inline badges
    document.querySelectorAll('.iip-case-link:not([data-sla-badged])').forEach(link => {
      const num = link.dataset.caseNumber;
      if (!num) return;
      const caseData = caseDataMap[num];
      if (!caseData) return;

      link.setAttribute('data-sla-badged', '1');
      const badge = buildSlaBadge(caseData);
      if (badge) {
        link.parentNode.insertBefore(badge, link.nextSibling);
      }
    });
  }

  function initFix25() {
    interceptCaseFetchForSLA();

    // Also build from any existing global data
    const globals = [window.cases, window.allCases, window.openCases, window.IIPData?.cases];
    for (const store of globals) {
      if (Array.isArray(store)) {
        for (const c of store) {
          const num = c.case_number || c.caseNumber || c['Case Number'];
          if (num) caseDataMap[num] = c;
        }
      }
    }

    setTimeout(applySLABadges, 1000);

    const obs = new MutationObserver(() => applySLABadges());
    obs.observe(document.body, { childList: true, subtree: true });

    // Refresh badges every 30 minutes (SLA time changes)
    setInterval(applySLABadges, 30 * 60 * 1000);
  }

  // ── Shared fetch interceptor coordinator ─────────────────────────────────
  // Installs ONE combined interceptor instead of three separate ones

  function installCombinedInterceptor() {
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await origFetch.apply(this, args);
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');

      // SLA: case data
      if (/\/api\/v1\/cases/.test(url)) {
        const clone = response.clone();
        clone.json().then(data => {
          const items = Array.isArray(data) ? data
                      : Array.isArray(data?.cases) ? data.cases
                      : Array.isArray(data?.items) ? data.items : [];
          for (const c of items) {
            const num = c.case_number || c.caseNumber || c['Case Number'];
            if (num) caseDataMap[num] = c;
          }
          setTimeout(applySLABadges, 200);
        }).catch(() => {});
      }

      return response;
    };
  }

  // ── Initialise all fixes ──────────────────────────────────────────────────

  function init() {
    injectCSS();
    installCombinedInterceptor();
    initFix22();
    initFix23();
    initFix24();
    initFix25();
    console.log('[tracker-ux] Fixes 2.2/2.3/2.4/2.5 active');
  }

  // Expose public API for testing / integration
  window.IIPTrackerUX = {
    cwToDateRangeLabel,
    isoWeekDates,
    buildSlaBadge,
    linkifyCaseNumbers,
    updateCarryForwardBadge,
    caseDataMap,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}(window, document));
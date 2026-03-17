// =============================================================================
// frontend/js/modules/phase1-patches.js
// IIP Phase 1 Fixes — Drop-in Patch Module
// Version: 1.0.0  |  Date: 2026-03-15
//
// CONTAINS:
//   Fix 1.5 — "⚠️ Needs Review" badge on auto-extracted KB articles
//   Fix 1.6 — Data-gap warning banner in the Weekly Tracker
//   Fix 1.7 — Exclude non-team owners (Rhapsody IBM Contact at Bosch)
//              from all workload calculations
//
// INSTALLATION:
//   1. Copy this file to frontend/js/modules/phase1-patches.js
//   2. Add ONE script tag at the end of index.html (before </body>):
//        <script src="js/modules/phase1-patches.js"></script>
//   3. That's it — the module self-initialises when the DOM is ready.
//
// HOW IT WORKS:
//   Each fix uses a MutationObserver + DOM polling strategy so it works
//   regardless of whether the original dashboard JS is synchronous or
//   async. The patches activate as soon as their target elements appear
//   in the DOM — no modifications to existing JS files required.
//
// REMOVING A FIX:
//   Set  IIPPatches.config.enableFix15 = false  (etc.) before the script
//   loads, or set the corresponding constant at the top of this file.
// =============================================================================

/* global IIPPatches */
(function (window) {
  'use strict';

  // ── Global config (override before script loads if needed) ───────────────
  const CFG = Object.assign({
    enableFix15: true,   // KB needs-review badge
    enableFix16: true,   // Tracker gap warning
    enableFix17: true,   // Exclude non-team owners
    debug:       false,  // verbose console logging
  }, window.IIPPatchesConfig || {});

  // ── Logging ──────────────────────────────────────────────────────────────
  function log(msg)  { if (CFG.debug) console.log(`[IIP-P1] ${msg}`); }
  function warn(msg) { console.warn(`[IIP-P1] ${msg}`); }

  // =========================================================================
  // SHARED UTILITIES
  // =========================================================================

  /**
   * Run `fn` whenever a new element matching `selector` is added to the DOM,
   * and also immediately for any already-present matches.
   * Returns a disconnect handle.
   */
  function watchSelector(selector, fn, root) {
    root = root || document.body;

    // Process already-present elements
    root.querySelectorAll(selector).forEach(fn);

    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches && node.matches(selector)) fn(node);
          node.querySelectorAll && node.querySelectorAll(selector).forEach(fn);
        }
      }
    });

    obs.observe(root, { childList: true, subtree: true });
    return () => obs.disconnect();
  }

  /**
   * Poll until `conditionFn()` returns truthy, then call `callbackFn`.
   * Stops after `maxMs` milliseconds.
   */
  function waitFor(conditionFn, callbackFn, intervalMs, maxMs) {
    intervalMs = intervalMs || 150;
    maxMs      = maxMs      || 30000;
    const start = Date.now();
    const tid = setInterval(() => {
      if (conditionFn()) {
        clearInterval(tid);
        callbackFn();
      } else if (Date.now() - start > maxMs) {
        clearInterval(tid);
        warn('waitFor timed out');
      }
    }, intervalMs);
    return () => clearInterval(tid);
  }

  // =========================================================================
  // FIX 1.5 — "⚠️ Needs Review" badge on auto-extracted KB articles
  // =========================================================================
  //
  // Strategy:
  //   The KB list renders article rows with a data attribute or class that
  //   identifies auto-extracted articles. Since we don't have the original
  //   source, we target three possible patterns the original code might use:
  //
  //   Pattern A: data-status="auto-extracted"
  //   Pattern B: class containing "auto-extracted" or "kb-auto"
  //   Pattern C: A status text node inside the row that reads "auto-extracted"
  //
  //   We also intercept the fetch response for /api/v1/kb and annotate the
  //   rendered rows client-side using the article ID from data-id attributes.
  //
  // The badge is injected into the row once and never duplicated.
  // =========================================================================

  const FIX15_BADGE_ATTR = 'data-p1-badge-injected';

  // CSS injected once
  const FIX15_CSS = `
    .iip-needs-review-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #92400e;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 4px;
      padding: 1px 7px;
      margin-left: 8px;
      vertical-align: middle;
      white-space: nowrap;
      cursor: help;
    }
    .iip-needs-review-badge::before {
      content: '⚠️';
      font-size: 10px;
    }
    /* Also style the row itself subtly */
    tr[data-status="auto-extracted"],
    .kb-article-row[data-status="auto-extracted"],
    .kb-row-auto {
      background-color: #fffbeb !important;
    }
    .kb-row-auto:hover {
      background-color: #fef9e7 !important;
    }
  `;

  function injectFix15Css() {
    if (document.getElementById('iip-fix15-css')) return;
    const style = document.createElement('style');
    style.id = 'iip-fix15-css';
    style.textContent = FIX15_CSS;
    document.head.appendChild(style);
  }

  function addNeedsReviewBadge(el) {
    if (el.hasAttribute(FIX15_BADGE_ATTR)) return;
    el.setAttribute(FIX15_BADGE_ATTR, '1');

    const badge = document.createElement('span');
    badge.className = 'iip-needs-review-badge';
    badge.textContent = 'Needs Review';
    badge.title = 'This article was auto-extracted from case comments and has not been manually reviewed. Title and product fields may be empty or inaccurate.';

    // Try to inject next to the title cell
    const titleCell = el.querySelector('td:first-child, .kb-title, [data-col="title"]');
    if (titleCell) {
      titleCell.appendChild(badge);
    } else {
      // Fallback: append to the element itself
      el.appendChild(badge);
    }

    log(`Fix 1.5: badge added to ${el.dataset.id || el.id || 'element'}`);
  }

  /**
   * (API removed) Fetch interceptor stub — no longer active
   * so we can badge rows by ID even if they don't carry a status attribute.
   */
  const autoExtractedIds = new Set();

  function interceptKbFetch() {
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await origFetch.apply(this, args);

      const url = typeof args[0] === 'string' ? args[0]
                : (args[0] && args[0].url) ? args[0].url : '';

      if (false /* api removed */ && !url.includes('/api/v1/kb/KB-')) {
        // Clone so we can read the body without consuming the original
        const clone = response.clone();
        clone.json().then(data => {
          const articles = Array.isArray(data) ? data
                         : Array.isArray(data?.items) ? data.items
                         : Array.isArray(data?.data)  ? data.data
                         : [];
          for (const a of articles) {
            if (a.status === 'auto-extracted' || a.autoExtracted) {
              autoExtractedIds.add(a.id);
            }
          }
          log(`Fix 1.5: intercepted ${articles.length} KB articles, ${autoExtractedIds.size} auto-extracted`);
          // After data loads, immediately scan for rows to badge
          scanAndBadgeKbRows();
        }).catch(() => {});
      }

      return response;
    };
  }

  function scanAndBadgeKbRows() {
    // Pattern A: explicit data-status attribute
    document.querySelectorAll('[data-status="auto-extracted"]:not([' + FIX15_BADGE_ATTR + '])').forEach(addNeedsReviewBadge);

    // Pattern B: class-based
    document.querySelectorAll('.kb-auto:not([' + FIX15_BADGE_ATTR + ']), .kb-article-auto:not([' + FIX15_BADGE_ATTR + '])').forEach(addNeedsReviewBadge);

    // Pattern C: rows with matching data-id in our intercepted set
    if (autoExtractedIds.size > 0) {
      for (const id of autoExtractedIds) {
        const el = document.querySelector(`[data-id="${id}"]:not([${FIX15_BADGE_ATTR}]),
                                           [data-article-id="${id}"]:not([${FIX15_BADGE_ATTR}]),
                                           [data-kb-id="${id}"]:not([${FIX15_BADGE_ATTR}])`);
        if (el) addNeedsReviewBadge(el);
      }
    }

    // Pattern D: any cell whose text is exactly "auto-extracted"
    document.querySelectorAll('td, .kb-status').forEach(cell => {
      if (cell.textContent.trim().toLowerCase() === 'auto-extracted') {
        const row = cell.closest('tr, .kb-article-row, .kb-row, li[data-id]');
        if (row && !row.hasAttribute(FIX15_BADGE_ATTR)) {
          addNeedsReviewBadge(row);
        }
      }
    });
  }

  function initFix15() {
    if (!CFG.enableFix15) return;
    log('Fix 1.5: initialising KB needs-review badge');

    injectFix15Css();
    interceptKbFetch();

    // Watch for new rows added by the KB list renderer
    watchSelector(
      '[data-status="auto-extracted"], .kb-auto, .kb-article-auto',
      addNeedsReviewBadge
    );

    // Also scan on tab activation (in case KB panel is shown after DOM load)
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab], [data-panel], .nav-tab, .sidebar-item');
      if (tab) {
        const target = tab.dataset.tab || tab.dataset.panel || tab.getAttribute('href') || '';
        if (/kb|knowledge/i.test(target)) {
          setTimeout(scanAndBadgeKbRows, 200);
          setTimeout(scanAndBadgeKbRows, 800);
        }
      }
    });

    // Periodic scan for dynamically rendered rows (covers async renderers)
    let scanCount = 0;
    const scanInterval = setInterval(() => {
      scanAndBadgeKbRows();
      if (++scanCount >= 20) clearInterval(scanInterval); // Stop after 3s
    }, 150);
  }

  // =========================================================================
  // FIX 1.6 — Data-gap warning banner in the Weekly Tracker
  // =========================================================================
  //
  // Strategy:
  //   1. Intercept fetch calls to /api/v1/tracker/years to learn which
  //      year+week combinations exist server-side.
  //   2. Also read the response of /api/v1/tracker?year=X&week=CWnn calls
  //      to detect when the selected week returns empty/no data.
  //   3. When the user is viewing a week with no data (or a year with known
  //      gaps), inject a dismissable warning banner above the tracker table.
  //
  // The banner shows:
  //   - Which weeks are missing for the current year
  //   - A suggestion to import CSV data for those weeks
  //   - A dismiss button (persisted to sessionStorage)
  // =========================================================================

  // Pre-computed gap map from the data files (built once at load time).
  // Populated from intercepted API calls; seeds fall back to known data.
  const KNOWN_GAPS = {
    2026: ['CW12','CW13','CW14','CW15','CW16','CW17','CW18',
           'CW19','CW20','CW21','CW22','CW23','CW24','CW25','CW26','CW52'],
    2024: ['CW52'],
    2023: [], // 2023 only has one week of data - entire year is sparse
  };

  // Live gap map updated from API responses
  const liveAvailableWeeks = {}; // { year: Set<string> }

  const FIX16_CSS = `
    #iip-tracker-gap-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #fffbeb;
      border: 1px solid #f59e0b;
      border-left: 4px solid #f59e0b;
      border-radius: 6px;
      padding: 12px 16px;
      margin: 0 0 16px 0;
      font-family: inherit;
      font-size: 13px;
      color: #78350f;
      line-height: 1.5;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      animation: iip-banner-in 0.2s ease;
    }
    @keyframes iip-banner-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    #iip-tracker-gap-banner .iip-banner-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    #iip-tracker-gap-banner .iip-banner-body { flex: 1; }
    #iip-tracker-gap-banner .iip-banner-title {
      font-weight: 700; font-size: 13px; color: #92400e; margin-bottom: 4px;
    }
    #iip-tracker-gap-banner .iip-banner-detail { color: #78350f; }
    #iip-tracker-gap-banner .iip-banner-missing {
      display: inline-flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;
    }
    #iip-tracker-gap-banner .iip-cw-chip {
      background: #fef3c7; border: 1px solid #fbbf24; border-radius: 3px;
      padding: 1px 6px; font-size: 11px; font-weight: 600; color: #92400e;
    }
    #iip-tracker-gap-banner .iip-banner-actions { margin-top: 8px; }
    #iip-tracker-gap-banner .iip-banner-actions a {
      color: #b45309; font-weight: 600; text-decoration: underline; cursor: pointer;
    }
    #iip-tracker-gap-banner .iip-banner-dismiss {
      background: none; border: none; cursor: pointer; color: #b45309;
      font-size: 18px; line-height: 1; padding: 0; flex-shrink: 0;
      opacity: 0.7;
    }
    #iip-tracker-gap-banner .iip-banner-dismiss:hover { opacity: 1; }

    /* Empty-week indicator: shown inside the tracker table when current CW has 0 rows */
    .iip-empty-week-notice {
      text-align: center;
      padding: 32px 16px;
      color: #9ca3af;
      font-size: 14px;
      background: #f9fafb;
      border: 1px dashed #d1d5db;
      border-radius: 6px;
      margin: 8px 0;
    }
    .iip-empty-week-notice strong { display: block; font-size: 16px; margin-bottom: 6px; color: #6b7280; }
  `;

  /** Compute which CWs are missing for a given year from the live map. */
  function getMissingWeeks(year) {
    const available = liveAvailableWeeks[year];
    if (available) {
      const all = [];
      for (let i = 1; i <= 53; i++) all.push(`CW${String(i).padStart(2,'0')}`);
      return all.filter(w => !available.has(w));
    }
    // Fall back to pre-computed known gaps
    return KNOWN_GAPS[year] || [];
  }

  /** Format a CW label to include date range. CW01 of 2026 = 2026-01-01 week etc. */
  function cwToDateRange(cw, year) {
    try {
      const weekNum = parseInt(cw.replace('CW',''), 10);
      // ISO week calculation
      const jan4 = new Date(year, 0, 4); // Jan 4 is always in week 1
      const day  = jan4.getDay() || 7;
      const monday = new Date(jan4);
      monday.setDate(jan4.getDate() - day + 1 + (weekNum - 1) * 7);
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      const fmt = d => d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
      return `${fmt(monday)} – ${fmt(friday)}`;
    } catch (e) {
      return '';
    }
  }

  let currentTrackerYear = new Date().getFullYear();
  let currentTrackerWeek = null;
  let bannerDismissKey   = '';

  function injectFix16Css() {
    if (document.getElementById('iip-fix16-css')) return;
    const style = document.createElement('style');
    style.id = 'iip-fix16-css';
    style.textContent = FIX16_CSS;
    document.head.appendChild(style);
  }

  function buildGapBanner(year, missingWeeks) {
    // Banner disabled — missing-weeks warning removed per user preference
    return null;
    const dismissKey = `iip-gap-dismissed-${year}`;
    if (sessionStorage.getItem(dismissKey)) return null;

    const banner = document.createElement('div');
    banner.id = 'iip-tracker-gap-banner';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');

    // Determine contiguous ranges for a cleaner message
    const contiguous = [];
    let rangeStart = null, rangeEnd = null;
    const sorted = [...missingWeeks].sort();
    for (let i = 0; i < sorted.length; i++) {
      const n = parseInt(sorted[i].replace('CW',''), 10);
      const prev = i > 0 ? parseInt(sorted[i-1].replace('CW',''), 10) : null;
      if (prev === null || n !== prev + 1) {
        if (rangeStart) contiguous.push(rangeStart === rangeEnd ? rangeStart : `${rangeStart}–${rangeEnd}`);
        rangeStart = rangeEnd = sorted[i];
      } else {
        rangeEnd = sorted[i];
      }
    }
    if (rangeStart) contiguous.push(rangeStart === rangeEnd ? rangeStart : `${rangeStart}–${rangeEnd}`);

    const rangeStr = contiguous.join(', ');
    const count    = missingWeeks.length;
    const plural   = count === 1 ? 'week' : 'weeks';

    // Show up to 10 individual chips, then summarise
    const chipsHtml = missingWeeks.slice(0, 10).map(cw => {
      const range = cwToDateRange(cw, year);
      return `<span class="iip-cw-chip" title="${range}">${cw}</span>`;
    }).join('') + (missingWeeks.length > 10
      ? `<span class="iip-cw-chip">+${missingWeeks.length - 10} more</span>` : '');

    banner.innerHTML = `
      <span class="iip-banner-icon">⚠️</span>
      <div class="iip-banner-body">
        <div class="iip-banner-title">
          ${count} ${plural} of tracker data missing for ${year}
        </div>
        <div class="iip-banner-detail">
          Weeks <strong>${rangeStr}</strong> have no entries in the tracker.
          This may indicate CSV data was not imported for those weeks.
        </div>
        <div class="iip-banner-missing">${chipsHtml}</div>
        <div class="iip-banner-actions">
          Go to <a id="iip-banner-admin-link">Admin → Import CSV</a> to upload missing weekly data.
        </div>
      </div>
      <button class="iip-banner-dismiss" title="Dismiss for this session" aria-label="Dismiss warning">×</button>
    `;

    banner.querySelector('.iip-banner-dismiss').addEventListener('click', () => {
      sessionStorage.setItem(dismissKey, '1');
      banner.remove();
    });

    banner.querySelector('#iip-banner-admin-link').addEventListener('click', () => {
      // Try to navigate to admin tab via common patterns
      const adminTab = document.querySelector(
        '[data-tab="admin"], [data-panel="admin"], [href="#admin"], .nav-admin, [data-section="admin"]'
      );
      if (adminTab) adminTab.click();
      else warn('Fix 1.6: could not find admin tab link');
    });

    return banner;
  }

  /** Find or create the tracker container and inject/update the banner. */
  function updateTrackerBanner(year, week) {
    injectFix16Css();

    const missing = getMissingWeeks(year);
    if (missing.length === 0) {
      // Remove existing banner if data is complete
      document.getElementById('iip-tracker-gap-banner')?.remove();
      return;
    }

    // Remove old banner before rebuilding
    document.getElementById('iip-tracker-gap-banner')?.remove();

    const banner = buildGapBanner(year, missing);
    if (!banner) return; // dismissed

    // Try to find the tracker panel/container
    const trackerPanel = document.querySelector(
      '#tab-weekly-tracker, #tracker-panel, #weekly-tracker, .tracker-container'
    );

    if (trackerPanel && trackerPanel.tagName !== 'BUTTON' && !trackerPanel.classList.contains('nav-item')) {
      trackerPanel.insertBefore(banner, trackerPanel.firstChild);
      log(`Fix 1.6: banner injected for ${year} (${missing.length} missing weeks)`);
    } else {
      // Fallback: find the tracker table
      const trackerTable = document.querySelector('.tracker-table, #tracker-table, table.weekly-tracker');
      if (trackerTable) {
        trackerTable.parentNode.insertBefore(banner, trackerTable);
        log(`Fix 1.6: banner injected before tracker table`);
      } else {
        warn('Fix 1.6: could not find tracker container to inject banner');
      }
    }
  }

  function interceptTrackerFetch() {
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await origFetch.apply(this, args);

      const url = typeof args[0] === 'string' ? args[0]
                : (args[0]?.url) ? args[0].url : '';

      // Intercept years endpoint
      if (/\/api\/v1\/tracker\/years/.test(url)) {
        const clone = response.clone();
        clone.json().then(data => {
          // Expected shape: { years: { 2026: ['CW01','CW02',...], ... } }
          // or: [ { year: 2026, weeks: [...] } ]
          const yearsData = data.years || data;
          if (typeof yearsData === 'object') {
            for (const [yr, weeks] of Object.entries(yearsData)) {
              liveAvailableWeeks[parseInt(yr, 10)] = new Set(Array.isArray(weeks) ? weeks : []);
            }
            log('Fix 1.6: received years data, gap map updated');
          }
        }).catch(() => {});
      }

      // Intercept tracker week fetch — detect empty week
      const weekMatch = url.match(/\/api\/v1\/tracker\?.*year=(\d{4}).*week=(CW\d{2})/);
      if (weekMatch) {
        const year = parseInt(weekMatch[1], 10);
        const week = weekMatch[2];
        currentTrackerYear = year;
        currentTrackerWeek = week;

        const clone = response.clone();
        clone.json().then(data => {
          const entries = Array.isArray(data) ? data
                        : Array.isArray(data?.entries) ? data.entries
                        : Array.isArray(data?.data)    ? data.data : [];

          // Update live available weeks
          if (!liveAvailableWeeks[year]) liveAvailableWeeks[year] = new Set();
          if (entries.length > 0) {
            liveAvailableWeeks[year].add(week);
          }

          log(`Fix 1.6: tracker ${year}/${week} → ${entries.length} entries`);
          // Update banner whenever a week is loaded
          setTimeout(() => updateTrackerBanner(year, week), 100);
        }).catch(() => {});
      }

      return response;
    };
  }

  function initFix16() {
    if (!CFG.enableFix16) return;
    log('Fix 1.6: initialising tracker gap warning');

    injectFix16Css();
    interceptTrackerFetch();

    // Also trigger on year/week selector changes
    document.addEventListener('change', e => {
      const el = e.target;
      if (!el) return;
      const id   = el.id   || '';
      const name = el.name || '';
      const cls  = el.className || '';

      if (/year/i.test(id + name + cls)) {
        const y = parseInt(el.value, 10);
        if (y >= 2020 && y <= 2030) currentTrackerYear = y;
        setTimeout(() => updateTrackerBanner(currentTrackerYear, currentTrackerWeek), 200);
      }
    });

    // Trigger on click of tracker tab
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab], [data-panel], .nav-tab, .sidebar-item, li[data-section]');
      if (tab) {
        const target = tab.dataset.tab || tab.dataset.panel || tab.dataset.section
                     || tab.getAttribute('href') || '';
        if (/tracker|weekly/i.test(target)) {
          setTimeout(() => updateTrackerBanner(currentTrackerYear, currentTrackerWeek), 300);
          setTimeout(() => updateTrackerBanner(currentTrackerYear, currentTrackerWeek), 800);
        }
      }
    });

    // Initial check on load (in case tracker is the default tab)
    waitFor(
      () => document.querySelector('#weekly-tracker, #tracker-panel, .tracker-container, table.weekly-tracker'),
      () => updateTrackerBanner(currentTrackerYear, currentTrackerWeek),
      200, 10000
    );
  }

  // =========================================================================
  // FIX 1.7 — Exclude non-team owners from workload calculations
  // =========================================================================
  //
  // Strategy:
  //   Intercept all fetch calls that return case/workload data and filter out
  //   entries whose owner is in the excludedOwners list from team config.
  //   Also patch any global data stores the app may use (window.IIPData,
  //   window.appData, window.cases, etc.).
  //
  //   Excluded owners:
  //     - "Rhapsody IBM Contact at Bosch"  (165 cases — not a team member)
  //
  //   The filter is applied at THREE levels:
  //     1. API response interception (cleanest — data is filtered before render)
  //     2. DOM post-processing (backup — removes rows from already-rendered tables)
  //     3. Global data store patching (covers in-memory caches)
  // =========================================================================

  // Excluded owner strings (lowercase for case-insensitive matching)
  const EXCLUDED_OWNERS_LOWER = new Set([
    'rhapsody ibm contact at bosch',
  ]);

  // Name alias map: IBM raw string (lower) → canonical team member name
  const NAME_ALIASES = {
    'srinivasareddy karnatilakshmireddygari': 'Srinivas K',
    'srinivasareddy':                         'Srinivas K',
    'srinivas reddy':                         'Srinivas K',
    'arjun malliga':                          'Malliga Arjunan',
    'arjunan malliga':                        'Malliga Arjunan',
    'hareesh gadam':                          'Hareesh Gaddam',
    'malliga':                                'Malliga Arjunan',
    'sandeep':                                'Sandeep Yashoda',
    'srinivasareddy k':                       'Srinivas K',
  };

  function isExcludedOwner(owner) {
    if (!owner) return false;
    return EXCLUDED_OWNERS_LOWER.has(owner.toLowerCase().trim());
  }

  function resolveOwnerAlias(owner) {
    if (!owner) return owner;
    const lower = owner.toLowerCase().trim();
    return NAME_ALIASES[lower] || owner;
  }

  /**
   * Filter an array of case/workload objects, removing excluded owners
   * and resolving name aliases.
   */
  function filterAndNormaliseOwners(items) {
    if (!Array.isArray(items)) return items;
    return items
      .filter(item => !isExcludedOwner(item.owner || item.Owner || item.effective_owner || ''))
      .map(item => {
        const ownerKey = 'owner' in item ? 'owner' : 'Owner' in item ? 'Owner' : null;
        if (ownerKey) {
          const resolved = resolveOwnerAlias(item[ownerKey]);
          if (resolved !== item[ownerKey]) {
            return { ...item, [ownerKey]: resolved, _aliasResolved: true };
          }
        }
        return item;
      });
  }

  /** Patch a parsed JSON response body before it's consumed by the app. */
  function patchResponseBody(data, url) {
    // Cases list
    if (false /* api removed */) {
      if (Array.isArray(data))        return filterAndNormaliseOwners(data);
      if (Array.isArray(data?.cases)) return { ...data, cases: filterAndNormaliseOwners(data.cases) };
      if (Array.isArray(data?.items)) return { ...data, items: filterAndNormaliseOwners(data.items) };
      if (Array.isArray(data?.data))  return { ...data, data:  filterAndNormaliseOwners(data.data)  };
    }

    // Workload / stats
    if (/\/api\/v1\/cases\/stats/.test(url)) {
      if (data?.ownerWorkload) {
        data.ownerWorkload = filterAndNormaliseOwners(data.ownerWorkload);
      }
    }

    // Tracker entries
    if (/\/api\/v1\/tracker/.test(url) && !/tracker\/years|tracker\/member/.test(url)) {
      if (Array.isArray(data))           return filterAndNormaliseOwners(data);
      if (Array.isArray(data?.entries))  return { ...data, entries: filterAndNormaliseOwners(data.entries) };
    }

    return data;
  }

  /** Intercept fetch to filter owner data at the API response level. */
  function interceptOwnerFetch() {
    const origFetch = window.fetch;

    window.fetch = async function (...args) {
      const response = await origFetch.apply(this, args);

      const url = typeof args[0] === 'string' ? args[0]
                : (args[0]?.url) ? args[0].url : '';

      const relevant = /\/api\/v1\/(cases|tracker)/.test(url);
      if (!relevant) return response;

      // We need to intercept and return a modified Response
      const clone = response.clone();
      try {
        const data    = await clone.json();
        const patched = patchResponseBody(data, url);

        if (patched !== data) {
          log(`Fix 1.7: filtered owner data for ${url}`);
        }

        // Return a new Response with the patched body
        return new Response(JSON.stringify(patched), {
          status:     response.status,
          statusText: response.statusText,
          headers:    response.headers,
        });
      } catch (e) {
        // If JSON parsing fails, return the original response untouched
        return response;
      }
    };
  }

  /**
   * Patch in-memory global data stores that the app may have already
   * populated before this script loaded.
   */
  function patchGlobalDataStores() {
    const STORES = ['cases', 'allCases', 'openCases', 'trackerData', 'appData', 'IIPData'];
    for (const name of STORES) {
      if (!window[name]) continue;
      if (Array.isArray(window[name])) {
        const before = window[name].length;
        window[name] = filterAndNormaliseOwners(window[name]);
        log(`Fix 1.7: patched window.${name} (${before} → ${window[name].length} items)`);
      } else if (window[name]?.cases && Array.isArray(window[name].cases)) {
        window[name].cases = filterAndNormaliseOwners(window[name].cases);
        log(`Fix 1.7: patched window.${name}.cases`);
      }
    }
  }

  /**
   * Remove table rows whose owner cell matches an excluded owner.
   * This is the DOM-level fallback for rows already rendered.
   */
  function removeExcludedOwnerRows() {
    let removed = 0;

    // Strategy 1: rows with data-owner attribute
    document.querySelectorAll('tr[data-owner], li[data-owner], div[data-owner]').forEach(row => {
      const owner = row.getAttribute('data-owner');
      if (isExcludedOwner(owner)) {
        row.remove();
        removed++;
      }
    });

    // Strategy 2: table rows where a cell text matches exactly
    document.querySelectorAll('table tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      for (const cell of cells) {
        if (isExcludedOwner(cell.textContent.trim())) {
          row.remove();
          removed++;
          break;
        }
      }
    });

    if (removed > 0) {
      log(`Fix 1.7: removed ${removed} excluded-owner rows from DOM`);
    }
  }

  /** Inject a small label next to workload totals to note the exclusion. */
  function injectExclusionNote() {
    const NOTE_ATTR = 'data-p1-exclusion-note';
    const containers = document.querySelectorAll(
      '.workload-chart, .owner-chart, #workload-summary, .member-stats, .team-workload'
    );
    for (const c of containers) {
      if (c.hasAttribute(NOTE_ATTR)) continue;
      c.setAttribute(NOTE_ATTR, '1');
      const note = document.createElement('div');
      note.style.cssText = 'font-size:11px;color:#9ca3af;margin-top:6px;font-style:italic;';
      note.textContent = '* Excludes non-team owners (Rhapsody IBM Contact at Bosch and others)';
      c.appendChild(note);
    }
  }

  function initFix17() {
    if (!CFG.enableFix17) return;
    log('Fix 1.7: initialising owner exclusion filter');

    interceptOwnerFetch();

    // Patch any already-loaded global stores
    patchGlobalDataStores();

    // DOM-level cleanup (runs once at init and then watches for new tables)
    removeExcludedOwnerRows();
    injectExclusionNote();

    // Re-run DOM cleanup whenever new content is added (handles async renders)
    const obs = new MutationObserver(() => {
      removeExcludedOwnerRows();
      injectExclusionNote();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    // Also re-run when tabs change
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab], [data-panel], .nav-tab, .sidebar-item');
      if (tab) {
        setTimeout(removeExcludedOwnerRows, 300);
        setTimeout(removeExcludedOwnerRows, 800);
        setTimeout(injectExclusionNote, 800);
      }
    });

    log(`Fix 1.7: excluding ${EXCLUDED_OWNERS_LOWER.size} owner(s), ${Object.keys(NAME_ALIASES).length} aliases active`);
  }

  // =========================================================================
  // FETCH INTERCEPTOR COORDINATOR
  // =========================================================================
  // Fixes 1.5, 1.6, and 1.7 all need to intercept fetch.
  // Rather than wrapping fetch three separate times (fragile), we install ONE
  // combined interceptor that dispatches to each fix's handler.
  // This runs BEFORE the individual inits, replacing the per-fix interceptors.
  // =========================================================================

  function installCombinedFetchInterceptor() {
    const origFetch = window.fetch;

    window.fetch = async function (...args) {
      const response = await origFetch.apply(this, args);
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');

      // ── Fix 1.5: KB list sniffing ──────────────────────────────────────
      if (CFG.enableFix15 && /\/api\/v1\/kb\b/.test(url) && !/\/api\/v1\/kb\/KB-/.test(url)) {
        const c = response.clone();
        c.json().then(data => {
          const articles = Array.isArray(data) ? data
                         : Array.isArray(data?.items) ? data.items
                         : Array.isArray(data?.data)  ? data.data : [];
          for (const a of articles) {
            if (a.status === 'auto-extracted' || a.autoExtracted) autoExtractedIds.add(a.id);
          }
          setTimeout(scanAndBadgeKbRows, 100);
          setTimeout(scanAndBadgeKbRows, 500);
        }).catch(() => {});
        return response;
      }

      // ── Fix 1.6: Tracker years / week sniffing ────────────────────────
      if (CFG.enableFix16 && /\/api\/v1\/tracker/.test(url)) {
        if (/\/tracker\/years/.test(url)) {
          const c = response.clone();
          c.json().then(data => {
            const yearsData = data.years || data;
            if (typeof yearsData === 'object') {
              for (const [yr, weeks] of Object.entries(yearsData)) {
                liveAvailableWeeks[parseInt(yr, 10)] = new Set(Array.isArray(weeks) ? weeks : []);
              }
            }
          }).catch(() => {});
          return response;
        }
        const weekMatch = url.match(/year=(\d{4}).*week=(CW\d{2})|week=(CW\d{2}).*year=(\d{4})/);
        if (weekMatch) {
          const year = parseInt(weekMatch[1] || weekMatch[4], 10);
          const week = weekMatch[2] || weekMatch[3];
          currentTrackerYear = year;
          currentTrackerWeek = week;
          const c = response.clone();
          c.json().then(data => {
            const entries = Array.isArray(data) ? data : Array.isArray(data?.entries) ? data.entries : [];
            if (!liveAvailableWeeks[year]) liveAvailableWeeks[year] = new Set();
            if (entries.length > 0) liveAvailableWeeks[year].add(week);
            setTimeout(() => updateTrackerBanner(year, week), 100);
          }).catch(() => {});
          return response;
        }
      }

      // ── Fix 1.7: Owner filtering ──────────────────────────────────────
      if (CFG.enableFix17 && /\/api\/v1\/(cases|tracker)/.test(url)) {
        try {
          const clone  = response.clone();
          const data   = await clone.json();
          const patched = patchResponseBody(data, url);
          if (patched !== data) {
            return new Response(JSON.stringify(patched), {
              status:     response.status,
              statusText: response.statusText,
              headers:    response.headers,
            });
          }
        } catch (_) { /* non-JSON — return original */ }
      }

      return response;
    };
  }

  // =========================================================================
  // INITIALISATION
  // =========================================================================

  function init() {
    log('Phase 1 patches loading…');

    // Install the single combined fetch interceptor first
    installCombinedFetchInterceptor();

    // Initialise each fix (CSS injection, DOM observers, etc.)
    // Note: fetch interception is handled by the combined interceptor above,
    // so the individual inits skip their own interceptors (already removed).
    if (CFG.enableFix15) {
      injectFix15Css();
      watchSelector(
        '[data-status="auto-extracted"], .kb-auto, .kb-article-auto',
        addNeedsReviewBadge
      );
      document.addEventListener('click', e => {
        const tab = e.target.closest('[data-tab],[data-panel],.nav-tab,.sidebar-item');
        if (tab) {
          const t = tab.dataset.tab || tab.dataset.panel || tab.getAttribute('href') || '';
          if (/kb|knowledge/i.test(t)) { setTimeout(scanAndBadgeKbRows, 200); setTimeout(scanAndBadgeKbRows, 800); }
        }
      });
      let sc = 0;
      const si = setInterval(() => { scanAndBadgeKbRows(); if (++sc >= 20) clearInterval(si); }, 150);
    }

    if (CFG.enableFix16) {
      injectFix16Css();
      document.addEventListener('change', e => {
        const el = e.target;
        if (!el) return;
        if (/year/i.test((el.id || '') + (el.name || '') + (el.className || ''))) {
          const y = parseInt(el.value, 10);
          if (y >= 2020 && y <= 2030) currentTrackerYear = y;
          setTimeout(() => updateTrackerBanner(currentTrackerYear, currentTrackerWeek), 200);
        }
      });
      document.addEventListener('click', e => {
        const tab = e.target.closest('[data-tab],[data-panel],.nav-tab,.sidebar-item,li[data-section]');
        if (tab) {
          const t = tab.dataset.tab || tab.dataset.panel || tab.dataset.section || tab.getAttribute('href') || '';
          if (/tracker|weekly/i.test(t)) {
            setTimeout(() => updateTrackerBanner(currentTrackerYear, currentTrackerWeek), 300);
            setTimeout(() => updateTrackerBanner(currentTrackerYear, currentTrackerWeek), 800);
          }
        }
      });
      waitFor(
        () => document.querySelector('#weekly-tracker,#tracker-panel,.tracker-container,table.weekly-tracker'),
        () => updateTrackerBanner(currentTrackerYear, currentTrackerWeek),
        200, 10000
      );
    }

    if (CFG.enableFix17) {
      patchGlobalDataStores();
      removeExcludedOwnerRows();
      injectExclusionNote();
      const obs17 = new MutationObserver(() => { removeExcludedOwnerRows(); injectExclusionNote(); });
      obs17.observe(document.body, { childList: true, subtree: true });
      document.addEventListener('click', e => {
        const tab = e.target.closest('[data-tab],[data-panel],.nav-tab,.sidebar-item');
        if (tab) { setTimeout(removeExcludedOwnerRows, 300); setTimeout(removeExcludedOwnerRows, 800); setTimeout(injectExclusionNote, 800); }
      });
    }

    log(`Phase 1 patches active: Fix1.5=${CFG.enableFix15} Fix1.6=${CFG.enableFix16} Fix1.7=${CFG.enableFix17}`);
  }

  // Expose public API for debugging / manual control
  window.IIPPatches = {
    config:               CFG,
    scanAndBadgeKbRows,
    updateTrackerBanner:  () => updateTrackerBanner(currentTrackerYear, currentTrackerWeek),
    removeExcludedOwners: removeExcludedOwnerRows,
    isExcludedOwner,
    resolveOwnerAlias,
    getMissingWeeks:      year => getMissingWeeks(year || currentTrackerYear),
    autoExtractedIds,
  };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}(window));

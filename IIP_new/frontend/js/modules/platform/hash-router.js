// =============================================================================
// frontend/js/modules/hash-router.js
// URL Hash Router — IIP Phase 2, Fix 2.1
//
// Gives every tab a bookmarkable, shareable URL using the hash fragment.
// Works as a drop-in: reads the existing tab navigation DOM and wraps it.
//
// BEFORE (broken):
//   Every tab shows the same URL: https://iip.local/
//   Browser Back/Forward don't navigate between tabs
//   Refreshing always shows the default tab
//
// AFTER (fixed):
//   Each tab has a unique URL: https://iip.local/#overview
//   Browser Back/Forward navigate between tabs
//   Refresh restores the active tab
//   Links like https://iip.local/#admin can be shared
//
// INSTALLATION:
//   Add ONE script tag in index.html AFTER all dashboard scripts:
//     <script src="js/modules/hash-router.js"></script>
//
// HOW IT WORKS:
//   1. Scans the DOM for tab triggers and assigns each a hash ID
//   2. On load, reads window.location.hash and activates the matching tab
//   3. Intercepts tab clicks and pushes a history entry
//   4. Listens to popstate to handle Back/Forward navigation
//   5. Updates <title> on every navigation
//
// CUSTOMISING TAB→HASH MAPPING:
//   Override window.IIPHashRouterConfig before this script loads:
//     window.IIPHashRouterConfig = { tabMap: { 'my-tab-id': 'my-hash' } };
// =============================================================================

'use strict';

(function (window, document) {

  // ── Default tab → hash mapping ───────────────────────────────────────────
  // Keys = the data-tab / data-panel / id values the app uses on nav elements
  // Values = the hash fragment (without #)
  const DEFAULT_TAB_MAP = {
    // Dashboard modules
    'overview':         'overview',
    'weekly-tracker':   'weekly-tracker',
    'tracker':          'weekly-tracker',
    'knowledge-hub':    'knowledge-hub',
    'knowledge':        'knowledge-hub',
    'knowledge-dash':   'knowledge',
    'performance':      'performance',
    'info':             'case-detail',
    'case-detail':      'case-detail',
    'closed':           'closed-cases',
    'closed-cases':     'closed-cases',
    'team':             'team',
    'members':          'members',
    'investigate':      'investigate',
    'intelligence':     'intelligence',
    'copilot':          'copilot',
    'admin-dash':       'admin',
    'admin':            'admin',
    'changelog':        'changelog',
    'customer':         'customer',
    'created':          'created',
  };

  // Human-readable page titles for <title> tag
  const PAGE_TITLES = {
    'overview':       'Overview',
    'weekly-tracker': 'Weekly Tracker',
    'knowledge-hub':  'Knowledge Hub',
    'knowledge':      'Knowledge',
    'performance':    'Performance',
    'case-detail':    'Case Detail',
    'closed-cases':   'Closed Cases',
    'team':           'Team',
    'members':        'Members',
    'investigate':    'Investigate',
    'intelligence':   'Intelligence',
    'copilot':        'Copilot',
    'admin':          'Admin',
    'changelog':      'Changelog',
    'customer':       'Customer',
    'created':        'Created Cases',
  };

  const APP_NAME = document.title || 'IIP';
  const DEFAULT_HASH = 'overview';

  // Merge user config
  const userCfg = window.IIPHashRouterConfig || {};
  const TAB_MAP = Object.assign({}, DEFAULT_TAB_MAP, userCfg.tabMap || {});

  // Reverse map: hash → canonical tab key
  const HASH_TO_TAB = {};
  for (const [tab, hash] of Object.entries(TAB_MAP)) {
    if (!HASH_TO_TAB[hash]) HASH_TO_TAB[hash] = tab;
  }

  let _navigating = false; // prevent re-entrant popstate loops

  // ── Utilities ─────────────────────────────────────────────────────────────

  function log(msg) {
    if (userCfg.debug) console.log(`[HashRouter] ${msg}`);
  }

  function currentHash() {
    return (window.location.hash || '').replace(/^#/, '').toLowerCase().trim();
  }

  /** Find all tab trigger elements — covers the common patterns IIP might use */
  function findTabTriggers() {
    return document.querySelectorAll([
      '[data-tab]',
      '[data-panel]',
      '[data-section]',
      '.nav-tab',
      '.sidebar-item[data-id]',
      'li[data-tab]',
      'a[href^="#"]',
      '[role="tab"]',
    ].join(', '));
  }

  /** Extract the tab key from an element */
  function getTabKey(el) {
    return (
      el.dataset.tab    ||
      el.dataset.panel  ||
      el.dataset.section||
      el.dataset.id     ||
      (el.getAttribute('href') || '').replace(/^#/, '') ||
      el.id             ||
      ''
    ).toLowerCase().trim();
  }

  /** Resolve a raw tab key to its canonical hash value */
  function tabKeyToHash(key) {
    return TAB_MAP[key] || key || DEFAULT_HASH;
  }

  /** Given a hash, find the best matching tab trigger element */
  function findTriggerForHash(hash) {
    const canonicalTab = HASH_TO_TAB[hash] || hash;

    // Try every possible attribute/value combination
    const selectors = [
      `[data-tab="${hash}"]`,
      `[data-tab="${canonicalTab}"]`,
      `[data-panel="${hash}"]`,
      `[data-panel="${canonicalTab}"]`,
      `[data-section="${hash}"]`,
      `[data-section="${canonicalTab}"]`,
      `[data-id="${hash}"]`,
      `[data-id="${canonicalTab}"]`,
      `a[href="#${hash}"]`,
      `a[href="#${canonicalTab}"]`,
      `[role="tab"][aria-controls="${hash}"]`,
      `[role="tab"][aria-controls="${canonicalTab}"]`,
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }

    // Fallback: text-content match on nav items
    for (const el of findTabTriggers()) {
      const text = (el.textContent || '').toLowerCase().trim();
      if (text === hash || text === canonicalTab) return el;
    }

    return null;
  }

  // ── Core navigation ───────────────────────────────────────────────────────

  /**
   * Navigate to a tab by its hash.
   * pushState=true  → new browser history entry (for user clicks)
   * pushState=false → replaceState (for initial load)
   */
  function navigateTo(hash, pushState) {
    if (!hash) hash = DEFAULT_HASH;
    hash = hash.toLowerCase().replace(/^#/, '');

    log(`navigateTo("${hash}", push=${pushState})`);

    // Update URL
    const newUrl = window.location.pathname + window.location.search + '#' + hash;
    if (pushState) {
      window.history.pushState({ hash }, '', newUrl);
    } else {
      window.history.replaceState({ hash }, '', newUrl);
    }

    // Update page title
    const label = PAGE_TITLES[hash] || hash.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    document.title = `${label} — ${APP_NAME}`;

    // Find and click the tab trigger
    const trigger = findTriggerForHash(hash);
    if (trigger) {
      _navigating = true;
      trigger.click();
      _navigating = false;
      log(`Activated trigger for "${hash}"`);
    } else {
      log(`No trigger found for "${hash}" — attempting panel show`);
      // Fallback: show/hide panels directly
      activatePanelDirectly(hash);
    }

    // Announce to screen readers
    announceNavigation(label);
  }

  /**
   * Direct panel activation fallback — shows the panel matching the hash
   * and hides all others, without needing a tab trigger.
   */
  function activatePanelDirectly(hash) {
    const canonical = HASH_TO_TAB[hash] || hash;
    const panelSelectors = [
      `#${hash}-panel`, `#${hash}`, `[data-panel-id="${hash}"]`,
      `#${canonical}-panel`, `#${canonical}`,
    ];

    let found = false;
    for (const sel of panelSelectors) {
      const panel = document.querySelector(sel);
      if (panel) {
        // Hide siblings of the same type
        const parent = panel.parentElement;
        if (parent) {
          parent.querySelectorAll('[data-panel-id], .dashboard-panel, .tab-panel').forEach(p => {
            p.style.display = 'none';
            p.hidden = true;
          });
        }
        panel.style.display = '';
        panel.hidden = false;
        found = true;
        break;
      }
    }

    if (!found) log(`activatePanelDirectly: no panel found for "${hash}"`);
  }

  /** Announce navigation to screen readers via an aria-live region */
  function announceNavigation(label) {
    let announcer = document.getElementById('iip-router-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'iip-router-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
      document.body.appendChild(announcer);
    }
    announcer.textContent = `Navigated to ${label}`;
  }

  // ── Event listeners ───────────────────────────────────────────────────────

  /**
   * Intercept tab clicks to push history state.
   * Uses event delegation on document.body to catch dynamically-added triggers.
   */
  function installClickInterceptor() {
    document.body.addEventListener('click', function (e) {
      if (_navigating) return;

      const trigger = e.target.closest([
        '[data-tab]', '[data-panel]', '[data-section]',
        '.nav-tab', '.sidebar-item[data-id]',
        'a[href^="#"]', '[role="tab"]',
      ].join(', '));

      if (!trigger) return;

      const key  = getTabKey(trigger);
      if (!key)  return;

      const hash = tabKeyToHash(key);

      // Don't duplicate if already on this hash
      if (currentHash() === hash) return;

      log(`Click intercepted: key="${key}" → hash="${hash}"`);

      // Push state without re-clicking the trigger (it's already being clicked)
      const newUrl = window.location.pathname + window.location.search + '#' + hash;
      window.history.pushState({ hash }, '', newUrl);

      const label = PAGE_TITLES[hash] || hash;
      document.title = `${label} — ${APP_NAME}`;
      announceNavigation(label);
    }, true); // capture phase so we run before any stopPropagation
  }

  /** Handle Back/Forward browser navigation */
  function installPopstateHandler() {
    window.addEventListener('popstate', function (e) {
      const hash = (e.state && e.state.hash)
                 ? e.state.hash
                 : currentHash() || DEFAULT_HASH;
      log(`popstate: "${hash}"`);
      navigateTo(hash, false);
    });
  }

  // ── Keyboard shortcut navigation ─────────────────────────────────────────
  // Alt+1..9 navigate to tabs in order

  const SHORTCUT_TABS = [
    'overview', 'weekly-tracker', 'knowledge-hub', 'performance',
    'closed-cases', 'team', 'investigate', 'intelligence', 'admin',
  ];

  function installKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      // Alt + number key
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const n = parseInt(e.key, 10);
      if (isNaN(n) || n < 1 || n > 9) return;

      const target = SHORTCUT_TABS[n - 1];
      if (!target) return;

      e.preventDefault();
      navigateTo(target, true);
      log(`Keyboard shortcut Alt+${n} → "${target}"`);
    });
  }

  // ── Tab list enhancement: add hash links ─────────────────────────────────

  /**
   * Enhance all tab triggers to also carry the correct href="#hash"
   * so middle-click / ctrl+click opens in a new tab with the right URL.
   */
  function enhanceTabLinks() {
    for (const el of findTabTriggers()) {
      const key  = getTabKey(el);
      if (!key) continue;
      const hash = tabKeyToHash(key);

      // Add href if the element supports it and doesn't already have one
      if (el.tagName === 'A' && !el.getAttribute('href')) {
        el.setAttribute('href', '#' + hash);
      }

      // Add data-hash for CSS targeting
      el.setAttribute('data-hash', hash);

      // Add title tooltip
      if (!el.title) {
        const label = PAGE_TITLES[hash] || hash;
        el.title = `${label} (Alt+${SHORTCUT_TABS.indexOf(hash) + 1 || ''})`.replace(' (Alt+0)', '');
      }
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    log('Initialising hash router');

    installPopstateHandler();
    installClickInterceptor();
    installKeyboardShortcuts();

    // Enhance tab links after a short delay (allows dashboard JS to render nav)
    setTimeout(enhanceTabLinks, 500);
    setTimeout(enhanceTabLinks, 1500); // second pass for late-rendering navs

    // Navigate to initial hash (or default) on page load
    const initialHash = currentHash() || DEFAULT_HASH;
    log(`Initial hash: "${initialHash}"`);

    // Wait for the app to finish its async data-restore before navigating.
    // If we fire too early (100ms was not enough) the upload screen is still
    // showing, the nav click does nothing, and the app gets stuck on the
    // upload screen. App signals readiness via window._iipAppReady.
    let _waited = 0;
    const _MAX_WAIT = 8000; // give up after 8 s and navigate anyway
    const _POLL_MS  = 50;

    function _waitForApp() {
      if (window._iipAppReady) {
        navigateTo(initialHash, false);
        log('Hash router initial navigation fired (app ready)');
        return;
      }
      _waited += _POLL_MS;
      if (_waited >= _MAX_WAIT) {
        log('App ready timeout — firing initial navigation anyway');
        navigateTo(initialHash, false);
        return;
      }
      setTimeout(_waitForApp, _POLL_MS);
    }
    setTimeout(_waitForApp, 50);

    log('Hash router ready — waiting for app');
  }

  // Expose public API
  window.IIPRouter = {
    navigate:      (hash) => navigateTo(hash, true),
    currentHash,
    tabKeyToHash,
    TAB_MAP,
    PAGE_TITLES,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}(window, document));
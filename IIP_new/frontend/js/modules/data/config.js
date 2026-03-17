/* ================================================================
   js/modules/config.js  —  Application Config Adapter
   ----------------------------------------------------------------
   This module is a READ-ONLY adapter over AppData (app-data.js).

   ► DO NOT edit config values here.
     All app-wide constants live in:  js/data/app-data.js
     under the "config" section.
   ================================================================ */

const Config = (() => {

  /* ── Guard: warn gracefully if AppData hasn't loaded ──────── */
  if (typeof AppData === "undefined") {
    console.warn(
      "[Config] AppData not found. " +
      "Ensure js/data/app-data.js is loaded before config.js. " +
      "Using built-in defaults."
    );
    return Object.freeze({
      TEAM_NAME:          "BD/TOA-ETS5",
      APP_TITLE:          "IBM Cases",
      APP_SUBTITLE:       "IBM Case Intelligence Platform",
      DEFECT_BASE_URL:    "",
      IDLE_TIMEOUT_MS:    30 * 60 * 1000,
      IDLE_WARNING_MS:    27 * 60 * 1000,
      SESSION_MAX_AGE_MS: 30 * 60 * 1000,
      TABLE_PAGE_SIZE:    50,
      PERSIST_KEY_TRACKER: "ibm_tracker_persist_v1",
      PERSIST_KEY_KB:      "ibm_knowledge_base_v2",
      PERSIST_KEY_CASES:   "ibm_cases_raw_v1",
    });
  }

  /* ── Delegate to AppData.config ──────────────────────────── */
  const c = AppData.config;

  return Object.freeze({
    TEAM_NAME:           c.teamName,
    APP_TITLE:           c.appTitle,
    APP_SUBTITLE:        c.appSubtitle,
    DEFECT_BASE_URL:     c.defectBaseUrl,
    IDLE_TIMEOUT_MS:     c.idleTimeoutMs,
    IDLE_WARNING_MS:     c.idleWarningMs,
    SESSION_MAX_AGE_MS:  c.idleTimeoutMs,   // same value as timeout
    TABLE_PAGE_SIZE:     c.tablePageSize,
    PERSIST_KEY_TRACKER: c.persistKeyTracker,
    PERSIST_KEY_KB:      c.persistKeyKB,
    PERSIST_KEY_CASES:   c.persistKeyCases,
  });

})();

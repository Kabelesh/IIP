/* ================================================================
   js/modules/version.js  —  Single Source of Truth: App Version
   ----------------------------------------------------------------
   ALL version references in the application read from this file.
   To release a new version, update ONLY this file.
   The bump-version.js automation script updates this automatically.
   ================================================================ */

const AppVersion = (() => {

  const MAJOR   = 8;
  const MINOR   = 5;
  const PATCH   = 7;

  const version  = `v${MAJOR}.${MINOR}.${PATCH}`;
  const semver   = `${MAJOR}.${MINOR}.${PATCH}`;
  const date     = "2026-03-18";
  const developer = "Kabelesh K";

  return Object.freeze({ version, semver, MAJOR, MINOR, PATCH, date, developer });

})();

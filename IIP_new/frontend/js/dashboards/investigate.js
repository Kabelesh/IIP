/* ============================================================
   js/dashboards/investigate.js — Case Investigation AI
   + Support Intelligence (merged)
   ============================================================
   Permanent case archive:
     Every Excel upload merges cases into `ibm_investigate_archive_v1`
     (keyed by Case Number). Weekly Tracker comments are attached.
     This lets the Investigation page search ALL cases ever loaded,
     even after the browser is closed and a fresh Excel is imported.
   ============================================================ */
const DashInvestigate = (() => {

  const ARCHIVE_KEY = 'ibm_investigate_archive_v1';

  /* ── Loading state helper ───────────────────────────────────────── */
  function _setLoading(active) {
    const el = document.getElementById('content-area') || document.body;
    el.classList.toggle('dashboard-loading', active);
    document.querySelectorAll('.table-wrap, .dash-table').forEach(t => {
      t.classList.toggle('skeleton-loading', active);
    });
  }

  let _lastInput = "";
  let _lastResults = null;
  let _activeSection = "investigate"; // "investigate" | "intelligence" | "archive-search"
  let _archiveSearch = "";            // archive search query string

  /* ══════════════════════════════════════════════════════════════════
     PERSISTENT CASE ARCHIVE
     ══════════════════════════════════════════════════════════════════ */

  /** Read entire archive from localStorage */
  function _getArchive() {
    try {
      const raw = localStorage.getItem(ARCHIVE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }

  /** Write archive to localStorage */
  function _setArchive(archive) {
    try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive)); }
    catch (e) { console.warn('[Investigate] Archive write failed:', e.message); }
  }

  /**
   * Merge an array of case rows into the archive.
   * Called externally from app.js every time an Excel is loaded.
   * Cases are keyed by "Case Number" — duplicates are updated, new ones are added.
   */
  function archiveCases(rows) {
    if (!rows || !rows.length) return;
    const archive = _getArchive();
    const now = new Date().toISOString();
    rows.forEach(c => {
      const cn = c['Case Number'];
      if (!cn) return;
      // Merge: keep existing fields, overwrite with fresh data
      const existing = archive[cn] || {};
      archive[cn] = Object.assign({}, existing, {
        'Case Number': cn,
        Title:    c.Title   || existing.Title   || '',
        Product:  c.Product || existing.Product || '',
        Status:   c.Status  || existing.Status  || '',
        Owner:    c.Owner   || existing.Owner   || '',
        Created:  c.Created || existing.Created || '',
        Severity: c.Severity || existing.Severity || '',
        _lastSeen: now,
      });
    });
    _setArchive(archive);
  }

  /** Attach Weekly Tracker comments + caseDetailLogs to archive entries, return flat array */
  function _getEnrichedArchive() {
    const archive = _getArchive();

    // 1. Weekly Tracker comments (ibm_wtracker_comments_v1)
    let wtComments = {};
    try {
      const raw = localStorage.getItem('ibm_wtracker_comments_v1');
      if (raw) wtComments = JSON.parse(raw);
    } catch (_) {}

    // 2. Case detail logs (wednesday comments from Data module / ibm_tracker_persist_v1)
    let caseDetailLogs = {};
    try {
      if (typeof Data !== 'undefined' && Data.getCaseDetailLog) {
        Object.keys(archive).forEach(cn => {
          const log = Data.getCaseDetailLog(cn);
          if (log) caseDetailLogs[cn] = log;
        });
      }
      if (!Object.keys(caseDetailLogs).length) {
        const raw = localStorage.getItem('ibm_tracker_persist_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.caseDetailLogs) caseDetailLogs = parsed.caseDetailLogs;
        }
      }
    } catch (_) {}

    // 3. Also merge in any CURRENT session cases that may not yet be archived
    try {
      if (typeof Data !== 'undefined' && Data.allCases) {
        Data.allCases().forEach(c => {
          const cn = c['Case Number'];
          if (!cn) return;
          if (!archive[cn]) {
            archive[cn] = {
              'Case Number': cn,
              Title:    c.Title   || '',
              Product:  c.Product || '',
              Status:   c.Status  || '',
              Owner:    c.Owner   || '',
              Created:  c.Created || '',
              Severity: c.Severity || '',
              _lastSeen: new Date().toISOString(),
            };
          }
        });
      }
    } catch (_) {}

    // Build flat array with comments attached
    return Object.values(archive).map(c => {
      const cn = c['Case Number'];
      // Attach weekly tracker comment
      c._wtComment = wtComments[cn] || '';
      // Attach merged wednesday comments
      const log = caseDetailLogs[cn];
      if (log && log.wednesdayComments) {
        c._wednesdayComments = Object.values(log.wednesdayComments).join(' ');
      } else {
        c._wednesdayComments = '';
      }
      return c;
    });
  }

  /** Get archive count */
  function archiveCount() {
    return Object.keys(_getArchive()).length;
  }

  /** Clear archive (exposed for admin use) */
  function clearArchive() {
    try { localStorage.removeItem(ARCHIVE_KEY); } catch (_) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════ */
  function render() {
    const el = document.getElementById("tab-investigate");
    if (!el) return;

    const count = archiveCount();

    el.innerHTML = `
      <!-- Tab switcher -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap">
        <div style="display:flex;gap:0;border:1px solid var(--border-mid);border-radius:var(--radius-md);overflow:hidden;width:fit-content">
          <button id="inv-tab-investigate" class="inv-section-tab ${_activeSection==='investigate'?'active':''}"
            style="padding:8px 22px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font-sans);
            background:${_activeSection==='investigate'?'var(--ibm-blue-50)':'var(--bg-layer)'};
            color:${_activeSection==='investigate'?'#fff':'var(--text-secondary)'}">
            Case Investigation AI
          </button>
          <button id="inv-tab-intelligence" class="inv-section-tab ${_activeSection==='intelligence'?'active':''}"
            style="padding:8px 22px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font-sans);
            background:${_activeSection==='intelligence'?'var(--ibm-blue-50)':'var(--bg-layer)'};
            color:${_activeSection==='intelligence'?'#fff':'var(--text-secondary)'}">
            Support Intelligence
          </button>
          <button id="inv-tab-archive-search" class="inv-section-tab ${_activeSection==='archive-search'?'active':''}"
            style="padding:8px 22px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font-sans);
            background:${_activeSection==='archive-search'?'var(--ibm-blue-50)':'var(--bg-layer)'};
            color:${_activeSection==='archive-search'?'#fff':'var(--text-secondary)'}">
            Archive Search
          </button>
        </div>
        <div class="archive-stat">
          📦 Archive: <span class="archive-count">${count}</span> cases stored permanently
        </div>
      </div>

      <div id="inv-section-investigate" style="display:${_activeSection==='investigate'?'block':'none'}">
        ${renderInvestigateHTML()}
      </div>
      <div id="inv-section-intelligence" style="display:${_activeSection==='intelligence'?'block':'none'}">
        ${renderIntelligenceHTML()}
      </div>
      <div id="inv-section-archive-search" style="display:${_activeSection==='archive-search'?'block':'none'}">
        ${renderArchiveSearchHTML()}
      </div>
    `;

    // Tab switcher events
    document.getElementById("inv-tab-investigate")?.addEventListener("click", () => {
      _activeSection = "investigate";
      render();
    });
    document.getElementById("inv-tab-intelligence")?.addEventListener("click", () => {
      _activeSection = "intelligence";
      render();
      renderIntelligenceCharts();
    });
    document.getElementById("inv-tab-archive-search")?.addEventListener("click", () => {
      _activeSection = "archive-search";
      render();
    });

    if (_activeSection === "investigate") {
      bindInvestigateEvents(el);
    } else if (_activeSection === "archive-search") {
      bindArchiveSearchEvents();
    } else {
      renderIntelligenceCharts();
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     CASE INVESTIGATION TAB
     ══════════════════════════════════════════════════════════════════ */
  const SAMPLE_SNIPPETS = [
    { label: "CRJAZ Error Code", text: "CRJAZ0428E Could not load classpath entry for the module. Check the server configuration." },
    { label: "Java Heap OutOfMemory", text: "Exception in thread 'main' java.lang.OutOfMemoryError: Java heap space\n\tat com.ibm.team.repository.service.internal.rdb.ConnectionPool.checkout(ConnectionPool.java:234)" },
    { label: "HTTP 500 Jazz Server", text: "[ERROR] Jazz server returned HTTP 500 Internal Server Error\ncom.ibm.team.repository.common.TeamRepositoryException: Server error processing request" },
    { label: "ETM Dashboard Load", text: "ETM dashboard fails to load test cases. NullPointerException in test suite rendering after recent server upgrade." },
    { label: "CCM Slowness", text: "ALM-20-P CCM slowness performance issue. Server response times exceeding 30 seconds for work item queries." },
    { label: "DNG Attribute Job Fail", text: "DCC requirement types and attributes job alone is failed. CRRTC1234E Module sync error." },
  ];

  function renderInvestigateHTML() {
    const count = archiveCount();
    return `
      <div class="mb-16">
        <div style="font-size:18px;font-weight:700;color:var(--text-primary)">Case Investigation</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">
          Search across <strong>${count}</strong> permanently archived cases &amp; weekly tracker comments to find similar issues before raising a new case
        </div>
      </div>

      <div class="investigate-layout">
        <!-- Input panel -->
        <div>
          <div class="tile" style="padding:0;overflow:hidden">
            <div style="padding:12px 16px;background:var(--bg-layer);border-bottom:1px solid var(--border-subtle);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">
              📋 Paste Error / Stack Trace / Log Snippet
            </div>
            <textarea id="invest-input" class="investigate-textarea"
              placeholder="Paste your error message here…

Examples:
• CRJAZ0428E Could not load classpath entry…
• com.ibm.team.repository.common.TeamRepositoryException
• Exception in thread 'main' java.lang.OutOfMemoryError: Java heap space
• [ERROR] Jazz server returned HTTP 500 Internal Server Error
• CCM slowness performance issue
• NullPointerException at com.ibm.team.workitem…">${Utils.escHtml(_lastInput)}</textarea>
            <div class="investigate-footer">
              <div id="invest-tokens" class="detected-tokens"></div>
              <button id="invest-analyze" class="btn btn-primary">Analyze</button>
            </div>
          </div>

          <!-- Sample queries -->
          <div class="mt-12">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);margin-bottom:8px">Try These Examples:</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${SAMPLE_SNIPPETS.map(s => `
                <button class="sample-snippet-btn" data-snippet="${Utils.escHtml(s.text)}"
                  style="background:var(--bg-layer);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);
                  padding:8px 12px;text-align:left;cursor:pointer;font-size:12px;color:var(--text-secondary);
                  font-family:var(--font-mono);transition:all var(--transition-fast);line-height:1.4">
                  ${Utils.escHtml(s.label)}
                </button>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Results panel -->
        <div id="invest-results">
          ${_lastResults ? renderResults(_lastResults) : `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;color:var(--text-disabled)">
              <div style="font-size:48px;margin-bottom:12px">🔬</div>
              <div style="font-size:14px;text-align:center">Enter text on the left and click<br/><strong>Analyze</strong> to detect issues and find similar cases</div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  function bindInvestigateEvents(el) {
    const textarea = document.getElementById("invest-input");
    textarea?.addEventListener("input", e => {
      _lastInput = e.target.value;
      updateTokens();
    });
    if (_lastInput) updateTokens();
    document.getElementById("invest-analyze")?.addEventListener("click", analyze);
    textarea?.addEventListener("keydown", e => {
      if (e.ctrlKey && e.key === "Enter") analyze();
    });
    el.querySelectorAll(".sample-snippet-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const ta = document.getElementById("invest-input");
        if (ta) { ta.value = btn.dataset.snippet; _lastInput = btn.dataset.snippet; updateTokens(); analyze(); }
      });
    });
  }

  function updateTokens() {
    const container = document.getElementById("invest-tokens");
    if (!container) return;
    const analysis = Similarity.analyzeText(_lastInput);
    let html = "";
    analysis.errorCodes.slice(0, 5).forEach(ec => {
      html += `<span class="token-badge token-error" title="Error Code">🔴 ${Utils.escHtml(ec)}</span>`;
    });
    analysis.products.slice(0, 3).forEach(p => {
      html += `<span class="token-badge token-product" title="Product">📦 ${Utils.escHtml(p)}</span>`;
    });
    analysis.keywords.slice(0, 5).forEach(kw => {
      html += `<span class="token-badge token-keyword" title="Keyword">${Utils.escHtml(kw)}</span>`;
    });
    container.innerHTML = html || `<span style="font-size:11px;color:var(--text-disabled)">Start typing to detect error codes…</span>`;
  }

  function analyze() {
    const input = _lastInput.trim();
    if (!input) { alert("Please paste some error text first."); return; }

    // Use enriched archive (ALL permanent cases + comments), not just current session
    const allCases = _getEnrichedArchive();
    const analysis = Similarity.analyzeText(input);
    const similar  = Similarity.findSimilarCases(input, allCases, 15);

    // Knowledge Base matches (if module exists)
    let kbMatches = [];
    try {
      const kbEntries = _getKBEntries();
      kbMatches = findKBMatches(input, kbEntries);
    } catch (_) {}

    _lastResults = { analysis, similar, kbMatches, input };
    const resultsEl = document.getElementById("invest-results");
    if (resultsEl) resultsEl.innerHTML = renderResults(_lastResults);
  }

  /** Get Knowledge Base entries — tries multiple sources */
  function _getKBEntries() {
    // Try global Knowledge module
    if (typeof Knowledge !== 'undefined' && Knowledge.all) return Knowledge.all();
    // Try DashKnowledgeHub
    if (typeof DashKnowledgeHub !== 'undefined' && DashKnowledgeHub.all) return DashKnowledgeHub.all();
    // Try localStorage directly
    try {
      const raw = localStorage.getItem('ibm_knowledge_base_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : (parsed.entries || []);
      }
    } catch (_) {}
    return [];
  }

  function findKBMatches(input, entries) {
    if (!entries || !entries.length) return [];
    const inputTokens = Similarity.tokenize(input);
    if (!inputTokens.length) return [];
    return entries.map(e => {
      const text = [e.title, e.rootCause, e.resolution, (e.tags || []).join(" ")].join(" ");
      const tokens = Similarity.tokenize(text);
      const overlap = inputTokens.filter(t => tokens.includes(t)).length;
      const score = overlap / Math.max(inputTokens.length, 1);
      return { entry: e, score };
    }).filter(m => m.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  function renderResults({ analysis, similar, kbMatches }) {
    const hasErrorCodes = analysis.errorCodes.length > 0;
    const hasProducts   = analysis.products.length > 0;

    // Separate cases with comments for the "Cases with Discussion" section
    const withComments = similar.filter(s => s.case._wtComment || s.case._wednesdayComments);

    return `
      <div class="tile" style="border-top:3px solid var(--ibm-blue-50);margin-bottom:12px">
        <div class="section-title">🎯 Detection Summary</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${hasErrorCodes ? analysis.errorCodes.map(ec => `<span class="token-badge token-error">🔴 ${Utils.escHtml(ec)}</span>`).join("") : ""}
          ${hasProducts ? analysis.products.map(p => `<span class="token-badge token-product">📦 ${Utils.escHtml(p)}</span>`).join("") : ""}
          ${analysis.keywords.slice(0,8).map(kw => `<span class="token-badge token-keyword">${Utils.escHtml(kw)}</span>`).join("")}
        </div>
        ${!hasErrorCodes && !hasProducts ? `<p style="font-size:12px;color:var(--text-tertiary);margin-top:8px">No specific error codes or IBM products detected. Showing general keyword similarity.</p>` : ""}
      </div>

      ${kbMatches.length > 0 ? `
        <div class="tile" style="border-top:3px solid var(--green);margin-bottom:12px">
          <div class="section-title">📚 Knowledge Base Matches</div>
          ${kbMatches.map(m => `
            <div class="similar-case-row" style="border-left:3px solid var(--green)">
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px">${Utils.escHtml(m.entry.title || '')}</div>
                <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px">${Utils.escHtml(m.entry.product||"—")} · 📅 ${Utils.escHtml(m.entry.dateDiscussed||"—")}</div>
                ${m.entry.rootCause ? `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px"><strong>Root Cause:</strong> ${Utils.escHtml(m.entry.rootCause.slice(0,120))}${m.entry.rootCause.length>120?"…":""}</div>` : ""}
                ${m.entry.resolution ? `<div style="font-size:12px;color:var(--green)"><strong>Resolution:</strong> ${Utils.escHtml(m.entry.resolution.slice(0,120))}${m.entry.resolution.length>120?"…":""}</div>` : ""}
              </div>
              <span class="similarity-score score-high">${Math.round(m.score*100)}%</span>
            </div>
          `).join("")}
        </div>
      ` : ""}

      ${withComments.length > 0 ? `
        <div class="tile" style="border-top:3px solid var(--purple);margin-bottom:12px">
          <div class="section-title">💬 Cases with Discussion Notes (${withComments.length})</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:10px">These matching cases have Weekly Tracker or Wednesday meeting comments — check them first</div>
          ${withComments.map(s => {
            const scoreClass = s.score > 0.4 ? "score-high" : s.score > 0.2 ? "score-med" : "score-low";
            const comment = s.case._wtComment || s.case._wednesdayComments || '';
            return `
              <div class="similar-case-row" style="border-left:3px solid var(--purple)">
                <span class="similarity-score ${scoreClass}">${Math.round(s.score*100)}%</span>
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">
                    <span style="cursor:pointer;color:var(--ibm-blue-50);font-size:11px;font-weight:600;font-family:var(--font-mono)" title="Click to copy">${Utils.escHtml(s.case["Case Number"]||"—")}</span>
                    ${Utils.statusBadge(s.case.Status)}
                    <span style="font-size:11px;color:var(--text-tertiary)">${Utils.escHtml((s.case.Product||"—").split(" ").slice(-2).join(" "))}</span>
                  </div>
                  <div style="font-size:12px;color:var(--text-secondary);font-weight:500">${Utils.escHtml(s.case.Title||"—")}</div>
                  <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px">Owner: ${Utils.escHtml(Utils.shortName(s.case.Owner||""))} · Created: ${Utils.fmtDateShort(s.case.Created)}</div>
                  <div style="margin-top:6px;padding:8px 10px;border-radius:var(--radius-sm);background:var(--bg-layer);font-size:11px;color:var(--text-secondary);line-height:1.5;border-left:2px solid var(--purple)">
                    💬 ${Utils.escHtml(comment.slice(0, 200))}${comment.length > 200 ? '…' : ''}
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : ""}

      <div class="tile" style="border-top:3px solid var(--yellow)">
        <div class="section-title">📋 Similar Cases (${similar.length})</div>
        ${similar.length === 0 ? `<p style="color:var(--text-tertiary);font-size:13px">No similar cases found in the archive.</p>` :
          similar.map(s => {
            const scoreClass = s.score > 0.4 ? "score-high" : s.score > 0.2 ? "score-med" : "score-low";
            return `
              <div class="similar-case-row">
                <span class="similarity-score ${scoreClass}">${Math.round(s.score*100)}%</span>
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">
                    <span class="case-number-copy" style="cursor:pointer;color:var(--ibm-blue-50);font-size:11px;font-weight:600;font-family:var(--font-mono)" data-cn="${Utils.escHtml(s.case["Case Number"]||"")}" title="Click to copy">${Utils.escHtml(s.case["Case Number"]||"—")}</span>
                    ${Utils.statusBadge(s.case.Status)}
                    <span style="font-size:11px;color:var(--text-tertiary)">${Utils.escHtml((s.case.Product||"—").split(" ").slice(-2).join(" "))}</span>
                  </div>
                  <div style="font-size:12px;color:var(--text-secondary);font-weight:500">${Utils.escHtml(s.case.Title||"—")}</div>
                  <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px">Owner: ${Utils.escHtml(Utils.shortName(s.case.Owner||""))} · Created: ${Utils.fmtDateShort(s.case.Created)}</div>
                </div>
              </div>
            `;
          }).join("")
        }
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════════════
     ARCHIVE SEARCH TAB
     Live search across the permanent case archive by case #, title,
     owner, product, or status.
     ══════════════════════════════════════════════════════════════════ */
  function renderArchiveSearchHTML() {
    const allCases = _getEnrichedArchive();
    const q = _archiveSearch.trim().toLowerCase();

    const filtered = q
      ? allCases.filter(c =>
          (c["Case Number"] || "").toLowerCase().includes(q) ||
          (c.Title         || "").toLowerCase().includes(q) ||
          (c.Owner         || "").toLowerCase().includes(q) ||
          (c.Product       || "").toLowerCase().includes(q) ||
          (c.Status        || "").toLowerCase().includes(q)
        )
      : allCases;

    // Sort: open cases first, then by _lastSeen descending
    const sorted = [...filtered].sort((a, b) => {
      const aOpen = !Utils.isClosed(a.Status) ? 0 : 1;
      const bOpen = !Utils.isClosed(b.Status) ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return (b._lastSeen || "").localeCompare(a._lastSeen || "");
    });

    const MAX_ROWS = 200;
    const shown    = sorted.slice(0, MAX_ROWS);

    const _hl = (text, query) => {
      if (!query || !text) return Utils.escHtml(text);
      const idx = text.toLowerCase().indexOf(query);
      if (idx === -1) return Utils.escHtml(text);
      return Utils.escHtml(text.slice(0, idx)) +
        `<mark style="background:rgba(255,200,0,.35);color:inherit;border-radius:2px;padding:0 1px">${Utils.escHtml(text.slice(idx, idx + query.length))}</mark>` +
        Utils.escHtml(text.slice(idx + query.length));
    };

    const rowsHTML = shown.length === 0
      ? `<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--text-disabled);font-size:13px">
           ${q ? `No archived cases match <strong>"${Utils.escHtml(_archiveSearch)}"</strong>` : "Archive is empty — import an Excel file to populate it"}
         </td></tr>`
      : shown.map(c => {
          const isClosed = Utils.isClosed(c.Status);
          const hasComment = !!(c._wtComment || c._wednesdayComments);
          return `<tr style="border-bottom:1px solid var(--border-subtle);transition:background var(--t-fast)"
            onmouseover="this.style.background='var(--bg-layer)'" onmouseout="this.style.background=''">
            <td style="padding:8px 12px;white-space:nowrap">
              <span class="case-number-copy" data-cn="${Utils.escHtml(c["Case Number"] || "")}"
                style="font-family:var(--font-mono);font-size:11px;font-weight:600;color:var(--ibm-blue-50);cursor:pointer"
                title="Click to copy case number">${_hl(c["Case Number"] || "—", q)}</span>
            </td>
            <td style="padding:8px 12px;max-width:260px">
              <div style="font-size:12px;color:var(--text-primary);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                title="${Utils.escHtml(c.Title || "")}">${_hl(c.Title || "—", q)}</div>
            </td>
            <td style="padding:8px 12px;white-space:nowrap;font-size:11px;color:var(--text-secondary)">
              ${_hl(Utils.shortName(c.Owner || ""), q)}
            </td>
            <td style="padding:8px 12px;max-width:160px">
              <span style="font-size:11px;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block"
                title="${Utils.escHtml(c.Product || "")}">${_hl((c.Product || "—").split(" ").slice(-2).join(" "), q)}</span>
            </td>
            <td style="padding:8px 12px;white-space:nowrap">${Utils.statusBadge(c.Status)}</td>
            <td style="padding:8px 12px;text-align:center">
              ${hasComment
                ? `<span title="Has discussion notes" style="font-size:14px;line-height:1;cursor:default">💬</span>`
                : `<span style="color:var(--border-mid);font-size:11px">—</span>`}
            </td>
          </tr>`;
        }).join("");

    return `
      <div class="mb-16" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--text-primary)">📦 Archive Search</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">
            Search across <strong>${allCases.length}</strong> permanently archived cases by case #, title, owner, product, or status
          </div>
        </div>
        <span style="font-size:11px;color:var(--text-tertiary);padding-top:4px">
          ${filtered.length} result${filtered.length !== 1 ? "s" : ""}${filtered.length > MAX_ROWS ? ` (showing first ${MAX_ROWS})` : ""}
        </span>
      </div>

      <!-- Search bar -->
      <div class="search-wrapper" style="max-width:480px;margin-bottom:16px">
        <span class="search-icon" style="pointer-events:none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </span>
        <input id="inv-archive-search"
          class="search-input"
          placeholder="Search case #, title, owner, product, status…"
          value="${Utils.escHtml(_archiveSearch)}"
          autocomplete="off"
          spellcheck="false">
      </div>

      <!-- Results table -->
      <div class="tile" style="padding:0;overflow:hidden">
        <div style="overflow-x:auto">
          <table style="border-collapse:collapse;width:100%;font-size:12px;min-width:560px">
            <thead>
              <tr style="background:var(--bg-layer);border-bottom:2px solid var(--border-subtle)">
                <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);white-space:nowrap">Case #</th>
                <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Title</th>
                <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);white-space:nowrap">Owner</th>
                <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Product</th>
                <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Status</th>
                <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:600;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)" title="Has discussion notes">Notes</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
        ${filtered.length > MAX_ROWS ? `<div style="padding:10px 16px;background:var(--bg-layer);border-top:1px solid var(--border-subtle);font-size:11px;color:var(--text-tertiary);text-align:center">
          Showing ${MAX_ROWS} of ${filtered.length} matches — refine your search to narrow results
        </div>` : ""}
      </div>`;
  }

  function bindArchiveSearchEvents() {
    const input = document.getElementById("inv-archive-search");
    if (!input) return;

    // Focus the search bar automatically when tab is activated
    setTimeout(() => input.focus(), 60);

    input.addEventListener("input", function() {
      _archiveSearch = this.value;
      // Re-render only the results area for performance (avoid full tab re-render)
      const section = document.getElementById("inv-section-archive-search");
      if (section) section.innerHTML = renderArchiveSearchHTML();
      bindArchiveSearchEvents(); // re-bind after innerHTML replace
    });

    // Case number copy — reuse existing pattern
    document.querySelectorAll(".case-number-copy").forEach(el => {
      el.addEventListener("click", () => {
        const cn = el.dataset.cn;
        if (!cn) return;
        navigator.clipboard?.writeText(cn).then(() => {
          if (typeof V6 !== "undefined" && V6.toast) V6.toast("Copied", cn, "success", 2000);
        });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     SUPPORT INTELLIGENCE TAB
     ══════════════════════════════════════════════════════════════════ */
  function renderIntelligenceHTML() {
    // Use enriched archive for intelligence (permanent data)
    const allCases  = _getEnrichedArchive();
    const teamNames = _getTeamNames();
    const teamCases = teamNames.size > 0
      ? allCases.filter(c => teamNames.has(c.Owner))
      : allCases;
    const open      = teamCases.filter(c => !Utils.isClosed(c.Status));
    const clusters  = Similarity.detectClusters(allCases);
    const errorCodes = Similarity.topErrorCodes(allCases, 15);
    const patterns  = Similarity.recurringPatterns(allCases, 12);
    const prediction = Similarity.predictNextWeek(allCases);

    const prodStatusMap = {};
    allCases.forEach(c => {
      const prod = (c.Product||"Unknown").split(" ").slice(-2).join(" ");
      if (!prodStatusMap[prod]) prodStatusMap[prod] = { open:0, closed:0, total:0 };
      prodStatusMap[prod].total++;
      if (Utils.isClosed(c.Status)) prodStatusMap[prod].closed++;
      else prodStatusMap[prod].open++;
    });
    const heatmapData = Object.entries(prodStatusMap).sort((a,b) => b[1].total - a[1].total).slice(0, 12);
    const maxCount = Math.max(...heatmapData.map(([,v]) => v.total), 1);

    // Count how many cases have WT comments
    const commentedCount = allCases.filter(c => c._wtComment || c._wednesdayComments).length;

    return `
      <div class="mb-16">
        <div style="font-size:18px;font-weight:700;color:var(--text-primary)">🧠 Support Intelligence Engine</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">Auto-generated insights from ${allCases.length} archived cases · ${commentedCount} with discussion notes · Known issue detection · Trend analysis</div>
      </div>

      <div class="kpi-row" style="margin-bottom:20px">
        ${kpi("Archived Cases", allCases.length, "kpi-blue")}
        ${kpi("Known Issue Clusters", clusters.length, "kpi-red")}
        ${kpi("Top Error Codes", errorCodes.length, "kpi-purple")}
        ${kpi("Recurring Patterns", patterns.length, "kpi-yellow")}
        ${kpi("Cases w/ Comments", commentedCount, "kpi-teal")}
        ${kpi("Predicted Next Week", prediction ? prediction.predicted : "N/A", prediction?.trend === "up" ? "kpi-red" : prediction?.trend === "down" ? "kpi-green" : "kpi-blue")}
      </div>

      <div class="grid-2">
        <div class="tile">
          <div class="section-title">🔶 Potential Known Issues</div>
          ${clusters.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-disabled)"><div class="kpi-icon">✅</div><div style="font-size:13px">No clustering patterns detected.</div></div>` :
            clusters.slice(0,6).map(cl => `
              <div class="known-issue-card">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                  <span class="known-issue-badge">🔶 ${cl.count} similar cases</span>
                  <span style="font-size:11px;color:var(--text-tertiary)">${Utils.escHtml(cl.product?.split(" ").slice(-2).join(" ")||"Unknown")}</span>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);font-style:italic;margin-bottom:6px">"${Utils.escHtml(cl.sampleTitle?.slice(0,80)||"—")}"</div>
                ${cl.commonTokens.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${cl.commonTokens.map(t=>`<span class="token-badge token-keyword" style="font-size:9px">${Utils.escHtml(t)}</span>`).join("")}</div>` : ""}
              </div>
            `).join("")}
          ${clusters.length > 6 ? `<p style="font-size:12px;color:var(--text-tertiary);text-align:center">+${clusters.length-6} more clusters</p>` : ""}
        </div>
        <div class="tile">
          <div class="section-title">🔴 Top Error Codes</div>
          ${errorCodes.length === 0 ? `<p style="color:var(--text-tertiary);font-size:12px">No specific error codes detected.</p>` :
            errorCodes.map(({ code, count }) => `
              <div class="pattern-row">
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--red);font-weight:600">${Utils.escHtml(code)}</span>
                <div class="row-8">
                  <div style="height:6px;border-radius:var(--radius-xs);background:var(--red);opacity:0.7;width:${Math.round(count/errorCodes[0].count*80)}px"></div>
                  <span class="pattern-count">${count}</span>
                </div>
              </div>
            `).join("")}
        </div>
      </div>

      <div class="grid-2" style="margin-top:16px">
        <div class="tile">
          <div class="section-title">🔁 Recurring Issue Keywords</div>
          ${patterns.length === 0 ? `<p style="color:var(--text-tertiary);font-size:12px">Not enough data.</p>` :
            patterns.map(({ word, count }) => `
              <div class="pattern-row">
                <span style="font-size:12px;color:var(--text-secondary);font-family:var(--font-mono)">${Utils.escHtml(word)}</span>
                <div class="row-8">
                  <div style="height:6px;border-radius:var(--radius-xs);background:var(--purple);opacity:0.7;width:${Math.round(count/patterns[0].count*80)}px"></div>
                  <span class="pattern-count">${count}</span>
                </div>
              </div>
            `).join("")}
        </div>
        <div class="tile">
          <div class="section-title">📈 Case Volume Prediction</div>
          ${prediction ? `
            <div style="text-align:center;padding:20px">
              <div style="font-size:48px;font-weight:700;font-family:var(--font-mono);color:${prediction.trend==="up"?"var(--red)":prediction.trend==="down"?"var(--green)":"var(--ibm-blue-50)"}">
                ${prediction.predicted}
              </div>
              <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px">Predicted cases next week</div>
              <div style="margin-top:8px;font-size:12px;color:var(--text-tertiary)">Last week: ${prediction.lastWeek} cases</div>
            </div>
          ` : `<p style="color:var(--text-tertiary);font-size:12px">Not enough weekly data (need 3+ weeks).</p>`}
          <div class="tile" style="margin-top:16px;background:var(--bg-layer);border:none;padding:14px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--text-tertiary);margin-bottom:10px">Quick Stats</div>
            ${[
              ["Total Archived", allCases.length],
              ["Team Active", open.length],
              ["With Comments", commentedCount],
              ["Products Tracked", Object.keys(prodStatusMap).length],
            ].map(([label, val]) => `
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-subtle)">
                <span style="font-size:12px;color:var(--text-secondary)">${label}</span>
                <span style="font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--ibm-blue-50)">${val}</span>
              </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="tile" style="margin-top:16px">
        <div class="section-title">🗺 Product Incident Heatmap</div>
        <div style="overflow-x:auto">
          <table style="border-collapse:collapse;width:100%;font-size:12px">
            <thead><tr style="background:var(--bg-layer)">
              <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Product</th>
              <th style="padding:8px 12px;text-align:right;font-size:10px;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Total</th>
              <th style="padding:8px 12px;text-align:right;font-size:10px;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--yellow-text)">Open</th>
              <th style="padding:8px 12px;text-align:right;font-size:10px;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--green)">Closed</th>
              <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:none;letter-spacing:var(--tracking-wide);color:var(--text-tertiary)">Volume</th>
            </tr></thead>
            <tbody>
              ${heatmapData.map(([prod, v]) => {
                const pct = Math.round(v.total / maxCount * 100);
                const heat = pct > 75 ? "var(--red)" : pct > 50 ? "var(--yellow-text)" : pct > 25 ? "var(--ibm-blue-50)" : "var(--green)";
                return `<tr style="border-bottom:1px solid var(--border-subtle)">
                  <td style="padding:8px 12px;font-size:11px;color:var(--text-secondary)">${Utils.escHtml(prod)}</td>
                  <td style="padding:8px 12px;text-align:right;font-family:var(--font-mono);font-weight:700;color:${heat}">${v.total}</td>
                  <td style="padding:8px 12px;text-align:right;font-family:var(--font-mono);color:var(--yellow-text)">${v.open}</td>
                  <td style="padding:8px 12px;text-align:right;font-family:var(--font-mono);color:var(--green)">${v.closed}</td>
                  <td style="padding:8px 12px"><div style="height:10px;border-radius:var(--radius-sm);background:${heat};opacity:0.75;width:${pct}%;min-width:4px;max-width:200px"></div></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="tile" style="margin-top:16px">
        <div class="section-title">📊 Case Trends</div>
        <div class="chart-canvas-wrap" style="height:260px"><canvas id="chart-intel-trend"></canvas></div>
      </div>
    `;
  }

  function renderIntelligenceCharts() {
    try {
      const allCases = _getEnrichedArchive();
      const trend = Utils.monthlyTrend(allCases);
      Charts.trendLine("chart-intel-trend", trend);
    } catch(e) { console.warn("Intel trend chart:", e); }
  }

  function kpi(label, value, cls="") {
    return `<div class="kpi-card ${cls}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>`;
  }

  /** Helper: get team member names for filtering */
  function _getTeamNames() {
    try {
      if (typeof Data !== 'undefined' && Data.teamCases) {
        const owners = new Set();
        Data.teamCases().forEach(c => { if (c.Owner) owners.add(c.Owner); });
        return owners;
      }
    } catch (_) {}
    return new Set();
  }

  /* ══════════════════════════════════════════════════════════════════
     PUBLIC API
     ══════════════════════════════════════════════════════════════════ */
  return {
    render,
    archiveCases,   // Called from app.js on every Excel load
    archiveCount,
    clearArchive,
  };
})();

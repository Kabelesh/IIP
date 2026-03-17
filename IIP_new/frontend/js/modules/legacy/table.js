/* ============================================================
   table.js — Reusable table with search, sort, pagination
   ============================================================ */
const Table = (() => {
  const PAGE_SIZE = 50;

  function render(container, cases, opts = {}) {
    if (!container) return;

    const {
      columns, extraCols = [],
      onRemind, onReassign,
      showRemind   = false,
      showReassign = false,
      showActions  = true,
      extraActions,
      tableId,
      defaultSortKey = null,
      defaultSortDir = 1
    } = opts;

    const cols = columns || [...defaultColumns(), ...extraCols];
    let page    = 1;
    let sortKey = defaultSortKey;
    let sortDir = defaultSortDir;
    let data    = [...cases];
    let search  = "";

    function filteredData() {
      if (!search.trim()) return data;
      const q = search.toLowerCase();
      return data.filter(r =>
        (r["Case Number"]||"").toLowerCase().includes(q) ||
        (r.Title||"").toLowerCase().includes(q) ||
        (r.Owner||"").toLowerCase().includes(q) ||
        (typeof Data !== "undefined" && Data.displayName ? (Data.displayName(r.Owner)||"") : "").toLowerCase().includes(q) ||
        (r.Product||"").toLowerCase().includes(q)
      );
    }

    function sortedData() {
      const fd = filteredData();
      if (!sortKey) return fd;
      const col = cols.find(c => c.key === sortKey);
      return [...fd].sort((a, b) => {
        const av = col?.sortValue ? col.sortValue(a) : (a[sortKey]||"");
        const bv = col?.sortValue ? col.sortValue(b) : (b[sortKey]||"");
        if (typeof av === "number") return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });
    }

    function draw() {
      const sorted = sortedData();
      const total  = sorted.length;
      const pages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (page > pages) page = pages;
      const slice  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      const hasActions = showActions && (showRemind || showReassign || extraActions);
      const uid = tableId || ("tbl_" + Math.random().toString(36).slice(2,7));

      const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
      const to   = Math.min(page * PAGE_SIZE, total);

      // Top bar: record count LEFT, search RIGHT
      let html = `
        <div class="table-topbar">
          <span class="table-record-count">Showing ${from}–${to} of <strong>${total}</strong> cases</span>
          <div class="row-8">
            
            <input type="text" placeholder="Search case #, title, owner…"
              id="tbl-search-${uid}" value="${Utils.escHtml(search)}"
              class="form-input form-input-sm" style="width:260px"/>
            <button class="export-btn" id="tbl-export-${uid}">⬇ Export</button>
          </div>
        </div>
        <div class="data-table-wrap">
          <div class="table-scroll">
            <table class="data-table" id="tbl-table-${uid}" role="grid" aria-label="Cases table">
              <thead><tr>`;

      cols.forEach(col => {
        const isCur  = sortKey === col.key;
        const arrow  = isCur ? (sortDir === 1 ? " ↑" : " ↓") : "";
        const sortAttr = col.sortable !== false ? `data-sort="${col.key}"` : "";
        const cls = (col.sortable !== false ? "sort-th " : "") + (isCur ? "sort-active" : "");
        html += `<th scope="col" class="${cls}" ${sortAttr}>${col.label}${isCur ? `<span class="sort-arrow" aria-hidden="true">${arrow}</span>` : ""}</th>`;
      });
      if (hasActions) html += `<th scope="col" class="w-100">Actions</th>`;
      html += `</tr></thead><tbody>`;

      if (!slice.length) {
        const isFiltered = search.trim().length > 0;
        html += `<tr><td colspan="${cols.length + (hasActions ? 1 : 0)}" class="table-empty" style="padding:32px 16px;text-align:center">
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <div style="font-size:14px;font-weight:600;color:var(--text-secondary)">${isFiltered ? "No cases match your search" : "No cases found"}</div>
            <div class="fs-12 c-tertiary">${isFiltered ? `No results for "${Utils.escHtml(search)}" — try a different keyword` : "Upload a case export file to get started"}</div>
            ${isFiltered ? `<button onclick="document.getElementById('tbl-search-${uid}').value='';document.getElementById('tbl-search-${uid}').dispatchEvent(new Event('input',{bubbles:true}))" style="margin-top:4px;padding:4px 12px;font-size:12px;background:var(--ibm-blue-10);color:var(--ibm-blue-60);border:1px solid var(--ibm-blue-20);border-radius:var(--radius-xs);cursor:pointer;font-family:var(--font-sans)">Clear filters</button>` : ""}
          </div>
        </td></tr>`;
      } else {
        slice.forEach((row, idx) => {
          const staleDays = Utils.daysDiff(Utils.parseDate(row.Updated));
          // F27: Severity left-border triage indicator
          const sev = String(row.Severity || "").trim();
          let sevStyle = "";
          if (sev.startsWith("1"))      sevStyle = "border-left:3px solid var(--red,#da1e28)";
          else if (sev.startsWith("2")) sevStyle = "border-left:3px solid var(--orange,#ff832b)";
          else if (sev.startsWith("3")) sevStyle = "border-left:3px solid var(--yellow,#f1c21b)";
          html += `<tr class="${staleDays >= 5 ? "stale-row" : ""}" style="${sevStyle}">`;
          cols.forEach(col => {
            const val = col.render ? col.render(row, idx) : Utils.escHtml(row[col.key] || "—");
            html += `<td class="${col.class || ""}">${val}</td>`;
          });
          if (hasActions) {
            html += `<td><div class="col-actions">`;
            if (showRemind && onRemind)
              html += `<button class="action-btn-remind" data-case="${Utils.escHtml(row["Case Number"])}">✉ Remind</button>`;
            if (showReassign && onReassign)
              html += `<button class="action-btn-reassign" data-case="${Utils.escHtml(row["Case Number"])}">↻ Reassign</button>`;
            if (extraActions) html += extraActions(row);
            html += `</div></td>`;
          }
          html += `</tr>`;
        });
      }

      html += `</tbody></table></div></div>`;
      html += renderPagination(total, page, pages);
      container.innerHTML = html;

      // F69: Overflow scroll shadow indicator
      const wrap = container.querySelector(".data-table-wrap");
      const scroll = container.querySelector(".table-scroll");
      if (wrap && scroll) {
        const checkOverflow = () => {
          const hasOvf = scroll.scrollWidth > scroll.clientWidth;
          wrap.classList.toggle("has-overflow", hasOvf);
        };
        checkOverflow();
        scroll.addEventListener("scroll", () => {
          const atEnd = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
          wrap.classList.toggle("has-overflow", !atEnd);
        });
        window.addEventListener("resize", checkOverflow);
      }

      // Sort
      container.querySelectorAll(".sort-th[data-sort]").forEach(th => {
        th.addEventListener("click", () => {
          const key = th.dataset.sort;
          if (sortKey === key) sortDir *= -1; else { sortKey = key; sortDir = 1; }
          page = 1; draw();
        });
      });

      // Search (debounced 150ms for performance on large tables)
      const si = container.querySelector(`#tbl-search-${uid}`);
      if (si) {
        let _dbt = null;
        si.addEventListener("input", e => {
          clearTimeout(_dbt);
          const val = e.target.value;
          _dbt = setTimeout(() => {
            search = val; page = 1; draw();
            // F26: Flash the record count to signal filter applied
            const rc = container.querySelector(".table-record-count");
            if (rc) { rc.style.transition="opacity .15s"; rc.style.opacity="0"; setTimeout(()=>rc.style.opacity="1",160); }
          }, 150);
        });
        if (document.activeElement === si) { const l = si.value.length; si.setSelectionRange(l, l); }
      }

      // Export
      container.querySelector(`#tbl-export-${uid}`)?.addEventListener("click", () => {
        exportToExcel(sortedData(), cols, "cases");
      });

      // Pagination
      container.querySelectorAll(".page-btn[data-page]").forEach(btn =>
        btn.addEventListener("click", () => { page = parseInt(btn.dataset.page); draw(); }));
      container.querySelector(".page-prev")?.addEventListener("click", () => { if (page > 1) { page--; draw(); } });
      container.querySelector(".page-next")?.addEventListener("click", () => { if (page < pages) { page++; draw(); } });

      // Action buttons
      container.querySelectorAll(".action-btn-remind[data-case]").forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          const caseNum = btn.dataset.case;
          const row = data.find(r => r["Case Number"] === caseNum);
          if (!row || !onRemind) return;
          // F25: Rate-limiting — disable for 24h after sending
          const key = `ibm_remind_${caseNum}`;
          let lastSent = 0;
          try { lastSent = parseInt(sessionStorage.getItem(key)||"0"); } catch(e){}
          const hours24 = 24 * 60 * 60 * 1000;
          if (Date.now() - lastSent < hours24) {
            const minsLeft = Math.ceil((hours24 - (Date.now() - lastSent)) / 60000);
            alert(`A reminder was already sent for ${caseNum} recently. Please wait ${minsLeft > 60 ? Math.ceil(minsLeft/60)+'h' : minsLeft+'m'} before sending another.`);
            return;
          }
          // F25: Confirmation dialog before sending
          if (!confirm(`Send a reminder email for case ${caseNum}?\n\nOwner: ${row.Owner || 'Unknown'}\nTitle: ${(row.Title||'').slice(0,80)}`)) return;
          try { sessionStorage.setItem(key, String(Date.now())); } catch(e){}
          // Disable button for visual feedback
          btn.disabled = true;
          btn.textContent = "✓ Sent";
          btn.style.opacity = "0.5";
          // Log the action
          try { if (typeof Data !== "undefined") Data.pushChange({ id: Date.now(), caseNumber: caseNum, field: "Reminder Sent", oldValue: "", newValue: "Reminder sent", updatedBy: "Admin", timestamp: new Date().toLocaleString() }); } catch(ex){}
          onRemind(row);
        });
      });
      container.querySelectorAll(".action-btn-reassign[data-case]").forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          const row = Data.allCases().find(r => r["Case Number"] === btn.dataset.case);
          if (row && onReassign) onReassign(row);
        });
      });
    }

    draw();
    return {
      refresh: newCases => { data = [...newCases]; page = 1; draw(); },
      getSearch: () => search,
      // F24: Stable method to programmatically set search value
      setSearch: val => {
        search = val; page = 1;
        const si = container.querySelector(`#tbl-search-${uid}`);
        if (si) si.value = val;
        draw();
      }
    };
  }

  /* ── Pagination ── */
  function renderPagination(total, page, pages) {
    if (pages <= 1) return "";
    const from  = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to    = Math.min(page * PAGE_SIZE, total);
    const start = Math.max(1, page - 2);
    const end   = Math.min(pages, page + 2);
    let btns    = "";
    for (let p = start; p <= end; p++)
      btns += `<button class="page-btn ${p === page ? "active" : ""}" data-page="${p}">${p}</button>`;
    return `<div class="table-pagination">
      <span>Showing ${from}–${to} of ${total}</span>
      <div class="page-btns">
        <button class="page-btn page-prev" ${page===1?"disabled":""}>‹ Prev</button>
        ${btns}
        <button class="page-btn page-next" ${page===pages?"disabled":""}>Next ›</button>
      </div>
    </div>`;
  }

  /* ── Export ── */
  function exportToExcel(rows, cols, suffix) {
    const headers = cols.map(c => c.label).join(",");
    const dataRows = rows.map(row =>
      cols.map(col => {
        let val = col.key ? (row[col.key] || "") : "";
        val = String(val).replace(/<[^>]*>/g, "").replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    );
    const csv  = [headers, ...dataRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `cases_${suffix}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  /* ── Default columns ── */
  function defaultColumns() {
    return [
      { key:"Case Number", label:"Case Number", class:"col-case-num",
        render: row => {
          const perfIcon = (typeof Data !== "undefined" && Data.isMarkedPerformance && Data.isMarkedPerformance(row["Case Number"]))
            ? `<span title="Performance Case" style="color:var(--red);margin-right:4px;display:inline-flex;align-items:center;vertical-align:middle"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>`
            : "";
          return `${perfIcon}<span class="text-mono" class="c-blue">${Utils.escHtml(row["Case Number"])}</span>`;
        } },
      { key:"Owner", label:"Owner", class:"col-owner",
        render: row => {
          const displayOwner = Utils.escHtml(Utils.shortName(row.Owner));
          if (row._ownerOverride) {
            const origOwner = row._originalOwner
              ? Utils.escHtml(Utils.shortName(row._originalOwner))
              : "";
            const ts = row._overrideTs
              ? new Date(row._overrideTs).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
              : "";
            const tooltip = origOwner
              ? `Reassigned from ${origOwner}${ts ? " on " + ts : ""}`
              : "Reassigned via Admin Portal";
            return `<div style="display:flex;flex-direction:column;gap:2px;align-items:flex-start">
                <span>${displayOwner}</span>
                <span title="${tooltip}" style="display:inline-flex;align-items:center;gap:3px;background:rgba(224,112,0,.12);color:var(--orange,#ff832b);font-size:10px;font-weight:700;padding:1px 6px;border-radius:var(--radius-xs,3px);border:1px solid rgba(224,112,0,.25);white-space:nowrap;cursor:default;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                  Reassigned
                </span>
                ${origOwner ? `<span style="font-size:10px;color:var(--text-tertiary);font-style:italic">was: ${origOwner}</span>` : ""}
              </div>`;
          }
          return displayOwner;
        }},
      { key:"Status", label:"Status",
        render: row => Utils.statusBadge(row.Status) },
      { key:"Product", label:"Product", class:"col-product",
        render: row => `<span title="${Utils.escHtml(row.Product)}">${Utils.escHtml(row.Product)}</span>` },
      { key:"Customer number", label:"Customer #", class:"col-date text-mono",
        render: row => Utils.escHtml(row["Customer number"] || "—") },
      { key:"Created", label:"Created", class:"col-date",
        render: row => Utils.fmtDateShort(row.Created) },
      { key:"Updated", label:"Updated", class:"col-stale",
        render: row => {
          const d    = Utils.parseDate(row.Updated);
          const days = Utils.daysDiff(d);
          return `<span style="color:${days>=5?"var(--red)":"var(--text-tertiary)"}">${Utils.fmtDateShort(row.Updated)}</span>`
               + (days >= 5 ? ` <span class="stale-days">(+${days}d)</span>` : "");
        }},
      { key:"Severity", label:"Severity", class:"col-sev",
        render: row => {
          const s = String(row.Severity||"").trim();
          const col = s.startsWith("1") ? "var(--red)" : s.startsWith("2") ? "var(--orange)" : s.startsWith("3") ? "var(--yellow)" : "var(--text-tertiary)";
          return `<span style="font-weight:700;color:${col};font-family:var(--font-mono)">${Utils.escHtml(s||"—")}</span>`;
        }},
      // F28: Age column with explicit "days" unit label
      { key:"Age", label:"Age (days)", class:"col-age text-mono",
        render: row => {
          const a = parseInt(row.Age||"0", 10);
          return `<span style="font-family:var(--font-mono);color:${a>30?"var(--red)":a>14?"var(--orange)":"var(--text-tertiary)"}">${a > 0 ? a + "d" : "—"}</span>`;
        }},
      { key:"Title", label:"Title", class:"col-title", sortable:false,
        render: row => `<span title="${Utils.escHtml(row.Title)}">${Utils.escHtml(row.Title)}</span>` }
    ];
  }

  return { render, defaultColumns, exportToExcel };
})();
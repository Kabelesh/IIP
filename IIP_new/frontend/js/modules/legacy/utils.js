/* ============================================================
   js/modules/utils.js
   Date helpers, string helpers, CSV parser.
   ============================================================ */

const Utils = (() => {

  /* ── Date ──────────────────────────────────────────────── */
  /** Always returns the current date (avoids stale reference after midnight) */
  function today() { return new Date(); }

  function parseDate(s) {
    if (!s || !s.trim()) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  function daysDiff(date, ref) {
    if (!date) return 999;
    const refDate = ref || today();
    return Math.floor((refDate - date) / 86400000);
  }

  function isClosed(status) {
    return (status || "").includes("Closed");
  }

  function fmtDate(s) {
    const d = parseDate(s);
    if (!d) return "—";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function fmtDateShort(s) {
    const d = parseDate(s);
    if (!d) return "—";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  /* ── Name ──────────────────────────────────────────────── */
  function shortName(name) {
    if (!name) return "";
    // Apply display name aliases from DynamicConfig or Data module
    if (typeof Data !== "undefined" && Data.displayName) {
      const alias = Data.displayName(name);
      if (alias && alias !== name) return alias;
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) return name;
    return parts[0] + " " + parts[parts.length - 1];
  }

  /* ── Status → badge class ──────────────────────────────── */
  const STATUS_BADGE = {
    "Awaiting your feedback": "status-badge status-awaiting",
    "IBM is working":         "status-badge status-ibm-work",
    "Waiting for IBM":        "status-badge status-wait-ibm",
    "Closed by IBM":          "status-badge status-closed-i",
    "Closed by Client":       "status-badge status-closed-c",
    "Closed - Archived":      "status-badge status-archived"
  };

  function statusBadge(status) {
    const cls = STATUS_BADGE[status] || "status-badge status-unknown";
    return `<span class="${cls}">${status || "—"}</span>`;
  }

  /* ── CSV Parser ─────────────────────────────────────────── */
  function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const vals = splitCSVLine(line);
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = (vals[idx] || "").trim().replace(/^"|"$/g, "");
      });
      rows.push(row);
    }
    return rows;
  }

  function splitCSVLine(line) {
    const result = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === ',' && !inQ) {
        result.push(cur); cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }

  /* ── Aggregation helpers ────────────────────────────────── */
  function countBy(arr, keyFn) {
    const counts = {};
    arr.forEach(item => {
      const k = keyFn(item);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }

  function ownerCounts(cases) {
    const counts = countBy(cases, r => r.Owner || "Unknown");
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([fullName, count]) => ({ name: shortName(fullName), fullName, count }));
  }

  function monthlyTrend(allCases) {
    const months = {};
    allCases.forEach(r => {
      const dc = parseDate(r.Created);
      if (dc) {
        const k = `${dc.getFullYear()}-${String(dc.getMonth()+1).padStart(2,"0")}`;
        if (!months[k]) months[k] = { created: 0, closed: 0 };
        months[k].created++;
      }
      const dl = parseDate(r["Closed Date"]);
      if (dl) {
        const k = `${dl.getFullYear()}-${String(dl.getMonth()+1).padStart(2,"0")}`;
        if (!months[k]) months[k] = { created: 0, closed: 0 };
        months[k].closed++;
      }
    });
    return Object.entries(months)
      .sort(([a],[b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, v]) => ({
        label: month.slice(5) + "/" + month.slice(2,4),
        ...v
      }));
  }

  function escHtml(s) {
    return String(s || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;");
  }

  return {
    TODAY: today(),  // backward compat (snapshot); prefer today() for live date
    today, parseDate, daysDiff, isClosed,
    fmtDate, fmtDateShort, shortName,
    statusBadge, parseCSV,
    countBy, ownerCounts, monthlyTrend,
    escHtml
  };
})();

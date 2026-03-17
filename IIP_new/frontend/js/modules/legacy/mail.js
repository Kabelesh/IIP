/* ============================================================
   mail.js — Opens Outlook mailto: directly, no popup
   ============================================================ */
const Mail = (() => {

  /* Team Cases reminder — subject + format as specified */
  function openReminderPreview(cases, sender, opts = {}) {
    if (!cases || !cases.length) { alert("No cases selected."); return; }

    const to = [...new Set(
      cases.map(c => Data.teamEmails()[c.Owner] || Data.teamEmails()[Utils.shortName(c.Owner)] || "")
            .filter(Boolean)
    )].join(";");

    const subject = opts.subject ||
      "Action Required: Update IBM Support Cases - Awaiting for your feedback";

    const body = opts.buildBody
      ? opts.buildBody(cases, sender || "Kabelesh K")
      : buildTeamReminderBody(cases, sender || "Kabelesh K");

    _send(to, subject, body);
  }

  /* Defect reminder — different subject + columns */
  function openDefectReminder(cases, sender) {
    if (!cases || !cases.length) { alert("No cases selected."); return; }

    const to = [...new Set(
      cases.map(c => Data.teamEmails()[c.Owner] || Data.teamEmails()[Utils.shortName(c.Owner)] || "")
            .filter(Boolean)
    )].join(";");

    const subject = "Action Required: Raise Defect / Task for the Listed Cases";
    const body    = buildDefectBody(cases, sender || "Kabelesh K");
    _send(to, subject, body);
  }

  function _send(to, subject, body) {
    const link = "mailto:" + encodeURIComponent(to)
      + "?subject=" + encodeURIComponent(subject)
      + "&body="    + encodeURIComponent(body);
    const a = document.createElement("a");
    a.href = link; a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 500);
  }

  /* ── Team cases body: Case# | Owner | Last Updated ── */
  function buildTeamReminderBody(cases, sender) {
    const LINE = "-".repeat(68);
    let b = "Hello Team,\n\n";
    b += "Kindly update the below IBM Support cases at the earliest.\n\n";
    b += LINE + "\n";
    b += padR("Case Number",    16) + padR("Owner", 26) + "Last Updated\n";
    b += LINE + "\n";
    cases.forEach(c => {
      const days = Utils.daysDiff(Utils.parseDate(c.Updated));
      b += padR(c["Case Number"] || "", 16)
        +  padR(Utils.shortName(c.Owner) || "", 26)
        +  days + " day(s)\n";
    });
    b += LINE + "\n\n";
    b += "Best regards,\n" + sender + "\nBD / TOA-ETS5\n";
    return b;
  }

  /* ── Defect body: Case# | Owner only ── */
  function buildDefectBody(cases, sender) {
    const LINE = "-".repeat(50);
    let b = "Hello Team,\n\n";
    b += "Please raise a Defect or Task for the below cases. If a defect/task has already been raised, ";
    b += "kindly share the defect/task number with me.\n\n";
    b += LINE + "\n";
    b += padR("Case Number", 20) + "Owner\n";
    b += LINE + "\n";
    cases.forEach(c => {
      b += padR(c["Case Number"] || "", 20) + Utils.shortName(c.Owner || "") + "\n";
    });
    b += LINE + "\n\n";
    b += "Best regards,\n" + sender + "\nBD / TOA-ETS5\n";
    return b;
  }

  function padR(str, len) {
    const s = String(str || "");
    return s.length >= len ? s.slice(0, len - 1) + " " : s + " ".repeat(len - s.length);
  }

  // Legacy alias
  function buildPlainText(cases, sender) { return buildTeamReminderBody(cases, sender); }
  function buildHTML(cases, sender)      { return buildTeamReminderBody(cases, sender); }

  /** Download an HTML reminder file for a single owner */
  function download(owner, ownerCases) {
    const email = Data.teamEmails()[owner] || "";
    const shortOwner = Utils.shortName(owner);
    const caseRows = ownerCases.map(c =>
      `<tr><td style="padding:6px 10px;border:1px solid var(--border-subtle);font-family:monospace;font-size:12px">${Utils.escHtml(c["Case Number"])}</td>` +
      `<td style="padding:6px 10px;border:1px solid var(--border-subtle);font-size:13px">${Utils.escHtml(c.Title)}</td>` +
      `<td style="padding:6px 10px;border:1px solid var(--border-subtle);font-family:monospace;font-size:12px">${Utils.fmtDateShort(c.Updated)}</td></tr>`
    ).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reminder — ${shortOwner}</title></head>
<body style="font-family:Arial,sans-serif;padding:20px;color:var(--text-primary)">
<p>Dear ${shortOwner},</p>
<p>Please update the following IBM support cases at the earliest:</p>
<table style="border-collapse:collapse;width:100%;margin:16px 0">
<thead><tr style="background:var(--bg-layer)">
<th style="padding:8px 10px;text-align:left;border:1px solid var(--border-subtle);font-size:11px;text-transform:uppercase">Case Number</th>
<th style="padding:8px 10px;text-align:left;border:1px solid var(--border-subtle);font-size:11px;text-transform:uppercase">Title</th>
<th style="padding:8px 10px;text-align:left;border:1px solid var(--border-subtle);font-size:11px;text-transform:uppercase">Updated</th>
</tr></thead><tbody>${caseRows}</tbody></table>
<p>Best regards,<br>BD / TOA-ETS5</p>
</body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `reminder_${shortOwner.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  return { openReminderPreview, openDefectReminder, download, buildPlainText, buildHTML };
})();

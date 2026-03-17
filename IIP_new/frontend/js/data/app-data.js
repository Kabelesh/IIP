/* ================================================================
   js/data/app-data.js  —  IBM Case Intelligence Platform
   ----------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for all static application data.

   ► HOW TO UPDATE DATA:
     Edit ONLY this file. Every dashboard, contact card, dropdown,
     and chart reads from here via the AppData object.

   ► SECTIONS:
     1. config          — App identity, URLs, timeouts
     2. teamMembers     — Full display names of all IBM team members
     3. teamEmails      — Email lookup map (name → email)
     4. expertiseConnect — IBM escalation contacts (ICN 881812 / Sev 1)
     5. bdEscalation    — Bosch BD-side escalation contacts
     6. teamLead        — IBM ETS5 team lead
     7. customerContacts — Customer-side contacts per ALM line
     8. almResponsible   — Line Responsible / CASE Responsible / Proxy
     9. ibmDirectory    — IBM Colleagues directory (IBM Contacts card)

   ► SECURITY NOTE:
     This file is intentionally kept as a plain JS script (not JSON)
     so it works over file://, local servers, and intranet without
     any CORS or fetch() issues. Sensitive email addresses are only
     used within the intranet app and never sent externally.
   ================================================================ */

const AppData = (() => {

  /* ────────────────────────────────────────────────────────────
     1. APPLICATION CONFIG
     Centralised constants — previously split across config.js
  ──────────────────────────────────────────────────────────── */
  const config = {
    teamName:      "BD/TOA-ETS5",
    appTitle:      "IBM Cases",
    appSubtitle:   "IBM Case Intelligence Platform",

    // Internal CLM server — work item deep-link base URL
    defectBaseUrl:
      "https://rb-ubk-clm-01.de.bosch.com:9443/ccm/web/projects/" +
      "CI%20NES%20Change%20Management" +
      "#action=com.ibm.team.workitem.viewWorkItem&id=",

    // Session / idle settings (milliseconds)
    idleTimeoutMs:  30 * 60 * 1000,   // 30 min — log out after this
    idleWarningMs:  27 * 60 * 1000,   // 27 min — warn before logout

    // UI
    tablePageSize: 50,

    // localStorage keys
    persistKeyTracker: "ibm_tracker_persist_v1",
    persistKeyKB:      "ibm_knowledge_base_v2",
    persistKeyCases:   "ibm_cases_raw_v1",
  };


  /* ────────────────────────────────────────────────────────────
     2. TEAM MEMBERS
     Full display names — used in owner dropdowns, case tables,
     and member cards.  Add / remove names here only.
  ──────────────────────────────────────────────────────────── */
  const teamMembers = [
    "Hareesh Gaddam",
    "Malliga Arjunan",
    "Srinivas K",
    "Imayavarman N J",
    "Kabelesh K",
    "Sangavi Devaraj",
    "Swetha T",
    "Sandeep Yashoda",
    "Harshitha Nalukurthi",
    "Mohan Raj Jaganathan",
    "Kesavan R",
    "Sabari M",
    "Mohan Kumar",
    "Nareshprathap Ramesh",
    "Sangeeta Rajole",
    "Danny Mueller",
    "Peter Kohlheim",
    "Sumsudeen Syed Mohamed",
    "Mohammed Ashik S",
    "Mayilraj Sivasudhan",
    "Kamali K",
    "Mary Catherine S",
    "Asha S",
    "Nahusha Prasanna Koppa Chandrashekar",
    "Abdulsalam Nagoor",
    "Shameera Fairoz Shajahan",
    "Pavithra Shree Mathivanan",
    "Saharikaa S S",
    "Suvidya",
    "Thowfeekahamadu M",
    "Shanmugasundaram S",
    "Maheswaran Murugesan",
  ];


  /* ────────────────────────────────────────────────────────────
     3. TEAM EMAILS
     Maps display name (and common variants) → @bosch.com email.
     Used in ALM Responsible cards and copy-email buttons.
     Keys are case-sensitive display names or lowercase aliases.
  ──────────────────────────────────────────────────────────── */
  const teamEmails = {
    // ── Primary names ─────────────────────────────────────────
    "Hareesh Gaddam":                        "G.Hareesh@in.bosch.com",
    "Srinivas K":                            "Srinivasareddy.Karnatilakshmireddygari@in.bosch.com",
    "Imayavarman N J":                       "Imayavarman.NalligoundanurJothimurugan@in.bosch.com",
    "Kabelesh K":                            "Karupusamy.Kabelesh@in.bosch.com",
    "Sangavi Devaraj":                       "Devaraj.Sangavi@in.bosch.com",
    "Sandeep Yashoda":                       "Sandeep.Yashoda@in.bosch.com",
    "Harshitha Nalukurthi":                  "Harshitha.Nalukurthi@bosch.com",
    "Mohan Raj Jaganathan":                  "MohanRaj.Jaganathan@in.bosch.com",
    "Kesavan R":                             "Kesavan.Ranganathan@in.bosch.com",
    "Sabari M":                              "external.SABARI.M@in.bosch.com",
    "Sangeeta Rajole":                       "Sangeeta.Rajole@in.bosch.com",
    "Sumsudeen Syed Mohamed":                "Sumsudeen.SyedMohamed@in.bosch.com",
    "Mohammed Ashik S":                      "Mohammed.AshikS@in.bosch.com",
    "Mayilraj Sivasudhan":                   "Sivasudhan.Mayilraj@in.bosch.com",
    "Kamali K":                              "K.Kamali@in.bosch.com",
    "Mary Catherine S":                      "Sankaran.MaryCatherine@in.bosch.com",
    "Asha S":                                "S.Asha@in.bosch.com",
    "Nahusha Prasanna Koppa Chandrashekar":  "NahushaPrasanna.KoppaChandrashekar@in.bosch.com",
    "Shameera Fairoz Shajahan":              "Shajahan.ShameeraFairoz@in.bosch.com",
    "Pavithra Shree Mathivanan":             "Mathivanan.PavithraShree@in.bosch.com",
    "Saharikaa S S":                         "Saharikaa.SubburathinamSumathi@in.bosch.com",
    "Suvidya":                               "VenkataSuvidya.Dega@in.bosch.com",
    "Venkata Suvidya Dega":                  "VenkataSuvidya.Dega@in.bosch.com",
    "Thowfeekahamadu M":                     "M.Thowfeekahamadu@in.bosch.com",
    "Shanmugasundaram S":                    "S.Shanmugasundaram@in.bosch.com",
    "Maheswaran Murugesan":                  "Murugesan.Maheswaran@in.bosch.com",

    // ── Lowercase CSV variants (IBM export uses full names) ────
    "srinivasareddy karnatilakshmireddygari":"Srinivasareddy.Karnatilakshmireddygari@in.bosch.com",

    // ── Short / abbreviated forms (ALM Responsible table) ─────
    "Hareesh G.":           "G.Hareesh@in.bosch.com",
    "Srinivasareddy K.":    "Srinivasareddy.Karnatilakshmireddygari@in.bosch.com",
    "Imayavarman N.":       "Imayavarman.NalligoundanurJothimurugan@in.bosch.com",
    "Kabelesh K.":          "Karupusamy.Kabelesh@in.bosch.com",
    "Sandeep Y.":           "Sandeep.Yashoda@in.bosch.com",
    "H. Nalukurthi":        "Harshitha.Nalukurthi@bosch.com",
    "Mohan Raj J.":         "MohanRaj.Jaganathan@in.bosch.com",
    "Mohan Raj J. (ETS5)":  "MohanRaj.Jaganathan@in.bosch.com",
    "Kesavan R.":           "Kesavan.Ranganathan@in.bosch.com",
    "M SABARI":             "external.SABARI.M@in.bosch.com",

    // ── SWE6 line responsibles (Bosch Germany) ────────────────
    "Hertel Martin":           "Martin.Hertel@de.bosch.com",
    "Hertel Martin (SWE6)":    "Martin.Hertel@de.bosch.com",
    "Meurer Paul":             "Paul.Meurer@de.bosch.com",
    "Meurer Paul (SWE6)":      "Paul.Meurer@de.bosch.com",
    "Mueller Danny":           "Danny.Mueller@de.bosch.com",
    "Mueller Danny (SWE6)":    "Danny.Mueller@de.bosch.com",
    "Kohlheim Peter":          "Peter.Kohlheim@de.bosch.com",
    "Kohlheim Peter (SWE6)":   "Peter.Kohlheim@de.bosch.com",

    // ── ETS5-tagged variants ───────────────────────────────────
    "Hareesh Gaddam (ETS5)":   "G.Hareesh@in.bosch.com",
    "Sangavi Devaraj (ETS5)":  "Devaraj.Sangavi@in.bosch.com",
  };


  /* ────────────────────────────────────────────────────────────
     4. EXPERTISE CONNECT
     IBM-side contacts for ICN 881812 escalations and Severity 1.
  ──────────────────────────────────────────────────────────── */
  const expertiseConnect = [
    { name: "Angela Kefalas",  email: "angela.kefalas@de.ibm.com" },
    { name: "DB Schaefer",     email: "dbschaefer@de.ibm.com"     },
    { name: "Tad Janasiewicz", email: "t.janasiewicz@ibm.com"     },
    { name: "Chris (KAZM)",    email: "kazm@ibm.com"              },
  ];


  /* ────────────────────────────────────────────────────────────
     5. BD ESCALATION CONTACTS
     Bosch BD-side escalation contacts.
  ──────────────────────────────────────────────────────────── */
  const bdEscalation = [
    { name: "Mutalikdesai Sameer",                 email: "Sameer.Mutalikdesai@in.bosch.com"  },
    { name: "Venkat Rangan Mandayam Chakravarthy",  email: "Venkat.Rangan@in.bosch.com"        },
    { name: "Kohlheim Peter",                       email: "Peter.Kohlheim@de.bosch.com"       },
  ];


  /* ────────────────────────────────────────────────────────────
     6. TEAM LEAD
     IBM ETS5 team lead — shown separately from BD Escalation.
  ──────────────────────────────────────────────────────────── */
  const teamLead = [
    { name: "Mohan Raj Jaganathan", email: "MohanRaj.Jaganathan@in.bosch.com" },
  ];


  /* ────────────────────────────────────────────────────────────
     7. CUSTOMER CONTACTS
     Bosch customer-side contacts per ALM line.
     Format: semicolon-separated names and emails.
  ──────────────────────────────────────────────────────────── */
  const customerContacts = [
    { line: "ALM-01", names: "Peter Kohlheim",
      emails: "peter.kohlheim@de.bosch.com" },

    { line: "ALM-02", names: "Seshi Reddy Chandanakeri; Mahesh BM",
      emails: "SeshiReddy.Chandanakeri@in.bosch.com;Mahesh.BM@in.bosch.com" },

    { line: "ALM-03", names: "Prakash Ponraj; Patil Pramoda",
      emails: "prakash.ponraj@in.bosch.com;Pramoda.Patil@in.bosch.com" },

    { line: "ALM-04", names: "Rakesh Kumar; Krishnan Karthik; Maruti Ravindra Bhat",
      emails: "Rakesh.Kumar2@in.bosch.com;karthik.krishnan@de.bosch.com;marutiravindra.bhat@in.bosch.com" },

    { line: "ALM-05", names: "Geetha Mallegowda; Sameer Mutalikdesai; Rakesh Angadi; Dipen Kakad",
      emails: "Geetha.Mallegowda@in.bosch.com;Sameer.Mutalikdesai@in.bosch.com;rakesh.angadi@in.bosch.com;Dipen.Kakad@in.bosch.com" },

    { line: "ALM-06", names: "Maarit Strewe; Alexander Burk; Steffen Schramm",
      emails: "Maarit.Strewe@de.bosch.com;Alexander.Burk@de.bosch.com;Steffen.Schramm@de.bosch.com" },

    { line: "ALM-07", names: "Kevin Wenz; Xuhui Huang",
      emails: "Kevin.Wenz@de.bosch.com;Xuhui.Huang@de.bosch.com" },

    { line: "ALM-08", names: "Balamurugan Rajasekaran; Sabrina Dittrich; Subba Srinatha Reddy Bathula",
      emails: "Balamurugan.Rajasekaran@in.bosch.com;Sabrina.Dittrich@de.bosch.com;Bathula.SubbaSrinathaReddy@in.bosch.com" },

    { line: "ALM-11", names: "Geeta Jadhav; Santosh Kumar Gunasekaran; Anket Kumar",
      emails: "Geeta.Jadhav@in.bosch.com;SantoshKumar.Gunasekaran@in.bosch.com;Anket.Kumar@in.bosch.com" },

    { line: "ALM-12", names: "Paul Lewicki; Anca Laura Papp; Timea Kinga Csok; Marcel Fuchs",
      emails: "Paul.Lewicki@de.bosch.com;Anca-Laura.Papp@ro.bosch.com;Timea-Kinga.Csok@ro.bosch.com;Marcel.Fuchs2@de.bosch.com" },

    { line: "ALM-13", names: "Balamurugan Rajasekaran; Deepa Mudigere Shivaprakash",
      emails: "balamurugan.rajasekaran@in.bosch.com;deepa.mudigereshivaprakash@in.bosch.com" },

    { line: "ALM-14", names: "Govindagouda Nadagouda; Pradeep S; Csaba Imre Talaber; Rachana SH; Muthurani M",
      emails: "Nadagouda.GovindagoudaShivanagouda@in.bosch.com;Pradeep.Gowda@in.bosch.com;CsabaImre.Talaber@hu.bosch.com;rachana.sh@in.bosch.com;muthurani.mariappan@in.bosch.com" },

    { line: "ALM-17", names: "Prajwal Rajashekar; Ganesh Mahadevan; Shinomon Thomas; Srikantaswamy Bisilavaadi",
      emails: "Prajwal.KR@in.bosch.com;Vaidyanathan.GaneshMahadevan@in.bosch.com;Shinomon.Thomas@in.bosch.com;Srikantaswamy.Bisilavaadi@in.bosch.com" },

    { line: "ALM-19", names: "Jan Kamburg; Abinaya Raghupathy; Sanitha Thankappan Pillai; Ramya Chandra Mohan; Ramakrishna Siriki; Janik Schuessler",
      emails: "Jan.Kamburg@de.bosch.com;Abinaya.Raghupathy@in.bosch.com;SanithaThankappan.Pillai@in.bosch.com;Ramya.ChandraMohan@in.bosch.com;Ramakrishna.SirikiSVS@in.bosch.com;Janik.Schuessler@de.bosch.com" },

    { line: "ALM-20", names: "Jan Kamburg; Abinaya Raghupathy; Sanitha Thankappan Pillai; Ramakrishna Siriki; Ramya Chandra Mohan; Janik Schuessler",
      emails: "Jan.Kamburg@de.bosch.com;Abinaya.Raghupathy@in.bosch.com;SanithaThankappan.Pillai@in.bosch.com;Ramakrishna.SirikiSVS@in.bosch.com;Ramya.ChandraMohan@in.bosch.com;Janik.Schuessler@de.bosch.com" },

    { line: "ALM-21", names: "Maciej Zareba",
      emails: "Maciej.Zareba@pl.bosch.com" },

    { line: "ALM-22", names: "Olivier Bugada; Dawid Stopka; Vilem Barta; Pavel Manasek",
      emails: "Olivier.Bugada@de.bosch.com;dawid.stopka@pl.bosch.com;Vilem.Barta@cz.bosch.com;Pavel.Manasek@cz.bosch.com" },

    { line: "ALM-23", names: "Abhilash Basavaraju; Thomas Schoenheim; Pavithra Nagaraj",
      emails: "Abhilash.Basavaraju2@in.bosch.com;Thomas.Schoenheim@de.bosch.com;Pavithra.Nagaraj@in.bosch.com" },

    { line: "ALM-24", names: "Raphael Wegmann; Christian Spiessberger",
      emails: "Raphael.Wegmann@de.bosch.com;Christian.Spiessberger@de.bosch.com" },

    { line: "ALM-25", names: "Lifeng Sun; Karsten Angstmann",
      emails: "Lifeng.Sun2@boschrexroth.de;Karsten.Angstmann@boschrexroth.de" },

    { line: "ALM-28", names: "Birgit Tichy; Christian Giesa",
      emails: "Birgit.Tichy@etas.com;Christian.Giesa@etas.com" },
  ];


  /* ────────────────────────────────────────────────────────────
     8. ALM RESPONSIBLE TABLE
     Maps each ALM line to:
       bd    — Line Responsible (Bosch BD side)
       ibm   — CASE Responsible (IBM side)
       proxy — Proxy / backup responsible
  ──────────────────────────────────────────────────────────── */
  const almResponsible = [
    { alm: "ALM-01", bd: "Hertel Martin",        bdEmail: "Martin.Hertel@de.bosch.com",        ibm: "Sabari M",               ibmEmail: "external.SABARI.M@in.bosch.com",                                proxy: "Harshitha Nalukurthi",  proxyEmail: "Harshitha.Nalukurthi@bosch.com"                                },
    { alm: "ALM-02", bd: "Hertel Martin",        bdEmail: "Martin.Hertel@de.bosch.com",        ibm: "Sabari M",               ibmEmail: "external.SABARI.M@in.bosch.com",                                proxy: "Harshitha Nalukurthi",  proxyEmail: "Harshitha.Nalukurthi@bosch.com"                                },
    { alm: "ALM-03", bd: "Mohan Raj Jaganathan", bdEmail: "MohanRaj.Jaganathan@in.bosch.com",  ibm: "Kesavan R",              ibmEmail: "Kesavan.Ranganathan@in.bosch.com",                              proxy: "Hareesh Gaddam",        proxyEmail: "G.Hareesh@in.bosch.com"                                       },
    { alm: "ALM-04", bd: "Meurer Paul",          bdEmail: "Paul.Meurer@de.bosch.com",          ibm: "Sabari M",               ibmEmail: "external.SABARI.M@in.bosch.com",                                proxy: "Harshitha Nalukurthi",  proxyEmail: "Harshitha.Nalukurthi@bosch.com"                                },
    { alm: "ALM-05", bd: "Mohan Raj Jaganathan", bdEmail: "MohanRaj.Jaganathan@in.bosch.com",  ibm: "Harshitha Nalukurthi",   ibmEmail: "Harshitha.Nalukurthi@bosch.com",                                proxy: "Hareesh Gaddam",        proxyEmail: "G.Hareesh@in.bosch.com"                                       },
    { alm: "ALM-06", bd: "Mueller Danny",        bdEmail: "Danny.Mueller@de.bosch.com",        ibm: "Kabelesh K",             ibmEmail: "Karupusamy.Kabelesh@in.bosch.com",                              proxy: "Imayavarman N J",       proxyEmail: "Imayavarman.NalligoundanurJothimurugan@in.bosch.com"           },
    { alm: "ALM-07", bd: "Mohan Raj Jaganathan", bdEmail: "MohanRaj.Jaganathan@in.bosch.com",  ibm: "Kesavan R",              ibmEmail: "Kesavan.Ranganathan@in.bosch.com",                              proxy: "Hareesh Gaddam",        proxyEmail: "G.Hareesh@in.bosch.com"                                       },
    { alm: "ALM-08", bd: "Meurer Paul",          bdEmail: "Paul.Meurer@de.bosch.com",          ibm: "Sabari M",               ibmEmail: "external.SABARI.M@in.bosch.com",                                proxy: "Harshitha Nalukurthi",  proxyEmail: "Harshitha.Nalukurthi@bosch.com"                                },
    { alm: "ALM-11", bd: "Mohan Raj Jaganathan", bdEmail: "MohanRaj.Jaganathan@in.bosch.com",  ibm: "Srinivas K",             ibmEmail: "Srinivasareddy.Karnatilakshmireddygari@in.bosch.com",           proxy: "Sandeep Yashoda",       proxyEmail: "Sandeep.Yashoda@in.bosch.com"                                 },
    { alm: "ALM-12", bd: "Meurer Paul",          bdEmail: "Paul.Meurer@de.bosch.com",          ibm: "Imayavarman N J",        ibmEmail: "Imayavarman.NalligoundanurJothimurugan@in.bosch.com",           proxy: "Kabelesh K",            proxyEmail: "Karupusamy.Kabelesh@in.bosch.com"                             },
    { alm: "ALM-13", bd: "Kohlheim Peter",       bdEmail: "Peter.Kohlheim@de.bosch.com",       ibm: "Imayavarman N J",        ibmEmail: "Imayavarman.NalligoundanurJothimurugan@in.bosch.com",           proxy: "Kabelesh K",            proxyEmail: "Karupusamy.Kabelesh@in.bosch.com"                             },
    { alm: "ALM-14", bd: "Hareesh Gaddam",       bdEmail: "G.Hareesh@in.bosch.com",            ibm: "Hareesh Gaddam",         ibmEmail: "G.Hareesh@in.bosch.com",                                        proxy: "Kesavan R",             proxyEmail: "Kesavan.Ranganathan@in.bosch.com"                             },
    { alm: "ALM-17", bd: "Hareesh Gaddam",       bdEmail: "G.Hareesh@in.bosch.com",            ibm: "Hareesh Gaddam",         ibmEmail: "G.Hareesh@in.bosch.com",                                        proxy: "Kesavan R",             proxyEmail: "Kesavan.Ranganathan@in.bosch.com"                             },
    { alm: "ALM-19", bd: "Sangavi Devaraj",      bdEmail: "Devaraj.Sangavi@in.bosch.com",      ibm: "Sandeep Yashoda",        ibmEmail: "Sandeep.Yashoda@in.bosch.com",                                  proxy: "Srinivas K",            proxyEmail: "Srinivasareddy.Karnatilakshmireddygari@in.bosch.com"          },
    { alm: "ALM-20", bd: "Sangavi Devaraj",      bdEmail: "Devaraj.Sangavi@in.bosch.com",      ibm: "Sandeep Yashoda",        ibmEmail: "Sandeep.Yashoda@in.bosch.com",                                  proxy: "Srinivas K",            proxyEmail: "Srinivasareddy.Karnatilakshmireddygari@in.bosch.com"          },
    { alm: "ALM-21", bd: "Sangavi Devaraj",      bdEmail: "Devaraj.Sangavi@in.bosch.com",      ibm: "Harshitha Nalukurthi",   ibmEmail: "Harshitha.Nalukurthi@bosch.com",                                proxy: "Sabari M",              proxyEmail: "external.SABARI.M@in.bosch.com"                               },
    { alm: "ALM-22", bd: "Meurer Paul",          bdEmail: "Paul.Meurer@de.bosch.com",          ibm: "Harshitha Nalukurthi",   ibmEmail: "Harshitha.Nalukurthi@bosch.com",                                proxy: "Sabari M",              proxyEmail: "external.SABARI.M@in.bosch.com"                               },
    { alm: "ALM-23", bd: "Mohan Raj Jaganathan", bdEmail: "MohanRaj.Jaganathan@in.bosch.com",  ibm: "Srinivas K",             ibmEmail: "Srinivasareddy.Karnatilakshmireddygari@in.bosch.com",           proxy: "Sandeep Yashoda",       proxyEmail: "Sandeep.Yashoda@in.bosch.com"                                 },
    { alm: "ALM-24", bd: "Meurer Paul",          bdEmail: "Paul.Meurer@de.bosch.com",          ibm: "Harshitha Nalukurthi",   ibmEmail: "Harshitha.Nalukurthi@bosch.com",                                proxy: "Sabari M",              proxyEmail: "external.SABARI.M@in.bosch.com"                               },
    { alm: "ALM-25", bd: "Sangavi Devaraj",      bdEmail: "Devaraj.Sangavi@in.bosch.com",      ibm: "Harshitha Nalukurthi",   ibmEmail: "Harshitha.Nalukurthi@bosch.com",                                proxy: "Sabari M",              proxyEmail: "external.SABARI.M@in.bosch.com"                               },
    { alm: "ALM-28", bd: "Hertel Martin",        bdEmail: "Martin.Hertel@de.bosch.com",        ibm: "Kabelesh K",             ibmEmail: "Karupusamy.Kabelesh@in.bosch.com",                              proxy: "Imayavarman N J",       proxyEmail: "Imayavarman.NalligoundanurJothimurugan@in.bosch.com"          },
  ];


  /* ────────────────────────────────────────────────────────────
     9. IBM DIRECTORY
     Shown in the IBM Contacts Directory card (Info dashboard).
     Grouped by category — add/remove contacts per group here.
  ──────────────────────────────────────────────────────────── */
  const ibmDirectory = {
    "IBM Colleagues": [
      { name: "Bharath Rao",               email: "bharath.rao@in.ibm.com"              },
      { name: "Bhagat P",                  email: "bhagatp1@in.ibm.com"                 },
      { name: "Charles V",                 email: "CHARLESV@ie.ibm.com"                 },
      { name: "Colm Ryan",                 email: "colm.ryan@ie.ibm.com"                },
      { name: "Dinesh B",                  email: "bdineshkumar@in.ibm.com"             },
      { name: "Francesco Chiossi",         email: "Francesco.Chiossi@nl.ibm.com"        },
      { name: "Gerard Cregan",             email: "Gerard.Cregan@ie.ibm.com"            },
      { name: "Glenn Bardwell",            email: "Glenn.Bardwell@ibm.com"              },
      { name: "Ian Barnard",               email: "ian.barnard@uk.ibm.com"              },
      { name: "Laurent Dhenain",           email: "laurent.dhenain@ie.ibm.com"          },
      { name: "Manish DK",                 email: "manishdk@ibm.com"                    },
      { name: "Natarajan Thirumeni",       email: "natarajan.thirumeni@nl.ibm.com"      },
      { name: "Naveen S",                  email: "Naveen.S3@ibm.com"                   },
      { name: "Prem Trichur Parameswaran", email: "Prem.Trichur.Parameswaran@ibm.com"   },
      { name: "Pujashree Jena",            email: "Pujashree.Jena@ibm.com"              },
      { name: "Rosa Naranjo",              email: "rosy@us.ibm.com"                     },
      { name: "Shradha S",                 email: "shradha.s@in.ibm.com"               },
      { name: "Shyam Krishna R",           email: "shyamkrishna.r@in.ibm.com"          },
      { name: "Sindhu K",                  email: "Sindhu.K@ibm.com"                   },
      { name: "Sparsha Bhadresh",          email: "Sparsha.Bhadresh@ibm.com"            },
    ],
    "Development Team (IBM)": [
      { name: "Gabriele Hantschel", email: "gabriele.hantschel@de.ibm.com" },
      { name: "Pradeep KN",         email: "pradeepkn@in.ibm.com"          },
      { name: "Rajeshwari K",       email: "rajeshwari.k4@ibm.com"         },
      { name: "Sunilkumar R",       email: "sunilkumar.r@in.ibm.com"       },
    ],
    "Former IBM Colleagues": [
      { name: "Gerard Perrin", email: "gerard.perrin@ie.ibm.com" },
    ],
  };


  /* ────────────────────────────────────────────────────────────
     PUBLIC API — read-only access to all data above
  ──────────────────────────────────────────────────────────── */
  return Object.freeze({
    config,
    teamMembers,
    teamEmails,
    expertiseConnect,
    bdEscalation,
    teamLead,
    customerContacts,
    almResponsible,
    ibmDirectory,
  });

})();

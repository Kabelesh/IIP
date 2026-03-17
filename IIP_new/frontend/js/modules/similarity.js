/* =============================================================================
   js/modules/similarity.js  —  Text Similarity & Intelligence Engine
   =============================================================================
   Provides: tokenization, error-code extraction, product detection, keyword
   extraction, TF-IDF similarity scoring, case clustering, pattern detection,
   and simple linear-regression prediction.

   Used by:  investigate.js (Case Investigation AI + Support Intelligence)
   ============================================================================= */
'use strict';

const Similarity = (() => {

  /* ── Stop-words (excluded from keyword extraction) ───────────────────── */
  const STOP = new Set([
    'the','a','an','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','shall','should','may','might','can','could',
    'not','no','nor','and','or','but','if','then','else','when','while','for',
    'with','at','by','from','to','in','on','of','it','its','this','that','these',
    'those','i','we','you','he','she','they','me','us','him','her','them','my',
    'our','your','his','their','which','who','whom','what','where','how','all',
    'each','every','some','any','few','more','most','other','so','than','too',
    'very','just','also','about','into','over','after','before','between','under',
    'again','once','here','there','because','until','while','during','through',
    'above','below','up','down','out','off','as','same','such','only','own',
    'new','case','ibm','team','support','server','error','issue','problem',
    'please','thanks','thank','need','help','get','set','use','work','try',
    'see','know','like','want','one','two','still','now','back','well','even',
    'make','take','come','go','look','find','give','tell'
  ]);

  /* ── IBM product keywords → canonical product names ──────────────────── */
  const PRODUCT_MAP = {
    'elm':     'ELM',
    'rtc':     'RTC (Rational Team Concert)',
    'dng':     'DNG (DOORS Next)',
    'doors':   'DNG (DOORS Next)',
    'etm':     'ETM (Engineering Test Mgmt)',
    'qm':      'ETM (Engineering Test Mgmt)',
    'rqm':     'ETM (Engineering Test Mgmt)',
    'jazz':    'Jazz Platform',
    'jts':     'JTS (Jazz Team Server)',
    'ccm':     'CCM (Change & Config Mgmt)',
    'gc':      'GC (Global Configuration)',
    'gcm':     'GC (Global Configuration)',
    'rm':      'RM (Requirements Mgmt)',
    'am':      'AM (Architecture Mgmt)',
    'rhapsody':'Rhapsody',
    'relm':    'RELM',
    'lqe':     'LQE (Lifecycle Query Engine)',
    'ldx':     'LDX (Link Discovery)',
    'rs':      'RS (Report Builder)',
    'dcc':     'DCC (Design Config Mgmt)',
    'alm':     'ALM',
    'clm':     'CLM',
    'websphere':'WebSphere',
    'was':     'WebSphere',
    'liberty': 'WebSphere Liberty',
    'ihs':     'IBM HTTP Server',
    'db2':     'DB2',
    'oracle':  'Oracle DB',
    'tomcat':  'Tomcat',
    'haproxy': 'HAProxy',
    'ldap':    'LDAP',
    'saml':    'SAML / SSO',
    'sso':     'SAML / SSO',
  };

  /* ── Error code patterns ─────────────────────────────────────────────── */
  const ERROR_PATTERNS = [
    /\b(CRJ[A-Z]{2}\d{3,5}[A-Z]?)\b/g,        // CRJAZ0428E, CRRTC1234W
    /\b(CRR[A-Z]{2}\d{3,5}[A-Z]?)\b/g,         // CRRTC, CRRIM, etc.
    /\b(CRD[A-Z]{2}\d{3,5}[A-Z]?)\b/g,         // CRDNG, etc.
    /\b(CRQM[A-Z]?\d{3,5}[A-Z]?)\b/g,          // CRQM
    /\b(CRCLM\d{3,5}[A-Z]?)\b/g,               // CRCLM
    /\b(TRA\d{3,5}[A-Z]?)\b/g,                  // TRA0001W
    /\b(REPOTOOLS-[A-Z]+-\d+)\b/gi,             // REPOTOOLS-CMD-1234
    /\b(WARN|ERROR|FATAL|SEVERE)\b:\s*\S+/gi,   // ERROR: some.class
    /\b(HTTP\s*[45]\d{2})\b/gi,                  // HTTP 500, HTTP 404
    /\bORA-\d{4,5}\b/g,                          // Oracle ORA-12345
    /\bSQL\d{4,5}[A-Z]?\b/g,                    // SQL0204N
    /\b(java\.lang\.\w+Exception)\b/g,           // java.lang.NullPointerException
    /\b(java\.lang\.\w+Error)\b/g,               // java.lang.OutOfMemoryError
    /\b(com\.ibm\.\w+(?:\.\w+)*Exception)\b/g,  // com.ibm.team...Exception
  ];

  /* ── Tokenizer ───────────────────────────────────────────────────────── */
  function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_./-]+/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP.has(t));
  }

  /* ── Analyze text: extract error codes, products, keywords ───────────── */
  function analyzeText(input) {
    if (!input) return { errorCodes: [], products: [], keywords: [] };

    // Error codes
    const errorCodes = [];
    const seen = new Set();
    ERROR_PATTERNS.forEach(pattern => {
      // Reset lastIndex for global patterns
      const re = new RegExp(pattern.source, pattern.flags);
      let m;
      while ((m = re.exec(input)) !== null) {
        const code = m[1] || m[0];
        const key = code.toUpperCase();
        if (!seen.has(key)) { seen.add(key); errorCodes.push(code); }
      }
    });

    // Products
    const lower = input.toLowerCase();
    const products = [];
    const seenProducts = new Set();
    Object.entries(PRODUCT_MAP).forEach(([kw, canonical]) => {
      if (lower.includes(kw) && !seenProducts.has(canonical)) {
        seenProducts.add(canonical);
        products.push(canonical);
      }
    });

    // Keywords (significant tokens minus stop-words)
    const tokens = tokenize(input);
    const freq = {};
    tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([w]) => w);

    return { errorCodes, products, keywords };
  }

  /* ── TF-IDF similarity between input text and a case ─────────────────── */
  function _caseText(c) {
    return [
      c.Title || '',
      c.Product || '',
      c.Status || '',
      c.Owner || '',
      c['Case Number'] || '',
      c._wtComment || '',          // weekly tracker comment if attached
      c._wednesdayComments || '',  // merged wednesday comments
    ].join(' ');
  }

  function findSimilarCases(input, cases, maxResults = 10) {
    if (!input || !cases || !cases.length) return [];
    const inputTokens = tokenize(input);
    if (!inputTokens.length) return [];
    const inputSet = new Set(inputTokens);

    // Build IDF from corpus
    const docCount = cases.length;
    const df = {};
    cases.forEach(c => {
      const unique = new Set(tokenize(_caseText(c)));
      unique.forEach(t => { df[t] = (df[t] || 0) + 1; });
    });

    // Score each case
    const scored = cases.map(c => {
      const caseTokens = tokenize(_caseText(c));
      if (!caseTokens.length) return { case: c, score: 0 };
      const caseTF = {};
      caseTokens.forEach(t => { caseTF[t] = (caseTF[t] || 0) + 1; });

      let score = 0;
      inputTokens.forEach(t => {
        if (caseTF[t]) {
          const tf = caseTF[t] / caseTokens.length;
          const idf = Math.log((docCount + 1) / ((df[t] || 0) + 1)) + 1;
          score += tf * idf;
        }
      });
      // Bonus for error-code exact match
      const analysis = analyzeText(input);
      analysis.errorCodes.forEach(ec => {
        if ((_caseText(c)).toUpperCase().includes(ec.toUpperCase())) {
          score += 0.3;
        }
      });
      return { case: c, score };
    });

    return scored
      .filter(s => s.score > 0.01)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /* ── Cluster detection (group cases with similar titles) ─────────────── */
  function detectClusters(cases, minCluster = 2) {
    if (!cases || cases.length < minCluster) return [];

    // Group by significant tokens in title
    const buckets = {};
    cases.forEach(c => {
      const title = c.Title || '';
      const tokens = tokenize(title).slice(0, 6);
      // Create 2-gram keys
      for (let i = 0; i < tokens.length - 1; i++) {
        const key = tokens[i] + '|' + tokens[i + 1];
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(c);
      }
    });

    const clusters = [];
    const usedKeys = new Set();
    Object.entries(buckets)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([key, group]) => {
        if (group.length < minCluster) return;
        if (usedKeys.has(key)) return;
        usedKeys.add(key);
        const commonTokens = key.split('|');
        const product = group[0].Product || 'Unknown';
        clusters.push({
          count: group.length,
          commonTokens,
          product,
          sampleTitle: group[0].Title || '',
          cases: group,
        });
      });

    return clusters.slice(0, 20);
  }

  /* ── Top error codes across all case titles ──────────────────────────── */
  function topErrorCodes(cases, limit = 15) {
    const freq = {};
    cases.forEach(c => {
      const text = (c.Title || '') + ' ' + (c._wtComment || '');
      ERROR_PATTERNS.forEach(pattern => {
        const re = new RegExp(pattern.source, pattern.flags);
        let m;
        while ((m = re.exec(text)) !== null) {
          const code = (m[1] || m[0]).toUpperCase();
          freq[code] = (freq[code] || 0) + 1;
        }
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([code, count]) => ({ code, count }));
  }

  /* ── Recurring keyword patterns ──────────────────────────────────────── */
  function recurringPatterns(cases, limit = 12) {
    const freq = {};
    cases.forEach(c => {
      const tokens = new Set(tokenize((c.Title || '') + ' ' + (c._wtComment || '')));
      tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
    });
    return Object.entries(freq)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
  }

  /* ── Simple linear-regression prediction (next week case volume) ─────── */
  function predictNextWeek(cases) {
    if (!cases || cases.length < 5) return null;

    // Group by ISO week
    const weekMap = {};
    cases.forEach(c => {
      const d = c.Created ? new Date(c.Created) : null;
      if (!d || isNaN(d)) return;
      const wk = _isoWeek(d);
      weekMap[wk] = (weekMap[wk] || 0) + 1;
    });

    const weeks = Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]));
    if (weeks.length < 3) return null;

    const recent = weeks.slice(-8);
    const n = recent.length;
    const xs = recent.map((_, i) => i);
    const ys = recent.map(([, c]) => c);

    // Linear regression y = a + bx
    const xMean = xs.reduce((s, v) => s + v, 0) / n;
    const yMean = ys.reduce((s, v) => s + v, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - xMean) * (ys[i] - yMean);
      den += (xs[i] - xMean) * (xs[i] - xMean);
    }
    const b = den ? num / den : 0;
    const a = yMean - b * xMean;
    const predicted = Math.max(0, Math.round(a + b * n));
    const lastWeek = ys[ys.length - 1];
    const trend = predicted > lastWeek ? 'up' : predicted < lastWeek ? 'down' : 'flat';

    return { predicted, lastWeek, trend };
  }

  function _isoWeek(d) {
    const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((dt - yearStart) / 86400000 + 1) / 7);
    return `${dt.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */
  return {
    tokenize,
    analyzeText,
    findSimilarCases,
    detectClusters,
    topErrorCodes,
    recurringPatterns,
    predictNextWeek,
  };
})();

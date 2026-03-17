/* ============================================================
   js/modules/charts.js
   Chart.js wrapper helpers.
   Each function creates/updates a Chart instance.
   ============================================================ */

const Charts = (() => {

  // Keep references to destroy before re-render
  const _instances = {};

  // Resolve CSS custom property to a concrete color value for Canvas API.
  // Canvas 2D context cannot use var(--token) strings directly.
  function _cssColor(varName) {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return v || varName;
    } catch(e) { return varName; }
  }

  // Resolve a color that may be "var(--token)", "--token", or a raw hex/rgb value
  function _resolveColor(val, fallbackVar) {
    if (!val) return _cssColor(fallbackVar);
    if (val.startsWith("var(")) return _cssColor(val.slice(4, -1));
    if (val.startsWith("--"))  return _cssColor(val);
    return val;  // already a concrete color (hex, rgb, etc.)
  }

  // Chart palette — resolved at render time from CSS tokens
  function _chartColors(n) {
    const vars = [
      "--chart-1","--chart-2","--chart-3","--chart-4",
      "--chart-5","--chart-6","--chart-7","--chart-8",
      "--ibm-blue-50","--teal","--red","--teal"
    ];
    return vars.slice(0, n).map(v => _cssColor(v));
  }

  const CHART_COLORS = [
    "--chart-1","--chart-2","--chart-3","--chart-4",
    "--chart-5","--chart-6","--chart-7","--chart-8",
    "--ibm-blue-50","--teal","--red","--teal"
  ].map(v => _cssColor(v));

  const GRID_COLOR  = "rgba(0,0,0,0.06)";
  const TICK_COLOR  = _cssColor("--text-tertiary");
  const FONT_FAMILY = "'IBM Plex Sans','Helvetica Neue',Arial,sans-serif";

  function _destroy(id) {
    if (_instances[id]) { try { _instances[id].destroy(); } catch(e){} delete _instances[id]; }
  }

  // Guard: returns true if Chart.js is ready, otherwise logs and shows fallback.
  function _chartAvailable(canvasId) {
    if (typeof Chart !== "undefined") return true;
    console.warn("[Charts] Chart.js not loaded yet for #" + canvasId);
    const el = document.getElementById(canvasId);
    if (el && el.parentElement) {
      el.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-tertiary);font-size:13px;">Chart unavailable — reload page</div>';
    }
    return false;
  }

  // FIX: Ensure canvas container has a non-zero height before Chart.js reads dimensions.
  // If the inline height style is missing or the container reports 0, apply a default.
  function _ensureContainerHeight(canvasId, defaultHeight) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const h = wrap.offsetHeight || parseInt(wrap.style.height) || 0;
    if (h === 0) {
      wrap.style.height = (defaultHeight || 200) + "px";
      console.info("[Charts] Applied fallback height to #" + canvasId + " container");
    }
  }

  // FIX: Empty-data guard — logs a console warning and shows a placeholder instead of
  // letting Chart.js create a broken empty chart.
  function _hasData(canvasId, data, label) {
    if (!data || data.length === 0) {
      console.warn("[Charts] No data for chart #" + canvasId + (label ? " (" + label + ")" : "") + " — skipping render.");
      const canvas = document.getElementById(canvasId);
      if (canvas && canvas.parentElement) {
        if (!canvas.parentElement.querySelector(".chart-no-data")) {
          const msg = document.createElement("div");
          msg.className = "chart-no-data";
          msg.style.cssText = "display:flex;align-items:center;justify-content:center;height:100%;min-height:80px;color:var(--text-disabled);font-size:12px;font-family:'IBM Plex Mono',monospace";
          msg.textContent = "No data available";
          canvas.parentElement.appendChild(msg);
          canvas.style.display = "none";
        }
      }
      return false;
    }
    // Remove any prior no-data placeholder
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      canvas.style.display = "";
      canvas.parentElement?.querySelector(".chart-no-data")?.remove();
    }
    return true;
  }

  /* ── Bar Chart: owner vs count ─────────────────────────── */
  function ownerBar(canvasId, data, opts = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (!_chartAvailable(canvasId)) return;
    if (!_hasData(canvasId, data, "ownerBar")) return;
    _ensureContainerHeight(canvasId, 200);

    _destroy(canvasId);

    const barColor = _resolveColor(opts.color, "--ibm-blue-30");
    const datasets = [{
      label: opts.label || "Cases",
      data: data.map(d => d.count),
      backgroundColor: barColor + "cc",
      borderColor: barColor,
      borderWidth: 1,
      borderRadius: 2,
    }];

    if (opts.secondaryKey && data.some(d => d[opts.secondaryKey] !== undefined)) {
      datasets.push({
        label: opts.secondaryLabel || "Secondary",
        data: data.map(d => d[opts.secondaryKey] || 0),
        backgroundColor: (_resolveColor(opts.secondaryColor, "--red")) + "aa",
        borderColor: _resolveColor(opts.secondaryColor, "--red"),
        borderWidth: 1,
        borderRadius: 2,
      });
    }

    _instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: { labels: data.map(d => d.name), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => {
          if (elements.length && opts.onClick) {
            opts.onClick(data[elements[0].index].fullName, elements[0].datasetIndex);
          }
        },
        plugins: {
          legend: { display: datasets.length > 1, labels: { color: TICK_COLOR, font: { family: FONT_FAMILY, size: 11 } } },
          tooltip: {
            backgroundColor: _cssColor("--bg-ui"),
            borderColor: _cssColor("--border-subtle"),
            borderWidth: 1,
            titleColor: _cssColor("--text-primary"),
            bodyColor: _cssColor("--text-secondary"),
            titleFont: { family: FONT_FAMILY, size: 11 },
            bodyFont:  { family: FONT_FAMILY, size: 13 },
            callbacks: {
              title: items => items[0].label,
              label:  item  => ` ${item.dataset.label}: ${item.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: {
              color:       TICK_COLOR,
              font:        { family: FONT_FAMILY, size: 10 },
              maxRotation: 90,
              minRotation: 35,
              autoSkip:    false
            }
          },
          y: {
            grid:  { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY, size: 11 }, precision: 0, callback: v => Number.isInteger(v) ? v : null },
            beginAtZero: true
          }
        }
      }
    });
  }

  /* ── Line Chart: monthly trend ─────────────────────────── */
  function trendLine(canvasId, trend, opts = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (!_chartAvailable(canvasId)) return;
    if (!_hasData(canvasId, trend, "trendLine")) return;
    _ensureContainerHeight(canvasId, 195);

    _destroy(canvasId);

    _instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: trend.map(d => d.label),
        datasets: [
          {
            label: "Created",
            data: trend.map(d => d.created),
            borderColor: _cssColor("--ibm-blue-30"),
            backgroundColor: "#4589ff22",
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: _cssColor("--ibm-blue-30"),
            tension: 0.3,
            fill: true
          },
          {
            label: "Closed",
            data: trend.map(d => d.closed),
            borderColor: _cssColor("--green"),
            backgroundColor: "#42be6522",
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: _cssColor("--green"),
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: {
              color: TICK_COLOR,
              font: { family: FONT_FAMILY, size: 11 },
              boxWidth: 10
            }
          },
          tooltip: {
            backgroundColor: _cssColor("--sidebar-bg"),
            borderColor: _cssColor("--text-secondary"),
            borderWidth: 1,
            titleColor: _cssColor("--border-mid"),
            bodyColor: _cssColor("--bg-layer"),
            titleFont: { family: FONT_FAMILY, size: 11 },
            bodyFont:  { family: FONT_FAMILY, size: 12 }
          }
        },
        onClick: opts.onClick ? (evt, elements) => {
          if (elements.length > 0) {
            const idx   = elements[0].index;
            const label = trend[idx]?.label;
            if (label) opts.onClick(label);
          }
        } : undefined,
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY, size: 10 }, maxRotation: 0, minRotation: 0 }
          },
          y: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY, size: 11 }, precision: 0, callback: v => Number.isInteger(v) ? v : null },
            beginAtZero: true
          }
        }
      }
    });
  }

  /* ── Doughnut: status distribution (modern) ────────────── */
  const STATUS_COLORS_BORDER = {
    "Awaiting your feedback": "#D4920A",
    "IBM is working":         "#0F62FE",
    "Waiting for IBM":        "#6929C4",
    "Closed by IBM":          "#198038",
    "Closed by Client":       "#6F6F6F",
    "Closed - Archived":      "#A8A8A8"
  };
  const STATUS_COLORS_FILL = {
    "Awaiting your feedback": "#F5A800",
    "IBM is working":         "#4589FF",
    "Waiting for IBM":        "#8A3FFC",
    "Closed by IBM":          "#24A148",
    "Closed by Client":       "#8D8D8D",
    "Closed - Archived":      "#C6C6C6"
  };

  function statusDonut(canvasId, data, opts = {}) {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (!_chartAvailable(canvasId)) return;
    if (!_hasData(canvasId, data, "statusDonut")) return;
    _ensureContainerHeight(canvasId, 210);

    const borderColors = data.map(d => STATUS_COLORS_BORDER[d.name] || "#8D8D8D");
    const fillColors   = data.map(d => STATUS_COLORS_FILL[d.name]   || "#8D8D8D");

    _instances[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: fillColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 4,
          spacing: 3,
          hoverOffset: 10,
          hoverBorderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        animation: { animateRotate: true, animateScale: false, duration: 600, easing: "easeOutCubic" },
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: _cssColor("--text-primary"),
              font: { family: FONT_FAMILY, size: 12, weight: "500" },
              boxWidth: 10,
              boxHeight: 10,
              borderRadius: 3,
              padding: 14,
              generateLabels: (chart) => {
                const ds = chart.data.datasets[0];
                const total = ds.data.reduce((a, b) => a + b, 0);
                return chart.data.labels.map((label, i) => {
                  const val = ds.data[i];
                  const pct = total > 0 ? Math.round(val / total * 100) : 0;
                  return {
                    text: `${label}  ${val}  (${pct}%)`,
                    fillStyle: ds.backgroundColor[i],
                    strokeStyle: ds.borderColor[i],
                    lineWidth: 1.5,
                    borderRadius: 3,
                    index: i,
                    hidden: false
                  };
                });
              }
            }
          },
          tooltip: {
            backgroundColor: "rgba(22,22,22,0.92)",
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            titleColor: "#ffffff",
            bodyColor: "rgba(255,255,255,0.82)",
            titleFont: { family: FONT_FAMILY, size: 12, weight: "600" },
            bodyFont:  { family: FONT_FAMILY, size: 13 },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            callbacks: {
              title: (items) => items[0]?.label || "",
              label: (item) => {
                const total = item.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round(item.raw / total * 100) : 0;
                return `  ${item.raw} cases  (${pct}%)`;
              }
            }
          }
        },
        onClick: opts.onClick ? (evt, elements) => {
          if (elements.length > 0) opts.onClick(data[elements[0].index].name);
        } : undefined
      }
    });
    if (opts.onClick) ctx.style.cursor = "pointer";
  }

  /* ── Horizontal bar: product distribution ──────────────── */
  function productBar(canvasId, data, opts = {}) {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (!_chartAvailable(canvasId)) return;
    if (!_hasData(canvasId, data, "productBar")) return;
    _ensureContainerHeight(canvasId, 210);

    // Smart abbreviation: strip common prefixes, keep meaningful part
    const abbrevLabel = (name) => {
      let s = name
        .replace(/^IBM Engineering /, "")
        .replace(/^IBM Rational /, "")
        .replace(/^IBM /, "")
        .replace(" Management", " Mgmt")
        .replace(" Requirements", " Req.")
        .replace(" Workflow", " WF")
        .replace(" Lifecycle", " LC");
      return s.length > 28 ? s.slice(0, 26) + "…" : s;
    };
    const shortLabels = data.map(d => abbrevLabel(d.name));
    const fullLabels  = data.map(d => d.name);
    const colors = CHART_COLORS.slice(0, data.length);

    _instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: shortLabels,
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: colors.map(c => c + "cc"),
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { left: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: _cssColor("--header-bg"), borderColor: _cssColor("--text-secondary"), borderWidth: 1,
            titleColor: _cssColor("--border-mid"), bodyColor: _cssColor("--bg-layer"),
            bodyFont: { family: FONT_FAMILY, size: 12 },
            callbacks: {
              title: (items) => fullLabels[items[0].dataIndex] || items[0].label
            }
          }
        },
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { family: FONT_FAMILY, size: 10 }, maxRotation: 0, minRotation: 0 },
            beginAtZero: true
          },
          y: {
            grid: { display: false },
            ticks: {
              color: TICK_COLOR,
              font: { family: FONT_FAMILY, size: 10.5 },
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false
            },
            afterFit: (axis) => { axis.width = Math.max(axis.width, 160); }
          }
        },
        onClick: opts.onClick ? (evt, elements) => {
          if (elements.length > 0) {
            opts.onClick(data[elements[0].index].name);
          }
        } : undefined
      }
    });
    if (opts.onClick) ctx.style.cursor = "pointer";
  }

  /* ── Destroy all chart instances (cleanup helper) ──── */
  function destroyAll() {
    Object.keys(_instances).forEach(id => _destroy(id));
  }

  return { ownerBar, trendLine, statusDonut, productBar, destroyAll, cssColor: _cssColor };
})();

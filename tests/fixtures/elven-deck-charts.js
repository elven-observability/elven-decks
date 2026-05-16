/* @elven-observability/decks-skill — elven-deck-charts.js
 *
 * Motor de gráficos SVG data-driven dos decks Elven. Linha e barra.
 * Mesma engine do deck canônico kontik, generalizada para qualquer dado.
 *
 * Uso no deck:
 *
 *   <div class="chart" id="meu-grafico"></div>
 *   ...
 *   <script src="elven-deck-charts.js"></script>
 *   <script>
 *     function renderCharts() {
 *       ElvenDeck.lineChart(document.getElementById("meu-grafico"), [
 *         { name: "RPS", data: [1,2,3,...], color: ElvenDeck.colors.teal },
 *         { name: "P95", data: [4,5,6,...], color: ElvenDeck.colors.red }
 *       ], { labels: ["20h","21h",...], xticks: [0,6,12,18,24], max: 10 });
 *     }
 *     window.addEventListener("load", renderCharts);
 *     window.addEventListener("resize", renderCharts);
 *   </script>
 *
 * O renderizador de PDF chama window.renderCharts() explicitamente — então
 * defina sempre a função com esse nome e registre nos eventos load/resize.
 */

(function () {
  "use strict";

  var colors = {
    teal: "#00bfa5",
    teal2: "#00897b",
    blue: "#0d47a1",
    cyan: "#00e5ff",
    lime: "#d7ff63",
    red: "#ff5252",
    amber: "#fbbf24",
    violet: "#7c3aed",
    slate: "#64748b",
  };

  function scale(v, min, max, a, b) {
    if (max === min) return (a + b) / 2;
    return a + ((v - min) / (max - min)) * (b - a);
  }

  function fmt(v) {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
    if (v >= 1000) return Math.round(v / 1000) + "k";
    return Math.round(v).toString();
  }

  /* Indices padrão do eixo x: ~7 marcas igualmente espaçadas. */
  function defaultTicks(n) {
    if (n <= 7) return Array.from({ length: n }, function (_, i) { return i; });
    var ticks = [];
    for (var t = 0; t < 7; t++) {
      ticks.push(Math.round(scale(t, 0, 6, 0, n - 1)));
    }
    return ticks;
  }

  function gridColor(dark) {
    return dark ? "rgba(255,255,255,.12)" : "rgba(15,25,35,.12)";
  }
  function axisColor(dark) {
    return dark ? "rgba(255,255,255,.62)" : "#64748b";
  }

  /* ---- Line chart -------------------------------------------------- */
  function lineChart(el, series, opts) {
    if (!el) return;
    opts = opts || {};
    var w = el.clientWidth || 500;
    var h = el.clientHeight || 260;
    var p = { l: 46, r: 22, t: 20, b: 36 };
    var dark = el.closest(".dark") != null;
    var labels = opts.labels || (series[0] ? series[0].data.map(function (_, i) { return String(i); }) : []);
    var n = labels.length;
    var ticks = opts.xticks || defaultTicks(n);

    var all = series.reduce(function (acc, s) { return acc.concat(s.data); }, []);
    var min = opts.min != null ? opts.min : Math.min(0, Math.min.apply(null, all));
    var max = opts.max != null ? opts.max : Math.max.apply(null, all) * 1.08;

    var xs = labels.map(function (_, i) { return scale(i, 0, n - 1, p.l, w - p.r); });
    var y = function (v) { return scale(v, min, max, h - p.b, p.t); };

    var svg = '<svg viewBox="0 0 ' + w + " " + h + '" width="100%" height="100%" role="img">';
    svg += '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="transparent"/>';

    for (var i = 0; i <= 4; i++) {
      var yy = scale(i, 0, 4, h - p.b, p.t);
      svg += '<line x1="' + p.l + '" y1="' + yy + '" x2="' + (w - p.r) + '" y2="' + yy +
        '" stroke="' + gridColor(dark) + '" stroke-width="1"/>';
    }

    if (opts.threshold != null) {
      var ty = y(opts.threshold);
      svg += '<line x1="' + p.l + '" y1="' + ty + '" x2="' + (w - p.r) + '" y2="' + ty +
        '" stroke="' + colors.red + '" stroke-width="1.6" stroke-dasharray="6 6"/>';
      svg += '<text x="' + (w - p.r - 4) + '" y="' + (ty - 6) +
        '" text-anchor="end" font-size="11" font-weight="800" fill="' + colors.red + '">' +
        (opts.thresholdLabel || "threshold") + "</text>";
    }

    series.forEach(function (s) {
      var d = s.data.map(function (v, i) {
        return (i === 0 ? "M" : "L") + xs[i].toFixed(1) + "," + y(v).toFixed(1);
      }).join(" ");
      svg += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="' +
        (s.width || 3) + '" stroke-linecap="round" stroke-linejoin="round"/>';
      var lastX = xs[xs.length - 1];
      var lastY = y(s.data[s.data.length - 1]);
      svg += '<circle cx="' + lastX + '" cy="' + lastY + '" r="4" fill="' + s.color + '"/>';
      svg += '<text x="' + (lastX - 6) + '" y="' + (lastY - 9) +
        '" text-anchor="end" font-size="11" font-weight="800" fill="' + s.color + '">' +
        s.name + "</text>";
    });

    ticks.forEach(function (i) {
      if (i < 0 || i >= n) return;
      svg += '<text x="' + xs[i] + '" y="' + (h - 12) +
        '" text-anchor="middle" font-size="11" fill="' + axisColor(dark) + '">' + labels[i] + "</text>";
    });

    [0, 0.5, 1].forEach(function (t) {
      var val = min + (max - min) * t;
      var yv = y(val);
      svg += '<text x="' + (p.l - 10) + '" y="' + (yv + 4) +
        '" text-anchor="end" font-size="11" fill="' + axisColor(dark) + '">' +
        (opts.percent ? Math.round(val) + "%" : fmt(val)) + "</text>";
    });

    svg += "</svg>";
    el.innerHTML = svg;
  }

  /* ---- Bar chart --------------------------------------------------- */
  function barChart(el, series, opts) {
    if (!el) return;
    opts = opts || {};
    var w = el.clientWidth || 500;
    var h = el.clientHeight || 260;
    var p = { l: 42, r: 20, t: 18, b: 36 };
    var dark = el.closest(".dark") != null;
    var labels = opts.labels || series.data.map(function (_, i) { return String(i); });
    var n = labels.length;
    var ticks = opts.xticks || defaultTicks(n);
    var max = opts.max != null ? opts.max : Math.max.apply(null, series.data) * 1.12;
    var bw = (w - p.l - p.r) / series.data.length;
    var y = function (v) { return scale(v, 0, max, h - p.b, p.t); };

    var svg = '<svg viewBox="0 0 ' + w + " " + h + '" width="100%" height="100%" role="img">';

    for (var i = 0; i <= 4; i++) {
      var yy = scale(i, 0, 4, h - p.b, p.t);
      svg += '<line x1="' + p.l + '" y1="' + yy + '" x2="' + (w - p.r) + '" y2="' + yy +
        '" stroke="' + gridColor(dark) + '"/>';
    }

    series.data.forEach(function (v, i) {
      var x = p.l + i * bw + bw * 0.18;
      var yv = y(v);
      var color = opts.hot && v >= opts.hot ? colors.red : series.color;
      svg += '<rect x="' + x + '" y="' + yv + '" width="' + (bw * 0.64) +
        '" height="' + (h - p.b - yv) + '" fill="' + color + '"/>';
    });

    ticks.forEach(function (i) {
      if (i < 0 || i >= n) return;
      var x = p.l + i * bw + bw / 2;
      svg += '<text x="' + x + '" y="' + (h - 12) +
        '" text-anchor="middle" font-size="11" fill="' + axisColor(dark) + '">' + labels[i] + "</text>";
    });

    [0, 0.5, 1].forEach(function (t) {
      var val = max * t;
      var yv = y(val);
      svg += '<text x="' + (p.l - 10) + '" y="' + (yv + 4) +
        '" text-anchor="end" font-size="11" fill="' + axisColor(dark) + '">' +
        (opts.percent ? Math.round(val) + "%" : fmt(val)) + "</text>";
    });

    svg += "</svg>";
    el.innerHTML = svg;
  }

  window.ElvenDeck = {
    colors: colors,
    lineChart: lineChart,
    barChart: barChart,
    fmt: fmt,
  };
})();

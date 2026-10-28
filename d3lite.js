/* d3lite.js — 도록 화면 그래프에 쓰던 d3(279KB) 가운데 실제로 쓰는 부분만 옮긴 작은 판(2026-10-28).
   쓰는 것: select · selectAll().data().join() · append · attr · style · text · each · on · call · node · remove
            scaleLinear(.nice .ticks) · max · min · symbol · symbolStar · axisBottom · axisLeft(.ticks .tickSize)
   d3 v7과 같은 결과가 나오도록 눈금 계산(tickIncrement)과 축 그리기 규칙을 그대로 따랐다. */
(function () {
  if (window.d3 && window.d3.version) return;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function Sel(nodes, parents, sel) { this._n = nodes; this._p = parents; this._s = sel; }
  var P = Sel.prototype;
  function val(v, n, i) { return typeof v === 'function' ? v.call(n, n.__data__, i) : v; }
  P.node = function () { return this._n[0] || null; };
  P.nodes = function () { return this._n.slice(); };
  P.each = function (f) { this._n.forEach(function (n, i) { f.call(n, n.__data__, i); }); return this; };
  P.attr = function (k, v) {
    if (arguments.length < 2) return this._n[0] ? this._n[0].getAttribute(k) : null;
    this._n.forEach(function (n, i) { var x = val(v, n, i); if (x == null) n.removeAttribute(k); else n.setAttribute(k, x); }); return this;
  };
  P.style = function (k, v) {
    this._n.forEach(function (n, i) { var x = val(v, n, i); if (x == null) n.style.removeProperty(k); else n.style.setProperty(k, x); }); return this;
  };
  P.text = function (v) {
    if (!arguments.length) return this._n[0] ? this._n[0].textContent : '';
    this._n.forEach(function (n, i) { var x = val(v, n, i); n.textContent = x == null ? '' : x; }); return this;
  };
  P.append = function (tag) {
    var out = this._n.map(function (p) {
      var c = (tag === 'svg' || p.namespaceURI === SVGNS) ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
      if ('__data__' in p) c.__data__ = p.__data__;
      p.appendChild(c); return c;
    });
    return new Sel(out);
  };
  P.select = function (s) {
    var out = []; this._n.forEach(function (n) { var c = n.querySelector(s); if (c) { if ('__data__' in n) c.__data__ = n.__data__; out.push(c); } });
    return new Sel(out);
  };
  P.selectAll = function (s) {
    var out = []; this._n.forEach(function (n) { [].push.apply(out, n.querySelectorAll(s)); });
    return new Sel(out, this._n, s);
  };
  P.data = function (arr) { this._d = arr; return this; };
  P.join = function (tag) {
    var arr = this._d || [], parents = this._p || [], out = [];
    parents.forEach(function (p) {
      var old = [].filter.call(p.children, function (c) { return c.matches(this._s); }, this);
      arr.forEach(function (d, i) {
        var c = old[i] || p.appendChild(p.namespaceURI === SVGNS ? document.createElementNS(SVGNS, tag) : document.createElement(tag));
        c.__data__ = d; out.push(c);
      });
      old.slice(arr.length).forEach(function (c) { c.remove(); });
    }, this);
    return new Sel(out);
  };
  P.on = function (type, f) {
    this._n.forEach(function (n) {
      var k = '__on_' + type; if (n[k]) n.removeEventListener(type, n[k]);
      if (!f) { n[k] = null; return; }
      n[k] = function (ev) { f.call(n, ev, n.__data__); }; n.addEventListener(type, n[k]);
    }); return this;
  };
  P.call = function (f) { var a = [].slice.call(arguments, 1); f.apply(null, [this].concat(a)); return this; };
  P.remove = function () { this._n.forEach(function (n) { n.remove(); }); return this; };

  /* 눈금 간격 — d3-array tickIncrement와 같은 규칙 */
  var e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
  function tickSpec(a, b, n) {
    var step = (b - a) / Math.max(0, n), power = Math.floor(Math.log10(step)), err = step / Math.pow(10, power);
    var f = err >= e10 ? 10 : err >= e5 ? 5 : err >= e2 ? 2 : 1, i1, i2, inc;
    if (power < 0) { inc = Math.pow(10, -power) / f; i1 = Math.round(a * inc); i2 = Math.round(b * inc); if (i1 / inc < a) ++i1; if (i2 / inc > b) --i2; inc = -inc; }
    else { inc = Math.pow(10, power) * f; i1 = Math.round(a / inc); i2 = Math.round(b / inc); if (i1 * inc < a) ++i1; if (i2 * inc > b) --i2; }
    if (i2 < i1 && 0.5 <= n && n < 2) return tickSpec(a, b, n * 2);
    return [i1, i2, inc];
  }
  function ticks(a, b, n) {
    if (!(n > 0)) return []; if (a === b) return [a];
    var rev = b < a; if (rev) { var t = a; a = b; b = t; }
    var s = tickSpec(a, b, n), i1 = s[0], i2 = s[1], inc = s[2], m = i2 - i1 + 1, out = [];
    if (!(i2 >= i1)) return out;
    for (var i = 0; i < m; i++) out.push(inc < 0 ? (i1 + i) / -inc : (i1 + i) * inc);
    return rev ? out.reverse() : out;
  }
  function tickIncrement(a, b, n) { return tickSpec(a, b, n)[2]; }

  function scaleLinear(dom, rng) {
    var d = (dom || [0, 1]).slice(), r = (rng || [0, 1]).slice();
    function s(v) { var t = d[1] === d[0] ? 0.5 : (v - d[0]) / (d[1] - d[0]); return r[0] * (1 - t) + r[1] * t; }
    s.domain = function (x) { if (!arguments.length) return d.slice(); d = x.slice(); return s; };
    s.range = function (x) { if (!arguments.length) return r.slice(); r = x.slice(); return s; };
    s.ticks = function (n) { return ticks(d[0], d[d.length - 1], n == null ? 10 : n); };
    s.nice = function (n) {
      n = n == null ? 10 : n; var i0 = 0, i1 = d.length - 1, start = d[i0], stop = d[i1], pre, step, k = 10;
      if (stop < start) { step = start; start = stop; stop = step; step = i0; i0 = i1; i1 = step; }
      while (k-- > 0) {
        step = tickIncrement(start, stop, n);
        if (step === pre) { d[i0] = start; d[i1] = stop; return s; }
        else if (step > 0) { start = Math.floor(start / step) * step; stop = Math.ceil(stop / step) * step; }
        else if (step < 0) { start = Math.ceil(start * step) / step; stop = Math.floor(stop * step) / step; }
        else break;
        pre = step;
      }
      return s;
    };
    s.copy = function () { return scaleLinear(d, r); };
    return s;
  }

  function each(arr, f, pick) { var best; (arr || []).forEach(function (x, i) { var v = f ? f(x, i, arr) : x; if (v != null && v === v && (best === undefined || pick(v, best))) best = +v; }); return best; }
  function max(arr, f) { return each(arr, f, function (a, b) { return a > b; }); }
  function min(arr, f) { return each(arr, f, function (a, b) { return a < b; }); }

  /* 축 — d3-axis와 같은 모양(눈금선·글자 위치·0.5px 맞춤) */
  function fmtFor(sc, n) {
    var dm = sc.domain(), step = Math.abs(tickIncrement(dm[0], dm[dm.length - 1], n == null ? 10 : n));
    var p = Math.max(0, -Math.floor(Math.log10(step)) || 0);
    return function (v) { return (+v).toLocaleString('en-US', { minimumFractionDigits: p, maximumFractionDigits: p }).replace('-', '−'); };
  }
  function axis(orient, sc) {
    var n = null, inner = 6, outer = 6, pad = 3, k = orient === 'left' ? -1 : 1, x = orient === 'left' ? 'y' : 'x';
    function a(sel) {
      var vals = sc.ticks(n == null ? 10 : n), fmt = fmtFor(sc, n), sp = Math.max(inner, 0) + pad, r = sc.range();
      var off = (typeof window !== 'undefined' && window.devicePixelRatio > 1) ? 0 : 0.5;
      sel.each(function () {
        var g = this; g.setAttribute('fill', 'none'); g.setAttribute('font-size', 10); g.setAttribute('font-family', 'sans-serif');
        g.setAttribute('text-anchor', orient === 'left' ? 'end' : 'middle');
        var dp = document.createElementNS(SVGNS, 'path'); dp.setAttribute('class', 'domain'); dp.setAttribute('stroke', 'currentColor');
        var r0 = +r[0] + off, r1 = +r[r.length - 1] + off;
        dp.setAttribute('d', orient === 'left' ? 'M' + (k * outer) + ',' + r0 + 'H' + off + 'V' + r1 + 'H' + (k * outer) : 'M' + r0 + ',' + (k * outer) + 'V' + off + 'H' + r1 + 'V' + (k * outer));
        g.appendChild(dp);
        vals.forEach(function (v) {
          var t = document.createElementNS(SVGNS, 'g'); t.setAttribute('class', 'tick'); t.setAttribute('opacity', 1);
          var p = sc(v) + off; t.setAttribute('transform', orient === 'left' ? 'translate(0,' + p + ')' : 'translate(' + p + ',0)');
          var ln = document.createElementNS(SVGNS, 'line'); ln.setAttribute('stroke', 'currentColor'); ln.setAttribute(x === 'x' ? 'y2' : 'x2', k * inner);
          var tx = document.createElementNS(SVGNS, 'text'); tx.setAttribute('fill', 'currentColor'); tx.setAttribute(x === 'x' ? 'y' : 'x', k * sp);
          tx.setAttribute('dy', orient === 'left' ? '0.32em' : '0.71em'); tx.textContent = fmt(v);
          t.appendChild(ln); t.appendChild(tx); g.appendChild(t);
        });
      });
    }
    a.ticks = function (x) { n = x; return a; };
    a.tickSize = function (x) { inner = outer = +x; return a; };
    a.tickSizeInner = function (x) { inner = +x; return a; };
    a.tickSizeOuter = function (x) { outer = +x; return a; };
    a.tickPadding = function (x) { pad = +x; return a; };
    return a;
  }

  /* 기호 — d3-shape symbol·symbolStar와 같은 경로 */
  var ka = 0.8908130915292852, kr = Math.sin(Math.PI / 10) / Math.sin(7 * Math.PI / 10), kx = Math.sin(2 * Math.PI / 10) * kr, ky = -Math.cos(2 * Math.PI / 10) * kr;
  var symbolStar = { draw: function (c, size) {
    var r = Math.sqrt(size * ka), x = kx * r, y = ky * r; c.moveTo(0, -r); c.lineTo(x, y);
    for (var i = 1; i < 5; ++i) { var a = 2 * Math.PI * i / 5, co = Math.cos(a), si = Math.sin(a); c.lineTo(si * r, -co * r); c.lineTo(co * x - si * y, si * x + co * y); }
    c.closePath(); } };
  function r5(v) { return Math.round(v * 1e5) / 1e5; }
  function symbol(type, size) {
    return function () {
      var s = ''; var ctx = { moveTo: function (x, y) { s += 'M' + r5(x) + ',' + r5(y); }, lineTo: function (x, y) { s += 'L' + r5(x) + ',' + r5(y); }, closePath: function () { s += 'Z'; } };
      (type || symbolStar).draw(ctx, typeof size === 'function' ? size.apply(this, arguments) : (size == null ? 64 : size)); return s;
    };
  }

  window.d3 = {
    lite: true,
    select: function (x) { return new Sel([typeof x === 'string' ? document.querySelector(x) : x].filter(Boolean)); },
    selectAll: function (s) { return new Sel([].slice.call(document.querySelectorAll(s))); },
    scaleLinear: scaleLinear, max: max, min: min, ticks: ticks, tickIncrement: tickIncrement,
    axisBottom: function (sc) { return axis('bottom', sc); }, axisLeft: function (sc) { return axis('left', sc); },
    symbol: symbol, symbolStar: symbolStar
  };
})();

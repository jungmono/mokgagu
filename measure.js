/* 실측도 · 사람 옆에 — 기물 사진 창(dialog)에 단추 두 개를 붙인다.
   - 「실측도」  도록 치수(가로·세로·높이)로 정면도·측면도를 그린다. 소장 기물(기준)을 빨간 점선으로 겹쳐 볼 수 있다.
   - 「사람 옆에」 같은 눈금에 사람과 기물을 나란히 세워 실물 크기를 느끼게 한다.
   - 치수를 읽을 수 없으면(없음·순서 미확인·여러 부재) 단추를 붙이지 않는다. 비교하기·비례 자와 같은 읽기(긴 쪽=가로)를 쓴다.
   - 안쪽 문·서랍 선은 종류별 일반형이다. 바깥 치수만 도록 값 그대로.
   comments.js 가 불러온다(zoom.js 와 같은 방식). 사진 창 모양이 두 가지(#dlg-dim 형 / #d-info 형)라 둘 다 지켜본다. */
(function () {
  if (window.MOKGAGU_MEASURE) return; window.MOKGAGU_MEASURE = 1;

  /* ───── 치수 읽기 (compare.html 의 dims0 와 같은 규칙) ───── */
  function parse(text) {
    var sz = String(text == null ? '' : text).replace(/cm|㎝/g, '').replace(/\s+/g, ' ');
    if (!sz.trim() || /순서 미확인|[①②③]/.test(sz)) return null;
    var tri = sz.match(/(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/g) || [];
    if (tri.length > 1 || (sz.match(/높이/g) || []).length > 1) return null;      /* 한 쌍·여러 부재 */
    var m = sz.match(/^\s*(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/), o;
    if (m) o = pair(+m[1], +m[2], +m[3]);
    else {
      var m2 = sz.match(/높이\s*(\d+(?:\.\d+)?)\s*[·,/]?\s*(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/);
      if (m2) o = pair(+m2[2], +m2[3], +m2[1]);
      else {
        var h = sz.match(/높이\s*(\d+(?:\.\d+)?)/), dia = sz.match(/(?:지름|직경)\s*(\d+(?:\.\d+)?)/);
        if (dia && h) o = { w: +dia[1], d: +dia[1], h: +h[1], round: 1 };
        else if (!h) return null;
        else {
          var hs = [], re = /(?:가로|세로|너비|길이|옆너비|깊이|폭)\s*(\d+(?:\.\d+)?)/g, x;
          while ((x = re.exec(sz))) hs.push(+x[1]);
          if (!hs.length) return null;
          if (hs.length === 1) o = { w: hs[0], d: null, h: +h[1] };
          else if (hs.length > 2) return null;
          else o = pair(hs[0], hs[1], +h[1]);
        }
      }
    }
    if (!o || !(o.w >= 2 && o.h >= 1) || o.w > 400 || o.h > 400) return null;
    return o;
  }
  function pair(x, y, h) { return { w: Math.max(x, y), d: Math.min(x, y), h: h }; }

  /* ───── 종류 알아보기 ───── */
  function kindOf(s) {
    s = String(s || '');
    if (/약장|약궤|약상자|약탕/.test(s) && !/약수|약주/.test(s)) return { k: 'yakjang', ref: 'b', label: '약장' };
    if (/사방탁자|탁자|찬탁/.test(s) && !/상탁/.test(s)) return { k: 'shelf', ref: 'a', label: '탁자' };
    if (/반닫이|궤(?!장)|책궤|괘궤/.test(s)) return { k: 'bandaji', ref: 'b', label: '반닫이' };
    if (/삼층|사층|오층|층장|층농|이층|다층/.test(s)) {
      var n = /오층/.test(s) ? 5 : /사층/.test(s) ? 4 : /삼층/.test(s) ? 3 : 2;
      return { k: 'tier', n: n, ref: 'b', label: '층장·농' };
    }
    if (/뒤주|함|상자|갑(?=\s|$)|합(?=\s|$)|문갑/.test(s) && !/반상|밥상/.test(s)) return /문갑/.test(s) ? { k: 'cab', ref: 'b', label: '문갑' } : { k: 'box', ref: 'b', label: '함·상자' };
    if (/농|장롱|의걸이|찬장|책장|궤장|머릿장|주방장|장(?=\s|$)/.test(s) && !/장식|연장|화장|병장|장도/.test(s)) return { k: 'cab', ref: 'b', label: '장·책장' };
    if (/서안|연상|안궤|궤안|책상|서탁/.test(s)) return { k: 'seoan', ref: 'a', label: '서안' };
    if (/경상|사각상|탁상|평상/.test(s)) return { k: 'gyeong', ref: 'a', label: '경상' };
    if (/소반|반상|밥상|교자상|주안상|다과상|제사상|상(?=\s|$)/.test(s)) return { k: 'soban', ref: 'a', label: '소반·상' };
    if (/항아리|병(?=\s|$)|매병|호(?=\s|$)|사발|대접|접시|잔|주전자|연적|화병|청자|백자|분청|옹기|단지|자기|그릇|뚝배기/.test(s)) return { k: 'pot', ref: '', label: '도자기' };
    return { k: 'generic', ref: '', label: '' };
  }
  var REF = {
    a: { name: '소장 안궤', w: 72.3, d: 33, h: 44.2, k: 'angwe' },
    b: { name: '소장 언양 반닫이', w: 102.5, d: 49.8, h: 58.4, k: 'bandaji' }
  };

  /* ───── 정면 선화: 단위 cm, y 는 바닥에서 위로. R=사각형[x,y,w,h], L=선[x1,y1,x2,y2] ───── */
  function front(k, W, H, n) {
    var R = [], L = [], t, foot, post, i;
    if (k === 'bandaji') {   /* 앞닫이: 기둥 없이 판재 앞면, 위쪽 문판이 아래로 열린다. 천판 + 판재 몸 + 귀틀 + 짧은 발 두 개 */
      t = Math.min(3.6, H * .07); foot = Math.min(7, H * .12); var gt = Math.min(4.5, H * .08), bd = H - foot - t, fx = W * .05, fw = Math.min(8, W * .09);
      R.push([-.8, H - t, W + 1.6, t]); R.push([0, foot, W, bd]); R.push([fx, 0, fw, foot]); R.push([W - fx - fw, 0, fw, foot]);
      L.push([0, foot + bd * .46, W, foot + bd * .46]);   /* 문판 이음 */
      L.push([0, foot + gt, W, foot + gt]);                 /* 귀틀 윗선 */
    } else if (k === 'angwe') {   /* 정대영 선생님 메모 치수 */
      var sd = 1.5, inn = 55, ow = inn + 2 * sd, ox = (W - ow) / 2, top = 1.5;
      R.push([0, H - top, W, top]); R.push([ox, 0, sd, H - top]); R.push([ox + ow - sd, 0, sd, H - top]);
      var y = H - top, dw = 25.5, dv = 1.4, dh = 5.4, dx = ox + sd + (inn - (2 * dw + dv)) / 2;
      R.push([dx, y - dh, dw, dh]); R.push([dx + dw + dv, y - dh, dw, dh]); y -= dh + .4;
      R.push([ox + sd, y - 1.6, inn, 1.6]); y -= 1.6; R.push([ox + sd + (inn - 52) / 2, y - 5.5, 52, 5.5]); y -= 5.5 + .3;
      R.push([ox + sd, y - 1.6, inn, 1.6]); R.push([ox + sd, 11, inn, 1.6]);
    } else if (k === 'tier') {
      n = n || 3; t = Math.min(3, H * .03); foot = Math.min(10, H * .06); post = Math.min(5, W * .05);
      var body = H - foot, sec = body / n;
      R.push([0, foot, W, body]); R.push([-1.2, H - t, W + 2.4, t]);
      for (i = 1; i < n; i++) L.push([0, foot + sec * i, W, foot + sec * i]);
      for (i = 0; i < n; i++) { var y0 = foot + sec * i + Math.min(4, sec * .12), hh = sec - 2 * Math.min(4, sec * .12); R.push([W * .2, y0, W * .28, hh]); R.push([W * .52, y0, W * .28, hh]); }
      R.push([0, 0, post, foot]); R.push([W - post, 0, post, foot]);
    } else if (k === 'cab') {
      foot = Math.min(8, H * .1); t = Math.min(2.5, H * .05); var drw = (H - foot) * .16;
      R.push([0, foot, W, H - foot]); R.push([0, 0, Math.min(5, W * .06), foot]); R.push([W - Math.min(5, W * .06), 0, Math.min(5, W * .06), foot]);
      L.push([0, foot + drw, W, foot + drw]); L.push([W / 2, foot + drw, W / 2, H]);
      R.push([W * .06, foot + drw + 3, W * .38, H - foot - drw - 6]); R.push([W * .56, foot + drw + 3, W * .38, H - foot - drw - 6]);
      L.push([W * .25, foot + 2, W * .75, foot + 2]);
    } else if (k === 'yakjang') {
      foot = Math.min(8, H * .08); var cols = Math.max(3, Math.min(9, Math.round(W / 9))), rows = Math.max(3, Math.min(9, Math.round((H - foot) / 9)));
      var m = Math.min(2, W * .03), cw = (W - 2 * m) / cols, ch = (H - foot - 2 * m) / rows;
      R.push([0, foot, W, H - foot]); R.push([0, 0, Math.min(5, W * .07), foot]); R.push([W - Math.min(5, W * .07), 0, Math.min(5, W * .07), foot]);
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) R.push([m + c * cw + .6, foot + m + r * ch + .6, cw - 1.2, ch - 1.2]);
    } else if (k === 'shelf') {
      var p = Math.min(3.4, W * .07), sh = H > 90 ? 4 : H > 55 ? 3 : 2, th = Math.min(2.2, H * .04);
      R.push([0, 0, p, H]); R.push([W - p, 0, p, H]);
      for (i = 0; i <= sh; i++) { var yy = i === 0 ? 0 : (i === sh ? H - th : (H - th) * i / sh); R.push([p, yy, W - 2 * p, th]); }
    } else if (k === 'soban') {
      t = Math.min(3, H * .1); var ap = Math.min(5, H * .15);
      R.push([0, H - t, W, t]); R.push([W * .06, H - t - ap, W * .88, ap]);
      L.push([W * .1, H - t - ap, W * .1, 0], [W * .9, H - t - ap, W * .9, 0], [W * .14, H - t - ap, W * .14, 0], [W * .86, H - t - ap, W * .86, 0]);
      L.push([W * .1, H * .2, W * .9, H * .2]);
    } else if (k === 'gyeong') {   /* 경상: 판 + 양쪽 귀(말림) + 판다리 두 개 */
      t = Math.min(3, H * .08); var lw = Math.min(5, W * .08);
      R.push([0, H - t, W, t]); R.push([-2.5, H - t - .4, 3, t + 2.4]); R.push([W - .5, H - t - .4, 3, t + 2.4]);
      R.push([W * .1, 0, lw, H - t]); R.push([W - W * .1 - lw, 0, lw, H - t]);
      L.push([W * .1 + lw, H - t - Math.min(4, H * .1), W - W * .1 - lw, H - t - Math.min(4, H * .1)]);
    } else if (k === 'seoan') {
      t = Math.min(2.5, H * .06); var sw = Math.min(3, W * .06);
      R.push([-1.5, H - t, W + 3, t]); R.push([W * .08, 0, sw, H - t]); R.push([W - W * .08 - sw, 0, sw, H - t]);
      L.push([W * .08 + sw, H * .22, W - W * .08 - sw, H * .22]);
    } else if (k === 'box') {
      R.push([0, 0, W, H]); L.push([0, H * .8, W, H * .8]);
    } else {   /* generic */
      R.push([0, 0, W, H]);
    }
    return { R: R, L: L };
  }
  function sideView(k, D, H) {
    var R = [], L = [];
    if (k === 'angwe' || k === 'seoan') { var sd = Math.min(31.2, D * .94); R.push([0, H - 1.5, D, 1.5]); R.push([(D - sd) / 2, 0, sd, H - 1.5]); }
    else if (k === 'soban' || k === 'gyeong') { R.push([0, 0, D, H]); L.push([0, H * .86, D, H * .86]); }
    else if (k === 'shelf') { R.push([0, 0, D, H]); }
    else if (k === 'bandaji') { var tt = Math.min(3.6, H * .07), ft = Math.min(7, H * .12), fd = Math.min(7, D * .12); R.push([-.8, H - tt, D + 1.6, tt]); R.push([0, ft, D, H - ft - tt]); R.push([D * .05, 0, fd, ft]); R.push([D - D * .05 - fd, 0, fd, ft]); }
    else { var foot = (k === 'box' || k === 'generic') ? 0 : Math.min(8, H * .12); R.push([0, foot, D, H - foot]); if (foot) { R.push([0, 0, Math.min(5, D * .12), foot]); R.push([D - Math.min(5, D * .12), 0, Math.min(5, D * .12), foot]); } }
    return { R: R, L: L };
  }
  function potPath(W, H) {   /* 항아리·병 같은 둥근 그릇의 옆모습 (대칭) */
    var r = W / 2, cx = r, nk = r * .55, bs = r * .62;
    return 'M' + (cx - bs) + ' 0 C' + (cx - r * 1.04) + ' ' + H * .2 + ' ' + (cx - r * 1.04) + ' ' + H * .62 + ' ' + (cx - nk) + ' ' + H * .86 +
      ' L' + (cx - nk * .85) + ' ' + H + ' L' + (cx + nk * .85) + ' ' + H + ' L' + (cx + nk) + ' ' + H * .86 +
      ' C' + (cx + r * 1.04) + ' ' + H * .62 + ' ' + (cx + r * 1.04) + ' ' + H * .2 + ' ' + (cx + bs) + ' 0 Z';
  }

  /* ───── 그리기 ───── */
  function fmt(n) { return String(Math.round(n * 10) / 10); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var AR = '<defs><marker id="mzar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 2L10 5L0 8z" fill="#555"/></marker></defs>';
  function dimLine(x1, y1, x2, y2, t, vert) {
    var s = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#555" stroke-width=".9" marker-start="url(#mzar)" marker-end="url(#mzar)"/>';
    if (vert) { var cx = x1 - 7, cy = (y1 + y2) / 2; return s + '<text x="' + cx + '" y="' + cy + '" font-size="13" text-anchor="middle" fill="#111" transform="rotate(-90 ' + cx + ' ' + cy + ')">' + t + '</text>'; }
    return s + '<text x="' + (x1 + x2) / 2 + '" y="' + (y1 + 17) + '" font-size="13" text-anchor="middle" fill="#111">' + t + '</text>';
  }
  function rects(list, X, Y, s, ox, col, w, fill) {
    return list.map(function (r) { return '<rect x="' + X(ox + r[0]) + '" y="' + Y(r[1] + r[3]) + '" width="' + Math.max(.5, r[2] * s) + '" height="' + Math.max(.5, r[3] * s) + '" fill="' + (fill || 'none') + '" stroke="' + col + '" stroke-width="' + w + '"/>'; }).join('');
  }
  function lines(list, X, Y, ox, col, w) {
    return list.map(function (l) { return '<line x1="' + X(ox + l[0]) + '" y1="' + Y(l[1]) + '" x2="' + X(ox + l[2]) + '" y2="' + Y(l[3]) + '" stroke="' + col + '" stroke-width="' + w + '"/>'; }).join('');
  }

  /* 실측도: 정면도 + 측면도 */
  function drawPlan(o, kd, withRef, VW, maxPx) {
    var ref = withRef && kd.ref ? REF[kd.ref] : null, red = '#c0392b';
    var fw = Math.max(o.w, ref ? ref.w : 0), sw = Math.max(o.d, ref ? ref.d : 0), hh = Math.max(o.h, ref ? ref.h : 0);
    var L = 46, Rm = 14, T = 26, B = 62, gapPx = 34, TV = 40;
    var s = Math.min((VW - L - Rm - gapPx) / (fw + sw), (maxPx - T - B) / hh);
    var gap = gapPx / s, VH0 = Math.round(hh * s + T + B), Y0 = VH0 - B, X = function (x) { return L + x * s; }, Y = function (y) { return Y0 - y * s; };
    var sx = fw + gap, f = front(kd.k, o.w, o.h, kd.n), sd = sideView(kd.k, o.d, o.h), g = '', td = Math.max(o.d, ref ? ref.d : 0), VH = Math.round(VH0 + TV + td * s + 34), YT = VH0 + 4 + TV - 14;
    g += '<svg xmlns="http://www.w3.org/2000/svg" width="' + VW + '" height="' + VH + '" viewBox="0 0 ' + VW + ' ' + VH + '" font-family="Noto Sans KR,sans-serif" role="img" aria-label="' + esc(o.name) + ' 실측도">' + AR;
    g += '<line x1="' + X(-6) + '" y1="' + Y0 + '" x2="' + X(sx + sw + 6) + '" y2="' + Y0 + '" stroke="#bbb" stroke-dasharray="3 3"/>';
    g += rects(f.R, X, Y, s, 0, '#111', 1.3) + lines(f.L, X, Y, 0, '#111', 1);
    g += rects(sd.R, X, Y, s, sx, '#111', 1.3) + lines(sd.L, X, Y, sx, '#111', 1);
    if (ref) {
      g += '<rect x="' + X(0) + '" y="' + Y(ref.h) + '" width="' + ref.w * s + '" height="' + ref.h * s + '" fill="none" stroke="' + red + '" stroke-width="1.6" stroke-dasharray="6 4"/>';
      g += '<rect x="' + X(sx) + '" y="' + Y(ref.h) + '" width="' + ref.d * s + '" height="' + ref.h * s + '" fill="none" stroke="' + red + '" stroke-width="1.6" stroke-dasharray="6 4"/>';
      g += '<text x="' + X(0) + '" y="' + (VH0 - 8) + '" font-size="11.5" fill="' + red + '" font-weight="700">빨강 점선 = ' + ref.name + ' ' + fmt(ref.w) + '×' + fmt(ref.d) + '×' + fmt(ref.h) + '</text>';
    }
    g += dimLine(X(0), Y0 + 12, X(o.w), Y0 + 12, '가로 ' + fmt(o.w));
    g += dimLine(X(sx), Y0 + 12, X(sx + o.d), Y0 + 12, '세로 ' + fmt(o.d));
    g += dimLine(X(0) - 24, Y(o.h), X(0) - 24, Y0, '높이 ' + fmt(o.h), true);
    g += '<text x="' + X(fw / 2) + '" y="' + (T - 9) + '" text-anchor="middle" font-size="12" fill="#888">정면도</text><text x="' + X(sx + sw / 2) + '" y="' + (T - 9) + '" text-anchor="middle" font-size="12" fill="#888">측면도</text>';
    /* 윗면(상판): 가운데 정렬 */
    var xc = (X(0) + X(sx + sw)) / 2, TX = xc - Math.max(o.w, ref && !ref.round ? ref.w : 0) * s / 2;
    g += '<line x1="' + X(-6) + '" y1="' + (VH0 + 2) + '" x2="' + X(sx + sw + 6) + '" y2="' + (VH0 + 2) + '" stroke="#ddd"/><text x="' + xc + '" y="' + (VH0 + 22) + '" text-anchor="middle" font-size="12" fill="#888">윗면(상판)</text>';
    if (ref) g += ref.round ? '' : '<rect x="' + TX + '" y="' + YT + '" width="' + ref.w * s + '" height="' + ref.d * s + '" fill="none" stroke="' + red + '" stroke-width="1.6" stroke-dasharray="6 4"/>';
    if (o.round) g += '<ellipse cx="' + (TX + o.w * s / 2) + '" cy="' + (YT + o.d * s / 2) + '" rx="' + o.w * s / 2 + '" ry="' + o.d * s / 2 + '" fill="#f6f3ec" stroke="#111" stroke-width="1.3"/>';
    else {
      g += '<rect x="' + TX + '" y="' + YT + '" width="' + o.w * s + '" height="' + o.d * s + '" fill="#f6f3ec" stroke="#111" stroke-width="1.3"/>';
      var ins = Math.min(1.8, o.w * .06, o.d * .1) * s;
      g += '<rect x="' + (TX + ins) + '" y="' + (YT + ins) + '" width="' + Math.max(0, o.w * s - 2 * ins) + '" height="' + Math.max(0, o.d * s - 2 * ins) + '" fill="none" stroke="#111" stroke-width=".8"/>';
    }
    g += dimLine(TX, YT + td * s + 14, (TX + o.w * s), YT + td * s + 14, '가로 ' + fmt(o.w));
    g += dimLine(TX - 24, YT, TX - 24, YT + o.d * s, '세로 ' + fmt(o.d), true);
    var bar = 10 * s;
    g += '<g transform="translate(' + (VW - Rm - bar) + ',' + (VH0 - 24) + ')"><rect width="' + bar + '" height="4" fill="#111"/><text x="' + bar / 2 + '" y="16" font-size="10.5" text-anchor="middle" fill="#555">10cm</text></g>';
    return g + '</svg>';
  }

  /* 사람 */
  function person(x0, Y, s, H, sit) {
    var c = '#9a9488', hr = H * .062, hy, sh, hip, w, lap;
    if (!sit) {
      hy = H - hr; sh = H * .82; hip = H * .52; w = H * .13;
      return '<g fill="' + c + '"><circle cx="' + x0 + '" cy="' + Y(hy) + '" r="' + hr * s + '"/>' +
        '<path d="M' + (x0 - w * s) + ' ' + Y(sh) + ' Q' + x0 + ' ' + Y(sh + H * .03) + ' ' + (x0 + w * s) + ' ' + Y(sh) + ' L' + (x0 + w * .8 * s) + ' ' + Y(hip) + ' L' + (x0 - w * .8 * s) + ' ' + Y(hip) + 'Z"/>' +
        '<path d="M' + (x0 - w * .75 * s) + ' ' + Y(hip) + ' L' + (x0 - .5 * s) + ' ' + Y(hip) + ' L' + (x0 - 1.5 * s) + ' ' + Y(0) + ' L' + (x0 - w * .7 * s) + ' ' + Y(0) + 'Z"/>' +
        '<path d="M' + (x0 + .5 * s) + ' ' + Y(hip) + ' L' + (x0 + w * .75 * s) + ' ' + Y(hip) + ' L' + (x0 + w * .7 * s) + ' ' + Y(0) + ' L' + (x0 + 1.5 * s) + ' ' + Y(0) + 'Z"/>' +
        '<path d="M' + (x0 - w * s) + ' ' + Y(sh) + ' L' + (x0 - (w + 3) * s) + ' ' + Y(sh - 3) + ' L' + (x0 - (w + 5) * s) + ' ' + Y(hip - 2) + ' L' + (x0 - (w + 1) * s) + ' ' + Y(hip - 2) + ' L' + (x0 - (w - 1) * s) + ' ' + Y(sh - 8) + 'Z"/>' +
        '<path d="M' + (x0 + w * s) + ' ' + Y(sh) + ' L' + (x0 + (w + 3) * s) + ' ' + Y(sh - 3) + ' L' + (x0 + (w + 5) * s) + ' ' + Y(hip - 2) + ' L' + (x0 + (w + 1) * s) + ' ' + Y(hip - 2) + ' L' + (x0 + (w - 1) * s) + ' ' + Y(sh - 8) + 'Z"/></g>';
    }
    var sitH = H * .52; hy = sitH - hr; sh = sitH * .68; w = H * .13; lap = H * .12;
    return '<g fill="' + c + '"><circle cx="' + x0 + '" cy="' + Y(hy) + '" r="' + hr * s + '"/>' +
      '<path d="M' + (x0 - w * s) + ' ' + Y(sh) + ' Q' + x0 + ' ' + Y(sh + H * .03) + ' ' + (x0 + w * s) + ' ' + Y(sh) + ' L' + (x0 + w * .85 * s) + ' ' + Y(lap) + ' L' + (x0 - w * .85 * s) + ' ' + Y(lap) + 'Z"/>' +
      '<path d="M' + (x0 - H * .27 * s) + ' ' + Y(0) + ' Q' + (x0 - H * .27 * s) + ' ' + Y(lap + 2) + ' ' + (x0 - w * s) + ' ' + Y(lap + 2) + ' L' + (x0 + w * s) + ' ' + Y(lap + 2) + ' Q' + (x0 + H * .27 * s) + ' ' + Y(lap + 2) + ' ' + (x0 + H * .27 * s) + ' ' + Y(0) + 'Z"/></g>';
  }

  /* 사람 옆에: 정면도들을 같은 바닥선·같은 눈금에 */
  function drawPerson(o, kd, withRef, H, sit, VW, maxPx) {
    var items = [{ name: o.name, w: o.w, h: o.h, k: kd.k, n: kd.n, col: '#111', round: o.round }];
    if (withRef && kd.ref) { var r = REF[kd.ref]; items.push({ name: r.name, w: r.w, h: r.h, k: r.k, col: '#c0392b' }); }
    var pw = sit ? H * .56 : H * .36, gap = 12, pad = 14;
    var tot = pw + items.reduce(function (a, it) { return a + it.w + gap; }, gap);
    var maxH = Math.max(sit ? H * .55 : H, Math.max.apply(null, items.map(function (it) { return it.h; })));
    var T = 24, B = 40, s = Math.min((VW - 2 * pad) / tot, (maxPx - T - B) / maxH), VH = Math.round(maxH * s + T + B), Y0 = VH - B;
    var X = function (x) { return pad + x * s; }, Y = function (y) { return Y0 - y * s; }, step = s * 10 >= 16 ? 10 : s * 20 >= 16 ? 20 : 50, lab = step === 10 ? 50 : 100;
    var g = '<svg xmlns="http://www.w3.org/2000/svg" width="' + VW + '" height="' + VH + '" viewBox="0 0 ' + VW + ' ' + VH + '" font-family="Noto Sans KR,sans-serif" role="img" aria-label="사람 옆에 놓은 ' + esc(o.name) + '">';
    for (var v = step; v <= maxH + 4; v += step) g += '<line x1="' + pad + '" y1="' + Y(v) + '" x2="' + (VW - pad) + '" y2="' + Y(v) + '" stroke="' + (v % lab ? '#eee' : '#d6d6d6') + '"/>' + (v % lab ? '' : '<text x="' + (VW - pad - 2) + '" y="' + (Y(v) - 3) + '" text-anchor="end" font-size="10" fill="#999">' + v + 'cm</text>');
    g += '<line x1="' + pad + '" y1="' + Y0 + '" x2="' + (VW - pad) + '" y2="' + Y0 + '" stroke="#111" stroke-width="1.5"/>';
    g += person(X(pw / 2), Y, s, H, sit);
    g += '<text x="' + X(pw / 2) + '" y="' + (Y0 + 16) + '" text-anchor="middle" font-size="12" fill="#555">' + (sit ? '앉은 사람' : '사람') + ' ' + H + '</text>';
    var x = pw + gap;
    items.forEach(function (it) {
      if (it.round || kd.k === 'pot') g += '<g transform="translate(' + X(x) + ',' + Y0 + ') scale(' + s + ',' + -s + ')"><path d="' + potPath(it.w, it.h) + '" fill="rgba(255,255,255,.9)" stroke="' + it.col + '" stroke-width="' + 1.3 / s + '"/></g>';
      else { var f = front(it.k, it.w, it.h, it.n); g += rects(f.R, X, Y, s, x, it.col, 1.2, 'rgba(255,255,255,.85)') + lines(f.L, X, Y, x, it.col, .9); }
      g += '<text x="' + X(x + it.w / 2) + '" y="' + (Y(it.h) - 6) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + it.col + '">' + fmt(it.h) + '</text>';
      g += '<text x="' + X(x + it.w / 2) + '" y="' + (Y0 + 16) + '" text-anchor="middle" font-size="12" fill="' + it.col + '">' + esc(it.name.length > 10 ? it.name.slice(0, 9) + '…' : it.name) + '</text>';
      x += it.w + gap;
    });
    return g + '</svg>';
  }

  /* ───── 겹창 ───── */
  var css = document.createElement('style');
  css.textContent =
    '.mz-row{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}' +
    '.mz-row .mz-btn{flex:1 1 0;min-width:0;height:48px;min-height:48px;padding:0 4px;display:inline-flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;box-sizing:border-box;line-height:1;text-decoration:none!important;border:1px solid #111!important;background:#fff!important;color:#111!important;font-size:14px;font-weight:700}' +
    '@media (max-width:480px){.mz-row{flex-wrap:nowrap;gap:6px}.mz-row .mz-btn{font-size:13px!important;gap:3px}}' +
    '.mz-row .mz-btn:hover,.mz-row .mz-btn:focus-visible{background:#111!important;color:#fff!important}' +
    '.mz-btn{font:inherit;font-size:14px;font-weight:700;min-height:44px;padding:0 16px;border:1px solid #111;background:#fff;color:#111;border-radius:10px;cursor:pointer}' +
    '.mz-btn:hover,.mz-btn:focus-visible{background:#111;color:#fff}' +
    '#mz-dlg{border:0;padding:0;border-radius:14px;width:min(96vw,880px);max-height:94dvh;background:#fff;color:#111;font-family:"Noto Sans KR",sans-serif;overflow:auto}' +
    '#mz-dlg::backdrop{background:rgba(0,0,0,.55)}' +
    '#mz-dlg .mz-in{padding:14px 14px 16px}' +
    '#mz-dlg .mz-top{display:flex;align-items:flex-start;gap:10px;justify-content:space-between}' +
    '#mz-dlg .mz-t{font-size:16px;line-height:1.4;font-weight:900}#mz-dlg .mz-t small{display:block;font-size:12.5px;font-weight:500;color:#6b6760}' +
    '#mz-dlg .mz-tabs{display:flex;gap:6px;margin:12px 0 8px}' +
    '#mz-dlg .mz-tabs button,#mz-dlg .mz-x,#mz-dlg .mz-seg button{font:inherit;font-size:14px;font-weight:700;min-height:42px;padding:0 14px;border:1px solid #bdb8ae;background:#fff;color:#111;border-radius:10px;cursor:pointer}' +
    '#mz-dlg .mz-tabs button.on,#mz-dlg .mz-seg button.on{background:#111;color:#fff;border-color:#111}' +
    '#mz-dlg .mz-x{flex:none}' +
    '#mz-dlg .mz-opts{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:4px 0 8px;font-size:14px}' +
    '#mz-dlg .mz-opts label{display:inline-flex;gap:6px;align-items:center;min-height:36px}' +
    '#mz-dlg .mz-seg{display:inline-flex;gap:6px}' +
    '#mz-dlg input[type=range]{width:150px;vertical-align:middle;accent-color:#111}' +
    '#mz-dlg input[type=checkbox]{accent-color:#111;width:18px;height:18px}' +
    '#mz-dlg .mz-svg{overflow-x:auto;border:1px solid #e3dfd6;border-radius:10px;background:#fbfaf7;line-height:0}' +
    '#mz-dlg .mz-svg svg{display:block;margin:0 auto}' +
    '#mz-dlg .mz-note{margin:10px 2px 0;font-size:13px;line-height:1.6;color:#6b6760}' +
    '#mz-room{border:0;padding:0;border-radius:14px;width:min(96vw,880px);height:94dvh;max-height:94dvh;background:#fbf6ea;overflow:hidden}#mz-room::backdrop{background:rgba(0,0,0,.55)}' +
    '#mz-room .rb{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;background:#fff;border-bottom:1px solid #e3dfd6;font:900 15px "Noto Sans KR",sans-serif;color:#111;height:54px;box-sizing:border-box}' +
    '#mz-room .rb button{font:inherit;font-size:14px;font-weight:700;min-height:40px;padding:0 16px;border:1px solid #bdb8ae;background:#fff;color:#111;border-radius:10px;cursor:pointer}' +
    '#mz-room iframe{display:block;width:100%;height:calc(100% - 54px);border:0}';
  document.head.appendChild(css);

  var dlg, state = {};
  function build() {
    if (dlg) return;
    dlg = document.createElement('dialog'); dlg.id = 'mz-dlg'; dlg.setAttribute('data-noshare', ''); dlg.setAttribute('aria-label', '실측도·사람 옆에');
    dlg.innerHTML = '<div class="mz-in"><div class="mz-top"><div class="mz-t"></div><button type="button" class="mz-x">닫기</button></div>' +
      '<div class="mz-tabs"><button type="button" data-t="plan">📐 실측도</button><button type="button" data-t="person">🧍 사람 옆에</button></div>' +
      '<div class="mz-opts"></div><div class="mz-svg"></div><p class="mz-note"></p></div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.mz-x').onclick = function () { dlg.close(); };
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('.mz-tabs button').forEach(function (b) { b.onclick = function () { state.tab = b.getAttribute('data-t'); paint(); }; });
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (dlg.open) paint(); }, 150); });
  }
  function getH() { try { var v = +localStorage.getItem('mokgagu_mz_h'); return v >= 140 && v <= 190 ? v : 170; } catch (e) { return 170; } }
  function saveH(v) { try { localStorage.setItem('mokgagu_mz_h', String(v)); } catch (e) {} }

  function paint() {
    var o = state.o, kd = state.kd, host = dlg.querySelector('.mz-svg'), opts = dlg.querySelector('.mz-opts'), note = dlg.querySelector('.mz-note');
    var canPlan = !!(o.d && kd.k !== 'pot' && kd.k !== 'generic' && !o.round);
    if (state.tab === 'plan' && !canPlan) state.tab = 'person';
    dlg.querySelectorAll('.mz-tabs button').forEach(function (b) {
      var t = b.getAttribute('data-t'); b.classList.toggle('on', t === state.tab); b.style.display = (t === 'plan' && !canPlan) ? 'none' : '';
    });
    var vw = Math.max(280, Math.min(840, (host.clientWidth || 340) - 2)), maxPx = Math.max(260, Math.min(560, window.innerHeight * .56));
    var ref = kd.ref ? REF[kd.ref] : null, refTxt = ref ? '<label><input type="checkbox" class="mz-ref"' + (state.ref ? ' checked' : '') + '> ' + ref.name + '</label>' : '';
    if (state.tab === 'plan') {
      opts.innerHTML = refTxt;
      host.innerHTML = drawPlan(o, kd, state.ref, vw, maxPx);
      note.textContent = '바깥 치수(가로·세로·높이)는 도록 값입니다. 가로·세로 가운데 긴 쪽을 가로로 놓았습니다. 안쪽 문·서랍 선은 ' + kd.label + ' 일반형으로 그린 것이라 실제 기물과 다를 수 있습니다.';
    } else {
      var H = state.H;
      opts.innerHTML = '<label>키 <input type="range" class="mz-h" min="140" max="190" step="5" value="' + H + '"> <b class="mz-hv">' + H + '</b>cm</label>' + refTxt;
      host.innerHTML = drawPerson(o, kd, state.ref, H, state.sit, vw, maxPx);
      note.textContent = '사람은 단순한 그림이고 기물은 도록 치수의 정면 모양입니다.' + (kd.k === 'generic' ? ' 이 기물은 모양을 알 수 없어 상자로 그렸습니다.' : '');
      var rg = opts.querySelector('.mz-h'); rg.oninput = function () { state.H = +rg.value; saveH(state.H); opts.querySelector('.mz-hv').textContent = state.H; host.innerHTML = drawPerson(o, kd, state.ref, state.H, state.sit, vw, maxPx); };
    }
    var cb = opts.querySelector('.mz-ref'); if (cb) cb.onchange = function () { state.ref = cb.checked; paint(); };
  }

  function open(ctx, tab) {
    build();
    state = { o: ctx.o, kd: ctx.kd, tab: tab, ref: false, H: getH(), sit: false };
    dlg.querySelector('.mz-t').innerHTML = esc(ctx.o.name) + '<small>가로 ' + fmt(ctx.o.w) + (ctx.o.d ? ' × 세로 ' + fmt(ctx.o.d) : '') + ' × 높이 ' + fmt(ctx.o.h) + ' cm' + (ctx.o.round ? ' (지름)' : '') + '</small>';
    if (!dlg.open) dlg.showModal();
    paint();
  }

  /* ───── 사진 창에서 치수·이름·종류 읽기 ───── */
  function ctxA() {   /* #dlg-dim 형 (이건희 기증품·민속박물관 등 도록 18곳) */
    var dim = document.getElementById('dlg-dim'); if (!dim) return null;
    var nm = (document.getElementById('dlg-name') || {}).textContent || '', kind = (document.getElementById('dlg-kind') || {}).textContent || '';
    return { host: dim.closest('dl'), name: nm.trim(), kind: kind, size: dim.textContent };
  }
  function ctxB() {   /* #d-info 형 (첫 화면·경매·박물관 15곳) */
    var info = document.getElementById('d-info'); if (!info) return null;
    var h3 = info.querySelector('h3'), name = '';
    if (h3) { var c = h3.cloneNode(true); c.querySelectorAll('small').forEach(function (s) { s.remove(); }); name = c.textContent.trim(); }
    var size = null, kind = '', dts = info.querySelectorAll('dt');
    dts.forEach(function (dt) {
      var t = dt.textContent.trim(), dd = dt.nextElementSibling; if (!dd) return;
      if (/^(치수|크기)/.test(t) && size == null) size = dd.textContent;
      if (/^(종류|분류|기종)/.test(t)) kind += ' ' + dd.textContent;
    });
    var badge = info.querySelector('.badge, .cat'); if (badge) kind += ' ' + badge.textContent;
    return { host: info.querySelector('dl'), info: info, name: name, kind: kind, size: size };
  }
  function ctxNow() { return ctxA() || ctxB(); }

  function refresh() {
    var c = ctxNow(); if (!c) return;
    var root = c.info || c.host && c.host.parentNode; if (!root) return;
    root.querySelectorAll('.mz-row').forEach(function (r) { r.remove(); });
    if (c.size == null) return;
    var o = parse(c.size); if (!o) return;
    o.name = c.name || '기물';
    var kd = kindOf(c.name); if (kd.k === 'generic') kd = kindOf(c.name + ' ' + c.kind);
    if (kd.k === 'generic') return;   /* 모양을 모르면 그리지 않는다 */
    var row = document.createElement('div'); row.className = 'mz-row';
    var canPlan = !!(o.d && kd.k !== 'pot' && kd.k !== 'generic' && !o.round);
    if (canPlan) row.innerHTML += '<button type="button" class="mz-btn" data-t="plan">📐 실측도</button>';
    row.innerHTML += '<button type="button" class="mz-btn" data-t="person">🧍 사람 옆에</button>';
    if (o.w && o.d && !o.round) row.innerHTML += '<a class="mz-btn mz-room" href="room.html?n=' + encodeURIComponent(o.name) + '&w=' + o.w + '&d=' + o.d + '&h=' + (o.h || '') + '">🏠 우리 집에 놓기</a>';
    row.addEventListener('click', function (e) { var b = e.target.closest('button.mz-btn'); if (b) open({ o: o, kd: kd }, b.getAttribute('data-t')); });
    if (c.host && c.host.parentNode) c.host.parentNode.insertBefore(row, c.host.nextSibling); else c.info.appendChild(row);
  }

  var tm;
  function later() { clearTimeout(tm); tm = setTimeout(refresh, 0); }
  function start() {
    var a = document.getElementById('dlg-dim'), b = document.getElementById('d-info');
    if (a) new MutationObserver(later).observe(a, { childList: true, characterData: true, subtree: true });
    if (b) new MutationObserver(function () { if (!b.querySelector('.mz-row')) later(); }).observe(b, { childList: true });
    if (a || b) later();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.mz-room'); if (!a) return;
    e.preventDefault();
    var rd = document.getElementById('mz-room');
    if (!rd) {
      rd = document.createElement('dialog'); rd.id = 'mz-room'; rd.setAttribute('data-noshare', ''); rd.setAttribute('aria-label', '우리 집에 놓아 보기');
      rd.innerHTML = '<div class="rb"><span>🏠 우리 집에 놓아 보기</span><button type="button">닫기</button></div><iframe title="우리 집에 놓아 보기"></iframe>';
      rd.querySelector('button').onclick = function () { rd.close(); };
      rd.addEventListener('close', function () { rd.querySelector('iframe').src = 'about:blank'; });
      document.body.appendChild(rd);
    }
    rd.querySelector('iframe').src = a.getAttribute('href') + '&embed=1';
    rd.showModal();
  });
  window.MOKGAGU_MEASURE = { parse: parse, kindOf: kindOf, drawPlan: drawPlan, drawPerson: drawPerson, open: open };
})();

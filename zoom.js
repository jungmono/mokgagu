/* 크게 보기 — 기물 사진 창(dialog)의 사진 오른쪽 위 ⛶ 단추를 누르면 사진만 화면 가득 띄운다.
   - 두 손가락 벌리기 · 마우스 휠 · ＋/－ 로 확대, 확대한 채로 끌어 옮기기, 두 번 톡 = 확대/원래대로
   - 확대하지 않았을 때 좌우로 밀기(또는 ← →) = 같은 목록의 이전·다음 기물 (밑의 사진 창도 함께 넘어간다)
   - ✕ · Esc · 바깥 두 번 누르기 = 원래 사진 창으로
   모든 도록·첫 화면·통계·소장품 페이지에서 쓴다 (comments.js 가 불러옴, 소장품은 직접 불러옴). */
(function () {
  if (window.MOKGAGU_ZOOM) return; window.MOKGAGU_ZOOM = 1;
  var IMG_SEL = '#dlg-img, #d-img, #v-main img, .d-main img, .d-img img';
  var NEXT_SEL = '#dlg-next, #d-next, #v-next', PREV_SEL = '#dlg-prev, #d-prev, #v-prev';
  var css = document.createElement('style');
  css.textContent = [
    '.zv-open{position:absolute;top:8px;right:8px;z-index:6;width:38px;height:38px;border-radius:10px;border:0;background:rgba(17,17,17,.62);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;box-shadow:0 1px 4px rgba(0,0,0,.25)}',
    '.zv-open:hover{background:rgba(17,17,17,.82)}.zv-open svg{width:20px;height:20px;display:block}',
    '#zv{border:0;padding:0;margin:0;max-width:100vw;max-height:100vh;width:100vw;height:100vh;background:#0c0c0c;color:#fff;overflow:hidden}',
    '#zv::backdrop{background:#0c0c0c}',
    '#zv .zv-st{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:none;cursor:zoom-in}',
    '#zv.zoomed .zv-st{cursor:grab}',
    '#zv img{max-width:100vw;max-height:100vh;object-fit:contain;transform-origin:center center;user-select:none;-webkit-user-drag:none;-webkit-touch-callout:none;will-change:transform}',
    '#zv>:not(.zv-st):not(.zv-top):not(.zv-arr):not(.zv-bot):not(.zv-hint){display:none!important}',
    '#zv .zv-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;padding:10px 12px;background:linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,0));z-index:2;font:600 14px "Noto Sans KR",system-ui,sans-serif}',
    '#zv .zv-cap{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px #000}',
    '#zv .zv-cap small{font-weight:500;opacity:.75;margin-left:8px}',
    '#zv button,#zv a.zv-b{font:inherit;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);border-radius:999px;height:38px;min-width:38px;padding:0 12px;cursor:pointer;display:inline-grid;place-items:center;text-decoration:none;font-size:15px}',
    '#zv button:hover,#zv a.zv-b:hover{background:rgba(255,255,255,.24)}',
    '#zv .zv-bot{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:center;gap:8px;padding:12px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.55));z-index:2}',
    '#zv .zv-arr{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:46px;height:64px;border-radius:12px;font-size:28px}',
    '#zv .zv-l{left:10px}#zv .zv-r{right:10px}#zv .zv-arr[disabled]{opacity:.15;cursor:default}',
    '#zv .zv-hint{position:absolute;left:50%;top:60px;transform:translateX(-50%);font:500 13px system-ui,sans-serif;background:rgba(0,0,0,.55);padding:6px 12px;border-radius:999px;opacity:0;transition:opacity .3s;pointer-events:none;z-index:2;white-space:nowrap}',
    '#zv .zv-hint.on{opacity:1}',
    '@media (max-width:600px){#zv .zv-arr{display:none}#zv .zv-bot .zv-pm{display:none}}',
    '@media print{.zv-open{display:none}}'
  ].join('');
  document.head.appendChild(css);
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';

  /* ── 사진 창마다 ⛶ 단추 붙이기 ── */
  function mainImg(d) {
    var im = d.querySelector(IMG_SEL);
    if (im) return im;
    var best = null, bw = 0;
    d.querySelectorAll('img').forEach(function (x) { var w = x.clientWidth * x.clientHeight; if (w > bw && !x.closest('.cm,.lk-bar,[class*=strip]')) { bw = w; best = x; } });
    return best;
  }
  function attach(d) {
    if (d.id === 'zv' || !d.open) return;
    var im = mainImg(d); if (!im) return;
    var box = im.parentElement; if (!box || box.querySelector(':scope > .zv-open')) return;
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'zv-open'; b.title = '크게 보기'; b.setAttribute('aria-label', '사진 크게 보기'); b.innerHTML = ICON;
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); open(d); });
    ['touchstart', 'mousedown', 'pointerdown'].forEach(function (t) { b.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });
    box.appendChild(b);
  }
  function scan() { document.querySelectorAll('dialog[open]').forEach(attach); }
  new MutationObserver(function () { scan(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['open'], subtree: true, childList: true });

  /* ── 전체 화면 보기 ── */
  var zv, st, zi, cap, src = null, sc = 1, tx = 0, ty = 0;
  function build() {
    zv = document.createElement('dialog'); zv.id = 'zv'; zv.setAttribute('aria-label', '사진 크게 보기');
    zv.innerHTML = '<div class="zv-st" id="zv-st"><img id="zv-img" alt="" draggable="false"></div>' +
      '<div class="zv-top"><div class="zv-cap" id="zv-cap"></div><a class="zv-b" id="zv-orig" target="_blank" rel="noopener" title="원본 사진을 새 탭에서">원본</a><button type="button" id="zv-x" aria-label="닫기">✕</button></div>' +
      '<button type="button" class="zv-arr zv-l" id="zv-p" aria-label="이전 기물">‹</button><button type="button" class="zv-arr zv-r" id="zv-n" aria-label="다음 기물">›</button>' +
      '<div class="zv-bot"><button type="button" class="zv-pm" id="zv-zo" aria-label="작게">－</button><button type="button" id="zv-fit">맞춤</button><button type="button" class="zv-pm" id="zv-zi" aria-label="크게">＋</button></div>' +
      '<div class="zv-hint" id="zv-hint">두 손가락으로 벌려 확대 · 좌우로 밀면 다음 기물</div>';
    document.body.appendChild(zv);
    st = zv.querySelector('#zv-st'); zi = zv.querySelector('#zv-img'); cap = zv.querySelector('#zv-cap');
    zv.querySelector('#zv-x').onclick = close;
    zv.querySelector('#zv-p').onclick = function () { step(-1); };
    zv.querySelector('#zv-n').onclick = function () { step(1); };
    zv.querySelector('#zv-zi').onclick = function () { zoomAt(sc * 1.5, innerWidth / 2, innerHeight / 2); apply(true); };
    zv.querySelector('#zv-zo').onclick = function () { zoomAt(sc / 1.5, innerWidth / 2, innerHeight / 2); apply(true); };
    zv.querySelector('#zv-fit').onclick = function () { reset(); apply(true); };
    zv.addEventListener('close', function () { reset(); src = null; });
    zv.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === '+' || e.key === '=') { zoomAt(sc * 1.4, innerWidth / 2, innerHeight / 2); apply(true); }
      else if (e.key === '-') { zoomAt(sc / 1.4, innerWidth / 2, innerHeight / 2); apply(true); }
    });
    gestures();
  }
  function btn(d, sel) { var b = d && d.querySelector(sel); return b || null; }
  function title(d) {
    var h = d.querySelector('#dlg-name, #d-info h3, #v-info h3, .d-info h3, h2, h3');
    var p = d.querySelector('#dlg-pos, #d-pos, #v-pos');
    var t = h ? h.childNodes[0] && h.childNodes[0].nodeType === 3 ? h.childNodes[0].nodeValue : h.textContent : '';
    return '<span>' + esc((t || '').trim()) + '</span>' + (p && p.textContent.trim() ? '<small>' + esc(p.textContent.trim()) + '</small>' : '');
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sync() {
    var im = mainImg(src); if (!im) return;
    var u = im.currentSrc || im.src;
    if (zi.getAttribute('src') !== u) { reset(); apply(false); zi.src = u; }
    zv.querySelector('#zv-orig').href = u;
    cap.innerHTML = title(src);
    var n = btn(src, NEXT_SEL), p = btn(src, PREV_SEL);
    zv.querySelector('#zv-n').disabled = !n || n.disabled; zv.querySelector('#zv-p').disabled = !p || p.disabled;
  }
  var mo = null;
  function open(d) {
    if (!zv) build();
    src = d; sync();
    if (mo) mo.disconnect();
    mo = new MutationObserver(function () { if (zv.open) sync(); });
    mo.observe(d, { subtree: true, attributes: true, attributeFilter: ['src', 'disabled'], childList: true, characterData: true });
    zv.showModal();
    var h = zv.querySelector('#zv-hint'); h.classList.add('on'); setTimeout(function () { h.classList.remove('on'); }, 2200);
  }
  function close() { if (mo) { mo.disconnect(); mo = null; } if (zv && zv.open) zv.close(); }
  var busy = false;
  function step(dir) {
    if (busy || !src) return;
    var b = btn(src, dir > 0 ? NEXT_SEL : PREV_SEL); if (!b || b.disabled) { sw = 0; apply(true); return; }
    busy = true;
    var w = innerWidth * 0.5; sw = -dir * w; apply(true);
    setTimeout(function () { b.click(); reset(); sw = dir * w; apply(false); setTimeout(function () { sync(); requestAnimationFrame(function () { sw = 0; apply(true); busy = false; }); }, 30); }, 180);
  }

  /* ── 확대 · 옮기기 · 넘기기 ── */
  var sw = 0;
  function apply(anim) {
    zi.style.transition = anim ? 'transform .2s ease, opacity .2s ease' : 'none';
    zi.style.transform = 'translate(' + (tx + sw) + 'px,' + ty + 'px) scale(' + sc + ')';
    zi.style.opacity = sw ? String(Math.max(.3, 1 - Math.abs(sw) / 700)) : '';
    zv.classList.toggle('zoomed', sc > 1.01);
  }
  function reset() { sc = 1; tx = 0; ty = 0; sw = 0; }
  function clampPan() {
    var w = zi.clientWidth * sc, h = zi.clientHeight * sc, mx = Math.max(0, (w - innerWidth) / 2), my = Math.max(0, (h - innerHeight) / 2);
    tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
  }
  function zoomAt(ns, cx, cy) {
    ns = Math.max(1, Math.min(8, ns));
    var ox = cx - innerWidth / 2, oy = cy - innerHeight / 2, k = ns / sc;
    tx = (tx - ox) * k + ox; ty = (ty - oy) * k + oy; sc = ns;
    if (sc === 1) { tx = 0; ty = 0; } clampPan();
  }
  function gestures() {
    var pts = {}, mode = 0, x0 = 0, y0 = 0, t0 = 0, px = 0, py = 0, d0 = 0, s0 = 1, lastTap = 0, moved = false;
    function list() { return Object.keys(pts).map(function (k) { return pts[k]; }); }
    st.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button,a')) return;
      st.setPointerCapture(e.pointerId); pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var L = list();
      if (L.length === 2) { mode = 3; d0 = Math.hypot(L[0].x - L[1].x, L[0].y - L[1].y); s0 = sc; return; }
      mode = sc > 1.01 ? 4 : 0; x0 = px = e.clientX; y0 = py = e.clientY; t0 = Date.now(); moved = false;
    });
    st.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var L = list();
      if (mode === 3 && L.length === 2) { zoomAt(s0 * Math.hypot(L[0].x - L[1].x, L[0].y - L[1].y) / d0, (L[0].x + L[1].x) / 2, (L[0].y + L[1].y) / 2); apply(false); return; }
      var dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
      if (mode === 4) { tx += e.clientX - px; ty += e.clientY - py; px = e.clientX; py = e.clientY; clampPan(); apply(false); return; }
      if (mode === 0 && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) mode = 1;
      if (mode === 1) { sw = dx; apply(false); }
    });
    function up(e) {
      if (!pts[e.pointerId]) return; delete pts[e.pointerId];
      if (mode === 3) { if (!list().length) { mode = 0; if (sc < 1.05) { reset(); apply(true); } } return; }
      var dx = e.clientX - x0, fast = Date.now() - t0 < 300 && Math.abs(dx) > 40;
      if (mode === 1) { mode = 0; if (Math.abs(dx) > 80 || fast) step(dx < 0 ? 1 : -1); else { sw = 0; apply(true); } return; }
      var m = mode; mode = 0;
      if (!moved && Date.now() - t0 < 300) {
        var now = Date.now();
        if (now - lastTap < 320) { if (sc > 1.01) reset(); else zoomAt(2.5, e.clientX, e.clientY); apply(true); lastTap = 0; }
        else { lastTap = now; if (m !== 4 && e.target === st && sc <= 1.01) setTimeout(function () { if (lastTap === now) close(); }, 330); }
      }
    }
    st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
    st.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(sc * (e.deltaY < 0 ? 1.18 : 1 / 1.18), e.clientX, e.clientY); apply(false); }, { passive: false });
    window.addEventListener('resize', function () { if (zv.open) { clampPan(); apply(false); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();

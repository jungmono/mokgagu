/* 사진 창 안에서 사진 확대·끌기·넘기기 — 기물 이야기 모아보기(첫 화면 사진 창)와 같은 손놀림.
   - 두 손가락 벌리기 / 마우스 휠 / 두 번 톡(2.5배) 으로 확대, 확대한 채로 끌어 옮기기
   - 확대하지 않았을 때 좌우로 밀기 · ← → = 다음·이전
   새 도록을 만들 때도 이 파일을 쓴다:
     MOKGAGU_PHOTOZOOM.attach({ dialog: 창, area: 사진 칸, next: fn, prev: fn, canNext: fn, canPrev: fn })
   사진(img)은 그때그때 area 안에서 찾으므로 사진을 바꿔 그려도 된다. */
(function () {
  if (window.MOKGAGU_PHOTOZOOM) return;
  var css = document.createElement('style');
  css.textContent = '.pz-area{overflow:hidden;touch-action:pan-y}.pz-area img{-webkit-user-drag:none;user-select:none;-webkit-touch-callout:none;transform-origin:center center}';
  document.head.appendChild(css);
  function attach(o) {
    var d = o.dialog, area = o.area; area.classList.add('pz-area');
    var sc = 1, tx = 0, ty = 0, sw = 0, busy = false, img = null;
    function cur() { return area.querySelector('img'); }
    function apply(anim) {
      img = cur(); if (!img) return;
      img.style.transition = anim ? 'transform .22s ease, opacity .22s ease' : 'none';
      img.style.transform = (sc === 1 && !sw && !tx && !ty) ? '' : 'translate(' + (tx + sw) + 'px,' + ty + 'px) scale(' + sc + ')';
      img.style.opacity = sw ? String(Math.max(.35, 1 - Math.abs(sw) / 600)) : '';
      area.style.touchAction = sc > 1 ? 'none' : ''; img.style.cursor = sc > 1 ? 'grab' : '';
    }
    function clampPan() { img = cur(); if (!img) return; var w = img.clientWidth, h = img.clientHeight, mx = w * (sc - 1) / 2, my = h * (sc - 1) / 2; tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty)); }
    function reset() { sc = 1; tx = 0; ty = 0; sw = 0; apply(false); }
    function zoomAt(ns, cx, cy) { img = cur(); if (!img) return; var r = img.getBoundingClientRect(), ox = cx - (r.left + r.width / 2), oy = cy - (r.top + r.height / 2); ns = Math.max(1, Math.min(5, ns)); var k = ns / sc; tx = (tx - ox) * k + ox; ty = (ty - oy) * k + oy; sc = ns; if (sc === 1) { tx = 0; ty = 0; } clampPan(); }
    new MutationObserver(function () { if (!busy) { sc = 1; tx = 0; ty = 0; sw = 0; } }).observe(area, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    function go(dir) {
      var can = dir > 0 ? o.canNext() : o.canPrev();
      if (!can) { sw = 0; apply(true); return; }
      if (busy) return; busy = true; var w = (area.clientWidth || 400) * 0.6; sw = -dir * w; apply(true);
      setTimeout(function () { sc = 1; tx = 0; ty = 0; (dir > 0 ? o.next : o.prev)(); sw = dir * w; apply(false);
        requestAnimationFrame(function () { requestAnimationFrame(function () { sw = 0; apply(true); busy = false; }); }); }, 200);
    }
    var x0 = null, y0 = 0, t0 = 0, dx = 0, mode = 0, px = 0, py = 0, pd0 = 0, ps0 = 1, lastTap = 0;
    function start(x, y, t) { if (t && t.closest && t.closest('button,a,input,select,textarea')) return; x0 = x; y0 = y; px = x; py = y; t0 = Date.now(); dx = 0; mode = sc > 1 ? 4 : 0; }
    function move(x, y, e) {
      if (x0 === null) return;
      if (mode === 4) { tx += x - px; ty += y - py; px = x; py = y; clampPan(); apply(false); if (e && e.cancelable) e.preventDefault(); return; }
      var ddx = x - x0, ddy = y - y0;
      if (!mode) { if (Math.abs(ddx) > 8 && Math.abs(ddx) > Math.abs(ddy) * 1.2) mode = 1; else if (Math.abs(ddy) > 10) mode = 2; }
      if (mode === 1) { dx = ddx; sw = dx; apply(false); if (e && e.cancelable) e.preventDefault(); }
    }
    function end() { if (x0 === null) return; var fast = Date.now() - t0 < 300 && Math.abs(dx) > 30, m = mode; x0 = null; mode = 0;
      if (m === 1 && (Math.abs(dx) > 70 || fast)) go(dx < 0 ? 1 : -1); else if (m === 1) { sw = 0; apply(true); } }
    function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
    area.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) { x0 = null; mode = 3; pd0 = dist(e.touches[0], e.touches[1]); ps0 = sc; return; }
      if (e.touches.length !== 1) { x0 = null; return; } start(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }, { passive: true });
    area.addEventListener('touchmove', function (e) {
      if (mode === 3 && e.touches.length === 2) { var a = e.touches[0], b = e.touches[1]; zoomAt(ps0 * dist(a, b) / pd0, (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2); apply(false); if (e.cancelable) e.preventDefault(); return; }
      var p = e.touches[0]; if (p) move(p.clientX, p.clientY, e);
    }, { passive: false });
    area.addEventListener('touchend', function (e) {
      if (mode === 3) { if (e.touches.length === 0) { mode = 0; if (sc < 1.05) { reset(); apply(true); } } return; }
      var tap = x0 !== null && mode === 0 && Date.now() - t0 < 250; end();
      if (tap) { var now = Date.now(); if (now - lastTap < 320) { var c = e.changedTouches[0]; if (sc > 1) { sc = 1; tx = 0; ty = 0; } else zoomAt(2.5, c.clientX, c.clientY); apply(true); lastTap = 0; if (e.cancelable) e.preventDefault(); } else lastTap = now; }
    });
    area.addEventListener('touchcancel', function () { x0 = null; mode = 0; sw = 0; apply(true); });
    var mouse = false;
    area.addEventListener('mousedown', function (e) { if (e.button !== 0) return; e.preventDefault(); mouse = true; start(e.clientX, e.clientY, e.target); });
    window.addEventListener('mousemove', function (e) { if (mouse) move(e.clientX, e.clientY, e); });
    window.addEventListener('mouseup', function () { if (mouse) { mouse = false; end(); apply(false); } });
    area.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(sc * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY); apply(false); }, { passive: false });
    area.addEventListener('dblclick', function (e) { if (sc > 1) { sc = 1; tx = 0; ty = 0; } else zoomAt(2.5, e.clientX, e.clientY); apply(true); });
    d.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(-1); }
      else if (e.key === '+' || e.key === '=') { zoomAt(sc * 1.3, innerWidth / 2, innerHeight / 2); apply(true); } else if (e.key === '-') { zoomAt(sc / 1.3, innerWidth / 2, innerHeight / 2); apply(true); }
    }, true);
    d.addEventListener('close', reset);
  }
  window.MOKGAGU_PHOTOZOOM = { attach: attach };
})();

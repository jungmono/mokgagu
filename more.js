/* 큰 도록·검색 결과 목록을 처음에는 60점만 보여 주고 「더 보기」로 이어 보여 준다.
   카드는 그대로 두고 숨기기만 하므로(번호·사진 창 넘기기·공유는 그대로) 어느 도록에서나 같은 방식으로 쓴다. */
(function () {
  var STEP = 60, SEL = ['grid', 'r-grid', 'gallery'];   /* gallery = 도록 화면의 「사진으로 보기」 격자 */
  var ok = document.getElementById('ds-items') || /(^|\/)(index\.html)?$/.test(location.pathname);
  if (!ok) return;
  var css = document.createElement('style');
  css.textContent = '#grid>[hidden],#r-grid>[hidden],#gallery>[hidden]{display:none!important}.mr-wrap{text-align:center;margin:18px 0 6px}.mr-wrap button{border:2px solid #111;background:#fff;color:#111;border-radius:999px;padding:11px 26px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit}.mr-wrap button+button{margin-left:8px;border-color:#bdb6aa;color:#6b665e;font-weight:600}.mr-wrap small{display:block;color:#6b665e;margin-top:6px;font-size:12.5px}';
  document.head.appendChild(css);
  function wire(g) {
    var shown = STEP, busy = false;
    var wrap = document.createElement('div'); wrap.className = 'mr-wrap'; wrap.hidden = true; g.parentNode.insertBefore(wrap, g.nextSibling);
    function apply() {
      var k = g.children, n = k.length;
      for (var i = 0; i < n; i++) k[i].hidden = i >= shown;
      var left = n - shown;
      if (left <= 0) { wrap.hidden = true; return; }
      wrap.hidden = false;
      wrap.innerHTML = '<button type="button" data-m="1">더 보기 (' + Math.min(STEP, left) + '점)</button>' + (left > STEP ? '<button type="button" data-all="1">전부 보기</button>' : '') + '<small>' + shown + ' / ' + n + '점을 보고 있어요</small>';
    }
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      shown = b.dataset.all ? g.children.length : shown + STEP; apply();
    });
    new MutationObserver(function () { if (busy) return; busy = true; shown = STEP; apply(); busy = false; }).observe(g, { childList: true });
    apply();
  }
  function go() { SEL.forEach(function (id) { var g = document.getElementById(id); if (g && !g._mr) { g._mr = 1; wire(g); } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();

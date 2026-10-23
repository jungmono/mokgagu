/* 모든 페이지 공통: 홈 화면 설치(PWA) 등록 · 사진창 바깥 눌러 닫기 · 창이 열리면 뒤 화면 고정 · 사진 지연 로딩 · 키보드 포커스·터치 영역 */
(function () {
  if (window.__mokgaguCommon) return; window.__mokgaguCommon = 1;
  var d = document, root = d.documentElement;

  /* 1) 스타일 */
  var st = d.createElement('style');
  st.textContent =
    ':focus-visible{outline:3px solid #8a5a12;outline-offset:2px;border-radius:4px}' +
    'html.dlg-open{overflow:hidden}' +
    '@media (pointer:coarse){#d-prev,#d-next,#d-close,#lb-prev,#lb-next,#lb-x,.tabs button,.kg-seg button{min-height:44px}#d-close,#lb-x{min-width:56px}}' +
    '.pwa-btn{font:inherit;font-size:13px;font-weight:800;border:1.5px solid #111;border-radius:999px;background:#fff;color:#111;padding:7px 16px;cursor:pointer;margin-top:10px}' +
    '.pwa-tip{font-size:13px;color:#6b645a;margin-top:8px;line-height:1.6}';
  d.head.appendChild(st);

  /* 2) 홈 화면 설치 */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  function addInstall() {
    if (standalone || !/(^|\/)(index\.html)?$/.test(location.pathname)) return;
    var ft = d.querySelector('footer'); if (!ft || d.getElementById('pwa-btn')) return;
    var w = d.createElement('div'); w.innerHTML = '<button type="button" class="pwa-btn" id="pwa-btn">📲 홈 화면에 앱처럼 추가</button><div class="pwa-tip" id="pwa-tip" hidden></div>';
    ft.appendChild(w);
    d.getElementById('pwa-btn').addEventListener('click', function () {
      var tip = d.getElementById('pwa-tip');
      if (deferred) { deferred.prompt(); deferred = null; return; }
      var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      tip.textContent = ios ? '아이폰·아이패드: Safari 아래(또는 위) 공유 단추 ⬆ → 「홈 화면에 추가」를 눌러 주세요.' : '브라우저 메뉴(⋮) → 「홈 화면에 추가」 또는 「앱 설치」를 눌러 주세요.';
      tip.hidden = !tip.hidden;
    });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { setTimeout(addInstall, 300); }); else setTimeout(addInstall, 300);

  /* 3) 창(dialog): 바깥 눌러 닫기 + 열려 있는 동안 뒤 화면 고정 */
  var KEEP = { 'lk-who': 1, cr: 1, fm: 1 };   // 꼭 선택·입력해야 하는 창은 바깥을 눌러도 닫지 않음
  var downOut = false;
  function outside(dlg, x, y) { var r = dlg.getBoundingClientRect(); return x < r.left || x > r.right || y < r.top || y > r.bottom; }
  d.addEventListener('pointerdown', function (e) { var dlg = e.target.tagName === 'DIALOG' ? e.target : null; downOut = !!(dlg && outside(dlg, e.clientX, e.clientY)); }, true);
  d.addEventListener('click', function (e) {
    var dlg = e.target.tagName === 'DIALOG' ? e.target : null;
    if (dlg && dlg.open && !KEEP[dlg.id] && downOut && outside(dlg, e.clientX, e.clientY)) dlg.close();
    downOut = false;
  }, true);
  function lock() { root.classList.toggle('dlg-open', !!d.querySelector('dialog[open]')); }
  new MutationObserver(lock).observe(d.documentElement, { subtree: true, attributes: true, attributeFilter: ['open'] });
  d.addEventListener('close', lock, true);

  /* 4) 사진 지연 로딩 — loading 이 지정되지 않은 사진에 자동으로 */
  function lazy(root0) {
    (root0.tagName === 'IMG' ? [root0] : [].slice.call(root0.querySelectorAll ? root0.querySelectorAll('img:not([loading])') : [])).forEach(function (im) {
      if (im.hasAttribute('loading') || im.closest('header,.hd,.ttl-row') ) return;
      im.setAttribute('loading', 'lazy'); im.setAttribute('decoding', 'async');
    });
  }
  lazy(d.documentElement);
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) lazy(n); }); }); }).observe(d.documentElement, { childList: true, subtree: true });
})();

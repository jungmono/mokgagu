/* 모든 페이지 공통: 홈 화면 설치(PWA) 등록 · 사진창 바깥 눌러 닫기 · 창이 열리면 뒤 화면 고정 · 사진 지연 로딩 · 키보드 포커스·터치 영역 */
(function () {
  if (window.__mokgaguCommon) return; window.__mokgaguCommon = 1;
  var d = document, root = d.documentElement;

  /* 1) 스타일 */
  var st = d.createElement('style');
  st.textContent =
    '#grid .card{content-visibility:auto;contain-intrinsic-size:auto 340px}' +
    ':focus-visible{outline:3px solid #8a5a12;outline-offset:2px;border-radius:4px}' +
    'html.dlg-open{overflow:hidden}' +
    '@media (pointer:coarse){#d-prev,#d-next,#d-close,#lb-prev,#lb-next,#lb-x,.tabs button,.kg-seg button{min-height:44px}#d-close,#lb-x{min-width:56px}}' +
    '.pwa-btn{font:inherit;font-size:13px;font-weight:800;border:1.5px solid #111;border-radius:999px;background:#fff;color:#111;padding:7px 16px;cursor:pointer;margin-top:10px}' +
    '#pwa-bar{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid #111;border-radius:16px;padding:10px 12px;box-shadow:0 8px 28px rgba(0,0,0,.22);max-width:520px;margin:0 auto}#pwa-bar img{border-radius:10px;border:1px solid #ddd6ca}#pwa-bar .t{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.35}#pwa-bar b{font-size:14.5px}#pwa-bar span{font-size:12.5px;color:#6b645a}#pwa-bar em{font-style:normal;font-size:12px;color:#8a5a12;margin-top:4px}#pwa-bar button{font:inherit;font-weight:800;border:0;cursor:pointer;min-height:44px}#pwa-go{background:#111;color:#fff;border-radius:10px;padding:0 18px;font-size:14px}#pwa-x{background:none;font-size:16px;color:#8a837a;min-width:36px}' +
    '.pwa-tip{font-size:13px;color:#6b645a;margin-top:8px;line-height:1.6}';
  d.head.appendChild(st);

  /* 2) 홈 화면 설치 */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  var ua = navigator.userAgent, KAKAO = /KAKAOTALK/i.test(ua), IOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var K_NO = 'mokgagu_pwa_no';
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function install(tipEl) {
    if (deferred) { var p = deferred; deferred = null; p.prompt(); return; }
    if (KAKAO) {   // 카카오톡 안의 브라우저는 설치가 안 돼서 기본 브라우저로 다시 연다
      location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent('https://jungmono.github.io/mokgagu/index.html');
      tipEl.textContent = '카카오톡 안에서는 설치가 안 돼요. 기본 브라우저(크롬·Safari)로 열리면 다시 「추가」를 눌러 주세요. 안 열리면 오른쪽 위 ⋮ → 「다른 브라우저로 열기」.'; tipEl.hidden = false; return;
    }
    tipEl.textContent = IOS ? '아이폰·아이패드: Safari 아래(또는 위) 공유 단추 ⬆ → 「홈 화면에 추가」를 눌러 주세요. (크롬이 아니라 Safari여야 해요)' : '브라우저 메뉴 ⋮ → 「홈 화면에 추가」 또는 「앱 설치」를 눌러 주세요.';
    tipEl.hidden = false;
  }
  function addInstall() {
    if (standalone || !/(^|\/)(index\.html)?$/.test(location.pathname)) return;
    var ft = d.querySelector('footer');
    if (ft && !d.getElementById('pwa-btn')) {
      var w = d.createElement('div'); w.innerHTML = '<button type="button" class="pwa-btn" id="pwa-btn">📲 홈 화면에 앱처럼 추가</button><div class="pwa-tip" id="pwa-tip" hidden></div>';
      ft.appendChild(w);
      d.getElementById('pwa-btn').addEventListener('click', function () { install(d.getElementById('pwa-tip')); });
    }
    /* 처음 열면 자동으로 아래에 안내 띠가 올라온다 (닫으면 7일 동안 안 나옴) */
    var no = +lsGet(K_NO) || 0;
    if (Date.now() - no < 7 * 864e5 || d.getElementById('pwa-bar')) return;
    if (d.querySelector('dialog[open]')) { setTimeout(addInstall, 1500); return; }   // 다른 창이 열려 있으면(이름 고르기 등) 닫힌 뒤에
    var bar = d.createElement('div'); bar.id = 'pwa-bar'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', '홈 화면에 추가');
    bar.innerHTML = '<img src="icons/icon-192.png" alt="" width="44" height="44"><div class="t"><b>조선의 목가구</b><span>홈 화면에 추가하면 앱처럼 열려요</span><em id="pwa-bt" hidden></em></div><button type="button" id="pwa-go">추가</button><button type="button" id="pwa-x" aria-label="닫기">✕</button>';
    d.body.appendChild(bar);
    d.getElementById('pwa-go').addEventListener('click', function () { install(d.getElementById('pwa-bt')); });
    d.getElementById('pwa-x').addEventListener('click', function () { lsSet(K_NO, String(Date.now())); bar.remove(); });
  }
  window.addEventListener('appinstalled', function () { var b = d.getElementById('pwa-bar'); if (b) b.remove(); });
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { setTimeout(addInstall, 6000); }); else setTimeout(addInstall, 6000);   // 처음 화면의 이름 고르기와 겹치지 않게 늦게

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

/* 기물 나란히 비교(compare.js) — 모든 페이지에서 불러온다 */
(function () {
  var d = document;
  if (d.querySelector('script[src^="compare.js"]')) return;
  function go() { var s = d.createElement('script'); s.src = 'compare.js?v=2'; s.defer = true; d.head.appendChild(s); var m = d.createElement('script'); m.src = 'more.js?v=2'; m.defer = true; d.head.appendChild(m); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', go); else go();
})();

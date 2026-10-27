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
    '@media (pointer:coarse){#d-prev,#d-next,#d-close,#lb-prev,#lb-next,#lb-x,.tabs button,.kg-seg button{min-height:44px}#d-close,#lb-x{min-width:56px}.lk-btn::after{content:"";position:absolute;inset:-11px}#rv .rv-nav{min-height:36px}.cm-act button{padding:10px 8px}.cm-act{gap:2px}.lk-chip,button.chip,a.chip,.chips button,.st-top a.st-mark,.th-row a.m,.bx button,.cm-filter button{position:relative}.lk-chip::after,button.chip::after,a.chip::after,.chips button::after,.st-top a.st-mark::after,.th-row a.m::after{content:"";position:absolute;inset:-7px -3px}}' +
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
      if (im.hasAttribute('loading') || im.id === 'dlg-img' || im.id === 'd-img' || im.id === 'lb-img' || im.closest('header,.hd,.ttl-row') ) return;   /* 사진 창의 큰 사진은 바로 */
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
  function go() { var s = d.createElement('script'); s.src = 'compare.js?v=6'; s.defer = true; d.head.appendChild(s); var m = d.createElement('script'); m.src = 'more.js?v=2'; m.defer = true; d.head.appendChild(m); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', go); else go();
})();

/* 창 단추 공통 모양(2026-10-27) — 반투명 동그라미 아이콘 + 아래 작은 이름.
   · 닫기·이전·다음·공유·비교에 담기 같은 창 단추는 모두 이 모양 하나를 쓴다(높이 36px 동그라미, 이름 11px).
   · 새 창을 만들 때: 단추에 class="wb" 를 달고 안에 MOKGAGU_WB.html('x','닫기') 를 넣거나(주요 단추는 class="wb m"),
     아래 MAP 에 선택자 한 줄만 보태면 자동으로 바뀐다. 아이콘: x share left right scale check */
(function () {
  if (window.MOKGAGU_WB) return;
  var ICO = {
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    share: '<path d="M4 13v6a1 1 0 001 1h14a1 1 0 001-1v-6M16 7l-4-4-4 4M12 3v12"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    scale: '<path d="M4 5h6v14H4zM14 5h6v14h-6z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  function html(icon, label) {
    return '<span class="wb-c"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + (ICO[icon] || '') + '</svg></span><span class="wb-t">' + label + '</span>';
  }
  window.MOKGAGU_WB = { html: html, icons: ICO };
  var css = document.createElement('style'); css.id = 'wb-css';
  css.textContent = [
    '.wb{display:inline-flex!important;flex-direction:column;align-items:center;gap:3px;min-width:44px;background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;margin:0;font:inherit;color:#2b2418!important;cursor:pointer;line-height:1;-webkit-tap-highlight-color:transparent}',
    '.wb .wb-c{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.5);border:1.5px solid rgba(43,36,24,.4);color:#2b2418;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:background .12s,transform .12s}',
    '.wb .wb-t{font-size:11px;font-weight:500;color:#6d6551;white-space:nowrap}',
    '.wb.m .wb-c,.wb.on .wb-c{background:rgba(43,36,24,.78);border-color:transparent;color:#fff}',
    '.wb:hover .wb-c{background:rgba(255,255,255,.75)}.wb.m:hover .wb-c,.wb.on:hover .wb-c{background:rgba(43,36,24,.9)}',
    '.wb:active .wb-c{transform:scale(.94)}',
    '.wb:disabled{opacity:.35;cursor:default}',
    '.wb:focus-visible .wb-c{outline:2px solid #2b2418;outline-offset:2px}',
    /* 사진 위에 떠 있는 단추(공유·비교에 담기): 이름에 옅은 바탕을 깔아 어떤 사진 위에서도 읽히게 */
    '.shr.wb,.cmpbtn.wb{position:absolute;top:8px;z-index:5}.shr.wb{left:8px}.cmpbtn.wb{left:62px}',
    '.shr.wb .wb-t,.cmpbtn.wb .wb-t{background:rgba(255,255,255,.72);padding:2px 6px;border-radius:6px;color:#2b2418}',
    /* 검은 띠 위(사진 넘겨 보기)에서는 밝은 동그라미 */
    '.mp-bar .wb .wb-c{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.5);color:#fff}.mp-bar .wb .wb-t{color:#ddd}.mp-bar .wb.m .wb-c{background:rgba(255,255,255,.88);color:#111}',
    '.d-foot .wb,.sd-foot .wb,#lb .ft .wb{margin:0 2px}dialog .d-body{max-height:calc(92vh - 70px)!important}#st-dlg .sd-body{max-height:calc(92vh - 70px)!important}.d-foot,.sd-foot{padding-top:6px!important;padding-bottom:6px!important}.sa-top .wb+.wb{margin-left:10px}.sa-top .wb{vertical-align:top}'
  ].join('');
  document.head.appendChild(css);
  var MAP = [
    ['#d-prev', 'left', '이전'], ['#d-next', 'right', '다음', 1], ['#d-close', 'x', '닫기'],
    ['#st-prev', 'left', '이전'], ['#st-next', 'right', '다음', 1], ['#st-close', 'x', '닫기'],
    ['#lb-p', 'left', '이전'], ['#lb-n', 'right', '다음', 1], ['#lb-x', 'x', '닫기'],
    ['#cls', 'x', '닫기'], ['#cmp-share', 'share', '공유'], ['.shr', 'share', '공유'],
    ['.mp-bar button[data-mpn="-1"]', 'left', '이전'], ['.mp-bar button[data-mpn="1"]', 'right', '다음', 1], ['.mp-bar button[data-mpn="0"]', 'x', '닫기']
  ];
  var ALL = MAP.map(function (m) { return m[0]; }).join(',');
  function conv(el, m) {
    if (el.dataset.wb) return; el.dataset.wb = '1';
    el.classList.remove('sa-close'); el.classList.add('wb'); if (m[3]) el.classList.add('m');
    el.removeAttribute('style'); el.innerHTML = html(m[1], m[2]);
  }
  var busy = false;
  function scan() {
    busy = false;
    if (!document.querySelector(ALL)) return;
    MAP.forEach(function (m) { document.querySelectorAll(m[0]).forEach(function (el) { conv(el, m); }); });
  }
  function soon() { if (!busy) { busy = true; requestAnimationFrame(scan); } }
  new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', soon); else soon();
})();

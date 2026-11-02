/* 거믄·힌의 방 이동 줄 — 공부방·소장품·통계·비교하기 화면 맨 위(컴퓨터) / 맨 아래(휴대폰)에 붙는다.
   가족 암호를 넣어 둔 기기에서만 보인다(잠금 화면에는 방 이름이 나오지 않게). 2026-11-02 */
(function () {
  if (window.MOKGAGU_ROOMNAV) return; window.MOKGAGU_ROOMNAV = 1;
  var P = location.pathname.split('/').pop() || 'index.html';
  var ROOMS = [['study.html', '공부방', 'SEOAN'], ['collection.html', '소장품', 'BAN'], ['stats.html', '통계', 'SANG'], ['compare.html', '비교하기', 'CMP']];
  if (!ROOMS.some(function (r) { return r[0] === P; })) return;
  var T32 = function (d, w) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="' + (w || 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var IC = {
    SEOAN: T32('<path d="M2.5 9.2c.6 1.4 1.4 1.8 2.6 1.8h21.8c1.2 0 2-.4 2.6-1.8"/><path d="M6 11v16M26 11v16"/><rect x="9" y="11" width="14" height="4.2"/><path d="M15 13.1h2"/><path d="M6 19.5h20"/><path d="M6 24.5h20"/>'),
    BAN: T32('<rect x="3.5" y="8" width="25" height="16.5" rx=".8"/><path d="M3.5 15.5h25"/><path d="M5 24.5v3M27 24.5v3"/><path d="M8.5 8v5.5h3V8M20.5 8v5.5h3V8"/><path d="M13.5 15.5h5v4.2l-2.5 1.8-2.5-1.8z"/><path d="M5.8 19.5c1 0 1.6.6 1.6 1.4M26.2 19.5c-1 0-1.6.6-1.6 1.4"/>'),
    SANG: T32('<path d="M7 6v20M12 6v20M17 6v20M22 6v20"/><path d="M4 23 27 9"/>', 1.8),
    CMP: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="7" height="14" rx="1"/><rect x="13.5" y="5" width="7" height="14" rx="1"/><path d="M7 9v6M17 9v6" stroke-width="1.3"/></svg>'
  };
  var MOON = '<svg viewBox="0 0 60 60" width="38" height="38" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="#fff"/><path d="M30 3a27 27 0 0 0 0 54z" fill="#111"/><circle cx="30" cy="30" r="27" fill="none" stroke="#fff" stroke-width="2.5"/></svg>';
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function fam() { return !!ls('mokgagu_study_pw') || (ls('mokgagu_cm_fam') === '1' && !!ls('mokgagu_cm_code')); }
  var css = document.createElement('style');
  css.textContent = '#rn{font-family:inherit;-webkit-tap-highlight-color:transparent}#rn *{box-sizing:border-box}#rn a{text-decoration:none}' +
    '#rn.top{position:fixed;top:0;left:0;right:0;z-index:40;display:flex;align-items:center;gap:16px;background:#111;padding:10px 22px 8px}' +
    '#rn.top .mn{flex:none;display:flex;width:38px;height:38px}#rn.top nav{display:flex;gap:14px;flex:1;justify-content:center}' +
    '#rn.top nav a{display:flex;flex-direction:column;align-items:center;gap:3px;color:#c9c5bd;font-size:12px;font-weight:700;width:78px}' +
    '#rn.top .i{width:42px;height:42px;border-radius:12px;background:#fff;color:#111;display:grid;place-items:center;padding:8px;opacity:.5;transition:opacity .15s}' +
    '#rn.top nav a:hover .i{opacity:.85}#rn.top nav a.on{color:#fff;font-weight:900}#rn.top nav a.on .i{opacity:1;box-shadow:0 0 0 3px #fff}' +
    '#rn.top .hm{flex:none;color:#aaa;font-size:13px;font-weight:700;width:38px;text-align:right}#rn.top .hm:hover{color:#fff}' +
    '#rn.bot{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;justify-content:space-around;background:#fff;border-top:1.5px solid #111;padding:6px 8px calc(8px + env(safe-area-inset-bottom))}' +
    '#rn.bot a{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:12px;font-weight:700;color:#777;flex:1;max-width:96px;padding:5px 0;border-radius:12px}' +
    '#rn.bot .i{width:26px;height:26px;display:block}#rn.bot a.on{color:#111;font-weight:900;background:#f1efeb}#rn svg{width:100%;height:100%;display:block}' +
    'body.rn-bot #rv{bottom:84px!important}body.rn-bot .toast,body.rn-bot #toast{bottom:92px!important}' +
    '@media print{#rn{display:none!important}}';
  document.head.appendChild(css);
  var el = null, mode = '', mq = window.matchMedia('(max-width:700px)');
  function build() {
    var m = mq.matches ? 'bot' : 'top';
    if (!fam()) { if (el) { el.remove(); el = null; mode = ''; document.body.style.paddingBottom = ''; } return; }
    if (el && mode === m) return;
    if (el) el.remove();
    mode = m; el = document.createElement('div'); el.id = 'rn'; el.className = m; el.setAttribute('role', 'navigation'); el.setAttribute('aria-label', '거믄·힌의 방 이동');
    var links = ROOMS.map(function (r) { return '<a href="' + r[0] + '"' + (r[0] === P ? ' class="on" aria-current="page"' : '') + '><span class="i">' + IC[r[2]] + '</span><b style="font-weight:inherit">' + r[1] + '</b></a>'; }).join('');
    if (m === 'top') { el.innerHTML = '<span class="mn">' + MOON + '</span><nav>' + links + '</nav><a class="hm" href="index.html">처음</a>'; document.body.insertBefore(el, document.body.firstChild); document.body.style.paddingBottom = ''; document.body.style.paddingTop = '88px'; document.body.classList.remove('rn-bot'); }
    else { el.innerHTML = links; document.body.appendChild(el); document.body.style.paddingBottom = '76px'; document.body.style.paddingTop = ''; document.body.classList.add('rn-bot'); }
  }
  build(); setInterval(build, 1200); window.addEventListener('storage', build);
  if (mq.addEventListener) mq.addEventListener('change', build); else mq.addListener(build);
})();

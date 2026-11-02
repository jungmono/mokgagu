/* 휴대폰 홈 단추 — 첫 화면이 아닌 모든 화면의 왼쪽 아래에 집 모양 단추를 띄운다.
   거믄·힌의 방 이동 줄(#rn)이 아래에 붙어 있으면 거기에 이미 「홈」이 있으므로 감춘다. */
(function () {
  if (/(^|\/)(index\.html)?$/.test(location.pathname)) return;
  var css = document.createElement('style');
  css.textContent = '#hb{display:none}@media (max-width:720px){#hb{position:fixed;left:10px;bottom:12px;z-index:60;width:46px;height:46px;border-radius:50%;background:#1d1b18;color:#fff;display:grid;place-items:center;box-shadow:0 6px 16px rgba(0,0,0,.28);text-decoration:none}#hb svg{width:24px;height:24px}body.rn-bot #hb{display:none!important}#hb.on{display:grid}}@media print{#hb{display:none!important}}';
  document.head.appendChild(css);
  function mount() {
    var a = document.createElement('a'); a.id = 'hb'; a.className = 'on'; a.href = 'index.html'; a.setAttribute('aria-label', '홈'); a.title = '홈';
    a.innerHTML = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15 16 4l12 11"/><path d="M7 13v14h18V13"/><path d="M13 27v-8h6v8"/></svg>';
    document.body.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

/* 모든 화면 공통 머리줄(B안) — 2026-11-13
   - 맨 위 흰 머리줄: 홈 · 조선의 목가구 · 찾기 · 메뉴(도록 서가·탐색 도구·거믄·힌의 방·최근 본 기물…)
   - 예전 머리(도록 큰 제목, 도구 화면 큰 제목과 홈 단추, 첫 화면 검은 띠, 왼쪽 아래 홈 단추)를 대신한다
   - 바탕은 미색 하나, 휴대폰에서는 화면 아래 여백을 두어 떠 있는 단추가 내용을 가리지 않게 한다
   - 색 그림 문자(이모지)를 같은 굵기의 선 그림 아이콘으로 바꾼다(나중에 그려지는 내용도 함께)
   예전 이름(homebtn.js)을 그대로 써서 모든 화면이 이미 이 파일을 불러온다. */
(function () {
  if (window.MOKGAGU_UB) return; window.MOKGAGU_UB = 1;
  var d = document, P = location.pathname.split('/').pop() || 'index.html', HOME = P === 'index.html';
  var S = function (p, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
  var IC = {
    home: S('<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'),
    search: S('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>'),
    menu: S('<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>'),
    x: S('<path d="M6 6l12 12M18 6 6 18"/>', 2),
    ruler: S('<path d="M4 20V5l15 15H4z"/><path d="M8 16v-3.5L11.5 16H8z"/><path d="M4 9h2M4 13h2"/>'),
    person: S('<circle cx="12" cy="4.6" r="2.3"/><path d="M8.2 21l.6-7.2-1.6-.6.8-4.6c.2-1 1-1.6 2-1.6h4c1 0 1.8.6 2 1.6l.8 4.6-1.6.6.6 7.2"/><path d="M12 14v7"/>'),
    house: S('<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'),
    camera: S('<path d="M4 8h3l1.6-2.4h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.4"/>'),
    lock: S('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><path d="M12 14.5v2.5"/>'),
    key: S('<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/>'),
    talk: S('<path d="M4 5.5h16v10H11l-4.5 3.5v-3.5H4z"/><path d="M8 9.5h8M8 12.5h5"/>'),
    book: S('<path d="M12 6.5C9.5 5 6.5 4.6 4 5v13c2.5-.4 5.5 0 8 1.5 2.5-1.5 5.5-1.9 8-1.5V5c-2.5-.4-5.5 0-8 1.5z"/><path d="M12 6.5v13"/>'),
    note: S('<path d="M6 3.5h9l3 3V20.5H6z"/><path d="M9 10h6M9 13.5h6M9 17h4"/>'),
    pen: S('<path d="M5 19l1-4L16 5l3 3L9 18z"/><path d="M14 7l3 3"/>'),
    mic: S('<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3"/>'),
    link: S('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>'),
    chart: S('<path d="M4 4v16h16"/><path d="M7 15l4-4 3 3 5-6"/>'),
    phone: S('<rect x="7" y="2.8" width="10" height="18.4" rx="2"/><path d="M12 7.5v7M9.3 12l2.7 2.7 2.7-2.7"/>'),
    plan: S('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 11h7v9M11 4v4M15 11h5M15 11v4"/>'),
    cal: S('<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
    hist: S('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4v3.8h3.8"/><path d="M12 8v4.2l3 1.8"/>'),
    eye: S('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    print: S('<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>'),
    warn: S('<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17v.2"/>'),
    scale: S('<path d="M12 4v16M7 20h10M4 7h16"/><path d="M6.5 7 4 13h5zM17.5 7 15 13h5z"/>'),
    cut: S('<circle cx="6.5" cy="17" r="2.5"/><circle cx="17.5" cy="17" r="2.5"/><path d="M8.3 15.3 18 4M15.7 15.3 6 4"/>'),
    expand: S('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    star: S('<path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>'),
    stats: S('<path d="M7 5v14M12 5v14M17 5v14"/><path d="M4 17 20 7"/>'),
    cmp: S('<rect x="3.5" y="5" width="7" height="14" rx="1"/><rect x="13.5" y="5" width="7" height="14" rx="1"/>'),
    box: S('<rect x="3.5" y="7" width="17" height="12" rx="1"/><path d="M3.5 12.5h17M10 12.5h4v2.5h-4z"/>'),
    seoan: S('<path d="M2.5 8c.5 1 1 1.4 2 1.4h15c1 0 1.5-.4 2-1.4"/><path d="M5 9.4V20M19 9.4V20M5 15h14"/>'),
    tools: S('<circle cx="12" cy="12" r="8"/><path d="M15.5 8.5 13.4 13.4 8.5 15.5l2.1-4.9z"/>'),
    folder: S('<path d="M3.5 6.5h6l2 2h9v10.5h-17z"/>'),
    dict: S('<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 11.5h6"/>')
  };
  /* 이모지 → 아이콘 이름 */
  var EMO = { '📐': 'ruler', '🧍': 'person', '🏠': 'house', '📷': 'camera', '🔒': 'lock', '🔑': 'key', '💬': 'talk', '📚': 'book', '📖': 'book', '📝': 'note', '✏': 'pen', '🎙': 'mic', '🔗': 'link', '📈': 'chart', '📲': 'phone', '📱': 'phone', '🖼': 'plan', '🗓': 'cal', '👣': 'hist', '👀': 'eye', '🖨': 'print', '⚠': 'warn', '⚖': 'scale', '✂': 'cut', '🔎': 'search', '🔍': 'search' };
  var ERE = /(📐|🧍|🏠|📷|🔒|🔑|💬|📚|📖|📝|✏|🎙|🔗|📈|📲|📱|🖼|🗓|👣|👀|🖨|⚠|⚖|✂|🔎|🔍)️?/g;

  var css = d.createElement('style');
  css.textContent = [
    'html,body{background:#faf7f0!important}',
    '#ub{position:sticky;top:0;z-index:55;background:#fff;border-bottom:1px solid #e4e0d8;font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}',
    '#ub{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);width:100vw;box-sizing:border-box}',
    '#ub .in{max-width:1200px;margin:0 auto;height:56px;display:flex;align-items:center;gap:8px;padding:0 12px}',
    '#ub a,#ub button{font:inherit;color:#111;text-decoration:none;-webkit-tap-highlight-color:transparent}',
    '#ub .ib{flex:none;width:42px;height:42px;border-radius:11px;border:1px solid #e4e0d8;background:#fff;display:grid;place-items:center;cursor:pointer;padding:0}',
    '#ub .ib:hover{background:#f3f0e9}#ub .ib svg{width:22px;height:22px;display:block}',
    '#ub .lg{flex:1;min-width:0;display:flex;align-items:center;gap:8px;font-weight:900;font-size:18px;letter-spacing:-.03em;white-space:nowrap;overflow:hidden}',
    '#ub .lg img{height:22px;width:auto;display:block}',
    '#ub-m{position:fixed;top:62px;right:max(12px,calc((100vw - 1200px)/2 + 12px));z-index:2147482000;width:min(330px,calc(100vw - 24px));max-height:calc(100dvh - 80px);overflow:auto;background:#fff;border:1px solid #e4e0d8;border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,.18);padding:8px;font-family:inherit;display:none}',
    '#ub-m.on{display:block}',
    '#ub-m h6{margin:10px 10px 4px;font-size:12px;font-weight:700;color:#857f75}',
    '#ub-m a,#ub-m button{display:flex;align-items:center;gap:12px;width:100%;min-height:46px;padding:0 10px;border:0;border-radius:10px;background:none;color:#111;font:inherit;font-size:15px;font-weight:700;text-align:left;text-decoration:none;cursor:pointer}',
    '#ub-m a:hover,#ub-m button:hover{background:#f3f0e9}#ub-m a.on{background:#111;color:#fff}',
    '#ub-m svg{width:22px;height:22px;flex:none}',
    '.ui-ic{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;line-height:0}.ui-ic svg{width:100%;height:100%;display:block}',
    /* 예전 머리와 떠 있는 홈 단추 감추기 */
    '.st-top,.th-row,.th-back.th-home,#hb,#rn,body>.topbar,a.h[aria-label="홈"]{display:none!important}',
    '.th-nav{margin-top:6px}',
    '@media (max-width:720px){body{padding-bottom:84px!important}#rv .rv-more{display:none!important}}',
    '@media print{#ub,#ub-m{display:none!important}}'
  ].join('');
  d.head.appendChild(css);

  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function fam() { return !!ls('mokgagu_study_pw') || (ls('mokgagu_cm_fam') === '1' && !!ls('mokgagu_cm_code')); }
  function link(h, ic, t) { return '<a href="' + h + '"' + (h === P ? ' class="on" aria-current="page"' : '') + '>' + IC[ic] + t + '</a>'; }
  function menuHTML() {
    var h = '<h6>조선의 목가구</h6>' + link('index.html', 'home', '홈') + link('index.html#q', 'search', '기물 찾기') +
      link('index.html#sec-books', 'book', '도록 서가') + link('index.html#sec-tools', 'tools', '탐색 도구') + link('index.html#sec-folds', 'folder', '자료 묶음') +
      link('comments.html', 'talk', '기물 이야기 모아보기') + link('glossary.html', 'dict', '목가구 용어 사전');
    if (d.getElementById('rv-more')) h += '<button type="button" data-ub="recent">' + IC.hist + '최근 본 기물 · 좋아요</button>';
    if (fam()) h += '<h6>거믄·힌의 방</h6>' + link('study.html', 'seoan', '공부방') + link('collection.html', 'box', '소장품') + link('stats.html', 'stats', '통계') + link('compare.html', 'cmp', '비교하기');
    return h;
  }

  function mount() {
    if (d.getElementById('ub')) return;
    var b = d.createElement('header'); b.id = 'ub';
    b.innerHTML = '<div class="in"><a class="ib" href="index.html" aria-label="홈" title="홈" data-ub="home">' + IC.home + '</a>' +
      '<a class="lg" href="index.html" data-ub="home"><img src="mark_angwe.png" alt="" width="36" height="22">조선의 목가구</a>' +
      '<button type="button" class="ib" aria-label="찾기" title="찾기" data-ub="search">' + IC.search + '</button>' +
      '<button type="button" class="ib" aria-label="메뉴" title="메뉴" aria-expanded="false" aria-controls="ub-m" data-ub="menu">' + IC.menu + '</button></div>';
    d.body.insertBefore(b, d.body.firstChild);
    var bs = getComputedStyle(d.body), pt = (parseFloat(bs.paddingTop) || 0) + (parseFloat(bs.marginTop) || 0); if (pt) b.style.marginTop = -pt + 'px';
    var mt = parseFloat(getComputedStyle(b.nextElementSibling || b).marginTop) || 0; if (b.nextElementSibling && mt < 12 && pt) b.style.marginBottom = '12px';
    var m = d.createElement('nav'); m.id = 'ub-m'; m.setAttribute('aria-label', '메뉴'); d.body.appendChild(m);
    function close() { m.classList.remove('on'); b.querySelector('[data-ub=menu]').setAttribute('aria-expanded', 'false'); }
    d.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-ub], #ub-m a');
      if (!t) { if (m.classList.contains('on') && !(e.target.closest && e.target.closest('#ub-m'))) close(); return; }
      var k = t.getAttribute('data-ub');
      if (k === 'menu') { e.preventDefault(); if (m.classList.contains('on')) close(); else { m.innerHTML = menuHTML(); m.classList.add('on'); t.setAttribute('aria-expanded', 'true'); } return; }
      if (k === 'home' && HOME) { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (k === 'search') {
        e.preventDefault();
        var q = d.getElementById('q') || d.getElementById('st-q') || d.querySelector('input[type=search]:not([hidden])');
        if (q && q.offsetParent !== null) { q.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(function () { q.focus(); }, 250); }
        else location.href = 'index.html#q';
        return;
      }
      if (k === 'recent') { close(); var r = d.getElementById('rv-more'); if (r) r.click(); return; }
      if (t.closest('#ub-m')) {
        close();
        var href = t.getAttribute('href') || '';
        if (HOME && href.indexOf('index.html#') === 0) {
          e.preventDefault(); var id = href.split('#')[1], el = d.getElementById(id);
          if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (id === 'q') setTimeout(function () { el.focus(); }, 300); }
        }
      }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.classList.contains('on')) close(); });
    if (HOME && location.hash === '#q') setTimeout(function () { var q = d.getElementById('q'); if (q) q.focus(); }, 400);
    icons(d.body);
    new MutationObserver(function (ms) { ms.forEach(function (x) { x.addedNodes.forEach(function (n) { if (n.nodeType === 1) icons(n); else if (n.nodeType === 3) iconText(n); }); if (x.type === 'characterData') iconText(x.target); }); })
      .observe(d.body, { childList: true, subtree: true, characterData: true });
  }

  /* 이모지 → 선 그림 */
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE|INPUT|SELECT|svg|text|tspan)$/;
  function iconText(n) {
    var p = n.parentNode; if (!p || SKIP.test(p.nodeName) || (p.closest && p.closest('svg,[contenteditable=true],.ui-ic'))) return;
    var s = n.nodeValue; ERE.lastIndex = 0; if (!s || !ERE.test(s)) return; ERE.lastIndex = 0;
    var f = d.createDocumentFragment(), last = 0, mm;
    while ((mm = ERE.exec(s))) {
      if (mm.index > last) f.appendChild(d.createTextNode(s.slice(last, mm.index)));
      var sp = d.createElement('span'); sp.className = 'ui-ic'; sp.setAttribute('aria-hidden', 'true'); sp.innerHTML = IC[EMO[mm[1]]]; f.appendChild(sp);
      last = mm.index + mm[0].length;
    }
    if (last < s.length) f.appendChild(d.createTextNode(s.slice(last)));
    p.replaceChild(f, n);
  }
  function icons(root) {
    if (root.nodeType === 1 && SKIP.test(root.nodeName)) return;
    var w = d.createTreeWalker(root, NodeFilter.SHOW_TEXT), a = [], n;
    while ((n = w.nextNode())) { ERE.lastIndex = 0; if (ERE.test(n.nodeValue)) a.push(n); }
    a.forEach(iconText);
  }
  window.MOKGAGU_ICONS = IC;
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', mount); else mount();
})();

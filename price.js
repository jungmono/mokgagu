/* 사진 창에 「같은 종류 경매 보통 낙찰가」를 붙인다 (2026-10-28).
   · 값은 경매 시세 화면과 같은 계산(아이옥션·마이아트옥션·서울옥션 낙찰가) — tools/build_price.js 가 아래 PRICE 줄을 다시 쓴다.
   · 기물 이름으로 종류를 가린다. 이름만으로 종류가 분명하지 않은 기물(세트·일괄, 책장처럼 두 종류에 걸치는 것 등)에는 보이지 않는다.
     (경매 기물 858점으로 시험: 이름으로 가린 485점 중 99% 이상이 경매 도록의 종류와 같음) */
(function () {
  if (window.MOKGAGU_PRICE) return; window.MOKGAGU_PRICE = 1;
  var PRICE = {"장·농":{"n":134,"q1":700000,"m":1200000,"q3":3000000},"책장·사방탁자·찬탁":{"n":28,"q1":800000,"m":2100000,"q3":3625000},"반닫이·궤":{"n":132,"q1":400000,"m":600000,"q3":1200000},"서안·경상·연상":{"n":55,"q1":800000,"m":1500000,"q3":3450000},"함·소품":{"n":118,"q1":500000,"m":1000000,"q3":2950000},"문방·기타":{"n":114,"q1":725000,"m":1100000,"q3":2675000},"소반·상":{"n":79,"q1":500000,"m":800000,"q3":2000000}}, PRICE_AT = "2026-10-28";
  var RULES = [
    ['서안·경상·연상', /서안|경상(?!도|남|북)|연상|서견대/],
    ['반닫이·궤', /반닫이|반다지|櫃|엽전\s*궤|돈궤|곶감\s*궤|(^|\s)궤$/],
    ['소반·상', /소반|해주반|나주반|통영반|호족반|구족반|일주반|원반|과반|다과상|교자상|찻상|약상|사각반|팔각반|목단문반|연화반/],
    ['책장·사방탁자·찬탁', /사방탁자|찬탁|서탁/],
    ['장·농', /(이|삼|사)층\s*장|머릿장|의걸이|옷장|(이|삼)층\s*농|애기농|약장|화초장|관복장|버선장|(^|\s)농$/],
    ['함·소품', /사각함|빗접|(^|[^업])경대|반짇고리|필갑|관모함|문서함|서류함|벼루함/]
  ];
  function kindOf(name) { name = String(name || '').trim(); if (!name || /set|일괄|및|외\s*\d|\d+\s*점/i.test(name)) return null; for (var i = 0; i < RULES.length; i++) if (RULES[i][1].test(name)) return RULES[i][0]; return null; }
  function man(v) { var m = v / 10000; return m >= 10000 ? (Math.round(m / 1000) / 10) + '억' : (m >= 1000 ? Math.round(m).toLocaleString('ko-KR') : Math.round(m * 10) / 10) + '만'; }   /* 경매 시세 화면과 같은 표기 */
  var css = document.createElement('style');
  css.textContent = '.pr-box{margin:12px 0 0;padding:9px 12px;border:1px solid #e7d9b4;background:#fdfaf2;border-radius:10px;font-size:13px;line-height:1.55;color:#4a4130}' +
    '.pr-box b{color:#2b2418}.pr-box .pr-m{font-weight:900;color:#8a2f22}.pr-box a{display:inline!important;margin:0!important;padding:0!important;background:none!important;color:#6b5d3f!important;font-weight:700!important;font-size:12.5px!important;text-decoration:underline!important;border:0!important}' +
    '.pr-box small{display:block;color:#8a7f66;font-size:11.5px;margin-top:2px}';
  document.head.appendChild(css);
  function sync(dlg) {
    var old = dlg.querySelector('.pr-box'); if (old) old.remove();
    if (!dlg.open && !dlg.hasAttribute('open')) return;
    var h = dlg.querySelector('h3'); if (!h) return;
    var name = (h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.nodeValue : h.textContent) || '';
    var k = kindOf(name), p = k && PRICE[k]; if (!p) return;
    var box = document.createElement('div'); box.className = 'pr-box';
    box.innerHTML = '<b>같은 종류 경매 보통 낙찰가</b> · ' + k + ' ' + p.n + '건<br>중앙값 <span class="pr-m">' + man(p.m) + '원</span> · 가운데 절반 ' + man(p.q1) + '~' + man(p.q3) + '원 ' +
      '<a href="auction-stats.html">경매 시세 →</a><small>이 기물의 값이 아니라 같은 종류의 흔한 가격대입니다(아이옥션·마이아트옥션·서울옥션 낙찰가' + (PRICE_AT ? ', ' + PRICE_AT.replace(/-/g, '.') + '. 기준' : '') + ').</small>';
    var dl = h.parentNode.querySelector('dl');
    if (dl && dl.parentNode === h.parentNode) dl.parentNode.insertBefore(box, dl.nextSibling); else h.parentNode.insertBefore(box, h.nextSibling);
  }
  var pend = new Set(), raf = 0;
  function later(d) { pend.add(d); if (!raf) raf = requestAnimationFrame(function () { raf = 0; pend.forEach(sync); pend.clear(); }); }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      var d = m.target.closest ? m.target.closest('dialog') : null;
      if (!d || (m.type === 'childList' && [].every.call(m.addedNodes, function (n) { return n.classList && n.classList.contains('pr-box'); }) && !m.removedNodes.length)) return;
      if (m.type === 'childList' && [].some.call(m.removedNodes, function (n) { return n.classList && n.classList.contains('pr-box'); }) && !m.addedNodes.length) return;
      later(d);
    });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-cid', 'open'] });
  window.MOKGAGU_PRICE_KIND = kindOf;
})();

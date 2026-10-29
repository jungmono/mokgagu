/* 탐색 도구 화면(반닫이여지도·경매 시세·지역 퀴즈·비례 자)의 공통 머리.
   쓰는 법: 머리가 들어갈 자리에  <script src="tools-head.js" data-k="map|auction|quiz|ruler"></script>  한 줄.
   새 도구를 넣으려면 아래 TOOLS 에 한 줄 보태면 모든 화면에 함께 나온다. */
(function () {
  var TOOLS = [
    { k: 'map', href: 'bandaji-map.html', t: '지도로 보기', title: '반닫이(궤)여지도', sub: '' },
    { k: 'quiz', href: 'region-quiz.html', t: '지역 퀴즈', title: '이 반닫이는 어느 지역?', sub: '사진만 보고 지역을 맞혀 보세요' },
    { k: 'ruler', href: 'region-ruler.html', t: '비례 자', title: '비례 자', sub: '우리 언양반닫이를 기준으로 지역별 비례를 견줘 봅니다' },
    { k: 'auction', href: 'auction-stats.html', t: '경매 시세', title: '경매 시세', sub: '아이옥션·마이아트옥션·서울옥션 낙찰가를 종류별로 봅니다' }
  ];
  var me = document.currentScript, key = me && me.getAttribute('data-k'), cur = TOOLS.filter(function (x) { return x.k === key; })[0];
  if (!cur) return;
  /* 통계에서 들어왔으면 「통계로」, 아니면 「처음으로」 */
  var back = { href: 'index.html', t: '← 처음으로' };
  try { if (/\/stats\.html/.test(document.referrer) || /[?&]from=stats/.test(location.search)) back = { href: 'stats.html', t: '← 통계로' }; } catch (e) {}
  var css = document.createElement('style');
  css.textContent = [
    '.th{max-width:1100px;margin:0 auto 14px;padding:6px 0 0;font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#111;text-align:left}',
    '.th *{box-sizing:border-box}',
    '.th-row{display:flex;align-items:flex-end;justify-content:center;gap:clamp(10px,2.6vw,30px);margin:0 0 10px}',
    '.th-row a{color:inherit;text-decoration:none}.th-row .m{flex:none;display:block;line-height:0;margin-bottom:clamp(4px,.7vw,8px)}.th-row .m img{height:clamp(30px,5vw,52px);width:auto;display:block}.th-row .m.a img{height:clamp(26px,4.4vw,46px)}',
    '.th-row .tt{font-weight:900;font-size:clamp(26px,3.8vw,42px);letter-spacing:-.04em;line-height:1.15}',
    '.th-nav{display:flex;align-items:center;gap:8px;margin:0 0 12px;flex-wrap:wrap}',
    '.th-back{flex:none;border:1.5px solid #111;border-radius:999px;padding:7px 14px;font-weight:700;font-size:14px;background:#fff;color:#111;text-decoration:none;min-height:36px;display:inline-flex;align-items:center}',
    '.th-tools{display:flex;gap:6px;margin-left:auto;overflow-x:auto;scrollbar-width:none;max-width:100%}.th-tools::-webkit-scrollbar{display:none}',
    '.th-tools a{flex:none;border:1px solid #d8c9a3;border-radius:999px;padding:7px 13px;font-size:14px;font-weight:700;background:#fff;color:#2b2418;text-decoration:none;min-height:36px;display:inline-flex;align-items:center;white-space:nowrap}',
    '.th-tools a.on{background:#111;color:#fff;border-color:#111}',
    '.th-hero{background:#fff;border:1px solid #e3d6b8;border-radius:16px;padding:14px 20px}',
    '.th-tag{display:inline-block;background:#111;color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px}',
    '.th-h{margin:8px 0 4px;font-size:clamp(24px,4.6vw,34px);font-weight:900;letter-spacing:-.04em;line-height:1.2}',
    '.th-s{margin:0;color:#6d6551;font-size:15px;line-height:1.5}',
    '@media (max-width:640px){.th-tools{margin-left:0;width:100%}}',
    '@media print{.th-nav{display:none}}'
  ].join('');
  document.head.appendChild(css);
  var d = document.createElement('div'); d.className = 'th';
  d.innerHTML = '<div class="th-row"><a class="m a" href="index.html" aria-label="처음 화면으로"><img src="mark_angwe.png" alt="안궤" width="328" height="200"></a><a class="tt" href="index.html">조선의 목가구</a><a class="m" href="index.html" aria-label="처음 화면으로"><img src="mark_eonyang_white.png" alt="언양반닫이" width="400" height="243"></a></div>' +
    '<nav class="th-nav" aria-label="탐색 도구"><a class="th-back" href="' + back.href + '">' + back.t + '</a><div class="th-tools">' +
    TOOLS.map(function (x) { return '<a href="' + x.href + '"' + (x.k === key ? ' class="on" aria-current="page"' : '') + '>' + x.t + '</a>'; }).join('') + '</div></nav>' +
    '<div class="th-hero"><div class="th-h" role="heading" aria-level="1">' + cur.title + '</div>' + (cur.sub ? '<p class="th-s">' + cur.sub + '</p>' : '') + '</div>';
  me.parentNode.insertBefore(d, me);
})();

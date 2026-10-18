/* 도록 페이지 공통 머리 — 맨 위에 '조선의 목가구' 제목(처음 화면으로), 그 아래 도록 표지와 이름.
   BOOKS 는 index.html 의 DASHBOARDS 와 같은 내용(새 도록을 넣으면 여기에도 한 줄). */
(function () {
  var BOOKS = {"nmk": {"t": "국립중앙박물관 소장품", "d": "국립중앙박물관 소장품 검색으로 모은 우리 목가구", "n": 432, "g": "museum"}, "heritage": {"t": "국가유산 목공예", "d": "국가유산포털 유물·생활공예·목공예 — 국보·보물·민속문화유산 등 지정 문화유산", "n": 19, "g": "museum"}, "lee": {"t": "이건희 기증 목칠공예", "d": "국립중앙박물관 기증품 목록집(2023)", "n": 488, "g": ""}, "auction": {"t": "아이옥션 경매 목가구·목기", "d": "2022년 3월~2026년 10월 경매 38회 — 추정가·낙찰가", "n": 596, "g": "auction"}, "jikmul": {"t": "우리나라 전통 무늬 1 직물", "d": "국립문화재연구소 문양 조사보고서(2006)", "n": 184, "g": "ref"}, "dojagi": {"t": "우리나라 전통 무늬 2 도자기", "d": "국립문화재연구소 문양 조사보고서(2008)", "n": 219, "g": "ref"}, "najeon": {"t": "우리나라 전통 무늬 3 나전·화각", "d": "국립문화재연구소 문양 조사보고서(2014)", "n": 110, "g": "ref"}, "geumsok": {"t": "우리나라 전통 무늬 4 금속공예", "d": "국립문화재연구소 문양 조사보고서(2011)", "n": 213, "g": "ref"}, "munui": {"t": "우리나라 전통 무늬 5 목공예", "d": "국립문화재연구소 문양 조사보고서(2012)", "n": 164, "g": ""}, "yakjang": {"t": "약장, 건강을 염원하다", "d": "허준박물관·국립민속박물관 공동기획전 도록(2014)", "n": 53, "g": ""}, "wonju": {"t": "우리 나전, 새로 맞는 날", "d": "원주시역사박물관 소장품 특별전 도록(2024)", "n": 31, "g": ""}, "soban": {"t": "소반장(小盤匠)", "d": "국립문화재연구소 중요무형문화재 조사보고서(1997)", "n": 25, "g": ""}, "busan": {"t": "부산박물관 소장품 「민속」", "d": "부산박물관 소장품 도록 「민속」편 발췌", "n": 11, "g": ""}, "yangsan": {"t": "양산 반닫이", "d": "양산시립박물관 특별기획전 도록(2022)", "n": 30, "g": ""}, "minsok": {"t": "민속유물이해Ⅰ 목가구", "d": "국립민속박물관 민속유물이해Ⅰ(2003)", "n": 223, "g": ""}, "namu": {"t": "목가구, 나무의 이치를 담다", "d": "국립민속박물관·영인산산림박물관 공동기획전 도록(2016)", "n": 56, "g": ""}, "salm": {"t": "목가구, 삶을 담다", "d": "미리벌민속박물관·국립민속박물관 공동기획전 도록(2015)", "n": 53, "g": ""}, "migam": {"t": "목가구의 미감", "d": "국립민속박물관·은평역사한옥박물관 공동기획전 도록(2016)", "n": 55, "g": ""}, "kwon": {"t": "권옥연 화백 구장 조선목기", "d": "북촌민예관 개관전 도록(2012)", "n": 50, "g": ""}};
  var GROUP = { museum: '박물관자료', auction: '경매자료', ref: '도움자료', '': '도록' };
  var slug = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var css = document.createElement('style');
  css.textContent = [
    '.st-top{position:relative;max-width:1200px;margin:0 auto 6px;padding:6px 0 0;text-align:center;font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}',
    '.st-top .st-mark{position:absolute;left:0;top:4px;line-height:0;transition:opacity .15s}.st-top .st-mark:hover{opacity:.75}.st-top .st-mark img{height:clamp(28px,3.4vw,40px);width:auto}',
    '.st-top .st-title{display:inline-block;color:#111;text-decoration:none;font-weight:900;font-size:clamp(26px,3.8vw,42px);letter-spacing:-.04em;line-height:1.15;padding:2px 10px;border-radius:10px;transition:transform .15s}',
    '.st-top .st-title:hover{transform:translateY(-2px)}',
    '.st-cover{display:flex;align-items:center;gap:clamp(16px,2.4vw,28px);max-width:1200px;margin:18px auto 22px;padding:clamp(14px,2vw,22px) clamp(16px,2.4vw,28px);background:#fff;border:1px solid #e6e8f0;border-radius:18px;box-shadow:0 1px 2px rgba(20,24,60,.04),0 6px 20px rgba(20,24,60,.06);font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;box-sizing:border-box}',
    '.st-cover img{flex:none;width:clamp(78px,10vw,118px);height:auto;max-height:160px;object-fit:contain;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.18),0 10px 22px rgba(0,0,0,.12);background:#f4f2ee}',
    '.st-cover .st-tx{min-width:0}',
    '.st-cover .st-grp{display:inline-block;font-size:12.5px;font-weight:900;color:#fff;background:#111;padding:2px 9px;border-radius:5px;letter-spacing:.02em}',
    '.st-cover .st-tx h2{margin:8px 0 4px!important;padding:0!important;border:0!important;font-family:inherit!important;font-weight:900!important;font-size:clamp(22px,3vw,34px)!important;letter-spacing:-.035em!important;line-height:1.2!important;color:#111!important}',
    '.st-cover .st-tx p{margin:0!important;font-family:inherit!important;font-weight:700!important;font-size:clamp(14.5px,1.6vw,18px);line-height:1.5;color:#3b3833}',
    '.st-cover .st-tx .st-n{margin-top:6px!important;font-weight:900!important;font-size:clamp(15px,1.6vw,18px);color:#4b55d6}',
    '.st-h1-hide{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;margin:0!important;padding:0!important}',
    '@media (max-width:600px){.st-top{padding-top:44px}.st-top .st-mark{left:50%;transform:translateX(-50%)}}',
    '@media print{.st-top .st-mark{display:none}}'
  ].join('');
  document.head.appendChild(css);
  if (!document.querySelector('link[href*="Noto+Sans+KR"][href*="900"]')) {
    var lk = document.createElement('link'); lk.rel = 'stylesheet';
    lk.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap'; document.head.appendChild(lk);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function run() {
    var top = document.querySelector('.sa-top');
    if (!top) { top = document.createElement('div'); document.body.insertBefore(top, document.body.firstChild); }
    top.className = 'st-top';
    top.innerHTML = '<a class="st-mark" href="index.html" aria-label="처음 화면으로" title="처음 화면으로"><img src="mark_angwe.png" alt="" width="328" height="200"></a>' +
      '<a class="st-title" href="index.html" title="처음 화면으로">조선의 목가구</a>';
    var b = BOOKS[slug]; if (!b) return;
    var h1 = document.querySelector('h1');
    var cv = document.createElement('section'); cv.className = 'st-cover';
    cv.innerHTML = '<img src="covers/' + slug + '.jpg" alt="' + esc(b.t) + ' 표지">' +
      '<div class="st-tx"><span class="st-grp">' + GROUP[b.g || ''] + '</span><h2>' + esc(b.t) + '</h2><p>' + esc(b.d) + '</p><p class="st-n">기물 ' + b.n.toLocaleString('ko-KR') + '건</p></div>';
    if (h1) { h1.parentNode.insertBefore(cv, h1); h1.classList.add('st-h1-hide'); }
    else top.parentNode.insertBefore(cv, top.nextSibling);
    document.title = b.t + ' — 조선의 목가구';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

/* 도록 페이지 공통 머리 — 맨 위에 '조선의 목가구' 제목(처음 화면으로), 그 아래 도록 표지와 이름.
   BOOKS 는 index.html 의 DASHBOARDS 와 같은 내용(새 도록을 넣으면 여기에도 한 줄). */
(function () {
  var BOOKS = {"nmk": {"t": "국립중앙박물관 소장품", "d": "국립중앙박물관 소장품 검색으로 모은 우리 목가구", "n": 432, "g": "museum"}, "heritage": {"t": "국가유산 목공예", "d": "국가유산포털 유물·생활공예·목공예 — 국보·보물·민속문화유산 등 지정 문화유산", "n": 19, "g": "museum"}, "lee": {"t": "이건희 기증 목칠공예", "d": "국립중앙박물관 기증품 목록집(2023)", "n": 488, "g": ""}, "auction": {"t": "아이옥션 경매 목가구·목기", "d": "2022년 3월~2026년 10월 경매 38회 — 추정가·낙찰가", "n": 596, "g": "auction"}, "jikmul": {"t": "우리나라 전통 무늬 1 직물", "d": "국립문화재연구소 문양 조사보고서(2006)", "n": 184, "g": "ref"}, "dojagi": {"t": "우리나라 전통 무늬 2 도자기", "d": "국립문화재연구소 문양 조사보고서(2008)", "n": 219, "g": "ref"}, "najeon": {"t": "우리나라 전통 무늬 3 나전·화각", "d": "국립문화재연구소 문양 조사보고서(2014)", "n": 110, "g": "ref"}, "geumsok": {"t": "우리나라 전통 무늬 4 금속공예", "d": "국립문화재연구소 문양 조사보고서(2011)", "n": 213, "g": "ref"}, "munui": {"t": "우리나라 전통 무늬 5 목공예", "d": "국립문화재연구소 문양 조사보고서(2012)", "n": 164, "g": ""}, "yakjang": {"t": "약장, 건강을 염원하다", "d": "허준박물관·국립민속박물관 공동기획전 도록(2014)", "n": 53, "g": ""}, "wonju": {"t": "우리 나전, 새로 맞는 날", "d": "원주시역사박물관 소장품 특별전 도록(2024)", "n": 31, "g": ""}, "soban": {"t": "소반장(小盤匠)", "d": "국립문화재연구소 중요무형문화재 조사보고서(1997)", "n": 25, "g": ""}, "busan": {"t": "부산박물관 소장품 「민속」", "d": "부산박물관 소장품 도록 「민속」편 발췌", "n": 11, "g": ""}, "yangsan": {"t": "양산 반닫이", "d": "양산시립박물관 특별기획전 도록(2022)", "n": 30, "g": ""}, "minsok": {"t": "민속유물이해Ⅰ 목가구", "d": "국립민속박물관 민속유물이해Ⅰ(2003)", "n": 223, "g": ""}, "namu": {"t": "목가구, 나무의 이치를 담다", "d": "국립민속박물관·영인산산림박물관 공동기획전 도록(2016)", "n": 56, "g": ""}, "salm": {"t": "목가구, 삶을 담다", "d": "미리벌민속박물관·국립민속박물관 공동기획전 도록(2015)", "n": 53, "g": ""}, "migam": {"t": "목가구의 미감", "d": "국립민속박물관·은평역사한옥박물관 공동기획전 도록(2016)", "n": 55, "g": ""}, "kwon": {"t": "권옥연 화백 구장 조선목기", "d": "북촌민예관 개관전 도록(2012)", "n": 50, "g": ""}};
  var GROUP = { museum: '박물관자료', auction: '경매자료', ref: '도움자료', '': '도록' };
  var slug = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var css = document.createElement('style');
  css.textContent = [
    '.st-top{position:relative;max-width:1200px;margin:0 auto 6px;padding:6px 0 0;text-align:center;font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}',
    '.st-top .st-row{display:flex;align-items:flex-end;justify-content:center;gap:clamp(10px,2.6vw,30px)}',
    '.st-top .st-mark{flex:none;display:block;line-height:0;margin-bottom:clamp(4px,.7vw,8px);transition:opacity .15s}.st-top .st-mark:hover{opacity:.75}',
    '.st-top .st-mark img{display:block;width:auto;height:clamp(30px,4.6vw,52px);user-select:none}.st-top .st-mark.st-angwe img{height:clamp(27px,4.1vw,46px)}',
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
    '@media (max-width:420px){.st-top .st-mark img{height:26px}.st-top .st-mark.st-angwe img{height:23px}.st-top .st-mark{margin-bottom:5px}}',
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
    top.innerHTML = '<div class="st-row">' +
      '<a class="st-mark st-angwe" href="index.html" aria-label="처음 화면으로" title="처음 화면으로"><img src="mark_angwe.png" alt="안궤" width="328" height="200"></a>' +
      '<a class="st-title" href="index.html" title="처음 화면으로">조선의 목가구</a>' +
      '<a class="st-mark st-eonyang" href="index.html" aria-label="처음 화면으로" title="처음 화면으로"><img src="mark_eonyang_white.png" alt="언양반닫이" width="400" height="243"></a>' +
      '</div>';
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

/* 도록 안 검색 — 처음 화면과 같은 검색창을 도록 머리 아래에 두되, 이 도록의 기물에서만 찾는다.
   검색 색인(search.js)은 검색창을 처음 누를 때 불러온다. 결과를 누르면 사진 창이 열리고 결과 순서대로 좌우로 넘긴다. */
(function () {
  var slug = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var css = document.createElement('style');
  css.textContent = [
    '.st-find{max-width:1200px;margin:-8px auto 22px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;box-sizing:border-box}',
    '.st-find input{flex:1 1 320px;max-width:460px;font:inherit!important;font-size:14px!important;color:#1f2433!important;background:#fff!important;border:1px solid #e6e8f0!important;border-radius:999px!important;padding:9px 18px!important;outline:none;box-sizing:border-box;margin:0!important;height:auto!important}',
    '.st-find input:focus{border-color:#4b55d6!important}',
    '.st-find .st-scope{font-size:12.5px;font-weight:700;color:#6b7183;background:#f4f2ee;border-radius:999px;padding:5px 11px}',
    '.st-res{max-width:1200px;margin:0 auto 28px;font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;box-sizing:border-box}',
    '.st-res h3{margin:0 0 14px!important;font-size:19px!important;font-weight:900!important;letter-spacing:-.03em;color:#111!important;border:0!important;padding:0!important}.st-res h3 b{color:#4b55d6}',
    '.st-res h3 button{margin-left:10px;font:inherit;font-size:12.5px;font-weight:700;background:#fff;border:1px solid #e6e8f0;border-radius:999px;padding:3px 11px;cursor:pointer;color:#6b7183;vertical-align:2px}',
    '.st-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px}',
    '.st-it{position:relative;display:flex;flex-direction:column;text-align:left;font:inherit;color:inherit;background:#fff;border:1px solid #e6e8f0;border-radius:14px;padding:0;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .15s}',
    '.st-it:hover{transform:translateY(-2px);box-shadow:0 2px 4px rgba(20,24,60,.06),0 14px 34px rgba(20,24,60,.12)}',
    '.st-it .ph{aspect-ratio:1;background:#f6f6f4;display:grid;place-items:center}.st-it img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}',
    '.st-it .tx{padding:10px 12px 12px}.st-it .nm{font-weight:700;font-size:15px;letter-spacing:-.02em;line-height:1.3}.st-it .mt{margin-top:3px;font-size:12px;color:#6b7183;line-height:1.4}',
    '.st-more{display:block;margin:16px auto 0;font:inherit;font-weight:700;font-size:15px;background:#fff;border:1px solid #e6e8f0;border-radius:999px;padding:10px 28px;cursor:pointer}',
    '.st-empty{color:#6b7183;padding:24px 0;text-align:center}',
    '#st-dlg{border:none;border-radius:18px;padding:0;width:min(1100px,94vw);max-height:92vh;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:"Noto Sans KR",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#1f2433}',
    '#st-dlg::backdrop{background:rgba(20,20,24,.55)}',
    '#st-dlg .sd-body{display:flex;gap:24px;padding:22px;max-height:calc(92vh - 64px);overflow:auto}',
    '#st-dlg .sd-img{flex:1 1 60%;display:grid;place-items:center;min-height:300px;background:#fafaf8;border-radius:12px;overflow:hidden;touch-action:pan-y}',
    '#st-dlg .sd-img img{max-width:100%;max-height:72vh;object-fit:contain;user-select:none;-webkit-user-drag:none}',
    '#st-dlg .d-info{flex:1 1 40%;min-width:220px;text-align:left}',
    '#st-dlg .d-info h4{margin:4px 0 12px;font-size:26px;font-weight:900;letter-spacing:-.04em;line-height:1.25}#st-dlg .d-info h4 small{font-size:15px;color:#6b7183;font-weight:500;margin-left:8px}',
    '#st-dlg .d-info dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0;font-size:15px}#st-dlg .d-info dt{color:#6b7183}#st-dlg .d-info dd{margin:0}',
    '#st-dlg .sd-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 22px;border-top:1px solid #e6e8f0;font-size:14px;color:#6b7183}',
    '#st-dlg .sd-foot button{font:inherit;background:#fff;border:1px solid #e6e8f0;border-radius:8px;padding:6px 12px;cursor:pointer;color:#1f2433}#st-dlg .sd-foot button:disabled{opacity:.35;cursor:default}',
    '#st-dlg .sd-r{display:flex;gap:8px}',
    '@media (max-width:720px){#st-dlg .sd-body{flex-direction:column;padding:14px}#st-dlg .sd-img{min-height:220px}.st-grid{grid-template-columns:repeat(2,1fr);gap:10px}}',
    '@media print{.st-find,.st-res{display:none}}'
  ].join('');
  var PROV = /(경기|강원|충청|전라|경상|황해|평안|함경|제주)(남|북)?도/g;
  function norm(s) { return String(s).toLowerCase().replace(/\s+/g, '').replace(PROV, '$1$2'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var hits = [], cur = -1, limit = 60, loading = null, tmr = 0;
  function loadIndex() {
    if (window.SEARCH) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (ok) { var s = document.createElement('script'); s.src = 'search.js'; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
    return loading;
  }
  function run() {
    var cover = document.querySelector('.st-cover'); if (!cover) return;
    document.head.appendChild(css);
    var title = (cover.querySelector('h2') || {}).textContent || '이 도록';
    var box = document.createElement('div'); box.className = 'st-find';
    box.innerHTML = '<input type="search" id="st-q" placeholder="이 도록에서 물건 이름으로 찾기 — 예: 반닫이, 소반" aria-label="이 도록에서 찾기" autocomplete="off"><span class="st-scope">🔎 이 도록 안에서만 찾아요</span>';
    var res = document.createElement('section'); res.className = 'st-res'; res.id = 'st-res'; res.hidden = true;
    cover.parentNode.insertBefore(box, cover.nextSibling);
    box.parentNode.insertBefore(res, box.nextSibling);
    var dlg = document.createElement('dialog'); dlg.id = 'st-dlg'; dlg.setAttribute('aria-label', '기물 사진');
    dlg.innerHTML = '<div class="sd-body"><div class="sd-img"><img id="st-img" alt="" draggable="false"></div><div class="d-info" id="st-info"></div></div>' +
      '<div class="sd-foot"><button type="button" id="st-prev">← 이전</button><span id="st-pos"></span><span class="sd-r"><button type="button" id="st-next">다음 →</button><button type="button" id="st-close">닫기</button></span></div>';
    document.body.appendChild(dlg);
    var q = box.querySelector('input');
    q.addEventListener('focus', loadIndex);
    q.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(function () { loadIndex().then(search); }, 150); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { q.value = ''; search(); } });
    function search() {
      var raw = q.value, terms = raw.split(/[·,]/).map(norm).filter(Boolean);
      if (!terms.length) { res.hidden = true; res.innerHTML = ''; return; }
      hits = (window.SEARCH || []).filter(function (r) { return r.b === slug && terms.some(function (t) { return r.q.indexOf(t) >= 0 || norm(r.name).indexOf(t) >= 0; }); });
      hits.sort(function (a, b) { return a.n - b.n; });
      limit = 60; draw(raw.trim());
    }
    function draw(label) {
      res.hidden = false;
      var h = '<h3>‘' + esc(label) + '’ — 「' + esc(title) + '」에서 <b>' + hits.length.toLocaleString('ko-KR') + '</b>건<button type="button" data-clear="1">지우기</button></h3>';
      if (!hits.length) h += '<div class="st-empty">이 도록에는 찾는 물건이 없어요. 다른 이름으로 찾아보거나, 처음 화면에서 모든 도록을 찾아보세요.</div>';
      else h += '<div class="st-grid">' + hits.slice(0, limit).map(function (r, i) {
        return '<button type="button" class="st-it" data-i="' + i + '" data-cid="' + esc(r.b + '/' + r.pid) + '"><div class="ph">' + (r.t ? '<img loading="lazy" src="thumbs/' + r.b + '/' + r.n + '.jpg" alt="">' : '') + '</div>' +
          '<div class="tx"><div class="nm">' + esc(r.name) + '</div><div class="mt">' + esc([r.era, r.size].filter(Boolean).join(' · ')) + '</div></div></button>';
      }).join('') + '</div>' + (hits.length > limit ? '<button type="button" class="st-more" data-more="1">더 보기 (' + (hits.length - limit).toLocaleString('ko-KR') + '건 더)</button>' : '');
      res.innerHTML = h;
    }
    res.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.clear) { q.value = ''; search(); q.focus(); return; }
      if (b.dataset.more) { limit += 60; draw(q.value.trim()); return; }
      if (b.dataset.i != null) open(Number(b.dataset.i));
    });
    var img = dlg.querySelector('#st-img');
    function open(i) {
      var r = hits[i]; if (!r) return; cur = i;
      dlg.dataset.cid = r.b + '/' + r.pid;
      img.onerror = function () { if (r.t && img.src.indexOf('/thumbs/') < 0) img.src = 'thumbs/' + r.b + '/' + r.n + '.jpg'; };
      img.src = r.h ? 'photos/' + r.b + '/' + encodeURIComponent(r.pid) + '.jpg' : (r.t ? 'thumbs/' + r.b + '/' + r.n + '.jpg' : '');
      img.alt = r.name;
      var row = function (k, v) { return v ? '<dt>' + k + '</dt><dd>' + esc(v) + '</dd>' : ''; };
      dlg.querySelector('#st-info').innerHTML = '<h4>' + esc(r.name) + (r.hanja ? '<small>' + esc(r.hanja) + '</small>' : '') + '</h4>' +
        '<dl>' + row('종류', r.kind) + row('연대', r.era) + row('치수', r.size) + row('재질', r.wood) + row('소장', r.owner) + row('도록', r.page ? r.page + '쪽' : '') + '</dl>';
      dlg.querySelector('#st-pos').textContent = (i + 1) + ' / ' + hits.length;
      dlg.querySelector('#st-prev').disabled = i === 0; dlg.querySelector('#st-next').disabled = i === hits.length - 1;
      if (!dlg.open) dlg.showModal();
    }
    dlg.querySelector('#st-prev').addEventListener('click', function () { open(cur - 1); });
    dlg.querySelector('#st-next').addEventListener('click', function () { open(cur + 1); });
    dlg.querySelector('#st-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('textarea,input')) return;
      if (e.key === 'ArrowRight' && cur < hits.length - 1) { e.preventDefault(); e.stopPropagation(); open(cur + 1); }
      else if (e.key === 'ArrowLeft' && cur > 0) { e.preventDefault(); e.stopPropagation(); open(cur - 1); }
    });
    var x0 = null, y0 = 0;
    var area = dlg.querySelector('.sd-img');
    area.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } }, { passive: true });
    area.addEventListener('touchend', function (e) {
      if (x0 === null) return; var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0 && cur < hits.length - 1) open(cur + 1); else if (dx > 0 && cur > 0) open(cur - 1); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 0); }); else setTimeout(run, 0);
})();

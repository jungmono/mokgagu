/* 정대영 선생님 손지도 위에 꽂는 지역별 반닫이 지도.  window.MOKGAGU_BMAP.mount(el) */
(function () {
  const KEY = (window.MOKGAGU_KAKAO_KEY || 'c9f47b5a6780c5bb506586cda58fab6e');   // 카카오 JavaScript 키(도메인 jungmono.github.io 에만 허용됨)
  const LS = 'mokgagu_bmap_desc_v1';
  const S1 = '조선후기 경상도·전라도 반닫이 비교 연구', S2 = '반닫이 장석문양의 상징적 의미(경상도)', S3 = '선의 미감 목가구', S4 = '목가구의 미감 선·선·선';
  /* id, 한글, 한자, 상자 중심(x,y)(손지도 그림 좌표 1319×2000), 찾을 말, 위도·경도, 설명, 출처 */
  const R = [
    ['chosan', '초산', '楚山', 585, 320, ['초산'], 40.82, 125.22, '선생님 지도 맨 위쪽에 적어 두신 곳. 평안도 반닫이 계열의 북쪽 끝으로 보입니다.', '(자료 보강 필요 — 선생님께 여쭤볼 것)'],
    ['jeongju', '정주', '定州', 295, 590, ['정주'], 39.67, 125.19, '평안도 박천 가까운 곳. 평안도 반닫이는 높이가 높고 투각 장석이 전면을 덮는 것이 공통 특징입니다.', S2 + ' · (정주 자체 설명은 자료 보강 필요)'],
    ['bakcheon', '박천', '博川', 480, 590, ['박천', '숭숭이'], 39.85, 125.45, '평안북도 박천에서 만든 ‘숭숭이 반닫이’. 몸통은 목리가 잘 안 보이는 피나무라, 무쇠판에 만(卍)·아(亞)·꽃무늬를 정으로 투각한 장석을 전면 가득 붙여 화려하고 목재를 보강합니다. 크기도 다른 지방보다 크고(높이:가로 1:1.08) 높이가 높습니다.', S1 + ' · ' + S3],
    ['pyeongyang', '평양', '平壤', 505, 710, ['평양'], 39.02, 125.75, '느티나무 몸통에 장석과 경첩을 전면에 쓰고, 배가 볼록한 광두정을 많이 씁니다. 붕어·박쥐 모양 문양과 만(卍)자 들쇠가 보이며, 단단하면서 주석 장석으로 화려합니다(높이:가로 1:1.10).', S1],
    ['haeju', '해주', '海州', 225, 905, ['해주', '황해'], 38.04, 125.71, '황해도 해주 반닫이. 섬세하게 투각한 장석이 특징이며 평안도 박천 반닫이와 비슷합니다.', S3],
    ['gaeseong', '개성', '開城', 405, 880, ['개성'], 37.97, 126.55, '경기도 개성 반닫이. 호리병 모양 경첩과 전면 서랍이 달리고, 앞면이 칸으로 나뉜 단층장 같은 모양입니다.', S3],
    ['ganghwa', '강화', '江華', 255, 1040, ['강화'], 37.75, 126.49, '밀양과 함께 최고로 꼽히는 명품. 가운데 호리병형 경첩, 양쪽 아(亞)자 경첩, 아래 만(卍)자 경첩이 대표적입니다. 느티나무에 목리가 잘 보이고, 무쇠 장석은 변형된 수(壽)자 등을 투각하며 정돈되고 시원한 약과형입니다. 뻗침대가 천판 이마에 붙고, 다리는 풍혈 있는 마대(평마대)입니다.', S3 + ' · ' + S4 + ' · ' + S1],
    ['gyeongdo', '경도(서울)', '京都', 420, 1010, ['서울', '한양'], 37.57, 126.98, '선생님 지도의 가운데 동그라미. 도읍이라 경기·충청 반닫이의 기준점으로 두신 것으로 보입니다.', '(해석 — 선생님께 확인 필요)'],
    ['namhan', '남한산성', '南漢山城', 585, 1040, ['남한산성'], 37.48, 127.18, '경기도 남한산성 지역 반닫이. 전면에 큼지막한 원형 경첩이 달리고, 가운데 경첩을 거북이 모양으로 만들기도 합니다.', S3],
    ['sangju', '상주', '尙州', 835, 1040, ['상주', '안동', '성주', '봉화'], 36.41, 128.16, '경북 북부(상주·안동·성주·봉화) 반닫이. 강원도처럼 문판이 천판 안으로 들어간 액자형이고 높이가 낮으며, 양 옆널이 길게 내려와 다리 구실을 합니다. 경첩은 반원형, 감잡이는 연봉형을 많이 씁니다.', S2],
    ['yecheon', '예천', '醴泉', 960, 1035, ['예천'], 36.66, 128.45, '경북 북부 권역. 상주와 이웃해 액자형·낮은 높이 계열로 보이나 예천만의 설명은 자료 보강이 필요합니다.', '(자료 보강 필요)'],
    ['geumsan', '금산', '錦山', 480, 1195, ['금산'], 36.11, 127.49, '선생님 지도의 충청·전북 경계 지역. 충청도 반닫이는 장식이 적고 꼭 필요한 곳에만 배치해 다소 둔한 느낌이며 크기는 크지 않습니다.', S1 + ' (충청도 일반) · (금산 자체는 자료 보강 필요)'],
    ['eonyang', '언양', '彦陽', 1045, 1220, ['언양'], 35.57, 129.12, '울산 언양 반닫이. 경상도 계열(소나무·느티나무, 낮고 긴 형태)이며 언양만의 설명은 자료 보강이 필요합니다.', '(자료 보강 필요)'],
    ['iksan', '익산', '益山', 245, 1320, ['익산'], 35.95, 126.96, '전라도 내륙(전주·익산·남원·완주) 권역. 평야·해안보다 투각이 많아 화려하면서도 장석 크기가 면적에 알맞아 안정감이 있습니다.', S1],
    ['jeonju', '전주', '全州', 390, 1330, ['전주'], 35.82, 127.15, '전주권 반닫이. 장석이 두꺼운 편이고 앞바탕은 네모꼴·변형, 경첩은 네모·불로초 제비초리형, 들쇠는 배꼽장식을 겸한 것이 많고 감잡이는 불로초형을 씁니다. 다른 전라도 권역보다 화려합니다.', S1],
    ['namwon', '남원', '南原', 535, 1330, ['남원'], 35.42, 127.39, '전라도 내륙 권역으로 전주권과 함께 묶여, 투각이 많고 화려하지만 안정된 비례의 장석이 특징입니다.', S1],
    ['miryang', '밀양', '密陽', 755, 1335, ['밀양'], 35.5, 128.75, '강화와 더불어 최고로 꼽히는 경상도 반닫이. 무쇠에 정교한 투각, 견고한 무쇠 경첩, 앞바탕·감잡이의 만(卍)자문이 특징입니다. 경상도에서 가로·깊이·높이가 전체적으로 큰 편이고 문판과 앞널 비가 1:1.11로 거의 같습니다.', S3 + ' · ' + S1],
    ['yangsan', '양산', '梁山', 875, 1350, ['양산'], 35.34, 129.04, '경상도 반닫이 중 높이가 가장 높습니다(약 65cm). 경첩이 4개쯤 길게 붙어 꽉 찬 느낌이고, 하단은 제비추리형, 상단은 불로초형 두 가지입니다. 만자·팔괘문이 들어가며, 경첩 아래 만(卍)자를 여러 겹 겹친 문양은 양산에서만 독특하게 나타납니다.', S1],
    ['naju', '나주', '羅州', 250, 1505, ['나주'], 35.02, 126.71, '평균 규격이 가장 커서(가로 107·높이 80·깊이 48cm, 부피 1.5배쯤) 전국에서 평양 다음으로 큽니다. 장석은 가장 작고 절제해 목리를 살린 소박하고 단정한 느낌입니다. 사개물림 자리에 광두정이나 큰 쇠못을 박고, 문판 마구리에 문변자를 대며, 마름모꼴 배꼽장석에 만(卍)자를 투각합니다.', S1],
    ['yeonggwang', '영광', '靈光', 395, 1505, ['영광'], 35.28, 126.51, '평야지방(나주·광주·영광·정읍·고창)에 속해 금구장석이 간결하고 필요 이상 쓰지 않아 목리와 좋은 대조를 이룹니다.', S1],
    ['jinju', '진주', '晉州', 685, 1515, ['진주'], 35.18, 128.11, '밀양과 함께 경상남도에서 많이 만든 반닫이. 문판과 앞널의 비가 1:1.34로 경상도에서 가장 크게 차이 나며, 내륙지방이라 투각 장석이 화려합니다.', S1],
    ['gimhae', '김해', '金海', 935, 1520, ['김해'], 35.23, 128.88, '평야지방 반닫이로 크기는 작은 편이고, 장석이 간결합니다.', S1],
    ['jangheung', '장흥', '長興', 475, 1605, ['장흥', '해남', '목포', '고흥'], 34.68, 126.91, '서·남해안권. 장석이 둥글둥글한 불로초 제비초리형·인동초형·쌍버선코형이고, 앞바탕과 경첩이 전면을 거의 덮을 만큼 큽니다. 감잡이는 연봉형 거멀잡이, 문판 끝에는 국화형 광두정을 씁니다. 제주 반닫이와 닮았습니다.', S1],
    ['namhae', '남해', '南海', 655, 1610, ['남해'], 34.84, 127.89, '해안지방 반닫이. 경상도 중 가로 길이가 가장 길어(약 100cm) 옆으로 퍼진 모양이며 곡선이 부드럽고 투박한 멋이 있습니다.', S1],
    ['tongyeong', '동영(통영)', '統營', 830, 1610, ['통영', '충무', '동영'], 34.85, 128.43, '옛 충무. 경상도 반닫이 중 높이가 가장 낮고 옆으로 퍼진 해안지방 반닫이입니다.', S1],
    ['jeju', '제주', '濟州', 465, 1790, ['제주'], 33.5, 126.53, '느티나무·먹구슬나무 등을 쓰고 전라도(특히 서·남해안) 영향이 큽니다. 실패형 경첩, 배가 부른 마름모꼴 광두정, 긴 팽감잡이가 전면을 꽉 채워 남성적이고 강렬합니다.', S1],
  ];
  const PROV = [['평안도', ['평안']], ['황해도', ['황해']], ['경기도', ['경기']], ['강원도', ['강원']], ['충청도', ['충청']], ['경상도', ['경상']], ['전라도', ['전라']], ['제주도', ['제주도']]];
  const AUC = { auction: 1, myart: 1 };
  const TYPES = [['m', '박물관 소장', '#0F6E56'], ['a', '경매 출품', '#BA7517'], ['o', '소장품', '#111111']];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const load = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} };

  function pins() {
    const all = (window.SEARCH || []).filter((r) => /반닫이/.test(r.name + (r.hanja || '')));
    const by = {}; R.forEach((g) => { by[g[0]] = { m: [], a: [], o: [] }; });
    const prov = {}; PROV.forEach((p) => { prov[p[0]] = { m: [], a: [], o: [] }; });
    all.forEach((r) => {
      const t = AUC[r.b] ? 'a' : 'm', hay = r.name + (r.hanja || '') + (r.q || '');
      let hit = false;
      R.forEach((g) => { if (g[5].some((k) => hay.includes(k))) { by[g[0]][t].push(r); hit = true; } });
      if (!hit) PROV.forEach((p) => { if (p[1].some((k) => hay.includes(k))) prov[p[0]][t].push(r); });
    });
    return { by, prov };
  }

  function mount(el) {
    const P = pins(), edits = load(); let on = { m: true, a: true, o: true }, sel = '';
    const cnt = (o) => (on.m ? o.m.length : 0) + (on.a ? o.a.length : 0) + (on.o ? o.o.length : 0);
    const W = 130, H = 86;
    el.innerHTML = `<div class="bm"><style>
.bm{--g:#0F6E56;--a:#BA7517;--k:#111;font-family:inherit}
.bm .bm-t{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 8px}
.bm .bm-t button{border:1.5px solid #cdbf9f;background:#fff;border-radius:999px;padding:5px 11px;font:inherit;font-size:13px;cursor:pointer}
.bm .bm-t button[aria-pressed=true]{color:#fff;border-color:transparent}
.bm svg{width:100%;height:auto;max-height:78vh;background:#fbf6ea;border:1px solid #e3d6b8;border-radius:14px;display:block}
.bm .bx{cursor:pointer}.bm .bx rect{fill:#fffdf6;stroke:#6f6450;stroke-width:3}.bm .bx.has rect{fill:#f3e6c4}.bm .bx.sel rect{stroke:#0F6E56;stroke-width:7;fill:#e1f1ea}
.bm .bx text{fill:#3b3326;pointer-events:none;text-anchor:middle}.bm .bx .hj{font-size:28px;font-family:serif}.bm .bx .hg{font-size:34px;font-weight:800}
.bm .bx.dim{opacity:.55}
.bm #bm-p{margin-top:10px;border:1px solid #e3d6b8;background:#fff;border-radius:14px;padding:14px}
.bm #bm-p h3{margin:0 0 4px;font-size:18px}.bm #bm-p .src{font-size:12px;color:#7a6c50;margin-top:6px}
.bm .bm-it{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.bm .bm-it button{display:flex;gap:6px;align-items:center;border:1px solid #e3d6b8;background:#fffdf6;border-radius:10px;padding:3px 8px 3px 3px;font:inherit;font-size:12px;cursor:pointer;text-align:left}
.bm .bm-it img{width:44px;height:44px;object-fit:cover;border-radius:7px}.bm .bm-it i{width:9px;height:9px;border-radius:50%;display:inline-block}
.bm textarea{width:100%;min-height:120px;font:inherit;font-size:14px;border:1px solid #cdbf9f;border-radius:8px;padding:8px}
.bm .bm-b button{border:1px solid #cdbf9f;background:#fff;border-radius:8px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer;margin:6px 6px 0 0}
.bm .bm-pv{margin-top:12px;font-size:13px}.bm .bm-pv button{border:1px solid #e3d6b8;background:#fffdf6;border-radius:999px;padding:3px 9px;font:inherit;font-size:12px;margin:2px;cursor:pointer}
.bm #bm-k{height:220px;margin-top:10px;border-radius:10px}
</style>
<div class="bm-t" id="bm-t">${TYPES.map(([k, n, c]) => `<button type="button" data-k="${k}" aria-pressed="true" style="background:${c}">${n}</button>`).join('')}<small style="color:#7a6c50">상자를 누르면 설명과 기물이 나옵니다</small></div>
<svg viewBox="0 0 1319 1960" role="img" aria-label="정대영 선생님 손지도">
<path d="M170 480 L95 420 L225 300 L1010 180 L1190 160 L1240 380 L1085 500 L1085 1800 L170 1780 Z" fill="none" stroke="#9c9179" stroke-width="3" stroke-linejoin="round"/>
<g id="bm-g"></g></svg>
<div id="bm-p"><div class="src">지도에서 지역 상자를 눌러 보세요. 점의 색은 위 버튼과 같습니다.</div></div>
<div class="bm-pv" id="bm-pv"></div></div>`;
    const g = el.querySelector('#bm-g'), panel = el.querySelector('#bm-p');
    function draw() {
      g.innerHTML = R.map((r) => {
        const p = P.by[r[0]], n = cnt(p), x = r[3] - W / 2, y = r[4] - H / 2;
        const dots = TYPES.map(([k, , c], i) => (on[k] && p[k].length ? `<circle cx="${x + 24 + i * 40}" cy="${y + H + 4}" r="17" fill="${c}"/><text x="${x + 24 + i * 40}" y="${y + H + 10}" style="font-size:20px;font-weight:800;fill:#fff;text-anchor:middle">${p[k].length}</text>` : '')).join('');
        return `<g class="bx ${n ? 'has' : ''} ${sel === r[0] ? 'sel' : ''}" data-id="${r[0]}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="8"/><text class="hj" x="${r[3]}" y="${y + 34}">${r[2]}</text><text class="hg" x="${r[3]}" y="${y + 72}">${esc(r[1]).replace(/\(.*\)/, '')}</text>${dots}</g>`;
      }).join('');
    }
    function items(o) {
      return TYPES.filter(([k]) => on[k] && o[k] && o[k].length).map(([k, n, c]) => o[k].map((r) =>
        `<button type="button" data-cid="${esc(r.b + '/' + r.pid)}"><img loading="lazy" alt="" src="thumbs/${r.b}/${r.n}.jpg" onerror="this.style.visibility='hidden'"><span><i style="background:${c}"></i>${esc((r.owner || n).slice(0, 12))}<br>${esc((r.era || '') + ' ' + (r.size || '').slice(0, 14))}</span></button>`).join('')).join('');
    }
    function show(id) {
      sel = id; draw(); const r = R.find((x) => x[0] === id), p = P.by[id], d = edits[id] != null ? edits[id] : r[8];
      panel.innerHTML = `<h3>${esc(r[1])} <small style="font-weight:400;color:#7a6c50">${r[2]}</small></h3><div id="bm-d" style="white-space:pre-wrap;line-height:1.65">${esc(d)}</div>
<div class="src">출처: ${esc(r[9])}${edits[id] != null ? ' · (고친 글)' : ''}</div>
<div class="bm-b"><button type="button" id="bm-e">설명 고치기</button>${KEY ? '<button type="button" id="bm-kk">실제 위치(카카오맵)</button>' : ''}</div><div id="bm-k" hidden></div>
<div class="bm-it">${items(p) || '<span class="src">이 지역으로 분류된 기물이 아직 없어요.</span>'}</div>`;
      panel.querySelector('#bm-e').onclick = () => {
        panel.querySelector('#bm-d').outerHTML = `<textarea id="bm-ta">${esc(d)}</textarea>`;
        panel.querySelector('.bm-b').innerHTML = '<button type="button" id="bm-s">저장</button><button type="button" id="bm-r">처음 글로</button>';
        panel.querySelector('#bm-s').onclick = () => { edits[id] = panel.querySelector('#bm-ta').value; save(edits); show(id); };
        panel.querySelector('#bm-r').onclick = () => { delete edits[id]; save(edits); show(id); };
      };
      const kk = panel.querySelector('#bm-kk');
      if (kk) kk.onclick = () => kakao(panel.querySelector('#bm-k'), r[6], r[7]);
    }
    function kakao(box, lat, lng) {
      box.hidden = false;
      const go = () => kakao_.maps.load(() => { const c = new kakao_.maps.LatLng(lat, lng); const m = new kakao_.maps.Map(box, { center: c, level: 9 }); new kakao_.maps.Marker({ position: c, map: m }); });
      if (window.kakao && window.kakao.maps) { window.kakao_ = window.kakao; return go(); }
      const s = document.createElement('script'); s.src = '//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=' + KEY; s.onload = () => { window.kakao_ = window.kakao; go(); }; document.head.appendChild(s);
    }
    function provs() {
      el.querySelector('#bm-pv').innerHTML = '<b>도(道) 단위로 분류된 기물</b> ' + PROV.map(([n]) => { const c = cnt(P.prov[n]); return c ? `<button type="button" data-p="${n}">${n} ${c}</button>` : ''; }).join('');
    }
    el.querySelector('#bm-t').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; on[b.dataset.k] = !on[b.dataset.k]; b.setAttribute('aria-pressed', on[b.dataset.k]); draw(); provs(); if (sel) show(sel); });
    g.addEventListener('click', (e) => { const b = e.target.closest('.bx'); if (b) show(b.dataset.id); });
    el.addEventListener('click', (e) => {
      const it = e.target.closest('[data-cid]'); if (it && el.contains(it)) { location.href = 'index.html#see=' + it.dataset.cid; return; }
      const pv = e.target.closest('[data-p]'); if (pv) { sel = ''; draw(); const p = P.prov[pv.dataset.p]; panel.innerHTML = `<h3>${pv.dataset.p}</h3><div class="src">지역(고을)이 적혀 있지 않고 도 이름만 있는 기물입니다.</div><div class="bm-it">${items(p)}</div>`; }
    });
    draw(); provs();
  }
  window.MOKGAGU_BMAP = { mount };
})();

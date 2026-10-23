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
    ['gyeongdo', '서울', '京都', 420, 1010, ['서울', '한양'], 37.57, 126.98, '선생님 지도의 가운데 동그라미. 도읍이라 경기·충청 반닫이의 기준점으로 두신 것으로 보입니다.', '(해석 — 선생님께 확인 필요)'],
    ['namhan', '남한산성', '南漢山城', 585, 1040, ['남한산성'], 37.48, 127.18, '경기도 남한산성 지역 반닫이. 전면에 큼지막한 원형 경첩이 달리고, 가운데 경첩을 거북이 모양으로 만들기도 합니다.', S3],
    ['sangju', '상주', '尙州', 835, 1262, ['상주', '안동', '성주', '봉화'], 36.41, 128.16, '경북 북부(상주·안동·성주·봉화) 반닫이. 강원도처럼 문판이 천판 안으로 들어간 액자형이고 높이가 낮으며, 양 옆널이 길게 내려와 다리 구실을 합니다. 경첩은 반원형, 감잡이는 연봉형을 많이 씁니다.', S2],
    ['yecheon', '예천', '醴泉', 960, 1262, ['예천'], 36.66, 128.45, '경북 북부 권역. 상주와 이웃해 액자형·낮은 높이 계열로 보이나 예천만의 설명은 자료 보강이 필요합니다.', '(자료 보강 필요)'],
    ['geumsan', '금산', '錦山', 480, 1195, ['금산'], 36.11, 127.49, '선생님 지도의 충청·전북 경계 지역. 충청도 반닫이는 장식이 적고 꼭 필요한 곳에만 배치해 다소 둔한 느낌이며 크기는 크지 않습니다.', S1 + ' (충청도 일반) · (금산 자체는 자료 보강 필요)'],
    ['eonyang', '언양', '彦陽', 1030, 1490, ['언양'], 35.57, 129.12, '울산 언양 반닫이. 경상도 계열(소나무·느티나무, 낮고 긴 형태)이며 언양만의 설명은 자료 보강이 필요합니다.', '(자료 보강 필요)'],
    ['iksan', '익산', '益山', 245, 1470, ['익산'], 35.95, 126.96, '전라도 내륙(전주·익산·남원·완주) 권역. 평야·해안보다 투각이 많아 화려하면서도 장석 크기가 면적에 알맞아 안정감이 있습니다.', S1],
    ['jeonju', '전주', '全州', 390, 1470, ['전주'], 35.82, 127.15, '전주권 반닫이. 장석이 두꺼운 편이고 앞바탕은 네모꼴·변형, 경첩은 네모·불로초 제비초리형, 들쇠는 배꼽장식을 겸한 것이 많고 감잡이는 불로초형을 씁니다. 다른 전라도 권역보다 화려합니다.', S1],
    ['namwon', '남원', '南原', 535, 1470, ['남원'], 35.42, 127.39, '전라도 내륙 권역으로 전주권과 함께 묶여, 투각이 많고 화려하지만 안정된 비례의 장석이 특징입니다.', S1],
    ['miryang', '밀양', '密陽', 745, 1395, ['밀양'], 35.5, 128.75, '강화와 더불어 최고로 꼽히는 경상도 반닫이. 무쇠에 정교한 투각, 견고한 무쇠 경첩, 앞바탕·감잡이의 만(卍)자문이 특징입니다. 경상도에서 가로·깊이·높이가 전체적으로 큰 편이고 문판과 앞널 비가 1:1.11로 거의 같습니다.', S3 + ' · ' + S1],
    ['yangsan', '양산', '梁山', 915, 1410, ['양산'], 35.34, 129.04, '경상도 반닫이 중 높이가 가장 높습니다(약 65cm). 경첩이 4개쯤 길게 붙어 꽉 찬 느낌이고, 하단은 제비추리형, 상단은 불로초형 두 가지입니다. 만자·팔괘문이 들어가며, 경첩 아래 만(卍)자를 여러 겹 겹친 문양은 양산에서만 독특하게 나타납니다.', S1],
    ['naju', '나주', '羅州', 240, 1640, ['나주'], 35.02, 126.71, '평균 규격이 가장 커서(가로 107·높이 80·깊이 48cm, 부피 1.5배쯤) 전국에서 평양 다음으로 큽니다. 장석은 가장 작고 절제해 목리를 살린 소박하고 단정한 느낌입니다. 사개물림 자리에 광두정이나 큰 쇠못을 박고, 문판 마구리에 문변자를 대며, 마름모꼴 배꼽장석에 만(卍)자를 투각합니다.', S1],
    ['yeonggwang', '영광', '靈光', 385, 1640, ['영광'], 35.28, 126.51, '평야지방(나주·광주·영광·정읍·고창)에 속해 금구장석이 간결하고 필요 이상 쓰지 않아 목리와 좋은 대조를 이룹니다.', S1],
    ['jinju', '진주', '晉州', 685, 1565, ['진주'], 35.18, 128.11, '밀양과 함께 경상남도에서 많이 만든 반닫이. 문판과 앞널의 비가 1:1.34로 경상도에서 가장 크게 차이 나며, 내륙지방이라 투각 장석이 화려합니다.', S1],
    ['gimhae', '김해', '金海', 895, 1580, ['김해'], 35.23, 128.88, '평야지방 반닫이로 크기는 작은 편이고, 장석이 간결합니다.', S1],
    ['jangheung', '장흥', '長興', 520, 1700, ['장흥', '해남', '목포', '고흥', '영암'], 34.68, 126.91, '서·남해안권. 장석이 둥글둥글한 불로초 제비초리형·인동초형·쌍버선코형이고, 앞바탕과 경첩이 전면을 거의 덮을 만큼 큽니다. 감잡이는 연봉형 거멀잡이, 문판 끝에는 국화형 광두정을 씁니다. 제주 반닫이와 닮았습니다.', S1],
    ['namhae', '남해', '南海', 655, 1712, ['남해'], 34.84, 127.89, '해안지방 반닫이. 경상도 중 가로 길이가 가장 길어(약 100cm) 옆으로 퍼진 모양이며 곡선이 부드럽고 투박한 멋이 있습니다.', S1],
    ['tongyeong', '통영', '統營', 830, 1712, ['통영', '충무'], 34.85, 128.43, '옛 충무. 경상도 반닫이 중 높이가 가장 낮고 옆으로 퍼진 해안지방 반닫이입니다.', S1],
    ['jeju', '제주', '濟州', 250, 1885, ['제주'], 33.5, 126.53, '느티나무·먹구슬나무 등을 쓰고 전라도(특히 서·남해안) 영향이 큽니다. 실패형 경첩, 배가 부른 마름모꼴 광두정, 긴 팽감잡이가 전면을 꽉 채워 남성적이고 강렬합니다.', S1],
  ];
  /* 도 이름표 아이콘: 그 지방 반닫이 장석의 특징을 단순한 선으로 */
  const PI = {
    '평안도': '<clipPath id="pyc"><rect x="8" y="8" width="16" height="16"/></clipPath><rect x="4.5" y="4.5" width="23" height="23" rx="2"/><g clip-path="url(#pyc)" stroke-width="1.1"><path d="M8 -8 L24 8 M8 8 L24 -8M8 -4 L24 12 M8 12 L24 -4M8 0 L24 16 M8 16 L24 0M8 4 L24 20 M8 20 L24 4M8 8 L24 24 M8 24 L24 8M8 12 L24 28 M8 28 L24 12M8 16 L24 32 M8 32 L24 16M8 20 L24 36 M8 36 L24 20M8 24 L24 40 M8 40 L24 24"/></g><circle cx="7.3" cy="24.7" r="1" fill="currentColor"/><circle cx="24.7" cy="24.7" r="1" fill="currentColor"/><circle cx="7.3" cy="7.3" r="1" fill="currentColor"/><circle cx="24.7" cy="7.3" r="1" fill="currentColor"/>',
    '함경도': '<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="6.5"/><circle cx="16" cy="16" r="1.6" fill="currentColor"/>',
    '황해도': '<rect x="5" y="5" width="22" height="22" rx="5"/><path d="M16 10v12M10 16h12"/><circle cx="16" cy="16" r="2.2"/>',
    '경기도': '<circle cx="16" cy="16" r="11"/><path d="M5 16a5.5 5.5 0 0 0 11 0a5.5 5.5 0 0 1 11 0"/><circle cx="10.5" cy="17" r="1.5" fill="currentColor"/><circle cx="21.5" cy="15" r="1.5" fill="currentColor"/>',
    '강원도': '<circle cx="16" cy="16" r="2.4"/><circle cx="16" cy="8.6" r="2.5"/><circle cx="21.79" cy="11.39" r="2.5"/><circle cx="23.21" cy="17.65" r="2.5"/><circle cx="19.21" cy="22.67" r="2.5"/><circle cx="12.79" cy="22.67" r="2.5"/><circle cx="8.79" cy="17.65" r="2.5"/><circle cx="10.21" cy="11.39" r="2.5"/>',
    '충청도': '<path d="M6.5 26V15.5a9.5 9.5 0 0 1 19 0V26z"/><circle cx="11" cy="22" r="1.4" fill="currentColor"/><circle cx="21" cy="22" r="1.4" fill="currentColor"/><circle cx="16" cy="13.5" r="1.4" fill="currentColor"/>',
    '경상도': '<path d="M16 2.5Q20.39 11.61 29.5 16Q20.39 20.39 16 29.5Q11.61 20.39 2.5 16Q11.61 11.61 16 2.5Z"/>',
    '전라도': '<rect x="10.5" y="3.5" width="11" height="25" rx="1.8"/><circle cx="16" cy="9.5" r="1.7" fill="currentColor"/><circle cx="16" cy="16" r="1.7" fill="currentColor"/><circle cx="16" cy="22.5" r="1.7" fill="currentColor"/>',
    '제주도': '<path d="M11 29V20.5C11 18.5 7.5 18 5.5 16.5C3 14.5 3 10 6.5 9C9 8.5 11.5 10 12 12.5V6C12 3.5 13.5 2.5 14.5 2.5C15.8 2.5 16 4 16 6C16 4 16.2 2.5 17.5 2.5C18.5 2.5 20 3.5 20 6V12.5C20.5 10 23 8.5 25.5 9C29 10 29 14.5 26.5 16.5C24.5 18 21 18.5 21 20.5V29Z"/><circle cx="16" cy="22.2" r="3.4"/><path d="M16 20v4.4M13.8 22.2h4.4"/>',   // 제주 장석(네 갈래 꽃잎 판, 가운데 둥근 문양)
  };
  const PROV = [['평안도', ['평안']], ['함경도', ['함경']], ['황해도', ['황해']], ['경기도', ['경기']], ['강원도', ['강원']], ['충청도', ['충청']], ['경상도', ['경상']], ['전라도', ['전라']], ['제주도', ['제주도']]];
  /* 도 → 선생님 지도에 있는 고을. 색·글자 자리는 지도 위에 도를 크게 적어 두기 위한 것 */
  const PV = {
    '평안도': ['#2f6fb0', ['chosan', 'jeongju', 'bakcheon', 'pyeongyang'], 420, 470, 650, 470],
    '함경도': ['#6b4fa3', [], 930, 640, 930, 710],
    '황해도': ['#b0572f', ['haeju'], 256, 838, 256, 1000],
    '경기도': ['#0F6E56', ['gaeseong', 'ganghwa', 'gyeongdo', 'namhan'], 440, 1118, 640, 885],
    '강원도': ['#c2185b', [], 900, 860, 900, 960],
    '충청도': ['#8a6d00', ['geumsan'], 300, 1215, 620, 1190],
    '경상도': ['#d4541a', ['sangju', 'yecheon', 'eonyang', 'miryang', 'yangsan', 'jinju', 'gimhae', 'namhae', 'tongyeong'], 1000, 1690, 900, 1150],
    '전라도': ['#1a7a8c', ['iksan', 'jeonju', 'namwon', 'naju', 'yeonggwang', 'jangheung'], 260, 1335, 530, 1335],
    '제주도': ['#5a7d1a', ['jeju'], 540, 1905, 540, 1905],
  };
  const AUC = { auction: 1, myart: 1 };
  const MUS = { nmk: 1, heritage: 1, horim: 1 };   // 박물관자료 폴더(국립중앙박물관 소장품·국가유산)
  const TICON = {
    m: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M1.5 15.5h45v3h-45z" fill="currentColor"/><path d="M3 18.5v13h14v-13M31 18.5v13h14v-13"/><path d="M3 23h14M3 27h14M31 23h14M31 27h14" stroke-width="1.2"/><path d="M17 31.5h14M15.5 34h17M14 36.5h20" stroke-width="1.6"/><path d="M1.5 31.5h12.5M34 31.5h12.5"/><path d="M6 40.5h36" stroke-width="1.5"/><path d="M11 43.5h26" stroke-width="1.2"/></svg>',
    a: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><g transform="rotate(-40 22 18)"><rect x="12" y="10" width="20" height="9" rx="2"/><path d="M15 10v9M29 10v9"/><path d="M22 19v19"/></g><path d="M26 41h17"/><rect x="28.5" y="36.5" width="12" height="4.5" rx="1"/><path d="M8 8l2.5 2.5M5 14h3.5M13 4.5v3.5" stroke-width="1.8"/></svg>',
    e: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M4 15 24 5l20 10z"/><path d="M6 15v27h36V15"/><path d="M6 28.5h36M4 42h40"/><path d="M10 27.5v-9M13.5 27.5v-7M17 27.5v-9M20.5 27.5v-8M25 27.5l3-8.5M31 27.5v-9M34.5 27.5v-7M38 27.5v-9"/><path d="M10 41v-9M13.5 41v-7.5M17 41v-9M21 41v-6.5M24.5 41v-9M28 41v-8M33 41l2.5-8M38 41v-9"/><circle cx="24" cy="11.5" r="1.6"/></svg>',
    o: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8" width="25" height="16.5" rx=".8"/><path d="M3.5 15.5h25"/><path d="M5 24.5v3M27 24.5v3"/><path d="M8.5 8v5.5h3V8M20.5 8v5.5h3V8"/><path d="M13.5 15.5h5v4.2l-2.5 1.8-2.5-1.8z"/></svg>',
  };
  const TYPES = [['m', '박물관 소장', '#0F6E56'], ['a', '경매 출품', '#BA7517'], ['e', '기타', '#5b6fa8'], ['o', '소장품', '#111111']];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const load = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} };

  const API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  const ls = (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const code = () => ls('mokgagu_cm_code') || ls('mokgagu_study_pw');
  const who = () => ls('mokgagu_write_who') || (ls('mokgagu_cm_who') === '힌' ? '힌' : '거믄');
  const get = (a) => fetch(API + '?action=' + a + '&code=' + encodeURIComponent(code()), { cache: 'no-store' }).then((r) => r.json());
  const post = (o) => fetch(API, { method: 'POST', body: JSON.stringify(Object.assign({ code: code() }, o)) }).then((r) => r.json());

  /* 반닫이(궤)여지도에 넣는 것: 반닫이, 그리고 이름이 궤·장·함으로 끝나는 것(김해궤→김해, 전주장→전주) */
  const clean = (n) => String(n || '').replace(/\([^)]*\)|[^가-힣]/g, '');
  const KIND = /(반닫이|궤|장|함)$/;
  const isKind = (r) => /반닫이/.test(r.name + (r.hanja || '')) || (KIND.test(clean(r.name)) && !(r.b === 'soban' || /소반|장인|무형/.test(r.name)));
  const hayOf = (r) => { const q = /반닫이/.test(r.name + (r.hanja || '')) ? (r.q || '') : String(r.q || '').split(/\s+/).filter((w) => !/박물관|연구소|옥션|경매|도록|보고서/.test(w)).join(' '); return (r.name + (r.hanja || '') + q).replace(/나전/g, ''); };   // 나전주흑칠…의 '전주'는 지역이 아니다
  
  function pins() {
    const all = (window.SEARCH || []).filter(isKind);
    const by = {}; R.forEach((g) => { by[g[0]] = { m: [], a: [], e: [], o: [] }; });
    const prov = {}; PROV.forEach((p) => { prov[p[0]] = { m: [], a: [], e: [], o: [] }; });
    all.forEach((r) => {
      const t = AUC[r.b] ? 'a' : MUS[r.b] ? 'm' : 'e', hay = hayOf(r);
      let hit = false;
      R.forEach((g) => { if (g[5].some((k) => hay.includes(k))) { by[g[0]][t].push(r); hit = true; } });
      if (!hit) PROV.forEach((p) => { if (p[1].some((k) => hay.includes(k))) prov[p[0]][t].push(r); });
    });
    return { by, prov };
  }
  /* 우리 소장품(가족 시트): 이름·종류에 반닫이가 들어 있고 지금 소장 중인 것만 */
  function addOwn(P, list) {
    (list || []).filter((c) => (/반닫이/.test((c.name || '') + (c.kind || '')) || KIND.test(clean(c.name))) && !c.sold && (!c.status || c.status === '소장')).forEach((c) => {
      const hay = (c.name || '') + (c.kind || '') + (c.note || '') + (c.place || '') + (c.memo || '');
      let hit = false;
      R.forEach((g) => { if (g[5].some((k) => hay.includes(k))) { P.by[g[0]].o.push({ own: 1, name: c.name, era: c.era, size: c.size, id: c.id, c: c, f: ((c.photos || [])[0] || {}).f, t: ((c.photos || [])[0] || {}).t }); hit = true; } });
      if (!hit) PROV.forEach((p) => { if (p[1].some((k) => hay.includes(k))) P.prov[p[0]].o.push({ own: 1, name: c.name, era: c.era, size: c.size, id: c.id, c: c, f: ((c.photos || [])[0] || {}).f, t: ((c.photos || [])[0] || {}).t }); });
    });
  }

  function mount(el) {
    const P = pins(), local = load(), edits = Object.assign({}, local), meta = {};
    let on = { m: true, a: true, e: true, o: true }, sel = '', selP = '', list = [];
    const W = 130, H = 86, PN = Object.keys(PV);
    const provOf = {}; PN.forEach((p) => PV[p][1].forEach((id) => { provOf[id] = p; }));
    const cntT = (o) => (on.m ? o.m.length : 0) + (on.a ? o.a.length : 0) + (on.e ? o.e.length : 0) + (on.o ? o.o.length : 0);
    const merge = (ids, pn) => { const o = { m: [], a: [], e: [], o: [] }; ids.forEach((id) => { ['m', 'a', 'e', 'o'].forEach((k) => o[k].push(...P.by[id][k])); }); if (pn) ['m', 'a', 'e', 'o'].forEach((k) => o[k].push(...P.prov[pn][k])); return o; };
    const ink = el.dataset.ink !== undefined ? el.dataset.ink : (window.MOKGAGU_INK !== undefined ? window.MOKGAGU_INK : 'b'), uid = 'k' + Math.random().toString(36).slice(2, 7);
    const LAND = 'M170 480 L95 420 L225 300 L1010 180 L1190 160 L1240 380 L1085 500 L1085 1800 L170 1780 Z';
    /* 지도 바깥 바탕: 없으면 예전 그대로, a·b·c 는 수묵 시안 */
    const base = () => {
      if (!ink) return `<path d="${LAND}" fill="none" stroke="#9c9179" stroke-width="3" stroke-linejoin="round"/>`;
      const f = `<defs><filter id="${uid}e" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="16"/></filter><filter id="${uid}b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="38"/></filter><filter id="${uid}s"><feGaussianBlur stdDeviation="9"/></filter></defs>`;
      const isle = `<ellipse cx="290" cy="1888" rx="150" ry="72" fill="#fbf6ea" stroke="#3a352b" stroke-width="4" filter="url(#${uid}e)"/>`;
      if (ink === 'a') return f + `<rect width="1319" height="1960" fill="#e4d9bd"/><g filter="url(#${uid}b)" fill="#6d6551" opacity=".22"><ellipse cx="80" cy="700" rx="140" ry="380"/><ellipse cx="1260" cy="1200" rx="150" ry="420"/><ellipse cx="700" cy="60" rx="520" ry="110"/></g><path d="${LAND}" fill="#fbf6ea"/><path d="${LAND}" fill="none" stroke="#2f2a21" stroke-width="7" stroke-linejoin="round" filter="url(#${uid}e)"/>${isle}`;
      if (ink === 'b') return f + `<path d="${LAND}" fill="#fbf6ea"/><path d="${LAND}" fill="none" stroke="#3a352b" stroke-width="6" stroke-linejoin="round" filter="url(#${uid}e)"/>${isle}`;
      return f + `<rect width="1319" height="1960" fill="#2b2925"/><g filter="url(#${uid}b)" fill="#fff" opacity=".07"><ellipse cx="90" cy="900" rx="130" ry="400"/><ellipse cx="1240" cy="1300" rx="140" ry="420"/></g><path d="${LAND}" fill="#fbf6ea" stroke="#0b0a09" stroke-width="16" stroke-linejoin="round" filter="url(#${uid}e)"/>${isle.replace('stroke="#3a352b"', 'stroke="#0b0a09"')}`;
    };
    el.innerHTML = `<div class="bm"><style>
.bm{font-family:inherit}
.bm .bm-sv{width:100%;height:auto;max-height:90vh;background:#fbf6ea;border:1px solid #e3d6b8;border-radius:14px;display:block}
.bm .bm-pb,.bm .bm-t{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 12px}
.bm .bm-pb button,.bm .bm-t button{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;width:72px;padding:10px 2px 8px;font:inherit;font-size:13px;font-weight:700;color:#1f2433;background:#fff;border:1px solid #e6e8f0;border-radius:14px;cursor:pointer;transition:transform .15s,border-color .15s;line-height:1.2}
.bm .bm-pb button:hover,.bm .bm-t button:hover{transform:translateY(-2px);border-color:#6b7183}
.bm .bm-pb button[aria-pressed=true],.bm .bm-t button[aria-pressed=true]{border-color:#1f2433;box-shadow:inset 0 0 0 1px #1f2433}
.bm .bm-t button{width:96px}.bm .bm-t button[aria-pressed=false]{opacity:.45}
.bm .bi{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:#f1efeb;color:#1d1b18}.bm .bi svg{width:32px;height:32px}.bm .bm-t .bi svg{width:34px;height:34px}
.bm .bm-pb button small{display:block;font-size:12px;color:#6b7183;font-weight:700;min-height:1em;margin-top:-3px}
.bm .bm-t button i{position:absolute;top:7px;right:7px;width:10px;height:10px;border-radius:50%}
.bm .bx{cursor:pointer}.bm .bx rect{fill:#fffdf6;stroke:var(--c,#6f6450);stroke-width:4}.bm .bx.has rect{fill:#f3e6c4}.bm .bx.sel rect{stroke-width:9;fill:#e1f1ea}.bm .bx.pin rect{stroke-width:7;fill:#fff3d2}
.bm .bx text{fill:#2b2418;pointer-events:none;text-anchor:middle}.bm .bx .hj{font-size:28px;font-family:serif}.bm .bx .hg{font-size:36px;font-weight:900}
.bm .bx.dim{opacity:.4}
.bm .pl{font-weight:900;font-size:46px;fill-opacity:.85;cursor:pointer;text-anchor:middle;paint-order:stroke;stroke:#fbf6ea;stroke-width:8px}.bm .pl:hover{opacity:1}
.bm #bm-p{margin-top:10px;border:1px solid #e3d6b8;background:#fff;border-radius:14px;padding:14px}
.bm #bm-p h3{margin:0 0 4px;font-size:20px}.bm #bm-p .src{font-size:13px;color:#7a6c50;margin-top:6px}
.bm .bm-go{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}.bm .bm-go button{border:1.5px solid var(--c);background:#fff;color:var(--c);border-radius:999px;padding:4px 11px;font:inherit;font-size:15px;font-weight:800;cursor:pointer}
.bm .bm-it{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.bm .bm-it button{display:flex;gap:6px;align-items:center;border:1px solid #e3d6b8;background:#fffdf6;border-radius:10px;padding:3px 8px 3px 3px;font:inherit;font-size:12px;cursor:pointer;text-align:left}
.bm .bm-it img{width:44px;height:44px;object-fit:cover;border-radius:7px}.bm .bm-it i{width:9px;height:9px;border-radius:50%;display:inline-block}
.bm textarea{width:100%;min-height:120px;font:inherit;font-size:14px;border:1px solid #cdbf9f;border-radius:8px;padding:8px}
.bm .bm-b button{border:1px solid #cdbf9f;background:#fff;border-radius:8px;padding:6px 11px;font:inherit;font-size:14px;cursor:pointer;margin:6px 6px 0 0}
.bm #bm-k{height:280px;width:100%;margin-top:10px;border-radius:10px;overflow:hidden;position:relative}.bm #bm-k img{max-width:none!important;max-height:none!important}.bm #bm-k div,.bm #bm-k img{box-sizing:content-box}
.bm .bx.pb rect{stroke-dasharray:10 6;fill:#fff8e8}.bm .bm-it .ow{width:44px;height:44px;border-radius:7px;object-fit:cover;background:#eee}
</style>
<div class="bm-pb" id="bm-pb">${PN.map((p) => `<button type="button" data-p="${p}" aria-pressed="false"><span class="bi"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${PI[p]}</svg></span>${p}<small></small></button>`).join('')}</div>
<div class="bm-t" id="bm-t">${TYPES.map(([k, n, c]) => `<button type="button" data-k="${k}" aria-pressed="true"><span class="bi">${TICON[k]}</span><span class="tn">${n}</span><i style="background:${c}"></i></button>`).join('')}</div>
<svg class="bm-sv" viewBox="0 0 1319 1960" role="img" aria-label="정대영 선생님 손지도"${ink ? ' style="background:transparent;border:0"' : ''}>
${base()}
<g stroke="#9c9179" stroke-width="3" stroke-dasharray="14 10" fill="none" opacity=".9">
<path d="M190 800 L1085 800"/><path d="M760 300 L760 800"/><path d="M322 800 L322 975 L190 975"/><path d="M700 800 L700 1090 L1085 1090"/>
<path d="M190 1130 L700 1130"/><path d="M700 1090 L700 1255"/><path d="M190 1255 L590 1255"/><path d="M700 1255 L590 1255 L590 1780"/>
</g>
<g id="bm-pl">${PN.map((p) => `<text class="pl" data-p="${p}" x="${PV[p][2]}" y="${PV[p][3]}" fill="${PV[p][0]}">${p}</text>`).join('')}</g>
<g id="bm-g"></g></svg>
<div class="bm-cr" style="margin:6px 2px 0;font-size:14px;font-weight:700;color:#000;text-align:right">지도출처 : 동인방</div>
<div id="bm-p"><div class="src">위의 도 이름이나 지도의 고을 상자를 눌러 보세요. 도를 누르면 그 도에 속한 고을의 기물이 모두 나옵니다.</div></div></div>`;
    const g = el.querySelector('#bm-g'), panel = el.querySelector('#bm-p'), dlg = document.getElementById('dlg');
    function draw() {
      g.innerHTML = R.map((r) => {
        const p = P.by[r[0]], n = cntT(p), x = r[3] - W / 2, y = r[4] - H / 2, pn = provOf[r[0]] || '', c = pn ? PV[pn][0] : '#6f6450';
        const inP = selP && provOf[r[0]] === selP;
        const dots = TYPES.map(([k, , col], i) => (on[k] && p[k].length ? `<circle cx="${x + 22 + i * 36}" cy="${y + H + 4}" r="16" fill="${col}"/><text x="${x + 22 + i * 36}" y="${y + H + 10}" style="font-size:20px;font-weight:800;fill:#fff;text-anchor:middle">${p[k].length}</text>` : '')).join('');
        return `<g class="bx ${n ? 'has' : ''} ${sel === r[0] ? 'sel' : ''} ${inP ? 'pin' : ''} ${selP && !inP ? 'dim' : ''}" data-id="${r[0]}" style="--c:${c}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="8"/><text class="hj" x="${r[3]}" y="${y + 34}">${r[2]}</text><text class="hg" x="${r[3]}" y="${y + 72}">${esc(r[1]).replace(/\(.*\)/, '')}</text>${dots}</g>`;
      }).join('') + PN.map((pn) => {
        const p = P.prov[pn], n = cntT(p); if (!p || !(p.m.length + p.a.length + p.o.length)) return '';
        const [c, , , , cx, cy] = PV[pn], x = cx - W / 2, y = cy - H / 2;
        const dots = TYPES.map(([k, , col], i) => (on[k] && p[k].length ? `<circle cx="${x + 22 + i * 36}" cy="${y + H + 4}" r="16" fill="${col}"/><text x="${x + 22 + i * 36}" y="${y + H + 10}" style="font-size:20px;font-weight:800;fill:#fff;text-anchor:middle">${p[k].length}</text>` : '')).join('');
        return `<g class="bx pb ${n ? 'has' : ''} ${selP === pn ? 'sel' : ''} ${selP && selP !== pn ? 'dim' : ''}" data-p="${pn}" style="--c:${c}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="8"/><text class="hg" x="${cx}" y="${y + 56}">${pn}</text>${dots}</g>`;
      }).join('');
      el.querySelectorAll('#bm-pb button').forEach((b) => { const p = b.dataset.p, n = cntT(merge(PV[p][1], p)); b.setAttribute('aria-pressed', selP === p); b.querySelector('small').textContent = n ? n : ''; });
    }
    function items(o) {
      list = [];
      return TYPES.filter(([k]) => on[k] && o[k] && o[k].length).map(([k, n, c]) => o[k].map((r) => {
        list.push(r); const i = list.length - 1;
        return r.own ? `<button type="button" data-i="${i}">${r.t ? `<img class="ow" alt="" data-pid="${esc(r.t)}">` : ''}<span><i style="background:${c}"></i>우리 소장품<br>${esc((r.name || '') + ' ' + (r.era || ''))}<br>${esc((r.size || '').slice(0, 18))}</span></button>` :
          `<button type="button" data-i="${i}"><img loading="lazy" alt="" src="thumbs/${r.b}/${r.n}.jpg" onerror="this.style.visibility='hidden'"><span><i style="background:${c}"></i>${esc((r.owner || r.cat || n).slice(0, 12))}${/반닫이/.test(r.name || '') ? '' : ' · ' + esc(clean(r.name).slice(0, 8))}<br>${esc((r.era || '') + ' ' + (r.size || '').slice(0, 14))}</span></button>`;
      }).join('')).join('');
    }
    /* 기물 창: 도록과 같은 사진 창(#dlg) — 이 지도 화면 위에서 열고, 닫으면 지도로 돌아온다. 크게 보기·확대·밀어 넘기기는 도록과 같다 */
    let cur = -1;
    const $d = (id) => document.getElementById(id);
    const dRow = (k, v) => (v ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '');
    const dDate = (v) => { const p = String(v || '').slice(0, 10).split('-'); return p.length === 3 ? p[0] + '. ' + (+p[1]) + '. ' + (+p[2]) + '.' : (v || ''); };
    function open(i, vp) {
      const r = list[i]; if (!r || !dlg) return; cur = i; vp = vp || 0;
      const img = $d('d-img'), c = r.c || {}, P = c.photos || [];
      if (r.own) {
        delete dlg.dataset.cid; img.removeAttribute('src'); img.alt = c.name || '';
        if (P[vp]) photo(P[vp].f).then((u) => { if (cur === i && u) img.src = u; });
        $d('d-info').innerHTML = `<div class="cat">우리 소장품 · ${esc(c.kind || '소장품')}</div><h3>${esc(c.name || '')}</h3><dl>${dRow('상태', c.status || '소장')}${dRow('구입일', dDate(c.bought))}${dRow('구입처', c.place)}${dRow('크기', c.size)}${dRow('연대', c.era)}${dRow('재질·수종', c.wood)}${dRow('비고', c.note)}${dRow('감정·관찰', c.memo)}</dl>` +
          (P.length > 1 ? `<div class="bm-st">${P.map((p, k) => `<button type="button" data-p="${k}" class="${k === vp ? 'on' : ''}"><img alt="" data-pid="${esc(p.t || p.f)}"></button>`).join('')}</div>` : '') + '<a href="collection.html" target="_blank" rel="noopener">소장품 도록에서 보기 →</a>';
        fillOwn($d('d-info'));
      } else {
        dlg.dataset.cid = r.b + '/' + r.pid;
        img.src = r.h ? `photos/${r.b}/${encodeURIComponent(r.pid)}.jpg` : (r.t ? `thumbs/${r.b}/${r.n}.jpg` : '');
        img.onerror = () => { if (r.t && !img.src.includes('/thumbs/')) img.src = `thumbs/${r.b}/${r.n}.jpg`; };
        img.alt = r.name;
        $d('d-info').innerHTML = `<div class="cat">${esc(r.cat || '')}</div><h3>${esc(r.name || '')}${r.hanja ? `<small>${esc(r.hanja)}</small>` : ''}</h3><dl>${dRow('종류', r.kind)}${dRow('연대', r.era)}${dRow('치수', r.size)}${dRow('재질', r.wood)}${dRow('소장', r.owner)}${dRow('도록', r.page ? r.page + '쪽' : '')}</dl><a href="${r.b}.html">도록으로 돌아가기 →</a>`;
      }
      $d('d-pos').textContent = `${i + 1} / ${list.length}`; $d('d-prev').disabled = i === 0; $d('d-next').disabled = i === list.length - 1;
      if (!dlg.open) dlg.showModal();
    }
    if (dlg && !dlg.__bm) {
      dlg.__bm = 1;
      $d('d-prev').addEventListener('click', () => open(cur - 1)); $d('d-next').addEventListener('click', () => open(cur + 1)); $d('d-close').addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); const ph = e.target.closest('.bm-st [data-p]'); if (ph) open(cur, Number(ph.dataset.p)); });
      if (window.MOKGAGU_PHOTOZOOM) MOKGAGU_PHOTOZOOM.attach({ dialog: dlg, area: dlg.querySelector('.d-img'), next: () => open(cur + 1), prev: () => open(cur - 1), canNext: () => cur < list.length - 1, canPrev: () => cur > 0 });
    }

    /* 우리 소장품 사진: 소장품 도록과 같은 이 기기 저장소(IndexedDB)를 먼저 보고, 없으면 시트에서 받는다 */
    const b64u = (t) => { t = t.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(t + '==='.slice((t.length + 3) % 4)), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
    const urls = {};
    const idbGet = (id) => new Promise((ok) => { try { const q = indexedDB.open('mokgagu_collection', 1); q.onsuccess = () => { try { const r = q.result.transaction('img').objectStore('img').get(id); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); } catch (e) { ok(null); } }; q.onerror = () => ok(null); } catch (e) { ok(null); } });
    function photo(id) {
      if (urls[id]) return Promise.resolve(urls[id]);
      return idbGet(id).then((b) => b || get('cimg&id=' + encodeURIComponent(id)).then((j) => (j && j.ok ? new Blob([b64u(j.data)], { type: j.type || 'image/jpeg' }) : null))).then((b) => (b ? (urls[id] = URL.createObjectURL(b)) : '')).catch(() => '');
    }
    function fillOwn(root) { root.querySelectorAll('img[data-pid]').forEach((im) => { const id = im.dataset.pid; im.removeAttribute('data-pid'); photo(id).then((u) => { if (u) im.src = u; else im.style.visibility = 'hidden'; }); }); }
    function emit(o) {   // 이 페이지 아래 목록을 고른 지역 것만 보이게 알린다
      const keys = o ? [].concat(...TYPES.filter(([k]) => on[k]).map(([k]) => (o[k] || []).filter((r) => !r.own).map((r) => r.b + '/' + r.n))) : null;
      window.dispatchEvent(new CustomEvent('bmap:filter', { detail: { keys, label: o ? (selP || (R.find((x) => x[0] === sel) || [])[1] || '') : '' } }));
    }
    function mapOf(id) {
      const r = R.find((x) => x[0] === id), box = panel.querySelector('#bm-k'); if (!box) return;
      const go = () => { const K = window.kakao; K.maps.load(() => { box.innerHTML = ''; const c = new K.maps.LatLng(r[6], r[7]); const m = new K.maps.Map(box, { center: c, level: 12, scrollwheel: true }); m.setZoomable(true); m.addControl(new K.maps.ZoomControl(), K.maps.ControlPosition.RIGHT); new K.maps.Marker({ position: c, map: m }); const fix = () => { m.relayout(); m.setCenter(c); }; requestAnimationFrame(fix); [100, 400, 900, 1800].forEach((t) => setTimeout(fix, t)); }); };
      if (window.kakao && window.kakao.maps) return go();
      const s = document.createElement('script'); s.src = '//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=' + KEY; s.onload = go; document.head.appendChild(s);
    }
    function showRegion(id) {
      sel = id; selP = ''; draw(); const r = R.find((x) => x[0] === id), p = P.by[id], d = edits[id] != null ? edits[id] : r[8], pn = provOf[id] || '';
      panel.innerHTML = `<h3>${esc(r[1])} <small style="font-weight:400;color:#7a6c50">${r[2]}${pn ? ' · ' + pn : ''}</small></h3><div id="bm-d" style="white-space:pre-wrap;line-height:1.65">${esc(d)}</div>
<div class="src">출처: ${esc(r[9])}${edits[id] != null ? ' · (고친 글' + (meta[id] && meta[id].editor ? ' · ' + esc(meta[id].editor) : '') + ')' : ''}</div>
<div class="bm-b"><button type="button" id="bm-e">설명 고치기</button></div>
${KEY ? '<div id="bm-k"></div>' : ''}
<div class="bm-it">${items(p) || '<span class="src">이 지역으로 분류된 기물이 아직 없어요.</span>'}</div>`;
      fillOwn(panel); emit(p);
      panel.querySelector('#bm-e').onclick = () => {
        panel.querySelector('#bm-d').outerHTML = `<textarea id="bm-ta">${esc(d)}</textarea>`;
        panel.querySelector('.bm-b').innerHTML = '<button type="button" id="bm-s">저장</button><button type="button" id="bm-r">처음 글로</button>';
        panel.querySelector('#bm-s').onclick = () => { const t = panel.querySelector('#bm-ta').value; edits[id] = t; local[id] = t; save(local); showRegion(id); if (code()) post({ action: 'rsave', id, text: t, editor: who() }).then((j) => { if (!j || !j.ok) alert('시트에 저장하지 못했어요. 이 기기에는 저장됐어요.'); }).catch(() => {}); };
        panel.querySelector('#bm-r').onclick = () => { delete edits[id]; delete local[id]; save(local); showRegion(id); if (code()) post({ action: 'rsave', id, text: '', editor: who() }).catch(() => {}); };
      };
      if (KEY) mapOf(id);
    }
    function showProv(pn) {
      selP = pn; sel = ''; draw(); const ids = PV[pn][1], o = merge(ids, pn);
      panel.innerHTML = `<h3 style="color:${PV[pn][0]}">${pn} <small style="font-weight:400;color:#7a6c50">${cntT(o)}점</small></h3>
<div class="src">${ids.length ? `선생님 지도의 ${pn} 고을: ${ids.length}곳 — 고을을 눌러 그 고을만 볼 수 있어요.` : `선생님 지도에는 ${pn}의 고을이 아직 없어요. 지역이 적히지 않은 ${pn} 기물만 나옵니다.`}${pn === '경기도' ? ' (강화도 포함)' : ''}</div>
<div class="bm-go" style="--c:${PV[pn][0]}">${ids.map((id) => { const r = R.find((x) => x[0] === id); return `<button type="button" data-r="${id}">${esc(r[1])} ${cntT(P.by[id]) || ''}</button>`; }).join('')}</div>
<div class="bm-it">${items(o) || '<span class="src">이 도로 분류된 기물이 아직 없어요.</span>'}</div>`;
      fillOwn(panel); emit(o);
    }
    const refresh = () => { draw(); if (selP) showProv(selP); else if (sel) showRegion(sel); };
    el.querySelector('#bm-t').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; on[b.dataset.k] = !on[b.dataset.k]; b.setAttribute('aria-pressed', on[b.dataset.k]); refresh(); });
    el.querySelector('#bm-pb').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showProv(b.dataset.p); });
    el.querySelector('#bm-pl').addEventListener('click', (e) => { const t = e.target.closest('[data-p]'); if (t) showProv(t.dataset.p); });
    g.addEventListener('click', (e) => { const b = e.target.closest('.bx'); if (!b) return; if (b.dataset.p) showProv(b.dataset.p); else showRegion(b.dataset.id); });
    panel.addEventListener('click', (e) => {
      const it = e.target.closest('[data-i]'); if (it) { const r = list[Number(it.dataset.i)]; open(Number(it.dataset.i)); return; }
      const rg = e.target.closest('[data-r]'); if (rg) showRegion(rg.dataset.r);
    });
    draw();
    if (code()) {   // 가족 암호가 있으면: 시트의 고친 설명과 우리 소장품을 받아 온다
      get('rlist').then((j) => { if (j && j.ok) { Object.keys(j.map).forEach((k) => { edits[k] = j.map[k].text; meta[k] = j.map[k]; }); if (sel) showRegion(sel); } }).catch(() => {});
      get('clist').then((j) => { if (j && j.ok && Array.isArray(j.list)) { addOwn(P, j.list); refresh(); } }).catch(() => {});
    }
  }
  window.MOKGAGU_BMAP = { mount };
})();

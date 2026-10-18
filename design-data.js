/* 홈 디자인 시안(design-a/b/c.html)이 함께 쓰는 자료 — index.html 의 DASHBOARDS·ICONS 를 옮겨 둔 것 */
window.DS_DASH = [
  { path: 'nmk', title: '국립중앙박물관 소장품', desc: '국립중앙박물관 소장품 검색으로 모은 우리 목가구', items: 432, icon: 'bandaji', tone: 'meok', added: '2026-10-18', group: 'museum' },
  { path: 'heritage', title: '국가유산 목공예', desc: '국가유산포털 유물·생활공예·목공예 — 국보·보물·민속문화유산 등 지정 문화유산', items: 19, icon: 'ham', tone: 'ju', added: '2026-10-18', group: 'museum' },
  { path: 'lee',    title: '이건희 기증 목칠공예',      desc: '국립중앙박물관 기증품 목록집(2023)',     items: 488, icon: 'bandaji', tone: 'jjok', added: '2026-10-15' },
  { path: 'auction', title: '아이옥션 경매 목가구·목기', desc: '2022년 3월~2026년 10월 경매 38회 — 추정가·낙찰가', items: 596, icon: 'bandaji', tone: 'ju', added: '2026-10-17', group: 'auction' },
  { path: 'jikmul', title: '우리나라 전통 무늬 1 직물', desc: '국립문화재연구소 문양 조사보고서(2006)', items: 184, icon: 'ham', tone: 'jaju', added: '2026-10-17', group: 'ref' },
  { path: 'dojagi', title: '우리나라 전통 무늬 2 도자기', desc: '국립문화재연구소 문양 조사보고서(2008)', items: 219, icon: 'ham', tone: 'jjok', added: '2026-10-17', group: 'ref' },
  { path: 'najeon', title: '우리나라 전통 무늬 3 나전·화각', desc: '국립문화재연구소 문양 조사보고서(2014)', items: 110, icon: 'ham', tone: 'ju', added: '2026-10-18', group: 'ref' },
  { path: 'geumsok', title: '우리나라 전통 무늬 4 금속공예', desc: '국립문화재연구소 문양 조사보고서(2011)', items: 213, icon: 'ham', tone: 'meok', added: '2026-10-17', group: 'ref' },
  { path: 'munui', title: '우리나라 전통 무늬 5 목공예', desc: '국립문화재연구소 문양 조사보고서(2012)', items: 164, icon: 'ham', tone: 'nok', added: '2026-10-17' },
  { path: 'yakjang', title: '약장, 건강을 염원하다', desc: '허준박물관·국립민속박물관 공동기획전 도록(2014)', items: 53, icon: 'yakjang', tone: 'jaju', added: '2026-10-17' },
  { path: 'wonju',  title: '우리 나전, 새로 맞는 날',   desc: '원주시역사박물관 소장품 특별전 도록(2024)', items: 31,  icon: 'ham',     tone: 'ju',    added: '2026-10-17' },
  { path: 'soban',  title: '소반장(小盤匠)',          desc: '국립문화재연구소 중요무형문화재 조사보고서(1997)', items: 25, icon: 'soban',  tone: 'hwang', added: '2026-10-17' },
  { path: 'busan',  title: '부산박물관 소장품 「민속」', desc: '부산박물관 소장품 도록 「민속」편 발췌', items: 11,  icon: 'yakjang', tone: 'meok',  added: '2026-10-17' },
  { path: 'yangsan', title: '양산 반닫이',           desc: '양산시립박물관 특별기획전 도록(2022)', items: 30,  icon: 'bandaji', tone: 'hwang', added: '2026-10-17' },
  { path: 'minsok', title: '민속유물이해Ⅰ 목가구', desc: '국립민속박물관 민속유물이해Ⅰ(2003)', items: 223, icon: 'yakjang', tone: 'jaju', added: '2026-10-15' },
  { path: 'namu',   title: '목가구, 나무의 이치를 담다', desc: '국립민속박물관·영인산산림박물관 공동기획전 도록(2016)', items: 56,  icon: 'duiju',   tone: 'nok',  added: '2026-10-15' },
  { path: 'salm',   title: '목가구, 삶을 담다',        desc: '미리벌민속박물관·국립민속박물관 공동기획전 도록(2015)', items: 53,  icon: 'soban',   tone: 'hwang',  added: '2026-10-15' },
  { path: 'migam',  title: '목가구의 미감',            desc: '국립민속박물관·은평역사한옥박물관 공동기획전 도록(2016)',      items: 55,  icon: 'takja',   tone: 'ju',   added: '2026-10-15' },
  { path: 'kwon',   title: '권옥연 화백 구장 조선목기', desc: '북촌민예관 개관전 도록(2012)',       items: 50,  icon: 'seoan',   tone: 'meok',   added: '2026-10-15' },
];
window.DS_ICONS = {
  /* 반닫이: 앞판 위쪽이 아래로 젖혀 열리는 궤. 무쇠 경첩·앞바탕·들쇠 */
  bandaji: '<rect x="3.5" y="8" width="25" height="16.5" rx=".8"/><path d="M3.5 15.5h25"/><path d="M5 24.5v3M27 24.5v3"/><path d="M8.5 8v5.5h3V8M20.5 8v5.5h3V8"/><path d="M13.5 15.5h5v4.2l-2.5 1.8-2.5-1.8z"/><path d="M5.8 19.5c1 0 1.6.6 1.6 1.4M26.2 19.5c-1 0-1.6.6-1.6 1.4"/>',
  /* 서안: 양 끝이 말려 올라간 두루마리 천판, 서랍, 풍혈 */
  seoan: '<path d="M2.5 9.2c.6 1.4 1.4 1.8 2.6 1.8h21.8c1.2 0 2-.4 2.6-1.8"/><path d="M6 11v16M26 11v16"/><rect x="9" y="11" width="14" height="4.2"/><path d="M15 13.1h2"/><path d="M6 18.5c3 0 3.5 2.5 10 2.5s7-2.5 10-2.5"/><path d="M6 24.5h20"/>',
  /* 소반(나주반): 변죽 두른 네모 천판, 단순한 운각, 곧은 일자 다리와 낮은 중대 */
  soban: '<path d="M2.5 9.5h27"/><path d="M3.5 9.5v1.8h25V9.5"/><path d="M6.5 11.5v2.2c2.2 0 2.6 1.8 4.8 1.8h9.4c2.2 0 2.6-1.8 4.8-1.8v-2.2"/><path d="M7.5 11.5v16.5M24.5 11.5v16.5"/><path d="M11 15.5v10.5M21 15.5v10.5"/><path d="M7.5 23.5h17"/>',
  /* 사방탁자: 네 기둥에 층널, 가운데 서랍 */
  takja: '<path d="M9 2.5v27M23 2.5v27"/><path d="M8 3.5h16"/><path d="M9 10.5h14M9 17.5h14M9 22h14M9 26h14"/><path d="M15 19.75h2"/>',
  /* 뒤주: 긴 기둥다리, 천판 위 반쪽 뚜껑과 자물쇠 앞바탕 */
  duiju: '<path d="M6 4v24.5M26 4v24.5"/><path d="M5 5.5h22"/><path d="M6 10h20M6 23h20"/><path d="M16 5.5V10"/><rect x="14" y="6.3" width="4" height="4.6" rx=".6"/><path d="M10 14h12v5.5H10z"/>',
  /* 약장: 작은 서랍이 바둑판처럼 들어찬 장 */
  yakjang: '<rect x="5.5" y="3.5" width="21" height="23" rx=".8"/><path d="M5.5 9.25h21M5.5 15h21M5.5 20.75h21M12.5 3.5v23M19.5 3.5v23"/><path d="M8.6 6.4h.8M15.6 6.4h.8M22.6 6.4h.8M8.6 12.1h.8M15.6 12.1h.8M22.6 12.1h.8M8.6 17.9h.8M15.6 17.9h.8M22.6 17.9h.8M8.6 23.6h.8M15.6 23.6h.8M22.6 23.6h.8"/><path d="M7 26.5v2.5M25 26.5v2.5"/>',
  /* 이층장: 위아래 두 층, 여닫이문과 경첩·자물쇠 앞바탕 */
  jang: '<rect x="6.5" y="3" width="19" height="24" rx=".8"/><path d="M6.5 15h19"/><path d="M16 5v8M16 17v8"/><rect x="14.6" y="7.6" width="2.8" height="2.8" rx=".4"/><rect x="14.6" y="19.6" width="2.8" height="2.8" rx=".4"/><path d="M6.5 6.5h2M6.5 11.5h2M23.5 6.5h2M23.5 11.5h2M6.5 18.5h2M6.5 23.5h2M23.5 18.5h2M23.5 23.5h2"/><path d="M8 27v2.5M24 27v2.5"/>',
  /* 함: 위로 여는 뚜껑, 귀장식 */
  ham: '<path d="M4 12.5h24v12H4z"/><path d="M4.8 12.5 6.5 8.5h19l1.7 4"/><rect x="14" y="12.5" width="4" height="4.5" rx=".5"/><path d="M4 15.5l3-3M28 15.5l-3-3M4 21.5l3 3M28 21.5l-3 3"/>',
};
window.DS_QUICK = [['반닫이','bandaji'],['서안','seoan'],['소반','soban'],['사방탁자','takja'],['뒤주','duiju'],['약장','yakjang'],['장·농','jang'],['함','ham']];
window.DS_GROUPS = [['', '도록', '선생님 책과 박물관 도록에서 모은 기물'], ['museum', '박물관자료', '박물관·지정된 문화유산 목공예 유물'], ['auction', '경매자료', '경매에 나온 목가구·목기, 추정가와 낙찰가'], ['ref', '도움자료', '목가구 공부에 참고할 다른 분야 자료']];
window.dsIcon = function (k, sw) { return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (window.DS_ICONS[k] || window.DS_ICONS.bandaji) + '</svg>'; };
window.dsTotal = function () { return window.DS_DASH.reduce(function (s, d) { return s + d.items; }, 0); };
window.dsFmt = function (n) { return n.toLocaleString('ko-KR'); };

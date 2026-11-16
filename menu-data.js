/* 메뉴 목록 — 한 곳. 머리줄 메뉴(homebtn.js)·탐색 도구 머리(tools-head.js)·첫 화면(index.html)이 함께 읽는다.
   탐색 도구를 더하거나 이름을 바꿀 때는 아래 TOOLS 한 곳만 고친다. 2026-11-16
   k 도구 키 · href 화면 · n 메뉴·탭 이름 · s 휴대폰 짧은 이름 · d 첫 화면 타일 설명 · title/sub 도구 화면 제목·설명(없으면 생략) */
window.MOKGAGU_TOOLS = [
  { k: 'room', href: 'room.html', n: '우리 집에 놓아 보기', s: '집에 배치', d: '내 방에 기물을 놓아 봅니다', title: '우리 집에 놓아 보기', sub: '암호 없이 누구나 씁니다. 방 크기와 기물 치수만 넣으면 됩니다.' },
  { k: 'map', href: 'bandaji-map.html', n: '반닫이여지도', s: '여지도', d: '지역별 반닫이(궤)', title: '반닫이(궤)여지도', sub: '' },
  { k: 'find', href: 'https://claude.ai/artifact/7JrHGKPQ72y4djSvgSACyB', ext: 1, n: '장석 감정실', s: '감정실', d: '장석 사진으로 반닫이 지역 감정' },
  { k: 'ruler', href: 'region-ruler.html', n: '비례로 보는 반닫이', s: '비례', d: '가로 세로 비율로 보는 반닫이', title: '비례로 보는 반닫이', sub: '가로 세로 비율로 보는 반닫이' },
  { k: 'quiz', href: 'region-quiz.html', n: '반닫이 퀴즈', s: '퀴즈', d: '사진으로 반닫이 지역 맞추기', title: '반닫이 퀴즈', sub: '사진으로 반닫이 지역 맞추기' },
  { k: 'auction', href: 'auction-stats.html', n: '경매 시세', s: '경매시세', d: '종류별 낙찰가 흐름', title: '경매 시세', sub: '아이옥션·마이아트옥션·서울옥션 낙찰가를 종류별로 봅니다' }
];
/* 자료 묶음 이름 (books.js 의 group 값과 짝) */
window.MOKGAGU_FOLDERS = [['museum', '박물관자료'], ['auction', '경매자료'], ['ref', '도움자료']];
/* 자료 묶음 펼침 메뉴에 쓰는 짧은 도록 이름 */
window.MOKGAGU_SHORT = { nfm: '국립민속박물관', gjfolk: '광주민속박물관', dgu: '대구대박물관', yecheon: '예천박물관', sokcho: '속초박물관', miribeol: '미리벌민속박물관', andong: '안동시립민속박물관', jeonjudae: '전주대박물관', busancity: '부산시립박물관', wonjuemu: '원주역사박물관', wonju: '우리 나전', sangju: '상주박물관', gimhae: '김해목재박물관', namgaram: '남가람박물관', bupyeong: '부평역사박물관', gyeongun: '경운박물관', tongyeong: '통영시립박물관', ulsan: '울산박물관', snu: '서울대학교박물관', cheonan: '천안박물관', dolmun: '제주돌문화공원', gwangju: '국립광주박물관', nmk: '국립중앙박물관', heritage: '국가유산', ewha: '이화여대박물관', horim: '호림박물관', yerang: '예랑방·고목당', enar: '예나르', dugaheon: '두가헌', hoam: '호암미술관', mukgallery: '묵갤러리', seoulauction: '서울옥션', overseas: '해외경매', myart: '마이아트옥션', auction: '아이옥션', jikmul: '직물', dojagi: '도자기', najeon: '나전·화각', geumsok: '금속공예', wajeon: '와전', seokjo: '궁능석조물' };

/* 선생님 손지도 위에 꽂는 지역별 반닫이 지도.  window.MOKGAGU_BMAP.mount(el) */
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
  /* 『조선의 궤』(정대영)로 본 고을·도별 특징 — 장석 감정실과 같은 자료 */
  const JG = {"chosan": {"북한 공통": ["도려내고 남은 부분에 뜻을 둠", "장석이 크고 둥글거나 네모난 앞바탕에 긴 경첩", "맞뚫음 투각(남쪽 말로 쑹숭이)", "도안은 壽·福·卍·초문", "피나무를 두껍게 씀", "직길목이 상판 윗면에 드러남"]}, "jeongju": {"북한 공통": ["도려내고 남은 부분에 뜻을 둠", "장석이 크고 둥글거나 네모난 앞바탕에 긴 경첩", "맞뚫음 투각(남쪽 말로 쑹숭이)", "도안은 壽·福·卍·초문", "피나무를 두껍게 씀", "직길목이 상판 윗면에 드러남"], "쑹숭이": ["긴 사각 투각 경첩 2개(위 壽 아래 福)", "마름모 둘을 맞댄 들쇠 받침", "확장형·극세밀형·종이 도안형은 후대"], "호리병 경첩형": ["둥근 앞바탕에 호리병 경첩", "壽를 반복 투각", "들쇠 없이 하단 원형 배꼽장석"]}, "bakcheon": {"북한 공통": ["도려내고 남은 부분에 뜻을 둠", "장석이 크고 둥글거나 네모난 앞바탕에 긴 경첩", "맞뚫음 투각(남쪽 말로 쑹숭이)", "도안은 壽·福·卍·초문", "피나무를 두껍게 씀", "직길목이 상판 윗면에 드러남"], "쑹숭이": ["긴 사각 투각 경첩 2개(위 壽 아래 福)", "마름모 둘을 맞댄 들쇠 받침", "확장형·극세밀형·종이 도안형은 후대"], "호리병 경첩형": ["둥근 앞바탕에 호리병 경첩", "壽를 반복 투각", "들쇠 없이 하단 원형 배꼽장석"]}, "pyeongyang": {"북한 공통": ["도려내고 남은 부분에 뜻을 둠", "장석이 크고 둥글거나 네모난 앞바탕에 긴 경첩", "맞뚫음 투각(남쪽 말로 쑹숭이)", "도안은 壽·福·卍·초문", "피나무를 두껍게 씀", "직길목이 상판 윗면에 드러남"], "쑹숭이": ["긴 사각 투각 경첩 2개(위 壽 아래 福)", "마름모 둘을 맞댄 들쇠 받침", "확장형·극세밀형·종이 도안형은 후대"], "호리병 경첩형": ["둥근 앞바탕에 호리병 경첩", "壽를 반복 투각", "들쇠 없이 하단 원형 배꼽장석"]}, "haeju": {"해주": ["굵은 선으로 그린 듯한 투각", "해주 소반 도안과 같은 흐름", "원형·꽃형 앞바탕에 긴 투각 경첩"]}, "gaeseong": {"개성": ["황동 장석만 씀", "앞면을 동자와 알판으로 나눔", "개구부가 좁고 상단 좌우에 빼닫이", "사다리꼴 앞바탕에 장구형·호리병형·나비형 경첩"]}, "ganghwa": {"강화": ["긴 사각 경첩 4개(壽 투각)에 호리병 경첩 1개와 귀쇠 경첩 2개를 더한 7첩", "앞바탕 좌우의 원형 자물쇠총 받침쇠(태극·박쥐·壽·福)는 강화에만 있음", "상판 속에 묻힌 직길목", "들쇠 없이 안에 빼닫이 3개", "평발", "길고 깊은 비례"], "제비추리 강화": ["종형 앞바탕에 제비추리 경첩 3~4개", "중심 도안은 福이 많음", "직길목과 곡길목을 함께 씀"], "경기 공통": ["전라·경상보다 높이가 높고 장석이 큼", "경첩 4개가 기본", "철이 주재료이고 일부 황동을 씀"]}, "gyeongdo": {"경기 공통": ["전라·경상보다 높이가 높고 장석이 큼", "경첩 4개가 기본", "철이 주재료이고 일부 황동을 씀"], "경기 제비추리": ["종형 앞바탕에 제비추리 경첩 3~4개", "반달형 들쇠와 꽃형 광두정 줄"]}, "namhan": {"남한산성": ["부채꼴 앞바탕에 둥근 말굽형 경첩 3개", "앞바탕과 경첩 모양이 서로 다른 흐름", "철 장석에 큰 황동 박쥐형 들쇠 받침쇠를 섞음"]}, "sangju": {"상주": ["ㄱ자 꺾쇠 거멀을 높고 각지게 돌출", "네 널판이 모로 드러나는 짜임", "남쪽보다 높은 비례", "주로 4첩"], "경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "yecheon": {"예천": ["壽를 거북 도안으로 나타냄(앞바탕 또는 경첩)", "경첩 3개", "가로세로가 비슷하고 상판 귀가 나옴", "두루마리 상판엔 평발을 높게 닮"], "경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "geumsan": {"금산": ["투각 없음", "큰 방패형 앞바탕에 사각 띠 경첩 2개", "일자 꺾쇠를 꺾어 모서리에 박음", "길목 굽은 곳을 평평하게 두들김"], "전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}, "eonyang": {"언양": ["본체와 문에 코를 따로 만들어 하나로 묶은 경첩", "소박한 장석"], "경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "iksan": {"익산": ["앞닫이 가운데 가장 큼", "상판·바닥을 크게 하여 귀를 냄", "사각 앞바탕에 여의주가 붙은 가분수 호리병 경첩 2개", "길목도 울룩불룩"], "전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}, "jeonju": {"전주": ["삼엽(세 잎) 앞바탕과 장석 안의 숨구멍 도안", "긴 사각 띠 경첩 3개", "윗닫이는 낮고 넓적함"], "전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}, "namwon": {"남원": ["목이 긴 병형 경첩(호리병이 아님)", "투각 없이 두꺼운 장석 모서리를 비스듬히 깎음", "당초·구름 윤곽 앞바탕", "두꺼운 길목에 주름 음각"], "전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}, "miryang": {"김해·밀양·양산": ["철 장석에 황동 들쇠·광두정을 섞음", "경첩 코를 감을 때 여분을 남겨 내밂", "종형 앞바탕(卍·壽)", "한 장인 계보로 공통점이 뚜렷함"], "경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "yangsan": {"김해·밀양·양산": ["철 장석에 황동 들쇠·광두정을 섞음", "경첩 코를 감을 때 여분을 남겨 내밂", "종형 앞바탕(卍·壽)", "한 장인 계보로 공통점이 뚜렷함"], "경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "gimhae": {"김해·밀양·양산": ["철 장석에 황동 들쇠·광두정을 섞음", "경첩 코를 감을 때 여분을 남겨 내밂", "종형 앞바탕(卍·壽)", "한 장인 계보로 공통점이 뚜렷함"], "경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "naju": {"나주": ["가장 단순한 장석", "좁은 긴 사각·제비추리·위 사각 아래 제비추리 경첩", "못을 한 줄로 6개 박음", "앞바탕은 모두 사각", "거멀 대신 볼록한 광두정"], "전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}, "yeonggwang": {"영광": ["광두정 테를 두른 둥근 8봉 앞바탕에 끝이 갈라진 제비추리 경첩 3개", "하단 마름모 卍 배꼽장식", "안에 빼닫이를 입체로 갖춘 것이 많음", "조선~일제 다량 발생"], "전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}, "jinju": {"진주": ["두껍고 강한 장석", "크게 돌출한 기둥형 광두정", "본체 가운데 큰 활형 고리와 굴절 사각 받침쇠", "문판 밑 모서리의 달팽이형 감잡이", "박쥐 경첩형과 제비추리형 두 계열"], "경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "jangheung": {"장흥": ["제주와 매우 흡사", "꽃잎 테 앞바탕(卍 2개)에 장구형 경첩 3개", "하단 세로 띠 감잡이", "앞선 연대는 낮고 긴 비례이고 후대는 높아짐"], "전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}, "namhae": {"남해": ["큰 사각 앞바탕에 卍·壽·福·태극을 크게 투각(福이 가장 많음)", "경첩 위에 태극", "네 원이 겹친 받침쇠는 남해에만 있음"], "경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "tongyeong": {"통영(충무)": ["부채꼴로 퍼진 앞바탕에 卍 단일 도안", "은입사 광두정과 두루마리 천판은 통영만의 표지"]}, "jeju": {"제주": ["장흥과 같은 배열", "제주 자생목(괴목·벗나무)을 씀", "곡궤는 다리 결속법이 다름"], "전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}};
  const JGP = {"평안도": {"북한 공통": ["도려내고 남은 부분에 뜻을 둠", "장석이 크고 둥글거나 네모난 앞바탕에 긴 경첩", "맞뚫음 투각(남쪽 말로 쑹숭이)", "도안은 壽·福·卍·초문", "피나무를 두껍게 씀", "직길목이 상판 윗면에 드러남"]}, "황해도": {"해주": ["굵은 선으로 그린 듯한 투각", "해주 소반 도안과 같은 흐름", "원형·꽃형 앞바탕에 긴 투각 경첩"]}, "경기도": {"경기 공통": ["전라·경상보다 높이가 높고 장석이 큼", "경첩 4개가 기본", "철이 주재료이고 일부 황동을 씀"]}, "강원도": {"강원": ["상하결속으로 높이가 높음", "면판재를 끼워 짜 널판이 드러남", "상판 귀가 나오고 옆널이 다리까지 이어지는 고유형", "개구부와 문이 작음", "서랍·2층 구조", "종형·호리병형 경첩"]}, "충청도": {"충청": ["장석이 가장 큼", "경첩 3개 가운데 중앙은 여의주문을 키운 제비추리형", "사개 마디마다 큰 못머리 광두정", "평발", "2층 '충청도 장'이 발달함"], "제천": ["높이가 낮고 2첩 경첩의 단순형", "평발"]}, "경상도": {"경상 공통": ["남쪽일수록 낮고 긴 비례", "상주 4첩·예천 3첩·경남 2첩", "평철 감잡이"]}, "전라도": {"전라 공통": ["꺾쇠 모양 거멀장석을 씀(경상도는 평철 감잡이)"]}, "제주도": {"제주": ["장흥과 같은 배열", "제주 자생목(괴목·벗나무)을 씀", "곡궤는 다리 결속법이 다름"]}};
  const jgHTML = (o) => o ? `<details class="bm-jg" open><summary>조선의 궤(정대영)로 본 특징</summary>${Object.entries(o).map(([k, a]) => `<h4>${esc(k)}</h4><ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')}</details>` : '';
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
  const MUS = { nmk: 1, heritage: 1, horim: 1, ewha: 1 };   // 박물관자료 폴더(국립중앙박물관 소장품·국가유산)
  const TICON = {
    m: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M1.5 15.5h45v3h-45z" fill="currentColor"/><path d="M3 18.5v13h14v-13M31 18.5v13h14v-13"/><path d="M3 23h14M3 27h14M31 23h14M31 27h14" stroke-width="1.2"/><path d="M17 31.5h14M15.5 34h17M14 36.5h20" stroke-width="1.6"/><path d="M1.5 31.5h12.5M34 31.5h12.5"/><path d="M6 40.5h36" stroke-width="1.5"/><path d="M11 43.5h26" stroke-width="1.2"/></svg>',
    a: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><g transform="rotate(-40 22 18)"><rect x="12" y="10" width="20" height="9" rx="2"/><path d="M15 10v9M29 10v9"/><path d="M22 19v19"/></g><path d="M26 41h17"/><rect x="28.5" y="36.5" width="12" height="4.5" rx="1"/><path d="M8 8l2.5 2.5M5 14h3.5M13 4.5v3.5" stroke-width="1.8"/></svg>',
    e: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M4 15 24 5l20 10z"/><path d="M6 15v27h36V15"/><path d="M6 28.5h36M4 42h40"/><path d="M10 27.5v-9M13.5 27.5v-7M17 27.5v-9M20.5 27.5v-8M25 27.5l3-8.5M31 27.5v-9M34.5 27.5v-7M38 27.5v-9"/><path d="M10 41v-9M13.5 41v-7.5M17 41v-9M21 41v-6.5M24.5 41v-9M28 41v-8M33 41l2.5-8M38 41v-9"/><circle cx="24" cy="11.5" r="1.6"/></svg>',
    j: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M24 12C19 8 11 7 5 8v29c6-1 14 0 19 4 5-4 13-5 19-4V8c-6-1-14 0-19 4z"/><path d="M24 12v29"/><rect x="10" y="15" width="9" height="7" rx="1"/><path d="M14.5 15v7M10 18.5h9" stroke-width="1.3"/><path d="M29 16h9M29 21h9M29 26h9M10 27h9M10 31h9" stroke-width="1.5"/></svg>',
    g: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="38" height="28" rx="3"/><circle cx="24" cy="25" r="8"/><circle cx="24" cy="25" r="3.5"/><path d="M16 11l3-5h10l3 5"/><circle cx="37" cy="17" r="1.6" fill="currentColor"/></svg>',
    o: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8" width="25" height="16.5" rx=".8"/><path d="M3.5 15.5h25"/><path d="M5 24.5v3M27 24.5v3"/><path d="M8.5 8v5.5h3V8M20.5 8v5.5h3V8"/><path d="M13.5 15.5h5v4.2l-2.5 1.8-2.5-1.8z"/></svg>',
  };
  let TYPES = [['m', '박물관 소장', '#0F6E56'], ['a', '경매 출품', '#BA7517'], ['e', '기타', '#5b6fa8'], ['o', '소장품', '#111111'], ['j', '조선의 궤', '#8a2d18'], ['g', '기준 도판', '#6b4fa0']];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const load = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} };

  const API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  const ls = (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const code = () => ls('mokgagu_cm_code') || ls('mokgagu_study_pw');
  const who = () => ls('mokgagu_write_who') || (ls('mokgagu_cm_who') === '힌' ? '힌' : '거믄');
  const get = (a) => fetch(API, { method: 'POST', body: JSON.stringify({ action: a, code: code() }) }).then((r) => r.json());
  const post = (o) => fetch(API, { method: 'POST', body: JSON.stringify(Object.assign({ code: code() }, o)) }).then((r) => r.json());

  /* 반닫이(궤)여지도에 넣는 것: 반닫이, 그리고 이름이 궤·장·함으로 끝나는 것(김해궤→김해, 전주장→전주) */
  const clean = (n) => String(n || '').replace(/\([^)]*\)|[^가-힣]/g, '');
  const KIND = /(반닫이|궤|장|함)$/;
  const isKind = (r) => /반닫이/.test(r.name + (r.hanja || '')) || (KIND.test(clean(r.name)) && !(r.b === 'soban' || /소반|장인|무형/.test(r.name)));
  const hayOf = (r) => { const q = /반닫이/.test(r.name + (r.hanja || '')) ? (r.q || '') : String(r.q || '').split(/\s+/).filter((w) => !/박물관|연구소|옥션|경매|도록|보고서/.test(w)).join(' '); return (r.name + (r.hanja || '') + q).replace(/나전/g, ''); };   // 나전주흑칠…의 '전주'는 지역이 아니다
  
  function pins() {
    const all = (window.SEARCH || []).filter(isKind);
    const by = {}; R.forEach((g) => { by[g[0]] = { m: [], a: [], e: [], o: [], j: [], g: [] }; });
    const prov = {}; PROV.forEach((p) => { prov[p[0]] = { m: [], a: [], e: [], o: [], j: [], g: [] }; });
    all.forEach((r) => {
      const t = AUC[r.b] ? 'a' : MUS[r.b] ? 'm' : 'e', hay = hayOf(r);
      let hit = false;
      R.forEach((g) => { if (g[5].some((k) => hay.includes(k))) { by[g[0]][t].push(r); hit = true; } });
      if (!hit) PROV.forEach((p) => { if (p[1].some((k) => hay.includes(k))) prov[p[0]][t].push(r); });
    });
    (window.JOSEONGWE || []).forEach((d) => { if (d.r && by[d.r]) by[d.r].j.push(d); else if (d.p && prov[d.p]) prov[d.p].j.push(d); });   // 정대영 『조선의 궤』 도판
    const GJ = [], gat = {};   // 같은 기물의 여러 장(g가 같거나 지역·메모가 같은 것)은 한 점으로 묶고 사진을 pics에 모은다
    (window.GIJUN || []).forEach((d) => { const k = d.g || (d.note ? d.region + '|' + d.note : d.n); if (gat[k]) { gat[k].pics.push(d); return; } gat[k] = Object.assign({}, d, { pics: [d] }); GJ.push(gat[k]); });
    GJ.forEach((d) => {   // 장석 감정실에서 올린 기준 도판(가족만): 지역 이름으로 고을·도를 찾는다
      const nm = String(d.region || ''); let hit = false;
      R.forEach((g) => { if (!hit && (g[1] === nm || g[5].some((k) => nm.includes(k)))) { by[g[0]].g.push(d); hit = true; } });
      if (!hit) PROV.forEach((p) => { if (!hit && (p[0] === nm || p[1].some((k) => nm.includes(k)))) { prov[p[0]].g.push(d); hit = true; } });
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
    if (!window.JOSEONGWE) TYPES = TYPES.filter((t) => t[0] !== 'j' && t[0] !== 'g');   // 『조선의 궤』 메뉴는 가족(거믄·힌)에게만 — joseongwe.js 는 가족일 때만 불러온다
    const P = pins(), local = load(), edits = Object.assign({}, local), meta = {};
    let on = { m: true, a: true, e: true, o: true, j: true, g: true }, sel = '', selP = '', list = [];
    const W = 130, H = 86, PN = Object.keys(PV);
    const provOf = {}; PN.forEach((p) => PV[p][1].forEach((id) => { provOf[id] = p; }));
    const cntT = (o) => (on.m ? o.m.length : 0) + (on.a ? o.a.length : 0) + (on.e ? o.e.length : 0) + (on.o ? o.o.length : 0) + (on.j && o.j ? o.j.length : 0) + (on.g && o.g ? o.g.length : 0);
    const merge = (ids, pn) => { const o = { m: [], a: [], e: [], o: [], j: [], g: [] }; ids.forEach((id) => { ['m', 'a', 'e', 'o', 'j', 'g'].forEach((k) => o[k].push(...P.by[id][k])); }); if (pn) ['m', 'a', 'e', 'o', 'j', 'g'].forEach((k) => o[k].push(...P.prov[pn][k])); return o; };
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
.bm .bm-tot{text-align:center;font-size:19px;font-weight:800;color:#1f2433;margin:4px 0 10px}.bm .bm-tot b{color:#8a2d18;font-size:22px}.bm .bm-t button small{font-size:14px;font-weight:700;color:#6b7183;min-height:1em}
.bm .bm-t button{width:96px}.bm .bm-t button[aria-pressed=false]{opacity:.45}
.bm .bi{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:#f1efeb;color:#1d1b18}.bm .bi svg{width:32px;height:32px}.bm .bm-t .bi svg{width:34px;height:34px}
.bm .bm-pb button small{display:block;font-size:12px;color:#6b7183;font-weight:700;min-height:1em;margin-top:-3px}
.bm .bm-t button i{position:absolute;top:7px;right:7px;width:10px;height:10px;border-radius:50%}
.bm .bx{cursor:pointer}.bm .bx rect{fill:#fffdf6;stroke:var(--c,#6f6450);stroke-width:4}.bm .bx.has rect{fill:#f3e6c4}.bm .bx.sel rect{stroke-width:9;fill:#e1f1ea}.bm .bx.pin rect{stroke-width:7;fill:#fff3d2}
.bm .bx text{fill:#2b2418;pointer-events:none;text-anchor:middle}.bm .bx .hj{font-size:28px;font-family:serif}.bm .bx .hg{font-size:36px;font-weight:900}
.bm .bx.dim{opacity:.4}
.bm .pl{font-weight:900;font-size:46px;fill-opacity:.85;cursor:pointer;text-anchor:middle;paint-order:stroke;stroke:#fbf6ea;stroke-width:8px}.bm .pl:hover{opacity:1}
.bm #bm-p{margin-top:10px;border:1px solid #e3d6b8;background:#fff;border-radius:14px;padding:14px}
.bm #bm-p h3{margin:0 0 4px;font-size:20px}.bm .bm-jg{margin:12px 0;background:#f7f3ea;border:1px solid #e6dcc6;border-radius:12px;padding:10px 14px;font-size:14.5px;line-height:1.6}.bm .bm-jg summary{cursor:pointer;font-weight:700;color:#0F6E56}.bm .bm-jg h4{margin:8px 0 2px;font-size:13px;color:#7a6c50}.bm .bm-jg ul{margin:0;padding-left:18px}.bm #bm-p .src{font-size:13px;color:#7a6c50;margin-top:6px}
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
<div class="bm-tot" id="bm-tot"></div>
<div class="bm-t" id="bm-t">${TYPES.map(([k, n, c]) => `<button type="button" data-k="${k}" aria-pressed="true"><span class="bi">${TICON[k]}</span><span class="tn">${n}</span><small></small><i style="background:${c}"></i></button>`).join('')}</div>
<svg class="bm-sv" viewBox="0 0 1319 1960" role="img" aria-label="선생님 손지도"${ink ? ' style="background:transparent;border:0"' : ''}>
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
        const dots = TYPES.map(([k, , col], i) => (on[k] && p[k].length ? `<circle cx="${x + 18 + i * 29}" cy="${y + H + 4}" r="14" fill="${col}"/><text x="${x + 18 + i * 29}" y="${y + H + 10}" style="font-size:17px;font-weight:800;fill:#fff;text-anchor:middle">${p[k].length}</text>` : '')).join('');
        return `<g class="bx ${n ? 'has' : ''} ${sel === r[0] ? 'sel' : ''} ${inP ? 'pin' : ''} ${selP && !inP ? 'dim' : ''}" data-id="${r[0]}" style="--c:${c}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="8"/><text class="hj" x="${r[3]}" y="${y + 34}">${r[2]}</text><text class="hg" x="${r[3]}" y="${y + 72}">${esc(r[1]).replace(/\(.*\)/, '')}</text>${dots}</g>`;
      }).join('') + PN.map((pn) => {
        const p = P.prov[pn], n = cntT(p); if (!p || !(p.m.length + p.a.length + p.o.length)) return '';
        const [c, , , , cx, cy] = PV[pn], x = cx - W / 2, y = cy - H / 2;
        const dots = TYPES.map(([k, , col], i) => (on[k] && p[k].length ? `<circle cx="${x + 18 + i * 29}" cy="${y + H + 4}" r="14" fill="${col}"/><text x="${x + 18 + i * 29}" y="${y + H + 10}" style="font-size:17px;font-weight:800;fill:#fff;text-anchor:middle">${p[k].length}</text>` : '')).join('');
        return `<g class="bx pb ${n ? 'has' : ''} ${selP === pn ? 'sel' : ''} ${selP && selP !== pn ? 'dim' : ''}" data-p="${pn}" style="--c:${c}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="8"/><text class="hg" x="${cx}" y="${y + 56}">${pn}</text>${dots}</g>`;
      }).join('');
      {   // 기물별 개수와 전체 총계(한 기물이 여러 고을에 걸려도 한 번만 센다)
        const S = {}; TYPES.forEach(([k]) => { S[k] = new Set(); });
        [P.by, P.prov].forEach((grp) => Object.values(grp).forEach((o) => TYPES.forEach(([k]) => (o[k] || []).forEach((r) => S[k].add(r.own ? 'own:' + r.id : (r.b + '/' + r.n))))));
        const all = new Set(); TYPES.forEach(([k]) => { if (on[k]) S[k].forEach((x) => all.add(x)); });
        el.querySelectorAll('#bm-t button').forEach((b) => { const sm = b.querySelector('small'); if (sm) sm.textContent = S[b.dataset.k] ? S[b.dataset.k].size : ''; });
        const tt = el.querySelector('#bm-tot'); if (tt) tt.innerHTML = `반닫이·궤 전체 <b>${all.size}</b>점`;
      }
      el.querySelectorAll('#bm-pb button').forEach((b) => { const p = b.dataset.p, n = cntT(merge(PV[p][1], p)); b.setAttribute('aria-pressed', selP === p); b.querySelector('small').textContent = n ? n : ''; });
    }
    function items(o) {
      list = [];
      return TYPES.filter(([k]) => on[k] && o[k] && o[k].length).map(([k, n, c]) => o[k].map((r) => {
        list.push(r); const i = list.length - 1;
        return r.own ? `<button type="button" data-i="${i}">${r.t ? `<img class="ow" alt="" data-pid="${esc(r.t)}">` : ''}<span><i style="background:${c}"></i>우리 소장품<br>${esc((r.name || '') + ' ' + (r.era || ''))}<br>${esc((r.size || '').slice(0, 18))}</span></button>` :
          `<button type="button" data-i="${i}"><img loading="lazy" alt="" src="${r.thumb || `thumbs/${r.b}/${r.n}.jpg`}" onerror="this.style.visibility='hidden'"><span><i style="background:${c}"></i>${esc((r.owner || r.cat || n).slice(0, 12))}${/반닫이/.test(r.name || '') ? '' : ' · ' + esc(clean(r.name).slice(0, 8))}<br>${esc((r.era || '') + ' ' + (r.size || '').slice(0, 14))}</span></button>`;
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
        dlg.dataset.cid = r.b + '/' + (r.pid || r.n);
        const pc = r.pics && r.pics[vp] ? r.pics[vp] : r;
        if (r.pics) { img.src = pc.full; img.onerror = () => { if (!img.src.includes('/thumbs/')) img.src = pc.thumb; }; } else
        img.src = r.full || (r.h ? `https://jungmono.github.io/mokgagu-photos/photos/${r.b}/${encodeURIComponent(r.pid)}.jpg` : (r.t ? `thumbs/${r.b}/${r.n}.jpg` : ''));
        img.onerror = () => { if (r.t && !img.src.includes('/thumbs/')) img.src = `thumbs/${r.b}/${r.n}.jpg`; };
        img.alt = r.name;
        $d('d-info').innerHTML = `<div class="cat">${esc(r.cat || '')}</div><h3>${esc(r.name || '')}${r.hanja ? `<small>${esc(r.hanja)}</small>` : ''}</h3><dl>${dRow('종류', r.kind)}${dRow('연대', r.era)}${dRow('치수', r.size)}${dRow('재질', r.wood)}${dRow('소장', r.owner)}${dRow('도록', r.page ? r.page + '쪽' : '')}${dRow('비고', r.note)}${r.pics && r.pics.length > 1 ? dRow('사진', (vp + 1) + ' / ' + r.pics.length + '장') : ''}</dl>${r.pics && r.pics.length > 1 ? `<div class="bm-st">${r.pics.map((p, k) => `<button type="button" data-p="${k}" class="${k === vp ? 'on' : ''}"><img alt="" src="${p.thumb}"></button>`).join('')}</div>` : ''}${r.b === 'gijun' ? '<p style="margin-top:16px;color:#6b7183;font-size:14px">장석 감정실에 올린 기준 도판</p>' : r.b === 'joseongwe' ? '<p style="margin-top:16px;color:#6b7183;font-size:14px">출처: 정대영, 『조선의 궤』</p>' : `<a href="${r.b}.html">도록으로 돌아가기 →</a>`}`;
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
      panel.innerHTML = `<h3>${esc(r[1])} <small style="font-weight:400;color:#7a6c50">${r[2]}${pn ? ' · ' + pn : ''}</small></h3>
${jgHTML(JG[id])}
<div id="bm-d" style="white-space:pre-wrap;line-height:1.6;font-size:14.5px">${esc(d)}</div>
<div class="src">출처: ${esc(r[9])}${edits[id] != null ? ' · (고친 글' + (meta[id] && meta[id].editor ? ' · ' + esc(meta[id].editor) : '') + ')' : ''}</div>
<div class="bm-b"><button type="button" id="bm-e">편집</button></div>
<div class="bm-it">${items(p) || '<span class="src">이 지역으로 분류된 기물이 아직 없어요.</span>'}</div>
${KEY ? '<div id="bm-k"></div>' : ''}`;
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
${jgHTML(JGP[pn])}
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

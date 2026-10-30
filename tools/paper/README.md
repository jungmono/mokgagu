# 논문 재현 — 「조선 후기 반닫이 정면 비례의 지역별 분포」(2026)

포털 자료로 논문의 표·그림·검정을 다시 만든다. 도록을 보태면 이 순서로 다시 돌려 숫자를 갱신한다.

## 순서

```sh
node tools/search_pack.js                     # search.js를 고쳤다면 먼저(반닫이 작은 색인도 함께 새로 만듦)
node tools/paper/build_data.js                # 공개판 자료표(『조선의 궤』 뺌)
PW=가족암호 node tools/paper/build_data.js      # 가족판 자료표(『조선의 궤』 넣음) — 둘 중 하나만
python3 tools/paper/analyze.py                # 검정 → out/results.json
python3 tools/paper/figs.py                   # 그림 1~3 → out/fig1~3.png
```

결과는 모두 `tools/paper/out/`에 생기며 저장소에는 올리지 않는다(.gitignore). 가족판에는 『조선의 궤』 치수가 들어 있다.

## 표본 기준(논문·비례 자·장석 감정실과 같음)

- 이름이나 한자에 「반닫이」가 들고 지역명(도 또는 고을)이 붙은 기물. 고을은 도로 묶음(region-ruler.html 의 REG·MAP).
- 치수는 region-ruler.html 의 dims()로 읽음. 가로 40~140cm · 높이 25~120cm.
- 뺀 것: 반닫이장·탁자·연상·농·함·문갑 같은 다른 가구, 책반닫이, 윗닫이, 『조선의 궤』의 괄호 치수(족대 포함·제외 병기), 이건희 기증 ↔ 국립중앙박물관 같은 기물(mklink.js 번호 짝 — 박물관 쪽만 남김).

## 2026-10-29 기준 결과

- 가족판 297점: Kruskal-Wallis H(6)=121.9, ε²=0.42 · Jonckheere-Terpstra z=9.31 · 경상 중앙값 1.67.
- 공개판 191점: H(6)=98.4, ε²=0.52 · z=9.17 · 경상 중앙값 1.63.

비례 자의 「지역별 가로:세로」는 자료에서 바로 계산하므로 저절로 따라 바뀐다. 장석 감정실(Claude 아티팩트)의 비례 신호(RATIO_CNT)와 기준표 「비례 통계」는 숫자를 적어 두었으므로 가족판 결과가 바뀌면 손으로 고친다.

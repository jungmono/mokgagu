"""정대영 『조선의 궤』 도판 161점 도록 쪽(joseongwe.html)과 검색 색인 넣기 — ewha.html 을 틀로 쓴다.
입력: joseongwe.js(목록) · thumbs/joseongwe/N.jpg · 큰 사진은 mokgagu-photos/photos/joseongwe/N.jpg
쓰는 법: python3 tools/build_joseongwe.py   (여러 번 돌려도 같다. search.js·bandaji-idx.js 도 함께 새로 만든다)"""
import json, os, re, subprocess
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
SLUG, CAT = 'joseongwe', '조선의 궤'
HOST = 'https://jungmono.github.io/mokgagu-photos/photos/joseongwe/'
BOOK = '정대영, 『조선의 궤』'
s0 = open('joseongwe.js', encoding='utf-8').read()
J0 = json.loads(s0[s0.index('['):s0.rindex(']') + 1])
DO = {'haeju': '황해', 'gaeseong': '경기', 'ganghwa': '경기', 'namhan': '경기', 'geumsan': '충청', 'sangju': '경상', 'yecheon': '경상', 'eonyang': '경상',
      'miryang': '경상', 'yangsan': '경상', 'jinju': '경상', 'gimhae': '경상', 'namhae': '경상', 'tongyeong': '경상', 'iksan': '전라', 'jeonju': '전라',
      'namwon': '전라', 'naju': '전라', 'yeonggwang': '전라', 'jangheung': '전라', 'jeju': '제주'}
GRPS = ['경기·황해', '충청·강원', '전라', '경상', '평안(쑹숭이)', '제주']
def grp(r):
    d = DO.get(r['r']) or str(r['p']).replace('도', '')
    return {'경기': '경기·황해', '황해': '경기·황해', '충청': '충청·강원', '강원': '충청·강원', '전라': '전라', '경상': '경상', '평안': '평안(쑹숭이)', '제주': '제주'}.get(d, '')
items, ds, photos = [], [], []
for r in J0:
    n = r['n']; id_ = 'J%03d' % n
    w, h = Image.open('thumbs/joseongwe/%d.jpg' % n).size
    memo = r['note'].replace(' / ' + r['size'], '').replace(r['size'], '').strip(' /') if r['size'] else r['note']
    items.append({'id': id_, 'kind': grp(r), 'name': r['name'], 'hanja': '', 'cat': '', 'size': r['size'], 'wood': r['wood'], 'page': r['page'],
                  'memo': memo, 'pics': [{'src': HOST + r['pid'] + '.jpg', 'w': w * 4, 'h': h * 4}]})
    ds.append({'portal': '반닫이', 'id': id_, 'name': r['name'], 'hanja': '', 'kind': grp(r), 'type': '', 'size_raw': r['size'], 'era': '', 'owner': BOOK, 'page': r['page']})
    photos.append({'id': id_, 'img': 'thumbs/joseongwe/%d.jpg' % n})
J = lambda o: json.dumps(o, ensure_ascii=False)
s = open('ewha.html', encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) >= 1, a[:70]
    s = s.replace(a, b, 1)
rep('<title>이화여자대학교 박물관 목기·목가구 — 조선의 목가구</title>', '<title>조선의 궤(정대영) — 조선의 목가구</title>')
rep('<h1>이화여자대학교 박물관 소장품 — 목기·목가구</h1>', '<h1>조선의 궤 — 정대영</h1>')
rep('  <div class="filters" id="f-era"><span class="lab">시대</span></div>\n', '')
rep('예: 소반, 탁자, 화각, 느티나무', '예: 강화, 영광, 쑹숭이, 호리병')
rep('이름·설명에서 찾기', '이름·메모에서 찾기')
s = re.sub(r'<script type="application/json" id="ds-items">.*?</script>', lambda m: '<script type="application/json" id="ds-items">' + J(ds) + '</script>', s, flags=re.S)
s = re.sub(r'<script type="application/json" id="ds-photos">.*?</script>', lambda m: '<script type="application/json" id="ds-photos">' + J(photos) + '</script>', s, flags=re.S)
s = re.sub(r'^const ITEMS = .*$', lambda m: 'const ITEMS = ' + J(items) + ';', s, count=1, flags=re.M)
rep("const GRPS = ['소반', '탁자·책장', '장·농', '함·상자', '서안·경상·문방구'];", 'const GRPS = ' + J(GRPS) + ';')
rep("const ERAS = ['조선 19세기', '조선 19세기-20세기 초', '20세기 초'];", 'const ERAS = [];')
rep("const eOf = (i) => i.era || '';", "const eOf = (i) => '';")
rep("function chips() { chipRow('f-grp', GRPS, grp, gOf, (v) => { grp = v; }); chipRow('f-era', ERAS, era, eOf, (v) => { era = v; }); }",
    "function chips() { chipRow('f-grp', GRPS, grp, gOf, (v) => { grp = v; }); }")
rep("  `이화여자대학교 박물관 소장품 가운데 목기·목가구 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`,", "  `정대영 선생님의 『조선의 궤』에 실린 지역별 궤(반닫이) <b>${ITEMS.length}</b>점`,")
rep("  `기종·시대별로 골라 보거나 이름·설명으로 찾을 수 있습니다.`,", "  `지역별로 골라 보거나 이름·장석 메모로 찾을 수 있습니다. 크기는 가로×깊이×높이(cm)입니다.`,")
rep("  `카드를 누르면 박물관 설명과 원본 사진을 크게 볼 수 있습니다.`,", "  `반닫이여지도와 비례로 보는 반닫이에도 함께 나옵니다.`,")
tiles = ("const TILES = [['', '기물 전체', ITEMS.length, '전체 보기']" + ''.join(", [%s, %s, cnt(%s), '']" % (J(g), J(g), J(g)) for g in GRPS) + "];")
s = re.sub(r"^const TILES = .*$", lambda m: tiles, s, count=1, flags=re.M)
rep('grp === g && !era', 'grp === g')
rep("(!grp || gOf(i) === grp) && (!era || eOf(i) === era) && (!q || (i.name + ' ' + i.kr + ' ' + i.hanja + ' ' + i.mat).includes(q))",
    "(!grp || gOf(i) === grp) && (!q || (i.name + ' ' + (i.memo || '') + ' ' + (i.wood || '')).includes(q))")
rep("${esc(i.era || '')}${i.size ? ' · ' + esc(i.size) : ''}", "${i.size ? esc(i.size) + ' cm' : ''}")
rep('data-cid="ewha/${i.id}"', 'data-cid="joseongwe/${i.id.replace(/^J0*/, \'\')}"')
rep("dlg.dataset.cid = 'ewha/' + i.id", "dlg.dataset.cid = 'joseongwe/' + i.id.replace(/^J0*/, '')")
rep("'박물관 누리집에 사진이 아직 없습니다.'", "'사진이 없습니다.'")
rep(r"/^#(H\d+)$/", r"/^#(J\d+)$/")
a = s.index('<dt>시대</dt>'); b = s.index('</dl>', a)
s = s[:a] + ("<dt>크기</dt><dd>${esc(i.size ? i.size + ' cm' : '— (책에 크기 없음)')}</dd>"
             "${i.wood ? `<dt>재질</dt><dd>${esc(i.wood)}</dd>` : ''}"
             "${i.memo ? `<dt>메모</dt><dd>${esc(i.memo)}</dd>` : ''}"
             "${i.page ? `<dt>쪽</dt><dd>${esc(i.page)}쪽</dd>` : ''}"
             "<dt>출처</dt><dd>" + BOOK + "</dd>") + s[b:]
rep("${i.kr ? `<div class=\"d-desc\">${esc(i.kr)}</div>` : ''}", '')
open('joseongwe.html', 'w', encoding='utf-8').write(s)
# 표지: 첫 도판
im = Image.open('thumbs/joseongwe/1.jpg').convert('RGB') if not os.path.exists('covers/joseongwe.jpg') else None
if im: im.save('covers/joseongwe.jpg', quality=85)   # 표지는 책 표지 사진(2026-11-11)을 그대로 둔다
# 검색 색인
rows = json.loads(subprocess.run(['node', '-e', "global.window={};new Function('window',require('fs').readFileSync('search.js','utf8'))(window);process.stdout.write(JSON.stringify(window.SEARCH))"], capture_output=True, text=True, check=True).stdout)
rows = [r for r in rows if r['b'] != SLUG]
for r in J0:
    hay = {re.sub(r'\s+', '', x) for x in (r['name'], r['note'], r['wood'], CAT, '정대영', '궤', '반닫이', '앞닫이', grp(r)) if x}
    rows.append({'b': SLUG, 'n': r['n'], 'name': r['name'], 'hanja': '', 'cat': CAT, 'kind': '반닫이·궤', 'era': '', 'size': (r['size'] + ' cm') if r['size'] else '',
                 'wood': r['wood'], 'owner': BOOK, 'page': r['page'], 't': True, 'pid': r['pid'], 'h': True, 'fam': '', 'q': ' '.join(sorted(hay)).lower()})
open('search.js', 'w', encoding='utf-8').write('window.SEARCH=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';')
subprocess.run(['node', 'tools/search_pack.js'], check=True)
print(len(items), '점', {g: sum(1 for i in items if i['kind'] == g) for g in GRPS}, '미분류', sum(1 for i in items if not i['kind']), '색인', len(rows))

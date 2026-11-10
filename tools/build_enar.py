"""예나르 『조선의 목공예 — 부엌 세간과 사랑방의 기물』(1994) 도록 페이지(enar.html) 만들기 — ewha.html 을 틀로 쓴다.
입력: tools/enar_items.py(쪽·자를 곳·이름·크기), 도록을 찍은 사진(사용자 촬영본)을 tools/enar_crops.py 로 기물마다 잘라 낸 폴더, 표지 사진
출력: enar.html, thumbs/enar/N.jpg, covers/enar.jpg, ../mokgagu-photos/photos/enar/E###.jpg
쓰는 법:  python3 tools/enar_crops.py <잘라 낼 폴더> 1800   →   python3 tools/build_enar.py <잘라 낸 폴더> <표지.jpg> ../mokgagu-photos/photos/enar tools/enar_items.py
한 쪽에 기물이 여러 점인 쪽은 점마다 자르고, 다른 기물 조각·쪽 번호·캡션 글자는 지운다(inpaint). 사진은 긴 변 1800px, JPEG q82.
검색 색인은 tools/add_search_enar.py 로 넣는다."""
import glob, json, os, re, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
CROPS = sys.argv[1]          # build_crops.py 가 만든 잘라 낸 사진 폴더(NNN.jpg)
COVER = sys.argv[2]          # 책 표지 사진
PHOTOS = os.path.abspath(sys.argv[3])   # mokgagu-photos/photos/enar
ITEMS_PY = sys.argv[4]       # (쪽, 자를 곳, 이름, 한자, 크기, 메모) 목록
HOST = 'https://jungmono.github.io/mokgagu-photos/photos/enar/'
os.makedirs(PHOTOS, exist_ok=True); os.makedirs('thumbs/enar', exist_ok=True)

BOOK = '조선의 목공예 — 부엌 세간과 사랑방의 기물 (예나르, 1994)'
GRPS = ['반닫이', '장·농·책장', '상·문갑', '소반', '함·합', '문방·소품', '등잔·기타']


def grp(n):
    if '반닫이' in n: return '반닫이'
    if n.endswith('반'): return '소반'
    if re.search(r'등잔|초롱|조족등|등롱|기러기', n): return '등잔·기타'
    if n.startswith(('경상', '서안', '연상', '서견대')) or '문갑' in n: return '상·문갑'
    if re.search(r'장$|농$|뒤주|찬탁', n): return '장·농·책장'
    if re.search(r'함|합|빗접|경대|반짇고리|연초갑', n): return '함·합'
    return '문방·소품'


def portal(n):
    if '반닫이' in n: return '반닫이'
    if '찬탁' in n: return '사방탁자'
    if n.startswith(('경상', '서안')): return '서안'
    if '자개함' in n: return '함'
    if re.search(r'장$|약장|머릿', n): return '장·농'
    return ''


def hay_extra(n, cat):
    s = ''
    if '돈궤' in n: s += ' 돈궤'
    return s


exec(open(ITEMS_PY, encoding='utf-8').read())     # I = [(page, box, name, hanja, size, note)]
# 도록 인쇄 이름(괄호 표기 등)은 「도록 표기」로 남긴다
CATNAME = {'경상도 반닫이': '반닫이(경상도)', '강화 반닫이': '반닫이(강화)', '양산 반닫이': '반닫이(양산)', '남한산성 반닫이': '반닫이(남한산성)', '숭숭이반닫이': '반닫이(숭숭이)'}
SIZEFIX = {'100×542×78': '100×54.2×78'}
MEMO = {'100×542×78': '도록에는 「100×542×78」로 인쇄(54.2로 고침)'}
imgs = sorted(glob.glob(os.path.join(CROPS, '*.jpg')))
assert len(imgs) == len(I), (len(imgs), len(I))

im = ImageOps.exif_transpose(Image.open(COVER)).convert('RGB'); im.thumbnail((600, 800)); im.save('covers/enar.jpg', quality=85)

items, ds, photos = [], [], []
for n, ((pg, box, name, hanja, size_raw, note), f) in enumerate(zip(I, imgs), 1):
    id_ = 'E%03d' % n
    cat = CATNAME.get(name, '')
    size = SIZEFIX.get(size_raw, size_raw)
    memo = MEMO.get(size_raw, '')
    im = Image.open(f).convert('RGB'); w, h = im.size
    im.save(os.path.join(PHOTOS, id_ + '.jpg'), quality=82, optimize=True)
    t = im.copy(); t.thumbnail((420, 420)); t.save('thumbs/enar/%d.jpg' % n, quality=80, optimize=True)
    items.append({'id': id_, 'kind': grp(name), 'name': name, 'hanja': hanja, 'cat': cat, 'size': size,
                  'memo': memo, 'pics': [{'src': HOST + id_ + '.jpg', 'w': w, 'h': h}]})
    ds.append({'portal': portal(name), 'id': id_, 'name': name, 'hanja': hanja, 'kind': grp(name), 'type': '', 'size_raw': size, 'era': '',
               'owner': '예나르 조선의 목공예(1994)', 'page': ''})
    photos.append({'id': id_, 'img': 'thumbs/enar/%d.jpg' % n})

J = lambda o: json.dumps(o, ensure_ascii=False)
s = open('ewha.html', encoding='utf-8').read()


def rep(a, b, count=1):
    global s
    assert s.count(a) >= 1, a[:60]
    s = s.replace(a, b) if count == 0 else s.replace(a, b, count)


rep('<title>이화여자대학교 박물관 목기·목가구 — 조선의 목가구</title>', '<title>조선의 목공예 예나르 — 조선의 목가구</title>')
rep('<h1>이화여자대학교 박물관 소장품 — 목기·목가구</h1>', '<h1>조선의 목공예 — 예나르(1994)</h1>')
rep('  <div class="filters" id="f-era"><span class="lab">시대</span></div>\n', '')
rep('예: 소반, 탁자, 화각, 느티나무', '예: 반닫이, 경상, 나주반, 필통, 강화')
rep('이름·설명에서 찾기', '이름에서 찾기')
s = re.sub(r'<script type="application/json" id="ds-items">.*?</script>', lambda m: '<script type="application/json" id="ds-items">' + J(ds) + '</script>', s, flags=re.S)
s = re.sub(r'<script type="application/json" id="ds-photos">.*?</script>', lambda m: '<script type="application/json" id="ds-photos">' + J(photos) + '</script>', s, flags=re.S)
s = re.sub(r'^const ITEMS = .*$', lambda m: 'const ITEMS = ' + J(items) + ';', s, count=1, flags=re.M)
rep("const GRPS = ['소반', '탁자·책장', '장·농', '함·상자', '서안·경상·문방구'];", 'const GRPS = ' + J(GRPS) + ';')
rep("const ERAS = ['조선 19세기', '조선 19세기-20세기 초', '20세기 초'];", 'const ERAS = [];')
rep("const eOf = (i) => i.era || '';", "const eOf = (i) => '';")
rep("function chips() { chipRow('f-grp', GRPS, grp, gOf, (v) => { grp = v; }); chipRow('f-era', ERAS, era, eOf, (v) => { era = v; }); }",
    "function chips() { chipRow('f-grp', GRPS, grp, gOf, (v) => { grp = v; }); }")
rep("  `이화여자대학교 박물관 소장품 가운데 목기·목가구 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`,", "  `예나르가 1994년 펴낸 『조선의 목공예 — 부엌 세간과 사랑방의 기물』 도록의 기물 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`,")
rep("  `기종·시대별로 골라 보거나 이름·설명으로 찾을 수 있습니다.`,", "  `기종별로 골라 보거나 이름으로 찾을 수 있습니다. 크기는 도록에 적힌 순서(가로×옆너비×높이, cm) 그대로입니다.`,")
rep("  `카드를 누르면 박물관 설명과 원본 사진을 크게 볼 수 있습니다.`,", "  `한 쪽에 여러 점이 실린 쪽은 점마다 따로 잘라 크기를 맞춰 붙였습니다.`,")
desc = {'반닫이': '지역별 반닫이', '장·농·책장': '의걸이장·2층농·약장·뒤주·책장·찬탁', '상·문갑': '경상·서안·연상·문갑·서견대', '소반': '나주반·해주반·호족반·일주반·구족반', '함·합': '자개함·찬합·빗접·경대·담배함', '문방·소품': '필통·지통·필가·좌경·퇴침·화약통', '등잔·기타': '등잔·초롱·조족등·기러기'}
tiles = "const TILES = [['', '기물 전체', ITEMS.length, '전체 보기']" + ''.join(", ['%s', '%s', cnt('%s'), '%s']" % (g, g, g, desc[g]) for g in GRPS) + "];"
s = re.sub(r"^const TILES = .*$", lambda m: tiles, s, count=1, flags=re.M)
rep('grp === g && !era', 'grp === g')
rep("(!grp || gOf(i) === grp) && (!era || eOf(i) === era) && (!q || (i.name + ' ' + i.kr + ' ' + i.hanja + ' ' + i.mat).includes(q))",
    "(!grp || gOf(i) === grp) && (!q || (i.name + ' ' + (i.cat || '') + ' ' + (i.memo || '')).includes(q))")
rep("${esc(i.era || '')}${i.size ? ' · ' + esc(i.size) : ''}", "${i.size ? esc(i.size) + ' cm' : ''}")
rep('data-cid="ewha/${i.id}"', 'data-cid="enar/${i.id}"')
rep("dlg.dataset.cid = 'ewha/' + i.id", "dlg.dataset.cid = 'enar/' + i.id")
rep("'박물관 누리집에 사진이 아직 없습니다.'", "'사진이 없습니다.'")
rep(r"/^#(H\d+)$/", r"/^#(E\d+)$/")
# 상세 창: 시대·재질·분류·소장 → 크기·도록 표기·메모·출처
a = s.index('<dt>시대</dt>'); b = s.index('</dl>', a)
s = s[:a] + ("<dt>크기</dt><dd>${esc(i.size ? i.size + ' cm' : '— (도록에 크기 없음)')}</dd>"
             "${i.cat ? `<dt>도록 표기</dt><dd>${esc(i.cat)}</dd>` : ''}"
             "${i.memo ? `<dt>메모</dt><dd>${esc(i.memo)}</dd>` : ''}"
             "<dt>출처</dt><dd>" + BOOK + "</dd>") + s[b:]
rep("${i.kr ? `<div class=\"d-desc\">${esc(i.kr)}</div>` : ''}", '')
open('enar.html', 'w', encoding='utf-8').write(s)
print(len(items), '점', {g: sum(1 for i in items if i['kind'] == g) for g in GRPS})

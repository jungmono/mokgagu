"""예랑방·고목당 공동기획 『美術의 해 木工藝品百選展』(1995) 도록 페이지(yerang.html) 만들기 — ewha.html 을 틀로 쓴다.
입력: CSV(no,name,size_cm,catalog_name,note,file) + 도록을 찍은 사진(사용자 촬영본)
출력: yerang.html, thumbs/yerang/N.jpg, covers/yerang.jpg, ../mokgagu-photos/photos/yerang/Y##.jpg
사진은 사용자가 직접 찍은 것이라 긴 변 1800px, JPEG q82 로 줄인다. 검색 색인은 tools/add_search_yerang.py 로 넣는다."""
import csv, glob, json, os, re, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
CSV = sys.argv[1]
SRC = sys.argv[2]            # 사진 폴더
PHOTOS = os.path.abspath(sys.argv[3])   # mokgagu-photos/photos/yerang
HOST = 'https://jungmono.github.io/mokgagu-photos/photos/yerang/'
os.makedirs(PHOTOS, exist_ok=True); os.makedirs('thumbs/yerang', exist_ok=True)

BOOK = '美術의 해 木工藝品百選展 (예랑방·고목당 공동기획, 1995)'
GRPS = ['반닫이·돈괴', '장·농', '탁자·책장', '상·서안·문갑', '함·자개']


def grp(n):
    if '반다지' in n and '반다지장' not in n or '돈괴' in n: return '반닫이·돈괴'
    if n == '남원반다지장': return '반닫이·돈괴'
    if '탁자' in n or '찬탁' in n or '책장' in n and '머릿' not in n: return '탁자·책장'
    if n.startswith(('경상', '서안')) or '문갑' in n or '연상' in n: return '상·서안·문갑'
    if '자개' in n or n == '가마': return '함·자개'
    return '장·농'


def portal(n):
    if '반다지' in n: return '반닫이'
    if '탁자' in n or '찬탁' in n: return '사방탁자'
    if n.startswith(('경상', '서안')): return '서안'
    if '자개함' in n: return '함'
    if re.search(r'장$|장②|약장|머릿', n): return '장·농'
    return ''


def hay_extra(n, cat):
    s = ''
    if '돈괴' in n or '돈괴' in cat: s += ' 돈궤'
    return s


rows = list(csv.DictReader(open(CSV, encoding='utf-8')))
files = sorted(glob.glob(os.path.join(SRC, '*.jpg')))
assert len(files) == 87, len(files)

# 표지(0번 사진)
im = ImageOps.exif_transpose(Image.open(files[0])).convert('RGB'); im.thumbnail((600, 800)); im.save('covers/yerang.jpg', quality=85)

items, ds, photos = [], [], []
for n, r in enumerate(rows, 1):
    id_ = 'Y%02d' % n
    name, cat = r['name'], r['catalog_name']
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, r['file']))).convert('RGB')
    im.thumbnail((1800, 1800)); w, h = im.size
    im.save(os.path.join(PHOTOS, id_ + '.jpg'), quality=82, optimize=True)
    t = im.copy(); t.thumbnail((420, 420)); t.save('thumbs/yerang/%d.jpg' % n, quality=80, optimize=True)
    size = r['size_cm'].replace('×', ' × ') if r['size_cm'] else ''
    memo = r['note'] if name != cat or r['note'] else ''
    items.append({'id': id_, 'kind': grp(name), 'name': name, 'hanja': '', 'cat': cat if cat != name else '', 'size': r['size_cm'],
                  'memo': memo, 'pics': [{'src': HOST + id_ + '.jpg', 'w': w, 'h': h}]})
    ds.append({'portal': portal(name), 'id': id_, 'name': name, 'hanja': '', 'kind': grp(name), 'type': '', 'size_raw': r['size_cm'], 'era': '',
               'owner': '예랑방·고목당 목공예품 백선전(1995)', 'page': ''})
    photos.append({'id': id_, 'img': 'thumbs/yerang/%d.jpg' % n})

J = lambda o: json.dumps(o, ensure_ascii=False)
s = open('ewha.html', encoding='utf-8').read()


def rep(a, b, count=1):
    global s
    assert s.count(a) >= 1, a[:60]
    s = s.replace(a, b) if count == 0 else s.replace(a, b, count)


rep('<title>이화여자대학교 박물관 목기·목가구 — 조선의 목가구</title>', '<title>목공예품 백선전(예랑방·고목당 1995) — 조선의 목가구</title>')
rep('<h1>이화여자대학교 박물관 소장품 — 목기·목가구</h1>', '<h1>美術의 해 목공예품 백선전 — 예랑방·고목당 공동기획(1995)</h1>')
rep('  <div class="filters" id="f-era"><span class="lab">시대</span></div>\n', '')
rep('예: 소반, 탁자, 화각, 느티나무', '예: 반다지, 경상, 의걸이, 충청도, 김해')
rep('이름·설명에서 찾기', '이름에서 찾기')
s = re.sub(r'<script type="application/json" id="ds-items">.*?</script>', lambda m: '<script type="application/json" id="ds-items">' + J(ds) + '</script>', s, flags=re.S)
s = re.sub(r'<script type="application/json" id="ds-photos">.*?</script>', lambda m: '<script type="application/json" id="ds-photos">' + J(photos) + '</script>', s, flags=re.S)
s = re.sub(r'^const ITEMS = .*$', lambda m: 'const ITEMS = ' + J(items) + ';', s, count=1, flags=re.M)
rep("const GRPS = ['소반', '탁자·책장', '장·농', '함·상자', '서안·경상·문방구'];", 'const GRPS = ' + J(GRPS) + ';')
rep("const ERAS = ['조선 19세기', '조선 19세기-20세기 초', '20세기 초'];", 'const ERAS = [];')
rep("const eOf = (i) => i.era || '';", "const eOf = (i) => '';")
rep("function chips() { chipRow('f-grp', GRPS, grp, gOf, (v) => { grp = v; }); chipRow('f-era', ERAS, era, eOf, (v) => { era = v; }); }",
    "function chips() { chipRow('f-grp', GRPS, grp, gOf, (v) => { grp = v; }); }")
rep("  `이화여자대학교 박물관 소장품 가운데 목기·목가구 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`,", "  `예랑방과 고목당이 1995년 함께 연 『美術의 해 木工藝品百選展』 도록의 기물 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`,")
rep("  `기종·시대별로 골라 보거나 이름·설명으로 찾을 수 있습니다.`,", "  `기종별로 골라 보거나 이름으로 찾을 수 있습니다. 크기는 도록에 적힌 순서(가로×옆너비×높이, cm) 그대로입니다.`,")
rep("  `카드를 누르면 박물관 설명과 원본 사진을 크게 볼 수 있습니다.`,", "  `연필 이름은 정대영 선생님이 도록에 직접 써 넣으신 것이며, 도록에 인쇄된 이름은 창 안에 함께 적었습니다.`,")
tiles = "const TILES = [['', '기물 전체', ITEMS.length, '전체 보기'], ['반닫이·돈괴', '반닫이·돈괴', cnt('반닫이·돈괴'), '지역별 반다지와 돈괴'], ['장·농', '장·농', cnt('장·농'), '의걸이장·2층장·찬장·약장·머릿장'], ['탁자·책장', '탁자·책장', cnt('탁자·책장'), '사방탁자·3층탁자·찬탁·책장'], ['상·서안·문갑', '상·서안·문갑', cnt('상·서안·문갑'), '경상·서안·문갑·연상'], ['함·자개', '함·자개', cnt('함·자개'), '자개함·경대·가마']];"
s = re.sub(r"^const TILES = .*$", lambda m: tiles, s, count=1, flags=re.M)
rep('grp === g && !era', 'grp === g')
rep("(!grp || gOf(i) === grp) && (!era || eOf(i) === era) && (!q || (i.name + ' ' + i.kr + ' ' + i.hanja + ' ' + i.mat).includes(q))",
    "(!grp || gOf(i) === grp) && (!q || (i.name + ' ' + (i.cat || '') + ' ' + (i.memo || '')).includes(q))")
rep("${esc(i.era || '')}${i.size ? ' · ' + esc(i.size) : ''}", "${i.size ? esc(i.size) + ' cm' : ''}${i.memo && i.cat ? ' · 선생님 이름' : ''}")
rep('data-cid="ewha/${i.id}"', 'data-cid="yerang/${i.id}"')
rep("dlg.dataset.cid = 'ewha/' + i.id", "dlg.dataset.cid = 'yerang/' + i.id")
rep("'박물관 누리집에 사진이 아직 없습니다.'", "'사진이 없습니다.'")
rep(r"/^#(H\d+)$/", r"/^#(Y\d+)$/")
# 상세 창: 시대·재질·분류·소장 → 크기·도록 표기·메모·출처
a = s.index('<dt>시대</dt>'); b = s.index('</dl>', a)
s = s[:a] + ("<dt>크기</dt><dd>${esc(i.size ? i.size + ' cm' : '— (도록에 크기 없음)')}</dd>"
             "${i.cat ? `<dt>도록 표기</dt><dd>${esc(i.cat)}</dd>` : ''}"
             "${i.memo ? `<dt>메모</dt><dd>${esc(i.memo)}</dd>` : ''}"
             "<dt>출처</dt><dd>" + BOOK + "</dd>") + s[b:]
rep("${i.kr ? `<div class=\"d-desc\">${esc(i.kr)}</div>` : ''}", '')
open('yerang.html', 'w', encoding='utf-8').write(s)
print(len(items), '점', {g: sum(1 for i in items if i['kind'] == g) for g in GRPS})

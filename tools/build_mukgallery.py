"""묵갤러리 『조선의 멋 — 목기·장신구』(김미혜 소장展, 2016) 도록 페이지(mukgallery.html) 만들기 — dugaheon.html 을 틀로 쓴다.
입력: 도록을 찍은 사진에서 기물만 잘라 4:3(세로는 3:4)로 맞춘 파일(<CROPS>/<쪽번호>.jpg, 한 쪽에 둘이면 <쪽>_1·_2), 표지 사진
  python3 tools/build_mukgallery.py <CROPS> <표지.jpg> ../mokgagu-photos/photos/mukgallery
출력: mukgallery.html, thumbs/mukgallery/N.jpg, covers/mukgallery.jpg, <PHOTOS>/M##.jpg(M##-2.jpg 는 세부 사진)
검색 색인은 tools/add_search_mukgallery.py. 크기는 도록 캡션 순서(가로×옆너비×높이, cm)."""
import json, os, re, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
CROPS = sys.argv[1]; COVER = sys.argv[2]; PHOTOS = os.path.abspath(sys.argv[3])
HOST = 'https://jungmono.github.io/mokgagu-photos/photos/mukgallery/'
VER = '20261115'
os.makedirs(PHOTOS, exist_ok=True); os.makedirs('thumbs/mukgallery', exist_ok=True)
BOOK = '『조선의 멋 — 목기·장신구』 — 묵갤러리, 김미혜 소장展(2016)'
OWNER = '묵갤러리 · 김미혜 소장'
GRPS = ['반닫이', '약장', '장·농', '책장·탁자', '서안·경상·소반', '함·상자·소품']
MEDI, CHEST, DESK = 'Medicine Chest', 'Chest with Hinged Front Flap', 'Writing Desk'
# (이름, 한자, 영문, 시대, 크기, 재질, 지역, 갈래, 메모, [사진 파일: 첫째가 대표])
R = [
 ('약장', '', MEDI, '19세기', '93.5×29×37.5', '호두나무', '경기도', '약장', '', ['3']),
 ('약장', '', MEDI, '19세기', '75.7×29×105.5', '오동나무', '', '약장', '작은 약장과 함께 찍은 사진.', ['4']),
 ('약장', '', MEDI, '19세기', '89.5×23×128', '피나무', '', '약장', '', ['5', '6']),
 ('숭쑹이 반닫이(맞뚫임 장식)', '', CHEST, '19세기', '96.5×46.5×95', '피나무', '평안도', '반닫이', '', ['7']),
 ('숭쑹이 반닫이', '', CHEST, '19세기 후반', '51×32×51', '피나무·주칠', '평안도', '반닫이', '', ['8']),
 ('강화 반닫이', '', CHEST, '19세기', '79×43.5×65.5', '느티나무', '경기도 강화', '반닫이', '도록 표기: 강화반닫이.', ['9', '10']),
 ('반닫이(하문갑 구조)', '', CHEST, '19세기', '72.5×34.5×64', '피나무', '', '반닫이', '', ['11']),
 ('밀양 반닫이', '', CHEST, '19세기 후반', '79×41×60', '느티나무', '경상남도 밀양', '반닫이', '도록 표기: 반닫이, 경상남도 밀양.', ['12']),
 ('나주 반닫이(문갑 구조)', '', CHEST, '19세기', '106×40×95', '가래나무', '전라남도 나주', '반닫이', '도록 표기: 반닫이(문갑 구조), 전라남도 나주.', ['13', '14']),
 ('서안', '書案', DESK, '19세기', '68×31×33', '느티나무', '', '서안·경상·소반', '', ['15']),
 ('해주소반', '', 'Portable Table', '19세기', '14.5×29.5×26', '은행나무', '황해도 해주', '서안·경상·소반', '크기는 도록 표기 그대로.', ['16']),
 ('경상', '經床', "Scholar's Desk", '19세기', '64.5×23.5×25', '참죽나무', '', '서안·경상·소반', '', ['17']),
 ('서안', '書案', DESK, '19세기', '50×24×23', '은행나무', '', '서안·경상·소반', '한 쪽에 두 점이 실림(위).', ['18_1']),
 ('서안', '書案', DESK, '19세기', '56.5×28.5×29', '은행나무', '', '서안·경상·소반', '한 쪽에 두 점이 실림(아래).', ['18_2']),
 ('서안', '書案', DESK, '19세기', '69×29×39', '참죽나무', '', '서안·경상·소반', '', ['19']),
 ('이층책장(미닫이와 여닫이)', '二層冊櫃', 'Two-tiered Book Chest', '19세기', '104×40×94', '참죽나무', '경상남도 통영', '책장·탁자', '', ['20']),
 ('전주장', '', 'Two-tiered Chest', '19세기', '76×37×107', '느티나무', '전라북도 전주', '장·농', '', ['21']),
 ('이층농', '二層籠', 'Two-tiered Chest Inlaid with Mother-of-pearl', '19세기 후반', '80×39.5×135', '주칠·나전', '경기도', '장·농', '', ['22', '23']),
 ('이층농', '二層籠', 'Two-tiered Chest', '19세기', '70×39×93.4', '오동나무', '경기도', '장·농', '', ['24']),
 ('삼층책장(상층 공간)', '三層冊櫃', 'Three-tiered Book Chest', '19세기', '97×52×159', '물푸레나무', '경기(내사)', '책장·탁자', '', ['25']),
 ('책궤', '冊櫃', 'Book Chest', '19세기', '72×27.5×50', '느티나무', '', '책장·탁자', '', ['26']),
 ('책장', '', 'Book Chest', '19세기 초반', '122×42.5×94', '벽오동나무', '', '책장·탁자', '', ['27']),
 ('책장', '', 'Book Chest', '19세기 초반', '84×39×66', '은행나무', '', '책장·탁자', '', ['28', '29']),
 ('갑게수리', '甲鎧受理', 'Safety Box', '19세기', '107×33×56', '느티나무', '경기도', '함·상자·소품', '위쪽 작은 갑게수리는 문을 열어 속 서랍을 보인 사진.', ['30']),
 ('사층탁자(유리 그림)', '四層卓子', 'Four-tiered Flower Motive Chest', '19세기', '59×37.5×180', '화류목·유리', '경기도', '책장·탁자', '', ['31']),
 ('삼층화초장', '', 'Three-tiered Flower Motive Chest', '19세기 후반', '104×47.5×152.5', '나무에 주칠', '경기도', '장·농', '', ['32']),
 ('책탁', '冊卓', 'Book Shelf', '19세기 초반', '68×33×105', '소나무', '경기도', '책장·탁자', '', ['33']),
 ('삼층책장', '三層冊櫃', 'Three-tiered Book Chest', '19세기', '111×47×160.5', '소나무', '경기도', '책장·탁자', '', ['34']),
 ('지장', '', 'Paper-covered Chest', '19세기', '103×23×158.5', '소나무', '', '장·농', '작은 지장과 함께 찍은 사진.', ['35']),
 ('향탁', '香卓', 'Incense Table', '19세기 초반', '52×28×61', '은행나무(행자목)', '', '책장·탁자', '', ['36']),
 ('고비·등가·촛대', '考備', 'Letter Holder · Lamp Stand · Candle Holder', '19세기', '고비 10.5×6.5×85 · 등가 높이 44 · 촛대 높이 115', '느티나무', '', '함·상자·소품', '고비는 편지꽂이. 한 쪽에 세 점이 실림.', ['37']),
 ('갑게수리', '甲鎧受理', 'Safety Box', '19세기', '56×29×30.5', '느티나무(안쪽 피나무)', '', '함·상자·소품', '한 쪽에 두 점이 실림(위 큰 것).', ['38_1']),
 ('함', '函', 'Box', '19세기', '48.5×33×17', '오동나무', '', '함·상자·소품', '한 쪽에 두 점이 실림(아래).', ['38_2']),
 ('엽전궤', '葉錢櫃', 'Coin Chest', '19세기 초반', '92.5×42×48', '소나무', '경상남도 언양', '함·상자·소품', '', ['39']),
 ('약연', '', 'Medicine Grinder', '19세기', '31×6×5 · 26×9×7.5', '참죽나무 · 피나무', '', '함·상자·소품', '두 점(앞 참죽나무, 뒤 피나무).', ['40']),
 ('화약통', '火藥筒', 'Gun Powder Case', '19세기', '11.5×6.5×2.5 · 22×12×5 · 20×11.5×3', '', '', '함·상자·소품', '세 점.', ['41']),
 ('무관용 장식꽃이', '', 'Horangyisuyum and Case', '19세기', '함 높이 41.5 · 수염 길이 38', '오동나무 · 호랑이 수염', '', '함·상자·소품', '', ['42']),
]
def portal(n):
    if '반닫이' in n: return '반닫이'
    if n.startswith('약장'): return '약장'
    if n in ('서안', '경상'): return '서안'
    if '탁자' in n: return '사방탁자'
    if n.startswith('해주소반'): return '소반'
    if re.sub(r'\([^)]*\)', '', n).endswith(('장', '농')): return '장·농'
    return ''

im = ImageOps.exif_transpose(Image.open(COVER)).convert('RGB'); w, h = im.size
im = im.crop((int(w * .02), int(h * .02), int(w * .98), int(h * .98))); im.thumbnail((600, 800)); im.save('covers/mukgallery.jpg', quality=85)
def save(src, dst):
    im = Image.open(src).convert('RGB'); im.thumbnail((1800, 1800)); im.save(dst, quality=82, optimize=True); return im.size
items, ds, photos = [], [], []
for n, (name, hanja, en, era, size, wood, place, kind, memo, files) in enumerate(R, 1):
    id_ = 'M%02d' % n; pics = []
    for k, f in enumerate(files):
        fn = id_ + ('' if k == 0 else '-%d' % (k + 1)) + '.jpg'
        w, h = save(os.path.join(CROPS, f + '.jpg'), os.path.join(PHOTOS, fn))
        pics.append({'src': HOST + fn + '?v=' + VER, 'w': w, 'h': h})
        if k == 0:
            t = Image.open(os.path.join(PHOTOS, fn)); t.thumbnail((420, 420)); t.save('thumbs/mukgallery/%d.jpg' % n, quality=80, optimize=True)
    items.append({'id': id_, 'kind': kind, 'name': name, 'hanja': hanja, 'cat': en, 'era': era, 'size': size, 'wood': wood, 'place': place, 'memo': memo, 'no': n, 'pics': pics})
    ds.append({'portal': portal(name), 'id': id_, 'name': name, 'hanja': hanja, 'kind': kind, 'type': '', 'size_raw': size, 'era': era, 'owner': OWNER, 'page': ''})
    photos.append({'id': id_, 'img': 'thumbs/mukgallery/%d.jpg?v=%s' % (n, VER)})

J = lambda o: json.dumps(o, ensure_ascii=False)
s = open('dugaheon.html', encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) >= 1, a[:70]
    s = s.replace(a, b)
rep('<title>화가가 애호하는 조선시대 목가구(두가헌) — 조선의 목가구</title>', '<title>조선의 멋 목기·장신구(묵갤러리 김미혜 소장展) — 조선의 목가구</title>')
rep('<h1>화가가 애호하는 조선시대 목가구 — 두가헌 갤러리</h1>', '<h1>조선의 멋 목기·장신구 — 김미혜 소장展</h1>')
rep('예: 반닫이, 서안, 사방탁자, 필통', '예: 약장, 반닫이, 서안, 밀양, 오동나무')
s = re.sub(r'<script type="application/json" id="ds-items">.*?</script>', lambda m: '<script type="application/json" id="ds-items">' + J(ds) + '</script>', s, flags=re.S)
s = re.sub(r'<script type="application/json" id="ds-photos">.*?</script>', lambda m: '<script type="application/json" id="ds-photos">' + J(photos) + '</script>', s, flags=re.S)
s = re.sub(r'^const ITEMS = .*$', lambda m: 'const ITEMS = ' + J(items) + ';', s, count=1, flags=re.M)
s = re.sub(r'^const GRPS = .*$', lambda m: 'const GRPS = ' + J(GRPS) + ';', s, count=1, flags=re.M)
rep("`두가헌 갤러리 『화가가 애호하는 조선시대 목가구』 — 여섯 화가가 소장한 가구 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`",
    "`묵갤러리 김미혜 소장展 『조선의 멋 — 목기·장신구』(2016)에 실린 목기·목가구 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`")
rep("`기종별로 골라 보거나 이름으로 찾을 수 있습니다. 크기는 도록에 적힌 순서(가로×옆너비×높이, cm) 그대로입니다.`",
    "`기종별로 골라 보거나 이름·재질·지역으로 찾을 수 있습니다. 크기는 도록에 적힌 순서(가로×옆너비×높이, cm) 그대로입니다. 장신구 부분은 아직 싣지 않았습니다.`")
tiles = "const TILES = [['', '기물 전체', ITEMS.length, '전체 보기']" + ''.join(", [%s, %s, cnt(%s), %s]" % (J(g), J(g), J(g), J(d)) for g, d in zip(GRPS, ['평안·경기·경상·전라 반닫이', '호두·오동·피나무 약장', '전주장·이층농·화초장·지장', '책장·책궤·책탁·사층탁자·향탁', '서안·경상·해주소반', '갑게수리·함·엽전궤·약연·화약통'])) + "];"
s = re.sub(r"^const TILES = .*$", lambda m: tiles, s, count=1, flags=re.M)
rep("(i.name + ' ' + (i.hanja || '') + ' ' + (i.cat || '') + ' ' + (i.memo || ''))", "(i.name + ' ' + (i.hanja || '') + ' ' + (i.cat || '') + ' ' + (i.memo || '') + ' ' + (i.wood || '') + ' ' + (i.place || ''))")
rep('data-cid="dugaheon/${i.id}"', 'data-cid="mukgallery/${i.id}"')
rep("dlg.dataset.cid = 'dugaheon/' + i.id", "dlg.dataset.cid = 'mukgallery/' + i.id")
rep(r"/^#(D\d+)$/", r"/^#(M\d+)$/")
a = s.index('<dt>크기</dt>'); b = s.index('</dl>', a)
s = s[:a] + ("<dt>크기</dt><dd>${esc(i.size ? i.size + ' cm' : '—')}</dd>${i.era ? `<dt>시대</dt><dd>조선 ${esc(i.era)}</dd>` : ''}"
             "${i.wood ? `<dt>재질</dt><dd>${esc(i.wood)}</dd>` : ''}${i.place ? `<dt>지역</dt><dd>${esc(i.place)}</dd>` : ''}"
             "${i.cat ? `<dt>영문 표기</dt><dd>${esc(i.cat)}</dd>` : ''}${i.memo ? `<dt>메모</dt><dd>${esc(i.memo)}</dd>` : ''}"
             "<dt>소장</dt><dd>" + OWNER + "</dd><dt>출처</dt><dd>" + BOOK + "</dd>") + s[b:]
s = re.sub(r'(mokgagu-photos/photos/)dugaheon/(D\d+\.jpg)', r'\1mukgallery/\2', s)
open('mukgallery.html', 'w', encoding='utf-8').write(s)
print(len(items), '점', {g: sum(1 for i in items if i['kind'] == g) for g in GRPS}, 'dugaheon 남은 곳', len(re.findall('dugaheon|두가헌', s)))

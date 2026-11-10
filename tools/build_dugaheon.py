"""두가헌 갤러리 『화가가 애호하는 조선시대 목가구』(여섯 화가의 소장 가구) 도록 페이지(dugaheon.html) 만들기 — yerang.html 을 틀로 쓴다.
입력: 도록을 찍은 사진(사용자 촬영본) → 회색 바탕 사진 부분만 잘라 4:3(세로는 3:4)로 맞춘 파일(/tmp/out/<쪽번호>.jpg, 쪽번호=촬영 순서 3~66)
출력: dugaheon.html, thumbs/dugaheon/N.jpg, covers/dugaheon.jpg, ../mokgagu-photos/photos/dugaheon/D##.jpg (D 뒤 숫자 = 도록 인쇄 번호)
검색 색인은 tools/add_search_dugaheon.py. 크기는 도록 캡션 순서(가로×옆너비×높이, cm)."""
import glob, json, os, re, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
CROPS = sys.argv[1]; COVER = sys.argv[2]; PHOTOS = os.path.abspath(sys.argv[3])
HOST = 'https://jungmono.github.io/mokgagu-photos/photos/dugaheon/'
os.makedirs(PHOTOS, exist_ok=True); os.makedirs('thumbs/dugaheon', exist_ok=True)
BOOK = '『화가가 애호하는 조선시대 목가구』 — 두가헌 갤러리, 여섯 화가의 소장 가구'
GRPS = ['반닫이·궤', '장·농·뒤주', '탁자·책장', '상·서안·문갑', '문방·함·소품']

# (도록 번호, 쪽 사진 번호, 이름, 한자, 영문, 시대, 크기, 갈래, 메모)
R = [
 (1,3,'이층사방탁자','二層四方卓子','Book Shelf','19세기','49×39×89','탁자·책장',''),
 (2,4,'문갑','文匣','Document Chest','19세기','55.4×24.3×39','상·서안·문갑',''),
 (3,5,'연상','硯床','Inkstone Desk','19세기','24×39×25','문방·함·소품',''),
 (4,6,'이층책장','二層冊櫃','Book Chest','18세기','102×41×85','탁자·책장',''),
 (5,7,'재떨이','','Ash Tray','19세기','지름 31 × 높이 5','문방·함·소품',''),
 (6,8,'빗접','','Comb Box','19세기','27.5×27.5×24','문방·함·소품',''),
 (7,9,'서안','書案','Writing Desk','19세기','64×24×19','상·서안·문갑',''),
 (8,10,'서안','書案','Writing Desk','19세기','79×38×32','상·서안·문갑',''),
 (9,11,'서안','書案','Writing Desk','19세기','65×27×25','상·서안·문갑',''),
 (10,12,'서안','書案','Writing Desk','19세기','77×31×25','상·서안·문갑',''),
 (11,13,'경상','經床','Writing Desk','19세기','71×28×36','상·서안·문갑',''),
 (12,14,'경상','經床','Writing Desk','19세기','70×33×32','상·서안·문갑',''),
 (13,15,'탁상','卓床','Writing Desk','19세기','122.5×31×24','상·서안·문갑',''),
 (14,16,'탁상','卓床','Writing Desk','19세기','218×38×30','상·서안·문갑',''),
 (15,17,'지제연갑','紙製硯匣','Paper Inkstone Case','19세기','11×15×3','문방·함·소품',''),
 (16,18,'연갑','硯匣','Inkstone Case','19세기','25×14×14','문방·함·소품',''),
 (17,19,'연상','硯床','Inkstone Box','19세기','34×18×17','문방·함·소품',''),
 (18,20,'필갑','筆匣','Brush Case','19세기','25×10×7','문방·함·소품',''),
 (19,21,'필통','筆筒','Brush Stand','19세기','21×7×17','문방·함·소품',''),
 (20,22,'필통','筆筒','Brush Stand','19세기','25×25×18','문방·함·소품',''),
 (21,23,'지통','紙筒','Paper-roll Stand','19세기','지름 27 × 높이 23','문방·함·소품',''),
 (22,24,'서류함','書類函','Document Box','19세기','34×21×6','문방·함·소품',''),
 (23,25,'(이름 확인 필요)','','','','','문방·함·소품','도록 23번 — 사진 촬영에서 캡션이 잘려 이름·크기를 읽지 못했습니다. 도록을 다시 찍으면 채웁니다.'),
 (24,26,'서류함','書類函','Document Box','19세기','31×16×11','문방·함·소품',''),
 (25,27,'서류함','書類函','Document Box','19세기','36×21×22','문방·함·소품',''),
 (26,28,'영정함','影幀函','Portrait Box','19세기','93×29×19','문방·함·소품',''),
 (27,29,'궤','櫃','Seal Box','19세기','14×14×16','문방·함·소품',''),
 (28,30,'망건통','網巾筒','Head-band Case','19세기','10×9×14','문방·함·소품',''),
 (29,31,'망건통','網巾筒','Head-band Case','19세기','11×11×13','문방·함·소품',''),
 (30,32,'목침','木枕','Wooden Pillow','19세기','14×6×11','문방·함·소품',''),
 (31,33,'목침','木枕','Wooden Pillow','19세기','17×7.5×12.5','문방·함·소품',''),
 (32,34,'문갑','文匣','Document Chest','19세기','51×14×23','상·서안·문갑',''),
 (33,35,'문갑','文匣','Document Chest','19세기','63×26×34','상·서안·문갑',''),
 (34,36,'반닫이','櫃','Chest','19세기','91×41×57','반닫이·궤',''),
 (35,37,'반닫이','櫃','Chest','19세기','98×41×68','반닫이·궤',''),
 (36,38,'궤','櫃','Head-side Chest','18세기','88×36×49','반닫이·궤',''),
 (37,39,'반닫이','櫃','Chest','19세기','95×40×78','반닫이·궤',''),
 (38,40,'이층책장','二層冊櫃','Book Chest','19세기','','탁자·책장','도록 38번 — 사진 촬영에서 캡션 아랫부분이 잘려 크기를 읽지 못했습니다.'),
 (39,41,'이층장','二層欌','Chest','18세기','116×49×114','장·농·뒤주',''),
 (40,42,'이층사방탁자','二層四方卓子','Book Shelf','19세기','49×33×124','탁자·책장',''),
 (41,43,'삼층사방탁자','三層四方卓子','Book Shelf','19세기','46×45×141','탁자·책장',''),
 (42,44,'끽연도구와 재판','煙草道具','Smoking Set and Tray','19세기','재판 80×48×5, 연초갑 11×15×9.5','문방·함·소품',''),
 (43,45,'재판','','Smoking Set Tray','19세기','45×28×4','문방·함·소품',''),
 (44,46,'바둑판','棋盤','Go Board','19세기','바둑판 41×41×30, 바둑알통 각 13×13×8','문방·함·소품',''),
 (45,47,'문갑','文匣','Document Chest','19세기','89×25×35.5 (한 점)','상·서안·문갑','두 점 한 쌍. 크기는 한 점 기준.'),
 (46,48,'머릿장','欌','Head-side Chest','19세기','122×44×64','장·농·뒤주',''),
 (47,49,'머릿장','欌','Head-side Chest','19세기','84×31×58','장·농·뒤주',''),
 (48,50,'좌경','座鏡','Mirror Box','19세기','16×23×12','문방·함·소품',''),
 (49,51,'좌경','座鏡','Mirror Box','19세기','20×29×20','문방·함·소품',''),
 (50,52,'이층농','二層籠','Clothing Chest','19세기','78×38×121','장·농·뒤주',''),
 (51,53,'이층농','二層籠','Clothing Chest','19세기','82×43×138','장·농·뒤주',''),
 (52,54,'이층사방탁자','二層四方卓子','Cupboard','19세기','44×21×60','탁자·책장',''),
 (53,55,'삼층사방찬탁자','三層四方饌卓子','Cupboard','19세기','86×36×152','탁자·책장',''),
 (54,56,'삼층사방찬탁자','三層四方饌卓子','Cupboard','19세기','95×35×159','탁자·책장',''),
 (55,57,'삼층찬탁자','三層饌卓子','Cup Board and Pantry','19세기','65×36×132','탁자·책장',''),
 (56,58,'삼층찬탁자','三層饌卓子','Cup Board and Pantry','19세기','93×37×125','탁자·책장',''),
 (57,59,'찻상','茶床','Tea Table','19세기','43×36×12','상·서안·문갑',''),
 (58,60,'해주반','海州盤','Dining Table','19세기','48×39×27','상·서안·문갑',''),
 (59,61,'뒤주','','Grain Chest','19세기','44×34×46','장·농·뒤주',''),
 (60,62,'뒤주장','','Grain Chest','18세기','102×43×79','장·농·뒤주',''),
 (61,63,'반닫이','櫃','Chest','19세기','99×54×77','반닫이·궤',''),
 (62,64,'반닫이','櫃','Chest','19세기','80×41×59','반닫이·궤',''),
 (67,65,'향상','香床','Incense Burner Table','19세기','33×24×36','상·서안·문갑',''),
 (68,66,'향상','香床','Incense Burner Table','19세기','40×27×40','상·서안·문갑',''),
]

def portal(n):
    if n == '반닫이': return '반닫이'
    if '탁자' in n: return '사방탁자'
    if n in ('서안', '경상', '탁상'): return '서안'
    if n.endswith('장') or n.endswith('농'): return '장·농'
    return ''

im = ImageOps.exif_transpose(Image.open(COVER)).convert('RGB'); im.thumbnail((600, 800)); im.save('covers/dugaheon.jpg', quality=85)
items, ds, photos = [], [], []
for n, (no, pg, name, hanja, en, era, size, kind, memo) in enumerate(R, 1):
    id_ = 'D%02d' % no
    im = Image.open(os.path.join(CROPS, '%d.jpg' % pg)).convert('RGB'); im.thumbnail((1800, 1800)); w, h = im.size
    im.save(os.path.join(PHOTOS, id_ + '.jpg'), quality=82, optimize=True)
    t = im.copy(); t.thumbnail((420, 420)); t.save('thumbs/dugaheon/%d.jpg' % n, quality=80, optimize=True)
    items.append({'id': id_, 'kind': kind, 'name': name, 'hanja': hanja, 'cat': en, 'era': era, 'size': size, 'memo': memo, 'no': no,
                  'pics': [{'src': HOST + id_ + '.jpg', 'w': w, 'h': h}]})
    ds.append({'portal': portal(name), 'id': id_, 'name': name, 'hanja': hanja, 'kind': kind, 'type': '', 'size_raw': size, 'era': era,
               'owner': '두가헌 갤러리 · 여섯 화가의 소장 가구', 'page': ''})
    photos.append({'id': id_, 'img': 'thumbs/dugaheon/%d.jpg' % n})

J = lambda o: json.dumps(o, ensure_ascii=False)
s = open('yerang.html', encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) >= 1, a[:70]
    s = s.replace(a, b)
rep('<title>목공예품 백선전(예랑방·고목당 1995) — 조선의 목가구</title>', '<title>화가가 애호하는 조선시대 목가구(두가헌) — 조선의 목가구</title>')
rep('<h1>美術의 해 목공예품 백선전 — 예랑방·고목당 공동기획(1995)</h1>', '<h1>화가가 애호하는 조선시대 목가구 — 두가헌 갤러리</h1>')
rep('예: 반닫이, 경상, 의걸이, 충청도, 김해', '예: 반닫이, 서안, 사방탁자, 필통')
s = re.sub(r'<script type="application/json" id="ds-items">.*?</script>', lambda m: '<script type="application/json" id="ds-items">' + J(ds) + '</script>', s, flags=re.S)
s = re.sub(r'<script type="application/json" id="ds-photos">.*?</script>', lambda m: '<script type="application/json" id="ds-photos">' + J(photos) + '</script>', s, flags=re.S)
s = re.sub(r'^const ITEMS = .*$', lambda m: 'const ITEMS = ' + J(items) + ';', s, count=1, flags=re.M)
s = re.sub(r'^const GRPS = .*$', lambda m: 'const GRPS = ' + J(GRPS) + ';', s, count=1, flags=re.M)
rep("`예랑방과 고목당이 1995년 함께 연 『美術의 해 木工藝品百選展』 도록의 기물 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`",
    "`두가헌 갤러리 『화가가 애호하는 조선시대 목가구』 — 여섯 화가가 소장한 가구 <b>${ITEMS.length}</b>점, 사진 ${nPics}장`")
tiles = "const TILES = [['', '기물 전체', ITEMS.length, '전체 보기'], ['반닫이·궤', '반닫이·궤', cnt('반닫이·궤'), '반닫이와 궤'], ['장·농·뒤주', '장·농·뒤주', cnt('장·농·뒤주'), '이층장·이층농·머릿장·뒤주'], ['탁자·책장', '탁자·책장', cnt('탁자·책장'), '사방탁자·찬탁자·책장'], ['상·서안·문갑', '상·서안·문갑', cnt('상·서안·문갑'), '서안·경상·탁상·문갑·찻상·향상'], ['문방·함·소품', '문방·함·소품', cnt('문방·함·소품'), '연상·필통·서류함·망건통·목침·좌경']];"
s = re.sub(r"^const TILES = .*$", lambda m: tiles, s, count=1, flags=re.M)
rep("(i.name + ' ' + (i.cat || '') + ' ' + (i.memo || ''))", "(i.name + ' ' + (i.hanja || '') + ' ' + (i.cat || '') + ' ' + (i.memo || ''))")
rep("${i.size ? esc(i.size) + ' cm' : ''}${i.memo && i.cat ? ' · 선생님 이름' : ''}", "${i.size ? esc(i.size) + ' cm' : ''}")
rep('data-cid="yerang/${i.id}"', 'data-cid="dugaheon/${i.id}"')
rep("dlg.dataset.cid = 'yerang/' + i.id", "dlg.dataset.cid = 'dugaheon/' + i.id")
rep(r"/^#(Y\d+)$/", r"/^#(D\d+)$/")
a = s.index('<dt>크기</dt>'); b = s.index('</dl>', a)
s = s[:a] + ("<dt>크기</dt><dd>${esc(i.size ? i.size + ' cm' : '— (도록 캡션이 잘려 읽지 못함)')}</dd>"
             "${i.era ? `<dt>시대</dt><dd>조선 ${esc(i.era)}</dd>` : ''}"
             "${i.cat ? `<dt>영문 표기</dt><dd>${esc(i.cat)}</dd>` : ''}"
             "${i.memo ? `<dt>메모</dt><dd>${esc(i.memo)}</dd>` : ''}"
             "<dt>도록 번호</dt><dd>${i.no}</dd><dt>출처</dt><dd>" + BOOK + "</dd>") + s[b:]
rep("`연필 이름은 정대영 선생님이 도록에 직접 써 넣으신 것이며, 도록에 인쇄된 이름은 창 안에 함께 적었습니다.`", "`사진으로 찍은 도록이라 도록 번호 63~66은 빠져 있고, 23번은 이름·38번은 크기를 읽지 못해 표시해 두었습니다. 사진은 회색 바탕 부분만 잘랐습니다.`")
open('dugaheon.html', 'w', encoding='utf-8').write(s)
print(len(items), '점', {g: sum(1 for i in items if i['kind'] == g) for g in GRPS})

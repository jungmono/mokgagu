"""호암미술관 『조선목가구대전 — 나뭇결에 스민 지혜』(2002) 도록 페이지(hoam.html) 만들기 — dugaheon.html 을 틀로 쓴다.
입력: 스캔 PDF(쪽마다 180° 뒤집혀 들어옴), 표지 사진, 사진 저장 폴더
  python3 tools/build_hoam.py "<스캔.pdf>" "<표지.png>" ../mokgagu-photos/photos/hoam
출력: hoam.html, thumbs/hoam/N.jpg, covers/hoam.jpg, ../mokgagu-photos/photos/hoam/H##.jpg (H 뒤 숫자 = 도록 인쇄 번호)
검색 색인은 tools/add_search_hoam.py. 크기는 가로×옆너비×높이(cm; 도록은 高·幅 가로×옆너비 순서로 적음).
이어 스캔하면 R 표와 PLATE(도록 번호 → 쪽 번호)에 줄을 보태고 다시 돌린다."""
import glob, json, os, re, subprocess, sys, tempfile
import cv2, numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
PDF = os.path.abspath(sys.argv[1]); COVER = sys.argv[2]; PHOTOS = os.path.abspath(sys.argv[3])
HOST = 'https://jungmono.github.io/mokgagu-photos/photos/hoam/'
VER = '20261113b'
os.makedirs(PHOTOS, exist_ok=True); os.makedirs('thumbs/hoam', exist_ok=True)
BOOK = '『조선목가구대전 — 나뭇결에 스민 지혜』 — 호암미술관, 2002 (사랑방 가구)'
GRPS = ['서안·경상', '연상', '문갑', '탁자·책장']

HMU = '호암미술관'; NMK = '국립중앙박물관'; PRI = '개인'; SNU = '서울대학교박물관'
# (도록 번호, 이름, 한자, 영문, 시대, 크기(가로×옆너비×높이), 갈래, 소장처, 메모)
R = [
 (1,'서안','書案','Writing Desk','19세기','64×29.6×26.5','서안·경상',PRI,''),
 (2,'서안','書案','Writing Desk','19세기','65×26.8×29','서안·경상',HMU,''),
 (3,'서안','書案','Writing Desk','19세기','64×29.6×28','서안·경상',HMU,''),
 (4,'서안','書案','Writing Desk','19세기','48×26×27.5','서안·경상',HMU,''),
 (5,'서안','書案','Writing Desk','19세기','57.5×27.8×25.7','서안·경상',HMU,''),
 (6,'서안','書案','Writing Desk','19세기','65.6×28.6×28.6','서안·경상','이희숙','스캔이 흑백(2진)으로 되어 사진이 거칩니다. 다시 스캔하면 바꿉니다.'),
 (7,'서안','書案','Writing Desk','19세기','62×26×27','서안·경상',HMU,''),
 (8,'서안','書案','Writing Desk','19세기','73.5×33×29','서안·경상',HMU,''),
 (9,'서안','書案','Writing Desk','19세기','59×32.7×31.2','서안·경상',PRI,'도록 9-1·9-2, 같은 기물을 두 방향에서 찍은 사진 2장.'),
 (10,'경상','經床','Writing Desk','19세기','76.3×32×34.7','서안·경상',NMK,''),
 (11,'경상','經床','Writing Desk','19세기','65.3×30×31','서안·경상',HMU,''),
 (12,'경상','經床','Writing Desk','18세기','62×27×34.5','서안·경상',HMU,''),
 (13,'연상','硯床','Inkstone Table','19세기','35.8×22.8×29','연상',HMU,''),
 (14,'연상','硯床','Inkstone Table','19세기','33.3×20.2×26.5','연상',NMK,''),
 (15,'연상','硯床','Inkstone Table','19세기','33×22×18.5','연상',SNU,''),
 (16,'연상','硯床','Inkstone Table','19세기','19×32×20.5','연상',SNU,'도록 표기 순서 그대로(幅 19×32).'),
 (17,'죽장연상','竹張硯床','Bamboo Plated Inkstone Table','19세기','45.8×28.3×29.3','연상',HMU,''),
 (18,'죽장연상','竹張硯床','Bamboo Plated Inkstone Table','19세기','19.3×32.6×25.9','연상','정민자','도록 표기 순서 그대로(幅 19.3×32.6).'),
 (19,'연상','硯床','Inkstone Table','19세기','40.4×29.8×26','연상',NMK,''),
 (20,'문갑','文匣','Document Chest','19세기','108×21.2×28.4','문갑',NMK + '(김종학 기증품)','도록 펼침면(36~37쪽)에 걸친 사진을 이어 붙였습니다.'),
 (21,'문갑','文匣','Document Chest','19세기','165×34.6×38.5','문갑',HMU,'도록 펼침면(38~39쪽)에 걸친 사진을 이어 붙였습니다.'),
 (22,'문갑','文匣','Document Chest','19세기','83×20×53.5','문갑',NMK + '(김종학 기증품)',''),
 (23,'문갑','文匣','Document Chest','19세기','58.6×24.5×30.4','문갑','박옥경',''),
 (24,'문갑','文匣','Document Chest','19세기','53×10.5×19.3','문갑',SNU,''),
 (25,'문갑','文匣','Document Chest','19세기','46.5×21.5×30','문갑',PRI,''),
 (26,'사층사방탁자','四層四方卓子','Book Shelf','19세기','41.5×34×162.3','탁자·책장',NMK,''),
 (27,'사층사방탁자','四層四方卓子','Book Shelf','19세기','47×33.8×168.5','탁자·책장',SNU,''),
 (28,'삼층탁자','三層卓子','Book Shelf','19세기','36.4×34×132.8','탁자·책장',NMK,''),
 (29,'사층탁자','四層卓子','Book Shelf','19세기','38.2×38.2×158.6','탁자·책장',PRI,''),
 (30,'사층탁자','四層卓子','Book Shelf','19세기','54.8×18×117.5','탁자·책장','이화여자대학교박물관',''),
]
# 도록 번호 → 스캔 PDF 쪽 번호 (두 쪽이면 [왼쪽 쪽, 오른쪽 쪽] 펼침면, 'two' 는 한 쪽에 사진 두 장)
PLATE = {1: 14, 2: 15, 3: 16, 4: 17, 5: 18, 6: 19, 7: 20, 8: 21, 9: 'two22', 10: 23, 11: 24, 12: 25, 13: 26, 14: 27, 15: 28,
         16: 29, 17: 30, 18: 31, 19: 32, 20: (34, 35), 21: (36, 37), 22: 38, 23: 39, 24: 40, 25: 41, 26: 42, 27: 43, 28: 44, 29: 45, 30: 46}

# ---- 스캔 쪽 읽기 (모두 180° 돌려 바로 세운다) ----
TMP = tempfile.mkdtemp(prefix='hoam_')
subprocess.run(['pdfimages', '-j', PDF, os.path.join(TMP, 'r')], check=True)
RAW = sorted(glob.glob(os.path.join(TMP, 'r-*')))
def page(n):
    im = Image.open(RAW[n - 1]).convert('RGB').rotate(180, expand=True)
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)

def find_boxes(img, minarea=120000):
    H, W = img.shape[:2]; S = W / 1654.0   # 200dpi 기준 배율(400dpi 스캔이면 2)
    minarea = int(minarea * S * S); k = lambda v: max(1, int(round(v * S)))
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 3 * S)
    m = (g < 251).astype(np.uint8)
    m[int(H * 0.885):, :] = 0; m[:int(H * 0.025), :] = 0          # 아래 캡션·위 쪽번호 제외
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((k(9), k(9)), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((k(41), k(41)), np.uint8))
    nl, lab, st, _ = cv2.connectedComponentsWithStats(m)
    comps = sorted([(int(st[i, 4]), [int(v) for v in st[i, :4]]) for i in range(1, nl) if st[i, 4] > minarea], key=lambda c: -c[0])
    return [c[1] for c in comps]

def soften(img, b, pad=70):
    """사진 바탕이 종이와 거의 같은 쪽은 사각형이 안 보여 물체만 잡힌다 → 그 변만 조금 넓힌다."""
    H, W = img.shape[:2]; x, y, w, h = b; g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY); S = W / 1654.0; pad = int(pad * S); e1, e2 = int(2 * S), int(12 * S)
    def hard(strip_in, strip_out): return np.median(strip_in) < 244 and np.median(strip_out) >= 250
    x0, x1, y0, y1 = x, x + w, y, y + h
    L = hard(g[y0 + h // 4:y1 - h // 4, x0 + e1:x0 + e2], g[y0 + h // 4:y1 - h // 4, max(x0 - e2, 0):max(x0 - e1, 1)]) if x0 > e2 else True
    Rr = hard(g[y0 + h // 4:y1 - h // 4, x1 - e2:x1 - e1], g[y0 + h // 4:y1 - h // 4, min(x1 + e1, W - 1):min(x1 + e2, W)]) if x1 < W - e2 else True
    T = hard(g[y0 + e1:y0 + e2, x0 + w // 4:x1 - w // 4], g[max(y0 - e2, 0):max(y0 - e1, 1), x0 + w // 4:x1 - w // 4]) if y0 > e2 else True
    B = hard(g[y1 - e2:y1 - e1, x0 + w // 4:x1 - w // 4], g[min(y1 + e1, H - 1):min(y1 + e2, H), x0 + w // 4:x1 - w // 4]) if y1 < H - e2 else True
    if not L: x0 = max(0, x0 - pad)
    if not Rr: x1 = min(W, x1 + pad)
    if not T: y0 = max(int(H * 0.03), y0 - pad)
    if not B: y1 = min(int(H * 0.88), y1 + pad)
    return x0, y0, x1, y1

def pad_smooth(img, top, bottom, left, right):
    """늘린 부분은 가장자리 색을 늘린 뒤 크게 흐려 줄무늬 없이 바탕처럼 보이게 한다."""
    H, W = img.shape[:2]
    big = cv2.copyMakeBorder(img, top, bottom, left, right, cv2.BORDER_REPLICATE)
    blur = cv2.GaussianBlur(big, (0, 0), 45 * (img.shape[1] / 1654.0 if False else max(1.0, H / 1100.0)))
    out = blur.copy(); out[top:top + H, left:left + W] = img
    # 사진과 늘린 바탕의 경계가 튀지 않도록 안쪽 6px 를 섞는다
    return out

def to_ratio(img):
    """3% 안쪽으로 깎고(인쇄 가장자리 제거), 가로로 긴 사진은 4:3, 세로로 긴 사진은 3:4 로 바탕을 늘려 맞춘다."""
    H, W = img.shape[:2]; dx, dy = int(W * .03), int(H * .03)
    img = img[dy:H - dy, dx:W - dx]; H, W = img.shape[:2]
    r = 4 / 3 if W >= H else 3 / 4
    if W / H < r:
        nw = int(round(H * r)); a = (nw - W) // 2; img = pad_smooth(img, 0, 0, a, nw - W - a)
    elif W / H > r:
        nh = int(round(W / r)); a = (nh - H) // 2; img = pad_smooth(img, a, nh - H - a, 0, 0)
    return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

def trim_gutter(img, side):
    """펼침면 가운데(접힌 곳)의 흰 띠를 잘라 낸다. side='right' 는 왼쪽 쪽의 오른쪽 끝, 'left' 는 오른쪽 쪽의 왼쪽 끝."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY); H, W = g.shape
    col = np.median(g[H // 4:H * 3 // 4], axis=0)
    n = 0
    rng = range(W - 1, -1, -1) if side == 'right' else range(W)
    for x in rng:
        if col[x] >= 247: n += 1
        else: break
    n += int(3 * W / 800)
    return img[:, :W - n] if side == 'right' else img[:, n:]

def crops(no):
    p = PLATE[no]
    if p == 'two22':
        img = page(22); bs = sorted(find_boxes(img)[:2], key=lambda b: b[1])
        return [to_ratio(img[y0:y1, x0:x1]) for x0, y0, x1, y1 in (soften(img, b, 0) for b in bs)]
    if isinstance(p, tuple):                       # 펼침면: 왼쪽 쪽 + 오른쪽 쪽을 이어 붙인다
        L, Rg = page(p[0]), page(p[1]); bl = find_boxes(L)[0]; br = find_boxes(Rg)[0]
        y0 = min(bl[1], br[1]); y1 = max(bl[1] + bl[3], br[1] + br[3])
        return [to_ratio(np.hstack([trim_gutter(L[y0:y1, bl[0]:], 'right'), trim_gutter(Rg[y0:y1, :br[0] + br[2]], 'left')]))]
    img = page(p); x0, y0, x1, y1 = soften(img, find_boxes(img)[0])
    return [to_ratio(img[y0:y1, x0:x1])]

def portal(n):
    if '탁자' in n: return '사방탁자'
    if n in ('서안', '경상'): return '서안'
    return ''

im = Image.open(COVER).convert('RGB'); im.thumbnail((600, 800)); im.save('covers/hoam.jpg', quality=85)
items, ds, photos = [], [], []
for n, (no, name, hanja, en, era, size, kind, owner, memo) in enumerate(R, 1):
    id_ = 'H%02d' % no; pics = []
    for k, c in enumerate(crops(no)):
        c.thumbnail((3200, 3200)); w, h = c.size; fn = id_ + ('' if k == 0 else chr(97 + k)) + '.jpg'
        c.save(os.path.join(PHOTOS, fn), quality=90, optimize=True)
        pics.append({'src': HOST + fn + '?v=' + VER, 'w': w, 'h': h})
        if k == 0:
            t = c.copy(); t.thumbnail((420, 420)); t.save('thumbs/hoam/%d.jpg' % n, quality=80, optimize=True)
    items.append({'id': id_, 'kind': kind, 'name': name, 'hanja': hanja, 'cat': en, 'era': era, 'size': size, 'owner': owner, 'memo': memo, 'no': no, 'pics': pics})
    ds.append({'portal': portal(name), 'id': id_, 'name': name, 'hanja': hanja, 'kind': kind, 'type': '', 'size_raw': size, 'era': era,
               'owner': owner + ' · 조선목가구대전(호암미술관 2002)', 'page': ''})
    photos.append({'id': id_, 'img': 'thumbs/hoam/%d.jpg?v=%s' % (n, VER)})

J = lambda o: json.dumps(o, ensure_ascii=False)
s = open('dugaheon.html', encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) >= 1, a[:70]
    s = s.replace(a, b)
rep('<title>화가가 애호하는 조선시대 목가구(두가헌) — 조선의 목가구</title>', '<title>조선목가구대전 — 나뭇결에 스민 지혜(호암미술관) — 조선의 목가구</title>')
rep('<h1>화가가 애호하는 조선시대 목가구 — 두가헌 갤러리</h1>', '<h1>조선목가구대전 — 나뭇결에 스민 지혜 — 호암미술관(2002)</h1>')
rep('예: 반닫이, 서안, 사방탁자, 필통', '예: 서안, 경상, 연상, 문갑, 사방탁자')
s = re.sub(r'<script type="application/json" id="ds-items">.*?</script>', lambda m: '<script type="application/json" id="ds-items">' + J(ds) + '</script>', s, flags=re.S)
s = re.sub(r'<script type="application/json" id="ds-photos">.*?</script>', lambda m: '<script type="application/json" id="ds-photos">' + J(photos) + '</script>', s, flags=re.S)
s = re.sub(r'^const ITEMS = .*$', lambda m: 'const ITEMS = ' + J(items) + ';', s, count=1, flags=re.M)
s = re.sub(r'^const GRPS = .*$', lambda m: 'const GRPS = ' + J(GRPS) + ';', s, count=1, flags=re.M)
a = s.index("document.getElementById('lead').innerHTML = ["); b = s.index("].map((s) => `<li>${s}</li>`)", a)
s = s[:a] + ("document.getElementById('lead').innerHTML = [\n"
  "  `호암미술관 『조선목가구대전 — 나뭇결에 스민 지혜』(2002.5.31~9.1) 도록의 <b>사랑방 가구</b> ${ITEMS.length}점, 사진 ${nPics}장 — 도록을 이어서 스캔하는 대로 보탭니다.`,\n"
  "  `서안·경상·연상·문갑·탁자를 골라 보거나 이름으로 찾을 수 있습니다. 크기는 가로×옆너비×높이(cm)로 적었습니다(도록은 高·幅 순서).`,\n"
  "  `스캔한 쪽이 뒤집혀 있어 바로 돌렸고, 사진은 인쇄된 사진 부분만 잘랐습니다. 펼침면에 걸친 사진은 이어 붙였습니다.`,\n") + s[b:]
tiles = ("const TILES = [['', '기물 전체', ITEMS.length, '전체 보기'], ['서안·경상', '서안·경상', cnt('서안·경상'), '서안과 경상'], ['연상', '연상', cnt('연상'), '연상·죽장연상'], "
         "['문갑', '문갑', cnt('문갑'), '문갑'], ['탁자·책장', '탁자·책장', cnt('탁자·책장'), '삼층·사층 탁자']];")
s = re.sub(r"^const TILES = .*$", lambda m: tiles, s, count=1, flags=re.M)
rep('data-cid="dugaheon/${i.id}"', 'data-cid="hoam/${i.id}"')
rep("dlg.dataset.cid = 'dugaheon/' + i.id", "dlg.dataset.cid = 'hoam/' + i.id")
rep(r"/^#(D\d+)$/", r"/^#(H\d+)$/")
rep("${i.era ? `<dt>시대</dt><dd>조선 ${esc(i.era)}</dd>` : ''}", "${i.era ? `<dt>시대</dt><dd>조선 ${esc(i.era)}</dd>` : ''}${i.owner ? `<dt>소장처</dt><dd>${esc(i.owner)}</dd>` : ''}")
rep("— (도록 캡션이 잘려 읽지 못함)", "—")
a = s.index('<dt>출처</dt><dd>'); b = s.index('</dd>', a)
s = s[:a] + '<dt>출처</dt><dd>' + BOOK + s[b:]
s = s.replace('?v=20261110', '?v=' + VER)
open('hoam.html', 'w', encoding='utf-8').write(s)
print(len(items), '점', {g: sum(1 for i in items if i['kind'] == g) for g in GRPS}, '사진', sum(len(i['pics']) for i in items))

"""첫 화면 물건 검색용 색인과 사진 파일을 만든다.

저장소 맨 위의 <도록>.html (ds-items·ds-photos)과 <도록>_photos_hi_N.js 를 읽어
  search.js          검색 색인 (window.SEARCH = [...])
  thumbs/<도록>/N.jpg 작은 사진
(큰 사진은 photos/<도록>/<id>.jpg — sa/hq.py 로 만든다)
을 만든다. 도록 목록·이름은 index.html 의 DASHBOARDS 에서 읽는다.
새 도록을 추가한 뒤:  python3 tools/build_search.py
"""
import base64, glob, json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

idx = open('index.html', encoding='utf-8').read()
boards = []
for m in re.finditer(r"\{ path: '(\w+)',\s*title: '([^']*)',\s*desc: '([^']*)'", idx):
    boards.append({'slug': m.group(1), 'title': m.group(2), 'desc': m.group(3)})

PROV = r'(경기|강원|충청|전라|경상|황해|평안|함경|제주)(남|북)?도'
def variants(s):
    s = re.sub(r'\s+', '', s or '')
    a = re.sub(PROV, r'\1\2', s)          # 강원도반닫이 → 강원반닫이, 경상남도 → 경상남
    b = re.sub(PROV, r'\1', s)            # 경상남도 → 경상
    return {s, a, b}

def num(v):
    if v in (None, ''): return None
    f = float(v); return int(f) if f == int(f) else f

def size(r):
    if r.get('size_raw'): return r['size_raw'] + ' cm'   # 도록에 적힌 순서 그대로
    if r.get('diameter_cm') and not r.get('width_cm') and not r.get('length_cm'):
        h = num(r.get('height_cm'))
        return f"지름 {num(r['diameter_cm'])}" + (f" · 높이 {h}" if h else '') + ' cm'
    w = num(r.get('length_cm') if r.get('length_cm') is not None else r.get('width_cm'))
    d = num(r.get('width_cm') if r.get('length_cm') is not None else r.get('depth_cm'))
    h = num(r.get('height_cm'))
    parts = [str(x) for x in (w, d, h) if x is not None]
    return ('×'.join(parts) + ' cm') if parts else ''

def blob(ds_html, key):
    m = re.search(r'<script type="application/json" id="ds-%s">(.*?)</script>' % key, ds_html, re.S)
    return json.loads(m.group(1).replace('<\\/', '</')) if m else []

def save_img(data_url, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'wb').write(base64.b64decode(data_url.split(',', 1)[1]))

shutil.rmtree('thumbs', ignore_errors=True)
shutil.rmtree('hi', ignore_errors=True)   # 예전 큰 사진 폴더 (이제 photos/ 를 씀)
safe = lambda i: re.sub(r'[^0-9A-Za-z가-힣_-]', '_', i)

rows = []
for b in boards:
    slug = b['slug']
    html = open(f'{slug}.html', encoding='utf-8').read()
    items = blob(html, 'items')
    thumbs = {p['id']: p['img'] for p in blob(html, 'photos')}
    his = {}
    for f in glob.glob(f'{slug}_photos_hi_*.js'):
        t = open(f, encoding='utf-8').read()
        arr = json.loads(t[t.index(',') + 1:t.rindex(')')])
        his.update({p['id']: p['img'] for p in arr})
    short = b['title'].replace(' 기증 목칠공예', ' 기증').replace('목가구, ', '').replace(' 화백 구장 조선목기', ' 구장').replace('Ⅰ 목가구', '')
    # 도록 이름으로도 찾되, 이름 속 기물 낱말(예: '양산 반닫이'의 반닫이)은 빼서 다른 기물이 섞이지 않게
    cat_key = re.sub(r'반닫이|목가구|목칠공예|목기|[,·—]', ' ', b['title']).strip()
    for n, r in enumerate(items, 1):
        if r['id'] in thumbs: save_img(thumbs[r['id']], f'thumbs/{slug}/{n}.jpg')
        kind = r.get('category') or r.get('kind') or r.get('family') or ''
        sub = r.get('type') or r.get('sub') or ''
        owner = r.get('owner') or r.get('holder') or ''
        hay = set()
        # 넓은 분류(예: '반닫이·궤·뒤주')는 검색어에 넣지 않는다 — 반닫이로 찾을 때 뒤주가 섞이지 않게
        narrow = [x for x in (kind, sub) if x and '·' not in x]
        portal = r.get('portal') or ''
        if re.search(r'가께수리|각게수리|갑게수리|각계수리|필통', r.get('name') or ''): portal = '함'   # 가께수리·필통 종류는 모두 함
        if portal and '·' not in portal: hay |= variants(portal)
        # 호림·이화여대 도록은 도록 설명(소반·탁자·장·함·서안…)을 검색어로 쓰면 모든 기물이 섞이므로 뺀다
        for s in (r.get('name'), r.get('list_name'), r.get('hanja'), r.get('region'), *narrow,
                  r.get('wood'), owner, cat_key, '' if slug in ('horim', 'ewha') else b['desc']):
            if s: hay |= variants(str(s))
        hay |= variants((r.get('region') or '') + (r.get('name') or ''))
        rows.append({
            'b': slug, 'n': n, 'name': r.get('name') or '', 'hanja': r.get('hanja') or '',
            'cat': short, 'kind': ' · '.join(dict.fromkeys(x for x in (kind, sub) if x and x != r.get('name'))),
            'era': r.get('era') or '', 'size': size(r), 'wood': r.get('wood') or '',
            'owner': owner, 'page': r.get('page') or '',
            't': r['id'] in thumbs, 'pid': safe(r['id']), 'h': os.path.exists(f"photos/{slug}/{safe(r['id'])}.jpg"),
            'fam': portal if '·' in portal else '',
            'q': ' '.join(sorted(hay)).lower(),
        })

with open('search.js', 'w', encoding='utf-8') as f:
    f.write('window.SEARCH=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';')
print(len(boards), 'boards,', len(rows), 'items,', sum(r['t'] for r in rows), 'thumbs,', sum(r['h'] for r in rows), 'photos')

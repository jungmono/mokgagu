"""서울옥션(seoulauction)·해외경매(overseas) 도록을 search.js 에 보탠다.

이 두 도록은 데이터가 ITEMS 상수로 들어 있어 build_search.py 가 읽지 못한다.
쓰는 법:  python3 tools/add_search_extra.py
  - search.js 에서 두 도록의 옛 줄을 지우고 다시 넣으므로 여러 번 돌려도 같다.
  - 작은 사진은 thumbs/<도록>/<번호>.jpg 규칙(다른 도록과 같은 규칙)으로 복사해 둔다.
    (서울옥션 원본은 thumbs/seoul/<아이디>.jpg, 해외경매는 thumbs/overseas/<아이디>.jpg)
  - search.js 는 줄인 모양(tools/search_pack.js)이라 node 로 펼쳐 읽고, 다 쓴 뒤 다시 줄인다.
"""
import json, os, re, shutil, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# (도록 쪽 이름, 원본 사진 폴더, 짧은 이름)
BOOKS = [('seoulauction', 'seoul', '서울옥션 경매 목가구·목기'), ('overseas', 'overseas', '해외경매 한국 목가구·칠기')]
safe = lambda i: re.sub(r'[^0-9A-Za-z가-힣_-]', '_', i)


def items_of(slug):
    s = open(f'{slug}.html', encoding='utf-8').read()
    i = s.index('const ITEMS = ') + len('const ITEMS = ')
    arr, _ = json.JSONDecoder().raw_decode(s[i:])
    return arr


def won(n):
    return f'{int(n):,}원' if n else ''


# 줄인 색인도 줄이지 않은 색인도 읽을 수 있게 node 로 펼쳐 읽는다
rows = json.loads(subprocess.run(['node', '-e', "global.window={};new Function('window',require('fs').readFileSync('search.js','utf8'))(window);process.stdout.write(JSON.stringify(window.SEARCH))"], capture_output=True, text=True, check=True).stdout)
rows = [r for r in rows if r['b'] not in {b[0] for b in BOOKS}]

for slug, tdir, cat in BOOKS:
    for n, r in enumerate(items_of(slug), 1):
        src = f"thumbs/{tdir}/{safe(r['id'])}.jpg"
        has = os.path.exists(src)
        if has:
            dst = f'thumbs/{slug}/{n}.jpg'
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            if os.path.abspath(src) != os.path.abspath(dst):
                shutil.copyfile(src, dst)
        if slug == 'seoulauction':
            info = ' · '.join(x for x in (r.get('sale'), r.get('date'), 'Lot ' + str(r.get('lot')), r.get('status'), ('낙찰 ' + won(r.get('hammer'))) if r.get('hammer') else '') if x)
            kind, era, wood = r.get('kind') or '', '', ''
            size = r.get('size') or ''
        else:
            info = ' · '.join(x for x in (r.get('house'), r.get('at'), r.get('date'), 'Lot ' + str(r.get('lot')), r.get('status')) if x)
            kind, era, wood = r.get('kind') or '', r.get('era') or '', ''
            size = r.get('size') or ''
        hay = {re.sub(r'\s+', '', x) for x in (r.get('name'), r.get('hanja'), r.get('en'), kind, cat, r.get('house'), r.get('sale'), r.get('at'), r.get('city')) if x}
        hay |= {'서울옥션'} if slug == 'seoulauction' else {'해외경매', '해외'}
        rows.append({'b': slug, 'n': n, 'name': r.get('name') or '', 'hanja': r.get('hanja') or '', 'cat': cat, 'kind': kind,
                     'era': era, 'size': size, 'wood': wood, 'owner': info, 'page': '', 't': has, 'pid': safe(r['id']), 'h': False, 'fam': '',
                     'q': ' '.join(sorted(hay)).lower()})

open('search.js', 'w', encoding='utf-8').write('window.SEARCH=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';')
subprocess.run(['node', 'tools/search_pack.js'], check=True)   # 다시 줄이기
print(len(rows), '건 (', {b[0]: sum(1 for r in rows if r['b'] == b[0]) for b in BOOKS}, ')')

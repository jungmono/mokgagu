"""묵갤러리 『조선의 멋 — 목기·장신구』(mukgallery.html)을 search.js 에 보탠다. 여러 번 돌려도 같다.
쓰는 법:  python3 tools/add_search_mukgallery.py   (thumbs/mukgallery/N.jpg 는 build_mukgallery.py 가 만든다)"""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
SLUG, CAT = 'mukgallery', '묵갤러리 조선의 멋 목기 장신구 김미혜 소장전'
s = open('mukgallery.html', encoding='utf-8').read()
ds = json.loads(re.search(r'id="ds-items">(.*?)</script>', s, re.S).group(1))
i0 = s.index('const ITEMS = ') + len('const ITEMS = ')
items, _ = json.JSONDecoder().raw_decode(s[i0:])
rows = json.loads(subprocess.run(['node', '-e', "global.window={};new Function('window',require('fs').readFileSync('search.js','utf8'))(window);process.stdout.write(JSON.stringify(window.SEARCH))"], capture_output=True, text=True, check=True).stdout)
rows = [r for r in rows if r['b'] != SLUG]
PROV = r'(경기|강원|충청|전라|경상|황해|평안|함경|제주)(남|북)?도'
def variants(x):
    x = re.sub(r'\s+', '', x or ''); return {x, re.sub(PROV, r'\1\2', x), re.sub(PROV, r'\1', x)}
for n, (it, d) in enumerate(zip(items, ds), 1):
    hay = set()
    for x in (it['name'], it.get('cat'), d['portal'] if '·' not in d['portal'] else '', it['kind'] if '·' not in it['kind'] else '', it.get('hanja'), CAT, '묵갤러리', '김미혜', '김미혜소장', '조선의멋', '목기장신구', '갤러리묵', it.get('wood'), it.get('place'), it['kind'].replace('·', ' ')):
        if x: hay |= variants(x)
    nm = it['name'] + (it.get('cat') or '')
    if '돈궤' in nm or '돈괴' in nm: hay |= {'돈궤', '돈괘', '돈괴'}   # 도록은 돈괴, 표준은 돈궤 — 옛 표기도 찾아지게
    if '반닫이' in nm or '반다지' in nm: hay |= {'반닫이', '반다지'}
    if '숭쑹이' in nm: hay |= {'숭숭이', '쑹숭이', '숭쑹이', '평안도반닫이', '박천반닫이'}
    if '갑게수리' in nm: hay |= {'갑게수리', '가께수리', '각게수리', '함'}   # 도록은 갑게수리, 흔한 이름은 가께수리 — 함 종류
    if n and '함' == it['name']: hay.add('함')   # 도록은 반다지, 지금 이름은 반닫이
    rows.append({'b': SLUG, 'n': n, 'name': it['name'], 'hanja': it.get('hanja',''), 'cat': CAT, 'kind': it['kind'], 'era': it.get('era',''),
                 'size': (it['size'] + ' cm') if it['size'] else '', 'wood': it.get('wood', ''), 'owner': '묵갤러리 · 김미혜 소장', 'page': '',
                 't': True, 'pid': it['id'], 'h': True, 'fam': d['portal'] if '·' in d['portal'] else '', 'q': ' '.join(sorted(hay)).lower()})
open('search.js', 'w', encoding='utf-8').write('window.SEARCH=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';')
subprocess.run(['node', 'tools/search_pack.js'], check=True)
print(len(rows), '건, mukgallery', sum(1 for r in rows if r['b'] == SLUG))

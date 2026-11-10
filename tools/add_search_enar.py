"""예나르 『조선의 목공예』(enar.html)을 search.js 에 보탠다. 여러 번 돌려도 같다.
쓰는 법:  python3 tools/add_search_enar.py   (thumbs/enar/N.jpg 는 build_enar.py 가 만든다)"""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
SLUG, CAT = 'enar', '조선의 목공예 예나르'
s = open('enar.html', encoding='utf-8').read()
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
    for x in (it['name'], it.get('cat'), d['portal'] if '·' not in d['portal'] else '', it['kind'] if '·' not in it['kind'] else '', CAT, '예나르', '조선의목공예', '조선의 목공예', '1994'):
        if x: hay |= variants(x)
    nm = it['name'] + (it.get('cat') or '')
    if '돈궤' in nm or '돈괴' in nm: hay |= {'돈궤', '돈괘', '돈괴'}   # 도록은 돈괴, 표준은 돈궤 — 옛 표기도 찾아지게
    if '반닫이' in nm or '반다지' in nm: hay |= {'반닫이', '반다지'}   # 도록은 반다지, 지금 이름은 반닫이
    rows.append({'b': SLUG, 'n': n, 'name': it['name'], 'hanja': '', 'cat': CAT, 'kind': it['kind'], 'era': '',
                 'size': (it['size'] + ' cm') if it['size'] else '', 'wood': '', 'owner': '예나르 · 1994', 'page': '',
                 't': True, 'pid': it['id'], 'h': True, 'fam': d['portal'] if '·' in d['portal'] else '', 'q': ' '.join(sorted(hay)).lower()})
open('search.js', 'w', encoding='utf-8').write('window.SEARCH=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';')
subprocess.run(['node', 'tools/search_pack.js'], check=True)
print(len(rows), '건, enar', sum(1 for r in rows if r['b'] == SLUG))

"""예랑방·고목당 『목공예품 백선전』(yerang.html)을 search.js 에 보탠다. 여러 번 돌려도 같다.
쓰는 법:  python3 tools/add_search_yerang.py   (thumbs/yerang/N.jpg 는 build_yerang.py 가 만든다)"""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
SLUG, CAT = 'yerang', '예랑방·고목당 목공예품 백선전'
s = open('yerang.html', encoding='utf-8').read()
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
    for x in (it['name'], it.get('cat'), d['portal'] if '·' not in d['portal'] else '', it['kind'] if '·' not in it['kind'] else '', CAT, '예랑방', '고목당', '백선전', '목공예품백선전', '1995'):
        if x: hay |= variants(x)
    if '돈괴' in it['name'] + (it.get('cat') or ''): hay.add('돈궤')
    if '반다지' in it['name'] + (it.get('cat') or ''): hay.add('반다지')
    rows.append({'b': SLUG, 'n': n, 'name': it['name'], 'hanja': '', 'cat': CAT, 'kind': it['kind'], 'era': '',
                 'size': (it['size'] + ' cm') if it['size'] else '', 'wood': '', 'owner': '예랑방·고목당 공동기획 · 1995', 'page': '',
                 't': True, 'pid': it['id'], 'h': True, 'fam': d['portal'] if '·' in d['portal'] else '', 'q': ' '.join(sorted(hay)).lower()})
open('search.js', 'w', encoding='utf-8').write('window.SEARCH=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';')
subprocess.run(['node', 'tools/search_pack.js'], check=True)
print(len(rows), '건, yerang', sum(1 for r in rows if r['b'] == SLUG))

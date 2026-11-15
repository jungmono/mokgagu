"""e뮤지엄 서가 5곳(nfm·gjfolk·dgu·yecheon·sokcho)의 사진 있는 기물을 search.js 에 보탠다. 여러 번 돌려도 같다.
쓰는 법:  python3 tools/add_search_emu.py   (emuseum-data.js·emu-photos.js·emu-info.js 를 읽는다)
 · 사진은 mokgagu-photos/photos/emuseum/<pid>.jpg, 작은 사진은 thumbs/emu/<pid>.jpg (index.html 이 b 가 서가 5곳이면 이 길로 읽음)"""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
NODE = """global.window={};for(const f of ['emuseum-data.js','emu-photos.js','emu-info.js'])new Function('window',require('fs').readFileSync(f,'utf8'))(window);
const s={};new Function('window',require('fs').readFileSync('search.js','utf8'))(s.w={});
process.stdout.write(JSON.stringify({E:window.EMU,P:window.EMU_PH,I:window.EMU_INFO,S:s.w.SEARCH}))"""
d = json.loads(subprocess.run(['node', '-e', NODE], capture_output=True, text=True, check=True).stdout)
E_, P, I, rows = d['E'], d['P'], d['I'], d['S']
CATS = {'nfm': '국립민속박물관 e뮤지엄 목가구', 'gjfolk': '광주광역시시립민속박물관 e뮤지엄 목가구', 'dgu': '대구대학교 중앙박물관 e뮤지엄 목가구',
        'yecheon': '예천박물관 e뮤지엄 목가구', 'sokcho': '속초시립박물관 e뮤지엄 목가구'}
rows = [r for r in rows if r['b'] not in CATS]
def variants(x):
    x = re.sub(r'\s+', '', x or ''); return {x} if x else set()
for org in E_['orgs']:
    b = org['k']
    if b not in CATS: continue
    n = 0
    for r in org['rows']:
        name, pre, no, kind = E_['names'][r[0]], E_['prefs'][r[1]], r[2], E_['kinds'][r[3]]
        key = pre + ' ' + str(no)
        if key not in P: continue
        n += 1
        era, mat, size = (I.get(key) or ['', '', ''])[:3]
        era = re.sub(r'^한국\s*-?\s*', '', era or '')
        hay = set()
        nm = re.sub(r'\([^)]*\)', '', name)
        hj = ' '.join(re.findall(r'\(([^)]*)\)', name))
        for x in (name, nm, hj, kind if '·' not in kind else '', CATS[b], org['n'], 'e뮤지엄', key, era): hay |= variants(x)
        if kind == '소반·상': hay.add('소반')
        if kind == '뒤주': hay.add('뒤주')
        if kind == '함·상자': hay.add('함')
        if kind in ('반닫이·궤',) and '반닫이' in name: hay.add('반닫이')
        rows.append({'b': b, 'n': n, 'name': name, 'hanja': '', 'cat': CATS[b], 'kind': kind, 'era': era, 'size': size or '', 'wood': mat or '',
                     'owner': org['n'] + ' · e뮤지엄 ' + pre + ' ' + str(no), 'page': '', 't': True, 'pid': P[key][0], 'h': True, 'fam': '',
                     'q': ' '.join(sorted(h.lower() for h in hay if h))})
open('search.js', 'w', encoding='utf-8').write('window.SEARCH=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';')
subprocess.run(['node', 'tools/search_pack.js'], check=True)
print(len(rows), '건')

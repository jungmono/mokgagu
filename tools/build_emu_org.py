"""e뮤지엄 새 기관 서가 만들기: python3 tools/build_emu_org.py meta.json raw_dir
meta 한 줄 = [k,inst,id,no,nm,era,cls,wood,size,lic,alt,nimg,img0]  (브라우저에서 모은 값)
emuseum-data.js·emu-photos.js·emu-info.js 에 보태고, 큰 사진(mokgagu-photos)과 썸네일(thumbs/emu)을 만든다."""
import json, subprocess, sys, os, re
from PIL import Image, ImageOps
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
meta = json.load(open(sys.argv[1], encoding='utf8')); raw = sys.argv[2]
PHOTOS = '/home/claude/mokgagu-photos/photos/emuseum'
PRE = {'gyeongun': {'경운박물관': '경운박물관'}, 'tongyeong': {'통영시립': '통영시립'}, 'ulsan': {'울산': '울산'}, 'snu': {'민': '서울대민'},
       'cheonan': {'천안': '천안', '기증': '천안기증'}, 'dolmun': {'기증': '돌문화기증'}, 'gwangju': {'광주': '국립광주', '광주기증': '국립광주기증'}}
ORGN = {'gyeongun': '경운박물관', 'tongyeong': '통영시립박물관', 'ulsan': '울산박물관', 'snu': '서울대학교박물관', 'cheonan': '천안박물관',
        'dolmun': '제주돌문화공원', 'gwangju': '국립광주박물관'}
FIX = {'統營二層籠': '통영 이층농', '統營欌': '통영장', '二層籠': '이층농'}
def kind(n):
    if re.search(r'반닫이|궤|살레', n): return 0
    if re.search(r'함|합|상자|연상|연갑|고리짝|필함', n) and not re.search(r'장$|농$', n): return 6
    if re.search(r'서안|문갑|탁자|서탁|찬탁|책상|경상|고비|책장|책꽂이', n): return 3
    if re.search(r'농|籠', n): return 2
    if re.search(r'장|欌', n): return 1
    return 7
J = lambda f, v: json.loads(subprocess.run(['node', '-e', "global.window={};new Function('window',require('fs').readFileSync('%s','utf8'))(window);process.stdout.write(JSON.stringify(window.%s))" % (f, v)], capture_output=True, text=True).stdout)
E_ = J('emuseum-data.js', 'EMU'); P = J('emu-photos.js', 'EMU_PH'); I = J('emu-info.js', 'EMU_INFO')
exist = set(P)
orgs = {}
for k, inst, pid, no, nm, era, cls, wood, size, lic, alt, nimg, img0 in meta:
    pre0, num = no.rsplit(' ', 1); pre = PRE[k].get(pre0, pre0); key = pre + ' ' + num
    if key in exist or key in P: print('중복 키', key, k); continue
    nm = FIX.get(nm, nm)
    if nm not in E_['names']: E_['names'].append(nm)
    if pre not in E_['prefs']: E_['prefs'].append(pre)
    orgs.setdefault(k, []).append([E_['names'].index(nm), E_['prefs'].index(pre), num, kind(nm)])
    P[key] = [pid, int(lic) if lic else 4]; I[key] = [era, wood, size]
    src = os.path.join(raw, pid + '.jpg')
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    for out, L, q in ((os.path.join(PHOTOS, pid + '.jpg'), 2400, 82), ('thumbs/emu/%s.jpg' % pid, 520, 80)):
        t = im.copy(); t.thumbnail((L, L), Image.LANCZOS); t.save(out, 'JPEG', quality=q, optimize=True)
for k, rows in orgs.items():
    E_['orgs'].append({'k': k, 'n': ORGN[k], 'rows': rows}); print(k, len(rows))
src = open('emuseum-data.js', encoding='utf8').read(); i = src.index('window.EMU=')
open('emuseum-data.js', 'w', encoding='utf8').write(src[:i] + 'window.EMU=' + json.dumps(E_, ensure_ascii=False, separators=(',', ':')) + ';')
for f, v, nmv in (('emu-photos.js', P, 'EMU_PH'), ('emu-info.js', I, 'EMU_INFO')):
    s = open(f, encoding='utf8').read(); j = s.index(nmv)
    open(f, 'w', encoding='utf8').write(s[:j] + nmv + '=' + json.dumps(v, ensure_ascii=False, separators=(',', ':')) + ';')

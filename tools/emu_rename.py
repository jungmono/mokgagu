"""기물 이야기에서 읽은 이름으로 e뮤지엄 기물 이름을 바꾼다. 쓰는 법: python3 tools/emu_rename.py PID=새이름 ...  (뒤에 add_search_emu.py 를 돌린다)"""
import json, subprocess, sys, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open('emuseum-data.js', encoding='utf8').read(); i = src.index('window.EMU=')
J = lambda f, v: json.loads(subprocess.run(['node', '-e', "global.window={};new Function('window',require('fs').readFileSync('%s','utf8'))(window);process.stdout.write(JSON.stringify(window.%s))" % (f, v)], capture_output=True, text=True).stdout)
E = J('emuseum-data.js', 'EMU'); P = J('emu-photos.js', 'EMU_PH'); pid2key = {v[0]: k for k, v in P.items()}
for a in sys.argv[1:]:
    pid, new = a.split('=', 1); key = pid2key[pid]; pre, no = key.split(' ', 1)
    for o in E['orgs']:
        for r in o['rows']:
            if E['prefs'][r[1]] == pre and str(r[2]) == no:
                if new not in E['names']: E['names'].append(new)
                r[0] = E['names'].index(new); print(o['k'], key, '→', new)
open('emuseum-data.js', 'w', encoding='utf8').write(src[:i] + 'window.EMU=' + json.dumps(E, ensure_ascii=False, separators=(',', ':')) + ';')

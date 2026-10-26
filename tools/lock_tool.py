#!/usr/bin/env python3
"""공부방·도판 암호 파일 도구. 암호는 환경변수로만 받고 파일·기록에 남기지 않는다.

  rekey             study/*.bin · study/img/*.bin 을 OLD_PW 로 풀어 NEW_PW 로 다시 잠근다(가족 암호를 바꿀 때).
  lock-joseongwe    joseongwe.js + gijun.js → study/joseongwe.bin (PW 로 잠금). 잠근 뒤 평문 두 파일은 저장소에서 지운다.
  unlock-joseongwe  study/joseongwe.bin → 현재 폴더에 joseongwe.js · gijun.js(평문) 만들기. 고친 뒤 lock-joseongwe 로
                    다시 잠그고 평문은 반드시 지운다(.gitignore 에 올려 두었다).

암호틀: PBKDF2-SHA256(study/salt.json 의 salt·iter) → AES-256-GCM, 파일 = iv(12바이트) + 암호문. study.html 과 같다.
사용 예:  OLD_PW=... NEW_PW=... python3 tools/lock_tool.py rekey
          PW=... python3 tools/lock_tool.py lock-joseongwe
"""
import base64, hashlib, json, os, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META = json.load(open(ROOT + '/study/salt.json'))


def key_of(pw):
    return hashlib.pbkdf2_hmac('sha256', pw.encode('utf-8'), base64.b64decode(META['salt']), META['iter'], 32)


def seal(key, data):
    iv = os.urandom(12)
    return iv + AESGCM(key).encrypt(iv, data, None)


def open_(key, raw):
    return AESGCM(key).decrypt(raw[:12], raw[12:], None)


def need(name):
    v = os.environ.get(name, '')
    if not v:
        sys.exit('환경변수 %s 가 필요합니다.' % name)
    return v


def study_bins():
    out = []
    for d in ('study', 'study/img'):
        p = os.path.join(ROOT, d)
        out += [os.path.join(p, f) for f in sorted(os.listdir(p)) if f.endswith('.bin')]
    return out


def rekey():
    ok, nk = key_of(need('OLD_PW')), key_of(need('NEW_PW'))
    plain = {}
    # 먼저 전부 풀어 본다 — 하나라도 안 풀리면 아무것도 쓰지 않는다
    for f in study_bins() + [ROOT + '/study/joseongwe.bin']:
        if os.path.exists(f):
            plain[f] = open_(ok, open(f, 'rb').read())
    for f, data in plain.items():
        open(f, 'wb').write(seal(nk, data))
    print('다시 잠근 파일 %d개' % len(plain))


def lock_joseongwe():
    k = key_of(need('PW'))
    o = {'j': open(ROOT + '/joseongwe.js', encoding='utf-8').read(), 'g': open(ROOT + '/gijun.js', encoding='utf-8').read()}
    open(ROOT + '/study/joseongwe.bin', 'wb').write(seal(k, json.dumps(o, ensure_ascii=False).encode('utf-8')))
    print('study/joseongwe.bin 만듦 (%d바이트 평문)' % (len(o['j']) + len(o['g'])))


def unlock_joseongwe():
    k = key_of(need('PW'))
    o = json.loads(open_(k, open(ROOT + '/study/joseongwe.bin', 'rb').read()))
    open(ROOT + '/joseongwe.js', 'w', encoding='utf-8').write(o['j'])
    open(ROOT + '/gijun.js', 'w', encoding='utf-8').write(o['g'])
    print('joseongwe.js · gijun.js 평문을 풀었습니다. 고친 뒤 lock-joseongwe 하고 지우세요.')


if __name__ == '__main__':
    cmds = {'rekey': rekey, 'lock-joseongwe': lock_joseongwe, 'unlock-joseongwe': unlock_joseongwe}
    if len(sys.argv) != 2 or sys.argv[1] not in cmds:
        sys.exit(__doc__)
    cmds[sys.argv[1]]()

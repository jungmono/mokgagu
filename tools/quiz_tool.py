"""복습 퀴즈(study/quiz.bin)에 새 문제를 보탠다. 문제 내용은 공개 저장소에 평문으로 두지 않고 늘 암호로 잠가 둔다.

  python3 tools/quiz_tool.py <가족암호> list            # 지금 문제 수·수업별 개수
  python3 tools/quiz_tool.py <가족암호> add new.json    # 새 문제 보태기

new.json = {"sessions": {"1024": "10월 24일 수업"}, "qs": [{"d": "1024", "q": "질문", "o": ["정답", "오답1", "오답2", "오답3"], "e": "해설"}]}
 - o 의 첫 번째가 정답(화면에서 섞는다), 4개, 서로 달라야 함
 - d 는 수업 날짜 키(월일 4자리). sessions 에 라벨을 함께 적는다.
 - 수업 노트에서 물음표(?)가 있거나 노트끼리 어긋나는 내용은 문제로 만들지 않는다.
"""
import base64, hashlib, json, os, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pw = sys.argv[1].encode(); cmd = sys.argv[2]
meta = json.load(open(ROOT + '/study/salt.json'))
key = hashlib.pbkdf2_hmac('sha256', pw, base64.b64decode(meta['salt']), meta['iter'], 32)
raw = open(ROOT + '/study/quiz.bin', 'rb').read()
data = json.loads(AESGCM(key).decrypt(raw[:12], raw[12:], None))
if cmd == 'list':
    print(len(data['qs']), '문제')
    for k, v in sorted(data['sessions'].items()):
        print(' ', k, v, sum(1 for q in data['qs'] if q['d'] == k))
elif cmd == 'add':
    new = json.load(open(sys.argv[3], encoding='utf-8'))
    data['sessions'].update(new.get('sessions', {}))
    have = {q['q'] for q in data['qs']}
    n = len(data['qs']); added = 0
    for q in new['qs']:
        assert len(q['o']) == 4 and len(set(q['o'])) == 4, q['q']
        assert q['d'] in data['sessions'], '수업 라벨 없음: ' + q['d']
        if q['q'] in have: continue
        n += 1; added += 1
        data['qs'].append({'id': 'q%02d' % n, 'd': q['d'], 's': data['sessions'][q['d']], 'q': q['q'], 'o': q['o'], 'e': q['e']})
    iv = os.urandom(12)
    open(ROOT + '/study/quiz.bin', 'wb').write(iv + AESGCM(key).encrypt(iv, json.dumps(data, ensure_ascii=False).encode('utf-8'), None))
    print('보탠 문제', added, '→ 전체', len(data['qs']))

"""지식 지도 데이터(study/kg.bin) 만들기.
사용: KG_PW=암호 python3 tools/build_kg.py <옵시디언 보관함 폴더>
보관함의 개념/지역/인물/도서 노트와 [[링크]]를 읽어 study/kg.bin(공부방 암호로 잠금)을 만든다. 암호는 파일에 남기지 않는다."""
import os,sys,re,json,base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
V=sys.argv[1]; HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
nodes={};links=set();sessLinks={}
def fm(t):
    m=re.match(r'^---\n.*?\n---\n',t,re.S);return t[m.end():] if m else t
for r,_,fs in os.walk(V):
    for f in fs:
        if not f.endswith('.md'): continue
        p=os.path.relpath(os.path.join(r,f),V).replace('\\','/')[:-3]
        if p.startswith('00 홈'): continue
        body=fm(open(os.path.join(r,f),encoding='utf-8').read())
        tos=[x.split('|')[0] for x in re.findall(r'\[\[([^\]]+)\]\]',body)]
        if p.startswith('수업/'):
            sessLinks[p[3:]]=[t for t in tos if not t.startswith('수업/') and t!='00 홈']; continue
        typ='c' if p.startswith('개념/') else 'r' if p.startswith('지역/') else 'x'
        body='\n'.join(l for l in body.split('\n') if not l.startswith('관련:') and '[[00 홈]]' not in l)
        nodes[p]={'id':p,'type':typ,'title':p.split('/')[-1],'text':body.strip()}
        for t in tos:
            if t!='00 홈' and not t.startswith('수업/'): links.add(tuple(sorted((p,t))))
links={l for l in links if l[0] in nodes and l[1] in nodes}
tagmap={'감정 4기준':'개념/감정 4기준','감정 기준':'개념/감정 4기준','돌쩌귀':'개념/감정 4기준','글귀 연대':'개념/감정 4기준',
'나주반닫이':'지역/전라도','진주반닫이':'지역/경상도','가구 명칭':'개념/가구의 명칭','한·중·일 용어':'개념/가구의 명칭','고소설 가구 명칭':'개념/가구의 명칭','고소설 명칭':'개념/가구의 명칭','뒤주':'개념/가구의 명칭',
'궤의 발':'개념/궤의 발','제구':'개념/제구(祭具)','금사리·분원':'개념/도자기 금사리·분원','동자':'개념/동자·장석·찬장','장석':'개념/동자·장석·찬장','수리와 원형':'개념/수리와 원형',
'개화기 4단계':'개념/개화기 가구 4단계','개화기 단계':'개념/개화기 가구 4단계','자물쇠':'개념/자물쇠','성수만세':'개념/자물쇠','물고기 자물쇠':'개념/자물쇠',
'구입 도서':'도서','선생님 이력':'인물과 상점','전주·남원·충청':['지역/전라도','지역/충청도']}
for v in tagmap.values():
    for t in (v if isinstance(v,list) else [v]): assert t in nodes,t
out={'nodes':list(nodes.values()),'links':sorted(links),'tagmap':tagmap,'sessLinks':sessLinks}
m=json.load(open(HERE+'/study/salt.json'))
k=PBKDF2HMAC(hashes.SHA256(),32,base64.b64decode(m['salt']),m['iter']).derive(os.environ['KG_PW'].encode())
iv=os.urandom(12)
open(HERE+'/study/kg.bin','wb').write(iv+AESGCM(k).encrypt(iv,json.dumps(out,ensure_ascii=False).encode(),None))
print(len(nodes),'노트',len(links),'링크',list(sessLinks))

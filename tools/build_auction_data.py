"""경매 시세용 자료 만들기 — auction.html·myart.html·seoulauction.html 의 id="ds-items" 자료에서
시세 계산에 필요한 항목만 뽑아 auction-data.json 으로 저장한다(경매 시세 화면이 도록 HTML 950KB 대신 이 파일을 읽음).
새 경매사 도록을 더하면 SOURCES 에 [파일, 이름]을 적고 이 스크립트를 다시 돌린 뒤 auction-stats.html 의 SOURCES 에도 같게 적는다.
실행: python3 tools/build_auction_data.py"""
import json, re, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SOURCES = [('auction.html', 'auction'), ('myart.html', 'myart'), ('seoulauction.html', 'seoulauction')]
out = []
for f, src in SOURCES:
    t = open(f, encoding='utf-8').read()
    m = re.search(r'id="ds-items"[^>]*>([\s\S]*?)</script>', t)
    for it in (json.loads(m.group(1)) if m else []):
        o = it.get('owner') or ''
        mm = re.match(r'^(\S+)\s.*?\((\d{4})\)\s*Lot\s*(\S+)', o)
        pr = re.search(r'낙찰\s*([\d,]+)원', o)
        out.append({'id': it.get('id'), 'name': it.get('name'), 'kind': it.get('kind'),
                    'site': mm.group(1) if mm else '', 'year': int(mm.group(2)) if mm else 0,
                    'lot': mm.group(3) if mm else '', 'price': int(pr.group(1).replace(',', '')) if pr else None,
                    'fail': bool(re.search('유찰', o)), 'src': src, 'type': it.get('type')})
json.dump(out, open('auction-data.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(out), '건', os.path.getsize('auction-data.json') // 1024, 'KB')

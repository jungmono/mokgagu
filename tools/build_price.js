/* 사진 창의 「같은 종류 경매 보통 낙찰가」 자료를 만든다 — node tools/build_price.js
   경매 시세 화면(auction-stats.html)과 같은 자료(아이옥션·마이아트옥션·서울옥션 도록의 ds-items)와 같은 계산
   (낙찰 10건 이상인 종류만, 가운데 절반 = 25%~75%, 중앙값 = 50%)으로 price.js 맨 위 PRICE 줄을 다시 쓴다.
   경매 도록에 기물을 보탠 뒤 한 번 돌리면 된다. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SOURCES = [['auction.html', 'auction'], ['myart.html', 'myart'], ['seoulauction.html', 'seoulauction']];
const sold = [];
for (const [f] of SOURCES) {
  const t = fs.readFileSync(path.join(ROOT, f), 'utf8'), m = t.match(/id="ds-items">([\s\S]*?)<\/script>/);
  JSON.parse(m[1]).forEach((it) => { const pr = String(it.owner || '').match(/낙찰\s*([\d,]+)원/); if (pr) sold.push({ kind: it.kind, price: +pr[1].replace(/,/g, '') }); });
}
const q = (a, p) => { a = a.slice().sort((x, y) => x - y); const i = (a.length - 1) * p, l = Math.floor(i); return a[l] + (a[Math.min(l + 1, a.length - 1)] - a[l]) * (i - l); };
const P = {};
[...new Set(sold.map((x) => x.kind))].forEach((k) => { const a = sold.filter((x) => x.kind === k).map((x) => x.price); if (a.length >= 10) P[k] = { n: a.length, q1: Math.round(q(a, 0.25)), m: Math.round(q(a, 0.5)), q3: Math.round(q(a, 0.75)) }; });
const stamp = new Date().toISOString().slice(0, 10);
const file = path.join(ROOT, 'price.js');
let src = fs.readFileSync(file, 'utf8');
src = src.replace(/^  var PRICE = .*$/m, '  var PRICE = ' + JSON.stringify(P) + ', PRICE_AT = ' + JSON.stringify(stamp) + ';');
fs.writeFileSync(file, src);
console.log('낙찰 ' + sold.length + '건 · ' + Object.keys(P).length + '종류 → price.js', P);

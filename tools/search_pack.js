/* 검색 색인(search.js) 줄이기 — node tools/search_pack.js
   search.js는 3,700여 기물 한 줄씩의 목록(window.SEARCH)이다. 그 가운데
     · cat(도록 이름): 도록마다 같으므로 도록별로 한 번만 적는다.
     · q(검색어 묶음): 대부분 이름·한자·도록 이름·소장처에서 그대로 만들어지므로,
       만들 수 없는 낱말(x)만 적고 브라우저가 불러올 때 다시 만든다.
   불러온 뒤의 window.SEARCH는 줄이기 전과 똑같다(이 도구가 한 줄씩 대조해 다르면 쓰지 않는다).

   ▸ 기물 이름을 고칠 때: search.js에서 그 기물의 "name"만 고치면 검색어는 저절로 따라간다.
   ▸ 기물을 보탤 때(tools/add_search_extra.py 등): 예전 모양(cat·q가 든 줄)으로 넣어도 되고,
     넣은 뒤 이 도구를 한 번 돌리면 다시 줄여 준다. 줄인 파일도, 줄이지 않은 파일도 읽을 수 있다. */
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'search.js');
global.window = {};
new Function('window', fs.readFileSync(FILE, 'utf8'))(global.window);
const R = window.SEARCH;
if (!Array.isArray(R) || !R.length) { console.error('search.js를 읽지 못했습니다'); process.exit(1); }

const nz = (s) => String(s == null ? '' : s).toLowerCase().replace(/\s+/g, '');
/* 다시 만들 수 있는 낱말의 출처 (브라우저 쪽 코드와 같은 이름·같은 규칙) */
const F = {
  name: (r) => [nz(r.name)], hanja: (r) => [nz(r.hanja)], cat: (r) => [nz(r.cat)], owner: (r) => [nz(r.owner)],
  kind: (r) => [nz(r.kind)], kindp: (r) => String(r.kind || '').split(' · ').map(nz), wood: (r) => [nz(r.wood)],
  ownp: (r) => String(r.owner || '').split(' · ').map(nz),
};
const KEYS = ['b', 'n', 'name', 'hanja', 'cat', 'kind', 'era', 'size', 'wood', 'owner', 'page', 't', 'pid', 'h', 'fam', 'q'];
const books = [...new Set(R.map((r) => r.b))];
const C = {}, K = {}, U = {};
for (const b of books) {
  const rs = R.filter((r) => r.b === b);
  const cats = [...new Set(rs.map((r) => r.cat))];
  if (cats.length !== 1) { console.error(b + ' 도록 이름(cat)이 줄마다 다릅니다: ' + cats.join(' / ')); process.exit(1); }
  C[b] = cats[0];
  U[b] = Object.keys(F).filter((f) => { let used = 0; for (const r of rs) { const t = new Set(r.q.split(' ')); for (const v of F[f](r)) { if (!v) continue; used++; if (!t.has(v)) return false; } } return used > 0; });
  let common = null; for (const r of rs) { const t = new Set(r.q.split(' ')); common = common ? new Set([...common].filter((x) => t.has(x))) : t; }
  K[b] = [...common].sort();
}
const rebuild = (r, x) => {
  const s = new Set(K[r.b]); U[r.b].forEach((f) => F[f](r).forEach((v) => { if (v) s.add(v); }));
  (x ? x.split(' ') : []).forEach((v) => { if (v) s.add(v); });
  return [...s].sort().join(' ');
};
const rows = R.map((r) => {
  const d = new Set(K[r.b]); U[r.b].forEach((f) => F[f](r).forEach((v) => { if (v) d.add(v); }));
  const x = r.q.split(' ').filter((v) => !d.has(v)).join(' ');
  const o = {}; KEYS.forEach((k) => { if (k !== 'cat' && k !== 'q') o[k] = r[k]; }); if (x) o.x = x;
  return o;
});
/* 대조: 다시 만든 q·cat이 원래와 같아야 한다 */
/* 검색은 q 안에 낱말이 「들어 있는지」만 보므로 낱말 순서는 결과와 무관하다. 손으로 낱말을 뒤에 덧붙인 줄은
   가나다순으로 다시 늘어서지만 낱말 묶음은 같아야 한다 */
const toks = (q) => [...new Set(q.split(' ').filter(Boolean))].sort().join(' ');
let bad = 0, reorder = 0;
R.forEach((r, i) => {
  const q2 = rebuild(r, rows[i].x || '');
  const extraKeys = Object.keys(r).filter((k) => !KEYS.includes(k));
  if (toks(q2) !== toks(r.q) || extraKeys.length) { if (bad++ < 5) console.error('다름:', r.b, r.pid, '\n 원래 ', r.q, '\n 다시 ', q2, extraKeys); }
  else if (q2 !== r.q) reorder++;
  r.q = q2;
});
if (bad) { console.error(bad + '줄이 달라 쓰지 않았습니다'); process.exit(1); }
if (reorder) console.log('낱말 순서만 가나다순으로 바로잡은 줄: ' + reorder);

const RT = `(function(R,C,K,U){var nz=function(s){return String(s==null?'':s).toLowerCase().replace(/\\s+/g,'')},sp=function(s,p){return String(s||'').split(p).map(nz)},`
  + `F={name:function(r){return[nz(r.name)]},hanja:function(r){return[nz(r.hanja)]},cat:function(r){return[nz(r.cat)]},owner:function(r){return[nz(r.owner)]},kind:function(r){return[nz(r.kind)]},kindp:function(r){return sp(r.kind,' · ')},wood:function(r){return[nz(r.wood)]},ownp:function(r){return sp(r.owner,' · ')}};`
  + `return R.map(function(r){var o={b:r.b,n:r.n,name:r.name,hanja:r.hanja,cat:C[r.b],kind:r.kind,era:r.era,size:r.size,wood:r.wood,owner:r.owner,page:r.page,t:r.t,pid:r.pid,h:r.h,fam:r.fam},s=new Set(K[r.b]);`
  + `U[r.b].forEach(function(f){F[f](o).forEach(function(v){if(v)s.add(v)})});(r.x?r.x.split(' '):[]).forEach(function(v){if(v)s.add(v)});o.q=Array.from(s).sort().join(' ');return o})})`;
const J = (v) => JSON.stringify(v);
const out = '/* 줄인 검색 색인 — 만드는 법·고치는 법은 tools/search_pack.js 맨 위 설명 */\nwindow.SEARCH=' + RT + '(\n' + J(rows) + ',\n' + J(C) + ',\n' + J(K) + ',\n' + J(Object.fromEntries(books.map((b) => [b, U[b]]))) + ');\n';

/* 쓴 파일을 다시 읽어 한 번 더 대조 */
const w2 = {}; new Function('window', out)(w2);
if (JSON.stringify(w2.SEARCH) !== JSON.stringify(R.map((r) => Object.fromEntries(KEYS.map((k) => [k, r[k]]))))) { console.error('다시 읽은 색인이 원래와 다릅니다 — 쓰지 않았습니다'); process.exit(1); }
const before = fs.statSync(FILE).size;
fs.writeFileSync(FILE, out);
console.log('기물 ' + R.length + '줄 · 도록 ' + books.length + '개 · ' + (before / 1024).toFixed(0) + 'KB → ' + (Buffer.byteLength(out) / 1024).toFixed(0) + 'KB');

/* 비례 자·지역 퀴즈가 쓰는 반닫이 작은 색인도 함께 다시 만든다 */
{ const r = require('./build_bandaji_idx.js')(); console.log('반닫이 작은 색인 ' + r.n + '줄 · ' + r.kb.toFixed(0) + 'KB → bandaji-idx.js'); }

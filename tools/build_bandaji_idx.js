/* 반닫이만 담은 작은 색인(bandaji-idx.js) 만들기 — node tools/build_bandaji_idx.js
   비례 자(region-ruler.html)·지역 퀴즈(region-quiz.html)는 이름이나 한자에 「반닫이」가 든 기물만 쓴다.
   그래서 1MB 넘는 search.js 대신 이 작은 파일을 받는다. 내용은 search.js에서 그대로 뽑은 것(검색어 q만 뺌).
   ▸ search.js를 고친 뒤에는 tools/search_pack.js를 돌리면 이 파일도 함께 다시 만들어진다.
   ▸ window.SEARCH가 아니라 window.BANDAJI_IDX에 담는다 — 좋아요 모아보기 등은 전체 색인이 따로 필요하기 때문. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
function build() {
  const w = {};
  new Function('window', fs.readFileSync(path.join(ROOT, 'search.js'), 'utf8'))(w);
  const KEYS = ['b', 'n', 'name', 'hanja', 'cat', 'kind', 'era', 'size', 'wood', 'owner', 'page', 't', 'pid', 'h', 'fam'];
  const rows = (w.SEARCH || []).filter((r) => /반닫이/.test((r.name || '') + (r.hanja || '')))
    .map((r) => Object.fromEntries(KEYS.map((k) => [k, r[k]])));
  if (!rows.length) throw new Error('search.js에서 반닫이를 찾지 못했습니다');
  /* 같은 물건이 두 도록에 실린 것(이건희 기증 목록집 ↔ 국립중앙박물관 소장품, mklink.js 의 번호 짝): 이건희 쪽 줄에 짝 번호(nmk)를 적어 둔다.
     비례 자는 짝인 국립중앙박물관 기물이 함께 세어질 때만 이건희 쪽을 뺀다 — 한 기물이 두 번 세지지 않게(논문과 같은 기준) */
  const N2L = JSON.parse(fs.readFileSync(path.join(ROOT, 'mklink.js'), 'utf8').match(/var N2L = (\{[^;]*\});/)[1]), L2N = {};
  for (const k in N2L) L2N[N2L[k]] = k;
  const nmk = new Set(rows.filter((r) => r.b === 'nmk').map((r) => String(r.pid)));
  rows.forEach((r) => { if (r.b === 'lee' && L2N[r.pid] && nmk.has(L2N[r.pid])) r.nmk = L2N[r.pid]; });
  /* 도록 이름(cat)은 도록마다 같으므로 한 번만 적고 불러올 때 채운다 */
  const C = {};
  rows.forEach((r) => { C[r.b] = r.cat; delete r.cat; });
  const out = '/* 반닫이 작은 색인 — tools/build_bandaji_idx.js 가 search.js에서 만든다. 손으로 고치지 말 것 */\n'
    + 'window.BANDAJI_IDX=(function(R,C){return R.map(function(r){r.cat=C[r.b];return r})})(\n'
    + JSON.stringify(rows) + ',\n' + JSON.stringify(C) + ');\n';
  fs.writeFileSync(path.join(ROOT, 'bandaji-idx.js'), out);
  return { n: rows.length, kb: Buffer.byteLength(out) / 1024 };
}
module.exports = build;
if (require.main === module) { const r = build(); console.log('반닫이 ' + r.n + '줄 → bandaji-idx.js ' + r.kb.toFixed(0) + 'KB'); }

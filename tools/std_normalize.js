/* 기물 자료 표준화 — 연대 표기와 치수 순서를 한 번에 맞춘다 (2026-11-10)
   node tools/std_normalize.js            미리보기(파일을 고치지 않음)
   node tools/std_normalize.js --write    실제로 고침 (한 번만 — 끝나면 tools/std_applied.json 을 남기고 다시는 안 돌아간다)

   ▸ 연대: 「조선시대」「조선 시대」「조선(세기 미상)」「조선 (세기 미상)」 → 「조선」
   ▸ 치수: 가로 × 세로(깊이) × 높이 순서. 순서가 확실한 것만 바꾼다.
       · 아이옥션(auction): 도록 원문이 높이×깊이×가로 → 가로×깊이×높이 (38회 경매 반닫이 106점의 값으로 확인).
         단, 바꾼 뒤 가로가 깊이보다 작아지는 것(소반·필통 등 모양 때문에 순서를 믿기 어려운 것)은 바꾸지 않고
         「순서 미확인 · 」을 앞에 붙여 원문 그대로 둔다(비교하기·비례 자는 이런 줄을 읽지 않는다).
       · 양산 반닫이(yangsan): 원문이 세로×가로×높이 → 앞 두 수 가운데 큰 쪽이 가로, 작은 쪽이 세로(사진으로 확인).
       · 이름표가 붙은 것(nmk·busan·munui): 이름표 뜻이 분명한 세 가지 짝만 가로→세로→높이 차례로 다시 늘어놓는다
           {가로·세로·높이} {가로·옆너비·높이} {너비·옆너비·높이}
         국립중앙박물관의 「길이·너비」는 기물마다 앞면이 다르게 적혀 있어(영광 반닫이는 길이가 앞면, 책장은 너비가 앞면) 그대로 둔다.
       · 그 밖의 도록은 이미 가로×깊이×높이 순서(반닫이 평균으로 확인)라 건드리지 않는다.
   ▸ 새 도록·새 경매 결과를 넣을 때는 이 파일의 stdSize(book, 글자)를 한 번 거쳐서 넣는다(경매는 원문이 높이×깊이×가로).
   ▸ 고치는 곳: 각 도록 화면 안의 자료(size·size_raw·era), search.js(→ search_pack.js가 bandaji-idx.js도 다시 만든다). */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const MARK = path.join(__dirname, 'std_applied.json');
const WRITE = process.argv.includes('--write');

const ERA = new Set(['조선시대', '조선 시대', '조선(세기 미상)', '조선 (세기 미상)', '조선(세기미상)']);
const stdEra = (e) => (ERA.has(e) ? '조선' : e);

const NUM = '[0-9]+(?:\\.[0-9]+)?';
const LBL = '(?:옆너비|가로|세로|너비|길이|높이)';
const TOK = LBL + '\\s*' + NUM;
const LABELED = new RegExp('^\\s*' + TOK + '(?:\\s*,\\s*|\\s+)' + TOK + '(?:\\s*,\\s*|\\s+)' + TOK + '\\s*(cm)?\\s*$');
const SETS = [['가로', '세로', '높이'], ['가로', '옆너비', '높이'], ['너비', '옆너비', '높이']];   /* 앞면 → 옆면 → 높이 */

function stdSize(book, s) {
  if (typeof s !== 'string' || !s) return s;
  if (book === 'auction') {
    if (/^순서 미확인/.test(s)) return s;
    const m = s.match(/^(\s*)(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return s;
    const rest = m[5];
    if (/[×,①②③④\-]|\d/.test(rest.replace(/\(\d+EA\)/g, ''))) return s;       /* 여러 점을 묶은 글자는 건드리지 않는다 */
    const H = +m[2], D = +m[3], W = +m[4];
    if (W < D) return '순서 미확인 · ' + s.trim();
    return m[1] + m[4] + '×' + m[3] + '×' + m[2] + rest;
  }
  if (book === 'yangsan') {
    const m = s.match(/^(\s*)(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)(\s*cm)?\s*$/);
    if (!m) return s;
    const a = m[2], b = m[3];
    const big = +a >= +b ? a : b, small = +a >= +b ? b : a;
    return big + '×' + small + '×' + m[4] + (m[5] || '');
  }
  if (book === 'nmk' || book === 'busan' || book === 'munui') {
    if (!LABELED.test(s)) return s;
    const toks = [...s.matchAll(new RegExp('(' + LBL + ')\\s*(' + NUM + ')', 'g'))].map((x) => [x[1], x[2]]);
    const names = toks.map((t) => t[0]);
    if (new Set(names).size !== 3) return s;
    const set = SETS.find((st) => st.every((n) => names.includes(n)));
    if (!set) return s;
    const sep = s.includes(',') ? ', ' : ' ';
    const out = set.map((n) => n + ' ' + toks.find((t) => t[0] === n)[1]).join(sep);
    return out + (/cm\s*$/.test(s) ? (/\scm\s*$/.test(s) ? ' cm' : 'cm') : '');
  }
  return s;
}
module.exports = { stdSize, stdEra };
if (require.main !== module) return;

if (fs.existsSync(MARK) && WRITE) { console.error('이미 적용했습니다(tools/std_applied.json). 두 번 돌리면 순서가 다시 뒤집힙니다.'); process.exit(1); }

const stat = { era: 0, size: {}, files: 0 };
const samples = {};
const note = (book, a, b) => { stat.size[book] = (stat.size[book] || 0) + 1; (samples[book] = samples[book] || []).length < 4 && samples[book].push(a + '  →  ' + b); };

/* 1) 도록 화면 안의 자료 */
for (const f of fs.readdirSync(ROOT).filter((x) => x.endsWith('.html'))) {
  const book = f.replace(/\.html$/, '');
  let s = fs.readFileSync(path.join(ROOT, f), 'utf8'), o = s;
  s = s.replace(/"(size|size_raw)"(\s*:\s*)"((?:[^"\\]|\\.)*)"/g, (all, k, sp, v) => {
    let val; try { val = JSON.parse('"' + v + '"'); } catch (e) { return all; }
    const nv = stdSize(book, val);
    if (nv === val) return all;
    note(book, val, nv);
    return '"' + k + '"' + sp + JSON.stringify(nv);
  });
  s = s.replace(/("era"\s*:\s*")([^"]*)(")/g, (all, a, v, c) => { const nv = stdEra(v); if (nv === v) return all; stat.era++; return a + nv + c; });
  if (s !== o) { stat.files++; if (WRITE) fs.writeFileSync(path.join(ROOT, f), s); }
}

/* 2) 검색 색인(search.js) — 풀어서 고친 뒤 search_pack.js 로 다시 줄인다 */
{
  const w = {}; new Function('window', fs.readFileSync(path.join(ROOT, 'search.js'), 'utf8'))(w);
  const R = w.SEARCH; let n = 0, ne = 0;
  R.forEach((r) => {
    const raw = String(r.size || '');
    const base = raw.replace(/\s*cm\s*$/, ''), had = raw.slice(base.length);
    let nb = stdSize(r.b, base);
    /* 아이옥션 화면 쪽 글자는 「…cm」로 붙어 있고 색인은 「… cm」다 — 어느 쪽이든 같은 규칙 */
    if (nb !== base) { r.size = nb + had; n++; }
    const ne2 = stdEra(r.era); if (ne2 !== r.era) { r.era = ne2; ne++; }
  });
  console.log('search.js: 치수 ' + n + '줄 · 연대 ' + ne + '줄');
  if (WRITE) {
    fs.writeFileSync(path.join(ROOT, 'search.js'), 'window.SEARCH=' + JSON.stringify(R) + ';\n');
    cp.execFileSync('node', [path.join(__dirname, 'search_pack.js')], { stdio: 'inherit' });
  }
}

console.log('화면 파일 ' + stat.files + '개 · 연대 ' + stat.era + '곳 · 치수 ' + JSON.stringify(stat.size));
for (const b in samples) console.log(' ' + b + '\n   ' + samples[b].join('\n   '));
if (WRITE) fs.writeFileSync(MARK, JSON.stringify({ at: new Date().toISOString().slice(0, 10), size: stat.size, era: stat.era }, null, 1) + '\n');
else console.log('\n(미리보기 — 고치려면 --write)');

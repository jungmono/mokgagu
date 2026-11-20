/* 표준 칸 만들기 — node tools/build_std_fields.js  →  std.json, tools/std_unclassified.csv
   search.js 의 원문(name·kind·era·size)은 건드리지 않고, 기물마다 표준 값을 따로 덧붙인 파일을 만든다.
   std.json: { "도록:번호": [표준기종, 표준시대, 가로, 깊이, 높이] }  (모르면 "" / null)
   ▸ 표준 기종(2026-11-20 정함): 반닫이·서안·소반·사방탁자·뒤주·약장·장·농·함 + 책장(책탁)·연상(연갑)·찬장(찬탁)·문갑·기타목기
       이름(name)에서 먼저 찾고 없으면 기종(kind)에서 찾는다. 두 갈래 이상으로 읽히면(예: 「장·농」) 비워 두고 std_unclassified.csv 에 올린다.
   ▸ 표준 시대(왕조만): 조선·고려·삼국·통일신라·근현대·미상. 원문 era 가 비면 비운다(다른 칸에서 짐작하지 않음).
   ▸ 치수: 가로×깊이×높이(cm). 11-10 표준화(std_normalize.js) 뒤의 순서를 따르고, 이름표가 붙은 것은 이름표대로 읽는다. 「순서 미확인」은 읽지 않는다. */
const fs = require('fs'), path = require('path');
global.window = {};
new Function('window', fs.readFileSync(path.join(__dirname, '..', 'search.js'), 'utf8'))(global.window);
const R = window.SEARCH;

const RULES = [   // [표준 기종, 정규식] — 앞에서부터 처음 맞는 것
  ['약장', /약장/], ['뒤주', /뒤주/], ['반닫이', /반닫이|반다지|돈궤|궤/], ['책장', /책장|책탁|책궤|서가/],
  ['사방탁자', /사방탁자|탁자/], ['연상', /연상|연갑/], ['찬장', /찬탁|찬장/], ['문갑', /문갑/],
  ['서안', /서안|경상(?!도)|서상|책상/], ['소반', /소반|호족반|개다리|교자상|다상|밥상|주안상|[가-힣]반$/],
  ['농', /농$|농\s|판형농/], ['장', /장$|장\s|층장|머릿장|의걸이/], ['함', /함|상자|합$|궤짝|고리짝|반짇고리/],
  ['기타목기', /필통|필가|고비|지통|문방|소품|제구|화로|촛대|등경|목기/],
];
const GENERIC = new Set(['장', '농', '함', '기타목기']);   /* 이름 끝 글자만 맞는 넓은 규칙 — 더 좁은 규칙(책장·약장 등)이 함께 맞으면 좁은 쪽을 따른다 */
const kindOf = (s) => { let hit = RULES.filter(([, re]) => re.test(s)).map(([k]) => k); const sp = hit.filter((x) => !GENERIC.has(x)); if (sp.length) hit = sp; return hit; };
const stdKind = (r) => {
  const n = String(r.name || '').replace(/\([^)]*\)/g, ''), k = String(r.kind || '');
  let h = kindOf(n);
  if (h.length === 1) return [h[0], ''];
  if (h.length > 1) return ['', '이름에서 두 갈래: ' + h.join('/')];
  h = kindOf(k);
  if (h.length === 1) return [h[0], ''];
  if (h.length > 1) return ['', '기종에서 두 갈래: ' + h.join('/')];
  return ['', k ? '맞는 규칙 없음' : '이름·기종 모두 비어 있음/맞는 규칙 없음'];
};
const stdEra = (e) => {
  e = String(e || ''); if (!e) return '';
  if (/^(시대\s*)?미상$|시대미상/.test(e)) return '미상';
  if (/통일신라|신라|백제|고구려|가야|삼국/.test(e)) return '삼국·통일신라';
  if (/고려|려말선초/.test(e)) return '고려';
  if (/일제강점|광복|대한제국|현대|2000년|^20세기|^19세기\s*말.*20세기|근대/.test(e)) return '근현대';
  if (/조선|^1[4-9][~\-–]?\d*세기/.test(e)) return '조선';
  return '';
};
const num = '(\\d+(?:\\.\\d+)?)';
const stdSize = (s) => {
  s = String(s || ''); if (!s || /순서 미확인/.test(s)) return [null, null, null];
  let m = s.match(new RegExp('^\\s*' + num + '\\s*[×xX*]\\s*' + num + '\\s*[×xX*]\\s*' + num));
  if (m) return [+m[1], +m[2], +m[3]];
  const t = {}; for (const x of s.matchAll(new RegExp('(옆너비|가로|세로|너비|길이|높이)\\s*' + num, 'g'))) t[x[1]] = +x[2];
  const w = t['가로'] ?? (t['옆너비'] != null ? t['너비'] : undefined), d = t['세로'] ?? t['옆너비'], h = t['높이'];
  return [w ?? null, d ?? null, h ?? null];
};

const out = {}, un = [['도록', '번호', '이름', '원문 기종', '이유']]; const cnt = { kind: {}, era: {}, dim: 0, dup: 0 };
R.forEach((r) => {
  const key = r.b + ':' + r.n; if (out[key]) cnt.dup++;
  const [k, why] = stdKind(r), e = stdEra(r.era), z = stdSize(r.size);
  out[key] = [k, e, ...z];
  cnt.kind[k || '(비움)'] = (cnt.kind[k || '(비움)'] || 0) + 1; cnt.era[e || '(비움)'] = (cnt.era[e || '(비움)'] || 0) + 1; if (z[0] != null && z[2] != null) cnt.dim++;
  if (!k && r.kind) un.push([r.b, r.n, r.name, r.kind, why]);
});
fs.writeFileSync(path.join(__dirname, '..', 'std.json'), JSON.stringify(out));
fs.writeFileSync(path.join(__dirname, 'std_unclassified.csv'), '﻿' + un.map((a) => a.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n'));
console.log('기물', R.length, '중복키', cnt.dup, '치수(가로·높이 있음)', cnt.dim);
console.log('기종', Object.entries(cnt.kind).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + v).join(' '));
console.log('시대', Object.entries(cnt.era).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + v).join(' '));
console.log('기종 원문은 있는데 못 정한 것', un.length - 1);

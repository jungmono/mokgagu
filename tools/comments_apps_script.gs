/**
 * 조선의 목가구 — 기물 이야기(코멘트) 저장소 v2
 *  - 거믄·힌 : 가족 암호가 있어야 쓴다. 기본은 비공개(가족만 봄), 공개로 바꾸면 누구나 본다.
 *  - 벗     : 암호 없이 쓴다. 늘 공개. 자기 글은 그 기기에서만 지울 수 있다(key).
 * 시트: '목가구코멘트' > '코멘트' 탭.  배포: 웹 앱 · 실행 사용자 나 · 액세스 모든 사용자
 * v3: 'edit'(고치기) 추가 — 거믄·힌 글은 가족 암호, 벗 글은 쓴 기기의 key 로만 고친다.
 * ※ 실제 배포본에는 CODE 에 가족 암호가 들어 있다(공개 저장소에는 올리지 않음).
 */
const CODE = '여기에-가족-암호';
const SHEET_ID = '여기에-시트-ID';
const SHEET = '코멘트';
const HEAD = ['id', 'cid', 'author', 'name', 'text', 'time', 'page', 'deleted', 'public', 'key', 'edited'];

function sheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1); }
  if (sh.getRange(1, 9).getValue() !== 'public' || sh.getRange(1, 11).getValue() !== 'edited') sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]);
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function isFam_(code) { return String(code || '') === CODE; }
function row_(r) {
  return { id: String(r[0]), cid: String(r[1]), author: String(r[2]), name: String(r[3]), text: String(r[4]),
    t: r[5] instanceof Date ? r[5].toISOString() : String(r[5]), page: String(r[6]), edited: r[10] instanceof Date ? r[10].toISOString() : String(r[10] || ''), pub: String(r[8]) === '1' || String(r[2]) === '벗' };
}
function find_(sh, id) {
  const vals = sh.getRange(1, 1, sh.getLastRow(), HEAD.length).getValues();
  for (let i = 1; i < vals.length; i++) if (String(vals[i][0]) === String(id)) return { i: i + 1, r: vals[i] };
  return null;
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const fam = isFam_(p.code);
  const rows = sheet_().getDataRange().getValues(); rows.shift();
  const list = rows.filter(r => r[0] && !r[7]).map(row_).filter(c => fam || c.pub);
  return out_({ ok: true, fam: fam, bad: !!p.code && !fam, list: list });
}

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: false, err: 'json' }); }
  const fam = isFam_(d.code);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = sheet_();
    if (d.action === 'add' && d.c) {
      const c = d.c;
      let author = String(c.author || ''), pub = c.pub ? '1' : '';
      if (author === '거믄' || author === '힌') { if (!fam) return out_({ ok: false, err: 'code' }); }
      else { author = '벗'; pub = '1'; if (!String(c.name || '').trim()) return out_({ ok: false, err: 'name' }); }
      const text = String(c.text || '').trim(); if (!text) return out_({ ok: false, err: 'text' });
      if (!find_(sh, c.id)) {
        sh.appendRow([String(c.id).slice(0, 40), String(c.cid).slice(0, 200), author, String(c.name || '').slice(0, 30),
          text.slice(0, fam ? 4000 : 1000), new Date().toISOString(), String(c.page || '').slice(0, 60), '', pub, String(c.key || '').slice(0, 40)]);
      }
      return out_({ ok: true });
    }
    if (d.action === 'del' && d.id) {
      const f = find_(sh, d.id); if (!f) return out_({ ok: true });
      if (!fam && !(String(f.r[2]) === '벗' && d.key && String(f.r[9]) === String(d.key))) return out_({ ok: false, err: 'code' });
      sh.getRange(f.i, 8).setValue('삭제 ' + new Date().toISOString());
      return out_({ ok: true });
    }
    if (d.action === 'edit' && d.id) {
      const f = find_(sh, d.id); if (!f || f.r[7]) return out_({ ok: false, err: 'none' });
      const isFamRow = String(f.r[2]) === '거믄' || String(f.r[2]) === '힌';
      if (isFamRow ? !fam : !(d.key && String(f.r[9]) === String(d.key))) return out_({ ok: false, err: 'code' });
      const text = String(d.text || '').trim(); if (!text) return out_({ ok: false, err: 'text' });
      sh.getRange(f.i, 5).setValue(text.slice(0, isFamRow ? 4000 : 1000));
      sh.getRange(f.i, 11).setValue(new Date().toISOString());
      return out_({ ok: true });
    }
    if (d.action === 'pub' && d.id) {
      if (!fam) return out_({ ok: false, err: 'code' });
      const f = find_(sh, d.id); if (!f) return out_({ ok: false, err: 'none' });
      sh.getRange(f.i, 9).setValue(d.pub ? '1' : '');
      return out_({ ok: true });
    }
    return out_({ ok: false, err: 'action' });
  } finally { lock.releaseLock(); }
}

function 시트준비() { sheet_(); }

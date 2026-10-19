/**
 * 조선의 목가구 — 기물 이야기(코멘트) 저장소 v2
 *  - 거믄·힌 : 가족 암호가 있어야 쓴다. 기본은 비공개(가족만 봄), 공개로 바꾸면 누구나 본다.
 *  - 벗     : 암호 없이 쓴다. 늘 공개. 자기 글은 그 기기에서만 지울 수 있다(key).
 * 시트: '목가구코멘트' > '코멘트' 탭.  배포: 웹 앱 · 실행 사용자 나 · 액세스 모든 사용자
 * v6: 좋아요(별) — 시트 '좋아요' 탭. doGet action=likes(가족만), doPost action=like {cid, who(거믄|힌), on}.
 * v5: 소장품에 상태(소장·판매 예정·판매함)·판매일·판매가·판매처 추가.
 * v4: 소장품 도록(clist·cimg·csave·cphoto·cdel) 추가 — 시트 '소장품' 탭, 사진은 드라이브 비공개 폴더.
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
  if (p.action === 'clist' || p.action === 'cimg') return colGet_(p, fam);
  if (p.action === 'likes') return likesGet_(fam);
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
    if (d.action === 'like') return likePost_(d, fam);
    if (String(d.action || '').charAt(0) === 'c' && d.action !== 'code') return colPost_(d, fam);
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


/* ───────── 거믄과 힌의 소장품 도록 (v4) ─────────
 * 시트 '소장품' 탭에 한 줄씩, 사진은 내 드라이브 '조선의 목가구 소장품 사진' 폴더(비공개)에 저장.
 * 모든 읽기·쓰기는 가족 암호가 있어야 한다. 사진도 암호를 넣은 화면에서만 받아 볼 수 있다.
 * 처음 배포할 때 드라이브 권한을 한 번 허락해야 한다.                                   */
const COL_SHEET = '소장품';
const COL_HEAD = ['id', 'name', 'kind', 'size', 'era', 'wood', 'bought', 'place', 'price', 'note', 'memo', 'photos', 'owner', 'created', 'updated', 'deleted', 'status', 'sold', 'sprice', 'sto'];
const COL_FIELDS = ['name', 'kind', 'size', 'era', 'wood', 'bought', 'place', 'price', 'note', 'memo', 'owner', 'status', 'sold', 'sprice', 'sto'];
const PHOTO_FOLDER = '조선의 목가구 소장품 사진';

function colSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(COL_SHEET);
  if (!sh) { sh = ss.insertSheet(COL_SHEET); sh.appendRow(COL_HEAD); sh.setFrozenRows(1); }
  if (sh.getRange(1, COL_HEAD.length).getValue() !== COL_HEAD[COL_HEAD.length - 1]) sh.getRange(1, 1, 1, COL_HEAD.length).setValues([COL_HEAD]);
  return sh;
}
function colFolder_() {
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
}
function colRow_(r) {
  const o = {};
  COL_HEAD.forEach((k, i) => { let v = r[i]; o[k] = v instanceof Date ? Utilities.formatDate(v, 'Asia/Seoul', (k === 'bought' || k === 'sold') ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm:ss") : String(v == null ? '' : v); });
  try { o.photos = JSON.parse(o.photos || '[]'); } catch (x) { o.photos = []; }
  return o;
}
function colFind_(sh, id) {
  const last = sh.getLastRow(); if (last < 2) return null;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return null;
}
function colGet_(p, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  if (p.action === 'cimg') {
    const f = DriveApp.getFileById(String(p.id));
    if (f.getParents().next().getName() !== PHOTO_FOLDER) return out_({ ok: false, err: 'none' });
    return out_({ ok: true, type: f.getMimeType(), data: Utilities.base64Encode(f.getBlob().getBytes()) });
  }
  const rows = colSheet_().getDataRange().getValues(); rows.shift();
  return out_({ ok: true, list: rows.filter(r => r[0] && !r[15]).map(colRow_) });
}
function colPost_(d, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const sh = colSheet_(), now = new Date().toISOString();
  if (d.action === 'cphoto') {
    const bytes = Utilities.base64Decode(String(d.data || ''));
    if (!bytes.length || bytes.length > 8 * 1024 * 1024) return out_({ ok: false, err: 'size' });
    const f = colFolder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', String(d.name || 'photo').slice(0, 80) + '.jpg'));
    return out_({ ok: true, id: f.getId() });
  }
  if (d.action === 'csave' && d.item) {
    const it = d.item, id = String(it.id || '').slice(0, 40); if (!id) return out_({ ok: false, err: 'id' });
    if (!String(it.name || '').trim()) return out_({ ok: false, err: 'name' });
    const row = colFind_(sh, id);
    const vals = COL_HEAD.map(k => {
      if (k === 'id') return id;
      if (k === 'photos') return JSON.stringify((it.photos || []).slice(0, 40));
      if (k === 'created') return row ? sh.getRange(row, COL_HEAD.indexOf('created') + 1).getValue() : now;
      if (k === 'updated') return now;
      if (k === 'deleted') return '';
      if (k === 'status') return ['소장', '판매 예정', '판매함'].indexOf(String(it.status)) >= 0 ? String(it.status) : '소장';
      return String(it[k] == null ? '' : it[k]).slice(0, k === 'memo' || k === 'note' ? 6000 : 300);
    });
    if (row) sh.getRange(row, 1, 1, COL_HEAD.length).setValues([vals]); else sh.appendRow(vals);
    return out_({ ok: true, item: colRow_(vals) });
  }
  if (d.action === 'cdel' && d.id) {
    const row = colFind_(sh, d.id); if (!row) return out_({ ok: true });
    sh.getRange(row, COL_HEAD.indexOf('deleted') + 1).setValue('삭제 ' + now);
    return out_({ ok: true });
  }
  return out_({ ok: false, err: 'action' });
}
function 소장품준비() { colSheet_(); colFolder_(); }


/* ───────── 좋아요(별) ─────────
   '좋아요' 탭: cid | who | time   — 한 사람이 한 기물에 한 줄. 거두면 그 줄을 지운다. */
const LIKE_SHEET = '좋아요';
function likeSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(LIKE_SHEET);
  if (!sh) { sh = ss.insertSheet(LIKE_SHEET); sh.appendRow(['cid', 'who', 'time']); sh.setFrozenRows(1); }
  return sh;
}
function likesGet_(fam) {
  if (!fam) return out_({ ok: true, fam: false, list: [] });
  const rows = likeSheet_().getDataRange().getValues(); rows.shift();
  return out_({ ok: true, fam: true, list: rows.filter(r => r[0]).map(r => ({ cid: String(r[0]), who: String(r[1]), t: r[2] instanceof Date ? r[2].toISOString() : String(r[2]) })) });
}
function likePost_(d, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const who = String(d.who || ''), cid = String(d.cid || '').slice(0, 200);
  if ((who !== '거믄' && who !== '힌') || !cid) return out_({ ok: false, err: 'bad' });
  const sh = likeSheet_(), rows = sh.getDataRange().getValues();
  let at = -1;
  for (let i = 1; i < rows.length; i++) if (String(rows[i][0]) === cid && String(rows[i][1]) === who) { at = i + 1; break; }
  if (d.on && at < 0) sh.appendRow([cid, who, new Date().toISOString()]);
  if (!d.on && at > 0) sh.deleteRow(at);
  return out_({ ok: true });
}
function 좋아요준비() { likeSheet_(); }

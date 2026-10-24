/**
 * 조선의 목가구 — 기물 이야기(코멘트) 저장소 v2
 *  - 거믄·힌 : 가족 암호가 있어야 쓴다. 기본은 비공개(가족만 봄), 공개로 바꾸면 누구나 본다.
 *  - 벗     : 암호 없이 쓴다. 늘 공개. 자기 글은 그 기기에서만 지울 수 있다(key).
 * 시트: '목가구코멘트' > '코멘트' 탭.  배포: 웹 앱 · 실행 사용자 나 · 액세스 모든 사용자
 * v14: 수업 녹음을 드라이브 '조선의 목가구 수업 녹음' 폴더(비공개)에 저장 — doPost aup(3MB씩 나눠 올림), doGet aget(나눠 받아 재생). 「쓰기」 탭에 audio 열.
 *      처음 한 번 녹음준비() 를 실행해 권한(외부 요청)을 허락한다.
 * v13: 비교 기록 — doPost log kind=compare.
 * v12: 틀린 암호 횟수 제한(isFam_) · 매주 자동 백업(backupNow/setupBackup).
 * v10: 반닫이 지도 지역 설명 — doGet action=rlist(가족만), doPost rsave. 시트 '지역설명' 탭(id|text|editor|updated), 고치기 전 글은 '지역설명이력'에 남김.
 * v9: 질문에 사진 첨부(질문 탭 photos 열) · 「바로 쓰기」 게시판 — doGet action=wlist(가족만), doPost wsave·wdel. 시트 '쓰기'·'쓰기이력' 탭. 사진은 cphoto/cimg(드라이브 비공개 폴더) 그대로 쓴다.
 * v8: 통계 — doGet action=stats(가족만), doPost log(찾아본 기물·검색어) · qadd/qedit/qdel(선생님께 여쭤볼 것). 시트 '기록'·'질문' 탭.
 * v7: 방문자 수 — 시트 '방문' 탭. doGet action=visit(&new=1 이면 오늘 +1) → {today, total}.
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
/* v12: 틀린 암호 횟수 제한 — 15분 안에 서로 다른 틀린 암호가 10번 나오면 15분 동안 모든 암호를 받지 않는다.
   (같은 틀린 암호를 되풀이하는 옛 기기는 한 번으로 센다. 암호 자체는 저장하지 않고 요약값만 둔다.) */
function isFam_(code) {
  code = String(code || ''); if (!code) return false;
  const c = CacheService.getScriptCache();
  if (c.get('lock')) return false;
  if (code === CODE) return true;
  const h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, code)).slice(0, 12);
  let bad = []; try { bad = JSON.parse(c.get('bad') || '[]'); } catch (x) {}
  if (bad.indexOf(h) < 0) bad.push(h);
  if (bad.length >= 10) { c.put('lock', '1', 900); c.remove('bad'); }
  else c.put('bad', JSON.stringify(bad), 900);
  return false;
}

/* v12: 자동 백업 — 매주 일요일 새벽에 시트 전체를 드라이브 '목가구 백업' 폴더에 날짜 이름으로 복사하고 12개만 남긴다.
   처음 한 번 setupBackup() 을 실행해 예약을 건다. */
function backupNow() {
  const it = DriveApp.getFoldersByName('목가구 백업');
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder('목가구 백업');
  const name = '목가구 시트 ' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  DriveApp.getFileById(SHEET_ID).makeCopy(name, folder);
  const files = []; const fi = folder.getFiles();
  while (fi.hasNext()) files.push(fi.next());
  files.sort((a, b) => b.getDateCreated() - a.getDateCreated());
  files.slice(12).forEach(f => f.setTrashed(true));
}
function setupBackup() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'backupNow').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('backupNow').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(3).create();
  backupNow();
}
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
  if (p.action === 'visit') return visit_(p);
  if (p.action === 'stats') return statsGet_(fam);
  if (p.action === 'wlist') return wGet_(fam);
  if (p.action === 'rlist') return rGet_(fam);
  if (p.action === 'aget') return auGet_(p, fam);
  const rows = sheet_().getDataRange().getValues(); rows.shift();
  const list = rows.filter(r => r[0] && !r[7]).map(row_).filter(c => fam || c.pub);
  return out_({ ok: true, fam: fam, bad: !!p.code && !fam, list: list });
}

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: false, err: 'json' }); }
  const fam = isFam_(d.code);
  if (d.action === 'aup') return auPost_(d, fam);   // 녹음 올리기는 시간이 걸려 다른 일을 막지 않게 잠그지 않는다
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
    if (d.action === 'log') return logPost_(d, fam);
    if (d.action === 'qadd' || d.action === 'qedit' || d.action === 'qdel') return qPost_(d, fam);
    if (d.action === 'wsave' || d.action === 'wdel') return wPost_(d, fam);
    if (d.action === 'rsave') return rPost_(d, fam);
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


/* ───────── 방문자 수 ─────────
   '방문' 탭: day(yyyy-MM-dd, 한국 날짜) | count.  누적 = 모든 날의 합. */
function visit_(p) {
  const day = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName('방문');
  if (!sh) { sh = ss.insertSheet('방문'); sh.appendRow(['day', 'count']); sh.setFrozenRows(1); }
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const rows = sh.getDataRange().getDisplayValues();
    let at = -1, total = 0, today = 0;
    for (let i = 1; i < rows.length; i++) { const n = Number(rows[i][1]) || 0; total += n; if (rows[i][0] === day) { at = i + 1; today = n; } }
    if (p.new === '1') {
      today++; total++;
      if (at > 0) sh.getRange(at, 2).setValue(today); else { sh.appendRow([day, 1]); sh.getRange(sh.getLastRow(), 1).setNumberFormat('@').setValue(day); }
    }
    return out_({ ok: true, day: day, today: today, total: total });
  } finally { lock.releaseLock(); }
}


/* ───────── 통계 · 찾아본 기록 · 선생님께 여쭤볼 것 (v8) ─────────
   '기록' 탭: time | who | kind(view|search) | cid | q | page
   '질문' 탭: id | who | text | cid | cls(수업일 yyyy-MM-dd) | time | done | ans | ans_time | deleted  */
const LOG_SHEET = '기록', Q_SHEET = '질문';
const Q_HEAD = ['id', 'who', 'text', 'cid', 'cls', 'time', 'done', 'ans', 'ans_time', 'deleted', 'photos'];
function qSheet_() {
  const sh = tab_(Q_SHEET, Q_HEAD);
  if (sh.getRange(1, 11).getValue() !== 'photos') sh.getRange(1, 11).setValue('photos');
  return sh;
}
function photos_(a, max) {
  if (typeof a === 'string') { try { a = JSON.parse(a); } catch (x) { a = []; } }
  if (!Array.isArray(a)) return [];
  return a.slice(0, max).map(p => ({ f: String(p && p.f || '').slice(0, 80), t: String(p && p.t || '').slice(0, 80), c: String(p && p.c || '').slice(0, 80) })).filter(p => p.f || p.t);
}
function tab_(name, head) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); sh.getRange('A:Z').setNumberFormat('@'); }
  return sh;
}
function iso_(v) { return v instanceof Date ? v.toISOString() : String(v || ''); }
function day_(v) { return v instanceof Date ? Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd') : String(v || ''); }
function statsGet_(fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const lg = tab_(LOG_SHEET, ['time', 'who', 'kind', 'cid', 'q', 'page']).getDataRange().getValues(); lg.shift();
  const logs = lg.slice(-3000).filter(r => r[0]).map(r => ({ t: iso_(r[0]), who: String(r[1]), kind: String(r[2]), cid: String(r[3]), q: String(r[4]) }));
  const qs = qSheet_().getDataRange().getValues(); qs.shift();
  const questions = qs.filter(r => r[0] && !r[9]).map(r => ({ id: String(r[0]), who: String(r[1]), text: String(r[2]), cid: String(r[3]), cls: day_(r[4]), t: iso_(r[5]), done: String(r[6]) === '1', ans: String(r[7] || ''), at: iso_(r[8]), photos: photos_(r[10], 6) }));
  const ss = SpreadsheetApp.openById(SHEET_ID), vs = ss.getSheetByName('방문');
  const visits = vs ? vs.getDataRange().getDisplayValues().slice(1).filter(r => r[0]).map(r => ({ day: r[0], n: Number(r[1]) || 0 })) : [];
  const lk = ss.getSheetByName(LIKE_SHEET);
  const likes = lk ? lk.getDataRange().getValues().slice(1).filter(r => r[0]).map(r => ({ cid: String(r[0]), who: String(r[1]), t: iso_(r[2]) })) : [];
  return out_({ ok: true, logs: logs, questions: questions, visits: visits, likes: likes });
}
function famWho_(w) { w = String(w || ''); return (w === '거믄' || w === '힌') ? w : ''; }
function logPost_(d, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const who = famWho_(d.who); if (!who) return out_({ ok: false, err: 'bad' });
  const kind = d.kind === 'search' ? 'search' : d.kind === 'compare' ? 'compare' : 'view';   // v13: compare = 나란히 본 기물들(cid 에 '도록/번호'를 공백으로 이어 적음, q 에 이름)
  tab_(LOG_SHEET, ['time', 'who', 'kind', 'cid', 'q', 'page']).appendRow([new Date().toISOString(), who, kind, String(d.cid || '').slice(0, 200), String(d.q || '').slice(0, kind === 'compare' ? 200 : 60), String(d.page || '').slice(0, 60)]);
  return out_({ ok: true });
}
function qPost_(d, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const sh = qSheet_();
  const find = id => { const v = sh.getDataRange().getValues(); for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(id)) return i + 1; return -1; };
  if (d.action === 'qadd' && d.q) {
    const q = d.q, who = famWho_(q.who), text = String(q.text || '').trim();
    if (!who || !text) return out_({ ok: false, err: 'bad' });
    if (find(q.id) >= 0) return out_({ ok: true, dup: true });   // 이미 있거나 지운 질문은 다시 넣지 않는다
    sh.appendRow([String(q.id).slice(0, 40), who, text.slice(0, 2000), String(q.cid || '').slice(0, 200), String(q.cls || '').slice(0, 10), new Date().toISOString(), '', '', '', '', JSON.stringify(photos_(q.photos, 6))]);
    return out_({ ok: true });
  }
  const at = find(d.id); if (at < 0) return out_({ ok: false, err: 'none' });
  if (d.action === 'qdel') { sh.getRange(at, 10).setValue('삭제 ' + new Date().toISOString()); return out_({ ok: true }); }
  if (d.action === 'qedit') {
    if (typeof d.text === 'string' && d.text.trim()) sh.getRange(at, 3).setValue(d.text.trim().slice(0, 2000));
    if (typeof d.cls === 'string') sh.getRange(at, 5).setValue(d.cls.slice(0, 10));
    if (Array.isArray(d.photos)) sh.getRange(at, 11).setValue(JSON.stringify(photos_(d.photos, 6)));
    if (typeof d.done === 'boolean') sh.getRange(at, 7).setValue(d.done ? '1' : '');
    if (typeof d.ans === 'string') { sh.getRange(at, 8).setValue(d.ans.slice(0, 4000)); sh.getRange(at, 9).setValue(new Date().toISOString()); }
    return out_({ ok: true });
  }
  return out_({ ok: false, err: 'action' });
}


/* ───────── 공부방 「바로 쓰기」 (v9) ─────────
   '쓰기' 탭: id | who(처음 쓴 사람) | cls(수업일) | title | body | photos(JSON) | created | updated | editor(마지막으로 고친 사람) | deleted | status(비어 있으면 정리 전, '정리됨') | audio(JSON, v14)
   '쓰기이력' 탭: 고치기 전 글을 한 줄씩 남겨 둔다.  거믄·힌은 서로의 글을 고칠 수 있다. */
const W_SHEET = '쓰기', W_HEAD = ['id', 'who', 'cls', 'title', 'body', 'photos', 'created', 'updated', 'editor', 'deleted', 'status', 'audio'];
const WH_SHEET = '쓰기이력', WH_HEAD = ['time', 'id', 'editor', 'title', 'body', 'photos', 'audio'];
function wSheet_() {
  const sh = tab_(W_SHEET, W_HEAD);
  if (sh.getRange(1, 12).getValue() !== 'audio') sh.getRange(1, 12).setValue('audio');
  return sh;
}
function wRow_(r) {
  return { id: String(r[0]), who: String(r[1]), cls: day_(r[2]), title: String(r[3]), body: String(r[4]), photos: photos_(r[5], 12),
    created: iso_(r[6]), updated: iso_(r[7]), editor: String(r[8] || r[1]), status: String(r[10] || ''), audio: audios_(r[11]) };
}
function wGet_(fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const rows = wSheet_().getDataRange().getValues(); rows.shift();
  return out_({ ok: true, list: rows.filter(r => r[0] && !r[9]).map(wRow_) });
}
function wPost_(d, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const sh = wSheet_(), now = new Date().toISOString();
  const find = id => { const v = sh.getDataRange().getValues(); for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(id)) return { at: i + 1, r: v[i] }; return null; };
  if (d.action === 'wdel') {
    const f = find(d.id); if (!f) return out_({ ok: true });
    sh.getRange(f.at, 10).setValue('삭제 ' + now);
    return out_({ ok: true });
  }
  const it = d.item || {}, id = String(it.id || '').slice(0, 40), who = famWho_(it.who), editor = famWho_(it.editor) || who;
  if (!id || !who) return out_({ ok: false, err: 'bad' });
  const title = String(it.title || '').trim().slice(0, 100), body = String(it.body || '').trim().slice(0, 20000);
  const ph = photos_(it.photos, 12);
  const hasAu = Array.isArray(it.audio), au = audios_(it.audio);
  if (!title && !body && !ph.length && !au.length) return out_({ ok: false, err: 'text' });
  const cls = String(it.cls || '').slice(0, 10);
  const f = find(id);
  if (f && f.r[9]) return out_({ ok: false, err: 'none' });
  if (!f) {
    const row = [id, who, cls, title, body, JSON.stringify(ph), now, now, editor, '', '', JSON.stringify(au)];
    sh.appendRow(row);
    return out_({ ok: true, item: wRow_(row) });
  }
  // 다른 사람이 그 사이에 고쳤다면 덮어쓰지 않고 알린다
  if (it.base && iso_(f.r[7]) !== String(it.base)) return out_({ ok: false, err: 'conflict', item: wRow_(f.r) });
  tab_(WH_SHEET, WH_HEAD).appendRow([now, id, String(f.r[8] || f.r[1]), String(f.r[3]), String(f.r[4]), String(f.r[5]), String(f.r[11] || '')]);
  const keepAu = hasAu ? JSON.stringify(au) : String(f.r[11] || '[]');   // 녹음 칸을 모르는 옛 화면에서 고쳐도 녹음은 남긴다
  const nv = [id, String(f.r[1]), cls, title, body, JSON.stringify(ph), f.r[6], now, editor, '', '', keepAu];   // 고치면 다시 「정리 전」
  sh.getRange(f.at, 1, 1, W_HEAD.length).setValues([nv]);
  return out_({ ok: true, item: wRow_(nv) });
}
function 쓰기준비() { wSheet_(); tab_(WH_SHEET, WH_HEAD); qSheet_(); }

/* ───────── 반닫이 지도 지역 설명 (v10) ───────── */
const R_SHEET = '지역설명', R_HEAD = ['id', 'text', 'editor', 'updated'], RH_SHEET = '지역설명이력', RH_HEAD = ['time', 'id', 'editor', 'text'];
function rGet_(fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const rows = tab_(R_SHEET, R_HEAD).getDataRange().getValues(); rows.shift();
  const map = {}; rows.forEach(r => { if (r[0]) map[String(r[0])] = { text: String(r[1]), editor: String(r[2] || ''), updated: iso_(r[3]) }; });
  return out_({ ok: true, map: map });
}
function rPost_(d, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const id = String(d.id || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40), editor = famWho_(d.editor);
  if (!id || !editor) return out_({ ok: false, err: 'bad' });
  const text = String(d.text || '').slice(0, 5000), sh = tab_(R_SHEET, R_HEAD), now = new Date().toISOString();
  const v = sh.getDataRange().getValues(); let at = 0;
  for (let i = 1; i < v.length; i++) if (String(v[i][0]) === id) { at = i + 1; break; }
  if (at) tab_(RH_SHEET, RH_HEAD).appendRow([now, id, String(v[at - 1][2]), String(v[at - 1][1])]);
  if (!text.trim()) { if (at) sh.deleteRow(at); return out_({ ok: true, reset: true }); }   // 비우면 처음 글로
  if (at) sh.getRange(at, 1, 1, 4).setValues([[id, text, editor, now]]); else sh.appendRow([id, text, editor, now]);
  return out_({ ok: true, item: { text: text, editor: editor, updated: now } });
}
function 지역설명준비() { tab_(R_SHEET, R_HEAD); tab_(RH_SHEET, RH_HEAD); }


/* ───────── 수업 녹음 (v14) ─────────
   녹음은 이 스크립트를 배포한 계정의 드라이브 '조선의 목가구 수업 녹음' 폴더(비공개)에 한 파일로 저장한다.
   · 올리기 aup : 화면이 녹음을 3MB씩 잘라 차례로 보낸다(base64). 첫 조각에서 드라이브 이어 올리기를 열고,
                  그 주소를 6시간 기억해 두었다가 조각마다 이어 붙인다. 마지막 조각이 들어가면 파일 id 를 돌려준다.
   · 듣기 aget  : 가족 암호가 있는 화면만 3MB씩 받아 이어 붙여 재생한다(드라이브 공유 설정은 필요 없다).
   · 글에 붙은 녹음은 「쓰기」 탭 audio 열에 [{id, name, dur(초), size, mime}] 로 남는다.                      */
const AU_FOLDER = '조선의 목가구 수업 녹음', AU_CHUNK = 3 * 1024 * 1024, AU_MAX = 500 * 1024 * 1024;
function auFolder_() {
  const it = DriveApp.getFoldersByName(AU_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(AU_FOLDER);
}
function audios_(a) {
  if (typeof a === 'string') { try { a = JSON.parse(a || '[]'); } catch (x) { a = []; } }
  if (!Array.isArray(a)) return [];
  return a.slice(0, 6).map(x => ({ id: String(x && x.id || '').replace(/[^\w-]/g, '').slice(0, 80), name: String(x && x.name || '').slice(0, 100),
    dur: Math.max(0, Math.round(Number(x && x.dur) || 0)), size: Math.max(0, Math.round(Number(x && x.size) || 0)), mime: String(x && x.mime || '').slice(0, 40) })).filter(x => x.id);
}
function auMime_(m) { m = String(m || '').split(';')[0].trim(); return /^audio\/(webm|mp4|ogg|mpeg|aac|x-m4a|wav)$/.test(m) ? m : 'audio/webm'; }
function auPost_(d, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const u = d.up || {}, id = String(u.id || '').replace(/[^\w-]/g, '').slice(0, 40);
  const i = Math.floor(Number(u.i)), n = Math.floor(Number(u.n)), size = Math.floor(Number(u.size));
  if (!id || !(n > 0) || !(i >= 0 && i < n) || !(size > 0) || size > AU_MAX || n !== Math.ceil(size / AU_CHUNK)) return out_({ ok: false, err: 'bad' });
  const mime = auMime_(u.mime), bytes = Utilities.base64Decode(String(u.data || ''));
  const start = i * AU_CHUNK, want = i < n - 1 ? AU_CHUNK : size - start;
  if (bytes.length !== want) return out_({ ok: false, err: 'size' });
  const cache = CacheService.getScriptCache(), key = 'au_' + id, auth = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
  let sess = cache.get(key);
  if (i === 0 && !(u.retry && sess)) {
    const meta = { name: String(u.name || ('수업녹음 ' + id)).slice(0, 100), mimeType: mime, parents: [auFolder_().getId()], description: '조선의 목가구 공부방 수업 녹음 (' + id + ')' };
    const r = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', {
      method: 'post', contentType: 'application/json; charset=UTF-8', payload: JSON.stringify(meta), muteHttpExceptions: true,
      headers: Object.assign({ 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(size) }, auth) });
    const h = r.getHeaders(); sess = h.Location || h.location;
    if (r.getResponseCode() !== 200 || !sess) return out_({ ok: false, err: 'start', status: r.getResponseCode() });
    cache.put(key, sess, 21600);
  }
  if (!sess) return out_({ ok: false, err: 'session' });   // 6시간이 지났거나 기억이 지워짐 → 화면이 처음부터 다시 올린다
  const end = start + want - 1;
  if (u.retry) {   // 다시 보내는 조각이면 드라이브가 이미 받은 데까지 확인해 겹치지 않게 한다
    const q = UrlFetchApp.fetch(sess, { method: 'put', payload: '', muteHttpExceptions: true, headers: { 'Content-Range': 'bytes */' + size } });
    const qc = q.getResponseCode();
    if (qc === 200 || qc === 201) { cache.remove(key); return out_({ ok: true, done: true, id: JSON.parse(q.getContentText()).id, size: size }); }
    if (qc === 308) { const rg = q.getHeaders().Range || q.getHeaders().range || ''; const got = rg ? Number(String(rg).split('-')[1]) : -1; if (got >= end) return out_({ ok: true, next: i + 1 }); if (got !== start - 1) return out_({ ok: false, err: 'session' }); }
    else return out_({ ok: false, err: 'session' });
  }
  const r2 = UrlFetchApp.fetch(sess, { method: 'put', contentType: mime, payload: bytes, muteHttpExceptions: true, headers: { 'Content-Range': 'bytes ' + start + '-' + end + '/' + size } });
  const c = r2.getResponseCode();
  if (c === 308) return out_({ ok: true, next: i + 1 });
  if (c === 200 || c === 201) { cache.remove(key); return out_({ ok: true, done: true, id: JSON.parse(r2.getContentText()).id, size: size }); }
  return out_({ ok: false, err: 'put', status: c });
}
function auGet_(p, fam) {
  if (!fam) return out_({ ok: false, err: 'code' });
  const id = String(p.id || '').replace(/[^\w-]/g, '');
  let f; try { f = DriveApp.getFileById(id); } catch (x) { return out_({ ok: false, err: 'none' }); }
  const ps = f.getParents(); if (!ps.hasNext() || ps.next().getName() !== AU_FOLDER) return out_({ ok: false, err: 'none' });
  const size = f.getSize(), n = Math.max(1, Math.ceil(size / AU_CHUNK)), i = Math.floor(Number(p.i) || 0);
  if (i < 0 || i >= n) return out_({ ok: false, err: 'bad' });
  const start = i * AU_CHUNK, end = Math.min(size, start + AU_CHUNK) - 1;
  const r = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media', { muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), Range: 'bytes=' + start + '-' + end } });
  if (r.getResponseCode() !== 206 && r.getResponseCode() !== 200) return out_({ ok: false, err: 'read', status: r.getResponseCode() });
  return out_({ ok: true, i: i, n: n, size: size, type: f.getMimeType(), data: Utilities.base64Encode(r.getContent()) });
}
/* 처음 한 번 편집기에서 실행: 폴더를 만들고, 드라이브 이어 올리기에 필요한 '외부 요청' 권한을 허락받는다 */
function 녹음준비() { auFolder_(); wSheet_(); tab_(WH_SHEET, WH_HEAD); UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/about?fields=user', { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } }); }

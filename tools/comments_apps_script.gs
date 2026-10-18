/**
 * 조선의 목가구 — 기물 이야기(코멘트) 저장소
 * 구글 시트 > 확장 프로그램 > Apps Script 에 이 내용을 통째로 붙여 넣고,
 * 아래 CODE 를 우리 집 가족 암호로 바꾼 뒤, [배포 > 새 배포 > 웹 앱] 으로 배포한다.
 *   - 실행 사용자: 나
 *   - 액세스 권한: 모든 사용자
 * 배포 후 나오는 웹 앱 주소(https://script.google.com/macros/s/…/exec)를 사이트의 comments.js 맨 위 API 에 넣는다.
 */
const CODE = '여기에-가족-암호';   // ← 바꾸기 (사이트에서 처음 한 번 입력하는 암호)
const SHEET = '코멘트';
const HEAD = ['id', 'cid', 'author', 'name', 'text', 'time', 'page', 'deleted'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1); }
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.code !== CODE) return out_({ ok: false, err: 'code' });
  const rows = sheet_().getDataRange().getValues(); rows.shift();
  const list = rows.filter(r => r[0] && !r[7]).map(r => ({
    id: String(r[0]), cid: String(r[1]), author: String(r[2]), name: String(r[3]), text: String(r[4]),
    t: r[5] instanceof Date ? r[5].toISOString() : String(r[5]), page: String(r[6])
  }));
  return out_({ ok: true, list: list });
}

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: false, err: 'json' }); }
  if (d.code !== CODE) return out_({ ok: false, err: 'code' });
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = sheet_();
    if (d.action === 'add' && d.c) {
      const c = d.c;
      const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => String(r[0]));
      if (ids.indexOf(String(c.id)) === -1) {
        sh.appendRow([String(c.id), String(c.cid).slice(0, 200), String(c.author).slice(0, 20), String(c.name || '').slice(0, 40),
          String(c.text).slice(0, 4000), String(c.t || new Date().toISOString()), String(c.page || '').slice(0, 60), '']);
      }
      return out_({ ok: true });
    }
    if (d.action === 'del' && d.id) {
      const vals = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
      for (let i = 1; i < vals.length; i++) if (String(vals[i][0]) === String(d.id)) { sh.getRange(i + 1, 8).setValue('삭제 ' + new Date().toISOString()); break; }
      return out_({ ok: true });
    }
    return out_({ ok: false, err: 'action' });
  } finally { lock.releaseLock(); }
}

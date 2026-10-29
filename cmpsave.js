/* 비교하기: 「이 비교 저장」 + 「저장한 비교」 목록.
   가족(거믄·힌)은 구글 시트에 저장되어 휴대폰·노트북이 같다. 벗은 이 기기에만. */
(function () {
  var API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  var KC = 'mokgagu_cmp', KH = 'mokgagu_cmp_hist';
  function ls(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function code() { return ls('mokgagu_cm_code', ''); }
  function fam() { return ls('mokgagu_cm_fam', '') === '1' && !!code(); }
  function cur() { try { var a = JSON.parse(ls(KC, '[]')); return Array.isArray(a) ? a.slice(0, 5) : []; } catch (e) { return []; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hid(a) { var s = a.map(function (x) { return x.k; }).sort().join('|'), h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return 'c' + h.toString(36); }
  function lh() { try { var a = JSON.parse(ls(KH, '[]')); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function post(d) { d.code = code(); return fetch(API, { method: 'POST', body: JSON.stringify(d) }).then(function (r) { return r.json(); }).catch(function () { return { ok: false }; }); }
  function fmt(t) { var d = new Date(t); return isNaN(d) ? '' : (d.getMonth() + 1) + '/' + d.getDate(); }
  var css = document.createElement('style');
  css.textContent = '#cs-bar{margin:0 0 14px}#cs-bar button,.cs-it button{border:2px solid #000;background:#000;color:#fff;border-radius:99px;padding:7px 16px;font-weight:800;font-size:14px;cursor:pointer}#cs-bar button[disabled]{opacity:.4}#cs-bar small{margin-left:10px;color:#444}' +
    '#cs-box{margin:26px 0 10px;border:2.5px solid #000;border-radius:12px;background:#fff;padding:10px 14px}#cs-box h2{font-size:17px;margin:0 0 4px}.cs-it{display:flex;align-items:center;gap:8px;border-top:1.5px solid #ccc;padding:9px 0;font-size:14px}.cs-it:first-of-type{border-top:0}.cs-it b{flex:1;min-width:0;line-height:1.5}.cs-it small{display:block;color:#666;font-weight:400;font-size:12px}.cs-it button{background:#fff;color:#000;padding:4px 12px;font-size:13px}.cs-it .x{border:0;font-size:17px;padding:0 6px}.cs-em{color:#666;font-size:13.5px;padding:6px 0}';
  document.head.appendChild(css);
  var bar = document.createElement('div'); bar.id = 'cs-bar';
  var box = document.createElement('div'); box.id = 'cs-box';
  var items = [];
  function paintBar() {
    var n = cur().length;
    bar.innerHTML = '<button type="button" id="cs-save"' + (n < 2 ? ' disabled' : '') + '>이 비교 저장</button><small>' + (fam() ? '거믄·힌 모든 기기에 저장' : '이 기기에만 저장') + '</small>';
  }
  function paintList() {
    box.innerHTML = '<h2>저장한 비교</h2>' + (items.length ? items.map(function (c) {
      var names = (c.name || '').slice(0, 80);
      return '<div class="cs-it"><b>' + esc(names) + '<small>' + fmt(c.time) + ' · ' + (c.items || []).length + '점' + (c.who ? ' · ' + esc(c.who) : '') + '</small></b><button type="button" data-open="' + esc(c.id) + '">다시 보기</button><button type="button" class="x" data-del="' + esc(c.id) + '" aria-label="지우기">✕</button></div>';
    }).join('') : '<div class="cs-em">아직 저장한 비교가 없어요.</div>');
  }
  function load() {
    if (fam()) {
      fetch(API, { method: 'POST', body: JSON.stringify({ action: 'cmplist', code: code() }) }).then(function (r) { return r.json(); })
        .then(function (j) { items = (j && j.ok) ? j.list : lh(); paintList(); }).catch(function () { items = lh(); paintList(); });
    } else { items = lh().sort(function (a, b) { return a.time < b.time ? 1 : -1; }); paintList(); }
  }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) return;
    if (t.closest('#cs-save')) {
      var a = cur().map(function (x) { return { k: x.k, n: x.n, u: x.u }; }); if (a.length < 2) return;
      var rec = { id: hid(a), name: a.map(function (x) { return x.n; }).join(' · '), items: a, time: new Date().toISOString(), who: ls('mokgagu_cm_who', '') };
      var bt = t.closest('#cs-save'); bt.disabled = true;
      if (fam()) post({ action: 'cmpsave', id: rec.id, who: rec.who, name: rec.name, items: a }).then(function (j) {
        bt.disabled = false; if (j && j.ok) { bt.textContent = '저장했어요 ✓'; setTimeout(function () { bt.textContent = '이 비교 저장'; }, 1800); load(); }
        else { bt.textContent = '저장 실패 — 다시'; }
      });
      else { var h = lh().filter(function (x) { return x.id !== rec.id; }); h.unshift(rec); try { localStorage.setItem(KH, JSON.stringify(h.slice(0, 100))); } catch (er) {} bt.disabled = false; bt.textContent = '저장했어요 ✓'; setTimeout(function () { bt.textContent = '이 비교 저장'; }, 1800); load(); }
      return;
    }
    var o = t.closest('[data-open]');
    if (o) { var id = o.getAttribute('data-open'), c = items.filter(function (x) { return x.id === id; })[0]; if (c) { try { localStorage.setItem(KC, JSON.stringify(c.items.slice(0, 5))); } catch (er) {} location.reload(); } return; }
    var d = t.closest('[data-del]');
    if (d) { var did = d.getAttribute('data-del'); if (!confirm('이 저장한 비교를 지울까요?')) return;
      if (fam()) post({ action: 'cmpdel', id: did }).then(function () { load(); });
      else { try { localStorage.setItem(KH, JSON.stringify(lh().filter(function (x) { return x.id !== did; }))); } catch (er) {} load(); } }
  });
  function init() {
    var sub = document.getElementById('sub'), app = document.getElementById('app'); if (!sub || !app) return;
    sub.parentNode.insertBefore(bar, app); app.parentNode.insertBefore(box, app.nextSibling);
    paintBar(); load();
    window.addEventListener('storage', paintBar);
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();

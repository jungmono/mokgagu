/* 공부방 노트 고치기·사진 추가 (study.html 이 불러 쓴다)
   - 원래 노트는 암호 파일에 그대로 두고, 고친 칸·붙인 사진만 구글 시트 「노트수정」 탭에 저장한다(거믄·힌 모든 기기가 같다).
   - 고치지 않은 칸은 원래 노트를 그대로 쓴다. 「원래대로」를 누르면 고친 것을 지운다(이전 글은 「노트수정이력」 탭에 남는다).
   - MOKGAGU_NOTEEDIT.load(onChange)  시트에서 고친 내용을 받아 온다.
   - MOKGAGU_NOTEEDIT.view(세션)      → {title, lead, tags[], body(HTML), edited, photos, key}
   - MOKGAGU_NOTEEDIT.bar(세션)       → 카드 머리에 넣을 버튼 HTML,  .photos(세션) → 붙인 사진 HTML
   - MOKGAGU_NOTEEDIT.after(요소)     그린 뒤 사진 채우기.   필요: mkphoto.js */
(function () {
  if (window.MOKGAGU_NOTEEDIT) return;
  var API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  var K_CACHE = 'mokgagu_study_edits_v1';
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var EDITS = (function () { try { var o = JSON.parse(ls.get(K_CACHE) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } })();
  var SES = {}, onChange = function () {}, busy = '', ED = null;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function code() { return ls.get('mokgagu_cm_code') || ls.get('mokgagu_study_pw') || ''; }
  function me() { return ls.get('mokgagu_write_who') || (ls.get('mokgagu_cm_who') === '힌' ? '힌' : '거믄'); }
  function PH() { return window.MOKGAGU_PHOTO; }
  function post(b) { b.code = code(); return fetch(API, { method: 'POST', body: JSON.stringify(b) }).then(function (r) { return r.json(); }); }
  function keyOf(s) { return (s.owner || '거믄') + '|' + s.date; }
  function save() { ls.set(K_CACHE, JSON.stringify(EDITS)); }
  function toast(t) { var d = document.createElement('div'); d.textContent = t; d.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#111;color:#fff;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:700;z-index:99999;max-width:90vw;text-align:center'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }

  /* 글 꾸미기: ## 제목 · - 목록 · **굵게**  (원래 노트의 h3 모양과 같게 그린다) */
  function md(t) {
    var out = [], list = false;
    String(t || '').split(/\r?\n/).forEach(function (ln) {
      var m, inl = function (x) { return esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); };
      if ((m = ln.match(/^\s*[-•·]\s+(.*)$/))) { if (!list) { out.push('<ul>'); list = true; } out.push('<li>' + inl(m[1]) + '</li>'); return; }
      if (list) { out.push('</ul>'); list = false; }
      if ((m = ln.match(/^#{1,4}\s+(.*)$/))) out.push('<h3>' + inl(m[1]) + '</h3>');
      else if (ln.trim()) out.push('<p>' + inl(ln) + '</p>');
    });
    if (list) out.push('</ul>');
    return out.join('');
  }
  /* 원래 노트(HTML) → 고치기 쉬운 글 */
  function h2t(html) {
    var box = document.createElement('div'); box.innerHTML = html || '';
    var out = [];
    var txt = function (n) { return (n.textContent || '').replace(/\s+/g, ' ').trim(); };
    (function walk(parent) {
      [].forEach.call(parent.childNodes, function (n) {
        if (n.nodeType === 3) { var t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (t) out.push(t); return; }
        if (n.nodeType !== 1) return;
        var tag = n.tagName;
        if (/^H[1-6]$/.test(tag)) { out.push('', '## ' + txt(n)); }
        else if (tag === 'UL' || tag === 'OL') { [].forEach.call(n.children, function (li) { out.push('- ' + txt(li)); }); }
        else if (tag === 'P' || tag === 'BLOCKQUOTE') { var t2 = txt(n); if (t2) out.push(t2); }
        else if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE') walk(n);
        else { var t3 = txt(n); if (t3) out.push(t3); }
      });
    })(box);
    return out.join('\n').replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');
  }
  function orig(s) { return { title: s.title || '', lead: s.lead || '', tags: (s.tags || []).join(', '), body: h2t(s.body) }; }

  function view(s) {
    SES[keyOf(s)] = s;
    var E = EDITS[keyOf(s)], f = E ? String(E.fields || '').split(',') : [];
    var has = function (k) { return f.indexOf(k) >= 0; };
    return { key: keyOf(s), edited: !!E && (f.length > 0 && f[0] !== ''), photos: E ? (E.photos || []) : [], any: !!E,
      title: has('title') ? E.title : s.title, lead: has('lead') ? E.lead : s.lead,
      tags: has('tags') ? String(E.tags || '').split(/[,，]/).map(function (x) { return x.trim(); }).filter(Boolean) : (s.tags || []),
      body: has('body') ? md(E.body) : s.body, editor: E ? E.editor : '' };
  }
  function bar(s) {
    var k = esc(keyOf(s)), v = view(s);
    return '<span class="ne-bar"><button type="button" data-ne="edit" data-nk="' + k + '">✏️ 고치기</button><button type="button" data-ne="photo" data-nk="' + k + '">📷 사진 추가</button></span>' +
      (v.edited ? '<span class="ne-tag" title="' + esc(v.editor) + '이(가) 고침">고친 글</span>' : '');
  }
  function photos(s) {
    var v = view(s); if (!v.photos.length) return '';
    return '<div class="ne-ph"><div class="ne-pt">📷 덧붙인 사진 ' + v.photos.length + '장</div><div class="mp-row">' + PH().thumbs(v.photos, 'ne-' + v.key, { big: true, cap: true }) + '</div></div>';
  }
  function after(root) { if (PH()) PH().fill(root || document); }

  function load(cb) {
    if (cb) onChange = cb;
    if (!code()) return;
    post({ action: 'nlist' }).then(function (j) {
      if (!j || !j.ok) return;
      var m = {}; (j.list || []).forEach(function (x) { m[x.key] = x; });
      var a = JSON.stringify(m); if (a === JSON.stringify(EDITS)) return;
      EDITS = m; save(); onChange();
    }).catch(function () {});
  }

  /* ───── 고치기 창 ───── */
  var css = document.createElement('style');
  css.textContent = '.ne-bar{margin-left:auto;display:inline-flex;gap:6px}.ne-bar button{font:inherit;font-size:12.5px;font-weight:800;border:1.5px solid #111;background:#fff;color:#111;border-radius:999px;padding:4px 11px;cursor:pointer;min-height:30px}.ne-bar button:active{background:#eee}' +
    '.ne-tag{font-size:11px!important;font-weight:800;color:#8a5a00!important;background:#fff3d6;border-radius:6px;padding:2px 7px}' +
    '.ne-ph{margin:14px 0 0;padding-top:10px;border-top:1px dashed #d8d2c7}.ne-pt{font-size:13px;font-weight:800;color:#4a463f}' +
    '#ne-dlg{border:0;border-radius:16px;padding:0;width:min(720px,calc(100vw - 20px));max-height:calc(100dvh - 20px);box-shadow:0 20px 60px rgba(0,0,0,.35)}#ne-dlg::backdrop{background:rgba(0,0,0,.5)}' +
    '#ne-dlg form{display:flex;flex-direction:column;gap:9px;padding:16px 18px 14px;max-height:calc(100dvh - 20px);overflow:auto}' +
    '#ne-dlg h2{margin:0;font-size:18px}#ne-dlg label{font-size:12.5px;font-weight:800;color:#4a463f;display:block;margin:0 0 3px}' +
    '#ne-dlg input[type=text],#ne-dlg textarea{width:100%;box-sizing:border-box;font:inherit;font-size:16px;border:1.5px solid #cfc8bb;border-radius:10px;padding:9px 11px;background:#fff;color:#111}' +
    '#ne-dlg textarea{line-height:1.6;resize:vertical}#ne-body{min-height:260px}' +
    '#ne-dlg .ne-seg{display:inline-flex;border:1.5px solid #111;border-radius:999px;overflow:hidden}#ne-dlg .ne-seg button{border:0;background:#fff;font:inherit;font-weight:800;font-size:13px;padding:5px 14px;cursor:pointer}#ne-dlg .ne-seg button.on{background:#111;color:#fff}' +
    '#ne-dlg .ne-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#ne-dlg .ne-hint{font-size:12px;color:#756e65}' +
    '#ne-dlg .ne-pc{display:flex;gap:8px;align-items:center;margin:0 0 6px}#ne-dlg .ne-pc input{flex:1}' +
    '#ne-dlg .ne-act{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;position:sticky;bottom:-14px;background:#fff;padding:10px 0 4px;border-top:1px solid #eee}' +
    '#ne-dlg .ne-act button{font:inherit;font-weight:800;font-size:15px;border:2px solid #111;background:#fff;color:#111;border-radius:999px;padding:9px 20px;cursor:pointer}#ne-dlg .ne-act .go{background:#111;color:#fff}#ne-dlg .ne-act .rs{margin-right:auto;border-color:#b3261e;color:#b3261e}' +
    '#ne-msg{font-size:13.5px;font-weight:700;color:#b3261e;min-height:1em}';
  document.head.appendChild(css);
  var dlg = null;
  function draw() {
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.id = 'ne-dlg'; dlg.setAttribute('data-noshare', ''); document.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    }
    var s = ED.s, ph = ED.photos.map(function (p, i) {
      return '<div class="ne-pc"><span class="mp-th"><button type="button" class="mp-open" data-g="ne-ed" data-i="' + i + '"><img data-pid="' + esc(p.t || p.f) + '" alt=""></button><button type="button" class="mp-x" data-nx="' + i + '" aria-label="사진 빼기">×</button></span><input type="text" data-ncap="' + i + '" value="' + esc(p.c || '') + '" placeholder="사진 설명 (안 써도 돼요)" maxlength="80"></div>';
    }).join('');
    PH().thumbs(ED.photos, 'ne-ed');
    dlg.innerHTML = '<form id="ne-f" autocomplete="off"><h2>✏️ 노트 고치기 <small style="font-weight:500;color:#756e65">' + esc(s.owner || '거믄') + ' · ' + esc(s.date) + '</small></h2>' +
      '<div class="ne-row"><span class="ne-hint">고치는 사람</span><span class="ne-seg">' + ['거믄', '힌'].map(function (w) { return '<button type="button" data-nwho="' + w + '" class="' + (ED.me === w ? 'on' : '') + '">' + w + '</button>'; }).join('') + '</span></div>' +
      '<div><label for="ne-title">제목</label><input type="text" id="ne-title" maxlength="100" value="' + esc(ED.t.title) + '"></div>' +
      '<div><label for="ne-lead">한 줄 요약</label><textarea id="ne-lead" rows="2" maxlength="600">' + esc(ED.t.lead) + '</textarea></div>' +
      '<div><label for="ne-tags">태그 <span class="ne-hint" style="font-weight:400">쉼표로 나눠요</span></label><input type="text" id="ne-tags" maxlength="200" value="' + esc(ED.t.tags) + '"></div>' +
      '<div><label for="ne-body">본문</label><textarea id="ne-body" maxlength="20000">' + esc(ED.t.body) + '</textarea><div class="ne-hint">## 작은 제목 · - 목록 · **굵게** 로 꾸밀 수 있어요. 원래 노트의 낱말 뜻풀이 점선은 글을 고치면 사라질 수 있어요.</div></div>' +
      '<div><label>덧붙인 사진</label><div id="ne-ph">' + ph + '</div><button type="button" class="mp-add" id="ne-pick"' + (busy ? ' disabled' : '') + '><b>＋</b>사진 추가</button><div class="ne-hint" id="ne-busy">' + esc(busy) + '</div></div>' +
      '<div id="ne-msg">' + esc(ED.msg || '') + '</div>' +
      '<div class="ne-act">' + (ED.had ? '<button type="button" class="rs" data-nact="reset">원래대로</button>' : '') + '<button type="button" data-nact="cancel">취소</button><button type="submit" class="go">저장</button></div></form>';
    PH().fill(dlg);
  }
  function grab() {
    if (!dlg || !ED) return;
    var g = function (id) { var e = dlg.querySelector(id); return e ? e.value : null; };
    var t = g('#ne-title'); if (t == null) return;
    ED.t = { title: t, lead: g('#ne-lead'), tags: g('#ne-tags'), body: g('#ne-body') };
  }
  function open(key) {
    var s = SES[key]; if (!s) return;
    var E = EDITS[key], o = orig(s), v = view(s), f = E ? String(E.fields || '').split(',') : [];
    ED = { s: s, key: key, me: me(), msg: '', had: !!E, base: E ? E.updated : '', photos: (E ? E.photos || [] : []).slice(),
      t: { title: v.title || '', lead: v.lead || '', tags: v.tags.join(', '), body: f.indexOf('body') >= 0 ? E.body : o.body }, o: o };
    draw(); dlg.showModal();
  }
  function doSave(photosOnly) {
    var s = ED.s, o = ED.o, t = ED.t, f = [];
    ['title', 'lead', 'tags', 'body'].forEach(function (k) { if (String(t[k]).trim() !== String(o[k]).trim()) f.push(k); });
    var item = { key: ED.key, fields: f.join(','), title: t.title, lead: t.lead, tags: t.tags, body: t.body, photos: ED.photos, editor: ED.me, base: ED.base };
    var go;
    if (!f.length && !ED.photos.length) go = ED.had ? post({ action: 'ndel', key: ED.key, editor: ED.me }).then(function (j) { if (j && j.ok) { delete EDITS[ED.key]; return { ok: true, gone: true }; } return j; }) : Promise.resolve({ ok: true, gone: true });
    else go = post({ action: 'nsave', key: ED.key, item: item }).then(function (j) { if (j && j.ok && j.item) EDITS[ED.key] = j.item; return j; });
    return go;
  }
  function finish(j, fromDlg) {
    if (j && j.ok) { save(); if (fromDlg && dlg.open) dlg.close(); ED = null; onChange(); toast('저장했어요'); return; }
    var m = j && j.err === 'conflict' ? '다른 기기에서 먼저 고쳤어요. 창을 닫고 다시 열어 주세요.' : j && j.err === 'code' ? '가족 암호가 맞지 않아요.' : j && j.err === 'text' ? '바꾼 곳이 없어요.' : '저장하지 못했어요. 인터넷 연결을 확인해 주세요.';
    if (j && j.err === 'conflict' && j.item) { EDITS[ED.key] = j.item; save(); }
    if (fromDlg && ED) { ED.msg = m; grab(); draw(); } else toast(m);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button'); if (!b) return;
    if (b.dataset.ne === 'edit') { open(b.dataset.nk); return; }
    if (b.dataset.ne === 'photo') {
      var key = b.dataset.nk, s = SES[key]; if (!s || !PH()) return;
      var E = EDITS[key], have = E ? (E.photos || []).length : 0;
      PH().pick(12, have, function (m) { if (m) toast(m); }, function (add) {
        if (!add.length) return;
        var o = orig(s), v = view(s), f = E ? String(E.fields || '').split(',').filter(Boolean) : [];
        ED = { s: s, key: key, me: me(), had: !!E, base: E ? E.updated : '', photos: ((E && E.photos) || []).concat(add), o: o,
          t: { title: f.indexOf('title') >= 0 ? E.title : o.title, lead: f.indexOf('lead') >= 0 ? E.lead : o.lead, tags: f.indexOf('tags') >= 0 ? E.tags : o.tags, body: f.indexOf('body') >= 0 ? E.body : o.body } };
        doSave().then(function (j) { finish(j, false); }, function () { finish(null, false); });
      });
      return;
    }
    if (!ED || !dlg || !dlg.contains(b)) return;
    if (b.dataset.nwho) { grab(); ED.me = b.dataset.nwho; ls.set('mokgagu_write_who', ED.me); draw(); return; }
    if (b.dataset.nx != null) { grab(); ED.photos.splice(+b.dataset.nx, 1); draw(); return; }
    if (b.id === 'ne-pick') {
      grab();
      PH().pick(12, ED.photos.length, function (m) { busy = /올리는 중/.test(m) ? m : ''; if (m && !busy) toast(m); var h = dlg.querySelector('#ne-busy'); if (h) h.textContent = busy; var pb = dlg.querySelector('#ne-pick'); if (pb) pb.disabled = !!busy; },
        function (add) { if (!ED) return; busy = ''; ED.photos = ED.photos.concat(add); grab(); draw(); });
      return;
    }
    if (b.dataset.nact === 'cancel') { dlg.close(); ED = null; return; }
    if (b.dataset.nact === 'reset') {
      if (!confirm('이 노트를 원래대로 되돌릴까요? 고친 글과 덧붙인 사진이 빠져요.')) return;
      post({ action: 'ndel', key: ED.key, editor: ED.me }).then(function (j) { if (j && j.ok) { delete EDITS[ED.key]; } finish(j, true); }, function () { finish(null, true); });
    }
  });
  document.addEventListener('input', function (e) { if (e.target && e.target.dataset && e.target.dataset.ncap != null && ED) { var p = ED.photos[+e.target.dataset.ncap]; if (p) p.c = e.target.value; } });
  document.addEventListener('submit', function (e) {
    if (!e.target || e.target.id !== 'ne-f') return; e.preventDefault(); if (!ED) return; grab();
    var go = dlg.querySelector('.go'); if (go) { go.disabled = true; go.textContent = '저장 중…'; }
    doSave().then(function (j) { finish(j, true); }, function () { finish(null, true); });
  });

  window.MOKGAGU_NOTEEDIT = { load: load, view: view, bar: bar, photos: photos, after: after };
})();

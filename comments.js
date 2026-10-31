/* 기물 이야기(코멘트) — 모든 도록 페이지에서 기물 사진 창을 열면 그 아래에 코멘트를 남기고 볼 수 있다.
   - 거믄·힌 : 가족 암호를 넣어야 쓴다. 기본은 공개(누구나 봄), [비공개]를 고르면 가족만 본다.
   - 벗     : 암호 없이 이름만 적고 쓴다. 벗의 글은 늘 공개. 자기 글은 쓴 기기에서 지울 수 있다.
   - 저장   : 구글 시트(Apps Script 웹 앱). 노트북·아이패드·휴대폰 어디서나 같은 코멘트를 본다.
   - 표시   : 목록 사진 오른쪽 위에 거믄이 쓴 기물은 검은 별, 힌이 쓴 기물은 흰 별, 벗만 쓴 기물은 회색 말풍선.
   - 모아보기: comments.html
   기물 열쇠(cid)는 '<도록>/<기물 id>' 꼴이며, 각 페이지가 카드에 data-cid, 사진 창 dialog에 dataset.cid 로 적어 둔다. */
(function () {
  var API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  var K_CODE = 'mokgagu_cm_code', K_WHO = 'mokgagu_cm_who', K_NAME = 'mokgagu_cm_name', K_LOCAL = 'mokgagu_cm_local_v2', K_CACHE = 'mokgagu_cm_cache_v2', K_FAM = 'mokgagu_cm_fam', K_KEYS = 'mokgagu_cm_keys';
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
    json: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  };
  var FAMW = { '거믄': 1, '힌': 1 };
  var all = ls.json(K_CACHE, []);          // 시트에서 받아 온 코멘트
  var local = ls.json(K_LOCAL, []);        // 아직 시트에 못 올린 코멘트(인터넷이 끊겼을 때)
  var keys = ls.json(K_KEYS, {});          // 벗으로 쓴 글을 지울 수 있는 열쇠 {id: key}
  var fam = ls.get(K_FAM, '') === '1' && !!ls.get(K_CODE, '');
  var state = { loading: false, err: '', codeErr: '', pub: true };
  var subs = [];
  function list() { return all.concat(local).filter(function (c) { return !c.del; }); }
  function byCid(cid) { return list().filter(function (c) { return c.cid === cid; }).sort(function (a, b) { return a.t < b.t ? -1 : 1; }); }
  function isPub(c) { return c.author === '벗' || !!c.pub; }
  function summary() {
    var m = {};
    list().forEach(function (c) { var s = m[c.cid] = m[c.cid] || { n: 0, g: 0, h: 0, b: 0 }; s.n++; if (c.author === '거믄') s.g++; else if (c.author === '힌') s.h++; else s.b++; });
    return m;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function when(t) { var d = new Date(t); if (isNaN(d)) return ''; var p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '. ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
  function changed() { paint(); mark(); subs.forEach(function (f) { try { f(); } catch (e) {} }); }
  function save() { ls.set(K_CACHE, JSON.stringify(all)); ls.set(K_LOCAL, JSON.stringify(local)); ls.set(K_KEYS, JSON.stringify(keys)); }

  /* ── 시트와 주고받기 ── */
  function apiGet() {
    var code = ls.get(K_CODE, '');
    state.loading = true; paint();
    return (code ? fetch(API, { method: 'POST', body: JSON.stringify({ action: 'list', code: code }) }) : fetch(API + '?action=list', { cache: 'no-store' })).then(function (r) { return r.json(); }).then(function (j) {
      state.loading = false;
      if (!j.ok) { state.err = '코멘트를 불러오지 못했어요.'; return; }
      fam = !!j.fam; ls.set(K_FAM, fam ? '1' : '');
      if (j.bad) { ls.del(K_CODE); state.codeErr = '가족 암호가 맞지 않아요.'; }
      state.err = ''; all = j.list || []; save();
      return flush();
    }).catch(function () { state.loading = false; state.err = '인터넷 연결을 확인해 주세요. (저장해 둔 코멘트를 보여 드려요)'; }).then(changed);
  }
  function apiPost(body) {
    var code = ls.get(K_CODE, ''); if (code) body.code = code;
    return fetch(API, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.json(); });
  }
  function flush() {
    if (!local.length) return Promise.resolve();
    return local.slice().reduce(function (p, c) {
      return p.then(function () {
        if (FAMW[c.author] && !fam) return;
        return apiPost({ action: 'add', c: c }).then(function (j) {
          if (j && j.ok) { local = local.filter(function (x) { return x.id !== c.id; }); delete c.pending; all.push(c); }
        }).catch(function () {});
      });
    }, Promise.resolve()).then(save);
  }
  function add(c) {
    all.push(c); changed();
    return apiPost({ action: 'add', c: c }).then(function (j) {
      if (!j.ok) throw j;
      save(); return true;
    }).catch(function (j) {
      all = all.filter(function (x) { return x.id !== c.id; });
      if (j && j.err === 'code') { fam = false; ls.set(K_FAM, ''); ls.del(K_CODE); state.codeErr = '가족 암호를 다시 넣어 주세요.'; }
      else if (j && j.err) state.err = '남기지 못했어요. 이름과 내용을 확인해 주세요.';
      else { c.pending = 1; local.push(c); state.err = '지금은 시트에 올리지 못해 이 기기에 저장해 두었어요. 다음에 자동으로 올라가요.'; }
      save(); changed(); return false;
    });
  }
  function canDel(c) { return fam || c.pending || !!keys[c.id]; }
  // 고치기: 거믄·힌의 글은 가족 암호가 있을 때, 벗의 글은 쓴 기기에서만
  function canEdit(c) { return !!c.pending || !!keys[c.id] || (fam && !!FAMW[c.author]); }
  function edit(id, text) {
    text = String(text || '').trim(); if (!text) return Promise.resolve(false);
    var lc = local.filter(function (x) { return x.id === id; })[0];
    if (lc) { lc.text = text; lc.edited = new Date().toISOString(); save(); changed(); return Promise.resolve(true); }
    var c = all.filter(function (x) { return x.id === id; })[0]; if (!c) return Promise.resolve(false);
    var was = { text: c.text, edited: c.edited };
    c.text = text.slice(0, FAMW[c.author] ? 4000 : 1000); c.edited = new Date().toISOString(); changed();
    return apiPost({ action: 'edit', id: id, text: c.text, key: keys[id] || '' }).then(function (j) {
      if (j && j.ok) { save(); return true; }
      if (j && j.err === 'action') return editByReplace(c, was);   // 시트 쪽이 아직 '고치기'를 모를 때: 새 글로 올리고 옛 글은 지움
      throw j;
    }).catch(function () { c.text = was.text; c.edited = was.edited; state.err = '고치지 못했어요. 잠시 뒤에 다시 해 주세요.'; changed(); return false; });
  }
  function editByReplace(c, was) {
    var n = { id: uid(), cid: c.cid, author: c.author, name: c.name || '', text: c.text, t: c.t, page: c.page || '', pub: !!c.pub, edited: c.edited };
    if (!FAMW[c.author]) { n.key = uid() + uid(); keys[n.id] = n.key; }
    return apiPost({ action: 'add', c: n }).then(function (j) {
      if (!j || !j.ok) throw j;
      var oldKey = keys[c.id] || '';
      all = all.filter(function (x) { return x.id !== c.id; }); all.push(n); delete keys[c.id]; save(); changed();
      apiPost({ action: 'del', id: c.id, key: oldKey }).catch(function () {});
      return true;
    });
  }
  function del(id) {
    if (local.some(function (x) { return x.id === id; })) { local = local.filter(function (x) { return x.id !== id; }); save(); changed(); return; }
    all.forEach(function (x) { if (x.id === id) x.del = 1; }); changed();
    apiPost({ action: 'del', id: id, key: keys[id] || '' }).then(function (j) { if (!j.ok) throw j; all = all.filter(function (x) { return x.id !== id; }); delete keys[id]; save(); }).catch(function () {
      all.forEach(function (x) { if (x.id === id) delete x.del; }); state.err = '지우지 못했어요. 잠시 뒤에 다시 해 주세요.'; changed();
    });
  }
  function setPub(id, pub) {
    var c = all.filter(function (x) { return x.id === id; })[0]; if (!c) return;
    var was = !!c.pub; c.pub = !!pub; changed();
    apiPost({ action: 'pub', id: id, pub: pub ? 1 : 0 }).then(function (j) { if (!j.ok) throw j; save(); }).catch(function () { c.pub = was; state.err = '바꾸지 못했어요. 잠시 뒤에 다시 해 주세요.'; changed(); });
  }
  function login(code) { ls.set(K_CODE, code); state.codeErr = ''; return apiGet().then(function () { if (!fam) state.codeErr = '가족 암호가 맞지 않아요.'; changed(); return fam; }); }
  function logout() { ls.del(K_CODE); ls.set(K_FAM, ''); fam = false; if (FAMW[ls.get(K_WHO, '')]) ls.set(K_WHO, '벗'); return apiGet(); }

  /* ── 모양 ── */
  var css = document.createElement('style');
  css.textContent = [
    '.cm{margin-top:8px;border-top:1px solid #e5e1da;padding-top:10px;font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;text-align:left}',
    '.cm h4{margin:0 0 6px;font-size:15px;font-weight:800;color:#1d1b18;display:flex;align-items:center;gap:6px}',
    '.cm h4 small{font-weight:400;color:#8a837a;font-size:12px}.cm h4 a{margin-left:auto;font-size:12px;font-weight:700;color:#6b665e;text-decoration:none;border:1px solid #d9d4cc;border-radius:999px;padding:2px 9px}.cm h4 a:hover{background:#f4f2ee}',
    '.cm-list{display:flex;flex-direction:column;gap:10px;margin:0 0 12px}',
    '.cm-it{border:1px solid #ece8e1;border-radius:10px;padding:9px 11px;background:#fbfaf8}.cm-it.priv{background:#f6f5f2;border-style:dashed}',
    '.cm-hd{display:flex;align-items:center;gap:7px;font-size:12px;color:#8a837a;margin-bottom:4px;flex-wrap:wrap}',
    '.cm-who{display:inline-block;min-width:2.9em;text-align:center;font-weight:900;font-size:12px;padding:1px 7px;border:1.5px solid #111;line-height:1.35}',
    '.cm-who.g{background:#111;color:#fff}.cm-who.h{background:#fff;color:#111}.cm-who.o{background:#f1efeb;color:#3b3833;border-color:#bdb6aa;font-weight:700}',
    '.cm-vis{font-size:11px;font-weight:700;border-radius:999px;padding:1px 7px;border:1px solid #d9d4cc;color:#6b665e;background:#fff}.cm-vis.pub{border-color:#9db8a4;color:#2f6b45;background:#f1f8f3}',
    '.cm-tx{font-size:14px;line-height:1.7;color:#2b2825;white-space:pre-wrap;word-break:break-word}',
    '.cm-act{margin-left:auto;display:inline-flex;gap:8px}.cm-act button{border:0;background:none;color:#a0988e;font-size:12px;cursor:pointer;padding:0}.cm-act button:hover{color:#1d1b18}.cm-act button.cm-del:hover{color:#8a2f22}',
    '.cm-sure{margin-left:auto;font-size:12px;color:#8a2f22}.cm-sure button{border:1px solid #e0c7c1;background:#fff;border-radius:6px;font-size:12px;margin-left:4px;cursor:pointer;padding:1px 7px}',
    '.cm-empty{font-size:13px;color:#8a837a;margin:0 0 10px}',
    '.cm-form{display:flex;flex-direction:column;gap:6px}',
    '.cm-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    '.cm-pick{display:inline-flex;border:1px solid #d9d4cc;border-radius:999px;overflow:hidden}',
    '.cm-pick button{border:0;background:#fff;font:inherit;font-size:13px;padding:6px 13px;cursor:pointer;color:#3b3833}',
    '.cm-pick button+button{border-left:1px solid #d9d4cc}',
    '.cm-pick button.on[data-w="거믄"]{background:#111;color:#fff;font-weight:800}.cm-pick button.on[data-w="힌"]{background:#fff;color:#111;font-weight:800;box-shadow:inset 0 0 0 2px #111}.cm-pick button.on[data-w="벗"]{background:#6b665e;color:#fff;font-weight:700}',
    '.cm-pick.vis button.on{background:#1d1b18;color:#fff;font-weight:800}.cm-pick.vis button.on[data-v="pub"]{background:#2f6b45}',
    '.cm input[type=text],.cm input[type=password],.cm textarea{font:inherit;font-size:16px;border:1px solid #d9d4cc;border-radius:8px;padding:8px 10px;background:#fff;color:#1d1b18;width:100%;box-sizing:border-box}',
    '.cm textarea{min-height:52px;resize:vertical;line-height:1.6}',
    '@media (min-width:761px){.cm textarea.cm-text{font-size:14px}}',
    '.cm .cm-edit{margin-top:4px}.cm-go.ghost{background:#fff;color:#6b665e;border:1px solid #d9d4cc;margin-right:6px}',
    '.cm-name{max-width:160px}',
    '.cm-go{align-self:flex-end;font:inherit;font-size:14px;font-weight:700;border:0;border-radius:8px;background:#1d1b18;color:#fff;padding:8px 16px;cursor:pointer}',
    '.cm-go:disabled{opacity:.4;cursor:default}',
    '.cm-note{font-size:12px;color:#8a837a;line-height:1.55;margin:0}.cm-err{font-size:12.5px;color:#8a2f22;margin:0 0 8px}',
    '.cm-out{border:0;background:none;color:#a0988e;font-size:11.5px;cursor:pointer;padding:0;text-decoration:underline;align-self:flex-start}',
    /* 목록 사진 위 별 */
    '.r-item[data-cid],.lk-gal button[data-cid],.grid .card[data-cid],#rv .rv-it[data-cid],.cl-card[data-cid]{position:relative}',
    '.cm-stars{position:absolute;top:5px;right:5px;z-index:4;display:inline-flex;gap:1px;align-items:center;pointer-events:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}',
    '.cm-stars svg{width:20px;height:20px;display:block}',
    '.cm-stars .bub{display:inline-flex;align-items:center;gap:2px;font:800 10px/1 system-ui,sans-serif;background:#8a837a;color:#fff;border-radius:999px;padding:3px 6px 3px 5px}.cm-stars .bub svg{width:10px;height:10px}',
    '#rv .rv-it .cm-stars{top:1px;right:1px}#rv .rv-it .cm-stars svg{width:13px;height:13px}#rv .rv-it .cm-stars .bub{padding:2px 3px;font-size:8px}',
    '@media print{.cm,.cm-stars{display:none}}'
  ].join('');
  document.head.appendChild(css);
  var BUB = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>';
  var STAR_P = 'M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z';
  var STAR_G = '<svg viewBox="0 0 24 24" aria-label="거믄"><path d="' + STAR_P + '" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var STAR_H = '<svg viewBox="0 0 24 24" aria-label="힌"><path d="' + STAR_P + '" fill="#fff" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  function starsHTML(s) { return (s.g ? STAR_G : '') + (s.h ? STAR_H : '') + (!s.g && !s.h && s.b ? '<span class="bub">' + BUB + s.b + '</span>' : ''); }

  /* ── 코멘트 창: 사진 창(dialog) 안의 설명 칸 아래에 붙인다 ── */
  var curDlg = null, sureId = '', editId = '';
  function infoBox(d) {
    return d.querySelector('#d-info') || d.querySelector('.d-info') || (d.querySelector('dl') && d.querySelector('dl').parentElement) || d.querySelector('.d-body') || d;
  }
  function who() { var w = ls.get(K_WHO, ''); if (w === '다른 사람') w = '벗'; if (!w) w = fam ? '거믄' : '벗'; return w; }
  function itemHTML(c) {
    var cls = c.author === '거믄' ? 'g' : c.author === '힌' ? 'h' : 'o', label = FAMW[c.author] ? c.author : (c.name ? '벗 · ' + c.name : '벗');
    var pub = isPub(c), vis = FAMW[c.author] ? '<span class="cm-vis' + (pub ? ' pub' : '') + '">' + (pub ? '공개' : '🔒 비공개') + '</span>' : '';
    var tail;
    if (editId === c.id) {
      return '<div class="cm-it' + (pub ? '' : ' priv') + '"><div class="cm-hd"><span class="cm-who ' + cls + '">' + esc(label) + '</span>' + vis + '<span>고치는 중</span></div>' +
        '<textarea class="cm-edit" data-eid="' + esc(c.id) + '">' + esc(c.text) + '</textarea>' +
        '<div class="cm-row" style="justify-content:flex-end;margin-top:6px"><button type="button" class="cm-go ghost" data-ecancel="1">그만두기</button><button type="button" class="cm-go" data-esave="' + esc(c.id) + '">고친 내용 저장</button></div></div>';
    }
    if (sureId === c.id) tail = '<span class="cm-sure">지울까요?<button type="button" data-yes="' + esc(c.id) + '">예</button><button type="button" data-no="1">아니오</button></span>';
    else {
      var acts = '';
      if (canEdit(c)) acts += '<button type="button" data-edit="' + esc(c.id) + '">✎ 고치기</button>';
      if (fam && FAMW[c.author] && !c.pending) acts += '<button type="button" data-pub="' + esc(c.id) + '" data-to="' + (pub ? 0 : 1) + '">' + (pub ? '비공개로' : '공개하기') + '</button>';
      if (canDel(c)) acts += '<button type="button" class="cm-del" data-del="' + esc(c.id) + '">지우기</button>';
      tail = acts ? '<span class="cm-act">' + acts + '</span>' : '';
    }
    return '<div class="cm-it' + (pub ? '' : ' priv') + '"><div class="cm-hd"><span class="cm-who ' + cls + '">' + esc(label) + '</span>' + vis + '<span>' + esc(when(c.t)) + (c.edited ? ' · 고침' : '') + (c.pending ? ' · 이 기기에만 저장됨' : '') + '</span>' + tail + '</div><div class="cm-tx">' + esc(c.text) + '</div></div>';
  }
  function panelHTML(cid) {
    var cs = byCid(cid), w = who();
    var h = '<h4>' + BUB.replace('<svg', '<svg width="16" height="16"') + ' 기물 이야기 <small>' + (cs.length ? cs.length + '개' : '') + '</small><a href="comments.html">모아보기 →</a></h4>';
    if (state.err) h += '<p class="cm-err">' + esc(state.err) + '</p>';
    if (state.loading && !cs.length) h += '<p class="cm-empty">불러오는 중…</p>';
    h += cs.length ? '<div class="cm-list">' + cs.map(itemHTML).join('') + '</div>' : (state.loading ? '' : '<p class="cm-empty">아직 남긴 이야기가 없어요. 이 기물에 대한 생각을 적어 보세요.</p>');
    h += '<div class="cm-form"><div class="cm-row"><span class="cm-pick" role="radiogroup" aria-label="누가 남기나요">' +
      ['거믄', '힌', '벗'].map(function (x) { return '<button type="button" role="radio" aria-checked="' + (w === x) + '" class="' + (w === x ? 'on' : '') + '" data-w="' + x + '">' + x + '</button>'; }).join('') + '</span>';
    if (FAMW[w] && !fam) {
      h += '</div><p class="cm-note">거믄·힌은 <b>가족 암호</b>를 넣어야 쓸 수 있어요. 이 기기에 기억해 둡니다.</p>' +
        (state.codeErr ? '<p class="cm-err">' + esc(state.codeErr) + '</p>' : '') +
        '<div class="cm-row"><input type="password" class="cm-code" placeholder="가족 암호" autocomplete="off" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" style="max-width:200px"><button type="button" class="cm-go cm-codego">확인</button></div></div>';
      return h;
    }
    if (w === '벗') h += '<input type="text" class="cm-name" placeholder="이름" maxlength="30" value="' + esc(ls.get(K_NAME, '')) + '">';
    else h += '<span class="cm-pick vis" role="radiogroup" aria-label="누가 볼 수 있나요"><button type="button" data-v="priv" class="' + (state.pub ? '' : 'on') + '">🔒 비공개</button><button type="button" data-v="pub" class="' + (state.pub ? 'on' : '') + '">공개</button></span>';
    h += '</div><textarea class="cm-text" placeholder="이 기물에 대한 이야기를 남겨 주세요"></textarea>' +
      '<div class="cm-row" style="justify-content:flex-end">' +
      '<button type="button" class="cm-go cm-send">남기기</button></div>' +
      '</div>';
    return h;
  }
  function paint() {
    if (!curDlg || !curDlg.open) return;
    var cid = curDlg.dataset.cid; if (!cid) return;
    var box = infoBox(curDlg), p = box.querySelector(':scope > .cm');
    var keep = p && p.querySelector('.cm-text') ? p.querySelector('.cm-text').value : '';
    var keepEdit = p && p.querySelector('.cm-edit') ? p.querySelector('.cm-edit').value : null;
    var hadFocus = p && document.activeElement && p.contains(document.activeElement) && document.activeElement.classList.contains('cm-text');
    if (!p) { p = document.createElement('div'); p.className = 'cm'; box.appendChild(p); }
    p.dataset.cid = cid; p.innerHTML = panelHTML(cid);
    var ta = p.querySelector('.cm-text'); if (ta && keep && p.dataset.lastCid === cid) ta.value = keep;
    if (ta && hadFocus) ta.focus();
    var ed = p.querySelector('.cm-edit'); if (ed && keepEdit != null && p.dataset.lastCid === cid) ed.value = keepEdit;
    p.dataset.lastCid = cid;
  }
  document.addEventListener('click', function (e) {
    var p = e.target.closest && e.target.closest('.cm'); if (!p) return;
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.w) { ls.set(K_WHO, b.dataset.w); state.codeErr = ''; paint(); return; }
    if (b.dataset.v) { state.pub = b.dataset.v === 'pub'; paint(); return; }
    if (b.dataset.edit) { editId = b.dataset.edit; sureId = ''; paint(); var ed = p.querySelector('.cm-edit'); if (ed) { ed.focus(); ed.setSelectionRange(ed.value.length, ed.value.length); } return; }
    if (b.dataset.ecancel) { editId = ''; paint(); return; }
    if (b.dataset.esave) { var et = p.querySelector('.cm-edit'), eid = b.dataset.esave; if (!et || !et.value.trim()) { if (et) et.focus(); return; } var v2 = et.value; editId = ''; edit(eid, v2); return; }
    if (b.dataset.del) { sureId = b.dataset.del; editId = ''; paint(); return; }
    if (b.dataset.no) { sureId = ''; paint(); return; }
    if (b.dataset.yes) { var id = b.dataset.yes; sureId = ''; del(id); return; }
    if (b.dataset.pub) { setPub(b.dataset.pub, b.dataset.to === '1'); return; }
    if (b.classList.contains('cm-out')) { logout(); return; }
    if (b.classList.contains('cm-codego')) { var v = (p.querySelector('.cm-code').value || '').trim(); if (!v) return; b.disabled = true; login(v); return; }
    if (b.classList.contains('cm-send')) {
      var text = (p.querySelector('.cm-text').value || '').trim(); if (!text) { p.querySelector('.cm-text').focus(); return; }
      var w = who(), nm = '';
      if (w === '벗') { nm = ((p.querySelector('.cm-name') || {}).value || '').trim(); if (!nm) { p.querySelector('.cm-name').focus(); return; } ls.set(K_NAME, nm); }
      var c = { id: uid(), cid: p.dataset.cid, author: w, name: nm, text: text.slice(0, FAMW[w] ? 4000 : 1000), t: new Date().toISOString(), page: location.pathname.split('/').pop() || 'index.html', pub: w === '벗' ? true : state.pub };
      if (w === '벗') { c.key = uid() + uid(); keys[c.id] = c.key; }
      p.querySelector('.cm-text').value = ''; b.disabled = true; state.pub = true;
      add(c).then(function () { b.disabled = false; });
    }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.classList && e.target.classList.contains('cm-text')) { var s = e.target.closest('.cm').querySelector('.cm-send'); if (s) s.click(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.classList && e.target.classList.contains('cm-edit')) { var sv = e.target.closest('.cm').querySelector('[data-esave]'); if (sv) sv.click(); }
    if (e.key === 'Escape' && e.target.classList && e.target.classList.contains('cm-edit')) { e.preventDefault(); e.stopPropagation(); editId = ''; paint(); }
    if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('cm-code')) { e.preventDefault(); e.target.closest('.cm').querySelector('.cm-codego').click(); }
  });
  // 사진 창 안에서 누르는 키(화살표 등)가 페이지의 이전·다음 넘기기로 새지 않게
  document.addEventListener('keydown', function (e) { if (e.target.closest && e.target.closest('.cm') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) e.stopPropagation(); }, true);

  function watchDialogs() {
    document.querySelectorAll('dialog').forEach(function (d) {
      if (d.dataset.cmWatch) return; d.dataset.cmWatch = '1';
      var go = function () { if (d.open) { curDlg = d; sureId = ''; editId = ''; setTimeout(paint, 0); } };
      new MutationObserver(go).observe(d, { attributes: true, attributeFilter: ['open', 'data-cid'] });
      new MutationObserver(function () { if (d.open && d.dataset.cid && !infoBox(d).querySelector(':scope > .cm')) setTimeout(paint, 0); }).observe(d, { childList: true, subtree: true });
    });
  }

  /* ── 코멘트가 있는 기물 표시: 거믄 검은 별 · 힌 흰 별 · 벗 회색 말풍선 ── */
  var markT = 0;
  function mark() {
    var m = summary();
    document.querySelectorAll('[data-cid]').forEach(function (el) {
      if (el.tagName === 'DIALOG' || el.classList.contains('cm') || el.dataset.noStar) return;
      var s = m[el.dataset.cid], b = el.querySelector(':scope > .cm-stars');
      if (!s) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement('span'); b.className = 'cm-stars'; el.appendChild(b); }
      var html = starsHTML(s); if (b.innerHTML !== html) b.innerHTML = html;
      b.title = '기물 이야기 ' + s.n + '개' + (s.g ? ' · 거믄' : '') + (s.h ? ' · 힌' : '') + (s.b ? ' · 벗 ' + s.b : '');
    });
  }
  function markSoon() { clearTimeout(markT); markT = setTimeout(mark, 120); }

  function start() {
    watchDialogs();
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (t.closest && (t.closest('.cm') || t.closest('.cm-stars'))) continue; markSoon(); watchDialogs(); return; }
    }).observe(document.body, { childList: true, subtree: true });
    mark();
    apiGet();
    window.addEventListener('storage', function (e) { if (e.key === K_LOCAL || e.key === K_CACHE) { all = ls.json(K_CACHE, []); local = ls.json(K_LOCAL, []); changed(); } });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') apiGet(); });
  }
  window.MOKGAGU_COMMENTS = {
    reload: apiGet, list: list, isFam: function () { return fam; }, isPub: isPub, when: when, esc: esc,
    starsHTML: function (author) { return author === '거믄' ? STAR_G : author === '힌' ? STAR_H : '<span class="bub">' + BUB + '</span>'; },
    login: login, logout: logout, setPub: setPub, del: del, canDel: canDel, edit: edit, canEdit: canEdit,
    onChange: function (f) { subs.push(f); }, state: state
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* 좋아요(빨간 별)와 「누구세요?」는 likes.js — 기물 이야기가 붙는 모든 페이지에 함께 불러온다 */
(function () { if (document.querySelector('script[src$="likes.js"]')) return; var s = document.createElement('script'); s.src = 'likes.js?v=20261029e'; s.defer = true; document.head.appendChild(s); })();

/* 방문자 수(오늘/누적)는 visit.js */
(function () { if (document.querySelector('script[src^="visit.js"]')) return; var s = document.createElement('script'); s.src = 'visit.js?v=20261019'; s.defer = true; document.head.appendChild(s); })();
/* 사진 크게 보기(전체 화면)는 zoom.js */
(function () { if (document.querySelector('script[src^="zoom.js"]')) return; var s = document.createElement('script'); s.src = 'zoom.js?v=20261024'; s.defer = true; document.head.appendChild(s); })();

/* 기물 이야기(코멘트) — 모든 도록 페이지에서 기물 사진 창을 열면 그 아래에 코멘트를 남기고 볼 수 있다.
   - 누가: 거믄(MONO) · 힌(아내) · 다른 사람(이름 직접 입력)
   - 어디에: 구글 시트(Apps Script 웹 앱)에 저장해 노트북·아이패드·휴대폰 어디서나 같은 코멘트를 본다.
             API 주소가 비어 있으면 이 기기(브라우저)에만 임시로 저장했다가, 주소를 넣으면 자동으로 시트에 올린다.
   - 표시: 코멘트가 있는 기물은 목록 사진 오른쪽 위에 말풍선과 개수를 단다.
   기물 열쇠(cid)는 '<도록>/<기물 id>' 꼴이며, 각 페이지가 카드에 data-cid, 사진 창 dialog에 dataset.cid 로 적어 둔다. */
(function () {
  var API = '';   // ← 구글 Apps Script 웹 앱 주소 (https://script.google.com/macros/s/…/exec)
  var K_CODE = 'mokgagu_cm_code', K_WHO = 'mokgagu_cm_who', K_NAME = 'mokgagu_cm_name', K_LOCAL = 'mokgagu_cm_local_v1', K_CACHE = 'mokgagu_cm_cache_v1';
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    json: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  };
  var all = ls.json(K_CACHE, []);          // 시트에서 받아 온 코멘트 (마지막 것 보관)
  var local = ls.json(K_LOCAL, []);        // 아직 시트에 못 올린 코멘트
  var state = { loading: false, err: '', needCode: false };
  function list() { return all.concat(local); }
  function byCid(cid) { return list().filter(function (c) { return c.cid === cid && !c.del; }).sort(function (a, b) { return a.t < b.t ? -1 : 1; }); }
  function counts() { var m = {}; list().forEach(function (c) { if (!c.del) { (m[c.cid] = m[c.cid] || { n: 0, who: {} }).n++; m[c.cid].who[c.author] = 1; } }); return m; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function when(t) { var d = new Date(t); if (isNaN(d)) return ''; var p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '. ' + p(d.getHours()) + ':' + p(d.getMinutes()); }

  /* ── 시트와 주고받기 ── */
  function apiGet() {
    if (!API) return Promise.resolve();
    var code = ls.get(K_CODE, '');
    if (!code) { state.needCode = true; return Promise.resolve(); }
    state.loading = true; paint();
    return fetch(API + '?action=list&code=' + encodeURIComponent(code), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      state.loading = false;
      if (!j.ok) { if (j.err === 'code') { state.needCode = true; state.err = '가족 암호가 맞지 않아요.'; } else state.err = '코멘트를 불러오지 못했어요.'; return; }
      state.needCode = false; state.err = ''; all = j.list || []; ls.set(K_CACHE, JSON.stringify(all));
      return flush();
    }).catch(function () { state.loading = false; state.err = '인터넷 연결을 확인해 주세요. (저장해 둔 코멘트를 보여 드려요)'; }).then(function () { paint(); mark(); });
  }
  function apiPost(body) {
    body.code = ls.get(K_CODE, '');
    return fetch(API, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.json(); });
  }
  function flush() {   // 기기에만 있던 코멘트를 시트로
    if (!API || !local.length || !ls.get(K_CODE, '')) return Promise.resolve();
    var todo = local.slice();
    return todo.reduce(function (p, c) {
      return p.then(function () {
        return apiPost({ action: 'add', c: c }).then(function (j) {
          if (j && j.ok) { local = local.filter(function (x) { return x.id !== c.id; }); all.push(c); }
        }).catch(function () {});
      });
    }, Promise.resolve()).then(function () { ls.set(K_LOCAL, JSON.stringify(local)); ls.set(K_CACHE, JSON.stringify(all)); });
  }
  function add(c) {
    if (!API) { local.push(c); ls.set(K_LOCAL, JSON.stringify(local)); paint(); mark(); return Promise.resolve(true); }
    all.push(c); paint(); mark();
    return apiPost({ action: 'add', c: c }).then(function (j) {
      if (!j.ok) throw j;
      ls.set(K_CACHE, JSON.stringify(all)); return true;
    }).catch(function (j) {
      all = all.filter(function (x) { return x.id !== c.id; });
      if (j && j.err === 'code') { state.needCode = true; state.err = '가족 암호가 맞지 않아요.'; }
      else { local.push(c); ls.set(K_LOCAL, JSON.stringify(local)); state.err = '지금은 시트에 올리지 못해 이 기기에 저장해 두었어요. 다음에 자동으로 올라가요.'; }
      paint(); mark(); return false;
    });
  }
  function del(id) {
    var inLocal = local.some(function (x) { return x.id === id; });
    if (inLocal || !API) { local = local.filter(function (x) { return x.id !== id; }); ls.set(K_LOCAL, JSON.stringify(local)); paint(); mark(); return; }
    all.forEach(function (x) { if (x.id === id) x.del = 1; }); ls.set(K_CACHE, JSON.stringify(all)); paint(); mark();
    apiPost({ action: 'del', id: id }).then(function (j) { if (!j.ok) throw j; }).catch(function () {
      all.forEach(function (x) { if (x.id === id) delete x.del; }); state.err = '지우지 못했어요. 잠시 뒤에 다시 해 주세요.'; paint(); mark();
    });
  }

  /* ── 모양 ── */
  var css = document.createElement('style');
  css.textContent = [
    '.cm{margin-top:18px;border-top:1px solid #e5e1da;padding-top:14px;font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;text-align:left}',
    '.cm h4{margin:0 0 10px;font-size:15px;font-weight:800;color:#1d1b18;display:flex;align-items:center;gap:6px}',
    '.cm h4 small{font-weight:400;color:#8a837a;font-size:12px}',
    '.cm-list{display:flex;flex-direction:column;gap:10px;margin:0 0 12px}',
    '.cm-it{border:1px solid #ece8e1;border-radius:10px;padding:9px 11px;background:#fbfaf8}',
    '.cm-hd{display:flex;align-items:center;gap:8px;font-size:12px;color:#8a837a;margin-bottom:4px;flex-wrap:wrap}',
    '.cm-who{display:inline-block;min-width:2.9em;text-align:center;font-weight:900;font-size:12px;padding:1px 7px;border:1.5px solid #111;line-height:1.35}',
    '.cm-who.g{background:#111;color:#fff}.cm-who.h{background:#fff;color:#111}.cm-who.o{background:#f1efeb;color:#3b3833;border-color:#bdb6aa;font-weight:700}',
    '.cm-tx{font-size:14px;line-height:1.7;color:#2b2825;white-space:pre-wrap;word-break:break-word}',
    '.cm-del{margin-left:auto;border:0;background:none;color:#a0988e;font-size:12px;cursor:pointer;padding:0}',
    '.cm-del:hover{color:#8a2f22}.cm-sure{margin-left:auto;font-size:12px;color:#8a2f22}.cm-sure button{border:1px solid #e0c7c1;background:#fff;border-radius:6px;font-size:12px;margin-left:4px;cursor:pointer;padding:1px 7px}',
    '.cm-empty{font-size:13px;color:#8a837a;margin:0 0 10px}',
    '.cm-form{display:flex;flex-direction:column;gap:8px}',
    '.cm-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    '.cm-pick{display:inline-flex;border:1px solid #d9d4cc;border-radius:999px;overflow:hidden}',
    '.cm-pick button{border:0;background:#fff;font:inherit;font-size:13px;padding:6px 12px;cursor:pointer;color:#3b3833}',
    '.cm-pick button+button{border-left:1px solid #d9d4cc}',
    '.cm-pick button.on[data-w="거믄"]{background:#111;color:#fff;font-weight:800}.cm-pick button.on[data-w="힌"]{background:#fff;color:#111;font-weight:800;box-shadow:inset 0 0 0 2px #111}.cm-pick button.on[data-w="다른 사람"]{background:#6b665e;color:#fff;font-weight:700}',
    '.cm input[type=text],.cm input[type=password],.cm textarea{font:inherit;font-size:14px;border:1px solid #d9d4cc;border-radius:8px;padding:8px 10px;background:#fff;color:#1d1b18;width:100%;box-sizing:border-box}',
    '.cm textarea{min-height:76px;resize:vertical;line-height:1.6}',
    '.cm-name{max-width:160px}',
    '.cm-go{align-self:flex-end;font:inherit;font-size:14px;font-weight:700;border:0;border-radius:8px;background:#1d1b18;color:#fff;padding:8px 16px;cursor:pointer}',
    '.cm-go:disabled{opacity:.4;cursor:default}',
    '.cm-note{font-size:12px;color:#8a837a;line-height:1.55}.cm-err{font-size:12.5px;color:#8a2f22}',
    /* 목록 사진 위 표시 */
    '.r-item[data-cid],.lk-gal button[data-cid],.grid .card[data-cid],#rv .rv-it[data-cid]{position:relative}',
    '.cm-badge{position:absolute;top:6px;right:6px;z-index:4;display:inline-flex;align-items:center;gap:3px;font:800 11px/1 system-ui,sans-serif;background:#111;color:#fff;border-radius:999px;padding:4px 7px 4px 6px;box-shadow:0 1px 4px rgba(0,0,0,.25);pointer-events:none}',
    '.cm-badge svg{width:11px;height:11px}',
    '.cm-badge.h{background:#fff;color:#111;box-shadow:inset 0 0 0 1.5px #111,0 1px 4px rgba(0,0,0,.2)}',
    '.cm-badge.gh{background:linear-gradient(90deg,#111 50%,#fff 50%);color:#888;box-shadow:inset 0 0 0 1.5px #111,0 1px 4px rgba(0,0,0,.2)}',
    '.cm-badge.gh b{background:#111;color:#fff;border-radius:999px;padding:1px 4px}',
    '#rv .rv-it .cm-badge{top:2px;right:2px;padding:2px 4px;font-size:9px}',
    '@media print{.cm{display:none}}'
  ].join('');
  document.head.appendChild(css);
  var BUB = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>';

  /* ── 코멘트 창: 사진 창(dialog) 안의 설명 칸 아래에 붙인다 ── */
  var curDlg = null, sureId = '';
  function infoBox(d) {
    return d.querySelector('#d-info') || d.querySelector('.d-info') || (d.querySelector('dl') && d.querySelector('dl').parentElement) || d.querySelector('.d-body') || d;
  }
  function who() { return ls.get(K_WHO, '거믄'); }
  function panelHTML(cid) {
    var cs = byCid(cid), w = who();
    var h = '<h4>' + BUB.replace('<svg', '<svg width="16" height="16"') + ' 기물 이야기 <small>' + (cs.length ? cs.length + '개' : '') + '</small></h4>';
    if (state.err) h += '<p class="cm-err">' + esc(state.err) + '</p>';
    if (state.loading && !cs.length) h += '<p class="cm-empty">불러오는 중…</p>';
    h += cs.length ? '<div class="cm-list">' + cs.map(function (c) {
      var cls = c.author === '거믄' ? 'g' : c.author === '힌' ? 'h' : 'o', label = c.author === '다른 사람' ? (c.name || '다른 사람') : c.author;
      var tail = sureId === c.id ? '<span class="cm-sure">지울까요?<button type="button" data-yes="' + esc(c.id) + '">예</button><button type="button" data-no="1">아니오</button></span>' : '<button type="button" class="cm-del" data-del="' + esc(c.id) + '">지우기</button>';
      return '<div class="cm-it"><div class="cm-hd"><span class="cm-who ' + cls + '">' + esc(label) + '</span><span>' + esc(when(c.t)) + (c.pending ? ' · 이 기기에만 저장됨' : '') + '</span>' + tail + '</div><div class="cm-tx">' + esc(c.text) + '</div></div>';
    }).join('') + '</div>' : (state.loading ? '' : '<p class="cm-empty">아직 남긴 이야기가 없어요. 이 기물에 대한 생각을 적어 보세요.</p>');
    if (API && state.needCode) {
      h += '<div class="cm-form"><p class="cm-note">처음 한 번만 <b>가족 암호</b>를 넣어 주세요. 이 기기에 기억해 둡니다.</p><div class="cm-row"><input type="password" class="cm-code" placeholder="가족 암호" autocomplete="off" style="max-width:220px"><button type="button" class="cm-go cm-codego">확인</button></div></div>';
      return h;
    }
    h += '<div class="cm-form"><div class="cm-row"><span class="cm-pick" role="radiogroup" aria-label="누가 남기나요">' +
      ['거믄', '힌', '다른 사람'].map(function (x) { return '<button type="button" role="radio" aria-checked="' + (w === x) + '" class="' + (w === x ? 'on' : '') + '" data-w="' + x + '">' + x + '</button>'; }).join('') +
      '</span>' + (w === '다른 사람' ? '<input type="text" class="cm-name" placeholder="이름" value="' + esc(ls.get(K_NAME, '')) + '">' : '') + '</div>' +
      '<textarea class="cm-text" placeholder="이 기물에 대한 이야기를 남겨 주세요 (수종, 짜임, 장석, 감정 메모, 선생님 말씀…)"></textarea>' +
      '<button type="button" class="cm-go cm-send">남기기</button>' +
      (API ? '' : '<p class="cm-note">아직 공용 저장소(구글 시트)에 연결되기 전이라 <b>이 기기에만</b> 저장됩니다. 연결하면 자동으로 옮겨져 다른 기기에서도 보여요.</p>') + '</div>';
    return h;
  }
  function paint() {
    if (!curDlg || !curDlg.open) return;
    var cid = curDlg.dataset.cid; if (!cid) return;
    var box = infoBox(curDlg), p = box.querySelector(':scope > .cm');
    var keep = p && p.querySelector('.cm-text') ? p.querySelector('.cm-text').value : '';
    var hadFocus = p && document.activeElement && p.contains(document.activeElement) && document.activeElement.classList.contains('cm-text');
    if (!p) { p = document.createElement('div'); p.className = 'cm'; box.appendChild(p); }
    p.dataset.cid = cid; p.innerHTML = panelHTML(cid);
    var ta = p.querySelector('.cm-text'); if (ta && keep && p.dataset.lastCid === cid) ta.value = keep;
    if (ta && hadFocus) ta.focus();
    p.dataset.lastCid = cid;
  }
  document.addEventListener('click', function (e) {
    var p = e.target.closest && e.target.closest('.cm'); if (!p) return;
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.w) { ls.set(K_WHO, b.dataset.w); paint(); return; }
    if (b.dataset.del) { sureId = b.dataset.del; paint(); return; }
    if (b.dataset.no) { sureId = ''; paint(); return; }
    if (b.dataset.yes) { var id = b.dataset.yes; sureId = ''; del(id); return; }
    if (b.classList.contains('cm-codego')) { var v = (p.querySelector('.cm-code').value || '').trim(); if (!v) return; ls.set(K_CODE, v); state.needCode = false; state.err = ''; apiGet(); return; }
    if (b.classList.contains('cm-send')) {
      var text = (p.querySelector('.cm-text').value || '').trim(); if (!text) { p.querySelector('.cm-text').focus(); return; }
      var w = who(), nm = '';
      if (w === '다른 사람') { nm = ((p.querySelector('.cm-name') || {}).value || '').trim(); if (!nm) { p.querySelector('.cm-name').focus(); return; } ls.set(K_NAME, nm); }
      var c = { id: uid(), cid: p.dataset.cid, author: w, name: nm, text: text.slice(0, 4000), t: new Date().toISOString(), page: location.pathname.split('/').pop() || 'index.html' };
      if (!API) c.pending = 1;
      p.querySelector('.cm-text').value = ''; b.disabled = true;
      add(c).then(function () { b.disabled = false; });
    }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.classList && e.target.classList.contains('cm-text')) { var s = e.target.closest('.cm').querySelector('.cm-send'); if (s) s.click(); }
    if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('cm-code')) { e.preventDefault(); e.target.closest('.cm').querySelector('.cm-codego').click(); }
  });
  // 사진 창 안에서 누르는 키(화살표 등)가 페이지의 이전·다음 넘기기로 새지 않게
  document.addEventListener('keydown', function (e) { if (e.target.closest && e.target.closest('.cm') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) e.stopPropagation(); }, true);

  function watchDialogs() {
    document.querySelectorAll('dialog').forEach(function (d) {
      if (d.dataset.cmWatch) return; d.dataset.cmWatch = '1';
      var go = function () { if (d.open) { curDlg = d; sureId = ''; setTimeout(paint, 0); } };
      new MutationObserver(go).observe(d, { attributes: true, attributeFilter: ['open', 'data-cid'] });
      // 페이지가 설명 칸을 새로 그리면(innerHTML) 코멘트 창이 지워지므로 다시 붙인다
      new MutationObserver(function () { if (d.open && d.dataset.cid && !infoBox(d).querySelector(':scope > .cm')) setTimeout(paint, 0); }).observe(d, { childList: true, subtree: true });
    });
  }

  /* ── 코멘트가 있는 기물 표시 ── */
  var markT = 0;
  function mark() {
    var m = counts();
    document.querySelectorAll('[data-cid]').forEach(function (el) {
      if (el.tagName === 'DIALOG' || el.classList.contains('cm')) return;
      var c = m[el.dataset.cid], b = el.querySelector(':scope > .cm-badge');
      if (!c) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement('span'); b.className = 'cm-badge'; el.appendChild(b); }
      var g = c.who['거믄'], h = c.who['힌'];
      b.className = 'cm-badge' + (g && h ? ' gh' : (h && !g ? ' h' : ''));
      b.innerHTML = BUB + '<b>' + c.n + '</b>';
      b.title = '코멘트 ' + c.n + '개';
    });
  }
  function markSoon() { clearTimeout(markT); markT = setTimeout(mark, 120); }

  function start() {
    watchDialogs();
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (t.closest && (t.closest('.cm') || t.closest('.cm-badge'))) continue; markSoon(); watchDialogs(); return; }
    }).observe(document.body, { childList: true, subtree: true });
    mark();
    apiGet();
    window.addEventListener('storage', function (e) { if (e.key === K_LOCAL || e.key === K_CACHE) { all = ls.json(K_CACHE, []); local = ls.json(K_LOCAL, []); paint(); mark(); } });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') apiGet(); });
  }
  window.MOKGAGU_COMMENTS = { reload: apiGet, setApi: function (u) { API = u; apiGet(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

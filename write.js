/* 공부방 「바로 쓰기」 탭 — 수업 내용을 공부방에서 바로 적고 사진을 붙인다.
   글은 구글 시트 「쓰기」 탭에 저장되고(고치기 전 글은 「쓰기이력」), 거믄·힌이 서로의 글을 고칠 수 있다.
   「정리 전」 글은 Claude 에게 「바로 쓰기 정리해줘」 하면 기존 수업 노트와 같은 모양으로 정리해 공부방 노트·퀴즈에 보탠다.
   수업 녹음: 끝내면 이 기기(IndexedDB)에 보관 → 「드라이브에 저장」을 누르면 시트 스크립트를 거쳐 3MB씩 드라이브에 올리고,
   다 올라가면 글에 붙는다. 글의 「▶ 녹음 듣기」는 가족 암호로 드라이브에서 받아 재생한다.
   MOKGAGU_WRITE.mount(요소)  — 필요: mkphoto.js, classes.js */
(function () {
  var API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  var K_CACHE = 'mokgagu_write_cache_v1', K_DRAFT = 'mokgagu_write_draft_v1', K_WHO = 'mokgagu_write_who';
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function code() { return ls.get('mokgagu_cm_code') || ls.get('mokgagu_study_pw') || ''; }
  var PH = function () { return window.MOKGAGU_PHOTO; };
  var CL = function () { return window.MOKGAGU_CLASS; };

  var css = document.createElement('style');
  css.textContent =
    '#wr{max-width:760px;margin:16px auto 0}' +
    '#wr .wr-tip{background:#fbf3df;border:1px solid #ecd9a8;border-radius:14px;padding:12px 14px;font-size:14px;line-height:1.7;color:#5b4310;margin:0 0 14px}' +
    '#wr .wr-ed,#wr .wr-it{background:#fff;border:1.5px solid #111;border-radius:16px;padding:14px;margin:0 0 16px}' +
    '#wr .wr-ed{border-color:#8a5a12;box-shadow:0 0 0 4px #f6ead0}' +
    '#wr .wr-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 10px}' +
    '#wr .wr-seg{display:inline-flex;border:1.5px solid #111;border-radius:999px;overflow:hidden}' +
    '#wr .wr-seg button{font:inherit;font-size:14px;font-weight:800;border:0;background:#fff;color:#111;padding:6px 16px;cursor:pointer}' +
    '#wr .wr-seg button.on{background:#111;color:#fff}' +
    '#wr select,#wr input[type=date]{font:inherit;font-size:14px;border:1px solid #d9d4cc;border-radius:999px;padding:6px 12px;background:#fff;max-width:100%}' +
    '#wr .wr-title{width:100%;font:inherit;font-size:17px;font-weight:800;border:1px solid #d9d4cc;border-radius:10px;padding:10px 12px;margin:0 0 8px}' +
    '#wr .wr-body{width:100%;min-height:190px;font:inherit;font-size:15.5px;line-height:1.75;border:1px solid #d9d4cc;border-radius:10px;padding:10px 12px;resize:vertical}' +
    '#wr .wr-hint{font-size:12.5px;color:#756e65;line-height:1.6}' +
    '#wr .wr-ph{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0 0}' +
    '#wr .wr-pc{width:112px}' +
    '#wr .wr-pc .mp-th{width:112px;height:112px}' +
    '#wr .wr-pc input{width:100%;font:inherit;font-size:12.5px;border:1px solid #d9d4cc;border-radius:8px;padding:5px 7px;margin-top:4px}' +
    '#wr .wr-foot{display:flex;gap:8px;justify-content:flex-end;align-items:center;margin-top:12px;flex-wrap:wrap}' +
    '#wr .wr-foot .ok{font:inherit;font-weight:800;font-size:15px;border:0;border-radius:10px;background:#111;color:#fff;padding:10px 22px;cursor:pointer}' +
    '#wr .wr-foot .no{font:inherit;font-size:14px;border:1px solid #cfc8bd;border-radius:10px;background:#fff;color:#4a463f;padding:9px 16px;cursor:pointer}' +
    '#wr .wr-foot button:disabled{opacity:.5}' +
    '#wr .wr-new{display:block;width:100%;font:inherit;font-weight:900;font-size:16px;border:2px solid #8a5a12;border-radius:14px;background:#f6ead0;color:#5b3a05;padding:14px;cursor:pointer;margin:0 0 16px}' +
    '#wr .wr-it{border-color:#d8d2c7}' +
    '#wr .wr-it h3{margin:8px 0 6px;font-family:"Noto Serif KR",serif;font-size:19px;letter-spacing:-.01em}' +
    '#wr .wr-meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:12.5px;color:#756e65}' +
    '#wr .wr-meta b{color:#1d1b18}' +
    '#wr .wr-b{white-space:normal;line-height:1.85;font-size:15.5px;margin:6px 0 0}' +
    '#wr .wr-b p{margin:0 0 8px}#wr .wr-b h4{margin:12px 0 4px;font-size:16px}#wr .wr-b ul{margin:4px 0 8px;padding-left:20px}' +
    '#wr .wr-st{display:inline-block;font-size:11.5px;font-weight:800;border-radius:999px;padding:2px 9px;background:#f6ead0;color:#5b3a05;border:1px solid #e3cd96}' +
    '#wr .wr-st.done{background:#e3f0e6;color:#1f4d31;border-color:#b7d6bf}' +
    '#wr .wr-act{display:flex;gap:12px;margin-top:10px}' +
    '#wr .wr-act button{font:inherit;font-size:13px;border:0;background:none;color:#756e65;cursor:pointer;padding:0;text-decoration:underline}' +
    '#wr .wr-act .del:hover{color:#8a2f22}' +
    '#wr .wr-day{font-family:"Noto Serif KR",serif;font-weight:900;font-size:17px;margin:20px 0 8px}' +
    '#wr .wr-ow{display:inline-block;min-width:2.9em;text-align:center;font-style:normal;font-weight:900;font-size:12px;padding:1px 7px;border:1.5px solid #111;line-height:1.35}' +
    '#wr .wr-ow.g{background:#111;color:#fff}#wr .wr-ow.h{background:#fff;color:#111}' +
    '#wr .wr-msg{font-size:13px;color:#8a2f22;min-height:1.2em}' +
    '@media (max-width:620px){#wr .wr-foot{padding-right:54px}}' +
    '#wr-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#111;color:#fff;border-radius:999px;padding:10px 18px;font-size:14px;font-weight:700;z-index:60;opacity:0;pointer-events:none;transition:opacity .2s}' +
    '#wr-toast.on{opacity:1}' +
    '#wr .wr-au{display:flex;flex-direction:column;gap:6px;margin:10px 0 0}#wr .wr-au1{display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:#faf6ee;border:1px solid #e7dcc4;border-radius:12px;padding:7px 10px;font-size:13.5px}' +
    '#wr .wr-au1 audio{width:100%;max-width:420px;height:36px}#wr .wr-au1 .pl{font:inherit;font-weight:800;font-size:13.5px;border:1.5px solid #111;border-radius:999px;background:#fff;color:#111;padding:5px 12px;cursor:pointer}#wr .wr-au1 .x{font:inherit;border:0;background:none;color:#8a2f22;cursor:pointer;text-decoration:underline;font-size:12.5px}';
  document.head.appendChild(css);
  var tEl = null;
  function toast(t) { if (!tEl) { tEl = document.createElement('div'); tEl.id = 'wr-toast'; document.body.appendChild(tEl); } tEl.textContent = t; tEl.classList.add('on'); clearTimeout(tEl._t); tEl._t = setTimeout(function () { tEl.classList.remove('on'); }, 2400); }

  var AUD = {};                          // 받아 둔 녹음 {드라이브 id: 재생 주소}
  var AU_CH = 3 * 1024 * 1024;           // 한 번에 올리고 받는 크기 (시트 스크립트 AU_CHUNK 와 같아야 한다)
  function dur(sec) { sec = Math.round(Number(sec) || 0); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return h ? h + '시간 ' + m + '분' : m ? m + '분' : sec + '초'; }
  function mb(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'; }
  function b64bytes(s) { var b = atob(s || ''), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  /* 올리지 않은 녹음 보관함 — 이 기기의 IndexedDB('mokgagu_rec') */
  var IDB = (function () {
    var dbp = null;
    function db() {
      if (!dbp) dbp = new Promise(function (ok, no) {
        try { var r = indexedDB.open('mokgagu_rec', 1); r.onupgradeneeded = function () { r.result.createObjectStore('recs', { keyPath: 'id' }); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; } catch (e) { no(e); }
      });
      return dbp;
    }
    function tx(mode, fn) { return db().then(function (d) { return new Promise(function (ok, no) { var t = d.transaction('recs', mode), q = fn(t.objectStore('recs')); t.oncomplete = function () { ok(q && q.result); }; t.onerror = function () { no(t.error); }; t.onabort = function () { no(t.error); }; }); }); }
    return { put: function (r) { return tx('readwrite', function (s) { return s.put(r); }); }, del: function (id) { return tx('readwrite', function (s) { return s.delete(id); }); }, all: function () { return tx('readonly', function (s) { return s.getAll(); }); } };
  })();
  function uid() { return 'w_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function fmt(d) { if (!d) return '날짜 없음'; var x = new Date(d + 'T00:00:00Z'); return x.getUTCFullYear() + '. ' + (x.getUTCMonth() + 1) + '. ' + x.getUTCDate() + '. (' + '일월화수목금토'[x.getUTCDay()] + ')'; }
  function ago(t) { if (!t) return ''; var d = new Date(t), m = Math.round((Date.now() - d) / 60000); if (m < 1) return '방금'; if (m < 60) return m + '분 전'; if (m < 1440) return Math.round(m / 60) + '시간 전'; return (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; }
  /* 간단한 글 꾸미기: ## 제목 · - 목록 · **굵게** */
  function render(t) {
    var out = [], list = false;
    String(t || '').split(/\r?\n/).forEach(function (ln) {
      var m;
      function inline(x) { return esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
      if ((m = ln.match(/^\s*[-•·]\s+(.*)$/))) { if (!list) { out.push('<ul>'); list = true; } out.push('<li>' + inline(m[1]) + '</li>'); return; }
      if (list) { out.push('</ul>'); list = false; }
      if ((m = ln.match(/^#{1,3}\s+(.*)$/))) out.push('<h4>' + inline(m[1]) + '</h4>');
      else if (ln.trim()) out.push('<p>' + inline(ln) + '</p>');
    });
    if (list) out.push('</ul>');
    return out.join('');
  }
  function classChoices(extra) {
    var C = CL(), t = C.today(), y = +t.slice(0, 4), m = +t.slice(5, 7) - 1, all = [];
    for (var k = -5; k <= 1; k++) { var yy = y, mm = m + k; while (mm < 0) { mm += 12; yy--; } while (mm > 11) { mm -= 12; yy++; } all = all.concat(C.days(yy, mm)); }
    var lim = new Date(Date.now() + 9 * 3600e3 + 8 * 86400e3).toISOString().slice(0, 10);
    all = all.filter(function (d) { return d <= lim; }).sort().reverse().slice(0, 9);
    if (extra && all.indexOf(extra) < 0) all.push(extra);
    return all.sort().reverse();
  }
  function defaultClass() { var C = CL(), t = C.today(), ds = classChoices().filter(function (d) { return d <= t; }); return ds[0] || t; }

  function mount(el) {
    var LIST = [], loaded = false, ED = null, busy = '', saving = false, msg = '';
    var cached = null; try { cached = JSON.parse(ls.get(K_CACHE) || 'null'); } catch (e) {}
    if (cached && cached.length) { LIST = cached; loaded = true; }
    var me = ls.get(K_WHO) || (ls.get('mokgagu_cm_who') === '힌' ? '힌' : '거믄');
    function saveDraft() { if (ED && ED.isNew) ls.set(K_DRAFT, JSON.stringify(ED)); }
    function open(item) {
      if (item) ED = { id: item.id, who: item.who, cls: item.cls, title: item.title, body: item.body, photos: item.photos.slice(), audio: (item.audio || []).slice(), base: item.updated, isNew: false };
      else {
        var d = null; try { d = JSON.parse(ls.get(K_DRAFT) || 'null'); } catch (e) {}
        ED = d && d.id ? d : { id: uid(), who: me, cls: defaultClass(), title: '', body: '', photos: [], audio: [], base: '', isNew: true };
        ED.isNew = true; if (!ED.audio) ED.audio = [];
      }
      msg = ''; draw(); var t = el.querySelector('#wr-title'); if (t) t.focus();
    }
    function groups() { var g = {}; LIST.forEach(function (x) { (g[x.cls || ''] = g[x.cls || ''] || []).push(x); }); return g; }
    function edHTML() {
      var ch = classChoices(ED.cls);
      var opts = ch.map(function (d) { return '<option value="' + d + '"' + (d === ED.cls ? ' selected' : '') + '>' + fmt(d) + ' 수업</option>'; }).join('') + '<option value="__other">다른 날짜…</option>';
      var ph = ED.photos.map(function (p, i) {
        return '<div class="wr-pc"><span class="mp-th">' + '<button type="button" class="mp-open" data-g="wr-ed" data-i="' + i + '"><img data-pid="' + esc(p.t || p.f) + '" alt=""></button><button type="button" class="mp-x" data-mpx="' + i + '" aria-label="사진 빼기">×</button></span><input data-cap="' + i + '" value="' + esc(p.c || '') + '" placeholder="사진 설명 (안 써도 돼요)" maxlength="80"></div>';
      }).join('');
      PH().thumbs(ED.photos, 'wr-ed');
      return '<div class="wr-ed" id="wr-ed"><div class="wr-row">' + (ED.isNew ? '' : '<span class="wr-hint">' + esc(ED.who) + '이(가) 쓴 글 · 고치는 사람</span>') + '<span class="wr-seg">' + ['거믄', '힌'].map(function (w) { return '<button type="button" data-who="' + w + '" class="' + ((ED.isNew ? ED.who : me) === w ? 'on' : '') + '">' + w + '</button>'; }).join('') + '</span>' +
        '<select id="wr-cls" aria-label="수업 날짜">' + opts + '</select></div>' +
        '<input class="wr-title" id="wr-title" maxlength="100" placeholder="제목 — 예: 안궤와 책반닫이의 비례" value="' + esc(ED.title) + '">' +
        '<textarea class="wr-body" id="wr-body" placeholder="오늘 수업에서 보고 배운 것, 선생님 말씀, 기물의 특징을 바로 적어 주세요.&#10;&#10;## 작은 제목&#10;- 목록은 이렇게&#10;**굵게** 도 쓸 수 있어요">' + esc(ED.body) + '</textarea>' +
        '<div class="wr-ph" id="wr-ph">' + ph + '<button type="button" class="mp-add" id="wr-pick"' + (busy ? ' disabled' : '') + '><b>＋</b>사진 추가</button></div>' +
        '<div class="wr-row" style="margin:8px 0 0"><span class="wr-hint">' + (busy ? '<b>' + esc(busy) + '</b>' : '앨범·카메라에서 여러 장 · 최대 12장 · 종이 노트를 찍어 올려도 돼요. 적는 동안 이 기기에 임시저장돼요.') + '</span></div>' +
        (ED.audio.length ? '<div class="wr-au">' + ED.audio.map(function (a, i) { return auHTML(a, '<button type="button" class="x" data-aux="' + i + '">글에서 빼기</button>'); }).join('') + '</div>' : '') +
        '<div class="wr-msg" id="wr-msg">' + esc(msg) + '</div>' +
        '<div class="wr-foot"><button type="button" class="no" id="wr-cancel">그만두기</button><button type="button" class="ok" id="wr-save"' + (saving ? ' disabled' : '') + '>' + (saving ? '저장하는 중…' : (ED.isNew ? '저장하고 공부방에 쌓기' : '고친 내용 저장')) + '</button></div></div>';
    }
    function itemHTML(x) {
      var edited = x.editor && x.editor !== x.who;
      return '<article class="wr-it" id="wi-' + esc(x.id) + '"><div class="wr-meta"><i class="wr-ow ' + (x.who === '힌' ? 'h' : 'g') + '">' + esc(x.who) + '</i>' +
        '<span>' + ago(x.created) + ' 작성</span>' + (edited || (x.updated && x.updated !== x.created) ? '<span>· <b>' + esc(x.editor || x.who) + '</b>이(가) ' + ago(x.updated) + ' 고침</span>' : '') +
        '<span class="wr-st' + (x.status === '정리됨' ? ' done' : '') + '">' + (x.status === '정리됨' ? '정리됨' : '정리 전') + '</span></div>' +
        (x.title ? '<h3>' + esc(x.title) + '</h3>' : '') + '<div class="wr-b">' + render(x.body) + '</div>' +
        ((x.audio || []).length ? '<div class="wr-au">' + x.audio.map(function (a) { return auHTML(a, ''); }).join('') + '</div>' : '') +
        (x.photos.length ? '<div class="mp-row" style="margin-top:10px">' + PH().thumbs(x.photos, 'wr-' + x.id, { big: true, cap: true }) + '</div>' : '') +
        '<div class="wr-act"><button type="button" data-edit="' + esc(x.id) + '">고치기</button><button type="button" class="del" data-del="' + esc(x.id) + '">지우기</button></div></article>';
    }
    function keepText() { var t = el.querySelector('#wr-title'), b2 = el.querySelector('#wr-body'); if (t) ED.title = t.value; if (b2) ED.body = b2.value; }
    /* 글에 붙은 녹음: 한 번 받은 것은 이 화면에 두고 바로 재생 */
    function auHTML(a, extra) {
      var lab = '🎙 ' + esc(a.name || '수업 녹음') + ' · ' + dur(a.dur) + (a.size ? ' · ' + mb(a.size) : '');
      return '<div class="wr-au1"><span>' + lab + '</span>' + (AUD[a.id] ? '<audio controls preload="metadata" src="' + AUD[a.id] + '"></audio>' : '<button type="button" class="pl" data-play="' + esc(a.id) + '" data-mime="' + esc(a.mime || '') + '">▶ 녹음 듣기</button>') + extra + '</div>';
    }
    function play(btn) {
      var id = btn.dataset.play, mime = btn.dataset.mime || 'audio/webm';
      if (AUD[id]) return; if (btn.disabled) return; btn.disabled = true; btn.textContent = '드라이브에서 받는 중…';
      var parts = [];
      function get(i) {
        return fetch(API + '?action=aget&code=' + encodeURIComponent(code()) + '&id=' + encodeURIComponent(id) + '&i=' + i, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
          if (!j || !j.ok) throw j || {};
          parts.push(b64bytes(j.data)); if (j.type) mime = j.type;
          if (j.n > 1) btn.textContent = '받는 중 ' + Math.round((i + 1) / j.n * 100) + '%';
          return i + 1 < j.n ? get(i + 1) : null;
        });
      }
      get(0).then(function () {
        AUD[id] = URL.createObjectURL(new Blob(parts, { type: mime }));
        var a = document.createElement('audio'); a.controls = true; a.src = AUD[id]; btn.replaceWith(a); a.play().catch(function () {});
      }).catch(function (j) { btn.disabled = false; btn.textContent = '▶ 녹음 듣기'; toast(j && j.err === 'code' ? '가족 암호가 맞지 않아요' : j && j.err === 'none' ? '드라이브에서 녹음을 찾지 못했어요' : '녹음을 받지 못했어요. 다시 눌러 주세요'); });
    }
    function draw() {
      var h = '<p class="wr-tip"><b>수업 내용을 여기서 바로 적어요.</b> 거믄·힌이 서로의 글을 고칠 수 있고, 고치기 전 글은 시트에 남아요. 「정리 전」 글은 <b>「바로 쓰기 정리해줘」</b> 하면 수업 노트·퀴즈로 정리해 올려요.</p>';
      if (ED) h += edHTML(); else h += '<button type="button" class="wr-new" id="wr-new">＋ 새 글 쓰기' + (ls.get(K_DRAFT) ? ' <small style="font-weight:600">(적던 글이 있어요)</small>' : '') + '</button>';
      var g = groups(), days = Object.keys(g).sort().reverse();
      if (!loaded) h += '<p style="text-align:center;color:#756e65;margin:26px 0">불러오는 중…</p>';
      else if (!days.length) h += '<p style="text-align:center;color:#756e65;margin:26px 0">아직 쓴 글이 없어요. 첫 글을 적어 보세요.</p>';
      days.forEach(function (d) {
        h += '<div class="wr-day">' + fmt(d) + ' 수업 <small style="font-weight:600;color:#756e65;font-size:13px">' + g[d].length + '개</small></div>' +
          g[d].slice().sort(function (a, b) { return String(b.created).localeCompare(String(a.created)); }).map(itemHTML).join('');
      });
      var keepBody = el.querySelector('#wr-body'), pos = keepBody ? keepBody.selectionStart : 0, had = document.activeElement && document.activeElement.id;
      el.innerHTML = h; PH().fill(el);
      if (had === 'wr-body') { var nb = el.querySelector('#wr-body'); if (nb) { nb.focus(); nb.setSelectionRange(pos, pos); } }
    }
    function load() {
      fetch(API + '?action=wlist&code=' + encodeURIComponent(code()), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.ok) { loaded = true; draw(); if (j && j.err === 'code') toast('가족 암호가 맞지 않아요'); return; }
        LIST = j.list; loaded = true; ls.set(K_CACHE, JSON.stringify(LIST));
        if (!(ED && document.activeElement && /^wr-(title|body)$/.test(document.activeElement.id))) draw();
      }).catch(function () { loaded = true; draw(); if (!LIST.length) toast('인터넷 연결을 확인해 주세요'); });
    }
    function save() {
      var t = el.querySelector('#wr-title').value.trim(), b = el.querySelector('#wr-body').value.trim();
      ED.title = t; ED.body = b;
      if (!t && !b && !ED.photos.length && !ED.audio.length) { msg = '제목이나 내용, 사진 중 하나는 있어야 해요.'; draw(); return; }
      if (busy) { msg = '사진을 올리는 중이에요. 잠깐만 기다려 주세요.'; draw(); return; }
      saving = true; msg = ''; draw();
      var item = { id: ED.id, who: ED.who, editor: me, cls: ED.cls, title: t, body: b, photos: ED.photos, audio: ED.audio, base: ED.isNew ? '' : ED.base };
      fetch(API, { method: 'POST', body: JSON.stringify({ action: 'wsave', code: code(), item: item }) }).then(function (r) { return r.json(); }).then(function (j) {
        saving = false;
        if (j && j.ok) {
          var n = j.item, at = -1; LIST.forEach(function (x, i) { if (x.id === n.id) at = i; }); if (at >= 0) LIST[at] = n; else LIST.push(n);
          ls.set(K_CACHE, JSON.stringify(LIST)); if (ED.isNew) ls.del(K_DRAFT); ED = null; draw(); toast('저장했어요 — 공부방에 쌓였어요');
        } else if (j && j.err === 'conflict') {
          msg = '그 사이 ' + (j.item.editor || '다른 사람') + '이(가) 이 글을 고쳤어요. 「그만두기」 후 다시 열어 최신 글에서 고쳐 주세요. (지금 적은 글은 아래에 남겨 둬요)'; draw();
        } else { msg = '저장하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.'; draw(); }
      }).catch(function () { saving = false; msg = '저장하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요. (적은 글은 이 기기에 남아 있어요)'; draw(); });
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.play) { play(b); return; }
      if (b.dataset.aux != null && ED) { if (!confirm('이 녹음을 글에서 뺄까요?\n(드라이브의 녹음 파일은 그대로 남아요)')) return; keepText(); ED.audio.splice(+b.dataset.aux, 1); saveDraft(); draw(); return; }
      if (b.id === 'wr-new') { open(null); return; }
      if (b.id === 'wr-cancel') { if (ED.isNew) saveDraft(); ED = null; draw(); return; }
      if (b.id === 'wr-save') { save(); return; }
      if (b.dataset.who && ED) { me = b.dataset.who; if (ED.isNew) ED.who = me; ls.set(K_WHO, me); ED.title = el.querySelector('#wr-title').value; ED.body = el.querySelector('#wr-body').value; saveDraft(); draw(); return; }
      if (b.id === 'wr-pick') {
        ED.title = el.querySelector('#wr-title').value; ED.body = el.querySelector('#wr-body').value;
        PH().pick(12, ED.photos.length, function (m) { busy = /올리는 중/.test(m) ? m : ''; if (m && !busy) toast(m); if (ED) { ED.title = (el.querySelector('#wr-title') || { value: ED.title }).value; ED.body = (el.querySelector('#wr-body') || { value: ED.body }).value; } draw(); },
          function (add) { if (!ED) return; ED.photos = ED.photos.concat(add); busy = ''; saveDraft(); draw(); });
        return;
      }
      if (b.dataset.mpx != null && ED && b.closest('#wr-ed')) { ED.title = el.querySelector('#wr-title').value; ED.body = el.querySelector('#wr-body').value; ED.photos.splice(+b.dataset.mpx, 1); saveDraft(); draw(); return; }
      if (b.dataset.edit) { var x = LIST.filter(function (y) { return y.id === b.dataset.edit; })[0]; if (x) { open(x); var ed = el.querySelector('#wr-ed'); if (ed) ed.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
      if (b.dataset.del) {
        var y = LIST.filter(function (z) { return z.id === b.dataset.del; })[0]; if (!y) return;
        if (!confirm('이 글을 지울까요?\n「' + (y.title || '제목 없음') + '」 (사진은 드라이브에 그대로 남아요)')) return;
        fetch(API, { method: 'POST', body: JSON.stringify({ action: 'wdel', code: code(), id: y.id }) }).then(function (r) { return r.json(); }).then(function (j) {
          if (j && j.ok) { LIST = LIST.filter(function (z) { return z.id !== y.id; }); ls.set(K_CACHE, JSON.stringify(LIST)); draw(); toast('지웠어요'); } else toast('지우지 못했어요. 다시 해 주세요');
        }).catch(function () { toast('지우지 못했어요. 인터넷 연결을 확인해 주세요'); });
      }
    });
    el.addEventListener('input', function (e) {
      if (!ED) return;
      if (e.target.id === 'wr-title') ED.title = e.target.value;
      else if (e.target.id === 'wr-body') ED.body = e.target.value;
      else if (e.target.dataset && e.target.dataset.cap != null) { var p = ED.photos[+e.target.dataset.cap]; if (p) p.c = e.target.value; }
      saveDraft();
    });
    el.addEventListener('change', function (e) {
      if (!ED || e.target.id !== 'wr-cls') return;
      var v = e.target.value;
      if (v === '__other') { var d = prompt('수업 날짜를 적어 주세요 (예: 2026-11-14)', ED.cls); if (d && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) ED.cls = d.trim(); }
      else ED.cls = v;
      ED.title = el.querySelector('#wr-title').value; ED.body = el.querySelector('#wr-body').value; saveDraft(); draw();
    });

    /* ── 수업 녹음 ──
       끝내면 받아쓴 글은 새 글 본문에, 소리는 이 기기(IndexedDB)의 「올리지 않은 녹음」에 보관한다(새로 고쳐도 남는다).
       「드라이브에 저장」을 누르면 3MB씩 나눠 올리고, 다 올라가면 쓰는 글에 녹음이 붙는다 → 글을 저장하면 공부방에 함께 쌓인다. */
    var RC = { on: false, mr: null, sr: null, chunks: [], text: '', interim: '', t0: 0, tm: null, wl: null, stream: null, mime: '', ext: 'webm' };
    var PEND = [], PURL = {}, UP = null;   // 올리지 않은 녹음 · 미리 듣기 주소 · 올리는 중인 것 {id, i, n}
    var bar = document.createElement('div'); bar.id = 'wr-rec'; el.parentNode.insertBefore(bar, el);
    var rcss = document.createElement('style');
    rcss.textContent = '#wr-rec{margin:0 0 10px;border:1px solid #d9d4cc;border-radius:12px;padding:5px 8px;background:#fff;font-size:13px}#wr-rec .rb{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#wr-rec button,#wr-rec a.dl{border:1.5px solid #111;background:#fff;border-radius:999px;padding:4px 12px;font-weight:800;font-size:13px;cursor:pointer;font-family:inherit;color:#111;text-decoration:none}#wr-rec button:disabled{opacity:.45;cursor:default}#wr-rec .go{background:#b3261e;color:#fff;border-color:#b3261e}#wr-rec .up{background:#111;color:#fff}#wr-rec .del{border:0;background:none;color:#8a2f22;text-decoration:underline;font-weight:600;padding:4px 2px}#wr-rec .dot{width:10px;height:10px;border-radius:50%;background:#b3261e;display:inline-block;animation:rcb 1s infinite}@keyframes rcb{50%{opacity:.25}}#wr-rec .tx{margin-top:8px;max-height:110px;overflow:auto;color:#3b3833;font-size:13.5px;line-height:1.6;background:#faf9f6;border-radius:8px;padding:6px 8px}#wr-rec .hint{color:#6b665e;font-size:12px;line-height:1.4}@media(max-width:640px){#wr-rec .hm{display:none}}#wr-rec .pd{margin-top:10px;border-top:1px dashed #d8d2c7;padding-top:8px}#wr-rec .pd h4{margin:0 0 6px;font-size:13.5px}#wr-rec .p1{border:1px solid #e7dcc4;background:#faf6ee;border-radius:12px;padding:8px 10px;margin:0 0 8px}#wr-rec .p1 .nm{font-weight:700}#wr-rec .p1 audio{width:100%;max-width:420px;height:36px;margin-top:6px;display:block}#wr-rec .bar{height:8px;border-radius:4px;background:#ece6da;overflow:hidden;margin-top:6px;max-width:420px}#wr-rec .bar i{display:block;height:100%;background:#111}';
    document.head.appendChild(rcss);
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    function mm(n) { n = Math.floor(n / 1000); return Math.floor(n / 60) + ':' + ('0' + (n % 60)).slice(-2); }
    function whenTxt(t) { var d = new Date(t); return (d.getMonth() + 1) + '. ' + d.getDate() + '. ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
    function pendHTML() {
      if (!PEND.length) return '';
      return '<div class="pd"><h4>드라이브에 올리지 않은 녹음 ' + PEND.length + '개 <span class="hint" style="font-weight:400">— 이 기기에만 있어요</span></h4>' + PEND.map(function (r) {
        var up = UP && UP.id === r.id;
        return '<div class="p1"><div class="rb"><span class="nm">🎙 ' + whenTxt(r.t) + ' 녹음</span><span class="hint" style="margin:0">' + dur(r.dur / 1000) + ' · ' + mb(r.blob.size) + ' · ' + esc(r.who || '') + '</span></div>' +
          (PURL[r.id] ? '<audio controls src="' + PURL[r.id] + '"></audio>' : '') +
          (up ? '<div class="bar"><i style="width:' + Math.round(UP.i / UP.n * 100) + '%"></i></div><div class="hint">드라이브에 올리는 중 ' + Math.round(UP.i / UP.n * 100) + '% — 화면을 닫지 마세요</div>' :
            '<div class="rb" style="margin-top:6px">' + (PURL[r.id] ? '' : '<button type="button" data-pv="' + r.id + '">▶ 미리 듣기</button>') +
            '<button type="button" class="up" data-up="' + r.id + '"' + (UP ? ' disabled' : '') + '>☁ 드라이브에 저장</button>' +
            '<button type="button" data-dl="' + r.id + '">⬇ 이 기기에 파일로</button><button type="button" class="del" data-pdel="' + r.id + '"' + (UP ? ' disabled' : '') + '>지우기</button></div>') + '</div>';
      }).join('') + '</div>';
    }
    function rpaint() {
      var h = '<div class="rb">';
      if (RC.on) h += '<span class="dot"></span><b>녹음 중 ' + mm(Date.now() - RC.t0) + '</b><button type="button" id="rc-stop">■ 끝내기</button>';
      else h += '<button type="button" class="go" id="rc-go"' + (UP ? ' disabled' : '') + '>🎙 수업 녹음</button><span class="hint hm" title="녹음하는 동안 화면을 켜 두세요. 받아쓰기는 기계라 낱말이 틀릴 수 있고, 올려 주시면 앞뒤를 맞춰 정리해요.">끝내면 받아쓴 글은 새 글에, 소리는 아래 보관함에 들어가요</span>';
      h += '</div>';
      if (RC.on && SR) h += '<div class="tx">' + esc(RC.text + RC.interim || '말씀을 받아쓰는 중…') + '</div>';
      if (RC.on && !SR) h += '<div class="hint">이 브라우저는 받아쓰기를 지원하지 않아 소리만 녹음해요. (안드로이드·PC 크롬은 받아써 줍니다)</div>';
      if (!RC.on) h += pendHTML() + '<div class="hint hm">녹음하는 동안 화면을 켜 두세요(꺼지면 끊길 수 있어요). 「드라이브에 저장」은 와이파이에서 누르면 빨라요.</div>';
      bar.innerHTML = h;
    }
    function startSR() {
      if (!SR || !RC.on) return;
      var r = new SR(); r.lang = 'ko-KR'; r.continuous = true; r.interimResults = true; RC.sr = r;
      r.onresult = function (e) { var it = ''; for (var i = e.resultIndex; i < e.results.length; i++) { var t = e.results[i][0].transcript; if (e.results[i].isFinal) RC.text += t.trim() + ' '; else it += t; } RC.interim = it; rpaint(); };
      r.onend = function () { RC.interim = ''; if (RC.on) setTimeout(startSR, 200); };
      r.onerror = function () {};
      try { r.start(); } catch (e) {}
    }
    function rstart() {
      if (!navigator.mediaDevices || !window.MediaRecorder) { toast('이 브라우저는 녹음을 지원하지 않아요'); return; }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
        RC.stream = st; RC.chunks = []; RC.text = ''; RC.interim = '';
        var mt = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].filter(function (t) { return MediaRecorder.isTypeSupported(t); })[0] || '';
        RC.ext = /mp4/.test(mt) ? 'm4a' : 'webm';
        var mr = RC.mr = mt ? new MediaRecorder(st, { mimeType: mt }) : new MediaRecorder(st);
        RC.mime = (mr.mimeType || mt || 'audio/webm').split(';')[0];
        mr.ondataavailable = function (e) { if (e.data && e.data.size) RC.chunks.push(e.data); };
        mr.onstop = function () { rfinish(); };
        mr.start(5000); RC.on = true; RC.t0 = Date.now();
        RC.tm = setInterval(rpaint, 1000); startSR();
        try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { RC.wl = w; }, function () {}); } catch (e) {}
        rpaint();
      }, function () { toast('마이크 사용을 허용해 주세요'); });
    }
    function rstop() {
      RC.on = false; clearInterval(RC.tm); RC.t1 = Date.now(); try { RC.sr && RC.sr.stop(); } catch (e) {}
      try { RC.mr.stop(); } catch (e) {} try { RC.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} try { RC.wl && RC.wl.release(); } catch (e) {}
    }
    function rfinish() {
      var ms = (RC.t1 || Date.now()) - RC.t0, txt = (RC.text + RC.interim).trim(), mins = Math.max(1, Math.round(ms / 60000));
      if (RC.chunks.length) {
        var rec = { id: 'rec_' + new Date(RC.t0 + 9 * 3600e3).toISOString().slice(0, 16).replace(/\D/g, '') + '_' + Math.random().toString(36).slice(2, 6), blob: new Blob(RC.chunks, { type: RC.mime }), mime: RC.mime, ext: RC.ext, dur: ms, t: RC.t0, who: me };
        PEND.push(rec); IDB.put(rec).catch(function () { toast('이 기기에 보관하지 못했어요. 화면을 닫기 전에 드라이브에 저장하거나 파일로 받아 두세요'); });
      }
      var block = '## 🎙 수업 녹음 받아쓰기 (' + mins + '분 · 기계가 받아쓴 글이라 틀린 낱말이 있어요)\n' + (txt || '(받아쓴 글이 없어요. 소리는 녹음 보관함에 있어요)');
      if (!ED) { open(null); }
      ED.body = (ED.body ? ED.body + '\n\n' : '') + block; if (!ED.title) ED.title = '수업 녹음 ' + new Date(RC.t0 + 9 * 3600e3).toISOString().slice(0, 10); saveDraft(); draw(); rpaint();
      toast('받아쓴 글을 새 글에 넣었어요. 녹음은 「드라이브에 저장」을 눌러 올려 주세요');
    }
    function blob64(b) { return new Promise(function (ok, no) { var fr = new FileReader(); fr.onload = function () { ok(String(fr.result).split(',')[1] || ''); }; fr.onerror = function () { no(fr.error); }; fr.readAsDataURL(b); }); }
    function upload(rec) {
      var size = rec.blob.size, n = Math.ceil(size / AU_CH), d = new Date(rec.t + 9 * 3600e3).toISOString();
      var name = '수업녹음 ' + d.slice(0, 10) + ' ' + d.slice(11, 13) + '시' + d.slice(14, 16) + '분 (' + (rec.who || me) + ').' + (rec.ext || 'webm');
      UP = { id: rec.id, i: 0, n: n }; rpaint();
      function part(i, tries) {
        return blob64(rec.blob.slice(i * AU_CH, Math.min(size, (i + 1) * AU_CH))).then(function (data) {
          return fetch(API, { method: 'POST', body: JSON.stringify({ action: 'aup', code: code(), up: { id: rec.id, i: i, n: n, size: size, mime: rec.mime, name: name, data: data, retry: tries > 0 } }) }).then(function (r) { return r.json(); });
        }).then(function (j) {
          if (j && j.ok && j.done) return j;
          if (j && j.ok) { UP.i = i + 1; rpaint(); return part(i + 1, 0); }
          if (j && j.err === 'session') return part(0, 0);   // 드라이브가 이어 올리기를 잊었으면 처음부터
          throw j || {};
        }, function (e) { throw { net: 1 }; }).catch(function (e) {
          if (e && (e.err === 'code' || e.err === 'bad')) throw e;
          if (tries < 4) return new Promise(function (ok) { setTimeout(ok, 1500 * (tries + 1)); }).then(function () { return part(i, tries + 1); });
          throw e;
        });
      }
      part(0, 0).then(function (j) {
        var a = { id: j.id, name: name.replace(/\.\w+$/, ''), dur: Math.round(rec.dur / 1000), size: size, mime: rec.mime };
        if (!ED) open(null); else keepText();
        ED.audio = (ED.audio || []).concat([a]); saveDraft();
        AUD[a.id] = PURL[rec.id] || URL.createObjectURL(rec.blob); delete PURL[rec.id];
        PEND = PEND.filter(function (x) { return x.id !== rec.id; }); IDB.del(rec.id).catch(function () {});
        UP = null; rpaint(); draw();
        toast('드라이브에 저장했어요. 글을 저장하면 공부방에 녹음이 함께 쌓여요');
      }).catch(function (e) {
        UP = null; rpaint();
        toast(e && e.err === 'code' ? '가족 암호가 맞지 않아요' : '드라이브에 올리지 못했어요. 녹음은 이 기기에 남아 있으니 다시 눌러 주세요');
      });
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.id === 'rc-go') { rstart(); return; }
      if (b.id === 'rc-stop') { rstop(); return; }
      var r = PEND.filter(function (x) { return x.id === (b.dataset.pv || b.dataset.up || b.dataset.dl || b.dataset.pdel); })[0]; if (!r) return;
      if (b.dataset.pv) { PURL[r.id] = URL.createObjectURL(r.blob); rpaint(); return; }
      if (b.dataset.up) { if (!UP) upload(r); return; }
      if (b.dataset.dl) { var a = document.createElement('a'); a.href = PURL[r.id] || URL.createObjectURL(r.blob); a.download = '수업녹음-' + new Date(r.t + 9 * 3600e3).toISOString().slice(0, 10) + '.' + (r.ext || 'webm'); document.body.appendChild(a); a.click(); a.remove(); return; }
      if (b.dataset.pdel) { if (!confirm('이 녹음을 이 기기에서 지울까요?\n드라이브에 올리지 않았다면 되살릴 수 없어요.')) return; PEND = PEND.filter(function (x) { return x.id !== r.id; }); IDB.del(r.id).catch(function () {}); rpaint(); }
    });
    window.addEventListener('beforeunload', function (e) { if (RC.on || UP) { e.preventDefault(); e.returnValue = ''; } });
    IDB.all().then(function (L) { if (L && L.length) { PEND = L.filter(function (r) { return r && r.blob; }).sort(function (a, b) { return a.t - b.t; }); rpaint(); } }).catch(function () {});
    rpaint();
    draw(); load();
    return { reload: load };
  }
  window.MOKGAGU_WRITE = { mount: mount };
})();

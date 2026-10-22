/* 사진 올리기·보기 공용 — 질문 창, 공부방 「바로 쓰기」가 함께 쓴다.
   - 사진은 기기에서 줄여(큰 사진 긴 변 1800px, 작은 사진 480px) 소장품 사진과 같은 비공개 드라이브 폴더에 올리고,
     시트에는 사진 id({f: 큰 사진, t: 작은 사진, c: 설명})만 적는다. 보려면 가족 암호가 필요하다.
   - MOKGAGU_PHOTO.pick(max, 이미 있는 장수, 진행표시, 끝났을 때)  파일을 고르고 올림 → [{f,t}]
   - MOKGAGU_PHOTO.thumbs(사진들, 묶음이름, 옵션) → 작은 사진 HTML (누르면 큰 사진 창, 좌우로 넘기기·확대)
   - MOKGAGU_PHOTO.fill(요소)  요소 안의 작은 사진을 채운다 (thumbs 로 그린 뒤 꼭 불러야 함) */
(function () {
  if (window.MOKGAGU_PHOTO) return;
  var API = 'https://script.google.com/macros/s/AKfycbyQoDpYNaIA034Inb2J-SaW5-dhstcZQBJWOug7FxJKnP-evddQtprYUontg5GlSvkyBA/exec';
  function code() { try { return localStorage.getItem('mokgagu_cm_code') || localStorage.getItem('mokgagu_study_pw') || ''; } catch (e) { return ''; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = document.createElement('style');
  css.textContent =
    '.mp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0 0}' +
    '.mp-th{position:relative;width:68px;height:68px;border-radius:9px;overflow:hidden;background:#ece7de;border:1px solid #ddd6c9;flex:none}' +
    '.mp-th.big{width:92px;height:92px}' +
    '.mp-th button.mp-open{display:block;width:100%;height:100%;padding:0;border:0;background:none;cursor:zoom-in}' +
    '.mp-th img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.mp-th .mp-x{position:absolute;top:2px;right:2px;width:22px;height:22px;border-radius:50%;border:0;background:rgba(17,17,17,.82);color:#fff;font-size:13px;line-height:22px;padding:0;cursor:pointer}' +
    '.mp-th .mp-n{position:absolute;left:0;bottom:0;right:0;background:rgba(17,17,17,.6);color:#fff;font-size:10.5px;padding:1px 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.mp-add{width:68px;height:68px;border-radius:9px;border:1.5px dashed #9a9387;background:#fff;color:#5d574d;font:inherit;font-size:11.5px;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0;flex:none}' +
    '.mp-add b{font-size:22px;line-height:1;font-weight:500}' +
    '.mp-add:disabled{opacity:.5}' +
    '.mp-busy{font-size:12.5px;color:#756e65;font-weight:700}' +
    '.mp-dlg{border:0;padding:0;background:#111;color:#fff;max-width:100vw;max-height:100vh;width:100vw;height:100dvh;margin:0}' +
    '.mp-dlg::backdrop{background:rgba(0,0,0,.85)}' +
    '.mp-area{position:absolute;inset:0 0 64px 0;display:flex;align-items:center;justify-content:center}' +
    '.mp-area img{max-width:100%;max-height:100%;object-fit:contain}' +
    '.mp-bar{position:absolute;left:0;right:0;bottom:0;height:64px;display:flex;gap:8px;align-items:center;justify-content:center;padding:0 10px;background:#000}' +
    '.mp-bar button{font:inherit;font-size:14px;font-weight:700;border:1px solid #666;background:#1c1c1c;color:#fff;border-radius:10px;padding:9px 14px;cursor:pointer}' +
    '.mp-cap{position:absolute;left:0;right:0;top:0;padding:10px 56px 10px 14px;font-size:13.5px;line-height:1.5;background:linear-gradient(#000a,#0000);z-index:2;pointer-events:none}';
  document.head.appendChild(css);

  /* 이 기기에 사진 담아 두기 */
  var dbp = null;
  function db() { return dbp || (dbp = new Promise(function (ok, no) { var r = indexedDB.open('mokgagu_qimg', 1); r.onupgradeneeded = function () { r.result.createObjectStore('img'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; })); }
  function idbGet(k) { return db().then(function (d) { return new Promise(function (ok) { var q = d.transaction('img').objectStore('img').get(k); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(null); }; }); }).catch(function () { return null; }); }
  function idbPut(k, v) { db().then(function (d) { d.transaction('img', 'readwrite').objectStore('img').put(v, k); }).catch(function () {}); }

  /* 시트에서 받기: 한 번에 4장씩 */
  var urls = {}, inflight = {}, netQ = [], netN = 0;
  function pump() {
    while (netN < 4 && netQ.length) {
      var j = netQ.shift(); netN++;
      (function (j) {
        fetch(API + '?action=cimg&id=' + encodeURIComponent(j.id) + '&code=' + encodeURIComponent(code()), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(j.ok, j.no).then(function () { netN--; pump(); });
      })(j);
    }
  }
  function netGet(id, front) { return new Promise(function (ok, no) { var job = { id: id, ok: ok, no: no }; if (front) netQ.unshift(job); else netQ.push(job); pump(); }); }
  function b2blob(b64, type) { var s = atob(b64), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Blob([u], { type: type || 'image/jpeg' }); }
  function url(id, front) {
    if (!id) return Promise.resolve('');
    if (urls[id]) return Promise.resolve(urls[id]);
    if (inflight[id]) return inflight[id];
    return inflight[id] = idbGet(id).then(function (blob) {
      if (blob) return blob;
      return netGet(id, front).then(function (j) { if (!j || !j.ok) return null; var b = b2blob(j.data, j.type); idbPut(id, b); return b; });
    }).then(function (blob) { delete inflight[id]; if (!blob) return ''; return (urls[id] = URL.createObjectURL(blob)); }, function () { delete inflight[id]; return ''; });
  }
  function fill(root) {
    [].forEach.call((root || document).querySelectorAll('img[data-pid]'), function (img) {
      if (img.dataset.ok) return; img.dataset.ok = '1';
      url(img.dataset.pid).then(function (u) { if (u) img.src = u; else img.alt = '사진 없음'; });
    });
  }

  /* 사진 줄이기·올리기 */
  function decode(file) {
    return new Promise(function (ok, no) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { ok(im); }; im.onerror = function () { URL.revokeObjectURL(u); no(new Error('decode')); }; im.src = u;
    });
  }
  function shrink(im, max, qual) {
    var w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, s = Math.min(1, max / Math.max(w, h));
    var c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
    var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
    return new Promise(function (ok) { c.toBlob(ok, 'image/jpeg', qual); });
  }
  function toB64(blob) { return new Promise(function (ok) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(',')[1]); }; r.readAsDataURL(blob); }); }
  function post(body) { body.code = code(); return fetch(API, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
  function uploadOne(file) {
    return decode(file).then(function (im) { return Promise.all([shrink(im, 1800, 0.82), shrink(im, 480, 0.7)]); }).then(function (bl) {
      return Promise.all([toB64(bl[0]), toB64(bl[1])]).then(function (b) {
        return post({ action: 'cphoto', data: b[0], name: 'note-full' }).then(function (j1) {
          if (!j1 || !j1.ok) throw j1 || new Error('up');
          return post({ action: 'cphoto', data: b[1], name: 'note-thumb' }).then(function (j2) {
            if (!j2 || !j2.ok) throw j2 || new Error('up');
            idbPut(j1.id, bl[0]); idbPut(j2.id, bl[1]);
            return { f: j1.id, t: j2.id };
          });
        });
      });
    });
  }
  /* 파일 고르기 → 올리기. max: 최대 장수, have: 이미 붙은 장수, prog(문구), done(새 사진들) */
  function pick(max, have, prog, done) {
    var room = max - have;
    if (room <= 0) { prog('사진은 ' + max + '장까지 붙일 수 있어요'); return; }
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true; inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('change', function () {
      var files = [].slice.call(inp.files || [], 0, room); document.body.removeChild(inp);
      if (!files.length) return;
      var out = [], i = 0, fail = 0;
      (function next() {
        if (i >= files.length) { prog(fail ? '올리지 못한 사진 ' + fail + '장이 있어요. 인터넷 연결을 확인해 주세요' : ''); done(out); return; }
        prog('사진 올리는 중… ' + (i + 1) + ' / ' + files.length);
        uploadOne(files[i]).then(function (p) { out.push(p); }, function () { fail++; }).then(function () { i++; next(); });
      })();
    });
    inp.click();
  }

  /* 작은 사진 줄 + 큰 사진 창 */
  var groups = {};
  function thumbs(list, gid, o) {
    o = o || {}; list = list || []; groups[gid] = list;
    return list.map(function (p, i) {
      return '<span class="mp-th' + (o.big ? ' big' : '') + '"><button type="button" class="mp-open" data-g="' + esc(gid) + '" data-i="' + i + '" aria-label="사진 크게 보기"><img data-pid="' + esc(p.t || p.f) + '" alt=""></button>' +
        (o.del ? '<button type="button" class="mp-x" data-mpx="' + i + '" aria-label="사진 빼기">×</button>' : '') + (o.cap && p.c ? '<span class="mp-n">' + esc(p.c) + '</span>' : '') + '</span>';
    }).join('');
  }
  var dlg = null, area = null, capEl = null, cur = { g: '', i: 0 };
  function build() {
    dlg = document.createElement('dialog'); dlg.className = 'mp-dlg'; dlg.setAttribute('aria-label', '사진 크게 보기');
    dlg.innerHTML = '<div class="mp-cap" id="mp-cap"></div><div class="mp-area" id="mp-area"><img alt=""></div><div class="mp-bar"><button type="button" data-mpn="-1">← 이전</button><button type="button" data-mpn="0">닫기</button><button type="button" data-mpn="1">다음 →</button></div>';
    document.body.appendChild(dlg); area = dlg.querySelector('#mp-area'); capEl = dlg.querySelector('#mp-cap');
    dlg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mpn]'); if (!b) return;
      var d = +b.dataset.mpn; if (!d) dlg.close(); else step(d);
    });
    if (window.MOKGAGU_PHOTOZOOM) window.MOKGAGU_PHOTOZOOM.attach({ dialog: dlg, area: area, next: function () { step(1); }, prev: function () { step(-1); }, canNext: function () { return cur.i < (groups[cur.g] || []).length - 1; }, canPrev: function () { return cur.i > 0; } });
  }
  function step(d) { var L = groups[cur.g] || []; var n = cur.i + d; if (n < 0 || n >= L.length) return; show(cur.g, n); }
  function show(g, i) {
    var L = groups[g] || [], p = L[i]; if (!p) return; cur = { g: g, i: i };
    if (!dlg) build();
    var img = area.querySelector('img'); img.removeAttribute('src');
    capEl.textContent = (i + 1) + ' / ' + L.length + (p.c ? ' · ' + p.c : '');
    var want = p.f || p.t;
    url(p.t || p.f, true).then(function (u0) { if (cur.g === g && cur.i === i && u0 && !img.src) img.src = u0; });
    url(want, true).then(function (u) { if (cur.g === g && cur.i === i && u) img.src = u; });
    if (!dlg.open) dlg.showModal();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button.mp-open'); if (!b) return;
    e.preventDefault(); e.stopPropagation(); show(b.dataset.g, +b.dataset.i);
  }, true);

  window.MOKGAGU_PHOTO = { pick: pick, thumbs: thumbs, fill: fill, url: url, esc: esc, open: show };
})();

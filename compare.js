/* 기물 나란히 비교 (최대 3점) — 모든 페이지 공통.
   · 기물 사진 창에 「비교에 담기」 단추를 단다 (공유 단추 옆).
   · 담은 기물은 이 기기에 기억하고, 화면 아래 작은 띠에 보여 준다. 「나란히 보기」는 compare.html. */
(function () {
  if (window.MOKGAGU_CMP) return;
  var KEY = 'mokgagu_cmp', MAX = 3;
  var path = location.pathname.split('/').pop();
  function load() { try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.slice(0, MAX) : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  var api = window.MOKGAGU_CMP = { list: load, max: MAX, remove: function (k) { save(load().filter(function (x) { return x.k !== k; })); paint(); }, clear: function () { save([]); paint(); } };

  var css = document.createElement('style');
  css.textContent =
    '.cmpbtn{position:absolute;top:8px;left:84px;z-index:5;background:#fff;color:#111;border:1.5px solid #111;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;line-height:1.4}' +
    '.cmpbtn.on{background:#111;color:#fff}' +
    '#cmp-tray{position:fixed;left:12px;bottom:12px;z-index:2147482000;display:none;align-items:center;gap:8px;background:#fff;border:2px solid #111;border-radius:16px;padding:8px 10px;box-shadow:0 6px 18px rgba(0,0,0,.18);max-width:calc(100vw - 24px);font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}' +
    '#cmp-tray .th{position:relative;width:40px;height:40px;flex:none}#cmp-tray .th img{width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid #e5e1da;display:block}' +
    '#cmp-tray .th button{position:absolute;top:-7px;right:-7px;width:18px;height:18px;border-radius:50%;border:1.5px solid #111;background:#fff;font-size:11px;line-height:1;padding:0;cursor:pointer}' +
    '#cmp-tray .tx{font-size:12px;color:#6b665e;white-space:nowrap}#cmp-tray .tx b{color:#111;font-size:13px;display:block}' +
    '#cmp-tray a.go{background:#111;color:#fff;border-radius:999px;padding:8px 14px;font-weight:800;font-size:13px;text-decoration:none;white-space:nowrap}' +
    '#cmp-tray a.go.off{background:#bdb8ae;pointer-events:none}' +
    '#cmp-tray .x{border:0;background:none;color:#6b665e;font-size:12px;text-decoration:underline;cursor:pointer;padding:4px;font-family:inherit}' +
    '#cmp-toast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:#111;color:#fff;padding:9px 16px;border-radius:999px;font-size:13px;z-index:2147483600;font-family:inherit}';
  document.head.appendChild(css);

  function say(t) { var d = document.createElement('div'); d.id = 'cmp-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1800); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* 검색 색인(search.js)은 필요할 때만 불러온다 */
  var idxP = null;
  function loadIdx() {
    if (window.SEARCH) return Promise.resolve();
    if (!idxP) idxP = new Promise(function (ok) { var s = document.createElement('script'); s.src = 'search.js'; s.onload = ok; s.onerror = function () { idxP = null; ok(); }; document.head.appendChild(s); });
    return idxP;
  }
  /* 지금 사진 창이 보여 주는 기물: 큰 사진(…/photos/<도록>/<번호>.jpg)이거나 작은 사진(thumbs/<도록>/<순번>.jpg) 주소에서 읽는다 */
  function parse(dlg) {
    var ims = dlg.querySelectorAll('img'), th = null;
    for (var i = 0; i < ims.length; i++) {
      var src = ims[i].currentSrc || ims[i].src || '', m = src.match(/\/photos\/([^\/]+)\/([^\/?#]+)\.jpg/);
      if (m) return { b: m[1], pid: decodeURIComponent(m[2]), u: src };
      var t = src.match(/\/thumbs\/([^\/]+)\/(\d+)\.jpg/);
      if (t && !th) th = { b: t[1], n: +t[2], u: src };
    }
    return th;
  }
  function resolve(c) {
    if (!c || c.pid) return Promise.resolve(c);
    return loadIdx().then(function () {
      var r = (window.SEARCH || []).filter(function (x) { return x.b === c.b && +x.n === c.n; })[0];
      return r ? { b: c.b, pid: String(r.pid), u: c.u } : null;
    });
  }
  function current(dlg) {   /* 이미 알 수 있으면 바로(동기) */
    var c = parse(dlg); if (!c) return null; if (c.pid) return c;
    if (window.SEARCH) { var r = window.SEARCH.filter(function (x) { return x.b === c.b && +x.n === c.n; })[0]; return r ? { b: c.b, pid: String(r.pid), u: c.u } : null; }
    return c;
  }
  window.MOKGAGU_WHO = function (dlg) { return resolve(parse(dlg)); };
  function nameOf(dlg) {
    var e = dlg.querySelector('#d-info h1,#d-info h2,#d-info h3,#d-info b,#d-info strong,h1,h2,h3,.d-name,.d-title');
    return (e && e.textContent.trim().split('\n')[0]) || '';
  }
  function has(k) { return load().some(function (x) { return x.k === k; }); }

  function attach(dlg) {
    if (path === 'compare.html') return;
    var b = dlg.querySelector('.cmpbtn');
    if (!b) {
      b = document.createElement('button'); b.type = 'button'; b.className = 'cmpbtn';
      b.onclick = function (ev) {
        ev.stopPropagation();
        resolve(parse(dlg)).then(function (c) {
          if (!c || !c.pid) { say('이 기물은 사진이 없어 비교에 담을 수 없어요'); return; }
          var k = c.b + '/' + c.pid, a = load();
          if (has(k)) { a = a.filter(function (x) { return x.k !== k; }); save(a); say('비교에서 뺐어요'); }
          else {
            if (a.length >= MAX) { say('비교는 ' + MAX + '점까지예요. 띠에서 하나를 빼 주세요'); return; }
            a.push({ k: k, n: nameOf(dlg), u: c.u }); save(a); say(a.length + '점 담았어요' + (a.length > 1 ? ' — 아래 「나란히 보기」' : ''));
          }
          paint(); sync(dlg);
        });
      };
      dlg.appendChild(b);
    }
    sync(dlg);
  }
  function sync(dlg) {
    var b = dlg.querySelector('.cmpbtn'); if (!b) return;
    var s = dlg.querySelector('.shr'); b.style.left = s ? (s.offsetLeft + s.offsetWidth + 8) + 'px' : '8px';
    var p = parse(dlg), c = current(dlg), on = c && c.pid && has(c.b + '/' + c.pid);
    if (p && !p.pid && !window.SEARCH) loadIdx().then(function () { sync(dlg); });
    b.className = 'cmpbtn' + (on ? ' on' : ''); b.textContent = on ? '✓ 비교에 담김' : '비교에 담기';
    b.style.display = p ? '' : 'none';
  }
  function scan() { document.querySelectorAll('dialog[open]').forEach(attach); }
  new MutationObserver(function () { scan(); }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['open', 'src'] });
  document.addEventListener('DOMContentLoaded', function () { scan(); setTimeout(scan, 600); });
  document.addEventListener('load', function (e) { var t = e.target; if (t && t.tagName === 'IMG') { var d = t.closest && t.closest('dialog[open]'); if (d) sync(d); } }, true);

  var tray;
  function paint() {
    if (path === 'compare.html') return;
    var a = load();
    if (!tray) { tray = document.createElement('div'); tray.id = 'cmp-tray'; tray.setAttribute('role', 'region'); tray.setAttribute('aria-label', '비교에 담은 기물'); document.body.appendChild(tray); }
    if (!a.length) { tray.style.display = 'none'; return; }
    tray.style.display = 'flex';
    tray.innerHTML = a.map(function (x) { return '<span class="th" title="' + esc(x.n) + '"><img src="' + esc(x.u) + '" alt="' + esc(x.n) + '"><button type="button" data-rm="' + esc(x.k) + '" aria-label="' + esc(x.n) + ' 빼기">×</button></span>'; }).join('') +
      '<span class="tx"><b>' + a.length + '/' + MAX + '점</b>비교에 담음</span>' +
      '<a class="go' + (a.length < 2 ? ' off' : '') + '" href="compare.html">' + (a.length < 2 ? '2점부터' : '나란히 보기') + '</a><button type="button" class="x" data-clr="1">비우기</button>';
  }
  document.addEventListener('click', function (e) {
    var r = e.target.closest && e.target.closest('[data-rm]'); if (r) { api.remove(r.getAttribute('data-rm')); scan(); return; }
    if (e.target.closest && e.target.closest('[data-clr]')) { api.clear(); scan(); }
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { paint(); scan(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();
})();

/* 최근 본 기물 — 화면 오른쪽 아래 떠 있는 창.
   어느 도록에서든 사진 창(dialog#dlg)을 열면 그 기물을 기억해 두고(이 브라우저에만, 최대 10개),
   썸네일을 3개씩 보여 준다. ▲▼로 앞뒤 기물, 맨 아래 ↑ 단추로 맨 위로.
   썸네일을 누르면 첫 화면(index.html)에서 그 기물 사진 창이 열린다. */
(function () {
  var KEY = 'mokgagu_recent_v1', MAX = 10, SHOW = 3;
  function load() { try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  var list = load(), start = 0;

  var css = document.createElement('style');
  css.textContent = [
    '#to-top{display:none!important}',
    '#rv{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;flex-direction:column;align-items:center;gap:8px;font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif}',
    '#rv .rv-box{background:#fff;border:1px solid #e3ded6;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.14);padding:8px 7px;display:flex;flex-direction:column;align-items:center;gap:6px;width:86px}',
    '#rv .rv-t{font-size:11.5px;font-weight:700;color:#3b3833;letter-spacing:-.2px;text-align:center;line-height:1.25}',
    '#rv .rv-t small{display:block;font-weight:400;color:#8a837a;font-size:10.5px}',
    '#rv .rv-nav{width:100%;height:20px;border:0;background:#f3f0eb;border-radius:6px;cursor:pointer;display:grid;place-items:center;color:#3b3833;padding:0}',
    '#rv .rv-nav:disabled{opacity:.3;cursor:default}',
    '#rv .rv-nav svg{width:14px;height:14px}',
    '#rv .rv-it{display:block;width:70px;height:70px;border-radius:8px;overflow:hidden;border:1px solid #ece8e1;background:#faf9f6;cursor:pointer;padding:0;position:relative}',
    '#rv .rv-it img{width:100%;height:100%;object-fit:contain;display:block}',
    '#rv .rv-it span{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);color:#fff;font-size:10px;line-height:1.3;padding:1px 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transition:opacity .15s}',
    '#rv .rv-it:hover span,#rv .rv-it:focus-visible span{opacity:1}',
    '#rv .rv-top{width:48px;height:48px;border-radius:50%;border:0;background:#1d1b18;color:#fff;cursor:pointer;display:grid;place-items:center;box-shadow:0 6px 16px rgba(0,0,0,.22)}',
    '#rv .rv-top svg{width:22px;height:22px}',
    '#rv .rv-fold{border:0;background:none;color:#8a837a;font-size:10.5px;cursor:pointer;padding:0;text-decoration:underline}',
    '#rv.folded .rv-list,#rv.folded .rv-nav{display:none}',
    '@media (max-width:720px){#rv{right:10px;bottom:10px;gap:6px}#rv .rv-box{width:62px;padding:6px 5px;gap:5px;border-radius:12px}#rv .rv-it{width:50px;height:50px;border-radius:7px}#rv .rv-t{font-size:10.5px}#rv .rv-t small{display:none}#rv .rv-top{width:42px;height:42px}#rv .rv-top svg{width:20px;height:20px}#rv .rv-nav{height:18px}}',
    '@media print{#rv{display:none}}'
  ].join('');
  document.head.appendChild(css);

  var up = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  var down = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var top = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';

  var root = document.createElement('div'); root.id = 'rv';
  root.innerHTML = '<div class="rv-box" role="region" aria-label="최근 본 기물">' +
    '<div class="rv-t">최근 본 기물<small id="rv-n"></small></div>' +
    '<button type="button" class="rv-nav" id="rv-prev" aria-label="더 최근에 본 기물">' + up + '</button>' +
    '<div class="rv-list" id="rv-list" style="display:flex;flex-direction:column;gap:6px"></div>' +
    '<button type="button" class="rv-nav" id="rv-next" aria-label="이전에 본 기물">' + down + '</button>' +
    '<button type="button" class="rv-fold" id="rv-fold">접기</button>' +
    '</div><button type="button" class="rv-top" id="rv-top" aria-label="맨 위로" title="맨 위로">' + top + '</button>';
  function mount() { document.body.appendChild(root); render(); }

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function render() {
    var box = root.querySelector('.rv-box');
    box.style.display = list.length ? '' : 'none';
    if (start > Math.max(0, list.length - SHOW)) start = Math.max(0, list.length - SHOW);
    var view = list.slice(start, start + SHOW);
    root.querySelector('#rv-list').innerHTML = view.map(function (r, k) {
      return '<button type="button" class="rv-it" data-k="' + (start + k) + '" title="' + esc(r.name) + '"><img alt="' + esc(r.name) + '" src="' + esc(r.th) + '"><span>' + esc(r.name) + '</span></button>';
    }).join('');
    root.querySelector('#rv-n').textContent = list.length > SHOW ? (start + 1) + '–' + Math.min(start + SHOW, list.length) + ' / ' + list.length : list.length + '점';
    root.querySelector('#rv-prev').disabled = start === 0;
    root.querySelector('#rv-next').disabled = start + SHOW >= list.length;
    var p = root.querySelector('#rv-prev'), n = root.querySelector('#rv-next');
    p.style.visibility = n.style.visibility = list.length > SHOW ? '' : 'hidden';
    try { root.classList.toggle('folded', localStorage.getItem(KEY + '_fold') === '1'); } catch (e) {}
    root.querySelector('#rv-fold').textContent = root.classList.contains('folded') ? '펼치기' : '접기';
  }
  root.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.id === 'rv-top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (t.id === 'rv-prev') { start = Math.max(0, start - 1); render(); return; }
    if (t.id === 'rv-next') { start = Math.min(Math.max(0, list.length - SHOW), start + 1); render(); return; }
    if (t.id === 'rv-fold') { var f = !root.classList.contains('folded'); try { localStorage.setItem(KEY + '_fold', f ? '1' : '0'); } catch (x) {} render(); return; }
    if (t.classList.contains('rv-it')) {
      var r = list[+t.dataset.k]; if (!r) return;
      var target = 'see=' + encodeURIComponent(r.b) + '/' + encodeURIComponent(r.pid);
      if (window.RV_OPEN && /(^|\/)(index\.html)?$/.test(location.pathname)) { location.hash = target; }
      else location.href = 'index.html#' + target;
    }
  });

  // 사진 창이 열려 있는 동안 사진 주소가 photos/<도록>/<id>.jpg 로 바뀌면 그 기물을 기억한다
  function record(img) {
    var dlg = img.closest('dialog'); if (!dlg || !dlg.open) return;
    var src = img.getAttribute('src') || '';
    var m = src.match(/(?:^|\/)photos\/([a-z]+)\/([^\/?#]+)\.jpg/); if (!m) return;
    var b = m[1], pid = decodeURIComponent(m[2]);
    var h = dlg.querySelector('h3'); var name = h ? (h.childNodes[0] && h.childNodes[0].textContent || h.textContent) : (img.alt || '');
    name = name.trim().split(/\s+[㐀-鿿豈-﫿]/)[0].trim() || img.alt || '';
    function put(th) {
      list = list.filter(function (r) { return !(r.b === b && r.pid === pid); });
      list.unshift({ b: b, pid: pid, name: name, th: th, t: Date.now() });
      if (list.length > MAX) list.length = MAX;
      save(list); start = 0; render();
    }
    function snap() {
      try {
        var c = document.createElement('canvas'), s = 140, w = img.naturalWidth, hh = img.naturalHeight; if (!w || !hh) return put(src);
        var k = Math.min(s / w, s / hh); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(hh * k));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); put(c.toDataURL('image/jpeg', 0.82));
      } catch (e) { put(src); }
    }
    if (img.complete && img.naturalWidth && (img.currentSrc || '').indexOf('/photos/' + b + '/') !== -1) snap();
    else img.addEventListener('load', function once() { img.removeEventListener('load', once); if ((img.getAttribute('src') || '') === src) snap(); });
  }
  function watch() {
    document.querySelectorAll('dialog img').forEach(function (img) {
      new MutationObserver(function () { record(img); }).observe(img, { attributes: true, attributeFilter: ['src'] });
    });
    document.querySelectorAll('dialog').forEach(function (d) {
      new MutationObserver(function () { if (d.open) d.querySelectorAll('img').forEach(record); }).observe(d, { attributes: true, attributeFilter: ['open'] });
    });
  }
  window.addEventListener('storage', function (e) { if (e.key === KEY) { list = load(); render(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); watch(); });
  else { mount(); watch(); }
})();

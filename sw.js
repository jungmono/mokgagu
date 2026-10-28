/* 조선의 목가구 — 서비스워커
   · 화면(HTML·JS·CSS·암호화 자료): 인터넷이 되면 항상 최신을 가져오고, 안 되면 마지막에 본 것을 보여 준다
     (포털이 자주 고쳐져도 옛 화면이 남지 않고, 답십리·박물관처럼 신호가 약한 곳에서도 열린다).
   · 작은 썸네일·아이콘: 한 번 본 것은 저장해 두고 바로 보여 준다.
   · 검색 색인(search.js)은 저장본을 먼저 쓰고 뒤에서 갱신한다(1.7MB를 매번 받지 않도록).
   · 큰 원본 사진(photos/)과 다른 사이트(구글 시트·글꼴)는 건드리지 않는다. */
var VER = 'v3';
var PAGES = 'mk-pages-' + VER, IMGS = 'mk-imgs-' + VER, MAX_IMGS = 2500;

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== PAGES && k !== IMGS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

var puts = 0;
function maybeTrim(name, max) { if (++puts % 50 === 0) trim(name, max); }   /* 저장할 때마다가 아니라 50번에 한 번만 정리 */
function trim(name, max) {
  return caches.open(name).then(function (c) {
    return c.keys().then(function (ks) { if (ks.length > max) return Promise.all(ks.slice(0, ks.length - max).map(function (k) { return c.delete(k); })); });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;           // 구글 시트·글꼴 등은 그대로
  var p = url.pathname;
  if (p.indexOf('/photos/') >= 0) return;               // 큰 원본 사진은 저장하지 않음

  if (/\/(thumbs|icons|covers|symbols)\//.test(p) || /\.(png|svg|webp)$/.test(p)) {   // 이미지: 저장해 둔 것 먼저
    e.respondWith(caches.open(IMGS).then(function (c) {
      return c.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (r) { if (r.ok) { c.put(req, r.clone()); maybeTrim(IMGS, MAX_IMGS); } return r; });
      });
    }));
    return;
  }
  /* 큰 정적 스크립트(검색 색인): 저장본을 바로 쓰고, 뒤에서 새로 받아 둔다(다음에 열 때 최신) */
  if (/\/search\.js$/.test(p)) {
    e.respondWith(caches.open(PAGES).then(function (c) {
      return c.match(req, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(req).then(function (r) { if (r.ok) c.put(req, r.clone()); return r; });
        if (hit) { net.catch(function () {}); return hit; }
        return net;
      });
    }));
    return;
  }
  /* 화면·스크립트·자료: 네트워크 먼저, 안 되면 저장본.
     GitHub Pages는 10분 동안 브라우저 저장본을 써도 된다고 보내므로, 고친 화면이 바로 보이도록
     늘 서버에 바뀌었는지 묻는다(cache:'no-cache' — 안 바뀌었으면 짧은 304만 오가서 가볍다) (2026-10-28) */
  var fresh = req.mode === 'navigate'
    ? new Request(req.url, { cache: 'no-cache', credentials: 'same-origin', redirect: 'manual' })
    : new Request(req, { cache: 'no-cache' });
  e.respondWith(fetch(fresh).then(function (r) {
    if (r.ok && r.type !== 'opaqueredirect') { var copy = r.clone(); caches.open(PAGES).then(function (c) { c.put(req, copy); }); }
    return r;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: false }).then(function (hit) { return hit || caches.match(req, { ignoreSearch: true }); });
  }));
});

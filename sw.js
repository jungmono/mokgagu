/* 조선의 목가구 — 서비스워커
   · 화면(HTML·JS·CSS·암호화 자료): 인터넷이 되면 항상 최신을 가져오고, 안 되면 마지막에 본 것을 보여 준다
     (포털이 자주 고쳐져도 옛 화면이 남지 않고, 답십리·박물관처럼 신호가 약한 곳에서도 열린다).
   · 작은 썸네일·아이콘: 한 번 본 것은 저장해 두고 바로 보여 준다.
   · 큰 원본 사진(photos/)과 다른 사이트(구글 시트·글꼴)는 건드리지 않는다. */
var VER = 'v2';
var PAGES = 'mk-pages-' + VER, IMGS = 'mk-imgs-' + VER, MAX_IMGS = 2500;

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== PAGES && k !== IMGS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

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
        return fetch(req).then(function (r) { if (r.ok) { c.put(req, r.clone()); trim(IMGS, MAX_IMGS); } return r; });
      });
    }));
    return;
  }
  /* 화면·스크립트·자료: 네트워크 먼저, 안 되면 저장본 */
  e.respondWith(fetch(req).then(function (r) {
    if (r.ok) { var copy = r.clone(); caches.open(PAGES).then(function (c) { c.put(req, copy); }); }
    return r;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: false }).then(function (hit) { return hit || caches.match(req, { ignoreSearch: true }); });
  }));
});

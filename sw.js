/* 홈 화면 설치용 최소 서비스 워커 — 일부러 아무것도 저장하지 않고 항상 네트워크에서 가져온다
   (포털이 자주 고쳐져서 옛 화면이 남는 일이 없게). */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { /* 기본 동작(네트워크) 그대로 */ });

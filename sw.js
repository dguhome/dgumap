// 자취지도 앱용 서비스 워커: 사이트 파일을 저장해두고, 인터넷이 끊기면 저장본을 보여줘요.
const CACHE = 'jachi-v1';
const FILES = ['./', './index.html', './자취도우미/index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => encodeURI(f)))).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// 내 사이트 파일만: 인터넷 먼저 시도 → 실패하면 저장본 (카카오맵 등 외부 요청은 건드리지 않음)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request))
  );
});

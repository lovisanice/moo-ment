// 离线缓存：装到主屏幕后没网也能打开。改了文件记得把 VERSION 加一
const VERSION = 'moo-ment-v4';
const FILES = [
  './', './index.html', './manifest.json',
  './css/base.css', './css/splash.css', './css/home.css', './css/sheet.css', './css/result.css', './css/moments.css',
  './js/store.js', './js/convert.js', './js/words.js', './js/ui.js', './js/splash.js', './js/savings.js',
  './js/treasures.js', './js/flow.js', './js/moments.js', './js/backup.js', './js/app.js',
  './assets/icon.png', './assets/icon-180.png', './assets/icon-512.png',
  './assets/splash-1.jpg', './assets/splash-2.jpg',
  './assets/bouquet.png', './assets/lying.png', './assets/calc.gif',
  './assets/wall-1.jpg', './assets/wall-2.jpg', './assets/tab-1.png', './assets/tab-2.png',
  './assets/fonts/tangyuan.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 先用缓存秒开，同时去网上拿新的更新缓存
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});

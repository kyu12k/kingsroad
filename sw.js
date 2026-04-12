// ========================================
// King's Road - Service Worker
// 게임 비활성화 상태에서도 복습 알림 표시
// ========================================
// FCM 백그라운드 알림은 firebase-messaging-sw.js에서 처리합니다.

const CACHE_NAME = 'kingsroad-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/manifest.json',
  '/images/image_0.webp',
  '/images/image_1.webp',
  '/images/image_2.webp',
  '/images/image_3.webp',
  '/images/image_4.webp',
  '/images/image_5.webp',
  '/images/image_6.webp',
  '/images/image_7.webp',
  '/images/image_8.webp',
  '/images/image_9.webp',
  '/images/image_10.webp',
  '/images/image_11.webp',
];

// ★ 설치 단계: 캐시 생성
self.addEventListener('install', event => {
  console.log('🔧 Service Worker 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ 캐시 생성 완료');
      return cache.addAll(urlsToCache).then(() => self.skipWaiting());
    })
  );
});

// ★ 활성화 단계
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker 활성화됨');
  event.waitUntil(
    caches.keys().then(keys => {
      const deletions = keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key));
      return Promise.all(deletions);
    }).then(() => self.clients.claim())
  );
});

// ★ 네트워크 요청 처리 (오프라인 대비)
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  const isCoreAsset = requestUrl.pathname === '/' ||
    requestUrl.pathname.endsWith('/index.html') ||
    requestUrl.pathname.endsWith('/game.js') ||
    requestUrl.pathname.endsWith('/style.css') ||
    requestUrl.pathname.endsWith('/manifest.json');

  if (event.request.mode === 'navigate' || isCoreAsset) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // 오프라인이면 캐시된 페이지 반환
      return caches.match('/index.html');
    })
  );
});

// 클라이언트에서 메시지 수신
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delayMs, title, body } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'review-notification',
        renotify: true
      });
    }, delayMs);
  }
  if (event.data && event.data.type === 'SCHEDULE_DAILY_NOTIFICATION') {
    const { delayMs, title, body } = event.data;
    function scheduleNext(delay) {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'daily-notification',
          renotify: true
        });
        scheduleNext(24 * 60 * 60 * 1000);
      }, delay);
    }
    scheduleNext(delayMs);
  }
});

// 알림 클릭 시 앱 포커스 또는 새 창 열기
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

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
    const { delayMs, title, body, tag } = event.data;
    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'review-notification',
      renotify: true
    };
    if ('TimestampTrigger' in self) {
      // OS 레벨 예약: SW가 종료되어도 알림 발화 보장
      options.showTrigger = new TimestampTrigger(Date.now() + delayMs);
      event.waitUntil(self.registration.showNotification(title, options));
    } else {
      // 폴백: 앱이 열려 있을 때만 작동 (SW 종료 시 소멸)
      setTimeout(() => {
        self.registration.showNotification(title, options);
      }, delayMs);
    }
  }
  if (event.data && event.data.type === 'SCHEDULE_DAILY_NOTIFICATION') {
    const { delayMs, title, body, timeStr } = event.data;
    const notifTag = timeStr ? `daily-${timeStr}` : 'daily-notification';
    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: notifTag,
      renotify: true
    };
    if ('TimestampTrigger' in self) {
      // OS 레벨 예약: 같은 tag로 덮어쓰기 되므로 중복 없음
      options.showTrigger = new TimestampTrigger(Date.now() + delayMs);
      event.waitUntil(self.registration.showNotification(title, options));
    } else {
      // 폴백: 다음 1회만 예약 (재귀 setTimeout 제거 — SW 종료 시 소멸하므로 의미 없음)
      setTimeout(() => {
        self.registration.showNotification(title, options);
      }, delayMs);
    }
  }
});

// 알림 클릭 시 앱 포커스 또는 새 창 열기, 매일 알림은 다음 날 재예약
self.addEventListener('notificationclick', event => {
  const tag = event.notification.tag;
  const notifTitle = event.notification.title;
  const notifBody = event.notification.body;
  event.notification.close();
  event.waitUntil(
    Promise.all([
      // 앱 포커스
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow('/');
      }),
      // 매일 알림 클릭 시 다음 날 동일 시각 재예약 (TimestampTrigger 지원 환경)
      (() => {
        if (tag && tag.startsWith('daily-') && 'TimestampTrigger' in self) {
          const timeStr = tag.replace('daily-', '');
          if (/^\d{2}:\d{2}$/.test(timeStr)) {
            const [h, m] = timeStr.split(':').map(Number);
            const next = new Date();
            next.setDate(next.getDate() + 1);
            next.setHours(h, m, 0, 0);
            return self.registration.showNotification(notifTitle, {
              body: notifBody,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag,
              renotify: true,
              showTrigger: new TimestampTrigger(next.getTime())
            });
          }
        }
        return Promise.resolve();
      })()
    ])
  );
});

// 매일 알림 닫기(무시) 시에도 다음 날 재예약
self.addEventListener('notificationclose', event => {
  const tag = event.notification.tag;
  if (tag && tag.startsWith('daily-') && 'TimestampTrigger' in self) {
    const timeStr = tag.replace('daily-', '');
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      const [h, m] = timeStr.split(':').map(Number);
      const next = new Date();
      next.setDate(next.getDate() + 1);
      next.setHours(h, m, 0, 0);
      event.waitUntil(
        self.registration.showNotification(event.notification.title, {
          body: event.notification.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag,
          renotify: true,
          showTrigger: new TimestampTrigger(next.getTime())
        })
      );
    }
  }
});

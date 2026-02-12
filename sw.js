// ========================================
// King's Road - Service Worker
// 게임 비활성화 상태에서도 복습 알림 표시
// ========================================

const CACHE_NAME = 'kingsroad-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/manifest.json'
];

// ★ 설치 단계: 캐시 생성
self.addEventListener('install', event => {
  console.log('🔧 Service Worker 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ 캐시 생성 완료');
      return self.skipWaiting();
    })
  );
});

// ★ 활성화 단계
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker 활성화됨');
  event.waitUntil(self.clients.claim());
});

// ★ 네트워크 요청 처리 (오프라인 대비)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // 오프라인이면 캐시된 페이지 반환
      return caches.match('/index.html');
    })
  );
});

// ★ 주기적인 복습 상태 확인 (Background Sync)
self.addEventListener('sync', event => {
  if (event.tag === 'check-forgotten-stages') {
    event.waitUntil(checkAndNotifyForgotten());
  }
});

// ★ 복습 필요 스테이지 확인 및 알림
async function checkAndNotifyForgotten() {
  try {
    // 로컬스토리지에서 게임 데이터 읽기
    // (Service Worker는 localStorage에 직접 접근 불가하므로 클라이언트에서 전달받음)
    
    const clients = await self.clients.matchAll({ type: 'window' });
    
    // 클라이언트가 없으면 (게임이 닫혀있으면) 저장된 알림 데이터 확인
    if (clients.length === 0) {
      const dbName = 'kingsroad_notifications';
      const notificationData = await getFromClientStorage(dbName);
      
      if (notificationData && notificationData.forgottenStages && notificationData.forgottenStages.length > 0) {
        // 알림 표시
        const count = notificationData.forgottenStages.length;
        const stages = notificationData.forgottenStages.slice(0, 2).join('\n');
        
        self.registration.showNotification('📚 King\'s Road - 복습 시간!', {
          body: `복습할 구절이 ${count}개 있습니다.\n\n${stages}${count > 2 ? '\n...' : ''}`,
          icon: '/icon.png',
          badge: '/icon.png',
          tag: 'forgotten-reminder',
          requireInteraction: false,
          data: { type: 'forgotten' }
        });
      }
    }
  } catch (err) {
    console.error('❌ 알림 확인 실패:', err);
  }
}

// 클라이언트에서 메시지 수신
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // 게임에서 전달한 복습 데이터 저장
  if (event.data && event.data.type === 'UPDATE_FORGOTTEN_DATA') {
    console.log('📝 복습 데이터 업데이트:', event.data.stages);
    // 실제로는 IndexedDB에 저장하는 것이 좋지만,
    // 간단하게 처리하려면 클라이언트에서 직접 처리
  }
});

// ★ 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // 기존 창이 있으면 포커스
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === '/' && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      // 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

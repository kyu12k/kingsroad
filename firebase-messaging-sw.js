// Firebase Messaging Service Worker
// 백그라운드(앱 전환/잠금 상태)에서 FCM 푸시 알림을 수신합니다.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAcbA0mVWA1PPXL3UvjNWaG4Ks3kt83WHQ",
    authDomain: "kings-road-rank.firebaseapp.com",
    projectId: "kings-road-rank",
    storageBucket: "kings-road-rank.firebasestorage.app",
    messagingSenderId: "1081566937897",
    appId: "1:1081566937897:web:a01c9c7bee29772cd6ad38"
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 핸들러 (data-only 메시지 처리)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

    const notificationTitle = payload.data?.title || '킹스로드 말씀 복습';
    const notificationOptions = {
        body: payload.data?.body || '복습할 말씀이 있습니다.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'review-notif',
        renotify: true,
        data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 시 앱으로 포커스 이동
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // 이미 열린 PWA 창이 있으면 포커스
            for (const client of clientList) {
                if (client.url.includes('kings-road-rank') && 'focus' in client) {
                    return client.focus();
                }
            }
            // 없으면 PWA scope 내 상대경로로 열기 (standalone 모드 유지)
            return clients.openWindow('/');
        })
    );
});

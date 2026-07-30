importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDmIWQAMLNrTTehrGPhhWCOSK6idwNoFxw',
  authDomain: 'app-message-push-a3eef.firebaseapp.com',
  projectId: 'app-message-push-a3eef',
  storageBucket: 'app-message-push-a3eef.firebasestorage.app',
  messagingSenderId: '712488130034',
  appId: '1:712488130034:web:53613035796a1bd8ac876b'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notification = (payload.notification || {});
  const title = notification.title || 'LiveTrack';
  const body = notification.body || '';

  self.registration.showNotification(title, {
    body: body,
    icon: '/icon.png',
    badge: '/icon.png'
  });
});

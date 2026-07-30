/**
 * Drop this into the LiveTrack end-user pages (GitHub Pages front end).
 * Before this file loads, include in your HTML <head> or before </body>:
 *
 *   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"></script>
 *   <script src="subscribe.js"></script>
 *
 * Fill in the three placeholders below.
 */

// Same config as firebase-messaging-sw.js
const firebaseConfig = {
  apiKey: 'AIzaSyDmIWQAMLNrTTehrGPhhWCOSK6idwNoFxw',
  authDomain: 'app-message-push-a3eef.firebaseapp.com',
  projectId: 'app-message-push-a3eef',
  storageBucket: 'app-message-push-a3eef.firebasestorage.app',
  messagingSenderId: '712488130034',
  appId: '1:712488130034:web:53613035796a1bd8ac876b'
};

// Firebase Console > Project settings > Cloud Messaging > Web configuration > Web Push certificates
const VAPID_KEY = 'BN3MDRoU5_1syHPZIbPtrI8_aAYIVPf7qhVNrNN0xKnFkDNCuhC8SKjdlWlYLN7-QqGEug-zgac9r2-eLyq72iw';

// Your deployed GAS Web App URL, ending in /exec
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0Ub48y7MF1y9soeHXPP7Kr8zuaiXfDA96SE0EDIbzF-9ozmoENxKIIwq4IOU033zkmQ/exec';

async function initPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('LiveTrack: push notifications are not supported in this browser.');
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  const registration = await navigator.serviceWorker.register('firebase-messaging-sw.js');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('LiveTrack: notification permission was not granted.');
    return;
  }

  let token;
  try {
    token = await messaging.getToken({
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
  } catch (err) {
    console.error('LiveTrack: could not get push token.', err);
    return;
  }

  if (!token) {
    console.warn('LiveTrack: no push token returned.');
    return;
  }

  // Send with text/plain to avoid a CORS preflight (GAS Web Apps can't
  // answer OPTIONS requests). The GAS side still parses this as JSON.
  await fetch(GAS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'register', token: token })
  });

  console.log('LiveTrack: registered for push notifications.');
}

// Call this from a user gesture (e.g. a "Enable notifications" button) for
// best results — some browsers block the permission prompt if it's not
// triggered by a click. Calling it on page load works in most desktop
// browsers but is worth testing on your target devices.
initPushNotifications();

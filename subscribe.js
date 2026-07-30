const firebaseConfig = {
  apiKey: 'AIzaSyDmIWQAMLNrTTehrGPhhWCOSK6idwNoFxw',
  authDomain: 'app-message-push-a3eef.firebaseapp.com',
  projectId: 'app-message-push-a3eef',
  storageBucket: 'app-message-push-a3eef.firebasestorage.app',
  messagingSenderId: '712488130034',
  appId: '1:712488130034:web:53613035796a1bd8ac876b'
};

const VAPID_KEY = 'BN3MDRoU5_1syHPZIbPtrI8_aAYIVPf7qhVNrNN0xKnFkDNCuhC8SKjdlWlYLN7-QqGEug-zgac9r2-eLyq72iw';
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0Ub48y7MF1y9soeHXPP7Kr8zuaiXfDA96SE0EDIbzF-9ozmoENxKIIwq4IOU033zkmQ/exec';

let swRegistration = null;

async function enableLiveTrackNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('LiveTrack: push notifications are not supported in this browser.');
    return false;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const messaging = firebase.messaging();

  try {
    swRegistration = swRegistration || await navigator.serviceWorker.register('firebase-messaging-sw.js');
  } catch (err) {
    console.error('LiveTrack: service worker registration failed.', err);
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('LiveTrack: notification permission was not granted.');
    return false;
  }

  let token;
  try {
    token = await messaging.getToken({
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    });
  } catch (err) {
    console.error('LiveTrack: could not get push token.', err);
    return false;
  }

  if (!token) {
    console.warn('LiveTrack: no push token returned.');
    return false;
  }

  await fetch(GAS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'register', token: token })
  });

  console.log('LiveTrack: registered for push notifications.');
  return true;
}

function injectEnableButton() {
  if (document.getElementById('ltNotifyBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'ltNotifyBtn';
  btn.textContent = '🔔 Enable Notifications';
  btn.style.cssText =
    'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9999;' +
    'background:#2d8fe8;color:#fff;border:none;padding:12px 22px;border-radius:24px;' +
    'font-size:14px;font-family:sans-serif;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.35);';

  btn.onclick = async function () {
    btn.disabled = true;
    btn.textContent = 'Enabling…';
    const ok = await enableLiveTrackNotifications();
    if (ok) {
      btn.textContent = '✓ Notifications enabled';
      setTimeout(function () { btn.remove(); }, 2000);
    } else {
      btn.disabled = false;
      btn.textContent = '🔔 Enable Notifications';
    }
  };

  document.body.appendChild(btn);
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  if (Notification.permission === 'granted') {
    enableLiveTrackNotifications();
  } else if (Notification.permission === 'default') {
    injectEnableButton();
  } else {
    console.warn('LiveTrack: notifications are blocked for this site. Enable them in your browser\'s site settings to receive alerts.');
  }
} else {
  console.warn('LiveTrack: push notifications are not supported in this browser.');
}

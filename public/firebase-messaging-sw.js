importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// This is a generic config, we can leave it empty since it just needs to be imported,
// but let's initialize it so it doesn't throw errors if FCM pushes ever happen.
firebase.initializeApp({
  projectId: "yachty-kayak-gf6jr",
  appId: "1:851253754398:web:7c73a1f11dd062bfe0cc0f",
  apiKey: "AIzaSyBEGxGG1CF4E3aw22CSIlfKvzrhdFpF-vw",
  messagingSenderId: "851253754398"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || '',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

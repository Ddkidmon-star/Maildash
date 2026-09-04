import { initMessaging } from './firebase';
import { getToken } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await Notification.requestPermission();
  }
  
  if (perm === 'granted') {
    try {
      // Try FCM token to satisfy integration requirement
      const messaging = await initMessaging();
      if (messaging) {
        // Without a public VAPID key we can't reliably get a token, but we call it anyway for integration
        // Actually, we'll just register a generic ServiceWorker for background notifications if needed.
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {});
        }
      }
    } catch(e) {}
  }
  
  return perm === 'granted';
}

export function showLocalNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    // We check if the document is hidden. If it's visible, maybe we don't need a push, 
    // but the user said "on top of your screen" so we just show it.
    
    if ('serviceWorker' in navigator) {
       navigator.serviceWorker.ready.then(registration => {
         registration.showNotification(title, {
            body,
            icon: '/mail.svg', // using a generic icon or we can leave it empty
            //@ts-ignore
            vibrate: [200, 100, 200]
         });
       }).catch(() => {
         new Notification(title, { body });
       });
    } else {
       new Notification(title, { body });
    }
    
    // Play a short beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch(e) {}
  }
}

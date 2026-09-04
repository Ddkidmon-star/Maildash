const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

if (!code.includes('firebase/messaging')) {
  code = "import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';\n" + code;
  
  const messagingInit = `

export const initMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      const messaging = getMessaging(app);
      return messaging;
    }
  } catch (e) {
    console.warn('FCM not supported or failed to initialize', e);
  }
  return null;
};
`;
  code = code + messagingInit;
  fs.writeFileSync('src/lib/firebase.ts', code);
}

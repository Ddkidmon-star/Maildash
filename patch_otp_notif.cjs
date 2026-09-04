const fs = require('fs');
let code = fs.readFileSync('src/components/OtpScreen.tsx', 'utf8');

const importStr = `import { requestNotificationPermission, showLocalNotification } from '../lib/notifications';`;
if (!code.includes(importStr)) {
  code = code.replace("import { motion } from 'motion/react';", "import { motion } from 'motion/react';\n" + importStr);
}

const reqPermStr = `
  useEffect(() => {
    requestNotificationPermission();
  }, []);
`;
if (!code.includes("requestNotificationPermission();")) {
  code = code.replace("const [copied, setCopied] = useState(false);", "const [copied, setCopied] = useState(false);\n" + reqPermStr);
}

const setMessagesStr = `             setMessages(newMsgs);`;
const setMessagesNew = `             
             // Check if there are new messages that didn't exist before
             if (messages.length > 0 && newMsgs.length > messages.length) {
                const newMsgCount = newMsgs.length - messages.length;
                showLocalNotification(
                  'New SMS Received',
                  \`You received \${newMsgCount} new message(s) for +\${activeNumberObj.number}\`
                );
             } else if (messages.length === 0 && newMsgs.length > 0) {
                showLocalNotification(
                  'SMS Received',
                  \`You received a new message for +\${activeNumberObj.number}\`
                );
             }
             
             setMessages(newMsgs);`;
if (code.includes(setMessagesStr) && !code.includes("showLocalNotification")) {
  code = code.replace(setMessagesStr, setMessagesNew);
}

fs.writeFileSync('src/components/OtpScreen.tsx', code);

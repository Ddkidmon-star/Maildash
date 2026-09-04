const fs = require('fs');
let code = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf8');

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

const setMsgStr = `if (data.messages) setMessages(data.messages);`;
const setMsgNew = `if (data.messages) {
             setMessages(prev => {
                if (prev.length > 0 && data.messages.length > prev.length) {
                   showLocalNotification(
                      'New Email Received',
                      \`You received \${data.messages.length - prev.length} new email(s)\`
                   );
                } else if (prev.length === 0 && data.messages.length > 0) {
                   showLocalNotification(
                      'Email Received',
                      \`You received a new email\`
                   );
                }
                return data.messages;
             });
          }`;
          
if (code.includes(setMsgStr)) {
  code = code.replace(setMsgStr, setMsgNew);
  fs.writeFileSync('src/components/GeneratorScreen.tsx', code);
}

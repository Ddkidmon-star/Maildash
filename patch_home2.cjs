const fs = require('fs');
let code = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');

const setMsgStr = `setMessages([...localMsgs, ...fetchedMessages]);`;
const setMsgNew = `
      const allMsgs = [...localMsgs, ...fetchedMessages];
      setMessages(prev => {
         if (prev.length > 0 && allMsgs.length > prev.length) {
            showLocalNotification(
               'New Email Received',
               \`You received \${allMsgs.length - prev.length} new email(s) for \${account.email}\`
            );
         } else if (prev.length === 0 && allMsgs.length > 0 && !initWelcome) {
            // Check if there are real fetched messages, not just the welcome message
            if (fetchedMessages.length > 0) {
               showLocalNotification(
                 'Email Received',
                 \`You received a new email for \${account.email}\`
               );
            }
         }
         return allMsgs;
      });
`;

if (code.includes(setMsgStr)) {
  code = code.replace(setMsgStr, setMsgNew);
  fs.writeFileSync('src/components/HomeScreen.tsx', code);
} else {
  console.log("Could not find setMessages");
}

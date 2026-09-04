const fs = require('fs');
let code = fs.readFileSync('src/components/HomeScreen.tsx', 'utf-8');

const deleteMsgsStart = `const deleteMessage = async (msg: any) => {`;
const deleteMsgsEnd = `setExpandedMsg(null);
  };`;

const deleteMsgsOld = code.substring(code.indexOf(deleteMsgsStart), code.indexOf(deleteMsgsEnd) + deleteMsgsEnd.length);

const deleteMsgsNew = `const deleteMessage = async (msg: any) => {
    if (!activeAccount) return;
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    if (activeAccount.accountId.startsWith('gmail-alias')) {
       // Just delete from UI for Gmail aliases
    } else {
      try {
        await fetch(\`/api/mailtm/messages/\${msg.id}\`, {
          method: 'DELETE',
          headers: { 'Authorization': \`Bearer \${activeAccount.token}\` }
        });
      } catch(e) {}
    }
    setExpandedMsg(null);
  };`;

code = code.replace(deleteMsgsOld, deleteMsgsNew);

fs.writeFileSync('src/components/HomeScreen.tsx', code);
console.log('patched HomeScreen delete');

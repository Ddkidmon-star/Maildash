const fs = require('fs');
let code = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf-8');

const deleteMsgStart = `const deleteMessage = async (e: React.MouseEvent, msgId: string) => {`;
const deleteMsgEnd = `} catch(e) {}
  };`;

const deleteMsgOld = code.substring(code.indexOf(deleteMsgStart), code.indexOf(deleteMsgEnd) + deleteMsgEnd.length);

const deleteMsgNew = `const deleteMessage = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    if (!activeAccount) return;
    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (activeAccount.accountId.startsWith('gmail-alias')) {
       // Just delete from UI for Gmail aliases
    } else if (activeAccount.token) {
      try {
        await fetch(\`/api/mailtm/messages/\${msgId}\`, {
          method: 'DELETE',
          headers: { 'Authorization': \`Bearer \${activeAccount.token}\` }
        });
      } catch(e) {}
    }
  };`;

code = code.replace(deleteMsgOld, deleteMsgNew);

const deleteAccStart = `const deleteEmail = async () => {`;
const deleteAccEnd = `window.dispatchEvent(new Event('accountsChanged'));
      }
    } catch(e) {
      console.error(e);
    }
  };`;

const deleteAccOld = code.substring(code.indexOf(deleteAccStart), code.indexOf(deleteAccEnd) + deleteAccEnd.length);

const deleteAccNew = `const deleteEmail = async () => {
    if (!activeAccount) return;
    try {
      if (!activeAccount.accountId.startsWith('gmail-alias') && activeAccount.token && activeAccount.accountId) {
        await fetch('/api/mailtm/delete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${activeAccount.token}\`
          },
          body: JSON.stringify({ accountId: activeAccount.accountId })
        });
      }
      
      const existingRaw = localStorage.getItem('maildash_accounts');
      if (existingRaw) {
        let existing = JSON.parse(existingRaw);
        existing = existing.filter((acc: any) => acc.email !== activeAccount.email);
        localStorage.setItem('maildash_accounts', JSON.stringify(existing));
        
        if (existing.length > 0) {
           localStorage.setItem('maildash_active_account', existing[0].email);
        } else {
           localStorage.removeItem('maildash_active_account');
        }
        window.dispatchEvent(new Event('accountsChanged'));
      }
    } catch(e) {
      console.error(e);
    }
  };`;

code = code.replace(deleteAccOld, deleteAccNew);

fs.writeFileSync('src/components/GeneratorScreen.tsx', code);
console.log('patched GeneratorScreen deletes');

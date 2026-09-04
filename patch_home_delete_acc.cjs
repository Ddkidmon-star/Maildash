const fs = require('fs');
let code = fs.readFileSync('src/components/HomeScreen.tsx', 'utf-8');

const deleteAccStart = `const deleteAccount = async () => {`;
const deleteAccEnd = `setShowAccountMenu(false);
    }
  };`;

const deleteAccOld = code.substring(code.indexOf(deleteAccStart), code.indexOf(deleteAccEnd) + deleteAccEnd.length);

const deleteAccNew = `const deleteAccount = async () => {
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
           setActiveAccount(existing[0]);
           localStorage.setItem('maildash_active_account', existing[0].email);
        } else {
           setActiveAccount(null);
           localStorage.removeItem('maildash_active_account');
        }
        window.dispatchEvent(new Event('accountsChanged'));
      }
    } catch(e) {
      console.error(e);
    } finally {
      setShowAccountMenu(false);
    }
  };`;

code = code.replace(deleteAccOld, deleteAccNew);

fs.writeFileSync('src/components/HomeScreen.tsx', code);
console.log('patched HomeScreen delete account');

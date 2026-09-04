const fs = require('fs');
let code = fs.readFileSync('src/components/HomeScreen.tsx', 'utf-8');

code = code.replace(
  `import { Plus, Mail, Copy, Check, Trash2, ArrowRight, ShieldCheck, Zap, MoreVertical, LayoutGrid, List } from 'lucide-react';`,
  `import { Plus, Mail, Copy, Check, Trash2, ArrowRight, ShieldCheck, Zap, MoreVertical, LayoutGrid, List } from 'lucide-react';\nimport { requireGmailAuth, fetchEmailsForAlias } from '../lib/gmail';`
);

const fetchMsgsStart = `const fetchEmails = async () => {`;
const fetchMsgsEnd = `setIsRefreshing(false);
    }
  };`;

const fetchMsgsOld = code.substring(code.indexOf(fetchMsgsStart), code.indexOf(fetchMsgsEnd) + fetchMsgsEnd.length);

const fetchMsgsNew = `const fetchEmails = async () => {
    if (!activeAccount) return;
    setIsRefreshing(true);
    try {
      if (activeAccount.accountId.startsWith('gmail-alias')) {
        const token = await requireGmailAuth();
        const msgs = await fetchEmailsForAlias(token, activeAccount.email);
        setMessages(msgs);
      } else {
        const res = await fetch('/api/mailtm/messages', {
          headers: { 'Authorization': \`Bearer \${activeAccount.token}\` }
        });
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };`;

code = code.replace(fetchMsgsOld, fetchMsgsNew);

fs.writeFileSync('src/components/HomeScreen.tsx', code);
console.log('patched HomeScreen');

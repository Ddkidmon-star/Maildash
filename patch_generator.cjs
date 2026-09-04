const fs = require('fs');
let code = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf-8');

// Add imports
code = code.replace(
  `import { Copy, RefreshCw, ChevronLeft, Inbox, Check, ShieldCheck, Trash2, Zap } from 'lucide-react';`, 
  `import { Copy, RefreshCw, ChevronLeft, Inbox, Check, ShieldCheck, Trash2, Zap } from 'lucide-react';\nimport { auth } from '../lib/firebase';\nimport { requireGmailAuth, fetchEmailsForAlias, generateGmailAlias } from '../lib/gmail';`
);

// Replace message fetching interval
const fetchMsgsStart = `useEffect(() => {
    let interval: any;
    if (activeAccount?.token) {
      const fetchMsgs = async () => {`;
const fetchMsgsEnd = `return () => clearInterval(interval);
  }, [activeAccount]);`;
const fetchMsgsOld = code.substring(code.indexOf(fetchStart = `useEffect(() => {\n    let interval`), code.indexOf(fetchMsgsEnd) + fetchMsgsEnd.length);

const fetchMsgsNew = `useEffect(() => {
    let interval: any;
    if (activeAccount && activeAccount.accountId.startsWith('gmail-alias')) {
      const fetchMsgs = async () => {
        try {
          const token = await requireGmailAuth();
          const msgs = await fetchEmailsForAlias(token, activeAccount.email);
          setMessages(prev => {
            if (prev.length > 0 && msgs.length > prev.length) {
                showLocalNotification(
                  'New OTP Received',
                  \`You received \${msgs.length - prev.length} new message(s)\`
                );
            } else if (prev.length === 0 && msgs.length > 0) {
                showLocalNotification(
                  'OTP Received',
                  \`You received a new message\`
                );
            }
            return msgs;
          });
        } catch(e) {
          console.error(e);
        }
      };
      fetchMsgs();
      interval = setInterval(fetchMsgs, 3000);
    } else {
       setMessages([]);
    }
    return () => clearInterval(interval);
  }, [activeAccount]);`;

code = code.replace(fetchMsgsOld, fetchMsgsNew);

// Replace generateEmail function
const generateStart = `const generateEmail = async () => {`;
const generateEnd = `setIsGenerating(false);
    }
  };`;
const generateOld = code.substring(code.indexOf(generateStart), code.indexOf(generateEnd) + generateEnd.length);

const generateNew = `const generateEmail = async () => {
    setIsGenerating(true);
    try {
      // Prompt for Gmail OAuth if not already granted
      await requireGmailAuth();

      const baseEmail = auth.currentUser?.email || 'master@gmail.com';
      const randomSuffix = 'temp_' + Math.floor(Math.random() * 99999);
      const generatedAlias = generateGmailAlias(baseEmail, randomSuffix);

      const newAcc = {
         email: generatedAlias,
         token: 'gmail-alias-token',
         accountId: 'gmail-alias-' + Date.now(),
         name: 'Random Alias'
      };
      
      const existingRaw = localStorage.getItem('maildash_accounts');
      let existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(newAcc);
      
      localStorage.setItem('maildash_accounts', JSON.stringify(existing));
      localStorage.setItem('maildash_active_account', generatedAlias);
      
      window.dispatchEvent(new Event('accountsChanged'));
    } catch (e) {
      console.error("Failed to generate email alias:", e);
    } finally {
      setIsGenerating(false);
    }
  };`;

code = code.replace(generateOld, generateNew);

fs.writeFileSync('src/components/GeneratorScreen.tsx', code);
console.log('patched GeneratorScreen');

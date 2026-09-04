import { requestNotificationPermission, showLocalNotification } from "../lib/notifications";
import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, ChevronLeft, Inbox, Check, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { Screen } from '../types';
import { auth } from '../lib/firebase';
import { requireGmailAuth, fetchEmailsForAlias, generateGmailAlias } from '../lib/gmail';

export default function GeneratorScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [email, setEmail] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);
  const [activeAccount, setActiveAccount] = useState<any | null>(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const loadAccount = () => {
      const stored = localStorage.getItem('maildash_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        const activeEmail = localStorage.getItem('maildash_active_account');
        const active = parsed.find((a: any) => a.email === activeEmail) || parsed[0];
        if (active) {
          setActiveAccount(active);
          setEmail(active.email);
        } else {
          setActiveAccount(null);
          setEmail('');
        }
      } else {
        setActiveAccount(null);
        setEmail('');
      }
    };
    
    loadAccount();
    window.addEventListener('accountsChanged', loadAccount);
    return () => window.removeEventListener('accountsChanged', loadAccount);
  }, []);

  useEffect(() => {
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
                  `You received ${msgs.length - prev.length} new message(s)`
                );
            } else if (prev.length === 0 && msgs.length > 0) {
                showLocalNotification(
                  'OTP Received',
                  `You received a new message`
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
    } else if (activeAccount?.token) {
      const fetchMsgs = async () => {
        try {
          const res = await fetch('/api/mailtm/messages', {
            headers: { 'Authorization': `Bearer ${activeAccount.token}` }
          });
          const data = await res.json();
          if (data.messages) {
             setMessages(prev => {
                if (prev.length > 0 && data.messages.length > prev.length) {
                   showLocalNotification(
                      'New Email Received',
                      `You received ${data.messages.length - prev.length} new email(s)`
                   );
                } else if (prev.length === 0 && data.messages.length > 0) {
                   showLocalNotification(
                      'Email Received',
                      `You received a new email`
                   );
                }
                return data.messages;
             });
          }
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
  }, [activeAccount]);

  const deleteMessage = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    if (!activeAccount) return;
    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (activeAccount.accountId.startsWith('gmail-alias')) {
       // Just delete from UI for Gmail aliases
    } else if (activeAccount.token) {
      try {
        await fetch(`/api/mailtm/messages/${msgId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${activeAccount.token}` }
        });
      } catch(e) {}
    }
  };

  const generateEmail = async () => {
    setIsGenerating(true);
    try {
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
  };

  const deleteEmail = async () => {
    if (!activeAccount) return;
    try {
      if (!activeAccount.accountId.startsWith('gmail-alias') && activeAccount.token && activeAccount.accountId) {
        await fetch('/api/mailtm/delete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeAccount.token}`
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
  };

  const copyToClipboard = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto h-full pb-24 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('home')} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Free Generator</h1>
          <p className="text-neutral-500">Generate temporary Gmail aliases</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Your Temporary Alias</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-neutral-100 dark:bg-[#000] border border-neutral-200 dark:border-[#333] rounded-2xl p-4 flex items-center justify-between group">
              <span className="font-mono text-lg truncate pr-4 text-black dark:text-white select-all">
                {email || 'Tap generate to start'}
              </span>
              {email && (
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-neutral-200 dark:hover:bg-[#222] rounded-xl transition-colors shrink-0 text-neutral-500"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={generateEmail}
            disabled={isGenerating}
            className="flex-1 bg-black text-white dark:bg-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {isGenerating ? 'Generating...' : 'Generate New'}
          </button>
          
          {email && (
            <button 
              onClick={deleteEmail}
              className="px-6 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-500" />
            Inbox
          </h2>
          <div className="text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-[#1a1a1a] px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Auto-refreshing
          </div>
        </div>
        
        <div className="flex-1 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl overflow-hidden flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8 text-center gap-4">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-neutral-300" />
              </div>
              <div>
                <p className="font-bold text-black dark:text-white">Waiting for emails...</p>
                <p className="text-sm mt-1">OTPs from Facebook, TikTok, Instagram will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-[#1E1E1E] overflow-y-auto max-h-[500px]">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer group" onClick={() => setExpandedMsgId(expandedMsgId === msg.id ? null : msg.id)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-black dark:text-white truncate pr-4">{msg.from?.name || msg.from}</span>
                    <button onClick={(e) => deleteMessage(e, msg.id)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-medium text-sm mb-1 text-black dark:text-neutral-200 truncate">{msg.subject}</div>
                  
                  {expandedMsgId === msg.id && (
                     <div className="mt-4 p-4 bg-neutral-100 dark:bg-[#0a0a0a] rounded-xl text-sm whitespace-pre-wrap break-words text-neutral-800 dark:text-neutral-300">
                       {msg.body || (msg.intro ? msg.intro : "No content")}
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

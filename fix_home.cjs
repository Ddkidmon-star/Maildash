const fs = require('fs');

const code = `import { Plus, Mail, Copy, Check, Trash2, ArrowRight, ShieldCheck, Zap, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { requireGmailAuth, fetchEmailsForAlias } from '../lib/gmail';
import { useState, useEffect } from 'react';
import { Screen, Tab } from '../types';

export default function HomeScreen({ navigate, setActiveTab }: { navigate: (s: Screen) => void, setActiveTab: (t: Tab) => void }) {
  const [activeAccount, setActiveAccount] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [expandedMsg, setExpandedMsg] = useState<any>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadAccounts = () => {
      const stored = localStorage.getItem('maildash_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAccounts(parsed);
        const activeEmail = localStorage.getItem('maildash_active_account');
        const active = parsed.find((a: any) => a.email === activeEmail) || parsed[0];
        setActiveAccount(active);
      } else {
        setAccounts([]);
        setActiveAccount(null);
      }
    };
    loadAccounts();
    window.addEventListener('accountsChanged', loadAccounts);
    return () => window.removeEventListener('accountsChanged', loadAccounts);
  }, []);

  const fetchEmails = async () => {
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
  };

  useEffect(() => {
    if (activeAccount) {
      fetchEmails();
      const interval = setInterval(fetchEmails, 5000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeAccount]);

  const deleteAccount = async () => {
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
  };

  const deleteMessage = async (msg: any) => {
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
  };

  const copyToClipboard = () => {
    if (!activeAccount?.email) return;
    navigator.clipboard.writeText(activeAccount.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-500" /> Inbox
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">Your active temporary emails</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              navigate('generator');
              setActiveTab('generator');
            }}
            className="flex items-center gap-2 bg-neutral-200 dark:bg-[#1E1E1E] hover:bg-neutral-300 dark:hover:bg-[#2A2A2A] text-black dark:text-white px-4 py-2 rounded-xl font-bold transition-colors active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Free Temp Email</span>
          </button>
          
          <button 
            onClick={() => {
              navigate('create_email');
              setActiveTab('create_email');
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors active:scale-95 shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Real Email</span>
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="flex-1 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">No active emails</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-8 text-lg">Generate a free temporary email or create a real permanent one.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                navigate('generator');
                setActiveTab('generator');
              }}
              className="bg-neutral-100 text-black dark:bg-[#1E1E1E] dark:text-white px-8 py-4 rounded-2xl font-bold hover:bg-neutral-200 dark:hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2 text-lg active:scale-95"
            >
              <Zap className="w-5 h-5 text-amber-500" /> Free Temp Email
            </button>
            <button 
              onClick={() => {
                navigate('create_email');
                setActiveTab('create_email');
              }}
              className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-2xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 text-lg active:scale-95 shadow-lg"
            >
              <ShieldCheck className="w-5 h-5 text-green-500" /> Real Permanent Email
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
          {/* Account Selector Sidebar */}
          <div className="w-full md:w-72 flex flex-col gap-3">
            <h3 className="font-bold text-neutral-500 uppercase tracking-wider text-xs px-2 flex items-center justify-between">
              Your Inboxes
              <span className="bg-neutral-200 dark:bg-[#333] text-black dark:text-white px-2 py-0.5 rounded-full text-[10px]">
                {accounts.length}
              </span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {accounts.map(acc => (
                <div 
                  key={acc.email} 
                  onClick={() => {
                    setActiveAccount(acc);
                    localStorage.setItem('maildash_active_account', acc.email);
                  }}
                  className={\`cursor-pointer p-4 rounded-2xl border transition-all \${activeAccount?.email === acc.email ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-lg scale-[1.02]' : 'bg-white dark:bg-[#121212] border-neutral-200 dark:border-[#222] hover:border-neutral-300 dark:hover:border-[#333] hover:scale-[1.01]'}\`}
                >
                  <div className="font-bold truncate mb-1">{acc.name}</div>
                  <div className={\`text-xs truncate \${activeAccount?.email === acc.email ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500'}\`}>
                    {acc.email}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl overflow-hidden flex flex-col shadow-sm">
            {/* Active Account Header */}
            {activeAccount && (
              <div className="p-4 md:p-6 border-b border-neutral-100 dark:border-[#1E1E1E] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/50 dark:bg-[#0a0a0a]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white dark:bg-white dark:text-black rounded-xl flex items-center justify-center font-bold text-xl">
                    {activeAccount.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col max-w-[200px] sm:max-w-xs md:max-w-md">
                    <span className="font-bold text-lg truncate">{activeAccount.name}</span>
                    <span className="text-neutral-500 text-sm truncate flex items-center gap-2">
                      {activeAccount.email}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-auto relative">
                  <button onClick={copyToClipboard} className="p-2.5 bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-neutral-200 dark:hover:bg-[#222] rounded-xl transition-colors text-black dark:text-white">
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button onClick={fetchEmails} className="p-2.5 bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-neutral-200 dark:hover:bg-[#222] rounded-xl transition-colors text-black dark:text-white">
                    <RefreshCw className={\`w-5 h-5 \${isRefreshing ? 'animate-spin text-blue-500' : ''}\`} />
                  </button>
                  
                  <button onClick={() => setShowAccountMenu(!showAccountMenu)} className="p-2.5 bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-neutral-200 dark:hover:bg-[#222] rounded-xl transition-colors text-black dark:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showAccountMenu && (
                    <div className="absolute top-12 right-0 w-48 bg-white dark:bg-[#1E1E1E] border border-neutral-200 dark:border-[#333] rounded-2xl shadow-xl overflow-hidden z-20">
                      <button onClick={deleteAccount} className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete Inbox
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages List / Detail */}
            <div className="flex-1 overflow-y-auto relative bg-white dark:bg-[#121212]">
              {messages.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 p-8 text-center gap-4">
                  <div className="w-16 h-16 bg-neutral-50 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center">
                    <Inbox className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-bold text-black dark:text-white">Inbox is empty</p>
                    <p className="text-sm mt-1">Waiting for incoming emails...</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-[#1a1a1a]">
                  {messages.map((msg) => (
                    <div key={msg.id} className="group">
                      <div 
                        onClick={() => setExpandedMsg(expandedMsg?.id === msg.id ? null : msg)}
                        className="p-4 md:p-6 hover:bg-neutral-50 dark:hover:bg-[#181818] transition-colors cursor-pointer flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold text-black dark:text-white text-lg truncate">
                            {msg.from?.name || msg.from}
                          </span>
                          <span className="text-xs font-bold text-neutral-400 whitespace-nowrap">
                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-black dark:text-neutral-300 truncate">
                            {msg.subject || 'No Subject'}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteMessage(msg); }}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {expandedMsg?.id === msg.id && (
                        <div className="p-4 md:p-8 bg-neutral-50 dark:bg-[#0a0a0a] border-t border-b border-neutral-100 dark:border-[#1E1E1E]">
                          <div className="flex flex-col gap-4 mb-6">
                            <div>
                              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">From</span>
                              <span className="text-black dark:text-white">{msg.from?.address || msg.from}</span>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">To</span>
                              <span className="text-black dark:text-white">{msg.to?.[0]?.address || msg.to || activeAccount.email}</span>
                            </div>
                          </div>
                          
                          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-neutral-100 dark:prose-pre:bg-[#1a1a1a] prose-pre:text-black dark:prose-pre:text-white prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-[#333]">
                            {msg.html ? (
                              <div dangerouslySetInnerHTML={{ __html: msg.html[0] || msg.html }} />
                            ) : (
                              <div className="whitespace-pre-wrap font-sans text-neutral-800 dark:text-neutral-300 leading-relaxed">
                                {msg.text || msg.body || msg.intro}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/HomeScreen.tsx', code);

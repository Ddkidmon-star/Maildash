const fs = require('fs');

// --- 1. PATCH HomeScreen.tsx ---
let home = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');

// Add deleteAccount function inside HomeScreen
const deleteAccountFn = `
  const deleteAccount = (e: React.MouseEvent, emailToDelete: string) => {
    e.stopPropagation();
    const existingRaw = localStorage.getItem('maildash_accounts');
    if (existingRaw) {
      let existing = JSON.parse(existingRaw);
      existing = existing.filter((acc: any) => acc.email !== emailToDelete);
      localStorage.setItem('maildash_accounts', JSON.stringify(existing));
      setAccounts(existing);
      
      if (activeAccount?.email === emailToDelete) {
        if (existing.length > 0) {
          switchAccount(existing[0]);
        } else {
          setActiveAccount(null);
          localStorage.removeItem('maildash_active_account');
        }
      }
    }
  };
`;

// Insert it right before switchAccount
home = home.replace('const switchAccount = (acc: any) => {', deleteAccountFn + '\n  const switchAccount = (acc: any) => {');

// Update the dropdown map to include a trash icon
const dropdownRegex = /\{accounts\.map\(acc => \([\s\S]*?<div[\s\S]*?onClick=\{\(\) => switchAccount\(acc\)\}[\s\S]*?>([\s\S]*?)<\/div>[\s\S]*?\{activeAccount\.email === acc\.email && <CheckCircle2 className="w-5 h-5 text-emerald-500" \/>\}[\s\S]*?<\/div>\n            \)\}/m;

const newDropdown = `{accounts.map(acc => (
              <div 
                key={acc.email}
                className={\`p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#2A2A2A] transition-colors border-b border-neutral-100 dark:border-[#2A2A2A] \${activeAccount?.email === acc.email ? 'bg-neutral-50 dark:bg-[#121212]' : ''}\`}
              >
                <div onClick={() => switchAccount(acc)} className="flex-1 cursor-pointer">
                  <p className="font-bold text-black dark:text-white font-mono">{acc.email}</p>
                  <p className="text-sm text-neutral-500">{acc.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeAccount?.email === acc.email && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  <button onClick={(e) => deleteAccount(e, acc.email)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}`;

home = home.replace(dropdownRegex, newDropdown);

// Fix optional chaining in activeAccount.email 
home = home.replace(/activeAccount\.email/g, 'activeAccount?.email');

fs.writeFileSync('src/components/HomeScreen.tsx', home);


// --- 2. PATCH GeneratorScreen.tsx ---
let gen = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf8');

const updatedDeleteEmail = `
  const deleteEmail = async () => {
    if (!email) return;
    try {
      const token = localStorage.getItem('mailtm_token');
      const accountId = localStorage.getItem('mailtm_accountId');
      if (token && accountId) {
        await fetch('/api/mailtm/delete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify({ accountId })
        });
      }
      
      const existingRaw = localStorage.getItem('maildash_accounts');
      if (existingRaw) {
        let existing = JSON.parse(existingRaw);
        existing = existing.filter((acc: any) => acc.email !== email);
        localStorage.setItem('maildash_accounts', JSON.stringify(existing));
      }
      if (localStorage.getItem('maildash_active_account') === email) {
         localStorage.removeItem('maildash_active_account');
      }

      setEmail('');
      localStorage.removeItem('currentTempEmail');
      localStorage.removeItem('mailtm_token');
      localStorage.removeItem('mailtm_accountId');
    } catch (e) {
      console.error("Failed to delete email");
    }
  };
`;

gen = gen.replace(/const deleteEmail = async \(\) => \{[\s\S]*?console\.error\("Failed to delete email"\);\n    \}\n  \};/m, updatedDeleteEmail);

fs.writeFileSync('src/components/GeneratorScreen.tsx', gen);

// --- 3. REWRITE OtpScreen.tsx ---
const otpContent = `import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Copy, Check, Globe, Search, ArrowLeft, Smartphone } from 'lucide-react';
import { Screen } from '../types';

const COUNTRIES = [
  { id: 'united-kingdom', name: 'United Kingdom', flag: '🇬🇧', code: '+44' },
  { id: 'united-states', name: 'United States', flag: '🇺🇸', code: '+1' },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', code: '+1' },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', code: '+49' },
  { id: 'france', name: 'France', flag: '🇫🇷', code: '+33' },
  { id: 'spain', name: 'Spain', flag: '🇪🇸', code: '+34' },
];

const APPS = [
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'tinder', name: 'Tinder' },
  { id: 'google', name: 'Google' },
  { id: 'other', name: 'Other Application' }
];

export default function OtpScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [selectedCountry, setSelectedCountry] = useState('united-kingdom');
  const [selectedApp, setSelectedApp] = useState('whatsapp');
  
  // Persist number
  const [activeNumber, setActiveNumber] = useState<string | null>(() => localStorage.getItem('maildash_sms_number'));
  
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [messages, setMessages] = useState<any[]>([]);
  const [isRefreshingMsgs, setIsRefreshingMsgs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const generateNumber = async () => {
    try {
      setIsSearching(true);
      setErrorMsg('');
      const res = await fetch(\`/api/sms/generate?country=\${selectedCountry}\`);
      const data = await res.json();
      
      if (data.number) {
        setActiveNumber(data.number);
        localStorage.setItem('maildash_sms_number', data.number);
        localStorage.removeItem('maildash_sms_initial_msgs'); // Clear old state
        setMessages([]); // Clear messages immediately
      } else {
        setErrorMsg('No numbers available for this country right now.');
      }
    } catch (e) {
      setErrorMsg('Failed to generate number. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (activeNumber) {
      const fetchMsgs = async () => {
        setIsRefreshingMsgs(true);
        try {
          const res = await fetch('/api/sms/messages/' + activeNumber);
          const data = await res.json();
          if (data.messages) {
             let savedInitial = localStorage.getItem('maildash_sms_initial_msgs');
             if (!savedInitial) {
                // First fetch for this number, treat all current messages as 'old'
                savedInitial = JSON.stringify(data.messages);
                localStorage.setItem('maildash_sms_initial_msgs', savedInitial);
             }
             const initialList = JSON.parse(savedInitial);
             
             // Filter out messages that were there when the user generated the number
             const newMsgs = data.messages.filter((m: any) => 
               !initialList.some((im: any) => im.sender === m.sender && im.body === m.body)
             );
             
             setMessages(newMsgs);
          }
        } catch (e) {
          console.error("Failed to fetch messages");
        } finally {
          setIsRefreshingMsgs(false);
        }
      };
      
      fetchMsgs(); // Initial fetch
      interval = setInterval(fetchMsgs, 10000); // Poll every 10 seconds
    }
    return () => clearInterval(interval);
  }, [activeNumber]);

  const handleCopy = () => {
    if (!activeNumber) return;
    navigator.clipboard.writeText('+' + activeNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleClearNumber = () => {
     setActiveNumber(null);
     localStorage.removeItem('maildash_sms_number');
     localStorage.removeItem('maildash_sms_initial_msgs');
  };

  const filteredMessages = messages.filter(m => 
    (m.sender || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.body || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto flex flex-col h-full pb-24 md:pb-8">
      {!activeNumber ? (
        // --- GENERATOR VIEW ---
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight mb-4 text-center">
            Free SMS Receiver
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md mb-10 text-lg">
            Generate a temporary phone number to bypass SMS verifications on any app or website.
          </p>

          <div className="w-full max-w-md bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl p-6 shadow-lg">
            
            <label className="block text-sm font-bold text-black dark:text-white mb-2 ml-1">
              Select App / Service
            </label>
            <div className="relative mb-5">
              <Smartphone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <select 
                value={selectedApp}
                onChange={e => setSelectedApp(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#333] text-black dark:text-white rounded-2xl pl-12 pr-4 py-4 appearance-none focus:outline-none focus:border-blue-500 transition-colors font-medium text-lg"
              >
                {APPS.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <label className="block text-sm font-bold text-black dark:text-white mb-2 ml-1">
              Select Country
            </label>
            <div className="relative mb-6">
              <Globe className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <select 
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#333] text-black dark:text-white rounded-2xl pl-12 pr-4 py-4 appearance-none focus:outline-none focus:border-blue-500 transition-colors font-medium text-lg"
              >
                {COUNTRIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}

            <button
              onClick={generateNumber}
              disabled={isSearching}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-lg disabled:opacity-70"
            >
              {isSearching ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Searching...</>
              ) : (
                <><Search className="w-5 h-5" /> Search Number</>
              )}
            </button>
          </div>
          
          <div className="mt-8 flex gap-4 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> 100% Free</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> No Sign-up</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Real Numbers</span>
          </div>
        </div>
      ) : (
        // --- INBOX VIEW ---
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <button 
            onClick={handleClearNumber}
            className="flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white font-medium mb-6 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to generator
          </button>

          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl overflow-hidden shadow-lg flex flex-col flex-1 min-h-[600px]">
            {/* Number Header */}
            <div className="p-6 md:p-8 bg-blue-50 dark:bg-blue-900/10 border-b border-neutral-200 dark:border-[#1E1E1E] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Your Public Number
                </p>
                <h2 className="text-3xl md:text-4xl font-mono font-bold text-black dark:text-white tracking-wider">
                  +{activeNumber}
                </h2>
              </div>
              
              <button 
                onClick={handleCopy}
                className="bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black px-6 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md w-full sm:w-auto"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Number'}
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-neutral-200 dark:border-[#1E1E1E] bg-neutral-50/50 dark:bg-[#0a0a0a]">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search for sender (e.g. WhatsApp, TikTok, Google)..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-[#333] text-black dark:text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500 transition-colors font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-50/30 dark:bg-[#0a0a0a]">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-center px-4 mt-8">
                  <RefreshCw className="w-12 h-12 mb-6 text-blue-500 animate-spin" />
                  <p className="font-bold text-xl text-black dark:text-white mb-2">Waiting for SMS...</p>
                  <p className="text-base max-w-sm">
                    Enter this number into the app to receive your code. 
                    <br/><br/>
                    This page automatically refreshes every 10 seconds. New messages will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredMessages.map((msg, i) => (
                    <div key={i} className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-md shadow-blue-500/10 hover:shadow-lg transition-shadow relative overflow-hidden">
                      {/* New indicator strip */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                      
                      <div className="flex items-center justify-between mb-3 pl-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                            {msg.sender.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-black dark:text-white text-base">
                            {msg.sender}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Just Now
                        </span>
                      </div>
                      <p className="text-black dark:text-white font-medium text-[16px] leading-relaxed whitespace-pre-line bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 ml-2">
                        {msg.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Status Footer */}
            <div className="px-6 py-3 border-t border-neutral-200 dark:border-[#1E1E1E] bg-neutral-50 dark:bg-[#0a0a0a] flex items-center justify-between text-xs font-medium text-neutral-500">
              <span className="flex items-center gap-2">
                <span className={\`w-2 h-2 rounded-full \${isRefreshingMsgs ? 'bg-amber-500' : 'bg-emerald-500'}\`}></span>
                {isRefreshingMsgs ? 'Refreshing...' : 'Monitoring inbox...'}
              </span>
              <span>Auto-updates every 10s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/OtpScreen.tsx', otpContent);

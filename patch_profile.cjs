const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

const newCode = `import { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, Settings as SettingsIcon, CheckCircle2 } from 'lucide-react';
import { Screen } from '../types';
import { auth, logout } from '../lib/firebase';
import { syncUserDocument, UserProfile } from '../lib/userUtils';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfileScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await syncUserDocument(u);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('login');
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-1 tracking-tight">Profile</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base">Your account details and preferences.</p>
      </header>

      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-lg">
        <div className="w-28 h-28 bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333] text-neutral-400 rounded-3xl flex items-center justify-center mb-6 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300 relative">
          <UserIcon className="w-12 h-12" strokeWidth={2.5} />
          {profile?.isVerified && (
             <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#121212] rounded-full p-1 shadow-md">
               <CheckCircle2 className="w-8 h-8 text-blue-500" fill="currentColor" stroke="white" strokeWidth={1} />
             </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-black dark:text-white mb-1 flex items-center gap-2 justify-center">
          {user?.displayName || 'User'}
          {profile?.isVerified && (
             <span className="text-blue-500 flex items-center" title="Verified Account">
                <CheckCircle2 className="w-5 h-5" fill="currentColor" stroke="white" strokeWidth={1.5} />
             </span>
          )}
        </h2>
        
        <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-10 bg-neutral-100 dark:bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-neutral-200 dark:border-[#333] text-sm shadow-sm">
          {user?.email || 'guest@maildash.com'}
        </p>

        {profile?.isVerified && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 p-4 rounded-xl flex items-start gap-3 text-left w-full max-w-md">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Account Verified</h4>
              <p className="text-xs mt-1 opacity-90">Your account has been verified by the administrators. You have full access to all MailDash features.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => navigate('settings')}
            className="flex-1 flex justify-center items-center gap-2 bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-neutral-200 dark:hover:bg-[#333] border border-neutral-200 dark:border-[#333] text-black dark:text-white py-4 rounded-2xl font-bold transition-all shadow-sm"
          >
            <SettingsIcon className="w-5 h-5" /> Preferences
          </button>
          
          <button 
             onClick={handleLogout}
             className="flex-1 flex justify-center items-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 py-4 rounded-2xl font-bold transition-all shadow-sm"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
`;
fs.writeFileSync('src/components/ProfileScreen.tsx', newCode);

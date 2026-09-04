import { useState, useEffect } from 'react';
import { Bell, Moon, Shield, Settings as SettingsIcon, LogOut, ShieldAlert } from 'lucide-react';
import { auth, logout } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  
  // Toggles
  const [isDark, setIsDark] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains('dark');
    setIsDark(isDarkTheme);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const isOwner = user?.email === 'preciousddkid@gmail.com';

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto space-y-8 pb-24 md:pb-8">
      <header>
        <h1 className="text-2xl font-bold text-black dark:text-white mb-1 tracking-tight">Profile & Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base">Manage your account and preferences.</p>
      </header>

      {/* Authentication Section */}
      {user && (
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-14 h-14 rounded-full border border-neutral-200 dark:border-[#333333]" />
              ) : (
                <div className="w-14 h-14 bg-neutral-200 dark:bg-[#1E1E1E] rounded-full border border-neutral-300 dark:border-[#333333] flex items-center justify-center text-black dark:text-white font-bold text-xl">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-black dark:text-white text-lg flex items-center gap-2">
                  {user.displayName || "User"}
                  {isOwner && (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <ShieldAlert className="w-3 h-3" /> Admin
                    </span>
                  )}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 bg-neutral-100 dark:bg-[#1E1E1E] hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 border border-neutral-200 dark:border-[#333333] hover:border-red-500/30 px-5 py-2.5 rounded-xl transition-all font-bold w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6">
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-lg flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5" /> Admin Dashboard
            </h3>
            <p className="text-emerald-600/80 dark:text-emerald-500/70 text-sm">
              Welcome back, Owner. There are currently no active users on this platform as it was just deployed. System analytics will populate here once real users begin registering via Firebase Auth.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-neutral-100 dark:divide-[#1E1E1E]">
          
          {/* Dark Mode Toggle */}
          <div onClick={toggleDarkMode} className="p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#1E1E1E] transition cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="bg-neutral-100 dark:bg-[#1E1E1E] border border-neutral-200 dark:border-[#333333] p-3 rounded-2xl text-black dark:text-white group-hover:scale-110 transition-transform">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white">Dark Mode</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Toggle appearance</p>
              </div>
            </div>
            <div className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner transition-colors ${isDark ? 'bg-white border border-[#333333]' : 'bg-neutral-200 border border-neutral-300'}`}>
              <div className={`w-6 h-6 rounded-full absolute top-1 shadow-sm transition-all ${isDark ? 'right-1 bg-black' : 'left-1 bg-white'}`}></div>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div onClick={() => setNotificationsEnabled(!notificationsEnabled)} className="p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#1E1E1E] transition cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="bg-neutral-100 dark:bg-[#1E1E1E] border border-neutral-200 dark:border-[#333333] p-3 rounded-2xl text-black dark:text-white group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white">Notifications</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage email alerts and push notifications</p>
              </div>
            </div>
            <div className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner transition-colors ${notificationsEnabled ? 'bg-emerald-500 border border-emerald-600' : 'bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600'}`}>
              <div className={`w-6 h-6 rounded-full absolute top-1 shadow-sm transition-all ${notificationsEnabled ? 'right-1 bg-white' : 'left-1 bg-white dark:bg-neutral-400'}`}></div>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div onClick={() => setPrivacyMode(!privacyMode)} className="p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#1E1E1E] transition cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="bg-neutral-100 dark:bg-[#1E1E1E] border border-neutral-200 dark:border-[#333333] p-3 rounded-2xl text-black dark:text-white group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white">Strict Privacy</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Auto-delete emails after 1 hour</p>
              </div>
            </div>
            <div className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner transition-colors ${privacyMode ? 'bg-emerald-500 border border-emerald-600' : 'bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600'}`}>
              <div className={`w-6 h-6 rounded-full absolute top-1 shadow-sm transition-all ${privacyMode ? 'right-1 bg-white' : 'left-1 bg-white dark:bg-neutral-400'}`}></div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#1E1E1E] transition cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="bg-neutral-100 dark:bg-[#1E1E1E] p-3 rounded-2xl text-black dark:text-white border border-neutral-200 dark:border-[#333333] group-hover:scale-110 transition-transform">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white">Advanced Settings</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">App configuration and data</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

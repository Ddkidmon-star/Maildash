import { useState, useEffect } from 'react';
import { Home, Settings, Zap, PlusCircle, MessageSquare, Mail, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../lib/userUtils';
import { Tab } from '../types';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface NavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  userProfile?: UserProfile | null;
}

export function BottomNav({ activeTab, onTabChange, userProfile }: NavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#000000] border-t border-neutral-200 dark:border-[#1E1E1E] px-4 pt-3 pb-safe flex justify-between items-center z-50">
      <NavItem icon={Home} label="Home" isActive={activeTab === 'home'} onClick={() => onTabChange('home')} />
      <NavItem icon={Zap} label="Generator" isActive={activeTab === 'generator'} onClick={() => onTabChange('generator')} />
      <NavItem icon={MessageSquare} label="OTP / SMS" isActive={activeTab === 'otp'} onClick={() => onTabChange('otp')} />
      <NavItem icon={PlusCircle} label="Real Email" isActive={activeTab === 'create_email'} onClick={() => onTabChange('create_email')} />
      {userProfile?.role === 'owner' && <NavItem icon={ShieldAlert} label="Admin" isActive={activeTab === 'admin'} onClick={() => onTabChange('admin')} />}
      <NavItem icon={Settings} label="Settings" isActive={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
    </div>
  );
}

export function SideNav({ activeTab, onTabChange, userProfile }: NavProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="hidden md:flex flex-col w-64 bg-neutral-100 dark:bg-[#050505] border-r border-neutral-200 dark:border-[#1E1E1E] h-screen py-8 px-4 relative z-40 text-black dark:text-white">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-neutral-200 dark:bg-[#121212] rounded-lg flex items-center justify-center border border-neutral-300 dark:border-[#1E1E1E]">
            <Mail className="text-black dark:text-white w-5 h-5" />
          </div>
          MailDash
        </h1>
      </div>
      <nav className="flex-1 space-y-1">
        <SideNavItem icon={Home} label="Home" isActive={activeTab === 'home'} onClick={() => onTabChange('home')} />
        <SideNavItem icon={Zap} label="Generator" isActive={activeTab === 'generator'} onClick={() => onTabChange('generator')} />
        <SideNavItem icon={MessageSquare} label="OTP / SMS" isActive={activeTab === 'otp'} onClick={() => onTabChange('otp')} />
        <SideNavItem icon={PlusCircle} label="Real Email" isActive={activeTab === 'create_email'} onClick={() => onTabChange('create_email')} />
        {userProfile?.role === 'owner' && <SideNavItem icon={ShieldAlert} label="Admin" isActive={activeTab === 'admin'} onClick={() => onTabChange('admin')} />}
        <SideNavItem icon={Settings} label="Settings" isActive={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
      </nav>

      {/* User Mini-Profile */}
      {user && (
        <div className="mt-auto pt-6 border-t border-neutral-200 dark:border-white/10 px-4 flex items-center gap-3">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-neutral-300 dark:border-white/20 shadow-sm shrink-0" />
          ) : (
            <div className="w-10 h-10 bg-neutral-200 dark:bg-white/10 rounded-full flex items-center justify-center text-black dark:text-white font-bold border border-neutral-300 dark:border-white/20 shadow-sm shrink-0">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-black dark:text-white truncate">{user.displayName || 'User'}</p>
              {userProfile?.role === 'owner' && <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Owner</span>}
            </div>

            <p className="text-xs text-neutral-500 dark:text-white/50 truncate">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 transition-all ${isActive ? 'text-black dark:text-white' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
      <Icon className={`w-6 h-6 transition-all`} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  );
}

function SideNavItem({ icon: Icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-white dark:bg-[#121212] text-black dark:text-white border border-neutral-200 dark:border-[#1E1E1E]' : 'text-neutral-500 hover:bg-white dark:hover:bg-[#121212] hover:text-black dark:hover:text-white border border-transparent'}`}>
      <Icon className={`w-5 h-5`} strokeWidth={isActive ? 2.5 : 2} />
      {label}
    </button>
  );
}

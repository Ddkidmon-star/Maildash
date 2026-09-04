import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Tab } from './types';
import { BottomNav, SideNav } from './components/Navigation';
import HomeScreen from './components/HomeScreen';
import GeneratorScreen from './components/GeneratorScreen';
import CreateEmailScreen from './components/CreateEmailScreen';
import SettingsScreen from './components/SettingsScreen';
import OtpScreen from './components/OtpScreen';
import LoginScreen from './components/LoginScreen';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { syncUserDocument, UserProfile } from './lib/userUtils';
import AdminScreen from './components/AdminScreen';
import InstallPrompt from './components/InstallPrompt';
import { WalletBadge } from './components/Wallet';
import { Mail } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check dark mode preference
    const isDark = localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      const initializeUser = async () => {
        if (currentUser) {
          const cachedProfile = localStorage.getItem('maildash_user_profile');
          if (cachedProfile) {
            setUserProfile(JSON.parse(cachedProfile));
            setIsCheckingAuth(false);
            setShowSplash(false);
          }
          
          try {
            const profile = await syncUserDocument(currentUser);
            setUserProfile(profile);
            localStorage.setItem('maildash_user_profile', JSON.stringify(profile));
          } catch(e) {
            console.error(e);
          }
        } else {
          setUserProfile(null);
        }
        setIsCheckingAuth(false);
        setShowSplash(false);
      };
      
      initializeUser();
    });

    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setActiveScreen(tab);
  };

  const handleNavigate = (screen: Screen) => {
    setActiveScreen(screen);
    setActiveTab(screen);
  };

  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#000000]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring", 
            stiffness: 260, 
            damping: 20 
          }}
          className="w-28 h-28 bg-[#1E1E1E] rounded-[2rem] shadow-2xl flex items-center justify-center border border-[#333333]"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <Mail className="w-14 h-14 text-white" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!isCheckingAuth && !user) {
    return (
      <div className="flex h-screen bg-neutral-50 text-black dark:bg-[#000000] dark:text-white font-sans overflow-hidden">
        <LoginScreen />
      </div>
    );
  }

  if (userProfile && (userProfile.status === 'banned' || userProfile.status === 'suspended')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 dark:bg-black text-black dark:text-white p-6 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-10 h-10 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Account {userProfile.status === 'banned' ? 'Banned' : 'Suspended'}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-8">
          Your account has been {userProfile.status === 'banned' ? 'permanently banned' : 'suspended'} from MailDash by the owner. Please contact support if you believe this is a mistake.
        </p>
        <button onClick={() => auth.signOut()} className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-xl font-bold">Logout</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50 text-black dark:bg-[#000000] dark:text-white font-sans overflow-hidden selection:bg-neutral-200 dark:selection:bg-[#1E1E1E] selection:text-black dark:selection:text-white">
      <InstallPrompt />
      <WalletBadge 
        userProfile={userProfile} 
        onBalanceUpdate={(newBalance) => {
          if (userProfile) {
            setUserProfile({ ...userProfile, balance: newBalance });
          }
        }} 
      />
      {/* Desktop Sidebar (hidden on mobile) */}
      <SideNav activeTab={activeTab} onTabChange={handleTabChange} userProfile={userProfile} />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pb-24 md:pb-0 h-full scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, scale: 0.98, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="min-h-full"
          >
            {activeScreen === 'home' && <HomeScreen navigate={handleNavigate} />}
            {activeScreen === 'generator' && <GeneratorScreen navigate={handleNavigate} />}
            {activeScreen === 'otp' && <OtpScreen navigate={handleNavigate} />}
            {activeScreen === 'create_email' && (
              <CreateEmailScreen 
                navigate={handleNavigate} 
                userProfile={userProfile}
                onBalanceUpdate={(newBalance) => {
                  if (userProfile) {
                    setUserProfile({ ...userProfile, balance: newBalance });
                  }
                }}
              />
            )}
            {activeScreen === 'settings' && <SettingsScreen />}
            {activeScreen === 'admin' && userProfile?.role === 'owner' && <AdminScreen />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} userProfile={userProfile} />
    </div>
  );
}

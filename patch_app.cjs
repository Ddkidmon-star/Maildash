const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// We need to add the user profile fetching to App.tsx
const importStr = `import { auth } from './lib/firebase';
import { syncUserDocument, UserProfile } from './lib/userUtils';
import AdminScreen from './components/AdminScreen';`;

app = app.replace("import { auth } from './lib/firebase';", importStr);

const stateStr = `  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);`;
app = app.replace("  const [user, setUser] = useState<User | null>(null);", stateStr);

const authEffectStr = `    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await syncUserDocument(currentUser);
          setUserProfile(profile);
        } catch(e) {
          console.error(e);
        }
      } else {
        setUserProfile(null);
      }
      setIsCheckingAuth(false);
      
      setTimeout(() => {
        setShowSplash(false);
      }, 1200);
    });`;

// Regex replace the old onAuthStateChanged
app = app.replace(/const unsubscribe = onAuthStateChanged\(auth, \(currentUser\) => \{[\s\S]*?\}\);/, authEffectStr);

// Add suspended/banned checks inside return, and also owner tag
const adminRoute = `
            {activeScreen === 'admin' && userProfile?.role === 'owner' && <AdminScreen />}`;
app = app.replace("{activeScreen === 'settings' && <SettingsScreen />}", "{activeScreen === 'settings' && <SettingsScreen />}" + adminRoute);

// Update SideNav and BottomNav to receive userProfile
app = app.replace("<SideNav activeTab={activeTab} onTabChange={handleTabChange} />", "<SideNav activeTab={activeTab} onTabChange={handleTabChange} userProfile={userProfile} />");
app = app.replace("<BottomNav activeTab={activeTab} onTabChange={handleTabChange} />", "<BottomNav activeTab={activeTab} onTabChange={handleTabChange} userProfile={userProfile} />");

// Let's replace the whole App component return with a wrapper that checks banned/suspended.
// Wait, we need to pass userProfile to navigation, and handle banned screen.
const returnOld = `  return (
    <div className="flex h-screen bg-neutral-50 text-black dark:bg-[#000000] dark:text-white font-sans overflow-hidden selection:bg-neutral-200 dark:selection:bg-[#1E1E1E] selection:text-black dark:selection:text-white">`;

const returnNew = `  if (userProfile && (userProfile.status === 'banned' || userProfile.status === 'suspended')) {
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
    <div className="flex h-screen bg-neutral-50 text-black dark:bg-[#000000] dark:text-white font-sans overflow-hidden selection:bg-neutral-200 dark:selection:bg-[#1E1E1E] selection:text-black dark:selection:text-white">`;

app = app.replace(returnOld, returnNew);

fs.writeFileSync('src/App.tsx', app);

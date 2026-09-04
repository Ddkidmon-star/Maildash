import { LogIn, Mail } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';

export default function LoginScreen() {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-sm w-full z-10"
      >
        <div className="w-24 h-24 bg-[#1E1E1E] dark:bg-[#1E1E1E] bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-neutral-200 dark:border-[#333333]">
          <Mail className="w-12 h-12 text-black dark:text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome to MailDash</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-10 text-sm leading-relaxed">
          Sign in to generate temporary emails, receive live OTPs, and manage your secure inboxes across devices.
        </p>

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 py-4 px-6 rounded-2xl font-bold transition-all text-lg shadow-lg"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}

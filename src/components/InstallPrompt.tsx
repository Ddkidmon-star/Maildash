import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check if user is on Android
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = /android/.test(ua);
      
      // Show our custom install prompt only on Android
      if (isAndroid) {
         setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl z-[9999] flex items-center justify-between animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
           <Download className="w-5 h-5 text-white" />
         </div>
         <div className="flex flex-col">
           <span className="font-bold leading-tight">Install MailDash</span>
           <span className="text-xs text-blue-100">Add to home screen for fast access</span>
         </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={handleInstall} className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform">
          Install
        </button>
        <button onClick={() => setShowPrompt(false)} className="p-2 text-blue-200 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

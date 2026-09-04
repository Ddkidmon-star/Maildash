import { useState, useEffect } from 'react';
import { ChevronLeft, User, KeyRound, CalendarDays, Briefcase, ArrowRight, Loader2, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { Screen } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, updateUserBalance } from '../lib/userUtils';
import { auth } from '../lib/firebase';

interface CreateEmailScreenProps {
  navigate: (s: Screen) => void;
  userProfile?: UserProfile | null;
  onBalanceUpdate?: (newBalance: number) => void;
}

export default function CreateEmailScreen({ navigate, userProfile, onBalanceUpdate }: CreateEmailScreenProps) {
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMsg, setTransitionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('January');
  const [dobYear, setDobYear] = useState('');
  const [password, setPassword] = useState('');
  const [selectedHandle, setSelectedHandle] = useState('');
  const [handleSuggestions, setHandleSuggestions] = useState<string[]>([]);
  
  // Terms toggles
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [permissionsAllowed, setPermissionsAllowed] = useState(false);

  const fetchDomainAndGenerate = async () => {
    setIsTransitioning(true);
    setTransitionMsg('Generating options...');
    
    setTimeout(() => {
      const first = firstName.replace(/\s+/g, '').toLowerCase();
      const last = lastName.replace(/\s+/g, '').toLowerCase();
      
      const opt1 = `${first}${last}`;
      const opt2 = `${first}.${last}`;
      
      setHandleSuggestions([opt1, opt2]);
      setSelectedHandle(opt1);
      
      setIsTransitioning(false);
      setStep(4);
    }, 500);
  };

  const handleStep4Submit = async () => {
    if (!userProfile) return;
    
    if ((userProfile.balance || 0) < 200) {
      setErrorMsg('Insufficient balance. Please top up your wallet with at least ₦200 to create a premium email.');
      return;
    }
    
    setErrorMsg('');
    setIsTransitioning(true);
    setTransitionMsg('Processing payment...');
    
    try {
      let idToken = '';
      if (auth.currentUser) {
         idToken = await auth.currentUser.getIdToken();
      }

      // We no longer deduct on the client-side! 
      // The backend will verify and deduct atomically.
      
      const res = await fetch('/api/mailtm/register-custom', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}` 
        },
        body: JSON.stringify({ address: `${auth.currentUser?.email?.split('@')[0]}+${selectedHandle}@${auth.currentUser?.email?.split('@')[1]}`, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        // Success, now we can confidently deduct the local UI state
        if (onBalanceUpdate) {
           onBalanceUpdate(userProfile.balance - 200);
        }
        
        // Auto-accept terms to skip step 5 and finalize
        setTermsAccepted(true);
        setPermissionsAllowed(true);
        
        localStorage.setItem('mailtm_token', data.token);
        localStorage.setItem('mailtm_accountId', data.accountId);
        localStorage.setItem('currentTempEmail', data.email);
        
        const existingRaw = localStorage.getItem('maildash_accounts');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        
        const newAccount = {
          email: data.email,
          token: data.token,
          accountId: data.accountId,
          name: fullName
        };
        existing.push(newAccount);
        
        localStorage.setItem('maildash_accounts', JSON.stringify(existing));
        window.dispatchEvent(new Event('accountsChanged'));
        localStorage.setItem('maildash_active_account', data.email);
        localStorage.setItem('auto_open_welcome', 'true'); // Used to trigger welcome email
        window.dispatchEvent(new Event('accountsChanged'));
        
        setStep(6);
        setTimeout(() => {
          setStep(7); // Success step
        }, 2000);
      } else {
        console.error(data);
        setErrorMsg(data.error || 'Failed to create account. Please try again.');
        setIsTransitioning(false);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('An error occurred during account creation.');
      setIsTransitioning(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!firstName.trim() || !lastName.trim())) return;
    if (step === 3 && password.length < 8) return;
    
    if (step === 3) {
      fetchDomainAndGenerate();
      return;
    }
    
    setIsTransitioning(true);
    setTransitionMsg('');
    setTimeout(() => {
      setIsTransitioning(false);
      setStep(s => s + 1);
    }, 500);
  };

  const handleFinalize = async () => {
    if (!termsAccepted || !permissionsAllowed) return;
    setStep(6); // Finalizing state
    
    try {
      const res = await fetch('/api/mailtm/register-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: selectedHandle, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('mailtm_token', data.token);
        localStorage.setItem('mailtm_accountId', data.accountId);
        localStorage.setItem('currentTempEmail', data.email);
        
        const existingRaw = localStorage.getItem('maildash_accounts');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        
        const newAccount = {
          email: data.email,
          token: data.token,
          accountId: data.accountId,
          name: fullName
        };
        existing.push(newAccount);
        
        localStorage.setItem('maildash_accounts', JSON.stringify(existing));
        window.dispatchEvent(new Event('accountsChanged'));
        localStorage.setItem('maildash_active_account', data.email);
        localStorage.setItem('auto_open_welcome', 'true'); // Used to trigger welcome email
        window.dispatchEvent(new Event('accountsChanged'));
        
        setTimeout(() => {
          navigate('home');
        }, 1000);
      } else {
        console.error("Failed to register:", data);
        alert("Failed to create account. Please try another handle.");
        setStep(4); // Go back to handle selection
      }
    } catch (e) {
      console.error(e);
      setStep(4);
    }
  };

  if (step === 5) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#121212] z-[100] flex flex-col">
        {/* Fake Safari/Browser Chrome */}
        <div className="bg-neutral-50 dark:bg-[#000000] border-b border-neutral-200 dark:border-[#1E1E1E] flex flex-col pt-safe">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setStep(4)} className="text-blue-500 font-medium tracking-wide">Cancel</button>
            <div className="flex items-center gap-1.5 bg-neutral-200 dark:bg-[#1E1E1E] px-4 py-1.5 rounded-full text-sm font-medium text-black dark:text-white shadow-inner">
              <Globe className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              accounts.maildash.com
            </div>
            <div className="text-black dark:text-white opacity-0">Cancel</div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-12">
          <div className="max-w-md mx-auto flex flex-col h-full">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-[#1E1E1E] rounded-2xl flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-black dark:text-white mb-2">Review & Confirm</h2>
            <p className="text-center text-neutral-500 dark:text-neutral-400 mb-8 text-sm">Review your details and accept the terms to provision your encrypted inbox.</p>
            
            <div className="bg-neutral-50 dark:bg-[#1E1E1E] rounded-2xl p-5 mb-6 border border-neutral-200 dark:border-[#333333]">
              <div className="text-sm text-neutral-500 mb-1">Email Address</div>
              <div className="font-medium text-black dark:text-white text-lg font-mono mb-4">{selectedHandle}</div>
              
              <div className="text-sm text-neutral-500 mb-1">Full Name</div>
              <div className="font-medium text-black dark:text-white text-lg">{firstName.trim()} {lastName.trim()}</div>
            </div>
            
            <div className="space-y-4 mb-8 flex-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={permissionsAllowed} 
                  onChange={(e) => setPermissionsAllowed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-neutral-300 dark:border-[#555] text-black dark:text-white focus:ring-0" 
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  Allow MailDash to manage incoming and outgoing email for this address securely.
                </span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={termsAccepted} 
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-neutral-300 dark:border-[#555] text-black dark:text-white focus:ring-0" 
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  I accept the Terms of Service and Privacy Policy. I understand this account is permanently mine.
                </span>
              </label>
            </div>
            
            <button 
              onClick={handleFinalize}
              disabled={!termsAccepted || !permissionsAllowed}
              className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-opacity mt-auto mb-6"
            >
              Confirm & Finalize
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black z-[100] flex flex-col">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-black">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-[#1E1E1E] rounded-3xl flex items-center justify-center shadow-2xl">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute -inset-4 border-2 border-transparent border-t-white/30 rounded-full"
              />
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-3">Securing your account...</h2>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Please wait while we verify your details and provision your permanent encrypted inbox.
            </p>
            <div className="flex items-center gap-3 bg-neutral-50 dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] px-5 py-3 rounded-2xl w-full">
              <Loader2 className="w-5 h-5 text-black dark:text-white animate-spin" />
              <div className="text-left">
                <p className="text-sm font-bold text-black dark:text-white">Provisioning Inbox</p>
                <p className="text-xs text-neutral-500">Establishing encryption keys</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto pb-24 md:pb-12 h-full flex flex-col justify-center">
      <button
        onClick={() => step > 1 ? setStep(s => s - 1) : navigate('home')}
        className="flex items-center text-neutral-500 dark:text-neutral-400 hover:text-black dark:text-white mb-8 w-fit transition font-medium"
      >
        <ChevronLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-[2rem] p-6 md:p-10 relative overflow-hidden shadow-2xl">
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="bg-neutral-100 dark:bg-[#1E1E1E] w-14 h-14 rounded-2xl flex items-center justify-center border border-neutral-300 dark:border-[#333333] text-black dark:text-white">
              <span className="font-bold text-xl">{step}/4</span>
            </div>
            
            {/* Progress indicators */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${step === i ? 'bg-white scale-125' : step > i ? 'bg-neutral-500' : 'bg-neutral-100 dark:bg-[#1E1E1E]'}`} />
              ))}
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {isTransitioning && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="w-10 h-10 text-black dark:text-black dark:text-white animate-spin mb-4" />
                <p className="text-neutral-500 font-medium">{transitionMsg || 'Loading...'}</p>
              </motion.div>
            )}
            
            {!isTransitioning && step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2 tracking-tight">What's your name?</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm md:text-base">Enter the name you want to use for your real email.</p>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-black dark:text-white ml-1">First Name</label>
                      <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-[#000000] border border-neutral-200 dark:border-[#1E1E1E] focus:border-[#555555] focus:outline-none transition-all placeholder:text-neutral-600 font-medium text-black dark:text-white text-lg" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-black dark:text-white ml-1">Last Name</label>
                      <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-[#000000] border border-neutral-200 dark:border-[#1E1E1E] focus:border-[#555555] focus:outline-none transition-all placeholder:text-neutral-600 font-medium text-black dark:text-white text-lg" placeholder="Doe" />
                    </div>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] font-bold py-4 rounded-2xl transition-all text-lg mt-4">
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2 tracking-tight">Basic information</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm md:text-base">Enter your date of birth.</p>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2 col-span-1">
                      <label className="text-sm font-bold text-black dark:text-white ml-1">Day</label>
                      <input type="number" min="1" max="31" required value={dobDay} onChange={e => setDobDay(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-neutral-50 dark:bg-[#000000] border border-neutral-200 dark:border-[#1E1E1E] focus:border-[#555555] focus:outline-none transition-all placeholder:text-neutral-600 font-medium text-black dark:text-white text-lg text-center" placeholder="DD" />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <label className="text-sm font-bold text-black dark:text-white ml-1">Month</label>
                      <select value={dobMonth} onChange={e => setDobMonth(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-neutral-50 dark:bg-[#000000] border border-neutral-200 dark:border-[#1E1E1E] focus:border-[#555555] focus:outline-none transition-all font-medium text-black dark:text-white text-lg appearance-none text-center">
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                          <option key={m} value={m}>{m.substring(0, 3)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 col-span-1">
                      <label className="text-sm font-bold text-black dark:text-white ml-1">Year</label>
                      <input type="number" min="1900" max="2026" required value={dobYear} onChange={e => setDobYear(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-neutral-50 dark:bg-[#000000] border border-neutral-200 dark:border-[#1E1E1E] focus:border-[#555555] focus:outline-none transition-all placeholder:text-neutral-600 font-medium text-black dark:text-white text-lg text-center" placeholder="YYYY" />
                    </div>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] font-bold py-4 rounded-2xl transition-all text-lg mt-8">
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2 tracking-tight">Create a strong password</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm md:text-base">Create a strong password with a mix of letters, numbers and symbols.</p>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black dark:text-white ml-1">Password</label>
                    <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-[#000000] border border-neutral-200 dark:border-[#1E1E1E] focus:border-[#555555] focus:outline-none transition-all placeholder:text-neutral-600 font-medium text-black dark:text-white text-lg tracking-widest" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] font-bold py-4 rounded-2xl transition-all text-lg mt-8">
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2 tracking-tight">Choose your email username</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm md:text-base">Type a custom username. It will be created as an active alias on your master email.</p>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Custom Username</label>
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={selectedHandle} 
                        onChange={e => setSelectedHandle(e.target.value.replace(/[^a-zA-Z0-9.-]/g, ''))}
                        className="w-full bg-neutral-100 dark:bg-[#1E1E1E] border-none text-black dark:text-white rounded-2xl p-4 pl-4 pr-12 font-bold text-lg focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                        placeholder="e.g. JohnDoe"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Your real email will be: <br/>
                      <span className="font-bold text-blue-900 dark:text-blue-200 break-all">
                        {auth.currentUser?.email?.split('@')[0]}+{selectedHandle}@{auth.currentUser?.email?.split('@')[1]}
                      </span>
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <button onClick={handleStep4Submit} className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-[0.98] font-bold py-4 rounded-2xl transition-all text-lg">
                  Pay ₦200 & Create <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

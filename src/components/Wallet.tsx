import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Plus, X, CreditCard, Loader2 } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { updateUserBalance, UserProfile } from '../lib/userUtils';
import { auth } from '../lib/firebase';

interface WalletBadgeProps {
  userProfile: UserProfile | null;
  onBalanceUpdate: (newBalance: number) => void;
}

export function WalletBadge({ userProfile, onBalanceUpdate }: WalletBadgeProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  if (!userProfile) return null;

  return (
    <>
      <div 
        onClick={() => setIsDepositModalOpen(true)}
        className="fixed top-4 right-4 md:top-6 md:right-8 z-50 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#333] rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-[#444] transition-all"
      >
        <Wallet className="w-4 h-4 text-emerald-500" />
        <span className="font-bold text-black dark:text-white font-mono">
          ₦{userProfile.balance?.toFixed(2) || '0.00'}
        </span>
        <div className="w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center ml-1">
          <Plus className="w-3 h-3 text-white dark:text-black" />
        </div>
      </div>

      <AnimatePresence>
        {isDepositModalOpen && (
          <DepositModal 
            onClose={() => setIsDepositModalOpen(false)} 
            userProfile={userProfile}
            onSuccess={(amount) => {
              const newBalance = (userProfile.balance || 0) + amount;
              onBalanceUpdate(newBalance);
              setIsDepositModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface DepositModalProps {
  onClose: () => void;
  userProfile: UserProfile;
  onSuccess: (amount: number) => void;
}

function DepositModal({ onClose, userProfile, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState<string>('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Use a test key or public key for Paystack
  const rawKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_a39b33a75ad70dfcf07bb081fb5f0c4cf19d458c';
  const cleanKey = rawKey.replace(/['"]+/g, '').trim();

  const config = {
    reference: (new Date()).getTime().toString(),
    email: auth.currentUser?.email || 'test@example.com',
    amount: parseInt(amount) * 100, // Paystack amount is in kobo
    currency: 'NGN',
    publicKey: cleanKey,
  };

  const initializePayment = usePaystackPayment(config);

  const handleDeposit = () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      setErrorMsg('Minimum deposit is ₦100');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    
    try {
      initializePayment({
        onSuccess: async (paystackRes: any) => {
          try {
            if (auth.currentUser) {
              const idToken = await auth.currentUser.getIdToken();
              const res = await fetch('/api/wallet/verify-deposit', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ 
                  reference: paystackRes.reference, 
                  amount: numAmount 
                })
              });
              const data = await res.json();
              
              if (res.ok && data.success) {
                 onSuccess(numAmount); // Parent will add this to the local state
              } else {
                 setErrorMsg(data.error || 'Failed to verify transaction');
              }
            }
          } catch (e) {
            console.error(e);
            setErrorMsg('Error verifying deposit');
          } finally {
            setIsProcessing(false);
          }
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load payment gateway. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#222] p-6 rounded-3xl shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-neutral-100 dark:bg-[#1A1A1A] rounded-full text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-2">Deposit Funds</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Add tokens to your wallet to create premium real email addresses.
        </p>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium mb-4">
            {errorMsg}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Amount (NGN)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">₦</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#333] rounded-xl py-3 pl-10 pr-4 text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white transition-colors"
              placeholder="1000"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[500, 1000, 2000, 5000].map(preset => (
            <button 
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className="px-4 py-2 bg-neutral-100 dark:bg-[#1E1E1E] hover:bg-neutral-200 dark:hover:bg-[#2A2A2A] rounded-lg text-sm font-bold text-black dark:text-white whitespace-nowrap transition-colors"
            >
              ₦{preset}
            </button>
          ))}
        </div>

        <button 
          onClick={handleDeposit}
          disabled={isProcessing}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with Paystack'}
        </button>
      </motion.div>
    </div>
  );
}

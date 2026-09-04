import React, { useState } from 'react';
import { Key, ArrowLeft, Lock } from 'lucide-react';
import { Screen } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function OtpScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="p-6 md:p-12 max-w-2xl mx-auto h-full flex flex-col relative pb-24 md:pb-8">
      <button
        onClick={() => navigate('home')}
        className="flex items-center text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white mb-12 w-fit transition font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
      </button>

      <div className="flex-1 flex flex-col items-center justify-center -mt-16">
        <div className="relative mb-8">
          <motion.button
            onClick={() => setShowMessage(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-32 h-32 md:w-40 md:h-40 bg-neutral-100 dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg border border-neutral-200 dark:border-[#333] cursor-pointer"
          >
            <Key className="w-14 h-14 md:w-16 md:h-16 text-neutral-400 dark:text-neutral-500" />
          </motion.button>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center border-4 border-neutral-50 dark:border-[#000]">
            <Lock className="w-4 h-4 text-white dark:text-black" />
          </div>
        </div>
        
        <div className="h-20 flex flex-col items-center justify-start text-center">
          <AnimatePresence>
            {showMessage ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-2">
                  Not Available Right Now
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
                  The public phone number feature is currently locked and coming soon.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-neutral-400 dark:text-neutral-600 font-medium text-sm md:text-base tracking-wide uppercase"
              >
                Tap the key to unlock
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

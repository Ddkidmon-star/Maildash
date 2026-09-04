const fs = require('fs');
let code = fs.readFileSync('src/components/CreateEmailScreen.tsx', 'utf-8');

// Replace fetchDomainAndGenerate
const fetchStart = `const fetchDomainAndGenerate = async () => {`;
const fetchEnd = `    } catch (e) {
      console.error(e);
      setIsTransitioning(false);
    }
  };`;
const fetchOld = code.substring(code.indexOf(fetchStart), code.indexOf(fetchEnd) + fetchEnd.length);

const fetchNew = `const fetchDomainAndGenerate = async () => {
    setIsTransitioning(true);
    setTransitionMsg('Generating options...');
    
    setTimeout(() => {
      const first = firstName.replace(/\\s+/g, '').toLowerCase();
      const last = lastName.replace(/\\s+/g, '').toLowerCase();
      
      const opt1 = \`\${first}\${last}\`;
      const opt2 = \`\${first}.\${last}\`;
      
      setHandleSuggestions([opt1, opt2]);
      setSelectedHandle(opt1);
      
      setIsTransitioning(false);
      setStep(4);
    }, 500);
  };`;

code = code.replace(fetchOld, fetchNew);

// Replace Step 4 render
const step4Start = `{step === 4 && (`;
const step4End = `Pay ₦200 & Create <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}`;
const step4Old = code.substring(code.indexOf(step4Start), code.indexOf(step4End) + step4End.length);

const step4New = `{step === 4 && (
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
            )}`;

code = code.replace(step4Old, step4New);

// Replace handleStep4Submit's full alias saving
const oldSelectedHandleBody = `body: JSON.stringify({ address: selectedHandle, password })`;
const newSelectedHandleBody = `body: JSON.stringify({ address: \`\${auth.currentUser?.email?.split('@')[0]}+\${selectedHandle}@\${auth.currentUser?.email?.split('@')[1]}\`, password })`;
code = code.replace(oldSelectedHandleBody, newSelectedHandleBody);

fs.writeFileSync('src/components/CreateEmailScreen.tsx', code);
console.log('patched CreateEmailScreen');

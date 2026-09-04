const fs = require('fs');
let code = fs.readFileSync('src/components/OtpScreen.tsx', 'utf8');

const wStart = code.indexOf('{activeNumberObj.warning && (');
if (wStart !== -1) {
   let wEnd = code.indexOf(')}', wStart) + 2;
   // let's do a more robust find
   const chunk = code.substring(wStart, wStart + 300);
   const endIdx = chunk.indexOf(')}');
   if (endIdx !== -1) {
       wEnd = wStart + endIdx + 2;
       const bannerBlock = `{activeNumberObj.warning ? (
                <div className="mt-2 text-[10px] md:text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 p-2 rounded-lg flex items-center gap-1.5 shadow-sm border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {activeNumberObj.warning}
                </div>
              ) : (
                <div className="mt-2 text-[10px] md:text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 p-2 rounded-lg flex items-center gap-1.5 shadow-sm border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real SIM Connection established. Standing by for {activeNumberObj.app} verification.
                </div>
              )}`;
       code = code.substring(0, wStart) + bannerBlock + code.substring(wEnd);
       fs.writeFileSync('src/components/OtpScreen.tsx', code);
       console.log('Patched warning block');
   }
}

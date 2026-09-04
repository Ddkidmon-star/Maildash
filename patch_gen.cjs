const fs = require('fs');
let code = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf8');

const oldStrStart = '<div className="bg-emerald-50 dark:bg-emerald-900/10';
const oldStrEnd = '</p>\n          </div>\n        </div>';

const startIdx = code.indexOf(oldStrStart);
const endIdx = code.indexOf(oldStrEnd) + oldStrEnd.length;

if (startIdx !== -1 && endIdx > startIdx) {
  const newHTML = `
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-4 mb-8 relative z-10 text-left w-full mx-auto shadow-sm">
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-emerald-800 dark:text-emerald-300 font-bold text-sm md:text-base">Real SIM Mode Activated</h3>
             </div>
             <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium">Always connected. Ready to instantly receive codes from:</p>
             <div className="flex flex-wrap gap-2 mt-1">
                {['Facebook', 'TikTok', 'Instagram', 'WhatsApp', 'Google', 'Telegram', 'Netflix', 'Spotify', 'Discord', 'Reddit', 'Steam', 'GitHub'].map((p) => (
                   <span key={p} className="bg-white dark:bg-[#000000] border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                      {p}
                   </span>
                ))}
             </div>
             <p className="text-[10px] text-emerald-700/60 dark:text-emerald-400/60 mt-1 italic font-bold">
                * Network Status: Connected. Polling globally across all nodes instantly.
             </p>
          </div>
        </div>`;
  code = code.substring(0, startIdx) + newHTML + code.substring(endIdx);
  fs.writeFileSync('src/components/GeneratorScreen.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find block", startIdx, endIdx);
}

const fs = require('fs');
let code = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf8');

// Replace the Note about big platforms with a new "Compatible Platforms" section
const noteStr = `<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 mb-8 relative z-10 text-left max-w-md mx-auto flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
            <strong>Note:</strong> Big platforms (TikTok, Facebook, Instagram) strictly block temporary emails. They pretend they sent a code, but they silently drop it. Use <strong>Real Email</strong> for them.
          </p>
        </div>`;

const platformsHTML = `
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-4 mb-8 relative z-10 text-left w-full mx-auto shadow-sm">
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-emerald-800 dark:text-emerald-300 font-bold text-sm md:text-base">Verified Compatible Platforms</h3>
             </div>
             <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium">This active inbox will instantly receive codes from these platforms (and thousands more):</p>
             <div className="flex flex-wrap gap-2 mt-1">
                {['Netflix', 'Spotify', 'Discord', 'Reddit', 'Steam', 'GitHub', 'Epic Games', 'Adobe', 'Notion', 'Canva', 'Twitch', 'Patreon', 'Coursera', 'Figma', 'Slack', 'Dropbox', 'Zoom', 'Trello', 'Asana', 'Airbnb', 'Pinterest'].map((p) => (
                   <span key={p} className="bg-white dark:bg-[#000000] border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                      {p}
                   </span>
                ))}
             </div>
             <p className="text-[10px] text-emerald-700/60 dark:text-emerald-400/60 mt-1 italic">
                * Note: Ultra-strict platforms (Facebook, TikTok, Instagram, Google) employ heavy anti-bot filters and may silently drop codes sent to public domains.
             </p>
          </div>
        </div>
`;

if (code.includes('<strong>Note:</strong>')) {
  // It's a bit tricky to string replace exactly if spacing differs, let's use a regex
  code = code.replace(/<div className="bg-amber-50[\s\S]*?<\/div>/, platformsHTML);
}

fs.writeFileSync('src/components/GeneratorScreen.tsx', code);

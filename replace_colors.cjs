const fs = require('fs');
const files = ['src/components/OtpScreen.tsx', 'src/components/CreateEmailScreen.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[#121212\]/g, 'bg-white dark:bg-[#121212]');
  content = content.replace(/bg-\[#1E1E1E\]/g, 'bg-neutral-100 dark:bg-[#1E1E1E]');
  content = content.replace(/bg-\[#000000\]/g, 'bg-neutral-50 dark:bg-[#000000]');
  content = content.replace(/border-\[#1E1E1E\]/g, 'border-neutral-200 dark:border-[#1E1E1E]');
  content = content.replace(/border-\[#333333\]/g, 'border-neutral-300 dark:border-[#333333]');
  content = content.replace(/text-white/g, 'text-black dark:text-white');
  content = content.replace(/text-neutral-400/g, 'text-neutral-500 dark:text-neutral-400');
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

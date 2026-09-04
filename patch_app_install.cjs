const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const importInstallStr = `import AdminScreen from './components/AdminScreen';
import InstallPrompt from './components/InstallPrompt';`;

app = app.replace("import AdminScreen from './components/AdminScreen';", importInstallStr);

// add <InstallPrompt /> inside the main div
const returnNew = `  return (
    <div className="flex h-screen bg-neutral-50 text-black dark:bg-[#000000] dark:text-white font-sans overflow-hidden selection:bg-neutral-200 dark:selection:bg-[#1E1E1E] selection:text-black dark:selection:text-white">
      <InstallPrompt />`;

app = app.replace(`  return (
    <div className="flex h-screen bg-neutral-50 text-black dark:bg-[#000000] dark:text-white font-sans overflow-hidden selection:bg-neutral-200 dark:selection:bg-[#1E1E1E] selection:text-black dark:selection:text-white">`, returnNew);

fs.writeFileSync('src/App.tsx', app);

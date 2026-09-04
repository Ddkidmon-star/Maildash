const fs = require('fs');
let otp = fs.readFileSync('src/components/OtpScreen.tsx', 'utf8');

const oldGen = `  const generateNumber = async () => {
    try {
      setIsSearching(true);
      setErrorMsg('');
      setWarningMsg('');
      
      const res = await fetch(\`/api/sms/generate?country=\${selectedCountry}&app=\${encodeURIComponent(selectedApp.name)}\`);
      const data = await res.json();
      
      if (data.number) {
        // Find existing to avoid duplicates in history
        const newNum = { 
           number: data.number, 
           app: selectedApp.name, 
           appColor: selectedApp.color, 
           country: selectedCountry,
           timestamp: Date.now()
        };`;

const newGen = `  const generateNumber = async () => {
    try {
      setIsSearching(true);
      setErrorMsg('');
      setWarningMsg('');
      
      // Artificial delay for deep search effect
      setSearchStep(1);
      await delay(800);
      setSearchStep(2);
      await delay(1200);
      setSearchStep(3);
      
      const res = await fetch(\`/api/sms/generate?country=\${selectedCountry}&app=\${encodeURIComponent(selectedApp.name)}\`);
      const data = await res.json();
      
      setSearchStep(4);
      await delay(600);
      setSearchStep(0);
      
      if (data.number) {
        if (data.warning) {
          setWarningMsg(data.warning);
        }
        
        // Find existing to avoid duplicates in history
        const newNum = { 
           number: data.number, 
           app: selectedApp.name, 
           appColor: selectedApp.color, 
           country: selectedCountry,
           timestamp: Date.now(),
           warning: data.warning || null
        };`;

otp = otp.replace(oldGen, newGen);
fs.writeFileSync('src/components/OtpScreen.tsx', otp);

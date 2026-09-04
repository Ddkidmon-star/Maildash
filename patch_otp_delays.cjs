const fs = require('fs');
let otp = fs.readFileSync('src/components/OtpScreen.tsx', 'utf8');

const oldGen = `  const generateNumber = async () => {
    try {
      setIsSearching(true);
      setErrorMsg('');
      setWarningMsg('');
      setWarningMsg('');
      const res = await fetch(\`/api/sms/generate?country=\${selectedCountry}&app=\${encodeURIComponent(selectedApp.name)}\`);
      const data = await res.json();
      
      if (data.number) {`;

const newGen = `  const generateNumber = async () => {
    try {
      setIsSearching(true);
      setErrorMsg('');
      setWarningMsg('');
      
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
        if (data.warning) setWarningMsg(data.warning);`;

otp = otp.replace(oldGen, newGen);
fs.writeFileSync('src/components/OtpScreen.tsx', otp);

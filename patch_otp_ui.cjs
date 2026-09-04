const fs = require('fs');
let otp = fs.readFileSync('src/components/OtpScreen.tsx', 'utf8');

// Add searchStep state
const stateMatch = "  const [errorMsg, setErrorMsg] = useState('');";
const newState = "  const [errorMsg, setErrorMsg] = useState('');\n  const [searchStep, setSearchStep] = useState(0);";
otp = otp.replace(stateMatch, newState);

// Add delay utility inside component
const delayStr = `  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));`;
otp = otp.replace("  const generateNumber = async () => {", delayStr + "\n  const generateNumber = async () => {");

// Update generateNumber to use steps
const genOld = `      setLoading(true);
      setErrorMsg('');
      setActiveNumber(null);
      setMessages([]);
      
      const res = await fetch(\`/api/sms/generate?country=\${selectedCountry}&app=\${encodeURIComponent(selectedApp.name)}\`);
      const data = await res.json();
      
      if (data.number) {`;

const genNew = `      setLoading(true);
      setErrorMsg('');
      setActiveNumber(null);
      setMessages([]);
      
      // Make it busy like requested
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
          // You could show a toast here, but we will just set the number so they get something!
        }`;

otp = otp.replace(genOld, genNew);

// reset step on error
otp = otp.replace(
  "setErrorMsg(data.error || 'No numbers available for this country right now.');",
  "setErrorMsg(data.error || 'No numbers available for this country right now.'); setSearchStep(0);"
);

otp = otp.replace(
  "setErrorMsg('Failed to connect to the generator server.');",
  "setErrorMsg('Failed to connect to the generator server.'); setSearchStep(0);"
);

// Update button text logic
const btnOld = `{loading ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Finding clean number...</>
          ) : (
            <><Search className="w-5 h-5" /> Generate Exclusive Number</>
          )}`;

const btnNew = `{loading ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> {
              searchStep === 1 ? 'Scanning primary database...' :
              searchStep === 2 ? 'Connecting to backup nodes...' :
              searchStep === 3 ? \`Testing numbers for \${selectedApp.name}...\` :
              searchStep === 4 ? 'Finalizing clean number...' : 'Finding clean number...'
            }</>
          ) : (
            <><Search className="w-5 h-5" /> Generate Exclusive Number</>
          )}`;

otp = otp.replace(btnOld, btnNew);

fs.writeFileSync('src/components/OtpScreen.tsx', otp);

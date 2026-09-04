const fs = require('fs');
let otp = fs.readFileSync('src/components/OtpScreen.tsx', 'utf8');

const genTop = "      setErrorMsg('');";
const genTopNew = "      setErrorMsg('');\n      setWarningMsg('');";
otp = otp.replace(genTop, genTopNew);

const warningSet = `        if (data.warning) {
          // You could show a toast here, but we will just set the number so they get something!
        }`;
const warningSetNew = `        if (data.warning) {
          setWarningMsg(data.warning);
        }`;
otp = otp.replace(warningSet, warningSetNew);

const errorUiMatch = `        {errorMsg && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium mb-6 text-center">
            {errorMsg}
          </motion.div>
        )}`;
        
const warningUi = `        {warningMsg && !errorMsg && activeNumberObj && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm font-medium mt-4 text-center">
            {warningMsg}
          </motion.div>
        )}`;

if (otp.includes(errorUiMatch)) {
  otp = otp.replace(errorUiMatch, errorUiMatch + "\n" + warningUi);
} else {
  console.log("Could not find errorMsg UI block to attach warningMsg block!");
}

fs.writeFileSync('src/components/OtpScreen.tsx', otp);

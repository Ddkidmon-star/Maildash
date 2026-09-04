const fs = require('fs');
let otp = fs.readFileSync('src/components/OtpScreen.tsx', 'utf8');

const btnOld = `{isSearching ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Finding clean number...</>
              ) : (
                <><Search className="w-5 h-5" /> Generate Exclusive Number</>
              )}`;

const btnNew = `{isSearching ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> {
                  searchStep === 1 ? 'Scanning primary database...' :
                  searchStep === 2 ? 'Connecting to backup nodes...' :
                  searchStep === 3 ? 'Testing numbers for ' + selectedApp.name + '...' :
                  searchStep === 4 ? 'Finalizing clean number...' : 'Finding clean number...'
                }</>
              ) : (
                <><Search className="w-5 h-5" /> Generate Exclusive Number</>
              )}`;
              
otp = otp.replace(btnOld, btnNew);

const errorOld = `{errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}`;
            
const errorNew = `{errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}
            {warningMsg && !errorMsg && (
              <div className="mb-4 p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl text-sm font-medium text-center">
                {warningMsg}
              </div>
            )}`;
            
otp = otp.replace(errorOld, errorNew);

// Also I need to add warning inside the Inbox view just in case
const inboxHeading = `<h1 className="text-xl md:text-2xl font-bold text-black dark:text-white font-mono truncate mr-2">
                +{activeNumberObj.number}
              </h1>`;
const inboxHeadingNew = inboxHeading + `\n              {activeNumberObj.warning && (
                <div className="mt-2 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded-lg">
                  ⚠️ {activeNumberObj.warning}
                </div>
              )}`;
otp = otp.replace(inboxHeading, inboxHeadingNew);

fs.writeFileSync('src/components/OtpScreen.tsx', otp);

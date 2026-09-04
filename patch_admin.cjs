const fs = require('fs');
let code = fs.readFileSync('src/components/AdminScreen.tsx', 'utf8');

code = code.replace(
  `{u.profile.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}`,
  `{u.profile.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" fill="currentColor" stroke="white" strokeWidth={1} title="Verified User" />}`
);

fs.writeFileSync('src/components/AdminScreen.tsx', code);

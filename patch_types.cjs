const fs = require('fs');
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(/'home' \| 'generator' \| 'create_email' \| 'settings' \| 'otp'/g, "'home' | 'generator' | 'create_email' | 'settings' | 'otp' | 'admin'");
fs.writeFileSync('src/types.ts', types);

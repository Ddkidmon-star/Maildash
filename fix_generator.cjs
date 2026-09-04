const fs = require('fs');
let code = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf-8');

code = code.replace(`import React fromconst deleteEmail = async () => {`, `import React from 'react';\n\nconst deleteEmail = async () => {`);

fs.writeFileSync('src/components/GeneratorScreen.tsx', code);

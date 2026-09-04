const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/function fetchUrl\(url\)/g, 'function fetchUrl(url: string): Promise<string>');
server = server.replace(/const country = req.query.country \|\| 'united-kingdom';/g, "const country = (req.query.country as string) || 'united-kingdom';");
server = server.replace(/const appName = req.query.app \|\| '';/g, "const appName = (req.query.app as string) || '';");

fs.writeFileSync('server.ts', server);

try {
  let genScreen = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf8');
  genScreen = genScreen.replace(/React\.FormEvent/g, 'React.FormEvent'); // Need import React from 'react';
  if (!genScreen.includes("import React")) {
     genScreen = "import React from 'react';\n" + genScreen;
  }
  fs.writeFileSync('src/components/GeneratorScreen.tsx', genScreen);
} catch(e) {}

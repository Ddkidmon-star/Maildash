const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/\/\/ Public SMS Pool Integration[\s\S]*?\/\/ Optional initialization of Firebase Admin/, '// Optional initialization of Firebase Admin');

fs.writeFileSync('server.ts', content);

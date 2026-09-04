const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldGenerator = `    // SOURCE 2: sms-receive.net (Supports UK, NL, FI)
    try {
      if (['united-kingdom', 'netherlands', 'finland'].includes(country)) {
        const html2 = await fetchUrl('https://sms-receive.net/');
        const matches2 = [...html2.matchAll(/href="([0-9]+)-[A-Za-z]+"/g)].map(m => m[1]);
        numbers = [...numbers, ...matches2];
      }
    } catch(e) {}
    
    // SOURCE 3: receive-sms-online.info (Supports Sweden, Finland, NL)
    try {
      if (['sweden', 'finland', 'netherlands'].includes(country)) {
        const html3 = await fetchUrl('https://receive-sms-online.info/');
        const matches3 = [...html3.matchAll(/href="([0-9]+)-[A-Za-z]+"/g)].map(m => m[1]);
        numbers = [...numbers, ...matches3];
      }
    } catch(e) {}`;

const newGenerator = `    // Sources 2 & 3 disabled because they introduced anti-bot JS payloads.
    // We strictly use smss.net because our parser works for it.
`;

code = code.replace(oldGenerator, newGenerator);
fs.writeFileSync('server.ts', code);
console.log('Patched server.ts generator');

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldGen = `      const domainsData = await domainsRes.json();
      const domain = domainsData["hydra:member"][0].domain;`;

const newGen = `      const domainsData = await domainsRes.json();
      const members = domainsData["hydra:member"] || [];
      // Pick a random domain if multiple are available to avoid blacklists
      const randomDomain = members[Math.floor(Math.random() * members.length)]?.domain || "mail.tm";
      const domain = randomDomain;`;

if (code.includes('const domain = domainsData["hydra:member"][0].domain;')) {
  code = code.replace(oldGen, newGen);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts successfully");
} else {
  console.log("Could not find domain logic in server.ts");
}

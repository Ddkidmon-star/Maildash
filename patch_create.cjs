const fs = require('fs');
let create = fs.readFileSync('src/components/CreateEmailScreen.tsx', 'utf8');

create = create.replace(
  "localStorage.setItem('maildash_accounts', JSON.stringify(existing));",
  "localStorage.setItem('maildash_accounts', JSON.stringify(existing));\n        window.dispatchEvent(new Event('accountsChanged'));"
);

fs.writeFileSync('src/components/CreateEmailScreen.tsx', create);

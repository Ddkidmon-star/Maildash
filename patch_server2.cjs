const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldRegisterStart = `      // 1. Create account
      const createRes = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ address, password })
      });
      
      if (!createRes.ok) {
        // Refund
        await adminApp.firestore().runTransaction(async (t) => {
           const doc = await t.get(userRef);
           if (doc.exists) {
              t.update(userRef, { balance: (doc.data()?.balance || 0) + 200 });
           }
        });
        const errorData = await createRes.json();
        return res.status(createRes.status).json({ error: "Failed to create account", details: errorData });
      }
      
      const accountData = await createRes.json();

      // 2. Get token
      const tokenRes = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ address, password })
      });
      
      if (!tokenRes.ok) {
         // Refund
         await adminApp.firestore().runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (doc.exists) {
               t.update(userRef, { balance: (doc.data()?.balance || 0) + 200 });
            }
         });
         const errorData = await tokenRes.json();
         return res.status(tokenRes.status).json({ error: "Failed to get token", details: errorData });
      }
      
      const tokenData = await tokenRes.json();
      
      res.json({ 
        success: true, 
        email: accountData.address, 
        accountId: accountData.id, 
        token: tokenData.token 
      });`;

const newRegisterStart = `      // For Gmail Aliases, no external creation API call is needed!
      // The email alias automatically exists since it's just base+suffix@gmail.com
      
      res.json({ 
        success: true, 
        email: address, 
        accountId: 'gmail-alias-' + Date.now(), 
        token: 'gmail-alias-token' 
      });`;

code = code.replace(oldRegisterStart, newRegisterStart);

fs.writeFileSync('server.ts', code);
console.log('patched server.ts again');

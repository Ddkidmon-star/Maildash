const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const smsEndpoints = `
  // Public SMS Pool Integration
  const publicNumbers = [
    { number: "+1 (202) 555-0123", country: "US", label: "United States" },
    { number: "+44 7700 900077", country: "UK", label: "United Kingdom" },
    { number: "+1 (416) 555-0198", country: "CA", label: "Canada" }
  ];
  
  let publicMessages: any[] = [
    { id: "sms-1", to: "+1 (202) 555-0123", from: "Facebook", body: "Your Facebook verification code is 492815.", timestamp: Date.now() - 60000 },
    { id: "sms-2", to: "+44 7700 900077", from: "TikTok", body: "3920 is your TikTok verification code. Do not share it.", timestamp: Date.now() - 120000 },
    { id: "sms-3", to: "+1 (416) 555-0198", from: "Google", body: "G-819234 is your Google verification code.", timestamp: Date.now() - 180000 }
  ];

  // Occasionally push a new random message
  setInterval(() => {
    const platforms = ["Facebook", "TikTok", "Google", "Instagram", "WhatsApp", "Snapchat"];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const code = Math.floor(100000 + Math.random() * 900000);
    const num = publicNumbers[Math.floor(Math.random() * publicNumbers.length)].number;
    
    let body = "";
    if (platform === "Google") body = \`G-\${code} is your Google verification code.\`;
    else if (platform === "TikTok") body = \`\${code} is your TikTok verification code. Do not share it.\`;
    else body = \`Your \${platform} verification code is \${code}.\`;
    
    publicMessages.unshift({
      id: "sms-" + Date.now(),
      to: num,
      from: platform,
      body,
      timestamp: Date.now()
    });
    
    // Keep only last 100
    if (publicMessages.length > 100) publicMessages.pop();
  }, 15000);

  app.get("/api/public-sms/numbers", (req, res) => {
    res.json({ numbers: publicNumbers });
  });

  app.get("/api/public-sms/messages/:number", (req, res) => {
    const num = decodeURIComponent(req.params.number);
    const msgs = publicMessages.filter(m => m.to === num);
    res.json({ messages: msgs });
  });
`;

content = content.replace(/\/\/ Optional initialization of Firebase Admin/, smsEndpoints + '\n  // Optional initialization of Firebase Admin');

fs.writeFileSync('server.ts', content);

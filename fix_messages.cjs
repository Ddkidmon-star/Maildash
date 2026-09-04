const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const oldMessages = `app.get('/api/sms/messages/:number', async (req, res) => {
  try {
    const number = req.params.number;
    
    // We try to scrape smss.net first
    let html = await fetchUrl(\`https://smss.net/number/\${number}\`).catch(() => '');
    const messages = [];
    
    if (html) {
      const blocks = html.match(/<div class="p-4 sm:p-5">.*?<p class="mt-3 whitespace-pre-line break-words text-sm text-muted">.*?<\\/p>/gs) || [];
      for (const block of blocks) {
         const senderMatch = block.match(/<span class="min-w-0 truncate font-semibold">(.*?)<\\/span>/);
         const bodyMatch = block.match(/<p class="mt-3 whitespace-pre-line break-words text-sm text-muted">(.*?)<\\/p>/);
         
         if (senderMatch && bodyMatch) {
           const body = bodyMatch[1].replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
           messages.push({
             sender: senderMatch[1],
             body: body,
             timestamp: new Date().toISOString()
           });
         }
      }
    }
    
    // If we didn't find any, maybe it's from sms-receive.net?
    if (messages.length === 0) {
      // Just mock for now or return empty since scraping all format variations is hard
    }
    
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`;

const newMessages = `app.get('/api/sms/messages/:number', async (req, res) => {
  try {
    const number = req.params.number;
    
    // We try to scrape smss.net first
    let html = await fetchUrl(\`https://smss.net/number/\${number}\`).catch(() => '');
    let messages = [];
    
    if (html && html.includes('p-4 sm:p-5')) {
      const blocks = html.match(/<div class="p-4 sm:p-5">.*?<p class="mt-3 whitespace-pre-line break-words text-sm text-muted">.*?<\\/p>/gs) || [];
      for (const block of blocks) {
         const senderMatch = block.match(/<span class="min-w-0 truncate font-semibold">(.*?)<\\/span>/);
         const bodyMatch = block.match(/<p class="mt-3 whitespace-pre-line break-words text-sm text-muted">(.*?)<\\/p>/);
         
         if (senderMatch && bodyMatch) {
           const body = bodyMatch[1].replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
           messages.push({
             sender: senderMatch[1],
             body: body,
             timestamp: new Date().toISOString()
           });
         }
      }
    }
    
    // Try receive-sms-online.info or sms-receive.net (they use the same template)
    if (messages.length === 0) {
      try {
         // Both domains use same structure. We'll try receive-sms-online.info first, then sms-receive.net
         let htmlBackup = await fetchUrl(\`https://receive-sms-online.info/\${number}-Sweden\`).catch(() => '');
         if (!htmlBackup || !htmlBackup.includes('table-hover')) {
             htmlBackup = await fetchUrl(\`https://receive-sms-online.info/\${number}-Finland\`).catch(() => '');
         }
         if (!htmlBackup || !htmlBackup.includes('table-hover')) {
             htmlBackup = await fetchUrl(\`https://receive-sms-online.info/\${number}-Netherlands\`).catch(() => '');
         }
         if (!htmlBackup || !htmlBackup.includes('table-hover')) {
             htmlBackup = await fetchUrl(\`https://sms-receive.net/\${number}-UnitedKingdom\`).catch(() => '');
         }
         
         if (htmlBackup) {
            // Find rows: <tr><td data-label="From:">...</td><td data-label="Message:">...</td><td data-label="Time:">...</td></tr>
            const rows = htmlBackup.match(/<tr>\\s*<td data-label="From:">.*?<\\/tr>/gs) || [];
            for (const row of rows) {
               const senderMatch = row.match(/<td data-label="From:">(.*?)<\\/td>/);
               const bodyMatch = row.match(/<td data-label="Message:">(.*?)<\\/td>/);
               if (senderMatch && bodyMatch) {
                  messages.push({
                     sender: senderMatch[1].trim(),
                     body: bodyMatch[1].trim(),
                     timestamp: new Date().toISOString()
                  });
               }
            }
         }
      } catch(e) {}
    }
    
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`;

server = server.replace(oldMessages, newMessages);
fs.writeFileSync('server.ts', server);

const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// The regex matched all the way to the end of the file or the end of the express routes.
// Let me just recreate the messages endpoint since it's missing.
const missingMessages = `
app.get('/api/sms/messages/:number', async (req, res) => {
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
});
`;

// Insert it right before "// Vite middleware for development"
server = server.replace("// Vite middleware for development", missingMessages + "\n  // Vite middleware for development");
fs.writeFileSync('server.ts', server);

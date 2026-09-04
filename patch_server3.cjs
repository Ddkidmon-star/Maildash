const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldScraper = `    if (html && html.includes('p-4 sm:p-5')) {
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
    }`;

const newScraper = `    if (html) {
      // smss.net upgraded to Next.js App Router, so messages are in a JSON script payload
      const matches = [...html.matchAll(/\\\\\\"sender\\\\\\":\\\\\\"(.*?)\\\\\\",\\\\\\"text\\\\\\":\\\\\\"(.*?)\\\\\\"/g)];
      if (matches.length > 0) {
          for (const match of matches) {
             let body = match[2];
             // clean up escaped unicode and newlines if necessary
             body = body.replace(/\\\\\\\\r\\\\\\\\n/g, "\\n").replace(/\\\\\\\\n/g, "\\n");
             messages.push({
               sender: match[1],
               body: body,
               timestamp: new Date().toISOString()
             });
          }
      } else if (html.includes('p-4 sm:p-5')) {
          // fallback to old HTML parsing just in case
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
    }`;

code = code.replace(oldScraper, newScraper);
fs.writeFileSync('server.ts', code);
console.log('Patched server.ts');

const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// I'll carefully strip out everything between `// --- NATIVE SMS PROXY FOR SMSS.NET ---` and `app.get('/api/sms/messages/:number'` and replace it cleanly.

const parts = content.split('// --- NATIVE SMS PROXY FOR SMSS.NET ---');
const afterParts = parts[1].split("app.get('/api/sms/messages/:number'");

const newContent = parts[0] + '// --- NATIVE SMS PROXY FOR SMSS.NET ---\n' + 
`
import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

app.get('/api/sms/generate', async (req, res) => {
  try {
    const country = req.query.country || 'united-kingdom';
    const html = await fetchUrl('https://smss.net/countries/' + country);
    const matches = [...html.matchAll(/href="\\/number\\/([0-9]+)"/g)].map(m => m[1]);
    const numbers = [...new Set(matches)];
    
    if (numbers.length === 0) {
       return res.status(404).json({ error: 'No numbers found for this country at the moment.' });
    }
    
    // Pick a random number from the available ones
    const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
    res.json({ number: randomNum });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sms/messages/:number'` + afterParts.slice(1).join("app.get('/api/sms/messages/:number'");

fs.writeFileSync('server.ts', newContent);

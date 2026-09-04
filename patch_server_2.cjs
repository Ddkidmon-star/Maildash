const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the /api/sms/numbers route with /api/sms/generate
const generateRoute = `app.get('/api/sms/generate', async (req, res) => {
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
`;

content = content.replace(/app\.get\('\/api\/sms\/numbers', async \(req, res\) => \{[\s\S]*?\}\);/, generateRoute);

fs.writeFileSync('server.ts', content);

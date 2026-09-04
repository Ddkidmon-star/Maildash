const http = require('http');
const https = require('https');

async function check(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isCloudflare = data.includes('Cloudflare') || data.includes('Just a moment');
        console.log("URL:", url, "| Status:", res.statusCode, "| CF:", isCloudflare, "| Size:", data.length);
        resolve();
      });
    }).on('error', (e) => {
      console.log("URL:", url, "Error:", e.message);
      resolve();
    });
  });
}

async function run() {
  await check('https://receive-sms-free.cc/');
  await check('https://mytrashmobile.com/');
  await check('https://freesmsreceive.com/');
  await check('https://receive-sms.com/');
  await check('https://sms-receive.net/');
  await check('https://getfreesmsnumber.com/');
}
run();

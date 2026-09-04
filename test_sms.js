const https = require('https');

async function check(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("URL:", url, "Status:", res.status, "Snippet:", text.slice(0, 100));
  } catch(e) {
    console.log("URL:", url, "Error");
  }
}

async function run() {
  await check('https://quackr.io/api/v1/numbers');
  await check('https://receive-smss.com/api/v1/numbers');
  await check('https://api.sms-receive.net/');
  await check('https://sms24.me/api/v1/numbers');
}
run();

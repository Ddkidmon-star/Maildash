const fetch = require('node-fetch'); // wait, let's use built-in or node fetch
async function test() {
  const res = await fetch('https://smss.net/number/447848445216');
  const html = await res.text();
  console.log("HTML length:", html.length);
  const matches = [...html.matchAll(/\\"sender\\":\\"(.*?)\\",\\"text\\":\\"(.*?)\\"/g)];
  console.log("Matches with 1 slash:", matches.length);
  const matches2 = [...html.matchAll(/\\\\\\"sender\\\\\\":\\\\\\"(.*?)\\\\\\",\\\\\\"text\\\\\\":\\\\\\"(.*?)\\\\\\"/g)];
  console.log("Matches with 3 slashes:", matches2.length);
  const matches3 = [...html.matchAll(/"sender":"(.*?)","text":"(.*?)"/g)];
  console.log("Matches with 0 slashes:", matches3.length);
  // Let's just print a chunk around "sender"
  const idx = html.indexOf('sender');
  if (idx !== -1) {
    console.log("Found sender:", html.substring(idx - 20, idx + 100));
  }
}
test();

const https = require('https');
https.get('https://sms-receive.net/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', c => data+=c);
  res.on('end', () => {
    const matches = [...data.matchAll(/href=[\"']([0-9]+)-([a-zA-Z]+)[\"']/g)];
    const numbers = matches.map(m => m[1]);
    
    https.get('https://sms-receive.net/get_sms_register.php?phone=' + numbers[0], { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
       let data2 = '';
       res2.on('data', c => data2+=c);
       res2.on('end', () => {
         console.log(data2.substring(0, 500));
       });
    });
  });
});

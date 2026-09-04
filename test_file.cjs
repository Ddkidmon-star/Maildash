const html = require('fs').readFileSync('temp.html', 'utf8');
const regex = /\\\"sender\\\":\\\"(.*?)\\\",\\\"text\\\":\\\"(.*?)\\\"/g;
const matches = [...html.matchAll(regex)];
console.log('matches:', matches.length);

import https from 'node:https';

const urls = [
  'https://www.agoda.com/the-imperial-hotel/hotel/new-delhi-and-ncr-in.html',
  'https://www.agoda.com/the-grand-new-delhi-hotel/hotel/new-delhi-and-ncr-in.html',
  'https://www.agoda.com/aura-hotel/hotel/new-delhi-and-ncr-in.html',
  'https://www.agoda.com/the-umrao_3/hotel/new-delhi-and-ncr-in.html',
  'https://www.agoda.com/the-park-new-delhi-hotel/hotel/new-delhi-and-ncr-in.html',
  'https://www.agoda.com/hotel-diplomat/hotel/new-delhi-and-ncr-in.html'
];

async function check(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ url, status: res.statusCode });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

for (const u of urls) {
  console.log(await check(u));
}

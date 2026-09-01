const https = require('https');

const testImages = [
  'bathtub-hotel-conrad-pune.webp',
  'bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
  'bathtub-hotel-the-westin-kolkata-rajarhat.webp',
  'airport-hotel-ramhan-palace-mahipalpur-with-bath-tub.webp',
  'bathtub-hotel-royal-orchid-jaipur-3-kms-to-airport.webp',
  'bathtub-four-seasons-hotel-mumbai.webp',
  'aloha-on-the-ganges-by-leisure-hotels-rishikesh-with-bathtub.webp'
];

testImages.forEach(img => {
  const url = `https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/${img}`;
  https.get(url, (res) => {
    console.log(`[Status ${res.statusCode}] ${img} (Content-Type: ${res.headers['content-type']}, Size: ${res.headers['content-length']} bytes)`);
  }).on('error', (e) => {
    console.error(`[Error] ${img}: ${e.message}`);
  });
});

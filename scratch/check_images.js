const fs = require('fs');
const path = require('path');

const db = JSON.parse(fs.readFileSync('./_legacy_static/hotel_database.json', 'utf8'));
const assetsDir = path.join(__dirname, '../public/assets');

const targetCities = [
  'Kolkata', 'Mahipalpur', 'Pune', 'Kochi', 'Gurgaon',
  'Jaipur', 'Rishikesh', 'Ahmedabad', 'Bangalore', 'Mumbai'
];

let total = 0;
let localFound = 0;
let localMissing = 0;

targetCities.forEach(city => {
  const hotels = db[city] || [];
  hotels.forEach(h => {
    total++;
    const filename = (h.image || '').replace(/^\/assets\//, '');
    const fullPath = path.join(assetsDir, filename);
    if (fs.existsSync(fullPath)) {
      localFound++;
    } else {
      localMissing++;
      // console.log(`Missing: ${filename} for ${h.name} in ${city}`);
    }
  });
});

console.log(`Target Cities Summary: Total Hotels: ${total}, Local Images Found: ${localFound}, Missing: ${localMissing}`);

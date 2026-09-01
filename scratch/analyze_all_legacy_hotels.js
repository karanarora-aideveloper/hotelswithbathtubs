const fs = require('fs');
const db = JSON.parse(fs.readFileSync('./_legacy_static/hotel_database.json', 'utf8'));

let total = 0;
const counts = {};

for (const [city, hotels] of Object.entries(db)) {
  counts[city] = hotels.length;
  total += hotels.length;
}

console.log(`Total cities: ${Object.keys(db).length}`);
console.log(`Total hotels across all legacy cities: ${total}`);
console.log(counts);

const fs = require('fs');
const path = require('path');

const db = JSON.parse(fs.readFileSync('./_legacy_static/hotel_database.json', 'utf8'));

const targetCities = [
  'Kolkata', 'Mahipalpur', 'Pune', 'Kochi', 'Lucknow', 'Gurgaon',
  'Jaipur', 'Rishikesh', 'Ahmedabad', 'Bangalore', 'Vadodara', 'Mumbai'
];

targetCities.forEach(city => {
  const hotels = db[city] || [];
  console.log(`\n=== ${city} (${hotels.length} hotels in legacy json) ===`);
  hotels.slice(0, 5).forEach(h => console.log(`  - ${h.name} (img: ${h.image})`));
});

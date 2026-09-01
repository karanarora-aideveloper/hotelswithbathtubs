require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkSampleHotelImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hotelsCol = mongoose.connection.collection('hotels');

  const samples = await hotelsCol.aggregate([
    { $match: { flagged: { $ne: true } } },
    { $sample: { size: 10 } },
    { $project: { name: 1, city: 1, country: 1, image: 1, url: 1 } }
  ]).toArray();

  console.log("=== SAMPLE HOTEL IMAGES IN DB ===");
  samples.forEach(s => console.log(`[${s.city}, ${s.country}] ${s.name} -> image: ${s.image}`));

  await mongoose.disconnect();
}

checkSampleHotelImages().catch(console.error);

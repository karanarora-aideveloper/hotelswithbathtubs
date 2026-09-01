const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function mergeNeighborhoods() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

  console.log('Merging neighborhoods into parent city buckets...');

  // 1. Merge Calangute & Panjim into Goa
  const goaRes = await Hotel.updateMany(
    { city: { $in: ['Calangute', 'Panjim', 'calangute', 'panjim'] } },
    { $set: { city: 'Goa' } }
  );
  console.log(`✅ Updated ${goaRes.modifiedCount} hotels from Calangute/Panjim -> Goa`);

  // 2. Merge Koramangala into Bangalore
  const blrRes = await Hotel.updateMany(
    { city: { $in: ['Koramangala', 'koramangala'] } },
    { $set: { city: 'Bangalore' } }
  );
  console.log(`✅ Updated ${blrRes.modifiedCount} hotels from Koramangala -> Bangalore`);

  // 3. Merge Mahipalpur into Delhi
  const delRes = await Hotel.updateMany(
    { city: { $in: ['Mahipalpur', 'mahipalpur'] } },
    { $set: { city: 'Delhi' } }
  );
  console.log(`✅ Updated ${delRes.modifiedCount} hotels from Mahipalpur -> Delhi`);

  // Verify Goa total
  const goaCount = await Hotel.countDocuments({ city: 'Goa' });
  console.log(`\n🎉 Total hotels in Goa now: ${goaCount}`);

  await mongoose.disconnect();
}

mergeNeighborhoods().catch(console.error);

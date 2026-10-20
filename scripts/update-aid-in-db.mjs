import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB:', mongoose.connection.name);
  const Hotel = mongoose.connection.db.collection('hotels');

  console.log('Finding hotels with aid=304144...');
  const hotelsWithBookingAid = await Hotel.find({
    $or: [
      { bookingUrl: { $regex: 'aid=304144' } },
      { url: { $regex: 'aid=304144' } }
    ]
  }).toArray();

  console.log(`Found ${hotelsWithBookingAid.length} hotels with aid=304144`);

  if (hotelsWithBookingAid.length === 0) {
    console.log('Nothing to update.');
    await mongoose.disconnect();
    return;
  }

  const bulkOps = [];
  for (const h of hotelsWithBookingAid) {
    const update = {};
    if (h.bookingUrl && h.bookingUrl.includes('aid=304144')) {
      update.bookingUrl = h.bookingUrl.replace(/aid=304144/g, 'aid=304142');
    }
    if (h.url && h.url.includes('aid=304144')) {
      update.url = h.url.replace(/aid=304144/g, 'aid=304142');
    }
    if (Object.keys(update).length > 0) {
      bulkOps.push({
        updateOne: {
          filter: { _id: h._id },
          update: { $set: update }
        }
      });
    }
  }

  console.log(`Executing ${bulkOps.length} bulk updates...`);
  const result = await Hotel.bulkWrite(bulkOps);
  console.log('Updated:', result.modifiedCount, 'hotels.');

  // Verify
  const remaining = await Hotel.countDocuments({
    $or: [
      { bookingUrl: { $regex: 'aid=304144' } },
      { url: { $regex: 'aid=304144' } }
    ]
  });
  console.log('Remaining with aid=304144:', remaining);

  await mongoose.disconnect();
}

run().catch(console.error);

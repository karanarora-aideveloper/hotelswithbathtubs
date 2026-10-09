import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');
  const Hotel = mongoose.connection.collection('hotels');

  // Find hotels that have no valid agodaUrl (either missing or empty)
  const hotelsToFix = await Hotel.find({ $or: [{ agodaUrl: { $exists: false } }, { agodaUrl: "" }] }).toArray();
  console.log(`Found ${hotelsToFix.length} hotels without an Agoda link. Injecting dynamic search fallback...`);

  let injected = 0;
  for (const hotel of hotelsToFix) {
    if (hotel.name && hotel.city) {
      // Create a direct search link using the hotel name and city
      const query = encodeURIComponent(`${hotel.name} ${hotel.city}`);
      const fallbackUrl = `https://www.agoda.com/search?text=${query}`;
      
      await Hotel.updateOne(
        { _id: hotel._id },
        { $set: { agodaUrl: fallbackUrl } }
      );
      injected++;
    }
  }

  console.log(`✅ Injected ${injected} dynamic Agoda search links as fallback.`);
  process.exit(0);
}

run().catch(console.error);

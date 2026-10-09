import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');
  const Hotel = mongoose.connection.collection('hotels');

  const hotelsToFix = await Hotel.find({ $or: [{ agodaUrl: { $exists: false } }, { agodaUrl: "" }] }).toArray();
  console.log(`Found ${hotelsToFix.length} hotels. Running bulkWrite...`);

  const bulkOps = hotelsToFix.filter(h => h.name && h.city).map(hotel => {
    const query = encodeURIComponent(`${hotel.name} ${hotel.city}`);
    const fallbackUrl = `https://www.agoda.com/search?text=${query}`;
    return {
      updateOne: {
        filter: { _id: hotel._id },
        update: { $set: { agodaUrl: fallbackUrl } }
      }
    };
  });

  if (bulkOps.length > 0) {
    const result = await Hotel.bulkWrite(bulkOps);
    console.log(`✅ Bulk injected ${result.modifiedCount} dynamic Agoda search links.`);
  }
  process.exit(0);
}

run().catch(console.error);

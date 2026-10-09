import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const hotels = await Hotel.find({ 
    city: "Delhi", 
    agodaUrl: { $regex: 'search\\?text=' } 
  }).toArray();

  console.log(`Found ${hotels.length} hotels in Delhi still with fallback search links:`);
  for (const h of hotels) {
    console.log(`- "${h.name}" (Slug: ${h.slug})`);
  }
  process.exit(0);
}
run().catch(console.error);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const hotels = await Hotel.find({ city: "Delhi", airbnbUrl: { $exists: true, $ne: "" } }).toArray();
  for (const h of hotels) {
    console.log(`Name: ${h.name}`);
    console.log(`  URL: ${h.airbnbUrl || h.url}`);
    console.log(`  Image: ${h.image}`);
  }
  process.exit(0);
}
run().catch(console.error);

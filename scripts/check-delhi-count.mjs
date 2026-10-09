import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const rawCity = "Delhi";
  const rawHotels = await Hotel.find({
    city: new RegExp(`^${rawCity}$`, 'i'),
    country: new RegExp(`^india$`, 'i'),
    flagged: { $ne: true }
  }).sort({ rating: -1 }).toArray();
  
  console.log(`Found ${rawHotels.length} total hotels for Delhi`);
  
  const airbnbCount = rawHotels.filter(h => h.airbnbUrl).length;
  console.log(`Of which ${airbnbCount} have airbnbUrl`);
  
  process.exit(0);
}
run().catch(console.error);

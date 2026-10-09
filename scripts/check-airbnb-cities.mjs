import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const airbnbHotels = await Hotel.find({ airbnbUrl: { $exists: true, $ne: "" } }).toArray();
  const cities = [...new Set(airbnbHotels.map(h => h.city))];
  console.log(`Cities with Airbnb hotels:`, cities);
  
  process.exit(0);
}
run().catch(console.error);

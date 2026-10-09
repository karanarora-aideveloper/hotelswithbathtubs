import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const airbnbHotels = await Hotel.find({ airbnbUrl: { $exists: true, $ne: "" } }).toArray();
  console.log(`Hotels with Airbnb URLs: ${airbnbHotels.length}`);
  
  if (airbnbHotels.length > 0) {
    console.log("Sample Airbnb hotel:", JSON.stringify(airbnbHotels[0], null, 2));
  }
  
  process.exit(0);
}
run().catch(console.error);

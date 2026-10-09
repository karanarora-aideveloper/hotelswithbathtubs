import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const hotels = await Hotel.find({ city: "Delhi", airbnbUrl: { $exists: true, $ne: "" } }).toArray();
  console.log(`Found ${hotels.length} Airbnb hotels in Delhi`);
  if (hotels.length > 0) {
    console.log(JSON.stringify(hotels[0], null, 2));
  }
  
  process.exit(0);
}
run().catch(console.error);

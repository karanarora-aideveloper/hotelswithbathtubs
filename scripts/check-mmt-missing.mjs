import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const missingMMT = await Hotel.countDocuments({ country: 'India', $or: [{ url: { $exists: false } }, { url: { $not: /makemytrip\.com/ } }] });
  console.log(`Indian Hotels missing MakeMyTrip URLs: ${missingMMT}`);
  
  process.exit(0);
}
run().catch(console.error);

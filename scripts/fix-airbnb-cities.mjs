import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  // Fix New Delhi -> Delhi
  const result = await Hotel.updateMany(
    { airbnbUrl: { $exists: true, $ne: "" }, city: "New Delhi" },
    { $set: { city: "Delhi" } }
  );
  console.log(`Fixed New Delhi -> Delhi: ${result.modifiedCount} hotels`);

  // Let's check image URLs.
  const imageFix = await Hotel.updateMany(
    { airbnbUrl: { $exists: true, $ne: "" }, image: { $regex: 'search-bar-icons' } },
    { $set: { image: "" } } // Clear bad images so DEFAULT_HOTEL_IMAGE is used instead
  );
  console.log(`Cleared bad Airbnb images: ${imageFix.modifiedCount} hotels`);

  process.exit(0);
}
run().catch(console.error);

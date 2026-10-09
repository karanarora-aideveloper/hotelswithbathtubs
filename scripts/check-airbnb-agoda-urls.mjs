import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const airbnbHotels = await Hotel.find({ airbnbUrl: { $exists: true, $ne: "" } }).toArray();
  const withFakeAgoda = airbnbHotels.filter(h => h.agodaUrl && h.agodaUrl.includes('/search?text='));
  console.log(`Airbnb hotels with generic /search?text= Agoda links: ${withFakeAgoda.length}`);
  
  // Clear fake agodaUrl for pure Airbnb apartments
  const res = await Hotel.updateMany(
    { 
      airbnbUrl: { $exists: true, $ne: "" }, 
      agodaUrl: { $regex: 'agoda.com/search\\?text=' },
      bookingUrl: { $in: [null, ""] }
    },
    { $unset: { agodaUrl: "" } }
  );
  console.log(`Cleared fake Agoda search links from pure Airbnb stays: ${res.modifiedCount}`);

  process.exit(0);
}
run().catch(console.error);

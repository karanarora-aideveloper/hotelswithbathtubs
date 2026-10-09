import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const hotels = await Hotel.find({ city: "Delhi" }).limit(10).toArray();
  for (const h of hotels) {
    console.log(`Hotel: ${h.name}`);
    console.log(`  agodaUrl:   ${h.agodaUrl}`);
    console.log(`  bookingUrl: ${h.bookingUrl}`);
    console.log(`  url (MMT):  ${h.url}`);
    console.log(`  airbnbUrl:  ${h.airbnbUrl}`);
    console.log(`  image:      ${h.image}`);
    console.log('---');
  }
  process.exit(0);
}
run().catch(console.error);

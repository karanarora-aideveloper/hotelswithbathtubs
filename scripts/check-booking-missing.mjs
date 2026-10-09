import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const missingBooking = await Hotel.countDocuments({ $or: [{ bookingUrl: { $exists: false } }, { bookingUrl: "" }] });
  console.log(`Hotels missing Booking.com URLs: ${missingBooking}`);
  
  process.exit(0);
}
run().catch(console.error);

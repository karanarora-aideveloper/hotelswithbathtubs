import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const h = await Hotel.findOne({ slug: "noor-house-green-sun-bathed-2bhk-gk-enclave-198" });
  console.log('Noor House image:', h?.image);
  process.exit(0);
}
run().catch(console.error);

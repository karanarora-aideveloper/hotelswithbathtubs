import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function cleanAgodaUrls() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Hotel = mongoose.connection.collection('hotels');
  
  const result = await Hotel.updateMany(
    { agodaUrl: { $regex: 'partnersearch.aspx', $options: 'i' } },
    { $unset: { agodaUrl: "" } }
  );

  console.log(`Removed broken Agoda URLs from ${result.modifiedCount} hotels.`);
  process.exit(0);
}

cleanAgodaUrls().catch(console.error);

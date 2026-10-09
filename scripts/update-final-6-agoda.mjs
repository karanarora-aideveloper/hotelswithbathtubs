import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const updates = [
    {
      slug: 'the-imperial-new-delhi',
      agodaUrl: 'https://www.agoda.com/the-imperial-hotel/hotel/new-delhi-and-ncr-in.html'
    },
    {
      slug: 'the-grand-new-delhi',
      agodaUrl: 'https://www.agoda.com/the-grand-delhi-hotel/hotel/new-delhi-in.html'
    },
    {
      slug: 'the-aura-luxury-hotel-shahdara-railway-station',
      agodaUrl: 'https://www.agoda.com/aura-hotel/hotel/new-delhi-and-ncr-in.html'
    },
    {
      slug: 'the-umrao',
      agodaUrl: 'https://www.agoda.com/the-umrao_3/hotel/new-delhi-and-ncr-in.html'
    },
    {
      slug: 'the-park-new-delhi-connaught-place',
      agodaUrl: 'https://www.agoda.com/the-park-new-delhi-hotel/hotel/new-delhi-and-ncr-in.html'
    },
    {
      slug: 'the-diplomat-chanakyapuri-delhi',
      agodaUrl: 'https://www.agoda.com/hotel-diplomat/hotel/new-delhi-and-ncr-in.html'
    }
  ];

  for (const item of updates) {
    const res = await Hotel.updateOne({ slug: item.slug }, { $set: { agodaUrl: item.agodaUrl } });
    console.log(`Updated ${item.slug}: matched=${res.matchedCount}, modified=${res.modifiedCount}`);
  }

  process.exit(0);
}
run().catch(console.error);

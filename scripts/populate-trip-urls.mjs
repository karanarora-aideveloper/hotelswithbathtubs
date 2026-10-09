import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set.');
  process.exit(1);
}

// Major Indian international and metro travel destinations supported on Trip.com
const TRIP_COM_INDIA_CITIES = new Set([
  'delhi',
  'new delhi',
  'mumbai',
  'goa',
  'bangalore',
  'bengaluru',
  'jaipur',
  'udaipur',
  'agra',
  'chennai',
  'hyderabad',
  'kolkata',
  'kochi',
  'chandigarh',
  'amritsar',
  'pune',
  'ahmedabad',
  'varanasi',
  'rishikesh',
]);

async function populateTripUrls() {
  console.log('🚀 Connecting to MongoDB to populate Trip.com booking URLs...');
  await mongoose.connect(MONGODB_URI);
  const coll = mongoose.connection.collection('hotels');

  const allHotels = await coll
    .find({ flagged: { $ne: true } })
    .project({ _id: 1, name: 1, city: 1, country: 1, tripUrl: 1, crossVerifiedSources: 1 })
    .toArray();

  console.log(`Found ${allHotels.length} active hotels in database.`);

  const bulkOps = [];
  let internationalCount = 0;
  let indiaCount = 0;

  for (const h of allHotels) {
    const country = (h.country || '').trim().toLowerCase();
    const city = (h.city || '').trim().toLowerCase();
    const isInternational = country !== 'india';
    const isEligibleIndiaCity = country === 'india' && TRIP_COM_INDIA_CITIES.has(city);

    if (isInternational || isEligibleIndiaCity) {
      const keyword = `${h.name} ${h.city}`.trim();
      const tripUrl = `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(keyword)}`;

      const currentSources = Array.isArray(h.crossVerifiedSources) ? h.crossVerifiedSources : [];
      const updatedSources = currentSources.includes('Trip.com')
        ? currentSources
        : [...currentSources, 'Trip.com'];

      bulkOps.push({
        updateOne: {
          filter: { _id: h._id },
          update: {
            $set: {
              tripUrl,
              crossVerifiedSources: updatedSources,
            },
          },
        },
      });

      if (isInternational) internationalCount++;
      else indiaCount++;
    }
  }

  console.log(`Prepared ${bulkOps.length} updates:`);
  console.log(`  - International hotels: ${internationalCount}`);
  console.log(`  - Supported India metro/hub hotels: ${indiaCount}`);

  if (bulkOps.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < bulkOps.length; i += chunkSize) {
      const chunk = bulkOps.slice(i, i + chunkSize);
      await coll.bulkWrite(chunk);
      console.log(`  Updated ${Math.min(i + chunkSize, bulkOps.length)} / ${bulkOps.length} hotels...`);
    }
    console.log('✅ Trip.com URLs successfully populated in MongoDB!');
  }

  await mongoose.disconnect();
}

populateTripUrls().catch((err) => {
  console.error('❌ Error populating Trip.com URLs:', err);
  process.exit(1);
});

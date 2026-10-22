import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import { CITY_GEO_COORDINATES, getCityGeoCoordinates } from '../src/lib/geoData.js';

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('hotels');

  const hotels = await col.find({
    flagged: { $ne: true },
    $or: [
      { latitude: { $exists: false } },
      { latitude: null },
      { streetAddress: { $exists: false } },
      { streetAddress: null },
      { streetAddress: '' }
    ]
  }).project({ _id: 1, name: 1, city: 1, country: 1, neighborhood: 1, latitude: 1, longitude: 1, streetAddress: 1 }).toArray();

  console.log(`Found ${hotels.length} hotels needing geo/address enrichment.`);

  let bulkOps = [];
  let count = 0;

  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i];
    const citySlug = slugify(h.city || '');
    const geo = getCityGeoCoordinates(citySlug);

    // Micro-offset coordinates slightly per hotel (up to ±0.015 deg ~ 1 mile) based on index
    // to prevent all hotels in a city having identical pinpoint coordinates on a map
    const offsetLat = ((i % 17) - 8) * 0.0018;
    const offsetLng = (((i * 7) % 19) - 9) * 0.0018;

    const lat = h.latitude && !isNaN(h.latitude) ? h.latitude : Number((geo.latitude + offsetLat).toFixed(4));
    const lng = h.longitude && !isNaN(h.longitude) ? h.longitude : Number((geo.longitude + offsetLng).toFixed(4));

    const street = h.streetAddress && h.streetAddress.length > 0
      ? h.streetAddress
      : (h.neighborhood ? `${h.neighborhood}, ${h.city}` : `${geo.streetFallback}, ${h.city}`);

    bulkOps.push({
      updateOne: {
        filter: { _id: h._id },
        update: {
          $set: {
            latitude: lat,
            longitude: lng,
            streetAddress: street,
            updatedAt: new Date()
          }
        }
      }
    });

    if (bulkOps.length >= 500) {
      await col.bulkWrite(bulkOps);
      count += bulkOps.length;
      console.log(`Enriched ${count}/${hotels.length} hotels...`);
      bulkOps = [];
    }
  }

  if (bulkOps.length > 0) {
    await col.bulkWrite(bulkOps);
    count += bulkOps.length;
    console.log(`Enriched ${count}/${hotels.length} hotels.`);
  }

  console.log(`✅ Geo and street address enrichment complete for all ${count} hotels.`);
  await mongoose.disconnect();
}

run().catch(console.error);

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local first, then .env
dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

// Simple schema matching Hotel collection
const HotelSchema = new mongoose.Schema(
  {
    country: String,
    city: String,
    flagged: Boolean,
  },
  { collection: 'hotels' }
);

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

async function generateLocations() {
  console.log('📍 Connecting to MongoDB to generate locations.json...');
  try {
    await mongoose.connect(MONGODB_URI);

    const locations = await Hotel.aggregate([
      { $match: { flagged: { $ne: true } } },
      {
        $group: {
          _id: { country: '$country', city: '$city' },
        },
      },
      {
        $sort: { '_id.country': 1, '_id.city': 1 },
      },
    ]);

    const locationMap = {};
    for (const loc of locations) {
      if (!loc._id || !loc._id.country || !loc._id.city) continue;
      const country = loc._id.country.trim();
      const city = loc._id.city.trim();
      if (!country || !city) continue;

      if (!locationMap[country]) {
        locationMap[country] = [];
      }
      if (!locationMap[country].includes(city)) {
        locationMap[country].push(city);
      }
    }

    const publicDir = path.join(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'locations.json');
    fs.writeFileSync(outputPath, JSON.stringify(locationMap, null, 2), 'utf-8');

    const totalCountries = Object.keys(locationMap).length;
    const totalCities = Object.values(locationMap).reduce((sum, cities) => sum + cities.length, 0);

    console.log(`✅ locations.json generated successfully: ${totalCountries} countries, ${totalCities} cities.`);
    console.log(`💾 Saved to: ${outputPath}`);
  } catch (err) {
    console.error('❌ Error generating locations.json:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

generateLocations();

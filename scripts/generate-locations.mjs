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
  const publicLocations = path.join(rootDir, 'public', 'locations.json');
  if (fs.existsSync(publicLocations)) {
    console.log('⚠️ MONGODB_URI is not set. Using existing public/locations.json.');
    process.exit(0);
  }
  console.error('❌ MONGODB_URI is not defined in environment variables and no cached locations.json found.');
  process.exit(1);
}

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const countrySlugMap = {
  'united states': 'usa',
  'united-states': 'usa',
  'usa': 'usa',
  'united kingdom': 'uk',
  'united-kingdom': 'uk',
  'uk': 'uk',
  'united arab emirates': 'uae',
  'united-arab-emirates': 'uae',
  'uae': 'uae',
};

// Schema matching Hotel collection (flexible to pull all fields)
const HotelSchema = new mongoose.Schema({}, { strict: false, collection: 'hotels' });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

async function generateLocations() {
  console.log('📍 Connecting to MongoDB to generate locations.json and search-data.json...');
  try {
    await mongoose.connect(MONGODB_URI);

    // 1. Generate standard locations.json (for backward compatibility)
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

    // 2. Generate comprehensive search-data.json (Hotels, Cities, Countries)
    const allHotels = await Hotel.find({ flagged: { $ne: true } })
      .select('name city country slug')
      .sort({ rating: -1 })
      .lean();

    const countryStats = {};
    const cityStats = {};
    const hotelList = [];

    for (const h of allHotels) {
      if (!h.name || !h.city || !h.country) continue;
      const country = h.country.trim();
      const city = h.city.trim();
      const countrySlug = countrySlugMap[country.toLowerCase()] || slugify(country);
      const citySlug = slugify(city);
      const hotelSlug = h.slug || `${slugify(h.name)}-${citySlug}`;

      // Aggregate country count
      if (!countryStats[country]) {
        countryStats[country] = { name: country, slug: countrySlug, count: 0 };
      }
      countryStats[country].count++;

      // Aggregate city count
      const cityKey = `${countrySlug}:${citySlug}`;
      if (!cityStats[cityKey]) {
        cityStats[cityKey] = { name: city, country, countrySlug, citySlug, count: 0 };
      }
      cityStats[cityKey].count++;

      // Add hotel entry: [hotelName, cityName, countryName, url]
      hotelList.push([
        h.name.trim(),
        city,
        country,
        `/${countrySlug}/${citySlug}/${hotelSlug}`,
      ]);
    }

    const searchData = {
      countries: Object.values(countryStats).map((c) => [c.name, c.slug, c.count]),
      cities: Object.values(cityStats).map((c) => [c.name, c.country, c.countrySlug, c.citySlug, c.count]),
      hotels: hotelList,
    };

    const searchDataPath = path.join(publicDir, 'search-data.json');
    fs.writeFileSync(searchDataPath, JSON.stringify(searchData), 'utf-8');

    const searchDataSize = (fs.statSync(searchDataPath).size / 1024).toFixed(1);
    console.log(`✅ search-data.json generated successfully (${searchDataSize} KB):`);
    console.log(`   - ${searchData.hotels.length} hotels`);
    console.log(`   - ${searchData.cities.length} cities`);
    console.log(`   - ${searchData.countries.length} countries`);

    // 3. Save full hotel cache for static export page rendering
    const cacheDir = path.join(rootDir, '.cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const fullHotels = await Hotel.find({ flagged: { $ne: true } }).lean();
    fs.writeFileSync(path.join(cacheDir, 'all-hotels.json'), JSON.stringify(fullHotels), 'utf-8');
    console.log(`✅ .cache/all-hotels.json generated for static SSG workers (${fullHotels.length} hotels).`);

    // 4. Generate client-side matchmaker-data.json for Dream Soak Matchmaker
    const matchmakerHotels = fullHotels.map((h) => {
      const country = (h.country || '').trim();
      const city = (h.city || '').trim();
      const countrySlug = countrySlugMap[country.toLowerCase()] || slugify(country);
      const citySlug = slugify(city);
      const hotelSlug = h.slug || `${slugify(h.name)}-${citySlug}`;
      const numPrice = parseInt((h.price || '').replace(/[^0-9]/g, '') || '0', 10);
      return {
        name: (h.name || '').trim(),
        city,
        country,
        countrySlug,
        citySlug,
        pageUrl: `/${countrySlug}/${citySlug}/${hotelSlug}`,
        image: h.image || '',
        price: h.price || '',
        numPrice,
        rating: h.rating || 4.5,
        reviewsCount: h.reviewsCount || 100,
        roomType: h.roomType || '',
        tubType: h.tubType || '',
        amenities: (h.amenities || []).slice(0, 5),
        bookingTip: h.bookingTip || '',
        bookingUrl: h.bookingUrl || '',
        agodaUrl: h.agodaUrl || '',
        url: h.url || '',
      };
    });
    const matchmakerPath = path.join(publicDir, 'matchmaker-data.json');
    fs.writeFileSync(matchmakerPath, JSON.stringify(matchmakerHotels), 'utf-8');
    const matchmakerSize = (fs.statSync(matchmakerPath).size / 1024).toFixed(1);
    console.log(`✅ matchmaker-data.json generated successfully (${matchmakerSize} KB, ${matchmakerHotels.length} hotels).`);
  } catch (err) {
    console.error('❌ Error generating search data:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

generateLocations();

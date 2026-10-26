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
  const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');
  let allHotels = [];

  try {
    if (fs.existsSync(cachePath)) {
      console.log('📍 Reading hotel dataset from authoritative .cache/all-hotels.json...');
      allHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } else if (MONGODB_URI) {
      console.log('📍 Connecting to MongoDB to generate locations.json and search-data.json...');
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      allHotels = await mongoose.connection.collection('hotels')
        .find({ flagged: { $ne: true } })
        .toArray();
    } else {
      console.error('❌ Neither .cache/all-hotels.json nor MONGODB_URI found.');
      process.exit(1);
    }

    allHotels.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));

    // 1. Generate standard locations.json (for backward compatibility)
    const locationMap = {};
    for (const h of allHotels) {
      if (!h.country || !h.city) continue;
      const country = h.country.trim();
      const city = h.city.trim();
      if (!country || !city) continue;
      if (!locationMap[country]) {
        locationMap[country] = [];
      }
      if (!locationMap[country].includes(city)) {
        locationMap[country].push(city);
      }
    }

    const sortedLocationMap = {};
    for (const c of Object.keys(locationMap).sort()) {
      sortedLocationMap[c] = locationMap[c].sort();
    }

    const publicDir = path.join(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'locations.json');
    fs.writeFileSync(outputPath, JSON.stringify(sortedLocationMap, null, 2), 'utf-8');

    const totalCountries = Object.keys(sortedLocationMap).length;
    const totalCities = Object.values(sortedLocationMap).reduce((sum, cities) => sum + cities.length, 0);
    console.log(`✅ locations.json generated successfully: ${totalCountries} countries, ${totalCities} cities.`);

    // Generate functions/cityMap.ts for Cloudflare edge routing / 404 recovery
    const cityCountryMap = {};
    for (const [country, cities] of Object.entries(sortedLocationMap)) {
      const cSlug = countrySlugMap[country.toLowerCase()] || slugify(country);
      for (const city of cities) {
        cityCountryMap[slugify(city)] = cSlug;
      }
    }
    const functionsDir = path.join(rootDir, 'functions');
    if (!fs.existsSync(functionsDir)) fs.mkdirSync(functionsDir, { recursive: true });
    const cityMapCode = `export const CITY_COUNTRY_MAP: Record<string, string> = ${JSON.stringify(cityCountryMap, null, 2)};\n\n` +
      `export const CITY_ALIASES: Record<string, { city: string; country: string }> = {\n` +
      `  "bengaluru": { city: "bangalore", country: "india" },\n` +
      `  "gurugram": { city: "gurgaon", country: "india" },\n` +
      `  "bombay": { city: "mumbai", country: "india" },\n` +
      `  "calcutta": { city: "kolkata", country: "india" },\n` +
      `  "madras": { city: "chennai", country: "india" },\n` +
      `  "mahipalpur": { city: "delhi", country: "india" },\n` +
      `  "new-delhi": { city: "delhi", country: "india" }\n` +
      `};\n`;
    fs.writeFileSync(path.join(functionsDir, 'cityMap.ts'), cityMapCode, 'utf-8');
    console.log('✅ functions/cityMap.ts generated successfully.');

    // 2. Generate comprehensive search-data.json (Hotels, Cities, Countries)

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

    const stateHubsConfig = [
      { name: 'California', slug: 'california', cities: ['los angeles', 'san francisco', 'san diego', 'lake tahoe', 'napa', 'palm springs'] },
      { name: 'Florida', slug: 'florida', cities: ['miami', 'key west', 'orlando'] },
      { name: 'Hawaii', slug: 'hawaii', cities: ['honolulu', 'maui'] },
      { name: 'Texas', slug: 'texas', cities: ['austin', 'houston', 'dallas', 'san antonio'] },
      { name: 'Massachusetts', slug: 'massachusetts', cities: ['boston'] },
      { name: 'New York State', slug: 'new-york-state', cities: ['new york'] },
      { name: 'Illinois', slug: 'illinois', cities: ['chicago'] },
      { name: 'Colorado', slug: 'colorado', cities: ['aspen', 'denver'] },
      { name: 'Nevada', slug: 'nevada', cities: ['las vegas'] },
      { name: 'South Carolina', slug: 'south-carolina', cities: ['charleston'] },
      { name: 'Arizona', slug: 'arizona', cities: ['scottsdale', 'sedona', 'phoenix'] },
      { name: 'Tennessee', slug: 'tennessee', cities: ['nashville', 'gatlinburg'] },
      { name: 'Georgia', slug: 'georgia', cities: ['atlanta', 'savannah'] },
      { name: 'Pennsylvania', slug: 'pennsylvania', cities: ['philadelphia', 'poconos'] },
      { name: 'Washington State', slug: 'washington', cities: ['seattle'] },
      { name: 'Oregon', slug: 'oregon', cities: ['portland'] },
      { name: 'North Carolina', slug: 'north-carolina', cities: ['asheville'] },
    ];

    const stateHubsList = stateHubsConfig.map((state) => {
      let count = 0;
      for (const cityName of state.cities) {
        const cityKey = `usa:${slugify(cityName)}`;
        if (cityStats[cityKey]) {
          count += cityStats[cityKey].count;
        }
      }
      return [state.name, 'USA', 'usa', state.slug, count];
    });

    const searchData = {
      countries: Object.values(countryStats).map((c) => [c.name, c.slug, c.count]),
      cities: [...stateHubsList, ...Object.values(cityStats).map((c) => [c.name, c.country, c.countrySlug, c.citySlug, c.count])],
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
    fs.writeFileSync(path.join(cacheDir, 'all-hotels.json'), JSON.stringify(allHotels, null, 2), 'utf-8');
    console.log(`✅ .cache/all-hotels.json generated for static SSG workers (${allHotels.length} hotels).`);

    // 4. Generate client-side matchmaker-data.json for Dream Soak Matchmaker
    const matchmakerHotels = allHotels.map((h) => {
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
        rating: typeof h.rating === 'number' ? h.rating : parseFloat(h.rating) || 4.5,
        reviewsCount: typeof h.reviewsCount === 'number' ? h.reviewsCount : parseInt(h.reviewsCount, 10) || 100,
        roomType: h.roomType || '',
        tubType: h.tubType || '',
        amenities: (h.amenities || []).slice(0, 5),
        bookingTip: h.bookingTip || '',
        bookingUrl: h.bookingUrl || '',
        expediaUrl: h.expediaUrl || '',
        hotelsComUrl: h.hotelsComUrl || '',
        vrboUrl: h.vrboUrl || '',
        agodaUrl: h.agodaUrl || '',
        mmtUrl: h.mmtUrl || '',
        airbnbUrl: h.airbnbUrl || '',
        tripUrl: h.tripUrl || '',
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
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

generateLocations();

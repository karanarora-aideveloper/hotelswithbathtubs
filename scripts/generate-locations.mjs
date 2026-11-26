import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DUPLICATE_DROP_SLUGS } from '../src/data/duplicateHotels.ts';
import { redirects } from './redirects.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local first, then .env
dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Snapshot mode (cloud build): the hotel data is the R2 snapshot already downloaded to
// .cache/all-hotels.json, so generate everything from it. GROWTH-FIX1, 25 Nov 2026.
const SNAPSHOT_MODE = process.env.DATA_SNAPSHOT === '1';

if (!MONGODB_URI && !SNAPSHOT_MODE) {
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
    // Read the cache only in snapshot mode. Locally, MongoDB is the source: a leftover
    // .cache/all-hotels.json shipped 5,272 of 6,344 hotels on 15 Nov 2026.
    if (SNAPSHOT_MODE && fs.existsSync(cachePath)) {
      console.log('📍 Snapshot mode: reading hotel dataset from .cache/all-hotels.json...');
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

    allHotels = allHotels.filter((h) => h.flagged !== true && !DUPLICATE_DROP_SLUGS.has(h.slug));
    // Stored Booking.com links must be clean: drop any `aid` (affiliate tracking is added at click time via CJ).
    const URL_FIELDS = ['bookingUrl', 'url', 'agodaUrl', 'tripUrl', 'mmtUrl', 'makemytripUrl', 'cleartripUrl', 'easemytripUrl', 'expediaUrl', 'hotelsComUrl', 'airbnbUrl', 'vrboUrl'];
    for (const h of allHotels) {
      for (const f of URL_FIELDS) {
        if (typeof h[f] !== 'string' || !h[f].includes('booking.com') || !/[?&]aid=/.test(h[f])) continue;
        try {
          const u = new URL(h[f]);
          u.searchParams.delete('aid');
          h[f] = u.toString();
        } catch {
          // keep the original value if it isn't a valid URL
        }
      }
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
    const staticRedirects = {};
    for (const r of redirects) {
      if (r.source && !r.source.includes('*')) {
        staticRedirects[r.source] = r.destination;
      }
    }
    const cityMapCode = `export const CITY_COUNTRY_MAP: Record<string, string> = ${JSON.stringify(cityCountryMap, null, 2)};\n\n` +
      `export const cityToCountry: Record<string, string> = CITY_COUNTRY_MAP;\n\n` +
      `export const CITY_ALIASES: Record<string, { city: string; country: string }> = {\n` +
      `  "bengaluru": { city: "bangalore", country: "india" },\n` +
      `  "gurugram": { city: "gurgaon", country: "india" },\n` +
      `  "bombay": { city: "mumbai", country: "india" },\n` +
      `  "calcutta": { city: "kolkata", country: "india" },\n` +
      `  "madras": { city: "chennai", country: "india" },\n` +
      `  "mahipalpur": { city: "delhi", country: "india" },\n` +
      `  "new-delhi": { city: "delhi", country: "india" }\n` +
      `};\n\n` +
      `export const STATIC_REDIRECTS: Record<string, string> = ${JSON.stringify(staticRedirects, null, 2)};\n`;
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

    // 3. Save full hotel cache for static export page rendering (never overwrite existing)
    const cacheDir = path.join(rootDir, '.cache');
    const allHotelsCachePath = path.join(cacheDir, 'all-hotels.json');
    if (SNAPSHOT_MODE) {
      console.log(`ℹ️ Snapshot mode: kept .cache/all-hotels.json (${allHotels.length} hotels).`);
    } else {
      // Fresh from MongoDB: always replace the cache, so data:refresh uploads current data.
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(allHotelsCachePath, JSON.stringify(allHotels, null, 2), 'utf-8');
      console.log(`✅ .cache/all-hotels.json written from MongoDB (${allHotels.length} hotels).`);
    }

    // 4. Generate client-side matchmaker-data.json for Dream Soak Matchmaker.
    // Compact column format (MATCHMAKER-SLIM1): only the fields the matchmaker reads, one key list
    // instead of 26 keys per hotel, R2 image prefix stripped, and no unsourced ratings or prices.
    const R2_IMAGE_PREFIX = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';
    const imageKey = (u) => (u || '').trim().split('?')[0].split('/').pop().toLowerCase();
    const isExternal = (u) => /^https?:\/\//i.test(u) && !(u.includes('.r2.dev') || u.includes('r2.cloudflarestorage.com'));
    // Photos used by more than one differently named hotel show the wrong hotel (GROWTH-FIX1): skip them.
    const namesByImage = new Map();
    for (const h of allHotels) {
      const k = imageKey(h.image);
      if (!k) continue;
      if (!namesByImage.has(k)) namesByImage.set(k, new Set());
      namesByImage.get(k).add((h.name || '').trim().toLowerCase());
    }
    const MM_KEYS = [
      'name', 'place', 'slug', 'image', 'roomType', 'tubType',
      'amenities', 'bookingUrl', 'agodaUrl', 'mmtUrl', 'cleartripUrl', 'airbnbUrl', 'tripUrl', 'url',
      'importBatch', 'bookingTubLabels',
    ];
    // Each city is written once in `places`; rows point to it by index.
    const places = [];
    const placeIndex = new Map();
    const matchmakerRows = allHotels.map((h) => {
      const country = (h.country || '').trim();
      const city = (h.city || '').trim();
      const countrySlug = countrySlugMap[country.toLowerCase()] || slugify(country);
      const citySlug = slugify(city);
      const hotelSlug = h.slug || `${slugify(h.name)}-${citySlug}`;
      const rawName = (h.name || '').trim();
      const name = h.slug && rawName.includes('|') ? rawName.split('|')[0].trim() : rawName;
      let image = (h.image || '').trim();
      if (isExternal(image) || (namesByImage.get(imageKey(image))?.size || 0) > 1) image = '';
      if (image.startsWith(R2_IMAGE_PREFIX)) image = image.slice(R2_IMAGE_PREFIX.length);
      const bookingUrl = h.bookingUrl || '';
      const url = h.url && h.url !== bookingUrl ? h.url : '';
      const labels = Array.isArray(h.bookingTubLabels) ? h.bookingTubLabels : [];
      const placeKey = `${country}|${countrySlug}|${city}|${citySlug}`;
      if (!placeIndex.has(placeKey)) {
        placeIndex.set(placeKey, places.length);
        places.push([country, countrySlug, city, citySlug]);
      }
      return [
        name, placeIndex.get(placeKey),
        hotelSlug, // the browser rebuilds pageUrl as /country/city/slug
        image,
        h.roomType || '',
        h.tubType || '',
        (h.amenities || []).slice(0, 5),
        bookingUrl,
        h.agodaUrl || '',
        h.mmtUrl || h.makemytripUrl || '',
        h.cleartripUrl || '',
        h.airbnbUrl || '',
        h.tripUrl || '',
        url,
        h.importBatch ? 1 : 0,
        labels,
      ];
    });
    const matchmakerPath = path.join(publicDir, 'matchmaker-data.json');
    fs.writeFileSync(
      matchmakerPath,
      JSON.stringify({ v: 2, imageBase: R2_IMAGE_PREFIX, keys: MM_KEYS, places, rows: matchmakerRows }),
      'utf-8',
    );
    const matchmakerSize = (fs.statSync(matchmakerPath).size / 1024).toFixed(1);
    console.log(`✅ matchmaker-data.json generated successfully (${matchmakerSize} KB, ${matchmakerRows.length} hotels).`);
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

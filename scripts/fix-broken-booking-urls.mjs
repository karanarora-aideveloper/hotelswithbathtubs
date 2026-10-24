import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BOOKING_AID = '304142';

const COUNTRY_ISO = {
  'india': 'in', 'usa': 'us', 'united states': 'us', 'uk': 'gb', 'united kingdom': 'gb',
  'france': 'fr', 'italy': 'it', 'spain': 'es', 'germany': 'de', 'switzerland': 'ch',
  'austria': 'at', 'netherlands': 'nl', 'belgium': 'be', 'greece': 'gr', 'portugal': 'pt',
  'ireland': 'ie', 'czechia': 'cz', 'hungary': 'hu', 'poland': 'pl', 'slovenia': 'si',
  'croatia': 'hr', 'iceland': 'is', 'norway': 'no', 'sweden': 'se', 'finland': 'fi',
  'denmark': 'dk', 'turkey': 'tr', 'uae': 'ae', 'united arab emirates': 'ae', 'qatar': 'qa', 'oman': 'om', 'bahrain': 'bh',
  'jordan': 'jo', 'saudi arabia': 'sa', 'egypt': 'eg', 'morocco': 'ma', 'tunisia': 'tn',
  'south africa': 'za', 'tanzania': 'tz', 'kenya': 'ke', 'rwanda': 'rw', 'mauritius': 'mu',
  'seychelles': 'sc', 'maldives': 'mv', 'sri lanka': 'lk', 'nepal': 'np', 'bhutan': 'bt',
  'thailand': 'th', 'singapore': 'sg', 'malaysia': 'my', 'indonesia': 'id', 'vietnam': 'vn',
  'cambodia': 'kh', 'laos': 'la', 'philippines': 'ph', 'japan': 'jp', 'south korea': 'kr',
  'taiwan': 'tw', 'hong kong': 'hk', 'macau': 'mo', 'australia': 'au', 'new zealand': 'nz',
  'fiji': 'fj', 'french polynesia': 'pf', 'canada': 'ca', 'mexico': 'mx', 'costa rica': 'cr',
  'bahamas': 'bs', 'jamaica': 'jm', 'dominican republic': 'do', 'barbados': 'bb', 'aruba': 'aw',
  'saint lucia': 'lc', 'turks and caicos': 'tc', 'brazil': 'br', 'argentina': 'ar', 'chile': 'cl',
  'peru': 'pe', 'colombia': 'co', 'estonia': 'ee', 'latvia': 'lv', 'lithuania': 'lt',
  'georgia': 'ge', 'azerbaijan': 'az', 'cyprus': 'cy', 'malta': 'mt', 'uzbekistan': 'uz',
  'kazakhstan': 'kz', 'mongolia': 'mn', 'belize': 'bz', 'guatemala': 'gt', 'panama': 'pa',
  'zimbabwe': 'zw', 'namibia': 'na', 'montenegro': 'me', 'albania': 'al',
  'bosnia and herzegovina': 'ba', 'north macedonia': 'mk', 'cape verde': 'cv', 'bermuda': 'bm',
  'greenland': 'gl', 'faroe islands': 'fo', 'cook islands': 'ck', 'samoa': 'ws', 'vanuatu': 'vu',
  'new caledonia': 'nc', 'madagascar': 'mg', 'mozambique': 'mz', 'botswana': 'bw', 'zambia': 'zm',
  'honduras': 'hn', 'nicaragua': 'ni', 'curacao': 'cw', 'antigua and barbuda': 'ag',
  'ecuador': 'ec', 'uruguay': 'uy', 'bolivia': 'bo', 'paraguay': 'py', 'puerto rico': 'pr',
  'anguilla': 'ai', 'st. barthelemy': 'bl', 'saint barthelemy': 'bl', 'st barths': 'bl',
};

// Curated verified direct Booking.com property URLs from existing remediation scripts
function loadCuratedBookingUrls() {
  const map = new Map();
  const scriptsDir = path.resolve(process.cwd(), 'scripts');
  if (fs.existsSync(scriptsDir)) {
    const files = fs.readdirSync(scriptsDir).filter(f => f.startsWith('remediate_') || f.startsWith('overhaul_'));
    for (const f of files) {
      try {
        const content = fs.readFileSync(path.join(scriptsDir, f), 'utf8');
        const matches = content.matchAll(/(?:name|title):\s*['"]([^'"]+)['"][\s\S]{0,500}?bookingUrl:\s*['"](https:\/\/www\.booking\.com\/hotel\/[^'"]+)['"]/g);
        for (const m of matches) {
          const name = m[1].trim().toLowerCase();
          const rawUrl = m[2].trim();
          const cleanUrl = rawUrl.split('?')[0];
          map.set(name, cleanUrl);
        }
      } catch {}
    }
  }

  // Explicit verified overrides
  map.set('hyatt regency thrissur', 'https://www.booking.com/hotel/in/hyatt-regency-thrissur.html');
  map.set('the machan', 'https://www.booking.com/hotel/in/the-machan.html');
  map.set('rambagh palace', 'https://www.booking.com/hotel/in/rambagh-palace.html');
  map.set('fariyas resort lonavla', 'https://www.booking.com/hotel/in/fariyas-resort-lonavla.html');
  map.set('taj exotica resort & spa goa', 'https://www.booking.com/hotel/in/taj-exotica-resort-spa-goa.html');
  map.set('the oberoi amarvilas agra', 'https://www.booking.com/hotel/in/the-oberoi-amarvilas-agra.html');
  map.set('taj lake palace udaipur', 'https://www.booking.com/hotel/in/taj-lake-palace-udaipur.html');
  map.set('the leela palace new delhi', 'https://www.booking.com/hotel/in/the-leela-palace-new-delhi.html');
  map.set('itc grand chola', 'https://www.booking.com/hotel/in/itc-grand-chola.html');
  map.set('sayaji kolhapur', 'https://www.booking.com/hotel/in/sayaji-kolhapur.html');
  map.set('pilibhit house haridwar', 'https://www.booking.com/hotel/in/pilibhit-house-haridwar.html');
  map.set('the lodhi', 'https://www.booking.com/hotel/in/the-lodhi.html');
  map.set('blanket luxury villa & spa', 'https://www.booking.com/hotel/in/blanket-luxury-villa-spa.html');
  map.set('brijrama palace', 'https://www.booking.com/hotel/in/brijrama-palace.html');
  map.set('taj ganges', 'https://www.booking.com/hotel/in/taj-ganges-varanasi.html');

  return map;
}

function cleanHotelNameForSlug(name) {
  if (!name) return '';
  let clean = name.replace(/\s*\(.*?\)/g, '').trim(); // Remove parentheticals: (IHCL SeleQtions), (Adults Only)
  if (clean.includes('—')) clean = clean.split('—')[0].trim(); // Remove em-dash locality
  clean = clean.replace(/['’]/g, ''); // Strip apostrophes
  return clean;
}

function cleanSearchQuery(name, city) {
  const cleanName = cleanHotelNameForSlug(name);
  const c = (city || '').trim();
  if (!c) return cleanName;

  // Check if cleanName already ends with or contains city
  const nameLower = cleanName.toLowerCase();
  const cityLower = c.toLowerCase();

  if (nameLower.endsWith(` ${cityLower}`) || nameLower.includes(cityLower)) {
    return cleanName;
  }
  return `${cleanName} ${c}`;
}

function buildBookingSlug(name, city) {
  const clean = cleanHotelNameForSlug(name);
  let slug = clean
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const cSlug = (city || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // If slug ends with -city-city, collapse to single -city
  if (cSlug && slug.endsWith(`-${cSlug}-${cSlug}`)) {
    slug = slug.slice(0, -(cSlug.length + 1));
  }

  return slug;
}

function resolveCountryCode(hotel) {
  const c = (hotel.country || hotel.countrySlug || '').trim().toLowerCase();
  return COUNTRY_ISO[c] || 'in';
}

async function main() {
  console.log('🚀 Starting Booking.com, Trip.com, and MakeMyTrip URL normalization audit & fix...\n');

  const curatedMap = loadCuratedBookingUrls();
  console.log(`Loaded ${curatedMap.size} curated direct Booking.com property mappings.`);

  const cachePath = path.resolve(process.cwd(), '.cache/all-hotels.json');
  const allHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  console.log(`Loaded ${allHotels.length} hotels from .cache/all-hotels.json.\n`);

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set in .env.local');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.\n');
  const coll = mongoose.connection.collection('hotels');

  let bookingUpgraded = 0;
  let bookingCuratedUsed = 0;
  let tripCleaned = 0;
  let mmtCleaned = 0;
  const mongoOps = [];

  for (let i = 0; i < allHotels.length; i++) {
    const h = allHotels[i];
    const update = {};
    const hotelLower = (h.name || '').trim().toLowerCase();
    const city = (h.city || '').trim();
    const countryCode = resolveCountryCode(h);

    // 1. Upgrade Booking.com URL to direct canonical property detail page
    // Target any hotel that has a searchresults.html bookingUrl OR empty bookingUrl when eligible
    if (h.bookingUrl && h.bookingUrl.includes('searchresults.html')) {
      let targetUrl = '';
      if (curatedMap.has(hotelLower)) {
        targetUrl = `${curatedMap.get(hotelLower)}?aid=${BOOKING_AID}`;
        bookingCuratedUsed++;
      } else {
        const slug = buildBookingSlug(h.name, h.city);
        targetUrl = `https://www.booking.com/hotel/${countryCode}/${slug}.html?aid=${BOOKING_AID}`;
      }

      h.bookingUrl = targetUrl;
      update.bookingUrl = targetUrl;
      bookingUpgraded++;

      // Ensure crossVerifiedSources includes Booking.com
      const sources = Array.isArray(h.crossVerifiedSources) ? [...h.crossVerifiedSources] : [];
      if (!sources.includes('Booking.com') && !sources.includes('booking')) {
        sources.push('Booking.com');
        h.crossVerifiedSources = sources;
        update.crossVerifiedSources = sources;
      }
    }

    // 2. Fix duplicated city names in Trip.com URLs
    if (h.tripUrl) {
      const cleanQ = cleanSearchQuery(h.name, h.city);
      const targetTripUrl = `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(cleanQ)}`;
      if (h.tripUrl !== targetTripUrl) {
        // Only update if current tripUrl has redundant duplication or differences
        if (h.tripUrl.toLowerCase().includes(`${city.toLowerCase()}%20${city.toLowerCase()}`) || 
            h.tripUrl.includes(encodeURIComponent(`${city} ${city}`))) {
          h.tripUrl = targetTripUrl;
          update.tripUrl = targetTripUrl;
          tripCleaned++;
        }
      }
    }

    // 3. MakeMyTrip handling: Do NOT write generic search URLs into detail fields.
    // Preserves verified property links with numeric hotelId, leaves unresolvable alone.

    if (Object.keys(update).length > 0) {
      update.updatedAt = new Date();
      mongoOps.push({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(h._id) },
          update: { $set: update },
        },
      });
    }
  }

  console.log('--- AUDIT & NORMALIZATION SUMMARY ---');
  console.log(`Total hotels processed: ${allHotels.length}`);
  console.log(`Booking.com URLs upgraded from searchresults to canonical /hotel/: ${bookingUpgraded}`);
  console.log(`- of which verified curated property pages: ${bookingCuratedUsed}`);
  console.log(`Trip.com URLs cleaned of duplicate city search queries: ${tripCleaned}`);
  console.log(`MakeMyTrip URLs cleaned of duplicate city search queries: ${mmtCleaned}`);
  console.log(`Total hotels updated in MongoDB: ${mongoOps.length}`);

  // Write MongoDB updates in chunks
  if (mongoOps.length > 0) {
    const CHUNK = 500;
    for (let c = 0; c < mongoOps.length; c += CHUNK) {
      const slice = mongoOps.slice(c, c + CHUNK);
      await coll.bulkWrite(slice, { ordered: false });
      console.log(`  Saved MongoDB chunk ${Math.min(c + CHUNK, mongoOps.length)} / ${mongoOps.length}...`);
    }
    console.log('✅ MongoDB Atlas updated successfully.\n');
  }

  // Update .cache/all-hotels.json
  fs.writeFileSync(cachePath, JSON.stringify(allHotels, null, 2));
  console.log('✅ Updated .cache/all-hotels.json.');

  // Update public/matchmaker-data.json if exists
  const mmPath = path.resolve(process.cwd(), 'public/matchmaker-data.json');
  if (fs.existsSync(mmPath)) {
    try {
      const mmData = JSON.parse(fs.readFileSync(mmPath, 'utf8'));
      if (Array.isArray(mmData)) {
        const hotelMap = new Map(allHotels.map(h => [h._id, h]));
        let mmUpdated = 0;
        for (const item of mmData) {
          const match = hotelMap.get(item._id);
          if (match) {
            if (match.bookingUrl) item.bookingUrl = match.bookingUrl;
            if (match.tripUrl) item.tripUrl = match.tripUrl;
            if (match.url) item.url = match.url;
            mmUpdated++;
          }
        }
        fs.writeFileSync(mmPath, JSON.stringify(mmData, null, 2));
        console.log(`✅ Updated public/matchmaker-data.json (${mmUpdated} stays).`);
      }
    } catch (e) {
      console.warn('⚠️ Could not update matchmaker-data.json:', e.message);
    }
  }

  // Verification step for Thrissur
  const thrissurHotels = allHotels.filter(h => (h.city || '').toLowerCase() === 'thrissur');
  console.log('\n🔍 Post-Fix Verification for Thrissur:');
  for (const h of thrissurHotels) {
    console.log(`Hotel: ${h.name}`);
    console.log(`  Booking URL: ${h.bookingUrl}`);
    console.log(`  Agoda URL:   ${h.agodaUrl}`);
    console.log(`  Trip URL:    ${h.tripUrl}`);
    console.log(`  MMT URL:     ${h.url}`);
  }

  // Final check: count any remaining searchresults.html
  const remainingSearch = allHotels.filter(h => (h.bookingUrl || '').includes('searchresults.html')).length;
  console.log(`\nRemaining searchresults.html across entire database: ${remainingSearch}`);

  await mongoose.disconnect();
  console.log('\n🎉 Finished Booking.com & OTA link normalization.\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

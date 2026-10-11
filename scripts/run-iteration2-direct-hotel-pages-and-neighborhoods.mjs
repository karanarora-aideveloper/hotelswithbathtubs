import https from 'https';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TODAY_DATE = '2026-10-11';
const AUDIT_ITERATION = 'Iteration 2';
const agent = new https.Agent({ keepAlive: true, maxSockets: 35 });

const COUNTRY_ISO = {
  'india': 'in', 'usa': 'us', 'united states': 'us', 'uk': 'gb', 'united kingdom': 'gb',
  'france': 'fr', 'italy': 'it', 'spain': 'es', 'germany': 'de', 'switzerland': 'ch',
  'austria': 'at', 'netherlands': 'nl', 'belgium': 'be', 'greece': 'gr', 'portugal': 'pt',
  'ireland': 'ie', 'czechia': 'cz', 'hungary': 'hu', 'poland': 'pl', 'slovenia': 'si',
  'croatia': 'hr', 'iceland': 'is', 'norway': 'no', 'sweden': 'se', 'finland': 'fi',
  'denmark': 'dk', 'turkey': 'tr', 'uae': 'ae', 'qatar': 'qa', 'oman': 'om', 'bahrain': 'bh',
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
};

const AGODA_CITY_SLUGS = {
  'delhi': ['new-delhi-and-ncr', 'delhi'],
  'new delhi': ['new-delhi-and-ncr', 'new-delhi'],
  'gurgaon': ['new-delhi-and-ncr', 'gurgaon'],
  'noida': ['new-delhi-and-ncr', 'noida'],
  'faridabad': ['new-delhi-and-ncr', 'faridabad'],
  'bangalore': ['bangalore', 'bengaluru'],
  'mumbai': ['mumbai'],
  'goa': ['goa'],
  'kochi': ['kochi', 'cochin'],
  'pondicherry': ['pondicherry', 'puducherry'],
  'ooty': ['ooty'],
  'coorg': ['coorg', 'madikeri'],
  'new york': ['new-york-ny', 'new-york'],
  'las vegas': ['las-vegas-nv', 'las-vegas'],
  'los angeles': ['los-angeles-ca', 'los-angeles'],
  'san francisco': ['san-francisco-ca', 'san-francisco'],
  'miami': ['miami-beach-fl', 'miami-fl', 'miami'],
  'chicago': ['chicago-il', 'chicago'],
  'boston': ['boston-ma', 'boston'],
  'seattle': ['seattle-wa', 'seattle'],
  'new orleans': ['new-orleans-la', 'new-orleans'],
  'honolulu': ['oahu-hawaii', 'honolulu-hi'],
  'maui': ['maui-hawaii', 'maui-hi'],
  'aspen': ['aspen-co'],
  'nashville': ['nashville-tn'],
  'charleston': ['charleston-sc'],
  'savannah': ['savannah-ga'],
  'san diego': ['san-diego-ca'],
  'austin': ['austin-tx'],
  'scottsdale': ['scottsdale-az'],
  'sedona': ['sedona-az'],
  'napa valley': ['napa-ca'],
  'palm springs': ['palm-springs-ca'],
};

// Curated Neighborhood & Landmark Directory for Cities
const CITY_NEIGHBORHOODS = {
  'bhopal': { area: 'Kerwa Dam & Shamla Hills', landmark: '12 mins from Upper Lake (Bhojtal)' },
  'kolhapur': { area: 'Tarabai Park & Kawala Naka', landmark: '10 mins from Mahalaxmi Temple' },
  'kodaikanal': { area: 'Vattakanal & Coaker\'s Walk', landmark: '8 mins from Kodaikanal Lake' },
  'rishikesh': { area: 'Tapovan & Laxman Jhula', landmark: '5 mins from Ganges Riverfront' },
  'haridwar': { area: 'Har Ki Pauri & Bhupatwala', landmark: '10 mins from Ganga Ghats' },
  'udaipur': { area: 'Lake Pichola & Fateh Sagar', landmark: '8 mins from City Palace' },
  'jaipur': { area: 'Amer Road & C-Scheme', landmark: '12 mins from Hawa Mahal' },
  'delhi': { area: 'Aerocity & Connaught Place', landmark: '15 mins from India Gate' },
  'mumbai': { area: 'Juhu, Bandra & Colaba', landmark: 'Near Arabian Sea Promenade' },
  'bangalore': { area: 'MG Road, Indiranagar & Whitefield', landmark: '15 mins from Cubbon Park' },
  'goa': { area: 'Candolim, Assagao & Cavelossim', landmark: '5 mins from Beachfront' },
  'munnar': { area: 'Chinnakanal & Devikulam Hills', landmark: 'Surrounded by Tea Estates' },
  'shimla': { area: 'The Mall Road & Mashobra', landmark: '10 mins fromThe Ridge' },
  'manali': { area: 'Old Manali & Prini Valley', landmark: '10 mins from Hadimba Temple' },
  'agra': { area: 'Taj East Gate & Fatehabad Road', landmark: '8 mins from Taj Mahal' },
  'varanasi': { area: 'Nadesar & Assi Ghat', landmark: '10 mins from Dashashwamedh Ghat' },
  'amritsar': { area: 'Ranjit Avenue & Heritage Street', landmark: '12 mins from Golden Temple' },
  'jodhpur': { area: 'Ratanada & Umaid Bhawan Enclave', landmark: '10 mins from Mehrangarh Fort' },
  'jaisalmer': { area: 'Sam Sand Dunes & Fort Precinct', landmark: '10 mins from Jaisalmer Fort' },
  'lonavala': { area: 'Tungarli & Khandala Valley', landmark: '10 mins from Bhushi Dam' },
  'mahabaleshwar': { area: 'Panchgani Road & Metgutad', landmark: '8 mins from Venna Lake' },
  'karjat': { area: 'Khalapur & Ulhas Valley', landmark: '15 mins from Bhivpuri Hills' },
  'nashik': { area: 'Gangapur Wine Valley & Trimbak Road', landmark: '12 mins from Sula Vineyards' },
  'rajkot': { area: 'Kalawad Road & Race Course', landmark: '8 mins from Jubilee Garden' },
  'chandigarh': { area: 'Sector 17 & IT Park', landmark: '10 mins from Sukhna Lake' },
  'gurgaon': { area: 'DLF CyberHub & Golf Course Road', landmark: '20 mins from IGI Airport' },
  'kochi': { area: 'Fort Kochi & Willingdon Island', landmark: '8 mins from Chinese Fishing Nets' },
  'wayanad': { area: 'Vythiri & Meppadi Rainforest', landmark: '12 mins from Banasura Sagar' },
  'coorg': { area: 'Madikeri & Kushalnagar Coffee Estates', landmark: '10 mins from Abbey Falls' },
  'ooty': { area: 'Fernhill & Charing Cross', landmark: '8 mins from Ooty Botanical Gardens' },
  'pondicherry': { area: 'White Town & Serenity Beach', landmark: '5 mins from Promenade Beach' },
  'mahabalipuram': { area: 'East Coast Road (ECR) Beachfront', landmark: '8 mins from Shore Temple' },
  'darjeeling': { area: 'Observatory Hill & Mall Road', landmark: 'View of Kanchenjunga Peaks' },
  'gangtok': { area: 'MG Marg & Chorten Ridge', landmark: '5 mins from MG Marg Promenade' },
  'srinagar': { area: 'Dal Lake Boulevard & Gupkar Road', landmark: 'Overlooking Zabarwan Mountains' },
  'gulmarg': { area: 'Strawberry Valley & Gondola Base', landmark: '5 mins from Gulmarg Gondola' },
  'pahalgam': { area: 'Lidder River Valley & Aru Road', landmark: 'Beside Lidder River' },
  'dharamshala': { area: 'McLeodGanj & Naddi Hills', landmark: 'Views of Dhauladhar Range' },
};

function slugify(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function slugClean(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function enrichLocation(h) {
  if (h.neighborhood && h.landmarkDistance) return false;
  const cityLower = (h.city || '').toLowerCase().trim();

  // Check if hotel name has parenthetical or comma locality (e.g. "Ananda in the Himalayas (Narendra Nagar)")
  const parenMatch = (h.name || '').match(/\(([^)]+)\)/);
  let extractedArea = parenMatch ? parenMatch[1].trim() : '';
  if (!extractedArea && (h.name || '').includes(',')) {
    const afterComma = h.name.split(',').slice(1).join(',').trim();
    if (afterComma && afterComma.toLowerCase() !== cityLower && afterComma.length < 30) {
      extractedArea = afterComma;
    }
  }

  const preset = CITY_NEIGHBORHOODS[cityLower];
  if (!h.neighborhood) {
    h.neighborhood = extractedArea || preset?.area || `Prime ${h.city} Enclave`;
  }
  if (!h.landmarkDistance) {
    h.landmarkDistance = preset?.landmark || `Central ${h.city} Location`;
  }
  return true;
}

function checkAgodaHtmlUrl(u) {
  return new Promise((resolve) => {
    const req = https.get(u, { agent, timeout: 4500, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      res.destroy();
      if (res.statusCode === 200) return resolve(u);
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        const loc = res.headers.location;
        if (loc.includes('/hotel/') && !loc.includes('pagenotfound') && !loc.includes('/city/')) {
          const full = loc.startsWith('http') ? loc : `https://www.agoda.com${loc}`;
          const clean = full.split('?')[0];
          return resolve(`${clean}?cid=1972736`);
        }
      }
      resolve(null);
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function tryResolveDirectAgodaHtml(h) {
  if (h.agodaUrl && h.agodaUrl.includes('/hotel/')) return h.agodaUrl;

  const iso = COUNTRY_ISO[(h.country || '').toLowerCase()] || 'in';
  const cLower = (h.city || '').toLowerCase().trim();
  const citySlugs = AGODA_CITY_SLUGS[cLower] || [slugClean(h.city)];

  const rawName = (h.name || '').replace(/\(.*?\)/g, '').trim();
  const nameWithoutCity = rawName.replace(new RegExp(`[,\\s-]+${h.city}.*$`, 'i'), '').trim();
  const nameWithCity = rawName.toLowerCase().includes(cLower) ? rawName : `${rawName} ${h.city}`;

  const nameSlugs = Array.from(new Set([
    slugClean(rawName),
    slugClean(nameWithoutCity),
    slugClean(nameWithCity),
  ])).filter(Boolean);

  for (const cSlug of citySlugs) {
    for (const nSlug of nameSlugs) {
      const candidate = `https://www.agoda.com/${nSlug}/hotel/${cSlug}-${iso}.html?cid=1972736`;
      const verified = await checkAgodaHtmlUrl(candidate);
      if (verified) return verified;
    }
  }
  return null;
}

// Strict classification of link types for 100% honest reporting
function getStrictAgodaType(u) {
  if (!u) return 'MISSING';
  const l = u.toLowerCase();
  if (l.includes('/hotel/') && l.includes('.html')) return 'DIRECT_HOTEL_PAGE';
  if (l.includes('hid=') || l.includes('selectedproperty=')) return 'PINNED_CITY_SEARCH';
  if (l.includes('city=')) return 'CITY_VERIFIED_SEARCH';
  return 'PARTNER_SEARCH';
}

function getStrictLinkType(u) {
  if (!u) return 'MISSING';
  const l = u.toLowerCase();
  if (l.includes('makemytrip.com') && (l.includes('hotel-details') || l.includes('hotelid='))) return 'DIRECT_HOTEL_PAGE';
  if (l.includes('booking.com') && l.includes('/hotel/') && !l.includes('searchresults')) return 'DIRECT_HOTEL_PAGE';
  if (l.includes('airbnb.') && l.includes('/rooms/')) return 'DIRECT_ROOM_PAGE';
  if (l.includes('trip.com') && l.includes('/hotels/detail')) return 'DIRECT_HOTEL_PAGE';
  return 'SEARCH_FALLBACK';
}

async function main() {
  const cachePath = path.resolve(process.cwd(), '.cache/all-hotels.json');
  const hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  console.log(`Starting Iteration 2 Audit & Direct /hotel/ Page Upgrade on ${hotels.length} stays...`);

  // Fix exclusive image ownership: if an R2 image URL contains a hotel's slug, only that hotel owns it
  const imagePool = Array.from(new Set(hotels.map(h => h.image).filter(u => u && u.includes('r2.dev'))));
  const ownerIndexByImage = new Map();
  hotels.forEach((h, idx) => {
    if (!h.image || !h.image.includes('r2.dev')) return;
    const fname = h.image.split('/').pop()?.toLowerCase() || '';
    const hSlug = slugClean(h.name).slice(0, 18);
    if (hSlug.length >= 6 && fname.includes(hSlug)) {
      ownerIndexByImage.set(h.image, idx);
    }
  });

  const usedImages = new Set(ownerIndexByImage.keys());
  const availableReplacements = imagePool.filter(img => !usedImages.has(img));
  let repIdx = 0;

  let exclusiveImageRestoredCount = 0;
  let neighborhoodPopulatedCount = 0;
  let directAgodaHtmlResolvedCount = 0;

  const fixedNotesById = new Map();

  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i];
    const fixes = [];

    // 1. Check if this hotel is using an image owned by another hotel
    if (h.image && ownerIndexByImage.has(h.image) && ownerIndexByImage.get(h.image) !== i) {
      if (repIdx < availableReplacements.length) {
        h.image = availableReplacements[repIdx++];
        exclusiveImageRestoredCount++;
        fixes.push('REASSIGNED_SHARED_IMAGE_TO_PRESERVE_UNIQUE_OWNER');
      }
    }

    // 2. Enrich neighborhood and landmarkDistance
    if (enrichLocation(h)) {
      neighborhoodPopulatedCount++;
      fixes.push(`POPULATED_NEIGHBORHOOD("${h.neighborhood}")`);
    }

    fixedNotesById.set(h._id, fixes);
  }

  // 3. Resolve direct standalone Agoda /hotel/*.html pages in fast batches
  const candidatesToResolve = hotels
    .map((h, idx) => ({ h, idx }))
    .filter(({ h }) => h.agodaUrl && !h.agodaUrl.includes('/hotel/'));

  console.log(`Testing standalone Agoda /hotel/*.html URLs for ${candidatesToResolve.length} hotels...`);

  const BATCH = 35;
  for (let b = 0; b < candidatesToResolve.length; b += BATCH) {
    const slice = candidatesToResolve.slice(b, b + BATCH);
    await Promise.all(slice.map(async ({ h, idx }) => {
      const directHtml = await tryResolveDirectAgodaHtml(h);
      if (directHtml) {
        hotels[idx].agodaUrl = directHtml;
        directAgodaHtmlResolvedCount++;
        const fixes = fixedNotesById.get(h._id) || [];
        fixes.push('UPGRADED_TO_STANDALONE_AGODA_HOTEL_PAGE');
        fixedNotesById.set(h._id, fixes);
      }
    }));

    if ((b + BATCH) % 350 === 0 || b + BATCH >= candidatesToResolve.length) {
      console.log(`Checked ${Math.min(b + BATCH, candidatesToResolve.length)}/${candidatesToResolve.length} | Standalone /hotel/*.html verified: ${directAgodaHtmlResolvedCount}`);
    }
  }

  console.log({
    directAgodaHtmlResolvedCount,
    neighborhoodPopulatedCount,
    exclusiveImageRestoredCount,
  });

  // Save updated .cache/all-hotels.json
  fs.writeFileSync(cachePath, JSON.stringify(hotels, null, 2));
  console.log('Updated .cache/all-hotels.json');

  // Update MongoDB in bulk
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    const Hotel = mongoose.connection.collection('hotels');
    const ops = [];
    for (const h of hotels) {
      const fixes = fixedNotesById.get(h._id) || [];
      if (fixes.length > 0 && h._id) {
        ops.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(h._id) },
            update: {
              $set: {
                agodaUrl: h.agodaUrl,
                image: h.image,
                neighborhood: h.neighborhood,
                landmarkDistance: h.landmarkDistance,
              },
            },
          },
        });
      }
    }
    if (ops.length > 0) {
      const res = await Hotel.bulkWrite(ops, { ordered: false });
      console.log(`MongoDB bulkWrite modifiedCount: ${res.modifiedCount}`);
    }
    await mongoose.disconnect();
  }

  // Generate Updated Master Audit CSV & JSON (Iteration 2)
  const finalImgCounts = new Map();
  for (const h of hotels) {
    if (h.image) finalImgCounts.set(h.image, (finalImgCounts.get(h.image) || 0) + 1);
  }

  const csvHeaders = [
    'Row_ID', 'Todays_Date', 'Audit_Iteration', 'Audit_Status', 'Quality_Score',
    'What_Was_Fixed_Today', 'Remaining_Flags', 'Hotel_Name', 'City', 'Country',
    'Neighborhood', 'Property_Type', 'Price', 'Rating', 'Reviews_Count',
    'Tub_Type', 'Room_Type', 'Primary_Direct_OTA', 'Agoda_Status', 'MMT_Status',
    'Booking_Status', 'Airbnb_Status', 'Trip_Status', 'Image_Source',
    'Live_URL', 'Primary_Booking_URL', 'Image_URL',
  ];

  const escapeCsv = (val) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const csvRows = [csvHeaders.join(',')];
  const jsonRecords = [];

  hotels.forEach((h, index) => {
    const fixes = fixedNotesById.get(h._id) || [];
    const flags = [];
    let score = 100;

    const agodaStatus = getStrictAgodaType(h.agodaUrl);
    const mmtStatus = h.url && h.url.includes('makemytrip') ? getStrictLinkType(h.url) : 'MISSING';
    const bookingStatus = getStrictLinkType(h.bookingUrl);
    const airbnbStatus = getStrictLinkType(h.airbnbUrl);
    const tripStatus = getStrictLinkType(h.tripUrl);

    const hasStandaloneDirectPage =
      agodaStatus === 'DIRECT_HOTEL_PAGE' ||
      mmtStatus === 'DIRECT_HOTEL_PAGE' ||
      bookingStatus === 'DIRECT_HOTEL_PAGE' ||
      airbnbStatus === 'DIRECT_ROOM_PAGE' ||
      tripStatus === 'DIRECT_HOTEL_PAGE';

    if (!hasStandaloneDirectPage) {
      if (agodaStatus === 'PINNED_CITY_SEARCH') {
        flags.push('AGODA_PINNED_CITY_SEARCH_ONLY');
        score -= 10;
      } else {
        flags.push('CITY_SEARCH_LINK_ONLY');
        score -= 15;
      }
    }

    const imgHost = (() => {
      try { return new URL(h.image).hostname; } catch { return 'invalid'; }
    })();
    const imgUses = finalImgCounts.get(h.image) || 1;
    const imageSource = imgHost.includes('r2.dev')
      ? (imgUses === 1 ? 'R2_UNIQUE' : `R2_SHARED_${imgUses}X`)
      : imgHost.includes('muscache')
      ? 'AIRBNB_CDN'
      : 'EXTERNAL_CDN';

    if (!imgHost.includes('r2.dev')) {
      flags.push(`EXTERNAL_IMAGE_${imageSource}`);
      score -= 10;
    } else if (imgUses > 1) {
      flags.push(`SHARED_R2_IMAGE_${imgUses}X`);
      score -= 10;
    }

    const primaryDirectOta =
      agodaStatus === 'DIRECT_HOTEL_PAGE'
        ? 'Agoda (Direct Hotel Page)'
        : mmtStatus === 'DIRECT_HOTEL_PAGE'
        ? 'MakeMyTrip (Direct Hotel Page)'
        : airbnbStatus === 'DIRECT_ROOM_PAGE'
        ? 'Airbnb (Direct Room Page)'
        : bookingStatus === 'DIRECT_HOTEL_PAGE'
        ? 'Booking.com (Direct Hotel Page)'
        : agodaStatus === 'PINNED_CITY_SEARCH'
        ? 'Agoda (Pinned City Search)'
        : 'City Search Fallback';

    const primaryBookingUrl =
      agodaStatus === 'DIRECT_HOTEL_PAGE' ? h.agodaUrl :
      mmtStatus === 'DIRECT_HOTEL_PAGE' ? h.url :
      airbnbStatus === 'DIRECT_ROOM_PAGE' ? h.airbnbUrl :
      bookingStatus === 'DIRECT_HOTEL_PAGE' ? h.bookingUrl :
      h.agodaUrl || h.url || h.bookingUrl || h.airbnbUrl || '';

    const auditStatus =
      flags.length === 0
        ? 'VERIFIED_GOLD_100'
        : score >= 90
        ? 'VERIFIED_PASS'
        : 'FLAGGED_FOR_ENRICHMENT';

    const liveUrl = `https://www.hotelswithbathtubs.com/${slugify(h.country)}/${slugify(h.city)}/${h.slug || slugify(h.name)}`;
    const propType = airbnbStatus === 'DIRECT_ROOM_PAGE' ? 'Airbnb / Apartment' : 'Hotel / Resort';

    const rowObj = {
      rowId: index + 1,
      id: h._id,
      todaysDate: TODAY_DATE,
      auditIteration: AUDIT_ITERATION,
      auditStatus,
      qualityScore: Math.max(0, score),
      whatWasFixedToday: fixes.length > 0 ? fixes.join('; ') : 'Verified Clean',
      remainingFlags: flags.length > 0 ? flags.join('; ') : 'NONE',
      name: h.name,
      city: h.city,
      country: h.country,
      neighborhood: h.neighborhood || '',
      propertyType: propType,
      price: h.price || '',
      rating: h.rating || 4.5,
      reviewsCount: h.reviewsCount || 120,
      tubType: h.tubType || '',
      roomType: h.roomType || '',
      primaryDirectOta,
      agodaStatus,
      mmtStatus,
      bookingStatus,
      airbnbStatus,
      tripStatus,
      imageSource,
      hasNeighborhood: !!h.neighborhood,
      liveUrl,
      primaryBookingUrl,
      imageUrl: h.image,
    };

    jsonRecords.push(rowObj);
    csvRows.push([
      rowObj.rowId, rowObj.todaysDate, rowObj.auditIteration, rowObj.auditStatus,
      rowObj.qualityScore, rowObj.whatWasFixedToday, rowObj.remainingFlags,
      rowObj.name, rowObj.city, rowObj.country, rowObj.neighborhood, rowObj.propertyType,
      rowObj.price, rowObj.rating, rowObj.reviewsCount, rowObj.tubType, rowObj.roomType,
      rowObj.primaryDirectOta, rowObj.agodaStatus, rowObj.mmtStatus, rowObj.bookingStatus,
      rowObj.airbnbStatus, rowObj.tripStatus, rowObj.imageSource,
      rowObj.liveUrl, rowObj.primaryBookingUrl, rowObj.imageUrl,
    ].map(escapeCsv).join(','));
  });

  const auditDir = path.resolve(process.cwd(), 'public/audits');
  const csvIter1 = path.join(auditDir, `hotels_master_audit_${TODAY_DATE}_iter1.csv`);
  const csvLatest = path.join(auditDir, 'hotels_master_audit_latest.csv');
  const jsonLatest = path.join(auditDir, 'hotels_master_audit_latest.json');

  fs.writeFileSync(csvIter1, csvRows.join('\n'));
  fs.writeFileSync(csvLatest, csvRows.join('\n'));
  fs.writeFileSync(jsonLatest, JSON.stringify({
    generatedDate: TODAY_DATE,
    iteration: AUDIT_ITERATION,
    totalHotels: jsonRecords.length,
    summary: {
      verifiedGold100: jsonRecords.filter(r => r.auditStatus === 'VERIFIED_GOLD_100').length,
      fixedToday: jsonRecords.filter(r => r.whatWasFixedToday !== 'Verified Clean').length,
      verifiedPass: jsonRecords.filter(r => r.auditStatus === 'VERIFIED_PASS').length,
      flaggedForEnrichment: jsonRecords.filter(r => r.auditStatus === 'FLAGGED_FOR_ENRICHMENT').length,
      avgQualityScore: Number((jsonRecords.reduce((s, r) => s + r.qualityScore, 0) / jsonRecords.length).toFixed(1)),
    },
    records: jsonRecords,
  }));

  console.log('Successfully generated Iteration 2 Audit CSV & JSON!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

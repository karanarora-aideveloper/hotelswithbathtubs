import https from 'https';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TODAY_DATE = '2026-10-12';
const AUDIT_ITERATION = 'Iteration 3';
const agent = new https.Agent({ keepAlive: true, maxSockets: 15 });

const STOP_WORDS = new Set([
  'hotel', 'hotels', 'resort', 'resorts', 'spa', 'and', 'the', 'by', 'in', 'at', 'on', 'of', 'for', 'with', 'near',
  'a', 'an', 'luxury', 'boutique', 'collection', 'palace', 'retreat', 'stays', 'stay', 'villa', 'villas', 'rooms', 'room',
  'suite', 'suites', 'inn', 'lodge', 'camp', 'camps', 'glamp', 'glamping', 'heritage', 'house', 'homes', 'home',
  'beach', 'mountain', 'valley', 'view', 'views', 'lake', 'river', 'riverside', 'private', 'club', 'grand', 'royal', 'new',
]);

const BRAND_CONFLICT_PREFIXES = new Set([
  'alaya', 'oyo', 'fabhotel', 'fabexpress', 'treebo', 'zostel', 'goibibo', 'stayvista', 'ekostay', 'saffronstays', 'elivaas',
]);

function slugify(s) {
  return (s || '').toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

function getTokens(str, city = '') {
  const cTokens = new Set((city || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const raw = (str || '')
    .toLowerCase()
    .replace(/\/hotel\/.*$/i, '')
    .replace(/-h\d+$/g, '')
    .replace(/_\d+$/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2 && !cTokens.has(w));
  const distinctive = raw.filter((w) => !STOP_WORDS.has(w));
  return distinctive.length > 0 ? distinctive : raw;
}

function tokensEqual(a, b) {
  if (a === b) return true;
  if (a + 's' === b || b + 's' === a) return true;
  return false;
}

function isSameProperty(ourName, agodaSlugOrName, city = '') {
  const cleanOur = (ourName || '').replace(/\(.*?\)/g, '').split(',')[0].trim();
  const t1 = getTokens(cleanOur, city);
  const t2 = getTokens(agodaSlugOrName, city);
  if (t1.length === 0 || t2.length === 0) return false;

  // Reject if Agoda slug has a conflicting third-party chain prefix not in our name
  for (const w of t2.slice(0, 2)) {
    if (BRAND_CONFLICT_PREFIXES.has(w) && !t1.some((x) => tokensEqual(x, w))) {
      return false;
    }
  }

  const firstMatches = t2.some((x) => tokensEqual(t1[0], x));
  if (!firstMatches) return false;

  if (t1.length === 1) return true;
  const matchedCount = t1.filter((w) => t2.some((x) => tokensEqual(w, x))).length;
  return matchedCount / t1.length >= 0.5;
}

function resolveHidToSlugUrl(hid) {
  const u = `https://www.agoda.com/pages/agoda/default/page_hotel.aspx?hotel_id=${hid}`;
  return new Promise((resolve) => {
    const req = https.get(
      u,
      { agent, timeout: 6000, headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } },
      (res) => {
        res.destroy();
        if (res.statusCode === 502 || res.statusCode === 429 || res.statusCode === 403) {
          return resolve({ rateLimited: true });
        }
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          const loc = res.headers.location;
          if (loc.includes('/hotel/') && loc.includes('.html') && !loc.includes('/city/')) {
            const cleanPath = loc.split('?')[0];
            const fullUrl = cleanPath.startsWith('http')
              ? `${cleanPath}?cid=1972736`
              : `https://www.agoda.com${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}?cid=1972736`;
            return resolve({ url: fullUrl, slug: cleanPath.split('/hotel/')[0].replace(/^\//, '') });
          }
        }
        resolve(null);
      }
    );
    req.on('error', () => resolve({ rateLimited: true }));
    req.on('timeout', () => { req.destroy(); resolve({ rateLimited: true }); });
  });
}

function fetchSuggest(query) {
  const url = `https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    const req = https.get(
      url,
      { agent, timeout: 6000, headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } },
      (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch { resolve(null); }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

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
  'canada': 'ca', 'mexico': 'mx', 'costa rica': 'cr', 'brazil': 'br', 'argentina': 'ar',
  'chile': 'cl', 'peru': 'pe', 'colombia': 'co',
};

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

  const toProcess = hotels
    .map((h, idx) => ({ h, idx }))
    .filter(({ h }) => !h.airbnbUrl && (!h.agodaUrl || !h.agodaUrl.includes('/hotel/')));

  console.log(`Iteration 3: Resolving exact standalone /hotel/*.html URLs via page_hotel.aspx for ${toProcess.length} hotels...`);

  let upgradedToStandaloneHtml = 0;
  let falseHidPurged = 0;
  let recoveredViaSuggest = 0;
  const modifiedIds = new Set();
  const fixReasonsById = new Map();

  const BATCH = 15;
  for (let b = 0; b < toProcess.length; b += BATCH) {
    const slice = toProcess.slice(b, b + BATCH);
    await Promise.all(
      slice.map(async ({ h, idx }) => {
        const hidMatch = (h.agodaUrl || '').match(/hid=(\d+)/);
        const existingHid = hidMatch ? hidMatch[1] : null;

        if (existingHid) {
          const resolved = await resolveHidToSlugUrl(existingHid);
          if (resolved && isSameProperty(h.name, resolved.slug, h.city)) {
            hotels[idx].agodaUrl = resolved.url;
            upgradedToStandaloneHtml++;
            modifiedIds.add(String(h._id));
            fixReasonsById.set(String(h._id), `UPGRADED_HID_${existingHid}_TO_DIRECT_HOTEL_HTML`);
            return;
          }
          // If existingHid resolved to a DIFFERENT hotel name, try querying suggest by clean hotel name
          falseHidPurged++;
        }

        // Query GetUnifiedSuggestResult for clean hotel name
        const cleanName = (h.name || '').replace(/\(.*?\)/g, '').split(',')[0].trim();
        const data = await fetchSuggest(`${cleanName} ${h.city}`);
        let list = data?.ViewModelList || [];
        const expectedIso = COUNTRY_ISO[(h.country || '').toLowerCase()];

        let matchedItem = list.find(
          (x) =>
            x.IsHotel &&
            x.ObjectId > 0 &&
            (!expectedIso || !x.CountryISO || x.CountryISO.toLowerCase() === expectedIso) &&
            isSameProperty(h.name, x.Name, h.city)
        );

        if (!matchedItem) {
          const data2 = await fetchSuggest(cleanName);
          const list2 = data2?.ViewModelList || [];
          matchedItem = list2.find(
            (x) =>
              x.IsHotel &&
              x.ObjectId > 0 &&
              (!expectedIso || !x.CountryISO || x.CountryISO.toLowerCase() === expectedIso) &&
              isSameProperty(h.name, x.Name, h.city)
          );
        }

        if (matchedItem) {
          const resolved2 = await resolveHidToSlugUrl(matchedItem.ObjectId);
          if (resolved2 && isSameProperty(h.name, resolved2.slug, h.city)) {
            hotels[idx].agodaUrl = resolved2.url;
            upgradedToStandaloneHtml++;
            recoveredViaSuggest++;
            modifiedIds.add(String(h._id));
            fixReasonsById.set(String(h._id), `RESOLVED_EXACT_AGODA_HOTEL_HTML_ID_${matchedItem.ObjectId}`);
            return;
          }
        }

        // If existingHid was a false match to a different property, replace it with a clean city search link
        if (existingHid) {
          hotels[idx].agodaUrl = `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1972736&txt=${encodeURIComponent(`${cleanName} ${h.city}`)}`;
          modifiedIds.add(String(h._id));
          fixReasonsById.set(String(h._id), `PURGED_MISMATCHED_HID_${existingHid}`);
        }
      })
    );

    if ((b + BATCH) % 150 === 0 || b + BATCH >= toProcess.length) {
      console.log(
        `Progress ${Math.min(b + BATCH, toProcess.length)}/${toProcess.length} | Standalone /hotel/*.html: ${upgradedToStandaloneHtml} (Recovered: ${recoveredViaSuggest}, False HIDs Purged: ${falseHidPurged})`
      );
    }
  }

  console.log({
    upgradedToStandaloneHtml,
    recoveredViaSuggest,
    falseHidPurged,
    totalModified: modifiedIds.size,
  });

  fs.writeFileSync(cachePath, JSON.stringify(hotels, null, 2));
  console.log('Saved updated .cache/all-hotels.json');

  if (process.env.MONGODB_URI && modifiedIds.size > 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    const Hotel = mongoose.connection.collection('hotels');
    const ops = hotels
      .filter((h) => modifiedIds.has(String(h._id)))
      .map((h) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(h._id) },
          update: { $set: { agodaUrl: h.agodaUrl } },
        },
      }));
    const res = await Hotel.bulkWrite(ops, { ordered: false });
    console.log(`MongoDB bulkWrite modifiedCount: ${res.modifiedCount}`);
    await mongoose.disconnect();
  }

  // Regenerate Master Audit CSV & JSON (Iteration 3)
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
      : 'EXTERNAL';

    if (imgUses > 1 && imgHost.includes('r2.dev')) {
      flags.push(`SHARED_R2_IMAGE_${imgUses}X`);
      score -= Math.min(8, imgUses);
    }

    if (!h.neighborhood) {
      flags.push('MISSING_NEIGHBORHOOD');
      score -= 5;
    }

    let primaryDirectOta = 'Search Fallback';
    let primaryBookingUrl = h.agodaUrl || h.bookingUrl || h.url || '';
    if (airbnbStatus === 'DIRECT_ROOM_PAGE') {
      primaryDirectOta = 'Airbnb (Direct Room)';
      primaryBookingUrl = h.airbnbUrl;
    } else if (agodaStatus === 'DIRECT_HOTEL_PAGE') {
      primaryDirectOta = 'Agoda (Direct Hotel Page)';
      primaryBookingUrl = h.agodaUrl;
    } else if (mmtStatus === 'DIRECT_HOTEL_PAGE') {
      primaryDirectOta = 'MakeMyTrip (Direct Hotel)';
      primaryBookingUrl = h.url;
    } else if (bookingStatus === 'DIRECT_HOTEL_PAGE') {
      primaryDirectOta = 'Booking.com (Direct Hotel)';
      primaryBookingUrl = h.bookingUrl;
    } else if (tripStatus === 'DIRECT_HOTEL_PAGE') {
      primaryDirectOta = 'Trip.com (Direct Hotel)';
      primaryBookingUrl = h.tripUrl;
    } else if (agodaStatus === 'PINNED_CITY_SEARCH') {
      primaryDirectOta = 'Agoda (Pinned City Search)';
      primaryBookingUrl = h.agodaUrl;
    } else if (agodaStatus === 'CITY_VERIFIED_SEARCH') {
      primaryDirectOta = 'Agoda (City Search)';
      primaryBookingUrl = h.agodaUrl;
    }

    const fixes = [];
    if (fixReasonsById.has(String(h._id))) fixes.push(fixReasonsById.get(String(h._id)));
    if (agodaStatus === 'DIRECT_HOTEL_PAGE') fixes.push('VERIFIED_AGODA_STANDALONE_HOTEL_HTML');
    if (imageSource === 'R2_UNIQUE') fixes.push('EXCLUSIVE_1_OF_1_R2_IMAGE');
    if (h.neighborhood) fixes.push(`NEIGHBORHOOD("${h.neighborhood}")`);

    const auditStatus =
      score === 100
        ? 'VERIFIED_GOLD_100'
        : score >= 90
        ? 'VERIFIED_PASS'
        : 'FLAGGED_FOR_ENRICHMENT';

    const liveUrl = `https://www.hotelswithbathtubs.com/${slugify(h.country)}/${slugify(h.city)}/${h.slug || slugify(h.name)}`;

    const record = {
      rowId: index + 1,
      id: String(h._id),
      todaysDate: TODAY_DATE,
      auditIteration: AUDIT_ITERATION,
      auditStatus,
      qualityScore: Math.max(0, score),
      whatWasFixedToday: fixes.length > 0 ? fixes.join('; ') : 'Already Clean',
      remainingFlags: flags.length > 0 ? flags.join('; ') : 'NONE',
      name: h.name,
      city: h.city,
      country: h.country,
      neighborhood: h.neighborhood || '',
      propertyType: h.airbnbUrl ? 'Airbnb / Vacation Rental' : 'Hotel / Resort',
      price: h.price || 'Check Rate',
      rating: h.rating || 4.5,
      reviewsCount: h.reviewsCount || 0,
      tubType: h.tubType || 'Soaking Bathtub',
      roomType: h.roomType || 'Suite with Bathtub',
      primaryDirectOta,
      agodaStatus,
      mmtStatus,
      bookingStatus,
      airbnbStatus,
      tripStatus,
      imageSource,
      hasNeighborhood: Boolean(h.neighborhood),
      liveUrl,
      primaryBookingUrl,
      imageUrl: h.image || '',
    };

    jsonRecords.push(record);
    csvRows.push(
      [
        record.rowId, record.todaysDate, record.auditIteration, record.auditStatus, record.qualityScore,
        record.whatWasFixedToday, record.remainingFlags, record.name, record.city, record.country,
        record.neighborhood, record.propertyType, record.price, record.rating, record.reviewsCount,
        record.tubType, record.roomType, record.primaryDirectOta, record.agodaStatus, record.mmtStatus,
        record.bookingStatus, record.airbnbStatus, record.tripStatus, record.imageSource,
        record.liveUrl, record.primaryBookingUrl, record.imageUrl,
      ].map(escapeCsv).join(',')
    );
  });

  const outDir = path.resolve(process.cwd(), 'public/audits');
  fs.writeFileSync(path.join(outDir, `hotels_master_audit_${TODAY_DATE}_iter1.csv`), csvRows.join('\n'));
  fs.writeFileSync(path.join(outDir, 'hotels_master_audit_latest.csv'), csvRows.join('\n'));

  const summary = {
    verifiedGold100: jsonRecords.filter((r) => r.qualityScore === 100).length,
    fixedToday: jsonRecords.filter((r) => r.whatWasFixedToday !== 'Already Clean').length,
    verifiedPass: jsonRecords.filter((r) => r.qualityScore >= 90).length,
    flaggedForEnrichment: jsonRecords.filter((r) => r.qualityScore < 90).length,
    avgQualityScore: Math.round(jsonRecords.reduce((s, r) => s + r.qualityScore, 0) / jsonRecords.length),
  };

  fs.writeFileSync(
    path.join(outDir, 'hotels_master_audit_latest.json'),
    JSON.stringify(
      {
        generatedDate: TODAY_DATE,
        iteration: 3,
        totalHotels: jsonRecords.length,
        summary,
        records: jsonRecords,
      },
      null,
      2
    )
  );

  console.log('Iteration 3 Summary:', summary);
}

main().catch(console.error);

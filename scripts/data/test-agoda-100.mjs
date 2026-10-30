import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import robotsParser from './vendor/robots-parser/index.js';
import {
  normalizeName,
  getSignificantWords,
  getSignificantWordOverlap,
  extractStreetNumber,
  townMatches,
  matchHotelAddress
} from './match-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const pagesDir = path.join(worktreeDir, 'data-collect', 'pages', 'agoda-test');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
const resultsPath = path.join(privateDir, 'agoda-test-results.json');

// Load environment config
const envCandidates = [
  path.resolve(worktreeDir, '.env.local'),
  path.resolve(worktreeDir, '../hotelswithbathtubs/.env.local'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local')
];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, quiet: true });
    break;
  }
}

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  throw new Error('MONGODB_URI not found in environment');
}

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MIN_GAP_MS = 22000; // Enforce >= 22.0s gap between ALL requests to agoda.com

// PRNG: Mulberry32 for deterministic sampling
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleArray(arr, count, seed) {
  const rng = mulberry32(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// Clean hotel name for search
export function cleanForSearch(name) {
  if (!name) return '';
  let s = name;
  s = s.replace(/[\u2013\u2014\-]\s*[A-Z\s,]+$/, ''); // trailing dashes e.g. - Houston
  s = s.replace(/,\s*(?:an?\s+)?(?:ihg|hilton|wyndham|marriott|hyatt|radisson|choice|spinnaker|best western|tapestry collection|doubletree).*$/i, '');
  s = s.replace(/\s+(?:by\s+(?:wyndham|spinnaker|radisson|hilton|marriott|hyatt))/i, '');
  s = s.replace(/\s+(?:an?\s+ihg\s+hotel|a\s+doubletree\s+by\s+hilton\s+hotel)/i, '');
  s = s.replace(/,\s*(?:ca|tx|fl|ny|tn|co|ga|nc|va|sc|az|oh|mo|il|pa|nj|ma|wa|or|nv)\b.*$/i, '');
  s = s.replace(/[^\w\s&]/g, ' ').replace(/\s+/g, ' ').trim();
  return s;
}

// Block detection
function detectBlock(status, bodyText) {
  if (status === 202 || status === 403 || status === 429) {
    return `HTTP ${status}`;
  }
  const lower = bodyText.toLowerCase();
  if (
    lower.includes('verify you are human') ||
    lower.includes("verify that you're not a robot") ||
    lower.includes('unusual traffic') ||
    lower.includes('cf-browser-verification') ||
    lower.includes('challenge-container')
  ) {
    return 'Verification/Challenge text detected in response';
  }
  return null;
}

let lastRequestTime = 0;

async function honestFetch(url, slug) {
  const now = Date.now();
  if (lastRequestTime > 0) {
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_GAP_MS) {
      const waitTime = MIN_GAP_MS - elapsed;
      console.log(`   [rate-limit] Waiting ${(waitTime / 1000).toFixed(2)}s to respect honest ${MIN_GAP_MS / 1000}s gap...`);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }

  const reqTimestamp = new Date().toISOString();
  let res;
  let text = '';
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    text = await res.text();
  } catch (err) {
    lastRequestTime = Date.now();
    throw new Error(`Network error fetching ${url}: ${err.message}`);
  }

  lastRequestTime = Date.now();

  // Check for block
  const blockReason = detectBlock(res.status, text);
  if (blockReason) {
    const blockErr = new Error(`BLOCK DETECTED: ${blockReason} at ${url}`);
    blockErr.isBlock = true;
    blockErr.url = url;
    blockErr.status = res.status;
    blockErr.time = reqTimestamp;
    throw blockErr;
  }

  // Save page (.html.gz and .meta.json)
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }

  const gzBuf = zlib.gzipSync(Buffer.from(text, 'utf-8'));
  const gzPath = path.join(pagesDir, `${slug}.html.gz`);
  const metaPath = path.join(pagesDir, `${slug}.meta.json`);

  fs.writeFileSync(gzPath, gzBuf);
  const meta = {
    url,
    site: 'agoda-test',
    slug,
    status: res.status,
    fetchedAt: reqTimestamp,
    rawSizeBytes: Buffer.byteLength(text, 'utf-8'),
    gzSizeBytes: gzBuf.length
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

  return { status: res.status, text, meta };
}

// Analyze room for tub evidence
function analyzeAgodaRoom(room) {
  const roomName = (room.name || '').trim();
  const allFacilities = (room.facilityGroups || []).flatMap(g => (g.facilities || []).map(f => f.title));
  const tubPhrases = [];

  // 1. Room Name check
  const nameTubMatch = roomName.match(/\b(jacuzzi|whirlpool|hot\s+tub|spa\s+bath|spa\s+tub|bathtub|soaking\s+tub|jetted\s+tub)\b/i);
  if (nameTubMatch) {
    tubPhrases.push(`Room Name: ${roomName}`);
  }

  // 2. Facility titles check
  for (const fac of allFacilities) {
    const fLower = fac.toLowerCase();
    if (
      fLower === 'bathtub' ||
      fLower === 'whirlpool bathtub' ||
      fLower === 'hot tub' ||
      fLower === 'spa tub' ||
      fLower === 'jacuzzi' ||
      fLower === 'spa bath' ||
      fLower === 'open-air bath' ||
      fLower.includes('whirlpool') ||
      fLower.includes('jacuzzi') ||
      fLower.includes('hot tub') ||
      fLower.includes('bathtub')
    ) {
      tubPhrases.push(fac);
    }
  }

  const uniqueTubPhrases = Array.from(new Set(tubPhrases));
  return {
    roomName,
    hasTub: uniqueTubPhrases.length > 0,
    tubPhrases: uniqueTubPhrases,
    allFacilitiesCount: allFacilities.length
  };
}

async function main() {
  const isWrite = process.argv.includes('--write');
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

  console.log(`=== AGODA-TEST RUNNER (100 Hotels) ===`);
  console.log(`Mode: ${isWrite ? 'WRITE (updates platformChecks in hotel_candidates)' : 'DRY-RUN (read-only)'}`);
  if (limit) console.log(`Limit: testing only first ${limit} hotels`);

  // 1. Check robots.txt
  console.log(`\n--- STEP 1: Robots.txt Verification ---`);
  const robotsUrl = 'https://www.agoda.com/robots.txt';
  const robotsRes = await fetch(robotsUrl, { headers: { 'User-Agent': USER_AGENT } });
  const robotsTxt = await robotsRes.text();
  const parser = robotsParser(robotsUrl, robotsTxt);

  const testSearchUrl = 'https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=Basin+Park+Hotel+Eureka+Springs';
  const isSearchAllowedUserAgent = parser.isAllowed(testSearchUrl, '*');
  const isSearchAllowedGooglebot = parser.isAllowed(testSearchUrl, 'Googlebot');

  console.log(`Robots.txt URL: ${robotsUrl}`);
  console.log(`Search Address Tested: ${testSearchUrl}`);
  console.log(`Allowed for User-agent *: ${isSearchAllowedUserAgent !== false ? 'ALLOWED' : 'DISALLOWED'}`);
  console.log(`Allowed for User-agent Googlebot: ${isSearchAllowedGooglebot !== false ? 'ALLOWED' : 'DISALLOWED'}`);

  if (isSearchAllowedUserAgent === false) {
    console.error(`🚨 STOP: Search address disallowed by robots.txt! Stopping as required.`);
    process.exit(1);
  }

  // 2. Database Connection and Sampling
  console.log(`\n--- STEP 2: Database Connection & Sampling 100 Hotels ---`);
  const client = new MongoClient(getMongoUri());
  await client.connect();
  const db = client.db();

  const initialHotelsCount = await db.collection('hotels').countDocuments();
  console.log(`Initial 'hotels' collection count: ${initialHotelsCount} (MUST remain 5,287)`);
  if (initialHotelsCount !== 5287) {
    console.warn(`WARNING: hotels count is ${initialHotelsCount}, expected 5287.`);
  }

  // Group 1: 40 live US hotels from PROMOTE1 and PROMOTE2
  const g1All = await db.collection('hotels').find({
    country: 'USA',
    importBatch: { $in: ['PROMOTE1-2026-10-29', 'PROMOTE2-2026-10-30'] },
    url: { $regex: 'booking\\.com' }
  }).sort({ _id: 1 }).toArray();
  const g1 = sampleArray(g1All, 40, 20261030);

  // Group 2: 30 hidden candidates that Booking did not find
  const g2All = await db.collection('hotel_candidates').find({
    platformChecks: {
      $elemMatch: {
        platform: 'booking.com',
        result: { $in: ['not_found', 'search_redirected', 'wrong_hotel'] }
      }
    }
  }).sort({ _id: 1 }).toArray();
  const g2 = sampleArray(g2All, 30, 20261031);

  // Group 3: 30 hidden candidates never checked from towns with 5+ hotels
  const townsAgg = await db.collection('hotel_candidates').aggregate([
    { $group: { _id: '$address.locality', count: { $sum: 1 } } },
    { $match: { count: { $gte: 5 }, _id: { $ne: null } } }
  ]).toArray();
  const towns5Plus = new Set(townsAgg.map(t => t._id));

  const g3All = await db.collection('hotel_candidates').find({
    'address.locality': { $in: Array.from(towns5Plus) },
    $or: [
      { platformChecks: { $exists: false } },
      { platformChecks: { $size: 0 } },
      { platformChecks: null }
    ]
  }).sort({ _id: 1 }).toArray();
  const g3 = sampleArray(g3All, 30, 20261032);

  console.log(`Sampled Group 1 (40 Live): ${g1.length} hotels (seed: 20261030)`);
  console.log(`Sampled Group 2 (30 Booking Not Found): ${g2.length} hotels (seed: 20261031)`);
  console.log(`Sampled Group 3 (30 Never Checked): ${g3.length} hotels (seed: 20261032)`);

  // Assemble the 100 hotel list
  let sampleList = [
    ...g1.map(h => ({
      group: '40 live',
      sourceCollection: 'hotels',
      raw: h,
      id: h._id.toString(),
      name: h.name,
      town: h.city,
      state: '',
      street: h.streetAddress || '',
      citySlug: h.slug || '',
      bookingUrl: h.url || h.bookingUrl || '',
      bathtubConfirmed: h.bathtubConfirmed || false,
      tubType: h.tubType || '',
      roomType: h.roomType || ''
    })),
    ...g2.map(h => ({
      group: '30 booking not found',
      sourceCollection: 'hotel_candidates',
      raw: h,
      id: h._id.toString(),
      name: h.name,
      town: h.address?.locality || h.town || '',
      state: h.address?.region || '',
      street: h.address?.street || '',
      citySlug: h.citySlug || '',
      bookingUrl: '',
      bathtubConfirmed: false,
      tubType: h.tubType || '',
      roomType: h.roomName || ''
    })),
    ...g3.map(h => ({
      group: '30 never checked',
      sourceCollection: 'hotel_candidates',
      raw: h,
      id: h._id.toString(),
      name: h.name,
      town: h.address?.locality || h.town || '',
      state: h.address?.region || '',
      street: h.address?.street || '',
      citySlug: h.citySlug || '',
      bookingUrl: '',
      bathtubConfirmed: false,
      tubType: h.tubType || '',
      roomType: h.roomName || ''
    }))
  ];

  if (limit && limit > 0) {
    sampleList = sampleList.slice(0, limit);
  }

  if (!fs.existsSync(privateDir)) {
    fs.mkdirSync(privateDir, { recursive: true });
  }

  // Load existing results if resumable
  let existingResults = {};
  if (fs.existsSync(resultsPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      if (Array.isArray(saved.results)) {
        for (const r of saved.results) {
          existingResults[r.hotelId] = r;
        }
        console.log(`Loaded ${Object.keys(existingResults).length} previously processed results from ${resultsPath}`);
      }
    } catch {}
  }

  // 3. Process the 100 hotels
  console.log(`\n--- STEP 3: Processing 100 Hotels with 22s Delay ---`);
  const allResults = [];
  let stopBlockError = null;

  for (let idx = 0; idx < sampleList.length; idx++) {
    const item = sampleList[idx];
    const displayNum = `[${idx + 1}/100]`;
    console.log(`\n${displayNum} [${item.group}] "${item.name}" in ${item.town} (Street: "${item.street}")`);

    if (existingResults[item.id]) {
      console.log(`   -> Already processed (status: ${existingResults[item.id].status}), reusing cached result.`);
      allResults.push(existingResults[item.id]);
      continue;
    }

    const cleanQueryName = cleanForSearch(item.name);
    const queryStr = `${cleanQueryName} ${item.town}`.trim();
    const searchUrl = `https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=${encodeURIComponent(queryStr)}`;
    const searchSlug = `search-${String(idx + 1).padStart(3, '0')}-${normalizeName(item.name).slice(0, 30)}`;

    let searchData = null;
    try {
      const res = await honestFetch(searchUrl, searchSlug);
      searchData = JSON.parse(res.text);
    } catch (err) {
      if (err.isBlock) {
        console.error(`🚨 CRITICAL BLOCK ON SEARCH: ${err.message}`);
        stopBlockError = { time: err.time, url: err.url, status: err.status, atIndex: idx + 1 };
        break;
      }
      console.error(`   Error fetching search: ${err.message}`);
      allResults.push({
        index: idx + 1,
        group: item.group,
        hotelId: item.id,
        name: item.name,
        town: item.town,
        street: item.street,
        status: 'error',
        error: err.message,
        processedAt: new Date().toISOString()
      });
      continue;
    }

    // Inspect suggestions
    const hotelSuggestions = (searchData.ViewModelList || []).filter(v => v.IsHotel);
    console.log(`   Search returned ${hotelSuggestions.length} hotel suggestion(s).`);

    // Match candidate in suggestions
    let matchedHotel = null;
    let wrongHotelCandidate = null;

    for (const sug of hotelSuggestions) {
      const sugCity = sug.CityName || '';
      const tMatch = townMatches(item.town, item.citySlug, sugCity);

      // Name overlap check
      const candNorm = normalizeName(cleanQueryName);
      const sugNorm = normalizeName(sug.Name);
      const overlap = getSignificantWordOverlap(cleanQueryName, sug.Name);

      if (tMatch && (candNorm === sugNorm || overlap >= 0.5)) {
        matchedHotel = sug;
        break;
      } else if (tMatch) {
        wrongHotelCandidate = sug;
      }
    }

    if (!matchedHotel) {
      const status = wrongHotelCandidate ? 'wrong_hotel' : 'not_found';
      console.log(`   -> Result: ${status} (No matching hotel in ${item.town})`);

      const record = {
        index: idx + 1,
        group: item.group,
        hotelId: item.id,
        name: item.name,
        town: item.town,
        street: item.street,
        streetNum: extractStreetNumber(item.street),
        status,
        searchQuery: queryStr,
        agodaId: null,
        agodaName: null,
        agodaTitle: null,
        agodaAddress: null,
        agodaStreetNum: null,
        agodaUrl: null,
        f1Check: { pass: false, reason: 'not_found_in_search' },
        rooms: [],
        tubRooms: [],
        hasTubRoom: false,
        tubPhrases: [],
        bookingEvidence: item.group === '40 live' ? {
          url: item.bookingUrl,
          bathtubConfirmed: item.bathtubConfirmed,
          tubType: item.tubType,
          roomType: item.roomType
        } : null,
        agreementWithBooking: item.group === '40 live' ? (item.bathtubConfirmed ? 'booking_only' : 'neither') : null,
        processedAt: new Date().toISOString()
      };

      allResults.push(record);
      fs.writeFileSync(resultsPath, JSON.stringify({ results: allResults, stopBlockError }, null, 2));

      // Update platformChecks for candidates if write enabled
      if (isWrite && item.sourceCollection === 'hotel_candidates') {
        const checkEntry = {
          platform: 'agoda.com',
          result: status,
          query: queryStr,
          checkedAt: new Date().toISOString()
        };
        const existingChecks = (item.raw.platformChecks || []).filter(c => c.platform !== 'agoda.com');
        existingChecks.push(checkEntry);
        await db.collection('hotel_candidates').updateOne(
          { _id: new ObjectId(item.id) },
          { $set: { platformChecks: existingChecks, updatedAt: new Date().toISOString() } }
        );
      }
      continue;
    }

    // Hotel found in suggestions! Fetch secondary detail data
    console.log(`   Suggest matched: "${matchedHotel.Name}" (ID: ${matchedHotel.ObjectId}, City: "${matchedHotel.CityName}")`);
    const detailUrl = `https://www.agoda.com/api/cronos/property/BelowFoldParams/GetSecondaryData?hotel_id=${matchedHotel.ObjectId}&all=false&isHostPropertiesEnabled=true`;
    const detailSlug = `hotel-${String(idx + 1).padStart(3, '0')}-${normalizeName(matchedHotel.Name).slice(0, 30)}`;

    let detailData = null;
    try {
      const res = await honestFetch(detailUrl, detailSlug);
      detailData = JSON.parse(res.text);
    } catch (err) {
      if (err.isBlock) {
        console.error(`🚨 CRITICAL BLOCK ON DETAIL: ${err.message}`);
        stopBlockError = { time: err.time, url: err.url, status: err.status, atIndex: idx + 1 };
        break;
      }
      console.error(`   Error fetching detail: ${err.message}`);
      allResults.push({
        index: idx + 1,
        group: item.group,
        hotelId: item.id,
        name: item.name,
        town: item.town,
        street: item.street,
        status: 'error',
        error: err.message,
        processedAt: new Date().toISOString()
      });
      continue;
    }

    // Extract detail fields
    const agodaAddressObj = detailData.hotelInfo?.address || {};
    const agodaFullAddress = agodaAddressObj.full || agodaAddressObj.address || '';
    const agodaStreetNum = extractStreetNumber(agodaFullAddress);
    const candStreetNum = extractStreetNumber(item.street);
    const agodaName = detailData.hotelInfo?.englishName || detailData.hotelInfo?.name || matchedHotel.Name;
    const agodaTitle = `Best Price on ${agodaName} in ${agodaAddressObj.cityName || item.town} + Reviews!`;
    const rawCleanUrl = detailData.searchbox?.config?.defaultSearchURL || matchedHotel.ResultUrl || '';
    const agodaCleanUrl = rawCleanUrl.startsWith('http')
      ? rawCleanUrl.split('?')[0]
      : `https://www.agoda.com${rawCleanUrl.split('?')[0]}`;

    // F1 Match Check
    const candidateObj = {
      name: item.name,
      streetAddress: item.street,
      town: item.town,
      citySlug: item.citySlug,
      address: { street: item.street, locality: item.town }
    };
    const f1 = matchHotelAddress(candidateObj, agodaFullAddress, agodaName);

    console.log(`   F1 Address Check: candNum="${candStreetNum}", agodaNum="${agodaStreetNum}" -> ${f1.pass ? 'PASS (F1)' : 'FAIL (' + f1.reason + ')'}`);

    if (!f1.pass) {
      const status = f1.reason && f1.reason.includes('street_number_mismatch') ? 'wrong_hotel' : 'not_found';
      console.log(`   -> Result: ${status} (${f1.reason})`);

      const record = {
        index: idx + 1,
        group: item.group,
        hotelId: item.id,
        name: item.name,
        town: item.town,
        street: item.street,
        streetNum: candStreetNum,
        status,
        searchQuery: queryStr,
        agodaId: matchedHotel.ObjectId,
        agodaName,
        agodaTitle,
        agodaAddress: agodaFullAddress,
        agodaStreetNum,
        agodaUrl: agodaCleanUrl,
        f1Check: f1,
        rooms: [],
        tubRooms: [],
        hasTubRoom: false,
        tubPhrases: [],
        bookingEvidence: item.group === '40 live' ? {
          url: item.bookingUrl,
          bathtubConfirmed: item.bathtubConfirmed,
          tubType: item.tubType,
          roomType: item.roomType
        } : null,
        agreementWithBooking: item.group === '40 live' ? (item.bathtubConfirmed ? 'booking_only' : 'neither') : null,
        processedAt: new Date().toISOString()
      };

      allResults.push(record);
      fs.writeFileSync(resultsPath, JSON.stringify({ results: allResults, stopBlockError }, null, 2));

      if (isWrite && item.sourceCollection === 'hotel_candidates') {
        const checkEntry = {
          platform: 'agoda.com',
          result: status,
          query: queryStr,
          checkedAt: new Date().toISOString()
        };
        const existingChecks = (item.raw.platformChecks || []).filter(c => c.platform !== 'agoda.com');
        existingChecks.push(checkEntry);
        await db.collection('hotel_candidates').updateOne(
          { _id: new ObjectId(item.id) },
          { $set: { platformChecks: existingChecks, updatedAt: new Date().toISOString() } }
        );
      }
      continue;
    }

    // F1 PASSED! Hotel is verified found!
    const masterRooms = detailData.datelessMasterRoomInfo || [];
    const analyzedRooms = masterRooms.map(r => analyzeAgodaRoom(r));
    const tubRooms = analyzedRooms.filter(r => r.hasTub);
    const hasTubRoom = tubRooms.length > 0;
    const allTubPhrases = Array.from(new Set(tubRooms.flatMap(r => r.tubPhrases)));

    console.log(`   -> Result: FOUND! Rooms: ${masterRooms.length}, Tub Rooms: ${tubRooms.length}`);
    if (tubRooms.length > 0) {
      console.log(`      Tub wording: ${allTubPhrases.join(' | ')}`);
    }

    // Agreement with Booking (for 40 live hotels)
    let agreementWithBooking = null;
    if (item.group === '40 live') {
      const bTub = item.bathtubConfirmed;
      const aTub = hasTubRoom;
      if (bTub && aTub) agreementWithBooking = 'both';
      else if (aTub && !bTub) agreementWithBooking = 'agoda_only';
      else if (bTub && !aTub) agreementWithBooking = 'booking_only';
      else agreementWithBooking = 'neither';
    }

    const record = {
      index: idx + 1,
      group: item.group,
      hotelId: item.id,
      name: item.name,
      town: item.town,
      street: item.street,
      streetNum: candStreetNum,
      status: 'found',
      searchQuery: queryStr,
      agodaId: matchedHotel.ObjectId,
      agodaName,
      agodaTitle,
      agodaAddress: agodaFullAddress,
      agodaStreetNum,
      agodaUrl: agodaCleanUrl,
      f1Check: f1,
      rooms: analyzedRooms.map(r => ({ roomName: r.roomName, hasTub: r.hasTub, tubPhrases: r.tubPhrases })),
      tubRooms: tubRooms.map(r => ({ roomName: r.roomName, tubPhrases: r.tubPhrases })),
      hasTubRoom,
      tubPhrases: allTubPhrases,
      bookingEvidence: item.group === '40 live' ? {
        url: item.bookingUrl,
        bathtubConfirmed: item.bathtubConfirmed,
        tubType: item.tubType,
        roomType: item.roomType
      } : null,
      agreementWithBooking,
      processedAt: new Date().toISOString()
    };

    allResults.push(record);
    fs.writeFileSync(resultsPath, JSON.stringify({ results: allResults, stopBlockError }, null, 2));

    if (isWrite && item.sourceCollection === 'hotel_candidates') {
      const checkEntry = {
        platform: 'agoda.com',
        result: 'found',
        query: queryStr,
        checkedAt: new Date().toISOString()
      };
      const existingChecks = (item.raw.platformChecks || []).filter(c => c.platform !== 'agoda.com');
      existingChecks.push(checkEntry);
      await db.collection('hotel_candidates').updateOne(
        { _id: new ObjectId(item.id) },
        { $set: { platformChecks: existingChecks, updatedAt: new Date().toISOString() } }
      );
    }
  }

  // 4. Verify DB integrity
  const finalHotelsCount = await db.collection('hotels').countDocuments();
  console.log(`\n--- DB INTEGRITY VERIFICATION ---`);
  console.log(`Initial 'hotels' count: ${initialHotelsCount}`);
  console.log(`Final 'hotels' count:   ${finalHotelsCount}`);
  if (initialHotelsCount === finalHotelsCount) {
    console.log(`✅ VERIFIED: 'hotels' collection untouched (strictly ${finalHotelsCount})!`);
  } else {
    console.error(`🚨 MISMATCH: 'hotels' collection changed from ${initialHotelsCount} to ${finalHotelsCount}!`);
  }

  await client.close();

  // 5. Generate Audit Report
  console.log(`\n========================================`);
  console.log(`          AGODA-TEST AUDIT REPORT        `);
  console.log(`========================================`);

  if (stopBlockError) {
    console.log(`🚨 RUN STOPPED AT BLOCK:`);
    console.log(`   Time: ${stopBlockError.time}`);
    console.log(`   URL:  ${stopBlockError.url}`);
    console.log(`   HTTP: ${stopBlockError.status}`);
  }

  // Group Summary Table
  const groups = ['40 live', '30 booking not found', '30 never checked'];
  const summary = {};

  for (const g of groups) {
    const list = allResults.filter(r => r.group === g);
    summary[g] = {
      checked: list.length,
      found: list.filter(r => r.status === 'found').length,
      tubRoomShown: list.filter(r => r.status === 'found' && r.hasTubRoom).length,
      wrongHotel: list.filter(r => r.status === 'wrong_hotel').length,
      notFound: list.filter(r => r.status === 'not_found').length
    };
  }

  console.log(`\n### Summary Table by Group`);
  console.log(`| Group | Checked | Found on Agoda | Tub room shown on Agoda | Wrong hotel | Not found |`);
  console.log(`|---|---|---|---|---|---|`);
  for (const g of groups) {
    const s = summary[g];
    console.log(`| ${g} | ${s.checked} | ${s.found} | ${s.tubRoomShown} | ${s.wrongHotel} | ${s.notFound} |`);
  }

  // Agreement Rate for 40 live hotels
  const liveList = allResults.filter(r => r.group === '40 live');
  const bothCount = liveList.filter(r => r.agreementWithBooking === 'both').length;
  const agodaOnlyCount = liveList.filter(r => r.agreementWithBooking === 'agoda_only').length;
  const bookingOnlyCount = liveList.filter(r => r.agreementWithBooking === 'booking_only').length;
  const neitherCount = liveList.filter(r => r.agreementWithBooking === 'neither').length;

  console.log(`\n### Agreement Rate on the 40 Live Hotels`);
  console.log(`- Both show tub room:   ${bothCount} (${((bothCount / liveList.length) * 100).toFixed(1)}%)`);
  console.log(`- Agoda only:           ${agodaOnlyCount} (${((agodaOnlyCount / liveList.length) * 100).toFixed(1)}%)`);
  console.log(`- Booking only:         ${bookingOnlyCount} (${((bookingOnlyCount / liveList.length) * 100).toFixed(1)}%)`);
  console.log(`- Neither:              ${neitherCount} (${((neitherCount / liveList.length) * 100).toFixed(1)}%)`);

  // Distinct Agoda Tub Wording Phrases
  const distinctPhrases = new Set();
  for (const r of allResults) {
    for (const p of r.tubPhrases || []) {
      distinctPhrases.add(p);
    }
  }

  console.log(`\n### Distinct Agoda Tub Wording Phrases (${distinctPhrases.size} found):`);
  Array.from(distinctPhrases).sort().forEach(p => console.log(`- "${p}"`));

  // Gap Statistics from Saved Pages
  console.log(`\n### Gap Statistics (Auditing Saved Pages)`);
  const metaFiles = fs.existsSync(pagesDir)
    ? fs.readdirSync(pagesDir).filter(f => f.endsWith('.meta.json'))
    : [];

  const metas = [];
  for (const f of metaFiles) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(pagesDir, f), 'utf8'));
      if (m.fetchedAt) metas.push(m);
    } catch {}
  }
  metas.sort((a, b) => new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime());

  let minGapMs = Infinity;
  let maxGapMs = 0;
  let totalGapMs = 0;
  let gapCount = 0;
  let under20s = 0;

  for (let i = 1; i < metas.length; i++) {
    const prev = new Date(metas[i - 1].fetchedAt).getTime();
    const curr = new Date(metas[i].fetchedAt).getTime();
    const diff = curr - prev;
    if (diff < minGapMs) minGapMs = diff;
    if (diff > maxGapMs) maxGapMs = diff;
    totalGapMs += diff;
    gapCount++;
    if (diff < 20000) under20s++;
  }

  const avgGapSec = gapCount > 0 ? (totalGapMs / gapCount / 1000).toFixed(2) : '0';
  const minGapSec = minGapMs === Infinity ? 'N/A' : (minGapMs / 1000).toFixed(2);
  const maxGapSec = (maxGapMs / 1000).toFixed(2);

  console.log(`Total saved page metadata files: ${metas.length}`);
  console.log(`Smallest gap between consecutive requests: ${minGapSec}s`);
  console.log(`Average gap between requests: ${avgGapSec}s`);
  console.log(`Largest gap between requests: ${maxGapSec}s`);
  console.log(`Gaps under 20.0 seconds: ${under20s} (Target: 0)`);

  // 10 Full Examples
  console.log(`\n### 10 Full Examples`);
  const foundExamples = allResults.filter(r => r.status === 'found').slice(0, 7);
  const notFoundExamples = allResults.filter(r => r.status !== 'found').slice(0, 3);
  const tenExamples = [...foundExamples, ...notFoundExamples];

  tenExamples.forEach((ex, i) => {
    console.log(`\nExample ${i + 1}: [${ex.group}] ${ex.name} (${ex.town})`);
    console.log(`- Our Address:     ${ex.street || 'None'}, ${ex.town}`);
    console.log(`- Street Num:      Candidate: "${ex.streetNum || 'N/A'}", Agoda: "${ex.agodaStreetNum || 'N/A'}" (F1: ${ex.f1Check?.pass ? 'PASS' : 'FAIL'})`);
    console.log(`- Agoda Title:     ${ex.agodaTitle || 'N/A'}`);
    console.log(`- Agoda Address:   ${ex.agodaAddress || 'N/A'}`);
    console.log(`- Agoda URL:       ${ex.agodaUrl || 'N/A'}`);
    console.log(`- Status:          ${ex.status}`);
    if (ex.status === 'found') {
      console.log(`- Tub Room Shown:  ${ex.hasTubRoom ? 'YES' : 'NO'}`);
      if (ex.tubRooms?.length > 0) {
        console.log(`- Tub Rooms:`);
        ex.tubRooms.forEach(tr => {
          console.log(`    * "${tr.roomName}": [${tr.tubPhrases.join(', ')}]`);
        });
      }
    }
  });

  // Final summary json write
  const fullOutput = {
    meta: {
      date: new Date().toISOString(),
      script: 'test-agoda-100.mjs',
      totalHotels: sampleList.length,
      mode: isWrite ? 'write' : 'dry-run',
      seeds: { g1: 20261030, g2: 20261031, g3: 20261032 }
    },
    robotsCheck: {
      searchUrl: testSearchUrl,
      allowedUserAgentStar: isSearchAllowedUserAgent !== false,
      allowedGooglebot: isSearchAllowedGooglebot !== false
    },
    summary,
    agreementWithBooking: {
      both: bothCount,
      agodaOnly: agodaOnlyCount,
      bookingOnly: bookingOnlyCount,
      neither: neitherCount
    },
    distinctTubPhrases: Array.from(distinctPhrases).sort(),
    gapStatistics: {
      totalPages: metas.length,
      minGapSec,
      avgGapSec,
      maxGapSec,
      gapsUnder20s: under20s
    },
    examples: tenExamples,
    results: allResults
  };

  fs.writeFileSync(resultsPath, JSON.stringify(fullOutput, null, 2), 'utf-8');
  console.log(`\nFull audit results written to: ${resultsPath}`);
}

main().catch(err => {
  console.error(`\n🚨 Fatal runner error:`, err);
  process.exit(1);
});

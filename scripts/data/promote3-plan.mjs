// scripts/data/promote3-plan.mjs
// PROMOTE3-PREP-B: Strict planning for Agoda hotels promotion.
// READ-ONLY: No database writes and no web requests.

import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { classifyTub } from './lib/tub-words.mjs';

// 1. Load environment from main checkout or current directory
const envCandidates = [
  path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local'),
  path.resolve(process.cwd(), '.env.local')
];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, quiet: true });
    break;
  }
}

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in env');
  process.exit(1);
}

// 2. Import claims checker
const claimsModulePath = path.resolve(process.cwd(), '../hotelswithbathtubs/src/lib/claims.ts');
const { hasClaimPhrase } = await import(claimsModulePath);

// 3. Connect to MongoDB (read-only)
const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 1,
  minPoolSize: 1,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  readPreference: 'secondaryPreferred'
});
await client.connect();
const db = client.db();

console.log('=============================================================');
console.log('>>> PROMOTE3 PLANNER (Agoda Hotels Promotion Preparation — Kit B)');
console.log('Mode: READ-ONLY (No database writes, no network requests)');
console.log('=============================================================\n');

// 4. Verify initial database counts
const countHotelsLive = await db.collection('hotels').countDocuments();
const countUsHotelsLive = await db.collection('hotels').countDocuments({ country: 'USA' });
console.log(`Current live counts: hotels=${countHotelsLive} (USA=${countUsHotelsLive})`);

// 5. Load live hotels for clash & deduplication checks
const liveHotels = await db.collection('hotels').find({}, {
  projection: { slug: 1, name: 1, city: 1, streetAddress: 1 }
}).toArray();

const normalizeText = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

function slugify(name) {
  return (name || '').toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract street number from street line or full address
// Looks only at the street segment (before commas) to prevent grabbing zip codes (e.g. 37738)
function extractStreetNumberFromAddress(addr) {
  if (!addr) return null;
  const streetPart = addr.split(',')[0].trim();
  const m = streetPart.match(/^\s*(\d+[A-Za-z]?)\b/) || streetPart.match(/\b(\d+)\b/);
  return m ? m[1] : null;
}

function getTubType(placement) {
  if (!placement || placement === 'unknown') return '';
  if (placement === 'bathroom') return 'Jetted tub in the bathroom';
  if (placement === 'bedroom') return 'Jetted tub in the bedroom';
  if (placement === 'balcony') return 'Hot tub on the balcony';
  if (placement === 'bedroom bathroom') return 'Jetted tub in the bedroom or bathroom';
  if (placement === 'bedroom balcony') return 'Hot tub on the balcony';
  return '';
}

function cleanHotelUrl(url) {
  if (!url) return '';
  return url.split('?')[0].replace(/\/$/, '');
}

const liveSlugs = new Set(liveHotels.map(h => h.slug));
const liveNameTown = new Set();
const liveStreetTown = new Set();

for (const h of liveHotels) {
  const normN = normalizeText(h.name);
  const normC = normalizeText(h.city);
  liveNameTown.add(`${normN}|${normC}`);

  const strippedCity = (h.city || '').replace(/\s+[A-Za-z]{2}$/, '').trim();
  if (strippedCity && strippedCity !== h.city) {
    liveNameTown.add(`${normN}|${normalizeText(strippedCity)}`);
  }

  if (h.streetAddress) {
    const normS = normalizeText(h.streetAddress);
    liveStreetTown.add(`${normS}|${normC}`);
    if (strippedCity && strippedCity !== h.city) {
      liveStreetTown.add(`${normS}|${normalizeText(strippedCity)}`);
    }
  }
}

// Distinct existing USA cities in live collection
const existingLiveCities = new Set(
  (await db.collection('hotels').distinct('city', { country: 'USA' })).filter(Boolean)
);
const liveCitiesWithSuffix = new Set(
  Array.from(existingLiveCities).filter(c => /\s+[A-Za-z]{2}$/.test(c))
);

// Slugs from public redirects
const redirectsPath = path.resolve(process.cwd(), '../hotelswithbathtubs/scripts/redirects.mjs');
const redirectsContent = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, 'utf8') : '';
const redirectSources = new Set();
const redirectRegex = /source:\s*['"]([^'"]+)['"]/g;
let rm;
while ((rm = redirectRegex.exec(redirectsContent)) !== null) {
  let src = rm[1].replace(/^\/hotel\//, '').replace(/^\//, '').replace(/\/$/, '');
  redirectSources.add(src);
}

// 6. Read agoda1-results.json
const agodaResultsPath = path.resolve(process.cwd(), 'data-collect/private/agoda1-results.json');
if (!fs.existsSync(agodaResultsPath)) {
  console.error(`FATAL: File not found: ${agodaResultsPath}`);
  process.exit(1);
}
const agodaData = JSON.parse(fs.readFileSync(agodaResultsPath, 'utf8'));
const allResults = agodaData.results || [];
console.log(`Loaded ${allResults.length} total collector results from agoda1-results.json\n`);

// 7. Load candidates for metadata lookup
console.log('Fetching hotel_candidates for metadata lookup...');
const candidateDocs = await db.collection('hotel_candidates').find({}, {
  projection: {
    _id: 1,
    name: 1,
    city: 1,
    citySlug: 1,
    state: 1,
    address: 1,
    roomName: 1,
    tubPlacement: 1,
    geo: 1,
    factSource: 1,
    platformChecks: 1
  }
}).toArray();
const candidateMap = new Map(candidateDocs.map(c => [c._id.toString(), c]));
console.log(`Loaded ${candidateMap.size} candidates into memory.\n`);

// 8. Classify all results into Safe vs Hold
const holdByReason = {
  no_street_number: [],
  wrong_hotel_street_mismatch: [],
  wrong_hotel_name_mismatch: [],
  wrong_hotel_other: [],
  not_found: [],
  already_live_name_town: [],
  already_live_street_town: [],
  already_live_slug: [],
  duplicate_in_batch: [],
  missing_agoda_url: [],
  no_photos: []
};

const safeRecords = [];
const seenBatchAgodaUrls = new Set();
const seenBatchCandidateIds = new Set();
const usedSlugs = new Set([...liveSlugs, ...redirectSources]);

// Proof regexes
const tubNameRegex = /\b(bathtub|jacuzzi|whirlpool|hot\s+tub|spa\s+bath|spa\s+tub|jetted\s+tub)\b/i;
const jettedKeywordRegex = /\b(jacuzzi|whirlpool|hot\s+tub|spa\s+bath|spa\s+tub|jetted\s+tub)\b/i;

// First pass on towns to detect cross-state clashes within this batch
const townSlugStates = new Map();
for (const r of allResults) {
  if (r.status !== 'found') continue;
  const cand = candidateMap.get(r.hotelId);
  const town = r.town || cand?.address?.locality || '';
  const state = cand?.address?.region || cand?.state || '';
  const tSlug = slugify(town);
  if (tSlug && state) {
    if (!townSlugStates.has(tSlug)) townSlugStates.set(tSlug, new Set());
    townSlugStates.get(tSlug).add(state);
  }
}

const clashingTownSlugs = new Set();
for (const [s, states] of townSlugStates.entries()) {
  if (states.size > 1) {
    clashingTownSlugs.add(s);
  }
}

// Track proof types for confirmed hotels
const proofTypeCounts = {
  label_whirlpool_bathtub: 0,
  label_bathtub: 0,
  room_name_only: 0
};

// Reclassification tracking for F1-pass hotels (CEO Sheet T48 / promote3-reclassify)
const reclassRows = [];
const reclassStats = {
  f1PassHotels: 0,
  oldProof: 0,
  newProof: 0,
  strength1: 0,
  strength2: 0,
  strength3: 0,
  oldProofNewProof: 0,
  newlyLost: [],
  newlyGained: [],
  oldNoNewNo: 0
};

// Evaluation loop
for (const r of allResults) {
  const cand = candidateMap.get(r.hotelId);
  const candName = r.name || cand?.name || '';
  const candTown = r.town || cand?.address?.locality || '';
  const candStreet = r.street || cand?.address?.street || '';
  const candState = cand?.address?.region || cand?.state || '';
  const agodaUrl = cleanHotelUrl(r.agodaUrl);

  const candStreetNum = extractStreetNumberFromAddress(candStreet);
  const agodaStreetNum = extractStreetNumberFromAddress(r.agodaAddress);

  // Status check: if not found in collector
  if (r.status === 'not_found') {
    holdByReason.not_found.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      street: candStreet,
      reason: r.f1Check?.reason || 'not_found'
    });
    continue;
  }

  // Status check: wrong_hotel (F1 failed)
  if (r.status === 'wrong_hotel' || r.f1Check?.pass === false) {
    let f1Reason = r.f1Check?.reason || 'f1_check_failed';

    // Step 5: Fix street-mismatch reason: when Agoda's address has no street number, use agoda_no_street_number
    if (!agodaStreetNum) {
      f1Reason = 'agoda_no_street_number';
    } else if (f1Reason.startsWith('street_number_mismatch')) {
      f1Reason = `street_number_mismatch_${candStreetNum}_vs_${agodaStreetNum}`;
    }

    const entry = {
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      candStreet,
      agodaAddress: r.agodaAddress || '',
      agodaUrl: r.agodaUrl || '',
      reason: f1Reason
    };

    if (f1Reason.startsWith('street_number_mismatch') || f1Reason === 'agoda_no_street_number') {
      holdByReason.wrong_hotel_street_mismatch.push(entry);
    } else if (f1Reason.startsWith('name_mismatch')) {
      holdByReason.wrong_hotel_name_mismatch.push(entry);
    } else {
      holdByReason.wrong_hotel_other.push(entry);
    }
    continue;
  }

  // F1-pass reclassification tracking (PROMOTE3-RECLASSIFY / CEO Sheet T48)
  const hotelOldProof = (r.rooms || []).some(rm => rm.hasTub);
  let hotelNewProof = false;
  let firstProofRoomName = '';
  let firstProofWords = [];
  let hotelStrength = null;

  const provenRooms = [];
  for (const rm of r.rooms || []) {
    const facs = (rm.tubPhrases || []).filter(p => !p.startsWith('Room Name:'));
    const tRes = classifyTub({ roomName: rm.roomName, facilities: facs });
    if (tRes.isProof) {
      provenRooms.push({
        roomName: rm.roomName,
        words: tRes.words,
        strength: tRes.strength
      });
    }
  }

  if (provenRooms.length > 0) {
    hotelNewProof = true;
    provenRooms.sort((a, b) => a.strength - b.strength);
    firstProofRoomName = provenRooms[0].roomName;
    firstProofWords = provenRooms[0].words;
    hotelStrength = provenRooms[0].strength;
  }

  reclassStats.f1PassHotels++;
  if (hotelOldProof) reclassStats.oldProof++;
  if (hotelNewProof) {
    reclassStats.newProof++;
    if (hotelStrength === 1) reclassStats.strength1++;
    else if (hotelStrength === 2) reclassStats.strength2++;
    else if (hotelStrength === 3) reclassStats.strength3++;
  }

  if (hotelOldProof && hotelNewProof) {
    reclassStats.oldProofNewProof++;
  } else if (hotelOldProof && !hotelNewProof) {
    const allLabels = Array.from(new Set((r.rooms || []).flatMap(rm => rm.tubPhrases || [])));
    reclassStats.newlyLost.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      labels: allLabels
    });
  } else if (!hotelOldProof && hotelNewProof) {
    reclassStats.newlyGained.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      proofRoomName: firstProofRoomName,
      proofWords: firstProofWords,
      strength: hotelStrength
    });
  } else {
    reclassStats.oldNoNewNo++;
  }

  reclassRows.push({
    hotelId: r.hotelId,
    name: candName,
    town: candTown,
    oldProof: hotelOldProof ? 'yes' : 'no',
    newProof: hotelNewProof ? 'yes' : 'no',
    proofRoomName: firstProofRoomName,
    proofWords: firstProofWords.join('; '),
    strength: hotelStrength !== null ? hotelStrength : ''
  });

  // Step 1: Hold if no street number on either side or name_and_town_match_no_street_num
  if (r.f1Check?.reason === 'name_and_town_match_no_street_num' || !candStreetNum || !agodaStreetNum) {
    holdByReason.no_street_number.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      candStreet,
      candStreetNum,
      agodaAddress: r.agodaAddress || '',
      agodaStreetNum,
      agodaUrl: r.agodaUrl || '',
      originalReason: r.f1Check?.reason || 'missing_street_number'
    });
    continue;
  }

  // Must have an Agoda link
  if (!agodaUrl) {
    holdByReason.missing_agoda_url.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      reason: 'missing_agoda_url'
    });
    continue;
  }

  // Check duplicate inside batch
  if (seenBatchCandidateIds.has(r.hotelId) || seenBatchAgodaUrls.has(agodaUrl)) {
    holdByReason.duplicate_in_batch.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      agodaUrl,
      reason: 'duplicate_in_batch'
    });
    continue;
  }

  // Check if already live in hotels collection
  const normName = normalizeText(candName);
  const normTown = normalizeText(candTown);
  const normStreet = normalizeText(candStreet);
  const normTownWithState = normalizeText(`${candTown} ${candState}`);

  if (
    liveNameTown.has(`${normName}|${normTown}`) ||
    (candState && liveNameTown.has(`${normName}|${normTownWithState}`))
  ) {
    holdByReason.already_live_name_town.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      reason: 'already_live_name_and_town'
    });
    continue;
  }

  if (
    normStreet &&
    (liveStreetTown.has(`${normStreet}|${normTown}`) ||
     (candState && liveStreetTown.has(`${normStreet}|${normTownWithState}`)))
  ) {
    holdByReason.already_live_street_town.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      street: candStreet,
      reason: 'already_live_street_and_town'
    });
    continue;
  }

  // Photos check (must have at least 1 photo for site presentation)
  const photos = r.photos || [];
  if (photos.length === 0) {
    holdByReason.no_photos.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      agodaUrl,
      reason: 'no_photos'
    });
    continue;
  }

  // City & Town Name Mapping (T48 / PROMOTE3-NAMES)
  let displayCity = '';
  let citySlug = '';
  const tSlug = slugify(candTown);
  const townWithState = `${candTown} ${candState}`.trim();

  if (liveCitiesWithSuffix.has(townWithState)) {
    // Existing live cities with state suffix in DB (e.g. Newport RI, Columbus OH, Springfield MO)
    displayCity = townWithState;
    citySlug = `${tSlug}-${slugify(candState)}`;
  } else {
    // Plain city name (Augusta, Duluth, Charlotte, Columbia, Albany, Des Moines, etc.)
    displayCity = candTown;
    if (clashingTownSlugs.has(tSlug)) {
      // 2+ states share this town name: keep state in URL slug only (/usa/augusta-ga)
      citySlug = `${tSlug}-${slugify(candState)}`;
    } else {
      citySlug = tSlug;
    }
  }

  // Check if already live with displayCity
  const normDisplayCity = normalizeText(displayCity);
  if (liveNameTown.has(`${normName}|${normDisplayCity}`)) {
    holdByReason.already_live_name_town.push({
      hotelId: r.hotelId,
      name: candName,
      town: displayCity,
      reason: 'already_live_name_and_town'
    });
    continue;
  }
  if (normStreet && liveStreetTown.has(`${normStreet}|${normDisplayCity}`)) {
    holdByReason.already_live_street_town.push({
      hotelId: r.hotelId,
      name: candName,
      town: displayCity,
      street: candStreet,
      reason: 'already_live_street_and_town'
    });
    continue;
  }

  // Slug generation and clash resolution
  const baseSlug = `${slugify(candName)}-${citySlug}`;
  let finalSlug = baseSlug;
  if (usedSlugs.has(finalSlug)) {
    const townSlug = slugify(candTown);
    if (townSlug && townSlug !== citySlug && !baseSlug.includes(townSlug)) {
      finalSlug = `${slugify(candName)}-${townSlug}-${citySlug}`;
    }
    if (usedSlugs.has(finalSlug)) {
      let num = 2;
      while (usedSlugs.has(`${finalSlug}-${num}`)) {
        num++;
      }
      finalSlug = `${finalSlug}-${num}`;
    }
  }

  if (liveSlugs.has(finalSlug)) {
    holdByReason.already_live_slug.push({
      hotelId: r.hotelId,
      name: candName,
      slug: finalSlug,
      reason: 'already_live_slug'
    });
    continue;
  }

  usedSlugs.add(finalSlug);
  seenBatchCandidateIds.add(r.hotelId);
  seenBatchAgodaUrls.add(agodaUrl);

  // STEP 2 & 3: Strict Room Proof Evaluation & Room Selection Hierarchy via shared classifyTub
  const rooms = r.rooms || [];
  const countingRooms = [];

  for (const rm of rooms) {
    const rName = (rm.roomName || '').trim();
    const facs = (rm.tubPhrases || []).filter(p => !p.startsWith('Room Name:'));
    const tubRes = classifyTub({ roomName: rName, facilities: facs });

    if (tubRes.isProof) {
      countingRooms.push({
        roomName: rName,
        countingLabels: tubRes.words,
        words: tubRes.words,
        strength: tubRes.strength,
        mayBeOutdoor: tubRes.mayBeOutdoor
      });
    }
  }

  // Room Selection Hierarchy:
  // Brief Step 3 & Owner grab bar decision (1 Nov 2026):
  // When a hotel has more than one proof room, pick the room with the strongest proof (the lowest number).
  // Break ties by keeping the first room. Save strength in the plan.
  // There is NO roll-in-shower exclusion.
  let chosenRoom = null;
  if (countingRooms.length > 0) {
    // Array.prototype.sort in Node.js (V8) is stable, preserving original room order on ties
    countingRooms.sort((a, b) => a.strength - b.strength);
    chosenRoom = countingRooms[0];
  }

  const isConfirmed = !!chosenRoom;
  let roomType = '';
  let agodaTubLabels = [];
  let tubType = '';
  let amenities = [];
  let description = '';

  if (isConfirmed) {
    roomType = chosenRoom.roomName.split('\n')[0].replace(/\s+/g, ' ').trim();
    agodaTubLabels = chosenRoom.countingLabels;

    // STEP 4: Exact tub word
    const isJetted = chosenRoom.words.some(w => /whirlpool|jacuzzi|hot\s+tub|spa|jetted|hydromassage/i.test(w)) ||
                     /whirlpool|jacuzzi|hot\s+tub|spa\s+bath|spa\s+tub|jetted|hydromassage/i.test(chosenRoom.roomName);
    tubType = isJetted ? 'Jetted tub' : 'Bathtub';
    amenities = ['Bathtub'];

    if (isJetted) {
      description = `${candName} is in ${candTown}, ${candState}. Agoda lists a jetted tub in the ${roomType}.`;
    } else {
      description = `${candName} is in ${candTown}, ${candState}. Agoda lists a bathtub in the ${roomType}.`;
    }

    // Track proof type count
    if (chosenRoom.words.includes('Whirlpool bathtub') || isJetted) {
      proofTypeCounts.label_whirlpool_bathtub++;
    } else if (chosenRoom.words.includes('Bathtub') || chosenRoom.words.includes('Adapted tub') || chosenRoom.words.includes('Accessible tub')) {
      proofTypeCounts.label_bathtub++;
    } else {
      proofTypeCounts.room_name_only++;
    }
  } else {
    // Hotel has no counting room -> reported
    const candRoom = cand?.roomName ? cand.roomName.replace(/\s+/g, ' ').trim() : '';
    roomType = candRoom;
    tubType = getTubType(cand?.tubPlacement);
    amenities = [];
    agodaTubLabels = [];

    if (roomType) {
      description = `${candName} is in ${candTown}, ${candState}. A jetted tub has been reported in the ${roomType}; it isn't confirmed yet, so check the room details on Agoda before you book.`;
    } else {
      description = `${candName} is in ${candTown}, ${candState}. A jetted tub has been reported in some rooms; it isn't confirmed yet, so check the room details on Agoda before you book.`;
    }
  }

  // Validate description for claims integrity
  if (hasClaimPhrase(description)) {
    console.error(`FATAL: Description triggered hasClaimPhrase: "${description}"`);
    process.exit(1);
  }
  if (description.includes('the some')) {
    console.error(`FATAL: Description contains "the some": "${description}"`);
    process.exit(1);
  }

  // Postal code and Coordinates
  const zipMatch = (r.agodaAddress || '').match(/\b(\d{5}(?:-\d{4})?)\b/);
  const postalCode = zipMatch ? zipMatch[1] : (cand?.address?.postalCode || '');

  let lat = (cand?.geo?.lat !== undefined && cand?.geo?.lat !== null) ? parseFloat(cand.geo.lat) : undefined;
  let lng = (cand?.geo?.lng !== undefined && cand?.geo?.lng !== null) ? parseFloat(cand.geo.lng) : undefined;
  if (isNaN(lat)) lat = undefined;
  if (isNaN(lng)) lng = undefined;

  const r2ImageUrl = `https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/${finalSlug}-1.webp`;

  const plannedRecord = {
    name: candName,
    slug: finalSlug,
    city: displayCity,
    citySlug,
    state: candState,
    country: 'USA',
    url: agodaUrl,
    agodaUrl: agodaUrl,
    streetAddress: candStreet,
    postalCode,
    latitude: lat,
    longitude: lng,
    bathtubConfirmed: isConfirmed,
    strength: isConfirmed ? chosenRoom.strength : null,
    roomType,
    tubType,
    amenities,
    description,
    bookingTip: '',
    price: null,
    rating: null,
    reviewsCount: null,
    verified: false,
    crossVerified: false,
    image: r2ImageUrl,
    images: [r2ImageUrl],
    partnerImages: photos,
    importBatch: 'PROMOTE3-2026-10-31',
    factSource: cand?.factSource || { source: 'tubhotels', seenAt: '2026-10-27' },
    platformChecks: cand?.platformChecks || [
      { platform: 'agoda.com', result: 'found', query: r.searchQuery, checkedAt: r.processedAt }
    ],
    agodaFactsSeenAt: r.processedAt || new Date().toISOString(),
    agodaTubLabels,
    _candidateId: r.hotelId,
    _firstPhotoUrl: photos[0],
    _town: candTown,
    _state: candState
  };

  safeRecords.push(plannedRecord);
}

// 9. Summary Statistics
const totalChecked = allResults.length;
const totalSafe = safeRecords.length;
const confirmedSafe = safeRecords.filter(r => r.bathtubConfirmed);
const reportedSafe = safeRecords.filter(r => !r.bathtubConfirmed);

const totalHold = totalChecked - totalSafe;
const holdCounts = {
  no_street_number: holdByReason.no_street_number.length,
  wrong_hotel_street_mismatch: holdByReason.wrong_hotel_street_mismatch.length,
  wrong_hotel_name_mismatch: holdByReason.wrong_hotel_name_mismatch.length,
  wrong_hotel_other: holdByReason.wrong_hotel_other.length,
  not_found: holdByReason.not_found.length,
  already_live_name_town: holdByReason.already_live_name_town.length,
  already_live_street_town: holdByReason.already_live_street_town.length,
  already_live_slug: holdByReason.already_live_slug.length,
  duplicate_in_batch: holdByReason.duplicate_in_batch.length,
  missing_agoda_url: holdByReason.missing_agoda_url.length,
  no_photos: holdByReason.no_photos.length
};

// New towns analysis
const townHotelCounts = {};
for (const r of safeRecords) {
  townHotelCounts[r.city] = (townHotelCounts[r.city] || 0) + 1;
}

const newTowns = Object.keys(townHotelCounts).filter(t => !existingLiveCities.has(t));
const newTownsCounts = {
  totalNewTowns: newTowns.length,
  size1: 0,
  size2to4: 0,
  size5plus: 0
};
for (const t of newTowns) {
  const cnt = townHotelCounts[t];
  if (cnt === 1) newTownsCounts.size1++;
  else if (cnt >= 2 && cnt <= 4) newTownsCounts.size2to4++;
  else newTownsCounts.size5plus++;
}

// 9b. Stages assignment (CEO Sheet T48 / PROMOTE3-NAMES)
const destGroups = new Map();
for (const r of safeRecords) {
  const destKey = r.citySlug;
  if (!destGroups.has(destKey)) destGroups.set(destKey, []);
  destGroups.get(destKey).push(r);
}

let stage1Hotels = 0;
let stage2Hotels = 0;
let holdHotels = 0;
let stage1Cities = 0;
let stage2Cities = 0;
let holdCities = 0;

for (const [destKey, records] of destGroups.entries()) {
  const sample = records[0];
  const hotelsToAdd = records.length;
  // Is it an existing live city?
  const isExistingLive = existingLiveCities.has(sample.city) ||
    liveHotels.some(h => h.country === 'USA' && slugify(h.city) === sample.citySlug);

  let stage = 'hold';
  if (isExistingLive) {
    stage = 'stage 1';
  } else if (hotelsToAdd >= 5) {
    stage = 'stage 1';
  } else if (hotelsToAdd >= 3) {
    stage = 'stage 2';
  } else {
    stage = 'hold';
  }

  if (stage === 'stage 1') {
    stage1Cities++;
    stage1Hotels += hotelsToAdd;
  } else if (stage === 'stage 2') {
    stage2Cities++;
    stage2Hotels += hotelsToAdd;
  } else {
    holdCities++;
    holdHotels += hotelsToAdd;
  }

  for (const r of records) {
    r.stage = stage;
  }
}

// 10. Write promote3-planned.json
const plannedDir = path.resolve(process.cwd(), 'data-collect/private');
if (!fs.existsSync(plannedDir)) fs.mkdirSync(plannedDir, { recursive: true });

const plannedPath = path.join(plannedDir, 'promote3-planned.json');
let oldPlannedCount = 0;
if (fs.existsSync(plannedPath)) {
  try {
    const oldData = JSON.parse(fs.readFileSync(plannedPath, 'utf8'));
    oldPlannedCount = Array.isArray(oldData) ? oldData.length : (oldData.safeHotels?.length || 0);
  } catch {}
}

const sanitizedPlanned = safeRecords.map(r => {
  const copy = { ...r };
  delete copy._firstPhotoUrl;
  delete copy._town;
  delete copy._state;
  return copy;
});
fs.writeFileSync(plannedPath, JSON.stringify(sanitizedPlanned, null, 2), 'utf8');

// 11. Write promote3-reclassify.csv (CEO Sheet T48 / promote3-reclassify)
const reclassCsvPath = path.join(plannedDir, 'promote3-reclassify.csv');
const esc = s => `"${String(s !== null && s !== undefined ? s : '').replace(/"/g, '""')}"`;
const reclassCsvHeader = 'hotel id,name,town,old proof (yes/no),new proof (yes/no),proof room name,proof words,strength\n';
const reclassCsvBody = reclassRows.map(r => [
  esc(r.hotelId),
  esc(r.name),
  esc(r.town),
  esc(r.oldProof),
  esc(r.newProof),
  esc(r.proofRoomName),
  esc(r.proofWords),
  esc(r.strength)
].join(',')).join('\n');
fs.writeFileSync(reclassCsvPath, reclassCsvHeader + reclassCsvBody, 'utf8');

// 12. Write not-found log (Rule 6.5)
const notFoundCsvPath = path.join(plannedDir, 'not-found-agoda.csv');
const notFoundRows = [
  'name,town,state,address,last query,result,date'
];
for (const r of allResults) {
  if (r.status !== 'found') {
    const cand = candidateMap.get(r.hotelId);
    const name = `"${(r.name || '').replace(/"/g, '""')}"`;
    const town = `"${(r.town || '').replace(/"/g, '""')}"`;
    const state = `"${(cand?.address?.region || cand?.state || '').replace(/"/g, '""')}"`;
    const street = `"${(r.street || '').replace(/"/g, '""')}"`;
    const query = `"${(r.searchQuery || '').replace(/"/g, '""')}"`;
    const result = `"${r.status} (${r.f1Check?.reason || ''})"`;
    const date = `"${(r.processedAt || '').slice(0, 10)}"`;
    notFoundRows.push(`${name},${town},${state},${street},${query},${result},${date}`);
  }
}
fs.writeFileSync(notFoundCsvPath, notFoundRows.join('\n'), 'utf8');

// 12. Display Terminal Output
console.log('-------------------------------------------------------------');
console.log('>>> SUMMARY OF PROMOTE3 PLANNING');
console.log('-------------------------------------------------------------');
console.log(`Hotels evaluated in agoda1-results.json: ${totalChecked}`);
console.log(`\nSAFE TO PROMOTE: ${totalSafe}`);
console.log(`  - Confirmed (strict Agoda tub proof):         ${confirmedSafe.length}`);
console.log(`  - Reported, not yet confirmed (source fact):  ${reportedSafe.length}`);
console.log(`\nHOLD (Total: ${totalHold}):`);
console.log(`  - no_street_number:                           ${holdCounts.no_street_number}`);
console.log(`  - wrong_hotel: street mismatch:               ${holdCounts.wrong_hotel_street_mismatch}`);
console.log(`  - wrong_hotel: name mismatch (no street num):  ${holdCounts.wrong_hotel_name_mismatch}`);
console.log(`  - wrong_hotel: other F1 failure:              ${holdCounts.wrong_hotel_other}`);
console.log(`  - not_found in search:                        ${holdCounts.not_found}`);
console.log(`  - already_live in hotels (name + town):       ${holdCounts.already_live_name_town}`);
console.log(`  - already_live in hotels (street + town):     ${holdCounts.already_live_street_town}`);
console.log(`  - already_live in hotels (slug):              ${holdCounts.already_live_slug}`);
console.log(`  - duplicate_in_batch:                         ${holdCounts.duplicate_in_batch}`);
console.log(`  - missing_agoda_url:                          ${holdCounts.missing_agoda_url}`);
console.log(`  - no_photos:                                  ${holdCounts.no_photos}`);

console.log('\n-------------------------------------------------------------');
console.log('>>> CONFIRMED HOTELS BY PROOF TYPE');
console.log('-------------------------------------------------------------');
console.log(`Total confirmed hotels: ${confirmedSafe.length}`);
console.log(`  - Label "Bathtub":            ${proofTypeCounts.label_bathtub}`);
console.log(`  - Label "Whirlpool bathtub":  ${proofTypeCounts.label_whirlpool_bathtub}`);
console.log(`  - Room Name only:             ${proofTypeCounts.room_name_only}`);

console.log('\n-------------------------------------------------------------');
console.log('>>> PROBLEM 1 VERIFICATION (Hotels held for no_street_number)');
console.log('-------------------------------------------------------------');
holdByReason.no_street_number.forEach((h, idx) => {
  console.log(`[${idx + 1}] ${h.name}`);
  console.log(`    Town:            ${h.town}`);
  console.log(`    Our Street:      "${h.candStreet}" (Extracted Num: ${h.candStreetNum || 'null'})`);
  console.log(`    Agoda Address:   "${h.agodaAddress}" (Extracted Num: ${h.agodaStreetNum || 'null'})`);
  console.log(`    Status:          HOLD: no_street_number`);
  console.log(`    Original Reason: ${h.originalReason}`);
});

console.log('\n-------------------------------------------------------------');
console.log('>>> PROBLEM 2 & 3 VERIFICATION (Delta Denver & Amarillo West)');
console.log('-------------------------------------------------------------');
const deltaRecord = safeRecords.find(r => r.name.includes('Delta Hotels Denver Thornton')) ||
  holdByReason.already_live_name_town.find(r => r.name.includes('Delta Hotels Denver Thornton')) ||
  safeRecords.find(r => r.name.toLowerCase().includes('delta hotels denver'));

const amarilloRecord = safeRecords.find(r => r.name.includes('Amarillo West'));

console.log(`Hotel: Delta Hotels Denver Thornton`);
if (deltaRecord) {
  console.log(`  New Status:      ${deltaRecord.bathtubConfirmed ? 'CONFIRMED' : 'REPORTED (not yet confirmed)'}`);
  console.log(`  Chosen Room:     ${deltaRecord.roomType || '(none)'}`);
  console.log(`  agodaTubLabels:  [${(deltaRecord.agodaTubLabels || []).join(', ')}]`);
  console.log(`  Description:     "${deltaRecord.description}"`);
} else {
  console.log(`  (Not found in safe records)`);
}

console.log(`\nHotel: Holiday Inn Express & Suites Amarillo West, an IHG Hotel`);
if (amarilloRecord) {
  console.log(`  New Status:      ${amarilloRecord.bathtubConfirmed ? 'CONFIRMED' : 'REPORTED (not yet confirmed)'}`);
  console.log(`  Chosen Room:     ${amarilloRecord.roomType || '(none)'}`);
  console.log(`  agodaTubLabels:  [${(amarilloRecord.agodaTubLabels || []).join(', ')}]`);
  console.log(`  Description:     "${amarilloRecord.description}"`);
} else {
  console.log(`  (Not found in safe records)`);
}

console.log('\n-------------------------------------------------------------');
console.log('>>> 5 SAMPLE CONFIRMED ROWS WITH LABELS AND DESCRIPTION');
console.log('-------------------------------------------------------------');
const confirmedSampleCount = Math.min(5, confirmedSafe.length);
const cStep = confirmedSafe.length > 0 ? Math.max(1, Math.floor(confirmedSafe.length / confirmedSampleCount)) : 1;
const confirmedIndices = [];
for (let i = 0; i < confirmedSafe.length && confirmedIndices.length < confirmedSampleCount; i += cStep) {
  confirmedIndices.push(i);
}
confirmedIndices.forEach((idx, n) => {
  const r = confirmedSafe[idx];
  console.log(`[${n + 1}] ${r.name}`);
  console.log(`    City/Town:   ${r.city}, USA`);
  console.log(`    Room:        ${r.roomType}`);
  console.log(`    Labels:      [${(r.agodaTubLabels || []).join(', ')}]`);
  console.log(`    Tub Type:    ${r.tubType}`);
  console.log(`    Description: ${r.description}`);
});

console.log('\n-------------------------------------------------------------');
console.log('>>> HOLD: STREET MISMATCH ROWS (Up to 20)');
console.log('-------------------------------------------------------------');
const mismatches = holdByReason.wrong_hotel_street_mismatch.slice(0, 20);
console.log(`Total street mismatch rows: ${holdByReason.wrong_hotel_street_mismatch.length} (showing first ${mismatches.length}):`);
mismatches.forEach((m, idx) => {
  console.log(`[${idx + 1}] ${m.name}`);
  console.log(`    Town:         ${m.town}`);
  console.log(`    Our Street:   ${m.candStreet}`);
  console.log(`    Agoda Street: ${m.agodaAddress}`);
  console.log(`    Agoda URL:    ${m.agodaUrl}`);
  console.log(`    F1 Reason:    ${m.reason}`);
});

const westgateMismatch = holdByReason.wrong_hotel_street_mismatch.find(m => m.name.includes('Westgate'));
if (westgateMismatch) {
  console.log('\n[Verification of Step 5: Westgate Smoky Mountain Resort]');
  console.log(`  Name:         ${westgateMismatch.name}`);
  console.log(`  Town:         ${westgateMismatch.town}`);
  console.log(`  Our Street:   ${westgateMismatch.candStreet}`);
  console.log(`  Agoda Street: ${westgateMismatch.agodaAddress}`);
  console.log(`  F1 Reason:    ${westgateMismatch.reason} (fixed: no longer zip code 37738)`);
}

console.log('\n-------------------------------------------------------------');
console.log('>>> NEW TOWNS ANALYSIS');
console.log('-------------------------------------------------------------');
console.log(`Total new towns in this batch: ${newTownsCounts.totalNewTowns}`);
console.log(`  - 1 hotel (noindex until 2+):  ${newTownsCounts.size1}`);
console.log(`  - 2-4 hotels (indexed):        ${newTownsCounts.size2to4}`);
console.log(`  - 5+ hotels (indexed):         ${newTownsCounts.size5plus}`);
if (newTowns.length > 0) {
  console.log(`New towns list:`);
  newTowns.forEach(t => {
    const cnt = townHotelCounts[t];
    const indexable = cnt >= 2 ? 'INDEXABLE' : 'NOINDEX (<2)';
    console.log(`  - ${t}: ${cnt} hotel(s) [${indexable}]`);
  });
}

console.log('\n=============================================================');
console.log('>>> DOD 2: F1-PASS RECLASSIFICATION TOTALS');
console.log('=============================================================');
console.log(`F1-pass hotels total:             ${reclassStats.f1PassHotels}`);
console.log(`Proven before this task (old):    ${reclassStats.oldProof}`);
console.log(`Proven after this task (new):     ${reclassStats.newProof}`);
console.log(`Hotels at strength 1:             ${reclassStats.strength1}`);
console.log(`Hotels at strength 2:             ${reclassStats.strength2}`);
console.log(`Hotels at strength 3:             ${reclassStats.strength3}`);
console.log(`Total across strengths (1+2+3):   ${reclassStats.strength1 + reclassStats.strength2 + reclassStats.strength3}`);
console.log(`proof old -> new:                 ${reclassStats.oldProofNewProof}`);
console.log(`newly lost:                       ${reclassStats.newlyLost.length}`);
console.log(`newly gained:                     ${reclassStats.newlyGained.length}`);
console.log(`old no -> new no:                 ${reclassStats.oldNoNewNo}`);

console.log('\n=============================================================');
console.log('>>> DOD 3: PLAN ROWS FOR HILTON GARDEN INN & BEST WESTERN SUITES');
console.log('=============================================================');
const hiltonTampa = safeRecords.find(r => r.name.includes('Hilton Garden Inn Tampa East/Brandon')) ||
  safeRecords.find(r => r.name.toLowerCase().includes('hilton garden inn tampa'));
const bwColumbus = safeRecords.find(r => r.name.includes('Best Western Suites Columbus')) ||
  safeRecords.find(r => r.name.toLowerCase().includes('best western suites columbus'));

console.log('Hotel: Hilton Garden Inn Tampa East/Brandon');
if (hiltonTampa) {
  console.log(`  Name:           ${hiltonTampa.name}`);
  console.log(`  City:           ${hiltonTampa.city}, ${hiltonTampa.country}`);
  console.log(`  Status:         ${hiltonTampa.bathtubConfirmed ? 'CONFIRMED' : 'REPORTED'}`);
  console.log(`  Chosen Room:    ${hiltonTampa.roomType}`);
  console.log(`  Strength:       ${hiltonTampa.strength}`);
  console.log(`  Tub Labels:     [${(hiltonTampa.agodaTubLabels || []).join(', ')}]`);
  console.log(`  Tub Type:       ${hiltonTampa.tubType}`);
  console.log(`  Description:    "${hiltonTampa.description}"`);
} else {
  console.log('  (Not found in safeRecords)');
}

console.log('\nHotel: Best Western Suites Columbus');
if (bwColumbus) {
  console.log(`  Name:           ${bwColumbus.name}`);
  console.log(`  City:           ${bwColumbus.city}, ${bwColumbus.country}`);
  console.log(`  Status:         ${bwColumbus.bathtubConfirmed ? 'CONFIRMED' : 'REPORTED'}`);
  console.log(`  Chosen Room:    ${bwColumbus.roomType}`);
  console.log(`  Strength:       ${bwColumbus.strength}`);
  console.log(`  Tub Labels:     [${(bwColumbus.agodaTubLabels || []).join(', ')}]`);
  console.log(`  Tub Type:       ${bwColumbus.tubType}`);
  console.log(`  Description:    "${bwColumbus.description}"`);
} else {
  console.log('  (Not found in safeRecords)');
}

console.log('\n=============================================================');
console.log('>>> DOD 4: PLANNED PROMOTE3 COUNT');
console.log('=============================================================');
console.log(`Old planned count in promote3-planned.json: ${oldPlannedCount}`);
console.log(`New planned count in promote3-planned.json: ${sanitizedPlanned.length}`);
console.log(`  - Confirmed:                              ${confirmedSafe.length}`);
console.log(`  - Reported:                               ${reportedSafe.length}`);

console.log('\n-------------------------------------------------------------');
console.log(`Saved planned records: ${sanitizedPlanned.length} -> ${plannedPath}`);
console.log(`Saved reclassify CSV:  ${reclassRows.length} rows -> ${reclassCsvPath}`);
console.log(`Saved not-found log:   ${notFoundRows.length - 1} lookups -> ${notFoundCsvPath}`);
console.log('-------------------------------------------------------------\n');

console.log('\n=============================================================');
console.log('>>> STAGES SUMMARY (T48 / PROMOTE3-NAMES)');
console.log('=============================================================');
console.log(`Stage 1: ${stage1Hotels} hotels across ${stage1Cities} cities`);
console.log(`Stage 2: ${stage2Hotels} hotels across ${stage2Cities} cities`);
console.log(`Hold:    ${holdHotels} hotels across ${holdCities} cities`);
console.log(`Total:   ${stage1Hotels + stage2Hotels + holdHotels} hotels across ${stage1Cities + stage2Cities + holdCities} cities`);

await client.close();

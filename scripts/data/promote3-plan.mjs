// scripts/data/promote3-plan.mjs
// PROMOTE3-PREP: Plan promotion of Agoda-matched US hotels into the hotels collection.
// READ-ONLY: No database writes and no web requests.

import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

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
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

console.log('=============================================================');
console.log('>>> PROMOTE3 PLANNER (Agoda Hotels Promotion Preparation)');
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

function extractStreetNumber(str) {
  if (!str) return null;
  const m = str.match(/\b(\d+)\b/);
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
const liveNameTown = new Set(liveHotels.map(h => `${normalizeText(h.name)}|${normalizeText(h.city)}`));
const liveStreetTown = new Set(liveHotels.filter(h => h.streetAddress).map(h => `${normalizeText(h.streetAddress)}|${normalizeText(h.city)}`));

// Distinct existing USA cities in live collection
const existingLiveCities = new Set(
  (await db.collection('hotels').distinct('city', { country: 'USA' })).filter(Boolean)
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
const candidateIds = allResults.map(r => {
  try { return new ObjectId(r.hotelId); } catch { return null; }
}).filter(Boolean);

const candidateDocs = await db.collection('hotel_candidates').find({
  _id: { $in: candidateIds }
}).toArray();
const candidateMap = new Map(candidateDocs.map(c => [c._id.toString(), c]));

// 8. Classify all results into Safe vs Hold
const holdByReason = {
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

// Evaluation loop
for (const r of allResults) {
  const cand = candidateMap.get(r.hotelId);
  const candName = r.name || cand?.name || '';
  const candTown = r.town || cand?.address?.locality || '';
  const candStreet = r.street || cand?.address?.street || '';
  const candState = cand?.address?.region || cand?.state || '';
  const agodaUrl = cleanHotelUrl(r.agodaUrl);

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
    const f1Reason = r.f1Check?.reason || 'f1_check_failed';
    const entry = {
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      candStreet,
      agodaAddress: r.agodaAddress || '',
      agodaUrl: r.agodaUrl || '',
      reason: f1Reason
    };
    if (f1Reason.startsWith('street_number_mismatch')) {
      holdByReason.wrong_hotel_street_mismatch.push(entry);
    } else if (f1Reason.startsWith('name_mismatch')) {
      holdByReason.wrong_hotel_name_mismatch.push(entry);
    } else {
      holdByReason.wrong_hotel_other.push(entry);
    }
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

  if (liveNameTown.has(`${normName}|${normTown}`)) {
    holdByReason.already_live_name_town.push({
      hotelId: r.hotelId,
      name: candName,
      town: candTown,
      reason: 'already_live_name_and_town'
    });
    continue;
  }

  if (normStreet && liveStreetTown.has(`${normStreet}|${normTown}`)) {
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

  // City & Town Name Mapping
  let displayCity = '';
  let citySlug = '';
  if (cand?.citySlug) {
    citySlug = cand.citySlug;
    displayCity = candTown || cand.citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  } else {
    const tSlug = slugify(candTown);
    if (clashingTownSlugs.has(tSlug)) {
      displayCity = `${candTown} ${candState}`;
      citySlug = `${tSlug}-${slugify(candState)}`;
    } else {
      displayCity = candTown;
      citySlug = tSlug;
    }
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

  // Tub wording & Confirmation
  const isConfirmed = r.hasTubRoom === true && (r.tubRooms || []).length > 0;
  let roomType = '';
  let tubLabels = [];
  let tubType = '';
  let amenities = [];
  let description = '';

  if (isConfirmed) {
    const firstTubRoom = r.tubRooms[0];
    roomType = (firstTubRoom?.roomName || '').split('\n')[0].replace(/\s+/g, ' ').trim();
    tubLabels = firstTubRoom?.labels || r.tubPhrases || [];

    const roomLower = roomType.toLowerCase();
    const hasJettedInRoom = /(?:jacuzzi|whirlpool|jetted|hot\s+tub|spa\s+tub|spa\s+bath)/i.test(roomLower);
    const hasJettedInLabels = tubLabels.some(l => /(?:jacuzzi|whirlpool|jetted|hot\s+tub|spa\s+tub|spa\s+bath)/i.test(l));
    tubType = (hasJettedInRoom || hasJettedInLabels) ? 'Jetted tub' : 'Bathtub';
    amenities = ['Bathtub'];
    description = `${candName} is in ${candTown}, ${candState}. Agoda lists a bathtub or jetted tub in the ${roomType}.`;
  } else {
    roomType = cand?.roomName ? cand.roomName.replace(/\s+/g, ' ').trim() : '';
    tubType = getTubType(cand?.tubPlacement);
    amenities = [];
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
    country: 'USA',
    url: agodaUrl,
    agodaUrl: agodaUrl,
    streetAddress: candStreet,
    postalCode,
    latitude: lat,
    longitude: lng,
    bathtubConfirmed: isConfirmed,
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
    agodaTubLabels: tubLabels,
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

// 10. Write promote3-planned.json
const plannedDir = path.resolve(process.cwd(), 'data-collect/private');
if (!fs.existsSync(plannedDir)) fs.mkdirSync(plannedDir, { recursive: true });

const plannedPath = path.join(plannedDir, 'promote3-planned.json');
const sanitizedPlanned = safeRecords.map(r => {
  const copy = { ...r };
  delete copy._firstPhotoUrl;
  delete copy._town;
  delete copy._state;
  return copy;
});
fs.writeFileSync(plannedPath, JSON.stringify(sanitizedPlanned, null, 2), 'utf8');

// 11. Write not-found log (Rule 6.5)
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
console.log(`  - Confirmed (Agoda tub room evidence):        ${confirmedSafe.length}`);
console.log(`  - Reported, not yet confirmed (source fact):  ${reportedSafe.length}`);
console.log(`\nHOLD (Total: ${totalHold}):`);
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
console.log(`\n(Note: If owner decides on confirmed-only promotion, the ${reportedSafe.length} unconfirmed hotels would be placed on hold under 'no tub evidence on Agoda'.)`);

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

console.log('\n-------------------------------------------------------------');
console.log('>>> 10 SAMPLE "SAFE" ROWS');
console.log('-------------------------------------------------------------');
const sampleCount = Math.min(10, safeRecords.length);
// Deterministic sample across the array
const step = safeRecords.length > 0 ? Math.max(1, Math.floor(safeRecords.length / sampleCount)) : 1;
const sampleIndices = [];
for (let i = 0; i < safeRecords.length && sampleIndices.length < sampleCount; i += step) {
  sampleIndices.push(i);
}
sampleIndices.forEach((idx, n) => {
  const r = safeRecords[idx];
  console.log(`[${n + 1}] ${r.name}`);
  console.log(`    Slug:       ${r.slug}`);
  console.log(`    City/Town:  ${r.city}, USA`);
  console.log(`    Street:     ${r.streetAddress}`);
  console.log(`    Status:     ${r.bathtubConfirmed ? 'CONFIRMED' : 'REPORTED (unconfirmed)'}`);
  console.log(`    Room:       ${r.roomType || '(none)'}`);
  console.log(`    Tub Type:   ${r.tubType}`);
  console.log(`    Agoda URL:  ${r.agodaUrl}`);
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

console.log('\n-------------------------------------------------------------');
console.log(`Saved planned records: ${sanitizedPlanned.length} -> ${plannedPath}`);
console.log(`Saved not-found log:   ${notFoundRows.length - 1} lookups -> ${notFoundCsvPath}`);
console.log('-------------------------------------------------------------\n');

await client.close();

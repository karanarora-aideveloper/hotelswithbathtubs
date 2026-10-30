// scripts/data/promote2-write.mjs
// PROMOTE2: Put the 529 checked US hotels from LINKS2 into the hotels collection.
// Dry run by default. Use --write to write to database and upload images to R2.

import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const isWrite = process.argv.includes('--write');

// Load environment from main checkout or current directory
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

// Import claims checking from main checkout
const claimsModulePath = path.resolve(process.cwd(), '../hotelswithbathtubs/src/lib/claims.ts');
const { hasClaimPhrase } = await import(claimsModulePath);

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

console.log(`[PROMOTE2] Connected to MongoDB (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);

// 1. Initial count checks - hotels must be 4758, USA must be 850
const countHotelsBefore = await db.collection('hotels').countDocuments();
const countUsHotelsBefore = await db.collection('hotels').countDocuments({ country: 'USA' });
const countCandidatesTotal = await db.collection('hotel_candidates').countDocuments();
console.log(`Before counts: hotels=${countHotelsBefore} (USA=${countUsHotelsBefore}), hotel_candidates=${countCandidatesTotal}`);

if (countHotelsBefore !== 4758) {
  console.error(`FATAL: Expected exactly 4758 hotels before run, found ${countHotelsBefore}`);
  process.exit(1);
}
if (countUsHotelsBefore !== 850) {
  console.error(`FATAL: Expected exactly 850 USA hotels before run, found ${countUsHotelsBefore}`);
  process.exit(1);
}

// 2. Load existing slugs and redirect sources
const existingHotels = await db.collection('hotels').find({}, { projection: { slug: 1 } }).toArray();
const existingSlugs = new Set(existingHotels.map(h => h.slug));

const redirectsPath = path.resolve(process.cwd(), '../hotelswithbathtubs/scripts/redirects.mjs');
const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
const redirectSources = new Set();
const redirectRegex = /source:\s*['"]([^'"]+)['"]/g;
let rm;
while ((rm = redirectRegex.exec(redirectsContent)) !== null) {
  let src = rm[1].replace(/^\/hotel\//, '').replace(/^\//, '').replace(/\/$/, '');
  redirectSources.add(src);
}

// 3. City slug to display city mapping from existing USA hotels
const existingUsHotels = await db.collection('hotels').find({ country: 'USA' }).toArray();
const cityDisplayMap = new Map();
for (const h of existingUsHotels) {
  if (h.city) {
    const slug = h.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!cityDisplayMap.has(slug)) {
      cityDisplayMap.set(slug, h.city);
    }
  }
}

function cleanHotelUrl(url) {
  if (!url) return '';
  return url.split('?')[0].replace(/\/$/, '');
}

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

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
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

// 4. Fetch the 529 candidates approved for PROMOTE2
// Checked during LINKS2 up to 2026-10-30T02:00:00Z
const candidates = await db.collection('hotel_candidates').find({
  status: 'hidden',
  'bookingLinks.0': { $exists: true },
  'platformChecks.platform': 'booking.com',
  'platformChecks.checkedAt': {
    $gte: '2026-10-29',
    $lte: '2026-10-30T02:00:00.000Z'
  }
}).sort({ key: 1 }).toArray();

console.log(`Loaded ${candidates.length} candidates for PROMOTE2 evaluation (Expected: 529).`);
if (candidates.length !== 529) {
  console.error(`FATAL: Expected exactly 529 candidates, found ${candidates.length}`);
  process.exit(1);
}

// 5. Detect clashing town names across multiple states in this batch
const townSlugStates = new Map();
for (const c of candidates) {
  if (c.citySlug) continue;
  const t = c.town || c.address?.locality;
  const s = slugify(t);
  const st = c.state || c.address?.region;
  if (!townSlugStates.has(s)) townSlugStates.set(s, new Set());
  townSlugStates.get(s).add(st);
}

const clashingTownSlugs = new Set();
for (const [s, states] of townSlugStates.entries()) {
  if (states.size > 1) {
    clashingTownSlugs.add(s);
  }
}

const usedSlugs = new Set(existingSlugs);
for (const s of redirectSources) usedSlugs.add(s);

const slugClashList = [];
const skippedWeakMatches = [];
const noPhotosList = [];
const plannedRecords = [];

const townSizeCounts = {};

for (const c of candidates) {
  const cleanUrl = cleanHotelUrl(c.bookingLinks[0].url);

  // Weak match check:
  // "the 21 hotels without a street number were matched on name and town only. Promote one only if its normalised name equals the normalised Booking page title (before the first comma). List the ones you skip."
  const candStreetNum = extractStreetNumber(c.address?.street);
  const isWeak = !candStreetNum || c.bookingFacts?.matchWeak === true;
  if (isWeak) {
    const normCandName = normalizeName(c.name);
    const rawBkTitle = (c.bookingFacts?.pageTitle || '').split(',')[0].trim();
    const normBkTitle = normalizeName(rawBkTitle);
    if (normCandName !== normBkTitle) {
      console.log(`[SKIP] Weak match failed name equality: "${c.name}" vs "${rawBkTitle}"`);
      skippedWeakMatches.push({ name: c.name, bookingTitle: rawBkTitle, candidateId: c._id });
      continue;
    }
  }

  // Photos check
  const photos = c.bookingFacts?.photos || [];
  if (photos.length === 0) {
    console.log(`[P3.4] Hotel with no photos excluded: ${c.name} (${cleanUrl})`);
    noPhotosList.push({ name: c.name, url: cleanUrl, reason: 'no_photos' });
    continue;
  }

  // City & Town Name Mapping
  let displayCity = '';
  let citySlug = '';
  if (c.citySlug) {
    displayCity = cityDisplayMap.get(c.citySlug) || (c.citySlug === 'las-vegas' ? 'Las Vegas' : (c.citySlug === 'asheville' ? 'Asheville' : c.citySlug));
    citySlug = c.citySlug;
  } else {
    const t = c.town || c.address?.locality;
    const s = slugify(t);
    const st = c.state || c.address?.region;
    if (clashingTownSlugs.has(s)) {
      displayCity = `${t} ${st}`;
      citySlug = `${s}-${slugify(st)}`;
    } else {
      displayCity = t;
      citySlug = s;
    }
  }
  townSizeCounts[displayCity] = (townSizeCounts[displayCity] || 0) + 1;

  // Slug generation and clash resolution
  const baseSlug = `${slugify(c.name)}-${citySlug}`;
  let finalSlug = baseSlug;
  let isClash = false;
  if (usedSlugs.has(finalSlug)) {
    isClash = true;
    const townSlug = slugify(c.town || c.address?.locality || '');
    if (townSlug && townSlug !== citySlug && !baseSlug.includes(townSlug)) {
      finalSlug = `${slugify(c.name)}-${townSlug}-${citySlug}`;
    }
    if (usedSlugs.has(finalSlug)) {
      let num = 2;
      while (usedSlugs.has(`${finalSlug}-${num}`)) {
        num++;
      }
      finalSlug = `${finalSlug}-${num}`;
    }
    slugClashList.push({ original: baseSlug, adjusted: finalSlug, name: c.name, candidateId: c._id });
  }
  usedSlugs.add(finalSlug);

  // Address and postalCode
  const streetAddress = c.address?.street || '';
  const zipMatch = c.bookingFacts?.address?.match(/\b(\d{5}(?:-\d{4})?)\b/);
  const postalCode = zipMatch ? zipMatch[1] : (c.address?.postalCode || '');

  // Lat / Lng
  let lat = (c.geo?.lat !== undefined && c.geo?.lat !== null) ? parseFloat(c.geo.lat) : undefined;
  let lng = (c.geo?.lng !== undefined && c.geo?.lng !== null) ? parseFloat(c.geo.lng) : undefined;
  if (isNaN(lat)) lat = undefined;
  if (isNaN(lng)) lng = undefined;
  if (lat === undefined || lng === undefined) {
    if (c.bookingFacts?.lat !== undefined && c.bookingFacts?.lat !== null) {
      const bLat = parseFloat(c.bookingFacts.lat);
      if (!isNaN(bLat)) lat = bLat;
    }
    if (c.bookingFacts?.lng !== undefined && c.bookingFacts?.lng !== null) {
      const bLng = parseFloat(c.bookingFacts.lng);
      if (!isNaN(bLng)) lng = bLng;
    }
  }

  // Bathtub confirmation & roomType
  const isConfirmed = c.roomNameStatus === 'confirmed_booking';
  let roomType = '';
  let labels = [];
  if (isConfirmed) {
    const tr = c.bookingFacts?.tubRooms?.[0];
    roomType = (tr?.roomName || '').split('\n')[0].replace(/\s+/g, ' ').trim();
    labels = tr?.labels || [];
  } else {
    roomType = c.roomName ? c.roomName.replace(/\s+/g, ' ').trim() : '';
  }

  // TubType: Round 9 rule for confirmed, placement plain words for unconfirmed
  let tubType = '';
  if (isConfirmed) {
    const roomNameLower = roomType.toLowerCase();
    const hasJettedInRoomName = /(?:jacuzzi|whirlpool|jetted|hot\s+tub|spa\s+tub)/i.test(roomNameLower);
    const hasJettedInLabels = labels.some(l => /^(?:spa\s+tub|spa\s+bath|hot\s+tub|whirlpool|jacuzzi|jetted)/i.test(l));
    tubType = (hasJettedInRoomName || hasJettedInLabels) ? 'Jetted tub' : 'Bathtub';
  } else {
    tubType = getTubType(c.tubPlacement);
  }

  const amenities = isConfirmed ? ['Bathtub'] : [];

  // Description
  const town = c.town || c.address?.locality || displayCity;
  const state = c.state || c.address?.region || '';
  let description = '';
  if (isConfirmed) {
    description = `${c.name} is in ${town}, ${state}. Booking.com lists a bathtub or jetted tub in the ${roomType}.`;
  } else {
    if (roomType) {
      description = `${c.name} is in ${town}, ${state}. A jetted tub has been reported in the ${roomType}; it isn't confirmed yet, so check the room details on Booking.com before you book.`;
    } else {
      description = `${c.name} is in ${town}, ${state}. A jetted tub has been reported in some rooms; it isn't confirmed yet, so check the room details on Booking.com before you book.`;
    }
  }

  // Claims check
  if (hasClaimPhrase(description)) {
    console.error(`FATAL: Description for "${c.name}" triggered hasClaimPhrase: "${description}"`);
    process.exit(1);
  }
  if (description.includes('the some')) {
    console.error(`FATAL: Description has "the some": "${description}"`);
    process.exit(1);
  }

  // Main R2 Image URL
  const r2ImageUrl = `https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/${finalSlug}-1.webp`;

  const record = {
    name: c.name,
    slug: finalSlug,
    city: displayCity,
    country: 'USA',
    url: cleanUrl,
    bookingUrl: cleanUrl,
    streetAddress,
    postalCode,
    latitude: lat,
    longitude: lng,
    bathtubConfirmed: isConfirmed,
    roomType,
    tubType,
    amenities,
    description,
    bookingTip: '',
    price: undefined,
    rating: undefined,
    reviewsCount: undefined,
    verified: false,
    crossVerified: false,
    image: r2ImageUrl,
    images: [r2ImageUrl],
    partnerImages: photos,
    importBatch: 'PROMOTE2-2026-10-30',
    factSource: c.factSource || 'TubHotels',
    platformChecks: c.platformChecks,
    bookingFactsSeenAt: c.bookingFacts?.fetchedAt || '2026-10-29',
    bookingTubLabels: labels,
    _candidateId: c._id,
    _firstPhotoUrl: photos[0],
  };

  plannedRecords.push(record);
}

const N = plannedRecords.length;
console.log(`\n======================================================`);
console.log(`PROMOTE2 Planning Summary:`);
console.log(`- Total candidates evaluated: ${candidates.length}`);
console.log(`- Skipped weak matches: ${skippedWeakMatches.length}`);
console.log(`- Excluded due to no photos: ${noPhotosList.length}`);
console.log(`- Planned promotions (N): ${N}`);
console.log(`- Slug clashes adjusted: ${slugClashList.length}`);
if (slugClashList.length > 0) {
  console.log(`  Adjusted slugs:`, slugClashList);
}
console.log(`======================================================\n`);

// tubType breakdown
const confirmedRecords = plannedRecords.filter(r => r.bathtubConfirmed);
const unconfirmedRecords = plannedRecords.filter(r => !r.bathtubConfirmed);
const jettedCount = confirmedRecords.filter(r => r.tubType === 'Jetted tub').length;
const bathtubCount = confirmedRecords.filter(r => r.tubType === 'Bathtub').length;

console.log(`TUB TYPE COUNTS (Confirmed hotels, total ${confirmedRecords.length}):`);
console.log(`  Jetted tub: ${jettedCount}`);
console.log(`  Bathtub: ${bathtubCount}`);

console.log(`\n5 CONFIRMED EXAMPLES WITH LABELS:`);
confirmedRecords.slice(0, 5).forEach((r, idx) => {
  console.log(`  [${idx + 1}] Name: ${r.name}`);
  console.log(`      Room: ${r.roomType}`);
  console.log(`      Labels: [${r.bookingTubLabels.join(', ')}]`);
  console.log(`      tubType: ${r.tubType}`);
});

// Town size breakdown
let towns1 = 0;
let towns2to4 = 0;
let towns5plus = 0;
for (const [t, cnt] of Object.entries(townSizeCounts)) {
  if (cnt === 1) towns1++;
  else if (cnt >= 2 && cnt <= 4) towns2to4++;
  else towns5plus++;
}
console.log(`\nTOWN SIZE COUNTS (142 total cities/towns in batch):`);
console.log(`  1 hotel:   ${towns1}`);
console.log(`  2-4 hotels: ${towns2to4}`);
console.log(`  5+ hotels:  ${towns5plus}`);

console.log(`\nTOWN CLASHES:`);
for (const s of clashingTownSlugs) {
  console.log(`  Slug "${s}" shared by states:`, Array.from(townSlugStates.get(s)));
}

// Save planned records
const plannedDir = path.resolve(process.cwd(), 'data-collect/private');
if (!fs.existsSync(plannedDir)) fs.mkdirSync(plannedDir, { recursive: true });
const plannedPath = path.join(plannedDir, 'promote2-planned.json');
const sanitizedRecords = plannedRecords.map(r => {
  const copy = { ...r };
  delete copy._candidateId;
  delete copy._firstPhotoUrl;
  return copy;
});
fs.writeFileSync(plannedPath, JSON.stringify(sanitizedRecords, null, 2), 'utf8');
console.log(`\nSaved ${sanitizedRecords.length} planned records to ${plannedPath}`);

if (!isWrite) {
  console.log(`\n[DRY RUN COMPLETE] To upload images and write ${N} records to database, re-run with --write`);
  await client.close();
  process.exit(0);
}

// ==============================================================
// WRITE MODE EXECUTION
// ==============================================================
console.log(`\nStarting WRITE execution for ${N} hotels...`);

// S3 Client for Cloudflare R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  }
});
const BUCKET = process.env.R2_BUCKET_NAME || 'dreamwave';
const PREFIX = 'hotelswithbathtubs/images/';

console.log(`[P3] Uploading main photos to R2 bucket: ${BUCKET}...`);

async function mapConcurrent(items, concurrency, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

let uploadSuccess = 0;
let uploadErrors = 0;

await mapConcurrent(plannedRecords, 8, async (record, i) => {
  const photoUrl = record._firstPhotoUrl;
  const key = `${PREFIX}${record.slug}-1.webp`;
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching photo from ${photoUrl}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const webpBuf = await sharp(buf).webp({ quality: 80 }).toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: webpBuf,
      ContentType: 'image/webp',
    }));
    uploadSuccess++;
    if (uploadSuccess % 50 === 0 || uploadSuccess === N) {
      console.log(`  Uploaded ${uploadSuccess}/${N} images to R2...`);
    }
  } catch (err) {
    uploadErrors++;
    console.error(`[ERROR] Failed to upload image for ${record.name} (${record.slug}): ${err.message}`);
    throw err;
  }
});

console.log(`[P3] R2 image uploads complete: ${uploadSuccess} succeeded, ${uploadErrors} failed.`);

// Insert into MongoDB hotels collection
console.log(`\n[P4] Inserting ${N} records into hotels collection...`);
const now = new Date();
const docsToInsert = plannedRecords.map(r => {
  const doc = { ...r };
  delete doc._candidateId;
  delete doc._firstPhotoUrl;
  doc.createdAt = now;
  doc.updatedAt = now;
  return doc;
});

const insertResult = await db.collection('hotels').insertMany(docsToInsert);
console.log(`Successfully inserted ${insertResult.insertedCount} hotels into hotels collection.`);
const lastDbWriteTime = new Date().toISOString();
console.log(`LAST DATABASE WRITE TIMESTAMP: ${lastDbWriteTime}`);

// Update candidates in hotel_candidates: status: 'published', hotelId
console.log(`[P4] Updating candidate statuses in hotel_candidates...`);
let candidatesUpdated = 0;
for (let i = 0; i < plannedRecords.length; i++) {
  const candidateId = plannedRecords[i]._candidateId;
  const insertedHotelId = insertResult.insertedIds[i];

  await db.collection('hotel_candidates').updateOne(
    { _id: candidateId },
    {
      $set: {
        status: 'published',
        hotelId: insertedHotelId,
        updatedAt: now,
      }
    }
  );
  candidatesUpdated++;
}
console.log(`Successfully updated ${candidatesUpdated} hotel_candidates to status: 'published'.`);

// Check counts after
const countHotelsAfter = await db.collection('hotels').countDocuments();
const countUsHotelsAfter = await db.collection('hotels').countDocuments({ country: 'USA' });
const countCandidatesPublished = await db.collection('hotel_candidates').countDocuments({ status: 'published' });

console.log(`\n======================================================`);
console.log(`AFTER COUNTS:`);
console.log(`- hotels count before: ${countHotelsBefore} -> after: ${countHotelsAfter} (diff: +${countHotelsAfter - countHotelsBefore})`);
console.log(`- USA hotels count before: ${countUsHotelsBefore} -> after: ${countUsHotelsAfter} (diff: +${countUsHotelsAfter - countUsHotelsBefore})`);
console.log(`- Published candidates: ${countCandidatesPublished}`);
console.log(`- Last DB write: ${lastDbWriteTime}`);
console.log(`======================================================\n`);

await client.close();

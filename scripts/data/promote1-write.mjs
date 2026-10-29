// scripts/data/promote1-write.mjs
// PROMOTE1: Put checked US hotels from hotel_candidates into hotels collection.
// Dry run by default. Use --write to write to database and upload images to R2.

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const isWrite = process.argv.includes('--write');

// Load environment from main checkout
const envPath = path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local');
dotenv.config({ path: envPath, quiet: true });

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

console.log(`[PROMOTE1] Connected to MongoDB (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);

// 1. Initial count checks
const countHotelsBefore = await db.collection('hotels').countDocuments();
const countUsHotelsBefore = await db.collection('hotels').countDocuments({ country: 'USA' });
const countCandidatesTotal = await db.collection('hotel_candidates').countDocuments();
console.log(`Before counts: hotels=${countHotelsBefore} (USA=${countUsHotelsBefore}), hotel_candidates=${countCandidatesTotal}`);

if (countHotelsBefore !== 4470) {
  console.error(`FATAL: Expected exactly 4470 hotels before run, found ${countHotelsBefore}`);
  process.exit(1);
}
if (countUsHotelsBefore !== 562) {
  console.error(`FATAL: Expected exactly 562 USA hotels before run, found ${countUsHotelsBefore}`);
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

// 3. Build citySlug -> display city mapping from existing USA hotels
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

// 4. Index saved pages
const pagesDir = path.resolve(process.cwd(), 'data-collect/pages/booking-links1');
const metaFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.meta.json'));
const urlToGz = new Map();
const keyToGz = new Map();

for (const mf of metaFiles) {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(pagesDir, mf), 'utf8'));
    const base = mf.replace(/\.meta\.json$/, '');
    const gz = path.join(pagesDir, base + '.html.gz');
    if (fs.existsSync(gz)) {
      if (meta.url) {
        urlToGz.set(meta.url.split('?')[0].replace(/\/$/, ''), gz);
      }
      if (meta.key) keyToGz.set(meta.key, gz);
      if (meta.hotelKey) keyToGz.set(meta.hotelKey, gz);
      const fromFile = base.replace(/^(hotel-|hotel-retry-)/, '');
      keyToGz.set(fromFile, gz);
    }
  } catch (e) {}
}

function cleanHotelUrl(url) {
  if (!url) return '';
  return url.split('?')[0].replace(/\/$/, '');
}

function extractPhotos(html) {
  const photos = [];
  const seenIds = new Set();
  const regex = /https:\/\/[a-z0-9.-]*cf\.bstatic\.com\/xdata\/images\/hotel\/[^\s"']+/g;
  const matches = html.match(regex) || [];
  for (let m of matches) {
    const idMatch = m.match(/\/([0-9]+)\.(?:jpg|webp)/i);
    if (!idMatch) continue;
    const imgId = idMatch[1];
    if (seenIds.has(imgId)) continue;
    seenIds.add(imgId);

    let normalized = m.replace(/\/(?:max[0-9]+x[0-9]+|square[0-9]+|thumbnail[0-9]+|max[0-9]+)\//, '/max1024x768/');
    if (!normalized.includes('/max1024x768/')) {
      normalized = normalized.replace(/\/images\/hotel\/([^/]+)\/([0-9]+\.(?:jpg|webp))/, '/images/hotel/max1024x768/$2');
    }
    normalized = normalized.replace(new RegExp(`/${imgId}\\.webp`), `/${imgId}.jpg`);
    photos.push(normalized);
    if (photos.length >= 6) break;
  }
  return photos;
}

function extractCoordinates(html) {
  const latMatch = html.match(/["'](?:b_map_center_latitude|hotel_latitude|latitude)["']\s*[:=]\s*["']?([0-9.-]+)/i) ||
                   html.match(/data-atlas-latlng=["']([0-9.-]+),([0-9.-]+)["']/i);
  const lngMatch = html.match(/["'](?:b_map_center_longitude|hotel_longitude|longitude)["']\s*[:=]\s*["']?([0-9.-]+)/i);

  let lat = latMatch ? parseFloat(latMatch[1]) : undefined;
  let lng = lngMatch ? parseFloat(lngMatch[1]) : (latMatch && latMatch[2] ? parseFloat(latMatch[2]) : undefined);
  if (isNaN(lat)) lat = undefined;
  if (isNaN(lng)) lng = undefined;
  return { lat, lng };
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

// 5. Fetch all candidates with bookingLinks
const candidates = await db.collection('hotel_candidates').find({ 'bookingLinks.0': { $exists: true } }).toArray();
console.log(`Loaded ${candidates.length} candidates with Booking.com links.`);

const usedSlugs = new Set(existingSlugs);
for (const s of redirectSources) usedSlugs.add(s);

const slugClashList = [];
const noPhotosList = [];
const plannedRecords = [];

for (const c of candidates) {
  // Find saved page
  const cleanUrl = cleanHotelUrl(c.bookingLinks[0].url);
  let gzPath = urlToGz.get(cleanUrl);
  if (!gzPath) {
    const key = (c.name + ' ' + (c.address?.locality || c.citySlug) + ' ' + (c.address?.region || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    gzPath = keyToGz.get(key);
  }
  if (!gzPath) {
    const cSlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    for (const [k, p] of keyToGz.entries()) {
      if (k.replace(/[^a-z0-9]+/g, '').includes(cSlug) || cSlug.includes(k.replace(/[^a-z0-9]+/g, ''))) {
        gzPath = p;
        break;
      }
    }
  }

  if (!gzPath || !fs.existsSync(gzPath)) {
    console.warn(`[WARN] No saved page found for ${c.name} (${cleanUrl})`);
    noPhotosList.push({ name: c.name, url: cleanUrl, reason: 'missing_saved_page' });
    continue;
  }

  const html = zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf8');
  const photos = extractPhotos(html);
  if (photos.length === 0) {
    console.log(`[P3.4] Hotel with no photos on saved page excluded: ${c.name} (${cleanUrl})`);
    noPhotosList.push({ name: c.name, url: cleanUrl, reason: 'no_photos_on_page' });
    continue;
  }

  // Slug generation and clash resolution
  const baseSlug = `${slugify(c.name)}-${c.citySlug}`;
  let finalSlug = baseSlug;
  let isClash = false;
  if (usedSlugs.has(finalSlug)) {
    isClash = true;
    const townSlug = slugify(c.address?.locality || '');
    if (townSlug && townSlug !== c.citySlug && !baseSlug.includes(townSlug)) {
      finalSlug = `${slugify(c.name)}-${townSlug}-${c.citySlug}`;
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

  // City display name
  const displayCity = cityDisplayMap.get(c.citySlug);
  if (!displayCity) {
    console.error(`FATAL: citySlug ${c.citySlug} does not map to any existing USA hotel city!`);
    process.exit(1);
  }

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
    const coords = extractCoordinates(html);
    if (coords.lat !== undefined && coords.lng !== undefined) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  // Bathtub confirmation & roomType
  const isConfirmed = c.roomNameStatus === 'confirmed_booking';
  let roomType = '';
  if (isConfirmed) {
    const firstTubRoom = c.bookingFacts?.tubRooms?.[0] || '';
    roomType = firstTubRoom.split('\n')[0].replace(/\s+/g, ' ').trim();
  } else {
    roomType = c.roomName ? c.roomName.replace(/\s+/g, ' ').trim() : '';
  }

  // Tub type & amenities
  const tubType = getTubType(c.tubPlacement);
  const amenities = isConfirmed ? ['Bathtub'] : [];

  // Description
  const town = c.address?.locality || displayCity;
  const state = c.address?.region || '';
  let description = '';
  if (isConfirmed) {
    description = `${c.name} is in ${town}, ${state}. Booking.com lists a bathtub or jetted tub in the ${roomType}.`;
  } else {
    const roomPart = roomType ? roomType : 'some rooms';
    description = `${c.name} is in ${town}, ${state}. A jetted tub has been reported in the ${roomPart}; it isn't confirmed yet, so check the room details on Booking.com before you book.`;
  }

  // Claims validation
  if (hasClaimPhrase(description)) {
    console.error(`FATAL: Description for "${c.name}" triggered hasClaimPhrase: "${description}"`);
    process.exit(1);
  }

  // Image URLs
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
    importBatch: 'PROMOTE1-2026-10-29',
    factSource: c.factSource,
    platformChecks: c.platformChecks,
    bookingFactsSeenAt: c.bookingFacts?.fetchedAt || c.bookingFactsSeenAt || '2026-10-28',
    _candidateId: c._id,
    _firstPhotoUrl: photos[0],
  };

  plannedRecords.push(record);
}

const N = plannedRecords.length;
console.log(`\n======================================================`);
console.log(`PROMOTE1 Summary:`);
console.log(`- Total candidates evaluated: ${candidates.length}`);
console.log(`- Excluded due to no photos: ${noPhotosList.length}`);
if (noPhotosList.length > 0) {
  console.log(`  List:`, noPhotosList);
}
console.log(`- Planned promotions (N): ${N}`);
console.log(`- Slug clashes adjusted: ${slugClashList.length}`);
if (slugClashList.length > 0) {
  console.log(`  Adjusted slugs:`, slugClashList);
}
console.log(`======================================================\n`);

// Print 3 example records:
// 1. One confirmed
const exampleConfirmed = plannedRecords.find(r => r.bathtubConfirmed === true);
// 2. One unconfirmed
const exampleUnconfirmed = plannedRecords.find(r => r.bathtubConfirmed === false);
// 3. One with an adjusted slug
const exampleAdjusted = plannedRecords.find(r => slugClashList.some(sc => sc.adjusted === r.slug)) || plannedRecords[0];

console.log('--- EXAMPLE 1: Confirmed Hotel ---');
console.log({
  name: exampleConfirmed?.name,
  slug: exampleConfirmed?.slug,
  city: exampleConfirmed?.city,
  country: exampleConfirmed?.country,
  bathtubConfirmed: exampleConfirmed?.bathtubConfirmed,
  roomType: exampleConfirmed?.roomType,
  tubType: exampleConfirmed?.tubType,
  amenities: exampleConfirmed?.amenities,
  description: exampleConfirmed?.description,
  bookingUrl: exampleConfirmed?.bookingUrl,
  image: exampleConfirmed?.image,
  partnerImagesCount: exampleConfirmed?.partnerImages?.length
});

console.log('\n--- EXAMPLE 2: Unconfirmed Hotel ---');
console.log({
  name: exampleUnconfirmed?.name,
  slug: exampleUnconfirmed?.slug,
  city: exampleUnconfirmed?.city,
  country: exampleUnconfirmed?.country,
  bathtubConfirmed: exampleUnconfirmed?.bathtubConfirmed,
  roomType: exampleUnconfirmed?.roomType,
  tubType: exampleUnconfirmed?.tubType,
  amenities: exampleUnconfirmed?.amenities,
  description: exampleUnconfirmed?.description,
  bookingUrl: exampleUnconfirmed?.bookingUrl,
  image: exampleUnconfirmed?.image,
  partnerImagesCount: exampleUnconfirmed?.partnerImages?.length
});

console.log('\n--- EXAMPLE 3: Adjusted Slug Hotel ---');
console.log({
  name: exampleAdjusted?.name,
  slug: exampleAdjusted?.slug,
  city: exampleAdjusted?.city,
  country: exampleAdjusted?.country,
  bathtubConfirmed: exampleAdjusted?.bathtubConfirmed,
  roomType: exampleAdjusted?.roomType,
  description: exampleAdjusted?.description,
  bookingUrl: exampleAdjusted?.bookingUrl
});

// Always write planned records to promote1-planned.json
const plannedDir = path.resolve(process.cwd(), 'data-collect/private');
if (!fs.existsSync(plannedDir)) fs.mkdirSync(plannedDir, { recursive: true });
const plannedPath = path.join(plannedDir, 'promote1-planned.json');

// Prepare sanitized records for saving
const sanitizedRecords = plannedRecords.map(r => {
  const copy = { ...r };
  delete copy._candidateId;
  delete copy._firstPhotoUrl;
  return copy;
});
fs.writeFileSync(plannedPath, JSON.stringify(sanitizedRecords, null, 2), 'utf8');
console.log(`\nSaved ${sanitizedRecords.length} planned records to ${plannedPath}`);

if (!isWrite) {
  console.log(`\n[DRY RUN COMPLETE] To upload images and write to database, re-run with --write`);
  await client.close();
  process.exit(0);
}

// ==============================================================
// WRITE MODE EXECUTION
// ==============================================================
console.log(`\nStarting WRITE execution for ${N} hotels...`);

// Initialize S3 Client for Cloudflare R2
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

// Concurrency helper
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
    throw err; // Stop on upload failure to maintain integrity
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
console.log(`======================================================\n`);

await client.close();

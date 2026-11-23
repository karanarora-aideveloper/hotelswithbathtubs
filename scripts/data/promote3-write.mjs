// scripts/data/promote3-write.mjs
// PROMOTE3 Stage 1: Put approved Stage 1 US hotels into the hotels collection.
// Dry run by default. Use --write to write to database.

import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

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

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 1,
  minPoolSize: 1,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  readPreference: 'secondaryPreferred'
});
await client.connect();
const db = client.db();

const BATCH_ID = 'PROMOTE3-2026-11-12';
console.log(`[PROMOTE3 Stage 1] Connected to MongoDB (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);

// 1. Initial count checks - current hotels live count
const countHotelsBefore = await db.collection('hotels').countDocuments();
const countUsHotelsBefore = await db.collection('hotels').countDocuments({ country: 'USA' });
const countCandidatesTotal = await db.collection('hotel_candidates').countDocuments();
console.log(`Before counts: hotels=${countHotelsBefore} (USA=${countUsHotelsBefore}), hotel_candidates=${countCandidatesTotal}`);

// 2. Load planned records from promote3-planned.json and filter to stage 1
const plannedPath = path.resolve(process.cwd(), 'data-collect/private/promote3-planned.json');
if (!fs.existsSync(plannedPath)) {
  console.error(`FATAL: promote3-planned.json not found at ${plannedPath}. Run promote3-plan.mjs first.`);
  process.exit(1);
}

const allPlannedRecords = JSON.parse(fs.readFileSync(plannedPath, 'utf8'));
const stage1Records = allPlannedRecords.filter(r => r.stage === 'stage 1');
const N = stage1Records.length;
console.log(`Loaded ${allPlannedRecords.length} total planned records; filtered to ${N} Stage 1 records`);

if (N < 1050 || N > 1090) {
  console.error(`FATAL: Expected between 1050 and 1090 Stage 1 records, found ${N}. Aborting.`);
  process.exit(1);
}

// 3. Load existing live hotels, slugs, and redirect sources
const liveHotels = await db.collection('hotels').find({}, { projection: { slug: 1, name: 1, city: 1, country: 1 } }).toArray();
const existingSlugs = new Set(liveHotels.map(h => h.slug));
const liveUsHotels = liveHotels.filter(h => h.country === 'USA');
const liveUsCitySet = new Set(liveUsHotels.map(h => h.city).filter(Boolean));
const liveUsCitySlugs = new Map();
for (const c of liveUsCitySet) {
  liveUsCitySlugs.set(slugify(c), c);
}

const redirectsPath = path.resolve(process.cwd(), '../hotelswithbathtubs/scripts/redirects.mjs');
const redirectsContent = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, 'utf8') : '';
const redirectSources = new Set();
const redirectRegex = /source:\s*['"]([^'"]+)['"]/g;
let rm;
while ((rm = redirectRegex.exec(redirectsContent)) !== null) {
  let src = rm[1].replace(/^\/hotel\//, '').replace(/^\//, '').replace(/\/$/, '');
  redirectSources.add(src);
}

// 4. Validate each Stage 1 record before proceeding
let validationErrors = 0;
const usedBatchSlugs = new Set();
const cityMap = new Map();
const R2_PREFIX = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

for (const r of stage1Records) {
  // Check slug uniqueness
  if (existingSlugs.has(r.slug)) {
    console.error(`Validation Error: Slug "${r.slug}" already exists in live hotels collection.`);
    validationErrors++;
  }
  if (redirectSources.has(r.slug)) {
    console.error(`Validation Error: Slug "${r.slug}" clashes with redirect source in redirects.mjs.`);
    validationErrors++;
  }
  if (usedBatchSlugs.has(r.slug)) {
    console.error(`Validation Error: Duplicate slug "${r.slug}" inside batch.`);
    validationErrors++;
  }
  usedBatchSlugs.add(r.slug);

  // Check required fields
  if (!r.name) { console.error('Validation Error: Missing name'); validationErrors++; }
  if (!r.city) { console.error(`Validation Error: Missing city for ${r.name}`); validationErrors++; }
  if (r.country !== 'USA') { console.error(`Validation Error: Country must be USA for ${r.name}`); validationErrors++; }
  if (!r.url || !r.url.startsWith('https://www.agoda.com/')) {
    console.error(`Validation Error: Invalid Agoda url for ${r.name}: ${r.url}`);
    validationErrors++;
  }
  if (!r.agodaUrl || !r.agodaUrl.startsWith('https://www.agoda.com/')) {
    console.error(`Validation Error: Missing or invalid agodaUrl for ${r.name}`);
    validationErrors++;
  }
  // Check no affiliate aid in urls
  if (r.url.includes('aid=') || r.agodaUrl.includes('aid=')) {
    console.error(`Validation Error: URL contains affiliate aid for ${r.name}`);
    validationErrors++;
  }

  // Check R2 image URL
  if (!r.image || !r.image.startsWith(R2_PREFIX) || !r.image.endsWith('-1.webp')) {
    console.error(`Validation Error: Invalid R2 image URL for ${r.name}: ${r.image}`);
    validationErrors++;
  }

  // Check claims on description
  if (hasClaimPhrase(r.description)) {
    console.error(`Validation Error: Description triggered hasClaimPhrase for ${r.name}: "${r.description}"`);
    validationErrors++;
  }
  if (r.description.includes('the some')) {
    console.error(`Validation Error: Description contains "the some" for ${r.name}`);
    validationErrors++;
  }

  // City grouping
  const cKey = r.citySlug || slugify(r.city);
  if (!cityMap.has(cKey)) {
    cityMap.set(cKey, { city: r.city, citySlug: r.citySlug, hotels: [] });
  }
  cityMap.get(cKey).hotels.push(r);
}

// Verify 0 hotels sit on a second page for a live city
let secondPageClashes = 0;
for (const [cKey, data] of cityMap.entries()) {
  const liveMatch = liveUsCitySlugs.get(cKey);
  if (liveMatch && data.city !== liveMatch) {
    console.error(`City Clash Error: Planned city "${data.city}" (slug ${cKey}) clashes with live city "${liveMatch}" under another spelling.`);
    secondPageClashes++;
    validationErrors++;
  }
}

if (validationErrors > 0) {
  console.error(`FATAL: Found ${validationErrors} validation errors in Stage 1 records. Aborting.`);
  process.exit(1);
}

// 5. Summary statistics
const confirmedRecords = stage1Records.filter(r => r.bathtubConfirmed);
const unconfirmedRecords = stage1Records.filter(r => !r.bathtubConfirmed);
const jettedCount = confirmedRecords.filter(r => r.tubType === 'Jetted tub').length;
const bathtubCount = confirmedRecords.filter(r => r.tubType === 'Bathtub').length;

console.log('\n======================================================');
console.log('PROMOTE3 STAGE 1 VALIDATION & SUMMARY:');
console.log(`- Total Stage 1 records to insert (N): ${N}`);
console.log(`  - Confirmed:   ${confirmedRecords.length}`);
console.log(`  - Unconfirmed: ${unconfirmedRecords.length}`);
console.log(`- Slug collisions: 0`);
console.log(`- Validation errors: 0`);
console.log(`- Second page clashes: 0`);
console.log('======================================================\n');

console.log(`TUB TYPE COUNTS (Confirmed hotels, total ${confirmedRecords.length}):`);
console.log(`  Jetted tub: ${jettedCount}`);
console.log(`  Bathtub:    ${bathtubCount}`);

console.log('\n5 SAMPLE STAGE 1 RECORDS:');
stage1Records.slice(0, 5).forEach((r, idx) => {
  console.log(`  [${idx + 1}] Name:        ${r.name}`);
  console.log(`      City:        ${r.city} (${r.state || 'N/A'})`);
  console.log(`      Slug:        ${r.slug}`);
  console.log(`      Room:        ${r.roomType || 'None'}`);
  console.log(`      Tub Type:    ${r.tubType}`);
  console.log(`      Confirmed:   ${r.bathtubConfirmed}`);
  console.log(`      Image:       ${r.image}`);
  console.log(`      URL:         ${r.url}`);
  console.log(`      Description: "${r.description}"`);
});

console.log('\n3 PROVEN DESCRIPTIONS:');
confirmedRecords.slice(0, 3).forEach((r, idx) => {
  console.log(`  [${idx + 1}] ${r.name}: "${r.description}"`);
});

console.log('\n3 REPORTED DESCRIPTIONS:');
unconfirmedRecords.slice(0, 3).forEach((r, idx) => {
  console.log(`  [${idx + 1}] ${r.name}: "${r.description}"`);
});

// Prepare docs for insertion
const nowIso = new Date().toISOString();
const docsToInsert = stage1Records.map(r => {
  const doc = {
    name: r.name,
    slug: r.slug,
    city: r.city,
    country: 'USA',
    url: r.url,
    agodaUrl: r.agodaUrl,
    streetAddress: r.streetAddress || '',
    postalCode: r.postalCode || '',
    latitude: r.latitude,
    longitude: r.longitude,
    bathtubConfirmed: r.bathtubConfirmed === true,
    roomType: r.roomType || '',
    tubType: r.tubType || 'Bathtub',
    amenities: r.amenities || ['Bathtub'],
    description: r.description,
    bookingTip: '',
    verified: false,
    crossVerified: false,
    image: r.image,
    images: Array.isArray(r.images) && r.images.length > 0 ? r.images : [r.image],
    partnerImages: Array.isArray(r.partnerImages) ? r.partnerImages : [],
    importBatch: BATCH_ID,
    factSource: r.factSource || { source: 'tubhotels' },
    platformChecks: r.platformChecks || [],
    agodaFactsSeenAt: r.agodaFactsSeenAt || '2026-10-31',
    agodaTubLabels: r.agodaTubLabels || [],
    bookingTubLabels: r.bathtubConfirmed === true
      ? (r.agodaTubLabels && r.agodaTubLabels.length > 0 ? r.agodaTubLabels : [r.tubType || 'Bathtub'])
      : [],
    createdAt: nowIso,
    updatedAt: nowIso
  };
  return doc;
});

if (!isWrite) {
  console.log('\n------------------------------------------------------');
  console.log(`[DRY RUN COMPLETE]`);
  console.log(`What would be inserted: Exactly ${N} hotel records with importBatch '${BATCH_ID}'.`);
  console.log(`Database writes performed: 0 writes made.`);
  console.log(`Hotels collection count remains: ${countHotelsBefore} (unchanged)`);
  console.log(`To execute database writes, re-run with --write.`);
  console.log('------------------------------------------------------\n');
  await client.close();
  process.exit(0);
}

// ==============================================================
// WRITE MODE EXECUTION (Executed with --write)
// ==============================================================
console.log(`\nStarting WRITE execution for ${N} hotels...`);

console.log(`Inserting ${N} records into 'hotels' collection...`);
const insertResult = await db.collection('hotels').insertMany(docsToInsert);
console.log(`Inserted ${insertResult.insertedCount} hotels into 'hotels' collection.`);

// Update candidates in hotel_candidates
console.log(`Updating candidates in 'hotel_candidates'...`);
let candUpdated = 0;
for (let i = 0; i < stage1Records.length; i++) {
  const r = stage1Records[i];
  const insertedId = insertResult.insertedIds[i];
  if (r._candidateId) {
    await db.collection('hotel_candidates').updateOne(
      { _id: new ObjectId(r._candidateId) },
      {
        $set: {
          status: 'published',
          hotelId: insertedId,
          updatedAt: nowIso
        }
      }
    );
    candUpdated++;
  }
}
console.log(`Updated ${candUpdated} candidates in 'hotel_candidates' to status: 'published'.`);

// Verify final counts
const countHotelsAfter = await db.collection('hotels').countDocuments();
const countUsHotelsAfter = await db.collection('hotels').countDocuments({ country: 'USA' });

console.log('\n======================================================');
console.log('WRITE COMPLETE — FINAL COUNTS:');
console.log(`- hotels total:     ${countHotelsBefore} -> ${countHotelsAfter} (+${countHotelsAfter - countHotelsBefore})`);
console.log(`- USA hotels total: ${countUsHotelsBefore} -> ${countUsHotelsAfter} (+${countUsHotelsAfter - countUsHotelsBefore})`);
console.log('======================================================\n');

await client.close();

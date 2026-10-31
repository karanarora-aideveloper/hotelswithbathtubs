// scripts/data/promote3-write.mjs
// PROMOTE3: Put the checked US hotels from AGODA1 into the hotels collection.
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

console.log(`[PROMOTE3] Connected to MongoDB (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);

// 1. Initial count checks - current hotels live count
const countHotelsBefore = await db.collection('hotels').countDocuments();
const countUsHotelsBefore = await db.collection('hotels').countDocuments({ country: 'USA' });
const countCandidatesTotal = await db.collection('hotel_candidates').countDocuments();
console.log(`Before counts: hotels=${countHotelsBefore} (USA=${countUsHotelsBefore}), hotel_candidates=${countCandidatesTotal}`);

// 2. Load planned records from promote3-planned.json
const plannedPath = path.resolve(process.cwd(), 'data-collect/private/promote3-planned.json');
if (!fs.existsSync(plannedPath)) {
  console.error(`FATAL: promote3-planned.json not found at ${plannedPath}. Run promote3-plan.mjs first.`);
  process.exit(1);
}

const plannedRecords = JSON.parse(fs.readFileSync(plannedPath, 'utf8'));
const N = plannedRecords.length;
console.log(`Loaded ${N} planned records from ${plannedPath}`);

// 3. Load existing slugs and redirect sources
const existingHotels = await db.collection('hotels').find({}, { projection: { slug: 1, name: 1, city: 1 } }).toArray();
const existingSlugs = new Set(existingHotels.map(h => h.slug));

const redirectsPath = path.resolve(process.cwd(), '../hotelswithbathtubs/scripts/redirects.mjs');
const redirectsContent = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, 'utf8') : '';
const redirectSources = new Set();
const redirectRegex = /source:\s*['"]([^'"]+)['"]/g;
let rm;
while ((rm = redirectRegex.exec(redirectsContent)) !== null) {
  let src = rm[1].replace(/^\/hotel\//, '').replace(/^\//, '').replace(/\/$/, '');
  redirectSources.add(src);
}

// 4. Validate each record before proceeding
let validationErrors = 0;
const usedBatchSlugs = new Set();
const townSizeCounts = {};

for (const r of plannedRecords) {
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
    console.error(`Validation Error: Duplicate slug "${r.slug}" inside planned batch.`);
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
  if (!r.agodaUrl) { console.error(`Validation Error: Missing agodaUrl for ${r.name}`); validationErrors++; }
  if (r.importBatch !== 'PROMOTE3-2026-10-31') {
    console.error(`Validation Error: Invalid importBatch "${r.importBatch}" for ${r.name}`);
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

  // Count towns
  townSizeCounts[r.city] = (townSizeCounts[r.city] || 0) + 1;
}

if (validationErrors > 0) {
  console.error(`FATAL: Found ${validationErrors} validation errors in planned records. Aborting.`);
  process.exit(1);
}

// 5. Summary statistics
const confirmedRecords = plannedRecords.filter(r => r.bathtubConfirmed);
const unconfirmedRecords = plannedRecords.filter(r => !r.bathtubConfirmed);
const jettedCount = confirmedRecords.filter(r => r.tubType === 'Jetted tub').length;
const bathtubCount = confirmedRecords.filter(r => r.tubType === 'Bathtub').length;

console.log('\n======================================================');
console.log('PROMOTE3 Planning & Validation Summary:');
console.log(`- Total planned records to insert (N): ${N}`);
console.log(`  - Confirmed:   ${confirmedRecords.length}`);
console.log(`  - Unconfirmed: ${unconfirmedRecords.length}`);
console.log(`- Slug collisions: 0`);
console.log(`- Validation errors: 0`);
console.log('======================================================\n');

console.log(`TUB TYPE COUNTS (Confirmed hotels, total ${confirmedRecords.length}):`);
console.log(`  Jetted tub: ${jettedCount}`);
console.log(`  Bathtub:    ${bathtubCount}`);

console.log('\n5 CONFIRMED EXAMPLES WITH LABELS:');
confirmedRecords.slice(0, 5).forEach((r, idx) => {
  console.log(`  [${idx + 1}] Name:        ${r.name}`);
  console.log(`      Room:        ${r.roomType}`);
  console.log(`      Labels:      [${(r.agodaTubLabels || []).join(', ')}]`);
  console.log(`      tubType:     ${r.tubType}`);
  console.log(`      Description: "${r.description}"`);
});

let towns1 = 0;
let towns2to4 = 0;
let towns5plus = 0;
for (const [t, cnt] of Object.entries(townSizeCounts)) {
  if (cnt === 1) towns1++;
  else if (cnt >= 2 && cnt <= 4) towns2to4++;
  else towns5plus++;
}
console.log(`\nTOWN SIZE BREAKDOWN (${Object.keys(townSizeCounts).length} total cities/towns in batch):`);
console.log(`  1 hotel:   ${towns1}`);
console.log(`  2-4 hotels: ${towns2to4}`);
console.log(`  5+ hotels:  ${towns5plus}`);

if (!isWrite) {
  console.log('\n------------------------------------------------------');
  console.log(`[DRY RUN COMPLETE]`);
  console.log(`What would be inserted: Exactly ${N} hotel records with importBatch 'PROMOTE3-2026-10-31'.`);
  console.log(`Database writes performed: 0 writes made.`);
  console.log(`R2 image uploads performed: 0 uploads made.`);
  console.log(`Hotels collection count remains: ${countHotelsBefore} (unchanged)`);
  console.log(`To execute database writes and image uploads, re-run with --write.`);
  console.log('------------------------------------------------------\n');
  await client.close();
  process.exit(0);
}

// ==============================================================
// WRITE MODE EXECUTION (Executed only when owner approves with --write)
// ==============================================================
console.log(`\nStarting WRITE execution for ${N} hotels...`);

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
  const photoUrl = record.partnerImages?.[0];
  const key = `${PREFIX}${record.slug}-1.webp`;
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const webpBuffer = await sharp(buf).webp({ quality: 80 }).toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable'
    }));
    uploadSuccess++;
  } catch (err) {
    uploadErrors++;
    console.error(`Error uploading image for ${record.name} (${record.slug}):`, err.message);
  }
});

console.log(`R2 uploads complete: ${uploadSuccess} succeeded, ${uploadErrors} failed.`);

// Insert into hotels collection
console.log(`Inserting ${N} records into 'hotels' collection...`);
const nowIso = new Date().toISOString();
const docsToInsert = plannedRecords.map(r => {
  const copy = { ...r };
  delete copy._candidateId;
  copy.createdAt = nowIso;
  copy.updatedAt = nowIso;
  return copy;
});

const insertResult = await db.collection('hotels').insertMany(docsToInsert);
console.log(`Inserted ${insertResult.insertedCount} hotels into 'hotels' collection.`);

// Update candidates in hotel_candidates
console.log(`Updating candidates in 'hotel_candidates'...`);
let candUpdated = 0;
for (let i = 0; i < plannedRecords.length; i++) {
  const r = plannedRecords[i];
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

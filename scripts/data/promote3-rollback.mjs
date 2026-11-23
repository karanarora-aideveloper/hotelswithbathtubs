// scripts/data/promote3-rollback.mjs
// Rollback script for PROMOTE3-2026-11-12.
// Dry run by default. Use --write to delete promoted hotels and revert candidate statuses.

import path from 'path';
import fs from 'fs';
import { MongoClient } from 'mongodb';
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
console.log(`[PROMOTE3 Rollback] Connected to MongoDB (Mode: ${isWrite ? 'WRITE (ROLLBACK)' : 'DRY RUN'})`);

const countHotelsBefore = await db.collection('hotels').countDocuments();
const countUsBefore = await db.collection('hotels').countDocuments({ country: 'USA' });

// Find hotels with importBatch: 'PROMOTE3-2026-11-12'
const batchHotels = await db.collection('hotels').find({ importBatch: BATCH_ID }).toArray();
const N = batchHotels.length;

console.log(`\nFound ${N} hotels with importBatch: '${BATCH_ID}'`);
console.log(`Current hotels total: ${countHotelsBefore} (USA: ${countUsBefore})`);

if (N === 0) {
  console.log(`\nNo records found with importBatch: '${BATCH_ID}'. Nothing to roll back.`);
  await client.close();
  process.exit(0);
}

console.log(`\nSample of records to roll back (first 10 of ${N}):`);
batchHotels.slice(0, 10).forEach((h, i) => {
  console.log(`  [${i + 1}/${N}] ${h.slug} | ${h.name} | ${h.city}, ${h.country} | confirmed: ${h.bathtubConfirmed}`);
});

if (!isWrite) {
  console.log(`\n[DRY RUN COMPLETE] Exactly ${N} records would be deleted from 'hotels'.`);
  console.log(`Corresponding candidates in 'hotel_candidates' would be reverted to status: 'hidden' and hotelId unset.`);
  console.log(`To execute rollback, re-run with --write`);
  await client.close();
  process.exit(0);
}

// WRITE MODE: Execute rollback
console.log(`\nExecuting rollback of ${N} records...`);

const hotelIds = batchHotels.map(h => h._id);

// 1. Delete from hotels
const deleteResult = await db.collection('hotels').deleteMany({ importBatch: BATCH_ID });
console.log(`Deleted ${deleteResult.deletedCount} hotels from 'hotels' collection.`);

// 2. Revert candidates in hotel_candidates
const candidateUpdateResult = await db.collection('hotel_candidates').updateMany(
  { hotelId: { $in: hotelIds } },
  {
    $set: { status: 'hidden' },
    $unset: { hotelId: '' }
  }
);
console.log(`Reverted ${candidateUpdateResult.modifiedCount} candidates in 'hotel_candidates' to status: 'hidden'.`);

// 3. Print counts after
const countHotelsAfter = await db.collection('hotels').countDocuments();
const countUsAfter = await db.collection('hotels').countDocuments({ country: 'USA' });

console.log(`\n======================================================`);
console.log(`ROLLBACK COUNTS:`);
console.log(`- hotels: ${countHotelsBefore} -> ${countHotelsAfter} (diff: -${countHotelsBefore - countHotelsAfter})`);
console.log(`- USA hotels: ${countUsBefore} -> ${countUsAfter} (diff: -${countUsBefore - countUsAfter})`);
console.log(`======================================================\n`);

await client.close();
